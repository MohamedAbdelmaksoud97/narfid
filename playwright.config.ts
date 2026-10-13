import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  fullyParallel: false,
  timeout: 120000,
  expect: { timeout: 20000 },
  reporter: "list",
  use: {
    baseURL: process.env.AUTH_TEST_BASE_URL || "http://127.0.0.1:3012",
    channel: "chromium",
    headless: true,
    viewport: { width: 1440, height: 1000 },
    trace: "off",
  },
});
