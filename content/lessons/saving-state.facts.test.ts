// Copyright © 2026 Christopher Snow

// Facts the saving-state lesson's prose states (briefs 2A to 2C), read off the debugger's runs, the
// timeline's own run and the challenges' answers on Module 12's machine.

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
  SAVE_CHOICE_HANDLERS,
  SAVED,
  SAVE_REFERENCE,
  SAVE_START,
  SPOILED,
  STACK_HANDLER,
} from "./module12";
import { SAVE_CHOICES, savingState } from "./saving-state";

const lesson = parseLesson(savingState);
const props = (id: string) =>
  lesson.sections.flatMap((s) => s.interactives).find((x) => x.id === id)!.props as never;
const ROOMS = { ...QUIET_INPUTS, sensorA: -184n, sensorB: -250n };
const run = (src: string) =>
  debugFinish(debugStart(assembleChecked(src).program!.rom), ROOMS, MODULE_12);
const signed = (w: bigint) => BigInt.asIntN(64, w);

describe("facts for the saving-state lesson", () => {
  it("lesson 1's handler spoils R5: 20 shown, 12 instructions, stop at 018", () => {
    const s = run(SPOILED);
    expect([signed(s.cpu.display), s.ran, s.traps.length]).toEqual([20n, 12, 1]);
    expect(endOf(s.stopped)).toEqual({ key: "stop", values: { address: "018" } });
    expect(s.traps[0]?.returnPoint).toBe(0x10n);
  });

  it("the prediction: the word at 408 holds -184", () => {
    expect(listingAnswer(props("predict-display"))).toBe("-184");
  });

  it("the saving handler: -184 shown, 14 instructions, 1 trap, stop at 018", () => {
    const s = run(SAVED);
    expect([signed(s.cpu.display), s.ran, s.traps.length]).toEqual([-184n, 14, 1]);
    expect(signed(memoryWord(s.cpu, 0x408) ?? 0n)).toBe(-184n);
    expect(endOf(s.stopped)).toEqual({ key: "stop", values: { address: "018" } });
  });

  it("the timeline: the trap at edge 5, the save at 6, R5 put back at the edge before resume", () => {
    const { edges } = timelineRun(SAVED, ROOMS);
    const at = (n: number) =>
      edges[n - 1]!.transfers.map((x) => `${x.target} ← ${transferValue(x)}`).join(", ");
    expect(edges[4]?.kind).toBe("trap");
    expect(at(6)).toContain("word[408] ← -184");
    const resume = edges.findIndex((e) => e.kind === "resume");
    expect(at(resume)).toContain("R5 ← -184");
  });

  it("the construction: A and D leave the registers, B and C change one", () => {
    expect(SAVE_CHOICES.map((c) => c.answer)).toEqual(["leaves", "changes", "changes", "leaves"]);
    expect(Object.keys(SAVE_CHOICE_HANDLERS)).toEqual(["a", "b", "c", "d"]);
  });

  it("a handler that saves on the stack: halts with 34 at 01C, the push at 014, R14 3F8", () => {
    const s = run(STACK_HANDLER);
    expect(endOf(s.stopped)).toEqual({ key: "cause34", values: { address: "01C", cause: "34" } });
    expect([s.traps[0]?.at, s.cpu.regs[14]]).toEqual([0x14n, 0x3f8n]);
    expect(assembleChecked(STACK_HANDLER).program!.labels["handler"]).toBe(0x1c);
  });

  it("the challenge fails the starting text and each shortcut the review found", () => {
    const c = lesson.challenges.find((x) => x.id === "save-registers")!;
    // The starting text writes R5 unsaved; the same with any other register in its place.
    const tries = [
      SAVE_START,
      ...["R10", "R0", "R14", "R15"].map((r) => SAVE_START.replaceAll("R5", r)),
      // Writing back fixed words: test 1's, or R5 and R6 rebuilt from R4.
      SAVE_START.replace("        resume", "        R5 <= 46\n        R6 <= 53\n        resume"),
      SAVE_START.replace(
        "        resume",
        "        R5 <= R4 + 7\n        R6 <= R5 + 7\n        resume",
      ),
      // R5 and R6 saved in control registers, with no store.
      SAVE_REFERENCE.replace(
        "handler: word[0x408] <= R5      // save R5 and R6\n        word[0x410] <= R6",
        "handler: C3 <= R5\n        C1 <= R6",
      ).replace(
        "        R6 <= word[0x410]       // put R6 and R5 back\n        R5 <= word[0x408]",
        "        R6 <= C1\n        R5 <= C3",
      ),
    ];
    for (const t of tries.slice(5)) expect(t).not.toBe(SAVE_START);
    expect(tries.at(-1)).not.toBe(SAVE_REFERENCE);
    for (const text of tries) expect(grade(c, { text }).passed, text).toBe(false);
    expect(grade(c, { text: SAVE_REFERENCE }).passed).toBe(true);
  });

  it("the timeline's lead: first press at edge 4, the trap's five transfers at 5, resume's two at 13", () => {
    expect((props("saved-timeline") as { from: number }).from).toBe(3);
    const { edges } = timelineRun(SAVED, ROOMS);
    const at = (n: number) =>
      edges[n - 1]!.transfers.map((x) => `${x.target} ← ${transferValue(x)}`).join(", ");
    expect(at(4)).toBe("R0 ← 0, PC ← 010");
    expect(at(5)).toBe("C2 ← 010, C1 ← 01, C0 ← 01, C3 ← 34, PC ← 01C");
    expect(edges[12]?.kind).toBe("resume");
    expect(at(13)).toBe("C0 ← 01, PC ← 014");
    expect(edges.slice(5, 12).every((e) => e.transfers.length === 2)).toBe(true);
  });
});
