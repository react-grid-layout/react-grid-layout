# Migration Guide: v1 to v2

This guide covers migrating from react-grid-layout v1 to v2. The v2 release is a complete TypeScript rewrite with a modern hooks-based API while maintaining backwards compatibility.

## Quick Start

**If you want zero migration effort**, simply change your import path:

```typescript
// Before (v1)
import ReactGridLayout, { WidthProvider, Responsive } from "react-grid-layout";

// After (v2 - legacy compatibility mode)
import ReactGridLayout, {
  WidthProvider,
  Responsive
} from "react-grid-layout/legacy";
```

Your existing code will work exactly as before. You can then migrate to the new API incrementally.

## Breaking Changes

### 1. `onDragStart` No Longer Fires on Click-Only Events

**v1 Behavior**: `onDragStart` fires immediately on `mousedown`, before any mouse movement.

**v2 Behavior**: `onDragStart` only fires after the mouse has moved at least 3 pixels from the initial mousedown position.

**Why**: This matches user expectations and allows distinguishing between clicks and drags on grid items.

**Migration**:

```typescript
// If you relied on immediate onDragStart, use onMouseDown instead
<div
  key="a"
  onMouseDown={(e) => {
    // Your logic that previously was in onDragStart
  }}
>
  Content
</div>
```

### 2. Immutable Callback Parameters

**v1 Behavior**: Some callbacks allowed mutating `layoutItem` and `placeholder` directly.

**v2 Behavior**: All callback parameters are immutable (read-only).

**Migration**:

```typescript
// v1 (mutable) - NO LONGER WORKS
onResize(layout, oldItem, newItem, placeholder) {
  if (newItem.h < 3) {
    newItem.w = 2;      // Direct mutation
    placeholder.w = 2;  // Direct mutation
  }
}

// v2 (immutable) - use constraints or onLayoutChange
<GridLayout
  layout={layout.map(item => ({
    ...item,
    // Apply constraints via layout transformation
    maxW: item.h < 3 ? 2 : undefined
  }))}
  onLayoutChange={(newLayout) => {
    setLayout(applyMyConstraints(newLayout));
  }}
/>
```

### 3. `data-grid` Prop Only in Legacy Wrapper

**v1 Behavior**: Children could define their position via `data-grid` prop.

**v2 Behavior**: The new API requires explicit layout props. `data-grid` only works via the legacy wrapper.

```typescript
// v1 / Legacy - still works with 'react-grid-layout/legacy'
<ReactGridLayout>
  <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>A</div>
</ReactGridLayout>

// v2 - explicit layout prop required
<GridLayout layout={[{ i: 'a', x: 0, y: 0, w: 2, h: 2 }]}>
  <div key="a">A</div>
</GridLayout>
```

### 4. Fast Compaction Algorithm

**v2** uses a faster O(n log n) compaction algorithm by default. Results are identical for most layouts but may differ in edge cases.

**Migration** (if you need exact v1 behavior):

```typescript
// Use legacy compactor for exact v1 behavior
import { compact } from "react-grid-layout/core";

// The compact() function maintains v1 behavior for compatibility
```

## New v2 API Features

### Composable Interfaces

v2 organizes props into focused interfaces:

```typescript
import { GridLayout } from 'react-grid-layout';

<GridLayout
  width={width}
  layout={layout}
  // Grid configuration
  gridConfig={{
    cols: 12,
    rowHeight: 30,
    margin: [10, 10],
    containerPadding: [10, 10]
  }}
  // Drag configuration
  dragConfig={{
    enabled: true,
    handle: '.drag-handle',
    cancel: '.no-drag'
  }}
  // Resize configuration
  resizeConfig={{
    enabled: true,
    handles: ['se', 'sw']
  }}
  // Compaction (pluggable algorithms)
  compactor={verticalCompactor}
/>
```

### Hooks API

v2 provides React hooks for fine-grained control:

```typescript
import { useContainerWidth, useGridLayout, useResponsiveLayout } from 'react-grid-layout';

function MyGrid() {
  // Measure container width
  const { width, containerRef, mounted } = useContainerWidth();

  // Manage layout state
  const {
    layout,
    onDragStart,
    onDrag,
    onDragStop,
    containerHeight
  } = useGridLayout({
    layout: initialLayout,
    cols: 12,
    width
  });

  return (
    <div ref={containerRef}>
      {mounted && (
        <GridLayout width={width} layout={layout}>
          {/* children */}
        </GridLayout>
      )}
    </div>
  );
}
```

### Core Utilities (Framework-Agnostic)

v2 separates core logic from React:

```typescript
import {
  compact,
  moveElement,
  collides,
  cloneLayout,
  bottom
} from "react-grid-layout/core";

// Use layout algorithms without React
const newLayout = compact(layout, "vertical", 12);
```

## Step-by-Step Migration

### Step 1: Update Imports (Zero Code Changes)

```typescript
// Change this:
import ReactGridLayout, { WidthProvider, Responsive } from "react-grid-layout";

// To this:
import ReactGridLayout, {
  WidthProvider,
  Responsive
} from "react-grid-layout/legacy";
```

### Step 2: Adopt useContainerWidth Hook

Replace `WidthProvider` HOC with the new hook:

```typescript
// Before (v1)
import { WidthProvider } from 'react-grid-layout/legacy';
const GridLayoutWithWidth = WidthProvider(ReactGridLayout);

function MyGrid() {
  return (
    <GridLayoutWithWidth {...props}>
      {children}
    </GridLayoutWithWidth>
  );
}

// After (v2)
import { GridLayout, useContainerWidth } from 'react-grid-layout';

function MyGrid() {
  const { width, containerRef, mounted } = useContainerWidth();

  return (
    <div ref={containerRef}>
      {mounted && (
        <GridLayout width={width} {...props}>
          {children}
        </GridLayout>
      )}
    </div>
  );
}
```

### Step 3: Convert data-grid to Explicit Layout

```typescript
// Before (v1)
<ReactGridLayout>
  <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>A</div>
  <div key="b" data-grid={{ x: 2, y: 0, w: 2, h: 2 }}>B</div>
</ReactGridLayout>

// After (v2)
const layout = [
  { i: 'a', x: 0, y: 0, w: 2, h: 2 },
  { i: 'b', x: 2, y: 0, w: 2, h: 2 }
];

<GridLayout layout={layout}>
  <div key="a">A</div>
  <div key="b">B</div>
</GridLayout>
```

### Step 4: Use Composable Config Interfaces

```typescript
// Before (v1 - flat props)
<ReactGridLayout
  cols={12}
  rowHeight={30}
  margin={[10, 10]}
  isDraggable={true}
  draggableHandle=".handle"
  isResizable={true}
  resizeHandles={['se']}
/>

// After (v2 - composable interfaces)
<GridLayout
  gridConfig={{ cols: 12, rowHeight: 30, margin: [10, 10] }}
  dragConfig={{ enabled: true, handle: '.handle' }}
  resizeConfig={{ enabled: true, handles: ['se'] }}
/>
```

## Package Exports

v2 provides multiple entry points:

```typescript
// Main entry (recommended for new projects)
import {
  GridLayout,
  ResponsiveGridLayout,
  useContainerWidth
} from "react-grid-layout";

// Core utilities (no React dependency)
import { compact, moveElement, collides } from "react-grid-layout/core";

// Legacy API (100% v1 compatible)
import ReactGridLayout, {
  WidthProvider,
  Responsive
} from "react-grid-layout/legacy";

// Extra utilities
import {
  GridBackground,
  calcGridCellDimensions
} from "react-grid-layout/extras";
```

## TypeScript

v2 is written in TypeScript with comprehensive type definitions:

```typescript
import type {
  Layout,
  LayoutItem,
  GridConfig,
  DragConfig,
  ResizeConfig,
  Compactor
} from "react-grid-layout";
```

## Custom Components as Grid Items

Custom React components used as grid children must forward refs and specific props:

```typescript
import { forwardRef } from 'react';

const CustomItem = forwardRef<HTMLDivElement, CustomItemProps>(
  ({ style, className, onMouseDown, onMouseUp, onTouchEnd, children, ...props }, ref) => (
    <div
      ref={ref}
      style={style}
      className={className}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchEnd={onTouchEnd}
    >
      {/* children is required for resize handles */}
      {children}
      <YourCustomContent {...props} />
    </div>
  )
);
```

## Common Issues

### Layout items are not updating

Ensure each grid item has a unique `key` prop that matches the `i` property in the layout:

```typescript
const layout = [{ i: 'unique-id', x: 0, y: 0, w: 2, h: 2 }];

<GridLayout layout={layout}>
  <div key="unique-id">Content</div>  {/* key must match i */}
</GridLayout>
```

### Performance issues with many items

Memoize the children array passed to GridLayout:

```typescript
const children = useMemo(() =>
  layout.map(item => <div key={item.i}>{item.i}</div>),
  [layout]
);

<GridLayout layout={layout}>
  {children}
</GridLayout>
```

### Width is undefined

The new API requires explicit width. Use the `useContainerWidth` hook:

```typescript
const { width, containerRef, mounted } = useContainerWidth();

<div ref={containerRef}>
  {mounted && <GridLayout width={width} {...props} />}
</div>
```

## Getting Help

- [GitHub Issues](https://github.com/react-grid-layout/react-grid-layout/issues)
- [RFC Document](./rfcs/0001-v2-typescript-rewrite.md) - Full design details
- [CodeSandbox Template](https://codesandbox.io/s/staging-bush-3lvt7) - Bug reproduction template
