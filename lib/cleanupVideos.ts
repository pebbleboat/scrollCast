import { readdir, rm, stat } from "fs/promises";
import path from "path";

const ONE_DAY_MS = 2 * 60 * 60 * 1000;

async function removeIfOlderThan(
  targetPath: string,
  maxAgeMs: number,
  now: number
): Promise<void> {
  const { mtimeMs } = await stat(targetPath);
  if (now - mtimeMs <= maxAgeMs) return;

  await rm(targetPath, { recursive: true, force: true });
}

export async function cleanupOldVideos(
  sessionsDir: string,
  maxAgeMs = ONE_DAY_MS
): Promise<void> {
  const now = Date.now();

  try {
    const entries = await readdir(sessionsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const sessionDir = path.join(sessionsDir, entry.name);

      try {
        const files = await readdir(sessionDir);
        const video = files.find((file) => file.endsWith(".webm"));
        const target = video ? path.join(sessionDir, video) : sessionDir;

        await removeIfOlderThan(target, maxAgeMs, now);
      } catch {
        // skip folders we can't read or delete
      }
    }
  } catch {
    // sessions directory may not exist yet
  }

  // clean CLI walkthrough videos saved directly under videos/
  const videosDir = path.dirname(sessionsDir);

  try {
    const entries = await readdir(videosDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".webm")) continue;

      try {
        await removeIfOlderThan(path.join(videosDir, entry.name), maxAgeMs, now);
      } catch {
        // skip files we can't stat or delete
      }
    }
  } catch {
    // videos directory may not exist yet
  }
}
