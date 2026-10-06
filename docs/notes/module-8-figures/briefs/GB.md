# Brief GB: the new figures' words in lessons `memory-access` and `branches`

Read `docs/notes/module-8-datapath/briefs/00-module.md` (the shared fact sheet) and
`docs/style.md` first; both apply. PC, "program counter", "fetch" are allowed; "branch" only in
the `branches` keys. Return only the keys below, `key: text`, a blank line between keys. A
caption ends with a full stop; a radio choice's label has no backticks.

## Lesson `memory-access`: a figure of the memory map (in the construction section, before the challenge)

The figure is a table. Each row is one part of the memory map, with its addresses: the ROM `000`
to `3FF`; the RAM `400` to `7BF`; seven device words, each 8 addresses (display `7C0`, lamps
`7C8`, signals `7D0`, sensor A `7D8`, sensor B `7E0`, timer `7E8`, waiting `7F0`); and no memory,
`7F8` to `7FF`. The columns are four accesses: load word, load byte, store word, store byte. Each
cell is the machine's own check on that access at the part's first address: "yes", or the cause
that stops the machine.

Checked verdicts: the ROM, yes for loads, 34 for both stores; the RAM, yes for all four; the
display, lamps, timer and waiting, yes for words and 33 for bytes; signals, sensor A and sensor B,
yes for a word load, 33 for bytes and 34 for a word store; no memory, 31 for all four. A word at
an address that is not a multiple of 8 gives 33 in any part; the table checks each part's first
address only.

- `captions.map`: what the memory does with each access, part by part.
- `mapLead`: about 60 words: what the rows and columns are, what a cell says, and the word that
  is not at a multiple of 8.

## Lesson `branches`: figures of where a program's lines sent PC

Each figure is a table of a program's lines, address and instruction, with a column "went to"
and arrows on the left. A run of the program (the course's reference) is made, and for each line
the figure lists where PC went next whenever that was not the next line, with how many times; an
arrow is drawn from the line to each such place. A dashed arrow is a branch's or a call's target
that the run never took (none in these two programs).

In the motivation: the loop that adds 5 + 4 + 3 + 2 + 1 (`000` R1 ← 5 ... `014` if R1 differs
from R0, PC ← `00C` ... `01C` stop). Checked: the line at `014` went back to `00C` 4 times.

In the generalisation: the call program. Checked: the call at `00C` went to `018` once; the
branch at `020` went to `018` twice; the jump at `024` went to `010` once, the line after the
call.

- `captions.flow`: where the loop's branch sent PC.
- `flowLead`: about 60 words: what the table and the arrows show, that a run of the program fills
  "went to", and that the line at `014` sends PC back 2 instructions while R1 differs from R0
  (c = -2).
- `captions.callFlow`: where the call, the loop and the jump sent PC.
- `callFlowLead`: about 50 words: the same figure for the call program; the three arrows (the
  facts above).
- `programs.sum`: the loop, 5 + 4 + 3 + 2 + 1. `programs.call`: the call and the jump back.
- `callLead`: the current text (in `content/lessons/branches.prose.ts`) lists the call program
  line by line, which the figure above now shows. Replace the list with one sentence: the figure
  runs the call program shown above. Keep its last sentence about the table.
