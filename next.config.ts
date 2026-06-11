import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["playwright-core", "@sparticuz/chromium"],
  outputFileTracingIncludes: {
    "/api/record": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
      "./node_modules/playwright-core/**/*",
    ],
  },
};

export default nextConfig;
