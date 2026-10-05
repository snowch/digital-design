// Module 3's combinational blocks, built from gates and from each other.
//
// Every block here is a scope in the netlist, so a view draws it closed, as one box with its
// ports, and opens it in place: a 4-way selector opens to three 2-way selectors, each of which
// opens to its gates; a full adder opens to two half adders and an OR gate. Nothing here uses the
// simulator's `mux2` primitive: where a lesson shows a selector, it is the gates the learner
// builds.
//
// `BLOCKS` lists the blocks a drawing may place, with their ports, so the drawing editor can
// compile a block the learner put down without knowing what is inside it.

import type { CircuitBuilder, NetId } from "@dd/sim";

import { register } from "./register";

/** Nets for a block's ports, by port name. */
export type PortNets = Readonly<Record<string, NetId>>;

export interface BlockOptions {
  /** The instance name; the block's kind when omitted. */
  readonly name?: string;
  /** Existing nets the block's outputs should drive, by port name, instead of new ones. */
  readonly outs?: Readonly<Partial<Record<string, NetId>>>;
}

export interface BlockDef {
  readonly kind: string;
  /** Input ports, in drawing order (top to bottom). */
  readonly inputs: readonly string[];
  readonly outputs: readonly string[];
  /** Ports wider than one bit, by name. */
  readonly widths?: Readonly<Record<string, number>>;
  /** Builds the block from its input nets; returns its output nets by port name. */
  build(b: CircuitBuilder, ins: PortNets, options?: BlockOptions): Record<string, NetId>;
}

function outNet(b: CircuitBuilder, options: BlockOptions, port: string, width = 1): NetId {
  return options.outs?.[port] ?? b.net(port, width);
}

function need(ins: PortNets, port: string): NetId {
  const n = ins[port];
  if (n === undefined) throw new RangeError(`the block needs a net for its input ${port}`);
  return n;
}

/**
 * The 2-way selector: Y is A while S is 0 and B while S is 1. Two AND gates each pass one input
 * or block it, a NOT gate makes sure exactly one of them passes, and an OR gate joins them:
 * Y = (A AND NOT S) OR (B AND S).
 */
export function selector2(b: CircuitBuilder, ins: PortNets, options: BlockOptions = {}) {
  const s = need(ins, "S");
  const a = need(ins, "A");
  const bIn = need(ins, "B");
  const y = outNet(b, options, "Y");
  b.scope(
    options.name ?? "selector-2",
    "selector-2",
    (bb) => {
      const ns = bb.not(s, { name: "notS", output: bb.net("NS") });
      const pa = bb.and([a, ns], { name: "andA", output: bb.net("PA") });
      const pb = bb.and([bIn, s], { name: "andB", output: bb.net("PB") });
      bb.or([pa, pb], { name: "orY", output: y });
    },
    { inputs: { A: a, B: bIn, S: s }, outputs: { Y: y } },
  );
  return { Y: y };
}

/**
 * The 4-way selector, from three 2-way selectors: S0 chooses within each pair (A or B, C or D)
 * and S1 chooses between the pairs. Read S1 S0 as a number: 0 picks A, 1 B, 2 C, 3 D.
 */
export function selector4(b: CircuitBuilder, ins: PortNets, options: BlockOptions = {}) {
  const [a, bIn, c, d, s1, s0] = ["A", "B", "C", "D", "S1", "S0"].map((p) => need(ins, p)) as [
    NetId,
    NetId,
    NetId,
    NetId,
    NetId,
    NetId,
  ];
  const y = outNet(b, options, "Y");
  b.scope(
    options.name ?? "selector-4",
    "selector-4",
    (bb) => {
      const ab = selector2(
        bb,
        { S: s0, A: a, B: bIn },
        { name: "selAB", outs: { Y: bb.net("AB") } },
      );
      const cd = selector2(bb, { S: s0, A: c, B: d }, { name: "selCD", outs: { Y: bb.net("CD") } });
      selector2(bb, { S: s1, A: ab.Y, B: cd.Y }, { name: "selOut", outs: { Y: y } });
    },
    { inputs: { A: a, B: bIn, C: c, D: d, S1: s1, S0: s0 }, outputs: { Y: y } },
  );
  return { Y: y };
}

/**
 * The 2-to-4 decoder: exactly one of Y0 to Y3 is 1, the one whose number S1 S0 spells. Each
 * output is one AND gate that is 1 for one pattern of S1 and S0 alone.
 */
export function decoder2(b: CircuitBuilder, ins: PortNets, options: BlockOptions = {}) {
  const s1 = need(ins, "S1");
  const s0 = need(ins, "S0");
  const ys = [0, 1, 2, 3].map((k) => outNet(b, options, `Y${k}`));
  b.scope(
    options.name ?? "decoder-2",
    "decoder-2",
    (bb) => {
      const n1 = bb.not(s1, { name: "notS1", output: bb.net("NS1") });
      const n0 = bb.not(s0, { name: "notS0", output: bb.net("NS0") });
      const pick = [
        [n1, n0],
        [n1, s0],
        [s1, n0],
        [s1, s0],
      ] as const;
      pick.forEach(([hi, lo], k) => {
        bb.and([hi, lo], { name: `and${k}`, output: ys[k] as NetId });
      });
    },
    {
      inputs: { S1: s1, S0: s0 },
      outputs: Object.fromEntries(ys.map((n, k) => [`Y${k}`, n])),
    },
  );
  return Object.fromEntries(ys.map((n, k) => [`Y${k}`, n]));
}

/**
 * The 1-to-4 demultiplexer: IN goes to the output S1 S0 names; the others are 0. A decoder picks
 * the output, and an AND gate on each of its lines lets IN through to that output alone.
 */
export function demux4(b: CircuitBuilder, ins: PortNets, options: BlockOptions = {}) {
  const input = need(ins, "IN");
  const s1 = need(ins, "S1");
  const s0 = need(ins, "S0");
  const ys = [0, 1, 2, 3].map((k) => outNet(b, options, `Y${k}`));
  b.scope(
    options.name ?? "demux-4",
    "demux-4",
    (bb) => {
      const lines = decoder2(
        bb,
        { S1: s1, S0: s0 },
        {
          name: "dec",
          outs: Object.fromEntries([0, 1, 2, 3].map((k) => [`Y${k}`, bb.net(`L${k}`)])),
        },
      );
      [0, 1, 2, 3].forEach((k) => {
        bb.and([input, lines[`Y${k}`] as NetId], { name: `and${k}`, output: ys[k] as NetId });
      });
    },
    {
      inputs: { IN: input, S1: s1, S0: s0 },
      outputs: Object.fromEntries(ys.map((n, k) => [`Y${k}`, n])),
    },
  );
  return Object.fromEntries(ys.map((n, k) => [`Y${k}`, n]));
}

/**
 * The 4-to-2 encoder: the number of the one line that is 1, as S1 S0. S1 is 1 for lines 2 and 3,
 * S0 for lines 1 and 3, so line 0 drives nothing: with no line at 1 the answer is 0 as well. With
 * two lines at 1 the bits of both numbers mix (lines 1 and 2 give 3).
 */
export function encoder4(b: CircuitBuilder, ins: PortNets, options: BlockOptions = {}) {
  const ls = [0, 1, 2, 3].map((k) => need(ins, `L${k}`));
  const s1 = outNet(b, options, "S1");
  const s0 = outNet(b, options, "S0");
  b.scope(
    options.name ?? "encoder-4",
    "encoder-4",
    (bb) => {
      bb.or([ls[2] as NetId, ls[3] as NetId], { name: "orS1", output: s1 });
      bb.or([ls[1] as NetId, ls[3] as NetId], { name: "orS0", output: s0 });
    },
    {
      inputs: Object.fromEntries(ls.map((n, k) => [`L${k}`, n])),
      outputs: { S1: s1, S0: s0 },
    },
  );
  return { S1: s1, S0: s0 };
}

/**
 * The equality comparator for two words of `width` bits: an XOR gate per bit is 1 where the words
 * differ, and a NOR gate over all of them is 1 only when no bit differs.
 */
export function equalWords(
  b: CircuitBuilder,
  ins: PortNets,
  options: BlockOptions & { width?: number } = {},
) {
  const a = need(ins, "A");
  const bIn = need(ins, "B");
  const width = options.width ?? b.widthOf(a);
  const eq = outNet(b, options, "EQ");
  b.scope(
    options.name ?? "comparator",
    "comparator",
    (bb) => {
      const diffs: NetId[] = [];
      for (let i = width - 1; i >= 0; i--) {
        const ai = bb.net(`A${i}`);
        const bi = bb.net(`B${i}`);
        bb.component("bit", { a }, { y: ai }, { name: `bitA${i}`, params: { index: i } });
        bb.component("bit", { a: bIn }, { y: bi }, { name: `bitB${i}`, params: { index: i } });
        diffs.push(bb.xor([ai, bi], { name: `xor${i}`, output: bb.net(`D${i}`) }));
      }
      bb.nor(diffs, { name: "norEq", output: eq });
    },
    { inputs: { A: a, B: bIn }, outputs: { EQ: eq } },
  );
  return { EQ: eq };
}

/** The half adder: SUM = A XOR B, CARRY = A AND B. Two bits in, their total as two bits out. */
export function halfAdder(b: CircuitBuilder, ins: PortNets, options: BlockOptions = {}) {
  const a = need(ins, "A");
  const bIn = need(ins, "B");
  const sum = outNet(b, options, "SUM");
  const carry = outNet(b, options, "CARRY");
  b.scope(
    options.name ?? "half-adder",
    "half-adder",
    (bb) => {
      bb.xor([a, bIn], { name: "xorSum", output: sum });
      bb.and([a, bIn], { name: "andCarry", output: carry });
    },
    { inputs: { A: a, B: bIn }, outputs: { SUM: sum, CARRY: carry } },
  );
  return { SUM: sum, CARRY: carry };
}

/**
 * The full adder, from two half adders and an OR gate: the first adds A and B, the second adds
 * CIN to that sum, and COUT is 1 when either made a carry. The two carries are never both 1.
 */
export function fullAdder(b: CircuitBuilder, ins: PortNets, options: BlockOptions = {}) {
  const a = need(ins, "A");
  const bIn = need(ins, "B");
  const cin = need(ins, "CIN");
  const sum = outNet(b, options, "SUM");
  const cout = outNet(b, options, "COUT");
  b.scope(
    options.name ?? "full-adder",
    "full-adder",
    (bb) => {
      const first = halfAdder(
        bb,
        { A: a, B: bIn },
        { name: "ha1", outs: { SUM: bb.net("S1"), CARRY: bb.net("C1") } },
      );
      const second = halfAdder(
        bb,
        { A: first.SUM, B: cin },
        { name: "ha2", outs: { SUM: sum, CARRY: bb.net("C2") } },
      );
      bb.or([first.CARRY, second.CARRY], { name: "orCarry", output: cout });
    },
    { inputs: { A: a, B: bIn, CIN: cin }, outputs: { SUM: sum, COUT: cout } },
  );
  return { SUM: sum, COUT: cout };
}

/**
 * A ripple adder of `width` bits: one full adder per bit, each one's COUT the next one's CIN, so
 * a carry made in bit 0 can travel ("ripple") all the way to COUT. Bit 0 takes CIN.
 */
export function rippleAdder(
  b: CircuitBuilder,
  ins: PortNets,
  options: BlockOptions & { width?: number } = {},
) {
  const a = need(ins, "A");
  const bIn = need(ins, "B");
  const cin = need(ins, "CIN");
  const width = options.width ?? b.widthOf(a);
  const sum = outNet(b, options, "SUM", width);
  const cout = outNet(b, options, "COUT");
  b.scope(
    options.name ?? "adder",
    "adder",
    (bb) => {
      let carry = cin;
      const sums: NetId[] = [];
      for (let i = 0; i < width; i++) {
        const ai = bb.net(`A${i}`);
        const bi = bb.net(`B${i}`);
        bb.component("bit", { a }, { y: ai }, { name: `bitA${i}`, params: { index: i } });
        bb.component("bit", { a: bIn }, { y: bi }, { name: `bitB${i}`, params: { index: i } });
        const last = i === width - 1;
        const fa = fullAdder(
          bb,
          { A: ai, B: bi, CIN: carry },
          {
            name: `fa${i}`,
            outs: { SUM: bb.net(`S${i}`), COUT: last ? cout : bb.net(`C${i + 1}`) },
          },
        );
        sums.push(fa.SUM);
        carry = fa.COUT;
      }
      bb.component(
        "join",
        Object.fromEntries(sums.map((n, i) => [String.fromCharCode(97 + i), n])),
        { y: sum },
        { name: "join", params: { width } },
      );
    },
    { inputs: { A: a, B: bIn, CIN: cin }, outputs: { SUM: sum, COUT: cout } },
  );
  return { SUM: sum, COUT: cout };
}

/**
 * One bit of the course's ALU. OP1 OP0 choose the job: 00 A AND B, 01 A XOR B, 10 A + B,
 * 11 A - B. Subtraction adds NOT B: an XOR gate turns B over when OP1 and OP0 are both 1, and the
 * slice for bit 0 is given a carry in of 1 by the ALU around it. A 4-way selector picks the job's
 * result; COUT is the full adder's, whatever the job.
 */
export function aluSlice(b: CircuitBuilder, ins: PortNets, options: BlockOptions = {}) {
  const [a, bIn, cin, op1, op0] = ["A", "B", "CIN", "OP1", "OP0"].map((p) => need(ins, p)) as [
    NetId,
    NetId,
    NetId,
    NetId,
    NetId,
  ];
  const y = outNet(b, options, "Y");
  const cout = outNet(b, options, "COUT");
  b.scope(
    options.name ?? "alu-slice",
    "alu-slice",
    (bb) => {
      const both = bb.and([a, bIn], { name: "andAB", output: bb.net("AND") });
      const either = bb.xor([a, bIn], { name: "xorAB", output: bb.net("XOR") });
      const sub = bb.and([op1, op0], { name: "andSub", output: bb.net("SUB") });
      const bx = bb.xor([bIn, sub], { name: "xorB", output: bb.net("BX") });
      const fa = fullAdder(
        bb,
        { A: a, B: bx, CIN: cin },
        { name: "fa", outs: { SUM: bb.net("SUM"), COUT: cout } },
      );
      selector4(
        bb,
        { A: both, B: either, C: fa.SUM, D: fa.SUM, S1: op1, S0: op0 },
        { name: "pick", outs: { Y: y } },
      );
    },
    { inputs: { A: a, B: bIn, CIN: cin, OP1: op1, OP0: op0 }, outputs: { Y: y, COUT: cout } },
  );
  return { Y: y, COUT: cout };
}

/**
 * A word split into its bits, bit 3 at the top: a drawing's way to reach one bit of a bus. The
 * ports are b3 to b0, not 3 to 0: an object keeps number-like keys in rising order, and a drawing
 * lists a block's ports in its keys' order.
 */
export function split4(b: CircuitBuilder, ins: PortNets, options: BlockOptions = {}) {
  const w = need(ins, "W");
  const bits = [3, 2, 1, 0].map((i) => [`b${i}`, outNet(b, options, `b${i}`)] as const);
  b.scope(
    options.name ?? "split-4",
    "split-4",
    (bb) => {
      for (const [port, net] of bits)
        bb.component(
          "bit",
          { a: w },
          { y: net },
          { name: port, params: { index: Number(port.slice(1)) } },
        );
    },
    { inputs: { W: w }, outputs: Object.fromEntries(bits) },
  );
  return Object.fromEntries(bits);
}

/** Four bits joined into a word, bit 3 at the top: the other end of `split4`. */
export function join4(b: CircuitBuilder, ins: PortNets, options: BlockOptions = {}) {
  const bits = [3, 2, 1, 0].map((i) => need(ins, `b${i}`));
  const w = outNet(b, options, "W", 4);
  b.scope(
    options.name ?? "join-4",
    "join-4",
    (bb) => {
      // The join primitive's port a is bit 0.
      const ports = Object.fromEntries(
        [...bits].reverse().map((n, i) => [String.fromCharCode(97 + i), n]),
      );
      bb.component("join", ports, { y: w }, { name: "join", params: { width: 4 } });
    },
    {
      inputs: Object.fromEntries(bits.map((n, k) => [`b${3 - k}`, n])),
      outputs: { W: w },
    },
  );
  return { W: w };
}

const def = (
  kind: string,
  inputs: readonly string[],
  outputs: readonly string[],
  build: BlockDef["build"],
  widths?: Record<string, number>,
): BlockDef => ({ kind, inputs, outputs, build, ...(widths ? { widths } : {}) });

/** The blocks a drawing may place, by kind. */
export const BLOCKS: Readonly<Record<string, BlockDef>> = {
  "selector-2": def("selector-2", ["A", "B", "S"], ["Y"], selector2),
  "selector-4": def("selector-4", ["A", "B", "C", "D", "S1", "S0"], ["Y"], selector4),
  "decoder-2": def("decoder-2", ["S1", "S0"], ["Y0", "Y1", "Y2", "Y3"], decoder2),
  "half-adder": def("half-adder", ["A", "B"], ["SUM", "CARRY"], halfAdder),
  "full-adder": def("full-adder", ["A", "B", "CIN"], ["SUM", "COUT"], fullAdder),
  "split-4": def("split-4", ["W"], ["b3", "b2", "b1", "b0"], split4, { W: 4 }),
  "join-4": def("join-4", ["b3", "b2", "b1", "b0"], ["W"], join4, { W: 4 }),
  // Module 5: a 4-bit register with a reset and a load enable, as the registers lesson built it.
  "register-4-reset-enable": def(
    "register-4-reset-enable",
    ["D", "CLK", "RST", "EN"],
    ["Q"],
    (b, ins, options = {}) => {
      const q = register(b, need(ins, "D"), need(ins, "CLK"), {
        name: options.name ?? "register",
        width: 4,
        reset: need(ins, "RST"),
        enable: need(ins, "EN"),
        ...(options.outs?.["Q"] !== undefined ? { q: options.outs["Q"] } : {}),
      }).q;
      return { Q: q };
    },
    { D: 4, Q: 4 },
  ),
};

/** The width of a block's port: 1 unless the block says otherwise. */
export function blockPortWidth(kind: string, port: string): number {
  return BLOCKS[kind]?.widths?.[port] ?? 1;
}
