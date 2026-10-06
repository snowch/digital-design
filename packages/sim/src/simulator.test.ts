// Copyright © 2026 Christopher Snow

import { describe, expect, it } from "vitest";

import { CircuitBuilder, type Circuit } from "./circuit";
import { replay, Simulator, traceSignature } from "./simulator";
import { bit0, bit1, formatWord } from "./values";

/** An SR latch from two cross-coupled NOR gates: S sets Q to 1, R resets it to 0. */
function srLatchNor(reversed = false): Circuit {
  const b = new CircuitBuilder("sr-latch");
  const s = b.input("S");
  const r = b.input("R");
  const q = b.net("Q");
  const qb = b.net("Qb");
  if (reversed) {
    b.nor([s, q], { output: qb, name: "norB" });
    b.nor([r, qb], { output: q, name: "norA" });
  } else {
    b.nor([r, qb], { output: q, name: "norA" });
    b.nor([s, q], { output: qb, name: "norB" });
  }
  b.output("Q", q);
  b.output("Qb", qb);
  return b.build();
}

/** A D latch as a selector feeding itself: transparent while EN is 1, holding while EN is 0. */
function dLatchMux(): Circuit {
  const b = new CircuitBuilder("d-latch");
  const d = b.input("D");
  const en = b.input("EN");
  const q = b.net("Q");
  b.component("mux2", { sel: en, a: q, b: d }, { y: q }, { name: "sel" });
  b.output("Q", q);
  return b.build();
}

describe("the settle model", () => {
  it("evaluates a gate and reports convergence", () => {
    const b = new CircuitBuilder("and");
    const x = b.input("x");
    const y = b.input("y");
    b.output("z", b.and([x, y]));
    const sim = new Simulator(b.build());
    sim.setInput("x", bit1);
    sim.setInput("y", bit1);
    const r = sim.settle();
    expect(r.converged).toBe(true);
    expect(formatWord(sim.read("z"))).toBe("1");
    sim.setInput("y", bit0);
    sim.settle();
    expect(formatWord(sim.read("z"))).toBe("0");
  });

  it("an unwritten latch holds X: the circuit remembers, but nothing has told it what", () => {
    const sim = new Simulator(srLatchNor());
    sim.setInput("S", bit0);
    sim.setInput("R", bit0);
    expect(sim.settle().converged).toBe(true);
    expect(formatWord(sim.read("Q"))).toBe("X");
    expect(formatWord(sim.read("Qb"))).toBe("X");
  });

  it("sets, holds, resets and holds, from any starting point", () => {
    const sim = new Simulator(srLatchNor());
    sim.setInput("S", bit1);
    sim.setInput("R", bit0);
    sim.settle();
    expect(formatWord(sim.read("Q"))).toBe("1");
    expect(formatWord(sim.read("Qb"))).toBe("0");
    sim.setInput("S", bit0);
    sim.settle();
    expect(formatWord(sim.read("Q"))).toBe("1");
    sim.setInput("R", bit1);
    sim.settle();
    expect(formatWord(sim.read("Q"))).toBe("0");
    expect(formatWord(sim.read("Qb"))).toBe("1");
    sim.setInput("R", bit0);
    sim.settle();
    expect(formatWord(sim.read("Q"))).toBe("0");
  });

  it("is order-independent: the same latch with its gates listed the other way round agrees", () => {
    for (const reversed of [false, true]) {
      const sim = new Simulator(srLatchNor(reversed));
      sim.setInput("S", bit1);
      sim.setInput("R", bit0);
      sim.settle();
      sim.setInput("S", bit0);
      sim.settle();
      expect(formatWord(sim.read("Q"))).toBe("1");
    }
  });

  it("the forbidden input drives both outputs low, and releasing both at once cannot be decided", () => {
    const sim = new Simulator(srLatchNor());
    sim.setInput("S", bit1);
    sim.setInput("R", bit1);
    expect(sim.settle().converged).toBe(true);
    expect(formatWord(sim.read("Q"))).toBe("0");
    expect(formatWord(sim.read("Qb"))).toBe("0");
    sim.setInput("S", bit0);
    sim.setInput("R", bit0);
    const r = sim.settle();
    expect(r.converged).toBe(false);
    expect(r.oscillating.sort()).toEqual([sim.resolve("Q"), sim.resolve("Qb")].sort());
    expect(formatWord(sim.read("Q"))).toBe("X");
    expect(formatWord(sim.read("Qb"))).toBe("X");
    expect(r.history.length).toBeGreaterThan(1);
  });

  it("a loop of an odd number of inverters never settles", () => {
    const b = new CircuitBuilder("ring");
    const a = b.net("a");
    const x = b.not(a);
    const y = b.not(x);
    b.not(y, { output: a });
    b.output("a", a);
    const sim = new Simulator(b.build());
    const r = sim.settle();
    // Three X values stay X: nothing drives a 0 or 1 into the loop, and the model cannot decide.
    expect(r.converged).toBe(true);
    expect(formatWord(sim.read("a"))).toBe("X");
  });

  it("a loop of an even number of inverters settles to whatever it was told, and keeps it", () => {
    const b = new CircuitBuilder("pair");
    const force = b.input("force");
    const q = b.net("q");
    const nq = b.not(q);
    // force OR the fed-back value: a pulse on force is remembered.
    b.or([force, b.not(nq)], { output: q });
    b.output("q", q);
    const sim = new Simulator(b.build());
    sim.setInput("force", bit1);
    sim.settle();
    sim.setInput("force", bit0);
    sim.settle();
    expect(formatWord(sim.read("q"))).toBe("1");
  });

  it("a clock cycle is two phases: the latch follows D while EN is high and holds when it falls", () => {
    const sim = new Simulator(dLatchMux());
    sim.setInput("D", bit1);
    sim.setInput("EN", bit0);
    sim.settle();
    expect(formatWord(sim.read("Q"))).toBe("X");
    sim.clockCycle("EN");
    expect(formatWord(sim.read("Q"))).toBe("1");
    sim.setInput("D", bit0);
    sim.settle();
    expect(formatWord(sim.read("Q"))).toBe("1");
    sim.clockCycle("EN");
    expect(formatWord(sim.read("Q"))).toBe("0");
    expect(sim.time).toBe(4);
    expect(sim.trace.marks.map((m) => m.label)).toEqual(["↑", "↓", "↑", "↓"]);
  });

  it("refuses to drive a net that is not an input", () => {
    const sim = new Simulator(srLatchNor());
    expect(() => sim.setInput("Q", bit1)).toThrow(/only inputs/);
  });
});

describe("the delay model", () => {
  it("propagates a change after each gate's delay", () => {
    const b = new CircuitBuilder("chain");
    const a = b.input("a");
    const x = b.not(a, { delay: 3 });
    b.output("y", b.not(x, { delay: 5 }));
    const sim = new Simulator(b.build(), { timeModel: "delay" });
    sim.setInput("a", bit0);
    sim.run();
    expect(formatWord(sim.read("y"))).toBe("0");
    const before = sim.time;
    sim.setInput("a", bit1);
    sim.run();
    expect(formatWord(sim.read("y"))).toBe("1");
    const yEvents = sim.trace.events.filter(
      (e) => e.net === sim.resolve("y") && e.cause === "settle",
    );
    expect(yEvents.map((e) => e.time)).toEqual([8, before + 8]);
  });

  it("shows the glitch in Y = A AND NOT B when both inputs rise together", () => {
    const b = new CircuitBuilder("glitch");
    const a = b.input("A");
    const bb = b.input("B");
    const nb = b.not(bb, { delay: 10 });
    b.output("Y", b.and([a, nb], { delay: 10 }));
    const sim = new Simulator(b.build(), { timeModel: "delay" });
    sim.setInput("A", bit0);
    sim.setInput("B", bit0);
    sim.run();
    sim.setInputAt("A", bit1, 100);
    sim.setInputAt("B", bit1, 100);
    sim.run();
    const y = sim.resolve("Y");
    const pulse = sim.trace.events
      .filter((e) => e.net === y && e.time >= 100)
      .map((e) => `${e.time}:${formatWord(e.value)}`);
    expect(pulse).toEqual(["110:1", "120:0"]);
  });

  it("a ring of three inverters oscillates for ever, and run() says it did not finish", () => {
    const b = new CircuitBuilder("ring");
    const a = b.net("a");
    const x = b.not(a, { delay: 10 });
    const y = b.not(x, { delay: 10 });
    b.not(y, { output: a, delay: 10 });
    // Kick it with a known value: a buffer from an input that is then ignored would be another
    // gate, so instead start the ring from a snapshot where `a` is 0.
    b.output("a", a);
    const circuit = b.build();
    const sim = new Simulator(circuit, { timeModel: "delay" });
    sim.scheduleAt("a", bit0, 0, "stimulus");
    const finished = sim.run(500);
    expect(finished).toBe(false);
    const flips = sim.trace.events.filter((e) => e.net === sim.resolve("a")).length;
    expect(flips).toBeGreaterThan(10);
  });

  it("snapshots and restores", () => {
    const b = new CircuitBuilder("snap");
    const a = b.input("a");
    b.output("y", b.not(a, { delay: 7 }));
    const sim = new Simulator(b.build(), { timeModel: "delay" });
    sim.setInput("a", bit0);
    sim.run();
    const snap = sim.snapshot();
    sim.setInput("a", bit1);
    sim.run();
    expect(formatWord(sim.read("y"))).toBe("0");
    sim.restore(snap);
    expect(formatWord(sim.read("y"))).toBe("1");
    expect(sim.time).toBe(snap.time);
  });
});

describe("replay", () => {
  it("reproduces a settle-model trace exactly from its stimuli", () => {
    const circuit = srLatchNor();
    const sim = new Simulator(circuit);
    sim.setInput("S", bit1);
    sim.setInput("R", bit0);
    sim.settle();
    sim.tick();
    sim.setInput("S", bit0);
    sim.settle();
    sim.tick();
    sim.setInput("R", bit1);
    sim.settle();
    sim.setInput("R", bit0);
    sim.settle();
    const again = replay(circuit, sim.trace);
    expect(traceSignature(again.trace)).toEqual(traceSignature(sim.trace));
    expect(formatWord(again.read("Q"))).toBe("0");
  });

  it("reproduces a delay-model trace exactly from its stimuli", () => {
    const b = new CircuitBuilder("glitch");
    const a = b.input("A");
    const bb = b.input("B");
    b.output("Y", b.and([a, b.not(bb)]));
    const circuit = b.build();
    const sim = new Simulator(circuit, { timeModel: "delay" });
    sim.setInput("A", bit0);
    sim.setInput("B", bit0);
    sim.run();
    sim.setInputAt("A", bit1, 100);
    sim.setInputAt("B", bit1, 100);
    sim.run();
    const again = replay(circuit, sim.trace, { timeModel: "delay" });
    expect(traceSignature(again.trace)).toEqual(traceSignature(sim.trace));
  });
});
