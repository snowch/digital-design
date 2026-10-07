// Copyright © 2026 Christopher Snow

// Module 11: the learner's assembler, the debugger's runs and the program grader.

import { describe, expect, it } from "vitest";

import { assemble, assembleChecked } from "./assemble";
import { debugRun, debugStart, debugStep, memoryWord, RUN_LIMIT } from "./debugger";
import { gradeProgramCase, runScenario } from "./program-tests";

const codes = (source: string) => assembleChecked(source).problems.map((p) => [p.line, p.code]);

describe("the learner's assembler", () => {
  it("makes the same words as the authors' assembler", () => {
    const source = "top: R1 <= word[sensorA]\nif R1 < R2 signed goto top\nstop\nk: word -180";
    expect(assembleChecked(source).program?.rom).toEqual(assemble(source).rom);
  });

  it("lists every refusal at once, each with its line and code", () => {
    expect(
      codes(
        "R1 <= 5000\nif R1 > R2 goto x\nif R1 < R2 goto x\ngoto nowhere\nx: R1 <= R2 * 2\nx: stop",
      ),
    ).toEqual([
      [1, "constantRange"],
      [2, "noGreater"],
      [3, "signedOrUnsigned"],
      [4, "unknownName"],
      [5, "noMultiply"],
      [6, "twice"],
    ]);
  });

  it("names the commonest slips", () => {
    expect(codes("R1 = R2")).toEqual([[1, "useArrow"]]);
    expect(codes("R1 <= R2 + R3 + R4")).toEqual([[1, "twoJobs"]]);
    expect(codes("word[R1] <= 5")).toEqual([[1, "storeRegister"]]);
    expect(codes("x: if R1 < 0 goto x")).toEqual([[1, "compareRegisters"]]);
    expect(codes("call f\nf: stop")).toEqual([[1, "callRegister"]]);
    expect(codes("R1 <= word[R1 + R2]")).toEqual([[1, "addressForm"]]);
    expect(codes("R2: stop")).toEqual([[1, "reservedName"]]);
    expect(codes("goto d\nd: word 5")).toEqual([[1, "dataTarget"]]);
    expect(codes("R5 <= R16")).toEqual([[1, "notRegister"]]);
    expect(codes("x: word 0x10000000000000000")).toEqual([[1, "wordTooWide"]]);
  });

  it("reads a name and a number added: log + 8", () => {
    const p = assembleChecked("R1 <= word[log + 8]\nstop\nlog: word 1, 2").program!;
    expect(p.lines[0]?.instruction).toBe(0x38001010);
  });
});

describe("the debugger", () => {
  it("stops before an address that depends on a register nothing set", () => {
    const s = debugRun(debugStart(assemble("R1 <= word[R3]\nstop").rom)).at(-1)!;
    expect(s.stopped).toEqual({ kind: "unknown", reg: 3, use: "address", pc: 0n });
    expect(s.ran).toBe(0);
  });

  it("cuts a run off after the limit", () => {
    const s = debugRun(debugStart(assemble("x: goto x").rom)).at(-1)!;
    expect(s.stopped).toEqual({ kind: "cutOff", ran: RUN_LIMIT });
  });

  it("pauses before a breakpoint and goes on from it", () => {
    const rom = assemble("R1 <= 3\nR0 <= 0\nx: R1 <= R1 - 1\nif R1 != R0 goto x\nstop").rom;
    const first = debugRun(debugStart(rom), { breakpoints: new Set([8]) }).at(-1)!;
    expect(first.cpu.pc).toBe(8n);
    expect(first.ran).toBe(2);
    const second = debugRun(first, { breakpoints: new Set([8]) }).at(-1)!;
    expect(second.ran).toBe(4);
  });

  it("keeps each open call and the stack as it was made", () => {
    const rom = assemble(
      "R14 <= 0x7C0\ncall f, R15\nstop\nf: R14 <= R14 - 8\nword[R14] <= R15\ncall g, R15\nR15 <= word[R14]\nR14 <= R14 + 8\ngoto R15\ng: goto R15",
    ).rom;
    let s = debugStart(rom);
    for (let i = 0; i < 5; i++) s = debugStep(s);
    expect(s.calls.map((c) => [c.to, c.stack])).toEqual([
      [0xcn, 0x7c0n],
      [0x24n, 0x7b8n],
    ]);
    expect(memoryWord(s.cpu, 0x7b8)).toBe(8n);
    while (!s.stopped) s = debugStep(s);
    expect([s.callsMade, s.returns, s.calls.length]).toEqual([2, 2, 0]);
    expect(s.deepest).toBe(0x7b8n);
  });
});

describe("a program graded by running it", () => {
  const above =
    "above: if R2 < R1 signed goto over\nR1 <= 0\ngoto R15\nover: R1 <= R1 - R2\ngoto R15";

  it("calls a function alone and checks what it kept", () => {
    const r = gradeProgramCase(
      above,
      { call: "above", R1: -170, R2: -180 },
      { R1: "10", kept: "", returned: "yes" },
    );
    expect(r.pass).toBe(true);
    const spoils = gradeProgramCase(
      above.replace("R1 <= 0", "R10 <= 0\nR1 <= R10"),
      { call: "above", R1: -190, R2: -180 },
      { R1: "0", kept: "", returned: "yes" },
    );
    expect(spoils.wrong).toEqual(["kept"]);
    expect(spoils.actual.kept).toBe("R10");
  });

  it("adds the scenario's data after the program", () => {
    const run = runScenario("R1 <= word[count]\nword[display] <= R1\nstop", {
      data: "count: word 6",
    });
    expect(run.state?.cpu.display).toBe(6n);
  });

  it("refuses, with the assembler's problems, a program that does not assemble", () => {
    const r = gradeProgramCase("R1 <= 9999", {}, { display: "0" });
    expect(r.pass).toBe(false);
    expect(r.problems.map((p) => p.code)).toEqual(["constantRange"]);
  });
});
