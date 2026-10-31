/**
 * Clamp a number between bounds.
 *
 * @param num - Number to clamp
 * @param lowerBound - Minimum value
 * @param upperBound - Maximum value
 * @returns Clamped value
 */
export function clamp(
  num: number,
  lowerBound: number,
  upperBound: number
): number {
  return Math.max(Math.min(num, upperBound), lowerBound);
}
