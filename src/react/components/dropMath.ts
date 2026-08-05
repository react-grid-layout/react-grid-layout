/**
 * Drop position computation shared between the HTML5 drag-over pipeline
 * (handleDragOver) and the touch-to-drop adapter.
 *
 * Both event sources produce a clientX/clientY that lands somewhere over the
 * grid; this module turns that point into a grid position for the dropping
 * placeholder. It owns only the geometry — the caller decides whether to
 * create or update the placeholder.
 */

import type { DroppingPosition } from "../../core/types.js";
import type { PositionParams } from "../../core/calculate.js";
import {
  calcXY,
  calcGridColWidth,
  calcGridItemWHPx
} from "../../core/calculate.js";

export interface DropPositionInput {
  /** Cursor/finger position in viewport coordinates */
  clientX: number;
  clientY: number;
  /** The grid container element (getBoundingClientRect + scroll offset source) */
  gridElement: HTMLElement;
  /**
   * The item being dropped (size + any onDragOver overrides). Only the id and
   * dimensions are read here, so it accepts the minimal dropping-item shape.
   */
  droppingItem: { i: string; w: number; h: number };
  /** The native event carried on the DroppingPosition (drag or touch) */
  event: Event;
  /** Optional cursor offset from onDragOver (defaults to centering the item) */
  dragOffsetX?: number;
  dragOffsetY?: number;
  /** Scale applied by the position strategy (transform scale) */
  transformScale: number;
  /** Grid geometry */
  cols: number;
  margin: [number, number];
  maxRows: number;
  rowHeight: number;
  width: number;
  containerPadding: [number, number];
}

export interface DropPositionResult {
  /** The pixel position of the dropping placeholder */
  newDroppingPosition: DroppingPosition;
  /** Grid-unit coords for the placeholder layout entry */
  calculatedXY: { x: number; y: number };
}

/**
 * Compute the dropping-item position from a viewport clientX/clientY.
 *
 * Centers the item under the cursor, accounts for the grid's internal scroll
 * offset (getBoundingClientRect ignores scroll), clamps to non-negative, and
 * converts to grid units via calcXY. Mirrors the desktop handleDragOver math.
 */
export function computeDropPosition(
  input: DropPositionInput
): DropPositionResult {
  const {
    clientX,
    clientY,
    gridElement,
    droppingItem,
    event,
    dragOffsetX = 0,
    dragOffsetY = 0,
    transformScale,
    cols,
    margin,
    maxRows,
    rowHeight,
    width,
    containerPadding
  } = input;

  const gridRect = gridElement.getBoundingClientRect();

  // Calculate position params for proper column width calculation
  const positionParams: PositionParams = {
    cols,
    margin,
    maxRows,
    rowHeight,
    containerWidth: width,
    containerPadding
  };

  // Calculate actual column width accounting for margins and padding
  const actualColWidth = calcGridColWidth(positionParams);

  // Calculate item dimensions in pixels including margins between cells
  const itemPixelWidth = calcGridItemWHPx(
    droppingItem.w,
    actualColWidth,
    margin[0]
  );
  const itemPixelHeight = calcGridItemWHPx(
    droppingItem.h,
    rowHeight,
    margin[1]
  );

  // Center the dropping item by offsetting by half its size
  const itemCenterOffsetX = itemPixelWidth / 2;
  const itemCenterOffsetY = itemPixelHeight / 2;

  // Calculate mouse position relative to grid, accounting for drag offset
  // and item centering. Add the grid's own scroll offset: getBoundingClientRect
  // reports the element's viewport position, which ignores internal scroll,
  // so a scrolled grid would place the drop above the cursor (#2143).
  const scrollLeft = gridElement.scrollLeft ?? 0;
  const scrollTop = gridElement.scrollTop ?? 0;
  const rawGridX =
    clientX - gridRect.left + scrollLeft + dragOffsetX - itemCenterOffsetX;
  const rawGridY =
    clientY - gridRect.top + scrollTop + dragOffsetY - itemCenterOffsetY;

  // Clamp to prevent negative positions (calcXY handles upper bound clamping)
  const clampedGridX = Math.max(0, rawGridX);
  const clampedGridY = Math.max(0, rawGridY);

  const newDroppingPosition: DroppingPosition = {
    left: clampedGridX / transformScale,
    top: clampedGridY / transformScale,
    e: event
  };

  const calculatedXY = calcXY(
    positionParams,
    clampedGridY,
    clampedGridX,
    droppingItem.w,
    droppingItem.h
  );

  return {
    newDroppingPosition,
    calculatedXY
  };
}
