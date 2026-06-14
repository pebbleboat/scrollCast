import type { Page } from "playwright";

type ContinuousScrollOptions = {
  pixelsPerStep?: number;
  intervalMs?: number;
  maxDurationMs?: number;
};

const DEFAULT_MAX_SCROLL_MS = 90_000;

export async function continuousScroll(
  page: Page,
  options: ContinuousScrollOptions = {}
): Promise<void> {
  const {
    pixelsPerStep = 12,
    intervalMs = 8,
    maxDurationMs = DEFAULT_MAX_SCROLL_MS,
  } = options;

  await page.evaluate(
    async ({ pixelsPerStep, intervalMs, maxDurationMs }) => {
      await new Promise<void>((resolve) => {
        const startedAt = Date.now();
        let lastScrollY = -1;
        let stuckSteps = 0;

        const timer = setInterval(() => {
          window.scrollBy(0, pixelsPerStep);

          const scrollY = window.scrollY;
          const scrollHeight = document.documentElement.scrollHeight;
          const bottomReached =
            window.innerHeight + scrollY >= scrollHeight - 5;

          if (scrollY === lastScrollY) {
            stuckSteps += 1;
          } else {
            stuckSteps = 0;
            lastScrollY = scrollY;
          }

          const timedOut = Date.now() - startedAt >= maxDurationMs;
          const stuckAtBottom = bottomReached && stuckSteps >= 8;

          if (bottomReached || timedOut || stuckAtBottom) {
            clearInterval(timer);
            resolve();
          }
        }, intervalMs);
      });
    },
    { pixelsPerStep, intervalMs, maxDurationMs }
  );
}
