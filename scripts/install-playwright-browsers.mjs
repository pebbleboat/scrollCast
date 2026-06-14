import { execSync } from "node:child_process";

process.env.PLAYWRIGHT_BROWSERS_PATH = "0";

execSync("npx playwright install chromium ffmpeg", {
  stdio: "inherit",
  env: process.env,
});

console.log(
  "[build] Playwright browsers installed (PLAYWRIGHT_BROWSERS_PATH=0 → node_modules)"
);
