// Copyright © 2026 Christopher Snow

// Lesson: Module 2, lesson 1, gates and truth tables.
//
// The structure is here; the words are in gates.prose.ts and gates.labels.ts. The circuits are
// the model's (packages/dd-model/src/logic.ts); the numbers the prose states are pinned by
// gates.facts.test.ts, read off the figures' own props.

import type { LessonInput } from "@dd/lesson-schema";

import { LABELS } from "./gates.labels";
import { PROSE } from "./gates.prose";

/** What a lesson's text may use: one-bit signals and `assign` with `~`, `&`, `|` and `^`. */
export const GATE_CONSTRUCTS = ["module", "ports", "logic", "assign", "op-bitwise"];

const ROWS_2 = (a: string, b: string, out: string, values: readonly number[]) =>
  [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ].map(([x, y], i) => ({
    label: `${a} ${x}, ${b} ${y}`,
    inputs: { [a]: x as number, [b]: y as number },
    expect: { [out]: values[i] as number },
  }));

/** Every row of a rule over three inputs, the first input as the top bit. */
export const rows3 = (
  names: readonly [string, string, string],
  out: string,
  f: (a: number, b: number, c: number) => number,
) =>
  Array.from({ length: 8 }, (_, i) => {
    const [a, b, c] = [(i >> 2) & 1, (i >> 1) & 1, i & 1];
    return {
      label: `${names[0]} ${a}, ${names[1]} ${b}, ${names[2]} ${c}`,
      inputs: { [names[0]]: a, [names[1]]: b, [names[2]]: c },
      expect: { [out]: f(a, b, c) },
    };
  });

/** The steps the fault lab runs: the four rows of WARM and DOOR, in table order. */
const ALARM_RUN = [
  { label: "WARM 0, DOOR 0", set: { WARM: 0, DOOR: 0 } },
  { label: "WARM 0, DOOR 1", set: { WARM: 0, DOOR: 1 } },
  { label: "WARM 1, DOOR 0", set: { WARM: 1, DOOR: 0 } },
  { label: "WARM 1, DOOR 1", set: { WARM: 1, DOOR: 1 } },
];

const NIGHT_HEADER =
  "module night(input logic WARM, input logic DOOR, input logic CLOSED, output logic NIGHT);";

export const gates: LessonInput = {
  id: "gates",
  title: LABELS.title,
  module: 2,
  order: 1,
  objectives: [...LABELS.objectives],
  introduces: ["gate", "truth table", "Boolean expression", "XOR", "SystemVerilog"],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "alarm-scene",
          kind: "scene",
          timeModel: "none",
          caption: LABELS.captions.scene,
          props: {
            sources: [
              {
                room: LABELS.scene.room,
                items: [
                  { kind: "sensor", label: LABELS.scene.sensor, signal: "WARM" },
                  { kind: "switch", label: LABELS.scene.door, signal: "DOOR" },
                ],
              },
            ],
            circuit: LABELS.scene.circuit,
            outputs: [{ kind: "lamp", label: LABELS.scene.lamp, signal: "ALARM" }],
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
          id: "predict-alarm",
          kind: "prediction",
          timeModel: "settle",
          caption: LABELS.captions.predictAlarm,
          props: {
            question: PROSE.p1Question,
            // A first try with an OR where the AND belongs, so the rule in the question does not
            // answer it and the construction is not a copy of it.
            libraryId: "alarm-try",
            run: [{ label: LABELS.steps.coldShut, set: { WARM: 0, DOOR: 0 } }],
            watch: "ALARM",
            options: [
              { value: "0", label: LABELS.options.alarm0 },
              { value: "1", label: LABELS.options.alarm1 },
            ],
            explain: PROSE.p1Explain,
            signals: ["WARM", "DOOR", "SHUT", "ALARM"],
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
          id: "explore-not",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.exploreNot,
          lead: PROSE.exploreNotLead,
          props: { libraryId: "not-gate", truthTable: "circuit" },
        },
        {
          id: "explore-and",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.exploreAnd,
          lead: PROSE.exploreAndLead,
          props: { libraryId: "and-gate", truthTable: "circuit" },
        },
        {
          id: "explore-or",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.exploreOr,
          lead: PROSE.exploreOrLead,
          after: PROSE.exploreOrAfter,
          props: { libraryId: "or-gate", truthTable: "circuit" },
        },
      ],
    },
    {
      kind: "construction",
      title: LABELS.titles.construction,
      prose: PROSE.construction,
      interactives: [
        {
          id: "build-alarm",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.buildAlarm,
          lead: PROSE.buildAlarmLead,
          props: { challengeId: "alarm" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "alarm-faults",
          kind: "fault-lab",
          timeModel: "settle",
          caption: LABELS.captions.alarmFaults,
          lead: PROSE.alarmFaultsLead,
          props: {
            libraryId: "alarm",
            faults: [
              { kind: "inverted", net: "SHUT", label: LABELS.faults.extraNot },
              { kind: "broken-wire", net: "SHUT", label: LABELS.faults.cutShut },
              {
                kind: "stuck-at",
                net: "DOOR",
                value: 0,
                label: LABELS.faults.doorStuck,
                explanation: PROSE.doorStuckExplain,
              },
            ],
            run: ALARM_RUN,
            outcomes: PROSE.alarmFaultsOutcomes,
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
          id: "alarm-expression",
          kind: "circuit-text",
          timeModel: "none",
          caption: LABELS.captions.alarmExpression,
          lead: PROSE.alarmExpressionLead,
          after: PROSE.alarmExpressionAfter,
          props: { libraryId: "alarm", form: "expression" },
        },
      ],
    },
    {
      kind: "generalisation",
      title: LABELS.titles.generalisation,
      prose: PROSE.generalisation,
      interactives: [
        {
          id: "clash-gates",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.clashGates,
          lead: PROSE.clashGatesLead,
          props: { libraryId: "clash-gates", truthTable: "circuit" },
        },
        {
          id: "clash-xor",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.clashXor,
          lead: PROSE.clashXorLead,
          after: PROSE.clashXorAfter,
          props: { libraryId: "clash-xor", truthTable: "circuit" },
        },
      ],
    },
    {
      kind: "challenge",
      title: LABELS.titles.challenge,
      prose: "",
      interactives: [
        {
          id: "write-night",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.writeNight,
          lead: PROSE.writeNightLead,
          props: { challengeId: "night" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "alarm",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "draw",
      interface: { inputs: [{ name: "WARM" }, { name: "DOOR" }], outputs: [{ name: "ALARM" }] },
      palette: ["and", "or", "not"],
      allowedConstructs: GATE_CONSTRUCTS,
      tests: { kind: "combinational", vectors: ROWS_2("WARM", "DOOR", "ALARM", [0, 0, 1, 0]) },
      hints: [...PROSE.c1Hints],
      reference: {
        hdl: `module alarm(input logic WARM, input logic DOOR, output logic ALARM);
  logic SHUT;
  assign SHUT = ~DOOR;
  assign ALARM = WARM & SHUT;
endmodule
`,
      },
    },
    {
      id: "night",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      interface: {
        inputs: [{ name: "WARM" }, { name: "DOOR" }, { name: "CLOSED" }],
        outputs: [{ name: "NIGHT" }],
      },
      allowedConstructs: GATE_CONSTRUCTS,
      initial: { hdl: `${NIGHT_HEADER}\n\nendmodule\n` },
      tests: {
        kind: "combinational",
        vectors: rows3(["WARM", "DOOR", "CLOSED"], "NIGHT", (w, d, c) => c & (d | w)),
      },
      hints: [...PROSE.c2Hints],
      reference: { hdl: `${NIGHT_HEADER}\n  assign NIGHT = CLOSED & (DOOR | WARM);\nendmodule\n` },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "The gates introduced one by one as symbols with their truth tables (AND, OR, NOT, then NAND, NOR, XOR, XNOR), each defined first in Boolean algebra with a light and two switches in series and in parallel, and XOR motivated by the half adder or by a staircase light worked from two switches.",
    howThisDiffers:
      "The lesson carries on Module 1's freezer room: the office display already turns the sensor's word into a temperature, and now has three more bits, WARM, DOOR and CLOSED. The first gate the learner meets is inside a circuit for a rule the shop needs, an alarm when the freezer is warm with its door shut, and the learner predicts what it does from two stated gate rules before seeing any truth table. The truth table is then read off the simulator for each gate, row by row as the learner presses the inputs. The fault experiment is a broken door switch and a cut wire, found by which rows of the table go wrong. The expression is generated from the drawn circuit rather than introduced as algebra. XOR arrives as the shortcut for a circuit the learner has already read, two sensors that should agree, built first from AND, OR and NOT; no adder and no two-way light switch appear.",
  },
};
