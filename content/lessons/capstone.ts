// Copyright © 2026 Christopher Snow

// Lesson: Module 13, lesson 5, the capstone and the course's last lesson. The learner writes a
// program of their own for the shop (how many rooms are colder than -20.0 degrees, and ALARM when
// both are), with at least one set if, and runs it on the whole machine. Five questions ask what a
// named wire holds at a named edge of an instruction their program is sure to have (its first set
// if, its first store); the answers are read off the recorded run of the learner's own program
// (`capstoneAnswer`), so no two learners' answers need be the same, and a wrong answer is told
// which level to look at, never the value. The figures trace a short program of their own: MET
// and COUT at a set if's ALU edge, and MET held at 0 found from the comparison with the model.
// The model note names what a real machine does that this one does not, and shows a short
// testbench for the machine as code to read, which the course's engine does not run.
//
// The structure is here; the words are in capstone.prose.ts and capstone.labels.ts. The numbers
// the prose states are pinned by capstone.facts.test.ts.

import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./capstone.labels";
import { PROSE } from "./capstone.prose";
import { CAPSTONE_CASES, CAPSTONE_REFERENCE, CAPSTONE_SAMPLE } from "./module13";

/** The questions, as the challenge's fields name them, with the reference program's answers. */
export const CAPSTONE_FIELDS = [
  { id: "result", reference: "16" },
  { id: "carry", reference: "1" },
  { id: "met", reference: "0" },
  { id: "xorB", reference: "1" },
  { id: "held", reference: "-250" },
] as const;

const SAMPLE = {
  program: CAPSTONE_SAMPLE,
  inputs: { SENSORA: -184, SENSORB: -250 },
  levels: false,
  trace: true,
  shown: [1, 2, 3],
};

export const capstone: LessonInput = {
  id: "capstone",
  title: LABELS.title,
  module: 13,
  order: 5,
  objectives: [...LABELS.objectives],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "cap-free",
          kind: "machine-levels",
          timeModel: "settle",
          caption: LABELS.captions.free,
          lead: PROSE.questionLead,
          props: { ...SAMPLE, devices: true },
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
          id: "cap-predict",
          kind: "machine-levels",
          timeModel: "settle",
          caption: LABELS.captions.predict,
          props: {
            ...SAMPLE,
            start: 12,
            question: PROSE.p1Question,
            options: [
              { value: "0", label: "0" },
              { value: "1", label: "1" },
            ],
            ask: "net",
            net: "MET",
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
          id: "cap-carry",
          kind: "machine-levels",
          timeModel: "settle",
          caption: LABELS.captions.carry,
          lead: PROSE.invLead,
          props: {
            ...SAMPLE,
            start: 12,
            // Opens on the whole machine, the datapath in view; opening it, the step the lead asks for,
            // shows the ALU and the condition block.
            focus: ["datapath", "alu", "condition"],
            reveal: { text: PROSE.invAfter, scope: "datapath/alu" },
          },
        },
      ],
    },
    { kind: "construction", title: LABELS.titles.construction, prose: PROSE.construction },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: PROSE.failureExperiment,
      interactives: [
        {
          id: "cap-fault",
          kind: "machine-levels",
          timeModel: "settle",
          caption: LABELS.captions.fault,
          lead: PROSE.failLead,
          props: {
            ...SAMPLE,
            compare: true,
            devices: true,
            faults: [
              {
                kind: "stuck-at",
                net: "datapath/MET",
                value: 0,
                label: LABELS.faults.met,
                outcome: PROSE.failAfter,
              },
            ],
          },
        },
      ],
    },
    { kind: "explanation", title: LABELS.titles.explanation, prose: PROSE.explanation },
    { kind: "generalisation", title: LABELS.titles.generalisation, prose: PROSE.generalisation },
    {
      kind: "challenge",
      title: LABELS.titles.challenge,
      prose: "",
      interactives: [
        {
          id: "cap-challenge",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.cap,
          lead: PROSE.capLead,
          props: { challengeId: "your-program" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "your-program",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "write",
      allowedConstructs: ["assembly"],
      interface: { inputs: [], outputs: [] },
      fields: CAPSTONE_FIELDS.map((f) => ({
        id: f.id,
        label: LABELS.fields[f.id],
        kind: "text" as const,
      })),
      initial: { text: "" },
      tests: {
        kind: "answers",
        grader: "machine13-capstone",
        cases: [
          ...CAPSTONE_CASES.map((c) => ({
            label: LABELS.cases[c.id],
            given: { kind: "program", sensorA: c.sensorA, sensorB: c.sensorB },
            expect: { display: c.display, lamps: c.lamps },
          })),
          ...CAPSTONE_FIELDS.map((f) => ({
            label: LABELS.cases[f.id],
            given: { kind: "trace", question: f.id },
            expect: { from: "run" },
          })),
        ],
      },
      hints: [
        ...PROSE.c1Hints,
        PROSE.c1Whole
          .replace("{program}", CAPSTONE_REFERENCE)
          .replace("{answers}", CAPSTONE_FIELDS.map((f) => f.reference).join(", ")),
      ],
      reference: {
        text: CAPSTONE_REFERENCE,
        answers: Object.fromEntries(CAPSTONE_FIELDS.map((f) => [f.id, f.reference])),
      },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "The textbooks' closing exercise: a program written for the finished computer and run on it (Nand2Tetris's programs for the Hack computer, run on its CPU emulator; Harris and Harris's or Patterson and Hennessy's test programs run on the processor they built in Verilog, checked by one value written to memory at the end), with the levels below the program left to the simulator.",
    howThisDiffers:
      "The learner's program, for the course's own shop (how many freezer rooms are colder than -20.0 degrees, Module 10's count of cold rooms, with ALARM when both are), must use the set if the learner added in Module 10, and is graded twice: on the instruction-level model for five pairs of readings, one of which only a comparison read signed passes, and by five questions about one wire paused before the ALU edge of its own first set if on the whole machine (the ALU's output, its carry out, the branch condition, the output of one XOR gate inside the ALU's slice for bit 0, and HM, which still holds the last load's word). The answers are read off the recorded run of the learner's own program, so no two learners' answers need agree, and a wrong answer is told the level to look at, never the value. The figures trace a short program of their own, set COUT beside MET in Module 3's terms, and hold MET at 0 to be found from the comparison with the model. The model note shows a testbench as code to read and says the course's engine does not run it.",
  },
};
