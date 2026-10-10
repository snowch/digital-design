# Brief R3-S: the shared figure's and the course's new words, after the second reading

Read `docs/style.md`. Each key is a label or one or two sentences. Keep every slot in braces exactly
once. Plain text unless a key says otherwise: these show where Markdown is not rendered, so write
no backticks.

## The course's grader (`grading.couldNotRun`)

Shown in place of a challenge's results when its tests stopped with an error, so the page still
draws. `{why}` is the grader's own reason, which may be technical. Say the tests could not run, and
then give `{why}`. One sentence.

## The figure of the whole machine

- `pinNote` (under the drawing, two sentences): press a wire to pin it; it stays marked as you open
  blocks, and its name and value show under the drawing, in hexadecimal for a word. The wires the
  next edge uses are marked with a band of colour: back from each register, held word, memory or
  device the edge writes, along each selector's chosen input, to where the value starts.
- `rowPin` (the accessible name of a button that is a table row's heading): `{row}` is the row's
  label, `{wire}` the name of the wire the row reads; pressing it pins that wire on the drawing.
- `romLater` (in the row "Its word in the ROM", in place of the word, until the figure's first edge
  has run): a few words saying the word shows after the next edge.
- `flipBare` (the accessible name of one box in a row of bits that is a row of wires, not a number):
  `{n}` is the wire's bit number, `{bit}` its value now; press to change it. Shaped like the existing
  "Bit {n}, worth {value}, now {bit}; press to change." without the worth.
- `labShowChange` (a button in the lab's figure, once the run that finds the wrong line is made):
  show the line this text changes.
- `what.lamps` (the lamps, as a run's sentence names them: "After … at …, {what} is {machine} on the
  machine and {model} by the model."): today "the lamps", which makes "the lamps is". Name the
  lamps' word so the sentence reads as English with "is", e.g. a noun phrase about the lamps' bits as
  one word.

## Two blocks' titles (`next`, `next-trap`)

The drawing titles a block by its kind; two blocks are both titled "next PC", so the trail reads
"machine / datapath / next PC" inside each. Give each a short lower-case title that tells them apart:

- `next` (built in Module 8): chooses the next PC from PC + 4, a branch's or a call's target, and
  the ALU's result for a jump.
- `next-trap` (built in Module 12): takes that choice, or the handler's address at a trap, or C2 at
  `resume`, and gives the PC its next value.
