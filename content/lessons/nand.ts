// Lesson: Module 2, lesson 2, one kind of gate.
//
// The structure is here; the words are in nand.prose.ts and nand.labels.ts. The circuits are the
// model's (packages/dd-model/src/logic.ts); nand.facts.test.ts pins the numbers the prose states.

import type { LessonInput } from "@dd/lesson-schema";

import { GATE_CONSTRUCTS } from "./gates";
import { LABELS } from "./nand.labels";
import { PROSE } from "./nand.prose";

const NAND_ONLY = { only: ["nand"] };

const XOR_NAND_TEXT = `module clash(input logic A, input logic B, output logic Y);
  logic NA;
  logic NB;
  logic P;
  logic Q;
  assign NA = ~(A & A);
  assign NB = ~(B & B);
  assign P = ~(A & NB);
  assign Q = ~(NA & B);
  assign Y = ~(P & Q);
endmodule
`;

/** The four rows of two inputs A and B, with Y for each. */
const rows2 = (values: readonly number[]) =>
  [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ].map(([a, b], i) => ({
    label: `A ${a}, B ${b}`,
    inputs: { A: a as number, B: b as number },
    expect: { Y: values[i] as number },
  }));

export const nand: LessonInput = {
  id: "nand",
  title: LABELS.title,
  module: 2,
  order: 2,
  objectives: [...LABELS.objectives],
  // NOR is introduced here but not rationed: "nor" is ordinary English ("neither 0 nor 1"), and
  // the term gate ignores case (docs/notes/modules-2-and-3-plan.md, Terms).
  introduces: ["NAND", "universal"],
  sections: [
    { kind: "question", title: LABELS.titles.question, prose: PROSE.question },
    { kind: "motivation", title: LABELS.titles.motivation, prose: PROSE.motivation },
    {
      kind: "prediction",
      title: LABELS.titles.prediction,
      prose: PROSE.prediction,
      interactives: [
        {
          id: "predict-tied",
          kind: "prediction",
          timeModel: "settle",
          caption: LABELS.captions.predictTied,
          props: {
            question: PROSE.p1Question,
            libraryId: "nand-tied",
            run: [{ label: LABELS.steps.a1, set: { A: 1 } }],
            watch: "Y",
            options: [
              { value: "0", label: LABELS.options.y0 },
              { value: "1", label: LABELS.options.y1 },
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
          id: "explore-nand",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.exploreNand,
          lead: PROSE.exploreNandLead,
          after: PROSE.exploreNandAfter,
          props: { libraryId: "nand-gate", truthTable: "circuit" },
        },
      ],
    },
    {
      kind: "construction",
      title: LABELS.titles.construction,
      prose: PROSE.construction,
      interactives: [
        {
          id: "build-not",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.buildNot,
          lead: PROSE.buildNotLead,
          props: { challengeId: "nand-not" },
        },
        {
          id: "build-and",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.buildAnd,
          lead: PROSE.buildAndLead,
          props: { challengeId: "nand-and" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "or-faults",
          kind: "fault-lab",
          timeModel: "settle",
          caption: LABELS.captions.orFaults,
          lead: PROSE.orFaultsLead,
          after: PROSE.orFaultsAfter,
          props: {
            libraryId: "nand-or",
            faults: [
              { kind: "broken-wire", net: "NA", label: LABELS.faults.cutNa },
              { kind: "wrong-gate", path: "nandA", gate: "and", label: LABELS.faults.nandAToAnd },
              { kind: "wrong-gate", path: "nandY", gate: "and", label: LABELS.faults.nandYToAnd },
            ],
            run: [
              { label: "A 0, B 0", set: { A: 0, B: 0 } },
              { label: "A 0, B 1", set: { A: 0, B: 1 } },
              { label: "A 1, B 0", set: { A: 1, B: 0 } },
              { label: "A 1, B 1", set: { A: 1, B: 1 } },
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
          id: "clash-expression",
          kind: "circuit-text",
          timeModel: "none",
          caption: LABELS.captions.clashExpression,
          lead: PROSE.clashExpressionLead,
          after: PROSE.clashExpressionAfter,
          props: { libraryId: "clash-gates", form: "expression" },
        },
      ],
    },
    {
      kind: "generalisation",
      title: LABELS.titles.generalisation,
      prose: "",
      interactives: [
        {
          id: "explore-nor",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.exploreNor,
          lead: PROSE.exploreNorLead,
          props: { libraryId: "nor-gate", truthTable: "circuit" },
        },
        {
          id: "explore-nor-tied",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.exploreNorTied,
          lead: PROSE.exploreNorTiedLead,
          after: PROSE.exploreNorTiedAfter,
          props: { libraryId: "nor-tied", truthTable: "circuit" },
        },
      ],
    },
    {
      kind: "challenge",
      title: LABELS.titles.challenge,
      prose: "",
      interactives: [
        {
          id: "build-xor",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.buildXor,
          lead: PROSE.buildXorLead,
          props: { challengeId: "nand-xor" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "nand-not",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "draw",
      interface: { inputs: [{ name: "A" }], outputs: [{ name: "Y" }] },
      palette: ["nand"],
      allowedConstructs: GATE_CONSTRUCTS,
      limits: NAND_ONLY,
      tests: {
        kind: "combinational",
        vectors: [
          { label: "A 0", inputs: { A: 0 }, expect: { Y: 1 } },
          { label: "A 1", inputs: { A: 1 }, expect: { Y: 0 } },
        ],
      },
      hints: [...PROSE.c1Hints],
      reference: {
        hdl: `module nand_not(input logic A, output logic Y);
  assign Y = ~(A & A);
endmodule
`,
      },
    },
    {
      id: "nand-and",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "draw",
      interface: { inputs: [{ name: "A" }, { name: "B" }], outputs: [{ name: "Y" }] },
      palette: ["nand"],
      allowedConstructs: GATE_CONSTRUCTS,
      limits: NAND_ONLY,
      tests: { kind: "combinational", vectors: rows2([0, 0, 0, 1]) },
      hints: [...PROSE.c2Hints],
      reference: {
        hdl: `module nand_and(input logic A, input logic B, output logic Y);
  logic M;
  assign M = ~(A & B);
  assign Y = ~(M & M);
endmodule
`,
      },
    },
    {
      id: "nand-xor",
      title: LABELS.challengeTitles.c3,
      task: PROSE.c3Task,
      gradedDirection: "draw",
      interface: { inputs: [{ name: "A" }, { name: "B" }], outputs: [{ name: "Y" }] },
      palette: ["nand"],
      allowedConstructs: GATE_CONSTRUCTS,
      limits: NAND_ONLY,
      tests: { kind: "combinational", vectors: rows2([0, 1, 1, 0]) },
      hints: [...PROSE.c3Hints],
      reference: { hdl: XOR_NAND_TEXT },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "Nand2Tetris's first project: given NAND as the one primitive, build Not, And, Or, Xor, then the multiplexer and demultiplexer and their multi-bit forms, in that order and in its own HDL, with De Morgan's laws as the stated reason; or a textbook's proof of functional completeness through NAND and NOR equivalents of each gate drawn as a table of symbols.",
    howThisDiffers:
      "The reason to build from one gate is a constraint the learner meets in the course's story: the engineer who will build the freezer room's alarm board has a drawer full of one kind of chip, so a board of one part is a board that can be built and repaired from that drawer. The learner predicts what a NAND gate with both inputs on one signal does before any construction, builds NOT and then AND from it under a grader that refuses any other kind of gate, and meets OR as a drawn circuit to break, not to build: a cut wire shows up in only two of the four rows. The argument that one gate is enough is made from the CLASH circuit of the previous lesson, read as one detector per row, rather than from algebraic laws. XOR from NAND is the closing challenge, built for the two-sensor CLASH lamp; no multiplexer appears, and NOR is shown to do the same job.",
  },
};
