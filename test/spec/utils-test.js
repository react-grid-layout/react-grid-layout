// @flow
/* eslint-env jest */

import {
  bottom,
  collides,
  validateLayout,
  moveElement,
  compact,
  sortLayoutItemsByRowCol
} from "../../lib/utils.js";
/*:: import type { Layout } from "../../lib/utils.js"; */
import assert from "power-assert";

/*:: declare function describe(name: string, fn: Function): void; */
/*:: declare function it(name: string, fn: Function): void; */

//
// Utils
//
function stripArray(arr) {
  return arr.map(stripObject);
}

function stripObject(obj) {
  obj = Object.assign({}, obj);
  return Object.keys(obj).reduce((memo, key) => {
    if (obj[key] != null) memo[key] = obj[key];
    return memo;
  }, {});
}

function assertDeepEqualStrip(obj1, obj2) {
  assert.deepEqual(stripArray(obj1), stripArray(obj2));
}
//
// Specs
//

describe("bottom", () => {
  it("Handles an empty layout as input", () => {
    assert(bottom([]) === 0);
  });

  it("Returns the bottom coordinate of the layout", () => {
    assert(
      bottom([
        { i: "1", x: 0, y: 1, w: 1, h: 1 },
        { i: "2", x: 1, y: 2, w: 1, h: 1 }
      ]) === 3
    );
  });
});

describe("sortLayoutItemsByRowCol", () => {
  it("should sort by top to bottom right", () => {
    const layout = [
      { x: 1, y: 1, w: 1, h: 1, i: "2" },
      { x: 1, y: 0, w: 1, h: 1, i: "1" },
      { x: 0, y: 1, w: 2, h: 2, i: "3" }
    ];
    assert.deepEqual(sortLayoutItemsByRowCol(layout), [
      { x: 1, y: 0, w: 1, h: 1, i: "1" },
      { x: 0, y: 1, w: 2, h: 2, i: "3" },
      { x: 1, y: 1, w: 1, h: 1, i: "2" }
    ]);
  });
});

describe("collides", () => {
  it("Returns whether the layout items collide", () => {
    assert(
      collides(
        { i: "1", x: 0, y: 1, w: 1, h: 1 },
        { i: "2", x: 1, y: 2, w: 1, h: 1 }
      ) === false
    );
    assert(
      collides(
        { i: "1", x: 0, y: 1, w: 1, h: 1 },
        { i: "2", x: 0, y: 1, w: 1, h: 1 }
      ) === true
    );
  });
});

describe("validateLayout", () => {
  it("Validates an empty layout", () => {
    validateLayout([]);
  });
  it("Validates a populated layout", () => {
    validateLayout([
      { i: "1", x: 0, y: 1, w: 1, h: 1 },
      { i: "2", x: 1, y: 2, w: 1, h: 1 }
    ]);
  });
  it("Throws errors on invalid input", () => {
    assert.throws(() => {
      // $FlowFixMe: dynamic check
      validateLayout([
        { i: "1", x: 0, y: 1, w: 1, h: 1 },
        { i: "2", x: 1, y: 2, w: 1 }
      ]);
    }, /layout\[1\]\.h must be a number!/i);
  });
});

describe("moveElement", () => {
  it("Does not change layout when colliding on no rearrangement mode", () => {
    const layout = [
      { i: "1", x: 0, y: 1, w: 1, h: 1, moved: false },
      { i: "2", x: 1, y: 2, w: 1, h: 1, moved: false }
    ];
    const layoutItem = layout[0];
    assert.deepEqual(
      moveElement(
        layout,
        layoutItem,
        1,
        2, // x, y
        true,
        true, // isUserAction, preventCollision
        null,
        2
      ),
      [
        { i: "1", x: 0, y: 1, w: 1, h: 1, moved: false },
        { i: "2", x: 1, y: 2, w: 1, h: 1, moved: false }
      ]
    );
  });

  it("Does change layout when colliding in rearrangement mode", () => {
    const layout = [
      { i: "1", x: 0, y: 0, w: 1, h: 1, moved: false },
      { i: "2", x: 1, y: 0, w: 1, h: 1, moved: false }
    ];
    const layoutItem = layout[0];
    assert.deepEqual(
      moveElement(
        layout,
        layoutItem,
        1,
        0, // x, y
        true,
        false, // isUserAction, preventCollision
        "vertical",
        2 // compactType, cols
      ),
      [
        { i: "1", x: 1, y: 0, w: 1, h: 1, moved: true },
        { i: "2", x: 1, y: 1, w: 1, h: 1, moved: true }
      ]
    );
  });

  it("Moves elements out of the way without causing panel jumps when compaction is vertical", () => {
    const layout = [
      { x: 0, y: 0, w: 1, h: 10, moved: false, i: "A" },
      { x: 0, y: 10, w: 1, h: 1, moved: false, i: "B" },
      { x: 0, y: 11, w: 1, h: 1, moved: false, i: "C" }
    ];
    // move A down slightly so it collides with C; can cause C to jump above B.
    // We instead want B to jump above A (it has the room)
    const itemA = layout[0];
    assert.deepEqual(
      moveElement(
        layout,
        itemA,
        0,
        1, // x, y
        true,
        false, // isUserAction, preventCollision
        "vertical",
        10 // compactType, cols
      ),
      [
        { x: 0, y: 1, w: 1, h: 10, moved: true, i: "A" },
        { x: 0, y: 0, w: 1, h: 1, moved: true, i: "B" },
        { x: 0, y: 11, w: 1, h: 1, moved: false, i: "C" }
      ]
    );
  });

  it("Calculates the correct collision when moving large object far", () => {
    const layout = [
      { x: 0, y: 0, w: 1, h: 10, moved: false, i: "A" },
      { x: 0, y: 10, w: 1, h: 1, moved: false, i: "B" },
      { x: 0, y: 11, w: 1, h: 1, moved: false, i: "C" }
    ];
    // Move A down by 2. This should move B above, but since we don't compact in between,
    // C should move below.
    const itemA = layout[0];
    assert.deepEqual(
      moveElement(
        layout,
        itemA,
        0,
        2, // x, y
        true,
        false, // isUserAction, preventCollision
        "vertical",
        10 // compactType, cols
      ),
      [
        { x: 0, y: 2, w: 1, h: 10, moved: true, i: "A" },
        { x: 0, y: 1, w: 1, h: 1, moved: true, i: "B" },
        { x: 0, y: 12, w: 1, h: 1, moved: true, i: "C" }
      ]
    );
  });

  it("Moves elements out of the way without causing panel jumps when compaction is vertical (example case 13)", () => {
    const layout = [
      { x: 0, y: 0, w: 1, h: 1, i: "A" },
      { x: 1, y: 0, w: 1, h: 1, i: "B" },
      { x: 0, y: 1, w: 2, h: 2, i: "C" }
    ];
    // move A over slightly so it collides with B; can cause C to jump above B
    // this test will check that that does not happen
    const itemA = layout[0];
    assert.deepEqual(
      moveElement(
        layout,
        itemA,
        1,
        0, // x, y
        true,
        false, // isUserAction, preventCollision
        "vertical",
        2 // compactType, cols
      ),
      [
        { x: 1, y: 0, w: 1, h: 1, i: "A", moved: true },
        { x: 1, y: 1, w: 1, h: 1, i: "B", moved: true },
        { x: 0, y: 2, w: 2, h: 2, i: "C", moved: true }
      ]
    );
  });

  it("Moves elements out of the way without causing panel jumps when compaction is horizontal", () => {
    const layout = [
      { y: 0, x: 0, h: 1, w: 10, moved: false, i: "A" },
      { y: 0, x: 11, h: 1, w: 1, moved: false, i: "B" },
      { y: 0, x: 12, h: 1, w: 1, moved: false, i: "C" }
    ];
    // move A over slightly so it collides with C; can cause C to jump left of B
    // this test will check that that does not happen
    const itemA = layout[0];
    assert.deepEqual(
      moveElement(
        layout,
        itemA,
        2,
        0, // x, y
        true,
        false, // isUserAction, preventCollision
        "horizontal",
        10 // compactType, cols
      ),
      [
        { y: 0, x: 2, h: 1, w: 10, moved: true, i: "A" },
        { y: 0, x: 1, h: 1, w: 1, moved: true, i: "B" },
        { y: 0, x: 12, h: 1, w: 1, moved: false, i: "C" }
      ]
    );
  });

  it("Moves one element to another should cause moving down panels below when compaction is vertical", () => {
    const layout = [
      { x: 0, y: 0, w: 2, h: 1, i: "A" },
      { x: 2, y: 0, w: 2, h: 1, i: "B" },
      { x: 0, y: 1, w: 1, h: 1, i: "C" },
      { x: 1, y: 1, w: 3, h: 1, i: "D" }
    ];
    // move B left slightly so it collides with A; can cause C to jump above A
    // this test will check that that does not happen
    const itemB = layout[1];
    assert.deepEqual(
      moveElement(
        layout,
        itemB,
        1,
        0, // x, y
        true,
        false, // isUserAction, preventCollision
        "vertical",
        4 // compactType, cols
      ),
      [
        { x: 0, y: 1, w: 2, h: 1, i: "A", moved: true },
        { x: 1, y: 0, w: 2, h: 1, i: "B", moved: true },
        { x: 0, y: 2, w: 1, h: 1, i: "C", moved: true },
        { x: 1, y: 2, w: 3, h: 1, i: "D", moved: true }
      ]
    );
  });
});

describe("compact vertical", () => {
  it("Removes empty vertical space above item", () => {
    const layout = [{ i: "1", x: 0, y: 1, w: 1, h: 1 }];
    assertDeepEqualStrip(compact(layout, "vertical", 10), [
      { i: "1", x: 0, y: 0, w: 1, h: 1, moved: false, static: false }
    ]);
  });

  it("Resolve collision by moving item further down in array", () => {
    const layout = [
      { x: 0, y: 0, w: 1, h: 5, i: "1" },
      { x: 0, y: 1, w: 1, h: 1, i: "2" }
    ];
    assertDeepEqualStrip(compact(layout, "vertical", 10), [
      { x: 0, y: 0, w: 1, h: 5, i: "1", moved: false, static: false },
      { x: 0, y: 5, w: 1, h: 1, i: "2", moved: false, static: false }
    ]);
  });

  it("Handles recursive collision by moving new collisions out of the way before moving item down", () => {
    const layout = [
      { x: 0, y: 0, w: 2, h: 5, i: "1" },
      { x: 0, y: 0, w: 10, h: 1, i: "2" },
      { x: 5, y: 1, w: 1, h: 1, i: "3" },
      { x: 5, y: 2, w: 1, h: 1, i: "4" },
      { x: 5, y: 3, w: 1, h: 1, i: "5", static: true }
    ];

    assertDeepEqualStrip(compact(layout, "vertical", 10), [
      { x: 0, y: 0, w: 2, h: 5, i: "1", moved: false, static: false },
      { x: 0, y: 5, w: 10, h: 1, i: "2", moved: false, static: false },
      { x: 5, y: 6, w: 1, h: 1, i: "3", moved: false, static: false },
      { x: 5, y: 7, w: 1, h: 1, i: "4", moved: false, static: false },
      { x: 5, y: 3, w: 1, h: 1, i: "5", moved: false, static: true }
    ]);
  });

  it("Clones layout items (does not modify input)", () => {
    const layout = [
      { x: 0, y: 0, w: 2, h: 5, i: "1" },
      { x: 0, y: 0, w: 10, h: 1, i: "2" }
    ];
    const out = compact(layout, "vertical", 10);
    layout.forEach(item => {
      assert(!out.includes(item));
    });
  });
});

describe("compact horizontal", () => {
  it("compact horizontal should remove empty horizontal space to left of item", () => {
    const layout = [{ x: 5, y: 5, w: 1, h: 1, i: "1" }];
    assertDeepEqualStrip(compact(layout, "horizontal", 10), [
      { x: 0, y: 0, w: 1, h: 1, i: "1", moved: false, static: false }
    ]);
  });

  it("Resolve collision by moving item further to the right in array", () => {
    const layout = [
      { y: 0, x: 0, h: 1, w: 5, i: "1" },
      { y: 0, x: 1, h: 1, w: 1, i: "2" }
    ];
    assertDeepEqualStrip(compact(layout, "horizontal", 10), [
      { y: 0, x: 0, h: 1, w: 5, i: "1", moved: false, static: false },
      { y: 0, x: 5, h: 1, w: 1, i: "2", moved: false, static: false }
    ]);
  });

  it("Handles recursive collision by moving new collisions out of the way before moving item to the right", () => {
    const layout = [
      { y: 0, x: 0, h: 2, w: 5, i: "1" },
      { y: 0, x: 0, h: 10, w: 1, i: "2" },
      { y: 5, x: 1, h: 1, w: 1, i: "3" },
      { y: 5, x: 2, h: 1, w: 1, i: "4" },
      { y: 5, x: 2, h: 1, w: 1, i: "5", static: true }
    ];
    assertDeepEqualStrip(compact(layout, "horizontal", 10), [
      { y: 0, x: 0, h: 2, w: 5, i: "1", moved: false, static: false },
      { y: 0, x: 5, h: 10, w: 1, i: "2", moved: false, static: false },
      { y: 5, x: 6, h: 1, w: 1, i: "3", moved: false, static: false },
      { y: 5, x: 7, h: 1, w: 1, i: "4", moved: false, static: false },
      { y: 5, x: 2, h: 1, w: 1, i: "5", moved: false, static: true }
    ]);
  });
});
