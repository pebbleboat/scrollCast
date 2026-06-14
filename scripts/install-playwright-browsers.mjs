import { execSync } from "node:child_process";

const env = { ...process.env, PLAYWRIGHT_BROWSERS_PATH: "0" };

function install(args) {
  execSync(`playwright install ${args}`, { stdio: "inherit", env });
}

if (process.env.VERCEL) {
  install("ffmpeg");
} else if (process.env.RENDER) {
  install("--with-deps chromium ffmpeg");
} else {
  install("chromium ffmpeg");
}
