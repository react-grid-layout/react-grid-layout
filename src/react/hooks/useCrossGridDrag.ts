/**
 * useCrossGridDrag
 *
 * Internal hook that connects a single GridLayout instance to the
 * CrossGridDragProvider context.  It handles:
 *
 * - Registering / unregistering the grid in the provider's registry.
 * - Publishing drag state to the context on every drag frame.
 * - Committing a cross-grid drop (notify the target, return whether it was
 *   accepted by a peer grid).
 * - Exposing incoming drag state so the host GridLayout can show a ghost
 *   placeholder for items dragged from peer grids.
 *
 * When used without a CrossGridDragProvider ancestor the hook is completely
 * inert: all functions become no-ops and `incomingDragState` is always null.
 * This makes `crossGridConfig` an optional, additive feature.
 */

import { useContext, useEffect, useCallback, useRef } from "react";
import type { RefObject } from "react";

import type { LayoutItem, CrossGridConfig } from "../../core/types.js";
import { CrossGridDragContext } from "../context/CrossGridDragContext.js";
import type { CrossGridDragState } from "../context/CrossGridDragContext.js";

// ============================================================================
// Return Type
// ============================================================================

export interface UseCrossGridDragResult {
  /**
   * Publish the current drag state to the provider context.
   * Call this from onDragStart and onDrag inside GridLayout.
   */
  publishDrag: (item: LayoutItem, clientX: number, clientY: number) => void;

  /**
   * Clear the drag state from the provider context.
   * Called automatically by commitDrop; exposed for edge-case cleanup.
   */
  clearDrag: () => void;

  /**
   * Conclude a drag operation.
   *
   * Checks whether the cursor is over a peer grid:
   * - If yes: notifies the target grid, clears drag state, returns `true`.
   * - If no:  clears drag state, returns `false`.
   *
   * The caller (GridLayout's onDragStop) uses the return value to decide
   * whether to keep the item in its own layout or remove it.
   */
  commitDrop: (item: LayoutItem, clientX: number, clientY: number) => boolean;

  /**
   * Incoming drag state from a peer grid, or null when this grid is the
   * source or no cross-grid drag is active.
   *
   * GridLayout uses this to show / update / hide the incoming ghost placeholder.
   */
  incomingDragState: CrossGridDragState | null;

  /**
   * True when this grid is the SOURCE of an active cross-grid drag and the
   * cursor is currently over a registered peer grid.
   *
   * GridLayout uses this to hide its own `activeDrag` placeholder while the
   * item is visually "claimed" by the target grid, giving clear feedback that
   * the item will move rather than stay.
   */
  isDraggingOverPeer: boolean;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * @param crossGridConfig - Cross-grid configuration for this grid instance.
 *   When undefined the hook returns no-ops (safe to call unconditionally).
 * @param containerRef   - Ref to the grid's root DOM element, used to compute
 *   the bounding rect for cursor hit-testing.
 * @param onIncomingDrop - Callback invoked synchronously when the provider
 *   routes a drop from a peer grid to this one.  The implementation lives in
 *   GridLayout and applies the item to the local layout.
 */
export function useCrossGridDrag(
  crossGridConfig: CrossGridConfig | undefined,
  containerRef: RefObject<HTMLDivElement | null>,
  onIncomingDrop: (item: LayoutItem, clientX: number, clientY: number) => void
): UseCrossGridDragResult {
  const context = useContext(CrossGridDragContext);

  // Keep a stable ref to onIncomingDrop so we can update the registration
  // without tearing down and re-creating it on every render.
  const onIncomingDropRef = useRef(onIncomingDrop);
  onIncomingDropRef.current = onIncomingDrop;

  // ============================================================================
  // Registration
  // ============================================================================

  useEffect(() => {
    if (!context || !crossGridConfig) return;

    const { gridId } = crossGridConfig;

    const unregister = context.registerGrid(gridId, {
      getRect: () => containerRef.current?.getBoundingClientRect() ?? null,
      // Forward to the latest handler via the ref — avoids stale callbacks.
      onIncomingDrop: (item, clientX, clientY) => {
        onIncomingDropRef.current(item, clientX, clientY);
      }
    });

    return unregister;
    // Re-register only when the gridId changes (rare) or the context mounts.
    // onIncomingDrop is intentionally excluded — it is read from the ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, crossGridConfig?.gridId]);

  // ============================================================================
  // Stable Action Callbacks
  // ============================================================================

  const gridId = crossGridConfig?.gridId;

  const publishDrag = useCallback(
    (item: LayoutItem, clientX: number, clientY: number): void => {
      if (!context || !gridId) return;
      context.publishDrag({ sourceGridId: gridId, item, clientX, clientY });
    },
    [context, gridId]
  );

  const clearDrag = useCallback((): void => {
    context?.publishDrag(null);
  }, [context]);

  const commitDrop = useCallback(
    (_item: LayoutItem, clientX: number, clientY: number): boolean => {
      if (!context || !gridId) return false;

      const targetId = context.getActiveTarget(clientX, clientY, gridId);

      if (targetId) {
        // Notify the target synchronously before clearing state, so the target's
        // onIncomingDrop handler can read the drag state via the context ref.
        context.notifyDrop(targetId);
        context.publishDrag(null);
        return true;
      }

      context.publishDrag(null);
      return false;
    },
    [context, gridId]
  );

  // ============================================================================
  // Incoming Drag State
  // ============================================================================

  // Expose raw drag state only when it originates from a different grid AND the
  // cursor is currently within this grid's container.  Returning null whenever
  // the cursor is outside means the effect in GridLayout can use a single
  // `!incomingDragState` check to remove the ghost — no separate isOverGrid
  // block is needed.
  const rawDragState = context?.dragState ?? null;
  const incomingDragState = ((): CrossGridDragState | null => {
    if (!rawDragState || !gridId || rawDragState.sourceGridId === gridId)
      return null;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const { clientX, clientY } = rawDragState;
    return clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
      ? rawDragState
      : null;
  })();

  // True when this grid is the source and the cursor is over a peer grid.
  // Computed via getActiveTarget so it reuses the same rect hit-test logic.
  const isDraggingOverPeer =
    context != null &&
    gridId != null &&
    rawDragState != null &&
    rawDragState.sourceGridId === gridId
      ? context.getActiveTarget(
          rawDragState.clientX,
          rawDragState.clientY,
          gridId
        ) !== null
      : false;

  return {
    publishDrag,
    clearDrag,
    commitDrop,
    incomingDragState,
    isDraggingOverPeer
  };
}
