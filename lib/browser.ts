export function isVercel(): boolean {
  return Boolean(process.env.VERCEL);
}

export function isRender(): boolean {
  return Boolean(process.env.RENDER);
}

/** Vercel serverless — tight time limits, blob storage, synchronous response. */
export function isServerless(): boolean {
  return isVercel();
}

/** Deployed hosts without a local Chrome install (Vercel or Render). */
export function isRemote(): boolean {
  return isVercel() || isRender();
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
  if (isVercel() || isRender()) {
    return launchWithSparticuzChromium();
  }

  const { chromium: playwrightChromium } = await import("playwright-core");

  return playwrightChromium.launch({
    headless,
    slowMo: headless ? undefined : 50,
  });
}
