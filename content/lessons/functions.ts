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
  ABOVE_REFERENCE,
  ABOVE_START,
  KEEPS_R10,
  KEEPS_R10_BROKEN,
  TWO_ROOMS,
  TWO_ROOMS_WRITTEN_TWICE,
} from "./module11";

/** The registers the convention challenge asks about, and each one's role. */
export const ROLES = [
  { id: "r1", role: "result" },
  { id: "r3", role: "free" },
  { id: "r7", role: "free" },
  { id: "r12", role: "kept" },
] as const;

/** `above`'s arguments in the tests that call it directly: the reading and the limit. */
export const ABOVE_CALLS = [
  [-170, -180],
  [-190, -180],
  [-180, -180],
  [25, -180],
  [-150, -200],
  [-205, -200],
] as const;

/** The whole program's runs: room A's and room B's readings. */
export const TWO_ROOM_RUNS = [
  [-170, -190],
  [-185, -210],
  [25, -150],
] as const;

/** How far a reading is above a limit, or 0: the specification. */
export const above = (reading: number, limit: number) => Math.max(0, reading - limit);

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
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.predict,
          props: {
            program: TWO_ROOMS,
            inputs: { SENSORA: "-170", SENSORB: "-190" },
            registers: [1, 2, 15],
            question: PROSE.p1Question,
            options: [
              { value: "12", label: LABELS.options.r00C },
              { value: "24", label: LABELS.options.r018 },
              { value: "28", label: LABELS.options.r01C },
            ],
            ask: { after: 10, what: "register", reg: 15 },
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
          after: PROSE.callAfter,
          props: {
            program: TWO_ROOMS,
            inputs: { SENSORA: "-170", SENSORB: "-190" },
            breakpoints: true,
            pause: ["above"],
            watch: true,
            watched: ["R1", "R2", "R15", "PC"],
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
          id: "roles",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.roles,
          lead: PROSE.rolesLead,
          props: { challengeId: "register-roles" },
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
          id: "write-above",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.above,
          lead: PROSE.aboveLead,
          props: { challengeId: "above" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "register-roles",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: ROLES.map((r) => ({
        id: r.id,
        label: LABELS.registers[r.id],
        kind: "choice" as const,
        options: [
          { value: "result", label: LABELS.roles.result },
          { value: "free", label: LABELS.roles.free },
          { value: "kept", label: LABELS.roles.kept },
        ],
      })),
      tests: {
        kind: "answers",
        grader: "choices",
        cases: ROLES.map((r) => ({
          label: LABELS.registers[r.id],
          given: { field: r.id, detail: "registerRole" },
          expect: { value: r.role },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { answers: Object.fromEntries(ROLES.map((r) => [r.id, r.role])) },
    },
    {
      id: "above",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      allowedConstructs: ["assembly"],
      interface: { inputs: [], outputs: [] },
      initial: {
        text: ABOVE_START,
        data: { debugger: { breakpoints: true, watch: true, watched: ["R1", "R2", "R15"] } },
      },
      tests: {
        kind: "answers",
        grader: "program",
        cases: [
          ...ABOVE_CALLS.map(([r, l]) => ({
            label: `${LABELS.callPrefix} R1 ${r}, R2 ${l}`,
            given: { call: "above", R1: r, R2: l, detail: "aboveCall" },
            expect: { R1: String(above(r, l)), kept: "", returned: "yes" },
          })),
          ...TWO_ROOM_RUNS.map(([a, b]) => ({
            label: `${LABELS.roomPrefixA} ${a}, ${LABELS.roomPrefixB} ${b}`,
            given: { sensorA: a, sensorB: b, detail: "twoRooms" },
            expect: {
              display: String(above(a, -180)),
              lamps: above(b, -200) > 0 ? "1" : "0",
              end: "stop",
            },
          })),
        ],
      },
      hints: [...PROSE.c2Hints],
      reference: { text: ABOVE_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "Patterson and Hennessy's leaf procedure (leaf_example, with $a0 to $a3, $v0 and jal/jr $ra) and their register-preservation table; Patt and Patel's subroutines with JSR and RET; a square or max function written as the first example.",
    howThisDiffers:
      "The function is the shop's own check, how far a reading is above its limit, used for two rooms with two limits, and counted both ways on the reference: written twice it is one instruction longer and runs four fewer. The call and return are the learner's own lesson 8.5 instructions, R15 chosen only by the course's convention, which follows no commercial one (docs/isa.md). The convention's point is shown by a function that uses R10 as a spare and spoils its caller's kept word, counted on the reference; the tests call the learner's function directly with chosen arguments and check the registers it must keep.",
  },
};
