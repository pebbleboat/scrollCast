export function isServerless(): boolean {
  return Boolean(process.env.VERCEL);
}

export async function launchBrowser(headless: boolean) {
  if (isServerless()) {
    process.env.PLAYWRIGHT_BROWSERS_PATH = "0";
  }

  const { chromium: playwrightChromium } = await import("playwright-core");

  if (isServerless()) {
    const chromium = (await import("@sparticuz/chromium")).default;
    chromium.setGraphicsMode = false;

    return playwrightChromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  return playwrightChromium.launch({
    channel: "chrome",
    headless,
    slowMo: 50,
  });
}
