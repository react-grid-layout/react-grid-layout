import { expect, type Page, type TestInfo } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

declare global {
  interface Window {
    __rgl: any;
  }
}
export async function openScenario(
  page: Page,
  id: string,
  variant = "none",
  prefix = ""
) {
  await page.goto(`/${prefix}index.html?scenario=${id}&variant=${variant}`);
  await expect.poll(() => page.evaluate(() => window.__rgl?.ready)).toBe(true);
  await sample(page, "mount");
}
export async function sample(page: Page, input: string, frame = false) {
  const before = await page.evaluate(() => window.__rgl.frames.length);
  await page.evaluate(
    async ({ input, frame }) => window.__rgl.sample(input, frame),
    { input, frame }
  );
  await expect
    .poll(() => page.evaluate(() => window.__rgl.frames.length))
    .toBe(before + Number(frame));
}
export async function cellDelta(page: Page, x: number, y: number) {
  return page.evaluate(
    ({ x, y }) => {
      const a = window.__rgl.cellToClient(0, 0);
      const b = window.__rgl.cellToClient(x, y);
      return { x: b.x - a.x, y: b.y - a.y };
    },
    { x, y }
  );
}
export async function gesture(
  page: Page,
  moves: number[][],
  axis?: string,
  origin = [0.2, 0.2],
  checkPreview: boolean | "first" = false,
  mid?: () => Promise<void>
) {
  const selector = `#scenario-grid [data-item="a"]${axis ? ` .react-resizable-handle-${axis}` : ""}`;
  const start = await page.locator(selector).evaluate((node, origin) => {
    const rect = node.getBoundingClientRect();
    const zero = window.__rgl.cellToClient(0, 0);
    const at = window.__rgl.cellToClient(origin[0], origin[1]);
    return node.classList.contains("react-resizable-handle")
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : { x: rect.left + at.x - zero.x, y: rect.top + at.y - zero.y };
  }, origin);
  const before = (await page
    .locator('#scenario-grid [data-item="a"]')
    .boundingBox())!;
  await page.mouse.move(start.x, start.y, { steps: 1 });
  await page.mouse.down();
  const pointerStart = await page.evaluate(() => window.__rgl.pointer);
  const scale = await page.evaluate(() => window.__rgl.scale);
  await sample(page, "down");
  for (const [index, [x, y]] of moves.entries()) {
    const delta = await cellDelta(page, x, y);
    await page.mouse.move(start.x + delta.x, start.y + delta.y, { steps: 1 });
    await sample(page, "move", true);
    if (checkPreview && (checkPreview === true || index === 0)) {
      const box = (await page
        .locator('#scenario-grid [data-item="a"]')
        .boundingBox())!;
      // Chromium quantizes native mouse coordinates; compare the preview to
      // the delivered event, retaining RGL's logical-pixel rounding.
      const pointer = await page.evaluate(() => window.__rgl.pointer);
      const dx = pointer.x - pointerStart.x;
      const dy = pointer.y - pointerStart.y;
      const rounded = (value: number) => Math.round(value / scale) * scale;
      const west = axis?.includes("w");
      const north = axis?.includes("n");
      expect(box.x).toBeCloseTo(
        rounded(before.x + (!axis || west ? dx : 0)),
        1
      );
      expect(box.y).toBeCloseTo(
        rounded(before.y + (!axis || north ? dy : 0)),
        1
      );
      expect(box.width).toBeCloseTo(
        rounded(before.width + (axis ? (west ? -dx : dx) : 0)),
        1
      );
      expect(box.height).toBeCloseTo(
        rounded(before.height + (axis ? (north ? -dy : dy) : 0)),
        1
      );
    }
    if (index === 0) await mid?.();
  }
  await page.mouse.up();
  await sample(page, "up");
}
export async function screenshot(page: Page, info: TestInfo, name: string) {
  await info.attach(name, {
    body: await page.screenshot(),
    contentType: "image/png"
  });
}
export async function artifacts(page: Page, info: TestInfo) {
  const trace = await page.evaluate(() => window.__rgl?.trace);
  if (trace)
    await info.attach("trace.json", {
      body: JSON.stringify(trace, null, 2),
      contentType: "application/json"
    });
}
export async function frameBaseline(page: Page, info: TestInfo, key: string) {
  const frames = await page.evaluate(() => window.__rgl.frames);
  expect(frames.length).toBeGreaterThan(0);
  const file = path.join(__dirname, "__frames__", `${key}.json`);
  const manifest = path.join(__dirname, "__frames__", "manifest.json");
  if (process.env.RGL_RECORD_FRAMES === "1") {
    if (process.platform !== "linux")
      throw new Error(
        "Frame baselines must be recorded on the Linux Playwright image"
      );
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(
      file,
      JSON.stringify(
        { platform: "linux", playwright: info.config.version, frames },
        null,
        2
      ) + "\n"
    );
  } else if (fs.existsSync(file)) {
    const baseline = JSON.parse(fs.readFileSync(file, "utf8"));
    expect(baseline.platform).toBe("linux");
    expect(baseline.playwright).toBe(info.config.version);
    expect(frames).toEqual(baseline.frames);
  } else {
    if (fs.existsSync(manifest))
      throw new Error(`Missing recorded frame baseline: ${key}`);
    info.annotations.push({ type: "missing-linux-baseline", description: key });
  }
}
export const gridLayout = (layout: any[]) =>
  layout.map(({ i, x, y, w, h }) => ({ i, x, y, w, h }));
export function layoutCallbacks(callbacks: any[]) {
  return callbacks.flatMap(cb => {
    const layout =
      cb.layout || (cb.name === "onLayoutChange" ? cb.args?.[0] : null);
    return Array.isArray(layout)
      ? [{ name: cb.name, layout: gridLayout(layout) }]
      : [];
  });
}
export async function touch(page: Page, type: string, x: number, y: number) {
  await page.evaluate(
    ({ type, x, y }) => {
      const target = document.querySelector("#touch-source")!;
      const point = new Touch({
        identifier: 1,
        target,
        clientX: x,
        clientY: y,
        pageX: x,
        pageY: y
      });
      const active = type !== "touchend" && type !== "touchcancel";
      target.dispatchEvent(
        new TouchEvent(type, {
          bubbles: true,
          cancelable: true,
          touches: active ? [point] : [],
          targetTouches: active ? [point] : [],
          changedTouches: [point]
        })
      );
    },
    { type, x, y }
  );
  await sample(page, type, type === "touchmove");
}
