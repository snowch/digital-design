// Bits and the ways a word of them can be read.
//
// A word is a row of bits written with the highest bit first, as the lesson writes it: "0110" is
// bit 3 = 0, bit 2 = 1, bit 1 = 1, bit 0 = 0. Nothing in the bits says how to read them; each
// reading below is a rule applied to the same row. The views show these readings and compute
// none of their own.

export type Bit = 0 | 1;

/** The ways the course reads a word. */
export const READINGS = ["unsigned", "signed", "hex", "lamps"] as const;
export type Reading = (typeof READINGS)[number];

/** A row of bits from text such as "1111 1111 1110 1110"; spaces and underscores are ignored. */
export function parseBits(text: string): Bit[] {
  const clean = text.replace(/[\s_]/g, "");
  if (!/^[01]*$/.test(clean)) throw new Error(`not a row of bits: ${text}`);
  return [...clean].map((c) => (c === "1" ? 1 : 0));
}

/** Bits as text, highest first, with a space between groups of four from the right. */
export function bitsText(bits: readonly Bit[], grouped = true): string {
  const s = bits.join("");
  if (!grouped) return s;
  const out: string[] = [];
  for (let end = s.length; end > 0; end -= 4) out.unshift(s.slice(Math.max(0, end - 4), end));
  return out.join(" ");
}

/** What bit `n` (0 is the lowest) is worth. Read as signed, the highest bit counts negative. */
export function placeValue(width: number, n: number, reading: "unsigned" | "signed"): number {
  const v = 2 ** n;
  return reading === "signed" && n === width - 1 ? -v : v;
}

/** The bit numbers of a row, in the order the row is written (highest first). */
export function bitNumbers(width: number): number[] {
  return Array.from({ length: width }, (_, i) => width - 1 - i);
}

/** The place values of the bits that are 1, highest first. Their sum is the number. */
export function termsOf(bits: readonly Bit[], reading: "unsigned" | "signed"): number[] {
  const w = bits.length;
  return bits.flatMap((b, i) => (b === 1 ? [placeValue(w, w - 1 - i, reading)] : []));
}

export function unsignedOf(bits: readonly Bit[]): number {
  return termsOf(bits, "unsigned").reduce((a, b) => a + b, 0);
}

export function signedOf(bits: readonly Bit[]): number {
  return termsOf(bits, "signed").reduce((a, b) => a + b, 0);
}

const HEX = "0123456789ABCDEF";

/** One hexadecimal digit per group of four bits, counted from the right. */
export function hexOf(bits: readonly Bit[]): string {
  let out = "";
  for (let end = bits.length; end > 0; end -= 4) {
    const group = bits.slice(Math.max(0, end - 4), end);
    out = HEX[unsignedOf(group)] + out;
  }
  return out;
}

/** The row of bits a value has when written in `width` bits; a negative value as signed. */
export function bitsOf(value: number, width: number): Bit[] {
  const min = -(2 ** (width - 1));
  const max = 2 ** width - 1;
  if (!Number.isInteger(value) || value < min || value > max)
    throw new Error(`${value} does not fit in ${width} bits`);
  const u = value < 0 ? value + 2 ** width : value;
  return bitNumbers(width).map((n) => (Math.floor(u / 2 ** n) % 2 === 1 ? 1 : 0));
}

/** The word read one way, as the text a page shows. Lamps are the bits as on (1) and off (0). */
export function readingOf(bits: readonly Bit[], reading: Reading): string {
  switch (reading) {
    case "unsigned":
      return String(unsignedOf(bits));
    case "signed":
      return String(signedOf(bits));
    case "hex":
      return hexOf(bits);
    case "lamps":
      return bits.map((b) => (b ? "on" : "off")).join(" ");
  }
}

/** How many different rows `width` bits can make, and the range each reading covers. */
export function rangeOf(width: number): {
  patterns: number;
  unsigned: readonly [number, number];
  signed: readonly [number, number];
} {
  return {
    patterns: 2 ** width,
    unsigned: [0, 2 ** width - 1],
    signed: [-(2 ** (width - 1)), 2 ** (width - 1) - 1],
  };
}
