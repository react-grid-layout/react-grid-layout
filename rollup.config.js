import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import replace from "rollup-plugin-replace";
import uglify from "rollup-plugin-uglify";
import { sizeSnapshot } from "rollup-plugin-size-snapshot";

const input = "./lib/umd.js";

export default [
  {
    input,
    output: {
      file: "dist/react-grid-layout.umd.js",
      format: "umd",
      name: "ReactGridLayout",
      globals: {
        react: "React",
        "react-dom": "ReactDOM"
      }
    },
    external: ["react", "react-dom"],
    plugins: [
      nodeResolve({ extensions: [".js", ".jsx"] }),
      commonjs({
        include: "node_modules/**",
        namedExports: { "react-draggable": ["DraggableCore"] }
      }),
      babel({ exclude: "node_modules/**", plugins: ["external-helpers"] }),
      replace({ "process.env.NODE_ENV": JSON.stringify("development") }),
      sizeSnapshot()
    ]
  },

  {
    input,
    output: {
      file: "dist/react-grid-layout.min.js",
      format: "umd",
      sourcemap: true,
      name: "ReactGridLayout",
      globals: {
        react: "React",
        "react-dom": "ReactDOM"
      }
    },
    external: ["react", "react-dom"],
    plugins: [
      nodeResolve({ extensions: [".js", ".jsx"] }),
      commonjs({
        include: "node_modules/**",
        namedExports: { "react-draggable": ["DraggableCore"] }
      }),
      babel({ exclude: "node_modules/**", plugins: ["external-helpers"] }),
      replace({ "process.env.NODE_ENV": JSON.stringify("production") }),
      sizeSnapshot(),
      uglify()
    ]
  }
];
