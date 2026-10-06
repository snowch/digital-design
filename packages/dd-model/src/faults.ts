// Copyright © 2026 Chris Snow

// The fault library: named ways to break a circuit, so a lesson can ask "what happens now?"
//
// Each fault takes a circuit and returns a new one; the original is untouched. A fault is applied
// to the model, everything downstream recomputes in the simulator, and a restore is the original
// circuit again. The names are the ones the curriculum's fault library uses.

import type { Circuit, Component, NetId } from "@dd/sim";

export interface Fault {
  readonly id: string;
  readonly label: string;
  /** What the fault models, for the lesson's explanation. */
  readonly explanation: string;
  apply(circuit: Circuit): Circuit;
}

function netId(circuit: Circuit, name: string): NetId {
  const net = circuit.nets.find((n) => n.name === name);
  if (!net) throw new RangeError(`${circuit.name} has no net called ${JSON.stringify(name)}`);
  return net.id;
}

/**
 * Where a fault's added part sits: beside the wire it acts on. Module 5: a wire inside a block
 * (`next-state-logic/R4`) gets its part inside that block, so the block, opened, shows it.
 */
function faultPath(netName: string, kind: string): string {
  const cut = netName.lastIndexOf("/");
  const scope = cut < 0 ? "" : `${netName.slice(0, cut)}/`;
  const local = cut < 0 ? netName : netName.slice(cut + 1);
  return `${scope}fault/${kind}_${local.replace(/[^A-Za-z0-9]/g, "_")}`;
}

/** Moves the driver of `net` onto a fresh, dangling net and returns the driver's new form. */
function detach(circuit: Circuit, net: NetId): { components: Component[]; nets: Circuit["nets"] } {
  const original = circuit.nets[net];
  if (!original) throw new RangeError(`no net ${net}`);
  const dangling = { id: circuit.nets.length, name: `${original.name}.cut`, width: original.width };
  const components = circuit.components.map((c) => {
    const outputs = Object.fromEntries(
      Object.entries(c.outputs).map(([port, n]) => [port, n === net ? dangling.id : n]),
    );
    return { ...c, outputs };
  });
  return { components, nets: [...circuit.nets, dangling] };
}

/** The wire named `net` is cut: whatever drove it no longer reaches its readers, who see X. */
export function brokenWire(netName: string): Fault {
  return {
    id: `broken-wire:${netName}`,
    label: `Break the wire ${netName}`,
    explanation: "A cut wire carries nothing, so every gate that reads it now sees X.",
    apply(circuit) {
      const net = netId(circuit, netName);
      const { components, nets } = detach(circuit, net);
      const open: Component = {
        id: components.length,
        kind: "open",
        name: `open_${netName.replace(/[^A-Za-z0-9]/g, "_")}`,
        path: faultPath(netName, "open"),
        inputs: {},
        outputs: { y: net },
        params: { width: circuit.nets[net]?.width ?? 1 },
      };
      return { ...circuit, nets, components: [...components, open] };
    },
  };
}

/** An inverter is slipped into the wire named `net`: its readers see the opposite value. */
export function invertedSignal(netName: string): Fault {
  return {
    id: `inverted:${netName}`,
    label: `Invert ${netName}`,
    explanation:
      "An inverter slipped into the wire inverts the signal for every gate that reads it.",
    apply(circuit) {
      const net = netId(circuit, netName);
      const { components, nets } = detach(circuit, net);
      const cut = nets.length - 1;
      const inverter: Component = {
        id: components.length,
        kind: "not",
        name: "fault_not",
        path: faultPath(netName, "not"),
        inputs: { a: cut },
        outputs: { y: net },
      };
      return { ...circuit, nets, components: [...components, inverter] };
    },
  };
}

/** The wire named `net` is held at a fixed value whatever drives it. */
export function stuckAt(netName: string, value: 0 | 1): Fault {
  return {
    id: `stuck:${netName}:${value}`,
    label: `Hold ${netName} at ${value}`,
    explanation:
      "The signal is held at one value whatever drives it, like a shorted or jammed input.",
    apply(circuit) {
      const net = netId(circuit, netName);
      const { components, nets } = detach(circuit, net);
      const constant: Component = {
        id: components.length,
        kind: "const",
        name: `stuck_${value}`,
        path: faultPath(netName, "stuck"),
        inputs: {},
        outputs: { y: net },
        params: { width: circuit.nets[net]?.width ?? 1, value: String(value) },
      };
      return { ...circuit, nets, components: [...components, constant] };
    },
  };
}

/** The gate at `path` becomes a different kind of gate with the same connections. */
export function wrongGate(path: string, kind: string): Fault {
  return {
    id: `wrong-gate:${path}:${kind}`,
    label: `Replace ${path} with ${kind.toUpperCase()}`,
    explanation: "One gate is the wrong kind, as a wrong part fitted or a design slip would be.",
    apply(circuit) {
      if (!circuit.components.some((c) => c.path === path)) {
        throw new RangeError(`${circuit.name} has no component at ${path}`);
      }
      return {
        ...circuit,
        components: circuit.components.map((c) => (c.path === path ? { ...c, kind } : c)),
      };
    },
  };
}

/** Applies several faults in order. */
export function applyFaults(circuit: Circuit, faults: readonly Fault[]): Circuit {
  return faults.reduce((c, f) => f.apply(c), circuit);
}
