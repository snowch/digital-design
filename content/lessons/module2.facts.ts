// Copyright © 2026 Christopher Snow

// Shared helpers for Module 2's facts tests: run a lesson's figure through the code the figure
// runs, so a number the prose states is read off the page's own source.

import { applyFaults, libraryCircuit } from "@dd/dd-model";
import { outputsPerStep, runScript, toFault } from "@dd/dd-views";
import type { LessonInput } from "@platform/lesson-schema";
import { Simulator, bit1, formatWord, runSuite, type SequenceStep } from "@dd/sim";

type Run = Parameters<typeof runScript>[1];

export function figureOf(lesson: LessonInput, id: string): Record<string, unknown> {
  const x = lesson.sections.flatMap((s) => s.interactives ?? []).find((i) => i.id === id);
  if (!x) throw new Error(`no figure ${id}`);
  return x.props as Record<string, unknown>;
}

/** What a prediction figure says the circuit did. */
export function predictionAnswer(lesson: LessonInput, id: string): string {
  const p = figureOf(lesson, id);
  const sim = runScript(libraryCircuit(p["libraryId"] as string), p["run"] as Run);
  return formatWord(sim.read(p["watch"] as string));
}

/** What a fault figure's "Run checks" reports for one fault: the failing rows, out of how many. */
export function faultChecks(lesson: LessonInput, id: string, faultIndex: number) {
  const p = figureOf(lesson, id);
  const healthy = libraryCircuit(p["libraryId"] as string);
  const run = p["run"] as Run;
  const expectations = outputsPerStep(healthy, run);
  const faults = (p["faults"] as Parameters<typeof toFault>[0][]).map(toFault);
  const broken = applyFaults(healthy, [faults[faultIndex]!]);
  const steps: SequenceStep[] = run.map((s, i) => ({
    ...(s.label ? { label: s.label } : {}),
    ...(s.set ? { set: s.set } : {}),
    expect: Object.fromEntries(
      Object.entries(expectations[i] ?? {}).map(([k, v]) => [k, formatWord(v)]),
    ),
  }));
  const d = runSuite(broken, { kind: "sequence", steps });
  return {
    total: d.total,
    failed: d.failures.map((f) => ({ label: f.label, got: f.actual, expected: f.expected })),
  };
}

/**
 * The explorer's status line after pressing one input from a fresh start (every input 0): the
 * number of steps it says the circuit settled in.
 */
export function stepsAfterPressing(libraryId: string, input: string): number {
  const circuit = libraryCircuit(libraryId);
  const sim = new Simulator(circuit);
  for (const i of circuit.inputs) sim.setInput(i.net, { width: 1, value: 0n, known: 1n });
  sim.settle();
  sim.setInput(input, bit1);
  sim.settle();
  return (sim.lastSettle?.history.length ?? 1) - 1;
}
