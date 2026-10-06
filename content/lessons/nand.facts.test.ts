// Copyright © 2026 Christopher Snow

// Facts the NAND lesson's prose states, read off the figures that show them.

import { describe, expect, it } from "vitest";

import { gatesOf, libraryCircuit, truthTableOf } from "@dd/dd-model";
import { grade } from "@dd/dd-views";
import { parseLesson, testCount } from "@platform/lesson-schema";

import { faultChecks, predictionAnswer } from "./module2.facts";
import { nand } from "./nand";

const lesson = parseLesson(nand);
const outputs = (id: string) => truthTableOf(libraryCircuit(id)).rows.map((r) => r.outputs[0]);
const challenge = (id: string) => lesson.challenges.find((c) => c.id === id)!;

describe("the NAND lesson's facts", () => {
  it("prediction: a NAND gate with both inputs on A gives 0 when A is 1, and is a NOT", () => {
    expect(predictionAnswer(nand, "predict-tied")).toBe("0");
    expect(outputs("nand-tied")).toEqual(["1", "0"]);
  });

  it("investigation: NAND is the opposite of AND in every row", () => {
    expect(outputs("nand-gate")).toEqual(["1", "1", "1", "0"]);
    expect(outputs("nand-gate")).toEqual(outputs("and-gate").map((v) => (v === "1" ? "0" : "1")));
  });

  it("construction: 3 and 5 tests, and a loose input reads X when A is 1", () => {
    expect(testCount(challenge("nand-not"))).toBe(3);
    expect(testCount(challenge("nand-and"))).toBe(5);
    const loose = grade(challenge("nand-not"), {
      hdl: "module m(input logic A, output logic Y);\n  assign Y = ~(A & 1'bx);\nendmodule\n",
    });
    expect(loose.failures.map((f) => [f.label, f.actual])).toEqual([["A 1", { Y: "X" }]]);
  });

  it("failure experiment: OR from three NAND gates, and what each fault breaks", () => {
    expect(outputs("nand-or")).toEqual(["0", "1", "1", "1"]);
    expect(faultChecks(nand, "or-faults", 0).failed).toEqual([
      { label: "A 0, B 0", got: { Y: "X" }, expected: { Y: "0" } },
      { label: "A 1, B 0", got: { Y: "X" }, expected: { Y: "1" } },
    ]);
    expect(faultChecks(nand, "or-faults", 1).failed.map((f) => f.label)).toEqual([
      "A 0, B 0",
      "A 1, B 0",
    ]);
    const all = faultChecks(nand, "or-faults", 2);
    expect(all.failed).toHaveLength(4);
    expect(all.total).toBe(4);
  });

  it("generalisation: NOR, and NOR with both inputs on A", () => {
    expect(outputs("nor-gate")).toEqual(["1", "0", "0", "0"]);
    expect(outputs("nor-tied")).toEqual(["1", "0"]);
  });

  it("challenge: XOR from NAND has 5 tests and the reference uses five NAND gates", () => {
    const xor = challenge("nand-xor");
    expect(testCount(xor)).toBe(5);
    expect(grade(xor, xor.reference).passed).toBe(true);
    expect(gatesOf(libraryCircuit("xor-nand-5"))).toHaveLength(5);
    expect(outputs("xor-nand-5")).toEqual(["0", "1", "1", "0"]);
  });
});
