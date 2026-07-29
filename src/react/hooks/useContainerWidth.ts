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

/**
 * Measure a node's content-box width, the same box ResizeObserver reports as
 * `entry.contentRect.width`.
 *
 * `containerRef` is attached to the consumer's own wrapper element and the grid
 * renders as an ordinary block child of it, so the width available to the grid
 * is the wrapper's content box. `offsetWidth` is the border box, which adds the
 * wrapper's padding and border and over-measures by that much.
 *
 * Derived from `clientWidth` rather than `getBoundingClientRect()` because
 * `clientWidth` is a layout value: it ignores CSS transforms, so a scaled grid
 * (see `transformScale`) still measures its true layout width.
 */
function getContentWidth(node: HTMLElement): number {
  const style =
    typeof globalThis.getComputedStyle === "function"
      ? globalThis.getComputedStyle(node)
      : null;
  if (!style) return node.clientWidth;

  const px = (value: string): number => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  // clientWidth is the padding box less any scrollbar; drop padding to reach
  // the content box.
  return Math.max(
    0,
    node.clientWidth - px(style.paddingLeft) - px(style.paddingRight)
  );
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
        // Cancel any pending RAF to prevent state updates on unmounted component
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
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
  }, [measureWidth]);

  return {
    width,
    mounted,
    containerRef,
    measureWidth
  };
}

export default useContainerWidth;
