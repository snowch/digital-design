// Copyright © 2026 Christopher Snow

// Lesson: Module 6, lesson 2, the register file: two words out at once.
//
// The structure is here; the words are in register-file.prose.ts and register-file.labels.ts. The
// circuits are the model's (packages/dd-model: memory.ts and library-memory.ts): lesson 6.1's
// registers and decoder with a second selector. The numbers the prose states are pinned by
// register-file.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./register-file.labels";
import { PROSE } from "./register-file.prose";

const DRAW_CONSTRUCTS = ["module", "ports", "logic", "assign", "op-bitwise", "always_ff"];

/** What the text challenge allows: the registers lesson's text and, new here, an array. */
export const ARRAY_CONSTRUCTS = [...DRAW_CONSTRUCTS, "vector", "if", "array"];

const REGFILE_TABLE = {
  words: ["regfile/M0", "regfile/M1", "regfile/M2", "regfile/M3"],
  addressBits: 2,
  reads: [
    { port: "QA", address: ["RA1", "RA0"] },
    { port: "QB", address: ["RB1", "RB0"] },
  ],
  writes: [{ address: ["WA1", "WA0"], enable: "WE" }],
};

/** Every word written with its own value, then pairs of words read at once. */
export const FILL_AND_READ_TWO = [
  {
    label: "write 0001 at 00",
    set: { WA1: 0, WA0: 0, D: "0001", WE: 1, CLK: 0, RA1: 0, RA0: 0, RB1: 0, RB0: 0 },
    clock: "CLK",
  },
  { label: "write 0010 at 01", set: { WA0: 1, D: "0010" }, clock: "CLK" },
  { label: "write 0100 at 10", set: { WA1: 1, WA0: 0, D: "0100" }, clock: "CLK" },
  { label: "write 1000 at 11", set: { WA0: 1, D: "1000" }, clock: "CLK" },
  { label: "read 00 and 11", set: { WE: 0, RA1: 0, RA0: 0, RB1: 1, RB0: 1 } },
  { label: "read 01 and 10", set: { RA0: 1, RB0: 0 } },
  { label: "read 10 and 01", set: { RA1: 1, RA0: 0, RB1: 0, RB0: 1 } },
  { label: "read 11 and 00", set: { RA0: 1, RB0: 0 } },
];

const HEADER =
  "module regfile_4(input logic [1:0] WA, input logic [3:0] D, input logic WE, input logic CLK, input logic [1:0] RA, input logic [1:0] RB, output logic [3:0] QA, output logic [3:0] QB);";

const REGFILE_TEXT = `${HEADER}
  logic [3:0] words [0:3];
  assign QA = words[RA];
  assign QB = words[RB];
  always_ff @(posedge CLK) if (WE) words[WA] <= D;
endmodule
`;

export const registerFile: LessonInput = {
  id: "register-file",
  title: LABELS.title,
  module: 6,
  order: 2,
  objectives: [...LABELS.objectives],
  introduces: ["register file"],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "two-displays-scene",
          kind: "scene",
          timeModel: "none",
          caption: LABELS.captions.scene,
          props: {
            sources: [
              {
                items: [
                  { kind: "switch", label: LABELS.scene.number, signal: "D", width: 4 },
                  { kind: "switch", label: LABELS.scene.saveRoom, signal: "WA", width: 2 },
                  { kind: "button", label: LABELS.scene.save },
                  { kind: "clock", label: LABELS.scene.clock, signal: "CLK" },
                  { kind: "switch", label: LABELS.scene.leftRoom, signal: "RA", width: 2 },
                  { kind: "switch", label: LABELS.scene.rightRoom, signal: "RB", width: 2 },
                ],
              },
            ],
            circuit: LABELS.scene.circuit,
            outputs: [
              { kind: "readout", label: LABELS.scene.left, signal: "QA", width: 4 },
              { kind: "readout", label: LABELS.scene.right, signal: "QB", width: 4 },
            ],
            labels: { title: LABELS.scene.title, summary: LABELS.scene.summary },
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
          id: "predict-same-word",
          kind: "prediction",
          timeModel: "clocked",
          caption: LABELS.captions.predictSame,
          props: {
            question: PROSE.p1Question,
            libraryId: "regfile-block",
            run: [
              {
                label: "WA 01, D 0101, WE 1",
                set: { WA1: 0, WA0: 1, D: "0101", WE: 1, CLK: 0, RA1: 0, RA0: 1, RB1: 0, RB0: 1 },
              },
              { label: "edge 1", clock: "CLK" },
              { label: "WA 10, D 1100", set: { WA1: 1, WA0: 0, D: "1100" } },
              { label: "edge 2", clock: "CLK" },
            ],
            watch: "QB",
            options: [
              { value: "0101", label: LABELS.options.p1First },
              { value: "1100", label: LABELS.options.p1Second },
              { value: "XXXX", label: LABELS.options.unknownB },
            ],
            explain: PROSE.p1Explain,
            signals: ["CLK", "WE", "WA1", "WA0", "D", "RA1", "RA0", "RB1", "RB0", "QA", "QB"],
          },
        },
        {
          id: "predict-before-edge",
          kind: "prediction",
          timeModel: "clocked",
          caption: LABELS.captions.predictBefore,
          props: {
            question: PROSE.p2Question,
            libraryId: "regfile-block",
            run: [
              {
                label: "WA 01, D 0101, WE 1",
                set: { WA1: 0, WA0: 1, D: "0101", WE: 1, CLK: 0, RA1: 0, RA0: 1, RB1: 0, RB0: 0 },
              },
              { label: "edge 1", clock: "CLK" },
              { label: "D 1111", set: { D: "1111" } },
            ],
            watch: "QA",
            options: [
              { value: "0101", label: LABELS.options.p2Old },
              { value: "1111", label: LABELS.options.p2New },
              { value: "XXXX", label: LABELS.options.unknownA },
            ],
            explain: PROSE.p2Explain,
            signals: ["CLK", "WE", "WA1", "WA0", "D", "RA1", "RA0", "QA"],
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
          id: "regfile-explorer",
          kind: "memory-explorer",
          timeModel: "clocked",
          caption: LABELS.captions.explorer,
          lead: PROSE.explorerLead,
          after: PROSE.explorerAfter,
          props: { libraryId: "regfile-block", clock: "CLK", memory: REGFILE_TABLE },
        },
      ],
    },
    {
      kind: "construction",
      title: LABELS.titles.construction,
      prose: PROSE.construction,
      interactives: [
        {
          id: "build-two-reads",
          kind: "challenge",
          timeModel: "clocked",
          caption: LABELS.captions.buildTwoReads,
          lead: PROSE.buildLead,
          props: { challengeId: "two-reads" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "regfile-faults",
          kind: "fault-lab",
          timeModel: "clocked",
          caption: LABELS.captions.faults,
          lead: PROSE.faultsLead,
          props: {
            // Each fault's outcome shows once that fault has run, so the lead's prediction is not answered first.

            libraryId: "regfile-block",
            scope: "regfile",
            faults: [
              {
                kind: "wrong-gate",
                path: "regfile/andW2",
                gate: "or",
                label: LABELS.faults.andW2ToOr,
                outcome: PROSE.faultsAfterFault1,
              },
              {
                kind: "stuck-at",
                net: "regfile/W1",
                value: 0,
                label: LABELS.faults.w1Low,
                outcome: PROSE.faultsAfterFault2,
              },
              {
                kind: "wrong-gate",
                path: "regfile/decoder/notS1",
                gate: "buf",
                label: LABELS.faults.notS1Cut,
                outcome: PROSE.faultsAfterFault3,
              },
            ],
            run: FILL_AND_READ_TWO,
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
          id: "regfile-opened",
          kind: "memory-explorer",
          timeModel: "clocked",
          caption: LABELS.captions.opened,
          lead: PROSE.openedLead,
          after: PROSE.openedAfter,
          props: {
            libraryId: "regfile-block",
            clock: "CLK",
            scope: "regfile",
            memory: REGFILE_TABLE,
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
          id: "ram-as-text",
          kind: "circuit-text",
          timeModel: "none",
          caption: LABELS.captions.ramText,
          lead: PROSE.ramTextLead,
          after: PROSE.ramTextAfter,
          props: { libraryId: "ram-array" },
        },
      ],
    },
    {
      kind: "challenge",
      title: LABELS.titles.challenge,
      prose: "",
      interactives: [
        {
          id: "write-regfile",
          kind: "challenge",
          timeModel: "clocked",
          caption: LABELS.captions.writeRegfile,
          lead: PROSE.writeLead,
          props: { challengeId: "regfile-text" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "two-reads",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "draw",
      interface: {
        inputs: [
          { name: "WA" },
          { name: "D", width: 4 },
          { name: "WE" },
          { name: "CLK" },
          { name: "RA" },
          { name: "RB" },
        ],
        outputs: [
          { name: "QA", width: 4 },
          { name: "QB", width: 4 },
        ],
      },
      palette: ["register", "word-selector-2", "and", "not"],
      allowedConstructs: DRAW_CONSTRUCTS,
      tests: {
        kind: "sequence",
        steps: [
          {
            label: "WA 0, D 0110, WE 1, RA 0, RB 1, clock low",
            set: { WA: 0, D: "0110", WE: 1, CLK: 0, RA: 0, RB: 1 },
          },
          { label: "edge: write at 0", set: { CLK: 1 }, expect: { QA: "0110", QB: "XXXX" } },
          { label: "clock low, WA 1, D 1001", set: { CLK: 0, WA: 1, D: "1001" } },
          { label: "edge: write at 1", set: { CLK: 1 }, expect: { QA: "0110", QB: "1001" } },
          {
            label: "RA and RB swap while the clock is high",
            set: { RA: 1, RB: 0 },
            expect: { QA: "1001", QB: "0110" },
          },
          { label: "WA falls while the clock is high", set: { WA: 0 }, expect: { QB: "0110" } },
          {
            label: "clock low, WE 0, D 1111",
            set: { CLK: 0, WE: 0, D: "1111" },
            expect: { QA: "1001", QB: "0110" },
          },
          { label: "edge with WE 0", set: { CLK: 1 }, expect: { QA: "1001", QB: "0110" } },
          { label: "clock low, RA 0", set: { CLK: 0, RA: 0 }, expect: { QA: "0110", QB: "0110" } },
        ],
      },
      hints: [...PROSE.c1Hints],
      reference: { libraryId: "regfile-2-parts" },
    },
    {
      id: "regfile-text",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      interface: {
        inputs: [
          { name: "WA", width: 2 },
          { name: "D", width: 4 },
          { name: "WE" },
          { name: "CLK" },
          { name: "RA", width: 2 },
          { name: "RB", width: 2 },
        ],
        outputs: [
          { name: "QA", width: 4 },
          { name: "QB", width: 4 },
        ],
      },
      allowedConstructs: ARRAY_CONSTRUCTS,
      initial: { hdl: `${HEADER}\n\nendmodule\n` },
      tests: {
        kind: "sequence",
        steps: [
          {
            label: "WA 10, D 0011, WE 1, RA 10, RB 00, clock low",
            set: { WA: "10", D: "0011", WE: 1, CLK: 0, RA: "10", RB: "00" },
          },
          { label: "edge: write at 10", set: { CLK: 1 }, expect: { QA: "0011", QB: "XXXX" } },
          { label: "clock low, WA 00, D 1010", set: { CLK: 0, WA: "00", D: "1010" } },
          { label: "edge: write at 00", set: { CLK: 1 }, expect: { QA: "0011", QB: "1010" } },
          {
            label: "WA changes while the clock is high",
            set: { WA: "10", D: "0000" },
            expect: { QA: "0011" },
          },
          {
            label: "clock low, WE 0, RB 10",
            set: { CLK: 0, WE: 0, RB: "10" },
            expect: { QA: "0011", QB: "0011" },
          },
          { label: "edge with WE 0", set: { CLK: 1 }, expect: { QA: "0011" } },
          { label: "clock low, RA 00", set: { CLK: 0, RA: "00" }, expect: { QA: "1010" } },
        ],
      },
      hints: [...PROSE.c2Hints],
      reference: { hdl: REGFILE_TEXT },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "A register file drawn as a block with two read ports and one write port (A1, A2, A3, WD3, RD1, RD2, WE3 in Harris and Harris), introduced as the place a processor keeps its operands, with its internal decoder and multiplexers shown in one figure.",
    howThisDiffers:
      "The lesson's reason is two displays comparing two rooms' settings, not a processor's operands, and no processor is mentioned. The learner predicts that two reads can name one word and that a read of the word being written shows the old word until the edge, then adds a second selector to the two-word memory they built in the previous lesson. The ports are the course's own names (WA, RA, RB, QA, QB). Why one write and many reads is argued from what a read and a write do to a register. The text form is an array, shown first for the previous lesson's RAM so the challenge's answer is not on the page.",
  },
};
