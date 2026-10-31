import fs from "node:fs";
import path from "node:path";
import { serialize } from "./serialize";

export function expectGolden(name: string, value: unknown): void {
  if (!/^[\w/-]+$/.test(name) || name.split("/").includes("..")) {
    throw new Error(`Invalid golden name: ${name}`);
  }
  const file = path.join(__dirname, "__golden__", `${name}.golden.json`);
  const actual = serialize(value);
  if (process.env.GOLDEN_UPDATE === "1") {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, actual);
    return;
  }
  if (!fs.existsSync(file)) {
    throw new Error(
      `Missing golden ${name}. Run corepack yarn golden:update and review the new file.`
    );
  }
  // Jest's line diff includes the item and surrounding case id, even for holes
  // and undefined-valued properties which ordinary JSON would silently discard.
  expect(actual).toBe(fs.readFileSync(file, "utf8"));
}
