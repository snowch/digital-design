# Brief GC: the figures' words after the review

Read `docs/notes/module-8-datapath/briefs/00-module.md` (the shared fact sheet) and
`docs/style.md` first; both apply. Each key below names its lesson; read that lesson's current
words (`content/lessons/<lesson>.prose.ts` and `.labels.ts`) so your text joins what is around
it. PC, "program counter" and "fetch" are allowed from lesson `fetch` on; "branch", "call" and
"jump" in `branches` only. A caption ends with a full stop; a radio choice's label has no
backticks; a field note is at most 9 words with no full stop. Return only the keys below,
`key: text`, a blank line between keys.

## Lesson `instructions`

- `fieldsLead` (about 50 words). The figure cuts one instruction into its six fields, in the
  word's order, from bit 31 down to bit 0 (on a wide screen side by side, on a phone one above
  the other: do not say "side by side"). Each box gives the field's letter, its bits, its digit
  or digits, its bits in binary in groups of four, its value where that says more than the
  digits (a register as R1, R2...; the constant read signed), and what the field does. The point:
  the six fields are in the same place in every instruction. Choose one of the four instructions
  to compare them.

## Lesson `constants`

A new figure in the motivation, after its text: the same fields figure, for `22103064` only.
Checked: K 2, J 2, A 1 (R1), B 0 (R0, unused), Y 3 (R3), C `064`, which read signed is 100.

- `captions.fields`: the six fields of a constant job.
- `fieldsChoice`: the radio label: 22103064: R3 ← R1 + 100.
- `fieldNotes.K`: the kind; 2 is a constant job. `fieldNotes.J`: the ALU's code, as for kind 1.
  `fieldNotes.A`: read onto QA, the ALU's A. `fieldNotes.B`: unused by a constant job.
  `fieldNotes.Y`: the register written. `fieldNotes.C`: the constant, read signed.
- `fieldsLead` (about 30 words): the same six fields as in the last lesson; in a constant job,
  C's 12 bits carry a number, and B is unused.
- `wideningLead` (about 60 words). The figure shows W, the 64-bit word, in four rows of 16 bits,
  and under the last row (bits 15 to 0) C's 12 bits, each standing under the bit of W it becomes.
  Bit 11 is outlined in both. W's bits 63 to 12 are drawn dashed: each is a copy of bit 11. A
  small gap after every four bits groups them into hexadecimal digits. The line under the rows
  reads C and W signed. The figure opens on `F9C`; for `064` and `7FF` every copy is 0.
- `explanation`: keep the first paragraph exactly ("The selector carries out ... which one.").
  Replace the rest with one paragraph that says why copying bit 11 keeps the number: read signed,
  C's bit 11 is worth -2048. In W, bit 63 is worth minus 2 to the 63, and the 1s in bits 62 down
  to 11 add up so that bits 63 to 11 together are worth -2048: the same as bit 11 alone. When bit
  11 is 0, the copies are 0s and add nothing. End by saying the figure below shows it for four
  constants. (The old third paragraph, about the A input and the selector, repeated the first;
  it is cut.) Return the whole key.

## Lesson `fetch`

The edges figure was changed. Each rising edge in the window is marked above the drawing as ↑1 to
↑5 (its number from the reset); falls are no longer marked. The slider moves the cursor half a
clock period at a time and is labelled "Time" with the simulator's time; the table under the
drawing gives each lane's value at the cursor. The figure opens with the cursor just before ↑1.
A lane's value just left of a rise is what that edge works with; just right of it, the edge's
result. Checked values just before each rise:

- ↑1: PC `000`, IR `25001F48`, RESULT -184, WREG 1. ↑1 writes -184 into R1.
- ↑2: PC `004`, IR `25002F06`, RESULT -250, WREG 1. ↑2 writes -250 into R2.
- ↑3: PC `008`, IR `13123000`, RESULT 66, WREG 1. ↑3 writes 66 into R3.
- ↑4: PC `00C`, IR `12334000`, RESULT 132, WREG 1. ↑4 writes 132 into R4.
- ↑5: PC `010`, IR `84000000` (stop), RESULT X, WREG 0. ↑5 writes nothing; PC stays `010`.

At ↑1 to ↑4 PC moves on by 4, and IR and RESULT change to the next instruction's. In the
simulator's model each change after an edge takes no time, so in this drawing every lane changes
at the rise; the margin figure above steps through one edge and shows the order (PC first, then
IR, then RESULT). The margin figure's after-text already gives the final registers and the stop:
do not repeat those.

- `captions.edges`: a run of five rising edges, one lane per signal or bus; move the slider.
- `edgesLead` (about 50 words): what the lanes are (CLK; PC as three hexadecimal digits; IR as
  eight; RESULT read signed; WREG), the ↑1 to ↑5 marks, the slider and the table. Do not start
  with "The diagram shows five clock edges".
- `edgesAfter` (about 80 words): read a lane just left of a rise for what that edge writes; the
  four writes; ↑5 and the stop, briefly; that this drawing shows each edge's outcome, and the
  margin figure shows the order inside one edge.

## Lesson `memory-access`

A new figure in the motivation, after its text: the fields figure for the load `380027D8` and
the store `48040400`. Checked: the load is K 3, J 8, A 0, B 0, Y 2, C `7D8` (2008 read signed);
the store is K 4, J 8, A 0, B 4, Y 0, C `400` (1024). With job 8 the address is c alone, so A is
not used; a load fills the register Y names; a store writes out the register B names.

- `captions.fields`: a load and a store, field by field.
- `fieldsChoices.load`: 380027D8: R2 ← memory[7D8]. `fieldsChoices.store`: 48040400:
  memory[400] ← R4.
- `fieldNotes.K`: the kind; 3 is a load, 4 a store. `fieldNotes.J`: 8: a word at c alone.
  `fieldNotes.A`: unused when the address is c alone. `fieldNotes.B`: the register a store writes
  out. `fieldNotes.Y`: the register a load fills. `fieldNotes.C`: the address, read signed.
- `fieldsLead` (about 35 words): a load's register is in Y, a store's in B; with job 8, C is the
  address and A is unused. Choose the load or the store.
- `mapLead` (about 90 words). Rows: the ROM `000` to `3FF`; the RAM `400` to `7BF`; seven device
  words of 8 addresses each: the display `7C0`, the lamps `7C8`, DOOR and WARM `7D0` (bit 0 DOOR,
  bit 1 WARM), sensor A `7D8`, sensor B `7E0`, the timer `7E8` and waiting `7F0` (later modules
  use these two); and no memory, from `7F8` up, which gives 31 for every access. The four access
  columns: load word, load byte, store word, store byte. A cell says yes, or the cause that stops
  the machine. Each cell checks the part's first address, a multiple of 8; a word at an address
  that is not gives 33, except where there is no memory (31). Where two causes apply, the lower
  number shows: a store byte at DOOR and WARM or a sensor gives 33, not 34. Module 6's memory lost
  a write to its sensor; this machine stops with 34.

## Lesson `branches`

The loop figure (`flow`) has moved from the motivation into the investigation, straight after the
datapath figure that runs the loop program and lists it (`sumLead`, `sumAfter`). The "went to"
column now also gives a branch's way on to the next line. Checked: the branch at `014` went to
`00C` 4 times and to `018` once. In the call program, the call at `00C` went to `018` once; the
branch at `020` went to `018` twice and to `024` once; the jump at `024` went to `010` once. The
run is made by the course's own machine when the page opens; the figure has no button. Arrows on
the left go from a line to each place it sent PC other than the next line.

- `captions.flow`: where the loop's branch sent PC, both ways.
- `flowLead` (about 45 words): the run above, drawn as the program's lines; what the arrows and
  "went to" show, with how many times; that the run is already made; the branch at `014`. Do not
  repeat `sumAfter`.
- `captions.callFlow`: where the call, the branch and the jump sent PC.
- `callFlowLead` (about 45 words): the same figure for the call program, with the facts above.
