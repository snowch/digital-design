// Copyright © 2026 Chris Snow

// Facts the decoders lesson's prose states, read off the figures that show them.

import { describe, expect, it } from "vitest";

import { decoders } from "./decoders";
import { explorerOutputs, faultChecks, predictionAnswer, testCountOf } from "./module3-facts";

describe("facts for the decoders lesson", () => {
  it("the lamp prediction: S1 AND NOT S0 is 0 when both are 1", () => {
    expect(predictionAnswer(decoders, "predict-lamp")).toBe("0");
  });

  it("the doors prediction: doors 1 and 2 open together give room 3", () => {
    expect(predictionAnswer(decoders, "predict-doors")).toBe("11");
  });

  it("the fault lab: what each fault makes the checks report", () => {
    expect(faultChecks(decoders, "decoder-faults", 0)).toEqual({
      failed: ["S1 0, S0 1", "S1 1, S0 1"],
      total: 4,
    }); // NS0 held at 1: and0 and and2 also accept S0 = 1, so two lamps light
    expect(faultChecks(decoders, "decoder-faults", 1)).toEqual({
      failed: ["S1 0, S0 1", "S1 1, S0 0"],
      total: 4,
    }); // and3 made an OR: Y3 lights whenever S1 or S0 is 1
    expect(faultChecks(decoders, "decoder-faults", 2)).toEqual({
      failed: ["S1 0, S0 0", "S1 0, S0 1", "S1 1, S0 0", "S1 1, S0 1"],
      total: 4,
    }); // notS1 made a plain wire: and0 copies and2 and and1 copies and3, so two lamps light or none
  });

  it("the comparator starts with two equal words and says so", () => {
    expect(explorerOutputs(decoders, "comparator-block")).toEqual({ EQ: "1" });
    expect(explorerOutputs(decoders, "comparator-block", { B: "1001" })).toEqual({ EQ: "0" });
  });

  it("the challenges' test counts, as the page states them", () => {
    expect([testCountOf(decoders, "decoder"), testCountOf(decoders, "comparator")]).toEqual([4, 9]);
  });
});
