// Copyright © 2026 Christopher Snow

// Lesson: Module 10, lesson 4, what the machine leaves out and the room it keeps. Kinds 0 and 9
// to F and every job a kind does not define are illegal; an instruction of all zeros is illegal,
// so a program that runs off its end into the ROM's zeros stops. The free kinds are room for
// instructions not yet thought of, and an instruction added in a copy of the machine makes words
// the course's machine refuses. Each instruction docs/isa.md leaves out costs the circuit
// something and saves programs something; the lesson counts both on the reference.
//
// The structure is here; the words are in room-to-grow.prose.ts and room-to-grow.labels.ts. The
// numbers the prose states are pinned by room-to-grow.facts.test.ts.

import { runProgram } from "@dd/dd-model";
import type { LessonInput } from "@platform/lesson-schema";

import { NO_STOP, TIMES_FIVE, multiplyLoop } from "./module10";
import { CHOOSE } from "./module9";
import { LABELS } from "./room-to-grow.labels";
import { PROSE } from "./room-to-grow.prose";
import { SENSORS } from "./memory-access";

/** The words the first challenge asks about, and what the course's machine does with each. */
export const WORDS = [
  { id: "zeros", word: "00000000", does: "illegal" },
  { id: "kind9", word: "9040F000", does: "illegal" },
  { id: "job8", word: "18123000", does: "illegal" },
  { id: "never", word: "51000000", does: "runs" },
  { id: "stop", word: "84000000", does: "stop" },
  { id: "add", word: "22102064", does: "runs" },
] as const;

const WORD_OPTIONS = [
  { value: "runs", label: LABELS.does.runs },
  { value: "stop", label: LABELS.does.stop },
  { value: "illegal", label: LABELS.does.illegal },
];

/** The counts the second challenge asks for, each read off a run of the reference. */
export const COUNTS = [
  { id: "times9", value: String(runProgram(multiplyLoop(9)).ran) },
  { id: "times50", value: String(runProgram(multiplyLoop(50)).ran) },
] as const;

export const roomToGrow: LessonInput = {
  id: "room-to-grow",
  title: LABELS.title,
  module: 10,
  order: 4,
  objectives: [...LABELS.objectives],
  introduces: [],
  sections: [
    { kind: "question", title: LABELS.titles.question, prose: PROSE.question },
    {
      kind: "motivation",
      title: LABELS.titles.motivation,
      prose: PROSE.motivation,
      interactives: [
        {
          id: "map",
          kind: "kind-map",
          timeModel: "settle",
          caption: LABELS.captions.map,
          lead: PROSE.mapLead,
          props: {},
        },
      ],
    },
    {
      kind: "prediction",
      title: LABELS.titles.prediction,
      prose: PROSE.prediction,
      interactives: [
        {
          id: "predict-no-stop",
          kind: "program-compare",
          timeModel: "none",
          caption: LABELS.captions.predictNoStop,
          props: {
            programs: [{ label: LABELS.programs.noStop, program: NO_STOP }],
            question: PROSE.p1Question,
            options: [
              { value: "21", label: LABELS.options.p1Illegal },
              { value: "11", label: LABELS.options.p1RomEnd },
              { value: "none", label: LABELS.options.p1Never },
            ],
            ask: { program: 0, what: "stop" },
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
          id: "multiply",
          kind: "program-compare",
          timeModel: "none",
          caption: LABELS.captions.multiply,
          lead: PROSE.multiplyLead,
          props: {
            programs: [
              { label: LABELS.programs.loop, program: multiplyLoop(5) },
              { label: LABELS.programs.doubling, program: TIMES_FIVE },
            ],
            outcomes: PROSE.multiplyAfter,
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
          id: "sort-words",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.sortWords,
          lead: PROSE.sortWordsLead,
          props: { challengeId: "word-fates" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "new-words",
          kind: "program-compare",
          timeModel: "none",
          caption: LABELS.captions.newWords,
          lead: PROSE.newWordsLead,
          props: {
            programs: [
              { label: LABELS.programs.copy, program: CHOOSE, capstone: true },
              { label: LABELS.programs.course, program: CHOOSE, copyWordsOnCourse: true },
            ],
            inputs: { DOOR: 0, WARM: 0, SENSORA: SENSORS.SENSORA, SENSORB: SENSORS.SENSORB },
            shown: [15],
            outcomes: PROSE.newWordsAfter,
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
          id: "count-loop",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.countLoop,
          lead: PROSE.countLoopLead,
          props: { challengeId: "count-loop" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "word-fates",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: WORDS.map((w) => ({
        id: w.id,
        label: LABELS.words[w.id],
        kind: "choice" as const,
        options: WORD_OPTIONS,
      })),
      tests: {
        kind: "answers",
        grader: "choices",
        cases: WORDS.map((w) => ({
          label: LABELS.words[w.id],
          given: { field: w.id },
          expect: { value: w.does },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { answers: Object.fromEntries(WORDS.map((w) => [w.id, w.does])) },
    },
    {
      id: "count-loop",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: COUNTS.map((c) => ({
        id: c.id,
        label: LABELS.counts[c.id],
        kind: "number" as const,
        min: 0,
        step: 1,
      })),
      tests: {
        kind: "answers",
        grader: "exact",
        cases: COUNTS.map((c) => ({
          label: LABELS.counts[c.id],
          given: { field: c.id, form: "number" },
          expect: { value: c.value },
        })),
      },
      hints: [...PROSE.c2Hints],
      reference: { answers: Object.fromEntries(COUNTS.map((c) => [c.id, c.value])) },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "The reserved-opcode exception and the tables of instruction-mix frequencies that justify which instructions an instruction set includes (Hennessy and Patterson's measurements of SPEC programs; 'make the common case fast'); a multiply built from shift-and-add as an exercise; backward compatibility told through the x86 family; LC-3's reserved opcode.",
    howThisDiffers:
      "The illegal words are read off the decoder the learner opened in Module 9, and their consequence is shown on the reference with a program of the shop's that forgets its stop and runs into the ROM's zeros. The cost of each instruction docs/isa.md leaves out is said in the parts of the learner's own circuit it would need (a new part beside the ALU, a new source for register Y, a decoder column), and its saving is counted on runs of the reference, not taken from measured instruction mixes: 7 × 5 by a loop of adds against two doublings and an add, the loop's count grown with its multiplier. The other side of the room to grow is the learner's own Module 9 copy: its kind 9 call runs there and is refused by the course's machine, cause 21. No SPEC, no x86, no shifts.",
  },
};
