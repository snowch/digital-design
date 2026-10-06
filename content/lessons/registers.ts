// Copyright © 2026 Christopher Snow

// Lesson: How does a circuit hold a word?  (module 5, lesson 1)
//
// The structure is here; the words are in registers.prose.ts and registers.labels.ts. Everything
// a learner reads in this file is a name a signal already has (D, EN, RST, CLK, Q, IN, Q0 to Q3)
// or a label the shared brief drafted.

import type { LessonInput } from "@dd/lesson-schema";

import { PROSE } from "./registers.prose";
import { LABELS } from "./registers.labels";

/** What a drawn challenge's import panel accepts: gates as `assign`, a flip-flop as `always_ff`. */
const DRAW_CONSTRUCTS = ["module", "ports", "logic", "assign", "op-bitwise", "always_ff"];

const TEXT_CONSTRUCTS = [...DRAW_CONSTRUCTS, "vector", "if"];

/** What the display must show when the power comes on: the value the reset loads. */
export const POWER_ON_VALUE = "0000";

const KEEP_BIT_TEXT = `module keep_bit(input logic D, input logic EN, input logic CLK, output logic Q);
  logic NEN;
  logic LOAD;
  logic KEEP;
  logic CHOICE;
  assign NEN = ~EN;
  assign LOAD = D & EN;
  assign KEEP = Q & NEN;
  assign CHOICE = LOAD | KEEP;
  always_ff @(posedge CLK) Q <= CHOICE;
endmodule
`;

const SHIFT_TEXT = `module shift_four(input logic IN, input logic CLK, output logic Q0, output logic Q1, output logic Q2, output logic Q3);
  always_ff @(posedge CLK) Q0 <= IN;
  always_ff @(posedge CLK) Q1 <= Q0;
  always_ff @(posedge CLK) Q2 <= Q1;
  always_ff @(posedge CLK) Q3 <= Q2;
endmodule
`;

// The same module name and port order as the generalisation figure's generated text.
const REGISTER_HEADER =
  "module register_4(input logic [3:0] D, input logic CLK, input logic RST, input logic EN, output logic [3:0] Q);";

const REGISTER_TEXT = `${REGISTER_HEADER}
  always_ff @(posedge CLK) begin
    if (RST) Q <= 4'b${POWER_ON_VALUE};
    else if (EN) Q <= D;
  end
endmodule
`;

export const registers: LessonInput = {
  id: "registers",
  title: LABELS.title,
  module: 5,
  order: 1,
  objectives: [...LABELS.objectives],
  introduces: ["register", "shift register"],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "save-scene",
          kind: "scene",
          timeModel: "none",
          caption: LABELS.captions.scene,
          props: {
            sources: [
              {
                items: [
                  { kind: "switch", label: LABELS.scene.switches, width: 4 },
                  { kind: "button", label: LABELS.scene.save },
                  { kind: "clock", label: LABELS.scene.clock, signal: "CLK" },
                ],
              },
            ],
            circuit: LABELS.scene.circuit,
            // What the display must show when the power comes on: the reset value, as the
            // question states it.
            outputs: [
              { kind: "readout", label: LABELS.scene.display, value: POWER_ON_VALUE, width: 4 },
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
          id: "predict-word",
          kind: "prediction",
          timeModel: "clocked",
          caption: LABELS.captions.predictWord,
          props: {
            question: PROSE.p1Question,
            libraryId: "register-4-plain",
            run: [
              { label: "D = 0110", set: { D: "0110", CLK: 0 } },
              { label: "edge", clock: "CLK" },
              { label: "D = 1111", set: { D: "1111" } },
            ],
            watch: "Q",
            options: [
              { value: "0110", label: LABELS.options.p1Old },
              { value: "1111", label: LABELS.options.p1New },
              { value: "XXXX", label: LABELS.options.unknown },
            ],
            explain: PROSE.p1Explain,
            signals: ["CLK", "D", "Q"],
          },
        },
        {
          id: "predict-keep",
          kind: "prediction",
          timeModel: "clocked",
          caption: LABELS.captions.predictKeep,
          props: {
            question: PROSE.p2Question,
            libraryId: "register-4-enable",
            run: [
              { label: "D = 0110, EN = 0", set: { D: "0110", EN: 0, CLK: 0 } },
              { label: "edge 1", clock: "CLK" },
              { label: "edge 2", clock: "CLK" },
              { label: "edge 3", clock: "CLK" },
            ],
            watch: "Q",
            options: [
              { value: "0000", label: LABELS.options.p2Zero },
              { value: "0110", label: LABELS.options.p2D },
              { value: "XXXX", label: LABELS.options.unknown },
            ],
            explain: PROSE.p2Explain,
            signals: ["CLK", "EN", "D", "Q"],
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
          id: "four-flip-flops",
          kind: "circuit-explorer",
          timeModel: "clocked",
          caption: LABELS.captions.fourFlipFlops,
          lead: PROSE.fourFlipFlopsLead,
          after: PROSE.fourFlipFlopsAfter,
          props: { libraryId: "four-flip-flops", clock: "CLK" },
        },
      ],
    },
    {
      kind: "construction",
      title: LABELS.titles.construction,
      prose: PROSE.construction,
      interactives: [
        {
          id: "build-keep-bit",
          kind: "challenge",
          timeModel: "clocked",
          caption: LABELS.captions.buildKeepBit,
          lead: PROSE.buildKeepBitLead,
          props: { challengeId: "keep-bit" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "keep-faults",
          kind: "fault-lab",
          timeModel: "clocked",
          caption: LABELS.captions.keepFaults,
          lead: PROSE.keepFaultsLead,
          props: {
            // Each fault's outcome shows once that fault has run, so the lead's prediction is not answered first.

            libraryId: "keep-bit",
            faults: [
              {
                kind: "stuck-at",
                net: "KEEP",
                value: 0,
                label: LABELS.faults.keepCut,
                outcome: PROSE.keepFaultsAfterFault1,
              },
              {
                kind: "stuck-at",
                net: "EN",
                value: 1,
                label: LABELS.faults.enHigh,
                outcome: PROSE.keepFaultsAfterFault2,
              },
              {
                kind: "wrong-gate",
                path: "orChoice",
                gate: "and",
                label: LABELS.faults.orToAnd,
                outcome: PROSE.keepFaultsAfterFault3,
              },
            ],
            run: [
              { label: "load 1", set: { D: 1, EN: 1, CLK: 0 }, clock: "CLK" },
              { label: "edge with EN 0", set: { D: 0, EN: 0 }, clock: "CLK" },
              { label: "another edge with EN 0", clock: "CLK" },
              { label: "load 0", set: { EN: 1 }, clock: "CLK" },
            ],
          },
        },
        {
          id: "gated-clock",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.gatedClock,
          lead: PROSE.gatedClockLead,
          after: PROSE.gatedClockAfter,
          props: { libraryId: "gated-clock-bit" },
        },
      ],
    },
    {
      kind: "explanation",
      title: LABELS.titles.explanation,
      prose: PROSE.explanation,
      interactives: [
        {
          id: "keep-clear-bit",
          kind: "circuit-explorer",
          timeModel: "clocked",
          caption: LABELS.captions.keepClearBit,
          lead: PROSE.keepClearBitLead,
          props: { libraryId: "keep-clear-bit", clock: "CLK", truthTable: "register-bit" },
        },
      ],
    },
    {
      kind: "generalisation",
      title: LABELS.titles.generalisation,
      prose: "",
      interactives: [
        {
          id: "register-as-text",
          kind: "circuit-text",
          timeModel: "none",
          caption: LABELS.captions.registerAsText,
          lead: PROSE.registerAsTextLead,
          after: PROSE.registerAsTextAfter,
          props: { libraryId: "register-4-enable" },
        },
      ],
    },
    {
      kind: "challenge",
      title: LABELS.titles.challenge,
      prose: "",
      interactives: [
        {
          id: "predict-chain",
          kind: "prediction",
          timeModel: "clocked",
          caption: LABELS.captions.predictChain,
          lead: PROSE.predictChainLead,
          props: {
            question: PROSE.p3Question,
            libraryId: "shift-4",
            run: [
              { label: "IN = 1", set: { IN: 1, CLK: 0 } },
              { label: "edge 1", clock: "CLK" },
              { label: "IN = 0", set: { IN: 0 } },
              { label: "edge 2", clock: "CLK" },
              { label: "edge 3", clock: "CLK" },
            ],
            watch: "Q2",
            options: [
              { value: "0", label: LABELS.options.p3Zero },
              { value: "1", label: LABELS.options.p3One },
              { value: "X", label: LABELS.options.p3X },
            ],
            explain: PROSE.p3Explain,
            signals: ["CLK", "IN", "Q0", "Q1", "Q2", "Q3"],
          },
        },
        {
          id: "build-shift",
          kind: "challenge",
          timeModel: "clocked",
          caption: LABELS.captions.buildShift,
          lead: PROSE.buildShiftLead,
          props: { challengeId: "shift-four" },
        },
        {
          id: "write-register",
          kind: "challenge",
          timeModel: "clocked",
          caption: LABELS.captions.writeRegister,
          lead: PROSE.writeRegisterLead,
          props: { challengeId: "register-in-text" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "keep-bit",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "draw",
      interface: {
        inputs: [{ name: "D" }, { name: "EN" }, { name: "CLK" }],
        outputs: [{ name: "Q" }],
      },
      palette: ["dff", "and", "or", "not"],
      allowedConstructs: DRAW_CONSTRUCTS,
      tests: {
        kind: "sequence",
        steps: [
          { label: "D 1, EN 1, clock low", set: { D: 1, EN: 1, CLK: 0 } },
          { label: "edge with EN 1", set: { CLK: 1 }, expect: { Q: 1 } },
          { label: "clock low, D 0, EN 0", set: { CLK: 0, D: 0, EN: 0 }, expect: { Q: 1 } },
          { label: "edge with EN 0", set: { CLK: 1 }, expect: { Q: 1 } },
          { label: "EN rises while the clock is high", set: { EN: 1 }, expect: { Q: 1 } },
          { label: "clock falls", set: { CLK: 0 }, expect: { Q: 1 } },
          { label: "edge with EN 1 and D 0", set: { CLK: 1 }, expect: { Q: 0 } },
          { label: "clock low, D 1, EN 0", set: { CLK: 0, D: 1, EN: 0 }, expect: { Q: 0 } },
          { label: "edge with EN 0 again", set: { CLK: 1 }, expect: { Q: 0 } },
        ],
      },
      hints: [...PROSE.c1Hints],
      reference: { hdl: KEEP_BIT_TEXT },
    },
    {
      id: "shift-four",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "draw",
      interface: {
        inputs: [{ name: "IN" }, { name: "CLK" }],
        outputs: [{ name: "Q0" }, { name: "Q1" }, { name: "Q2" }, { name: "Q3" }],
      },
      palette: ["dff", "and", "or", "not"],
      allowedConstructs: DRAW_CONSTRUCTS,
      tests: {
        kind: "sequence",
        steps: [
          { label: "IN 1, clock low", set: { IN: 1, CLK: 0 } },
          { label: "edge 1", set: { CLK: 1 }, expect: { Q0: 1 } },
          { label: "IN falls while the clock is high", set: { IN: 0 }, expect: { Q0: 1 } },
          { label: "clock falls", set: { CLK: 0 }, expect: { Q0: 1 } },
          { label: "edge 2", set: { CLK: 1 }, expect: { Q0: 0, Q1: 1 } },
          { label: "clock low, IN 1", set: { CLK: 0, IN: 1 } },
          { label: "edge 3", set: { CLK: 1 }, expect: { Q0: 1, Q1: 0, Q2: 1 } },
          { label: "clock low", set: { CLK: 0 } },
          { label: "edge 4", set: { CLK: 1 }, expect: { Q0: 1, Q1: 1, Q2: 0, Q3: 1 } },
          { label: "clock low, IN 0", set: { CLK: 0, IN: 0 } },
          { label: "edge 5", set: { CLK: 1 }, expect: { Q0: 0, Q1: 1, Q2: 1, Q3: 0 } },
        ],
      },
      hints: [...PROSE.c2Hints],
      reference: { hdl: SHIFT_TEXT },
    },
    {
      id: "register-in-text",
      title: LABELS.challengeTitles.c3,
      task: PROSE.c3Task,
      gradedDirection: "write",
      interface: {
        inputs: [{ name: "D", width: 4 }, { name: "EN" }, { name: "RST" }, { name: "CLK" }],
        outputs: [{ name: "Q", width: 4 }],
      },
      allowedConstructs: TEXT_CONSTRUCTS,
      initial: { hdl: `${REGISTER_HEADER}\n\nendmodule\n` },
      tests: {
        kind: "sequence",
        steps: [
          { label: "D 0110, EN 1, clock low", set: { D: "0110", EN: 1, RST: 0, CLK: 0 } },
          { label: "edge with EN 1", set: { CLK: 1 }, expect: { Q: "0110" } },
          { label: "clock low, D 1111, EN 0", set: { CLK: 0, D: "1111", EN: 0 } },
          { label: "edge with EN 0", set: { CLK: 1 }, expect: { Q: "0110" } },
          { label: "EN rises while the clock is high", set: { EN: 1 }, expect: { Q: "0110" } },
          { label: "clock falls", set: { CLK: 0 }, expect: { Q: "0110" } },
          { label: "edge with EN 1 and D 1111", set: { CLK: 1 }, expect: { Q: "1111" } },
          { label: "clock low, RST 1, D 1010", set: { CLK: 0, RST: 1, D: "1010" } },
          { label: "edge with RST 1 and EN 1", set: { CLK: 1 }, expect: { Q: "0000" } },
          { label: "clock low, RST 0", set: { CLK: 0, RST: 0 } },
          { label: "edge with EN 1 and D 1010", set: { CLK: 1 }, expect: { Q: "1010" } },
        ],
      },
      hints: [...PROSE.c3Hints],
      reference: { hdl: REGISTER_TEXT },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "A four-bit register drawn as four D flip-flops with a common clock, then a parallel-load register made by putting a two-input selector in front of each flip-flop, then a shift register given as a serial-in, parallel-out chain with a table of its contents after each clock, usually followed directly by counters.",
    howThisDiffers:
      "The lesson starts from a task, a display that must show what four switches held at the last press of Save and start at 0000, on a clock that never stops. The learner first predicts that a register with its enable held low from a fresh start stays unknown, which is why the reset is needed. The load enable is built from AND, OR and NOT gates around a flip-flop block, with no selector part, and the tempting wrong answer, an AND gate in the clock's path, is a figure where the learner raises EN while CLK is high and watches an edge appear that the clock never made; the challenge's tests catch it. The reset is one more AND gate whose priority is then read in the generated text. The shift register answers the question the previous lesson ended on, a flip-flop whose D comes from a flip-flop on the same edge, and is predicted before it is named or built.",
  },
};
