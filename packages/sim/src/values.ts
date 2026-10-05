// Copyright © 2026 Chris Snow

// Signal values.
//
// A signal carries a word of `width` bits. Each bit is 0, 1 or unknown (X). Unknown is a real
// state in this engine, not an error: a latch that has never been written holds X, a race the
// model cannot decide leaves X, and the metastability overlay (metastability.ts) is the one place
// X turns into a drawn 0 or 1. Gates propagate X by three-valued (Kleene) logic, so 0 AND X is 0
// and 1 AND X is X, bit by bit.
//
// A word is two bigints: `value` holds the bits, `known` says which of them mean anything. Bits of
// `value` where `known` is 0 are always stored as 0, so two equal words compare equal as values.
// Bigints are used from the start because the course reaches 64-bit words in Prompt B, and a
// second representation later would be a second answer nobody verified.

export type Width = number;

export type Logic = "0" | "1" | "X";

export interface Word {
  readonly width: Width;
  readonly value: bigint;
  readonly known: bigint;
}

export function mask(width: Width): bigint {
  if (!Number.isInteger(width) || width < 1 || width > 1024) {
    throw new RangeError(`a word's width must be a whole number from 1 to 1024, not ${width}`);
  }
  return (1n << BigInt(width)) - 1n;
}

/** A fully known word. `value` is masked to the width. */
export function word(width: Width, value: bigint | number): Word {
  const m = mask(width);
  const v = BigInt(value) & m;
  return { width, value: v, known: m };
}

/** A word some of whose bits are unknown: bits where `known` is 0 are X. */
export function partial(width: Width, value: bigint | number, known: bigint | number): Word {
  const m = mask(width);
  const k = BigInt(known) & m;
  return { width, value: BigInt(value) & k, known: k };
}

/** A word of nothing but X. */
export function unknown(width: Width): Word {
  mask(width);
  return { width, value: 0n, known: 0n };
}

export const bit0: Word = word(1, 0n);
export const bit1: Word = word(1, 1n);
export const bitX: Word = unknown(1);

export function bit(value: 0 | 1 | boolean): Word {
  return value === 1 || value === true ? bit1 : bit0;
}

export function isKnown(w: Word): boolean {
  return w.known === mask(w.width);
}

export function hasUnknown(w: Word): boolean {
  return w.known !== mask(w.width);
}

export function equal(a: Word, b: Word): boolean {
  return a.width === b.width && a.value === b.value && a.known === b.known;
}

/** True when the word is fully known and equals `value`. */
export function is(w: Word, value: bigint | number): boolean {
  return isKnown(w) && w.value === (BigInt(value) & mask(w.width));
}

export function bitAt(w: Word, index: number): Logic {
  if (index < 0 || index >= w.width) {
    throw new RangeError(`bit ${index} is outside a ${w.width}-bit word`);
  }
  const b = 1n << BigInt(index);
  if ((w.known & b) === 0n) return "X";
  return (w.value & b) === 0n ? "0" : "1";
}

/** Bits most significant first, as a diagram or a table prints them. */
export function toBits(w: Word): Logic[] {
  const out: Logic[] = [];
  for (let i = w.width - 1; i >= 0; i--) out.push(bitAt(w, i));
  return out;
}

export function fromBits(bits: readonly Logic[]): Word {
  if (bits.length === 0) throw new RangeError("a word needs at least one bit");
  let value = 0n;
  let known = 0n;
  for (const b of bits) {
    value <<= 1n;
    known <<= 1n;
    if (b !== "X") {
      known |= 1n;
      if (b === "1") value |= 1n;
    }
  }
  return { width: bits.length, value, known };
}

/**
 * The word as text: a single bit as 0, 1 or X; a wider word in binary with X where a bit is
 * unknown, or in hex when every bit is known and `radix` is 16.
 */
export function formatWord(w: Word, radix: 2 | 10 | 16 = 2): string {
  if (w.width === 1) return bitAt(w, 0);
  if (radix === 2 || hasUnknown(w)) return toBits(w).join("");
  if (radix === 10) return w.value.toString(10);
  return "0x" + w.value.toString(16).padStart(Math.ceil(w.width / 4), "0");
}

/** Parses what formatWord writes, or a plain number, or the letter X for a whole unknown word. */
export function parseWord(text: string, width: Width): Word {
  const t = text.trim();
  if (t === "X" || t === "x" || t === "?") return unknown(width);
  if (/^[01X]+$/.test(t) && t.length === width) return fromBits(t.split("") as Logic[]);
  if (/^0x[0-9a-fA-F]+$/.test(t)) return word(width, BigInt(t));
  if (/^\d+$/.test(t)) return word(width, BigInt(t));
  throw new SyntaxError(`cannot read ${JSON.stringify(text)} as a ${width}-bit word`);
}

function sameWidth(a: Word, b: Word): void {
  if (a.width !== b.width) {
    throw new RangeError(`widths differ: ${a.width} and ${b.width}`);
  }
}

// Three-valued logic, bit by bit, on the (value, known) masks. A bit is known 0 when it is known
// and 0, known 1 when it is known and 1. For AND, a known 0 on either side decides the bit; a
// known 1 on both sides decides it; anything else is X. OR is the dual. XOR needs both known.

export function not(a: Word): Word {
  return { width: a.width, value: ~a.value & a.known, known: a.known };
}

export function and(a: Word, b: Word): Word {
  sameWidth(a, b);
  const zeroA = ~a.value & a.known;
  const zeroB = ~b.value & b.known;
  const one = a.value & b.value;
  const known = zeroA | zeroB | one;
  return { width: a.width, value: one & mask(a.width), known: known & mask(a.width) };
}

export function or(a: Word, b: Word): Word {
  sameWidth(a, b);
  const one = a.value | b.value;
  const zero = ~a.value & a.known & ~b.value & b.known;
  const known = one | zero;
  return { width: a.width, value: one & mask(a.width), known: known & mask(a.width) };
}

export function xor(a: Word, b: Word): Word {
  sameWidth(a, b);
  const known = a.known & b.known;
  return { width: a.width, value: (a.value ^ b.value) & known, known };
}

export function nand(a: Word, b: Word): Word {
  return not(and(a, b));
}

export function nor(a: Word, b: Word): Word {
  return not(or(a, b));
}

export function xnor(a: Word, b: Word): Word {
  return not(xor(a, b));
}

/** AND over any number of inputs. */
export function andAll(inputs: readonly Word[]): Word {
  const [first, ...rest] = inputs;
  if (!first) throw new RangeError("a gate needs at least one input");
  return rest.reduce(and, first);
}

export function orAll(inputs: readonly Word[]): Word {
  const [first, ...rest] = inputs;
  if (!first) throw new RangeError("a gate needs at least one input");
  return rest.reduce(or, first);
}

export function xorAll(inputs: readonly Word[]): Word {
  const [first, ...rest] = inputs;
  if (!first) throw new RangeError("a gate needs at least one input");
  return rest.reduce(xor, first);
}

/**
 * A two-way selector: `b` when `sel` is 1, `a` when 0. With `sel` unknown, a bit is known only
 * where `a` and `b` agree and both know it.
 */
export function mux(sel: Word, a: Word, b: Word): Word {
  sameWidth(a, b);
  if (sel.width !== 1) throw new RangeError("a two-way select takes a one-bit selector");
  if (sel.known === 1n) return sel.value === 1n ? b : a;
  const agree = ~(a.value ^ b.value) & a.known & b.known & mask(a.width);
  return { width: a.width, value: a.value & agree, known: agree };
}

/** `hi` in the upper bits, `lo` in the lower. */
export function concat(hi: Word, lo: Word): Word {
  const shift = BigInt(lo.width);
  return {
    width: hi.width + lo.width,
    value: (hi.value << shift) | lo.value,
    known: (hi.known << shift) | lo.known,
  };
}

/** Bits `hi` down to `lo`, inclusive, as a narrower word. */
export function slice(w: Word, hi: number, lo: number): Word {
  if (lo < 0 || hi < lo || hi >= w.width) {
    throw new RangeError(`bits ${hi}:${lo} are outside a ${w.width}-bit word`);
  }
  const width = hi - lo + 1;
  const m = mask(width);
  const s = BigInt(lo);
  return { width, value: (w.value >> s) & m, known: (w.known >> s) & m };
}

/** For storage and JSON: bigints as text, X preserved. */
export function serializeWord(w: Word): string {
  return formatWord(w, 2);
}

export function deserializeWord(text: string): Word {
  return fromBits(text.split("") as Logic[]);
}
