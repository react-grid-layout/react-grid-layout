import fs from "node:fs";
import path from "node:path";
import { touchDropCells } from "../golden-react/scenarioDefinitions";
import { test, expect } from "@playwright/test";
import {
  openScenario,
  touch,
  artifacts,
  screenshot,
  gridLayout
} from "./scenarioDriver";

test.use({ hasTouch: true });
test.afterEach(async ({ page }, info) => {
  await artifacts(page, info);
});
for (const action of ["commit", "leave", "cancel"]) {
  test(`DOM touch external drop: ${action}`, async ({ page }, info) => {
    await openScenario(page, "touch-drop", "vertical");
    await screenshot(page, info, "start");
    const source = (await page.locator("#touch-source").boundingBox())!;
    await touch(
      page,
      "touchstart",
      source.x + source.width / 2,
      source.y + source.height / 2
    );
    for (const [x, y] of touchDropCells) {
      const at = await page.evaluate(
        ({ x, y }) => window.__rgl.cellToClient(x, y),
        { x, y }
      );
      await touch(page, "touchmove", at.x, at.y);
    }
    await expect(page.locator(".dropping")).toHaveCount(1);
    await screenshot(page, info, "mid-gesture");
    if (action === "leave")
      await touch(
        page,
        "touchmove",
        source.x + source.width / 2,
        source.y + source.height / 2
      );
    const at =
      action === "leave"
        ? { x: source.x + source.width / 2, y: source.y + source.height / 2 }
        : await page.evaluate(() => window.__rgl.cellToClient(2.5, 0.5));
    await touch(
      page,
      action === "cancel" ? "touchcancel" : "touchend",
      at.x,
      at.y
    );
    const drops = await page.evaluate(() =>
      window.__rgl.trace
        .flatMap((s: any) => s.callbacks)
        .filter((cb: any) => cb.name === "onDrop")
    );
    expect(drops).toHaveLength(action === "commit" ? 1 : 0);
    if (action === "commit") {
      const golden = JSON.parse(
        fs.readFileSync(
          path.join(
            __dirname,
            "../golden-react/__golden__/external-touch-commit.vertical.trace.json"
          ),
          "utf8"
        )
      );
      const expected = golden.steps
        .flatMap((s: any) => s.callbacks)
        .find((cb: any) => cb.name === "onDrop");
      expect(gridLayout(drops[0].layout)).toEqual(gridLayout(expected.layout));
    }
    await expect(page.locator(".dropping")).toHaveCount(0);
    await screenshot(page, info, "end");
  });
}
