/**
 * Test for PR #1309 - Static items break compactor optimization
 *
 * When static items are scattered throughout the layout, the early break
 * optimization in resolveCompactionCollision could skip items that need
 * to be moved, causing incorrect compaction.
 */
import { compact } from "../../src/core/compact-compat";

describe("PR #1309 - Static items compaction", () => {
  it("should handle recursive collision with statics mixed throughout layout", () => {
    // This layout has static items (A, B, C) at various y positions
    // Non-static items need to compact around them correctly
    const layout = [
      { w: 59, h: 5, x: 0, y: 113, i: "A", static: true },
      { w: 59, h: 5, x: 0, y: 74, i: "B", static: true },
      { w: 59, h: 5, x: 0, y: 35, i: "C", static: true },
      { w: 40, h: 20, x: 0, y: 0, i: "D" },
      { w: 40, h: 20, x: 0, y: 20, i: "E" },
      { w: 20, h: 20, x: 0, y: 40, i: "F" },
      { w: 20, h: 20, x: 20, y: 40, i: "G" },
      { w: 20, h: 10, x: 0, y: 60, i: "H" },
      { w: 20, h: 10, x: 20, y: 60, i: "I" }
    ];

    const out = compact(layout, "vertical", 60);

    // Static items should not move
    expect(out.find(item => item.i === "A")).toMatchObject({
      y: 113,
      static: true
    });
    expect(out.find(item => item.i === "B")).toMatchObject({
      y: 74,
      static: true
    });
    expect(out.find(item => item.i === "C")).toMatchObject({
      y: 35,
      static: true
    });

    // D starts at y=0, h=20, so occupies 0-19
    expect(out.find(item => item.i === "D")?.y).toBe(0);

    // E would go to y=20 but C is at y=35, h=5 (occupies 35-39)
    // So E at y=20 with h=20 would occupy 20-39, colliding with C
    // E must move to y=40 (after C ends at 39+1=40)
    expect(out.find(item => item.i === "E")?.y).toBe(40);

    // F and G at y=40 now collide with E (which is at 40-59)
    // They need to move after E, but B is at y=74
    // F/G with h=20 need to go to y=79 (after B at 74+5=79)
    expect(out.find(item => item.i === "F")?.y).toBe(79);
    expect(out.find(item => item.i === "G")?.y).toBe(79);

    // H and I need to go after F/G (79+20=99)
    expect(out.find(item => item.i === "H")?.y).toBe(99);
    expect(out.find(item => item.i === "I")?.y).toBe(99);
  });

  it("should still use optimization when no statics are present", () => {
    // Layout without statics - optimization should still work
    const layout = [
      { w: 2, h: 2, x: 0, y: 0, i: "A" },
      { w: 2, h: 2, x: 0, y: 5, i: "B" }, // Gap at y=2-4
      { w: 2, h: 2, x: 0, y: 10, i: "C" } // Gap at y=7-9
    ];

    const out = compact(layout, "vertical", 12);

    // Items should compact upward filling gaps
    expect(out.find(item => item.i === "A")?.y).toBe(0);
    expect(out.find(item => item.i === "B")?.y).toBe(2);
    expect(out.find(item => item.i === "C")?.y).toBe(4);
  });
});
