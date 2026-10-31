import fs from "node:fs";
import path from "node:path";
import { formatTrace } from "./formatTrace";

export function expectGolden(
  scenario: string,
  variant: string,
  steps: object[],
  metadata: object = {}
) {
  if (!/^[\w-]+$/.test(scenario) || !/^[\w-]+$/.test(variant)) {
    throw new Error("Golden names must be plain scenario/variant identifiers");
  }
  const file = path.join(
    __dirname,
    "__golden__",
    `${scenario}.${variant}.trace.json`
  );
  const actual = formatTrace(steps, { scenario, variant, ...metadata });
  if (process.env.GOLDEN_UPDATE === "1") {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, actual);
    return;
  }
  if (!fs.existsSync(file)) {
    throw new Error(
      `Missing ${path.basename(file)}. Run corepack yarn golden:update.`
    );
  }
  const received = JSON.parse(actual);
  const expected = JSON.parse(fs.readFileSync(file, "utf8"));
  expect(received.metadata).toEqual(expected.metadata);
  expect(received.steps).toHaveLength(expected.steps.length);
  // Report the first differing event rather than diffing the entire gesture.
  for (const [index, step] of received.steps.entries()) {
    try {
      expect(step).toEqual(expected.steps[index]);
    } catch (error) {
      const input = step.input ?? {};
      throw new Error(
        `${path.basename(file)}, step ${index} (${input.type ?? input.kind ?? "summary"}):\n${(error as Error).message}`
      );
    }
  }
}
