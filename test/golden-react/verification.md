# Verification evidence

Measured on `test/golden-react`, based on `1468c0fc`, on 2026-10-31. Production
source and `test/golden/` have no changes. No dependencies were installed and
nothing was pushed.

| Check                            | Result                                                                     |
| -------------------------------- | -------------------------------------------------------------------------- |
| Baseline full suite              | 27 suites, 617 passed, 8 skipped; 5.341 s                                  |
| Expanded full suite              | 31 suites, 746 passed, 8 skipped; 4.830 s                                  |
| Golden suite                     | 129 tests: 128 characterization cases plus the serialization contract      |
| Corpus                           | 48 scenario IDs, 158 selected scenario/variant artifacts, 3,062,376 bytes  |
| Two consecutive ordinary replays | 129 passed each; 2.468 s and 1.943 s; no golden diffs                      |
| Lint / typecheck                 | passed; lint reports existing warnings                                     |
| Format                           | `corepack yarn fmt` applied; trace JSON excluded to keep one step per line |

One full run while lint was competing for CPU failed the existing wall-clock
assertion at `test/spec/fast-horizontal-compactor-test.js:311`. The following
full run without competing checks passed. No timing assertions were edited or
excluded. `benchmark-test.js` passed in these runs.

## Mutation

Temporarily replaced `setLayout(compactor.compact(newLayout, cols))` with
`setLayout(newLayout)` in `GridLayout.tsx:587`, inside `onDrag`. An ordinary golden
run failed 44 tests across the interaction, lifecycle, and differential suites
(85 passed). The diff named the golden file, event index, and event type, then
showed changed callback item flags, positions, styles, or commit counts.

For example, `drag-directions.vertical.trace.json`, step 4 (`mouseup`), detected
`moved: false` changing to `true`. Horizontal cases also detected changed item
transforms. Restored the source with `git checkout --
src/react/components/GridLayout.tsx` and verified that `git diff -- src` is empty.

## Coverage

Both measurements use the full suite's Istanbul report with the same source
instrumentation. Percentages below are before → after. Function coverage was
already 100% for the three components; the hook remains at 73.68%.

| Source                     | Statements    | Branches      | Lines         |
| -------------------------- | ------------- | ------------- | ------------- |
| `GridLayout.tsx`           | 94.02 → 94.52 | 82.23 → 84.16 | 98.61 → 98.89 |
| `GridItem.tsx`             | 90.39 → 90.82 | 81.75 → 83.10 | 98.98 → 98.98 |
| `ResponsiveGridLayout.tsx` | 89.65 → 95.68 | 77.63 → 78.94 | 90.26 → 96.46 |
| `useGridLayout.ts`         | 73.95 → 75.00 | 64.51 → 67.74 | 79.06 → 79.06 |

## Differential results

Fourteen scripts compare the component and the hook, with StrictMode on/off.
All fourteen have disagreements. Five compaction/collision variants exercise the
same drag, southeast-resize, and north-resize pointer events. The other scripts
update controlled layout during a drag or change cols and compactor props.

| Observable difference           | Evidence                                                                                                               |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Layout-change timing and counts | all fourteen summaries differ; the hook notifies during moves                                                          |
| Placeholder                     | all gesture and controlled-drag summaries differ; hook resize placeholder/anchor work belongs to the consumer assembly |
| Rendered items                  | cols and controlled updates differ; four of five gesture variants differ                                               |
| Container height                | controlled updates, cols changes, overlap and collision-prevention gestures differ                                     |

StrictMode preserves the difference categories in these scripts. Both complete
side traces remain committed, along with fourteen compact `disagreements`
summaries. The finite inline-layout probe compares convergence of GridLayout with
the hook's render-cap bailout.

## Limits

This is a jsdom characterization corpus. It does not establish browser layout or
CSS-paint fidelity. The hook adapter's resize limitations are documented in the
summary metadata and README. The newly confirmed dependency behavior is native
`touchcancel` leaving a drag active; its named trace pins that result.

Jev Review could not run because `JEV_API_KEY` was unset. The harness was reviewed
locally, and executable verification above completed.
