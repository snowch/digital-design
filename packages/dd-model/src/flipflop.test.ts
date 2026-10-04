import {
  bit0,
  bit1,
  CircuitBuilder,
  formatWord,
  hierarchy,
  replay,
  runSuite,
  Simulator,
  traceSignature,
} from "@dd/sim";
import { describe, expect, it } from "vitest";

import { dFlipFlopCircuit, keepBitCircuit, registerCircuit } from "./library";
import { REGISTER_BIT_TABLE } from "./reference";
import { dFlipFlop } from "./flipflop";

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

describe("a failed test on a circuit built around a flip-flop", () => {
  it("names the flip-flop block, not a gate inside it, and lists the gates in front of it first", () => {
    // A bit meant to keep its value when EN is 0, built without the keep path: it loads 0.
    const b = new CircuitBuilder("forgets");
    const d = b.input("D");
    const en = b.input("EN");
    const clk = b.input("CLK");
    const next = b.and([d, en], { name: "andLoad" });
    const { q } = dFlipFlop(b, next, clk, { name: "ff" });
    b.output("Q", q);
    const verdict = runSuite(b.build(), {
      kind: "sequence",
      steps: [
        { set: { D: 1, EN: 1, CLK: 0 }, clock: "CLK", expect: { Q: 1 } },
        { label: "edge with EN 0", set: { EN: 0 }, clock: "CLK", expect: { Q: 1 } },
      ],
    });
    const divergence = verdict.failures[0]?.divergence;
    expect(verdict.failures.map((f) => f.label)).toEqual(["edge with EN 0"]);
    expect(divergence?.component).toEqual({ kind: "dff", path: "ff" });
    expect(Object.keys(divergence?.inputsSeen ?? {})).toEqual(["D (andLoad.y)", "CLK (CLK)"]);
    expect(divergence?.cone.slice(0, 2)).toEqual(["ff", "andLoad"]);
  });
});

describe("the register bit's reference table", () => {
  // Every row, for every value of each "either" input and from both starting values of Q.
  it("is what the keep-and-clear bit does", () => {
    for (const row of REGISTER_BIT_TABLE.rows) {
      const free = Object.keys(row.inputs).filter((k) => row.inputs[k] === "X");
      for (let combo = 0; combo < 1 << free.length; combo++) {
        for (const start of [0, 1]) {
          const sim = new Simulator(keepBitCircuit({ clear: true }));
          sim.setInput("CLK", bit0);
          sim.setInput("RST", bit0);
          sim.setInput("EN", bit1);
          sim.setInput("D", start ? bit1 : bit0);
          sim.clockCycle("CLK");
          for (const name of ["RST", "EN", "D"]) {
            const v = row.inputs[name];
            const i = free.indexOf(name);
            const bit = v === "X" ? (combo >> i) & 1 : Number(v);
            sim.setInput(name, bit ? bit1 : bit0);
          }
          if (row.inputs["CLK"] === "↑") sim.clockCycle("CLK");
          else sim.settle();
          const want = row.next === "Q" ? String(start) : row.next;
          expect(formatWord(sim.read("Q")), `${row.state} from ${start}`).toBe(want);
        }
      }
    }
  });
});
