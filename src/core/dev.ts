/**
 * Coded warnings. Every code is documented in docs/warnings.md, and every
 * message ends with its code so it can be searched for.
 *
 * Internal: not exported from any public entry point.
 */

/** A documented code such as "RGL_W002"; see docs/warnings.md. */
export type WarningCode = `RGL_W${number}`;

const warned = new WeakMap<object, Set<WarningCode>>();

/**
 * True unless NODE_ENV is "production". Bundlers replace only the literal
 * `process.env.NODE_ENV`, so read it as written. Where `process` does not
 * exist and nothing replaced the literal, the read throws and the guard treats
 * the environment as production (silent).
 */
export function isDevelopment(): boolean {
  try {
    return (process.env as { NODE_ENV?: string }).NODE_ENV !== "production";
  } catch {
    return false;
  }
}

/** Record `code` for `scope`. Returns false if it was already recorded. */
function firstTime(scope: object | null, code: WarningCode): boolean {
  if (scope === null) return true;
  let codes = warned.get(scope);
  if (codes === undefined) {
    codes = new Set();
    warned.set(scope, codes);
  }
  if (codes.has(code)) return false;
  codes.add(code);
  return true;
}

/**
 * Warn once per scope and code, in development only. The scope is the grid
 * (or item) instance; `null` means no deduplication, one warning per call.
 */
export function devWarn(
  scope: object | null,
  code: WarningCode,
  message: string
): void {
  if (!isDevelopment()) return;
  if (!firstTime(scope, code)) return;
  console.warn(`${message} (${code})`);
}

/**
 * Report once per scope and code through console.error, in development and
 * production alike. The production path for invalid strategy results
 * (RGL_W005) and strategy errors (RFC 0003 §15); it has no 2.4 caller.
 */
export function reportOnce(
  scope: object | null,
  code: WarningCode,
  message: string
): void {
  if (!firstTime(scope, code)) return;
  console.error(`${message} (${code})`);
}
