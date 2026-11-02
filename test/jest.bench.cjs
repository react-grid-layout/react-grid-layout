// Opt-in timing suite (`yarn bench`). Wall-clock assertions flake under load, so
// none of these run in the default `yarn test`. Snapshots stay in test/spec.
const { jest: config } = require("../package.json");
module.exports = {
  ...config,
  rootDir: "..",
  testMatch: [
    "<rootDir>/test/spec/benchmark-test.js",
    "<rootDir>/test/spec/fast-compactor-test.js",
    "<rootDir>/test/spec/fast-horizontal-compactor-test.js"
  ],
  testPathIgnorePatterns: [],
  collectCoverage: false
};
