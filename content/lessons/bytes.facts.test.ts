// Copyright © 2026 Christopher Snow

// Facts the bytes lesson's prose states, read off the figures that show them.

import { describe, expect, it } from "vitest";

import { FILLED_BYTES } from "@dd/dd-model";

import { PROSE } from "./bytes.prose";
import { bytes } from "./bytes";
import { answer, checks, options } from "./module6-facts";

const hex = (bits: string) => parseInt(bits, 2).toString(16).toUpperCase().padStart(4, "0");

describe("facts for the bytes lesson", () => {
  it("the predictions' answers are the ones their explanations give", () => {
    for (const [id, value, explain] of [
      ["predict-high-byte", "00FF", PROSE.p1Explain],
      ["predict-half-word", "1248", PROSE.p2Explain],
      ["predict-odd-word", "FF48", PROSE.p3Explain],
    ] as const) {
      const got = answer(bytes, id);
      expect(hex(got), id).toBe(value);
      expect(options(bytes, id)).toContain(got);
      expect(explain).toContain(`\`${value}\``);
    }
  });

  it("the fault lab fails 2 of 5 and 3 of 5, with the words the prose names", () => {
    const or = checks(bytes, "bytes-faults", 0);
    expect(or.total).toBe(5);
    expect(or.failed).toEqual(["word 0000 at 0101", "read the word at 0100"]);
    expect(or.got.map((g) => hex(g["Q"]!))).toEqual(["0048", "0048"]);
    const cut = checks(bytes, "bytes-faults", 1);
    expect(cut.failed).toHaveLength(3);
    expect(cut.got[0]!["Q"]).toBe("11111111XXXXXXXX");
    expect(hex(cut.got[2]!["Q"]!)).toBe("FF00");
    expect(PROSE.faultsAfter).toContain("2 of 5");
    expect(PROSE.faultsAfter).toContain("3 of 5");
  });

  it("the motivation's example and the hint's example are the memory's bytes", () => {
    expect(FILLED_BYTES[2]).toBe(0x48);
    expect(FILLED_BYTES[3]).toBe(0xff);
    expect(PROSE.c2Hints[2]).toContain("`48` and `FF`");
  });
});
