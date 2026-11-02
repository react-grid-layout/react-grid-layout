import { test, expect } from "@playwright/test";
import { openScenario, gesture, artifacts, screenshot } from "./scenarioDriver";
import { browserScenarios } from "../golden-react/scenarioDefinitions";

test.afterEach(async ({ page }, info) => {
  await artifacts(page, info);
});
for (const format of ["import", "require"]) {
  for (const variant of ["none", "legacy"]) {
    test(`${format} exports: ${variant} renders, drags and resizes`, async ({
      page
    }, info) => {
      const scenario = browserScenarios.find(s => s.id === "drag-directions")!;
      await openScenario(page, scenario.id, variant, `${format}/`);
      await screenshot(page, info, "start");
      const before = await page.evaluate(() =>
        window.__rgl.layout.find((i: any) => i.i === "a")
      );
      await gesture(page, scenario.gestures[0].moves);
      const after = await page.evaluate(() =>
        window.__rgl.layout.find((i: any) => i.i === "a")
      );
      expect(after.x).toBeGreaterThan(before.x);
      await screenshot(page, info, "mid-gesture");
      await gesture(
        page,
        [
          [0.2, 0.2],
          [1.1, 1.1]
        ],
        "se",
        [0.05, 0.05]
      );
      const resized = await page.evaluate(() =>
        window.__rgl.layout.find((i: any) => i.i === "a")
      );
      expect(resized.w).toBeGreaterThan(after.w);
      expect(resized.h).toBeGreaterThan(after.h);
      await screenshot(page, info, "end");
    });
  }
}
