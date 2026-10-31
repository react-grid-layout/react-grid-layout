import fs from "node:fs";
import path from "node:path";
import { capture, copy } from "../capture";
import { expectGolden } from "../expectGolden";
import { samples } from "../generators";
import { mulberry32, rng } from "../rng";
import { normalize, serialize } from "../serialize";

// These guards protect the oracle itself, where an update must not hide loss.
describe("golden harness preserves observable differences", () => {
  it("distinguishes missing keys, undefined, holes and nonfinite numbers", () => {
    const values = [
      {},
      { key: undefined },
      [undefined],
      new Array(1),
      Infinity,
      -Infinity,
      Number.NaN,
      -0,
      0
    ];
    expect(new Set(values.map(serialize)).size).toBe(values.length);
    expect(
      normalize({ z: undefined, a: [Infinity, -Infinity, Number.NaN] })
    ).toEqual({
      a: [
        { $number: "Infinity" },
        { $number: "-Infinity" },
        { $number: "NaN" }
      ],
      z: { $u: 1 }
    });
    expect(serialize({ b: 1, a: 2 })).toBe('{"a":2,"b":1}\n');
    expect(
      serialize([
        { i: "a", x: 0, resizeHandles: ["n", "s"], minW: undefined }
      ]).split("\n")
    ).toHaveLength(4);
  });

  it("never serializes an ordinary object the same as a sentinel", () => {
    const pairs: Array<[unknown, unknown]> = [
      [undefined, { $u: 1 }],
      [new Array(1), [{ $hole: true }]],
      [Infinity, { $number: "Infinity" }],
      [-0, { $number: "-0" }],
      [function f() {}, { $function: "f" }],
      [{ $u: 1 }, { $escaped: { $u: 1 } }]
    ];
    for (const [sentinel, lookalike] of pairs) {
      expect(serialize(sentinel)).not.toBe(serialize(lookalike));
    }
  });

  it("records objects shared inside the output, not only with the input", () => {
    const call = capture({}, () => {
      const item = { i: "a" };
      return { layout: [item], item };
    });
    expect(call.identity.aliases).toEqual([
      { inputPaths: [], outputPaths: ["$.layout.0", "$.item"] }
    ]);
    const unshared = capture({}, () => ({
      layout: [{ i: "a" }],
      item: { i: "a" }
    }));
    expect(unshared.identity.aliases).toEqual([]);
  });

  it("copies an own __proto__ key as a key, not as the prototype", () => {
    const input = JSON.parse('{"__proto__": {"x": 1}, "i": "a"}');
    const cloned = copy(input);
    expect(Object.getPrototypeOf(cloned)).toBe(Object.prototype);
    expect(Object.keys(cloned)).toEqual(["__proto__", "i"]);
    expect(serialize(cloned)).toBe(serialize(input));
  });

  it("copies custom fields and aliases without filling array holes", () => {
    const item = { i: "a", data: { label: "custom" } };
    const layout = new Array(3);
    layout[0] = item;
    layout[2] = item;
    const args = { layout, item };
    const cloned = copy(args);
    expect(cloned).not.toBe(args);
    expect(cloned.item).toBe(cloned.layout[0]);
    expect(cloned.layout[0]).toBe(cloned.layout[2]);
    expect(1 in cloned.layout).toBe(false);
    expect(cloned.item.data).not.toBe(item.data);
  });

  it("captures pre-call values, mutation and returned identity independently", () => {
    const item = { i: "a", x: 0 };
    const original = { layout: [item], item };
    const call = capture(original, args => {
      args.item.x = 5;
      return args.layout;
    });
    expect(original.item.x).toBe(0);
    expect(call.input.item.x).toBe(0);
    expect(call.postInput.item.x).toBe(5);
    expect(call.output![0]!.x).toBe(5);
    expect(call.identity.returnedSameArray).toBe(true);
    expect(call.identity.sameObject).toEqual([true]);
  });

  it("records algorithm errors but never blesses failed invariant assertions", () => {
    expect(
      capture([], () => {
        throw new RangeError("invalid geometry");
      }).error
    ).toEqual({ name: "RangeError", message: "invalid geometry" });
    expect(() => capture([], () => expect(1).toBe(2))).toThrow();
  });

  it("pins seeded generator and helper output under Jest's sort patch", () => {
    const random = rng(123);
    expectGolden("harness/seeds", {
      sequence: Array.from({ length: 8 }, mulberry32(1)),
      helpers: [
        random.int(-2, 4),
        random.pick(["a", "b"]),
        random.bool(),
        random.shuffle([1, 2, 3, 4])
      ],
      // Pin samples separately from production outputs to reveal generator drift.
      samples: samples.filter(s => s.seed === 1 && s.order === "forward")
    });
    expect(() => random.pick([])).toThrow("empty array");
  });

  it("fails on a missing file and never creates it during a check", () => {
    const file = path.join(
      __dirname,
      "../__golden__/harness/missing-probe.golden.json"
    );
    const update = process.env.GOLDEN_UPDATE;
    delete process.env.GOLDEN_UPDATE;
    try {
      expect(fs.existsSync(file)).toBe(false);
      expect(() => expectGolden("harness/missing-probe", {})).toThrow(
        "Missing golden"
      );
      expect(fs.existsSync(file)).toBe(false);
    } finally {
      if (update !== undefined) process.env.GOLDEN_UPDATE = update;
    }
  });
});
