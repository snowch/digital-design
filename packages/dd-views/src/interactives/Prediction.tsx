// Predict, then run. The circuit the question is about is drawn first, without values, so the
// learner predicts from the wiring and not from a guess. The learner commits to what a signal
// will be after a scripted run; the simulator then runs the script, and the page says what the
// signal was and whether the prediction matched. The answer comes from the simulator, never
// from the lesson's data.

import { useMemo, useState } from "react";
import { z } from "zod";

import { libraryCircuit } from "@dd/dd-model";
import { Prose, useSlot, type InteractiveProps } from "@dd/lesson-runtime";
import { formatWord } from "@dd/sim";

import { CircuitView } from "../CircuitView";
import { format, useViewStrings } from "../strings";
import { TimingDiagram } from "../TimingDiagram";
import { withProps } from "./props";
import { Step, runScript } from "./script";

const Props = z.object({
  question: z.string(),
  libraryId: z.string(),
  run: z.array(Step).min(1),
  watch: z.string(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).min(2),
  explain: z.string().default(""),
  signals: z.array(z.string()).optional(),
});

interface Stored {
  readonly choice: string;
}

export const Prediction = withProps(
  Props,
  function Prediction({
    data,
    interactive,
    store,
  }: InteractiveProps & { data: z.infer<typeof Props> }) {
    const strings = useViewStrings();
    const [stored, setStored] = useSlot<Stored>(store, interactive.id);
    const [pick, setPick] = useState<string | undefined>();
    const circuit = useMemo(() => libraryCircuit(data.libraryId), [data.libraryId]);
    const outcome = useMemo(() => {
      if (!stored) return undefined;
      const sim = runScript(circuit, data.run);
      return { sim, value: formatWord(sim.read(data.watch)) };
    }, [stored, circuit, data.run, data.watch]);
    const name = `${interactive.id}-choice`;
    const chosenLabel = (value: string) =>
      data.options.find((o) => o.value === value)?.label ?? value;

    return (
      <div
        className="prediction"
        data-interactive={interactive.id}
        data-committed={stored ? "true" : "false"}
      >
        <CircuitView circuit={circuit} title={strings.prediction.circuitTitle} table={false} />
        <Prose markdown={data.question} />
        <fieldset className="prediction-options" disabled={stored !== undefined}>
          <legend className="visually-hidden">{strings.prediction.legend}</legend>
          {data.options.map((o) => (
            <label key={o.value} className="prediction-option">
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={(stored?.choice ?? pick) === o.value}
                onChange={() => setPick(o.value)}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </fieldset>
        {!stored ? (
          <button
            type="button"
            className="button primary"
            disabled={pick === undefined}
            onClick={() => pick !== undefined && setStored({ choice: pick })}
          >
            {strings.prediction.commit}
          </button>
        ) : (
          <button
            type="button"
            className="button secondary"
            onClick={() => {
              setStored(undefined);
              setPick(undefined);
            }}
          >
            {strings.prediction.again}
          </button>
        )}
        {stored && outcome && (
          <div className="prediction-outcome">
            <p
              role="status"
              className={
                outcome.value === stored.choice ? "prediction-match" : "prediction-nomatch"
              }
            >
              {format(strings.prediction.youSaid, { choice: chosenLabel(stored.choice) })}{" "}
              {format(strings.prediction.circuitDid, { signal: data.watch, value: outcome.value })}{" "}
              {outcome.value === stored.choice
                ? strings.prediction.match
                : strings.prediction.noMatch}
            </p>
            <TimingDiagram
              circuit={circuit}
              trace={outcome.sim.trace}
              title={strings.prediction.traceTitle}
              {...(data.signals ? { signals: data.signals } : {})}
            />
            {data.explain && <Prose markdown={data.explain} />}
          </div>
        )}
      </div>
    );
  },
);
