# Brief GT: a wide word, typed

Read `docs/notes/module-8-datapath/briefs/00-module.md` (the voice and the reader) and
`docs/style.md` first. These strings appear wherever a circuit has an input word wider than 16 bits
(a challenge's "Try it", a figure's inputs), in Module 7 onwards. Keep every `{slot}` exactly.
Return `key: text`, one line each. Short: these are labels and one-line messages.

What the learner sees. Under the heading "Input {name}" (as now) are two text fields side by side
and a button. The first field holds the word in hexadecimal, at its full width, capitals, no
prefix: a 64-bit word shows 16 digits, such as `00000000000007D8`. The second holds the same word
as a number read signed, such as `2008` or `-184`. The learner may type in either and press Enter
or the button, or leave the field: the word takes the value. In the hexadecimal field fewer digits
fill the word's low end (`7D8` is `00000000000007D8`); `0x` and spaces are allowed. In the number
field a minus sign in front makes a negative number; the field takes any number from the most
negative a signed reading holds to the most an unsigned reading holds. When a field cannot take
what was typed, a line under the fields says why, and the word keeps its value. Escape puts the
field back. Below, folded, is the old row of the word's bits, one button each.

- `hexLabel`: the first field's accessible name: `{name}` in hexadecimal.
- `numberLabel`: the second field's accessible name: `{name}` as a number, read signed.
- `hexCaption`: the first field's visible caption, one word.
- `numberCaption`: the second field's visible caption: a number, read signed. Two to four words.
- `set`: the button's text, one word. `setLabel`: its accessible name, with `{name}`.
- `empty`: the message when the field is empty. One sentence.
- `notHex`: the message when `{char}` is not a hexadecimal digit; say which characters are.
- `hexTooLong`: the message when the value has more digits than the word: `{name}` is `{width}`
  bits, at most `{digits}` hexadecimal digits.
- `notNumber`: the message when `{char}` is not part of a number; say what a number may have
  (the digits 0 to 9, a minus sign in front for a negative number).
- `numberRange`: the message when the number does not fit: `{name}` is `{width}` bits, so a number
  from `{min}` to `{max}`.
- `bitsSummary`: the folded row's summary: `{name}`'s bits, one at a time. Short.
