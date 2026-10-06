// Copyright © 2026 Christopher Snow

// Module 8's circuits, by the id a lesson names them with: the datapath at each stage, placed for
// the figures that draw it. A figure that runs a program or starts from given registers builds the
// same circuit with them (`placedDatapath`), so the drawing is the library's.

import type { Circuit } from "@dd/sim";

import { datapathCircuit, type DatapathOptions, type Stage } from "./datapath";

type At = Readonly<Record<string, readonly [number, number]>>;
type Place = (circuit: Circuit, at: At) => Circuit;

/** Hand-placed drawings of each stage's top level, in grid cells. */
export const DATAPATH_AT: Readonly<Record<Stage, At>> = {
  jobs: {},
  constants: {},
  fetch: {},
  memory: {},
  full: {},
};

/** Hand-placed insides of Module 8's blocks a learner opens, by kind. */
export const DATAPATH_INSIDE: Readonly<Record<string, At>> = {};

let placeFn: Place | undefined;

/** The datapath at a stage, placed as its figure draws it, with a program and registers. */
export function placedDatapath(options: DatapathOptions): Circuit {
  const circuit = datapathCircuit(options);
  const at = DATAPATH_AT[options.stage];
  return placeFn && Object.keys(at).length ? placeFn(circuit, at) : circuit;
}

export function datapathLibrary(place: Place): Readonly<Record<string, () => Circuit>> {
  placeFn = place;
  return {
    "datapath-jobs": () => placedDatapath({ stage: "jobs" }),
    "datapath-constants": () => placedDatapath({ stage: "constants" }),
    "datapath-fetch": () => placedDatapath({ stage: "fetch" }),
    "datapath-memory": () => placedDatapath({ stage: "memory" }),
    "datapath-full": () => placedDatapath({ stage: "full" }),
  };
}
