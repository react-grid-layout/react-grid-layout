/**
 * Unit tests for pluggable layout constraints
 *
 * Tests the constraint system exported from src/core/constraints.ts
 */

import {
  gridBounds,
  minMaxSize,
  containerBounds,
  boundedX,
  boundedY,
  aspectRatio,
  snapToGrid,
  minSize,
  maxSize,
  defaultConstraints,
  applyPositionConstraints,
  applySizeConstraints
} from "../../src/core/constraints";
import type {
  LayoutItem,
  LayoutConstraint,
  ConstraintContext
} from "../../src/core/types";

// Helper to create a basic layout item
function createItem(overrides: Partial<LayoutItem> = {}): LayoutItem {
  return {
    i: "test",
    x: 0,
    y: 0,
    w: 2,
    h: 2,
    static: false,
    moved: false,
    ...overrides
  };
}

// Helper to create a constraint context
function createContext(
  overrides: Partial<ConstraintContext> = {}
): ConstraintContext {
  return {
    cols: 12,
    maxRows: Infinity,
    containerWidth: 1200,
    containerHeight: 800,
    rowHeight: 30,
    margin: [10, 10] as [number, number],
    layout: [],
    ...overrides
  };
}

describe("Constraints", () => {
  describe("gridBounds", () => {
    it("has correct name", () => {
      expect(gridBounds.name).toBe("gridBounds");
    });

    it("constrains position within grid bounds", () => {
      const item = createItem({ w: 2, h: 2 });
      const context = createContext({ cols: 12, maxRows: 10 });

      // Test constraining x to the right bound
      const result1 = gridBounds.constrainPosition!(item, 15, 0, context);
      expect(result1.x).toBe(10); // cols - w = 12 - 2 = 10

      // Test constraining y to the bottom bound
      const result2 = gridBounds.constrainPosition!(item, 0, 15, context);
      expect(result2.y).toBe(8); // maxRows - h = 10 - 2 = 8

      // Test constraining negative values
      const result3 = gridBounds.constrainPosition!(item, -5, -5, context);
      expect(result3.x).toBe(0);
      expect(result3.y).toBe(0);
    });

    it("constrains size within grid bounds", () => {
      const item = createItem({ x: 10, y: 8 });
      const context = createContext({ cols: 12, maxRows: 10 });

      // Test constraining width
      const result1 = gridBounds.constrainSize!(item, 5, 2, "se", context);
      expect(result1.w).toBe(2); // cols - x = 12 - 10 = 2

      // Test constraining height
      const result2 = gridBounds.constrainSize!(item, 2, 5, "se", context);
      expect(result2.h).toBe(2); // maxRows - y = 10 - 8 = 2

      // Test minimum size of 1
      const result3 = gridBounds.constrainSize!(item, 0, 0, "se", context);
      expect(result3.w).toBe(1);
      expect(result3.h).toBe(1);
    });

    it("allows valid positions unchanged", () => {
      const item = createItem({ w: 2, h: 2 });
      const context = createContext({ cols: 12, maxRows: 10 });

      const result = gridBounds.constrainPosition!(item, 5, 5, context);
      expect(result.x).toBe(5);
      expect(result.y).toBe(5);
    });
  });

  describe("minMaxSize", () => {
    it("has correct name", () => {
      expect(minMaxSize.name).toBe("minMaxSize");
    });

    it("does not have constrainPosition", () => {
      expect(minMaxSize.constrainPosition).toBeUndefined();
    });

    it("constrains size to item min/max values", () => {
      const item = createItem({ minW: 2, maxW: 6, minH: 2, maxH: 4 });
      const context = createContext();

      // Test constraining to minimum
      const result1 = minMaxSize.constrainSize!(item, 1, 1, "se", context);
      expect(result1.w).toBe(2);
      expect(result1.h).toBe(2);

      // Test constraining to maximum
      const result2 = minMaxSize.constrainSize!(item, 10, 10, "se", context);
      expect(result2.w).toBe(6);
      expect(result2.h).toBe(4);
    });

    it("uses default min of 1 when not specified", () => {
      const item = createItem(); // No minW/minH
      const context = createContext();

      const result = minMaxSize.constrainSize!(item, 0, 0, "se", context);
      expect(result.w).toBe(1);
      expect(result.h).toBe(1);
    });

    it("allows Infinity max when not specified", () => {
      const item = createItem(); // No maxW/maxH
      const context = createContext();

      const result = minMaxSize.constrainSize!(item, 100, 100, "se", context);
      expect(result.w).toBe(100);
      expect(result.h).toBe(100);
    });
  });

  describe("containerBounds", () => {
    it("has correct name", () => {
      expect(containerBounds.name).toBe("containerBounds");
    });

    it("constrains position using container height to calculate visible rows", () => {
      const item = createItem({ w: 2, h: 2 });
      // With containerHeight: 390, rowHeight: 30, margin: 10
      // visibleRows = floor((390 + 10) / (30 + 10)) = floor(400 / 40) = 10
      const context = createContext({
        cols: 12,
        containerHeight: 390,
        rowHeight: 30,
        margin: [10, 10]
      });

      const result = containerBounds.constrainPosition!(item, 15, 15, context);
      expect(result.x).toBe(10);
      expect(result.y).toBe(8); // visibleRows - h = 10 - 2 = 8
    });

    it("falls back to maxRows when containerHeight is 0 (auto-height)", () => {
      const item = createItem({ w: 2, h: 2 });
      const context = createContext({
        cols: 12,
        maxRows: 10,
        containerHeight: 0 // Auto-height grid
      });

      const result = containerBounds.constrainPosition!(item, 15, 15, context);
      expect(result.x).toBe(10);
      expect(result.y).toBe(8); // maxRows - h = 10 - 2 = 8
    });

    it("does not have constrainSize", () => {
      expect(containerBounds.constrainSize).toBeUndefined();
    });
  });

  describe("boundedX", () => {
    it("has correct name", () => {
      expect(boundedX.name).toBe("boundedX");
    });

    it("only constrains x position", () => {
      const item = createItem({ w: 2, h: 2 });
      const context = createContext({ cols: 12 });

      const result = boundedX.constrainPosition!(item, 15, 100, context);
      expect(result.x).toBe(10); // Constrained
      expect(result.y).toBe(100); // Not constrained
    });
  });

  describe("boundedY", () => {
    it("has correct name", () => {
      expect(boundedY.name).toBe("boundedY");
    });

    it("only constrains y position", () => {
      const item = createItem({ w: 2, h: 2 });
      const context = createContext({ maxRows: 10 });

      const result = boundedY.constrainPosition!(item, 100, 15, context);
      expect(result.x).toBe(100); // Not constrained
      expect(result.y).toBe(8); // Constrained
    });
  });

  describe("aspectRatio factory", () => {
    it("creates constraint with correct name", () => {
      const constraint = aspectRatio(16 / 9);
      expect(constraint.name).toBe(`aspectRatio(${16 / 9})`);
    });

    it("maintains aspect ratio during resize", () => {
      const constraint = aspectRatio(2); // 2:1 ratio (w:h)
      const item = createItem();
      const context = createContext();

      const result = constraint.constrainSize!(item, 4, 10, "se", context);
      expect(result.w).toBe(4);
      expect(result.h).toBe(2); // 4 / 2 = 2
    });

    it("creates square items with ratio of 1", () => {
      const constraint = aspectRatio(1);
      const item = createItem();
      const context = createContext();

      const result = constraint.constrainSize!(item, 5, 10, "se", context);
      expect(result.w).toBe(5);
      expect(result.h).toBe(5);
    });

    it("ensures minimum height of 1", () => {
      const constraint = aspectRatio(100); // Very wide ratio
      const item = createItem();
      const context = createContext();

      const result = constraint.constrainSize!(item, 1, 1, "se", context);
      expect(result.h).toBe(1);
    });

    it("does not have constrainPosition", () => {
      const constraint = aspectRatio(1);
      expect(constraint.constrainPosition).toBeUndefined();
    });
  });

  describe("snapToGrid factory", () => {
    it("creates constraint with correct name", () => {
      const constraint = snapToGrid(2);
      expect(constraint.name).toBe("snapToGrid(2, 2)");
    });

    it("creates constraint with different x/y steps", () => {
      const constraint = snapToGrid(2, 3);
      expect(constraint.name).toBe("snapToGrid(2, 3)");
    });

    it("snaps position to grid", () => {
      const constraint = snapToGrid(2);
      const item = createItem();
      const context = createContext();

      // Should snap to nearest multiple of 2
      const result1 = constraint.constrainPosition!(item, 3, 5, context);
      expect(result1.x).toBe(4); // rounds 3 -> 4
      expect(result1.y).toBe(6); // rounds 5 -> 6

      const result2 = constraint.constrainPosition!(item, 1, 2, context);
      expect(result2.x).toBe(2); // rounds 1 -> 2
      expect(result2.y).toBe(2);
    });

    it("snaps with different x/y steps", () => {
      const constraint = snapToGrid(3, 2);
      const item = createItem();
      const context = createContext();

      const result = constraint.constrainPosition!(item, 4, 3, context);
      expect(result.x).toBe(3); // nearest multiple of 3
      expect(result.y).toBe(4); // nearest multiple of 2
    });

    it("does not have constrainSize", () => {
      const constraint = snapToGrid(2);
      expect(constraint.constrainSize).toBeUndefined();
    });
  });

  describe("minSize factory", () => {
    it("creates constraint with correct name", () => {
      const constraint = minSize(3, 4);
      expect(constraint.name).toBe("minSize(3, 4)");
    });

    it("enforces minimum size", () => {
      const constraint = minSize(3, 4);
      const item = createItem();
      const context = createContext();

      const result = constraint.constrainSize!(item, 1, 2, "se", context);
      expect(result.w).toBe(3);
      expect(result.h).toBe(4);
    });

    it("allows sizes above minimum", () => {
      const constraint = minSize(3, 4);
      const item = createItem();
      const context = createContext();

      const result = constraint.constrainSize!(item, 5, 6, "se", context);
      expect(result.w).toBe(5);
      expect(result.h).toBe(6);
    });
  });

  describe("maxSize factory", () => {
    it("creates constraint with correct name", () => {
      const constraint = maxSize(6, 8);
      expect(constraint.name).toBe("maxSize(6, 8)");
    });

    it("enforces maximum size", () => {
      const constraint = maxSize(6, 8);
      const item = createItem();
      const context = createContext();

      const result = constraint.constrainSize!(item, 10, 12, "se", context);
      expect(result.w).toBe(6);
      expect(result.h).toBe(8);
    });

    it("allows sizes below maximum", () => {
      const constraint = maxSize(6, 8);
      const item = createItem();
      const context = createContext();

      const result = constraint.constrainSize!(item, 4, 5, "se", context);
      expect(result.w).toBe(4);
      expect(result.h).toBe(5);
    });
  });

  describe("defaultConstraints", () => {
    it("includes gridBounds and minMaxSize", () => {
      expect(defaultConstraints).toContain(gridBounds);
      expect(defaultConstraints).toContain(minMaxSize);
    });

    it("has correct order (gridBounds first)", () => {
      expect(defaultConstraints[0]).toBe(gridBounds);
      expect(defaultConstraints[1]).toBe(minMaxSize);
    });
  });

  describe("applyPositionConstraints", () => {
    it("applies constraints in order", () => {
      const item = createItem({ w: 2, h: 2 });
      const context = createContext({ cols: 12, maxRows: 10 });

      const result = applyPositionConstraints(
        [gridBounds],
        item,
        15,
        15,
        context
      );

      expect(result.x).toBe(10);
      expect(result.y).toBe(8);
    });

    it("chains multiple constraints", () => {
      const item = createItem({ w: 2, h: 2 });
      const context = createContext({ cols: 12, maxRows: 10 });

      // First gridBounds will constrain to (10, 8), then snapToGrid(2) rounds
      const result = applyPositionConstraints(
        [gridBounds, snapToGrid(3)],
        item,
        15,
        15,
        context
      );

      expect(result.x).toBe(9); // 10 snaps to 9
      expect(result.y).toBe(9); // 8 snaps to 9
    });

    it("applies per-item constraints after grid constraints", () => {
      const itemConstraint: LayoutConstraint = {
        name: "itemConstraint",
        constrainPosition: (_item, x, y) => ({ x: x + 1, y: y + 1 })
      };

      const item = createItem({
        w: 2,
        h: 2,
        constraints: [itemConstraint]
      });
      const context = createContext();

      const result = applyPositionConstraints(
        [gridBounds],
        item,
        5,
        5,
        context
      );

      // Grid constraints applied first (5, 5 is valid), then item constraint adds 1
      expect(result.x).toBe(6);
      expect(result.y).toBe(6);
    });

    it("handles empty constraints array", () => {
      const item = createItem();
      const context = createContext();

      const result = applyPositionConstraints([], item, 15, 15, context);

      // No constraints, position unchanged
      expect(result.x).toBe(15);
      expect(result.y).toBe(15);
    });

    it("skips constraints without constrainPosition", () => {
      const item = createItem();
      const context = createContext();

      // minMaxSize has no constrainPosition
      const result = applyPositionConstraints(
        [minMaxSize],
        item,
        5,
        5,
        context
      );

      expect(result.x).toBe(5);
      expect(result.y).toBe(5);
    });
  });

  describe("applySizeConstraints", () => {
    it("applies constraints in order", () => {
      const item = createItem({ x: 10, y: 8 });
      const context = createContext({ cols: 12, maxRows: 10 });

      const result = applySizeConstraints(
        [gridBounds],
        item,
        10,
        10,
        "se",
        context
      );

      expect(result.w).toBe(2); // cols - x = 12 - 10 = 2
      expect(result.h).toBe(2); // maxRows - y = 10 - 8 = 2
    });

    it("chains grid bounds and min/max", () => {
      const item = createItem({
        x: 10,
        y: 8,
        minW: 1,
        maxW: 5,
        minH: 1,
        maxH: 5
      });
      const context = createContext({ cols: 12, maxRows: 10 });

      // gridBounds limits to (2, 2), then minMaxSize should not reduce further
      const result = applySizeConstraints(
        defaultConstraints,
        item,
        10,
        10,
        "se",
        context
      );

      expect(result.w).toBe(2);
      expect(result.h).toBe(2);
    });

    it("applies per-item constraints after grid constraints", () => {
      const itemConstraint: LayoutConstraint = {
        name: "itemConstraint",
        constrainSize: (_item, w, h) => ({ w: w + 1, h: h + 1 })
      };

      const item = createItem({
        constraints: [itemConstraint]
      });
      const context = createContext();

      const result = applySizeConstraints(
        [gridBounds],
        item,
        4,
        4,
        "se",
        context
      );

      // Grid constraints applied first (4, 4 is valid), then item constraint adds 1
      expect(result.w).toBe(5);
      expect(result.h).toBe(5);
    });

    it("handles empty constraints array", () => {
      const item = createItem();
      const context = createContext();

      const result = applySizeConstraints([], item, 10, 10, "se", context);

      // No constraints, size unchanged
      expect(result.w).toBe(10);
      expect(result.h).toBe(10);
    });

    it("skips constraints without constrainSize", () => {
      const item = createItem();
      const context = createContext();

      // containerBounds has no constrainSize
      const result = applySizeConstraints(
        [containerBounds],
        item,
        5,
        5,
        "se",
        context
      );

      expect(result.w).toBe(5);
      expect(result.h).toBe(5);
    });

    it("passes resize handle to constraint", () => {
      let capturedHandle: string | null = null;
      const handleCapture: LayoutConstraint = {
        name: "handleCapture",
        constrainSize: (_item, w, h, handle) => {
          capturedHandle = handle;
          return { w, h };
        }
      };

      const item = createItem();
      const context = createContext();

      applySizeConstraints([handleCapture], item, 5, 5, "nw", context);

      expect(capturedHandle).toBe("nw");
    });
  });

  describe("LayoutConstraint interface compliance", () => {
    const constraints: LayoutConstraint[] = [
      gridBounds,
      minMaxSize,
      containerBounds,
      boundedX,
      boundedY,
      aspectRatio(1),
      snapToGrid(2),
      minSize(1, 1),
      maxSize(10, 10)
    ];

    constraints.forEach(constraint => {
      describe(`${constraint.name}`, () => {
        it("has a name property", () => {
          expect(typeof constraint.name).toBe("string");
          expect(constraint.name.length).toBeGreaterThan(0);
        });

        it("has at least one constraint method", () => {
          const hasPosition =
            typeof constraint.constrainPosition === "function";
          const hasSize = typeof constraint.constrainSize === "function";
          expect(hasPosition || hasSize).toBe(true);
        });
      });
    });
  });

  describe("Edge cases", () => {
    it("handles item larger than grid", () => {
      const item = createItem({ w: 20, h: 20 });
      const context = createContext({ cols: 12, maxRows: 10 });

      const result = gridBounds.constrainPosition!(item, 5, 5, context);

      // Position should be clamped to 0 (only valid position for oversized item)
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it("handles zero cols gracefully", () => {
      const item = createItem({ w: 2 });
      const context = createContext({ cols: 0 });

      const result = gridBounds.constrainPosition!(item, 5, 0, context);

      // Should clamp to 0
      expect(result.x).toBe(0);
    });

    it("handles Infinity maxRows", () => {
      const item = createItem({ h: 2 });
      const context = createContext({ maxRows: Infinity });

      const result = gridBounds.constrainPosition!(item, 0, 1_000_000, context);

      // Should allow any y position
      expect(result.y).toBe(1_000_000);
    });

    it("handles negative proposed values", () => {
      const item = createItem();
      const context = createContext();

      const posResult = gridBounds.constrainPosition!(item, -10, -10, context);
      expect(posResult.x).toBe(0);
      expect(posResult.y).toBe(0);

      const sizeResult = gridBounds.constrainSize!(item, -5, -5, "se", context);
      expect(sizeResult.w).toBe(1);
      expect(sizeResult.h).toBe(1);
    });
  });
});
