import { execSync } from "node:child_process";

const env = { ...process.env, PLAYWRIGHT_BROWSERS_PATH: "0" };

function install(args) {
  execSync(`npx playwright install ${args}`, { stdio: "inherit", env });
}

// Render uses @sparticuz/chromium at runtime — only ffmpeg is needed for video.
if (process.env.RENDER) {
  install("ffmpeg");
} else {
  install("chromium ffmpeg");
}
