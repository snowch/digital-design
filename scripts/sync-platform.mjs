// Copyright © 2026 Christopher Snow

// The learning platform's packages, copied into platform/ from a checkout of
// snowch/learning-platform, with a record of where they came from.
//
//   node scripts/sync-platform.mjs <path to a learning-platform checkout>
//   node scripts/sync-platform.mjs --check
//
// The first form copies the platform's packages (lesson-schema, lesson-runtime, primitives) from
// the checkout's working tree, which must be clean, and writes platform/SOURCE.json: the
// repository, the commit, and a SHA-256 of every file copied. The second form, which the check
// script runs, fails if any file in platform/ differs from what SOURCE.json records, or if a file
// was added or removed. So the copy can only change by syncing it from a commit of the platform:
// a fix to the platform is made in snowch/learning-platform, then synced here.
//
// Why a copy and not a git submodule: cloning, building and deploying the course then need no
// second checkout, and the check above fails on any edit. snowch/learning-platform is public, so
// anybody can check SOURCE.json's commit against it. docs/platform.md records the choice.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";

const PACKAGES = ["lesson-schema", "lesson-runtime", "primitives"];
const ROOT = new URL("..", import.meta.url).pathname;
const TARGET = join(ROOT, "platform");
const SOURCE = join(TARGET, "SOURCE.json");

/** Every file under a directory, skipping node_modules, as paths relative to `base`. */
function filesUnder(dir, base) {
  const out = [];
  for (const entry of readdirSync(dir).sort()) {
    if (entry === "node_modules") continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...filesUnder(path, base));
    else out.push(relative(base, path));
  }
  return out;
}

const sha256 = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");

function hashes() {
  const out = {};
  for (const p of PACKAGES) {
    const dir = join(TARGET, p);
    if (!existsSync(dir)) continue;
    for (const f of filesUnder(dir, TARGET)) out[f] = sha256(join(TARGET, f));
  }
  return out;
}

if (process.argv.includes("--check")) {
  if (!existsSync(SOURCE)) {
    console.error("platform/SOURCE.json is missing: run node scripts/sync-platform.mjs <checkout>");
    process.exit(1);
  }
  const recorded = JSON.parse(readFileSync(SOURCE, "utf8")).files;
  const actual = hashes();
  const problems = [];
  for (const [f, h] of Object.entries(recorded))
    if (!(f in actual)) problems.push(`removed: platform/${f}`);
    else if (actual[f] !== h) problems.push(`edited: platform/${f}`);
  for (const f of Object.keys(actual)) if (!(f in recorded)) problems.push(`added: platform/${f}`);
  if (problems.length) {
    console.error(
      "platform/ differs from the learning platform's commit that SOURCE.json records.\n" +
        "Change the platform in snowch/learning-platform, then sync it here.",
    );
    for (const p of problems) console.error(`  ${p}`);
    process.exit(1);
  }
  process.exit(0);
}

const from = process.argv[2];
if (!from) {
  console.error("usage: node scripts/sync-platform.mjs <learning-platform checkout> | --check");
  process.exit(2);
}
const git = (...args) => execFileSync("git", ["-C", from, ...args], { encoding: "utf8" }).trim();
const dirty = git("status", "--porcelain", "--", "packages");
if (dirty && !process.argv.includes("--allow-dirty")) {
  console.error(`The checkout's packages/ has uncommitted changes:\n${dirty}`);
  process.exit(1);
}
for (const p of PACKAGES) {
  rmSync(join(TARGET, p), { recursive: true, force: true });
  mkdirSync(join(TARGET, p), { recursive: true });
  cpSync(join(from, "packages", p), join(TARGET, p), {
    recursive: true,
    filter: (src) => !src.split("/").includes("node_modules"),
  });
}
const record = {
  repository: "snowch/learning-platform",
  commit: git("rev-parse", "HEAD"),
  packages: PACKAGES,
  files: hashes(),
};
writeFileSync(SOURCE, JSON.stringify(record, null, 2) + "\n");
console.log(`Copied ${Object.keys(record.files).length} files from ${record.commit}.`);
