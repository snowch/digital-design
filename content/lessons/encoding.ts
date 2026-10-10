// Copyright © 2026 Christopher Snow

// Lesson: Module 10, lesson 2, the layout as a design. Every instruction is eight hexadecimal
// digits, K J A B Y and three of constant, each field in the same digits in every instruction: a
// person reads an instruction off its digits, the register file's addresses are digits A, B and
// Y with no selector, and the decoder never moves a field. The cost: a 12-bit constant, sixteen
// kinds, and digits most kinds leave unused. A packed layout, the course's own comparison, gives a
// kind's unused register digits to its constant and pays with a field that moves. The encoding
// explorer and the course's calculator (Module 7's ALU, simulated) appear here first.
//
// The structure is here; the words are in encoding.prose.ts and encoding.labels.ts. The numbers
// the prose states are pinned by encoding.facts.test.ts.

import { assemble } from "@dd/dd-model";
import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./encoding.labels";
import { PROSE } from "./encoding.prose";
import { YDIGIT_REFERENCE, YDIGIT_START, packedY } from "./module10";

/** The last instruction of a few lines of assembly, as its word. */
export function lastWord(source: string): number {
  const lines = assemble(source).lines.filter((l) => l.instruction !== undefined);
  return (lines.at(-1)?.instruction ?? 0) >>> 0;
}

const hex8 = (v: number) => (v >>> 0).toString(16).toUpperCase().padStart(8, "0");

/** The words the first challenge asks for, each with the instruction as the task writes it. */
export const ENCODE = [
  { id: "sub", source: "R5 <= R2 - 7", shown: LABELS.encode.sub },
  { id: "load", source: "R4 <= word[R1 + 16]", shown: LABELS.encode.load },
  {
    id: "branch",
    source: "back: nothing\nnothing\nnothing\nif R3 != R6 goto back",
    shown: LABELS.encode.branch,
  },
] as const;

/** The packed layout's words the second challenge's tests give, one or more of each kind. */
export const YDIGIT_WORDS = [
  0x13123000, 0x22120064, 0x380207d8, 0x480207c0, 0x56230002, 0x60f00001, 0x70f00000, 0x84000000,
  0x2251fff9, 0x301e0010, 0x60c00010,
];

export const encoding: LessonInput = {
  id: "encoding",
  title: LABELS.title,
  module: 10,
  order: 2,
  objectives: [...LABELS.objectives],
  introduces: ["opcode"],
  sections: [
    { kind: "question", title: LABELS.titles.question, prose: PROSE.question },
    {
      kind: "motivation",
      title: LABELS.titles.motivation,
      prose: PROSE.motivation,
      interactives: [
        {
          id: "one-layout",
          kind: "instruction-fields",
          timeModel: "none",
          caption: LABELS.captions.oneLayout,
          lead: PROSE.oneLayoutLead,
          props: {
            instructions: [
              {
                label: LABELS.words.subtract,
                text: "R3 <= R1 - R2",
                notes: { C: LABELS.unusedNotes.registerC },
              },
              {
                label: LABELS.words.addConstant,
                text: "R2 <= R1 + 100",
                notes: { B: LABELS.unusedNotes.constantB },
              },
              {
                label: LABELS.words.load,
                text: "R2 <= word[sensorA]",
                notes: { A: LABELS.unusedNotes.loadA, B: LABELS.unusedNotes.loadB },
              },
              {
                label: LABELS.words.branch,
                text: "0x56230002",
                notes: { Y: LABELS.unusedNotes.branchY },
              },
            ],
            notes: LABELS.fieldNotes,
          },
        },
      ],
    },
    {
      kind: "prediction",
      title: LABELS.titles.prediction,
      prose: PROSE.prediction,
      interactives: [
        {
          id: "predict-moved",
          kind: "layout-compare",
          timeModel: "none",
          caption: LABELS.captions.predictMoved,
          props: {
            instructions: [{ label: LABELS.words.addConstant, text: "R2 <= R1 + 100" }],
            question: PROSE.p1Question,
            options: [
              { value: "Y", label: LABELS.options.p1Y },
              { value: "A", label: LABELS.options.p1A },
              { value: "none", label: LABELS.options.p1None },
            ],
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
          id: "layouts",
          kind: "layout-compare",
          timeModel: "none",
          caption: LABELS.captions.layouts,
          lead: PROSE.layoutsLead,
          after: PROSE.layoutsAfter,
          props: {
            instructions: [
              { label: LABELS.words.subtract, text: "R3 <= R1 - R2" },
              { label: LABELS.words.branch, text: "0x56230002" },
              { label: LABELS.words.jump, text: "0x70F00000" },
              { label: LABELS.words.addConstant, text: "R2 <= R1 + 100" },
              { label: LABELS.words.load, text: "R2 <= word[sensorA]" },
              { label: LABELS.words.call, text: "0x6000F005" },
            ],
            // The prediction's own instruction waits for the prediction: its layouts answer it.
            holdUntil: { prediction: "predict-moved", texts: ["R2 <= R1 + 100"] },
          },
        },
        {
          id: "explorer",
          kind: "encoding-explorer",
          timeModel: "settle",
          caption: LABELS.captions.explorer,
          lead: PROSE.explorerLead,
          after: PROSE.explorerAfter,
          props: {
            words: [
              { label: LABELS.words.subtract, text: "R3 <= R1 - R2" },
              { label: LABELS.words.addConstant, text: "R2 <= R1 + 100" },
              { label: LABELS.words.load, text: "R2 <= word[sensorA]" },
              { label: LABELS.words.branch, text: "0x56230002" },
              { label: LABELS.words.stop, text: "0x84000000" },
              { label: LABELS.words.zeros, text: "0x00000000" },
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
          id: "write-words",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.writeWords,
          lead: PROSE.writeWordsLead,
          props: { challengeId: "encode-words" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "packed-read",
          kind: "encoding-explorer",
          timeModel: "none",
          caption: LABELS.captions.packedRead,
          lead: PROSE.packedReadLead,
          props: {
            // Its words and what they show answer the prediction: they wait until it is checked.
            holdUntil: "predict-moved",
            outcome: PROSE.packedReadAfter,
            calculator: false,
            words: [
              { label: LABELS.words.packedAdd, text: "0x22120064" },
              { label: LABELS.words.packedLoad, text: "0x380207D8" },
              { label: LABELS.words.packedCall, text: "0x60F00001" },
            ],
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
          id: "write-ydigit",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.writeYdigit,
          lead: PROSE.writeYdigitLead,
          props: { challengeId: "ydigit-text" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "encode-words",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: ENCODE.map((e) => ({ id: e.id, label: e.shown, kind: "text" as const })),
      tests: {
        kind: "answers",
        grader: "instruction-word",
        cases: ENCODE.map((e) => ({
          label: e.shown,
          given: { field: e.id, shown: e.shown },
          expect: { word: hex8(lastWord(e.source)) },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: {
        answers: Object.fromEntries(ENCODE.map((e) => [e.id, hex8(lastWord(e.source))])),
      },
    },
    {
      id: "ydigit-text",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      feedback: "words",
      interface: { inputs: [{ name: "IR", width: 32 }], outputs: [{ name: "WA", width: 4 }] },
      tryIt: "pins",
      allowedConstructs: [
        "module",
        "ports",
        "logic",
        "vector",
        "assign",
        "select",
        "always_comb",
        "case",
      ],
      initial: { hdl: YDIGIT_START },
      tests: {
        kind: "combinational",
        vectors: YDIGIT_WORDS.map((w) => ({
          label: hex8(w),
          inputs: { IR: `0x${hex8(w)}` },
          expect: { WA: packedY(w) },
        })),
      },
      hints: [...PROSE.c2Hints],
      reference: { hdl: YDIGIT_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "Instruction formats as a fixed set of named formats (MIPS's R, I and J; RISC-V's R, I, S, B, U and J) drawn as boxes of bit fields, with the design principles 'simplicity favours regularity' and 'good design demands good compromises' and the immediate's bits scattered so the register fields stay put (Patterson and Hennessy); fixed against variable length told through x86 and MIPS; Nand2Tetris's A- and C-instructions, whose C bits are control signals.",
    howThisDiffers:
      "The layout is the course's own one layout of whole hexadecimal digits, and its gains are argued from what the learner built: the register file's addresses wired straight from digits A, B and Y, the decoder that never moves a field (Module 9), and words read digit by digit. The comparison is not with any named machine's formats but with a packed layout of the course's own design, in which a kind's unused register digits join its constant; a figure shows each kind's word both ways, with the field that moves and each constant's range, and the learner writes the selector the packed layout needs in front of the register file's write address. The failure experiment reads packed words with the course's machine: each writes R0. The explorer and the calculator run the learner's own ALU from Module 7. No design principles quoted, no x86, no MIPS, no RISC-V.",
  },
};
