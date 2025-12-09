/**
 * Position calculation utilities.
 *
 * These functions convert between grid units and pixel positions,
 * and generate CSS styles for grid items.
 */

import type {
  Position,
  PartialPosition,
  ResizeHandleAxis,
  PositionStrategy
} from "./types.js";

// ============================================================================
// CSS Style Generation
// ============================================================================

/**
 * Generate CSS transform-based positioning styles.
 *
 * Using transforms is more performant than top/left positioning
 * because it doesn't trigger layout recalculations.
 *
 * @param position - Position in pixels
 * @returns CSS style object
 */
export function setTransform({
  top,
  left,
  width,
  height
}: Position): Record<string, string> {
  const translate = `translate(${left}px,${top}px)`;
  return {
    transform: translate,
    WebkitTransform: translate,
    MozTransform: translate,
    msTransform: translate,
    OTransform: translate,
    width: `${width}px`,
    height: `${height}px`,
    position: "absolute"
  };
}

/**
 * Generate CSS top/left positioning styles.
 *
 * Use this when transforms are not suitable (e.g., for printing
 * or when transform causes issues with child elements).
 *
 * @param position - Position in pixels
 * @returns CSS style object
 */
export function setTopLeft({
  top,
  left,
  width,
  height
}: Position): Record<string, string> {
  return {
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${height}px`,
    position: "absolute"
  };
}

/**
 * Convert a number to a percentage string.
 *
 * @param num - Number to convert (0-1 range typically)
 * @returns Percentage string (e.g., "50%")
 */
export function perc(num: number): string {
  return num * 100 + "%";
}

// ============================================================================
// Resize Direction Handling
// ============================================================================

/**
 * Constrain width to not overflow container.
 */
function constrainWidth(
  left: number,
  currentWidth: number,
  newWidth: number,
  containerWidth: number
): number {
  return left + newWidth > containerWidth ? currentWidth : newWidth;
}

/**
 * Constrain height to not go above container (negative top).
 */
function constrainHeight(
  top: number,
  currentHeight: number,
  newHeight: number
): number {
  return top < 0 ? currentHeight : newHeight;
}

/**
 * Constrain left to not be negative.
 */
function constrainLeft(left: number): number {
  return Math.max(0, left);
}

/**
 * Constrain top to not be negative.
 */
function constrainTop(top: number): number {
  return Math.max(0, top);
}

// Direction handlers
type ResizeHandler = (
  currentSize: Position,
  newSize: Position,
  containerWidth: number
) => Position;

const resizeNorth: ResizeHandler = (currentSize, newSize, _containerWidth) => {
  const { left, height, width } = newSize;
  const top = currentSize.top - (height - currentSize.height);

  return {
    left,
    width,
    height: constrainHeight(top, currentSize.height, height),
    top: constrainTop(top)
  };
};

const resizeEast: ResizeHandler = (currentSize, newSize, containerWidth) => {
  const { top, left, height, width } = newSize;
  return {
    top,
    height,
    width: constrainWidth(
      currentSize.left,
      currentSize.width,
      width,
      containerWidth
    ),
    left: constrainLeft(left)
  };
};

const resizeWest: ResizeHandler = (currentSize, newSize, _containerWidth) => {
  const { top, height, width } = newSize;
  const left = currentSize.left + currentSize.width - width;

  if (left < 0) {
    return {
      height,
      width: currentSize.left + currentSize.width,
      top: constrainTop(top),
      left: 0
    };
  }

  return {
    height,
    width,
    top: constrainTop(top),
    left
  };
};

const resizeSouth: ResizeHandler = (currentSize, newSize, _containerWidth) => {
  const { top, left, height, width } = newSize;
  return {
    width,
    left,
    height: constrainHeight(top, currentSize.height, height),
    top: constrainTop(top)
  };
};

// Compound directions (corners)
const resizeNorthEast: ResizeHandler = (currentSize, newSize, containerWidth) =>
  resizeNorth(
    currentSize,
    resizeEast(currentSize, newSize, containerWidth),
    containerWidth
  );

const resizeNorthWest: ResizeHandler = (currentSize, newSize, containerWidth) =>
  resizeNorth(
    currentSize,
    resizeWest(currentSize, newSize, containerWidth),
    containerWidth
  );

const resizeSouthEast: ResizeHandler = (currentSize, newSize, containerWidth) =>
  resizeSouth(
    currentSize,
    resizeEast(currentSize, newSize, containerWidth),
    containerWidth
  );

const resizeSouthWest: ResizeHandler = (currentSize, newSize, containerWidth) =>
  resizeSouth(
    currentSize,
    resizeWest(currentSize, newSize, containerWidth),
    containerWidth
  );

const resizeHandlerMap: Record<ResizeHandleAxis, ResizeHandler> = {
  n: resizeNorth,
  ne: resizeNorthEast,
  e: resizeEast,
  se: resizeSouthEast,
  s: resizeSouth,
  sw: resizeSouthWest,
  w: resizeWest,
  nw: resizeNorthWest
};

/**
 * Resize an item in a specific direction, clamping to container bounds.
 *
 * This handles the complex logic of resizing from different edges/corners,
 * ensuring the item doesn't overflow the container.
 *
 * @param direction - Which edge/corner is being dragged
 * @param currentSize - Current position and size
 * @param newSize - Requested new position and size
 * @param containerWidth - Width of the container
 * @returns Constrained position and size
 */
export function resizeItemInDirection(
  direction: ResizeHandleAxis,
  currentSize: Position,
  newSize: Position,
  containerWidth: number
): Position {
  const handler = resizeHandlerMap[direction];

  // Fallback if direction not found (shouldn't happen with proper types)
  if (!handler) {
    return newSize;
  }

  return handler(currentSize, { ...currentSize, ...newSize }, containerWidth);
}

// ============================================================================
// Position Strategies (v2 Composable Interface)
// ============================================================================

/**
 * CSS transform-based positioning strategy.
 *
 * Uses CSS transforms for positioning, which is more performant
 * as it doesn't trigger layout recalculations.
 *
 * This is the default strategy.
 */
export const transformStrategy: PositionStrategy = {
  type: "transform",
  scale: 1,

  calcStyle(pos: Position): React.CSSProperties {
    return setTransform(pos) as React.CSSProperties;
  },

  calcDragPosition(
    clientX: number,
    clientY: number,
    offsetX: number,
    offsetY: number
  ): PartialPosition {
    return {
      left: clientX - offsetX,
      top: clientY - offsetY
    };
  }
};

/**
 * Absolute (top/left) positioning strategy.
 *
 * Uses CSS top/left for positioning. Use this when CSS transforms
 * cause issues (e.g., printing, certain child element positioning).
 */
export const absoluteStrategy: PositionStrategy = {
  type: "absolute",
  scale: 1,

  calcStyle(pos: Position): React.CSSProperties {
    return setTopLeft(pos) as React.CSSProperties;
  },

  calcDragPosition(
    clientX: number,
    clientY: number,
    offsetX: number,
    offsetY: number
  ): PartialPosition {
    return {
      left: clientX - offsetX,
      top: clientY - offsetY
    };
  }
};

/**
 * Create a scaled transform strategy.
 *
 * Use this when the grid container is inside a scaled element
 * (e.g., `transform: scale(0.5)`). The scale factor adjusts
 * drag/resize calculations to account for the parent transform.
 *
 * @param scale - Scale factor (e.g., 0.5 for half size)
 * @returns Position strategy with scaled calculations
 *
 * @example
 * ```tsx
 * <div style={{ transform: 'scale(0.5)' }}>
 *   <GridLayout positionStrategy={createScaledStrategy(0.5)} />
 * </div>
 * ```
 */
export function createScaledStrategy(scale: number): PositionStrategy {
  return {
    type: "transform",
    scale,

    calcStyle(pos: Position): React.CSSProperties {
      return setTransform(pos) as React.CSSProperties;
    },

    calcDragPosition(
      clientX: number,
      clientY: number,
      offsetX: number,
      offsetY: number
    ): PartialPosition {
      return {
        left: (clientX - offsetX) / scale,
        top: (clientY - offsetY) / scale
      };
    }
  };
}

/** Default position strategy (transform-based) */
export const defaultPositionStrategy = transformStrategy;
