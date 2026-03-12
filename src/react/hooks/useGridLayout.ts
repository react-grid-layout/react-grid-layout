/**
 * useGridLayout hook
 *
 * Core hook for managing grid layout state, including drag, resize, and drop operations.
 * This extracts the state management logic from ReactGridLayout into a reusable hook.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { deepEqual } from "fast-equals";
import type {
  Layout,
  LayoutItem,
  DroppingPosition,
  Compactor,
  Mutable
} from "../../core/types.js";
import {
  cloneLayout,
  cloneLayoutItem,
  moveElement,
  correctBounds,
  bottom,
  getLayoutItem
} from "../../core/layout.js";
import { verticalCompactor } from "../../core/compactors.js";

// ============================================================================
// Types
// ============================================================================

export interface DragState {
  /** Currently dragging item placeholder */
  activeDrag: LayoutItem | null;
  /** Original item before drag started */
  oldDragItem: LayoutItem | null;
  /** Layout before drag started */
  oldLayout: Layout | null;
}

export interface ResizeState {
  /** Whether a resize is in progress */
  resizing: boolean;
  /** Original item before resize started */
  oldResizeItem: LayoutItem | null;
  /** Layout before resize started */
  oldLayout: Layout | null;
}

export interface DropState {
  /** DOM node for the dropping placeholder */
  droppingDOMNode: React.ReactElement | null;
  /** Current drop position */
  droppingPosition: DroppingPosition | null;
}

export interface UseGridLayoutOptions {
  /** Initial layout */
  layout: Layout;
  /** Number of columns */
  cols: number;
  /** Prevent collisions when moving items */
  preventCollision?: boolean;
  /** Called when layout changes */
  onLayoutChange?: (layout: Layout) => void;
  /** Compactor for layout compaction (default: verticalCompactor) */
  compactor?: Compactor;
}

export interface UseGridLayoutResult {
  /** Current layout */
  layout: Layout;
  /** Set layout directly */
  setLayout: (layout: Layout) => void;
  /** Drag state */
  dragState: DragState;
  /** Resize state */
  resizeState: ResizeState;
  /** Drop state */
  dropState: DropState;
  /** Start dragging an item */
  onDragStart: (itemId: string, x: number, y: number) => LayoutItem | null;
  /** Update drag position */
  onDrag: (itemId: string, x: number, y: number) => void;
  /** Stop dragging */
  onDragStop: (itemId: string, x: number, y: number) => void;
  /** Start resizing an item */
  onResizeStart: (itemId: string) => LayoutItem | null;
  /** Update resize dimensions */
  onResize: (
    itemId: string,
    w: number,
    h: number,
    x?: number,
    y?: number
  ) => void;
  /** Stop resizing */
  onResizeStop: (itemId: string, w: number, h: number) => void;
  /** Start dropping (external drag-in) */
  onDropDragOver: (
    droppingItem: LayoutItem,
    position: DroppingPosition
  ) => void;
  /** Update drop position */
  onDropDragLeave: () => void;
  /** Complete drop */
  onDrop: (droppingItem: LayoutItem) => void;
  /** Container height in rows */
  containerHeight: number;
  /** Whether any drag/resize is active */
  isInteracting: boolean;
  /** Get the compactor being used */
  compactor: Compactor;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for managing grid layout state.
 *
 * Handles all layout state including drag, resize, and drop operations.
 * Uses immutable updates and provides callbacks for all interactions.
 *
 * @example
 * ```tsx
 * function MyGrid() {
 *   const {
 *     layout,
 *     onDragStart,
 *     onDrag,
 *     onDragStop,
 *     containerHeight
 *   } = useGridLayout({
 *     layout: initialLayout,
 *     cols: 12
 *   });
 *
 *   return (
 *     <div style={{ height: containerHeight }}>
 *       {layout.map(item => (
 *         <GridItem
 *           key={item.i}
 *           {...item}
 *           onDragStart={() => onDragStart(item.i, item.x, item.y)}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useGridLayout(
  options: UseGridLayoutOptions
): UseGridLayoutResult {
  const {
    layout: propsLayout,
    cols,
    preventCollision = false,
    onLayoutChange,
    compactor = verticalCompactor
  } = options;

  // Track if we're currently dragging to block prop updates
  const isDraggingRef = useRef(false);

  // Initialize layout with compaction using the compactor
  const [layout, setLayoutState] = useState<Layout>(() => {
    const corrected = correctBounds(cloneLayout(propsLayout), { cols });
    return compactor.compact(corrected, cols);
  });

  // Drag state
  const [dragState, setDragState] = useState<DragState>({
    activeDrag: null,
    oldDragItem: null,
    oldLayout: null
  });

  // Resize state
  const [resizeState, setResizeState] = useState<ResizeState>({
    resizing: false,
    oldResizeItem: null,
    oldLayout: null
  });

  // Drop state
  const [dropState, setDropState] = useState<DropState>({
    droppingDOMNode: null,
    droppingPosition: null
  });

  // Track previous layout for change detection
  const prevLayoutRef = useRef<Layout>(layout);

  // Set layout with optional compaction - use compactor.compact() (#2213)
  const setLayout = useCallback(
    (newLayout: Layout) => {
      const corrected = correctBounds(cloneLayout(newLayout), { cols });
      const compacted = compactor.compact(corrected, cols);
      setLayoutState(compacted);
    },
    [cols, compactor]
  );

  // Sync layout from props when not dragging
  useEffect(() => {
    if (isDraggingRef.current) return;

    if (!deepEqual(propsLayout, prevLayoutRef.current)) {
      setLayout(propsLayout);
    }
  }, [propsLayout, setLayout]);

  // Notify layout changes
  useEffect(() => {
    if (!deepEqual(layout, prevLayoutRef.current)) {
      prevLayoutRef.current = layout;
      onLayoutChange?.(layout);
    }
  }, [layout, onLayoutChange]);

  // ============================================================================
  // Drag Handlers
  // ============================================================================

  const onDragStart = useCallback(
    (itemId: string, x: number, y: number): LayoutItem | null => {
      const item = getLayoutItem(layout, itemId);
      if (!item) return null;

      isDraggingRef.current = true;

      const placeholder: LayoutItem = {
        ...cloneLayoutItem(item),
        x,
        y,
        static: false,
        moved: false
      };

      setDragState({
        activeDrag: placeholder,
        oldDragItem: cloneLayoutItem(item),
        oldLayout: cloneLayout(layout)
      });

      return placeholder;
    },
    [layout]
  );

  const onDrag = useCallback(
    (itemId: string, x: number, y: number) => {
      const item = getLayoutItem(layout, itemId);
      if (!item) return;

      // Update placeholder position
      setDragState(prev => ({
        ...prev,
        activeDrag: prev.activeDrag ? { ...prev.activeDrag, x, y } : null
      }));

      // Move element and update layout
      const newLayout = moveElement(
        layout,
        item,
        x,
        y,
        true, // isUserAction
        preventCollision,
        compactor.type,
        cols,
        compactor.allowOverlap
      );

      // Compact layout - use compactor.compact() (#2213)
      const compacted = compactor.compact(newLayout, cols);

      setLayoutState(compacted);
    },
    [layout, cols, compactor, preventCollision]
  );

  const onDragStop = useCallback(
    (itemId: string, x: number, y: number) => {
      const item = getLayoutItem(layout, itemId);
      if (!item) return;

      // Final move
      const newLayout = moveElement(
        layout,
        item,
        x,
        y,
        true,
        preventCollision,
        compactor.type,
        cols,
        compactor.allowOverlap
      );

      // Compact and finalize - use compactor.compact() (#2213)
      const compacted = compactor.compact(newLayout, cols);

      isDraggingRef.current = false;

      setDragState({
        activeDrag: null,
        oldDragItem: null,
        oldLayout: null
      });

      setLayoutState(compacted);
    },
    [layout, cols, compactor, preventCollision]
  );

  // ============================================================================
  // Resize Handlers
  // ============================================================================

  const onResizeStart = useCallback(
    (itemId: string): LayoutItem | null => {
      const item = getLayoutItem(layout, itemId);
      if (!item) return null;

      setResizeState({
        resizing: true,
        oldResizeItem: cloneLayoutItem(item),
        oldLayout: cloneLayout(layout)
      });

      return item;
    },
    [layout]
  );

  const onResize = useCallback(
    (itemId: string, w: number, h: number, x?: number, y?: number) => {
      const newLayout = layout.map(item => {
        if (item.i === itemId) {
          const updated: LayoutItem = {
            ...item,
            w,
            h
          };
          if (x !== undefined) (updated as Mutable<LayoutItem>).x = x;
          if (y !== undefined) (updated as Mutable<LayoutItem>).y = y;
          return updated;
        }
        return item;
      });

      // Correct bounds and compact - use compactor.compact() (#2213)
      const corrected = correctBounds(newLayout, { cols });
      const compacted = compactor.compact(corrected, cols);

      setLayoutState(compacted);
    },
    [layout, cols, compactor]
  );

  const onResizeStop = useCallback(
    (itemId: string, w: number, h: number) => {
      // Apply final resize
      onResize(itemId, w, h);

      setResizeState({
        resizing: false,
        oldResizeItem: null,
        oldLayout: null
      });
    },
    [onResize]
  );

  // ============================================================================
  // Drop Handlers
  // ============================================================================

  const onDropDragOver = useCallback(
    (droppingItem: LayoutItem, position: DroppingPosition) => {
      // Check if item already exists in layout
      const existingItem = getLayoutItem(layout, droppingItem.i);

      if (!existingItem) {
        // Add dropping item to layout - use compactor.compact() (#2213)
        const newLayout = [...layout, droppingItem];
        const corrected = correctBounds(newLayout, { cols });
        const compacted = compactor.compact(corrected, cols);
        setLayoutState(compacted);
      }

      setDropState({
        droppingDOMNode: null, // Will be set by component
        droppingPosition: position
      });
    },
    [layout, cols, compactor]
  );

  const onDropDragLeave = useCallback(() => {
    // Remove dropping placeholder from layout
    const newLayout = layout.filter(item => item.i !== "__dropping-elem__");
    setLayoutState(newLayout);

    setDropState({
      droppingDOMNode: null,
      droppingPosition: null
    });
  }, [layout]);

  const onDrop = useCallback(
    (droppingItem: LayoutItem) => {
      // Replace placeholder with actual item
      const newLayout = layout.map(item => {
        if (item.i === "__dropping-elem__") {
          return {
            ...item,
            i: droppingItem.i,
            static: false
          };
        }
        return item;
      });

      // Use compactor.compact() (#2213)
      const corrected = correctBounds(newLayout, { cols });
      const compacted = compactor.compact(corrected, cols);
      setLayoutState(compacted);

      setDropState({
        droppingDOMNode: null,
        droppingPosition: null
      });
    },
    [layout, cols, compactor]
  );

  // ============================================================================
  // Computed Values
  // ============================================================================

  const containerHeight = useMemo(() => bottom(layout), [layout]);

  const isInteracting =
    dragState.activeDrag !== null ||
    resizeState.resizing ||
    dropState.droppingPosition !== null;

  return {
    layout,
    setLayout,
    dragState,
    resizeState,
    dropState,
    onDragStart,
    onDrag,
    onDragStop,
    onResizeStart,
    onResize,
    onResizeStop,
    onDropDragOver,
    onDropDragLeave,
    onDrop,
    containerHeight,
    isInteracting,
    compactor
  };
}

export default useGridLayout;
