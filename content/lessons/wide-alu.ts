// Copyright © 2026 Christopher Snow

// Lesson: Module 7, lesson 3, the same ALU at 64 bits: the carry stepped from slice to slice, the
// circuit opened one level at a time, and the width written as a parameter in SystemVerilog.
//
// The structure is here; the words are in wide-alu.prose.ts and wide-alu.labels.ts. The circuits
// are the model's (packages/dd-model: alu.ts and library-alu.ts); the numbers the prose states
// are pinned by wide-alu.facts.test.ts, read off the figures' own props.

import { hexWord, opBits } from "@dd/dd-model";
import type { LessonInput } from "@dd/lesson-schema";

import { LABELS } from "./wide-alu.labels";
import { PROSE } from "./wide-alu.prose";

/** What this lesson's written challenges may use: Module 7 brings parameter, concat and + and -. */
export const WIDE_CONSTRUCTS = [
  "module",
  "ports",
  "logic",
  "vector",
  "assign",
  "op-bitwise",
  // Module 7
  "parameter",
  "concat",
  "op-arith",
];
/**
 * The operand challenge also uses always_comb and case, which its task explains. Module 5, built
 * at the same time on its own branch, teaches them too.
 */
const CASE_CONSTRUCTS = [...WIDE_CONSTRUCTS, "always_comb", "case"];

const ALL64 = (1n << 64n) - 1n;
const mask = (n: number) => (1n << BigInt(n)) - 1n;
const h = (w: bigint, n: number) => `0x${hexWord(w, n)}`;

/** The written adder's tests at N = 4, 16 and 64: carries that stop early and run the width. */
const ADDER_VECTORS = [4, 16, 64].flatMap((n) => {
  const m = mask(n);
  return (
    [
      [5n, 9n, 0n],
      [m, 1n, 0n],
      [m, m, 1n],
      [m >> 1n, 0n, 1n],
    ] as const
  ).map(([a, b, cin]) => {
    const total = (a & m) + (b & m) + cin;
    return {
      label: `N = ${n}: ${hexWord(a & m, n)} + ${hexWord(b & m, n)} + ${cin}`,
      parameters: { N: n },
      inputs: { A: h(a, n), B: h(b, n), CIN: Number(cin) },
      expect: { SUM: h(total & m, n), COUT: Number(total >> BigInt(n)) },
    };
  });
});

/** The written operand's tests: every job at N = 4, 16 and 64 on one word B. */
const OPERAND_VECTORS = (
  [
    [4, 0b0110n],
    [16, 0xff06n],
    [64, 0x0123456789abcdefn],
  ] as const
).flatMap(([n, b]) =>
  [0, 1, 2, 3, 4, 5, 6, 7].map((job) => {
    const op = opBits(job);
    const m = mask(n);
    const d = !op.OP1 ? 0n : op.OP2 ? (op.OP0 ? m : 0n) : op.OP0 ? ~b & m : b;
    return {
      label: `N = ${n}: OP2 OP1 OP0 = ${op.OP2}${op.OP1}${op.OP0}, B ${hexWord(b, n)}`,
      parameters: { N: n },
      inputs: { B: h(b, n), ...op },
      expect: { D: h(d, n), CIN: op.OP1 & (op.OP2 ^ op.OP0) },
    };
  }),
);

export const ADDER_REFERENCE = `module adder #(parameter N = 16) (
  input logic [N-1:0] A,
  input logic [N-1:0] B,
  input logic CIN,
  output logic [N-1:0] SUM,
  output logic COUT
);
  assign {COUT, SUM} = A + B + CIN;
endmodule
`;

export const ADDER_START = `module adder #(parameter N = 16) (
  input logic [N-1:0] A,
  input logic [N-1:0] B,
  input logic CIN,
  output logic [N-1:0] SUM,
  output logic COUT
);
  assign SUM = A;
  assign COUT = CIN;
endmodule
`;

export const OPERAND_REFERENCE = `module operand #(parameter N = 16) (
  input logic [N-1:0] B,
  input logic OP2,
  input logic OP1,
  input logic OP0,
  output logic [N-1:0] D,
  output logic CIN
);
  always_comb begin
    case ({OP2, OP1, OP0})
      3'b010: D = B;
      3'b011: D = ~B;
      3'b111: D = ~0;
      default: D = 0;
    endcase
  end
  assign CIN = OP1 & (OP2 ^ OP0);
endmodule
`;

export const OPERAND_START = `module operand #(parameter N = 16) (
  input logic [N-1:0] B,
  input logic OP2,
  input logic OP1,
  input logic OP0,
  output logic [N-1:0] D,
  output logic CIN
);
  assign D = B;
  assign CIN = 0;
endmodule
`;

/** The carry-stepping figures' cases: the job is count up throughout, A changes. */
const COUNT_UP = { B: "0", OP2: 1, OP1: 1, OP0: 0 };
const CASES_16 = [
  { label: LABELS.cases.oneUp, from: { ...COUNT_UP, A: "0x0000" }, to: { A: "0x0001" } },
  { label: LABELS.cases.byteUp, from: { ...COUNT_UP, A: "0x0000" }, to: { A: "0x00FF" } },
  { label: LABELS.cases.allUp, from: { ...COUNT_UP, A: "0x0000" }, to: { A: "0xFFFF" } },
];
const CASES_64 = [
  { label: LABELS.cases.oneUp64, from: { ...COUNT_UP, A: "0" }, to: { A: "0x1" } },
  { label: LABELS.cases.allUp64, from: { ...COUNT_UP, A: "0" }, to: { A: h(ALL64, 64) } },
];

/** The 64-bit fault lab's checks: count up on words whose carry runs 1, 16, 32 and 64 slices. */
const WIDE_RUN = [
  { label: "1 + 1", set: { A: "0x1", B: "0", OP2: 1, OP1: 1, OP0: 0 } },
  { label: "FFFF + 1", set: { A: "0xFFFF" } },
  { label: "FFFFFFFF + 1", set: { A: "0xFFFFFFFF" } },
  { label: "FFFFFFFFFFFFFFFF + 1", set: { A: h(ALL64, 64) } },
];

export const wideAlu: LessonInput = {
  id: "wide-alu",
  title: LABELS.title,
  module: 7,
  order: 3,
  objectives: [...LABELS.objectives],
  introduces: [],
  sections: [
    { kind: "question", title: LABELS.titles.question, prose: PROSE.question },
    { kind: "motivation", title: LABELS.titles.motivation, prose: PROSE.motivation },
    {
      kind: "prediction",
      title: LABELS.titles.prediction,
      prose: PROSE.prediction,
      interactives: [
        {
          id: "predict-steps",
          kind: "carry-steps",
          timeModel: "settle",
          caption: LABELS.captions.predictSteps,
          props: {
            libraryId: "alu8-16-row",
            cases: [CASES_16[0], CASES_16[2]],
            question: PROSE.p1Question,
            options: [
              { value: "0", label: LABELS.options.p1First },
              { value: "1", label: LABELS.options.p1Second },
              { value: "same", label: LABELS.options.p1Same },
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
          id: "carry-16",
          kind: "carry-steps",
          timeModel: "settle",
          caption: LABELS.captions.carry16,
          lead: PROSE.carry16Lead,
          after: PROSE.carry16After,
          props: { libraryId: "alu8-16-row", cases: CASES_16 },
        },
      ],
    },
    {
      kind: "construction",
      title: LABELS.titles.construction,
      prose: PROSE.construction,
      interactives: [
        {
          id: "write-adder",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.writeAdder,
          lead: PROSE.writeAdderLead,
          props: { challengeId: "adder-text" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "wide-faults",
          kind: "fault-lab",
          timeModel: "settle",
          caption: LABELS.captions.wideFaults,
          lead: PROSE.wideFaultsLead,
          props: {
            outcomes: PROSE.wideFaultsAfter,
            libraryId: "alu8-flags-64",
            faults: [
              {
                kind: "stuck-at",
                net: "C32",
                value: 0,
                label: LABELS.faults.c32Low,
                outcome: PROSE.wideFaultsAfterFault1,
              },
              {
                kind: "stuck-at",
                net: "C16",
                value: 1,
                label: LABELS.faults.c16High,
                outcome: PROSE.wideFaultsAfterFault2,
              },
            ],
            run: WIDE_RUN,
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
          id: "levels-64",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.levels64,
          lead: PROSE.levels64Lead,
          after: PROSE.levels64After,
          props: {
            libraryId: "alu8-flags-64",
            wordInputs: false,
            initial: { A: h(ALL64, 64), B: "0", OP2: 1, OP1: 1, OP0: 0 },
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
          id: "carry-64",
          kind: "carry-steps",
          timeModel: "settle",
          caption: LABELS.captions.carry64,
          lead: PROSE.carry64Lead,
          after: PROSE.carry64After,
          props: { libraryId: "alu8-64-row", cases: CASES_64 },
        },
      ],
    },
    {
      kind: "challenge",
      title: LABELS.titles.challenge,
      prose: "",
      interactives: [
        {
          id: "write-operand",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.writeOperand,
          lead: PROSE.writeOperandLead,
          props: { challengeId: "operand-text" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "adder-text",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "write",
      interface: {
        inputs: [{ name: "A" }, { name: "B" }, { name: "CIN" }],
        outputs: [{ name: "SUM" }, { name: "COUT" }],
      },
      allowedConstructs: WIDE_CONSTRUCTS,
      initial: { hdl: ADDER_START },
      tests: { kind: "combinational", vectors: ADDER_VECTORS },
      hints: [...PROSE.c1Hints],
      reference: { hdl: ADDER_REFERENCE },
    },
    {
      id: "operand-text",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      interface: {
        inputs: [{ name: "B" }, { name: "OP2" }, { name: "OP1" }, { name: "OP0" }],
        outputs: [{ name: "D" }, { name: "CIN" }],
      },
      allowedConstructs: CASE_CONSTRUCTS,
      initial: { hdl: OPERAND_START },
      tests: { kind: "combinational", vectors: OPERAND_VECTORS },
      hints: [...PROSE.c2Hints],
      reference: { hdl: OPERAND_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "A 32- or 64-bit ALU drawn as a row of identical one-bit ALUs with a ripple of carries, followed by carry-lookahead as the fix (Harris and Harris, Patterson and Hennessy); a Verilog adder written as `assign {cout, s} = a + b + cin;` with a width parameter, the standard first use of both.",
    howThisDiffers:
      "The learner watches the carry instead of being told about it: the course's figure records every step of the stepped model as a count up changes A, and shows each slice's carry and bit of Y step by step, at 16 and at 64 bits, with the step counts read off the run. The 64-bit ALU is opened one level at a time (four 16-bit groups, four 4-bit groups, four slices, gates), the course's level-of-detail rule, and a carry lost between two groups is found only by words whose carry reaches it. The written adder is the standard one-liner, kept because it is the plain way to say it; its tests run the same text at N = 4, 16 and 64. The second written challenge is this course's own: the adder's second word and carry in for the eight jobs, as a `case` on the three select bits joined into one word. Lookahead is named only as what real ALUs do instead.",
  },
};
