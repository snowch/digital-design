// Copyright © 2026 Christopher Snow

// Lesson: Module 12, lesson 7, the trap hardware. Lesson 12.6 ended: which parts of the machine
// copy C0 into C1, take the cause into C3 and send the PC to C4, all at one edge? On Module 12's
// machine of several edges (traps.ts, library id machine-traps): the control registers and the
// selectors in front of them in the datapath; the trap logic in the control unit, where Module
// 9's stop logic was, which says whether an edge traps and with which cause; the next PC from C4
// at a trap and from C2 at `resume`; and the controller's one new rule, that an edge which traps
// leads to FETCH. The learner writes the trap logic.
//
// The structure is here; the words are in trap-hardware.prose.ts and trap-hardware.labels.ts.
// The numbers the prose states are pinned by trap-hardware.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./trap-hardware.labels";
import { PROSE } from "./trap-hardware.prose";
import {
  CALL_TRAP,
  NIGHT,
  TRAPLOGIC_REFERENCE,
  TRAPLOGIC_ROWS,
  TRAPLOGIC_START,
  TRAP_EDGES,
  trapLogicOut,
} from "./module12";
import { NIGHT_INPUTS } from "./traps";

const TRAPLOGIC_CONSTRUCTS = [
  "module",
  "ports",
  "logic",
  "vector",
  "assign",
  "always_comb",
  "if",
  "select",
  "op-bitwise",
  "op-compare",
];

/**
 * The construction: how many edges each takes on the machine of several edges, counting the edge
 * that traps: a `stop` in user mode, the handler's `resume`, an interrupt, and a word load from an
 * address not a multiple of 8. None of them is counted on the page.
 */
export const EDGE_ANSWERS = [
  { id: "stop", value: "2", detail: "edgesStop" },
  { id: "resume", value: "3", detail: "edgesResume" },
  { id: "interrupt", value: "1", detail: "edgesInterrupt" },
  { id: "load", value: "4", detail: "edgesLoad" },
] as const;

const TRAPLOGIC_INPUTS = [
  { name: "CHECKING" },
  { name: "FETCHING" },
  { name: "CAUSED", width: 8 },
  { name: "STOP" },
  { name: "IE" },
  { name: "CAUSEF", width: 8 },
  { name: "CAUSEM", width: 8 },
  { name: "WAITING", width: 2 },
  { name: "NOHANDLER" },
];
const ZERO = Object.fromEntries(TRAPLOGIC_INPUTS.map((i) => [i.name, 0]));

const TRAPLOGIC_VECTORS = TRAPLOGIC_ROWS.map((r) => ({
  label: r.label,
  inputs: { ...ZERO, ...r.inputs },
  expect: trapLogicOut(r.inputs),
}));

/** The lanes of the edge-level timeline. */
const LANES = [
  { net: "CLK" },
  { net: "S", show: "state" as const },
  { net: "PC", show: "address" as const },
  { net: "IR", show: "word" as const },
  { net: "TRAP" },
  { net: "STATUS", label: "C0", show: "bits" as const },
  { net: "datapath/cregs/C1", label: "C1", show: "bits" as const },
  { net: "datapath/C2", label: "C2", show: "address" as const },
  { net: "datapath/cregs/C3", label: "C3", show: "cause" as const },
];

export const trapHardware: LessonInput = {
  id: "trap-hardware",
  title: LABELS.title,
  module: 12,
  order: 7,
  objectives: [...LABELS.objectives],
  introduces: [],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "trap-edges",
          kind: "edge-timeline",
          timeModel: "settle",
          caption: LABELS.captions.edges,
          lead: PROSE.edgesLead,
          after: PROSE.edgesAfter,
          props: { libraryId: "machine-traps", program: TRAP_EDGES, edges: 12, signals: LANES },
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
          id: "predict-pc",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.predict,
          props: {
            libraryId: "machine-traps",
            program: CALL_TRAP,
            edges: 8,
            shown: [1, 5],
            buses: ["IR"],
            states: true,
            focus: ["control", "controller"],
            question: PROSE.p1Question,
            options: [
              { value: "ALU", label: "ALU" },
              { value: "FETCH", label: "FETCH" },
              { value: "WRITE", label: "WRITE" },
              { value: "READ", label: "READ" },
            ],
            ask: "state",
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
          id: "night-hardware",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.night,
          lead: PROSE.nightLead,
          props: {
            outcomes: PROSE.nightAfter,
            outcomesWhen: "stopped",
            focus: ["datapath", "cregs"],
            libraryId: "machine-traps",
            program: NIGHT,
            inputs: NIGHT_INPUTS,
            shown: [2, 3, 5],
            buses: ["IR"],
            devices: true,
            run: true,
            states: true,
            timing: ["TRAP", "PCEN", "CWEN"],
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
          id: "edge-answers",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.answers,
          lead: PROSE.answersLead,
          props: { challengeId: "trap-edges-count" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: PROSE.failureExperiment,
      interactives: [
        {
          id: "trap-faults",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.faults,
          lead: PROSE.faultsLead,
          props: {
            libraryId: "machine-traps",
            program: NIGHT,
            inputs: NIGHT_INPUTS,
            shown: [2, 5],
            buses: ["IR"],
            devices: true,
            run: true,
            states: true,
            focus: ["control", "trapLogic"],
            faults: [
              {
                kind: "stuck-at",
                net: "control/TRAP",
                value: 0,
                label: LABELS.faults.trapLow,
                outcome: PROSE.faultTrap,
              },
              {
                kind: "stuck-at",
                net: "datapath/CWEN2",
                value: 0,
                label: LABELS.faults.cwenLow,
                outcome: PROSE.faultCwen,
              },
            ],
          },
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
          id: "write-traplogic",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.traplogic,
          lead: PROSE.traplogicLead,
          props: { challengeId: "traplogic-text" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "trap-edges-count",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: EDGE_ANSWERS.map((a) => ({
        id: a.id,
        label: LABELS.fields[a.id],
        kind: "text" as const,
      })),
      tests: {
        kind: "answers",
        grader: "exact",
        cases: EDGE_ANSWERS.map((a) => ({
          label: LABELS.fields[a.id],
          given: { field: a.id, form: "number", detail: a.detail },
          expect: { value: a.value },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { answers: Object.fromEntries(EDGE_ANSWERS.map((a) => [a.id, a.value])) },
    },
    {
      id: "traplogic-text",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      feedback: "words",
      interface: {
        inputs: TRAPLOGIC_INPUTS,
        outputs: [{ name: "GO" }, { name: "TRAP" }, { name: "CAUSE", width: 8 }, { name: "HALT" }],
      },
      allowedConstructs: TRAPLOGIC_CONSTRUCTS,
      tryIt: "pins",
      initial: { hdl: TRAPLOGIC_START },
      tests: { kind: "combinational", vectors: TRAPLOGIC_VECTORS },
      hints: [...PROSE.c2Hints],
      reference: { hdl: TRAPLOGIC_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "Patterson and Hennessy's multicycle datapath with exceptions: EPC and Cause registers, the IntCause selector, a fixed exception address 8000 0180 and two new states in the finite-state control for an undefined instruction and an overflow; Harris and Harris's version of the same; LC-3's interrupt and exception hardware with its supervisor stack pointer and vector table.",
    howThisDiffers:
      "The hardware is the course machine's own, added to Module 9's machine of several edges in Module 12's copy: five control registers named for their jobs, each with a selector that takes its word at a trap's edge, at `resume`'s, or from a control-register job; the trap logic in the control unit where Module 9's stop logic was, choosing the lowest cause in the order the steps run, with the waiting events taken only at an edge that would fetch; and one rule added to the controller, that an edge which traps leads to FETCH, so no new state is needed. A three-instruction program traps within twelve edges, drawn as a timing diagram; the learner predicts the PC after the trapping edge, counts the edges of a call system, a resume, an interrupt and a refused store, breaks the TRAP signal and the control registers' write enable, and writes the trap logic from Module 9's stop logic, tested on a table of seventeen rows.",
  },
};
