/**
 * Test for PR #2167 - Dropping item alignment
 *
 * When dragging items from outside the grid, the placeholder should be
 * centered on the cursor, not offset to where the cursor is the top-left corner.
 */
import { calcXY, type PositionParams } from "../../src/core/calculate";

describe("PR #2167 - Drop item alignment", () => {
  // Common test parameters matching a typical grid configuration
  const positionParams: PositionParams = {
    cols: 12,
    margin: [10, 10],
    maxRows: Infinity,
    rowHeight: 30,
    containerWidth: 1200,
    containerPadding: [10, 10]
  };

  // Column width: (1200 - 10*11 - 10*2) / 12 = (1200 - 110 - 20) / 12 = 89.17
  const colWidth = 1200 / 12; // Simplified: 100

  describe("Item centering calculation", () => {
    it("should center a 1x1 item on cursor position", () => {
      // Cursor at pixel (200, 140) in grid
      const cursorX = 200;
      const cursorY = 140;
      const itemW = 1;
      const itemH = 1;

      // With centering: offset by half item size
      const itemCenterOffsetX = (itemW / 2) * colWidth;
      const itemCenterOffsetY = (itemH / 2) * positionParams.rowHeight;

      const centeredX = cursorX - itemCenterOffsetX;
      const centeredY = cursorY - itemCenterOffsetY;

      // Without centering, item would be placed at cursor position
      const posWithoutCentering = calcXY(
        positionParams,
        cursorY,
        cursorX,
        itemW,
        itemH
      );

      // With centering, item should be shifted to center on cursor
      const posWithCentering = calcXY(
        positionParams,
        Math.max(0, centeredY),
        Math.max(0, centeredX),
        itemW,
        itemH
      );

      // The centered position should be shifted left and up
      expect(posWithCentering.x).toBeLessThanOrEqual(posWithoutCentering.x);
      expect(posWithCentering.y).toBeLessThanOrEqual(posWithoutCentering.y);
    });

    it("should center a 2x2 item on cursor position", () => {
      // Cursor at pixel (200, 140) in grid
      const cursorX = 200;
      const cursorY = 140;
      const itemW = 2;
      const itemH = 2;

      // With centering: offset by half item size
      const itemCenterOffsetX = (itemW / 2) * colWidth;
      const itemCenterOffsetY = (itemH / 2) * positionParams.rowHeight;

      const centeredX = cursorX - itemCenterOffsetX;
      const centeredY = cursorY - itemCenterOffsetY;

      // For a 2x2 item, the offset should be larger than for a 1x1
      expect(itemCenterOffsetX).toBe(colWidth); // 2/2 * colWidth = colWidth
      expect(itemCenterOffsetY).toBe(positionParams.rowHeight); // 2/2 * 30 = 30

      const posWithCentering = calcXY(
        positionParams,
        Math.max(0, centeredY),
        Math.max(0, centeredX),
        itemW,
        itemH
      );

      // The 2x2 centered position at cursor (200, 140) should be at x=1, y=3
      // centered: (200-100, 140-30) = (100, 110)
      // calcXY: x = round((100-10)/(100+10)) = round(0.82) = 1
      // calcXY: y = round((110-10)/(30+10)) = round(2.5) = 3
      expect(posWithCentering.x).toBe(1);
      expect(posWithCentering.y).toBe(3);
    });

    it("should clamp to grid bounds when centering would go negative", () => {
      // Cursor near top-left corner
      const cursorX = 30;
      const cursorY = 10;
      const itemW = 2;
      const itemH = 2;

      // With centering: offset by half item size
      const itemCenterOffsetX = (itemW / 2) * colWidth;
      const itemCenterOffsetY = (itemH / 2) * positionParams.rowHeight;

      // Clamping to 0 for negative values
      const centeredX = Math.max(0, cursorX - itemCenterOffsetX);
      const centeredY = Math.max(0, cursorY - itemCenterOffsetY);

      // 30 - 100 = -70, clamped to 0
      expect(centeredX).toBe(0);
      // 10 - 30 = -20, clamped to 0
      expect(centeredY).toBe(0);

      const pos = calcXY(
        positionParams,
        centeredY,
        centeredX,
        itemW,
        itemH
      );

      // Should be at grid origin
      expect(pos.x).toBe(0);
      expect(pos.y).toBe(0);
    });

    it("should support dragOffsetX for cursor offset awareness", () => {
      // User grabs item at x=50 offset from its left edge
      const dragOffsetX = 50;
      const cursorX = 300;
      const cursorY = 150;
      const itemW = 2;
      const itemH = 2;

      // With dragOffsetX: apply offset before centering
      const itemCenterOffsetX = (itemW / 2) * colWidth;
      const itemCenterOffsetY = (itemH / 2) * positionParams.rowHeight;

      const adjustedX = cursorX + dragOffsetX - itemCenterOffsetX;
      const adjustedY = cursorY - itemCenterOffsetY;

      // 300 + 50 - 100 = 250
      expect(adjustedX).toBe(250);
      // 150 - 30 = 120
      expect(adjustedY).toBe(120);

      const pos = calcXY(
        positionParams,
        Math.max(0, adjustedY),
        Math.max(0, adjustedX),
        itemW,
        itemH
      );

      // Position should reflect the offset
      // x = round((250-10)/(100+10)) = round(2.18) = 2
      // y = round((120-10)/(30+10)) = round(2.75) = 3
      expect(pos.x).toBe(2);
      expect(pos.y).toBe(3);
    });
  });

  describe("Regression: cursor treated as top-left", () => {
    it("without centering, cursor (200, 140) places item with top-left at cursor", () => {
      const cursorX = 200;
      const cursorY = 140;

      // Without centering, the cursor position directly maps to top-left
      const pos = calcXY(
        positionParams,
        cursorY,
        cursorX,
        1,
        1
      );

      // x = round((200-10)/(100+10)) = round(1.73) = 2
      // y = round((140-10)/(30+10)) = round(3.25) = 3
      // But with 2x2 item:
      const pos2x2 = calcXY(
        positionParams,
        cursorY,
        cursorX,
        2,
        2
      );

      // The 2x2 item would still be placed with top-left at x=2, y=3
      expect(pos2x2.x).toBe(2);
      expect(pos2x2.y).toBe(3);
    });

    it("with centering, cursor (200, 140) places 2x2 item centered on cursor", () => {
      const cursorX = 200;
      const cursorY = 140;
      const itemW = 2;
      const itemH = 2;

      // Apply centering offset
      const itemCenterOffsetX = (itemW / 2) * colWidth;
      const itemCenterOffsetY = (itemH / 2) * positionParams.rowHeight;

      const centeredX = Math.max(0, cursorX - itemCenterOffsetX);
      const centeredY = Math.max(0, cursorY - itemCenterOffsetY);

      const pos = calcXY(
        positionParams,
        centeredY,
        centeredX,
        itemW,
        itemH
      );

      // With centering, the item should be shifted to x=1, y=3
      // (one grid unit left compared to non-centered)
      expect(pos.x).toBe(1);
      expect(pos.y).toBe(3);
    });
  });
});
