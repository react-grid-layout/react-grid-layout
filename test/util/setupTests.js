import "@testing-library/jest-dom";

// We rely on sort() being deterministic for tests, but it changed from QuickSort to TimSort
// in Node 12. This breaks tests, so we monkey-patch it.
import { sort } from "timsort";

Array.prototype.sort = function (comparator) {
  sort(this, comparator);
  return this;
};

// Required in drag code, not working in JSDOM
Object.defineProperty(HTMLElement.prototype, "offsetParent", {
  get() {
    return this.parentNode;
  }
});

// Mock ResizeObserver for tests - controllable version
// Store observers so tests can trigger them
global.__resizeObservers__ = [];

global.ResizeObserver = class MockResizeObserver {
  constructor(callback) {
    this.callback = callback;
    this.observedElements = [];
    global.__resizeObservers__.push(this);
  }

  observe(element) {
    this.observedElements.push(element);
    // Immediately trigger with the element's current size (like real ResizeObserver)
    const width = element.offsetWidth || 0;
    const height = element.offsetHeight || 0;
    this.callback([
      {
        target: element,
        contentRect: {
          width,
          height,
          top: 0,
          left: 0,
          bottom: height,
          right: width
        }
      }
    ]);
  }

  unobserve(element) {
    this.observedElements = this.observedElements.filter(el => el !== element);
  }

  disconnect() {
    this.observedElements = [];
    const idx = global.__resizeObservers__.indexOf(this);
    if (idx !== -1) global.__resizeObservers__.splice(idx, 1);
  }

  // Helper for tests to trigger resize
  trigger(width, height) {
    this.observedElements.forEach(element => {
      this.callback([
        {
          target: element,
          contentRect: {
            width,
            height,
            top: 0,
            left: 0,
            bottom: height,
            right: width
          }
        }
      ]);
    });
  }
};

// Helper to trigger all resize observers with a new width
global.triggerResize = (width, height = 0) => {
  global.__resizeObservers__.forEach(observer => {
    observer.trigger(width, height);
  });
};

// Mock requestAnimationFrame and cancelAnimationFrame for tests
// Execute callbacks synchronously to avoid timing issues in tests (#1959)
let rafId = 0;
const rafCallbacks = new Map();

global.requestAnimationFrame = callback => {
  const id = ++rafId;
  // Execute synchronously in tests (jsdom default behavior)
  // This ensures state updates happen within the same act() block
  callback(performance.now());
  return id;
};

global.cancelAnimationFrame = id => {
  rafCallbacks.delete(id);
};
