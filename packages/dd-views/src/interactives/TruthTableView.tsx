// A truth table on its own: a reference table, or a small circuit enumerated by the simulator.

import { useMemo } from "react";
import { z } from "zod";

import { D_FLIP_FLOP_TABLE, D_LATCH_TABLE, SR_LATCH_TABLE, libraryCircuit } from "@dd/dd-model";
import type { InteractiveProps } from "@dd/lesson-runtime";

import { useViewStrings } from "../strings";
import { TruthTable, enumerateTable } from "../TruthTable";
import { withProps } from "./props";

const Props = z.object({
  table: z.enum(["sr-latch", "d-latch", "d-flip-flop"]).optional(),
  libraryId: z.string().optional(),
  caption: z.string().optional(),
});

const TABLES = {
  "sr-latch": SR_LATCH_TABLE,
  "d-latch": D_LATCH_TABLE,
  "d-flip-flop": D_FLIP_FLOP_TABLE,
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
      return (
        <TruthTable
          caption={data.caption ?? t.title}
          inputColumns={t.inputColumns}
          outputColumns={[t.outputColumn]}
          rows={t.rows.map((r) => ({
            inputs: t.inputColumns.map((c) => r.inputs[c] ?? "X"),
            outputs: [r.next],
            state: r.state,
          }))}
          stateColumn={strings.table.state}
          {...(t.note ? { note: t.note } : {})}
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
