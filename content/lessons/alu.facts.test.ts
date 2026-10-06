// Copyright © 2026 Christopher Snow

// Facts the ALU lesson's prose states, read off the figures that show them.

import { describe, expect, it } from "vitest";

import { readingOf, parseBits } from "@dd/dd-model";

import { alu } from "./alu";
import {
  explorerOutputs,
  faultChecks,
  predictionAnswer,
  sliceCounts,
  testCountOf,
} from "./module3-facts";

describe("facts for the ALU lesson", () => {
  it("the prediction: NOT 0011 plus 1 is 1101, which reads -3 signed", () => {
    expect(predictionAnswer(alu, "predict-minus")).toBe("1101");
    expect(readingOf(parseBits("1101"), "signed")).toBe("-3");
  });

  it("the 4-bit ALU on 2 and 3: four jobs, four different words", () => {
    const y = [0, 1, 2, 3].map(
      (op) => explorerOutputs(alu, "alu-block", { OP1: op >> 1, OP0: op & 1 })["Y"],
    );
    expect(y).toEqual(["0010", "0001", "0101", "1111"]);
    expect(readingOf(parseBits("1111"), "signed")).toBe("-1");
  });

  it("the fault lab: what each fault makes the checks report", () => {
    expect(faultChecks(alu, "addsub-faults", 0)).toEqual({
      failed: ["6 - 3", "3 - 6", "5 - 5"],
      total: 4,
    }); // no carry into bit 0: every subtraction is one short
    expect(faultChecks(alu, "addsub-faults", 1)).toEqual({ failed: ["6 - 3", "3 - 6"], total: 4 }); // bit 1's B never turned over
    expect(faultChecks(alu, "addsub-faults", 2)).toEqual({
      failed: ["6 + 3", "3 - 6", "5 - 5"],
      total: 4,
    }); // the carry into bit 2 lost
  });

  it("the add-or-subtract row: 2 - 3 is 1111, -1, with no carry out; 2 + 3 is 0101", () => {
    expect(explorerOutputs(alu, "addsub-row")).toEqual({ SUM: "1111", COUT: "0" });
    expect(explorerOutputs(alu, "addsub-row", { SUB: 0 })).toEqual({ SUM: "0101", COUT: "0" });
    // Subtracting, COUT is 1 exactly when A is at least B, read unsigned.
    expect(explorerOutputs(alu, "addsub-row", { A: "0110", B: "0011" })).toEqual({
      SUM: "0011",
      COUT: "1",
    });
  });

  it("AND with 8000 keeps bit 15 alone: room A's word is below zero", () => {
    expect(explorerOutputs(alu, "alu-16", { B: "0x8000", OP1: 0, OP0: 0 })["Y"]).toBe("8000");
  });

  it("the 16-bit ALU on the two rooms' words", () => {
    const y = [0, 1, 2, 3].map(
      (op) => explorerOutputs(alu, "alu-16", { OP1: op >> 1, OP0: op & 1 })["Y"],
    );
    expect(y).toEqual(["FF00", "004E", "FE4E", "0042"]);
    expect(readingOf(parseBits("0000000001000010"), "signed")).toBe("66");
    expect(readingOf(parseBits("1111111001001110"), "signed")).toBe("-434");
  });

  it("the challenges' test counts and the widths they choose", () => {
    expect([testCountOf(alu, "addsub-slice"), testCountOf(alu, "alu-slice")]).toEqual([11, 24]);
    expect(sliceCounts(alu, "addsub-slice")).toEqual([1, 4, 8]);
    expect(sliceCounts(alu, "alu-slice")).toEqual([1, 4, 8, 16]);
  });
});
