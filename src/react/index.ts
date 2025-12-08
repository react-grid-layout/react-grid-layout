/**
 * react-grid-layout/react
 *
 * React bindings for the grid layout system.
 * Provides hooks for building custom grid implementations.
 */

// Re-export all hooks
export * from "./hooks/index.js";

// Re-export core types that are commonly needed with hooks
export type {
  Layout,
  LayoutItem,
  CompactType,
  Position,
  DroppingPosition,
  Breakpoint,
  Breakpoints,
  ResponsiveLayouts,
  Compactor
} from "../core/types.js";

// Re-export useful core utilities
export {
  // Layout utilities
  cloneLayout,
  cloneLayoutItem,
  getLayoutItem,
  bottom,

  // Compactors
  getCompactor,
  verticalCompactor,
  horizontalCompactor,
  noCompactor,

  // Position utilities
  calcGridItemPosition,
  calcXY,
  calcWH,
  setTransform,
  setTopLeft
} from "../core/index.js";
