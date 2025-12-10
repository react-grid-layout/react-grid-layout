# RFC 0002: Pluggable Layout Constraints

## Summary

Add a `LayoutConstraint` interface to react-grid-layout v2, following the same patterns as `Compactor` and `PositionStrategy`. This enables pluggable position and size constraints, replacing hardcoded logic with composable, tree-shakeable constraint functions.

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

```typescript
// Grid boundary constraints (enabled by default)
export const gridBounds: LayoutConstraint = {
  name: "gridBounds",
  constrainPosition: (item, x, y, { cols, maxRows }) => ({
    x: clamp(x, 0, cols - item.w),
    y: clamp(y, 0, maxRows - item.h)
  }),
  constrainSize: (item, w, h, handle, { cols, maxRows }) => ({
    w: clamp(w, 1, cols - item.x),
    h: clamp(h, 1, maxRows - item.y)
  })
};

// Item min/max constraints (enabled by default)
export const minMaxSize: LayoutConstraint = {
  name: "minMaxSize",
  constrainSize: (item, w, h) => ({
    w: clamp(w, item.minW ?? 1, item.maxW ?? Infinity),
    h: clamp(h, item.minH ?? 1, item.maxH ?? Infinity)
  })
};

// Container bounding (opt-in, replaces isBounded)
// Uses containerHeight to calculate visible rows, falls back to maxRows if 0
export const containerBounds: LayoutConstraint = {
  name: "containerBounds",
  constrainPosition: (
    item,
    x,
    y,
    { cols, maxRows, containerHeight, rowHeight, margin }
  ) => {
    const visibleRows =
      containerHeight > 0
        ? Math.floor((containerHeight + margin[1]) / (rowHeight + margin[1]))
        : maxRows;
    return {
      x: clamp(x, 0, cols - item.w),
      y: clamp(y, 0, visibleRows - item.h)
    };
  }
};

// Axis-specific bounding
export const boundedX: LayoutConstraint = {
  name: "boundedX",
  constrainPosition: (item, x, y, { cols }) => ({
    x: clamp(x, 0, cols - item.w),
    y
  })
};

export const boundedY: LayoutConstraint = {
  name: "boundedY",
  constrainPosition: (item, x, y, { maxRows }) => ({
    x,
    y: clamp(y, 0, maxRows - item.h)
  })
};

// Aspect ratio constraint factory
export const aspectRatio = (ratio: number): LayoutConstraint => ({
  name: `aspectRatio(${ratio})`,
  constrainSize: (item, w, h) => ({
    w,
    h: Math.max(1, Math.round(w / ratio))
  })
});

// Snap-to-grid constraint factory
export const snapToGrid = (
  stepX: number,
  stepY: number = stepX
): LayoutConstraint => ({
  name: `snapToGrid(${stepX}, ${stepY})`,
  constrainPosition: (item, x, y) => ({
    x: Math.round(x / stepX) * stepX,
    y: Math.round(y / stepY) * stepY
  })
});
```

### Usage

**Grid-level constraints:**

```tsx
<GridLayout constraints={[gridBounds, minMaxSize, aspectRatio(16 / 9)]} />
```

**Per-item constraints (via LayoutItem):**

```typescript
interface LayoutItem {
  // ... existing props
  constraints?: LayoutConstraint[];
}

const layout = [
  { i: "video", x: 0, y: 0, w: 4, h: 2, constraints: [aspectRatio(16 / 9)] },
  { i: "sidebar", x: 4, y: 0, w: 2, h: 4, constraints: [boundedX] }
];
```

**Default constraints:**

```typescript
export const defaultConstraints = [gridBounds, minMaxSize];
```

### Application Order

Constraints are applied in array order, allowing composition:

```typescript
function applyConstraints(
  constraints: LayoutConstraint[],
  item: LayoutItem,
  x: number,
  y: number,
  context: ConstraintContext
): { x: number; y: number } {
  let result = { x, y };
  for (const constraint of constraints) {
    if (constraint.constrainPosition) {
      result = constraint.constrainPosition(item, result.x, result.y, context);
    }
  }
  return result;
}
```

### Integration Points

**In `calcXY` (calculate.ts):**

```typescript
// Replace hardcoded clamping with constraint application
export function calcXY(
  positionParams: PositionParams,
  top: number,
  left: number,
  w: number,
  h: number,
  constraints: LayoutConstraint[] = defaultConstraints,
  item?: LayoutItem
): { x: number; y: number } {
  // ... calculate raw x, y from pixels

  // Apply constraints
  const context = { cols, maxRows, ... };
  const itemConstraints = [...constraints, ...(item?.constraints ?? [])];
  return applyPositionConstraints(itemConstraints, item, x, y, context);
}
```

**In GridItem.tsx:**

- Remove hardcoded minW/maxW/minH/maxH clamping
- Pass constraints to calcXY/calcWH
- Apply per-item constraints

**In GridLayout.tsx:**

- Add `constraints?: LayoutConstraint[]` prop
- Default to `defaultConstraints`
- Pass to calculation functions

## Files to Modify

1. **src/core/types.ts** - Add LayoutConstraint interface, ConstraintContext
2. **src/core/constraints.ts** (new) - Built-in constraints, apply functions
3. **src/core/calculate.ts** - Integrate constraint application
4. **src/core/index.ts** - Export constraints
5. **src/react/components/GridLayout.tsx** - Add constraints prop
6. **src/react/components/GridItem.tsx** - Remove hardcoded min/max logic
7. **src/legacy/ReactGridLayout.tsx** - Map isBounded → containerBounds
8. **test/spec/constraints-test.ts** (new) - Test constraint system

## Backwards Compatibility

- `defaultConstraints` maintains current behavior
- Legacy `isBounded` prop maps to adding `containerBounds` constraint
- Legacy `minW/maxW/minH/maxH` continue to work via `minMaxSize` constraint
- No breaking changes for existing users

## Open Questions

1. Should per-item constraints merge with or override grid-level constraints?
2. Should constraints receive the full layout for collision-aware constraints?
3. Should there be a `constrainDrop` method for external drag-drop?
