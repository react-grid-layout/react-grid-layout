/**
 * Tests for cross-grid drag-and-drop
 *
 * Coverage:
 *  - CrossGridDragProvider: registration, publishDrag, getActiveTarget, notifyDrop
 *  - useCrossGridDrag: no-op without provider, incomingDragState, isDraggingOverPeer,
 *                      commitDrop
 *  - GridLayout integration: onItemDraggedOut, onItemDroppedIn, layout callbacks
 */

import React from "react";
import { render, act, renderHook } from "@testing-library/react";

import { CrossGridDragProvider } from "../../src/react/context/CrossGridDragProvider";
import { CrossGridDragContext } from "../../src/react/context/CrossGridDragContext";
import { useCrossGridDrag } from "../../src/react/hooks/useCrossGridDrag";
import { GridLayout } from "../../src/react/components/GridLayout";
import type { LayoutItem, Layout } from "../../src/core/types";

// ============================================================================
// Helpers
// ============================================================================

function makeRect(
  x: number,
  y: number,
  width: number,
  height: number
): DOMRect {
  return {
    left: x,
    top: y,
    right: x + width,
    bottom: y + height,
    width,
    height,
    x,
    y,
    toJSON: () => ({})
  } as DOMRect;
}

const LEFT_RECT = makeRect(0, 0, 400, 600);
const RIGHT_RECT = makeRect(400, 0, 400, 600);

const itemA: LayoutItem = { i: "a", x: 0, y: 0, w: 2, h: 2 };

/** renderHook wrapper that provides CrossGridDragContext. */
function providerWrapper({ children }: { children: React.ReactNode }) {
  return <CrossGridDragProvider>{children}</CrossGridDragProvider>;
}

// ============================================================================
// CrossGridDragProvider — unit tests
// ============================================================================

describe("CrossGridDragProvider", () => {
  it("exposes a non-null context value with expected shape", () => {
    const { result } = renderHook(
      () => React.useContext(CrossGridDragContext),
      { wrapper: providerWrapper }
    );

    expect(result.current).not.toBeNull();
    expect(result.current.dragState).toBeNull();
    expect(typeof result.current.registerGrid).toBe("function");
    expect(typeof result.current.publishDrag).toBe("function");
    expect(typeof result.current.getActiveTarget).toBe("function");
    expect(typeof result.current.notifyDrop).toBe("function");
  });

  it("registerGrid adds the grid and returns an unregister function", () => {
    const { result } = renderHook(
      () => React.useContext(CrossGridDragContext),
      { wrapper: providerWrapper }
    );

    let unregister: () => void = () => {};
    act(() => {
      unregister = result.current.registerGrid("grid-a", {
        getRect: () => LEFT_RECT,
        onIncomingDrop: jest.fn()
      });
    });

    // Cursor inside grid-a — should find it (exclude a different id)
    expect(result.current.getActiveTarget(100, 100, "other")).toBe("grid-a");

    act(() => {
      unregister();
    });

    // After unregister — should not be found
    expect(result.current.getActiveTarget(100, 100, "other")).toBeNull();
  });

  it("publishDrag sets dragState and publishDrag(null) clears it", () => {
    const { result } = renderHook(
      () => React.useContext(CrossGridDragContext),
      { wrapper: providerWrapper }
    );

    act(() => {
      result.current.publishDrag({
        sourceGridId: "left",
        item: itemA,
        clientX: 100,
        clientY: 100
      });
    });
    expect(result.current.dragState).toEqual({
      sourceGridId: "left",
      item: itemA,
      clientX: 100,
      clientY: 100
    });

    act(() => {
      result.current.publishDrag(null);
    });
    expect(result.current.dragState).toBeNull();
  });

  it("getActiveTarget returns the grid under the cursor, excluding the source", () => {
    const { result } = renderHook(
      () => React.useContext(CrossGridDragContext),
      { wrapper: providerWrapper }
    );

    act(() => {
      result.current.registerGrid("left", {
        getRect: () => LEFT_RECT,
        onIncomingDrop: jest.fn()
      });
      result.current.registerGrid("right", {
        getRect: () => RIGHT_RECT,
        onIncomingDrop: jest.fn()
      });
    });

    // Cursor in left grid, source is something else → "left"
    expect(result.current.getActiveTarget(100, 100, "other")).toBe("left");
    // Cursor in right grid → "right"
    expect(result.current.getActiveTarget(500, 100, "other")).toBe("right");
    // Cursor in left grid but left is excluded (it owns the drag) → null
    expect(result.current.getActiveTarget(100, 100, "left")).toBeNull();
    // Cursor in a gap between grids → null
    expect(result.current.getActiveTarget(100, 700, "other")).toBeNull();
  });

  it("notifyDrop calls onIncomingDrop on the target, not the source", () => {
    const { result } = renderHook(
      () => React.useContext(CrossGridDragContext),
      { wrapper: providerWrapper }
    );

    const dropLeft = jest.fn();
    const dropRight = jest.fn();
    act(() => {
      result.current.registerGrid("left", {
        getRect: () => LEFT_RECT,
        onIncomingDrop: dropLeft
      });
      result.current.registerGrid("right", {
        getRect: () => RIGHT_RECT,
        onIncomingDrop: dropRight
      });
      result.current.publishDrag({
        sourceGridId: "left",
        item: itemA,
        clientX: 500,
        clientY: 100
      });
    });

    act(() => {
      result.current.notifyDrop("right", 500, 100);
    });

    expect(dropRight).toHaveBeenCalledWith(itemA, 500, 100);
    expect(dropLeft).not.toHaveBeenCalled();
  });

  it("warns on duplicate gridId in dev", () => {
    const consoleWarn = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    const { result } = renderHook(
      () => React.useContext(CrossGridDragContext),
      { wrapper: providerWrapper }
    );

    act(() => {
      result.current.registerGrid("dup", {
        getRect: () => LEFT_RECT,
        onIncomingDrop: jest.fn()
      });
      result.current.registerGrid("dup", {
        getRect: () => RIGHT_RECT,
        onIncomingDrop: jest.fn()
      });
    });

    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('Duplicate gridId "dup"')
    );
    consoleWarn.mockRestore();
  });
});

// ============================================================================
// useCrossGridDrag — unit tests
// ============================================================================

describe("useCrossGridDrag", () => {
  it("is a no-op and returns null / false when there is no provider", () => {
    const ref = { current: null as HTMLDivElement | null };
    const { result } = renderHook(() =>
      useCrossGridDrag({ gridId: "x" }, ref, jest.fn())
    );

    expect(result.current.incomingDragState).toBeNull();
    expect(result.current.isDraggingOverPeer).toBe(false);
    expect(() => result.current.publishDrag(itemA, 0, 0)).not.toThrow();
    expect(() => result.current.clearDrag()).not.toThrow();

    let committed = true;
    act(() => {
      committed = result.current.commitDrop(itemA, 0, 0);
    });
    expect(committed).toBe(false);
  });

  it("is a no-op when crossGridConfig is undefined", () => {
    const ref = { current: null as HTMLDivElement | null };
    const { result } = renderHook(
      () => useCrossGridDrag(undefined, ref, jest.fn()),
      { wrapper: providerWrapper }
    );

    expect(result.current.incomingDragState).toBeNull();
    expect(result.current.isDraggingOverPeer).toBe(false);
    expect(result.current.commitDrop(itemA, 0, 0)).toBe(false);
  });

  it("registers with the provider on mount and unregisters on unmount", () => {
    // Provide a real DOM element so the hook's internal getRect() returns a
    // non-null rect — getActiveTarget skips entries where getRect() is null.
    const { container } = render(<div />);
    const el = container.firstChild as HTMLDivElement;
    jest.spyOn(el, "getBoundingClientRect").mockReturnValue(LEFT_RECT);
    const containerRef = { current: el };

    const { result, unmount } = renderHook(
      () => ({
        ctx: React.useContext(CrossGridDragContext),
        drag: useCrossGridDrag({ gridId: "test-grid" }, containerRef, jest.fn())
      }),
      { wrapper: providerWrapper }
    );

    // The hook auto-registers — cursor inside LEFT_RECT should resolve to "test-grid"
    expect(result.current.ctx.getActiveTarget(100, 100, "other")).toBe(
      "test-grid"
    );

    unmount();
    expect(result.current.ctx.getActiveTarget(100, 100, "other")).toBeNull();
  });

  it("incomingDragState is null when this grid is the source of the drag", () => {
    const containerRef =
      React.createRef<HTMLDivElement>() as React.RefObject<HTMLDivElement | null>;

    const { result } = renderHook(
      () => ({
        ctx: React.useContext(CrossGridDragContext),
        drag: useCrossGridDrag({ gridId: "source" }, containerRef, jest.fn())
      }),
      { wrapper: providerWrapper }
    );

    act(() => {
      result.current.ctx.publishDrag({
        sourceGridId: "source",
        item: itemA,
        clientX: 100,
        clientY: 100
      });
    });

    // This grid IS the source — must not see its own drag as incoming
    expect(result.current.drag.incomingDragState).toBeNull();
  });

  it("incomingDragState is non-null when cursor is inside this (target) grid", () => {
    // Render a real element and give it the mocked rect
    const { container } = render(<div data-testid="target-container" />);
    const el = container.firstChild as HTMLDivElement;
    jest.spyOn(el, "getBoundingClientRect").mockReturnValue(RIGHT_RECT);
    const containerRef = { current: el };

    const { result } = renderHook(
      () => ({
        ctx: React.useContext(CrossGridDragContext),
        drag: useCrossGridDrag({ gridId: "target" }, containerRef, jest.fn())
      }),
      { wrapper: providerWrapper }
    );

    // Cursor at x=500 — inside RIGHT_RECT (400–800)
    act(() => {
      result.current.ctx.publishDrag({
        sourceGridId: "peer",
        item: itemA,
        clientX: 500,
        clientY: 100
      });
    });

    expect(result.current.drag.incomingDragState).not.toBeNull();
    expect(result.current.drag.incomingDragState!.sourceGridId).toBe("peer");
    expect(result.current.drag.incomingDragState!.item).toBe(itemA);
  });

  it("incomingDragState is null when cursor is outside this grid", () => {
    const { container } = render(<div data-testid="target-container" />);
    const el = container.firstChild as HTMLDivElement;
    jest.spyOn(el, "getBoundingClientRect").mockReturnValue(RIGHT_RECT);
    const containerRef = { current: el };

    const { result } = renderHook(
      () => ({
        ctx: React.useContext(CrossGridDragContext),
        drag: useCrossGridDrag({ gridId: "target" }, containerRef, jest.fn())
      }),
      { wrapper: providerWrapper }
    );

    // Cursor at x=100 — outside RIGHT_RECT
    act(() => {
      result.current.ctx.publishDrag({
        sourceGridId: "peer",
        item: itemA,
        clientX: 100,
        clientY: 100
      });
    });

    expect(result.current.drag.incomingDragState).toBeNull();
  });

  it("isDraggingOverPeer is true when this grid is the source and cursor is over a peer", () => {
    const { container } = render(<div data-testid="source-container" />);
    const el = container.firstChild as HTMLDivElement;
    jest.spyOn(el, "getBoundingClientRect").mockReturnValue(LEFT_RECT);
    const containerRef = { current: el };

    const { result } = renderHook(
      () => ({
        ctx: React.useContext(CrossGridDragContext),
        drag: useCrossGridDrag({ gridId: "source" }, containerRef, jest.fn())
      }),
      { wrapper: providerWrapper }
    );

    act(() => {
      // Register a peer grid on the right
      result.current.ctx.registerGrid("peer", {
        getRect: () => RIGHT_RECT,
        onIncomingDrop: jest.fn()
      });
      // Publish drag from source with cursor over peer (x=500)
      result.current.ctx.publishDrag({
        sourceGridId: "source",
        item: itemA,
        clientX: 500,
        clientY: 100
      });
    });

    expect(result.current.drag.isDraggingOverPeer).toBe(true);
  });

  it("isDraggingOverPeer is false when cursor is not over any peer grid", () => {
    const { container } = render(<div data-testid="source-container" />);
    const el = container.firstChild as HTMLDivElement;
    jest.spyOn(el, "getBoundingClientRect").mockReturnValue(LEFT_RECT);
    const containerRef = { current: el };

    const { result } = renderHook(
      () => ({
        ctx: React.useContext(CrossGridDragContext),
        drag: useCrossGridDrag({ gridId: "source" }, containerRef, jest.fn())
      }),
      { wrapper: providerWrapper }
    );

    act(() => {
      result.current.ctx.registerGrid("peer", {
        getRect: () => RIGHT_RECT,
        onIncomingDrop: jest.fn()
      });
      // Cursor at x=100 — inside source grid, NOT over peer
      result.current.ctx.publishDrag({
        sourceGridId: "source",
        item: itemA,
        clientX: 100,
        clientY: 100
      });
    });

    expect(result.current.drag.isDraggingOverPeer).toBe(false);
  });

  it("commitDrop returns false and clears drag when no peer is under the cursor", () => {
    const { result } = renderHook(
      () => ({
        ctx: React.useContext(CrossGridDragContext),
        drag: useCrossGridDrag(
          { gridId: "source" },
          { current: null },
          jest.fn()
        )
      }),
      { wrapper: providerWrapper }
    );

    act(() => {
      result.current.ctx.publishDrag({
        sourceGridId: "source",
        item: itemA,
        clientX: 100,
        clientY: 100
      });
    });

    let committed = true;
    act(() => {
      committed = result.current.drag.commitDrop(itemA, 100, 100);
    });

    expect(committed).toBe(false);
    expect(result.current.ctx.dragState).toBeNull();
  });

  it("commitDrop returns true, calls onIncomingDrop on peer, and clears drag", () => {
    const onIncomingDrop = jest.fn();

    const { result } = renderHook(
      () => ({
        ctx: React.useContext(CrossGridDragContext),
        drag: useCrossGridDrag(
          { gridId: "source" },
          { current: null },
          jest.fn()
        )
      }),
      { wrapper: providerWrapper }
    );

    act(() => {
      result.current.ctx.registerGrid("peer", {
        getRect: () => RIGHT_RECT,
        onIncomingDrop
      });
      result.current.ctx.publishDrag({
        sourceGridId: "source",
        item: itemA,
        clientX: 500,
        clientY: 100
      });
    });

    let committed = false;
    act(() => {
      committed = result.current.drag.commitDrop(itemA, 500, 100);
    });

    expect(committed).toBe(true);
    expect(onIncomingDrop).toHaveBeenCalledWith(itemA, 500, 100);
    expect(result.current.ctx.dragState).toBeNull();
  });

  it("clearDrag nullifies the context drag state", () => {
    const { result } = renderHook(
      () => ({
        ctx: React.useContext(CrossGridDragContext),
        drag: useCrossGridDrag(
          { gridId: "source" },
          { current: null },
          jest.fn()
        )
      }),
      { wrapper: providerWrapper }
    );

    act(() => {
      result.current.ctx.publishDrag({
        sourceGridId: "source",
        item: itemA,
        clientX: 0,
        clientY: 0
      });
    });
    expect(result.current.ctx.dragState).not.toBeNull();

    act(() => {
      result.current.drag.clearDrag();
    });
    expect(result.current.ctx.dragState).toBeNull();
  });
});

// ============================================================================
// GridLayout + CrossGridDragProvider — integration tests
// ============================================================================

/**
 * Renders a GridLayout that participates in cross-grid drag.
 * The container's getBoundingClientRect is mocked to `rect` via useEffect.
 */
function TestGrid({
  gridId,
  layout,
  onLayoutChange,
  onItemDraggedOut,
  onItemDroppedIn,
  rect,
  innerRef: externalRef
}: {
  gridId: string;
  layout: Layout;
  onLayoutChange?: (l: Layout) => void;
  onItemDraggedOut?: (item: LayoutItem) => void;
  onItemDroppedIn?: (item: LayoutItem, layout: Layout) => void;
  rect: DOMRect;
  innerRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const internalRef = React.useRef<HTMLDivElement | null>(null);
  const ref = externalRef ?? internalRef;

  React.useEffect(() => {
    if (ref.current) {
      jest.spyOn(ref.current, "getBoundingClientRect").mockReturnValue(rect);
    }
  }, [ref, rect]);

  const crossGridConfig = React.useMemo(
    () => ({ gridId, onItemDraggedOut, onItemDroppedIn }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gridId]
  );

  return (
    <GridLayout
      innerRef={ref}
      width={400}
      layout={layout}
      onLayoutChange={onLayoutChange}
      crossGridConfig={crossGridConfig}
      gridConfig={{ cols: 4, rowHeight: 80 }}
    >
      {layout.map(l => (
        <div key={l.i}>{l.i}</div>
      ))}
    </GridLayout>
  );
}

describe("GridLayout cross-grid drag integration", () => {
  it("renders without error inside a CrossGridDragProvider", () => {
    const layout = [{ i: "a", x: 0, y: 0, w: 2, h: 1 }];
    expect(() => {
      render(
        <CrossGridDragProvider>
          <TestGrid gridId="test" layout={layout} rect={LEFT_RECT} />
        </CrossGridDragProvider>
      );
    }).not.toThrow();
  });

  it("calls onItemDroppedIn when notifyDrop routes an item to this grid", () => {
    const rightLayout: Layout = [{ i: "y", x: 0, y: 0, w: 2, h: 1 }];
    const onItemDroppedIn = jest.fn();

    // Render TestGrid inside the same provider tree as the context hook
    const { result } = renderHook(
      () => React.useContext(CrossGridDragContext),
      {
        wrapper: ({ children }) => (
          <CrossGridDragProvider>
            {children}
            <TestGrid
              gridId="right"
              layout={rightLayout}
              onItemDroppedIn={onItemDroppedIn}
              rect={RIGHT_RECT}
            />
          </CrossGridDragProvider>
        )
      }
    );

    const droppedItem: LayoutItem = { i: "x", x: 0, y: 0, w: 2, h: 1 };

    // publishDrag must flush (re-render) before notifyDrop reads dragStateRef
    act(() => {
      result.current.publishDrag({
        sourceGridId: "left",
        item: droppedItem,
        clientX: 500,
        clientY: 100
      });
    });
    act(() => {
      result.current.notifyDrop("right", 500, 100);
    });

    expect(onItemDroppedIn).toHaveBeenCalledWith(
      expect.objectContaining({ i: "x" }),
      expect.arrayContaining([expect.objectContaining({ i: "x" })])
    );
  });

  it("onItemDroppedIn receives a layout that also contains the original items", () => {
    const rightLayout: Layout = [{ i: "y", x: 2, y: 0, w: 2, h: 1 }];
    let receivedLayout: Layout | null = null;

    const { result } = renderHook(
      () => React.useContext(CrossGridDragContext),
      {
        wrapper: ({ children }) => (
          <CrossGridDragProvider>
            {children}
            <TestGrid
              gridId="right"
              layout={rightLayout}
              onItemDroppedIn={(_item, layout) => {
                receivedLayout = layout;
              }}
              rect={RIGHT_RECT}
            />
          </CrossGridDragProvider>
        )
      }
    );

    const droppedItem: LayoutItem = { i: "z", x: 0, y: 0, w: 2, h: 1 };

    act(() => {
      result.current.publishDrag({
        sourceGridId: "left",
        item: droppedItem,
        clientX: 500,
        clientY: 100
      });
    });
    act(() => {
      result.current.notifyDrop("right", 500, 100);
    });

    expect(receivedLayout).not.toBeNull();
    // Dropped item appears in the layout
    expect(receivedLayout!.some(l => l.i === "z")).toBe(true);
    // Original item is preserved
    expect(receivedLayout!.some(l => l.i === "y")).toBe(true);
  });

  it("commitDrop notifies the target grid and calls onItemDroppedIn", () => {
    const onItemDroppedIn = jest.fn();

    // Both the source-side hook and the target TestGrid share the same provider
    const { result } = renderHook(
      () => ({
        ctx: React.useContext(CrossGridDragContext),
        drag: useCrossGridDrag({ gridId: "left" }, { current: null }, jest.fn())
      }),
      {
        wrapper: ({ children }) => (
          <CrossGridDragProvider>
            {children}
            <TestGrid
              gridId="right"
              layout={[{ i: "y", x: 0, y: 0, w: 2, h: 1 }]}
              onItemDroppedIn={onItemDroppedIn}
              rect={RIGHT_RECT}
            />
          </CrossGridDragProvider>
        )
      }
    );

    const movedItem: LayoutItem = { i: "a", x: 0, y: 0, w: 2, h: 1 };

    // Publish drag state from "left" with cursor inside RIGHT_RECT
    act(() => {
      result.current.drag.publishDrag(movedItem, 500, 100);
    });

    // Commit the drop (mirrors what GridLayout.onDragStop does)
    let committed = false;
    act(() => {
      committed = result.current.drag.commitDrop(movedItem, 500, 100);
    });

    expect(committed).toBe(true);
    expect(onItemDroppedIn).toHaveBeenCalledWith(
      expect.objectContaining({ i: "a" }),
      expect.any(Array)
    );
  });

  it("no cross-grid callbacks fire when there is no peer grid registered", () => {
    const layout: Layout = [{ i: "a", x: 0, y: 0, w: 2, h: 1 }];
    const onItemDraggedOut = jest.fn();

    // "left-hook" is the only registered grid (no peer) — commitDrop must return false
    const { result } = renderHook(
      () => ({
        ctx: React.useContext(CrossGridDragContext),
        drag: useCrossGridDrag(
          { gridId: "left-hook" },
          { current: null },
          jest.fn()
        )
      }),
      {
        wrapper: ({ children }) => (
          <CrossGridDragProvider>
            {children}
            <TestGrid
              gridId="left"
              layout={layout}
              onItemDraggedOut={onItemDraggedOut}
              rect={LEFT_RECT}
            />
          </CrossGridDragProvider>
        )
      }
    );

    const item: LayoutItem = { i: "a", x: 0, y: 0, w: 2, h: 1 };

    act(() => {
      result.current.drag.publishDrag(item, 500, 100);
    });

    let committed = true;
    act(() => {
      // No peer registered for left-hook — commitDrop returns false
      committed = result.current.drag.commitDrop(item, 500, 100);
    });

    expect(committed).toBe(false);
    expect(onItemDraggedOut).not.toHaveBeenCalled();
  });
});
