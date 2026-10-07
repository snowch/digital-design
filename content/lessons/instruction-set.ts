// Copyright © 2026 Christopher Snow

// Lesson: Module 10, lesson 1, the instruction set as an agreement. Module 8's machine and Module
// 9's run one program side by side, compared after every instruction: they agree on R0 to R15, the
// PC, the memory and the devices, and on nothing else; the IR, the held words and the controller's
// state are one circuit's own. A fault in Module 9's machine either keeps the agreement (HOLDR
// stuck at 1) or breaks it (PCEN stuck at 1). The learner sorts the machines' parts, then writes a
// third circuit for the same instructions: Module 9's machine with its jobs written at the ALU
// edge, in 3 edges, run edge by edge and against the reference (module10.test.ts).
//
// The structure is here; the words are in instruction-set.prose.ts and instruction-set.labels.ts.
// The numbers the prose states are pinned by instruction-set.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./instruction-set.labels";
import { PROSE } from "./instruction-set.prose";
import { MACHINE_INTERFACE, machineSteps, shortJobsText } from "./module10";
import { COLDER, MACHINE9_CONSTRUCTS, MARGIN, machineText } from "./module9";

/** The shop's two rooms, as Module 1 read them, in tenths of a degree. */
export const ROOMS10 = { DOOR: 0, WARM: 0, SENSORA: "-184", SENSORB: "-250" };

/** The parts the first challenge sorts, each with whether every machine must agree on it. */
export const PARTS = [
  { id: "r7", set: true },
  { id: "pc", set: true },
  { id: "ir", set: false },
  { id: "hr", set: false },
  { id: "state", set: false },
  { id: "ram", set: true },
  { id: "display", set: true },
  { id: "ha", set: false },
  { id: "timer", set: true },
] as const;

const SORT_OPTIONS = [
  { value: "set", label: LABELS.sort.set },
  { value: "own", label: LABELS.sort.own },
];

export const instructionSet: LessonInput = {
  id: "instruction-set",
  title: LABELS.title,
  module: 10,
  order: 1,
  objectives: [...LABELS.objectives],
  introduces: ["instruction set", "microarchitecture"],
  sections: [
    { kind: "question", title: LABELS.titles.question, prose: PROSE.question },
    {
      kind: "motivation",
      title: LABELS.titles.motivation,
      prose: PROSE.motivation,
      interactives: [
        {
          id: "parts",
          kind: "machine-parts",
          timeModel: "none",
          caption: LABELS.captions.parts,
          props: {},
        },
      ],
    },
    {
      kind: "prediction",
      title: LABELS.titles.prediction,
      prose: PROSE.prediction,
      interactives: [
        {
          id: "predict-mid",
          kind: "machine-compare",
          timeModel: "clocked",
          caption: LABELS.captions.predictMid,
          props: {
            program: COLDER,
            inputs: ROOMS10,
            shown: [2, 3],
            edges: 3,
            question: PROSE.p1Question,
            options: [
              { value: "nothing", label: LABELS.options.p1Nothing },
              { value: "R2", label: LABELS.options.p1R2 },
              { value: "PC", label: LABELS.options.p1Pc },
            ],
            explain: PROSE.p1Explain,
          },
        },
      ],
    },
    {
      kind: "investigation",
      title: LABELS.titles.investigation,
      prose: "",
      interactives: [
        {
          id: "side-by-side",
          kind: "machine-compare",
          timeModel: "clocked",
          caption: LABELS.captions.sideBySide,
          lead: PROSE.sideBySideLead,
          props: {
            program: COLDER,
            inputs: ROOMS10,
            shown: [2, 3],
            outcomes: PROSE.sideBySideAfter,
          },
        },
      ],
    },
    {
      kind: "construction",
      title: LABELS.titles.construction,
      prose: PROSE.construction,
      interactives: [
        {
          id: "sort-parts",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.sortParts,
          lead: PROSE.sortPartsLead,
          props: { challengeId: "sort-parts" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "compare-faults",
          kind: "machine-compare",
          timeModel: "clocked",
          caption: LABELS.captions.compareFaults,
          lead: PROSE.compareFaultsLead,
          props: {
            program: COLDER,
            inputs: ROOMS10,
            shown: [2, 3],
            faults: [
              {
                kind: "stuck-at",
                net: "control/HOLDR",
                value: 1,
                label: LABELS.faults.holdr,
                outcome: PROSE.faultHoldr,
              },
              {
                kind: "stuck-at",
                net: "control/PCEN",
                value: 1,
                label: LABELS.faults.pcen,
                outcome: PROSE.faultPcen,
              },
            ],
          },
        },
      ],
    },
    { kind: "explanation", title: LABELS.titles.explanation, prose: PROSE.explanation },
    { kind: "generalisation", title: LABELS.titles.generalisation, prose: PROSE.generalisation },
    {
      kind: "challenge",
      title: LABELS.titles.challenge,
      prose: "",
      interactives: [
        {
          id: "write-short-jobs",
          kind: "challenge",
          timeModel: "clocked",
          caption: LABELS.captions.writeShortJobs,
          lead: PROSE.writeShortJobsLead,
          props: { challengeId: "short-jobs" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "sort-parts",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: PARTS.map((p) => ({
        id: p.id,
        label: LABELS.parts[p.id],
        kind: "choice" as const,
        options: SORT_OPTIONS,
      })),
      tests: {
        kind: "answers",
        grader: "choices",
        cases: PARTS.map((p) => ({
          label: LABELS.parts[p.id],
          given: { field: p.id },
          expect: { value: p.set ? "set" : "own" },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { answers: Object.fromEntries(PARTS.map((p) => [p.id, p.set ? "set" : "own"])) },
    },
    {
      id: "short-jobs",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      feedback: "words",
      interface: MACHINE_INTERFACE,
      allowedConstructs: MACHINE9_CONSTRUCTS,
      courseModules: { set: "machine9", program: MARGIN },
      tryIt: "pins",
      initial: { hdl: machineText(false) },
      tests: {
        kind: "sequence",
        steps: machineSteps(
          MARGIN,
          { door: 0, warm: 0, sensorA: 0n, sensorB: 0n },
          { shortJobs: true },
        ),
      },
      hints: [...PROSE.c2Hints],
      reference: { hdl: shortJobsText() },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "The instruction set architecture defined as the interface between hardware and software, with a list of what it specifies (instructions, registers, memory addressing) and the IBM System/360 family as the first architecture several implementations shared (Patterson and Hennessy; Hennessy and Patterson; Harris and Harris's 'architecture' and 'microarchitecture' chapters); the single-cycle and multicycle MIPS or RISC-V processors presented as two implementations of one instruction set by their cycle counts and CPI.",
    howThisDiffers:
      "The two implementations are the learner's own, Module 8's machine and Module 9's, and they are run side by side in two simulators on the shop's colder-room program, compared after every instruction by the figure itself, so the agreement is what the learner watches, not a definition: the same PC, registers, memory and devices after each instruction, and Module 9's own IR, held words and controller state, which Module 8's machine has no parts for. The failure experiment puts a fault into Module 9's machine and shows that a fault in a part the instruction set does not name (HOLDR stuck at 1) keeps the agreement on every program, while one that does (PCEN stuck at 1) breaks it at the first instruction. The learner then writes a third circuit for the same instructions, Module 9's machine with its register and constant jobs written at the ALU edge in 3 edges, graded edge by edge and run against the reference on Module 8's suite. No System/360, no CPI and no list of what an architecture specifies.",
  },
};
