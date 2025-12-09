// Development entry point - uses new TypeScript source directly
module.exports = require("./src/legacy/ReactGridLayout").default;
module.exports.utils = require("./src/legacy/utils-compat");
module.exports.calculateUtils = require("./src/legacy/calculate-compat");
module.exports.Responsive =
  require("./src/legacy/ResponsiveReactGridLayout").default;
module.exports.Responsive.utils = require("./src/legacy/responsive-compat");
module.exports.WidthProvider = require("./src/legacy/WidthProvider").default;
