import {
  loadStoredSession,
} from "./sessionStore";

export type SessionStatus = "recording" | "done" | "stopped" | "error";

export type Session = {
  id: string;
  status: SessionStatus;
  videoPath?: string;
  videoUrl?: string;
  truncated?: boolean;
  error?: string;
};

type ActiveSession = {
  abortController: AbortController;
  completion: Promise<void>;
};

const activeSessions = new Map<string, ActiveSession>();

export function registerActiveSession(
  id: string,
  abortController: AbortController,
  completion: Promise<void>
): void {
  activeSessions.set(id, { abortController, completion });
}

export async function getSession(id: string): Promise<Session | undefined> {
  const stored = await loadStoredSession(id);
  if (!stored) return undefined;

  return {
    id: stored.id,
    status: stored.status,
    videoPath: stored.videoPath,
    videoUrl: stored.videoUrl,
    truncated: stored.truncated,
    error: stored.error,
  };
}

export async function stopSession(id: string): Promise<Session | undefined> {
  const active = activeSessions.get(id);
  if (active) {
    active.abortController.abort();
    await active.completion;
    activeSessions.delete(id);
  }

  return getSession(id);
}
