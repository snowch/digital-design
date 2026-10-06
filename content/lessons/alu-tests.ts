// Copyright © 2026 Christopher Snow

// Lesson: Module 7, lesson 4, testing the ALU: a generated suite of normal, boundary, random and
// adversarial tests, faults put in on purpose to see which tests catch them, and the capstone, the
// whole ALU written at any width and graded by the suite at 16 and 64 bits.
//
// The structure is here; the words are in alu-tests.prose.ts and alu-tests.labels.ts. The suite
// is the model's (packages/dd-model: testcases.ts); the numbers the prose states are pinned by
// alu-tests.facts.test.ts, read off the figures' own props.

import type { LessonInput } from "@dd/lesson-schema";

import { LABELS } from "./alu-tests.labels";
import { PROSE } from "./alu-tests.prose";
import { SUITE_SEED, suiteVectors } from "./module7";
import { OPERAND_REFERENCE, WIDE_CONSTRUCTS } from "./wide-alu";

// Bit select (`Y[N-1]`) arrives here, where MINUS needs it.
const CAPSTONE_CONSTRUCTS = [...WIDE_CONSTRUCTS, "always_comb", "case", "op-compare", "select"];

/** The capstone's starting text: the header, and the adder's second word from the last lesson. */
const operandLines = OPERAND_REFERENCE.split("\n").slice(8, 16).join("\n");
const HEADER = `module alu #(parameter N = 16) (
  input logic [N-1:0] A,
  input logic [N-1:0] B,
  input logic OP2,
  input logic OP1,
  input logic OP0,
  output logic [N-1:0] Y,
  output logic ZERO,
  output logic MINUS,
  output logic COUT,
  output logic OVER
);
  logic [N-1:0] D;
  logic [N-1:0] S;
  logic CIN;
${operandLines}
  assign CIN = OP1 & (OP2 ^ OP0);
`;

export const ALU_START = `${HEADER}endmodule
`;

export const ALU_REFERENCE = `${HEADER}  assign {COUT, S} = A + D + CIN;
  always_comb begin
    case ({OP2, OP1, OP0})
      3'b000: Y = A & B;
      3'b001: Y = A ^ B;
      3'b100: Y = A | B;
      3'b101: Y = B;
      default: Y = S;
    endcase
  end
  assign ZERO = Y == 0;
  assign MINUS = Y[N-1];
  assign OVER = ~(A[N-1] ^ D[N-1]) & (A[N-1] ^ S[N-1]);
endmodule
`;

/** Faults for the labs: each the same as a net held at a value, named by what it does. */
const LAB_FAULTS = [
  { kind: "stuck-at" as const, net: "OVER", value: 0 as const, label: LABELS.faults.overLow },
  { kind: "stuck-at" as const, net: "Y9", value: 0 as const, label: LABELS.faults.y9Low },
  { kind: "stuck-at" as const, net: "C8", value: 0 as const, label: LABELS.faults.c8Low },
  { kind: "stuck-at" as const, net: "Z8", value: 1 as const, label: LABELS.faults.z8High },
];

export const aluTests: LessonInput = {
  id: "alu-tests",
  title: LABELS.title,
  module: 7,
  order: 4,
  objectives: [...LABELS.objectives],
  introduces: ["boundary test", "adversarial test"],
  sections: [
    { kind: "question", title: LABELS.titles.question, prose: PROSE.question },
    { kind: "motivation", title: LABELS.titles.motivation, prose: PROSE.motivation },
    {
      kind: "prediction",
      title: LABELS.titles.prediction,
      prose: PROSE.prediction,
      interactives: [
        {
          id: "predict-catch",
          kind: "suite-lab",
          timeModel: "settle",
          caption: LABELS.captions.predictCatch,
          props: {
            libraryId: "alu8-flags-16-row",
            faults: [LAB_FAULTS[0]],
            seed: 1,
            question: PROSE.p1Question,
            options: [
              { value: "normal", label: LABELS.options.normal },
              { value: "boundary", label: LABELS.options.boundary },
              { value: "random", label: LABELS.options.random },
              { value: "none", label: LABELS.options.none },
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
          id: "suite-healthy",
          kind: "suite-lab",
          timeModel: "settle",
          caption: LABELS.captions.suiteHealthy,
          lead: PROSE.suiteHealthyLead,
          after: PROSE.suiteHealthyAfter,
          props: { libraryId: "alu8-flags-16-row", seed: 1 },
        },
      ],
    },
    {
      kind: "construction",
      title: LABELS.titles.construction,
      prose: PROSE.construction,
      interactives: [
        {
          id: "find-pair",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.findPair,
          lead: PROSE.findPairLead,
          props: { challengeId: "expose-carries" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "suite-faults",
          kind: "suite-lab",
          timeModel: "settle",
          caption: LABELS.captions.suiteFaults,
          lead: PROSE.suiteFaultsLead,
          props: {
            libraryId: "alu8-flags-16-row",
            faults: LAB_FAULTS,
            seed: 1,
            outcomes: PROSE.suiteFaultsAfter,
          },
        },
      ],
    },
    { kind: "explanation", title: LABELS.titles.explanation, prose: PROSE.explanation },
    {
      kind: "generalisation",
      title: LABELS.titles.generalisation,
      prose: PROSE.generalisation,
      interactives: [
        {
          id: "suite-64",
          kind: "suite-lab",
          timeModel: "settle",
          caption: LABELS.captions.suite64,
          lead: PROSE.suite64Lead,
          props: {
            outcomes: PROSE.suite64After,
            libraryId: "alu8-flags-64-row",
            faults: [{ kind: "stuck-at", net: "C40", value: 0, label: LABELS.faults.c40Low }],
            seed: 1,
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
          id: "write-alu",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.writeAlu,
          lead: PROSE.writeAluLead,
          props: { challengeId: "alu-text" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "expose-carries",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: [
        { id: "a", label: LABELS.fields.a, kind: "text" },
        { id: "b", label: LABELS.fields.b, kind: "text" },
      ],
      tests: {
        kind: "answers",
        grader: "exposes",
        cases: [4, 9, 15].map((k) => ({
          label: `C${k} stuck at 0`,
          given: { libraryId: "alu8-flags-16-row", net: `C${k}`, value: 0, job: 2 },
          expect: {},
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { answers: { a: "FFFF", b: "0001" } },
    },
    {
      id: "alu-text",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      interface: {
        inputs: [{ name: "A" }, { name: "B" }, { name: "OP2" }, { name: "OP1" }, { name: "OP0" }],
        outputs: [
          { name: "Y" },
          { name: "ZERO" },
          { name: "MINUS" },
          { name: "COUT" },
          { name: "OVER" },
        ],
      },
      allowedConstructs: CAPSTONE_CONSTRUCTS,
      initial: { hdl: ALU_START },
      tests: { kind: "combinational", vectors: suiteVectors([16, 64], SUITE_SEED) },
      hints: [...PROSE.c2Hints],
      reference: { hdl: ALU_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "Hardware testing as taught: an exhaustive testbench for a small adder, or a self-checking testbench with a handful of directed vectors and a few random ones (Harris and Harris's testbench chapter; Nand2Tetris's .tst and .cmp files with fixed rows); stuck-at fault models and test-pattern generation in a VLSI-testing text.",
    howThisDiffers:
      "The lesson starts from how many tests a 16-bit ALU would need to try every pair on every job, and introduces the course's own generator in four named kinds, with the random kind's seed recorded so a run repeats. The learner predicts which kind first catches a fault the normal tests miss, finds two words of their own that expose three lost carries at once, puts faults in on purpose and watches which kinds catch each, and runs the suite at 64 bits. The capstone is the whole eight-job ALU with its four flags written once with a width parameter and graded by the generated suite at 16 and 64 bits, every expected value worked out in bigints.",
  },
};
