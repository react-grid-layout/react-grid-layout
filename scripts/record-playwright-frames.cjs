const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

// Called by frames.yml, or offline in its identical cached Docker image.
assert.equal(process.platform, "linux", "Record frames on the Linux image");
const version = require("@playwright/test/package.json").version;
assert.equal(
  version,
  "1.62.1",
  "Update both workflow image tags with Playwright"
);
const directory = path.join(__dirname, "../test/e2e/__frames__");
const isBaseline = name => name !== "manifest.json" && name.endsWith(".json");
// Start from an empty baseline set, so the manifest lists exactly the files
// this run wrote and a renamed or deleted scenario leaves no orphan behind.
fs.mkdirSync(directory, { recursive: true });
for (const name of fs.readdirSync(directory).filter(name => isBaseline(name)))
  fs.rmSync(path.join(directory, name));
const result = spawnSync(
  process.execPath,
  [
    require.resolve("@playwright/test/cli"),
    "test",
    "scenarios.spec.ts",
    "--project=chromium"
  ],
  { stdio: "inherit", env: { ...process.env, RGL_RECORD_FRAMES: "1" } }
);
if (result.error) throw result.error;
assert.equal(
  result.status,
  0,
  "Recorder assertions must pass before publishing baselines"
);
const files = fs
  .readdirSync(directory)
  .filter(name => isBaseline(name))
  .toSorted();
fs.writeFileSync(
  path.join(directory, "manifest.json"),
  JSON.stringify(
    {
      image: `mcr.microsoft.com/playwright:v${version}-noble`,
      files
    },
    undefined,
    2
  ) + "\n"
);
