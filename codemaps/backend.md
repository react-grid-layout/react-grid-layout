# Core Module Codemap

> Generated: 2026-08-05 | Token-lean format for LLM context

## src/core/ — Pure TypeScript, no React

### types.ts
All type definitions.

| Type | Purpose |
|---|---|
| `LayoutItem` | {i, x, y, w, h, minW?, maxW?, minH?, maxH?, static?, isDraggable?, isResizable?, isBounded?, constraints?} |
| `Layout` | `readonly LayoutItem[]` |
| `CompactType` | `"horizontal" | "vertical" | "wrap" | null` |
| `Compactor` | {type, allowOverlap, preventCollision?, compact(layout, cols)} |
| `PositionStrategy` | {type, scale, calcStyle(), calcDragPosition?()} |
| `LayoutConstraint` | {name, constrainPosition?(), constrainSize?()} |

**Config defaults:**

| Config | Defaults |
|---|---|
| `GridConfig` | cols=12, rowHeight=150, margin=[10,10], containerPadding=null, maxRows=Infinity |
| `DragConfig` | enabled=true, bounded=false, threshold=3, allowMobileScroll? |
| `ResizeConfig` | enabled=true, handles=["se"], handleComponent? |
| `DropConfig` | enabled=false, defaultItem={w:1,h:1}, onDragOver?, touchEnabled=true, touchDragSource=`[data-rgl-draggable]` |

### layout.ts
- `bottom`, `getLayoutItem`, `getStatics` — lookups
- `cloneLayout`, `cloneLayoutItem`, `modifyLayout`, `withLayoutItem` — cloning + transform
- `moveElement(layout, item, x, y, ...)` — core movement with collision resolution
- `moveElementAwayFromCollision(...)` — wrap treated as horizontal push; free-form swap tight (no gap)
- `correctBounds(layout, {cols})` — clamps x; clamps y:Infinity to layout bottom
- `assertLayoutStructure` — required properties check (throws); `validateLayout` is its deprecated alias (RGL_W013)

### collision.ts
- `collides(l1, l2)`, `getFirstCollision`, `getAllCollisions`

### sort.ts
- `sortLayoutItems(layout, compactType)` — route to row/col/wrap sort
- `sortLayoutItemsByRowCol` (vertical/wrap), `sortLayoutItemsByColRow` (horizontal)

### compactors.ts
Six built-in implementations of `Compactor`:

| Name | Behavior |
|---|---|
| `verticalCompactor` | items float upward (default) |
| `horizontalCompactor` | items float leftward |
| `noCompactor` | free-form, no repositioning |
| `verticalOverlapCompactor` | vertical with allowOverlap |
| `horizontalOverlapCompactor` | horizontal with allowOverlap |
| `noOverlapCompactor` | free-form with allowOverlap |

- `getCompactor(compactType)` — lookup by type string
- `compactItemVertical`, `compactItemHorizontal` — per-item compact
- `resolveCompactionCollision` — recursive collision resolution
- Implementation: `compaction/classic.ts` (both axes); `compaction/cellIndex.ts` holds the spatial indexes it uses on integer layouts with unique ids (output identical to the plain scans)

### dev.ts (internal, not exported)
Coded warnings; codes documented in `docs/warnings.md`.
- `devWarn(scope, code, message)` — once per scope+code, development only; `null` scope warns every call
- `reportOnce(scope, code, message)` — console.error once per scope+code, production too (3.0 strategy errors)
- `isDevelopment()` — reads the literal `process.env.NODE_ENV` in try/catch

### validation.ts
- `validateLayoutInput` — intake bounds; RGL_W002 on clamp, RGL_W007 on duplicate ids (per call, dev)

### calculate.ts
Grid unit <-> pixel conversions.
- `calcGridColWidth`, `calcGridItemWHPx`, `calcGridItemPosition`
- `calcXY` (pixels->grid, clamped), `calcWH` (pixel dims->grid)
- `calcXYRaw`, `calcWHRaw` — raw unchecked conversions
- `calcGridCellDimensions`

### position.ts
CSS positioning and resize direction math.
- `transformStrategy` (CSS transforms, default), `absoluteStrategy` (top/left)
- `createScaledStrategy(scale)` — transforms with scale factor
- `setTransform`, `setTopLeft` — generate CSS
- `resizeItemInDirection` — north/south/east/west/8-way handle math
  - `resizeNorth` anchors bottom edge (top = currentSize.top - delta_h)

### constraints.ts
Pluggable constraint chain.
- `gridBounds` — stay within 0..cols, 0..maxRows (constrainPosition + constrainSize)
- `minMaxSize` — per-item minW/maxW/minH/maxH
- `containerBounds` — constrain to visible container (NOW also constrainSize, clamps h/w)
- `boundedX`, `boundedY` — single-axis constraints
- `aspectRatio(ratio)`, `snapToGrid`, `minSize`, `maxSize` — factories
- `defaultConstraints` = [gridBounds, minMaxSize]
- `applyPositionConstraints`, `applySizeConstraints` — apply chain

### responsive.ts
- `sortBreakpoints`, `getBreakpointFromWidth`, `getColsFromBreakpoint`
- `findOrGenerateResponsiveLayout` — find or generate layout for a breakpoint

## src/extras/ — Optional Utilities

| Name | Export |
|---|---|
| `fastVerticalCompactor` | O(n log n) vertical compaction |
| `fastHorizontalCompactor` | O(n log n) horizontal compaction |
| `wrapCompactor` | LTR paragraph-wrap compaction |
| `GridBackground` | Visual grid background component |
