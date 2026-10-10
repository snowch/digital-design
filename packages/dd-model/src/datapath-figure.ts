// Copyright © 2026 Christopher Snow

// Module 8: the datapath as a lesson's figure starts it, and what one edge does to it. A figure
// names a stage's drawing by its library id and gives a program, the registers' first words, the
// shop's inputs and, where the stage has no ROM, the instruction on the IR bus. The answers a
// prediction is checked against are read off the simulator after a real edge, run on a copy.

import { Simulator, parseWord, word, type Circuit, type Word } from "@dd/sim";

import { assemble, type Program } from "./assemble";
import { type Stage } from "./datapath";
import { datapathState, registersOf, stopReasonOf, type DatapathState } from "./datapath-run";
import { MODULE_13_ASSEMBLY } from "./machine";
import { placedMachine, placedTrapMachine } from "./library-control";
import { edgeView, edgesLeft, registersTaken } from "./multicycle-view";
import { placedDatapath } from "./library-datapath";

/** The stage a library id draws. */
export function stageOf(libraryId: string): Stage | undefined {
  const m = /^datapath-(jobs|constants|fetch|memory|full)$/.exec(libraryId);
  return m ? (m[1] as Stage) : undefined;
}

export interface DatapathSetup {
  readonly libraryId: string;
  /** The program in the ROM, in `docs/isa.md`'s assembly (the fetch stage on). */
  readonly program?: string;
  /** Registers' first words by name, `R3: "-250"`; every other register is unknown. */
  readonly registers?: Readonly<Record<string, string>>;
}

export interface BuiltDatapath {
  readonly circuit: Circuit;
  /** Module 8's stage, or Module 9's machine of several edges an instruction. */
  readonly stage: Stage | "edges";
  readonly program?: Program;
  /** Module 9's capstone: the machine knows the call through a register. */
  readonly callThroughRegister?: boolean;
  /** Module 12: the machine with its trap hardware. */
  readonly traps?: boolean;
}

/** Module 9: the machine of several edges, by library id, and whether it has the capstone's call. */
export function machineOf(
  libraryId: string,
): { callThroughRegister: boolean; traps?: boolean; final?: boolean } | undefined {
  if (libraryId === "machine-edges") return { callThroughRegister: false };
  if (libraryId === "machine-edges-call") return { callThroughRegister: true };
  // Module 12: the machine with its trap hardware.
  if (libraryId === "machine-traps") return { callThroughRegister: false, traps: true };
  // Module 13: the final machine, with the call through a register and set if.
  if (libraryId === "machine-final") return { callThroughRegister: true, traps: true, final: true };
  return undefined;
}

/** A value as a lesson writes it: a decimal number, signed, or what `parseWord` reads. */
export function wordOf(text: string, width: number): Word {
  if (/^-?\d+$/.test(text) && width > 1) {
    const m = 1n << BigInt(width);
    return word(width, ((BigInt(text) % m) + m) % m);
  }
  return parseWord(text, width);
}

function registerWords(given: Readonly<Record<string, string>> = {}): (bigint | undefined)[] {
  return Array.from({ length: 16 }, (_, k) => {
    const v = given[`R${k}`];
    return v === undefined ? undefined : wordOf(v, 64).value;
  });
}

/** The figure's circuit: the library's drawing of the stage, with its program and registers. */
export function buildDatapath(setup: DatapathSetup): BuiltDatapath {
  const machine = machineOf(setup.libraryId);
  if (machine) {
    const assembly = machine.final
      ? MODULE_13_ASSEMBLY
      : machine.callThroughRegister
        ? { callThroughRegister: 9 }
        : {};
    const program = setup.program === undefined ? undefined : assemble(setup.program, assembly);
    if (machine.traps) {
      const circuit = placedTrapMachine({
        name: "machine",
        ...(machine.final ? { final: true } : {}),
        ...(program ? { rom: program.rom } : {}),
        registers: registerWords(setup.registers),
      });
      return { circuit, stage: "edges", ...machine, ...(program ? { program } : {}) };
    }
    const circuit = placedMachine({
      name: "machine",
      ...machine,
      ...(program ? { rom: program.rom } : {}),
      registers: registerWords(setup.registers),
    });
    return { circuit, stage: "edges", ...machine, ...(program ? { program } : {}) };
  }
  const stage = stageOf(setup.libraryId);
  if (!stage) throw new RangeError(`${setup.libraryId} is not a datapath`);
  const program = setup.program === undefined ? undefined : assemble(setup.program);
  const circuit = placedDatapath({
    stage,
    name: "datapath",
    ...(program ? { rom: program.rom } : {}),
    registers: registerWords(setup.registers),
  });
  return { circuit, stage, ...(program ? { program } : {}) };
}

/** One choice of the instruction on the IR bus, with the control signals set by hand beside it. */
export interface GivenInstruction {
  /** The instruction as a line of assembly, or its eight hexadecimal digits after `0x`. */
  readonly text: string;
  readonly set?: Readonly<Record<string, string | number>>;
}

/** An instruction's word: assembled, or read as written. */
export function instructionWord(text: string): number {
  if (/^0x[0-9a-f]{8}$/i.test(text)) return Number.parseInt(text.slice(2), 16);
  const p = assemble(text);
  const l = p.lines.find((x) => x.instruction !== undefined);
  if (l?.instruction === undefined) throw new RangeError(`no instruction in ${text}`);
  return l.instruction;
}

function setInputs(
  sim: Simulator,
  circuit: Circuit,
  values: Readonly<Record<string, string | number>>,
) {
  for (const [name, v] of Object.entries(values)) {
    const input = circuit.inputs.find((i) => i.name === name);
    if (!input) continue;
    sim.setInput(name, wordOf(String(v), circuit.nets[input.net]?.width ?? 1));
  }
}

/** Puts an instruction on the IR bus, with its control signals, and settles. */
export function giveInstruction(sim: Simulator, circuit: Circuit, given: GivenInstruction): void {
  sim.setInput("IR", word(32, instructionWord(given.text)));
  setInputs(sim, circuit, given.set ?? {});
  sim.settle();
}

/**
 * A simulator for the figure as it first shows: every input 0 but those given; from the fetch
 * stage on, reset (one edge with RST at 1) and then `edges` edges run; before the fetch stage,
 * the first instruction given on the IR bus.
 */
export function startDatapath(
  built: BuiltDatapath,
  options: {
    readonly inputs?: Readonly<Record<string, string | number>>;
    readonly instruction?: GivenInstruction;
    readonly edges?: number;
  } = {},
): Simulator {
  const { circuit } = built;
  const sim = new Simulator(circuit);
  for (const input of circuit.inputs)
    sim.setInput(input.net, word(circuit.nets[input.net]?.width ?? 1, 0));
  setInputs(sim, circuit, options.inputs ?? {});
  const has = (name: string) => circuit.inputs.some((i) => i.name === name);
  if (has("RST")) {
    sim.setInput("RST", word(1, 1));
    sim.settle();
    sim.clockCycle("CLK");
    sim.setInput("RST", word(1, 0));
  }
  sim.settle();
  if (options.instruction && has("IR")) giveInstruction(sim, circuit, options.instruction);
  for (let k = 0; k < (options.edges ?? 0); k++) sim.clockCycle("CLK");
  return sim;
}

/** What a prediction asks about the next edge. */
export type EdgeQuestion = "changed" | "pc" | "stop" | "value" | "edges" | "took" | "state";

const signed64 = (v: bigint) => (v >= 1n << 63n ? v - (1n << 64n) : v);

/**
 * What the next edge does, read off a copy of the simulator after the edge: the registers it
 * writes (`R3`, or `none`); the PC after it, three hexadecimal digits; whether it stops the
 * machine (`go`, `stop`, `later` or the cause in hexadecimal); or one register's word after it,
 * read signed.
 */
export function edgeAnswer(sim: Simulator, ask: EdgeQuestion, register = 0): string {
  const circuit = sim.circuit;
  // Module 9: how many edges the instruction has left, and which registers the next edge writes.
  if (ask === "edges") return String(edgesLeft(sim));
  if (ask === "took") return registersTaken(sim);
  const before = datapathState(circuit, sim.snapshotValues());
  const saved = sim.snapshot();
  sim.clockCycle("CLK");
  const values = sim.snapshotValues();
  sim.restore(saved);
  sim.settle();
  const after = registersOf(circuit, values);
  switch (ask) {
    case "changed": {
      const written = after.flatMap((v, k) => (v !== before.regs[k] ? [`R${k}`] : []));
      return written.length ? written.join(", ") : "none";
    }
    case "pc": {
      const pc = datapathState(circuit, values).pc;
      return pc === undefined ? "X" : pc.toString(16).toUpperCase().padStart(3, "0");
    }
    case "stop": {
      const reason = stopReasonOf(before);
      if (!reason) return "go";
      return reason.kind === "trap" ? reason.cause.toString(16).toUpperCase() : reason.kind;
    }
    case "state":
      // Module 12: the controller's state after the next edge, by its name.
      return edgeView(circuit, values).state ?? "X";
    case "value": {
      const v = after[register];
      return v === undefined ? "X" : signed64(v).toString();
    }
  }
}

/** The state a figure shows now, read off the simulator. */
export function figureState(sim: Simulator): DatapathState {
  return datapathState(sim.circuit, sim.snapshotValues());
}
