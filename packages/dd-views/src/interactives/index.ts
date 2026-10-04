import type { ComponentType } from "react";

import type { InteractiveProps } from "@dd/lesson-runtime";

import { CircuitExplorer } from "./CircuitExplorer";
import { FaultLab } from "./FaultLab";
import { LatchInternals } from "./LatchInternals";
import { Prediction } from "./Prediction";
import { SetupHold } from "./SetupHold";
import { TruthTableView } from "./TruthTableView";

/** The interactives lessons may name by kind. */
export const INTERACTIVES: Readonly<Record<string, ComponentType<InteractiveProps>>> = {
  "circuit-explorer": CircuitExplorer,
  prediction: Prediction,
  "truth-table": TruthTableView,
  "fault-lab": FaultLab,
  "latch-internals": LatchInternals,
  "setup-hold": SetupHold,
};

export { CircuitExplorer, FaultLab, LatchInternals, Prediction, SetupHold, TruthTableView };
export { experiment, type Draw } from "./SetupHold";
export { runScript, outputsPerStep, Step } from "./script";
