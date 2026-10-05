// The parts a learner can place: gates, the pins of the circuit's interface, and the composites
// of the course's library, each with its ports in drawing order.
//
// A part's ports are what the drawing editor shows and what the netlist compiler wires. Gate
// ports follow the simulator's naming (a, b, ... in; y out); a composite's ports are the ones
// its library circuit exposes.

import { LIBRARY, libraryCircuit } from "@dd/dd-model";
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
  return plain(name) === plain(kind);
}
