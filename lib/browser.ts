export function isRender(): boolean {
  return Boolean(process.env.RENDER);
}

/** Deployed Render host — headless Playwright Chromium. */
export function isRemote(): boolean {
  return isRender();
}

const RENDER_LAUNCH_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
];

export async function launchBrowser(headless: boolean) {
  const { chromium: playwrightChromium } = await import("playwright-core");

  return playwrightChromium.launch({
    headless: headless || isRender(),
    slowMo: headless || isRender() ? undefined : 50,
    args: isRender() ? RENDER_LAUNCH_ARGS : undefined,
  });
}
