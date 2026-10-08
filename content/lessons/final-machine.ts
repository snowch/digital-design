// Copyright © 2026 Christopher Snow

// Lesson: Module 13, lesson 4, the final machine: the lab. The learner writes the top module of
// the whole machine as text, joining the course's parts (the memory, the decoder, the system
// jobs, the controller, the trap logic, the control registers, the register file, the ALU and the
// condition) and writing the small parts between them. One challenge with three ways in, each a
// button above the text: the outline (the course's text with six joins left out, each marked),
// the parts (every part placed, no port joined) and nothing (the machine's ports alone). Five
// programs, each reaching a different part, run on the learner's machine and on the model,
// compared after every instruction and every trap; a failure names the first line after which
// they disagree, and what differs, never the join.
//
// The figures run texts of the machine that are the course's with one line changed, never one of
// the six joins, and never show the course's line in its place: a timer that counts a trap's edge
// (the prediction), three wrong lines each found by different programs (the investigation), and
// the memory's DOOR held at 0, found only by the door program (the failure experiment).
//
// The structure is here; the words are in final-machine.prose.ts and final-machine.labels.ts.
// The numbers the prose states are pinned by final-machine.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./final-machine.labels";
import { PROSE } from "./final-machine.prose";
import {
  LAB_PROGRAMS,
  MACHINE13_CONSTRUCTS,
  MACHINE13_TEXT,
  emptyStart,
  guidedStart,
  partsStart,
} from "./module13";

/** The lab's programs, as the figures and the tests take them. */
export const LAB_RUNS = LAB_PROGRAMS.map((p) => ({
  id: p.id,
  label: LABELS.programs[p.id],
  source: p.source,
  inputs: { ...p.inputs, ...("door" in p ? { door: p.door } : {}) },
}));

/** The texts the figures run: the course's, each with one line changed. */
export const LAB_TEXTS = {
  tick: { label: LABELS.texts.tick, from: "assign TICK = PCEN & GO;", to: "assign TICK = PCEN;" },
  branch: {
    label: LABELS.texts.branch,
    from: "if ((BRANCH & MET) | CALL) NEXT = TARGET;",
    to: "if (BRANCH | CALL) NEXT = TARGET;",
  },
  ie: { label: LABELS.texts.ie, from: "assign IE = STATUS[1];", to: "assign IE = STATUS[0];" },
  call: { label: LABELS.texts.call, from: "if (CALL) YIN = PC4;", to: "if (CALL) YIN = PC;" },
  door: { label: LABELS.texts.door, from: ".DOOR(DOOR)", to: ".DOOR(1'b0)" },
} as const;

const runsOf = (...ids: string[]) => LAB_RUNS.filter((p) => ids.includes(p.id));

/** The machine's ports, which every way into the lab keeps. */
const MACHINE_PORTS = {
  inputs: [
    { name: "CLK" },
    { name: "RST" },
    { name: "DOOR" },
    { name: "WARM" },
    { name: "SENSORA", width: 64 },
    { name: "SENSORB", width: 64 },
  ],
  outputs: [
    { name: "PC", width: 64 },
    { name: "S", width: 3 },
    { name: "HALT" },
    { name: "CAUSE", width: 8 },
    { name: "DISPLAY", width: 64 },
    { name: "LAMPS", width: 3 },
  ],
};

export const finalMachine: LessonInput = {
  id: "final-machine",
  title: LABELS.title,
  module: 13,
  order: 4,
  objectives: [...LABELS.objectives],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "lab-course",
          kind: "lab-run",
          timeModel: "settle",
          caption: LABELS.captions.course,
          lead: PROSE.questionLead,
          props: {
            hdl: MACHINE13_TEXT,
            texts: [{ label: LABELS.texts.course }],
            programs: LAB_RUNS,
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
          id: "lab-predict",
          kind: "lab-run",
          timeModel: "settle",
          caption: LABELS.captions.predict,
          props: {
            hdl: MACHINE13_TEXT,
            texts: [LAB_TEXTS.tick],
            programs: runsOf("shop", "timer"),
            question: PROSE.p1Question,
            options: [
              { value: "shop", label: LABELS.options.shop },
              { value: "timer", label: LABELS.options.timer },
              { value: "shop+timer", label: LABELS.options.both },
              { value: "none", label: LABELS.options.none },
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
          id: "lab-lines",
          kind: "lab-run",
          timeModel: "settle",
          caption: LABELS.captions.lines,
          lead: PROSE.invLead,
          after: PROSE.invAfter,
          props: {
            hdl: MACHINE13_TEXT,
            texts: [LAB_TEXTS.branch, LAB_TEXTS.ie, LAB_TEXTS.call],
            programs: LAB_RUNS,
          },
        },
      ],
    },
    { kind: "construction", title: LABELS.titles.construction, prose: PROSE.construction },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: PROSE.failureExperiment,
      interactives: [
        {
          id: "lab-door",
          kind: "lab-run",
          timeModel: "settle",
          caption: LABELS.captions.door,
          lead: PROSE.failLead,
          after: PROSE.failAfter,
          props: { hdl: MACHINE13_TEXT, texts: [LAB_TEXTS.door], programs: LAB_RUNS },
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
          id: "lab-challenge",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.lab,
          lead: PROSE.labLead,
          props: { challengeId: "final-machine" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "final-machine",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "write",
      feedback: "words",
      interface: MACHINE_PORTS,
      allowedConstructs: MACHINE13_CONSTRUCTS,
      courseModules: { set: "machine13" },
      tryIt: "pins",
      initial: { hdl: guidedStart(), data: { parts: partsStart(), empty: emptyStart() } },
      tests: {
        kind: "answers",
        grader: "machine13-lab",
        cases: LAB_RUNS.map((p) => ({
          label: p.label,
          given: { source: p.source, ...p.inputs },
          expect: { agrees: "yes" },
        })),
      },
      hints: [...PROSE.c1Hints],
      // The platform takes a written challenge graded case by case to be the book's own only
      // when its reference carries text or data; the lab's text is HDL, so an empty record of
      // data marks it (docs/notes/module-13-machine.md lists this as a platform candidate).
      reference: { hdl: MACHINE13_TEXT, data: {} },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "The textbooks' last step of building a processor: Nand2Tetris's CPU and Computer chips completed in its HDL from given parts and tested against a supplied script of expected outputs, and Harris and Harris's or Patterson and Hennessy's multicycle processor assembled from its datapath and control unit in Verilog and checked with a testbench that looks for one value written to memory at the end.",
    howThisDiffers:
      "The learner joins the course's own nine parts, each the one an earlier module of this course built, with the trap hardware and the two instructions the learner added, in one challenge with three ways in by its own buttons: an outline with six joins left out and marked, the parts placed with no port joined, or the ports alone. The test is not one value at the end but the course's instruction-level model run beside the learner's text on five programs written for the lab, each reaching a different part (the two added instructions, user mode's refusal, a system call and the timer, the door, a store with no handler), compared after every instruction and every trap; a failure names the first line that disagreed and the value that differs, never the join. The figures run the course's text with one line changed, never a line the learner must write in the outline, to show that a test finds a wrong join only where its program reaches it.",
  },
};
