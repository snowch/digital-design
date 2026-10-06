// Copyright © 2026 Christopher Snow

// Facts the memory-map lesson's prose states, read off the figures that show them.

import { describe, expect, it } from "vitest";

import { SHOP_TABLE_WORDS } from "@dd/dd-model";

import { LOWEST, SENSOR, memoryMap } from "./memory-map";
import { PROSE } from "./memory-map.prose";
import { answer, checks, options, testsOf } from "./module6-facts";

const hex = (bits: string) => parseInt(bits, 2).toString(16).toUpperCase().padStart(4, "0");

describe("facts for the memory-map lesson", () => {
  it("the predictions' answers are the ones their explanations give", () => {
    for (const [id, value, explain] of [
      ["predict-display", "0030", PROSE.p1Explain],
      ["predict-sensor-write", "FF48", PROSE.p2Explain],
    ] as const) {
      const got = answer(memoryMap, id);
      expect(hex(got), id).toBe(value);
      expect(options(memoryMap, id)).toContain(got);
      expect(explain).toContain(`\`${value}\``);
    }
    expect(hex(SENSOR)).toBe("FF48");
  });

  it("the fault lab fails 5 of 6 and 1 of 6, with the words the prose names", () => {
    const or = checks(memoryMap, "map-faults", 0);
    expect(or.total).toBe(6);
    expect(or.failed).toHaveLength(5);
    expect(hex(or.got[0]!["DISPLAY"]!)).toBe("03E8");
    const ram = checks(memoryMap, "map-faults", 1);
    expect(ram.failed).toEqual(["read 01 0000"]);
    expect(hex(ram.got[0]!["Q"]!)).toBe("0012");
    expect(PROSE.faultsAfter).toContain("5 of 6");
    expect(PROSE.faultsAfter).toContain("1 of 6");
  });

  it("the ROM challenge's words are the table's first four, as the task lists them", () => {
    expect(LOWEST).toEqual(SHOP_TABLE_WORDS.slice(0, 4));
    for (const w of LOWEST)
      expect(PROSE.c1Task).toContain(w.toString(16).toUpperCase().padStart(4, "0"));
    expect(testsOf(memoryMap, "rom-table")).toBe(4);
    expect(testsOf(memoryMap, "shop-memory")).toBe(10);
  });
});
