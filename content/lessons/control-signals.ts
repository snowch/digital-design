// Copyright © 2026 Christopher Snow

// Lesson: Module 9, lesson 1, control signals: the decoder Module 8 drew closed, opened. One line
// per kind, from Module 3's 2-to-4 decoder twice, and each control signal an OR of the kinds that
// need it, with a job bit ANDed in where the job matters. The decoder's rows as a table, kind by
// kind, read off its own circuit; the learner writes two signals, then all twelve as a `case`.
//
// The structure is here; the words are in control-signals.prose.ts and control-signals.labels.ts.
// The numbers the prose states are pinned by control-signals.facts.test.ts.

import type { LessonInput } from "@dd/lesson-schema";

import { LABELS } from "./control-signals.labels";
import { PROSE } from "./control-signals.prose";
import {
  SIGNALS_9_1,
  WRITES_REFERENCE,
  WRITES_START,
  decoderVectors,
  signalsModule,
  type DecoderCase,
} from "./module9";

const WRITES_CONSTRUCTS = [
  "module",
  "ports",
  "logic",
  "vector",
  "assign",
  "op-bitwise",
  "op-compare",
];
const SIGNALS_CONSTRUCTS = [
  "module",
  "ports",
  "logic",
  "vector",
  "assign",
  "select",
  "always_comb",
  "case",
];

/** Every kind the machine has, and kind 0 and kind F, which it has not. */
const KIND_CASES: DecoderCase[] = Array.from({ length: 16 }, (_, k) => ({
  label: `K ${k.toString(16).toUpperCase()}`,
  K: k,
  J: 0,
}));

/** Each kind with every job it defines (docs/isa.md), and the system jobs. */
export const JOB_CASES: DecoderCase[] = [
  ...[0, 1, 2, 3, 4, 5, 6, 7].flatMap((j) => [
    { label: `register job ${j}`, K: 1, J: j },
    { label: `constant job ${j}`, K: 2, J: j },
    { label: `branch job ${j}`, K: 5, J: j },
  ]),
  ...[0, 1, 8, 9].flatMap((j) => [
    { label: `load job ${j}`, K: 3, J: j },
    { label: `store job ${j}`, K: 4, J: j },
  ]),
  { label: "call", K: 6, J: 0 },
  { label: "jump", K: 7, J: 0 },
  ...[0, 1, 2, 3, 4].map((j) => ({ label: `system job ${j}`, K: 8, J: j })),
];

/** The fault lab's checks: one instruction of each kind the machine has. */
const FAULT_RUN = [
  { label: LABELS.checks.subtract, set: { K: 1, J: 3, C: 0 } },
  { label: LABELS.checks.addConstant, set: { K: 2, J: 2, C: 0 } },
  { label: LABELS.checks.load, set: { K: 3, J: 0, C: 0 } },
  { label: LABELS.checks.store, set: { K: 4, J: 8, C: 0 } },
  { label: LABELS.checks.branch, set: { K: 5, J: 6, C: 0 } },
  { label: LABELS.checks.call, set: { K: 6, J: 0, C: 0 } },
  { label: LABELS.checks.jump, set: { K: 7, J: 0, C: 0 } },
];

export const controlSignals: LessonInput = {
  id: "control-signals",
  title: LABELS.title,
  module: 9,
  order: 1,
  objectives: [...LABELS.objectives],
  introduces: ["control unit"],
  sections: [
    { kind: "question", title: LABELS.titles.question, prose: PROSE.question },
    { kind: "motivation", title: LABELS.titles.motivation, prose: PROSE.motivation },
    {
      kind: "prediction",
      title: LABELS.titles.prediction,
      prose: PROSE.prediction,
      interactives: [
        {
          id: "predict-jump",
          kind: "prediction",
          timeModel: "settle",
          caption: LABELS.captions.predictJump,
          props: {
            question: PROSE.p1Question,
            libraryId: "decoder",
            run: [{ set: { K: 7, J: 0, C: 0 } }],
            watch: "BCONST",
            options: [
              { value: "0", label: LABELS.options.p1Zero },
              { value: "1", label: LABELS.options.p1One },
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
          id: "decoder-open",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.decoderOpen,
          lead: PROSE.decoderOpenLead,
          after: PROSE.decoderOpenAfter,
          props: { libraryId: "decoder", initial: { K: 1, J: 3, C: 0 } },
        },
      ],
    },
    {
      kind: "construction",
      title: LABELS.titles.construction,
      prose: PROSE.construction,
      interactives: [
        {
          id: "write-writes",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.writeWrites,
          lead: PROSE.writeWritesLead,
          props: { challengeId: "writes-text" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "decoder-faults",
          kind: "fault-lab",
          timeModel: "settle",
          caption: LABELS.captions.decoderFaults,
          lead: PROSE.decoderFaultsLead,
          props: {
            libraryId: "decoder",
            faults: [
              {
                kind: "wrong-gate",
                path: "decoder/signals/orOp0",
                gate: "and",
                label: LABELS.faults.op0And,
                outcome: PROSE.decoderFaultsOutcomesFault1,
              },
              {
                kind: "stuck-at",
                net: "LOAD",
                value: 0,
                label: LABELS.faults.loadLow,
                outcome: PROSE.decoderFaultsOutcomesFault2,
              },
            ],
            run: FAULT_RUN,
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
          id: "signals-table",
          kind: "control-table",
          timeModel: "settle",
          caption: LABELS.captions.signalsTable,
          lead: PROSE.signalsTableLead,
          after: PROSE.signalsTableAfter,
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
          id: "write-signals",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.writeSignals,
          lead: PROSE.writeSignalsLead,
          props: { challengeId: "signals-text" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "writes-text",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "write",
      feedback: "words",
      interface: {
        inputs: [{ name: "K", width: 4 }],
        outputs: [{ name: "WRITEY" }, { name: "BCONST" }],
      },
      allowedConstructs: WRITES_CONSTRUCTS,
      initial: { hdl: WRITES_START },
      tests: {
        kind: "combinational",
        vectors: decoderVectors(KIND_CASES, ["K"], ["WRITEY", "BCONST"]),
      },
      hints: [...PROSE.c1Hints],
      reference: { hdl: WRITES_REFERENCE },
    },
    {
      id: "signals-text",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      feedback: "words",
      interface: {
        inputs: [
          { name: "K", width: 4 },
          { name: "J", width: 4 },
        ],
        outputs: SIGNALS_9_1.map((name) => ({ name })),
      },
      allowedConstructs: SIGNALS_CONSTRUCTS,
      tryIt: "pins",
      initial: { hdl: signalsModule([1, 2]) },
      tests: {
        kind: "combinational",
        vectors: decoderVectors(JOB_CASES, ["K", "J"], SIGNALS_9_1),
      },
      hints: [...PROSE.c2Hints],
      reference: { hdl: signalsModule([1, 2, 3, 4, 5, 6, 7]) },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "The single-cycle datapath's main control unit as a truth table of the opcode's six bits against the signals RegDst, ALUSrc, MemtoReg, RegWrite, MemRead, MemWrite, Branch and ALUOp, with a second, ALU control unit decoding the funct field (Patterson and Hennessy); Harris and Harris's main decoder and ALU decoder, the same split; Nand2Tetris's C-instruction, whose bits are the control signals with no decoder at all.",
    howThisDiffers:
      "The decoder is Module 8's own, drawn closed there and opened here, with the course's signal names (WRITEY, BCONST, AZERO, LOAD, STORE, BYTE, BRANCH, CALL, JUMP and the ALU's code OP2 to OP0). It is built as Module 5 built next-state logic from a table: Module 3's 2-to-4 decoder twice gives one line per kind, a kind line that is a signal on its own carries the signal's name, and each other signal is an OR of the kinds that need it, with a job bit ANDed in where the job matters; there is no separate ALU decoder, since the job digit is the ALU's code. The table of signals is read off that circuit, kind by kind, after the learner has opened it, and shows the job's bits where a signal follows them. The prediction asks about the jump's BCONST, which a learner who thinks a jump reads only a register gets wrong. The faults break one gate (a row of the table) and one kind's line (a column).",
  },
};
