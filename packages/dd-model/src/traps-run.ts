// Copyright © 2026 Christopher Snow

// Module 12: the machine of several edges with its trap hardware, run from reset against the
// instruction-level reference with Module 12's options. They are compared after every step of the
// reference: an instruction that finishes, or an edge that traps and goes to the handler. Both end
// at the edge where the circuit's PC enable is 1. Every word is read off the simulator's nets: the
// PC, the registers, the RAM, the devices, and C0 to C4.

import { word, type Circuit, type Simulator, type Word } from "@dd/sim";

import { assemble } from "./assemble";
import { datapathState, resetDatapath, stopReasonOf } from "./datapath-run";
import { inputsAt, type InputPlan } from "./debugger";
import {
  MODULE_12,
  MODULE_13,
  MODULE_13_ASSEMBLY,
  QUIET_INPUTS,
  resetMachine,
  step,
  type ControlRegisters,
  type CpuState,
} from "./machine";
import { bitOf } from "./multicycle-run";
import { trapStateSequence, trapsCircuit } from "./traps";

const hex = (v: bigint | number | undefined) =>
  v === undefined ? "X" : BigInt(v).toString(16).toUpperCase();

/** C0 to C4 as the circuit holds them now; a register with an unknown bit is undefined. */
export function controlRegistersOf(
  circuit: Circuit,
  values: readonly Word[],
): (bigint | undefined)[] {
  const read = (name: string) => {
    const id = circuit.nets.find((n) => n.name === name)?.id;
    const w = id === undefined ? undefined : values[id];
    return w && w.known === (1n << BigInt(w.width)) - 1n ? w.value : undefined;
  };
  return [
    read("STATUS"),
    read("datapath/cregs/C1"),
    read("datapath/C2"),
    read("datapath/cregs/C3"),
    read("datapath/C4"),
  ];
}

export interface TrapsComparison {
  readonly steps: number;
  readonly differences: readonly string[];
  /** Each step: the instruction's kind and job, or the trap's cause, and its edges. */
  readonly edges: readonly {
    readonly kind?: number;
    readonly job?: number;
    readonly trap?: number;
    readonly edges: number;
  }[];
}

/**
 * Runs a program on Module 12's machine and on the reference, and compares them after every step.
 * Where the reference halts, the machine must halt within the same step, for the same reason, and
 * one more edge must change nothing. With `final`, Module 13's final machine against the reference
 * with Module 13's options, the two added instructions included.
 */
export function compareTraps(
  source: string,
  plan: InputPlan = QUIET_INPUTS,
  limit = 400,
  build?: (rom: Uint8Array) => Circuit,
  final = false,
): TrapsComparison {
  const program = assemble(source, final ? MODULE_13_ASSEMBLY : {});
  const options = final ? MODULE_13 : MODULE_12;
  const circuit = build ? build(program.rom) : trapsCircuit({ rom: program.rom, final });
  const sim: Simulator = resetDatapath(circuit, inputsAt(plan, 0));
  let ref: CpuState = resetMachine(program.rom);
  let ran = 0;
  const differences: string[] = [];
  const edges: { kind?: number; job?: number; trap?: number; edges: number }[] = [];
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
  const compareControl = (at: string, now: readonly (bigint | undefined)[], c: ControlRegisters) =>
    c.forEach((v, k) => same(`C${k}`, at, now[k], v));
  let count = 0;
  for (; count < limit && differences.length === 0; count++) {
    const inputs = inputsAt(plan, ran);
    sim.setInput("DOOR", word(1, inputs.door));
    sim.settle();
    const r = step(ref, inputs, options);
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
        same("the PC at the stop", at, after.pc, r.state.pc);
        r.state.regs.forEach((v, k) => same(`R${k} at the stop`, at, after.regs[k], v));
        compareControl(at, controlRegistersOf(circuit, sim.snapshotValues()), r.state.control);
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
        differences.push(`${at}: the step has not ended after ${taken} edges`);
        break;
      }
    }
    if (halted || differences.length) {
      count++;
      break;
    }
    if (r.state.stopped) {
      differences.push(`${at}: the reference stops; the machine ended the step`);
      break;
    }
    if (r.record.trap) edges.push({ trap: r.record.trap.cause, edges: taken });
    else {
      const f = r.record.fields;
      edges.push({ kind: f?.k ?? 0, job: f?.j ?? 0, edges: taken });
      const expected = trapStateSequence(f?.k ?? 0, f?.j ?? 0, final).length;
      if (taken !== expected)
        differences.push(`${at}: kind ${f?.k} job ${f?.j} took ${taken} edges, not ${expected}`);
      ran++;
    }
    ref = r.state;
    const values = sim.snapshotValues();
    const now = datapathState(circuit, values);
    same("the PC", at, now.pc, ref.pc);
    ref.regs.forEach((v, k) => same(`R${k}`, at, now.regs[k], v));
    if (now.ram)
      ref.ram.forEach((v, k) => same(`the byte at ${hex(0x400 + k)}`, at, now.ram?.[k], v));
    same("the display", at, now.display, ref.display);
    same("the lamps", at, now.lamps, ref.lamps);
    same("the timer", at, now.timer, ref.timer);
    same("waiting", at, now.waiting, ref.waiting);
    compareControl(at, controlRegistersOf(circuit, values), ref.control);
  }
  return { steps: count, differences, edges };
}
