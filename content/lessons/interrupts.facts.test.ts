// Copyright © 2026 Christopher Snow

// Facts the interrupts lesson's prose states (briefs 5A to 5C), read off the debugger's runs, the
// timeline's own run and the machine's next edge on Module 12's machine.

import { describe, expect, it } from "vitest";

import {
  MODULE_12,
  QUIET_INPUTS,
  assembleChecked,
  debugFinish,
  debugRun,
  debugStart,
  endOf,
  resetMachine,
  step,
  timelineRun,
} from "@dd/dd-model";
import { grade, listingAnswer, transferValue } from "@dd/dd-views";
import { parseLesson } from "@platform/lesson-schema";

import { DOOR_AT, EVENT_ANSWERS, interrupts } from "./interrupts";
import {
  DOOR_NO_CLEAR,
  DOOR_OPEN,
  DOOR_UNSEEN,
  TIMER_PART,
  TIMER_REFERENCE,
  TIMER_START,
} from "./module12";

const lesson = parseLesson(interrupts);
const props = (id: string) =>
  lesson.sections.flatMap((s) => s.interactives).find((x) => x.id === id)!.props as never;
const plan = (opens?: number) => ({
  ...QUIET_INPUTS,
  ...(opens !== undefined ? { doorOpensAt: opens } : {}),
});
const run = (src: string, opens?: number) =>
  debugFinish(debugStart(assembleChecked(src).program!.rom), plan(opens), MODULE_12);

describe("facts for the interrupts lesson", () => {
  it("with interrupts off: 30 shown, stop at 054 after 92, the door's bit still set", () => {
    const s = run(DOOR_UNSEEN, DOOR_AT);
    expect([s.ran, s.traps.length, s.cpu.display, s.cpu.lamps, s.cpu.waiting]).toEqual([
      92,
      2,
      30n,
      0,
      2,
    ]);
    expect(endOf(s.stopped)).toEqual({ key: "stop", values: { address: "054" } });
  });

  it("the prediction: C2 holds 0B0, the branch after the add at 0AC; the handler at 01C", () => {
    expect(listingAnswer(props("predict-c2"))).toBe("0B0");
    const p = assembleChecked(DOOR_OPEN).program!;
    expect([p.labels["loop"], p.labels["handler"]]).toEqual([0xac, 0x1c]);
  });

  it("the timeline: the door at 17, its stores at 24 and 26, resume at 30, the timer at 47", () => {
    const { edges } = timelineRun(DOOR_OPEN, plan(DOOR_AT));
    const at = (n: number) =>
      edges[n - 1]!.transfers.map((x) => `${x.target} ← ${transferValue(x)}`).join(", ");
    expect(edges).toHaveLength(136);
    expect(at(16)).toBe("R2 ← 4, PC ← 0B0");
    expect(at(17)).toBe("C2 ← 0B0, C1 ← 10, C0 ← 01, C3 ← 82, PC ← 01C");
    expect(at(24)).toBe("word[7F0] ← 2, PC ← 064");
    expect(at(26)).toBe("word[7E8] ← 20 014, PC ← 06C");
    expect(at(30)).toBe("C0 ← 10, PC ← 0B0");
    expect(at(47)).toBe("C2 ← 0B0, C1 ← 10, C0 ← 01, C3 ← 81, PC ← 01C");
    expect(at(61)).toBe("word[7C8] ← 1, PC ← 08C");
    expect(edges[64]?.kind).toBe("resume");
    expect(edges.at(-1)?.pc).toBe(0x9cn);
  });

  it("the door left open: 132 instructions, traps 82 81 41 41, 30 shown, ALARM on", () => {
    for (const opens of [5, DOOR_AT, 50]) {
      const s = run(DOOR_OPEN, opens);
      expect([s.ran, s.traps.map((t) => t.cause), s.cpu.display, s.cpu.lamps]).toEqual([
        132,
        [0x82, 0x81, 0x41, 0x41],
        30n,
        1,
      ]);
    }
    const never = run(DOOR_OPEN);
    expect([never.ran, never.traps.length, never.cpu.lamps]).toEqual([101, 2, 0]);
  });

  it("the next edge: 82, 0, 81, 0", () => {
    const rom = assembleChecked("        nothing\n        stop").program!.rom;
    for (const a of EVENT_ANSWERS) {
      const s0 = resetMachine(rom);
      const s = { ...s0, control: [a.control, 0n, 0n, 0n, 0x40n] as const, waiting: a.waiting };
      const r = step(s as never, QUIET_INPUTS, MODULE_12);
      expect(r.record.trap ? r.record.trap.cause.toString(16) : "0").toBe(a.value);
    }
  });

  it("an event never cleared: cut off after 5000, 384 traps, R2 at 4, ALARM off", () => {
    const s = run(DOOR_NO_CLEAR, DOOR_AT);
    expect(s.stopped).toEqual({ kind: "cutOff", ran: 5000 });
    expect([s.traps.length, s.cpu.regs[2], s.cpu.display, s.cpu.lamps]).toEqual([384, 4n, 0n, 0]);
    const first = s.traps[0]!;
    expect(s.traps.filter((t) => t.at !== first.at)).toEqual([]);
    expect(timelineRun(DOOR_NO_CLEAR, plan(DOOR_AT)).edges[16]?.kind).toBe("trap");
  });

  it("the door's bit is set at the edge that ends the 16th instruction; the interrupt is the next edge", () => {
    const steps = debugRun(debugStart(assembleChecked(DOOR_OPEN).program!.rom), {
      inputs: plan(DOOR_AT),
      limit: 17,
      options: MODULE_12,
    } as never);
    expect(steps.map((x) => [x.ran, x.cpu.waiting, x.traps.length]).slice(14, 17)).toEqual([
      [15, 0, 0],
      [16, 2, 0],
      [16, 2, 1],
    ]);
    const s5 = run(DOOR_OPEN, 5);
    expect([Number(s5.traps[0]?.returnPoint), s5.traps[0]?.cause]).toEqual([0xa4, 0x82]);
  });

  it("the timer challenge fails the starting text and each shortcut the review found", () => {
    const c = lesson.challenges.find((x) => x.id === "door-timer")!;
    const tick = (lines: string) => TIMER_START.replace("tick:   goto back", lines);
    const shortcuts = [
      // The figures' timer part, which overwrites the lamps.
      tick(TIMER_PART),
      // R2 as unsaved scratch.
      tick(
        "tick:   R8 <= 1\n        word[waiting] <= R8\n        R8 <= word[signals]\n        R2 <= 1\n        R8 <= R8 & R2\n        if R8 != R2 goto back\n        R8 <= word[lamps]\n        R8 <= R8 | R2\n        word[lamps] <= R8\n        goto back",
      ),
      // R5 and R6, never put back.
      tick(
        "tick:   R8 <= 1\n        word[waiting] <= R8\n        R5 <= word[signals]\n        R6 <= 1\n        R5 <= R5 & R6\n        if R5 != R6 goto back\n        R5 <= word[lamps]\n        R5 <= R5 | R6\n        word[lamps] <= R5\n        goto back",
      ),
      // Ending with its own resume: R8 and R9 never put back.
      tick(
        "tick:   R8 <= 1\n        word[waiting] <= R8\n        R8 <= word[signals]\n        R9 <= 1\n        R8 <= R8 & R9\n        if R8 != R9 goto done\n        R8 <= word[lamps]\n        R8 <= R8 | R9\n        word[lamps] <= R8\ndone:   resume",
      ),
      // A fixed lamps word: the figures' part with ALARM and NIGHT written together.
      tick(
        TIMER_PART.replace(
          "        word[lamps] <= R9       // still open: ALARM",
          "        R9 <= 3\n        word[lamps] <= R9",
        ),
      ),
      // 1 added to the lamps' word, not ALARM's bit set.
      tick(
        "tick:   R8 <= 1\n        word[waiting] <= R8\n        R8 <= word[signals]\n        R9 <= 1\n        R8 <= R8 & R9\n        if R8 != R9 goto back\n        R8 <= word[lamps]\n        R8 <= R8 + 1\n        word[lamps] <= R8\n        goto back",
      ),
      // R1, R12 or R13 spoiled unseen in the timer's part.
      tick(
        "tick:   R1 <= 1\n        word[waiting] <= R1\n        R1 <= word[signals]\n        R12 <= 1\n        R1 <= R1 & R12\n        if R1 != R12 goto back\n        R1 <= word[lamps]\n        R1 <= R1 | R12\n        word[lamps] <= R1\n        goto back",
      ),
      // The whole of signals compared with 1: wrong on a warm night.
      tick(
        "tick:   R8 <= 1\n        word[waiting] <= R8\n        R8 <= word[signals]\n        R9 <= 1\n        if R8 != R9 goto back\n        R8 <= word[lamps]\n        R8 <= R8 | R9\n        word[lamps] <= R8\n        goto back",
      ),
    ];
    for (const text of [TIMER_START, ...shortcuts])
      expect(grade(c, { text }).passed, text).toBe(false);
    expect(grade(c, { text: TIMER_REFERENCE }).passed).toBe(true);
  });

  it("a line of the learner's that shares a name with the tests' lines is refused, naming it", () => {
    const c = lesson.challenges.find((x) => x.id === "door-timer")!;
    const text = TIMER_REFERENCE.replace("tick:   R8 <= 1", "tick:   nothing\ntestLoop: R8 <= 1");
    const v = grade(c, { text });
    expect(v.passed).toBe(false);
    expect(v.failures[0]?.detail).toContain("testLoop");
  });
});
