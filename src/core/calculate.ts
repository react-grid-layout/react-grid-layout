/**
 * Grid calculation utilities.
 *
 * These functions convert between grid units and pixel positions.
 */

import type { Position, ResizeHandleAxis } from "./types.js";

// ============================================================================
// Types
// ============================================================================

/**
 * Parameters needed for position calculations.
 */
export interface PositionParams {
  readonly margin: readonly [number, number];
  readonly containerPadding: readonly [number, number];
  readonly containerWidth: number;
  readonly cols: number;
  readonly rowHeight: number;
  readonly maxRows: number;
}

// ============================================================================
// Grid Column/Row Calculations
// ============================================================================

/**
 * Calculate the width of a single grid column in pixels.
 *
 * @param positionParams - Grid parameters
 * @returns Column width in pixels
 */
export function calcGridColWidth(positionParams: PositionParams): number {
  const { margin, containerPadding, containerWidth, cols } = positionParams;
  return (
    (containerWidth - margin[0] * (cols - 1) - containerPadding[0] * 2) / cols
  );
}

/**
 * Calculate the pixel size for a grid unit dimension (width or height).
 *
 * Can be called as:
 * - calcGridItemWHPx(w, colWidth, margin[0]) for width
 * - calcGridItemWHPx(h, rowHeight, margin[1]) for height
 *
 * @param gridUnits - Size in grid units
 * @param colOrRowSize - Column width or row height in pixels
 * @param marginPx - Margin between items in pixels
 * @returns Size in pixels
 */
export function calcGridItemWHPx(
  gridUnits: number,
  colOrRowSize: number,
  marginPx: number
): number {
  // 0 * Infinity === NaN, which causes problems with resize constraints
  if (!Number.isFinite(gridUnits)) return gridUnits;
  return Math.round(
    colOrRowSize * gridUnits + Math.max(0, gridUnits - 1) * marginPx
  );
}

// ============================================================================
// Position Calculations
// ============================================================================

/**
 * Calculate pixel position for a grid item.
 *
 * Returns left, top, width, height in pixels.
 *
 * @param positionParams - Grid parameters
 * @param x - X coordinate in grid units
 * @param y - Y coordinate in grid units
 * @param w - Width in grid units
 * @param h - Height in grid units
 * @param dragPosition - If present, use exact left/top from drag callbacks
 * @param resizePosition - If present, use exact dimensions from resize callbacks
 * @returns Position in pixels
 */
export function calcGridItemPosition(
  positionParams: PositionParams,
  x: number,
  y: number,
  w: number,
  h: number,
  dragPosition?: { top: number; left: number } | null,
  resizePosition?: {
    top: number;
    left: number;
    height: number;
    width: number;
  } | null
): Position {
  const { margin, containerPadding, rowHeight } = positionParams;
  const colWidth = calcGridColWidth(positionParams);

  let width: number;
  let height: number;
  let top: number;
  let left: number;

  // If resizing, use the exact width and height from resize callbacks
  if (resizePosition) {
    width = Math.round(resizePosition.width);
    height = Math.round(resizePosition.height);
  } else {
    // Calculate from grid units
    width = calcGridItemWHPx(w, colWidth, margin[0]);
    height = calcGridItemWHPx(h, rowHeight, margin[1]);
  }

  // If dragging, use the exact left/top from drag callbacks
  if (dragPosition) {
    top = Math.round(dragPosition.top);
    left = Math.round(dragPosition.left);
  } else if (resizePosition) {
    // If resizing, use the exact left/top from resize position
    top = Math.round(resizePosition.top);
    left = Math.round(resizePosition.left);
  } else {
    // Calculate from grid units
    top = Math.round((rowHeight + margin[1]) * y + containerPadding[1]);
    left = Math.round((colWidth + margin[0]) * x + containerPadding[0]);
  }

  return { top, left, width, height };
}

/**
 * Translate pixel coordinates to grid units.
 *
 * @param positionParams - Grid parameters
 * @param top - Top position in pixels (relative to parent)
 * @param left - Left position in pixels (relative to parent)
 * @param w - Width in grid units (for clamping)
 * @param h - Height in grid units (for clamping)
 * @returns x and y in grid units
 */
export function calcXY(
  positionParams: PositionParams,
  top: number,
  left: number,
  w: number,
  h: number
): { x: number; y: number } {
  const { margin, containerPadding, cols, rowHeight, maxRows } = positionParams;
  const colWidth = calcGridColWidth(positionParams);

  // left = containerPaddingX + x * (colWidth + marginX)
  // x = (left - containerPaddingX) / (colWidth + marginX)
  let x = Math.round((left - containerPadding[0]) / (colWidth + margin[0]));
  let y = Math.round((top - containerPadding[1]) / (rowHeight + margin[1]));

  // Clamp to grid bounds
  x = clamp(x, 0, cols - w);
  y = clamp(y, 0, maxRows - h);

  return { x, y };
}

/**
 * Calculate grid units from pixel dimensions.
 *
 * @param positionParams - Grid parameters
 * @param width - Width in pixels
 * @param height - Height in pixels
 * @param x - X coordinate in grid units (for clamping)
 * @param y - Y coordinate in grid units (for clamping)
 * @param handle - Resize handle being used
 * @returns w, h in grid units
 */
export function calcWH(
  positionParams: PositionParams,
  width: number,
  height: number,
  x: number,
  y: number,
  handle: ResizeHandleAxis
): { w: number; h: number } {
  const { margin, maxRows, cols, rowHeight } = positionParams;
  const colWidth = calcGridColWidth(positionParams);

  // width = colWidth * w - (margin * (w - 1))
  // w = (width + margin) / (colWidth + margin)
  const w = Math.round((width + margin[0]) / (colWidth + margin[0]));
  const h = Math.round((height + margin[1]) / (rowHeight + margin[1]));

  // Clamp based on resize handle direction
  let _w = clamp(w, 0, cols - x);
  let _h = clamp(h, 0, maxRows - y);

  // West handles can resize to full width
  if (handle === "sw" || handle === "w" || handle === "nw") {
    _w = clamp(w, 0, cols);
  }

  // North handles can resize to full height
  if (handle === "nw" || handle === "n" || handle === "ne") {
    _h = clamp(h, 0, maxRows);
  }

  return { w: _w, h: _h };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Clamp a number between bounds.
 *
 * @param num - Number to clamp
 * @param lowerBound - Minimum value
 * @param upperBound - Maximum value
 * @returns Clamped value
 */
export function clamp(
  num: number,
  lowerBound: number,
  upperBound: number
): number {
  return Math.max(Math.min(num, upperBound), lowerBound);
}

// ============================================================================
// Grid Background Calculations
// ============================================================================

/**
 * Grid cell dimension information for rendering backgrounds or overlays.
 */
export interface GridCellDimensions {
  /** Width of a single cell in pixels */
  readonly cellWidth: number;
  /** Height of a single cell in pixels */
  readonly cellHeight: number;
  /** Horizontal offset from container edge to first cell */
  readonly offsetX: number;
  /** Vertical offset from container edge to first cell */
  readonly offsetY: number;
  /** Horizontal gap between cells */
  readonly gapX: number;
  /** Vertical gap between cells */
  readonly gapY: number;
  /** Number of columns */
  readonly cols: number;
  /** Total container width */
  readonly containerWidth: number;
}

/**
 * Configuration for grid cell dimension calculation.
 */
export interface GridCellConfig {
  /** Container width in pixels */
  width: number;
  /** Number of columns */
  cols: number;
  /** Row height in pixels */
  rowHeight: number;
  /** Margin between items [x, y] */
  margin?: readonly [number, number];
  /** Container padding [x, y], defaults to margin if not specified */
  containerPadding?: readonly [number, number] | null;
}

/**
 * Calculate grid cell dimensions for rendering backgrounds or overlays.
 *
 * This function provides all the measurements needed to render a visual
 * grid background that aligns with the actual grid cells.
 *
 * @param config - Grid configuration
 * @returns Cell dimensions and offsets
 *
 * @example
 * ```tsx
 * import { calcGridCellDimensions } from 'react-grid-layout/core';
 *
 * const dims = calcGridCellDimensions({
 *   width: 1200,
 *   cols: 12,
 *   rowHeight: 30,
 *   margin: [10, 10],
 *   containerPadding: [10, 10]
 * });
 *
 * // dims.cellWidth = 88.33...
 * // dims.cellHeight = 30
 * // dims.offsetX = 10 (containerPadding[0])
 * // dims.offsetY = 10 (containerPadding[1])
 * // dims.gapX = 10 (margin[0])
 * // dims.gapY = 10 (margin[1])
 * ```
 */
export function calcGridCellDimensions(
  config: GridCellConfig
): GridCellDimensions {
  const {
    width,
    cols,
    rowHeight,
    margin = [10, 10],
    containerPadding
  } = config;

  // Container padding defaults to margin if not specified
  const padding = containerPadding ?? margin;

  // Calculate cell width: total width minus padding and gaps, divided by columns
  // Formula: width = 2*padding + cols*cellWidth + (cols-1)*gap
  // Solving for cellWidth: cellWidth = (width - 2*padding - (cols-1)*gap) / cols
  const cellWidth = (width - padding[0] * 2 - margin[0] * (cols - 1)) / cols;
  const cellHeight = rowHeight;

  return {
    cellWidth,
    cellHeight,
    offsetX: padding[0],
    offsetY: padding[1],
    gapX: margin[0],
    gapY: margin[1],
    cols,
    containerWidth: width
  };
}
