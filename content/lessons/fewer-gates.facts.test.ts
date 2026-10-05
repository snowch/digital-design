// Facts the fewer-gates lesson's prose states, read off the figures that show them.

import { describe, expect, it } from "vitest";

import {
  compareCircuits,
  depthOf,
  gatesOf,
  libraryCircuit,
  pairsFor,
  truthTableOf,
} from "@dd/dd-model";
import { grade, runScript } from "@dd/dd-views";
import { formatWord } from "@dd/sim";
import { parseLesson, testCount } from "@dd/lesson-schema";

import { fewerGates } from "./fewer-gates";
import { figureOf, predictionAnswer, stepsAfterPressing } from "./module2.facts";

const lesson = parseLesson(fewerGates);
const challenge = (id: string) => lesson.challenges.find((c) => c.id === id)!;
const side = (id: string, i: number) =>
  (figureOf(fewerGates, id)["circuits"] as { libraryId: string }[])[i]!.libraryId;

describe("the fewer-gates lesson's facts", () => {
  it("question: the manager's CALL has 8 gates, 1 in 4 rows of 8", () => {
    const rows = libraryCircuit("call-rows");
    expect(gatesOf(rows)).toHaveLength(8);
    const ones = truthTableOf(rows)
      .rows.filter((r) => r.outputs[0] === "1")
      .map((r) => r.inputs.join(""));
    expect(ones).toEqual(["011", "100", "101", "111"]);
  });

  it("prediction: with the door open and the shop closed, CALL stays 1 when WARM changes to 0", () => {
    expect(predictionAnswer(fewerGates, "predict-warm")).toBe("1");
    // and3 gives 1 with WARM 1; after WARM changes to 0, and3 gives 0 and and4 gives 1.
    const run = figureOf(fewerGates, "predict-warm")["run"] as Parameters<typeof runScript>[1];
    const circuit = libraryCircuit("call-rows");
    const before = runScript(circuit, run.slice(0, 1));
    const after = runScript(circuit, run);
    expect([before.read("R3"), before.read("R4")].map((w) => formatWord(w))).toEqual(["1", "0"]);
    expect([after.read("R3"), after.read("R4")].map((w) => formatWord(w))).toEqual(["0", "1"]);
  });

  it("investigation: each input changes CALL in 2 of 4 pairs; one pair each has CALL 1 in both rows", () => {
    expect(figureOf(fewerGates, "call-pairs")["input"]).toBe("WARM");
    const table = truthTableOf(libraryCircuit("call-rows"));
    for (const input of ["WARM", "DOOR", "CLOSED"]) {
      const pairs = pairsFor(table, input);
      expect(
        pairs.filter((p) => p.matters),
        input,
      ).toHaveLength(2);
      expect(
        pairs.filter((p) => !p.matters && p.at0 === "1"),
        input,
      ).toHaveLength(1);
    }
    expect(pairsFor(table, "WARM").find((p) => !p.matters && p.at0 === "1")?.others).toEqual({
      DOOR: "1",
      CLOSED: "1",
    });
    expect(pairsFor(table, "CLOSED").find((p) => !p.matters && p.at0 === "1")?.others).toEqual({
      WARM: "1",
      DOOR: "0",
    });
    expect(pairsFor(table, "DOOR").find((p) => !p.matters && p.at0 === "1")?.others).toEqual({
      WARM: "1",
      CLOSED: "1",
    });
  });

  it("construction: 9 tests, and the four-gate CALL matches the manager's in every row", () => {
    expect(testCount(challenge("call-four"))).toBe(9);
    expect(gatesOf(libraryCircuit("call-short"))).toHaveLength(4);
    expect(
      compareCircuits(libraryCircuit("call-rows"), libraryCircuit("call-short")).differ,
    ).toEqual([]);
  });

  it("failure experiment: 8 and 2 gates; they differ in 1 row of 8, WARM 1, DOOR 1, CLOSED 0", () => {
    const [a, b] = [libraryCircuit(side("too-short", 0)), libraryCircuit(side("too-short", 1))];
    expect([gatesOf(a).length, gatesOf(b).length]).toEqual([8, 2]);
    const c = compareCircuits(a, b);
    expect(c.differ).toHaveLength(1);
    expect(c.rows[c.differ[0]!]).toEqual({ inputs: ["1", "1", "0"], first: "0", second: "1" });
  });

  it("explanation: the chain settles in 3, 3, 2, 1 steps and the tree in 2; depths 3 and 2", () => {
    expect(figureOf(fewerGates, "chain-steps")["libraryId"]).toBe("any-warm-chain");
    expect(
      ["ROOM1", "ROOM2", "ROOM3", "ROOM4"].map((r) => stepsAfterPressing("any-warm-chain", r)),
    ).toEqual([3, 3, 2, 1]);
    expect(
      ["ROOM1", "ROOM2", "ROOM3", "ROOM4"].map((r) => stepsAfterPressing("any-warm-tree", r)),
    ).toEqual([2, 2, 2, 2]);
    expect(depthOf(libraryCircuit("any-warm-chain")).depth).toBe(3);
    expect(depthOf(libraryCircuit("any-warm-tree")).depth).toBe(2);
    expect(gatesOf(libraryCircuit("any-warm-tree"))).toHaveLength(3);
    expect(truthTableOf(libraryCircuit("any-warm-chain")).rows).toHaveLength(16);
  });

  it("generalisation: separate 6 gates, shared 4, both depth 3, the same outputs in all 8 rows", () => {
    const [a, b] = [libraryCircuit(side("two-lamps", 0)), libraryCircuit(side("two-lamps", 1))];
    expect([gatesOf(a).length, gatesOf(b).length]).toEqual([6, 4]);
    expect([depthOf(a).depth, depthOf(b).depth]).toEqual([3, 3]);
    expect(compareCircuits(a, b).differ).toEqual([]);
  });

  it("challenge: 6 tests; the five-gate XOR fails only the gate limit; the answer is depth 3", () => {
    const xor = challenge("xor-four");
    expect(testCount(xor)).toBe(6);
    const five = grade(xor, { circuit: libraryCircuit("xor-nand-5") });
    expect(five.failures).toHaveLength(1);
    expect(five.failures[0]?.detail).toContain("5");
    expect(depthOf(libraryCircuit("xor-nand-4")).depth).toBe(3);
    expect(depthOf(libraryCircuit("xor-nand-5")).depth).toBe(3);
  });
});
