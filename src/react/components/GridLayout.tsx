/**
 * GridLayout component
 *
 * A reactive, fluid grid layout with draggable, resizable components.
 */

import React, {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useMemo,
  type ReactElement,
  type CSSProperties,
  type DragEvent as ReactDragEvent,
  type MutableRefObject
} from "react";
import { deepEqual } from "fast-equals";
import clsx from "clsx";

import type {
  Layout,
  LayoutItem,
  CompactType,
  DroppingPosition,
  GridDragEvent,
  GridResizeEvent,
  Mutable,
  GridConfig,
  DragConfig,
  ResizeConfig,
  DropConfig,
  PositionStrategy,
  Compactor,
  LayoutConstraint,
  EventCallback
} from "../../core/types.js";
import {
  defaultGridConfig,
  defaultDragConfig,
  defaultResizeConfig,
  defaultDropConfig
} from "../../core/types.js";
import {
  bottom,
  cloneLayoutItem,
  getLayoutItem,
  moveElement,
  withLayoutItem,
  correctBounds
} from "../../core/layout.js";
import { getAllCollisions } from "../../core/collision.js";
// Note: compact from compact-compat.js is NOT used - we use compactor.compact() instead (#2213)
import { getCompactor } from "../../core/compactors.js";
import { defaultPositionStrategy } from "../../core/position.js";
import { defaultConstraints } from "../../core/constraints.js";

import { GridItem, type ResizeHandle } from "./GridItem.js";
import { computeDropPosition } from "./dropMath.js";

// ============================================================================
// Types
// ============================================================================

export interface GridLayoutProps {
  // ===========================================================================
  // Required Props
  // ===========================================================================

  /** Child elements to render in the grid */
  children: React.ReactNode;

  /** Width of the container in pixels */
  width: number;

  // ===========================================================================
  // Composable Configuration Interfaces (v2 API)
  // ===========================================================================

  /**
   * Grid measurement configuration.
   * @see GridConfig
   */
  gridConfig?: Partial<GridConfig>;

  /**
   * Drag behavior configuration.
   * @see DragConfig
   */
  dragConfig?: Partial<DragConfig>;

  /**
   * Resize behavior configuration.
   * @see ResizeConfig
   */
  resizeConfig?: Partial<ResizeConfig>;

  /**
   * External drop configuration.
   * @see DropConfig
   */
  dropConfig?: Partial<DropConfig>;

  /**
   * CSS positioning strategy.
   * Use transformStrategy (default), absoluteStrategy, or createScaledStrategy(scale).
   * @see PositionStrategy
   */
  positionStrategy?: PositionStrategy;

  /**
   * Layout compaction strategy.
   * Use verticalCompactor (default), horizontalCompactor, or noCompactor.
   * @see Compactor
   */
  compactor?: Compactor;

  /**
   * Layout constraints for position and size limiting.
   * Applied during drag/resize operations.
   * Default: [gridBounds, minMaxSize]
   * @see LayoutConstraint
   */
  constraints?: LayoutConstraint[];

  // ===========================================================================
  // Layout Data
  // ===========================================================================

  /** Layout definition */
  layout?: Layout;

  /** Item to use when dropping from outside */
  droppingItem?: LayoutItem;

  // ===========================================================================
  // Container Props
  // ===========================================================================

  /** Whether to auto-size the container height */
  autoSize?: boolean;

  /** Additional class name */
  className?: string;

  /** Additional styles */
  style?: CSSProperties;

  /** Ref to the container element */
  innerRef?: React.Ref<HTMLDivElement>;

  // ===========================================================================
  // Callbacks
  // ===========================================================================

  /** Called when layout changes */
  onLayoutChange?: (layout: Layout) => void;

  /** Called when drag starts */
  onDragStart?: EventCallback;

  /** Called during drag */
  onDrag?: EventCallback;

  /** Called when drag stops */
  onDragStop?: EventCallback;

  /** Called when resize starts */
  onResizeStart?: EventCallback;

  /** Called during resize */
  onResize?: EventCallback;

  /** Called when resize stops */
  onResizeStop?: EventCallback;

  /** Called when an item is dropped from outside */
  onDrop?: (layout: Layout, item: LayoutItem | undefined, e: Event) => void;

  /** Called when dragging over the grid */
  onDropDragOver?: (
    e: ReactDragEvent
  ) =>
    | { w?: number; h?: number; dragOffsetX?: number; dragOffsetY?: number }
    | false
    | void;
}

// ============================================================================
// Utility Functions
// ============================================================================

const noop = () => {};

const layoutClassName = "react-grid-layout";

// Check for Firefox
let isFirefox = false;
try {
  isFirefox = /firefox/i.test(navigator.userAgent);
} catch {
  /* Ignore */
}

/**
 * Compare children arrays for equality
 */
function childrenEqual(a: React.ReactNode, b: React.ReactNode): boolean {
  const aArr = React.Children.toArray(a);
  const bArr = React.Children.toArray(b);

  if (aArr.length !== bArr.length) return false;

  for (let i = 0; i < aArr.length; i++) {
    const aChild = aArr[i] as ReactElement;
    const bChild = bArr[i] as ReactElement;
    if (aChild?.key !== bChild?.key) return false;
  }

  return true;
}

/**
 * Synchronize layout with children
 */
function synchronizeLayoutWithChildren(
  initialLayout: Layout,
  children: React.ReactNode,
  cols: number,
  compactor: Compactor
): Layout {
  const layout: LayoutItem[] = [];
  const childKeys = new Set<string>();

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child) || child.key === null) return;
    const key = String(child.key);
    childKeys.add(key);

    // Find existing layout item
    const existingItem = initialLayout.find(l => l.i === key);

    if (existingItem) {
      layout.push(cloneLayoutItem(existingItem));
    } else {
      // Create new layout item from child data-grid prop
      const childProps = child.props as { "data-grid"?: Partial<LayoutItem> };
      const dataGrid = childProps["data-grid"];

      if (dataGrid) {
        layout.push({
          i: key,
          x: dataGrid.x ?? 0,
          y: dataGrid.y ?? 0,
          w: dataGrid.w ?? 1,
          h: dataGrid.h ?? 1,
          minW: dataGrid.minW,
          maxW: dataGrid.maxW,
          minH: dataGrid.minH,
          maxH: dataGrid.maxH,
          static: dataGrid.static,
          isDraggable: dataGrid.isDraggable,
          isResizable: dataGrid.isResizable,
          resizeHandles: dataGrid.resizeHandles,
          isBounded: dataGrid.isBounded
        });
      } else {
        // Create default layout item
        layout.push({
          i: key,
          x: 0,
          y: bottom(layout),
          w: 1,
          h: 1
        });
      }
    }
  });

  // Correct bounds and compact using the compactor's compact method (#2213)
  const corrected = correctBounds(layout, { cols });
  return compactor.compact(corrected, cols);
}

// ============================================================================
// Component
// ============================================================================

/**
 * GridLayout - A reactive, fluid grid layout with draggable, resizable components.
 */
export function GridLayout(props: GridLayoutProps): ReactElement {
  const {
    // Required
    children,
    width,

    // Composable config interfaces
    gridConfig: gridConfigProp,
    dragConfig: dragConfigProp,
    resizeConfig: resizeConfigProp,
    dropConfig: dropConfigProp,
    positionStrategy = defaultPositionStrategy,
    compactor: compactorProp,
    constraints = defaultConstraints,

    // Layout data
    layout: propsLayout = [],
    droppingItem: droppingItemProp,

    // Container props
    autoSize = true,
    className = "",
    style = {},
    innerRef,

    // Callbacks
    onLayoutChange = noop,
    onDragStart: onDragStartProp = noop,
    onDrag: onDragProp = noop,
    onDragStop: onDragStopProp = noop,
    onResizeStart: onResizeStartProp = noop,
    onResize: onResizeProp = noop,
    onResizeStop: onResizeStopProp = noop,
    onDrop: onDropProp = noop,
    onDropDragOver: onDropDragOverProp = noop
  } = props;

  // Resolve config interfaces with defaults
  const gridConfig: GridConfig = useMemo(
    () => ({ ...defaultGridConfig, ...gridConfigProp }),
    [gridConfigProp]
  );
  const dragConfig: DragConfig = useMemo(
    () => ({ ...defaultDragConfig, ...dragConfigProp }),
    [dragConfigProp]
  );
  const resizeConfig: ResizeConfig = useMemo(
    () => ({ ...defaultResizeConfig, ...resizeConfigProp }),
    [resizeConfigProp]
  );
  const dropConfig: DropConfig = useMemo(
    () => ({ ...defaultDropConfig, ...dropConfigProp }),
    [dropConfigProp]
  );

  // Destructure resolved configs for convenience
  const { cols, rowHeight, maxRows, margin, containerPadding } = gridConfig;
  const {
    enabled: isDraggable,
    bounded: isBounded,
    handle: draggableHandle,
    cancel: draggableCancel,
    threshold: dragThreshold,
    allowMobileScroll: dragAllowMobileScroll
  } = dragConfig;
  const {
    enabled: isResizable,
    handles: resizeHandles,
    handleComponent: resizeHandle
  } = resizeConfig;
  const {
    enabled: isDroppable,
    defaultItem: defaultDropItem,
    onDragOver: dropConfigOnDragOver,
    touchEnabled = true,
    touchDragSource = "[data-rgl-draggable]"
  } = dropConfig;

  // Get compactor (use provided or get from type)
  const compactor = compactorProp ?? getCompactor("vertical");
  const compactType = compactor.type;
  const allowOverlap = compactor.allowOverlap;
  const preventCollision = compactor.preventCollision ?? false;

  // Resolve dropping item - memoized to avoid unstable reference in useCallback dependencies
  const droppingItem = useMemo(
    () =>
      droppingItemProp ?? {
        i: "__dropping-elem__",
        ...defaultDropItem
      },
    [droppingItemProp, defaultDropItem]
  );

  // Position strategy values
  const useCSSTransforms = positionStrategy.type === "transform";
  const transformScale = positionStrategy.scale;

  const effectiveContainerPadding = containerPadding ?? margin;

  // State
  const [mounted, setMounted] = useState(false);
  const [layout, setLayout] = useState<Layout>(() =>
    synchronizeLayoutWithChildren(propsLayout, children, cols, compactor)
  );
  const [activeDrag, setActiveDrag] = useState<LayoutItem | null>(null);
  const [resizing, setResizing] = useState(false);
  const [droppingDOMNode, setDroppingDOMNode] = useState<ReactElement | null>(
    null
  );
  const [droppingPosition, setDroppingPosition] = useState<
    DroppingPosition | undefined
  >();
  const droppingPositionRef = useRef<DroppingPosition | undefined>(undefined);
  droppingPositionRef.current = droppingPosition;

  // Refs for tracking previous state
  const oldDragItemRef = useRef<LayoutItem | null>(null);
  const oldResizeItemRef = useRef<LayoutItem | null>(null);
  const oldLayoutRef = useRef<Layout | null>(null);
  const dragEnterCounterRef = useRef(0);
  const prevLayoutRef = useRef<Layout>(layout);
  const prevPropsLayoutRef = useRef<Layout>(propsLayout);
  const prevChildrenRef = useRef<React.ReactNode>(children);
  const prevCompactTypeRef = useRef<CompactType>(compactType);
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const touchDragActiveRef = useRef(false);
  const activeTouchIdRef = useRef<number | null>(null);
  // Mirror of droppingDOMNode for touch handlers — lets them read current
  // placeholder state without re-binding document listeners on every move.
  const droppingDOMNodeRef = useRef<ReactElement | null>(null);
  droppingDOMNodeRef.current = droppingDOMNode;
  // Mirror of onDropProp so the document touch listeners don't rebind when the
  // consumer passes an inline onDrop (new identity every parent render). Synced
  // in a layout effect so a native touchend can't observe an uncommitted prop.
  const onDropPropRef = useRef(onDropProp);
  useLayoutEffect(() => {
    onDropPropRef.current = onDropProp;
  });

  // Ref to current layout - Critical for preventing infinite update loops (#2204).
  // This allows callbacks to access the latest layout without including `layout`
  // in dependency arrays, which would cause callbacks to be recreated on every
  // layout change and trigger infinite re-renders via GridItem's useEffect.
  const layoutRef = useRef<Layout>(layout);
  layoutRef.current = layout;

  // Mount effect - call onLayoutChange with initial layout if it differs from props
  useEffect(() => {
    setMounted(true);
    // Possibly call back with layout on mount. This should be done after correcting the layout width
    // to ensure we don't rerender with the wrong width.
    if (!deepEqual(layout, propsLayout)) {
      onLayoutChange(layout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Sync layout from props
  useEffect(() => {
    if (activeDrag) return; // Don't update during drag
    if (droppingDOMNode) return; // Don't update during drop from outside

    const layoutChanged = !deepEqual(propsLayout, prevPropsLayoutRef.current);
    const childrenChanged = !childrenEqual(children, prevChildrenRef.current);
    const compactTypeChanged = compactType !== prevCompactTypeRef.current;

    if (layoutChanged || childrenChanged || compactTypeChanged) {
      const baseLayout = layoutChanged ? propsLayout : layout;
      const newLayout = synchronizeLayoutWithChildren(
        baseLayout,
        children,
        cols,
        compactor
      );
      // Only update if the layout actually changed (#2210)
      // This prevents infinite loops when controlled state updates trigger
      // sync effects that produce the same layout
      if (!deepEqual(newLayout, layout)) {
        setLayout(newLayout);
      }
    }

    prevPropsLayoutRef.current = propsLayout;
    prevChildrenRef.current = children;
    prevCompactTypeRef.current = compactType;
  }, [
    propsLayout,
    children,
    cols,
    compactType,
    compactor,
    activeDrag,
    droppingDOMNode,
    layout
  ]);

  // Layout change callback
  useEffect(() => {
    if (!activeDrag && !deepEqual(layout, prevLayoutRef.current)) {
      prevLayoutRef.current = layout;
      // Filter out dropping placeholder - it's transient internal state only (#2210)
      // The dropping item should not be exposed to users until the actual drop happens.
      // This prevents infinite loops in controlled state patterns where children derive
      // from layout (e.g., children = layouts.map(...) with onLayoutChange={setLayouts}).
      const publicLayout = layout.filter(l => l.i !== droppingItem.i);
      onLayoutChange(publicLayout);
    }
  }, [layout, activeDrag, onLayoutChange, droppingItem.i]);

  // ============================================================================
  // Container Height
  // ============================================================================

  const containerHeight = useMemo((): string | undefined => {
    if (!autoSize) return undefined;
    const nbRow = bottom(layout);
    const containerPaddingY = effectiveContainerPadding[1];
    return (
      nbRow * rowHeight + (nbRow - 1) * margin[1] + containerPaddingY * 2 + "px"
    );
  }, [autoSize, layout, rowHeight, margin, effectiveContainerPadding]);

  // ============================================================================
  // Drag Handlers
  // ============================================================================

  const onDragStart = useCallback(
    (i: string, _x: number, _y: number, data: GridDragEvent) => {
      const currentLayout = layoutRef.current;
      const l = getLayoutItem(currentLayout, i);
      if (!l) return;

      const placeholder: LayoutItem = {
        w: l.w,
        h: l.h,
        x: l.x,
        y: l.y,
        i
      };

      oldDragItemRef.current = cloneLayoutItem(l);
      oldLayoutRef.current = currentLayout;
      setActiveDrag(placeholder);

      onDragStartProp(currentLayout, l, l, null, data.e, data.node);
    },
    [onDragStartProp]
  );

  const onDrag = useCallback(
    (i: string, x: number, y: number, data: GridDragEvent) => {
      const currentLayout = layoutRef.current;
      const oldDragItem = oldDragItemRef.current;
      const l = getLayoutItem(currentLayout, i);
      if (!l) return;

      const placeholder: LayoutItem = {
        w: l.w,
        h: l.h,
        x: l.x,
        y: l.y,
        i
      };

      // Move the element
      const newLayout = moveElement(
        currentLayout,
        l,
        x,
        y,
        true,
        preventCollision,
        compactType,
        cols,
        allowOverlap
      );

      onDragProp(newLayout, oldDragItem, l, placeholder, data.e, data.node);

      // Use compactor.compact() - it handles allowOverlap internally (#2213)
      setLayout(compactor.compact(newLayout, cols));
      setActiveDrag(placeholder);
    },
    [preventCollision, compactType, cols, allowOverlap, compactor, onDragProp]
  );

  const onDragStop = useCallback(
    (i: string, x: number, y: number, data: GridDragEvent) => {
      if (!activeDrag) return;

      const currentLayout = layoutRef.current;
      const oldDragItem = oldDragItemRef.current;
      const l = getLayoutItem(currentLayout, i);
      if (!l) return;

      const newLayout = moveElement(
        currentLayout,
        l,
        x,
        y,
        true,
        preventCollision,
        compactType,
        cols,
        allowOverlap
      );

      // Use compactor.compact() - it handles allowOverlap internally (#2213)
      const finalLayout = compactor.compact(newLayout, cols);

      onDragStopProp(finalLayout, oldDragItem, l, null, data.e, data.node);

      const oldLayout = oldLayoutRef.current;
      oldDragItemRef.current = null;
      oldLayoutRef.current = null;
      setActiveDrag(null);
      setLayout(finalLayout);

      if (oldLayout && !deepEqual(oldLayout, finalLayout)) {
        onLayoutChange(finalLayout);
      }
    },
    [
      activeDrag,
      preventCollision,
      compactType,
      cols,
      allowOverlap,
      compactor,
      onDragStopProp,
      onLayoutChange
    ]
  );

  // ============================================================================
  // Resize Handlers
  // ============================================================================

  const onResizeStart = useCallback(
    (i: string, _w: number, _h: number, data: GridResizeEvent) => {
      const currentLayout = layoutRef.current;
      const l = getLayoutItem(currentLayout, i);
      if (!l) return;

      oldResizeItemRef.current = cloneLayoutItem(l);
      oldLayoutRef.current = currentLayout;
      setResizing(true);

      onResizeStartProp(currentLayout, l, l, null, data.e, data.node);
    },
    [onResizeStartProp]
  );

  const onResize = useCallback(
    (i: string, w: number, h: number, data: GridResizeEvent) => {
      const currentLayout = layoutRef.current;
      const oldResizeItem = oldResizeItemRef.current;
      const { handle } = data;

      let shouldMoveItem = false;
      let newX: number | undefined;
      let newY: number | undefined;

      const [newLayout, l] = withLayoutItem(currentLayout, i, item => {
        newX = item.x;
        newY = item.y;

        // Handle corner/edge resizing that affects position
        if (["sw", "w", "nw", "n", "ne"].includes(handle)) {
          if (["sw", "nw", "w"].includes(handle)) {
            newX = item.x + (item.w - w);
            w = item.x !== newX && newX < 0 ? item.w : w;
            newX = newX < 0 ? 0 : newX;
          }

          if (["ne", "n", "nw"].includes(handle)) {
            newY = item.y + (item.h - h);
            h = item.y !== newY && newY < 0 ? item.h : h;
            newY = newY < 0 ? 0 : newY;
          }

          shouldMoveItem = true;
        }

        // Check for collisions if preventCollision is enabled
        if (preventCollision && !allowOverlap) {
          const collisions = getAllCollisions(currentLayout, {
            ...item,
            w,
            h,
            x: newX ?? item.x,
            y: newY ?? item.y
          }).filter(layoutItem => layoutItem.i !== item.i);

          if (collisions.length > 0) {
            newY = item.y;
            h = item.h;
            newX = item.x;
            w = item.w;
            shouldMoveItem = false;
          }
        }

        (item as Mutable<LayoutItem>).w = w;
        (item as Mutable<LayoutItem>).h = h;
        // North-side resizes anchor the bottom edge: apply the computed y so
        // the item shrinks from the top instead of staying put and sliding up
        // (#2203).
        if (handle === "n" || handle === "nw" || handle === "ne") {
          (item as Mutable<LayoutItem>).y = newY ?? item.y;
        }

        return item;
      });

      if (!l) return;

      let finalLayout = newLayout;
      if (shouldMoveItem && newX !== undefined && newY !== undefined) {
        finalLayout = moveElement(
          newLayout,
          l,
          newX,
          newY,
          true,
          preventCollision,
          compactType,
          cols,
          allowOverlap
        );
      }

      const placeholder: LayoutItem = {
        w: l.w,
        h: l.h,
        x: l.x,
        y: l.y,
        i,
        static: true
      };

      onResizeProp(
        finalLayout,
        oldResizeItem,
        l,
        placeholder,
        data.e,
        data.node
      );

      // Use compactor.compact() - it handles allowOverlap internally (#2213)
      const compactedLayout = compactor.compact(finalLayout, cols);
      // A north-handle resize anchors the bottom edge: compaction floats items
      // up, which would slide the resized item past the minH-locked item above.
      // Re-apply the anchored y after compaction so the live resize tracks the
      // pointer (#2203).
      if (handle === "n" || handle === "nw" || handle === "ne") {
        const resized = compactedLayout.find(item => item.i === i);
        if (resized) {
          (resized as Mutable<LayoutItem>).y = l.y;
        }
      }
      setLayout(compactedLayout);
      setActiveDrag(placeholder);
    },
    [preventCollision, compactType, cols, allowOverlap, compactor, onResizeProp]
  );

  const onResizeStop = useCallback(
    (i: string, _w: number, _h: number, data: GridResizeEvent) => {
      const currentLayout = layoutRef.current;
      const oldResizeItem = oldResizeItemRef.current;
      const l = getLayoutItem(currentLayout, i);

      // Use compactor.compact() - it handles allowOverlap internally (#2213)
      const finalLayout = compactor.compact(currentLayout, cols);

      onResizeStopProp(
        finalLayout,
        oldResizeItem,
        l ?? null,
        null,
        data.e,
        data.node
      );

      const oldLayout = oldLayoutRef.current;
      oldResizeItemRef.current = null;
      oldLayoutRef.current = null;
      setActiveDrag(null);
      setResizing(false);
      setLayout(finalLayout);

      if (oldLayout && !deepEqual(oldLayout, finalLayout)) {
        onLayoutChange(finalLayout);
      }
    },
    [cols, compactor, onResizeStopProp, onLayoutChange]
  );

  // ============================================================================
  // Shared drop pipeline helpers (used by both the HTML5 drag-over and the
  // touch adapter so the two event sources stay behaviorally identical)
  // ============================================================================

  /**
   * Create or update the dropping placeholder + its layout entry.
   * Both handleDragOver and the touch adapter call this after computing a
   * drop position; they differ only in which dropping item they place.
   */
  const placeDroppingItem = useCallback(
    (
      itemToPlace: { i: string; w: number; h: number },
      newDroppingPosition: DroppingPosition,
      calculatedXY: { x: number; y: number },
      hasPlaceholder: boolean
    ) => {
      if (!hasPlaceholder) {
        setDroppingDOMNode(<div key={itemToPlace.i} />);
        setDroppingPosition(newDroppingPosition);
        // Filter out any stale __dropping-elem__ before adding the new one.
        // This prevents duplicate IDs caused by a race condition where
        // handleDragLeave's removeDroppingPlaceholder() checks layoutRef
        // before a batched setLayout from a previous handleDragOver has
        // rendered, leaving __dropping-elem__ in the layout while
        // droppingDOMNode is null.
        const baseLayout = layoutRef.current.filter(l => l.i !== itemToPlace.i);
        setLayout([
          ...baseLayout,
          {
            ...itemToPlace,
            x: calculatedXY.x,
            y: calculatedXY.y,
            static: false,
            isDraggable: true
          }
        ]);
      } else if (droppingPositionRef.current) {
        const shouldUpdate =
          droppingPositionRef.current.left !== newDroppingPosition.left ||
          droppingPositionRef.current.top !== newDroppingPosition.top;
        if (shouldUpdate) {
          setDroppingPosition(newDroppingPosition);
          // Keep the placeholder's layout entry in sync so commitDrop/onDrop
          // reads the latest cell, not the initial one (#2284).
          setLayout(currentLayout =>
            currentLayout.map(item =>
              item.i === itemToPlace.i &&
              (item.x !== calculatedXY.x || item.y !== calculatedXY.y)
                ? { ...item, x: calculatedXY.x, y: calculatedXY.y }
                : item
            )
          );
        }
      }
    },
    []
  );

  const applyTouchDropPosition = useCallback(
    (clientX: number, clientY: number, nativeEvent: Event) => {
      const gridEl = gridContainerRef.current;
      if (!gridEl) return;

      const { newDroppingPosition, calculatedXY } = computeDropPosition({
        clientX,
        clientY,
        gridElement: gridEl,
        droppingItem,
        event: nativeEvent,
        transformScale,
        cols,
        margin: margin as [number, number],
        maxRows,
        rowHeight,
        width,
        containerPadding: effectiveContainerPadding as [number, number]
      });

      placeDroppingItem(
        droppingItem,
        newDroppingPosition,
        calculatedXY,
        !!droppingDOMNodeRef.current
      );
    },
    [
      droppingItem,
      transformScale,
      cols,
      margin,
      maxRows,
      rowHeight,
      width,
      effectiveContainerPadding,
      placeDroppingItem
    ]
  );

  // Drop Handlers
  // ============================================================================

  const removeDroppingPlaceholder = useCallback(() => {
    // Guard against being called when there's no dropping item (#2210)
    // This makes the function idempotent and safe to call multiple times
    const currentLayout = layoutRef.current;
    const hasDroppingItem = currentLayout.some(l => l.i === droppingItem.i);
    if (!hasDroppingItem) {
      // Nothing to remove, just ensure state is clean
      setDroppingDOMNode(null);
      setActiveDrag(null);
      setDroppingPosition(undefined);
      return;
    }

    // Use compactor.compact() - it handles allowOverlap internally (#2213)
    const newLayout = compactor.compact(
      currentLayout.filter(l => l.i !== droppingItem.i),
      cols
    );

    setLayout(newLayout);
    setDroppingDOMNode(null);
    setActiveDrag(null);
    setDroppingPosition(undefined);
  }, [droppingItem.i, cols, compactor]);

  const handleDragOver = useCallback(
    (e: ReactDragEvent): void | false => {
      e.preventDefault();
      e.stopPropagation();

      // Firefox hack
      if (
        isFirefox &&
        !(e.nativeEvent.target as HTMLElement)?.classList.contains(
          layoutClassName
        )
      ) {
        return false;
      }

      // Use dropConfig.onDragOver if provided, otherwise fall back to onDropDragOver prop (#2212)
      // dropConfig.onDragOver uses native DragEvent, onDropDragOver uses React's DragEvent
      const rawResult = dropConfigOnDragOver
        ? dropConfigOnDragOver(e.nativeEvent as DragEvent)
        : onDropDragOverProp(e);
      if (rawResult === false) {
        if (droppingDOMNode) {
          removeDroppingPlaceholder();
        }
        return false;
      }
      const {
        dragOffsetX = 0,
        dragOffsetY = 0,
        ...onDragOverResult
      } = rawResult ?? {};

      const finalDroppingItem = { ...droppingItem, ...onDragOverResult };

      const { newDroppingPosition, calculatedXY } = computeDropPosition({
        clientX: e.clientX,
        clientY: e.clientY,
        gridElement: e.currentTarget as HTMLElement,
        droppingItem: finalDroppingItem,
        event: e.nativeEvent,
        dragOffsetX,
        dragOffsetY,
        transformScale,
        cols,
        margin: margin as [number, number],
        maxRows,
        rowHeight,
        width,
        containerPadding: effectiveContainerPadding as [number, number]
      });

      placeDroppingItem(
        finalDroppingItem,
        newDroppingPosition,
        calculatedXY,
        !!droppingDOMNode
      );
    },
    [
      droppingDOMNode,
      droppingItem,
      dropConfigOnDragOver,
      onDropDragOverProp,
      removeDroppingPlaceholder,
      placeDroppingItem,
      transformScale,
      cols,
      margin,
      maxRows,
      rowHeight,
      width,
      effectiveContainerPadding
    ]
  );

  const handleDragLeave = useCallback(
    (e: ReactDragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragEnterCounterRef.current--;

      // Guard against negative counter (#2210)
      // This can happen in edge cases with event timing or bubbling
      if (dragEnterCounterRef.current < 0) {
        dragEnterCounterRef.current = 0;
      }

      if (dragEnterCounterRef.current === 0) {
        removeDroppingPlaceholder();
      }
    },
    [removeDroppingPlaceholder]
  );

  const handleDragEnter = useCallback((e: ReactDragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragEnterCounterRef.current++;
  }, []);

  /**
   * Commit a drop: find the placed item, clear the placeholder, fire onDrop.
   * Shared by desktop handleDrop and the touch adapter's touchend.
   */
  const commitDrop = useCallback(
    (nativeEvent: Event) => {
      const currentLayout = layoutRef.current;
      const item = currentLayout.find(l => l.i === droppingItem.i);
      removeDroppingPlaceholder();
      onDropPropRef.current(currentLayout, item, nativeEvent);
    },
    [droppingItem.i, removeDroppingPlaceholder]
  );

  const handleDrop = useCallback(
    (e: ReactDragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragEnterCounterRef.current = 0;
      commitDrop(e.nativeEvent);
    },
    [commitDrop]
  );

  // ============================================================================
  // Touch external-drop adapter
  // ============================================================================
  //
  // HTML5 dragover/drop never fires on touch devices, so external drag-and-drop
  // (drop-from-outside) is dead on mobile. This adapter translates touch events
  // on a user-marked source element into the same drop pipeline handleDragOver/
  // handleDrop use: touchmove places the dropping placeholder under the finger,
  // touchend commits it via onDrop, and any touch leaving the grid removes the
  // placeholder.
  //
  // Listeners are attached to the document because the source element is outside
  // the grid: a touch that starts on a sibling element retargets touchmove to the
  // element where touchstart fired, so the grid's own handlers would never see it.
  useEffect(() => {
    if (!isDroppable || !touchEnabled) return;

    const gridEl = gridContainerRef.current;
    if (!gridEl) return;

    const isOverGrid = (clientX: number, clientY: number): boolean => {
      const el = document.elementFromPoint(clientX, clientY);
      return el ? gridEl.contains(el as Node) : false;
    };

    const isSourceElement = (target: EventTarget | null): boolean => {
      if (!(target instanceof HTMLElement)) return false;
      return target.closest(touchDragSource) !== null;
    };

    const getTouch = (e: TouchEvent): Touch | undefined => {
      const touches = e.changedTouches;
      if (!touches || touches.length === 0) return undefined;
      const id = activeTouchIdRef.current;
      if (id === null) return touches[0];
      for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        if (touch && touch.identifier === id) return touch;
      }
      return undefined;
    };

    const handleTouchStart = (e: TouchEvent): void => {
      if (!isSourceElement(e.target)) return;
      if (activeTouchIdRef.current !== null) return;
      e.preventDefault();
      const touch = e.changedTouches?.[0];
      if (!touch) return;
      activeTouchIdRef.current = touch.identifier;
      touchDragActiveRef.current = true;
    };

    const handleTouchMove = (e: TouchEvent): void => {
      if (!touchDragActiveRef.current) return;
      e.preventDefault();
      const touch = getTouch(e);
      if (!touch) return;
      if (!isOverGrid(touch.clientX, touch.clientY)) {
        if (droppingDOMNodeRef.current) removeDroppingPlaceholder();
        return;
      }
      applyTouchDropPosition(touch.clientX, touch.clientY, e);
    };

    const handleTouchEnd = (e: TouchEvent): void => {
      if (!touchDragActiveRef.current) return;
      e.preventDefault();
      const touch = getTouch(e);
      touchDragActiveRef.current = false;
      activeTouchIdRef.current = null;
      if (!touch) return;
      if (!isOverGrid(touch.clientX, touch.clientY)) {
        removeDroppingPlaceholder();
        return;
      }
      // Commit the drop — same path as handleDrop
      commitDrop(e);
    };

    const handleTouchCancel = (): void => {
      if (!touchDragActiveRef.current) return;
      touchDragActiveRef.current = false;
      activeTouchIdRef.current = null;
      removeDroppingPlaceholder();
    };

    const opts: AddEventListenerOptions = { passive: false };
    document.addEventListener("touchstart", handleTouchStart, opts);
    document.addEventListener("touchmove", handleTouchMove, opts);
    document.addEventListener("touchend", handleTouchEnd, opts);
    document.addEventListener("touchcancel", handleTouchCancel, opts);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart, opts);
      document.removeEventListener("touchmove", handleTouchMove, opts);
      document.removeEventListener("touchend", handleTouchEnd, opts);
      document.removeEventListener("touchcancel", handleTouchCancel, opts);
    };
  }, [
    isDroppable,
    touchEnabled,
    touchDragSource,
    applyTouchDropPosition,
    removeDroppingPlaceholder,
    commitDrop,
    droppingItem.i
  ]);

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const processGridItem = useCallback(
    (
      child: ReactElement,
      isDroppingItem?: boolean
    ): ReactElement | null | undefined => {
      if (!child || !child.key) return null;

      const l = getLayoutItem(layout, String(child.key));
      if (!l) return null;

      const draggable =
        typeof l.isDraggable === "boolean"
          ? l.isDraggable
          : !l.static && isDraggable;
      const resizable =
        typeof l.isResizable === "boolean"
          ? l.isResizable
          : !l.static && isResizable;
      const resizeHandlesOptions = l.resizeHandles || [...resizeHandles];
      const bounded = draggable && isBounded && l.isBounded !== false;

      // Cast resize handle to expected type (function signature is compatible)
      const resizeHandleElement = resizeHandle as ResizeHandle | undefined;

      return (
        <GridItem
          key={l.i}
          containerWidth={width}
          cols={cols}
          margin={margin}
          containerPadding={effectiveContainerPadding}
          maxRows={maxRows}
          rowHeight={rowHeight}
          cancel={draggableCancel}
          handle={draggableHandle}
          onDragStart={onDragStart}
          onDrag={onDrag}
          onDragStop={onDragStop}
          onResizeStart={onResizeStart}
          onResize={onResize}
          onResizeStop={onResizeStop}
          isDraggable={draggable}
          isResizable={resizable}
          isBounded={bounded}
          allowMobileScroll={dragAllowMobileScroll}
          useCSSTransforms={useCSSTransforms && mounted}
          usePercentages={!mounted}
          transformScale={transformScale}
          positionStrategy={positionStrategy}
          dragThreshold={dragThreshold}
          w={l.w}
          h={l.h}
          x={l.x}
          y={l.y}
          i={l.i}
          minH={l.minH}
          minW={l.minW}
          maxH={l.maxH}
          maxW={l.maxW}
          static={l.static}
          droppingPosition={isDroppingItem ? droppingPosition : undefined}
          resizeHandles={resizeHandlesOptions}
          resizeHandle={resizeHandleElement}
          constraints={constraints}
          layoutItem={l}
          layout={layout}
        >
          {child}
        </GridItem>
      );
    },
    [
      layout,
      width,
      cols,
      margin,
      effectiveContainerPadding,
      maxRows,
      rowHeight,
      draggableCancel,
      draggableHandle,
      onDragStart,
      onDrag,
      onDragStop,
      onResizeStart,
      onResize,
      onResizeStop,
      isDraggable,
      isResizable,
      isBounded,
      useCSSTransforms,
      mounted,
      transformScale,
      positionStrategy,
      dragThreshold,
      droppingPosition,
      resizeHandles,
      resizeHandle,
      constraints
    ]
  );

  const renderPlaceholder = (): ReactElement | null => {
    if (!activeDrag) return null;

    return (
      <GridItem
        w={activeDrag.w}
        h={activeDrag.h}
        x={activeDrag.x}
        y={activeDrag.y}
        i={activeDrag.i}
        className={`react-grid-placeholder ${resizing ? "placeholder-resizing" : ""}`}
        containerWidth={width}
        cols={cols}
        margin={margin}
        containerPadding={effectiveContainerPadding}
        maxRows={maxRows}
        rowHeight={rowHeight}
        isDraggable={false}
        isResizable={false}
        isBounded={false}
        useCSSTransforms={useCSSTransforms}
        transformScale={transformScale}
        constraints={constraints}
        layout={layout}
      >
        <div />
      </GridItem>
    );
  };

  // ============================================================================
  // Render
  // ============================================================================

  // Stable ref callback: an inline arrow would be re-invoked (null -> node) on
  // every render, which during a touch drag would momentarily null the grid ref
  // on each move. Keyed on innerRef so it stays stable across the hot path.
  const setGridRef = useCallback(
    (node: HTMLDivElement | null) => {
      gridContainerRef.current = node;
      if (typeof innerRef === "function") {
        innerRef(node);
      } else if (innerRef && "current" in innerRef) {
        (innerRef as MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [innerRef]
  );

  const mergedClassName = clsx(layoutClassName, className);
  const mergedStyle: CSSProperties = {
    height: containerHeight,
    ...style
  };

  return (
    <div
      ref={setGridRef}
      className={mergedClassName}
      style={mergedStyle}
      onDrop={isDroppable ? handleDrop : undefined}
      onDragLeave={isDroppable ? handleDragLeave : undefined}
      onDragEnter={isDroppable ? handleDragEnter : undefined}
      onDragOver={isDroppable ? handleDragOver : undefined}
    >
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return null;
        return processGridItem(child);
      })}
      {isDroppable && droppingDOMNode && processGridItem(droppingDOMNode, true)}
      {renderPlaceholder()}
    </div>
  );
}

export default GridLayout;
