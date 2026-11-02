import type { Layout, LayoutItem } from "../types.js";

/**
 * Arithmetic safety for direct core calls, distinct from input grid bounds.
 * Keep finite geometry unchanged, including resolved rows beyond intake bounds.
 * Non-finite sizes use 1; non-finite positions use 0. Positive infinite y is
 * appended below finite items, in input order. Valid layouts keep their identity.
 */
export function normalizeLayoutGeometry(
  layout: Layout,
  appendAtBottom = true
): Layout {
  let output: LayoutItem[] | undefined;
  let bottom = 0;
  let append = false;
  for (let index = 0; index < layout.length; index++) {
    const item = layout[index];
    if (item === undefined) continue;
    const x = Number.isFinite(item.x) ? item.x : 0;
    const y = Number.isFinite(item.y) || item.y === Infinity ? item.y : 0;
    const w = Number.isFinite(item.w) ? item.w : 1;
    const h = Number.isFinite(item.h) ? item.h : 1;
    if (y === Infinity) append = true;
    else bottom = Math.max(bottom, y + h);
    if (x === item.x && y === item.y && w === item.w && h === item.h) continue;
    output ??= layout.slice();
    output[index] = { ...item, x, y, w, h };
  }
  if (append && appendAtBottom) {
    output ??= layout.slice();
    for (let index = 0; index < output.length; index++) {
      const item = output[index];
      if (item?.y !== Infinity) continue;
      output[index] = { ...item, y: bottom };
      bottom += item.h;
    }
  }
  return output ?? layout;
}

/** Preserve the mutation contracts of correctBounds and per-item helpers. */
export function normalizeLayoutGeometryInPlace(
  layout: Layout,
  appendAtBottom = true
): void {
  const normalized = normalizeLayoutGeometry(layout, appendAtBottom);
  if (normalized === layout) return;
  for (let index = 0; index < layout.length; index++) {
    const item = layout[index];
    if (item !== undefined && normalized[index] !== item)
      Object.assign(item, normalized[index]);
  }
}
