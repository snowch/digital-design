// Copyright © 2026 Christopher Snow

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
// Module 5: a state machine shown as diagram, table, circuit, trace and text at once.
import { StateMachine } from "./StateMachine";
// Module 6
import { MemoryExplorer } from "./MemoryExplorer";
// Module 7, the ALU
import { CarrySteps } from "./CarrySteps";
import { SuiteLab } from "./SuiteLab";
// Module 8, the datapath
import { DatapathFigure } from "./DatapathFigure";
// Module 9, control
import { ControlTable, KindEdges, KindMap } from "./ControlViews";

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
  // Module 5
  "state-machine": StateMachine,
  // Module 6
  "memory-explorer": MemoryExplorer,
  // Module 7, the ALU
  "carry-steps": CarrySteps,
  "suite-lab": SuiteLab,
  // Module 8, the datapath
  datapath: DatapathFigure,
  // Module 9, control
  "control-table": ControlTable,
  "kind-map": KindMap,
  "kind-edges": KindEdges,
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
  MemoryExplorer,
  CarrySteps,
  SuiteLab,
  DatapathFigure,
  ControlTable,
  KindMap,
  KindEdges,
};
export { kindMap, kindSequences, signalCell, opText, edgeText } from "./ControlViews";
export { carryRun, carryAnswer } from "./CarrySteps";
export { runAluSuite, firstCatch } from "./SuiteLab";
export { compareAnswer } from "./CircuitCompare";
export { experiment, type Draw } from "./SetupHold";
export { runScript, outputsPerStep, Step } from "./script";
export { toFault } from "./FaultLab";
export { answerOf } from "./ReadingPrediction";
export { StateMachine, StateDiagram, MachineTable, conditionText } from "./StateMachine";
