// Copyright © 2026 Chris Snow

import { describe, expect, it } from "vitest";

import {
  and,
  bit0,
  bit1,
  bitX,
  bitAt,
  concat,
  equal,
  formatWord,
  fromBits,
  is,
  mux,
  nand,
  nor,
  not,
  or,
  parseWord,
  partial,
  slice,
  toBits,
  unknown,
  word,
  xor,
} from "./values";

describe("words", () => {
  it("masks a value to its width and knows every bit", () => {
    const w = word(4, 0b10110);
    expect(w.value).toBe(0b0110n);
    expect(w.known).toBe(0b1111n);
    expect(formatWord(w)).toBe("0110");
  });

  it("formats and parses bits with X where a bit is unknown", () => {
    const w = partial(4, 0b1010, 0b1100);
    expect(formatWord(w)).toBe("10XX");
    expect(equal(parseWord("10XX", 4), w)).toBe(true);
    expect(formatWord(unknown(3))).toBe("XXX");
    expect(formatWord(bitX)).toBe("X");
    expect(formatWord(word(8, 0xa5), 16)).toBe("0xa5");
    expect(formatWord(word(8, 165), 10)).toBe("165");
  });

  it("round-trips through bit arrays", () => {
    const bits = toBits(partial(5, 0b10100, 0b11011));
    expect(bits).toEqual(["1", "0", "X", "0", "0"]);
    expect(equal(fromBits(bits), partial(5, 0b10100, 0b11011))).toBe(true);
    expect(bitAt(fromBits(bits), 2)).toBe("X");
  });

  it("refuses widths and indexes that make no sense", () => {
    expect(() => word(0, 1)).toThrow(RangeError);
    expect(() => bitAt(bit1, 1)).toThrow(RangeError);
    expect(() => parseWord("12z", 4)).toThrow(SyntaxError);
  });
});

describe("three-valued logic", () => {
  const table = <T>(rows: [T, T, string][], f: (a: T, b: T) => ReturnType<typeof and>) => {
    for (const [a, b, want] of rows) expect(formatWord(f(a, b))).toBe(want);
  };

  it("AND: a known 0 decides, a known 1 on both sides decides, otherwise X", () => {
    table(
      [
        [bit0, bit0, "0"],
        [bit0, bit1, "0"],
        [bit1, bit1, "1"],
        [bit0, bitX, "0"],
        [bit1, bitX, "X"],
        [bitX, bitX, "X"],
      ],
      and,
    );
  });

  it("OR: a known 1 decides, a known 0 on both sides decides, otherwise X", () => {
    table(
      [
        [bit0, bit0, "0"],
        [bit0, bit1, "1"],
        [bit1, bitX, "1"],
        [bit0, bitX, "X"],
        [bitX, bitX, "X"],
      ],
      or,
    );
  });

  it("XOR needs both inputs known", () => {
    table(
      [
        [bit0, bit1, "1"],
        [bit1, bit1, "0"],
        [bit1, bitX, "X"],
      ],
      xor,
    );
  });

  it("NOT, NAND and NOR follow", () => {
    expect(formatWord(not(bitX))).toBe("X");
    expect(formatWord(not(bit0))).toBe("1");
    expect(formatWord(nand(bit0, bitX))).toBe("1");
    expect(formatWord(nor(bit1, bitX))).toBe("0");
    expect(formatWord(nor(bit0, bitX))).toBe("X");
  });

  it("works bit by bit on wider words", () => {
    const a = parseWord("1X01", 4);
    const b = parseWord("11X0", 4);
    expect(formatWord(and(a, b))).toBe("1X00");
    expect(formatWord(or(a, b))).toBe("11X1");
    expect(formatWord(xor(a, b))).toBe("0XX1");
  });

  it("a selector with an unknown select keeps only the bits both sides agree on", () => {
    const a = parseWord("1100", 4);
    const b = parseWord("1010", 4);
    expect(formatWord(mux(bit0, a, b))).toBe("1100");
    expect(formatWord(mux(bit1, a, b))).toBe("1010");
    expect(formatWord(mux(bitX, a, b))).toBe("1XX0");
  });

  it("concatenates and slices", () => {
    const w = concat(word(2, 0b10), parseWord("X1", 2));
    expect(formatWord(w)).toBe("10X1");
    expect(formatWord(slice(w, 3, 2))).toBe("10");
    expect(formatWord(slice(w, 1, 0))).toBe("X1");
    expect(is(slice(w, 3, 2), 2)).toBe(true);
  });
});
