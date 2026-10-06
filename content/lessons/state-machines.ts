// Copyright © 2026 Christopher Snow

// Lesson: How does a circuit work through a list of jobs?  (module 5, lesson 4; Slice 2)
//
// The structure is here; the words are in state-machines.prose.ts and state-machines.labels.ts.
// The retry controller approved at Checkpoint 1: the shop's office sends the manager a message,
// waits for an answer, sends it again after the next TICK if it failed, and gives up and sounds
// the siren if a whole TICK passes with no answer. Its next-state logic is read off the encoded
// table row by row, without minimising, and the `always_comb` `case` text is shown as the same
// table in words.

import { MACHINES, machineText, nextState, stateNamed } from "@dd/dd-model";
import type { LessonInput } from "@dd/lesson-schema";

import { PROSE } from "./state-machines.prose";
import { LABELS } from "./state-machines.labels";

const RETRY = MACHINES.retry;

/** What the drawn challenge's import panel accepts: gates as `assign`. */
const DRAW_CONSTRUCTS = ["module", "ports", "logic", "assign", "op-bitwise"];

/** What the written lab may use: the state machine's form, with `case` and `==`. */
const TEXT_CONSTRUCTS = [
  "module",
  "ports",
  "logic",
  "vector",
  "assign",
  "op-bitwise",
  "op-compare",
  "always_ff",
  "always_comb",
  "if",
  "case",
];

/** The state's code as a word, by name: `01` for TRY. */
const code = (name: string) => stateNamed(RETRY, name).code;

/** Bit 1 of the next state, read off the table row by row: the rows whose next state is WAIT or GIVE_UP. */
const NEXT_ONE_TEXT = `module next_one(input logic S1, input logic S0, input logic OK, input logic FAIL, input logic TICK, output logic N1);
  logic TRY;
  logic WAIT;
  logic GIVE_UP;
  logic R4;
  logic R5;
  logic R8;
  assign TRY = ~S1 & S0;
  assign WAIT = S1 & ~S0;
  assign GIVE_UP = S1 & S0;
  assign R4 = TRY & ~OK & FAIL;
  assign R5 = TRY & ~OK & ~FAIL & TICK;
  assign R8 = WAIT & ~TICK;
  assign N1 = R4 | R5 | R8 | GIVE_UP;
endmodule
`;

/** Every row of the next-state bit's table: all 32 values of S1, S0, OK, FAIL and TICK. */
function nextOneVectors() {
  const out: { inputs: Record<string, number>; expect: Record<string, number> }[] = [];
  for (let k = 0; k < 32; k++) {
    const v = (bit: number) => (k >> bit) & 1;
    const inputs = { S1: v(4), S0: v(3), OK: v(2), FAIL: v(1), TICK: v(0) };
    const state = RETRY.states.find((s) => s.code === `${inputs.S1}${inputs.S0}`)!.name;
    const to = nextState(RETRY, state, {
      GO: 0,
      OK: inputs.OK as 0 | 1,
      FAIL: inputs.FAIL as 0 | 1,
      TICK: inputs.TICK as 0 | 1,
    })!;
    out.push({ inputs, expect: { N1: Number(code(to)[0]) } });
  }
  return out;
}

/** The inputs as the run sets them, every one named so a step leaves none unknown. */
const quiet = { GO: 0, OK: 0, FAIL: 0, TICK: 0 };

export const stateMachines: LessonInput = {
  id: "state-machines",
  title: LABELS.title,
  module: 5,
  order: 4,
  objectives: [...LABELS.objectives],
  introduces: ["state machine", "state diagram", "next-state logic"],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "retry-scene",
          kind: "scene",
          timeModel: "none",
          caption: LABELS.captions.scene,
          props: {
            sources: [
              {
                room: LABELS.scene.office,
                items: [
                  { kind: "switch", label: LABELS.scene.go, signal: "GO" },
                  { kind: "receiver", label: LABELS.scene.answers, signal: "OK" },
                  { kind: "receiver", label: LABELS.scene.failed, signal: "FAIL" },
                  { kind: "clock", label: LABELS.scene.timer, signal: "TICK" },
                  { kind: "clock", label: LABELS.scene.clock, signal: "CLK" },
                ],
              },
            ],
            circuit: LABELS.scene.circuit,
            outputs: [
              { kind: "lamp", label: LABELS.scene.sender, signal: "SEND" },
              { kind: "lamp", label: LABELS.scene.siren, signal: "SIREN" },
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
          id: "predict-stay",
          kind: "prediction",
          timeModel: "clocked",
          caption: LABELS.captions.predictStay,
          props: {
            question: PROSE.p1Question,
            libraryId: "retry",
            run: [
              { label: "RST 1", set: { ...quiet, RST: 1, CLK: 0 }, clock: "CLK" },
              { label: "GO 1", set: { RST: 0, GO: 1 }, clock: "CLK" },
              { label: "GO 0", set: { GO: 0 }, clock: "CLK" },
              { label: "edge", clock: "CLK" },
            ],
            watch: "S",
            options: [
              { value: code("IDLE"), label: LABELS.options.p1Idle },
              { value: code("TRY"), label: LABELS.options.p1Try },
              { value: code("WAIT"), label: LABELS.options.p1Wait },
            ],
            explain: PROSE.p1Explain,
            signals: [
              "CLK",
              "GO",
              {
                net: "S",
                label: "S",
                names: { "00": "IDLE", "01": "TRY", "10": "WAIT", "11": "GIVE_UP" },
              },
              "SEND",
            ],
          },
        },
        {
          id: "predict-give-up",
          kind: "prediction",
          timeModel: "clocked",
          caption: LABELS.captions.predictGiveUp,
          props: {
            question: PROSE.p2Question,
            libraryId: "retry",
            run: [
              { label: "RST 1", set: { ...quiet, RST: 1, CLK: 0 }, clock: "CLK" },
              { label: "GO 1", set: { RST: 0, GO: 1 }, clock: "CLK" },
              { label: "TICK 1", set: { GO: 0, TICK: 1 }, clock: "CLK" },
              { label: "OK 1", set: { TICK: 0, OK: 1 }, clock: "CLK" },
            ],
            watch: "S",
            options: [
              { value: code("IDLE"), label: LABELS.options.p2Idle },
              { value: code("GIVE_UP"), label: LABELS.options.p2GiveUp },
              { value: code("TRY"), label: LABELS.options.p2Try },
            ],
            explain: PROSE.p2Explain,
            signals: [
              "CLK",
              "GO",
              "OK",
              "TICK",
              {
                net: "S",
                label: "S",
                names: { "00": "IDLE", "01": "TRY", "10": "WAIT", "11": "GIVE_UP" },
              },
              "SIREN",
            ],
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
          id: "retry-machine",
          kind: "state-machine",
          timeModel: "clocked",
          caption: LABELS.captions.retryMachine,
          lead: PROSE.retryMachineLead,
          after: PROSE.retryMachineAfter,
          props: {
            machine: "retry",
            show: ["diagram", "table", "circuit", "trace"],
            prime: [{ set: { RST: 1 }, clock: "CLK" }, { set: { RST: 0 } }],
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
          id: "build-next-one",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.buildNextOne,
          lead: PROSE.buildNextOneLead,
          props: { challengeId: "next-one" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "retry-faults",
          kind: "fault-lab",
          timeModel: "clocked",
          caption: LABELS.captions.retryFaults,
          lead: PROSE.retryFaultsLead,
          props: {
            libraryId: "retry",
            scope: "next-state-logic",
            faults: [
              {
                kind: "stuck-at",
                net: "next-state-logic/R4",
                value: 0,
                label: LABELS.faults.row4,
              },
              {
                kind: "stuck-at",
                net: "next-state-logic/R8",
                value: 0,
                label: LABELS.faults.row8,
              },
              {
                kind: "wrong-gate",
                path: "next-state-logic/row5",
                gate: "or",
                label: LABELS.faults.row5Or,
              },
            ],
            run: [
              { label: "reset", set: { ...quiet, RST: 1, CLK: 0 }, clock: "CLK" },
              { label: "GO 1", set: { RST: 0, GO: 1 }, clock: "CLK" },
              { label: "FAIL 1", set: { GO: 0, FAIL: 1 }, clock: "CLK" },
              { label: "waiting", set: { FAIL: 0 }, clock: "CLK" },
              { label: "TICK 1", set: { TICK: 1 }, clock: "CLK" },
              { label: "no answer by the next TICK", clock: "CLK" },
            ],
            outcomes: PROSE.retryFaultsOutcomes,
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
          id: "next-state-inside",
          kind: "circuit-explorer",
          timeModel: "clocked",
          caption: LABELS.captions.nextStateInside,
          lead: PROSE.nextStateInsideLead,
          after: PROSE.nextStateInsideAfter,
          props: {
            libraryId: "retry",
            clock: "CLK",
            scope: "next-state-logic",
            prime: [{ set: { RST: 1 }, clock: "CLK" }, { set: { RST: 0 } }],
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
          id: "retry-as-text",
          kind: "state-machine",
          timeModel: "clocked",
          caption: LABELS.captions.retryAsText,
          lead: PROSE.retryAsTextLead,
          after: PROSE.retryAsTextAfter,
          props: {
            machine: "retry",
            show: ["diagram", "text"],
            textStyle: "codes",
            prime: [{ set: { RST: 1 }, clock: "CLK" }, { set: { RST: 0 } }],
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
          id: "predict-reset",
          kind: "prediction",
          timeModel: "clocked",
          caption: LABELS.captions.predictReset,
          lead: PROSE.predictResetLead,
          props: {
            question: PROSE.p3Question,
            libraryId: "retry",
            run: [
              { label: "RST 1", set: { ...quiet, RST: 1, CLK: 0 }, clock: "CLK" },
              { label: "GO 1", set: { RST: 0, GO: 1 }, clock: "CLK" },
              { label: "FAIL 1", set: { GO: 0, FAIL: 1 }, clock: "CLK" },
              { label: "RST 1, TICK 1", set: { FAIL: 0, RST: 1, TICK: 1 }, clock: "CLK" },
            ],
            watch: "S",
            options: [
              { value: code("IDLE"), label: LABELS.options.p3Idle },
              { value: code("TRY"), label: LABELS.options.p3Try },
              { value: code("WAIT"), label: LABELS.options.p3Wait },
            ],
            explain: PROSE.p3Explain,
            signals: [
              "CLK",
              "RST",
              "FAIL",
              "TICK",
              {
                net: "S",
                label: "S",
                names: { "00": "IDLE", "01": "TRY", "10": "WAIT", "11": "GIVE_UP" },
              },
            ],
          },
        },
        {
          id: "write-late-ok",
          kind: "challenge",
          timeModel: "clocked",
          caption: LABELS.captions.writeLateOk,
          lead: PROSE.writeLateOkLead,
          props: { challengeId: "late-ok" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "next-one",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "draw",
      interface: {
        inputs: [
          { name: "S1" },
          { name: "S0" },
          { name: "OK" },
          { name: "FAIL" },
          { name: "TICK" },
        ],
        outputs: [{ name: "N1" }],
      },
      palette: ["decoder-2", "and", "or", "not"],
      allowedConstructs: DRAW_CONSTRUCTS,
      tests: { kind: "combinational", vectors: nextOneVectors() },
      hints: [...PROSE.c1Hints],
      reference: { hdl: NEXT_ONE_TEXT },
    },
    {
      id: "late-ok",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      tryIt: "pins",
      interface: {
        inputs: [
          { name: "GO" },
          { name: "OK" },
          { name: "FAIL" },
          { name: "TICK" },
          { name: "RST" },
          { name: "CLK" },
        ],
        outputs: [{ name: "SEND" }, { name: "SIREN" }, { name: "S", width: 2 }],
      },
      allowedConstructs: TEXT_CONSTRUCTS,
      initial: { hdl: machineText(RETRY, { style: "codes" }) },
      tests: {
        kind: "sequence",
        steps: [
          { label: "RST 1, clock low", set: { ...quiet, RST: 1, CLK: 0 } },
          { label: "edge with RST 1", set: { CLK: 1 }, expect: { S: "00", SEND: 0, SIREN: 0 } },
          { label: "clock low, GO 1", set: { CLK: 0, RST: 0, GO: 1 } },
          { label: "edge with GO 1", set: { CLK: 1 }, expect: { S: "01", SEND: 1 } },
          { label: "GO falls while the clock is high", set: { GO: 0 }, expect: { S: "01" } },
          { label: "clock low, FAIL 1", set: { CLK: 0, FAIL: 1 } },
          { label: "edge with FAIL 1", set: { CLK: 1 }, expect: { S: "10", SEND: 0 } },
          // OK and TICK together in WAIT: OK wins, so a TICK-first arm fails here.
          { label: "clock low, FAIL 0, OK 1, TICK 1", set: { CLK: 0, FAIL: 0, OK: 1, TICK: 1 } },
          {
            label: "edge in WAIT with OK 1 and TICK 1",
            set: { CLK: 1 },
            expect: { S: "00", SEND: 0 },
          },
          { label: "clock low, OK 0, TICK 0, GO 1", set: { CLK: 0, OK: 0, TICK: 0, GO: 1 } },
          { label: "edge with GO 1 again", set: { CLK: 1 }, expect: { S: "01" } },
          { label: "clock low, GO 0, FAIL 1", set: { CLK: 0, GO: 0, FAIL: 1 } },
          { label: "edge with FAIL 1 again", set: { CLK: 1 }, expect: { S: "10" } },
          {
            label: "OK rises while the clock is high",
            set: { FAIL: 0, OK: 1 },
            expect: { S: "10" },
          },
          { label: "clock low, OK 0, TICK 1", set: { CLK: 0, OK: 0, TICK: 1 } },
          { label: "edge in WAIT with TICK 1", set: { CLK: 1 }, expect: { S: "01", SEND: 1 } },
          { label: "clock low, OK 1 and TICK 1", set: { CLK: 0, OK: 1 } },
          { label: "edge in TRY with OK 1", set: { CLK: 1 }, expect: { S: "00" } },
          { label: "clock low, GO 1, OK 0", set: { CLK: 0, GO: 1, OK: 0, TICK: 0 } },
          { label: "edge with GO 1 a third time", set: { CLK: 1 }, expect: { S: "01" } },
          { label: "clock low, GO 0, TICK 1", set: { CLK: 0, GO: 0, TICK: 1 } },
          {
            label: "edge in TRY with TICK 1 and no answer",
            set: { CLK: 1 },
            expect: { S: "11", SIREN: 1 },
          },
          { label: "clock low, TICK 0, OK 1", set: { CLK: 0, TICK: 0, OK: 1 } },
          { label: "edge in GIVE_UP with OK 1", set: { CLK: 1 }, expect: { S: "11", SIREN: 1 } },
        ],
      },
      hints: [...PROSE.c2Hints],
      reference: { hdl: machineText(MACHINES["retry-late-ok"], { style: "codes" }) },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "A Moore machine introduced with a traffic-light controller or a sequence detector for two consecutive 1s (or a vending machine), its state diagram, a state table, a binary encoding, Karnaugh maps for each next-state bit, minimised equations, and the circuit of D flip-flops; the FSM tutorial's toggle, detector, traffic light, counter and arbiter.",
    howThisDiffers:
      "The machine is the retry controller approved at Checkpoint 1, carried into the shop's story: the office's message to the manager, retried after each failure at the next TICK, given up with a siren when a whole TICK passes without an answer. Its inputs come from earlier lessons' parts (TICK from a counter, RST from the registers lesson's reset). The next-state logic is read off the encoded table row by row, one AND gate per row and one OR gate per bit, with no minimisation, and the learner draws one bit of it from Module 3's decoder. The live figure ties the diagram, the table, the circuit and the trace to one simulator, and marks the row the next edge will apply from the next-state logic's own output. Two moves are predicted before the table is shown (a stay in TRY, and TRY to GIVE_UP followed by a late OK that GIVE_UP ignores) and the reset after it; the live figure lets the learner try every kind of move; and the written lab changes the controller rather than writing a new one.",
  },
};
