// Copyright © 2026 Christopher Snow

// The Module 0 lessons are placed by docs/notes/module-0-machine/scripts/place.py from the
// drafts and fixes beside it. A stale chain silently reverts merged wording on the next run,
// as issue #4 records; this test regenerates both lessons with the script and fails on any
// difference, so the drafts, the fixes and the placed prose stay one chain.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const ROOT = `${HERE}../../`;
const SCRIPTS = `${ROOT}docs/notes/module-0-machine/scripts/`;
const OUT = `${ROOT}content/lessons`;

/** Regenerate a lesson and return how the placed files change, restoring them after.
 * Placement writes the files, then Prettier formats them, as the workflow does. */
function placedChanges(lesson: string, args: string[]): { prose: boolean; labels: boolean } {
  const before = {
    prose: readFileSync(`${OUT}/${lesson}.prose.ts`, "utf8"),
    labels: readFileSync(`${OUT}/${lesson}.labels.ts`, "utf8"),
  };
  execFileSync("python3", [`${SCRIPTS}place.py`, lesson, ...args], { cwd: SCRIPTS });
  execFileSync("npx", [
    "prettier",
    "--write",
    `${OUT}/${lesson}.prose.ts`,
    `${OUT}/${lesson}.labels.ts`,
  ]);
  const after = {
    prose: readFileSync(`${OUT}/${lesson}.prose.ts`, "utf8"),
    labels: readFileSync(`${OUT}/${lesson}.labels.ts`, "utf8"),
  };
  return { prose: before.prose !== after.prose, labels: before.labels !== after.labels };
}

describe("Module 0's placed prose regenerates from its drafts unchanged", () => {
  it("what-computers-do", () => {
    expect(placedChanges("what-computers-do", ["1A", "1B", "1C", "F1", "--", "1L", "6V"])).toEqual({
      prose: false,
      labels: false,
    });
  });

  it("inside-the-machine", () => {
    expect(
      placedChanges("inside-the-machine", [
        "2A",
        "2B",
        "2C",
        "2Q",
        "F2A",
        "F2B",
        "--",
        "2L",
        "2QL",
        "F2L",
        "F2V",
        "F1L",
      ]),
    ).toEqual({ prose: false, labels: false });
  });
});
