// Copyright © 2026 Chris Snow

// Facts the flags lesson's prose states, read off the figures that show them.

import { describe, expect, it } from "vitest";

import { readingOf, parseBits } from "@dd/dd-model";

import { flags } from "./flags";
import {
  explorerOutputs,
  faultChecks,
  predictionAnswer,
  sliceCounts,
  testCountOf,
} from "./module3-facts";

describe("facts for the flags lesson", () => {
  it("the prediction: MINUS is 1 for 7 - (-8), with OVER 1", () => {
    expect(predictionAnswer(flags, "predict-minus")).toBe("1");
    expect(explorerOutputs(flags, "overflow-limit")).toEqual({
      Y: "1111",
      ZERO: "0",
      MINUS: "1",
      COUT: "0",
      OVER: "1",
    });
  });

  it("the four flags on 3 - 5, 3 - 3 and the twin sensors' XOR", () => {
    expect(explorerOutputs(flags, "four-flags")).toEqual({
      Y: "1110",
      ZERO: "0",
      MINUS: "1",
      COUT: "0",
      OVER: "0",
    });
    expect(readingOf(parseBits("1110"), "signed")).toBe("-2");
    expect(explorerOutputs(flags, "four-flags", { B: "0011" })).toEqual({
      Y: "0000",
      ZERO: "1",
      MINUS: "0",
      COUT: "1",
      OVER: "0",
    });
    expect(
      explorerOutputs(flags, "four-flags", { A: "1100", B: "1100", OP1: 0, OP0: 1 }),
    ).toMatchObject({ Y: "0000", ZERO: "1" });
  });

  it("the fault lab: what each fault makes the checks report", () => {
    expect(faultChecks(flags, "flag-faults", 0)).toEqual({ failed: ["2 - 1"], total: 5 });
    expect(faultChecks(flags, "flag-faults", 1)).toEqual({
      failed: ["5 - 5", "12 XOR 12"],
      total: 5,
    });
    expect(faultChecks(flags, "flag-faults", 2)).toEqual({
      failed: ["5 - 5", "7 - 8", "2 - 1"],
      total: 5,
    });
  });

  it("the rooms at 16 bits, and 7FFF + 1", () => {
    // The office's question, is room A colder than room B: room A's word on A, room B's on B.
    expect(explorerOutputs(flags, "rooms-flags")).toEqual({
      Y: "0042",
      ZERO: "0",
      MINUS: "0",
      COUT: "1",
      OVER: "0",
    });
    expect(explorerOutputs(flags, "rooms-flags", { A: "0xFF06", B: "0xFF48" })).toEqual({
      Y: "FFBE",
      ZERO: "0",
      MINUS: "1",
      COUT: "0",
      OVER: "0",
    });
    expect(readingOf(parseBits("1111111110111110"), "signed")).toBe("-66");
    expect(
      explorerOutputs(flags, "rooms-flags", { A: "0x7FFF", B: "0x0001", OP0: 0 }),
    ).toMatchObject({ Y: "8000", MINUS: "1", OVER: "1" });
  });

  it("the challenges' test counts and widths", () => {
    expect([testCountOf(flags, "zero-slice"), testCountOf(flags, "colder")]).toEqual([12, 9]);
    expect(sliceCounts(flags, "zero-slice")).toEqual([1, 4, 8, 16]);
  });
});
