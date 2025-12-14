/**
 * Test for PR #2167 - Dropping item alignment
 *
 * When dragging items from outside the grid, the placeholder should be
 * centered on the cursor, not offset to where the cursor is the top-left corner.
 */
import {
  calcXY,
  calcGridColWidth,
  calcGridItemWHPx,
  type PositionParams
} from "../../src/core/calculate";

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

  // Correct column width calculation:
  // (containerWidth - margin[0] * (cols - 1) - containerPadding[0] * 2) / cols
  // (1200 - 10*11 - 10*2) / 12 = (1200 - 110 - 20) / 12 = 1070/12 ≈ 89.17
  const actualColWidth = calcGridColWidth(positionParams);

  describe("Correct column width calculation", () => {
    it("should calculate column width accounting for margins and padding", () => {
      // Expected: (1200 - 110 - 20) / 12 = 89.166...
      expect(actualColWidth).toBeCloseTo(89.167, 2);
    });

    it("should calculate item pixel width including inter-cell margins", () => {
      // 2-wide item: 2 cells + 1 margin between
      // 2 * 89.167 + 1 * 10 = 188.33
      const itemPixelWidth = calcGridItemWHPx(2, actualColWidth, 10);
      expect(itemPixelWidth).toBeCloseTo(188, 0);
    });
  });

  describe("Item centering calculation with correct dimensions", () => {
    it("should center a 1x1 item on cursor position", () => {
      const cursorX = 200;
      const cursorY = 140;
      const itemW = 1;
      const itemH = 1;

      // Calculate item pixel size
      const itemPixelWidth = calcGridItemWHPx(itemW, actualColWidth, 10);
      const itemPixelHeight = calcGridItemWHPx(itemH, positionParams.rowHeight, 10);

      // Centering offset
      const itemCenterOffsetX = itemPixelWidth / 2;
      const itemCenterOffsetY = itemPixelHeight / 2;

      const centeredX = Math.max(0, cursorX - itemCenterOffsetX);
      const centeredY = Math.max(0, cursorY - itemCenterOffsetY);

      const posWithCentering = calcXY(
        positionParams,
        centeredY,
        centeredX,
        itemW,
        itemH
      );

      // With centering, the position should be shifted
      // centeredX = 200 - 44.58 ≈ 155.42
      // centeredY = 140 - 15 = 125
      // x = round((155.42-10)/(89.17+10)) = round(1.47) = 1
      // y = round((125-10)/(30+10)) = round(2.875) = 3
      expect(posWithCentering.x).toBe(1);
      expect(posWithCentering.y).toBe(3);
    });

    it("should center a 2x2 item on cursor position", () => {
      const cursorX = 300;
      const cursorY = 200;
      const itemW = 2;
      const itemH = 2;

      // Calculate item pixel size (includes margin between cells)
      const itemPixelWidth = calcGridItemWHPx(itemW, actualColWidth, 10);
      const itemPixelHeight = calcGridItemWHPx(itemH, positionParams.rowHeight, 10);

      // For 2x2: width = 2*89.17 + 1*10 = 188.33, height = 2*30 + 1*10 = 70
      expect(itemPixelWidth).toBeCloseTo(188, 0);
      expect(itemPixelHeight).toBe(70);

      const itemCenterOffsetX = itemPixelWidth / 2;
      const itemCenterOffsetY = itemPixelHeight / 2;

      const centeredX = Math.max(0, cursorX - itemCenterOffsetX);
      const centeredY = Math.max(0, cursorY - itemCenterOffsetY);

      const pos = calcXY(
        positionParams,
        centeredY,
        centeredX,
        itemW,
        itemH
      );

      // centeredX = 300 - 94.17 ≈ 205.83
      // centeredY = 200 - 35 = 165
      // x = round((205.83-10)/(89.17+10)) = round(1.97) = 2
      // y = round((165-10)/(30+10)) = round(3.875) = 4
      expect(pos.x).toBe(2);
      expect(pos.y).toBe(4);
    });

    it("should clamp to grid bounds when centering would go negative", () => {
      const cursorX = 50;
      const cursorY = 20;
      const itemW = 2;
      const itemH = 2;

      const itemPixelWidth = calcGridItemWHPx(itemW, actualColWidth, 10);
      const itemPixelHeight = calcGridItemWHPx(itemH, positionParams.rowHeight, 10);

      const centeredX = Math.max(0, cursorX - itemPixelWidth / 2);
      const centeredY = Math.max(0, cursorY - itemPixelHeight / 2);

      // 50 - 94.17 = -44.17, clamped to 0
      expect(centeredX).toBe(0);
      // 20 - 35 = -15, clamped to 0
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
  });

  describe("Cursor offset awareness", () => {
    it("should support dragOffsetX for horizontal cursor offset", () => {
      const dragOffsetX = 50;
      const cursorX = 300;
      const cursorY = 150;
      const itemW = 2;
      const itemH = 2;

      const itemPixelWidth = calcGridItemWHPx(itemW, actualColWidth, 10);
      const itemPixelHeight = calcGridItemWHPx(itemH, positionParams.rowHeight, 10);

      const adjustedX = cursorX + dragOffsetX - itemPixelWidth / 2;
      const adjustedY = cursorY - itemPixelHeight / 2;

      const pos = calcXY(
        positionParams,
        Math.max(0, adjustedY),
        Math.max(0, adjustedX),
        itemW,
        itemH
      );

      // adjustedX = 300 + 50 - 94.17 = 255.83
      // adjustedY = 150 - 35 = 115
      // x = round((255.83-10)/(89.17+10)) = round(2.48) = 2
      // y = round((115-10)/(30+10)) = round(2.625) = 3
      expect(pos.x).toBe(2);
      expect(pos.y).toBe(3);
    });

    it("should support dragOffsetY for vertical cursor offset", () => {
      const dragOffsetX = 0;
      const dragOffsetY = 30;
      const cursorX = 300;
      const cursorY = 150;
      const itemW = 2;
      const itemH = 2;

      const itemPixelWidth = calcGridItemWHPx(itemW, actualColWidth, 10);
      const itemPixelHeight = calcGridItemWHPx(itemH, positionParams.rowHeight, 10);

      const adjustedX = cursorX + dragOffsetX - itemPixelWidth / 2;
      const adjustedY = cursorY + dragOffsetY - itemPixelHeight / 2;

      const pos = calcXY(
        positionParams,
        Math.max(0, adjustedY),
        Math.max(0, adjustedX),
        itemW,
        itemH
      );

      // adjustedX = 300 + 0 - 94.17 = 205.83
      // adjustedY = 150 + 30 - 35 = 145
      // x = round((205.83-10)/(89.17+10)) = round(1.97) = 2
      // y = round((145-10)/(30+10)) = round(3.375) = 3
      expect(pos.x).toBe(2);
      expect(pos.y).toBe(3);
    });
  });

  describe("Grid with different margins", () => {
    it("should handle zero margins correctly", () => {
      const zeroMarginParams: PositionParams = {
        cols: 12,
        margin: [0, 0],
        maxRows: Infinity,
        rowHeight: 30,
        containerWidth: 1200,
        containerPadding: [0, 0]
      };

      const colWidthNoMargin = calcGridColWidth(zeroMarginParams);
      expect(colWidthNoMargin).toBe(100); // 1200 / 12

      const itemW = 2;
      const itemH = 2;
      const cursorX = 300;
      const cursorY = 150;

      const itemPixelWidth = calcGridItemWHPx(itemW, colWidthNoMargin, 0);
      const itemPixelHeight = calcGridItemWHPx(itemH, 30, 0);

      // Without margins: 2 * 100 = 200, 2 * 30 = 60
      expect(itemPixelWidth).toBe(200);
      expect(itemPixelHeight).toBe(60);

      const centeredX = cursorX - itemPixelWidth / 2;
      const centeredY = cursorY - itemPixelHeight / 2;

      const pos = calcXY(
        zeroMarginParams,
        Math.max(0, centeredY),
        Math.max(0, centeredX),
        itemW,
        itemH
      );

      // centeredX = 300 - 100 = 200
      // centeredY = 150 - 30 = 120
      // x = round(200/100) = 2
      // y = round(120/30) = 4
      expect(pos.x).toBe(2);
      expect(pos.y).toBe(4);
    });

    it("should handle large margins correctly", () => {
      const largeMarginParams: PositionParams = {
        cols: 12,
        margin: [20, 20],
        maxRows: Infinity,
        rowHeight: 30,
        containerWidth: 1200,
        containerPadding: [20, 20]
      };

      const colWidthLargeMargin = calcGridColWidth(largeMarginParams);
      // (1200 - 20*11 - 20*2) / 12 = (1200 - 220 - 40) / 12 = 940/12 ≈ 78.33
      expect(colWidthLargeMargin).toBeCloseTo(78.33, 1);

      const itemW = 2;
      const itemH = 2;

      const itemPixelWidth = calcGridItemWHPx(itemW, colWidthLargeMargin, 20);
      const itemPixelHeight = calcGridItemWHPx(itemH, 30, 20);

      // 2 * 78.33 + 1 * 20 = 176.67
      // 2 * 30 + 1 * 20 = 80
      expect(itemPixelWidth).toBeCloseTo(177, 0);
      expect(itemPixelHeight).toBe(80);
    });
  });
});
