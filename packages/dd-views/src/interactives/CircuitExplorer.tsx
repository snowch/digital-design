// Copyright © 2026 Christopher Snow

// A library circuit, running: press its inputs, clock it, watch it settle step by step, and see
// the reference table's row for the inputs now.

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

import {
  D_FLIP_FLOP_TABLE,
  D_LATCH_TABLE,
  REGISTER_BIT_TABLE,
  SR_LATCH_TABLE,
  libraryCircuit,
  type TruthTable as RefTable,
} from "@dd/dd-model";
import type { InteractiveProps } from "@dd/lesson-runtime";
import { Stepper } from "@dd/primitives";
import { formatWord, type Circuit, type Word } from "@dd/sim";

import { CircuitView } from "../CircuitView";
import { format, useViewStrings } from "../strings";
import { TruthTable, enumerateTable, rowFor } from "../TruthTable";
import { useSettleSim } from "../useSim";
import { WordInputs } from "../WordInputs";
import { withProps } from "./props";

const TABLES: Record<string, RefTable> = {
  "sr-latch": SR_LATCH_TABLE,
  "d-latch": D_LATCH_TABLE,
  "d-flip-flop": D_FLIP_FLOP_TABLE,
  "register-bit": REGISTER_BIT_TABLE,
};

const Props = z.object({
  libraryId: z.string(),
  clock: z.string().optional(),
  showSteps: z.boolean().default(false),
  /** A reference table by name, or "circuit": every row of this circuit, from the simulator (Module 2). */
  truthTable: z.enum(["sr-latch", "d-latch", "d-flip-flop", "register-bit", "circuit"]).optional(),
  scope: z.string().default(""),
  /** Offer "Release all at once": only where two inputs pressed together are the experiment. */
  releaseAll: z.boolean().default(false),
  /** Let the learner open a block to see inside it; off where the inside is a challenge's answer. */
  canOpen: z.boolean().default(true),
  /** Module 3: starting values for some inputs (bits, a number or 0x hexadecimal). */
  initial: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  /** Module 3: each word in the signal table read as a number, these ways. */
  readings: z.array(z.enum(["unsigned", "signed"])).default([]),
  /** Module 5: steps run before the figure first shows, and again at "Start again". */
  prime: z
    .array(
      z.object({
        set: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
        clock: z.string().optional(),
      }),
    )
    .default([]),
  /** Module 7: a row of bit boxes per word input; off for a 64-bit word, set by `initial`. */
  wordInputs: z.boolean().default(true),
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

/** In a reference table an X input means the row holds for either value; X elsewhere means unknown. */
function either(v: string): string {
  return v === "X" ? "0 or 1" : v;
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
    const sim = useSettleSim(circuit, data.initial, data.prime);
    const [scope, setScope] = useState(data.scope);
    const history = sim.sim.lastSettle?.history ?? [sim.values];
    const [step, setStep] = useState(history.length - 1);
    useEffect(() => setStep(history.length - 1), [sim.values, history.length]);
    // The last step is the simulator's own values, so a net it marked X after a loop that never
    // settled is drawn as X, as the status line says, and not as the last value it swung to.
    const last = history.length - 1;
    const shown = (data.showSteps && step < last ? history[step] : undefined) ?? sim.values;
    const oscillating = (sim.sim.lastSettle?.oscillating ?? []).map(
      (n) => circuit.nets[n]?.name ?? String(n),
    );
    const table = data.truthTable ? TABLES[data.truthTable] : undefined;
    // Module 2: the circuit's own table, every row worked out by the simulator, with the row of
    // the inputs now marked.
    const own = useMemo(
      () => (data.truthTable === "circuit" ? enumerateTable(circuit) : undefined),
      [data.truthTable, circuit],
    );
    const ownCurrent = own
      ? rowFor(own.inputColumns, own.rows, currentInputs(circuit, sim.values))
      : undefined;
    const ref = table
      ? referenceRows(
          table,
          circuit.inputs.map((i) => i.name),
        )
      : undefined;
    // A table whose rows are clock edges (a ↑ in the clock's column) marks the row the next edge
    // will apply to the inputs now; the clock's own level is not a row of that table.
    const edgeTable =
      ref !== undefined && data.clock !== undefined && ref.cols.includes(data.clock);
    const current = ref
      ? rowFor(ref.cols, ref.rows, {
          ...currentInputs(circuit, sim.values),
          ...(edgeTable ? { [data.clock as string]: "↑" } : {}),
        })
      : undefined;
    return (
      <div className="explorer" data-interactive={interactive.id}>
        <CircuitView
          circuit={circuit}
          values={shown}
          title={strings.explorer.title}
          onToggleInput={(name) => sim.toggle(name)}
          // The circuit's own table marks the row of the values now, so the signal list would
          // say the same thing twice.
          table={own === undefined}
          scope={scope}
          {...(data.canOpen ? { onScope: setScope } : {})}
          readings={data.readings}
        />
        {scope === "" && data.wordInputs && (
          <WordInputs circuit={circuit} values={sim.values} onSet={(n, v) => sim.set(n, v)} />
        )}
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
          {data.releaseAll && (
            <button type="button" className="button secondary" onClick={() => sim.releaseAll()}>
              {strings.explorer.releaseAll}
            </button>
          )}
          <button type="button" className="button secondary" onClick={() => sim.reset()}>
            {strings.explorer.reset}
          </button>
        </div>
        {data.showSteps && (
          <Stepper
            step={step}
            last={last}
            onStep={setStep}
            label={strings.explorer.step}
            position={format(strings.explorer.stepOf, { k: Math.min(step, last), n: last })}
            status={
              sim.converged
                ? history.length === 2
                  ? strings.explorer.settledOne
                  : format(strings.explorer.settled, { n: last })
                : format(strings.explorer.notSettled, { nets: oscillating.join(", ") })
            }
          />
        )}
        {own && (
          <TruthTable
            caption={strings.explorer.ownTable}
            inputColumns={own.inputColumns}
            outputColumns={own.outputColumns}
            rows={own.rows}
            {...(ownCurrent !== undefined ? { current: ownCurrent } : {})}
          />
        )}
        {table && ref && (
          <TruthTable
            caption={table.title}
            inputColumns={ref.cols}
            outputColumns={[table.outputColumn]}
            rows={ref.rows.map((r) => ({ ...r, inputs: r.inputs.map(either) }))}
            stateColumn={strings.table.state}
            {...(current !== undefined ? { current } : {})}
            atEdge={edgeTable}
            {...(table.note ? { note: table.note } : {})}
          />
        )}
      </div>
    );
  },
);
