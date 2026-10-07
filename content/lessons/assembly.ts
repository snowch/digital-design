// Copyright © 2026 Christopher Snow

// Lesson: Module 11, lesson 1, programs as text. The assembler turns lines written as transfers
// into the words Module 8 to 10's figures gave; a name stands for an address it works out; a word
// of data is kept after the program; the listing shows each line beside its address and word; the
// assembler refuses a line it cannot read, in the course's words. The debugger runs the words on
// the instruction-level model, one instruction at a time, and the learner writes a first program.
//
// The structure is here; the words are in assembly.prose.ts and assembly.labels.ts. The numbers
// the prose states are pinned by assembly.facts.test.ts.

import { assembleChecked, instructionHex } from "@dd/dd-model";
import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./assembly.labels";
import { PROSE } from "./assembly.prose";
import {
  BE_THE_ASSEMBLER,
  LIMIT_AS_DATA,
  ROOM_A_LIMIT,
  ROOM_A_MISTAKES,
  WARMER_REFERENCE,
  WARMER_START,
} from "./module11";
import { COLDER } from "./module9";

/** The warmer-room challenge's runs: room A's and room B's readings. */
export const WARMER_RUNS = [
  [-184, -250],
  [-250, -184],
  [-200, -200],
  [-30, 15],
  [20, -5],
] as const;

const beProgram = assembleChecked(BE_THE_ASSEMBLER).program!;
const lineWord = (text: string) =>
  instructionHex(beProgram.lines.find((l) => l.text === text)?.instruction ?? 0);
const hex3 = (n: number) => n.toString(16).toUpperCase().padStart(3, "0");

/** The second challenge's answers, read off the learner's assembler. */
export const BE_ANSWERS = [
  { id: "cold", value: hex3(beProgram.labels["cold"] ?? 0), detail: "asmAddress" },
  { id: "limit", value: hex3(beProgram.labels["limit"] ?? 0), detail: "asmAddress" },
  { id: "branch", value: lineWord("if R2 < R1 signed goto cold"), detail: "asmBranchWord" },
  { id: "load", value: lineWord("R1 <= word[limit]"), detail: "asmLoadWord" },
] as const;

export const assembly: LessonInput = {
  id: "assembly",
  title: LABELS.title,
  module: 11,
  order: 1,
  objectives: [...LABELS.objectives],
  introduces: ["assembly", "assembler", "debugger"],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "colder-listing",
          kind: "program-listing",
          timeModel: "none",
          caption: LABELS.captions.listing,
          lead: PROSE.listingLead,
          props: { program: COLDER },
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
          id: "predict-constant",
          kind: "program-listing",
          timeModel: "none",
          caption: LABELS.captions.predictListing,
          props: {
            program: ROOM_A_LIMIT,
            names: false,
            question: PROSE.p1Question,
            options: [
              { value: "003", label: LABELS.options.c003 },
              { value: "014", label: LABELS.options.c014 },
              { value: "005", label: LABELS.options.c005 },
            ],
            ask: { what: "constant", line: "if R2 < R3 signed goto fine" },
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
          id: "room-a",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.debugger,
          lead: PROSE.debuggerLead,
          props: {
            program: ROOM_A_LIMIT,
            inputs: { SENSORA: "-170", SENSORB: "-250" },
            outcomes: PROSE.debuggerAfter,
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
          id: "warmer",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.warmer,
          lead: PROSE.warmerLead,
          props: { challengeId: "warmer-room" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "mistakes",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.mistakes,
          lead: PROSE.mistakesLead,
          props: {
            program: ROOM_A_MISTAKES,
            editable: true,
            inputs: { SENSORA: "-170", SENSORB: "-250" },
            outcomes: PROSE.mistakesAfter,
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
          id: "data-listing",
          kind: "program-listing",
          timeModel: "none",
          caption: LABELS.captions.dataListing,
          lead: PROSE.dataLead,
          props: { program: LIMIT_AS_DATA },
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
          id: "be-assembler",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.beAssembler,
          lead: PROSE.beAssemblerLead,
          props: { challengeId: "be-the-assembler" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "warmer-room",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "write",
      interface: { inputs: [], outputs: [] },
      initial: { text: WARMER_START },
      allowedConstructs: ["assembly"],
      tests: {
        kind: "answers",
        grader: "program",
        cases: WARMER_RUNS.map(([a, b], k) => ({
          label: LABELS.runs[k]!,
          given: { sensorA: a, sensorB: b, detail: "warmerDisplay" },
          expect: { display: String(Math.max(a, b)), end: "stop" },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { text: WARMER_REFERENCE },
    },
    {
      id: "be-the-assembler",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: BE_ANSWERS.map((a) => ({
        id: a.id,
        label: LABELS.fields[a.id],
        kind: "text" as const,
      })),
      tests: {
        kind: "answers",
        grader: "exact",
        cases: BE_ANSWERS.map((a) => ({
          label: LABELS.fields[a.id],
          given: { field: a.id, form: "hex", detail: a.detail },
          expect: { value: a.value },
        })),
      },
      hints: [...PROSE.c2Hints],
      reference: { answers: Object.fromEntries(BE_ANSWERS.map((a) => [a.id, a.value])) },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "The two-pass assembler with its symbol table (Nand2Tetris's Hack assembler chapter; Patt and Patel's LC-3 assembler, .ORIG and .FILL), and a first assembly program that adds two numbers or sums an array; debuggers introduced through gdb's commands.",
    howThisDiffers:
      "The language is the course's own: each line is the register transfer it makes, in Module 5's text form, on the course's machine, with no mnemonics. The first programs are the shop's: room A against its limit and the warmer of two rooms, run over pairs of readings of both signs. The learner predicts a branch's constant from its name before the words show, mends three lines the learner's assembler refuses in the course's words, and assembles a short program by hand, a word of data with and without padding to a multiple of 8. The debugger is a view of the instruction-level model the learner's two circuits were tested against.",
  },
};
