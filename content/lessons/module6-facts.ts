// Copyright © 2026 Chris Snow

// Helpers for Module 6's facts tests: each reads a figure's own props and runs them through the
// code the figure runs, so a number the prose states is the number the page shows.

import { applyFaults, libraryCircuit } from "@dd/dd-model";
import { outputsPerStep, runScript, toFault } from "@dd/dd-views";
import type { LessonInput } from "@dd/lesson-schema";
import { formatWord, runSuite, type SequenceStep } from "@dd/sim";

type Run = Parameters<typeof runScript>[1];

export function figure(lesson: LessonInput, id: string): Record<string, unknown> {
  const x = lesson.sections.flatMap((s) => s.interactives ?? []).find((i) => i.id === id);
  if (!x) throw new Error(`no figure ${id}`);
  return x.props as Record<string, unknown>;
}

/** What a prediction figure says the circuit did, and the option the learner should choose. */
export function answer(lesson: LessonInput, id: string): string {
  const p = figure(lesson, id);
  const sim = runScript(libraryCircuit(p["libraryId"] as string), p["run"] as Run);
  return formatWord(sim.read(p["watch"] as string));
}

/** A prediction's options, by value. */
export function options(lesson: LessonInput, id: string): string[] {
  return (figure(lesson, id)["options"] as { value: string }[]).map((o) => o.value);
}

/** What a fault lab's "Run checks" reports for one fault: the failing steps, out of how many. */
export function checks(lesson: LessonInput, id: string, faultIndex: number) {
  const p = figure(lesson, id);
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
  return {
    failed: d.failures.map((f) => f.label),
    total: d.total,
    got: d.failures.map((f) => f.actual),
  };
}

/** A challenge's number of tests with an expectation. */
export function testsOf(lesson: LessonInput, id: string): number {
  const c = (lesson.challenges ?? []).find((x) => x.id === id);
  if (!c) throw new Error(`no challenge ${id}`);
  const t = c.tests;
  return t.kind === "sequence"
    ? t.steps.filter((s) => s.expect).length
    : t.kind === "combinational"
      ? t.vectors.length
      : t.cases.length;
}
