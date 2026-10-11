// Copyright © 2026 Christopher Snow

// The numbers the compiler chapter states, read off the model: the challenge's runs and the
// attempts each catches, the compiled CLASH line on the whole machine edge by edge, the
// prediction's answer, the generalisation's counts, and the links out of the course. The compiler's
// own output is pinned by dd-model's compile.test.ts.

import { describe, expect, it } from "vitest";

import {
  compile,
  edgeView,
  gradeProgramCase,
  netWord,
  recordRun,
  runCompiled,
  runScenario,
  MEET_PROGRAMS,
  type RecordedRun,
} from "@dd/dd-model";
import { BEYOND_STRINGS, compileAnswer, levelsAnswer } from "@dd/dd-views";
import type { Word } from "@dd/sim";

import {
  BOTH_PROGRAM,
  CHALLENGE_LINE,
  CLASH_PROGRAM,
  COMPILER_REFERENCE,
  COMPILER_RUNS,
  COMPILER_START,
  SHOP_READINGS,
} from "./beyond";
import { compiler } from "./compiler";
import { PROSE } from "./compiler.prose";

const grade = (source: string) =>
  COMPILER_RUNS.map(
    (r) =>
      gradeProgramCase(
        source,
        { sensorA: r.sensorA, sensorB: r.sensorB },
        { lamps: r.lamps, display: 0, end: "stop" },
      ).pass,
  );
const swap = (from: string, to: string) => COMPILER_REFERENCE.replace(from, to);
const hex = (w: Word | undefined) =>
  w && w.known === (1n << BigInt(w.width)) - 1n ? w.value.toString(16).toUpperCase() : "X";
const signed = (w: Word | undefined) =>
  w && w.known === (1n << BigInt(w.width)) - 1n ? BigInt.asIntN(w.width, w.value).toString() : "X";
const figure = (id: string) =>
  compiler.sections.flatMap((s) => s.interactives ?? []).find((f) => f.id === id)!;

describe("the compiler chapter's challenge", () => {
  it("is the compiler's output for its line, and passes all six runs", () => {
    expect(compile(CHALLENGE_LINE).program).toBe(COMPILER_REFERENCE);
    expect(grade(COMPILER_REFERENCE)).toEqual([true, true, true, true, true, true]);
  });

  it("fails from its starting point the three runs where CLASH must light", () => {
    expect(grade(COMPILER_START)).toEqual([false, true, false, true, false, true]);
  });

  it("fails each plausible wrong attempt in at least one run", () => {
    const attempts = {
      figuresBranch: swap("if R4 >= R3 signed", "if R3 < R4 signed"),
      unsigned: swap("if R4 >= R3 signed", "if R4 >= R3 unsigned"),
      notTurnedOver: swap("if R4 >= R3 signed", "if R4 < R3 signed"),
      wrongWayRound: swap(
        "R1 <= word[sensorB]\nR2 <= word[sensorA]",
        "R1 <= word[sensorA]\nR2 <= word[sensorB]",
      ),
      addresses: swap("R1 <= word[sensorB]\nR2 <= word[sensorA]", "R1 <= sensorB\nR2 <= sensorA"),
      storeNumber: swap("R5 <= 4\nword[lamps] <= R5", "word[lamps] <= 4"),
      noStop: swap("after1: stop", "after1: nothing"),
      greater: swap("if R4 >= R3 signed", "if R3 > R4 signed"),
    };
    expect(grade(attempts.figuresBranch)).toEqual([true, false, true, true, true, true]);
    expect(grade(attempts.unsigned)).toEqual([true, true, true, false, true, true]);
    expect(grade(attempts.notTurnedOver).some(Boolean)).toBe(false);
    for (const a of [attempts.wrongWayRound, attempts.addresses])
      expect(grade(a)).toEqual([false, true, false, true, false, true]);
    for (const a of [attempts.storeNumber, attempts.noStop, attempts.greater])
      expect(grade(a).some(Boolean)).toBe(false);
    expect(runScenario(attempts.storeNumber).problems[0]?.code).toBe("storeRegister");
    expect(runScenario(attempts.greater).problems[0]?.code).toBe("noGreater");
  });

  it("has a sentence for every run's rule, and no figure compiles its line", () => {
    for (const r of COMPILER_RUNS) expect(BEYOND_STRINGS.details[r.detail]).toBeTruthy();
    const texts = JSON.stringify(compiler.sections.map((s) => s.interactives ?? []));
    expect(texts).not.toContain("sensorB - sensorA");
    expect(texts).not.toContain(COMPILER_REFERENCE.split("\n")[4]!);
  });
});

describe("the compiler chapter's figures", () => {
  it("asks for the branch the compiler writes after 4 instructions, and no lead gives it", () => {
    const props = figure("predict-branch").props as Parameters<typeof compileAnswer>[0];
    expect(compileAnswer(props)).toBe("if R3 < R4 signed goto after1");
    expect(compile(props.lines[0]!.text).steps[4]!.before).toBe("if R3 >= R4 then lamps <= 4");
    for (const text of [PROSE.prediction, PROSE.p1Question, PROSE.motivation, PROSE.question])
      expect(text).not.toContain("R3 < R4");
  });

  it("runs the CLASH line on the whole machine in 22 edges, the branch's FETCH edge 19", () => {
    const run: RecordedRun = recordRun({
      libraryId: "machine-final",
      program: CLASH_PROGRAM,
      inputs: { SENSORA: SHOP_READINGS.sensorA, SENSORB: SHOP_READINGS.sensorB },
    });
    const at = (frame: number, name: string) => netWord(run.circuit, run.frames[frame] ?? [], name);
    const state = (frame: number) => edgeView(run.circuit, run.frames[frame] ?? []).state;
    expect(run.frames.length - 1).toBe(22);
    expect(figure("branch-gates").props).toMatchObject({ start: 18 });
    // Before edge 19 the branch's word is on the memory's output already: the question hides it.
    expect([state(18), hex(at(18, "PC")), hex(at(18, "FETCHED"))]).toEqual([
      "FETCH",
      "10",
      "56340003",
    ]);
    expect(levelsAnswer(run, 18, "net", "IR", "word")).toBe("56340003");
    // Edge 21 is its ALU edge; MET is 1 before it; at it HR takes -34 and the PC 01C.
    expect([state(19), state(20)]).toEqual(["READ", "ALU"]);
    expect(hex(at(20, "MET"))).toBe("1");
    expect([signed(at(21, "HR")), hex(at(21, "PC"))]).toEqual(["-34", "1C"]);
    // 01C is the stop's address; CLASH stays dark.
    expect(
      runCompiled(compile("if sensorA - sensorB >= 100 then lamps <= 4"), -184, -250).lamps,
    ).toBe(0);
  });

  it("compares 12 instructions, 10 run, with Module 0's 9 and 7, both showing 66", () => {
    const both = runScenario(BOTH_PROGRAM, {
      inputs: { sensorA: BigInt(SHOP_READINGS.sensorA), sensorB: BigInt(SHOP_READINGS.sensorB) },
    });
    const module0 = runScenario(MEET_PROGRAMS.gap!, {
      inputs: { sensorA: BigInt(SHOP_READINGS.sensorA), sensorB: BigInt(SHOP_READINGS.sensorB) },
    });
    expect(both.program!.lines.filter((l) => l.instruction !== undefined)).toHaveLength(12);
    expect(module0.program!.lines.filter((l) => l.instruction !== undefined)).toHaveLength(9);
    expect([both.state!.ran, module0.state!.ran]).toEqual([10, 7]);
    expect([both.state!.cpu.display, module0.state!.cpu.display]).toEqual([66n, 66n]);
    expect([both.state!.cpu.lamps, module0.state!.cpu.lamps]).toEqual([0, 0]);
  });
});

describe("the compiler chapter's links", () => {
  it("points on to Systems From Scratch, in the reflection only, at the addresses checked", () => {
    const links = [...PROSE.reflection.matchAll(/\]\((https:[^)]+)\)/g)].map((m) => m[1]);
    expect(links).toEqual([
      "https://snowch.github.io/computer-systems/what-a-computer-does-with-a-program/",
      "https://snowch.github.io/computer-systems/reading-a-listing/",
      "https://snowch.github.io/computer-systems/machine-level-code-on-riscv/",
    ]);
    const elsewhere = Object.entries(PROSE).filter(
      ([k, v]) => k !== "reflection" && JSON.stringify(v).includes("https:"),
    );
    expect(elsewhere).toEqual([]);
  });
});
