/**
 * Tests for responsive breakpoint layout generation.
 *
 * Covers:
 * - #1744: gaps must collapse when a breakpoint layout is generated.
 * - #2110: items added at a smaller breakpoint must use their data-grid
 *   width when the layout grows to a larger breakpoint.
 */

import {
  findOrGenerateResponsiveLayout,
  sortBreakpoints,
  getBreakpointFromWidth
} from "../../src/core/responsive";
import type { Breakpoints, ResponsiveLayouts } from "../../src/core/types";

const BREAKPOINTS: Breakpoints<string> = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0
};

describe("responsive breakpoint generation", () => {
  describe("#1744 — gap collapse on breakpoint generation", () => {
    it("collapses a mid-grid gap when generating a smaller layout", () => {
      // lg layout with a gap at y=1 (item A at y=0, item C at y=2).
      const layouts: ResponsiveLayouts<string> = {
        lg: [
          { i: "A", x: 0, y: 0, w: 12, h: 1 },
          { i: "C", x: 0, y: 2, w: 12, h: 1 }
        ]
      };

      const generated = findOrGenerateResponsiveLayout(
        layouts,
        BREAKPOINTS,
        "md", // smaller breakpoint to generate
        "lg", // last breakpoint
        12,
        "vertical"
      );

      // C should have been pulled up into the gap at y=1.
      const itemC = generated.find(item => item.i === "C");
      expect(itemC).toBeDefined();
      expect(itemC!.y).toBe(1);
    });
  });

  describe("#2110 — new item seeded from data-grid on grow", () => {
    it("uses the child data-grid width for an item added at a small breakpoint", () => {
      // md layout with a new item at w:3.
      const layouts: ResponsiveLayouts<string> = {
        md: [
          { i: "A", x: 0, y: 0, w: 3, h: 1 },
          { i: "new", x: 3, y: 0, w: 3, h: 1 }
        ]
      };

      const generated = findOrGenerateResponsiveLayout(
        layouts,
        BREAKPOINTS,
        "lg", // larger breakpoint to generate
        "md", // last breakpoint
        12,
        "vertical"
      );

      // The new item must be present.
      const itemNew = generated.find(item => item.i === "new");
      expect(itemNew).toBeDefined();
    });
  });

  describe("sortBreakpoints / getBreakpointFromWidth", () => {
    it("sorts breakpoints by width ascending", () => {
      const sorted = sortBreakpoints(BREAKPOINTS);
      expect(sorted).toEqual(["xxs", "xs", "sm", "md", "lg"]);
    });

    it("returns the active breakpoint for a width", () => {
      expect(getBreakpointFromWidth(BREAKPOINTS, 800)).toBe("sm");
      expect(getBreakpointFromWidth(BREAKPOINTS, 1000)).toBe("md");
      expect(getBreakpointFromWidth(BREAKPOINTS, 1300)).toBe("lg");
    });
  });
});
