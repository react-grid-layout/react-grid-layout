import { test, expect } from "@playwright/test";

const ITEM = "#grid-container > .react-grid-layout > .react-grid-item";

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
  await expect(page.locator(ITEM).first()).toBeVisible();
  // useContainerWidth starts at its default width before ResizeObserver settles.
  await expect(page.locator(ITEM).first()).toHaveCSS("width", "238px");
});

test("active drag follows sub-cell mouse moves and snaps on release", async ({
  page
}, testInfo) => {
  const item = page.locator(ITEM).first();
  // Disable the release transition while measuring exact browser geometry.
  await page.addStyleTag({ content: ".react-grid-item { transition: none; }" });
  const before = (await item.boundingBox())!;
  const x = before.x + before.width / 2;
  const y = before.y + before.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  // The default v2 threshold is 3px; start the interaction before sampling.
  await page.mouse.move(x + 4, y + 4);
  const start = (await item.boundingBox())!;
  const placeholder = page.locator("#grid-container .react-grid-placeholder");
  const snapped = (await placeholder.boundingBox())!;
  for (const delta of [3, 7, 11]) {
    await page.mouse.move(x + 4 + delta, y + 4 + delta);
    await expect
      .poll(async () => (await item.boundingBox())!.x)
      .toBeCloseTo(start.x + delta, 1);
    expect((await item.boundingBox())!.y).toBeCloseTo(start.y + delta, 1);
    expect((await placeholder.boundingBox())!.x).toBeCloseTo(snapped.x, 1);
    expect((await placeholder.boundingBox())!.y).toBeCloseTo(snapped.y, 1);
  }
  await page.screenshot({ path: testInfo.outputPath("drag-live.png") });
  await page.mouse.up();
  await expect(placeholder).toHaveCount(0);
  await expect
    .poll(async () => (await item.boundingBox())!.x)
    .toBeCloseTo(before.x, 1);
  expect((await item.boundingBox())!.y).toBeCloseTo(before.y, 1);
  await page.screenshot({ path: testInfo.outputPath("drag-stopped.png") });
});

test("active resize follows sub-cell mouse moves and snaps on release", async ({
  page
}, testInfo) => {
  await page.addStyleTag({ content: ".react-grid-item { transition: none; }" });
  const item = page.locator(ITEM).first();
  const before = (await item.boundingBox())!;
  const handle = (await item
    .locator(".react-resizable-handle-se")
    .boundingBox())!;
  const x = handle.x + handle.width / 2;
  const y = handle.y + handle.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (const delta of [7, 13, 17]) {
    await page.mouse.move(x + delta, y + delta);
    await expect
      .poll(async () => (await item.boundingBox())!.width)
      .toBeCloseTo(before.width + delta, 1);
    expect((await item.boundingBox())!.height).toBeCloseTo(
      before.height + delta,
      1
    );
    const placeholder = page.locator("#grid-container .react-grid-placeholder");
    expect((await placeholder.boundingBox())!.width).toBeCloseTo(
      before.width,
      1
    );
    expect((await placeholder.boundingBox())!.height).toBeCloseTo(
      before.height,
      1
    );
  }
  await page.screenshot({ path: testInfo.outputPath("resize-live.png") });
  await page.mouse.up();
  await expect(
    page.locator("#grid-container .react-grid-placeholder")
  ).toHaveCount(0);
  await expect
    .poll(async () => (await item.boundingBox())!.width)
    .toBeCloseTo(before.width, 1);
  expect((await item.boundingBox())!.height).toBeCloseTo(before.height, 1);
  await page.screenshot({ path: testInfo.outputPath("resize-stopped.png") });
});
