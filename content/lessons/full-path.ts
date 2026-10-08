// Copyright © 2026 Christopher Snow

// Lesson: Module 13, lesson 2, the full path: the course's final demonstration. A line of the
// shop's program becomes a word, its machine code; the machine fetches it, decodes it, reads its
// registers, works in the ALU or the memory, writes its register and moves the PC on, and every
// level can be read at every edge, forwards and back: the line, the word and its fields, the
// controller's state and the control signals, and the drawing down to the gates. A fault in the
// decoder makes the levels part company, and the comparison with the model names where.
//
// The structure is here; the words are in full-path.prose.ts and full-path.labels.ts. The numbers
// the prose states are pinned by full-path.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./full-path.labels";
import { PROSE } from "./full-path.prose";
import { SHOP, SHOP_INPUTS } from "./module13";

/** The challenge: a line's levels, worked out and read off the run. */
/** The program of the challenge's line, `R7 <= R5 | R6` at `01C`, which no figure runs. */
export const PATH_PROGRAM = `        R5 <= 12
        R6 <= 10
        nothing
        nothing
        nothing
        nothing
        nothing
        R7 <= R5 | R6
        stop`;

export const PATH_ANSWERS = [
  { id: "code", form: "hex", value: "A6345000", detail: "pathCode" },
  { id: "edges", form: "number", value: "4", detail: "pathEdges" },
  { id: "job", form: "choice", value: "or", detail: "pathJob" },
  { id: "yin", form: "number", value: "14", detail: "pathYin" },
  { id: "pc", form: "hex", value: "020", detail: "pathPc" },
] as const;

const SIGNALS = ["OP2", "OP1", "OP0", "WRITEY", "SET", "TRAP"];

const LEVELS = {
  program: SHOP,
  inputs: SHOP_INPUTS,
  signals: SIGNALS,
  shown: [1, 2, 3, 4, 5],
  devices: true,
};

export const fullPath: LessonInput = {
  id: "full-path",
  title: LABELS.title,
  module: 13,
  order: 2,
  objectives: [...LABELS.objectives],
  introduces: ["machine code"],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "path-whole",
          kind: "machine-levels",
          timeModel: "settle",
          caption: LABELS.captions.whole,
          lead: PROSE.wholeLead,
          props: { ...LEVELS, outcomes: PROSE.wholeAfter },
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
          id: "predict-ir",
          kind: "machine-levels",
          timeModel: "settle",
          caption: LABELS.captions.predict,
          props: {
            ...LEVELS,
            start: 25,
            question: PROSE.p1Question,
            options: [
              { value: "A7435000", label: "A7435000" },
              { value: "57345000", label: "57345000" },
              { value: "A7345000", label: "A7345000" },
              { value: "25004064", label: "25004064" },
            ],
            ask: "net",
            net: "IR",
            form: "word",
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
          id: "path-call",
          kind: "machine-levels",
          timeModel: "settle",
          caption: LABELS.captions.call,
          lead: PROSE.callLead,
          after: PROSE.callAfter,
          props: { ...LEVELS, start: 56, control: true },
        },
      ],
    },
    {
      kind: "construction",
      title: LABELS.titles.construction,
      prose: PROSE.construction,
      interactives: [
        {
          id: "path-store",
          kind: "machine-levels",
          timeModel: "settle",
          caption: LABELS.captions.store,
          lead: PROSE.storeLead,
          props: { ...LEVELS, start: 37, signals: ["OP2", "OP1", "OP0", "MSTORE", "PCEN"] },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: PROSE.failureExperiment,
      interactives: [
        {
          id: "path-faults",
          kind: "machine-levels",
          timeModel: "settle",
          caption: LABELS.captions.faults,
          lead: PROSE.faultsLead,
          props: {
            ...LEVELS,
            signals: ["BCONST", "SET", "WRITEY"],
            compare: true,
            faults: [
              {
                kind: "stuck-at",
                net: "control/BCONST",
                value: 1,
                label: LABELS.faults.bconst,
                outcome: PROSE.faultBconst,
              },
              {
                kind: "stuck-at",
                net: "control/SET",
                value: 0,
                label: LABELS.faults.set,
                outcome: PROSE.faultSet,
              },
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
          id: "path-answers",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.answers,
          lead: PROSE.answersLead,
          props: { challengeId: "one-line-every-level" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "one-line-every-level",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: PATH_ANSWERS.map((a) =>
        a.form === "choice"
          ? {
              id: a.id,
              label: LABELS.fields[a.id],
              kind: "choice" as const,
              options: [
                { value: "add", label: LABELS.jobs.add },
                { value: "subtract", label: LABELS.jobs.subtract },
                { value: "copy", label: LABELS.jobs.copy },
                { value: "or", label: LABELS.jobs.or },
              ],
            }
          : { id: a.id, label: LABELS.fields[a.id], kind: "text" as const },
      ),
      tests: {
        kind: "answers",
        grader: "exact",
        cases: PATH_ANSWERS.map((a) => ({
          label: LABELS.fields[a.id],
          given: { field: a.id, form: a.form, detail: a.detail },
          expect: { value: a.value },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { answers: Object.fromEntries(PATH_ANSWERS.map((a) => [a.id, a.value])) },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "Patt and Patel's instruction cycle in six phases on the LC-3 (fetch, decode, evaluate address, fetch operands, execute, store result), and the textbooks' walk of one instruction through a multicycle datapath with its control signals tabulated step by step (Patterson and Hennessy, Harris and Harris).",
    howThisDiffers:
      "Every level is read off one recorded run of the course's own final machine, not a table written for the book: the line of a shop program, its word as the assembler made it, the IR's fields, the controller's state and the control signals, and the drawing opened to the gates, all at the same edge, stepped forwards and back. The steps are the course machine's own states, FETCH, READ, ALU, MEMORY and WRITE, which take each kind a different number of edges. The prediction asks for a set if's word before it is fetched; the failure experiment breaks a decoder signal so that the line, the word and the machine part company, and the comparison with the instruction-level model names the instruction where they do.",
  },
};
