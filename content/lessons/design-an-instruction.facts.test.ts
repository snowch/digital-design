// Copyright © 2026 Christopher Snow

// Facts the design-an-instruction lesson's prose states, read off programs run on the reference,
// the decoder and controller of the learner's copy with set if, the block that chooses register
// Y's word, and the lesson's challenges.

import { describe, expect, it } from "vitest";

import {
  applyFaults,
  assemble,
  instructionHex,
  libraryCircuit,
  runProgram,
  stuckAt,
} from "@dd/dd-model";
import { grade, kindSequences, outputsPerStep } from "@dd/dd-views";
import { formatWord } from "@dd/sim";
import { parseLesson, testCount } from "@platform/lesson-schema";

import { designAnInstruction } from "./design-an-instruction";
import { COUNT_COLD_BRANCHES, COUNT_COLD_SET } from "./module10";

const lesson = parseLesson(designAnInstruction);
const challenge = (id: string) => lesson.challenges.find((c) => c.id === id)!;
const SHOP = { door: 0, warm: 0, sensorA: -184n, sensorB: -250n } as const;
const COPY = { registerCheck: true, callThroughRegister: 9, setIf: 10 };

describe("facts for the design-an-instruction lesson", () => {
  it("the word for R5 <- 1 if R2 < R1 signed is A6215000", () => {
    const line = assemble(COUNT_COLD_SET, { callThroughRegister: 9, setIf: 10 }).lines[3]!;
    expect([line.text, instructionHex(line.instruction!)]).toEqual([
      "R5 <= R2 < R1 signed",
      "A6215000",
    ]);
  });

  it("the count of cold rooms: branches 10 written, 9 run; set if 8 and 8; both show 1", () => {
    const b = runProgram(COUNT_COLD_BRANCHES, SHOP);
    const s = runProgram(COUNT_COLD_SET, SHOP, COPY);
    expect([b.written, b.ran, b.state.display]).toEqual([10, 9, 1n]);
    expect([s.written, s.ran, s.state.display, s.state.regs[5], s.state.regs[6]]).toEqual([
      8,
      8,
      1n,
      0n,
      1n,
    ]);
  });

  it("set if takes a register job's edges, FETCH READ ALU WRITE; a branch takes 3", () => {
    expect(kindSequences([10, 1, 5], true, true).map((r) => r.states.join(" "))).toEqual([
      "FETCH READ ALU WRITE",
      "FETCH READ ALU WRITE",
      "FETCH READ ALU",
    ]);
  });

  it("the block for register Y's word: healthy, SET stuck at 0, SET stuck at 1", () => {
    const run = (
      lesson.sections.flatMap((s) => s.interactives).find((x) => x.id === "set-faults")!.props as {
        run: never[];
      }
    ).run;
    const circuit = libraryCircuit("y-word-set");
    const yin = (faults: ReturnType<typeof stuckAt>[]) =>
      outputsPerStep(applyFaults(circuit, faults), run).map((o) =>
        formatWord(o["YIN"]!, 16).replace(/^0x0*(?=.)/, ""),
      );
    expect(yin([])).toEqual(["1", "0", "42", "7"]);
    expect(yin([stuckAt("SET", 0)])).toEqual(["42", "42", "42", "7"]);
    expect(yin([stuckAt("SET", 1)])).toEqual(["1", "0", "1", "1"]);
  });

  it("the challenges: 5, 262 and 33 tests; the decoder's start fails 16, the machine's 1", () => {
    expect([testCount(challenge("design")), testCount(challenge("set-decoder"))]).toEqual([5, 262]);
    expect(testCount(challenge("set-machine"))).toBe(33);
    const d = grade(challenge("set-decoder"), challenge("set-decoder").initial!);
    expect([d.failures.length, d.failures[0]?.label]).toEqual([16, "K A, J 0"]);
    const m = grade(challenge("set-machine"), challenge("set-machine").initial!);
    expect([m.failures.length, m.failures[0]?.label]).toEqual([
      1,
      "at the stop: HALT is 1, the display shows 1",
    ]);
    // The start shows R5 + R6 with each the subtraction: (-184 + 200) + (-250 + 200) = -34.
    expect(BigInt.asIntN(64, BigInt(`0b${m.failures[0]?.actual["DISPLAY"]}`))).toBe(-34n);
    for (const c of lesson.challenges) expect(grade(c, c.reference).passed, c.id).toBe(true);
  });
});
