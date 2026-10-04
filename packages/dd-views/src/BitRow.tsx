// A word as a row of bits, highest first, in groups of four. Each bit shows its number and what
// it is worth; pressed, it changes between 0 and 1. Read-only when there is no `onFlip`. Under
// each group, optionally, the hexadecimal digit the group makes.

import { bitNumbers, hexOf, placeValue, type Bit } from "@dd/dd-model";

import { format, useViewStrings } from "./strings";

export function BitRow({
  bits,
  onFlip,
  weights = "unsigned",
  digits = false,
  label,
}: {
  bits: readonly Bit[];
  onFlip?: (index: number) => void;
  weights?: "unsigned" | "signed";
  digits?: boolean;
  label?: string;
}) {
  const strings = useViewStrings();
  const width = bits.length;
  const numbers = bitNumbers(width);
  const groups: number[][] = [];
  for (let end = width; end > 0; end -= 4)
    groups.unshift(Array.from({ length: Math.min(4, end) }, (_, k) => Math.max(0, end - 4) + k));
  return (
    <div className="bit-row" role="group" aria-label={label ?? strings.bits.row}>
      {groups.map((g) => (
        <div className="bit-group" key={g[0]}>
          <div className="bit-group-bits">
            {g.map((i) => {
              const n = numbers[i] as number;
              const bit = bits[i] as Bit;
              const value = placeValue(width, n, weights);
              const slots = { n, value, bit };
              const inner = (
                <>
                  <span className="bit-number" aria-hidden="true">
                    {n}
                  </span>
                  <span className="bit-value" aria-hidden="true">
                    {bit}
                  </span>
                  <span className="bit-weight" aria-hidden="true">
                    {value}
                  </span>
                </>
              );
              return onFlip ? (
                <button
                  key={i}
                  type="button"
                  className={`bit bit-${bit}`}
                  aria-pressed={bit === 1}
                  aria-label={format(strings.bits.flip, slots)}
                  onClick={() => onFlip(i)}
                  data-bit={n}
                >
                  {inner}
                </button>
              ) : (
                <span
                  key={i}
                  className={`bit bit-${bit}`}
                  role="img"
                  aria-label={format(strings.bits.fixed, slots)}
                  data-bit={n}
                >
                  {inner}
                </span>
              );
            })}
          </div>
          {digits && (
            <div className="bit-digit">
              {format(strings.bits.digit, { digit: hexOf(g.map((i) => bits[i] as Bit)) })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** The sum that gives a word's number: the values of its 1 bits, added. */
export function SumLine({ terms, total }: { terms: readonly number[]; total: number }) {
  const strings = useViewStrings();
  if (terms.length === 0) return <p className="bit-sum">{strings.bits.noOnes}</p>;
  const shown = terms.map((t, k) => (k === 0 ? String(t) : t < 0 ? `- ${-t}` : `+ ${t}`)).join(" ");
  return (
    <p className="bit-sum">
      <code>{format(strings.bits.sum, { terms: shown, total })}</code>
    </p>
  );
}
