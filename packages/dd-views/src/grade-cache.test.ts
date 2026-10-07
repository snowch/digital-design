// Copyright © 2026 Christopher Snow

// The book's grader, remembered: a verdict worked out once is given again without running the
// tests, for the same challenge and the same work only, and only as long as the page is open.

import { describe, expect, it } from "vitest";

import { LESSONS } from "@dd/content";
import type { Artifact, Challenge } from "@platform/lesson-schema";
import type { Verdict } from "@platform/lesson-runtime";

import { createBook, grade } from "./book";
import { KEPT_PER_CHALLENGE, rememberVerdicts } from "./grade-cache";
import { INTERACTIVES } from "./interactives";

const challenges = LESSONS.flatMap((l) => l.challenges);
const first = challenges[0]!;
const second = challenges[1]!;

/** The book's grader, counting its runs. */
function counting() {
  const runs: string[] = [];
  const g = (c: Challenge, a: Artifact): Verdict => {
    runs.push(`${c.id} ${JSON.stringify(a)}`);
    return grade(c, a);
  };
  return { runs, g };
}

describe("the book's grader, remembered", () => {
  it("gives a verdict again for the same work without running the tests", () => {
    const { runs, g } = counting();
    const remembered = rememberVerdicts(g);
    const once = remembered(first, first.reference);
    const twice = remembered(first, structuredClone(first.reference));
    expect(twice).toBe(once);
    expect(runs).toHaveLength(1);
  });

  it("runs the tests again for other work, or another challenge", () => {
    const { runs, g } = counting();
    const remembered = rememberVerdicts(g);
    remembered(first, first.reference);
    remembered(first, first.initial);
    remembered(second, first.reference);
    expect(runs).toHaveLength(3);
  });

  it("keeps a learner's recent attempts and lets the oldest go", () => {
    const { runs, g } = counting();
    const remembered = rememberVerdicts(g);
    const attempt = (n: number): Artifact => ({ answers: { n: String(n) } });
    for (let n = 0; n <= KEPT_PER_CHALLENGE; n++) remembered(first, attempt(n));
    expect(runs).toHaveLength(KEPT_PER_CHALLENGE + 1);
    remembered(first, attempt(KEPT_PER_CHALLENGE));
    expect(runs).toHaveLength(KEPT_PER_CHALLENGE + 1);
    remembered(first, attempt(0));
    expect(runs).toHaveLength(KEPT_PER_CHALLENGE + 2);
  });

  it("is what the book grades with, and agrees with the grader on every reference", () => {
    const book = createBook(LESSONS, INTERACTIVES);
    for (const c of challenges.slice(0, 12)) {
      expect(book.grade(c, c.reference).passed).toBe(grade(c, c.reference).passed);
      expect(book.grade(c, c.reference)).toBe(book.grade(c, c.reference));
    }
  });
});
