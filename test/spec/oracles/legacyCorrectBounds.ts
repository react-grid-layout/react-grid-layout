// Verbatim correctBounds from origin/master at
// 11390f01a0c921fbee1b9a63eab6efe6fe3f3af7, before PR 2328.
// Only the export name and import paths differ. Must not be edited.
// Delete when correctBounds intentionally changes its finite-input behavior.
import type { LayoutItem, Mutable } from "../../../src/core/types";
import { getFirstCollision } from "../../../src/core/collision";
import { bottom, getStatics } from "../../../src/core/layout";

export function legacyCorrectBounds(
  layout: Mutable<LayoutItem>[],
  bounds: { cols: number }
): LayoutItem[] {
  const collidesWith = getStatics(layout);

  for (let i = 0; i < layout.length; i++) {
    const l = layout[i];
    if (l === undefined) continue;

    // Overflows right
    if (l.x + l.w > bounds.cols) {
      l.x = bounds.cols - l.w;
    }

    // Overflows left
    if (l.x < 0) {
      l.x = 0;
      l.w = bounds.cols;
    }

    // y: Infinity (a common "append to bottom" convention) must not survive
    // into rendering math, or the item renders at the top-left and overlaps.
    // Clamp it to the current bottom of the layout (#2161).
    if (l.y === Infinity) {
      l.y = bottom(collidesWith);
    }

    if (!l.static) {
      collidesWith.push(l);
    } else {
      // Static items that collide with other statics must be moved down
      while (getFirstCollision(collidesWith, l)) {
        l.y++;
      }
    }
  }

  return layout;
}
