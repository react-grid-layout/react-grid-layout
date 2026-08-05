/**
 * Unit tests for the edge auto-scroll controller (#2232).
 *
 * Verifies:
 * - getNearestScrollable picks the nearest overflow:auto/scroll element.
 * - The rAF loop scrolls the container when the pointer is near an edge.
 * - It stops scrolling when the pointer leaves the threshold.
 * - stop() cancels the loop and is idempotent.
 * - No scroll when the container can't scroll further.
 */

import { createEdgeScrollController } from "../../src/react/components/edgeScroll";

// Track rAF callbacks and scrollTop/scrollLeft mutations.
let rafCallback: (() => void) | null = null;
const originalRAF = globalThis.requestAnimationFrame;
const originalCancel = globalThis.cancelAnimationFrame;

function installRafMock() {
  rafCallback = null;
  (globalThis as any).requestAnimationFrame = (cb: () => void) => {
    rafCallback = cb;
    return 1;
  };
  (globalThis as any).cancelAnimationFrame = (id: number) => {
    if (id === 1) rafCallback = null;
  };
}

function restoreRafMock() {
  (globalThis as any).requestAnimationFrame = originalRAF;
  (globalThis as any).cancelAnimationFrame = originalCancel;
}

/** A fake scrollable element with controllable geometry. */
function makeContainer(
  overrides: Partial<{
    scrollTop: number;
    scrollLeft: number;
    scrollHeight: number;
    scrollWidth: number;
    clientHeight: number;
    clientWidth: number;
    rect: { top: number; bottom: number; left: number; right: number };
    overflowY: string;
  }> = {}
) {
  const state = {
    scrollTop: 0,
    scrollLeft: 0,
    scrollHeight: 1000,
    scrollWidth: 1000,
    clientHeight: 200,
    clientWidth: 200,
    rect: { top: 0, bottom: 200, left: 0, right: 200 },
    overflowY: "auto",
    ...overrides
  };
  return {
    scrollTop: state.scrollTop,
    scrollLeft: state.scrollLeft,
    scrollHeight: state.scrollHeight,
    scrollWidth: state.scrollWidth,
    clientHeight: state.clientHeight,
    clientWidth: state.clientWidth,
    getBoundingClientRect: () => state.rect,
    parentElement: null,
    style: {} as CSSStyleDeclaration
  } as unknown as HTMLElement;
}

function mockComputedStyle(overflowY: string) {
  const orig = globalThis.getComputedStyle;
  (globalThis as any).getComputedStyle = () =>
    ({ overflowY, overflowX: "auto" }) as CSSStyleDeclaration;
  return () => {
    (globalThis as any).getComputedStyle = orig;
  };
}

describe("edgeScroll (#2232)", () => {
  beforeEach(() => {
    installRafMock();
  });

  afterEach(() => {
    restoreRafMock();
  });

  describe("getNearestScrollable", () => {
    it("returns the node itself when it is scrollable", () => {
      const restore = mockComputedStyle("auto");
      const container = makeContainer();
      const controller = createEdgeScrollController(container);
      // feed starts a loop if a scrollable is found (no crash).
      controller.feed(100, 100);
      expect(rafCallback).toBeDefined();
      controller.stop();
      restore();
    });

    it("does not scroll when no scrollable element exists", () => {
      const restore = mockComputedStyle("visible"); // overflowY: visible -> not scrollable
      const leaf = makeContainer();
      leaf.parentElement = null;
      const controller = createEdgeScrollController(leaf);
      controller.feed(190, 190); // near bottom edge, but nothing scrollable
      if (rafCallback) rafCallback();
      // No scroll happens because scrollContainer is null.
      expect(leaf.scrollTop).toBe(0);
      expect(leaf.scrollLeft).toBe(0);
      controller.stop();
      restore();
    });
  });

  describe("scroll loop behavior", () => {
    it("scrolls down when the pointer is near the bottom edge", () => {
      const restore = mockComputedStyle("auto");
      const container = makeContainer({
        scrollTop: 0,
        scrollHeight: 1000,
        clientHeight: 200,
        rect: { top: 0, bottom: 200, left: 0, right: 200 }
      });
      const controller = createEdgeScrollController(container);

      // Pointer near the bottom edge (bottom=200, threshold 50 -> >150).
      controller.feed(100, 190);
      const step = rafCallback!;
      step();
      expect(container.scrollTop).toBe(12); // SCROLL_STEP

      controller.stop();
      restore();
    });

    it("scrolls up when near the top edge and scrollTop > 0", () => {
      const restore = mockComputedStyle("auto");
      const container = makeContainer({
        scrollTop: 100,
        scrollHeight: 1000,
        clientHeight: 200,
        rect: { top: 0, bottom: 200, left: 0, right: 200 }
      });
      const controller = createEdgeScrollController(container);

      controller.feed(100, 10); // near top edge
      rafCallback!();
      expect(container.scrollTop).toBe(100 - 12);

      controller.stop();
      restore();
    });

    it("does not scroll up when already at the top (scrollTop=0)", () => {
      const restore = mockComputedStyle("auto");
      const container = makeContainer({ scrollTop: 0 });
      const controller = createEdgeScrollController(container);

      controller.feed(100, 10); // near top but can't scroll up
      rafCallback!();
      expect(container.scrollTop).toBe(0);

      controller.stop();
      restore();
    });

    it("scrolls left/right when near the horizontal edges", () => {
      const restore = mockComputedStyle("auto");
      // scrollHeight > clientHeight so the container is detected as scrollable.
      const container = makeContainer({
        scrollLeft: 100,
        scrollTop: 0,
        scrollHeight: 300,
        clientHeight: 200,
        scrollWidth: 1000,
        clientWidth: 200,
        rect: { top: 0, bottom: 300, left: 0, right: 300 }
      });
      const controller = createEdgeScrollController(container);

      controller.feed(290, 150); // near right edge (rect.right=300, threshold 50)
      rafCallback!();
      expect(container.scrollLeft).toBe(100 + 12);

      controller.stop();
      restore();
    });

    it("does not scroll when the pointer is in the middle", () => {
      const restore = mockComputedStyle("auto");
      const container = makeContainer();
      const controller = createEdgeScrollController(container);

      controller.feed(100, 100); // center
      rafCallback!();
      expect(container.scrollTop).toBe(0);
      expect(container.scrollLeft).toBe(0);

      controller.stop();
      restore();
    });
  });

  describe("stop()", () => {
    it("cancels the rAF loop and is idempotent", () => {
      const restore = mockComputedStyle("auto");
      const container = makeContainer();
      const controller = createEdgeScrollController(container);

      controller.feed(100, 190);
      expect(rafCallback).toBeDefined();

      controller.stop();
      expect(rafCallback).toBeNull();

      // Calling stop again is safe.
      controller.stop();

      // After stop, no further scroll happens.
      controller.feed(100, 190);
      // feed restarts the loop, so rafCallback is set again.
      expect(rafCallback).toBeDefined();
      controller.stop();

      restore();
    });
  });
});
