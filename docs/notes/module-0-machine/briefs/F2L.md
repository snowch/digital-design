# Fix brief F2L: lesson 0.2's labels and the answer feedback, after the review

Read `00-module.md` (this folder), `F2A.md` and `F2B.md` (facts and wds to keep apart), and
`docs/style.md`. Labels are short: a few wds, no full stop unless a full sentence. Write:

## Lesson labels

- objectives.2 (one sentence, starting with a verb, no garden path): read the 1s and 0s of the
  slices of the part that adds as the number it gives.
- levels.line, levels.parts, levels.adder, levels.sixteen, levels.four, levels.slice,
  levels.adding, levels.smallest, levels.wire: each level's title, two to four wds, from F2A's list:
  the line; the machine's parts; the part that adds; sixteen slices; four slices; one slice; the
  adding part; the smallest parts; one wire.
- captions.predictSlices, captions.ladder, captions.slices, captions.stuck, captions.tracePaused,
  captions.trace: one short sentence each, a request, which does not repeat its figure's lead.
- fields.slices: the box for the eight 1s and 0s: the slices worth 128 down to 1.
- cases.slicesHigh: the slices worth 128 to 16. cases.slicesLow: the slices worth 8 to 1.
- options.stuck66, options.stuck64, options.stuckStops: the stuck question's three answers: 66,
  as before; 64; the machine stops at line 3.

## The answer feedback (shown when a test fails, in place of the values, so no answer is printed)

{actual} is the learner's own answer. Each one sentence:

- details.runDisplay: when the program stops, the display does not show {actual}.
- details.runLamp: when the program stops, CLASH is not {actual}.
- details.traceChanged: {actual} is not the number line 3 changes.
- details.traceValue: line 3 does not give {actual}.
- details.traceNext: after line 3, the machine does not run line {actual} next.
- details.tracePart: the number line 3 gives does not come from {actual}.
- details.slicesHigh: the slices worth 128, 64, 32 and 16 do not give {actual}.
- details.slicesLow: the slices worth 8, 4, 2 and 1 do not give {actual}.
- details.slices: the eight slices do not give {actual}.
- invalidFor.slices: what a valid entry is: eight 1s and 0s, one for each slice, the slice worth
  128 first; a space between the two groups of four is allowed.
