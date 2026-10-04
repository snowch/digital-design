import { bit0, bit1, formatWord, Simulator, validate } from "@dd/sim";
import { describe, expect, it } from "vitest";

import { applyFaults, brokenWire, invertedSignal, stuckAt, wrongGate } from "./faults";
import { srLatchCircuit } from "./library";

function setThenRelease(circuit: ReturnType<typeof srLatchCircuit>) {
  const sim = new Simulator(circuit);
  sim.setInput("S", bit1);
  sim.setInput("R", bit0);
  sim.settle();
  sim.setInput("S", bit0);
  sim.settle();
  return sim;
}

describe("faults", () => {
  it("a broken feedback wire stops the latch remembering", () => {
    const broken = brokenWire("sr/Qb").apply(srLatchCircuit());
    expect(validate(broken)).toEqual([]);
    const sim = setThenRelease(broken);
    // norQ reads an unknown Qb, so with R=0 it cannot say what Q is.
    expect(formatWord(sim.read("Q"))).toBe("X");
    const intact = setThenRelease(srLatchCircuit());
    expect(formatWord(intact.read("Q"))).toBe("1");
  });

  it("an inverted feedback wire makes the loop odd: it oscillates instead of remembering", () => {
    const faulted = invertedSignal("sr/Q").apply(srLatchCircuit());
    const sim = new Simulator(faulted);
    sim.setInput("S", bit1);
    sim.setInput("R", bit0);
    sim.settle();
    sim.setInput("S", bit0);
    const released = sim.settle();
    expect(released.converged).toBe(false);
    expect(formatWord(sim.read("Q"))).toBe("X");
  });

  it("a stuck wire ignores its driver", () => {
    const sim = setThenRelease(stuckAt("sr/Q", 0).apply(srLatchCircuit()));
    expect(formatWord(sim.read("Q"))).toBe("0");
    expect(formatWord(sim.read("Qb"))).toBe("1");
  });

  it("a wrong gate is a different circuit: a NAND for the NOR gives a latch that cannot be reset", () => {
    const faulty = wrongGate("sr/norQ", "nand").apply(srLatchCircuit());
    expect(faulty.components.find((c) => c.path === "sr/norQ")?.kind).toBe("nand");
    const sim = setThenRelease(faulty);
    expect(formatWord(sim.read("Q"))).toBe("1");
    sim.setInput("R", bit1);
    sim.settle();
    // Q = NAND(R, Qb): with Qb at 0 the output is 1 whatever R does.
    expect(formatWord(sim.read("Q"))).toBe("1");
  });

  it("refuses a net or a component that is not there", () => {
    expect(() => brokenWire("nowhere").apply(srLatchCircuit())).toThrow(/no net called "nowhere"/);
    expect(() => wrongGate("sr/missing", "and").apply(srLatchCircuit())).toThrow(/no component at/);
  });

  it("leaves the original untouched and applies several in order", () => {
    const original = srLatchCircuit();
    const faulted = applyFaults(original, [stuckAt("sr/Q", 1), invertedSignal("sr/Qb")]);
    expect(original.components).toHaveLength(2);
    expect(faulted.components).toHaveLength(4);
    const sim = new Simulator(faulted);
    sim.setInput("S", bit0);
    sim.setInput("R", bit0);
    sim.settle();
    expect(formatWord(sim.read("Q"))).toBe("1");
  });
});
