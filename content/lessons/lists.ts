// Copyright © 2026 Christopher Snow

// Lesson: Module 11, lesson 2, a list of readings walked by a loop. The shop's log is kept as words
// after the program: a count, then the readings, 8 bytes apart. A register holds the address of
// the next reading and steps by 8; another counts down the readings left; the same lines run for
// every reading. The debugger gains breakpoints, a watch and a view of the log with the register
// that points into it. Signed and unsigned comparisons part on readings of both signs.
//
// The structure is here; the words are in lists.prose.ts and lists.labels.ts. The numbers the
// prose states are pinned by lists.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./lists.labels";
import { PROSE } from "./lists.prose";
import {
  COUNT_WARMER,
  DAY_LOG,
  DEFROST_LOG,
  FIRST_WARMER_REFERENCE,
  FIRST_WARMER_START,
  RISE_REFERENCE,
  RISE_START,
  countWarmerOn,
  logData,
} from "./module11";

/** The first-warmer challenge's logs and limits, with the position each run must show. */
export const FIRST_RUNS = [
  { log: [-190, -181, -175, -170], limit: -180 },
  { log: [-190, -195, -200], limit: -180 },
  { log: [-170, -190], limit: -180 },
  { log: [-185, -180, -179], limit: -180 },
  { log: [], limit: -180 },
  { log: [-200, 25, -150, 30], limit: -150 },
  { log: [-181, -182, -183, -184, -185, -186, -170], limit: -180 },
] as const;

/** The position of the first reading warmer than the limit, from 1, or 0: the specification. */
export const firstWarmer = (log: readonly number[], limit: number) =>
  log.findIndex((r) => r > limit) + 1;

/** The rise challenge's logs. */
export const RISE_RUNS = [
  [-190, -181, -175, -170],
  [-190, -195, -200],
  [-170, -190],
  [-185, -180, -179],
  [-200, 25, -150, 30],
  [-181, -182, -183, -184, -185, -186, -170],
] as const;

/** The largest rise from one reading to the next: the specification. */
export const largestRise = (log: readonly number[]) =>
  Math.max(...log.slice(1).map((r, k) => r - (log[k] ?? 0)));

/** The loop's load, `R5 <= word[R1]`: the opening figure's run stops before it, once a reading. */
export const LOAD_LINE = "0x018";

const runLabel = (log: readonly number[], limit?: number) =>
  limit === undefined
    ? `${LABELS.logPrefix} ${log.join(", ")}`
    : `${LABELS.logPrefix} ${log.length ? log.join(", ") : LABELS.emptyLog}; ${LABELS.limitPrefix} ${limit}`;

export const lists: LessonInput = {
  id: "lists",
  title: LABELS.title,
  module: 11,
  order: 2,
  objectives: [...LABELS.objectives],
  introduces: ["breakpoint"],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "log-in-memory",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.logInMemory,
          lead: PROSE.logLead,
          props: {
            program: COUNT_WARMER,
            listing: false,
            registers: [1],
            pause: [LOAD_LINE],
            runLabel: LABELS.nextReading,
            memory: [
              { from: "count", words: DAY_LOG.length + 1, title: LABELS.memoryTitle, drawn: true },
            ],
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
          id: "predict-address",
          kind: "program-listing",
          timeModel: "none",
          caption: LABELS.captions.predict,
          props: {
            program: COUNT_WARMER,
            question: PROSE.p1Question,
            options: [
              { value: "038", label: "038" },
              { value: "040", label: "040" },
              { value: "068", label: "068" },
              { value: "070", label: "070" },
            ],
            ask: { what: "run", run: { what: "register", reg: 1, hex: true } },
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
          id: "walk",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.walk,
          lead: PROSE.walkLead,
          props: {
            outcomes: PROSE.walkAfter,
            program: COUNT_WARMER,
            breakpoints: true,
            pause: ["next"],
            watch: true,
            watched: ["R1", "R2", "R3", "word[R1]"],
            watchAddresses: ["R1"],
            registers: [0, 1, 2, 3, 4, 5],
            // One word past the log, set apart, so R1's last move visibly leaves the log.
            memory: [
              {
                from: "log",
                words: DAY_LOG.length + 1,
                title: LABELS.logTitle,
                drawn: true,
                ends: { after: DAY_LOG.length, note: LABELS.logEnd },
              },
            ],
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
          id: "first",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.first,
          lead: PROSE.firstLead,
          props: { challengeId: "first-warmer" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: PROSE.failureExperiment,
      interactives: [
        {
          id: "signs",
          kind: "program-compare",
          timeModel: "none",
          caption: LABELS.captions.signs,
          lead: PROSE.signsLead,
          props: {
            lineHeader: true,
            programs: [
              { label: LABELS.programs.signed, program: countWarmerOn(DEFROST_LOG, "signed") },
              { label: LABELS.programs.unsigned, program: countWarmerOn(DEFROST_LOG, "unsigned") },
            ],
            romBytes: false,
            outcomes: PROSE.signsAfter,
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
          id: "rise",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.rise,
          lead: PROSE.riseLead,
          props: { challengeId: "largest-rise" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "first-warmer",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "write",
      allowedConstructs: ["assembly"],
      interface: { inputs: [], outputs: [] },
      initial: {
        text: FIRST_WARMER_START,
        data: { debugger: { breakpoints: true, watch: true } },
      },
      tests: {
        kind: "answers",
        grader: "program",
        cases: FIRST_RUNS.map(({ log, limit }) => ({
          label: runLabel(log, limit),
          given: { data: logData(log, limit), detail: "firstWarmer" },
          expect: { display: String(firstWarmer(log, limit)), end: "stop" },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { text: FIRST_WARMER_REFERENCE },
    },
    {
      id: "largest-rise",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      allowedConstructs: ["assembly"],
      interface: { inputs: [], outputs: [] },
      initial: { text: RISE_START, data: { debugger: { breakpoints: true, watch: true } } },
      tests: {
        kind: "answers",
        grader: "program",
        cases: RISE_RUNS.map((log) => ({
          label: runLabel(log),
          given: { data: logData(log), detail: "largestRise" },
          expect: { display: String(largestRise(log)), end: "stop" },
        })),
      },
      hints: [...PROSE.c2Hints],
      reference: { text: RISE_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "An array summed in a loop (Harris and Harris; Patterson and Hennessy's while loop over save[i]), an array's maximum, or a string's length; base-plus-index addressing and the loop counter introduced through a C for-loop.",
    howThisDiffers:
      "The list is the shop's log of freezer readings, kept as words after the program with its count before it, and walked by a register that holds the next reading's address and steps by 8, as the debugger's memory view marks. The loops ask the shop's questions: how many readings are warmer than the limit, where the first warm reading is (a loop that leaves early), and the largest rise from one reading to the next (two neighbours at once). Signed and unsigned comparisons part on a log with defrost readings above 0, counted on the reference. No sums, no strings, no C.",
  },
};
