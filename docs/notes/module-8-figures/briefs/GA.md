# Brief GA: the new figures' words in lessons `instructions`, `constants` and `fetch`

Read `docs/notes/module-8-datapath/briefs/00-module.md` (the shared fact sheet) and
`docs/style.md` first; both apply. PC, "program counter" and "fetch" are allowed only in the
`fetch` keys. Return only the keys below, in the `key: text` form, a blank line between keys.
Labels and captions are short; a caption ends with a full stop; a radio choice's label has no
backticks.

## Lesson `instructions`: a figure of an instruction's fields (in the motivation section)

The figure shows one instruction word cut into its six fields, side by side, left to right. Each
field's box shows: its letter; its bits ("bits 31 to 28"); its hexadecimal digit or digits; its
bits in binary; its value (a register field as R1, R2...; the constant read signed); and a short
note on what the field does. Above the boxes is the whole word. The learner chooses one of four
instructions: `13123000` (R3 ← R1 - R2), `12123000` (R3 ← R1 + R2), `15024000` (R4 ← R2) and
`16101000` (R1 ← R1 + 1).

- `captions.fields`: choose an instruction and read its six fields.
- `fieldsLead`: about 60 words. The figure cuts an instruction into its six fields, K, J, A, B, Y
  and C, the same in every instruction. Say what each box shows (the list above). Choose one of
  the four instructions to compare them.
- `fieldNotes.K`: the kind; 1 is a register job. `fieldNotes.J`: the job; its bits 2 to 0 are the
  ALU's code. `fieldNotes.A`: read onto QA, the ALU's A. `fieldNotes.B`: read onto QB, the ALU's B.
  `fieldNotes.Y`: the register written. `fieldNotes.C`: a constant; a register job does not use
  it. Each note at most 9 words, no full stop.
- `prediction`: the current text (in `content/lessons/instructions.prose.ts`) lists the six fields
  in a sentence; the figure above now shows them. Cut that sentence ("An instruction has six
  fields: ..."), and keep everything else. Return the whole key.

## Lesson `constants`: a figure of the widening (in the explanation section)

The figure shows a 12-bit constant C as a row of 12 bits, bit 11 outlined, and the 64-bit word W
that the widen block makes of it, simulated, in four rows of 16 bits (bits 63 to 48, 47 to 32, 31
to 16, 15 to 0). C's row stands under W's bits 11 to 0. W's bits 63 to 12 are drawn dashed: each
is a copy of bit 11. Under the rows, one line gives C and W read signed. The four constants:
`064` (100), `F9C` (-100), `7FF` (2047, the largest) and `800` (-2048, the smallest).

- `captions.widening`: choose a constant and compare its 12 bits with W's 64.
- `wideningLead`: about 50 words. Say what the rows show (above), that the dashed bits are copies
  of bit 11, and that the line under them reads both words signed.
- `widenings.hundred`: 064, which is 100. `widenings.minusHundred`: F9C, which is -100.
  `widenings.largest`: 7FF, the largest, 2047. `widenings.smallest`: 800, the smallest, -2048.
- `explanation`: the current text's second paragraph ("Copying bit 11 keeps the signed value
  correct. `FFF` and ... 2047.") repeats what the figure now shows. Replace it with one sentence:
  copying bit 11 keeps the number, and the figure shows it for four constants. Keep the other two
  paragraphs as they are. Return the whole key.

## Lesson `fetch`: a timing diagram of five edges (in the explanation section)

The figure is a timing diagram of a real run of the margin program, from the reset, for 5 rising
edges. Its lanes: CLK; PC, written as three hexadecimal digits; IR, eight digits; RESULT, read
signed; WREG. Arrows above the lanes mark the clock's rises (↑) and falls (↓). A slider moves a
cursor through time, and a table under the diagram gives each lane's value at the cursor.

Checked facts of the run, before each rising edge:
- PC `000`, IR `25001F48`, RESULT -184;
- PC `004`, IR `25002F06`, RESULT -250;
- PC `008`, IR `13123000`, RESULT 66;
- PC `00C`, IR `12334000`, RESULT 132;
- PC `010`, IR `84000000` (stop), RESULT X, WREG 0.
WREG is 1 before each of the first four edges, so each of those edges writes RESULT into the
register Y names. At each rising edge PC moves on by 4, and IR and RESULT change straight after
it. At `010` the stop makes HALT 1, so the fifth edge writes nothing and PC stays `010`. RESULT is
X there: the stop's A and B digits name R0, which nothing has written; nothing uses that RESULT.

- `captions.edges`: five edges of the margin program, one lane per bus.
- `edgesLead`: about 60 words: what the lanes are and how the values are written, the arrows,
  the slider and the table.
- `edgesAfter`: about 90 words: the facts above, short. End on: between two edges the values
  settle; at the edge they are written and PC moves on.
