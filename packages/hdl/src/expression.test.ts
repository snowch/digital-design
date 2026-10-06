// Copyright © 2026 Christopher Snow

// Module 2: a circuit's outputs as whole expressions, and back.

import { describe, expect, it } from "vitest";

import { libraryCircuit, truthTableOf } from "@dd/dd-model";

import { elaborate } from "./elaborate";
import { expressionModule, expressionsOf } from "./expression";

describe("expressions of a gate circuit", () => {
  it("folds every gate between the inputs and an output into one line", () => {
    expect(expressionsOf(libraryCircuit("alarm"))).toEqual([
      { output: "ALARM", expression: "WARM & ~DOOR" },
    ]);
    expect(expressionsOf(libraryCircuit("clash-gates"))[0]?.expression).toBe(
      "(WARM1 & ~WARM2) | (~WARM1 & WARM2)",
    );
    expect(expressionsOf(libraryCircuit("nand-tied"))[0]?.expression).toBe("~(A & A)");
  });
  it("writes a module that elaborates to a circuit with the same truth table", () => {
    for (const id of ["alarm", "clash-gates", "call-rows", "nand-or", "xor-nand-4"]) {
      const original = libraryCircuit(id);
      const result = elaborate(expressionModule(original));
      expect(result.circuit, id).toBeDefined();
      expect(truthTableOf(result.circuit!).rows, id).toEqual(truthTableOf(original).rows);
    }
  });
  it("refuses a loop", () => {
    expect(() => expressionsOf(libraryCircuit("two-buttons"))).toThrow(/loop/);
  });
});
