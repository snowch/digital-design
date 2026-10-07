// Copyright © 2026 Christopher Snow

// Module 0's facts tests read the figures as the page builds them: the same machine, the same
// start, the same lines run, and the answers the figures check a prediction against.

import {
  MEET_PLACES,
  MEET_STUCK,
  datapathState,
  meetAnswer,
  meetMachine,
  meetNet,
  meetStart,
  numberOf,
  runToStop,
} from "@dd/dd-model";
import { digitsText } from "@dd/dd-views";
import type { LessonInput } from "@platform/lesson-schema";
import type { Simulator } from "@dd/sim";

import { figureOf } from "./module3-facts";

interface Props {
  program: string;
  inputs?: Record<string, string>;
  lines?: number;
  ask?: Parameters<typeof meetAnswer>[1];
  register?: number;
  faults?: { stuck: string }[];
}

/** A Module 0 figure's machine as it first shows, with a stuck wire if one is named by index. */
export function meetFigure(lesson: LessonInput, id: string, fault = -1): Simulator {
  const p = figureOf(lesson, id) as unknown as Props;
  const stuck = p.faults?.[fault] ? MEET_STUCK[p.faults[fault].stuck] : undefined;
  return meetStart(meetMachine({ program: p.program, ...(stuck ? { stuck } : {}) }), {
    program: p.program,
    inputs: p.inputs ?? {},
    lines: p.lines ?? 0,
  });
}

/** The answer a figure's prediction is checked against. */
export function meetFigureAnswer(lesson: LessonInput, id: string): string {
  const p = figureOf(lesson, id) as unknown as Props;
  return meetAnswer(meetFigure(lesson, id), p.ask ?? "display", p.register ?? 0);
}

/** A figure run to its stop, with other readings if given: the lines, the display, the lamps. */
export function meetRun(
  lesson: LessonInput,
  id: string,
  inputs: Record<string, string> = {},
  fault = -1,
) {
  const sim = meetFigure(lesson, id, fault);
  for (const [name, v] of Object.entries(inputs))
    sim.setInput(name, {
      width: 64,
      value: BigInt.asUintN(64, BigInt(v)),
      known: (1n << 64n) - 1n,
    });
  sim.settle();
  const { lines } = runToStop(sim);
  const s = datapathState(sim.circuit, sim.snapshotValues());
  return { lines: lines.join(" "), display: numberOf(s.display), lamps: s.lamps };
}

/** What a ladder level shows, read off the figure's machine at its pause. */
export function levelReading(lesson: LessonInput, id: string, place: string): string {
  const sim = meetFigure(lesson, id);
  const at = MEET_PLACES[place];
  if (!at) throw new Error(`no place ${place}`);
  const w = meetNet(sim, at.net);
  if (!w) throw new Error(`no net ${at.net}`);
  return at.show === "number"
    ? (numberOf(w.value) ?? "X")
    : at.show === "digits"
      ? digitsText(w)
      : w.value === 1n
        ? "high"
        : "low";
}
