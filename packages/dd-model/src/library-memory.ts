// Module 6's circuits, by the id a lesson names them with. The blocks are in memory.ts; here they
// are wired into the circuits the lessons' figures show and the challenges' reference solutions.

import { CircuitBuilder, type Circuit, type NetId } from "@dd/sim";

import { decoder2 } from "./combinational";
import {
  byteMemory,
  byteMemoryPart,
  memoryBlock,
  ram4,
  regFile4,
  shopMemory,
  tableRom,
  wideRegister,
  wordRegister,
  wordSelector,
} from "./memory";

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

/** A larger memory as one closed component: 16 words of 16 bits, address A of 4 bits. */
function memory16(): Circuit {
  const b = new CircuitBuilder("memory-16");
  const a = b.input("A", 4);
  const d = b.input("D", 16);
  const we = b.input("WE");
  const clk = b.input("CLK");
  b.output(
    "Q",
    memoryBlock(b, { A: a, D: d, WE: we, CLK: clk }, { name: "memory", words: 16, width: 16 })
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
 * The four-word RAM as a component, to be read as text: four words of four bits, address A of two
 * bits. The generalisation of lesson 6.2 shows its text, an array with one read and one write.
 */
function ramArray(): Circuit {
  const b = new CircuitBuilder("ram_4");
  const a = b.input("A", 2);
  const d = b.input("D", 4);
  const we = b.input("WE");
  const clk = b.input("CLK");
  const out = memoryBlock(
    b,
    { A: a, D: d, WE: we, CLK: clk },
    { name: "words", words: 4, width: 4 },
  );
  b.output("Q", out.Q as NetId);
  return b.build();
}

/** The register file's construction: two words, one write, two reads, from parts. */
function regFileTwoParts(): Circuit {
  const b = new CircuitBuilder("regfile-2-parts");
  const wa = b.input("WA");
  const d = b.input("D", 4);
  const we = b.input("WE");
  const clk = b.input("CLK");
  const ra = b.input("RA");
  const rb = b.input("RB");
  const nwa = b.not(wa, { name: "notWA", output: b.net("NWA") });
  const w0 = b.and([nwa, we], { name: "andW0", output: b.net("W0") });
  const w1 = b.and([wa, we], { name: "andW1", output: b.net("W1") });
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
    "QA",
    wordSelector(b, { A: m0, B: m1, S: ra }, { name: "selectA", outs: { Y: b.net("QA", 4) } }).Y,
  );
  b.output(
    "QB",
    wordSelector(b, { A: m0, B: m1, S: rb }, { name: "selectB", outs: { Y: b.net("QB", 4) } }).Y,
  );
  return b.build();
}

// ---- Lesson 6.3: bytes ----------------------------------------------------------------------

/** The bytes the challenge's memory is filled with, lowest address first. */
export const FILLED_BYTES: readonly number[] = [
  0x30, 0x00, 0x48, 0xff, 0x12, 0x00, 0x9c, 0x01, 0xe8, 0x03, 0x05, 0x00, 0x7f, 0x40, 0x21, 0x10,
];

function byteMemoryBlock(name: string, init?: readonly number[]): Circuit {
  const b = new CircuitBuilder(name);
  const a = b.input("A", 4);
  const d = b.input("D", 16);
  const word = b.input("WORD");
  const we = b.input("WE");
  const clk = b.input("CLK");
  const out = byteMemory(
    b,
    { A: a, WORD: word, D: d, WE: we, CLK: clk },
    { name: "bytes", ...(init ? { init } : {}) },
  );
  b.output("Q", out.Q);
  b.output("ODD", out.ODD);
  return b.build();
}

/**
 * The construction's reference: the byte memory's write enables and its check, as gates. WEE (the
 * even bank's) is WE AND NOT A0; WEO (the odd bank's) is WE AND (WORD XOR A0); ODD is WORD AND A0.
 */
function byteWriteGates(): Circuit {
  const b = new CircuitBuilder("byte-write-gates");
  const we = b.input("WE");
  const word = b.input("WORD");
  const a0 = b.input("A0");
  const na0 = b.not(a0, { name: "notA0", output: b.net("NA0") });
  b.output("WEE", b.and([we, na0], { name: "andEven", output: b.net("WEE") }));
  const pick = b.xor([word, a0], { name: "xorOdd", output: b.net("PICK") });
  b.output("WEO", b.and([we, pick], { name: "andOddWE", output: b.net("WEO") }));
  b.output("ODD", b.and([word, a0], { name: "andOdd", output: b.net("ODD") }));
  return b.build();
}

// ---- Lesson 6.4: the shop's memory map --------------------------------------------------------

function shopPins(b: CircuitBuilder): Record<string, NetId> {
  return {
    A5: b.input("A5"),
    A4: b.input("A4"),
    A: b.input("A", 4),
    D: b.input("D", 16),
    WORD: b.input("WORD"),
    WE: b.input("WE"),
    CLK: b.input("CLK"),
    SENSOR: b.input("SENSOR", 16),
  };
}

/** The shop's memory as one block a learner can open. */
function shopMemoryBlock(): Circuit {
  const b = new CircuitBuilder("shop-memory-block");
  const out = shopMemory(b, shopPins(b), { name: "shop" });
  b.output("Q", out.Q);
  b.output("DISPLAY", out.DISPLAY);
  return b.build();
}

/**
 * The capstone's reference: the shop's memory from the blocks a drawing may place. The decoder
 * reads A5 A4; the RAM's write enable is Y1 AND WE and the display's load enable Y2 AND WE; a
 * word selector puts the part A5 A4 names on Q.
 */
function shopParts(): Circuit {
  const b = new CircuitBuilder("shop-parts");
  const p = shopPins(b) as Record<string, NetId>;
  const ys = decoder2(b, { S1: p["A5"]!, S0: p["A4"]! }, { name: "decoder" });
  // Each block's outputs on nets of its own name: a net called Q would be found before the
  // output Q when a test reads Q by name.
  const rom = tableRom(
    b,
    { A: p["A"]!, WORD: p["WORD"]! },
    { name: "rom", outs: { Q: b.net("QROM", 16), ODD: b.net("ODDROM") } },
  );
  const weRam = b.and([ys["Y1"]!, p["WE"]!], { name: "andRam", output: b.net("WERAM") });
  const ram = byteMemoryPart(
    b,
    { A: p["A"]!, WORD: p["WORD"]!, D: p["D"]!, WE: weRam, CLK: p["CLK"]! },
    { name: "ram", outs: { Q: b.net("QRAM", 16), ODD: b.net("ODDRAM") } },
  );
  const en = b.and([ys["Y2"]!, p["WE"]!], { name: "andDisplay", output: b.net("WEDISP") });
  const display = wideRegister(
    b,
    { D: p["D"]!, EN: en, CLK: p["CLK"]! },
    { name: "display", outs: { Q: b.net("DISPLAY", 16) } },
  ).Q;
  const q = wordSelector(
    b,
    { A: rom.Q, B: ram.Q, C: display, D: p["SENSOR"]!, S1: p["A5"]!, S0: p["A4"]! },
    { name: "selector", kind: "word-selector-16", outs: { Y: b.net("Q", 16) } },
  ).Y;
  b.output("Q", q);
  b.output("DISPLAY", display);
  return b.build();
}

/**
 * The insides of Module 6's blocks, placed by hand: the address and the write enable in the top
 * left, the decoder beside them, each word's AND gate level with its register's EN, and the
 * selector to the right of the registers. Keyed by the block's kind, as `INSIDE` is.
 */
export const MEMORY_INSIDE: Readonly<Record<string, At>> = {
  // The decoder top left, each part's enable gate level with its enable, the selector on the right.
  "shop-memory": {
    "in:A5": [0, 2],
    "in:A4": [0, 4],
    "in:A": [0, 9],
    "in:WORD": [0, 11],
    "in:WE": [0, 16],
    "in:D": [0, 19],
    "in:CLK": [0, 27],
    "in:SENSOR": [0, 30],
    decoder: [4, 1],
    rom: [9, 9],
    andRam: [11, 15.5],
    andDisplay: [11, 23.5],
    ram: [16, 13],
    display: [16, 23],
    selector: [24, 8],
    "out:Q": [31, 10.5],
    "out:DISPLAY": [31, 24],
  },
  // The RAM's layout, with the reads' addresses at the bottom left, below the write's.
  "register-file": {
    "in:WA1": [0, 2],
    "in:WA0": [0, 4],
    "in:WE": [0, 7],
    "in:D": [0, 10],
    "in:CLK": [0, 13],
    "in:RA1": [0, 25],
    "in:RA0": [0, 27],
    "in:RB1": [0, 30],
    "in:RB0": [0, 32],
    decoder: [4, 1],
    andW0: [11, 3.5],
    andW1: [11, 9.5],
    andW2: [11, 15.5],
    andW3: [11, 21.5],
    word0: [16, 1],
    word1: [16, 7],
    word2: [16, 13],
    word3: [16, 19],
    selectA: [24, 3],
    selectB: [24, 14],
    "out:QA": [30, 5.5],
    "out:QB": [30, 16.5],
  },
  "byte-memory": {
    "in:A": [0, 2],
    "in:WORD": [0, 6],
    "in:WE": [0, 10],
    "in:D": [0, 14],
    "in:CLK": [0, 22],
    splitA: [4, 3],
    splitD: [4, 14],
    notA0: [9, 4],
    xorOdd: [9, 8],
    andOdd: [14, 24],
    andEven: [14, 4],
    andOddWE: [14, 8],
    selD: [14, 13],
    even: [20, 3],
    odd: [20, 10],
    zero: [20, 17],
    selByte: [26, 3],
    selHigh: [26, 10],
    selLow: [32, 3],
    joinQ: [37, 5],
    "out:ODD": [42, 24.5],
    "out:Q": [42, 5],
  },
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
    "regfile-2-parts": () => regFileTwoParts(),
    "ram-array": () => ramArray(),
    "byte-memory-block": () => byteMemoryBlock("byte-memory-block"),
    "byte-memory-filled": () => byteMemoryBlock("byte-memory-filled", FILLED_BYTES),
    "byte-write-gates": () => byteWriteGates(),
    "shop-memory-block": () => shopMemoryBlock(),
    "shop-parts": () => shopParts(),
  };
}
