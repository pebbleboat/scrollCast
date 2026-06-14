import { execSync } from "node:child_process";

const env = { ...process.env, PLAYWRIGHT_BROWSERS_PATH: "0" };

execSync("npx playwright install chromium ffmpeg", {
  stdio: "inherit",
  env,
});
