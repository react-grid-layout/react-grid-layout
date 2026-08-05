import { test, expect, type Page } from "@playwright/test";

/**
 * Touch external-drop test (#2281).
 *
 * HTML5 dragover/drop never fires on touch devices, so this exercises the
 * grid's touch adapter directly: touchstart on a marked source element,
 * touchmove over the grid shows the placeholder, touchend commits via onDrop.
 *
 * Real touch events are dispatched through the CDP session so the browser
 * treats them as genuine touch input (not synthesized mouse events).
 */

const ITEM = ".react-grid-item";

/** The touch-drop grid's container (has .react-grid-layout). */
const DROP_GRID = "#touch-drop-container > .react-grid-layout";
const SOURCE = "#touch-source";

async function touchPointsFrom(page: Page, selector: string) {
  const box = await page.locator(selector).boundingBox();
  if (!box) throw new Error(`no bounding box for ${selector}`);
  return {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2
  };
}

test.describe("touch external-drop adapter (real browser)", () => {
  test("touch-drag from a marked source drops into the grid", async ({
    page,
    context
  }) => {
    // Playwright's default context has no touch support; enable it via CDP.
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setTouchEmulationEnabled", {
      enabled: true,
      maxTouchPoints: 1
    });
    // Make the page report touch capability so touchstart listeners activate.
    await page.evaluate(() => {
      Object.defineProperty(navigator, "maxTouchPoints", {
        get: () => 1
      });
    });

    await page.goto("/index.html", { waitUntil: "domcontentloaded" });
    await page.waitForSelector(ITEM, { state: "visible", timeout: 15_000 });

    const source = await touchPointsFrom(page, SOURCE);
    // A point over the drop grid — use the middle of the grid's first cell.
    const gridBox = await page.locator(DROP_GRID).boundingBox();
    if (!gridBox) throw new Error("drop grid not found");
    const target = { x: gridBox.x + 60, y: gridBox.y + 40 };

    // Dispatch a genuine touch sequence: start on the source, move over the
    // grid, then release over the grid.
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: source.x, y: source.y, id: 1, radiusX: 1, radiusY: 1 }]
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: source.x + 40, y: source.y + 10, id: 1, radiusX: 1, radiusY: 1 }
      ]
    });
    // Move onto the grid — the placeholder should appear.
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: target.x, y: target.y, id: 1, radiusX: 1, radiusY: 1 }]
    });
    // Small pause so the adapter's state commits before we assert.
    await page.waitForTimeout(100);

    // The placeholder adds a .react-grid-item to the drop grid (4 originals + 1).
    const itemCount = await page.locator(DROP_GRID + " > " + ITEM).count();
    expect(itemCount).toBe(5);

    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: []
    });
    await page.waitForTimeout(100);

    // onDrop fired: the drop-layout-state now records the dropped item.
    const dropState = await page.locator("#drop-layout-state").textContent();
    const parsed = JSON.parse(dropState ?? "[]");
    expect(parsed.some((l: { i: string }) => l.i === "__dropping-elem__")).toBe(
      true
    );

    await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: false });
  });

  test("releasing outside the grid does not commit", async ({
    page,
    context
  }) => {
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setTouchEmulationEnabled", {
      enabled: true,
      maxTouchPoints: 1
    });

    await page.goto("/index.html", { waitUntil: "domcontentloaded" });
    await page.waitForSelector(ITEM, { state: "visible", timeout: 15_000 });

    const source = await touchPointsFrom(page, SOURCE);
    // Pick a release point far outside any grid (x:10, y:500) — no touchmove
    // over the grid, so the adapter never renders the placeholder.
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: source.x, y: source.y, id: 1, radiusX: 1, radiusY: 1 }]
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: []
    });
    await page.waitForTimeout(100);

    // No drop recorded.
    const dropState = await page.locator("#drop-layout-state").textContent();
    const parsed = JSON.parse(dropState ?? "[]");
    expect(parsed.some((l: { i: string }) => l.i === "__dropping-elem__")).toBe(
      false
    );

    await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: false });
  });
});
