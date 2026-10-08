// Copyright © 2026 Christopher Snow

// Facts the user-mode lesson's prose states (briefs 3A to 3C), read off the debugger's runs, the
// timeline's own run and the construction's answers on Module 12's machine.

import { describe, expect, it } from "vitest";

import {
  MODULE_12,
  QUIET_INPUTS,
  assembleChecked,
  debugFinish,
  debugStart,
  endOf,
  memoryWord,
  timelineRun,
} from "@dd/dd-model";
import { listingAnswer, transferValue } from "@dd/dd-views";
import { parseLesson } from "@platform/lesson-schema";

import { LAMPS_SYSTEM, LAMPS_USER, RAM_UNGUARDED } from "./module12";
import { USER_ANSWERS, userMode } from "./user-mode";

const lesson = parseLesson(userMode);
const props = (id: string) =>
  lesson.sections.flatMap((s) => s.interactives).find((x) => x.id === id)!.props as never;
const ROOMS = { ...QUIET_INPUTS, sensorA: -184n, sensorB: -250n };
const run = (src: string) =>
  debugFinish(debugStart(assembleChecked(src).program!.rom), ROOMS, MODULE_12);

/** The cause a line traps with in user mode, or 0 where it runs. */
function causeOf(line: string): string {
  const s = run(`        R1 <= handler
        C4 <= R1
        R1 <= 0
        C1 <= R1
        R1 <= program
        C2 <= R1
        resume
handler: stop
program: ${line}
        stop`);
  const first = s.traps[0]!; // the line is at 020; a trap at 024 is the stop after it
  return Number(first.at) === 0x20 ? first.cause.toString(16) : "0";
}

describe("facts for the user-mode lesson", () => {
  it("in system mode: ALARM goes off at 014, the program stops at 018, nothing traps", () => {
    const s = run(LAMPS_SYSTEM);
    expect([s.ran, s.traps.length, s.cpu.lamps]).toEqual([7, 0, 0]);
    expect(endOf(s.stopped)).toEqual({ key: "stop", values: { address: "018" } });
    const p = assembleChecked(LAMPS_SYSTEM).program!;
    expect(p.lines.find((l) => l.address === 0x14)?.text.trim()).toMatch(/^word\[R1\] <= R2/);
  });

  it("the prediction: C1 holds 00 after the trap", () => {
    expect(listingAnswer(props("predict-c1"))).toBe("00");
  });

  it("the timeline: resume into user mode at 038, the store at 044 traps with 32, stop at 034", () => {
    const { edges } = timelineRun(LAMPS_USER, ROOMS);
    const at = (n: number) =>
      edges[n - 1]!.transfers.map((x) => `${x.target} ← ${transferValue(x)}`).join(", ");
    expect(at(6)).toBe("C1 ← 00, PC ← 018");
    expect(at(9)).toBe("C0 ← 00, PC ← 038");
    expect(edges[12]?.kind).toBe("trap");
    expect(at(13)).toBe("C2 ← 044, C1 ← 00, C0 ← 01, C3 ← 32, PC ← 024");
    const s = run(LAMPS_USER);
    expect([memoryWord(s.cpu, 0x400), memoryWord(s.cpu, 0x408), s.cpu.lamps]).toEqual([
      0x32n,
      0x44n,
      1,
    ]);
    expect(endOf(s.stopped)).toEqual({ key: "stop", values: { address: "034" } });
  });

  it("the construction: each line's cause in user mode is 32, 0, 22, 32", () => {
    const lines = ["R2 <= word[sensorA]", "word[0x400] <= R2", "stop", "R3 <= word[timer]"];
    expect(lines.map(causeOf)).toEqual(USER_ANSWERS.map((a) => a.value));
    expect(USER_ANSWERS.map((a) => a.value)).toEqual(["32", "0", "22", "32"]);
  });

  it("the RAM is not protected: 8 shown, the stop traps with 22", () => {
    const s = run(RAM_UNGUARDED);
    expect([s.cpu.display, memoryWord(s.cpu, 0x410), s.traps.length]).toEqual([8n, 8n, 1]);
    expect(s.traps[0]?.cause).toBe(0x22);
  });
});
