// Development entry point - uses new TypeScript source directly

// Legacy API (default)
module.exports = require("./src/legacy/ReactGridLayout").default;
module.exports.utils = require("./src/legacy/utils-compat");
module.exports.calculateUtils = require("./src/legacy/calculate-compat");
module.exports.Responsive =
  require("./src/legacy/ResponsiveReactGridLayout").default;
module.exports.Responsive.utils = require("./src/legacy/responsive-compat");
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
