// Copyright © 2026 Christopher Snow

// Lesson: Module 8, lesson 1, the register jobs: the register file's two words into the ALU, its
// result back into the register file, and a 32-bit word whose digits say which registers and
// which job. The first lesson of the datapath, from Module 7's last question.
//
// The structure is here; the words are in instructions.prose.ts and instructions.labels.ts. The
// circuits are the model's (packages/dd-model: datapath.ts, library-datapath.ts); the numbers the
// prose states are pinned by instructions.facts.test.ts, read off the figures' own props.

import type { LessonInput } from "@dd/lesson-schema";

import { LABELS } from "./instructions.labels";
import { PROSE } from "./instructions.prose";
import { DIGITS_REFERENCE, DIGITS_START, JOBS_REFERENCE, JOBS_START } from "./module8";

/** The shop's two rooms, as Module 1 read them, in tenths of a degree. */
export const ROOMS = { R1: "-184", R2: "-250" };

/** What the digits challenge may use: Module 7's constructs without parameter and arithmetic. */
const DIGITS_CONSTRUCTS = ["module", "ports", "logic", "vector", "assign", "select"];
/** The register jobs' text adds one module used inside another. */
const JOBS_CONSTRUCTS = [...DIGITS_CONSTRUCTS, "instance"];

/** The instructions the investigation offers, each with WRITEY set by hand. */
const JOBS = [
  { label: LABELS.instructions.subtract, text: "R3 <= R1 - R2", set: { WRITEY: 1 } },
  { label: LABELS.instructions.add, text: "R3 <= R1 + R2", set: { WRITEY: 1 } },
  { label: LABELS.instructions.copy, text: "R4 <= R2", set: { WRITEY: 1 } },
  { label: LABELS.instructions.countUp, text: "R1 <= R1 + 1", set: { WRITEY: 1 } },
  { label: LABELS.instructions.noWrite, text: "R3 <= R1 - R2", set: { WRITEY: 0 } },
];

/** The digits challenge's tests: the worked example's six words and the lesson's own. */
const DIGITS_VECTORS = [
  "13123000",
  "12123000",
  "380027D8",
  "380037E0",
  "56230002",
  "15032000",
  "480207C0",
  "84000000",
  "FEDCBA98",
].map((ir) => ({
  label: ir,
  inputs: { IR: `0x${ir}` },
  expect: {
    K: `0x${ir[0]}`,
    J: `0x${ir[1]}`,
    A: `0x${ir[2]}`,
    B: `0x${ir[3]}`,
    Y: `0x${ir[4]}`,
    C: `0x${ir.slice(5)}`,
  },
}));

const h64 = (v: bigint) => `0x${BigInt.asUintN(64, v).toString(16).toUpperCase()}`;

/** The register jobs' tests: R1 is -184 and R2 is -250 at the start. */
const JOBS_STEPS: {
  label: string;
  set: Record<string, string | number>;
  expect: Record<string, string>;
}[] = [
  {
    label: "R3 <= R1 - R2, WRITEY 1, clock low",
    set: { CLK: 0, IR: "0x13123000", WRITEY: 1 },
    expect: { RESULT: h64(66n) },
  },
  { label: "edge: R3 takes 66", set: { CLK: 1 }, expect: { RESULT: h64(66n) } },
  {
    label: "R3 <= R3 + R3 arrives while the clock is high",
    set: { IR: "0x12333000" },
    expect: { RESULT: h64(132n) },
  },
  { label: "clock low: R3 is still 66", set: { CLK: 0 }, expect: { RESULT: h64(132n) } },
  { label: "edge: R3 takes 132", set: { CLK: 1 }, expect: { RESULT: h64(264n) } },
  {
    label: "R1 <= R1 + 1, WRITEY 0, clock low",
    set: { CLK: 0, IR: "0x16101000", WRITEY: 0 },
    expect: { RESULT: h64(-183n) },
  },
  { label: "edge with WRITEY 0: R1 stays -184", set: { CLK: 1 }, expect: { RESULT: h64(-183n) } },
  { label: "clock low, WRITEY 1", set: { CLK: 0, WRITEY: 1 }, expect: { RESULT: h64(-183n) } },
  { label: "edge: R1 takes -183", set: { CLK: 1 }, expect: { RESULT: h64(-182n) } },
  {
    label: "R4 <= R2, clock low",
    set: { CLK: 0, IR: "0x15024000" },
    expect: { RESULT: h64(-250n) },
  },
];

export const instructions: LessonInput = {
  id: "instructions",
  title: LABELS.title,
  module: 8,
  order: 1,
  objectives: [...LABELS.objectives],
  introduces: ["instruction", "datapath"],
  sections: [
    { kind: "question", title: LABELS.titles.question, prose: PROSE.question },
    {
      kind: "motivation",
      title: LABELS.titles.motivation,
      prose: PROSE.motivation,
      interactives: [
        {
          id: "fields",
          kind: "instruction-fields",
          timeModel: "none",
          caption: LABELS.captions.fields,
          lead: PROSE.fieldsLead,
          props: {
            instructions: JOBS.slice(0, 4).map((j) => ({ label: j.label, text: j.text })),
            notes: LABELS.fieldNotes,
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
          id: "predict-difference",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.predictDifference,
          props: {
            libraryId: "datapath-jobs",
            registers: ROOMS,
            instructions: [JOBS[0]],
            shown: [1, 2, 3],
            buses: ["QA", "QB", "RESULT"],
            question: PROSE.p1Question,
            options: [
              { value: "-434", label: LABELS.options.p1Sum },
              { value: "66", label: LABELS.options.p1Difference },
              { value: "-66", label: LABELS.options.p1Other },
            ],
            ask: "value",
            register: 3,
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
          id: "jobs",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.jobs,
          lead: PROSE.jobsLead,
          after: PROSE.jobsAfter,
          props: {
            libraryId: "datapath-jobs",
            registers: ROOMS,
            instructions: JOBS,
            shown: [1, 2, 3, 4],
            buses: ["QA", "QB", "RESULT"],
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
          id: "write-digits",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.writeDigits,
          lead: PROSE.writeDigitsLead,
          props: { challengeId: "digits-text" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "jobs-faults",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.jobsFaults,
          lead: PROSE.jobsFaultsLead,
          props: {
            outcomes: PROSE.jobsFaultsAfter,
            libraryId: "datapath-jobs",
            registers: ROOMS,
            instructions: [JOBS[0], JOBS[1]],
            shown: [0, 1, 2, 3],
            faults: [
              { kind: "stuck-at", net: "Y", value: 0, label: LABELS.faults.yLow },
              { kind: "stuck-at", net: "OP0", value: 0, label: LABELS.faults.op0Low },
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
          id: "write-jobs",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.writeJobs,
          lead: PROSE.writeJobsLead,
          props: { challengeId: "jobs-text" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "digits-text",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "write",
      interface: {
        inputs: [{ name: "IR", width: 32 }],
        outputs: [
          { name: "K", width: 4 },
          { name: "J", width: 4 },
          { name: "A", width: 4 },
          { name: "B", width: 4 },
          { name: "Y", width: 4 },
          { name: "C", width: 12 },
        ],
      },
      tryIt: "pins",
      allowedConstructs: DIGITS_CONSTRUCTS,
      initial: { hdl: DIGITS_START },
      tests: { kind: "combinational", vectors: DIGITS_VECTORS },
      hints: [...PROSE.c1Hints],
      reference: { hdl: DIGITS_REFERENCE },
    },
    {
      id: "jobs-text",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      interface: {
        inputs: [{ name: "CLK" }, { name: "IR", width: 32 }, { name: "WRITEY" }],
        outputs: [{ name: "RESULT", width: 64 }],
      },
      allowedConstructs: JOBS_CONSTRUCTS,
      courseModules: { set: "machine", registers: ROOMS },
      tryIt: "pins",
      initial: { hdl: JOBS_START },
      tests: { kind: "sequence", steps: JOBS_STEPS },
      hints: [...PROSE.c2Hints],
      reference: { hdl: JOBS_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "The single-cycle datapath built from instruction fetch outwards (Patterson and Hennessy) or from the load first (Harris and Harris), with the R-type instruction's fields rs, rt, rd wired to a register file and the control signals RegWrite and ALUOp; Tanenbaum's data path of registers driving an ALU through buses, built from the ALU outwards; Nand2Tetris's A and D registers around its ALU.",
    howThisDiffers:
      "The lesson starts where Module 7 stopped, at the course's own ALU with its question of where A and B come from, and answers it with Module 6's register file, so it builds outwards from the ALU as Tanenbaum's data path does; it differs in having no buses shared by several drivers, no fetch at all yet, and in the instruction arriving as a word the learner chooses, its digits read off as wires (the course's layout, digit for digit, K J A B Y and a constant, in the order data runs through the drawings). The one control signal, WRITEY, is set by hand and named for what it does. The worked numbers are the shop's two rooms from Module 1, and the prediction is the subtraction Module 7's flags lesson made with them. Faults are a digit's wires held at 0, which show the digits are only wires.",
  },
};
