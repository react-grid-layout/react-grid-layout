/**
 * Development warnings for deprecated props (RGL-47). Private: nothing here
 * is exported from a public entry point. Codes are listed in docs/warnings.md.
 */
import React, { createContext, useContext, useEffect, useRef } from "react";
import { devWarn, isDevelopment, type WarningCode } from "../../core/dev.js";

/**
 * True below a `/legacy` wrapper. The v1 API keeps `droppingItem`,
 * `onDropDragOver` and `data-grid` as supported props, so the modern-entry
 * deprecations stay silent there. GridLayout resets it to false for its
 * children, so a modern grid nested in a legacy grid's item still warns.
 */
export const LegacyEntryContext = createContext(false);

/** A stable per-instance scope for devWarn. */
export function useWarningScope(): object {
  return useRef({}).current;
}

/** Warn once per instance, after commit (StrictMode re-runs keep the scope). */
export function useDevWarning(
  condition: boolean,
  code: WarningCode,
  message: string
): void {
  const scope = useWarningScope();
  useEffect(() => {
    if (condition) devWarn(scope, code, message);
  }, [condition, scope, code, message]);
}

function hasDataGrid(children: React.ReactNode): boolean {
  let found = false;
  React.Children.forEach(children, child => {
    if (found || !React.isValidElement(child)) return;
    found = (child.props as { "data-grid"?: unknown })["data-grid"] != null;
  });
  return found;
}

const W014 =
  "ReactGridLayout: `onDropDragOver` is deprecated and is removed in 3.0. " +
  "Use `dropConfig.onDragOver`, which receives the native DragEvent " +
  "(read `e` where you read `e.nativeEvent`). The `/legacy` entry keeps " +
  "`onDropDragOver`.";
const W015 =
  "ReactGridLayout: the `data-grid` child prop is deprecated on the modern " +
  "entry and is removed in 3.0. Pass an explicit `layout` (or `layouts` on " +
  "ResponsiveGridLayout). The `/legacy` entry keeps `data-grid`.";
const W017 =
  "ReactGridLayout: `droppingItem` is deprecated and is removed in 3.0. " +
  "Use `dropConfig.defaultItem`, which accepts `i` since 2.4 and is renamed " +
  "`dropConfig.item` in 3.0. The `/legacy` entry keeps `droppingItem`.";

/**
 * RGL_W014, RGL_W015 and RGL_W017 for a modern GridLayout: one development
 * warning per grid for each deprecated prop it receives. Returns whether the
 * grid sits below a legacy wrapper.
 */
export function useModernEntryDeprecations(props: {
  droppingItem?: unknown;
  onDropDragOver?: unknown;
  children?: React.ReactNode;
}): boolean {
  const legacy = useContext(LegacyEntryContext);
  const scope = useWarningScope();
  const { droppingItem, onDropDragOver, children } = props;
  useEffect(() => {
    if (legacy || !isDevelopment()) return;
    if (onDropDragOver) devWarn(scope, "RGL_W014", W014);
    if (droppingItem) devWarn(scope, "RGL_W017", W017);
    if (hasDataGrid(children)) devWarn(scope, "RGL_W015", W015);
  }, [legacy, scope, droppingItem, onDropDragOver, children]);
  return legacy;
}
