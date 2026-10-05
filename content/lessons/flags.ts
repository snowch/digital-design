// Lesson: Module 7, lesson 2, the flags: one-bit outputs that say something about the result.
//
// The structure is here; the words are in flags.prose.ts and flags.labels.ts. The circuits are
// the model's (packages/dd-model: alu.ts and library-alu.ts); the numbers the prose states are
// pinned by flags.facts.test.ts, read off the figures' own props.

import { aluResult } from "@dd/dd-model";
import type { LessonInput } from "@dd/lesson-schema";

import { LABELS } from "./flags.labels";
import { PROSE } from "./flags.prose";
import { ROOM_A, ROOM_B, wordText } from "./module7";

const DRAW_CONSTRUCTS = ["module", "ports", "logic", "assign", "op-bitwise"];

/** The zero slice's tests: words at 1, 4, 8 and 16 bits, copy 0's ZIN at 1 as the ALU sets it. */
const ZERO_CASES: readonly (readonly [bigint, number])[] = [
  [0n, 1],
  [1n, 1],
  [0b0000n, 4],
  [0b1000n, 4],
  [0b0001n, 4],
  [0b0110n, 4],
  [0x00n, 8],
  [0x80n, 8],
  [0x0000n, 16],
  [0x0001n, 16],
  [0x8000n, 16],
  [0x0100n, 16],
];
const ZERO_VECTORS = ZERO_CASES.map(([y, n]) => ({
  label: `${n} slice${n === 1 ? "" : "s"}: Y ${wordText(y, n).replace(/^0x/, "")}`,
  slices: n,
  inputs: { Y: wordText(y, n), ZIN: 1 },
  expect: { ZOUT: y === 0n ? 1 : 0 },
}));

/** The colder lamp's tests: room words and words at the signed limits, through A - B's flags. */
const signed16 = (w: bigint) => (w >= 0x8000n ? w - 0x10000n : w);
const COLDER_PAIRS: readonly (readonly [bigint, bigint])[] = [
  [ROOM_B, ROOM_A],
  [ROOM_A, ROOM_B],
  [ROOM_A, ROOM_A],
  [0x0005n, 0xfffbn],
  [0xfffbn, 0x0005n],
  [0x7fffn, 0x8000n],
  [0x8000n, 0x7fffn],
  [0x8000n, 0x0001n],
  [0x0001n, 0x8000n],
];
const hex = (w: bigint) => w.toString(16).toUpperCase().padStart(4, "0");
const COLDER_VECTORS = COLDER_PAIRS.map(([a, b]) => {
  const r = aluResult(3, a, b, 16);
  return {
    label: `${hex(a)} - ${hex(b)}`,
    inputs: { ZERO: r.ZERO, MINUS: r.MINUS, COUT: r.COUT, OVER: r.OVER },
    expect: { COLDER: signed16(a) < signed16(b) ? 1 : 0 },
  };
});

/** The fault lab's checks on 4-bit words: each job's flags are compared with a healthy ALU's. */
const FLAG_RUN = [
  { label: "3 - 5", set: { A: "0011", B: "0101", OP2: 0, OP1: 1, OP0: 1 } },
  { label: "5 - 5", set: { A: "0101", B: "0101" } },
  { label: "7 - 8", set: { A: "0111", B: "1000" } },
  { label: "2 - 1", set: { A: "0010", B: "0001" } },
  { label: "12 XOR 12", set: { A: "1100", B: "1100", OP1: 0, OP0: 1 } },
];

export const flags: LessonInput = {
  id: "flags",
  title: LABELS.title,
  module: 7,
  order: 2,
  objectives: [...LABELS.objectives],
  introduces: ["flag"],
  sections: [
    { kind: "question", title: LABELS.titles.question, prose: PROSE.question },
    { kind: "motivation", title: LABELS.titles.motivation, prose: PROSE.motivation },
    {
      kind: "prediction",
      title: LABELS.titles.prediction,
      prose: PROSE.prediction,
      interactives: [
        {
          id: "predict-minus",
          kind: "prediction",
          timeModel: "settle",
          caption: LABELS.captions.predictMinus,
          props: {
            question: PROSE.p1Question,
            libraryId: "alu8-flags-4-block",
            run: [{ label: "0111 - 1000", set: { A: "0111", B: "1000", OP2: 0, OP1: 1, OP0: 1 } }],
            watch: "MINUS",
            options: [
              { value: "0", label: LABELS.options.p1Zero },
              { value: "1", label: LABELS.options.p1One },
            ],
            explain: PROSE.p1Explain,
            signals: ["A", "B", "Y", "MINUS", "OVER"],
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
          id: "four-flags",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.fourFlags,
          lead: PROSE.fourFlagsLead,
          after: PROSE.fourFlagsAfter,
          props: {
            libraryId: "alu8-flags-4-block",
            canOpen: false,
            initial: { A: "0011", B: "0101", OP2: 0, OP1: 1, OP0: 1 },
            readings: ["unsigned", "signed"],
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
          id: "build-zero",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.buildZero,
          lead: PROSE.buildZeroLead,
          props: { challengeId: "zero-slice" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "flag-faults",
          kind: "fault-lab",
          timeModel: "settle",
          caption: LABELS.captions.flagFaults,
          lead: PROSE.flagFaultsLead,
          props: {
            outcomes: PROSE.flagFaultsAfter,
            libraryId: "alu8-flags-4",
            canOpen: false,
            faults: [
              { kind: "stuck-at", net: "Z2", value: 1, label: LABELS.faults.z2High },
              { kind: "stuck-at", net: "Z0", value: 0, label: LABELS.faults.z0Low },
              { kind: "stuck-at", net: "C3", value: 0, label: LABELS.faults.c3Low },
            ],
            run: FLAG_RUN,
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
          id: "overflow-limit",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.overflowLimit,
          lead: PROSE.overflowLimitLead,
          after: PROSE.overflowLimitAfter,
          props: {
            libraryId: "alu8-flags-4-block",
            canOpen: false,
            initial: { A: "0111", B: "1000", OP2: 0, OP1: 1, OP0: 1 },
            readings: ["signed"],
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
          id: "rooms-flags",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.roomsFlags,
          lead: PROSE.roomsFlagsLead,
          after: PROSE.roomsFlagsAfter,
          props: {
            libraryId: "alu8-flags-16-block",
            canOpen: false,
            initial: { A: "0xFF06", B: "0xFF48", OP2: 0, OP1: 1, OP0: 1 },
            readings: ["signed"],
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
          id: "build-colder",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.buildColder,
          lead: PROSE.buildColderLead,
          props: { challengeId: "colder" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "zero-slice",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "draw",
      interface: { inputs: [{ name: "Y" }, { name: "ZIN" }], outputs: [{ name: "ZOUT" }] },
      palette: ["and", "or", "not", "xor"],
      allowedConstructs: DRAW_CONSTRUCTS,
      tests: {
        kind: "combinational",
        vectors: ZERO_VECTORS,
        chain: { bitwise: ["Y"], outputs: [], shared: [], carry: { in: "ZIN", out: "ZOUT" } },
      },
      hints: [...PROSE.c1Hints],
      reference: { libraryId: "zero-slice" },
    },
    {
      id: "colder",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "draw",
      interface: {
        inputs: [{ name: "ZERO" }, { name: "MINUS" }, { name: "COUT" }, { name: "OVER" }],
        outputs: [{ name: "COLDER" }],
      },
      palette: ["and", "or", "xor", "not"],
      allowedConstructs: DRAW_CONSTRUCTS,
      tests: { kind: "combinational", vectors: COLDER_VECTORS },
      hints: [...PROSE.c2Hints],
      reference: { libraryId: "colder" },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "A processor's flag register with its letters, Z, N, C and V (or ZF, SF, CF and OF), set by every instruction and tested by conditional branches; Harris and Harris's ALU with its overflow and zero outputs and set-if-less-than built from the sign and overflow bits; Nand2Tetris's zr and ng outputs.",
    howThisDiffers:
      "The four flags have the course's own names, ZERO, MINUS, COUT and OVER, and each comes from a question the shop's office asks in one bit: do the twin sensors agree, is room A colder than room B, did the count reach the end. ZERO is built the way the carry is, passed from slice to slice as 'no 1 so far', and the learner draws that slice; OVER is the adders lesson's lamp, read from the word the adder actually adds rather than from B. There is no flag register and no branching: the flags are outputs beside Y. The learner predicts MINUS for 7 minus -8 and finds it wrong, and then draws the colder lamp from the flags, tested on the rooms' words and the signed limits.",
  },
};
