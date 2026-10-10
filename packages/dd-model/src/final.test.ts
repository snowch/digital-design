// Copyright © 2026 Christopher Snow

// Module 13: the final machine, Module 12's with the call through a register and set if, against
// the reference with Module 13's options, step by step: on Module 8's suite (no handler), on
// Module 12's trap programs, and on programs that use the two added instructions, in system mode
// and in user mode, with traps among them.

import { describe, expect, it } from "vitest";

import { FINAL_PROGRAMS } from "./final-programs";
import { stuckAt } from "./faults";
import { machineSuite } from "./machine-suite";
import { QUIET_INPUTS } from "./machine";
import { trapsCircuit } from "./traps";
import { TRAP_PROGRAMS } from "./traps-programs";
import { compareTraps } from "./traps-run";

const final = (source: string, inputs = {}, door?: number) =>
  compareTraps(
    source,
    { ...QUIET_INPUTS, ...inputs, ...(door !== undefined ? { doorOpensAt: door } : {}) },
    400,
    undefined,
    true,
  );

describe("Module 13's final machine against the reference", () => {
  for (const c of machineSuite(1, 1).filter((_, i) => i % 3 === 0)) {
    it(`no handler, ${c.group}: ${c.label}`, () => {
      expect(final(c.source, c.inputs).differences).toEqual([]);
    }, 60_000);
  }

  for (const p of TRAP_PROGRAMS)
    it(`Module 12's program: ${p.label}`, () => {
      expect(final(p.source, {}, p.door).differences).toEqual([]);
    }, 60_000);

  for (const p of FINAL_PROGRAMS)
    it(
      p.label,
      () => {
        const result = final(p.source, p.inputs ?? {}, p.door);
        expect(result.differences).toEqual([]);
        // Each runs one of the added kinds, or traps on one with a job it does not define (21).
        expect(result.edges.some((e) => e.kind === 9 || e.kind === 10 || e.trap === 0x21)).toBe(
          true,
        );
      },
      60_000,
    );

  it("takes a call's three edges for kind 9, and a register job's four for kind A", () => {
    const result = final(FINAL_PROGRAMS[0]!.source, FINAL_PROGRAMS[0]!.inputs);
    expect(result.edges.filter((e) => e.kind === 9).map((e) => e.edges)).toEqual([3]);
    expect(result.edges.filter((e) => e.kind === 10).map((e) => e.edges)).toEqual(Array(7).fill(4));
  }, 60_000);
});

describe("the final machine with its added parts broken", () => {
  const broken = (net: string, value: 0 | 1, p = FINAL_PROGRAMS[0]!) =>
    compareTraps(
      p.source,
      { ...QUIET_INPUTS, ...p.inputs },
      400,
      (rom) => stuckAt(net, value).apply(trapsCircuit({ rom, final: true })),
      true,
    ).differences;
  it("fails when register Y never takes set if's condition", () => {
    expect(broken("control/SET", 0)).not.toEqual([]);
  });
});
