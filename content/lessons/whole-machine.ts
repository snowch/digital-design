// Copyright © 2026 Christopher Snow

// Lesson: Module 13, lesson 1, the whole machine. Lesson 12.8 ended: every part was built, in
// separate lessons, on separate drawings; can you follow one of the shop's programs down to the
// gates of the one machine that runs it? The final machine (`machine-final`): Module 12's machine
// of several edges with its trap hardware, and the two instructions the learner added, the call
// through a register (9.5) and set if (10.5). Each block of it names the module that built it;
// the buses between the blocks carry an instruction's words from one to the next, edge by edge,
// a trap among them; a broken join fails a machine whose parts each pass their own tests.
//
// The structure is here; the words are in whole-machine.prose.ts and whole-machine.labels.ts.
// The numbers the prose states are pinned by whole-machine.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./whole-machine.labels";
import { PROSE } from "./whole-machine.prose";
import { SHOP, SHOP_INPUTS } from "./module13";

/** The challenge's questions: the block that drives each of four buses, and two edges of the timeline. */
export const JOIN_ANSWERS = [
  { id: "hb", form: "choice", value: "datapath", detail: "joinHb" },
  { id: "waiting", form: "choice", value: "port", detail: "joinWaiting" },
  { id: "status", form: "choice", value: "datapath", detail: "joinStatus" },
  { id: "causem", form: "choice", value: "port", detail: "joinCausem" },
  { id: "irEdge", form: "number", value: "63", detail: "joinIrEdge" },
  { id: "pcEdge", form: "number", value: "65", detail: "joinPcEdge" },
] as const;

const BLOCKS = [
  { value: "control", label: LABELS.blocks.control },
  { value: "datapath", label: LABELS.blocks.datapath },
  { value: "port", label: LABELS.blocks.port },
];

/** The lanes of the buses between the blocks, over the system call and the handler. */
const LANES = [
  { net: "S", show: "state" as const },
  { net: "PC", show: "address" as const },
  { net: "FETCHED", show: "word" as const },
  { net: "IR", show: "word" as const },
  { net: "TRAP" },
  { net: "CAUSE", show: "cause" as const },
  { net: "ADDR", show: "address" as const },
];

export const wholeMachine: LessonInput = {
  id: "whole-machine",
  title: LABELS.title,
  module: 13,
  order: 1,
  objectives: [...LABELS.objectives],
  introduces: ["CPU"],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "machine-makers",
          kind: "machine-levels",
          timeModel: "settle",
          caption: LABELS.captions.makers,
          lead: PROSE.makersLead,
          after: PROSE.makersAfter,
          props: {
            program: SHOP,
            inputs: SHOP_INPUTS,
            levels: false,
            makers: true,
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
          id: "predict-call",
          kind: "machine-levels",
          timeModel: "settle",
          caption: LABELS.captions.predict,
          props: {
            program: SHOP,
            inputs: SHOP_INPUTS,
            start: 47,
            shown: [6, 15],
            question: PROSE.p1Question,
            options: [
              { value: "030", label: "030" },
              { value: "034", label: "034" },
              { value: "02C", label: "02C" },
              { value: "000", label: "000" },
            ],
            ask: "pc",
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
          id: "joins-timeline",
          kind: "edge-timeline",
          timeModel: "settle",
          caption: LABELS.captions.timeline,
          lead: PROSE.timelineLead,
          after: PROSE.timelineAfter,
          props: {
            libraryId: "machine-final",
            program: SHOP,
            inputs: SHOP_INPUTS,
            from: 56,
            edges: 12,
            signals: LANES,
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
          id: "load-joins",
          kind: "machine-levels",
          timeModel: "settle",
          caption: LABELS.captions.load,
          lead: PROSE.loadLead,
          props: {
            program: SHOP,
            inputs: SHOP_INPUTS,
            start: 7,
            signals: ["FETCHING", "MLOAD", "HOLDM", "WREG"],
            shown: [1],
          },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: PROSE.failureExperiment,
      interactives: [
        {
          id: "broken-joins",
          kind: "machine-levels",
          timeModel: "settle",
          caption: LABELS.captions.faults,
          lead: PROSE.faultsLead,
          props: {
            program: SHOP,
            inputs: SHOP_INPUTS,
            levels: false,
            compare: true,
            shown: [1, 2, 3],
            devices: true,
            control: true,
            faults: [
              {
                kind: "stuck-at",
                net: "MQ",
                value: 0,
                label: LABELS.faults.mq,
                outcome: PROSE.faultMq,
              },
              {
                kind: "stuck-at",
                net: "NOHANDLER",
                value: 1,
                label: LABELS.faults.noHandler,
                outcome: PROSE.faultNoHandler,
              },
              {
                kind: "stuck-at",
                net: "CAUSE",
                value: 0,
                label: LABELS.faults.cause,
                outcome: PROSE.faultCause,
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
          id: "join-answers",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.answers,
          lead: PROSE.answersLead,
          props: { challengeId: "where-parts-meet" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "where-parts-meet",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: JOIN_ANSWERS.map((a) =>
        a.form === "choice"
          ? { id: a.id, label: LABELS.fields[a.id], kind: "choice" as const, options: BLOCKS }
          : { id: a.id, label: LABELS.fields[a.id], kind: "text" as const },
      ),
      tests: {
        kind: "answers",
        grader: "exact",
        cases: JOIN_ANSWERS.map((a) => ({
          label: LABELS.fields[a.id],
          given: { field: a.id, form: a.form, detail: a.detail },
          expect: { value: a.value },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { answers: Object.fromEntries(JOIN_ANSWERS.map((a) => [a.id, a.value])) },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "Nand2Tetris's Computer chapter, which joins the Hack CPU, its data memory and its instruction ROM in Computer.hdl and tests them on its own programs; Harris and Harris's and Patterson and Hennessy's multicycle processor drawn whole, control and datapath, before a test program; Patt and Patel's LC-3 complete datapath with its six-phase instruction cycle.",
    howThisDiffers:
      "The machine is the course's own: its three blocks are the ones the learner built across Modules 6 to 12, each named with the module that built and grew it, and its two added instructions are the learner's own designs from Modules 9 and 10. The lesson is about the joins between the blocks rather than the parts: one load's words followed across five joins edge by edge, a system call's across the joins in a timing diagram, and three joins held at a fixed value while every part still passes its own tests, each failure named by the comparison with the instruction-level model after every instruction. The program is Module 0's first program for the shop, rewritten with set if, a call through a register and a system call, not a stock test program.",
  },
};
