import { applyMetastabilityOverlay, bit0, bit1, formatWord, Simulator } from "@dd/sim";
import { describe, expect, it } from "vitest";

import { dFlipFlopCircuit } from "./library";

/**
 * Where D changes relative to a rising edge at time 1000, and what Q then does. The lesson's
 * setup-and-hold explorer draws from this behaviour, so it is pinned here: a change to the gate
 * model that moved the window would fail this test before it falsified a lesson.
 */
function captureEvents(offset: number): string[] {
  const sim = new Simulator(dFlipFlopCircuit({ delay: 10 }), { timeModel: "delay" });
  sim.setInput("D", bit0);
  sim.setInput("CLK", bit0);
  sim.run();
  sim.setInputAt("D", bit1, 1000 + offset);
  sim.setInputAt("CLK", bit1, 1000);
  sim.setInputAt("CLK", bit0, 1500);
  expect(sim.run(2000)).toBe(true);
  const q = sim.resolve("Q");
  return sim.trace.events
    .filter((e) => e.net === q && e.time >= 990)
    .map((e) => `${e.time}:${formatWord(e.value)}`);
}

describe("the flip-flop in the delay model, gate delay 10", () => {
  it("captures a D that settled early, three gate delays after the edge", () => {
    expect(captureEvents(-60)).toEqual(["1030:1"]);
    expect(captureEvents(-35)).toEqual(["1030:1"]);
  });

  it("captures a D that changed inside the setup window late, and shows the old value first", () => {
    expect(captureEvents(-30)).toEqual(["1020:0", "1040:1"]);
    expect(captureEvents(-15)).toEqual(["1020:0", "1045:1"]);
  });

  it("ignores a D that changed at or after the edge, and from ten units before it", () => {
    expect(captureEvents(-10)).toEqual(["1020:0"]);
    expect(captureEvents(0)).toEqual(["1020:0"]);
    expect(captureEvents(40)).toEqual(["1020:0"]);
  });

  it("never answers X by itself: a tie is decided by event order, which is why the overlay exists", () => {
    for (let offset = -40; offset <= 20; offset += 1) {
      for (const e of captureEvents(offset)) expect(e.endsWith(":X")).toBe(false);
    }
  });
});

describe("the overlay on the flip-flop", () => {
  it("holds the gate model off Q while Q is undecided, so the trace shows X and then the draw", () => {
    // D changes 15 units before the edge: the gate model alone shows Q rising late, at 1045.
    const run = (seed?: number) => {
      const sim = new Simulator(dFlipFlopCircuit({ delay: 10 }), { timeModel: "delay" });
      sim.setInput("D", bit0);
      sim.setInput("CLK", bit0);
      sim.setInputAt("CLK", bit1, 100);
      sim.setInputAt("CLK", bit0, 200);
      sim.setInputAt("D", bit1, 985);
      sim.setInputAt("CLK", bit1, 1000);
      sim.setInputAt("CLK", bit0, 1100);
      if (seed === undefined) {
        sim.run();
        return { sim };
      }
      sim.run(1020);
      const result = applyMetastabilityOverlay(sim, { output: "Q", seed, from: 1020 });
      return { sim, result };
    };
    const q = (sim: Simulator) =>
      sim.trace.events
        .filter((e) => e.net === sim.resolve("Q") && e.time >= 1000)
        .map((e) => `${e.time}:${formatWord(e.value)}:${e.cause}`);
    expect(q(run().sim)).toEqual(["1045:1:settle"]);
    const { sim, result } = run(3);
    expect(result?.applied).toBe(true);
    expect(q(sim)).toEqual(["1020:X:overlay", `${result?.settlesAt}:${result?.settlesTo}:overlay`]);
    // The same seed replays to the same draw.
    expect(q(run(3).sim)).toEqual(q(sim));
  });

  it("with Q a known 0, as the lesson's figure runs it: clean at 30 before, late 25 to 15, missed from 10", () => {
    const run = (offset: number) => {
      const sim = new Simulator(dFlipFlopCircuit({ delay: 10 }), { timeModel: "delay" });
      sim.setInput("D", bit0);
      sim.setInput("CLK", bit0);
      sim.setInputAt("CLK", bit1, 100);
      sim.setInputAt("CLK", bit0, 200);
      sim.setInputAt("D", bit1, 1000 + offset);
      sim.setInputAt("CLK", bit1, 1000);
      sim.setInputAt("CLK", bit0, 1100);
      sim.run(1300);
      const q = sim.resolve("Q");
      return sim.trace.events
        .filter((e) => e.net === q && e.time >= 1000)
        .map((e) => `${e.time}:${formatWord(e.value)}`);
    };
    expect(run(-30)).toEqual(["1030:1"]);
    expect(run(-25)).toEqual(["1035:1"]);
    expect(run(-15)).toEqual(["1045:1"]);
    expect(run(-10)).toEqual([]);
  });
});
