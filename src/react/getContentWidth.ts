/**
 * Measure a node's content-box width, the same box ResizeObserver reports as
 * `entry.contentRect.width`.
 *
 * `containerRef` is attached to the consumer's own wrapper element and the grid
 * renders as an ordinary block child of it, so the width available to the grid
 * is the wrapper's content box. `offsetWidth` is the border box, which adds the
 * wrapper's padding and border and over-measures by that much.
 *
 * Prefers the computed `width`, which is the used content-box width: fractional,
 * and unaffected by CSS transforms, so a scaled grid (see `transformScale`)
 * still measures its true layout width. `getBoundingClientRect()` would report
 * the transformed width instead.
 *
 * Falls back to `clientWidth` minus horizontal padding when there is no computed
 * width to read. That fallback is approximate: `clientWidth` is already rounded
 * to a whole pixel, so subtracting fractional padding can land up to 1px away
 * from the true content box. Precision lost upstream cannot be recovered here,
 * which is why the computed width is tried first.
 */
export function getContentWidth(node: HTMLElement): number {
  const style =
    typeof globalThis.getComputedStyle === "function"
      ? globalThis.getComputedStyle(node)
      : null;
  if (!style) return node.clientWidth;

  const px = (value: string): number => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  // The used content-box width, matching ResizeObserver's contentRect.
  const computed = Number.parseFloat(style.width);
  if (Number.isFinite(computed)) return Math.max(0, computed);

  // clientWidth is the padding box less any scrollbar; drop padding to
  // approximate the content box.
  return Math.max(
    0,
    node.clientWidth - px(style.paddingLeft) - px(style.paddingRight)
  );
}
