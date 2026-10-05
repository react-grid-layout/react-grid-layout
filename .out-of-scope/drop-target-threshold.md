# Drop Target Threshold

The library does not expose a configurable "how much of a cell is covered" threshold for showing the drop placeholder. The placeholder snaps to grid cells and follows the pointer.

## Why this is out of scope

There is no per-cell coverage ratio in the drop math. `calcXY` / `calcGridColWidth` (`src/core/calculate.ts`) and `handleDragOver` (`GridLayout.tsx`) round the pointer to grid cells; the placeholder appears at whatever cell the pointer is over. A "lazy drop" - only accept when the pointer is deep in a cell - is consumer behavior, and it's available today:

- Return `false` from `onDropDragOver` (v2: `dropConfig.onDragOver`) until your own pointer-in-cell test passes.
- Render your own preview while waiting.

Building a threshold into the core would add a tuning knob the project can't justify for one reported use case.

## Prior requests

- #1998 - "Looking for placeholder appears ratio setting"
