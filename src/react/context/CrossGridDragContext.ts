/**
 * CrossGridDragContext
 *
 * Internal React context that coordinates drag state across multiple GridLayout
 * instances wrapped in a CrossGridDragProvider.
 *
 * Consumers should use the `useCrossGridDrag` hook rather than accessing this
 * context directly.
 */

import { createContext } from "react";
import type { LayoutItem } from "../../core/types.js";

// ============================================================================
// Shared State Types
// ============================================================================

/**
 * Snapshot of an in-flight cross-grid drag operation published by the source
 * grid on every mouse-move frame.
 */
export interface CrossGridDragState {
  /** The `gridId` of the grid where the drag originated. */
  sourceGridId: string;

  /** The layout item currently being dragged. */
  item: LayoutItem;

  /** Current cursor X position in viewport coordinates. */
  clientX: number;

  /** Current cursor Y position in viewport coordinates. */
  clientY: number;
}

// ============================================================================
// Grid Registration
// ============================================================================

/**
 * Functions registered by each GridLayout with the provider so the provider
 * can hit-test cursor positions and forward incoming drop events.
 */
export interface CrossGridGridRegistration {
  /**
   * Returns the grid container's bounding rect in viewport coordinates.
   * Called on every drag frame for hit-testing; must be cheap (reads from DOM).
   */
  getRect: () => DOMRect | null;

  /**
   * Called by the provider when an item from a peer grid is dropped on this
   * grid.  The implementation lives inside `GridLayout` and handles placing
   * the item into the target layout.
   */
  onIncomingDrop: (item: LayoutItem, clientX: number, clientY: number) => void;
}

// ============================================================================
// Context Value
// ============================================================================

/**
 * Value exposed by CrossGridDragContext.
 * All methods are stable references (created with useCallback / useRef).
 */
export interface CrossGridDragContextValue {
  /** Current drag state, or null when no cross-grid drag is in progress. */
  dragState: CrossGridDragState | null;

  /**
   * Register a grid with the provider.
   * @returns An unregister function — call it in a useEffect cleanup.
   */
  registerGrid: (
    id: string,
    registration: CrossGridGridRegistration
  ) => () => void;

  /**
   * Publish or clear the current drag state.
   * Called by the source grid on every onDragStart / onDrag / onDragStop.
   */
  publishDrag: (state: CrossGridDragState | null) => void;

  /**
   * Given a viewport cursor position, return the gridId of the registered grid
   * whose bounding rect contains the cursor, excluding `excludeId`.
   * Returns null if no grid matches.
   */
  getActiveTarget: (
    clientX: number,
    clientY: number,
    excludeId: string
  ) => string | null;

  /**
   * Notify a peer grid that the dragged item was dropped on it.
   * Reads the current dragState to get the item and cursor coordinates.
   */
  notifyDrop: (targetGridId: string) => void;
}

// ============================================================================
// Context
// ============================================================================

/**
 * The context itself.  Default value is null — consumers that call
 * `useContext(CrossGridDragContext)` outside a provider will receive null,
 * which the `useCrossGridDrag` hook treats as "no provider, all no-ops".
 */
export const CrossGridDragContext =
  createContext<CrossGridDragContextValue | null>(null);
