/**
 * Unit tests for core functions
 *
 * Tests the core layout manipulation functions from src/core/
 */

import {
  // Layout functions
  cloneLayout,
  cloneLayoutItem,
  getLayoutItem,
  bottom,
  correctBounds,
  validateLayout,

  // Collision functions
  collides,
  getFirstCollision,
  getAllCollisions,

  // Position/calculation functions
  calcGridItemPosition,
  calcGridColWidth,
  calcGridItemWHPx,
  calcXY,
  calcWH,
  clamp,
  calcGridCellDimensions,

  // Position style functions
  setTransform,
  setTopLeft,
  perc
} from "../../src/core/index";

import type { Layout, LayoutItem, Position } from "../../src/core/types";
import type { PositionParams } from "../../src/core/calculate";

describe("Core Functions", () => {
  // ==========================================================================
  // Layout Functions
  // ==========================================================================

  describe("cloneLayout", () => {
    it("creates a deep copy of layout", () => {
      const original: Layout = [
        { i: "a", x: 0, y: 0, w: 2, h: 2, static: false, moved: false }
      ];

      const cloned = cloneLayout(original);

      expect(cloned).not.toBe(original);
      expect(cloned[0]).not.toBe(original[0]);
    });

    it("preserves all properties", () => {
      const original: Layout = [
        {
          i: "a",
          x: 1,
          y: 2,
          w: 3,
          h: 4,
          minW: 1,
          maxW: 5,
          minH: 2,
          maxH: 6,
          static: true,
          moved: false,
          isDraggable: true,
          isResizable: false,
          isBounded: true,
          resizeHandles: ["se", "sw"]
        }
      ];

      const cloned = cloneLayout(original);
      const item = cloned[0];

      expect(item?.i).toBe("a");
      expect(item?.x).toBe(1);
      expect(item?.y).toBe(2);
      expect(item?.w).toBe(3);
      expect(item?.h).toBe(4);
      expect(item?.minW).toBe(1);
      expect(item?.maxW).toBe(5);
      expect(item?.minH).toBe(2);
      expect(item?.maxH).toBe(6);
      expect(item?.static).toBe(true);
      expect(item?.isDraggable).toBe(true);
      expect(item?.isResizable).toBe(false);
      expect(item?.isBounded).toBe(true);
    });

    it("handles empty layout", () => {
      const cloned = cloneLayout([]);
      expect(cloned).toHaveLength(0);
    });
  });

  describe("cloneLayoutItem", () => {
    it("creates a copy of layout item", () => {
      const original: LayoutItem = {
        i: "a",
        x: 0,
        y: 0,
        w: 2,
        h: 2,
        static: false,
        moved: false
      };

      const cloned = cloneLayoutItem(original);

      expect(cloned).not.toBe(original);
      expect(cloned.i).toBe(original.i);
      expect(cloned.x).toBe(original.x);
      expect(cloned.y).toBe(original.y);
      expect(cloned.w).toBe(original.w);
      expect(cloned.h).toBe(original.h);
    });
  });

  describe("getLayoutItem", () => {
    const layout: Layout = [
      { i: "a", x: 0, y: 0, w: 2, h: 2, static: false, moved: false },
      { i: "b", x: 2, y: 0, w: 2, h: 2, static: false, moved: false },
      { i: "c", x: 4, y: 0, w: 2, h: 2, static: false, moved: false }
    ];

    it("finds item by id", () => {
      const item = getLayoutItem(layout, "b");
      expect(item?.i).toBe("b");
      expect(item?.x).toBe(2);
    });

    it("returns undefined for non-existent id", () => {
      const item = getLayoutItem(layout, "nonexistent");
      expect(item).toBeUndefined();
    });

    it("handles empty layout", () => {
      const item = getLayoutItem([], "a");
      expect(item).toBeUndefined();
    });
  });

  describe("bottom", () => {
    it("calculates bottom-most point", () => {
      const layout: Layout = [
        { i: "a", x: 0, y: 0, w: 2, h: 2, static: false, moved: false },
        { i: "b", x: 0, y: 5, w: 2, h: 3, static: false, moved: false }
      ];

      expect(bottom(layout)).toBe(8); // 5 + 3
    });

    it("returns 0 for empty layout", () => {
      expect(bottom([])).toBe(0);
    });

    it("handles single item", () => {
      const layout: Layout = [
        { i: "a", x: 0, y: 0, w: 2, h: 2, static: false, moved: false }
      ];

      expect(bottom(layout)).toBe(2);
    });
  });

  describe("correctBounds", () => {
    it("moves items within column bounds", () => {
      const layout: Layout = [
        { i: "a", x: 10, y: 0, w: 4, h: 2, static: false, moved: false }
      ];

      const corrected = correctBounds(layout, { cols: 12 });
      const item = corrected[0];

      // Item should be moved so it fits within 12 columns
      expect(item?.x).toBeLessThanOrEqual(12 - 4);
    });

    it("clamps item width to cols", () => {
      const layout: Layout = [
        { i: "a", x: 0, y: 0, w: 20, h: 2, static: false, moved: false }
      ];

      const corrected = correctBounds(layout, { cols: 12 });
      const item = corrected[0];

      expect(item?.w).toBeLessThanOrEqual(12);
    });

    it("handles items already within bounds", () => {
      const layout: Layout = [
        { i: "a", x: 0, y: 0, w: 2, h: 2, static: false, moved: false }
      ];

      const corrected = correctBounds(layout, { cols: 12 });
      const item = corrected[0];

      expect(item?.x).toBe(0);
      expect(item?.w).toBe(2);
    });
  });

  describe("validateLayout", () => {
    it("does not throw for valid layout", () => {
      const layout: Layout = [
        { i: "a", x: 0, y: 0, w: 2, h: 2, static: false, moved: false }
      ];

      expect(() => validateLayout(layout)).not.toThrow();
    });

    it("throws for missing required properties", () => {
      const layout = [{ i: "a", x: 0, y: 0 }] as Layout;

      expect(() => validateLayout(layout)).toThrow();
    });

    it("throws for non-numeric values", () => {
      const layout = [
        { i: "a", x: "0" as unknown as number, y: 0, w: 2, h: 2 }
      ] as Layout;

      expect(() => validateLayout(layout)).toThrow();
    });
  });

  // ==========================================================================
  // Collision Functions
  // ==========================================================================

  describe("collides", () => {
    it("detects overlapping items", () => {
      const a: LayoutItem = {
        i: "a",
        x: 0,
        y: 0,
        w: 2,
        h: 2,
        static: false,
        moved: false
      };
      const b: LayoutItem = {
        i: "b",
        x: 1,
        y: 1,
        w: 2,
        h: 2,
        static: false,
        moved: false
      };

      expect(collides(a, b)).toBe(true);
    });

    it("detects non-overlapping items", () => {
      const a: LayoutItem = {
        i: "a",
        x: 0,
        y: 0,
        w: 2,
        h: 2,
        static: false,
        moved: false
      };
      const b: LayoutItem = {
        i: "b",
        x: 5,
        y: 5,
        w: 2,
        h: 2,
        static: false,
        moved: false
      };

      expect(collides(a, b)).toBe(false);
    });

    it("detects adjacent items as non-colliding", () => {
      const a: LayoutItem = {
        i: "a",
        x: 0,
        y: 0,
        w: 2,
        h: 2,
        static: false,
        moved: false
      };
      const b: LayoutItem = {
        i: "b",
        x: 2,
        y: 0,
        w: 2,
        h: 2,
        static: false,
        moved: false
      };

      expect(collides(a, b)).toBe(false);
    });

    it("returns false for same item", () => {
      const a: LayoutItem = {
        i: "a",
        x: 0,
        y: 0,
        w: 2,
        h: 2,
        static: false,
        moved: false
      };

      expect(collides(a, a)).toBe(false);
    });
  });

  describe("getFirstCollision", () => {
    const layout: Layout = [
      { i: "a", x: 0, y: 0, w: 2, h: 2, static: false, moved: false },
      { i: "b", x: 3, y: 0, w: 2, h: 2, static: false, moved: false },
      { i: "c", x: 6, y: 0, w: 2, h: 2, static: false, moved: false }
    ];

    it("finds first collision", () => {
      const item: LayoutItem = {
        i: "test",
        x: 0,
        y: 0,
        w: 2,
        h: 2,
        static: false,
        moved: false
      };

      const collision = getFirstCollision(layout, item);
      expect(collision?.i).toBe("a");
    });

    it("returns undefined when no collision", () => {
      const item: LayoutItem = {
        i: "test",
        x: 10,
        y: 10,
        w: 1,
        h: 1,
        static: false,
        moved: false
      };

      const collision = getFirstCollision(layout, item);
      expect(collision).toBeUndefined();
    });
  });

  describe("getAllCollisions", () => {
    const layout: Layout = [
      { i: "a", x: 0, y: 0, w: 3, h: 3, static: false, moved: false },
      { i: "b", x: 2, y: 0, w: 3, h: 3, static: false, moved: false },
      { i: "c", x: 10, y: 0, w: 2, h: 2, static: false, moved: false }
    ];

    it("finds all collisions", () => {
      const item: LayoutItem = {
        i: "test",
        x: 1,
        y: 1,
        w: 3,
        h: 3,
        static: false,
        moved: false
      };

      const collisions = getAllCollisions(layout, item);
      expect(collisions).toHaveLength(2);
      expect(collisions.map(c => c.i)).toContain("a");
      expect(collisions.map(c => c.i)).toContain("b");
    });

    it("returns empty array when no collisions", () => {
      const item: LayoutItem = {
        i: "test",
        x: 10,
        y: 10,
        w: 1,
        h: 1,
        static: false,
        moved: false
      };

      const collisions = getAllCollisions(layout, item);
      expect(collisions).toHaveLength(0);
    });
  });

  // ==========================================================================
  // Position/Calculation Functions
  // ==========================================================================

  describe("calcGridColWidth", () => {
    it("calculates column width correctly", () => {
      const params: PositionParams = {
        cols: 12,
        containerPadding: [10, 10],
        containerWidth: 1200,
        margin: [10, 10],
        maxRows: 10,
        rowHeight: 30
      };

      const colWidth = calcGridColWidth(params);

      // (1200 - 10*2 - 10*11) / 12 = (1200 - 20 - 110) / 12 = 1070/12 ≈ 89.17
      expect(colWidth).toBeCloseTo(89.17, 1);
    });
  });

  describe("calcGridItemWHPx", () => {
    it("calculates width in pixels", () => {
      // For gridUnits=2, colOrRowSize=100, margin=10
      // Result should be: 2 * 100 + (2-1) * 10 = 200 + 10 = 210
      const width = calcGridItemWHPx(2, 100, 10);
      expect(width).toBe(210);
    });

    it("handles single unit", () => {
      const width = calcGridItemWHPx(1, 100, 10);
      expect(width).toBe(100);
    });
  });

  describe("calcGridItemPosition", () => {
    const params: PositionParams = {
      cols: 12,
      containerPadding: [10, 10],
      containerWidth: 1200,
      margin: [10, 10],
      maxRows: 10,
      rowHeight: 30
    };

    it("calculates position correctly", () => {
      const pos = calcGridItemPosition(params, 0, 0, 2, 2);

      expect(pos).toHaveProperty("left");
      expect(pos).toHaveProperty("top");
      expect(pos).toHaveProperty("width");
      expect(pos).toHaveProperty("height");

      expect(typeof pos.left).toBe("number");
      expect(typeof pos.top).toBe("number");
      expect(typeof pos.width).toBe("number");
      expect(typeof pos.height).toBe("number");
    });

    it("position increases with x", () => {
      const pos0 = calcGridItemPosition(params, 0, 0, 1, 1);
      const pos1 = calcGridItemPosition(params, 1, 0, 1, 1);

      expect(pos1.left).toBeGreaterThan(pos0.left);
    });

    it("position increases with y", () => {
      const pos0 = calcGridItemPosition(params, 0, 0, 1, 1);
      const pos1 = calcGridItemPosition(params, 0, 1, 1, 1);

      expect(pos1.top).toBeGreaterThan(pos0.top);
    });
  });

  describe("calcXY", () => {
    const params: PositionParams = {
      cols: 12,
      containerPadding: [10, 10],
      containerWidth: 1200,
      margin: [10, 10],
      maxRows: 10,
      rowHeight: 30
    };

    it("converts pixel position to grid units", () => {
      const result = calcXY(params, 50, 100, 2, 2);

      expect(result).toHaveProperty("x");
      expect(result).toHaveProperty("y");
      expect(typeof result.x).toBe("number");
      expect(typeof result.y).toBe("number");
    });

    it("clamps x to valid range", () => {
      const result = calcXY(params, 0, 5000, 2, 2);
      expect(result.x).toBeLessThanOrEqual(12 - 2);
    });

    it("clamps y to non-negative", () => {
      const result = calcXY(params, -100, 0, 2, 2);
      expect(result.y).toBeGreaterThanOrEqual(0);
    });
  });

  describe("calcWH", () => {
    const params: PositionParams = {
      cols: 12,
      containerPadding: [10, 10],
      containerWidth: 1200,
      margin: [10, 10],
      maxRows: 10,
      rowHeight: 30
    };

    it("converts pixel dimensions to grid units", () => {
      const result = calcWH(params, 200, 100, 0, 0, "se");

      expect(result).toHaveProperty("w");
      expect(result).toHaveProperty("h");
      expect(typeof result.w).toBe("number");
      expect(typeof result.h).toBe("number");
    });

    it("returns 0 for very small widths (caller handles min)", () => {
      // calcWH calculates raw values; callers clamp to minW/minH
      const result = calcWH(params, 5, 100, 0, 0, "se");
      expect(typeof result.w).toBe("number");
    });

    it("returns 0 for very small heights (caller handles min)", () => {
      // calcWH calculates raw values; callers clamp to minW/minH
      const result = calcWH(params, 100, 5, 0, 0, "se");
      expect(typeof result.h).toBe("number");
    });
  });

  describe("clamp", () => {
    it("returns value when within range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it("returns min when value is below", () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it("returns max when value is above", () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it("handles equal min and max", () => {
      expect(clamp(5, 5, 5)).toBe(5);
    });
  });

  // ==========================================================================
  // Position Style Functions
  // ==========================================================================

  describe("setTransform", () => {
    it("returns transform style object", () => {
      const pos: Position = { left: 100, top: 50, width: 200, height: 100 };
      const style = setTransform(pos);

      expect(style).toHaveProperty("transform");
      expect(style).toHaveProperty("width");
      expect(style).toHaveProperty("height");
      // Values include "px" suffix
      expect(style.width).toBe("200px");
      expect(style.height).toBe("100px");
    });

    it("uses translate for positioning", () => {
      const pos: Position = { left: 100, top: 50, width: 200, height: 100 };
      const style = setTransform(pos);

      expect(style.transform).toContain("translate");
    });
  });

  describe("setTopLeft", () => {
    it("returns top/left style object", () => {
      const pos: Position = { left: 100, top: 50, width: 200, height: 100 };
      const style = setTopLeft(pos);

      expect(style).toHaveProperty("left");
      expect(style).toHaveProperty("top");
      expect(style).toHaveProperty("width");
      expect(style).toHaveProperty("height");
      // Values include "px" suffix
      expect(style.left).toBe("100px");
      expect(style.top).toBe("50px");
      expect(style.width).toBe("200px");
      expect(style.height).toBe("100px");
    });
  });

  describe("perc", () => {
    it("converts number to percentage string", () => {
      expect(perc(0.5)).toBe("50%");
    });

    it("handles 0", () => {
      expect(perc(0)).toBe("0%");
    });

    it("handles 1", () => {
      expect(perc(1)).toBe("100%");
    });

    it("handles values greater than 1", () => {
      expect(perc(1.5)).toBe("150%");
    });
  });

  // ==========================================================================
  // Grid Cell Dimension Functions (for backgrounds/overlays)
  // ==========================================================================

  describe("calcGridCellDimensions", () => {
    it("calculates cell dimensions correctly", () => {
      const dims = calcGridCellDimensions({
        width: 1200,
        cols: 12,
        rowHeight: 30,
        margin: [10, 10],
        containerPadding: [10, 10]
      });

      // (1200 - 20 - 110) / 12 = 1070/12 ≈ 89.17
      expect(dims.cellWidth).toBeCloseTo(89.17, 1);
      expect(dims.cellHeight).toBe(30);
      expect(dims.offsetX).toBe(10);
      expect(dims.offsetY).toBe(10);
      expect(dims.gapX).toBe(10);
      expect(dims.gapY).toBe(10);
      expect(dims.cols).toBe(12);
      expect(dims.containerWidth).toBe(1200);
    });

    it("uses margin for padding when containerPadding is null", () => {
      const dims = calcGridCellDimensions({
        width: 1200,
        cols: 12,
        rowHeight: 30,
        margin: [15, 20],
        containerPadding: null
      });

      expect(dims.offsetX).toBe(15);
      expect(dims.offsetY).toBe(20);
      expect(dims.gapX).toBe(15);
      expect(dims.gapY).toBe(20);
    });

    it("uses default margin when not specified", () => {
      const dims = calcGridCellDimensions({
        width: 1200,
        cols: 12,
        rowHeight: 30
      });

      expect(dims.gapX).toBe(10);
      expect(dims.gapY).toBe(10);
      expect(dims.offsetX).toBe(10);
      expect(dims.offsetY).toBe(10);
    });

    it("calculates cell width correctly with no margins", () => {
      const dims = calcGridCellDimensions({
        width: 1200,
        cols: 12,
        rowHeight: 30,
        margin: [0, 0],
        containerPadding: [0, 0]
      });

      // 1200 / 12 = 100
      expect(dims.cellWidth).toBe(100);
      expect(dims.offsetX).toBe(0);
      expect(dims.offsetY).toBe(0);
      expect(dims.gapX).toBe(0);
      expect(dims.gapY).toBe(0);
    });

    it("calculates cell width with different margin and padding", () => {
      const dims = calcGridCellDimensions({
        width: 1000,
        cols: 10,
        rowHeight: 50,
        margin: [10, 10],
        containerPadding: [20, 20]
      });

      // (1000 - 40 - 90) / 10 = 870/10 = 87
      expect(dims.cellWidth).toBe(87);
      expect(dims.cellHeight).toBe(50);
      expect(dims.offsetX).toBe(20);
      expect(dims.offsetY).toBe(20);
      expect(dims.gapX).toBe(10);
      expect(dims.gapY).toBe(10);
    });

    it("cell widths match calcGridColWidth calculation", () => {
      const config = {
        width: 1200,
        cols: 12,
        rowHeight: 30,
        margin: [10, 10] as [number, number],
        containerPadding: [10, 10] as [number, number]
      };

      const dims = calcGridCellDimensions(config);

      const params: PositionParams = {
        cols: config.cols,
        containerPadding: config.containerPadding,
        containerWidth: config.width,
        margin: config.margin,
        maxRows: 100,
        rowHeight: config.rowHeight
      };

      const colWidth = calcGridColWidth(params);

      expect(dims.cellWidth).toBeCloseTo(colWidth, 5);
    });
  });
});
