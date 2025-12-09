/**
 * Legacy ReactGridLayout wrapper
 *
 * This component wraps the new TypeScript GridLayout to provide
 * backwards compatibility with the v1 API.
 */

import {
  GridLayout,
  type GridLayoutProps
} from "../react/components/GridLayout.js";
import type { CompactType } from "../core/types.js";

// ============================================================================
// Legacy Props Interface
// ============================================================================

export interface LegacyReactGridLayoutProps extends GridLayoutProps {
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
 * ReactGridLayout - Legacy wrapper component
 *
 * Wraps the new TypeScript GridLayout component while maintaining
 * backwards compatibility with the v1 API.
 */
function ReactGridLayout(props: LegacyReactGridLayoutProps) {
  const { verticalCompact, compactType: compactTypeProp, ...rest } = props;

  // Handle deprecated verticalCompact prop
  // Use === undefined check instead of ?? because null is a valid compactType value
  let compactType: CompactType =
    compactTypeProp === undefined ? "vertical" : compactTypeProp;
  if (verticalCompact === false) {
    if (process.env["NODE_ENV"] !== "production") {
      console.warn(
        "`verticalCompact` on <ReactGridLayout> is deprecated and will be removed soon. " +
          'Use `compactType`: "horizontal" | "vertical" | null.'
      );
    }
    compactType = null;
  }

  return <GridLayout compactType={compactType} {...rest} />;
}

// Static properties for backwards compatibility
ReactGridLayout.displayName = "ReactGridLayout";

export default ReactGridLayout;
export { ReactGridLayout };
