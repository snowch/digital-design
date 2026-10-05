// Facts the registers lesson's prose states, read off the figures that show them: each test runs
// a figure's own props through the code the figure runs, so a change to the lesson's data or to
// the model that moves a number the prose states fails here first.

import { describe, expect, it } from "vitest";

import { applyFaults, libraryCircuit } from "@dd/dd-model";
import { outputsPerStep, runScript, toFault } from "@dd/dd-views";
import { Simulator, bit0, bit1, formatWord, runSuite, type SequenceStep } from "@dd/sim";

import { POWER_ON_VALUE, registers } from "./registers";
import { PROSE } from "./registers.prose";

type Run = Parameters<typeof runScript>[1];

const figure = (id: string) => {
  const x = registers.sections.flatMap((s) => s.interactives ?? []).find((i) => i.id === id);
  if (!x) throw new Error(`no figure ${id}`);
  return x.props as Record<string, unknown>;
};

/** What a prediction figure says the circuit did. */
const answer = (id: string) => {
  const p = figure(id);
  const sim = runScript(libraryCircuit(p["libraryId"] as string), p["run"] as Run);
  return formatWord(sim.read(p["watch"] as string));
};

/** What the fault lab's "Run checks" reports for a fault: the failing labels, out of how many. */
const checks = (faultIndex: number) => {
  const p = figure("keep-faults");
  const healthy = libraryCircuit(p["libraryId"] as string);
  const run = p["run"] as Run;
  const expectations = outputsPerStep(healthy, run);
  const faults = (p["faults"] as Parameters<typeof toFault>[0][]).map(toFault);
  const broken = applyFaults(healthy, [faults[faultIndex]!]);
  const steps: SequenceStep[] = run.map((s, i) => ({
    ...(s.label ? { label: s.label } : {}),
    ...(s.set ? { set: s.set } : {}),
    ...(s.clock ? { clock: s.clock } : {}),
    expect: Object.fromEntries(
      Object.entries(expectations[i] ?? {}).map(([k, v]) => [k, formatWord(v)]),
    ),
  }));
  const d = runSuite(broken, { kind: "sequence", steps });
  return { failed: d.failures.map((f) => f.label), total: d.total };
};

describe("facts for the registers lesson", () => {
  it("the scene's display shows the value the question asks for at power-on", () => {
    expect(PROSE.question).toContain(`\`${POWER_ON_VALUE}\``);
    const outputs = figure("save-scene")["outputs"] as { value?: string }[];
    expect(outputs.map((o) => o.value)).toEqual([POWER_ON_VALUE]);
  });

  it("a word is written bit 3 first: D = 0001 puts a 1 in flip-flop ff0 alone", () => {
    const sim = runScript(libraryCircuit("register-4-plain"), [
      { set: { D: "0001", CLK: 0 } },
      { clock: "CLK" },
    ]);
    expect([0, 1, 2, 3].map((i) => formatWord(sim.read(`reg/ff${i}/slave/sr/Q`)))).toEqual([
      "1",
      "0",
      "0",
      "0",
    ]);
  });

  it("the first prediction: one edge takes 0110, and a later D of 1111 with no edge changes nothing", () => {
    expect(answer("predict-word")).toBe("0110");
  });

  it("the second prediction: with EN 0 from the start, three edges leave Q unknown", () => {
    expect(answer("predict-keep")).toBe("XXXX");
  });

  it("the chain prediction: a 1 taken at the first edge is in Q2 after the third, Q3 still unknown", () => {
    expect(answer("predict-chain")).toBe("1");
    const p = figure("predict-chain");
    const sim = runScript(libraryCircuit("shift-4"), p["run"] as Run);
    expect(["Q0", "Q1", "Q2", "Q3"].map((n) => formatWord(sim.read(n)))).toEqual([
      "0",
      "0",
      "1",
      "X",
    ]);
  });

  it("the four flip-flops start unknown and all take their D at one edge, and only at an edge", () => {
    const steps = outputsPerStep(libraryCircuit("four-flip-flops"), [
      { set: { D0: 0, D1: 0, D2: 0, D3: 0, CLK: 0 } },
      { set: { D0: 1, D2: 1 } },
      { clock: "CLK" },
      { set: { D0: 0, D1: 1 } },
    ]);
    // Read as a word, bit 3 first: Q3 Q2 Q1 Q0.
    const q = (s: (typeof steps)[number]) =>
      ["Q3", "Q2", "Q1", "Q0"].map((n) => formatWord(s[n]!)).join("");
    expect(steps.map(q)).toEqual(["XXXX", "XXXX", "0101", "0101"]);
  });

  it("the fault lab: what each fault makes the checks report", () => {
    expect(checks(0)).toEqual({
      failed: ["edge with EN 0", "another edge with EN 0"],
      total: 4,
    }); // keep path stuck at 0: an edge with EN 0 loads 0
    expect(checks(1)).toEqual({
      failed: ["edge with EN 0", "another edge with EN 0"],
      total: 4,
    }); // EN held at 1: every edge loads D, which is 0
    expect(checks(2)).toEqual({
      failed: ["load 1", "edge with EN 0", "another edge with EN 0"],
      total: 4,
    }); // OR changed to AND: LOAD and KEEP are never both 1, so every edge loads 0
  });

  it("the clock through an AND gate: EN rising while CLK is 1 is an edge the clock never made", () => {
    const sim = new Simulator(libraryCircuit("gated-clock-bit"));
    for (const n of ["D", "EN", "CLK"]) sim.setInput(n, bit0);
    sim.settle();
    sim.setInput("D", bit1);
    sim.setInput("CLK", bit1);
    sim.settle();
    expect(formatWord(sim.read("Q"))).toBe("X"); // EN 0: no edge reached the flip-flop
    sim.setInput("EN", bit1); // CLK still 1

    sim.settle();
    expect(formatWord(sim.read("Q"))).toBe("1"); // CLK did not rise, yet Q took D
  });

  it("the bit with a reset: unknown until an edge with RST 1, then 0 whatever EN and D are", () => {
    const steps = outputsPerStep(libraryCircuit("keep-clear-bit"), [
      { set: { D: 1, EN: 0, RST: 0, CLK: 0 }, clock: "CLK" },
      { clock: "CLK" },
      { set: { RST: 1, EN: 1 }, clock: "CLK" },
      { set: { RST: 0 }, clock: "CLK" },
    ]);
    expect(steps.map((s) => formatWord(s["Q"]!))).toEqual(["X", "X", "0", "1"]);
  });

  it("the challenges' test counts, as the page states them", () => {
    const count = (id: string) => {
      const c = (registers.challenges ?? []).find((x) => x.id === id)!;
      return c.tests.kind === "sequence" ? c.tests.steps.filter((s) => s.expect).length : 0;
    };
    expect([count("keep-bit"), count("shift-four"), count("register-in-text")]).toEqual([8, 7, 7]);
  });
});
