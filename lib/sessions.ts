import { mkdir } from "fs/promises";
import path from "path";
import { isServerless } from "./browser";
import { cleanupOldVideos } from "./cleanupVideos";
import { recordWalkthrough } from "./recorder";
import {
  getSessionsBaseDir,
  loadStoredSession,
  persistSession,
} from "./sessionStore";
import {
  DEFAULT_VIEWPORT,
  type ScrollConfig,
  type Viewport,
} from "./types";

export type SessionStatus = "recording" | "done" | "stopped" | "error";

export type Session = {
  id: string;
  status: SessionStatus;
  videoPath?: string;
  error?: string;
  abortController: AbortController;
  completion: Promise<void>;
};

const sessions = new Map<string, Session>();

export async function getSession(id: string): Promise<Session | undefined> {
  const inMemory = sessions.get(id);
  if (inMemory) return inMemory;

  const stored = await loadStoredSession(id);
  if (!stored) return undefined;

  return {
    id: stored.id,
    status: stored.status,
    videoPath: stored.videoPath,
    error: stored.error,
    abortController: new AbortController(),
    completion: Promise.resolve(),
  };
}

async function syncSessionToDisk(session: Session): Promise<void> {
  await persistSession({
    id: session.id,
    status: session.status,
    videoPath: session.videoPath,
    error: session.error,
  });
}

export async function startSession(options: {
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
    abortController,
    completion: Promise.resolve(),
  };

  sessions.set(id, session);
  await syncSessionToDisk(session);

  const recording = recordWalkthrough({
    pages: options.pages,
    scroll: options.scroll,
    viewport: options.viewport ?? DEFAULT_VIEWPORT,
    outputDir,
    headless: isServerless() ? true : false,
    signal: abortController.signal,
  })
    .then(async (videoPath) => {
      session.status = abortController.signal.aborted ? "stopped" : "done";
      session.videoPath = videoPath;
      await syncSessionToDisk(session);
    })
    .catch(async (error: Error) => {
      session.status = abortController.signal.aborted ? "stopped" : "error";
      session.error = error.message;
      await syncSessionToDisk(session);
    });

  session.completion = recording.then(() => undefined);

  if (isServerless()) {
    await session.completion;
  }

  return session;
}

export async function stopSession(id: string): Promise<Session | undefined> {
  const session = await getSession(id);
  if (!session || session.status !== "recording") return session;

  session.abortController.abort();
  await session.completion;
  await syncSessionToDisk(session);
  return session;
}
