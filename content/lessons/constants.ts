// Copyright © 2026 Christopher Snow

// Lesson: Module 8, lesson 2, the constant jobs: the instruction's last three digits widened to 64
// bits, and a selector that gives the ALU's B input either register B's word or that constant.
//
// The structure is here; the words are in constants.prose.ts and constants.labels.ts. The
// numbers the prose states are pinned by constants.facts.test.ts, read off the figures' props.

import type { LessonInput } from "@dd/lesson-schema";

import { LABELS } from "./constants.labels";
import { PROSE } from "./constants.prose";
import { ROOMS } from "./instructions";
import { CONSTANTS_REFERENCE, CONSTANTS_START, WIDEN_REFERENCE, WIDEN_START } from "./module8";

/** What the widening challenge may use: the digits challenge's constructs, with Module 7's. */
const WIDEN_CONSTRUCTS = [
  "module",
  "ports",
  "logic",
  "vector",
  "assign",
  "select",
  "concat",
  "always_comb",
  "case",
];
const CONSTANTS_CONSTRUCTS = [...WIDEN_CONSTRUCTS, "instance"];

/** The instructions the investigation offers, each with WRITEY and BCONST set by hand. */
const CONSTANT_JOBS = [
  { label: LABELS.instructions.copy, text: "R3 <= -100", set: { WRITEY: 1, BCONST: 1 } },
  { label: LABELS.instructions.add, text: "R3 <= R1 + 100", set: { WRITEY: 1, BCONST: 1 } },
  { label: LABELS.instructions.and, text: "R3 <= R1 & 0xFF", set: { WRITEY: 1, BCONST: 1 } },
  { label: LABELS.instructions.largest, text: "R4 <= 2047", set: { WRITEY: 1, BCONST: 1 } },
  { label: LABELS.instructions.smallest, text: "R4 <= -2048", set: { WRITEY: 1, BCONST: 1 } },
  { label: LABELS.instructions.register, text: "R3 <= R1 + R2", set: { WRITEY: 1, BCONST: 0 } },
];

const h64 = (v: bigint) => `0x${BigInt.asUintN(64, v).toString(16).toUpperCase()}`;

/** The widening's tests: the constant's ends, both sides of 0, and the rooms' -250. */
const WIDEN_VECTORS = [0n, 100n, 2047n, -2048n, -1n, -250n].map((c) => ({
  label: `C ${BigInt.asUintN(12, c).toString(16).toUpperCase().padStart(3, "0")}`,
  inputs: { C: `0x${BigInt.asUintN(12, c).toString(16).toUpperCase()}` },
  expect: { W: h64(c) },
}));

/** The constant jobs' tests: R1 is -184 and R2 is -250 at the start. */
const CONSTANTS_STEPS: {
  label: string;
  set: Record<string, string | number>;
  expect: Record<string, string>;
}[] = [
  {
    label: "R3 <= R1 + 100, BCONST 1, clock low",
    set: { CLK: 0, IR: "0x22103064", WRITEY: 1, BCONST: 1 },
    expect: { RESULT: h64(-84n) },
  },
  { label: "edge: R3 takes -84", set: { CLK: 1 }, expect: { RESULT: h64(-84n) } },
  {
    label: "R4 <= R3 + R3 and BCONST 0 arrive while the clock is high",
    set: { IR: "0x12334000", BCONST: 0 },
    expect: { RESULT: h64(-168n) },
  },
  { label: "clock low", set: { CLK: 0 }, expect: { RESULT: h64(-168n) } },
  { label: "edge: R4 takes -168", set: { CLK: 1 }, expect: { RESULT: h64(-168n) } },
  {
    label: "R5 <= -250, BCONST 1, clock low",
    set: { CLK: 0, IR: "0x25005F06", BCONST: 1 },
    expect: { RESULT: h64(-250n) },
  },
  { label: "R5 <= -2048", set: { IR: "0x25005800" }, expect: { RESULT: h64(-2048n) } },
  { label: "R5 <= 2047", set: { IR: "0x250057FF" }, expect: { RESULT: h64(2047n) } },
];

export const constants: LessonInput = {
  id: "constants",
  title: LABELS.title,
  module: 8,
  order: 2,
  objectives: [...LABELS.objectives],
  introduces: [],
  sections: [
    { kind: "question", title: LABELS.titles.question, prose: PROSE.question },
    { kind: "motivation", title: LABELS.titles.motivation, prose: PROSE.motivation },
    {
      kind: "prediction",
      title: LABELS.titles.prediction,
      prose: PROSE.prediction,
      interactives: [
        {
          id: "predict-constant",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.predictConstant,
          props: {
            libraryId: "datapath-constants",
            registers: ROOMS,
            instructions: [CONSTANT_JOBS[0]],
            shown: [1, 2, 3],
            buses: ["WIDE", "ALUB", "RESULT"],
            question: PROSE.p1Question,
            options: [
              { value: "-100", label: LABELS.options.p1Negative },
              { value: "3996", label: LABELS.options.p1Positive },
              { value: "X", label: LABELS.options.p1Unknown },
            ],
            ask: "value",
            register: 3,
            explain: PROSE.p1Explain,
          },
        },
      ],
    },
    {
      kind: "investigation",
      title: LABELS.titles.investigation,
      prose: "",
      interactives: [
        {
          id: "constants",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.constants,
          lead: PROSE.constantsLead,
          after: PROSE.constantsAfter,
          props: {
            libraryId: "datapath-constants",
            registers: ROOMS,
            instructions: CONSTANT_JOBS,
            shown: [1, 2, 3, 4],
            buses: ["QB", "WIDE", "ALUB", "RESULT"],
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
          id: "write-widen",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.writeWiden,
          lead: PROSE.writeWidenLead,
          props: { challengeId: "widen-text" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "constants-faults",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.constantsFaults,
          lead: PROSE.constantsFaultsLead,
          props: {
            outcomes: PROSE.constantsFaultsAfter,
            libraryId: "datapath-constants",
            registers: ROOMS,
            instructions: [CONSTANT_JOBS[0], CONSTANT_JOBS[1]],
            shown: [1, 2, 3],
            buses: ["WIDE", "ALUB", "RESULT"],
            faults: [
              { kind: "stuck-at", net: "widen/C11", value: 0, label: LABELS.faults.copyLow },
              { kind: "stuck-at", net: "BCONST", value: 0, label: LABELS.faults.bconstLow },
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
          id: "widening",
          kind: "widening",
          timeModel: "settle",
          caption: LABELS.captions.widening,
          lead: PROSE.wideningLead,
          props: {
            constants: [
              { label: LABELS.widenings.hundred, c: "064" },
              { label: LABELS.widenings.minusHundred, c: "F9C" },
              { label: LABELS.widenings.largest, c: "7FF" },
              { label: LABELS.widenings.smallest, c: "800" },
            ],
          },
        },
      ],
    },
    {
      kind: "generalisation",
      title: LABELS.titles.generalisation,
      prose: PROSE.generalisation,
      interactives: [
        {
          id: "hour",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.hour,
          lead: PROSE.hourLead,
          after: PROSE.hourAfter,
          props: {
            libraryId: "datapath-constants",
            registers: {},
            instructions: [
              {
                label: LABELS.instructions.half,
                text: "R6 <= 1800",
                set: { WRITEY: 1, BCONST: 1 },
              },
              {
                label: LABELS.instructions.double,
                text: "R6 <= R6 + R6",
                set: { WRITEY: 1, BCONST: 0 },
              },
            ],
            shown: [6],
          },
        },
      ],
    },
    {
      kind: "challenge",
      title: LABELS.titles.challenge,
      prose: "",
      interactives: [
        {
          id: "write-constants",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.writeConstants,
          lead: PROSE.writeConstantsLead,
          props: { challengeId: "constants-text" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "widen-text",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "write",
      interface: {
        inputs: [{ name: "C", width: 12 }],
        outputs: [{ name: "W", width: 64 }],
      },
      tryIt: "pins",
      allowedConstructs: WIDEN_CONSTRUCTS,
      initial: { hdl: WIDEN_START },
      tests: { kind: "combinational", vectors: WIDEN_VECTORS },
      hints: [...PROSE.c1Hints],
      reference: { hdl: WIDEN_REFERENCE },
    },
    {
      id: "constants-text",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      interface: {
        inputs: [
          { name: "CLK" },
          { name: "IR", width: 32 },
          { name: "WRITEY" },
          { name: "BCONST" },
        ],
        outputs: [{ name: "RESULT", width: 64 }],
      },
      allowedConstructs: CONSTANTS_CONSTRUCTS,
      courseModules: { set: "machine", registers: ROOMS },
      tryIt: "pins",
      initial: { hdl: CONSTANTS_START },
      tests: { kind: "sequence", steps: CONSTANTS_STEPS },
      hints: [...PROSE.c2Hints],
      reference: { hdl: CONSTANTS_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "The I-type instruction's 16-bit immediate, sign-extended by a box labelled 'Sign extend' and chosen by ALUSrc into the ALU (Patterson and Hennessy; Harris and Harris's ImmSrc and Extend unit); Nand2Tetris's A-instruction, which loads a 15-bit constant into the A register.",
    howThisDiffers:
      "The constant is the course's own three hexadecimal digits at the right of its own layout, 12 bits from -2048 to 2047, and its widening is shown as wires (bit 11 copied into the 52 bits above it), predicted on the shop's -250 against its unsigned reading 3846. The selector is Module 3's word selector, its select line named BCONST for what it chooses and set by hand. The faults break the copied bit and the selector. The generalisation is the course's own: 3600 seconds in an hour, which does not fit, built in two instructions by doubling 1800.",
  },
};
