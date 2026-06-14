export function isRender(): boolean {
  return Boolean(process.env.RENDER);
}

/** Deployed Render host — headless Playwright Chromium. */
export function isRemote(): boolean {
  return isRender();
}

/** Match build-time install (scripts/install-playwright-browsers.mjs). */
function ensurePlaywrightBrowsersPath(): void {
  if (!process.env.PLAYWRIGHT_BROWSERS_PATH) {
    process.env.PLAYWRIGHT_BROWSERS_PATH = "0";
  }
}

const RENDER_LAUNCH_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--mute-audio",
  "--disable-extensions",
  "--disable-background-networking",
];

export async function launchBrowser(headless: boolean) {
  ensurePlaywrightBrowsersPath();

  const { chromium: playwrightChromium } = await import("playwright-core");

  return playwrightChromium.launch({
    headless: headless || isRender(),
    slowMo: headless || isRender() ? undefined : 50,
    args: isRender() ? RENDER_LAUNCH_ARGS : undefined,
  });
}
