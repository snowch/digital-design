// A library circuit, running: press its inputs, clock it, watch it settle step by step, and see
// the reference table's row for the inputs now.

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

import {
  D_FLIP_FLOP_TABLE,
  D_LATCH_TABLE,
  SR_LATCH_TABLE,
  libraryCircuit,
  type TruthTable as RefTable,
} from "@dd/dd-model";
import type { InteractiveProps } from "@dd/lesson-runtime";
import { formatWord, type Circuit, type Word } from "@dd/sim";

import { CircuitView } from "../CircuitView";
import { format, useViewStrings } from "../strings";
import { TruthTable, rowFor } from "../TruthTable";
import { useSettleSim } from "../useSim";
import { withProps } from "./props";

const TABLES: Record<string, RefTable> = {
  "sr-latch": SR_LATCH_TABLE,
  "d-latch": D_LATCH_TABLE,
  "d-flip-flop": D_FLIP_FLOP_TABLE,
};

const Props = z.object({
  libraryId: z.string(),
  clock: z.string().optional(),
  showSteps: z.boolean().default(false),
  truthTable: z.enum(["sr-latch", "d-latch", "d-flip-flop"]).optional(),
  scope: z.string().default(""),
});

/** The reference table restricted to the inputs the circuit has, with a wildcard for X. */
export function referenceRows(table: RefTable, inputNames: readonly string[]) {
  const cols = table.inputColumns.filter((c) => inputNames.includes(c));
  const dropped = table.inputColumns.filter((c) => !inputNames.includes(c));
  const rows = table.rows
    .filter((r) => dropped.every((c) => r.inputs[c] === "1" || r.inputs[c] === "X"))
    .map((r) => ({
      inputs: cols.map((c) => r.inputs[c] ?? "X"),
      outputs: [r.next],
      state: r.state,
    }));
  return { cols, rows };
}

function currentInputs(circuit: Circuit, values: readonly Word[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of circuit.inputs) {
    const v = values[i.net];
    if (v) out[i.name] = formatWord(v);
  }
  return out;
}

export const CircuitExplorer = withProps(
  Props,
  function CircuitExplorer({
    data,
    interactive,
  }: InteractiveProps & { data: z.infer<typeof Props> }) {
    const strings = useViewStrings();
    const circuit = useMemo(() => libraryCircuit(data.libraryId), [data.libraryId]);
    const sim = useSettleSim(circuit);
    const [scope, setScope] = useState(data.scope);
    const history = sim.sim.lastSettle?.history ?? [sim.values];
    const [step, setStep] = useState(history.length - 1);
    useEffect(() => setStep(history.length - 1), [sim.values, history.length]);
    const shown =
      (data.showSteps ? history[Math.min(step, history.length - 1)] : undefined) ?? sim.values;
    const oscillating = (sim.sim.lastSettle?.oscillating ?? []).map(
      (n) => circuit.nets[n]?.name ?? String(n),
    );
    const table = data.truthTable ? TABLES[data.truthTable] : undefined;
    const ref = table
      ? referenceRows(
          table,
          circuit.inputs.map((i) => i.name),
        )
      : undefined;
    const current = ref
      ? rowFor(ref.cols, ref.rows, currentInputs(circuit, sim.values))
      : undefined;
    return (
      <div className="explorer" data-interactive={interactive.id}>
        <CircuitView
          circuit={circuit}
          values={shown}
          title={strings.explorer.title}
          onToggleInput={(name) => sim.toggle(name)}
          scope={scope}
          onScope={setScope}
        />
        <div className="explorer-actions">
          {data.clock && (
            <button
              type="button"
              className="button secondary"
              onClick={() => sim.clock(data.clock as string)}
            >
              {format(strings.explorer.clock, { name: data.clock })}
            </button>
          )}
          <button type="button" className="button secondary" onClick={() => sim.reset()}>
            {strings.explorer.reset}
          </button>
        </div>
        {data.showSteps && (
          <div className="explorer-steps">
            <label>
              <span>{strings.explorer.step}</span>
              <input
                type="range"
                min={0}
                max={history.length - 1}
                value={Math.min(step, history.length - 1)}
                onChange={(e) => setStep(Number(e.target.value))}
              />
              <span className="explorer-step-of">
                {format(strings.explorer.stepOf, {
                  k: Math.min(step, history.length - 1),
                  n: history.length - 1,
                })}
              </span>
            </label>
            <p role="status">
              {sim.converged
                ? format(strings.explorer.settled, { n: history.length - 1 })
                : format(strings.explorer.notSettled, { nets: oscillating.join(", ") })}
            </p>
          </div>
        )}
        {table && ref && (
          <TruthTable
            caption={table.title}
            inputColumns={ref.cols}
            outputColumns={[table.outputColumn]}
            rows={ref.rows}
            stateColumn={strings.table.state}
            {...(current !== undefined ? { current } : {})}
            {...(table.note ? { note: table.note } : {})}
          />
        )}
      </div>
    );
  },
);
