// Copyright © 2026 Chris Snow

// Facts the 64-bit lesson's prose states, read off the figures that show them.

import { describe, expect, it } from "vitest";

import { gatesOf, libraryCircuit } from "@dd/dd-model";
import { carryAnswer, carryRun } from "@dd/dd-views";

import { explorerOutputs, faultChecks, figureOf, testCountOf } from "./module3-facts";
import { wideAlu } from "./wide-alu";

type Cases = {
  libraryId: string;
  cases: { from: Record<string, string>; to: Record<string, string> }[];
};
const steps = (id: string) => {
  const p = figureOf(wideAlu, id) as unknown as Cases;
  const c = libraryCircuit(p.libraryId);
  return p.cases.map((k) => carryRun(c, k.from, k.to));
};

describe("facts for the 64-bit lesson", () => {
  it("a 16-bit count runs out after 65535 seconds, about 18 hours; 64 bits, about 584 billion years", () => {
    expect(2 ** 16 - 1).toBe(65535);
    expect(Math.round(65535 / 3600)).toBe(18);
    expect(((1n << 64n) - 1n).toString()).toBe("18446744073709551615");
    expect(Number(((1n << 64n) - 1n) / 31557600n / 1_000_000_000n)).toBe(584);
  });

  it("the prediction: 0001 settles after 8 steps, FFFF after 36, so the second", () => {
    const r = steps("predict-steps");
    expect(r.map((x) => x.steps)).toEqual([8, 36]);
    expect(carryAnswer(r)).toBe("1");
  });

  it("the carry at 16 bits: 8, 22 and 36 steps; FFFE at step 6; COUT at step 34; a slice every 2 steps", () => {
    const r = steps("carry-16");
    expect(r.map((x) => x.steps)).toEqual([8, 22, 36]);
    const full = r[2]!;
    const c = libraryCircuit("alu8-16-row");
    const y = c.outputs.find((o) => o.name === "Y")!.net;
    const cout = c.outputs.find((o) => o.name === "COUT")!.net;
    expect(full.history[6]![y]!.value).toBe(0xfffen);
    expect(full.history.findIndex((h) => h[cout]!.value === 1n)).toBe(34);
    const carry = (k: number) => c.nets.find((n) => n.name === `C${k}`)!.id;
    const arrives = (k: number) => full.history.findIndex((h) => h[carry(k)]!.value === 1n);
    expect(arrives(9) - arrives(8)).toBe(2);
    expect(full.history[36]![y]!.value).toBe(0n);
  });

  it("the carry at 64 bits: 8 and 132 steps", () => {
    expect(steps("carry-64").map((x) => x.steps)).toEqual([8, 132]);
  });

  it("the 64-bit fault lab", () => {
    expect(faultChecks(wideAlu, "wide-faults", 0)).toEqual({
      failed: ["FFFFFFFF + 1", "FFFFFFFFFFFFFFFF + 1"],
      total: 4,
    });
    expect(faultChecks(wideAlu, "wide-faults", 1)).toEqual({ failed: ["1 + 1"], total: 4 });
  });

  it("the levels figure: all 1s counted up gives 0 with COUT 1 and ZERO 1; thousands of gates", () => {
    expect(explorerOutputs(wideAlu, "levels-64")).toMatchObject({
      Y: "0000000000000000",
      COUT: "1",
      ZERO: "1",
    });
    expect(gatesOf(libraryCircuit("alu8-flags-64")).length).toBeGreaterThan(2000);
  });

  it("the challenges' test counts", () => {
    expect([testCountOf(wideAlu, "adder-text"), testCountOf(wideAlu, "operand-text")]).toEqual([
      12, 24,
    ]);
  });
});
