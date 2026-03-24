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
   * Timeout in milliseconds to delay the resizing of grid-items
   * Defaults to 0
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
  const { measureBeforeMount = false, initialWidth = 1280, debounceTimeout = 0 } = options;

  const [width, setWidth] = useState(initialWidth);
  const [mounted, setMounted] = useState(!measureBeforeMount);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const debounceTimeoutIdRef = useRef<number | null>(null);

  const measureWidth = useCallback(() => {
    const node = containerRef.current;
    if (node) {
      const newWidth = node.offsetWidth;
      setWidth(newWidth);
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
      
      observerRef.current = new ResizeObserver(entries => {
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

      observerRef.current.observe(node);
    }

    return () => {
      // Cancel any pending debounce timeout
      if (debounceTimeoutIdRef.current !== null) {
        clearTimeout(debounceTimeoutIdRef.current);
      }
      // Cancel any pending RAF to prevent state updates on unmounted component
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (observerRef.current !== null) {
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
