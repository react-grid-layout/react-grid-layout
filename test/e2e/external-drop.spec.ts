import { test, expect } from "@playwright/test";

test.use({ hasTouch: true });

for (const input of ["mouse", "touch"]) {
  test(`an external ${input} drag pushes the topmost item before committing above it`, async ({
    page,
    context
  }) => {
    await page.goto("/index.html");
    const grid = page.locator("#touch-drop-container > .react-grid-layout");
    const first = grid.locator(".grid-item").filter({ hasText: /^a$/ });
    await grid.scrollIntoViewIfNeeded();
    const gridBox = (await grid.boundingBox())!;
    const original = (await first.boundingBox())!;
    const source = (await page
      .locator(input === "mouse" ? "#external-source" : "#touch-source")
      .boundingBox())!;
    const cdp =
      input === "touch" ? await context.newCDPSession(page) : undefined;

    if (cdp) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [
          { x: source.x + 30, y: source.y + source.height / 2, id: 1 }
        ]
      });
      for (const x of [850, 40]) {
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: gridBox.x + x, y: gridBox.y + 25, id: 1 }]
        });
      }
    } else {
      await page.mouse.move(source.x + 30, source.y + source.height / 2);
      await page.mouse.down();
      // Enter through an empty column, then move the placeholder over item a.
      await page.mouse.move(gridBox.x + 850, gridBox.y + 25, { steps: 10 });
      await page.mouse.move(gridBox.x + 40, gridBox.y + 25, { steps: 10 });
    }

    await expect
      .poll(async () => (await first.boundingBox())!.y)
      .toBeGreaterThan(original.y + 30);
    await test
      .info()
      .attach("external-drop-preview", {
        body: await grid.screenshot(),
        contentType: "image/png"
      });
    if (cdp) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: []
      });
    } else {
      // The pushed item moved away from the pointer. Send dragover to the exposed grid before releasing.
      await page.mouse.move(gridBox.x + 41, gridBox.y + 25);
      await page.mouse.up();
    }

    const state = page.locator("#drop-layout-state");
    await expect
      .poll(async () => JSON.parse((await state.textContent())!))
      .toEqual(
        expect.arrayContaining([
          expect.objectContaining({ i: "__dropping-elem__", x: 0, y: 0 }),
          expect.objectContaining({ i: "a", x: 0, y: 1 })
        ])
      );
  });
}
