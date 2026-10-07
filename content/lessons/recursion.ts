// Copyright © 2026 Christopher Snow

// Lesson: Module 11, lesson 5, a function that calls itself. The office wants the log newest
// first: `newest` shows the rest of a list newest first, by calling itself, then its own reading.
// Each call has its own frame on the stack, which grows by two words a reading and shrinks as the
// readings are shown. A function with no last case, or a log too long for the RAM, runs the stack
// into the ROM, where the push halts the machine with cause 34.
//
// The structure is here; the words are in recursion.prose.ts and recursion.labels.ts. The numbers
// the prose states are pinned by recursion.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import {
  COLDER_REFERENCE,
  COLDER_START,
  NEWEST,
  NEWEST_NO_LAST_CASE,
  logData,
  newestOn,
} from "./module11";
import { LABELS } from "./recursion.labels";
import { PROSE } from "./recursion.prose";

/** The colder challenge's logs and limits. */
export const COLDER_RUNS = [
  { log: [-190, -181, -205, -170, -210], limit: -200 },
  { log: [-205, -215, -190], limit: -200 },
  { log: [-190, -180], limit: -200 },
  { log: [-250], limit: -200 },
  { log: [], limit: -200 },
  { log: [-201, -200, -199, -300], limit: -200 },
] as const;

/** The readings colder than the limit, newest first: the specification. */
export const colderNewestFirst = (log: readonly number[], limit: number) =>
  [...log].reverse().filter((r) => r < limit);

/** The second challenge's answers, for a log of five readings. */
export const DEPTH_ANSWERS = [
  { id: "words", value: "10", form: "number" },
  { id: "lowest", value: "770", form: "hex" },
  { id: "longest", value: "60", form: "number" },
] as const;

const runLabel = (log: readonly number[], limit: number) =>
  `${LABELS.logPrefix} ${log.length ? log.join(", ") : LABELS.emptyLog}; ${LABELS.limitPrefix} ${limit}`;

export const recursion: LessonInput = {
  id: "recursion",
  title: LABELS.title,
  module: 11,
  order: 5,
  objectives: [...LABELS.objectives],
  introduces: ["recursion"],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "depth",
          kind: "stack-depth",
          timeModel: "none",
          caption: LABELS.captions.depth,
          lead: PROSE.depthLead,
          props: { program: NEWEST },
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
          id: "predict-order",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.predict,
          props: {
            program: NEWEST,
            registers: [1, 2, 5, 14, 15],
            stack: true,
            question: PROSE.p1Question,
            options: [
              { value: "-184, -190, -176, -181", label: LABELS.options.oldest },
              { value: "-181, -176, -190, -184", label: LABELS.options.newest },
              { value: "-184", label: LABELS.options.one },
            ],
            ask: { what: "shown" },
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
          id: "frames",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.frames,
          lead: PROSE.framesLead,
          after: PROSE.framesAfter,
          props: {
            program: NEWEST,
            registers: [0, 1, 2, 5, 14, 15],
            breakpoints: true,
            pause: ["newest"],
            watch: true,
            watched: ["R1", "R2", "R14"],
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
          id: "write-colder",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.colder,
          lead: PROSE.colderLead,
          props: { challengeId: "colder-newest" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: PROSE.failureExperiment,
      interactives: [
        {
          id: "no-last-case",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.noLast,
          lead: PROSE.noLastLead,
          props: {
            program: NEWEST_NO_LAST_CASE,
            registers: [1, 2, 14, 15],
            stack: true,
            outcomes: PROSE.noLastAfter,
          },
        },
        {
          id: "too-long",
          kind: "stack-depth",
          timeModel: "none",
          caption: LABELS.captions.tooLong,
          lead: PROSE.tooLongLead,
          props: { program: newestOn(Array.from({ length: 61 }, (_, k) => -150 - (k % 40))) },
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
          id: "depths",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.depths,
          lead: PROSE.depthsLead,
          props: { challengeId: "stack-depth" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "colder-newest",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "write",
      allowedConstructs: ["assembly"],
      interface: { inputs: [], outputs: [] },
      initial: {
        text: COLDER_START,
        data: {
          debugger: { breakpoints: true, watch: true, watched: ["R1", "R2", "R14"], stack: true },
        },
      },
      tests: {
        kind: "answers",
        grader: "program",
        cases: COLDER_RUNS.map(({ log, limit }) => ({
          label: runLabel(log, limit),
          given: { data: logData(log, limit), detail: "colderNewest" },
          expect: {
            shown: colderNewestFirst(log, limit).join(", "),
            stackWords: String(log.length),
            end: "stop",
          },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { text: COLDER_REFERENCE },
    },
    {
      id: "stack-depth",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: DEPTH_ANSWERS.map((a) => ({
        id: a.id,
        label: LABELS.fields[a.id],
        kind: a.form === "hex" ? ("text" as const) : ("number" as const),
        ...(a.form === "number" ? { min: 0, step: 1 } : {}),
      })),
      tests: {
        kind: "answers",
        grader: "exact",
        cases: DEPTH_ANSWERS.map((a) => ({
          label: LABELS.fields[a.id],
          given: { field: a.id, form: a.form, detail: "recursionDepth" },
          expect: { value: a.value },
        })),
      },
      hints: [...PROSE.c2Hints],
      reference: { answers: Object.fromEntries(DEPTH_ANSWERS.map((a) => [a.id, a.value])) },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "Recursion taught through the factorial (Patterson and Hennessy's fact, with its frames on the stack; Harris and Harris), Fibonacci, the Towers of Hanoi or Ackermann's function; a string printed backwards as the stock example of order reversed by recursion.",
    howThisDiffers:
      "The function is the shop's: the day's log shown on the display newest first, the job a recursive function does that a loop walking forward cannot, since each reading is shown after the call for the rest returns. Its frames, two words a reading, are seen growing and shrinking in the debugger's stack view and on a chart of the stack's depth over the whole run, run on the reference. The failures are the course machine's own: with no last case, or with a log of 61 readings, the stack grows down through the 960-byte RAM into the ROM, and the push halts the machine with cause 34. No factorial, no Fibonacci, no Hanoi, no Ackermann.",
  },
};
