// Copyright © 2026 Christopher Snow

// Module 13's capstone: a program of the learner's own for the shop, run on the instruction-level
// model to see that it does the task, and on the whole machine (`machine-final`) to answer
// questions about its own run that a trace answers directly. Each question names a wire paused
// before the ALU edge of the instruction the program is sure to have, its first set if, and its
// answer is read off the recorded run of the learner's own program, so no two learners' answers
// need be the same.

import { assembleChecked, type Program } from "./assemble";
import { recordRun, type RecordedRun } from "./final-run";
import {
  MODULE_13,
  MODULE_13_ASSEMBLY,
  QUIET_INPUTS,
  resetMachine,
  step,
  type CpuState,
} from "./machine";
import { edgeView, netWord } from "./multicycle-view";

/** How a program ended on the model. */
export interface ModelEnd {
  readonly display: bigint;
  readonly lamps: number;
  /** `stop`, a halt with its cause, or no end within the limit. */
  readonly end:
    | { readonly kind: "stop" }
    | { readonly kind: "halt"; readonly cause: number }
    | { readonly kind: "limit" }
    /**
     * The model refused an instruction that reads a register no instruction has written yet: a
     * branch, a jump or an address, which the machine cannot work out from an unknown word.
     */
    | {
        readonly kind: "unknown";
        readonly line: string;
        readonly address: number;
        readonly registers: readonly number[];
      };
}

/** Run a program on the model with Module 13's options, from reset, until it stops or halts. */
export function modelEnd(
  program: Program,
  sensors: { readonly sensorA: bigint; readonly sensorB: bigint },
  limit = 2000,
): ModelEnd {
  let s: CpuState = resetMachine(program.rom);
  const inputs = { ...QUIET_INPUTS, ...sensors };
  for (let k = 0; k < limit && !s.stopped; k++) {
    try {
      s = step(s, inputs, MODULE_13).state;
    } catch {
      return {
        display: BigInt.asIntN(64, s.display),
        lamps: s.lamps,
        end: unknownAt(program, s),
      };
    }
  }
  const reason = s.stopped?.reason;
  return {
    display: BigInt.asIntN(64, s.display),
    lamps: s.lamps,
    end: !reason
      ? { kind: "limit" }
      : reason.kind === "trap"
        ? { kind: "halt", cause: reason.cause }
        : { kind: "stop" },
  };
}

/** Where the model refused: the line at the PC, and its registers that hold no value yet. */
function unknownAt(program: Program, s: CpuState): ModelEnd["end"] {
  const line = program.lines.find((l) => BigInt(l.address) === s.pc);
  const word = line?.instruction ?? 0;
  // The fields A and B (`docs/isa.md`): the registers an instruction reads.
  const read = [(word >>> 20) & 15, (word >>> 16) & 15];
  const unknown = [...new Set(read)].filter((r) => s.regs[r] === undefined);
  return {
    kind: "unknown",
    line: line?.text ?? "",
    address: Number(s.pc),
    registers: unknown.length ? unknown : read.slice(0, 1),
  };
}

/** A program assembled with Module 13's two added instructions, or its problems. */
export function capstoneProgram(source: string) {
  return assembleChecked(source, MODULE_13_ASSEMBLY);
}

/**
 * The capstone's questions, each read paused before the ALU edge of the program's first set if:
 * a word read signed, or a row of single wires, highest first. A row cannot be found by trying
 * 0 and then 1, and the gate's row differs with the operand a learner's set if puts in B.
 */
export const CAPSTONE_QUESTIONS = {
  /** The ALU's output, signed. */
  result: { instruction: "setIf", state: "ALU", read: ["RESULT"], form: "signed" },
  /** The ALU's four flags, then the condition block's MET: five bits. */
  flags: {
    instruction: "setIf",
    state: "ALU",
    read: ["ZERO", "MINUS", "COUT", "OVER", "MET"],
    form: "bits",
  },
  /**
   * Gates inside the ALU: the XORs that turn B's bits 7 to 4 over for a subtraction, in the slices
   * of the group `q1`, worked on the learner's own operand.
   */
  xorB: {
    instruction: "setIf",
    state: "ALU",
    read: [3, 2, 1, 0].map((k) => `datapath/alu/g0/q1/bit${k}/BX`),
    form: "bits",
  },
  /** HM: a held word, signed. */
  held: { instruction: "setIf", state: "ALU", read: ["HM"], form: "signed" },
} as const satisfies Readonly<
  Record<
    string,
    {
      instruction: "setIf";
      state: "ALU";
      read: readonly string[];
      form: "signed" | "bits";
    }
  >
>;
export type CapstoneQuestion = keyof typeof CAPSTONE_QUESTIONS;

/** The inputs every trace question is asked at: Module 0's readings. */
export const CAPSTONE_TRACE_INPUTS = { SENSORA: -184, SENSORB: -250 } as const;

const kindOf = (word: number) => (word >>> 28) & 15;

/** The first step of a run whose instruction is of a kind, by its word. */
function firstStep(run: RecordedRun) {
  const words = new Map(
    run.program.lines
      .filter((l) => l.instruction !== undefined)
      .map((l) => [BigInt(l.address), l.instruction as number]),
  );
  // Set if is kind A (`docs/isa.md`).
  const want = 10;
  return run.steps.find((s) => {
    const w = words.get(s.pc);
    return w !== undefined && kindOf(w) === want;
  });
}

/** Why a question has no answer for a program, or its answer as the learner would write it. */
export type CapstoneAnswer = { readonly answer: string } | { readonly missing: "setIf" | "edge" };

/** A question's answer, read off the run of the learner's program. */
export function capstoneAnswer(run: RecordedRun, question: CapstoneQuestion): CapstoneAnswer {
  const q = CAPSTONE_QUESTIONS[question];
  const s = firstStep(run);
  if (!s) return { missing: q.instruction };
  // The frame before the named edge: the values on the wires while the controller is in it.
  let at: number | undefined;
  for (let f = s.first; f < s.last; f++)
    if (edgeView(run.circuit, run.frames[f] ?? []).state === q.state) {
      at = f;
      break;
    }
  if (at === undefined) return { missing: "edge" };
  const values = run.frames[at] ?? [];
  const words = q.read.map((name) => netWord(run.circuit, values, name));
  // A wire whose value is not known reads X: a held word no load has written yet, for one.
  const known = (w: (typeof words)[number]) =>
    w !== undefined && w.known === (1n << BigInt(w.width)) - 1n;
  if (q.form === "signed") {
    const w = words[0];
    return { answer: w && known(w) ? BigInt.asIntN(w.width, w.value).toString() : "X" };
  }
  return { answer: words.map((w) => (w && known(w) ? String(w.value & 1n) : "X")).join("") };
}

/** The learner's answer as the question's form reads it, or undefined if it reads as nothing. */
export function readCapstoneAnswer(question: CapstoneQuestion, text: string): string | undefined {
  const t = text.trim().toUpperCase();
  if (!t) return undefined;
  const q = CAPSTONE_QUESTIONS[question];
  // X: what the trace shows for a wire whose value is not known.
  if (q.form === "signed")
    return t === "X" ? "X" : /^[+-]?\d+$/.test(t) ? BigInt(t).toString() : undefined;
  return new RegExp(`^[01X]{${q.read.length}}$`).test(t) ? t : undefined;
}

/** The run of a learner's program the questions are read from, at Module 0's readings. */
export function capstoneRun(source: string, limit = 500): RecordedRun {
  return recordRun(
    { libraryId: "machine-final", program: source, inputs: CAPSTONE_TRACE_INPUTS },
    limit,
  );
}
