// Copyright © 2026 Christopher Snow

// Lesson: Module 9, lesson 3, several edges an instruction: one memory port, so the instruction
// must be kept in a register while the memory's address moves on to the data; registers that hold
// each step's words for the next edge; and a controller, Module 5's state machine, whose state says
// which step the edge makes: FETCH, READ, ALU, MEMORY, WRITE, as many as the kind needs.
//
// The structure is here; the words are in several-edges.prose.ts and several-edges.labels.ts. The
// numbers the prose states are pinned by several-edges.facts.test.ts.

import type { LessonInput } from "@dd/lesson-schema";

import { LABELS } from "./several-edges.labels";
import { PROSE } from "./several-edges.prose";
import { SENSORS } from "./memory-access";
import {
  COLDER,
  FETCHPORT_REFERENCE,
  MARGIN,
  FETCHPORT_START,
  STATES_REFERENCE,
  STATES_START,
} from "./module9";

const FETCHPORT_CONSTRUCTS = [
  "module",
  "ports",
  "logic",
  "vector",
  "assign",
  "always_comb",
  "always_ff",
  "case",
  "if",
];
const STATES_CONSTRUCTS = [
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
  "enum",
];

type Step = {
  label: string;
  set: Record<string, string | number>;
  expect?: Record<string, string | number>;
};

const h = (v: number | bigint, digits = 1) =>
  `0x${v.toString(16).toUpperCase().padStart(digits, "0")}`;

/** The fetch port's tests: the PC's address and the IR taken at a fetch edge, then held. */
const FETCHPORT_STEPS: Step[] = [
  {
    label: "RST 1, clock low",
    set: { CLK: 0, RST: 1, FETCHING: 1, IREN: 0, PC: "0x0", HR: "0x0", FETCHED: "0x380027D8" },
  },
  { label: "edge with RST 1: IR is 0", set: { CLK: 1 }, expect: { IR: h(0) } },
  {
    label: "fetching, clock low: the address is PC",
    set: { CLK: 0, RST: 0, IREN: 1, PC: "0x8", HR: "0x7D8" },
    expect: { ADDR: h(8) },
  },
  { label: "fetch edge: IR takes 380027D8", set: { CLK: 1 }, expect: { IR: h(0x380027d8) } },
  {
    label: "clock low, not fetching: the address is HR",
    set: { CLK: 0, FETCHING: 0, IREN: 0, FETCHED: "0x0" },
    expect: { ADDR: h(0x7d8), IR: h(0x380027d8) },
  },
  { label: "edge with IREN 0: IR keeps 380027D8", set: { CLK: 1 }, expect: { IR: h(0x380027d8) } },
  {
    label: "IREN rises while the clock is high: IR keeps 380027D8",
    set: { IREN: 1, FETCHED: "0x84000000" },
    expect: { IR: h(0x380027d8) },
  },
  { label: "clock low", set: { CLK: 0, FETCHING: 1 }, expect: { ADDR: h(8), IR: h(0x380027d8) } },
  { label: "edge with IREN 1: IR takes 84000000", set: { CLK: 1 }, expect: { IR: h(0x84000000) } },
];

const CODE = { FETCH: 0, READ: 1, ALU: 2, MEMORY: 3, WRITE: 4 } as const;
type State = keyof typeof CODE;

/** One instruction's edges through the controller: its kind's signals, then each state in turn. */
function through(
  label: string,
  signals: { CALL: number; MEM: number; WRITEY: number },
  states: State[],
): Step[] {
  const steps: Step[] = [];
  states.forEach((st, k) => {
    const next = states[k + 1] ?? "FETCH";
    steps.push({
      label: `${label}: clock low in ${st}`,
      set: { CLK: 0, ...signals },
      expect: { S: CODE[st] },
    });
    steps.push({
      label: `${label}: edge, ${st} to ${next}`,
      set: { CLK: 1 },
      expect: { S: CODE[next] },
    });
  });
  return steps;
}

/** The controller's tests: a reset, then each kind's way through, a halt and a change at a high clock. */
const STATES_STEPS: Step[] = [
  { label: "RST 1, clock low", set: { CLK: 0, RST: 1, GO: 1, CALL: 0, MEM: 0, WRITEY: 1 } },
  { label: "edge with RST 1: FETCH", set: { CLK: 1 }, expect: { S: CODE.FETCH } },
  { label: "clock low, RST 0", set: { CLK: 0, RST: 0 }, expect: { S: CODE.FETCH } },
  ...through("a register job", { CALL: 0, MEM: 0, WRITEY: 1 }, ["FETCH", "READ", "ALU", "WRITE"]),
  ...through("a load", { CALL: 0, MEM: 1, WRITEY: 1 }, ["FETCH", "READ", "ALU", "MEMORY", "WRITE"]),
  ...through("a store", { CALL: 0, MEM: 1, WRITEY: 0 }, ["FETCH", "READ", "ALU", "MEMORY"]),
  ...through("a branch", { CALL: 0, MEM: 0, WRITEY: 0 }, ["FETCH", "READ", "ALU"]),
  ...through("a call", { CALL: 1, MEM: 0, WRITEY: 1 }, ["FETCH", "READ", "WRITE"]),
  { label: "a stop: clock low in FETCH", set: { CLK: 0, CALL: 0, MEM: 0, WRITEY: 0 } },
  { label: "a stop: edge, FETCH to READ", set: { CLK: 1 }, expect: { S: CODE.READ } },
  { label: "a stop: GO falls while the clock is high", set: { GO: 0 }, expect: { S: CODE.READ } },
  { label: "a stop: clock low, GO 0", set: { CLK: 0 }, expect: { S: CODE.READ } },
  { label: "a stop: edge with GO 0, READ kept", set: { CLK: 1 }, expect: { S: CODE.READ } },
];

export const severalEdges: LessonInput = {
  id: "several-edges",
  title: LABELS.title,
  module: 9,
  order: 3,
  objectives: [...LABELS.objectives],
  introduces: ["instruction register"],
  sections: [
    { kind: "question", title: LABELS.titles.question, prose: PROSE.question },
    { kind: "motivation", title: LABELS.titles.motivation, prose: PROSE.motivation },
    {
      kind: "prediction",
      title: LABELS.titles.prediction,
      prose: PROSE.prediction,
      interactives: [
        {
          id: "predict-load-edges",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.predictLoadEdges,
          props: {
            libraryId: "machine-edges",
            program: COLDER,
            inputs: SENSORS,
            shown: [2, 3],
            buses: ["IR", "HR"],
            question: PROSE.p1Question,
            options: [
              { value: "1", label: LABELS.options.p1One },
              { value: "3", label: LABELS.options.p1Three },
              { value: "5", label: LABELS.options.p1Five },
            ],
            ask: "edges",
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
          id: "colder-edges",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.colderEdges,
          lead: PROSE.colderEdgesLead,
          props: {
            outcomes: PROSE.colderEdgesAfter,
            libraryId: "machine-edges",
            program: COLDER,
            inputs: SENSORS,
            shown: [2, 3],
            buses: ["IR", "HA", "HB", "HR", "HM"],
            devices: true,
            run: true,
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
          id: "write-fetchport",
          kind: "challenge",
          timeModel: "clocked",
          caption: LABELS.captions.writeFetchport,
          lead: PROSE.writeFetchportLead,
          props: { challengeId: "fetchport-text" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "edge-faults",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.edgeFaults,
          lead: PROSE.edgeFaultsLead,
          props: {
            libraryId: "machine-edges",
            program: MARGIN,
            shown: [1, 2, 3],
            buses: ["IR", "ADDR"],
            devices: true,
            run: true,
            states: true,
            faults: [
              {
                kind: "stuck-at",
                net: "control/FETCHING",
                at: [28, 35],
                value: 1,
                label: LABELS.faults.fetchingHigh,
                outcome: PROSE.edgeFaultFetching,
              },
              {
                kind: "stuck-at",
                net: "control/controller/nextState/R4",
                value: 0,
                label: LABELS.faults.memoryRowLow,
                outcome: PROSE.edgeFaultRow,
              },
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
          id: "controller",
          kind: "state-machine",
          timeModel: "clocked",
          caption: LABELS.captions.controller,
          lead: PROSE.controllerLead,
          after: PROSE.controllerAfter,
          // After a reset, in FETCH, as Module 5's machines start in their reset state: from the
          // register's unknown first value no setting of the inputs would move it.
          props: {
            machine: "controller",
            show: ["diagram", "table", "trace"],
            prime: [{ set: { RST: 1 }, clock: "CLK" }, { set: { RST: 0 } }],
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
          id: "kind-edges",
          kind: "kind-edges",
          timeModel: "clocked",
          caption: LABELS.captions.kindEdges,
          lead: PROSE.kindEdgesLead,
          after: PROSE.kindEdgesAfter,
          props: {},
        },
      ],
    },
    {
      kind: "challenge",
      title: LABELS.titles.challenge,
      prose: "",
      interactives: [
        {
          id: "write-states",
          kind: "challenge",
          timeModel: "clocked",
          caption: LABELS.captions.writeStates,
          lead: PROSE.writeStatesLead,
          props: { challengeId: "states-text" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "fetchport-text",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "write",
      feedback: "words",
      interface: {
        inputs: [
          { name: "CLK" },
          { name: "RST" },
          { name: "FETCHING" },
          { name: "IREN" },
          { name: "PC", width: 64 },
          { name: "HR", width: 64 },
          { name: "FETCHED", width: 32 },
        ],
        outputs: [
          { name: "ADDR", width: 64 },
          { name: "IR", width: 32 },
        ],
      },
      allowedConstructs: FETCHPORT_CONSTRUCTS,
      tryIt: "pins",
      initial: { hdl: FETCHPORT_START },
      tests: { kind: "sequence", steps: FETCHPORT_STEPS },
      hints: [...PROSE.c1Hints],
      reference: { hdl: FETCHPORT_REFERENCE },
    },
    {
      id: "states-text",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      feedback: "words",
      interface: {
        inputs: [
          { name: "CLK" },
          { name: "RST" },
          { name: "GO" },
          { name: "CALL" },
          { name: "MEM" },
          { name: "WRITEY" },
        ],
        outputs: [{ name: "S", width: 3 }],
      },
      allowedConstructs: STATES_CONSTRUCTS,
      tryIt: "pins",
      initial: { hdl: STATES_START },
      tests: { kind: "sequence", steps: STATES_STEPS },
      hints: [...PROSE.c2Hints],
      reference: { hdl: STATES_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "Patterson and Hennessy's multicycle datapath, with its registers IR, MDR, A, B and ALUOut, the signals IorD, IRWrite, PCWrite, ALUSrcA and ALUSrcB, and the finite-state control of states 0 to 9 (instruction fetch, which also writes PC + 4, then decode and register fetch, then per-class execution states); Harris and Harris's multicycle processor with its states Fetch, Decode, MemAdr, MemRead, MemWB, MemWrite, ExecuteR, ALUWB and BEQ; Mano's timing signals T0, T1 and T2 for the fetch.",
    howThisDiffers:
      "The machine is the course's own, Module 8's datapath split at its one memory port: the held words are named HA, HB, HR and HM after what they hold, the IR's enable is IREN, and the controller has five states named for the step each edge makes (FETCH, READ, ALU, MEMORY, WRITE), the same five for every kind: the kind decides which it passes through, from three of the decoder's signals (CALL, MEM, WRITEY), so a branch and a jump end at the ALU edge and a call skips it, with no state for one class of instruction. The PC keeps the instruction's address until the edge that ends it, where it takes Module 8's next PC, so the fetch does not add 4 and a stop leaves the PC on the instruction. The controller is drawn and run as Module 5's state machine (its diagram, its encoded table, its trace), and the edges are counted from the simulator. The prediction asks for the edges of docs/isa.md's worked example's first load; the faults keep the memory's address on the PC, and break the row of the controller's table that leads to the memory step, on the office's margin.",
  },
};
