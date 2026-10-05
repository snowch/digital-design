// Module 3's circuits, by the id a lesson names them with. Each is a function, so every caller
// gets a fresh netlist. The blocks they are built from are in combinational.ts; here they are
// wired into the circuits the lessons' figures show and the challenges' reference solutions.

import { CircuitBuilder, type Circuit, type NetId } from "@dd/sim";

import {
  aluSlice,
  decoder2,
  equalWords,
  demux4,
  encoder4,
  fullAdder,
  halfAdder,
  join4,
  rippleAdder,
  selector2,
  selector4,
  split4,
} from "./combinational";

type At = Readonly<Record<string, readonly [number, number]>>;
type Place = (circuit: Circuit, at: At) => Circuit;

/** Inputs from a list of names, each one bit unless a width is given. */
function pins(b: CircuitBuilder, names: readonly (string | readonly [string, number])[]) {
  return Object.fromEntries(
    names.map((n) => (typeof n === "string" ? [n, b.input(n)] : [n[0], b.input(n[0], n[1])])),
  ) as Record<string, NetId>;
}

function outputs(b: CircuitBuilder, nets: Readonly<Record<string, NetId>>): void {
  for (const [name, net] of Object.entries(nets)) b.output(name, net);
}

// ---- Lesson 3.1: selectors -------------------------------------------------------------------

/** Both rooms' bits joined by one OR gate: a 1 from either room reaches the display. */
function roomsOr(): Circuit {
  const b = new CircuitBuilder("rooms-or");
  const { A, B } = pins(b, ["A", "B"]);
  b.output("Y", b.or([A as NetId, B as NetId], { name: "orY", output: b.net("Y") }));
  return b.build();
}

/** One AND gate with a bit and a control: it passes A while S is 1 and gives 0 while S is 0. */
function andPass(): Circuit {
  const b = new CircuitBuilder("and-pass");
  const { A, S } = pins(b, ["A", "S"]);
  b.output("Y", b.and([A as NetId, S as NetId], { name: "andA", output: b.net("Y") }));
  return b.build();
}

/** The 2-way selector as one closed block. */
function selector2Block(): Circuit {
  const b = new CircuitBuilder("selector-2-block");
  const ins = pins(b, ["A", "B", "S"]);
  outputs(b, selector2(b, ins, { name: "selector-2", outs: { Y: b.net("Y") } }));
  return b.build();
}

/** The 2-way selector's gates at the top level, where a drawing shows them. */
function selector2Gates(): Circuit {
  const b = new CircuitBuilder("selector-2-gates");
  const { A, B, S } = pins(b, ["A", "B", "S"]) as Record<"A" | "B" | "S", NetId>;
  const ns = b.not(S, { name: "notS", output: b.net("NS") });
  const pa = b.and([A, ns], { name: "andA", output: b.net("PA") });
  const pb = b.and([S, B], { name: "andB", output: b.net("PB") });
  b.output("Y", b.or([pa, pb], { name: "orY", output: b.net("Y") }));
  return b.build();
}

/** A selector for 4-bit words: one 2-way selector per bit, all sharing S. */
function selectorWord(): Circuit {
  const b = new CircuitBuilder("selector-word");
  const { A, B, S } = pins(b, [["A", 4], ["B", 4], "S"]) as Record<"A" | "B" | "S", NetId>;
  const a = split4(b, { W: A }, { name: "splitA" });
  const bb = split4(b, { W: B }, { name: "splitB" });
  const ys: Record<string, NetId> = {};
  for (const i of ["3", "2", "1", "0"]) {
    ys[`b${i}`] = selector2(
      b,
      { A: a[`b${i}`] as NetId, B: bb[`b${i}`] as NetId, S },
      { name: `sel${i}`, outs: { Y: b.net(`Y${i}`) } },
    ).Y;
  }
  b.output("Y", join4(b, ys, { name: "joinY", outs: { W: b.net("Y", 4) } }).W);
  return b.build();
}

/** The 4-way selector as one closed block. */
function selector4Block(): Circuit {
  const b = new CircuitBuilder("selector-4-block");
  const ins = pins(b, ["A", "B", "C", "D", "S1", "S0"]);
  outputs(b, selector4(b, ins, { name: "selector-4", outs: { Y: b.net("Y") } }));
  return b.build();
}

/** The 4-way selector drawn as three 2-way selector blocks: the challenge's reference. */
function selector4Blocks(): Circuit {
  const b = new CircuitBuilder("selector-4-blocks");
  const { A, B, C, D, S1, S0 } = pins(b, ["A", "B", "C", "D", "S1", "S0"]) as Record<string, NetId>;
  const ab = selector2(b, { A: A!, B: B!, S: S0! }, { name: "selAB", outs: { Y: b.net("AB") } });
  const cd = selector2(b, { A: C!, B: D!, S: S0! }, { name: "selCD", outs: { Y: b.net("CD") } });
  b.output(
    "Y",
    selector2(b, { A: ab.Y, B: cd.Y, S: S1! }, { name: "selOut", outs: { Y: b.net("Y") } }).Y,
  );
  return b.build();
}

// ---- Lesson 3.2: decoders --------------------------------------------------------------------

/** One room's lamp: lit for one pattern of S1 and S0 alone. */
function lampTwo(): Circuit {
  const b = new CircuitBuilder("lamp-2");
  const { S1, S0 } = pins(b, ["S1", "S0"]) as Record<string, NetId>;
  const n0 = b.not(S0!, { name: "notS0", output: b.net("NS0") });
  b.output("Y2", b.and([S1!, n0], { name: "and2", output: b.net("Y2") }));
  return b.build();
}

function decoderBlock(): Circuit {
  const b = new CircuitBuilder("decoder-block");
  const ins = pins(b, ["S1", "S0"]);
  outputs(
    b,
    decoder2(b, ins, {
      name: "decoder-2",
      outs: Object.fromEntries([0, 1, 2, 3].map((k) => [`Y${k}`, b.net(`Y${k}`)])),
    }),
  );
  return b.build();
}

/** The decoder's gates at the top level: the challenge's reference and the fault lab's circuit. */
function decoderGates(): Circuit {
  const b = new CircuitBuilder("decoder-gates");
  const { S1, S0 } = pins(b, ["S1", "S0"]) as Record<string, NetId>;
  const n1 = b.not(S1!, { name: "notS1", output: b.net("NS1") });
  const n0 = b.not(S0!, { name: "notS0", output: b.net("NS0") });
  const pairs = [
    [n1, n0],
    [n1, S0!],
    [S1!, n0],
    [S1!, S0!],
  ] as const;
  pairs.forEach(([hi, lo], k) =>
    b.output(`Y${k}`, b.and([hi, lo], { name: `and${k}`, output: b.net(`Y${k}`) })),
  );
  return b.build();
}

function demuxBlock(): Circuit {
  const b = new CircuitBuilder("demux-block");
  const ins = pins(b, ["IN", "S1", "S0"]);
  outputs(
    b,
    demux4(b, ins, {
      name: "demux-4",
      outs: Object.fromEntries([0, 1, 2, 3].map((k) => [`Y${k}`, b.net(`Y${k}`)])),
    }),
  );
  return b.build();
}

function encoderBlock(): Circuit {
  const b = new CircuitBuilder("encoder-block");
  const ins = pins(b, ["L0", "L1", "L2", "L3"]);
  outputs(b, encoder4(b, ins, { name: "encoder-4", outs: { S1: b.net("S1"), S0: b.net("S0") } }));
  return b.build();
}

/** The encoder with its two outputs joined into one 2-bit word, S, so one value is the room. */
function encoderWord(): Circuit {
  const b = new CircuitBuilder("encoder-word");
  const ls = [0, 1, 2, 3].map((k) => b.input(`L${k}`));
  const s = b.net("S", 2);
  b.scope(
    "encoder-4",
    "encoder-4",
    (bb) => {
      const s1 = bb.or([ls[2]!, ls[3]!], { name: "orS1", output: bb.net("S1") });
      const s0 = bb.or([ls[1]!, ls[3]!], { name: "orS0", output: bb.net("S0") });
      bb.component("join", { a: s0, b: s1 }, { y: s }, { name: "join", params: { width: 2 } });
    },
    { inputs: Object.fromEntries(ls.map((n, k) => [`L${k}`, n])), outputs: { S: s } },
  );
  b.output("S", s);
  return b.build();
}

/** Two 4-bit words compared, as one closed block. */
function comparatorBlock(): Circuit {
  const b = new CircuitBuilder("comparator-block");
  const ins = pins(b, [
    ["A", 4],
    ["B", 4],
  ]);
  outputs(b, equalWords(b, ins, { name: "comparator", outs: { EQ: b.net("EQ") } }));
  return b.build();
}

/** Two 4-bit words compared bit by bit: the challenge's reference, drawn with split blocks. */
function comparatorParts(): Circuit {
  const b = new CircuitBuilder("comparator-parts");
  const { A, B } = pins(b, [
    ["A", 4],
    ["B", 4],
  ]) as Record<string, NetId>;
  const a = split4(b, { W: A! }, { name: "splitA" });
  const bb = split4(b, { W: B! }, { name: "splitB" });
  const d = Object.fromEntries(
    ["3", "2", "1", "0"].map((i) => [
      i,
      b.xor([a[`b${i}`] as NetId, bb[`b${i}`] as NetId], {
        name: `xor${i}`,
        output: b.net(`D${i}`),
      }),
    ]),
  ) as Record<string, NetId>;
  // Two-input gates only, as the drawing editor places them: any difference in the top two bits,
  // any in the bottom two, and EQ is 1 when there is neither.
  const high = b.or([d["3"]!, d["2"]!], { name: "orHigh", output: b.net("DH") });
  const low = b.or([d["1"]!, d["0"]!], { name: "orLow", output: b.net("DL") });
  b.output("EQ", b.nor([high, low], { name: "norEq", output: b.net("EQ") }));
  return b.build();
}

// ---- Lesson 3.3: adders ----------------------------------------------------------------------

function halfAdderGates(): Circuit {
  const b = new CircuitBuilder("half-adder-gates");
  const { A, B } = pins(b, ["A", "B"]) as Record<string, NetId>;
  b.output("SUM", b.xor([A!, B!], { name: "xorSum", output: b.net("SUM") }));
  b.output("CARRY", b.and([A!, B!], { name: "andCarry", output: b.net("CARRY") }));
  return b.build();
}

/** Two 2-bit words added one column at a time, each column alone: the carry out of bit 0 is lost. */
function columnsAlone(): Circuit {
  const b = new CircuitBuilder("columns-alone");
  const { A1, A0, B1, B0 } = pins(b, ["A1", "A0", "B1", "B0"]) as Record<string, NetId>;
  const low = halfAdder(
    b,
    { A: A0!, B: B0! },
    { name: "ha0", outs: { SUM: b.net("SUM0"), CARRY: b.net("CARRY0") } },
  );
  const high = halfAdder(
    b,
    { A: A1!, B: B1! },
    { name: "ha1", outs: { SUM: b.net("SUM1"), CARRY: b.net("CARRY1") } },
  );
  outputs(b, { SUM1: high.SUM, SUM0: low.SUM, CARRY1: high.CARRY, CARRY0: low.CARRY });
  return b.build();
}

/** The full adder as two half-adder blocks and an OR gate at the top level. */
function fullAdderParts(): Circuit {
  const b = new CircuitBuilder("full-adder-parts");
  const { A, B, CIN } = pins(b, ["A", "B", "CIN"]) as Record<string, NetId>;
  const first = halfAdder(
    b,
    { A: A!, B: B! },
    { name: "ha1", outs: { SUM: b.net("S1"), CARRY: b.net("C1") } },
  );
  const second = halfAdder(
    b,
    { A: first.SUM, B: CIN! },
    { name: "ha2", outs: { SUM: b.net("SUM"), CARRY: b.net("C2") } },
  );
  b.output("SUM", second.SUM);
  b.output("COUT", b.or([first.CARRY, second.CARRY], { name: "orCarry", output: b.net("COUT") }));
  return b.build();
}

/** A ripple adder of `width` bits as one closed block. */
function adderBlock(width: number): Circuit {
  const b = new CircuitBuilder(`adder-${width}-block`);
  const ins = pins(b, [["A", width], ["B", width], "CIN"]);
  outputs(
    b,
    rippleAdder(b, ins, {
      name: "adder",
      width,
      outs: { SUM: b.net("SUM", width), COUT: b.net("COUT") },
    }),
  );
  return b.build();
}

/** The 4-bit ripple adder drawn as split blocks, four full-adder blocks and a join block. */
function adder4Parts(): Circuit {
  const b = new CircuitBuilder("adder-4-parts");
  const { A, B, CIN } = pins(b, [["A", 4], ["B", 4], "CIN"]) as Record<string, NetId>;
  const a = split4(b, { W: A! }, { name: "splitA" });
  const bb = split4(b, { W: B! }, { name: "splitB" });
  let carry = CIN!;
  const sums: Record<string, NetId> = {};
  for (const i of ["0", "1", "2", "3"]) {
    const last = i === "3";
    const fa = fullAdder(
      b,
      { A: a[`b${i}`] as NetId, B: bb[`b${i}`] as NetId, CIN: carry },
      {
        name: `fa${i}`,
        outs: { SUM: b.net(`S${i}`), COUT: b.net(last ? "COUT" : `C${Number(i) + 1}`) },
      },
    );
    sums[`b${i}`] = fa.SUM;
    carry = fa.COUT;
  }
  b.output("SUM", join4(b, sums, { name: "joinSum", outs: { W: b.net("SUM", 4) } }).W);
  b.output("COUT", carry);
  return b.build();
}

/**
 * The signed-overflow lamp for a 4-bit sum, from the top bits alone: V is 1 when A and B have the
 * same top bit and the sum's top bit differs from it.
 */
function overflowGates(): Circuit {
  const b = new CircuitBuilder("overflow-gates");
  const { A3, B3, S3 } = pins(b, ["A3", "B3", "S3"]) as Record<string, NetId>;
  const same = b.gate("xnor", [A3!, B3!], { name: "xnorSame", output: b.net("SAME") });
  const flipped = b.xor([A3!, S3!], { name: "xorFlip", output: b.net("FLIP") });
  b.output("V", b.and([same, flipped], { name: "andV", output: b.net("V") }));
  return b.build();
}

// ---- Lesson 3.4: the ALU ---------------------------------------------------------------------

/** NOT B plus 1, with the course's adder: a 4-bit word turned into the word for minus it. */
function negate4(): Circuit {
  const b = new CircuitBuilder("negate-4");
  const B = b.input("B", 4);
  const nb = b.not(B, { name: "notB", output: b.net("NB", 4) });
  const zero = b.net("ZERO", 4);
  b.component("const", {}, { y: zero }, { name: "zero", params: { width: 4, value: "0" } });
  const one = b.net("ONE");
  b.component("const", {}, { y: one }, { name: "one", params: { width: 1, value: "1" } });
  const r = rippleAdder(
    b,
    { A: nb, B: zero, CIN: one },
    { name: "adder", width: 4, outs: { SUM: b.net("NEG", 4), COUT: b.net("COUT") } },
  );
  b.output("NEG", r.SUM);
  return b.build();
}

/** One bit of the add-or-subtract unit: B turned over when SUB is 1, then a full adder. */
function addSubSliceParts(): Circuit {
  const b = new CircuitBuilder("addsub-slice");
  const { A, B, CIN, SUB } = pins(b, ["A", "B", "CIN", "SUB"]) as Record<string, NetId>;
  const bx = b.xor([B!, SUB!], { name: "xorB", output: b.net("BX") });
  outputs(
    b,
    fullAdder(
      b,
      { A: A!, B: bx, CIN: CIN! },
      { name: "fa", outs: { SUM: b.net("SUM"), COUT: b.net("COUT") } },
    ),
  );
  return b.build();
}

/** The ALU slice's parts at the top level: the capstone's reference. */
function aluSliceParts(): Circuit {
  const b = new CircuitBuilder("alu-slice-parts");
  const { A, B, CIN, OP1, OP0 } = pins(b, ["A", "B", "CIN", "OP1", "OP0"]) as Record<string, NetId>;
  const both = b.and([A!, B!], { name: "andAB", output: b.net("AND") });
  const either = b.xor([A!, B!], { name: "xorAB", output: b.net("XOR") });
  const sub = b.and([OP1!, OP0!], { name: "andSub", output: b.net("SUB") });
  const bx = b.xor([B!, sub], { name: "xorB", output: b.net("BX") });
  const fa = fullAdder(
    b,
    { A: A!, B: bx, CIN: CIN! },
    { name: "fa", outs: { SUM: b.net("SUM"), COUT: b.net("COUT") } },
  );
  const y = selector4(
    b,
    { A: both, B: either, C: fa.SUM, D: fa.SUM, S1: OP1!, S0: OP0! },
    { name: "pick", outs: { Y: b.net("Y") } },
  );
  b.output("Y", y.Y);
  b.output("COUT", fa.COUT);
  return b.build();
}

/**
 * Words of `width` bits through a row of slices, built into `b`: the add-or-subtract unit
 * (`slice` "addsub") or the ALU ("alu"). One gate in front gives bit 0 its carry in: SUB itself,
 * or OP1 AND OP0. At four bits the words are split and joined by split and join blocks, so every
 * part at the top level is one a drawing can show; wider rows are shown closed.
 */
function buildRow(
  b: CircuitBuilder,
  ins: Readonly<Record<string, NetId>>,
  outs: { result: NetId; cout: NetId },
  width: number,
  slice: "addsub" | "alu",
): void {
  const A = ins["A"] as NetId;
  const B = ins["B"] as NetId;
  let carry =
    slice === "addsub"
      ? b.gate("buf", [ins["SUB"] as NetId], { name: "carryIn", output: b.net("C0") })
      : b.and([ins["OP1"] as NetId, ins["OP0"] as NetId], {
          name: "andCarry",
          output: b.net("C0"),
        });
  const four = width === 4;
  const as = four ? split4(b, { W: A }, { name: "splitA" }) : undefined;
  const bs = four ? split4(b, { W: B }, { name: "splitB" }) : undefined;
  const bitOf = (word: NetId, split: Record<string, NetId> | undefined, i: number, n: string) => {
    if (split) return split[`b${i}`] as NetId;
    const net = b.net(`${n}${i}`);
    b.component("bit", { a: word }, { y: net }, { name: `bit${n}${i}`, params: { index: i } });
    return net;
  };
  const ys: NetId[] = [];
  for (let i = 0; i < width; i++) {
    const ai = bitOf(A, as, i, "A");
    const bi = bitOf(B, bs, i, "B");
    const cout = i === width - 1 ? outs.cout : b.net(`C${i + 1}`);
    if (slice === "addsub") {
      const sub = ins["SUB"] as NetId;
      const cin = carry;
      const out = b.scope(
        `bit${i}`,
        "addsub-slice",
        (bb) => {
          const bx = bb.xor([bi, sub], { name: "xorB", output: bb.net("BX") });
          return fullAdder(
            bb,
            { A: ai, B: bx, CIN: cin },
            { name: "fa", outs: { SUM: bb.net("SUM"), COUT: cout } },
          );
        },
        (r) => ({
          inputs: { A: ai, B: bi, CIN: cin, SUB: sub },
          outputs: { SUM: r.SUM, COUT: cout },
        }),
      );
      ys.push(out.SUM);
    } else {
      ys.push(
        aluSlice(
          b,
          { A: ai, B: bi, CIN: carry, OP1: ins["OP1"] as NetId, OP0: ins["OP0"] as NetId },
          { name: `bit${i}`, outs: { Y: b.net(`Y${i}`), COUT: cout } },
        ).Y,
      );
    }
    carry = cout;
  }
  if (four)
    join4(b, Object.fromEntries(ys.map((n, i) => [`b${i}`, n])), {
      name: "join",
      outs: { W: outs.result },
    });
  else
    b.component(
      "join",
      Object.fromEntries(ys.map((n, i) => [String.fromCharCode(97 + i), n])),
      { y: outs.result },
      { name: "join", params: { width } },
    );
}

function rowInputs(b: CircuitBuilder, width: number, slice: "addsub" | "alu") {
  const ins: Record<string, NetId> = { A: b.input("A", width), B: b.input("B", width) };
  if (slice === "addsub") ins["SUB"] = b.input("SUB");
  else {
    ins["OP1"] = b.input("OP1");
    ins["OP0"] = b.input("OP0");
  }
  return ins;
}

function sliceRow(width: number, slice: "addsub" | "alu"): Circuit {
  const b = new CircuitBuilder(`${slice}-${width}`);
  const ins = rowInputs(b, width, slice);
  const name = slice === "addsub" ? "SUM" : "Y";
  const outs = { result: b.net(name, width), cout: b.net("COUT") };
  buildRow(b, ins, outs, width, slice);
  b.output(name, outs.result);
  b.output("COUT", outs.cout);
  return b.build();
}

/** A row of slices as one closed block, the way a lesson shows a wide one. */
function sliceRowBlock(width: number, slice: "addsub" | "alu"): Circuit {
  const b = new CircuitBuilder(`${slice}-${width}-block`);
  const ins = rowInputs(b, width, slice);
  const name = slice === "addsub" ? "SUM" : "Y";
  const outs = { result: b.net(name, width), cout: b.net("COUT") };
  const kind = slice === "alu" ? "alu" : "addsub";
  b.scope(kind, kind, (bb) => buildRow(bb, ins, outs, width, slice), {
    inputs: ins,
    outputs: { [name]: outs.result, COUT: outs.cout },
  });
  b.output(name, outs.result);
  b.output("COUT", outs.cout);
  return b.build();
}

const ADDER_BLOCK_AT: At = {
  "in:A": [0, 1],
  "in:B": [0, 4],
  "in:CIN": [0, 7],
  adder: [6, 1],
  "out:SUM": [14, 1],
  "out:COUT": [14, 4],
};

const ALU_BLOCK_AT: At = {
  "in:A": [0, 1],
  "in:B": [0, 4],
  "in:OP1": [0, 7],
  "in:OP0": [0, 10],
  alu: [6, 2],
  "out:Y": [14, 2],
  "out:COUT": [14, 5],
};

/** Module 3's library entries. `place` is the library's own helper for hand-placed drawings. */
export function combinationalLibrary(place: Place): Readonly<Record<string, () => Circuit>> {
  return {
    "rooms-or": () => roomsOr(),
    "and-pass": () => andPass(),
    "selector-2-block": () => selector2Block(),
    "selector-2-gates": () =>
      place(selector2Gates(), {
        "in:A": [0, 1],
        "in:S": [0, 5],
        "in:B": [0, 9],
        notS: [5, 4],
        andA: [10, 1],
        andB: [10, 8],
        orY: [15, 4],
        "out:Y": [20, 4],
      }),
    // Bit 3's selector at the top, as a word is written; S along the bottom to every selector.
    "selector-word": () =>
      place(selectorWord(), {
        "in:A": [0, 2],
        splitA: [5, 1],
        "in:B": [0, 9],
        splitB: [5, 8],
        "in:S": [0, 30],
        sel3: [13, 1],
        sel2: [17, 8],
        sel1: [21, 15],
        sel0: [25, 22],
        joinY: [31, 1],
        "out:Y": [37, 2],
      }),
    "selector-4-block": () =>
      place(selector4Block(), {
        "in:A": [0, 1],
        "in:B": [0, 3],
        "in:C": [0, 5],
        "in:D": [0, 7],
        "in:S1": [0, 10],
        "in:S0": [0, 12],
        "selector-4": [6, 2],
        "out:Y": [13, 2],
      }),
    "selector-4-blocks": () => selector4Blocks(),
    "lamp-2": () =>
      place(lampTwo(), {
        "in:S1": [0, 1],
        "in:S0": [0, 5],
        notS0: [5, 4],
        and2: [11, 2],
        "out:Y2": [16, 2],
      }),
    "decoder-block": () =>
      place(decoderBlock(), {
        "in:S1": [0, 1],
        "in:S0": [0, 4],
        "decoder-2": [6, 1],
        "out:Y0": [13, 0],
        "out:Y1": [13, 2],
        "out:Y2": [13, 4],
        "out:Y3": [13, 6],
      }),
    // The four AND gates in a column, each beside its lamp; the NOT gates below them, so the
    // wires from S1 and S0 to the lower gates pass no part.
    "decoder-gates": () =>
      place(decoderGates(), {
        "in:S1": [0, 1],
        "in:S0": [0, 4],
        and0: [11, 1],
        and1: [11, 5],
        and2: [11, 9],
        and3: [11, 13],
        notS1: [5, 17],
        notS0: [5, 20],
        "out:Y0": [16, 1],
        "out:Y1": [16, 5],
        "out:Y2": [16, 9],
        "out:Y3": [16, 13],
      }),
    "demux-block": () =>
      place(demuxBlock(), {
        "in:IN": [0, 1],
        "in:S1": [0, 4],
        "in:S0": [0, 7],
        "demux-4": [6, 1],
        "out:Y0": [13, 1],
        "out:Y1": [13, 3],
        "out:Y2": [13, 5],
        "out:Y3": [13, 7],
      }),
    "encoder-block": () => encoderBlock(),
    "comparator-parts": () => comparatorParts(),
    "half-adder-gates": () => halfAdderGates(),
    // Bit 1's column on top, as a word is written; its carry pin and bit 0's side by side.
    "columns-alone": () =>
      place(columnsAlone(), {
        "in:A1": [0, 1],
        "in:B1": [0, 3],
        ha1: [5, 1],
        "out:SUM1": [12, 1],
        "out:CARRY1": [12, 3],
        "in:A0": [0, 7],
        "in:B0": [0, 9],
        ha0: [5, 7],
        "out:SUM0": [12, 7],
        "out:CARRY0": [12, 9],
      }),
    "full-adder-parts": () =>
      place(fullAdderParts(), {
        "in:A": [0, 0],
        "in:B": [0, 2],
        "in:CIN": [0, 6],
        ha1: [5, 1],
        ha2: [11, 5],
        orCarry: [18, 2],
        "out:COUT": [23, 2],
        "out:SUM": [23, 5],
      }),
    "adder-4-block": () => place(adderBlock(4), ADDER_BLOCK_AT),
    "adder-16-block": () => place(adderBlock(16), ADDER_BLOCK_AT),
    "adder-4-parts": () => adder4Parts(),
    "overflow-gates": () => overflowGates(),
    "negate-4": () =>
      place(negate4(), {
        "in:B": [0, 1],
        notB: [5, 1],
        zero: [5, 5],
        one: [5, 9],
        adder: [11, 2],
        "out:NEG": [18, 2],
      }),
    "addsub-slice": () => addSubSliceParts(),
    // A staircase: bit 0's slice low on the left, bit 3's high on the right, so each carry runs
    // up and to the right into the next slice, and the wires into each slice pass none of the others.
    "addsub-4": () =>
      place(sliceRow(4, "addsub"), {
        "in:A": [0, 2],
        "in:B": [0, 8],
        "in:SUB": [0, 26],
        splitA: [4, 1],
        splitB: [4, 7],
        carryIn: [5, 26],
        bit3: [26, 4],
        bit2: [21, 9],
        bit1: [16, 14],
        bit0: [11, 19],
        join: [31, 24],
        "out:SUM": [36, 25],
        "out:COUT": [36, 5],
      }),
    "alu-slice-parts": () => aluSliceParts(),
    "alu-4": () => sliceRow(4, "alu"),
    "alu-16": () => sliceRow(16, "alu"),
    "alu-4-block": () => place(sliceRowBlock(4, "alu"), ALU_BLOCK_AT),
    "alu-16-block": () => place(sliceRowBlock(16, "alu"), ALU_BLOCK_AT),
    "encoder-word": () => encoderWord(),
    "comparator-block": () =>
      place(comparatorBlock(), {
        "in:A": [0, 1],
        "in:B": [0, 4],
        comparator: [6, 1],
        "out:EQ": [13, 1],
      }),
  };
}
