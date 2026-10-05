// Facts the adders lesson's prose states, read off the figures that show them.

import { describe, expect, it } from "vitest";

import { readingOf, parseBits } from "@dd/dd-model";

import { adders } from "./adders";
import { explorerOutputs, faultChecks, predictionAnswer, testCountOf } from "./module3-facts";

describe("facts for the adders lesson", () => {
  it("the sum prediction: 1 + 1 gives SUM 0 (and CARRY 1)", () => {
    expect(predictionAnswer(adders, "predict-sum")).toBe("0");
  });

  it("the fault lab: what each fault makes the checks report", () => {
    expect(faultChecks(adders, "full-adder-faults", 0)).toEqual({ failed: [], total: 5 }); // the two carries are never both 1
    expect(faultChecks(adders, "full-adder-faults", 1)).toEqual({
      failed: ["1 + 0 + 1", "0 + 1 + 1", "1 + 1 + 1"],
      total: 5,
    }); // CIN held at 0
    expect(faultChecks(adders, "full-adder-faults", 2)).toEqual({
      failed: ["1 + 0 + 1", "0 + 1 + 1"],
      total: 5,
    }); // the second half adder's XOR made an OR
  });

  it("the 4-bit adder: 3 + 2 to start; 7 + 1 is 1000, 8 unsigned and -8 signed; 15 + 1 is 0000 with a carry out", () => {
    expect(explorerOutputs(adders, "adder-4")).toEqual({ SUM: "0101", COUT: "0" });
    expect(explorerOutputs(adders, "adder-4", { A: "0111", B: "0001" })).toEqual({
      SUM: "1000",
      COUT: "0",
    });
    expect(readingOf(parseBits("1000"), "unsigned")).toBe("8");
    expect(readingOf(parseBits("1000"), "signed")).toBe("-8");
    expect(explorerOutputs(adders, "adder-4", { A: "1111", B: "0001" })).toEqual({
      SUM: "0000",
      COUT: "1",
    });
    expect(readingOf(parseBits("1111"), "signed")).toBe("-1");
  });

  it("two negative words that overflow, and a positive with a negative that does not", () => {
    // -8 + -1 is -9, which does not fit: the sum's top bit is 0 though both top bits are 1.
    expect(explorerOutputs(adders, "adder-4", { A: "1000", B: "1111" })).toEqual({
      SUM: "0111",
      COUT: "1",
    });
    // 5 + -3 is 2: a carry out, and the signed sum fits.
    expect(explorerOutputs(adders, "adder-4", { A: "0101", B: "1101" })).toEqual({
      SUM: "0010",
      COUT: "1",
    });
  });

  it("the correction: -250 + -6 is -256, with a carry out of the top bit", () => {
    expect(explorerOutputs(adders, "correction")).toEqual({ SUM: "FF00", COUT: "1" });
    expect(readingOf(parseBits("1111111100000110"), "signed")).toBe("-250");
    expect(readingOf(parseBits("1111111111111010"), "signed")).toBe("-6");
    expect(readingOf(parseBits("1111111100000000"), "signed")).toBe("-256");
    expect(readingOf(parseBits("1111111100000000"), "unsigned")).toBe("65280");
  });

  it("the challenges' test counts, as the page states them", () => {
    expect(
      ["full-adder", "ripple-adder", "overflow-lamp"].map((id) => testCountOf(adders, id)),
    ).toEqual([8, 10, 8]);
  });
});
