/** Canonical lossless JSON values. Never retain a mutable callback argument. */
export function serialize(value: unknown): any {
  if (value === undefined) return { $undefined: true };
  if (typeof value === "function")
    return { $function: value.name || "anonymous" };
  if (typeof value === "number" && !Number.isFinite(value)) {
    return { $number: String(value) };
  }
  if (Object.is(value, -0)) return { $number: "-0" };
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(serialize);
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map(key => [key, serialize((value as Record<string, unknown>)[key])])
  );
}

/** One complete step per line keeps a gesture diff local and reviewable. */
export function traceJSON(steps: unknown[], metadata: object = {}): string {
  return `{\n"metadata":${JSON.stringify(serialize(metadata))},\n"steps":[\n${steps
    .map(step => JSON.stringify(serialize(step)))
    .join(",\n")}\n]\n}\n`;
}
