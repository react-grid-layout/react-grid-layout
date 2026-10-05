# AGENTS.md — for AI coding agents

## Architecture maps — read these first

The module structure, public API surface, data models, and recent behavioral
changes are documented in the generated maps in `codemaps/`. Load them before
making edits:

- `codemaps/architecture.md` — module boundaries, package exports, dependency flow, recent changes
- `codemaps/frontend.md` — React components + hooks, key behavior
- `codemaps/backend.md` — core algorithms, config defaults, position strategies
- `codemaps/data.md` — types, config interfaces, strategy contracts

Regenerate with `/update-codemaps` after substantial changes. These are
generated derivatives — edit the source, not the maps.

## Knowledge graph — for structural/impact queries

`graphify-out/` holds an AST knowledge graph of the codebase (nodes = symbols,
edges tagged EXTRACTED/INFERRED). Useful when codemaps can't answer a
structural question: `graphify explain "Symbol"`, `graphify affected "Symbol"`,
`graphify path "A" "B"`, `graphify query "how does X work"`. Rebuild with
`/graphify` or `graphify update .`. Note: `graphify-out/` is gitignored.

## Key invariants

- **Always use `yarn`** (v1 lockfile) — corepack yarn 4 breaks on it. Use
  `npx -y yarn@1.22.22` for lock operations.
- `src/core/` is pure TypeScript, no React dependencies.
- `src/legacy/` is the v1 API compatibility layer wrapping v2 components.
- All grid items need a unique `key` matching `i` in layout.
- Run `yarn fmt` (prettier) before committing — CI fails otherwise.

## Development commands

```bash
make test          # full Jest suite
make build         # ESM + CJS + DTS via tsup
make dev           # dev server on :4002
make e2e-build && yarn playwright test   # Playwright e2e
```

Full project guidance, testing conventions, and custom skills live in
[`CLAUDE.md`](CLAUDE.md).
