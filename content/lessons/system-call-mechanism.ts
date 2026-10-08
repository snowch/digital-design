// Copyright © 2026 Christopher Snow

// Lesson: Module 12, lesson 8, the capstone: the handler that runs the shop's programs. The
// learner's handler sets C4, then runs each user program a table names, in user mode, one after
// another, through lesson 4's four jobs; job 4 ends a program, a fault ends it with its cause
// recorded, and after the last the handler stops. The tests add the table and the programs after
// the handler and check the words shown, the lamps, each program's record and the stop. One
// challenge with two ways in, each a starting text: the outline, which the construction's steps
// complete, and an empty program whose comments give the requirements.
//
// The structure is here; the words are in system-call-mechanism.prose.ts and
// system-call-mechanism.labels.ts. The numbers the prose states are pinned by
// system-call-mechanism.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./system-call-mechanism.labels";
import { PROSE } from "./system-call-mechanism.prose";
import {
  RECORD_ONE,
  RUN_CASES,
  RUN_EMPTY,
  RUN_REFERENCE,
  RUN_SKELETON,
  RUN_SKIPPING,
  type RunCase,
} from "./module12";
import { NIGHT_INPUTS } from "./traps";

const ROOMS = { sensorA: -184, sensorB: -250 };

/** The records a run must leave: one word for each program, at 0x400 + 8k. */
const recordKey = (k: number) => `word:${(0x400 + 8 * k).toString(16)}`;

/** What a run must leave, by the program tests' keys. */
export function runAsks(c: RunCase): Record<string, string> {
  return {
    shown: c.shown,
    lamps: String(c.lamps),
    ...Object.fromEntries(c.records.map((r, k) => [recordKey(k), String(r)])),
    // C1 holds the status of the last program at its last trap: user mode, interrupts off.
    C1: "00",
    ...(c.kept ?? {}),
    stopAt: "handler",
  };
}

const CHECKS = [
  { key: "shown", label: LABELS.checks.shown },
  { key: "lamps", label: LABELS.checks.lamps },
  { key: "word:400", label: LABELS.checks.first },
  { key: "word:408", label: LABELS.checks.second },
  { key: "end", label: LABELS.checks.end },
];
/** The question's cards, above the prediction: no record, which would show its working. */
const ASK_CHECKS = CHECKS.filter((c) => !c.key.startsWith("word:"));

const resultsRuns = RUN_CASES.map((c, k) => ({
  label: LABELS.runLabels[k] ?? c.label,
  note: LABELS.runNotes[k] ?? "",
  data: c.data,
  ...ROOMS,
  // The cards show how a run ended (a stop, or cut off), where the tests read where it stopped.
  asks: {
    ...runAsks(c),
    end: "stop",
    "word:400": c.records[0] !== undefined ? String(c.records[0]) : "X",
    "word:408": c.records[1] !== undefined ? String(c.records[1]) : "X",
  },
}));

export const systemCallMechanism: LessonInput = {
  id: "system-call-mechanism",
  title: LABELS.title,
  module: 12,
  order: 8,
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
            program: RUN_SKELETON,
            logs: resultsRuns,
            checks: ASK_CHECKS,
            traps: true,
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
          id: "predict-record",
          kind: "program-listing",
          timeModel: "none",
          caption: LABELS.captions.predict,
          props: {
            program: RECORD_ONE,
            question: PROSE.p1Question,
            options: [
              { value: "0", label: "0" },
              { value: "33", label: "33" },
              { value: "51", label: "51" },
              { value: "52", label: "52" },
            ],
            ask: { what: "run", run: { what: "word", address: "400" }, traps: true },
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
          id: "run-walk",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.walk,
          lead: PROSE.walkLead,
          props: {
            program: RECORD_ONE,
            inputs: NIGHT_INPUTS,
            registers: [2, 3, 5],
            traps: true,
            control: true,
            modeWords: true,
            breakpoints: true,
            pause: ["handler"],
            memory: [{ from: "0x400", words: 1, title: LABELS.recordTitle }],
            outcomes: PROSE.walkAfter,
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
          id: "skipping",
          kind: "log-results",
          timeModel: "none",
          caption: LABELS.captions.skipping,
          lead: PROSE.skippingLead,
          props: {
            program: RUN_SKIPPING,
            logs: resultsRuns,
            checks: CHECKS,
            traps: true,
            outcomes: PROSE.skippingAfter,
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
          id: "run-programs",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.run,
          lead: PROSE.runLead,
          props: { challengeId: "shop-handler" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "shop-handler",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "write",
      allowedConstructs: ["assembly"],
      interface: { inputs: [], outputs: [] },
      initial: {
        text: RUN_SKELETON,
        data: {
          tiers: true,
          empty: RUN_EMPTY,
          // The records and the program's number, which the tests read, and a watch.
          debugger: {
            breakpoints: true,
            control: true,
            modeWords: true,
            watch: true,
            registers: [1, 2, 8, 9, 12],
            memory: [
              { from: "0x400", words: 2, title: LABELS.recordsTitle },
              { from: "0x480", words: 1, title: LABELS.numberTitle },
            ],
          },
        },
      },
      tests: {
        kind: "answers",
        grader: "program",
        cases: RUN_CASES.map((c, k) => ({
          label: LABELS.runLabels[k] ?? c.label,
          given: {
            traps: "yes",
            data: c.data,
            sensorA: String(ROOMS.sensorA),
            sensorB: String(ROOMS.sensorB),
            detail: "shopHandler",
          },
          expect: runAsks(c),
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { text: RUN_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "The operating-system capstone of the textbooks: a round-robin scheduler with a process table and context switches on a timer interrupt; LC-3's TRAP routines for GETC, OUT and HALT with a trap vector table; a 'tiny kernel' that loads programs and services read and write calls; Nand2Tetris's Jack OS library.",
    howThisDiffers:
      "The handler runs the shop's own programs one after another from a table the tests add after it, each in user mode, through the four jobs lesson 4 numbered (show, a room's reading, the lamps, the end), and keeps a record for each program: 0 when it ended with job 4, its cause when it faulted. No scheduler, no process table, no timer slicing, no loader: the programs are in the ROM, the table holds their addresses, and the handler's own state is one RAM word, the number of the program running. The runs are chosen to reach the cases a handler must survive: a program that stores to the display itself, one that runs stop, one that asks for a room that does not exist, a table entry that is not instructions, a register kept across a job, an empty table. The course plan's tiers are two ways into the one challenge: the outline the construction completes, and an empty program with the requirements as comments.",
  },
};
