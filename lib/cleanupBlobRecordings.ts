import { del, list } from "@vercel/blob";

const RECORDINGS_PREFIX = "recordings/";

const DEFAULT_MAX_AGE_MS = Number(
  process.env.BLOB_MAX_AGE_MS ?? 60 * 60 * 1000
);

export async function cleanupOldBlobRecordings(
  maxAgeMs = DEFAULT_MAX_AGE_MS
): Promise<void> {
  const cutoff = Date.now() - maxAgeMs;
  let cursor: string | undefined;

  try {
    do {
      const page = await list({
        prefix: RECORDINGS_PREFIX,
        cursor,
      });

      const stale = page.blobs.filter(
        (blob) => blob.uploadedAt.getTime() <= cutoff
      );

      if (stale.length > 0) {
        await del(stale.map((blob) => blob.url));
      }

      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
  } catch {
    // Blob cleanup is best-effort; don't block new recordings.
  }
}
