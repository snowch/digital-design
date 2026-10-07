// Copyright © 2026 Christopher Snow

// Facts the functions lesson's prose states (briefs 3A to 3C), read off the learner's assembler
// and runs of the reference.

import { describe, expect, it } from "vitest";

import { MODULE_9, assembleChecked, runProgram } from "@dd/dd-model";
import { debuggerAnswer } from "@dd/dd-views";
import { parseLesson } from "@platform/lesson-schema";

import { ABOVE_CALLS, TWO_ROOM_RUNS, above, functions } from "./functions";
import { KEEPS_R10, KEEPS_R10_BROKEN, TWO_ROOMS, TWO_ROOMS_WRITTEN_TWICE } from "./module11";

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
  it("the calls at 008 and 018, above at 030, the stop at 02C", () => {
    const p = assembleChecked(TWO_ROOMS).program!;
    expect([p.labels["above"], p.labels["done"]]).toEqual([0x30, 0x2c]);
    const calls = p.lines.filter((l) => l.text.startsWith("call")).map((l) => l.address);
    expect(calls).toEqual([0x8, 0x18]);
  });

  it("two ways: written twice 18 and run 14; once 17 and run 18; both show 10 with ALARM", () => {
    const twice = runProgram(TWO_ROOMS_WRITTEN_TWICE, rooms(-170, -190), MODULE_9);
    const once = runProgram(TWO_ROOMS, rooms(-170, -190), MODULE_9);
    expect([twice.written, twice.ran, once.written, once.ran]).toEqual([18, 14, 17, 18]);
    for (const r of [twice, once])
      expect([signed(r.state.display), r.state.lamps]).toEqual([10n, 1]);
  });

  it("after the second call R15 holds 01C", () => {
    expect(debuggerAnswer(props("predict-return"))).toBe(String(0x1c));
  });

  it("the spoiled caller: 60 with R10 kept at 10, 100 when above uses R10", () => {
    const good = runProgram(KEEPS_R10, rooms(-170, -150), MODULE_9).state;
    const bad = runProgram(KEEPS_R10_BROKEN, rooms(-170, -150), MODULE_9).state;
    expect([signed(good.display), good.regs[10], signed(bad.display), bad.regs[10]]).toEqual([
      60n,
      10n,
      100n,
      50n,
    ]);
  });

  it("the challenge's specification", () => {
    expect(ABOVE_CALLS.map(([r, l]) => above(r, l))).toEqual([10, 0, 0, 205, 50, 0]);
    expect(TWO_ROOM_RUNS.map(([a, b]) => [above(a, -180), above(b, -200) > 0])).toEqual([
      [10, true],
      [0, false],
      [205, true],
    ]);
  });
});
