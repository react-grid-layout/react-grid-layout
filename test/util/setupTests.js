// @flow

import "@testing-library/jest-dom";

// We rely on sort() being deterministic for tests, but it changed from QuickSort to TimSort
// in Node 12. This breaks tests, so we monkey-patch it.
import { sort } from "timsort";

// $FlowIgnore dirty hack
Array.prototype.sort = function (comparator) {
  sort(this, comparator);
  return this;
};

// Required in drag code, not working in JSDOM
Object.defineProperty(HTMLElement.prototype, "offsetParent", {
  get() {
    // $FlowIgnore[object-this-reference]
    return this.parentNode;
  }
});

// Mock ResizeObserver for tests - controllable version
// Store observers so tests can trigger them
// $FlowIgnore[cannot-resolve-name] - test globals
global.__resizeObservers__ = [];

// $FlowIgnore[cannot-resolve-name] - mocking browser API for tests
global.ResizeObserver = class MockResizeObserver {
  callback: Function;
  observedElements: Array<HTMLElement>;

  constructor(callback: Function) {
    this.callback = callback;
    this.observedElements = [];
    // $FlowIgnore[cannot-resolve-name]
    global.__resizeObservers__.push(this);
  }

  observe(element: HTMLElement) {
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

  unobserve(element: HTMLElement) {
    this.observedElements = this.observedElements.filter(el => el !== element);
  }

  disconnect() {
    this.observedElements = [];
    // $FlowIgnore[cannot-resolve-name]
    const idx = global.__resizeObservers__.indexOf(this);
    // $FlowIgnore[cannot-resolve-name]
    if (idx !== -1) global.__resizeObservers__.splice(idx, 1);
  }

  // Helper for tests to trigger resize
  trigger(width: number, height: number) {
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
// $FlowIgnore[cannot-resolve-name] - test globals
global.triggerResize = (width: number, height: number = 0) => {
  // $FlowIgnore[cannot-resolve-name]
  global.__resizeObservers__.forEach(observer => {
    observer.trigger(width, height);
  });
};
