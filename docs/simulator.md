# The simulator

What `packages/sim` models, what it refuses to model, and the invariants every view and test
relies on. The engine is plain TypeScript with no DOM; `packages/dd-model` builds the course's
circuits on it, `packages/hdl` turns text into circuits and back, and `packages/dd-views` draws
what the engine produced and nothing else.

## Values

A signal is a `Word`: a width, a value and a mask of which bits are known. A bit is 0, 1 or X,
where X means the model cannot decide. The gates use Kleene logic: `AND(0, X)` is 0, `AND(1, X)`
is X, `NOT(X)` is X. X is the honest answer to a question the model cannot settle, and the views
show it as a dashed wire or a hatched band with the letter beside it, never as a colour alone.

## The netlist

A `Circuit` is data: nets (named wires), components (a primitive kind, an instance name, a path
in the hierarchy, and the net on each port), the nets that are inputs and outputs, and the
composites (a path, a kind such as `d-latch`, and the nets on its ports). The hierarchy lives in
the paths: the flip-flop's slave latch's Q gate is `dff/slave/sr/norQ`. The simulator sees only
the leaves; a view can draw a composite closed and open it in place.

`CircuitBuilder` makes circuits and `validate()` rejects a net with two drivers, a net that is
read but driven by nothing, and a port on a net that does not exist. A drawing from the editor
compiles through the same builder, with an `open` primitive (which reads X) standing in for an
unconnected input, so a half-finished drawing is still a circuit and the diagnosis can point at
the gate that reads the loose end.

## Three time models

**Settle.** Every gate takes one step. After an input changes, every gate is recomputed from the
values of the step before, synchronously, until nothing changes. The order components are listed
in does not affect the result, so a race the circuit cannot decide is not decided by the code.
If the values repeat without settling (an odd loop of inverters, a latch released from both inputs
at once), the nets that keep changing are set to X and the result says `converged: false`. The
history of steps is kept, so a view can scrub through a settle.

**Delay.** Every gate has its own propagation delay (10 units unless the circuit says otherwise).
A change on a net schedules the gates that read it to produce their outputs after their delays.
Events are processed in time order and, at equal times, in the order they were scheduled, so a run
is deterministic. A gate that is re-evaluated before its pending output fires replaces that output
(inertial delay), so a glitch shorter than a gate's delay is swallowed. This is the model in which
setup and hold can be seen.

**Clocked.** A discipline on the settle model: inputs change only between edges, and
`clockCycle()` settles, raises the clock, settles, lowers it and settles, advancing the timeline
by two units so a rising edge falls on an odd time. The lesson's test sequences use explicit
clock inputs where a change while the clock is high is the point.

None of the three is transistor-level, and every lesson's model note says which it runs.

## The trace, snapshots and replay

Everything the simulator does is recorded: every stimulus (with the settle it preceded) and every
net change with its time and cause (`stimulus`, `settle`, `overlay`). `replay()` builds a fresh
simulator and feeds it the same stimuli; a test holds the two traces equal. `snapshot()` and
`restore()` capture and reinstate the whole state, including the delay model's pending queue.
Nothing in the engine reads a clock or draws a random number.

## Tests and the diagnosis

A test suite is data: rows of inputs and expected outputs for a combinational circuit, or a
sequence of steps that set inputs, optionally pulse a clock, and expect outputs. `runSuite()`
never says "incorrect". A failure names the step, the inputs applied, what the circuit gave and
what was expected, and the divergence: the output that disagrees, the component that drives it,
the values that component saw on its inputs at that moment, and the components in its fan-in
cone, nearest first. If the step names internal nets with expected values, the divergence is the
earliest named net that is wrong. A circuit that cannot be tested (an output nothing drives, the
wrong ports, text that does not elaborate) blocks the run with a sentence instead.

## The capture map of the gate-level flip-flop

The D flip-flop is two D latches and an inverter, nothing more. In the delay model with every
gate at 10 units and the rising edge at 1000, `packages/dd-model/src/timing.test.ts` pins what
it does with a change on D:

| D changes at | Q |
| --- | --- |
| 965 or earlier (35 or more before the edge) | the new value at 1030, cleanly |
| 970 to 985 (between 35 and 10 before) | the old value shown at 1020, the new one late, at 1040 or 1045 |
| 990 or later (10 before, at, or after the edge) | the old value; the edge missed the change |

The model never answers X on its own here: a tie is decided by event order. That is why the
overlay exists, and why the lesson calls 35 units the setup time and the window 35 to 10 the
untrusted one. The numbers are what the gate delays add up to in this model; they are a
teaching choice, not a measurement.

## The metastability overlay

`applyMetastabilityOverlay()` is the one place the deterministic engine steps aside. Given the
flip-flop's output, a seed, and the time from which the output is undecided, it marks the output
X from that time, draws (with a seeded generator) how long it hovers and which value it settles
to, schedules both, holds the gate model off that net until the draw settles, and records the
seed and the draw in the trace. The same seed replays to the same picture; a new experiment gets
a new seed. The overlay forces the output net only: the nets inside keep the gate model's values,
and an input change after the draw recomputes the output from them. The lesson says plainly that
this is the one random element in the course.

## What the views may do with it

A view reads values from a simulator (`snapshotValues()`), from a settle's history, or from the
trace (`valuesAt`, `segmentsOf` in `dd-views/traces.ts`). It never computes a value itself. The
timing diagram is lanes of a trace; the circuit view is the netlist with the simulator's values
on it; the stepper inside the flip-flop is a cursor over a recorded delay-model run. Where a
figure's words are the lesson's (phase descriptions, predictions), the lesson's data holds them
and a facts test holds the numbers they state.

## Not modelled

Real delays, which vary with temperature, voltage and manufacture; wire delay; drive strength
and fan-out; the analogue middle voltages a latch passes through; power. The HDL subset is a
subset: `always_ff` is a flip-flop or a register, `always_comb` is a mux tree, there is no
instantiation, no arithmetic on signals, and no `initial`. Everything the subset refuses is
refused with a sentence that names the construct.
