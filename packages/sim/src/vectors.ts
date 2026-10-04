// Test vectors and the diagnosis a failed one produces.
//
// A lesson's tests are data: for a combinational circuit, rows of inputs and the outputs they
// must produce; for a sequential one, a sequence of steps that set inputs, pulse a clock and
// expect outputs. The runner never says "Incorrect". It says which inputs fail, what the circuit
// produced, what was expected, and the component at which the divergence first appears: the
// gate that drives the wrong output, with the values on its inputs at that moment, and, where the
// test names an internal signal and what it should be, the earliest named signal that is wrong.

import { cone, Simulator, type SimulatorOptions } from "./simulator";
import { driverOf, type Circuit, type Component, type NetId } from "./circuit";
import { equal, formatWord, parseWord, unknown, type Word } from "./values";

/** A value in a vector: a number, a bigint, a bit string with X, or "X" for unknown. */
export type VectorValue = number | bigint | string;

export interface CombinationalVector {
  readonly label?: string;
  readonly inputs: Readonly<Record<string, VectorValue>>;
  readonly expect: Readonly<Record<string, VectorValue>>;
  /** Internal nets by name and what they should hold, for localising a divergence. */
  readonly internal?: Readonly<Record<string, VectorValue>>;
}

export interface SequenceStep {
  readonly label?: string;
  /** Inputs to set before the clock edge. */
  readonly set?: Readonly<Record<string, VectorValue>>;
  /** The clock input to pulse low-high-low after setting. Omit for no edge this step. */
  readonly clock?: string;
  /** Outputs expected after the step, with the clock back low. */
  readonly expect?: Readonly<Record<string, VectorValue>>;
  readonly internal?: Readonly<Record<string, VectorValue>>;
}

export type TestSuite =
  | { readonly kind: "combinational"; readonly vectors: readonly CombinationalVector[] }
  | { readonly kind: "sequence"; readonly steps: readonly SequenceStep[] };

export interface Divergence {
  /** The net that first disagrees, by name. */
  readonly net: string;
  readonly actual: string;
  readonly expected: string;
  /** The component that drives it, if any. */
  readonly component?: { readonly kind: string; readonly path: string };
  /** What that component saw on its inputs at the time, by port. */
  readonly inputsSeen: Readonly<Record<string, string>>;
  /** Component paths in the fan-in cone of the wrong output, nearest first, to look at next. */
  readonly cone: readonly string[];
}

export interface Failure {
  readonly index: number;
  readonly label: string;
  readonly inputs: Readonly<Record<string, string>>;
  readonly actual: Readonly<Record<string, string>>;
  readonly expected: Readonly<Record<string, string>>;
  readonly divergence?: Divergence;
  /** Set when the circuit never settled during this vector. */
  readonly oscillated?: boolean;
}

export interface Diagnosis {
  readonly passed: boolean;
  readonly total: number;
  readonly failures: readonly Failure[];
  /** Problems with the circuit itself that stop the tests running, as sentences. */
  readonly blocked?: string;
}

/** Runs a suite against a circuit and returns what to tell the learner. */
export function runSuite(
  circuit: Circuit,
  suite: TestSuite,
  options: SimulatorOptions = {},
): Diagnosis {
  try {
    return suite.kind === "combinational"
      ? runCombinational(circuit, suite.vectors, options)
      : runSequence(circuit, suite.steps, options);
  } catch (error) {
    return {
      passed: false,
      total:
        suite.kind === "combinational"
          ? suite.vectors.length
          : suite.steps.filter((s) => s.expect).length,
      failures: [],
      blocked: error instanceof Error ? error.message : String(error),
    };
  }
}

function runCombinational(
  circuit: Circuit,
  vectors: readonly CombinationalVector[],
  options: SimulatorOptions,
): Diagnosis {
  const failures: Failure[] = [];
  vectors.forEach((vector, index) => {
    const sim = new Simulator(circuit, { ...options, timeModel: "settle" });
    for (const [name, value] of Object.entries(vector.inputs)) {
      sim.setInput(name, toWord(sim, name, value));
    }
    const result = sim.settle();
    const failure = check(
      sim,
      index,
      vector.label ?? `vector ${index + 1}`,
      vector.inputs,
      vector.expect,
      vector.internal,
      !result.converged,
    );
    if (failure) failures.push(failure);
  });
  return { passed: failures.length === 0, total: vectors.length, failures };
}

function runSequence(
  circuit: Circuit,
  steps: readonly SequenceStep[],
  options: SimulatorOptions,
): Diagnosis {
  const failures: Failure[] = [];
  const sim = new Simulator(circuit, { ...options, timeModel: "settle" });
  const inputsNow: Record<string, VectorValue> = {};
  steps.forEach((step, index) => {
    for (const [name, value] of Object.entries(step.set ?? {})) {
      inputsNow[name] = value;
      sim.setInput(name, toWord(sim, name, value));
    }
    let oscillated = false;
    if (step.clock) {
      const { low, high } = sim.clockCycle(step.clock);
      oscillated = !low.converged || !high.converged || !(sim.lastSettle?.converged ?? true);
    } else {
      oscillated = !sim.settle().converged;
      sim.tick();
    }
    if (step.expect) {
      const failure = check(
        sim,
        index,
        step.label ?? `step ${index + 1}`,
        inputsNow,
        step.expect,
        step.internal,
        oscillated,
      );
      if (failure) failures.push(failure);
    }
  });
  const total = steps.filter((s) => s.expect).length;
  return { passed: failures.length === 0, total, failures };
}

function check(
  sim: Simulator,
  index: number,
  label: string,
  inputs: Readonly<Record<string, VectorValue>>,
  expect: Readonly<Record<string, VectorValue>>,
  internal: Readonly<Record<string, VectorValue>> | undefined,
  oscillated: boolean,
): Failure | undefined {
  const actual: Record<string, string> = {};
  const expected: Record<string, string> = {};
  const wrong: string[] = [];
  for (const [name, value] of Object.entries(expect)) {
    const want = toWord(sim, name, value);
    const got = sim.read(name);
    actual[name] = formatWord(got);
    expected[name] = formatWord(want);
    if (!equal(got, want)) wrong.push(name);
  }
  if (wrong.length === 0) return undefined;
  const shownInputs: Record<string, string> = {};
  for (const [name, value] of Object.entries(inputs))
    shownInputs[name] = formatWord(toWord(sim, name, value));
  const divergence = localise(sim, wrong, expected, internal);
  return {
    index,
    label,
    inputs: shownInputs,
    actual,
    expected,
    ...(divergence ? { divergence } : {}),
    ...(oscillated ? { oscillated: true } : {}),
  };
}

/**
 * Where the divergence first appears. If the test names internal nets with expected values, the
 * first of those (nearest the inputs) that is wrong wins; otherwise the wrong output's driver.
 */
function localise(
  sim: Simulator,
  wrongOutputs: readonly string[],
  expectedOutputs: Readonly<Record<string, string>>,
  internal: Readonly<Record<string, VectorValue>> | undefined,
): Divergence | undefined {
  const circuit = sim.circuit;
  const first = wrongOutputs[0];
  if (first === undefined) return undefined;
  const outputNet = sim.resolve(first);
  const coneComponents = cone(circuit, outputNet);
  // Internal nets the test knows about, ordered from the inputs outwards: the deeper into the
  // cone (further from the output), the earlier in the signal flow.
  if (internal) {
    const candidates = Object.entries(internal)
      .map(([name, value]) => {
        const net = sim.resolve(name);
        const want = toWord(sim, name, value);
        const got = sim.read(net);
        const depth = coneComponents.findIndex((c) => Object.values(c.outputs).includes(net));
        return { name, net, want, got, depth: depth < 0 ? -1 : depth };
      })
      .filter((c) => !equal(c.got, c.want))
      .sort((p, q) => q.depth - p.depth);
    const deepest = candidates[0];
    if (deepest)
      return describe(
        sim,
        deepest.net,
        deepest.name,
        formatWord(deepest.got),
        formatWord(deepest.want),
        coneComponents,
      );
  }
  return describe(
    sim,
    outputNet,
    first,
    formatWord(sim.read(outputNet)),
    expectedOutputs[first] ?? "?",
    coneComponents,
  );
}

function describe(
  sim: Simulator,
  net: NetId,
  name: string,
  actual: string,
  expected: string,
  coneComponents: readonly Component[],
): Divergence {
  const driver = driverOf(sim.circuit, net);
  const inputsSeen: Record<string, string> = {};
  if (driver) {
    for (const [port, inNet] of Object.entries(driver.inputs)) {
      inputsSeen[`${port} (${sim.circuit.nets[inNet]?.name ?? inNet})`] = formatWord(
        sim.read(inNet),
      );
    }
  }
  return {
    net: name,
    actual,
    expected,
    ...(driver ? { component: { kind: driver.kind, path: driver.path } } : {}),
    inputsSeen,
    cone: coneComponents.map((c) => c.path),
  };
}

function toWord(sim: Simulator, name: string, value: VectorValue): Word {
  const id = sim.resolve(name);
  const net = sim.circuit.nets[id];
  const width = net?.width ?? 1;
  if (typeof value === "string") return parseWord(value, width);
  if (typeof value === "bigint")
    return {
      width,
      value: value & ((1n << BigInt(width)) - 1n),
      known: (1n << BigInt(width)) - 1n,
    };
  if (Number.isNaN(value)) return unknown(width);
  return {
    width,
    value: BigInt(value) & ((1n << BigInt(width)) - 1n),
    known: (1n << BigInt(width)) - 1n,
  };
}
