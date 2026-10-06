# A wide word, typed: Try it after Module 8's learner walks

A working note on the branch `module-8-datapath` (this session's branch, restarted from `main`
at 1d89fab once the learner pass had merged; the managing session asked for `try-it-words`, which
this session may not push). Times are read from `date -u` as each entry is written. "The
managing model" is the session doing the work; "the drafting subagent" writes every
learner-facing sentence from a brief of checked facts.

## Times

- Started: 2026-10-06 16:14 UTC.

## What changed for the learner, and why

- **A word wider than 16 bits is typed.** Two fields, side by side where they fit: its
  hexadecimal digits, and its number read signed. Hexadecimal because the lessons write every word
  and address that way (`7D8`, `FFFFFFFFFFFFFF48`); the number because the shop's readings are
  numbers (-184), and Module 8 reads its registers signed. Two fields, not one that guesses: `100`
  is a different word in each, and a learner should not have to know a prefix to say which.
- **Either field reads the word back.** After a value is taken, both fields show it: the
  hexadecimal at the word's full width (16 digits for 64 bits, as the tables show it), the number
  signed. Typing `7D8` and reading `2008` beside it is the reading the lessons do by hand.
- **Fewer digits fill the low end**, as an address is written: `7D8` is `00000000000007D8`. `0x`
  and spaces are allowed; capitals or not. The number field takes a signed or an unsigned
  reading: from the most negative a signed reading holds to the most an unsigned one does, so
  -184 and `FFFFFFFFFFFFFF48`'s unsigned value are both the same word.
- **What a field cannot take, it says**, in a line under the fields, and the word keeps its value:
  a character that is no hexadecimal digit, more digits than the word holds, a character that is
  no part of a number, a number out of range, nothing typed. Escape puts the field back.
- **A value is taken at Enter, at Set, or when the field is left**, not at each key: a word half
  typed would drive the circuit through values nobody chose.
- **X and the reset value.** A word with unknown bits shows X in each hexadecimal digit whose bits
  are not all known, and X as its number; the circuit's reset (Try it's "Recompute from all-zero
  inputs") shows in both fields at once.
- **The bits stay one press away**, folded under the fields ("PC's bits, one at a time"), in groups
  of four with each group's digit, for a check that looks at single bits (fetch's alignment, bits
  1 and 0).
- **16 bits and fewer keep the row of bits.** The earlier modules teach the bits with it (Module 1's
  readings, Module 3's words, Module 6's 16-bit sensor word, `FF48`); there the row is the lesson.
  Above 16 bits, a 32-bit instruction and a 64-bit address, the row was 2 to 4 screens of buttons
  on a phone and taught nothing the field does not.
- Accessible: each field has a name ("PC in hexadecimal", "PC as a number, read signed"), the
  message is announced, the invalid field says so; fields and the button are 44 px tall; the
  captions are the page's small text, over 11 px.

The change is in the platform (`WordInputs.tsx`, `word-entry.ts`), so it reaches every wide input
word: Try it in Modules 8 and 9, and any figure whose inputs are wider than 16 bits.

## Log

- 16:14. The learner walks found a wide input word entered one bit at a time: 64 buttons for a
  64-bit word, about 1,500 px on a phone, the bits that matter at the bottom (F11, B5, C10 in
  `module-8-learner/verdicts.md`). `module-8-datapath` reset to `main` (1d89fab).
- 16:19. Parsing in `packages/dd-model/src/word-entry.ts` with unit tests; the typed
  field in `WordInputs.tsx`; looked at in fetch's `checks-text` Try it at 1280 and 375 px:
  `7D8` sets PC and reads back as 2008, `7G8` is refused and the word keeps its value. Brief GT
  sent to the drafting subagent.
- 16:21. GT came back. Faults, fixed by the fewest words: ranges written with a
  hyphen, "0-9" and "A-F" (the style has no dashes: "0 to 9", "A to F"); the number field's
  caption narrowed to "Signed number", though the field takes an unsigned reading too (now
  "Number, read signed", the brief's words); single quotes round `{char}` (the course's double
  quotes); `notNumber` dropped that the minus sign makes a negative number (added). The browser
  tests (`tests/educational/try-it-words.spec.ts`) pass at both widths.
- 16:53. The full check (`./scripts/check.sh`, started 16:25, on 30a3113's code; the
  later commits change only this note): 874 unit and integration tests pass; Playwright 550
  passed, 34 skipped, 10 failed. The 10 are the screenshot comparisons a clean `main` fails in
  this container; none names a figure with a wide input, and no baseline was touched.

## Left

- A field takes a value when it is left as well as at Enter, so a learner who taps away from a
  half-typed word sets it, or sees why not. Leaving a field without setting it would need Escape;
  the walkers' complaint was the reverse, so the field errs on taking.

## After the author's answer

- 17:10. Left above for the author: Try it's table showed an 8-bit output such as CAUSEF in binary
  (`00010001`), while the lesson and its test messages call it cause `11`. The author said to do
  the right thing for the learner. A challenge with `feedback: "words"` (Modules 8 and 9) now
  shows an 8-bit word in its Try it table in hexadecimal too, so the table, the task and the
  failure message all say `11`. The earlier modules' tables keep binary, where the bits are the
  lesson. The browser tests expect `11` and `12`; Module 8's and the typed-word specs pass at both
  widths (56 tests).

