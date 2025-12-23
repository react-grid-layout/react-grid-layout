# Fix GitHub Issue

Analyze and fix a GitHub issue for react-grid-layout with full test coverage.

## Usage

```
/fix-issue <issue-number>
```

## Workflow

You are an expert at fixing bugs in the react-grid-layout codebase. Follow this workflow precisely:

### Phase 1: Understand the Issue

1. **Fetch the issue details:**

   ```bash
   gh issue view <issue-number>
   ```

2. **Analyze the issue:**
   - What is the bug or feature request?
   - Is there a reproduction (CodeSandbox link)?
   - What component/hook is affected?
   - Is this a v2 API issue, legacy API issue, or core algorithm issue?

3. **If the issue is unclear or not actionable**, explain why and stop. Don't attempt to fix issues that:
   - Are feature requests without clear requirements
   - Cannot be reproduced
   - Are questions, not bugs
   - Are already fixed

### Phase 2: Investigate the Codebase

1. **Locate the relevant code:**
   - Use Grep/Glob to find related files
   - Read the affected components/functions
   - Understand the current behavior

2. **Identify the root cause:**
   - Trace the code path that causes the bug
   - Look for similar patterns elsewhere that might have the same issue

3. **Review related tests:**
   - Check `test/spec/` for existing tests
   - Understand how similar functionality is tested

### Phase 3: Create a Failing Test

**CRITICAL: Always write the test BEFORE the fix.**

1. **Create a test that reproduces the issue:**
   - Add to the appropriate test file in `test/spec/`
   - The test MUST fail without the fix
   - Include a comment referencing the issue number: `// #<issue-number>`

2. **Verify the test fails:**
   ```bash
   NODE_ENV=test npx jest --testPathPatterns="<test-file>"
   ```

   - If the test passes, the test is invalid - revise it
   - The failure should match the reported bug behavior

### Phase 4: Implement the Fix

1. **Make the minimal necessary changes:**
   - Fix only what's needed to resolve the issue
   - Don't refactor unrelated code
   - Don't add unnecessary features

2. **Add documentation comments if the fix is non-obvious:**
   - Explain WHY the fix works
   - Reference the issue number

3. **Run the test again to verify it passes:**
   ```bash
   NODE_ENV=test npx jest --testPathPatterns="<test-file>"
   ```

### Phase 5: Validate

1. **Run all tests:**

   ```bash
   yarn test
   ```

2. **Run linting:**

   ```bash
   yarn lint
   ```

3. **Format code:**

   ```bash
   yarn fmt
   ```

4. **Fix any failures before proceeding.**

### Phase 6: Commit and PR

1. **Create a branch:**

   ```bash
   git checkout -b fix/issue-<issue-number>-<short-description>
   ```

2. **Commit with a descriptive message:**

   ```bash
   git add <files>
   git commit -m "fix: <description> (#<issue-number>)

   <Explanation of root cause>

   <Explanation of fix>"
   ```

3. **Push and create PR:**

   ```bash
   git push -u origin <branch-name>
   gh pr create --title "fix: <description> (#<issue-number>)" --body "## Summary

   Fixes #<issue-number>

   <Root cause explanation>

   ### The fix

   <Fix explanation>

   ## Test plan

   - [x] Added test that fails without fix
   - [x] Test passes with fix
   - [x] All existing tests pass"
   ```

### Phase 7: Wait for CI and Merge

1. **Wait for CI checks:**

   ```bash
   gh pr checks <pr-number> --watch
   ```

2. **If checks fail**, fix the issues and push again.

3. **Once green, merge:**

   ```bash
   gh pr merge <pr-number> --squash --delete-branch
   ```

4. **Switch back to master:**
   ```bash
   git checkout master && git pull
   ```

## Repository Context

### Key Directories

- `src/core/` - Pure TypeScript algorithms (no React)
- `src/react/components/` - React components (GridLayout, GridItem, etc.)
- `src/react/hooks/` - React hooks (useContainerWidth, useResponsiveLayout, etc.)
- `src/legacy/` - v1 API compatibility wrappers
- `test/spec/` - Jest tests

### Common Bug Patterns

1. **Infinite re-render loops** - Usually caused by:
   - State in useCallback/useEffect dependencies that changes during the callback
   - Fix: Use refs to access current values without triggering re-renders

2. **Layout not updating** - Usually caused by:
   - Missing deep equality checks
   - Props not being synced to state correctly

3. **Legacy API issues** - Check that:
   - Props are correctly mapped to v2 API
   - Compactor selection is correct for the given props

### Running Tests

```bash
# All tests
yarn test

# Specific test file
NODE_ENV=test npx jest --testPathPatterns="<pattern>"

# Watch mode
make test-watch
```

### Before Committing

Always run:

```bash
yarn lint
yarn fmt
```
