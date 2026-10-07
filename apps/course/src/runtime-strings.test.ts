// Copyright © 2026 Christopher Snow

// The platform's words as the course gives them to a lesson page: the platform's own, but for the
// heading over the note on how a page differs from a real machine where no figure is clocked.

import { describe, expect, it } from "vitest";

import { LESSONS } from "@dd/content";
import { DEFAULT_STRINGS } from "@platform/lesson-runtime";
import { termPattern } from "@platform/lesson-schema";

import { RUNTIME_STRINGS } from "./runtime-strings";
import { STRINGS } from "./strings";

/** The lessons whose note takes that heading: none of their figures is clocked or stepped. */
const unclocked = LESSONS.filter((l) =>
  l.sections.flatMap((s) => s.interactives).every((x) => (x.timeModel ?? "none") === "none"),
);

describe("the platform's words on a lesson page", () => {
  it("are the platform's own but for the heading over the note where no figure is clocked", () => {
    expect(RUNTIME_STRINGS.lesson.modelVsRealityNoSimulator).toBe(STRINGS.modelNoteHeading);
    expect({
      ...RUNTIME_STRINGS,
      lesson: { ...RUNTIME_STRINGS.lesson, modelVsRealityNoSimulator: "" },
    }).toEqual({
      ...DEFAULT_STRINGS,
      lesson: { ...DEFAULT_STRINGS.lesson, modelVsRealityNoSimulator: "" },
    });
  });

  it("put that heading over the course's first lesson, so it uses no term any lesson introduces", () => {
    expect(unclocked.map((l) => l.id)).toContain(LESSONS[0]!.id);
    const terms = [...new Set(LESSONS.flatMap((l) => l.introduces))];
    expect(terms.filter((t) => termPattern(t).test(STRINGS.modelNoteHeading))).toEqual([]);
  });
});
