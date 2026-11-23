/**
 * useContainerWidth hook
 *
 * Observes container width using ResizeObserver and provides
 * reactive width updates for responsive layouts.
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type RefObject
} from "react";
import { getContentWidth } from "../getContentWidth.js";

export interface UseContainerWidthOptions {
  /**
   * If true, delays initial render until width is measured.
   * Useful for SSR or when you need accurate initial measurements.
   */
  measureBeforeMount?: boolean;

  /**
   * Initial width to use before measurement.
   * Defaults to 1280.
   */
  initialWidth?: number;

  /**
   * Trailing debounce in milliseconds for width updates from the
   * ResizeObserver (#2254). While the container is resizing, the rendered
   * width freezes; once it holds steady for this long, the latest measured
   * width commits, exactly once per burst of notifications. Absent or 0
   * keeps immediate updates on every notification.
   */
  debounceTimeout?: number;
}

export interface UseContainerWidthResult {
  /**
   * Current container width in pixels.
   */
  width: number;

  /**
   * Whether the container has been measured at least once.
   */
  mounted: boolean;

  /**
   * Ref to attach to the container element.
   */
  containerRef: RefObject<HTMLDivElement | null>;

  /**
   * Manually trigger a width measurement.
   * Useful when the container size might change without a resize event.
   */
  measureWidth: () => void;
}

/**
 * Hook to observe and track container width.
 *
 * Replaces the WidthProvider HOC with a more composable approach.
 *
 * @example
 * ```tsx
 * function MyGrid() {
 *   const { width, containerRef, mounted } = useContainerWidth();
 *
 *   return (
 *     <div ref={containerRef}>
 *       {mounted && <GridLayout width={width} {...props} />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useContainerWidth(
  options: UseContainerWidthOptions = {}
): UseContainerWidthResult {
  const {
    measureBeforeMount = false,
    initialWidth = 1280,
    debounceTimeout
  } = options;

  const [width, setWidth] = useState(initialWidth);
  const [mounted, setMounted] = useState(!measureBeforeMount);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const measureWidth = useCallback(() => {
    const node = containerRef.current;
    if (node) {
      // Must measure the same box as the ResizeObserver path below, or mount
      // and resize disagree by the wrapper's padding and border (#2271).
      const newWidth = Math.round(getContentWidth(node));
      setWidth(prev => (prev === newWidth ? prev : newWidth));
      if (!mounted) {
        setMounted(true);
      }
    }
  }, [mounted]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    // Initial measurement
    measureWidth();

    // Set up ResizeObserver
    if (typeof ResizeObserver !== "undefined") {
      let rafId: number | null = null;
      let debounceTimer: number | undefined;

      observerRef.current = new ResizeObserver(entries => {
        const entry = entries[0];
        if (entry) {
          // Round to whole pixels. At fractional devicePixelRatio (DevTools
          // device-toolbar zoom at 75%/50%, OS display scaling) contentRect.width
          // is fractional and drifts by sub-pixel amounts between notifications.
          // Unrounded, every notification is a new value, so React never bails
          // out: each one re-renders the grid, which changes the container
          // height, which produces another notification (#2271).
          const newWidth = Math.round(entry.contentRect.width);

          if (debounceTimeout && debounceTimeout > 0) {
            // Trailing debounce (#2254): each notification holds the latest
            // measured width and restarts the timer, so a burst commits once
            // after the container has been steady for debounceTimeout ms.
            // The timer fires outside the ResizeObserver callback, so the
            // RAF deferral below is not needed on this path.
            window.clearTimeout(debounceTimer);
            debounceTimer = window.setTimeout(() => {
              setWidth(prev => (prev === newWidth ? prev : newWidth));
              debounceTimer = undefined;
            }, debounceTimeout);
            return;
          }

          // Defer state update to next paint cycle to avoid
          // "ResizeObserver loop completed with undelivered notifications" error (#1959)
          if (rafId !== null) {
            cancelAnimationFrame(rafId);
          }
          rafId = requestAnimationFrame(() => {
            setWidth(prev => (prev === newWidth ? prev : newWidth));
            rafId = null;
          });
        }
      });

      observerRef.current.observe(node);

      return () => {
        // Cancel any pending RAF or debounce timer to prevent state updates
        // on unmounted component
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
        window.clearTimeout(debounceTimer);
        debounceTimer = undefined;
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
      };
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [measureWidth, debounceTimeout]);

  return {
    width,
    mounted,
    containerRef,
    measureWidth
  };
}

export default useContainerWidth;
