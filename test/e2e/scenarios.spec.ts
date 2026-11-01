import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import {
  browserScenarios,
  resizeAxes,
  liveDeltas,
  desktopDropCells
} from "../golden-react/scenarioDefinitions";
import {
  openScenario,
  gesture,
  artifacts,
  screenshot,
  frameBaseline,
  layoutCallbacks,
  gridLayout,
  sample,
  cellDelta
} from "./scenarioDriver";
import divergences from "./known-browser-divergences.json";

test.afterEach(async ({ page }, info) => {
  await artifacts(page, info);
});
for (const scenario of browserScenarios) {
  for (const variant of scenario.variants) {
    const key = `${scenario.id}.${variant.name}`;
    test(`${key}: browser grid layouts match jsdom`, async ({ page }, info) => {
      await openScenario(page, scenario.id, variant.name);
      await screenshot(page, info, "start");
      for (const input of scenario.gestures)
        await gesture(
          page,
          input.moves,
          input.axis,
          input.origin,
          "first",
          () => screenshot(page, info, "mid-gesture")
        );
      await screenshot(page, info, "end");
      const trace = await page.evaluate(() => window.__rgl.trace);
      const actual = trace
        .slice(1)
        .map((step: any) => layoutCallbacks(step.callbacks));
      const golden = JSON.parse(
        fs.readFileSync(
          path.join(
            __dirname,
            "../golden-react/__golden__",
            `${key}.trace.json`
          ),
          "utf8"
        )
      );
      const expected = golden.steps
        .filter((step: any) => step.input.kind === "mouse")
        .map((step: any) => layoutCallbacks(step.callbacks));
      const differences = actual.flatMap((callbacks: any, step: number) =>
        JSON.stringify(callbacks) === JSON.stringify(expected[step])
          ? []
          : [{ step, expected: expected[step], actual: callbacks }]
      );
      expect(actual).toHaveLength(expected.length);
      const known = (divergences as Record<string, any>)[key];
      if (process.env.RGL_INSPECT_DIVERGENCES === "1")
        fs.writeFileSync(
          info.outputPath("divergences.json"),
          JSON.stringify({ key, differences }, null, 2)
        );
      if (known) {
        expect(known.reason).toBeTruthy();
        expect(known.issue).toBeTruthy();
        expect(differences).toEqual(known.differences);
      } else expect(differences).toEqual([]);
      await frameBaseline(page, info, key);
    });
  }
}
// Independent RX-1 oracle: sub-cell deltas must reach the DOM before release.
// These exercise every anchor, including the CSS scale and padding paths.
for (const axis of ["drag", ...resizeAxes]) {
  for (const variant of ["none", "absolute", "scaled", "scaled-padding"]) {
    test(`preview-${axis}.${variant}: follows every sub-cell move`, async ({
      page
    }, info) => {
      await openScenario(page, `preview-${axis}`, variant);
      await screenshot(page, info, "start");
      const handle = axis === "drag" ? undefined : axis;
      const moves = liveDeltas.map(d => [
        axis.includes("w") ? -d : axis === "drag" || axis.includes("e") ? d : 0,
        axis.includes("n") ? -d : axis === "drag" || axis.includes("s") ? d : 0
      ]);
      await gesture(page, moves, handle, [0.05, 0.05], true, () =>
        screenshot(page, info, "mid-gesture")
      );
      await screenshot(page, info, "end");
      await frameBaseline(page, info, `preview-${axis}.${variant}`);
    });
  }
}

test("breakpoint crossing uses viewport width and restores the large layout", async ({
  page
}, info) => {
  await openScenario(page, "breakpoint-crossing");
  await screenshot(page, info, "start");
  const large = await page.evaluate(() => window.__rgl.layout);
  await page.setViewportSize({ width: 420, height: 800 });
  await expect
    .poll(() => page.evaluate(() => window.__rgl.breakpoint))
    .toBe("sm");
  await sample(page, "small-viewport", true);
  const small = await page.evaluate(() => window.__rgl.layout);
  expect(small.every((i: any) => i.x + i.w <= 3)).toBe(true);
  await screenshot(page, info, "mid-gesture");
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect
    .poll(() => page.evaluate(() => window.__rgl.breakpoint))
    .toBe("lg");
  await sample(page, "large-viewport", true);
  expect(gridLayout(await page.evaluate(() => window.__rgl.layout))).toEqual(
    gridLayout(large)
  );
  await screenshot(page, info, "end");
});

test("edge drag scrolls the nearest #scroll-container", async ({
  page
}, info) => {
  await openScenario(page, "edge-scroll");
  await screenshot(page, info, "start");
  const start = await page.evaluate(() => window.__rgl.cellToClient(0.2, 0.2));
  await page.mouse.move(start.x, start.y, { steps: 1 });
  await page.mouse.down();
  const delta = await cellDelta(page, 0, 2.6);
  await page.mouse.move(start.x, start.y + delta.y, { steps: 4 });
  await sample(page, "edge-move", true);
  await screenshot(page, info, "mid-gesture");
  await expect
    .poll(() =>
      page.locator("#scroll-container").evaluate(node => node.scrollTop)
    )
    .toBeGreaterThan(0);
  await page.mouse.up();
  await sample(page, "up");
  await screenshot(page, info, "end");
});

test("HTML5 DataTransfer hover commits a drop", async ({ page }, info) => {
  await openScenario(page, "html5-drop", "vertical");
  await screenshot(page, info, "start");
  const transfer = await page.evaluateHandle(() => new DataTransfer());
  const grid = page.locator("#scenario-grid .react-grid-layout");
  for (const [index, [x, y]] of desktopDropCells.entries()) {
    const at = await page.evaluate(
      ({ x, y }) => window.__rgl.cellToClient(x, y),
      { x, y }
    );
    await grid.dispatchEvent(index === 0 ? "dragenter" : "dragover", {
      dataTransfer: transfer,
      clientX: at.x,
      clientY: at.y
    });
    await grid.dispatchEvent("dragover", {
      dataTransfer: transfer,
      clientX: at.x,
      clientY: at.y
    });
    await sample(page, "dragover", true);
  }
  await expect(page.locator(".dropping")).toHaveCount(1);
  await screenshot(page, info, "mid-gesture");
  await grid.dispatchEvent("drop", { dataTransfer: transfer });
  await sample(page, "drop");
  const drops = await page.evaluate(() =>
    window.__rgl.trace
      .flatMap((s: any) => s.callbacks)
      .filter((cb: any) => cb.name === "onDrop")
  );
  expect(drops).toHaveLength(1);
  const golden = JSON.parse(
    fs.readFileSync(
      path.join(
        __dirname,
        "../golden-react/__golden__/external-desktop-drop.vertical.trace.json"
      ),
      "utf8"
    )
  );
  const expectedDrop = golden.steps
    .flatMap((s: any) => s.callbacks)
    .find((cb: any) => cb.name === "onDrop");
  expect(gridLayout(drops[0].layout)).toEqual(gridLayout(expectedDrop.layout));
  expect(drops[0].layout.some((i: any) => i.i === "__dropping-elem__")).toBe(
    true
  );
  await expect(page.locator(".dropping")).toHaveCount(0);
  await screenshot(page, info, "end");
  await transfer.dispose();
});
