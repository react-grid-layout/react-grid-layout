"use strict";

module.exports = {
  extends: [
    `eslint:recommended`,
    `plugin:eslint-plugin/recommended`,
    `plugin:node/recommended`,
  ],
  env: {
    node: true,
  },
  overrides: [
    {
      files: [`tests/**/*.js`],
      env: { mocha: true },
    },
  ],
  root: true,
  rules: {
    quotes: [`error`, `backtick`],
  }
};
