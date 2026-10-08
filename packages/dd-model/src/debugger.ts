// Copyright © 2026 Christopher Snow

// Module 11: the debugger's runs. A program is run on the instruction-level reference
// (machine.ts), which runs the instruction set and which the learner's two circuits were tested
// against after every instruction, so what the debugger shows is what a program can rely on.
//
// The debugger adds three things the reference does not do:
//
// - It stops before an instruction whose address, branch or jump depends on a register nothing
//   has set, and says which register. The reference refuses to run such an instruction (a real
//   machine would use whatever its flip-flops held).
// - It cuts off a run after a set number of instructions, since a program may never stop.
// - It reads the run by the calling convention (docs/isa.md): each call that has not returned,
//   the function it went to and the stack's address when it was made, so a view can mark each
//   function's frame. The machine knows nothing of these; the debugger works them out.

import {
  MAP,
  QUIET_INPUTS,
  fieldsOf,
  isIllegal,
  resetMachine,
  step,
  type CpuState,
  type MachineInputs,
  type MachineOptions,
  type StepRecord,
  type StopReason,
} from "./machine";
import { MODULE_9 } from "./machine";

/** The machine the course's programs run on from Module 9 on: its decoder checks C's number. */
export const PROGRAM_MACHINE: MachineOptions = MODULE_9;

/** How many instructions a run may take before the debugger cuts it off. */
export const RUN_LIMIT = 5000;

/** Why the debugger is not running: the machine's own stop, or one of the debugger's. */
export type DebugStop =
  | { readonly kind: "machine"; readonly reason: StopReason; readonly pc: bigint }
  | {
      readonly kind: "unknown";
      readonly reg: number;
      readonly use: "address" | "branch" | "jump" | "control";
      readonly pc: bigint;
    }
  | { readonly kind: "cutOff"; readonly ran: number };

/** A call that has not returned: where it was made, where it went, and the stack then. */
export interface CallFrame {
  /** The call instruction's address. */
  readonly at: bigint;
  /** The address it went to. */
  readonly to: bigint;
  /** Where `goto R15` (or any jump) must go to end it: the instruction after the call. */
  readonly returnTo: bigint;
  /** R14 as the call was made: the frame is the words pushed below it. */
  readonly stack: bigint | undefined;
}

export interface DebugState {
  readonly cpu: CpuState;
  /** Instructions run from reset (a refused one not counted, the stop counted). */
  readonly ran: number;
  readonly stopped?: DebugStop;
  /** Calls not yet returned, oldest first. */
  readonly calls: readonly CallFrame[];
  /** Every word written to the display, in order. */
  readonly shown: readonly bigint[];
  /** The lowest address R14 has held, once set: how deep the stack went. */
  readonly deepest?: bigint;
  /** How many calls have run, and how many of them returned. */
  readonly callsMade: number;
  readonly returns: number;
  /** The RAM addresses a push wrote (a store through R14), lowest first: the stack's words. */
  readonly pushed: readonly number[];
  /** For each address a push wrote, the register it stored there last: what the word saves. */
  readonly saved?: Readonly<Record<number, number>>;
  /** The last instruction's record. */
  readonly last?: StepRecord;
  /** Module 12: every trap that went to the handler, in order: where, why, and the return point. */
  readonly traps: readonly TrapEvent[];
}

/** Module 12: one trap that went to the handler. */
export interface TrapEvent {
  /** The PC at the edge that trapped: the instruction that faulted, or the one not yet run. */
  readonly at: bigint;
  readonly cause: number;
  readonly returnPoint: bigint;
  /** Instructions run before the trap. */
  readonly after: number;
  /** The registers at the trap's edge, which a trap does not change: the program's, as it left them. */
  readonly regs: readonly (bigint | undefined)[];
}

/**
 * Module 12: the shop's inputs as a run goes on. A door that opens before a chosen instruction
 * (counted from reset, the first being 0) is open from then on, until it closes, if it does.
 */
export interface InputPlan extends MachineInputs {
  readonly doorOpensAt?: number;
  readonly doorClosesAt?: number;
}

/** The inputs an edge sees, for a run that has run `ran` instructions. */
export function inputsAt(plan: InputPlan, ran: number): MachineInputs {
  if (plan.doorOpensAt === undefined) return plan;
  const open =
    ran >= plan.doorOpensAt && (plan.doorClosesAt === undefined || ran < plan.doorClosesAt);
  return { ...plan, door: open ? 1 : plan.door };
}

/** A fresh run from reset, with a ROM image. */
export function debugStart(rom: Uint8Array | readonly number[]): DebugState {
  return {
    cpu: resetMachine(rom),
    ran: 0,
    calls: [],
    shown: [],
    callsMade: 0,
    returns: 0,
    pushed: [],
    traps: [],
  };
}

/** A run that starts at an address with chosen registers: a function called by a test. */
export function debugStartAt(
  rom: Uint8Array | readonly number[],
  pc: number,
  registers: Readonly<Record<number, bigint>>,
): DebugState {
  const s = debugStart(rom);
  const regs = s.cpu.regs.map((r, i) => registers[i] ?? r);
  return { ...s, cpu: { ...s.cpu, pc: BigInt(pc), regs } };
}

/** The instruction word at the PC, or undefined outside the ROM or off a multiple of 4. */
export function wordAt(cpu: CpuState, pc: bigint = cpu.pc): number | undefined {
  if (pc < 0n || pc >= BigInt(MAP.romEnd) || pc % 4n !== 0n) return undefined;
  const at = Number(pc);
  return (
    ((cpu.rom[at] ?? 0) |
      ((cpu.rom[at + 1] ?? 0) << 8) |
      ((cpu.rom[at + 2] ?? 0) << 16) |
      ((cpu.rom[at + 3] ?? 0) << 24)) >>>
    0
  );
}

/** A register the next instruction needs for an address, a branch or a jump, if unset. */
export function unknownUse(
  cpu: CpuState,
  options: MachineOptions = PROGRAM_MACHINE,
): { reg: number; use: "address" | "branch" | "jump" | "control" } | undefined {
  const word = wordAt(cpu);
  if (word === undefined) return undefined;
  const f = fieldsOf(word);
  if (isIllegal(f, options)) return undefined;
  if ((f.k === 3 || f.k === 4) && (f.j & 8) === 0 && cpu.regs[f.a] === undefined)
    return { reg: f.a, use: "address" };
  // Module 12: a word written to a control register, in system mode.
  if (
    options.traps &&
    f.k === 8 &&
    f.j === 3 &&
    (cpu.control[0] & 1n) === 1n &&
    cpu.regs[f.a] === undefined
  )
    return { reg: f.a, use: "control" };
  if (f.k === 5 && f.j >= 2) {
    if (cpu.regs[f.a] === undefined) return { reg: f.a, use: "branch" };
    if (cpu.regs[f.b] === undefined) return { reg: f.b, use: "branch" };
  }
  if (f.k === 7 && cpu.regs[f.a] === undefined) return { reg: f.a, use: "jump" };
  return undefined;
}

/** One instruction, with the debugger's reading of it. A stopped run does not change. */
export function debugStep(
  s: DebugState,
  plan: InputPlan = QUIET_INPUTS,
  options: MachineOptions = PROGRAM_MACHINE,
): DebugState {
  if (s.stopped) return s;
  const inputs = inputsAt(plan, s.ran);
  // An interrupt is taken before the next instruction, so it needs no register.
  const interrupt = options.traps && (s.cpu.control[0] & 2n) !== 0n && s.cpu.waiting !== 0;
  const unknown = interrupt ? undefined : unknownUse(s.cpu, options);
  if (unknown) return { ...s, stopped: { kind: "unknown", ...unknown, pc: s.cpu.pc } };
  const { state: cpu, record } = step(s.cpu, inputs, options);
  const trapped = record.stopped?.kind === "trap" || record.trap !== undefined;
  const traps = record.trap
    ? [...s.traps, { at: record.pc, ...record.trap, after: s.ran, regs: s.cpu.regs }]
    : s.traps;
  let calls = s.calls;
  let callsMade = s.callsMade;
  let returns = s.returns;
  const f = record.fields;
  if (!record.stopped && !record.trap && f) {
    if (
      f.k === 6 ||
      (options.callThroughRegister !== undefined && f.k === options.callThroughRegister)
    ) {
      callsMade++;
      calls = [
        ...calls,
        { at: record.pc, to: record.nextPc, returnTo: record.pc + 4n, stack: s.cpu.regs[14] },
      ];
    } else if (f.k === 7) {
      // A jump to the address after an open call ends that call and any made inside it.
      const k = calls.map((c) => c.returnTo).lastIndexOf(record.nextPc);
      if (k >= 0) {
        returns += calls.length - k;
        calls = calls.slice(0, k);
      }
    }
  }
  const shown =
    record.memory?.store && record.memory.address === 0x7c0n && !record.stopped && !record.trap
      ? [...s.shown, record.memory.value ?? 0n]
      : s.shown;
  // A store through R14 is a push; a trapped one wrote nothing.
  const pushedAt =
    record.memory?.store && !record.stopped && !record.trap && f?.k === 4 && f.a === 14
      ? Number(record.memory.address)
      : undefined;
  const pushed =
    pushedAt === undefined || s.pushed.includes(pushedAt)
      ? s.pushed
      : [...s.pushed, pushedAt].sort((a, b) => a - b);
  const saved =
    pushedAt === undefined || f === undefined ? s.saved : { ...s.saved, [pushedAt]: f.b };
  const sp = cpu.regs[14];
  const deepest =
    sp === undefined ? s.deepest : s.deepest === undefined || sp < s.deepest ? sp : s.deepest;
  return {
    cpu,
    ran: trapped ? s.ran : s.ran + 1,
    calls,
    shown,
    callsMade,
    returns,
    pushed,
    ...(saved !== undefined ? { saved } : {}),
    last: record,
    traps,
    ...(deepest !== undefined ? { deepest } : {}),
    ...(cpu.stopped
      ? { stopped: { kind: "machine", reason: cpu.stopped.reason, pc: cpu.stopped.pc } }
      : {}),
  };
}

/**
 * Runs until the machine stops, the debugger stops, the next instruction is at a breakpoint (after
 * at least one instruction), or `limit` instructions in all have run, when the run is cut off.
 * Returns every state passed through, the last one first-to-last, for stepping back.
 */
export function debugRun(
  s: DebugState,
  {
    breakpoints = new Set<number>(),
    inputs = QUIET_INPUTS,
    options = PROGRAM_MACHINE,
    limit = RUN_LIMIT,
  }: {
    breakpoints?: ReadonlySet<number>;
    inputs?: InputPlan;
    options?: MachineOptions;
    limit?: number;
  } = {},
): DebugState[] {
  const states: DebugState[] = [];
  let state = s;
  while (!state.stopped) {
    if (state.ran >= limit || state.traps.length >= limit) {
      state = { ...state, stopped: { kind: "cutOff", ran: state.ran } };
      states.push(state);
      break;
    }
    state = debugStep(state, inputs, options);
    states.push(state);
    if (!state.stopped && breakpoints.has(Number(state.cpu.pc))) break;
  }
  return states;
}

/** Runs to the end, keeping only the last state. */
export function debugFinish(
  s: DebugState,
  inputs: InputPlan = QUIET_INPUTS,
  options: MachineOptions = PROGRAM_MACHINE,
  limit = RUN_LIMIT,
): DebugState {
  let state = s;
  while (!state.stopped) {
    if (state.ran >= limit || state.traps.length >= limit)
      return { ...state, stopped: { kind: "cutOff", ran: state.ran } };
    state = debugStep(state, inputs, options);
  }
  return state;
}

/** A word of memory as a load would read it, or undefined if unknown or not a word's address. */
export function memoryWord(cpu: CpuState, address: number): bigint | undefined {
  if (address % 8 !== 0 || address < 0 || address >= MAP.deviceStart) return undefined;
  let v = 0n;
  for (let i = 7; i >= 0; i--) {
    const at = address + i;
    const b = at < MAP.romEnd ? cpu.rom[at] : cpu.ram[at - MAP.ramStart];
    if (b === undefined) return undefined;
    v = (v << 8n) | BigInt(b);
  }
  return v;
}
