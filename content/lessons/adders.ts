// Copyright © 2026 Christopher Snow

// Lesson: Module 3, lesson 3, adders and overflow.
//
// The structure is here; the words are in adders.prose.ts and adders.labels.ts. The circuits are
// the model's (packages/dd-model: combinational.ts and library-combinational.ts); the numbers the
// prose states are pinned by adders.facts.test.ts, read off the figures' own props.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./adders.labels";
import { PROSE } from "./adders.prose";

const DRAW_CONSTRUCTS = ["module", "ports", "logic", "assign", "op-bitwise"];

/** The second freezer room's word, -250 tenths, and the correction, -6 tenths, as 16 bits. */
export const ROOM_B_WORD = "0xFF06";
export const CORRECTION_WORD = "0xFFFA";

/**
 * The sum on paper in the motivation, 3 + 3: a carry made in one column and passed on by the
 * next, and a sum that fits both readings, so nothing there runs ahead of the lesson's overflow.
 */
export const PAPER_A = "0011";
export const PAPER_B = "0011";

/** The explanation's first sum, 7 + 1 in four bits, whose signed reading does not fit. */
export const SEVEN = "0111";
export const ONE = "0001";

/**
 * Where the 4-bit adder starts: 3 + 2, which fits both ways, so its table does not answer the
 * signed-reading prediction above it before the learner commits.
 */
export const START_A = "0011";
export const START_B = "0010";

const bits4 = (n: number) => n.toString(2).padStart(4, "0");

/** Every pattern of A, B and CIN, labelled as the page shows it. */
const FULL_ADDER_VECTORS = [0, 1].flatMap((a) =>
  [0, 1].flatMap((b) =>
    [0, 1].map((c) => ({
      label: `A ${a}, B ${b}, CIN ${c}`,
      inputs: { A: a, B: b, CIN: c },
      expect: { SUM: (a + b + c) & 1, COUT: (a + b + c) >> 1 },
    })),
  ),
);

/** Sums chosen so a carry has to travel: through one bit, through two, all the way out. */
const RIPPLE_SUMS: readonly [number, number, number][] = [
  [0b0000, 0b0000, 0],
  [0b0001, 0b0001, 0],
  [0b0011, 0b0001, 0],
  [0b0111, 0b0001, 0],
  [0b1111, 0b0001, 0],
  [0b0101, 0b1010, 0],
  [0b0110, 0b0011, 0],
  [0b0000, 0b0000, 1],
  [0b1001, 0b0110, 1],
  [0b1111, 0b1111, 1],
];
const RIPPLE_VECTORS = RIPPLE_SUMS.map(([a, b, c]) => ({
  label: `A ${bits4(a)}, B ${bits4(b)}, CIN ${c}`,
  inputs: { A: bits4(a), B: bits4(b), CIN: c },
  expect: { SUM: bits4((a + b + c) & 15), COUT: (a + b + c) >> 4 },
}));

/** Every pattern of the three top bits: the lamp is 1 when A3 and B3 agree and S3 differs. */
const OVERFLOW_VECTORS = [0, 1].flatMap((a) =>
  [0, 1].flatMap((b) =>
    [0, 1].map((s) => ({
      label: `A3 ${a}, B3 ${b}, S3 ${s}`,
      inputs: { A3: a, B3: b, S3: s },
      expect: { V: a === b && s !== a ? 1 : 0 },
    })),
  ),
);

export const adders: LessonInput = {
  id: "adders",
  title: LABELS.title,
  module: 3,
  order: 3,
  objectives: [...LABELS.objectives],
  introduces: ["carry", "half adder", "full adder", "overflow", "XNOR"],
  sections: [
    { kind: "question", title: LABELS.titles.question, prose: PROSE.question },
    {
      kind: "motivation",
      title: LABELS.titles.motivation,
      prose: PROSE.motivation,
      interactives: [
        {
          id: "column-sum",
          kind: "column-sum",
          timeModel: "none",
          caption: LABELS.captions.columnSum,
          lead: PROSE.columnSumLead,
          after: PROSE.columnSumAfter,
          props: { a: PAPER_A, b: PAPER_B, labels: LABELS.columnSum },
        },
      ],
    },
    {
      kind: "prediction",
      title: LABELS.titles.prediction,
      prose: PROSE.prediction,
      interactives: [
        {
          id: "predict-sum",
          kind: "prediction",
          timeModel: "settle",
          caption: LABELS.captions.predictSum,
          props: {
            show: "circuit",
            question: PROSE.p1Question,
            libraryId: "half-adder-gates",
            run: [{ label: "A = 1, B = 1", set: { A: 1, B: 1 } }],
            watch: "SUM",
            options: [
              { value: "0", label: LABELS.options.p1Zero },
              { value: "1", label: LABELS.options.p1One },
            ],
            explain: PROSE.p1Explain,
            signals: ["A", "B", "SUM", "CARRY"],
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
          id: "half-adder",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.halfAdder,
          lead: PROSE.halfAdderLead,
          after: PROSE.halfAdderAfter,
          props: { libraryId: "half-adder-gates" },
        },
        {
          id: "columns-alone",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.columnsAlone,
          lead: PROSE.columnsAloneLead,
          after: PROSE.columnsAloneAfter,
          props: { libraryId: "columns-alone" },
        },
      ],
    },
    {
      kind: "construction",
      title: LABELS.titles.construction,
      prose: PROSE.construction,
      interactives: [
        {
          id: "build-full-adder",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.buildFullAdder,
          lead: PROSE.buildFullAdderLead,
          props: { challengeId: "full-adder" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "full-adder-faults",
          kind: "fault-lab",
          timeModel: "settle",
          caption: LABELS.captions.fullAdderFaults,
          lead: PROSE.fullAdderFaultsLead,
          props: {
            // Each fault's outcome shows once that fault has run, so the lead's prediction is not answered first.

            libraryId: "full-adder-parts",
            faults: [
              {
                kind: "wrong-gate",
                path: "orCarry",
                gate: "xor",
                label: LABELS.faults.orToXor,
                outcome: PROSE.fullAdderFaultsAfterFault1,
              },
              {
                kind: "stuck-at",
                net: "CIN",
                value: 0,
                label: LABELS.faults.cinLow,
                outcome: PROSE.fullAdderFaultsAfterFault2,
              },
              {
                kind: "wrong-gate",
                path: "ha2/xorSum",
                gate: "or",
                label: LABELS.faults.sumToOr,
                outcome: PROSE.fullAdderFaultsAfterFault3,
              },
            ],
            run: [
              { label: "0 + 0 + 0", set: { A: 0, B: 0, CIN: 0 } },
              { label: "1 + 1 + 0", set: { A: 1, B: 1, CIN: 0 } },
              { label: "1 + 0 + 1", set: { A: 1, B: 0, CIN: 1 } },
              { label: "0 + 1 + 1", set: { A: 0, B: 1, CIN: 1 } },
              { label: "1 + 1 + 1", set: { A: 1, B: 1, CIN: 1 } },
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
          id: "predict-signed",
          kind: "reading-prediction",
          timeModel: "none",
          caption: LABELS.captions.predictSigned,
          lead: PROSE.predictSignedLead,
          props: {
            question: PROSE.p2Question,
            ask: { kind: "reading", bits: "1000", reading: "signed" },
            options: [
              { value: "8", label: LABELS.options.p2Eight },
              { value: "-8", label: LABELS.options.p2MinusEight },
              { value: "0", label: LABELS.options.p2Zero },
            ],
            explain: PROSE.p2Explain,
          },
        },
        {
          id: "adder-4",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.adder4,
          lead: PROSE.adder4Lead,
          after: PROSE.adder4After,
          props: {
            libraryId: "adder-4-block",
            canOpen: false,
            initial: { A: START_A, B: START_B, CIN: 0 },
            readings: ["unsigned", "signed"],
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
          id: "correction",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.correction,
          lead: PROSE.correctionLead,
          after: PROSE.correctionAfter,
          props: {
            libraryId: "adder-16-block",
            canOpen: false,
            initial: { A: ROOM_B_WORD, B: CORRECTION_WORD, CIN: 0 },
            readings: ["unsigned", "signed"],
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
          id: "build-ripple",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.buildRipple,
          lead: PROSE.buildRippleLead,
          props: { challengeId: "ripple-adder" },
        },
        {
          id: "build-overflow",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.buildOverflow,
          lead: PROSE.buildOverflowLead,
          props: { challengeId: "overflow-lamp" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "full-adder",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "draw",
      interface: {
        inputs: [{ name: "A" }, { name: "B" }, { name: "CIN" }],
        outputs: [{ name: "SUM" }, { name: "COUT" }],
      },
      palette: ["half-adder", "or"],
      allowedConstructs: DRAW_CONSTRUCTS,
      tests: { kind: "combinational", vectors: FULL_ADDER_VECTORS },
      hints: [...PROSE.c1Hints],
      reference: { libraryId: "full-adder-parts" },
    },
    {
      id: "ripple-adder",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "draw",
      interface: {
        inputs: [{ name: "A", width: 4 }, { name: "B", width: 4 }, { name: "CIN" }],
        outputs: [{ name: "SUM", width: 4 }, { name: "COUT" }],
      },
      palette: ["full-adder", "split-4", "join-4"],
      allowedConstructs: DRAW_CONSTRUCTS,
      tests: { kind: "combinational", vectors: RIPPLE_VECTORS },
      hints: [...PROSE.c2Hints],
      reference: { libraryId: "adder-4-parts" },
    },
    {
      id: "overflow-lamp",
      title: LABELS.challengeTitles.c3,
      task: PROSE.c3Task,
      gradedDirection: "draw",
      interface: {
        inputs: [{ name: "A3" }, { name: "B3" }, { name: "S3" }],
        outputs: [{ name: "V" }],
      },
      palette: ["and", "or", "not", "xor", "xnor"],
      allowedConstructs: DRAW_CONSTRUCTS,
      tests: { kind: "combinational", vectors: OVERFLOW_VECTORS },
      hints: [...PROSE.c3Hints],
      reference: { libraryId: "overflow-gates" },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "The half adder and the full adder each given with a truth table and a gate diagram, the full adder as two half adders and an OR gate, then the textbook figure of four full adders in a row with the carry passing right to left, followed by two's complement and an overflow rule stated as the carry into the top bit XOR the carry out; Nand2Tetris's HalfAdder, FullAdder and Add16 chips.",
    howThisDiffers:
      "The lesson answers the question Module 1 ended on, with the shop's second freezer room: its sensor reads 0.6 degrees warm, so the display must add -6 to every reading. The learner predicts one column's sum bit for 1 + 1 before the half adder is named, then puts two half adders side by side and watches a carry vanish, which is why a column needs a third input. No adder truth table is shown: the tests are its rows, and the explorer gives the counts. The fault lab includes a fault every check passes (the full adder's OR changed to XOR), because the two half adders never both carry. Overflow is found, not stated: the same four bits read unsigned and signed, 7 + 1 giving 1000, which the learner reads signed before the course names overflow; then the correction itself, which makes a carry out of the top bit and is still right read signed. The overflow lamp is built from the top bits' agreement, as the learner can reason it from the signed reading, not from the carries.",
  },
};
