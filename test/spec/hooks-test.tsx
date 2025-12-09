/**
 * Unit tests for React hooks
 *
 * Tests the hooks exported from src/react/hooks/
 */

import React from "react";
import { renderHook } from "@testing-library/react";

import {
  useContainerWidth,
  useGridLayout,
  useResponsiveLayout,
  DEFAULT_BREAKPOINTS,
  DEFAULT_COLS
} from "../../src/react/hooks/index";

import type { Layout } from "../../src/core/types";

// Mock ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

describe("React Hooks", () => {
  describe("useContainerWidth", () => {
    it("returns containerRef and width", () => {
      const { result } = renderHook(() => useContainerWidth());

      expect(result.current).toHaveProperty("containerRef");
      expect(result.current).toHaveProperty("width");
      expect(result.current).toHaveProperty("mounted");
    });

    it("uses provided initial width", () => {
      const { result } = renderHook(() =>
        useContainerWidth({ initialWidth: 800 })
      );

      expect(result.current.width).toBe(800);
    });

    it("provides measureWidth function", () => {
      const { result } = renderHook(() => useContainerWidth());

      expect(typeof result.current.measureWidth).toBe("function");
    });
  });

  describe("useGridLayout", () => {
    const initialLayout: Layout = [
      { i: "a", x: 0, y: 0, w: 2, h: 2, static: false, moved: false },
      { i: "b", x: 2, y: 0, w: 2, h: 2, static: false, moved: false }
    ];

    it("returns layout state and actions", () => {
      const { result } = renderHook(() =>
        useGridLayout({
          layout: initialLayout,
          cols: 12,
          width: 1200
        })
      );

      expect(result.current).toHaveProperty("layout");
      expect(result.current).toHaveProperty("dragState");
      expect(result.current).toHaveProperty("resizeState");
      expect(result.current).toHaveProperty("dropState");
      expect(typeof result.current.onDragStart).toBe("function");
      expect(typeof result.current.onDragStop).toBe("function");
      expect(typeof result.current.onResizeStart).toBe("function");
      expect(typeof result.current.onResizeStop).toBe("function");
    });

    it("initializes with provided layout", () => {
      const { result } = renderHook(() =>
        useGridLayout({
          layout: initialLayout,
          cols: 12,
          width: 1200
        })
      );

      expect(result.current.layout).toHaveLength(2);
    });

    it("provides setLayout function", () => {
      const { result } = renderHook(() =>
        useGridLayout({
          layout: initialLayout,
          cols: 12,
          width: 1200
        })
      );

      expect(typeof result.current.setLayout).toBe("function");
    });

    it("handles empty layout", () => {
      const { result } = renderHook(() =>
        useGridLayout({
          layout: [],
          cols: 12,
          width: 1200
        })
      );

      expect(result.current.layout).toHaveLength(0);
    });

    it("provides containerHeight", () => {
      const { result } = renderHook(() =>
        useGridLayout({
          layout: initialLayout,
          cols: 12,
          width: 1200
        })
      );

      expect(typeof result.current.containerHeight).toBe("number");
    });
  });

  describe("useResponsiveLayout", () => {
    const layouts = {
      lg: [{ i: "a", x: 0, y: 0, w: 4, h: 2, static: false, moved: false }],
      md: [{ i: "a", x: 0, y: 0, w: 3, h: 2, static: false, moved: false }]
    };

    it("returns breakpoint and layout info", () => {
      const { result } = renderHook(() =>
        useResponsiveLayout({
          width: 1200,
          layouts
        })
      );

      expect(result.current).toHaveProperty("breakpoint");
      expect(result.current).toHaveProperty("cols");
      expect(result.current).toHaveProperty("layout");
    });

    it("determines breakpoint from width", () => {
      // lg breakpoint is 1200, so width > 1200 should be lg
      const { result } = renderHook(() =>
        useResponsiveLayout({
          width: 1201,
          layouts
        })
      );

      expect(result.current.breakpoint).toBe("lg");
    });

    it("uses default breakpoints", () => {
      const { result } = renderHook(() =>
        useResponsiveLayout({
          width: 1200,
          layouts
        })
      );

      expect(result.current.breakpoint).toBeDefined();
    });
  });

  describe("Default exports", () => {
    it("exports DEFAULT_BREAKPOINTS", () => {
      expect(DEFAULT_BREAKPOINTS).toBeDefined();
      expect(DEFAULT_BREAKPOINTS).toHaveProperty("lg");
      expect(DEFAULT_BREAKPOINTS).toHaveProperty("md");
    });

    it("exports DEFAULT_COLS", () => {
      expect(DEFAULT_COLS).toBeDefined();
      expect(DEFAULT_COLS).toHaveProperty("lg");
      expect(DEFAULT_COLS).toHaveProperty("md");
    });
  });
});
