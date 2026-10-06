// Copyright © 2026 Christopher Snow

// Module 8: the datapath's state read off the simulator's own nets, and the datapath run from
// reset, an edge an instruction, for the tests, the graders and the figures. Nothing here works a
// value out: every word is a net's value, or a slice of a memory's state net.

import { Simulator, memoryWords, word, type Circuit, type NetId, type Word } from "@dd/sim";

import { assemble } from "./assemble";
import { datapathCircuit, type Stage } from "./datapath";
import {
  MAP,
  QUIET_INPUTS,
  resetMachine,
  step,
  type CpuState,
  type MachineInputs,
  type StopReason,
} from "./machine";

const isKnown = (w: Word) => w.known === (1n << BigInt(w.width)) - 1n;
const known = (w: Word | undefined): bigint | undefined => (w && isKnown(w) ? w.value : undefined);

function net(circuit: Circuit, name: string): NetId | undefined {
  return circuit.nets.find((n) => n.name === name)?.id;
}

/**
 * Where a block sits, found by a net only it has: the register file's `lowState`, the memory's
 * `bank0State`. The drawn datapath names the blocks `registers` and `memory`; a text names them
 * as it likes, so the reader finds them by what they hold (Module 8).
 */
function prefixOf(circuit: Circuit, suffix: string, width: number): string | undefined {
  const n = circuit.nets.find(
    (x) => x.width === width && (x.name === suffix || x.name.endsWith(`/${suffix}`)),
  );
  return n ? n.name.slice(0, n.name.length - suffix.length) : undefined;
}

const REG_STATE = 16 * 32 + 1;
const BANK_STATE = 120 * 8 + 1;

/** The datapath's state as the simulator holds it now: what the next edge works from. */
export interface DatapathState {
  readonly pc?: bigint;
  /** R0 to R15; a register any of whose bits is unknown is `undefined`. */
  readonly regs: readonly (bigint | undefined)[];
  /** The RAM's bytes from address 400, when the stage has a memory. */
  readonly ram?: readonly (number | undefined)[];
  readonly display?: bigint;
  readonly lamps?: number;
  readonly timer?: bigint;
  readonly waiting?: number;
  /** The instruction on the IR bus. */
  readonly ir?: number;
  /** Whether this edge stops the machine, and the cause (00 for `stop`). */
  readonly halt?: 0 | 1;
  readonly cause?: number;
}

/** Each register's word, read off the register file's two banks. */
export function registersOf(circuit: Circuit, values: readonly Word[]): (bigint | undefined)[] {
  const at = prefixOf(circuit, "lowState", REG_STATE) ?? "registers/";
  const low = net(circuit, `${at}lowState`);
  const high = net(circuit, `${at}highState`);
  if (low === undefined || high === undefined) return [];
  const lo = memoryWords(values[low] as Word, 16, 32);
  const hi = memoryWords(values[high] as Word, 16, 32);
  return lo.map((l, k) => {
    const h = hi[k] as Word;
    return isKnown(l) && isKnown(h) ? (h.value << 32n) | l.value : undefined;
  });
}

/** Each register's word with its unknown bits, for a view that draws X digit by digit. */
export function registerWords(circuit: Circuit, values: readonly Word[]): Word[] {
  const at = prefixOf(circuit, "lowState", REG_STATE) ?? "registers/";
  const low = net(circuit, `${at}lowState`);
  const high = net(circuit, `${at}highState`);
  if (low === undefined || high === undefined) return [];
  const lo = memoryWords(values[low] as Word, 16, 32);
  const hi = memoryWords(values[high] as Word, 16, 32);
  return lo.map((l, k) => {
    const h = hi[k] as Word;
    return { width: 64, value: (h.value << 32n) | l.value, known: (h.known << 32n) | l.known };
  });
}

/** The RAM's bytes from address 400, read off its eight banks. */
export function ramBytesOf(
  circuit: Circuit,
  values: readonly Word[],
): (number | undefined)[] | undefined {
  const at = prefixOf(circuit, "bank0State", BANK_STATE) ?? "memory/";
  const banks = Array.from({ length: 8 }, (_, k) => net(circuit, `${at}bank${k}State`));
  if (banks.some((b) => b === undefined)) return undefined;
  const rows = banks.map((b) => memoryWords(values[b as NetId] as Word, 120, 8));
  const out: (number | undefined)[] = [];
  for (let r = 0; r < 120; r++)
    for (let k = 0; k < 8; k++) {
      const v = known(rows[k]?.[r]);
      out.push(v === undefined ? undefined : Number(v));
    }
  return out;
}

export function datapathState(circuit: Circuit, values: readonly Word[]): DatapathState {
  const read = (name: string) => {
    const id = net(circuit, name);
    return id === undefined ? undefined : values[id];
  };
  const opt = <T>(key: string, v: T | undefined) => (v === undefined ? {} : { [key]: v });
  const mem = prefixOf(circuit, "bank0State", BANK_STATE) ?? "memory/";
  const waiting = [read(`${mem}W0`), read(`${mem}W1`)];
  const ram = ramBytesOf(circuit, values);
  const halt = known(read("HALT"));
  const cause = known(read("CAUSE"));
  const ir = known(read("IR"));
  const lamps = known(read("LAMPS"));
  return {
    ...opt("pc", known(read("PC"))),
    regs: registersOf(circuit, values),
    ...(ram ? { ram } : {}),
    ...opt("display", known(read("DISPLAY"))),
    ...opt("lamps", lamps === undefined ? undefined : Number(lamps)),
    ...opt("timer", known(read(`${mem}COUNT`))),
    ...(waiting.every((w) => w && isKnown(w))
      ? { waiting: Number((waiting[0] as Word).value) | (Number((waiting[1] as Word).value) << 1) }
      : {}),
    ...opt("ir", ir === undefined ? undefined : Number(ir)),
    ...opt("halt", halt === undefined ? undefined : (Number(halt) as 0 | 1)),
    ...opt("cause", cause === undefined ? undefined : Number(cause)),
  };
}

/** Why a halted datapath stops, as the reference says it: a trap's cause, `stop`, or later. */
export function stopReasonOf(state: DatapathState): StopReason | undefined {
  if (state.halt !== 1) return undefined;
  if (state.cause !== undefined && state.cause !== 0) return { kind: "trap", cause: state.cause };
  // CAUSE 00: the decoder's STOP, which is `stop` (job 4) or a system job Module 12 builds.
  const job = state.ir === undefined ? undefined : (state.ir >>> 24) & 15;
  return job === 4 ? { kind: "stop" } : { kind: "later" };
}

/** The shop's inputs as the datapath's input words. */
export function shopInputs(inputs: MachineInputs): Record<string, Word> {
  return {
    DOOR: word(1, inputs.door),
    WARM: word(1, inputs.warm),
    SENSORA: word(64, inputs.sensorA),
    SENSORB: word(64, inputs.sensorB),
  };
}

/** A simulator for a datapath from the fetch stage on, reset: one edge with RST at 1. */
export function resetDatapath(circuit: Circuit, inputs?: MachineInputs): Simulator {
  const sim = new Simulator(circuit);
  const has = (name: string) => circuit.inputs.some((i) => i.name === name);
  sim.setInput("CLK", word(1, 0));
  if (has("RST")) sim.setInput("RST", word(1, 1));
  if (inputs && has("DOOR"))
    for (const [n, w] of Object.entries(shopInputs(inputs))) sim.setInput(n, w);
  sim.settle();
  if (has("RST")) {
    sim.clockCycle("CLK");
    sim.setInput("RST", word(1, 0));
    sim.settle();
  }
  return sim;
}

/** The RAM's word at an address, low byte first, from the datapath's banks. */
export function datapathRamWord(state: DatapathState, address: number): bigint | undefined {
  if (!state.ram) return undefined;
  let v = 0n;
  for (let i = 7; i >= 0; i--) {
    const byte = state.ram[address - MAP.ramStart + i];
    if (byte === undefined) return undefined;
    v = (v << 8n) | BigInt(byte);
  }
  return v;
}

/** What a comparison found: each difference, with the instruction it came after. */
export interface DatapathComparison {
  readonly instructions: number;
  readonly differences: readonly string[];
}

const hex = (v: bigint | number | undefined) =>
  v === undefined ? "X" : BigInt(v).toString(16).toUpperCase();

/**
 * Runs a program on the datapath at a stage and on the reference, from reset, and compares them
 * after every instruction: the PC, every register, every byte of the RAM, the display, the lamps,
 * the timer and "waiting"; and, where the reference stops, that the datapath halts for the same
 * reason and that one more edge changes nothing.
 */
export function compareWithReference(
  stage: Stage | ((rom: Uint8Array) => Circuit),
  source: string,
  inputs: MachineInputs = QUIET_INPUTS,
  limit = 400,
): DatapathComparison {
  const program = assemble(source);
  const circuit =
    typeof stage === "function" ? stage(program.rom) : datapathCircuit({ stage, rom: program.rom });
  const sim = resetDatapath(circuit, inputs);
  let ref: CpuState = resetMachine(program.rom);
  const differences: string[] = [];
  const textAt = (pc: bigint) =>
    program.lines.find((l) => BigInt(l.address) === pc && l.instruction !== undefined)?.text ?? "";
  const same = (
    what: string,
    at: string,
    a: bigint | number | undefined,
    b: bigint | number | undefined,
  ) => {
    if ((a === undefined ? undefined : BigInt(a)) !== (b === undefined ? undefined : BigInt(b)))
      differences.push(`${at}: ${what} is ${hex(a)} on the datapath, ${hex(b)} by the reference`);
  };
  let count = 0;
  for (; count < limit && differences.length === 0; count++) {
    const before = datapathState(circuit, sim.snapshotValues());
    const r = step(ref, inputs);
    const at = `after ${hex(ref.pc).padStart(3, "0")} ${textAt(ref.pc)}`;
    if (r.state.stopped) {
      const reason = stopReasonOf(before);
      if (JSON.stringify(reason) !== JSON.stringify(r.state.stopped.reason))
        differences.push(
          `${at}: the datapath stops with ${JSON.stringify(reason)}, the reference with ${JSON.stringify(r.state.stopped.reason)}`,
        );
      sim.clockCycle("CLK");
      const after = datapathState(circuit, sim.snapshotValues());
      same("the PC after a stopped edge", at, after.pc, before.pc);
      after.regs.forEach((v, k) => same(`R${k} after a stopped edge`, at, v, before.regs[k]));
      if (after.ram && before.ram)
        after.ram.forEach((v, k) =>
          same(`the byte at ${hex(0x400 + k)} after a stopped edge`, at, v, before.ram?.[k]),
        );
      same("the display after a stopped edge", at, after.display, before.display);
      count++;
      break;
    }
    if (before.halt !== 0)
      differences.push(
        `${at}: the datapath halts (cause ${hex(before.cause)}); the reference does not`,
      );
    sim.clockCycle("CLK");
    ref = r.state;
    const now = datapathState(circuit, sim.snapshotValues());
    same("the PC", at, now.pc, ref.pc);
    ref.regs.forEach((v, k) => same(`R${k}`, at, now.regs[k], v));
    if (now.ram)
      ref.ram.forEach((v, k) => same(`the byte at ${hex(0x400 + k)}`, at, now.ram?.[k], v));
    if (
      now.display !== undefined ||
      stage === "memory" ||
      stage === "full" ||
      typeof stage === "function"
    ) {
      same("the display", at, now.display, ref.display);
      same("the lamps", at, now.lamps, ref.lamps);
      same("the timer", at, now.timer, ref.timer);
      same("waiting", at, now.waiting, ref.waiting);
    }
  }
  return { instructions: count, differences };
}
