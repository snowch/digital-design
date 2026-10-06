// Copyright © 2026 Christopher Snow

// Facts the register-file lesson's prose states, read off the figures that show them.

import { describe, expect, it } from "vitest";

import { answer, checks, options } from "./module6-facts";
import { PROSE } from "./register-file.prose";
import { registerFile } from "./register-file";

describe("facts for the register-file lesson", () => {
  it("the predictions' answers are the ones their explanations give", () => {
    for (const [id, value, explain] of [
      ["predict-same-word", "0101", PROSE.p1Explain],
      ["predict-before-edge", "0101", PROSE.p2Explain],
    ] as const) {
      expect(answer(registerFile, id), id).toBe(value);
      expect(options(registerFile, id)).toContain(value);
      expect(explain).toContain(`\`${value}\``);
    }
  });

  it("the fault lab fails 2, 2 and 8 of 8 checks, on the reads the prose names", () => {
    const or = checks(registerFile, "regfile-faults", 0);
    expect(or.total).toBe(8);
    expect(or.failed).toEqual(["read 01 and 10", "read 10 and 01"]);
    expect(or.got).toEqual([
      { QA: "0010", QB: "1000" },
      { QA: "1000", QB: "0010" },
    ]);
    const low = checks(registerFile, "regfile-faults", 1);
    expect(low.failed).toEqual(["read 01 and 10", "read 10 and 01"]);
    expect(checks(registerFile, "regfile-faults", 2).failed).toHaveLength(8);
    expect(PROSE.faultsAfterFault1).toContain("2 of 8");
    expect(PROSE.faultsAfterFault2).toContain("2 of 8");
    expect(PROSE.faultsAfterFault3).toContain("8 of 8");
  });
});
