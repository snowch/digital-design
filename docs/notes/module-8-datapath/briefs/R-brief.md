# R-brief: reading one Module 8 lesson as a learner

You are reviewing one lesson of an interactive course, *Digital Design: From Bits to a Working
Computer*, before it is published. Return your review as text in your final message; do not
write or change any file.

## What to read

- The lesson, rendered as text: the file named in your task. It gives each section's heading and
  prose in order, each figure's caption, the text above it ("lead"), the text shown after a run
  ("outcomes") or below it ("after"), its settings as JSON, and each challenge's task, hints,
  starting text and test names.
- The lessons before it, to know what the learner has met: the same folder holds Modules 6 and 7
  and the earlier Module 8 lessons as text. Read the earlier Module 8 lessons in full and skim
  Modules 6 and 7.
- `docs/style.md` in the repository (the course's style checklist), `docs/isa.md` and
  `docs/machine.md` (the machine the lesson teaches; they are approved and fixed).
- The figure the Module 8 lessons use is the datapath figure
  (`packages/dd-views/src/interactives/DatapathFigure.tsx`, its words in
  `packages/dd-views/src/strings.ts` under `datapath`). The drawing shows each block with its name
  above it; a press on a wire shows its name and value; words wider than 4 bits are not written on
  the drawing but appear in the figure's tables. "Clock edge" makes one rising edge; "Run until it
  stops" runs edges until the machine stops (500 at most); "Start again" resets. A prediction's
  buttons appear before the clock button, which appears only after the learner commits.

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
