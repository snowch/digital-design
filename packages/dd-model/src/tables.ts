// Copyright © 2026 Christopher Snow

// Module 2: a combinational circuit's truth table, worked out by the simulator, and the two
// questions the module asks of tables: do two circuits agree in every row, and in which pairs of
// rows does one input make no difference to the output.
//
// A figure that shows these is a view of these functions; the lessons' facts tests read the
// same functions, so a number in the prose is the number on the page.

import { Simulator, formatWord, type Circuit } from "@dd/sim";

export interface Row {
  /** Input values, in the circuit's input order, each "0" or "1". */
  readonly inputs: readonly string[];
  /** Output values, in the circuit's output order, as the simulator gives them. */
  readonly outputs: readonly string[];
}

export interface Table {
  readonly inputs: readonly string[];
  readonly outputs: readonly string[];
  /** Every combination, counting up in binary with the first input as the top bit. */
  readonly rows: readonly Row[];
}

/** Every row of a circuit of one-bit inputs (at most six), from the simulator. */
export function truthTableOf(circuit: Circuit): Table {
  const inputs = circuit.inputs;
  if (inputs.length > 6) throw new RangeError("a truth table is for at most six inputs");
  const rows: Row[] = [];
  for (let combo = 0; combo < 1 << inputs.length; combo++) {
    const sim = new Simulator(circuit);
    const values = inputs.map((_, i) => String((combo >> (inputs.length - 1 - i)) & 1));
    inputs.forEach((p, i) =>
      sim.setInput(p.net, { width: 1, value: BigInt(values[i] ?? "0"), known: 1n }),
    );
    sim.settle();
    rows.push({ inputs: values, outputs: circuit.outputs.map((o) => formatWord(sim.read(o.net))) });
  }
  return { inputs: inputs.map((p) => p.name), outputs: circuit.outputs.map((o) => o.name), rows };
}

export interface Comparison {
  readonly inputs: readonly string[];
  /** The outputs compared: the first circuit's, by name. */
  readonly outputs: readonly string[];
  /**
   * Per row: the inputs, and the first and second circuit's outputs, each written as its
   * outputs' values in `outputs` order separated by spaces ("1" for one output, "1 0" for two).
   */
  readonly rows: readonly { inputs: readonly string[]; first: string; second: string }[];
  /** Indexes of the rows where any output differs. */
  readonly differ: readonly number[];
}

/**
 * Two circuits' outputs, row by row. The second circuit's inputs and outputs are matched by
 * name, so the two may list them in different orders; both must have the same names.
 */
export function compareCircuits(first: Circuit, second: Circuit): Comparison {
  const a = truthTableOf(first);
  const b = truthTableOf(second);
  const sameNames = (x: readonly string[], y: readonly string[]) =>
    x.length === y.length && x.every((n) => y.includes(n));
  if (!sameNames(a.inputs, b.inputs) || !sameNames(a.outputs, b.outputs))
    throw new RangeError("two circuits compared row by row need the same inputs and outputs");
  const rows = a.rows.map((r) => {
    const values = Object.fromEntries(a.inputs.map((n, i) => [n, r.inputs[i]]));
    const match = b.rows.find((s) => b.inputs.every((n, i) => s.inputs[i] === values[n]));
    const second = a.outputs.map((n) => match?.outputs[b.outputs.indexOf(n)] ?? "X");
    return { inputs: r.inputs, first: r.outputs.join(" "), second: second.join(" ") };
  });
  const differ = rows.flatMap((r, i) => (r.first === r.second ? [] : [i]));
  return { inputs: a.inputs, outputs: a.outputs, rows, differ };
}

export interface Pair {
  /** The other inputs' values, by name. */
  readonly others: Readonly<Record<string, string>>;
  /** The first output with the chosen input at 0, and at 1. */
  readonly at0: string;
  readonly at1: string;
  /** Whether the chosen input changes the output in this pair. */
  readonly matters: boolean;
}

/**
 * The rows of a table in pairs that differ only in `input`, in table order. Where the two rows
 * of a pair give the same output, that input makes no difference there and the pair can be
 * written as one row; that is what simplifying a table by hand looks for.
 */
export function pairsFor(table: Table, input: string): Pair[] {
  const at = table.inputs.indexOf(input);
  if (at < 0) throw new RangeError(`the table has no input ${input}`);
  const out: Pair[] = [];
  for (const r of table.rows) {
    if (r.inputs[at] !== "0") continue;
    const partner = table.rows.find((s) =>
      s.inputs.every((v, i) => (i === at ? v === "1" : v === r.inputs[i])),
    );
    const others: Record<string, string> = {};
    table.inputs.forEach((n, i) => {
      if (i !== at) others[n] = r.inputs[i] ?? "0";
    });
    const at0 = r.outputs[0] ?? "X";
    const at1 = partner?.outputs[0] ?? "X";
    out.push({ others, at0, at1, matters: at0 !== at1 });
  }
  return out;
}
