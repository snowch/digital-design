// Copyright © 2026 Christopher Snow

// Lesson: Module 11, lesson 5, a function that calls itself. The cold store's rooms open onto
// further rooms, each room three words: its reading and the addresses of the rooms behind its two
// doors. `warmRooms` counts the rooms warmer than a limit from a room inwards by calling itself on
// the room behind each door: a job whose work nests, which a loop could do only by keeping a stack
// of its own. The stack rises and falls with the way in; a door that leads back to an earlier room
// never reaches the last case, and the stack runs into the ROM, where a push halts with cause 34.
//
// The structure is here; the words are in recursion.prose.ts and recursion.labels.ts. The numbers
// the prose states are pinned by recursion.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import {
  COLD_STORE,
  FARTHEST_REFERENCE,
  FARTHEST_START,
  LONG_STORE,
  WARM_ROOMS,
  WARM_ROOMS_LOOP,
  warmRoomsOn,
} from "./module11";
import { LABELS } from "./recursion.labels";
import { PROSE } from "./recursion.prose";

/** Where the assembler puts the hall in every program of the lesson's that holds the rooms. */
export const HALL = "0A0";

/** The rooms the farthest challenge's tests add, and how far in each goes from the hall. */
export const LAYOUTS = [
  { id: "store", rooms: COLD_STORE, farthest: 4 },
  { id: "long", rooms: LONG_STORE, farthest: 5 },
  { id: "hall", rooms: "hall:   word -150, 0, 0", farthest: 1 },
  {
    id: "second",
    rooms: `hall:   word -150, 0, annexA
annexA:  word -160, 0, annexB
annexB:  word -170, 0, 0`,
    farthest: 3,
  },
  {
    id: "both",
    rooms: `hall:   word -150, annexA, annexB
annexA:  word -160, 0, 0
annexB:  word -170, annexC, 0
annexC:  word -175, 0, 0`,
    farthest: 3,
  },
] as const;

/** The tests that call farthest alone: the rooms, the room in R1 (0 for none), the answer. */
export const FARTHEST_CALLS = [
  { rooms: COLD_STORE, room: "vault", farthest: 3 },
  { rooms: COLD_STORE, room: "chillB", farthest: 1 },
  { rooms: COLD_STORE, room: "0", farthest: 0 },
  { rooms: LONG_STORE, room: "lobby", farthest: 4 },
] as const;

/** The construction's answers, for a run of warmRooms on the longer store from its hall. */
export const STORE_ANSWERS = [
  { id: "calls", value: "15", form: "number", detail: "storeCalls" },
  { id: "words", value: "20", form: "number", detail: "storeWords" },
  { id: "lowest", value: "720", form: "hex", detail: "storeR14" },
] as const;

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
          id: "rooms",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.rooms,
          lead: PROSE.roomsLead,
          props: {
            program: WARM_ROOMS,
            memoryOnly: true,
            memory: [{ from: "hall", words: 18, title: LABELS.roomsTitle }],
            rooms: { hall: "hall", title: LABELS.roomsDrawn },
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
          id: "predict-calls",
          kind: "program-listing",
          timeModel: "none",
          caption: LABELS.captions.predict,
          props: {
            program: WARM_ROOMS,
            question: PROSE.p1Question,
            options: [
              { value: "6", label: "6" },
              { value: "7", label: "7" },
              { value: "12", label: "12" },
              { value: "13", label: "13" },
            ],
            ask: { what: "run", run: { what: "calls" } },
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
          props: {
            program: WARM_ROOMS,
            registers: [1, 2, 10, 11, 14, 15],
            breakpoints: true,
            pause: ["warmRooms"],
            watch: true,
            watched: ["R1", "R11", "R14"],
            watchAddresses: ["R1"],
            stack: true,
            rooms: { hall: "hall", title: LABELS.roomsDrawn },
            outcomes: PROSE.framesAfter,
          },
        },
        {
          id: "depth",
          kind: "stack-depth",
          timeModel: "none",
          caption: LABELS.captions.depth,
          lead: PROSE.depthLead,
          // The marks for the calls wait for the prediction, which asks how many there are.
          props: { program: WARM_ROOMS, after: "predict-calls" },
        },
      ],
    },
    {
      kind: "construction",
      title: LABELS.titles.construction,
      prose: PROSE.construction,
      interactives: [
        {
          id: "long-store",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.longStore,
          lead: PROSE.longStoreLead,
          props: {
            program: warmRoomsOn(LONG_STORE),
            memoryOnly: true,
            memory: [{ from: "hall", words: 21, title: LABELS.longStoreTitle }],
          },
        },
        {
          id: "store-depth",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.storeDepth,
          lead: PROSE.storeDepthLead,
          props: { challengeId: "store-depth" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: PROSE.failureExperiment,
      interactives: [
        {
          id: "way-back",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.wayBack,
          lead: PROSE.wayBackLead,
          props: {
            program: WARM_ROOMS_LOOP,
            registers: [1, 10, 14, 15],
            stack: true,
            outcomes: PROSE.wayBackAfter,
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
          id: "write-farthest",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.farthest,
          lead: PROSE.farthestLead,
          props: { challengeId: "farthest" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "store-depth",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: STORE_ANSWERS.map((a) => ({
        id: a.id,
        label: LABELS.fields[a.id],
        kind: a.form === "hex" ? ("text" as const) : ("number" as const),
        ...(a.form === "number" ? { min: 0, step: 1 } : {}),
      })),
      tests: {
        kind: "answers",
        grader: "exact",
        cases: STORE_ANSWERS.map((a) => ({
          label: LABELS.fields[a.id],
          given: { field: a.id, form: a.form, detail: a.detail },
          expect: { value: a.value },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { answers: Object.fromEntries(STORE_ANSWERS.map((a) => [a.id, a.value])) },
    },
    {
      id: "farthest",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      allowedConstructs: ["assembly"],
      interface: { inputs: [], outputs: [] },
      initial: {
        text: FARTHEST_START,
        data: {
          debugger: {
            breakpoints: true,
            watch: true,
            watched: ["R1", "R11", "R14"],
            watchAddresses: ["R1"],
            stack: true,
          },
        },
      },
      tests: {
        kind: "answers",
        grader: "program",
        cases: [
          ...LAYOUTS.map((l) => ({
            label: LABELS.layouts[l.id],
            given: { data: l.rooms, detail: "farthestRun" },
            expect: { display: String(l.farthest), end: "stop" },
          })),
          ...FARTHEST_CALLS.map((c) => ({
            label: `${LABELS.callPrefix} R1 ${c.room}`,
            given: { data: c.rooms, call: "farthest", R1: c.room, detail: "farthestCall" },
            expect: { R1: String(c.farthest), kept: "", returned: "yes" },
          })),
        ],
      },
      hints: [...PROSE.c2Hints],
      reference: { text: FARTHEST_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "Recursion taught through the factorial (Patterson and Hennessy's fact, with its frames on the stack; Harris and Harris), Fibonacci, the Towers of Hanoi or Ackermann's function; a string printed backwards as the stock example of order reversed by recursion.",
    howThisDiffers:
      "The job is the shop's own and nests: the cold store's rooms each open onto up to two further rooms, kept as words whose doors hold the next rooms' addresses, and the function counts the rooms warmer than a limit from a room inwards by calling itself behind each door. A loop could do it only by keeping a stack of its own, so recursion is the right tool here, not a reversal a backwards loop does more simply. The stack's depth follows the deepest way in, not the number of rooms, and rises and falls on the chart, run on the reference; a door that leads back to an earlier room runs the stack into the ROM, where the course machine halts with cause 34. The learner's own function finds how far in the store goes. No factorial, no Fibonacci, no Hanoi, no Ackermann, no tree of numbers sorted or searched.",
  },
};
