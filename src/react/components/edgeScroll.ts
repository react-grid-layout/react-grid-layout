/**
 * Auto-scroll a scrollable container while the drag pointer nears its edge.
 *
 * #2232: neither v1 nor v2 ever scrolled the page/container while dragging.
 * The browser only auto-scrolls natively when the dragged element is not
 * `user-select:none`, which v2 removed in 2.1.0 for desktop — but a fixed
 * height grid whose rows overflow, or a touch drag, still needs the grid to
 * scroll an overflow:auto ancestor (or the window) as the pointer approaches
 * the edge.
 *
 * This module owns a single rAF loop per drag. createEdgeScrollController() is
 * called on the drag start, feed() on every drag move, and stop() on drag
 * stop/unmount. The loop reads the last pointer position and scrolls the
 * nearest scrollable element (the node itself or an ancestor) when the pointer
 * is within the edge threshold.
 */

export interface EdgeScrollController {
  /** Call on every drag move with the pointer's viewport coords. */
  feed(clientX: number, clientY: number): void;
  /** Stop the rAF loop. Safe to call multiple times. */
  stop(): void;
}

const EDGE_THRESHOLD = 50;
const SCROLL_STEP = 12;

function getNearestScrollable(
  node: HTMLElement | null
): HTMLElement | null {
  // Check the node itself first, then ancestors.
  let el: HTMLElement | null = node;
  while (el) {
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    const scrollable =
      (overflowY === "auto" || overflowY === "scroll") &&
      el.scrollHeight > el.clientHeight;
    if (scrollable) return el;
    el = el.parentElement;
  }
  return null;
}

export function createEdgeScrollController(
  node: HTMLElement | null
): EdgeScrollController {
  let scrollContainer: HTMLElement | null = getNearestScrollable(node);
  let rafId: number | null = null;
  let lastX = 0;
  let lastY = 0;
  let running = false;

  function step() {
    const container = scrollContainer;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const { clientHeight, scrollTop, scrollHeight } = container;
    const { scrollLeft, scrollWidth, clientWidth } = container;

    let dy = 0;
    let dx = 0;

    if (lastY < rect.top + EDGE_THRESHOLD && scrollTop > 0) {
      dy = -SCROLL_STEP;
    } else if (lastY > rect.bottom - EDGE_THRESHOLD && scrollTop + clientHeight < scrollHeight) {
      dy = SCROLL_STEP;
    }

    if (lastX < rect.left + EDGE_THRESHOLD && scrollLeft > 0) {
      dx = -SCROLL_STEP;
    } else if (lastX > rect.right - EDGE_THRESHOLD && scrollLeft + clientWidth < scrollWidth) {
      dx = SCROLL_STEP;
    }

    if (dy !== 0 || dx !== 0) {
      container.scrollTop += dy;
      container.scrollLeft += dx;
    }

    if (running) {
      rafId = requestAnimationFrame(step);
    }
  }

  return {
    feed(clientX: number, clientY: number) {
      lastX = clientX;
      lastY = clientY;
      if (!running) {
        running = true;
        rafId = requestAnimationFrame(step);
      }
    },
    stop() {
      running = false;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }
  };
}
