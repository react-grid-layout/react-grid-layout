// Entry probes also see same-module calls, which jest.spyOn(exports) cannot.
// This plugin is used only by jest.ops.cjs; source files stay unchanged.
module.exports = function instrument({ types: t, template }) {
  return {
    visitor: {
      FunctionDeclaration(path, state) {
        const file = state.filename.replaceAll("\\", "/");
        const name = path.node.id?.name;
        const owners = {
          collides: "/src/core/collision.ts",
          getFirstCollision: "/src/core/collision.ts",
          cloneLayoutItem: "/src/core/layout.ts",
          getStatics: "/src/core/layout.ts",
          GridItemInner: "/src/react/components/GridItem.tsx",
          GridLayout: "/src/react/components/GridLayout.tsx"
        };
        if (!owners[name] || !file.endsWith(owners[name])) return;
        path.node.body.body.unshift(
          template.statement.ast`
          globalThis.__RGL_BENCH_COUNT__?.(${t.stringLiteral(name)}, ${name === "GridItemInner" ? t.identifier("props") : t.nullLiteral()});
        `
        );
      }
    }
  };
};
