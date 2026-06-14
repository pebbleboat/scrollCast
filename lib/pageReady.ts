import type { Page } from "playwright";

const MIN_HEIGHT_RATIO = 1.25;
const DEFAULT_READY_TIMEOUT_MS = 25_000;
const NETWORK_IDLE_TIMEOUT_MS = 8_000;

/** Wait until the page has enough content to scroll (avoids recording a loading hero). */
export async function waitForPageReady(
  page: Page,
  timeoutMs = DEFAULT_READY_TIMEOUT_MS
): Promise<void> {
  await page
    .waitForFunction(
      ({ minHeightRatio }) => {
        const scrollHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        const ready = document.readyState === "complete";
        const hasContent = scrollHeight > viewportHeight * minHeightRatio;
        return ready && hasContent;
      },
      { minHeightRatio: MIN_HEIGHT_RATIO },
      { timeout: timeoutMs }
    )
    .catch(() => {
      console.warn("[record] page-ready timeout — scrolling with current content");
    });

  await page
    .waitForLoadState("networkidle", { timeout: NETWORK_IDLE_TIMEOUT_MS })
    .catch(() => {});
}
