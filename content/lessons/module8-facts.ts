// Copyright © 2026 Christopher Snow

// Module 8's facts tests read the datapath figures as the page builds them: the same circuit, the
// same start, the same edges, and the answers the figure checks a prediction against.

import {
  applyFaults,
  buildDatapath,
  edgeAnswer,
  figureState,
  giveInstruction,
  startDatapath,
  type DatapathState,
  type EdgeQuestion,
  type GivenInstruction,
} from "@dd/dd-model";
import type { LessonInput } from "@dd/lesson-schema";
import type { Simulator } from "@dd/sim";

import { toFault } from "@dd/dd-views";

import { figureOf } from "./module3-facts";

interface Props {
  libraryId: string;
  program?: string;
  registers?: Record<string, string>;
  inputs?: Record<string, string | number>;
  instructions?: (GivenInstruction & { label: string })[];
  edges?: number;
  faults?: Parameters<typeof toFault>[0][];
  ask?: EdgeQuestion;
  register?: number;
}

/** A datapath figure as it first shows, with a fault put in if one is named by its index. */
export function figureSim(lesson: LessonInput, id: string, fault = -1): Simulator {
  const p = figureOf(lesson, id) as unknown as Props;
  const healthy = buildDatapath({
    libraryId: p.libraryId,
    ...(p.program !== undefined ? { program: p.program } : {}),
    registers: p.registers ?? {},
  });
  const spec = p.faults?.[fault];
  const built = spec
    ? { ...healthy, circuit: applyFaults(healthy.circuit, [toFault(spec)]) }
    : healthy;
  return startDatapath(built, {
    inputs: p.inputs ?? {},
    ...(p.instructions?.[0] ? { instruction: p.instructions[0] } : {}),
    edges: p.edges ?? 0,
  });
}

/** The answer a figure's prediction is checked against. */
export function figureAnswer(lesson: LessonInput, id: string): string {
  const p = figureOf(lesson, id) as unknown as Props;
  return edgeAnswer(figureSim(lesson, id), p.ask ?? "changed", p.register ?? 0);
}

const signed = (v: bigint | undefined) =>
  v === undefined ? "X" : (v >= 1n << 63n ? v - (1n << 64n) : v).toString();

/** The registers, read signed, after one edge with the figure's instruction `k` on the IR bus. */
export function afterInstruction(
  lesson: LessonInput,
  id: string,
  k: number,
  fault = -1,
): Record<string, string> {
  const p = figureOf(lesson, id) as unknown as Props;
  const sim = figureSim(lesson, id, fault);
  const given = p.instructions?.[k];
  if (given) giveInstruction(sim, sim.circuit, given);
  sim.clockCycle("CLK");
  return Object.fromEntries(figureState(sim).regs.map((v, r) => [`R${r}`, signed(v)]));
}

/** Runs a figure until it stops (at most `limit` edges); its state then, and the edges run. */
export function runToStop(
  lesson: LessonInput,
  id: string,
  fault = -1,
  limit = 500,
): { state: DatapathState; edges: number; reason: string } {
  const sim = figureSim(lesson, id, fault);
  let edges = 0;
  let reason = "go";
  for (; edges < limit; edges++) {
    reason = edgeAnswer(sim, "stop");
    sim.clockCycle("CLK");
    if (reason !== "go") {
      edges++;
      break;
    }
  }
  return { state: figureState(sim), edges, reason };
}

export { signed };
