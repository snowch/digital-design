// Copyright © 2026 Christopher Snow

// Lesson: How does a circuit count?  (module 5, lesson 2)
//
// The structure is here; the words are in counters.prose.ts and counters.labels.ts. A counter is
// the registers lesson's register with its D worked out from its own Q: the next number up, from
// a chain of the half adders Module 3 built. The reason to count is the shop's: the office will
// send the manager a message, and if it fails it must wait a while before sending it again; the
// clock rises at a steady rate, so counting its edges measures the wait.

import type { LessonInput, TestSuite } from "@platform/lesson-schema";

import { PROSE } from "./counters.prose";
import { LABELS } from "./counters.labels";

/** What a drawn challenge's import panel accepts: gates as `assign`, flip-flops as `always_ff`. */
const DRAW_CONSTRUCTS = ["module", "ports", "logic", "assign", "op-bitwise", "always_ff", "if"];

/** The two-bit counter as gates: each half adder is an XOR and an AND. */
const COUNT_TWO_TEXT = `module count_two(input logic EN, input logic RST, input logic CLK, output logic Q1, output logic Q0);
  logic N0;
  logic C1;
  logic N1;
  assign N0 = Q0 ^ EN;
  assign C1 = Q0 & EN;
  assign N1 = Q1 ^ C1;
  always_ff @(posedge CLK) begin
    if (RST) Q0 <= 1'b0;
    else Q0 <= N0;
  end
  always_ff @(posedge CLK) begin
    if (RST) Q1 <= 1'b0;
    else Q1 <= N1;
  end
endmodule
`;

/** The four-bit counter with its TICK: the last half adder's carry. */
const COUNT_TICK_TEXT = `module count_tick(input logic EN, input logic RST, input logic CLK, output logic Q3, output logic Q2, output logic Q1, output logic Q0, output logic TICK);
  logic N0;
  logic C1;
  logic N1;
  logic C2;
  logic N2;
  logic C3;
  logic N3;
  assign N0 = Q0 ^ EN;
  assign C1 = Q0 & EN;
  assign N1 = Q1 ^ C1;
  assign C2 = Q1 & C1;
  assign N2 = Q2 ^ C2;
  assign C3 = Q2 & C2;
  assign N3 = Q3 ^ C3;
  assign TICK = Q3 & C3;
  always_ff @(posedge CLK) begin
    if (RST) Q0 <= 1'b0;
    else Q0 <= N0;
  end
  always_ff @(posedge CLK) begin
    if (RST) Q1 <= 1'b0;
    else Q1 <= N1;
  end
  always_ff @(posedge CLK) begin
    if (RST) Q2 <= 1'b0;
    else Q2 <= N2;
  end
  always_ff @(posedge CLK) begin
    if (RST) Q3 <= 1'b0;
    else Q3 <= N3;
  end
endmodule
`;

type SequenceStep = Extract<TestSuite, { kind: "sequence" }>["steps"][number];

/** The bits of a count, highest first, as expectations. */
function bits(n: number, width: number): Record<string, number> {
  const out: Record<string, number> = {};
  for (let i = width - 1; i >= 0; i--) out[`Q${i}`] = (n >> i) & 1;
  return out;
}

/**
 * The four-bit counter's tests: a reset, then edges with EN 1 up to 1111, where TICK is 1, an EN
 * that falls while the clock is high (TICK follows it, the count does not), an edge with EN 0, and
 * the wrap to 0000.
 */
function countTickSteps(): SequenceStep[] {
  const steps: SequenceStep[] = [
    { label: "RST 1, EN 1, clock low", set: { RST: 1, EN: 1, CLK: 0 } },
    { label: "edge with RST 1", set: { CLK: 1 }, expect: { ...bits(0, 4), TICK: 0 } },
    { label: "clock low, RST 0", set: { CLK: 0, RST: 0 } },
  ];
  for (let n = 1; n <= 15; n++) {
    steps.push({
      label: `edge ${n}`,
      set: { CLK: 1 },
      expect: { ...bits(n, 4), TICK: n === 15 ? 1 : 0 },
    });
    steps.push({ label: `clock low after edge ${n}`, set: { CLK: 0 } });
  }
  steps.push(
    {
      label: "EN falls with the count at 1111",
      set: { EN: 0 },
      expect: { ...bits(15, 4), TICK: 0 },
    },
    { label: "edge with EN 0", set: { CLK: 1 }, expect: { ...bits(15, 4), TICK: 0 } },
    {
      label: "EN rises while the clock is high",
      set: { EN: 1 },
      expect: { ...bits(15, 4), TICK: 1 },
    },
    { label: "clock low again", set: { CLK: 0 }, expect: { ...bits(15, 4), TICK: 1 } },
    { label: "edge 16", set: { CLK: 1 }, expect: { ...bits(0, 4), TICK: 0 } },
  );
  return steps;
}

export const counters: LessonInput = {
  id: "counters",
  title: LABELS.title,
  module: 5,
  order: 2,
  objectives: [...LABELS.objectives],
  introduces: ["counter"],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "count-scene",
          kind: "scene",
          timeModel: "none",
          caption: LABELS.captions.scene,
          props: {
            sources: [
              {
                items: [
                  { kind: "switch", label: LABELS.scene.count, signal: "EN" },
                  { kind: "button", label: LABELS.scene.reset, signal: "RST" },
                  { kind: "clock", label: LABELS.scene.clock, signal: "CLK" },
                ],
              },
            ],
            circuit: LABELS.scene.circuit,
            outputs: [
              { kind: "lamp", label: LABELS.scene.tick, signal: "TICK" },
              { kind: "readout", label: LABELS.scene.display, width: 4 },
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
          id: "predict-wrap",
          kind: "prediction",
          timeModel: "clocked",
          caption: LABELS.captions.predictWrap,
          props: {
            question: PROSE.p1Question,
            libraryId: "counter-4",
            run: [
              { label: "RST 1", set: { RST: 1, EN: 1, CLK: 0 }, clock: "CLK" },
              { label: "RST 0", set: { RST: 0 } },
              ...Array.from({ length: 16 }, (_, i) => ({ label: `${i + 1}`, clock: "CLK" })),
            ],
            watch: "Q",
            options: [
              { value: "1111", label: LABELS.options.p1Stop },
              { value: "0000", label: LABELS.options.p1Zero },
              { value: "XXXX", label: LABELS.options.unknown },
            ],
            explain: PROSE.p1Explain,
            signals: ["CLK", "RST", "EN", "Q", "TICK"],
          },
        },
        {
          id: "predict-pause",
          kind: "prediction",
          timeModel: "clocked",
          caption: LABELS.captions.predictPause,
          props: {
            question: PROSE.p2Question,
            libraryId: "counter-4",
            run: [
              { label: "RST 1", set: { RST: 1, EN: 1, CLK: 0 }, clock: "CLK" },
              { label: "edge 1", set: { RST: 0 }, clock: "CLK" },
              { label: "edge 2", clock: "CLK" },
              { label: "EN 0", set: { EN: 0 } },
              { label: "edge 3", clock: "CLK" },
              { label: "edge 4", clock: "CLK" },
              { label: "edge 5", clock: "CLK" },
            ],
            watch: "Q",
            options: [
              { value: "0101", label: LABELS.options.p2Counted },
              { value: "0000", label: LABELS.options.p2Zero },
              { value: "0010", label: LABELS.options.p2Kept },
            ],
            explain: PROSE.p2Explain,
            signals: ["CLK", "RST", "EN", "Q"],
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
          id: "counter-explorer",
          kind: "circuit-explorer",
          timeModel: "clocked",
          caption: LABELS.captions.counterExplorer,
          lead: PROSE.counterExplorerLead,
          after: PROSE.counterExplorerAfter,
          props: { libraryId: "counter-4", clock: "CLK" },
        },
      ],
    },
    {
      kind: "construction",
      title: LABELS.titles.construction,
      prose: PROSE.construction,
      interactives: [
        {
          id: "build-count-two",
          kind: "challenge",
          timeModel: "clocked",
          caption: LABELS.captions.buildCountTwo,
          lead: PROSE.buildCountTwoLead,
          props: { challengeId: "count-two" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "counter-faults",
          kind: "fault-lab",
          timeModel: "clocked",
          caption: LABELS.captions.counterFaults,
          lead: PROSE.counterFaultsLead,
          props: {
            libraryId: "counter-4",
            faults: [
              {
                kind: "stuck-at",
                net: "add/C2",
                value: 0,
                label: LABELS.faults.carryCut,
                outcome: PROSE.counterFaultsOutcomesFault1,
              },
              {
                kind: "stuck-at",
                net: "EN",
                value: 1,
                label: LABELS.faults.enHigh,
                outcome: PROSE.counterFaultsOutcomesFault2,
              },
              {
                kind: "wrong-gate",
                path: "add/ha0/xorSum",
                gate: "or",
                label: LABELS.faults.xorToOr,
                outcome: PROSE.counterFaultsOutcomesFault3,
              },
            ],
            run: [
              { label: "reset", set: { RST: 1, EN: 1, CLK: 0 }, clock: "CLK" },
              { label: "edge 1", set: { RST: 0 }, clock: "CLK" },
              { label: "edge 2", clock: "CLK" },
              { label: "edge 3", clock: "CLK" },
              { label: "edge 4", clock: "CLK" },
              { label: "edge 5", clock: "CLK" },
              { label: "edge with EN 0", set: { EN: 0 }, clock: "CLK" },
            ],
          },
        },
        {
          id: "predict-no-reset",
          kind: "prediction",
          timeModel: "clocked",
          caption: LABELS.captions.predictNoReset,
          lead: PROSE.predictNoResetLead,
          props: {
            question: PROSE.p3Question,
            libraryId: "counter-4",
            run: [
              { label: "EN 1, RST 0", set: { RST: 0, EN: 1, CLK: 0 } },
              { label: "edge 1", clock: "CLK" },
              { label: "edge 2", clock: "CLK" },
              { label: "edge 3", clock: "CLK" },
            ],
            watch: "Q",
            options: [
              { value: "0011", label: LABELS.options.p3Three },
              { value: "0000", label: LABELS.options.p3Zero },
              { value: "XXXX", label: LABELS.options.unknown },
            ],
            explain: PROSE.p3Explain,
            signals: ["CLK", "RST", "EN", "Q"],
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
          id: "add-one",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.addOne,
          lead: PROSE.addOneLead,
          after: PROSE.addOneAfter,
          props: {
            libraryId: "add-one-4",
            showSteps: true,
            scope: "add-one",
            initial: { Q: "0111", EN: 0 },
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
          id: "count-to-five",
          kind: "circuit-explorer",
          timeModel: "clocked",
          caption: LABELS.captions.countToFive,
          lead: PROSE.countToFiveLead,
          after: PROSE.countToFiveAfter,
          props: {
            libraryId: "counter-to-5",
            clock: "CLK",
            prime: [{ set: { RST: 1, EN: 1, CLK: 0 }, clock: "CLK" }, { set: { RST: 0 } }],
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
          id: "build-count-tick",
          kind: "challenge",
          timeModel: "clocked",
          caption: LABELS.captions.buildCountTick,
          lead: PROSE.buildCountTickLead,
          props: { challengeId: "count-tick" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "count-two",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "draw",
      interface: {
        inputs: [{ name: "EN" }, { name: "RST" }, { name: "CLK" }],
        outputs: [{ name: "Q1" }, { name: "Q0" }],
      },
      palette: ["dff-reset", "half-adder"],
      allowedConstructs: DRAW_CONSTRUCTS,
      tests: {
        kind: "sequence",
        steps: [
          { label: "RST 1, EN 1, clock low", set: { RST: 1, EN: 1, CLK: 0 } },
          { label: "edge with RST 1", set: { CLK: 1 }, expect: { Q1: 0, Q0: 0 } },
          { label: "clock low, RST 0", set: { CLK: 0, RST: 0 }, expect: { Q1: 0, Q0: 0 } },
          { label: "edge 1", set: { CLK: 1 }, expect: { Q1: 0, Q0: 1 } },
          { label: "EN falls while the clock is high", set: { EN: 0 }, expect: { Q1: 0, Q0: 1 } },
          { label: "clock low", set: { CLK: 0 }, expect: { Q1: 0, Q0: 1 } },
          { label: "edge with EN 0", set: { CLK: 1 }, expect: { Q1: 0, Q0: 1 } },
          { label: "clock low, EN 1", set: { CLK: 0, EN: 1 } },
          { label: "edge 2", set: { CLK: 1 }, expect: { Q1: 1, Q0: 0 } },
          { label: "clock low after edge 2", set: { CLK: 0 } },
          { label: "edge 3", set: { CLK: 1 }, expect: { Q1: 1, Q0: 1 } },
          { label: "clock low after edge 3", set: { CLK: 0 } },
          { label: "edge 4", set: { CLK: 1 }, expect: { Q1: 0, Q0: 0 } },
        ],
      },
      hints: [...PROSE.c1Hints],
      reference: { hdl: COUNT_TWO_TEXT },
    },
    {
      id: "count-tick",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "draw",
      interface: {
        inputs: [{ name: "EN" }, { name: "RST" }, { name: "CLK" }],
        outputs: [{ name: "Q3" }, { name: "Q2" }, { name: "Q1" }, { name: "Q0" }, { name: "TICK" }],
      },
      palette: ["dff-reset", "half-adder"],
      allowedConstructs: DRAW_CONSTRUCTS,
      tests: { kind: "sequence", steps: countTickSteps() },
      hints: [...PROSE.c2Hints],
      reference: { hdl: COUNT_TICK_TEXT },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "A binary up-counter built from T or JK flip-flops, each toggling when all lower bits are 1, or a ripple counter in which each flip-flop's output clocks the next; a counting table from 0000 to 1111; then a decade (mod-10) counter that clears itself at 1010, often followed by an up/down counter.",
    howThisDiffers:
      "The counter is the registers lesson's register with its D worked out from its own Q by a chain of the half adders the learner built in Module 3, so counting is adding: no T or JK flip-flop appears. The reason to count is the shop's own (a wait before a message is sent again, measured in clock edges), and the counter's TICK is the last half adder's carry out, the overflow Module 3 named, rather than a separate detector. The values a carry passes through on its way along the chain are shown in the stepped model inside the adder, where the register never takes them, instead of in a ripple counter, which the course does not build. The generalisation counts 0 to 5 with Module 3's comparator driving the register's reset, not a decade counter.",
  },
};
