// Copyright © 2026 Chris Snow

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
export function wordSelector(
  b: CircuitBuilder,
  ins: PortNets,
  options: BlockOptions & { readonly kind?: string } = {},
) {
  const four = ins["C"] !== undefined;
  const names = four ? ["A", "B", "C", "D"] : ["A", "B"];
  const words = names.map((n) => need(ins, n));
  const width = b.widthOf(words[0] as NetId);
  const kind = options.kind ?? (four ? "word-selector-4" : "word-selector-2");
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
  // The same block serves a register read back from a drawing (Module 5's), which keeps the
  // reset and the enable it was built with: each is wired only if the drawing gives it.
  register(b, d, need(ins, "CLK"), {
    ...(ins["EN"] !== undefined ? { enable: ins["EN"] } : {}),
    ...(ins["RST"] !== undefined ? { reset: ins["RST"] } : {}),
    name: options.name ?? "register",
    q,
  });
  return { Q: q };
}

/**
 * A 16-bit register as a closed block: Module 5's register inside, which a learner does not open
 * here, since sixteen flip-flops drawn at once teach nothing the four-bit one did not.
 */
export function wideRegister(b: CircuitBuilder, ins: PortNets, options: BlockOptions = {}) {
  const d = need(ins, "D");
  const en = need(ins, "EN");
  const clk = need(ins, "CLK");
  const q = options.outs?.["Q"] ?? b.net("Q", b.widthOf(d));
  b.scope(
    options.name ?? "word-register-16",
    "word-register-16",
    (bb) => {
      wordRegister(bb, { D: d, EN: en, CLK: clk }, { name: "register", outs: { Q: q } });
    },
    { inputs: { D: d, EN: en, CLK: clk }, outputs: { Q: q } },
  );
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

/**
 * A register file of any size, as a component: `words` words of `width` bits, written as a memory
 * is (WA, D, WE and an edge) and read at two addresses at once, RA and RB, onto QA and QB. The
 * gates of a small one are `regFile4`; this is the one a larger design uses.
 */
export function registerFile(
  b: CircuitBuilder,
  ins: { CLK: NetId; WE: NetId; WA: NetId; D: NetId; RA: NetId; RB: NetId },
  options: MemoryOptions,
) {
  const out = memoryBlock(
    b,
    { CLK: ins.CLK, WE: ins.WE, WA: ins.WA, D: ins.D, reads: [ins.RA, ins.RB] },
    {
      ...options,
      name: options.name ?? "regfile",
      outs: {
        ...(options.outs?.["QA"] !== undefined ? { Q0: options.outs["QA"] } : {}),
        ...(options.outs?.["QB"] !== undefined ? { Q1: options.outs["QB"] } : {}),
      },
    },
  );
  return { QA: out["Q0"] as NetId, QB: out["Q1"] as NetId };
}

/** A byte address split, as a closed block: the row (A3 A2 A1) and A0, which picks the bank. */
function splitAddress(b: CircuitBuilder, a: NetId): { row: NetId; a0: NetId } {
  const row = b.net("ROW", 3);
  const a0 = b.net("A0");
  b.scope(
    "splitA",
    "split-address",
    (bb) => {
      bb.component("slice", { a }, { y: row }, { name: "row", params: { hi: 3, lo: 1 } });
      bb.component("bit", { a }, { y: a0 }, { name: "a0", params: { index: 0 } });
    },
    { inputs: { A: a }, outputs: { ROW: row, A0: a0 } },
  );
  return { row, a0 };
}

/** A 16-bit word split into its two bytes, as a closed block. */
function splitBytes(b: CircuitBuilder, w: NetId): { hi: NetId; lo: NetId } {
  const hi = b.net("DH", 8);
  const lo = b.net("DL", 8);
  b.scope(
    "splitD",
    "split-bytes",
    (bb) => {
      bb.component("slice", { a: w }, { y: hi }, { name: "hi", params: { hi: 15, lo: 8 } });
      bb.component("slice", { a: w }, { y: lo }, { name: "lo", params: { hi: 7, lo: 0 } });
    },
    { inputs: { W: w }, outputs: { HI: hi, LO: lo } },
  );
  return { hi, lo };
}

/** Two bytes joined into a 16-bit word, the high byte on top, as a closed block. */
function joinBytes(b: CircuitBuilder, hi: NetId, lo: NetId, w: NetId): void {
  b.scope(
    "joinQ",
    "join-bytes",
    (bb) => {
      bb.component("join", { a: lo, b: hi }, { y: w }, { name: "join", params: { width: 16 } });
    },
    { inputs: { HI: hi, LO: lo }, outputs: { W: w } },
  );
}

/**
 * Lesson 6.3's memory of bytes: sixteen bytes in two banks of eight, the even addresses in one and
 * the odd in the other, so a 16-bit word at an even address is one row of both banks, its low byte
 * at the even address. A is the byte's address; WORD 1 asks for a word, 0 for a byte. A byte comes
 * out on Q's low eight bits, with the high eight 0; a word comes out whole. A word whose address is
 * odd would need two rows: ODD says so, a write then changes nothing, and a read gives the word at
 * the even address below, since the banks see only the row. A ROM of bytes (`rom` true) is the same
 * without the write.
 */
export function byteMemory(
  b: CircuitBuilder,
  ins: { A: NetId; WORD: NetId; D?: NetId; WE?: NetId; CLK?: NetId },
  options: {
    readonly name?: string;
    readonly kind?: string;
    /** The sixteen bytes it is filled with, lowest address first. */
    readonly init?: readonly (bigint | number)[];
    readonly outs?: Readonly<Partial<Record<string, NetId>>>;
  } = {},
) {
  const rom = ins.WE === undefined;
  const kind = options.kind ?? (rom ? "byte-rom" : "byte-memory");
  const q = options.outs?.["Q"] ?? b.net("Q", 16);
  const odd = options.outs?.["ODD"] ?? b.net("ODD");
  const evens = options.init?.filter((_, k) => k % 2 === 0);
  const odds = options.init?.filter((_, k) => k % 2 === 1);
  b.scope(
    options.name ?? kind,
    kind,
    (bb) => {
      const { row, a0 } = splitAddress(bb, ins.A);
      bb.and([ins.WORD, a0], { name: "andOdd", output: odd });
      let qe: NetId;
      let qo: NetId;
      if (rom) {
        qe = romBlock(
          bb,
          { A: row },
          { name: "even", words: 8, width: 8, init: evens ?? [], outs: { Q: bb.net("QE", 8) } },
        ).Q as NetId;
        qo = romBlock(
          bb,
          { A: row },
          { name: "odd", words: 8, width: 8, init: odds ?? [], outs: { Q: bb.net("QO", 8) } },
        ).Q as NetId;
      } else {
        const d = ins.D as NetId;
        const { hi, lo } = splitBytes(bb, d);
        const na0 = bb.not(a0, { name: "notA0", output: bb.net("NA0") });
        const weE = bb.and([ins.WE as NetId, na0], { name: "andEven", output: bb.net("WEE") });
        const pick = bb.xor([ins.WORD, a0], { name: "xorOdd", output: bb.net("PICK") });
        const weO = bb.and([ins.WE as NetId, pick], { name: "andOddWE", output: bb.net("WEO") });
        const dOdd = wordSelector(
          bb,
          { A: lo, B: hi, S: ins.WORD },
          { name: "selD", outs: { Y: bb.net("DO", 8) } },
        ).Y;
        qe = memoryBlock(
          bb,
          { A: row, D: lo, WE: weE, CLK: ins.CLK as NetId },
          {
            name: "even",
            words: 8,
            width: 8,
            ...(evens ? { init: evens } : {}),
            outs: { Q: bb.net("QE", 8) },
          },
        ).Q as NetId;
        qo = memoryBlock(
          bb,
          { A: row, D: dOdd, WE: weO, CLK: ins.CLK as NetId },
          {
            name: "odd",
            words: 8,
            width: 8,
            ...(odds ? { init: odds } : {}),
            outs: { Q: bb.net("QO", 8) },
          },
        ).Q as NetId;
      }
      const byte = wordSelector(
        bb,
        { A: qe, B: qo, S: a0 },
        { name: "selByte", outs: { Y: bb.net("BYTE", 8) } },
      ).Y;
      const low = wordSelector(
        bb,
        { A: byte, B: qe, S: ins.WORD },
        { name: "selLow", outs: { Y: bb.net("LOW", 8) } },
      ).Y;
      const zero = bb.net("ZERO", 8);
      bb.component("const", {}, { y: zero }, { name: "zero", params: { width: 8, value: "0" } });
      const high = wordSelector(
        bb,
        { A: zero, B: qo, S: ins.WORD },
        { name: "selHigh", outs: { Y: bb.net("HIGH", 8) } },
      ).Y;
      joinBytes(bb, high, low, q);
    },
    {
      inputs: rom
        ? { A: ins.A, WORD: ins.WORD }
        : {
            A: ins.A,
            WORD: ins.WORD,
            D: ins.D as NetId,
            WE: ins.WE as NetId,
            CLK: ins.CLK as NetId,
          },
      outputs: { Q: q, ODD: odd },
    },
  );
  return { Q: q, ODD: odd };
}

/** Lesson 6.4's table, fixed when the shop's memory is made: eight 16-bit words, as 16 bytes. */
export const SHOP_TABLE_WORDS: readonly number[] = [
  0xff06, 0xff4c, 0x0014, 0x0032, 0xff6a, 0xff88, 0x0050, 0x0064,
];

/** Words as the bytes a memory of bytes keeps them in: each word's low byte first. */
export function bytesOfWords(words: readonly number[]): number[] {
  return words.flatMap((w) => [w & 0xff, (w >> 8) & 0xff]);
}

/**
 * Lesson 6.4's memory of the shop: a six-bit byte address, A5 A4 on two pins and A3 to A0 on A.
 * Module 3's decoder reads A5 A4 and gives each part a quarter of the addresses: 00 the ROM of the
 * table, 01 the RAM (a memory of bytes), 10 the display (a 16-bit register: a write anywhere there
 * sets it, a read gives it back), 11 the sensor (a read gives the reading on SENSOR; a write does
 * nothing). Q is the word or byte the address names; DISPLAY is what the display shows.
 */
export function shopMemory(
  b: CircuitBuilder,
  ins: PortNets,
  options: BlockOptions & { readonly table?: readonly number[] } = {},
) {
  const [a5, a4, a, d, word, we, clk, sensor] = [
    "A5",
    "A4",
    "A",
    "D",
    "WORD",
    "WE",
    "CLK",
    "SENSOR",
  ].map((p) => need(ins, p)) as NetId[];
  const q = options.outs?.["Q"] ?? b.net("Q", 16);
  const display = options.outs?.["DISPLAY"] ?? b.net("DISPLAY", 16);
  b.scope(
    options.name ?? "shop",
    "shop-memory",
    (bb) => {
      const ys = decoder2(bb, { S1: a5 as NetId, S0: a4 as NetId }, { name: "decoder" });
      const rom = byteMemory(
        bb,
        { A: a as NetId, WORD: word as NetId },
        {
          name: "rom",
          init: bytesOfWords(options.table ?? SHOP_TABLE_WORDS),
          outs: { Q: bb.net("QROM", 16), ODD: bb.net("ODDROM") },
        },
      );
      const weRam = bb.and([ys["Y1"] as NetId, we as NetId], {
        name: "andRam",
        output: bb.net("WERAM"),
      });
      const ram = byteMemory(
        bb,
        { A: a as NetId, WORD: word as NetId, D: d as NetId, WE: weRam, CLK: clk as NetId },
        { name: "ram", outs: { Q: bb.net("QRAM", 16), ODD: bb.net("ODDRAM") } },
      );
      const enDisplay = bb.and([ys["Y2"] as NetId, we as NetId], {
        name: "andDisplay",
        output: bb.net("WEDISP"),
      });
      wideRegister(
        bb,
        { D: d as NetId, EN: enDisplay, CLK: clk as NetId },
        { name: "display", outs: { Q: display } },
      );
      wordSelector(
        bb,
        { A: rom.Q, B: ram.Q, C: display, D: sensor as NetId, S1: a5 as NetId, S0: a4 as NetId },
        { name: "selector", outs: { Y: q } },
      );
    },
    {
      inputs: {
        A5: a5 as NetId,
        A4: a4 as NetId,
        A: a as NetId,
        D: d as NetId,
        WORD: word as NetId,
        WE: we as NetId,
        CLK: clk as NetId,
        SENSOR: sensor as NetId,
      },
      outputs: { Q: q, DISPLAY: display },
    },
  );
  return { Q: q, DISPLAY: display };
}

/** The table ROM as a block a drawing may place: A and WORD in, Q and ODD out. */
export function tableRom(b: CircuitBuilder, ins: PortNets, options: BlockOptions = {}) {
  return byteMemory(
    b,
    { A: need(ins, "A"), WORD: need(ins, "WORD") },
    {
      name: options.name ?? "table-rom",
      kind: "table-rom",
      init: bytesOfWords(SHOP_TABLE_WORDS),
      ...(options.outs ? { outs: options.outs } : {}),
    },
  );
}

/** The memory of bytes as a block a drawing may place. */
export function byteMemoryPart(b: CircuitBuilder, ins: PortNets, options: BlockOptions = {}) {
  return byteMemory(
    b,
    {
      A: need(ins, "A"),
      WORD: need(ins, "WORD"),
      D: need(ins, "D"),
      WE: need(ins, "WE"),
      CLK: need(ins, "CLK"),
    },
    { name: options.name ?? "byte-memory", ...(options.outs ? { outs: options.outs } : {}) },
  );
}
