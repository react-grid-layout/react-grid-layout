# Data Models Codemap

> Generated: 2026-08-05 | Token-lean format for LLM context

All types in `src/core/types.ts`.

## Core Data Structures

```typescript
interface LayoutItem {
  i: string;              // unique identifier
  x: number;              // X position (grid units)
  y: number;              // Y position (grid units)
  w: number;              // width (grid units)
  h: number;              // height (grid units)
  minW?: number;          // min width
  maxW?: number;          // max width (Infinity = unbounded)
  minH?: number;          // min height
  maxH?: number;          // max height (Infinity = unbounded)
  static?: boolean;       // cannot be moved/resized
  isDraggable?: boolean;  // per-item override
  isResizable?: boolean;  // per-item override
  resizeHandles?: ResizeHandleAxis[];
  isBounded?: boolean;    // constrain to container
  moved?: boolean;        // internal: moved during drag
  constraints?: LayoutConstraint[];  // per-item constraints
}

type Layout = readonly LayoutItem[];
type ResizeHandleAxis = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
type CompactType = "horizontal" | "vertical" | "wrap" | null;
```

## Config Defaults

| Config | Type | Defaults |
|---|---|---|
| `GridConfig` | {cols, rowHeight, margin, containerPadding, maxRows} | 12, 150, [10,10], null, Infinity |
| `DragConfig` | {enabled, bounded, handle?, cancel?, threshold, allowMobileScroll?} | true, false, 3, undefined |
| `ResizeConfig` | {enabled, handles, handleComponent?} | true, ["se"] |
| `DropConfig` | {enabled, defaultItem, onDragOver?, touchEnabled?, touchDragSource?} | false, {w:1,h:1}, true, `[data-rgl-draggable]` |

## Strategy Interfaces

### Compactor
```typescript
{ type: string; allowOverlap: boolean;
  preventCollision?: boolean;
  compact(layout: Layout, cols: number): Layout }
```
Implementations: verticalCompactor, horizontalCompactor, noCompactor, verticalOverlapCompactor, horizontalOverlapCompactor, noOverlapCompactor (core); fastVertical/Horizontal (extras); wrapCompactor (extras).

### PositionStrategy
```typescript
{ type: string; scale: number;
  calcStyle(position: Position): CSSProperties;
  calcDragPosition?(clientX, clientY, offsetX, offsetY): PartialPosition }
```
Implementations: transformStrategy (default), absoluteStrategy, createScaledStrategy(scale).

### LayoutConstraint
```typescript
{ name: string;
  constrainPosition?(item, x, y, context): {x, y};
  constrainSize?(item, w, h, handle, context): {w, h} }
```
Built-in: gridBounds, minMaxSize, containerBounds (constrainPosition + constrainSize), boundedX, boundedY.
Factories: aspectRatio(ratio), snapToGrid(size), minSize(w,h), maxSize(w,h).
Default chain: `[gridBounds, minMaxSize]`.

## Position & Pixel Types

```typescript
interface Position { left: number; top: number; width: number; height: number }
interface PartialPosition { left: number; top: number }
interface Size { width: number; height: number }
interface DroppingPosition { left: number; top: number; e: Event }
```

## Event Types

```typescript
type EventCallback = (layout, oldItem, newItem, placeholder, event, element) => void;
type OnLayoutChangeCallback = (layout: Layout) => void;
interface GridDragEvent { e: Event; node: HTMLElement; newPosition: PartialPosition }
interface GridResizeEvent { e: Event; node: HTMLElement; size: Size; handle: ResizeHandleAxis }
interface DragOverEvent extends MouseEvent { dataTransfer: DataTransfer }
```

## Responsive Types

```typescript
type Breakpoint = string;
type Breakpoints<B> = Record<B, number>;        // breakpoint -> pixel width
type BreakpointCols<B> = Record<B, number>;      // breakpoint -> column count
type ResponsiveLayouts<B> = Partial<Record<B, Layout>>;
type DefaultBreakpoints = "lg" | "md" | "sm" | "xs" | "xxs";
```

## Calculation Types

```typescript
interface PositionParams {
  margin: [number, number]; containerPadding: [number, number];
  containerWidth: number; cols: number; rowHeight: number; maxRows: number
}
interface GridCellDimensions { colWidth: number; rowHeight: number }
interface ConstraintContext {
  cols: number; maxRows: number; containerWidth: number;
  containerHeight: number; rowHeight: number; margin: [number, number]; layout: Layout
}
```
