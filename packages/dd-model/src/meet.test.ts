// Copyright © 2026 Christopher Snow

import { describe, expect, it } from "vitest";

import { assemble } from "./assemble";
import { datapathState } from "./datapath-run";
import { ANSWER_GRADERS } from "./graders";
import {
  lineOfAddress,
  meetAnswer,
  meetLines,
  meetMachine,
  meetStart,
  plainLine,
  runToStop,
  sliceDigits,
} from "./meet";

/** Module 0's program: how much warmer room A is than room B, and CLASH at 10.0 apart. */
const GAP = `R1 <= word[sensorA]
R2 <= word[sensorB]
R3 <= R1 - R2
word[display] <= R3
R4 <= 100
if R3 < R4 signed goto 0x020
R5 <= 4
word[lamps] <= R5
stop`;

const ROOMS = { SENSORA: "-184", SENSORB: "-250" };

describe("a line in plain words", () => {
  it("reads every line of Module 0's program from its instruction, not its text", () => {
    expect(meetLines(GAP).map((l) => [l.line, l.plain.key, l.plain.values])).toEqual([
      [1, "read", { y: "R1", device: "sensorA" }],
      [2, "read", { y: "R2", device: "sensorB" }],
      [3, "subtract", { y: "R3", a: "R1", b: "R2" }],
      [4, "show", { b: "R3" }],
      [5, "set", { y: "R4", n: "100" }],
      [6, "ifLess", { a: "R3", b: "R4", line: "9" }],
      [7, "set", { y: "R5", n: "4" }],
      [8, "setLamps", { b: "R5" }],
      [9, "stop", {}],
    ]);
  });

  it("gives each kind and job the sentences cover the key the assembler's line means", () => {
    const cases: [string, string, Record<string, string>][] = [
      ["R3 <= R1 + R2", "add", { y: "R3", a: "R1", b: "R2" }],
      ["R3 <= R1 + 7", "add", { y: "R3", a: "R1", b: "7" }],
      ["R3 <= R1 - R2", "subtract", { y: "R3", a: "R1", b: "R2" }],
      ["R3 <= R1 - 8", "subtract", { y: "R3", a: "R1", b: "8" }],
      ["R3 <= R1 + 1", "add", { y: "R3", a: "R1", b: "1" }],
      ["R3 <= R1 - 1", "subtract", { y: "R3", a: "R1", b: "1" }],
      ["R4 <= R2", "copy", { y: "R4", b: "R2" }],
      ["R4 <= -150", "set", { y: "R4", n: "-150" }],
      ["R6 <= word[signals]", "read", { y: "R6", device: "signals" }],
      ["R6 <= word[timer]", "read", { y: "R6", device: "timer" }],
      ["word[display] <= R7", "show", { b: "R7" }],
      ["word[lamps] <= R7", "setLamps", { b: "R7" }],
      ["goto 0x000", "goto", { line: "1" }],
      ["nothing", "nothing", {}],
      ["if R1 == R2 goto 0x010", "ifEqual", { a: "R1", b: "R2", line: "5" }],
      ["if R1 != R2 goto 0x010", "ifDiffer", { a: "R1", b: "R2", line: "5" }],
      ["if R1 < R2 signed goto 0x010", "ifLess", { a: "R1", b: "R2", line: "5" }],
      ["if R1 >= R2 signed goto 0x010", "ifNotLess", { a: "R1", b: "R2", line: "5" }],
      ["stop", "stop", {}],
      // Left as written: jobs and kinds Module 0's sentences do not cover.
      ["R3 <= R1 ^ R2", "other", {}],
      ["if R1 < R2 unsigned goto 0x010", "other", {}],
      ["R3 <= word[R1 + 8]", "other", {}],
      ["word[0x400] <= R3", "other", {}],
      ["goto R15", "other", {}],
      ["call system", "other", {}],
    ];
    for (const [text, key, values] of cases) {
      // At line 2, so a target counts from the line's own place, as the machine counts.
      const program = assemble(`nothing\n${text}`);
      const line = program.lines[1]!;
      expect(plainLine(line.instruction!, line.address), text).toEqual({ key, values });
    }
  });

  it("counts lines from 1 at the machine's first place", () => {
    expect([0, 4, 32].map(lineOfAddress)).toEqual([1, 2, 9]);
  });
});

describe("Module 0's machine, read for a beginner", () => {
  it("runs the program on Module 1's rooms: 66 on the display, CLASH dark, lines 7 and 8 skipped", () => {
    const built = meetMachine({ program: GAP });
    const sim = meetStart(built, { program: GAP, inputs: ROOMS });
    expect(meetAnswer(sim, "lines")).toBe("1 2 3 4 5 6 9");
    expect(meetAnswer(sim, "display")).toBe("66");
    expect(meetAnswer(sim, "lamps")).toBe("none");
    // The answers left the simulator where it was.
    expect(datapathState(sim.circuit, sim.snapshotValues()).pc).toBe(0n);
    const run = runToStop(sim);
    expect(run).toEqual({ lines: [1, 2, 3, 4, 5, 6, 9], stopped: true });
  });

  it("paused before line 3, the part that adds already gives 66, and the next line writes R3", () => {
    const sim = meetStart(meetMachine({ program: GAP }), { program: GAP, inputs: ROOMS, lines: 2 });
    expect(meetAnswer(sim, "ones")).toBe("64 + 2");
    expect(sliceDigits(sim, 8)).toBe("01000010");
    expect(meetAnswer(sim, "changed")).toBe("R3");
    expect(meetAnswer(sim, "value", 3)).toBe("66");
    expect(meetAnswer(sim, "next")).toBe("4");
  });

  it("with the sum wire of the slice worth 2 stuck at 0, the display shows 64", () => {
    const stuck = { net: "alu/g0/q0/bit1/SUM", value: 0 as const };
    const sim = meetStart(meetMachine({ program: GAP, stuck }), { program: GAP, inputs: ROOMS });
    expect(meetAnswer(sim, "lines")).toBe("1 2 3 4 5 6 9");
    expect(meetAnswer(sim, "display")).toBe("64");
  });
});

describe("Module 0's graders run the machine", () => {
  const LIMIT = GAP.replace("R4 <= 100", "R4 <= {limit}");
  const run = ANSWER_GRADERS["machine-run"]!;
  const step = ANSWER_GRADERS["machine-step"]!;
  const slices = ANSWER_GRADERS["machine-slices"]!;

  it("puts the learner's number into the program and grades what the shop sees", () => {
    const given = { program: LIMIT, SENSORA: "-200", SENSORB: "-250", lamp: "CLASH" };
    expect(run({ limit: "50" }, given, { lamp: "lit" })).toMatchObject({ pass: true });
    expect(run({ limit: "51" }, given, { lamp: "lit" })).toMatchObject({
      pass: false,
      actual: { lamp: "dark" },
    });
    expect(run({ limit: "5.0" }, given, { lamp: "lit" })).toEqual({ invalid: "limit" });
    expect(run({}, given, { lamp: "lit" })).toEqual({ missing: ["limit"] });
  });

  it("grades a learner's own account of a run against the run", () => {
    const given = { program: GAP, SENSORA: "-100", SENSORB: "-250", lamp: "CLASH" };
    const expect_ = { display: "{display}", lamp: "{lamp}" };
    expect(run({ display: "150", lamp: "lit" }, given, expect_)).toMatchObject({ pass: true });
    expect(run({ display: "150", lamp: "dark" }, given, expect_)).toMatchObject({ pass: false });
  });

  it("traces one line on a copy after a real edge", () => {
    const given = { program: GAP, SENSORA: "-120", SENSORB: "-250", lines: 2 };
    const at = (check: string) => ({ ...given, check });
    expect(step({ changed: "R3" }, at("changed"), {})).toMatchObject({ pass: true });
    expect(step({ value: "130" }, at("value"), {})).toMatchObject({ pass: true });
    expect(step({ value: "-370" }, at("value"), {})).toMatchObject({ pass: false });
    expect(step({ next: "4" }, at("next"), {})).toMatchObject({ pass: true });
    expect(step({ part: "adder" }, at("part"), {})).toMatchObject({ pass: true });
    expect(step({ part: "memory" }, at("part"), {})).toMatchObject({ pass: false });
    // Before line 1 the number comes from memory.
    expect(step({ part: "memory" }, { ...at("part"), lines: 0 }, {})).toMatchObject({
      pass: true,
    });
  });

  it("reads the lowest slices' 1s and 0s off the part that adds", () => {
    const given = { program: GAP, SENSORA: "-180", SENSORB: "-250", lines: 2, slices: 8 };
    expect(slices({ slices: "0100 0110" }, given, {})).toMatchObject({ pass: true });
    expect(slices({ slices: "01000010" }, given, {})).toMatchObject({ pass: false });
    expect(slices({ slices: "0100" }, given, {})).toEqual({ invalid: "slices" });
  });
});
