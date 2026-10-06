# R-brief: reading one Module 9 lesson as a learner

You are reviewing one lesson of an interactive course, *Digital Design: From Bits to a Working
Computer*, before it is published. Return your review as text in your final message; do not
write or change any file.

## What to read

- The lesson, rendered as text: the file named in your task. It gives each section's heading and
  prose in order, each figure's caption, the text above it ("lead"), the text shown after a
  prediction or after a run ("outcomes"), the text below it ("after"), its settings as JSON, and
  each challenge's task, hints, starting text and test names.
- The lessons before it, to know what the learner has met: the same folder holds Modules 6 to 8
  and the earlier Module 9 lessons as text. Read the earlier Module 9 lessons and Module 8's last
  lesson (8.5-branches) in full, and skim the rest.
- `docs/style.md` in the repository (the course's style checklist), `docs/isa.md` and
  `docs/machine.md` (the machine the lesson teaches; they are approved and fixed).
- The figures:
  - "control-table" is a table read off the decoder's circuit: one column per kind, one row per
    control signal, a cell 1, 0 or J2/J1/J0 (the signal is that bit of the job).
  - "kind-map" is a 16 by 16 map of kinds and jobs read off the decoder: ✓ an instruction, · not
    one, c an instruction only for some constants.
  - "kind-edges" is a table of each kind's states, read off the controller and the decoder.
  - "state-machine" is Module 5's figure: a state diagram, a table of rows, and a trace; inputs are
    pins, "Clock CLK" makes an edge.
  - "datapath" is Module 8's datapath figure (`packages/dd-views/src/interactives/DatapathFigure.tsx`,
    its words in `packages/dd-views/src/strings.ts` under `datapath` and `control`). Here it draws
    the machine of several edges as three blocks (control unit, datapath, memory) joined by a
    bus of control signals. "Clock edge" makes one rising edge; "Run until it stops" runs edges
    until the machine stops (500 at most); "Start again" resets. A prediction's question comes
    first; the tables and the clock button appear only after the learner commits. With
    `microOps` it lists the instruction's edges and their transfers; with `signals` the control
    signals at the next edge; with `states` the controller's state diagram; with `timing` a timing
    diagram of the named signals.
  - "fault-lab" offers faults and a "Run checks" button that runs the listed checks.
  - "circuit-explorer" draws a circuit whose blocks open when pressed; inputs are pins.

## How to read

Read as a learner who has done every earlier lesson and none after. For each problem you find:

1. Quote the page exactly (a short quotation) and name the section or figure.
2. Say what is wrong for a learner: a fact that is wrong or unchecked, a step the learner cannot
   follow, a word used before it is explained or in two senses on one page, a definite article on
   something never introduced, a repeat of the same point far apart, a figure that does not show
   what the prose says it shows, a figure's results visible before the learner is asked to
   predict them, a challenge whose task, hints or tests do not match, a number the simulator
   would not produce, the style checklist broken.
3. Suggest a direction, never replacement wording.
4. Check a number or a cross-reference against the files before asserting it. If you cannot check
   it, say so.
5. Never give a challenge's answer in your review.

Rank findings by how much they would hurt a learner. Say also, in a sentence or two, what works.
Keep the review under 1200 words.
