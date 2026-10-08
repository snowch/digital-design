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
import { grade, listingAnswer, transferValue } from "@dd/dd-views";
import { parseLesson } from "@platform/lesson-schema";

import {
  SERVICE2_REFERENCE,
  SERVICE2_START,
  SERVICES,
  SERVICES_SKIPPING,
  SHOW_DIRECT,
} from "./module12";
import { CALL_ANSWERS, CALL_QUIZ, systemCalls } from "./system-calls";

const signed = (w: bigint) => BigInt.asIntN(64, w);

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

  it("the prediction: the first call system at 06C; C2 holds 070; the handler at 01C", () => {
    const p = assembleChecked(SERVICES).program!;
    expect(p.lines.find((l) => l.address === 0x6c)?.text.trim()).toMatch(/^call system/);
    expect(p.labels["handler"]).toBe(0x1c);
    expect(listingAnswer(props("predict-c2"))).toBe("070");
  });

  it("the run: 25 then 26 shown, 3 calls, stop at 054 after 46 instructions", () => {
    const s = run(SERVICES);
    expect([s.ran, s.traps.length, s.cpu.display]).toEqual([46, 3, 26n]);
    expect(s.traps.map((t) => [t.cause, Number(t.returnPoint)])).toEqual([
      [0x41, 0x70],
      [0x41, 0x7c],
      [0x41, 0x84],
    ]);
    expect(endOf(s.stopped)).toEqual({ key: "stop", values: { address: "054" } });
    expect(shown(SERVICES)).toEqual(["25", "26"]);
    expect(transfers(SERVICES).find((t) => t.includes("C3 ← 41"))).toBe(
      "C2 ← 070, C1 ← 00, C0 ← 01, C3 ← 41, PC ← 01C",
    );
  });

  it("the construction's answers: 6, -66, 0A4", () => {
    expect(CALL_ANSWERS.map((a) => a.value)).toEqual(["6", "-66", "0A4"]);
    expect((1 << 1) | (1 << 2)).toBe(6); // NIGHT is bit 1 of the lamps, CLASH bit 2
    const quiz = SERVICE2_REFERENCE.replace(/program:[\s\S]*$/, "").replace(/\n$/, "");
    const s = run(
      `${SERVICE2_REFERENCE}\nprogram: nothing\n${CALL_QUIZ}\n        R1 <= 4\n        call system`,
    );
    expect(quiz.length).toBeGreaterThan(0);
    expect(signed(s.cpu.display)).toBe(-66n);
  });

  it("adding 4 to C2: 25 three times, then 21 past the end, stop at the fault line 064", () => {
    const p = assembleChecked(SERVICES_SKIPPING).program!;
    expect(p.labels["fault"]).toBe(0x64);
    const s = run(SERVICES_SKIPPING);
    expect(shown(SERVICES_SKIPPING)).toEqual(["25", "25", "25"]);
    expect(s.traps.at(-1)?.cause).toBe(0x21);
    expect(Number(s.traps.at(-1)?.at)).toBe(0x94);
    expect(endOf(s.stopped)).toEqual({ key: "stop", values: { address: "064" } });
  });

  it("the sensor job's challenge fails the starting text and each shortcut the review found", () => {
    const c = lesson.challenges.find((x) => x.id === "sensor-service")!;
    const job2 = (lines: string) =>
      SERVICE2_START.replace(
        "        R8 <= 4\n        if R1 == R8 goto end",
        "        R8 <= 4\n        if R1 == R8 goto end\n        R8 <= 2\n        if R1 == R8 goto sensor",
      ).replace("end:    stop", `${lines}\nend:    stop`);
    const shortcuts = [
      // Job 4's test turned into job 2's: every run ends at the fault line.
      SERVICE2_START.replace(
        "        R8 <= 4\n        if R1 == R8 goto end",
        "        R8 <= 2\n        if R1 == R8 goto sensor\n        R8 <= 4\n        if R1 == R8 goto end",
      )
        .replace(
          "end:    stop",
          "sensor: R1 <= word[sensorA]\n        R8 <= 0\n        if R2 == R8 goto back\n        R1 <= word[sensorB]\n        goto back\nend:    stop",
        )
        .replace(
          "        R8 <= 4\n        if R1 == R8 goto end",
          "        R8 <= 5\n        if R1 == R8 goto end",
        ),
      // A job 2 that ends with its own resume, never putting R8 and R9 back.
      job2(
        "sensor: R1 <= word[sensorA]\n        R8 <= 0\n        if R2 == R8 goto own\n        R1 <= word[sensorB]\nown:    resume",
      ),
      // A job 2 that uses R3 as unsaved scratch.
      job2(
        "sensor: R1 <= word[sensorA]\n        R3 <= 0\n        if R2 == R3 goto back\n        R1 <= word[sensorB]\n        goto back",
      ),
    ];
    for (const text of [SERVICE2_START, ...shortcuts])
      expect(grade(c, { text }).passed, text).toBe(false);
    expect(grade(c, { text: SERVICE2_REFERENCE }).passed).toBe(true);
  });
});
