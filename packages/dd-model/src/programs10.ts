// Copyright © 2026 Christopher Snow

// Module 10, lessons 3 to 5: what one instruction can say, read off the reference.
//
// - The comparisons a program needs, A < B, A >= B, A > B and A <= B, each read signed and
//   unsigned, and the branch that says each: one of the machine's conditions, with A and B in
//   their order or swapped. Whether it is taken comes from the reference's own ALU and branch
//   condition (machine.ts), and is checked against the comparison itself.
// - A program run on the reference from reset, counted: the instructions written, the
//   instructions run (the stop among them), and the ROM's bytes the program and its data take.

import { assemble, type AssemblyOptions } from "./assemble";
import {
  QUIET_INPUTS,
  alu64,
  branchTaken,
  resetMachine,
  run,
  type CpuState,
  type MachineInputs,
  type MachineOptions,
  type StopReason,
} from "./machine";

export type Relation = "<" | ">=" | ">" | "<=";
export type CompareReading = "unsigned" | "signed";

/** A comparison of two registers and the branch that says it. */
export interface BranchComparison {
  readonly relation: Relation;
  readonly reading: CompareReading;
  /** The branch's job: 4 or 5 unsigned, 6 or 7 signed. */
  readonly job: number;
  /** Whether the branch names the registers swapped: `if RB < RA` for A > B. */
  readonly swapped: boolean;
  /** Whether the reference takes that branch for these words. */
  readonly taken: boolean;
  /** Whether the comparison holds, worked out on the numbers themselves. */
  readonly holds: boolean;
  /** The flags of the subtraction the branch makes: RA - RB, or R2 - R1 when swapped. */
  readonly flags: {
    readonly zero: number;
    readonly minus: number;
    readonly cout: number;
    readonly over: number;
  };
}

const MASK = (1n << 64n) - 1n;
const signed = (v: bigint) => BigInt.asIntN(64, v);

/** The branch for each relation: less and not less as they are, greater and not greater swapped. */
export function branchFor(
  relation: Relation,
  reading: CompareReading,
): { job: number; swapped: boolean } {
  const base = reading === "unsigned" ? 4 : 6;
  switch (relation) {
    case "<":
      return { job: base, swapped: false };
    case ">=":
      return { job: base + 1, swapped: false };
    case ">":
      return { job: base, swapped: true };
    case "<=":
      return { job: base + 1, swapped: true };
  }
}

/** Every comparison of A and B, each with its branch and whether that branch is taken. */
export function comparisons(a: bigint, b: bigint): BranchComparison[] {
  const out: BranchComparison[] = [];
  for (const reading of ["signed", "unsigned"] as const)
    for (const relation of ["<", ">=", ">", "<="] as const) {
      const { job, swapped } = branchFor(relation, reading);
      const [x, y] = swapped ? [b, a] : [a, b];
      const { zero, minus, cout, over } = alu64(3, x & MASK, y & MASK);
      const flags = { zero, minus, cout, over };
      const taken = branchTaken(job, flags);
      const [p, q] = reading === "signed" ? [signed(a), signed(b)] : [a & MASK, b & MASK];
      const holds =
        relation === "<" ? p < q : relation === ">=" ? p >= q : relation === ">" ? p > q : p <= q;
      out.push({ relation, reading, job, swapped, taken, holds, flags });
    }
  return out;
}

/** Whether a branch, its job and its order, is taken for A and B, by the reference's condition. */
export function branchSays(job: number, swapped: boolean, a: bigint, b: bigint): boolean {
  const [x, y] = swapped ? [b, a] : [a, b];
  return branchTaken(job, alu64(3, x & MASK, y & MASK));
}

/** A program's run on the reference, counted. */
export interface ProgramRun {
  /** Instructions written: lines that are instructions, not data. */
  readonly written: number;
  /** Instructions run from reset: the stop among them, a word the machine refuses not. */
  readonly ran: number;
  /** The ROM's bytes the program and its data take, from address 000. */
  readonly romBytes: number;
  readonly state: CpuState;
  readonly stopped?: StopReason;
}

/** Runs a program from reset on the reference and counts it. */
export function runProgram(
  source: string,
  inputs: MachineInputs = QUIET_INPUTS,
  options: MachineOptions = {},
  limit = 2000,
  /** The kinds the program is written with, where they are not the machine's own. */
  written?: AssemblyOptions,
): ProgramRun {
  const assembly: AssemblyOptions = written ?? {
    ...(options.callThroughRegister !== undefined
      ? { callThroughRegister: options.callThroughRegister }
      : {}),
    ...(options.setIf !== undefined ? { setIf: options.setIf } : {}),
  };
  const program = assemble(source, assembly);
  const { state, records } = run(resetMachine(program.rom), limit, inputs, options);
  const last = program.lines.at(-1);
  const size = last ? (last.instruction !== undefined ? 4 : dataSize(last.text)) : 0;
  return {
    written: program.lines.filter((l) => l.instruction !== undefined).length,
    // A word the machine refuses, with a cause, did not run; the stop did (lesson 9.3).
    ran: state.stopped?.reason.kind === "trap" ? records.length - 1 : records.length,
    romBytes: last ? last.address + size : 0,
    state,
    ...(state.stopped ? { stopped: state.stopped.reason } : {}),
  };
}

/** The bytes a `word` or `byte` line puts in the ROM. */
function dataSize(text: string): number {
  const m = /^(word|byte)\s+(.+)$/.exec(text.trim());
  if (!m) return 0;
  return (m[1] === "word" ? 8 : 1) * (m[2] ?? "").split(",").length;
}
