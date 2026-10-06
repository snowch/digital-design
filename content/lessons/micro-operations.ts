// Copyright © 2026 Christopher Snow

// Lesson: Module 9, lesson 4, micro-operations: what each edge of an instruction does, and the
// control signals that make it do so. Four views of one run, linked: the instruction as a register
// transfer, the transfers each of its edges makes, the control signals at each edge, and the
// circuit. Each edge's signal is the state's line AND what the kind needs, AND GO.
//
// The structure is here; the words are in micro-operations.prose.ts and
// micro-operations.labels.ts. The numbers the prose states are pinned by
// micro-operations.facts.test.ts.

import type { LessonInput } from "@dd/lesson-schema";

import { LABELS } from "./micro-operations.labels";
import { PROSE } from "./micro-operations.prose";
import { SENSORS } from "./memory-access";
import {
  COLDER,
  EDGE_OUTPUTS,
  MARGIN,
  OUTPUTS_REFERENCE,
  OUTPUTS_START,
  controllerText,
  edgeOutputs,
} from "./module9";

const OUTPUTS_CONSTRUCTS = [
  "module",
  "ports",
  "logic",
  "vector",
  "assign",
  "op-bitwise",
  "op-compare",
];
const CONTROLLER_CONSTRUCTS = [
  "module",
  "ports",
  "logic",
  "vector",
  "assign",
  "always_comb",
  "always_ff",
  "case",
  "if",
  "op-bitwise",
  "op-compare",
  "enum",
];

/** The signals the four views list: the controller's for the edge, then GO. */
const VIEW_SIGNALS = [...EDGE_OUTPUTS, "GO", "AZERO", "BCONST"];

const STATES = ["FETCH", "READ", "ALU", "MEMORY", "WRITE"] as const;
const CODE = { FETCH: 0, READ: 1, ALU: 2, MEMORY: 3, WRITE: 4 } as const;

/** What each kind tells the controller: a job, a load, a store, a branch or a jump, and a call. */
const KINDS = [
  { name: "a job", MEM: 0, WRITEY: 1, LOAD: 0, STORE: 0 },
  { name: "a load", MEM: 1, WRITEY: 1, LOAD: 1, STORE: 0 },
  { name: "a store", MEM: 1, WRITEY: 0, LOAD: 0, STORE: 1 },
  { name: "a branch", MEM: 0, WRITEY: 0, LOAD: 0, STORE: 0 },
] as const;

/** The output logic's tests: every state with each kind's signals, GO at 1 and at 0. */
const OUTPUTS_VECTORS = STATES.flatMap((state) =>
  KINDS.flatMap((k) =>
    [1, 0].map((go) => {
      const signals = { GO: go, MEM: k.MEM, WRITEY: k.WRITEY, LOAD: k.LOAD, STORE: k.STORE };
      return {
        label: `${state}, ${k.name}, GO ${go}`,
        inputs: { S: CODE[state], ...signals },
        expect: edgeOutputs(state, signals),
      };
    }),
  ),
);

type Step = {
  label: string;
  set: Record<string, string | number>;
  expect?: Record<string, string | number>;
};

/** The whole controller's tests: each kind's edges, the signals before every edge, a halt. */
function controllerSteps(): Step[] {
  const steps: Step[] = [
    {
      label: "RST 1, clock low",
      set: { CLK: 0, RST: 1, GO: 1, CALL: 0, MEM: 0, WRITEY: 1, LOAD: 0, STORE: 0 },
    },
    { label: "edge with RST 1: FETCH", set: { CLK: 1 }, expect: { S: 0 } },
    { label: "clock low, RST 0", set: { CLK: 0, RST: 0 } },
  ];
  const kinds: { name: string; set: Record<string, number>; states: (typeof STATES)[number][] }[] =
    [
      {
        name: "a load",
        set: { CALL: 0, MEM: 1, WRITEY: 1, LOAD: 1, STORE: 0 },
        states: ["FETCH", "READ", "ALU", "MEMORY", "WRITE"],
      },
      {
        name: "a store",
        set: { CALL: 0, MEM: 1, WRITEY: 0, LOAD: 0, STORE: 1 },
        states: ["FETCH", "READ", "ALU", "MEMORY"],
      },
      {
        name: "a branch",
        set: { CALL: 0, MEM: 0, WRITEY: 0, LOAD: 0, STORE: 0 },
        states: ["FETCH", "READ", "ALU"],
      },
      {
        name: "a call",
        set: { CALL: 1, MEM: 0, WRITEY: 1, LOAD: 0, STORE: 0 },
        states: ["FETCH", "READ", "WRITE"],
      },
    ];
  for (const k of kinds)
    k.states.forEach((st, i) => {
      const next = k.states[i + 1] ?? "FETCH";
      const signals = {
        GO: 1,
        MEM: k.set["MEM"] ?? 0,
        WRITEY: k.set["WRITEY"] ?? 0,
        LOAD: k.set["LOAD"] ?? 0,
        STORE: k.set["STORE"] ?? 0,
      };
      steps.push({
        label: `${k.name}: clock low in ${st}`,
        set: { CLK: 0, ...k.set },
        expect: { S: CODE[st], ...edgeOutputs(st, signals) },
      });
      steps.push({
        label: `${k.name}: edge to ${next}`,
        set: { CLK: 1 },
        expect: { S: CODE[next] },
      });
    });
  steps.push(
    {
      label: "a stop: clock low in FETCH",
      set: { CLK: 0, CALL: 0, MEM: 0, WRITEY: 0, LOAD: 0, STORE: 0 },
    },
    { label: "a stop: edge to READ", set: { CLK: 1 }, expect: { S: CODE.READ } },
    {
      label: "a stop: GO falls while the clock is high",
      set: { GO: 0 },
      expect: { S: CODE.READ, HOLDAB: 0, CHECKING: 1 },
    },
    { label: "a stop: clock low", set: { CLK: 0 }, expect: { S: CODE.READ } },
    { label: "a stop: edge with GO 0, READ kept", set: { CLK: 1 }, expect: { S: CODE.READ } },
  );
  return steps;
}

export const microOperations: LessonInput = {
  id: "micro-operations",
  title: LABELS.title,
  module: 9,
  order: 4,
  objectives: [...LABELS.objectives],
  introduces: ["micro-operation"],
  sections: [
    { kind: "question", title: LABELS.titles.question, prose: PROSE.question },
    { kind: "motivation", title: LABELS.titles.motivation, prose: PROSE.motivation },
    {
      kind: "prediction",
      title: LABELS.titles.prediction,
      prose: PROSE.prediction,
      interactives: [
        {
          id: "predict-took",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.predictTook,
          props: {
            libraryId: "machine-edges",
            program: MARGIN,
            edges: 2,
            shown: [1],
            microOps: true,
            question: PROSE.p1Question,
            options: [
              { value: "IR", label: LABELS.options.p1Ir },
              { value: "HR", label: LABELS.options.p1Hr },
              { value: "R1", label: LABELS.options.p1R1 },
            ],
            ask: "took",
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
          id: "four-views",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.fourViews,
          lead: PROSE.fourViewsLead,
          after: PROSE.fourViewsAfter,
          props: {
            libraryId: "machine-edges",
            program: COLDER,
            inputs: SENSORS,
            shown: [2, 3],
            buses: ["IR", "HR", "HM"],
            devices: true,
            run: true,
            microOps: true,
            signals: VIEW_SIGNALS,
            states: true,
            timing: ["IREN", "HOLDAB", "HOLDR", "HOLDM", "WREG", "PCEN"],
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
          id: "write-outputs",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.writeOutputs,
          lead: PROSE.writeOutputsLead,
          props: { challengeId: "outputs-text" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "signal-faults",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.signalFaults,
          lead: PROSE.signalFaultsLead,
          props: {
            outcomes: PROSE.signalFaultsOutcomes,
            libraryId: "machine-edges",
            program: MARGIN,
            shown: [1, 2, 3],
            devices: true,
            run: true,
            microOps: true,
            faults: [
              {
                kind: "stuck-at",
                net: "control/PCEN",
                at: [28, 35],
                value: 1,
                label: LABELS.faults.pcenHigh,
              },
              {
                kind: "stuck-at",
                net: "control/MSTORE",
                at: [28, 35],
                value: 0,
                label: LABELS.faults.mstoreLow,
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
          id: "write-controller",
          kind: "challenge",
          timeModel: "clocked",
          caption: LABELS.captions.writeController,
          lead: PROSE.writeControllerLead,
          props: { challengeId: "controller-text" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "outputs-text",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "write",
      interface: {
        inputs: [
          { name: "S", width: 3 },
          { name: "GO" },
          { name: "MEM" },
          { name: "WRITEY" },
          { name: "LOAD" },
          { name: "STORE" },
        ],
        outputs: EDGE_OUTPUTS.map((name) => ({ name })),
      },
      allowedConstructs: OUTPUTS_CONSTRUCTS,
      tryIt: "pins",
      initial: { hdl: OUTPUTS_START },
      tests: { kind: "combinational", vectors: OUTPUTS_VECTORS },
      hints: [...PROSE.c1Hints],
      reference: { hdl: OUTPUTS_REFERENCE },
    },
    {
      id: "controller-text",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      interface: {
        inputs: [
          { name: "CLK" },
          { name: "RST" },
          { name: "GO" },
          { name: "CALL" },
          { name: "MEM" },
          { name: "WRITEY" },
          { name: "LOAD" },
          { name: "STORE" },
        ],
        outputs: [...EDGE_OUTPUTS.map((name) => ({ name })), { name: "S", width: 3 }],
      },
      allowedConstructs: CONTROLLER_CONSTRUCTS,
      tryIt: "pins",
      // The start: the next-state logic of lesson 3, and every output of the edge 0.
      initial: {
        hdl: controllerText().replace(/assign (?!S =)(\w+) = [^;]*;/g, "assign $1 = 1'b0;"),
      },
      tests: { kind: "sequence", steps: controllerSteps() },
      hints: [...PROSE.c2Hints],
      reference: { hdl: controllerText() },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "Micro-operations written as register transfers under timing signals (Mano's T0: AR ← PC, T1: IR ← M[AR], PC ← PC + 1, and each instruction's sequence as a list of timed transfers); Patterson and Hennessy's finite-state control with each state's signal values written inside its bubble, and its microprogram; Tanenbaum's Mic-1 microinstructions in MAL.",
    howThisDiffers:
      "The transfers are read off the machine's own nets as it runs, edge by edge, never listed by hand: the view names the state, the transfers the coming edge makes (IR ← memory[PC], HA ← RA and HB ← RB, HR ← HA job HB, HM ← word[HR], RY ← HR and PC ← PC + 4) and the signals that make them, beside the state diagram, a timing diagram and the circuit, all from one simulator. The PC is not incremented at the fetch (unlike Mano's PC ← PC + 1 and Patterson and Hennessy's state 0), and there is no address register: the memory's address is chosen from the PC and HR. Each signal is the state's line AND what the decoder says the kind needs, AND GO, written as the output logic of Module 5's state machine; no microprogram or control store is used or shown. The prediction asks which register the third edge of R1 ← -184 writes; the faults let the PC move at every edge and stop a store's write.",
  },
};
