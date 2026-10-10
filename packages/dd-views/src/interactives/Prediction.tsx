// Copyright © 2026 Christopher Snow

// Predict, then run. The circuit the question is about is drawn first, without values, so the
// learner predicts from the wiring and not from a guess. The learner commits to what a signal
// will be after a scripted run; the simulator then runs the script, and the page says what the
// signal was and whether the prediction matched. The answer comes from the simulator, never
// from the lesson's data.

import { useMemo } from "react";
import { z } from "zod";

import { libraryCircuit } from "@dd/dd-model";
import { Prose, useSlot, type InteractiveProps } from "@platform/lesson-runtime";
import { PredictionChallenge } from "@platform/primitives";
import { formatWord } from "@dd/sim";

import { CircuitView, SignalTable, valueLabel } from "../CircuitView";
import { format, useViewStrings, youChose } from "../strings";
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
  /** Lanes of the timing diagram: a signal's name, or an inner wire with the name to show for it. */
  signals: z
    .array(
      z.union([
        z.string(),
        z.object({
          net: z.string(),
          label: z.string(),
          // Module 5: names for some values of a word, such as a state's name for its code.
          names: z.record(z.string(), z.string()).optional(),
        }),
      ]),
    )
    .optional(),
  /**
   * How the run is shown after a commit. "timing", the default, is a timing diagram, for a run
   * whose past matters (a clock, or a circuit that remembers). "circuit" puts the run's values on
   * the circuit drawn above, for one setting of a circuit with no clock. "settings" is a table of
   * one row per setting, for a few settings of a circuit with no memory. No timing diagram comes
   * before 4.1, where the course introduces it.
   */
  show: z.enum(["timing", "circuit", "settings"]).default("timing"),
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
    const circuit = useMemo(() => libraryCircuit(data.libraryId), [data.libraryId]);
    const outcome = useMemo(() => {
      if (!stored) return undefined;
      const sim = runScript(circuit, data.run);
      const word = sim.read(data.watch);
      // Compared in full; written as the drawings write it (a wide word in hexadecimal).
      return { sim, value: formatWord(word), shown: valueLabel(word) };
    }, [stored, circuit, data.run, data.watch]);
    // The signals a table shows, by the name the page gives each and the net it reads.
    const shown = (
      data.signals ?? [...circuit.inputs.map((p) => p.name), ...circuit.outputs.map((p) => p.name)]
    ).map((sg) => (typeof sg === "string" ? { label: sg, net: sg } : sg));
    // One row per setting: the signals as each settle step leaves them.
    const settings = useMemo(() => {
      if (!stored || data.show !== "settings") return [];
      return data.run.map((step, k) => {
        const sim = runScript(circuit, data.run.slice(0, k + 1));
        return {
          label: step.label ?? format(strings.prediction.setting, { n: k + 1 }),
          values: shown.map((sg) => formatWord(sim.read(sg.net))),
        };
      });
    }, [stored, circuit, data.run, data.show]);
    const name = `${interactive.id}-choice`;
    const chosenLabel = (value: string) =>
      data.options.find((o) => o.value === value)?.label ?? value;

    return (
      <div
        className="prediction"
        data-interactive={interactive.id}
        data-committed={stored ? "true" : "false"}
      >
        {/* After a commit, a run of one setting puts its values on this drawing; their table goes
            with the outcome, under the status line, so the question and its button stay put. */}
        <CircuitView
          circuit={circuit}
          title={strings.prediction.circuitTitle}
          table={false}
          {...(outcome && data.show === "circuit" ? { values: outcome.sim.snapshotValues() } : {})}
        />
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
        {stored && outcome && (
          <div className="prediction-outcome">
            <p
              role="status"
              className={
                outcome.value === stored.choice ? "prediction-match" : "prediction-nomatch"
              }
            >
              {youChose(strings.prediction.youSaid, chosenLabel(stored.choice))}{" "}
              {format(strings.prediction.circuitDid, { signal: data.watch, value: outcome.shown })}{" "}
              {outcome.value === stored.choice
                ? strings.prediction.match
                : strings.prediction.noMatch}
            </p>
            {data.show === "circuit" && (
              <SignalTable
                circuit={circuit}
                values={outcome.sim.snapshotValues()}
                {...(data.signals ? { only: shown.map((sg) => sg.net) } : {})}
              />
            )}
            {data.show === "timing" && (
              <TimingDiagram
                circuit={circuit}
                trace={outcome.sim.trace}
                {...(data.signals ? { signals: data.signals } : {})}
              />
            )}
            {data.show === "settings" && (
              <div className="truth-table-wrap">
                {/* Above the table, not its caption: a caption keeps to a narrow table's width. */}
                <p className="prediction-settings-caption" id={`${interactive.id}-settings`}>
                  {strings.prediction.settingsCaption}
                </p>
                <table
                  className="truth-table prediction-settings"
                  aria-labelledby={`${interactive.id}-settings`}
                >
                  <thead>
                    <tr>
                      <th scope="col">{strings.prediction.settingHeading}</th>
                      {shown.map((sg) => (
                        <th scope="col" key={sg.label}>
                          {sg.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {settings.map((row) => (
                      <tr key={row.label}>
                        <th scope="row">{row.label}</th>
                        {row.values.map((v, k) => (
                          <td key={k} className="memory-word">
                            {v}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {data.explain && <Prose markdown={data.explain} />}
          </div>
        )}
      </div>
    );
  },
);
