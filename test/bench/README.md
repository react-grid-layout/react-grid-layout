# Deterministic operation budgets

Run `corepack yarn bench:ops` to compare measured operations with
[baseline.json](baseline.json). Every scenario and counter must match exactly.
Increases and decreases both fail. Record savings immediately so a later
regression cannot spend an old budget. CI runs this separately from `yarn test`.
Wall-clock benchmarks remain in `corepack yarn bench`.

```text
seed 42 -> prepare inputs / start interaction
        -> measure operation + synchronous React commits
        -> restore wrappers and spies
        -> compare complete scenario and counter key sets, then exact values
```

## Scenarios

The original scenarios retain 50, 500, and 2000 items. New interaction coverage
uses smaller inputs to keep the gate practical; measured mount uses 2000.
All fixtures use 12 columns before a responsive change. Preparation and unmount
are excluded. Each mouse event uses Testing Library's own `act` boundary.

| Scenario                                             | Items       | Measured operation                                                       |
| ---------------------------------------------------- | ----------- | ------------------------------------------------------------------------ |
| `move/mixed`                                         | 50/500/2000 | Move item 0 to x=3, middle row                                           |
| `drag/mixed`                                         | 50/500/2000 | Same move, then vertical compaction                                      |
| `compact/mixed`                                      | 50/500/2000 | Vertical compaction of pre-compacted input                               |
| `drag-10/packed`                                     | 50/500/2000 | Ten bounded 100px horizontal mousemoves                                  |
| `drag-subcell-10/packed`                             | 50/500/2000 | Ten 1px mousemoves within the initial cell                               |
| `resize/sparse`                                      | 50/500/2000 | One southeast resize mousemove                                           |
| `parent-rerender/packed`                             | 50/500/2000 | Identical legacy parent rerender                                         |
| `mount/packed`                                       | 2000        | Render, mount effects, and initial compaction                            |
| `drag-stop/packed`                                   | 50/500      | Mouseup after one prepared drag move                                     |
| `resize-stop/sparse`                                 | 50/500      | Mouseup after one prepared resize move                                   |
| `compact-horizontal`, `compact-none`, `compact-wrap` | 500         | One compaction of scattered statics with height 3                        |
| `compact-fastVertical`, `compact-fastHorizontal`     | 500         | Same input through the fast compactors                                   |
| `breakpoint/packed`                                  | 500         | ResponsiveGridLayout width 1200 -> 600; 12 -> 6 columns                  |
| `drop/packed`                                        | 500         | External desktop drag enter/over and drop, including placeholder cleanup |

`mixed` uses [mulberry32](../golden/rng.ts) with seed 42, widths/heights 1–3,
row jitter 0–1, bounds correction, and initial vertical compaction. Other inputs
come from the [golden generators](../golden/generators.ts). Children and consumer
callbacks stay stable. jsdom geometry uses a 1200px parent and 100000px height;
pointers stay away from scroll edges. The shared
[setupTests.js](../util/setupTests.js) timsort implementation remains installed.
Callback payloads, final geometry, and placeholder removal verify that the
interactions run. The fastVertical fixture also exercises its private `collides`.

## Counters

| Counter                                                                              | Scope                                                                                                      |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `core/...:name`, `extras/...:name`                                                   | Every source function entry, including declarations, expressions, arrows, methods, and anonymous callbacks |
| `file:function:loopN`                                                                | Each entered `for`, `for-in`, `for-of`, `while`, or `do` body in core/extras                               |
| `sort`, `filter`, `indexOf`, `findIndex`, `map`, `some`, `find`, `slice`, `includes` | Array method calls during measurement, including dependencies, empty arrays, primitives, and sparse arrays |
| `arrayIterator`                                                                      | Array iterator acquisitions, including spread and destructuring                                            |
| `collides`, `getFirstCollision`, `cloneLayoutItem`, `getStatics`                     | Compatibility aggregates of the corresponding core entry probes                                            |
| `compact`                                                                            | Total spy calls across exported core/extras compactors                                                     |
| `getBoundingClientRect`, `offsetParent`, `clientHeight`, `getComputedStyle`          | DOM reads, including dependency calls                                                                      |
| `gridLayoutRenders`                                                                  | GridLayout function entries                                                                                |
| `gridItemRenders`, `idleItemRenders`, `placeholderRenders`                           | GridItem entries, split by role                                                                            |
| `gridItemCommits`, `gridItemMaxCommits`                                              | Sum and maximum Profiler commits per real item                                                             |
| `idleItemCommits`, `placeholderCommits`                                              | Commits outside item 0; placeholder commits separately                                                     |

[instrument.cjs](instrument.cjs) derives function and loop keys from the AST.
Named methods include their owner; nested functions include their enclosing
function. Anonymous callbacks and loops use function-scoped ordinals, so comment
and line edits do not churn keys. Adding a loop or callback within a function can
change that function's ordinals. Generic keys are recorded when executed; fixed
aggregate counters also retain zero values. The gate compares both key sets,
so a removed probe or an extra baseline key fails even when its value is zero.

Probes apply only under [jest.ops.cjs](../jest.ops.cjs), with the transform cache
disabled. Production source stays unchanged. Calibration checks lexical calls,
all function/loop forms above, Babel lowering, renamed GridItem parameters, and
restoration after exceptions. Babel-generated helpers receive no entry probes.
The GridItem mock keeps the original memo comparator and puts a Profiler inside
that boundary. Commits include dependency subtree updates. Profiler durations
are ignored. Array and DOM descriptors and compactor spies are restored in
`finally`.

## Scope and limits

These counts cover synchronous work in the listed fixtures. The suite excludes
input preparation, unmount, deferred work, and browser layout/paint. It does not
exercise every compactor option, overlap mode, touch drop, background component,
resize handle, or application layout.

Function entries and loop bodies measure calls and iterations, not CPU cost.
Native array scans and dependency internals are represented by wrapped method
calls; individual native element visits, allocations, property reads, and most
arithmetic are uncounted. Array spread counts iterator acquisition, not elements.
React functions outside the two render probes have no generic entry probes.
A slower operation can therefore retain the same counts. Use browser profiling
and the timing suite for costs outside this gate.

## Update a budget

1. Run `corepack yarn bench:ops:update`.
2. Inspect `git diff -- test/bench/baseline.json`.
3. Run `corepack yarn bench:ops` twice and compare the printed JSON.
4. Commit the baseline with the change that explains it.

Explain increases in the PR. Commit decreases when they occur. Dependency bumps
require regenerating and reviewing the baseline because React, drag/resize
libraries, and test tooling can change measured work. An unchanged measurement
produces no baseline diff.

The updater validates all scenarios before atomically replacing the baseline.
`BENCH_UPDATE=1` is rejected when `CI` is set. JSON uses default lexical ordering,
one scenario per line, without timestamps or timing data.

For a negative control, use a scratch copy and replace the vertical compactor's
cached `maxY` update with `bottom(compareWith)`, or add a `.map().sort()` inside
its per-item loop. The first adds helper entries and loop iterations; the second
adds callback entries and array calls. Each must fail the committed gate. Restore
the scratch source after each run.
