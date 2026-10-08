// Copyright © 2026 Christopher Snow

// Lesson: Module 12, lesson 1, traps. Lesson 11.7 ended: what if, instead of halting, the machine
// went to a program of its own, said why, and carried on? C4 holds the handler's address; at the
// edge that ends the instruction that faults, C2 takes the return point, C1 takes C0, C0 takes
// 01, C3 takes the cause and the PC takes C4, and nothing else changes. `R5 <= C3` reads the
// cause, `resume` goes back to C2. A fault's return point is the instruction that faulted, so a
// handler that only resumes runs it again for ever; one that adds 4 to C2 skips it.
//
// The structure is here; the words are in traps.prose.ts and traps.labels.ts. The numbers the
// prose states are pinned by traps.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./traps.labels";
import { PROSE } from "./traps.prose";
import {
  NIGHT,
  NIGHT_HALTS,
  NIGHT_NO_SKIP,
  SKIP34_PROGRAMS,
  SKIP34_REFERENCE,
  SKIP34_START,
  TRAP_QUIZ,
} from "./module12";

/** Room A's and room B's readings in the night program's runs. */
export const NIGHT_INPUTS = { SENSORA: "-184", SENSORB: "-250" };

/** What the construction asks of a run of the quiz program, which the lesson does not run. */
export const TRAP_ANSWERS = [
  { id: "c2", value: "010", form: "hex", detail: "trapC2" },
  { id: "c3", value: "33", form: "hex", detail: "trapC3" },
  { id: "c1", value: "01", form: "hex", detail: "trapC1" },
  { id: "pc", value: "01C", form: "hex", detail: "trapPc" },
] as const;

export const traps: LessonInput = {
  id: "traps",
  title: LABELS.title,
  module: 12,
  order: 1,
  objectives: [...LABELS.objectives],
  introduces: ["trap", "handler"],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "night-halts",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.halts,
          lead: PROSE.haltsLead,
          props: {
            program: NIGHT_HALTS,
            inputs: NIGHT_INPUTS,
            registers: [0, 2, 3],
            traps: true,
            outcomes: PROSE.haltsAfter,
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
          id: "predict-c2",
          kind: "program-listing",
          timeModel: "none",
          caption: LABELS.captions.predict,
          props: {
            program: NIGHT,
            question: PROSE.p1Question,
            options: [
              { value: "010", label: "010" },
              { value: "014", label: "014" },
              { value: "018", label: "018" },
              { value: "024", label: "024" },
            ],
            ask: {
              what: "run",
              run: { after: 6, what: "control", reg: 2 },
              inputs: NIGHT_INPUTS,
              traps: true,
            },
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
          id: "night-timeline",
          kind: "trap-timeline",
          timeModel: "none",
          caption: LABELS.captions.timeline,
          lead: PROSE.timelineLead,
          props: { program: NIGHT, inputs: NIGHT_INPUTS, outcomes: PROSE.timelineAfter },
        },
      ],
    },
    {
      kind: "construction",
      title: LABELS.titles.construction,
      prose: PROSE.construction,
      interactives: [
        {
          id: "quiz-listing",
          kind: "program-listing",
          timeModel: "none",
          caption: LABELS.captions.quizListing,
          lead: PROSE.quizListingLead,
          props: { program: TRAP_QUIZ, names: false },
        },
        {
          id: "trap-answers",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.answers,
          lead: PROSE.answersLead,
          props: { challengeId: "trap-registers" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: PROSE.failureExperiment,
      interactives: [
        {
          id: "no-skip",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.noSkip,
          lead: PROSE.noSkipLead,
          props: {
            program: NIGHT_NO_SKIP,
            inputs: NIGHT_INPUTS,
            registers: [5],
            traps: true,
            control: true,
            outcomes: PROSE.noSkipAfter,
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
          id: "night-debugger",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.debugger,
          lead: PROSE.debuggerLead,
          props: {
            program: NIGHT,
            inputs: NIGHT_INPUTS,
            registers: [2, 3, 5],
            traps: true,
            control: true,
            breakpoints: true,
            pause: ["handler"],
            outcomes: PROSE.debuggerAfter,
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
          id: "write-skip34",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.skip34,
          lead: PROSE.skip34Lead,
          props: { challengeId: "skip-refused" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "trap-registers",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: TRAP_ANSWERS.map((a) => ({
        id: a.id,
        label: LABELS.fields[a.id],
        kind: "text" as const,
      })),
      tests: {
        kind: "answers",
        grader: "exact",
        cases: TRAP_ANSWERS.map((a) => ({
          label: LABELS.fields[a.id],
          given: { field: a.id, form: a.form, detail: a.detail },
          expect: { value: a.value },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { answers: Object.fromEntries(TRAP_ANSWERS.map((a) => [a.id, a.value])) },
    },
    {
      id: "skip-refused",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      allowedConstructs: ["assembly"],
      interface: { inputs: [], outputs: [] },
      initial: {
        text: SKIP34_START,
        data: { debugger: { breakpoints: true, control: true, registers: [2, 5, 6] } },
      },
      tests: {
        kind: "answers",
        grader: "program",
        cases: SKIP34_PROGRAMS.map((p) => ({
          label: LABELS.skip34Labels[SKIP34_PROGRAMS.indexOf(p)] ?? p.label,
          given: { traps: "yes", data: p.code, detail: "skip34" },
          expect: {
            "word:400": String(p.count),
            display: String(p.display),
            traps: String(p.traps),
            end: "stop",
          },
        })),
      },
      hints: [...PROSE.c2Hints],
      reference: { text: SKIP34_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "Patt and Patel's LC-3 exceptions and its interrupt vector table, a privilege mode exception or an illegal opcode handled by a service routine; Patterson and Hennessy's and Harris and Harris's MIPS exception handler, which saves EPC and Cause and jumps to a fixed address; the stock divide-by-zero or page-fault example.",
    howThisDiffers:
      "The trap arrives as the answer to the question Module 11 ended on, on the shop's own night program, whose stray store to room B's sensor halted the machine in Module 11's terms. The course machine's five control registers take their values at the edge that ends the faulting instruction, which the learner steps through edge by edge in a timeline read off the reference's own steps; the return point of a fault is the instruction that faulted, so a handler that only resumes runs it for ever, and one that adds 4 to C2 skips it. One handler address in C4, no table of vectors, no EPC or Cause registers by those names, no divide by zero (the machine has no division) and no page fault. The learner works out the registers for a trap the lesson never runs, then writes a handler that skips refused stores and counts them, and stops on every other cause.",
  },
};
