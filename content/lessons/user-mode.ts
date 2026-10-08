// Copyright © 2026 Christopher Snow

// Lesson: Module 12, lesson 3, user mode. A program in system mode can do anything: one meant to
// clear the display clears the lamps, and ALARM goes off with nothing to stop it. C0's bit 0 is
// the mode. In user mode the machine refuses `resume`, the control-register jobs and `stop`
// (cause 22) and every load or store at a device's address (cause 32), and a trap's edge puts the
// machine back in system mode for the handler. The handler drops to user mode by writing C1 and
// C2 and running `resume`. The RAM is not protected: a user program can write the handler's words.
//
// The structure is here; the words are in user-mode.prose.ts and user-mode.labels.ts. The numbers
// the prose states are pinned by user-mode.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./user-mode.labels";
import { PROSE } from "./user-mode.prose";
import {
  LAMPS_SYSTEM,
  LAMPS_USER,
  RAM_UNGUARDED,
  USER_PROGRAMS,
  USER_REFERENCE,
  USER_START,
} from "./module12";
import { NIGHT_INPUTS } from "./traps";

/** The construction: what user mode does with each of four lines; 0 where it allows the line. */
export const USER_ANSWERS = [
  { id: "load", value: "32" },
  { id: "ram", value: "0" },
  { id: "stop", value: "22" },
  { id: "timer", value: "32" },
] as const;

export const userMode: LessonInput = {
  id: "user-mode",
  title: LABELS.title,
  module: 12,
  order: 3,
  objectives: [...LABELS.objectives],
  introduces: ["user mode", "system mode"],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "lamps-system",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.system,
          lead: PROSE.systemLead,
          props: {
            program: LAMPS_SYSTEM,
            inputs: NIGHT_INPUTS,
            registers: [1, 2],
            traps: true,
            outcomes: PROSE.systemAfter,
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
          id: "predict-c1",
          kind: "program-listing",
          timeModel: "none",
          caption: LABELS.captions.predict,
          props: {
            program: LAMPS_USER,
            question: PROSE.p1Question,
            options: [
              { value: "00", label: "00" },
              { value: "01", label: "01" },
              { value: "10", label: "10" },
              { value: "11", label: "11" },
            ],
            ask: {
              what: "run",
              run: { after: 13, what: "control", reg: 1 },
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
          id: "user-timeline",
          kind: "trap-timeline",
          timeModel: "none",
          caption: LABELS.captions.timeline,
          lead: PROSE.timelineLead,
          props: {
            program: LAMPS_USER,
            inputs: NIGHT_INPUTS,
            from: 4,
            mode: true,
            outcomes: PROSE.timelineAfter,
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
          id: "user-answers",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.answers,
          lead: PROSE.answersLead,
          props: { challengeId: "user-refusals" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: PROSE.failureExperiment,
      interactives: [
        {
          id: "ram-unguarded",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.ram,
          lead: PROSE.ramLead,
          props: {
            program: RAM_UNGUARDED,
            inputs: NIGHT_INPUTS,
            registers: [3, 4, 5],
            traps: true,
            control: true,
            modeWords: true,
            memory: [{ from: "0x410", words: 1, title: LABELS.ramTitle }],
            outcomes: PROSE.ramAfter,
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
          id: "user-map",
          kind: "memory-map",
          timeModel: "none",
          caption: LABELS.captions.map,
          lead: PROSE.mapLead,
          props: { mode: "user" },
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
          id: "write-user",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.user,
          lead: PROSE.userLead,
          props: { challengeId: "start-user" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "user-refusals",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: USER_ANSWERS.map((a) => ({
        id: a.id,
        label: LABELS.fields[a.id],
        kind: "text" as const,
      })),
      tests: {
        kind: "answers",
        grader: "exact",
        cases: USER_ANSWERS.map((a) => ({
          label: LABELS.fields[a.id],
          given: { field: a.id, form: "hex", detail: "userRefusal" },
          expect: { value: a.value },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { answers: Object.fromEntries(USER_ANSWERS.map((a) => [a.id, a.value])) },
    },
    {
      id: "start-user",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      allowedConstructs: ["assembly"],
      interface: { inputs: [], outputs: [] },
      initial: {
        text: USER_START,
        data: { debugger: { control: true, modeWords: true, registers: [1, 5] } },
      },
      tests: {
        kind: "answers",
        grader: "program",
        cases: USER_PROGRAMS.map((p, k) => ({
          label: LABELS.userLabels[k] ?? p.label,
          given: { traps: "yes", data: p.code, detail: "startUser" },
          expect: {
            C1: "00",
            "word:400": String(p.cause),
            traps: "1",
            end: "stop",
          },
        })),
      },
      hints: [...PROSE.c2Hints],
      reference: { text: USER_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "LC-3's privilege bit in its processor status register, with the privilege mode violation exception and a supervisor stack (Patt and Patel); the two modes of Bryant and O'Hallaron's processes and their mode bit; RISC-V's machine and user modes.",
    howThisDiffers:
      "The mode arrives because the learner watches a program in system mode clear the shop's lamps by a one-word mistake, with nothing to stop it. The course machine's mode is C0's bit 0; user mode refuses the four system jobs but call system (cause 22) and every device address (cause 32), the shop's own devices, read or written. The handler drops to user mode with the same resume lesson 1 taught, after writing C1 and C2, and the lesson says plainly that the RAM is not protected: a user program overwrites the count the handler keeps. The memory map is shown as user mode meets it, read off the machine's own checks. No supervisor stack, no privilege levels beyond two, no named commercial modes.",
  },
};
