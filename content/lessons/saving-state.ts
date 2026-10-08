// Copyright © 2026 Christopher Snow

// Lesson: Module 12, lesson 2, saving state. A handler runs in the middle of another program, so
// it must leave every register as it found it: lesson 1's handler, which writes R5, spoils a
// program that keeps room A's reading there, and the display shows the return point instead. The
// handler saves what it uses with absolute stores, at addresses the constant gives, and puts it
// back before `resume`. It cannot push: R14 may be what went wrong, and a handler whose first
// instruction stores through a stack that has reached the ROM traps at its own address, where the
// machine halts.
//
// The structure is here; the words are in saving-state.prose.ts and saving-state.labels.ts. The
// numbers the prose states are pinned by saving-state.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./saving-state.labels";
import { PROSE } from "./saving-state.prose";
import {
  SAVED,
  SAVE_PROGRAMS,
  SAVE_REFERENCE,
  SAVE_START,
  SPOILED,
  STACK_HANDLER,
} from "./module12";
import { NIGHT_INPUTS } from "./traps";

/** The construction's four handlers: whether each leaves the program's registers as they were. */
export const SAVE_CHOICES = [
  { id: "a", answer: "leaves" },
  { id: "b", answer: "changes" },
  { id: "c", answer: "changes" },
  { id: "d", answer: "leaves" },
] as const;

/** Each choice's handler, as the task shows it. */
const HANDLER_TEXT = { a: "A", b: "B", c: "C", d: "D" } as const;

export const savingState: LessonInput = {
  id: "saving-state",
  title: LABELS.title,
  module: 12,
  order: 2,
  objectives: [...LABELS.objectives],
  introduces: [],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "spoiled",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.spoiled,
          lead: PROSE.spoiledLead,
          props: {
            program: SPOILED,
            inputs: NIGHT_INPUTS,
            registers: [5],
            traps: true,
            outcomes: PROSE.spoiledAfter,
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
          id: "predict-display",
          kind: "program-listing",
          timeModel: "none",
          caption: LABELS.captions.predict,
          props: {
            program: SAVED,
            question: PROSE.p1Question,
            options: [
              { value: "-184", label: "-184" },
              { value: "20", label: "20" },
              { value: "52", label: "52" },
              { value: "0", label: "0" },
            ],
            ask: {
              what: "run",
              run: { what: "word", address: "408" },
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
          id: "saved",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.saved,
          lead: PROSE.savedLead,
          props: {
            program: SAVED,
            inputs: NIGHT_INPUTS,
            registers: [5],
            traps: true,
            control: true,
            breakpoints: true,
            pause: ["handler"],
            watch: true,
            watched: ["R5", "word[0x408]"],
            outcomes: PROSE.savedAfter,
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
          id: "save-choices",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.choices,
          lead: PROSE.choicesLead,
          props: { challengeId: "save-choices" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: PROSE.failureExperiment,
      interactives: [
        {
          id: "stack-handler",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.stack,
          lead: PROSE.stackLead,
          props: {
            program: STACK_HANDLER,
            inputs: NIGHT_INPUTS,
            registers: [5, 10, 14],
            traps: true,
            control: true,
            outcomes: PROSE.stackAfter,
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
          id: "saved-timeline",
          kind: "trap-timeline",
          timeModel: "none",
          caption: LABELS.captions.timeline,
          lead: PROSE.timelineLead,
          props: { program: SAVED, inputs: NIGHT_INPUTS, from: 3 },
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
          id: "write-save",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.save,
          lead: PROSE.saveLead,
          props: { challengeId: "save-registers" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "save-choices",
      title: LABELS.challengeTitles.c1,
      // The task, then the four handlers, each under its field's label.
      task: [
        PROSE.c1Task,
        ...SAVE_CHOICES.map(
          (c) => `**${LABELS.choiceFields[c.id]}**\n\n${PROSE[HANDLER_TEXT[c.id]]}`,
        ),
      ].join("\n\n"),
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: SAVE_CHOICES.map((c) => ({
        id: c.id,
        label: LABELS.choiceFields[c.id],
        kind: "choice" as const,
        options: [
          { value: "leaves", label: LABELS.choiceOptions.leaves },
          { value: "changes", label: LABELS.choiceOptions.changes },
        ],
      })),
      tests: {
        kind: "answers",
        grader: "choices",
        cases: SAVE_CHOICES.map((c) => ({
          label: LABELS.choiceFields[c.id],
          given: { field: c.id, detail: "saveChoice" },
          expect: { value: c.answer },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { answers: Object.fromEntries(SAVE_CHOICES.map((c) => [c.id, c.answer])) },
    },
    {
      id: "save-registers",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      allowedConstructs: ["assembly"],
      interface: { inputs: [], outputs: [] },
      initial: {
        text: SAVE_START,
        // Every register, which the tests check, and the count.
        data: {
          debugger: {
            breakpoints: true,
            control: true,
            registersFirst: true,
            memory: [{ from: "0x400", words: 1, title: LABELS.memoryTitle }],
          },
        },
      },
      tests: {
        kind: "answers",
        grader: "program",
        cases: SAVE_PROGRAMS.map((p, k) => ({
          label: LABELS.saveLabels[k] ?? p.label,
          given: { traps: "yes", data: p.code, detail: "saveRegisters" },
          // Every register the program set, R0 to R15, and how the run ended: at the program's
          // own `end`, after its refused stores.
          expect: {
            "word:400": String(p.count),
            ...Object.fromEntries(p.registers.map((v, k) => [`R${k}`, String(v)])),
            C3: "34",
            causes: p.causes,
            stopAt: "end",
          },
        })),
      },
      hints: [...PROSE.c2Hints],
      reference: { text: SAVE_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "Patt and Patel's service routines that save and restore the registers they use (and LC-3's supervisor stack, switched to on a trap); Patterson and Hennessy's exception handler that saves registers in reserved memory, $k0 and $k1 set aside for the handler; the trap frame pushed on a kernel stack in xv6 and Bryant and O'Hallaron.",
    howThisDiffers:
      "The need to save arrives as a failure the learner runs first: lesson 1's own handler, which writes R5, put on a program that keeps room A's reading in R5, so the display shows the return point, 20, instead of -184. The save is two absolute stores to fixed words of the course machine's RAM, which need no register to hold an address, and the reason not to push is run, not told: a handler whose first instruction stores below a stack that has reached the ROM traps at the address C4 holds, where this machine halts. No registers reserved for the handler, no second stack, no trap frame. The learner judges four handlers, then writes one that counts and skips refused stores while leaving every register, R0 to R15, as it found it, tested on programs that set every one to a word of their own and checked on all sixteen.",
  },
};
