/**
 * Legacy ResponsiveReactGridLayout wrapper
 *
 * This component wraps the new TypeScript ResponsiveGridLayout to provide
 * backwards compatibility with the v1 API.
 */

import {
  ResponsiveGridLayout,
  type ResponsiveGridLayoutProps
} from "../react/components/ResponsiveGridLayout.js";
import type { CompactType, Breakpoint } from "../core/types.js";

// ============================================================================
// Legacy Props Interface
// ============================================================================

export interface LegacyResponsiveReactGridLayoutProps<
  B extends Breakpoint = string
> extends ResponsiveGridLayoutProps<B> {
  /**
   * @deprecated Use compactType instead
   * If false, compactType will be set to null (no compaction)
   */
  verticalCompact?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ResponsiveReactGridLayout - Legacy wrapper component
 *
 * Wraps the new TypeScript ResponsiveGridLayout component while maintaining
 * backwards compatibility with the v1 API.
 */
function ResponsiveReactGridLayout<B extends Breakpoint = string>(
  props: LegacyResponsiveReactGridLayoutProps<B>
) {
  const { verticalCompact, compactType: compactTypeProp, ...rest } = props;

  // Handle deprecated verticalCompact prop
  // Use === undefined check instead of ?? because null is a valid compactType value
  let compactType: CompactType =
    compactTypeProp === undefined ? "vertical" : compactTypeProp;
  if (verticalCompact === false) {
    if (process.env["NODE_ENV"] !== "production") {
      console.warn(
        "`verticalCompact` on <ResponsiveReactGridLayout> is deprecated and will be removed soon. " +
          'Use `compactType`: "horizontal" | "vertical" | null.'
      );
    }
    compactType = null;
  }

  return (
    <ResponsiveGridLayout<B>
      compactType={compactType}
      {...(rest as ResponsiveGridLayoutProps<B>)}
    />
  );
}

// Static properties for backwards compatibility
ResponsiveReactGridLayout.displayName = "ResponsiveReactGridLayout";

export default ResponsiveReactGridLayout;
export { ResponsiveReactGridLayout, ResponsiveReactGridLayout as Responsive };
