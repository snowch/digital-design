# @dd/primitives

Shared interaction primitives: Stepper, Timeline, StateInspector, DrillDown, PredictionChallenge,
FaultInjector.

**Empty on purpose until Slice 2.** The rule of two (docs/inventory.md, section 5.2): no shared
primitive is extracted until a second consumer needs it, and it is extracted from the second
consumer, not the first. Slice 1 builds every interaction domain-specific inside `@dd/views`.
Slice 2 is the second consumer, and the extraction happens there, after Checkpoint 2, with both
slices' tests green afterwards.
