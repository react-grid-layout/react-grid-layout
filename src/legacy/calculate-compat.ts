/**
 * Legacy calculateUtils compatibility layer
 *
 * Re-exports functions from the new TypeScript implementation
 * to maintain backwards compatibility with imports from lib/calculateUtils.
 */

// Re-export position/calculation functions
export {
  calcGridColWidth,
  calcGridItemWHPx,
  calcGridItemPosition,
  calcXY,
  calcWH,
  clamp
} from "../core/calculate.js";

// Re-export style functions
export { setTransform, setTopLeft, perc } from "../core/position.js";

// Re-export types
export type { PositionParams } from "../core/calculate.js";
