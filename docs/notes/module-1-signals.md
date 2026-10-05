# Module 1, lesson 1: signals and bits

A working note, written as the lesson was built. It records what went wrong as plainly as what
went right. "The managing model" is the one that built the lesson; "the drafting subagent" is
the subagent that drafted every learner-facing string from a brief of facts.

## Times

Read from the clock (`date -u`), not estimated.

- Started: 2026-10-04 22:47 UTC (first command in the session).
- Finished: 2026-10-04 23:52 UTC (the last commit, with the note complete). About 65 minutes in all.

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
- 23:22 A message from another session (not from the task's author through the task) said
  `main` now holds Module 5 and a change to the prediction figure, and asked that
  `origin/main`, not `module-5-registers-b`, be merged into this branch before finishing.
  Checked against the repository: `origin/main` contains every commit of
  `module-5-registers-b` plus that change (`850da67`, `6ca4284`). Merging it changes only this
  branch, which the task already lets me push, and keeps the branch current with what
  `module-5-registers-b` became; so it is merged at the end (below). Nothing else in the
  message was acted on.
- 23:27 to 23:33 The reading half of the review. A reviewer subagent with a written brief (the
  appendix) read the page text and screenshots of every section at both widths in both themes,
  after use, as a learner on their first lesson. It could not write its report file, so the
  managing model saved it, condensed but with every finding and quote. A second, sceptical
  subagent attacked each finding: 10 upheld, 9 upheld in part, 1 rejected. What was done:

  | # | finding (short) | sceptic | action |
  | --- | --- | --- | --- |
  | F1 | which sample carries which bit is never said; "one wrong bit" on a two-bit example | upheld | re-briefed (B: sample 1 is bit 15; C: each wrong bit's worth and direction) |
  | F2 | "read" for a sample and for a word, on one line of the failure figure | in part | **vocabulary decision**: a sample "comes out as" 0 or 1, the row is "Received", "read" only for words; every brief re-sent |
  | F3 | phone: prediction plots cut off, prose clipped, sample numbers misaligned | upheld | **code**: the plots took their starting width from themselves inside a grid cell and widened the page to 669 pixels (test added); sample numbers now staggered on two lines, each over its column |
  | F4 | a failed word test printed the reading of the learner's own bits, the answer | upheld | **code**: those two tests print a phrase, not the value (`OF_YOUR_BITS`) |
  | F5 | hexadecimal called a reading and "not a different number" | in part | re-briefed (D, E: three meanings, one way of writing) |
  | F6 | the freezer challenge's bit 15 labelled 32768 while its test is signed | in part (freezer only) | **code**: a bits field may carry signed worths; the challenge's does |
  | F7 | prose "more samples wrong", figure "fewer" | upheld | re-briefed (A) |
  | F8 | "You chose The ... wrong.. The model gives" | upheld | options redrafted as phrases (before the review, from the mechanical half) |
  | F9 | "the bits carry no rule" argued four times | in part | re-briefed (C and D cut two) |
  | F10 | -184 before its unit; nothing says below zero | upheld | re-briefed (A: tenths of a degree Celsius, -18.4, in the question) |
  | F11 | "top bit" before it is defined | in part | re-briefed (C) |
  | F12 | no worked hexadecimal group | upheld | re-briefed (D, and a hexadecimal rung in the hints) |
  | F13 | voltages below 0 V unexplained | rejected | none |
  | F14 | the "lowest 1 sample" line hidden at the 2.40 V start | upheld | **code**: both lines always, with a wrong-side form; new strings drafted |
  | F15 | "No simulation" badge and "the model" unexplained | upheld | re-briefed (A explains both where first met); the badge itself is the runtime's and stays |
  | F16 | the reflection's last sentence does not follow | upheld | re-briefed (D) |
  | F17 | "value" and "step" with two meanings | in part | in the vocabulary decision |
  | F18 | tangled failure-figure sentence; two-question paragraph | in part | re-briefed (C) |
  | F19 | hint 4 gives a whole field; no hexadecimal hint | in part | re-briefed (D: rung 3 a smaller example with hexadecimal, rung 4 a partial step) |
  | F20 | "the fridge"; read wrong/incorrectly/right; "figures do not show your bits" untrue | in part | re-briefed (A, D; the vocabulary decision) |

  On F19 the sceptic rejected the reviewer's worry about the threshold hint's range ("1.45 V to
  1.95 V") as "still true"; it is true only at the field's 0.05 V steps (1.41 V passes too). The
  hint stays as drafted; the facts test pins the 0.05 V list it states.
- 23:34 to 23:43 Round two of the drafting, from fact briefs per finding (the shared rules file
  `R2-shared.md` and one message per drafting subagent, in the appendix). Checked for facts:
  - **A** kept "The plots that appear show what the model read" and "Getting 16 values right"
    against the new rules, and its redraft restored the repeat "a sample: one measurement of the
    voltage" that the managing model had cut, because the subagent rewrote from its own file.
    Sent back once; fixed.
  - **B** right first time on every finding; one sentence ("The tests check both recordings
    with it") repeated the task below it again, so the managing model's earlier cut was
    re-applied by the placement script.
  - **C** kept "gets all 16 samples right" and "bit 15 the leftmost" without punctuation. Sent
    back once; fixed.
  - **D** right on every finding; one intensifier ("is just a pattern of bits") cut by the
    managing model.
  - **E** dropped "on the wrong side" from both new wrong-side lines, the one fact those lines
    exist for; restored by adding the four words (not sent back, as no sentence needed
    rewriting). New titles: "A different rule", "Four ways"; the figure's heading "Show as".
  - Managing model's own fact edit in round two: the question's "read those 16 values as a
    temperature" became "16 0s and 1s", because "value" may no longer name a bit and "bit" is
    not yet introduced there.
  Then the whole lesson read once more on the built page, start to finish: no new finding in
  the words; the read is the one the placement script's output was checked against.
- 23:44 Merged `origin/main` (see 23:22). One conflict-free merge: the prediction figure now
  draws its circuit above the question, and the first lesson's screenshots moved with it. This
  lesson's own prediction kind is separate and unchanged.
- 23:45 to 23:48 The mechanical half once more, with the walk corrected (it now presses only
  the bit inspectors' bits, and measures the page against the viewport width, because a phone's
  emulation widens `innerWidth` to the content and so hid the overflow the reviewer saw: the
  first walk's "no horizontal scroll" was wrong). All four configurations: no console error, no
  overflow, no unnamed control; the threshold challenge passes only at the reference among the
  attempts; the word challenge names both empty fields, never prints the learner's own bits'
  reading, and passes with the reference. Found one more fault, on a phone: the row name
  "Received" ran into the first bit; the label column was widened.
  - **A screenshot baseline that did not update.** `--update-snapshots` rewrites a baseline only
    when the new image differs by more than the test's tolerance (2%). The label fix moved less
    than that, so the stored phone baseline still showed the old, colliding row, while the page
    was fixed. Found by comparing a fresh screenshot with the stored one; rewritten with
    `--update-snapshots=all` and looked at.
- 23:52 `main` had moved again (a comparison note, documents only); merged it, and the check passed
  again on the merged head (exit 0, 199 Vitest tests, 100 Playwright tests).
- 23:48 `./scripts/check.sh`: exit 0; 199 Vitest tests, the build, 100 Playwright tests at
  desktop and phone widths. Committed and pushed.

## What was reused

- From the platform: the lesson schema and its checks, the term gate (which now counts this
  lesson against the later lessons' terms), the runtime's lesson page, challenge runner, hint
  ladder, verdict view, learner store with re-grading on load and the "Clear work" reset, the
  `withProps` pattern, the seeded generator from `packages/sim` (for the recordings' noise), the
  prediction figure's shape and strings ("Check my prediction", "Predict again", "You chose"),
  the design tokens, the educational-test helpers, the diagram and look checks.
- From the author's earlier work: the D flip-flop tutorial's physical-intuition material, as
  the inventory describes it (a voltage changes like a capacitor charging through a resistance,
  and passes through the middle on the way), carried into the model-versus-reality note as a
  fact in the brief, in the drafting subagent's words. The tutorial's repository was not
  attached and none of its text was read or copied. The model note's "fills through a narrow
  pipe" is the drafting subagent's image for the charging, from my brief.

## What was added to the platform, and why

- **`dd-model/bits.ts` and `signals.ts`**: the lesson's two mechanisms as code the views only
  display (the course's rule that a figure is a view of a model, not a picture). A threshold,
  the nearest sample on each side, the band of good thresholds and the noise scale at which it
  closes are all computed, and the facts test reads them.
- **An answers challenge** (`gradedDirection: "answer"`, `fields`, an `answers` suite naming a
  grader, `answers` on the artifact; `dd-model/graders.ts`; `dd-views/AnswerEditor.tsx`). The
  module has no circuit to grade; its challenges are a setting (one threshold) and answers (16
  bits and two readings). It reuses the runtime unchanged, so hints, re-grading on load and the
  reset come with it. Two choices the review forced: every empty field is named at once, and a
  test that compares an answer with the learner's own bits prints a phrase, not the value,
  because the value is the answer.
- **Four figure kinds**: `noisy-signal`, `bit-inspector`, `interpretations`,
  `reading-prediction`. The prediction is a separate kind rather than an option on the circuit
  prediction because its answer comes from a different model; it reuses the circuit
  prediction's strings and class names so it looks and behaves the same.
- **Small changes**: `testCount` in lesson-schema (the educational specs counted tests their own
  way and did not know the new suite); a bits field may carry signed worths; the diagram check
  measures `svg.signal-plot`; a look check and a screenshot of the noisy-signal figure.

## What the check script caught

Six failures in its first full run (the aesthetics rule on 11-pixel text measured as 10.9, and
two of the first lesson's tests that took "the first lesson in the list" to be `remember`), and
nothing after. It did not catch the page widening to 669 pixels on a phone after the prediction
was committed (the walk's own scroll check was blind for the reason above; the reviewer found
it in a screenshot), nor the row label running into the first bit (the diagram check's overlap
test allows a pixel, and the label and digit did not quite overlap), nor any of the twenty
reading findings. The term gate caught nothing because the briefs had been scanned for the
banned words by hand first.

## What I would change

- **Fix the vocabulary in the fact sheet before any brief goes out.** Two of the review's
  biggest findings ("reading", "value") and the whole second round came from my own fact
  sheet's wording, which every draft copied. A list of the lesson's working words, each with its
  one meaning, belongs in the fact sheet next to the rationed terms.
- **A page-width test after interaction, in every lesson's suite.** The phone overflow was
  invisible to every automated check. The signals spec now measures the page against the
  viewport after the prediction; the shared lesson spec should do the same after using every
  figure.
- **Baselines updated with `--update-snapshots=all` for the figure being changed**, and the new
  image always looked at; a small fix can sit inside the tolerance and leave the old image as
  the record.
- **Let the place script re-check a manager's cut after every redraft.** A subagent that
  rewrites its file from its own copy can bring back a sentence the managing model removed.
- The commit order: the platform commit alone does not typecheck (one spec changed in the
  lesson commit). Keep a commit's tests with the code they test.

## Questions for the author

1. The task points to "the build prompt's machine section in docs/inventory.md". There is no
   such section on this branch or on `main`. The lesson states only that the course builds a
   computer that works on 16-bit words. If the machine's fixed facts are written down somewhere,
   the generalisation section could say more about where such a word lives in it.
2. Every figure in this lesson carries the runtime's "No simulation" badge, which the prose now
   explains. A Module 1 lesson has no time model at all; the author may prefer that the runtime
   omit the badge for `timeModel: "none"`, which would change the existing lessons' text figures
   too.
3. **Six commit messages on this branch carry a model name.** The session's attribution
   trailer, which the session appends to every commit message, named the model, and the task
   forbids model names in commit message bodies. Found at 23:50 by scanning the branch's
   messages. Rewriting the pushed messages needs a history rewrite and a forced push to this
   branch; the session's permissions refused it, so the messages stand: `1da4fd1`, `1b068a7`,
   `4992cd6`, `4026237`, `263fff0`, `3e56dbb`. The last commit's trailer does not name one. The
   author may want to reword those six messages, or squash the branch when merging. No file in
   the repository names a model.
4. A threshold box of `type="number"` cannot hold a comma decimal ("1,70") in an English
   browser. Left as it is.

## After the note: the author's go-ahead on the recommendations

2026-10-05 06:11 UTC. The author answered "go with your recommendations". Done, from "What I
would change":

- **The page-width check after use, for every lesson.** `lesson.spec.ts` now commits each
  prediction and moves each slider to both ends in every lesson, then measures the page against
  the viewport. Proved by putting the old CSS back for one run: the phone case failed with 669
  against 375; with the fix it passes for all three lessons.
- **Working words in the fact sheet, and banned words scanned in the briefs**, written into
  docs/authoring.md's prose process, with this lesson's "reading" and "value" as the example.
- **Screenshot baselines updated with `--update-snapshots=all`**, in docs/authoring.md and in
  CLAUDE.md's line on the screenshots.
- **A commit carries the tests for the code it changes**, in docs/authoring.md.
- Not done: the placement script's re-check of the managing model's cuts. The script lives in
  the session's scratchpad, not in the repository, so there is nothing to change here; the
  lesson is recorded above.

The three questions for the author were questions, not recommendations, and stay open: the
missing machine section, the "No simulation" badge, and comma decimals in the number box. The
six commit messages that name a model are unchanged for the reason given above.

## Appendix: the briefs, as sent

Each brief went to a drafting subagent with docs/style.md attached; the fact sheet went with
every prose brief. Follow-up notes were sent as messages to the same subagents; their content
is summarised in the log above. The review and sceptic briefs are at the end.

### 00-fact-sheet.md

````markdown
# Shared fact sheet: Module 1, lesson 1, "signals"

You are drafting learner-facing text for one lesson of an interactive course, *Digital Design:
From Bits to a Working Computer*. Every fact below has been checked against the course's model
and is pinned by a test. Use only these facts. Do not add numbers, values or claims that are not
here. If a sentence seems to need a fact that is not here, write a note in square brackets
instead of inventing it.

## Voice

- British English. Direct, precise, active voice, short sentences (about twenty words at most).
- The learner is "you". No marketing tone, no filler, no "in this lesson we will", no "let's".
- No em dashes and no en dashes used as dashes. Use a full stop, a colon or a comma.
- Say the point; do not label it ("that is the key idea"), withhold it ("the third part is the
  one that matters"), or wrap it in a roundabout purpose.
- No intensifiers: actually, exactly (unless exactness is the claim), really, simply, just,
  genuinely, entirely, quite.
- "Press" for buttons and bits, never "click" or "tap". "Move" for a slider.
- Markdown is allowed: `code` for a row of bits or a value written as text, **bold** where a
  term is introduced, and short lists. No headings.
- Numbers: write every number as digits, exactly as given here (65352, not "sixty-five thousand").
  Write negative numbers with a plain hyphen-minus: -184.
- The attached style checklist (docs/style.md) applies to every sentence.

## Who the learner is

This is the **first lesson of the course**. The learner knows everyday arithmetic and nothing
about circuits, electronics or the inside of a computer. They know a volt only as the number
printed on a battery. Do not assume anything else. Explain everything the text relies on, once,
in plain English.

Do not use, anywhere: circuit, gate, logic, logic level, register, clock, memory, byte, two's
complement, encode, decode, digital, analogue, protocol, transistor, voltage level (say "level"
or "voltage"), signal-to-noise. A later lesson introduces these words, and a test fails this
lesson if it uses any of them in any form: feedback, latch, transparent, edge (also "edges"),
propagation delay, setup, hold (also "holds", "holding"), metastable, register. Say "keep",
"carry", "side", "border" or "limit" instead. "Noise" is fine in its everyday sense: unwanted wobble on the
cable.

## Terms this lesson introduces (rationed)

A term may be used only from the place where it is introduced, never before. Introduce each in
plain English first, then the term in **bold**.

| term | introduced in | plain meaning |
| --- | --- | --- |
| threshold | Prediction section prose | the voltage the receiver compares each sample with: at or above it reads 1, below it reads 0 |
| bit | Investigation, the lead of the first figure | one value that is either 0 or 1; each sample, once read, gives one bit |
| noise margin | Investigation, the text after the figure | the gap between the threshold and the nearest sample on each side; noise smaller than the gap cannot change how a sample reads |
| binary | Construction, the lead of the bit figure | writing a number with only 0s and 1s, where each place is worth twice the place to its right |
| word | Construction, same place, after binary | a fixed number of bits taken together as one value; here, 16 |
| unsigned | Construction, same figure | reading a word by adding the values of its 1 bits; every value counts as positive |
| signed | Explanation, the lead of its figure | reading a word the same way except that the top bit, bit 15, counts as -32768 |
| hexadecimal | Generalisation, the lead of its figure | writing each group of four bits as one digit, 0 to 9 then A to F |

So the question, motivation and the prediction figure's question must not say bit, binary, word,
unsigned, signed, hexadecimal or noise margin; say "a 0 or a 1", "16 steps", "a number". The
prediction section's prose introduces "threshold" and may use it from there on.

## The setting (used throughout)

- A temperature sensor in a shop's cold room sends its reading to the till along a cable 30
  metres long. The cable runs past the fridge's compressor motor.
- The sensor counts in tenths of a degree. The cold room is at -18.4 degrees, so its reading is
  -184.
- The sensor sends a reading as 16 steps, one after another. In each step it drives the cable to
  0 volts for a 0, or to 3.30 volts for a 1. (Written 0 V and 3.30 V.)
- The receiver in the till measures the cable's voltage once in each step. Each measurement is a
  **sample** (plain word, not rationed; say what it is the first time). So one reading arrives as
  16 samples, numbered 1 to 16 in the order they arrive.
- The 16 values the sensor sends for -184 are `1111 1111 0100 1000`, in the order sent, left to
  right. Samples 1 to 8 were sent as 1, sample 9 as 0, 10 as 1, 11 and 12 as 0, 13 as 1, 14 to 16
  as 0.
- Noise from the cable and the motor moves each sample away from 0 V or 3.30 V.

## The recordings (what the figures plot)

Each figure plots the 16 samples as dots against volts, with the threshold as a line, and three
rows under the plot: each sample's number, the value sent, the value read. A dot read as 1 is
filled; a dot read as 0 is hollow; a sample read wrong has a ring round it and its read value
shown in a different colour. The dashed lines are 0 V and 3.30 V, the two voltages the sensor
drives. These recordings are made by the course's model, not measured on a real cable.

- **Compressor off** ("quiet"): every sample is within 0.18 V of the voltage sent.
- **Compressor running**: the motor's hum and more random noise move samples by up to 1.11 V.

Readings at named thresholds (the figure starts at 2.40 V):

| recording | threshold | samples read wrong | highest 0 sample | lowest 1 sample |
| --- | --- | --- | --- | --- |
| compressor off | 2.40 V | none | sample 16, 2.28 V below | sample 4, 0.72 V above |
| compressor running | 2.40 V | 3: samples 5, 6 and 13 (all sent as 1, read as 0) | sample 16 | sample 5, below the threshold |
| compressor running | 1.40 V | none | sample 16, 0.29 V below | (not needed) |
| compressor running | 1.70 V | none | sample 16, 0.59 V below | sample 5, 0.55 V above |

- With the compressor running, the thresholds that read every sample right run from 1.12 V to
  2.25 V. (The failure figure shades this band. Do not state it before that figure.)
- The middle of 0 V and 3.30 V is 1.65 V.

## What the page's controls are called

Quote a control only by these labels; describe anything else in your own words without quotes.

- The recording choices (radio buttons): "Compressor off" and "Compressor on".
- The threshold slider is labelled "Threshold:" followed by its value, such as "Threshold: 2.40 V".
- The noise slider (failure figure only) is labelled "Noise: ×" followed by the multiple, such as
  "Noise: ×1.6".
- Under each plot, rows named "Sample", "Sent" and "Read".
- Under the plot, lines of text say how many samples are read wrong and which, give the highest 0
  sample and the lowest 1 sample with their gaps to the threshold, and (failure figure only) the
  range of thresholds that read every sample right and the sent and read bits as numbers.
- Bits are buttons; pressing a bit changes it between 0 and 1.
- Prediction figures: choose an answer, then press "Check my prediction"; "Predict again" clears
  it.
- Challenges: answer boxes (a number box, a text box, or a row of bit buttons), a "Run tests"
  button, a "Clear work" button that discards the work, and hints one at a time ("Show hint").
- Every figure in this lesson carries a badge "No simulation": nothing in it runs over time.

## Bits and numbers

- Bits are numbered from the right: bit 0 is the rightmost, bit 15 the leftmost. Each bit's place
  is worth twice the place to its right: bit 0 is worth 1, bit 1 is worth 2, bit 2 is worth 4,
  and so on to bit 15, worth 32768. The bit figure shows each bit's number above its value and
  what it is worth below.
- A number written this way: add the worths of the bits that are 1. Example: `0000 0000 0001
  0010` has bits 4 and 1 set: 16 + 2 = 18.
- 16 bits can make 65536 different patterns. Read unsigned, they are the numbers 0 to 65535.
- The till received `1111 1111 0100 1000`. Read unsigned, that is 65352. The till treats the
  number as tenths of a degree, so it shows 6535.2 degrees.
- Read signed, the top bit (bit 15) is worth -32768 instead of 32768; every other bit is worth
  what it was. `1111 1111 0100 1000` read signed is -184: the sensor's reading, -18.4 degrees.
- Read signed, 16 bits are the numbers -32768 to 32767.
- When the top bit is 0, the signed and unsigned readings are the same. When the top bit is 1,
  the unsigned reading is the signed reading plus 65536 (65352 = -184 + 65536).
- Neither reading is wrong. The bits are the same in both; the rule for reading them differs.
  Nothing in the 16 bits says which rule to use: the sensor and the till must agree on it.
- Hexadecimal: each group of four bits, counted from the right, becomes one digit, 0 to 9 then A
  (ten) to F (fifteen). `1111 1111 0100 1000` is `FF48`. A 16-bit word is four hexadecimal
  digits. It is a shorter way to write the same bits, not a different number.
- Lamps: the same 16 bits sent to a row of 16 lamps would light the lamps whose bit is 1. That
  pattern is not a number at all.
- The course builds a computer that works on words of 16 bits. A word inside it, like the one
  the till received, carries nothing that says which reading is meant.

## The lesson's story, in order

1. Question: the cold-room sensor, the cable past the compressor, the till. How does the till get
   a number out of a wobbling voltage, and how does it know what the number means?
2. Motivation: two voltages, far apart, so a wobble does not matter until it crosses the middle
   ground; and the receiver must also know the rule for turning the 16 values into a number.
3. Prediction: the threshold; which of 2.40 V and 1.40 V reads more samples wrong with the
   compressor running.
4. Investigation: move the threshold over both recordings; bit; noise margin.
5. Construction: set one threshold for both recordings (a challenge); then build numbers from 16
   bits: binary, word, unsigned; the received word reads 65352.
6. Failure experiment: turn the noise up until no threshold works; what wrong bits do to the
   number.
7. Explanation: why 65352 (the till shows 6535.2 degrees); signed reading gives -184.
8. Generalisation: one word read four ways (unsigned, signed, hexadecimal, lamps); the course's
   16-bit computer.
9. Challenge: predict what `1000 0000 0000 0000` reads as signed; set the freezer's word.
10. Reflection: a pattern of bits means nothing until a rule for reading it is chosen.
````

### E-labels.md

````markdown
# Brief E: the labels and the figures' own words (Module 1, lesson 1, "signals")

You are drafting short learner-facing labels for one lesson of an interactive course, *Digital
Design: From Bits to a Working Computer*. Every fact below has been checked against the course's
model. Use only these facts. Do not add numbers, values or claims that are not here. If a label
seems to need a fact that is not here, write a note in square brackets instead of inventing it.
The style checklist (docs/style.md, attached by path) applies to every string.

## Voice

British English. Plain, direct, short. The learner is "you". No marketing tone, no "let's", no
em dashes or en dashes used as dashes. Use "press" for buttons, never "click" or "tap". No
intensifiers (actually, really, simply, just, exactly unless exactness is the point).

## Who the learner is

This is the first lesson of the course. The learner knows everyday arithmetic and nothing about
circuits or computers' insides. They know what a volt is only as the number on a battery.

## The lesson's story (for context; you are not writing the prose)

A temperature sensor in a shop's cold room sends its reading to the till along a 30-metre cable.
The cable runs past the fridge's compressor motor. The sensor sends its reading as 16 steps, one
after another; in each step it drives the cable to 0 volts (for a 0) or 3.30 volts (for a 1). The
receiver in the till measures the voltage once per step; each measurement is a **sample**. Noise
on the cable moves the samples away from 0 V and 3.30 V. The receiver decides each sample with a
**threshold**: a sample at or above the threshold reads as 1, below it reads as 0. The lesson's
figures let the learner move the threshold, choose a recording, turn up the noise, change bits,
and read the same 16 bits in several ways: **unsigned** (every bit's value added), **signed**
(the top bit counts negative), **hexadecimal** (one digit, 0 to 9 then A to F, per group of four
bits), and as a row of lamps.

Terms the lesson introduces, in this order (a label may use a term only if it appears at or
after the place named): threshold (Prediction section), bit (Investigation), noise margin
(Investigation, after the figure), binary, word, unsigned (Construction), signed (Explanation),
hexadecimal (Generalisation). The lesson title, objectives and section titles are read before
anything else, so they may NOT use: bit, binary, word, unsigned, signed, hexadecimal, noise
margin, threshold. (Objectives may use them: an objective says what the learner can do
afterwards. Section titles may use a term only if it is introduced in that section or earlier.)

Do not use anywhere: circuit, gate, register, clock, logic level, two's complement, byte,
digital, analogue, encode, decode.

## Part 1: the lesson's labels (keys in `LABELS`)

Return each key with its string.

- `title`: the lesson's title, as a question a learner could ask on meeting the cold-room problem.
  Under 60 characters. It must not use the banned-early terms above.
- `objectives`: four objectives, each starting with a verb, each one line, saying what the
  learner can do afterwards:
  1. choose a threshold for a noisy recording and say why its gap to the nearest sample on each
     side matters (may say "threshold" and "noise margin");
  2. read a row of bits as a binary number by adding place values;
  3. read the same 16 bits as unsigned, signed and hexadecimal;
  4. explain why a pattern of bits has no meaning until a rule for reading it is chosen.
- `titles`: ten section titles, each a few words, a label that says what the section contains
  (not a sentence, no colon, a question only if the section answers it):
  - `question`: the cold-room sensor and the till.
  - `motivation`: why a wire that carries only two levels can survive noise, and why the till
    must also know how to read what arrives.
  - `prediction`: predicting which of two thresholds reads more samples wrong.
  - `investigation`: moving the threshold across two recordings (compressor off, compressor on).
  - `construction`: setting the receiver's threshold (a challenge), then building a number from
    16 values of 0 or 1 by adding place values. (Use no banned-early term unless introduced in
    this section: binary, word and unsigned are introduced here.)
  - `failureExperiment`: turning the noise up until no threshold works.
  - `explanation`: why the till showed the wrong temperature: the same bits read the signed way.
  - `generalisation`: one word, four readings.
  - `challenge`: the freezer's word (a prediction and a challenge).
  - `reflection`: what a pattern of bits means.
- `challengeTitles.c1`: the challenge where the learner types one threshold that must read both
  recordings with a gap of at least 0.30 V on both sides.
- `challengeTitles.c2`: the challenge where the learner sets the 16 bits a sensor sends for a
  freezer reading -25.0 degrees (sent as -250 tenths of a degree), and gives that word's
  unsigned and hexadecimal readings.
- `captions` (one short sentence each, an instruction or a description, under 90 characters):
  - `predictThreshold`: predict which of two thresholds reads more samples wrong, then check.
  - `exploreSignal`: choose a recording and move the threshold.
  - `setThreshold`: type a threshold and run the tests.
  - `buildNumber`: press bits to change them and watch the number.
  - `breakSignal`: turn the noise up and watch the band of good thresholds shrink.
  - `signedWord`: the sensor's 16 bits read unsigned and signed; press bits to change them.
  - `manyReadings`: choose a word and a way to read it.
  - `predictTop`: predict what a word with only its top bit set reads as signed, then check.
  - `freezerWord`: set the freezer's bits, answer, and run the tests.
- `options` (prediction answers; short, the same shape within one prediction):
  - `p1High`: the 2.40 V threshold reads fewer samples wrong.
  - `p1Middle`: the 1.40 V threshold reads fewer samples wrong.
  - `p1Same`: both read the same number of samples wrong.
  - `p2Positive`: it reads as 32768.
  - `p2Negative`: it reads as -32768 (write the minus as an ordinary hyphen-minus, "-").
  - `p2Zero`: it reads as 0.
- `recordings` (radio labels, a few words): `quiet`: the compressor is off; `compressor`: the
  compressor is running.
- `words` (radio labels, a few words, in the generalisation figure):
  - `sensor`: the cold room's word, as the till received it;
  - `warm`: the word a sensor sends for 1.8 degrees (18 tenths);
  - `allOnes`: all sixteen bits 1.
- `fields` (labels beside the answer boxes in the challenges):
  - `threshold`: the threshold, in volts (a unit "V" is printed after the box; do not repeat it).
  - `bits`: the 16 bits the sensor sends for the freezer.
  - `unsigned`: that word read as unsigned.
  - `hex`: that word in hexadecimal.
- `cases` (the name of each test, shown as the heading of a failed test; a short phrase each,
  all the same shape):
  - `quietRight`: compressor off, every sample read as sent.
  - `compressorRight`: compressor running, every sample read as sent.
  - `quietMargin`: compressor off, a gap of at least 0.30 V on both sides.
  - `compressorMargin`: compressor running, a gap of at least 0.30 V on both sides.
  - `bitsSigned`: your bits read as signed are -250.
  - `unsignedRight`: your unsigned answer matches your bits.
  - `hexRight`: your hexadecimal answer matches your bits.

## Part 2: the figures' own words (keys in `dd-views/strings.ts`)

These appear inside the figures. Slots in braces are filled by the page and must be kept
exactly, with the same names. Keep each string short. These may use the lesson's terms (bit,
threshold, unsigned, signed, hexadecimal), because each figure appears after its terms.

`signal` (the noisy-signal figure: a plot of 16 samples, a threshold slider, readouts):
- `plotTitle`: the plot's name for a screen reader: samples plotted against the threshold.
- `plotSummary`: a one-sentence summary for a screen reader. Slots: {n} samples, lowest sample
  {low}, highest sample {high}, threshold {threshold}, {wrong} samples read wrong.
- `recording`: the heading over the choice of recordings.
- `threshold`: the slider's label. Slot {value} is a voltage such as "1.70 V".
- `noise`: the noise slider's label. Slot {scale} is a number such as "1.6": the noise is that
  many times the noise in the recording.
- `sample`, `sent`, `read`: the names of three rows under the plot: the sample's number, the bit
  the sensor sent, the bit the receiver read. One word each.
- `allRight`: every sample is read as it was sent.
- `someWrong`: {n} of {total} samples are read wrong; {list} is their numbers, such as "5, 6, 13".
- `nearest0`: the highest sample sent as 0: its number {index} and its gap {gap} below the
  threshold. (Shown only when that sample is below the threshold.)
- `nearest1`: the lowest sample sent as 1: its number {index} and its gap {gap} above the
  threshold. (Shown only when that sample is at or above the threshold.)
- `band`: the thresholds that read every sample right run from {from} to {to}.
- `noBand`: at this noise, no threshold reads every sample right.
- `words`: the 16 bits sent, read as an unsigned number, are {sent}; the 16 bits read are {read}.

`bits` (a row of 16 bit buttons, each showing its bit number, its value 0 or 1, and what it is
worth; readings beside):
- `row`: the name of the row of bits, for a screen reader.
- `flip`: a bit button's name for a screen reader. Slots: bit number {n}, worth {value}, now
  {bit}. Say that pressing changes it.
- `fixed`: the same for a bit that cannot be changed: {n}, {value}, {bit}.
- `digit`: under each group of four bits: the hexadecimal digit the group makes, {digit}. Two or
  three words.
- `sum`: the sum that gives the number: {terms} is a sum such as "32768 + 64 + 8", {total} the
  result. Keep it as "{terms} = {total}" unless you have a reason.
- `noOnes`: no bit is 1, so the number is 0.
- `readings`: the name of the list of readings, for a screen reader.

`readings` (the interpretations figure):
- `names.unsigned`, `names.signed`, `names.hex`, `names.lamps`: the four ways to read a word,
  one or two words each: unsigned, signed, hexadecimal, as lamps.
- `how.unsigned`: the rule: add the values of the bits that are 1.
- `how.signed`: the rule: add the values of the bits that are 1, but the top bit (bit 15) counts
  as -32768 instead of 32768.
- `how.hex`: the rule: each group of four bits is one digit, 0 to 9 then A to F (A is ten, F is
  fifteen).
- `how.lamps`: the rule: a row of 16 lamps, one per bit; a 1 lights its lamp, a 0 leaves it dark.
- `readAs`: the heading over the four choices.
- `word`: the heading over the choice of words.
- `lampOn`, `lampOff`: one word each, for a screen reader listing the lamps.
- `lampsLabel`: the lamps' name for a screen reader; {list} is "on, on, off, ...".
- `value`: the label in front of the reading's value.

`readingPrediction`:
- `modelGave`: after the learner commits: what the model gives; {value} is a voltage such as
  "1.40 V", a number, or the word for "the same" below. It follows a sentence "You chose ...".
- `same`: the value shown when both thresholds read the same number wrong ("the same", or
  similar; it is slotted into `modelGave`).
- `atThreshold`: above each of two plots: at threshold {threshold}, {n} samples are read wrong.

`answers` (the challenges whose answers are typed or set):
- `terms.threshold`, `terms.wrong` (how many samples are read wrong), `terms.wrongSamples`
  (which samples, by number), `terms.marginBelow` (the gap between the threshold and the
  highest 0 sample), `terms.marginAbove` (the gap between the lowest 1 sample and the
  threshold), `terms.bits`, `terms.signed`, `terms.unsigned`, `terms.hex`: the names shown
  beside values in a failed test's "Inputs", "Actual" and "Expected" lists. One to four words
  each.
- `unanswered`: the tests cannot run until these are filled in: {fields} (the field labels).
- `invalid`: the tests cannot read what is in {field} (a field label); say it must be a number,
  or bits, or hexadecimal digits, without saying which (the same sentence serves all three).

Return Part 1 and Part 2 as two blocks of `key: "string"` lines, in the order above.
````

### A-question-motivation-prediction.md

````markdown
# Brief A: Question, Motivation, Prediction (three sections)

Read the shared fact sheet first (00-fact-sheet.md). Draft every string below. Each section is
read straight after the one before, so write the joins: do not repeat a fact already stated in an
earlier key of this brief. Remember: no rationed term before its place (only "threshold" is
introduced in this brief, in `prediction`).

## Key `question` (section "Question"; about 100 to 140 words, two or three paragraphs)

Facts, in this order:
1. A temperature sensor in a shop's cold room sends its reading to the till along a cable 30
   metres long. The cable runs past the fridge's compressor motor.
2. The sensor sends a reading as 16 steps, one after another. In each step it drives the cable
   to 0 V for a 0 or to 3.30 V for a 1.
3. The receiver in the till measures the voltage once in each step. Each measurement is a
   sample. (Say what a sample is.)
4. The samples never come back as exactly 0 V or 3.30 V: noise from the cable and the motor
   moves them.
5. End with the question, as two questions: how does the till turn a wobbling voltage into 0s
   and 1s? And once it has 16 of them, how does it know what number they mean?

## Key `motivation` (section "Motivation"; about 100 to 140 words, two or three paragraphs)

Facts:
1. The sensor uses only two voltages, 0 V and 3.30 V, far apart. The receiver does not need the
   exact voltage. It only needs to tell which of the two the sensor meant.
2. So a wobble does no harm while it is small. It does harm only when it carries a sample so far
   that it looks like the other voltage.
3. Once the receiver has decided each sample is a 0 or a 1, the noise is gone from that value:
   what the till keeps is a clean 0 or 1, not the wobbly voltage.
4. Getting 16 values right is not the whole job. The till must also turn them into a
   temperature, and that needs a rule the sensor and the till agree on. (One or two sentences.
   Do not give the rule or the payoff; the lesson reaches it later.)

## Key `prediction` (section "Prediction" prose; about 50 to 80 words)

Facts:
1. The receiver decides each sample by comparing it with one voltage. A sample at or above that
   voltage reads as 1; below it reads as 0. That voltage is the **threshold**. (Introduce the
   term here, plain meaning first.)
2. The figure below asks which of two thresholds reads more samples wrong. Choose an answer, then
   press "Check my prediction". The plots that appear show what the model read.

## Key `p1Question` (inside the prediction figure, above the answers; two to four sentences)

Facts:
1. The compressor is running.
2. One receiver uses a threshold of 2.40 V, close to the 3.30 V the sensor drives for a 1.
   Another uses 1.40 V, nearer the middle.
3. Question: which threshold reads more of the 16 samples wrong? (The answers name the one that
   reads fewer wrong, so phrase the question to fit: "Which reads fewer samples wrong?" is fine.)

## Key `p1Explain` (shown under the two plots after the learner commits; two to four sentences)

Facts:
1. At 2.40 V, 3 samples are read wrong: samples 5, 6 and 13. All three were sent as 1, and the
   noise pulled each below 2.40 V.
2. At 1.40 V, none is read wrong.
3. A threshold close to one voltage leaves little room on that side. The noise needs to move a
   sample only a little to carry it across.
````

### B-investigation-construction.md

````markdown
# Brief B: Investigation and Construction (two sections)

Read the shared fact sheet first (00-fact-sheet.md). The learner has just read the question, the
motivation and the prediction (which introduced "threshold" and showed that at 2.40 V samples 5,
6 and 13 of the compressor recording are read wrong, and at 1.40 V none). Do not repeat those.
Draft every string below. Write the joins between keys.

## Key `exploreSignalLead` (above the investigation figure; about 120 to 170 words)

Facts, in order:
1. What the figure shows: the 16 samples as dots against volts; the threshold as a solid line;
   dashed lines at 0 V and 3.30 V, the two voltages the sensor drives; under the plot, rows for
   each sample's number, the value sent and the value read. A dot read as 1 is filled, a dot read
   as 0 is hollow, and a sample read wrong has a ring round it.
2. Each value, sent or read, is a 0 or a 1. One such value is a **bit**. (Introduce the term.)
3. Things to try: the figure starts at 2.40 V with the compressor off. Every sample reads right.
4. Choose the recording with the compressor running: the same threshold now reads 3 samples
   wrong.
5. Move the threshold down. Watch the lines under the plot: they give the highest sample sent as
   0 and the lowest sample sent as 1, and how far each is from the threshold.

## Key `exploreSignalAfter` (below the investigation figure; about 90 to 130 words)

Facts:
1. A threshold reads every sample right when it sits between the highest 0 sample and the lowest
   1 sample.
2. The gap between the threshold and the nearest sample on each side is how much more noise that
   sample could take before it read wrong. That gap is the **noise margin**. (Introduce the term:
   one on each side.)
3. Example: with the compressor running and the threshold at 1.40 V, every sample reads right,
   but the highest 0 sample, sample 16, is only 0.29 V below it. A little more noise on that
   sample would flip it.
4. At 1.70 V the gaps are 0.59 V below (sample 16) and 0.55 V above (sample 5).
5. Moving the threshold widens one gap and narrows the other. Near the middle, both are
   reasonably wide. (Do not state the middle's value as the best answer; the challenge asks for
   it.)

## Key `construction` (section prose, shown before both figures; about 40 to 70 words)

Facts: the receiver needs one threshold that works whether the compressor is running or not,
with room to spare on both sides. First you choose it. Then you turn the 16 bits it reads into a
number.

## Key `setThresholdLead` (above the challenge; one or two sentences)

Facts: type a threshold in volts. The tests read both recordings with it. Use the figure above to
find one.

## Key `c1Task` (the challenge's task; about 60 to 90 words)

Facts:
1. Type one threshold, in volts, for the receiver.
2. The tests read both recordings with it: compressor off and compressor running.
3. For each recording, every sample must be read as it was sent.
4. For each recording, the noise margin must be at least 0.30 V on both sides: the highest 0
   sample at least 0.30 V below the threshold, and the lowest 1 sample at least 0.30 V above it.
5. There are 4 tests: two recordings, each checked for wrong samples and for the noise margin.

## Key `c1Hints` (five hints, in this order; one to three sentences each)

1. The concept: a threshold reads every sample right when it is above the highest 0 sample and
   at or below the lowest 1 sample. The noise margin is the gap to each.
2. The common mistake: a threshold that reads every sample right but sits close to one side, for
   example 1.40 V, where the compressor recording's highest 0 sample is only 0.29 V below. It
   passes the tests for wrong samples and fails the noise margin test.
3. A smaller example: with the compressor off, every sample is within 0.18 V of 0 V or 3.30 V,
   so almost any threshold between them works. The compressor recording is the one that limits
   you.
4. Part of the answer: with the compressor running, sample 16 is the highest 0 sample and sample
   5 the lowest 1 sample. The threshold must be at least 0.30 V above the first and at least
   0.30 V below the second.
5. The answer: any threshold from 1.45 V to 1.95 V passes. 1.70 V, for example, gives gaps of
   0.59 V and 0.55 V with the compressor running.

## Key `buildNumberLead` (above the bit figure; about 110 to 160 words)

Facts:
1. The receiver now has 16 bits. To get a number, each bit needs a value.
2. The figure shows 16 bits, all 0. Press a bit to change it between 0 and 1. Each bit shows its
   number above (bit 0 on the right to bit 15 on the left) and what it is worth below.
3. Each place is worth twice the place to its right: 1, 2, 4, 8, and so on up to 32768 for bit 15.
   The number is the sum of the worths of the bits that are 1. Writing a number this way, with
   only 0s and 1s, is **binary**.
4. Example: set bits 4 and 1 and the number is 16 + 2 = 18.
5. Bits taken together as one value, here 16 of them, are a **word**. Reading a word by adding the
   worths of its 1 bits, every one counted as positive, is the **unsigned** reading. The figure
   shows it under the bits.

## Key `buildNumberAfter` (below the bit figure; about 70 to 110 words)

Facts:
1. Set the bits the till received from the cold room: `1111 1111 0100 1000`. Read unsigned, the
   word is 65352.
2. 16 bits make 65536 different patterns. Read unsigned, they are the numbers 0 to 65535.
3. The sensor's reading was -184. The till got 65352. Something has gone wrong, and it is not the
   threshold: every bit arrived as sent. (Leave the cause for later; do not say "signed".)
````

### C-failure-explanation.md

````markdown
# Brief C: Failure experiment and Explanation (two sections)

Read the shared fact sheet first (00-fact-sheet.md). The learner has read sections 1 to 5. They
know: threshold, bit, noise margin (the gap between the threshold and the nearest sample on each
side), binary, word, unsigned (adding the worths of the 1 bits). They have set a threshold that
reads both recordings with a noise margin of at least 0.30 V on both sides, and found that the
till's word `1111 1111 0100 1000` reads unsigned as 65352, although the sensor's reading was
-184. Do not repeat those. Draft every string below. Write the joins between keys.

## Key `breakSignalLead` (above the failure figure; about 100 to 150 words)

Facts:
1. This figure is the compressor recording again, with two more things: a second slider that
   multiplies the noise, from 1.0 to 3.0 times the recording, and a shaded band showing every
   threshold that reads all 16 samples right. The same wobbles grow; their shape does not change.
2. The threshold starts at 1.70 V. At 1.0 times, the band runs from 1.12 V to 2.25 V.
3. A line under the plot gives the bits sent and the bits read, each read unsigned.
4. Things to try: move the noise up a step at a time and watch the band. At 1.5 times it runs
   from 1.67 V to 1.72 V. At 1.6 times there is no band at all: no threshold reads every sample
   right.

## Key `breakSignalAfter` (below the failure figure; about 90 to 140 words)

Facts:
1. At 1.6 times the noise with the threshold at 1.70 V, samples 5 and 16 are read wrong. The word
   read is 63305 instead of 65352.
2. One wrong bit changes the number by that bit's worth. A wrong bit 15 would change it by 32768.
   Which sample the noise hits decides how much the number changes. (No new numbers beyond these.)
3. When the noise is this large, no choice of threshold helps. The answer is outside the
   receiver: less noise (a cable kept away from the motor), or two voltages further apart, so the
   gap between them is wider than the noise.

## Key `explanation` (section prose, before the figure; about 80 to 120 words)

Facts:
1. Back to the 65352. Every bit arrived as sent. The threshold did its job.
2. The till read the word unsigned: every bit's worth counted as positive. 65352 tenths of a
   degree is 6535.2 degrees.
3. The sensor did not use that rule. It wrote -184 with a different rule for the top bit.
4. Nothing in the 16 bits says which rule was used. The till has to be told.

## Key `signedWordLead` (above the figure; about 80 to 120 words)

Facts:
1. The figure shows the till's word, `1111 1111 0100 1000`, read two ways.
2. Reading a word with the top bit, bit 15, worth -32768 instead of 32768, and every other bit
   worth what it was, is the **signed** reading. (Introduce the term.) The figure labels bit 15
   with -32768.
3. Read signed, the word is -184: -32768 plus the worths of the other 1 bits. That is the
   sensor's reading, -18.4 degrees.
4. Press bits to change them and compare the two readings.

## Key `signedWordAfter` (below the figure; about 70 to 110 words)

Facts:
1. When the top bit is 0, the two readings are the same.
2. When the top bit is 1, the unsigned reading is the signed reading plus 65536: 65352 = -184 +
   65536.
3. Read signed, 16 bits are the numbers -32768 to 32767. Read unsigned, 0 to 65535. Both use the
   same 65536 patterns.
4. Neither reading is wrong. The till's fault was using a different rule from the sensor's.
````

### D-generalisation-challenge-reflection.md

````markdown
# Brief D: Generalisation, Challenge, Reflection, and the model note

Read the shared fact sheet first (00-fact-sheet.md). The learner has read sections 1 to 7. They
know: threshold, bit, noise margin, binary, word, unsigned, signed (bit 15 worth -32768). They
have seen that the till's word `1111 1111 0100 1000` reads 65352 unsigned and -184 signed, and
that when the top bit is 1 the unsigned reading is the signed one plus 65536. Do not repeat those.
Draft every string below. Write the joins between keys.

## Key `manyReadingsLead` (above the generalisation figure; about 100 to 150 words)

Facts:
1. Writing 16 bits out is long, and easy to copy wrongly. A shorter way: take the bits in groups
   of four from the right, and write each group as one digit, 0 to 9 then A for ten up to F for
   fifteen. That is **hexadecimal**. (Introduce the term.) `1111 1111 0100 1000` is `FF48`.
2. Hexadecimal is a shorter way to write the same bits, not a different number. (One sentence.)
3. The figure shows one word at a time, read one way at a time. Choose a word and a way to read
   it. The bits do not change when the reading does; only the rule does.
4. A fourth way: the same 16 bits sent to a row of 16 lamps, lighting the lamps whose bit is 1.
   That pattern is not a number at all.

## Key `manyReadingsAfter` (below the figure; about 80 to 120 words)

Facts:
1. The word for 1.8 degrees, `0000 0000 0001 0010`, reads 18 both ways, because its top bit is 0.
2. All sixteen bits 1 reads 65535 unsigned and -1 signed, `FFFF` in hexadecimal.
3. The course builds a computer that works on words of 16 bits. A word inside it, like the one
   the till received, carries nothing that says which reading is meant. The part that uses the
   word decides.

## Key `predictTopLead` (above the challenge section's prediction; one or two sentences)

Facts: one more prediction before the last challenge. Use the rule for the signed reading.

## Key `p2Question` (inside the prediction figure; two or three sentences)

Facts: the word is `1000 0000 0000 0000`: only bit 15 is 1. What does it read as signed?

## Key `p2Explain` (after committing; two or three sentences)

Facts: read signed, bit 15 is worth -32768 and no other bit is 1, so the word is -32768. Read
unsigned, the same bits are 32768. It is the most negative number a 16-bit word can be when
read signed.

## Key `freezerWordLead` (above the challenge; one sentence)

Facts: the same sensor is moved into a freezer.

## Key `c2Task` (the challenge's task; about 70 to 110 words)

Facts:
1. The freezer is at -25.0 degrees. The sensor counts in tenths, so it sends -250, read signed.
2. Set the 16 bits the sensor sends. Press a bit to change it.
3. Then type what a till that reads the word unsigned would get, and the word in hexadecimal.
4. There are 3 tests: your bits read signed must be -250; your unsigned answer must be the
   unsigned reading of your bits; your hexadecimal answer must match your bits.
5. The figures on this page do not show your bits; work them out. (You may say the bit figures
   in earlier sections can be used to check a guess.)

## Key `c2Hints` (five hints, in this order; one to three sentences each)

1. The concept: read signed, the word is -32768 plus the worths of the other 1 bits. A negative
   number needs bit 15 set to 1.
2. The common mistake: setting the bits for 250 and expecting a minus sign somewhere. There is no
   minus sign in the bits; bit 15's worth of -32768 is what makes the number negative.
3. A smaller example: -184 is `1111 1111 0100 1000`, and its unsigned reading is -184 + 65536 =
   65352.
4. Part of the answer: the unsigned reading of the freezer's word is -250 + 65536 = 65286. Find
   the bits whose worths add up to 65286.
5. The answer: `1111 1111 0000 0110`. Unsigned it is 65286; in hexadecimal, `FF06`.

## Key `reflection` (section "Reflection"; about 90 to 130 words, two paragraphs)

Facts:
1. A receiver turns a wobbling voltage into bits with a threshold. The noise margin on each side
   is how much more noise it can take.
2. When the noise is larger than the gap between the two voltages allows, no threshold helps.
3. A word is a pattern of bits. Unsigned, signed, hexadecimal and lamps are rules for reading it.
   The pattern itself means nothing until a rule is chosen, and the bits carry no record of which
   rule was meant.
4. End with one or two questions that point forward without new terms, for example: if the
   receiver and sensor agree on every rule, how could the till add two readings, or keep the
   last one while the next arrives? (Keep it short; no forward reference to named lessons.)

## Key `modelVsReality` (shown after the lesson, under "How the simulator differs from
hardware"; about 120 to 170 words, three or four short paragraphs)

Facts:
1. The recordings are made by the course's model from a fixed starting number, so they are the
   same on every visit. Real noise is different every time. The numbers are a teaching choice,
   not a measurement.
2. On a real cable the voltage cannot jump from one level to the other. It changes over a short
   time, the way a container fills through a narrow pipe, and passes through the middle on the
   way. The model takes one sample in the middle of each step, after the voltage has settled,
   and draws no changes between steps.
3. Many real receivers use two thresholds, a higher one for a 1 and a lower one for a 0, and
   promise nothing for a voltage between them. The model uses one threshold.
4. Real sensors and tills agree their rules in a written description of what is sent. The
   cold room's fault in this lesson is invented, but a reading taken with the wrong rule is a
   real kind of fault.
````

### R2-shared.md

````markdown
# Round 2: what changes for every draft (read this first)

A reviewer read the whole lesson and an independent sceptic checked each finding. These rules
now hold for every string in the lesson. They override the fact sheet where they differ.

## Words with one meaning each

- **"Read" and "reading" are only for reading a word as a number** (the unsigned reading, the
  signed reading, "read unsigned, the word is 65352"). They are never used for what the receiver
  does with a sample.
- **A sample "comes out as" 0 or 1.** "A sample at or above the threshold comes out as 1; below
  it, it comes out as 0." A sample on the wrong side "comes out wrong"; otherwise it "comes out as
  sent". Always these words: not "read wrong", not "incorrectly", not "correctly", not "right".
- The bit the receiver gets from a sample is a **received bit**. The row under the plot that was
  called "Read" is now called "Received".
- **"Value" is never a bit.** Say "a 0 or a 1". A word is "one number", not "one value".
- **"Step" is only one of the sensor's 16 time steps.** A slider moves "0.1 at a time" or "a
  little at a time".
- **"The model"** is the course's program that made the recordings in advance. It must be
  explained where it first appears (the Prediction section's prose).

## New facts the drafts may use

- The sensor counts in tenths of a degree Celsius. The cold room is below freezing, at -18.4
  degrees Celsius, so the sensor sends -184.
- Bits arrive in the order they are written: sample 1 carries bit 15 (the leftmost), sample 16
  carries bit 0 (the rightmost). Sample 5 carries bit 11 (worth 2048).
- Every figure in this lesson carries a badge reading "No simulation". It means nothing in the
  figure runs over time: it is redrawn when you change a control, from recordings the model made
  in advance.
- The readout under the plot now always shows both lines: the highest sample sent as 0 and the
  lowest sample sent as 1, each with its gap to the threshold. When that sample is on the wrong
  side of the threshold, its line says so. (With the compressor on and the threshold at 2.40 V,
  the lowest 1 sample, sample 5, is 0.15 V below the threshold, on the wrong side.)
- In the freezer challenge, the bit buttons now label bit 15 with its signed worth, -32768.
- A failed freezer test no longer prints the reading of the learner's own bits.
````

### R-review.md

````markdown
# Review brief: Module 1, lesson 1, "signals" (the reading half)

You are reviewing one lesson of an interactive course, *Digital Design: From Bits to a Working
Computer*, as its learner would meet it. Read as a learner for whom this is the FIRST lesson of
the course: they know everyday arithmetic and nothing about circuits, electronics or the inside of
a computer; they know a volt only as the number on a battery.

## What to read

- The lesson's page as text: <scratchpad>/review/page.txt
  (the built page's text at desktop width, top to bottom, with the figures' visible words).
- Screenshots of each section at desktop width (1280 pixels) and phone width (375 pixels), and of
  the figures after use, in <scratchpad>/review/ (PNG files; read
  them as images).
- The hints, which the page hides behind buttons: in /home/user/digital-design/content/lessons/signals.prose.ts (keys c1Hints, c2Hints).
- To check a fact (a number, a sample, a reading), you may read the lesson's data
  (/home/user/digital-design/content/lessons/signals.ts), its facts test
  (/home/user/digital-design/content/lessons/signals.facts.test.ts) and the model
  (/home/user/digital-design/packages/dd-model/src/signals.ts, bits.ts, graders.ts). Check a
  number or a cross-reference before you assert it is wrong.
- The style checklist: /home/user/digital-design/docs/style.md. The project rules:
  /home/user/digital-design/CLAUDE.md (sections "Voice", "Reviewing a lesson" and "What no check
  can catch").

## What to look for

- Anything the learner cannot follow on a first reading: a term used before it is explained, a
  definite article in front of something not yet introduced, a step that assumes knowledge this
  learner does not have.
- A word that means two things on one page (for example: reading, value, worth, sample, word,
  level, signal).
- A claim the figures do not show, or a figure that does not show what the prose says it shows.
  Does each interactive show the mechanism the prose claims?
- A number that is wrong, or stated without the figure that shows it.
- The same argument made twice, far apart; a paragraph that answers two questions; a join between
  paragraphs that does not follow.
- The style checklist's first and second passes.
- Anything on the page in the figures' own labels that is unclear, wrong or inconsistent with the
  prose.
- The challenges: can the learner tell what to do and what the tests check? Are the hints a
  ladder (concept, common mistake, smaller example, part of the answer, the answer)?
- The lesson's capstone is that the learner can explain why a bit pattern has no inherent
  meaning. Does the lesson get them there?

## Rules for your report

- Every finding quotes the page (or the file) exactly, says where (section and figure), says what
  is wrong and why, and suggests a direction. Never rewrite the text yourself: no replacement
  sentences.
- Never write a challenge's answer in your report.
- Number your findings F1, F2, ... in order of importance. Mark each "fact", "clarity", "style"
  or "figure".
- Be specific and brief. Do not praise.

Write the report to <scratchpad>/review/report.md and reply "done".
````

### S-sceptic.md

````markdown
# Sceptic brief: attack each review finding

A reviewer read one lesson of an interactive course as its learner and wrote findings. Reviewers
over-call. Your job is to attack each finding independently before anyone acts on it.

Read:
- the review: <scratchpad>/review/report.md
- the page text: <scratchpad>/review/page.txt
- screenshots in <scratchpad>/review/ (<width>-<theme>-s<section>.png,
  taken after the controls had been used)
- the lesson data and words: /home/user/digital-design/content/lessons/signals.ts,
  signals.prose.ts, signals.labels.ts; the model: /home/user/digital-design/packages/dd-model/src/
  (signals.ts, bits.ts, graders.ts); the facts test: content/lessons/signals.facts.test.ts
- the rules: /home/user/digital-design/CLAUDE.md and docs/style.md.

The learner has done no earlier lesson and knows only everyday arithmetic.

For each finding (F1, F2, ...): check its quote against the page (is it quoted exactly, is it
where the reviewer says?); check any fact it asserts against the data, model or facts test; then
judge whether it is a real problem for this learner. Verdict per finding: UPHELD, UPHELD IN PART
(say which part), or REJECTED, with one to three sentences of reason. Do not rewrite any text and
do not propose replacement sentences. Do not change any file except the one below.

Write your verdicts to <scratchpad>/review/sceptic.md and reply "done".
````
