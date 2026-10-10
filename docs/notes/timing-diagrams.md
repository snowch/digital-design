# Timing diagrams only where time matters (10 October)

The author asked whether 3.3's prediction diagram was right, and where the course first introduces
one. The values were right, but the figure was wrong for the question. A review of all 51 figures
on `main` that drew a timing diagram, each finding attacked by a sceptic, kept 38 with fixes and
replaced 13. The managing session's list (S1 to S24) is answered here; the briefs and drafts are in
`docs/notes/timing/`.

## What changed

- **Where time matters.** A prediction says how its run is shown (`show`): a timing diagram for a
  clock or a circuit that remembers; the run's values on the circuit, with its table, for one
  setting and no clock (2.1, 2.2, 3.1's first, 3.2's first, 3.3, 3.4, 7.1, 7.2, 9.1, 9.2); a row
  per setting for a few settings of a circuit with no memory (2.3, 3.1's second, 3.2's second). The
  term "timing diagram" is rationed, with 4.1 `remember` its home, where its reading is taught
  before the first one appears; 5.1 builds on it with words in boxes and the clock's rises. A
  content test fails a prediction of one setting and no clock that draws time, and any timing
  diagram before 4.1.
- **The axis.** The simulator marks a settle step's label where its inputs change (it marked it
  one unit late, over the next step's change) and a clock step's label on its rise. The diagram
  numbers the rises from the last reset (↑1, ↑2), names the reset's, and drops the falls and the
  shared timeline's bare numbers (a lone "0" at the top read as a value); 4.1's gate-delay figures
  count units from the edge and mark the clock's rises instead.
- **The red line.** It stands after the run unless moved, and the slider and the table say where in
  the run's own steps ("after ↑3", "after the run"), time units only in 4.1. The drawing opens on
  it and follows it as a running figure grows; it opened at time 0, off a phone's screen, for 17
  predictions and the running figures. Setup and hold's red line marks the edge.
- **Values.** The last instant is drawn, so a lane agrees with the table at the red line. A value
  that changes and changes back within one settle is one stretch, labelled once. A word too wide for
  its stretch takes a shorter form (a state's name alone, or its code alone), clear of the red line,
  or is left to the table; the running datapath figures write a state by its name alone, as the
  edge timelines and the prose do; a prediction's status line writes a word as its drawing does.
- **Faults.** The table under 5.4's and 9.3's running diagrams followed a trace that grows in place;
  5.4's "Start again" did nothing (the settle simulator's memo never saw the new simulator); with
  RST at 1, 5.4's status line named the state the next-state logic gives, not the all-zeros state a
  reset loads. 12.7 counts its halting edge, 54, as 9.3 does, and its facts test with it. A chosen
  option ending in a full stop no longer gets a second.
- **The reset's rise.** The simulator's `clockCycle` marks a rise taken with RST at 1 as the
  reset's, whoever clocks it; a figure that reset with a plain `clockCycle` (`startDatapath`, so
  9.3's `colder-edges`, 9.4's `four-views` and 12.7's `night-hardware`) had numbered it ↑1, and
  every edge after it one too high: the run ended at ↑24 under "stops after 23 edges", and 12.7's
  stop at ↑55. Now they end at ↑23 and ↑54, which `traces.test.ts` pins for 9.3.
- **One title.** Every timing diagram has one name for a screen reader.

## Not done here, and why

- **Long runs scroll rather than shrink** (S9): the unit a time step gets is computed in the shared
  timeline, `platform/primitives/src/Timeline.tsx`, which this course takes as a checked copy of
  `snowch/learning-platform` and may not edit. The course gives a narrow value a shorter form or
  leaves it to the table; a minimum unit is the platform's change to make. The same holds for a
  third row of axis labels (S8): the course gives its labels room instead.
- **9.2's CAUSED** stays in bits on the drawing, which writes every small word in bits, as it does
  K and J; where the prose reads it off the drawing, it gives the bits once beside the cause
  (brief Y9). **5.4's** status line keeps the code in brackets, which in a plain sentence do what the
  code font does in the prose. The managing session decided both.


## The check

`./scripts/check.sh` at the merge of Module 13 passed every step but the browser suite's screenshot
comparisons and 9.3's prediction test, which picked its option by place; the options changed, and it
now picks the answer by its label. The screenshot tests that fail, at their stored baselines:
desktop and phone "state machines", "signals", "scenes", "Module 2 pairs" and "figures that matter
most", and phone "registers". This work changes the timing diagrams in the registers and state
machines figures, so those two are expected to differ; the baselines are left to the managing
session.

## The check of the timing work

The managing session's three checkers and a sceptic confirmed most items and sent back 21. With
the platform at `36d21ae`, the shared timeline takes a least unit (`minUnit`) and widens a run until
every axis label has room; this round uses both.

- **Room for every value.** The diagram gives the timeline the fewest pixels a unit needs for each
  word's stretch to hold the word, and the stretch the red line stands in to hold it on the longer
  side of the line, up to 80 pixels a unit; a longer run scrolls. The drawing runs one step past the
  red line, an edge where the run has edges, so the newest box is as wide as the others. A word is
  written beside the red line in the stretch the line stands in, so a drawing that opens on the line
  shows the watched word on a phone. A window that ends before the run (`to`) draws its last values
  to its end: CLK no longer stays high where the table says 0.
- **One form per lane.** A state is written by its name alone, as the prose writes it, in the lane
  and in the table: TRY, FETCH; the state diagrams and the encoded tables keep the codes.
- **Where the red line stands** is said by the axis's marks: "at ↑3" on a mark, "after ↑3"
  between marks, "before ↑57" before the first in view; "after the run" only where a run has none.
  The running figures' captions no longer say "after the run" beside a button that runs.
- **Setup and hold** opens on the edge and follows the slider, so the setup band and Q's change are
  both in view at 390; its ticks are dropped only where a named mark stands.
- **A one-setting prediction's table** stands under the result line, not above the question, so the
  question and its button stay where the learner pressed; it lists the lesson's signals (7.1's
  three, 7.2's five, and new lists for 9.1 and 9.2). The settings table's caption is a line above it,
  and its heads keep the drawing's names (and3, not AND3).
- **Tests.** `diagrams.spec.ts` commits every prediction by id (it skipped seven), and clocks
  `retry-machine` 40 times, the 9.3 controller 30, and runs `colder-edges` to its stop; the content
  test counts a state machine's trace and a datapath's timing lanes as timing diagrams.
- **Words** (brief T2): 2.1's explanation names the table's three signals and SHUT's place; 3.1's
  lead joins its two figures; 4.1 calls a run's named input changes settings, not steps; 5.1 says
  what its axis names; 5.4's lead explains ↑n and "↑ reset", its after text limits its claim to RST
  at 0, and its reset prediction asks the learner to apply the motivation's rule; 8.3's ↑5 sentences
  stand together.
