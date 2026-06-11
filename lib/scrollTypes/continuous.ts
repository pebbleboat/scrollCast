import type { Page } from "playwright";

type ContinuousScrollOptions = {
  pixelsPerStep?: number;
  intervalMs?: number;
};

export async function continuousScroll(
  page: Page,
  options: ContinuousScrollOptions = {}
): Promise<void> {
  const { pixelsPerStep = 12, intervalMs = 8 } = options;

  await page.evaluate(
    async ({ pixelsPerStep, intervalMs }) => {
      await new Promise<void>((resolve) => {
        const timer = setInterval(() => {
          window.scrollBy(0, pixelsPerStep);

          const bottomReached =
            window.innerHeight + window.scrollY >=
            document.documentElement.scrollHeight - 5;

          if (bottomReached) {
            clearInterval(timer);
            resolve();
          }
        }, intervalMs);
      });
    },
    { pixelsPerStep, intervalMs }
  );
}
