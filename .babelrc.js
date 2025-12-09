const es6Compat =
  process.env.BABEL_ES_COMPAT === "6" || process.env.NODE_ENV === "test";

module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: es6Compat ? "maintained node versions" : "> 0.25%, not dead"
      }
    ],
    ["@babel/react", { runtime: "automatic" }]
  ],
  plugins: ["@babel/plugin-transform-class-properties", "babel-plugin-preval"]
};
