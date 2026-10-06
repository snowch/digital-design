# The platform

What the course shares with any interactive book built the same way, and what is digital
design's own. `docs/inventory.md` records why the layers are what they are (section 5) and where
each pattern came from (sections 3 and 5.2); this file is the layers as built.

## The packages

| Package | What it holds | It imports |
| --- | --- | --- |
| `packages/lesson-schema` | the lesson data format, the platform's contract: a lesson's ten sections, its interactives by kind, its challenges and their tests, hints, the originality note, the term gate | nothing of the course |
| `packages/lesson-runtime` | a lesson rendered from its data: the ten sections, the time-model badges and notes, the hint ladder, the challenge runner, learner state kept in the browser and re-verified on load | `lesson-schema` |
| `packages/primitives` | the shared interaction primitives (below and its README) | nothing of the course |
| `packages/sim` | the simulation engine: nets and components, the stepped, clocked and gate-delay models, traces, snapshots, test sequences and their diagnosis | nothing |
| `packages/dd-model` | the course's component library on the engine: gates, latches, flip-flops, registers, adders, the ALU, state machines, memories, faults, graders | `sim` |
| `packages/hdl` | the SystemVerilog subset: parser, elaborator to the engine's circuits, generator back to text, the construct gate | `sim`, `dd-model` |
| `packages/dd-views` | the course's figures: the circuit view and its drawing, the timing diagram, every interactive a lesson names, the challenge editors, the view strings | the six above |
| `content/lessons` | the lessons, as data | `lesson-schema`, and names `dd-views`' figures by kind |
| `apps/course` | the shell: routes, the list of lessons, the preface, the pager | the rest |

The platform is the first three: a book other than this one would bring its own engine, model
and figures, and keep the schema, the runtime and the primitives. The runtime knows a book only
through the `Book` it is given (`createBook` in `dd-views`): the lessons, a registry of figures by
kind, the challenge editors, a grader, and the time-model notes. A lesson names a figure by its
kind and gives it props, which the figure checks against its own schema.

The packages live in this repository until a second book uses them. `snowch/learning-platform`
holds the contract as documents and the cross-book check; the packages move there when a second
book consumes them, and not before (`docs/inventory.md`, section 5.7).

## The shared primitives

Extracted on 6 October 2026, after Slice 2, under the rule of two: each was built inside
`dd-views` first, and moved once a second lesson's figures needed it. A primitive takes its words
and its content from the figure that uses it, and keeps the markup and class names its figures
had, so nothing on the page changed: every lesson rendered to the same HTML before and after,
but for a `value` on two figures' radio buttons, which the other three prediction figures already
had.

| Primitive | Slice 1, Module 4's `remember`, uses it in | Module 5, which holds Slice 2, uses it in |
| --- | --- | --- |
| `PredictionChallenge` | its predictions | every lesson's predictions |
| `FaultInjector` | its fault lab | the counter's and the controller's fault labs |
| `Stepper` | its stepped explorers | the counters lesson's add-one figure |
| `Timeline` | its timing diagrams and the flip-flop's inside in time | the predictions' timing diagrams and the state machine's trace |
| `StateInspector` | the signal tables and the values at a timing diagram's cursor | the same |
| `DrillDown` | the flip-flop opened to its latches and gates | the controller opened to its next-state logic |

Every other lesson's figures of the same kinds use them too.

`packages/primitives/README.md` says what each is.

## What was left alone

- **The author's existing books.** They share the interaction vocabulary and the lesson format
  with this course, not code or look (`docs/inventory.md`, section 0).
- **Two candidates that are not primitives.** Running a challenge's tests belongs to the runtime's
  challenge runner, which every lesson uses; replay is the engine's (snapshots, traces, a recorded
  seed), shown through the stepper and a reset (`docs/inventory.md`, section 5.2).
- **The state machine's row of input buttons**, Module 5's `InputPanel` candidate: both of its
  uses are in one module's figure, one consumer short of the rule of two.
