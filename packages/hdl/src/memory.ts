// Copyright © 2026 Chris Snow

// Module 6: memories written as arrays.
//
// `logic [7:0] mem [0:15];` declares sixteen words of eight bits. A word is read anywhere an
// expression may stand, `mem[A]`, with no clock, and written at a clock edge in an `always_ff` of
// its own: `always_ff @(posedge CLK) if (WE) mem[A] <= D;`. An array may be filled from a list of
// values, `= '{8'h12, 8'h34, ...}`, lowest address first; one that is never written is a ROM.
//
// Elaboration (elaborate.ts) turns an array into the simulator's `memory` or `rom` component, not
// into gates: a memory of hundreds of flip-flops recomputed at every step would be too slow, and
// the course's lessons build the gates of a small one by hand first.

import type { Assignment, Expression, Statement } from "./ast";
import type { NetId } from "@dd/sim";

export interface ArrayMemory {
  readonly name: string;
  readonly width: number;
  readonly words: number;
  readonly init?: readonly bigint[];
  /** Each read, in the order the text makes them: its address and the net its word is on. */
  readonly reads: { address: NetId; q: NetId }[];
  write?: { clock: NetId; enable: NetId; address: NetId; data: NetId };
  readonly at: Assignment["at"];
}

/** A statement with any single-statement `begin ... end` around it taken off. */
function bare(s: Statement): Statement {
  return s.kind === "block" && s.statements.length === 1 ? bare(s.statements[0] as Statement) : s;
}

/**
 * The one write an always_ff may make to a memory: `mem[A] <= D;`, or that inside `if (WE)` with
 * no `else`. Anything else is not a shape the course's memories take.
 */
export function arrayWrite(
  body: Statement,
): { target: Assignment["target"]; value: Expression; enable?: Expression } | undefined {
  const top = bare(body);
  if (top.kind === "assignment" && top.target.select)
    return { target: top.target, value: top.value };
  if (top.kind === "if" && top.otherwise === undefined) {
    const inner = bare(top.then);
    if (inner.kind === "assignment" && inner.target.select)
      return { target: inner.target, value: inner.value, enable: top.condition };
  }
  return undefined;
}
