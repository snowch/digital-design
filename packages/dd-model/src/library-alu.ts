// Copyright © 2026 Christopher Snow

// Module 7's circuits, by the id a lesson names them with. The ALU itself is in alu.ts; here it is
// placed for the figures that draw it, and the challenges' references are listed.

import type { Circuit } from "@dd/sim";

import {
  aluCircuit,
  aluSliceCircuit,
  colderCircuit,
  operandCircuit,
  zeroSliceCircuit,
} from "./alu";

type At = Readonly<Record<string, readonly [number, number]>>;
type Place = (circuit: Circuit, at: At) => Circuit;

/**
 * A drawing moved right by `dx` cells: a 64-bit word's value, written above its pin and ending at
 * the pin's right edge, is wider than the pin, and needs room on the left to stay inside the
 * drawing.
 */
function shifted(at: At, dx: number, dy = 0): At {
  return Object.fromEntries(
    Object.entries(at).map(([k, [x, y]]) => [k, [x + dx, y + dy] as const]),
  );
}

/** The closed ALU without flags: five inputs on the left, Y and COUT on the right. */
const BLOCK_AT: At = {
  "in:A": [0, 1],
  "in:B": [0, 4],
  "in:OP2": [0, 7],
  "in:OP1": [0, 10],
  "in:OP0": [0, 13],
  alu: [6, 3],
  "out:Y": [15, 3],
  "out:COUT": [15, 6],
};

/** The closed ALU with its four flags. */
const FLAGS_BLOCK_AT: At = {
  "in:A": [0, 1],
  "in:B": [0, 4],
  "in:OP2": [0, 7],
  "in:OP1": [0, 10],
  "in:OP0": [0, 13],
  alu: [6, 5],
  "out:Y": [15, 1],
  "out:ZERO": [15, 4],
  "out:MINUS": [15, 7],
  "out:COUT": [15, 10],
  "out:OVER": [15, 13],
};

/**
 * Four slices in a staircase, bit 0 low on the left and bit 3 high on the right, so each carry
 * runs up and to the right into the next slice; the select inputs run along the bottom.
 */
/** The same with the flag slices, which are taller: each step up is eight rows. */
const FLAG_ROW4_AT: At = {
  splitA: [4, 0.5],
  splitB: [4, 7.5],
  bit0: [18, 35],
  bit1: [28, 26],
  bit2: [38, 17],
  bit3: [48, 8],
  joinY: [57, 32],
};

const ROW4_AT: At = {
  splitA: [4, 1],
  splitB: [4, 8],
  bit0: [17, 28],
  bit1: [26, 22],
  bit2: [35, 16],
  bit3: [44, 10],
  joinY: [52, 28],
};

export function aluLibrary(place: Place): Readonly<Record<string, () => Circuit>> {
  return {
    "alu8-4-block": () => place(aluCircuit({ width: 4, closed: true }), BLOCK_AT),
    "alu8-16-block": () => place(aluCircuit({ width: 16, closed: true }), BLOCK_AT),
    "alu8-4": () =>
      place(aluCircuit({ width: 4 }), {
        ...ROW4_AT,
        "in:A": [0, 2],
        "in:B": [0, 9],
        "in:OP2": [0, 36],
        "in:OP1": [0, 39],
        "in:OP0": [0, 42],
        xorC0: [8, 45],
        andC0: [12, 44.5],
        "out:Y": [58, 29],
        "out:COUT": [58, 11],
      }),
    "alu8-flags-4-block": () =>
      place(aluCircuit({ width: 4, flags: true, closed: true }), FLAGS_BLOCK_AT),
    "alu8-flags-16-block": () =>
      place(aluCircuit({ width: 16, flags: true, closed: true }), FLAGS_BLOCK_AT),
    "alu8-flags-4": () =>
      place(
        aluCircuit({ width: 4, flags: true }),
        shifted(
          {
            ...FLAG_ROW4_AT,
            "in:A": [0, 2],
            "in:B": [0, 9],
            "in:OP2": [0, 43],
            "in:OP1": [0, 46],
            "in:OP0": [0, 49],
            xorC0: [9, 52],
            andC0: [14, 51.5],
            one: [12, 42],
            topBit: [63, 32],
            "out:Y": [68, 33.5],
            "out:MINUS": [68, 29],
            "out:ZERO": [68, 12],
            "out:COUT": [68, 9],
            "out:OVER": [68, 15],
          },
          0,
          1,
        ),
      ),
    // The 64-bit ALU opens one level at a time: four 16-bit groups, each four 4-bit groups,
    // each four slices. Only the top level is placed here; the groups' insides are in INSIDE.
    "alu8-flags-64": () =>
      place(
        aluCircuit({ width: 64, flags: true }),
        shifted(
          {
            "in:A": [0, 1],
            "in:B": [0, 4],
            "in:OP2": [0, 40],
            "in:OP1": [0, 43],
            "in:OP0": [0, 46],
            xorC0: [6, 50],
            andC0: [10, 49.5],
            one: [8, 37],
            g0: [14, 30],
            g1: [23, 21],
            g2: [32, 12],
            g3: [41, 3],
            joinY: [50, 30],
            topBit: [56, 30],
            "out:Y": [61, 31],
            "out:MINUS": [61, 27],
            "out:ZERO": [61, 4],
            "out:COUT": [61, 7],
            "out:OVER": [61, 10],
          },
          5,
        ),
      ),
    // Never drawn: every slice at one level, for the carry-stepping figure and the graders.
    "alu8-16-row": () => aluCircuit({ width: 16, arrange: "row" }),
    "alu8-64-row": () => aluCircuit({ width: 64, arrange: "row" }),
    "alu8-flags-16-row": () => aluCircuit({ width: 16, flags: true, arrange: "row" }),
    "alu8-flags-64-row": () => aluCircuit({ width: 64, flags: true, arrange: "row" }),
    // The challenges' references and the explanation's small circuits.
    "operand-bit": () => operandCircuit(),
    "operand-carry": () =>
      place(operandCircuit(true), {
        "in:B": [0, 1],
        "in:OP2": [0, 5],
        "in:OP1": [0, 12],
        "in:OP0": [0, 9],
        xorB: [5, 1],
        pickD: [10, 2],
        andD: [16, 3],
        xorC0: [10, 9],
        andC0: [16, 10],
        "out:D": [21, 3],
        "out:C0": [21, 10],
      }),
    "alu8-slice-parts": () => aluSliceCircuit(),
    "zero-slice": () => zeroSliceCircuit(),
    colder: () => colderCircuit(),
  };
}

const SLICE_AT: At = {
  "in:A": [0, 1],
  // Half a cell down, level with the bit-by-bit selector's D, so B runs into it straight (Module
  // 0's ladder is the first figure to draw a slice opened).
  "in:B": [0, 4.5],
  "in:OP2": [0, 18],
  "in:OP1": [0, 21],
  "in:OP0": [0, 24],
  "in:CIN": [0, 27],
  "in:ZIN": [0, 30],
  andAB: [6, 1],
  xorAB: [6, 5],
  orAB: [6, 9],
  pickLogic: [12, 2],
  pickY: [26, 11],
  xorB: [6, 14],
  pickD: [11, 14],
  andD: [16, 15],
  fa: [21, 15],
  notY: [31, 9],
  andZero: [35, 7],
  xnorSame: [31, 18],
  xorFlip: [31, 22],
  andOver: [35, 20],
  "out:Y": [40, 4],
  "out:ZOUT": [40, 8],
  "out:COUT": [40, 15],
  "out:OVER": [40, 21],
};

/** Hand-placed insides of Module 7's blocks, by kind, for a view that opens one. */
export const ALU_INSIDE: Readonly<Record<string, At>> = {
  // Module 0: the 64-bit ALU with flags as Module 8's machine holds it, a closed block, opened
  // as Module 7's own top level is placed. A closed ALU of another width holds other parts, and
  // is laid out automatically as before.
  alu8: shifted(
    {
      "in:A": [0, 1],
      "in:B": [0, 4],
      "in:OP2": [0, 40],
      "in:OP1": [0, 43],
      "in:OP0": [0, 46],
      xorC0: [6, 50],
      andC0: [10, 49.5],
      one: [8, 37],
      g0: [14, 30],
      g1: [23, 21],
      g2: [32, 12],
      g3: [41, 3],
      joinY: [50, 30],
      topBit: [56, 30],
      "out:Y": [61, 31],
      "out:MINUS": [61, 27],
      "out:ZERO": [61, 4],
      "out:COUT": [61, 7],
      "out:OVER": [61, 10],
    },
    5,
  ),
  // One slice: the bit-by-bit jobs along the top, the adder and its second input below, the
  // flags on the right.
  "alu-flag-slice": SLICE_AT,
  "alu8-slice": SLICE_AT,
  "alu-group-4": shifted(
    {
      "in:A": [0, 2],
      "in:B": [0, 12],
      "in:CIN": [0, 32],
      "in:ZIN": [0, 35],
      "in:OP2": [0, 38],
      "in:OP1": [0, 41],
      "in:OP0": [0, 44],
      pieceA: [4, 2],
      pieceB: [4, 12],
      splitA: [10, 0.5],
      splitB: [10, 10.5],
      bit0: [18, 30],
      bit1: [25, 21],
      bit2: [32, 12],
      bit3: [39, 3],
      joinY: [47, 27],
      "out:Y": [53, 28.5],
      "out:COUT": [53, 4],
      "out:ZOUT": [53, 7],
      "out:OVER": [53, 10],
    },
    3,
    1,
  ),
  "alu-group-16": shifted(
    {
      "in:A": [0, 1],
      "in:B": [0, 4],
      "in:CIN": [0, 36],
      "in:ZIN": [0, 39],
      "in:OP2": [0, 42],
      "in:OP1": [0, 45],
      "in:OP0": [0, 48],
      pieceA: [4, 1],
      pieceB: [4, 4],
      q0: [12, 30],
      q1: [18, 21],
      q2: [24, 12],
      q3: [30, 3],
      joinY: [38, 30],
      "out:Y": [44, 31],
      "out:COUT": [44, 4],
      "out:ZOUT": [44, 7],
      "out:OVER": [44, 10],
    },
    5,
  ),
};
