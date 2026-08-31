import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    viewport: { width: 360, height: 800 },
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    env: {
      VITE_TURNSTILE_SITE_KEY: "test-key-not-used-with-cloudflare",
      VITE_API_URL: "http://127.0.0.1:4173",
    },
  },
});
