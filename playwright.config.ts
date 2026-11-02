import { defineConfig } from "@playwright/test";

/**
 * E2E tests run against a pre-built static harness (make e2e-build), served by
 * a plain static server. This avoids the webpack dev-server compile race and
 * hot-reload interference that make dev-server e2e flaky.
 *
 * Rebuild after changing src/:
 *   make e2e-build
 * Then run:
 *   yarn playwright test
 */
export default defineConfig({
  testDir: "./test/e2e",
  timeout: 90_000,
  fullyParallel: false,
  retries: 0,
  workers: 1, // Single grid state; keep tests isolated but serial
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${process.env.RGL_PORT || 4106}`,
    trace: "on",
    screenshot: "only-on-failure",
    headless: true
  },
  webServer: {
    // Serve the pre-built static harness. Build it first with `make e2e-build`.
    command: `python3 -m http.server ${process.env.RGL_PORT || 4106} --directory test/e2e/harness-dist`,
    url: `http://localhost:${process.env.RGL_PORT || 4106}/index.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 15_000
  },
  projects: [
    {
      name: "chromium",
      testIgnore: "dist.spec.ts",
      use: { browserName: "chromium" }
    },
    {
      name: "dist",
      testMatch: "dist.spec.ts",
      use: { browserName: "chromium" }
    }
    // Firefox + webkit require the browsers installed; add once the
    // cross-browser matrix is valuable. The Firefox drop-path differs.
  ]
});
