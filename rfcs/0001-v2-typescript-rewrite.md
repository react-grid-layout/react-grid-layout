# RFC 0001: React-Grid-Layout v2 TypeScript Rewrite

- **Status**: Implemented (with simplifications)
- **Author**: @STRML
- **Created**: 2025-12-08

## Summary

Rewrite react-grid-layout in TypeScript with a modernized, composable API while maintaining backwards compatibility through a dedicated legacy wrapper.

## Motivation

1. **Type Safety**: Flow is no longer actively maintained. TypeScript provides better tooling, IDE support, and community adoption.

2. **Composability**: The current monolithic component design makes customization difficult. Users want to:
   - Use custom compaction algorithms
   - Implement custom positioning strategies (CSS Grid, Flexbox)
   - Access layout state without rendering the full grid
   - Compose grid functionality with other libraries

3. **Modern React Patterns**: The library predates hooks. A hooks-based API would be more ergonomic for modern React applications.

4. **Bundle Size**: Separating core logic from React components enables tree-shaking and smaller bundles for users who only need parts of the library.

## Design Principles

1. **Core logic is pure TypeScript** - No React dependencies in layout algorithms
2. **Composition over configuration** - Small, focused pieces that compose well
3. **Immutable by default** - All callbacks receive immutable data
4. **Backwards compatible** - Legacy wrapper preserves v1 API exactly
5. **Incrementally adoptable** - Users can migrate piece by piece

## Breaking Changes in v2

### 1. `onDragStart` No Longer Fires on Click-Only Events

**Issue**: [#1341](https://github.com/react-grid-layout/react-grid-layout/issues/1341), [#1401](https://github.com/react-grid-layout/react-grid-layout/issues/1401), [PR #1411](https://github.com/react-grid-layout/react-grid-layout/pull/1411)

**Problem**: In v1, `onDragStart` fires on `mousedown` before any actual mouse movement occurs. This makes it impossible to distinguish between a click and a drag, causing issues for applications that need click handling on grid items.

**v2 Behavior**: `onDragStart` will only fire after the mouse has moved at least 3 pixels from the initial mousedown position. This matches user expectations and aligns with how most drag-and-drop libraries work.

```typescript
// v1: onDragStart fires immediately on mousedown
// v2: onDragStart fires only after mouse moves 3px

// Internal implementation
const DRAG_THRESHOLD = 3; // pixels

function shouldStartDrag(startPos: Position, currentPos: Position): boolean {
  const dx = Math.abs(currentPos.x - startPos.x);
  const dy = Math.abs(currentPos.y - startPos.y);
  return dx >= DRAG_THRESHOLD || dy >= DRAG_THRESHOLD;
}
```

**Migration**: Applications relying on the v1 behavior (immediate `onDragStart`) should use `onMouseDown` directly on their grid items instead.

### 2. Immutable Callback Parameters

**Problem**: In v1, some callbacks allowed mutating `layoutItem` and `placeholder` directly (e.g., in `onResize` to enforce dynamic constraints).

**v2 Behavior**: All callback parameters are immutable. To modify the layout, return a new layout or use the provided actions.

```typescript
// v1 (mutable)
onResize(layout, oldItem, newItem, placeholder) {
  if (newItem.h < 3) {
    newItem.w = 2;      // Direct mutation
    placeholder.w = 2;  // Direct mutation
  }
}

// v2 (immutable) - use onLayoutChange or constraints
<GridLayout
  layout={layout}
  onLayoutChange={(newLayout) => {
    // Apply constraints by transforming the layout
    setLayout(applyMyConstraints(newLayout));
  }}
/>

// Or use minW/maxW/minH/maxH constraints directly
const layoutWithConstraints = layout.map(item => ({
  ...item,
  maxW: item.h < 3 ? 2 : undefined
}));
```

### 3. `data-grid` Prop Only Available in Legacy Wrapper

**Problem**: The `data-grid` prop on children creates implicit coupling between children and layout state, making the component harder to reason about.

**v2 Behavior**: The new API requires explicit layout props. The `data-grid` pattern is only available via the legacy wrapper.

```typescript
// v1 / Legacy
<ReactGridLayout>
  <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>A</div>
</ReactGridLayout>

// v2 (explicit)
<GridLayout layout={[{ i: 'a', x: 0, y: 0, w: 2, h: 2 }]}>
  <div key="a">A</div>
</GridLayout>
```

### 4. Pluggable Compaction Algorithms

**Issue**: [PR #2152](https://github.com/react-grid-layout/react-grid-layout/pull/2152)

**Problem**: The v1 compaction algorithm has O(n²) time complexity, causing noticeable lag with 200+ items.

**v2 Behavior**: The default compactor remains the same O(n²) algorithm for backwards compatibility. However, v2 introduces the `Compactor` interface, making compaction algorithms pluggable. A fast "rising tide" algorithm with O(n log n) complexity is available as an optional extra for large layouts.

```typescript
// v2 default - same algorithm as v1
<GridLayout compactor={verticalCompactor} />

// For large layouts (200+ items), use the fast compactor from extras
import { fastVerticalCompactor } from 'react-grid-layout/extras';
<GridLayout compactor={fastVerticalCompactor} />
```

**Note**: The fast compactor produces identical results for most layouts but may differ slightly in edge cases with complex overlapping items. If your application depends on exact compaction behavior (e.g., for snapshot tests or layout persistence), continue using the default `verticalCompactor`.

## Detailed Design

### Prop Refactoring: From Flat Props to Composable Interfaces

The current `ReactGridLayout` has 25+ props, many of which represent distinct concerns that should be separated. This section defines how props will be reorganized into focused interfaces.

#### Current Props Analysis

| Prop               | Category        | v2 Approach                  |
| ------------------ | --------------- | ---------------------------- |
| `layout`           | Core Data       | Keep as prop                 |
| `width`            | Core Data       | Keep as prop (or via hook)   |
| `cols`             | Grid Config     | `GridConfig` interface       |
| `rowHeight`        | Grid Config     | `GridConfig` interface       |
| `margin`           | Grid Config     | `GridConfig` interface       |
| `containerPadding` | Grid Config     | `GridConfig` interface       |
| `maxRows`          | Grid Config     | `GridConfig` interface       |
| `autoSize`         | Container       | Keep as prop                 |
| `compactType`      | Compaction      | `Compactor` interface        |
| `preventCollision` | Compaction      | `Compactor` interface        |
| `allowOverlap`     | Compaction      | `Compactor` interface        |
| `useCSSTransforms` | Positioning     | `PositionStrategy` interface |
| `transformScale`   | Positioning     | `PositionStrategy` interface |
| `isDraggable`      | Drag Behavior   | `DragConfig` interface       |
| `draggableHandle`  | Drag Behavior   | `DragConfig` interface       |
| `draggableCancel`  | Drag Behavior   | `DragConfig` interface       |
| `isBounded`        | Drag Behavior   | `DragConfig` interface       |
| `isResizable`      | Resize Behavior | `ResizeConfig` interface     |
| `resizeHandles`    | Resize Behavior | `ResizeConfig` interface     |
| `resizeHandle`     | Resize Behavior | `ResizeConfig` interface     |
| `isDroppable`      | Drop Behavior   | `DropConfig` interface       |
| `droppingItem`     | Drop Behavior   | `DropConfig` interface       |
| `className`        | Container       | Keep as prop                 |
| `style`            | Container       | Keep as prop                 |
| `innerRef`         | Container       | Keep as prop                 |

#### Interface Definitions

```typescript
// ============================================================================
// Grid Configuration
// ============================================================================

export interface GridConfig {
  /** Number of columns in the grid */
  cols: number;
  /** Height of a single row in pixels */
  rowHeight: number;
  /** Gap between items [x, y] in pixels */
  margin: readonly [number, number];
  /** Padding inside container [x, y] in pixels, or null to use margin */
  containerPadding: readonly [number, number] | null;
  /** Maximum number of rows (default: Infinity) */
  maxRows: number;
}

export const defaultGridConfig: GridConfig = {
  cols: 12,
  rowHeight: 150,
  margin: [10, 10],
  containerPadding: null, // defaults to margin value
  maxRows: Infinity
};

// ============================================================================
// Position Strategy - How items are positioned in the DOM
// ============================================================================

export interface PositionStrategy {
  /** Strategy type identifier */
  readonly type: "transform" | "absolute";

  /** Scale factor for drag/resize calculations */
  readonly scale: number;

  /**
   * Convert pixel position to CSS style object.
   */
  calcStyle(pos: Position): React.CSSProperties;

  /**
   * Calculate position during drag operations, accounting for transforms and scale.
   */
  calcDragPosition(
    clientX: number,
    clientY: number,
    offsetX: number,
    offsetY: number
  ): { left: number; top: number };
}

/** CSS transform-based positioning (default, better performance) */
export const transformStrategy: PositionStrategy = {
  type: "transform",
  scale: 1,
  calcStyle(pos) {
    return {
      transform: `translate(${pos.left}px, ${pos.top}px)`,
      width: `${pos.width}px`,
      height: `${pos.height}px`,
      position: "absolute"
    };
  },
  calcDragPosition(clientX, clientY, offsetX, offsetY) {
    return {
      left: clientX - offsetX,
      top: clientY - offsetY
    };
  }
};

/** Absolute top/left positioning (for environments where transforms cause issues) */
export const absoluteStrategy: PositionStrategy = {
  type: "absolute",
  scale: 1,
  calcStyle(pos) {
    return {
      left: pos.left,
      top: pos.top,
      width: `${pos.width}px`,
      height: `${pos.height}px`,
      position: "absolute"
    };
  },
  calcDragPosition(clientX, clientY, offsetX, offsetY) {
    return {
      left: clientX - offsetX,
      top: clientY - offsetY
    };
  }
};

/**
 * Create a transform strategy with custom scale
 * (replaces transformScale prop)
 */
export function createScaledStrategy(scale: number): PositionStrategy {
  return {
    ...transformStrategy,
    scale,
    calcDragPosition(clientX, clientY, offsetX, offsetY) {
      return {
        left: (clientX - offsetX) / scale,
        top: (clientY - offsetY) / scale
      };
    }
  };
}

// ============================================================================
// Drag Configuration
// ============================================================================

export interface DragConfig {
  /** Enable dragging globally */
  enabled: boolean;
  /** CSS selector for drag handle (e.g., '.my-handle') */
  handle?: string;
  /** CSS selector for elements that should not trigger drag */
  cancel?: string;
  /** Constrain dragging to container bounds */
  bounded: boolean;
  /** Minimum pixels of movement before drag starts */
  threshold: number;
}

export const defaultDragConfig: DragConfig = {
  enabled: true,
  bounded: false,
  threshold: 3 // Fixes #1341, #1401
};

// ============================================================================
// Resize Configuration
// ============================================================================

export interface ResizeConfig {
  /** Enable resizing globally */
  enabled: boolean;
  /** Which handles to render */
  handles: readonly ResizeHandleAxis[];
  /** Custom handle component */
  handleComponent?:
    | React.ComponentType<ResizeHandleProps>
    | ((
        axis: ResizeHandleAxis,
        ref: React.Ref<HTMLElement>
      ) => React.ReactNode);
}

export interface ResizeHandleProps {
  axis: ResizeHandleAxis;
  innerRef: React.Ref<HTMLElement>;
}

export const defaultResizeConfig: ResizeConfig = {
  enabled: true,
  handles: ["se"]
};

// ============================================================================
// Drop Configuration (external drag-and-drop)
// ============================================================================

export interface DropConfig {
  /** Enable dropping from outside the grid */
  enabled: boolean;
  /** Default dimensions for dropped items */
  defaultItem: { w: number; h: number };
  /**
   * Called when dragging over the grid.
   * Return dimensions to override defaultItem, or false to reject the drop.
   */
  onDragOver?: (event: DragEvent) => { w?: number; h?: number } | false | void;
}

export const defaultDropConfig: DropConfig = {
  enabled: false,
  defaultItem: { w: 1, h: 1 }
};

// ============================================================================
// Compactor Interface
// ============================================================================

export interface Compactor {
  /** Compact type identifier */
  readonly type: CompactType;
  /** Whether items can overlap */
  readonly allowOverlap: boolean;
  /** Whether to prevent collisions (no pushing) - optional */
  readonly preventCollision?: boolean;
  /** Compact the layout */
  compact(layout: Layout, cols: number): Layout;
  /** Handle movement - returns new layout */
  onMove(
    layout: Layout,
    item: LayoutItem,
    x: number,
    y: number,
    cols: number
  ): Layout;
}

/**
 * Get a compactor by type.
 * Factory function for backwards compatibility with string-based compactType API.
 */
export function getCompactor(
  compactType: CompactType,
  allowOverlap?: boolean,
  preventCollision?: boolean
): Compactor;

// Built-in compactors (defined as object literals in compactors.ts)
export const verticalCompactor: Compactor;
export const horizontalCompactor: Compactor;
export const noCompactor: Compactor;

// Overlap-allowing variants
export const verticalOverlapCompactor: Compactor;
export const horizontalOverlapCompactor: Compactor;

// ============================================================================
// Fast Compactor (available in react-grid-layout/extras)
// ============================================================================

/**
 * For large layouts (200+ items), a high-performance "rising tide" compactor
 * is available in react-grid-layout/extras. It achieves O(n log n) time
 * complexity vs O(n²) for the standard algorithm.
 *
 * Usage:
 *   import { fastVerticalCompactor } from 'react-grid-layout/extras';
 *   <GridLayout compactor={fastVerticalCompactor} />
 *
 * Note: Produces identical results for most layouts, but may differ
 * slightly in edge cases with complex overlapping items.
 *
 * @see https://github.com/react-grid-layout/react-grid-layout/pull/2152
 * @see https://github.com/morris/fast-grid-layout
 */

// ============================================================================
// Custom Compactor Example - Extensibility
// ============================================================================

/**
 * The Compactor interface is designed for extensibility.
 * Users can implement custom algorithms for specific use cases.
 *
 * The v2 Compactor interface solves a key problem identified in PR #1773:
 * "it requires untangling existing compaction logic and passing custom
 * resolvers throughout the codebase". By making Compactor a first-class
 * interface, we enable clean implementation of wrap mode and other algorithms.
 *
 * Built-in compactors (from react-grid-layout/core):
 * - verticalCompactor: Standard vertical compaction (items float up) - default
 * - horizontalCompactor: Horizontal compaction (items float left)
 * - noCompactor: Free positioning, no automatic movement
 *
 * Optional compactors (from react-grid-layout/extras):
 * - fastVerticalCompactor: O(n log n) vertical compaction for large layouts
 *
 * Custom compactor examples in this RFC:
 * - wrapCompactor: Items wrap to next row like flexbox (PR #1773)
 *
 * @see https://github.com/react-grid-layout/react-grid-layout/pull/1773
 */

/**
 * Wrap compactor - items flow left-to-right and wrap to next row.
 * Similar to CSS flexbox with flex-wrap: wrap.
 *
 * @see https://github.com/react-grid-layout/react-grid-layout/pull/1773
 */
export function createWrapCompactor(): Compactor {
  return {
    type: "horizontal", // or define new type
    allowOverlap: false,
    preventCollision: false,
    compact(layout: Layout, cols: number): Layout {
      // Custom wrapping logic - items flow left-to-right, wrap to next row
      let currentX = 0;
      let currentY = 0;
      let rowHeight = 0;

      return sortByIndex(layout).map(item => {
        // Wrap to next row if item doesn't fit
        if (currentX + item.w > cols) {
          currentX = 0;
          currentY += rowHeight;
          rowHeight = 0;
        }

        const result = { ...item, x: currentX, y: currentY };
        currentX += item.w;
        rowHeight = Math.max(rowHeight, item.h);

        return result;
      });
    },
    onMove(layout, item, x, y, cols) {
      // Re-compact after move
      return this.compact(
        layout.map(l => (l.i === item.i ? { ...l, x, y } : l)),
        cols
      );
    }
  };
}
```

#### New Component API with Interfaces

```typescript
// Minimal required props
interface GridLayoutProps {
  /** The layout data */
  layout: Layout;
  /** Container width in pixels */
  width: number;
  /** Children to render */
  children: React.ReactNode;
  /** Called when layout changes */
  onLayoutChange?: (layout: Layout) => void;

  // Optional configurations (use defaults if not provided)
  gridConfig?: Partial<GridConfig>;
  positionStrategy?: PositionStrategy;
  dragConfig?: Partial<DragConfig>;
  resizeConfig?: Partial<ResizeConfig>;
  dropConfig?: Partial<DropConfig>;
  compactor?: Compactor;

  // Container props
  autoSize?: boolean;
  className?: string;
  style?: React.CSSProperties;
  innerRef?: React.Ref<HTMLDivElement>;

  // Event callbacks
  onDragStart?: DragCallback;
  onDrag?: DragCallback;
  onDragStop?: DragCallback;
  onResizeStart?: ResizeCallback;
  onResize?: ResizeCallback;
  onResizeStop?: ResizeCallback;
  onDrop?: DropCallback;
}
```

#### Usage Examples

```typescript
// Simple usage - all defaults
<GridLayout layout={layout} width={1200}>
  {children}
</GridLayout>

// Custom grid configuration
<GridLayout
  layout={layout}
  width={1200}
  gridConfig={{ cols: 6, rowHeight: 100, margin: [20, 20] }}
>
  {children}
</GridLayout>

// Scaled container (replaces transformScale prop)
<div style={{ transform: 'scale(0.5)' }}>
  <GridLayout
    layout={layout}
    width={1200}
    positionStrategy={createScaledStrategy(0.5)}
  >
    {children}
  </GridLayout>
</div>

// Horizontal compaction with overlap allowed
<GridLayout
  layout={layout}
  width={1200}
  compactor={horizontalOverlapCompactor}
>
  {children}
</GridLayout>

// Custom drag behavior
<GridLayout
  layout={layout}
  width={1200}
  dragConfig={{
    handle: '.my-drag-handle',
    cancel: '.no-drag',
    bounded: true,
    threshold: 5, // 5px before drag starts
  }}
>
  {children}
</GridLayout>

// Enable external drop
<GridLayout
  layout={layout}
  width={1200}
  dropConfig={{
    enabled: true,
    defaultItem: { w: 2, h: 2 },
    onDragOver: (e) => {
      // Dynamic sizing based on dragged content
      const type = e.dataTransfer?.getData('type');
      if (type === 'large') return { w: 4, h: 4 };
      return undefined; // use default
    },
  }}
  onDrop={(layout, item, event) => {
    console.log('Dropped:', item);
  }}
>
  {children}
</GridLayout>

// Absolute positioning (replaces useCSSTransforms={false})
<GridLayout
  layout={layout}
  width={1200}
  positionStrategy={absoluteStrategy}
>
  {children}
</GridLayout>
```

#### Example: Custom Hooks for Interface Creation

These are example patterns you can use in your application - they are not exported by the library:

```typescript
// Example hook to memoize compactor selection
function useCompactor(
  compactType: CompactType,
  allowOverlap?: boolean,
  preventCollision?: boolean
): Compactor {
  return useMemo(
    () => getCompactor(compactType, allowOverlap, preventCollision),
    [compactType, allowOverlap, preventCollision]
  );
}

// Example hook to memoize scaled position strategy
function useScaledStrategy(scale: number): PositionStrategy {
  return useMemo(() => createScaledStrategy(scale), [scale]);
}

// Example usage
function MyScaledGrid({ scale }) {
  const positionStrategy = useScaledStrategy(scale);

  return (
    <div style={{ transform: `scale(${scale})` }}>
      <GridLayout positionStrategy={positionStrategy} {...props} />
    </div>
  );
}
```

### Package Structure

```
react-grid-layout/
├── src/
│   ├── core/                    # Pure TS, no React
│   │   ├── types.ts             # All type definitions
│   │   ├── layout.ts            # Layout manipulation algorithms
│   │   ├── compact.ts           # Compaction algorithms
│   │   ├── collision.ts         # Collision detection
│   │   ├── position.ts          # Position calculations (grid units <-> pixels)
│   │   └── index.ts             # Core exports
│   │
│   ├── react/                   # React bindings
│   │   ├── hooks/
│   │   │   ├── useGridLayout.ts
│   │   │   ├── useResponsiveLayout.ts
│   │   │   ├── useContainerWidth.ts
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── GridLayout.tsx
│   │   │   ├── GridItem.tsx
│   │   │   ├── ResponsiveGridLayout.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── legacy/                  # v1 API compatibility
│   │   ├── ReactGridLayout.tsx
│   │   ├── ResponsiveReactGridLayout.tsx
│   │   ├── WidthProvider.tsx
│   │   ├── dataGridAdapter.ts   # Handles data-grid prop extraction
│   │   └── index.ts
│   │
│   └── index.ts                 # Main entry point
│
├── dist/                        # Build output
│   ├── core.js                  # Core only (no React)
│   ├── react.js                 # React components
│   ├── legacy.js                # Legacy API
│   └── index.js                 # Everything
```

### Entry Points

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./core": "./dist/core.js",
    "./legacy": "./dist/legacy.js"
  }
}
```

Usage:

```typescript
// New API (recommended)
import { useGridLayout, GridLayout } from "react-grid-layout";

// Core only (for custom implementations)
import {
  verticalCompactor,
  moveElement,
  type Layout
} from "react-grid-layout/core";

// Legacy API (backwards compatible)
import ReactGridLayout, {
  WidthProvider,
  Responsive
} from "react-grid-layout/legacy";
```

---

## Core Types (`src/core/types.ts`)

```typescript
// ============================================================================
// Layout Types
// ============================================================================

export type ResizeHandleAxis =
  | "s"
  | "w"
  | "e"
  | "n"
  | "sw"
  | "nw"
  | "se"
  | "ne";

export interface LayoutItem {
  /** Unique identifier for this item */
  i: string;
  /** X position in grid units */
  x: number;
  /** Y position in grid units */
  y: number;
  /** Width in grid units */
  w: number;
  /** Height in grid units */
  h: number;
  /** Minimum width in grid units */
  minW?: number;
  /** Maximum width in grid units */
  maxW?: number;
  /** Minimum height in grid units */
  minH?: number;
  /** Maximum height in grid units */
  maxH?: number;
  /** If true, item cannot be dragged or resized */
  static?: boolean;
  /** Override global isDraggable for this item */
  isDraggable?: boolean;
  /** Override global isResizable for this item */
  isResizable?: boolean;
  /** Constrain dragging to grid bounds */
  isBounded?: boolean;
  /** Which resize handles to show */
  resizeHandles?: ResizeHandleAxis[];
}

export type Layout = readonly LayoutItem[];

// ============================================================================
// Grid Configuration
// ============================================================================

export type CompactType = "vertical" | "horizontal" | null;

export interface GridConfig {
  /** Number of columns */
  cols: number;
  /** Height of a single row in pixels */
  rowHeight: number;
  /** Maximum number of rows */
  maxRows: number;
  /** Gap between items [x, y] in pixels */
  margin: readonly [number, number];
  /** Padding inside container [x, y] in pixels */
  containerPadding: readonly [number, number];
  /** Container width in pixels */
  containerWidth: number;
}

// ============================================================================
// Position Types
// ============================================================================

export interface Position {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface GridPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ============================================================================
// Compactor Interface
// ============================================================================

export interface Compactor {
  /** Compact the layout */
  compact(layout: Layout, cols: number): Layout;
  /** Get the type identifier */
  readonly type: CompactType;
}

// ============================================================================
// Position Strategy Interface
// ============================================================================

export interface PositionStrategy {
  /** Convert grid position to CSS style */
  toStyle(item: LayoutItem, config: GridConfig): React.CSSProperties;
  /** Convert pixel position to grid position */
  toGridUnits(position: Position, config: GridConfig): GridPosition;
  /** Convert grid position to pixel position */
  toPixels(item: LayoutItem, config: GridConfig): Position;
}
```

---

## Core Functions (`src/core/`)

### `layout.ts` - Layout Manipulation

```typescript
import type { Layout, LayoutItem, GridConfig } from "./types";

/**
 * Get a layout item by id
 */
export function getLayoutItem(
  layout: Layout,
  id: string
): LayoutItem | undefined;

/**
 * Clone a layout (deep copy)
 */
export function cloneLayout(layout: Layout): LayoutItem[];

/**
 * Move an element to a new position, returning a new layout
 */
export function moveElement(
  layout: Layout,
  item: LayoutItem,
  x: number,
  y: number,
  isUserAction: boolean,
  preventCollision: boolean,
  compactor: Compactor,
  cols: number
): Layout;

/**
 * Resize an element, returning a new layout
 */
export function resizeElement(
  layout: Layout,
  item: LayoutItem,
  w: number,
  h: number,
  handle: ResizeHandleAxis
): Layout;

/**
 * Get the bottom-most point in the layout (for container height)
 */
export function getLayoutBottom(layout: Layout): number;

/**
 * Validate a layout, throwing descriptive errors for invalid items
 */
export function validateLayout(layout: Layout, contextName?: string): void;

/**
 * Correct layout bounds (ensure items fit within cols)
 */
export function correctBounds(layout: Layout, cols: number): Layout;

/**
 * Sort layout items by row then column
 */
export function sortLayoutItems(layout: Layout): Layout;
```

### `compact.ts` - Compaction Algorithms

```typescript
import type { Layout, Compactor, CompactType } from "./types";

/**
 * Vertical compactor - items float up
 */
export const verticalCompactor: Compactor = {
  type: "vertical",
  compact(layout: Layout, cols: number): Layout {
    // Implementation
  }
};

/**
 * Horizontal compactor - items float left
 */
export const horizontalCompactor: Compactor = {
  type: "horizontal",
  compact(layout: Layout, cols: number): Layout {
    // Implementation
  }
};

/**
 * No-op compactor - items stay where placed
 */
export const noCompactor: Compactor = {
  type: null,
  compact(layout: Layout, cols: number): Layout {
    return layout;
  }
};

/**
 * Get a compactor by type
 */
export function getCompactor(
  type: CompactType,
  allowOverlap?: boolean,
  preventCollision?: boolean
): Compactor;
```

### `collision.ts` - Collision Detection

```typescript
import type { Layout, LayoutItem } from "./types";

/**
 * Check if two items collide
 */
export function collides(a: LayoutItem, b: LayoutItem): boolean;

/**
 * Get all items that collide with a given item
 */
export function getCollisions(layout: Layout, item: LayoutItem): LayoutItem[];

/**
 * Get the first item that collides with a given item
 */
export function getFirstCollision(
  layout: Layout,
  item: LayoutItem
): LayoutItem | undefined;

/**
 * Check if an item would collide at a given position
 */
export function wouldCollide(
  layout: Layout,
  item: LayoutItem,
  x: number,
  y: number
): boolean;
```

### `position.ts` - Position Calculations

```typescript
import type { GridConfig, LayoutItem, Position, GridPosition } from "./types";

/**
 * Calculate the width of a single grid column in pixels
 */
export function calcColWidth(config: GridConfig): number;

/**
 * Calculate pixel position from grid position
 */
export function calcGridItemPosition(
  config: GridConfig,
  x: number,
  y: number,
  w: number,
  h: number
): Position;

/**
 * Calculate grid position from pixel position
 */
export function calcXY(
  config: GridConfig,
  top: number,
  left: number
): { x: number; y: number };

/**
 * Calculate grid dimensions from pixel dimensions
 */
export function calcWH(
  config: GridConfig,
  width: number,
  height: number,
  x: number,
  y: number
): { w: number; h: number };

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number;
```

---

## React Hooks (`src/react/hooks/`)

### `useGridLayout.ts`

```typescript
import type {
  Layout,
  LayoutItem,
  GridConfig,
  Compactor,
  CompactType
} from "../../core/types";

/** Minimum pixels of movement before drag starts (fixes #1341, #1401) */
export const DRAG_THRESHOLD = 3;

export interface UseGridLayoutOptions {
  /** Initial layout */
  layout: Layout;
  /** Number of columns */
  cols?: number;
  /** Row height in pixels */
  rowHeight?: number;
  /** Compaction type or custom compactor */
  compaction?: CompactType | Compactor;
  /** Prevent items from colliding */
  preventCollision?: boolean;
  /** Allow items to overlap */
  allowOverlap?: boolean;
  /**
   * Minimum pixels of movement before drag starts.
   * Set to 0 for legacy v1 behavior (drag on mousedown).
   * @default 3
   */
  dragThreshold?: number;
  /** Called when layout changes */
  onLayoutChange?: (layout: Layout) => void;
}

export interface GridLayoutState {
  /** Current layout */
  layout: Layout;
  /** Currently dragging item */
  dragging: LayoutItem | null;
  /** Currently resizing item */
  resizing: LayoutItem | null;
  /** Placeholder position during drag/resize */
  placeholder: LayoutItem | null;
}

export interface GridLayoutActions {
  /** Move an item to a new position */
  moveItem: (id: string, x: number, y: number) => void;
  /** Resize an item */
  resizeItem: (
    id: string,
    w: number,
    h: number,
    handle: ResizeHandleAxis
  ) => void;
  /** Set the entire layout */
  setLayout: (layout: Layout) => void;
  /** Start dragging an item */
  startDrag: (id: string) => void;
  /** End dragging */
  endDrag: () => void;
  /** Start resizing an item */
  startResize: (id: string) => void;
  /** End resizing */
  endResize: () => void;
}

export interface UseGridLayoutReturn
  extends GridLayoutState, GridLayoutActions {
  /** Grid configuration derived from options */
  config: GridConfig;
  /** Get props to spread on an item for drag/resize handling */
  getItemProps: (id: string) => GridItemProps;
  /** Calculate style for an item */
  getItemStyle: (item: LayoutItem) => React.CSSProperties;
}

export function useGridLayout(
  options: UseGridLayoutOptions
): UseGridLayoutReturn;
```

### `useResponsiveLayout.ts`

```typescript
export type Breakpoint = string;

export interface Breakpoints {
  [key: string]: number;
}

export interface ResponsiveLayouts {
  [breakpoint: string]: Layout;
}

export interface UseResponsiveLayoutOptions {
  /** Breakpoint definitions: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 } */
  breakpoints: Breakpoints;
  /** Columns per breakpoint: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 } */
  cols: { [breakpoint: string]: number };
  /** Layouts per breakpoint */
  layouts: ResponsiveLayouts;
  /** Container width (usually from useContainerWidth) */
  width: number;
  /** Compaction type */
  compaction?: CompactType;
  /** Called when breakpoint changes */
  onBreakpointChange?: (breakpoint: Breakpoint, cols: number) => void;
  /** Called when layout changes */
  onLayoutChange?: (layout: Layout, layouts: ResponsiveLayouts) => void;
}

export interface UseResponsiveLayoutReturn {
  /** Current breakpoint */
  breakpoint: Breakpoint;
  /** Current number of columns */
  cols: number;
  /** Current layout for active breakpoint */
  layout: Layout;
  /** All layouts */
  layouts: ResponsiveLayouts;
  /** Grid layout state and actions */
  grid: UseGridLayoutReturn;
}

export function useResponsiveLayout(
  options: UseResponsiveLayoutOptions
): UseResponsiveLayoutReturn;
```

### `useContainerWidth.ts`

```typescript
export interface UseContainerWidthOptions {
  /** If true, don't render children until width is measured */
  measureBeforeMount?: boolean;
  /** Default width before measurement */
  defaultWidth?: number;
}

export interface UseContainerWidthReturn {
  /** Ref to attach to the container element */
  ref: React.RefObject<HTMLDivElement>;
  /** Current width */
  width: number;
  /** Whether the width has been measured */
  measured: boolean;
}

export function useContainerWidth(
  options?: UseContainerWidthOptions
): UseContainerWidthReturn;
```

---

## React Components (`src/react/components/`)

### `GridLayout.tsx`

```typescript
export interface GridLayoutProps {
  /** Layout array */
  layout: Layout;
  /** Number of columns */
  cols?: number;
  /** Row height in pixels */
  rowHeight?: number;
  /** Container width in pixels (required unless using width hook) */
  width: number;
  /** Gap between items [x, y] */
  margin?: [number, number];
  /** Padding inside container [x, y] */
  containerPadding?: [number, number];
  /** Auto-size container height */
  autoSize?: boolean;
  /** Compaction type */
  compactType?: CompactType;
  /** Prevent collision */
  preventCollision?: boolean;
  /** Allow overlap */
  allowOverlap?: boolean;
  /** Global draggable setting */
  isDraggable?: boolean;
  /** Global resizable setting */
  isResizable?: boolean;
  /** Constrain to bounds */
  isBounded?: boolean;
  /** Use CSS transforms for positioning */
  useCSSTransforms?: boolean;
  /** Scale factor for transformed containers */
  transformScale?: number;
  /** Enable dropping from outside */
  isDroppable?: boolean;
  /** Configuration for dropping element */
  droppingItem?: { i: string; w: number; h: number };
  /** Resize handles to show */
  resizeHandles?: ResizeHandleAxis[];
  /** Custom resize handle component */
  resizeHandle?:
    | React.ReactNode
    | ((axis: ResizeHandleAxis) => React.ReactNode);
  /** CSS selector for drag handle */
  draggableHandle?: string;
  /** CSS selector for non-draggable areas */
  draggableCancel?: string;
  /** Ref to the container element */
  innerRef?: React.Ref<HTMLDivElement>;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;

  // Callbacks
  onLayoutChange?: (layout: Layout) => void;
  onDragStart?: (
    layout: Layout,
    oldItem: LayoutItem,
    newItem: LayoutItem,
    placeholder: LayoutItem,
    event: MouseEvent,
    element: HTMLElement
  ) => void;
  onDrag?: (
    layout: Layout,
    oldItem: LayoutItem,
    newItem: LayoutItem,
    placeholder: LayoutItem,
    event: MouseEvent,
    element: HTMLElement
  ) => void;
  onDragStop?: (
    layout: Layout,
    oldItem: LayoutItem,
    newItem: LayoutItem,
    placeholder: LayoutItem,
    event: MouseEvent,
    element: HTMLElement
  ) => void;
  onResizeStart?: (
    layout: Layout,
    oldItem: LayoutItem,
    newItem: LayoutItem,
    placeholder: LayoutItem,
    event: MouseEvent,
    element: HTMLElement
  ) => void;
  onResize?: (
    layout: Layout,
    oldItem: LayoutItem,
    newItem: LayoutItem,
    placeholder: LayoutItem,
    event: MouseEvent,
    element: HTMLElement
  ) => void;
  onResizeStop?: (
    layout: Layout,
    oldItem: LayoutItem,
    newItem: LayoutItem,
    placeholder: LayoutItem,
    event: MouseEvent,
    element: HTMLElement
  ) => void;
  onDrop?: (layout: Layout, item: LayoutItem, event: Event) => void;
  onDropDragOver?: (
    event: DragEvent
  ) => { w?: number; h?: number } | false | void;

  children: React.ReactNode;
}

export function GridLayout(props: GridLayoutProps): JSX.Element;
```

### `ResponsiveGridLayout.tsx`

```typescript
export interface ResponsiveGridLayoutProps extends Omit<
  GridLayoutProps,
  "cols" | "layout" | "width"
> {
  /** Breakpoint definitions */
  breakpoints?: Breakpoints;
  /** Columns per breakpoint */
  cols?: { [breakpoint: string]: number };
  /** Layouts per breakpoint */
  layouts: ResponsiveLayouts;
  /** Margin per breakpoint (optional) */
  margin?: [number, number] | { [breakpoint: string]: [number, number] };
  /** Container padding per breakpoint (optional) */
  containerPadding?:
    | [number, number]
    | { [breakpoint: string]: [number, number] };
  /** Called when breakpoint changes */
  onBreakpointChange?: (breakpoint: string, cols: number) => void;
  /** Called when width changes */
  onWidthChange?: (
    width: number,
    margin: [number, number],
    cols: number,
    padding: [number, number]
  ) => void;
  /** Override layout change callback signature for responsive */
  onLayoutChange?: (layout: Layout, layouts: ResponsiveLayouts) => void;
}

export function ResponsiveGridLayout(
  props: ResponsiveGridLayoutProps
): JSX.Element;
```

---

## Legacy API (`src/legacy/`)

### Main Entry Point

```typescript
// src/legacy/index.ts
// This module provides 100% backwards compatibility with v1

export { default, default as ReactGridLayout } from "./ReactGridLayout";
export {
  default as Responsive,
  default as ResponsiveReactGridLayout
} from "./ResponsiveReactGridLayout";
export { default as WidthProvider } from "./WidthProvider";

// Re-export types for backwards compatibility
export type { Layout, LayoutItem, CompactType } from "../core/types";
```

### `dataGridAdapter.ts` - Handle data-grid Props

```typescript
import type { Layout, LayoutItem } from "../core/types";

/**
 * Extract layout from children's data-grid props
 * This is the ONLY place data-grid logic exists
 */
export function extractLayoutFromChildren(
  children: React.ReactNode,
  existingLayout: Layout
): Layout;

/**
 * Synchronize layout with children
 * - Items in layout but not in children are removed
 * - Items in children but not in layout are added (using data-grid or defaults)
 * - Items in both are merged (layout takes precedence unless data-grid is newer)
 */
export function synchronizeLayoutWithChildren(
  layout: Layout,
  children: React.ReactNode,
  cols: number,
  compactType: CompactType,
  allowOverlap: boolean
): Layout;
```

### `ReactGridLayout.tsx` - Legacy Wrapper

```typescript
import * as React from "react";
import { GridLayout } from "../react/components/GridLayout";
import { synchronizeLayoutWithChildren } from "./dataGridAdapter";

/**
 * Legacy ReactGridLayout component
 *
 * This wrapper provides backwards compatibility with v1 API:
 * - Supports data-grid props on children
 * - Maintains internal state synchronization logic
 * - Preserves all v1 prop names and callback signatures
 */
export default class ReactGridLayout extends React.Component<
  LegacyProps,
  LegacyState
> {
  // Implementation mirrors current ReactGridLayout.jsx exactly
  // but delegates rendering to new GridLayout component
}
```

### `WidthProvider.tsx` - Legacy HOC

```typescript
import * as React from "react";
import { useContainerWidth } from "../react/hooks/useContainerWidth";

/**
 * HOC that provides width to wrapped component
 * Preserved for backwards compatibility
 */
export default function WidthProvider<P extends { width?: number }>(
  ComposedComponent: React.ComponentType<P>
): React.ComponentType<Omit<P, "width"> & { measureBeforeMount?: boolean }>;
```

---

## Migration Guide

### From v1 to v2 (No Changes Required)

```typescript
// v1 code works unchanged with legacy import
import ReactGridLayout, { WidthProvider, Responsive } from 'react-grid-layout/legacy';

const ResponsiveGridLayout = WidthProvider(Responsive);

function MyGrid() {
  return (
    <ResponsiveGridLayout
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996 }}
      cols={{ lg: 12, md: 10 }}
      onLayoutChange={(layout, layouts) => saveLayouts(layouts)}
    >
      <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>A</div>
      <div key="b" data-grid={{ x: 2, y: 0, w: 2, h: 2 }}>B</div>
    </ResponsiveGridLayout>
  );
}
```

### Gradual Migration to v2 API

```typescript
// Step 1: Switch import (still using class-like API)
import { ResponsiveGridLayout } from 'react-grid-layout';
import { useContainerWidth } from 'react-grid-layout';

function MyGrid() {
  const { ref, width } = useContainerWidth();

  return (
    <div ref={ref}>
      <ResponsiveGridLayout
        width={width}
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996 }}
        cols={{ lg: 12, md: 10 }}
        onLayoutChange={(layout, layouts) => saveLayouts(layouts)}
      >
        {/* No more data-grid, explicit layout */}
        {layouts.lg.map(item => (
          <div key={item.i}>{item.i}</div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}

// Step 2: Use hooks for full control
import { useResponsiveLayout, useContainerWidth, GridLayout } from 'react-grid-layout';

function MyGrid() {
  const { ref, width } = useContainerWidth();
  const { layout, breakpoint, cols, grid } = useResponsiveLayout({
    width,
    breakpoints: { lg: 1200, md: 996 },
    cols: { lg: 12, md: 10 },
    layouts,
    onLayoutChange: (layout, layouts) => saveLayouts(layouts),
  });

  return (
    <div ref={ref}>
      <GridLayout
        layout={layout}
        cols={cols}
        width={width}
        {...grid}
      >
        {layout.map(item => (
          <div key={item.i} style={grid.getItemStyle(item)}>
            {item.i}
          </div>
        ))}
      </GridLayout>
    </div>
  );
}
```

---

## Baseline Performance Metrics

Established 2025-12-08 on Apple M4 Pro (Node.js, Jest). These metrics serve as regression benchmarks for the v2 rewrite.

### Compaction Algorithm

| Operation             | 100 items | 500 items | 1000 items |
| --------------------- | --------- | --------- | ---------- |
| Vertical compaction   | 280µs     | 4.9ms     | 23ms       |
| Horizontal compaction | 340µs     | 13.7ms    | 72ms       |

**Note**: Horizontal compaction is ~3x slower than vertical at scale. The "rising tide" algorithm from PR #2152 should significantly improve these numbers.

### Layout Operations

| Operation                       | Time  |
| ------------------------------- | ----- |
| Move element (100-500 items)    | ~7µs  |
| Sort layout (100 items)         | 4.5µs |
| Sort layout (500 items)         | 26µs  |
| Sort layout (1000 items)        | 66µs  |
| Correct bounds (100-1000 items) | 2-4µs |

### React Component Rendering

| Items | Render Time |
| ----- | ----------- |
| 50    | 9ms         |
| 100   | 15ms        |
| 200   | 29ms        |

### Interaction Simulation

| Operation                                  | Time  |
| ------------------------------------------ | ----- |
| Full drag (100 items, 20 position updates) | 3.7ms |

**Target for 60fps**: Each interaction frame must complete in <16ms. Current drag simulation at 3.7ms for 20 steps means ~0.19ms per position update, well within budget.

### Test Files

- `test/spec/benchmark-test.js` - Performance benchmarks
- `test/spec/backcompat-test.js` - API contract tests (49 tests)

Run benchmarks: `NODE_ENV=test npx jest --testPathPatterns=benchmark`

---

## Implementation Plan

### Phase 1: Setup & Core Types (Week 1)

- [ ] Set up TypeScript configuration
- [ ] Set up build tooling (tsup or similar for multiple entry points)
- [ ] Define all core types in `src/core/types.ts`
- [ ] Set up test infrastructure for TypeScript
- [ ] Create test fixtures from existing tests

### Phase 2: Core Functions (Week 2-3)

- [ ] Port `utils.js` to `src/core/layout.ts`
- [ ] Port compaction logic to `src/core/compact.ts`
- [ ] Port collision detection to `src/core/collision.ts`
- [ ] Port position calculations to `src/core/position.ts`
- [ ] Achieve 100% test coverage on core functions
- [ ] Ensure all existing `utils-test.js` tests pass

### Phase 3: React Hooks (Week 4)

- [ ] Implement `useContainerWidth`
- [ ] Implement `useGridLayout`
  - [ ] Implement drag threshold logic (fixes #1341, #1401, PR #1411)
  - [ ] Ensure `onDragStart` only fires after 3px movement
- [ ] Implement `useResponsiveLayout`
- [ ] Write comprehensive hook tests
- [ ] Test click-vs-drag behavior specifically

### Phase 4: React Components (Week 5-6)

- [ ] Implement `GridItem.tsx`
- [ ] Implement `GridLayout.tsx`
- [ ] Implement `ResponsiveGridLayout.tsx`
- [ ] Ensure all existing `lifecycle-test.js` tests pass

### Phase 5: Legacy Wrapper (Week 7)

- [ ] Implement `dataGridAdapter.ts`
- [ ] Implement legacy `ReactGridLayout.tsx` wrapper
- [ ] Implement legacy `ResponsiveReactGridLayout.tsx` wrapper
- [ ] Implement `WidthProvider.tsx` HOC
- [ ] Verify all examples work unchanged

### Phase 6: Documentation & Release (Week 8)

- [ ] Update README with new API
- [ ] Write migration guide
- [ ] Update TypeScript definitions (replace @types/react-grid-layout)
- [ ] Create v2.0.0-beta.1 release
- [ ] Gather community feedback

---

## Open Questions

1. **Bundle format**: ESM only, or also CJS for Node.js compatibility?
   - _Recommendation_: ESM primary, CJS for backwards compat via conditional exports

2. **React version support**: Drop React 16/17, require React 18+? Or maintain broader support?
   - _Recommendation_: React 18+ for new API (uses `useSyncExternalStore`), legacy wrapper supports 16.8+

3. **CSS-in-JS**: Should we provide a `styled-components` or `emotion` variant, or stick with CSS classes?
   - _Recommendation_: Stick with CSS classes, but ensure styles are easily overridable

4. **SSR**: Current implementation has SSR considerations. Need to ensure hooks work correctly with SSR.
   - _Recommendation_: Use `useSyncExternalStore` with `getServerSnapshot` for SSR safety

5. **Performance benchmarks**: Should we establish performance benchmarks before the rewrite to ensure we don't regress?
   - _Resolution_: ✅ Done. See "Baseline Performance Metrics" section above. Benchmarks cover compaction, rendering, and drag simulation.

6. **Default export**: What should `import X from 'react-grid-layout'` return?
   - _Recommendation_: New `GridLayout` component (breaking change), legacy available at `/legacy`

---

## Alternatives Considered

### 1. In-Place TypeScript Conversion

Convert existing files to TypeScript without restructuring. Rejected because:

- Doesn't address composability issues
- Would still have Flow remnants in comments
- Harder to introduce hooks alongside classes

### 2. Complete Rewrite Without Compatibility

Start fresh with only the new API. Rejected because:

- Would break thousands of existing applications
- Migration burden too high for users
- `data-grid` pattern is widely used

### 3. Fork and Separate Package

Create `react-grid-layout-v2` as a new package. Rejected because:

- Fragments the ecosystem
- Users wouldn't get automatic updates
- Maintenance burden of two packages

---

## References

- [Original v2 Issue](https://github.com/react-grid-layout/react-grid-layout/issues/346)
- [PR #1411: Fix onDragStop callback behavior](https://github.com/react-grid-layout/react-grid-layout/pull/1411) - Drag threshold fix incorporated in v2
- [PR #2152: Fast vertical compaction](https://github.com/react-grid-layout/react-grid-layout/pull/2152) - "Rising tide" algorithm for O(n log n) compaction
- [fast-grid-layout](https://github.com/morris/fast-grid-layout) - Standalone proof-of-concept for fast algorithms
- [PR #1773: Wrap compact mode](https://github.com/react-grid-layout/react-grid-layout/pull/1773) - Flexbox-style wrapping, enabled by v2 Compactor interface
- [Issue #1341: onDragStart fires before movement](https://github.com/react-grid-layout/react-grid-layout/issues/1341)
- [Issue #1401: onDragStart on click without onDragStop](https://github.com/react-grid-layout/react-grid-layout/issues/1401)
- [Current Flow types](https://github.com/react-grid-layout/react-grid-layout/blob/master/lib/utils.js)
- [DefinitelyTyped definitions](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react-grid-layout)
