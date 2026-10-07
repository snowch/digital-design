// Copyright © 2026 Christopher Snow

// Module 10, lesson 2: the layout as a design. Three things a figure shows about one word:
//
// - what the course's machine makes of it, read by the reference's own field split and its own
//   check for an illegal instruction (machine.ts), as a meaning a view turns into words;
// - the same instruction in a packed layout, the course's own comparison: a kind that leaves a
//   register digit unused gives that digit to the constant, so its constant is longer, and a
//   field that stood between them moves;
// - the calculator: two words and a job through Module 7's ALU from the library, at 16 or 64
//   bits, simulated, with its four flags.

import { Simulator, word as wordOf, type Word } from "@dd/sim";

import { libraryCircuit } from "./library";
import { MODULE_9, fieldsOf, isIllegal, type MachineOptions } from "./machine";

/** What the machine makes of a word: an instruction of some form, or an illegal word and why. */
export type Meaning =
  | {
      readonly form: "register";
      readonly y: number;
      readonly a: number;
      readonly b: number;
      readonly job: number;
    }
  | {
      readonly form: "constant";
      readonly y: number;
      readonly a: number;
      readonly c: number;
      readonly job: number;
    }
  | {
      readonly form: "load";
      readonly y: number;
      readonly a?: number;
      readonly c: number;
      readonly byte: boolean;
    }
  | {
      readonly form: "store";
      readonly b: number;
      readonly a?: number;
      readonly c: number;
      readonly byte: boolean;
    }
  | {
      readonly form: "branch";
      readonly a: number;
      readonly b: number;
      readonly cond: number;
      readonly c: number;
    }
  | { readonly form: "call"; readonly y: number; readonly c: number }
  | { readonly form: "jump"; readonly a: number; readonly c: number }
  | {
      readonly form: "system";
      readonly job: number;
      readonly a: number;
      readonly y: number;
      readonly c: number;
    }
  | {
      readonly form: "setIf";
      readonly y: number;
      readonly a: number;
      readonly b: number;
      readonly cond: number;
    }
  | { readonly form: "callRegister"; readonly y: number; readonly a: number; readonly c: number }
  | { readonly form: "illegal"; readonly why: "kind" | "job" | "number" };

/** What Module 9's machine, or a learner's copy with the options given, makes of a word. */
export function meaningOf(instruction: number, options: MachineOptions = MODULE_9): Meaning {
  const f = fieldsOf(instruction);
  const opts = { ...MODULE_9, ...options };
  if (isIllegal(f, opts)) {
    const known = (f.k >= 1 && f.k <= 8) || f.k === opts.callThroughRegister || f.k === opts.setIf;
    if (!known) return { form: "illegal", why: "kind" };
    if (f.k === 8 && (f.j === 2 || f.j === 3)) return { form: "illegal", why: "number" };
    return { form: "illegal", why: "job" };
  }
  if (f.k === opts.callThroughRegister) return { form: "callRegister", y: f.y, a: f.a, c: f.c };
  if (f.k === opts.setIf) return { form: "setIf", y: f.y, a: f.a, b: f.b, cond: f.j };
  const absolute = (f.j & 8) !== 0;
  switch (f.k) {
    case 1:
      return { form: "register", y: f.y, a: f.a, b: f.b, job: f.j };
    case 2:
      return { form: "constant", y: f.y, a: f.a, c: f.c, job: f.j };
    case 3:
      return {
        form: "load",
        y: f.y,
        c: f.c,
        byte: (f.j & 1) === 1,
        ...(absolute ? {} : { a: f.a }),
      };
    case 4:
      return {
        form: "store",
        b: f.b,
        c: f.c,
        byte: (f.j & 1) === 1,
        ...(absolute ? {} : { a: f.a }),
      };
    case 5:
      return { form: "branch", a: f.a, b: f.b, cond: f.j, c: f.c };
    case 6:
      return { form: "call", y: f.y, c: f.c };
    case 7:
      return { form: "jump", a: f.a, c: f.c };
    default:
      return { form: "system", job: f.j, a: f.a, y: f.y, c: f.c };
  }
}

// ---- The packed layout ----------------------------------------------------------------------

/** A field of a layout: its name and the digits it takes, 7 the leftmost, `hi` to `lo`. */
export interface LayoutField {
  readonly name: "K" | "J" | "A" | "B" | "Y" | "C" | "-";
  readonly hi: number;
  readonly lo: number;
}

export interface Layout {
  readonly fields: readonly LayoutField[];
  /** The instruction's word in this layout. */
  readonly word: number;
  /** The constant's width in bits, and the numbers it holds read signed. */
  readonly constantBits: number;
  readonly min: number;
  readonly max: number;
  /** The fields that sit in other digits than in the course's layout. */
  readonly moved: readonly LayoutField["name"][];
}

const COURSE: readonly LayoutField[] = [
  { name: "K", hi: 7, lo: 7 },
  { name: "J", hi: 6, lo: 6 },
  { name: "A", hi: 5, lo: 5 },
  { name: "B", hi: 4, lo: 4 },
  { name: "Y", hi: 3, lo: 3 },
  { name: "C", hi: 2, lo: 0 },
];

/**
 * The packed layout's fields for each kind: the digits a kind leaves unused join its constant,
 * and the fields keep their order, K J, then the registers it reads, then the one it writes. Kinds
 * 1 and 8 use every digit or keep the course's layout.
 */
const PACKED: Readonly<Record<number, readonly LayoutField[]>> = {
  2: [
    { name: "K", hi: 7, lo: 7 },
    { name: "J", hi: 6, lo: 6 },
    { name: "A", hi: 5, lo: 5 },
    { name: "Y", hi: 4, lo: 4 },
    { name: "C", hi: 3, lo: 0 },
  ],
  4: [
    { name: "K", hi: 7, lo: 7 },
    { name: "J", hi: 6, lo: 6 },
    { name: "A", hi: 5, lo: 5 },
    { name: "B", hi: 4, lo: 4 },
    { name: "C", hi: 3, lo: 0 },
  ],
  6: [
    { name: "K", hi: 7, lo: 7 },
    { name: "J", hi: 6, lo: 6 },
    { name: "Y", hi: 5, lo: 5 },
    { name: "C", hi: 4, lo: 0 },
  ],
  7: [
    { name: "K", hi: 7, lo: 7 },
    { name: "J", hi: 6, lo: 6 },
    { name: "A", hi: 5, lo: 5 },
    { name: "C", hi: 4, lo: 0 },
  ],
};
const PACKED_OF: Readonly<Record<number, number>> = { 2: 2, 3: 2, 4: 4, 5: 4, 6: 6, 7: 7 };

/** The course's layout, which every kind shares. */
export function courseLayout(instruction: number): Layout {
  return {
    fields: COURSE,
    word: instruction >>> 0,
    constantBits: 12,
    min: -2048,
    max: 2047,
    moved: [],
  };
}

/**
 * The same instruction in the packed layout: its fields' values put in the digits its kind's
 * packed layout gives them, the constant read signed and written at its new width.
 */
export function packedLayout(instruction: number): Layout {
  const f = fieldsOf(instruction);
  const fields = PACKED[PACKED_OF[f.k] ?? 0] ?? COURSE;
  const values: Record<string, number> = { K: f.k, J: f.j, A: f.a, B: f.b, Y: f.y };
  const c = fields.find((x) => x.name === "C");
  const bits = c ? (c.hi - c.lo + 1) * 4 : 12;
  let word = 0;
  for (const x of fields) {
    const width = (x.hi - x.lo + 1) * 4;
    const v = x.name === "C" ? f.c & ((1 << width) - 1) : (values[x.name] ?? 0);
    word = (word | (v << (x.lo * 4))) >>> 0;
  }
  const moved = fields
    .filter((x) => {
      const home = COURSE.find((h) => h.name === x.name);
      return x.name !== "C" && home !== undefined && home.hi !== x.hi;
    })
    .map((x) => x.name);
  return {
    fields,
    word,
    constantBits: bits,
    min: -(2 ** (bits - 1)),
    max: 2 ** (bits - 1) - 1,
    moved,
  };
}

// ---- The calculator -------------------------------------------------------------------------

/** What Module 7's ALU gives for a job on two words: Y and the four flags, simulated. */
export interface Calculation {
  readonly y: Word;
  readonly zero: number;
  readonly minus: number;
  readonly cout: number;
  readonly over: number;
}

const ALUS: Readonly<Record<16 | 64, string>> = { 16: "alu8-flags-16-block", 64: "alu8-flags-64" };
const sims = new Map<number, Simulator>();

/** Runs the library's ALU with flags at 16 or 64 bits on A and B with a job's code (0 to 7). */
export function calculate(width: 16 | 64, job: number, a: bigint, b: bigint): Calculation {
  let sim = sims.get(width);
  if (!sim) {
    sim = new Simulator(libraryCircuit(ALUS[width]));
    sims.set(width, sim);
  }
  const mask = (1n << BigInt(width)) - 1n;
  sim.setInput("A", wordOf(width, a & mask));
  sim.setInput("B", wordOf(width, b & mask));
  sim.setInput("OP2", wordOf(1, (job >> 2) & 1));
  sim.setInput("OP1", wordOf(1, (job >> 1) & 1));
  sim.setInput("OP0", wordOf(1, job & 1));
  sim.settle();
  const bit = (n: string) => Number(sim.read(n).value & 1n);
  return {
    y: sim.read("Y"),
    zero: bit("ZERO"),
    minus: bit("MINUS"),
    cout: bit("COUT"),
    over: bit("OVER"),
  };
}
