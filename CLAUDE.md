# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React-Grid-Layout is a draggable and resizable grid layout system for React with responsive breakpoints. It's a pure React implementation (no jQuery) used in production by BitMEX, Grafana, Metabase, HubSpot, and many others.

## Development Commands

### Testing

```bash
# Run all tests with coverage
make test
npm test

# Watch mode for development
make test-watch

# Update test snapshots
make test-update-snapshots
```

### Building

```bash
# Build the library (transpiles lib/ to build/, creates dist/ bundle)
make build
npm run build

# Clean build artifacts
make clean
```

### Development Server

```bash
# Start development server with hot reload
make dev
npm run dev

# Build and view examples
make build-example
make view-example
```

### Linting & Formatting

```bash
# Run Flow type checker and ESLint
make lint
npm run lint

# Format code with Prettier
npm run fmt

# Check formatting without modifying
npm run fmt:check
```

## Architecture

### Core Components

**ReactGridLayout** (`lib/ReactGridLayout.jsx`)

- Main grid layout component
- Manages layout state, drag/drop, and resize operations
- Handles compaction (vertical, horizontal, or none)
- Uses `shouldComponentUpdate` optimization that relies on memoized children
- All grid items must have a unique `i` (id) property

**ResponsiveReactGridLayout** (`lib/ResponsiveReactGridLayout.jsx`)

- Wraps ReactGridLayout with responsive breakpoint support
- Manages multiple layouts keyed by breakpoint (e.g., `{lg: layout1, md: layout2}`)
- Automatically generates missing breakpoint layouts by interpolating from the largest provided layout
- Handles breakpoint transitions and fires callbacks for layout changes

**GridItem** (`lib/GridItem.jsx`)

- Individual grid item wrapper component
- Integrates with react-draggable (via DraggableCore) and react-resizable
- Handles positioning via CSS transforms (default) or absolute positioning
- Supports drag handles and custom resize handles
- Manages item-level props like `static`, `isDraggable`, `isResizable`, `isBounded`

**WidthProvider** (`lib/components/WidthProvider.jsx`)

- HOC that provides automatic width measurement using ResizeObserver
- Eliminates need to manually pass `width` prop to grid layouts
- Use `measureBeforeMount={true}` to prevent initial resizing animation
- **Important for hooks users**: Wrap in `useMemo` to prevent re-renders: `const ResponsiveGridLayout = useMemo(() => WidthProvider(Responsive), [])`

### Utility Modules

**utils.js** (`lib/utils.js`)

- Core layout algorithms: compaction, collision detection, movement
- Layout manipulation: `compact()`, `moveElement()`, `getAllCollisions()`
- Layout item helpers: `getLayoutItem()`, `synchronizeLayoutWithChildren()`
- Compaction types: `'vertical'` (default), `'horizontal'`, or `null`
- Performance optimization: `fastRGLPropsEqual()` for shouldComponentUpdate

**calculateUtils.js** (`lib/calculateUtils.js`)

- Grid coordinate calculations between pixels and grid units
- `calcXY()`: Converts pixel position to grid coordinates
- `calcWH()`: Converts pixel dimensions to grid units
- `calcGridItemPosition()`: Converts grid coordinates to pixel position
- All calculations account for margins and container padding

**responsiveUtils.js** (`lib/responsiveUtils.js`)

- Breakpoint management utilities
- `getBreakpointFromWidth()`: Determines active breakpoint from width
- `findOrGenerateResponsiveLayout()`: Creates layouts for missing breakpoints
- Layout interpolation and generation logic

### Key Concepts

**Layout Structure**

- A layout is an array of layout items
- Each layout item has: `{i: string, x: number, y: number, w: number, h: number, ...optional props}`
- Layout can be provided via `layout` prop or `data-grid` attribute on children
- `data-grid` on children takes precedence over `layout` prop

**Grid Dimensions**

- Grid uses 12 columns by default (configurable via `cols` prop)
- `rowHeight` defines height of one grid unit (default: 150px)
- Actual pixel height = `(rowHeight * h) + (margin[1] * (h - 1))`
- Margins add space between items and must be accounted for in calculations

**Drag and Resize Flow**

1. User interaction starts (onDragStart/onResizeStart)
2. Movement occurs (onDrag/onResize) - layout compacts in real-time
3. Interaction ends (onDragStop/onResizeStop) - final layout is saved
4. `onLayoutChange` callback fires with new layout

**Compaction**

- `vertical`: Items compact upward (default behavior)
- `horizontal`: Items compact leftward
- `null`: No compaction, free movement (requires `preventCollision={true}`)

**Collision Handling**

- By default, items push each other out of the way during drag/resize
- `preventCollision={true}`: Items cannot overlap, blocks movement instead
- `allowOverlap={true}`: Items can overlap freely (new in recent versions)

## Technology Stack

- **Language**: JavaScript with Flow type annotations
- **Build**: Babel (transpiles to ES5), Webpack (UMD bundle)
- **Testing**: Jest with @testing-library/react
- **Linting**: ESLint 9 with flat config (eslint.config.js)
- **Formatting**: Prettier with lint-staged pre-commit hooks
- **Type Checking**: Flow (v0.172.0)

## File Structure

```
lib/                          Source code (Flow typed)
├── ReactGridLayout.jsx       Main grid component
├── ResponsiveReactGridLayout.jsx  Responsive wrapper
├── GridItem.jsx              Individual grid item
├── utils.js                  Core layout algorithms
├── calculateUtils.js         Coordinate calculations
├── responsiveUtils.js        Breakpoint utilities
├── fastRGLPropsEqual.js      Performance optimization
├── ReactGridLayoutPropTypes.js  PropTypes & Flow types
└── components/
    └── WidthProvider.jsx     Auto-width HOC

build/                        Transpiled output (for npm)
dist/                         UMD bundle (for CDN)
test/
├── spec/                     Test files
│   ├── lifecycle-test.js
│   └── utils-test.js
└── util/                     Test utilities

examples/                     Demo examples (not included in repo, generated)
```

## Testing Guidelines

- Tests are in `test/spec/`
- Use `@testing-library/react` for component testing
- Snapshot tests for layout calculations
- Coverage thresholds: 65% statements/functions, 60% branches
- Run single test: `npm test -- --testNamePattern="test name"`

## Important Implementation Notes

### Performance

- Parent components should memoize the `children` array passed to ReactGridLayout
- ReactGridLayout's `shouldComponentUpdate` checks `this.props.children !== nextProps.children`
- Without memoization, every parent re-render will re-render the entire grid

### Custom Components as Grid Items

Custom React components used as grid children must:

1. Forward refs to an underlying DOM node
2. Forward these props to the same DOM node: `style`, `className`, `onMouseDown`, `onMouseUp`, `onTouchEnd`
3. Include `{children}` to render the resize handle

### Resize Handles

- Default: `['se']` (southeast/bottom-right corner)
- Can use any combination: `'s'`, `'w'`, `'e'`, `'n'`, `'sw'`, `'nw'`, `'se'`, `'ne'`
- Changing `resizeHandles` dynamically doesn't work due to react-resizable limitation
- Custom resize handles must have class `.react-resizable-handle`

### Common Pitfalls

- **Forgetting unique keys**: Each grid item needs a unique `key` prop that matches the `i` in the layout
- **Layout/children mismatch**: Number of layout items must match number of children
- **Missing width**: ReactGridLayout requires a `width` prop (use WidthProvider HOC to auto-calculate)
- **Incomplete layout items**: All items must have `x`, `y`, `w`, `h` (missing any will throw error)
- **Margin confusion**: Item size includes margins between items, not just grid units

### Flow Type Checking

- All source files use Flow annotations
- Run `make lint` or `npm run flow` to type check
- Flow version is pinned to 0.172.0 in package.json
- Type definitions exported for library consumers

### Build Process

1. `babel` transpiles `lib/` to `build/` (preserves Flow comments)
2. `webpack` bundles into `dist/react-grid-layout.min.js` (UMD format)
3. npm publishes both `build/` (main entry) and `dist/` (browser)

## Bug Reporting

Users should reproduce bugs in CodeSandbox: https://codesandbox.io/s/staging-bush-3lvt7?file=/src/ShowcaseLayout.js
