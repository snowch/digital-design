// Copyright © 2026 Christopher Snow

// Facts the stack lesson's prose states (briefs 4A to 4C), read off the learner's assembler and
// runs of the debugger on the reference.

import { describe, expect, it } from "vitest";

import {
  assembleChecked,
  debugFinish,
  debugRun,
  debugStart,
  debugStep,
  endOf,
  memoryWord,
  type MachineInputs,
} from "@dd/dd-model";
import { depthRun, listingAnswer } from "@dd/dd-views";
import { parseLesson } from "@platform/lesson-schema";

import { STACK_QUIZ, SUM_NO_STACK, SUM_OVER, SUM_POPS_SWAPPED } from "./module11";
import { ROOMS_CALLS, ROOMS_RUNS, roomsOver, stack, STACK_ANSWERS } from "./stack";

const lesson = parseLesson(stack);
const props = (id: string) =>
  lesson.sections.flatMap((s) => s.interactives).find((x) => x.id === id)!.props as never;
const ROOMS: MachineInputs = { door: 0, warm: 0, sensorA: -170n, sensorB: -190n };
const start = (src: string) => debugStart(assembleChecked(src).program!.rom);
const hex = (v: bigint | undefined) => v?.toString(16).toUpperCase().padStart(3, "0");

describe("facts for the stack lesson", () => {
  it("with no stack: calls at 008, 01C and 030, R15 stuck at 034, cut off after 5000", () => {
    const p = assembleChecked(SUM_NO_STACK).program!;
    expect(p.lines.filter((l) => l.text.startsWith("call")).map((l) => l.address)).toEqual([
      0x8, 0x1c, 0x30,
    ]);
    const s = debugRun(start(SUM_NO_STACK), { inputs: ROOMS }).at(-1)!;
    expect(s.stopped).toEqual({ kind: "cutOff", ran: 5000 });
    expect([s.cpu.display, s.cpu.regs[15]]).toEqual([0n, 0x34n]);
    expect(p.lines.find((l) => l.address === 0x38)?.text).toBe("goto R15");
    expect(p.lines.find((l) => l.address === 0x34)?.text).toBe("R1 <= R1 + R10");
  });

  it("with the stack: 014 at 7B8 while overBy first runs, R10's 1 at 7B0, R15 044", () => {
    expect(listingAnswer(props("predict-7b8"))).toBe("014");
    let s = start(SUM_OVER);
    for (let k = 0; k < 12; k++) s = debugStep(s, ROOMS);
    expect(hex(s.cpu.pc)).toBe("070");
    expect([memoryWord(s.cpu, 0x7b8), memoryWord(s.cpu, 0x7b0)]).toEqual([0x14n, 1n]);
    expect([s.cpu.regs[14], s.cpu.regs[15], s.cpu.regs[10]]).toEqual([
      0x7b0n,
      0x44n,
      -190n & ((1n << 64n) - 1n),
    ]);
  });

  it("the run: 20 shown, ALARM on from R10's 1, 38 run, stop at 024, R14 back at 7C0", () => {
    const s = debugFinish(start(SUM_OVER), ROOMS);
    expect([s.cpu.display, s.cpu.lamps, s.ran, s.cpu.regs[14], s.cpu.regs[10]]).toEqual([
      20n,
      1,
      38,
      0x7c0n,
      1n,
    ]);
    expect(s.stopped).toMatchObject({ pc: 0x24n });
  });

  it("pops swapped: cause 12 at 001 after 33, R10 holds 014", () => {
    const s = debugFinish(start(SUM_POPS_SWAPPED), ROOMS);
    expect(endOf(s.stopped)).toEqual({ key: "cause12", values: { address: "001", cause: "12" } });
    expect([s.ran, s.cpu.regs[10], s.cpu.display]).toEqual([33, 0x14n, 0n]);
  });

  it("the depth: at most 2 words, three calls, empty at the end", () => {
    const d = depthRun(SUM_OVER, ROOMS)!;
    expect([d.deepest, d.calls.length, d.depths.at(-1)]).toEqual([2, 3, 0]);
  });

  it("the construction's answers, read off a run of check", () => {
    const p = assembleChecked(STACK_QUIZ).program!;
    let s = debugStart(p.rom);
    let inOverBy: bigint | undefined;
    while (!s.stopped) {
      if (s.cpu.pc === BigInt(p.labels["overBy"]!) && inOverBy === undefined)
        inOverBy = s.cpu.regs[14];
      s = debugStep(s, ROOMS);
    }
    const pushes = p.lines.filter((l) => /^word\[R14\] <= /.test(l.text)).map((l) => l.text);
    expect(pushes).toEqual([
      "word[R14] <= R15",
      "word[R14] <= R10",
      "word[R14] <= R11",
      "word[R14] <= R12",
    ]);
    expect(STACK_ANSWERS.map((a) => a.value)).toEqual([
      "7B8",
      "7B0",
      hex(inOverBy),
      hex(memoryWord(s.cpu, 0x7b8)),
    ]);
    expect(hex(inOverBy)).toBe("7A0");
  });

  it("the challenge's specification", () => {
    expect(ROOMS_CALLS.map(([a, b]) => roomsOver(a, b))).toEqual([2, 0, 1, 1, 2, 0]);
    expect(ROOMS_RUNS.map(([a, b]) => roomsOver(a, b))).toEqual([2, 0, 1]);
  });
});
