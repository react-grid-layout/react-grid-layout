import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    core: "src/core/index.ts",
    react: "src/react/index.ts",
    legacy: "src/legacy/index.ts",
    extras: "src/extras/index.ts"
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: [
    "react",
    "react-dom",
    "react-draggable",
    "react-resizable",
    "clsx",
    "fast-equals"
  ]
});
