// Opt-in timing suite. Its existing snapshots intentionally stay in test/spec.
const { jest: config } = require("../package.json");
module.exports = {
  ...config,
  rootDir: "..",
  testMatch: ["<rootDir>/test/spec/benchmark-test.js"],
  testPathIgnorePatterns: [],
  collectCoverage: false
};
