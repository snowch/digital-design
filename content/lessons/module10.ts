// Copyright © 2026 Christopher Snow

// Module 10's shared data: the machine of several edges an instruction as SystemVerilog, changed
// two ways, and the programs the lessons run.
//
// - Lesson 1's second circuit for the same instructions: the register and constant jobs write
//   register Y at the ALU edge and take 3 edges, not 4. The instructions do not change, so every
//   program runs to the same result (module10.test.ts runs Module 8's suite through it).
// - The capstone's "set if" at kind A, `RY ← 1` if `RA cond RB`, else 0, the job digit a branch's
//   condition, added to the learner's copy of Module 9's machine, whose kind 9 is the call through
//   a register. The decoder gains a column and a signal, SET; the datapath gains a source for the
//   word register Y takes, the condition MET as a word. docs/isa.md does not change.
//
// Each text is Module 9's (module9.ts) with the lines named here changed, so a learner's start and
// the reference differ only in the lines a lesson asks for.

import {
  CONTROL_STATES,
  assemble,
  assemblyFor,
  referenceFor,
  resetMachine,
  run,
  stateSequence,
  type ControlOptions,
  type ControlState,
  type MachineInputs,
} from "@dd/dd-model";

import { CALL_REGISTER_ARM, decoderText, machineText } from "./module9";

/** Replaces one line of a text, and fails loudly if the line is not there. */
function edit(text: string, from: string, to: string): string {
  if (!text.includes(from)) throw new Error(`module10: no ${JSON.stringify(from)} to change`);
  return text.replace(from, to);
}

// Lesson 10.1: a second circuit for the same instructions.

/** The three lines lesson 10.1's challenge changes, as Module 9's machine has them. */
export const SHORT_JOBS_FROM = {
  alu: "        else if (WRITEY) next = WRITE;\n",
  wreg: "  assign WREG = (state == WRITE) & WRITEY & GO;",
  yin: "    YIN = HR;",
} as const;

/** The same three lines in the second circuit. */
export const SHORT_JOBS_TO = {
  alu: "",
  wreg: "  assign WREG = ((state == WRITE) | ((state == ALU) & ~MEM)) & WRITEY & GO;",
  yin: "    YIN = RESULT;",
} as const;

/** Module 9's machine with its jobs written at the ALU edge: the challenge's reference. */
export function shortJobsText(): string {
  let text = machineText(false);
  for (const k of ["alu", "wreg", "yin"] as const)
    text = edit(text, SHORT_JOBS_FROM[k], SHORT_JOBS_TO[k]);
  return text;
}

// Lesson 10.5: set if, at kind A.

/** The capstone's arm: set if writes Y, subtracts as a branch does, and raises SET. */
export const SET_IF_ARM = "4'hA: begin WRITEY = 1'b1; OP1 = 1'b1; OP0 = 1'b1; SET = 1'b1; end";

/** The decoder's lines that kind A changes, as the learner's Module 9 copy has them. */
const SET_FROM = {
  port: "  output logic MEM,\n",
  zero: "    MEM = 1'b0;\n",
  arm: `      ${CALL_REGISTER_ARM}\n`,
  kinds: "(K == 4'h0) | (K[3] & (K != 4'h8) & (K != 4'h9))",
  jobs: "(((K == 4'h1) | (K == 4'h2) | (K == 4'h5)) & J[3])",
} as const;

const SET_TO = {
  port: "  output logic MEM,\n  output logic SET,\n",
  zero: "    MEM = 1'b0;\n    SET = 1'b0;\n",
  arm: `      ${CALL_REGISTER_ARM}\n      ${SET_IF_ARM}\n`,
  kinds: "(K == 4'h0) | (K[3] & (K != 4'h8) & (K != 4'h9) & (K != 4'hA))",
  jobs: "(((K == 4'h1) | (K == 4'h2) | (K == 4'h5) | (K == 4'hA)) & J[3])",
} as const;

/**
 * The decoder of the learner's copy with SET as an output: `withKind` adds kind A's arm and its
 * two checks; without, SET is declared and always 0, and kind A is still refused.
 */
export function setDecoderText(withKind: boolean): string {
  let text = decoderText(true);
  const keys = withKind
    ? (["port", "zero", "arm", "kinds", "jobs"] as const)
    : (["port", "zero"] as const);
  for (const k of keys) text = edit(text, SET_FROM[k], SET_TO[k]);
  return text;
}

/** The machine's lines the capstone's datapath change touches. */
const SET_MACHINE_FROM = {
  wires:
    "  logic WRITEY, LOAD, STORE, BYTE, AZERO, BCONST, OP2, OP1, OP0, BRANCH, CALL, JUMP, MEM, STOP;",
  port: "    .MEM(MEM), .STOP(STOP), .CAUSED(CAUSED));",
  yin: "    if (CALL) YIN = PC4;\n",
} as const;

const SET_MACHINE_TO = {
  wires:
    "  logic WRITEY, LOAD, STORE, BYTE, AZERO, BCONST, OP2, OP1, OP0, BRANCH, CALL, JUMP, MEM, STOP, SET;",
  port: "    .MEM(MEM), .SET(SET), .STOP(STOP), .CAUSED(CAUSED));",
  yin: "    if (CALL) YIN = PC4;\n    if (SET) YIN = {63'h0, MET};\n",
} as const;

/**
 * The learner's copy of the whole machine with kind A's decoder. `withSource` joins SET to the
 * decoder and gives register Y the condition as a word: the reference. Without, the decoder knows
 * kind A but its SET goes nowhere, so register Y takes HR, the subtraction: the start.
 */
export function setMachineText(withSource: boolean): string {
  let top = machineText(true);
  top = edit(top, decoderText(true), setDecoderText(true));
  if (!withSource) return top;
  for (const k of ["wires", "port", "yin"] as const)
    top = edit(top, SET_MACHINE_FROM[k], SET_MACHINE_TO[k]);
  return top;
}

// The programs the lessons run.

/**
 * The capstone's program: how many of the two rooms are colder than the limit in R1? Without set
 * if, a branch and a count for each room; with it, one instruction each and an add.
 */
export const COUNT_COLD_BRANCHES = `R1 <= -200
R2 <= word[sensorA]
R3 <= word[sensorB]
R4 <= 0
if R2 >= R1 signed goto roomB
R4 <= R4 + 1
roomB: if R3 >= R1 signed goto show
R4 <= R4 + 1
show: word[display] <= R4
stop`;

export const COUNT_COLD_SET = `R1 <= -200
R2 <= word[sensorA]
R3 <= word[sensorB]
R5 <= R2 < R1 signed
R6 <= R3 < R1 signed
R4 <= R5 + R6
word[display] <= R4
stop`;

// Tests a machine's text edge by edge, as lesson 9.5's second challenge does.

/** One step of a sequence test. */
export interface MachineStep {
  readonly label: string;
  readonly set: Record<string, string | number>;
  readonly expect?: Record<string, string | number>;
}

const h64 = (v: bigint) => `0x${BigInt.asUintN(64, v).toString(16).toUpperCase()}`;
const h3 = (v: bigint) => v.toString(16).toUpperCase().padStart(3, "0");

/**
 * The tests of a whole machine's text: a reset, then each instruction's edges with the state after
 * each and the PC after the last, as the reference and each kind's sequence give them (the
 * machine's options say which sequence); then the stop's fetch, HALT and the display.
 */
export function machineSteps(
  source: string,
  inputs: MachineInputs,
  options: ControlOptions,
): MachineStep[] {
  const program = assemble(source, assemblyFor(options));
  const { records, state } = run(resetMachine(program.rom), 200, inputs, referenceFor(options));
  const steps: MachineStep[] = [
    {
      label: "RST 1, clock low",
      set: {
        CLK: 0,
        RST: 1,
        DOOR: inputs.door,
        WARM: inputs.warm,
        SENSORA: h64(inputs.sensorA),
        SENSORB: h64(inputs.sensorB),
      },
    },
    { label: "edge with RST 1: PC 000, FETCH", set: { CLK: 1 }, expect: { PC: h64(0n), S: 0 } },
    { label: "clock low, RST 0", set: { CLK: 0, RST: 0 } },
  ];
  const code = (s: ControlState) => parseInt(CONTROL_STATES[s], 2);
  for (const r of records.filter((x) => !x.stopped)) {
    const seq = stateSequence(r.fields?.k ?? 0, options);
    seq.forEach((st, i) => {
      const last = i === seq.length - 1;
      const next = seq[i + 1] ?? "FETCH";
      steps.push({
        label: `${h3(r.pc)}, edge ${i + 1} (${st}): ${next} after it${last ? `, PC ${h3(r.nextPc)}` : ""}`,
        set: { CLK: 1 },
        expect: { S: code(next), PC: h64(last ? r.nextPc : r.pc) },
      });
      steps.push({ label: "clock low", set: { CLK: 0 } });
    });
  }
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

/** The ports of the machine's text, which every challenge on it shares. */
export const MACHINE_INTERFACE = {
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
};
