import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // epic1-authentication.spec.ts needs a real backend. In CI it only runs in the
  // dedicated test-epic1 job (.github/workflows/playwright.yml), which provisions the
  // backend and sets E2E_BACKEND=1; every other CI job (chromium/firefox/webkit/mobile)
  // excludes it. Locally (no CI) it always runs, same as `npm run test:epic1`.
  testIgnore: process.env.CI && !process.env.E2E_BACKEND ? ['**/epic1-authentication.spec.ts'] : [],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    // Vite dev server (vite.config.ts). The Go backend uses 3001.
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    // --strictPort: fail instead of silently moving to 3001 (the backend's port)
    command: 'npm run dev -- --strictPort',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
