// Copyright © 2026 Christopher Snow

// The parts a learner can place: gates, the pins of the circuit's interface, and the composites
// of the course's library, each with its ports in drawing order.
//
// A part's ports are what the drawing editor shows and what the netlist compiler wires. Gate
// ports follow the simulator's naming (a, b, ... in; y out); a composite's ports are the ones
// its library circuit exposes.

import { BLOCKS, LIBRARY, libraryCircuit } from "@dd/dd-model";
import { PRIMITIVES } from "@dd/sim";

export interface PartSpec {
  /** The id a palette and a drawing use: a primitive kind, a library id, `input` or `output`. */
  readonly id: string;
  /** The label on the symbol. */
  readonly label: string;
  readonly inputs: readonly string[];
  readonly outputs: readonly string[];
  /** A gate the simulator evaluates, a pin of the interface, or a library composite. */
  readonly role: "gate" | "pin" | "composite";
  /** What the part does, in a sentence. */
  readonly describe: string;
}

const GATE_LABELS: Readonly<Record<string, string>> = {
  not: "NOT",
  buf: "BUF",
  and: "AND",
  or: "OR",
  nand: "NAND",
  nor: "NOR",
  xor: "XOR",
  xnor: "XNOR",
  mux2: "MUX",
  const: "CONST",
  // A cut wire, drawn only where a fault put it: what the cut wire's readers now see.
  open: "CUT",
};

const COMPOSITE_LABELS: Readonly<Record<string, string>> = {
  "two-buttons": "Two buttons",
  "sr-latch": "SR latch",
  "gated-sr-latch": "Gated SR latch",
  "d-latch": "D latch",
  dff: "D flip-flop",
  "dff-reset": "D flip-flop with reset",
  "dff-reset-enable": "D flip-flop with reset and enable",
  "register-4": "4-bit register",
  // The registers lesson's circuits, named in the trail above their drawings, and a register
  // block of any width.
  "four-flip-flops": "Four flip-flops",
  "keep-bit": "One bit with a load enable",
  "keep-clear-bit": "One bit with a load enable and a reset",
  "gated-clock-bit": "Flip-flop clocked through an AND gate",
  register: "register",
  // Module 3: the combinational blocks a drawing may place, and the circuits named in the trail
  // above their drawings. Drafted by the prose process (docs/notes/module-3-combinational.md).
  "selector-2": "2-way selector",
  "selector-4": "4-way selector",
  "decoder-2": "decoder",
  "demux-4": "demultiplexer",
  "encoder-4": "encoder",
  comparator: "comparator",
  "half-adder": "half adder",
  "full-adder": "full adder",
  adder: "adder",
  alu: "ALU",
  addsub: "add/sub",
  "alu-slice": "ALU-slice",
  "addsub-slice": "add/sub",
  slice: "slice",
  "split-4": "split",
  "join-4": "join",
  "selector-word": "word selector",
  "demux-block": "demultiplexer",
  "columns-alone": "half adder columns",
  "full-adder-parts": "full adder internals",
  "addsub-4": "4-bit add/subtract",
  // Module 5: parts and the circuits named in the trail above their drawings. Drafted by the
  // prose process (brief V, docs/notes/module-5-state-machines/briefs/V.md).
  "register-4-reset-enable": "4-bit register",
  "add-one": "add one",
  "next-state-logic": "next-state logic",
  "output-logic": "output logic",
  "split-2": "split",
  "split-3": "split",
  "join-2": "join",
  "join-3": "join",
  "counter-4": "4-bit count",
  "counter-to-5": "Counter to 5",
  "add-one-4": "Add one",
  "now-prev": "NOW and PREV",
  "now-prev-once": "Save once per press",
  swap: "Swap values",
  retry: "Retry controller",
  "retry-try-zero": "Retry controller with TRY at 00",
  "retry-one-hot": "Retry controller, one flip-flop per state",
  "retry-zero-idle": "Retry controller, one flip-flop per state, IDLE at 000",
  "retry-late-ok": "Retry controller with late OK",
  defrost: "Defrost controller",
  // Module 6: the memory lessons' blocks. Drafted by the prose process
  // (docs/notes/module-6-memory.md).
  "word-selector-2": "word selector",
  "word-selector-4": "word selector",
  ram: "RAM",
  "register-file": "register file",
  memory: "memory",
  rom: "ROM",
  "word-register-16": "register",
  "word-selector-16": "word selector",
  "split-address": "split",
  "split-bytes": "split",
  "join-bytes": "join",
  "byte-memory": "memory of bytes",
  "byte-rom": "ROM of bytes",
  "table-rom": "ROM",
  "shop-memory": "shop memory",
  // Module 6's circuits, named in the trail above their drawings.
  "ram-block": "Four-word RAM",
  "ram-wide": "RAM with three-bit address",
  "memory-16": "Memory of 16 words",
  "regfile-block": "Four-word register file",
  "byte-memory-block": "Memory of 16 bytes",
  "shop-memory-block": "The shop's memory",
  // Module 7: the ALU's blocks and circuits.
  alu8: "ALU",
  "alu8-slice": "slice",
  "alu-flag-slice": "slice",
  "alu-group-4": "4-bit group",
  "alu-group-16": "16-bit group",
  "word-piece": "bits",
  "word-join": "join",
  "top-bit": "top bit",
  "alu8-4": "4-bit ALU",
  "alu8-flags-4": "4-bit ALU",
  "alu8-flags-64": "64-bit ALU",
  "operand-carry": "second word and carry in",
};

const COMPOSITE_DESCRIPTIONS: Readonly<Record<string, string>> = {
  "two-buttons": "It remembers which of two buttons was pressed last; A lights it, B puts it out.",
  "sr-latch":
    "Two cross-coupled NOR gates. S=1 sets Q to 1, R=1 resets it to 0, both 0 holds, both 1 is not allowed.",
  "gated-sr-latch": "An SR latch whose S and R reach it only while EN is 1.",
  "d-latch": "Copies D to Q while EN is 1, holds Q while EN is 0.",
  dff: "Copies D to Q at the rising edge of CLK and holds Q at every other time.",
  "dff-reset": "A D flip-flop whose Q becomes 0 at an edge where RST is 1.",
  "dff-reset-enable":
    "A D flip-flop with a reset and an enable. At an edge where EN is 0, Q holds.",
  "register-4": "Four D flip-flops sharing one clock, holding a 4-bit value.",
  // Module 3. Drafted by the prose process.
  "selector-2": "Y is A while S is 0 and B while S is 1.",
  "selector-4": "Y is A, B, C or D: the one whose number S1 S0 spells (00 is A, 11 is D).",
  "half-adder": "Adds A and B: SUM is the total's low bit, CARRY its high bit.",
  "full-adder": "Adds A, B and CIN: SUM is the total's low bit, COUT its high bit.",
  "split-4": "Splits the 4-bit word W into its bits b3 (top) to b0.",
  "join-4": "Joins the bits b3 (top) to b0 into the 4-bit word W.",
  // Module 5. Drafted by the prose process (brief V).
  "register-4-reset-enable":
    "Four D flip-flops sharing one clock; at an edge where RST is 1, Q becomes 0000; otherwise where EN is 1, Q takes D.",
  // Module 6. Drafted by the prose process.
  register: "Copies D to Q at a rising edge of CLK while EN is 1; keeps its word while EN is 0.",
  "word-selector-2": "Y is the word on A while S is 0 and the word on B while S is 1.",
  ram: "The word at the address A1 A0 takes D at a rising edge where WE is 1; Q is always the word at that address.",
  "word-register-16":
    "Copies D to Q at a rising edge of CLK while EN is 1; keeps its word while EN is 0.",
  "word-selector-16": "Y is the word on A, B, C or D, the one S1 S0 names (00 is A, 11 is D).",
  "byte-memory":
    "A names a byte; WORD 1 reads or writes 16 bits at an even address, WORD 0 one byte; ODD is 1 for a word at an odd address, which is refused.",
  "table-rom":
    "Eight 16-bit words fixed when made; read with A and WORD as the byte memory is; never written.",
};

const GATE_INPUTS: Readonly<Record<string, readonly string[]>> = {
  not: ["a"],
  buf: ["a"],
  mux2: ["sel", "a", "b"],
  const: [],
  open: [],
};

/** The spec of a part by id, or undefined if the id names nothing placeable. */
export function partSpec(id: string, fanIn = 2): PartSpec | undefined {
  if (id === "input") {
    return {
      id,
      label: "in",
      inputs: [],
      outputs: ["y"],
      role: "pin",
      describe: "A pin that is an input of the circuit.",
    };
  }
  if (id === "output") {
    return {
      id,
      label: "out",
      inputs: ["a"],
      outputs: [],
      role: "pin",
      describe: "A pin that is an output of the circuit.",
    };
  }
  const primitive = PRIMITIVES[id];
  if (primitive && GATE_LABELS[id]) {
    const inputs =
      GATE_INPUTS[id] ?? Array.from({ length: fanIn }, (_, i) => String.fromCharCode(97 + i));
    return {
      id,
      label: GATE_LABELS[id] ?? id.toUpperCase(),
      inputs,
      outputs: ["y"],
      role: "gate",
      describe: primitive.describe,
    };
  }
  const block = BLOCKS[id];
  if (block) {
    return {
      id,
      label: COMPOSITE_LABELS[id] ?? id,
      inputs: block.inputs,
      outputs: block.outputs,
      role: "composite",
      describe: COMPOSITE_DESCRIPTIONS[id] ?? "",
    };
  }
  if (LIBRARY[id]) {
    const circuit = libraryCircuit(id);
    return {
      id,
      label: COMPOSITE_LABELS[id] ?? id,
      inputs: circuit.inputs.map((p) => p.name),
      outputs: circuit.outputs.map((p) => p.name),
      role: "composite",
      describe: COMPOSITE_DESCRIPTIONS[id] ?? `The library's ${id}.`,
    };
  }
  return undefined;
}

/** Gates that take any number of inputs, so the editor may offer a third. */
export function isVariadic(id: string): boolean {
  return PRIMITIVES[id]?.inputs === "variadic";
}

export const GATE_IDS: readonly string[] = [
  "not",
  "and",
  "or",
  "nand",
  "nor",
  "xor",
  "xnor",
  "buf",
  "mux2",
];

/** The label a part kind is drawn with: the gate's name in capitals, a block's full name. */
export function labelFor(kind: string): string {
  return GATE_LABELS[kind] ?? COMPOSITE_LABELS[kind] ?? kind;
}

/**
 * Whether an instance name says no more than the kind does (`dff` on a D flip-flop, `d-latch`
 * on a D latch), so the drawing leaves it out. `norDark`, `not1` and `master` are kept.
 */
export function nameRepeatsKind(name: string, kind: string): boolean {
  const plain = (t: string) => t.replace(/[^a-z0-9]/gi, "").toLowerCase();
  // The library's default instance names that only shorten their kind: `reg` on a register.
  const SHORT: Readonly<Record<string, string>> = { reg: "register" };
  return plain(name) === plain(kind) || SHORT[plain(name)] === plain(kind);
}
