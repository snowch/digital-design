// Copyright © 2026 Chris Snow

// A truth table on its own: a reference table, or a small circuit enumerated by the simulator.

import { useMemo } from "react";
import { z } from "zod";

import {
  D_FLIP_FLOP_TABLE,
  D_LATCH_TABLE,
  REGISTER_BIT_TABLE,
  SR_LATCH_TABLE,
  libraryCircuit,
} from "@dd/dd-model";
import type { InteractiveProps } from "@dd/lesson-runtime";

import { useViewStrings } from "../strings";
import { TruthTable, enumerateTable } from "../TruthTable";
import { withProps } from "./props";

const Props = z.object({
  table: z.enum(["sr-latch", "d-latch", "d-flip-flop", "register-bit"]).optional(),
  /** Input columns to keep; rows whose dropped columns are not 1 or X are left out. */
  columns: z.array(z.string()).optional(),
  showNote: z.boolean().default(true),
  libraryId: z.string().optional(),
  caption: z.string().optional(),
});

/** In the reference tables an X input means the row holds for either value. */
function either(v: string): string {
  return v === "X" ? "0 or 1" : v;
}

const TABLES = {
  "sr-latch": SR_LATCH_TABLE,
  "d-latch": D_LATCH_TABLE,
  "d-flip-flop": D_FLIP_FLOP_TABLE,
  "register-bit": REGISTER_BIT_TABLE,
};

export const TruthTableView = withProps(
  Props,
  function TruthTableView({ data }: InteractiveProps & { data: z.infer<typeof Props> }) {
    const strings = useViewStrings();
    const enumerated = useMemo(
      () => (data.libraryId ? enumerateTable(libraryCircuit(data.libraryId)) : undefined),
      [data.libraryId],
    );
    if (data.table) {
      const t = TABLES[data.table];
      const cols = data.columns
        ? t.inputColumns.filter((c) => data.columns?.includes(c))
        : [...t.inputColumns];
      const dropped = t.inputColumns.filter((c) => !cols.includes(c));
      const rows = t.rows
        .filter((r) => dropped.every((c) => r.inputs[c] === "1" || r.inputs[c] === "X"))
        .map((r) => ({
          inputs: cols.map((c) => either(r.inputs[c] ?? "X")),
          outputs: [r.next],
          state: r.state,
        }));
      return (
        <TruthTable
          caption={data.caption ?? t.title}
          inputColumns={cols}
          outputColumns={[t.outputColumn]}
          rows={rows}
          stateColumn={strings.table.state}
          {...(t.note && data.showNote ? { note: t.note } : {})}
        />
      );
    }
    if (enumerated) {
      return (
        <TruthTable
          caption={data.caption ?? data.libraryId ?? ""}
          inputColumns={enumerated.inputColumns}
          outputColumns={enumerated.outputColumns}
          rows={enumerated.rows}
        />
      );
    }
    return null;
  },
);
