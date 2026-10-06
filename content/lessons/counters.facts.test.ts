// Copyright © 2026 Chris Snow

// Facts the counters lesson's prose states, read off the figures that show them.

import { describe, expect, it } from "vitest";

import { formatWord, parseWord } from "@dd/sim";

import { counters } from "./counters";
import {
  explorerSim,
  faultRun,
  healthyRun,
  outputsNow,
  predictionAnswer,
  testCountOf,
} from "./module5-facts";

describe("facts for the counters lesson", () => {
  it("the predictions: sixteen edges from 0000 wrap to 0000; EN 0 keeps 0010; no reset stays XXXX", () => {
    expect(predictionAnswer(counters, "predict-wrap")).toBe("0000");
    expect(predictionAnswer(counters, "predict-pause")).toBe("0010");
    expect(predictionAnswer(counters, "predict-no-reset")).toBe("XXXX");
  });

  it("the fault lab: the healthy counter, and what each fault makes it do", () => {
    const q = (rows: Record<string, string>[]) => rows.map((r) => r["Q"]);
    expect(q(healthyRun(counters, "counter-faults"))).toEqual([
      "0000",
      "0001",
      "0010",
      "0011",
      "0100",
      "0101",
      "0101",
    ]);
    // The carry into bit 2 cut: the count goes back to 0000 after 0011.
    const cut = faultRun(counters, "counter-faults", 0);
    expect(cut.failed).toEqual(["edge 4", "edge 5", "edge with EN 0"]);
    expect(q(cut.seen)).toEqual(["0000", "0001", "0010", "0011", "0000", "0001", "0001"]);
    // EN held at 1: the edge with EN 0 counts anyway.
    const en = faultRun(counters, "counter-faults", 1);
    expect(en.failed).toEqual(["edge with EN 0"]);
    expect(q(en.seen).at(-1)).toBe("0110");
    // Bit 0's XOR made an OR: bit 0 stays 1 after the first count, so the count goes up by 2.
    const or = faultRun(counters, "counter-faults", 2);
    expect(or.failed).toEqual(["edge 2", "edge 3", "edge 4", "edge 5", "edge with EN 0"]);
    expect(q(or.seen)).toEqual(["0000", "0001", "0011", "0101", "0111", "1001", "1001"]);
    expect(cut.total).toBe(7);
  });

  it("the adder alone: 0111 with EN 0 gives 0111; EN to 1 passes 0110, 0100, 0000 before 1000", () => {
    const { sim, circuit } = explorerSim(counters, "add-one");
    expect(outputsNow(sim, circuit)).toEqual({ NEXT: "0111", COUT: "0" });
    sim.setInput("EN", parseWord("1", 1));
    sim.settle();
    const next = circuit.outputs.find((o) => o.name === "NEXT")!.net;
    const steps = sim.lastSettle!.history.map((h) => formatWord(h[next]!));
    expect(steps).toEqual(["0111", "0111", "0110", "0100", "0000", "1000"]);
    // The explorer's status line counts the steps after the first: "Settled in 5 steps".
    expect(steps.length - 1).toBe(5);
    sim.setInput("Q", parseWord("1111", 4));
    sim.settle();
    expect(outputsNow(sim, circuit)).toEqual({ NEXT: "0000", COUT: "1" });
  });

  it("counting to five: TICK is 1 at 0101, and the next edge gives 0000", () => {
    const { sim, circuit } = explorerSim(counters, "count-to-five");
    const seen: string[] = [];
    for (let i = 0; i < 7; i++) {
      const o = outputsNow(sim, circuit);
      seen.push(`${o["Q"]}/${o["TICK"]}`);
      sim.clockCycle("CLK");
    }
    expect(seen).toEqual(["0000/0", "0001/0", "0010/0", "0011/0", "0100/0", "0101/1", "0000/0"]);
  });

  it("the counter explorer starts unknown, and a reset edge gives 0000", () => {
    const { sim, circuit } = explorerSim(counters, "counter-explorer");
    expect(outputsNow(sim, circuit)["Q"]).toBe("XXXX");
    sim.setInput("RST", parseWord("1", 1));
    sim.clockCycle("CLK");
    expect(outputsNow(sim, circuit)).toEqual({ Q: "0000", TICK: "0" });
  });

  it("the challenges' test counts, as the page states them", () => {
    expect([testCountOf(counters, "count-two"), testCountOf(counters, "count-tick")]).toEqual([
      9, 21,
    ]);
  });
});
