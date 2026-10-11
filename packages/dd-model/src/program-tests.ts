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
  type InputPlan,
} from "./debugger";
import { MODULE_12, QUIET_INPUTS, type MachineInputs, type MachineOptions } from "./machine";

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
  /** Module 12: the machine with traps (`MODULE_12`), and a door that opens before an instruction. */
  readonly traps?: boolean;
  readonly doorOpensAt?: number;
  readonly doorClosesAt?: number;
}

/** The label the test's own `stop` carries, where a called function returns to. */
export const RETURN_LABEL = "test_return";

/**
 * A word of 0s the tests put straight after the program when they call a function, before their
 * own `stop`: a function that runs off its end reaches it and halts, so it never counts as having
 * returned through R15.
 */
export const GUARD_LABEL = "test_fell";

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
  if (scenario.call) parts.push(`${GUARD_LABEL}: word 0`, `${RETURN_LABEL}: stop`);
  if (scenario.data) parts.push(scenario.data);
  return parts.join("\n");
}

/** The names a text gives its lines: each line's leading `name:`, outside comments. */
function namesIn(text: string): Set<string> {
  const names = new Set<string>();
  for (const line of text.split("\n")) {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*):/.exec(line.replace(/\/\/.*$/, ""));
    if (m) names.add(m[1] as string);
  }
  return names;
}

/**
 * The names the learner's text gives its lines that a test's own lines also use. The two are
 * assembled as one text, so such a name would be refused as given twice, at a line the learner
 * never wrote.
 */
export function sharedNames(
  source: string,
  given: Readonly<Record<string, string | number>>,
): string[] {
  const scenario = scenarioOf(given);
  const theirs = namesIn(withData("", scenario));
  return [...namesIn(source)].filter((n) => theirs.has(n));
}

/**
 * Where a test that calls a function starts the run, and the registers it sets first: R10 to R13
 * at their own words, R14 at the top of the stack, R15 at the tests' own `stop`, and the
 * arguments the scenario gives (a number, or a name's address). Undefined for a whole run, or a
 * name the program lacks.
 */
export function callStart(
  program: Program,
  scenario: ProgramScenario,
): { readonly at: number; readonly registers: Readonly<Record<number, bigint>> } | undefined {
  if (scenario.call === undefined) return undefined;
  const at = program.labels[scenario.call];
  if (at === undefined) return undefined;
  const registers: Record<number, bigint> = { ...KEPT_START, 14: STACK_START };
  registers[15] = BigInt(program.labels[RETURN_LABEL] ?? 0);
  for (const [k, v] of Object.entries(scenario.registers ?? {}))
    registers[Number(k)] = BigInt.asUintN(64, BigInt(program.labels[v] ?? v));
  return { at, registers };
}

/** Assembles the program with the scenario's data and runs it to its end. */
export function runScenario(source: string, scenario: ProgramScenario = {}): ScenarioRun {
  const { program, problems } = assembleChecked(withData(source, scenario));
  if (!program) return { problems };
  const inputs: InputPlan = {
    ...QUIET_INPUTS,
    ...(scenario.inputs ?? {}),
    ...(scenario.doorOpensAt !== undefined ? { doorOpensAt: scenario.doorOpensAt } : {}),
    ...(scenario.doorClosesAt !== undefined ? { doorClosesAt: scenario.doorClosesAt } : {}),
  };
  const options: MachineOptions | undefined = scenario.traps ? MODULE_12 : undefined;
  let start: DebugState;
  if (scenario.call !== undefined) {
    const at = program.labels[scenario.call];
    if (at === undefined)
      return {
        problems: [
          {
            line: 0,
            code: "noFunction",
            values: { name: scenario.call },
            message: `the program has no ${scenario.call}`,
          },
        ],
      };
    const call = callStart(program, scenario);
    start = debugStartAt(program.rom, call?.at ?? at, call?.registers ?? {});
  } else start = debugStart(program.rom);
  const state = debugFinish(start, inputs, options, scenario.limit ?? RUN_LIMIT);
  return { program, problems, state };
}

const signedText = (v: bigint | undefined) =>
  v === undefined ? "X" : BigInt.asIntN(64, v).toString();
const hex3 = (v: bigint) => v.toString(16).toUpperCase().padStart(3, "0");
/** A control register's word as the pages write it: two digits for a cause or a mode. */
const hex2 = (v: bigint) => v.toString(16).toUpperCase().padStart(2, "0");

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
  /** Module 12: the first fault at one of the learner's own lines, before the tests' lines. */
  readonly ownFault?: { readonly address: string; readonly cause: string };
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
    ...(given.traps !== undefined ? { traps: given.traps === "yes" || given.traps === 1 } : {}),
    ...(given.doorOpensAt !== undefined ? { doorOpensAt: Number(given.doorOpensAt) } : {}),
    ...(given.doorClosesAt !== undefined ? { doorClosesAt: Number(given.doorClosesAt) } : {}),
  };
}

/** The causes a failure lists at most, from the first. */
const CAUSES_SHOWN = 8;

/** Two bits, bit 1 then bit 0: C0, C1 and the waiting events as the pages write them. */
const bits2 = (v: bigint) => (v & 3n).toString(2).padStart(2, "0");

/** What the program left for one expectation's key. */
export function leftFor(key: string, run: ScenarioRun): string {
  const s = run.state;
  if (!s) return "";
  const cpu = s.cpu;
  if (key === "display") return signedText(cpu.display);
  if (key === "lamps") return String(cpu.lamps);
  const reg = /^R(\d{1,2})$/.exec(key);
  if (reg) return signedText(cpu.regs[Number(reg[1])]);
  // Module 12: a register as the program left it at the run's last trap, before a handler that
  // ends the run writes over it.
  const atTrap = /^R(\d{1,2})@trap$/.exec(key);
  if (atTrap) {
    const last = s.traps.at(-1);
    return last ? signedText(last.regs[Number(atTrap[1])]) : "";
  }
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
  // Module 12: the control registers, the mode, and the traps that went to the handler.
  const creg = /^C([0-4])$/.exec(key);
  if (creg) {
    const n = Number(creg[1]);
    const v = cpu.control[n] ?? 0n;
    // C2 and C4 hold addresses, written in three hexadecimal digits; C3 a cause, in two; C0 and
    // C1 their two bits, bit 1 then bit 0, as the pages write them.
    if (n === 2 || n === 4) return hex3(v);
    return n === 3 ? hex2(v) : bits2(v);
  }
  // C2 by the name the tests' program gives its line, since the program's addresses move with the
  // learner's lines before it; its address where no name does.
  if (key === "C2at") {
    const v = Number(cpu.control[2] ?? 0n);
    const name = Object.entries(run.program?.labels ?? {}).find(([, a]) => a === v)?.[0];
    return name ?? hex3(BigInt(v));
  }
  if (key === "mode") return (cpu.control[0] & 1n) === 1n ? "system" : "user";
  if (key === "traps") return String(s.traps.length);
  if (key === "causes") {
    // A run that traps for ever lists its first causes, not thousands.
    const causes = s.traps.slice(0, CAUSES_SHOWN + 1).map((t) => hex2(BigInt(t.cause)));
    return causes.length > CAUSES_SHOWN
      ? `${causes.slice(0, CAUSES_SHOWN).join(", ")}, …`
      : causes.join(", ");
  }
  if (key === "waiting") return bits2(BigInt(cpu.waiting));
  // Where a run that ended at a `stop` stopped: the name the tests' program gives the line, or
  // "handler" for any line of the learner's own, before the tests' lines; else its address.
  if (key === "stopAt" || key === "stopIn") {
    if (s.stopped?.kind !== "machine" || s.stopped.reason.kind !== "stop") return "";
    const pc = Number(s.stopped.pc);
    const labels = run.program?.labels ?? {};
    // The tests' own lines start at `program`, or at the capstone's table, `programs`.
    const from = labels["program"] ?? labels["programs"];
    if (from !== undefined && pc < from) {
      if (key === "stopAt") return "handler";
      // 12.8 alone asks which part of the learner's text stopped: the start's lines are those
      // above the line named `handler`, which the task says to name so; "unnamed" where no line is.
      // A stop at or after `handler` is "handler" where the start has a stop of its own, which the
      // run did not reach, and "below" where it has none, so the start's stop is the one to move.
      const handler = labels["handler"];
      if (handler === undefined) return "unnamed";
      if (pc < handler) return "start";
      const startStops = (run.program?.lines ?? []).some(
        (l) => l.address < handler && /^(\w+:\s*)?stop\b/.test(l.text.trim()),
      );
      return startStops ? "handler" : "below";
    }
    const name = Object.entries(labels).find(([, a]) => a === pc)?.[0];
    return name ?? hex3(BigInt(pc));
  }
  if (key === "timer") return String(cpu.timer);
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
  const labels = run.program?.labels ?? {};
  const from = labels["program"] ?? labels["programs"];
  const own = run.state.traps.find(
    (t) => t.cause < 0x40 && t.cause !== 0x41 && from !== undefined && Number(t.at) < from,
  );
  return {
    pass: wrong.length === 0,
    problems: [],
    actual,
    wrong,
    end: endOfRun(run),
    ...(own ? { ownFault: { address: hex3(own.at), cause: hex2(BigInt(own.cause)) } } : {}),
  };
}

/**
 * How a scenario's run ended, in the learner's terms: the tests' own `stop` is `returned`, never
 * a stop of the program's, and the guard after a function is `fellOff`, never cause 21.
 */
export function endOfRun(run: ScenarioRun): {
  key: string;
  values: Record<string, string>;
} {
  const s = run.state;
  const end = endOf(s?.stopped);
  const at = (name: string) => run.program?.labels[name];
  if (s?.stopped?.kind === "machine") {
    const pc = Number(s.stopped.pc);
    if (end.key === "stop" && pc === at(RETURN_LABEL)) return { key: "returned", values: {} };
    const guard = at(GUARD_LABEL);
    if (guard !== undefined && pc >= guard && pc < guard + 8) return { key: "fellOff", values: {} };
  }
  return end;
}
