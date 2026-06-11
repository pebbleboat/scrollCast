import path from "path";
import { recordWalkthrough } from "../lib/recorder";
import { DEFAULT_SCROLL, DEFAULT_VIEWPORT } from "../lib/types";

const pages = ["https://pebbleboat.com/", "https://pebbleboat.com/blogs"];

(async () => {
  const videoPath = await recordWalkthrough({
    pages,
    scroll: DEFAULT_SCROLL,
    viewport: DEFAULT_VIEWPORT,
    outputDir: path.resolve("./videos"),
    headless: false,
  });

  console.log("Video saved to:", videoPath);
})();
