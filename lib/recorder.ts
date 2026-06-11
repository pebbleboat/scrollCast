import { chromium } from "playwright";
import { readdir } from "fs/promises";
import path from "path";
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

  const browser = await chromium.launch({
    headless,
    slowMo: 50,
  });

  const context = await browser.newContext({
    viewport,
    recordVideo: {
      dir: outputDir,
      size: viewport,
    },
  });

  const page = await context.newPage();

  const guard = (promise: Promise<unknown>) =>
    untilSettledOrAborted(promise, signal);

  try {
    for (const url of pages) {
      if (signal?.aborted) break;

      await guard(page.goto(url, { waitUntil: "networkidle" }));

      if (signal?.aborted) break;

      await guard(
        page.addStyleTag({
          content: `html { scroll-behavior: smooth !important; }`,
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
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }

  const files = await readdir(outputDir);
  const video = files.find((file: string) => file.endsWith(".webm"));

  if (!video) {
    throw new Error("No video file was created");
  }

  return path.join(outputDir, video);
}
