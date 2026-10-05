// Copyright © 2026 Chris Snow

// Module 2: two circuits side by side, and their outputs row by row. Each drawing can carry its
// gate count and depth; the table marks every row where the two disagree. With a question, it is
// a prediction: the learner commits to "the same" or "different" before the counts and the table
// are shown. The answer comes from the simulator, through `compareCircuits`.

import { useMemo, useState } from "react";
import { z } from "zod";

import { compareCircuits, depthOf, gatesOf, libraryCircuit } from "@dd/dd-model";
import { Prose, useSlot, type InteractiveProps } from "@dd/lesson-runtime";

import { CircuitView } from "../CircuitView";
import { format, useViewStrings } from "../strings";
import { withProps } from "./props";

const Side = z.object({ libraryId: z.string(), label: z.string() });

const Props = z.object({
  circuits: z.tuple([Side, Side]),
  /** Which measures to print under each drawing. */
  show: z.array(z.enum(["gates", "depth"])).default([]),
  /** Show the row-by-row table. */
  table: z.boolean().default(true),
  /** A prediction: options with values "same" and "different". */
  question: z.string().optional(),
  options: z
    .array(z.object({ value: z.enum(["same", "different"]), label: z.string() }))
    .optional(),
  explain: z.string().default(""),
});

interface Stored {
  readonly choice: string;
}

/** What a compare figure's prediction asks for: whether the two circuits agree in every row. */
export function compareAnswer(first: string, second: string): "same" | "different" {
  return compareCircuits(libraryCircuit(first), libraryCircuit(second)).differ.length === 0
    ? "same"
    : "different";
}

export const CircuitCompare = withProps(
  Props,
  function CircuitCompare({
    data,
    interactive,
    store,
  }: InteractiveProps & { data: z.infer<typeof Props> }) {
    const strings = useViewStrings();
    const [stored, setStored] = useSlot<Stored>(store, interactive.id);
    const [pick, setPick] = useState<string | undefined>();
    const sides = useMemo(
      () =>
        data.circuits.map((c) => {
          const circuit = libraryCircuit(c.libraryId);
          return { ...c, circuit, gates: gatesOf(circuit).length, depth: depthOf(circuit).depth };
        }),
      [data.circuits],
    );
    const [a, b] = sides as [(typeof sides)[number], (typeof sides)[number]];
    const comparison = useMemo(() => compareCircuits(a.circuit, b.circuit), [a, b]);
    const asks = data.question !== undefined && data.options !== undefined;
    const revealed = !asks || stored !== undefined;
    const answer = comparison.differ.length === 0 ? "same" : "different";
    const name = `${interactive.id}-choice`;
    const label = (value: string) => data.options?.find((o) => o.value === value)?.label ?? value;

    return (
      <div
        className="circuit-compare"
        data-interactive={interactive.id}
        {...(asks ? { "data-committed": stored ? "true" : "false" } : {})}
      >
        <div className="compare-sides">
          {sides.map((s) => (
            <div key={s.libraryId} className="compare-side">
              <p className="compare-label">{s.label}</p>
              <CircuitView
                circuit={s.circuit}
                title={format(strings.compare.drawing, { label: s.label })}
                table={false}
              />
              {revealed && data.show.length > 0 && (
                <p className="compare-measures">
                  {data.show
                    .map((m) =>
                      m === "gates"
                        ? format(strings.compare.gates, { n: s.gates })
                        : format(strings.compare.depth, { n: s.depth }),
                    )
                    .join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
        {asks && (
          <>
            <Prose markdown={data.question as string} />
            <fieldset className="prediction-options" disabled={stored !== undefined}>
              <legend className="visually-hidden">{strings.prediction.legend}</legend>
              {data.options?.map((o) => (
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
          </>
        )}
        {revealed && (
          <div className={asks ? "prediction-outcome" : "compare-outcome"}>
            {stored && (
              <p
                role="status"
                className={stored.choice === answer ? "prediction-match" : "prediction-nomatch"}
              >
                {format(strings.prediction.youSaid, { choice: label(stored.choice) })}{" "}
                {stored.choice === answer ? strings.prediction.match : strings.prediction.noMatch}
              </p>
            )}
            <p className="compare-summary" {...(asks ? {} : { role: "status" })}>
              {comparison.differ.length === 0
                ? format(strings.compare.allSame, { total: comparison.rows.length })
                : format(strings.compare.someDiffer, {
                    n: comparison.differ.length,
                    total: comparison.rows.length,
                  })}
            </p>
            {data.table && (
              <div className="truth-table-wrap">
                <table className="truth-table compare-table">
                  <caption>{strings.compare.tableCaption}</caption>
                  <thead>
                    <tr>
                      {comparison.inputs.map((n) => (
                        <th key={n} scope="col" className="col-input">
                          {n}
                        </th>
                      ))}
                      <th scope="col" className="col-output">
                        {a.label}
                      </th>
                      <th scope="col" className="col-output">
                        {b.label}
                      </th>
                      <th scope="col">{strings.compare.agree}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.rows.map((r, i) => {
                      const differs = comparison.differ.includes(i);
                      return (
                        <tr key={i} className={differs ? "row-current" : ""}>
                          {r.inputs.map((v, j) => (
                            <td key={j} className="cell-value">
                              {v}
                            </td>
                          ))}
                          <td className="cell-value">{r.first}</td>
                          <td className="cell-value">{r.second}</td>
                          <td className="cell-state">
                            {differs ? strings.compare.differs : strings.compare.same}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {stored && data.explain && <Prose markdown={data.explain} />}
          </div>
        )}
      </div>
    );
  },
);
