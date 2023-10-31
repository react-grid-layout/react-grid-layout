// @flow
/* eslint-env jest */

import {
  bottom,
  collides,
  compact,
  fastRGLPropsEqual,
  moveElement,
  sortLayoutItemsByRowCol,
  validateLayout,
  compactType,
  synchronizeLayoutWithChildren
} from "../../lib/utils";
import * as React from "react";
import {
  calcGridColWidth,
  calcGridItemPosition,
  calcWH,
  calcXY
} from "../../lib/calculateUtils";
import { deepEqual } from "fast-equals";
import deepFreeze from "./../util/deepFreeze";

describe("bottom", () => {
  it("Handles an empty layout as input", () => {
    expect(bottom([])).toEqual(0);
  });

  it("Returns the bottom coordinate of the layout", () => {
    expect(
      bottom([
        { i: "1", x: 0, y: 1, w: 1, h: 1 },
        { i: "2", x: 1, y: 2, w: 1, h: 1 }
      ])
    ).toEqual(3);
  });
});

describe("sortLayoutItemsByRowCol", () => {
  it("should sort by top to bottom right", () => {
    const layout = [
      { x: 1, y: 1, w: 1, h: 1, i: "2" },
      { x: 1, y: 0, w: 1, h: 1, i: "1" },
      { x: 0, y: 1, w: 2, h: 2, i: "3" }
    ];
    expect(sortLayoutItemsByRowCol(layout)).toEqual([
      { x: 1, y: 0, w: 1, h: 1, i: "1" },
      { x: 0, y: 1, w: 2, h: 2, i: "3" },
      { x: 1, y: 1, w: 1, h: 1, i: "2" }
    ]);
  });
});

describe("collides", () => {
  it("Returns whether the layout items collide", () => {
    expect(
      collides(
        { i: "1", x: 0, y: 1, w: 1, h: 1 },
        { i: "2", x: 1, y: 2, w: 1, h: 1 }
      )
    ).toEqual(false);
    expect(
      collides(
        { i: "1", x: 0, y: 1, w: 1, h: 1 },
        { i: "2", x: 0, y: 1, w: 1, h: 1 }
      )
    ).toEqual(true);
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
  it("Throws errors on h not as a number", () => {
    expect(() => {
      validateLayout([
        { i: "1", x: 0, y: 1, w: 1, h: 1 },
        // $FlowFixMe: dynamic check
        { i: "2", x: 1, y: 2, w: 1 }
      ]);
    }).toThrowError(/layout\[1]\.h must be a number!/i);
  });
});

describe("moveElement", () => {
  function compactAndMove(
    layout,
    layoutItem,
    x,
    y,
    isUserAction,
    preventCollision,
    compactType,
    cols
  ) {
    return compact(
      moveElement(
        layout,
        layoutItem,
        x,
        y,
        isUserAction,
        preventCollision,
        compactType,
        cols
      ),
      compactType,
      cols
    );
  }

  it("Does not change layout when colliding on no rearrangement mode", () => {
    const layout = [
      { i: "1", x: 0, y: 1, w: 1, h: 1, moved: false },
      { i: "2", x: 1, y: 2, w: 1, h: 1, moved: false }
    ];
    const layoutItem = layout[0];
    expect(
      moveElement(
        layout,
        layoutItem,
        1,
        2, // x, y
        true, // isUserAction
        true, // preventCollision
        null,
        2 // compactType, cols
      )
    ).toEqual([
      { i: "1", x: 0, y: 1, w: 1, h: 1, moved: false },
      { i: "2", x: 1, y: 2, w: 1, h: 1, moved: false }
    ]);
  });

  it("Does change layout when colliding in rearrangement mode", () => {
    const layout = [
      { i: "1", x: 0, y: 0, w: 1, h: 1, moved: false },
      { i: "2", x: 1, y: 0, w: 1, h: 1, moved: false }
    ];
    const layoutItem = layout[0];
    expect(
      moveElement(
        layout,
        layoutItem,
        1,
        0, // x, y
        true, // isUserAction
        false, //  preventCollision
        "vertical",
        2 // compactType, cols
      )
    ).toEqual([
      { i: "1", x: 1, y: 0, w: 1, h: 1, moved: true },
      { i: "2", x: 1, y: 1, w: 1, h: 1, moved: true }
    ]);
  });

  it("Moves elements out of the way without causing panel jumps when compaction is vertical", () => {
    const layout = [
      { x: 0, y: 0, w: 1, h: 10, i: "A" },
      { x: 0, y: 10, w: 1, h: 1, i: "B" },
      { x: 0, y: 11, w: 1, h: 1, i: "C" }
    ];
    // move A down slightly so it collides with C; can cause C to jump above B.
    // We instead want B to jump above A (it has the room)
    const itemA = layout[0];
    expect(
      compactAndMove(
        layout,
        itemA,
        0,
        1, // x, y
        true, // isUserAction
        false, //  preventCollision
        "vertical",
        10 // compactType, cols
      )
    ).toEqual([
      expect.objectContaining({ x: 0, y: 1, w: 1, h: 10, i: "A" }),
      expect.objectContaining({ x: 0, y: 0, w: 1, h: 1, i: "B" }),
      expect.objectContaining({ x: 0, y: 11, w: 1, h: 1, i: "C" })
    ]);
  });

  it("Calculates the correct collision when moving large object far", () => {
    const layout = [
      { x: 0, y: 0, w: 1, h: 10, i: "A" },
      { x: 0, y: 10, w: 1, h: 1, i: "B" },
      { x: 0, y: 11, w: 1, h: 1, i: "C" }
    ];
    // Move A down by 2. This should move B above, but since we don't compact in between,
    // C should move below.
    const itemA = layout[0];
    expect(
      moveElement(
        layout,
        itemA,
        0,
        2, // x, y
        true, // isUserAction
        false, //  preventCollision
        "vertical",
        10 // compactType, cols
      )
    ).toEqual([
      expect.objectContaining({ x: 0, y: 2, w: 1, h: 10, i: "A" }),
      expect.objectContaining({ x: 0, y: 1, w: 1, h: 1, i: "B" }),
      expect.objectContaining({ x: 0, y: 12, w: 1, h: 1, i: "C" })
    ]);
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
    expect(
      moveElement(
        layout,
        itemA,
        1,
        0, // x, y
        true, // isUserAction
        false, //  preventCollision
        "vertical",
        2 // compactType, cols
      )
    ).toEqual([
      { x: 1, y: 0, w: 1, h: 1, i: "A", moved: true },
      { x: 1, y: 1, w: 1, h: 1, i: "B", moved: true },
      { x: 0, y: 2, w: 2, h: 2, i: "C", moved: true }
    ]);
  });

  it("Moves elements out of the way without causing panel jumps when compaction is horizontal", () => {
    const layout = [
      { y: 0, x: 0, h: 1, w: 10, i: "A" },
      { y: 0, x: 11, h: 1, w: 1, i: "B" },
      { y: 0, x: 12, h: 1, w: 1, i: "C" }
    ];
    // move A over slightly so it collides with C; can cause C to jump left of B
    // this test will check that that does not happen
    const itemA = layout[0];
    expect(
      moveElement(
        layout,
        itemA,
        2,
        0, // x, y
        true, // isUserAction
        false, //  preventCollision
        "horizontal",
        10 // compactType, cols
      )
    ).toEqual([
      { y: 0, x: 2, h: 1, w: 10, moved: true, i: "A" },
      { y: 0, x: 1, h: 1, w: 1, moved: true, i: "B" },
      { y: 0, x: 12, h: 1, w: 1, i: "C" }
    ]);
  });

  it("Moves one element to another should cause moving down panels, vert compact, example 1", () => {
    // | A | B |
    // |C|  D  |
    const layout = [
      { x: 0, y: 0, w: 2, h: 1, i: "A" },
      { x: 2, y: 0, w: 2, h: 1, i: "B" },
      { x: 0, y: 1, w: 1, h: 1, i: "C" },
      { x: 1, y: 1, w: 3, h: 1, i: "D" }
    ];
    // move B left slightly so it collides with A; can cause C to jump above A
    // this test will check that that does not happen
    const itemB = layout[1];
    expect(
      compactAndMove(
        layout,
        itemB,
        1,
        0, // x, y
        true, // isUserAction
        false, //  preventCollision
        "vertical",
        4 // compactType, cols
      )
    ).toEqual([
      expect.objectContaining({ x: 0, y: 1, w: 2, h: 1, i: "A" }),
      expect.objectContaining({ x: 1, y: 0, w: 2, h: 1, i: "B" }),
      expect.objectContaining({ x: 0, y: 2, w: 1, h: 1, i: "C" }),
      expect.objectContaining({ x: 1, y: 2, w: 3, h: 1, i: "D" })
    ]);
  });

  it("Moves one element to another should cause moving down panels, vert compact, example 2", () => {
    // | A |
    // |B|C|
    //   | |
    //
    // Moving C above A should not move B above A
    const layout = [
      { x: 0, y: 0, w: 2, h: 1, i: "A" },
      { x: 0, y: 1, w: 1, h: 1, i: "B" },
      { x: 1, y: 1, w: 1, h: 2, i: "C" }
    ];
    // Move C up.
    const itemB = layout[2];
    expect(
      compactAndMove(
        layout,
        itemB,
        1,
        0, // x, y
        true, // isUserAction
        false, //  preventCollision
        "vertical",
        4 // compactType, cols
      )
    ).toEqual([
      expect.objectContaining({ x: 0, y: 2, w: 2, h: 1, i: "A" }),
      expect.objectContaining({ x: 0, y: 3, w: 1, h: 1, i: "B" }),
      expect.objectContaining({ x: 1, y: 0, w: 1, h: 2, i: "C" })
    ]);
  });

  it("Prevent collision", () => {
    const layout = [
      { x: 0, y: 0, w: 1, h: 10, i: "A" },
      { x: 0, y: 10, w: 1, h: 1, i: "B" },
      { x: 0, y: 11, w: 1, h: 1, i: "C" }
    ];
    // Move A down by 2. This will collide with B and C so
    // the layout should be unchanged
    const itemA = layout[0];
    const modifiedLayout = moveElement(
      layout,
      itemA,
      0, // x
      2, // y
      true, // isUserAction
      true, // preventCollision
      null, // compactType
      10 // cols
    );
    expect(Object.is(layout, modifiedLayout)).toBe(true);

    expect(layout).toEqual([
      expect.objectContaining({ x: 0, y: 0, w: 1, h: 10, i: "A" }),
      expect.objectContaining({ x: 0, y: 10, w: 1, h: 1, i: "B" }),
      expect.objectContaining({ x: 0, y: 11, w: 1, h: 1, i: "C" })
    ]);
  });

  it("Allow overlapping the grid items", () => {
    const layout = [
      { x: 0, y: 0, w: 1, h: 10, i: "A" },
      { x: 0, y: 10, w: 1, h: 1, i: "B" },
      { x: 0, y: 11, w: 1, h: 1, i: "C" }
    ];
    // Move A down by 2. Both B and C should remain in same position
    const itemA = layout[0];
    expect(
      moveElement(
        layout,
        itemA,
        0,
        2, // x, y
        true, // isUserAction
        false, // preventCollision
        null,
        10, // compactType, cols
        true // allowOverlap
      )
    ).toEqual([
      expect.objectContaining({ x: 0, y: 2, w: 1, h: 10, i: "A" }),
      expect.objectContaining({ x: 0, y: 10, w: 1, h: 1, i: "B" }),
      expect.objectContaining({ x: 0, y: 11, w: 1, h: 1, i: "C" })
    ]);
  });

  it("Layout is cloned when using allowOverlap (#1606)", () => {
    const layout = [
      { x: 0, y: 0, w: 1, h: 10, i: "A" },
      { x: 0, y: 10, w: 1, h: 1, i: "B" },
      { x: 0, y: 11, w: 1, h: 1, i: "C" }
    ];
    // Move A down by 2. Both B and C should remain in same position
    const itemA = layout[0];
    const modifiedLayout = moveElement(
      layout,
      itemA,
      0,
      2, // x, y
      true, // isUserAction
      false, // preventCollision
      null,
      10, // compactType, cols
      true // allowOverlap
    );
    expect(Object.is(layout, modifiedLayout)).toBe(false);
  });
});

describe("compact vertical", () => {
  it("Removes empty vertical space above item", () => {
    const layout = [{ i: "1", x: 0, y: 1, w: 1, h: 1 }];
    expect(compact(layout, "vertical", 10)).toEqual([
      { i: "1", x: 0, y: 0, w: 1, h: 1, moved: false, static: false }
    ]);
  });

  it("Resolve collision by moving item further down in array", () => {
    const layout = [
      { x: 0, y: 0, w: 1, h: 5, i: "1" },
      { x: 0, y: 1, w: 1, h: 1, i: "2" }
    ];
    expect(compact(layout, "vertical", 10)).toEqual([
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

    expect(compact(layout, "vertical", 10)).toEqual([
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
      expect(out.includes(item)).toEqual(false);
    });
  });
});

describe("compact horizontal", () => {
  it("compact horizontal should remove empty horizontal space to left of item", () => {
    const layout = [{ x: 5, y: 5, w: 1, h: 1, i: "1" }];
    expect(compact(layout, "horizontal", 10)).toEqual([
      { x: 0, y: 5, w: 1, h: 1, i: "1", moved: false, static: false }
    ]);
  });

  it("Resolve collision by moving item further to the right in array", () => {
    const layout = [
      { y: 0, x: 0, h: 1, w: 5, i: "1" },
      { y: 0, x: 1, h: 1, w: 1, i: "2" }
    ];
    expect(compact(layout, "horizontal", 10)).toEqual([
      { y: 0, x: 0, h: 1, w: 5, i: "1", moved: false, static: false },
      { y: 0, x: 5, h: 1, w: 1, i: "2", moved: false, static: false }
    ]);
  });

  it("Handles recursive collision by moving new collisions out of the way before moving item to the right", () => {
    const layout = [
      { y: 0, x: 0, h: 2, w: 5, i: "1" },
      { y: 1, x: 0, h: 10, w: 1, i: "2" },
      { y: 5, x: 1, h: 1, w: 1, i: "3" },
      { y: 5, x: 2, h: 1, w: 1, i: "4" },
      { y: 5, x: 2, h: 1, w: 1, i: "5", static: true }
    ];
    expect(compact(layout, "horizontal", 10)).toEqual([
      { y: 0, x: 0, h: 2, w: 5, i: "1", moved: false, static: false },
      { y: 1, x: 5, h: 10, w: 1, i: "2", moved: false, static: false },
      { y: 5, x: 6, h: 1, w: 1, i: "3", moved: false, static: false },
      { y: 5, x: 7, h: 1, w: 1, i: "4", moved: false, static: false },
      { y: 5, x: 2, h: 1, w: 1, i: "5", moved: false, static: true }
    ]);
  });

  it("Should put overflowing right elements as bottom needed without colliding and as left as possible", () => {
    const cols = 6;
    const layout = [
      { y: 0, x: 0, h: 2, w: 2, i: "1" },
      { y: 0, x: 2, h: 2, w: 2, i: "2" },
      { y: 0, x: 4, h: 2, w: 2, i: "3" },
      { y: -2, x: -2, h: 2, w: 2, i: "4" }
    ];

    expect(compact(layout, "horizontal", cols)).toEqual([
      { y: 0, x: 2, h: 2, w: 2, i: "1", moved: false, static: false },
      { y: 0, x: 4, h: 2, w: 2, i: "2", moved: false, static: false },
      { y: 2, x: 0, h: 2, w: 2, i: "3", moved: false, static: false },
      { y: 0, x: 0, h: 2, w: 2, i: "4", moved: false, static: false }
    ]);
  });
});

const basePositionParams = {
  margin: [0, 0],
  containerPadding: [0, 0],
  containerWidth: 800,
  cols: 8,
  rowHeight: 50,
  maxRows: 12
};
describe("calcGridColWidth", () => {
  it("should complete basic calculation", () => {
    expect(calcGridColWidth(basePositionParams)).toEqual(100);
  });

  it("should consider margin", () => {
    const positionParams = {
      ...basePositionParams,
      margin: [10, 10]
    };
    // 70 px of margin in total (one between each of 8 items)
    expect(calcGridColWidth(positionParams)).toEqual(91.25);
  });

  it("should consider container padding", () => {
    const positionParams = {
      ...basePositionParams,
      containerPadding: [100, 0]
    };
    // (800 - 100 - 100) / 8
    expect(calcGridColWidth(positionParams)).toEqual(75);
  });

  it("should consider margin and padding", () => {
    const positionParams = {
      ...basePositionParams,
      margin: [10, 0],
      containerPadding: [100, 0]
    };
    // (800 - 100 - 100 - 70) / 8
    expect(calcGridColWidth(positionParams)).toEqual(66.25);
  });
});

describe("calcGridItemPosition", () => {
  it("should complete basic calculation", () => {
    const x = 1;
    const y = 1;
    const w = 2;
    const h = 2;
    const resizing = null;
    const dragging = null;
    const positionParams = {
      ...basePositionParams,
      margin: [10, 10],
      containerPadding: [100, 100]
    };
    expect(
      calcGridItemPosition(positionParams, x, y, w, h, { resizing, dragging })
    ).toEqual({
      height: 110, // 50 * 2 + margin of 10
      left: 176, // 100 + colWidth (66.25) + margin. Rounded to complete pixel
      top: 160, // 100 + height + margin
      width: 143 // 2x colWidth + margin, rounded
    });
  });
});

describe("fastRGLPropsEqual", () => {
  it("should tell us if props are equal, including arrays and objects", () => {
    const props1 = {
      className: "foo",
      margin: [10, 10],
      style: { background: "red" }
    };
    const props2 = {
      className: "foo",
      margin: [10, 10],
      style: { background: "red" }
    };
    expect(fastRGLPropsEqual(props1, props2, deepEqual)).toEqual(true);
  });

  it("catches changed arrays", () => {
    const props1 = {
      margin: [10, 10]
    };
    const props2 = {
      margin: [10, 11]
    };
    expect(fastRGLPropsEqual(props1, props2, deepEqual)).toEqual(false);
  });

  it("ignores children", () => {
    const props1 = {
      children: ["foo", "bar"]
    };
    const props2 = {
      children: ["biff", "bar"]
    };
    expect(fastRGLPropsEqual(props1, props2, deepEqual)).toEqual(true);
  });

  it("fails added props", () => {
    const props1 = {};
    const props2 = {
      droppingItem: { w: 1, h: 2, i: 3 }
    };
    expect(fastRGLPropsEqual(props1, props2, deepEqual)).toEqual(false);
  });

  it("ignores invalid props", () => {
    const props1 = {};
    const props2 = {
      somethingElse: { w: 1, h: 2, i: 3 }
    };
    expect(fastRGLPropsEqual(props1, props2, deepEqual)).toEqual(true);
  });
});

describe("calcWH", () => {
  const mockPositionParams = {
    margin: [0, 0],
    containerPadding: [0, 0],
    containerWidth: 400,
    cols: 4,
    rowHeight: 200,
    maxRows: 3
  };
  it("return { w: 1, h: 1 }", () => {
    const res = calcWH(mockPositionParams, 100, 200, 1, 1, "e");
    expect(JSON.stringify(res)).toBe(JSON.stringify({ w: 1, h: 1 }));
  });
  it("return { w: 2, h: 1 }", () => {
    const res = calcWH(mockPositionParams, 200, 200, 1, 1, "e");
    expect(JSON.stringify(res)).toBe(JSON.stringify({ w: 2, h: 1 }));
  });
  it("return { w: 1, h: 2 }", () => {
    const res = calcWH(mockPositionParams, 100, 400, 1, 1, "se");
    expect(JSON.stringify(res)).toBe(JSON.stringify({ w: 1, h: 2 }));
  });
});

describe("calcXY", () => {
  const mockPositionParams = {
    margin: [0, 0],
    containerPadding: [0, 0],
    containerWidth: 500,
    cols: 4,
    rowHeight: 100,
    maxRows: 3
  };

  it("return {x:0, y:0}", () => {
    const TOP = 10;
    const LEFT = 10;
    const W = 300;
    const H = 100;
    const res = calcXY(mockPositionParams, TOP, LEFT, W, H);
    expect(JSON.stringify(res)).toBe(JSON.stringify({ x: 0, y: 0 }));
  });
  it("return {x:1, y:0}", () => {
    const TOP = 0;
    const LEFT = 100;
    const W = 0;
    const H = 0;
    const res = calcXY(mockPositionParams, TOP, LEFT, W, H);
    expect(JSON.stringify(res)).toBe(JSON.stringify({ x: 1, y: 0 }));
  });
  it("return {x:0, y:1}", () => {
    const TOP = 110;
    const LEFT = 0;
    const W = 0;
    const H = 0;
    const res = calcXY(mockPositionParams, TOP, LEFT, W, H);
    expect(JSON.stringify(res)).toBe(JSON.stringify({ x: 0, y: 1 }));
  });
});

describe("compactType", () => {
  const mockProps = {
    verticalCompact: false,
    compactType: "horizontal"
  };
  it("returns null when verticalCompact is false", () => {
    expect(compactType(mockProps)).toBe(null);
  });
  it("returns compactType value when verticalCompact is true", () => {
    expect(compactType({ ...mockProps, verticalCompact: true })).toBe(
      "horizontal"
    );
  });
});

describe("deepFreeze", () => {
  it("smoke test", () => {
    const deepFreezeResult = deepFreeze(
      { a: "a", b: { b: "c" } },
      { get: true, set: true }
    );
    expect(JSON.stringify(deepFreezeResult)).toBe('{"a":"a","b":{"b":"c"}}');
  });
  it("gets nested key value", () => {
    const res = deepFreeze(
      { one: "a", two: { b: "c" } },
      { set: true, get: true }
    );

    const val = res.two.b;
    expect(val).toBe("c");
  });
  it("defaults option prop to get: true", () => {
    const res = deepFreeze({ one: "a", two: { b: "c" } });

    expect(res.two.b).toBe("c");
  });
  it("does not pass check `if(options.set)` ", () => {
    const res = deepFreeze({ one: "a" }, { set: false, get: false });
    expect(res.one).toBe("a");
  });

  it("returns `toJSON`", () => {
    const res = deepFreeze({ a: "toJSON" });
    expect(res.a.toString()).toBe(`toJSON`);
  });
  describe('throws "unknown prop" error', () => {
    it("when setting bad key", () => {
      try {
        const res = deepFreeze(
          { one: "a", two: { b: "c" } },
          { set: true, get: false }
        );
        // $FlowIgnore to test the error throw
        res.badProp = "dog";
      } catch (e) {
        expect(e.message).toBe(
          'Can not set unknown prop "badProp" on frozen object.'
        );
      }
    });
    it("when getting bad key", () => {
      try {
        const res = deepFreeze(
          { one: "a", two: { b: "c" } },
          { set: true, get: true }
        );
        // $FlowIgnore to test the error throws
        res.badProp;
      } catch (e) {
        expect(e.message).toBe(
          'Can not get unknown prop "badProp" on frozen object.'
        );
      }
    });
  });
});

describe("synchronizeLayoutWithChildren", () => {
  const layout = [
    { x: 0, y: 0, w: 1, h: 10, i: "A" },
    { x: 0, y: 10, w: 1, h: 1, i: "B" },
    { x: 0, y: 11, w: 1, h: 1, i: "C" }
  ];
  const cols = 6;
  const compactType = "horizontal";
  it("test", () => {
    const children = [
      <div key="A" />,
      <div key="B" />,
      <div key="C" />,
      <div key="D" />
    ];
    const output = synchronizeLayoutWithChildren(
      layout,
      children,
      cols,
      compactType
    );
    expect(output).toEqual([
      expect.objectContaining({ w: 1, h: 10, x: 0, y: 0, i: "A" }),
      expect.objectContaining({ w: 1, h: 1, x: 0, y: 10, i: "B" }),
      expect.objectContaining({ w: 1, h: 1, x: 0, y: 11, i: "C" }),
      expect.objectContaining({ w: 1, h: 1, x: 0, y: 12, i: "D" })
    ]);
  });
  it("Prefers data-grid over layout", () => {
    const children = [
      <div key="A" />,
      <div key="B" />,
      <div key="C" data-grid={{ x: 0, y: 11, w: 2, h: 2 }} />
    ];
    const output = synchronizeLayoutWithChildren(
      layout,
      children,
      cols,
      compactType
    );
    expect(output).toEqual([
      expect.objectContaining({ w: 1, h: 10, x: 0, y: 0, i: "A" }),
      expect.objectContaining({ w: 1, h: 1, x: 0, y: 10, i: "B" }),
      expect.objectContaining({ w: 2, h: 2, x: 0, y: 11, i: "C" })
    ]);
  });
});
