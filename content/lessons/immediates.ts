// Copyright © 2026 Christopher Snow

// Lesson: Module 10, lesson 3, what one instruction can say. The constant is 12 bits read signed,
// -2048 to 2047; the memory is 2 KB so that every address, 000 to 7FF, fits in it; a branch's
// constant counts instructions, so every branch reaches the whole ROM of 256 instructions. There
// is no "greater than": "less than" with its registers swapped says it, and the swapped "not
// less" says "not greater". A number too wide for the constant is built from several constant
// jobs, or kept as a word in the ROM and read by one absolute load. Books call the constant an
// immediate.
//
// The structure is here; the words are in immediates.prose.ts and immediates.labels.ts. The
// numbers the prose states are pinned by immediates.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./immediates.labels";
import { PROSE } from "./immediates.prose";
import {
  COUNT_WARM,
  COUNT_WARM_WRONG,
  GREATER_REFERENCE,
  GREATER_START,
  WIDE_SUMS,
  WIDE_WORD,
  multiplyLoop,
} from "./module10";

/** R1 and R2 for the comparisons: larger, smaller, equal, and a pair whose subtraction overflows. */
export const PAIRS = [
  { label: LABELS.pairs.larger, a: "5", b: "-3" },
  { label: LABELS.pairs.smaller, a: "-3", b: "5" },
  { label: LABELS.pairs.equal, a: "5", b: "5" },
  { label: LABELS.pairs.overflow, a: "9223372036854775807", b: "-1" },
];

/** The numbers the first challenge asks for, each worked out by hand. */
export const REACH = [
  { id: "largest", form: "number", value: "2047", detail: "reachLargest" },
  { id: "back", form: "hex", value: "FFB", detail: "reachBack" },
  { id: "furthest", form: "hex", value: "1FFC", detail: "reachFurthest" },
] as const;

const h = (v: bigint) => `0x${BigInt.asUintN(64, v).toString(16).toUpperCase()}`;
const MAX = (1n << 63n) - 1n;
const MIN = -(1n << 63n);

/** The second challenge's tests: A > B read signed, on pairs that test the ends of the range. */
const GREATER_VECTORS = (
  [
    [5n, -3n],
    [-3n, 5n],
    [5n, 5n],
    [0n, -1n],
    [-1n, 0n],
    [MAX, -1n],
    [-1n, MAX],
    [MIN, 1n],
    [1n, MIN],
    [MIN, MIN],
  ] as const
).map(([a, b]) => ({
  label: `A ${a}, B ${b}`,
  inputs: { A: h(a), B: h(b) },
  expect: { GT: a > b ? 1 : 0 },
}));

export const immediates: LessonInput = {
  id: "immediates",
  title: LABELS.title,
  module: 10,
  order: 3,
  objectives: [...LABELS.objectives],
  introduces: ["immediate"],
  sections: [
    { kind: "question", title: LABELS.titles.question, prose: PROSE.question },
    {
      kind: "motivation",
      title: LABELS.titles.motivation,
      prose: PROSE.motivation,
      interactives: [
        {
          id: "range",
          kind: "widening",
          timeModel: "settle",
          caption: LABELS.captions.range,
          lead: PROSE.rangeLead,
          props: {
            constants: [
              { label: LABELS.constants.most, c: "7FF" },
              { label: LABELS.constants.least, c: "800" },
              { label: LABELS.constants.minusOne, c: "FFF" },
            ],
          },
        },
      ],
    },
    {
      kind: "prediction",
      title: LABELS.titles.prediction,
      prose: PROSE.prediction,
      interactives: [
        {
          id: "predict-greater",
          kind: "swap-compare",
          timeModel: "none",
          caption: LABELS.captions.predictGreater,
          props: {
            cases: PAIRS.slice(0, 3),
            question: PROSE.p1Question,
            options: [
              { value: "6:swap", label: LABELS.options.p1Swap },
              { value: "7:keep", label: LABELS.options.p1NotLess },
              { value: "7:swap", label: LABELS.options.p1NotLessSwap },
            ],
            explain: PROSE.p1Explain,
          },
        },
      ],
    },
    {
      kind: "investigation",
      title: LABELS.titles.investigation,
      prose: PROSE.investigation,
      interactives: [
        {
          id: "comparisons",
          kind: "swap-compare",
          timeModel: "none",
          caption: LABELS.captions.comparisons,
          lead: PROSE.comparisonsLead,
          after: PROSE.comparisonsAfter,
          props: { cases: PAIRS },
        },
        {
          id: "wide",
          kind: "program-compare",
          timeModel: "none",
          caption: LABELS.captions.wide,
          lead: PROSE.wideLead,
          props: {
            programs: [
              { label: LABELS.programs.sums, program: WIDE_SUMS },
              { label: LABELS.programs.word, program: WIDE_WORD },
            ],
            shown: [1],
            outcomes: PROSE.wideAfter,
            question: PROSE.p2Question,
            options: [
              { value: "3", label: LABELS.options.p2Three },
              { value: "5", label: LABELS.options.p2Five },
              { value: "6", label: LABELS.options.p2Six },
            ],
            ask: { program: 0, what: "ran" },
            explain: PROSE.p2Explain,
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
          id: "colder-branch",
          kind: "branch-targets",
          timeModel: "none",
          caption: LABELS.captions.colderBranch,
          lead: PROSE.colderBranchLead,
          props: {
            programs: [{ label: LABELS.programs.colder, program: multiplyLoop(5) }],
          },
        },
        {
          id: "work-reach",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.workReach,
          lead: PROSE.workReachLead,
          props: { challengeId: "reach" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "equal-trap",
          kind: "program-compare",
          timeModel: "none",
          caption: LABELS.captions.equalTrap,
          lead: PROSE.equalTrapLead,
          props: {
            programs: [
              { label: LABELS.programs.right, program: COUNT_WARM },
              { label: LABELS.programs.wrong, program: COUNT_WARM_WRONG },
            ],
            inputs: { DOOR: 0, WARM: 0, SENSORA: "-200", SENSORB: "-250" },
            outcomes: PROSE.equalTrapAfter,
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
          id: "write-greater",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.writeGreater,
          lead: PROSE.writeGreaterLead,
          props: { challengeId: "greater-text" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "reach",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: REACH.map((r) => ({ id: r.id, label: LABELS.reach[r.id], kind: "text" as const })),
      tests: {
        kind: "answers",
        grader: "exact",
        cases: REACH.map((r) => ({
          label: LABELS.reach[r.id],
          given: { field: r.id, form: r.form, detail: r.detail },
          expect: { value: r.value },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { answers: Object.fromEntries(REACH.map((r) => [r.id, r.value])) },
    },
    {
      id: "greater-text",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      feedback: "words",
      interface: {
        inputs: [
          { name: "A", width: 64 },
          { name: "B", width: 64 },
        ],
        outputs: [{ name: "GT" }],
      },
      allowedConstructs: ["module", "ports", "logic", "vector", "assign", "op-bitwise", "instance"],
      courseModules: { set: "machine" },
      tryIt: "pins",
      initial: { hdl: GREATER_START },
      tests: { kind: "combinational", vectors: GREATER_VECTORS },
      hints: [...PROSE.c2Hints],
      reference: { hdl: GREATER_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "The I-type format's 16-bit immediate, sign-extended, with a 32-bit constant built by lui and addi (Patterson and Hennessy); branch offsets counted in words and the range of a conditional branch against a jump; the slt and sltu instructions with the pseudo-instructions bgt and ble that an assembler expands by swapping registers; 'make the common case fast' as the reason small constants suffice.",
    howThisDiffers:
      'Every number is the course machine\'s own and argued from what the learner has: a 12-bit constant read signed, a 2 KB memory chosen so every address fits in it (docs/machine.md, decision 4), a ROM of 256 instructions that every branch reaches. The swap is shown on the reference\'s own branch condition for every comparison, signed and unsigned, on pairs that include equal words and a subtraction that overflows, and its failure is the shop\'s: a count of warm rooms that counts a room at the limit when "not warmer" is written as "colder". The wide number is built two ways on the reference and the costs counted: three constant jobs, or one load of a word kept in the ROM; no upper-half instruction and no shift. The learner writes "greater than" as the ALU\'s subtraction with its inputs swapped, tested at the ends of the signed range.',
  },
};
