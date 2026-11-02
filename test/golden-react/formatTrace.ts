import { normalize } from "../golden/serialize";

/** Format normalized steps once, with one complete step per line. */
export function formatTrace(steps: object[], metadata: object = {}): string {
  return `{\n"metadata":${JSON.stringify(normalize(metadata))},\n"steps":[\n${steps
    .map(step =>
      JSON.stringify(
        Object.fromEntries(
          Object.keys(step)
            .sort()
            .map(key => [key, (step as Record<string, unknown>)[key]])
        )
      )
    )
    .join(",\n")}\n]\n}\n`;
}
