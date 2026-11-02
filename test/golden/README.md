# Core golden masters

These files pin shipped core and extras behavior before refactoring, including
bugs, array order, input mutation, and reference sharing. Every call stores its
arguments before and after execution plus its return value (or error).

Run and regenerate through Jest so `test/util/setupTests.js` installs the same
stable sort used by the normal suite:

```sh
corepack yarn jest --runInBand --testPathPatterns /test/golden/
corepack yarn golden:update
# Equivalent update target:
make golden-update
```

The normal `corepack yarn test` includes this corpus. A missing file fails unless
`GOLDEN_UPDATE=1` is set. Updates overwrite expected files; review the diff before
committing. **Every PR containing a golden diff must explain in its body whether
each behavior change is intentional or a regression.** Never regenerate merely
to make a failing refactor pass.

`rng.ts` uses independently seeded mulberry32 streams. Families include boundary
geometry and permutations; `harness/seeds` pins generator output separately.
The serializer sorts object keys, preserves array order, and writes each layout
item on one line. Explicit sentinels preserve undefined keys (`$u: 1`), array
holes (`$hole`), nonfinite numbers and negative zero (`$number`). Functions use
`$function` names; reference facts separately pin nested sharing. Prettier skips
the generated files to retain this layout.

Cases with a known defect contain `"knownBug": "<id>: <description>"`. Independent
invariants still check ordinary cases. Add a new ID and a minimal reproducer when
an invariant reveals a defect; do not repair production code in this corpus.
The audit labels these B1–B16; letter IDs map as follows:

| IDs                     | Behavior                                                        |
| ----------------------- | --------------------------------------------------------------- |
| a / B1, b / B2          | Stale moved flag; mutated drag baseline                         |
| c / B3                  | Fast vertical nonfinite, bounds, fractions, order, static flags |
| d / B4                  | Fast horizontal invalid rows, oversized items, overlap mode     |
| e / B5                  | Wrap footprint overlap and infinite static-cell iteration       |
| f / B6, g / B7          | Free-form swap overlap; north/east resize snapping              |
| h / B8, i / B9, j / B10 | Bounds correction order and width expansion                     |
| k / B11, l / B12        | Zero calculated size; aspect ratio ignores height               |
| m / B13, n / B14        | Wrap factory fallback; duplicate IDs                            |
| o / B15                 | Suspected horizontal resolver early break, with a control       |
| p / B16                 | Detached dragged item identity                                  |

Additional IDs: `q` pins repeated-reference output holes; `q-move` pins horizontal
push overflow; `q-move-static` pins static movement in a free-form swap; `r` pins
zero-scale drag arithmetic.

The wrap infinite-height probe interrupts static-cell insertion after a fixed
budget and records that interruption. It pins failure to finish within that
budget rather than attempting an infinite execution. Generated movement and compaction exclude NaN geometry because collision-resolution
loops can fail to terminate. Direct collision and validation probes remain bounded.

Fast/classic differential cases pin both outputs, including disagreements.
Equality checks apply only to named cases that agree on this baseline. A changed
ordering or input mutation is observable even when final geometry agrees.

The original timing assertions and their snapshots are opt-in:

```sh
corepack yarn bench
```

They are excluded from the default suite and do not gate CI. Their thresholds
can still fail under load.
