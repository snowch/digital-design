// Copyright © 2026 Christopher Snow

// Lesson: Module 0, lesson 1, what a computer does. The shop's finished machine runs a program of
// nine lines: it reads the two rooms' sensors, works out how much warmer room A is than room B,
// shows that on the office display, and lights the CLASH lamp when the gap is 10.0 degrees or
// more. The learner predicts which lines run, runs it a line at a time, changes a room's reading
// and runs it again, changes a number in a line, and sees each line kept as a number.
//
// The structure is here; the words are in what-computers-do.prose.ts and .labels.ts. The machine
// is Module 8's (`datapath-full`), read for a beginner by packages/dd-model/src/meet.ts; the
// numbers the prose states are pinned by what-computers-do.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import { GAP, GAP_LIMIT, ROOMS, ROOM_B_FAILS } from "./module0";
import { LABELS } from "./what-computers-do.labels";
import { PROSE } from "./what-computers-do.prose";

/**
 * The limit challenge's cases: the gaps 60, exactly 50, and 49, with room B at -250. Each runs
 * the machine to its stop on the gates (about half a second), so the three that decide the answer
 * are all it runs.
 */
const LIMIT_CASES = [
  { label: LABELS.cases.gap60, SENSORA: "-190", lamp: "lit" },
  { label: LABELS.cases.gap50, SENSORA: "-200", lamp: "lit" },
  { label: LABELS.cases.gap49, SENSORA: "-201", lamp: "dark" },
].map((c) => ({
  label: c.label,
  given: { program: GAP_LIMIT, SENSORA: c.SENSORA, SENSORB: "-250", lamp: "CLASH" },
  expect: { lamp: c.lamp },
}));

/** The readings the last challenge gives: room A at -10.0, room B at -25.0. */
export const IN_YOUR_HEAD = { SENSORA: "-100", SENSORB: "-250" } as const;

export const whatComputersDo: LessonInput = {
  id: "what-computers-do",
  title: LABELS.title,
  module: 0,
  order: 1,
  objectives: [...LABELS.objectives],
  introduces: [],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "shop",
          kind: "scene",
          timeModel: "none",
          caption: LABELS.captions.shop,
          after: PROSE.shopAfter,
          props: {
            sources: [
              {
                room: LABELS.scene.roomA,
                items: [{ kind: "sensor", label: LABELS.scene.sensor }],
              },
              {
                room: LABELS.scene.roomB,
                items: [{ kind: "sensor", label: LABELS.scene.sensor }],
              },
            ],
            circuit: LABELS.scene.machine,
            outputs: [
              { kind: "readout", label: LABELS.scene.display },
              { kind: "lamp", label: "ALARM" },
              { kind: "lamp", label: "NIGHT" },
              { kind: "lamp", label: "CLASH" },
            ],
            labels: { title: LABELS.scene.title, summary: LABELS.scene.summary },
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
          id: "predict-lines",
          kind: "machine-at-work",
          timeModel: "none",
          caption: LABELS.captions.predictLines,
          props: {
            program: GAP,
            inputs: ROOMS,
            readings: [],
            question: PROSE.p1Question,
            options: [
              { value: "1 2 3 4 5 6 7 8 9", label: LABELS.options.p1All },
              { value: "1 2 3 4 5 6 9", label: LABELS.options.p1Skip },
              { value: "1 2 3 4 5 6", label: LABELS.options.p1Stop },
            ],
            ask: "lines",
            explain: PROSE.p1Explain,
          },
        },
      ],
    },
    {
      kind: "investigation",
      title: LABELS.titles.investigation,
      prose: "",
      interactives: [
        {
          id: "run",
          kind: "machine-at-work",
          timeModel: "none",
          caption: LABELS.captions.run,
          lead: PROSE.runLead,
          props: {
            program: GAP,
            inputs: ROOMS,
            outcomes: PROSE.runAfter,
            outcomesChanged: PROSE.runAfterChanged,
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
          id: "limit",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.limit,
          lead: PROSE.limitLead,
          props: { challengeId: "limit" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "room-b-fails",
          kind: "machine-at-work",
          timeModel: "none",
          caption: LABELS.captions.roomBFails,
          lead: PROSE.roomBFailsLead,
          props: {
            program: GAP,
            inputs: ROOM_B_FAILS,
            question: PROSE.p2Question,
            options: [
              { value: "CLASH", label: LABELS.options.p2Lit },
              { value: "none", label: LABELS.options.p2Dark },
            ],
            ask: "lamps",
            explain: PROSE.p2Explain,
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
          id: "kept",
          kind: "machine-at-work",
          timeModel: "none",
          caption: LABELS.captions.kept,
          lead: PROSE.keptLead,
          props: {
            program: GAP_LIMIT,
            limit: 100,
            inputs: ROOMS,
            stored: true,
            outcomesChanged: PROSE.keptAfter,
          },
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
          id: "in-your-head",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.inYourHead,
          lead: PROSE.inYourHeadLead,
          props: { challengeId: "in-your-head" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "limit",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "answer",
      fields: [{ id: "limit", label: LABELS.fields.limit, kind: "number", step: 1 }],
      tests: { kind: "answers", grader: "machine-run", cases: LIMIT_CASES },
      hints: [...PROSE.c1Hints],
      initial: { answers: { limit: "100" } },
      reference: { answers: { limit: "50" } },
    },
    {
      id: "in-your-head",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "answer",
      fields: [
        { id: "display", label: LABELS.fields.display, kind: "number", step: 1 },
        {
          id: "lamp",
          label: LABELS.fields.lamp,
          kind: "choice",
          options: [
            { value: "lit", label: LABELS.fields.lit },
            { value: "dark", label: LABELS.fields.dark },
          ],
        },
      ],
      tests: {
        kind: "answers",
        grader: "machine-run",
        cases: [
          {
            label: LABELS.cases.display,
            given: { program: GAP, ...IN_YOUR_HEAD, lamp: "CLASH" },
            expect: { display: "{display}" },
          },
          {
            label: LABELS.cases.lamp,
            given: { program: GAP, ...IN_YOUR_HEAD, lamp: "CLASH" },
            expect: { lamp: "{lamp}" },
          },
        ],
      },
      hints: [...PROSE.c2Hints],
      reference: { answers: { display: "150", lamp: "lit" } },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "The stock opening of a first course: the five units of a computer (input, output, memory, control, arithmetic) as boxes joined by arrows, then the fetch-execute cycle, then a toy machine's program traced in its own notation; Nand2Tetris's overview of the Hack computer; Petzold's Code, which builds towards a computer as a story from flashlights and relays.",
    howThisDiffers:
      "The lesson starts from the shop the course already uses: two freezer rooms' sensors, an office display and three lamps, with the machine the course will build in between, running a nine-line program of the shop's own that shows how much warmer one room is than the other and lights a lamp at a limit. No block diagram of units and no named cycle appear; the machine is met as it runs, its program as numbered lines in plain words generated from each line's own number. The prediction is which lines run, the failure experiment is a program that checks only one way and is run faithfully when the other room fails, and the challenges change a number in a line and work a run out by hand, each graded by running the real machine in the simulator.",
  },
};
