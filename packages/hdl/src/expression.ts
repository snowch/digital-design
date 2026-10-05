// Module 2: a combinational circuit's outputs, each as one expression in the subset's operators.
//
// `generate` writes one `assign` per gate, which is the text a drawing round-trips through. A
// lesson about expressions wants the other form: each output written as one line, with every
// gate between the inputs and that output folded into it, `ALARM = WARM & ~DOOR`. A gate whose
// output feeds two places is written out in both, so the expression says what the output is and
// not how many gates make it. The line elaborates back to a circuit with the same truth table.

import type { Circuit, Component, NetId } from "@dd/sim";

export interface OutputExpression {
  readonly output: string;
  readonly expression: string;
}

type Op = "~" | "&" | "|" | "^" | "atom";

interface Built {
  readonly text: string;
  readonly op: Op;
}

const BINARY: Readonly<Record<string, "&" | "|" | "^">> = { and: "&", or: "|", xor: "^" };
const INVERTED: Readonly<Record<string, "&" | "|" | "^">> = { nand: "&", nor: "|", xnor: "^" };

/** Each output of a gate circuit as one expression over its inputs. Throws on a loop or a block. */
export function expressionsOf(circuit: Circuit): OutputExpression[] {
  const drivers = new Map<NetId, Component>();
  for (const c of circuit.components)
    for (const net of Object.values(c.outputs)) drivers.set(net, c);
  const inputNames = new Map(circuit.inputs.map((i) => [i.net, i.name]));
  const visiting = new Set<NetId>();

  const operands = (c: Component): NetId[] =>
    Object.keys(c.inputs)
      .sort()
      .map((k) => c.inputs[k] as NetId);

  // An operand keeps its parentheses unless it is a name, an inversion, or the same operator.
  const wrap = (b: Built, op: Op) =>
    b.op === "atom" || b.op === "~" || b.op === op ? b.text : `(${b.text})`;

  const build = (net: NetId): Built => {
    const name = inputNames.get(net);
    if (name !== undefined) return { text: name, op: "atom" };
    const c = drivers.get(net);
    if (!c) throw new Error(`nothing drives ${circuit.nets[net]?.name ?? net}`);
    if (visiting.has(net)) throw new Error("a circuit with a loop has no single expression");
    visiting.add(net);
    try {
      if (c.kind === "not") {
        const a = build(operands(c)[0] as NetId);
        return { text: `~${a.op === "atom" || a.op === "~" ? a.text : `(${a.text})`}`, op: "~" };
      }
      if (c.kind === "buf") return build(operands(c)[0] as NetId);
      const plain = BINARY[c.kind];
      if (plain) {
        return {
          text: operands(c)
            .map((n) => wrap(build(n), plain))
            .join(` ${plain} `),
          op: plain,
        };
      }
      const inverted = INVERTED[c.kind];
      if (inverted) {
        const inner = operands(c)
          .map((n) => wrap(build(n), inverted))
          .join(` ${inverted} `);
        return { text: `~(${inner})`, op: "~" };
      }
      if (c.kind === "const")
        return { text: `1'b${String(c.params?.["value"] ?? "0")}`, op: "atom" };
      throw new Error(`a ${c.kind} has no place in an expression of gates`);
    } finally {
      visiting.delete(net);
    }
  };

  return circuit.outputs.map((o) => ({ output: o.name, expression: build(o.net).text }));
}

/** The circuit as a module with one `assign` per output, each output's whole expression. */
export function expressionModule(circuit: Circuit): string {
  const id = (name: string) => name.replace(/[^A-Za-z0-9_]/g, "_");
  const ports = [
    ...circuit.inputs.map((i) => `  input logic ${id(i.name)}`),
    ...circuit.outputs.map((o) => `  output logic ${id(o.name)}`),
  ];
  const body = expressionsOf(circuit).map((e) => `  assign ${id(e.output)} = ${e.expression};`);
  return [`module ${id(circuit.name)} (`, ports.join(",\n"), ");", ...body, "endmodule", ""].join(
    "\n",
  );
}
