// Copyright © 2026 Christopher Snow

// Facts the loads and stores lesson's prose states, read off the figures that show them.

import { describe, expect, it } from "vitest";

import { assemble, datapathRamWord, instructionHex } from "@dd/dd-model";
import { grade } from "@dd/dd-views";
import { parseLesson } from "@dd/lesson-schema";

import { memoryAccess, SHOW_MARGIN } from "./memory-access";
import { figureAnswer, runToStop, signed } from "./module8-facts";
import { MEMCHECK_REFERENCE } from "./module8";
import { testCountOf } from "./module3-facts";

describe("facts for the loads and stores lesson", () => {
  it("the program's words and addresses", () => {
    expect(
      assemble(SHOW_MARGIN).lines.map(
        (l) =>
          `${l.address.toString(16).toUpperCase().padStart(3, "0")} ${instructionHex(l.instruction ?? 0)}`,
      ),
    ).toEqual([
      "000 380027D8",
      "004 380037E0",
      "008 13234000",
      "00C 48040400",
      "010 480407C0",
      "014 25005005",
      "018 480507C8",
      "01C 84000000",
    ]);
    expect([0x7d8, 0x7e0]).toEqual([2008, 2016]);
  });

  it("the prediction: the first edge loads room A's -184 into R2", () => {
    expect(figureAnswer(memoryAccess, "predict-load")).toBe("-184");
  });

  it("the program: 66 on the display and at 400, lamps 101, stopped after 8 edges at 01C", () => {
    const r = runToStop(memoryAccess, "show-margin");
    expect([r.reason, r.edges, r.state.pc]).toEqual(["stop", 8, 0x1cn]);
    expect(r.state.regs.slice(2, 6).map(signed)).toEqual(["-184", "-250", "66", "5"]);
    expect(signed(r.state.display)).toBe("66");
    expect(r.state.lamps).toBe(0b101);
    expect(signed(datapathRamWord(r.state, 0x400))).toBe("66");
  });

  it("the faults: LOAD at 0 writes the addresses and shows -8; STORE at 1 stops at once with 34", () => {
    const load = runToStop(memoryAccess, "memory-faults", 0);
    expect(load.state.regs.slice(2, 5).map(signed)).toEqual(["2008", "2016", "-8"]);
    expect(signed(load.state.display)).toBe("-8");
    const store = runToStop(memoryAccess, "memory-faults", 1);
    expect([store.reason, store.edges, store.state.pc]).toEqual(["34", 1, 0n]);
    expect(store.state.regs[2]).toBeUndefined();
  });

  it("the challenges' test counts", () => {
    expect([
      testCountOf(memoryAccess, "memcheck-text"),
      testCountOf(memoryAccess, "memory-text"),
    ]).toEqual([16, 10]);
  });

  it("a memcheck that tests 33 before 34 fails where both apply: a store byte at a sensor", () => {
    const c = parseLesson(memoryAccess).challenges.find((x) => x.id === "memcheck-text");
    const lines = MEMCHECK_REFERENCE.split("\n");
    const at = (text: string) => lines.findIndex((l) => l.includes(text));
    const s34 = at("ADDR[10] == 1'b0");
    const b33 = at("BYTE & (ADDR[10:6]");
    // The 34 checks (three lines) moved after the two 33 checks.
    const reordered = [
      ...lines.slice(0, s34),
      ...lines.slice(b33, b33 + 2),
      ...lines.slice(s34, b33),
      ...lines.slice(b33 + 2),
    ].join("\n");
    expect(reordered).not.toBe(MEMCHECK_REFERENCE);
    expect(c && grade(c, { hdl: reordered }).failures.map((f) => f.label)).toEqual([
      "store byte at 7D8",
    ]);
  });
});
