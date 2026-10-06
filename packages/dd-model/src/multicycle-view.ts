// Copyright © 2026 Christopher Snow

// Module 9: what the machine of several edges does at its next edge, read off the simulator's
// nets: the controller's state, every control signal, and the register transfers the edge makes,
// its micro-operations. A figure turns these into words; nothing here works a value out that the
// nets do not hold.

import type { Circuit, Simulator, Word } from "@dd/sim";

import { CONTROL_STATES, type ControlState } from "./control";
import { registersOf } from "./datapath-run";

/** One register transfer an edge makes. */
export type MicroOp =
  | { readonly kind: "fetch" }
  | { readonly kind: "read"; readonly a: number; readonly b: number }
  | {
      readonly kind: "alu";
      readonly a: "HA" | "0";
      readonly b: "HB" | "c";
      /** The ALU's code, OP2 OP1 OP0. */
      readonly job: number;
    }
  | { readonly kind: "load"; readonly byte: boolean }
  | { readonly kind: "store"; readonly byte: boolean }
  | { readonly kind: "write"; readonly y: number; readonly from: "HR" | "HM" | "PC4" }
  | { readonly kind: "pc"; readonly to: "PC4" | "TARGET" | "RESULT" };

/** What the next edge will do. */
export interface EdgeView {
  /** The controller's state, by name, or undefined while unknown. */
  readonly state?: ControlState;
  /** Every control signal's value: 1, 0, or undefined while unknown. */
  readonly signals: Readonly<Record<string, 0 | 1 | undefined>>;
  /** The edge's register transfers, in the order the views list them. */
  readonly ops: readonly MicroOp[];
  /** Whether the edge ends the instruction: the PC takes its next value. */
  readonly ends: boolean;
  /** Whether the edge halts the machine. */
  readonly halts: boolean;
}

/** The signals a view of the control signals may list. */
export const VIEW_SIGNALS = [
  "FETCHING",
  "IREN",
  "CHECKING",
  "HOLDAB",
  "HOLDR",
  "MLOAD",
  "MSTORE",
  "HOLDM",
  "WREG",
  "PCEN",
  "GO",
  "WRITEY",
  "LOAD",
  "STORE",
  "BYTE",
  "AZERO",
  "BCONST",
  "OP2",
  "OP1",
  "OP0",
  "BRANCH",
  "CALL",
  "JUMP",
  "STOP",
] as const;

/** A net's word, by its name at the top level or its last part inside a block. */
export function netWord(circuit: Circuit, values: readonly Word[], name: string): Word | undefined {
  const n =
    circuit.nets.find((x) => x.name === name) ??
    circuit.nets.find((x) => x.name.endsWith(`/${name}`));
  return n === undefined ? undefined : values[n.id];
}

function bit(w: Word | undefined): 0 | 1 | undefined {
  if (!w || w.known !== 1n) return undefined;
  return w.value === 1n ? 1 : 0;
}

/** The view of the next edge, from the values the simulator holds now. */
export function edgeView(circuit: Circuit, values: readonly Word[]): EdgeView {
  const s = (name: string) => bit(netWord(circuit, values, name));
  const signals = Object.fromEntries(VIEW_SIGNALS.map((n) => [n, s(n)]));
  const sw = netWord(circuit, values, "S");
  const code = sw && sw.known === 7n ? sw.value.toString(2).padStart(3, "0") : undefined;
  const state = (Object.keys(CONTROL_STATES) as ControlState[]).find(
    (k) => CONTROL_STATES[k] === code,
  );
  const ir = netWord(circuit, values, "IR");
  const digit = (shift: number) =>
    ir && ir.known === 0xffffffffn ? Number((ir.value >> BigInt(shift)) & 15n) : 0;
  const ops: MicroOp[] = [];
  const on = (n: string) => signals[n] === 1;
  if (on("IREN")) ops.push({ kind: "fetch" });
  if (on("HOLDAB")) ops.push({ kind: "read", a: digit(20), b: digit(16) });
  if (on("HOLDR"))
    ops.push({
      kind: "alu",
      a: on("AZERO") ? "0" : "HA",
      b: on("BCONST") ? "c" : "HB",
      job: (signals["OP2"] ?? 0) * 4 + (signals["OP1"] ?? 0) * 2 + (signals["OP0"] ?? 0),
    });
  if (on("HOLDM")) ops.push({ kind: "load", byte: on("BYTE") });
  if (on("MSTORE") && on("GO")) ops.push({ kind: "store", byte: on("BYTE") });
  if (on("WREG"))
    ops.push({ kind: "write", y: digit(12), from: on("CALL") ? "PC4" : on("LOAD") ? "HM" : "HR" });
  if (on("PCEN")) {
    const met = bit(netWord(circuit, values, "MET")) === 1;
    ops.push({
      kind: "pc",
      to: on("JUMP") ? "RESULT" : (on("BRANCH") && met) || on("CALL") ? "TARGET" : "PC4",
    });
  }
  return {
    ...(state ? { state } : {}),
    signals,
    ops,
    ends: on("PCEN"),
    halts: bit(netWord(circuit, values, "HALT")) === 1,
  };
}

/** The edges the current instruction has left, the next one counted, run on a copy. */
export function edgesLeft(sim: Simulator, limit = 8): number {
  const saved = sim.snapshot();
  let n = 0;
  for (; n < limit; n++) {
    const view = edgeView(sim.circuit, sim.snapshotValues());
    if (view.halts) break;
    sim.clockCycle("CLK");
    if (view.ends) {
      n++;
      break;
    }
  }
  sim.restore(saved);
  sim.settle();
  return n;
}

/**
 * Which registers take a new word at the next edge, run on a copy: of IR, HA, HB, HR, HM, PC
 * and R0 to R15, in that order, joined by commas; `none` when the edge changes none.
 */
export function registersTaken(sim: Simulator): string {
  const circuit = sim.circuit;
  const named = ["IR", "HA", "HB", "HR", "HM", "PC"];
  const read = (values: readonly Word[]) => [
    ...named.map((n) => {
      const w = netWord(circuit, values, n);
      return w ? `${w.value}/${w.known}` : "";
    }),
    ...registersOf(circuit, values).map((v) => String(v)),
  ];
  const before = read(sim.snapshotValues());
  const saved = sim.snapshot();
  sim.clockCycle("CLK");
  const after = read(sim.snapshotValues());
  sim.restore(saved);
  sim.settle();
  const names = [...named, ...Array.from({ length: 16 }, (_, k) => `R${k}`)];
  const changed = names.filter((_, i) => before[i] !== after[i]);
  return changed.length ? changed.join(", ") : "none";
}
