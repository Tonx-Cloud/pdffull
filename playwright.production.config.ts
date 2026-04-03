import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "production-e2e.spec.ts",
  fullyParallel: true,
  retries: 1,
  workers: 3,
  reporter: "list",
  timeout: 30_000,
  use: {
    baseURL: "https://www.pdf-full.com",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  // Sem webServer — testa direto contra produção
});
