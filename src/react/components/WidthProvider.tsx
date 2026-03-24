/**
 * WidthProvider HOC
 *
 * A Higher-Order Component that provides width measurement to grid layouts.
 * This wraps any component and provides the container width as a prop.
 */

import React, { useState, useRef, useEffect, type ComponentType } from "react";
import clsx from "clsx";

// ============================================================================
// Types
// ============================================================================

export interface WidthProviderProps {
  /** If true, will not render children until mounted */
  measureBeforeMount?: boolean;
  /** Timeout in milliseconds to delay the resizing of grid-items */
  debounceTimeout?: number;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
}

type WithWidthProps<P> = Omit<P, "width"> & WidthProviderProps;

// ============================================================================
// Constants
// ============================================================================

const layoutClassName = "react-grid-layout";

// ============================================================================
// WidthProvider HOC
// ============================================================================

/**
 * WidthProvider - HOC that provides container width
 *
 * A simple HOC that provides facility for listening to container resizes.
 * Wraps the provided component and passes down a `width` prop.
 *
 * @example
 * ```tsx
 * import { GridLayout, WidthProvider } from 'react-grid-layout';
 *
 * const GridLayoutWithWidth = WidthProvider(GridLayout);
 *
 * function MyGrid() {
 *   return (
 *     <GridLayoutWithWidth cols={12} rowHeight={30}>
 *       <div key="a">a</div>
 *     </GridLayoutWithWidth>
 *   );
 * }
 * ```
 */
export function WidthProvider<P extends { width: number }>(
  ComposedComponent: ComponentType<P>
): ComponentType<WithWidthProps<P>> {
  function WidthProviderWrapper(props: WithWidthProps<P>) {
    const { measureBeforeMount = false, debounceTimeout = 0,className, style, ...rest } = props;

    const [width, setWidth] = useState(1280);
    const [mounted, setMounted] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const rafIdRef = useRef<number | null>(null);
    const debounceTimeoutIdRef = useRef<number | null>(null);

    // Set mounted state on first render
    useEffect(() => {
      setMounted(true);
    }, []);

    // Set up ResizeObserver - re-runs when mounted changes to observe the new element
    // This fixes measureBeforeMount where the ref changes from placeholder to composed component
    useEffect(() => {
      const node = elementRef.current;
      if (!(node instanceof HTMLElement)) return;

      resizeObserverRef.current = new ResizeObserver(entries => {
        const entry = entries[0];
        if (entry) {
          // Use contentRect.width for consistent measurements
          const newWidth = entry.contentRect.width;

          // Clear any existing debounce timeout
          if (debounceTimeoutIdRef.current !== null) {
            clearTimeout(debounceTimeoutIdRef.current);
          }

          // Clear any existing RAF
          if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
          }

          // No debounce, update immediately on next RAF and return
          if (debounceTimeout <= 0) {
            // Defer state update to next paint cycle to avoid
            // "ResizeObserver loop completed with undelivered notifications" error (#1959)
            rafIdRef.current = requestAnimationFrame(() => {
              setWidth(newWidth);
              rafIdRef.current = null;
            });
            return;
          }

          // Apply debounce before RAF
          debounceTimeoutIdRef.current = window.setTimeout(() => {
            // Defer state update to next paint cycle to avoid
            // "ResizeObserver loop completed with undelivered notifications" error (#1959)
            rafIdRef.current = requestAnimationFrame(() => {
              setWidth(newWidth);
              rafIdRef.current = null;
              debounceTimeoutIdRef.current = null;
            });
          }, debounceTimeout);
        }
      });

      resizeObserverRef.current.observe(node);

      return () => {
        // Cancel any pending debounce timeout
        if (debounceTimeoutIdRef.current !== null) {
          clearTimeout(debounceTimeoutIdRef.current);
        }
        // Cancel any pending RAF to prevent state updates on unmounted component
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
        }
        if (resizeObserverRef.current !== null) {
          resizeObserverRef.current.unobserve(node);
          resizeObserverRef.current.disconnect();
        }
      };
    }, [mounted, debounceTimeout]);

    // If measureBeforeMount is true and not yet mounted, render placeholder
    if (measureBeforeMount && !mounted) {
      return (
        <div
          className={clsx(className, layoutClassName)}
          style={style}
          ref={elementRef}
        />
      );
    }

    return (
      <ComposedComponent
        innerRef={elementRef}
        className={className}
        style={style}
        {...(rest as unknown as P)}
        width={width}
      />
    );
  }

  WidthProviderWrapper.displayName = `WidthProvider(${ComposedComponent.displayName || ComposedComponent.name || "Component"})`;

  return WidthProviderWrapper;
}

export default WidthProvider;
