// Copyright © 2026 Christopher Snow

// A row of copies of one circuit: the way a test reaches a width the learner never drew.
//
// A slice is a circuit for one bit of a word (one bit of A, one bit of B, a carry in; one bit of
// the result, a carry out). `chainSlices` makes `count` copies of it and wires them into a circuit
// for words of `count` bits: copy k takes bit k of each word input and gives bit k of each word
// output, the inputs every copy shares go to every copy, and each copy's carry out is the next
// copy's carry in. The carry into copy 0 and the carry out of the last copy are the chain's own
// ports, under the slice's names for them. Each copy is a block, `bit0` to `bitN`, so a failed test
// names the bit whose slice went wrong and what that slice saw.

import type { Circuit, Component, CompositeDef, Net, NetId, PortRef } from "@dd/sim";
import { validate } from "@dd/sim";

export interface ChainSpec {
  /** One-bit inputs of the slice that become words: copy k takes bit k. */
  readonly bitwise: readonly string[];
  /** One-bit outputs of the slice that become words: copy k gives bit k. */
  readonly outputs: readonly string[];
  /** Inputs every copy shares. */
  readonly shared: readonly string[];
  /** The slice's carry ports: copy k's `out` drives copy k+1's `in`. */
  readonly carry?: { readonly in: string; readonly out: string };
}

export function chainSlices(slice: Circuit, count: number, spec: ChainSpec): Circuit {
  if (count < 1) throw new RangeError("a chain needs at least one slice");
  const nets: Net[] = [];
  const components: Component[] = [];
  const composites: CompositeDef[] = [];
  const inputs: PortRef[] = [];
  const outputs: PortRef[] = [];
  const net = (name: string, width = 1): NetId => {
    const id = nets.length;
    nets.push({ id, name, width });
    return id;
  };
  const component = (c: Omit<Component, "id">): void => {
    components.push({ ...c, id: components.length } as Component);
  };
  const sliceInput = (name: string): NetId => {
    const port = slice.inputs.find((p) => p.name === name);
    if (!port) throw new RangeError(`the slice has no input ${name}`);
    return port.net;
  };
  const sliceOutput = (name: string): NetId => {
    const port = slice.outputs.find((p) => p.name === name);
    if (!port) throw new RangeError(`the slice has no output ${name}`);
    return port.net;
  };

  // The chain's own ports: words for the bitwise ones, the shared ones as they are, the carries.
  const wordIn = new Map(spec.bitwise.map((n) => [n, net(n, count)] as const));
  const sharedIn = new Map(spec.shared.map((n) => [n, net(n)] as const));
  for (const [name, id] of [...wordIn, ...sharedIn]) inputs.push({ name, net: id });
  let carry: NetId | undefined;
  if (spec.carry) {
    carry = net(spec.carry.in);
    inputs.push({ name: spec.carry.in, net: carry });
  }
  const outBits = new Map(spec.outputs.map((n) => [n, [] as NetId[]] as const));

  for (let k = 0; k < count; k++) {
    const prefix = `bit${k}`;
    const map = new Map<NetId, NetId>();
    // Ports first: a bitwise input is bit k of the chain's word, a shared input is the chain's
    // own net, and the carry in is the previous copy's carry out.
    for (const name of spec.bitwise) {
      const bitNet = net(`${prefix}/${name}`);
      component({
        kind: "bit",
        name: `take${name}${k}`,
        path: `take${name}${k}`,
        inputs: { a: wordIn.get(name) as NetId },
        outputs: { y: bitNet },
        params: { index: k },
      });
      map.set(sliceInput(name), bitNet);
    }
    for (const name of spec.shared) map.set(sliceInput(name), sharedIn.get(name) as NetId);
    if (spec.carry && carry !== undefined) map.set(sliceInput(spec.carry.in), carry);
    for (const n of slice.nets) {
      if (!map.has(n.id)) map.set(n.id, net(`${prefix}/${n.name}`, n.width));
    }
    const at = (id: NetId) => map.get(id) as NetId;
    const remap = (ports: Readonly<Record<string, NetId>>) =>
      Object.fromEntries(Object.entries(ports).map(([p, id]) => [p, at(id)]));
    for (const c of slice.components) {
      component({
        ...c,
        path: `${prefix}/${c.path}`,
        inputs: remap(c.inputs),
        outputs: remap(c.outputs),
      });
    }
    for (const c of slice.composites) {
      composites.push({
        ...c,
        path: `${prefix}/${c.path}`,
        inputs: remap(c.inputs),
        outputs: remap(c.outputs),
      });
    }
    composites.push({
      path: prefix,
      kind: "slice",
      name: prefix,
      inputs: Object.fromEntries(slice.inputs.map((p) => [p.name, at(p.net)])),
      outputs: Object.fromEntries(slice.outputs.map((p) => [p.name, at(p.net)])),
    });
    // Each output bit leaves its copy through a plain wire part inside the copy, on a net named
    // for it (bit3.Y), so a test can name that bit and a wrong one is reported at the copy.
    for (const name of spec.outputs) {
      const out = net(`${prefix}.${name}`);
      component({
        kind: "buf",
        name: `out${name}`,
        path: `${prefix}/out${name}`,
        inputs: { a: at(sliceOutput(name)) },
        outputs: { y: out },
      });
      outBits.get(name)?.push(out);
    }
    if (spec.carry) carry = at(sliceOutput(spec.carry.out));
  }

  for (const [name, bits] of outBits) {
    const w = net(name, count);
    component({
      kind: "join",
      name: `join${name}`,
      path: `join${name}`,
      inputs: Object.fromEntries(bits.map((n, i) => [String.fromCharCode(97 + i), n])),
      outputs: { y: w },
      params: { width: count },
    });
    outputs.push({ name, net: w });
  }
  if (spec.carry && carry !== undefined) outputs.push({ name: spec.carry.out, net: carry });

  const circuit: Circuit = {
    name: `${slice.name}-x${count}`,
    nets,
    components,
    inputs,
    outputs,
    composites,
  };
  const problems = validate(circuit);
  if (problems.length) throw new Error(`the chain is not well formed:\n  ${problems.join("\n  ")}`);
  return circuit;
}
