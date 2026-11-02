// Applied only by jest.ops.cjs. Probe lexical calls and loop work without
// rewriting source files. Function-scoped ordinals survive comment/line edits.
function scope(path) {
  return (
    path.findParent(parent => parent.isFunction()) ??
    path.findParent(parent => parent.isProgram())
  );
}
function ordinal(owner, kind) {
  const next = (owner.getData(kind) ?? 0) + 1;
  owner.setData(kind, next);
  return next;
}
function functionName(path, owner) {
  const parent = path.parentPath;
  let name = path.node.id?.name;
  if (!name && parent.isVariableDeclarator()) name = parent.node.id.name;
  if (!name && (path.isObjectMethod() || path.isClassMethod())) {
    name = path.node.key.name ?? path.node.key.value;
    const declaration = parent.parentPath;
    if (declaration?.isVariableDeclarator())
      name = `${declaration.node.id.name}.${name}`;
  }
  if (!name && parent.isObjectProperty())
    name = parent.node.key.name ?? parent.node.key.value;
  name ??= `callback${ordinal(owner, "callbacks")}`;
  const enclosing = owner.getData("probeName");
  return enclosing ? `${enclosing}.${name}` : name;
}

module.exports = function instrument({ types: t, template }) {
  const bodyNames = new WeakMap();
  const loops = new WeakSet();
  const probe = (host, key, props = t.nullLiteral()) => template.statement.ast`
    ${host}.__RGL_BENCH_COUNT__?.(${t.stringLiteral(key)}, ${props});
  `;
  return {
    visitor: {
      Program(path, state) {
        const file = state.filename.replaceAll("\\", "/").split("/src/")[1];
        if (
          !file ||
          !/^(core|extras)\/|^react\/components\/(GridItem|GridLayout)\.tsx$/.test(
            file
          )
        )
          return;
        // Share a plain holder: Jest VM global-property reads are costly in hot loops.
        state.rglHost = path.scope.generateUidIdentifier("rglBenchHost");
        path.node.body.unshift(
          t.variableDeclaration("const", [
            t.variableDeclarator(
              state.rglHost,
              t.assignmentExpression(
                "??=",
                t.memberExpression(
                  t.identifier("globalThis"),
                  t.identifier("__RGL_BENCH__")
                ),
                t.objectExpression([])
              )
            )
          ])
        );
      },
      Function(path, state) {
        // Other Babel plugins create helpers before module initialization.
        // Only source functions belong to this operation budget.
        // Object methods/arrows can be revisited as function expressions after
        // another plugin lowers them. Keep one entry probe per source body.
        if (bodyNames.has(path.node.body)) {
          path.setData("probeName", bodyNames.get(path.node.body));
          return;
        }
        if (!path.node.loc) return;
        const file = state.filename.replaceAll("\\", "/").split("/src/")[1];
        if (!file) return;
        if (/^(core|extras)\//.test(file)) {
          if (!path.node.body) return; // TypeScript declarations have no entry.
          const name = functionName(path, scope(path));
          path.setData("probeName", name);
          if (!t.isBlockStatement(path.node.body)) {
            path.node.body = t.blockStatement([
              t.returnStatement(path.node.body)
            ]);
          }
          bodyNames.set(path.node.body, name);
          path.node.body.body.unshift(probe(state.rglHost, `${file}:${name}`));
          return;
        }
        const name = path.node.id?.name;
        if (
          name === "GridItemInner" &&
          file === "react/components/GridItem.tsx"
        ) {
          path.node.body.body.unshift(
            probe(
              state.rglHost,
              name,
              t.memberExpression(
                t.identifier("arguments"),
                t.numericLiteral(0),
                true
              )
            )
          );
        }
        if (
          name === "GridLayout" &&
          file === "react/components/GridLayout.tsx"
        ) {
          path.node.body.body.unshift(probe(state.rglHost, name));
        }
      },
      Loop(path, state) {
        if (!path.node.loc) return;
        if (loops.has(path.node.body)) return;
        const file = state.filename.replaceAll("\\", "/").split("/src/")[1];
        if (!file || !/^(core|extras)\//.test(file)) return;
        const owner = scope(path);
        const key = `${file}:${owner.getData("probeName") ?? "module"}:loop${ordinal(owner, "loops")}`;
        if (!t.isBlockStatement(path.node.body))
          path.node.body = t.blockStatement([path.node.body]);
        loops.add(path.node.body);
        path.node.body.body.unshift(probe(state.rglHost, key));
      }
    }
  };
};
