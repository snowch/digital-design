// Copyright © 2026 Christopher Snow

// Lesson: Module 12, lesson 4, system calls. A user program may not touch the display: its store
// traps with cause 32. It asks the handler instead, with `call system`: a trap the program makes
// on purpose (cause 41), with the service in R1, its arguments in R2 to R4 and its result in R1,
// as for a function whose first argument says which service. Its return point is the next
// instruction, not the call, so a handler that adds 4 to C2 as lesson 1's did skips a line of the
// program after every call.
//
// The structure is here; the words are in system-calls.prose.ts and system-calls.labels.ts. The
// numbers the prose states are pinned by system-calls.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./system-calls.labels";
import { PROSE } from "./system-calls.prose";
import {
  SERVICES,
  SERVICES_SKIPPING,
  SERVICE2_PROGRAMS,
  SERVICE2_REFERENCE,
  SERVICE2_START,
  SHOW_DIRECT,
} from "./module12";
import { NIGHT_INPUTS } from "./traps";

/** The construction: the services' numbers, an argument, and a result. */
export const CALL_ANSWERS = [
  { id: "show", value: "1" },
  { id: "end", value: "4" },
  { id: "night", value: "2" },
  { id: "roomB", value: "-250" },
] as const;

export const systemCalls: LessonInput = {
  id: "system-calls",
  title: LABELS.title,
  module: 12,
  order: 4,
  objectives: [...LABELS.objectives],
  introduces: ["system call"],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "show-direct",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.direct,
          lead: PROSE.directLead,
          props: {
            program: SHOW_DIRECT,
            inputs: NIGHT_INPUTS,
            registers: [2, 5],
            traps: true,
            control: true,
            modeWords: true,
            outcomes: PROSE.directAfter,
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
            program: SERVICES,
            question: PROSE.p1Question,
            options: [
              { value: "064", label: "064" },
              { value: "068", label: "068" },
              { value: "06C", label: "06C" },
              { value: "01C", label: "01C" },
            ],
            ask: {
              what: "run",
              run: { after: 10, what: "control", reg: 2 },
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
          id: "calls-timeline",
          kind: "trap-timeline",
          timeModel: "none",
          caption: LABELS.captions.timeline,
          lead: PROSE.timelineLead,
          props: {
            program: SERVICES,
            inputs: NIGHT_INPUTS,
            from: 7,
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
          id: "call-answers",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.answers,
          lead: PROSE.answersLead,
          props: { challengeId: "call-registers" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: PROSE.failureExperiment,
      interactives: [
        {
          id: "skipping",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.skipping,
          lead: PROSE.skippingLead,
          props: {
            program: SERVICES_SKIPPING,
            inputs: NIGHT_INPUTS,
            registers: [1, 2],
            traps: true,
            control: true,
            breakpoints: true,
            outcomes: PROSE.skippingAfter,
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
          id: "services",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.services,
          lead: PROSE.servicesLead,
          props: {
            program: SERVICES,
            inputs: NIGHT_INPUTS,
            registers: [1, 2, 8, 9],
            traps: true,
            control: true,
            modeWords: true,
            breakpoints: true,
            pause: ["handler"],
            outcomes: PROSE.servicesAfter,
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
          id: "write-sensor",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.sensor,
          lead: PROSE.sensorLead,
          props: { challengeId: "sensor-service" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "call-registers",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: CALL_ANSWERS.map((a) => ({
        id: a.id,
        label: LABELS.fields[a.id],
        kind: "text" as const,
      })),
      tests: {
        kind: "answers",
        grader: "exact",
        cases: CALL_ANSWERS.map((a) => ({
          label: LABELS.fields[a.id],
          given: { field: a.id, form: "number", detail: "callRegister" },
          expect: { value: a.value },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { answers: Object.fromEntries(CALL_ANSWERS.map((a) => [a.id, a.value])) },
    },
    {
      id: "sensor-service",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      allowedConstructs: ["assembly"],
      interface: { inputs: [], outputs: [] },
      initial: {
        text: SERVICE2_START,
        data: {
          debugger: { control: true, modeWords: true, breakpoints: true, registers: [1, 2] },
        },
      },
      tests: {
        kind: "answers",
        grader: "program",
        cases: SERVICE2_PROGRAMS.map((p, k) => ({
          label: LABELS.sensorLabels[k] ?? p.label,
          given: {
            traps: "yes",
            data: p.code,
            sensorA: NIGHT_INPUTS.SENSORA,
            sensorB: NIGHT_INPUTS.SENSORB,
            detail: "sensorService",
          },
          expect: { shown: p.shown, end: "stop" },
        })),
      },
      hints: [...PROSE.c2Hints],
      reference: { text: SERVICE2_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "LC-3's TRAP instruction and its service routines (GETC, OUT, PUTS, IN, HALT) found through a trap vector table (Patt and Patel); the MIPS syscall instruction with its number in $v0 (Patterson and Hennessy, Harris and Harris); Bryant and O'Hallaron's write and exit system calls; xv6's system-call table.",
    howThisDiffers:
      "The need arrives from lesson 3's own rule: a user program's store to the shop's display traps with cause 32. The course machine's call system traps with cause 41, its return point the instruction after it, and the handler chooses the service by R1 with the arguments in R2 to R4 and the result in R1, as the course's own calling convention passes a function's arguments. The services are the shop's: show a word on the display, read a room's sensor, set the lamps, end the program, numbered 1 to 4 by this course. The failure is lesson 1's skip carried into a system call, which jumps a line of the program after each call. No vector table, no named services from any textbook machine, no write or exit.",
  },
};
