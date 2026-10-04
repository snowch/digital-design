// The graders for challenges whose artifact is the learner's settings or answers.
//
// A grader takes the learner's answers (as typed), what a test case gives it, and what the case
// expects, and says what the answers produced and what was expected, as values. The words around
// those values are the book's (dd-views strings), so nothing here is a sentence. A grader that
// cannot run because an answer is missing or is not a number says which field, and the book
// turns that into a sentence.

import { bitsText, hexOf, parseBits, signedOf, unsignedOf, type Bit } from "./bits";
import { readBits, recording, RECORDING_IDS, volts, type RecordingId } from "./signals";

export interface AnswerResult {
  readonly pass: boolean;
  readonly inputs: Readonly<Record<string, string>>;
  readonly actual: Readonly<Record<string, string>>;
  readonly expected: Readonly<Record<string, string>>;
}

/** Why a case could not be graded: fields with nothing in them, or one that does not parse. */
export type AnswerProblem = { readonly missing: readonly string[] } | { readonly invalid: string };

export type AnswerGrader = (
  answers: Readonly<Record<string, string>>,
  given: Readonly<Record<string, string | number>>,
  expect: Readonly<Record<string, string | number>>,
) => AnswerResult | AnswerProblem;

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
      expected: { unsigned: String(unsignedOf(bits)) },
    };
  }
  const h = parseHex(answers["hex"]);
  if (h === undefined) return { invalid: "hex" };
  return {
    pass: h === hexOf(bits),
    inputs,
    actual: { hex: h },
    expected: { hex: hexOf(bits) },
  };
}

/** The graders lessons may name in an answers challenge's tests. */
export const ANSWER_GRADERS: Readonly<Record<string, AnswerGrader>> = { threshold, word };
