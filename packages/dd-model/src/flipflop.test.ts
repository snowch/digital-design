import {
  bit0,
  bit1,
  formatWord,
  hierarchy,
  replay,
  runSuite,
  Simulator,
  traceSignature,
} from "@dd/sim";
import { describe, expect, it } from "vitest";

import { dFlipFlopCircuit, registerCircuit } from "./library";

describe("the D flip-flop", () => {
  it("captures D at the rising edge and nowhere else", () => {
    // The tutorial's edge-capture pattern: D=1 at edge 1 is captured; a D=1 between edges 1 and 2
    // is ignored; D=1 across edges 3 and 4 is captured at both.
    const d = runSuite(dFlipFlopCircuit(), {
      kind: "sequence",
      steps: [
        { set: { D: 0, CLK: 0 }, clock: "CLK", expect: { Q: 0, Qb: 1 }, label: "edge 0: D is 0" },
        { set: { D: 1 }, clock: "CLK", expect: { Q: 1, Qb: 0 }, label: "edge 1: D is 1" },
        { set: { D: 0 }, expect: { Q: 1 }, label: "D falls between edges: Q holds" },
        { set: { D: 1 }, expect: { Q: 1 }, label: "D rises again between edges: still ignored" },
        { set: { D: 0 }, clock: "CLK", expect: { Q: 0 }, label: "edge 2: D is 0" },
        { set: { D: 1 }, clock: "CLK", expect: { Q: 1 }, label: "edge 3: D is 1" },
        { clock: "CLK", expect: { Q: 1 }, label: "edge 4: D still 1" },
      ],
    });
    expect(d.failures).toEqual([]);
    expect(d.passed).toBe(true);
  });

  it("while the clock is low the master follows D and the slave keeps Q: the drill-down fact", () => {
    const sim = new Simulator(dFlipFlopCircuit());
    sim.setInput("D", bit1);
    sim.setInput("CLK", bit0);
    sim.clockCycle("CLK");
    expect(formatWord(sim.read("Q"))).toBe("1");
    sim.setInput("D", bit0);
    sim.settle();
    expect(formatWord(sim.read("dff/master/sr/Q"))).toBe("0");
    expect(formatWord(sim.read("Q"))).toBe("1");
    sim.clockCycle("CLK");
    expect(formatWord(sim.read("Q"))).toBe("0");
  });

  it("a synchronous reset wins over D at the edge, and only at the edge", () => {
    const sim = new Simulator(dFlipFlopCircuit({ reset: true }));
    sim.setInput("D", bit1);
    sim.setInput("CLK", bit0);
    sim.setInput("RST", bit0);
    sim.clockCycle("CLK");
    expect(formatWord(sim.read("Q"))).toBe("1");
    sim.setInput("RST", bit1);
    sim.settle();
    expect(formatWord(sim.read("Q"))).toBe("1");
    sim.clockCycle("CLK");
    expect(formatWord(sim.read("Q"))).toBe("0");
    sim.setInput("RST", bit0);
    sim.clockCycle("CLK");
    expect(formatWord(sim.read("Q"))).toBe("1");
  });

  it("can reset to 1", () => {
    const sim = new Simulator(dFlipFlopCircuit({ reset: true, resetTo: 1 }));
    sim.setInput("D", bit0);
    sim.setInput("CLK", bit0);
    sim.setInput("RST", bit1);
    sim.clockCycle("CLK");
    expect(formatWord(sim.read("Q"))).toBe("1");
  });

  it("an enable of 0 makes an edge reload the old value", () => {
    const sim = new Simulator(dFlipFlopCircuit({ reset: true, enable: true }));
    sim.setInput("D", bit1);
    sim.setInput("CLK", bit0);
    sim.setInput("RST", bit0);
    sim.setInput("EN", bit1);
    sim.clockCycle("CLK");
    expect(formatWord(sim.read("Q"))).toBe("1");
    sim.setInput("EN", bit0);
    sim.setInput("D", bit0);
    sim.clockCycle("CLK");
    expect(formatWord(sim.read("Q"))).toBe("1");
    sim.setInput("EN", bit1);
    sim.clockCycle("CLK");
    expect(formatWord(sim.read("Q"))).toBe("0");
  });

  it("is two D latches and an inverter, each latch a gated SR latch, each of those two NOR gates", () => {
    const tree = hierarchy(dFlipFlopCircuit());
    const dff = tree.children[0];
    expect(dff?.kind).toBe("dff");
    expect(dff?.children.map((c) => `${c.kind}:${c.name}`)).toEqual([
      "d-latch:master",
      "d-latch:slave",
      "not:notClk",
    ]);
    const master = dff?.children.find((c) => c.name === "master");
    expect(
      master?.children.find((c) => c.kind === "sr-latch")?.children.map((c) => c.name),
    ).toEqual(["norQ", "norQb"]);
  });

  it("replays exactly", () => {
    const circuit = dFlipFlopCircuit();
    const sim = new Simulator(circuit);
    sim.setInput("D", bit1);
    sim.setInput("CLK", bit0);
    sim.clockCycle("CLK");
    sim.setInput("D", bit0);
    sim.clockCycle("CLK");
    const again = replay(circuit, sim.trace);
    expect(traceSignature(again.trace)).toEqual(traceSignature(sim.trace));
  });
});

describe("a register", () => {
  it("loads a whole word at one edge and holds it", () => {
    const d = runSuite(registerCircuit(4, { reset: true }), {
      kind: "sequence",
      steps: [
        {
          set: { D: 0b1011, CLK: 0, RST: 1 },
          clock: "CLK",
          expect: { Q: 0 },
          label: "reset clears",
        },
        { set: { RST: 0 }, clock: "CLK", expect: { Q: "1011" }, label: "load" },
        { set: { D: 0b0110 }, expect: { Q: "1011" }, label: "D changes between edges" },
        { clock: "CLK", expect: { Q: "0110" }, label: "next edge" },
      ],
    });
    expect(d.failures).toEqual([]);
  });

  it("is a row of flip-flops, each with its own latches", () => {
    const circuit = registerCircuit(4);
    const paths = circuit.components.map((c) => c.path);
    expect(paths.filter((p) => /^reg\/ff\d\/master\/sr\/norQ$/.test(p))).toHaveLength(4);
    expect(circuit.composites.filter((c) => c.kind === "dff")).toHaveLength(4);
  });
});
