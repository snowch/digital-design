// Copyright © 2026 Christopher Snow

// Module 13: a run of the final machine, recorded edge by edge, for the figures that step through
// it, forwards and back, and open its drawing at any edge. Every net's value is kept after each
// edge, so a level the learner opens shows the values of the same moment as every other level.
//
// The run is compared with the instruction-level model as Module 12's comparison is
// (traps-run.ts), after every step: an instruction that finishes, or an edge that traps. A run
// with a fault in it goes on past the first disagreement, which is kept with its step, so a
// figure can say which instruction first disagreed, and how.

import type { Circuit, Word } from "@dd/sim";

import type { Program } from "./assemble";
import { buildDatapath, machineOf, wordOf } from "./datapath-figure";
import { datapathState, resetDatapath, stopReasonOf } from "./datapath-run";
import { inputsAt, type InputPlan } from "./debugger";
import { applyFaults, type Fault } from "./faults";
import {
  MODULE_12,
  MODULE_13,
  QUIET_INPUTS,
  resetMachine,
  step,
  type CpuState,
  type MachineInputs,
  type StopReason,
} from "./machine";
import { bitOf } from "./multicycle-run";
import { assemble } from "./assemble";
import { romParams } from "./datapath";
import { MODULE_13_ASSEMBLY } from "./machine";
import { word } from "@dd/sim";

/** One step of a run: an instruction from its fetch to the edge that ends it, or a trap. */
export interface RunStep {
  /** The instruction's address. */
  readonly pc: bigint;
  /** The instruction as the program writes it ("" for an address with no line). */
  readonly text: string;
  /** The frame the step starts at, and the frame after its last edge. */
  readonly first: number;
  readonly last: number;
  /** The cause, when the step's last edge traps and goes to the handler. */
  readonly trap?: number;
}

/** Where the circuit and the model first disagree, after a step. */
export interface RunDifference {
  readonly step: number;
  /** What differs: `PC`, `R3`, `C2`, `display`, `lamps`, `timer`, `waiting`, a RAM byte's address (`byte 400`), or `stop`. */
  readonly what: string;
  readonly machine?: bigint;
  readonly model?: bigint;
  /** For `stop`: how each ended the step, where only one stopped, or they stopped differently. */
  readonly machineStop?: StopReason;
  readonly modelStop?: StopReason;
}

export interface RecordedRun {
  readonly circuit: Circuit;
  readonly program: Program;
  /** Every net's value after k edges from reset, frame 0 being the machine just reset. */
  readonly frames: readonly (readonly Word[])[];
  readonly steps: readonly RunStep[];
  /** The frame the machine halted or stopped at, and why. */
  readonly stopped?: { readonly frame: number; readonly reason: StopReason };
  /** The run reached its limit of edges without stopping. */
  readonly cutOff: boolean;
  readonly difference?: RunDifference;
}

export interface RunSetup {
  /** The machine's drawing: Module 13's `machine-final`, or Module 12's `machine-traps`. */
  readonly libraryId: string;
  readonly program: string;
  /** The shop's inputs by name, as the figures give them: SENSORA, SENSORB, DOOR, WARM. */
  readonly inputs?: Readonly<Record<string, string | number>>;
  /** The door opens before this instruction, counted from the first, 0. */
  readonly doorOpensAt?: number;
  readonly fault?: Fault;
}

/** The shop's inputs and the door's plan, from a figure's names for them. */
export function planOf(setup: Pick<RunSetup, "inputs" | "doorOpensAt">): InputPlan {
  const given = setup.inputs ?? {};
  const value = (name: string, width: number) =>
    given[name] === undefined ? undefined : wordOf(String(given[name]), width).value;
  const inputs: MachineInputs = {
    door: Number(value("DOOR", 1) ?? BigInt(QUIET_INPUTS.door)) as 0 | 1,
    warm: Number(value("WARM", 1) ?? BigInt(QUIET_INPUTS.warm)) as 0 | 1,
    sensorA: value("SENSORA", 64) ?? 0n,
    sensorB: value("SENSORB", 64) ?? 0n,
  };
  return setup.doorOpensAt === undefined ? inputs : { ...inputs, doorOpensAt: setup.doorOpensAt };
}

const signed = (v: bigint) => BigInt.asIntN(64, v);

/**
 * C0 to C4 as a circuit holds them, read off the five registers of its control registers' block
 * (`cregs`), wherever it sits: the drawn machine's datapath, or a text's instance of the course's
 * module. A register with an unknown bit is undefined.
 */
export function controlOf(circuit: Circuit, values: readonly Word[]): (bigint | undefined)[] {
  return [0, 1, 2, 3, 4].map((k) => {
    const part = circuit.components.find(
      (c) => c.kind === "memory" && (c.path === `cregs/c${k}` || c.path.endsWith(`/cregs/c${k}`)),
    );
    const net = part?.outputs["Q0"];
    const w = net === undefined ? undefined : values[net];
    return w && w.known === (1n << BigInt(w.width)) - 1n ? w.value : undefined;
  });
}

/** A circuit with its ROM's words replaced by a program's: the same circuit, another program. */
export function withRom(circuit: Circuit, rom: Uint8Array | readonly number[]): Circuit {
  const init = romParams(rom);
  return {
    ...circuit,
    components: circuit.components.map((c) =>
      c.kind === "rom" ? { ...c, params: { ...(c.params ?? {}), init } } : c,
    ),
  };
}

/** The first way the circuit's state differs from the model's, or undefined if none. */
function firstDifference(
  circuit: Circuit,
  values: readonly Word[],
  ref: CpuState,
): Omit<RunDifference, "step"> | undefined {
  const now = datapathState(circuit, values);
  const differ = (a: bigint | number | undefined, b: bigint | number | undefined) =>
    (a === undefined ? undefined : BigInt(a)) !== (b === undefined ? undefined : BigInt(b));
  const out = (what: string, a: bigint | number | undefined, b: bigint | number | undefined) => ({
    what,
    ...(a === undefined ? {} : { machine: BigInt(a) }),
    ...(b === undefined ? {} : { model: BigInt(b) }),
  });
  if (differ(now.pc, ref.pc)) return out("PC", now.pc, ref.pc);
  for (let k = 0; k < 16; k++)
    if (differ(now.regs[k], ref.regs[k]))
      return out(
        `R${k}`,
        now.regs[k] === undefined ? undefined : signed(now.regs[k] as bigint),
        ref.regs[k] === undefined ? undefined : signed(ref.regs[k] as bigint),
      );
  const control = controlOf(circuit, values);
  for (let k = 0; k < 5; k++)
    if (differ(control[k], ref.control[k])) return out(`C${k}`, control[k], ref.control[k]);
  if (differ(now.display, ref.display))
    return out(
      "display",
      now.display === undefined ? undefined : signed(now.display),
      signed(ref.display),
    );
  if (differ(now.lamps, ref.lamps)) return out("lamps", now.lamps, ref.lamps);
  if (differ(now.timer, ref.timer)) return out("timer", now.timer, ref.timer);
  if (differ(now.waiting, ref.waiting)) return out("waiting", now.waiting, ref.waiting);
  if (now.ram)
    for (let k = 0; k < ref.ram.length; k++)
      if (differ(now.ram[k], ref.ram[k]))
        return out(`byte ${(0x400 + k).toString(16).toUpperCase()}`, now.ram[k], ref.ram[k]);
  return undefined;
}

/** Runs a program on Module 12's or Module 13's machine from reset, keeping every edge. */
export function recordRun(setup: RunSetup, limit = 500): RecordedRun {
  const machine = machineOf(setup.libraryId);
  if (!machine?.traps) throw new RangeError(`${setup.libraryId} is not a machine with traps`);
  const options = machine.final ? MODULE_13 : MODULE_12;
  const built = buildDatapath({ libraryId: setup.libraryId, program: setup.program });
  const program = built.program as Program;
  const circuit = setup.fault ? applyFaults(built.circuit, [setup.fault]) : built.circuit;
  const plan = planOf(setup);
  const sim = resetDatapath(circuit, inputsAt(plan, 0));
  const frames: Word[][] = [sim.snapshotValues()];
  const steps: RunStep[] = [];
  let ref: CpuState = resetMachine(program.rom);
  let ran = 0;
  let difference: RunDifference | undefined;
  let stopped: RecordedRun["stopped"];
  const textAt = (pc: bigint) =>
    program.lines.find((l) => BigInt(l.address) === pc && l.instruction !== undefined)?.text ?? "";
  // The door for the next instruction, set before the frame that shows it is kept.
  const door = () => {
    sim.setInput("DOOR", word(1, inputsAt(plan, ran).door));
    sim.settle();
    frames[frames.length - 1] = sim.snapshotValues();
  };
  door();
  while (frames.length - 1 < limit && !stopped) {
    const first = frames.length - 1;
    const pc = datapathState(circuit, sim.snapshotValues()).pc ?? 0n;
    const r = difference ? undefined : step(ref, inputsAt(plan, ran), options);
    // A trap, as the circuit makes it: TRAP is 1 before the step's last edge.
    let trap: number | undefined;
    for (let taken = 0; frames.length - 1 < limit; taken++) {
      const before = datapathState(circuit, sim.snapshotValues());
      if (before.halt === 1) {
        const reason = stopReasonOf(before) as StopReason;
        stopped = { frame: frames.length - 1, reason };
        const model = r?.state.stopped?.reason;
        if (r && !difference && JSON.stringify(model) !== JSON.stringify(reason))
          difference = {
            step: steps.length,
            what: "stop",
            machineStop: reason,
            ...(model ? { modelStop: model } : {}),
          };
        break;
      }
      const ends = bitOf(sim, "PCEN") === 1;
      if (bitOf(sim, "TRAP") === 1) trap = before.cause;
      sim.clockCycle("CLK");
      frames.push(sim.snapshotValues());
      if (ends || taken > 8) break;
    }
    if (stopped) {
      if (frames.length - 1 > first)
        steps.push({ pc, text: textAt(pc), first, last: frames.length - 1 });
      break;
    }
    if (frames.length - 1 === first) break;
    steps.push({
      pc,
      text: textAt(pc),
      first,
      last: frames.length - 1,
      ...(trap !== undefined ? { trap } : {}),
    });
    if (r) {
      if (r.state.stopped && !difference)
        difference = { step: steps.length - 1, what: "stop", modelStop: r.state.stopped.reason };
      ref = r.state;
      const d = difference ? undefined : firstDifference(circuit, sim.snapshotValues(), ref);
      if (d) difference = { step: steps.length - 1, ...d };
    }
    // The door counts the instructions that finished, as the circuit ran them: past the first
    // disagreement the model is left behind.
    if (trap === undefined) ran++;
    door();
  }
  return {
    circuit,
    program,
    frames,
    steps,
    ...(stopped ? { stopped } : {}),
    cutOff: !stopped && frames.length - 1 >= limit,
    ...(difference ? { difference } : {}),
  };
}

/** The step a frame belongs to: the step whose edges lead up to it, or the next to run. */
export function stepAt(run: RecordedRun, frame: number): number {
  const k = run.steps.findIndex((s) => frame >= s.first && frame < s.last);
  return k >= 0 ? k : run.steps.length;
}

/** Where a text of the final machine first disagrees with the model, and how the run ended. */
export interface TextComparison {
  /** The program's line and address of the step that first disagrees, and how. */
  readonly difference?: RunDifference & { readonly line: string; readonly pc: bigint };
  readonly steps: number;
  readonly edges: number;
}

/**
 * Runs a program on a circuit of the final machine whose top level has the drawn machine's ports
 * (a text the lab's learner wrote, or the drawn machine) and on the model with Module 13's
 * options, from reset, and compares them after every step. A step ends at the first edge after
 * which the controller's state, the output S, is FETCH again; where the model stops, the circuit
 * must halt within the same step, for the same reason (cause 00 with HALT is `stop`).
 */
export function compareFinalCircuit(
  circuit: Circuit,
  source: string,
  plan: InputPlan = QUIET_INPUTS,
  limit = 400,
): TextComparison {
  const program = assemble(source, MODULE_13_ASSEMBLY);
  const c = withRom(circuit, program.rom);
  const sim = resetDatapath(c, inputsAt(plan, 0));
  const sNet = c.nets.find((n) => n.name === "S")?.id;
  let ref: CpuState = resetMachine(program.rom);
  let ran = 0;
  let edges = 0;
  const textAt = (pc: bigint) =>
    program.lines.find((l) => BigInt(l.address) === pc && l.instruction !== undefined)?.text ?? "";
  const fail = (step: number, pc: bigint, d: Omit<RunDifference, "step">) => ({
    difference: { step, ...d, line: textAt(pc), pc },
    steps: step + 1,
    edges,
  });
  for (let k = 0; k < limit; k++) {
    sim.setInput("DOOR", word(1, inputsAt(plan, ran).door));
    sim.settle();
    const pc = ref.pc;
    const r = step(ref, inputsAt(plan, ran), MODULE_13);
    for (let taken = 0; ; taken++) {
      const before = datapathState(c, sim.snapshotValues());
      if (before.halt === 1) {
        const reason: StopReason =
          before.cause !== undefined && before.cause !== 0
            ? { kind: "trap", cause: before.cause }
            : { kind: "stop" };
        const model = r.state.stopped?.reason;
        if (JSON.stringify(model) !== JSON.stringify(reason))
          return fail(k, pc, {
            what: "stop",
            machineStop: reason,
            ...(model ? { modelStop: model } : {}),
          });
        return { steps: k + 1, edges };
      }
      if (taken > 8)
        return fail(k, pc, { what: "PC", machine: before.pc ?? 0n, model: r.state.pc });
      sim.clockCycle("CLK");
      edges++;
      const s = sNet === undefined ? undefined : sim.snapshotValues()[sNet];
      if (s && s.known === 7n && s.value === 0n) break;
    }
    if (r.state.stopped) return fail(k, pc, { what: "stop", modelStop: r.state.stopped.reason });
    if (!r.record.trap) ran++;
    ref = r.state;
    const d = firstDifference(c, sim.snapshotValues(), ref);
    if (d) return fail(k, pc, d);
  }
  return { steps: limit, edges };
}
