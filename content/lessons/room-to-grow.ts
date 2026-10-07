// Copyright © 2026 Christopher Snow

// Lesson: Module 10, lesson 4, the room the instruction set leaves. It points back to 8.3 (a program
// with no stop) and 9.2 (the illegal words and their map) and spends itself on what is new: the
// instruction of zeros refused on purpose; data after a program, which the machine runs as
// instructions until it reaches a refused one; why unused codes are refused, and the room they
// leave (89 undefined jobs in kinds 1 to 8, seven free kinds); an old program run unchanged on the
// learner's copy; and what each instruction docs/isa.md leaves out would cost the circuit and save
// a program, counted on the reference with and without the call through a register.
//
// The structure is here; the words are in room-to-grow.prose.ts and room-to-grow.labels.ts. The
// numbers the prose states are pinned by room-to-grow.facts.test.ts.

import { MODULE_9, runProgram } from "@dd/dd-model";
import type { LessonInput } from "@platform/lesson-schema";

import { CALL_TWICE, CALL_TWICE_WITHOUT, DATA_AFTER, TIMES_FIVE, multiplyLoop } from "./module10";
import { COLDER } from "./module9";
import { LABELS } from "./room-to-grow.labels";
import { PROSE } from "./room-to-grow.prose";
import { SENSORS } from "./memory-access";

/**
 * The parts of Module 8's datapath that a left-out instruction would join: the ALU, beside which a
 * multiplier or a shifter would sit; register Y's word selector, which a new part's result would
 * reach through a new source; the selector of the ALU's B, where a comparison with zero needs a 0;
 * and the +4 block, whose PC + 4 the call through a register already gives register Y.
 */
export const JOIN_PLACES = ["alu", "yWord", "pickB", "plus4"] as const;

/** The words the first challenge asks about, and whether a later instruction could take each. */
export const CODES = [
  { id: "kind1job8", word: "18123000", fate: "free" },
  { id: "zeros", word: "00000000", fate: "refused" },
  { id: "never", word: "51000000", fate: "taken" },
  { id: "kindB", word: "B1230000", fate: "free" },
  { id: "stop", word: "84000000", fate: "taken" },
  { id: "kind9", word: "9040F000", fate: "free" },
] as const;

const CODE_OPTIONS = [
  { value: "free", label: LABELS.fates.free },
  { value: "taken", label: LABELS.fates.taken },
  { value: "refused", label: LABELS.fates.refused },
];

const COPY = { ...MODULE_9, callThroughRegister: 9, setIf: 10 };
const ROOMS = {
  door: 0 as const,
  warm: 0 as const,
  sensorA: BigInt(SENSORS.SENSORA),
  sensorB: BigInt(SENSORS.SENSORB),
};

/** The counts the second challenge asks for, each read off a run of the reference. */
export const COUNTS = [
  {
    id: "withCall",
    value: String(runProgram(CALL_TWICE, ROOMS, COPY).ran),
    detail: "countWith",
  },
  {
    id: "withoutCall",
    value: String(runProgram(CALL_TWICE_WITHOUT, ROOMS, MODULE_9).ran),
    detail: "countWithout",
  },
] as const;

const SHOP = { DOOR: 0, WARM: 0, SENSORA: SENSORS.SENSORA, SENSORB: SENSORS.SENSORB };

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
          timeModel: "none",
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
          id: "predict-data",
          kind: "program-compare",
          timeModel: "none",
          caption: LABELS.captions.predictData,
          props: {
            programs: [{ label: LABELS.programs.dataAfter, program: DATA_AFTER }],
            romBytes: false,
            question: PROSE.p1Question,
            options: [
              { value: "008", label: LABELS.options.p1At008 },
              { value: "00C", label: LABELS.options.p1At00C },
              { value: "none", label: LABELS.options.p1Never },
            ],
            ask: { program: 0, what: "where" },
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
            romBytes: false,
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
          id: "sort-codes",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.sortCodes,
          lead: PROSE.sortCodesLead,
          props: { challengeId: "code-fates" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "old-program",
          kind: "program-compare",
          timeModel: "none",
          caption: LABELS.captions.oldProgram,
          lead: PROSE.oldProgramLead,
          props: {
            programs: [
              { label: LABELS.programs.course, program: COLDER },
              { label: LABELS.programs.copy, program: COLDER, capstone: true },
            ],
            inputs: SHOP,
            romBytes: false,
            oneListing: true,
            outcomes: PROSE.oldProgramAfter,
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
          id: "join-places",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.joinPlaces,
          lead: PROSE.joinPlacesLead,
          props: {
            libraryId: "join-places",
            writtenWidth: 4,
            highlight: [...JOIN_PLACES],
            still: true,
            canOpen: false,
            highlightLabel: LABELS.joinMark,
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
          id: "count-calls",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.countCalls,
          lead: PROSE.countCallsLead,
          props: { challengeId: "count-calls" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "code-fates",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: CODES.map((w) => ({
        id: w.id,
        label: LABELS.codes[w.id],
        kind: "choice" as const,
        options: CODE_OPTIONS,
      })),
      tests: {
        kind: "answers",
        grader: "choices",
        cases: CODES.map((w) => ({
          label: LABELS.codes[w.id],
          given: { field: w.id, detail: "codeFate" },
          expect: { value: w.fate },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { answers: Object.fromEntries(CODES.map((w) => [w.id, w.fate])) },
    },
    {
      id: "count-calls",
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
          given: { field: c.id, form: "number", detail: c.detail },
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
      "The refused codes are argued from the learner's own machine: the instruction of zeros halts a program that runs off its end, and data after a program is run, on the reference, until a refused instruction halts it (the word 12345678 runs as an add first). The room left is counted on the decoder's map (89 undefined jobs, seven free kinds), and the learner sorts codes as free, taken or kept refused. Each left-out instruction's cost is said in parts of the learner's circuit, counted where it can be (a 64-bit multiplier's 63 adders, a shifter's 6 layers of selectors), and the saving is counted on runs of the reference: the learner counts a program of two calls with and without the call through a register their copy holds. An old program runs unchanged on the copy. No SPEC, no x86, no instruction mixes.",
  },
};
