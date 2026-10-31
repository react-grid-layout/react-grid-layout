/** JSON with explicit sentinels, sorted keys and one object/item per line. */
export function normalize(value: unknown): unknown {
  if (value === undefined) return { $u: 1 };
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return { $number: String(value) };
    if (Object.is(value, -0)) return { $number: "-0" };
  }
  if (typeof value === "function")
    return { $function: value.name || "anonymous" };
  if (Array.isArray(value)) {
    return Array.from({ length: value.length }, (_, i) =>
      i in value ? normalize(value[i]) : { $hole: true }
    );
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map(key => [key, normalize((value as Record<string, unknown>)[key])])
    );
  }
  return value;
}

function hasObjectArray(value: unknown): boolean {
  if (value === null || typeof value !== "object") return false;
  if (Array.isArray(value))
    return value.some(entry => entry !== null && typeof entry === "object");
  return Object.values(value).some(hasObjectArray);
}

function format(value: unknown, depth: number): string {
  const indent = "  ".repeat(depth);
  const nextIndent = "  ".repeat(depth + 1);
  if (Array.isArray(value) && value.length > 0) {
    if (
      value.every(
        entry =>
          entry === null ||
          typeof entry !== "object" ||
          (Array.isArray(entry) &&
            entry.every(cell => cell === null || typeof cell !== "object"))
      )
    )
      return JSON.stringify(value);
    return `[\n${value.map(entry => nextIndent + format(entry, depth + 1)).join(",\n")}\n${indent}]`;
  }
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const entries = Object.entries(value);
    // Keep argument/configuration objects compact; expand around layout arrays.
    // Layout items themselves stay on one line, including nested optional fields.
    if ("i" in value || !hasObjectArray(value)) return JSON.stringify(value);
    return `{\n${entries.map(([key, entry]) => `${nextIndent}${JSON.stringify(key)}: ${format(entry, depth + 1)}`).join(",\n")}\n${indent}}`;
  }
  return JSON.stringify(value);
}

export function serialize(value: unknown): string {
  return format(normalize(value), 0) + "\n";
}
