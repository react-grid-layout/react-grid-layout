const { jest: config } = require("../package.json");

module.exports = {
  ...config,
  rootDir: "..",
  testMatch: ["<rootDir>/test/bench/*.bench-test.ts"],
  testPathIgnorePatterns: [],
  collectCoverage: false,
  // babel-jest's cache key does not track edits to the local probe plugin.
  cache: false,
  transform: {
    ...config.transform,
    "^.+\\.(ts|tsx)$": [
      "babel-jest",
      {
        presets: ["@babel/preset-typescript"],
        plugins: [require.resolve("./bench/instrument.cjs")]
      }
    ]
  }
};
