/**
 * CrossGridDragProvider
 *
 * Wrap multiple GridLayout instances with this provider to enable seamless
 * drag-and-drop between them.  Each child grid must pass a unique `gridId`
 * via its `crossGridConfig` prop.
 *
 * @example
 * ```tsx
 * <CrossGridDragProvider>
 *   <GridLayout crossGridConfig={{ gridId: "left", ... }} ... />
 *   <GridLayout crossGridConfig={{ gridId: "right", ... }} ... />
 * </CrossGridDragProvider>
 * ```
 */

import React, { useState, useRef, useCallback, useMemo } from "react";

import { CrossGridDragContext } from "./CrossGridDragContext.js";
import type {
  CrossGridDragState,
  CrossGridGridRegistration
} from "./CrossGridDragContext.js";

// ============================================================================
// Props
// ============================================================================

export interface CrossGridDragProviderProps {
  children: React.ReactNode;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Context provider that coordinates cross-grid drag-and-drop.
 *
 * Place this component as a common ancestor of all GridLayout instances that
 * should participate in cross-grid drag.  Only grids that pass a
 * `crossGridConfig` prop opt in — other grids behave normally.
 */
export function CrossGridDragProvider({
  children
}: CrossGridDragProviderProps): React.ReactElement {
  // Active drag state — updated on every mouse-move frame during a cross-grid drag.
  const [dragState, setDragState] = useState<CrossGridDragState | null>(null);

  // Keep a ref so stable callbacks can read the latest state without stale closures.
  const dragStateRef = useRef<CrossGridDragState | null>(null);
  dragStateRef.current = dragState;

  // Registry of all mounted GridLayout instances that opted into cross-grid drag.
  const gridRegistry = useRef<Map<string, CrossGridGridRegistration>>(
    new Map()
  );

  // ============================================================================
  // Stable Callbacks
  // ============================================================================

  /**
   * Called by each GridLayout on mount to register itself.
   * Returns a cleanup function that the caller should invoke on unmount.
   */
  const registerGrid = useCallback(
    (id: string, registration: CrossGridGridRegistration): (() => void) => {
      if (
        process.env["NODE_ENV"] !== "production" &&
        gridRegistry.current.has(id)
      ) {
        console.warn(
          `[CrossGridDragProvider] Duplicate gridId "${id}" detected. ` +
            `Each grid within a CrossGridDragProvider must have a unique gridId.`
        );
      }
      gridRegistry.current.set(id, registration);
      return () => {
        gridRegistry.current.delete(id);
      };
    },
    []
  );

  /**
   * Publish or clear the current drag state.
   * Called by the source grid's onDragStart / onDrag / onDragStop handlers.
   */
  const publishDrag = useCallback((state: CrossGridDragState | null): void => {
    setDragState(state);
  }, []);

  /**
   * Return the gridId of the registered grid whose container rect contains
   * (clientX, clientY), excluding `excludeId` (the source grid).
   * Returns null if no peer grid is under the cursor.
   */
  const getActiveTarget = useCallback(
    (clientX: number, clientY: number, excludeId: string): string | null => {
      for (const [id, registration] of gridRegistry.current) {
        if (id === excludeId) continue;
        const rect = registration.getRect();
        if (!rect) continue;
        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        ) {
          return id;
        }
      }
      return null;
    },
    []
  );

  /**
   * Forward the drop event to the target grid.
   * `clientX`/`clientY` are forwarded directly from the mouseup event so the
   * target always receives the exact release-frame coordinates regardless of
   * whether React has flushed the final drag-state update yet.
   */
  const notifyDrop = useCallback(
    (targetGridId: string, clientX: number, clientY: number): void => {
      const current = dragStateRef.current;
      if (!current) return;
      const target = gridRegistry.current.get(targetGridId);
      if (!target) return;
      target.onIncomingDrop(current.item, clientX, clientY);
    },
    []
  );

  // ============================================================================
  // Context Value
  // ============================================================================

  // Memoize so registered grids only re-render when dragState actually changes.
  const contextValue = useMemo(
    () => ({
      dragState,
      registerGrid,
      publishDrag,
      getActiveTarget,
      notifyDrop
    }),
    [dragState, registerGrid, publishDrag, getActiveTarget, notifyDrop]
  );

  return (
    <CrossGridDragContext.Provider value={contextValue}>
      {children}
    </CrossGridDragContext.Provider>
  );
}
