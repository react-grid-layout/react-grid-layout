import { formatTrace } from "../formatTrace";

it("formats normalized values with sorted step keys and one step per line", () => {
  expect(
    formatTrace([
      { z: { $u: 1 }, a: 1 },
      { b: 2, a: 1 }
    ])
  ).toBe(
    '{\n"metadata":{},\n"steps":[\n{"a":1,"z":{"$u":1}},\n{"a":1,"b":2}\n]\n}\n'
  );
});
