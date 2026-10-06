// Copyright © 2026 Christopher Snow

// Facts the register-transfer lesson's prose states, read off the figures that show them.

import { describe, expect, it } from "vitest";

import { parseWord } from "@dd/sim";

import { registerTransfer } from "./register-transfer";
import { explorerSim, outputsNow, predictionAnswer, testCountOf } from "./module5-facts";

describe("facts for the register-transfer lesson", () => {
  it("the predictions: PREV gets the old NOW; a long press loses it; the swap trades the words", () => {
    expect(predictionAnswer(registerTransfer, "predict-prev")).toBe("0011");
    expect(predictionAnswer(registerTransfer, "predict-long-press")).toBe("0101");
    expect(predictionAnswer(registerTransfer, "predict-swap")).toBe("0101");
  });

  it("the explorer starts at 0000 and 0000; one edge with SAVE 1 moves both", () => {
    const { sim, circuit } = explorerSim(registerTransfer, "now-prev-explorer");
    expect(outputsNow(sim, circuit)).toEqual({ NOW: "0000", PREV: "0000" });
    sim.setInput("IN", parseWord("0110", 4));
    sim.setInput("SAVE", parseWord("1", 1));
    sim.clockCycle("CLK");
    expect(outputsNow(sim, circuit)).toEqual({ NOW: "0110", PREV: "0000" });
  });

  it("saving once per press: starts at 0011 with IN 0101; SAVE held for three edges saves once", () => {
    const { sim, circuit } = explorerSim(registerTransfer, "save-once");
    expect(outputsNow(sim, circuit)).toEqual({ NOW: "0011", PREV: "0000", OLD: "0", STEP: "0" });
    sim.setInput("SAVE", parseWord("1", 1));
    sim.settle();
    // STEP is 1 before the first edge of the press only.
    expect(outputsNow(sim, circuit)["STEP"]).toBe("1");
    const seen: string[] = [];
    for (let i = 0; i < 3; i++) {
      sim.clockCycle("CLK");
      const o = outputsNow(sim, circuit);
      seen.push(`${o["NOW"]}/${o["PREV"]} OLD ${o["OLD"]} STEP ${o["STEP"]}`);
    }
    expect(seen).toEqual([
      "0101/0011 OLD 1 STEP 0",
      "0101/0011 OLD 1 STEP 0",
      "0101/0011 OLD 1 STEP 0",
    ]);
    // Released for one edge, then pressed again: the new press saves.
    sim.setInput("SAVE", parseWord("0", 1));
    sim.clockCycle("CLK");
    sim.setInput("IN", parseWord("1001", 4));
    sim.setInput("SAVE", parseWord("1", 1));
    sim.clockCycle("CLK");
    expect(outputsNow(sim, circuit)).toMatchObject({ NOW: "1001", PREV: "0101" });
  });

  it("the challenges' test counts, as the page states them", () => {
    expect([
      testCountOf(registerTransfer, "now-prev"),
      testCountOf(registerTransfer, "readings"),
    ]).toEqual([7, 7]);
  });
});
