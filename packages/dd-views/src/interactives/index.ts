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
// Scenes and sums on paper, for any lesson
import { ColumnSum } from "./ColumnSum";
import { SceneFigure } from "./SceneFigure";
// Module 7, the ALU
import { CarrySteps } from "./CarrySteps";
import { SuiteLab } from "./SuiteLab";

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
  // Scenes and sums on paper, for any lesson
  scene: SceneFigure,
  "column-sum": ColumnSum,
  // Module 7, the ALU
  "carry-steps": CarrySteps,
  "suite-lab": SuiteLab,
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
  ColumnSum,
  SceneFigure,
  CarrySteps,
  SuiteLab,
};
export { carryRun, carryAnswer } from "./CarrySteps";
export { runAluSuite, firstCatch } from "./SuiteLab";
export { compareAnswer } from "./CircuitCompare";
export { experiment, type Draw } from "./SetupHold";
export { runScript, outputsPerStep, Step } from "./script";
export { toFault } from "./FaultLab";
export { answerOf } from "./ReadingPrediction";
