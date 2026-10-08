// Copyright © 2026 Christopher Snow

// Facts the system-calls lesson's prose states (briefs 4A to 4C), read off the debugger's runs,
// the timeline's own run and the construction's answers on Module 12's machine.

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

import { SERVICES, SERVICES_SKIPPING, SHOW_DIRECT } from "./module12";
import { CALL_ANSWERS, systemCalls } from "./system-calls";

const lesson = parseLesson(systemCalls);
const props = (id: string) =>
  lesson.sections.flatMap((s) => s.interactives).find((x) => x.id === id)!.props as never;
const ROOMS = { ...QUIET_INPUTS, sensorA: -184n, sensorB: -250n };
const run = (src: string) =>
  debugFinish(debugStart(assembleChecked(src).program!.rom), ROOMS, MODULE_12);
const transfers = (src: string) =>
  timelineRun(src, ROOMS, 100).edges.map((e) =>
    e.transfers.map((x) => `${x.target} ← ${transferValue(x)}`).join(", "),
  );
const shown = (src: string) =>
  transfers(src)
    .flatMap((t) => t.split(", "))
    .filter((t) => t.startsWith("word[7C0]"))
    .map((t) => t.split(" ← ")[1]!.split(" ")[0]); // the number before its digits

describe("facts for the system-calls lesson", () => {
  it("a store to the display in user mode: 32, stop at 024, 0 shown, C2 02C", () => {
    const s = run(SHOW_DIRECT);
    expect(assembleChecked(SHOW_DIRECT).program!.labels["program"]).toBe(0x28);
    expect([s.traps[0]?.cause, s.cpu.display, s.cpu.control[2]]).toEqual([0x32, 0n, 0x2cn]);
    expect(memoryWord(s.cpu, 0x400)).toBe(0x32n);
    expect(endOf(s.stopped)).toEqual({ key: "stop", values: { address: "024" } });
  });

  it("the prediction: the first call system at 064; C2 holds 068; the handler at 01C", () => {
    const p = assembleChecked(SERVICES).program!;
    expect(p.lines.find((l) => l.address === 0x64)?.text.trim()).toMatch(/^call system/);
    expect(p.labels["handler"]).toBe(0x1c);
    expect(listingAnswer(props("predict-c2"))).toBe("068");
  });

  it("the run: 25 then 26 shown, 3 calls, stop at 054 after 44 instructions", () => {
    const s = run(SERVICES);
    expect([s.ran, s.traps.length, s.cpu.display]).toEqual([44, 3, 26n]);
    expect(s.traps.map((t) => [t.cause, Number(t.returnPoint)])).toEqual([
      [0x41, 0x68],
      [0x41, 0x74],
      [0x41, 0x7c],
    ]);
    expect(endOf(s.stopped)).toEqual({ key: "stop", values: { address: "054" } });
    expect(shown(SERVICES)).toEqual(["25", "26"]);
    expect(transfers(SERVICES).find((t) => t.includes("C3 ← 41"))).toBe(
      "C2 ← 068, C1 ← 00, C0 ← 01, C3 ← 41, PC ← 01C",
    );
  });

  it("the construction's answers: 1, 4, 2, -250", () => {
    expect(CALL_ANSWERS.map((a) => a.value)).toEqual(["1", "4", "2", "-250"]);
    expect(1 << 1).toBe(2); // NIGHT is bit 1 of the lamps
  });

  it("adding 4 to C2: 25 three times, then 21 past the end, stop at the fault line 064", () => {
    const p = assembleChecked(SERVICES_SKIPPING).program!;
    expect(p.labels["fault"]).toBe(0x64);
    const s = run(SERVICES_SKIPPING);
    expect(shown(SERVICES_SKIPPING)).toEqual(["25", "25", "25"]);
    expect(s.traps.at(-1)?.cause).toBe(0x21);
    expect(Number(s.traps.at(-1)?.at)).toBe(0x8c);
    expect(endOf(s.stopped)).toEqual({ key: "stop", values: { address: "064" } });
  });
});
