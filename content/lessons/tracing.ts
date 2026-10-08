// Copyright © 2026 Christopher Snow

// Lesson: Module 13, lesson 3, tracing. Module 0's ladder followed one line down to one wire on a
// path chosen for the learner; here the learner chooses the line, the edge and the path. The
// figure pauses the shop's program before any edge of any line, lists every level opened with
// its maker and its ports' values, and opens each part that never opens (a register, the register
// file, the RAM, a selector or an adder of a whole word) as the module that built it drew one bit,
// driven by the machine's values, so every path ends at a gate or a flip-flop. A wire held at 0
// deep in the ALU is found by tracing down from the display.
//
// The structure is here; the words are in tracing.prose.ts and tracing.labels.ts. The numbers the
// prose states are pinned by tracing.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./tracing.labels";
import { PROSE } from "./tracing.prose";
import { SHOP, SHOP_INPUTS } from "./module13";

/** The challenge: five wires at named edges, each found by a trace. */
export const TRACE_ANSWERS = [
  { id: "xorB", value: "0", detail: "traceXorB" },
  { id: "sum1", value: "1", detail: "traceSum1" },
  { id: "pcD", value: "1", detail: "tracePcD" },
  { id: "r5En", value: "1", detail: "traceR5En" },
  { id: "r4En", value: "0", detail: "traceR4En" },
] as const;

const TRACE = {
  program: SHOP,
  inputs: SHOP_INPUTS,
  levels: false,
  trace: true,
  shown: [1, 2, 3, 4, 5],
};

export const tracing: LessonInput = {
  id: "tracing",
  title: LABELS.title,
  module: 13,
  order: 3,
  objectives: [...LABELS.objectives],
  introduces: ["abstraction"],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "trace-free",
          kind: "machine-levels",
          timeModel: "settle",
          caption: LABELS.captions.free,
          lead: PROSE.freeLead,
          props: { ...TRACE, start: 27 },
        },
      ],
    },
    { kind: "motivation", title: LABELS.titles.motivation, prose: PROSE.motivation },
    {
      kind: "prediction",
      title: LABELS.titles.prediction,
      prose: PROSE.prediction,
      interactives: [
        {
          id: "predict-hr",
          kind: "machine-levels",
          timeModel: "settle",
          caption: LABELS.captions.predict,
          props: {
            ...TRACE,
            start: 27,
            question: PROSE.p1Question,
            options: [
              { value: "0", label: "0" },
              { value: "1", label: "1" },
            ],
            ask: "net",
            net: "HR",
            bit: 1,
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
          id: "trace-sum",
          kind: "machine-levels",
          timeModel: "settle",
          caption: LABELS.captions.sum,
          lead: PROSE.sumLead,
          after: PROSE.sumAfter,
          props: { ...TRACE, start: 27 },
        },
      ],
    },
    {
      kind: "construction",
      title: LABELS.titles.construction,
      prose: PROSE.construction,
      interactives: [
        {
          id: "trace-pc",
          kind: "machine-levels",
          timeModel: "settle",
          caption: LABELS.captions.pc,
          lead: PROSE.pcLead,
          props: { ...TRACE, start: 47, shown: [6, 15] },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: PROSE.failureExperiment,
      interactives: [
        {
          id: "trace-fault",
          kind: "machine-levels",
          timeModel: "settle",
          caption: LABELS.captions.fault,
          lead: PROSE.faultLead,
          props: {
            ...TRACE,
            compare: true,
            devices: true,
            faults: [
              {
                kind: "stuck-at",
                net: "datapath/alu/g0/q0/bit1/SUM",
                value: 0,
                label: LABELS.faults.alu,
                outcome: PROSE.faultAlu,
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
          id: "trace-answers",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.answers,
          lead: PROSE.answersLead,
          props: { challengeId: "five-traces" },
        },
        {
          id: "trace-tool",
          kind: "machine-levels",
          timeModel: "settle",
          caption: LABELS.captions.tool,
          props: { ...TRACE, start: 0 },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "five-traces",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: TRACE_ANSWERS.map((a) => ({
        id: a.id,
        label: LABELS.fields[a.id],
        kind: "text" as const,
      })),
      tests: {
        kind: "answers",
        grader: "exact",
        cases: TRACE_ANSWERS.map((a) => ({
          label: LABELS.fields[a.id],
          given: { field: a.id, form: "number", detail: a.detail },
          expect: { value: a.value },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { answers: Object.fromEntries(TRACE_ANSWERS.map((a) => [a.id, a.value])) },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "The textbooks' tour of the levels of a computer, from a high-level statement through assembly and machine language to the microarchitecture and the logic gates, drawn once as a stack of layers (Patt and Patel's levels of transformation, Tanenbaum's multilevel machine), and Nand2Tetris's one-way build from NAND gates up to the Hack computer.",
    howThisDiffers:
      "The levels are not a diagram but the course's own running machine, paused before any edge of any line the learner chooses, and opened block by block down to one gate on a path the learner chooses: each level opened is listed with the module of this course that built it and the values on its ports at that edge. Parts the simulator runs whole (the registers, the register file, the RAM, the selectors and adders of a whole word) open as the module that built them drew one bit, driven by the machine's own values, so every path ends at a gate or a flip-flop. The failure experiment holds one wire in the ALU at 0 and has the learner find it from the display down; the challenge asks five wires at named edges that only a trace answers.",
  },
};
