# @dd/primitives

Shared interaction primitives: the parts of an interaction that do not know what they are about.
Each was built domain-specific inside `@dd/dd-views` first, and extracted on 6 October 2026, after
Slice 2 (Module 5's `state-machines` lesson), under the rule of two (`docs/inventory.md`, section
5.2): a primitive is extracted only once a second consumer needs it, and it is extracted from the
second consumer.

Nothing here imports the simulator, the model or the lesson runtime: a primitive takes its words
and its content from the figure that uses it. Each keeps the markup and class names its figures
had, so the course's stylesheet and stored screenshots did not change.

| Primitive | What it is | Its figures in `@dd/dd-views` |
| --- | --- | --- |
| `PredictionChallenge` | the options, "Check my prediction", the verdict's place and "Predict again" | `Prediction`, `ReadingPrediction`, `CircuitCompare`, `CarrySteps`, `SuiteLab` |
| `FaultInjector` | the choice of a fault, with no fault first, which restores the model | `FaultLab`, `SuiteLab` |
| `Stepper` | a slider over a run's steps, its "k of n", optional buttons for back, next and last, and a status line | `CircuitExplorer`, `CarrySteps` |
| `Timeline` | lanes over a time axis: the lane names, marked times laid out so no two labels touch, a cursor and its slider, scrolling that keeps the cursor in view | `TimingDiagram`, which draws the levels, bus values and shaded spans into it |
| `StateInspector` | a table of readings at one moment: named rows, a value per column | `SignalTable` (in `CircuitView`) and the values at a timing diagram's cursor |
| `DrillDown` | the trail of opened levels, and `drillLevels`, which names them | `CircuitView`'s trail into blocks |

`useWidth` and `useOverflows`, the page-width hooks the timeline needs, live here too; `@dd/dd-views`
re-exports them.

Left out: the row of input buttons that Module 5's note listed as `InputPanel`. Both of its uses
are in one module's state-machine figure, one consumer short of the rule of two.

`packages/primitives/src/primitives.test.tsx` tests each primitive alone, with no circuit.
