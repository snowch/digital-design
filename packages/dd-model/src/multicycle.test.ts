// Copyright © 2026 Christopher Snow

// Module 9: the machine of several edges an instruction, against the instruction-level reference,
// instruction by instruction, on Module 8's suite, with each kind's count of edges; and seen to
// fail when a part of its control is broken.

import { describe, expect, it } from "vitest";

import { edgesOfKind } from "./control";
import { stuckAt } from "./faults";
import { machineSuite } from "./machine-suite";
import { multicycleCircuit } from "./multicycle";
import { compareMulticycle } from "./multicycle-run";

describe("the machine of several edges against the reference", () => {
  // Each program's instructions and their edges, kept for the count of edges below: the suite
  // runs once (tests in a file run in order).
  const seen = new Map<number, Set<number>>();
  for (const c of machineSuite(1)) {
    it(`${c.group}: ${c.label}`, () => {
      const result = compareMulticycle(c.source, c.inputs);
      expect(result.differences).toEqual([]);
      expect(result.instructions).toBeGreaterThan(0);
      for (const e of result.edges) seen.set(e.kind, (seen.get(e.kind) ?? new Set()).add(e.edges));
    }, 60_000);
  }

  it("takes each kind's own count of edges", () => {
    expect([...seen.keys()].sort()).toEqual([1, 2, 3, 4, 5, 6, 7]);
    for (const [kind, counts] of seen)
      expect([...counts], `kind ${kind}`).toEqual([edgesOfKind(kind)]);
  });
});

describe("the machine with a part of its control broken", () => {
  const SOURCE = "R1 <= 5\nR13 <= 0x400\nword[R13] <= R1\nR2 <= word[R13]\nR3 <= R2 + R1\nstop";
  const broken = (net: string, value: 0 | 1) =>
    compareMulticycle(SOURCE, undefined, {}, 400, (rom) =>
      stuckAt(net, value).apply(multicycleCircuit({ rom })),
    ).differences;

  it("runs the program healthy", () => {
    expect(compareMulticycle(SOURCE).differences).toEqual([]);
  });
  it("fails when the IR takes the memory's word at every edge", () => {
    expect(broken("control/IREN", 1)).not.toEqual([]);
  });
  it("fails when a load's word is never held", () => {
    expect(broken("control/HOLDM", 0)[0]).toMatch(/R2/);
  });
  it("fails when the decoder's checks are never counted", () => {
    expect(broken("control/CHECKING", 0)).not.toEqual([]);
  });
  it("fails when the PC moves at every edge", () => {
    expect(broken("control/PCEN", 1)).not.toEqual([]);
  });
});

describe("the capstone's machine: a call through a register", () => {
  const SOURCE =
    "R4 <= 20\nR5 <= 28\ncall R4, R15\ncall R5 + 0, R14\nstop\nR1 <= 7\ngoto R15\nR2 <= 9\ngoto R14";
  it("runs as the reference with the instruction, in the call's three edges", () => {
    const r = compareMulticycle(SOURCE, undefined, { callThroughRegister: true });
    expect(r.differences).toEqual([]);
    expect(r.edges.filter((e) => e.kind === 9).map((e) => e.edges)).toEqual([3, 3]);
  });
  it("still runs every program of the suite", () => {
    // Kind 9, job 0, is the new instruction now, not an illegal one.
    for (const c of machineSuite(1).filter(
      (x) => (x.group === "normal" || x.group === "stops") && !x.label.startsWith("kind 9"),
    ))
      expect(
        compareMulticycle(c.source, c.inputs, { callThroughRegister: true }).differences,
        c.label,
      ).toEqual([]);
  }, 60_000);
});
