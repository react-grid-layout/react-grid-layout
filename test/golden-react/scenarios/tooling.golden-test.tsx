import { serialize, traceJSON } from "../serialize";

it("keeps undefined and non-finite callback values in stable JSON with one step per line", () => {
  const input = { z: undefined, a: [Number.NaN, Infinity, -Infinity, -0] };
  expect(serialize(input)).toEqual({
    a: [
      { $number: "NaN" },
      { $number: "Infinity" },
      { $number: "-Infinity" },
      { $number: "-0" }
    ],
    z: { $undefined: true }
  });
  expect(traceJSON([input, { b: 2, a: 1 }])).toBe(
    '{\n"metadata":{},\n"steps":[\n{"a":[{"$number":"NaN"},{"$number":"Infinity"},{"$number":"-Infinity"},{"$number":"-0"}],"z":{"$undefined":true}},\n{"a":1,"b":2}\n]\n}\n'
  );
});
