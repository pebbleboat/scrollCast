import { mkdir } from "fs/promises";
import path from "path";
import { isRemote } from "./browser";
import { cleanupOldVideos } from "./cleanupVideos";
import { recordWalkthrough } from "./recorder";
import { getSessionsBaseDir, persistSession } from "./sessionStore";
import {
  registerActiveSession,
  unregisterActiveSession,
  type Session,
} from "./sessions";
import {
  DEFAULT_VIEWPORT,
  type ScrollConfig,
  type Viewport,
} from "./types";

export async function startRecording(options: {
  pages: string[];
  scroll: ScrollConfig;
  viewport?: Viewport;
  baseDir?: string;
}): Promise<Session> {
  const baseDir = options.baseDir ?? getSessionsBaseDir();
  await cleanupOldVideos(baseDir);

  const id = crypto.randomUUID();
  const outputDir = path.join(baseDir, id);
  await mkdir(outputDir, { recursive: true });

  const abortController = new AbortController();
  const session: Session = {
    id,
    status: "recording",
  };

  await persistSession(session);

  const recording = recordWalkthrough({
    pages: options.pages,
    scroll: options.scroll,
    viewport: options.viewport ?? DEFAULT_VIEWPORT,
    outputDir,
    headless: isRemote(),
    signal: abortController.signal,
  })
    .then(async (videoPath) => {
      session.status = abortController.signal.aborted ? "stopped" : "done";
      session.videoPath = videoPath;
      await persistSession(session);
    })
    .catch(async (error: Error) => {
      session.status = abortController.signal.aborted ? "stopped" : "error";
      session.error = error.message;
      await persistSession(session);
    })
    .finally(() => {
      unregisterActiveSession(id);
    });

  const completion = recording.then(() => undefined);
  registerActiveSession(id, session, abortController, completion);

  if (isRemote()) {
    await completion;
  }

  return session;
}
