// Facts the first lesson's prose will state, checked against the simulator before they are
// briefed. Each assertion is one sentence the lesson will make.

import { describe, expect, it } from "vitest";

import { dFlipFlopCircuit, inverterLoop, libraryCircuit } from "@dd/dd-model";
import { Simulator, bit0, bit1, formatWord } from "@dd/sim";

import { outputsPerStep } from "./interactives/script";
import { experiment } from "./interactives/SetupHold";

const f = (sim: Simulator, name: string) => formatWord(sim.read(name));

describe("facts for the lesson on memory", () => {
  it("an even loop of inverters keeps what it was kicked to; an odd loop never settles", () => {
    const two = new Simulator(inverterLoop(2));
    two.setInput("kick", bit0);
    expect(two.settle().converged).toBe(true); // nothing to compute from a cold start
    expect(f(two, "q")).toBe("X"); // and the loop's value is unknown until it is kicked
    two.setInput("kick", bit1);
    expect(two.settle().converged).toBe(true);
    expect(f(two, "q")).toBe("1");
    two.setInput("kick", bit0);
    expect(two.settle().converged).toBe(true);
    expect(f(two, "q")).toBe("1"); // remembers the kick

    const three = new Simulator(inverterLoop(3));
    three.setInput("kick", bit1);
    expect(three.settle().converged).toBe(true);
    three.setInput("kick", bit0);
    const r = three.settle();
    expect(r.converged).toBe(false);
    expect(f(three, "q")).toBe("X");
  });

  it("the SR latch: set, hold, reset, hold; both high gives both outputs low; release is undecided", () => {
    const sr = libraryCircuit("sr-latch");
    const steps = outputsPerStep(sr, [
      { set: { S: 1, R: 0 } },
      { set: { S: 0, R: 0 } },
      { set: { S: 0, R: 1 } },
      { set: { S: 0, R: 0 } },
      { set: { S: 1, R: 1 } },
      { set: { S: 0, R: 0 } },
    ]);
    const q = steps.map((s) => formatWord(s["Q"]!));
    const qb = steps.map((s) => formatWord(s["Qb"]!));
    expect(q).toEqual(["1", "1", "0", "0", "0", "X"]);
    expect(qb).toEqual(["0", "0", "1", "1", "0", "X"]);
  });

  it("the SR latch settles in a known number of steps", () => {
    const sim = new Simulator(libraryCircuit("sr-latch"));
    sim.setInput("S", bit0);
    sim.setInput("R", bit0);
    sim.settle();
    sim.setInput("S", bit1);
    const r = sim.settle();
    expect(r.converged).toBe(true);
    expect(r.iterations).toBe(3); // Qb falls, then Q rises, then nothing changes
  });

  it("the D latch copies D while EN is 1 and holds while EN is 0", () => {
    const steps = outputsPerStep(libraryCircuit("d-latch"), [
      { set: { D: 1, EN: 1 } },
      { set: { D: 0, EN: 1 } },
      { set: { D: 0, EN: 0 } },
      { set: { D: 1, EN: 0 } },
      { set: { D: 1, EN: 1 } },
    ]);
    expect(steps.map((s) => formatWord(s["Q"]!))).toEqual(["1", "0", "0", "0", "1"]);
  });

  it("the flip-flop moves Q only at the rising edge", () => {
    const steps = outputsPerStep(libraryCircuit("dff"), [
      { set: { D: 1, CLK: 0 } },
      { set: { D: 1 }, clock: "CLK" },
      { set: { D: 0 } },
      { set: { D: 0 }, clock: "CLK" },
      { set: { D: 1 } },
    ]);
    expect(steps.map((s) => formatWord(s["Q"]!))).toEqual(["X", "1", "1", "0", "0"]);
  });

  it("the flip-flop's master follows D while CLK is low and the slave shows it after the edge", () => {
    const dff = libraryCircuit("dff");
    const sim = new Simulator(dff);
    sim.setInput("CLK", bit0);
    sim.setInput("D", bit1);
    sim.settle();
    const masterQ = dff.nets.find((n) => n.name === "dff/master/sr/Q")!;
    const slaveQ = dff.nets.find((n) => n.name === "dff/slave/sr/Q")!;
    expect(formatWord(sim.read(masterQ.id))).toBe("1");
    expect(formatWord(sim.read(slaveQ.id))).toBe("X");
    sim.clockCycle("CLK");
    expect(formatWord(sim.read("Q"))).toBe("1");
    expect(dff.outputs.find((o) => o.name === "Q")!.net).toBe(slaveQ.id);
  });

  it("the gate-level flip-flop in the delay model: clean capture 3 gate delays after the edge", () => {
    const sim = new Simulator(libraryCircuit("dff"), { timeModel: "delay" });
    sim.setInput("D", bit0);
    sim.setInput("CLK", bit0);
    sim.setInputAt("CLK", bit1, 100);
    sim.setInputAt("CLK", bit0, 200);
    sim.setInputAt("D", bit1, 940);
    sim.setInputAt("CLK", bit1, 1000);
    sim.setInputAt("CLK", bit0, 1100);
    sim.run(1300);
    const q = sim.resolve("Q");
    expect(
      sim.trace.events.filter((e) => e.net === q && e.time >= 1000).map((e) => e.time),
    ).toEqual([1030]);
  });

  it("the flip-flop stepper's run: Q falls two gate delays after an edge and rises three", () => {
    const sim = new Simulator(dFlipFlopCircuit({ delay: 10 }), { timeModel: "delay" });
    sim.setInput("CLK", bit0);
    sim.setInput("D", bit0);
    const script: [number, string, 0 | 1][] = [
      [100, "CLK", 1],
      [200, "CLK", 0],
      [300, "D", 1],
      [400, "CLK", 1],
      [500, "CLK", 0],
      [550, "D", 0],
      [700, "CLK", 1],
      [800, "CLK", 0],
    ];
    for (const [t, input, v] of script) sim.setInputAt(input, v === 1 ? bit1 : bit0, t);
    sim.run(900);
    const times = (name: string) => {
      const id = sim.resolve(name);
      return sim.trace.events
        .filter((e) => e.net === id)
        .map((e) => `${e.time}:${formatWord(e.value)}`);
    };
    expect(times("Q")).toEqual(["120:0", "430:1", "720:0"]);
    expect(times("dff/master/sr/Q")).toEqual(["30:0", "330:1", "580:0"]);
    expect(times("dff/notClk.y")).toContain("510:1");
  });

  it("the setup-and-hold figure: clean at 30 before the edge, late from 25 to 15, missed from 10", () => {
    const data = {
      delay: 10,
      edgeAt: 1000,
      offsets: [-80, 40] as [number, number],
      window: [-25, -15] as [number, number],
      settleBetween: [5, 60] as [number, number],
      undecidedFrom: 20,
      show: [-120, 160] as [number, number],
    };
    const at = (offset: number) =>
      experiment(data, offset).qEvents.map((e) => `${e.time}:${e.value}`);
    expect(at(-35)).toEqual(["1030:1"]);
    expect(at(-30)).toEqual(["1030:1"]);
    expect(at(-25)).toEqual(["1035:1"]);
    expect(at(-20)).toEqual(["1040:1"]);
    expect(at(-15)).toEqual(["1045:1"]);
    expect(at(-10)).toEqual([]);
    expect(at(0)).toEqual([]);
    expect(at(20)).toEqual([]);
  });

  it("two D latches sharing one EN: while EN is 1 a change of D runs through both at once", () => {
    const steps = outputsPerStep(libraryCircuit("two-latches"), [
      { set: { D: 0, EN: 1 } },
      { set: { D: 1, EN: 1 } },
      { set: { D: 1, EN: 0 } },
      { set: { D: 0, EN: 0 } },
    ]);
    expect(steps.map((s) => formatWord(s["Q1"]!))).toEqual(["0", "1", "1", "1"]);
    expect(steps.map((s) => formatWord(s["Q"]!))).toEqual(["0", "1", "1", "1"]);
  });
});
