// Copyright © 2026 Christopher Snow

// Module 7: the course's ALU. Eight jobs on two words, four flags, any width.
//
// The jobs keep Module 3's four and their codes, under a third select input, OP2:
//
//   OP2 OP1 OP0   job
//    0   0   0    A AND B
//    0   0   1    A XOR B
//    0   1   0    A + B
//    0   1   1    A - B
//    1   0   0    A OR B
//    1   0   1    B          (B copied through)
//    1   1   0    A + 1      (count up)
//    1   1   1    A - 1      (count down)
//
// OP1 says arithmetic (1) or bit by bit (0). Every arithmetic job is one addition: A plus a second
// word D plus a carry into bit 0. OP0 turns D over (B or NOT B; all 0s or all 1s), OP2 says whether
// D comes from B or is a fixed word, and the carry into bit 0 is 1 for subtract and count up. For a
// bit-by-bit job D is all 0s and the carry in is 0, so the adder gives A, never carries and never
// overflows: COUT and OVER are 0 for those jobs without a gate of their own.
//
// The flags, one bit each beside the result: ZERO (every bit of Y is 0), MINUS (Y's top bit: Y
// reads below zero, signed), COUT (the carry out of the top slice) and OVER (signed overflow). The
// names are the course's own words. Every job and every flag is built from one-bit slices, so the
// same design is any width: ZERO is passed along the slices like the carry ("no 1 so far"), and
// OVER is the top slice's.
//
// Every expected value here is worked out in bigints, so a 64-bit word keeps every bit.

import { CircuitBuilder, type Circuit, type NetId } from "@dd/sim";

import { fullAdder, join4, selector2, selector4, split4, type PortNets } from "./combinational";

export const JOB_CODES = [0, 1, 2, 3, 4, 5, 6, 7] as const;
export type JobCode = (typeof JOB_CODES)[number];

/** Each job by code, as a short name for labels and tests. */
export const JOB_NAMES: Readonly<Record<JobCode, string>> = {
  0: "AND",
  1: "XOR",
  2: "+",
  3: "-",
  4: "OR",
  5: "copy B",
  6: "+ 1",
  7: "- 1",
};

/** A job's code as the three select bits. */
export function opBits(job: number): { OP2: 0 | 1; OP1: 0 | 1; OP0: 0 | 1 } {
  return {
    OP2: ((job >> 2) & 1) as 0 | 1,
    OP1: ((job >> 1) & 1) as 0 | 1,
    OP0: (job & 1) as 0 | 1,
  };
}

export interface AluResult {
  readonly Y: bigint;
  readonly ZERO: 0 | 1;
  readonly MINUS: 0 | 1;
  readonly COUT: 0 | 1;
  readonly OVER: 0 | 1;
}

const mask = (width: number) => (1n << BigInt(width)) - 1n;
const top = (w: bigint, width: number) => Number((w >> BigInt(width - 1)) & 1n) as 0 | 1;

/** The second word the adder adds, and the carry into bit 0, for a job: the slice's own rule. */
export function operandOf(job: number, b: bigint, width: number): { d: bigint; cin: 0 | 1 } {
  const { OP2, OP1, OP0 } = opBits(job);
  if (!OP1) return { d: 0n, cin: 0 };
  const d = OP2 ? (OP0 ? mask(width) : 0n) : OP0 ? ~b & mask(width) : b & mask(width);
  return { d, cin: (OP2 ^ OP0) as 0 | 1 };
}

/** What the ALU gives for a job on two words of `width` bits, worked out in bigints. */
export function aluResult(job: number, a: bigint, b: bigint, width: number): AluResult {
  const m = mask(width);
  a &= m;
  b &= m;
  const { d, cin } = operandOf(job, b, width);
  const total = a + d + BigInt(cin);
  const sum = total & m;
  let y: bigint;
  switch (job) {
    case 0:
      y = a & b;
      break;
    case 1:
      y = a ^ b;
      break;
    case 4:
      y = a | b;
      break;
    case 5:
      y = b;
      break;
    default:
      y = sum;
  }
  const arithmetic = opBits(job).OP1 === 1;
  const cout = arithmetic ? (Number(total >> BigInt(width)) as 0 | 1) : 0;
  const over =
    arithmetic && top(a, width) === top(d, width) && top(sum, width) !== top(a, width) ? 1 : 0;
  return { Y: y, ZERO: y === 0n ? 1 : 0, MINUS: top(y, width), COUT: cout, OVER: over };
}

/** A word as Module 1 writes it: hexadecimal capitals, a digit per four bits, no prefix. */
export function hexWord(w: bigint, width: number): string {
  return (w & mask(width))
    .toString(16)
    .toUpperCase()
    .padStart(Math.ceil(width / 4), "0");
}

/** A word in binary, for widths a learner reads bit by bit. */
export function binWord(w: bigint, width: number): string {
  return (w & mask(width)).toString(2).padStart(width, "0");
}

// ---- The circuits ------------------------------------------------------------------------------

export interface SliceOptions {
  readonly name?: string;
  /** With the zero chain and the overflow bit: ZIN in, ZOUT and OVER out. */
  readonly flags?: boolean;
  readonly outs?: Readonly<Partial<Record<string, NetId>>>;
}

function need(ins: PortNets, port: string): NetId {
  const n = ins[port];
  if (n === undefined) throw new RangeError(`the slice needs a net for its input ${port}`);
  return n;
}

/**
 * The adder's second input for one bit: B, NOT B, 0 or 1 as OP2 and OP0 say, and 0 for a
 * bit-by-bit job. B XOR OP0 turns B over when OP0 is 1; a 2-way selector takes OP0 itself instead
 * when OP2 is 1; an AND gate with OP1 makes it 0 for the jobs that do not add.
 */
function operandGates(
  b: CircuitBuilder,
  ins: { B: NetId; OP2: NetId; OP1: NetId; OP0: NetId },
  d: NetId,
): NetId {
  const bx = b.xor([ins.B, ins.OP0], { name: "xorB", output: b.net("BX") });
  const pick = selector2(
    b,
    { A: bx, B: ins.OP0, S: ins.OP2 },
    { name: "pickD", outs: { Y: b.net("DP") } },
  ).Y;
  return b.and([pick, ins.OP1], { name: "andD", output: d });
}

/** The carry into bit 0: OP1 AND (OP2 XOR OP0), 1 for subtract and count up only. */
export function carryInGates(
  b: CircuitBuilder,
  ins: { OP2: NetId; OP1: NetId; OP0: NetId },
  out?: NetId,
): NetId {
  const x = b.xor([ins.OP0, ins.OP2], { name: "xorC0", output: b.net("ADD1") });
  return b.and([ins.OP1, x], { name: "andC0", output: out ?? b.net("C0") });
}

/**
 * One bit of the course's ALU: inputs A, B, CIN, OP2, OP1, OP0; outputs Y and COUT, and with
 * `flags` also ZIN in and ZOUT and OVER out. A block of kind `alu8-slice` (or `alu-flag-slice`).
 */
export function aluJobSlice(b: CircuitBuilder, ins: PortNets, options: SliceOptions = {}) {
  const [a, bIn, cin, op2, op1, op0] = ["A", "B", "CIN", "OP2", "OP1", "OP0"].map((p) =>
    need(ins, p),
  ) as [NetId, NetId, NetId, NetId, NetId, NetId];
  const zin = options.flags ? need(ins, "ZIN") : undefined;
  const y = options.outs?.["Y"] ?? b.net("Y");
  const cout = options.outs?.["COUT"] ?? b.net("COUT");
  const zout = options.flags ? (options.outs?.["ZOUT"] ?? b.net("ZOUT")) : undefined;
  const over = options.flags ? (options.outs?.["OVER"] ?? b.net("OVER")) : undefined;
  const kind = options.flags ? "alu-flag-slice" : "alu8-slice";
  b.scope(
    options.name ?? kind,
    kind,
    (bb) => {
      const d = operandGates(bb, { B: bIn, OP2: op2, OP1: op1, OP0: op0 }, bb.net("D"));
      const fa = fullAdder(
        bb,
        { A: a, B: d, CIN: cin },
        { name: "fa", outs: { SUM: bb.net("SUM"), COUT: cout } },
      );
      const both = bb.and([a, bIn], { name: "andAB", output: bb.net("AND") });
      const either = bb.xor([a, bIn], { name: "xorAB", output: bb.net("XOR") });
      const any = bb.or([a, bIn], { name: "orAB", output: bb.net("OR") });
      const logic = selector4(
        bb,
        { A: both, B: either, C: any, D: bIn, S1: op2, S0: op0 },
        { name: "pickLogic", outs: { Y: bb.net("LOGIC") } },
      ).Y;
      selector2(bb, { A: logic, B: fa.SUM, S: op1 }, { name: "pickY", outs: { Y: y } });
      if (zin !== undefined && zout !== undefined && over !== undefined) {
        const ny = bb.not(y, { name: "notY", output: bb.net("NY") });
        bb.and([zin, ny], { name: "andZero", output: zout });
        const same = bb.gate("xnor", [a, d], { name: "xnorSame", output: bb.net("SAME") });
        const flip = bb.xor([a, fa.SUM], { name: "xorFlip", output: bb.net("FLIP") });
        bb.and([same, flip], { name: "andOver", output: over });
      }
    },
    {
      inputs: {
        A: a,
        B: bIn,
        CIN: cin,
        ...(zin !== undefined ? { ZIN: zin } : {}),
        OP2: op2,
        OP1: op1,
        OP0: op0,
      },
      outputs: {
        Y: y,
        COUT: cout,
        ...(zout !== undefined ? { ZOUT: zout } : {}),
        ...(over !== undefined ? { OVER: over } : {}),
      },
    },
  );
  return { Y: y, COUT: cout, ...(zout !== undefined ? { ZOUT: zout, OVER: over as NetId } : {}) };
}

interface RowIns {
  readonly A: NetId;
  readonly B: NetId;
  readonly CIN: NetId;
  readonly ZIN?: NetId;
  readonly OP2: NetId;
  readonly OP1: NetId;
  readonly OP0: NetId;
}

interface RowOuts {
  readonly Y: NetId;
  readonly COUT: NetId;
  readonly ZOUT?: NetId;
  readonly OVER?: NetId;
}

/**
 * Four slices on 4-bit words, built into `b` at the current level: split blocks give each slice
 * its bits, a join block makes Y, each slice's COUT (and ZOUT) is the next one's CIN (and ZIN).
 * Carries between slices are named C1 to C3 (Z1 to Z3), from bit 0 up.
 */
function row4(b: CircuitBuilder, ins: RowIns, outs: RowOuts, flags: boolean): void {
  const as = split4(b, { W: ins.A }, { name: "splitA" });
  const bs = split4(b, { W: ins.B }, { name: "splitB" });
  let carry = ins.CIN;
  let zero = ins.ZIN;
  const ys: Record<string, NetId> = {};
  for (let i = 0; i < 4; i++) {
    const last = i === 3;
    const cout = last ? outs.COUT : b.net(`C${i + 1}`);
    const zout = flags ? (last ? outs.ZOUT : b.net(`Z${i + 1}`)) : undefined;
    const over = flags ? (last ? outs.OVER : b.net(`V${i}`)) : undefined;
    const r = aluJobSlice(
      b,
      {
        A: as[`b${i}`] as NetId,
        B: bs[`b${i}`] as NetId,
        CIN: carry,
        ...(flags ? { ZIN: zero as NetId } : {}),
        OP2: ins.OP2,
        OP1: ins.OP1,
        OP0: ins.OP0,
      },
      {
        name: `bit${i}`,
        flags,
        outs: {
          Y: b.net(`Y${i}`),
          COUT: cout,
          ...(zout !== undefined ? { ZOUT: zout } : {}),
          ...(over !== undefined ? { OVER: over } : {}),
        },
      },
    );
    ys[`b${i}`] = r.Y;
    carry = cout;
    zero = zout;
  }
  join4(b, ys, { name: "joinY", outs: { W: outs.Y } });
}

/** Bits `hi` to `lo` of a word, as a closed block of kind `word-piece` (drawn as "bits"). */
function wordPiece(b: CircuitBuilder, name: string, w: NetId, hi: number, lo: number): NetId {
  const y = b.net(`${name}.Y`, hi - lo + 1);
  b.scope(
    name,
    "word-piece",
    (bb) => bb.component("slice", { a: w }, { y }, { name: "pick", params: { hi, lo } }),
    { inputs: { W: w }, outputs: { Y: y } },
  );
  return y;
}

/**
 * A group of slices `width` bits wide (4 or 16), built into `b` as a block that opens one level at
 * a time. It is given its parent's words and takes its own bits of each, `lo` up, with a
 * part-select (`pieceA`); inside, a 4-bit group is four slices and a 16-bit group is four 4-bit
 * groups. Carries between its children are named for the bit they go into (C4, C8, C12).
 */
function group(
  b: CircuitBuilder,
  name: string,
  width: number,
  lo: number,
  ins: RowIns,
  outs: RowOuts,
  flags: boolean,
): void {
  b.scope(
    name,
    `alu-group-${width}`,
    (bb) => {
      const hi = lo + width - 1;
      const pa = wordPiece(bb, "pieceA", ins.A, hi, lo);
      const pb = wordPiece(bb, "pieceB", ins.B, hi, lo);
      groupBody(bb, width, { ...ins, A: pa, B: pb }, outs, flags);
    },
    {
      inputs: {
        A: ins.A,
        B: ins.B,
        CIN: ins.CIN,
        ...(flags && ins.ZIN !== undefined ? { ZIN: ins.ZIN } : {}),
        OP2: ins.OP2,
        OP1: ins.OP1,
        OP0: ins.OP0,
      },
      outputs: {
        Y: outs.Y,
        COUT: outs.COUT,
        ...(flags && outs.ZOUT !== undefined ? { ZOUT: outs.ZOUT } : {}),
        ...(flags && outs.OVER !== undefined ? { OVER: outs.OVER } : {}),
      },
    },
  );
}

/**
 * The parts of a group at the current level: four slices for 4 bits; otherwise four groups a
 * quarter as wide, each given these words, and a join that puts their results together.
 */
function groupBody(
  b: CircuitBuilder,
  width: number,
  ins: RowIns,
  outs: RowOuts,
  flags: boolean,
): void {
  if (width === 4) {
    row4(b, ins, outs, flags);
    return;
  }
  const q = width / 4;
  let carry = ins.CIN;
  let zero = ins.ZIN;
  const ys: NetId[] = [];
  for (let k = 0; k < 4; k++) {
    const last = k === 3;
    const cout = last ? outs.COUT : b.net(`C${(k + 1) * q}`);
    const zout = flags ? (last ? outs.ZOUT : b.net(`Z${(k + 1) * q}`)) : undefined;
    const over = flags ? (last ? outs.OVER : b.net(`V${k}`)) : undefined;
    const y = b.net(`Y${k}`, q);
    group(
      b,
      `${width === 64 ? "g" : "q"}${k}`,
      q,
      k * q,
      { ...ins, CIN: carry, ...(flags ? { ZIN: zero as NetId } : {}) },
      {
        Y: y,
        COUT: cout,
        ...(zout !== undefined ? { ZOUT: zout } : {}),
        ...(over !== undefined ? { OVER: over } : {}),
      },
      flags,
    );
    ys.push(y);
    carry = cout;
    zero = zout;
  }
  wordJoin(b, "joinY", ys, outs.Y, width);
}

/**
 * Four pieces of a word put back together, as a closed block of kind `word-join`: its inputs Q3
 * to Q0 from the top, the highest piece first, as a word is written.
 */
function wordJoin(
  b: CircuitBuilder,
  name: string,
  pieces: readonly NetId[],
  y: NetId,
  width: number,
): void {
  const ports = pieces.map((n, i) => [`Q${i}`, n] as const).reverse();
  b.scope(
    name,
    "word-join",
    (bb) =>
      bb.component(
        "join",
        Object.fromEntries(pieces.map((n, i) => [String.fromCharCode(97 + i), n])),
        { y },
        { name: "join", params: { width } },
      ),
    { inputs: Object.fromEntries(ports), outputs: { W: y } },
  );
}

/** A word's top bit, as a closed block of kind `top-bit`: MINUS, read off Y. */
function topBit(b: CircuitBuilder, w: NetId, out: NetId, width: number): void {
  b.scope(
    "topBit",
    "top-bit",
    (bb) =>
      bb.component("bit", { a: w }, { y: out }, { name: "bit", params: { index: width - 1 } }),
    { inputs: { W: w }, outputs: { TOP: out } },
  );
}

export interface AluOptions {
  readonly width: number;
  /** The four flags as outputs. */
  readonly flags?: boolean;
  /** One closed block at the top (`alu`), opening to the parts below. */
  readonly closed?: boolean;
  /**
   * How the slices are arranged: `row` puts them side by side at one level (4 bits, or any width
   * for a figure that never draws them); `groups` nests them in fours, so a 16- or 64-bit ALU
   * opens one level at a time.
   */
  readonly arrange?: "row" | "groups";
}

/**
 * The course's ALU on words of `width` bits, as a circuit with inputs A, B, OP2, OP1, OP0 and
 * outputs Y, COUT and, with flags, ZERO, MINUS and OVER. Two gates in front make the carry into
 * bit 0; with flags, a fixed 1 starts the zero chain and a part takes Y's top bit for MINUS.
 */
export function aluCircuit(options: AluOptions): Circuit {
  const { width } = options;
  const flags = options.flags ?? false;
  const name = `alu8${flags ? "-flags" : ""}-${width}${options.closed ? "-block" : ""}`;
  const b = new CircuitBuilder(name);
  const A = b.input("A", width);
  const B = b.input("B", width);
  const OP2 = b.input("OP2");
  const OP1 = b.input("OP1");
  const OP0 = b.input("OP0");
  const outputs = aluParts(b, { A, B, OP2, OP1, OP0 }, options);
  for (const [n, net] of Object.entries(outputs)) b.output(n, net);
  return b.build();
}

/**
 * The ALU's parts built into `b` from the nets of its five inputs, at this level or (`closed`) as
 * one block `alu` of kind `alu8`; its output nets by name, Y first. Module 8's datapath places it
 * closed, with output nets of its own (`outs`).
 */
export function aluParts(
  b: CircuitBuilder,
  ins: { A: NetId; B: NetId; OP2: NetId; OP1: NetId; OP0: NetId },
  options: AluOptions & { readonly outs?: Readonly<Partial<Record<string, NetId>>> },
): Record<string, NetId> {
  const { width } = options;
  const flags = options.flags ?? false;
  const arrange = options.arrange ?? (width === 4 ? "row" : "groups");
  const { A, B, OP2, OP1, OP0 } = ins;
  const named = (n: string) => options.outs?.[n] ?? b.net(n);
  const Y = options.outs?.["Y"] ?? b.net("Y", width);
  const COUT = named("COUT");
  const ZERO = flags ? named("ZERO") : undefined;
  const MINUS = flags ? named("MINUS") : undefined;
  const OVER = flags ? named("OVER") : undefined;
  const body = (bb: CircuitBuilder) => {
    const c0 = carryInGates(bb, { OP2, OP1, OP0 });
    let z0: NetId | undefined;
    if (flags) {
      z0 = bb.net("Z0");
      bb.component("const", {}, { y: z0 }, { name: "one", params: { width: 1, value: "1" } });
    }
    const rowIns: RowIns = {
      A,
      B,
      CIN: c0,
      ...(z0 !== undefined ? { ZIN: z0 } : {}),
      OP2,
      OP1,
      OP0,
    };
    const outs: RowOuts = {
      Y,
      COUT,
      ...(ZERO !== undefined ? { ZOUT: ZERO } : {}),
      ...(OVER !== undefined ? { OVER } : {}),
    };
    if (arrange === "row" && width !== 4) flatRow(bb, rowIns, outs, width, flags);
    else groupBody(bb, width, rowIns, outs, flags);
    if (MINUS !== undefined) topBit(bb, Y, MINUS, width);
  };
  const outputs = {
    Y,
    ...(ZERO !== undefined ? { ZERO } : {}),
    ...(MINUS !== undefined ? { MINUS } : {}),
    COUT,
    ...(OVER !== undefined ? { OVER } : {}),
  };
  if (options.closed) b.scope("alu", "alu8", body, { inputs: { A, B, OP2, OP1, OP0 }, outputs });
  else body(b);
  return outputs;
}

/**
 * Every slice side by side at one level, with each slice's bits taken by a `bit` part and its
 * carry out on a net named C1, C2, ... (and Z1, Z2, ...): the arrangement the carry-stepping
 * figure reads, which never draws it.
 */
function flatRow(
  b: CircuitBuilder,
  ins: RowIns,
  outs: RowOuts,
  width: number,
  flags: boolean,
): void {
  let carry = ins.CIN;
  let zero = ins.ZIN;
  const ys: NetId[] = [];
  for (let i = 0; i < width; i++) {
    const last = i === width - 1;
    const ai = b.net(`A${i}`);
    b.component("bit", { a: ins.A }, { y: ai }, { name: `bitA${i}`, params: { index: i } });
    const bi = b.net(`B${i}`);
    b.component("bit", { a: ins.B }, { y: bi }, { name: `bitB${i}`, params: { index: i } });
    const cout = last ? outs.COUT : b.net(`C${i + 1}`);
    const zout = flags ? (last ? outs.ZOUT : b.net(`Z${i + 1}`)) : undefined;
    const over = flags ? (last ? outs.OVER : b.net(`V${i}`)) : undefined;
    const r = aluJobSlice(
      b,
      {
        A: ai,
        B: bi,
        CIN: carry,
        ...(flags ? { ZIN: zero as NetId } : {}),
        OP2: ins.OP2,
        OP1: ins.OP1,
        OP0: ins.OP0,
      },
      {
        name: `bit${i}`,
        flags,
        outs: {
          Y: b.net(`Y${i}`),
          COUT: cout,
          ...(zout !== undefined ? { ZOUT: zout } : {}),
          ...(over !== undefined ? { OVER: over } : {}),
        },
      },
    );
    ys.push(r.Y);
    carry = cout;
    zero = zout;
  }
  b.component(
    "join",
    Object.fromEntries(ys.map((n, i) => [String.fromCharCode(97 + i), n])),
    { y: outs.Y },
    { name: "joinY", params: { width } },
  );
}

/** One slice alone, with its ports as the circuit's: the drawn challenge's reference. */
export function aluSliceCircuit(flags = false): Circuit {
  const b = new CircuitBuilder(flags ? "alu-flag-slice-parts" : "alu8-slice-parts");
  const ins: Record<string, NetId> = {};
  for (const n of ["A", "B", "CIN", ...(flags ? ["ZIN"] : []), "OP2", "OP1", "OP0"])
    ins[n] = b.input(n);
  const A = ins["A"] as NetId;
  const B = ins["B"] as NetId;
  const OP2 = ins["OP2"] as NetId;
  const OP1 = ins["OP1"] as NetId;
  const OP0 = ins["OP0"] as NetId;
  const d = operandGates(b, { B, OP2, OP1, OP0 }, b.net("D"));
  const fa = fullAdder(
    b,
    { A, B: d, CIN: ins["CIN"] as NetId },
    { name: "fa", outs: { SUM: b.net("SUM"), COUT: b.net("COUT") } },
  );
  const both = b.and([A, B], { name: "andAB", output: b.net("AND") });
  const either = b.xor([A, B], { name: "xorAB", output: b.net("XOR") });
  const any = b.or([A, B], { name: "orAB", output: b.net("OR") });
  const logic = selector4(
    b,
    { A: both, B: either, C: any, D: B, S1: OP2, S0: OP0 },
    { name: "pickLogic", outs: { Y: b.net("LOGIC") } },
  ).Y;
  const y = selector2(
    b,
    { A: logic, B: fa.SUM, S: OP1 },
    { name: "pickY", outs: { Y: b.net("Y") } },
  ).Y;
  b.output("Y", y);
  b.output("COUT", fa.COUT);
  return b.build();
}

/** The adder's second input for one bit, at the top level: the first challenge's reference. */
export function operandCircuit(withCarry = false): Circuit {
  const b = new CircuitBuilder(withCarry ? "operand-carry" : "operand-bit");
  const B = b.input("B");
  const OP2 = b.input("OP2");
  const OP1 = b.input("OP1");
  const OP0 = b.input("OP0");
  b.output("D", operandGates(b, { B, OP2, OP1, OP0 }, b.net("D")));
  if (withCarry) b.output("C0", carryInGates(b, { OP2, OP1, OP0 }));
  return b.build();
}

/** The zero chain's slice: ZOUT is 1 when ZIN is 1 and this bit of Y is 0. */
export function zeroSliceCircuit(): Circuit {
  const b = new CircuitBuilder("zero-slice");
  const Y = b.input("Y");
  const ZIN = b.input("ZIN");
  const ny = b.not(Y, { name: "notY", output: b.net("NY") });
  b.output("ZOUT", b.and([ZIN, ny], { name: "andZero", output: b.net("ZOUT") }));
  return b.build();
}

/**
 * The colder lamp, from the flags of A - B: A reads less than B, signed, exactly when MINUS and
 * OVER differ. MINUS alone is wrong whenever the subtraction overflowed.
 */
export function colderCircuit(): Circuit {
  const b = new CircuitBuilder("colder");
  const ins = ["ZERO", "MINUS", "COUT", "OVER"].map((n) => b.input(n));
  b.output(
    "COLDER",
    b.xor([ins[1] as NetId, ins[3] as NetId], { name: "xorColder", output: b.net("COLDER") }),
  );
  return b.build();
}
