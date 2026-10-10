// Copyright © 2026 Christopher Snow

// The numbers lesson capstone states, read off the final machine's runs: the figures' program at
// its set if's ALU edge (Y, MINUS, OVER, COUT and MET), MET held at 0, the task's four cases on
// the model, the reference program's five answers read off its own run, and the grade.

import { describe, expect, it } from "vitest";

import {
  CAPSTONE_QUESTIONS,
  capstoneAnswer,
  capstoneProgram,
  capstoneRun,
  edgeView,
  modelEnd,
  netWord,
  recordRun,
  stuckAt,
  type CapstoneQuestion,
} from "@dd/dd-model";
import { MACHINE13_STRINGS, compareText, gradeCapstone, levelsAnswer } from "@dd/dd-views";

import { CAPSTONE_FIELDS, capstone } from "./capstone";
import { PROSE } from "./capstone.prose";
import { CAPSTONE_CASES, CAPSTONE_REFERENCE, CAPSTONE_SAMPLE } from "./module13";

const inputs = { SENSORA: -184, SENSORB: -250 };
const run = recordRun({ libraryId: "machine-final", program: CAPSTONE_SAMPLE, inputs });
const signed = (name: string, frame: number) => {
  const w = netWord(run.circuit, run.frames[frame] ?? [], name)!;
  return BigInt.asIntN(w.width, w.value).toString();
};

describe("lesson capstone's facts", () => {
  it("runs the figures' program as the model does, in 31 edges", () => {
    expect(run.difference).toBeUndefined();
    expect(run.frames.length - 1).toBe(31);
  });

  it("pauses before edge 13, the set if's ALU edge: Y -66, MINUS 1, OVER 0, COUT 0, MET 1", () => {
    expect(edgeView(run.circuit, run.frames[12]!).state).toBe("ALU");
    expect(run.steps[2]?.text).toBe("R3 <= R2 < R1 signed");
    expect(signed("RESULT", 12)).toBe("-66");
    expect(["MINUS", "OVER", "COUT", "MET"].map((n) => signed(n, 12))).toEqual([
      "-1",
      "0",
      "0",
      "-1",
    ]);
    // The prediction's answer, as the figure asks it: MET after the next edge.
    expect(levelsAnswer(run, 12, "net", "MET")).toBe("1");
    expect(PROSE.prediction).toContain("edge 13");
    expect(PROSE.invAfter).toContain("COUT is 0, RESULT is -66, MET is 1.");
  });

  it("MET held at 0: R3 is 0 on the machine and 1 by the model", () => {
    const r = recordRun({
      libraryId: "machine-final",
      program: CAPSTONE_SAMPLE,
      inputs,
      fault: stuckAt("datapath/MET", 0),
    });
    const said = compareText(MACHINE13_STRINGS, r, r.frames.length - 1);
    expect(said).toBe(
      "After `R3 <= R2 < R1 signed` at `008`, R3 is 0 on the machine and 1 by the model.",
    );
    expect(PROSE.failAfter).toContain(said);
  });

  it("the reference does the task on the model for every case", () => {
    const { program } = capstoneProgram(CAPSTONE_REFERENCE);
    for (const c of CAPSTONE_CASES) {
      const end = modelEnd(program!, { sensorA: BigInt(c.sensorA), sensorB: BigInt(c.sensorB) });
      expect([end.end.kind, end.display, end.lamps]).toEqual(["stop", BigInt(c.display), c.lamps]);
    }
  });

  it("fails a program whose set ifs read unsigned on room A at 50 alone", () => {
    const { program } = capstoneProgram(CAPSTONE_REFERENCE.replaceAll(" signed", " unsigned"));
    const fails = CAPSTONE_CASES.filter((c) => {
      const end = modelEnd(program!, { sensorA: BigInt(c.sensorA), sensorB: BigInt(c.sensorB) });
      return end.display !== BigInt(c.display) || end.lamps !== c.lamps;
    });
    expect(fails.map((c) => c.id)).toEqual(["warm"]);
  });

  it("the last hint's program and answers pass every test", () => {
    const challenge = capstone.challenges![0]!;
    const hint = challenge.hints![4]!;
    expect(hint).toContain(CAPSTONE_REFERENCE);
    const answers = CAPSTONE_FIELDS.map((f) => f.reference);
    expect(hint).toContain(answers.join(", "));
    const v = gradeCapstone(challenge as never, {
      text: CAPSTONE_REFERENCE,
      answers: Object.fromEntries(CAPSTONE_FIELDS.map((f) => [f.id, f.reference])),
    });
    expect([v.passed, v.total]).toEqual([true, 10]);
  });

  it("reads the reference program's five answers off its own run", () => {
    const r = capstoneRun(CAPSTONE_REFERENCE);
    for (const f of CAPSTONE_FIELDS)
      expect(capstoneAnswer(r, f.id as CapstoneQuestion), f.id).toEqual({ answer: f.reference });
    expect(Object.keys(CAPSTONE_QUESTIONS)).toEqual(CAPSTONE_FIELDS.map((f) => f.id));
  });

  it("grades the reference as passing, and a program's own answers, not the reference's", () => {
    const challenge = capstone.challenges![0]! as never;
    const answers = Object.fromEntries(CAPSTONE_FIELDS.map((f) => [f.id, f.reference]));
    expect(gradeCapstone(challenge, { text: CAPSTONE_REFERENCE, answers }).passed).toBe(true);
    // The same program with room B's set if first: it does the task, and its answers differ.
    const lines = CAPSTONE_REFERENCE.split("\n");
    const other = [...lines.slice(0, 4), lines[5], lines[4], ...lines.slice(6)].join("\n");
    const v = gradeCapstone(challenge, { text: other, answers });
    expect(v.blocked).toBeUndefined();
    // A program that fails its own tests has no trace question graded against it.
    const wrong = gradeCapstone(challenge, {
      text: CAPSTONE_REFERENCE.replace("R6 <= -200", "R6 <= -100"),
      answers,
    });
    expect(wrong.failures.slice(-5).map((f) => f.detail)).toEqual(
      Array(5).fill(MACHINE13_STRINGS.capFirst),
    );
    expect(v.failures.map((f) => f.label)).toContain(
      capstone.challenges![0]!.tests.kind === "answers"
        ? capstone.challenges![0]!.tests.cases[5]!.label
        : "",
    );
  });
});
