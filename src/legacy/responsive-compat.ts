/**
 * Legacy responsiveUtils compatibility layer
 *
 * Re-exports types and functions from the new TypeScript implementation
 * to maintain backwards compatibility with imports from lib/responsiveUtils.
 */

import type { Layout, ResponsiveLayouts } from "../core/types.js";

// Re-export types from core
export type {
  Breakpoint,
  Breakpoints,
  ResponsiveLayouts
} from "../core/types.js";

// Legacy type aliases
export type ResponsiveLayout<T extends string> = ResponsiveLayouts<T>;
export type DefaultBreakpoints = "lg" | "md" | "sm" | "xs" | "xxs";

// Callback type for layout changes
export type OnLayoutChangeCallback = (
  layout: Layout,
  layouts: Record<string, Layout>
) => void;

// Re-export functions from responsive module
export {
  getBreakpointFromWidth,
  getColsFromBreakpoint,
  findOrGenerateResponsiveLayout,
  sortBreakpoints
} from "../core/responsive.js";
