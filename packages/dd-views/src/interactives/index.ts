import type { ComponentType } from "react";

import type { InteractiveProps } from "@dd/lesson-runtime";

import { BitInspector } from "./BitInspector";
import { CircuitExplorer } from "./CircuitExplorer";
import { CircuitText } from "./CircuitText";
import { FaultLab } from "./FaultLab";
import { Interpretations } from "./Interpretations";
import { LatchInternals } from "./LatchInternals";
import { NoisySignal } from "./NoisySignal";
import { Prediction } from "./Prediction";
import { ReadingPrediction } from "./ReadingPrediction";
import { SetupHold } from "./SetupHold";
import { SignalPath } from "./SignalPath";
import { TruthTableView } from "./TruthTableView";
// Module 2
import { CircuitCompare } from "./CircuitCompare";
import { InputPairs } from "./InputPairs";

/** The interactives lessons may name by kind. */
export const INTERACTIVES: Readonly<Record<string, ComponentType<InteractiveProps>>> = {
  "circuit-explorer": CircuitExplorer,
  "circuit-text": CircuitText,
  prediction: Prediction,
  "truth-table": TruthTableView,
  "fault-lab": FaultLab,
  "latch-internals": LatchInternals,
  "setup-hold": SetupHold,
  "noisy-signal": NoisySignal,
  "bit-inspector": BitInspector,
  interpretations: Interpretations,
  "reading-prediction": ReadingPrediction,
  "signal-path": SignalPath,
  // Module 2
  "circuit-compare": CircuitCompare,
  "input-pairs": InputPairs,
};

export {
  BitInspector,
  CircuitExplorer,
  Interpretations,
  NoisySignal,
  ReadingPrediction,
  CircuitText,
  FaultLab,
  LatchInternals,
  Prediction,
  SetupHold,
  SignalPath,
  TruthTableView,
  CircuitCompare,
  InputPairs,
};
export { compareAnswer } from "./CircuitCompare";
export { experiment, type Draw } from "./SetupHold";
export { runScript, outputsPerStep, Step } from "./script";
export { toFault } from "./FaultLab";
export { answerOf } from "./ReadingPrediction";
