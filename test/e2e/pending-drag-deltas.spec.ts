import { test, expect } from "@playwright/test";

for (const variant of ["none", "absolute", "scaled"]) {
  test(`pending movement preserves the grabbed point (${variant})`, async ({
    page
  }, info) => {
    await page.goto(`/index.html?scenario=drag-threshold&variant=${variant}`);
    await page.waitForFunction(() => (window as any).__rgl?.ready);
    const item = page.locator('#scenario-grid [data-item="a"]');
    for (const direction of [1, -1]) {
      const before = (await item.boundingBox())!;
      const x = before.x + before.width / 3;
      const y = before.y + before.height / 3;
      await page.mouse.move(x, y);
      await page.mouse.down();
      for (const [dx, dy] of [
        [1, 1],
        [0, 0],
        [2, 1]
      ]) {
        await page.mouse.move(x + direction * dx, y + direction * dy);
      }
      await expect(page.locator(".react-grid-placeholder")).toHaveCount(0);
      await page.mouse.move(x + direction * 9, y + direction * 4);
      await expect(page.locator(".react-grid-placeholder")).toHaveCount(1);
      await page.screenshot({
        path: info.outputPath(`threshold-${direction}.png`)
      });
      const crossed = (await item.boundingBox())!;
      expect(crossed.x - before.x).toBeCloseTo(direction * 9, 1);
      expect(crossed.y - before.y).toBeCloseTo(direction * 4, 1);
      await page.mouse.move(x + direction * 15, y + direction * 7);
      const continued = (await item.boundingBox())!;
      expect(continued.x - before.x).toBeCloseTo(direction * 15, 1);
      expect(continued.y - before.y).toBeCloseTo(direction * 7, 1);
      await page.mouse.up();
      await expect(page.locator(".react-grid-placeholder")).toHaveCount(0);
    }
  });
}

for (const variant of ["none", "absolute"]) {
  test(`dropping positions stay absolute across threshold (${variant})`, async ({
    page
  }, info) => {
    await page.goto(`/index.html?scenario=html5-drop&variant=${variant}`);
    await page.waitForFunction(() => (window as any).__rgl?.ready);
    const grid = page.locator("#scenario-grid .react-grid-layout");
    const bounds = (await grid.boundingBox())!;
    const move = async (dx: number, dy: number) => {
      await grid.dispatchEvent("dragover", {
        clientX: bounds.x + 390 + dx,
        clientY: bounds.y + 345 + dy
      });
      await page.evaluate(() => (window as any).__rgl.sample("drop move"));
    };
    await move(0, 0);
    const item = page.locator(".react-grid-item.dropping");
    const before = (await item.boundingBox())!;
    await move(1, 0);
    await move(2, 0);
    await expect(page.locator(".react-grid-placeholder")).toHaveCount(0);
    await move(9, 4);
    const crossed = (await item.boundingBox())!;
    await page.screenshot({ path: info.outputPath("dropping-threshold.png") });
    expect(crossed.x - before.x).toBeCloseTo(9, 1);
    expect(crossed.y - before.y).toBeCloseTo(4, 1);
    await move(15, 7);
    const continued = (await item.boundingBox())!;
    expect(continued.x - before.x).toBeCloseTo(15, 1);
    expect(continued.y - before.y).toBeCloseTo(7, 1);
    await grid.dispatchEvent("drop", {
      clientX: bounds.x + 405,
      clientY: bounds.y + 352
    });
    await expect(item).toHaveCount(0);
  });
}
