// Facts the testing lesson's prose states, read off the suite the figures run.

import { describe, expect, it } from "vitest";

import { aluSuite, applyFaults, libraryCircuit, stuckAt } from "@dd/dd-model";
import { firstCatch, runAluSuite, toFault } from "@dd/dd-views";

import { aluTests } from "./alu-tests";
import { figureOf, testCountOf } from "./module3-facts";

const KINDS = ["normal", "boundary", "random", "adversarial"] as const;
const failed = (r: ReturnType<typeof runAluSuite>) =>
  KINDS.map((k) => r.filter((o) => o.c.group === k && !o.passed).length);
const faultsOf = (id: string) =>
  (figureOf(aluTests, id)["faults"] as Parameters<typeof toFault>[0][]).map(toFault);

describe("facts for the testing lesson", () => {
  it("every pair of 16-bit words and every job: 34359738368 tests, about 9.5 hours at a million a second", () => {
    expect(65536 * 65536 * 8).toBe(34359738368);
    expect(Math.round(34359738368 / 1e6 / 360) / 10).toBe(9.5);
    expect(((1n << 128n) * 8n).toString()).toHaveLength(40);
  });

  it("the suite: 16 normal, 28 boundary, 16 random, 19 adversarial, 79 in all, at 16 and 64 bits", () => {
    for (const width of [16, 64]) {
      const s = aluSuite({ width, seed: 1 });
      expect(KINDS.map((k) => s.filter((c) => c.group === k).length)).toEqual([16, 28, 16, 19]);
    }
  });

  it("the healthy ALU passes every test, whatever the seed", () => {
    const h = libraryCircuit("alu8-flags-16-row");
    for (const seed of [1, 2, 3, 4, 5, 6])
      expect(failed(runAluSuite(h, seed, 2))).toEqual([0, 0, 0, 0]);
  });

  it("the prediction: OVER stuck at 0 is first caught by the boundary tests; random by luck", () => {
    const h = libraryCircuit("alu8-flags-16-row");
    const r = runAluSuite(applyFaults(h, [stuckAt("OVER", 0)]), 1, 2);
    expect(firstCatch(r)).toBe("boundary");
    expect(failed(r)).toEqual([0, 4, 1, 5]);
    expect(r.filter((o) => o.c.group === "boundary" && !o.passed).map((o) => o.c.label)).toEqual([
      "7FFF + 0001",
      "8000 - 0001",
      "7FFF + 1",
      "8000 - 1",
    ]);
    expect(failed(runAluSuite(applyFaults(h, [stuckAt("OVER", 0)]), 5, 2))[2]).toBe(0);
  });

  it("the faults put in on purpose, seed 1", () => {
    const h = libraryCircuit("alu8-flags-16-row");
    const r = faultsOf("suite-faults").map((f) => runAluSuite(applyFaults(h, [f]), 1, 2));
    expect(r.map(failed)).toEqual([
      [0, 4, 1, 5],
      [0, 13, 6, 6],
      [3, 10, 3, 6],
      [9, 4, 1, 4],
    ]);
    expect(r[2]!.filter((o) => o.c.group === "normal" && !o.passed).map((o) => o.c.label)).toEqual([
      "0017 - 0009",
      "0017 - 1",
      "012C - 1",
    ]);
  });

  it("the 64-bit suite with C40 lost, seed 1", () => {
    const h = libraryCircuit("alu8-flags-64-row");
    expect(failed(runAluSuite(applyFaults(h, faultsOf("suite-64")), 1, 2))).toEqual([3, 10, 5, 6]);
    expect(failed(runAluSuite(h, 1, 2))).toEqual([0, 0, 0, 0]);
  });

  it("the challenges' test counts", () => {
    expect([testCountOf(aluTests, "expose-carries"), testCountOf(aluTests, "alu-text")]).toEqual([
      3, 158,
    ]);
  });
});
