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

import { overBy } from "./functions";
import {
  ROOMS_OVER_REFERENCE,
  ROOMS_OVER_START,
  STACK_QUIZ,
  SUM_NO_STACK,
  SUM_OVER,
  SUM_POPS_SWAPPED,
} from "./module11";
import { LABELS } from "./stack.labels";
import { PROSE } from "./stack.prose";

/** How many rooms are above their limits: the specification of `roomsOver`. */
export const roomsOver = (a: number, b: number) =>
  (overBy(a, -180) > 0 ? 1 : 0) + (overBy(b, -200) > 0 ? 1 : 0);

/** `roomsOver`'s arguments in the tests that call it directly: room A's and room B's readings. */
export const ROOMS_CALLS = [
  [-170, -190],
  [-185, -210],
  [-170, -210],
  [-185, -190],
  [25, 30],
  [-180, -200],
] as const;

export const ROOMS_RUNS = [
  [-170, -190],
  [-185, -210],
  [-170, -210],
] as const;

/** What the construction asks of a run of `sumKept`, which the lesson does not run. */
export const STACK_ANSWERS = [
  { id: "r11At", value: "7A8", detail: "stackAddress" },
  { id: "r12At", value: "7A0", detail: "stackAddress" },
  { id: "inOverBy", value: "7A0", detail: "stackAddress" },
  { id: "leftAt7B8", value: "010", detail: "stackWord" },
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
            program: SUM_NO_STACK,
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
          id: "predict-7b8",
          kind: "program-listing",
          timeModel: "none",
          caption: LABELS.captions.predict,
          props: {
            program: SUM_OVER,
            question: PROSE.p1Question,
            options: [
              { value: "010", label: "010" },
              { value: "014", label: "014" },
              { value: "044", label: "044" },
              { value: "001", label: "001" },
            ],
            ask: {
              what: "run",
              run: { after: 12, what: "word", address: "7B8", hex: true },
              inputs: ROOMS,
            },
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
          props: {
            program: SUM_OVER,
            inputs: ROOMS,
            registers: [1, 2, 10, 14, 15],
            breakpoints: true,
            pause: ["overBy"],
            watch: true,
            watched: ["R10", "R14", "R15", "word[R14]"],
            stack: true,
            stackDrawn: true,
            outcomes: PROSE.pushedAfter,
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
          id: "check-listing",
          kind: "program-listing",
          timeModel: "none",
          caption: LABELS.captions.checkListing,
          lead: PROSE.checkListingLead,
          props: { program: STACK_QUIZ, names: false },
        },
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
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: PROSE.failureExperiment,
      interactives: [
        {
          id: "pops-swapped",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.popsSwapped,
          lead: PROSE.popsSwappedLead,
          props: {
            program: SUM_POPS_SWAPPED,
            inputs: ROOMS,
            registers: [1, 10, 14, 15],
            breakpoints: true,
            stack: true,
            outcomes: PROSE.popsSwappedAfter,
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
          props: { program: SUM_OVER, inputs: ROOMS },
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
          id: "write-rooms",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.rooms,
          lead: PROSE.roomsLead,
          props: { challengeId: "rooms-over" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "stack-addresses",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
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
          given: { field: a.id, form: "hex", detail: a.detail },
          expect: { value: a.value },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { answers: Object.fromEntries(STACK_ANSWERS.map((a) => [a.id, a.value])) },
    },
    {
      id: "rooms-over",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      allowedConstructs: ["assembly"],
      interface: { inputs: [], outputs: [] },
      initial: {
        text: ROOMS_OVER_START,
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
          ...ROOMS_CALLS.map(([a, b]) => ({
            label: `${LABELS.callPrefix} R1 ${a}, R2 ${b}`,
            given: { call: "roomsOver", R1: a, R2: b, detail: "roomsCall" },
            expect: {
              R1: String(roomsOver(a, b)),
              calls: "2",
              stackWords: "3",
              kept: "",
              returned: "yes",
            },
          })),
          ...ROOMS_RUNS.map(([a, b]) => ({
            label: `${LABELS.roomPrefixA} ${a}, ${LABELS.roomPrefixB} ${b}`,
            given: { sensorA: a, sensorB: b, detail: "roomsRun" },
            expect: { display: String(roomsOver(a, b)), end: "stop" },
          })),
        ],
      },
      hints: [...PROSE.c2Hints],
      reference: { text: ROOMS_OVER_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "Patterson and Hennessy's nested procedure with $sp and $ra saved in a frame (and the stack-frame diagrams of Bryant and O'Hallaron, with a frame pointer and locals); push and pop introduced as abstract operations on a stack of plates; LC-3's R6 stack.",
    howThisDiffers:
      "The stack arrives as the fix for a failure the learner runs first: the shop's function sumOver, which calls overBy twice, loses its own return address to the inner call and goes round until the debugger cuts the run off. The stack is the course machine's RAM from 7C0 down, pushed and popped with R14 by two ordinary instructions each; its frames are the debugger's reading of the course's own convention, which the machine does not know. The main program keeps ALARM's bit in R10 through the call, so the push visibly saves it; pops in the order of the pushes send the return to 001, where the machine halts. The learner works out the stack's addresses for a function the lesson never runs, then writes roomsOver, which keeps two words through two calls. No plates, no frame pointer, no locals.",
  },
};
