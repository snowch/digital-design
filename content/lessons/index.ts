// The course's lessons, in order. Each lesson is a module in this directory; adding one here is
// what publishes it. Every lesson is parsed when the app starts, so an invalid lesson fails fast
// with its problems listed, and the content tests parse the same list.

import { parseLesson, type Lesson, type LessonInput } from "@dd/lesson-schema";

import { registers } from "./registers";
import { remember } from "./remember";
// Module 3, combinational design.
import { selectors } from "./selectors";
import { decoders } from "./decoders";
import { adders } from "./adders";
import { alu } from "./alu";
import { signals } from "./signals";
// Module 2
import { fewerGates } from "./fewer-gates";
import { gates } from "./gates";
import { nand } from "./nand";
// Module 5 after the registers lesson: counters, register transfer and state machines.
import { counters } from "./counters";
import { registerTransfer } from "./register-transfer";
import { stateMachines } from "./state-machines";
import { stateEncoding } from "./state-encoding";

const INPUTS: readonly LessonInput[] = [
  signals,
  // Module 2
  gates,
  nand,
  fewerGates,
  // Module 3, combinational design.
  selectors,
  decoders,
  adders,
  alu,
  remember,
  registers,
  // Module 5 after the registers lesson.
  counters,
  registerTransfer,
  stateMachines,
  stateEncoding,
];

export const LESSONS: readonly Lesson[] = INPUTS.map(parseLesson).sort(
  (a, b) => a.module - b.module || a.order - b.order,
);

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
