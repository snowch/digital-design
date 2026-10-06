// Copyright © 2026 Christopher Snow

// Facts the constant jobs lesson's prose states, read off the figures that show them.

import { describe, expect, it } from "vitest";

import { giveInstruction, figureState, instructionWord } from "@dd/dd-model";

import { constants } from "./constants";
import { afterInstruction, figureAnswer, figureSim, signed } from "./module8-facts";
import { figureOf, testCountOf } from "./module3-facts";

describe("facts for the constant jobs lesson", () => {
  it("the instructions' words; -100 is F9C in 12 bits, 3996 read unsigned; -250 is F06, 3846", () => {
    const hex = (t: string) => instructionWord(t).toString(16).toUpperCase().padStart(8, "0");
    expect(hex("R3 <= -100")).toBe("25003F9C");
    expect(0xf9c).toBe(3996);
    expect(hex("R3 <= R1 + 100")).toBe("22103064");
    expect(hex("R3 <= R1 & 0xFF")).toBe("201030FF");
    expect(hex("R4 <= 2047")).toBe("250047FF");
    expect(hex("R4 <= -2048")).toBe("25004800");
    expect(0xf06).toBe(3846);
    expect(hex("R6 <= 1800")).toBe("25006708");
  });

  it("the prediction: R3 takes -100, which no register holds", () => {
    expect(figureAnswer(constants, "predict-constant")).toBe("-100");
  });

  it("the investigation: each instruction's edge from R1 -184 and R2 -250", () => {
    const after = (k: number) => afterInstruction(constants, "constants", k);
    expect(after(0)).toMatchObject({ R3: "-100" });
    expect(after(1)).toMatchObject({ R3: "-84" });
    expect(after(2)).toMatchObject({ R3: "72" });
    expect(after(3)).toMatchObject({ R4: "2047" });
    expect(after(4)).toMatchObject({ R4: "-2048" });
    expect(after(5)).toMatchObject({ R3: "-434" });
  });

  it("the faults: the copied bit at 0 makes -100 3996; BCONST at 0 reads R0, which is X", () => {
    const after = (k: number, f: number) => afterInstruction(constants, "constants-faults", k, f);
    expect(after(0, 0)).toMatchObject({ R3: "3996" });
    expect(after(1, 0)).toMatchObject({ R3: "-84" });
    expect(after(0, 1)).toMatchObject({ R3: "X" });
    expect(after(1, 1)).toMatchObject({ R3: "X" });
  });

  it("the hour: 1800 doubled is 3600, which no constant holds", () => {
    const p = figureOf(constants, "hour") as {
      instructions: { text: string; set: Record<string, number> }[];
    };
    const sim = figureSim(constants, "hour");
    sim.clockCycle("CLK");
    expect(signed(figureState(sim).regs[6])).toBe("1800");
    giveInstruction(sim, sim.circuit, p.instructions[1]!);
    sim.clockCycle("CLK");
    expect(signed(figureState(sim).regs[6])).toBe("3600");
    expect(3600).toBeGreaterThan(2047);
  });

  it("the challenges' test counts", () => {
    expect([
      testCountOf(constants, "widen-text"),
      testCountOf(constants, "constants-text"),
    ]).toEqual([6, 8]);
  });
});
