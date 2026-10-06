// Copyright © 2026 Christopher Snow

// Module 6: memories as components with behaviour.
//
// A memory of a few words is drawn and simulated as gates (dd-model's `ram`); a larger one would
// be thousands of flip-flops recomputed at every settle step. These two primitives behave as those
// gates do and are one evaluation each.
//
// Neither keeps state of its own, so the engine's rules hold unchanged: every primitive is a pure
// function of its input words. A `memory`'s contents are a net, `state`, which the primitive reads
// and drives (a loop, as a flip-flop's latches are a loop), and the clock's level at the last step
// is a second net, `last`, so the primitive sees a rising edge as a flip-flop does: the clock 1
// now and 0 before. So snapshots, the trace, a replay and every view read a memory's words as they
// read any other net.
//
// The state net holds the words, word k in bits k×width up to (k+1)×width−1, and one bit above
// them that says the memory has been filled. It starts unknown, as every net does. At the first
// step the primitive fills it: with the list of values in `init`, or with X, as a flip-flop that
// no edge has set is X. A memory never written and filled from a list is a ROM; `rom` is that
// without the loop.
//
// Ports. Inputs: CLK, WE (write enable), WA (the write address), D (the word to write), R0 to
// R(n−1) (one address per read), and the loop's `state` and `last`. Outputs: Q0 to Q(n−1) (the
// word at each read address, with no clock: a read follows its address as gates would), and
// `stateNext` and `lastNext`, wired back to `state` and `last`.
//
// Unknowns are honest. A write at an edge whose address has unknown bits, or whose WE is unknown,
// leaves every word it might have reached unknown where its bits and D's differ. A read address
// with unknown bits gives the bits all the words it might name agree on. An address past the last
// word reaches no word: a write there changes nothing and a read there is X, since no word answers.
// A memory whose address has more bits than its words need is a lesson's choice to show that.

import type { Primitive } from "./primitives";
import { mask, unknown, word, type Word } from "./values";

export interface MemoryShape {
  readonly words: number;
  readonly width: number;
  readonly reads: number;
  /**
   * The words a memory is filled with, lowest address first, or none: it starts unknown. Module 8:
   * a word given as `x` in the list starts unknown, as a register nothing has set.
   */
  readonly init?: readonly (bigint | undefined)[];
}

/** A memory's shape from a component's params. */
export function memoryShape(params?: Readonly<Record<string, unknown>>): MemoryShape {
  const words = Number(params?.["words"] ?? 1);
  const width = Number(params?.["width"] ?? 1);
  const reads = Number(params?.["reads"] ?? 1);
  const text = params?.["init"];
  const init =
    typeof text === "string" && text.trim()
      ? text
          .trim()
          .split(/[\s,]+/)
          .map((t) => (t.toLowerCase() === "x" ? undefined : BigInt(`0x${t}`)))
      : undefined;
  return { words, width, reads, ...(init ? { init } : {}) };
}

/** The list of values a lesson gives, as the `init` param stores it: hexadecimal, one per word. */
export function initParam(values: readonly (bigint | number | undefined)[]): string {
  return values.map((v) => (v === undefined ? "x" : BigInt(v).toString(16))).join(" ");
}

/** The width of a memory's state net: its words and the filled bit. */
export function stateWidth(shape: Pick<MemoryShape, "words" | "width">): number {
  return shape.words * shape.width + 1;
}

/** Word `k` of a state net (or of any word of words), as its own word. */
export function wordOf(state: Word, k: number, width: number): Word {
  const m = mask(width);
  const s = BigInt(k * width);
  return { width, value: (state.value >> s) & m, known: (state.known >> s) & m };
}

/** Every word of a memory's state, lowest address first. */
export function memoryWords(state: Word, words: number, width: number): Word[] {
  return Array.from({ length: words }, (_, k) => wordOf(state, k, width));
}

/** Whether the state net says the memory has been filled. */
function filled(state: Word, shape: MemoryShape): boolean {
  const flag = BigInt(shape.words * shape.width);
  return ((state.known >> flag) & 1n) === 1n && ((state.value >> flag) & 1n) === 1n;
}

/** The words a memory starts with: its list of values, or unknown. */
function initial(shape: MemoryShape): Word[] {
  return Array.from({ length: shape.words }, (_, k) => {
    const v = shape.init?.[k];
    if (v !== undefined) return word(shape.width, v);
    // Past the end of a list, a word is 0; a word the list gives as `x`, or a memory with no
    // list, starts unknown.
    return shape.init && k >= shape.init.length ? word(shape.width, 0) : unknown(shape.width);
  });
}

function pack(words: readonly Word[], width: number): Word {
  let value = 0n;
  let known = 0n;
  words.forEach((w, k) => {
    const s = BigInt(k * width);
    value |= w.value << s;
    known |= w.known << s;
  });
  const flag = BigInt(words.length * width);
  return {
    width: words.length * width + 1,
    value: value | (1n << flag),
    known: known | (1n << flag),
  };
}

/** The bits two words agree on; X where they differ or either is unknown. */
function merge(a: Word, b: Word): Word {
  const agree = ~(a.value ^ b.value) & a.known & b.known & mask(a.width);
  return { width: a.width, value: a.value & agree, known: agree };
}

/** The word indices an address might name: one when it is known, every match of its known bits otherwise. */
function candidates(address: Word, words: number): number[] {
  const full = mask(address.width);
  if (address.known === full) return address.value < BigInt(words) ? [Number(address.value)] : [];
  const out: number[] = [];
  for (let k = 0; k < words; k++) {
    if ((BigInt(k) & address.known) === (address.value & address.known) && BigInt(k) <= full)
      out.push(k);
  }
  return out;
}

/** The word a read address gives: the one it names, what its candidates agree on, or X. */
function readAt(words: readonly Word[], address: Word | undefined, width: number): Word {
  if (!address) return unknown(width);
  const ks = candidates(address, words.length);
  const first = ks[0];
  if (first === undefined) return unknown(width);
  // An address with unknown bits that could also name a word past the end has no answer there.
  const full = mask(address.width);
  if (address.known !== full && BigInt(words.length) <= (address.value | (full & ~address.known)))
    return unknown(width);
  return ks.slice(1).reduce((acc, k) => merge(acc, words[k] as Word), words[first] as Word);
}

const isOne = (w: Word | undefined) => w !== undefined && w.known === 1n && w.value === 1n;
const isZero = (w: Word | undefined) => w !== undefined && w.known === 1n && w.value === 0n;

function readPorts(reads: number): string[] {
  return Array.from({ length: reads }, (_, i) => `R${i}`);
}

export const MEMORY: Primitive = {
  kind: "memory",
  inputs: ["CLK", "WE", "WA", "D", "R0", "state", "last"],
  outputs: ["Q0", "stateNext", "lastNext"],
  describe:
    "Words kept by address: at a rising edge of CLK where WE is 1, D is written to the word WA names; each Q shows the word its R names.",
  evaluate(inputs, params) {
    const shape = memoryShape(params);
    const state = inputs["state"] ?? unknown(stateWidth(shape));
    let words = filled(state, shape)
      ? memoryWords(state, shape.words, shape.width)
      : initial(shape);
    const out: Record<string, Word> = {};
    for (const [i, port] of readPorts(shape.reads).entries())
      out[`Q${i}`] = readAt(words, inputs[port], shape.width);
    const clk = inputs["CLK"];
    const last = inputs["last"];
    const we = inputs["WE"];
    // A rising edge: the clock 1 now and 0 at the last step. Where either is unknown, an edge
    // may have happened, and the words it might have written are left unknown where they differ.
    const edge = isOne(clk) && isZero(last);
    const maybe = !edge && clk !== undefined && !isZero(clk) && !isOne(last);
    if ((edge || maybe) && we && !isZero(we)) {
      const address = inputs["WA"] ?? unknown(1);
      const d = inputs["D"] ?? unknown(shape.width);
      const ks = candidates(address, shape.words);
      const sure = edge && isOne(we) && ks.length === 1 && address.known === mask(address.width);
      words = words.map((w, k) => (ks.includes(k) ? (sure ? d : merge(w, d)) : w));
    }
    out["stateNext"] = pack(words, shape.width);
    out["lastNext"] = clk ?? unknown(1);
    return out;
  },
};

export const ROM: Primitive = {
  kind: "rom",
  inputs: ["R0"],
  outputs: ["Q0"],
  describe:
    "Words fixed when it is made, from a list of values: each Q shows the word its R names.",
  evaluate(inputs, params) {
    const shape = memoryShape(params);
    const words = initial(shape);
    const out: Record<string, Word> = {};
    for (const [i, port] of readPorts(shape.reads).entries())
      out[`Q${i}`] = readAt(words, inputs[port], shape.width);
    return out;
  },
};
