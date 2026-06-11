import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({
    headless: false,
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  await page.goto("https://pebbleboat.com", {
    waitUntil: "networkidle",
  });

  await page.screenshot({ path: "hero.png" });

  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;

      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });

  await browser.close();
})();
