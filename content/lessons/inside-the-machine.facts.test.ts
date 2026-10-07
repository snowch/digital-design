// Copyright © 2026 Christopher Snow

// The numbers the lesson's words state, read off its figures and its challenges' graders.

import { describe, expect, it } from "vitest";

import { grade } from "@dd/dd-views";
import { parseLesson } from "@platform/lesson-schema";

import { insideTheMachine as lesson } from "./inside-the-machine";
import { MODULE_NAMES } from "./module-names";
import { figureOf } from "./module3-facts";
import { meetAnswer } from "@dd/dd-model";

import { levelReading, meetFigure, meetRun } from "./module0-facts";

const parsed = parseLesson(lesson);
const challenge = (id: string) => parsed.challenges.find((c) => c.id === id)!;

describe("facts for the lesson on what the machine is made of", () => {
  it("paused before line 3, the part that adds gives 66, 64 + 2, on every level down to a wire", () => {
    expect(meetAnswer(meetFigure(lesson, "predict-slices"), "ones")).toBe("64 + 2");
    const at = (place: string) => levelReading(lesson, "ladder", place);
    expect(at("line")).toBe("66");
    expect(at("parts")).toBe("66");
    expect(at("adder")).toBe(
      "00000000 00000000 00000000 00000000 00000000 00000000 00000000 01000010",
    );
    expect(at("four")).toBe("0010");
    expect(at("slice")).toBe("1");
    expect(at("smallest")).toBe("1");
    expect(at("wire")).toBe("high");
  }, 30_000);

  it("names the modules 11, 8, 7, 7, 7, 3 and 1 by their names on the cover", () => {
    const levels = figureOf(lesson, "ladder")["levels"] as { module: number; moduleName: string }[];
    expect(levels.map((l) => l.module)).toEqual([11, 8, 7, 7, 7, 3, 1]);
    for (const l of levels) expect(l.moduleName).toBe(MODULE_NAMES[l.module]);
  });

  it("with the wire stuck low, the display shows 64 and every line runs as before", () => {
    expect(meetRun(lesson, "stuck", {}, 0)).toEqual({
      lines: "1 2 3 4 5 6 9",
      display: "64",
      lamps: 0,
    });
    expect(meetRun(lesson, "stuck")).toMatchObject({ display: "66" });
  }, 30_000);

  it("the slices challenge: -180 and -250 give 70, 0100 0110, in 1 test", () => {
    const c = challenge("slices");
    expect(grade(c, c.reference).passed).toBe(true);
    expect(grade(c, { answers: { slices: "0100 0010" } }).passed).toBe(false);
  });

  it("the capstone: R3 becomes 130, line 4 next, from the part that adds, in 4 tests", () => {
    const c = challenge("trace");
    expect(c.tests.kind === "answers" && c.tests.cases.length).toBe(4);
    expect(grade(c, c.reference).passed).toBe(true);
    expect(
      grade(c, { answers: { changed: "R3", value: "130", next: "4", part: "memory" } }).failures
        .length,
    ).toBe(1);
  });
});

describe("the question's figure", () => {
  it("shows the last lesson's run paused before line 9, with 66 on the display", () => {
    const sim = meetFigure(lesson, "box");
    expect(meetAnswer(sim, "next")).toBe("9");
    expect(meetRun(lesson, "box")).toMatchObject({ display: "66" });
  }, 30_000);
});

describe("grading is quick, for the cover and every page re-grade saved work", () => {
  it("grades each challenge's reference in well under 100 ms", () => {
    for (const c of parsed.challenges) {
      grade(c, c.reference);
      const t = performance.now();
      grade(c, c.reference);
      expect(performance.now() - t, c.id).toBeLessThan(100);
    }
  });
});
