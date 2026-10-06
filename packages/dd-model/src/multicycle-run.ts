// Copyright © 2026 Christopher Snow

// Module 9: the machine of several edges an instruction, run from reset against the
// instruction-level reference. The two are compared after every instruction, not every edge: the
// PC, every register, every byte of the RAM and the devices, as Module 8's comparison does, and
// each instruction's count of edges against the sequence its kind takes. Every word is read off
// the simulator's nets.

import type { Circuit, Simulator } from "@dd/sim";

import { assemble } from "./assemble";
import { edgesOfKind, type ControlOptions } from "./control";
import {
  datapathState,
  resetDatapath,
  stopReasonOf,
  type DatapathComparison,
} from "./datapath-run";
import {
  MODULE_9,
  QUIET_INPUTS,
  fieldsOf,
  resetMachine,
  step,
  type CpuState,
  type MachineInputs,
  type MachineOptions,
} from "./machine";
import { multicycleCircuit } from "./multicycle";

const hex = (v: bigint | number | undefined) =>
  v === undefined ? "X" : BigInt(v).toString(16).toUpperCase();

/** The value of a one-bit net the simulator holds now: 1, 0, or undefined while unknown. */
export function bitOf(sim: Simulator, name: string): 0 | 1 | undefined {
  const id = (
    sim.circuit.nets.find((n) => n.name === name) ??
    sim.circuit.nets.find((n) => n.name === `control/${name}`)
  )?.id;
  if (id === undefined) return undefined;
  const w = sim.snapshotValues()[id];
  if (!w || w.known !== 1n) return undefined;
  return w.value === 1n ? 1 : 0;
}

export interface MulticycleComparison extends DatapathComparison {
  /** Each instruction run: its kind and the edges it took. */
  readonly edges: readonly { readonly kind: number; readonly edges: number }[];
}

/** The reference's options for Module 9's machine, with the capstone's instruction if built. */
export function referenceFor(options: ControlOptions): MachineOptions {
  return options.callThroughRegister ? { ...MODULE_9, callThroughRegister: 9 } : MODULE_9;
}

/**
 * Runs a program on the machine of several edges an instruction and on the reference, from reset,
 * and compares them after every instruction: an instruction ends at the edge where the PC's
 * enable is 1. Where the reference stops, the machine must halt within the same instruction, for
 * the same reason, and one more edge must change nothing.
 */
export function compareMulticycle(
  source: string,
  inputs: MachineInputs = QUIET_INPUTS,
  options: ControlOptions = {},
  limit = 400,
  build: (rom: Uint8Array) => Circuit = (rom) => multicycleCircuit({ ...options, rom }),
): MulticycleComparison {
  const program = assemble(source, options.callThroughRegister ? { callThroughRegister: 9 } : {});
  const circuit = build(program.rom);
  const sim = resetDatapath(circuit, inputs);
  const refOptions = referenceFor(options);
  let ref: CpuState = resetMachine(program.rom);
  const differences: string[] = [];
  const edges: { kind: number; edges: number }[] = [];
  const textAt = (pc: bigint) =>
    program.lines.find((l) => BigInt(l.address) === pc && l.instruction !== undefined)?.text ?? "";
  const same = (
    what: string,
    at: string,
    a: bigint | number | undefined,
    b: bigint | number | undefined,
  ) => {
    if ((a === undefined ? undefined : BigInt(a)) !== (b === undefined ? undefined : BigInt(b)))
      differences.push(`${at}: ${what} is ${hex(a)} on the machine, ${hex(b)} by the reference`);
  };
  let count = 0;
  for (; count < limit && differences.length === 0; count++) {
    const r = step(ref, inputs, refOptions);
    const at = `after ${hex(ref.pc).padStart(3, "0")} ${textAt(ref.pc)}`;
    let taken = 0;
    let halted = false;
    for (;;) {
      const before = datapathState(circuit, sim.snapshotValues());
      if (before.halt === 1) {
        halted = true;
        const reason = stopReasonOf(before);
        if (!r.state.stopped)
          differences.push(
            `${at}: the machine halts (cause ${hex(before.cause)}); the reference does not`,
          );
        else if (JSON.stringify(reason) !== JSON.stringify(r.state.stopped.reason))
          differences.push(
            `${at}: the machine stops with ${JSON.stringify(reason)}, the reference with ${JSON.stringify(r.state.stopped.reason)}`,
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
        // The machine as the reference left it at its stop.
        same("the PC at the stop", at, after.pc, r.state.pc);
        r.state.regs.forEach((v, k) => same(`R${k} at the stop`, at, after.regs[k], v));
        break;
      }
      if (r.state.stopped && taken > 6) {
        differences.push(
          `${at}: the reference stops; the machine has not halted after ${taken} edges`,
        );
        break;
      }
      const ends = bitOf(sim, "PCEN") === 1;
      sim.clockCycle("CLK");
      taken++;
      if (ends) break;
      if (taken > 8) {
        differences.push(`${at}: the instruction has not ended after ${taken} edges`);
        break;
      }
    }
    if (halted || differences.length) {
      count++;
      break;
    }
    if (r.state.stopped) {
      differences.push(`${at}: the reference stops; the machine ended the instruction`);
      break;
    }
    const kind = r.record.fields?.k ?? fieldsOf(r.record.instruction ?? 0).k;
    edges.push({ kind, edges: taken });
    const expected = edgesOfKind(kind, options);
    if (expected !== undefined && taken !== expected)
      differences.push(`${at}: kind ${kind} took ${taken} edges, not ${expected}`);
    ref = r.state;
    const now = datapathState(circuit, sim.snapshotValues());
    same("the PC", at, now.pc, ref.pc);
    ref.regs.forEach((v, k) => same(`R${k}`, at, now.regs[k], v));
    if (now.ram)
      ref.ram.forEach((v, k) => same(`the byte at ${hex(0x400 + k)}`, at, now.ram?.[k], v));
    same("the display", at, now.display, ref.display);
    same("the lamps", at, now.lamps, ref.lamps);
    same("the timer", at, now.timer, ref.timer);
    same("waiting", at, now.waiting, ref.waiting);
  }
  return { instructions: count, differences, edges };
}
