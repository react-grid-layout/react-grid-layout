/**
 * Regression tests for #2271 — the amplifier half.
 *
 * ResponsiveGridLayout's width effect, derived-layout effect and GridLayout's
 * layout-sync effect all setState synchronously during the passive-effect
 * flush. If any hop is not idempotent, a width change cascades instead of
 * settling, which is what trips React's nested-update guard.
 */
import * as React from "react";
import { useState, useCallback, useRef } from "react";
import { render, act } from "@testing-library/react";
import { ResponsiveGridLayout } from "../../src/react/components/ResponsiveGridLayout";
import type { Layout, ResponsiveLayouts } from "../../src/core/types";

const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

function makeLayout(): Layout {
  return Array.from({ length: 12 }, (_, i) => ({
    i: `i-${i}`,
    x: (i % 4) * 3,
    y: Math.floor(i / 4) * 3,
    w: 3,
    h: 2 + (i % 3),
    static: i === 5
  }));
}

describe("#2271 responsive settling", () => {
  let renders = 0;
  let layoutChanges = 0;
  let lastLayout: Layout = [];

  function Harness({ width, echo }: { width: number; echo: boolean }) {
    renders++;
    const [layouts, setLayouts] = useState<ResponsiveLayouts<string>>(() => ({
      lg: makeLayout()
    }));
    const onLayoutChange = useCallback(
      (l: Layout, ls: ResponsiveLayouts<string>) => {
        layoutChanges++;
        lastLayout = l;
        if (echo) setLayouts(ls);
      },
      [echo]
    );
    // New child elements every render, same keys - the showcase's pattern.
    const nonce = useRef(0);
    nonce.current++;
    return (
      <ResponsiveGridLayout
        width={width}
        breakpoints={BREAKPOINTS}
        cols={COLS}
        layouts={layouts}
        rowHeight={30}
        onLayoutChange={onLayoutChange}
      >
        {makeLayout().map(item => (
          <div key={item.i}>
            {item.i}-{nonce.current}
          </div>
        ))}
      </ResponsiveGridLayout>
    );
  }

  beforeEach(() => {
    renders = 0;
    layoutChanges = 0;
    lastLayout = [];
  });

  it.each([
    ["controlled (layouts echoed back)", true],
    ["uncontrolled", false]
  ])("settles when width sweeps breakpoints — %s", (_name, echo) => {
    const useEcho = echo as boolean;
    const { rerender } = render(<Harness width={1300} echo={useEcho} />);

    // Sweep across every breakpoint boundary, repeatedly.
    const sweep = [1300, 1100, 900, 700, 400, 700, 900, 1100, 1300];
    for (let pass = 0; pass < 20; pass++) {
      for (const w of sweep) {
        act(() => {
          rerender(<Harness width={w} echo={useEcho} />);
        });
      }
    }

    // A single width change must produce a bounded number of renders.
    const before = renders;
    act(() => {
      rerender(<Harness width={900} echo={useEcho} />);
    });
    expect(renders - before).toBeLessThan(10);

    // Re-applying the same width must not move any state.
    const quiet = renders;
    const quietChanges = layoutChanges;
    act(() => {
      rerender(<Harness width={900} echo={useEcho} />);
    });
    expect(renders - quiet).toBeLessThanOrEqual(1);
    expect(layoutChanges - quietChanges).toBe(0);
  });

  it("returns to the original layout after a round trip", () => {
    const { rerender } = render(<Harness width={1300} echo={true} />);

    for (const w of [700, 400, 900, 1300]) {
      act(() => {
        rerender(<Harness width={w} echo={true} />);
      });
    }

    // Back at lg, every item must be at its authored width again.
    expect(lastLayout.map(l => l.w)).toEqual(makeLayout().map(l => l.w));
  });
});
