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
import { grade, listingAnswer, transferValue } from "@dd/dd-views";
import { parseLesson } from "@platform/lesson-schema";

import {
  GOTO_START,
  LAMPS_SYSTEM,
  LAMPS_USER,
  RAM_UNGUARDED,
  USER_REFERENCE,
  USER_START,
} from "./module12";
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

  it("the prediction: the start writes 00 to C1 but goes to program; the store traps with 34 at 024, C1 01", () => {
    expect(listingAnswer(props("predict-c1"))).toBe("01");
    const { edges } = timelineRun(GOTO_START, ROOMS);
    expect(edges.map((e) => e.kind).join(" ")).toBe("run run run run run run trap run run stop");
    const at = (n: number) =>
      edges[n - 1]!.transfers.map((x) => `${x.target} ← ${transferValue(x)}`).join(", ");
    expect(at(4)).toBe("C1 ← 00, PC ← 010");
    expect(at(7)).toBe("C2 ← 024, C1 ← 01, C0 ← 01, C3 ← 34, PC ← 014");
  });

  it("user mode's devices are 7C0 to 7F7: a load at 7F0 traps with 32, at 7F8 with 31", () => {
    expect(causeOf("R2 <= word[0x7F0]")).toBe("32");
    expect(causeOf("R2 <= word[0x7F8]")).toBe("31");
    expect(causeOf("R2 <= word[0x7C0]")).toBe("32");
  });

  it("the challenge fails the starting text and a start that goes to program", () => {
    const c = lesson.challenges.find((x) => x.id === "start-user")!;
    const gotoStart = USER_REFERENCE.replace(
      "        R1 <= program\n        C2 <= R1\n        resume\n",
      "        goto program\n",
    );
    expect(gotoStart).not.toBe(USER_REFERENCE);
    // The handler writes R5 and R6 and puts neither back; or uses R1 as its scratch.
    const unsaved = USER_REFERENCE.replace(
      "handler: word[0x410] <= R5      // save R5 and R6\n        word[0x418] <= R6\n        R5 <= C3",
      "handler: R5 <= C3",
    ).replace(
      "        R6 <= word[0x418]       // put R6 and R5 back\n        R5 <= word[0x410]\n",
      "",
    );
    const r1Scratch = unsaved.replace(
      /R5 <= C2\n {8}R5 <= R5 \+ 4\n {8}C2 <= R5/,
      "R1 <= C2\n        R1 <= R1 + 4\n        C2 <= R1",
    );
    for (const t of [unsaved, r1Scratch]) expect(t).not.toBe(USER_REFERENCE);
    expect(r1Scratch).not.toBe(unsaved);
    for (const text of [USER_START, gotoStart, unsaved, r1Scratch])
      expect(grade(c, { text }).passed, text).toBe(false);
    expect(grade(c, { text: USER_REFERENCE }).passed).toBe(true);
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
