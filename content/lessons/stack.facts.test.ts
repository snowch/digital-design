// Copyright © 2026 Christopher Snow

// Facts the stack lesson's prose states (briefs 4A to 4C), read off the learner's assembler and
// runs of the debugger on the reference.

import { describe, expect, it } from "vitest";

import {
  assembleChecked,
  debugFinish,
  debugRun,
  debugStart,
  memoryWord,
  type MachineInputs,
} from "@dd/dd-model";
import { debuggerAnswer, depthRun } from "@dd/dd-views";
import { parseLesson } from "@platform/lesson-schema";

import { TOTAL, TOTAL_NO_STACK, TOTAL_NO_START } from "./module11";
import { BOTH_CALLS, BOTH_RUNS, both, stack, STACK_ANSWERS } from "./stack";

const lesson = parseLesson(stack);
const props = (id: string) =>
  lesson.sections.flatMap((s) => s.interactives).find((x) => x.id === id)!.props as never;
const ROOMS: MachineInputs = { door: 0, warm: 0, sensorA: -170n, sensorB: -190n };
const start = (src: string) => debugStart(assembleChecked(src).program!.rom);
const hex = (v: bigint | undefined) => v?.toString(16).toUpperCase();

describe("facts for the stack lesson", () => {
  it("with no stack: calls at 008, 01C and 030, R15 stuck at 034, cut off after 5000", () => {
    const p = assembleChecked(TOTAL_NO_STACK).program!;
    expect(p.lines.filter((l) => l.text.startsWith("call")).map((l) => l.address)).toEqual([
      0x8, 0x1c, 0x30,
    ]);
    const s = debugRun(start(TOTAL_NO_STACK), { inputs: ROOMS }).at(-1)!;
    expect(s.stopped).toEqual({ kind: "cutOff", ran: 5000 });
    expect([s.cpu.display, s.cpu.regs[15]]).toEqual([0n, 0x34n]);
    expect(p.lines.find((l) => l.address === 0x38)?.text).toBe("goto R15");
    expect(p.lines.find((l) => l.address === 0x34)?.text).toBe("R1 <= R1 + R10");
  });

  it("with the stack: R14 7B0 in above; 010 at 7B8; X at 7B0; 20 shown, 30 run, stop at 014", () => {
    expect(debuggerAnswer(props("predict-r14"))).toBe(String(0x7b0));
    const s = debugFinish(start(TOTAL), ROOMS);
    expect([memoryWord(s.cpu, 0x7b8), memoryWord(s.cpu, 0x7b0)]).toEqual([0x10n, undefined]);
    expect([s.cpu.display, s.ran, s.cpu.regs[14]]).toEqual([20n, 30, 0x7c0n]);
    expect(s.stopped).toMatchObject({ pc: 0x14n });
    expect(s.deepest).toBe(0x7b0n);
  });

  it("never started: paused before 018's store, 4 run, R14 X", () => {
    const s = debugFinish(start(TOTAL_NO_START), ROOMS);
    expect(s.stopped).toEqual({ kind: "unknown", reg: 14, use: "address", pc: 0x18n });
    expect([s.ran, s.cpu.regs[14]]).toEqual([4, undefined]);
  });

  it("the depth: at most 2 words, three calls, empty at the end", () => {
    const d = depthRun(TOTAL, ROOMS)!;
    expect([d.deepest, d.calls.length, d.depths.at(-1)]).toEqual([2, 3, 0]);
  });

  it("the challenges' answers", () => {
    expect(STACK_ANSWERS.map((a) => a.value)).toEqual(["7B8", "7B0", "7B0", "7C0"]);
    expect(hex(0x7c0n - 8n)).toBe("7B8");
    expect(BOTH_CALLS.map(([a, b]) => both(a, b))).toEqual([2, 0, 1, 1, 2, 0]);
    expect(BOTH_RUNS.map(([a, b]) => both(a, b))).toEqual([2, 0, 1]);
  });
});
