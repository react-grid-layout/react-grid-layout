# Resize Neighbors

The core library does not shrink adjacent items when one item is resized. Resize only changes the target item's w/h and pushes colliders down/right; neighbors are never compensated.

## Why this is out of scope

Keeping the total row width fixed on resize is a layout policy, and the project deliberately keeps policies out of the core. The extension points exist and are public:

- The `Compactor` interface (`src/core/compactors.ts`) - a custom compactor can reflow neighbors after a resize.
- `onResize` / `onResizeStop` callbacks - the thread's snippet mutating layout to compensate is the working consumer-side version. The v2 RFC keeps these callbacks immutable, so the fix is to build a new array and return it through `setLayout`, not mutate in place.

A resize that shrinks the neighbor instead of pushing it also has to answer UX questions the core doesn't want to own: which neighbor shrinks (the one above, below, adjacent?), by how much, and what happens at min sizes.

## Prior requests

- #1964 - "Resize neighbors instead of pushing them"
