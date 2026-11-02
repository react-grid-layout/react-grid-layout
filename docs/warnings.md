# Warning codes

React-Grid-Layout tags each warning with a code. A runtime message ends with
its code in parentheses, for example
`ReactGridLayout: layout input was clamped to grid bounds. (RGL_W002)`, so you
can search for it here.

Runtime warnings are development only. They go to `console.warn` and are
silent when `process.env.NODE_ENV` is `"production"`. A deprecation warning
fires once per grid (or per `GridItem`), not on every render. The intake
warnings `RGL_W002` and `RGL_W007` fire once per validation call.

One warning has no code yet: `fastHorizontalCompactor` warns when an item
cannot fit under its row limit. It prints in production too, as it did before
2.4.

Some codes are JSDoc only. They mark a deprecated export in your editor and in
lint output, and never print, because the function can run in a hot loop.

2.4 removes nothing. Every deprecated API keeps working through 2.4.x and is
removed in 3.0.

## Codes in 2.4

| Code       | Delivery               | Meaning                                                                                    |
| ---------- | ---------------------- | ------------------------------------------------------------------------------------------ |
| `RGL_W002` | Runtime, once per call | A layout value or limit was out of bounds and was normalized at intake.                    |
| `RGL_W007` | Runtime, once per call | Two or more layout items share an `i`.                                                     |
| `RGL_W008` | JSDoc                  | The compaction type string form of the compactor argument is deprecated.                   |
| `RGL_W009` | Runtime, once per item | A direct `GridItem` caller passed `useCSSTransforms` or `usePercentages` with no strategy. |
| `RGL_W010` | Runtime, once per grid | Legacy `verticalCompact={false}`.                                                          |
| `RGL_W013` | JSDoc                  | `validateLayout` is deprecated; use `assertLayoutStructure`.                               |
| `RGL_W014` | Runtime, once per grid | `onDropDragOver` on the modern entry; use `dropConfig.onDragOver`.                         |
| `RGL_W015` | Runtime, once per grid | A `data-grid` child prop on the modern entry; pass `layout` or `layouts`.                  |
| `RGL_W016` | JSDoc                  | The five named overlap compactor variants are deprecated.                                  |
| `RGL_W017` | Runtime, once per grid | `droppingItem` on the modern entry; use `dropConfig.defaultItem`.                          |
| `RGL_W018` | Runtime, once per grid | A droppable grid has an item whose id equals the dropping item's id.                       |

### RGL_W002: layout input clamped

A layout reached the grid with a value outside its bounds, such as `x: -5`,
`w: 0`, `h: NaN` or `y: 1e9`. The grid normalized it and rendered the result;
your input object is not changed. Fix the saved or computed layout. The bounds
are in the README under "Bounds for saved layouts".

Every intake path validates: the `layout` prop, `data-grid` children, stored
`ResponsiveGridLayout` layouts, the `useGridLayout` and `useResponsiveLayout`
hooks, and external drop items. Calling `validateLayoutInput` yourself warns on
each call that changes the layout.

### RGL_W007: duplicate item ids

Two items in one layout share an `i`. Collision checks treat items with the
same id as one item, so both can end up in the same cell. The layout is kept
as is. Give each item a unique `i` that matches its child's `key`.

### RGL_W008: compaction type strings

`findOrGenerateResponsiveLayout` accepts a compaction type string such as
`"vertical"` as its compactor argument. That form is deprecated: pass a
compactor object such as `verticalCompactor`. The notice is on that parameter's
JSDoc; the function itself is not deprecated, because object calls stay. The
public `getCompactor` factory belongs to the same group. The `/legacy` entry's
own use of these is private and never warns. Both are removed in 3.0.

### RGL_W009: GridItem position flags

`useCSSTransforms` and `usePercentages` on a `GridItem` you render yourself are
deprecated, and the `GridItem` export is removed in 3.0. The flags only apply
when no `positionStrategy` with `calcStyle` is passed; a strategy takes
precedence over both. Grids built by `GridLayout` never warn.

- Transforms: pass `positionStrategy={transformStrategy}`.
- Pixel `top`/`left`: pass `positionStrategy={absoluteStrategy}`.
- `useCSSTransforms={false}` with `usePercentages`: build a strategy from
  `absoluteStrategy` whose `calcStyle(pos)` returns its pixel style with
  `left: 100 * pos.left / containerWidth + "%"` and
  `width: 100 * pos.width / containerWidth + "%"`. Keep `top` and `height` in
  pixels.

```ts
import {
  absoluteStrategy,
  type PositionStrategy
} from "react-grid-layout/core";

// Pass the GridItem's current containerWidth.
const percentStrategy = (containerWidth: number): PositionStrategy => ({
  ...absoluteStrategy,
  calcStyle: pos => ({
    ...absoluteStrategy.calcStyle(pos),
    left: `${(100 * pos.left) / containerWidth}%`,
    width: `${(100 * pos.width) / containerWidth}%`
  })
});
```

### RGL_W010: verticalCompact

`verticalCompact={false}` on the legacy `ReactGridLayout` or
`ResponsiveReactGridLayout` is deprecated. Use `compactType={null}`. The
message names the component.

### RGL_W013: validateLayout

`validateLayout` is renamed `assertLayoutStructure`, exported from
`react-grid-layout/core` and the root. It has the same checks and messages:
the input must be an array, each item needs numeric non-NaN `x`, `y`, `w` and
`h`, and a present `i` must be a string. It throws, returns nothing and never
changes the input. `validateLayout` stays as an alias through 2.4.x.

Do not swap it for `validateLayoutInput`. That function repairs out-of-bounds
geometry instead of rejecting it, so code that relied on the rejection would
silently accept bad data. It also expects every item to be an object; it is
not a structural check.

### RGL_W014: onDropDragOver

Move the handler to `dropConfig.onDragOver`. It returns the same values but
receives the native `DragEvent`, so read `e` where you read `e.nativeEvent`.
The `/legacy` entry keeps `onDropDragOver` and never warns.

### RGL_W015: data-grid

On the modern `GridLayout` and `ResponsiveGridLayout`, pass an explicit
`layout` (or `layouts`) instead of `data-grid` on each child. The `/legacy`
entry keeps `data-grid` and never warns.

### RGL_W016: overlap compactor variants

These exports are removed in 3.0. `noOverlapCompactor` stays. 2.4 keeps each
variant's behavior.

| Export                           | Package  | Migration                                                         |
| -------------------------------- | -------- | ----------------------------------------------------------------- |
| `verticalOverlapCompactor`       | `core`   | `noOverlapCompactor`; positions are kept, as now.                 |
| `horizontalOverlapCompactor`     | `core`   | `noOverlapCompactor`; positions are kept, as now.                 |
| `wrapOverlapCompactor`           | `extras` | `noOverlapCompactor` from `core`; positions are kept, as now.     |
| `fastVerticalOverlapCompactor`   | `extras` | By hand. It closes gaps upward; `noOverlapCompactor` does not.    |
| `fastHorizontalOverlapCompactor` | `extras` | By hand. It packs and wraps items; `noOverlapCompactor` does not. |

In a `ResponsiveGridLayout`, a breakpoint generated at mount is compacted by
the compactor's `type`. The core vertical and horizontal variants have type
`"vertical"` and `"horizontal"`, so that generated layout is compacted;
`noOverlapCompactor` has type `null` and leaves it as is.

For the two fast variants, keep the arrangement in your own code before passing
the layout to `noOverlapCompactor`, or accept the new positions.
`{ ...compactor, allowOverlap: true }` does not keep either algorithm.

### RGL_W017: droppingItem

Use `dropConfig.defaultItem`. Since 2.4 it accepts an optional `i` and any
other layout field (`minW`, `isResizable` and so on) next to the required `w`
and `h`, so
`dropConfig={{ enabled: true, defaultItem: { i: "new", w: 2, h: 2 } }}` covers
everything `droppingItem` did. 3.0 renames it `dropConfig.item`. The `/legacy`
entry keeps `droppingItem` and never warns.

The id works as `droppingItem.i` always has: it names the placeholder while a
drag is over the grid, and the grid removes any layout item with that id when
a drag enters or leaves. In `onDrop`, give the new item its own id rather than
keeping `i`, or the next drop replaces it. `RGL_W018` warns when that happens.

### RGL_W018: an item uses the dropping id

A droppable grid has a child whose key equals the dropping item's id
(`dropConfig.defaultItem.i`, `droppingItem.i`, or the default
`"__dropping-elem__"`). The grid removes every layout item with that id when an
external drag enters or leaves it, so this item would disappear on the next
drag. This usually means `onDrop` kept the dropped item's id. Give the new item
its own id there, or set `dropConfig.defaultItem.i` to an id no item uses.
Legacy grids warn too, because the removal happens there as well.

## Announced for 3.0, no code

`moveElement`, `moveElementAwayFromCollision`, `compactItemVertical`,
`compactItemHorizontal`, `resolveCompactionCollision` and the `GridItem`
export carry a JSDoc `@deprecated` notice. They have no replacement in 2.4. The
notice announces their removal in 3.0; the 3.0 migration guide covers each one.
They keep working through 2.4.x.

## Reserved for 3.0

These codes are assigned and documented ahead of time. Nothing in 2.4 emits
them.

| Code       | Meaning                                                                                                                          |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `RGL_W003` | A pending layout or config change applied after an interaction changed geometry, `cols`, `maxRows` or the compactor.             |
| `RGL_W005` | A strategy returned an invalid result, or middleware edited a field it may not; the step is ignored. Reported in production too. |
| `RGL_W006` | `dragConfig.threshold` and `dragConfig.activation` are both set.                                                                 |
| `RGL_W011` | `propose`, `stop` or `cancel` for an interaction that is not active; ignored.                                                    |
| `RGL_W012` | `onProposal` returned an edit at a drag or resize start; ignored, only `false` counts there.                                     |

`RGL_W001` and `RGL_W004` are unassigned. Non-finite values are reported by
`RGL_W002`.
