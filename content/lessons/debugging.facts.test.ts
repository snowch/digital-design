// Copyright © 2026 Christopher Snow

// Facts the debugging lesson's prose states (briefs 6A to 6C), read off runs of the debugger on
// the reference.

import { describe, expect, it } from "vitest";

import { assembleChecked, debugFinish, debugStart, debugStep, runScenario } from "@dd/dd-model";
import { debuggerAnswer, resultsOf } from "@dd/dd-views";
import { parseLesson } from "@platform/lesson-schema";

import { COUNT_RUNS, TOTAL_RUNS, debugging, total, warmerCount } from "./debugging";
import { OFF_BY_ONE, OFF_BY_ONE_MENDED, STACK_IN_ROM, TWO_MISTAKES, logData } from "./module11";

const lesson = parseLesson(debugging);
const props = (id: string) =>
  lesson.sections.flatMap((s) => s.interactives).find((x) => x.id === id)!.props as never;
const LOG1 = `${OFF_BY_ONE}\n${logData([-190, -181, -175, -170], -180)}`;
const rooms = (a: number, b: number) => ({
  door: 0 as const,
  warm: 0 as const,
  sensorA: BigInt(a),
  sensorB: BigInt(b),
});

describe("facts for the debugging lesson", () => {
  it("the five logs: 1 for log 1's 2, 0 for logs 4 and 5's 1, logs 2 and 3 right", () => {
    expect(
      resultsOf(props("count-results")).map((r) => [r.log.asks["display"], r.left["display"]]),
    ).toEqual([
      ["2", "1"],
      ["1", "1"],
      ["1", "1"],
      ["1", "0"],
      ["1", "0"],
    ]);
  });

  it("the first pause at next after 6, R2 3; four pauses at 050 to 068; 1 shown; 28; stop at 038", () => {
    expect(debuggerAnswer(props("predict-count"))).toBe("3");
    const p = assembleChecked(LOG1).program!;
    expect([p.labels["next"], p.labels["log"]]).toEqual([0x18, 0x50]);
    let s = debugStart(p.rom);
    const pauses: [number, bigint | undefined, bigint | undefined][] = [];
    while (!s.stopped) {
      s = debugStep(s);
      if (s.cpu.pc === 0x18n) pauses.push([s.ran, s.cpu.regs[1], s.cpu.regs[2]]);
    }
    expect(pauses).toEqual([
      [6, 0x50n, 3n],
      [12, 0x58n, 2n],
      [18, 0x60n, 1n],
      [25, 0x68n, 0n],
    ]);
    expect([s.cpu.display, s.ran]).toEqual([1n, 28]);
    expect(s.stopped).toMatchObject({ pc: 0x38n });
  });

  it("the stack at 400: cause 34 at 01C after 5, R14 3F8", () => {
    const s = debugFinish(start(STACK_IN_ROM), rooms(-170, -190));
    expect(s.stopped).toMatchObject({ pc: 0x1cn, reason: { cause: 0x34 } });
    expect([s.ran, s.cpu.regs[14]]).toEqual([5, 0x3f8n]);
  });

  it("two mistakes: every run halts with cause 31 at 044, R14 at 7F8", () => {
    for (const [a, b] of TOTAL_RUNS) {
      const s = debugFinish(start(TWO_MISTAKES), rooms(a, b));
      expect(s.stopped).toMatchObject({ pc: 0x44n, reason: { cause: 0x31 } });
      expect(s.cpu.regs[14]).toBe(0x7f8n);
    }
  });

  it("the challenges' specifications, and the mended count on the empty log", () => {
    expect(COUNT_RUNS.map((r) => warmerCount(r.log, r.limit))).toEqual([2, 1, 1, 1, 0, 3]);
    expect(TOTAL_RUNS.map(([a, b]) => total(a, b))).toEqual([20, 205, 230, 0]);
    const empty = runScenario(OFF_BY_ONE_MENDED, { data: logData([], -180) }).state!;
    expect(empty.cpu.display).toBe(0n);
  });
});

function start(src: string) {
  return debugStart(assembleChecked(src).program!.rom);
}
