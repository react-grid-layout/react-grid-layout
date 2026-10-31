# React interaction golden traces

These traces freeze the React behavior at `1468c0fc` before RFC 0003 replaces the
React layer's state machinery. Existing bugs are part of the baseline. PR 2304's
sub-cell drag and resize preview is fixed on this base and has an ordinary
regression scenario.

```text
native mouse / touch / HTML5 event
                  │
                  ▼
real react-draggable / react-resizable / external-drop adapter
                  │
                  ├── callbacks, copied immediately
                  └── act() settles → DOM frame + Profiler commit counts
                                           │
                                           ▼
                            __golden__/*.trace.json
```

## Run and regenerate

Run the traces from the repository root:

```sh
corepack yarn jest --testPathPatterns=test/golden --runInBand
corepack yarn golden:update
```

The normal `corepack yarn test` command includes these tests. Only
`GOLDEN_UPDATE=1` writes goldens; missing files fail an ordinary run. The update
command also covers the sibling core corpus when that branch lands.

Every golden diff must be explained in its PR. Identify the input event and the
changed callback, geometry, or render behavior. Explain whether the change is an
intentional bug fix or an accidental difference from the baseline. Review the
diff before committing regenerated files.

## Files and format

```text
golden-react/
├── geometry.ts        live style → item and resize-handle geometry
├── pointer.ts         one act() per native mouse/touch event
├── drop.ts            HTML5 fireEvent and document touch-drop adapters
├── recorder.ts        ordered callbacks, DOM frames, Profiler instrumentation
├── serialize.ts       canonical keys; explicit undefined, NaN and ±Infinity
├── expectGolden.ts    explicit update; nested Jest diffs on ordinary runs
├── fixture.tsx        stable v2/legacy and Responsive fixtures
├── hookHarness.tsx    public useGridLayout + real GridItem consumer assembly
├── scenarios/         interaction, lifecycle, differential, tooling cases
└── __golden__/        one complete step per line in valid JSON
```

Each file contains `metadata` and `steps`. A step records its input, every
callback in order, item styles and classes, handle identities, the placeholder,
dropping state, container height, and cumulative Profiler counts. Callback
arguments retain complete layout items, including absent optional values as
`{"$undefined":true}`. Non-finite numbers use `{"$number":"NaN"}` or the
corresponding Infinity string. Events retain only their type; nodes use stable
item/handle IDs. Copying arguments at callback time preserves their values even
when later movement mutates the original objects.

`renders` counts committed item subtrees through `Profiler.onRender`, including
local interaction state. `grid` includes commits caused by descendants. These
counts exclude timings and speculative StrictMode render invocations. The
test-only wrapper retains the real GridItem and its memo comparator; the drag
and resize dependencies are never mocked.

Geometry comes from the rendered inline transform or top/left, dimensions,
container offset, scroll, and scale. Handles move with their item. Stubs restore
their original descriptors. The project setup uses synchronous rAF; only the
unmount-leak probe replaces it with a bounded queue, identifies the existing
edge-scroll frame, and clears the queue after inspection. The traces characterize
jsdom with these stubs. Browser layout, rotated handle bounding boxes, and CSS
painting need separate browser tests.

## Scenario matrix

The matrix crosses variants where they affect the behavior, rather than creating
a full Cartesian product.

| Group             | Variants and inputs                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| Drag              | four directions, chain pushes, static obstacles, net-zero, threshold, bounded edges                |
| Position          | transform, absolute, scale 0.5; offset and scrolled containers                                     |
| Compaction        | vertical, horizontal, none, wrap, preventCollision, allowOverlap                                   |
| Resize            | all eight handles, sub-cell motion, north anchoring, past-edge, min/max                            |
| External drop     | hover/commit, leave, reject, size/offset overrides, touch leave/cancel/commit                      |
| Lifecycle         | controlled updates during/between drags, uncontrolled data-grid, child changes/removal during drag |
| Responsive        | within/across breakpoints, mid-drag width changes, generated data-grid layouts, compactor swaps    |
| API               | v2, equivalent legacy flat props, legacy Responsive, StrictMode on/off                             |
| Hook differential | identical pointer scripts, five compaction/collision modes, controlled props, cols changes         |

The hook traces record its public state and `onLayoutChange`. Its consumer
assembly logs native GridItem callbacks as notes because the hook does not expose
GridLayout's six lifecycle callback props. The hook supplies dimensions but no
resize-handle geometry or resize placeholder. `*-disagreements.trace.json` files
list differing item/placeholder/height fields and layout-change counts; the two
side traces contain the full values. Differences caused by that assembly are
identified in the summary metadata.

## Known bugs

The `metadata.knownBug` string names the bug and describes the observed behavior.
Changing a known-bug golden requires the same explanation as any other diff.

| ID                             | Pinned behavior                                               |
| ------------------------------ | ------------------------------------------------------------- |
| `memo-ignored-props`           | handles, static class, and drag-start closure stay stale      |
| `double-layout-change`         | changed stops and Responsive compactor swaps notify twice     |
| `net-zero-layout-change`       | returning to the start cell still notifies twice              |
| `north-overlap-snap`           | north growth overlaps above, then snaps on stop               |
| `touch-mouse-coordinates`      | touch skips threshold; scaled touch produces NaN              |
| `cols-no-resync`               | shrinking nonresponsive cols leaves an item beyond the edge   |
| `hook-inline-layout-loop`      | inline layout never converges; a finite render cap catches it |
| `edge-scroll-unmount-leak`     | the active edge-scroll frame survives unmount                 |
| `dropping-no-stop`             | dropping item emits drag start/move without stop              |
| `legacy-responsive-threshold`  | legacy Responsive retains the v2 threshold                    |
| `legacy-responsive-bounds`     | legacy Responsive omits container resize constraints          |
| `legacy-bounded-resize`        | resize measures the handle's parent item height               |
| `data-grid-key-only-sync`      | edits to existing data-grid children are ignored              |
| `threshold-deltas`             | pending drag changes class and loses small deltas             |
| `touch-drop-ignores-overrides` | touch drop bypasses desktop size/offset callbacks             |
| `touch-cancel-no-stop`         | native touchcancel leaves the internal drag active            |

The last bug was confirmed while building this corpus. The infinite-loop probe
throws a sentinel after a finite render cap and catches it in an ErrorBoundary;
the audit's unbounded `U` probe is never executed.

See [verification.md](verification.md) for coverage, repeatability, and mutation
evidence. The serializer and writer intentionally live here, apart from
`test/golden/`, until the two branches can share their tooling.
