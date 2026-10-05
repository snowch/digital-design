// Facts the selectors lesson's prose states, read off the figures that show them.

import { describe, expect, it } from "vitest";

import { selectors } from "./selectors";
import { explorerOutputs, faultChecks, predictionAnswer, testCountOf } from "./module3-facts";

describe("facts for the selectors lesson", () => {
  it("the OR prediction: room B's 1 reaches the display", () => {
    expect(predictionAnswer(selectors, "predict-or")).toBe("1");
  });

  it("the AND prediction: with S at 0, Y stays 0 when A rises", () => {
    expect(predictionAnswer(selectors, "predict-and")).toBe("0");
  });

  it("the fault lab: what each fault makes the checks report", () => {
    expect(faultChecks(selectors, "selector-faults", 0)).toEqual({
      failed: ["S 0, A 1, B 0", "S 1, A 1, B 0", "S 0, A 1, B 1"],
      total: 5,
    }); // the NOT gate made a plain wire: Y = S AND (A OR B)
    expect(faultChecks(selectors, "selector-faults", 1)).toEqual({
      failed: ["S 0, A 1, B 0", "S 0, A 0, B 1"],
      total: 5,
    }); // S held at 1: Y is always B
    expect(faultChecks(selectors, "selector-faults", 2)).toEqual({ failed: [], total: 5 }); // PA and PB are never both 1
  });

  it("the word selector passes room A's four bits with S at 0 and room B's with S at 1", () => {
    expect(explorerOutputs(selectors, "word-selector")).toEqual({ Y: "1000" });
    expect(explorerOutputs(selectors, "word-selector", { S: 1 })).toEqual({ Y: "0110" });
  });

  it("the challenges' test counts, as the page states them", () => {
    expect([testCountOf(selectors, "selector-2"), testCountOf(selectors, "selector-4")]).toEqual([
      8, 8,
    ]);
  });
});
