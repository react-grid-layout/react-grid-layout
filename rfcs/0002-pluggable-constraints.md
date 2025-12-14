# RFC 0002: Pluggable Layout Constraints

## Summary

Add a `LayoutConstraint` interface to react-grid-layout v2, following the same patterns as `Compactor` and `PositionStrategy`. This enables pluggable position and size constraints, replacing hardcoded logic with composable, tree-shakeable constraint functions.

## Live Examples

See these examples to understand the constraint system in action:

- **[Example 20: Constraints](../test/examples/20-constraints.jsx)** - Interactive demo of all built-in constraints with compaction toggle
- **[Example 21: Aspect Ratio](../test/examples/21-aspect-ratio.jsx)** - Per-item aspect ratio constraints
- **[Example 22: Custom Constraints](../test/examples/22-custom-constraints.jsx)** - How to create your own constraint functions

Run the examples locally with `npm run dev` and navigate to the constraints examples.

## Motivation

Currently, constraints are hardcoded in multiple places:

- `calcXY`: clamps x/y to grid bounds
- `calcWH`: clamps w/h to grid bounds, with special handle logic
- `GridItem.tsx`: applies minW/maxW/minH/maxH
- `position.ts`: pixel-level container bounds
- `layout.ts`: correctBounds overflow handling

Users requesting features like:

- Axis-specific bounding (PR #1298)
- Aspect ratio locking (PR #323, #1777)
- Snap-to-grid positioning
- Custom collision behavior

...cannot implement them without forking the library.

## Design

### Interface Definition

```typescript
interface LayoutConstraint {
  /** Constraint identifier for debugging */
  readonly name: string;

  /**
   * Constrain position during drag operations.
   * Called after grid unit conversion, before layout update.
   */
  constrainPosition?(
    item: LayoutItem,
    x: number,
    y: number,
    context: ConstraintContext
  ): { x: number; y: number };

  /**
   * Constrain size during resize operations.
   * Called after grid unit conversion, before layout update.
   */
  constrainSize?(
    item: LayoutItem,
    w: number,
    h: number,
    handle: ResizeHandleAxis,
    context: ConstraintContext
  ): { w: number; h: number };
}

interface ConstraintContext {
  cols: number;
  maxRows: number;
  containerWidth: number;
  containerHeight: number;
  rowHeight: number;
  margin: readonly [number, number];
  layout: Layout;
}
```

### Built-in Constraints

#### Position Constraints

```typescript
// Grid boundary constraints (enabled by default)
// Keeps items within 0 to cols (x) and 0 to maxRows (y)
export const gridBounds: LayoutConstraint;

// Container bounding (opt-in, replaces isBounded)
// Uses containerHeight to calculate visible rows
export const containerBounds: LayoutConstraint;

// Axis-specific bounding
export const boundedX: LayoutConstraint; // Only constrains X
export const boundedY: LayoutConstraint; // Only constrains Y
```

#### Size Constraints

```typescript
// Item min/max constraints (enabled by default)
// Enforces per-item minW/maxW/minH/maxH properties
export const minMaxSize: LayoutConstraint;
```

#### Constraint Factories

```typescript
// Aspect ratio constraint (pixel-aware)
// Maintains width:height ratio in actual pixels, accounting for
// different column widths vs row heights
export function aspectRatio(ratio: number): LayoutConstraint;

// Snap-to-grid constraint
// Snaps positions to multiples of step values
export function snapToGrid(stepX: number, stepY?: number): LayoutConstraint;

// Grid-wide min/max size
export function minSize(minW: number, minH: number): LayoutConstraint;
export function maxSize(maxW: number, maxH: number): LayoutConstraint;
```

### Usage

#### Grid-level Constraints

Apply constraints to all items in the grid:

```tsx
import {
  GridLayout,
  gridBounds,
  minMaxSize,
  aspectRatio
} from "react-grid-layout";

// Default behavior
<GridLayout constraints={[gridBounds, minMaxSize]} />

// Add aspect ratio to all items
<GridLayout constraints={[gridBounds, minMaxSize, aspectRatio(16/9)]} />

// No constraints (items can be positioned/sized freely)
<GridLayout constraints={[]} />
```

#### Per-item Constraints

Apply constraints to specific items via the layout:

```typescript
const layout = [
  // Video player with 16:9 aspect ratio
  { i: "video", x: 0, y: 0, w: 4, h: 2, constraints: [aspectRatio(16 / 9)] },

  // Sidebar that can only move horizontally
  { i: "sidebar", x: 4, y: 0, w: 2, h: 4, constraints: [boundedX] }
];
```

#### Creating Custom Constraints

```typescript
// Custom constraint: items can only be placed in even columns
const evenColumnsOnly: LayoutConstraint = {
  name: "evenColumnsOnly",
  constrainPosition(item, x, y, context) {
    const evenX = Math.round(x / 2) * 2;
    return { x: evenX, y };
  }
};

// Custom constraint: maximum area
const maxArea = (area: number): LayoutConstraint => ({
  name: `maxArea(${area})`,
  constrainSize(item, w, h, handle, context) {
    const currentArea = w * h;
    if (currentArea <= area) return { w, h };

    // Reduce the dimension being resized
    if (handle.includes("e") || handle.includes("w")) {
      return { w: Math.floor(area / h), h };
    }
    return { w, h: Math.floor(area / w) };
  }
});
```

See [Example 22](../test/examples/22-custom-constraints.jsx) for more custom constraint examples.

### Default Constraints

```typescript
export const defaultConstraints = [gridBounds, minMaxSize];
```

When no `constraints` prop is provided, `defaultConstraints` is used, maintaining backwards compatibility.

### Application Order

Constraints are applied in array order, allowing composition:

1. Grid-level constraints are applied first (in array order)
2. Per-item constraints are applied after (in array order)

```typescript
// Order matters!
// gridBounds runs first, then minMaxSize
<GridLayout constraints={[gridBounds, minMaxSize]} />

// If you want boundedX instead of full grid bounds,
// use boundedX as the position constraint
<GridLayout constraints={[boundedX, minMaxSize]} />
```

### Important: Constraints vs Compaction

**Constraints** control where items can be positioned during drag/resize operations.

**Compaction** runs AFTER drag/resize and can move items to fill gaps.

With vertical compaction (default), items float up after being dropped. This can make position constraints like `boundedX` (free Y movement) less visible because compaction moves items back up.

To see position constraints clearly, use `noCompactor`:

```tsx
import {
  GridLayout,
  noCompactor,
  boundedX,
  minMaxSize
} from "react-grid-layout";

<GridLayout constraints={[boundedX, minMaxSize]} compactor={noCompactor} />;
```

See [Example 20](../test/examples/20-constraints.jsx) which includes a "No Compaction" toggle.

## Implementation Details

### Constraint Application Functions

```typescript
// Apply position constraints
function applyPositionConstraints(
  constraints: LayoutConstraint[],
  item: LayoutItem,
  x: number,
  y: number,
  context: ConstraintContext
): { x: number; y: number };

// Apply size constraints
function applySizeConstraints(
  constraints: LayoutConstraint[],
  item: LayoutItem,
  w: number,
  h: number,
  handle: ResizeHandleAxis,
  context: ConstraintContext
): { w: number; h: number };
```

### Integration Points

**In GridItem.tsx:**

- Constraints are applied after pixel-to-grid conversion
- Per-item constraints are merged with grid-level constraints
- react-resizable uses minimal constraints (1 grid unit minimum), letting our system handle all limits

**In GridLayout.tsx:**

- `constraints` prop accepts `LayoutConstraint[]`
- Defaults to `defaultConstraints`
- Passed to GridItem via `processGridItem`

## Files

1. **src/core/types.ts** - LayoutConstraint interface, ConstraintContext
2. **src/core/constraints.ts** - Built-in constraints, apply functions
3. **src/core/index.ts** - Export constraints
4. **src/react/components/GridLayout.tsx** - `constraints` prop
5. **src/react/components/GridItem.tsx** - Constraint application in drag/resize
6. **test/spec/constraints-test.ts** - Unit tests
7. **test/examples/20-constraints.jsx** - Built-in constraints demo
8. **test/examples/21-aspect-ratio.jsx** - Aspect ratio demo
9. **test/examples/22-custom-constraints.jsx** - Custom constraints demo

## Backwards Compatibility

- `defaultConstraints` maintains current behavior
- Legacy `isBounded` prop maps to adding `containerBounds` constraint
- Legacy `minW/maxW/minH/maxH` continue to work via `minMaxSize` constraint
- No breaking changes for existing users

## Resolved Questions

1. **Per-item constraints merge with grid-level constraints** - they are applied after, not replacing
2. **Constraints receive the full layout** - via `ConstraintContext.layout` for collision-aware constraints
3. **No constrainDrop method** - drop handling uses existing constraint system
