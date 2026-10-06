# Brief GW: the figures' own labels after the review

Read `docs/notes/module-8-datapath/briefs/00-module.md` and `docs/style.md` first. These strings
appear in any lesson that uses the figures. Keep every `{slot}` exactly. Return the keys below,
`key: text`, one line each.

- `copyKey`: under the widening's rows. Bit 11 is outlined; the dashed bits are its copies. One
  sentence.
- `mapCaption`: the memory map table's own caption, read by a screen reader and shown above the
  table, under the figure's caption: a name, two or three words, not a sentence.
- `flowCaption`: the branch figure's table caption: a name, two to four words, not a sentence.
- `instruction`: the branch figure's second column, over each line's text such as `R1 <= 5`:
  FIXED "Transfer", the word the datapath figure's program table uses for the same text.
- `arrowsLabel`: for a screen reader: the arrows go from each line to where the run sent PC, when
  that was not the next line; the "went to" column says the same. One sentence.
- `rangeAbove`: an open range of addresses: `{first}` and everything above it. Short.
- `edgeMark`: FIXED "↑{n}".
