import type { Page } from "playwright";
import { continuousScroll } from "./scrollTypes/continuous";
import { jumpyScroll } from "./scrollTypes/jumpy";
import type { ScrollConfig } from "./types";

export async function scrollPage(
  page: Page,
  config: ScrollConfig
): Promise<void> {
  if (config.type === "jumpy") {
    await jumpyScroll(page, { waitMs: config.jumpWaitMs });
  } else {
    await continuousScroll(page, {
      pixelsPerStep: config.pixelsPerStep,
      intervalMs: config.intervalMs,
    });
  }
}
