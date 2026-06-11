import { mkdir } from "fs/promises";
import path from "path";
import { isServerless } from "./browser";
import { cleanupOldVideos } from "./cleanupVideos";
import { recordWalkthrough } from "./recorder";
import {
  getSessionsBaseDir,
  persistSession,
} from "./sessionStore";
import {
  registerActiveSession,
  type Session,
} from "./sessions";
import {
  DEFAULT_VIEWPORT,
  type ScrollConfig,
  type Viewport,
} from "./types";

// On serverless the platform hard-kills the function at its maxDuration. Stop
// recording early enough to leave room for finalizing the video (ffmpeg flush
// on context.close()) and uploading it before that kill. Anything captured up
// to this point is kept and returned as a truncated recording.
// Keep well under the 60s Hobby cap: this budget is consumed by Chromium
// cold-start/decompress and scrolling, and must leave headroom for the ffmpeg
// flush on context.close() plus the Blob upload that follow it.
const SERVERLESS_RECORDING_BUDGET_MS = Number(
  process.env.RECORDING_BUDGET_MS ?? 32_000
);

export async function startRecording(options: {
  pages: string[];
  scroll: ScrollConfig;
  viewport?: Viewport;
  baseDir?: string;
}): Promise<Session> {
  const baseDir = options.baseDir ?? getSessionsBaseDir();
  await cleanupOldVideos(baseDir);

  if (isServerless()) {
    const { cleanupOldBlobRecordings } = await import("./cleanupBlobRecordings");
    await cleanupOldBlobRecordings();
  }

  const id = crypto.randomUUID();
  const outputDir = path.join(baseDir, id);
  await mkdir(outputDir, { recursive: true });

  const abortController = new AbortController();
  const session: Session = {
    id,
    status: "recording",
  };

  await persistSession(session);

  let truncated = false;
  let budgetTimer: ReturnType<typeof setTimeout> | undefined;

  if (isServerless()) {
    budgetTimer = setTimeout(() => {
      truncated = true;
      abortController.abort();
    }, SERVERLESS_RECORDING_BUDGET_MS);
  }

  const recording = recordWalkthrough({
    pages: options.pages,
    scroll: options.scroll,
    viewport: options.viewport ?? DEFAULT_VIEWPORT,
    outputDir,
    headless: isServerless(),
    signal: abortController.signal,
  })
    .then(async (videoPath) => {
      const wasAborted = abortController.signal.aborted;
      session.status = wasAborted && !truncated ? "stopped" : "done";
      session.truncated = truncated;
      session.videoPath = videoPath;

      if (isServerless() && videoPath) {
        const { uploadRecording } = await import("./uploadRecording");
        session.videoUrl = await uploadRecording(id, videoPath);
      }

      await persistSession(session);
    })
    .catch(async (error: Error) => {
      session.status =
        abortController.signal.aborted && !truncated ? "stopped" : "error";
      session.error = truncated
        ? "Recording hit the time limit before any video could be captured. Try fewer or shorter pages."
        : error.message;
      await persistSession(session);
    })
    .finally(() => {
      if (budgetTimer) clearTimeout(budgetTimer);
    });

  const completion = recording.then(() => undefined);
  registerActiveSession(id, abortController, completion);

  if (isServerless()) {
    await completion;
  }

  return session;
}



