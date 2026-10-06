// Copyright © 2026 Christopher Snow

import { describe, expect, it } from "vitest";

import { CircuitBuilder } from "./circuit";
import { applyMetastabilityOverlay } from "./metastability";
import { Simulator } from "./simulator";
import { bit1, formatWord, unknown } from "./values";

function undecided() {
  // An output the model leaves unknown: a buffer of an input nobody has driven.
  const b = new CircuitBuilder("undecided");
  const d = b.input("D");
  b.output("Q", b.gate("buf", [d], { delay: 10 }));
  return b.build();
}

describe("the metastability overlay", () => {
  it("does nothing when the output is known", () => {
    const sim = new Simulator(undecided(), { timeModel: "delay" });
    sim.setInput("D", bit1);
    sim.run();
    const r = applyMetastabilityOverlay(sim, { output: "Q", seed: 7 });
    expect(r.applied).toBe(false);
    expect(formatWord(sim.read("Q"))).toBe("1");
  });

  it("draws a settling delay and a value from the seed, schedules them, and records the draw", () => {
    const sim = new Simulator(undecided(), { timeModel: "delay" });
    sim.setInput("D", unknown(1));
    sim.run();
    expect(formatWord(sim.read("Q"))).toBe("X");
    const r = applyMetastabilityOverlay(sim, { output: "Q", seed: 7, settleBetween: [5, 60] });
    expect(r.applied).toBe(true);
    expect(r.settlesAt).toBeGreaterThanOrEqual(5);
    expect(r.settlesAt).toBeLessThanOrEqual(60);
    expect(formatWord(sim.read("Q"))).toBe(String(r.settlesTo));
    const overlay = sim.trace.events.find((e) => e.cause === "overlay");
    expect(overlay?.note).toMatch(/seed 7/);
  });

  it("the same seed reproduces the same divergence; a different seed may not", () => {
    const run = (seed: number) => {
      const sim = new Simulator(undecided(), { timeModel: "delay" });
      sim.setInput("D", unknown(1));
      sim.run();
      return applyMetastabilityOverlay(sim, { output: "Q", seed });
    };
    expect(run(42)).toEqual(run(42));
    const draws = new Set(
      Array.from({ length: 20 }, (_, i) => `${run(i).settlesAt}:${run(i).settlesTo}`),
    );
    expect(draws.size).toBeGreaterThan(1);
  });
});
