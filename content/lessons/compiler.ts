// Copyright © 2026 Christopher Snow

// Lesson: Beyond the machine, the compiler chapter. The shop's rule written as it says it,
// `display <= sensorA - sensorB`, is refused by the assembler. A program in the page, the course's
// own compiler, takes such a line and writes the course's instructions for it, one at a time, while
// the learner watches the line shrink: each piece it takes becomes an instruction, and the piece's
// register takes its place. The compiled CLASH line then runs on the whole machine, and its `>=`,
// which the machine has no instruction for, is followed down to the condition block's gates. The
// compiler's output for the shop's two rules is Module 0's first program, the gap worked out twice.
//
// An optional chapter (module 14, `optional`), listed after the five stages under "Beyond the
// machine". The structure is here; the words are in compiler.prose.ts and compiler.labels.ts. The
// numbers the prose states are pinned by compiler.facts.test.ts and dd-model's compile.test.ts.

import type { LessonInput } from "@platform/lesson-schema";
import { MEET_PROGRAMS } from "@dd/dd-model";

import {
  ASKED_PROGRAM,
  BOTH_PROGRAM,
  CLASH_LINE,
  CLASH_PROGRAM,
  COMPILER_REFERENCE,
  COMPILER_RUNS,
  COMPILER_START,
  GAP_LINE,
  SHOP_READINGS,
} from "./beyond";
import { LABELS } from "./compiler.labels";
import { PROSE } from "./compiler.prose";

const SHOP_INPUTS = { SENSORA: SHOP_READINGS.sensorA, SENSORB: SHOP_READINGS.sensorB };
/** The same readings as the debugger and the programs figure take them, as text. */
const SHOP_TEXT = {
  SENSORA: String(SHOP_READINGS.sensorA),
  SENSORB: String(SHOP_READINGS.sensorB),
};

/** The two lines the figures compile, each alone. */
const LINES = [
  { label: LABELS.lines.gap, text: GAP_LINE },
  { label: LABELS.lines.clash, text: CLASH_LINE },
];

/** The runs the investigation offers after the last step: the shop's readings, and room A at -100. */
const READINGS = [
  { label: LABELS.readings.shop, ...SHOP_READINGS },
  { label: LABELS.readings.warmA, sensorA: -100, sensorB: -250 },
];

/** The failure experiment's runs: the shop's readings, and a second pair of both signs. */
const FAULT_READINGS = [
  { label: LABELS.readings.shop, ...SHOP_READINGS },
  { label: LABELS.readings.bothSigns, sensorA: -30, sensorB: 80 },
];

/** The CLASH line's branch: its FETCH edge is edge 19, its ALU edge edge 21. */
const BRANCH_HELD = { line: "if R3 < R4 signed goto after1", fetch: 19 };

export const compiler: LessonInput = {
  id: "compiler",
  title: LABELS.title,
  module: 14,
  order: 1,
  optional: true,
  objectives: [...LABELS.objectives],
  prerequisites: ["immediates", "assembly", "full-path"],
  introduces: ["compiler"],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "asked",
          kind: "debugger",
          timeModel: "none",
          caption: LABELS.captions.asked,
          lead: PROSE.askedLead,
          props: { program: ASKED_PROGRAM, editable: true, inputs: SHOP_TEXT },
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
          id: "predict-branch",
          kind: "compile-steps",
          timeModel: "none",
          caption: LABELS.captions.predict,
          props: {
            lines: [{ label: LABELS.lines.clash, text: CLASH_LINE }],
            readings: [{ label: LABELS.readings.shop, ...SHOP_READINGS }],
            question: PROSE.p1Question,
            options: [
              "if R3 >= R4 signed goto after1",
              "if R3 < R4 signed goto after1",
              "if R4 < R3 signed goto after1",
              "if R3 < R4 unsigned goto after1",
            ].map((v) => ({ value: v, label: v })),
            ask: { step: 4 },
            explain: PROSE.p1Explain,
          },
        },
      ],
    },
    {
      kind: "investigation",
      title: LABELS.titles.investigation,
      prose: PROSE.investigation,
      interactives: [
        {
          id: "steps",
          kind: "compile-steps",
          timeModel: "none",
          caption: LABELS.captions.steps,
          lead: PROSE.stepsLead,
          props: { lines: LINES, readings: READINGS, outcomes: PROSE.stepsOutcomes },
        },
      ],
    },
    {
      kind: "construction",
      title: LABELS.titles.construction,
      prose: PROSE.construction,
      interactives: [
        {
          id: "branch-gates",
          kind: "machine-levels",
          timeModel: "settle",
          caption: LABELS.captions.branch,
          lead: PROSE.branchLead,
          props: {
            program: CLASH_PROGRAM,
            inputs: SHOP_INPUTS,
            // Paused before the branch's FETCH edge, frame 18, where FETCHED already holds its
            // word: the question hides every value until the learner commits.
            start: 18,
            holdRom: BRANCH_HELD,
            question: PROSE.branchQuestion,
            options: [
              { value: "56340003", label: "56340003" },
              { value: "57340003", label: "57340003" },
              { value: "56430003", label: "56430003" },
              { value: "56340007", label: "56340007" },
            ],
            ask: "net",
            net: "IR",
            form: "word",
            explain: PROSE.branchExplain,
            signals: ["OP2", "OP1", "OP0", "BRANCH"],
            shown: [3, 4],
            devices: true,
            focus: ["datapath/condition"],
            reveal: { text: PROSE.branchAfter, edge: 21 },
          },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: PROSE.failureExperiment,
      interactives: [
        {
          id: "one-register",
          kind: "compile-steps",
          timeModel: "none",
          caption: LABELS.captions.fault,
          lead: PROSE.faultLead,
          props: {
            lines: [{ label: LABELS.lines.gap, text: GAP_LINE }],
            readings: FAULT_READINGS,
            fault: "oneRegister",
            outcomes: PROSE.faultOutcomes,
          },
        },
      ],
    },
    { kind: "explanation", title: LABELS.titles.explanation, prose: PROSE.explanation },
    {
      kind: "generalisation",
      title: LABELS.titles.generalisation,
      prose: PROSE.generalisation,
      interactives: [
        {
          id: "compare",
          kind: "program-compare",
          timeModel: "none",
          caption: LABELS.captions.compare,
          lead: PROSE.compareLead,
          props: {
            programs: [
              { label: LABELS.programs.compiled, program: BOTH_PROGRAM },
              { label: LABELS.programs.module0, program: MEET_PROGRAMS.gap ?? "" },
            ],
            inputs: SHOP_TEXT,
            display: true,
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
          id: "being-the-compiler",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.challenge,
          lead: PROSE.challengeLead,
          props: { challengeId: "being-the-compiler" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "being-the-compiler",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "write",
      allowedConstructs: ["assembly"],
      interface: { inputs: [], outputs: [] },
      initial: {
        text: COMPILER_START,
        data: { debugger: { registersFirst: true } },
      },
      tests: {
        kind: "answers",
        grader: "program",
        cases: COMPILER_RUNS.map((r, k) => ({
          label: LABELS.runs[k] ?? `${r.sensorA}, ${r.sensorB}`,
          given: { sensorA: r.sensorA, sensorB: r.sensorB, detail: r.detail },
          expect: { lamps: r.lamps, display: 0, end: "stop" },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { text: COMPILER_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "Nand2Tetris's compiler for its object-based Jack language, through a stack-based virtual machine (projects 7 to 11), split into a tokenizer, a parser that writes out a parse tree, and code generation; the Dragon Book's `position = initial + rate * 60` through three-address code with temporaries t1 and t2; Patterson and Hennessy's (and Harris and Harris's) \"compiling a C assignment statement\" and \"compiling if-then-else into conditional branches\", whose branch also tests the condition turned over; Crenshaw's \"Let's Build a Compiler\", recursive descent writing 68000 code.",
    howThisDiffers:
      "The compiler's lines are the course's own register-transfer text with the assembler's refusals lifted: no classes, objects, methods or types, no let or do, and the only names are the shop's devices. It writes the course's instructions directly, with no virtual machine or other language in between: the only intermediate form is the line itself, rewritten in place, one piece and one instruction at a time, and the compiler in dd-model is built that way, so the figure shows its real steps and no textbook phases. Its five rules are the advice of refusals the learner met in Module 11. The lines are the shop's: Module 0's gap and CLASH rules, whose compiled output is Module 0's first program, and the challenge mends Module 0's one-way check. There is no multiplication, so no precedence example arises; the registers are the next free one, never named temporaries; no recursive descent is shown, and the reader builds no compiler. The comparison turned over is the machine's own lack of a branch on greater than (lesson 10.3), and the run is followed down to the condition block's gates on the course's final machine.",
  },
};
