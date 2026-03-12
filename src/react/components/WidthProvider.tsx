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
    const { measureBeforeMount = false, className, style, ...rest } = props;

    const [width, setWidth] = useState(1280);
    const [mounted, setMounted] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    // Set mounted state on first render
    useEffect(() => {
      setMounted(true);
    }, []);

    // Set up ResizeObserver - re-runs when mounted changes to observe the new element
    // This fixes measureBeforeMount where the ref changes from placeholder to composed component
    useEffect(() => {
      const node = elementRef.current;
      if (!(node instanceof HTMLElement)) return;

      let rafId: number | null = null;

      const observer = new ResizeObserver(entries => {
        if (entries[0]) {
          const newWidth = entries[0].contentRect.width;

          // Defer state update to next paint cycle to avoid
          // "ResizeObserver loop completed with undelivered notifications" error (#1959)
          if (rafId !== null) {
            cancelAnimationFrame(rafId);
          }
          rafId = requestAnimationFrame(() => {
            setWidth(newWidth);
            rafId = null;
          });
        }
      });

      observer.observe(node);
      resizeObserverRef.current = observer;

      return () => {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
        observer.unobserve(node);
        observer.disconnect();
      };
    }, [mounted]);

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
