#!/usr/bin/env node
"use strict";

// Pre-publish gate for `make publish`.
//
// publish is the only target that touches the network, and both things it does
// are hard to walk back: the git push moves master, and an npm version can never
// be replaced, only deprecated. Each check reports the specific command that
// fixes it rather than just refusing.
//
// Note this repo tags bare versions (`2.2.3`), not `v2.2.3` — see the release
// macro in the Makefile.

const { execFileSync } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const pkg = require(path.join(root, "package.json"));
const tag = pkg.version;

const git = (...args) =>
  execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
const short = sha => sha.slice(0, 8);

function fail(problem, fix) {
  console.error(`\n✗ release check failed: ${problem}`);
  console.error(`  fix: ${fix}\n`);
  process.exit(1);
}

// ── 1. Clean tree ────────────────────────────────────────────────────────────
// Publishing from a dirty tree puts files on npm that are in no commit, so the
// tag stops describing what shipped. Untracked files are fine; they are neither
// built nor packed.
if (git("status", "--porcelain", "--untracked-files=no")) {
  fail(
    "the working tree has uncommitted changes",
    "commit or stash them, then re-run"
  );
}

// ── 2. On master, not detached ───────────────────────────────────────────────
// Checking out a tag and running make publish detaches HEAD. The old recipe then
// pushed `HEAD:master`, which tries to move master *backwards* onto the tag and
// is rejected as a non-fast-forward.
const branch = git("rev-parse", "--abbrev-ref", "HEAD");
if (branch !== "master") {
  fail(
    branch === "HEAD"
      ? "HEAD is detached (checking out a tag does this)"
      : `you are on branch ${branch}, not master`,
    "git checkout master"
  );
}

// ── 3. The version is not already on npm ─────────────────────────────────────
// Deliberately ahead of the tag checks. Sitting on master just after a release
// trips "the tag is not the tip" too, but that is not the useful advice there:
// the version is spent, so the answer is to cut a new one, not to move the tag.
let published = "";
try {
  published = execFileSync(
    "npm",
    ["view", `${pkg.name}@${pkg.version}`, "version"],
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }
  ).trim();
} catch {
  // npm exits non-zero with E404 when the version does not exist, which is the
  // state we want. Anything else surfaces at `npm publish` a moment later.
}
if (published) {
  fail(
    `${pkg.name}@${pkg.version} is already published`,
    "make release-patch to cut a new version"
  );
}

// ── 4. The tag exists and is exactly HEAD ────────────────────────────────────
let tagged;
try {
  tagged = git("rev-parse", "--verify", "--quiet", `${tag}^{commit}`);
} catch {
  fail(
    `there is no tag ${tag} for the version in package.json`,
    "make release-patch (or release-minor / release-major)"
  );
}
const head = git("rev-parse", "HEAD");
if (tagged !== head) {
  fail(
    `${tag} points at ${short(tagged)} but HEAD is ${short(head)}, so the tag is not the tip`,
    `you committed after tagging. If ${tag} is not on npm yet, move it: ` +
      `git tag -f ${tag} -m "release ${tag}" && git push --force origin ${tag}`
  );
}

// ── 5. The push must fast-forward ────────────────────────────────────────────
try {
  git("fetch", "--quiet", "origin");
} catch {
  fail("could not reach origin", "check your network, then re-run");
}
const remote = git("rev-parse", "origin/master");
if (remote !== head) {
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", remote, head], {
      cwd: root
    });
  } catch {
    fail(
      `origin/master (${short(remote)}) is not an ancestor of HEAD (${short(head)})`,
      "git pull --rebase origin master, re-run make lint test, then move the tag to the new tip"
    );
  }
}

console.log(
  `✓ release check OK: ${tag} == HEAD == ${short(head)}, clean tree on master, ` +
    `origin fast-forwards, ${pkg.version} not yet on npm`
);
