// Copyright © 2026 Christopher Snow

// Module 13's shared data: the final machine's text, joined from the course's modules, elaborates
// and agrees with the instruction-level model on the shop's program, Module 12's trap programs
// and the programs of the two added instructions.

import { describe, expect, it } from "vitest";

import {
  FINAL_PROGRAMS,
  TRAP_PROGRAMS_FOR_TESTS,
  QUIET_INPUTS,
  compareFinalCircuit,
} from "@dd/dd-model";
import { elaborate, machine13Modules, type Construct } from "@dd/hdl";

import { MACHINE13_CONSTRUCTS, MACHINE13_TEXT, SHOP, SHOP_INPUTS } from "./module13";

describe("the final machine's text", () => {
  const t0 = performance.now();
  const result = elaborate(MACHINE13_TEXT, {
    allowed: MACHINE13_CONSTRUCTS as Construct[],
    modules: machine13Modules({}),
  });
  const ms = performance.now() - t0;
  it("elaborates with no error", () => {
    expect(result.messages.filter((m) => m.severity !== "warning")).toEqual([]);
    expect(result.circuit).toBeDefined();
    expect(ms).toBeLessThan(20_000);
  });
  const circuit = result.circuit!;
  it("runs the shop's program as the model does", () => {
    const r = compareFinalCircuit(circuit, SHOP, {
      ...QUIET_INPUTS,
      sensorA: BigInt(SHOP_INPUTS.SENSORA),
      sensorB: BigInt(SHOP_INPUTS.SENSORB),
    });
    expect(r.difference).toBeUndefined();
    expect(r.edges).toBe(69);
  });
  // Each run simulates the whole machine gate by gate, edge by edge: one took 75 seconds on a busy
  // machine, so each has three minutes, which still stops a run that never ends.
  for (const p of FINAL_PROGRAMS)
    it(
      p.label,
      () => {
        expect(
          compareFinalCircuit(circuit, p.source, { ...QUIET_INPUTS, ...p.inputs }).difference,
        ).toBeUndefined();
      },
      180_000,
    );
  for (const p of TRAP_PROGRAMS_FOR_TESTS)
    it(`Module 12's: ${p.label}`, () => {
      expect(
        compareFinalCircuit(circuit, p.source, {
          ...QUIET_INPUTS,
          ...(p.door !== undefined ? { doorOpensAt: p.door } : {}),
        }).difference,
      ).toBeUndefined();
    }, 180_000);
});
