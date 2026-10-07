// Copyright © 2026 Christopher Snow

// Facts the immediates lesson's prose states, read off the widening, the reference's branch
// condition, programs run on the reference and the lesson's challenges.

import { describe, expect, it } from "vitest";

import { branchSays, comparisons, runProgram, widening } from "@dd/dd-model";
import { grade, swapAnswer } from "@dd/dd-views";
import { parseLesson, testCount } from "@platform/lesson-schema";

import { PAIRS, immediates } from "./immediates";
import { COUNT_WARM, COUNT_WARM_WRONG, WIDE_SUMS, WIDE_WORD } from "./module10";

const lesson = parseLesson(immediates);
const challenge = (id: string) => lesson.challenges.find((c) => c.id === id)!;
const props = (id: string) =>
  lesson.sections.flatMap((s) => s.interactives).find((x) => x.id === id)!.props as never;
const ROOMS = { door: 0, warm: 0, sensorA: -200n, sensorB: -250n } as const;

describe("facts for the immediates lesson", () => {
  it("the constant's range: 7FF is 2047, 800 is -2048, FFF is -1", () => {
    expect([0x7ff, 0x800, 0xfff].map((c) => widening(c).wSigned)).toEqual([2047n, -2048n, -1n]);
  });

  it("the prediction: R1 > R2 signed is if R2 < R1 signed; not-less fails on equal words", () => {
    expect(swapAnswer(props("predict-greater"))).toBe("6:swap");
    // "if R1 >= R2" is taken when R1 equals R2, where R1 > R2 is false.
    expect(branchSays(7, false, 5n, 5n)).toBe(true);
    // "if R2 >= R1" is taken when R1 is less.
    expect(branchSays(7, true, -3n, 5n)).toBe(true);
  });

  it("every comparison's branch holds on the lesson's pairs, the overflowing one among them", () => {
    for (const p of PAIRS)
      for (const c of comparisons(BigInt(p.a), BigInt(p.b))) expect(c.taken).toBe(c.holds);
    // MAX - (-1) overflows: MINUS is 1, OVER is 1, and the signed less is still right.
    const over = comparisons((1n << 63n) - 1n, -1n);
    expect(over.find((c) => c.relation === ">" && c.reading === "signed")?.taken).toBe(true);
    expect(over.find((c) => c.relation === ">" && c.reading === "unsigned")?.taken).toBe(false);
  });

  it("5000: three constant jobs and the store, or one load of a word in the ROM", () => {
    const sums = runProgram(WIDE_SUMS);
    const word = runProgram(WIDE_WORD);
    expect([sums.written, sums.ran, sums.romBytes, sums.state.regs[1]]).toEqual([5, 5, 20, 5000n]);
    expect([word.written, word.ran, word.romBytes, word.state.regs[1]]).toEqual([3, 3, 24, 5000n]);
  });

  it("the trap: with room A at the limit, the right count is 0 and the wrong one 1", () => {
    expect(runProgram(COUNT_WARM, ROOMS).state.display).toBe(0n);
    expect(runProgram(COUNT_WARM_WRONG, ROOMS).state.display).toBe(1n);
  });

  it("the challenges: 3 answers, 2047, FFB and 1FFC; 10 tests, the start fails 8", () => {
    expect(testCount(challenge("reach"))).toBe(3);
    expect(challenge("reach").reference.answers).toEqual({
      largest: "2047",
      back: "FFB",
      furthest: "1FFC",
    });
    // A branch at 01C to 008 is (8 - 28) / 4 = -5 instructions; the furthest from 000 is 4 × 2047.
    expect((0x008 - 0x01c) / 4).toBe(-5);
    expect((4 * 2047).toString(16).toUpperCase()).toBe("1FFC");
    expect(testCount(challenge("greater-text"))).toBe(10);
    const start = grade(challenge("greater-text"), challenge("greater-text").initial!);
    expect([start.failures.length, start.failures[0]?.label]).toEqual([8, "A 5, B -3"]);
    for (const c of lesson.challenges) expect(grade(c, c.reference).passed, c.id).toBe(true);
  });
});
