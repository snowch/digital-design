// Copyright © 2026 Christopher Snow

// Lesson: Module 9, lesson 2, illegal instructions: the decoder's checks opened. A word is no
// instruction when no kind line is 1, when its job is one its kind does not define, or when a
// system job names a control register outside 0 to 4, the check that needs the constant as one
// of the decoder's inputs (docs/plan.md, the decision of 6 October 2026). The map of every kind
// and job is read off the decoder's circuit; the learner writes the check on the number, then
// the whole check.
//
// The structure is here; the words are in illegal-instructions.prose.ts and
// illegal-instructions.labels.ts. The numbers the prose states are pinned by
// illegal-instructions.facts.test.ts.

import type { LessonInput } from "@dd/lesson-schema";

import { LABELS } from "./illegal-instructions.labels";
import { PROSE } from "./illegal-instructions.prose";
import {
  CHECKS_REFERENCE,
  CHECKS_START,
  OUTSIDE_REFERENCE,
  OUTSIDE_START,
  everyKindAndJob,
} from "./module9";
import { decoderVectors } from "./module9";

const OUTSIDE_CONSTRUCTS = [
  "module",
  "ports",
  "logic",
  "vector",
  "assign",
  "select",
  "op-bitwise",
  "op-compare",
];

/** The constant's values the check on a control register's number is tested with. */
export const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 0x7ff, 0x800, 0xffc, 0xfff];

const s12 = (c: number) => (c >= 0x800 ? c - 0x1000 : c);

/** The number check's tests: OUTSIDE is 1 when C, read signed, is not 0 to 4. */
const OUTSIDE_VECTORS = NUMBERS.map((c) => ({
  label: `C ${c.toString(16).toUpperCase().padStart(3, "0")} (${s12(c)})`,
  inputs: { C: c },
  expect: { OUTSIDE: s12(c) >= 0 && s12(c) <= 4 ? 0 : 1 },
}));

/** The whole check's tests: every kind and job with the constant 0, and the numbered jobs. */
const CHECK_VECTORS = decoderVectors(
  [
    ...everyKindAndJob(0),
    ...[2, 3].flatMap((j) =>
      NUMBERS.filter((c) => c !== 0).map((c) => ({
        label: `K 8, J ${j}, C ${c.toString(16).toUpperCase().padStart(3, "0")}`,
        K: 8,
        J: j,
        C: c,
      })),
    ),
    // Words whose constant names no control register: the check on the number must not refuse them.
    ...[0, 1, 4].flatMap((j) =>
      [5, 0xfff].map((c) => ({
        label: `K 8, J ${j}, C ${c.toString(16).toUpperCase().padStart(3, "0")}`,
        K: 8,
        J: j,
        C: c,
      })),
    ),
    { label: "K 1, J 2, C 005", K: 1, J: 2, C: 5 },
  ],
  ["K", "J", "C"],
  ["ILLEGAL"],
);

/** The fault lab's checks: words the decoder must refuse or take. */
const FAULT_RUN = [
  { label: LABELS.checks.zeros, set: { K: 0, J: 0, C: 0 } },
  { label: LABELS.checks.kindNine, set: { K: 9, J: 0, C: 0 } },
  { label: LABELS.checks.jobEight, set: { K: 1, J: 8, C: 0 } },
  { label: LABELS.checks.numberFive, set: { K: 8, J: 2, C: 5 } },
  { label: LABELS.checks.numberMinusOne, set: { K: 8, J: 3, C: 0xfff } },
  { label: LABELS.checks.numberFour, set: { K: 8, J: 2, C: 4 } },
  { label: LABELS.checks.add, set: { K: 1, J: 2, C: 0 } },
];

export const illegalInstructions: LessonInput = {
  id: "illegal-instructions",
  title: LABELS.title,
  module: 9,
  order: 2,
  objectives: [...LABELS.objectives],
  introduces: ["illegal instruction"],
  sections: [
    { kind: "question", title: LABELS.titles.question, prose: PROSE.question },
    { kind: "motivation", title: LABELS.titles.motivation, prose: PROSE.motivation },
    {
      kind: "prediction",
      title: LABELS.titles.prediction,
      prose: PROSE.prediction,
      interactives: [
        {
          id: "predict-number",
          kind: "prediction",
          timeModel: "settle",
          caption: LABELS.captions.predictNumber,
          props: {
            question: PROSE.p1Question,
            libraryId: "decoder",
            run: [{ set: { K: 8, J: 4, C: 5 } }],
            watch: "CAUSED",
            options: [
              { value: "00000000", label: LABELS.options.p1Stop },
              { value: "00100001", label: LABELS.options.p1Illegal },
            ],
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
          id: "checks-open",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.checksOpen,
          lead: PROSE.checksOpenLead,
          after: PROSE.checksOpenAfter,
          props: {
            libraryId: "decoder",
            scope: "decoder/checks",
            initial: { K: 8, J: 2, C: 5 },
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
          id: "write-outside",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.writeOutside,
          lead: PROSE.writeOutsideLead,
          props: { challengeId: "outside-text" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "check-faults",
          kind: "fault-lab",
          timeModel: "settle",
          caption: LABELS.captions.checkFaults,
          lead: PROSE.checkFaultsLead,
          props: {
            libraryId: "decoder",
            scope: "decoder/checks",
            faults: [
              {
                kind: "stuck-at",
                net: "decoder/checks/NOKIND",
                value: 0,
                label: LABELS.faults.noKindLow,
              },
              {
                kind: "stuck-at",
                net: "decoder/checks/BADNUMBER",
                value: 0,
                label: LABELS.faults.numberLow,
              },
            ],
            run: FAULT_RUN,
            outcomes: PROSE.checkFaultsOutcomes,
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
          id: "kind-map",
          kind: "kind-map",
          timeModel: "settle",
          caption: LABELS.captions.kindMap,
          lead: PROSE.kindMapLead,
          after: PROSE.kindMapAfter,
          props: {},
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
          id: "write-checks",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.writeChecks,
          lead: PROSE.writeChecksLead,
          props: { challengeId: "checks-text" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "outside-text",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "write",
      interface: {
        inputs: [{ name: "C", width: 12 }],
        outputs: [{ name: "OUTSIDE" }],
      },
      allowedConstructs: OUTSIDE_CONSTRUCTS,
      initial: { hdl: OUTSIDE_START },
      tests: { kind: "combinational", vectors: OUTSIDE_VECTORS },
      hints: [...PROSE.c1Hints],
      reference: { hdl: OUTSIDE_REFERENCE },
    },
    {
      id: "checks-text",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      interface: {
        inputs: [
          { name: "K", width: 4 },
          { name: "J", width: 4 },
          { name: "C", width: 12 },
        ],
        outputs: [{ name: "ILLEGAL" }],
      },
      allowedConstructs: OUTSIDE_CONSTRUCTS,
      tryIt: "pins",
      initial: { hdl: CHECKS_START },
      tests: { kind: "combinational", vectors: CHECK_VECTORS },
      hints: [...PROSE.c2Hints],
      reference: { hdl: CHECKS_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "An undefined opcode raising an exception in a pipeline's decode stage, with the exception program counter and cause register set and a jump to a fixed handler address (Patterson and Hennessy's exceptions section); LC-3's illegal opcode exception for its reserved opcode 1101; x86's UD2, an instruction defined to be undefined.",
    howThisDiffers:
      "The illegal words are the course machine's own (docs/isa.md): kind 0, kinds 9 to F, a job its kind does not define, and a system job naming a control register outside 0 to 4, which needs the constant as one of the decoder's inputs, the wire Module 8 left out (docs/plan.md, 6 October 2026). The decoder's checks are three blocks a learner opens, read off the kind lines rather than K: no kind line at all, a bad job, a bad number. The map of every kind and job, shown after the learner has opened the checks, is the decoder's own circuit run on every pair, with the two cells that depend on the constant marked. The lesson opens on the instruction Module 8's machine stopped on as a job a later module builds, R0 ← C5, which Module 9's decoder now refuses, and the prediction asks about a stop whose constant is 5, which names no control register and passes. The machine stops and says why, with no handler until Module 12; the faults let an unknown kind through and let a bad number through.",
  },
};
