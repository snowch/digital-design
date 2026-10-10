// Copyright © 2026 Christopher Snow

// Module 12: a run read edge by edge for the trap timeline. Each step of the instruction-level
// reference is one edge of the single-cycle machine: an instruction that runs, or a trap that
// goes to the handler. For each, what it is and every transfer it makes, read off the step's
// record and the states either side of it, so the figure shows the machine's own transfers and
// works none out.

import { assembleChecked, type Program } from "./assemble";
import { inputsAt, type InputPlan } from "./debugger";
import {
  MODULE_12,
  QUIET_INPUTS,
  resetMachine,
  step,
  type ControlRegisters,
  type CpuState,
  type StepRecord,
  type StopReason,
} from "./machine";

/** How a value in a transfer is written: an address, a cause, C0's two bits, or a number. */
export type TransferForm = "address" | "cause" | "bits" | "number";

/** One register transfer at an edge: `target ← value`. */
export interface Transfer {
  /** R0 to R15, C0 to C4, PC, or a word of memory as `word[7C0]`. */
  readonly target: string;
  readonly value: bigint | undefined;
  readonly form: TransferForm;
}

export interface TimelineEdge {
  /** The edge's number from reset, the first being 1. */
  readonly n: number;
  /** The PC at the edge: the instruction that ran, faulted or was not yet run. */
  readonly pc: bigint;
  /** The line of the program at the PC, or undefined outside it. */
  readonly line?: string;
  /** The label naming the PC's line, if any. */
  readonly label?: string;
  readonly kind: "run" | "trap" | "resume" | "halt" | "stop";
  /** For a trap or a halt with a cause: the cause. */
  readonly cause?: number;
  readonly transfers: readonly Transfer[];
  /** The control registers after the edge. */
  readonly control: ControlRegisters;
  /** Instructions run before the edge. */
  readonly ran: number;
  /** Module 12: the waiting events after the edge, bit 0 the timer and bit 1 the door. */
  readonly waiting: number;
}

const FORMS: readonly TransferForm[] = ["bits", "bits", "address", "cause", "address"];

/** The transfers one step made, from its record and the states either side of it. */
function transfersOf(before: CpuState, after: CpuState, edge: { readonly record: StepRecord }) {
  const r = edge.record;
  const out: Transfer[] = [];
  if (r.trap) {
    out.push(
      { target: "C2", value: r.trap.returnPoint, form: "address" },
      { target: "C1", value: before.control[0], form: "bits" },
      { target: "C0", value: 1n, form: "bits" },
      { target: "C3", value: BigInt(r.trap.cause), form: "cause" },
      { target: "PC", value: after.pc, form: "address" },
    );
    return out;
  }
  if (r.stopped) return out;
  if (r.wrote) out.push({ target: `R${r.wrote.reg}`, value: r.wrote.value, form: "number" });
  if (r.memory?.store) {
    const at = r.memory.address.toString(16).toUpperCase().padStart(3, "0");
    out.push({
      target: `${r.memory.byte ? "byte" : "word"}[${at}]`,
      value: r.memory.value,
      form: "number",
    });
  }
  if (r.control)
    out.push({
      target: `C${r.control.reg}`,
      value: r.control.value,
      form: FORMS[r.control.reg] ?? "number",
    });
  out.push({ target: "PC", value: after.pc, form: "address" });
  return out;
}

const kindOf = (reason: StopReason | undefined) =>
  reason?.kind === "stop" ? "stop" : reason ? "halt" : "run";

/**
 * A program's run as edges, from reset, for at most `limit` edges or until the machine halts or
 * the program stops. Each edge is the reference's step on Module 12's machine.
 */
export function timelineRun(
  source: string,
  plan: InputPlan = QUIET_INPUTS,
  limit = 200,
): { readonly program?: Program; readonly edges: readonly TimelineEdge[] } {
  const { program } = assembleChecked(source);
  if (!program) return { edges: [] };
  const lineAt = linesByAddress(program);
  let state = resetMachine(program.rom);
  let ran = 0;
  const edges: TimelineEdge[] = [];
  for (let n = 1; n <= limit && !state.stopped; n++) {
    const r = step(state, inputsAt(plan, ran), MODULE_12);
    edges.push(timelineEdge(n, state, r.state, r.record, ran, lineAt));
    if (!r.record.trap && !r.record.stopped) ran++;
    state = r.state;
  }
  return { program, edges };
}

/**
 * One edge of a run, from the states either side of a step and its record: what it was, and every
 * transfer it made. The trap timeline and the debugger's drawing of lanes both read edges so.
 */
export function timelineEdge(
  n: number,
  state: CpuState,
  after: CpuState,
  record: StepRecord,
  ran: number,
  lineAt: ReadonlyMap<number, { readonly text: string; readonly label?: string }>,
): TimelineEdge {
  const at = lineAt.get(Number(state.pc));
  const resume = record.fields?.k === 8 && record.fields.j === 1 && !record.trap;
  const kind = record.trap ? "trap" : resume && !record.stopped ? "resume" : kindOf(record.stopped);
  const cause =
    record.trap?.cause ?? (record.stopped?.kind === "trap" ? record.stopped.cause : undefined);
  return {
    n,
    pc: state.pc,
    ...(at ? { line: at.text } : {}),
    ...(at?.label ? { label: at.label } : {}),
    kind,
    ...(cause !== undefined ? { cause } : {}),
    transfers: resume
      ? [
          { target: "C0", value: state.control[1], form: "bits" },
          { target: "PC", value: after.pc, form: "address" },
        ]
      : transfersOf(state, after, { record }),
    control: after.control,
    ran,
    waiting: after.waiting,
  };
}

/** The lines of a program by address, as the timeline names them. */
export function linesByAddress(program: Program) {
  return new Map(
    program.lines.filter((l) => l.instruction !== undefined).map((l) => [l.address, l] as const),
  );
}
