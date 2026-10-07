// Copyright © 2026 Christopher Snow

// The graders for challenges whose artifact is the learner's settings or answers.
//
// A grader takes the learner's answers (as typed), what a test case gives it, and what the case
// expects, and says what the answers produced and what was expected, as values. The words around
// those values are the book's (dd-views strings), so nothing here is a sentence. A grader that
// cannot run because an answer is missing or is not a number says which field, and the book
// turns that into a sentence.

import { bitsText, hexOf, parseBits, signedOf, unsignedOf, type Bit } from "./bits";
import { readBits, recording, RECORDING_IDS, volts, type RecordingId } from "./signals";
import { Simulator, formatWord, parseWord, word as wordOf } from "@dd/sim";

import { aluResult, hexWord, opBits } from "./alu";
import { applyFaults, stuckAt } from "./faults";
import { libraryCircuit } from "./library";
import { machineRun, machineSlices, machineStep } from "./meet";

export interface AnswerResult {
  readonly pass: boolean;
  readonly inputs: Readonly<Record<string, string>>;
  readonly actual: Readonly<Record<string, string>>;
  readonly expected: Readonly<Record<string, string>>;
  /**
   * Module 0: a sentence the book shows in place of the values, by its key in the book's strings,
   * with values to fill it, for a failure whose expected value would hand over the answer.
   */
  readonly detail?: {
    readonly key: string;
    /** The field whose answer `actual` is, so a choice is said by its label. */
    readonly field?: string;
    readonly values?: Readonly<Record<string, string>>;
  };
}

/** Why a case could not be graded: fields with nothing in them, or one that does not parse. */
export type AnswerProblem = { readonly missing: readonly string[] } | { readonly invalid: string };

export type AnswerGrader = (
  answers: Readonly<Record<string, string>>,
  given: Readonly<Record<string, string | number>>,
  expect: Readonly<Record<string, string | number>>,
) => AnswerResult | AnswerProblem;

/**
 * Stands for "what your bits read as" where a test compares an answer with the learner's own
 * bits: printing the value would hand over the answer. The book shows its own words instead.
 */
export const OF_YOUR_BITS = "\u0000of-your-bits";

export function isProblem(r: AnswerResult | AnswerProblem): r is AnswerProblem {
  return "missing" in r || "invalid" in r;
}

/** A number as a learner types it: spaces and thousands commas allowed, either minus sign. */
export function parseNumber(text: string | undefined): number | undefined {
  if (text === undefined) return undefined;
  const clean = text.replace(/[\s,]/g, "").replace(/−/g, "-");
  if (!/^-?\d+(\.\d+)?$/.test(clean)) return undefined;
  return Number(clean);
}

/** Hexadecimal as a learner types it: either case, spaces allowed, an optional 0x. */
export function parseHex(text: string | undefined): string | undefined {
  if (text === undefined) return undefined;
  const clean = text.replace(/\s/g, "").replace(/^0x/i, "").toUpperCase();
  return /^[0-9A-F]+$/.test(clean) ? clean : undefined;
}

function missing(answers: Readonly<Record<string, string>>, ids: readonly string[]) {
  const gone = ids.filter((id) => (answers[id] ?? "").trim() === "");
  return gone.length ? { missing: gone } : undefined;
}

/**
 * The threshold challenge. Answer `threshold` in volts. Each case gives a `recording` and
 * expects `wrong` (how many samples read wrong) or `margin` (the least gap, in hundredths of a
 * volt, between the threshold and the nearest sample on each side).
 */
function threshold(
  answers: Readonly<Record<string, string>>,
  given: Readonly<Record<string, string | number>>,
  expect: Readonly<Record<string, string | number>>,
): AnswerResult | AnswerProblem {
  const gone = missing(answers, ["threshold"]);
  if (gone) return gone;
  const v = parseNumber(answers["threshold"]);
  if (v === undefined) return { invalid: "threshold" };
  const t = Math.round(v * 100);
  const id = String(given["recording"]) as RecordingId;
  if (!RECORDING_IDS.includes(id)) throw new Error(`no recording ${id}`);
  const r = readBits(recording(id), t);
  const inputs = { threshold: volts(t) };
  if (expect["margin"] !== undefined) {
    const need = Number(expect["margin"]);
    const below = r.nearest0?.gap ?? Infinity;
    const above = r.nearest1?.gap ?? Infinity;
    return {
      pass: below >= need && above >= need,
      inputs,
      actual: { marginBelow: volts(below), marginAbove: volts(above) },
      expected: { marginBelow: `≥ ${volts(need)}`, marginAbove: `≥ ${volts(need)}` },
    };
  }
  const want = Number(expect["wrong"] ?? 0);
  const actual: Record<string, string> = { wrong: String(r.wrong.length) };
  if (r.wrong.length) actual["wrongSamples"] = r.wrong.map((i) => i + 1).join(", ");
  return {
    pass: r.wrong.length === want,
    inputs,
    actual,
    expected: { wrong: String(want) },
  };
}

/**
 * The word challenge. Answers `bits` (the row the learner set), `unsigned` and `hex` (what the
 * learner says that row reads as). A case gives `check`: `signed` compares the row's signed
 * reading with `expect.signed`; `unsigned` and `hex` compare the learner's answer with the row's
 * own reading, so an answer is right for the row the learner set.
 */
function word(
  answers: Readonly<Record<string, string>>,
  given: Readonly<Record<string, string | number>>,
  expect: Readonly<Record<string, string | number>>,
): AnswerResult | AnswerProblem {
  const check = String(given["check"]);
  const need = check === "signed" ? ["bits"] : ["bits", check];
  const gone = missing(answers, need);
  if (gone) return gone;
  let bits: Bit[];
  try {
    bits = parseBits(answers["bits"] ?? "");
  } catch {
    return { invalid: "bits" };
  }
  const inputs = { bits: bitsText(bits) };
  if (check === "signed") {
    const want = Number(expect["signed"]);
    return {
      pass: signedOf(bits) === want,
      inputs,
      actual: { signed: String(signedOf(bits)) },
      expected: { signed: String(want) },
    };
  }
  if (check === "unsigned") {
    const n = parseNumber(answers["unsigned"]);
    if (n === undefined) return { invalid: "unsigned" };
    return {
      pass: n === unsignedOf(bits),
      inputs,
      actual: { unsigned: String(n) },
      expected: { unsigned: OF_YOUR_BITS },
    };
  }
  const h = parseHex(answers["hex"]);
  if (h === undefined) return { invalid: "hex" };
  return {
    pass: h === hexOf(bits),
    inputs,
    actual: { hex: h },
    expected: { hex: OF_YOUR_BITS },
  };
}

/**
 * Module 6: stands for "the word the memory gives" where a test compares a typed word with what a
 * memory reads out: printing it would hand over the answer.
 */
export const OF_THE_MEMORY = "\u0000of-the-memory";

/**
 * Module 6, reading a memory. Each case names a `field`, a library `circuit` and the inputs to set
 * (every other input is 0); the simulator reads Q, and the learner's hexadecimal answer for the
 * field must be the same number. The memory, not the lesson, says what the answer is.
 */
function memoryRead(
  answers: Readonly<Record<string, string>>,
  given: Readonly<Record<string, string | number>>,
): AnswerResult | AnswerProblem {
  const field = String(given["field"]);
  const gone = missing(answers, [field]);
  if (gone) return gone;
  const h = parseHex(answers[field]);
  if (h === undefined) return { invalid: field };
  const circuit = libraryCircuit(String(given["circuit"]));
  const sim = new Simulator(circuit);
  for (const input of circuit.inputs) {
    const width = circuit.nets[input.net]?.width ?? 1;
    sim.setInput(input.net, parseWord(String(given[input.name] ?? 0), width));
  }
  sim.settle();
  const q = sim.read(String(given["output"] ?? "Q"));
  const known = q.known === (1n << BigInt(q.width)) - 1n;
  return {
    pass: known && BigInt(`0x${h}`) === q.value,
    inputs: {},
    actual: { [field]: h },
    expected: { [field]: OF_THE_MEMORY },
  };
}

// ---- Module 7 ------------------------------------------------------------------------------

/**
 * Stands for "anything other than this value" where a test passes only if a faulty circuit's
 * result differs from the right one. The book shows its own words around the value.
 */
export const OTHER_THAN = "\u0000other-than:";

/**
 * The fault-finding challenge. Answers `a` and `b`, two words in hexadecimal. A case gives a
 * library ALU (`libraryId`), a net to hold at a value (`net`, `value`) and a job (`job`, its code
 * 0 to 7); it passes when the ALU with that fault gives a different Y or COUT from the right
 * answer, worked out in bigints: the two words expose the fault.
 */
function exposes(
  answers: Readonly<Record<string, string>>,
  given: Readonly<Record<string, string | number>>,
): AnswerResult | AnswerProblem {
  const gone = missing(answers, ["a", "b"]);
  if (gone) return gone;
  const a = parseHex(answers["a"]);
  if (a === undefined) return { invalid: "a" };
  const b = parseHex(answers["b"]);
  if (b === undefined) return { invalid: "b" };
  const healthy = libraryCircuit(String(given["libraryId"]));
  const width = healthy.nets[healthy.inputs.find((i) => i.name === "A")?.net ?? 0]?.width ?? 16;
  const av = BigInt(`0x${a}`);
  const bv = BigInt(`0x${b}`);
  if (av >> BigInt(width) || bv >> BigInt(width))
    return { invalid: av >> BigInt(width) ? "a" : "b" };
  const job = Number(given["job"]);
  const broken = applyFaults(healthy, [
    stuckAt(String(given["net"]), Number(given["value"]) as 0 | 1),
  ]);
  const sim = new Simulator(broken);
  sim.setInput("A", wordOf(width, av));
  sim.setInput("B", wordOf(width, bv));
  for (const [port, v] of Object.entries(opBits(job))) sim.setInput(port, wordOf(1, v));
  sim.settle();
  const right = aluResult(job, av, bv, width);
  const text = (y: string, c: string) => `Y ${y}, COUT ${c}`;
  const got = text(
    formatWord(sim.read("Y"), 16).replace(/^0x/, "").toUpperCase(),
    formatWord(sim.read("COUT")),
  );
  const want = text(hexWord(right.Y, width), String(right.COUT));
  return {
    pass: got !== want,
    inputs: { a: hexWord(av, width), b: hexWord(bv, width) },
    actual: { faulty: got },
    expected: { faulty: `${OTHER_THAN}${want}` },
  };
}

// ---- Module 10 -----------------------------------------------------------------------------

/**
 * A choice among options. A case gives the `field` and expects its option's `value`. A case may
 * name a `detail`, the sentence the book shows on a failure in place of the values, which would
 * give the right option away; otherwise the learner's choice and the expected option are reported,
 * each by its option's words.
 */
function choices(
  answers: Readonly<Record<string, string>>,
  given: Readonly<Record<string, string | number>>,
  expect: Readonly<Record<string, string | number>>,
): AnswerResult | AnswerProblem {
  const field = String(given["field"]);
  const gone = missing(answers, [field]);
  if (gone) return gone;
  const chosen = (answers[field] ?? "").trim();
  const want = String(expect["value"]);
  return {
    pass: chosen === want,
    inputs: {},
    actual: { [field]: chosen },
    expected: { [field]: want },
    ...ruleOf(given, field, chosen),
  };
}

/**
 * Module 10: the sentence a case names (`given.detail`), shown in place of the values, which would
 * hand over the answer; it says which rule a wrong answer misses, with the learner's own answer.
 */
function ruleOf(
  given: Readonly<Record<string, string | number>>,
  field: string,
  actual: string,
): Pick<AnswerResult, "detail"> {
  const key = given["detail"];
  return typeof key === "string" ? { detail: { key, field, values: { actual } } } : {};
}

/**
 * An instruction's word, typed as eight hexadecimal digits. A case gives the `field` and `shown`,
 * the instruction as the task writes it, and expects its `word`. A wrong word is reported as the
 * fields it holds, digit by digit, beside the instruction asked for, so the answer is not printed.
 */
function instructionWord(
  answers: Readonly<Record<string, string>>,
  given: Readonly<Record<string, string | number>>,
  expect: Readonly<Record<string, string | number>>,
): AnswerResult | AnswerProblem {
  const field = String(given["field"]);
  const gone = missing(answers, [field]);
  if (gone) return gone;
  const h = parseHex(answers[field]);
  if (h === undefined || h.length > 8) return { invalid: field };
  const typed = h.padStart(8, "0");
  const d = (k: number) => typed[k] ?? "0";
  const c = Number.parseInt(typed.slice(5), 16);
  const read = `K ${d(0)}, J ${d(1)}, A ${d(2)}, B ${d(3)}, Y ${d(4)}, C ${typed.slice(5)} (${c >= 0x800 ? c - 0x1000 : c})`;
  return {
    pass: typed === String(expect["word"]).toUpperCase(),
    inputs: {},
    actual: { [field]: read },
    expected: { [field]: String(given["shown"]) },
  };
}

/**
 * A number or a few hexadecimal digits worked out by hand. A case gives the `field` and its
 * `form`, `number` (decimal, read signed) or `hex` (digits, either case, no prefix needed), and
 * expects its `value`. A case may name a `detail`, as `choices` does.
 */
function exact(
  answers: Readonly<Record<string, string>>,
  given: Readonly<Record<string, string | number>>,
  expect: Readonly<Record<string, string | number>>,
): AnswerResult | AnswerProblem {
  const field = String(given["field"]);
  const gone = missing(answers, [field]);
  if (gone) return gone;
  const want = String(expect["value"]);
  if (given["form"] === "hex") {
    const h = parseHex(answers[field]);
    if (h === undefined) return { invalid: field };
    const typed = h.replace(/^0+(?=.)/, "");
    return {
      pass: typed === want.toUpperCase().replace(/^0+(?=.)/, ""),
      inputs: {},
      actual: { [field]: h },
      expected: { [field]: want },
      ...ruleOf(given, field, h),
    };
  }
  const n = parseNumber(answers[field]);
  if (n === undefined) return { invalid: field };
  return {
    pass: String(n) === want,
    inputs: {},
    actual: { [field]: String(n) },
    expected: { [field]: want },
    ...ruleOf(given, field, String(n)),
  };
}

/** The graders lessons may name in an answers challenge's tests. */
export const ANSWER_GRADERS: Readonly<Record<string, AnswerGrader>> = {
  threshold,
  word,
  // Module 6
  "memory-read": memoryRead,
  // Module 7
  exposes,
  // Module 10
  choices,
  "instruction-word": instructionWord,
  exact,
  // Module 0: graded by running the finished machine (meet.ts).
  "machine-run": machineRun,
  "machine-step": machineStep,
  "machine-slices": machineSlices,
};
