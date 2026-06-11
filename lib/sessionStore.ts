import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { SessionStatus } from "./sessions";

export type StoredSession = {
  id: string;
  status: SessionStatus;
  videoPath?: string;
  videoUrl?: string;
  error?: string;
};

export function getSessionsBaseDir(): string {
  if (process.env.VERCEL) {
    return path.join("/tmp", "scrollcast", "sessions");
  }

  return path.resolve(process.cwd(), "videos", "sessions");
}

export function getSessionDir(id: string): string {
  return path.join(getSessionsBaseDir(), id);
}

export async function persistSession(session: StoredSession): Promise<void> {
  const sessionDir = getSessionDir(session.id);
  await mkdir(sessionDir, { recursive: true });
  await writeFile(
    path.join(sessionDir, "session.json"),
    JSON.stringify(session),
    "utf-8"
  );
}

export async function loadStoredSession(
  id: string
): Promise<StoredSession | null> {
  try {
    const raw = await readFile(
      path.join(getSessionDir(id), "session.json"),
      "utf-8"
    );
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}
