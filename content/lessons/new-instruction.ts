// Copyright © 2026 Christopher Snow

// Lesson: Module 9, lesson 5, the capstone: a new instruction, end to end. A call through a
// register (docs/isa.md, "Left out on purpose"): RY ← PC + 4 and PC ← RA + c, at kind 9, the first
// kind docs/isa.md leaves free. It needs no new part of the datapath (Module 8's call already
// writes PC + 4 into Y, and its jump already takes the ALU's result into the PC), only control: a
// decoder row and the checks taught that kind 9 job 0 is an instruction. Its sequence of edges is
// the call's, FETCH, READ, WRITE, with no change to the controller: it sets CALL, and its WRITE
// edge takes the PC from the ALU, whose inputs are ready from READ on. The learner makes the
// change in their own copy
// of the machine's text; docs/isa.md does not change.
//
// The structure is here; the words are in new-instruction.prose.ts and new-instruction.labels.ts.
// The numbers the prose states are pinned by new-instruction.facts.test.ts.

import {
  CONTROL_STATES,
  MODULE_9,
  assemble,
  resetMachine,
  run,
  stateSequence,
  type MachineInputs,
} from "@dd/dd-model";
import type { LessonInput } from "@platform/lesson-schema";

import { LABELS } from "./new-instruction.labels";
import { PROSE } from "./new-instruction.prose";
import { SENSORS } from "./memory-access";
import {
  CHOOSE,
  MACHINE9_CONSTRUCTS,
  decoderText,
  decoderVectors,
  everyKindAndJob,
  machineText,
} from "./module9";

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

/** The decoder's outputs, all tested. */
const DECODER_OUTPUTS = [
  "WRITEY",
  "LOAD",
  "STORE",
  "BYTE",
  "AZERO",
  "BCONST",
  "OP2",
  "OP1",
  "OP0",
  "BRANCH",
  "CALL",
  "JUMP",
  "MEM",
  "STOP",
  "CAUSED",
];

/** The decoder's tests: every kind and job, and the system jobs that name a control register. */
const DECODER_VECTORS = decoderVectors(
  [
    ...everyKindAndJob(0),
    ...[2, 3].flatMap((j) =>
      [4, 5, 0xfff].map((c) => ({
        label: `K 8, J ${j}, C ${c.toString(16).toUpperCase().padStart(3, "0")}`,
        K: 8,
        J: j,
        C: c,
      })),
    ),
    { label: "K 9, J 0, C 008", K: 9, J: 0, C: 8 },
  ],
  ["K", "J", "C"],
  DECODER_OUTPUTS,
  true,
);

type Step = {
  label: string;
  set: Record<string, string | number>;
  expect?: Record<string, string | number>;
};

const h64 = (v: bigint) => `0x${BigInt.asUintN(64, v).toString(16).toUpperCase()}`;
const h3 = (v: bigint) => v.toString(16).toUpperCase().padStart(3, "0");
const s64 = (v: string) => BigInt.asUintN(64, BigInt(v));

/**
 * The machine's tests: the program from reset, each instruction's edges with the state after each
 * and the PC after the last, as the reference and each kind's sequence give them; a reset that
 * rises and falls while the clock is high; and the display and HALT at the stop.
 */
function machineSteps(): Step[] {
  const inputs: MachineInputs = {
    door: 0,
    warm: 0,
    sensorA: s64(SENSORS.SENSORA),
    sensorB: s64(SENSORS.SENSORB),
  };
  const program = assemble(CHOOSE, { callThroughRegister: 9 });
  const { records, state } = run(resetMachine(program.rom), 100, inputs, {
    ...MODULE_9,
    callThroughRegister: 9,
  });
  const steps: Step[] = [
    {
      label: "RST 1, clock low",
      set: {
        CLK: 0,
        RST: 1,
        DOOR: 0,
        WARM: 0,
        SENSORA: h64(inputs.sensorA),
        SENSORB: h64(inputs.sensorB),
      },
    },
    { label: "edge with RST 1: PC 000, FETCH", set: { CLK: 1 }, expect: { PC: h64(0n), S: 0 } },
    { label: "clock low, RST 0", set: { CLK: 0, RST: 0 } },
  ];
  const code = (s: keyof typeof CONTROL_STATES) => parseInt(CONTROL_STATES[s], 2);
  records
    .filter((r) => !r.stopped)
    .forEach((r, n) => {
      const seq = stateSequence(r.fields?.k ?? 0, { callThroughRegister: true });
      seq.forEach((st, i) => {
        const last = i === seq.length - 1;
        const next = seq[i + 1] ?? "FETCH";
        steps.push({
          label: `${h3(r.pc)}, edge ${i + 1} (${st}): ${next} after it${last ? `, PC ${h3(r.nextPc)}` : ""}`,
          set: { CLK: 1 },
          expect: { S: code(next), PC: h64(last ? r.nextPc : r.pc) },
        });
        // In the call, with the clock high: a reset that rises and falls changes nothing.
        if (n === 1 && i === 1)
          steps.push(
            {
              label: "RST rises while the clock is high: the state and PC keep",
              set: { RST: 1 },
              expect: { S: code(next), PC: h64(r.pc) },
            },
            { label: "RST falls, the clock still high", set: { RST: 0 } },
          );
        steps.push({ label: "clock low", set: { CLK: 0 } });
      });
    });
  const stopPc = state.stopped?.pc ?? 0n;
  steps.push(
    {
      label: `${h3(stopPc)}, edge 1 (FETCH): READ after it`,
      set: { CLK: 1 },
      expect: { S: code("READ"), PC: h64(stopPc) },
    },
    { label: "clock low: the stop halts the machine", set: { CLK: 0 } },
    {
      label: `at the stop: HALT is 1, the display shows ${BigInt.asIntN(64, state.display)}`,
      set: {},
      expect: { HALT: 1, DISPLAY: h64(state.display) },
    },
  );
  return steps;
}

export const newInstruction: LessonInput = {
  id: "new-instruction",
  title: LABELS.title,
  module: 9,
  order: 5,
  objectives: [...LABELS.objectives],
  introduces: [],
  termExemptions: [
    {
      term: "instruction set",
      reason:
        '"The new instruction sets CALL": the verb, an instruction setting a control signal; lesson 10.1 introduces the instruction set.',
    },
  ],
  sections: [
    { kind: "question", title: LABELS.titles.question, prose: PROSE.question },
    {
      kind: "motivation",
      title: LABELS.titles.motivation,
      prose: PROSE.motivation,
      interactives: [
        {
          id: "call-and-jump",
          kind: "control-table",
          timeModel: "settle",
          caption: LABELS.captions.callAndJump,
          lead: PROSE.callAndJumpLead,
          props: { kinds: [6, 7] },
        },
      ],
    },
    {
      kind: "prediction",
      title: LABELS.titles.prediction,
      prose: PROSE.prediction,
      interactives: [
        {
          id: "predict-call-edges",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.predictCallEdges,
          props: {
            libraryId: "machine-edges-call",
            program: CHOOSE,
            inputs: SENSORS,
            edges: 4,
            shown: [4, 15],
            question: PROSE.p1Question,
            options: [
              { value: "3", label: LABELS.options.p1Three },
              { value: "4", label: LABELS.options.p1Four },
              { value: "5", label: LABELS.options.p1Five },
            ],
            ask: "edges",
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
          id: "choose",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.choose,
          lead: PROSE.chooseLead,
          props: {
            outcomes: PROSE.chooseAfter,
            libraryId: "machine-edges-call",
            program: CHOOSE,
            inputs: SENSORS,
            shown: [2, 4, 15],
            devices: true,
            run: true,
            microOps: true,
            states: true,
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
          props: { challengeId: "decoder-text" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "call-faults",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.callFaults,
          lead: PROSE.callFaultsLead,
          props: {
            libraryId: "machine-edges-call",
            program: CHOOSE,
            inputs: SENSORS,
            shown: [2, 4, 15],
            devices: true,
            run: true,
            microOps: true,
            faults: [
              {
                kind: "wrong-gate",
                path: "control/decoder/signals/orCall",
                gate: "and",
                label: LABELS.faults.callAnd,
                outcome: PROSE.callFaultCall,
              },
              {
                kind: "wrong-gate",
                path: "control/decoder/signals/orJump",
                gate: "and",
                label: LABELS.faults.jumpAnd,
                outcome: PROSE.callFaultJump,
              },
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
          id: "new-column",
          kind: "control-table",
          timeModel: "settle",
          caption: LABELS.captions.newColumn,
          lead: PROSE.newColumnLead,
          props: { kinds: [6, 7, 9], callThroughRegister: true },
        },
      ],
    },
    {
      kind: "generalisation",
      title: LABELS.titles.generalisation,
      prose: PROSE.generalisation,
      interactives: [
        {
          id: "new-edges",
          kind: "kind-edges",
          timeModel: "clocked",
          caption: LABELS.captions.newEdges,
          lead: PROSE.newEdgesLead,
          props: { kinds: [6, 7, 9], callThroughRegister: true },
        },
      ],
    },
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
          props: { challengeId: "machine-text" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "decoder-text",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "write",
      feedback: "words",
      interface: {
        inputs: [
          { name: "K", width: 4 },
          { name: "J", width: 4 },
          { name: "C", width: 12 },
        ],
        outputs: DECODER_OUTPUTS.map((name) => (name === "CAUSED" ? { name, width: 8 } : { name })),
      },
      allowedConstructs: DECODER_CONSTRUCTS,
      tryIt: "pins",
      initial: { hdl: decoderText(false) },
      tests: { kind: "combinational", vectors: DECODER_VECTORS },
      hints: [...PROSE.c1Hints],
      reference: { hdl: decoderText(true) },
    },
    {
      id: "machine-text",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      feedback: "words",
      interface: {
        inputs: [
          { name: "CLK" },
          { name: "RST" },
          { name: "DOOR" },
          { name: "WARM" },
          { name: "SENSORA", width: 64 },
          { name: "SENSORB", width: 64 },
        ],
        outputs: [
          { name: "PC", width: 64 },
          { name: "S", width: 3 },
          { name: "HALT" },
          { name: "CAUSE", width: 8 },
          { name: "DISPLAY", width: 64 },
          { name: "LAMPS", width: 3 },
        ],
      },
      allowedConstructs: MACHINE9_CONSTRUCTS,
      courseModules: { set: "machine9-call", program: CHOOSE },
      tryIt: "pins",
      initial: { hdl: machineText(false) },
      tests: { kind: "sequence", steps: machineSteps() },
      hints: [...PROSE.c2Hints],
      reference: { hdl: machineText(true) },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "Adding an instruction to a textbook multicycle processor as an exercise: jal or addi added to the finite-state control of Patterson and Hennessy's or Harris and Harris's multicycle MIPS, with new states and a new control-signal row; Nand2Tetris has no step of this kind; RISC-V's jalr, the jump and link through a register.",
    howThisDiffers:
      "The instruction is the call through a register docs/isa.md leaves out on purpose, at kind 9, in the learner's own copy of the course machine's text: docs/isa.md does not change, and kinds A to F stay free for Module 10. It needs no datapath part, because Module 8's call and jump already made both of its transfers, so the work is control alone: a decoder row (the call's and the jump's signals together, with BCONST and the ALU's add), the checks taught that kind 9 job 0 is an instruction, and no change to the controller: the instruction sets CALL, so it takes the call's three edges, and its WRITE edge takes the PC from the ALU, whose inputs, the held word of RA and the constant, are ready from READ on. It is tested end to end by the simulator, edge by edge, against the reference told which machine it stands for. The program is the shop's: the office chooses at run time which room's reading to show, by the routine's address in R4. The faults are the decoder's ORs for CALL and JUMP made ANDs: the return address lost, and a call that calls itself.",
  },
};
