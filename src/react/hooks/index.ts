/**
 * React hooks for grid layout.
 *
 * These hooks provide a composable way to build grid layouts,
 * extracting state management from the class components.
 */

// Container width observation
export {
  useContainerWidth,
  type UseContainerWidthOptions,
  type UseContainerWidthResult
} from "./useContainerWidth.js";

// Core grid layout state management
export {
  useGridLayout,
  type UseGridLayoutOptions,
  type UseGridLayoutResult,
  type DragState,
  type ResizeState,
  type DropState
} from "./useGridLayout.js";

// Responsive breakpoint management
export {
  useResponsiveLayout,
  type UseResponsiveLayoutOptions,
  type UseResponsiveLayoutResult,
  type DefaultBreakpoints,
  DEFAULT_BREAKPOINTS,
  DEFAULT_COLS
} from "./useResponsiveLayout.js";
