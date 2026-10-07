// Copyright © 2026 Christopher Snow

// Facts the lists lesson's prose states (briefs 2A to 2C), read off the learner's assembler and
// runs of the debugger on the reference.

import { describe, expect, it } from "vitest";

import { assembleChecked, debugStart, debugStep, runProgram, MODULE_9 } from "@dd/dd-model";
import { debuggerAnswer } from "@dd/dd-views";
import { parseLesson } from "@platform/lesson-schema";

import { FIRST_RUNS, RISE_RUNS, firstWarmer, largestRise, lists } from "./lists";
import { COUNT_WARMER, DEFROST_LOG, RISE_REFERENCE, countWarmerOn, logData } from "./module11";

const lesson = parseLesson(lists);
const props = (id: string) =>
  lesson.sections.flatMap((s) => s.interactives).find((x) => x.id === id)!.props as never;

describe("facts for the lists lesson", () => {
  it("count at 038, log at 040, its six words 8 bytes apart to 068", () => {
    const p = assembleChecked(COUNT_WARMER).program!;
    expect([p.labels["count"], p.labels["log"]]).toEqual([0x38, 0x40]);
    expect(p.labels["next"]).toBe(0x14);
  });

  it("the run pauses at next seven times; at the fourth, after 24, R1 058, R2 3, R3 1", () => {
    let s = debugStart(assembleChecked(COUNT_WARMER).program!.rom);
    const pauses: [number, bigint | undefined, bigint | undefined, bigint | undefined][] = [];
    while (!s.stopped) {
      s = debugStep(s);
      if (s.cpu.pc === 0x14n) pauses.push([s.ran, s.cpu.regs[1], s.cpu.regs[2], s.cpu.regs[3]]);
    }
    expect(pauses).toHaveLength(7);
    expect(pauses[0]).toEqual([5, 0x40n, 6n, 0n]);
    expect(pauses[3]).toEqual([24, 0x58n, 3n, 1n]);
    expect(pauses[6]?.[1]).toBe(0x70n);
    expect(debuggerAnswer(props("predict-address"))).toBe("88");
    // The run: 2 warmer, 46 instructions, the stop at 034.
    expect([BigInt.asIntN(64, s.cpu.display), s.ran]).toEqual([2n, 46]);
    expect(s.stopped).toMatchObject({ kind: "machine", pc: 0x34n });
  });

  it("signed and unsigned on the defrost log: 3 against 1", () => {
    const shown = (r: "signed" | "unsigned") =>
      BigInt.asIntN(
        64,
        runProgram(countWarmerOn(DEFROST_LOG, r), undefined, MODULE_9).state.display,
      );
    expect([shown("signed"), shown("unsigned")]).toEqual([3n, 1n]);
  });

  it("the challenges' specifications", () => {
    expect(FIRST_RUNS.map((r) => firstWarmer(r.log, r.limit))).toEqual([3, 0, 1, 3, 0, 2, 7]);
    expect(RISE_RUNS.map((log) => largestRise(log))).toEqual([9, -5, -20, 5, 225, 16]);
    expect(assembleChecked(`${RISE_REFERENCE}\n${logData([-190, -181])}`).problems).toEqual([]);
  });
});
