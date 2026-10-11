// Copyright © 2026 Christopher Snow

// Facts the trap-hardware lesson's prose states (briefs 7A to 7C), read off Module 12's machine of
// several edges as the lesson's figures run it.

import { describe, expect, it } from "vitest";

import {
  applyFaults,
  buildDatapath,
  rowFor,
  startDatapath,
  stuckAt,
  trapControllerMachine,
  trapLogic,
  trapStateSequence,
} from "@dd/dd-model";
import { CircuitBuilder, Simulator, word, type Word } from "@dd/sim";

import { CALL_TRAP, DOOR_OPEN, NIGHT, TRAPLOGIC_ROWS, TRAP_EDGES, trapLogicOut } from "./module12";
import { EDGE_ANSWERS } from "./trap-hardware";

const NAMES = ["FETCH", "READ", "ALU", "MEMORY", "WRITE"];
const ROOMS = { SENSORA: "-184", SENSORB: "-250" };

function machine(program: string, inputs = {}, faults: ReturnType<typeof stuckAt>[] = []) {
  const built = buildDatapath({ libraryId: "machine-traps", program });
  const b = faults.length ? { ...built, circuit: applyFaults(built.circuit, faults) } : built;
  const sim = startDatapath(b, { inputs });
  const v = (name: string) => {
    const net = b.circuit.nets.find((x) => x.name === name)!;
    return sim.snapshotValues()[net.id]!.value;
  };
  return { sim, v, state: () => NAMES[Number(v("control/S"))] };
}

describe("facts for the trap-hardware lesson", () => {
  it("the first figure: the store traps at edge 11 in MEMORY; PC 010, C2 008, C3 34", () => {
    const m = machine(TRAP_EDGES);
    const states: string[] = [];
    for (let e = 1; e <= 12; e++) {
      states.push(`${m.state()}${m.v("control/TRAP") === 1n ? "!" : ""}`);
      m.sim.clockCycle("CLK");
      if (e === 11)
        expect([m.v("PC"), m.v("datapath/C2"), m.v("datapath/cregs/C3"), m.state()]).toEqual([
          0x10n,
          8n,
          0x34n,
          "FETCH",
        ]);
    }
    expect(states.join(" ")).toBe(
      "FETCH READ ALU WRITE FETCH READ WRITE FETCH READ ALU MEMORY! FETCH",
    );
  });

  it("the night program: the store's trap at edge 24, stop at 020 after 54 edges", () => {
    const m = machine(NIGHT, ROOMS);
    let e = 0;
    const traps: number[] = [];
    while (m.v("HALT") === 0n && e < 200) {
      if (m.v("control/TRAP") === 1n) traps.push(e + 1);
      m.sim.clockCycle("CLK");
      e++;
    }
    // HALT is 1 before the halting edge: that edge is counted, as 9.3 counts it ("Stopped").
    const pc = m.v("PC");
    m.sim.clockCycle("CLK");
    e++;
    expect([traps, e, pc]).toEqual([[24], 54, 0x20n]);
    expect([
      m.v("datapath/cregs/C1"),
      m.v("datapath/C2"),
      m.v("datapath/cregs/C3"),
      m.v("datapath/C4"),
    ]).toEqual([1n, 0x18n, 0x34n, 0x24n]);
  });

  it("the prediction: a call system traps at its READ edge, where the table says ALU; FETCH next", () => {
    const m = machine(CALL_TRAP);
    for (let e = 0; e < 8; e++) m.sim.clockCycle("CLK");
    expect([m.state(), m.v("control/TRAP")]).toEqual(["READ", 1n]);
    const row = rowFor(trapControllerMachine(), "READ", { CALL: 0, CREG: 0, MEM: 0, WRITEY: 0 });
    expect(row?.row.to).toBe("ALU");
    m.sim.clockCycle("CLK");
    expect([m.state(), m.v("PC")]).toEqual(["FETCH", 0x10n]);
  });

  it("the edges: a stop in user mode 2, resume 3, an interrupt 1, a word load at 404 4", () => {
    // Edges from the instruction's FETCH to the edge that traps, counting both.
    const edgesTo = (src: string) => {
      const m = machine(src);
      let since = 0;
      for (let e = 0; e < 200; e++) {
        since = m.state() === "FETCH" ? 1 : since + 1;
        if (m.v("control/TRAP") === 1n) return since;
        m.sim.clockCycle("CLK");
      }
      return -1;
    };
    const handler = "handler: R5 <= C3\n        stop";
    const user = `        R1 <= handler\n        C4 <= R1\n        R1 <= 0\n        C1 <= R1\n        R1 <= program\n        C2 <= R1\n        resume\n${handler}\nprogram: stop`;
    expect(edgesTo(user)).toBe(2);
    const load = `        R1 <= handler\n        C4 <= R1\n        R2 <= 0x404\n        R3 <= word[R2]\n        stop\n${handler}`;
    expect(edgesTo(load)).toBe(4);
    expect(trapStateSequence(8, 1)).toEqual(["FETCH", "READ", "WRITE"]);
    const m = machine(DOOR_OPEN);
    let seen = "";
    for (let k = 1; k < 120 && !seen; k++) {
      if (k === 60) {
        m.sim.setInput("DOOR", word(1, 1));
        m.sim.settle();
      }
      if (m.v("control/TRAP") === 1n) seen = `${m.state()} ${m.v("CAUSE").toString(16)}`;
      m.sim.clockCycle("CLK");
    }
    expect(seen).toBe("FETCH 82");
    expect(EDGE_ANSWERS.map((a) => a.value)).toEqual(["2", "3", "1", "4"]);
  });

  it("TRAP stuck at 0: the controller stays in MEMORY at 014 and never halts", () => {
    const m = machine(NIGHT, ROOMS, [stuckAt("control/TRAP", 0)]);
    for (let e = 0; e < 60; e++) m.sim.clockCycle("CLK");
    expect([m.state(), m.v("PC"), m.v("HALT"), m.v("control/GO")]).toEqual([
      "MEMORY",
      0x14n,
      0n,
      0n,
    ]);
  });

  it("the write enable stuck at 0: C4 stays 0, the store halts with 34 at 014", () => {
    const m = machine(NIGHT, ROOMS, [stuckAt("datapath/CWEN2", 0)]);
    let e = 0;
    while (m.v("HALT") === 0n && e < 100) {
      m.sim.clockCycle("CLK");
      e++;
    }
    expect([m.v("datapath/C4"), m.v("PC"), m.v("CAUSE"), m.state()]).toEqual([
      0n,
      0x14n,
      0x34n,
      "MEMORY",
    ]);
  });

  it("the trap logic's table is the drawn block's, row by row", () => {
    const b = new CircuitBuilder("t");
    const ins = {
      CHECKING: b.input("CHECKING"),
      FETCHING: b.input("FETCHING"),
      CAUSED: b.input("CAUSED", 8),
      STOP: b.input("STOP"),
      IE: b.input("IE"),
      CAUSEF: b.input("CAUSEF", 8),
      CAUSEM: b.input("CAUSEM", 8),
      WAITING: b.input("WAITING", 2),
      NOHANDLER: b.input("NOHANDLER"),
    };
    const outs = {
      GO: b.net("GO"),
      TRAP: b.net("TRAP"),
      CAUSE: b.net("CAUSE", 8),
      HALT: b.net("HALT"),
    };
    trapLogic(b, ins, outs);
    for (const [n, id] of Object.entries(outs)) b.output(n, id);
    const circuit = b.build();
    for (const row of TRAPLOGIC_ROWS) {
      const sim = new Simulator(circuit);
      for (const [n, id] of Object.entries(ins))
        sim.setInput(
          n,
          word(circuit.nets[id]!.width, row.inputs[n as keyof typeof row.inputs] ?? 0),
        );
      sim.settle();
      const got = Object.fromEntries(
        Object.entries(outs).map(([n, id]) => [
          n,
          Number((sim.snapshotValues()[id] as Word).value),
        ]),
      );
      expect(got, row.label).toEqual(trapLogicOut(row.inputs));
    }
  });
});
