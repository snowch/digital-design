// Copyright © 2026 Christopher Snow

// Lesson: How does a circuit remember?  (module 4, lesson 1; the first lesson built)
//
// The structure is here; the words are in remember.prose.ts. Everything a learner reads in this
// file is a name a signal already has (A, B, LIGHT, D, EN, CLK, Q) or a label the shared brief
// drafted.

import type { LessonInput } from "@dd/lesson-schema";

import { PROSE } from "./remember.prose";
import { LABELS } from "./remember.labels";

const CONSTRUCTS = ["module", "ports", "logic", "assign", "op-bitwise"];

const D_LATCH_TESTS = {
  kind: "sequence" as const,
  steps: [
    { label: "EN high, D high", set: { D: 1, EN: 1 }, expect: { Q: 1 } },
    { label: "EN high, D low", set: { D: 0, EN: 1 }, expect: { Q: 0 } },
    { label: "EN low", set: { D: 0, EN: 0 }, expect: { Q: 0 } },
    { label: "EN low, D high", set: { D: 1, EN: 0 }, expect: { Q: 0 } },
    { label: "EN high again", set: { D: 1, EN: 1 }, expect: { Q: 1 } },
    { label: "EN low, D low", set: { D: 0, EN: 0 }, expect: { Q: 1 } },
  ],
};

const D_LATCH_TEXT = `module follow_and_hold(input logic D, input logic EN, output logic Q);
  logic ND;
  logic S;
  logic R;
  logic QB;
  assign ND = ~D;
  assign S = D & EN;
  assign R = ND & EN;
  assign Q = ~(R | QB);
  assign QB = ~(S | Q);
endmodule
`;

export const remember: LessonInput = {
  id: "remember",
  title: "How does a circuit remember?",
  module: 4,
  order: 1,
  objectives: [...LABELS.objectives],
  introduces: [
    "feedback",
    "latch",
    "transparent",
    "edge",
    "propagation delay",
    "setup",
    "hold",
    "metastable",
  ],
  sections: [
    { kind: "question", title: LABELS.titles.question, prose: PROSE.question },
    { kind: "motivation", title: LABELS.titles.motivation, prose: PROSE.motivation },
    {
      kind: "prediction",
      title: LABELS.titles.prediction,
      prose: PROSE.prediction,
      interactives: [
        {
          id: "predict-two",
          kind: "prediction",
          timeModel: "settle",
          caption: LABELS.captions.predictTwo,
          props: {
            question: PROSE.p1Question,
            libraryId: "inverter-loop-2",
            run: [
              { label: "kick", set: { kick: 1 } },
              { label: "release", set: { kick: 0 } },
            ],
            watch: "q",
            options: [
              { value: "0", label: LABELS.options.zero },
              { value: "1", label: LABELS.options.one },
              { value: "X", label: LABELS.options.x },
            ],
            explain: PROSE.p1Explain,
          },
        },
        {
          id: "predict-three",
          kind: "prediction",
          timeModel: "settle",
          caption: LABELS.captions.predictThree,
          props: {
            question: PROSE.p2Question,
            libraryId: "inverter-loop-3",
            run: [
              { label: "kick", set: { kick: 1 } },
              { label: "release", set: { kick: 0 } },
            ],
            watch: "q",
            options: [
              { value: "0", label: LABELS.options.zero },
              { value: "1", label: LABELS.options.one },
              { value: "X", label: LABELS.options.x },
            ],
            explain: PROSE.p2Explain,
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
          id: "loop-two",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.loopTwo,
          lead: PROSE.investigationLoopTwo,
          props: { libraryId: "inverter-loop-2", showSteps: true },
        },
        {
          id: "loop-three",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.loopThree,
          lead: PROSE.investigationLoopThree,
          props: { libraryId: "inverter-loop-3", showSteps: true },
        },
        {
          id: "two-buttons",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.twoButtons,
          lead: PROSE.investigationTwoButtons,
          // Closed: the gates inside are the construction challenge's answer, drawn after it.
          props: { libraryId: "two-buttons-block", showSteps: true, canOpen: false },
        },
      ],
    },
    {
      kind: "construction",
      title: LABELS.titles.construction,
      prose: PROSE.construction,
      interactives: [
        {
          id: "build-two-buttons",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.buildTwoButtons,
          lead: PROSE.buildTwoButtonsLead,
          props: { challengeId: "two-buttons" },
        },
        {
          id: "build-d-latch",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.buildDLatch,
          lead: PROSE.buildDLatchLead,
          props: { challengeId: "follow-and-hold" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "fault-lab",
          kind: "fault-lab",
          timeModel: "settle",
          caption: LABELS.captions.faultLab,
          lead: PROSE.faultLabLead,
          props: {
            // Shown once the checks have run, so the lead's prediction is not answered first.
            outcomes: PROSE.faultLabAfter,
            libraryId: "two-buttons",
            faults: [
              { kind: "broken-wire", net: "DARK", label: LABELS.faults.cut },
              { kind: "wrong-gate", path: "norLight", gate: "or", label: LABELS.faults.or },
              { kind: "stuck-at", net: "A", value: 1, label: LABELS.faults.stuckA },
            ],
            run: [
              { label: "press A", set: { A: 1, B: 0 } },
              { label: "release A", set: { A: 0, B: 0 } },
              { label: "press B", set: { A: 0, B: 1 } },
              { label: "release B", set: { A: 0, B: 0 } },
            ],
            releaseAll: true,
          },
        },
        {
          id: "d-latch-explorer",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.dLatchExplorer,
          lead: PROSE.dLatchExplorerLead,
          props: { libraryId: "d-latch", truthTable: "d-latch" },
        },
        {
          id: "race",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.race,
          lead: PROSE.raceLead,
          after: PROSE.raceAfter,
          props: { libraryId: "two-latches", showSteps: true, canOpen: false },
        },
        {
          id: "setup-hold",
          kind: "setup-hold",
          timeModel: "delay",
          caption: LABELS.captions.setupHold,
          lead: PROSE.setupHoldLead,
          props: { window: [-25, -15] },
        },
      ],
    },
    {
      kind: "explanation",
      title: LABELS.titles.explanation,
      prose: PROSE.explanation,
      interactives: [
        {
          id: "table-sr",
          kind: "truth-table",
          timeModel: "none",
          caption: LABELS.captions.tableSr,
          lead: PROSE.tableSrLead,
          after: PROSE.tableDLead,
          props: { table: "sr-latch", columns: ["S", "R"], showNote: false },
        },
        {
          id: "internals",
          kind: "latch-internals",
          timeModel: "delay",
          caption: LABELS.captions.internals,
          lead: PROSE.internalsLead,
          after: PROSE.internalsAfter,
          props: {
            libraryId: "dff",
            delay: 10,
            script: [
              { time: 0, input: "CLK", value: 0 },
              { time: 0, input: "D", value: 0 },
              { time: 100, input: "CLK", value: 1 },
              { time: 200, input: "CLK", value: 0 },
              { time: 300, input: "D", value: 1 },
              { time: 400, input: "CLK", value: 1 },
              { time: 450, input: "D", value: 0 },
              { time: 470, input: "D", value: 1 },
              { time: 500, input: "CLK", value: 0 },
              { time: 550, input: "D", value: 0 },
              { time: 700, input: "CLK", value: 1 },
              { time: 800, input: "CLK", value: 0 },
            ],
            until: 900,
            signals: ["CLK", "D", { net: "dff/master/sr/Q", label: "master Q" }, "Q"],
            scope: "dff",
            // One phase per change of CLK or D, so the text on show always matches the clock.
            phases: [
              { from: 0, to: 100, text: PROSE.phases[0] },
              { from: 100, to: 200, text: PROSE.phases[1] },
              { from: 200, to: 300, text: PROSE.phases[2] },
              { from: 300, to: 400, text: PROSE.phases[3] },
              { from: 400, to: 450, text: PROSE.phases[4] },
              { from: 450, to: 500, text: PROSE.phases[5] },
              { from: 500, to: 550, text: PROSE.phases[6] },
              { from: 550, to: 700, text: PROSE.phases[7] },
              { from: 700, to: 800, text: PROSE.phases[8] },
              { from: 800, to: 900, text: PROSE.phases[9] },
            ],
          },
        },
      ],
    },
    {
      kind: "generalisation",
      title: LABELS.titles.generalisation,
      prose: "",
      interactives: [
        {
          id: "as-text",
          kind: "circuit-text",
          timeModel: "none",
          caption: LABELS.captions.asText,
          lead: PROSE.asTextLead,
          after: PROSE.asTextAfter,
          props: { libraryId: "dff-q" },
        },
        {
          id: "table-dff",
          kind: "truth-table",
          timeModel: "none",
          caption: LABELS.captions.tableDff,
          props: { table: "d-flip-flop" },
        },
      ],
    },
    {
      kind: "challenge",
      title: LABELS.titles.challenge,
      prose: "",
      interactives: [
        {
          id: "build-dff",
          kind: "challenge",
          timeModel: "clocked",
          caption: LABELS.captions.buildDff,
          lead: PROSE.buildDffLead,
          props: { challengeId: "flip-flop" },
        },
        {
          id: "write-d-latch",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.writeDLatch,
          lead: PROSE.writeDLatchLead,
          props: { challengeId: "latch-in-text" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "two-buttons",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "draw",
      interface: { inputs: [{ name: "A" }, { name: "B" }], outputs: [{ name: "LIGHT" }] },
      palette: ["nor", "or", "not", "and", "nand"],
      allowedConstructs: CONSTRUCTS,
      tests: {
        kind: "sequence",
        steps: [
          { label: "press A", set: { A: 1, B: 0 }, expect: { LIGHT: 1 } },
          { label: "release A", set: { A: 0, B: 0 }, expect: { LIGHT: 1 } },
          { label: "press B", set: { A: 0, B: 1 }, expect: { LIGHT: 0 } },
          { label: "release B", set: { A: 0, B: 0 }, expect: { LIGHT: 0 } },
          { label: "press A again", set: { A: 1, B: 0 }, expect: { LIGHT: 1 } },
          { label: "release A again", set: { A: 0, B: 0 }, expect: { LIGHT: 1 } },
        ],
      },
      hints: [...PROSE.c1Hints],
      reference: {
        hdl: `module two_buttons(input logic A, input logic B, output logic LIGHT);
  logic DARK;
  assign LIGHT = ~(B | DARK);
  assign DARK = ~(A | LIGHT);
endmodule
`,
      },
    },
    {
      id: "follow-and-hold",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "draw",
      interface: { inputs: [{ name: "D" }, { name: "EN" }], outputs: [{ name: "Q" }] },
      palette: ["sr-latch", "and", "not", "nor", "or"],
      allowedConstructs: CONSTRUCTS,
      tests: D_LATCH_TESTS,
      hints: [...PROSE.c2Hints],
      reference: { hdl: D_LATCH_TEXT },
    },
    {
      id: "flip-flop",
      title: LABELS.challengeTitles.c3,
      task: PROSE.c3Task,
      gradedDirection: "draw",
      interface: { inputs: [{ name: "D" }, { name: "CLK" }], outputs: [{ name: "Q" }] },
      palette: ["d-latch", "not", "and", "or", "nor"],
      allowedConstructs: CONSTRUCTS,
      tests: {
        kind: "sequence",
        steps: [
          { label: "D high, clock low", set: { D: 1, CLK: 0 } },
          { label: "clock rises", set: { CLK: 1 }, expect: { Q: 1 } },
          { label: "D changes while the clock is high", set: { D: 0 }, expect: { Q: 1 } },
          { label: "clock falls", set: { CLK: 0 }, expect: { Q: 1 } },
          { label: "D changes while the clock is low", set: { D: 1 }, expect: { Q: 1 } },
          { label: "D changes again while low", set: { D: 0 }, expect: { Q: 1 } },
          { label: "clock rises again", set: { CLK: 1 }, expect: { Q: 0 } },
          { label: "D high while the clock is high", set: { D: 1 }, expect: { Q: 0 } },
          { label: "clock falls again", set: { CLK: 0 }, expect: { Q: 0 } },
          { label: "third rise", set: { CLK: 1 }, expect: { Q: 1 } },
        ],
      },
      hints: [...PROSE.c3Hints],
      reference: {
        hdl: `module flip_flop(input logic D, input logic CLK, output logic Q);
  logic NCLK;
  logic ND;
  logic MS;
  logic MR;
  logic M;
  logic MB;
  logic NM;
  logic SS;
  logic SR;
  logic SB;
  assign NCLK = ~CLK;
  assign ND = ~D;
  assign MS = D & NCLK;
  assign MR = ND & NCLK;
  assign M = ~(MR | MB);
  assign MB = ~(MS | M);
  assign NM = ~M;
  assign SS = M & CLK;
  assign SR = NM & CLK;
  assign Q = ~(SR | SB);
  assign SB = ~(SS | Q);
endmodule
`,
      },
    },
    {
      id: "latch-in-text",
      title: LABELS.challengeTitles.c4,
      task: PROSE.c4Task,
      gradedDirection: "write",
      interface: { inputs: [{ name: "D" }, { name: "EN" }], outputs: [{ name: "Q" }] },
      allowedConstructs: CONSTRUCTS,
      initial: {
        hdl: `module follow_and_hold(input logic D, input logic EN, output logic Q);

endmodule
`,
      },
      tests: D_LATCH_TESTS,
      hints: [...PROSE.c4Hints],
      reference: { hdl: D_LATCH_TEXT },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "The SR latch introduced by its S and R inputs and its truth table, then the gated and D latches, then the master-slave flip-flop with a clock, each as a given circuit to be analysed; setup and hold given as parameters from a data sheet.",
    howThisDiffers:
      "The lesson starts from a task, a light that shows which of two buttons was pressed last, and from the question of whether gates alone can hold anything. The first circuit is a loop of inverters with a kick, and the even-odd contrast is the learner's first prediction. The latch's names arrive after the learner has built it. The forbidden input is found by holding both buttons. The flip-flop is motivated by the learner seeing the D latch follow for too long, and setup and hold are measured by moving D against the edge in the delay model, with the metastable outcome as a recorded, replayable roll rather than a parameter.",
  },
};
