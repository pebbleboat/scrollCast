import { readdir } from "fs/promises";
import path from "path";
import { isRemote, launchBrowser } from "./browser";
import { scrollPage } from "./scroll";
import {
  DEFAULT_SCROLL,
  DEFAULT_VIEWPORT,
  type RecordOptions,
} from "./types";

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
  const {
    pages,
    scroll = DEFAULT_SCROLL,
    viewport = DEFAULT_VIEWPORT,
    outputDir,
    headless = false,
    signal,
  } = options;

  const browser = await launchBrowser(headless);

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
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
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

      await guard(
        page.goto(url, {
          waitUntil: isRemote() ? "domcontentloaded" : "networkidle",
          timeout: isRemote() ? 30_000 : 60_000,
        })
      );

      if (signal?.aborted) break;

      // Force instant scrolling: we position the page per animation frame, and
      // CSS smooth scrolling would animate between our setpoints (fighting the
      // loop and making scrollY lag the target, badly on slow CPUs).
      await guard(
        page.addStyleTag({
          content: `html { scroll-behavior: auto !important; }`,
        })
      );

      await guard(page.waitForTimeout(2000));

      if (signal?.aborted) break;

      await guard(scrollPage(page, scroll));

      if (signal?.aborted) break;

      await guard(page.waitForTimeout(3000));
      await guard(page.waitForTimeout(1500));
    }
  } finally {
    await teardown();
  }

  const files = await readdir(outputDir);
  const video = files.find((file: string) => file.endsWith(".webm"));

  if (!video) {
    throw new Error("No video file was created");
  }

  return path.join(outputDir, video);
}
