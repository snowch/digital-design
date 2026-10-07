// Copyright © 2026 Christopher Snow

// Lesson: Module 11, lesson 6, finding the mistake in a program that runs and gives a wrong
// answer. A program counting warm readings, one short, is run over several logs beside what each
// should give; a method (a failing log, what each part should leave, a breakpoint before the part,
// step and watch to the first value that differs, mend and run every log) finds the line. Every
// way a run can end is read in plain words. The learner mends the count, and a function with two
// mistakes: a forgotten push of R15, and an unsigned comparison of signed readings.
//
// The structure is here; the words are in debugging.prose.ts and debugging.labels.ts. The numbers
// the prose states are pinned by debugging.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./debugging.labels";
import { PROSE } from "./debugging.prose";
import { above } from "./functions";
import {
  OFF_BY_ONE,
  OFF_BY_ONE_MENDED,
  STACK_IN_ROM,
  TWO_MISTAKES,
  TWO_MISTAKES_MENDED,
  logData,
} from "./module11";

/** How many readings are warmer than the limit: the specification of the count. */
export const warmerCount = (log: readonly number[], limit: number) =>
  log.filter((r) => r > limit).length;

/** The logs the opening figure runs the count on. */
export const SEEN_LOGS = [
  [-190, -181, -175, -170],
  [-170, -190],
  [-175, -190, -200],
  [-190, -170],
  [-170],
] as const;

/** The first challenge's logs and limits. */
export const COUNT_RUNS = [
  { log: [-190, -181, -175, -170], limit: -180 },
  { log: [-170, -190], limit: -180 },
  { log: [-190, -170], limit: -180 },
  { log: [-170], limit: -180 },
  { log: [], limit: -180 },
  { log: [-200, 25, -150, 30], limit: -180 },
] as const;

/** The second challenge's runs: room A's and room B's readings. */
export const TOTAL_RUNS = [
  [-170, -190],
  [25, -210],
  [-185, 30],
  [-185, -210],
] as const;

export const total = (a: number, b: number) => above(a, -180) + above(b, -200);

const FAILING = [-190, -181, -175, -170] as const;
const runLabel = (log: readonly number[], limit: number) =>
  `${LABELS.logPrefix} ${log.length ? log.join(", ") : LABELS.emptyLog}; ${LABELS.limitPrefix} ${limit}`;

export const debugging: LessonInput = {
  id: "debugging",
  title: LABELS.title,
  module: 11,
  order: 6,
  objectives: [...LABELS.objectives],
  introduces: [],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "count-results",
          kind: "log-results",
          timeModel: "none",
          caption: LABELS.captions.results,
          lead: PROSE.resultsLead,
          props: {
            program: OFF_BY_ONE,
            logs: SEEN_LOGS.map((log, k) => ({
              label: `${LABELS.logPrefix} ${k + 1}`,
              readings: [...log],
              limit: -180,
              asks: { display: String(warmerCount(log, -180)) },
            })),
            checks: [{ key: "display", label: LABELS.displayCheck }],
            outcomes: PROSE.resultsAfter,
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
          id: "predict-count",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.predict,
          props: {
            program: `${OFF_BY_ONE}\n${logData(FAILING, -180)}`,
            registers: [1, 2, 3, 4, 5],
            question: PROSE.p1Question,
            options: [
              { value: "4", label: LABELS.options.four },
              { value: "3", label: LABELS.options.three },
              { value: "0", label: LABELS.options.zero },
            ],
            ask: { after: 6, what: "register", reg: 2 },
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
          id: "find-it",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.find,
          lead: PROSE.findLead,
          after: PROSE.findAfter,
          props: {
            program: `${OFF_BY_ONE}\n${logData(FAILING, -180)}`,
            registers: [1, 2, 3, 4, 5],
            breakpoints: true,
            pause: ["next"],
            watch: true,
            watched: ["R1", "R2", "R3"],
            memory: [{ from: "log", words: FAILING.length, title: LABELS.logTitle }],
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
          id: "mend-count",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.mendCount,
          lead: PROSE.mendCountLead,
          props: { challengeId: "mend-count" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: PROSE.failureExperiment,
      interactives: [
        {
          id: "stack-in-rom",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.stackInRom,
          lead: PROSE.stackInRomLead,
          props: {
            program: STACK_IN_ROM,
            inputs: { SENSORA: "-170", SENSORB: "-190" },
            registers: [1, 2, 10, 14, 15],
            stack: true,
            outcomes: PROSE.stackInRomAfter,
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
          id: "mend-total",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.mendTotal,
          lead: PROSE.mendTotalLead,
          props: { challengeId: "mend-total" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "mend-count",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "write",
      allowedConstructs: ["assembly"],
      interface: { inputs: [], outputs: [] },
      initial: {
        text: OFF_BY_ONE,
        data: { debugger: { breakpoints: true, watch: true, watched: ["R1", "R2", "R3"] } },
      },
      tests: {
        kind: "answers",
        grader: "program",
        cases: COUNT_RUNS.map(({ log, limit }) => ({
          label: runLabel(log, limit),
          given: { data: logData(log, limit), detail: "warmerCount" },
          expect: { display: String(warmerCount(log, limit)), end: "stop" },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { text: OFF_BY_ONE_MENDED },
    },
    {
      id: "mend-total",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      allowedConstructs: ["assembly"],
      interface: { inputs: [], outputs: [] },
      initial: {
        text: TWO_MISTAKES,
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
        cases: TOTAL_RUNS.map(([a, b]) => ({
          label: `${LABELS.roomPrefixA} ${a}, ${LABELS.roomPrefixB} ${b}`,
          given: { sensorA: a, sensorB: b, detail: "mendTotal" },
          expect: { display: String(total(a, b)), end: "stop" },
        })),
      },
      hints: [...PROSE.c2Hints],
      reference: { text: TWO_MISTAKES_MENDED },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "Debugging taught as a tour of a debugger's commands (gdb's break, step, print and backtrace), or as a list of tips; the off-by-one error shown on a C for-loop over an array; the scientific method of debugging in Zeller's Why Programs Fail.",
    howThisDiffers:
      "The mistakes are the shop's programs from this module's own lessons, each made by a change of one or two lines: the warm-reading count one short, total with its push of R15 forgotten and above comparing unsigned, and a stack started at 400. The method is shown on the course's debugger, which runs the reference: a log that fails, beside what each log should give; a prediction of what one register should hold at a breakpoint, the place the run first differs; then every way a run can end, read in plain words from the course machine's causes. The learner mends two programs, the second with two mistakes that surface one after the other.",
  },
};
