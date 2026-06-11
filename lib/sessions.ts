import { mkdir } from "fs/promises";
import path from "path";
import { cleanupOldVideos } from "./cleanupVideos";
import { recordWalkthrough } from "./recorder";
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
};

const sessions = new Map<string, Session>();

export function getSession(id: string): Session | undefined {
  return sessions.get(id);
}

export async function startSession(options: {
  pages: string[];
  scroll: ScrollConfig;
  viewport?: Viewport;
  baseDir: string;
}): Promise<Session> {
  await cleanupOldVideos(options.baseDir);

  const id = crypto.randomUUID();
  const outputDir = path.join(options.baseDir, id);
  await mkdir(outputDir, { recursive: true });

  const abortController = new AbortController();
  const session: Session = {
    id,
    status: "recording",
    abortController,
  };

  sessions.set(id, session);

  recordWalkthrough({
    pages: options.pages,
    scroll: options.scroll,
    viewport: options.viewport ?? DEFAULT_VIEWPORT,
    outputDir,
    headless: false,
    signal: abortController.signal,
  })
    .then((videoPath) => {
      session.status = abortController.signal.aborted ? "stopped" : "done";
      session.videoPath = videoPath;
    })
    .catch((error: Error) => {
      session.status = abortController.signal.aborted ? "stopped" : "error";
      session.error = error.message;
    });

  return session;
}

export function stopSession(id: string): Session | undefined {
  const session = sessions.get(id);
  if (!session || session.status !== "recording") return session;

  session.abortController.abort();
  return session;
}
