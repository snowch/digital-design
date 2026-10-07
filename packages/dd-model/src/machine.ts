// Copyright © 2026 Christopher Snow

// Module 8: the course machine at the level of its instructions, in bigints.
//
// `docs/machine.md` and `docs/isa.md` are the machine; this file is a function that runs one
// instruction as they say, on the machine's state, with nothing about gates in it. The datapath
// built from the learner's parts (datapath.ts) is tested against it instruction by instruction.
//
// What Module 8 builds of the machine, and so what this reference runs (docs/notes/module-8-plan.md):
// every instruction of kinds 1 to 7 and the system job `stop`, the memory map whole with its
// devices, and the checks that stop the machine. The control registers are Module 12's, so the
// machine is always in system mode with no handler: every trap stops it, with its cause. Of the
// system jobs, `call system` traps (cause 41) and so stops it too; `resume` and the two
// control-register jobs stop it with the reason "later", since Module 12 builds what they do.
//
// A register or a byte of RAM that nothing has set is unknown, X, as every flip-flop is in the
// course's model until something sets it. Here an unknown word is `undefined`: a result worked
// out from one is unknown too.

export const WORD_BITS = 64;
export const MASK64 = (1n << 64n) - 1n;

/** The memory map (docs/machine.md, "Memory"). */
export const MAP = {
  romStart: 0x000,
  romEnd: 0x400,
  ramStart: 0x400,
  ramEnd: 0x7c0,
  deviceStart: 0x7c0,
  end: 0x800,
} as const;

/** The devices, by address (docs/machine.md, "Devices"). */
export const DEVICES = {
  display: 0x7c0,
  lamps: 0x7c8,
  signals: 0x7d0,
  sensorA: 0x7d8,
  sensorB: 0x7e0,
  timer: 0x7e8,
  waiting: 0x7f0,
  none: 0x7f8,
} as const;

export type DeviceName = keyof typeof DEVICES;

/** The trap causes this module's machine can meet, by number (docs/machine.md). */
export const CAUSES = {
  outsideRom: 0x11,
  notMultipleOf4: 0x12,
  illegal: 0x21,
  noMemory: 0x31,
  misaligned: 0x33,
  readOnly: 0x34,
  system: 0x41,
} as const;

/** Why the machine stopped: a trap's cause, the `stop` job, or a system job Module 12 builds. */
export type StopReason =
  | { readonly kind: "trap"; readonly cause: number }
  | { readonly kind: "stop" }
  | { readonly kind: "later" };

/** The shop's inputs the machine reads: DOOR and WARM, and the two rooms' sensors. */
export interface MachineInputs {
  readonly door: 0 | 1;
  readonly warm: 0 | 1;
  readonly sensorA: bigint;
  readonly sensorB: bigint;
}

export const QUIET_INPUTS: MachineInputs = { door: 0, warm: 0, sensorA: 0n, sensorB: 0n };

/** The machine's state: everything an edge can change. Unknown is `undefined`. */
export interface CpuState {
  readonly pc: bigint;
  readonly regs: readonly (bigint | undefined)[];
  /** The ROM's 1024 bytes. */
  readonly rom: Uint8Array;
  /** The RAM's 960 bytes, from address 400. */
  readonly ram: readonly (number | undefined)[];
  readonly display: bigint;
  /** ALARM, NIGHT and CLASH as bits 0, 1 and 2. */
  readonly lamps: number;
  readonly timer: bigint;
  /** Bit 0: the timer has reached 0; bit 1: the door has opened. */
  readonly waiting: number;
  /** DOOR as it was at the edge before; a reset counts the door as closed, 0. */
  readonly doorBefore: 0 | 1;
  /** Set once the machine has stopped, with the reason and the PC of the instruction. */
  readonly stopped?: { readonly reason: StopReason; readonly pc: bigint };
}

/** The machine at reset, with a ROM image (padded with 0s to 1024 bytes). */
export function resetMachine(rom: Uint8Array | readonly number[]): CpuState {
  const image = new Uint8Array(MAP.romEnd);
  image.set(Array.from(rom).slice(0, MAP.romEnd));
  return {
    pc: 0n,
    regs: Array.from({ length: 16 }, () => undefined),
    rom: image,
    ram: Array.from({ length: MAP.ramEnd - MAP.ramStart }, () => undefined),
    display: 0n,
    lamps: 0,
    timer: 0n,
    waiting: 0,
    doorBefore: 0,
  };
}

/** An instruction's fields: K J A B Y c c c, with the constant read signed. */
export interface Fields {
  readonly k: number;
  readonly j: number;
  readonly a: number;
  readonly b: number;
  readonly y: number;
  /** Digits 2 to 0 as they are, 0 to FFF. */
  readonly raw: number;
  /** The constant read signed: -2048 to 2047. */
  readonly c: number;
}

export function fieldsOf(instruction: number): Fields {
  const raw = instruction & 0xfff;
  return {
    k: (instruction >>> 28) & 15,
    j: (instruction >>> 24) & 15,
    a: (instruction >>> 20) & 15,
    b: (instruction >>> 16) & 15,
    y: (instruction >>> 12) & 15,
    raw,
    c: raw >= 0x800 ? raw - 0x1000 : raw,
  };
}

/** The constant widened to 64 bits: bit 11 copied into bits 63 to 12. */
export function widen(raw: number): bigint {
  return BigInt(raw >= 0x800 ? raw - 0x1000 : raw) & MASK64;
}

/** The ALU's result and flags for a job on two 64-bit words (Module 7's rules). */
export function alu64(job: number, a: bigint, b: bigint) {
  const sum = (x: bigint) => x & MASK64;
  const d = job === 3 ? ~b & MASK64 : job === 7 ? MASK64 : job === 2 ? b : 0n;
  const cin = job === 3 || job === 6 ? 1n : 0n;
  const arithmetic = job === 2 || job === 3 || job === 6 || job === 7;
  const total = a + d + cin;
  const y = job === 0 ? a & b : job === 1 ? a ^ b : job === 4 ? a | b : job === 5 ? b : sum(total);
  const top = (w: bigint) => (w >> 63n) & 1n;
  return {
    y,
    zero: y === 0n ? 1 : 0,
    minus: Number(top(y)),
    cout: arithmetic ? Number(total >> 64n) : 0,
    over: arithmetic && top(a) === top(d) && top(sum(total)) !== top(a) ? 1 : 0,
  };
}

/** Whether a branch with this job is taken, from the flags of A - B (docs/machine.md). */
export function branchTaken(
  job: number,
  flags: { zero: number; minus: number; cout: number; over: number },
): boolean {
  const chosen = [1, flags.zero, 1 - flags.cout, flags.minus ^ flags.over][job >> 1] ?? 0;
  return (chosen ^ (job & 1)) === 1;
}

/**
 * Which machine the reference stands for. Module 8's decoder reads only the kind and job digits, so
 * its machine stops on a system job 1 to 3 as one a later module builds, whatever the constant.
 * Module 9's decoder takes the constant too and makes the check `docs/isa.md` gives on a control
 * register's number (`docs/plan.md`, the decision of 6 October 2026). Module 9's capstone adds an
 * instruction in the learner's own copy of the machine: a call through a register.
 */
export interface MachineOptions {
  /** Module 9: a system job naming a control register outside 0 to 4 is illegal (cause 21). */
  readonly registerCheck?: boolean;
  /** Module 9's capstone: this kind, job 0, is a call through a register, `RY ← PC + 4` and `PC ← RA + c`. */
  readonly callThroughRegister?: number;
  /**
   * Module 10's capstone: this kind is "set if", `RY ← 1` if `RA cond RB`, else `RY ← 0`, with the
   * job digit a branch's condition (jobs 0 to 7; 8 to F illegal).
   */
  readonly setIf?: number;
}

/** Module 9's machine: the decoder checks a control register's number. */
export const MODULE_9: MachineOptions = { registerCheck: true };

/** Whether an instruction is illegal (cause 21), from its fields alone (docs/isa.md). */
export function isIllegal(f: Fields, options: MachineOptions = {}): boolean {
  if (options.callThroughRegister !== undefined && f.k === options.callThroughRegister)
    return f.j !== 0;
  if (options.setIf !== undefined && f.k === options.setIf) return f.j >= 8;
  switch (f.k) {
    case 1:
    case 2:
    case 5:
      return f.j >= 8;
    case 3:
    case 4:
      return ![0, 1, 8, 9].includes(f.j);
    case 6:
    case 7:
      return f.j !== 0;
    case 8:
      if (f.j >= 5) return true;
      // A control register's number is 0 to 4; the constant is read signed, so -1 is outside.
      if (f.j === 2 || f.j === 3) return f.c < 0 || f.c > 4;
      return false;
    default:
      return true;
  }
}

/** What one instruction did, for a view or a test to read: the changes at its edge. */
export interface StepRecord {
  readonly pc: bigint;
  readonly instruction?: number;
  readonly fields?: Fields;
  /** The register written, and the word it took. */
  readonly wrote?: { readonly reg: number; readonly value: bigint | undefined };
  /** The memory address a load or store reached, and the word or byte moved. */
  readonly memory?: {
    readonly address: bigint;
    readonly store: boolean;
    readonly byte: boolean;
    readonly value: bigint | undefined;
  };
  readonly nextPc: bigint;
  readonly stopped?: StopReason;
}

const signedByteWord = (n: number) => BigInt(n);

/** Reads `count` bytes from the memory at a known address, low byte first; unknown if any is. */
function readBytes(
  s: CpuState,
  inputs: MachineInputs,
  address: number,
  count: number,
): bigint | undefined {
  if (address >= MAP.deviceStart) return deviceRead(s, inputs, address);
  let value = 0n;
  for (let i = count - 1; i >= 0; i--) {
    const at = address + i;
    const byte = at < MAP.romEnd ? s.rom[at] : s.ram[at - MAP.ramStart];
    if (byte === undefined) return undefined;
    value = (value << 8n) | signedByteWord(byte);
  }
  return value;
}

function deviceRead(s: CpuState, inputs: MachineInputs, address: number): bigint {
  switch (address) {
    case DEVICES.display:
      return s.display;
    case DEVICES.lamps:
      return BigInt(s.lamps);
    case DEVICES.signals:
      return BigInt(inputs.door | (inputs.warm << 1));
    case DEVICES.sensorA:
      return inputs.sensorA & MASK64;
    case DEVICES.sensorB:
      return inputs.sensorB & MASK64;
    case DEVICES.timer:
      return s.timer;
    case DEVICES.waiting:
      return BigInt(s.waiting);
    default:
      return 0n;
  }
}

/**
 * The memory check for an access (docs/machine.md, causes 31 to 34), or undefined when the access
 * is allowed. The lower number wins: no memory, then misaligned, then read-only.
 */
export function memoryCheck(address: bigint, store: boolean, byte: boolean): number | undefined {
  if (address >= BigInt(MAP.end) || address >= BigInt(DEVICES.none)) return CAUSES.noMemory;
  const a = Number(address);
  const device = a >= MAP.deviceStart;
  if (byte ? device : a % 8 !== 0) return CAUSES.misaligned;
  if (store) {
    if (a < MAP.romEnd) return CAUSES.readOnly;
    if (a === DEVICES.signals || a === DEVICES.sensorA || a === DEVICES.sensorB)
      return CAUSES.readOnly;
  }
  return undefined;
}

/** The edge's work on the devices that runs whatever the instruction: the door's event. */
function doorEvent(s: CpuState, inputs: MachineInputs): number {
  return inputs.door === 1 && s.doorBefore === 0 ? 2 : 0;
}

/**
 * One edge: the instruction at the PC, run as `docs/isa.md` says. A machine that has stopped
 * changes nothing. A trap stops the machine and changes nothing else the instruction would have
 * changed; the door's event is the device's own and is kept at every edge.
 */
export function step(
  s: CpuState,
  inputs: MachineInputs = QUIET_INPUTS,
  options: MachineOptions = {},
): { state: CpuState; record: StepRecord } {
  if (s.stopped) return { state: s, record: { pc: s.pc, nextPc: s.pc, stopped: s.stopped.reason } };
  const pc = s.pc;
  const stop = (reason: StopReason, extra: Partial<StepRecord> = {}) => ({
    state: {
      ...s,
      waiting: s.waiting | doorEvent(s, inputs),
      doorBefore: inputs.door,
      stopped: { reason, pc },
    },
    record: { pc, ...extra, nextPc: pc, stopped: reason },
  });
  if (pc >= BigInt(MAP.romEnd)) return stop({ kind: "trap", cause: CAUSES.outsideRom });
  if (pc % 4n !== 0n) return stop({ kind: "trap", cause: CAUSES.notMultipleOf4 });
  const at = Number(pc);
  const instruction =
    ((s.rom[at] ?? 0) |
      ((s.rom[at + 1] ?? 0) << 8) |
      ((s.rom[at + 2] ?? 0) << 16) |
      ((s.rom[at + 3] ?? 0) << 24)) >>>
    0;
  const f = fieldsOf(instruction);
  const seen = { instruction, fields: f };
  // Module 8 builds no control registers, so its decoder does not check a control register's
  // number: a system job 1 to 3 stops the machine as one Module 12 builds, whatever its constant.
  // Module 9's decoder makes the check first (cause 21), and stops on the job only if it passes.
  if (!options.registerCheck && f.k === 8 && f.j >= 1 && f.j <= 3)
    return stop({ kind: "later" }, seen);
  if (isIllegal(f, options)) return stop({ kind: "trap", cause: CAUSES.illegal }, seen);
  if (f.k === 8) {
    if (f.j === 0) return stop({ kind: "trap", cause: CAUSES.system }, seen);
    if (f.j === 4) return stop({ kind: "stop" }, seen);
    return stop({ kind: "later" }, seen);
  }
  const pc4 = (pc + 4n) & MASK64;
  const c = widen(f.raw);
  const ra = s.regs[f.a];
  const rb = s.regs[f.b];
  let nextPc = pc4;
  let wrote: StepRecord["wrote"];
  let memory: StepRecord["memory"];
  let regs = s.regs;
  let ram = s.ram;
  let display = s.display;
  let lamps = s.lamps;
  let timerWritten: bigint | undefined;
  let waitingClear = 0;
  const write = (reg: number, value: bigint | undefined) => {
    wrote = { reg, value };
    regs = regs.map((r, i) => (i === reg ? value : r));
  };
  switch (f.k) {
    case 1:
    case 2: {
      const b = f.k === 1 ? rb : c;
      // Count up and count down read only A; copy B reads only B.
      const needA = f.j !== 5;
      const needB = f.j !== 6 && f.j !== 7;
      write(
        f.y,
        (needA && ra === undefined) || (needB && b === undefined)
          ? undefined
          : alu64(f.j, ra ?? 0n, b ?? 0n).y,
      );
      break;
    }
    case 3:
    case 4: {
      const absolute = (f.j & 8) !== 0;
      const byte = (f.j & 1) === 1;
      const store = f.k === 4;
      const base = absolute ? 0n : ra;
      if (base === undefined) throw new Error("the reference does not run an unknown address");
      const address = (base + c) & MASK64;
      const cause = memoryCheck(address, store, byte);
      if (cause !== undefined) return stop({ kind: "trap", cause }, seen);
      const a = Number(address);
      if (store) {
        const value = rb === undefined ? undefined : byte ? rb & 0xffn : rb;
        memory = { address, store, byte, value };
        if (a >= MAP.deviceStart) {
          const v = rb ?? 0n;
          if (a === DEVICES.display) display = v;
          else if (a === DEVICES.lamps) lamps = Number(v & 7n);
          else if (a === DEVICES.timer) timerWritten = v;
          else if (a === DEVICES.waiting) waitingClear = Number(v & 3n);
        } else {
          const bytes = byte ? 1 : 8;
          ram = ram.map((old, i) => {
            const k = i + MAP.ramStart - a;
            if (k < 0 || k >= bytes) return old;
            return rb === undefined ? undefined : Number((rb >> BigInt(8 * k)) & 0xffn);
          });
        }
      } else {
        const value = byte ? readBytes(s, inputs, a, 1) : readBytes(s, inputs, a, 8);
        memory = { address, store, byte, value };
        write(f.y, value);
      }
      break;
    }
    case 5: {
      // Always and never read no flag, so they need no known words.
      const flags =
        f.j < 2
          ? { zero: 0, minus: 0, cout: 0, over: 0 }
          : ra !== undefined && rb !== undefined
            ? alu64(3, ra, rb)
            : undefined;
      if (!flags) throw new Error("the reference does not branch on an unknown word");
      if (branchTaken(f.j, flags)) nextPc = (pc + 4n * c) & MASK64;
      break;
    }
    case 6:
      write(f.y, pc4);
      nextPc = (pc + 4n * c) & MASK64;
      break;
    case 7:
      if (ra === undefined) throw new Error("the reference does not jump to an unknown address");
      nextPc = (ra + c) & MASK64;
      break;
    case options.callThroughRegister:
      // Module 9's capstone: the call's return address and the jump's target, in one instruction.
      if (ra === undefined) throw new Error("the reference does not jump to an unknown address");
      write(f.y, pc4);
      nextPc = (ra + c) & MASK64;
      break;
    case options.setIf: {
      // Module 10's capstone: a branch's condition on RA - RB, kept as the word 1 or 0.
      const flags =
        f.j < 2
          ? { zero: 0, minus: 0, cout: 0, over: 0 }
          : ra !== undefined && rb !== undefined
            ? alu64(3, ra, rb)
            : undefined;
      write(f.y, flags ? (branchTaken(f.j, flags) ? 1n : 0n) : undefined);
      break;
    }
  }
  // The timer counts instructions: down by one as each finishes, while its count is not 0. A
  // write replaces the count. Bit 0 of "waiting" is set as the count goes from 1 to 0.
  let timer = s.timer;
  let reached = 0;
  if (timerWritten !== undefined) timer = timerWritten & MASK64;
  else if (timer !== 0n) {
    if (timer === 1n) reached = 1;
    timer -= 1n;
  }
  // A set and a clear of the same bit at one edge: the set wins.
  const sets = reached | doorEvent(s, inputs);
  const waiting = (s.waiting & ~waitingClear) | sets;
  const state: CpuState = {
    ...s,
    pc: nextPc,
    regs,
    ram,
    display,
    lamps,
    timer,
    waiting,
    doorBefore: inputs.door,
  };
  return {
    state,
    record: {
      pc,
      instruction,
      fields: f,
      ...(wrote ? { wrote } : {}),
      ...(memory ? { memory } : {}),
      nextPc,
    },
  };
}

/** Runs until the machine stops or `limit` instructions have run; the records of each. */
export function run(
  s: CpuState,
  limit = 1000,
  inputs: MachineInputs = QUIET_INPUTS,
  options: MachineOptions = {},
): { state: CpuState; records: StepRecord[] } {
  const records: StepRecord[] = [];
  let state = s;
  for (let i = 0; i < limit && !state.stopped; i++) {
    const r = step(state, inputs, options);
    state = r.state;
    records.push(r.record);
  }
  return { state, records };
}

/** A word of the RAM, low byte first, or unknown if any of its bytes is. */
export function ramWord(s: CpuState, address: number): bigint | undefined {
  let v = 0n;
  for (let i = 7; i >= 0; i--) {
    const b = s.ram[address - MAP.ramStart + i];
    if (b === undefined) return undefined;
    v = (v << 8n) | BigInt(b);
  }
  return v;
}

/** An instruction as eight hexadecimal digits, as `docs/isa.md` writes one. */
export function instructionHex(instruction: number): string {
  return (instruction >>> 0).toString(16).toUpperCase().padStart(8, "0");
}
