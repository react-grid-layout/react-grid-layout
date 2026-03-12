# Fix GitHub Issue

Analyze and fix GitHub issue #$ARGUMENTS for react-grid-layout.

## Workflow

Follow these steps precisely:

### 1. Understand the Issue

Fetch and analyze the issue:

```bash
gh issue view $ARGUMENTS
```

Determine:

- What is the bug? (not feature requests or questions)
- Is there a CodeSandbox reproduction?
- Which component/hook is affected?
- Is this fixable? (has clear reproduction, is actually a bug)

If not actionable, explain why and stop.

### 2. Investigate

- Search for relevant code using Grep/Glob
- Read the affected files
- Identify the root cause
- Check existing tests in `test/spec/`

### 3. Write a Failing Test FIRST

**CRITICAL: The test must fail before implementing the fix.**

Add a test to the appropriate file in `test/spec/` that:

- Reproduces the exact bug behavior
- Includes comment `// #$ARGUMENTS`
- Actually FAILS when run

Verify it fails:

```bash
NODE_ENV=test npx jest --testPathPatterns="<test-file>"
```

If test passes, it's invalid - revise until it fails.

### 4. Implement the Fix

- Make minimal changes to fix the bug
- Add comments explaining non-obvious fixes
- Reference the issue number

Verify test now passes:

```bash
NODE_ENV=test npx jest --testPathPatterns="<test-file>"
```

### 5. Validate

Run in order:

```bash
yarn test
yarn lint
yarn fmt
```

Fix any failures before proceeding.

### 6. Commit and PR

```bash
git checkout -b fix/issue-$ARGUMENTS-<short-desc>
git add <files>
git commit -m "fix: <description> (#$ARGUMENTS)"
git push -u origin fix/issue-$ARGUMENTS-<short-desc>
gh pr create --title "fix: <description> (#$ARGUMENTS)" --body "Fixes #$ARGUMENTS

## Summary
<root cause>

## Fix
<what changed>

## Test plan
- [x] Test fails without fix
- [x] Test passes with fix
- [x] All tests pass"
```

### 7. Wait and Merge

```bash
gh pr checks <pr-number> --watch
gh pr merge <pr-number> --squash --delete-branch
git checkout master && git pull
```

## Key Files

- `src/core/` - Pure algorithms
- `src/react/components/` - React components
- `src/react/hooks/` - React hooks
- `src/legacy/` - v1 compatibility
- `test/spec/` - Tests
