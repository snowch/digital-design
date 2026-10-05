// Copyright © 2026 Chris Snow

import { describe, expect, it } from "vitest";

import { CircuitBuilder } from "./circuit";
import { applyMetastabilityOverlay } from "./metastability";
import { Simulator } from "./simulator";
import { bit1, formatWord } from "./values";

describe("the overlay, told when the output became undecided", () => {
  it("marks the output unknown from that moment and resolves it by the draw, whatever the gates said", () => {
    const b = new CircuitBuilder("decided");
    const d = b.input("D");
    b.output("Q", b.gate("buf", [d], { delay: 10 }));
    const sim = new Simulator(b.build(), { timeModel: "delay" });
    sim.setInput("D", bit1);
    sim.run();
    expect(formatWord(sim.read("Q"))).toBe("1");
    const r = applyMetastabilityOverlay(sim, {
      output: "Q",
      seed: 3,
      from: 100,
      settleBetween: [20, 40],
    });
    expect(r.applied).toBe(true);
    expect(r.from).toBe(100);
    const q = sim.resolve("Q");
    const overlay = sim.trace.events.filter((e) => e.net === q && e.cause === "overlay");
    expect(overlay.map((e) => `${e.time}:${formatWord(e.value)}`)).toEqual([
      `100:X`,
      `${r.settlesAt}:${r.settlesTo}`,
    ]);
    expect(r.settlesAt).toBeGreaterThanOrEqual(120);
    expect(r.settlesAt).toBeLessThanOrEqual(140);
  });
});
