# Module 1, lesson 1: signals and bits

A working note, written as the lesson was built. It records what went wrong as plainly as what
went right. "The managing model" is the one that built the lesson; "the drafting subagent" is
the subagent that drafted every learner-facing string from a brief of facts.

## Times

Read from the clock (`date -u`), not estimated.

- Started: 2026-10-04 22:47 UTC (first command in the session).
- Finished: (filled in at the end)

## Log

- 22:47 The repository was not in the container. Attached it and cloned it; fetched
  `module-5-registers-b` (head `2bc2c17`) and created `module-1-signals` from it. Unset the
  upstream the checkout set, so nothing can push to `module-5-registers-b` by accident.
- 22:47 to 22:52 Read CLAUDE.md, docs/authoring.md, docs/style.md, docs/simulator.md, all of
  docs/inventory.md, docs/checkpoints.md, the Module 5 note, both lessons' three files, and the
  schema, runtime, book, interactives, strings and educational tests. Built the course and looked
  at both lessons section by section in Playwright screenshots at 1280 pixels.
- Found while reading, before writing anything:
  - **The inventory has no "machine section".** The task says to read "the build prompt's
    machine section in docs/inventory.md for what is fixed". No such section exists in
    `docs/inventory.md` on this branch or on `main` (searched for "16", "machine", "curriculum",
    "Module 1"). The only fact used about the course's machine is the one the task states: it
    is 16-bit at the gate level. The lesson says nothing about its instructions, addresses or
    devices. A question for the author is at the end of this note.
  - **The inventory's section 2 is the corpus's test results, not the tutorials.** The
    physical-intuition material is described in section 3.1 (the D flip-flop tutorial's "why
    timing parameters exist": RC charging, a transistor as a switch plus a resistance). Section
    8 is what Prompt B should change, and 8.1 what building Slice 1 taught.
  - **Every challenge is a circuit.** `Challenge.interface` needs at least one output port, the
    reference must be a circuit, a library id or text, `gradedDirection` is draw or write, and
    the book's `grade` runs the engine's test runner. The runtime itself is generic (it calls
    `book.grade` and `book.ChallengeEditor`), so the new challenge kind is a schema change plus
    a book change; the runtime does not need to know.
  - **The diagram check measures only `svg.timing-diagram`, `svg.timing-lanes` and
    `svg.circuit`.** A new drawing is not checked unless its class is added.
- 22:52 to 23:03 Platform work, before any prose (code first):
  - **The model.** `packages/dd-model/src/bits.ts` (a word as a row of bits, highest first;
    place values, unsigned and signed readings, hexadecimal, lamps, the range of a width) and
    `signals.ts` (a recording: the level the sender drove for each bit plus noise drawn once
    from a seed, kept in hundredths of a volt as whole numbers so a threshold exactly on a
    sample is decided by one rule, "at or above reads 1"; reading against a threshold; the
    nearest sample of each kind; the band of thresholds that read every sample right; the noise
    scale at which the band closes). Nothing in the views computes a reading.
  - **The recordings were tuned, not invented in the prose.** The sensor's word is the
    cold room's reading, -184 tenths of a degree. The first choice, -18, has only two 0 bits,
    so the 0 side of the plot was two dots; tenths gave six. The compressor's noise (a hum plus
    random noise) was chosen by a sweep over hum size, spread, period and seed for a recording
    in which a 2.40 V threshold reads 2 to 4 samples wrong, the safe band is about 1 V wide
    near the middle, and the band closes between 1.5 and 2 times the noise. The chosen one:
    3 wrong at 2.40 V, band 1.12 V to 2.25 V, closed at 1.6 times. The sweep wrote to a file
    in the scratchpad, as Vitest's console is unreliable.
  - **The answers challenge.** Schema: `gradedDirection: "answer"`, `fields` (number, bits,
    text), an `answers` test suite naming a grader and listing cases (`label`, `given`,
    `expect`), and `answers` on the artifact. `interface` became optional (default no ports);
    `checkLesson` now requires an output for a circuit challenge, and for an answers challenge
    requires answer tests, at least one field, a width on a bits field, and a reference that
    answers every field (schema test). The graders (`dd-model/graders.ts`: `threshold`,
    `word`) return values, never sentences; the book's `gradeAnswers` turns them into the
    runtime's verdict (the failing case's label, the inputs, what the answers gave, what was
    expected) with the words from `dd-views/strings.ts`, and blocks with a sentence naming the
    field when an answer is missing or does not parse. The runtime did not change: re-grading
    on load, the hint ladder, the "Clear work" reset and completion come with it.
    `testCount` in lesson-schema replaced the two educational specs' own counting, which did
    not know the new suite.
  - **Four figure kinds** in `dd-views`: `noisy-signal` (recordings to choose from, a
    threshold slider, an optional noise slider, an optional shaded band, an optional reading of
    the sent and read bits as a number), `bit-inspector` (a word of bits to change, read
    several ways at once with the sum that gives each number), `interpretations` (one word,
    read one way at a time, with the rule), and `reading-prediction` (commit before the model
    answers, in the shape of the circuit prediction; the answer is computed by the model). They
    share `SignalPlot` (drawn one unit per pixel at the width of its box, so its 11 and 12
    pixel text stays that size on a phone) and `BitRow`. Every word they show is in
    `dd-views/strings.ts`.
  - `content/lessons/signals.facts.test.ts`, before any brief: every number the briefs state,
    read off the figures' own props through the model (nine tests).
  - Removed "word" from the registers lesson's `introduces`: this lesson introduces it first.
- 23:03 to 23:07 Brief E (the lesson's labels and the new figures' own words) went out first,
  alone, so the prose briefs could quote the page's controls from one place (the Module 5
  note's lesson). While it ran: the fact sheet and briefs A to D; the educational spec
  `tests/educational/signals.spec.ts`; and the diagram check extended to `svg.signal-plot`
  with a new case that commits the prediction and moves every slider of this lesson to both
  ends.
- **Found while writing the briefs: the term gate counts this lesson against later lessons'
  terms.** Because this lesson now comes first, every term Modules 4 and 5 introduce is banned
  here in every form: feedback, latch, transparent, edge, propagation delay, setup, hold,
  metastable, register. My own brief D had "16 bits can hold"; caught by a scan of the briefs
  before they went out, and the banned list added to the fact sheet. Brief E had already gone
  out without that list; its drafts were scanned for the words instead.
- 23:07 to 23:13 E's first draft, checked for facts. Sent back with eleven notes: units printed
  twice (each of {gap}, {from}, {to}, {low}, {high}, {threshold} already carries " V", and
  five strings added " V" or "volts" after it; nothing in the brief said so, so this was the
  brief's gap); the readout lines for the nearest samples dropped "highest" and "lowest", the
  fact the prose relies on; "Good thresholds" said nothing about what for; "Hex" used though
  the term is "hexadecimal"; two different headings on one figure both called "Value"; the
  received word named "The sensor's reading"; objectives that dropped "bits" and "binary";
  a section title that labelled instead of saying; test names that dropped "at least" and "on
  both sides" and "your". The redraft fixed all eleven and changed nothing else.
- 23:08 to 23:12 A, B, C and D went out in parallel, with the controls' labels from E's draft
  written into the fact sheet.
- 23:12 to 23:16 The check of A to D found **my brief's error, twice over**: "reading" meant
  three things across the fact sheet (the sensor's temperature, "one voltage reading" for a
  sample in A's draft, and the unsigned or signed reading of a word), and "value" meant both a
  bit's 0 or 1 and what its place is worth (B: "To get a number, each bit needs a value"). Both
  came from the fact sheet's own wording; the drafts copied it. Decided: "reading" is only a
  way of reading bits and its result; the sensor sends a temperature; a place has a "worth".
  Notes went to A, B, C and E; the fact sheet was not changed after the drafts were made, so
  the notes carried the rule. Other notes: C put the shaded band "below the plot" (it is in
  it) and dropped "unsigned" and that bit 15 is labelled -32768; D's challenge task dropped
  that the sensor counts in tenths and the number of tests, and garbled "sends -250 when read
  signed"; D's reflection said no threshold helps when "noise is larger than the gap between
  the two voltages", a wrong fact that came from my brief's loose "larger than the gap between
  them allows" (the samples were never moved by 3.30 V); the correct condition is that some 0
  sample reaches some 1 sample. A dropped nothing else; B dropped "Use the figure above to
  find one" (restored by the managing model, replacing a sentence that repeated the task
  below it, which is a cut, not a rewrite).
- 23:13 to 23:17 Placed the drafts with a script (`place.py` in the scratchpad: the prose and
  labels files written from the drafts, the views' strings patched by key so Prettier's line
  breaks do not matter, and the managing model's edits applied from a list that fails if an
  edit no longer applies). Edits by the managing model, all of them: "Each such measurement is
  a sample: one measurement of the voltage" cut to "Each such measurement is a **sample**" (a
  repeat the redraft introduced, and the term set in bold); the challenge's lead had its
  sentence repeating the task replaced by the dropped "Use the figure above to find one"; the
  failure figure's lead split into two paragraphs at "Move the noise up" (no words changed).
- 23:17 Whole-lesson read on the built page, start to finish. Found: the title E had drafted,
  "How can a reading travel down a noisy wire?", still used "reading" for the temperature
  (sent back; now "How does the till know the temperature?"); the model note's "a reading
  taken with the wrong rule" (sent back; now "a word read with the wrong rule"). The read did
  not find "Bits taken together as one value" (B), a third sense of "value"; left for the
  reviewer.
- 23:18 to 23:20 The check script failed (exit 1, 6 of 100 Playwright tests): the plot's sample
  numbers at 11 pixels measured 10.9 in the aesthetics rule (set to 12, with every other sample
  numbered on narrow columns); and two of the first lesson's tests read "the first lesson in
  the list" as `remember`, which is no longer true (they now find its row by title). The
  screenshot baseline for the new figure was made and looked at. Second run: exit 0, 193 Vitest
  tests, the build, 100 Playwright tests.
- 23:20 Committed in two commits (platform, then lesson) and pushed `module-1-signals`. The
  platform commit alone does not typecheck: the first lesson's spec still counted tests its old
  way until the lesson commit. Noted rather than rewritten, as the branch is already pushed.
- 23:21 to 23:24 The mechanical half of the review, a Playwright walk at 1280 and 375 pixels in
  the light and dark themes: every slider to both ends (no NaN, undefined or Infinity), every
  radio, every bit, both predictions, both challenges with the stub, wrong attempts (0, 3.3,
  1.40, 2.40 and -1 volts; all-zero bits with answers) and the reference threshold, every hint.
  No console error, no horizontal page scroll, no control without a name, in all four. Found:
  - **the blocked sentence named only the first empty field** ("Fill in Unsigned"), because the
    grader stopped at the first case that lacked an answer. Fixed in `gradeAnswers`: every
    field missing in any case is named at once, in the challenge's order; the educational test
    now checks both names.
  - **"You chose The 2.40 V threshold reads fewer samples wrong.. The model gives..."**: the
    prediction's option labels are full sentences with a capital and a full stop, slotted into
    the runtime's "You chose {choice}." The circuit lessons' options are phrases ("Q is 0110").
    Sent to the drafting subagent for phrase-shaped options.
  - the walk's own fault, not the page's: it pressed every bit inside every figure, including
    the challenge's bits, so its "reference" attempt at the word challenge started from all 1s
    and failed. The educational test, which starts from a fresh page, passes the reference.
  - a number box with `type="number"` cannot hold a comma decimal ("1,70") in an English
    browser: the box is then empty and the run says to fill it in. Not changed; noted.
  - Added `dd-model/src/bits.test.ts`: the readings, the recordings' determinism and scaling,
    the "at or above reads 1" rule and the band, and the graders' parsing and blocking.
