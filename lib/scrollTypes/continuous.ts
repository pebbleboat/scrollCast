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
    intervalMs = 12,
    maxDurationMs = DEFAULT_MAX_SCROLL_MS,
  } = options;

  // Convert the step/interval config into a wall-clock scroll speed. A fixed
  // pixels-per-tick loop scrolls a distance proportional to how many timer
  // ticks fire, so on a CPU-starved host (e.g. Render) far fewer ticks fire
  // and the page barely moves. Anchoring the position to elapsed time keeps the
  // pace identical regardless of host speed and guarantees we reach the bottom.
  const pixelsPerSecond = (pixelsPerStep / intervalMs) * 1000;

  await page.evaluate(
    async ({ pixelsPerSecond, maxDurationMs }) => {
      await new Promise<void>((resolve) => {
        const startedAt = performance.now();
        let lastY = -1;
        let stuckSteps = 0;

        const tick = () => {
          const elapsed = performance.now() - startedAt;
          const target = Math.floor((elapsed / 1000) * pixelsPerSecond);

          window.scrollTo(0, target);

          const scrollY = window.scrollY;
          const maxScroll =
            document.documentElement.scrollHeight - window.innerHeight;
          const bottomReached = scrollY >= maxScroll - 5;

          if (scrollY === lastY) {
            stuckSteps += 1;
          } else {
            stuckSteps = 0;
            lastY = scrollY;
          }

          const timedOut = elapsed >= maxDurationMs;
          const stuckPastBottom = target > maxScroll && stuckSteps >= 5;

          if (bottomReached || timedOut || stuckPastBottom) {
            resolve();
            return;
          }

          requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      });
    },
    { pixelsPerSecond, maxDurationMs }
  );
}
