// Copyright © 2026 Christopher Snow

// Module 2: a circuit's truth table read in pairs of rows. The learner picks an input; the
// figure sets each row beside the row that differs from it in that input alone, and says whether
// the output changed. Where it did not, that input makes no difference there, and the pair can be
// one row and one gate fewer. The pairs come from `pairsFor`, over the simulator's own table.

import { useMemo, useState } from "react";
import { z } from "zod";

import { libraryCircuit, pairsFor, truthTableOf } from "@dd/dd-model";
import type { InteractiveProps } from "@dd/lesson-runtime";

import { CircuitView } from "../CircuitView";
import { format, useViewStrings } from "../strings";
import { withProps } from "./props";

const Props = z.object({
  libraryId: z.string(),
  /** The input chosen at the start; the first input when absent. */
  input: z.string().optional(),
  drawing: z.boolean().default(true),
});

export const InputPairs = withProps(
  Props,
  function InputPairs({ data, interactive }: InteractiveProps & { data: z.infer<typeof Props> }) {
    const strings = useViewStrings();
    const circuit = useMemo(() => libraryCircuit(data.libraryId), [data.libraryId]);
    const table = useMemo(() => truthTableOf(circuit), [circuit]);
    const [input, setInput] = useState(data.input ?? table.inputs[0] ?? "");
    const pairs = useMemo(() => pairsFor(table, input), [table, input]);
    const others = table.inputs.filter((n) => n !== input);
    const output = table.outputs[0] ?? "";
    const name = `${interactive.id}-input`;
    return (
      <div className="input-pairs" data-interactive={interactive.id}>
        {data.drawing && (
          <CircuitView circuit={circuit} title={strings.explorer.title} table={false} />
        )}
        <fieldset className="pair-choices">
          <legend>{strings.pairs.choose}</legend>
          {table.inputs.map((n) => (
            <label key={n} className="pair-choice">
              <input type="radio" name={name} checked={input === n} onChange={() => setInput(n)} />
              <span>{n}</span>
            </label>
          ))}
        </fieldset>
        <div className="truth-table-wrap">
          <table className="truth-table pairs-table">
            <caption>{format(strings.pairs.caption, { input })}</caption>
            <thead>
              <tr>
                {others.map((n) => (
                  <th key={n} scope="col" className="col-input">
                    {n}
                  </th>
                ))}
                <th scope="col" className="col-output">
                  {`${output}, ${format(strings.pairs.at, { input, value: 0 })}`}
                </th>
                <th scope="col" className="col-output">
                  {`${output}, ${format(strings.pairs.at, { input, value: 1 })}`}
                </th>
                <th scope="col">{format(strings.pairs.matters, { input })}</th>
              </tr>
            </thead>
            <tbody>
              {pairs.map((p, i) => (
                <tr key={i} className={p.matters ? "" : "row-current"}>
                  {others.map((n) => (
                    <td key={n} className="cell-value">
                      {p.others[n]}
                    </td>
                  ))}
                  <td className="cell-value">{p.at0}</td>
                  <td className="cell-value">{p.at1}</td>
                  <td className="cell-state">{p.matters ? strings.pairs.yes : strings.pairs.no}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p role="status" className="pairs-summary">
          {format(strings.pairs.summary, {
            input,
            n: pairs.filter((p) => p.matters).length,
            total: pairs.length,
          })}
        </p>
      </div>
    );
  },
);
