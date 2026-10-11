// Copyright © 2026 Christopher Snow

// The compiler chapter's facts: what the compiler writes for the shop's two rules, the words the
// assembler makes of it, and what each program does on the machine. The chapter's prose states
// these numbers (docs/notes/beyond-the-machine-plan.md, section 4).

import { describe, expect, it } from "vitest";

import { assemble } from "./assemble";
import { compile, runCompiled } from "./compile";
import { instructionHex } from "./machine";
import { MEET_PROGRAMS } from "./meet";

const GAP = "display <= sensorA - sensorB";
const CLASH = "if sensorA - sensorB >= 100 then lamps <= 4";
const words = (program: string) =>
  assemble(program).lines.flatMap((l) =>
    l.instruction === undefined ? [] : [instructionHex(l.instruction)],
  );
const module0 = MEET_PROGRAMS.gap!.split("\n");

describe("the compiler", () => {
  it("writes the gap rule as Module 0's lines 1 to 4, and the display shows 66", () => {
    const c = compile(GAP);
    expect(c.instructions.map((i) => i.text)).toEqual([
      "R1 <= word[sensorA]",
      "R2 <= word[sensorB]",
      "R3 <= R1 - R2",
      "word[display] <= R3",
      "stop",
    ]);
    expect(c.instructions.slice(0, 4).map((i) => i.text)).toEqual(module0.slice(0, 4));
    expect(c.steps.map((s) => s.rule)).toEqual(["read", "read", "job", "store"]);
    expect(runCompiled(c, -184, -250)).toMatchObject({ display: "66", lamps: 0, stopped: true });
  });

  it("writes the CLASH rule in seven steps, Module 0's lines 1 to 3 and 5 to 9", () => {
    const c = compile(CLASH);
    expect(c.steps.map((s) => s.after)).toEqual([
      "if R1 - sensorB >= 100 then lamps <= 4",
      "if R1 - R2 >= 100 then lamps <= 4",
      "if R3 >= 100 then lamps <= 4",
      "if R3 >= R4 then lamps <= 4",
      "lamps <= 4",
      "lamps <= R5",
      "",
    ]);
    expect(c.steps.map((s) => s.rule)).toEqual([
      "read",
      "read",
      "job",
      "number",
      "branch",
      "number",
      "store",
    ]);
    expect(c.program).toBe(
      [
        "R1 <= word[sensorA]",
        "R2 <= word[sensorB]",
        "R3 <= R1 - R2",
        "R4 <= 100",
        "if R3 < R4 signed goto after1",
        "R5 <= 4",
        "word[lamps] <= R5",
        "after1: stop",
      ].join("\n"),
    );
    const texts = c.instructions.map((i) => i.text);
    expect(texts.slice(0, 3)).toEqual(module0.slice(0, 3));
    expect(texts.slice(3, 7)).toEqual([
      module0[4],
      module0[5]!.replace("0x020", "after1"),
      module0[6],
      module0[7],
    ]);
    expect(words(c.program)).toEqual([
      "380017D8",
      "380027E0",
      "13123000",
      "25004064",
      "56340003",
      "25005004",
      "480507C8",
      "84000000",
    ]);
    // Module 0's explanation keeps line 5 as this number.
    expect(parseInt("25004064", 16)).toBe(620773476);
    // CLASH dark at a gap of 66; lit with room A at -100, a gap of 150.
    expect(runCompiled(c, -184, -250)).toMatchObject({ lamps: 0, stopped: true });
    expect(runCompiled(c, -100, -250)).toMatchObject({ lamps: 4, stopped: true });
  });

  it("writes the two rules as 12 instructions, 10 run with the shop's readings, against Module 0's 9 and 7", () => {
    const c = compile(`${GAP}\n${CLASH}`);
    expect(c.instructions).toHaveLength(12);
    const run = runCompiled(c, -184, -250);
    expect(run).toMatchObject({ display: "66", lamps: 0, ran: 10, stopped: true });
    expect(module0).toHaveLength(9);
  });

  it("with every piece in R1, writes over room A's reading and shows 0", () => {
    const c = compile(GAP, { fault: "oneRegister" });
    expect(c.instructions.map((i) => i.text)).toEqual([
      "R1 <= word[sensorA]",
      "R1 <= word[sensorB]",
      "R1 <= R1 - R1",
      "word[display] <= R1",
      "stop",
    ]);
    expect(runCompiled(c, -184, -250).display).toBe("0");
    expect(runCompiled(c, -30, 80).display).toBe("0");
  });

  it("turns each comparison over, swapping the registers for > and <=", () => {
    const branch = (op: string) =>
      compile(`if sensorA ${op} sensorB then lamps <= 1`).instructions[2]!.text;
    expect(branch("<")).toBe("if R1 >= R2 signed goto after1");
    expect(branch(">=")).toBe("if R1 < R2 signed goto after1");
    expect(branch(">")).toBe("if R2 >= R1 signed goto after1");
    expect(branch("<=")).toBe("if R2 < R1 signed goto after1");
    expect(branch("==")).toBe("if R1 != R2 goto after1");
    expect(branch("!=")).toBe("if R1 == R2 goto after1");
    // Each runs as the comparison reads, signed, on readings of both signs.
    for (const [op, holds] of [
      ["<", (a: number, b: number) => a < b],
      ["<=", (a: number, b: number) => a <= b],
      [">", (a: number, b: number) => a > b],
      [">=", (a: number, b: number) => a >= b],
      ["==", (a: number, b: number) => a === b],
      ["!=", (a: number, b: number) => a !== b],
    ] as const)
      for (const [a, b] of [
        [-30, 80],
        [80, -30],
        [5, 5],
      ] as const)
        expect(
          runCompiled(compile(`if sensorA ${op} sensorB then lamps <= 1`), a, b).lamps,
          `${a} ${op} ${b}`,
        ).toBe(holds(a, b) ? 1 : 0);
  });

  it("does jobs left to right, brackets first, and links each piece to what it became", () => {
    const c = compile("display <= sensorA - (sensorB + 2)");
    expect(c.instructions.map((i) => i.text).slice(0, 5)).toEqual([
      "R1 <= word[sensorA]",
      "R2 <= word[sensorB]",
      "R3 <= 2",
      "R4 <= R2 + R3",
      "R5 <= R1 - R4",
    ]);
    const bracket = c.steps[3]!;
    expect(bracket.before.slice(...bracket.piece)).toBe("(R2 + R3)");
    expect(c.steps[0]!.before.slice(...bracket.source)).toBe("(sensorB + 2)");
    expect(bracket.made).toEqual([1, 2, 3]);
    expect(runCompiled(c, -184, -250).display).toBe("64");
  });

  it("refuses a name it may not read, a number that does not fit, * and /, and a line in no form", () => {
    const codes = (text: string) => compile(text).problems.map((p) => p.code);
    expect(codes("display <= sensorC")).toEqual(["name"]);
    expect(codes("display <= R1")).toEqual(["name"]);
    expect(codes("lamps <= 2048")).toEqual(["range"]);
    expect(codes("lamps <= -2049")).toEqual(["range"]);
    expect(codes("display <= sensorA * 2")).toEqual(["multiply"]);
    expect(codes("display <= sensorA / 2")).toEqual(["multiply"]);
    expect(codes("display sensorA")).toEqual(["form"]);
    expect(codes("sensorA <= 3")).toEqual(["form"]);
    expect(codes("if sensorA then lamps <= 1")).toEqual(["form"]);
    expect(compile("lamps <= 2047\nlamps <= -2048").problems).toEqual([]);
  });
});
