// Copyright © 2026 Christopher Snow

// The course's lessons, in order. Each lesson is a module in this directory; adding one here is
// what publishes it. Every lesson is parsed when the app starts, so an invalid lesson fails fast
// with its problems listed, and the content tests parse the same list.

import { parseLesson, type Lesson, type LessonInput } from "@platform/lesson-schema";

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
// Module 6, memory.
import { ram } from "./ram";
import { registerFile } from "./register-file";
import { bytes } from "./bytes";
import { memoryMap } from "./memory-map";
// Module 7, the ALU
import { aluJobs } from "./alu-jobs";
import { flags } from "./flags";
import { wideAlu } from "./wide-alu";
import { aluTests } from "./alu-tests";
// Module 8, the datapath
import { instructions } from "./instructions";
import { constants } from "./constants";
import { fetch } from "./fetch";
import { memoryAccess } from "./memory-access";
import { branches } from "./branches";
import { controlSignals } from "./control-signals";
import { illegalInstructions } from "./illegal-instructions";
import { severalEdges } from "./several-edges";
import { microOperations } from "./micro-operations";
import { newInstruction } from "./new-instruction";
import { instructionSet } from "./instruction-set";
import { encoding } from "./encoding";
import { immediates } from "./immediates";
import { roomToGrow } from "./room-to-grow";

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
  // Module 6, memory.
  ram,
  registerFile,
  bytes,
  memoryMap,
  // Module 7, the ALU
  aluJobs,
  flags,
  wideAlu,
  aluTests,
  // Module 8, the datapath
  instructions,
  constants,
  fetch,
  memoryAccess,
  branches,
  // Module 9, control
  controlSignals,
  illegalInstructions,
  severalEdges,
  microOperations,
  newInstruction,
  // Module 10, the instruction set
  instructionSet,
  encoding,
  immediates,
  roomToGrow,
];

export const LESSONS: readonly Lesson[] = INPUTS.map(parseLesson).sort(
  (a, b) => a.module - b.module || a.order - b.order,
);

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
