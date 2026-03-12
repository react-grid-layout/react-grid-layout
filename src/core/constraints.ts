/**
 * Pluggable layout constraints for react-grid-layout v2
 *
 * Constraints control position and size limits during drag/resize operations.
 * They are composable, tree-shakeable, and can be applied at grid or item level.
 */

import type {
  LayoutItem,
  LayoutConstraint,
  ConstraintContext,
  ResizeHandleAxis
} from "./types.js";

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Clamp a value between min and max bounds.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ============================================================================
// Built-in Constraints
// ============================================================================

/**
 * Grid boundary constraint.
 *
 * Ensures items stay within the grid bounds (0 to cols-w for x, 0 to maxRows-h for y).
 * This is the default position constraint.
 */
export const gridBounds: LayoutConstraint = {
  name: "gridBounds",

  constrainPosition(
    item: LayoutItem,
    x: number,
    y: number,
    { cols, maxRows }: ConstraintContext
  ): { x: number; y: number } {
    return {
      x: clamp(x, 0, Math.max(0, cols - item.w)),
      y: clamp(y, 0, Math.max(0, maxRows - item.h))
    };
  },

  constrainSize(
    item: LayoutItem,
    w: number,
    h: number,
    handle: ResizeHandleAxis,
    { cols, maxRows }: ConstraintContext
  ): { w: number; h: number } {
    // For west-side resizes (w, nw, sw), max width is limited by the right edge position
    // because the item expands leftward (x decreases as w increases)
    const maxW =
      handle === "w" || handle === "nw" || handle === "sw"
        ? item.x + item.w // right edge = x + w, can expand left to x=0
        : cols - item.x; // can expand right to cols

    // For north-side resizes (n, nw, ne), max height is limited by the bottom edge position
    // because the item expands upward (y decreases as h increases)
    const maxH =
      handle === "n" || handle === "nw" || handle === "ne"
        ? item.y + item.h // bottom edge = y + h, can expand up to y=0
        : maxRows - item.y; // can expand down to maxRows

    return {
      w: clamp(w, 1, Math.max(1, maxW)),
      h: clamp(h, 1, Math.max(1, maxH))
    };
  }
};

/**
 * Min/max size constraint.
 *
 * Enforces per-item minW/maxW/minH/maxH properties.
 * This is applied by default after gridBounds.
 */
export const minMaxSize: LayoutConstraint = {
  name: "minMaxSize",

  constrainSize(
    item: LayoutItem,
    w: number,
    h: number
  ): { w: number; h: number } {
    return {
      w: clamp(w, item.minW ?? 1, item.maxW ?? Infinity),
      h: clamp(h, item.minH ?? 1, item.maxH ?? Infinity)
    };
  }
};

/**
 * Container bounds constraint.
 *
 * Constrains items to stay within the visible container.
 * Use this as a replacement for the legacy `isBounded` prop.
 *
 * Unlike gridBounds which uses maxRows (which may be Infinity),
 * this constraint calculates visible rows from the actual container height.
 * Falls back to maxRows if containerHeight is 0 (auto-height grids).
 */
export const containerBounds: LayoutConstraint = {
  name: "containerBounds",

  constrainPosition(
    item: LayoutItem,
    x: number,
    y: number,
    { cols, maxRows, containerHeight, rowHeight, margin }: ConstraintContext
  ): { x: number; y: number } {
    // Calculate visible rows from container height
    // Formula: containerHeight = rows * rowHeight + (rows - 1) * margin
    // Solving: rows = (containerHeight + margin) / (rowHeight + margin)
    const visibleRows =
      containerHeight > 0
        ? Math.floor((containerHeight + margin[1]) / (rowHeight + margin[1]))
        : maxRows;

    return {
      x: clamp(x, 0, Math.max(0, cols - item.w)),
      y: clamp(y, 0, Math.max(0, visibleRows - item.h))
    };
  }
};

/**
 * Bounded X constraint.
 *
 * Only constrains horizontal position (x-axis).
 * Items can move freely in the vertical direction.
 */
export const boundedX: LayoutConstraint = {
  name: "boundedX",

  constrainPosition(
    item: LayoutItem,
    x: number,
    y: number,
    { cols }: ConstraintContext
  ): { x: number; y: number } {
    return {
      x: clamp(x, 0, Math.max(0, cols - item.w)),
      y
    };
  }
};

/**
 * Bounded Y constraint.
 *
 * Only constrains vertical position (y-axis).
 * Items can move freely in the horizontal direction.
 */
export const boundedY: LayoutConstraint = {
  name: "boundedY",

  constrainPosition(
    item: LayoutItem,
    x: number,
    y: number,
    { maxRows }: ConstraintContext
  ): { x: number; y: number } {
    return {
      x,
      y: clamp(y, 0, Math.max(0, maxRows - item.h))
    };
  }
};

// ============================================================================
// Constraint Factories
// ============================================================================

/**
 * Create an aspect ratio constraint.
 *
 * Maintains a fixed width-to-height ratio **in pixels** during resize operations.
 * Accounts for the different pixel sizes of grid columns vs rows.
 *
 * @param ratio - Width-to-height ratio (e.g., 16/9 for widescreen, 1 for square)
 * @returns A constraint that enforces the aspect ratio
 *
 * @example
 * ```typescript
 * // 16:9 aspect ratio (actual pixel proportions)
 * const layout = [
 *   { i: 'video', x: 0, y: 0, w: 4, h: 2, constraints: [aspectRatio(16/9)] }
 * ];
 *
 * // Square items (in pixels, not grid units)
 * <GridLayout constraints={[gridBounds, minMaxSize, aspectRatio(1)]} />
 * ```
 */
export function aspectRatio(ratio: number): LayoutConstraint {
  return {
    name: `aspectRatio(${ratio})`,

    constrainSize(
      _item: LayoutItem,
      w: number,
      _h: number,
      _handle: ResizeHandleAxis,
      context: ConstraintContext
    ): { w: number; h: number } {
      const { cols, containerWidth, rowHeight, margin } = context;
      // Calculate column width in pixels
      // colWidth = (containerWidth - margin[0] * (cols - 1)) / cols
      // Note: simplified formula assumes no container padding
      const colWidth = (containerWidth - margin[0] * (cols - 1)) / cols;

      // Calculate pixel width of the item
      // pixelWidth = colWidth * w + margin[0] * (w - 1)
      const pixelWidth = colWidth * w + margin[0] * Math.max(0, w - 1);

      // Calculate required pixel height for aspect ratio
      const pixelHeight = pixelWidth / ratio;

      // Convert pixel height back to grid units
      // pixelHeight = rowHeight * h + margin[1] * (h - 1)
      // Solving for h:
      // pixelHeight = h * (rowHeight + margin[1]) - margin[1]
      // h = (pixelHeight + margin[1]) / (rowHeight + margin[1])
      const h = Math.max(
        1,
        Math.round((pixelHeight + margin[1]) / (rowHeight + margin[1]))
      );

      return { w, h };
    }
  };
}

/**
 * Create a snap-to-grid constraint.
 *
 * Snaps positions to multiples of the specified step values.
 * Useful for aligning items to a coarser grid.
 *
 * @param stepX - Horizontal snap step in grid units
 * @param stepY - Vertical snap step in grid units (defaults to stepX)
 * @returns A constraint that snaps positions to the grid
 *
 * @example
 * ```typescript
 * // Snap to every 2 grid units
 * <GridLayout constraints={[snapToGrid(2), gridBounds]} />
 *
 * // Different horizontal and vertical snap
 * <GridLayout constraints={[snapToGrid(2, 3), gridBounds]} />
 * ```
 */
export function snapToGrid(
  stepX: number,
  stepY: number = stepX
): LayoutConstraint {
  // Validate step values to prevent division by zero or invalid snapping
  if (stepX <= 0 || stepY <= 0) {
    throw new Error(
      `snapToGrid: step values must be positive (got stepX=${stepX}, stepY=${stepY})`
    );
  }

  return {
    name: `snapToGrid(${stepX}, ${stepY})`,

    constrainPosition(
      _item: LayoutItem,
      x: number,
      y: number
    ): { x: number; y: number } {
      return {
        x: Math.round(x / stepX) * stepX,
        y: Math.round(y / stepY) * stepY
      };
    }
  };
}

/**
 * Create a minimum size constraint.
 *
 * Sets minimum width and height for all items using this constraint.
 * Useful for grid-wide minimums without setting minW/minH on each item.
 *
 * @param minW - Minimum width in grid units
 * @param minH - Minimum height in grid units
 * @returns A constraint that enforces minimum size
 */
export function minSize(minW: number, minH: number): LayoutConstraint {
  return {
    name: `minSize(${minW}, ${minH})`,

    constrainSize(
      _item: LayoutItem,
      w: number,
      h: number
    ): { w: number; h: number } {
      return {
        w: Math.max(minW, w),
        h: Math.max(minH, h)
      };
    }
  };
}

/**
 * Create a maximum size constraint.
 *
 * Sets maximum width and height for all items using this constraint.
 * Useful for grid-wide maximums without setting maxW/maxH on each item.
 *
 * @param maxW - Maximum width in grid units
 * @param maxH - Maximum height in grid units
 * @returns A constraint that enforces maximum size
 */
export function maxSize(maxW: number, maxH: number): LayoutConstraint {
  return {
    name: `maxSize(${maxW}, ${maxH})`,

    constrainSize(
      _item: LayoutItem,
      w: number,
      h: number
    ): { w: number; h: number } {
      return {
        w: Math.min(maxW, w),
        h: Math.min(maxH, h)
      };
    }
  };
}

// ============================================================================
// Default Constraints
// ============================================================================

/**
 * Default constraints applied when none are specified.
 *
 * Includes:
 * - gridBounds: Keep items within the grid
 * - minMaxSize: Respect per-item min/max constraints
 */
export const defaultConstraints: LayoutConstraint[] = [gridBounds, minMaxSize];

// ============================================================================
// Constraint Application Functions
// ============================================================================

/**
 * Apply position constraints to a proposed position.
 *
 * Constraints are applied in array order, allowing composition.
 * Grid-level constraints are applied first, then per-item constraints.
 *
 * @param constraints - Array of constraints to apply
 * @param item - The layout item being positioned
 * @param x - Proposed x position
 * @param y - Proposed y position
 * @param context - Grid context (cols, maxRows, etc.)
 * @returns Constrained position
 */
export function applyPositionConstraints(
  constraints: LayoutConstraint[],
  item: LayoutItem,
  x: number,
  y: number,
  context: ConstraintContext
): { x: number; y: number } {
  let result = { x, y };

  // Apply grid-level constraints
  for (const constraint of constraints) {
    if (constraint.constrainPosition) {
      result = constraint.constrainPosition(item, result.x, result.y, context);
    }
  }

  // Apply per-item constraints
  if (item.constraints) {
    for (const constraint of item.constraints) {
      if (constraint.constrainPosition) {
        result = constraint.constrainPosition(
          item,
          result.x,
          result.y,
          context
        );
      }
    }
  }

  return result;
}

/**
 * Apply size constraints to a proposed size.
 *
 * Constraints are applied in array order, allowing composition.
 * Grid-level constraints are applied first, then per-item constraints.
 *
 * @param constraints - Array of constraints to apply
 * @param item - The layout item being resized
 * @param w - Proposed width
 * @param h - Proposed height
 * @param handle - Which resize handle is being used
 * @param context - Grid context (cols, maxRows, etc.)
 * @returns Constrained size
 */
export function applySizeConstraints(
  constraints: LayoutConstraint[],
  item: LayoutItem,
  w: number,
  h: number,
  handle: ResizeHandleAxis,
  context: ConstraintContext
): { w: number; h: number } {
  let result = { w, h };

  // Apply grid-level constraints
  for (const constraint of constraints) {
    if (constraint.constrainSize) {
      result = constraint.constrainSize(
        item,
        result.w,
        result.h,
        handle,
        context
      );
    }
  }

  // Apply per-item constraints
  if (item.constraints) {
    for (const constraint of item.constraints) {
      if (constraint.constrainSize) {
        result = constraint.constrainSize(
          item,
          result.w,
          result.h,
          handle,
          context
        );
      }
    }
  }

  return result;
}
