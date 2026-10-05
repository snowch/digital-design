// The primitives the simulator evaluates.
//
// Every primitive is a pure function from its input words to its output words: no state, no
// time. Memory in this engine is feedback between gates, which is the course's point; a component
// with state of its own (a memory array, in Prompt B) will be a second kind of primitive with an
// `update` on the clock, and the Simulator leaves room for it.

import { MEMORY, ROM } from "./memory";
import { andAll, concat, mux, not, orAll, slice, unknown, word, xorAll, type Word } from "./values";

export interface Primitive {
  readonly kind: string;
  /** Input port names, or "variadic" for a, b, c, ... */
  readonly inputs: readonly string[] | "variadic";
  readonly outputs: readonly string[];
  evaluate(
    inputs: Readonly<Record<string, Word>>,
    params?: Readonly<Record<string, unknown>>,
  ): Record<string, Word>;
  /** What the gate does, in a sentence, for a view's label or an explanation. */
  readonly describe: string;
}

function variadic(inputs: Readonly<Record<string, Word>>): Word[] {
  // Ports are a, b, c, ... then in26, in27; sort so the order is stable whatever the object order.
  return Object.keys(inputs)
    .sort((p, q) => portIndex(p) - portIndex(q))
    .map((k) => inputs[k] as Word);
}

function portIndex(port: string): number {
  if (port.length === 1) return port.charCodeAt(0) - 97;
  if (port.startsWith("in")) return Number(port.slice(2));
  return 1000;
}

const gate = (kind: string, describe: string, f: (inputs: Word[]) => Word): Primitive => ({
  kind,
  inputs: "variadic",
  outputs: ["y"],
  describe,
  evaluate: (inputs) => ({ y: f(variadic(inputs)) }),
});

export const PRIMITIVES: Readonly<Record<string, Primitive>> = {
  not: {
    kind: "not",
    inputs: ["a"],
    outputs: ["y"],
    describe: "The output is the opposite of the input.",
    evaluate: (inputs) => ({ y: not(inputs["a"] as Word) }),
  },
  buf: {
    kind: "buf",
    inputs: ["a"],
    outputs: ["y"],
    describe: "The output copies the input, after the gate's delay.",
    evaluate: (inputs) => ({ y: inputs["a"] as Word }),
  },
  and: gate("and", "The output is 1 only when every input is 1.", andAll),
  or: gate("or", "The output is 1 when any input is 1.", orAll),
  xor: gate("xor", "The output is 1 when an odd number of inputs are 1.", xorAll),
  nand: gate("nand", "The output is 0 only when every input is 1.", (i) => not(andAll(i))),
  nor: gate("nor", "The output is 1 only when every input is 0.", (i) => not(orAll(i))),
  xnor: gate("xnor", "The output is 1 when an even number of inputs are 1.", (i) => not(xorAll(i))),
  mux2: {
    kind: "mux2",
    inputs: ["sel", "a", "b"],
    outputs: ["y"],
    describe: "The output is b when sel is 1 and a when sel is 0.",
    evaluate: (inputs) => ({
      y: mux(inputs["sel"] as Word, inputs["a"] as Word, inputs["b"] as Word),
    }),
  },
  const: {
    kind: "const",
    inputs: [],
    outputs: ["y"],
    describe: "A fixed value.",
    evaluate: (_inputs, params) => {
      const width = Number(params?.["width"] ?? 1);
      const value = BigInt(String(params?.["value"] ?? "0"));
      return { y: word(width, value) };
    },
  },
  open: {
    kind: "open",
    inputs: [],
    outputs: ["y"],
    describe: "A cut wire: nothing drives it, so whoever reads it sees an unknown value.",
    evaluate: (_inputs, params) => ({ y: unknown(Number(params?.["width"] ?? 1)) }),
  },
  bit: {
    kind: "bit",
    inputs: ["a"],
    outputs: ["y"],
    describe: "One bit of a wider word, by index, least significant bit first.",
    evaluate: (inputs, params) => {
      const index = Number(params?.["index"] ?? 0);
      return { y: slice(inputs["a"] as Word, index, index) };
    },
  },
  slice: {
    kind: "slice",
    inputs: ["a"],
    outputs: ["y"],
    describe: "A run of bits of a wider word, from bit hi down to bit lo.",
    evaluate: (inputs, params) => {
      const hi = Number(params?.["hi"] ?? 0);
      const lo = Number(params?.["lo"] ?? 0);
      return { y: slice(inputs["a"] as Word, hi, lo) };
    },
  },
  join: {
    kind: "join",
    inputs: "variadic",
    outputs: ["y"],
    describe: "Bits joined into one word: port a is the least significant bit.",
    evaluate: (inputs) => {
      const bits = variadic(inputs);
      let w = bits[0] as Word;
      for (let i = 1; i < bits.length; i++) w = concat(bits[i] as Word, w);
      return { y: w };
    },
  },
  // Module 6: memories as components with behaviour (memory.ts says why and how).
  memory: MEMORY,
  rom: ROM,
};

export function primitive(kind: string): Primitive {
  const p = PRIMITIVES[kind];
  if (!p) throw new Error(`the simulator has no primitive called ${JSON.stringify(kind)}`);
  return p;
}
