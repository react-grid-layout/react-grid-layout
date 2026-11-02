import type { LayoutItem } from "../types.js";

export interface Axis {
  readonly pos: "x" | "y";
  readonly size: "w" | "h";
  readonly cross: "x" | "y";
  readonly crossSize: "w" | "h";
  compare(a: LayoutItem, b: LayoutItem): number;
}

export const VERTICAL: Axis = {
  pos: "y",
  size: "h",
  cross: "x",
  crossSize: "w",
  compare(a, b) {
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  }
};

export const HORIZONTAL: Axis = {
  pos: "x",
  size: "w",
  cross: "y",
  crossSize: "h",
  compare(a, b) {
    if (a.x !== b.x) return a.x - b.x;
    return a.y - b.y;
  }
};
