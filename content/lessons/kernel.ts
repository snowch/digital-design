// Copyright © 2026 Christopher Snow

// Lesson: Beyond the machine, the kernel chapter. 12.8's runner runs programs one after another, so
// the shop's gap program, which never ends, keeps the machine and the day's report never starts.
// The handler and its start, grown into the program that runs the others (a kernel): a system call
// followed from the gap program into it and back; the timer's interrupt taking the machine back
// from a program that never asks; the switch saving everything the machine holds for one program
// (sixteen registers, C1 and C2) in a save area of its own in the RAM, and putting the other's back.
// The stopped program later goes on from the instruction it had not yet run, and cannot tell.
//
// An optional chapter (module 14, `optional`), listed after the five stages under "Beyond the
// machine". The structure is here; the words are in kernel.prose.ts and kernel.labels.ts. The
// numbers the prose states are pinned by kernel.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import {
  GAP_PROGRAM,
  KERNEL_REFERENCE,
  KERNEL_RUNS,
  KERNEL_START,
  REPORT_PROGRAM,
  SHOP_READINGS,
  kernelText,
} from "./beyond";
import { LABELS } from "./kernel.labels";
import { PROSE } from "./kernel.prose";
import { RUN_REFERENCE } from "./module12";

const SHOP_TEXT = {
  SENSORA: String(SHOP_READINGS.sensorA),
  SENSORB: String(SHOP_READINGS.sensorB),
};

/** 12.8's runner with a table of two: the gap program first, the report second. */
export const RUNNER_TWO = `${RUN_REFERENCE}
programs: word 2, gap, report
${GAP_PROGRAM}
${REPORT_PROGRAM}`;

/** The steps from the reset after which the gap program next runs `R2 <= R5 - R1`, its R5 put back. */
export const BACK_TO_GAP = 455;

/** The construction's moment: the timer stops the report before `R11 <= R11 - 1`, at 210. */
export const SAVE_ANSWERS = [
  { id: "c2", value: "210", form: "hex", detail: "saveC2" },
  { id: "r13", value: "608", form: "hex", detail: "saveR13" },
  { id: "c1", value: "10", form: "bits", detail: "saveC1" },
] as const;

/** The lanes every run of the kernel is drawn in. */
const KERNEL_LANES = [
  { at: "0x000", name: LABELS.lanes.start },
  { at: "handler", name: LABELS.lanes.kernel, handler: true },
  { at: "gap", name: LABELS.lanes.gap },
  { at: "report", name: LABELS.lanes.report },
];

/** The kernel's words in the RAM: the two addresses, then each program's save area. */
const SAVE_AREAS = [
  { from: "0x480", words: 2, title: LABELS.memory.areas },
  { from: "0x500", words: 20, title: LABELS.memory.gap },
  { from: "0x5A0", words: 20, title: LABELS.memory.report },
];

/** The record a run must leave for each program, at the end of its save area. */
const recordKeys = ["word:590", "word:630"] as const;

export const kernelLesson: LessonInput = {
  id: "kernel",
  title: LABELS.title,
  module: 14,
  order: 2,
  optional: true,
  objectives: [...LABELS.objectives],
  prerequisites: ["system-calls", "interrupts", "system-call-mechanism"],
  introduces: ["kernel"],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "runner-two",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.runner,
          lead: PROSE.runnerLead,
          props: {
            program: RUNNER_TWO,
            inputs: SHOP_TEXT,
            traps: true,
            control: true,
            modeWords: true,
            lanes: {
              lanes: [
                { at: "0x000", name: LABELS.lanes.start },
                { at: "handler", name: LABELS.lanes.handler, handler: true },
                { at: "gap", name: LABELS.lanes.gap },
                { at: "report", name: LABELS.lanes.report },
              ],
              mode: true,
              upTo: 300,
            },
            memory: [{ from: "0x400", words: 2, title: LABELS.memory.records }],
            outcomes: PROSE.runnerAfter,
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
          id: "predict-r5",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.predict,
          props: {
            program: kernelText(),
            inputs: SHOP_TEXT,
            traps: true,
            control: true,
            modeWords: true,
            events: true,
            registers: [1, 2, 5],
            question: PROSE.p1Question,
            options: [
              { value: "-184", label: LABELS.options.roomA },
              { value: "0", label: LABELS.options.reportZero },
              { value: "-250", label: LABELS.options.roomB },
              { value: "X", label: LABELS.options.unknown },
            ],
            ask: { what: "register", reg: 5, after: BACK_TO_GAP },
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
          id: "switch",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.switch,
          lead: PROSE.switchLead,
          props: {
            program: kernelText(),
            inputs: SHOP_TEXT,
            traps: true,
            control: true,
            modeWords: true,
            events: true,
            breakpoints: true,
            pause: ["tick", "load"],
            registers: [5, 8, 9],
            memory: SAVE_AREAS,
            lanes: { lanes: KERNEL_LANES, mode: true, interrupts: true, upTo: 400 },
            outcomes: PROSE.switchAfter,
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
          id: "save-areas",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.save,
          lead: PROSE.saveLead,
          props: { challengeId: "save-areas" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: PROSE.failureExperiment,
      interactives: [
        {
          id: "too-short",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.short,
          lead: PROSE.shortLead,
          props: {
            program: kernelText(40),
            inputs: SHOP_TEXT,
            traps: true,
            control: true,
            events: true,
            question: PROSE.shortQuestion,
            options: [
              { value: "66", label: LABELS.options.both },
              { value: "0", label: LABELS.options.never },
            ],
            ask: { what: "display" },
            explain: PROSE.shortExplain,
            lanes: { lanes: KERNEL_LANES, mode: true, interrupts: true, upTo: 400 },
            outcomes: PROSE.shortAfter,
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
          id: "switch-lanes",
          kind: "trap-timeline",
          timeModel: "none",
          caption: LABELS.captions.lanes,
          lead: PROSE.lanesLead,
          props: {
            program: kernelText(),
            inputs: SHOP_TEXT,
            edges: 400,
            mode: true,
            interrupts: true,
            list: false,
            lanes: { lanes: KERNEL_LANES },
            outcomes: PROSE.lanesAfter,
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
          id: "two-programs",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.challenge,
          lead: PROSE.challengeLead,
          props: { challengeId: "two-programs" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "save-areas",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: SAVE_ANSWERS.map((a) => ({
        id: a.id,
        label: LABELS.fields[a.id],
        kind: "text" as const,
      })),
      tests: {
        kind: "answers",
        grader: "exact",
        cases: SAVE_ANSWERS.map((a) => ({
          label: LABELS.fields[a.id],
          given: { field: a.id, form: a.form, detail: a.detail },
          expect: { value: a.value },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { answers: Object.fromEntries(SAVE_ANSWERS.map((a) => [a.id, a.value])) },
    },
    {
      id: "two-programs",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      allowedConstructs: ["assembly"],
      interface: { inputs: [], outputs: [] },
      initial: {
        text: KERNEL_START,
        data: {
          debugger: {
            breakpoints: true,
            control: true,
            modeWords: true,
            registers: [1, 2, 9, 14],
            memory: [
              { from: "0x480", words: 2, title: LABELS.memory.areas },
              { from: "0x500", words: 20, title: LABELS.memory.first },
              { from: "0x5A0", words: 20, title: LABELS.memory.second },
            ],
          },
        },
      },
      tests: {
        kind: "answers",
        grader: "program",
        cases: KERNEL_RUNS.map((r, k) => ({
          label: LABELS.runs[k] ?? `${k + 1}`,
          given: {
            traps: "yes",
            data: r.data,
            sensorA: SHOP_READINGS.sensorA,
            sensorB: SHOP_READINGS.sensorB,
            detail: "kernelSetUp",
          },
          // The words shown, in order; both records; C1 as the last program left it, user mode
          // with interrupts on; and the run ending at the kernel's stop.
          expect: {
            shown: r.shown,
            [recordKeys[0]]: r.records[0],
            [recordKeys[1]]: r.records[1],
            C1: "10",
            end: "stop",
            stopAt: "handler",
          },
        })),
      },
      hints: [...PROSE.c2Hints],
      reference: { text: KERNEL_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "xv6's trap frame, process table (`proc`), `swtch` and scheduler loop with `struct context`, `sched`, `yield`, `sleep` and `wakeup`, its system-call table and numbering, a kernel stack per process and its trampoline, on RISC-V's `ecall`, `mcause`, `mret`, `mtvec` and `mepc`; the stock operating-systems examples of processes A, B and C printing letters in turn, a producer and a consumer sharing a buffer, and `fork`; Bryant and O'Hallaron's time line of a context switch (user code, kernel code, user code of another process); Arpaci-Dusseau's \"limited direct execution\" argument in Operating Systems: Three Easy Pieces, that a process which never makes a system call keeps the machine unless a timer interrupt takes it back; and round-robin time sharing with a process table, which 12.8's own note names as the textbook capstone.",
    howThisDiffers:
      "The kernel is the learner's own 12.8 runner grown: one handler at C4, 12.4's jobs 1 to 4 chosen by R1, two save areas at fixed addresses in the RAM, two words naming the running and the waiting program's areas, and one switch inside the timer's part of the handler, on the course machine's own C0 to C4, `call system` and `resume`. It saves once, every register, C1 and C2, in the handler, where xv6 saves twice (every register at the trap, fewer at a switch that is a function call). Two programs, not three, both the shop's and doing different work (Module 0's gap on the display, 11.7's report on its first log), sharing nothing but the machine: no buffer, no lock, no message, and no program makes another, since every program is in the ROM and set up by the start. The need arrives from the learner's runner, measured: run with the gap program first it shows the gap 94 times and never starts the report. The lanes are the view 12.4 and 12.8 already use, drawn from the machine's own run with each move labelled by what it writes and the switch's real length visible; the trigger is the shop's timer, which counts instructions. No queue, no scheduler and no process is named, and the reader writes no switch.",
  },
};
