# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React-Grid-Layout is a draggable and resizable grid layout system for React with responsive breakpoints. It's a pure React implementation (no jQuery) used in production by BitMEX, Grafana, Metabase, HubSpot, and many others.

**Version 2** is a complete TypeScript rewrite with a modern hooks-based API while maintaining backwards compatibility through a dedicated legacy wrapper.

## Package Manager

**Always use `yarn`** instead of `npm` for all commands in this project.

## Development Commands

### Testing

```bash
# Run all tests with coverage
make test
yarn test

# Watch mode for development
make test-watch

# Run specific test file
NODE_ENV=test npx jest --testPathPatterns="compactors"
```

### Building

```bash
# Build the library (ESM, CJS, and TypeScript declarations)
make build
yarn build

# Clean build artifacts
make clean
```

### Development Server

```bash
# Start development server with hot reload (port 4002)
make dev
yarn dev
```

### Linting & Formatting

```bash
# Run ESLint
yarn lint

# Format code with Prettier
npm run fmt
```

## Architecture (v2)

### Package Structure

```
src/
├── core/                    # Pure TypeScript, no React dependencies
│   ├── types.ts             # All type definitions
│   ├── layout.ts            # Layout manipulation (move, clone, validate)
│   ├── collision.ts         # Collision detection
│   ├── sort.ts              # Sorting algorithms
│   ├── compactors.ts        # Compaction algorithms (vertical, horizontal)
│   ├── compact-compat.ts    # Legacy compact() function wrapper
│   ├── constraints.ts       # Layout constraints (position, size, aspect ratio)
│   ├── calculate.ts         # Grid calculations (grid units <-> pixels)
│   ├── position.ts          # CSS positioning helpers
│   ├── responsive.ts        # Breakpoint utilities
│   └── index.ts             # Core exports
│
├── react/                   # React bindings
│   ├── hooks/
│   │   ├── useContainerWidth.ts   # Container width measurement
│   │   ├── useGridLayout.ts       # Grid state management
│   │   └── useResponsiveLayout.ts # Responsive breakpoint handling
│   └── components/
│       ├── GridItem.tsx           # Individual grid item
│       ├── GridLayout.tsx         # Main grid component
│       ├── ResponsiveGridLayout.tsx
│       └── WidthProvider.tsx      # Width measurement HOC (internal)
│
├── legacy/                  # v1 API compatibility
│   ├── ReactGridLayout.tsx        # Legacy component wrapper
│   ├── ResponsiveReactGridLayout.tsx
│   ├── WidthProvider.tsx          # Re-exports for backwards compat
│   └── index.ts
│
└── index.ts                 # Main entry point
```

### Entry Points

```typescript
// New v2 API (recommended)
import ReactGridLayout, {
  Responsive,
  useContainerWidth,
  verticalCompactor,
  horizontalCompactor
} from "react-grid-layout";

// With composable interfaces
<ReactGridLayout
  width={width}
  layout={layout}
  gridConfig={{ cols: 12, rowHeight: 30 }}
  dragConfig={{ enabled: true, handle: '.handle' }}
  resizeConfig={{ enabled: true, handles: ['se'] }}
  compactor={verticalCompactor}
/>

// Core utilities (framework-agnostic)
import {
  compact,
  moveElement,
  collides,
  transformStrategy,
  absoluteStrategy,
  createScaledStrategy
} from "react-grid-layout/core";

// Legacy v1 API (100% backwards compatible, flat props)
import ReactGridLayout, {
  WidthProvider,
  Responsive
} from "react-grid-layout/legacy";
```

### Core Components

**GridLayout** (`src/react/components/GridLayout.tsx`)

- Main grid layout component (functional, hooks-based)
- Manages layout state, drag/drop, and resize operations
- Handles compaction (vertical, horizontal, or none)
- All grid items must have a unique `key` prop matching `i` in layout

**ResponsiveGridLayout** (`src/react/components/ResponsiveGridLayout.tsx`)

- Wraps GridLayout with responsive breakpoint support
- Manages multiple layouts keyed by breakpoint
- Automatically generates missing breakpoint layouts

**GridItem** (`src/react/components/GridItem.tsx`)

- Individual grid item wrapper
- Integrates with react-draggable and react-resizable
- Handles positioning via CSS transforms (default)

### Core Algorithms

**Compaction** (`src/core/compactors.ts`)

- `verticalCompactor`: Items float up (default)
- `horizontalCompactor`: Items float left
- `noCompactor`: Free positioning
- All implement the `Compactor` interface

**Collision Detection** (`src/core/collision.ts`)

- `collides()`: Check if two items overlap
- `getFirstCollision()`: Find first collision
- `getAllCollisions()`: Find all collisions

**Layout Utilities** (`src/core/layout.ts`)

- `moveElement()`: Move item with collision handling
- `cloneLayout()`: Deep copy layout array
- `validateLayout()`: Validate layout structure

### Key Concepts

**Layout Structure**

```typescript
interface LayoutItem {
  i: string; // Unique identifier
  x: number; // X position in grid units
  y: number; // Y position in grid units
  w: number; // Width in grid units
  h: number; // Height in grid units
  minW?: number; // Min width
  maxW?: number; // Max width
  minH?: number; // Min height
  maxH?: number; // Max height
  static?: boolean; // Cannot be moved/resized
  isDraggable?: boolean;
  isResizable?: boolean;
}

type Layout = LayoutItem[];
```

**Width Handling**

```typescript
// v2: Use the hook
const { width, containerRef, mounted } = useContainerWidth();
return (
  <div ref={containerRef}>
    {mounted && <GridLayout width={width} ... />}
  </div>
);

// Legacy: Use WidthProvider HOC
import { WidthProvider } from 'react-grid-layout/legacy';
const GridLayoutWithWidth = WidthProvider(ReactGridLayout);
```

## Technology Stack

- **Language**: TypeScript
- **Build**: tsup (ESM + CJS + DTS)
- **Testing**: Jest with @testing-library/react
- **Linting**: ESLint 9 with flat config
- **Formatting**: Prettier

## Examples

Interactive examples are located in `test/examples/`. When adding major features, always create corresponding examples.

### Example Structure

```
test/examples/
├── 00-showcase.jsx      # Main showcase demo
├── 01-basic.jsx         # Basic usage
├── ...
└── 24-custom-constraints.jsx
```

### Adding New Examples

1. **Create the example file**: `test/examples/NN-feature-name.jsx`
   - Follow the pattern of existing examples (export class, hook into test-hook.jsx)
   - Use the legacy API with `WidthProvider(RGL)` for compatibility

2. **Register in vars.js**: Add entry to `examples/util/vars.js`:

   ```js
   {
     title: "Feature Name",
     source: "feature-name",  // matches filename without number prefix
     paragraphs: ["Description of the example..."]
   }
   ```

3. **Update README.md**: Add link to the examples list

4. **Generate HTML**: Run `env CONTENT_BASE="/react-grid-layout/examples/" node ./examples/util/generate.js`

### Running Examples

```bash
yarn dev  # Start dev server at http://localhost:4002
```

## Testing Guidelines

- Tests are in `test/spec/`
- Use `@testing-library/react` for component testing
- Run single test: `NODE_ENV=test npx jest --testPathPatterns="pattern"` (note: must use `--testPathPatterns` plural, not `--testPathPattern`)

## Important Implementation Notes

### Performance

- Memoize the `children` array passed to GridLayout
- GridLayout compares children by reference for optimization
- Without memoization, every parent re-render will re-render the entire grid

### Custom Components as Grid Items

Custom React components used as grid children must:

1. Forward refs to an underlying DOM node
2. Forward these props: `style`, `className`, `onMouseDown`, `onMouseUp`, `onTouchEnd`
3. Include `{children}` to render the resize handle

```typescript
const CustomItem = forwardRef<HTMLDivElement, Props>(
  ({ style, className, onMouseDown, onMouseUp, onTouchEnd, children, ...props }, ref) => (
    <div ref={ref} style={style} className={className}
         onMouseDown={onMouseDown} onMouseUp={onMouseUp} onTouchEnd={onTouchEnd}>
      {children}
    </div>
  )
);
```

### Common Pitfalls

- **Forgetting unique keys**: Each grid item needs a unique `key` matching the `i` in layout
- **Layout/children mismatch**: Number of layout items must match number of children
- **Missing width**: GridLayout requires a `width` prop (use `useContainerWidth` hook)

## Build Output

```
dist/
├── index.js          # CJS main entry
├── index.mjs         # ESM main entry
├── index.d.ts        # TypeScript declarations
├── core.js/mjs/d.ts  # Core-only (no React)
├── react.js/mjs/d.ts # React components
└── legacy.js/mjs/d.ts # v1 API compatibility
```

## Bug Reporting

Users should reproduce bugs in CodeSandbox: https://codesandbox.io/s/staging-bush-3lvt7

## RFC & Design Document

**Important**: See `rfcs/0001-v2-typescript-rewrite.md` for the complete design document. This RFC defines:

- Breaking changes (drag threshold, immutable callbacks, data-grid deprecation)
- Composable configuration interfaces (GridConfig, DragConfig, ResizeConfig, DropConfig)
- PositionStrategy interface (transform vs absolute positioning)
- Compactor interface (pluggable compaction algorithms)
- Fast compaction algorithms (rising tide - O(n log n))
- Migration guide from v1 to v2

The v2 implementation follows the RFC with composable interfaces now fully implemented.
