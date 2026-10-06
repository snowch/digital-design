// Copyright © 2026 Christopher Snow

// A wide word typed the way the lessons write words: hexadecimal digits, capitals, no prefix
// (`7D8`, `FFFFFFFFFFFFFF48`), or a number read signed (`-184`). Each reading of the text says
// what is wrong with it in the learner's terms, and each word reads back in the same two forms.

import type { Word } from "@dd/sim";

/** Why a typed word was not taken: what the message to the learner names. */
export type EntryProblem =
  | { readonly kind: "empty" }
  | { readonly kind: "not-hex"; readonly char: string }
  | { readonly kind: "hex-too-long"; readonly digits: number }
  | { readonly kind: "not-number"; readonly char: string }
  | { readonly kind: "number-range"; readonly min: bigint; readonly max: bigint };

export type Entry = { readonly value: bigint } | { readonly problem: EntryProblem };

const full = (width: number) => (1n << BigInt(width)) - 1n;

/** The hexadecimal digits a word of `width` bits is written with. */
export function hexDigitsOf(width: number): number {
  return Math.ceil(width / 4);
}

/**
 * Hexadecimal text as a word of `width` bits. Spaces are left out, as are a leading `0x` and
 * leading zeros; fewer digits than the word has fill its low end, as `7D8` is the address `7D8`.
 */
export function parseHexWord(text: string, width: number): Entry {
  let t = text.replace(/\s+/g, "");
  if (/^0x/i.test(t)) t = t.slice(2);
  if (t === "") return { problem: { kind: "empty" } };
  const bad = [...t].find((c) => !/[0-9a-f]/i.test(c));
  if (bad !== undefined) return { problem: { kind: "not-hex", char: bad } };
  const value = BigInt(`0x${t}`);
  if (value > full(width)) return { problem: { kind: "hex-too-long", digits: hexDigitsOf(width) } };
  return { value };
}

/**
 * A number as a word of `width` bits: from the most negative a signed reading holds to the most
 * an unsigned reading holds. A negative number is stored as the signed reading writes it.
 */
export function parseNumberWord(text: string, width: number): Entry {
  const t = text.replace(/\s+/g, "");
  if (t === "") return { problem: { kind: "empty" } };
  const body = t.startsWith("-") ? t.slice(1) : t;
  const bad = body === "" ? "-" : [...body].find((c) => !/[0-9]/.test(c));
  if (bad !== undefined) return { problem: { kind: "not-number", char: bad } };
  const n = BigInt(t);
  const min = -(1n << BigInt(width - 1));
  const max = full(width);
  if (n < min || n > max) return { problem: { kind: "number-range", min, max } };
  return { value: n < 0n ? n + (1n << BigInt(width)) : n };
}

/** A word in hexadecimal at its full width, a digit X where any of its four bits is unknown. */
export function hexOfWord(w: Word): string {
  let out = "";
  for (let d = hexDigitsOf(w.width) - 1; d >= 0; d--) {
    const shift = BigInt(d * 4);
    const bits = BigInt(Math.min(4, w.width - d * 4));
    const mask = (1n << bits) - 1n;
    out +=
      ((w.known >> shift) & mask) !== mask
        ? "X"
        : ((w.value >> shift) & mask).toString(16).toUpperCase();
  }
  return out;
}

/** A word read signed, or X when any of its bits is unknown. */
export function signedOfWord(w: Word): string {
  if (w.known !== full(w.width)) return "X";
  const top = 1n << BigInt(w.width - 1);
  return String(w.value >= top ? w.value - (1n << BigInt(w.width)) : w.value);
}
