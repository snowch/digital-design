// Copyright © 2026 Christopher Snow

// The numbers the lesson's words state, read off its figures and its challenges' graders.

import { describe, expect, it } from "vitest";

import { grade } from "@dd/dd-views";
import { meetLines } from "@dd/dd-model";
import { parseLesson } from "@platform/lesson-schema";

import { meetFigureAnswer, meetRun } from "./module0-facts";
import { GAP } from "./module0";
import { whatComputersDo as lesson } from "./what-computers-do";

const parsed = parseLesson(lesson);
const challenge = (id: string) => parsed.challenges.find((c) => c.id === id)!;

describe("facts for the lesson on what a computer does", () => {
  it("runs lines 1 to 6 and 9 on Module 1's rooms, and shows 66 with CLASH dark", () => {
    expect(meetFigureAnswer(lesson, "predict-lines")).toBe("1 2 3 4 5 6 9");
    expect(meetRun(lesson, "run")).toEqual({ lines: "1 2 3 4 5 6 9", display: "66", lamps: 0 });
  });

  it("with room A at -50, shows 200 and lights CLASH, lines 7 and 8 run", () => {
    expect(meetRun(lesson, "run", { SENSORA: "-50" })).toEqual({
      lines: "1 2 3 4 5 6 7 8 9",
      display: "200",
      lamps: 4,
    });
  });

  it("with room B failing at -50, shows -134 and leaves CLASH dark", () => {
    expect(meetFigureAnswer(lesson, "room-b-fails")).toBe("none");
    expect(meetRun(lesson, "room-b-fails")).toEqual({
      lines: "1 2 3 4 5 6 9",
      display: "-134",
      lamps: 0,
    });
  });

  it("keeps line 1 as 939530200, and the nine lines as the numbers the fact sheet lists", () => {
    expect(meetLines(GAP).map((l) => l.stored)).toEqual([
      939530200, 939534304, 319959040, 1208158144, 620773476, 1446248451, 620777476, 1208289224,
      2214592512,
    ]);
  });

  it("the limit challenge: 50 passes all 3 tests; the start, 100, fails two; 51 and 49 fail", () => {
    const c = challenge("limit");
    expect(c.tests.kind === "answers" && c.tests.cases.length).toBe(3);
    expect(grade(c, c.reference).passed).toBe(true);
    const start = grade(c, c.initial);
    expect(start.failures.length).toBe(2);
    expect(grade(c, { answers: { limit: "51" } }).passed).toBe(false);
    expect(grade(c, { answers: { limit: "49" } }).passed).toBe(false);
  });

  it("the last challenge: rooms at -100 and -250 show 150 and light CLASH, in 2 tests", () => {
    const c = challenge("in-your-head");
    expect(grade(c, c.reference)).toMatchObject({ passed: true });
    expect(grade(c, { answers: { display: "150", lamp: "dark" } }).failures.length).toBe(1);
  });
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
