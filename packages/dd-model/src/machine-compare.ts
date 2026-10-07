// Copyright © 2026 Christopher Snow

// Module 10, lesson 1: two circuits for one instruction set, run side by side. Module 8's machine
// takes one edge an instruction; Module 9's takes 3 to 5. Both start from reset with one program
// and the same shop. The pair moves an edge of Module 9's machine at a time; when that edge ends an
// instruction (its PC's enable was 1), Module 8's machine takes its one edge for the same
// instruction, so the two are side by side after every instruction. Every word shown is a net's
// value in one of the two simulators; nothing is worked out here.

import { Simulator, type Circuit, type Word } from "@dd/sim";

import { assemble, type Program } from "./assemble";
import { CONTROL_STATES, type ControlState } from "./control";
import { datapathCircuit } from "./datapath";
import { datapathState, resetDatapath, type DatapathState } from "./datapath-run";
import { applyFaults, type Fault } from "./faults";
import { QUIET_INPUTS, fieldsOf, type MachineInputs } from "./machine";
import { multicycleCircuit } from "./multicycle";
import { bitOf } from "./multicycle-run";
import { netWord } from "./multicycle-view";

/** One instruction both machines ran: where it was, and the edges each took. */
export interface PairedInstruction {
  readonly address: number;
  readonly text: string;
  readonly kind: number;
  /** Module 9's edges for it; a stop takes 2, its fetch and the edge at which it halts (9.3). */
  readonly edges: number;
  /** Module 8's edges for it: 1, or 0 where Module 8's machine had already halted. */
  readonly singleEdges: number;
  /** What the two machines differ on after it, by name; empty when they agree. */
  readonly differ: readonly string[];
  /** Whether it stopped the machines. */
  readonly stops: boolean;
}

export interface MachinePair {
  readonly program: Program;
  /** Module 8's machine: one edge an instruction. */
  readonly single: Simulator;
  /** Module 9's machine: several edges an instruction, with any faults the figure put in. */
  readonly multi: Simulator;
  /** The instructions run so far. */
  readonly log: PairedInstruction[];
  /** Module 9's edges into the instruction it is running. */
  edgesIn: number;
  /** Where Module 9's machine last fetched an instruction. */
  fetchedAt: number;
}

/** The two machines from reset, with one program and the shop's inputs. */
export function startPair(
  source: string,
  inputs: MachineInputs = QUIET_INPUTS,
  faults: readonly Fault[] = [],
): MachinePair {
  const program = assemble(source);
  const single = resetDatapath(datapathCircuit({ stage: "full", rom: program.rom }), inputs);
  const multi = resetDatapath(applyFaults(multicycleCircuit({ rom: program.rom }), faults), inputs);
  return { program, single, multi, log: [], edgesIn: 0, fetchedAt: 0 };
}

/** The state an instruction set names: what a program can see. */
export interface SeenState {
  readonly pc?: bigint;
  readonly regs: readonly (bigint | undefined)[];
  readonly ram?: readonly (number | undefined)[];
  readonly display?: bigint;
  readonly lamps?: number;
  readonly timer?: bigint;
  readonly waiting?: number;
}

/** What Module 9's machine keeps that Module 8's has no part for. */
export interface OwnState {
  readonly state?: ControlState;
  readonly ir?: bigint;
  readonly ha?: bigint;
  readonly hb?: bigint;
  readonly hr?: bigint;
  readonly hm?: bigint;
}

const known = (w: Word | undefined) =>
  w && w.known === (1n << BigInt(w.width)) - 1n ? w.value : undefined;

function seen(state: DatapathState): SeenState {
  return {
    regs: state.regs,
    ...(state.pc === undefined ? {} : { pc: state.pc }),
    ...(state.ram ? { ram: state.ram } : {}),
    ...(state.display === undefined ? {} : { display: state.display }),
    ...(state.lamps === undefined ? {} : { lamps: state.lamps }),
    ...(state.timer === undefined ? {} : { timer: state.timer }),
    ...(state.waiting === undefined ? {} : { waiting: state.waiting }),
  };
}

/** What a program can see on each machine now, and what Module 9's keeps of its own. */
export function pairView(pair: MachinePair): {
  single: SeenState;
  multi: SeenState;
  own: OwnState;
  differ: string[];
  /** Whether each machine has stopped. */
  halted: { single: boolean; multi: boolean };
} {
  const one = datapathState(pair.single.circuit, pair.single.snapshotValues());
  const values = pair.multi.snapshotValues();
  const many = datapathState(pair.multi.circuit, values);
  const word = (name: string) => known(netWord(pair.multi.circuit, values, name));
  const code = word("control/S");
  const state = (Object.entries(CONTROL_STATES).find(
    ([, c]) => code !== undefined && BigInt(`0b${c}`) === code,
  )?.[0] ?? undefined) as ControlState | undefined;
  const own: OwnState = {
    ...(state ? { state } : {}),
    ...opt("ir", word("IR")),
    ...opt("ha", word("datapath/HA")),
    ...opt("hb", word("HB")),
    ...opt("hr", word("datapath/HR")),
    ...opt("hm", word("datapath/HM")),
  };
  return {
    single: seen(one),
    multi: seen(many),
    own,
    differ: differences(seen(one), seen(many)),
    halted: { single: one.halt === 1, multi: many.halt === 1 },
  };
}

function opt<T>(key: string, v: T | undefined): Record<string, T> {
  return v === undefined ? {} : { [key]: v };
}

/**
 * Where two machines' seen states differ, by the names a lesson uses: `PC`, `R0` to `R15`,
 * `RAM` (any byte), `display`, `lamps`, `timer`, `waiting`.
 */
export function differences(a: SeenState, b: SeenState): string[] {
  const out: string[] = [];
  const same = (x: bigint | number | undefined, y: bigint | number | undefined) =>
    (x === undefined ? undefined : BigInt(x)) === (y === undefined ? undefined : BigInt(y));
  if (!same(a.pc, b.pc)) out.push("PC");
  for (let k = 0; k < 16; k++) if (!same(a.regs[k], b.regs[k])) out.push(`R${k}`);
  if ((a.ram ?? []).some((v, k) => !same(v, b.ram?.[k]))) out.push("RAM");
  if (!same(a.display, b.display)) out.push("display");
  if (!same(a.lamps, b.lamps)) out.push("lamps");
  if (!same(a.timer, b.timer)) out.push("timer");
  if (!same(a.waiting, b.waiting)) out.push("waiting");
  return out;
}

/** The program's line at an address, as written. */
function lineAt(program: Program, address: number) {
  return program.lines.find((l) => l.address === address && l.instruction !== undefined);
}

/**
 * One edge of Module 9's machine. If that edge ends an instruction, Module 8's machine takes its
 * edge too and the instruction is logged with the two machines' differences after it. A machine
 * that has stopped takes no edge: a stop is logged once, when Module 9's machine halts on it.
 * Returns whether anything moved.
 */
export function edgePair(pair: MachinePair): boolean {
  const view = pairView(pair);
  const pc = Number(view.multi.pc ?? 0n);
  const line = lineAt(pair.program, pc);
  const kind = line?.instruction === undefined ? 0 : fieldsOf(line.instruction).k;
  if (view.halted.multi) {
    if (pair.log.at(-1)?.stops) return false;
    // The edge at which the stop halts the machine: it changes nothing a program can see.
    pair.multi.clockCycle("CLK");
    let edges = pair.edgesIn + 1;
    // The stop is logged at the address it was fetched from. Where a fault ended an instruction at
    // the stop's fetch edge, that fetch was logged on its own; it is the stop's first edge.
    const fetched = pair.fetchedAt;
    const last = pair.log.at(-1);
    if (last && !last.stops && last.address === fetched && pair.edgesIn === 0) {
      pair.log.pop();
      edges = last.edges + 1;
    }
    const at = lineAt(pair.program, fetched);
    const after = pairView(pair);
    pair.log.push({
      address: fetched,
      text: at?.text ?? "",
      kind: at?.instruction === undefined ? 0 : fieldsOf(at.instruction).k,
      edges,
      // Module 8's machine takes its one edge for the stop when it halts on the same one.
      singleEdges: after.halted.single && Number(after.single.pc ?? -1n) === fetched ? 1 : 0,
      differ: after.differ,
      stops: true,
    });
    pair.edgesIn = 0;
    return false;
  }
  if (view.own.state === "FETCH") pair.fetchedAt = pc;
  const ends = bitOf(pair.multi, "PCEN") === 1;
  pair.multi.clockCycle("CLK");
  pair.edgesIn++;
  if (!ends) return true;
  const singleRan = !view.halted.single;
  if (singleRan) pair.single.clockCycle("CLK");
  pair.log.push({
    address: pc,
    text: line?.text ?? "",
    kind,
    edges: pair.edgesIn,
    singleEdges: singleRan ? 1 : 0,
    differ: pairView(pair).differ,
    stops: false,
  });
  pair.edgesIn = 0;
  return true;
}

/** Module 9's edges until the instruction it is running ends, or it halts (at most 8). */
export function instructionPair(pair: MachinePair): void {
  const before = pair.log.length;
  for (let k = 0; k < 8 && pair.log.length === before; k++) if (!edgePair(pair)) break;
}

/** Runs both machines until Module 9's halts, or `limit` instructions have run. */
export function runPair(pair: MachinePair, limit = 200): void {
  for (let k = 0; k < limit && !pair.log.at(-1)?.stops; k++) {
    const before = pair.log.length;
    instructionPair(pair);
    if (pair.log.length === before) break;
  }
}

/** The circuits a pair runs, for a test that counts their parts. */
export function pairCircuits(pair: MachinePair): { single: Circuit; multi: Circuit } {
  return { single: pair.single.circuit, multi: pair.multi.circuit };
}

/** What one machine has for a part, read from its circuit. */
export type PartForm =
  | { readonly kind: "registers"; readonly count: number; readonly width: number }
  | { readonly kind: "register"; readonly width: number }
  | { readonly kind: "rom-output"; readonly width: number }
  | { readonly kind: "memory" }
  | { readonly kind: "devices"; readonly names: readonly string[] }
  | { readonly kind: "none" };

/** The parts the lesson names, in the order it names them. */
export const MACHINE_PARTS = [
  "registers",
  "pc",
  "memory",
  "devices",
  "ir",
  "ha",
  "hb",
  "hr",
  "hm",
  "state",
] as const;
export type MachinePart = (typeof MACHINE_PARTS)[number];

export interface PartRow {
  readonly part: MachinePart;
  /** Module 8's machine. */
  readonly single: PartForm;
  /** Module 9's machine. */
  readonly multi: PartForm;
}

const DEVICES = ["display", "lamps", "timer", "waiting"] as const;
const HELD: Readonly<Record<string, string>> = { ha: "HA", hb: "HB", hr: "HR", hm: "HM" };

/** What a circuit has for one part: the component that keeps it, found by its net or its path. */
function partOf(circuit: Circuit, part: MachinePart): PartForm {
  const leaf = (path: string, end: string) => path === end || path.endsWith(`/${end}`);
  const kept = circuit.components.filter((c) => c.kind === "memory");
  const driver = (name: string) => {
    const net = circuit.nets.find((n) => leaf(n.name, name));
    if (!net) return undefined;
    const by = circuit.components.find((c) => Object.values(c.outputs).includes(net.id));
    return by ? { by, width: net.width } : undefined;
  };
  const byNet = (name: string): PartForm => {
    const d = driver(name);
    if (!d) return { kind: "none" };
    if (d.by.kind === "memory") return { kind: "register", width: d.width };
    if (d.by.kind === "rom") return { kind: "rom-output", width: d.width };
    return { kind: "none" };
  };
  switch (part) {
    case "registers": {
      const halves = kept.filter((c) => /registers\/(low|high)$/.test(c.path));
      const first = halves[0];
      if (!first) return { kind: "none" };
      const width = halves.reduce((sum, c) => sum + Number(c.params?.width ?? 0), 0);
      return { kind: "registers", count: Number(first.params?.words ?? 0), width };
    }
    case "pc":
      return byNet("PC");
    case "ir":
      return byNet("IR");
    case "memory": {
      const rom = circuit.components.some((c) => c.kind === "rom" && leaf(c.path, "memory/rom"));
      const ram = kept.some((c) => /memory\/bank\d+$/.test(c.path));
      return rom && ram ? { kind: "memory" } : { kind: "none" };
    }
    case "devices": {
      // The waiting bits are two registers of one bit each, waiting0 and waiting1.
      const names = DEVICES.filter((d) =>
        kept.some((c) => leaf(c.path, `memory/${d}/register`) || leaf(c.path, `memory/${d}0`)),
      );
      return names.length ? { kind: "devices", names } : { kind: "none" };
    }
    case "state": {
      const state = kept.find((c) => leaf(c.path, "controller/state/register"));
      return state
        ? { kind: "register", width: Number(state.params?.width ?? 0) }
        : { kind: "none" };
    }
    default:
      return byNet(HELD[part] ?? part);
  }
}

/** Each part the lesson names, as Module 8's machine and Module 9's have it. */
export function machineParts(): readonly PartRow[] {
  const single = datapathCircuit({ stage: "full" });
  const multi = multicycleCircuit();
  return MACHINE_PARTS.map((part) => ({
    part,
    single: partOf(single, part),
    multi: partOf(multi, part),
  }));
}
