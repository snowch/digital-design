// Copyright © 2026 Christopher Snow

// Facts the nesting lesson's prose states (briefs 6A to 6C), read off the debugger's runs, the
// timeline's own run and the challenge's runs on Module 12's machine.

import { describe, expect, it } from "vitest";

import {
  MODULE_12,
  QUIET_INPUTS,
  assembleChecked,
  debugFinish,
  debugStart,
  debugStep,
  endOf,
  memoryWord,
  timelineRun,
} from "@dd/dd-model";
import { grade, listingAnswer, transferValue } from "@dd/dd-views";
import { parseLesson } from "@platform/lesson-schema";

import {
  COUNT_OFF,
  NEST_FAULT,
  NEST_LATE,
  NEST_SAVED,
  NEST_UNSAVED,
  WAIT_ON,
  WAIT_REFERENCE,
  WAIT_START,
} from "./module12";
import { NEST_ANSWERS, NEST_DOOR, nesting } from "./nesting";

const lesson = parseLesson(nesting);
const props = (id: string) =>
  lesson.sections.flatMap((s) => s.interactives).find((x) => x.id === id)!.props as never;
const plan = (opens?: number) => ({
  ...QUIET_INPUTS,
  ...(opens !== undefined ? { doorOpensAt: opens } : {}),
});
const run = (src: string, opens?: number) =>
  debugFinish(debugStart(assembleChecked(src).program!.rom), plan(opens), MODULE_12);
const traps = (src: string, opens?: number) =>
  run(src, opens).traps.map((t) => `${t.cause.toString(16)} after ${t.after}`);

describe("facts for the nesting lesson", () => {
  it("a long job with interrupts off: the door's interrupt after 167, ALARM's after 198", () => {
    const s = run(NEST_LATE, NEST_DOOR);
    expect(traps(NEST_LATE, NEST_DOOR)).toEqual([
      "41 after 9",
      "41 after 27",
      "82 after 167",
      "41 after 182",
      "81 after 198",
      "41 after 217",
    ]);
    expect([s.ran, s.shown, s.cpu.lamps]).toEqual([231, [5n, 6n], 1]);
    expect(endOf(s.stopped)).toEqual({ key: "stop", values: { address: "0B4" } });
  });

  it("the prediction: C2 holds 048 after the handler's load faults; the call's return point 07C", () => {
    expect(listingAnswer(props("predict-c2"))).toBe("048");
    const p = assembleChecked(NEST_FAULT).program!;
    expect(p.lines.find((l) => l.address === 0x48)?.text.trim()).toMatch(/^R1 <= word\[R8/);
  });

  it("the timeline: the call at 12, the load's trap at 23, resume to 04C in system mode", () => {
    const { edges } = timelineRun(NEST_FAULT, QUIET_INPUTS, 42);
    const at = (n: number) =>
      edges[n - 1]!.transfers.map((x) => `${x.target} ← ${transferValue(x)}`).join(", ");
    expect(at(12)).toBe("C2 ← 07C, C1 ← 00, C0 ← 01, C3 ← 41, PC ← 01C");
    expect([at(20), at(21), at(22)]).toEqual([
      "R8 ← 10 00A, PC ← 040",
      "R8 ← 20 014, PC ← 044",
      "R8 ← 40 028, PC ← 048",
    ]);
    expect(at(23)).toBe("C2 ← 048, C1 ← 01, C0 ← 01, C3 ← 31, PC ← 01C");
    expect(at(31)).toBe("C2 ← 04C, PC ← 05C");
    expect(at(34)).toBe("C0 ← 01, PC ← 04C");
    expect(edges.slice(34).map((e) => e.pc.toString(16))).toEqual([
      "4c",
      "5c",
      "60",
      "64",
      "4c",
      "5c",
      "60",
      "64",
    ]);
    const s = run(NEST_FAULT);
    expect([s.stopped, s.traps.length]).toEqual([{ kind: "cutOff", ran: 5000 }, 2]);
  });

  it("the construction: C1 11, C3 82, the word at 418 10C, C0 11 after the door part", () => {
    let s = debugStart(assembleChecked(NEST_SAVED).program!.rom);
    while (s.traps.length < 3) s = debugStep(s, plan(NEST_DOOR), MODULE_12);
    const door = s.traps[2]!;
    expect([door.cause, Number(door.at)]).toEqual([0x82, 0x88]);
    expect([
      s.cpu.control[1].toString(2),
      s.cpu.control[3].toString(16),
      memoryWord(s.cpu, 0x418)?.toString(16).toUpperCase(),
    ]).toEqual(["11", "82", "10C"]);
    while (s.cpu.pc !== 0x88n) s = debugStep(s, plan(NEST_DOOR), MODULE_12);
    expect(s.cpu.control[0].toString(2)).toBe("11");
    expect(NEST_ANSWERS.map((a) => a.value)).toEqual(["11", "82", "10C", "11"]);
  });

  it("interrupts let in, nothing kept: the door and timer at 078, ALARM on, cut off, 5 shown", () => {
    const s = run(NEST_UNSAVED, NEST_DOOR);
    expect(traps(NEST_UNSAVED, NEST_DOOR).slice(2)).toEqual(["82 after 61", "81 after 90"]);
    expect(s.traps.slice(2).map((t) => Number(t.at))).toEqual([0x78, 0x78]);
    expect([s.stopped, s.shown, s.cpu.lamps]).toEqual([{ kind: "cutOff", ran: 5000 }, [5n], 1]);
  });

  it("job 5 keeping C1 and C2: the door after 61, the timer after 90, 242 instructions", () => {
    const s = run(NEST_SAVED, NEST_DOOR);
    expect(traps(NEST_SAVED, NEST_DOOR).slice(2, 4)).toEqual(["82 after 61", "81 after 90"]);
    expect([s.ran, s.traps.length, s.shown, s.cpu.lamps]).toEqual([242, 6, [5n, 6n], 1]);
    expect([memoryWord(s.cpu, 0x410), memoryWord(s.cpu, 0x418)]).toEqual([2n, 0x10cn]);
    expect(endOf(s.stopped)).toEqual({ key: "stop", values: { address: "0EC" } });
  });

  it("job 5 saving C1 and C2, the other door times: 30, 5 and never", () => {
    expect(traps(NEST_SAVED, 30).slice(2, 4)).toEqual(["82 after 50", "81 after 79"]);
    expect(traps(NEST_SAVED, 5).slice(0, 2)).toEqual(["82 after 7", "41 after 22"]);
    for (const door of [30, 5]) {
      const s = run(NEST_SAVED, door);
      expect([s.ran, s.traps.length, s.shown, s.cpu.lamps]).toEqual([242, 6, [5n, 6n], 1]);
    }
    const never = run(NEST_SAVED);
    expect([never.ran, never.traps.length, never.shown, never.cpu.lamps]).toEqual([
      211,
      4,
      [5n, 6n],
      0,
    ]);
    expect([memoryWord(never.cpu, 0x410), memoryWord(never.cpu, 0x418)]).toEqual([2n, 0x10cn]);
  });

  it("the challenge fails the starting text and each shortcut the readers found", () => {
    const c = lesson.challenges.find((x) => x.id === "wait-door")!;
    // C2 alone saved and put back.
    const c2Only = WAIT_REFERENCE.replace(
      "        R1 <= C1\n        word[0x410] <= R1       // save C1\n",
      "",
    ).replace(
      "        R1 <= word[0x410]\n        C1 <= R1                // C1 and C2 put back\n",
      "",
    );
    // The figures' job 5 typed in place of job 6.
    const job5 = WAIT_START.replace(COUNT_OFF, WAIT_ON);
    // A fixed status written to C1 instead of the saved one.
    const fixedC1 = WAIT_REFERENCE.replace(
      "        R1 <= word[0x410]\n        C1 <= R1                // C1 and C2 put back",
      "        R1 <= 2\n        C1 <= R1",
    );
    for (const t of [c2Only, fixedC1]) expect(t).not.toBe(WAIT_REFERENCE);
    expect(job5).not.toBe(WAIT_START);
    for (const text of [WAIT_START, c2Only, job5, fixedC1])
      expect(grade(c, { text }).passed, text).toBe(false);
    expect(grade(c, { text: WAIT_REFERENCE }).passed).toBe(true);
  });
});
