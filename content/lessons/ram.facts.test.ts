// Copyright © 2026 Chris Snow

// Facts the RAM lesson's prose states, read off the figures that show them.

import { describe, expect, it } from "vitest";

import { answer, checks, options, testsOf } from "./module6-facts";
import { PROSE } from "./ram.prose";
import { ram } from "./ram";

describe("facts for the RAM lesson", () => {
  it("the predictions' answers are the ones their explanations give, and among the options", () => {
    for (const [id, value, explain] of [
      ["predict-other-word", "XXXX", PROSE.p1Explain],
      ["predict-two-words", "0110", PROSE.p2Explain],
      ["predict-past-the-end", "1110", PROSE.p3Explain],
    ] as const) {
      expect(answer(ram, id), id).toBe(value);
      expect(options(ram, id)).toContain(value);
      expect(explain).toContain(`\`${value}\``);
    }
  });

  it("the fault lab: W2 high fails 1 of 8, the NOT on S0 cut fails 4, andW3 as OR fails none", () => {
    const w2 = checks(ram, "ram-faults", 0);
    expect(w2.total).toBe(8);
    expect(w2.failed).toEqual(["read 10"]);
    expect(w2.got[0]).toEqual({ Q: "1000" });
    expect(checks(ram, "ram-faults", 1).failed).toEqual([
      "write 0001 at 00",
      "write 0100 at 10",
      "read 00",
      "read 10",
    ]);
    expect(checks(ram, "ram-faults", 2).failed).toEqual([]);
    expect(PROSE.faultsAfter).toContain("1 of 8");
    expect(PROSE.faultsAfter).toContain("4 of 8");
    expect(PROSE.faultsAfter).toContain("0 of 8");
  });

  it("the challenges have the test counts the tasks describe", () => {
    expect(testsOf(ram, "two-words")).toBe(9);
    expect(testsOf(ram, "guard")).toBe(8);
  });
});
