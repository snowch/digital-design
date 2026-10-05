// Module 6's memories.
//
// Two kinds, and the note for the module (docs/notes/module-6-memory.md) says why both:
//
// - **Gates**, where a learner opens the memory: `ram4` is four words, each one of Module 5's
//   registers with a load enable, Module 3's decoder turning the address into one word's load
//   enable, and a word selector picking the word the address names for Q. It opens one level at a
//   time, to its registers, a register to its flip-flops, a flip-flop to its latches. `regFile`
//   is the same registers with a second selector, so two words come out at once.
// - **A component**, everywhere a memory is larger: `memoryBlock` wraps the simulator's `memory`
//   primitive (packages/sim/src/memory.ts) in a closed block with the ports a drawing shows, and
//   `romBlock` its `rom`. Neither opens: there is nothing inside to draw but the primitive.
//
// The word selectors are closed blocks too: one Module 3 selector per bit, sharing the select
// inputs, which is the selectors lesson's word selector widened to four ways.

import type { CircuitBuilder, NetId } from "@dd/sim";
import { initParam, stateWidth } from "@dd/sim";

import { decoder2, selector2, selector4, type BlockOptions, type PortNets } from "./combinational";
import { register } from "./register";

function need(ins: PortNets, port: string): NetId {
  const n = ins[port];
  if (n === undefined) throw new RangeError(`the block needs a net for its input ${port}`);
  return n;
}

/** The bits of a word, as nets, least significant first. */
function bitsOf(b: CircuitBuilder, w: NetId, name: string): NetId[] {
  return Array.from({ length: b.widthOf(w) }, (_, i) => {
    const net = b.net(`${name}${i}`);
    b.component("bit", { a: w }, { y: net }, { name: `${name}Bit${i}`, params: { index: i } });
    return net;
  });
}

function joinBits(b: CircuitBuilder, bits: readonly NetId[], out: NetId): void {
  const ports = Object.fromEntries(bits.map((n, i) => [String.fromCharCode(97 + i), n]));
  b.component("join", ports, { y: out }, { name: "join", params: { width: bits.length } });
}

/**
 * A selector for words: Y is the input S1 S0 names (A for 00 up to D for 11), or, with two
 * inputs, A while S is 0 and B while S is 1. One Module 3 selector per bit.
 */
export function wordSelector(b: CircuitBuilder, ins: PortNets, options: BlockOptions = {}) {
  const four = ins["C"] !== undefined;
  const names = four ? ["A", "B", "C", "D"] : ["A", "B"];
  const words = names.map((n) => need(ins, n));
  const width = b.widthOf(words[0] as NetId);
  const kind = four ? "word-selector-4" : "word-selector-2";
  const y = options.outs?.["Y"] ?? b.net("Y", width);
  const selects: Record<string, NetId> = four
    ? { S1: need(ins, "S1"), S0: need(ins, "S0") }
    : { S: need(ins, "S") };
  b.scope(
    options.name ?? kind,
    kind,
    (bb) => {
      const bits = words.map((w, k) => bitsOf(bb, w, names[k] as string));
      const ys = Array.from({ length: width }, (_, i) => {
        const at = Object.fromEntries(names.map((n, k) => [n, bits[k]?.[i] as NetId]));
        const out = bb.net(`Y${i}`);
        if (four) selector4(bb, { ...at, ...selects }, { name: `sel${i}`, outs: { Y: out } });
        else selector2(bb, { ...at, ...selects }, { name: `sel${i}`, outs: { Y: out } });
        return out;
      });
      joinBits(bb, ys, y);
    },
    {
      inputs: { ...Object.fromEntries(names.map((n, k) => [n, words[k] as NetId])), ...selects },
      outputs: { Y: y },
    },
  );
  return { Y: y };
}

/**
 * A register with a load enable, as one block: Module 5's register, with D, EN and CLK in and Q
 * out. At a rising edge of CLK where EN is 1, Q takes D; where EN is 0, Q keeps its word.
 */
export function wordRegister(b: CircuitBuilder, ins: PortNets, options: BlockOptions = {}) {
  const d = need(ins, "D");
  const q = options.outs?.["Q"] ?? b.net("Q", b.widthOf(d));
  register(b, d, need(ins, "CLK"), {
    enable: need(ins, "EN"),
    name: options.name ?? "register",
    q,
  });
  return { Q: q };
}

/**
 * The four-word RAM, as gates: address A1 A0, the word to write D, the write enable WE, the clock
 * CLK, and Q, the word the address names. The decoder makes exactly one of Y0 to Y3 1; an AND gate
 * per word joins that line with WE into the word's load enable, W0 to W3, so an edge writes D into
 * the one word the address names and only while WE is 1. Reading needs no edge: the selector puts
 * the named word on Q as soon as its gates settle.
 */
export function ram4(b: CircuitBuilder, ins: PortNets, options: BlockOptions = {}) {
  const a1 = need(ins, "A1");
  const a0 = need(ins, "A0");
  const d = need(ins, "D");
  const we = need(ins, "WE");
  const clk = need(ins, "CLK");
  const width = b.widthOf(d);
  const q = options.outs?.["Q"] ?? b.net("Q", width);
  b.scope(
    options.name ?? "ram",
    "ram",
    (bb) => {
      const ys = decoder2(bb, { S1: a1, S0: a0 }, { name: "decoder" });
      const words = [0, 1, 2, 3].map((k) => {
        const en = bb.and([ys[`Y${k}`] as NetId, we], {
          name: `andW${k}`,
          output: bb.net(`W${k}`),
        });
        return wordRegister(
          bb,
          { D: d, EN: en, CLK: clk },
          { name: `word${k}`, outs: { Q: bb.net(`M${k}`, width) } },
        ).Q;
      });
      const [m0, m1, m2, m3] = words as [NetId, NetId, NetId, NetId];
      wordSelector(
        bb,
        { A: m0, B: m1, C: m2, D: m3, S1: a1, S0: a0 },
        { name: "selector", outs: { Y: q } },
      );
    },
    { inputs: { A1: a1, A0: a0, D: d, WE: we, CLK: clk }, outputs: { Q: q } },
  );
  return { Q: q };
}

/**
 * The register file of the second lesson: four words, as gates, written as the RAM is (WA1 WA0
 * name the word, WE and an edge write D into it), with two reads, each with its own address: QA
 * is the word RA1 RA0 names and QB the word RB1 RB0 names. Two selectors on the same registers.
 */
export function regFile4(b: CircuitBuilder, ins: PortNets, options: BlockOptions = {}) {
  const [wa1, wa0, d, we, clk, ra1, ra0, rb1, rb0] = [
    "WA1",
    "WA0",
    "D",
    "WE",
    "CLK",
    "RA1",
    "RA0",
    "RB1",
    "RB0",
  ].map((p) => need(ins, p)) as NetId[];
  const width = b.widthOf(d as NetId);
  const qa = options.outs?.["QA"] ?? b.net("QA", width);
  const qb = options.outs?.["QB"] ?? b.net("QB", width);
  b.scope(
    options.name ?? "regfile",
    "register-file",
    (bb) => {
      const ys = decoder2(bb, { S1: wa1 as NetId, S0: wa0 as NetId }, { name: "decoder" });
      const words = [0, 1, 2, 3].map((k) => {
        const en = bb.and([ys[`Y${k}`] as NetId, we as NetId], {
          name: `andW${k}`,
          output: bb.net(`W${k}`),
        });
        return wordRegister(
          bb,
          { D: d as NetId, EN: en, CLK: clk as NetId },
          { name: `word${k}`, outs: { Q: bb.net(`M${k}`, width) } },
        ).Q;
      });
      const [m0, m1, m2, m3] = words as [NetId, NetId, NetId, NetId];
      wordSelector(
        bb,
        { A: m0, B: m1, C: m2, D: m3, S1: ra1 as NetId, S0: ra0 as NetId },
        { name: "selectA", outs: { Y: qa } },
      );
      wordSelector(
        bb,
        { A: m0, B: m1, C: m2, D: m3, S1: rb1 as NetId, S0: rb0 as NetId },
        { name: "selectB", outs: { Y: qb } },
      );
    },
    {
      inputs: {
        WA1: wa1 as NetId,
        WA0: wa0 as NetId,
        D: d as NetId,
        WE: we as NetId,
        CLK: clk as NetId,
        RA1: ra1 as NetId,
        RA0: ra0 as NetId,
        RB1: rb1 as NetId,
        RB0: rb0 as NetId,
      },
      outputs: { QA: qa, QB: qb },
    },
  );
  return { QA: qa, QB: qb };
}

export interface MemoryOptions {
  readonly name?: string;
  /** How many words, and how many bits each. */
  readonly words: number;
  readonly width: number;
  /** The list of values it is filled with, lowest address first; otherwise it starts unknown. */
  readonly init?: readonly (bigint | number)[];
  /** The output nets, by port name, instead of new ones. */
  readonly outs?: Readonly<Partial<Record<string, NetId>>>;
}

/**
 * A memory as a component, closed: written at a rising edge of CLK where WE is 1, at the address
 * on A (or WA), with D; read with no clock at A (one read) or at each of R0, R1, ... The ports
 * a drawing shows are those; the loop that holds the words is inside the block.
 */
export function memoryBlock(
  b: CircuitBuilder,
  ins: { CLK: NetId; WE: NetId; D: NetId; A?: NetId; WA?: NetId; reads?: readonly NetId[] },
  options: MemoryOptions,
) {
  const write = ins.WA ?? ins.A;
  if (write === undefined) throw new RangeError("a memory needs a write address, A or WA");
  const reads = ins.reads ?? [write];
  const single = ins.A !== undefined && ins.reads === undefined;
  const qs = reads.map(
    (_, i) =>
      options.outs?.[single ? "Q" : `Q${i}`] ?? b.net(single ? "Q" : `Q${i}`, options.width),
  );
  b.scope(
    options.name ?? "memory",
    "memory",
    (bb) => {
      const state = bb.net("state", stateWidth(options));
      const last = bb.net("last");
      const inputs: Record<string, NetId> = { CLK: ins.CLK, WE: ins.WE, WA: write, D: ins.D };
      reads.forEach((r, i) => {
        inputs[`R${i}`] = r;
      });
      const outputs: Record<string, NetId> = { stateNext: state, lastNext: last };
      qs.forEach((q, i) => {
        outputs[`Q${i}`] = q;
      });
      bb.component("memory", { ...inputs, state, last }, outputs, {
        name: "cells",
        params: {
          words: options.words,
          width: options.width,
          reads: reads.length,
          ...(options.init ? { init: initParam(options.init) } : {}),
        },
      });
    },
    {
      inputs: single
        ? { A: write, D: ins.D, WE: ins.WE, CLK: ins.CLK }
        : {
            WA: write,
            D: ins.D,
            WE: ins.WE,
            CLK: ins.CLK,
            ...Object.fromEntries(reads.map((r, i) => [`R${i}`, r])),
          },
      outputs: single ? { Q: qs[0] as NetId } : Object.fromEntries(qs.map((q, i) => [`Q${i}`, q])),
    },
  );
  return single ? { Q: qs[0] as NetId } : Object.fromEntries(qs.map((q, i) => [`Q${i}`, q]));
}

/** A ROM as a component, closed: each Q is the word at its address, from the list it was filled with. */
export function romBlock(
  b: CircuitBuilder,
  ins: { A?: NetId; reads?: readonly NetId[] },
  options: MemoryOptions & { init: readonly (bigint | number)[] },
) {
  const single = ins.A !== undefined;
  const reads = single ? [ins.A as NetId] : (ins.reads ?? []);
  const qs = reads.map(
    (_, i) =>
      options.outs?.[single ? "Q" : `Q${i}`] ?? b.net(single ? "Q" : `Q${i}`, options.width),
  );
  b.scope(
    options.name ?? "rom",
    "rom",
    (bb) => {
      bb.component(
        "rom",
        Object.fromEntries(reads.map((r, i) => [`R${i}`, r])),
        Object.fromEntries(qs.map((q, i) => [`Q${i}`, q])),
        {
          name: "cells",
          params: {
            words: options.words,
            width: options.width,
            reads: reads.length,
            init: initParam(options.init),
          },
        },
      );
    },
    single
      ? { inputs: { A: reads[0] as NetId }, outputs: { Q: qs[0] as NetId } }
      : {
          inputs: Object.fromEntries(reads.map((r, i) => [`R${i}`, r])),
          outputs: Object.fromEntries(qs.map((q, i) => [`Q${i}`, q])),
        },
  );
  return single ? { Q: qs[0] as NetId } : Object.fromEntries(qs.map((q, i) => [`Q${i}`, q]));
}
