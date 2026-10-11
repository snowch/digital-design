// Copyright © 2026 Christopher Snow

// Lesson: Module 3, lesson 4, the ALU: one block, four jobs, any width.
//
// The structure is here; the words are in alu.prose.ts and alu.labels.ts. The circuits are the
// model's (packages/dd-model: combinational.ts, library-combinational.ts and chain.ts); the
// numbers the prose states are pinned by alu.facts.test.ts, read off the figures' own props.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./alu.labels";
import { PROSE } from "./alu.prose";

const DRAW_CONSTRUCTS = ["module", "ports", "logic", "assign", "op-bitwise"];

/** Module 1's two freezer rooms, as 16-bit words: -184 and -250 tenths of a degree. */
export const ROOM_A_WORD = "0xFF48";
export const ROOM_B_WORD = "0xFF06";

/**
 * The investigation's 4-bit words: 2 and 3. Small enough that no job's answer overflows, and the
 * four jobs give four different words, so pressing OP1 and OP0 tells them apart.
 */
export const SMALL_A = "0010";
export const SMALL_B = "0011";

const bits = (n: number, width: number) =>
  (((n % 2 ** width) + 2 ** width) % 2 ** width).toString(2).padStart(width, "0");

/** The four jobs, by OP1 OP0 read as a number: AND, XOR, add, subtract. */
export function job(op: number, a: number, b: number, width: number): { y: number; cout: number } {
  const m = 2 ** width;
  if (op === 0) return { y: a & b, cout: 0 };
  if (op === 1) return { y: a ^ b, cout: 0 };
  if (op === 2) return { y: (a + b) % m, cout: a + b >= m ? 1 : 0 };
  const total = a + (m - 1 - b) + 1;
  return { y: total % m, cout: total >= m ? 1 : 0 };
}

/** Add-or-subtract sums at 1, 4 and 8 bits: CIN is 1 exactly when SUB is, as the unit wires it. */
const ADDSUB_CASES: readonly [number, number, number, 0 | 1][] = [
  [1, 1, 1, 0],
  [1, 0, 1, 1],
  [1, 1, 1, 1],
  [4, 0b0110, 0b0011, 0],
  [4, 0b0110, 0b0011, 1],
  [4, 0b0011, 0b0110, 1],
  [4, 0b0000, 0b0001, 1],
  [4, 0b0111, 0b0001, 0],
  [8, 0x48, 0x06, 1],
  [8, 0x06, 0x48, 1],
  [8, 0xff, 0x01, 0],
];
const ADDSUB_VECTORS = ADDSUB_CASES.map(([n, a, b, sub]) => {
  const r = job(sub ? 3 : 2, a, b, n);
  return {
    label: `${n} slice${n === 1 ? "" : "s"}: A ${bits(a, n)} ${sub ? "-" : "+"} B ${bits(b, n)}`,
    slices: n,
    inputs: { A: bits(a, n), B: bits(b, n), SUB: sub, CIN: sub },
    expect: { SUM: bits(r.y, n), COUT: r.cout },
  };
});

const OPS = ["AND", "XOR", "+", "-"] as const;

/** Every job at 1, 4, 8 and 16 bits; COUT is checked for the two sums only. */
const ALU_CASES: readonly [number, number, number][] = [
  [1, 1, 1],
  [1, 1, 0],
  [4, 0b0100, 0b0011],
  [4, 0b0011, 0b0110],
  [8, 0x48, 0x06],
  [16, 0xff48, 0xff06],
];
const ALU_VECTORS = ALU_CASES.flatMap(([n, a, b]) =>
  [0, 1, 2, 3].map((op) => {
    const r = job(op, a, b, n);
    const expect: Record<string, string | number> = { Y: bits(r.y, n) };
    if (op >= 2) expect["COUT"] = r.cout;
    return {
      label: `${n} slice${n === 1 ? "" : "s"}: A ${bits(a, n)} ${OPS[op]} B ${bits(b, n)}`,
      slices: n,
      inputs: { A: bits(a, n), B: bits(b, n), OP1: op >> 1, OP0: op & 1, CIN: op === 3 ? 1 : 0 },
      expect,
    };
  }),
);

export const alu: LessonInput = {
  id: "alu",
  title: LABELS.title,
  module: 3,
  order: 4,
  objectives: [...LABELS.objectives],
  introduces: ["ALU"],
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
            show: "circuit",
            question: PROSE.p1Question,
            libraryId: "negate-4",
            run: [{ label: "B = 0011", set: { B: "0011" } }],
            watch: "NEG",
            options: [
              { value: "1100", label: LABELS.options.p1NotB },
              { value: "1101", label: LABELS.options.p1NotBPlusOne },
              { value: "0011", label: LABELS.options.p1Same },
            ],
            explain: PROSE.p1Explain,
            signals: ["B", "NEG"],
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
          id: "alu-block",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.aluBlock,
          lead: PROSE.aluBlockLead,
          after: PROSE.aluBlockAfter,
          props: {
            libraryId: "alu-4-block",
            canOpen: false,
            initial: { A: SMALL_A, B: SMALL_B },
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
          id: "build-addsub",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.buildAddsub,
          lead: PROSE.buildAddsubLead,
          props: { challengeId: "addsub-slice" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "addsub-faults",
          kind: "fault-lab",
          timeModel: "settle",
          caption: LABELS.captions.addsubFaults,
          lead: PROSE.addsubFaultsLead,
          props: {
            // Each fault's outcome shows once that fault has run, so the lead's prediction is not answered first.

            libraryId: "addsub-4",
            faults: [
              {
                kind: "stuck-at",
                net: "C0",
                value: 0,
                label: LABELS.faults.c0Low,
                outcome: PROSE.addsubFaultsAfterFault1,
              },
              {
                kind: "wrong-gate",
                path: "bit1/xorB",
                gate: "or",
                label: LABELS.faults.xorToOr,
                outcome: PROSE.addsubFaultsAfterFault2,
              },
              {
                kind: "stuck-at",
                net: "C2",
                value: 0,
                label: LABELS.faults.c2Low,
                outcome: PROSE.addsubFaultsAfterFault3,
              },
            ],
            run: [
              { label: "6 + 3", set: { A: "0110", B: "0011", SUB: 0 } },
              { label: "6 - 3", set: { A: "0110", B: "0011", SUB: 1 } },
              { label: "3 - 6", set: { A: "0011", B: "0110", SUB: 1 } },
              { label: "5 - 5", set: { A: "0101", B: "0101", SUB: 1 } },
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
          id: "addsub-row",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.addsubRow,
          lead: PROSE.addsubRowLead,
          after: PROSE.addsubRowAfter,
          props: {
            libraryId: "addsub-4",
            initial: { A: SMALL_A, B: SMALL_B, SUB: 1 },
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
          id: "alu-16",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.alu16,
          lead: PROSE.alu16Lead,
          after: PROSE.alu16After,
          props: {
            libraryId: "alu-16-block",
            canOpen: false,
            initial: { A: ROOM_A_WORD, B: ROOM_B_WORD, OP1: 1, OP0: 1 },
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
          id: "build-alu-slice",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.buildAluSlice,
          lead: PROSE.buildAluSliceLead,
          props: { challengeId: "alu-slice" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "addsub-slice",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "draw",
      interface: {
        inputs: [{ name: "A" }, { name: "B" }, { name: "CIN" }, { name: "SUB" }],
        outputs: [{ name: "SUM" }, { name: "COUT" }],
      },
      palette: ["full-adder", "xor", "and", "or", "not"],
      allowedConstructs: DRAW_CONSTRUCTS,
      tests: {
        kind: "combinational",
        vectors: ADDSUB_VECTORS,
        chain: {
          bitwise: ["A", "B"],
          outputs: ["SUM"],
          shared: ["SUB"],
          carry: { in: "CIN", out: "COUT" },
        },
      },
      hints: [...PROSE.c1Hints],
      reference: { libraryId: "addsub-slice" },
    },
    {
      id: "alu-slice",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "draw",
      interface: {
        inputs: [{ name: "A" }, { name: "B" }, { name: "CIN" }, { name: "OP1" }, { name: "OP0" }],
        outputs: [{ name: "Y" }, { name: "COUT" }],
      },
      palette: ["full-adder", "selector-4", "and", "xor", "or", "not"],
      allowedConstructs: DRAW_CONSTRUCTS,
      tests: {
        kind: "combinational",
        vectors: ALU_VECTORS,
        chain: {
          bitwise: ["A", "B"],
          outputs: ["Y"],
          shared: ["OP1", "OP0"],
          carry: { in: "CIN", out: "COUT" },
        },
      },
      hints: [...PROSE.c2Hints],
      reference: { libraryId: "alu-slice-parts" },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "An ALU given as a block with a table of control codes, built as a word-wide adder with B inverted for subtraction and a multiplexer choosing among AND, OR, sum and set-less-than (Harris and Harris), or Nand2Tetris's ALU with its six control bits zx, nx, zy, ny, f and no and its zr and ng outputs; usually followed by the bit-slice drawn once and repeated in a figure.",
    howThisDiffers:
      "The four jobs come from the shop's office: correct a reading (add), say how much warmer one room is than the other (subtract), check that twin sensors agree (XOR, all 0s when they do), and keep chosen bits (AND). The learner first predicts NOT B plus 1 on the adder from Module 3's own lesson and reads the answer signed, which is how subtraction arrives without a new circuit. The learner draws one bit, a slice, and the course's grader makes the word: it chains copies of the learner's slice and tests them at 1, 4, 8 and 16 bits, so the slice is graded at widths the learner never drew. The jobs and their numbering (OP1 OP0: 00 AND, 01 XOR, 10 add, 11 subtract) are this course's, chosen for the shop's needs, not any processor's; there are no flag outputs beyond the adder's own carry out.",
  },
};
