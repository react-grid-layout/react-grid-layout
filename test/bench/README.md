# Deterministic operation budgets

Run `corepack yarn bench:ops` to compare operation counts with the committed
[baseline.json](baseline.json). `corepack yarn test` runs this gate after the
regular coverage suite. A decrease passes; any increase, missing scenario, or
missing counter fails with the scenario, counter, old/new values, and delta.
Wall-clock measurements stay in the opt-in `corepack yarn bench` suite.

```text
seed 42 → prepare corpus / mount / start interaction (uncounted)
        → measure synchronous operation + React commits
        → restore instrumentation → compare every counter to baseline
```

## Scenarios

Every scenario runs at 50, 500, and 2000 items with 12 columns. Preparation and
cleanup are excluded. Children and consumer callbacks stay stable. Mouse moves
are separate React `act` boundaries through Testing Library's `fireEvent`.

| Scenario                 | Measured operation                                                   |
| ------------------------ | -------------------------------------------------------------------- |
| `move/mixed`             | Audit `moveElement` only: item 0 to x=3, middle row                  |
| `drag/mixed`             | Same move followed by vertical compaction, as in `GridLayout.onDrag` |
| `compact/mixed`          | One vertical compaction of pre-compacted input                       |
| `drag-10/packed`         | Ten 100px horizontal moves through bounded v2 GridLayout             |
| `drag-subcell-10/packed` | Ten 1px moves, all within the initial cell (T7)                      |
| `resize/sparse`          | One southeast resize mousemove through v2 GridLayout                 |
| `parent-rerender/packed` | One identical legacy parent rerender (T8)                            |

`mixed` reproduces `count.cjs`: golden `mulberry32(42)`, widths/heights 1–3,
row jitter 0–1, `correctBounds`, then vertical compaction. IDs come from the
golden `packed` generator. The other fixtures use golden `packed` and `sparse`
families directly. jsdom uses a fixed 1200px positioned parent and 100000px
height; no pointer reaches an edge-scroll threshold. The shared
`test/util/setupTests.js` timsort patch is preserved.

## Counters

| Counter                                                                     | Scope                                                                            |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `sort`, `filter`, `indexOf`, `findIndex`                                    | Calls on nonempty layout arrays, identified by the first item's i/x/y/w/h fields |
| `collides`, `getFirstCollision`, `cloneLayoutItem`, `getStatics`            | All function entries, including lexical calls inside the defining module         |
| `compact`                                                                   | `verticalCompactor.compact` invocations                                          |
| `getBoundingClientRect`, `offsetParent`, `clientHeight`, `getComputedStyle` | DOM reads during the measured operation, including dependencies                  |
| `gridLayoutRenders`                                                         | GridLayout function entries                                                      |
| `gridItemRenders`, `idleItemRenders`, `placeholderRenders`                  | GridItem function entries, split by role                                         |
| `gridItemCommits`, `gridItemMaxCommits`                                     | Sum and maximum of per-item Profiler commits                                     |
| `idleItemCommits`, `placeholderCommits`                                     | Commits of items other than item 0; placeholder commits counted separately       |

[instrument.cjs](instrument.cjs) adds entry probes during Babel transformation
only in [jest.ops.cjs](../jest.ops.cjs). Export spies miss lexical calls such
as `cloneLayout` calling `cloneLayoutItem` and `getFirstCollision` calling
`collides`. No source file is rewritten. Calibration checks that each probe is
live; an independent transform fixture verifies lexical calls. Jest caching is
disabled here so edits to the probe plugin always take effect.
Array and DOM wrappers are restored in `finally`, including on exceptions.

The GridItem mock retains its original memo comparator and puts a Profiler
inside that boundary. These count committed subtree updates, including
dependency state updates, rather than speculative renders. The dragged item,
each idle item's ID, and the placeholder are tracked separately during a run;
the baseline stores aggregates to keep diffs small. `gridItemMaxCommits` is the
maximum per real item, excluding the placeholder. Profiler durations are ignored.

## Audit comparison and RFC targets

The immutable `audit` section records the RFC 0003 §5 quotations from
`rgl-core.md` §3.1 (`count.cjs`) and `rgl-react.md` §2. It is reference data,
not an executable budget. `scenarios` holds the measured budgets.

The audit's 9/180/958 sorts at n=50/500/2000 cover **moveElement alone**;
this suite reproduces all three exactly. `drag/mixed` records 10/181/959,
including the compactor's sort. At n=500, compaction reproduces the audit's
500 indexOf, 495 findIndex, and 496 getStatics calls. At n=2000, the exact
values are 2000/1995/1996; the audit rounded these to about 2000 each.
The audit used bundled Node code
with native sort; this suite uses source modules and the golden timsort patch.
Equal-position ties can therefore change cascade counts. Compare T1/T2 with
`move/mixed`, and T3 with `compact/mixed`'s indexOf/findIndex/getStatics.
The audit included input cloning within its counted operation; this suite
prepares inputs outside it, matching GridLayout's existing layout ownership.

T7 uses `drag-subcell-10` (divide GridLayout renders by ten); T8 uses `parent-rerender`.
Use GridItem function-entry counts when comparing with the audit's zero
sub-cell item renders. This checkout includes commit `1468c0fc` (#2304), which
adds `setInteractionRevision` on every drag/resize move to keep the active
item under the pointer. The harness measures ten active-item renders in ten
sub-cell moves, with zero idle-item renders. The earlier audit's PM probe
counted child renders and observed zero in eight moves before that fix.
Profiler commits also include dependency state updates, so the baseline
records both subtree commits and GridItem function entries.
T9 uses the bounded drag's clientHeight reads per move; T11 uses `resize`'s
rect reads, which also include DraggableCore's positioned-parent read.
T10's browser scroll reads, T12's standalone eight-handle dependency renders,
and T13's background DOM nodes remain audit reference data. They need their
own dependency/background scenarios. This harness does not gate milliseconds
or claim to measure browser reflow cost.

## Updating a budget

1. Run `corepack yarn bench:ops:update` (equivalent to `BENCH_UPDATE=1 corepack yarn bench:ops`).
2. Inspect `git diff -- test/bench/baseline.json`.
3. Run `corepack yarn bench:ops` twice and compare the printed JSON measurements.
4. Commit the baseline with the change that explains it.

**Every count increase needs justification in the PR.** Explain the scenario
and why the added work is required. A baseline update alone is insufficient.
The updater measures and validates all scenarios before atomically replacing
the baseline. It preserves the audit reference section and writes sorted keys,
one scenario per line, without timestamps or timing data.
