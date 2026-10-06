// Copyright © 2026 Christopher Snow

// A wide word typed as the lessons write words, and read back the same way.

import { describe, expect, it } from "vitest";

import { word } from "@dd/sim";

import { hexOfWord, parseHexWord, parseNumberWord, signedOfWord } from "./word-entry";

describe("a word typed in hexadecimal", () => {
  it("takes the lessons' form, short or full, any case, with or without 0x and spaces", () => {
    expect(parseHexWord("7D8", 64)).toEqual({ value: 0x7d8n });
    expect(parseHexWord("ffffffffffffff48", 64)).toEqual({ value: 0xffffffffffffff48n });
    expect(parseHexWord("0x7d8", 64)).toEqual({ value: 0x7d8n });
    expect(parseHexWord(" 1312 3000 ", 32)).toEqual({ value: 0x13123000n });
    expect(parseHexWord("000000000000000000007D8", 64)).toEqual({ value: 0x7d8n });
  });

  it("says what is wrong: nothing typed, a letter that is no digit, more than the word holds", () => {
    expect(parseHexWord("  ", 64)).toEqual({ problem: { kind: "empty" } });
    expect(parseHexWord("7G8", 64)).toEqual({ problem: { kind: "not-hex", char: "G" } });
    expect(parseHexWord("-184", 64)).toEqual({ problem: { kind: "not-hex", char: "-" } });
    expect(parseHexWord("1FFFFFFFF", 32)).toEqual({ problem: { kind: "hex-too-long", digits: 8 } });
  });
});

describe("a word typed as a number", () => {
  it("takes a signed or an unsigned reading, and stores a negative one as the signed reading writes it", () => {
    expect(parseNumberWord("-184", 64)).toEqual({ value: 0xffffffffffffff48n });
    expect(parseNumberWord("2008", 64)).toEqual({ value: 0x7d8n });
    expect(parseNumberWord("-128", 8)).toEqual({ value: 0x80n });
    expect(parseNumberWord("255", 8)).toEqual({ value: 0xffn });
  });

  it("says what is wrong: nothing typed, a character that is no digit, a number the word cannot hold", () => {
    expect(parseNumberWord("", 64)).toEqual({ problem: { kind: "empty" } });
    expect(parseNumberWord("7D8", 64)).toEqual({ problem: { kind: "not-number", char: "D" } });
    expect(parseNumberWord("-", 64)).toEqual({ problem: { kind: "not-number", char: "-" } });
    expect(parseNumberWord("-129", 8)).toEqual({
      problem: { kind: "number-range", min: -128n, max: 255n },
    });
    expect(parseNumberWord("256", 8)).toEqual({
      problem: { kind: "number-range", min: -128n, max: 255n },
    });
  });
});

describe("a word read back", () => {
  it("in hexadecimal at its full width, and signed", () => {
    expect(hexOfWord(word(64, 0x7d8n))).toBe("00000000000007D8");
    expect(signedOfWord(word(64, 0xffffffffffffff48n))).toBe("-184");
    expect(hexOfWord(word(32, 0x13123000n))).toBe("13123000");
  });

  it("with X where bits are unknown", () => {
    const partly = { width: 16, value: 0x0048n, known: 0x00ffn };
    expect(hexOfWord(partly)).toBe("XX48");
    expect(signedOfWord(partly)).toBe("X");
    expect(hexOfWord({ width: 64, value: 0n, known: 0n })).toBe("XXXXXXXXXXXXXXXX");
  });
});
