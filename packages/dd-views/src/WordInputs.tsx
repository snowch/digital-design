// Copyright © 2026 Christopher Snow

// The inputs of a circuit that carry a word, as rows of bits to press (Module 3). A word's pin in
// a drawing is not a button: flipping it between 0 and 1 means nothing for four bits. Each bit
// here is, and the simulator settles after every press. A one-bit input stays a pin to press.
//
// A word wider than 16 bits is typed instead (after Module 8's learner walks): as the lessons
// write words, in hexadecimal, or as a number read signed, and it reads back in both. Its bits
// stay one press away, folded: 64 buttons on a phone are four screens to scroll for one address.
// Up to 16 bits the row of bits is the input, as the earlier modules teach the bits with it.

import { useId, useState, type KeyboardEvent } from "react";

import {
  hexOfWord,
  parseHexWord,
  parseNumberWord,
  signedOf,
  signedOfWord,
  unsignedOf,
  type Bit,
  type EntryProblem,
} from "@dd/dd-model";
import { bitAt, word, type Circuit, type Word } from "@dd/sim";

import { BitRow } from "./BitRow";
import { format, useViewStrings } from "./strings";

/** A word's bits highest first, as the bit row draws them; an unknown bit counts as 0. */
export function bitsOfWord(w: Word | undefined, width: number): Bit[] {
  return Array.from({ length: width }, (_, i) => (w && bitAt(w, width - 1 - i) === "1" ? 1 : 0));
}

/** Words wider than this many bits are typed; this many or fewer are a row of bits. */
export const TYPED_FROM = 16;

/** What is wrong with a typed word, in the learner's terms. */
function problemText(
  problem: EntryProblem,
  t: ReturnType<typeof useViewStrings>["words"],
  name: string,
  width: number,
): string {
  switch (problem.kind) {
    case "empty":
      return t.empty;
    case "not-hex":
      return format(t.notHex, { char: problem.char });
    case "hex-too-long":
      return format(t.hexTooLong, { name, width, digits: problem.digits });
    case "not-number":
      return format(t.notNumber, { char: problem.char });
    case "number-range":
      return format(t.numberRange, {
        name,
        width,
        min: problem.min.toString(),
        max: problem.max.toString(),
      });
  }
}

/**
 * One wide word, typed: a field for its hexadecimal digits and one for its number read signed,
 * each showing the word as it is. A field takes what was typed at Enter, at Set or when it is
 * left; what it cannot take it says, and leaves the word as it was.
 */
function TypedWord({
  name,
  width,
  value,
  onSet,
  bits,
  onFlip,
}: {
  name: string;
  width: number;
  value: Word | undefined;
  onSet: (value: Word) => void;
  bits: readonly Bit[];
  onFlip: (index: number) => void;
}) {
  const strings = useViewStrings();
  const t = strings.words;
  const [draft, setDraft] = useState<{ field: "hex" | "number"; text: string } | undefined>();
  const [problem, setProblem] = useState<string | undefined>();
  // Two Try it panels on one page may each have an input of the same name.
  const problemId = `${useId()}-problem`;
  const shown = {
    hex: value ? hexOfWord(value) : "",
    number: value ? signedOfWord(value) : "",
  };
  const textOf = (field: "hex" | "number") => (draft?.field === field ? draft.text : shown[field]);
  const take = (field: "hex" | "number") => {
    if (draft?.field !== field) return;
    const entry =
      field === "hex" ? parseHexWord(draft.text, width) : parseNumberWord(draft.text, width);
    if ("problem" in entry) {
      setProblem(problemText(entry.problem, t, name, width));
      return;
    }
    setProblem(undefined);
    setDraft(undefined);
    onSet(word(width, entry.value));
  };
  const keys = (field: "hex" | "number") => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      take(field);
    } else if (e.key === "Escape") {
      setDraft(undefined);
      setProblem(undefined);
    }
  };
  const field = (which: "hex" | "number", label: string, caption: string) => (
    <label className="word-field">
      <span className="word-field-caption">{caption}</span>
      <input
        type="text"
        inputMode="text"
        autoCapitalize={which === "hex" ? "characters" : "off"}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label={label}
        aria-invalid={draft?.field === which && problem !== undefined}
        aria-describedby={problemId}
        value={textOf(which)}
        onChange={(e) => {
          setDraft({ field: which, text: e.target.value });
          setProblem(undefined);
        }}
        onKeyDown={keys(which)}
        onBlur={() => take(which)}
      />
    </label>
  );
  return (
    <div className="word-input word-typed">
      <p className="word-input-name">{format(t.heading, { name })}</p>
      <div className="word-fields">
        {field("hex", format(t.hexLabel, { name }), t.hexCaption)}
        {field("number", format(t.numberLabel, { name }), t.numberCaption)}
        <button
          type="button"
          className="button secondary"
          onClick={() => draft && take(draft.field)}
          aria-label={format(t.setLabel, { name })}
        >
          {t.set}
        </button>
      </div>
      <p id={problemId} className="word-problem" role="status">
        {problem ?? ""}
      </p>
      <details className="word-bits">
        <summary>{format(t.bitsSummary, { name })}</summary>
        <BitRow
          bits={bits}
          onFlip={onFlip}
          label={format(t.row, { name })}
          weights="digit"
          digits
        />
      </details>
    </div>
  );
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
        if (width > TYPED_FROM)
          return (
            <TypedWord
              key={p.name}
              name={p.name}
              width={width}
              value={values[p.net]}
              onSet={(v) => onSet(p.name, v)}
              bits={bits}
              onFlip={flip}
            />
          );
        return (
          <div className="word-input" key={p.name}>
            <p className="word-input-name">{format(strings.words.heading, { name: p.name })}</p>
            {/* Module 8: a word wider than 16 bits shows each bit's worth inside its group of four
                and the group's digit; its bits' worths in the number run to 19 digits and would
                widen the row past a phone. */}
            <BitRow
              bits={bits}
              onFlip={flip}
              label={format(strings.words.row, { name: p.name })}
              {...(width > 16 ? { weights: "digit" as const, digits: true } : {})}
            />
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
