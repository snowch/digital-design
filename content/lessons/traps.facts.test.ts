// Copyright © 2026 Christopher Snow

// Facts the traps lesson's prose states (briefs 1A to 1C), read off the learner's assembler, the
// timeline's own run and the debugger's runs on Module 12's machine.

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
  NIGHT,
  NIGHT_HALTS,
  NIGHT_NO_SKIP,
  SKIP34_REFERENCE,
  SKIP34_START,
  TRAP_QUIZ,
} from "./module12";
import { TRAP_ANSWERS, traps } from "./traps";

const lesson = parseLesson(traps);
const props = (id: string) =>
  lesson.sections.flatMap((s) => s.interactives).find((x) => x.id === id)!.props as never;
const ROOMS = { ...QUIET_INPUTS, sensorA: -184n, sensorB: -250n };
const run = (src: string) =>
  debugFinish(debugStart(assembleChecked(src).program!.rom), ROOMS, MODULE_12);
const transfers = (src: string, n: number) =>
  timelineRun(src, ROOMS)
    .edges[n - 1]!.transfers.map((x) => `${x.target} ← ${transferValue(x)}`)
    .join(", ");

describe("facts for the traps lesson", () => {
  it("with no handler: halts with 34 at 00C after 3, -184 shown, NIGHT off", () => {
    const s = run(NIGHT_HALTS);
    expect(endOf(s.stopped)).toEqual({ key: "cause34", values: { address: "00C", cause: "34" } });
    expect([s.ran, s.cpu.display, s.cpu.lamps]).toEqual([3, -184n & ((1n << 64n) - 1n), 0]);
  });

  it("the prediction: C2 holds 014 after the trap; the handler is at 024", () => {
    expect(listingAnswer(props("predict-c2"))).toBe("014");
    const p = assembleChecked(NIGHT).program!;
    expect([p.labels["handler"], p.lines.find((l) => l.address === 0x14)?.text.trim()]).toEqual([
      0x24,
      "word[sensorB] <= R0",
    ]);
  });

  it("the timeline: the trap at edge 6, the handler, resume at 12, 15 edges", () => {
    const { edges } = timelineRun(NIGHT, ROOMS);
    expect(edges).toHaveLength(15);
    expect(edges.map((e) => e.kind).join(" ")).toBe(
      "run run run run run trap run run run run run resume run run stop",
    );
    expect(transfers(NIGHT, 2)).toBe("C4 ← 024, PC ← 008");
    expect(transfers(NIGHT, 6)).toBe("C2 ← 014, C1 ← 01, C0 ← 01, C3 ← 34, PC ← 024");
    expect(transfers(NIGHT, 7)).toBe("R5 ← 52 034, PC ← 028");
    expect(transfers(NIGHT, 9)).toBe("R5 ← 20 014, PC ← 030");
    expect(transfers(NIGHT, 10)).toBe("R5 ← 24 018, PC ← 034");
    expect(transfers(NIGHT, 11)).toBe("C2 ← 018, PC ← 038");
    expect(transfers(NIGHT, 12)).toBe("C0 ← 01, PC ← 018");
    expect(edges.at(-1)?.pc).toBe(0x20n);
  });

  it("the run: 14 instructions, 1 trap, -184 shown, NIGHT on, 52 at 400, stop at 020", () => {
    const s = run(NIGHT);
    expect([s.ran, s.traps.length, s.cpu.lamps, memoryWord(s.cpu, 0x400)]).toEqual([14, 1, 2, 52n]);
    expect(endOf(s.stopped)).toEqual({ key: "stop", values: { address: "020" } });
  });

  it("the construction's answers: 010, 33, 01, 01C", () => {
    const { edges } = timelineRun(TRAP_QUIZ, ROOMS);
    const trap = edges.find((e) => e.kind === "trap")!;
    expect(trap.cause).toBe(0x33);
    expect(trap.transfers.map(transferValue)).toEqual(["010", "01", "01", "33", "01C"]);
    expect(TRAP_ANSWERS.map((a) => a.value)).toEqual(["010", "33", "01", "01C"]);
  });

  it("a handler that only resumes: cut off after 5000, NIGHT off, C2 still 014", () => {
    const s = run(NIGHT_NO_SKIP);
    expect(s.stopped).toEqual({ kind: "cutOff", ran: 5000 });
    expect([s.cpu.lamps, s.cpu.control[2]]).toEqual([0, 0x14n]);
  });

  it("the challenge fails the starting text and each shortcut the review found", () => {
    const c = lesson.challenges.find((x) => x.id === "skip-refused")!;
    // Skips by a `goto` through a register: never writes C2 or runs `resume`.
    const gotoSkip = SKIP34_REFERENCE.replace(/C2 <= R5\n\s+resume/, "goto R5");
    expect(gotoSkip).not.toBe(SKIP34_REFERENCE);
    // Written to the tests' causes: stops on 21 and 33, skips every other cause.
    const toTheTests = SKIP34_REFERENCE.replace(
      "        R6 <= 0x34\n        if R5 != R6 goto other\n",
      "        R6 <= 0x21\n        if R5 == R6 goto other\n        R6 <= 0x33\n        if R5 == R6 goto other\n",
    );
    expect(toTheTests).not.toBe(SKIP34_REFERENCE);
    for (const text of [SKIP34_START, gotoSkip, toTheTests])
      expect(grade(c, { text }).passed, text).toBe(false);
    expect(grade(c, { text: SKIP34_REFERENCE }).passed).toBe(true);
  });
});
