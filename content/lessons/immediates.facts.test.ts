// Copyright © 2026 Christopher Snow

// Facts the immediates lesson's prose states, read off the widening, the reference's branch
// condition, programs run on the reference and the lesson's challenges.

import { describe, expect, it } from "vitest";

import {
  assemble,
  branchSays,
  comparisons,
  constantRanges,
  runProgram,
  widening,
} from "@dd/dd-model";
import { grade, programAnswer, swapAnswer } from "@dd/dd-views";
import { parseLesson, testCount } from "@platform/lesson-schema";

import { PAIRS, immediates } from "./immediates";
import { PROSE } from "./immediates.prose";
import { COUNT_WARM, COUNT_WARM_WRONG, WIDE_SUMS, WIDE_WORD, multiplyLoop } from "./module10";
import { COLDER } from "./module9";

const lesson = parseLesson(immediates);
const challenge = (id: string) => lesson.challenges.find((c) => c.id === id)!;
const props = (id: string) =>
  lesson.sections.flatMap((s) => s.interactives).find((x) => x.id === id)!.props as never;
const ROOMS = { door: 0, warm: 0, sensorA: -200n, sensorB: -250n } as const;

describe("facts for the immediates lesson", () => {
  it("the constants as addresses: 000 to 7FF reach the map, 800 to FFF widen past it", () => {
    expect(
      constantRanges().map((r) => [
        r.part,
        r.first,
        r.last,
        r.firstAddress.toString(16),
        r.lastAddress.toString(16),
        r.cause,
      ]),
    ).toEqual([
      ["rom", 0x000, 0x3ff, "0", "3ff", 0],
      ["ram", 0x400, 0x7bf, "400", "7bf", 0],
      ["devices", 0x7c0, 0x7f7, "7c0", "7f7", 0],
      ["none", 0x7f8, 0x7ff, "7f8", "7ff", 0x31],
      ["negative", 0x800, 0xfff, "fffffffffffff800", "ffffffffffffffff", 0x31],
    ]);
  });

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

  it("800 to FFF widen to negative numbers: a load at constant 800 stops, cause 31", () => {
    for (const c of [0x800, 0xabc, 0xfff]) expect(widening(c).wSigned < 0n).toBe(true);
    expect(runProgram("R1 <= word[-2048]\nstop").stopped).toEqual({ kind: "trap", cause: 0x31 });
  });

  it("the overflowing pair: R1 - R2 overflows and decides < and >=; R2 - R1 does not", () => {
    const rows = comparisons((1n << 63n) - 1n, -1n).filter((c) => c.reading === "signed");
    for (const r of rows.filter((c) => !c.swapped))
      expect([r.relation, r.flags.minus, r.flags.over]).toEqual([r.relation, 1, 1]);
    for (const r of rows.filter((c) => c.swapped))
      expect([r.relation, r.flags.minus, r.flags.over]).toEqual([r.relation, 1, 0]);
    expect(rows.filter((c) => c.swapped).map((c) => c.relation)).toEqual([">", "<="]);
  });

  it("the wide prediction: the sums run 5 instructions; doubling 1250 twice also runs 5", () => {
    expect(programAnswer(props("wide"))).toBe("5");
    const doubling = runProgram(
      "R1 <= 1250\nR1 <= R1 + R1\nR1 <= R1 + R1\nword[display] <= R1\nstop",
    );
    expect([doubling.ran, doubling.state.display]).toEqual([5, 5000n]);
    expect(PROSE.wideLead).toContain("placed in the ROM");
  });

  it("the branches: the colder room's at 008 to 010 is 002; the loop's at 018 to 010 is FFE", () => {
    const line = assemble(COLDER).lines.find((l) => l.address === 8);
    expect(line?.instruction).toBe(0x56230002);
    const back = assemble(multiplyLoop(5)).lines.find((l) => l.address === 0x18);
    expect((back?.instruction ?? 0) & 0xfff).toBe(0xffe);
    expect(back?.text).toContain("goto again");
    expect(assemble(multiplyLoop(5)).lines.find((l) => l.label === "again")?.address).toBe(0x10);
    // Taken 4 times, not taken once: the loop runs 5 times, 4 before it and 2 after.
    expect(runProgram(multiplyLoop(5)).ran).toBe(4 + 3 * 5 + 2);
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
