// Copyright © 2026 Christopher Snow

// Lesson: Module 10, lesson 5, the capstone: design, justify and implement one new instruction.
// "Set if", RY ← 1 if RA cond RB, else 0, at kind A, the job digit a branch's condition, in the
// learner's copy of Module 9's machine (whose kind 9 is the call through a register). The design
// is graded against the layout's rules: a free kind, the fields where every instruction keeps
// them, the program it shortens and what it costs. The decoder gains a column and a signal, SET;
// the controller does not change (a register job's 4 edges); the datapath gains a source for the
// word register Y takes, the condition MET as a word, chosen by SET. Each part is tested against
// the reference told about the instruction (module10.test.ts). docs/isa.md does not change.
//
// The structure is here; the words are in design-an-instruction.prose.ts and
// design-an-instruction.labels.ts. The numbers the prose states are pinned by
// design-an-instruction.facts.test.ts.

import { Simulator, word } from "@dd/sim";
import { decoderCircuit } from "@dd/dd-model";
import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./design-an-instruction.labels";
import { PROSE } from "./design-an-instruction.prose";
import {
  COUNT_COLD_BRANCHES,
  COUNT_COLD_SET,
  MACHINE_INTERFACE,
  SET_DECODER_OUTPUTS,
  setMachineSteps,
  setDecoderText,
  setMachineText,
} from "./module10";
import { MACHINE9_CONSTRUCTS } from "./module9";

/** The rooms as Module 1 read them, and the program's limit of -200 between them. */
export const ROOMS = { DOOR: 0, WARM: 0, SENSORA: "-184", SENSORB: "-250" };

/** The design's choices, each with the one that answers its question, and the rule a wrong one misses. */
export const DESIGN = [
  { id: "kind", options: ["0", "5", "9", "A"], answer: "A", detail: "designKind" },
  { id: "result", options: ["y", "b", "new"], answer: "y", detail: "designField" },
  {
    id: "condition",
    options: ["job", "constant", "new"],
    answer: "job",
    detail: "designCondition",
  },
  {
    id: "program",
    options: ["count", "colder", "times"],
    answer: "count",
    detail: "designProgram",
  },
  { id: "cost", options: ["column", "source", "part"], answer: "source", detail: "designCost" },
] as const;

const hex = (n: number, d: number) => n.toString(16).toUpperCase().padStart(d, "0");

/** The decoder's tests: every kind and job, read off the drawn decoder of the learner's copy. */
function decoderVectors() {
  const sim = new Simulator(decoderCircuit({ callThroughRegister: true, setIf: true }));
  const cases = [
    ...Array.from({ length: 256 }, (_, n) => ({ K: n >> 4, J: n & 15, C: 0 })),
    ...[2, 3].flatMap((J) => [4, 5, 0xfff].map((C) => ({ K: 8, J, C }))),
  ];
  return cases.map((c) => {
    sim.setInput("K", word(4, c.K));
    sim.setInput("J", word(4, c.J));
    sim.setInput("C", word(12, c.C));
    sim.settle();
    const out = sim.outputs();
    return {
      label: `K ${hex(c.K, 1)}, J ${hex(c.J, 1)}${c.C ? `, C ${hex(c.C, 3)}` : ""}`,
      inputs: { K: c.K, J: c.J, C: c.C },
      expect: Object.fromEntries(SET_DECODER_OUTPUTS.map((n) => [n, Number(out[n]?.value ?? 0n)])),
    };
  });
}

const DECODER_CONSTRUCTS = [
  "module",
  "ports",
  "logic",
  "vector",
  "assign",
  "select",
  "op-bitwise",
  "op-compare",
  "always_comb",
  "case",
  "if",
];

/** The figure's run of the block that chooses register Y's word, each step a case it must meet. */
const Y_RUN = [
  {
    label: LABELS.run.setOne,
    set: { HR: "0x42", HM: "0x7", PC4: "0x10", LOAD: 0, CALL: 0, SET: 1, MET: 1 },
  },
  { label: LABELS.run.setZero, set: { MET: 0 } },
  { label: LABELS.run.job, set: { SET: 0, MET: 1 } },
  { label: LABELS.run.load, set: { LOAD: 1 } },
];

export const designAnInstruction: LessonInput = {
  id: "design-an-instruction",
  title: LABELS.title,
  module: 10,
  order: 5,
  objectives: [...LABELS.objectives],
  introduces: [],
  sections: [
    { kind: "question", title: LABELS.titles.question, prose: PROSE.question },
    {
      kind: "motivation",
      title: LABELS.titles.motivation,
      prose: PROSE.motivation,
      interactives: [
        {
          id: "need",
          kind: "program-compare",
          timeModel: "none",
          caption: LABELS.captions.need,
          lead: PROSE.needLead,
          props: {
            programs: [{ label: LABELS.programs.branches, program: COUNT_COLD_BRANCHES }],
            inputs: ROOMS,
            romBytes: false,
            outcomes: PROSE.needAfter,
          },
        },
        {
          id: "design",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.design,
          lead: PROSE.designLead,
          props: { challengeId: "design" },
        },
      ],
    },
    {
      kind: "prediction",
      title: LABELS.titles.prediction,
      prose: PROSE.prediction,
      interactives: [
        {
          id: "predict-edges",
          kind: "kind-edges",
          timeModel: "clocked",
          caption: LABELS.captions.predictEdges,
          props: {
            kinds: [10, 1, 5],
            callThroughRegister: true,
            setIf: true,
            question: PROSE.p1Question,
            options: [
              { value: "3", label: LABELS.options.p1Three },
              { value: "4", label: LABELS.options.p1Four },
              { value: "5", label: LABELS.options.p1Five },
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
          id: "shorter",
          kind: "program-compare",
          timeModel: "none",
          caption: LABELS.captions.shorter,
          lead: PROSE.shorterLead,
          props: {
            programs: [
              { label: LABELS.programs.branches, program: COUNT_COLD_BRANCHES },
              { label: LABELS.programs.setIf, program: COUNT_COLD_SET, capstone: true },
            ],
            inputs: ROOMS,
            shown: [5, 6],
            romBytes: false,
            outcomes: PROSE.shorterAfter,
          },
        },
        {
          id: "y-word",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.yWord,
          lead: PROSE.yWordLead,
          after: PROSE.yWordAfter,
          props: {
            libraryId: "y-word-set",
            writtenWidth: 4,
            initial: { HR: "0x42", HM: "0x7", PC4: "0x10" },
          },
        },
        {
          id: "new-column",
          kind: "control-table",
          timeModel: "settle",
          caption: LABELS.captions.newColumn,
          lead: PROSE.newColumnLead,
          props: {
            kinds: [1, 5, 10],
            signals: ["WRITEY", "OP2", "OP1", "OP0", "BRANCH", "SET"],
            callThroughRegister: true,
            setIf: true,
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
          id: "write-decoder",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.writeDecoder,
          lead: PROSE.writeDecoderLead,
          props: { challengeId: "set-decoder" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "set-faults",
          kind: "fault-lab",
          timeModel: "settle",
          caption: LABELS.captions.setFaults,
          lead: PROSE.setFaultsLead,
          props: {
            libraryId: "y-word-set",
            writtenWidth: 4,
            radix: 16,
            faults: [
              {
                kind: "stuck-at",
                net: "SET",
                value: 0,
                label: LABELS.faults.setLow,
                outcome: PROSE.faultSetLow,
              },
              {
                kind: "stuck-at",
                net: "SET",
                value: 1,
                label: LABELS.faults.setHigh,
                outcome: PROSE.faultSetHigh,
              },
            ],
            run: Y_RUN,
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
          id: "condition-uses",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.conditionUses,
          lead: PROSE.conditionUsesLead,
          props: {
            libraryId: "condition-uses",
            writtenWidth: 4,
            initial: { PC4: "0x10", TARGET: "0x40", HR: "0x42" },
            focus: ["andTake", "widenMet", "pickTake", "pickSet"],
            highlight: ["condition"],
            highlightLabel: LABELS.conditionMark,
          },
        },
      ],
    },
    { kind: "generalisation", title: LABELS.titles.generalisation, prose: PROSE.generalisation },
    {
      kind: "challenge",
      title: LABELS.titles.challenge,
      prose: "",
      interactives: [
        {
          id: "write-machine",
          kind: "challenge",
          timeModel: "clocked",
          caption: LABELS.captions.writeMachine,
          lead: PROSE.writeMachineLead,
          props: { challengeId: "set-machine" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "design",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: DESIGN.map((d) => ({
        id: d.id,
        label: LABELS.design[d.id],
        kind: "choice" as const,
        options: d.options.map((o) => ({ value: o, label: LABELS.choices[d.id][o as never] })),
      })),
      tests: {
        kind: "answers",
        grader: "choices",
        cases: DESIGN.map((d) => ({
          label: LABELS.design[d.id],
          given: { field: d.id, detail: d.detail },
          expect: { value: d.answer },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { answers: Object.fromEntries(DESIGN.map((d) => [d.id, d.answer])) },
    },
    {
      id: "set-decoder",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      feedback: "words",
      interface: {
        inputs: [
          { name: "K", width: 4 },
          { name: "J", width: 4 },
          { name: "C", width: 12 },
        ],
        outputs: SET_DECODER_OUTPUTS.map((name) =>
          name === "CAUSED" ? { name, width: 8 } : { name },
        ),
      },
      allowedConstructs: DECODER_CONSTRUCTS,
      tryIt: "pins",
      initial: { hdl: setDecoderText(false) },
      tests: { kind: "combinational", vectors: decoderVectors() },
      hints: [...PROSE.c2Hints],
      reference: { hdl: setDecoderText(true) },
    },
    {
      id: "set-machine",
      title: LABELS.challengeTitles.c3,
      task: PROSE.c3Task,
      gradedDirection: "write",
      feedback: "words",
      interface: MACHINE_INTERFACE,
      allowedConstructs: MACHINE9_CONSTRUCTS,
      courseModules: { set: "machine9-set", program: COUNT_COLD_SET },
      tryIt: "pins",
      initial: { hdl: setMachineText(false) },
      tests: {
        kind: "sequence",
        steps: setMachineSteps(),
      },
      hints: [...PROSE.c3Hints],
      reference: { hdl: setMachineText(true) },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "slt and sltu in MIPS and RISC-V, set less than, written into the register file from the ALU's comparison, used by an assembler to expand bgt and ble; adding an instruction to a textbook processor as an exercise (an addi or a jal added to Patterson and Hennessy's or Harris and Harris's single-cycle or multicycle MIPS: a new row of the control table and, where needed, a new multiplexer input).",
    howThisDiffers:
      "The instruction is the course's own \"set if\": its job digit is the branch's condition unchanged, all eight of them, so the condition block the learner built in Module 8 serves both and the decoder's job check treats kind A as it treats kinds 1, 2 and 5. The learner first designs it against the course's own layout rules (a free kind in their copy of Module 9's machine, where kind 9 is taken by their earlier capstone; the result in digit Y, where every instruction keeps it; the condition in J; the program it shortens, the shop's count of cold rooms, counted on the reference; what it costs the circuit, set against the left-out instructions of lesson 4), then implements it in two steps of their own text: the decoder's column and checks, then the datapath's new source for register Y, the condition carried as a word, which Module 9's capstone did not need. Each step is graded edge by edge against the reference told about the instruction. The controller does not change: set if takes a register job's four edges.",
  },
};
