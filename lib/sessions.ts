import { loadStoredSession } from "./sessionStore";

export type SessionStatus = "recording" | "done" | "stopped" | "error";

export type Session = {
  id: string;
  status: SessionStatus;
  videoPath?: string;
  error?: string;
};

type ActiveSession = {
  session: Session;
  abortController: AbortController;
  completion: Promise<void>;
};

const activeSessions = new Map<string, ActiveSession>();

export function registerActiveSession(
  id: string,
  session: Session,
  abortController: AbortController,
  completion: Promise<void>
): void {
  activeSessions.set(id, { session, abortController, completion });
}

export function unregisterActiveSession(id: string): void {
  activeSessions.delete(id);
}

export async function getSession(id: string): Promise<Session | undefined> {
  const active = activeSessions.get(id);
  if (active) {
    return { ...active.session };
  }

  const stored = await loadStoredSession(id);
  if (!stored) return undefined;

  return {
    id: stored.id,
    status: stored.status,
    videoPath: stored.videoPath,
    error: stored.error,
  };
}

export async function stopSession(id: string): Promise<Session | undefined> {
  const active = activeSessions.get(id);
  if (active) {
    active.abortController.abort();
    await Promise.race([
      active.completion,
      new Promise((resolve) => setTimeout(resolve, 15_000)),
    ]);
    activeSessions.delete(id);
  }

  return getSession(id);
}
