// One word, read one way at a time. The learner picks a word (when there are several) and a
// way to read it, and sees the reading and the rule that produced it. The bits never change
// when the reading does; only the rule does. Every reading is the model's (dd-model/bits).

import { useMemo } from "react";
import { z } from "zod";

import { READINGS, parseBits, readingOf, termsOf, type Reading } from "@dd/dd-model";
import { useSlot, type InteractiveProps } from "@dd/lesson-runtime";

import { BitRow, SumLine } from "../BitRow";
import { format, useViewStrings } from "../strings";
import { withProps } from "./props";

const Props = z.object({
  words: z.array(z.object({ bits: z.string().regex(/^[01 ]+$/), label: z.string() })).min(1),
  readings: z.array(z.enum(READINGS)).min(2),
});
type Data = z.infer<typeof Props>;

interface Stored {
  readonly word?: number;
  readonly reading?: Reading;
}

export const Interpretations = withProps(
  Props,
  function Interpretations({ data, interactive, store }: InteractiveProps & { data: Data }) {
    const strings = useViewStrings();
    const [stored, setStored] = useSlot<Stored>(store, interactive.id);
    const wordIndex = Math.min(stored?.word ?? 0, data.words.length - 1);
    const word = data.words[wordIndex]!;
    const reading: Reading =
      stored?.reading && data.readings.includes(stored.reading)
        ? stored.reading
        : data.readings[0]!;
    const bits = useMemo(() => parseBits(word.bits), [word.bits]);
    const value = readingOf(bits, reading);
    const set = (patch: Stored) => setStored({ ...stored, ...patch });
    const lamps = bits.map((b) => (b ? strings.readings.lampOn : strings.readings.lampOff));

    return (
      <div
        className="interpretations"
        data-interactive={interactive.id}
        data-reading={reading}
        data-value={value}
      >
        {data.words.length > 1 && (
          <fieldset className="interp-choices">
            <legend>{strings.readings.word}</legend>
            {data.words.map((w, i) => (
              <label key={i} className="interp-choice">
                <input
                  type="radio"
                  name={`${interactive.id}-word`}
                  checked={i === wordIndex}
                  onChange={() => set({ word: i })}
                />
                <span>{w.label}</span>
              </label>
            ))}
          </fieldset>
        )}
        <fieldset className="interp-choices interp-readings">
          <legend>{strings.readings.readAs}</legend>
          {data.readings.map((r) => (
            <label key={r} className="interp-choice">
              <input
                type="radio"
                name={`${interactive.id}-reading`}
                checked={r === reading}
                onChange={() => set({ reading: r })}
              />
              <span>{strings.readings.names[r]}</span>
            </label>
          ))}
        </fieldset>
        <BitRow
          bits={bits}
          weights={reading === "signed" ? "signed" : "unsigned"}
          digits={reading === "hex"}
        />
        <div className="interp-result" role="status" aria-live="polite">
          <p className="interp-how">{strings.readings.how[reading]}</p>
          {reading === "lamps" ? (
            <div
              className="lamps"
              role="img"
              aria-label={format(strings.readings.lampsLabel, { list: lamps.join(", ") })}
            >
              {bits.map((b, i) => (
                <span key={i} className={`lamp${b ? " lamp-on" : ""}`} />
              ))}
            </div>
          ) : (
            <p className="interp-value">
              <span className="interp-value-name">{strings.readings.value}</span>{" "}
              <span className="interp-value-number">{value}</span>
            </p>
          )}
          {(reading === "unsigned" || reading === "signed") && (
            <SumLine terms={termsOf(bits, reading)} total={Number(value)} />
          )}
        </div>
      </div>
    );
  },
);
