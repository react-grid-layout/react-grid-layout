/**
 * Legacy API compatibility layer
 *
 * This module provides backwards compatibility with the v1 API.
 * It exports wrapper components that use the new TypeScript implementation
 * internally while maintaining the same props interface.
 *
 * Usage:
 * import ReactGridLayout, { WidthProvider, Responsive } from 'react-grid-layout/legacy';
 */

// Export ReactGridLayout as default and named
export { default, ReactGridLayout } from "./ReactGridLayout.js";

// Export ResponsiveReactGridLayout
export {
  default as Responsive,
  ResponsiveReactGridLayout
} from "./ResponsiveReactGridLayout.js";

// Export WidthProvider HOC
export { default as WidthProvider } from "./WidthProvider.js";

// Re-export types from core
export type {
  Layout,
  LayoutItem,
  CompactType,
  ResizeHandleAxis,
  Breakpoint,
  Breakpoints,
  ResponsiveLayouts
} from "../core/types.js";

// Backwards-compatible type aliases for @types/react-grid-layout users
// In v1, `Layout` was a single item. In v2, `Layout` is an array and `LayoutItem` is a single item.
import type { LayoutItem as _LayoutItem, ResponsiveLayouts as _ResponsiveLayouts } from "../core/types.js";

/** @deprecated Use `ResponsiveLayouts` instead. Alias for backwards compatibility with @types/react-grid-layout. */
export type Layouts = _ResponsiveLayouts;

// Re-export props types
export type { LegacyReactGridLayoutProps } from "./ReactGridLayout.js";
export type { LegacyResponsiveReactGridLayoutProps } from "./ResponsiveReactGridLayout.js";
