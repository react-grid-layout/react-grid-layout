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
  const { measureBeforeMount = false, initialWidth = 1280 } = options;

  const [width, setWidth] = useState(initialWidth);
  const [mounted, setMounted] = useState(!measureBeforeMount);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

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
          setWidth(newWidth);
        }
      });

      observerRef.current.observe(node);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [measureWidth]);

  return {
    width,
    mounted,
    containerRef,
    measureWidth
  };
}

export default useContainerWidth;
