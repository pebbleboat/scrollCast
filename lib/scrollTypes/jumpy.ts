import type { Page } from "playwright";

type JumpyScrollOptions = {
  waitMs?: number;
};

export async function jumpyScroll(
  page: Page,
  options: JumpyScrollOptions = {}
): Promise<void> {
  const { waitMs = 1000 } = options;
  let previousHeight = 0;

  while (true) {
    await page.evaluate(() => {
      window.scrollBy({
        top: window.innerHeight * 0.8,
        behavior: "smooth",
      });
    });

    await page.waitForTimeout(waitMs);

    const currentHeight = await page.evaluate(
      () => document.documentElement.scrollHeight
    );

    const isAtBottom = await page.evaluate(() => {
      return (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 20
      );
    });

    if (isAtBottom && currentHeight === previousHeight) {
      break;
    }

    previousHeight = currentHeight;
  }
}
