import { test, expect } from "@playwright/test";
import { liveDeltas } from "../golden-react/scenarioDefinitions";
import { openScenario, gesture, artifacts, screenshot } from "./scenarioDriver";

test.afterEach(async ({ page }, info) => {
  await artifacts(page, info);
});
for (const axis of ["drag", "se"]) {
  test(`active ${axis === "drag" ? "drag" : "resize"} follows sub-cell mouse moves and snaps on release`, async ({
    page
  }, info) => {
    await openScenario(page, `preview-${axis}`, "none");
    const item = page.locator('#scenario-grid [data-item="a"]');
    const before = (await item.boundingBox())!;
    await screenshot(page, info, "start");
    await gesture(
      page,
      liveDeltas.map(d => [d, d]),
      axis === "drag" ? undefined : axis,
      [0.05, 0.05],
      true,
      async () => {
        const placeholder = page.locator(
          "#scenario-grid .react-grid-placeholder"
        );
        const snapped = (await placeholder.boundingBox())!;
        expect(snapped).toEqual(before);
        await screenshot(page, info, "mid-gesture");
      }
    );
    await expect(
      page.locator("#scenario-grid .react-grid-placeholder")
    ).toHaveCount(0);
    expect(await item.boundingBox()).toEqual(before);
    await screenshot(page, info, "end");
  });
}
