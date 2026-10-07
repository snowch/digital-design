// Copyright © 2026 Christopher Snow

// Lesson: Module 11, lesson 4, the stack. A function that calls another loses its own return
// address to the inner call, and the run goes round for ever until the debugger cuts it off. The
// fix keeps R15, and any kept register the function changes, in the RAM: a stack growing down
// from 7C0, pushed and popped with R14. Each call's words are its frame, which the debugger marks
// by the calling convention; the convention's rows for R10 to R13 and R14 are completed.
//
// The structure is here; the words are in stack.prose.ts and stack.labels.ts. The numbers the
// prose states are pinned by stack.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import { above } from "./functions";
import { BOTH_REFERENCE, BOTH_START, TOTAL, TOTAL_NO_START, TOTAL_NO_STACK } from "./module11";
import { LABELS } from "./stack.labels";
import { PROSE } from "./stack.prose";

/** How many rooms are above their limits: the specification of `both`. */
export const both = (a: number, b: number) =>
  (above(a, -180) > 0 ? 1 : 0) + (above(b, -200) > 0 ? 1 : 0);

/** `both`'s arguments in the tests that call it directly: room A's and room B's readings. */
export const BOTH_CALLS = [
  [-170, -190],
  [-185, -210],
  [-170, -210],
  [-185, -190],
  [25, 30],
  [-180, -200],
] as const;

export const BOTH_RUNS = [
  [-170, -190],
  [-185, -210],
  [-170, -210],
] as const;

/** The stack's addresses the second challenge asks for, in the run of `total`. */
export const STACK_ANSWERS = [
  { id: "returnAt", value: "7B8" },
  { id: "keptAt", value: "7B0" },
  { id: "inAbove", value: "7B0" },
  { id: "after", value: "7C0" },
] as const;

const ROOMS = { SENSORA: "-170", SENSORB: "-190" };

export const stack: LessonInput = {
  id: "stack",
  title: LABELS.title,
  module: 11,
  order: 4,
  objectives: [...LABELS.objectives],
  introduces: ["stack"],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "lost-return",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.lost,
          lead: PROSE.lostLead,
          props: {
            program: TOTAL_NO_STACK,
            inputs: ROOMS,
            registers: [1, 2, 10, 15],
            breakpoints: true,
            outcomes: PROSE.lostAfter,
          },
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
          id: "predict-r14",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.predict,
          props: {
            program: TOTAL,
            inputs: ROOMS,
            registers: [1, 2, 10, 14, 15],
            stack: true,
            question: PROSE.p1Question,
            options: [
              { value: "1984", label: LABELS.options.at7C0 },
              { value: "1976", label: LABELS.options.at7B8 },
              { value: "1968", label: LABELS.options.at7B0 },
            ],
            ask: { after: 11, what: "register", reg: 14 },
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
          id: "pushed",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.pushed,
          lead: PROSE.pushedLead,
          after: PROSE.pushedAfter,
          props: {
            program: TOTAL,
            inputs: ROOMS,
            registers: [1, 2, 5, 10, 14, 15],
            breakpoints: true,
            pause: ["above"],
            watch: true,
            watched: ["R14", "R15", "word[R14]"],
            stack: true,
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
          id: "write-both",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.both,
          lead: PROSE.bothLead,
          props: { challengeId: "both" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: PROSE.failureExperiment,
      interactives: [
        {
          id: "no-start",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.noStart,
          lead: PROSE.noStartLead,
          props: {
            program: TOTAL_NO_START,
            inputs: ROOMS,
            registers: [1, 2, 10, 14, 15],
            stack: true,
            outcomes: PROSE.noStartAfter,
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
          id: "depth",
          kind: "stack-depth",
          timeModel: "none",
          caption: LABELS.captions.depth,
          lead: PROSE.depthLead,
          props: { program: TOTAL, inputs: ROOMS },
        },
      ],
    },
    { kind: "generalisation", title: LABELS.titles.generalisation, prose: PROSE.generalisation },
    {
      kind: "challenge",
      title: LABELS.titles.challenge,
      prose: "",
      interactives: [
        {
          id: "addresses",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.addresses,
          lead: PROSE.addressesLead,
          props: { challengeId: "stack-addresses" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "both",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "write",
      allowedConstructs: ["assembly"],
      interface: { inputs: [], outputs: [] },
      initial: {
        text: BOTH_START,
        data: {
          debugger: {
            breakpoints: true,
            watch: true,
            watched: ["R1", "R14", "R15"],
            stack: true,
          },
        },
      },
      tests: {
        kind: "answers",
        grader: "program",
        cases: [
          ...BOTH_CALLS.map(([a, b]) => ({
            label: `${LABELS.callPrefix} R1 ${a}, R2 ${b}`,
            given: { call: "both", R1: a, R2: b, detail: "bothCall" },
            expect: { R1: String(both(a, b)), kept: "", returned: "yes" },
          })),
          ...BOTH_RUNS.map(([a, b]) => ({
            label: `${LABELS.roomPrefixA} ${a}, ${LABELS.roomPrefixB} ${b}`,
            given: { sensorA: a, sensorB: b, detail: "bothRun" },
            expect: { display: String(both(a, b)), end: "stop" },
          })),
        ],
      },
      hints: [...PROSE.c1Hints],
      reference: { text: BOTH_REFERENCE },
    },
    {
      id: "stack-addresses",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: STACK_ANSWERS.map((a) => ({
        id: a.id,
        label: LABELS.fields[a.id],
        kind: "text" as const,
      })),
      tests: {
        kind: "answers",
        grader: "exact",
        cases: STACK_ANSWERS.map((a) => ({
          label: LABELS.fields[a.id],
          given: { field: a.id, form: "hex", detail: "stackAddress" },
          expect: { value: a.value },
        })),
      },
      hints: [...PROSE.c2Hints],
      reference: { answers: Object.fromEntries(STACK_ANSWERS.map((a) => [a.id, a.value])) },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "Patterson and Hennessy's nested procedure with $sp and $ra saved in a frame (and the stack-frame diagrams of Bryant and O'Hallaron, with a frame pointer and locals); push and pop introduced as abstract operations on a stack of plates; LC-3's R6 stack.",
    howThisDiffers:
      "The stack arrives as the fix for a failure the learner runs first: the shop's function total, which calls above twice, loses its own return address to the inner call and goes round until the debugger cuts the run off. The stack is the course machine's RAM from 7C0 down, pushed and popped with R14 by two ordinary instructions each; its frames are the debugger's reading of the course's own convention, which the machine does not know. A program that never sets R14 pauses at its first push. The learner writes both, which keeps two words through two calls, and works out the stack's addresses for total by hand. No plates, no frame pointer, no locals.",
  },
};
