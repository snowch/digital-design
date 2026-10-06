// Copyright © 2026 Christopher Snow

// Module 8: the course machine's single-cycle datapath, built from the learner's own parts.
//
// `docs/machine.md` ("The single-cycle datapath") is the design; this file builds it at 64 bits
// as a circuit the simulator runs, and machine.ts is the reference it is tested against,
// instruction by instruction (datapath.test.ts). The lessons build it up in five stages, each a
// circuit of its own, so a figure shows only the parts its lesson has reached:
//
// - `jobs` (8.1): the register file feeding the ALU, the ALU's result written back; the
//   instruction's digits are set by hand, and the job digit's low three bits are the ALU's code.
// - `constants` (8.2): the constant, widened to 64 bits, and a selector in front of the ALU's B
//   input, chosen by a control signal set by hand.
// - `fetch` (8.3): the PC, adding 4 at each edge, the ROM's fetch port, and the decoder, a closed
//   block that works out the control signals from the kind and job digits (Module 9 opens it).
// - `memory` (8.4): the memory map whole, read and written by loads and stores, with a selector in
//   front of the ALU's A input for an address given by the constant alone, and one choosing what
//   register Y takes.
// - `full` (8.5): the branch condition from the flags, the target PC + 4c, calls and jumps.
//
// What is gates and what is a component. Everything a learner opens is gates: the ALU (Module 7's
// own, opening one level at a time) and the branch condition. The closed blocks are closed for
// good, and say what they are: the register file is two banks of the simulator's `memory`
// primitive (Module 6's), 32 bits each, since 16 words of 64 bits is one bit more than a net
// holds; the ROM is a `rom` primitive, whose words are its parameters, not a net; the RAM is eight
// banks of bytes, as Module 6's memory of bytes is two; the PC and the devices' words are one-word
// memories written at an edge (`edgeRegister`), which behave as Module 5's registers do without
// their latches' passing values in a stepped edge; the word selectors at the top level are Module 3's selector, one
// per bit (Module 6's word selector). Inside the closed memory, choosing among whole words is
// done with the simulator's `mux2`, a primitive that behaves as one selector per bit does and
// that every register with an enable already uses, so the memory's thousands of selectors are
// one evaluation each.
//
// The control signals have the course's own names (docs/notes/module-8-datapath.md lists them).
// The control registers C0 to C4 are Module 12's: this machine is always in system mode with no
// handler, so every trap stops it, with its cause, and the selectors machine.md gives a control
// register's input are built without it.

import { CircuitBuilder, type Circuit, type NetId } from "@dd/sim";

import { aluParts } from "./alu";
import { fullAdder, selector4, split4, type PortNets } from "./combinational";
import { CAUSES } from "./machine";
import { wordSelector } from "./memory";

export const STAGES = ["jobs", "constants", "fetch", "memory", "full"] as const;
export type Stage = (typeof STAGES)[number];

const after = (stage: Stage, from: Stage) => STAGES.indexOf(stage) >= STAGES.indexOf(from);

export interface DatapathOptions {
  readonly stage: Stage;
  /** The ROM's 1024 bytes (the `fetch` stage on). Absent: all 0s. */
  readonly rom?: Uint8Array | readonly number[];
  /** The registers' words as the figure starts, R0 first; `undefined` is unknown. */
  readonly registers?: readonly (bigint | undefined)[];
  /** The circuit's name; the stage's by default. */
  readonly name?: string;
}

/** The parts' instance names at the top level, by what they are. */
export const PARTS = {
  digits: "digits",
  jobBits: "jobBits",
  regs: "registers",
  alu: "alu",
  widen: "widen",
  pickA: "pickA",
  pickB: "pickB",
  pc: "pc",
  plus4: "plus4",
  rom: "rom",
  memory: "memory",
  decoder: "decoder",
  stops: "stops",
  pickLoad: "pickLoad",
  pickCall: "pickCall",
  condition: "condition",
  times4: "times4",
  target: "target",
  andTake: "andTake",
  orTake: "orTake",
  pickTake: "pickTake",
  pickJump: "pickJump",
  back: "yWord",
  next: "next",
} as const;

// ---- Small closed blocks --------------------------------------------------------------------

/**
 * A block's parts in a scope of their own (a closed block in a drawing), or, for a module the
 * course supplies to the SystemVerilog subset, at the level its use already made (Module 8).
 */
function block<T>(
  b: CircuitBuilder,
  scoped: boolean,
  name: string,
  kind: string,
  body: (bb: CircuitBuilder) => T,
  ports: { inputs: Record<string, NetId>; outputs: Record<string, NetId> },
): T {
  return scoped ? b.scope(name, kind, body, ports) : body(b);
}

/** Where a block's outputs go, when its user has made their nets, and whether it is scoped. */
export interface Given {
  readonly outs?: Readonly<Record<string, NetId>>;
  readonly scoped?: boolean;
}

function slicePart(b: CircuitBuilder, w: NetId, hi: number, lo: number, out: NetId, name: string) {
  if (hi === lo) b.component("bit", { a: w }, { y: out }, { name, params: { index: lo } });
  else b.component("slice", { a: w }, { y: out }, { name, params: { hi, lo } });
}

/** A fixed value as a part: `width` bits. */
function constant(b: CircuitBuilder, name: string, width: number, value: bigint): NetId {
  const y = b.net(name, width);
  b.component("const", {}, { y }, { name, params: { width, value: value.toString() } });
  return y;
}

/** Words joined, the first lowest: the `join` primitive. */
function joinParts(b: CircuitBuilder, parts: readonly NetId[], out: NetId, name = "join") {
  b.component(
    "join",
    Object.fromEntries(parts.map((n, i) => [String.fromCharCode(97 + i), n])),
    { y: out },
    { name, params: { width: b.widthOf(out) } },
  );
}

/** A word-wide two-way choice inside a closed block: B while S is 1, A while it is 0. */
function mux(b: CircuitBuilder, s: NetId, a: NetId, bIn: NetId, name: string, out?: NetId): NetId {
  const y = out ?? b.net(name, b.widthOf(a));
  b.component("mux2", { sel: s, a, b: bIn }, { y }, { name });
  return y;
}

/** A choice among 2^n words by an n-bit select word, as a tree of `mux2`: words[k] when S is k. */
function muxTree(b: CircuitBuilder, s: NetId, words: readonly NetId[], name: string, out?: NetId) {
  const bits = b.widthOf(s);
  let level = [...words];
  for (let i = 0; i < bits; i++) {
    const sel = b.net(`${name}S${i}`);
    slicePart(b, s, i, i, sel, `${name}Bit${i}`);
    const next: NetId[] = [];
    for (let k = 0; k < level.length; k += 2) {
      const last = level.length === 2 && out !== undefined;
      next.push(
        mux(
          b,
          sel,
          level[k] as NetId,
          level[k + 1] as NetId,
          `${name}${i}_${k / 2}`,
          last ? out : undefined,
        ),
      );
    }
    level = next;
  }
  return level[0] as NetId;
}

/** The instruction's digits: K J A B Y and the constant, as a closed block (`digits`). */
function digits(b: CircuitBuilder, ir: NetId) {
  const out = {
    K: b.net("K", 4),
    J: b.net("J", 4),
    A: b.net("A", 4),
    B: b.net("B", 4),
    Y: b.net("Y", 4),
    C: b.net("C", 12),
  };
  b.scope(
    PARTS.digits,
    "digits",
    (bb) => {
      slicePart(bb, ir, 31, 28, out.K, "k");
      slicePart(bb, ir, 27, 24, out.J, "j");
      slicePart(bb, ir, 23, 20, out.A, "a");
      slicePart(bb, ir, 19, 16, out.B, "b");
      slicePart(bb, ir, 15, 12, out.Y, "y");
      slicePart(bb, ir, 11, 0, out.C, "c");
    },
    { inputs: { IR: ir }, outputs: out },
  );
  return out;
}

/** The constant widened to 64 bits: bit 11 copied into bits 63 to 12 (`widen`). */
function widen(b: CircuitBuilder, c: NetId): NetId {
  const w = b.net("WIDE", 64);
  b.scope(
    PARTS.widen,
    "widen",
    (bb) => {
      const top = bb.net("C11");
      slicePart(bb, c, 11, 11, top, "bit11");
      joinParts(bb, [c, ...Array.from({ length: 52 }, () => top)], w);
    },
    { inputs: { C: c }, outputs: { W: w } },
  );
  return w;
}

/**
 * Module 8's register file: 16 registers of 64 bits, two reads (RA, RB onto QA, QB) and one write
 * (WA, D, WE at a rising edge of CLK), as two banks of the simulator's memory, the low 32 bits of
 * every register in one and the high 32 in the other.
 */
export function registerFile64(
  b: CircuitBuilder,
  ins: { RA: NetId; RB: NetId; WA: NetId; D: NetId; WE: NetId; CLK: NetId },
  init?: readonly (bigint | undefined)[],
  given: Given = {},
) {
  const qa = given.outs?.["QA"] ?? b.net("QA", 64);
  const qb = given.outs?.["QB"] ?? b.net("QB", 64);
  block(
    b,
    given.scoped ?? true,
    PARTS.regs,
    "registers",
    (bb) => {
      const halves = [
        { name: "low", lo: 0 },
        { name: "high", lo: 32 },
      ].map(({ name, lo }) => {
        const d = bb.net(`D_${name}`, 32);
        slicePart(bb, ins.D, lo + 31, lo, d, `${name}D`);
        const state = bb.net(`${name}State`, 16 * 32 + 1);
        const last = bb.net(`${name}Last`);
        const q0 = bb.net(`QA_${name}`, 32);
        const q1 = bb.net(`QB_${name}`, 32);
        const words = init
          ? Array.from({ length: 16 }, (_, k) => {
              const v = init[k];
              return v === undefined ? "x" : ((v >> BigInt(lo)) & 0xffffffffn).toString(16);
            }).join(" ")
          : undefined;
        bb.component(
          "memory",
          { CLK: ins.CLK, WE: ins.WE, WA: ins.WA, D: d, R0: ins.RA, R1: ins.RB, state, last },
          { Q0: q0, Q1: q1, stateNext: state, lastNext: last },
          {
            name,
            params: { words: 16, width: 32, reads: 2, ...(words ? { init: words } : {}) },
          },
        );
        return { q0, q1 };
      });
      joinParts(bb, [halves[0]!.q0, halves[1]!.q0], qa, "joinA");
      joinParts(bb, [halves[0]!.q1, halves[1]!.q1], qb, "joinB");
    },
    {
      inputs: { RA: ins.RA, RB: ins.RB, WA: ins.WA, D: ins.D, WE: ins.WE, CLK: ins.CLK },
      outputs: { QA: qa, QB: qb },
    },
  );
  return { QA: qa, QB: qb };
}

/** A 64-bit ripple adder as a closed block of kind `kind`: SUM = A + B, carry out dropped. */
function wordAdder(
  b: CircuitBuilder,
  name: string,
  kind: string,
  a: NetId,
  bIn: NetId | undefined,
  sum: NetId,
) {
  // The +4 block adds a fixed 4, inside it; the target's adder adds its two inputs.
  b.scope(name, kind, (bb) => adderGates(bb, a, bIn ?? constant(bb, "FOUR", 64, 4n), sum), {
    inputs: bIn === undefined ? { PC: a } : { A: a, B: bIn },
    outputs: { SUM: sum },
  });
}

/** One full adder per bit, each one's carry out the next one's carry in (Module 3's). */
function adderGates(b: CircuitBuilder, a: NetId, bIn: NetId, sum: NetId, carryIn?: NetId) {
  const width = b.widthOf(a);
  let carry = carryIn ?? constant(b, "zero", 1, 0n);
  const sums: NetId[] = [];
  for (let i = 0; i < width; i++) {
    const ai = b.net(`A${i}`);
    const bi = b.net(`B${i}`);
    slicePart(b, a, i, i, ai, `bitA${i}`);
    slicePart(b, bIn, i, i, bi, `bitB${i}`);
    const fa = fullAdder(
      b,
      { A: ai, B: bi, CIN: carry },
      {
        name: `fa${i}`,
        outs: { SUM: b.net(`S${i}`), COUT: b.net(`C${i + 1}`) },
      },
    );
    sums.push(fa.SUM);
    carry = fa.COUT;
  }
  joinParts(b, sums, sum);
}

/** Module 5's register of flip-flops, `width` bits, closed: D, EN, RST and CLK in, Q out. */
function wordRegister(
  b: CircuitBuilder,
  name: string,
  ins: { D: NetId; EN?: NetId; RST: NetId; CLK: NetId },
  q: NetId,
  kind = "word-register-64",
) {
  b.scope(name, kind, (bb) => edgeRegister(bb, "register", ins, q), {
    // D first, then the reset, the enable and the clock, so the drawing's two pins (RST and
    // CLK) have a port between them and their boxes do not touch.
    inputs: {
      D: ins.D,
      RST: ins.RST,
      ...(ins.EN !== undefined ? { EN: ins.EN } : {}),
      CLK: ins.CLK,
    },
    outputs: { Q: q },
  });
}

/**
 * A register that changes at a rising edge only: one word of the simulator's `memory`, written at
 * every edge where EN or RST is 1, with 0 in place of D while RST is 1. It behaves as Module 5's
 * register with a reset and an enable does, but as one part: a register of gate-level flip-flops
 * passes its latches' passing values on through the settle model's steps, so a datapath stepped
 * through one edge would show its PC and its devices' words change and change back before they
 * settle. Here every register of the datapath takes its new word at the edge's first step.
 */
function edgeRegister(
  b: CircuitBuilder,
  name: string,
  ins: { D: NetId; EN?: NetId; RST: NetId; CLK: NetId },
  q: NetId,
) {
  const width = b.widthOf(q);
  const d = mux(b, ins.RST, ins.D, constant(b, `${name}Zero`, width, 0n), `${name}D`);
  const we = ins.EN === undefined ? ins.RST : b.or([ins.EN, ins.RST], { name: `${name}Write` });
  const state = b.net(`${name}State`, width + 1);
  const last = b.net(`${name}Last`);
  b.component(
    "memory",
    {
      CLK: ins.CLK,
      WE: we,
      WA: constant(b, `${name}At`, 1, 0n),
      D: d,
      R0: constant(b, `${name}Read`, 1, 0n),
      state,
      last,
    },
    { Q0: q, stateNext: state, lastNext: last },
    { name, params: { words: 1, width, reads: 1 } },
  );
}

/** An OR of every bit of a word, as one gate: 1 when any bit is 1. */
function anyBit(b: CircuitBuilder, w: NetId, hi: number, lo: number, name: string): NetId {
  const bits = Array.from({ length: hi - lo + 1 }, (_, k) => {
    const n = b.net(`${name}${lo + k}`);
    slicePart(b, w, lo + k, lo + k, n, `${name}Bit${lo + k}`);
    return n;
  });
  return bits.length === 1
    ? (bits[0] as NetId)
    : b.or(bits, { name, output: b.net(name.toUpperCase()) });
}

// ---- The decoder (closed until Module 9) ----------------------------------------------------

/** The control signals each stage's decoder gives, in the order its block lists them. */
export const DECODER_OUTPUTS: Readonly<Record<"fetch" | "memory" | "full", readonly string[]>> = {
  fetch: ["CAUSED", "STOP", "WRITEY", "BCONST", "OP2", "OP1", "OP0"],
  memory: [
    "CAUSED",
    "STOP",
    "WRITEY",
    "LOAD",
    "STORE",
    "BYTE",
    "AZERO",
    "BCONST",
    "OP2",
    "OP1",
    "OP0",
  ],
  full: [
    "CAUSED",
    "STOP",
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
  ],
};

/** Each output's width: a control signal is one bit; the decode step's cause is a byte. */
export const DECODER_WIDTHS: Readonly<Record<string, number>> = { CAUSED: 8 };

/**
 * The decoder: gates from the kind and job digits (and, for a control register's number, the
 * constant) to the control signals and the illegal-instruction check. Built as gates, drawn closed:
 * how it works out its outputs is Module 9's.
 */
export function decoder(
  b: CircuitBuilder,
  ins: { K: NetId; J: NetId },
  outputs: readonly string[],
  given: Given = {},
): Record<string, NetId> {
  const outs = Object.fromEntries(
    outputs.map((n) => [n, given.outs?.[n] ?? b.net(n, DECODER_WIDTHS[n] ?? 1)]),
  );
  block(
    b,
    given.scoped ?? true,
    PARTS.decoder,
    "decoder",
    (bb) => {
      const bitsOf = (w: NetId, name: string) =>
        [0, 1, 2, 3].map((i) => {
          const n = bb.net(`${name}${i}`);
          slicePart(bb, w, i, i, n, `${name}Bit${i}`);
          return n;
        });
      const k = bitsOf(ins.K, "k");
      const j = bitsOf(ins.J, "j");
      const nk = k.map((n, i) => bb.not(n, { name: `notK${i}` }));
      const nj = j.map((n, i) => bb.not(n, { name: `notJ${i}` }));
      const is = (bits: NetId[], nots: NetId[], v: number, name: string) =>
        bb.and(
          [3, 2, 1, 0].map((i) => ((v >> i) & 1 ? (bits[i] as NetId) : (nots[i] as NetId))),
          { name },
        );
      const kind = Array.from({ length: 16 }, (_, v) => is(k, nk, v, `kind${v}`));
      const job = Array.from({ length: 16 }, (_, v) => is(j, nj, v, `job${v}`));
      const K = (v: number) => kind[v] as NetId;
      const any = (xs: NetId[], name: string) =>
        xs.length === 1 ? (xs[0] as NetId) : bb.or(xs, { name });
      const both = (xs: NetId[], name: string) => bb.and(xs, { name });
      const jobKinds = any([K(1), K(2)], "jobKinds");
      const memKinds = any([K(3), K(4)], "memKinds");
      // The constant names a control register 0 to 4: bits 11 to 3 all 0, and not 5, 6 or 7.
      const signal: Record<string, () => NetId> = {
        OP2: () => both([jobKinds, j[2] as NetId], "op2"),
        OP1: () => any([both([jobKinds, j[1] as NetId], "op1Job"), memKinds, K(5), K(7)], "op1"),
        OP0: () => any([both([jobKinds, j[0] as NetId], "op0Job"), K(5)], "op0"),
        AZERO: () => both([memKinds, j[3] as NetId], "azero"),
        BCONST: () => any([K(2), K(3), K(4), K(7)], "bconst"),
        WRITEY: () => any([K(1), K(2), K(3), K(6)], "writey"),
        LOAD: () => K(3),
        STORE: () => K(4),
        BYTE: () => both([memKinds, j[0] as NetId], "byte"),
        CALL: () => K(6),
        JUMP: () => K(7),
        BRANCH: () => K(5),
        STOP: () =>
          both([K(8), any([job[1], job[2], job[3], job[4]] as NetId[], "jobs1to4")], "stop"),
        SYSTEM: () => both([K(8), job[0] as NetId], "system"),
        ILLEGAL: () => {
          const highJob = j[3] as NetId;
          const memJob = both([memKinds, any([j[2], j[1]] as NetId[], "j2or1")], "memBad");
          const oneJob = both(
            [any([K(6), K(7)], "callJump"), bb.not(job[0] as NetId, { name: "notJob0" })],
            "oneBad",
          );
          // System jobs 5 to 15. Whether a control register's number is 0 to 4 is Module 12's
          // check, with the control registers.
          const sysBad = both(
            [
              K(8),
              any(
                [highJob, both([j[2], any([j[1], j[0]] as NetId[], "j1or0")] as NetId[], "j5to7")],
                "sysHigh",
              ),
            ],
            "sysBad",
          );
          return any(
            [
              K(0),
              ...[9, 10, 11, 12, 13, 14, 15].map(K),
              both([any([jobKinds, K(5)], "eightJobs"), highJob], "jobBad"),
              memJob,
              oneJob,
              sysBad,
            ],
            "illegal",
          );
        },
      };
      for (const name of outputs) {
        if (name === "CAUSED") {
          // The decode step's cause: 21 for an illegal instruction, 41 for `call system`, else 00.
          causeWord(
            bb,
            [
              [signal["ILLEGAL"]!(), CAUSES.illegal],
              [signal["SYSTEM"]!(), CAUSES.system],
            ],
            "caused",
            outs[name] as NetId,
          );
          continue;
        }
        const make = signal[name];
        if (!make) throw new RangeError(`the decoder has no output ${name}`);
        bb.gate("buf", [make()], { name: `out${name}`, output: outs[name] as NetId });
      }
    },
    { inputs: { K: ins.K, J: ins.J }, outputs: outs },
  );
  return outs;
}

// ---- The stop logic ----------------------------------------------------------------------------

/**
 * A step's cause as a byte: the number of the first of its checks that fails, or 00 when none
 * does. A chain of selectors, from the last check to the first, each letting an earlier check's
 * number win.
 */
function causeWord(
  b: CircuitBuilder,
  checks: readonly (readonly [NetId, number])[],
  name: string,
  out: NetId,
): NetId {
  let word = constant(b, `${name}None`, 8, 0n);
  checks
    .slice()
    .reverse()
    .forEach(([check, v], i) => {
      const last = i === checks.length - 1;
      word = mux(
        b,
        check,
        word,
        constant(b, `${name}${v.toString(16)}`, 8, BigInt(v)),
        `${name}Pick${i}`,
        last ? out : undefined,
      );
    });
  return word;
}

/**
 * Whether this edge stops the machine, and why. Each step gives its cause as a byte, 00 when its
 * checks pass: fetch (CAUSEF: 11, 12), decode (CAUSED: 21, 41) and memory (CAUSEM: 31, 33, 34).
 * HALT is 1 when any of them is not 00 or the instruction stops the machine; CAUSE is the first
 * step's that is not 00, so the lower number wins, the first check to fail in the order the steps
 * run; 00 for `stop`. An edge that halts changes nothing: GO, NOT HALT, holds the PC, and the
 * register file's write waits on it (WREG), as the memory's does inside the memory.
 */
export function stopLogic(
  b: CircuitBuilder,
  causes: { readonly CAUSEF: NetId; readonly CAUSED: NetId; readonly CAUSEM?: NetId },
  controls: { readonly STOP: NetId; readonly WRITEY: NetId },
  nets: { readonly HALT: NetId; readonly GO: NetId; readonly WREG: NetId },
  given: Given = {},
) {
  const cause = given.outs?.["CAUSE"] ?? b.net("CAUSE", 8);
  const steps = [
    causes.CAUSEF,
    causes.CAUSED,
    ...(causes.CAUSEM !== undefined ? [causes.CAUSEM] : []),
  ];
  block(
    b,
    given.scoped ?? true,
    PARTS.stops,
    "stops",
    (bb) => {
      const failed = steps.map((w, i) => anyBit(bb, w, 7, 0, `failed${i}`));
      bb.or([...failed, controls.STOP], { name: "orHalt", output: nets.HALT });
      // From the last step to the first, each selector lets an earlier step's cause win.
      let word = steps[steps.length - 1] as NetId;
      for (let i = steps.length - 2; i >= 0; i--)
        word = mux(
          bb,
          failed[i] as NetId,
          word,
          steps[i] as NetId,
          `pick${i}`,
          i === 0 ? cause : undefined,
        );
      bb.not(nets.HALT, { name: "notHalt", output: nets.GO });
      bb.and([controls.WRITEY, nets.GO], { name: "andWrite", output: nets.WREG });
    },
    {
      inputs: {
        CAUSED: causes.CAUSED,
        STOP: controls.STOP,
        WRITEY: controls.WRITEY,
        CAUSEF: causes.CAUSEF,
        ...(causes.CAUSEM !== undefined ? { CAUSEM: causes.CAUSEM } : {}),
      },
      outputs: {
        HALT: nets.HALT,
        CAUSE: cause,
        WREG: nets.WREG,
        GO: nets.GO,
      },
    },
  );
  return { HALT: nets.HALT, CAUSE: cause };
}

// ---- The program ROM (the fetch stage) and the memory (from the memory stage) ---------------

function romParams(rom: Uint8Array | readonly number[] | undefined): string {
  const bytes = Array.from(rom ?? []);
  const words = Array.from({ length: 256 }, (_, k) => {
    let v = 0;
    for (let i = 3; i >= 0; i--) v = v * 256 + (bytes[4 * k + i] ?? 0);
    return v;
  });
  // Trailing zero words are left out: the primitive fills past the list with 0s.
  let end = words.length;
  while (end > 0 && words[end - 1] === 0) end--;
  return words
    .slice(0, Math.max(end, 1))
    .map((w) => w.toString(16))
    .join(" ");
}

/** The fetch checks: no instruction at the PC (outside the ROM), and a PC not a multiple of 4. */
function fetchCause(b: CircuitBuilder, pc: NetId, out: NetId): void {
  const outside = anyBit(b, pc, 63, 10, "outside");
  const not4 = b.or(
    [0, 1].map((i) => {
      const n = b.net(`pc${i}`);
      slicePart(b, pc, i, i, n, `pcBit${i}`);
      return n;
    }),
    { name: "not4" },
  );
  causeWord(
    b,
    [
      [outside, CAUSES.outsideRom],
      [not4, CAUSES.notMultipleOf4],
    ],
    "causef",
    out,
  );
}

/** The ROM read at the PC for an instruction: 256 words of 32 bits, one read, and its checks. */
function programRom(b: CircuitBuilder, pc: NetId, rom: DatapathOptions["rom"]) {
  const ir = b.net("IR", 32);
  const causef = b.net("CAUSEF", 8);
  b.scope(
    PARTS.rom,
    "rom",
    (bb) => {
      const row = bb.net("ROW", 8);
      slicePart(bb, pc, 9, 2, row, "row");
      bb.component(
        "rom",
        { R0: row },
        { Q0: ir },
        { name: "cells", params: { words: 256, width: 32, reads: 1, init: romParams(rom) } },
      );
      fetchCause(bb, pc, causef);
    },
    { inputs: { PC: pc }, outputs: { CAUSEF: causef, IR: ir } },
  );
  return { IR: ir, CAUSEF: causef };
}

export interface MemoryPorts {
  readonly PC: NetId;
  readonly ADDR: NetId;
  readonly D: NetId;
  readonly LOAD: NetId;
  readonly STORE: NetId;
  readonly BYTE: NetId;
  readonly GO: NetId;
  readonly RST: NetId;
  readonly CLK: NetId;
  readonly DOOR: NetId;
  readonly WARM: NetId;
  readonly SENSORA: NetId;
  readonly SENSORB: NetId;
}

/**
 * The machine's memory (docs/machine.md, "Memory" and "Devices"): the ROM at 000 to 3FF, read by
 * fetch at the PC and by loads; the RAM at 400 to 7BF, eight banks of 120 bytes; the devices at
 * 7C0 to 7FF. ADDR is the whole 64-bit address. Q is the word or byte a load reads, a byte with 0s
 * above it. The checks: NOMEM, no memory at the address (31); MISALIGN, a word not at a multiple
 * of 8 or a byte at a device (33); RONLY, a store to the ROM or a read-only device (34); each only
 * for a load or a store. A write happens at a rising edge of CLK where WE is 1.
 */
export function memoryNets(b: CircuitBuilder) {
  return {
    CAUSEF: b.net("CAUSEF", 8),
    CAUSEM: b.net("CAUSEM", 8),
    MQ: b.net("MQ", 64),
    DISPLAY: b.net("DISPLAY", 64),
    LAMPS: b.net("LAMPS", 3),
    IR: b.net("IR", 32),
  };
}

export function machineMemory(
  b: CircuitBuilder,
  ins: MemoryPorts,
  rom: DatapathOptions["rom"],
  out: ReturnType<typeof memoryNets>,
  scoped = true,
) {
  block(
    b,
    scoped,
    PARTS.memory,
    "memory",
    (bb) => {
      const a = ins.ADDR;
      const bit = (i: number) => {
        const n = bb.net(`a${i}`);
        slicePart(bb, a, i, i, n, `aBit${i}`);
        return n;
      };
      const [a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10] = Array.from({ length: 11 }, (_, i) =>
        bit(i),
      ) as NetId[];
      const high = anyBit(bb, a, 63, 11, "high");
      const notHigh = bb.not(high, { name: "notHigh" });
      const notA10 = bb.not(a10 as NetId, { name: "notA10" });
      const romSel = bb.and([notHigh, notA10], { name: "romSel", output: bb.net("ROMSEL") });
      const upper = bb.and([notHigh, a10 as NetId], { name: "upper" });
      const top4 = bb.and([a9, a8, a7, a6] as NetId[], { name: "top4" });
      const devSel = bb.and([upper, top4], { name: "devSel", output: bb.net("DEVSEL") });
      const ramSel = bb.and([upper, bb.not(top4, { name: "notTop4" })], {
        name: "ramSel",
        output: bb.net("RAMSEL"),
      });
      const dev = bb.net("DEV", 3);
      slicePart(bb, a, 5, 3, dev, "dev");
      const devLine = (v: number) =>
        bb.and(
          [
            devSel,
            ...[a5, a4, a3].map((n, i) =>
              (v >> (2 - i)) & 1 ? (n as NetId) : bb.not(n as NetId, { name: `notDev${v}_${i}` }),
            ),
          ],
          { name: `dev${v}`, output: bb.net(`DEV${v}`) },
        );
      const devs = Array.from({ length: 8 }, (_, v) => devLine(v));
      const access = bb.or([ins.LOAD, ins.STORE], { name: "access" });
      // The checks.
      const noMem = bb.and([access, bb.or([high, devs[7] as NetId], { name: "noneThere" })], {
        name: "noMem",
        output: bb.net("NOMEM"),
      });
      const wordOff = bb.or([a2, a1, a0] as NetId[], { name: "wordOff" });
      const notByte = bb.not(ins.BYTE, { name: "notByte" });
      const misalign = bb.and(
        [
          access,
          bb.or(
            [
              bb.and([notByte, wordOff], { name: "wordMis" }),
              bb.and([ins.BYTE, devSel], { name: "byteDev" }),
            ],
            { name: "mis" },
          ),
        ],
        { name: "misalign", output: bb.net("MISALIGN") },
      );
      const readOnlyDev = bb.or([devs[2], devs[3], devs[4]] as NetId[], { name: "readOnlyDev" });
      const rOnly = bb.and([ins.STORE, bb.or([romSel, readOnlyDev], { name: "readOnly" })], {
        name: "rOnly",
        output: bb.net("RONLY"),
      });
      // The memory step's cause: no memory (31), then misaligned (33), then read-only (34).
      causeWord(
        bb,
        [
          [noMem, CAUSES.noMemory],
          [misalign, CAUSES.misaligned],
          [rOnly, CAUSES.readOnly],
        ],
        "causem",
        out.CAUSEM,
      );
      // The ROM: fetch at the PC, and the two halves of the word a load reads.
      const fetchRow = bb.net("FETCHROW", 8);
      slicePart(bb, ins.PC, 9, 2, fetchRow, "fetchRow");
      const wordRow = bb.net("ROW", 7);
      slicePart(bb, a, 9, 3, wordRow, "row");
      const zero1 = constant(bb, "zeroBit", 1, 0n);
      const one1 = constant(bb, "oneBit", 1, 1n);
      const lowRow = bb.net("LOWROW", 8);
      const highRow = bb.net("HIGHROW", 8);
      joinParts(bb, [zero1, wordRow], lowRow, "joinLowRow");
      joinParts(bb, [one1, wordRow], highRow, "joinHighRow");
      const romLow = bb.net("ROMLOW", 32);
      const romHigh = bb.net("ROMHIGH", 32);
      bb.component(
        "rom",
        { R0: fetchRow, R1: lowRow, R2: highRow },
        { Q0: out.IR, Q1: romLow, Q2: romHigh },
        { name: "rom", params: { words: 256, width: 32, reads: 3, init: romParams(rom) } },
      );
      const romWord = bb.net("ROMWORD", 64);
      joinParts(bb, [romLow, romHigh], romWord, "joinRom");
      fetchCause(bb, ins.PC, out.CAUSEF);
      // The RAM: eight banks of bytes; bank k holds the bytes whose address ends in k.
      // A store writes at the edge only if the machine goes on (GO): a trap changes nothing.
      const we = bb.and([ins.STORE, ins.GO], { name: "andStore", output: bb.net("WE") });
      const writeRam = bb.and([we, ramSel], { name: "writeRam" });
      const lane = bb.net("LANE", 3);
      slicePart(bb, a, 2, 0, lane, "lane");
      const lowByte = bb.net("DLOW", 8);
      slicePart(bb, ins.D, 7, 0, lowByte, "dLow");
      const ramBytes = Array.from({ length: 8 }, (_, k) => {
        const own = bb.net(`D${k}`, 8);
        slicePart(bb, ins.D, 8 * k + 7, 8 * k, own, `dByte${k}`);
        const d = mux(bb, ins.BYTE, own, lowByte, `pickD${k}`);
        const laneK = bb.and(
          [2, 1, 0].map((i) =>
            (k >> i) & 1
              ? ([a2, a1, a0][2 - i] as NetId)
              : bb.not([a2, a1, a0][2 - i] as NetId, { name: `notLane${k}_${i}` }),
          ),
          { name: `lane${k}` },
        );
        const mine = bb.or([notByte, laneK], { name: `mine${k}` });
        const we = bb.and([writeRam, mine], { name: `weBank${k}` });
        const state = bb.net(`bank${k}State`, 120 * 8 + 1);
        const last = bb.net(`bank${k}Last`);
        const q = bb.net(`Q${k}`, 8);
        bb.component(
          "memory",
          { CLK: ins.CLK, WE: we, WA: wordRow, D: d, R0: wordRow, state, last },
          { Q0: q, stateNext: state, lastNext: last },
          { name: `bank${k}`, params: { words: 120, width: 8, reads: 1 } },
        );
        return q;
      });
      const ramWord = bb.net("RAMWORD", 64);
      joinParts(bb, ramBytes, ramWord, "joinRam");
      // The devices.
      const writeDev = (v: number) =>
        bb.and([we, devs[v] as NetId], { name: `writeDev${v}`, output: bb.net(`WDEV${v}`) });
      wordRegister(
        bb,
        "display",
        { D: ins.D, EN: writeDev(0), RST: ins.RST, CLK: ins.CLK },
        out.DISPLAY,
      );
      const d3 = bb.net("D3BITS", 3);
      slicePart(bb, ins.D, 2, 0, d3, "dLamps");
      wordRegister(
        bb,
        "lamps",
        { D: d3, EN: writeDev(1), RST: ins.RST, CLK: ins.CLK },
        out.LAMPS,
        "word-register-3",
      );
      // The timer: a write replaces its count; otherwise it counts down as an instruction
      // finishes (TICK), while the count is not 0.
      const count = bb.net("COUNT", 64);
      const writeTimer = writeDev(5);
      const counting = bb.net("COUNTING");
      const nonZero = anyBit(bb, count, 63, 0, "nonZero");
      bb.and([ins.GO, nonZero], { name: "andCounting", output: counting });
      const less = bb.net("LESS", 64);
      bb.scope(
        "minus1",
        "count-down",
        (cb) => adderGates(cb, count, constant(cb, "allOnes", 64, (1n << 64n) - 1n), less),
        {
          inputs: { A: count },
          outputs: { SUM: less },
        },
      );
      const timerD = mux(bb, writeTimer, less, ins.D, "timerD");
      const timerEn = bb.or([writeTimer, counting], { name: "timerEn" });
      wordRegister(bb, "timer", { D: timerD, EN: timerEn, RST: ins.RST, CLK: ins.CLK }, count);
      // "Waiting": bit 0 set as the count goes from 1 to 0, bit 1 as DOOR rises; a store of a 1
      // clears a bit; a set and a clear at one edge, the set wins.
      const aboveOne = anyBit(bb, count, 63, 1, "aboveOne");
      const count0 = bb.net("count0");
      slicePart(bb, count, 0, 0, count0, "countBit0");
      const reach = bb.and(
        [
          counting,
          bb.not(writeTimer, { name: "notWriteTimer" }),
          bb.not(aboveOne, { name: "notAboveOne" }),
          count0,
        ],
        {
          name: "reach",
          output: bb.net("REACH"),
        },
      );
      // The door's last level, kept inverted so a reset (to 0) means "no edge before".
      const quiet = bb.net("QUIET");
      edgeRegister(
        bb,
        "doorBefore",
        {
          D: bb.not(ins.DOOR, { name: "notDoor" }),
          EN: constant(bb, "always", 1, 1n),
          RST: ins.RST,
          CLK: ins.CLK,
        },
        quiet,
      );
      const opened = bb.and([ins.DOOR, quiet], { name: "opened", output: bb.net("OPENED") });
      const writeWaiting = writeDev(6);
      const waitingBits = [reach, opened].map((set, i) => {
        const keep = bb.net(`W${i}`);
        const di = bb.net(`dBit${i}`);
        slicePart(bb, ins.D, i, i, di, `dBit${i}`);
        const cleared = bb.and([writeWaiting, di], { name: `clear${i}` });
        const stays = bb.and([keep, bb.not(cleared, { name: `notClear${i}` })], {
          name: `stays${i}`,
        });
        const next = bb.or([set, stays], { name: `next${i}` });
        edgeRegister(
          bb,
          `waiting${i}`,
          { D: next, EN: constant(bb, `always${i}`, 1, 1n), RST: ins.RST, CLK: ins.CLK },
          keep,
        );
        return keep;
      });
      const zeros = (w: number, name: string) => constant(bb, name, w, 0n);
      const widenTo64 = (parts: NetId[], name: string) => {
        const used = parts.reduce((t, p) => t + bb.widthOf(p), 0);
        const w = bb.net(name, 64);
        joinParts(bb, [...parts, zeros(64 - used, `${name}Zeros`)], w, `join${name}`);
        return w;
      };
      const devWords = [
        out.DISPLAY,
        widenTo64([out.LAMPS], "LAMPWORD"),
        widenTo64([ins.DOOR, ins.WARM], "SIGNALWORD"),
        ins.SENSORA,
        ins.SENSORB,
        count,
        widenTo64(waitingBits, "WAITINGWORD"),
        zeros(64, "NOWORD"),
      ];
      const devWord = muxTree(bb, dev, devWords, "devWord");
      // What a load reads: the ROM's or the RAM's word, or one byte of it with 0s above; or the
      // device's word.
      const memWord = mux(bb, romSel, ramWord, romWord, "memWord");
      const bytes = Array.from({ length: 8 }, (_, k) => {
        const n = bb.net(`byte${k}`, 8);
        slicePart(bb, memWord, 8 * k + 7, 8 * k, n, `byte${k}`);
        return n;
      });
      const oneByte = muxTree(bb, lane, bytes, "oneByte");
      const byteWord = widenTo64([oneByte], "BYTEWORD");
      const memQ = mux(bb, ins.BYTE, memWord, byteWord, "memQ");
      mux(bb, devSel, memQ, devWord, "q", out.MQ);
    },
    {
      inputs: {
        LOAD: ins.LOAD,
        STORE: ins.STORE,
        BYTE: ins.BYTE,
        ADDR: ins.ADDR,
        D: ins.D,
        PC: ins.PC,
        GO: ins.GO,
        RST: ins.RST,
        CLK: ins.CLK,
        DOOR: ins.DOOR,
        WARM: ins.WARM,
        SENSORA: ins.SENSORA,
        SENSORB: ins.SENSORB,
      },
      outputs: out,
    },
  );
  return out;
}

// ---- The branch condition ---------------------------------------------------------------------

/**
 * Whether a branch is taken (MET), from the flags of A - B and the job digit (docs/machine.md,
 * "Branches"): a 4-way selector with job bits 2 and 1 on S1 and S0 picks 1, ZERO, NOT COUT or
 * MINUS XOR OVER, and an XOR gate with job bit 0 turns the choice over or leaves it. Gates, and a
 * block a learner opens.
 */
export function branchCondition(
  b: CircuitBuilder,
  ins: { ZERO: NetId; MINUS: NetId; COUT: NetId; OVER: NetId; J: NetId },
  given: Given = {},
): NetId {
  const met = given.outs?.["MET"] ?? b.net("MET");
  block(
    b,
    given.scoped ?? true,
    PARTS.condition,
    "condition",
    (bb) => {
      const bits = split4(
        bb,
        { W: ins.J },
        {
          name: "jobBits",
          outs: { b3: bb.net("J3"), b2: bb.net("J2"), b1: bb.net("J1"), b0: bb.net("J0") },
        },
      );
      const one = bb.net("ONE");
      bb.component("const", {}, { y: one }, { name: "one", params: { width: 1, value: "1" } });
      const noCarry = bb.not(ins.COUT, { name: "notCout", output: bb.net("NOCOUT") });
      const signedLess = bb.xor([ins.MINUS, ins.OVER], { name: "xorMO", output: bb.net("LESS") });
      const chosen = selector4(
        bb,
        {
          A: one,
          B: ins.ZERO,
          C: noCarry,
          D: signedLess,
          S1: bits["b2"] as NetId,
          S0: bits["b1"] as NetId,
        },
        { name: "pick", outs: { Y: bb.net("CHOSEN") } },
      ).Y;
      bb.xor([chosen, bits["b0"] as NetId], { name: "xorJ0", output: met });
    },
    {
      inputs: { J: ins.J, ZERO: ins.ZERO, MINUS: ins.MINUS, COUT: ins.COUT, OVER: ins.OVER },
      outputs: { MET: met },
    },
  );
  return met;
}

/**
 * The ALU's A input: register A, or 0 while AZERO is 1, for an address the constant gives alone.
 * Module 6's word selector with a fixed 0 on its B input, closed (`pickA`).
 */
function zeroOr(b: CircuitBuilder, a: NetId, azero: NetId): NetId {
  const y = b.net("ALUA", 64);
  b.scope(
    PARTS.pickA,
    "zero-or-word",
    (bb) => {
      wordSelector(
        bb,
        { A: a, B: constant(bb, "zero", 64, 0n), S: azero },
        { name: "pick", outs: { Y: y } },
      );
    },
    { inputs: { A: a, AZERO: azero }, outputs: { Y: y } },
  );
  return y;
}

/** A word times 4: two 0s joined below its bits 61 to 0 (`times4`). */
function timesFour(b: CircuitBuilder, w: NetId): NetId {
  const out = b.net("OFFSET", 64);
  b.scope(
    PARTS.times4,
    "times4",
    (bb) => {
      const low = bb.net("W61", 62);
      slicePart(bb, w, 61, 0, low, "low");
      joinParts(bb, [constant(bb, "zeros", 2, 0n), low], out);
    },
    { inputs: { W: w }, outputs: { W4: out } },
  );
  return out;
}

// ---- The datapath --------------------------------------------------------------------------------

/** The datapath at a stage, as a circuit. */
export function datapathCircuit(options: DatapathOptions): Circuit {
  const { stage } = options;
  const b = new CircuitBuilder(options.name ?? `datapath-${stage}`);
  const fetching = after(stage, "fetch");
  const memory = after(stage, "memory");
  const full = stage === "full";
  // Inputs: the instruction and two control signals by hand in the first two stages; the clock,
  // and from the third stage a reset; the shop's own from the fourth.
  const clk = b.input("CLK");
  const rst = fetching ? b.input("RST") : undefined;
  const handIr = fetching ? undefined : b.input("IR", 32);
  const handBconst = stage === "constants" ? b.input("BCONST") : undefined;
  const handWritey = fetching ? undefined : b.input("WRITEY");
  const shop = memory
    ? {
        DOOR: b.input("DOOR"),
        WARM: b.input("WARM"),
        SENSORA: b.input("SENSORA", 64),
        SENSORB: b.input("SENSORB", 64),
      }
    : undefined;

  // Nets made ahead of the parts that drive them: the loops through the PC and the memory.
  const pc = fetching ? b.net("PC", 64) : undefined;
  const result = b.net("RESULT", 64);
  // What register Y takes: the ALU's result, until the memory stage puts a selector in front.
  const yIn = memory ? b.net("YIN", 64) : result;
  const halt = fetching ? b.net("HALT") : undefined;
  const go = fetching ? b.net("GO") : undefined;
  const wreg = fetching ? b.net("WREG") : (handWritey as NetId);
  const memOut = memory ? memoryNets(b) : undefined;

  // The instruction: by hand, from the ROM, or from the memory's fetch port.
  let ir: NetId;
  let causef: NetId | undefined;
  if (!fetching) ir = handIr as NetId;
  else if (memOut) {
    ir = memOut.IR;
    causef = memOut.CAUSEF;
  } else {
    const r = programRom(b, pc as NetId, options.rom);
    ir = r.IR;
    causef = r.CAUSEF;
  }
  const d = digits(b, ir);

  // The control signals: by hand, or from the decoder.
  let op: { OP2: NetId; OP1: NetId; OP0: NetId };
  let ctrl: Record<string, NetId> = {};
  if (!fetching) {
    const bits = split4(
      b,
      { W: d.J },
      {
        name: PARTS.jobBits,
        outs: { b3: b.net("J3"), b2: b.net("OP2"), b1: b.net("OP1"), b0: b.net("OP0") },
      },
    );
    op = { OP2: bits["b2"] as NetId, OP1: bits["b1"] as NetId, OP0: bits["b0"] as NetId };
  } else {
    ctrl = decoder(
      b,
      { K: d.K, J: d.J },
      DECODER_OUTPUTS[full ? "full" : memory ? "memory" : "fetch"],
    );
    op = { OP2: ctrl["OP2"] as NetId, OP1: ctrl["OP1"] as NetId, OP0: ctrl["OP0"] as NetId };
  }

  // The register file, and the selectors in front of the ALU.
  const regs = registerFile64(
    b,
    { RA: d.A, RB: d.B, WA: d.Y, D: yIn, WE: wreg, CLK: clk },
    options.registers,
  );
  const wide = stage === "jobs" ? undefined : widen(b, d.C);
  const aluA = memory ? zeroOr(b, regs.QA, ctrl["AZERO"] as NetId) : regs.QA;
  const bconst = handBconst ?? ctrl["BCONST"];
  const aluB =
    wide !== undefined && bconst !== undefined
      ? wordSelector(
          b,
          { A: regs.QB, B: wide, S: bconst },
          { name: PARTS.pickB, outs: { Y: b.net("ALUB", 64) } },
        ).Y
      : regs.QB;
  const flags = aluParts(
    b,
    { A: aluA, B: aluB, ...op },
    { width: 64, flags: true, closed: true, outs: { Y: result } },
  );

  if (!fetching) {
    b.output("RESULT", result);
    return b.build();
  }

  // The PC and its +4: at the top level until the branches' stage, which puts them in the block
  // that works out the next PC.
  const pc4 = b.net("PC4", 64);
  if (!full) wordAdder(b, PARTS.plus4, "plus4", pc as NetId, undefined, pc4);

  // The memory, read and written by loads and stores.
  if (memOut && shop) {
    machineMemory(
      b,
      {
        PC: pc as NetId,
        ADDR: result,
        D: regs.QB,
        LOAD: ctrl["LOAD"] as NetId,
        STORE: ctrl["STORE"] as NetId,
        BYTE: ctrl["BYTE"] as NetId,
        GO: go as NetId,
        RST: rst as NetId,
        CLK: clk,
        ...shop,
      },
      options.rom,
      memOut,
    );
    b.output("DISPLAY", memOut.DISPLAY);
    b.output("LAMPS", memOut.LAMPS);
    if (full) {
      // What register Y takes: the ALU's result, the memory's word for a load, or PC + 4 for a
      // call, as one block that opens to its two selectors.
      const ins = {
        RESULT: result,
        MQ: memOut.MQ,
        PC4: pc4,
        LOAD: ctrl["LOAD"] as NetId,
        CALL: ctrl["CALL"] as NetId,
      };
      b.scope(
        PARTS.back,
        "yWord",
        (bb) => {
          const loaded = wordSelector(
            bb,
            { A: result, B: memOut.MQ, S: ins.LOAD },
            { name: PARTS.pickLoad, outs: { Y: bb.net("LOADED", 64) } },
          ).Y;
          wordSelector(
            bb,
            { A: loaded, B: pc4, S: ins.CALL },
            { name: PARTS.pickCall, outs: { Y: yIn } },
          );
        },
        { inputs: ins, outputs: { YIN: yIn } },
      );
    } else
      wordSelector(
        b,
        { A: result, B: memOut.MQ, S: ctrl["LOAD"] as NetId },
        { name: PARTS.pickLoad, outs: { Y: yIn } },
      );
  }

  // The stop logic, and the writes it holds back.
  const causes = {
    CAUSEF: causef as NetId,
    CAUSED: ctrl["CAUSED"] as NetId,
    ...(memOut ? { CAUSEM: memOut.CAUSEM } : {}),
  };
  const stops = stopLogic(
    b,
    causes,
    { STOP: ctrl["STOP"] as NetId, WRITEY: ctrl["WRITEY"] as NetId },
    { HALT: halt as NetId, GO: go as NetId, WREG: wreg },
  );

  // The next PC: PC + 4, or in the branches' stage the branch condition and a block that chooses
  // among PC + 4, the target PC + 4c and the ALU's result.
  let next = pc4;
  if (full) {
    next = b.net("NEXT", 64);
    const met = branchCondition(b, {
      ZERO: flags["ZERO"] as NetId,
      MINUS: flags["MINUS"] as NetId,
      COUT: flags["COUT"] as NetId,
      OVER: flags["OVER"] as NetId,
      J: d.J,
    });
    const ins = {
      PC: pc as NetId,
      RESULT: result,
      MET: met,
      BRANCH: ctrl["BRANCH"] as NetId,
      CALL: ctrl["CALL"] as NetId,
      JUMP: ctrl["JUMP"] as NetId,
      WIDE: wide as NetId,
    };
    b.scope(PARTS.next, "next", (bb) => nextPcParts(bb, ins, { NEXT: next, PC4: pc4 }), {
      inputs: ins,
      outputs: { NEXT: next, PC4: pc4 },
    });
  }
  wordRegister(b, PARTS.pc, { D: next, EN: go as NetId, RST: rst as NetId, CLK: clk }, pc as NetId);
  b.output("HALT", halt as NetId);
  b.output("CAUSE", stops.CAUSE);
  return b.build();
}

/**
 * The next PC's parts (the branches' stage): PC + 4; the target, PC + 4c, from the widened
 * constant times 4 and an adder; the branch condition from the flags and the job digit; TAKE, 1
 * for a branch whose condition is met or a call; and two selectors, the target or PC + 4 by TAKE,
 * then the ALU's result for a jump.
 */
export function nextPcParts(
  b: CircuitBuilder,
  ins: {
    PC: NetId;
    RESULT: NetId;
    MET: NetId;
    BRANCH: NetId;
    CALL: NetId;
    JUMP: NetId;
    WIDE: NetId;
  },
  out: { NEXT: NetId; PC4: NetId },
): void {
  wordAdder(b, PARTS.plus4, "plus4", ins.PC, undefined, out.PC4);
  const offset = timesFour(b, ins.WIDE);
  const target = b.net("TARGET", 64);
  wordAdder(b, PARTS.target, "word-adder", ins.PC, offset, target);
  const taken = b.and([ins.BRANCH, ins.MET], { name: PARTS.andTake, output: b.net("TAKEN") });
  const take = b.or([taken, ins.CALL], { name: PARTS.orTake, output: b.net("TAKE") });
  const picked = wordSelector(
    b,
    { A: out.PC4, B: target, S: take },
    { name: PARTS.pickTake, outs: { Y: b.net("TAKEPC", 64) } },
  ).Y;
  wordSelector(
    b,
    { A: picked, B: ins.RESULT, S: ins.JUMP },
    { name: PARTS.pickJump, outs: { Y: out.NEXT } },
  );
}

export type { PortNets };
