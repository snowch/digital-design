// Copyright © 2026 Christopher Snow

// Lesson: Module 8, lesson 5, branches, the call and the jump: the condition from the ALU's flags,
// the next PC chosen from PC + 4, PC + 4c and the ALU's result, and the call's return address
// written into a register. The datapath is whole; its capstone steps one instruction through
// every change it makes.
//
// The structure is here; the words are in branches.prose.ts and branches.labels.ts. The numbers
// the prose states are pinned by branches.facts.test.ts, read off the figures' props.

import { alu64, assemble, branchTaken, resetMachine, run } from "@dd/dd-model";
import type { LessonInput } from "@dd/lesson-schema";

import { LABELS } from "./branches.labels";
import { PROSE } from "./branches.prose";
import { SENSORS } from "./memory-access";
import {
  CONDITION_REFERENCE,
  CONDITION_START,
  DATAPATH_CONSTRUCTS,
  DATAPATH_TEXT,
  NEXT_START,
} from "./module8";

/** docs/isa.md's worked example, with its target written as an address. */
export const COLDER = `R2 <= word[sensorA]
R3 <= word[sensorB]
if R2 < R3 signed goto 0x010
R2 <= R3
word[display] <= R2
stop`;

/** A loop: 5 + 4 + 3 + 2 + 1 on the display, counting R1 down to R0's 0. */
export const SUM = `R1 <= 5
R2 <= 0
R0 <= 0
R2 <= R2 + R1
R1 <= R1 - 1
if R1 != R0 goto 0x00C
word[display] <= R2
stop`;

/** A call to a loop and back: 3 + 2 + 1 on the display, R15 holding the way back. */
export const CALL = `R2 <= 0
R1 <= 3
R0 <= 0
call 0x018, R15
word[display] <= R2
stop
R2 <= R2 + R1
R1 <= R1 - 1
if R1 != R0 goto 0x018
goto R15`;

const CONDITION_CONSTRUCTS = [
  "module",
  "ports",
  "logic",
  "vector",
  "assign",
  "select",
  "op-bitwise",
  "always_comb",
  "case",
];

const MASK = (1n << 64n) - 1n;
const w = (v: bigint) => v & MASK;

/** The comparisons the condition's tests make: A - B, with each job's answer from the reference. */
const PAIRS: readonly [string, bigint, bigint][] = [
  ["-184 and -250", -184n, -250n],
  ["-250 and -184", -250n, -184n],
  ["5 and 5", 5n, 5n],
  ["1 and -1", 1n, -1n],
];
const CONDITION_VECTORS = PAIRS.flatMap(([label, a, b]) => {
  const f = alu64(3, w(a), w(b));
  return [0, 1, 2, 3, 4, 5, 6, 7].map((j) => ({
    label: `job ${j}, A and B ${label}`,
    inputs: { J: j, ZERO: f.zero, MINUS: f.minus, COUT: f.cout, OVER: f.over },
    expect: { MET: branchTaken(j, f) ? 1 : 0 },
  }));
});

const h64 = (v: bigint) => `0x${w(v).toString(16).toUpperCase()}`;

/** The whole text's tests: the call program from reset, PC after every edge as the reference has it. */
type Step = {
  label: string;
  set: Record<string, string | number>;
  expect?: Record<string, string | number>;
};

function nextSteps(): Step[] {
  const { records } = run(resetMachine(assemble(CALL).rom));
  return [
    {
      label: "RST 1, clock low",
      set: { CLK: 0, RST: 1, DOOR: 0, WARM: 0, SENSORA: "0x0", SENSORB: "0x0" },
    },
    { label: "edge with RST 1: PC is 000", set: { CLK: 1 }, expect: { PC: h64(0n) } },
    { label: "clock low, RST 0", set: { CLK: 0, RST: 0 } },
    ...records
      .filter((r) => !r.stopped)
      .flatMap((r, k) => [
        {
          label: `edge ${k + 1}, after ${r.pc.toString(16).toUpperCase().padStart(3, "0")}: PC is ${r.nextPc.toString(16).toUpperCase().padStart(3, "0")}`,
          set: { CLK: 1 },
          expect: { PC: h64(r.nextPc) },
        },
        { label: "clock low", set: { CLK: 0 } },
      ]),
    {
      label: "at the stop: HALT is 1, the display shows 6",
      set: {},
      expect: { HALT: 1, DISPLAY: h64(6n) },
    },
  ];
}

export const branches: LessonInput = {
  id: "branches",
  title: LABELS.title,
  module: 8,
  order: 5,
  objectives: [...LABELS.objectives],
  introduces: ["branch"],
  sections: [
    { kind: "question", title: LABELS.titles.question, prose: PROSE.question },
    { kind: "motivation", title: LABELS.titles.motivation, prose: PROSE.motivation },
    {
      kind: "prediction",
      title: LABELS.titles.prediction,
      prose: PROSE.prediction,
      interactives: [
        {
          id: "predict-branch",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.predictBranch,
          props: {
            libraryId: "datapath-full",
            program: COLDER,
            inputs: SENSORS,
            edges: 2,
            shown: [2, 3],
            buses: ["RESULT", "PC4", "NEXT"],
            question: PROSE.p1Question,
            options: [
              { value: "00C", label: LABELS.options.p1Next },
              { value: "010", label: LABELS.options.p1Target },
            ],
            ask: "pc",
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
          id: "sum",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.sum,
          lead: PROSE.sumLead,
          after: PROSE.sumAfter,
          props: {
            libraryId: "datapath-full",
            program: SUM,
            shown: [0, 1, 2],
            buses: ["RESULT", "PC4", "NEXT"],
            devices: true,
            run: true,
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
          id: "write-condition",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.writeCondition,
          lead: PROSE.writeConditionLead,
          props: { challengeId: "condition-text" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "branch-faults",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.branchFaults,
          lead: PROSE.branchFaultsLead,
          props: {
            outcomes: PROSE.branchFaultsAfter,
            libraryId: "datapath-full",
            program: SUM,
            shown: [0, 1, 2],
            buses: ["RESULT", "NEXT"],
            devices: true,
            run: true,
            faults: [
              {
                kind: "stuck-at",
                net: "MET",
                value: 1,
                at: [52, 20],
                label: LABELS.faults.metHigh,
              },
              { kind: "stuck-at", net: "MET", value: 0, at: [52, 20], label: LABELS.faults.metLow },
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
          id: "one-instruction",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.oneInstruction,
          lead: PROSE.oneInstructionLead,
          after: PROSE.oneInstructionAfter,
          props: {
            libraryId: "datapath-full",
            program: COLDER,
            inputs: SENSORS,
            edges: 1,
            shown: [2, 3],
            buses: ["QA", "QB", "RESULT", "PC4", "NEXT"],
            steps: true,
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
          id: "call",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.call,
          lead: PROSE.callLead,
          after: PROSE.callAfter,
          props: {
            libraryId: "datapath-full",
            program: CALL,
            shown: [1, 2, 15],
            buses: ["RESULT", "PC4", "NEXT", "YIN"],
            devices: true,
            run: true,
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
          id: "write-next",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.writeNext,
          lead: PROSE.writeNextLead,
          props: { challengeId: "next-text" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "condition-text",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "write",
      interface: {
        inputs: [
          { name: "J", width: 4 },
          { name: "ZERO" },
          { name: "MINUS" },
          { name: "COUT" },
          { name: "OVER" },
        ],
        outputs: [{ name: "MET" }],
      },
      allowedConstructs: CONDITION_CONSTRUCTS,
      tryIt: "pins",
      initial: { hdl: CONDITION_START },
      tests: { kind: "combinational", vectors: CONDITION_VECTORS },
      hints: [...PROSE.c1Hints],
      reference: { hdl: CONDITION_REFERENCE },
    },
    {
      id: "next-text",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      interface: {
        inputs: [
          { name: "CLK" },
          { name: "RST" },
          { name: "DOOR" },
          { name: "WARM" },
          { name: "SENSORA", width: 64 },
          { name: "SENSORB", width: 64 },
        ],
        outputs: [
          { name: "PC", width: 64 },
          { name: "HALT" },
          { name: "CAUSE", width: 8 },
          { name: "DISPLAY", width: 64 },
          { name: "LAMPS", width: 3 },
        ],
      },
      allowedConstructs: DATAPATH_CONSTRUCTS,
      courseModules: { set: "machine", program: CALL },
      tryIt: "pins",
      initial: { hdl: NEXT_START },
      tests: { kind: "sequence", steps: nextSteps() },
      hints: [...PROSE.c2Hints],
      reference: { hdl: DATAPATH_TEXT },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "The branch-if-equal added to the single-cycle datapath: the ALU subtracts, its Zero output ANDed with a Branch control signal chooses PC + 4 or the sign-extended offset shifted left by 2 (Patterson and Hennessy's PCSrc, Harris and Harris's beq), followed by the jump with its pseudo-direct address; Nand2Tetris's jump bits j1 j2 j3 against zr and ng.",
    howThisDiffers:
      "Eight conditions from the course's four flags, one job digit choosing them (equal, differ, less and not less, unsigned and signed, always and never), worked out by a condition block the learner writes; the target counts instructions from the branch itself (PC + 4c), and the call keeps its return address in any register the Y digit names. The prediction is docs/isa.md's worked example, the shop's question of which room is colder, with the course's numbers: -184 - (-250) = 66, so the signed less-than is not taken. The capstone steps one edge of that example, the load at 004, through every change it makes as the branch at 008 arrives and settles, read off the settle model's own history. The faults hold the condition's output at 1 and at 0 on a loop that adds 5 + 4 + 3 + 2 + 1: one loop never ends, the other runs once. The control signal BRANCH has the name of Patterson and Hennessy's and Harris and Harris's Branch signal; it is named, as LOAD, STORE, CALL and JUMP are, after the kind of instruction that sets it. The completed text is the course's own datapath, its next PC chosen by an always_comb the learner writes, tested on a call to a loop and back.",
  },
};
