# A wide word, typed: Try it after Module 8's learner walks

A working note on the branch `module-8-datapath` (this session's branch, restarted from `main`
at 1d89fab once the learner pass had merged; the managing session asked for `try-it-words`, which
this session may not push). Times are read from `date -u` as each entry is written. "The
managing model" is the session doing the work; "the drafting subagent" writes every
learner-facing sentence from a brief of checked facts.

## Times

- Started: 2026-10-06 16:14 UTC.

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
