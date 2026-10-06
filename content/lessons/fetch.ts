// Copyright © 2026 Christopher Snow

// Lesson: Module 8, lesson 3, fetch: the program in the ROM, the program counter that names the
// next instruction, PC + 4 at every edge, the decoder the course supplies (closed until Module 9)
// setting the control signals the learner set by hand, and the checks that stop the machine.
//
// The structure is here; the words are in fetch.prose.ts and fetch.labels.ts. The numbers the
// prose states are pinned by fetch.facts.test.ts, read off the figures' props.

import type { LessonInput } from "@dd/lesson-schema";

import { LABELS } from "./fetch.labels";
import { PROSE } from "./fetch.prose";
import { CHECKS_REFERENCE, CHECKS_START, PC_REFERENCE, PC_START } from "./module8";

const PC_CONSTRUCTS = ["module", "ports", "logic", "vector", "always_ff", "if", "op-arith"];
const CHECKS_CONSTRUCTS = [
  "module",
  "ports",
  "logic",
  "vector",
  "assign",
  "select",
  "always_comb",
  "if",
  "op-compare",
];

/** The fetch checks' tests: in the ROM and a multiple of 4, not a multiple of 4, outside it. */
const CHECKS_VECTORS = (
  [
    [0x000n, 0x00],
    [0x004n, 0x00],
    [0x3fcn, 0x00],
    [0x002n, 0x12],
    [0x3ffn, 0x12],
    [0x400n, 0x11],
    [0x402n, 0x11],
    [0x7c0n, 0x11],
    [0xfffffffffffffffcn, 0x11],
  ] as const
).map(([pc, cause]) => ({
  label: `PC ${pc.toString(16).toUpperCase().padStart(3, "0")}`,
  inputs: { PC: `0x${pc.toString(16).toUpperCase()}` },
  expect: { CAUSEF: `0x${cause.toString(16).toUpperCase()}` },
}));

/** The office's margin: how far room A is above the limit, and twice that. */
export const MARGIN = `R1 <= -184
R2 <= -250
R3 <= R1 - R2
R4 <= R3 + R3
stop`;

/** Two instructions and no `stop`: the machine runs on into the ROM's 0s. */
const RUNS_OFF = `R1 <= 5
R1 <= R1 + 1`;

const h64 = (v: bigint) => `0x${BigInt.asUintN(64, v).toString(16).toUpperCase()}`;

/** The program counter's tests: reset, count, hold, and a change while the clock is high. */
const PC_STEPS: {
  label: string;
  set: Record<string, string | number>;
  expect?: Record<string, string>;
}[] = [
  { label: "RST 1, GO 1, clock low", set: { CLK: 0, RST: 1, GO: 1 } },
  { label: "edge with RST 1: PC is 0", set: { CLK: 1 }, expect: { PC: h64(0n) } },
  { label: "clock low, RST 0", set: { CLK: 0, RST: 0 }, expect: { PC: h64(0n) } },
  { label: "edge: PC is 4", set: { CLK: 1 }, expect: { PC: h64(4n) } },
  { label: "clock low", set: { CLK: 0 }, expect: { PC: h64(4n) } },
  { label: "edge: PC is 8", set: { CLK: 1 }, expect: { PC: h64(8n) } },
  { label: "GO falls while the clock is high", set: { GO: 0 }, expect: { PC: h64(8n) } },
  { label: "clock low, GO 0", set: { CLK: 0 }, expect: { PC: h64(8n) } },
  { label: "edge with GO 0: PC stays 8", set: { CLK: 1 }, expect: { PC: h64(8n) } },
  { label: "clock low, RST 1", set: { CLK: 0, RST: 1 }, expect: { PC: h64(8n) } },
  { label: "edge with RST 1 and GO 0: PC is 0", set: { CLK: 1 }, expect: { PC: h64(0n) } },
];

export const fetch: LessonInput = {
  id: "fetch",
  title: LABELS.title,
  module: 8,
  order: 3,
  objectives: [...LABELS.objectives],
  introduces: ["program counter", "fetch"],
  sections: [
    { kind: "question", title: LABELS.titles.question, prose: PROSE.question },
    { kind: "motivation", title: LABELS.titles.motivation, prose: PROSE.motivation },
    {
      kind: "prediction",
      title: LABELS.titles.prediction,
      prose: PROSE.prediction,
      interactives: [
        {
          id: "predict-end",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.predictEnd,
          props: {
            libraryId: "datapath-fetch",
            program: RUNS_OFF,
            edges: 2,
            shown: [1],
            buses: ["PC", "IR"],
            question: PROSE.p1Question,
            options: [
              { value: "go", label: LABELS.options.p1On },
              { value: "21", label: LABELS.options.p1Stops },
              { value: "stop", label: LABELS.options.p1Stop },
            ],
            ask: "stop",
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
          id: "margin",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.margin,
          lead: PROSE.marginLead,
          after: PROSE.marginAfter,
          props: {
            libraryId: "datapath-fetch",
            program: MARGIN,
            shown: [1, 2, 3, 4],
            buses: ["PC", "PC4", "IR", "RESULT"],
            run: true,
            steps: true,
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
          id: "write-pc",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.writePc,
          lead: PROSE.writePcLead,
          props: { challengeId: "pc-text" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "fetch-faults",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.fetchFaults,
          lead: PROSE.fetchFaultsLead,
          props: {
            outcomes: PROSE.fetchFaultsAfter,
            libraryId: "datapath-fetch",
            program: MARGIN,
            shown: [1, 2, 3, 4],
            buses: ["PC", "PC4", "IR"],
            run: true,
            faults: [
              { kind: "stuck-at", net: "PC4", value: 0, at: [4, 6], label: LABELS.faults.pc4Low },
              {
                kind: "stuck-at",
                net: "STOP",
                value: 0,
                at: [29, 2],
                label: LABELS.faults.stopLow,
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
          id: "edges",
          kind: "edge-timeline",
          timeModel: "settle",
          caption: LABELS.captions.edges,
          lead: PROSE.edgesLead,
          after: PROSE.edgesAfter,
          props: {
            libraryId: "datapath-fetch",
            program: MARGIN,
            edges: 5,
            signals: [
              { net: "CLK" },
              { net: "PC", show: "address" },
              { net: "IR", show: "word" },
              { net: "RESULT", show: "signed" },
              { net: "WREG" },
            ],
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
      id: "pc-text",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "write",
      interface: {
        inputs: [{ name: "CLK" }, { name: "RST" }, { name: "GO" }],
        outputs: [{ name: "PC", width: 64 }],
      },
      allowedConstructs: PC_CONSTRUCTS,
      tryIt: "pins",
      initial: { hdl: PC_START },
      tests: { kind: "sequence", steps: PC_STEPS },
      hints: [...PROSE.c1Hints],
      reference: { hdl: PC_REFERENCE },
    },
    {
      id: "checks-text",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      interface: {
        inputs: [{ name: "PC", width: 64 }],
        outputs: [{ name: "CAUSEF", width: 8 }],
      },
      allowedConstructs: CHECKS_CONSTRUCTS,
      tryIt: "pins",
      initial: { hdl: CHECKS_START },
      tests: { kind: "combinational", vectors: CHECKS_VECTORS },
      hints: [...PROSE.c2Hints],
      reference: { hdl: CHECKS_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "Instruction fetch drawn first, as a PC register, an adder of 4 and an instruction memory, before any instruction runs (Patterson and Hennessy, Harris and Harris); Nand2Tetris's PC chip with its inc, load and reset inputs; the SAP computer's program counter and its fetch states.",
    howThisDiffers:
      "Fetch arrives third, after the datapath has run instructions the learner put on IR by hand, so the program counter answers the question the hand-set instruction leaves (who chooses the next one?). The course's machine adds what the textbook datapath leaves out at this point: the checks that stop it (a fetch outside the ROM, not at a multiple of 4, an instruction it does not know) and a stop instruction, with the cause on a bus; the prediction is a program with no stop, which runs off its end into the ROM's zeros. The decoder is the course's closed block, named for what it is, with the course's own control signals (WRITEY, BCONST, GO, WREG). The faults are the adder's output held at 0, which runs one instruction forever, and the stop instruction's signal held at 0, which the illegal-instruction check then stops. The written challenges are the program counter with reset and hold, and the fetch checks as a module.",
  },
};
