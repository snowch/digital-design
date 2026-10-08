// Copyright © 2026 Christopher Snow

// Lesson: Module 12, lesson 6, nesting. Lesson 12.5 ended: what happens if a trap comes while
// the handler runs? Every trap's edge turns interrupts off, so a door that opens during a long
// job waits until `resume`. A trap inside the handler, a fault or an interrupt let in, writes C1,
// C2 and C3 like any other, so the way back to the program is lost unless the handler kept C1 and
// C2 first; a handler that turns interrupts on keeps them in memory, turns interrupts off again,
// and writes them back before `resume`.
//
// Job 5, "wait R2 rounds", is this lesson's own: the long job the question needs. Jobs 1 to 4
// stay as lesson 4 numbered them.
//
// The structure is here; the words are in nesting.prose.ts and nesting.labels.ts. The numbers
// the prose states are pinned by nesting.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./nesting.labels";
import { PROSE } from "./nesting.prose";
import {
  NEST_FAULT,
  NEST_LATE,
  NEST_SAVED,
  NEST_UNSAVED,
  WAIT_REFERENCE,
  WAIT_RUNS,
  WAIT_START,
} from "./module12";

/** The instruction count after which the door opens in the lesson's runs: inside the wait. */
export const NEST_DOOR = 60;

/** The construction: the door's interrupt inside job 5's loop, in NEST_SAVED's run. */
export const NEST_ANSWERS = [
  { id: "c1", value: "11", form: "bits", detail: "nestC1" },
  { id: "c3", value: "82", form: "hex", detail: "nestC3" },
  { id: "saved", value: "10C", form: "hex", detail: "nestSaved" },
  { id: "c0", value: "11", form: "bits", detail: "nestC0" },
] as const;

export const nesting: LessonInput = {
  id: "nesting",
  title: LABELS.title,
  module: 12,
  order: 6,
  objectives: [...LABELS.objectives],
  introduces: [],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "nest-late",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.late,
          lead: PROSE.lateLead,
          props: {
            program: NEST_LATE,
            registers: [1, 2],
            traps: true,
            control: true,
            modeWords: true,
            events: true,
            breakpoints: true,
            pause: ["door"],
            doorOpensAt: NEST_DOOR,
            outcomes: PROSE.lateAfter,
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
            program: NEST_FAULT,
            question: PROSE.p1Question,
            options: [
              { value: "07C", label: "07C" },
              { value: "048", label: "048" },
              { value: "04C", label: "04C" },
              { value: "01C", label: "01C" },
            ],
            ask: { what: "run", run: { after: 23, what: "control", reg: 2 }, traps: true },
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
          id: "fault-timeline",
          kind: "trap-timeline",
          timeModel: "none",
          caption: LABELS.captions.timeline,
          lead: PROSE.timelineLead,
          props: {
            program: NEST_FAULT,
            from: 11,
            edges: 42,
            mode: true,
            lanes: {
              lanes: [
                { at: "0x000", name: LABELS.lanes.start },
                { at: "handler", name: LABELS.lanes.handler, handler: true },
                { at: "program", name: LABELS.lanes.program },
              ],
              again: LABELS.lanes.again,
            },
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
          id: "saved-listing",
          kind: "program-listing",
          timeModel: "none",
          caption: LABELS.captions.savedListing,
          lead: PROSE.savedListingLead,
          // The questions read addresses and lines, not machine words or where branches go.
          props: { program: NEST_SAVED, words: false, notes: false },
        },
        {
          id: "nest-answers",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.answers,
          lead: PROSE.answersLead,
          props: { challengeId: "nested-registers" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: PROSE.failureExperiment,
      interactives: [
        {
          id: "nest-unsaved",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.unsaved,
          lead: PROSE.unsavedLead,
          props: {
            program: NEST_UNSAVED,
            registers: [1, 2],
            traps: true,
            control: true,
            modeWords: true,
            events: true,
            doorOpensAt: NEST_DOOR,
            outcomes: PROSE.unsavedAfter,
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
          id: "nest-saved",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.saved,
          lead: PROSE.savedLead,
          props: {
            program: NEST_SAVED,
            registers: [1, 2],
            traps: true,
            control: true,
            modeWords: true,
            events: true,
            breakpoints: true,
            pause: ["door", "tick"],
            doorOpensAt: NEST_DOOR,
            doorOptions: [5, 30, NEST_DOOR],
            memory: [{ from: "0x410", words: 2, title: LABELS.keptTitle }],
            lanes: {
              lanes: [
                { at: "0x000", name: LABELS.lanes.start },
                { at: "handler", name: LABELS.lanes.handler, handler: true },
                { at: "program", name: LABELS.lanes.program },
              ],
              again: LABELS.lanes.again,
              marks: ["0x410", "0x418"],
            },
            outcomes: PROSE.savedAfter,
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
          id: "write-wait",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.wait,
          lead: PROSE.waitLead,
          props: { challengeId: "wait-door" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "nested-registers",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: NEST_ANSWERS.map((a) => ({
        id: a.id,
        label: LABELS.fields[a.id],
        kind: "text" as const,
      })),
      tests: {
        kind: "answers",
        grader: "exact",
        cases: NEST_ANSWERS.map((a) => ({
          label: LABELS.fields[a.id],
          given: { field: a.id, form: a.form, detail: a.detail },
          expect: { value: a.value },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { answers: Object.fromEntries(NEST_ANSWERS.map((a) => [a.id, a.value])) },
    },
    {
      id: "wait-door",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      allowedConstructs: ["assembly"],
      interface: { inputs: [], outputs: [] },
      initial: {
        text: WAIT_START,
        data: {
          debugger: {
            breakpoints: true,
            control: true,
            modeWords: true,
            events: true,
            registersFirst: true,
            memory: [{ from: "0x410", words: 2, title: LABELS.keptTitle }],
          },
        },
      },
      tests: {
        kind: "answers",
        grader: "program",
        cases: WAIT_RUNS.map((r, i) => ({
          label: LABELS.waitLabels[i] ?? r.label,
          given: {
            traps: "yes",
            data: r.code,
            detail: "waitDoor",
            ...(r.opens !== undefined ? { doorOpensAt: String(r.opens) } : {}),
          },
          // What the display showed; the lamps; C1 at the end, the program's status at its last
          // trap, which job 6 must put back; every register a call keeps; and a run that ends at
          // the handler's `stop` for job 4. The causes' order is not checked: a longer job 6
          // moves the timer's interrupt among the calls.
          expect: {
            shown: r.shown,
            lamps: String(r.lamps),
            C1: r.status,
            ...r.kept,
            stopAt: "handler",
          },
        })),
      },
      hints: [...PROSE.c2Hints],
      reference: { text: WAIT_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "Nested interrupts in the textbooks: an interrupt priority level and a mask register, the supervisor stack that LC-3 or the 68000 pushes the status and PC onto, MIPS's EPC overwritten by an exception inside the handler and the advice to save EPC and Status before re-enabling interrupts, the 'reentrant handler' of an operating systems text.",
    howThisDiffers:
      "The question comes from the shop: a user program asks the handler to wait, and the freezer's door, opened during the wait, goes unanswered for over a hundred instructions because the trap's edge turned interrupts off. A fault inside the handler, a room number the handler trusts, is stepped edge by edge until the learner sees C2 and C1 overwritten and the run circle inside the handler. The fix is the machine's own: C1 and C2 copied to two RAM words the handler chooses, C0 written to let interrupts in, and turned off again before C1 and C2 are written back; no stack, no priority levels, no mask register. The learner works out the registers after the nested interrupt from a listing, then rewrites a job of its own, job 6, which counts down on the display, so the door comes in during the count; the figures' job 5 is not the answer. The tests check C1 at the end, every register a call keeps, and a program that ends straight after the count.",
  },
};
