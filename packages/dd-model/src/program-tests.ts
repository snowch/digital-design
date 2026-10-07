// Copyright © 2026 Christopher Snow

// Module 11: a program graded by running it. The learner's text is assembled by the learner's
// assembler, with the scenario's data added after it, and run on the reference (debugger.ts) from
// reset, or from a function's label with chosen registers, as a test calls a function directly.
// A case's expectations name what a program can see: the display, the lamps, a register, a word
// of the RAM, how the run ended, the words shown on the display in order, how deep the stack went,
// and, for a function called alone, whether it returned and put back the registers it must keep.
//
// The result says what the program left, never what was expected: the book shows the learner's
// values and a sentence naming which part is wrong (the case's `detail`).

import { assembleChecked, type AssemblyProblem, type Program } from "./assemble";
import {
  RUN_LIMIT,
  debugFinish,
  debugStart,
  debugStartAt,
  memoryWord,
  type DebugState,
  type DebugStop,
} from "./debugger";
import { QUIET_INPUTS, type MachineInputs } from "./machine";

/** What a test gives a run: data after the program, the shop's inputs, a function to call. */
export interface ProgramScenario {
  /** Lines of `word` data added after the program, such as the day's log. */
  readonly data?: string;
  readonly inputs?: Partial<MachineInputs>;
  /** A function's label: the run starts there, with R15 at a `stop` the test adds. */
  readonly call?: string;
  /** Registers set before a call: a number, or a label's address. */
  readonly registers?: Readonly<Record<number, string>>;
  readonly limit?: number;
}

/** The label the test's own `stop` carries, where a called function returns to. */
export const RETURN_LABEL = "test_return";

/** The words the registers a function must keep start with when a test calls it. */
export const KEPT_START: Readonly<Record<number, bigint>> = {
  10: 0x1010n,
  11: 0x1111n,
  12: 0x1212n,
  13: 0x1313n,
};
export const STACK_START = 0x7c0n;

export interface ScenarioRun {
  readonly program?: Program;
  readonly problems: readonly AssemblyProblem[];
  readonly state?: DebugState;
}

/** The program and the scenario's data as one text. */
export function withData(source: string, scenario: ProgramScenario): string {
  const parts = [source.replace(/\s+$/, "")];
  if (scenario.data) parts.push(scenario.data);
  if (scenario.call) parts.push(`${RETURN_LABEL}: stop`);
  return parts.join("\n");
}

/** Assembles the program with the scenario's data and runs it to its end. */
export function runScenario(source: string, scenario: ProgramScenario = {}): ScenarioRun {
  const { program, problems } = assembleChecked(withData(source, scenario));
  if (!program) return { problems };
  const inputs = { ...QUIET_INPUTS, ...(scenario.inputs ?? {}) };
  let start: DebugState;
  if (scenario.call !== undefined) {
    const at = program.labels[scenario.call];
    if (at === undefined)
      return {
        problems: [
          {
            line: 0,
            code: "unknownName",
            values: { name: scenario.call },
            message: `the program has no ${scenario.call}`,
          },
        ],
      };
    const regs: Record<number, bigint> = { ...KEPT_START, 14: STACK_START };
    regs[15] = BigInt(program.labels[RETURN_LABEL] ?? 0);
    for (const [k, v] of Object.entries(scenario.registers ?? {}))
      regs[Number(k)] = BigInt.asUintN(64, BigInt(program.labels[v] ?? v));
    start = debugStartAt(program.rom, at, regs);
  } else start = debugStart(program.rom);
  const state = debugFinish(start, inputs, undefined, scenario.limit ?? RUN_LIMIT);
  return { program, problems, state };
}

const signedText = (v: bigint | undefined) =>
  v === undefined ? "X" : BigInt.asIntN(64, v).toString();
const hex3 = (v: bigint) => v.toString(16).toUpperCase().padStart(3, "0");

/** How a run ended, as a short key and the values a sentence names. */
export function endOf(stop: DebugStop | undefined): {
  key: string;
  values: Record<string, string>;
} {
  if (!stop) return { key: "running", values: {} };
  if (stop.kind === "cutOff") return { key: "cutOff", values: { n: String(stop.ran) } };
  if (stop.kind === "unknown")
    return { key: `unknown-${stop.use}`, values: { reg: `R${stop.reg}`, address: hex3(stop.pc) } };
  const r = stop.reason;
  if (r.kind === "stop") return { key: "stop", values: { address: hex3(stop.pc) } };
  if (r.kind === "later") return { key: "later", values: { address: hex3(stop.pc) } };
  return {
    key: `cause${r.cause.toString(16).toUpperCase()}`,
    values: { address: hex3(stop.pc), cause: r.cause.toString(16).toUpperCase() },
  };
}

/**
 * One case's result: whether every expectation held, and what the program left for each thing the
 * case checks, by the expectation's key. `end` is how the run ended; `problems` are the
 * assembler's refusals, when it did not run.
 */
export interface ProgramCaseResult {
  readonly pass: boolean;
  readonly problems: readonly AssemblyProblem[];
  readonly actual: Readonly<Record<string, string>>;
  /** The keys whose expectation did not hold, in the case's order. */
  readonly wrong: readonly string[];
  readonly end?: { readonly key: string; readonly values: Readonly<Record<string, string>> };
}

/** The scenario a case's `given` describes. */
export function scenarioOf(given: Readonly<Record<string, string | number>>): ProgramScenario {
  const inputs: Partial<{ -readonly [K in keyof MachineInputs]: MachineInputs[K] }> = {};
  if (given.sensorA !== undefined) inputs.sensorA = BigInt(given.sensorA);
  if (given.sensorB !== undefined) inputs.sensorB = BigInt(given.sensorB);
  if (given.door !== undefined) inputs.door = Number(given.door) as 0 | 1;
  if (given.warm !== undefined) inputs.warm = Number(given.warm) as 0 | 1;
  const registers: Record<number, string> = {};
  for (const [k, v] of Object.entries(given)) {
    const m = /^R(\d{1,2})$/.exec(k);
    if (m) registers[Number(m[1])] = String(v);
  }
  return {
    ...(given.data !== undefined ? { data: String(given.data) } : {}),
    inputs,
    ...(given.call !== undefined ? { call: String(given.call) } : {}),
    registers,
    ...(given.limit !== undefined ? { limit: Number(given.limit) } : {}),
  };
}

/** What the program left for one expectation's key. */
function leftFor(key: string, run: ScenarioRun): string {
  const s = run.state;
  if (!s) return "";
  const cpu = s.cpu;
  if (key === "display") return signedText(cpu.display);
  if (key === "lamps") return String(cpu.lamps);
  const reg = /^R(\d{1,2})$/.exec(key);
  if (reg) return signedText(cpu.regs[Number(reg[1])]);
  const word = /^word:([0-9A-Fa-f]+)$/.exec(key);
  if (word) return signedText(memoryWord(cpu, parseInt(word[1] as string, 16)));
  if (key === "end") return endOf(s.stopped).key;
  if (key === "shown") return s.shown.map((v) => signedText(v)).join(", ");
  if (key === "stackWords")
    return s.deepest === undefined || s.deepest > STACK_START
      ? "0"
      : String((STACK_START - s.deepest) / 8n);
  if (key === "kept") {
    const changed = [10, 11, 12, 13]
      .filter((k) => cpu.regs[k] !== KEPT_START[k])
      .map((k) => `R${k}`);
    if (cpu.regs[14] !== STACK_START) changed.push("R14");
    return changed.join(", ");
  }
  if (key === "calls") return String(s.returns);
  if (key === "returned") {
    const back = run.program?.labels[RETURN_LABEL];
    return s.stopped?.kind === "machine" &&
      s.stopped.reason.kind === "stop" &&
      back !== undefined &&
      s.stopped.pc === BigInt(back)
      ? "yes"
      : "no";
  }
  return "";
}

/** Whether what the program left meets the expectation. */
function meets(key: string, left: string, expected: string): boolean {
  if (key === "stackWords") return Number(left) >= Number(expected);
  if (key === "calls") return Number(left) >= Number(expected);
  return left === expected;
}

/** Grades one case of a program challenge. */
export function gradeProgramCase(
  source: string,
  given: Readonly<Record<string, string | number>>,
  expect: Readonly<Record<string, string | number>>,
): ProgramCaseResult {
  const run = runScenario(source, scenarioOf(given));
  if (!run.state) return { pass: false, problems: run.problems, actual: {}, wrong: [] };
  const actual: Record<string, string> = {};
  const wrong: string[] = [];
  for (const [key, value] of Object.entries(expect)) {
    const left = leftFor(key, run);
    actual[key] = left;
    if (!meets(key, left, String(value))) wrong.push(key);
  }
  return {
    pass: wrong.length === 0,
    problems: [],
    actual,
    wrong,
    end: endOf(run.state.stopped),
  };
}
