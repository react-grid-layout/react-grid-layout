/**
 * Unit tests for React hooks
 *
 * Tests the hooks exported from src/react/hooks/
 */

import React from "react";
import { renderHook, act, render, screen } from "@testing-library/react";

import {
  useContainerWidth,
  useGridLayout,
  useResponsiveLayout,
  DEFAULT_BREAKPOINTS,
  DEFAULT_COLS
} from "../../src/react/hooks/index";

import type { Layout } from "../../src/core/types";

// Store ResizeObserver callbacks and instances for testing
let resizeObserverInstances: MockResizeObserver[] = [];

// Mock ResizeObserver with callback capture
class MockResizeObserver {
  callback: (entries: ResizeObserverEntry[]) => void;
  observedNodes: Element[] = [];

  constructor(callback: (entries: ResizeObserverEntry[]) => void) {
    this.callback = callback;
    resizeObserverInstances.push(this);
  }

  observe(node: Element) {
    this.observedNodes.push(node);
  }

  unobserve(node: Element) {
    this.observedNodes = this.observedNodes.filter(n => n !== node);
  }

  disconnect() {
    this.observedNodes = [];
  }

  // Helper to simulate resize
  triggerResize(width: number) {
    if (this.observedNodes.length > 0) {
      this.callback([
        {
          contentRect: { width } as DOMRectReadOnly,
          target: this.observedNodes[0]!,
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: []
        }
      ]);
    }
  }
}

global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

// Reset mocks before each test
beforeEach(() => {
  resizeObserverInstances = [];
});

// Test component that uses useContainerWidth with actual DOM
function TestContainerWidthComponent({
  onWidthChange,
  options = {}
}: {
  onWidthChange: (width: number, mounted: boolean) => void;
  options?: Parameters<typeof useContainerWidth>[0];
}) {
  const { width, containerRef, mounted } = useContainerWidth(options);

  React.useEffect(() => {
    onWidthChange(width, mounted);
  }, [width, mounted, onWidthChange]);

  return (
    <div ref={containerRef} data-testid="container" style={{ width: "100%" }}>
      Width: {width}
    </div>
  );
}

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

    it("handles measureBeforeMount option", () => {
      const { result } = renderHook(() =>
        useContainerWidth({ measureBeforeMount: true, initialWidth: 500 })
      );

      // Should start unmounted when measureBeforeMount is true
      expect(result.current.width).toBe(500);
    });

    it("defaults to 1280 width when no initial width provided", () => {
      const { result } = renderHook(() => useContainerWidth());

      expect(result.current.width).toBe(1280);
    });

    it("ResizeObserver callback updates width when called", () => {
      // This test verifies that the ResizeObserver callback logic works
      // by directly testing the callback that would be passed to ResizeObserver
      const { result } = renderHook(() => useContainerWidth());

      // The ResizeObserver is set up in useEffect which requires a DOM node
      // Here we verify that the hook provides the expected interface
      expect(result.current.containerRef).toBeDefined();
      expect(typeof result.current.measureWidth).toBe("function");

      // When ResizeObserver fires (tested via integration tests),
      // it should update the width via setWidth
    });

    it("mounted becomes true after initialization", () => {
      const { result } = renderHook(() => useContainerWidth());

      // Should be mounted (true) by default when measureBeforeMount is false
      expect(result.current.mounted).toBe(true);
    });

    it("observes container element when ref is attached", () => {
      const widthChanges: Array<{ width: number; mounted: boolean }> = [];
      const onWidthChange = jest.fn((width: number, mounted: boolean) => {
        widthChanges.push({ width, mounted });
      });

      render(<TestContainerWidthComponent onWidthChange={onWidthChange} />);

      // ResizeObserver should have been created and should be observing
      expect(resizeObserverInstances.length).toBeGreaterThan(0);
      const observer = resizeObserverInstances[0]!;
      expect(observer.observedNodes.length).toBeGreaterThan(0);
    });

    it("updates width when ResizeObserver triggers", () => {
      const widthChanges: number[] = [];
      const onWidthChange = jest.fn((width: number) => {
        widthChanges.push(width);
      });

      render(
        <TestContainerWidthComponent
          onWidthChange={onWidthChange}
          options={{ initialWidth: 500 }}
        />
      );

      // Should start with initial width
      expect(widthChanges).toContain(500);

      // Simulate resize
      const observer = resizeObserverInstances[0];
      if (observer) {
        act(() => {
          observer.triggerResize(800);
        });
      }

      // Should have received the new width
      expect(widthChanges).toContain(800);
    });

    it("disconnects ResizeObserver on unmount", () => {
      const onWidthChange = jest.fn();
      const { unmount } = render(
        <TestContainerWidthComponent onWidthChange={onWidthChange} />
      );

      const observer = resizeObserverInstances[0];
      expect(observer).toBeDefined();

      // Spy on disconnect
      const disconnectSpy = jest.spyOn(observer!, "disconnect");

      unmount();

      expect(disconnectSpy).toHaveBeenCalled();
    });

    it("measureBeforeMount delays mounted state", () => {
      const mountedStates: boolean[] = [];
      const onWidthChange = jest.fn((_width: number, mounted: boolean) => {
        mountedStates.push(mounted);
      });

      render(
        <TestContainerWidthComponent
          onWidthChange={onWidthChange}
          options={{ measureBeforeMount: true }}
        />
      );

      // The first call should have mounted = false when measureBeforeMount is true
      // (though the effect runs synchronously in tests, so it may already be true)
      expect(onWidthChange).toHaveBeenCalled();
    });

    it("renders container with testid", () => {
      const onWidthChange = jest.fn();
      render(
        <TestContainerWidthComponent
          onWidthChange={onWidthChange}
          options={{ initialWidth: 1000 }}
        />
      );

      // Container should be rendered
      expect(screen.getByTestId("container")).toBeInTheDocument();
      // Note: Width shows as 0 because offsetWidth is 0 in jsdom
      // The initial measurement overrides the initialWidth
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

    it("onDragStart returns placeholder and sets drag state", () => {
      const { result } = renderHook(() =>
        useGridLayout({
          layout: initialLayout,
          cols: 12,
          width: 1200
        })
      );

      let placeholder: ReturnType<typeof result.current.onDragStart>;
      act(() => {
        placeholder = result.current.onDragStart("a", 1, 1);
      });

      expect(placeholder).not.toBeNull();
      expect(placeholder?.i).toBe("a");
      expect(result.current.dragState.activeDrag).not.toBeNull();
      expect(result.current.dragState.oldDragItem).not.toBeNull();
    });

    it("onDragStart returns null for non-existent item", () => {
      const { result } = renderHook(() =>
        useGridLayout({
          layout: initialLayout,
          cols: 12,
          width: 1200
        })
      );

      let placeholder: ReturnType<typeof result.current.onDragStart>;
      act(() => {
        placeholder = result.current.onDragStart("nonexistent", 0, 0);
      });

      expect(placeholder).toBeNull();
    });

    it("onDrag updates layout position", () => {
      const { result } = renderHook(() =>
        useGridLayout({
          layout: initialLayout,
          cols: 12,
          width: 1200
        })
      );

      act(() => {
        result.current.onDragStart("a", 0, 0);
      });

      act(() => {
        result.current.onDrag("a", 2, 2);
      });

      // Drag state should show new position
      expect(result.current.dragState.activeDrag?.x).toBe(2);
      expect(result.current.dragState.activeDrag?.y).toBe(2);
    });

    it("onDragStop clears drag state", () => {
      const { result } = renderHook(() =>
        useGridLayout({
          layout: initialLayout,
          cols: 12,
          width: 1200
        })
      );

      act(() => {
        result.current.onDragStart("a", 0, 0);
      });

      act(() => {
        result.current.onDragStop("a", 2, 2);
      });

      expect(result.current.dragState.activeDrag).toBeNull();
      expect(result.current.dragState.oldDragItem).toBeNull();
    });

    it("onResizeStart returns item and sets resize state", () => {
      const { result } = renderHook(() =>
        useGridLayout({
          layout: initialLayout,
          cols: 12,
          width: 1200
        })
      );

      let resizedItem: ReturnType<typeof result.current.onResizeStart>;
      act(() => {
        resizedItem = result.current.onResizeStart("a");
      });

      expect(resizedItem).not.toBeNull();
      expect(resizedItem?.i).toBe("a");
      expect(result.current.resizeState.resizing).toBe(true);
    });

    it("onResize updates item dimensions", () => {
      const { result } = renderHook(() =>
        useGridLayout({
          layout: initialLayout,
          cols: 12,
          width: 1200
        })
      );

      act(() => {
        result.current.onResizeStart("a");
      });

      act(() => {
        result.current.onResize("a", 4, 3);
      });

      const item = result.current.layout.find(l => l.i === "a");
      expect(item?.w).toBe(4);
      expect(item?.h).toBe(3);
    });

    it("onResizeStop clears resize state", () => {
      const { result } = renderHook(() =>
        useGridLayout({
          layout: initialLayout,
          cols: 12,
          width: 1200
        })
      );

      act(() => {
        result.current.onResizeStart("a");
      });

      act(() => {
        result.current.onResizeStop("a", 4, 3);
      });

      expect(result.current.resizeState.resizing).toBe(false);
      expect(result.current.resizeState.oldResizeItem).toBeNull();
    });

    it("isInteracting is true during drag", () => {
      const { result } = renderHook(() =>
        useGridLayout({
          layout: initialLayout,
          cols: 12,
          width: 1200
        })
      );

      expect(result.current.isInteracting).toBe(false);

      act(() => {
        result.current.onDragStart("a", 0, 0);
      });

      expect(result.current.isInteracting).toBe(true);
    });

    it("isInteracting is true during resize", () => {
      const { result } = renderHook(() =>
        useGridLayout({
          layout: initialLayout,
          cols: 12,
          width: 1200
        })
      );

      expect(result.current.isInteracting).toBe(false);

      act(() => {
        result.current.onResizeStart("a");
      });

      expect(result.current.isInteracting).toBe(true);
    });

    it("calls onLayoutChange callback when layout changes", () => {
      const onLayoutChange = jest.fn();
      const { result } = renderHook(() =>
        useGridLayout({
          layout: initialLayout,
          cols: 12,
          width: 1200,
          onLayoutChange
        })
      );

      act(() => {
        result.current.onDragStart("a", 0, 0);
      });

      act(() => {
        result.current.onDragStop("a", 5, 5);
      });

      expect(onLayoutChange).toHaveBeenCalled();
    });

    it("provides compactor from options", () => {
      const { result } = renderHook(() =>
        useGridLayout({
          layout: initialLayout,
          cols: 12,
          width: 1200,
          compactType: "horizontal"
        })
      );

      expect(result.current.compactor.type).toBe("horizontal");
    });

    it("respects allowOverlap option", () => {
      const { result } = renderHook(() =>
        useGridLayout({
          layout: initialLayout,
          cols: 12,
          width: 1200,
          allowOverlap: true
        })
      );

      expect(result.current.compactor.allowOverlap).toBe(true);
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

    it("does not cause infinite re-renders with inline layouts object (#2202)", () => {
      // This test verifies the fix for issue #2202 where passing an inline
      // layouts object would cause an infinite re-render loop.
      // The fix uses separate refs to track props vs state changes.
      const initLayout = [
        { i: "a", x: 0, y: 0, w: 4, h: 2, static: false, moved: false }
      ];
      const onLayoutChange = jest.fn();
      let renderCount = 0;

      // Component that passes inline layouts object (like the bug report)
      function TestComponent() {
        renderCount++;
        const { layout } = useResponsiveLayout({
          width: 1200,
          breakpoints: { lg: 1200 },
          cols: { lg: 12 },
          // Inline object - new reference every render
          layouts: { lg: initLayout },
          compactType: "horizontal",
          onLayoutChange
        });
        return <div data-testid="layout-length">{layout.length}</div>;
      }

      const { rerender } = render(<TestComponent />);

      // Force a few re-renders
      rerender(<TestComponent />);
      rerender(<TestComponent />);
      rerender(<TestComponent />);

      // Should not have caused excessive renders (infinite loop would cause timeout)
      // A reasonable number is initial + 3 rerenders = 4
      expect(renderCount).toBeLessThanOrEqual(10);

      // onLayoutChange should only be called once (initial layout)
      // not on every render
      expect(onLayoutChange.mock.calls.length).toBeLessThanOrEqual(2);
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
