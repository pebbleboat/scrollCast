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

export async function launchBrowser(headless: boolean) {
  const { chromium: playwrightChromium } = await import("playwright-core");

  if (isVercel()) {
    process.env.PLAYWRIGHT_BROWSERS_PATH = "0";

    const chromium = (await import("@sparticuz/chromium")).default;
    chromium.setGraphicsMode = false;

    return playwrightChromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  if (isRender()) {
    process.env.PLAYWRIGHT_BROWSERS_PATH = "0";
  }

  const runHeadless = headless || isRender();

  return playwrightChromium.launch({
    headless: runHeadless,
    slowMo: runHeadless ? undefined : 50,
  });
}
