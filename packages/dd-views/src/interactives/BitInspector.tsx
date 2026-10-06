// Copyright © 2026 Christopher Snow

// A word of bits the learner changes one at a time, read several ways at once. Each reading is
// the model's (dd-model/bits); for a number, the sum of the 1 bits' values is shown beside it.

import { useMemo } from "react";
import { z } from "zod";

import { parseBits, readingOf, termsOf, type Bit } from "@dd/dd-model";
import { useSlot, type InteractiveProps } from "@dd/lesson-runtime";

import { BitRow, SumLine } from "../BitRow";
import { useViewStrings } from "../strings";
import { withProps } from "./props";

const Props = z.object({
  /** The word to start from, highest bit first. */
  bits: z.string().regex(/^[01 ]+$/),
  /** The readings shown, in order. */
  readings: z.array(z.enum(["unsigned", "signed", "hex"])).min(1),
  /** Which values the bits are labelled with. */
  weights: z.enum(["unsigned", "signed"]).default("unsigned"),
});
type Data = z.infer<typeof Props>;

interface Stored {
  readonly bits: string;
}

export const BitInspector = withProps(
  Props,
  function BitInspector({ data, interactive, store }: InteractiveProps & { data: Data }) {
    const strings = useViewStrings();
    const [stored, setStored] = useSlot<Stored>(store, interactive.id);
    const start = useMemo(() => parseBits(data.bits), [data.bits]);
    const bits: Bit[] =
      stored && stored.bits.length === start.length ? parseBits(stored.bits) : start;
    const flip = (i: number) =>
      setStored({ bits: bits.map((b, k) => (k === i ? 1 - b : b)).join("") });
    return (
      <div className="bit-inspector" data-interactive={interactive.id} data-bits={bits.join("")}>
        <BitRow
          bits={bits}
          onFlip={flip}
          weights={data.weights}
          digits={data.readings.includes("hex")}
        />
        <dl className="bit-readings" aria-label={strings.bits.readings} aria-live="polite">
          {data.readings.map((r) => (
            <div key={r} className="bit-reading" data-reading={r}>
              <dt>{strings.readings.names[r]}</dt>
              <dd>
                <span className="bit-reading-value">{readingOf(bits, r)}</span>
                {r !== "hex" && (
                  <SumLine terms={termsOf(bits, r)} total={Number(readingOf(bits, r))} />
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    );
  },
);
