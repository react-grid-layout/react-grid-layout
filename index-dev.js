// Development entry point - uses new TypeScript source directly

// Legacy API (default)
module.exports = require("./src/legacy/ReactGridLayout").default;
// Note: utils, calculateUtils, responsive-utils are NOT exported (#2213)
// They were never part of the official public API
module.exports.Responsive =
  require("./src/legacy/ResponsiveReactGridLayout").default;
module.exports.WidthProvider = require("./src/legacy/WidthProvider").default;

// v2 API additions
module.exports.useContainerWidth =
  require("./src/react/hooks/useContainerWidth").useContainerWidth;
module.exports.GridLayout =
  require("./src/react/components/GridLayout").GridLayout;
module.exports.ResponsiveGridLayout =
  require("./src/react/components/ResponsiveGridLayout").ResponsiveGridLayout;

// Constraint exports
Object.assign(module.exports, require("./src/core/constraints"));

// Compactor exports
Object.assign(module.exports, require("./src/core/compactors"));
