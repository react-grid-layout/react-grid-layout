/**
 * Test for PR #2150 - Margin rounding inconsistency
 *
 * Due to Math.round() in position calculations, margins between adjacent
 * items can be inconsistent (e.g., 0px, 1px, or 2px instead of consistent 1px).
 * This fix ensures margins are always consistent by adjusting item dimensions.
 */
import { calcGridItemPosition } from "../../src/core/calculate";

describe("PR #2150 - Margin consistency", () => {
  it("should have consistent margins when margin is [1,1]", () => {
    const positionParams = {
      margin: [1, 1] as readonly [number, number],
      containerPadding: [10, 10] as readonly [number, number],
      containerWidth: 1200,
      cols: 12,
      rowHeight: 30,
      maxRows: Infinity
    };

    // Calculate positions for 12 adjacent items in a row
    const positions = [];
    for (let x = 0; x < 12; x++) {
      positions.push(calcGridItemPosition(positionParams, x, 0, 1, 1));
    }

    // Check gaps between all adjacent items
    const gaps: number[] = [];
    for (let i = 0; i < positions.length - 1; i++) {
      const rightEdge = positions[i].left + positions[i].width;
      const leftEdge = positions[i + 1].left;
      gaps.push(leftEdge - rightEdge);
    }

    // All gaps should be exactly 1px (the margin)
    gaps.forEach(gap => {
      expect(gap).toBe(1);
    });
  });

  it("should have consistent margins when margin is [5,5]", () => {
    const positionParams = {
      margin: [5, 5] as readonly [number, number],
      containerPadding: [10, 10] as readonly [number, number],
      containerWidth: 1000,
      cols: 10,
      rowHeight: 50,
      maxRows: Infinity
    };

    // Calculate positions for items in a row
    const positions = [];
    for (let x = 0; x < 10; x++) {
      positions.push(calcGridItemPosition(positionParams, x, 0, 1, 1));
    }

    // Check horizontal gaps
    for (let i = 0; i < positions.length - 1; i++) {
      const rightEdge = positions[i].left + positions[i].width;
      const leftEdge = positions[i + 1].left;
      expect(leftEdge - rightEdge).toBe(5);
    }
  });

  it("should have consistent vertical margins", () => {
    const positionParams = {
      margin: [10, 10] as readonly [number, number],
      containerPadding: [10, 10] as readonly [number, number],
      containerWidth: 1200,
      cols: 12,
      rowHeight: 30,
      maxRows: Infinity
    };

    // Calculate positions for items in a column
    const positions = [];
    for (let y = 0; y < 10; y++) {
      positions.push(calcGridItemPosition(positionParams, 0, y, 1, 1));
    }

    // Check vertical gaps
    for (let i = 0; i < positions.length - 1; i++) {
      const bottomEdge = positions[i].top + positions[i].height;
      const topEdge = positions[i + 1].top;
      expect(topEdge - bottomEdge).toBe(10);
    }
  });

  it("should work with zero margins (no gaps)", () => {
    const positionParams = {
      margin: [0, 0] as readonly [number, number],
      containerPadding: [0, 0] as readonly [number, number],
      containerWidth: 1200,
      cols: 12,
      rowHeight: 30,
      maxRows: Infinity
    };

    // Calculate positions for adjacent items
    const positions = [];
    for (let x = 0; x < 12; x++) {
      positions.push(calcGridItemPosition(positionParams, x, 0, 1, 1));
    }

    // All gaps should be exactly 0px
    for (let i = 0; i < positions.length - 1; i++) {
      const rightEdge = positions[i].left + positions[i].width;
      const leftEdge = positions[i + 1].left;
      expect(leftEdge - rightEdge).toBe(0);
    }
  });

  it("should work with multi-column items", () => {
    const positionParams = {
      margin: [1, 1] as readonly [number, number],
      containerPadding: [10, 10] as readonly [number, number],
      containerWidth: 1200,
      cols: 12,
      rowHeight: 30,
      maxRows: Infinity
    };

    // Two 6-column items side by side
    const pos1 = calcGridItemPosition(positionParams, 0, 0, 6, 1);
    const pos2 = calcGridItemPosition(positionParams, 6, 0, 6, 1);

    const gap = pos2.left - (pos1.left + pos1.width);
    expect(gap).toBe(1);
  });
});
