// Module 2: the measures, the tables and the circuits the logic lessons use.

import { describe, expect, it } from "vitest";

import { CircuitBuilder } from "@dd/sim";

import {
  compareCircuits,
  depthOf,
  gatesNotOf,
  gatesOf,
  libraryCircuit,
  pairsFor,
  truthTableOf,
} from "./index";

const outputs = (id: string) => truthTableOf(libraryCircuit(id)).rows.map((r) => r.outputs[0]);

describe("gate count and depth", () => {
  it("counts gates and not pins, and finds the longest path from the input end", () => {
    const c = libraryCircuit("call-rows");
    expect(gatesOf(c)).toHaveLength(8);
    expect(depthOf(c)).toEqual({ depth: 3, path: ["notDoor", "and1", "orCall"], output: "CALL" });
  });
  it("tells a chain from a tree with the same gates", () => {
    expect(gatesOf(libraryCircuit("any-warm-chain"))).toHaveLength(3);
    expect(depthOf(libraryCircuit("any-warm-chain")).depth).toBe(3);
    expect(depthOf(libraryCircuit("any-warm-tree")).depth).toBe(2);
  });
  it("names the gates of a kind not allowed", () => {
    expect(gatesNotOf(libraryCircuit("xor-nand-4"), ["nand"])).toEqual([]);
    expect(gatesNotOf(libraryCircuit("alarm"), ["nand"]).map((g) => g.path)).toEqual([
      "notDoor",
      "andAlarm",
    ]);
  });
  it("gives a circuit of wires depth 0, and still answers for a loop", () => {
    const b = new CircuitBuilder("wire");
    b.output("Y", b.input("A"));
    expect(depthOf(b.build()).depth).toBe(0);
    expect(depthOf(libraryCircuit("inverter-loop-2")).depth).toBeGreaterThan(0);
  });
});

describe("truth tables", () => {
  it("works every row out with the simulator, the first input as the top bit", () => {
    expect(outputs("alarm")).toEqual(["0", "0", "1", "0"]);
    expect(outputs("nand-gate")).toEqual(["1", "1", "1", "0"]);
    expect(outputs("nor-gate")).toEqual(["1", "0", "0", "0"]);
    expect(outputs("nand-or")).toEqual(["0", "1", "1", "1"]);
  });
  it("gives the same table for every XOR the lessons build", () => {
    for (const id of ["clash-gates", "clash-xor", "xor-gate", "xor-nand-5", "xor-nand-4"])
      expect(outputs(id), id).toEqual(["0", "1", "1", "0"]);
  });
  it("compares two circuits by every output, row by row", () => {
    const same = compareCircuits(libraryCircuit("call-rows"), libraryCircuit("call-short"));
    expect(same.differ).toEqual([]);
    const wrong = compareCircuits(libraryCircuit("call-rows"), libraryCircuit("call-too-short"));
    expect(wrong.differ).toEqual([6]);
    expect(wrong.rows[6]).toEqual({ inputs: ["1", "1", "0"], first: "0", second: "1" });
    const lamps = compareCircuits(
      libraryCircuit("two-lamps-separate"),
      libraryCircuit("two-lamps-shared"),
    );
    expect(lamps.outputs).toEqual(["ALARM", "CALL"]);
    expect(lamps.differ).toEqual([]);
    expect(() => compareCircuits(libraryCircuit("alarm"), libraryCircuit("clash-xor"))).toThrow();
  });
  it("pairs rows that differ in one input and says where it makes no difference", () => {
    const table = truthTableOf(libraryCircuit("call-rows"));
    expect(pairsFor(table, "WARM").map((p) => p.matters)).toEqual([true, true, false, false]);
    expect(pairsFor(table, "CLOSED").map((p) => p.matters)).toEqual([false, true, false, true]);
    expect(pairsFor(table, "CLOSED")[2]).toEqual({
      others: { WARM: "1", DOOR: "0" },
      at0: "1",
      at1: "1",
      matters: false,
    });
  });
});
