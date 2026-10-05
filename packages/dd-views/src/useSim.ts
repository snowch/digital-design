// Copyright © 2026 Chris Snow

// A settle-model simulator held for a view: inputs start at 0, every change settles, and the
// values are read back for the drawing and the table. The simulator is the only source of values.

import { useCallback, useMemo, useState } from "react";

import { Simulator, bit0, bit1, isKnown, parseWord, type Circuit, type Word } from "@dd/sim";

export interface SettleSim {
  readonly sim: Simulator;
  readonly values: readonly Word[];
  readonly converged: boolean;
  /** Flips a one-bit input (X counts as 0) and settles. */
  toggle(name: string): void;
  set(name: string, value: Word): void;
  /** Runs one clock cycle on `name` with the other inputs as they are. */
  clock(name: string): void;
  /** Sets every input to 0 in one go and settles once: two buttons released together. */
  releaseAll(): void;
  reset(): void;
}

/** Starting values for some inputs, as a lesson writes them: bits, a number or 0x hexadecimal. */
export type InitialInputs = Readonly<Record<string, string | number>>;

function fresh(circuit: Circuit, initial: InitialInputs = {}): Simulator {
  const sim = new Simulator(circuit);
  for (const input of circuit.inputs) {
    const width = circuit.nets[input.net]?.width ?? 1;
    const given = initial[input.name];
    sim.setInput(
      input.net,
      given !== undefined
        ? parseWord(String(given), width)
        : { width, value: 0n, known: (1n << BigInt(width)) - 1n },
    );
  }
  sim.settle();
  return sim;
}

export function useSettleSim(circuit: Circuit, initial?: InitialInputs): SettleSim {
  const [generation, setGeneration] = useState(0);
  const [sims] = useState(() => new Map<Circuit, Simulator>());
  const sim = useMemo(() => {
    let s = sims.get(circuit);
    if (!s) {
      sims.clear();
      s = fresh(circuit, initial);
      sims.set(circuit, s);
    }
    return s;
    // The starting values are read once per circuit, as the circuit itself is.
  }, [circuit, sims]);
  const bump = useCallback(() => setGeneration((g) => g + 1), []);
  const values = useMemo(() => sim.snapshotValues(), [sim, generation]);
  const converged = sim.lastSettle?.converged ?? true;
  return {
    sim,
    values,
    converged,
    toggle: (name) => {
      const current = sim.read(name);
      const next = isKnown(current) && current.value === 1n ? bit0 : bit1;
      sim.setInput(name, next);
      sim.settle();
      bump();
    },
    set: (name, value) => {
      sim.setInput(name, value);
      sim.settle();
      bump();
    },
    clock: (name) => {
      sim.clockCycle(name);
      bump();
    },
    releaseAll: () => {
      for (const input of circuit.inputs) {
        const width = circuit.nets[input.net]?.width ?? 1;
        sim.setInput(input.net, { width, value: 0n, known: (1n << BigInt(width)) - 1n });
      }
      sim.settle();
      bump();
    },
    reset: () => {
      sims.set(circuit, fresh(circuit, initial));
      bump();
    },
  };
}
