// Module 6's circuits, by the id a lesson names them with. The blocks are in memory.ts; here they
// are wired into the circuits the lessons' figures show and the challenges' reference solutions.

import { CircuitBuilder, type Circuit, type NetId } from "@dd/sim";

import { memoryBlock, ram4, regFile4, wordRegister, wordSelector } from "./memory";

type At = Readonly<Record<string, readonly [number, number]>>;
type Place = (circuit: Circuit, at: At) => Circuit;

// ---- Lesson 6.1: RAM -----------------------------------------------------------------------

/** The four-word RAM as one block a learner can open: A1 A0, D, WE and CLK in, Q out. */
function ramBlock(): Circuit {
  const b = new CircuitBuilder("ram-block");
  const a1 = b.input("A1");
  const a0 = b.input("A0");
  const d = b.input("D", 4);
  const we = b.input("WE");
  const clk = b.input("CLK");
  b.output("Q", ram4(b, { A1: a1, A0: a0, D: d, WE: we, CLK: clk }, { name: "ram" }).Q);
  return b.build();
}

/**
 * The same RAM with a three-bit address, A2 A1 A0, of which the RAM reads only A1 A0: A2 goes
 * nowhere. Address 5 (101) reaches the word address 1 (01) names.
 */
function ramWide(): Circuit {
  const b = new CircuitBuilder("ram-wide");
  b.input("A2");
  const a1 = b.input("A1");
  const a0 = b.input("A0");
  const d = b.input("D", 4);
  const we = b.input("WE");
  const clk = b.input("CLK");
  b.output("Q", ram4(b, { A1: a1, A0: a0, D: d, WE: we, CLK: clk }, { name: "ram" }).Q);
  return b.build();
}

/**
 * The construction's reference: a two-word memory from parts. A NOT gate and two AND gates make
 * each word's load enable from A and WE (the decoder of a one-bit address is A and NOT A), and a
 * word selector puts the word A names on Q.
 */
function ramTwoParts(): Circuit {
  const b = new CircuitBuilder("ram-2-parts");
  const a = b.input("A");
  const d = b.input("D", 4);
  const we = b.input("WE");
  const clk = b.input("CLK");
  const na = b.not(a, { name: "notA", output: b.net("NA") });
  const w0 = b.and([na, we], { name: "andW0", output: b.net("W0") });
  const w1 = b.and([a, we], { name: "andW1", output: b.net("W1") });
  const m0 = wordRegister(
    b,
    { D: d, EN: w0, CLK: clk },
    { name: "word0", outs: { Q: b.net("M0", 4) } },
  ).Q;
  const m1 = wordRegister(
    b,
    { D: d, EN: w1, CLK: clk },
    { name: "word1", outs: { Q: b.net("M1", 4) } },
  ).Q;
  b.output(
    "Q",
    wordSelector(b, { A: m0, B: m1, S: a }, { name: "selector", outs: { Y: b.net("Q", 4) } }).Y,
  );
  return b.build();
}

/**
 * The challenge's reference: the four-word RAM behind a three-bit address that refuses addresses
 * 4 to 7. OK is 1 while A2 is 0; the RAM's WE is WE AND OK, so a write past the end changes
 * nothing.
 */
function ramGuard(): Circuit {
  const b = new CircuitBuilder("ram-guard");
  const a2 = b.input("A2");
  const a1 = b.input("A1");
  const a0 = b.input("A0");
  const d = b.input("D", 4);
  const we = b.input("WE");
  const clk = b.input("CLK");
  const ok = b.not(a2, { name: "notA2", output: b.net("OK") });
  const weOk = b.and([we, ok], { name: "andWE", output: b.net("WEOK") });
  const q = ram4(b, { A1: a1, A0: a0, D: d, WE: weOk, CLK: clk }, { name: "ram" }).Q;
  b.output("Q", q);
  b.output("OK", ok);
  return b.build();
}

/** A larger memory as one closed component: 16 words of 8 bits, address A of 4 bits. */
function memory16(): Circuit {
  const b = new CircuitBuilder("memory-16");
  const a = b.input("A", 4);
  const d = b.input("D", 8);
  const we = b.input("WE");
  const clk = b.input("CLK");
  b.output(
    "Q",
    memoryBlock(b, { A: a, D: d, WE: we, CLK: clk }, { name: "memory", words: 16, width: 8 })
      .Q as NetId,
  );
  return b.build();
}

// ---- Lesson 6.2: the register file ----------------------------------------------------------

function regFileBlock(): Circuit {
  const b = new CircuitBuilder("regfile-block");
  const ins: Record<string, NetId> = {};
  for (const name of ["WA1", "WA0", "D", "WE", "CLK", "RA1", "RA0", "RB1", "RB0"])
    ins[name] = b.input(name, name === "D" ? 4 : 1);
  const out = regFile4(b, ins, { name: "regfile" });
  b.output("QA", out.QA);
  b.output("QB", out.QB);
  return b.build();
}

/**
 * The insides of Module 6's blocks, placed by hand: the address and the write enable in the top
 * left, the decoder beside them, each word's AND gate level with its register's EN, and the
 * selector to the right of the registers. Keyed by the block's kind, as `INSIDE` is.
 */
export const MEMORY_INSIDE: Readonly<Record<string, At>> = {
  ram: {
    "in:A1": [0, 2],
    "in:A0": [0, 4],
    "in:WE": [0, 7],
    "in:D": [0, 10],
    "in:CLK": [0, 13],
    decoder: [4, 1],
    andW0: [11, 3.5],
    andW1: [11, 9.5],
    andW2: [11, 15.5],
    andW3: [11, 21.5],
    word0: [16, 1],
    word1: [16, 7],
    word2: [16, 13],
    word3: [16, 19],
    selector: [22, 8],
    "out:Q": [28, 10.5],
  },
};

/** Module 6's library entries. `place` is the library's own helper for hand-placed drawings. */
export function memoryLibrary(place: Place): Readonly<Record<string, () => Circuit>> {
  return {
    "ram-block": () =>
      place(ramBlock(), {
        "in:A1": [0, 1],
        "in:A0": [0, 3],
        "in:D": [0, 5],
        "in:WE": [0, 7],
        "in:CLK": [0, 9],
        ram: [6, 1],
        "out:Q": [13, 1],
      }),
    "ram-wide": () =>
      place(ramWide(), {
        "in:A2": [0, 1],
        "in:A1": [0, 3],
        "in:A0": [0, 5],
        "in:D": [0, 7],
        "in:WE": [0, 9],
        "in:CLK": [0, 11],
        ram: [6, 3],
        "out:Q": [13, 3],
      }),
    "ram-2-parts": () => ramTwoParts(),
    "ram-guard": () => ramGuard(),
    "memory-16": () => memory16(),
    "regfile-block": () => regFileBlock(),
  };
}
