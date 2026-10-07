// Copyright © 2026 Christopher Snow

// Lesson: Module 11, lesson 7, the capstone: a program the shop can use. The day's report on a
// log the tests add after the program: how many readings are warmer than the limit on the display,
// ALARM when any is, the lowest and the highest reading in the RAM at 400 and 408, through three
// functions the tests also call alone, keeping the calling convention. One challenge with three
// ways in (the course plan's tiers): the guided start, a skeleton with lowest whole; the
// specification in the lesson; and the requirements and tests alone.
//
// The structure is here; the words are in log-report.prose.ts and log-report.labels.ts. The
// numbers the prose states are pinned by log-report.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./log-report.labels";
import { PROSE } from "./log-report.prose";
import {
  LOWEST_DEMO,
  REPORT_EMPTY,
  REPORT_HIGHEST_FROM_ZERO,
  REPORT_REFERENCE,
  REPORT_SKELETON,
  logData,
} from "./module11";

/** The report a log asks for: the specification. */
export function reportOf(log: readonly number[], limit: number) {
  const warm = log.filter((r) => r > limit).length;
  return {
    display: warm,
    lamps: warm > 0 ? 1 : 0,
    lowest: log.length ? Math.min(...log) : 0,
    highest: log.length ? Math.max(...log) : 0,
    warm,
  };
}

/** The logs the tests run, each with its limit; `alone` marks those whose functions are called alone too. */
export const REPORT_LOGS = [
  { log: [-184, -190, -176, -181, -172, -188], limit: -180, alone: true },
  { log: [-195, -200, -191, -199], limit: -180, alone: false },
  { log: [-175], limit: -180, alone: false },
  { log: [], limit: -180, alone: true },
  { log: [-184, 35, -176, 12, -190], limit: -180, alone: true },
  { log: [-150, -160, -155], limit: -150, alone: false },
] as const;

const DEFROST = [-184, 35, -176, 12, -190] as const;

const logName = (k: number) => `${LABELS.logPrefix} ${k + 1}`;

const CHECKS = [
  { key: "display", label: LABELS.checks.display },
  { key: "lamps", label: LABELS.checks.lamps },
  { key: "word:400", label: LABELS.checks.lowest },
  { key: "word:408", label: LABELS.checks.highest },
];

const resultsLogs = REPORT_LOGS.map(({ log, limit }, k) => {
  const r = reportOf(log, limit);
  return {
    label: logName(k),
    readings: [...log],
    limit,
    asks: {
      display: String(r.display),
      lamps: String(r.lamps),
      "word:400": String(r.lowest),
      "word:408": String(r.highest),
    },
  };
});

const FUNCTIONS = [
  {
    name: "lowestOf",
    result: (log: readonly number[], limit: number) => reportOf(log, limit).lowest,
  },
  {
    name: "highestOf",
    result: (log: readonly number[], limit: number) => reportOf(log, limit).highest,
  },
  {
    name: "warmCount",
    result: (log: readonly number[], limit: number) => reportOf(log, limit).warm,
  },
  {
    name: "report",
    result: (log: readonly number[], limit: number) => reportOf(log, limit).warm,
  },
] as const;

export const logReport: LessonInput = {
  id: "log-report",
  title: LABELS.title,
  module: 11,
  order: 7,
  objectives: [...LABELS.objectives],
  introduces: [],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "asks",
          kind: "log-results",
          timeModel: "none",
          caption: LABELS.captions.asks,
          lead: PROSE.asksLead,
          props: {
            program: REPORT_SKELETON,
            logs: resultsLogs,
            checks: CHECKS,
            outcomes: PROSE.asksAfter,
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
          id: "predict-lowest",
          kind: "program-listing",
          timeModel: "none",
          caption: LABELS.captions.predict,
          props: {
            program: LOWEST_DEMO(DEFROST),
            question: PROSE.p1Question,
            options: [
              { value: "0", label: "0" },
              { value: "1", label: "1" },
              { value: "4", label: "4" },
              { value: "5", label: "5" },
            ],
            ask: { what: "run", run: { what: "register", reg: 2 } },
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
          id: "lowest-walk",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.walk,
          lead: PROSE.walkLead,
          props: {
            outcomes: PROSE.walkAfter,
            program: LOWEST_DEMO(DEFROST),
            registers: [1, 2, 5, 6],
            breakpoints: true,
            pause: ["lowNext"],
            watch: true,
            watched: ["R5", "R6", "R2"],
            memory: [{ from: "log", words: DEFROST.length, title: LABELS.logTitle }],
          },
        },
      ],
    },
    { kind: "construction", title: LABELS.titles.construction, prose: PROSE.construction },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: PROSE.failureExperiment,
      interactives: [
        {
          id: "from-zero",
          kind: "log-results",
          timeModel: "none",
          caption: LABELS.captions.fromZero,
          lead: PROSE.fromZeroLead,
          props: {
            program: REPORT_HIGHEST_FROM_ZERO,
            logs: resultsLogs,
            checks: CHECKS.filter((c) => c.key === "word:408"),
            outcomes: PROSE.fromZeroAfter,
          },
        },
      ],
    },
    { kind: "explanation", title: LABELS.titles.explanation, prose: PROSE.explanation },
    { kind: "generalisation", title: LABELS.titles.generalisation, prose: PROSE.generalisation },
    {
      kind: "challenge",
      title: LABELS.titles.challenge,
      prose: PROSE.challenge,
      interactives: [
        {
          id: "report",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.report,
          lead: PROSE.reportLead,
          props: { challengeId: "day-report" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "day-report",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "write",
      allowedConstructs: ["assembly"],
      interface: { inputs: [], outputs: [] },
      initial: {
        text: REPORT_SKELETON,
        data: {
          tiers: true,
          empty: REPORT_EMPTY,
          debugger: {
            breakpoints: true,
            watch: true,
            watched: ["R1", "R5", "R14"],
            stack: true,
          },
        },
      },
      tests: {
        kind: "answers",
        grader: "program",
        cases: REPORT_LOGS.flatMap(({ log, limit, alone }, k) => {
          const r = reportOf(log, limit);
          const data = logData(log, limit);
          const whole = {
            label: `${logName(k)}: ${LABELS.wholeProgram}`,
            given: { data, detail: "report" },
            expect: {
              display: String(r.display),
              lamps: String(r.lamps),
              "word:400": String(r.lowest),
              "word:408": String(r.highest),
              end: "stop",
            },
          };
          const calls = alone
            ? FUNCTIONS.map((f) => ({
                label: `${logName(k)}: ${f.name}`,
                given: {
                  data,
                  call: f.name,
                  R1: "log",
                  R2: log.length,
                  ...(f.name === "warmCount" || f.name === "report" ? { R3: limit } : {}),
                  detail: `report-${f.name}`,
                },
                expect: (f.name === "report"
                  ? {
                      // report calls the other three and keeps what it needs on the stack.
                      R1: String(f.result(log, limit)),
                      "word:400": String(r.lowest),
                      "word:408": String(r.highest),
                      calls: "3",
                      stackWords: "1",
                      kept: "",
                      returned: "yes",
                    }
                  : {
                      R1: String(f.result(log, limit)),
                      kept: "",
                      returned: "yes",
                    }) as Record<string, string>,
              }))
            : [];
          return [whole, ...calls];
        }),
      },
      hints: [...PROSE.c1Hints],
      reference: { text: REPORT_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "An assembly capstone that sorts an array, computes statistics of a list of integers, or draws on a screen (Nand2Tetris's Fill and Pong; Patt and Patel's string and number-conversion programs); a project graded by its output on a few fixed inputs.",
    howThisDiffers:
      "The program is the shop's own report on a day's freezer log: the count warmer than the limit on the display, ALARM, and the lowest and highest readings in the RAM, on logs chosen to reach the edges (an empty log, one reading, readings of both signs, a reading equal to the limit). Each of its three functions is tested alone by being called with chosen arguments and its kept registers checked, as the course's calling convention asks. The course plan's three tiers are three ways into one challenge: a skeleton with one function given whole, the specification in the lesson, or the requirements and tests alone.",
  },
};
