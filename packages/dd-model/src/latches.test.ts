// Copyright © 2026 Chris Snow

import { bit0, bit1, formatWord, hierarchy, Simulator, type Circuit } from "@dd/sim";
import { describe, expect, it } from "vitest";

import { dLatchCircuit, gatedSrLatchCircuit, inverterLoop, srLatchCircuit } from "./library";
import { D_LATCH_TABLE, SR_LATCH_TABLE, type TruthTable } from "./reference";

const bitOf = (v: string) => (v === "1" ? bit1 : bit0);

/** Puts a latch into a known state: Q = 1 by the row that sets it, then releases the enable. */
function known(sim: Simulator, table: TruthTable) {
  if (table.id === "sr-latch") {
    sim.setInput("EN", bit1);
    sim.setInput("S", bit1);
    sim.setInput("R", bit0);
    sim.settle();
    sim.setInput("S", bit0);
    sim.settle();
  } else {
    sim.setInput("EN", bit1);
    sim.setInput("D", bit1);
    sim.settle();
  }
  sim.setInput("EN", bit0);
  sim.settle();
  expect(formatWord(sim.read("Q"))).toBe("1");
}

function holdsTheTable(make: () => Circuit, table: TruthTable) {
  for (const row of table.rows) {
    const sim = new Simulator(make());
    known(sim, table);
    for (const [name, v] of Object.entries(row.inputs)) {
      // An X in the table means "any": use 1, the value most likely to disturb a hold.
      sim.setInput(name, v === "X" ? bit1 : bitOf(v));
    }
    const result = sim.settle();
    const q = formatWord(sim.read("Q"));
    const qb = formatWord(sim.read("Qb"));
    switch (row.next) {
      case "0":
      case "1":
        expect(q, `${table.id} ${row.state}`).toBe(row.next);
        expect(qb, `${table.id} ${row.state}: Qb is the opposite`).toBe(
          row.next === "1" ? "0" : "1",
        );
        break;
      case "Q":
        expect(q, `${table.id} ${row.state}: unchanged`).toBe("1");
        break;
      case "?":
        // The forbidden input: both outputs low, so Q and Qb are no longer opposites.
        expect(result.converged).toBe(true);
        expect(q).toBe("0");
        expect(qb).toBe("0");
        break;
    }
  }
}

describe("the SR latch", () => {
  it("reproduces the quick reference's table", () => {
    holdsTheTable(gatedSrLatchCircuit, SR_LATCH_TABLE);
  });

  it("releasing both inputs from the forbidden state at once is a race the model cannot decide", () => {
    const sim = new Simulator(srLatchCircuit());
    sim.setInput("S", bit1);
    sim.setInput("R", bit1);
    sim.settle();
    sim.setInput("S", bit0);
    sim.setInput("R", bit0);
    const result = sim.settle();
    expect(result.converged).toBe(false);
    expect(formatWord(sim.read("Q"))).toBe("X");
  });

  it("exposes its gates under its path", () => {
    const circuit = srLatchCircuit();
    expect(circuit.components.map((c) => c.path)).toEqual(["sr/norQ", "sr/norQb"]);
    expect(circuit.composites.map((c) => c.kind)).toEqual(["sr-latch"]);
    const tree = hierarchy(circuit);
    expect(tree.children[0]?.kind).toBe("sr-latch");
    expect(tree.children[0]?.children.map((c) => c.name)).toEqual(["norQ", "norQb"]);
  });
});

describe("the D latch", () => {
  it("reproduces the quick reference's table", () => {
    holdsTheTable(dLatchCircuit, D_LATCH_TABLE);
  });

  it("follows D while enabled and holds when the enable falls", () => {
    const sim = new Simulator(dLatchCircuit());
    sim.setInput("EN", bit1);
    for (const d of [bit0, bit1, bit0, bit1]) {
      sim.setInput("D", d);
      sim.settle();
      expect(formatWord(sim.read("Q"))).toBe(formatWord(d));
    }
    sim.setInput("EN", bit0);
    sim.settle();
    sim.setInput("D", bit0);
    sim.settle();
    expect(formatWord(sim.read("Q"))).toBe("1");
  });

  it("is a gated SR latch inside: its composite tree says so", () => {
    const tree = hierarchy(dLatchCircuit());
    const latch = tree.children[0];
    expect(latch?.kind).toBe("d-latch");
    expect(latch?.children.map((c) => `${c.kind}:${c.name}`)).toEqual([
      "sr-latch:sr",
      "not:notD",
      "and:andS",
      "and:andR",
    ]);
  });
});

describe("feedback loops", () => {
  it("an even loop remembers a kick; an odd loop cannot settle after one", () => {
    const even = new Simulator(inverterLoop(2));
    even.setInput("kick", bit1);
    even.settle();
    even.setInput("kick", bit0);
    expect(even.settle().converged).toBe(true);
    expect(formatWord(even.read("q"))).toBe("1");

    const odd = new Simulator(inverterLoop(3));
    odd.setInput("kick", bit1);
    expect(odd.settle().converged).toBe(true);
    odd.setInput("kick", bit0);
    const result = odd.settle();
    expect(result.converged).toBe(false);
    expect(formatWord(odd.read("q"))).toBe("X");
  });

  it("an odd loop in the delay model oscillates with a period of twice the loop delay", () => {
    const sim = new Simulator(inverterLoop(3, 10), { timeModel: "delay" });
    sim.setInput("kick", bit1);
    sim.run();
    sim.setInput("kick", bit0);
    sim.run(1000);
    const q = sim.resolve("q");
    const times = sim.trace.events.filter((e) => e.net === q && e.time > 100).map((e) => e.time);
    const gaps = times.slice(1).map((t, i) => t - (times[i] as number));
    // Three inverters and the OR: four gates of ten each, so q flips every forty units.
    expect(new Set(gaps)).toEqual(new Set([40]));
  });
});
