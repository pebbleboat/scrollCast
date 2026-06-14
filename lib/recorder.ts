import { readdir } from "fs/promises";
import path from "path";
import { isRemote, launchBrowser } from "./browser";
import { waitForPageReady } from "./pageReady";
import { scrollPage } from "./scroll";
import {
  DEFAULT_SCROLL,
  DEFAULT_VIEWPORT,
  type RecordOptions,
} from "./types";

function logPhase(phase: string, startedAt: number): void {
  console.log(`[record] ${phase}: ${Date.now() - startedAt}ms`);
}

function untilSettledOrAborted(
  promise: Promise<unknown>,
  signal?: AbortSignal
): Promise<void> {
  return new Promise<void>((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      signal?.removeEventListener("abort", finish);
      resolve();
    };

    if (signal) {
      if (signal.aborted) return finish();
      signal.addEventListener("abort", finish, { once: true });
    }

    promise.then(finish, finish);
  });
}

export async function recordWalkthrough(
  options: RecordOptions
): Promise<string> {
  const totalStartedAt = Date.now();
  const {
    pages,
    scroll = DEFAULT_SCROLL,
    viewport = DEFAULT_VIEWPORT,
    outputDir,
    headless = false,
    signal,
  } = options;

  let phaseStartedAt = Date.now();
  const browser = await launchBrowser(headless);
  logPhase("browser launch", phaseStartedAt);

  const context = await browser.newContext({
    viewport,
    recordVideo: {
      dir: outputDir,
      size: viewport,
    },
  });

  const page = await context.newPage();
  let closed = false;

  const teardown = async () => {
    if (closed) return;
    closed = true;
    phaseStartedAt = Date.now();
    await context.close().catch(() => {});
    logPhase("context close (video encode)", phaseStartedAt);
    phaseStartedAt = Date.now();
    await browser.close().catch(() => {});
    logPhase("browser close", phaseStartedAt);
  };

  if (signal) {
    signal.addEventListener("abort", () => {
      void teardown();
    });
  }

  const guard = (promise: Promise<unknown>) =>
    untilSettledOrAborted(promise, signal);

  try {
    for (const url of pages) {
      if (signal?.aborted) break;

      phaseStartedAt = Date.now();
      await guard(
        page.goto(url, {
          waitUntil: isRemote() ? "load" : "networkidle",
          timeout: isRemote() ? 45_000 : 60_000,
        })
      );
      logPhase(`goto ${url}`, phaseStartedAt);

      if (signal?.aborted) break;

      phaseStartedAt = Date.now();
      await guard(waitForPageReady(page));
      logPhase("page ready", phaseStartedAt);

      if (signal?.aborted) break;

      await guard(
        page.addStyleTag({
          content: `html { scroll-behavior: auto !important; }`,
        })
      );

      if (signal?.aborted) break;

      phaseStartedAt = Date.now();
      await guard(scrollPage(page, scroll));
      logPhase("scroll", phaseStartedAt);

      if (signal?.aborted) break;

      await guard(page.waitForTimeout(isRemote() ? 1500 : 3000));
    }
  } finally {
    await teardown();
  }

  logPhase("total", totalStartedAt);

  const files = await readdir(outputDir);
  const video = files.find((file: string) => file.endsWith(".webm"));

  if (!video) {
    throw new Error("No video file was created");
  }

  return path.join(outputDir, video);
}
