// Copyright © 2026 Christopher Snow

// Module 12: the machine of several edges with its trap hardware, against the reference with
// Module 12's options, step by step: on Module 8's suite (no handler, so every trap halts, as in
// Module 9's machine), and on programs that trap to a handler, drop to user mode, make system
// calls and take interrupts.

import { describe, expect, it } from "vitest";

import { stuckAt } from "./faults";
import { machineSuite } from "./machine-suite";
import { QUIET_INPUTS } from "./machine";
import { trapsCircuit } from "./traps";
import { compareTraps } from "./traps-run";
import { TRAP_PROGRAMS } from "./traps-programs";

describe("Module 12's machine against the reference", () => {
  for (const c of machineSuite(1, 1)) {
    it(`no handler, ${c.group}: ${c.label}`, () => {
      const result = compareTraps(c.source, c.inputs);
      expect(result.differences).toEqual([]);
    }, 60_000);
  }

  for (const p of TRAP_PROGRAMS)
    it(
      p.label,
      () => {
        const result = compareTraps(p.source, {
          ...QUIET_INPUTS,
          ...(p.door !== undefined ? { doorOpensAt: p.door } : {}),
        });
        expect(result.differences).toEqual([]);
        expect(result.edges.some((e) => e.trap !== undefined)).toBe(true);
      },
      60_000,
    );

  it("call system traps at its READ edge, and the system jobs 1 to 3 take three", () => {
    const result = compareTraps(TRAP_PROGRAMS[1]!.source);
    expect(result.edges.filter((e) => e.trap !== undefined).map((e) => e.edges)).toEqual([2]);
    expect(
      result.edges.filter((e) => e.kind === 8 && e.job! >= 1 && e.job! <= 3).map((e) => e.edges),
    ).toEqual(Array(12).fill(3));
  }, 60_000);
});

describe("Module 12's machine with a part of its trap hardware broken", () => {
  const broken = (net: string, value: 0 | 1) =>
    compareTraps(TRAP_PROGRAMS[0]!.source, QUIET_INPUTS, 400, (rom) =>
      stuckAt(net, value).apply(trapsCircuit({ rom })),
    ).differences;
  it("fails when no edge traps", () => {
    expect(broken("control/TRAP", 0)).not.toEqual([]);
  });
  it("fails when C2 never takes the return point", () => {
    expect(broken("control/CWEN", 0)).not.toEqual([]);
  });
});
