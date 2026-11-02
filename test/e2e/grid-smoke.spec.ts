import { test, expect } from "@playwright/test";
import { openScenario, artifacts, screenshot } from "./scenarioDriver";

test.afterEach(async ({ page }, info) => {
  await artifacts(page, info);
});
test.beforeEach(async ({ page }) => {
  await openScenario(page, "drag-directions", "none");
});
test("renders the shared layout at distinct cell positions", async ({
  page
}, info) => {
  const items = page.locator("#scenario-grid [data-item]");
  expect(await items.count()).toBe(3);
  const positions = await items.evaluateAll(nodes =>
    nodes.map(node => {
      const rect = node.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    })
  );
  expect(new Set(positions.map(box => `${box.x},${box.y}`)).size).toBe(3);
  expect(positions.every(box => box.width > 0 && box.height > 0)).toBe(true);
  await screenshot(page, info, "rendered");
});
test("transform strategy positions the shared items", async ({ page }) => {
  const transform = await page
    .locator('#scenario-grid [data-item="b"]')
    .evaluate(node => getComputedStyle(node).transform);
  expect(transform).toMatch(/matrix/);
});
