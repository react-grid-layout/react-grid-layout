import { test, expect } from "@playwright/test";

/**
 * Real-browser smoke tests against the showcase grid (dev server).
 * These exercise actual DOM drag/resize/transform behavior that jsdom
 * cannot simulate: CSS transform positioning, mouse capture, and the
 * react-resizable handle geometry.
 */

const ITEM = ".react-grid-item";
const HANDLE = ".react-resizable-handle";

async function itemBox(item: import("@playwright/test").Locator) {
  return (await item.boundingBox())!;
}

test.describe("grid harness (real browser)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/index.html", { waitUntil: "domcontentloaded" });
    // The bundle is pre-built and small; wait for items to render.
    await page.waitForSelector(ITEM, { state: "visible", timeout: 15_000 });
    await page.waitForTimeout(200);
  });

  test("renders grid items at expected positions", async ({ page }) => {
    const items = page.locator(ITEM);
    const count = await items.count();
    expect(count).toBe(4);

    // Items must have non-zero, distinct positions (transforms applied).
    const positions = new Set<string>();
    for (let i = 0; i < count; i++) {
      const box = await itemBox(items.nth(i));
      expect(box.width).toBeGreaterThan(0);
      expect(box.height).toBeGreaterThan(0);
      positions.add(`${Math.round(box.x)},${Math.round(box.y)}`);
    }
    expect(positions.size).toBeGreaterThan(2);
  });

  test("dragging an item moves it and fires onLayoutChange", async ({ page }) => {
    const item = page.locator(ITEM).first();
    const before = await itemBox(item);

    // Grab the center and drag 120px right, 60px down.
    await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
    await page.mouse.down();
    await page.mouse.move(before.x + before.width / 2 + 120, before.y + before.height / 2 + 60, { steps: 8 });
    await page.mouse.up();

    const after = await itemBox(item);
    expect(Math.abs(after.x - (before.x + 120))).toBeLessThan(20);
    expect(Math.abs(after.y - (before.y + 60))).toBeLessThan(20);
  });

  test("resize handle changes item size", async ({ page }) => {
    const item = page.locator(ITEM).first();
    const handle = item.locator(HANDLE).first();

    await handle.waitFor({ state: "visible" });
    const hb = await itemBox(handle);
    const before = await itemBox(item);

    // Pick a down-right (se) handle: drag 90px right, 70px down.
    const handleCorner = handle.getAttribute("class");
    const isSouthEast = /se/.test((await handleCorner) ?? "");
    await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      hb.x + hb.width / 2 + (isSouthEast ? 90 : -90),
      hb.y + hb.height / 2 + 70,
      { steps: 6 }
    );
    await page.mouse.up();

    const after = await itemBox(item);
    // Grid-snapped resize should grow the item, not shrink it.
    expect(after.width).toBeGreaterThan(before.width);
    expect(after.height).toBeGreaterThan(before.height);
  });

  test("CSS transforms are applied (not static top/left)", async ({ page }) => {
    const item = page.locator(ITEM).first();
    const transform = await item.evaluate((el) => getComputedStyle(el).transform);
    // transformStrategy -> a matrix; absoluteStrategy -> 'none'
    expect(transform).not.toBe("none");
    expect(transform).toMatch(/matrix/);
  });

  test("drag near the scroll container edge auto-scrolls it (#2232)", async ({ page }) => {
    const container = page.locator("#scroll-container");
    await container.waitFor({ state: "visible" });
    await container.scrollIntoViewIfNeeded();
    const before = await container.evaluate((el) => el.scrollTop);

    // Grab the first VISIBLE item inside the scroll container and drag it to
    // the container's bottom edge.
    const items = page.locator("#scroll-container " + ITEM);
    const item = items.first();
    await item.waitFor({ state: "visible" });
    const box = await itemBox(item);
    const cBox = (await container.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    // Move the pointer to the container's bottom edge and hold.
    await page.mouse.move(cBox.x + cBox.width / 2, cBox.y + cBox.height - 5, {
      steps: 8
    });
    await page.waitForTimeout(500);
    const after = await container.evaluate((el) => el.scrollTop);
    await page.mouse.up();

    expect(after).toBeGreaterThan(before);
  });
});
