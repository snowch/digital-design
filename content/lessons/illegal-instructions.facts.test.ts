// Copyright © 2026 Christopher Snow

// Facts the illegal-instructions lesson's prose states, read off the decoder's circuit and the
// lesson's figures and challenges.

import { describe, expect, it } from "vitest";

import { grade, kindMap } from "@dd/dd-views";
import { parseLesson, testCount } from "@platform/lesson-schema";

import { illegalInstructions } from "./illegal-instructions";
import { LABELS } from "./illegal-instructions.labels";
import { explorerOutputs, faultChecks, predictionAnswer } from "./module3-facts";

const lesson = parseLesson(illegalInstructions);
const challenge = (id: string) => lesson.challenges.find((c) => c.id === id)!;

describe("facts for the illegal-instructions lesson", () => {
  it("the map: 37 instructions, 2 that depend on the constant, 217 illegal", () => {
    const cells = kindMap().flat();
    expect(cells.filter((c) => c === "legal")).toHaveLength(37);
    expect(cells.filter((c) => c === "depends")).toHaveLength(2);
    expect(cells.filter((c) => c === "illegal")).toHaveLength(217);
    const m = kindMap();
    expect([m[8]?.[2], m[8]?.[3]]).toEqual(["depends", "depends"]);
    for (const k of [0, 9, 10, 11, 12, 13, 14, 15])
      expect(m[k]?.every((c) => c === "illegal")).toBe(true);
    expect(m[1]?.map((c) => c === "legal")).toEqual([...Array(16)].map((_, j) => j < 8));
    expect(m[3]?.flatMap((c, j) => (c === "legal" ? [j] : []))).toEqual([0, 1, 8, 9]);
  });

  it("the prediction: 84000005, a stop with 5, gives cause 00", () => {
    expect(predictionAnswer(illegalInstructions, "predict-number")).toBe("00000000");
  });

  it("the checks opened: 82000005 is refused on its number; with 004 it is a job that stops", () => {
    expect(explorerOutputs(illegalInstructions, "checks-open")["CAUSED"]).toBe("00100001");
    const four = explorerOutputs(illegalInstructions, "checks-open", { C: 4 });
    expect([four["CAUSED"], four["STOP"]]).toEqual(["00000000", "1"]);
  });

  it("the faults: each lets two words through", () => {
    expect(faultChecks(illegalInstructions, "check-faults", 0)).toEqual({
      failed: [LABELS.checks.zeros, LABELS.checks.kindNine],
      total: 7,
    });
    expect(faultChecks(illegalInstructions, "check-faults", 1)).toEqual({
      failed: [LABELS.checks.numberFive, LABELS.checks.numberMinusOne],
      total: 7,
    });
  });

  it("the challenges: 13 and 287 tests; the starts fail 3 and 105", () => {
    expect(testCount(challenge("outside-text"))).toBe(13);
    expect(testCount(challenge("checks-text"))).toBe(287);
    const outside = challenge("outside-text");
    const checks = challenge("checks-text");
    expect(grade(outside, outside.initial!).failures).toHaveLength(3);
    expect(grade(checks, checks.initial!).failures).toHaveLength(105);
    for (const c of lesson.challenges) expect(grade(c, c.reference).passed, c.id).toBe(true);
  });
});
