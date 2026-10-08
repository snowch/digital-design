// Copyright © 2026 Christopher Snow

// Facts the interrupts lesson's prose states (briefs 5A to 5C), read off the debugger's runs, the
// timeline's own run and the machine's next edge on Module 12's machine.

import { describe, expect, it } from "vitest";

import {
  MODULE_12,
  QUIET_INPUTS,
  assembleChecked,
  debugFinish,
  debugStart,
  endOf,
  resetMachine,
  step,
  timelineRun,
} from "@dd/dd-model";
import { listingAnswer, transferValue } from "@dd/dd-views";
import { parseLesson } from "@platform/lesson-schema";

import { DOOR_AT, EVENT_ANSWERS, interrupts } from "./interrupts";
import { DOOR_NO_CLEAR, DOOR_OPEN, DOOR_UNSEEN } from "./module12";

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

  it("an event never cleared: cut off after 5000, 416 traps, R2 at 4, ALARM off", () => {
    const s = run(DOOR_NO_CLEAR, DOOR_AT);
    expect(s.stopped).toEqual({ kind: "cutOff", ran: 5000 });
    expect([s.traps.length, s.cpu.regs[2], s.cpu.display, s.cpu.lamps]).toEqual([416, 4n, 0n, 0]);
    const first = s.traps[0]!;
    expect(s.traps.filter((t) => t.at !== first.at)).toEqual([]);
    expect(timelineRun(DOOR_NO_CLEAR, plan(DOOR_AT)).edges[16]?.kind).toBe("trap");
  });
});
