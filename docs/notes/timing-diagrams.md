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
- **One title.** Every timing diagram has one name for a screen reader.

## Not done here, and why

- **Long runs scroll rather than shrink** (S9): the unit a time step gets is computed in the shared
  timeline, `platform/primitives/src/Timeline.tsx`, which this course takes as a checked copy of
  `snowch/learning-platform` and may not edit. The course gives a narrow value a shorter form or
  leaves it to the table; a minimum unit is the platform's change to make. The same holds for a
  third row of axis labels (S8): the course gives its labels room instead.
- **9.2's CAUSED** is written in binary on the circuit (an 8-bit word) and in hexadecimal in the
  prose; and **5.4's** status line gives a state's name with its code in brackets where the lane
  writes them side by side. Both are left for the managing session to decide.
