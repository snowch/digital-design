// Copyright © 2026 Christopher Snow

// Facts the functions lesson's prose states (briefs 3A to 3C, then 3R4), read off the learner's assembler
// and runs of the reference.

import { describe, expect, it } from "vitest";

import { MODULE_9, assembleChecked, runProgram } from "@dd/dd-model";
import { DEFAULT_VIEW_STRINGS, format, gradeProgram, listingAnswer, runAnswer } from "@dd/dd-views";
import { parseLesson } from "@platform/lesson-schema";

import { LARGER_RUNS, RANGE_CALLS, RANGE_RUNS, functions, larger, outOfRange } from "./functions";
import {
  KEEPS_R10,
  KEEPS_R10_BROKEN,
  LARGER_REFERENCE,
  OVER_BY_TESTS,
  TWO_ROOMS,
  TWO_ROOMS_WRITTEN_TWICE,
} from "./module11";

const lesson = parseLesson(functions);
const props = (id: string) =>
  lesson.sections.flatMap((s) => s.interactives).find((x) => x.id === id)!.props as never;
const rooms = (a: number, b: number) => ({
  door: 0 as const,
  warm: 0 as const,
  sensorA: BigInt(a),
  sensorB: BigInt(b),
});
const signed = (v: bigint) => BigInt.asIntN(64, v);

describe("facts for the functions lesson", () => {
  it("the calls at 008 and 018, overBy at 030, the stop at 02C", () => {
    const p = assembleChecked(TWO_ROOMS).program!;
    expect([p.labels["overBy"], p.labels["done"]]).toEqual([0x30, 0x2c]);
    const calls = p.lines.filter((l) => l.text.startsWith("call")).map((l) => l.address);
    expect(calls).toEqual([0x8, 0x18]);
  });

  it("two ways: written twice 20 and run 18; once 18 and run 22; both show 10 with ALARM", () => {
    const twice = runProgram(TWO_ROOMS_WRITTEN_TWICE, rooms(-170, -190), MODULE_9);
    const once = runProgram(TWO_ROOMS, rooms(-170, -190), MODULE_9);
    expect([twice.written, twice.ran, once.written, once.ran]).toEqual([20, 18, 18, 22]);
    for (const r of [twice, once])
      expect([signed(r.state.display), r.state.lamps]).toEqual([10n, 1]);
  });

  it("when the program stops R15 holds 01C; each run stops at 02C", () => {
    expect(listingAnswer(props("predict-return"))).toBe("01C");
    expect(runAnswer(TWO_ROOMS, { SENSORA: "-170", SENSORB: "-190" }, { what: "end" })).toBe(
      "stop",
    );
  });

  it("the spoiled caller: 60 with R10 kept at 10, 100 when overBy works in R10", () => {
    const good = runProgram(KEEPS_R10, rooms(-170, -150), MODULE_9).state;
    const bad = runProgram(KEEPS_R10_BROKEN, rooms(-170, -150), MODULE_9).state;
    expect([signed(good.display), good.regs[10], signed(bad.display), bad.regs[10]]).toEqual([
      60n,
      10n,
      100n,
      50n,
    ]);
  });

  it("the construction: kept in R5, room A's result is lost on -160 and -195", () => {
    expect(LARGER_RUNS.map(([a, b]) => larger(a, b))).toEqual([10, 20, 30, 0, 205]);
    // The overBy the tests add changes R0 and R2 to R9 before it returns.
    const withOverBy = (src: string) => `${src}\n${OVER_BY_TESTS}`;
    const right = runProgram(withOverBy(LARGER_REFERENCE), rooms(-160, -195), MODULE_9);
    const inR5 = runProgram(
      withOverBy(LARGER_REFERENCE.replaceAll("R10", "R5")),
      rooms(-160, -195),
      MODULE_9,
    );
    expect(signed(right.state.display)).toBe(20n);
    expect(signed(inR5.state.display)).not.toBe(20n);
  });

  it("the challenge's specification", () => {
    expect(RANGE_CALLS.map(([r, l, h]) => outOfRange(r, l, h))).toEqual([10, 10, 0, 0, 0, 35, 35]);
    expect(RANGE_RUNS.map((r) => outOfRange(r, 20, 50))).toEqual([10, 0, 25]);
  });

  it("a program with no outOfRange is told the tests call it, not that it does not assemble", () => {
    const t = DEFAULT_VIEW_STRINGS.machine11;
    const c = lesson.challenges.find((x) => x.id === "out-of-range")!;
    const v = gradeProgram(c, { text: "again: goto again" });
    expect(v.blocked).toBeUndefined();
    const calls = c.tests.kind === "answers" ? c.tests.cases.filter((k) => k.given["call"]) : [];
    expect(calls.length).toBeGreaterThan(0);
    for (const k of calls)
      expect(v.failures.find((f) => f.label === k.label)?.detail).toBe(
        format(t.refusals.noFunction, { name: "outOfRange" }),
      );
  });
});
