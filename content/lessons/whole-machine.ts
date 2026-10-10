// Copyright © 2026 Christopher Snow

// Lesson: Module 13, lesson 1, the whole machine. Lesson 12.8 ended: every part was built, in
// separate lessons, on separate drawings; can you follow one of the shop's programs down to the
// gates of the one machine that runs it? The final machine (`machine-final`): Module 12's machine
// of several edges with its trap hardware, and the two instructions the learner added, the call
// through a register (9.5) and set if (10.5). Each block of it names the module that built it;
// the buses between the blocks carry an instruction's words from one to the next, edge by edge,
// a trap among them; a broken join fails a machine whose parts are each unchanged.
//
// The structure is here; the words are in whole-machine.prose.ts and whole-machine.labels.ts.
// The numbers the prose states are pinned by whole-machine.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./whole-machine.labels";
import { PROSE } from "./whole-machine.prose";
import { SHOP, SHOP_INPUTS } from "./module13";

/**
 * The challenge's questions: the part inside the CPU at the end of each of four buses, which only
 * the drawing opened shows, and two edges of a run no figure shows.
 */
export const JOIN_ANSWERS = [
  // Each bus by what it carries, and the part inside the datapath or the control unit at its end:
  // the part that drives the word a store writes, the part that takes the instruction the control
  // unit decodes, the part that reads the events waiting, and the part that drives C0's two bits.
  // No reading, list or hint before the last names the first two ends (the facts test checks).
  { id: "hb", form: "choice", value: "hold", detail: "joinHb" },
  { id: "irIn", form: "choice", value: "digits", detail: "joinIr" },
  { id: "waiting", form: "choice", value: "trapLogic", detail: "joinWaiting" },
  { id: "status", form: "choice", value: "cregs", detail: "joinStatus" },
  { id: "irEdge", form: "number", value: "15", detail: "joinIrEdge" },
  { id: "pcEdge", form: "number", value: "17", detail: "joinPcEdge" },
] as const;

/** The program of the challenge's edges, which no figure runs: its edges are worked out. */
export const EDGES_PROGRAM = `        R1 <= handler
        C4 <= R1
        R2 <= word[sensorB]
        call system
        stop
handler: resume`;

/** Each question's choices: parts inside the block the bus enters or leaves, by their names. */
const PARTS: Readonly<Record<string, readonly string[]>> = {
  hb: ["registers", "hold", "heldR", "pickB"],
  irIn: ["decoder", "digits", "controller", "trapLogic"],
  waiting: ["decoder", "controller", "mode", "trapLogic"],
  status: ["ir", "cregs", "heldR", "pc"],
};
const partOptions = (id: string) =>
  (PARTS[id] ?? []).map((name) => ({ value: name, label: `\`${name}\`` }));

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
            listing: LABELS.listing,
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
            // The prediction needs the address of `show:`: the program, with its addresses.
            listing: LABELS.listing,
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
            // Eight edges, so each is wide enough to write an eight-digit word in its lane.
            edges: 8,
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
            focus: ["port"],
            reveal: { text: PROSE.loadAfter, edge: 12 },
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
    {
      kind: "explanation",
      title: LABELS.titles.explanation,
      prose: PROSE.explanation,
      interactives: [
        {
          // The CPU as a drawing: the control unit and the datapath marked together, the memory
          // port left out.
          id: "cpu-mark",
          kind: "circuit-explorer",
          timeModel: "none",
          caption: LABELS.captions.cpu,
          props: {
            libraryId: "machine-final",
            // The drawing alone: no word is written beside its wire, as on the machine's figures.
            writtenWidth: 4,
            still: true,
            canOpen: false,
            highlight: ["control", "datapath"],
            highlightLabel: LABELS.cpuMark,
            notes: { control: [LABELS.cpuNote], datapath: [LABELS.cpuNote] },
            focus: ["control", "datapath"],
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
          id: "join-answers",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.answers,
          lead: PROSE.answersLead,
          props: { challengeId: "where-parts-meet" },
        },
        {
          // The drawing the four buses are read from, under the challenge.
          id: "join-tool",
          kind: "machine-levels",
          timeModel: "settle",
          caption: LABELS.captions.tool,
          props: { program: SHOP, inputs: SHOP_INPUTS, levels: false },
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
          ? {
              id: a.id,
              label: LABELS.fields[a.id],
              kind: "choice" as const,
              options: partOptions(a.id),
            }
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
      "The machine is the course's own: its three blocks are the ones the learner built across Modules 6 to 12, each named with the module that built and grew it, and its two added instructions are the learner's own designs from Modules 9 and 10. The lesson is about the joins between the blocks rather than the parts: one load's words followed across five joins edge by edge, a system call's across the joins in a timing diagram, and three joins held at a fixed value while every part is left as it is, each failure named by the comparison with the instruction-level model after every instruction. The program is Module 0's first program for the shop, rewritten with set if, a call through a register and a system call, not a stock test program.",
  },
};
