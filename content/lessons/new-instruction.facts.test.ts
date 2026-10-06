// Copyright © 2026 Christopher Snow

// Facts the new-instruction lesson's prose states, read off the machine with the call through a
// register as the figures build it, the decoder and the lesson's challenges.

import { describe, expect, it } from "vitest";

import {
  assemble,
  buildDatapath,
  edgeAnswer,
  figureState,
  instructionHex,
  startDatapath,
} from "@dd/dd-model";
import { grade, kindSequences } from "@dd/dd-views";
import { parseLesson, testCount } from "@platform/lesson-schema";

import { SENSORS } from "./memory-access";
import { CHOOSE } from "./module9";
import { figureAnswer, runToStop, signed } from "./module8-facts";
import { newInstruction } from "./new-instruction";

const lesson = parseLesson(newInstruction);
const challenge = (id: string) => lesson.challenges.find((c) => c.id === id)!;

describe("facts for the new-instruction lesson", () => {
  it("the program's words: the call through R4 is 9040F000, the jump back 70F00000", () => {
    const words = assemble(CHOOSE, { callThroughRegister: 9 }).lines.map(
      (l) =>
        `${l.address.toString(16).toUpperCase().padStart(3, "0")} ${instructionHex(l.instruction ?? 0)}`,
    );
    expect(words.slice(0, 3)).toEqual(["000 2500400C", "004 9040F000", "008 84000000"]);
    expect([words[5], words[8]]).toEqual(["014 70F00000", "020 70F00000"]);
  });

  it("the prediction: the call through a register takes 3 edges, as a call does", () => {
    expect(figureAnswer(newInstruction, "predict-call-edges")).toBe("3");
    expect(kindSequences([6, 7, 9], true).map((s) => s.states.join(" "))).toEqual([
      "FETCH READ WRITE",
      "FETCH READ ALU",
      "FETCH READ WRITE",
    ]);
  });

  it("choosing a room: 21 edges, -184 shown, R15 holds 008; with showB, -250", () => {
    const r = runToStop(newInstruction, "choose");
    expect([r.reason, r.edges, signed(r.state.display), r.state.regs[15]]).toEqual([
      "stop",
      21,
      "-184",
      8n,
    ]);
    const b = buildDatapath({
      libraryId: "machine-edges-call",
      program: CHOOSE.replace("R4 <= showA", "R4 <= showB"),
    });
    const sim = startDatapath(b, { inputs: SENSORS });
    for (let n = 0; n < 40 && edgeAnswer(sim, "stop") === "go"; n++) sim.clockCycle("CLK");
    sim.clockCycle("CLK");
    expect(signed(figureState(sim).display)).toBe("-250");
  });

  it("the faults: orCall made an AND loops through showA; orJump made an AND calls itself", () => {
    const call = runToStop(newInstruction, "call-faults", 0, 60);
    expect([call.reason, signed(call.state.display), call.state.regs[15]]).toEqual([
      "go",
      "-184",
      0xcn,
    ]);
    const jump = runToStop(newInstruction, "call-faults", 1, 60);
    expect([jump.reason, jump.state.pc, signed(jump.state.display), jump.state.regs[15]]).toEqual([
      "go",
      4n,
      "0",
      8n,
    ]);
  }, 60_000);

  it("the challenges: 263 and 23 tests; each start fails 17, first on kind 9", () => {
    expect(testCount(challenge("decoder-text"))).toBe(263);
    expect(testCount(challenge("machine-text"))).toBe(23);
    const decoder = grade(challenge("decoder-text"), challenge("decoder-text").initial!);
    expect([decoder.failures.length, decoder.failures[0]?.label]).toEqual([17, "K 9, J 0"]);
    const machine = grade(challenge("machine-text"), challenge("machine-text").initial!);
    expect([machine.failures.length, machine.failures[0]?.label]).toEqual([
      17,
      "004, edge 2 (READ): WRITE after it",
    ]);
    for (const c of lesson.challenges) expect(grade(c, c.reference).passed, c.id).toBe(true);
  });
});
