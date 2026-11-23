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
 * nearest scrollable element on each axis when the pointer
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

function getScrollContainers(node: HTMLElement | null) {
  const horizontal: HTMLElement[] = [];
  const vertical: HTMLElement[] = [];
  for (let el = node; el; el = el.parentElement) {
    const { overflowX, overflowY } = window.getComputedStyle(el);
    if (overflowX === "auto" || overflowX === "scroll") horizontal.push(el);
    if (overflowY === "auto" || overflowY === "scroll") vertical.push(el);
  }
  return { horizontal, vertical };
}

export function createEdgeScrollController(
  node: HTMLElement | null
): EdgeScrollController {
  const candidates = getScrollContainers(node);
  let rafId: number | null = null;
  let lastX = 0;
  let lastY = 0;
  let running = false;

  function step() {
    // Dragging can create overflow after the controller starts.
    const horizontal = candidates.horizontal.find(
      el => el.scrollWidth > el.clientWidth
    );
    const vertical = candidates.vertical.find(
      el => el.scrollHeight > el.clientHeight
    );

    const horizontalRect = horizontal?.getBoundingClientRect();
    const verticalRect =
      vertical === horizontal
        ? horizontalRect
        : vertical?.getBoundingClientRect();

    if (vertical && verticalRect) {
      const { clientHeight, scrollTop, scrollHeight } = vertical;
      if (lastY < verticalRect.top + EDGE_THRESHOLD && scrollTop > 0) {
        vertical.scrollTop -= SCROLL_STEP;
      } else if (
        lastY > verticalRect.bottom - EDGE_THRESHOLD &&
        scrollTop + clientHeight < scrollHeight
      ) {
        vertical.scrollTop += SCROLL_STEP;
      }
    }
    if (horizontal && horizontalRect) {
      const { clientWidth, scrollLeft, scrollWidth } = horizontal;
      if (lastX < horizontalRect.left + EDGE_THRESHOLD && scrollLeft > 0) {
        horizontal.scrollLeft -= SCROLL_STEP;
      } else if (
        lastX > horizontalRect.right - EDGE_THRESHOLD &&
        scrollLeft + clientWidth < scrollWidth
      ) {
        horizontal.scrollLeft += SCROLL_STEP;
      }
    }

    if (running) {
      rafId = requestAnimationFrame(step);
    }
  }

  return {
    feed(clientX: number, clientY: number) {
      lastX = clientX;
      lastY = clientY;
      if (
        !running &&
        (candidates.horizontal.length || candidates.vertical.length)
      ) {
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
