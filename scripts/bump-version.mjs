#!/usr/bin/env node
// Bumps the app version everywhere it lives. They're always kept in sync:
//   - the root package.json and every apps/*/package.json (shared libraries under configs/, packages/
//     and design/ keep their own versions)
//   - the desktop crate in apps/desktop/src-tauri/Cargo.toml and its entry in Cargo.lock
//     (tauri.conf.json reads the version from apps/desktop/package.json)
//
// Usage: node scripts/bump-version.mjs <patch|minor|major> [--dry-run]

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const LEVELS = ["patch", "minor", "major"];
const PACKAGE_VERSION = /^(\s*"version":\s*")(\d+)\.(\d+)\.(\d+)(")/m;
const CARGO_TOML_VERSION = /^(\[package\]\n(?:(?!\[)[^\n]*\n)*?version = ")(\d+)\.(\d+)\.(\d+)(")/m;
const CARGO_LOCK_VERSION = /^(name = "klart-desktop"\nversion = ")(\d+)\.(\d+)\.(\d+)(")/m;

const [level, ...flags] = process.argv.slice(2);
const dryRun = flags.includes("--dry-run");

if (!LEVELS.includes(level)) {
  console.error(`Usage: node scripts/bump-version.mjs <${LEVELS.join("|")}> [--dry-run]`);
  process.exit(1);
}

const targets = [
  ...execFileSync("git", ["ls-files", "package.json", "apps/*/package.json"], { encoding: "utf8" })
    .split("\n")
    .filter(Boolean)
    .map((file) => ({ file, pattern: PACKAGE_VERSION })),
  { file: "apps/desktop/src-tauri/Cargo.toml", pattern: CARGO_TOML_VERSION },
  { file: "apps/desktop/src-tauri/Cargo.lock", pattern: CARGO_LOCK_VERSION },
];

const files = targets.map(({ file, pattern }) => {
  const content = readFileSync(file, "utf8");
  const match = content.match(pattern);
  if (!match) {
    console.error(`No version found in ${file}`);
    process.exit(1);
  }
  return { file, pattern, content, version: match.slice(2, 5).map(Number) };
});

const versions = new Set(files.map((item) => item.version.join(".")));
if (versions.size !== 1) {
  console.error("App versions are out of sync — fix them before bumping:");
  for (const item of files) console.error(`  ${item.file}: ${item.version.join(".")}`);
  process.exit(1);
}

const [major, minor, patch] = files[0].version;
const next = {
  patch: [major, minor, patch + 1],
  minor: [major, minor + 1, 0],
  major: [major + 1, 0, 0],
}[level].join(".");

for (const item of files) {
  if (!dryRun) writeFileSync(item.file, item.content.replace(item.pattern, `$1${next}$5`));
  console.log(`${item.file}: ${item.version.join(".")} → ${next}`);
}

console.log(`\n${dryRun ? "Would bump" : "Bumped"} ${files.length} files to ${next}`);
