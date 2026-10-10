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

## Handover

This session stops here at the managing session's request; a new session finishes the round. The
numbers are those of the managing session's message "the check of the timing work at 656f8b1".

**Done and committed.**
- 1, the reset's rise: `c51f5f3`. `Simulator.clockCycle(clock, rise?)` in `packages/sim` now marks
  a rise as `RESET_RISE` ("↑RST") when no label is given and an input named RST reads 1, so every
  caller that clocks a reset is right without passing a label (`startDatapath`, `traps-run`,
  `multicycle-run` and the rest). `RESET_RISE` lives in `@dd/sim`; `traces.ts` re-exports it, and
  `riseLabel` is gone. `traces.test.ts` pins 9.3 ending at ↑23. Checked on the built site: 9.3
  `colder-edges` and 9.4 `four-views` end at ↑23, 12.7 `night-hardware` at ↑54.

**Done in code and words in `74cd98a`, not yet seen in a browser or run in Playwright.**
- 2, `diagrams.spec.ts`: a new test clocks `retry-machine` 40 times, the 9.3 controller 30, and
  runs `colder-edges` to its stop. Not run yet.
- 3 and 4, empty boxes and phone answer boxes: `TimingDiagram.tsx` computes `minUnit` (the
  fewest pixels a unit needs so that each word's stretch holds its text at 7.5 px a character plus
  8, and the red line's stretch holds it on its longer side; capped at 80) and passes it to the
  platform's `Timeline`. The drawing's `end` is now one step past the red line (`tail`: the
  smallest gap between marks, 1 or 2), so the newest box is a full edge wide. A word in the red
  line's stretch is written beside the line (after it, else before it, else at the stretch's
  start). Measure each figure the message names: the cap of 80 may leave a short first box (an
  edge timeline's stretch clipped at `from`) empty still.
- 5 and 13: `Prediction.tsx` draws the circuit with `table={false}` and puts a `SignalTable` under
  the result line; `SignalTable` takes `only`, the prediction's `signals`. 9.1 and 9.2 got lists
  (K, J, C, then the signals each explanation uses).
- 6: `focus` is the red line wherever there is a slider, so setup-hold opens on the edge and
  follows the slider. Not measured at 390.
- 7 and 8: `where()` reads the marks: "at ↑3" on a mark, "after ↑3" between, "before ↑57" before
  the first; "after the run" only with no marks. New strings `timing.atMark`, `timing.beforeMark`.
  13.1's window starts at edge 57: check its first label reads "before ↑57" and not "before ↑1".
- 9, 10, 16, 18, 19, 20 and the 5.4 reset decision: words through brief T2
  (`docs/notes/timing/briefs/T2.md`, drafts beside it), placed unchanged. The second-pass read of
  each changed lesson (2.1, 3.1, 4.1, 5.1, 5.4, 8.3) is not done.
- 11: `commitPredictions` collects the figures' ids first, and the Modules 3, 6 and 9 test asserts
  no `.prediction` is left uncommitted.
- 12: `laneValue` writes a named value by its name alone, in the lane and in the timing table
  (TRY, FETCH). Playwright tests that expect "TRY 01" or "FETCH 000" in a timing table, if any,
  will fail; `module5.spec.ts`'s "TRY 01" reads the encoded table, which is unchanged.
- 14: a setup-hold tick is dropped only at a named mark's own time. Not measured.
- 15: with `to`, the lanes draw from a trace clipped at `to` (`drawn`), to `to` plus one step. The
  slider can now move into that tail, where it shows the values at `to`.
- 17: the settings table's caption is a paragraph above it, labelling the table by
  `aria-labelledby`; its heads after the first are not upper-cased.
- 21: the content test counts a state machine with its trace pane and a datapath with timing lanes.

**Not started.** The browser walk of every changed figure at 390 and 1280, the stored screenshots
this changes (to be reviewed by the managing session, not updated here), the second-pass read, the
full check.

**State of the checks.** Vitest passes at `74cd98a` (143 files, 1508 tests). The full check on
`0c14b7a` (main at `79c3040` merged, and the reset fix) was stopped in Playwright for the handover:
formatting, copyright, the platform copy, tsc, Vitest and the build had passed, and the browser
had passed 517 tests with 11 failures, all the stored screenshots this container always fails.

**What surprised me.** The platform's `Timeline` now draws the lane names in a column of their own
and scrolls the lanes beside it, and widens a run for its axis labels itself (`fitUnit`), so the
course's `roomFor` and `stretched` in `TimingDiagram.tsx` may now be unnecessary; I left them. A
`not.toContain` test between two feedback strings breaks when one becomes the other's first
sentence (`stop-check.test.ts`, fixed). `pkill` of a preview server ends the calling shell with
exit 144; it is harmless.

## Round 3 (T3)

Items 1 to 15 of the managing session's list. Checked: item 1 was real (the band label shared the axis's second row; it now sits 3 px lower); item 2 real (`SetupHold` passed no focus; `TimingDiagram` takes `focus`); item 3 real (a slider figure now sizes a word by half its stretch, so the scale holds); item 7 real in code and in all four figures (input pins are pressable only at the top level, `CircuitView.tsx`), so the four leads send the learner up the trail, through brief T3. Slider ends (item 10) are clamped in `TimingDiagram`, not in the platform's `Timeline`: the thumb stops at the last change. Item 8 holds the call back as the load is. The stop's sentences stand together in `ProgramEditor.tsx` (item 12). Full check: only the stored screenshots fail in this container.
