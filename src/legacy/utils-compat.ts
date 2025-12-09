/**
 * Legacy utils compatibility layer
 *
 * Re-exports types and functions from the new TypeScript implementation
 * to maintain backwards compatibility with imports from lib/utils.
 */

import React, { type ReactNode } from "react";
import { deepEqual } from "fast-equals";

import type { Layout, LayoutItem, CompactType } from "../core/types.js";
import { compact } from "../core/compact-compat.js";
import {
  cloneLayoutItem,
  bottom as bottomFn,
  correctBounds
} from "../core/layout.js";

// Re-export types from core
export type {
  Layout,
  LayoutItem,
  CompactType,
  ResizeHandleAxis,
  Position,
  DroppingPosition,
  GridDragEvent,
  GridResizeEvent
} from "../core/types.js";

// Legacy type alias
export type ReactChildren = ReactNode;

// Re-export layout functions
export {
  cloneLayout,
  cloneLayoutItem,
  getLayoutItem,
  bottom,
  correctBounds,
  validateLayout,
  moveElement,
  withLayoutItem,
  moveElementAwayFromCollision
} from "../core/layout.js";

// Re-export collision functions
export {
  collides,
  getFirstCollision,
  getAllCollisions
} from "../core/collision.js";

// Re-export compact function
export { compact } from "../core/compact-compat.js";

// Re-export sort functions
export { sortLayoutItems, sortLayoutItemsByRowCol } from "../core/sort.js";

// Re-export resize function
export { resizeItemInDirection } from "../core/position.js";

// Utility function - noop
export const noop = (): void => {};

// childrenEqual function - simplified version
export function childrenEqual(a: ReactNode, b: ReactNode): boolean {
  return a === b;
}

/**
 * Legacy support for verticalCompact: false
 */
export function compactType(props?: {
  verticalCompact?: boolean;
  compactType?: CompactType;
}): CompactType {
  const { verticalCompact, compactType: ct } = props || {};
  return verticalCompact === false ? null : (ct ?? null);
}

/**
 * Fast props equality check for SCU optimization.
 *
 * This implementation matches the behavior of lib/fastRGLPropsEqual.js which:
 * - Only compares props in the propTypes list (ignores unknown props)
 * - Ignores `children` prop
 * - Uses === for primitives (string, number, bool, func)
 * - Uses isEqualImpl for objects/arrays
 */
export function fastRGLPropsEqual(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
  isEqualImpl: typeof deepEqual = deepEqual
): boolean {
  if (a === b) return true;

  // Props that use strict equality (primitives)
  // These are: string, number, bool, func types in PropTypes
  const primitiveProps = [
    "className", // string
    "width", // number
    "autoSize", // bool
    "cols", // number
    "draggableCancel", // string
    "draggableHandle", // string
    "rowHeight", // number
    "maxRows", // number
    "isBounded", // bool
    "isDraggable", // bool
    "isResizable", // bool
    "allowOverlap", // bool
    "preventCollision", // bool
    "useCSSTransforms", // bool
    "transformScale", // number
    "isDroppable", // bool
    "onLayoutChange", // func
    "onDragStart", // func
    "onDrag", // func
    "onDragStop", // func
    "onResizeStart", // func
    "onResize", // func
    "onResizeStop", // func
    "onDrop", // func
    "onDropDragOver" // func
  ];

  // Props that use deep equality (objects/arrays)
  const deepEqualProps = [
    "style", // object
    "verticalCompact", // custom validator (function)
    "compactType", // oneOf (uses isEqualImpl)
    "layout", // custom validator
    "margin", // arrayOf
    "containerPadding", // arrayOf
    "resizeHandles", // arrayOf
    "resizeHandle", // oneOfType
    "droppingItem", // shape
    "innerRef" // any
  ];

  // Compare primitives with ===
  for (const key of primitiveProps) {
    if (a[key] !== b[key]) return false;
  }

  // Compare complex types with deep equality
  for (const key of deepEqualProps) {
    if (!isEqualImpl(a[key], b[key])) return false;
  }

  // Note: 'children' is intentionally NOT compared (excluded from comparison)

  return true;
}

/**
 * Given React children, create an initial layout from data-grid attributes.
 *
 * This matches lib/utils.js synchronizeLayoutWithChildren exactly:
 * - If item exists in layout AND no data-grid: use layout item
 * - If data-grid exists (regardless of layout): prefer data-grid
 * - If neither: create default at bottom
 */
export function synchronizeLayoutWithChildren(
  initialLayout: Layout,
  children: ReactNode,
  cols: number,
  compactType: CompactType,
  allowOverlap: boolean = false
): Layout {
  const safeInitialLayout = initialLayout || [];
  const layout: LayoutItem[] = [];

  React.Children.forEach(children, child => {
    // Child may not exist
    if (!React.isValidElement(child) || child.key == null) return;
    const key = String(child.key);

    const exists = safeInitialLayout.find(l => l.i === key);
    const childProps = child.props as { "data-grid"?: Partial<LayoutItem> };
    const g = childProps["data-grid"];

    // Don't overwrite the layout item if it's already in the initial layout.
    // If it has a `data-grid` property, prefer that over what's in the layout.
    if (exists && g == null) {
      layout.push(cloneLayoutItem(exists));
    } else if (g) {
      // Hey, this item has a data-grid property, use it.
      layout.push(
        cloneLayoutItem({
          w: g.w ?? 1,
          h: g.h ?? 1,
          x: g.x ?? 0,
          y: g.y ?? 0,
          i: key,
          minW: g.minW,
          maxW: g.maxW,
          minH: g.minH,
          maxH: g.maxH,
          static: g.static,
          isDraggable: g.isDraggable,
          isResizable: g.isResizable,
          resizeHandles: g.resizeHandles,
          isBounded: g.isBounded
        })
      );
    } else {
      // Nothing provided: ensure this is added to the bottom
      layout.push(
        cloneLayoutItem({
          w: 1,
          h: 1,
          x: 0,
          y: bottomFn(layout),
          i: key
        })
      );
    }
  });

  // Correct the layout and compact
  const correctedLayout = correctBounds(layout, { cols });
  return allowOverlap
    ? correctedLayout
    : compact(correctedLayout, compactType, cols);
}
