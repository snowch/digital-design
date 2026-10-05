// Copyright © 2026 Chris Snow

// The inputs of a circuit that carry a word, as rows of bits to press (Module 3). A word's pin in
// a drawing is not a button: flipping it between 0 and 1 means nothing for four bits. Each bit
// here is, and the simulator settles after every press. A one-bit input stays a pin to press.

import { signedOf, unsignedOf, type Bit } from "@dd/dd-model";
import { bitAt, word, type Circuit, type Word } from "@dd/sim";

import { BitRow } from "./BitRow";
import { format, useViewStrings } from "./strings";

/** A word's bits highest first, as the bit row draws them; an unknown bit counts as 0. */
export function bitsOfWord(w: Word | undefined, width: number): Bit[] {
  return Array.from({ length: width }, (_, i) => (w && bitAt(w, width - 1 - i) === "1" ? 1 : 0));
}

/** The word input rows of a circuit, or nothing when every input is one bit. */
export function WordInputs({
  circuit,
  values,
  onSet,
}: {
  circuit: Circuit;
  values: readonly Word[];
  onSet: (name: string, value: Word) => void;
}) {
  const strings = useViewStrings();
  const words = circuit.inputs.filter((p) => (circuit.nets[p.net]?.width ?? 1) > 1);
  if (words.length === 0) return null;
  return (
    <div className="word-inputs">
      {words.map((p) => {
        const width = circuit.nets[p.net]?.width ?? 1;
        const bits = bitsOfWord(values[p.net], width);
        const flip = (index: number) => {
          const next = bits.map((b, i) => (i === index ? ((1 - b) as Bit) : b));
          onSet(p.name, word(width, BigInt(unsignedOf(next))));
        };
        return (
          <div className="word-input" key={p.name}>
            <p className="word-input-name">{format(strings.words.heading, { name: p.name })}</p>
            <BitRow bits={bits} onFlip={flip} label={format(strings.words.row, { name: p.name })} />
          </div>
        );
      })}
    </div>
  );
}

/** A word's reading as a number, for the signal table: unsigned or signed. */
export function readingText(w: Word | undefined, reading: "unsigned" | "signed"): string {
  if (!w || w.width < 2) return "";
  if (w.known !== (1n << BigInt(w.width)) - 1n) return "X";
  const bits = bitsOfWord(w, w.width);
  return String(reading === "signed" ? signedOf(bits) : unsignedOf(bits));
}
