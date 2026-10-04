// Scripted runs of a circuit in the settle model, shared by the prediction and the fault lab:
// set inputs, pulse a clock or settle and tick, step by step, recording the trace.

import { z } from "zod";

import { Simulator, parseWord, type Circuit, type Word } from "@dd/sim";

export const Step = z.object({
  label: z.string().optional(),
  set: z.record(z.string(), z.union([z.number(), z.string()])).optional(),
  clock: z.string().optional(),
});
export type Step = z.infer<typeof Step>;

export function toWord(circuit: Circuit, name: string, value: number | string): Word {
  const net = circuit.inputs.find((i) => i.name === name)?.net;
  const width = net !== undefined ? (circuit.nets[net]?.width ?? 1) : 1;
  return parseWord(String(value), width);
}

/** Runs the steps as the test runner would, returning the simulator with its trace. */
export function runScript(circuit: Circuit, steps: readonly Step[]): Simulator {
  const sim = new Simulator(circuit);
  for (const step of steps) {
    for (const [name, value] of Object.entries(step.set ?? {}))
      sim.setInput(name, toWord(circuit, name, value));
    if (step.clock) sim.clockCycle(step.clock);
    else {
      sim.settle();
      sim.tick(step.label ?? "");
    }
  }
  return sim;
}

/** The outputs after each step of a run, as the test runner's expectations would state them. */
export function outputsPerStep(circuit: Circuit, steps: readonly Step[]): Record<string, Word>[] {
  const sim = new Simulator(circuit);
  const out: Record<string, Word>[] = [];
  for (const step of steps) {
    for (const [name, value] of Object.entries(step.set ?? {}))
      sim.setInput(name, toWord(circuit, name, value));
    if (step.clock) sim.clockCycle(step.clock);
    else {
      sim.settle();
      sim.tick(step.label ?? "");
    }
    out.push(sim.outputs());
  }
  return out;
}
