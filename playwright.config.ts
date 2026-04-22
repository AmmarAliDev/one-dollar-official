import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PORT) || 3000;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${port}`;

const config = defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    testIdAttribute: "data-testid",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  ...(process.env.CI ? { workers: 1 } : {}),
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  globalSetup: "./tests/e2e/global.setup.ts",
});

if (!process.env.PLAYWRIGHT_SKIP_WEBSERVER) {
  config.webServer = {
    command: "pnpm dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      ...process.env,
      PORT: `${port}`,
      NEXT_PUBLIC_APP_URL: baseURL,
      AUTH_URL: baseURL,
    },
  };
}

export default config;
