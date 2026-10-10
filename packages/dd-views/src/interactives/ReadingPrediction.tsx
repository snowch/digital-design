// Copyright © 2026 Christopher Snow

// Predict, then see. The same shape as the circuit prediction: what the question is about is
// drawn above it, and the learner commits to an answer before the model gives its own. Two kinds of question: which of two thresholds reads more of a
// recording wrong, and what a word reads as one way. The answer is computed by the model, never
// taken from the lesson's data.

import { useMemo } from "react";
import { z } from "zod";

import {
  RECORDING_IDS,
  parseBits,
  readBits,
  readingOf,
  recording,
  volts,
  type RecordingId,
} from "@dd/dd-model";
import { Prose, useSlot, type InteractiveProps } from "@platform/lesson-runtime";
import { PredictionChallenge } from "@platform/primitives";

import { BitRow } from "../BitRow";
import { SignalPlot } from "../SignalPlot";
import { format, useViewStrings, youChose } from "../strings";
import { withProps } from "./props";

const Ask = z.discriminatedUnion("kind", [
  /** Which threshold reads fewer samples wrong; the answer is its value in volts, or "same". */
  z.object({
    kind: z.literal("fewer-wrong"),
    recording: z.enum(RECORDING_IDS as [RecordingId, ...RecordingId[]]),
    thresholds: z.tuple([z.number().int(), z.number().int()]),
  }),
  /** What a word reads as; the answer is the reading's text. */
  z.object({
    kind: z.literal("reading"),
    bits: z.string().regex(/^[01 ]+$/),
    reading: z.enum(["unsigned", "signed", "hex"]),
  }),
]);
type AskData = z.infer<typeof Ask>;

const Props = z.object({
  question: z.string(),
  ask: Ask,
  options: z.array(z.object({ value: z.string(), label: z.string() })).min(2),
  explain: z.string().default(""),
});
type Data = z.infer<typeof Props>;

/** The model's answer to a question, as an option's value would write it. */
export function answerOf(ask: AskData): string {
  if (ask.kind === "reading") return readingOf(parseBits(ask.bits), ask.reading);
  const rec = recording(ask.recording);
  const [a, b] = ask.thresholds.map((t) => readBits(rec, t).wrong.length) as [number, number];
  if (a === b) return "same";
  return (a < b ? ask.thresholds[0] : ask.thresholds[1]).toString();
}

interface Stored {
  readonly choice: string;
}

export const ReadingPrediction = withProps(
  Props,
  function ReadingPrediction({ data, interactive, store }: InteractiveProps & { data: Data }) {
    const strings = useViewStrings();
    const [stored, setStored] = useSlot<Stored>(store, interactive.id);
    const answer = useMemo(() => (stored ? answerOf(data.ask) : undefined), [stored, data.ask]);
    const label = (value: string) => data.options.find((o) => o.value === value)?.label ?? value;
    const name = `${interactive.id}-choice`;
    const answerText = (value: string) =>
      value === "same"
        ? strings.readingPrediction.same
        : data.ask.kind === "fewer-wrong"
          ? volts(Number(value))
          : value;

    return (
      <div
        className="prediction"
        data-interactive={interactive.id}
        data-committed={stored ? "true" : "false"}
      >
        {/* Once committed, the outcome below draws the same thing with the answer on it. */}
        {!stored && <Before ask={data.ask} />}
        <Prose markdown={data.question} />
        <PredictionChallenge
          name={name}
          options={data.options}
          committed={stored?.choice}
          onCommit={(choice) => setStored({ choice })}
          onAgain={() => setStored(undefined)}
          legend={strings.prediction.legend}
          commitLabel={strings.prediction.commit}
          againLabel={strings.prediction.again}
        />
        {stored && answer !== undefined && (
          <div className="prediction-outcome">
            <p
              role="status"
              className={answer === stored.choice ? "prediction-match" : "prediction-nomatch"}
            >
              {youChose(strings.prediction.youSaid, label(stored.choice))}{" "}
              {format(strings.readingPrediction.modelGave, { value: answerText(answer) })}{" "}
              {answer === stored.choice ? strings.prediction.match : strings.prediction.noMatch}
            </p>
            <Outcome ask={data.ask} />
            {data.explain && <Prose markdown={data.explain} />}
          </div>
        )}
      </div>
    );
  },
);

/**
 * What the question is about, drawn above it before the learner commits, with nothing that gives
 * the answer: the recording's samples with no threshold and no bits read, or the word's bits
 * with no worths.
 */
function Before({ ask }: { ask: AskData }) {
  const strings = useViewStrings();
  if (ask.kind === "reading") return <BitRow bits={parseBits(ask.bits)} showWeights={false} />;
  const rec = recording(ask.recording);
  const [first] = ask.thresholds;
  return (
    <div className="prediction-before">
      <SignalPlot
        rec={rec}
        threshold={first}
        result={readBits(rec, first)}
        title={strings.readingPrediction.samplesTitle}
        plain
      />
    </div>
  );
}

function Outcome({ ask }: { ask: AskData }) {
  const strings = useViewStrings();
  if (ask.kind === "reading")
    return (
      <BitRow
        bits={parseBits(ask.bits)}
        weights={ask.reading === "signed" ? "signed" : "unsigned"}
      />
    );
  const rec = recording(ask.recording);
  return (
    <div className="prediction-plots">
      {ask.thresholds.map((t) => {
        const result = readBits(rec, t);
        return (
          <div key={t} className="prediction-plot">
            <p>
              {format(strings.readingPrediction.atThreshold, {
                threshold: volts(t),
                n: result.wrong.length,
              })}
            </p>
            <SignalPlot rec={rec} threshold={t} result={result} />
          </div>
        );
      })}
    </div>
  );
}
