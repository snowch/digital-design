// A truth table: the reference's rows as data, or a circuit's rows enumerated by the simulator.
// The row matching the inputs now is marked, in text as well as by shading.

import { Simulator, formatWord, type Circuit } from "@dd/sim";

import { useViewStrings } from "./strings";

export interface TableRow {
  readonly inputs: readonly string[];
  readonly outputs: readonly string[];
  /** A word for the row: Hold, Set, Reset. */
  readonly state?: string;
}

export interface TruthTableProps {
  readonly caption: string;
  readonly inputColumns: readonly string[];
  readonly outputColumns: readonly string[];
  readonly rows: readonly TableRow[];
  readonly stateColumn?: string;
  /** Index of the row to mark as the one in force now. */
  readonly current?: number;
  readonly note?: string;
}

export function TruthTable({
  caption,
  inputColumns,
  outputColumns,
  rows,
  stateColumn,
  current,
  note,
}: TruthTableProps) {
  const strings = useViewStrings();
  return (
    <div className="truth-table-wrap">
      <table className="truth-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {inputColumns.map((c) => (
              <th key={`i-${c}`} scope="col" className="col-input">
                {c}
              </th>
            ))}
            {outputColumns.map((c) => (
              <th key={`o-${c}`} scope="col" className="col-output">
                {c}
              </th>
            ))}
            {stateColumn && <th scope="col">{stateColumn}</th>}
            {current !== undefined && <th scope="col">{strings.table.now}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className={i === current ? "row-current" : ""}
              aria-current={i === current ? "true" : undefined}
            >
              {r.inputs.map((v, j) => (
                <td key={`i${j}`} className="cell-value">
                  {v}
                </td>
              ))}
              {r.outputs.map((v, j) => (
                <td key={`o${j}`} className="cell-value">
                  {v}
                </td>
              ))}
              {stateColumn && <td className="cell-state">{r.state ?? ""}</td>}
              {current !== undefined && (
                <td className="cell-now">{i === current ? strings.table.nowMark : ""}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {note && <p className="truth-table-note">{note}</p>}
    </div>
  );
}

/** Every input combination of a small combinational circuit, with the outputs the simulator gives. */
export function enumerateTable(circuit: Circuit): {
  inputColumns: string[];
  outputColumns: string[];
  rows: TableRow[];
} {
  const inputs = circuit.inputs.filter((p) => (circuit.nets[p.net]?.width ?? 1) === 1);
  if (inputs.length > 6) throw new RangeError("a truth table is for at most six inputs");
  const rows: TableRow[] = [];
  for (let combo = 0; combo < 1 << inputs.length; combo++) {
    const sim = new Simulator(circuit);
    const inValues: string[] = [];
    inputs.forEach((p, i) => {
      const bit = (combo >> (inputs.length - 1 - i)) & 1;
      sim.setInput(p.net, { width: 1, value: BigInt(bit), known: 1n });
      inValues.push(String(bit));
    });
    sim.settle();
    rows.push({
      inputs: inValues,
      outputs: circuit.outputs.map((o) => formatWord(sim.read(o.net))),
    });
  }
  return {
    inputColumns: inputs.map((p) => p.name),
    outputColumns: circuit.outputs.map((o) => o.name),
    rows,
  };
}

/** The row of an enumerated table that matches the inputs now, or undefined. */
export function rowFor(
  inputColumns: readonly string[],
  rows: readonly TableRow[],
  values: Readonly<Record<string, string>>,
): number | undefined {
  const i = rows.findIndex((r) =>
    inputColumns.every((c, j) => r.inputs[j] === "X" || r.inputs[j] === values[c]),
  );
  return i < 0 ? undefined : i;
}
