// Copyright © 2026 Chris Snow

// Lesson: Module 2, lesson 3, fewer gates and shorter paths.
//
// The structure is here; the words are in fewer-gates.prose.ts and fewer-gates.labels.ts. The
// circuits are the model's (packages/dd-model/src/logic.ts); fewer-gates.facts.test.ts pins the
// numbers the prose states.

import type { LessonInput } from "@dd/lesson-schema";

import { GATE_CONSTRUCTS, rows3 } from "./gates";
import { LABELS } from "./fewer-gates.labels";
import { PROSE } from "./fewer-gates.prose";

const XOR_FOUR_TEXT = `module clash(input logic A, input logic B, output logic Y);
  logic M;
  logic P;
  logic Q;
  assign M = ~(A & B);
  assign P = ~(A & M);
  assign Q = ~(M & B);
  assign Y = ~(P & Q);
endmodule
`;

export const fewerGates: LessonInput = {
  id: "fewer-gates",
  title: LABELS.title,
  module: 2,
  order: 3,
  objectives: [...LABELS.objectives],
  introduces: ["depth"],
  sections: [
    { kind: "question", title: LABELS.titles.question, prose: PROSE.question },
    { kind: "motivation", title: LABELS.titles.motivation, prose: PROSE.motivation },
    {
      kind: "prediction",
      title: LABELS.titles.prediction,
      prose: PROSE.prediction,
      interactives: [
        {
          id: "predict-warm",
          kind: "prediction",
          timeModel: "settle",
          caption: LABELS.captions.predictWarm,
          props: {
            question: PROSE.p1Question,
            libraryId: "call-rows",
            // WARM falls with the door open and the shop closed: the question is what changes.
            run: [
              { label: LABELS.steps.allOne, set: { WARM: 1, DOOR: 1, CLOSED: 1 } },
              { label: LABELS.steps.warmFalls, set: { WARM: 0 } },
            ],
            signals: ["WARM", { net: "R3", label: "and3" }, { net: "R4", label: "and4" }, "CALL"],
            watch: "CALL",
            options: [
              { value: "0", label: LABELS.options.call0 },
              { value: "1", label: LABELS.options.call1 },
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
          id: "call-pairs",
          kind: "input-pairs",
          timeModel: "none",
          caption: LABELS.captions.callPairs,
          lead: PROSE.callPairsLead,
          after: PROSE.callPairsAfter,
          props: { libraryId: "call-rows", input: "WARM", drawing: false },
        },
      ],
    },
    {
      kind: "construction",
      title: LABELS.titles.construction,
      prose: PROSE.construction,
      interactives: [
        {
          id: "build-call",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.buildCall,
          lead: PROSE.buildCallLead,
          props: { challengeId: "call-four" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "too-short",
          kind: "circuit-compare",
          timeModel: "none",
          caption: LABELS.captions.tooShort,
          lead: PROSE.tooShortLead,
          after: PROSE.tooShortAfter,
          props: {
            circuits: [
              { libraryId: "call-rows", label: LABELS.sides.rows },
              { libraryId: "call-too-short", label: LABELS.sides.tooShort },
            ],
            show: ["gates"],
            question: PROSE.p2Question,
            options: [
              { value: "same", label: LABELS.options.same },
              { value: "different", label: LABELS.options.different },
            ],
            explain: PROSE.p2Explain,
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
          id: "chain-steps",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.chainSteps,
          lead: PROSE.chainStepsLead,
          props: { libraryId: "any-warm-chain", showSteps: true },
        },
        {
          id: "tree-steps",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.treeSteps,
          lead: PROSE.treeStepsLead,
          after: PROSE.treeStepsAfter,
          props: { libraryId: "any-warm-tree", showSteps: true },
        },
      ],
    },
    {
      kind: "generalisation",
      title: LABELS.titles.generalisation,
      prose: "",
      interactives: [
        {
          id: "two-lamps",
          kind: "circuit-compare",
          timeModel: "none",
          caption: LABELS.captions.twoLamps,
          lead: PROSE.twoLampsLead,
          after: PROSE.twoLampsAfter,
          props: {
            circuits: [
              { libraryId: "two-lamps-separate", label: LABELS.sides.separate },
              { libraryId: "two-lamps-shared", label: LABELS.sides.shared },
            ],
            show: ["gates", "depth"],
            table: false,
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
          id: "build-xor-four",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.buildXorFour,
          lead: PROSE.buildXorFourLead,
          props: { challengeId: "xor-four" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "call-four",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "draw",
      interface: {
        inputs: [{ name: "WARM" }, { name: "DOOR" }, { name: "CLOSED" }],
        outputs: [{ name: "CALL" }],
      },
      palette: ["and", "or", "not"],
      allowedConstructs: GATE_CONSTRUCTS,
      limits: { gates: 4 },
      tests: {
        kind: "combinational",
        vectors: rows3(["WARM", "DOOR", "CLOSED"], "CALL", (w, d, c) => (w & (1 - d)) | (d & c)),
      },
      hints: [...PROSE.c1Hints],
      reference: {
        hdl: `module call(input logic WARM, input logic DOOR, input logic CLOSED, output logic CALL);
  logic SHUT;
  logic P;
  logic Q;
  assign SHUT = ~DOOR;
  assign P = WARM & SHUT;
  assign Q = DOOR & CLOSED;
  assign CALL = P | Q;
endmodule
`,
      },
    },
    {
      id: "xor-four",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "draw",
      interface: { inputs: [{ name: "A" }, { name: "B" }], outputs: [{ name: "Y" }] },
      palette: ["nand"],
      allowedConstructs: GATE_CONSTRUCTS,
      limits: { gates: 4, only: ["nand"] },
      tests: {
        kind: "combinational",
        vectors: [
          { label: "A 0, B 0", inputs: { A: 0, B: 0 }, expect: { Y: 0 } },
          { label: "A 0, B 1", inputs: { A: 0, B: 1 }, expect: { Y: 1 } },
          { label: "A 1, B 0", inputs: { A: 1, B: 0 }, expect: { Y: 1 } },
          { label: "A 1, B 1", inputs: { A: 1, B: 1 }, expect: { Y: 0 } },
        ],
      },
      hints: [...PROSE.c2Hints],
      reference: { hdl: XOR_FOUR_TEXT },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "A truth table turned into a sum of products, one AND term per 1 row, then minimised on a Karnaugh map by circling groups of adjacent 1s, followed by Boolean algebra identities (absorption, consensus) as the proof; depth, where it appears, as the critical path of a ripple-carry adder.",
    howThisDiffers:
      "The circuit to shrink is the shop manager's own: the CALL rule written one AND gate per row, eight gates for a board with room for four. The learner first predicts one row of it and sees that WARM made no difference there, then picks any input and has the simulator set each row beside its partner that differs in that input alone; a pair whose output agrees is a gate saved. No map and no algebra are drawn. The over-eager simplification is a circuit the learner predicts against and the figure shows in the one row where it is wrong, the door open by day. Depth is measured, not defined: the stepped model takes one step per gate, so the learner watches a chain of OR gates for four freezer rooms settle in three steps and a tree in two. Sharing one gate between two lamps is the third way to save, and the closing challenge, XOR in four NAND gates, needs it.",
  },
};
