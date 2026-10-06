// Copyright © 2026 Christopher Snow

// The shared interaction primitives, extracted at Slice 2 under the rule of two (README.md):
// each is the domain-free part of an interaction that two lessons' figures already shared.
// Nothing here knows about circuits; the figures of a book (`@dd/dd-views` in snowch/digital-design) supply that.

export { DrillDown, drillLevels, type DrillDownProps, type DrillLevel } from "./DrillDown";
export { FaultInjector, type FaultInjectorProps } from "./FaultInjector";
export {
  PredictionChallenge,
  type PredictionChallengeProps,
  type PredictionOption,
} from "./PredictionChallenge";
export {
  StateInspector,
  type InspectorRow,
  type Reading,
  type StateInspectorProps,
} from "./StateInspector";
export { Stepper, type StepperProps } from "./Stepper";
export {
  AXIS_H,
  LANE_H,
  Timeline,
  layoutMarks,
  type TimelineGeometry,
  type TimelineMark,
  type TimelineProps,
} from "./Timeline";
export { useOverflows, useWidth } from "./useWidth";
