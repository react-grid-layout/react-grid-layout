/**
 * GridLayout component
 *
 * A reactive, fluid grid layout with draggable, resizable components.
 */

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type ReactElement,
  type CSSProperties,
  type DragEvent as ReactDragEvent
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
  EventCallback,
  CrossGridConfig
} from "../../core/types.js";
import {
  defaultGridConfig,
  defaultDragConfig,
  defaultResizeConfig,
  defaultDropConfig
} from "../../core/types.js";
import type { PositionParams } from "../../core/calculate.js";
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
import {
  calcXY,
  calcGridColWidth,
  calcGridItemWHPx
} from "../../core/calculate.js";
import { defaultPositionStrategy } from "../../core/position.js";
import { defaultConstraints } from "../../core/constraints.js";

import { GridItem, type ResizeHandle } from "./GridItem.js";
import { useCrossGridDrag } from "../hooks/useCrossGridDrag.js";

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

  /**
   * Cross-grid drag-and-drop configuration.
   *
   * Supply this prop together with a `CrossGridDragProvider` ancestor to allow
   * items to be dragged seamlessly between multiple GridLayout instances.
   * Each participating grid must have a unique `gridId`.
   *
   * @see CrossGridConfig
   * @see CrossGridDragProvider
   */
  crossGridConfig?: CrossGridConfig;
}

// ============================================================================
// Utility Functions
// ============================================================================

const noop = () => {};

const layoutClassName = "react-grid-layout";

/**
 * Internal item id used for the cross-grid ghost placeholder.
 * Filtered out of every public layout callback — callers never see it.
 */
const CROSS_GRID_DROPPING_ID = "__cross-grid-dropping-elem__";

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
    onDropDragOver: onDropDragOverProp = noop,

    // Cross-grid drag
    crossGridConfig
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
    threshold: dragThreshold
  } = dragConfig;
  const {
    enabled: isResizable,
    handles: resizeHandles,
    handleComponent: resizeHandle
  } = resizeConfig;
  const {
    enabled: isDroppable,
    defaultItem: defaultDropItem,
    onDragOver: dropConfigOnDragOver
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

  // Ghost item shown in this grid while a peer grid's item hovers over it.
  // Kept separate from activeDrag so internal drag and incoming drag don't interfere.
  const [crossGridGhostItem, setCrossGridGhostItem] =
    useState<LayoutItem | null>(null);

  // Ref used by the cross-grid incoming-drag effect to read the latest ghost
  // without adding it to the effect's dependency array (which would cause loops).
  const crossGridGhostItemRef = useRef<LayoutItem | null>(null);
  crossGridGhostItemRef.current = crossGridGhostItem;

  // Refs for tracking previous state
  const oldDragItemRef = useRef<LayoutItem | null>(null);
  const oldResizeItemRef = useRef<LayoutItem | null>(null);
  const oldLayoutRef = useRef<Layout | null>(null);
  const dragEnterCounterRef = useRef(0);
  const prevLayoutRef = useRef<Layout>(layout);
  const prevPropsLayoutRef = useRef<Layout>(propsLayout);
  const prevChildrenRef = useRef<React.ReactNode>(children);
  const prevCompactTypeRef = useRef<CompactType>(compactType);

  // Ref to current layout - Critical for preventing infinite update loops (#2204).
  // This allows callbacks to access the latest layout without including `layout`
  // in dependency arrays, which would cause callbacks to be recreated on every
  // layout change and trigger infinite re-renders via GridItem's useEffect.
  const layoutRef = useRef<Layout>(layout);
  layoutRef.current = layout;

  // Internal ref for the grid container element.
  // Used by cross-grid drag for hit-testing and position calculations.
  // Composed with the user-provided `innerRef` via mergedRef below.
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Stable callback ref that writes both containerRef and the user's innerRef.
  const mergedRef = useCallback(
    (el: HTMLDivElement | null) => {
      containerRef.current = el;
      if (typeof innerRef === "function") {
        innerRef(el);
      } else if (innerRef != null) {
        (innerRef as React.MutableRefObject<HTMLDivElement | null>).current =
          el;
      }
    },
    [innerRef]
  );

  // ============================================================================
  // Cross-Grid Drag Setup
  // ============================================================================

  /**
   * Called synchronously by the provider when an item from a peer grid is
   * dropped onto this grid.  Computes the grid-unit position from the viewport
   * coordinates, places the item into the local layout, and fires callbacks.
   */
  const onIncomingDrop = useCallback(
    (item: LayoutItem, clientX: number, clientY: number): void => {
      const containerEl = containerRef.current;
      if (!containerEl) return;

      const rect = containerEl.getBoundingClientRect();

      const positionParams: PositionParams = {
        cols,
        margin: margin as [number, number],
        maxRows,
        rowHeight,
        containerWidth: width,
        containerPadding: effectiveContainerPadding as [number, number]
      };

      // Mirror the centering offset used by the ghost effect so the item lands
      // at the same grid position the ghost was displaying.
      const actualColWidth = calcGridColWidth(positionParams);
      const itemPixelWidth = calcGridItemWHPx(
        item.w,
        actualColWidth,
        (margin as [number, number])[0]
      );
      const itemPixelHeight = calcGridItemWHPx(
        item.h,
        rowHeight,
        (margin as [number, number])[1]
      );
      const rawGridX = Math.max(0, clientX - rect.left - itemPixelWidth / 2);
      const rawGridY = Math.max(0, clientY - rect.top - itemPixelHeight / 2);

      const { x, y } = calcXY(
        positionParams,
        rawGridY,
        rawGridX,
        item.w,
        item.h
      );

      const newItem: LayoutItem = { ...item, x, y };

      // Remove any cross-grid ghost and prevent duplicate item ids.
      const baseLayout = layoutRef.current.filter(
        l => l.i !== CROSS_GRID_DROPPING_ID && l.i !== item.i
      );
      const withNewItem = [...baseLayout, newItem];
      const movedLayout = moveElement(
        withNewItem,
        newItem,
        x,
        y,
        true,
        preventCollision,
        compactType,
        cols,
        allowOverlap
      );
      const finalLayout = compactor.compact(movedLayout, cols);

      setCrossGridGhostItem(null);
      setLayout(finalLayout);
      // Update prevLayoutRef so the layout-change effect does not fire a
      // duplicate onLayoutChange call after this synchronous one.
      prevLayoutRef.current = finalLayout;
      onLayoutChange(finalLayout);
      crossGridConfig?.onItemDroppedIn?.(newItem, finalLayout);
    },
    [
      cols,
      margin,
      maxRows,
      rowHeight,
      width,
      effectiveContainerPadding,
      preventCollision,
      compactType,
      allowOverlap,
      compactor,
      onLayoutChange,
      crossGridConfig
    ]
  );

  const { publishDrag, commitDrop, incomingDragState } = useCrossGridDrag(
    crossGridConfig,
    containerRef,
    onIncomingDrop
  );

  // ============================================================================
  // Incoming Cross-Grid Drag Effect
  // ============================================================================

  /**
   * React to incoming drag state from a peer grid.
   *
   * When an item from another grid hovers over this grid's container, we:
   *   1. Compute the grid-unit position where the item would land.
   *   2. Add a ghost placeholder to the local layout (pushing other items aside).
   *   3. Update the ghost position on every drag frame.
   *
   * When the drag leaves or ends, we remove the ghost and restore the layout.
   */
  useEffect(() => {
    const currentGhost = crossGridGhostItemRef.current;

    if (!incomingDragState) {
      // Cross-grid drag ended or cursor left the provider — clean up ghost.
      if (currentGhost) {
        const restored = compactor.compact(
          layoutRef.current.filter(l => l.i !== CROSS_GRID_DROPPING_ID),
          cols
        );
        setLayout(restored);
        setCrossGridGhostItem(null);
      }
      return;
    }

    const containerEl = containerRef.current;
    if (!containerEl) return;

    const rect = containerEl.getBoundingClientRect();
    const { clientX, clientY, item } = incomingDragState;

    // Only show the ghost while the cursor is actually within this grid.
    const isOverGrid =
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom;

    if (!isOverGrid) {
      if (currentGhost) {
        const restored = compactor.compact(
          layoutRef.current.filter(l => l.i !== CROSS_GRID_DROPPING_ID),
          cols
        );
        setLayout(restored);
        setCrossGridGhostItem(null);
      }
      return;
    }

    const positionParams: PositionParams = {
      cols,
      margin: margin as [number, number],
      maxRows,
      rowHeight,
      containerWidth: width,
      containerPadding: effectiveContainerPadding as [number, number]
    };

    // Center the ghost on the cursor (mirrors handleDragOver centering).
    const actualColWidth = calcGridColWidth(positionParams);
    const itemPixelWidth = calcGridItemWHPx(
      item.w,
      actualColWidth,
      (margin as [number, number])[0]
    );
    const itemPixelHeight = calcGridItemWHPx(
      item.h,
      rowHeight,
      (margin as [number, number])[1]
    );
    const rawGridX = Math.max(0, clientX - rect.left - itemPixelWidth / 2);
    const rawGridY = Math.max(0, clientY - rect.top - itemPixelHeight / 2);

    const { x, y } = calcXY(positionParams, rawGridY, rawGridX, item.w, item.h);

    // Skip the layout update when the ghost hasn't moved to a new grid cell.
    if (currentGhost && currentGhost.x === x && currentGhost.y === y) return;

    const ghostItem: LayoutItem = {
      ...item,
      i: CROSS_GRID_DROPPING_ID,
      x,
      y,
      static: false,
      isDraggable: false,
      isResizable: false
    };

    // Inject the ghost and run moveElement so other items move out of the way.
    const baseLayout = layoutRef.current.filter(
      l => l.i !== CROSS_GRID_DROPPING_ID
    );
    const withGhost = [...baseLayout, ghostItem];
    const movedLayout = moveElement(
      withGhost,
      ghostItem,
      x,
      y,
      true,
      preventCollision,
      compactType,
      cols,
      allowOverlap
    );
    setLayout(compactor.compact(movedLayout, cols));
    setCrossGridGhostItem(ghostItem);
  }, [
    incomingDragState,
    cols,
    margin,
    maxRows,
    rowHeight,
    width,
    effectiveContainerPadding,
    preventCollision,
    compactType,
    allowOverlap,
    compactor
  ]);

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
    if (crossGridGhostItem) return; // Don't update while a peer-grid ghost is shown

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
    crossGridGhostItem,
    layout
  ]);

  // Layout change callback
  useEffect(() => {
    // Skip while dragging or while showing a cross-grid ghost — both are transient.
    if (activeDrag || crossGridGhostItem) return;

    if (!deepEqual(layout, prevLayoutRef.current)) {
      prevLayoutRef.current = layout;
      // Filter out transient placeholders — callers must never see them.
      // - droppingItem.i: external-drop ghost (#2210)
      // - CROSS_GRID_DROPPING_ID: peer-grid incoming ghost
      const publicLayout = layout.filter(
        l => l.i !== droppingItem.i && l.i !== CROSS_GRID_DROPPING_ID
      );
      onLayoutChange(publicLayout);
    }
  }, [layout, activeDrag, crossGridGhostItem, onLayoutChange, droppingItem.i]);

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

      // Notify peer grids that a drag has started so they can prepare their ghost.
      if (crossGridConfig) {
        const mouseEvent = data.e as MouseEvent;
        publishDrag(l, mouseEvent.clientX, mouseEvent.clientY);
      }
    },
    [onDragStartProp, crossGridConfig, publishDrag]
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

      // Keep peer grids updated with the latest cursor position so they can
      // show / update the ghost placeholder.
      if (crossGridConfig) {
        const mouseEvent = data.e as MouseEvent;
        publishDrag(l, mouseEvent.clientX, mouseEvent.clientY);
      }
    },
    [
      preventCollision,
      compactType,
      cols,
      allowOverlap,
      compactor,
      onDragProp,
      crossGridConfig,
      publishDrag
    ]
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

      // Check whether the item was released on a peer grid.
      if (crossGridConfig) {
        const mouseEvent = data.e as MouseEvent;
        const droppedOnPeer = commitDrop(
          l,
          mouseEvent.clientX,
          mouseEvent.clientY
        );

        if (droppedOnPeer) {
          // Remove the dragged item from this grid's layout.
          const withoutItem = layoutRef.current.filter(li => li.i !== i);
          const compactedWithout = compactor.compact(withoutItem, cols);

          oldDragItemRef.current = null;
          oldLayoutRef.current = null;
          setActiveDrag(null);
          setLayout(compactedWithout);
          onLayoutChange(compactedWithout);
          crossGridConfig.onItemDraggedOut?.(l);
          return;
        }
        // Not dropped on a peer — fall through to normal drop handling.
        // commitDrop already called publishDrag(null) to clear context state.
      }

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
      onLayoutChange,
      crossGridConfig,
      commitDrop
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
      setLayout(compactor.compact(finalLayout, cols));
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
      const gridRect = e.currentTarget.getBoundingClientRect();

      // Calculate position params for proper column width calculation
      const positionParams: PositionParams = {
        cols,
        margin: margin as [number, number],
        maxRows,
        rowHeight,
        containerWidth: width,
        containerPadding: effectiveContainerPadding as [number, number]
      };

      // Calculate actual column width accounting for margins and padding
      const actualColWidth = calcGridColWidth(positionParams);

      // Calculate item dimensions in pixels including margins between cells
      const itemPixelWidth = calcGridItemWHPx(
        finalDroppingItem.w,
        actualColWidth,
        (margin as [number, number])[0]
      );
      const itemPixelHeight = calcGridItemWHPx(
        finalDroppingItem.h,
        rowHeight,
        (margin as [number, number])[1]
      );

      // Center the dropping item by offsetting by half its size
      const itemCenterOffsetX = itemPixelWidth / 2;
      const itemCenterOffsetY = itemPixelHeight / 2;

      // Calculate mouse position relative to grid, accounting for drag offset and item centering
      const rawGridX =
        e.clientX - gridRect.left + dragOffsetX - itemCenterOffsetX;
      const rawGridY =
        e.clientY - gridRect.top + dragOffsetY - itemCenterOffsetY;

      // Clamp to prevent negative positions (calcXY handles upper bound clamping)
      const clampedGridX = Math.max(0, rawGridX);
      const clampedGridY = Math.max(0, rawGridY);

      const newDroppingPosition: DroppingPosition = {
        left: clampedGridX / transformScale,
        top: clampedGridY / transformScale,
        e: e.nativeEvent
      };

      if (!droppingDOMNode) {
        const calculatedPosition = calcXY(
          positionParams,
          clampedGridY,
          clampedGridX,
          finalDroppingItem.w,
          finalDroppingItem.h
        );

        setDroppingDOMNode(<div key={finalDroppingItem.i} />);
        setDroppingPosition(newDroppingPosition);
        // Filter out any stale __dropping-elem__ before adding the new one.
        // This prevents duplicate IDs caused by a race condition where
        // handleDragLeave's removeDroppingPlaceholder() checks layoutRef
        // before a batched setLayout from a previous handleDragOver has
        // rendered, leaving __dropping-elem__ in the layout while
        // droppingDOMNode is null.
        const baseLayout = layoutRef.current.filter(
          l => l.i !== finalDroppingItem.i
        );
        setLayout([
          ...baseLayout,
          {
            ...finalDroppingItem,
            x: calculatedPosition.x,
            y: calculatedPosition.y,
            static: false,
            isDraggable: true
          }
        ]);
      } else if (droppingPosition) {
        const shouldUpdate =
          droppingPosition.left !== newDroppingPosition.left ||
          droppingPosition.top !== newDroppingPosition.top;
        if (shouldUpdate) {
          setDroppingPosition(newDroppingPosition);
        }
      }
    },
    [
      droppingDOMNode,
      droppingPosition,
      droppingItem,
      dropConfigOnDragOver,
      onDropDragOverProp,
      removeDroppingPlaceholder,
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

  const handleDrop = useCallback(
    (e: ReactDragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const currentLayout = layoutRef.current;
      const item = currentLayout.find(l => l.i === droppingItem.i);
      dragEnterCounterRef.current = 0;
      removeDroppingPlaceholder();
      onDropProp(currentLayout, item, e.nativeEvent);
    },
    [droppingItem.i, removeDroppingPlaceholder, onDropProp]
  );

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

  /**
   * Render the ghost placeholder shown in this grid while an item is being
   * dragged in from a peer grid.  Uses the same visual style as the normal
   * drag placeholder so users get a consistent drop-target indicator.
   */
  const renderCrossGridGhost = (): ReactElement | null => {
    if (!crossGridGhostItem) return null;

    return (
      <GridItem
        key={CROSS_GRID_DROPPING_ID}
        w={crossGridGhostItem.w}
        h={crossGridGhostItem.h}
        x={crossGridGhostItem.x}
        y={crossGridGhostItem.y}
        i={CROSS_GRID_DROPPING_ID}
        className="react-grid-placeholder"
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

  const mergedClassName = clsx(layoutClassName, className);
  const mergedStyle: CSSProperties = {
    height: containerHeight,
    ...style
  };

  return (
    <div
      ref={mergedRef}
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
      {renderCrossGridGhost()}
    </div>
  );
}

export default GridLayout;
