# Brief GV: the words inside the five new figures

Read `docs/notes/module-8-datapath/briefs/00-module.md` and `docs/style.md` first. These strings
appear in any lesson that uses the figures, Module 8 or 9. Keep every `{slot}` exactly. Return
the keys below, `key: text`, one line each.

- `choose`: the heading of a figure's list of choices, one or two words.
- `word`: above an instruction's fields: the whole word, `{word}`, as "The word {word}" style.
- `bits`: a field's bits, `{hi}` to `{lo}`, short.
- `register`: a register field's value: `R{n}`, FIXED as given.
- `signedValue`: the constant's value read signed, `{value}`, short.
- `fieldsLabel`: the six fields as one group, for a screen reader.
- `constantRow`: the label above C's row: C, 12 bits. `wideRow`: above W's rows: W, 64 bits.
- `bitRange`: above a row of W's bits: `{hi}` to `{lo}`, short.
- `copyKey`: under the rows: the dashed bits are copies of bit 11. One sentence.
- `readings`: the two words read signed: `{c}` for C and `{w}` for W. One sentence.
- `bitLabel`: a bit, for a screen reader: bit `{n}`, its value `{bit}`. `copied`: added to that
  label for a copy of bit 11.
- `timelineTitle`: the timing diagram's name, for a screen reader, two words.
- `mapCaption`: the memory map's table: the parts of memory, and what the memory does with each
  access.
- `addresses`: unused now; one word. `part`: the first column, the part of memory, one word.
- `accesses.load-word`, `accesses.load-byte`, `accesses.store-word`, `accesses.store-byte`:
  column headings, two words each.
- `allowed`: an access the memory carries out, one word. `refused`: one the memory refuses: its
  cause `{cause}` alone.
- `parts.rom` "ROM", `parts.ram` "RAM", `parts.display` "display", `parts.lamps` "lamps",
  `parts.signals` "signals", `parts.sensorA` "sensor A", `parts.sensorB` "sensor B",
  `parts.timer` "timer", `parts.waiting` "waiting": FIXED as given. `parts.none`: no memory at
  those addresses, two words.
- `range`: an address range, `{first}` to `{last}`, short, no dash.
- `flowCaption`: the branches table: where each instruction sent PC.
- `address`, `instruction`: column headings, one word each. `went`: the third column: where PC
  went, two words.
- `wentTo`: one place a run went: `{to}` and how many times `{times}`, short, like "{to} (×{times})"
  or "{to}, {times} times".
- `notTaken`: a target the run never took: `{to}` and never, short.
- `arrowsLabel`: for a screen reader: the arrows go from each branch, call and jump to where the
  run sent PC; the table says the same. One sentence.
