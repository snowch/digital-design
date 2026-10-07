# Fix brief F2A: lesson 0.2 after the review: the opening and the ladder

Read `00-module.md` (this folder), `docs/style.md`, and the lesson's current wds in
`content/lessons/inside-the-machine.prose.ts` and `.labels.ts`. Redraft only the keys below, each
whole. Keep a key's sentences that no point below touches. Lengths in wds.

## Wds to keep apart

- "high" and "low" are a wire's voltage only: high stands for 1, low for 0. Never "low" for a
  slice of small worth: say "the slices of least worth" or name their worths.
- "level" is a step of the ladder only.
- Say each of these once on the whole page, where this brief puts it: the course builds the machine
  from the bottom (motivation only); a number at the top is the 1s and 0s on the slices (ladderAfter
  only).

## Facts

- The machine is paused before line 3, "R3 becomes R1 minus R2", with R1 at -184 and R2 at -250.
  The part that adds works all the time on whatever numbers reach it. While line 3 waits to run,
  R1 and R2 already reach it, so its output is already 66. R3 is not set yet. When line 3 runs, R3
  takes the 66.
- The part that adds also takes one number from another: every use on this page is a subtraction.
  Module 3 shows how it does that. (Say this once, in the prediction.)
- The ladder has 9 levels. Each press of "Down a level" opens the box the level above marks:
  1. The line (Module 11): line 3; the figure shows the number it gives, 66.
  2. The machine's parts (Module 8): the whole machine's drawing; the part that adds is marked.
  3. The part that adds (Module 7): four boxes of 16 slices each; the first is marked.
  4. Sixteen slices (Module 7): that box opened: four boxes of 4 slices; the first is marked.
  5. Four slices (Module 7): the four slices worth 8, 4, 2 and 1; the slice worth 2 is marked.
  6. One slice (Module 7): the slice worth 2 opened: a part that adds and parts that choose which
     result goes out; its adding part is marked.
  7. The adding part (Module 3): the slice's adding part opened: two halves and one more of the
     smallest parts; the half that makes the sum is marked.
  8. The smallest parts (Module 2): that half opened: two of the smallest parts. One makes the sum
     and sends it out on the wire named SUM; the other makes the half's second output.
  9. One wire (Module 1): the same drawing, the wire SUM. It is high: it stands for 1.
- The figure shows each level's number under its wds: 66; then 1s and 0s (64 of them, then 16,
  then 4); then the 1 of one slice; then the wire's level. So the 66 is written differently at
  each level: as a number, then as 1s and 0s, then as one wire's voltage.

## Keys

- question: keep it; under 70 wds.
- motivation (under 110 wds): the machine is made of parts, each made of smaller parts, down to
  wires. A wire is high or low: a high voltage stands for 1, a low one for 0. Each part is used as
  a box, its insides hidden; you can look at one level at a time. The course builds the machine
  from the bottom: Module 1 starts at one wire. This lesson goes down from the top.
- prediction (under 130 wds): the pause and why the part that adds already gives 66 (facts
  above); that it also subtracts, with the pointer to Module 3; it is 64 slices side by side, each
  working on one place and giving a 1 or a 0, worth 1, 2, 4, 8 and so on. The figure opens the part
  that adds into four boxes of 16 slices, then the first of them into boxes of 4, then the four
  slices of least worth. Its numbers stay hidden until you choose an answer and press "Check my
  prediction".
- p1Explain (under 70 wds): 66 is 64 + 2, so the slices worth 64 and 2 give 1 and the other 62
  give 0. No slice is worth 66. Press "Down a level" twice to see the slices worth 8, 4, 2 and 1
  give `0010`.
- levelLine, levelParts, levelAdder, levelSixteen, levelFour, levelSlice, levelAdding,
  levelSmallest, levelWire: one or two sentences each (under 35 wds), saying what the level shows
  and what is marked, from the list above. No numbers that the figure shows under them. No zoom
  request in levelParts. levelWire says a high voltage stands for 1 only if the motivation has
  not; it has, so levelWire just names the wire and says it leaves the half that makes the sum.
- ladderLead (under 60 wds): the figure starts at line 3; each press of "Down a level" opens the
  box the level above marks, down to one wire. At each level, find the 66, written that level's
  way.
- ladderAfter (under 50 wds): the 66 at the top is the 1s and 0s on the 64 slices' outputs; the
  slice worth 2's output is one wire, high. Every level is the same machine, seen from nearer.
