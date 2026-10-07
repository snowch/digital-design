// Copyright © 2026 Christopher Snow

// Lesson: Module 0, lesson 2, what the machine is made of. The machine of the first lesson,
// paused before line 3, where the part that adds works out 66: the ladder goes down from that line
// to one wire, a real level at a time, each named with the module that builds it, and the same
// number is seen at every level. A wire stuck deep inside the part that adds puts a wrong number
// on the office display. The capstone traces one line: which number it changes, to what, the line
// after it, and the part that works the number out.
//
// The structure is here; the words are in inside-the-machine.prose.ts and .labels.ts. The numbers
// the prose states are pinned by inside-the-machine.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./inside-the-machine.labels";
import { PROSE } from "./inside-the-machine.prose";
import { MODULE_NAMES } from "./module-names";
import { GAP, ROOMS } from "./module0";

const name = (module: number) => MODULE_NAMES[module] ?? "";

/** The ladder, from the line down to one wire: each level the real circuit, opened at a place the
 * model names (`MEET_PLACES`), with the module that builds it. */
const LEVELS = [
  { title: LABELS.levels.line, caption: PROSE.levelLine, module: 11, place: "line" },
  { title: LABELS.levels.parts, caption: PROSE.levelParts, module: 8, place: "parts" },
  { title: LABELS.levels.adder, caption: PROSE.levelAdder, module: 7, place: "adder" },
  { title: LABELS.levels.four, caption: PROSE.levelFour, module: 7, place: "four" },
  { title: LABELS.levels.slice, caption: PROSE.levelSlice, module: 7, place: "slice" },
  { title: LABELS.levels.smallest, caption: PROSE.levelSmallest, module: 3, place: "smallest" },
  { title: LABELS.levels.wire, caption: PROSE.levelWire, module: 1, place: "wire" },
].map((l) => ({ ...l, moduleName: name(l.module) }));

/** The construction's readings: room A at -18.0, so line 3 works out 70. */
export const SLICES_ROOMS = { SENSORA: "-180", SENSORB: "-250" } as const;
/** The capstone's readings: room A at -12.0, so line 3 works out 130. */
export const TRACE_ROOMS = { SENSORA: "-120", SENSORB: "-250" } as const;

const trace = (check: string, label: string) => ({
  label,
  given: { program: GAP, ...TRACE_ROOMS, lines: 2, check },
  expect: {},
});

export const insideTheMachine: LessonInput = {
  id: "inside-the-machine",
  title: LABELS.title,
  module: 0,
  order: 2,
  objectives: [...LABELS.objectives],
  introduces: [],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
    },
    { kind: "motivation", title: LABELS.titles.motivation, prose: PROSE.motivation },
    {
      kind: "prediction",
      title: LABELS.titles.prediction,
      prose: PROSE.prediction,
      interactives: [
        {
          id: "predict-slices",
          kind: "ladder",
          timeModel: "none",
          caption: LABELS.captions.predictSlices,
          props: {
            program: GAP,
            inputs: ROOMS,
            lines: 2,
            levels: LEVELS.slice(2, 4),
            question: PROSE.p1Question,
            options: [
              { value: "64 + 2", label: LABELS.options.p1Two },
              { value: "66", label: LABELS.options.p1One },
              { value: "all", label: LABELS.options.p1All },
            ],
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
          id: "ladder",
          kind: "ladder",
          timeModel: "none",
          caption: LABELS.captions.ladder,
          lead: PROSE.ladderLead,
          props: {
            program: GAP,
            inputs: ROOMS,
            lines: 2,
            levels: LEVELS,
            outcomes: PROSE.ladderAfter,
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
          id: "slices",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.slices,
          lead: PROSE.slicesLead,
          props: { challengeId: "slices" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "stuck",
          kind: "machine-at-work",
          timeModel: "none",
          caption: LABELS.captions.stuck,
          lead: PROSE.stuckLead,
          props: {
            program: GAP,
            inputs: ROOMS,
            faults: [{ stuck: "sum-low", label: LABELS.faults.stuck, outcome: PROSE.stuckAfter }],
            drawing: "wire",
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
          id: "trace-paused",
          kind: "machine-at-work",
          timeModel: "none",
          caption: LABELS.captions.tracePaused,
          lead: PROSE.tracePausedLead,
          props: { program: GAP, inputs: TRACE_ROOMS, lines: 2, readings: [], controls: false },
        },
        {
          id: "trace",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.trace,
          lead: PROSE.traceLead,
          props: { challengeId: "trace" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "slices",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "answer",
      fields: [{ id: "slices", label: LABELS.fields.slices, kind: "text" }],
      tests: {
        kind: "answers",
        grader: "machine-slices",
        cases: [
          {
            label: LABELS.cases.slices,
            given: { program: GAP, ...SLICES_ROOMS, lines: 2, slices: 8, field: "slices" },
            expect: {},
          },
        ],
      },
      hints: [...PROSE.c1Hints],
      reference: { answers: { slices: "0100 0110" } },
    },
    {
      id: "trace",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "answer",
      fields: [
        {
          id: "changed",
          label: LABELS.fields.changed,
          kind: "choice",
          options: [
            ...["R1", "R2", "R3", "R4", "R5"].map((r) => ({ value: r, label: r })),
            { value: "none", label: LABELS.fields.none },
          ],
        },
        { id: "value", label: LABELS.fields.value, kind: "number", step: 1 },
        { id: "next", label: LABELS.fields.next, kind: "number", step: 1, min: 1, max: 9 },
        {
          id: "part",
          label: LABELS.fields.part,
          kind: "choice",
          options: [
            { value: "memory", label: LABELS.fields.memory },
            { value: "adder", label: LABELS.fields.adder },
          ],
        },
      ],
      tests: {
        kind: "answers",
        grader: "machine-step",
        cases: [
          trace("changed", LABELS.cases.changed),
          trace("value", LABELS.cases.value),
          trace("next", LABELS.cases.next),
          trace("part", LABELS.cases.part),
        ],
      },
      hints: [...PROSE.c2Hints],
      reference: { answers: { changed: "R3", value: "130", next: "4", part: "adder" } },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "The levels of a computer drawn as a stack of named layers: Patt and Patel's levels of transformation (problem, algorithm, program, instruction set architecture, microarchitecture, circuits, devices), Tanenbaum's numbered levels of a structured computer, and Nand2Tetris's diagram of layers from NAND gates up to applications, each a figure of labelled boxes the reader is told about rather than opens.",
    howThisDiffers:
      "The ladder is not a diagram of layers: it is the course's own machine, paused before one line of the shop's program, opened one real level at a time, from the machine's parts through the part that adds, a group of its slices and one slice to the smallest parts inside and one wire, each level drawn by the simulator with live values and named with the module of this course that builds it. One number, the gap between the shop's two rooms, is followed all the way down: the number at the top is the 1s and 0s on the slices' wires and the level of one wire at the bottom, which a learner who knows binary can check. The failure experiment holds that wire low and the shop's display shows a wrong number, so the levels are seen to be one machine. The challenges read a number's 1s and 0s off the slices and trace one line of the program, both graded by running the machine.",
  },
};
