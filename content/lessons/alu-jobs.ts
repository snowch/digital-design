// Copyright © 2026 Christopher Snow

// Lesson: Module 7, lesson 1, the ALU's eight jobs and the three inputs that choose one.
//
// The structure is here; the words are in alu-jobs.prose.ts and alu-jobs.labels.ts. The circuits
// are the model's (packages/dd-model: alu.ts and library-alu.ts); the numbers the prose states
// are pinned by alu-jobs.facts.test.ts, read off the figures' own props.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./alu-jobs.labels";
import { PROSE } from "./alu-jobs.prose";
import { JOBS_A, JOBS_B, ROOM_A, ROOM_B, sliceVectors } from "./module7";

const DRAW_CONSTRUCTS = ["module", "ports", "logic", "assign", "op-bitwise"];

/** The operand bit's tests: every pattern of B, OP2, OP1 and OP0. */
const OPERAND_VECTORS = Array.from({ length: 16 }, (_, n) => {
  const [B, OP2, OP1, OP0] = [3, 2, 1, 0].map((k) => (n >> k) & 1) as [
    number,
    number,
    number,
    number,
  ];
  const D = !OP1 ? 0 : OP2 ? OP0 : B ^ OP0;
  return {
    label: `B ${B}, OP2 OP1 OP0 = ${OP2}${OP1}${OP0}`,
    inputs: { B, OP2, OP1, OP0 },
    expect: { D },
  };
});

/** The eight-job slice's tests: every job at 1, 4, 8 and 16 bits, and the 16-bit counts' ends. */
const JOB_PAIRS: readonly (readonly [bigint, bigint, number])[] = [
  [1n, 1n, 1],
  [0b0011n, 0b0101n, 4],
  [0x48n, 0x06n, 8],
  [ROOM_A, ROOM_B, 16],
];
const SLICE_VECTORS = sliceVectors([
  ...JOB_PAIRS.flatMap(([a, b, n]) =>
    [0, 1, 2, 3, 4, 5, 6, 7].map((job) => [job, a, b, n] as const),
  ),
  [6, 0xffffn, 0n, 16],
  [7, 0n, 0n, 16],
]);

/** The eight jobs, each a step of the fault lab's checks, on 3 and 5. */
const JOB_RUN = [
  { label: "3 AND 5", set: { OP2: 0, OP1: 0, OP0: 0 } },
  { label: "3 XOR 5", set: { OP2: 0, OP1: 0, OP0: 1 } },
  { label: "3 + 5", set: { OP2: 0, OP1: 1, OP0: 0 } },
  { label: "3 - 5", set: { OP2: 0, OP1: 1, OP0: 1 } },
  { label: "3 OR 5", set: { OP2: 1, OP1: 0, OP0: 0 } },
  { label: "copy 5", set: { OP2: 1, OP1: 0, OP0: 1 } },
  { label: "3 + 1", set: { OP2: 1, OP1: 1, OP0: 0 } },
  { label: "3 - 1", set: { OP2: 1, OP1: 1, OP0: 1 } },
].map((s, i) => (i === 0 ? { ...s, set: { A: JOBS_A, B: JOBS_B, ...s.set } } : s));

export const aluJobs: LessonInput = {
  id: "alu-jobs",
  title: LABELS.title,
  module: 7,
  order: 1,
  objectives: [...LABELS.objectives],
  introduces: [],
  sections: [
    { kind: "question", title: LABELS.titles.question, prose: PROSE.question },
    { kind: "motivation", title: LABELS.titles.motivation, prose: PROSE.motivation },
    {
      kind: "prediction",
      title: LABELS.titles.prediction,
      prose: PROSE.prediction,
      interactives: [
        {
          id: "predict-count-down",
          kind: "prediction",
          timeModel: "settle",
          caption: LABELS.captions.predictCountDown,
          props: {
            question: PROSE.p1Question,
            libraryId: "alu8-4-block",
            run: [
              { label: "A 0000, OP 111", set: { A: "0000", B: "0000", OP2: 1, OP1: 1, OP0: 1 } },
            ],
            watch: "Y",
            options: [
              { value: "0000", label: LABELS.options.p1Zero },
              { value: "1111", label: LABELS.options.p1AllOnes },
              { value: "0001", label: LABELS.options.p1One },
            ],
            explain: PROSE.p1Explain,
            signals: ["A", "Y", "COUT"],
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
          id: "eight-jobs",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.eightJobs,
          lead: PROSE.eightJobsLead,
          after: PROSE.eightJobsAfter,
          props: {
            libraryId: "alu8-4-block",
            canOpen: false,
            initial: { A: JOBS_A, B: JOBS_B },
            readings: ["unsigned", "signed"],
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
          id: "build-operand",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.buildOperand,
          lead: PROSE.buildOperandLead,
          props: { challengeId: "operand-bit" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "job-faults",
          kind: "fault-lab",
          timeModel: "settle",
          caption: LABELS.captions.jobFaults,
          lead: PROSE.jobFaultsLead,
          props: {
            libraryId: "alu8-4",
            canOpen: false,
            faults: [
              {
                kind: "stuck-at",
                net: "C0",
                value: 0,
                label: LABELS.faults.c0Low,
                outcome: PROSE.jobFaultsAfterFault1,
              },
              {
                kind: "stuck-at",
                net: "OP2",
                value: 0,
                label: LABELS.faults.op2Low,
                outcome: PROSE.jobFaultsAfterFault2,
              },
              {
                kind: "stuck-at",
                net: "C2",
                value: 0,
                label: LABELS.faults.c2Low,
                outcome: PROSE.jobFaultsAfterFault3,
              },
            ],
            run: JOB_RUN,
          },
        },
      ],
    },
    {
      kind: "explanation",
      title: LABELS.titles.explanation,
      prose: PROSE.explanation,
      interactives: [
        {
          id: "operand-carry",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.operandCarry,
          lead: PROSE.operandCarryLead,
          after: PROSE.operandCarryAfter,
          props: { libraryId: "operand-carry", initial: { B: 1, OP1: 1 }, canOpen: false },
        },
      ],
    },
    {
      kind: "generalisation",
      title: LABELS.titles.generalisation,
      prose: PROSE.generalisation,
      interactives: [
        {
          id: "jobs-16",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.jobs16,
          lead: PROSE.jobs16Lead,
          after: PROSE.jobs16After,
          props: {
            libraryId: "alu8-16-block",
            canOpen: false,
            initial: { A: "0x00FF", B: "0x0000", OP2: 1, OP1: 1, OP0: 0 },
            readings: ["unsigned"],
          },
        },
      ],
    },
    {
      kind: "challenge",
      title: LABELS.titles.challenge,
      prose: "",
      interactives: [
        {
          id: "build-eight-job-slice",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.buildSlice,
          lead: PROSE.buildSliceLead,
          props: { challengeId: "eight-job-slice" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "operand-bit",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "draw",
      interface: {
        inputs: [{ name: "B" }, { name: "OP2" }, { name: "OP1" }, { name: "OP0" }],
        outputs: [{ name: "D" }],
      },
      palette: ["selector-2", "xor", "and", "or", "not"],
      allowedConstructs: DRAW_CONSTRUCTS,
      tests: { kind: "combinational", vectors: OPERAND_VECTORS },
      hints: [...PROSE.c1Hints],
      reference: { libraryId: "operand-bit" },
    },
    {
      id: "eight-job-slice",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "draw",
      interface: {
        inputs: [
          { name: "A" },
          { name: "B" },
          { name: "CIN" },
          { name: "OP2" },
          { name: "OP1" },
          { name: "OP0" },
        ],
        outputs: [{ name: "Y" }, { name: "COUT" }],
      },
      palette: ["full-adder", "selector-4", "selector-2", "and", "xor", "or", "not"],
      allowedConstructs: DRAW_CONSTRUCTS,
      tests: {
        kind: "combinational",
        vectors: SLICE_VECTORS,
        chain: {
          bitwise: ["A", "B"],
          outputs: ["Y"],
          shared: ["OP2", "OP1", "OP0"],
          carry: { in: "CIN", out: "COUT" },
        },
      },
      hints: [...PROSE.c2Hints],
      reference: { libraryId: "alu8-slice-parts" },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "A textbook ALU grows its jobs from a control table: Harris and Harris's A AND B, A OR B, A+B, A AND NOT B, A OR NOT B, A-B and set-if-less-than under a three-bit code whose top bit inverts B; the Hack ALU's six control bits zx, nx, zy, ny, f and no, which zero and negate each input; or the 74181's table of sixteen logic and sixteen arithmetic functions.",
    howThisDiffers:
      "The course keeps Module 3's four jobs and codes (00 AND, 01 XOR, 10 add, 11 subtract) and adds a third select input, OP2, for four jobs the shop's office asks for: OR to turn chosen lamps on, copying B to read a word as it is, counting up and counting down. The codes are this course's own: OP1 says whether the job adds, OP0 turns the adder's second word over, and OP2 swaps B for a fixed word, so every arithmetic job is one addition, A plus B, NOT B, all 0s or all 1s, with a carry in that the learner predicts from the count-down wrap. There is no set-if-less-than, no OR NOT B and no input zeroing. The learner draws the adder's second input first, then the whole slice, graded as a chain at 1, 4, 8 and 16 bits.",
  },
};
