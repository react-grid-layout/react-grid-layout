import type { Layout } from "../../src/core/types";
import { collides } from "../../src/core/collision";

/** Unlike JSON or cloneLayout, retain extra keys, holes and shared references. */
export function copy<T>(value: T, seen = new Map<object, unknown>()): T {
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return seen.get(value) as T;
  const result: Record<string, unknown> | unknown[] = Array.isArray(value)
    ? new Array(value.length)
    : {};
  seen.set(value, result);
  for (const key of Object.keys(value)) {
    // defineProperty, not assignment: an own "__proto__" key must stay a key
    // instead of replacing the clone's prototype.
    Object.defineProperty(result, key, {
      value: copy((value as Record<string, unknown>)[key], seen),
      enumerable: true,
      writable: true,
      configurable: true
    });
  }
  return result as T;
}

function references(
  value: unknown,
  path = "$",
  found = new Map<object, string[]>()
) {
  if (value === null || typeof value !== "object") return found;
  const paths = found.get(value);
  if (paths) {
    paths.push(path);
    return found;
  }
  found.set(value, [path]);
  for (const key of Object.keys(value)) {
    references(
      (value as Record<string, unknown>)[key],
      `${path}.${key}`,
      found
    );
  }
  return found;
}

export function identity(args: unknown, output: unknown) {
  const inputs = references(args);
  const outputs = references(output);
  // An object is an alias when it is shared with the input or reachable by more
  // than one path inside the output (e.g. withLayoutItem's returned item is the
  // same object as its entry in the returned layout).
  const aliases = [...outputs].flatMap(([object, outputPaths]) => {
    const inputPaths = inputs.get(object) ?? [];
    return inputPaths.length > 0 || outputPaths.length > 1
      ? [{ inputPaths, outputPaths }]
      : [];
  });
  const layout =
    args !== null && typeof args === "object" && "layout" in args
      ? (args as { layout: unknown }).layout
      : Array.isArray(args) && Array.isArray(args[0])
        ? args[0]
        : args;
  return {
    returnedSameArray: Array.isArray(output) && output === layout,
    sameObject:
      Array.isArray(layout) && Array.isArray(output)
        ? Array.from(
            { length: output.length },
            (_, i) => i in output && output[i] === layout[i]
          )
        : output === args,
    aliases
  };
}

/** Capture at the call boundary; no production clone/normalizer can hide drift. */
export function capture<A, R>(
  args: A,
  fn: (working: A) => R,
  options = { clone: true }
) {
  const working = options.clone ? copy(args) : args;
  const input = copy(working);
  let output: R | undefined;
  let error: { name: string; message: string } | undefined;
  try {
    output = fn(working);
  } catch (caught) {
    if (!(caught instanceof Error) || "matcherResult" in caught) throw caught;
    error = { name: caught.name, message: caught.message };
  }
  return {
    input,
    output: copy(output),
    postInput: copy(working),
    identity: identity(working, output),
    ...(error ? { error } : {})
  };
}

/** Independent contracts prevent an update from blessing structural regressions. */
export function assertLayout(
  input: Layout,
  output: Layout,
  options: {
    noOverlaps?: boolean;
    bounds?: number;
    statics?: boolean;
  } = {}
): void {
  expect(output).toHaveLength(input.length);
  expect(output.map(item => item.i).sort()).toEqual(
    input.map(item => item.i).sort()
  );
  if (options.statics) {
    for (const item of input.filter(item => item.static)) {
      const actual = output.find(candidate => candidate.i === item.i);
      expect(actual && { x: actual.x, y: actual.y }).toEqual({
        x: item.x,
        y: item.y
      });
    }
  }
  if (options.bounds !== undefined) {
    for (const item of output) {
      expect(item.x).toBeGreaterThanOrEqual(0);
      expect(item.x + item.w).toBeLessThanOrEqual(options.bounds);
    }
  }
  if (options.noOverlaps) {
    const overlaps: string[][] = [];
    for (let i = 0; i < output.length; i++) {
      for (let j = i + 1; j < output.length; j++) {
        if (collides(output[i]!, output[j]!))
          overlaps.push([output[i]!.i, output[j]!.i]);
      }
    }
    expect(overlaps).toEqual([]);
  }
}
