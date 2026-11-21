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
