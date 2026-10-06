// Copyright © 2026 Christopher Snow

// Module 3's helpers for the facts tests: each runs a figure's own props through the code the
// figure runs, so a change to a lesson's data or to the model that moves a number the prose
// states fails a facts test first. The registers lesson's facts test does the same inline.

import { applyFaults, chainSlices, libraryCircuit } from "@dd/dd-model";
import { outputsPerStep, runScript, toFault } from "@dd/dd-views";
import type { LessonInput } from "@platform/lesson-schema";
import { Simulator, formatWord, parseWord, runSuite, type SequenceStep } from "@dd/sim";

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

/** What the fault lab's "Run checks" reports for a fault: the failing labels, out of how many. */
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
  return { failed: d.failures.map((f) => f.label), total: d.total };
}

/** An explorer's outputs with its starting values, then with `set` applied on top. */
export function explorerOutputs(
  lesson: LessonInput,
  id: string,
  set: Readonly<Record<string, string | number>> = {},
): Record<string, string> {
  const p = figureOf(lesson, id);
  const circuit = libraryCircuit(p["libraryId"] as string);
  const values = { ...((p["initial"] as Record<string, string | number>) ?? {}), ...set };
  const sim = new Simulator(circuit);
  for (const input of circuit.inputs) {
    const width = circuit.nets[input.net]?.width ?? 1;
    sim.setInput(input.name, parseWord(String(values[input.name] ?? 0), width));
  }
  sim.settle();
  return Object.fromEntries(
    circuit.outputs.map((o) => {
      const w = sim.read(o.name);
      return [
        o.name,
        w.width > 8
          ? w.value
              .toString(16)
              .toUpperCase()
              .padStart(w.width / 4, "0")
          : formatWord(w),
      ];
    }),
  );
}

/** How many tests a challenge has, as the page states it. */
export function testCountOf(lesson: LessonInput, id: string): number {
  const c = (lesson.challenges ?? []).find((x) => x.id === id);
  if (!c) throw new Error(`no challenge ${id}`);
  return c.tests.kind === "combinational"
    ? c.tests.vectors.length
    : c.tests.kind === "sequence"
      ? c.tests.steps.filter((s) => s.expect).length
      : c.tests.cases.length;
}

/** The widths, in slices, a chained challenge's tests choose. */
export function sliceCounts(lesson: LessonInput, id: string): number[] {
  const c = (lesson.challenges ?? []).find((x) => x.id === id);
  if (!c || c.tests.kind !== "combinational") throw new Error(`no chained challenge ${id}`);
  return [...new Set(c.tests.vectors.map((v) => v.slices ?? 1))];
}

export { chainSlices };
