// The readings of a word, the recordings, and the answer graders, held to hand-worked cases.

import { describe, expect, it } from "vitest";

import {
  bitsOf,
  bitsText,
  digitPlaceValue,
  hexOf,
  parseBits,
  signedOf,
  termsOf,
  unsignedOf,
} from "./bits";
import { ANSWER_GRADERS, isProblem, parseHex, parseNumber } from "./graders";
import { readBits, recording, safeBand } from "./signals";

describe("bits", () => {
  it("reads a word unsigned, signed and as hexadecimal", () => {
    const w = parseBits("1000 0000 0000 0011");
    expect(unsignedOf(w)).toBe(32771);
    expect(signedOf(w)).toBe(-32765);
    expect(hexOf(w)).toBe("8003");
    expect(termsOf(w, "signed")).toEqual([-32768, 2, 1]);
    expect(hexOf(parseBits("101"))).toBe("5");
  });

  it("gives each bit its worth inside its hexadecimal digit, and the digits agree with hexOf", () => {
    expect([15, 14, 13, 12, 11, 3, 2, 1, 0].map(digitPlaceValue)).toEqual([
      8, 4, 2, 1, 8, 8, 4, 2, 1,
    ]);
    const w = parseBits("1111 1111 0100 1000");
    const digit = (group: number) =>
      [0, 1, 2, 3]
        .map((k) => 4 * group + k)
        .filter((n) => w[w.length - 1 - n] === 1)
        .reduce((sum, n) => sum + digitPlaceValue(n), 0);
    expect([3, 2, 1, 0].map((g) => digit(g).toString(16).toUpperCase()).join("")).toBe(hexOf(w));
  });

  it("writes a value back as bits, negative values as signed, and refuses what does not fit", () => {
    expect(bitsText(bitsOf(-1, 8))).toBe("1111 1111");
    expect(bitsText(bitsOf(5, 6))).toBe("00 0101");
    expect(() => bitsOf(256, 8)).toThrow(/does not fit/);
    expect(() => bitsOf(-129, 8)).toThrow(/does not fit/);
    expect(() => parseBits("012")).toThrow(/not a row of bits/);
  });
});

describe("recordings", () => {
  it("are the same on every call, and their noise scales without changing shape", () => {
    expect(recording("compressor").samples).toEqual(recording("compressor").samples);
    const a = recording("compressor", 1).samples;
    const b = recording("compressor", 2).samples;
    const sent = recording("compressor").sent;
    b.forEach((s, i) => {
      const level = sent[i] ? 330 : 0;
      expect(Math.abs(s - level - 2 * (a[i]! - level))).toBeLessThanOrEqual(1);
    });
  });

  it("read a sample on the threshold as 1, and find the band between the two kinds", () => {
    const rec = {
      id: "quiet" as const,
      sent: [0, 1] as const,
      low: 0,
      high: 330,
      samples: [100, 150],
    };
    expect(readBits(rec, 150).read).toEqual([0, 1]);
    expect(readBits(rec, 151).wrong).toEqual([1]);
    expect(readBits(rec, 100).wrong).toEqual([0]);
    expect(safeBand(rec)).toEqual({ from: 101, to: 150 });
    expect(safeBand({ ...rec, samples: [150, 150] })).toBeUndefined();
  });
});

describe("answer graders", () => {
  it("parse numbers and hexadecimal as a learner types them", () => {
    expect(parseNumber(" 65,286 ")).toBe(65286);
    expect(parseNumber("−250")).toBe(-250);
    expect(parseNumber("1.7.0")).toBeUndefined();
    expect(parseHex("0xff 06")).toBe("FF06");
    expect(parseHex("FG")).toBeUndefined();
  });

  it("say which field is missing or unreadable instead of grading", () => {
    const word = ANSWER_GRADERS["word"]!;
    expect(word({ bits: "0".repeat(16) }, { check: "hex" }, {})).toEqual({ missing: ["hex"] });
    expect(word({ bits: "0".repeat(16), hex: "zz" }, { check: "hex" }, {})).toEqual({
      invalid: "hex",
    });
    const t = ANSWER_GRADERS["threshold"]!;
    const r = t({ threshold: "1.70" }, { recording: "compressor" }, { margin: 30 });
    expect(isProblem(r)).toBe(false);
    expect(r).toMatchObject({
      pass: true,
      actual: { marginBelow: "0.59 V", marginAbove: "0.55 V" },
    });
  });
});
