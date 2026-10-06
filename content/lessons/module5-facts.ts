// Copyright © 2026 Chris Snow

// Module 5's helpers for the facts tests (lessons 2 to 5): each runs a figure's own props through
// the code the figure runs, so a change to a lesson's data or to the model that moves a number
// the prose states fails a facts test first. Module 3's helpers drop the clock from a fault lab's
// steps; these keep it, because every Module 5 figure is clocked.

import { applyFaults, libraryCircuit } from "@dd/dd-model";
import { outputsPerStep, runScript, toFault, type PrimeStep } from "@dd/dd-views";
import type { LessonInput } from "@dd/lesson-schema";
import {
  Simulator,
  formatWord,
  parseWord,
  runSuite,
  type Circuit,
  type SequenceStep,
  type Word,
} from "@dd/sim";

type Run = Parameters<typeof runScript>[1];

export function figureOf(lesson: LessonInput, id: string): Record<string, unknown> {
  const x = lesson.sections.flatMap((s) => s.interactives ?? []).find((i) => i.id === id);
  if (!x) throw new Error(`no figure ${id}`);
  return (x.props ?? {}) as Record<string, unknown>;
}

/** What a prediction figure says the circuit did. */
export function predictionAnswer(lesson: LessonInput, id: string): string {
  const p = figureOf(lesson, id);
  const sim = runScript(libraryCircuit(p["libraryId"] as string), p["run"] as Run);
  return formatWord(sim.read(p["watch"] as string));
}

const word = (w: Word | undefined) => (w ? formatWord(w) : "");

/** A fault lab's checks under a fault: the failing labels, and what each output was per step. */
export function faultRun(lesson: LessonInput, id: string, faultIndex: number) {
  const p = figureOf(lesson, id);
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
  const seen = outputsPerStep(broken, run).map((o) =>
    Object.fromEntries(Object.entries(o).map(([k, v]) => [k, word(v)])),
  );
  return { failed: d.failures.map((f) => f.label), total: d.total, seen };
}

/** The healthy circuit's outputs after each step of a fault lab's run. */
export function healthyRun(lesson: LessonInput, id: string) {
  const p = figureOf(lesson, id);
  return outputsPerStep(libraryCircuit(p["libraryId"] as string), p["run"] as Run).map((o) =>
    Object.fromEntries(Object.entries(o).map(([k, v]) => [k, word(v)])),
  );
}

/** A simulator as an explorer starts it: inputs at their starting values, then its prime. */
export function explorerSim(lesson: LessonInput, id: string): { sim: Simulator; circuit: Circuit } {
  const p = figureOf(lesson, id);
  const circuit = libraryCircuit(p["libraryId"] as string);
  const initial = (p["initial"] as Record<string, string | number>) ?? {};
  const sim = new Simulator(circuit);
  for (const input of circuit.inputs) {
    const width = circuit.nets[input.net]?.width ?? 1;
    sim.setInput(input.name, parseWord(String(initial[input.name] ?? 0), width));
  }
  sim.settle();
  for (const step of (p["prime"] as PrimeStep[]) ?? []) {
    for (const [name, value] of Object.entries(step.set ?? {})) {
      const net = circuit.inputs.find((i) => i.name === name)?.net;
      sim.setInput(name, parseWord(String(value), circuit.nets[net ?? 0]?.width ?? 1));
    }
    if (step.clock) sim.clockCycle(step.clock);
    else sim.settle();
  }
  return { sim, circuit };
}

/** Every output of a simulator now, as the views write them. */
export function outputsNow(sim: Simulator, circuit: Circuit): Record<string, string> {
  return Object.fromEntries(circuit.outputs.map((o) => [o.name, word(sim.read(o.name))]));
}

/** How many tests a challenge has, as the page states it. */
export function testCountOf(lesson: LessonInput, id: string): number {
  const c = (lesson.challenges ?? []).find((x) => x.id === id);
  if (!c) throw new Error(`no challenge ${id}`);
  if (c.tests.kind === "combinational") return c.tests.vectors.length;
  if (c.tests.kind === "sequence") return c.tests.steps.filter((s) => s.expect).length;
  return c.tests.cases.length;
}
