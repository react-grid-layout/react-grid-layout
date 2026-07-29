/**
 * Regression tests for #2271.
 *
 * Fractional container widths (device-toolbar zoom at 75%/50%, fractional
 * devicePixelRatio) made every ResizeObserver notification a new `width` value.
 * React never bailed out, so each notification re-rendered the grid, which
 * changed the container height, which produced another notification.
 *
 * Width is a layout input measured in whole pixels. Sub-pixel deltas must not
 * produce new state.
 */
import * as React from "react";
import { render, act } from "@testing-library/react";
import { useContainerWidth } from "../../src/react/hooks/useContainerWidth";
import { WidthProvider } from "../../src/react/components/WidthProvider";

declare const triggerResize: (width: number, height?: number) => void;

describe("#2271 sub-pixel width stability", () => {
  describe("useContainerWidth", () => {
    const widths: number[] = [];

    function Probe() {
      const { width, containerRef } = useContainerWidth();
      widths.push(width);
      return <div ref={containerRef} />;
    }

    beforeEach(() => {
      widths.length = 0;
    });

    it("reports whole-pixel widths", () => {
      render(<Probe />);
      act(() => {
        triggerResize(1023 + 1 / 3);
      });
      expect(widths[widths.length - 1]).toBe(1023);
    });

    it("does not re-render for sub-pixel deltas", () => {
      render(<Probe />);
      act(() => {
        triggerResize(1023.2);
      });
      const settled = widths.length;

      // React may re-render a component once before bailing out on an equal
      // state value, so allow one. What must not happen is a render per
      // notification - that is the feedback loop.
      for (const w of [1023.31, 1023.47, 1022.98, 1023.02, 1022.51]) {
        act(() => {
          triggerResize(w);
        });
      }

      expect(widths.length).toBeLessThanOrEqual(settled + 1);
      expect(new Set(widths.slice(settled - 1))).toEqual(new Set([1023]));
    });

    it("still tracks real width changes", () => {
      render(<Probe />);
      act(() => {
        triggerResize(1023.2);
      });
      act(() => {
        triggerResize(996.6);
      });
      expect(widths[widths.length - 1]).toBe(997);
    });
  });

  // Follow-up to #2271: the two measurement sources must describe the same box.
  // measureWidth() runs at mount and the ResizeObserver runs on every resize.
  // ResizeObserver reports contentRect, the content box. measureWidth used
  // offsetWidth, the border box, so a wrapper with padding or a border measured
  // wider at mount than on the next resize and the grid jumped.
  describe("useContainerWidth measurement box", () => {
    const widths: number[] = [];
    let remeasure: () => void = () => {};

    function Probe() {
      const { width, containerRef, measureWidth } = useContainerWidth();
      widths.push(width);
      React.useEffect(() => {
        remeasure = measureWidth;
      }, [measureWidth]);
      return (
        <div
          ref={containerRef}
          style={{ padding: "0 12px", border: "3px solid red" }}
        />
      );
    }

    beforeEach(() => {
      widths.length = 0;
    });

    it("measures the content box, not the border box", () => {
      const { container } = render(<Probe />);
      const node = container.firstChild as HTMLElement;
      // Padding box less the scrollbar; content box is this minus 12px each side.
      Object.defineProperty(node, "clientWidth", {
        value: 976,
        configurable: true
      });

      act(() => {
        remeasure();
      });

      expect(widths[widths.length - 1]).toBe(952);
    });

    it("agrees with what the ResizeObserver reports for the same element", () => {
      const { container } = render(<Probe />);
      const node = container.firstChild as HTMLElement;
      Object.defineProperty(node, "clientWidth", {
        value: 976,
        configurable: true
      });

      act(() => {
        remeasure();
      });
      const atMount = widths[widths.length - 1];

      // A real ResizeObserver reports the content box for this element: 952.
      act(() => {
        triggerResize(952);
      });

      expect(widths[widths.length - 1]).toBe(atMount);
    });
  });

  describe("WidthProvider", () => {
    const widths: number[] = [];

    function Probe({
      width,
      innerRef
    }: {
      width: number;
      innerRef?: React.Ref<HTMLDivElement>;
    }) {
      widths.push(width);
      return <div ref={innerRef} />;
    }
    const Wrapped = WidthProvider(Probe);

    beforeEach(() => {
      widths.length = 0;
    });

    it("reports whole-pixel widths and ignores sub-pixel deltas", () => {
      render(<Wrapped />);
      act(() => {
        triggerResize(1199 + 2 / 3);
      });
      expect(widths[widths.length - 1]).toBe(1200);

      const settled = widths.length;
      act(() => {
        triggerResize(1199.71);
      });
      act(() => {
        triggerResize(1200.24);
      });
      expect(widths.length).toBe(settled);
    });
  });
});
