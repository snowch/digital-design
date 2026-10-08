// Copyright © 2026 Christopher Snow

// Lesson: Module 12, lesson 5, interrupts. Lesson 12.4 ended: how can the machine go to the
// handler when the door opens, between two instructions of a program that knows nothing of the
// door? The waiting word's bits say an event has happened; with C0's bit 1 on, the edge that
// would run the next instruction traps instead, with cause 81 for the timer or 82 for the door,
// and the return point is the instruction not yet run. The handler clears the event by writing a
// 1 to its bit of "waiting"; one that does not is sent back to the handler at once, for ever.
//
// The structure is here; the words are in interrupts.prose.ts and interrupts.labels.ts. The
// numbers the prose states are pinned by interrupts.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./interrupts.labels";
import { PROSE } from "./interrupts.prose";
import {
  COUNT_PROGRAM,
  DOOR_NO_CLEAR,
  DOOR_OPEN,
  DOOR_UNSEEN,
  TIMER_KEPT_END,
  TIMER_PROGRAM,
  TIMER_REFERENCE,
  TIMER_RUNS,
  TIMER_START,
} from "./module12";

/** The instruction count before which the door opens in the lesson's runs. */
export const DOOR_AT = 15;

/** The construction: what the next edge does, by C0 and "waiting"; 0 where the instruction runs. */
export const EVENT_ANSWERS = [
  { id: "door", control: 0b10n, waiting: 0b10, value: "82" },
  { id: "off", control: 0b00n, waiting: 0b10, value: "0" },
  { id: "both", control: 0b10n, waiting: 0b11, value: "81" },
  { id: "handler", control: 0b01n, waiting: 0b01, value: "0" },
] as const;

export const interrupts: LessonInput = {
  id: "interrupts",
  title: LABELS.title,
  module: 12,
  order: 5,
  objectives: [...LABELS.objectives],
  introduces: ["interrupt"],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "door-unseen",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.unseen,
          lead: PROSE.unseenLead,
          props: {
            program: DOOR_UNSEEN,
            registers: [1, 2, 3],
            traps: true,
            control: true,
            modeWords: true,
            events: true,
            doorOpensAt: DOOR_AT,
            outcomes: PROSE.unseenAfter,
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
            program: DOOR_OPEN,
            question: PROSE.p1Question,
            options: [
              { value: "0AC", label: "0AC" },
              { value: "0B0", label: "0B0" },
              { value: "0B4", label: "0B4" },
              { value: "01C", label: "01C" },
            ],
            ask: {
              what: "run",
              run: { after: 17, what: "control", reg: 2 },
              traps: true,
              doorOpensAt: DOOR_AT,
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
          id: "door-timeline",
          kind: "trap-timeline",
          timeModel: "none",
          caption: LABELS.captions.timeline,
          lead: PROSE.timelineLead,
          props: {
            program: DOOR_OPEN,
            doorOpensAt: DOOR_AT,
            from: 15,
            edges: 136,
            mode: true,
            interrupts: true,
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
          id: "event-answers",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.answers,
          lead: PROSE.answersLead,
          props: { challengeId: "next-edge" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: PROSE.failureExperiment,
      interactives: [
        {
          id: "door-no-clear",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.noClear,
          lead: PROSE.noClearLead,
          props: {
            program: DOOR_NO_CLEAR,
            registers: [2, 8],
            traps: true,
            control: true,
            modeWords: true,
            events: true,
            doorOpensAt: DOOR_AT,
            outcomes: PROSE.noClearAfter,
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
          id: "door-debugger",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.debugger,
          lead: PROSE.debuggerLead,
          props: {
            program: DOOR_OPEN,
            traps: true,
            control: true,
            modeWords: true,
            events: true,
            breakpoints: true,
            pause: ["door", "tick"],
            doorOpensAt: DOOR_AT,
            doorOptions: [5, DOOR_AT, 50],
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
          id: "write-timer",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.timer,
          lead: PROSE.timerLead,
          props: { challengeId: "door-timer" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "next-edge",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: EVENT_ANSWERS.map((a) => ({
        id: a.id,
        label: LABELS.fields[a.id],
        kind: "text" as const,
      })),
      tests: {
        kind: "answers",
        grader: "exact",
        cases: EVENT_ANSWERS.map((a) => ({
          label: LABELS.fields[a.id],
          given: { field: a.id, form: "hex", detail: "nextEdge" },
          expect: { value: a.value },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { answers: Object.fromEntries(EVENT_ANSWERS.map((a) => [a.id, a.value])) },
    },
    {
      id: "door-timer",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      allowedConstructs: ["assembly"],
      interface: { inputs: [], outputs: [] },
      initial: {
        text: TIMER_START,
        data: {
          debugger: {
            breakpoints: true,
            control: true,
            modeWords: true,
            events: true,
          },
        },
      },
      tests: {
        kind: "answers",
        grader: "program",
        cases: TIMER_RUNS.map((r, i) => ({
          label: LABELS.timerLabels[i] ?? r.label,
          given: {
            traps: "yes",
            data: TIMER_PROGRAM,
            detail: "doorTimer",
            ...(r.opens !== undefined ? { doorOpensAt: String(r.opens) } : {}),
            ...(r.closes !== undefined ? { doorClosesAt: String(r.closes) } : {}),
            ...(r.warm !== undefined ? { warm: r.warm } : {}),
          },
          // The lamps; 30 shown; every register the program keeps across the interrupts; and a
          // run that ends at the handler's `stop` for job 4.
          expect: {
            lamps: String(r.lamps),
            display: "30",
            ...TIMER_KEPT_END,
            causes: r.opens !== undefined ? "82, 81, 41, 41" : "41, 41",
            stopAt: "handler",
          },
        })),
      },
      hints: [...PROSE.c2Hints],
      reference: { text: TIMER_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "The keyboard or timer interrupt of the textbooks: LC-3's keyboard interrupt echoing a character through a vector table and a supervisor stack, a MIPS or RISC-V timer interrupt with its interrupt-enable and pending registers, the stock 'blink an LED from a timer interrupt' of microcontroller courses.",
    howThisDiffers:
      "The event is the shop's own freezer door, which Module 2 gave its DOOR signal, opening while a user program counts and knows nothing of it. Interrupts arrive through the machine's own waiting word and C0's bit 1, taken at the edge that would run the next instruction, with the instruction not yet run as the return point; the same handler and C4 as every trap, no vector table, no pending or enable registers by those names. The door's handler starts the shop's timer, and the timer's handler lights ALARM only if the door is still open, so the learner's challenge is a rule of the shop, tested with doors that open, close in time, never open, or open late. The failure experiment is a handler that leaves the door's event waiting, which the learner watches send the machine back to the handler before any of the program runs.",
  },
};
