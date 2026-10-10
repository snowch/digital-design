// Copyright © 2026 Christopher Snow

import { describe, expect, it } from "vitest";

import { buildDatapath, dFlipFlopCircuit, libraryCircuit, startDatapath } from "@dd/dd-model";
import { Simulator, bit0, bit1, formatWord } from "@dd/sim";

import { marksShown, segmentsOf, traceEnd, valuesAt } from "./traces";
import { enumerateTable, rowFor } from "./TruthTable";

describe("reading a trace", () => {
  it("gives each net's value at a time and the segments of a lane", () => {
    const circuit = libraryCircuit("sr-latch");
    const sim = new Simulator(circuit);
    sim.setInput("S", bit1);
    sim.setInput("R", bit0);
    sim.settle();
    sim.tick();
    sim.setInput("S", bit0);
    sim.settle();
    sim.tick();
    const q = circuit.outputs.find((o) => o.name === "Q")!.net;
    expect(formatWord(valuesAt(circuit, sim.trace, 0)[q]!)).toBe("1");
    expect(formatWord(valuesAt(circuit, sim.trace, 2)[q]!)).toBe("1");
    const s = circuit.inputs.find((i) => i.name === "S")!.net;
    const segs = segmentsOf(circuit, sim.trace, s, 0, traceEnd(sim.trace));
    expect(segs.map((x) => [x.from, x.to, formatWord(x.value)])).toEqual([
      [0, 1, "1"],
      [1, 2, "0"],
    ]);
  });

  it("marks the segment an overlay produced", () => {
    const circuit = dFlipFlopCircuit({ delay: 10 });
    const sim = new Simulator(circuit, { timeModel: "delay" });
    sim.setInput("CLK", bit0);
    sim.setInput("D", bit0);
    // One clock cycle first, so Q is a known 0 before the overlay touches it.
    sim.setInputAt("CLK", bit1, 20);
    sim.setInputAt("CLK", bit0, 60);
    sim.run(100);
    const q = circuit.outputs.find((o) => o.name === "Q")!.net;
    expect(formatWord(sim.read(q))).toBe("0");
    sim.scheduleAt(q, { width: 1, value: 0n, known: 0n }, 120, "overlay", "seed 1");
    sim.scheduleAt(q, bit1, 150, "overlay", "seed 1");
    sim.run(200);
    const segs = segmentsOf(circuit, sim.trace, q, 100, 200);
    expect(segs.map((s) => [s.from, s.to, formatWord(s.value), s.overlay ?? false])).toEqual([
      [100, 120, "0", false],
      [120, 150, "X", true],
      [150, 200, "1", true],
    ]);
  });
});

describe("enumerating a truth table", () => {
  it("lists every input combination with the simulator's outputs", () => {
    const { inputColumns, outputColumns, rows } = enumerateTable(libraryCircuit("glitch-and-not"));
    expect(inputColumns).toEqual(["A", "B"]);
    expect(outputColumns).toEqual(["Y"]);
    expect(rows.map((r) => [...r.inputs, ...r.outputs])).toEqual([
      ["0", "0", "0"],
      ["0", "1", "0"],
      ["1", "0", "1"],
      ["1", "1", "0"],
    ]);
    expect(rowFor(inputColumns, rows, { A: "1", B: "0" })).toBe(2);
    expect(rowFor(inputColumns, rows, { A: "X", B: "0" })).toBeUndefined();
  });
});

describe("the rises a timing diagram numbers", () => {
  it("counts from the reset, never the reset's own: 9.3's run stops at its 23rd edge, ↑23", () => {
    const built = buildDatapath({
      libraryId: "machine-edges",
      program: `R2 <= word[sensorA]
R3 <= word[sensorB]
if R2 < R3 signed goto show
R2 <= R3
show: word[display] <= R2
stop`,
    });
    const sim = startDatapath(built, { inputs: { SENSORA: "-184", SENSORB: "-250" } });
    for (let k = 0; k < 23; k++) sim.clockCycle("CLK");
    const shown = marksShown(sim.trace.marks, "reset");
    expect(shown[0]?.label).toBe("reset");
    expect(shown.at(-1)?.label).toBe("↑23");
  });
});
