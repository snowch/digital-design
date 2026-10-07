// Copyright © 2026 Christopher Snow

// Module 0 comes before every lesson, so every word its pages show is held to the term gate
// against every rationed term, the figures' own words too. The gate (`termProblems`) scans a
// lesson's prose, captions, props and challenges; this test scans what it cannot: the words of
// the figures Module 0 uses (strings.ts, `meet`, and the shared words those figures show), the
// runtime's words a Module 0 page shows, and the plain-English lines of the module's program as
// the figure writes them. It also holds them to Module 10's candidate terms, built at the same
// time.

import { describe, expect, it } from "vitest";

import { meetLines } from "@dd/dd-model";
import { DEFAULT_VIEW_STRINGS, format, lineText } from "@dd/dd-views";
import { DEFAULT_STRINGS } from "@platform/lesson-runtime";
import { termPattern } from "@platform/lesson-schema";

import { LESSONS } from "./index";
import { GAP } from "./module0";

/** Module 10's words, rationed on its own branch while Module 0 was built (the plan). */
const MODULE_10 = [
  "instruction set",
  "encoding",
  "immediate",
  "opcode",
  "architecture",
  "microarchitecture",
];

/** Every string nested in a value. */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

const V = DEFAULT_VIEW_STRINGS;
const R = DEFAULT_STRINGS;

/** What a Module 0 page shows besides its lessons' own text. */
const SHOWN = [
  ...strings(V.meet),
  ...strings(V.prediction),
  ...strings(V.circuit),
  V.answers.terms["roomA"],
  V.answers.terms["roomB"],
  V.answers.terms["display"],
  V.answers.terms["lamp"],
  V.answers.unanswered,
  V.answers.invalid,
  ...strings(R.section),
  R.lesson.objectives,
  R.lesson.modelVsRealityNoSimulator,
  R.challenge.run,
  R.challenge.notRun,
  R.challenge.passing,
  R.challenge.failing,
  R.challenge.complete,
  R.challenge.blocked,
  R.challenge.inputs,
  R.challenge.actual,
  R.challenge.expected,
  R.challenge.reset,
  R.challenge.resetConfirm,
  R.challenge.resetCancel,
  R.challenge.resetDone,
  ...strings(R.hints),
].filter((s): s is string => s !== undefined);

describe("Module 0's figures say nothing a later lesson rations", () => {
  const terms = [...new Set([...LESSONS.flatMap((l) => l.introduces), ...MODULE_10])];

  it("covers the terms of every lesson after it", () => {
    expect(terms.length).toBeGreaterThan(60);
  });

  it("holds the figures' words, and the runtime's words its pages show, to the gate", () => {
    const used = SHOWN.flatMap((text) =>
      terms.filter((t) => termPattern(t).test(text)).map((t) => `${t}: ${text}`),
    );
    expect(used).toEqual([]);
  });

  it("holds the program's lines, as the figure writes them, to the gate", () => {
    const lines = meetLines(GAP).map((l) => lineText(V.meet, l));
    expect(lines.every((l) => !/\{/.test(l))).toBe(true);
    const used = lines.flatMap((text) => terms.filter((t) => termPattern(t).test(text)));
    expect(used).toEqual([]);
  });

  it("holds every sentence for a line to the gate with its slots filled", () => {
    const filled = Object.values(V.meet.lines).map((s) =>
      format(s, { y: "R3", a: "R1", b: "R2", n: "100", line: 9, device: "" }),
    );
    const used = filled.flatMap((text) => terms.filter((t) => termPattern(t).test(text)));
    expect(used).toEqual([]);
  });

  it("holds Module 0's lessons to Module 10's terms as well", () => {
    const own = LESSONS.filter((l) => l.module === 0).flatMap((l) =>
      strings({ ...l, originalityNote: undefined, id: undefined }),
    );
    const used = own.flatMap((text) => MODULE_10.filter((t) => termPattern(t).test(text)));
    expect(used).toEqual([]);
  });
});
