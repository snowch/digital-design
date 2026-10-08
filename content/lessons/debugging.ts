// Copyright © 2026 Christopher Snow

// Lesson: Module 11, lesson 6, finding the mistake in a program that runs and gives a wrong
// answer. A program counting warm readings, one short, is run over several logs beside what each
// should give; a method (the smallest failing log, what each part should leave, a breakpoint before
// the part, step and watch to the first value that differs, mend and run every log) finds the
// line. A count kept at an address taken from the wrong name halts far from its mistake, with a
// store to the log in the ROM. Every way a run can end is read in plain words. The learner chooses
// the log that shows a mistake at the limit, mends the count, and mends a count over the limit
// with two mistakes: the list stepped by 4, and the count read as the address of `count`.
//
// The structure is here; the words are in debugging.prose.ts and debugging.labels.ts. The numbers
// the prose states are pinned by debugging.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./debugging.labels";
import { PROSE } from "./debugging.prose";
import {
  COUNT_OVER_MISTAKES,
  COUNT_OVER_REFERENCE,
  OFF_BY_ONE,
  OFF_BY_ONE_MENDED,
  COUNT_TO_LOG,
  COUNT_WITH_LIMIT,
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
  { log: [-190, -180, -170], limit: -180 },
] as const;

/** The second challenge's logs and limits. */
export const OVER_RUNS = [
  { log: [-190, -181, -175, -170], limit: -180 },
  { log: [], limit: -180 },
  { log: [-170], limit: -180 },
  { log: [-200, 25, -150, 30], limit: -180 },
  { log: [-185, -190], limit: -180 },
  { log: [-180, -170], limit: -180 },
] as const;

/** The smallest of the opening figure's logs that fails, two readings: the method's first step. */
const FAILING = [-190, -170] as const;

/** The failure experiment's log: the count is kept, and the store goes to the log. */
const KEPT_LOG = [-190, -181, -175, -170] as const;

/** The edge-log question: logs to try on the count that counts a reading equal to the limit. */
export const EDGE_LOGS = [
  { value: "below", log: [-190, -185] },
  { value: "above", log: [-170, -175, -160] },
  { value: "equal", log: [-180, -190] },
  { value: "empty", log: [] },
] as const;
/** The edge log that shows the mistake: a reading equal to the limit. */
const EDGE_EQUAL = EDGE_LOGS.find((e) => e.value === "equal")!.log;

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
          kind: "program-listing",
          timeModel: "none",
          caption: LABELS.captions.predict,
          props: {
            program: `${OFF_BY_ONE}\n${logData(FAILING, -180)}`,
            question: PROSE.p1Question,
            options: [
              { value: "3", label: "3" },
              { value: "2", label: "2" },
              { value: "1", label: "1" },
              { value: "0", label: "0" },
            ],
            ask: { what: "run", run: { after: 6, what: "register", reg: 2 } },
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
          props: {
            outcomes: PROSE.findAfter,
            program: `${OFF_BY_ONE}\n${logData(FAILING, -180)}`,
            registers: [1, 2, 3, 4, 5],
            breakpoints: true,
            pause: ["next"],
            watch: true,
            watched: ["R1", "word[R1]", "R2", "R3"],
            watchAddresses: ["R1"],
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
          id: "count-to-log",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.countToLog,
          lead: PROSE.countToLogLead,
          props: {
            program: `${COUNT_TO_LOG}\n${logData(KEPT_LOG, -180)}`,
            registers: [1, 2, 3, 6],
            outcomes: PROSE.countToLogAfter,
          },
        },
      ],
    },
    { kind: "explanation", title: LABELS.titles.explanation, prose: PROSE.explanation },
    {
      kind: "generalisation",
      title: LABELS.titles.generalisation,
      prose: PROSE.generalisation,
      interactives: [
        {
          id: "edge-listing",
          kind: "program-listing",
          timeModel: "none",
          caption: LABELS.captions.edgeListing,
          lead: PROSE.edgeListingLead,
          props: { program: COUNT_WITH_LIMIT, names: false },
        },
        {
          id: "edge-log",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.edgeLog,
          lead: PROSE.edgeLogLead,
          props: { challengeId: "edge-log" },
        },
      ],
    },
    {
      kind: "challenge",
      title: LABELS.titles.challenge,
      prose: "",
      interactives: [
        {
          id: "mend-over",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.mendOver,
          lead: PROSE.mendOverLead,
          props: { challengeId: "mend-over" },
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
        data: {
          debugger: {
            breakpoints: true,
            watch: true,
            watched: ["R1", "R2", "R3"],
            watchAddresses: ["R1"],
          },
        },
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
      id: "edge-log",
      title: LABELS.challengeTitles.edge,
      task: PROSE.edgeTask,
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: [
        {
          id: "log",
          label: LABELS.edgeField,
          kind: "choice" as const,
          options: EDGE_LOGS.map((e) => ({ value: e.value, label: LABELS.edgeLogs[e.value] })),
        },
        { id: "shows", label: LABELS.edgeShowsField, kind: "number" as const, step: 1 },
      ],
      tests: {
        kind: "answers",
        grader: "exact",
        cases: [
          {
            label: LABELS.edgeField,
            given: { field: "log", form: "choice", detail: "edgeLog" },
            expect: { value: "equal" },
          },
          {
            // What a right program shows on the log that shows the mistake.
            label: LABELS.edgeShowsField,
            given: { field: "shows", form: "number", detail: "edgeShows" },
            expect: { value: String(warmerCount(EDGE_EQUAL, -180)) },
          },
        ],
      },
      hints: [...PROSE.edgeHints],
      reference: { answers: { log: "equal", shows: String(warmerCount(EDGE_EQUAL, -180)) } },
    },
    {
      id: "mend-over",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      allowedConstructs: ["assembly"],
      interface: { inputs: [], outputs: [] },
      initial: {
        text: COUNT_OVER_MISTAKES,
        data: {
          debugger: {
            breakpoints: true,
            watch: true,
            watched: ["R10", "R11", "R13"],
            watchAddresses: ["R10"],
          },
        },
      },
      tests: {
        kind: "answers",
        grader: "program",
        cases: OVER_RUNS.map(({ log, limit }) => ({
          label: runLabel(log, limit),
          given: { data: logData(log, limit), detail: "mendOver" },
          expect: { display: String(warmerCount(log, limit)), end: "stop" },
        })),
      },
      hints: [...PROSE.c2Hints],
      reference: { text: COUNT_OVER_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "Debugging taught as a tour of a debugger's commands (gdb's break, step, print and backtrace), or as a list of tips; the off-by-one error shown on a C for-loop over an array; the scientific method of debugging in Zeller's Why Programs Fail.",
    howThisDiffers:
      "The mistakes are the shop's programs from this module's own lessons, each made by a change of one or two lines: the warm-reading count one short, sumOver's stack started at 400, and a count of readings over the limit with two mistakes the module has not shown, the count read as the address of count and the list stepped by 4. The method is shown on the course's debugger, which runs the reference: a log that fails, beside what each log should give; a prediction of what one register should hold at a breakpoint, the place the run first differs; then every way a run can end, read in plain words from the course machine's causes. The learner mends two programs, the second with two mistakes that surface one after the other: a halt, then a wrong answer.",
  },
};
