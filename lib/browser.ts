export function isRender(): boolean {
  return Boolean(process.env.RENDER);
}

/** Deployed Render host — headless Chromium via @sparticuz/chromium. */
export function isRemote(): boolean {
  return isRender();
}

async function launchWithSparticuzChromium() {
  process.env.PLAYWRIGHT_BROWSERS_PATH = "0";

  const { chromium: playwrightChromium } = await import("playwright-core");
  const chromium = (await import("@sparticuz/chromium")).default;
  chromium.setGraphicsMode = false;

  return playwrightChromium.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });
}

export async function launchBrowser(headless: boolean) {
  if (isRender()) {
    return launchWithSparticuzChromium();
  }

  const { chromium: playwrightChromium } = await import("playwright-core");

  return playwrightChromium.launch({
    headless,
    slowMo: headless ? undefined : 50,
  });
}
