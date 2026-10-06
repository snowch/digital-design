// Copyright © 2026 Christopher Snow

// Every source file carries its author's copyright line near its top. `node scripts/copyright.mjs`
// adds the line to any file without it, and puts it in place of an older wording (another name or
// year); `--check` only lists those files and fails, and the check script runs it so, so a new
// file cannot land without the line.
//
// The line goes first, after only what must come first: a script's `#!` line, an HTML page's
// doctype, or Vitest's `// @vitest-environment` line, which it reads from the top of a test.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const NOTICE = "Copyright © 2026 Christopher Snow";

/** The comment that carries the notice, by file extension. */
const COMMENTS = {
  ts: `// ${NOTICE}`,
  tsx: `// ${NOTICE}`,
  mts: `// ${NOTICE}`,
  cts: `// ${NOTICE}`,
  js: `// ${NOTICE}`,
  mjs: `// ${NOTICE}`,
  cjs: `// ${NOTICE}`,
  css: `/* ${NOTICE} */`,
  sh: `# ${NOTICE}`,
  yml: `# ${NOTICE}`,
  yaml: `# ${NOTICE}`,
  html: `<!-- ${NOTICE} -->`,
};

/** A copyright line in an older wording, which the notice replaces where it stands. */
const OLDER = /Copyright ©/;

/** Lines that must stay above the notice. */
const FIRST = [/^#!/, /^<!doctype/i, /^\/\/ @vitest-environment/];

const check = process.argv.includes("--check");
const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
  encoding: "utf8",
})
  .split("\n")
  .filter((f) => f && Object.hasOwn(COMMENTS, f.split(".").pop() ?? ""));

const missing = [];
for (const file of files) {
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue; // listed by git but deleted from the working tree
  }
  const lines = text.split("\n");
  if (lines.slice(0, 4).some((l) => l.includes(NOTICE))) continue;
  missing.push(file);
  if (check) continue;
  const comment = COMMENTS[file.split(".").pop()];
  const older = lines.slice(0, 4).findIndex((l) => OLDER.test(l));
  if (older >= 0) {
    lines[older] = comment;
    writeFileSync(file, lines.join("\n"));
    continue;
  }
  let at = 0;
  while (at < lines.length && FIRST.some((re) => re.test(lines[at] ?? ""))) at++;
  const rest = lines.slice(at);
  const gap = rest[0] === "" ? [] : [""];
  writeFileSync(file, [...lines.slice(0, at), comment, ...gap, ...rest].join("\n"));
}

if (check && missing.length) {
  console.error(
    `These files have no copyright line, or an older one (run node scripts/copyright.mjs):`,
  );
  for (const f of missing) console.error(`  ${f}`);
  process.exit(1);
}
if (!check) console.log(`Added or updated the copyright line in ${missing.length} files.`);
