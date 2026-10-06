// Lesson: Which codes should the states have, and how is a state machine written?
// (module 5, lesson 5)
//
// The structure is here; the words are in state-encoding.prose.ts and state-encoding.labels.ts.
// The retry controller's table stays the same while its codes change: TRY given 00 (a reset
// starts it sending), one flip-flop per state (a reset's 0000 is no state), and one flip-flop per
// state except IDLE, which is all zeros. Then the rule that makes all of this work, every
// flip-flop on one clock with inputs read only at its edge, and a short answer that falls
// between two edges and is never seen. The state machine is then written with its states named
// in an enumerated type, and the capstone writes a given machine, the freezer room's defrost.

import { MACHINES, machineText, stateNamed } from "@dd/dd-model";
import type { LessonInput } from "@dd/lesson-schema";

import { PROSE } from "./state-encoding.prose";
import { LABELS } from "./state-encoding.labels";

/** What the written challenges may use: the state machine's form, `case`, `==` and `enum`. */
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

const quiet = { GO: 0, OK: 0, FAIL: 0, TICK: 0 };

const ZERO_IDLE = MACHINES["retry-zero-idle"];
const zcode = (name: string) => stateNamed(ZERO_IDLE, name).code;

const DEFROST_HEADER =
  "module defrost(input logic TICK, input logic CLEAR, input logic WARM, input logic RST, input logic CLK, output logic COMP, output logic HEAT, output logic [1:0] S);";

/** The names a timing diagram writes for the retry controller's codes. */
const NAMES = { "00": "IDLE", "01": "TRY", "10": "WAIT", "11": "GIVE_UP" };

export const stateEncoding: LessonInput = {
  id: "state-encoding",
  title: LABELS.title,
  module: 5,
  order: 5,
  objectives: [...LABELS.objectives],
  introduces: ["one-hot", "synchronous"],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "try-zero-table",
          kind: "state-machine",
          timeModel: "clocked",
          caption: LABELS.captions.tryZeroTable,
          lead: PROSE.tryZeroTableLead,
          props: { machine: "retry-try-zero", show: ["diagram", "table"] },
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
          id: "predict-try-zero",
          kind: "prediction",
          timeModel: "clocked",
          caption: LABELS.captions.predictTryZero,
          props: {
            question: PROSE.p1Question,
            libraryId: "retry-try-zero",
            run: [{ label: "RST 1", set: { ...quiet, RST: 1, CLK: 0 }, clock: "CLK" }],
            watch: "SEND",
            options: [
              { value: "0", label: LABELS.options.p1Zero },
              { value: "1", label: LABELS.options.p1One },
              { value: "X", label: LABELS.options.p1X },
            ],
            explain: PROSE.p1Explain,
            signals: ["CLK", "RST", "GO", { net: "S", label: "S" }, "SEND"],
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
          id: "zero-idle-machine",
          kind: "state-machine",
          timeModel: "clocked",
          caption: LABELS.captions.zeroIdleMachine,
          lead: PROSE.zeroIdleMachineLead,
          after: PROSE.zeroIdleMachineAfter,
          props: {
            machine: "retry-zero-idle",
            show: ["diagram", "table", "circuit"],
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
          id: "write-zero-idle",
          kind: "challenge",
          timeModel: "clocked",
          caption: LABELS.captions.writeZeroIdle,
          lead: PROSE.writeZeroIdleLead,
          props: { challengeId: "zero-idle" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "predict-one-hot-reset",
          kind: "prediction",
          timeModel: "clocked",
          caption: LABELS.captions.predictOneHotReset,
          lead: PROSE.predictOneHotResetLead,
          props: {
            question: PROSE.p2Question,
            libraryId: "retry-one-hot",
            run: [
              { label: "RST 1", set: { ...quiet, RST: 1, CLK: 0 }, clock: "CLK" },
              { label: "GO 1", set: { RST: 0, GO: 1 }, clock: "CLK" },
            ],
            watch: "S",
            options: [
              { value: "0010", label: LABELS.options.p2Try },
              { value: "0001", label: LABELS.options.p2Idle },
              { value: "0000", label: LABELS.options.p2None },
            ],
            explain: PROSE.p2Explain,
            signals: ["CLK", "RST", "GO", { net: "S", label: "S" }, "SEND"],
          },
        },
        {
          id: "predict-short-ok",
          kind: "prediction",
          timeModel: "clocked",
          caption: LABELS.captions.predictShortOk,
          lead: PROSE.predictShortOkLead,
          props: {
            question: PROSE.p3Question,
            libraryId: "retry",
            run: [
              { label: "RST 1", set: { ...quiet, RST: 1, CLK: 0 }, clock: "CLK" },
              { label: "GO 1", set: { RST: 0, GO: 1 }, clock: "CLK" },
              { label: "OK 1", set: { GO: 0, OK: 1 } },
              { label: "OK 0", set: { OK: 0 } },
              { label: "edge", clock: "CLK" },
            ],
            watch: "S",
            options: [
              { value: "00", label: LABELS.options.p3Idle },
              { value: "01", label: LABELS.options.p3Try },
              { value: "10", label: LABELS.options.p3Wait },
            ],
            explain: PROSE.p3Explain,
            signals: ["CLK", "OK", { net: "S", label: "S", names: NAMES }, "SEND"],
          },
        },
      ],
    },
    {
      kind: "explanation",
      title: LABELS.titles.explanation,
      prose: PROSE.explanation,
      interactives: [],
    },
    {
      kind: "generalisation",
      title: LABELS.titles.generalisation,
      prose: "",
      interactives: [
        {
          id: "retry-enum",
          kind: "state-machine",
          timeModel: "clocked",
          caption: LABELS.captions.retryEnum,
          lead: PROSE.retryEnumLead,
          after: PROSE.retryEnumAfter,
          props: {
            machine: "retry",
            show: ["diagram", "text"],
            textStyle: "enum",
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
          id: "defrost-machine",
          kind: "state-machine",
          timeModel: "clocked",
          caption: LABELS.captions.defrostMachine,
          lead: PROSE.defrostMachineLead,
          props: {
            machine: "defrost",
            show: ["diagram"],
            prime: [{ set: { RST: 1 }, clock: "CLK" }, { set: { RST: 0 } }],
          },
        },
        {
          id: "write-defrost",
          kind: "challenge",
          timeModel: "clocked",
          caption: LABELS.captions.writeDefrost,
          lead: PROSE.writeDefrostLead,
          props: { challengeId: "defrost" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "zero-idle",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
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
        outputs: [{ name: "SEND" }, { name: "SIREN" }, { name: "S", width: 3 }],
      },
      allowedConstructs: TEXT_CONSTRUCTS,
      initial: { hdl: machineText(MACHINES.retry, { style: "codes" }) },
      tests: {
        kind: "sequence",
        steps: [
          { label: "RST 1, clock low", set: { ...quiet, RST: 1, CLK: 0 } },
          { label: "edge with RST 1", set: { CLK: 1 }, expect: { S: zcode("IDLE"), SEND: 0 } },
          { label: "clock low, GO 1", set: { CLK: 0, RST: 0, GO: 1 } },
          { label: "edge with GO 1", set: { CLK: 1 }, expect: { S: zcode("TRY"), SEND: 1 } },
          {
            label: "FAIL rises while the clock is high",
            set: { GO: 0, FAIL: 1 },
            expect: { S: zcode("TRY"), SEND: 1 },
          },
          { label: "clock low", set: { CLK: 0 } },
          { label: "edge with FAIL 1", set: { CLK: 1 }, expect: { S: zcode("WAIT"), SEND: 0 } },
          { label: "clock low, FAIL 0, TICK 1", set: { CLK: 0, FAIL: 0, TICK: 1 } },
          { label: "edge in WAIT with TICK 1", set: { CLK: 1 }, expect: { S: zcode("TRY") } },
          { label: "clock low, TICK still 1", set: { CLK: 0 } },
          {
            label: "edge in TRY with TICK 1 and no answer",
            set: { CLK: 1 },
            expect: { S: zcode("GIVE_UP"), SIREN: 1 },
          },
          { label: "clock low, RST 1", set: { CLK: 0, TICK: 0, RST: 1 } },
          { label: "edge with RST 1 again", set: { CLK: 1 }, expect: { S: zcode("IDLE") } },
          { label: "clock low, RST 0, GO 1", set: { CLK: 0, RST: 0, GO: 1 } },
          { label: "edge with GO 1 again", set: { CLK: 1 }, expect: { S: zcode("TRY") } },
          { label: "clock low, GO 0, OK 1", set: { CLK: 0, GO: 0, OK: 1 } },
          { label: "edge in TRY with OK 1", set: { CLK: 1 }, expect: { S: zcode("IDLE") } },
        ],
      },
      hints: [...PROSE.c1Hints],
      reference: { hdl: machineText(ZERO_IDLE, { style: "codes" }) },
    },
    {
      id: "defrost",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      tryIt: "pins",
      interface: {
        inputs: [
          { name: "TICK" },
          { name: "CLEAR" },
          { name: "WARM" },
          { name: "RST" },
          { name: "CLK" },
        ],
        outputs: [{ name: "COMP" }, { name: "HEAT" }, { name: "S", width: 2 }],
      },
      allowedConstructs: [...TEXT_CONSTRUCTS, "enum"],
      initial: { hdl: `${DEFROST_HEADER}\n\nendmodule\n` },
      tests: {
        kind: "sequence",
        steps: [
          {
            label: "RST 1, clock low",
            set: { TICK: 0, CLEAR: 0, WARM: 0, RST: 1, CLK: 0 },
          },
          {
            label: "edge with RST 1",
            set: { CLK: 1 },
            expect: { S: "00", COMP: 1, HEAT: 0 },
          },
          { label: "clock low, RST 0", set: { CLK: 0, RST: 0 } },
          { label: "edge with TICK 0", set: { CLK: 1 }, expect: { S: "00", COMP: 1 } },
          { label: "clock low, TICK 1", set: { CLK: 0, TICK: 1 } },
          {
            label: "edge in COOL with TICK 1",
            set: { CLK: 1 },
            expect: { S: "01", COMP: 0, HEAT: 1 },
          },
          {
            label: "TICK falls while the clock is high",
            set: { TICK: 0 },
            expect: { S: "01", HEAT: 1 },
          },
          { label: "clock low", set: { CLK: 0 } },
          { label: "edge in DEFROST with CLEAR 0", set: { CLK: 1 }, expect: { S: "01" } },
          { label: "clock low, CLEAR 1", set: { CLK: 0, CLEAR: 1 } },
          {
            label: "edge in DEFROST with CLEAR 1",
            set: { CLK: 1 },
            expect: { S: "10", COMP: 0, HEAT: 0 },
          },
          { label: "clock low, CLEAR 0", set: { CLK: 0, CLEAR: 0 } },
          { label: "edge in DRAIN with TICK 0", set: { CLK: 1 }, expect: { S: "10" } },
          { label: "clock low, TICK 1", set: { CLK: 0, TICK: 1 } },
          {
            label: "edge in DRAIN with TICK 1",
            set: { CLK: 1 },
            expect: { S: "00", COMP: 1 },
          },
          { label: "clock low, TICK still 1", set: { CLK: 0 } },
          { label: "edge in COOL with TICK 1 again", set: { CLK: 1 }, expect: { S: "01" } },
          {
            label: "clock low, TICK 0, WARM 1, CLEAR 1",
            set: { CLK: 0, TICK: 0, WARM: 1, CLEAR: 1 },
          },
          {
            label: "edge in DEFROST with WARM 1 and CLEAR 1",
            set: { CLK: 1 },
            expect: { S: "00", COMP: 1, HEAT: 0 },
          },
        ],
      },
      hints: [...PROSE.c2Hints],
      reference: { hdl: machineText(MACHINES.defrost, { style: "enum" }) },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "A table of the same small machine encoded three ways (binary, Gray and one-hot) with the gate counts compared, the traffic light or a vending machine written in Verilog with a `parameter` per state and a two-process (or three-process) template, and a synchroniser of two flip-flops shown for an asynchronous input.",
    howThisDiffers:
      "The encodings are judged by what the course's own reset does to them: the registers lesson's reset loads zeros, so TRY at 00 starts the controller sending, and one flip-flop per state starts it in no state at all; the fix the learner writes keeps IDLE all zeros. Synchronous design is met as an experiment in the shop's story, an answer from the manager's phone that rises and falls between two edges and is never seen, rather than as a list of rules. The text names the states with an enumerated type that keeps the codes the lesson chose, and the capstone writes a machine the learner has not seen in text, the freezer room's defrost cycle (COOL, DEFROST, DRAIN), given as a running diagram.",
  },
};
