import { execSync } from "node:child_process";

const env = { ...process.env, PLAYWRIGHT_BROWSERS_PATH: "0" };

function install(args) {
  execSync(`npx playwright install ${args}`, { stdio: "inherit", env });
}

// Vercel and Render use @sparticuz/chromium at runtime — only ffmpeg is needed
// for Playwright video recording. --with-deps requires root and fails on Render.
if (process.env.VERCEL || process.env.RENDER) {
  install("ffmpeg");
} else {
  install("chromium ffmpeg");
}
