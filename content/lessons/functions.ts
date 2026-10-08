// Copyright © 2026 Christopher Snow

// Lesson: Module 11, lesson 3, one piece of program used from two places. A call keeps the address
// of the instruction after it in R15 (lesson 8.5) and goes to the function; `goto R15` returns.
// The function takes its arguments in R1 and R2 and leaves its result in R1. The calling
// convention, an agreement between programs that the hardware does not know, says which
// registers carry arguments and the result, which a function may change, and which it must put
// back; a function that breaks it spoils its caller. The tests call the learner's function
// directly, with chosen arguments, and check what it kept.
//
// The structure is here; the words are in functions.prose.ts and functions.labels.ts. The numbers
// the prose states are pinned by functions.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./functions.labels";
import { PROSE } from "./functions.prose";
import {
  KEEPS_R10,
  KEEPS_R10_BROKEN,
  LARGER_REFERENCE,
  LARGER_START,
  OVER_BY_TESTS,
  RANGE_REFERENCE,
  RANGE_START,
  TWO_ROOMS,
  TWO_ROOMS_WRITTEN_TWICE,
} from "./module11";

/** How far a reading is above a limit, or 0: overBy's specification. */
export const overBy = (reading: number, limit: number) => Math.max(0, reading - limit);

/** The construction's runs: room A's and room B's readings. */
export const LARGER_RUNS = [
  [-170, -190],
  [-160, -195],
  [-175, -170],
  [-190, -210],
  [25, -150],
] as const;

/** The larger of the two rooms' amounts above their limits: the construction's specification. */
export const larger = (a: number, b: number) => Math.max(overBy(a, -180), overBy(b, -200));

/** The fridge's range, 2.0 to 5.0 degrees. */
export const RANGE = [20, 50] as const;

/** How far a reading lies outside a range, or 0: outOfRange's specification. */
export const outOfRange = (r: number, low: number, high: number) =>
  r < low ? low - r : r > high ? r - high : 0;

/** outOfRange's arguments in the tests that call it directly: reading, low end, high end. */
export const RANGE_CALLS = [
  [60, 20, 50],
  [10, 20, 50],
  [30, 20, 50],
  [20, 20, 50],
  [50, 20, 50],
  [-15, 20, 50],
  [75, 0, 40],
] as const;

/** The whole program's runs: the fridge's reading. */
export const RANGE_RUNS = [60, 30, -5] as const;

const ROOMS = { SENSORA: "-170", SENSORB: "-150" };

export const functions: LessonInput = {
  id: "functions",
  title: LABELS.title,
  module: 11,
  order: 3,
  objectives: [...LABELS.objectives],
  introduces: ["function", "argument", "calling convention"],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "two-ways",
          kind: "program-compare",
          timeModel: "none",
          caption: LABELS.captions.twoWays,
          lead: PROSE.twoWaysLead,
          props: {
            programs: [
              { label: LABELS.programs.twice, program: TWO_ROOMS_WRITTEN_TWICE },
              { label: LABELS.programs.once, program: TWO_ROOMS },
            ],
            inputs: { SENSORA: "-170", SENSORB: "-190" },
            romBytes: false,
            outcomes: PROSE.twoWaysAfter,
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
          id: "predict-return",
          kind: "program-listing",
          timeModel: "none",
          caption: LABELS.captions.predict,
          props: {
            program: TWO_ROOMS,
            question: PROSE.p1Question,
            options: [
              { value: "00C", label: "00C" },
              { value: "018", label: "018" },
              { value: "01C", label: "01C" },
              { value: "02C", label: "02C" },
            ],
            ask: {
              what: "run",
              run: { what: "register", reg: 15, hex: true },
              inputs: { SENSORA: "-170", SENSORB: "-190" },
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
          id: "call-and-return",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.callReturn,
          lead: PROSE.callLead,
          props: {
            program: TWO_ROOMS,
            inputs: { SENSORA: "-170", SENSORB: "-190" },
            breakpoints: true,
            pause: ["overBy"],
            watch: true,
            watched: ["R1", "R2", "R15", "PC"],
            lanes: {
              lanes: [
                { at: "0x000", name: LABELS.lanes.main },
                { at: "overBy", name: "overBy" },
              ],
            },
            outcomes: PROSE.callAfter,
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
          id: "write-larger",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.larger,
          lead: PROSE.largerLead,
          props: { challengeId: "larger" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: PROSE.failureExperiment,
      interactives: [
        {
          id: "spoiled",
          kind: "program-compare",
          timeModel: "none",
          caption: LABELS.captions.spoiled,
          lead: PROSE.spoiledLead,
          props: {
            programs: [
              { label: LABELS.programs.keeps, program: KEEPS_R10 },
              { label: LABELS.programs.spoils, program: KEEPS_R10_BROKEN },
            ],
            inputs: ROOMS,
            romBytes: false,
            shown: [10],
            outcomes: PROSE.spoiledAfter,
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
          id: "write-range",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.range,
          lead: PROSE.rangeLead,
          props: { challengeId: "out-of-range" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "larger",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "write",
      allowedConstructs: ["assembly"],
      interface: { inputs: [], outputs: [] },
      initial: {
        text: LARGER_START,
        data: { debugger: { breakpoints: true, watch: true, watched: ["R1", "R5", "R10"] } },
      },
      tests: {
        kind: "answers",
        grader: "program",
        cases: LARGER_RUNS.map(([a, b]) => ({
          label: `${LABELS.roomPrefixA} ${a}, ${LABELS.roomPrefixB} ${b}`,
          given: { sensorA: a, sensorB: b, data: OVER_BY_TESTS, detail: "larger" },
          expect: { display: String(larger(a, b)), calls: "2", end: "stop" },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { text: LARGER_REFERENCE },
    },
    {
      id: "out-of-range",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      allowedConstructs: ["assembly"],
      interface: { inputs: [], outputs: [] },
      initial: {
        text: RANGE_START,
        data: { debugger: { breakpoints: true, watch: true, watched: ["R1", "R2", "R3", "R15"] } },
      },
      tests: {
        kind: "answers",
        grader: "program",
        cases: [
          ...RANGE_CALLS.map(([r, low, high]) => ({
            label: `${LABELS.callPrefix} R1 ${r}, R2 ${low}, R3 ${high}`,
            given: { call: "outOfRange", R1: r, R2: low, R3: high, detail: "rangeCall" },
            expect: { R1: String(outOfRange(r, low, high)), kept: "", returned: "yes" },
          })),
          ...RANGE_RUNS.map((r) => ({
            label: `${LABELS.fridgePrefix} ${r}`,
            given: { sensorA: r, detail: "rangeRun" },
            expect: {
              display: String(outOfRange(r, ...RANGE)),
              lamps: outOfRange(r, ...RANGE) > 0 ? "1" : "0",
              end: "stop",
            },
          })),
        ],
      },
      hints: [...PROSE.c2Hints],
      reference: { text: RANGE_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "Patterson and Hennessy's leaf procedure (leaf_example, with $a0 to $a3, $v0 and jal/jr $ra) and their register-preservation table; Patt and Patel's subroutines with JSR and RET; a square or max function written as the first example.",
    howThisDiffers:
      "The function is the shop's own check, how far a reading is above its limit (overBy), used for two rooms with two limits, and counted both ways on the reference. The call and return are the learner's own lesson 8.5 instructions, R15 chosen only by the course's convention, which follows no commercial one (docs/isa.md). The learner first writes a caller that must keep a word through a call, and a free register fails it because the given function works in R5; the convention's other side is shown by a function that spoils its caller's kept R10. The learner's own function is the fridge's range check, three arguments and two ways out of range, called directly by the tests with chosen arguments, which also check the registers it must keep.",
  },
};
