// Copyright © 2026 Christopher Snow

// Module 0: the machine the course builds, met finished, before the learner builds any of it.
// Module 8's single-cycle machine (`datapath-full`) runs a program of the shop's own, one line a
// press. This file reads it for a learner who has no terms yet:
//
// - each line of a program as plain words, generated from the instruction's own fields, as a key
//   the view's strings turn into a sentence and the values that fill it;
// - the line the machine runs next, counted from 1, where the machine counts in addresses;
// - what one line or a whole run does, read off a copy of the simulator, for a prediction;
// - the graders of the module's challenges, each of which runs the simulator.
//
// Every value is read off the simulator's nets, as in every figure of the course.

import type { Simulator, Snapshot, Word } from "@dd/sim";

import { assemble } from "./assemble";
import { datapathCircuit } from "./datapath";
import { buildDatapath, startDatapath, wordOf, type BuiltDatapath } from "./datapath-figure";
import { datapathState, registersOf, type DatapathState } from "./datapath-run";
import { applyFaults, stuckAt } from "./faults";
import { DEVICES, fieldsOf } from "./machine";
import type { AnswerProblem, AnswerResult } from "./graders";

/** The machine Module 0 shows: Module 8's, finished, one line of the program an edge. */
export const MEET_LIBRARY = "datapath-full";

/** A line of the program, counted from 1, from the address the machine keeps it at. */
export const lineOfAddress = (address: number | bigint): number => Number(address) / 4 + 1;

/**
 * A line of the program in plain words: which sentence (`key`) and what fills it. The view's
 * strings hold one sentence per key; `other` is a line Module 0's sentences do not cover, which
 * the view shows as it is written.
 */
export interface PlainLine {
  readonly key:
    | "copy"
    | "set"
    | "add"
    | "subtract"
    | "read"
    | "show"
    | "setLamps"
    | "goto"
    | "nothing"
    | "ifEqual"
    | "ifDiffer"
    | "ifLess"
    | "ifNotLess"
    | "stop"
    | "other";
  readonly values: Readonly<Record<string, string>>;
}

/** The devices a line may read, by address, as the strings name them. */
const READABLE: Readonly<Record<number, string>> = {
  [DEVICES.sensorA]: "sensorA",
  [DEVICES.sensorB]: "sensorB",
  [DEVICES.signals]: "signals",
  [DEVICES.display]: "display",
  [DEVICES.lamps]: "lamps",
  [DEVICES.timer]: "timer",
};

const r = (n: number) => `R${n}`;

/**
 * The plain words for an instruction at an address: generated from its fields, never from the
 * text it was written as. Kinds and jobs Module 0's sentences leave out are `other`.
 */
export function plainLine(instruction: number, address: number): PlainLine {
  const f = fieldsOf(instruction);
  const other: PlainLine = { key: "other", values: {} };
  const line = (n: number) => String(n);
  switch (f.k) {
    case 1:
    case 2: {
      // The second number: register B for a register job, the constant for a constant job.
      const b = f.k === 1 ? r(f.b) : String(f.c);
      if (f.j === 2) return { key: "add", values: { y: r(f.y), a: r(f.a), b } };
      if (f.j === 3) return { key: "subtract", values: { y: r(f.y), a: r(f.a), b } };
      if (f.j === 5)
        return f.k === 1
          ? { key: "copy", values: { y: r(f.y), b } }
          : { key: "set", values: { y: r(f.y), n: b } };
      if (f.j === 6) return { key: "add", values: { y: r(f.y), a: r(f.a), b: "1" } };
      if (f.j === 7) return { key: "subtract", values: { y: r(f.y), a: r(f.a), b: "1" } };
      return other;
    }
    case 3: {
      // A word from a device, at an address given by the constant alone.
      const device = f.j === 8 ? READABLE[f.raw] : undefined;
      return device ? { key: "read", values: { y: r(f.y), device } } : other;
    }
    case 4: {
      if (f.j !== 8) return other;
      if (f.raw === DEVICES.display) return { key: "show", values: { b: r(f.b) } };
      if (f.raw === DEVICES.lamps) return { key: "setLamps", values: { b: r(f.b) } };
      return other;
    }
    case 5: {
      const to = line(lineOfAddress(address + 4 * f.c));
      const pair = { a: r(f.a), b: r(f.b), line: to };
      if (f.j === 0) return { key: "goto", values: { line: to } };
      if (f.j === 1) return { key: "nothing", values: {} };
      if (f.j === 2) return { key: "ifEqual", values: pair };
      if (f.j === 3) return { key: "ifDiffer", values: pair };
      if (f.j === 6) return { key: "ifLess", values: pair };
      if (f.j === 7) return { key: "ifNotLess", values: pair };
      return other;
    }
    case 8:
      return f.j === 4 ? { key: "stop", values: {} } : other;
    default:
      return other;
  }
}

/**
 * Module 0's programs, by name. A lesson names its program rather than writing it out: its props
 * are held to the term gate, and the program's text says `word` and `signed`, which the learner
 * never sees and which later lessons ration.
 *
 * `gap`: how much warmer room A is than room B, on the office display, in tenths of a degree; and
 * the CLASH lamp when room A is 10.0 degrees or more warmer. Line 6 goes to line 9 (address 020)
 * when the gap is under 100. It checks one way only. `gap-limit` leaves line 5's number to the
 * learner, as `{limit}`.
 */
export const MEET_PROGRAMS: Readonly<Record<string, string>> = {
  gap: `R1 <= word[sensorA]
R2 <= word[sensorB]
R3 <= R1 - R2
word[display] <= R3
R4 <= 100
if R3 < R4 signed goto 0x020
R5 <= 4
word[lamps] <= R5
stop`,
  "gap-limit": `R1 <= word[sensorA]
R2 <= word[sensorB]
R3 <= R1 - R2
word[display] <= R3
R4 <= {limit}
if R3 < R4 signed goto 0x020
R5 <= 4
word[lamps] <= R5
stop`,
};

/** A program by its name in `MEET_PROGRAMS`, or the text itself. */
export const programText = (program: string): string => MEET_PROGRAMS[program] ?? program;

/** One line of a program as a Module 0 figure lists it. */
export interface MeetLine {
  /** Counted from 1. */
  readonly line: number;
  readonly address: number;
  /** The number the machine keeps the line as, read as a whole number. */
  readonly stored: number;
  /** The line as the program is written, for a line the plain words leave out. */
  readonly text: string;
  readonly plain: PlainLine;
}

/** A program's lines, each with its plain words and the number it is kept as. */
export function meetLines(source: string): MeetLine[] {
  return assemble(programText(source)).lines.flatMap((l) =>
    l.instruction === undefined
      ? []
      : [
          {
            line: lineOfAddress(l.address),
            address: l.address,
            stored: l.instruction,
            text: l.text,
            plain: plainLine(l.instruction, l.address),
          },
        ],
  );
}

/** What a Module 0 figure starts with: the program, the shop's inputs, the lines run first. */
export interface MeetSetup {
  readonly program: string;
  /** The shop's inputs by name: SENSORA and SENSORB in tenths of a degree, DOOR, WARM. */
  readonly inputs?: Readonly<Record<string, string | number>>;
  /** Lines run before the figure first shows. */
  readonly lines?: number;
  /** A net held at a value, by its full name: a wire stuck deep inside the machine. */
  readonly stuck?: { readonly net: string; readonly value: 0 | 1 };
}

/** The machine for a setup, with a stuck wire if the setup names one. */
export function meetMachine(setup: Pick<MeetSetup, "program" | "stuck">): BuiltDatapath {
  const healthy = buildDatapath({ libraryId: MEET_LIBRARY, program: programText(setup.program) });
  if (!setup.stuck) return healthy;
  return {
    ...healthy,
    circuit: applyFaults(healthy.circuit, [stuckAt(setup.stuck.net, setup.stuck.value)]),
  };
}

/** A simulator for a setup: reset, the inputs set, and the first lines run. */
export function meetStart(built: BuiltDatapath, setup: MeetSetup): Simulator {
  return startDatapath(built, { inputs: setup.inputs ?? {}, edges: setup.lines ?? 0 });
}

/** The line the machine runs next, from its state; undefined while the place is unknown. */
export function nextLine(state: DatapathState): number | undefined {
  return state.pc === undefined ? undefined : lineOfAddress(state.pc);
}

/** Sets one of the shop's inputs and lets the machine settle. */
export function setShopInput(sim: Simulator, name: string, value: string | number): void {
  const input = sim.circuit.inputs.find((i) => i.name === name);
  if (!input) throw new RangeError(`no input ${name}`);
  sim.setInput(name, wordOf(String(value), sim.circuit.nets[input.net]?.width ?? 1));
  sim.settle();
}

const signed64 = (v: bigint) => (v >= 1n << 63n ? v - (1n << 64n) : v);

/** A word read signed, as the figure writes a number; undefined while any digit is unknown. */
export const numberOf = (v: bigint | undefined): string | undefined =>
  v === undefined ? undefined : signed64(v).toString();

/** The lamps by name, bit 0 first. */
export const LAMP_NAMES = ["ALARM", "NIGHT", "CLASH"] as const;

/** Runs the machine until it stops, at most `limit` lines; the lines it ran, in order. */
export function runToStop(sim: Simulator, limit = 500): { lines: number[]; stopped: boolean } {
  const lines: number[] = [];
  for (let k = 0; k < limit; k++) {
    const before = datapathState(sim.circuit, sim.snapshotValues());
    const at = nextLine(before);
    if (at !== undefined) lines.push(at);
    sim.clockCycle("CLK");
    if (before.halt === 1) return { lines, stopped: true };
  }
  return { lines, stopped: false };
}

/** What a Module 0 prediction asks. */
export type MeetQuestion = "lines" | "display" | "lamps" | "changed" | "next" | "value" | "ones";

/**
 * The answer to a prediction, read off a copy of the simulator: the lines a run to the stop runs
 * (`1 2 3`); the display or the lit lamps when it stops; the numbers the next line changes, the
 * line after it, or one number after it; or, for the part that adds, the worths of the 1s on its
 * output now (`64 + 2`). The simulator is left as it was.
 */
export function meetAnswer(sim: Simulator, ask: MeetQuestion, register = 0): string {
  const circuit = sim.circuit;
  if (ask === "ones") {
    const result = sim.read("RESULT");
    const worths: string[] = [];
    for (let k = 63; k >= 0; k--)
      if ((result.value >> BigInt(k)) & 1n) worths.push((1n << BigInt(k)).toString());
    return worths.length ? worths.join(" + ") : "0";
  }
  const saved = sim.snapshot();
  const before = datapathState(circuit, sim.snapshotValues());
  let answer: string;
  if (ask === "lines" || ask === "display" || ask === "lamps") {
    const run = runToStop(sim);
    const after = datapathState(circuit, sim.snapshotValues());
    if (ask === "lines") answer = run.lines.join(" ");
    else if (ask === "display") answer = numberOf(after.display) ?? "X";
    else answer = litLamps(after.lamps);
  } else {
    sim.clockCycle("CLK");
    const values = sim.snapshotValues();
    const after = registersOf(circuit, values);
    if (ask === "changed") {
      const written = after.flatMap((v, k) => (v !== before.regs[k] ? [r(k)] : []));
      answer = written.length ? written.join(", ") : "none";
    } else if (ask === "next") {
      answer = String(nextLine(datapathState(circuit, values)) ?? "X");
    } else {
      answer = numberOf(after[register]) ?? "X";
    }
  }
  sim.restore(saved);
  sim.settle();
  return answer;
}

/** The lit lamps by name, `CLASH`, or `none`. */
export function litLamps(lamps: number | undefined): string {
  if (lamps === undefined) return "X";
  const lit = LAMP_NAMES.filter((_, k) => (lamps >> k) & 1);
  return lit.length ? lit.join(", ") : "none";
}

// ---- The ladder ----------------------------------------------------------------------------

/** A net's value, read off the simulator by its full name. */
export function meetNet(sim: Simulator, name: string): Word | undefined {
  const net = sim.circuit.nets.find((n) => n.name === name);
  return net === undefined ? undefined : sim.snapshotValues()[net.id];
}

/**
 * The net that carries the output of the slice for bit `k` of the part that adds: the slices sit
 * four to a group (`q`), four groups to a larger one (`g`), four of those in the part.
 */
export function sliceNet(k: number): string {
  const g = Math.floor(k / 16);
  const q = Math.floor((k % 16) / 4);
  return `alu/g${g}/q${q}/Y${k % 4}`;
}

/** The 1s and 0s the lowest `count` slices give now, the highest first. */
export function sliceDigits(sim: Simulator, count: number): string {
  let out = "";
  for (let k = count - 1; k >= 0; k--) {
    const w = meetNet(sim, sliceNet(k));
    out += w === undefined || w.known !== 1n ? "X" : String(w.value);
  }
  return out;
}

/**
 * The places Module 0's figures open the machine at, by a plain key, so a lesson's props carry no
 * part's name (its props are held to the term gate, and the parts' names are the circuit's). Each
 * gives the block opened (`scope`, absent for the line itself), the net whose value the level
 * shows and how, the parts the drawing opens on (full paths from the top, as `focus` takes them),
 * and the block to open next, marked.
 */
export interface MeetPlace {
  readonly scope?: string;
  readonly net: string;
  readonly show: "number" | "digits" | "level";
  readonly focus?: readonly string[];
  readonly highlight?: readonly string[];
}

/** The slice the ladder follows: the one worth 2, bit 1 of the part that adds. */
const SLICE = "alu/g0/q0/bit1";
/** The wire at the ladder's foot: the sum out of that slice's adding part. */
export const MEET_WIRE = `${SLICE}/SUM`;

export const MEET_PLACES: Readonly<Record<string, MeetPlace>> = {
  line: { net: "RESULT", show: "number" },
  parts: { scope: "", net: "RESULT", show: "number", focus: ["alu"], highlight: ["alu"] },
  adder: { scope: "alu", net: "RESULT", show: "digits", focus: ["alu/g0"], highlight: ["alu/g0"] },
  four: {
    scope: "alu/g0/q0",
    net: "alu/g0/Y0",
    show: "digits",
    focus: [SLICE],
    highlight: [SLICE],
  },
  slice: {
    scope: SLICE,
    net: "alu/g0/q0/Y1",
    show: "digits",
    focus: [`${SLICE}/fa`],
    highlight: [`${SLICE}/fa`],
  },
  smallest: { scope: `${SLICE}/fa/ha2`, net: MEET_WIRE, show: "digits" },
  // The slice's adding part, where the wire leaves it as SUM: a small drawing, clear as first
  // drawn, where the slice whole is too busy to open a page on.
  wire: { scope: `${SLICE}/fa`, net: MEET_WIRE, show: "level", focus: [MEET_WIRE] },
};

/** The wires a Module 0 figure may hold stuck, by a plain key. */
export const MEET_STUCK: Readonly<Record<string, { net: string; value: 0 | 1 }>> = {
  "sum-low": { net: MEET_WIRE, value: 0 },
};

// ---- The graders -----------------------------------------------------------------------------

/** A program in a test case, with `{field}` replaced by the learner's answer to that field. */
function filled(text: string, answers: Readonly<Record<string, string>>): string {
  return text.replace(/\{(\w+)\}/g, (_, id: string) => (answers[id] ?? "").trim());
}

const SHOP_INPUTS = ["SENSORA", "SENSORB", "DOOR", "WARM"] as const;

/** The shop's inputs a test case gives, by the names the figure uses. */
function inputsOf(given: Readonly<Record<string, string | number>>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const n of SHOP_INPUTS) if (given[n] !== undefined) out[n] = String(given[n]);
  return out;
}

/** The readings a failure shows, under the names the book's terms give them. */
function shownInputs(given: Readonly<Record<string, string | number>>): Record<string, string> {
  const out: Record<string, string> = {};
  if (given["SENSORA"] !== undefined) out["roomA"] = String(given["SENSORA"]);
  if (given["SENSORB"] !== undefined) out["roomB"] = String(given["SENSORB"]);
  return out;
}

const WHOLE = /^-?\d+$/;
const clean = (s: string | undefined) => (s ?? "").replace(/[\s,]/g, "").replace(/−/g, "-");

function missingOf(answers: Readonly<Record<string, string>>, ids: readonly string[]) {
  const gone = ids.filter((id) => (answers[id] ?? "").trim() === "");
  return gone.length ? { missing: gone } : undefined;
}

/** The fields a case's text names as `{field}`. */
const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1] as string);

/**
 * The graders run the machine many times: every case of every challenge, and again each time a
 * page checks saved work. A machine is built once per program, unplaced (a grader draws nothing),
 * and kept with its state just after the reset; a case starts from that state with its inputs
 * set. A case's outcome is kept too, so cases that share a setup run it once.
 */
const MACHINES = new Map<string, { sim: Simulator; reset: Snapshot }>();
const OUTCOMES = new Map<string, unknown>();
const KEEP = 16;

function remember<T>(cache: Map<string, T>, key: string, make: () => T): T {
  const had = cache.get(key);
  if (had !== undefined) return had;
  const made = make();
  if (cache.size >= KEEP) cache.delete(cache.keys().next().value as string);
  cache.set(key, made);
  return made;
}

/** A simulator for a grader: the program's machine after the reset, inputs set, lines run. */
function gradingSim(
  program: string,
  inputs: Readonly<Record<string, string>>,
  lines = 0,
): Simulator {
  const { sim, reset } = remember(MACHINES, program, () => {
    const circuit = datapathCircuit({ stage: "full", rom: assemble(program).rom });
    const s = startDatapath({ circuit, stage: "full" }, {});
    return { sim: s, reset: s.snapshot() };
  });
  sim.restore(reset);
  for (const [name, value] of Object.entries(inputs)) setShopInput(sim, name, value);
  sim.settle();
  for (let k = 0; k < lines; k++) sim.clockCycle("CLK");
  return sim;
}

/** A case's outcome, worked out once per program, inputs and lines. */
function outcome<T>(
  what: string,
  program: string,
  inputs: Readonly<Record<string, string>>,
  lines: number,
  work: (sim: Simulator) => T,
): T {
  const key = JSON.stringify([what, program, inputs, lines]);
  return remember(OUTCOMES, key, () => work(gradingSim(program, inputs, lines))) as T;
}

/**
 * Module 0: a program run to its stop, graded on what the shop sees. A case gives the `program`,
 * which may name a field as `{limit}` for the learner's number, and the shop's inputs; it expects
 * the `display` (signed) and the lamp `lamp` names as `lit` or `dark`. An expected value written
 * `{field}` is the learner's answer to that field: the learner said what the shop would see.
 */
export function machineRun(
  answers: Readonly<Record<string, string>>,
  given: Readonly<Record<string, string | number>>,
  expect: Readonly<Record<string, string | number>>,
): AnswerResult | AnswerProblem {
  const program = programText(String(given["program"] ?? ""));
  const named = [
    ...placeholders(program),
    ...Object.values(expect).flatMap((v) => placeholders(String(v))),
  ];
  const gone = missingOf(answers, named);
  if (gone) return gone;
  for (const id of placeholders(program)) {
    const v = clean(answers[id]);
    if (!WHOLE.test(v) || Number(v) < -2048 || Number(v) > 2047) return { invalid: id };
  }
  const state = outcome("run", filled(program, answers), inputsOf(given), 0, (sim) => {
    runToStop(sim);
    const after = datapathState(sim.circuit, sim.snapshotValues());
    return { display: after.display, lamps: after.lamps };
  });
  const lampName = String(given["lamp"] ?? "CLASH");
  const actual: Record<string, string> = {};
  const expected: Record<string, string> = {};
  let pass = true;
  for (const [key, want] of Object.entries(expect)) {
    const said = filled(String(want), answers);
    const got =
      key === "display"
        ? (numberOf(state.display) ?? "X")
        : state.lamps === undefined
          ? "X"
          : (state.lamps >> LAMP_NAMES.indexOf(lampName as (typeof LAMP_NAMES)[number])) & 1
            ? "lit"
            : "dark";
    const wanted = key === "display" ? clean(said) : said;
    actual[key] = got;
    expected[key] = wanted;
    if (key === "display" && !WHOLE.test(wanted))
      return { invalid: placeholders(String(want))[0] ?? key };
    if (got !== wanted) pass = false;
  }
  return { pass, inputs: shownInputs(given), actual, expected };
}

/**
 * Module 0's capstone: one line traced. A case gives the program, the shop's inputs and how many
 * `lines` run first, and `check`, one of the four answers: `changed` (a register's name, or
 * `none`), `value` (that register's number after the line), `next` (the line after it) and `part`
 * (`memory` when the number comes from memory, `adder` when the part that adds works it out). The
 * expected answer is read off a copy of the simulator after a real edge, never off the reference.
 */
export function machineStep(
  answers: Readonly<Record<string, string>>,
  given: Readonly<Record<string, string | number>>,
): AnswerResult | AnswerProblem {
  const check = String(given["check"]);
  const gone = missingOf(answers, [check]);
  if (gone) return gone;
  const answer = clean(answers[check]);
  if ((check === "value" || check === "next") && !WHOLE.test(answer)) return { invalid: check };
  const program = programText(String(given["program"] ?? ""));
  const traced = outcome("step", program, inputsOf(given), Number(given["lines"] ?? 0), (sim) => {
    const changed = meetAnswer(sim, "changed");
    const register = Number(/^R(\d+)/.exec(changed)?.[1] ?? 0);
    return {
      changed,
      value: meetAnswer(sim, "value", register),
      next: meetAnswer(sim, "next"),
      part: sim.read("LOAD").value === 1n ? "memory" : "adder",
    };
  });
  const expected = traced[check as keyof typeof traced] ?? "";
  return {
    pass: answer === expected,
    inputs: shownInputs(given),
    actual: { [check]: answer },
    expected: { [check]: expected },
  };
}

/**
 * Module 0: the 1s and 0s on the lowest slices of the part that adds, typed as text (`0100 0010`,
 * spaces allowed). A case gives the program, the shop's inputs, how many `lines` run first and
 * how many `slices` to read; the expected digits are the slices' own outputs, read off the
 * simulator at that moment.
 */
export function machineSlices(
  answers: Readonly<Record<string, string>>,
  given: Readonly<Record<string, string | number>>,
): AnswerResult | AnswerProblem {
  const field = String(given["field"] ?? "slices");
  const gone = missingOf(answers, [field]);
  if (gone) return gone;
  const count = Number(given["slices"] ?? 8);
  const said = (answers[field] ?? "").replace(/\s/g, "");
  if (!new RegExp(`^[01]{${count}}$`).test(said)) return { invalid: field };
  const program = programText(String(given["program"] ?? ""));
  const digits = outcome("slices", program, inputsOf(given), Number(given["lines"] ?? 0), (sim) =>
    sliceDigits(sim, count),
  );
  return {
    pass: said === digits,
    inputs: shownInputs(given),
    actual: { [field]: said },
    expected: { [field]: digits },
  };
}
