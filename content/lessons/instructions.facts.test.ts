// Copyright © 2026 Christopher Snow

// Facts the register jobs lesson's prose states, read off the figures that show them.

import { describe, expect, it } from "vitest";

import { instructionWord } from "@dd/dd-model";

import { instructions } from "./instructions";
import { afterInstruction, figureAnswer } from "./module8-facts";
import { testCountOf } from "./module3-facts";

describe("facts for the register jobs lesson", () => {
  it("the instructions' words, digit by digit", () => {
    const hex = (t: string) => instructionWord(t).toString(16).toUpperCase().padStart(8, "0");
    expect(hex("R3 <= R1 - R2")).toBe("13123000");
    expect(hex("R3 <= R1 + R2")).toBe("12123000");
    expect(hex("R4 <= R2")).toBe("15024000");
    expect(hex("R1 <= R1 + 1")).toBe("16101000");
  });

  it("the prediction: R1 is -184, R2 is -250, and R3 takes R1 - R2 = 66", () => {
    expect(figureAnswer(instructions, "predict-difference")).toBe("66");
    expect(afterInstruction(instructions, "predict-difference", 0)).toMatchObject({
      R1: "-184",
      R2: "-250",
      R3: "66",
    });
  });

  it("the investigation: each instruction's edge", () => {
    const after = (k: number) => afterInstruction(instructions, "jobs", k);
    expect(after(0)).toMatchObject({ R3: "66", R4: "X" });
    expect(after(1)).toMatchObject({ R3: "-434" });
    expect(after(2)).toMatchObject({ R4: "-250", R3: "X" });
    expect(after(3)).toMatchObject({ R1: "-183" });
    // WRITEY 0: nothing is written.
    expect(after(4)).toMatchObject({ R1: "-184", R2: "-250", R3: "X", R4: "X" });
  });

  it("the faults: the Y digit held at 0 writes R0; OP0 held at 0 makes subtract an add", () => {
    const after = (k: number, f: number) => afterInstruction(instructions, "jobs-faults", k, f);
    expect(after(0, 0)).toMatchObject({ R0: "66", R3: "X" });
    expect(after(1, 0)).toMatchObject({ R0: "-434", R3: "X" });
    expect(after(0, 1)).toMatchObject({ R3: "-434" });
    expect(after(1, 1)).toMatchObject({ R3: "-434" });
  });

  it("the challenges' test counts", () => {
    expect([
      testCountOf(instructions, "digits-text"),
      testCountOf(instructions, "jobs-text"),
    ]).toEqual([9, 10]);
  });
});
