# Module 2: Boolean logic (three lessons)

A working note, written as the module was built. "The managing model" is the session that built
the lessons; "the drafting subagent" drafted every learner-facing string from a brief of checked
facts. It records what went wrong as plainly as what went right.

## Times

Read from the clock (`date -u`), not estimated.

- Started: 2026-10-05 15:02 UTC (first command in the session).
- Finished: 2026-10-05 16:36 UTC (the last commit, with the note complete). About 94 minutes in all.

## Log

- 15:02 to 15:08 Read CLAUDE.md, docs/notes/modules-2-and-3-plan.md, docs/authoring.md,
  docs/style.md, docs/simulator.md, docs/inventory.md (sections 1, 2, 7, 8, 8.1), docs/checkpoints.md,
  the three lessons with their prose and labels files, and the notes for Module 1, Module 5 and
  the first fix pass. Built the course and looked at the remember lesson's builder and explorers
  in screenshots.
- Found while reading, before writing anything:
  - **The simulator already has every gate the module needs** (NOT, AND, OR, XOR, NAND, NOR,
    XNOR, all variadic but NOT), and the builder already offers any of them by palette id. No gate
    kind was added.
  - **Nothing measured a circuit except its rows.** A gate budget, a depth and a "NAND only" rule
    had nowhere to live: the verdict is a list of failing rows or steps, each with inputs and
    values. Grading by gate count and depth is the plan's to Module 2.
  - **A drawn challenge's import panel accepts any construct the challenge allows**, so a palette
    of NAND alone does not stop a learner importing `A & B`. A NAND-only challenge needs the
    kinds checked by the grader, not by the palette.
  - **The truth table figure could enumerate a library circuit, but the explorer could not show
    the circuit's own table** with the row of the inputs now marked; it showed only the latches'
    reference tables.
  - **The text figure writes one `assign` per gate**, with a named net for every wire. An
    expression beside its circuit needs the other form, one line per output.
  - The term gate's pattern is `\bterm\w*`, case-insensitive. The plan already warns against
    rationing ordinary words; it applies to "NOR" ("neither ... nor"), which I did not see until
    the gate failed (below).
- 15:08 to 15:20 Platform work, code first, each piece with tests, committed on its own
  (`c696fb7`):
  - `dd-model/measure.ts`: gate count, depth (the longest input-to-output path in gates, with the
    path), and the gates of a kind not allowed.
  - `dd-model/tables.ts`: a circuit's truth table from the simulator, two circuits compared row by
    row (every output, matched by name), and a table's rows set out in pairs that differ in one
    input. The figures and the facts tests both read these.
  - `dd-model/logic.ts`: the module's library circuits (single gates, tied NAND and NOR, ALARM,
    CLASH two ways, OR and XOR from NAND, the manager's CALL and the four-gate CALL, the
    too-short CALL, a chain and a tree of OR gates, two lamps separate and shared), merged into
    `LIBRARY` in one appended block.
  - Challenge `limits` in the schema (`gates`, `depth`, `only`), each one more test;
    `testCount` counts them; an answers challenge that sets them fails `checkLesson`. The book's
    grader runs the rows, then each limit, and a failed limit carries a sentence (`detail`) and
    the parts it is about (`marked`), which the drawing marks. The runtime shows the detail in
    place of the empty inputs and values. That is the runtime's only change.
  - `hdl/expression.ts`: each output as one expression; `circuit-text` gained `form: "expression"`.
  - The explorer's `truthTable: "circuit"` (the circuit's own rows, the row now marked, and no
    signal list, which would say the same thing twice).
  - Two figure kinds: `circuit-compare` (two circuits one above the other, gate count and depth
    under each, the rows that differ marked; with a question it is a prediction that hides all of
    that until the learner commits) and `input-pairs` (pick an input; the table's rows in pairs
    that differ in it alone, each saying whether it changed the output).
  - docs/authoring.md lists the new props and kinds.
- 15:13 to 15:20 (inside the same stretch) Library circuits placed by hand and looked at. The
  manager's eight-gate CALL first drew its three inverters among the AND gates' input rows, so
  wires ran through them; moved below the AND gates, the drawing reads cleanly. Two compared
  drawings side by side made the eight-gate one scroll in half a page; the compare figure now
  stacks them.
- Renamed while placing: the two-sensor lamp was CHECK, but the fault figure's button on the same
  page is "Run checks"; it became CLASH. The four warehouse rooms' inputs were WARM1 to WARM4,
  the names lesson 1 gives the two sensors; they became ROOM1 to ROOM4.
- 15:20 Platform committed alone, the whole check green on it except nothing yet used it.
- 15:21 to 15:25 The fact sheets and briefs (appendix): one shared sheet for the module
  (`00-module.md`: voice, the learner, the setting, working words with one meaning each, the
  rationed terms and where each lesson introduces them, the words no lesson may use, the page's
  controls by their exact labels, the course's text), one facts sheet per lesson
  (`G-`, `N-`, `F-facts.md`), four prose briefs per lesson (A to D), one labels brief for all three
  lessons (E) and one for the new figures' words (V). Every number in them was read off the
  simulator first (scratch explorations writing to a file, as Vitest's console is unreliable).
- **Found in my own briefs before they went out: "hold" five times** ("what each section holds",
  "chips that each hold four NAND gates", "a small part that holds several gates"). "hold" is
  Module 4's term and the term gate matches every form of it. A scan of the briefs for the banned
  words caught them; the module 5 note warned of exactly this. Also "remember" (in a quotation
  of a later lesson's title) and "from memory".
- 15:23 E and V went out first, alone, so the prose briefs could quote the page's controls and
  fault labels from one place. While they ran, briefs A to D.
- 15:28 to 15:33 Drafts back and checked for facts only. What each draft dropped, got wrong or
  drifted, and what was done:
  - **V (figure words).** `limits.and` came back as "and" with no spaces, which the brief asked
    for: the managing model added the spaces (a format fact). Later the walk showed
    `limits.onlyFound` printing "only NAND are allowed": the brief had not said `{kinds}` is a gate
    name, not a plural; sent back, now "only {kinds} gates are allowed".
  - **E (labels), round 1.** Dropped the signal from every prediction option ("0" for "ALARM is
    0"; they show inside "You chose {option}."), "Recognize" (American spelling), a colon in a
    section title, two reflection titles that only said "What next?", fault labels with full stops
    and a comma splice. Sent back with six notes; all fixed. Round 2: lesson 3's failure section
    was titled "Simplified too far", above a prediction asking whether the simplified circuit is
    right; sent back, now "The simplified circuit".
  - **GA** first replied with a description of its drafts instead of the text, as six briefs did
    in the first fix pass; asked again. Then: a Unicode minus in "−15.0" (the course writes "-");
    the rest right.
  - **GB** right; "two inputs give four combinations" written as a word (the managing model wrote
    the digit).
  - **GC** right first time on every fault row.
  - **GD.** Wrong fact in the hardware note: "Real gates are made of voltages" (a gate's inputs
    and output are voltages); sent back. Dropped why the shop fits a second sensor (the managing
    model added one sentence); "Watch the table: which AND gate's output becomes 1?" (the table
    does not show the AND gates; changed to "the drawing"); "hold" in the hardware note, the
    banned word, from the draft not the brief (changed to "contain"); a repeated sentence in the
    reflection cut.
  - **NA.** Dropped "failed" from "replace any failed chip" (added).
  - **NB.** Wrong fact: "Each challenge has two tests. The rows test checks the truth table."
    (each row is its own test); and the AND challenge's lead gave the method away ("now undo
    it"). Sent back; fixed.
  - **NC.** "from lesson 1": the course does not number lessons; changed to "the last lesson".
  - **ND.** "The engineer's drawer holds only NAND chips": wrong twice (nearly all; and "holds",
    the banned word). "we write", "just", "actually", and a reflection that added a fact the brief
    did not give ("Speed? Size? Power? That is what matters."). Sent back; fixed. "hold" again in
    its hardware note (changed to "contain").
  - **FA.** Wrong fact: "The freezer's display has a third lamp" (it is the office display, and
    CALL is the fourth lamp); misquoted the last lesson's question; dropped the closing question.
    Sent back; fixed.
  - **FB.** Dropped "It starts on WARM" (added).
  - **FC.** Wrong cause: "Both use the same three OR gates, so both have the same truth table."
    Sent back; fixed. Dropped "freezer rooms in the shop's warehouse" (added).
  - **FD** first replied with a description; asked again. Then: "The left drawing ... The right
    drawing" (the compare figure stacks them); "from lesson 2"; "built from smaller ones and runs
    slower" where the fact is one or the other. All three changed by the fewest words.
  - Totals for round one: 16 drafts (E and V included); 2 replies that described instead of
    drafting; 6 wrong facts (GD, NB, ND, FA twice, FC); about 6 dropped facts, each restored by
    added words; 4 uses of a banned word (3 "hold", one from my own brief before it went out);
    no sentence rewritten by the managing model. Every edit the managing model made is a line in
    a list the placement script applies and fails on if it no longer matches (the first fix pass
    recommended exactly this).
- 15:34 to 15:36 Placed with a script (drafts to the prose files by key; the edit list applied).
  **The term gate failed: "neither 0 nor 1" contains "nor".** The plan says never to ration a
  word that is ordinary English in lower case; "NOR" is one. NOR is still introduced, in bold, in
  lesson 2's generalisation, but is not in its `introduces`, with a comment saying why. "gate",
  "depth" and "universal" are ordinary words too, but no earlier lesson uses them, so rationing
  them costs nothing and catches a use before the lesson; the judgement is recorded here.
- 15:36 to 15:40 Educational spec `tests/educational/module2.spec.ts` (44 tests at two widths:
  every challenge completable with its reference through the page; DOOR wired straight in,
  NIGHT without brackets, an AND imported into a NAND-only challenge, XOR in five NAND gates
  against a limit of four, CALL simplified too far, each rejected with the row or the limit named;
  NOT from NAND built with the keyboard alone; graded again on load and not bypassed by a
  tampered store; reset in two steps; hints one rung at a time; the predictions, the explorer's
  own table, the fault figure, the pairs figure, the comparison and the chain and tree, each
  answering with what the simulator does). All passed on the first run.
- 15:38 **The diagram check caught a real fault:** a one-step prediction's timing diagram was
  narrower than its own step label ("WARM 1, DOOR 1" left the drawing at both widths). The
  timing diagram now stretches a short run until its longest mark label fits. The four existing
  screenshot baselines did not move.
- 15:40 to 15:42 The first whole-lesson read on the built page (my own second pass): the
  hardware note said the simulator works out "each gate's output from its inputs, then the next
  gate's", which is wrong (every gate is worked out at once in each step); "beside it" for text
  that is under the drawing; "Press WARM1 and WARM2" three times in a row. Left for the round
  after the review, so each line went through one brief.
- 15:41 **The check failed** (its exit status read from the log: the wrapper's own echo exited 0):
  the book test formatted the drafted "only" sentence without its new `{kinds}` slot. Fixed.
- 15:45 Check green: 277 Vitest tests, 180 Playwright tests. Commit `1bab3cd` (amended once,
  before the push, for a Prettier line). Pushed at 15:46.
- 15:46 to 15:58 The mechanical half, by a Playwright walk of the built page at 1280 and 375
  pixels in the light and dark themes, every figure used (every radio, slider end and button),
  every challenge run with its starting point, a plausible wrong attempt and its reference. No
  console error, no control without an accessible name, no horizontal page overflow, no "NaN" or
  "undefined" in any of the twelve configurations. Every challenge blocked on its start ("Draw a
  circuit.", "the output NIGHT is never assigned"), rejected the wrong attempt with its row or its
  limit, and passed with its reference. One wording fault ("only NAND are allowed", above).
- 15:48 to 16:05 The reading half: one reviewer per lesson, on a different model from the one
  that built the lessons (as the checkpoint's verdict asks), each with the written brief in the
  appendix; one sceptic per review, also on that model. The subagents could not write files; the
  managing model saved each report and each set of verdicts unchanged in substance before the
  next step read it. The findings, the verdicts and what was done are in the tables below.
- **A review caught a missing test.** The third lesson had no facts test: I had written lessons 1
  and 2's and not this one, and nothing failed. Written at once (eight tests, every number the
  prose states). Nothing in the check knows that a lesson should have a facts test; a content
  test could require one per lesson.
- 16:02 to 16:12 Fixes, code first, then round two of the briefs (each finding as facts, sent to
  the subagent that drafted the key), then placement and a whole read:
  - **Lesson 1's prediction asked what the question had already said** (warm with the door open
    lights nothing) **and drew the construction's answer.** It now draws a first try with an OR
    where the AND belongs, run with the freezer cold and the door shut: the learner must trace two
    gates, the answer (ALARM is 1) contradicts the rule, and the construction is not a copy. The
    fault list lost its own AND-to-OR fault, which the prediction now covers, and gained an extra
    NOT slipped into SHUT.
  - **Lesson 3's prediction also asked what the question had said.** It now runs two steps, all
    three inputs at 1 and then WARM to 0, and the timing diagram shows and3 and and4 trading the
    1 (the prediction's `signals` gained labelled lanes for inner wires, which the timing diagram
    already supported).
  - **Both fault figures put their outcomes under the figure, visible before the learner had
    tried, under a lead asking them to say first.** A fault figure can now hold `outcomes`, shown
    only once "Run checks" has been pressed. The earlier lessons' fault figures are unchanged.
  - **A fault can carry the lesson's own explanation**: the fault library's stuck-at sentence
    ("like a shorted or jammed input") is jargon on a first lesson, and the drawing's CONST box
    needed a sentence.
  - The rest went to the drafting subagent. Round two's results: GB dropped the fact about the
    panels under the drawing (restored by the fewest words); ND's hint 4 copied my note to it
    ("Do not call these AND gates") into the hint itself (cut); GC wrote "The expression names
    the gates, not the wires", which is wrong (cut); my own earlier edits that a redraft made
    unnecessary were retired from the edit list. One label went stale (lesson 1's prediction
    section was still titled "Freezer warm, door open"); found at the second read and redrafted.
- 16:12 to 16:24 The mechanical half once more, on the rebuilt page, all twelve configurations:
  no console error, no unnamed control, no overflow; every challenge as before; the fault
  figure's outcomes appear only after "Run checks". Then each lesson read once more, start to
  finish: no new finding.
- 16:25 Check green (286 Vitest tests, 180 Playwright tests); committed. `main` had moved (a page
  before the first lesson, two commits); merged, with one conflict where both sides appended to
  `course.css` (both kept). The check on the merged head: green, 291 Vitest tests, 184 Playwright
  tests. Pushed.

## The reviews, the sceptics' verdicts, and what was done

"Code" is fixed in code or lesson data, with a test. "Redrafted" is new words from a fact brief to
the drafting subagent. The reviews and verdicts as saved are reproduced at the end of the appendix.

### Lesson 1, `gates` (13 findings: sceptic 2 upheld, 8 in part, 2 rejected, 3 found)

| # | finding (short) | sceptic | action |
| --- | --- | --- | --- |
| F1 | the question's rule answers the prediction | in part | **code**: the prediction is now a first try with an OR, run cold and shut; redrafted |
| F2 | the prediction draws the construction's answer | in part | the same change; the construction prose no longer mentions copying |
| F3 | fault outcomes visible before the learner tries | upheld | **code**: `outcomes` shown after "Run checks"; redrafted |
| F4 | X described two ways; the badge unexplained | in part (X only) | redrafted: X is what a cut wire gives because nothing drives it |
| F5 | "Unconnected", "As text", "Import from text", "port" unexplained | in part | redrafted: a port and the three panels said in the construction |
| F6 | phone scroll; CONST and "shorted or jammed" | in part (CONST, jargon) | **code**: a fault may carry the lesson's explanation; drafted |
| F7 | `logic`, SHUT not in the figure, no worked row | in part | redrafted |
| F8 | the badge's note and the hardware note repeat | in part | redrafted: the hardware note drops the stepping |
| F9 | "Press WARM1 and WARM2" three times; "Both do the job"; no `assign` | upheld | redrafted |
| F10 | "Why?", "This is the rule:", "Here comes", "That raises a question" | upheld | redrafted |
| F11 | NIGHT has no reason; the reflection recaps | in part | redrafted |
| F12 | inverter, timing diagram, bit order | rejected | none |
| F13 | "Applies now", "worked out every row" | rejected | none |
| (sceptic) | DOOR means the door and the signal | | the stuck fault's label and outcomes say "even when the door is open" |
| (sceptic) | CONST off-screen on a phone | | the fault's explanation names it |
| (sceptic) | the reflection's heading and closing question repeat | | the reflection asks only the second question |

### Lesson 2, `nand` (11 findings: sceptic 2 upheld, 6 in part, 3 rejected, 2 found)

| # | finding (short) | sceptic | action |
| --- | --- | --- | --- |
| F1 | "three circuits" but two built | upheld | redrafted: NOT and AND built, OR read and broken |
| F2 | the prediction gives the first challenge away | in part (the lead and hints) | redrafted: the lead says only "NOT first" |
| F3 | the XOR hints call NAND gates AND gates; the order | in part | redrafted: a ladder that says what each NAND gives |
| F4 | "XOR needs five NAND gates here" | in part | redrafted: "the plan above used five" |
| F5 | CLASH never called XOR; A and B unmapped | upheld | redrafted |
| F6 | the spares and "correct, not small" said twice | in part | redrafted: each once |
| F7 | "tied" undefined | in part | redrafted: defined where the prediction is explained |
| F8 | phone scroll | rejected | none (documented behaviour) |
| F9 | not2 above not1 | rejected | none (the order keeps wires from crossing) |
| F10 | the NOR paragraph is dense | in part | redrafted |
| F11 | style: label, "Now the question is", "names it" | in part | redrafted |
| (sceptic) | hint 3 speaks of B on a one-input challenge | | redrafted |
| (sceptic) | the shortcut before the plan in the XOR hints | | the new ladder |

### Lesson 3, `fewer-gates` (15 findings: sceptic 4 upheld, 9 in part, 2 rejected, 4 found)

| # | finding (short) | sceptic | action |
| --- | --- | --- | --- |
| F1 | "room left for 4 more gates" | upheld | redrafted: room for 4 gates for CALL |
| F2 | "Two AND gates do the work of one" backwards | upheld | redrafted |
| F3 | the question answers the prediction | in part | **code**: the prediction flips WARM and shows and3 and and4; redrafted |
| F4 | "Two shaded pairs" wrong | in part | redrafted: one under each input; the build uses two |
| F5 | dense lead; "It" without a noun | in part | redrafted |
| F6 | the mistake's cause blurred | in part | redrafted; the option label redrafted |
| F7 | the figures open on "Settled in 3 steps." | in part | redrafted: the lead says why; the figure is shared, so not changed |
| F8 | "settles" undefined | in part | redrafted |
| F9 | the challenge lead gives hint 1; hint 3 before 4 names P and Q | upheld | redrafted |
| F10 | NOT and OR count; hint 2 a fragment | in part | redrafted |
| F11 | "same outputs in all 8 rows" twice; "CALL's first AND gate" | in part | redrafted |
| F12 | the signal table and the time note | rejected | none |
| F13 | the eight-gate wires hard to trace | rejected | none (placed by hand so no wire crosses a gate) |
| F14 | "the short CALL"; repeats | in part | redrafted |
| F15 | the question joins two questions with nothing | upheld | redrafted |
| (sceptic) | no facts test for this lesson | | **test** written: eight tests |
| (sceptic) | "lesson 1 of this module" vs "the first lesson of this module" | | both now "the first lesson of this module" |

The sceptic of lesson 3 claimed hint 3's reasoning had its parentheses swapped. Checked against
the model: it was right as written. The hint was redrafted anyway for F9.

## Why three lessons, split where they are

The curriculum row is NOT, AND, OR, XOR, truth tables, expressions, NAND universality,
simplification and depth, with a lab (the builder with tests and fault diagnosis) and a capstone
(NOT and XOR from NAND, and a minimised circuit under a gate budget). Each existing lesson carries
one question through predict, build, break, explain and generalise; the row holds three questions.

1. **`gates`: how do you build a circuit from a rule?** NOT, AND and OR as gates, the truth table,
   the circuit as a Boolean expression, XOR. Built: the ALARM lamp (drawn) and the NIGHT lamp
   (written). Broken: ALARM, three ways.
2. **`nand`: can you build every gate from NAND alone?** NAND, "universal", NOR. Built: NOT, AND,
   and XOR from NAND alone (the capstone's first half). Broken: an OR made of NAND gates.
3. **`fewer-gates`: how do you build a circuit with fewer gates?** Simplification by pairs of rows,
   checking a simplification against every row, depth, sharing a gate. Built: CALL in four gates
   (the minimised circuit under a gate budget) and XOR in four NAND gates (both capstone halves
   meet here). Broken: a simplification one step too far.

The split puts each capstone where its question is asked: NOT and XOR from NAND close the lesson
about one kind of gate; the budget closes the lesson about fewer gates, and its last challenge
answers the question the second lesson ends on.

## Karnaugh maps: not used, and why

The inventory deferred maps to Modules 2 and 3. Simplification here is taught on the truth table
itself, with a figure (`input-pairs`) that sets the rows out in pairs that differ in one chosen
input and says, for each pair, whether that input changed the output. Reasons:

- A map is a layout trick for spotting those pairs by eye: adjacent cells differ in one input.
  The figure computes the pairs from the simulator's own table, so the learner sees the mechanism
  the map exists to show, with no second notation (Gray-code order, wrap-around adjacency) to
  learn first.
- A map stops being usable by eye beyond four inputs; reading pairs works at any width, and the
  same idea is what a program does.
- The textbook sequence (truth table, sum of products, map) is one the task names as the standard
  presentation to avoid.
- The cost: a learner meets groups of two only, not groups of four. The CALL rule needs no more.
  A later module that needs a group of four can use the same figure twice (pairs of pairs).

## What was reused

The simulator and every gate it already had; the builder and its palette; the challenge runner,
hint ladder, re-grading on load and reset; the explorer, prediction, fault figure, text figure and
truth table figure; the timing diagram; the educational test helpers; the diagram and look checks
(which caught the timing diagram's label); the screenshot machinery.

## What was added to the platform, and why

- **Grading by limits** (`limits` on a circuit challenge: `gates`, `depth`, `only`), each one more
  test with a sentence and the parts it marks. The curriculum's capstone is a gate budget, and a
  NAND-only challenge cannot rely on its palette because text can be imported.
- **Measures in the model** (`measure.ts`): gate count, depth with its path, gates of a kind not
  allowed.
- **Tables in the model** (`tables.ts`): a circuit's truth table, two circuits compared row by row
  on every output, rows paired by one input. The figures and the facts tests read the same
  functions.
- **The explorer's own table** (`truthTable: "circuit"`), because the investigation is reading a
  gate's table as the inputs are pressed.
- **Expressions** (`hdl/expression.ts`, `circuit-text` with `form: "expression"`): an expression
  shown beside the circuit it describes, as the task suggested.
- **`circuit-compare`** (two circuits, their gate counts and depths, the rows where they differ,
  with or without a prediction) and **`input-pairs`** (above).
- **Fault figure**: `outcomes`, shown only after "Run checks"; a fault's own `explanation`.
- **Prediction**: labelled lanes for inner wires in its timing diagram.
- **Timing diagram**: a short run is stretched until its longest step label fits.
- **Runtime**: a failure may carry a `detail` sentence and `marked` parts (a limit has no row).
- Every new learner-facing string is in `dd-views/strings.ts` (blocks `compare`, `pairs`,
  `limits`, `explorer.ownTable`), drafted by the drafting subagent (brief V).
- No gate kind was added: the simulator had them all.

## The terms each lesson introduces

- `gates`: gate, truth table, Boolean expression, XOR.
- `nand`: NAND, universal. NOR is introduced but not rationed (see 15:34 above). "Tied" is a
  plain word defined where it is first used.
- `fewer-gates`: depth.
- No term was moved from a later lesson; "propagation delay" stays with Module 4 (the depth lesson
  says "a real gate takes a short time to answer" and needs no more). No earlier lesson needed a
  `termExemptions` entry: Module 1 uses none of these words.
- Modules 4 and 5 call a NOT gate an "inverter" and assume gates; lesson 1 says "a NOT gate is
  also called an inverter" and that a gate's output depends only on its inputs now, which is the
  sentence Module 4 opens with.

## What the check script caught

- The term gate: "nor" in "neither 0 nor 1".
- The diagram check: the one-step timing diagram's label leaving its drawing.
- The book test: the redrafted "only" sentence's new slot.
- The look check's screenshot of the pairs figure, when its lead was redrafted (updated on
  purpose with `--update-snapshots=all` and looked at).
- The content test: a prediction prop (labelled lanes) the schema did not yet accept.
- Not caught by any check: a lesson with no facts test (a reviewer found it); the predictions
  answerable from the question's own words (the reviewers found them); outcomes printed under a
  figure that asks the learner to say first; "the expression names the gates" (my second pass).

## What I would change

- **Write every lesson's facts test before its briefs, and have the content tests require one.**
  I wrote two of three and nothing noticed; a reviewer did. A test that every lesson in
  `content/lessons/` has a `<id>.facts.test.ts` would have.
- **Read each prediction against the section before it, as a learner would, before drafting.** Two
  of three predictions were answerable from the question's own statement of the rule. The content
  test that guards word predictions cannot see this for circuit predictions, whose answers are 0
  and 1; a human read can. Asking "what does the learner know, from the page above, that answers
  this?" for each prediction belongs in the fact sheet.
- **Scan the briefs for the banned words with a script, not by eye.** I found my own "hold" five
  times by a grep; the drafts then produced three more "hold"s of their own, and those a grep of
  the placed text found. Both scans should be a step of the placement script.
- **Ask for the text in the final message, twice.** Two of sixteen subagents still replied with a
  description, though the brief said "your final message is the keys and nothing else". The
  prompt that launches a subagent should say it as well; mine did, and it was not enough.
- **Do not put my own notes to a subagent inside a hint's facts.** "Do not call P and Q AND gates"
  came back inside hint 4, word for word. A note to the drafter should be marked as such.
- **One name for each earlier lesson.** The drafts said "lesson 1", "the last lesson", "the first
  lesson of this module". The fact sheet should give the lessons' names, or say how to refer to
  them.
- **The explorer's opening count.** A stepped explorer opens on the steps of its own first settle
  from unknown ("Settled in 3 steps." before any press). The lesson now says why; the figure could
  say nothing until the learner changes an input. That is a change to a shared figure (and to
  Module 4's screenshot baselines), so it is left for the author.

## Questions for the author

1. **The explorer's status line before any press** (above): show nothing until the learner changes
   an input? It would change the remember lesson's investigation figures and their baselines.
2. **NOR is not rationed** because "nor" is ordinary English. If the course wants NOR gated, the
   term gate could match terms case-sensitively when a term is written in capitals.
3. **On a phone every drawing wider than the screen scrolls sideways**, as in the earlier lessons.
   Two reviewers found the output lamp off-screen in this module's drawings; both sceptics
   rejected it as documented behaviour. It stays as it is.

## Appendix: the briefs, as sent, and the reviews, as saved

Each brief went to a drafting subagent with docs/style.md attached and the shared fact sheet and
the lesson's facts sheet to read first. The managing model's edits to the briefs before they went
out (the "hold" scan) are applied here. Round-two notes went as messages to the same subagents; each
carried the facts in the tables above. Fault labels and the "Only NAND gates" test name were
filled into the briefs from the drafted labels before the prose briefs that quote them went out.

### 00-module.md

````markdown
# Shared fact sheet: Module 2, "Boolean logic" (three lessons)

You are drafting learner-facing text for an interactive course, *Digital Design: From Bits to a
Working Computer*. Every fact below has been checked against the course's simulator. Use only
these facts and the facts in your brief. Do not add numbers, values, names or claims that are not
here. If a sentence seems to need a fact that is not here, write a note in square brackets
instead of inventing it.

Your final message must be the drafted strings under their keys, and nothing else: no
description of what you wrote, no commentary.

## Voice

- British English. Direct, precise, active voice, short sentences (about twenty words at most).
- The learner is "you". No marketing tone, no filler, no "in this lesson we will", no "let's".
- No em dashes and no en dashes used as dashes. Use a full stop, a colon or a comma.
- Say the point; do not label it ("that is the key idea"), withhold it ("the third one is the
  one that matters"), or wrap it in a roundabout purpose.
- No intensifiers: actually, exactly (unless exactness is the claim), really, simply, just,
  genuinely, entirely, quite, very.
- Use "press" for buttons and input pins, never "click" or "tap".
- Markdown is allowed: `code` for text the learner types or reads in the circuit's text, **bold**
  for a term at the place it is introduced, and short lists. No headings.
- Numbers as digits ("4 rows", "2 of 4"), as the page prints them.
- The attached style checklist (docs/style.md) applies to every sentence.

## Who the learner is

The learner has finished Module 1 and nothing else. They know: bit (a 0 or a 1), threshold, noise
margin, binary (each place worth twice the one to its right), word (a fixed number of bits taken
together), unsigned, signed, hexadecimal. They can turn binary into decimal and back.

Module 1's story: a shop's freezer room has a temperature sensor. It sends the temperature in
tenths of a degree, as a 16-bit word, along a 30-metre cable to a display in the shop's office.
The display reads the word as a signed number.

The learner has never seen a gate, a circuit diagram of gates, or the course's circuit text.

## The setting of Module 2

The display in the office now has three more signals. Each is one bit: 1 or 0.

- **WARM** is 1 while the freezer room is warmer than -15.0 degrees. The display sets it from the
  temperature. (How it does that is not part of this module; do not explain it.)
- **DOOR** is 1 while the freezer room's door is open. A switch on the door sets it.
- **CLOSED** is 1 while the shop is closed. The manager sets it with a key switch when locking up.

The display has lamps, each driven by one signal. A lamp lights while its signal is 1. The
module's lamps are ALARM, NIGHT, CLASH (lesson 1) and CALL (lesson 3). Each lamp's rule is a
rule about the bits now, not about what happened before.

## Working words (one meaning each on every page)

- **signal**: a named wire carrying a 0 or a 1 (WARM, DOOR, ALARM, A, B, Y).
- **value**: the 0 or 1 a signal carries now. Never "worth", never "reading".
- **input** and **output**: the signals going into and coming out of a gate or a circuit. The
  input pins in the figures are buttons: pressing one flips it between 0 and 1.
- **row**: one line of a table: one combination of input values and the output it gives.
- **rule**: what the shop wants a lamp to do, said in words.
- **lamp**: one of the display's lamps; it lights while its signal is 1.
- **circuit**: gates and the wires between them.
- **wire**: what joins an output to inputs. A wire can join one output to several inputs.
- **test**: one check that a challenge's "Run tests" runs. **check**: one step of a fault
  figure's "Run checks". Do not mix these.
- **X**: the simulator's mark for a value it cannot know, for example on a wire that nothing
  drives. X is neither 0 nor 1.
- **chip**: (lesson 2 on) a small part that contains several gates of one kind.
- **board**: (lesson 2 on) the board the engineer builds the lamps' circuits on.

## Rationed terms: who introduces what

A term may be used only in the lesson that introduces it, from the point where it is introduced,
and in later lessons. Introduce each one in plain words first, then the term in **bold**.

| term | introduced in | plain meaning |
| --- | --- | --- |
| gate | lesson 1, investigation | a part whose output depends only on its inputs now |
| truth table | lesson 1, investigation | a table with one row for every combination of input values, and the output each gives |
| Boolean expression | lesson 1, explanation | a formula of signal names joined by NOT, AND and OR (written `~`, `&`, `|`) that gives a 0 or a 1 |
| XOR | lesson 1, generalisation | a gate whose output is 1 when exactly one of its two inputs is 1 |
| NAND | lesson 2, question | an AND followed by a NOT: output 0 only when every input is 1 |
| universal | lesson 2, explanation | a kind of gate from which every truth table can be built |
| NOR | lesson 2, generalisation | an OR followed by a NOT: output 1 only when every input is 0 |
| depth | lesson 3, explanation | the number of gates on the longest path from an input to an output |

## Words you must not use anywhere (later lessons own them, or they mean something else here)

feedback, latch, transparent, edge, propagation delay, setup, hold (in any form: holds, held,
holding), metastable, register, shift register, flip-flop, clock, memory, state, remember,
multiplexer, demultiplexer, decoder, encoder, comparator, adder, carry (in any form), overflow,
bus, business, sum of products, minterm, Karnaugh, map, De Morgan, algebra, transistor.

Say "keeps" or "stays" where you want "holds". Say "shop" or "store", never "business".

## The page's own controls (exact labels)

- Every figure that runs the simulator has a badge "Stepped". Its note says every gate takes one
  step and the circuit is recomputed until nothing changes. Prose need not explain the badge.
- Explorer figures: the input pins are buttons; pressing one flips it between 0 and 1. A button
  "Start again" sets every input back to 0. Under the drawing a table headed "Every row of this
  circuit" lists every row; the row of the inputs now is shaded and marked "Applies now".
- Prediction figures: the circuit is drawn first. Choose an option, then press
  "Check my prediction". Then the page says what the circuit gave, and shows a timing diagram of
  the run. "Predict again" clears the choice.
- Fault figures: a list headed "Fault options", starting with "No fault". The broken circuit is
  drawn and runs: press its input pins. A button "Run checks" tries every row and reports
  "N of 4 checks failed." with each failing row: what the output was and what was expected.
- Challenges: a drawing area with part buttons above it ("Add AND", "Add OR", "Add NOT",
  "Add NAND"); press one port and then another to wire them. "Run tests" runs every test;
  a failing test names its row, what the circuit gave, what was expected, and the gate that
  drives the wrong signal. "Clear work" discards the work. A hint ladder, one rung at a time.
  A written challenge has a text box instead of a drawing.

## The course's circuit text

The course writes circuits as text as well as drawings. Lesson 1 introduces it:

```
module alarm(input logic WARM, input logic DOOR, output logic ALARM);
  assign ALARM = WARM & ~DOOR;
endmodule
```

- The first line names the circuit and lists its inputs and outputs. `endmodule` ends it.
- `assign ALARM = ...;` makes the signal ALARM from what is on the right.
- `~` is NOT, `&` is AND, `|` is OR, `^` is XOR (from lesson 1's generalisation).
- Without brackets, `&` is worked out before `|`: `CLOSED & DOOR | WARM` means
  `(CLOSED & DOOR) | WARM`. Brackets change the order.
````

### G-facts.md

````markdown
# Lesson 1 fact sheet: "gates" (Module 2, lesson 1)

Read with the shared fact sheet (00-module.md). Every fact here was checked against the simulator.

## Terms this lesson introduces, and where

- **gate**: introduced in the investigation (the lead of the first figure, the NOT gate). Before
  that, say "part". The question and motivation must not say "gate".
- **truth table**: introduced in the investigation, the lead of the second figure (AND), after
  the learner has seen the NOT figure's table. Before that, say "the table under the drawing".
- **Boolean expression**: introduced in the explanation. Before that, do not use "expression".
- **XOR**: introduced in the generalisation.
- Not in this lesson at all: NAND, NOR, universal, depth.

## The rules and circuits

- ALARM rule: ALARM lights when the freezer room is warm and its door is shut. Why: warm with the
  door open is expected while staff load stock; warm with the door shut means the freezer is not
  cooling. In bits: ALARM is 1 when WARM is 1 and DOOR is 0.
- The ALARM circuit (library `alarm`): a NOT gate named notDoor takes DOOR and gives SHUT (1 while
  the door is shut). An AND gate named andAlarm takes WARM and SHUT and gives ALARM.
- NOT: one input; the output is the opposite of the input. A NOT gate is also called an
  inverter. Its symbol is a triangle with a small circle at the point.
- AND: the output is 1 only when every input is 1. Symbol: a D shape.
- OR: the output is 1 when any input is 1, including when both are. Symbol: a curved shield shape.
- Each gate's output depends only on its inputs now. Change an input and the output follows.
- Two inputs give 4 combinations: 00, 01, 10, 11. Three inputs give 8, four give 16. Each extra
  input doubles the rows. The tables list the rows counting up in binary, first input as the top
  bit.

## The tables, from the simulator

| inputs | NOT Y | AND Y | OR Y |
| --- | --- | --- | --- |
| A 0 (NOT) | 1 | | |
| A 1 (NOT) | 0 | | |
| A 0, B 0 | | 0 | 0 |
| A 0, B 1 | | 0 | 1 |
| A 1, B 0 | | 0 | 1 |
| A 1, B 1 | | 1 | 1 |

ALARM circuit: WARM 0 DOOR 0 → 0; WARM 0 DOOR 1 → 0; WARM 1 DOOR 0 → 1; WARM 1 DOOR 1 → 0.

## The figures, in order

1. Prediction (section prediction): the ALARM circuit is drawn (WARM, DOOR, notDoor, andAlarm,
   ALARM; the wire from notDoor to andAlarm is SHUT). The run sets WARM to 1 and DOOR to 1 (the
   freezer is warm and the door is open). The learner chooses "ALARM is 0" or "ALARM is 1". The
   simulator's answer: ALARM is 0, because DOOR 1 makes SHUT 0, and AND with a 0 input gives 0.
   After the answer, a timing diagram shows WARM, DOOR, SHUT and ALARM.
2. Investigation: three explorer figures, one gate each, inputs A (and B), output Y. Every input
   starts at 0. The table under each drawing, "Every row of this circuit", has 2 rows (NOT) or 4
   rows (AND, OR); the row of the inputs now is shaded and marked "Applies now".
3. Construction: a drawn challenge, inputs WARM and DOOR, output ALARM, parts AND, OR and NOT.
   4 tests, one per row of the table.
4. Failure experiment: a fault figure on the ALARM circuit, with three faults (labels below,
   exactly as the page shows them). "Run checks" tries the 4 rows. What each fault does:
   - "The gate andAlarm is replaced by an OR gate" (andAlarm is an OR gate): ALARM = WARM OR SHUT. 2 of 4 checks fail:
     WARM 0, DOOR 0 gives 1 (expected 0); WARM 1, DOOR 1 gives 1 (expected 0).
   - "The wire SHUT from NOT to AND is cut" (the wire SHUT is cut): the AND gate's second input reads X. 2 of 4 checks
     fail: WARM 1, DOOR 0 gives X (expected 1); WARM 1, DOOR 1 gives X (expected 0). The two rows
     with WARM 0 still pass: AND with one input 0 gives 0 whatever the other input is, so the 0
     decides and X does not matter.
   - "The door switch is broken and DOOR stays 0" (DOOR stays 0): 1 of 4 checks fails: WARM 1, DOOR 1 gives 1 (expected 0).
     The ALARM lamp would light while staff load warm stock with the door open. Every other row
     is right, so a test that tried only some rows could miss this fault.
5. Explanation: a figure shows the ALARM circuit drawn, and beside it the circuit's text:
   ```
   module alarm (
     input logic WARM,
     input logic DOOR,
     output logic ALARM
   );
     assign ALARM = WARM & ~DOOR;
   endmodule
   ```
   (The figure prints it that way: one port per line.) `WARM & ~DOOR` reads "WARM and not DOOR".
6. Generalisation: two explorer figures about the CLASH lamp (facts in brief D).
7. Challenge: a written challenge for the NIGHT lamp (facts in brief D).

## What the learner may not know yet

They have not met the text before this lesson. They have not met X before this lesson: introduce
it where the cut wire first needs it (the fault figure), as the simulator's mark for a value it
cannot know.
````

### GA.md

````markdown
# Brief GA: lesson 1, Question, Motivation, Prediction

Read 00-module.md and G-facts.md first. Draft every key below. Each section is read straight
after the one before, so write the joins: do not repeat a fact an earlier key states. Your final
message is the keys and their strings, and nothing else.

Note: the words "gate", "truth table", "expression" and "XOR" are not yet introduced in any
of these keys. Say "part" where you need a word for a gate.

## Key `question` (section "Question"; 100 to 140 words, two or three paragraphs)

Facts, in this order:
1. Module 1's display in the shop's office turns the sensor's 16 bits into the freezer room's
   temperature. (One sentence; the learner knows this.)
2. The display now also gets three signals, each one bit: WARM, DOOR and CLOSED, with what each
   means (from the fact sheet). Only WARM and DOOR matter in this question; CLOSED is used later
   in the lesson. A short list is fine.
3. The manager wants a lamp, ALARM, on the display. The rule: ALARM lights when the freezer room
   is warm and its door is shut.
4. Why that rule: warm with the door open is expected while staff load stock; warm with the
   door shut means the freezer is not cooling.
5. End with the question, stated as a question: how can a circuit turn the bits WARM and DOOR
   into ALARM, using only the bits as they are now?

## Key `motivation` (section "Motivation"; 80 to 120 words, two paragraphs)

Facts:
1. WARM and DOOR are bits, so together they can be in only 4 combinations: 00, 01, 10, 11. A
   rule about them needs to say what ALARM is in each of the 4, and nothing more.
2. Each extra bit doubles the combinations: three bits give 8, four give 16.
3. The lamp's rule looks only at the bits now. It does not need to know what happened before.
4. Every lamp in this module, and much of the computer the course builds, is made of small parts
   that each do one such rule on a few bits. (One sentence. Do not name the parts.)

## Key `prediction` (section "Prediction" prose; two or three sentences)

Facts: the figure below draws a circuit for ALARM from two parts. The part on DOOR's wire, a NOT,
gives the opposite of its input. The part with two inputs, an AND, gives 1 only when both its
inputs are 1. Choose an answer, then press "Check my prediction".

## Key `p1Question` (inside the figure, under the drawing; two to four sentences)

Facts: the freezer is warm, so WARM is 1. Staff have the door open, so DOOR is 1. The wire from
the NOT part to the AND part is called SHUT. Question: what is ALARM?
Do not give the answer or work it out in the question.

## Key `p1Explain` (shown after the learner commits; three to five sentences)

Facts:
1. ALARM is 0.
2. DOOR is 1, so the NOT part gives SHUT = 0.
3. The AND part has WARM = 1 and SHUT = 0. Not both are 1, so ALARM is 0.
4. This is the rule: warm with the door open does not light the lamp.
5. The timing diagram shows each signal's value after the run.
````

### GB.md

````markdown
# Brief GB: lesson 1, Investigation and Construction

Read 00-module.md and G-facts.md first. These sections come straight after the prediction, where
the learner found that the ALARM circuit gives 0 with WARM 1 and DOOR 1, because the NOT part made
SHUT 0 and the AND part needs both inputs at 1. Do not repeat that; build on it. Your final
message is the keys and their strings, and nothing else.

## Key `exploreNotLead` (above the first figure, the NOT; 70 to 110 words)

Facts, in order:
1. Each part in the ALARM circuit does one fixed rule on its inputs. Its output depends only on
   its inputs now: change an input and the output follows. A part like this is a **gate**.
   (Introduce the term here, plain meaning first.)
2. The figure is one NOT gate: input A, output Y. A NOT gate is also called an inverter.
3. Press A to flip it between 0 and 1, and watch Y.
4. The table under the drawing lists both values of A with the Y each gives. The row for A now is
   shaded and marked "Applies now".

## Key `exploreAndLead` (above the second figure, the AND; 60 to 100 words)

Facts:
1. The table under the NOT gate had one row for each value of its input. A table with one row for
   every combination of the input values, and the output each gives, is a **truth table**.
   (Introduce the term here.)
2. The AND gate has two inputs, A and B, so its truth table has 4 rows.
3. Press A and B in turn and watch which row is shaded. Find the one row where Y is 1.

## Key `exploreOrLead` (above the third figure, the OR; one or two sentences)

Facts: the OR gate has inputs A and B. Press them and compare its truth table with the AND gate's.

## Key `exploreOrAfter` (below the OR figure; 50 to 80 words)

Facts:
1. AND gives 1 in 1 row of 4: only when A and B are both 1.
2. OR gives 1 in 3 rows of 4: when A or B or both are 1. It gives 0 only when both are 0.
3. NOT gives the opposite of its one input.
4. The figures worked out every row with the simulator; the gate's rule and its truth table say
   the same thing two ways.

## Key `construction` (section prose, above the challenge; 60 to 90 words)

Facts:
1. You now build the ALARM circuit yourself. (The prediction showed one; build it from the rule,
   not by copying the drawing.)
2. Add parts with the buttons above the drawing ("Add AND", "Add OR", "Add NOT"). Press one port
   and then another to wire them.
3. "Run tests" tries every row of the rule. A failing test names the row, what your circuit gave,
   what was expected, and the gate that drives the wrong signal.

## Key `buildAlarmLead` (above the challenge; one sentence)

Facts: draw ALARM from WARM and DOOR. Do not hint at the answer.

## Key `c1Task` (the challenge's task; three to five short sentences or a short list)

Facts:
1. Draw a circuit with inputs WARM and DOOR and output ALARM.
2. ALARM is 1 when WARM is 1 and DOOR is 0. In the other 3 rows ALARM is 0.
3. There are 4 tests, one for each row.

## Key `c1Hints` (five hints, in this ladder order; one to three sentences each)

1. (The concept.) ALARM needs WARM to be 1 and the door to be shut, both at once. "Both at once"
   is what an AND gate does. The door is shut when DOOR is 0.
2. (A common mistake.) Wiring DOOR straight into the AND gate lights ALARM when the door is open,
   which is the opposite of the rule. An OR gate in place of the AND gate lights ALARM whenever
   WARM is 1 or the door is shut, which is 3 rows, not 1.
3. (A smaller example.) A NOT gate turns DOOR into a signal that is 1 while the door is shut.
4. (Part of the answer.) Put a NOT gate on DOOR. Its output is one input of the AND gate.
5. (The whole answer.) DOOR goes into a NOT gate. The NOT gate's output and WARM go into an AND
   gate. The AND gate's output is ALARM.
````

### GC.md

````markdown
# Brief GC: lesson 1, Failure experiment and Explanation

Read 00-module.md and G-facts.md first. These sections come straight after the construction,
where the learner built ALARM from a NOT gate on DOOR and an AND gate. Your final message is the
keys and their strings, and nothing else.

The fault figure's lead and after-text both show before the learner touches the figure, so the
lead says what to do and the after-text says what the faults show; that is fine here, because
this figure is not a prediction.

## Key `alarmFaultsLead` (above the fault figure; 90 to 130 words, two or three short paragraphs)

Facts, in order:
1. The figure is the ALARM circuit with its gates named as in the drawing: notDoor (the NOT
   gate), andAlarm (the AND gate), and the wire SHUT between them.
2. Under "Fault options" are three ways it can break, besides "No fault":
   "The gate andAlarm is replaced by an OR gate", "The wire SHUT from NOT to AND is cut", "The door switch is broken and DOOR stays 0". (Quote these labels exactly; a short
   list is fine.)
3. Choose a fault. Press WARM and DOOR to try rows yourself. Then press "Run checks": it tries all
   4 rows and lists each row where ALARM differs from the circuit with no fault.
4. Before you run the checks, say which rows you expect each fault to break.
5. A cut wire carries nothing. The simulator shows its value as X: a value it cannot know,
   neither 0 nor 1. (Introduce X here, where the learner first needs it.)

## Key `alarmFaultsAfter` (below the fault figure; 90 to 140 words)

Facts:
1. "The gate andAlarm is replaced by an OR gate": 2 of 4 checks fail. ALARM is 1 with WARM 0 and DOOR 0, and with WARM 1 and
   DOOR 1.
2. "The wire SHUT from NOT to AND is cut": 2 of 4 checks fail, the two rows with WARM 1, where ALARM is X. With WARM 0,
   ALARM is still 0: an AND gate with one input at 0 gives 0 whatever its other input is.
3. "The door switch is broken and DOOR stays 0": 1 of 4 checks fails: WARM 1 with DOOR 1. The lamp would light while staff
   load warm stock with the door open.
4. Each fault breaks some rows and leaves the others right. A test that tries only some rows can
   miss a fault. That is why each challenge's tests try every row.

## Key `explanation` (section prose, above the figure; 70 to 110 words)

Facts:
1. A truth table lists every row, so it says everything a circuit of gates does. Two circuits
   with the same truth table do the same job, however their gates are drawn.
2. For ALARM, the truth table is the rule: 1 in the row WARM 1, DOOR 0, and 0 in the other 3.
3. A drawing is one way to write a circuit down. The course also writes circuits as text.

## Key `alarmExpressionLead` (above the figure; 90 to 130 words)

Facts:
1. The figure shows the ALARM circuit and, beside it, the same circuit as text. (The text is
   in the fact sheet.)
2. The first lines name the circuit, `alarm`, and list its inputs and its output. `endmodule`
   ends it.
3. `assign ALARM = WARM & ~DOOR;` makes ALARM. `~` is NOT and `&` is AND, so it reads "ALARM is
   WARM and not DOOR". The course also writes OR as `|`.
4. The right-hand side, `WARM & ~DOOR`, is a formula of signal names joined by NOT, AND and OR.
   A formula like this is a **Boolean expression**. (Introduce the term here.)

## Key `alarmExpressionAfter` (below the figure; 40 to 70 words)

Facts:
1. Each operator in the expression is one gate in the drawing: `~` is the NOT gate notDoor, `&`
   is the AND gate andAlarm.
2. The expression names no wire between the gates: SHUT is the `~DOOR` inside it.
3. You can read the truth table from the expression: put each row's values in and work it out.
````

### GD.md

````markdown
# Brief GD: lesson 1, Generalisation, Challenge, Reflection, and the model note

Read 00-module.md and G-facts.md first. These sections come after the explanation, which showed
the ALARM circuit as the Boolean expression `WARM & ~DOOR` and said that `~` is NOT, `&` is AND
and `|` is OR. Your final message is the keys and their strings, and nothing else.

## The CLASH lamp (facts for the generalisation)

- The shop fits a second sensor in the same freezer room, so one failed sensor cannot hide a warm
  freezer. Each sensor gives its own warm bit: WARM1 and WARM2.
- When the two agree, all is well. When they disagree, one sensor is wrong and someone should
  look. The lamp CLASH lights when exactly one of WARM1 and WARM2 is 1.
- CLASH's truth table: WARM1 0 WARM2 0 → 0; 0 1 → 1; 1 0 → 1; 1 1 → 0.
- Circuit 1 (library `clash-gates`), from NOT, AND and OR, five gates: and1 gives 1 only in the
  row WARM1 1, WARM2 0 (it takes WARM1 and NOT WARM2); and2 gives 1 only in the row WARM1 0,
  WARM2 1 (it takes NOT WARM1 and WARM2); an OR gate joins them. As an expression:
  `(WARM1 & ~WARM2) | (~WARM1 & WARM2)`.
- Circuit 2 (library `clash-xor`): one gate, an XOR gate, with the same truth table.
- An XOR gate's output is 1 when exactly one of its two inputs is 1. Its name is short for
  "exclusive OR": an OR that excludes the row where both are 1. The course's text writes it `^`:
  `assign CLASH = WARM1 ^ WARM2;`. Its symbol is the OR shape with a second curved line at the
  inputs.
- OR and XOR differ in one row only: both inputs 1. OR gives 1 there; XOR gives 0.

## Key `generalisation` (section prose, above the two figures; 70 to 110 words)

Facts: the second sensor, WARM1 and WARM2, the CLASH rule and why. Say what the first figure
shows: CLASH built from the gates of this lesson.

## Key `clashGatesLead` (above the first figure; 50 to 80 words)

Facts: and1 and and2, each giving 1 in one row only, and the OR gate joining them. Press WARM1 and
WARM2 and watch which AND gate's output becomes 1. Check the truth table against the rule.

## Key `clashXorLead` (above the second figure; 50 to 80 words)

Facts: the rule "exactly one of two inputs is 1" is common enough to have its own gate. Introduce
**XOR** (plain meaning first, then the term, then the "exclusive OR" name). Press WARM1 and
WARM2 and compare the two truth tables.

## Key `clashXorAfter` (below the second figure; 40 to 70 words)

Facts: the two tables are the same, so the two circuits do the same job: five gates or one. OR
and XOR differ in one row only. The text writes XOR as `^`.

## Key `writeNightLead` (above the written challenge; 60 to 100 words)

Facts:
1. One more lamp, NIGHT, uses all three signals: WARM, DOOR and CLOSED.
2. You write this circuit as text instead of drawing it. The first line, with its inputs and
   output, and `endmodule` are already in the box. Write one `assign` line between them.
3. Under the text box, the page draws the circuit your text describes, so you can check it.
   [This is true: the written challenge shows a "Try it" panel with the drawn circuit.]

## Key `c2Task` (the challenge's task; four to six sentences or a short list)

Facts:
1. The rule: NIGHT lights while the shop is closed and either the door is open or the freezer is
   warm.
2. Inputs WARM, DOOR, CLOSED; output NIGHT.
3. Write `assign NIGHT = ...;` with `&`, `|` and `~` as you need them, and brackets where you
   need them.
4. Three inputs give 8 rows. There are 8 tests, one for each row.

## Key `c2Hints` (five hints, in this ladder order; one to three sentences each)

1. (The concept.) Split the rule at its "and": the shop is closed, and (the door is open or the
   freezer is warm). The bracketed part is one OR; the whole is one AND.
2. (A common mistake.) Without brackets, `&` is worked out before `|`. So `CLOSED & DOOR | WARM`
   means `(CLOSED & DOOR) | WARM`. That lights NIGHT whenever WARM is 1, even with the shop open,
   so the tests for the 2 rows with WARM 1 and CLOSED 0 fail.
3. (A smaller example.) "Door open or freezer warm" alone is `DOOR | WARM`.
4. (Part of the answer.) NIGHT is `CLOSED & (...)`, with an OR inside the brackets.
5. (The whole answer.) `assign NIGHT = CLOSED & (DOOR | WARM);`

## Key `reflection` (section "Reflection"; 80 to 120 words, two paragraphs)

Facts:
1. A gate's output depends only on its inputs now. A truth table lists every row, so it is the
   whole rule. A Boolean expression writes the same rule as a formula, and each operator in it is
   a gate.
2. This lesson used four kinds of gate: NOT, AND, OR and XOR. CLASH was built two ways, five gates
   or one.
3. End with this question, as a question: how many kinds of gate does a circuit need? Could one
   kind be enough for every truth table?

## Key `modelVsReality` (shown at the end, under "How the simulator differs from hardware"; 90 to 140 words, two or three paragraphs)

Facts:
1. In the figures, a gate answers at once: the simulator works out each gate's output from its
   inputs in a step, and the page shows the result when nothing changes any more. A real gate
   takes a short time to answer after an input changes.
2. A real gate's inputs and output are voltages, as in Module 1. A gate reads each input against
   a threshold and drives its output to one of two voltages. So its output is a clean 0 or 1 even
   when an input voltage has drifted a little.
3. A cut wire in hardware is not X. The input it fed floats: it may read 0, 1, or change with
   noise. The simulator shows X because it cannot know.
4. Real gates come in chips that contain several gates each. This lesson's lamps are invented for
   the course.
````

### N-facts.md

````markdown
# Lesson 2 fact sheet: "nand" (Module 2, lesson 2)

Read with the shared fact sheet (00-module.md). Every fact here was checked against the simulator.

## What the learner knows from lesson 1

Gate (output depends only on its inputs now), NOT (also called an inverter), AND, OR, XOR, truth
table, Boolean expression, the course's text with `assign`, `~`, `&`, `|`, `^`. X: the
simulator's mark for a value it cannot know. The lamps ALARM (`WARM & ~DOOR`), NIGHT
(`CLOSED & (DOOR | WARM)`) and CLASH (`WARM1 ^ WARM2`, 1 when the two sensors disagree). CLASH
was built two ways: five gates of NOT, AND and OR (`(WARM1 & ~WARM2) | (~WARM1 & WARM2)`), or
one XOR gate. Lesson 1 ended asking: how many kinds of gate does a circuit need? Could one kind
be enough for every truth table?

## Terms this lesson introduces, and where

- **NAND**: in the question. Plain meaning first: an AND gate followed by a NOT; its output is 0
  only when every input is 1.
- **universal**: in the explanation, after the argument.
- **NOR**: in the generalisation.
- Not in this lesson: depth.

## The story

An electronics engineer will build the display's lamp circuits on one small board. The engineer
keeps a drawer of spare chips. Nearly all of them are one kind: each chip contains four NAND
gates. A board made from one kind of chip needs one kind of spare: any chip in the drawer can
replace any failed chip on the board.

## The gates

- NAND truth table (inputs A, B, output Y): 0 0 → 1; 0 1 → 1; 1 0 → 1; 1 1 → 0. In every row it
  is the opposite of AND. The symbol is the AND shape with a small circle at the output, as NOT
  has. The text writes it `~(A & B)`.
- A NAND gate with both inputs wired to one signal A (library `nand-tied`): A 0 → Y 1; A 1 → Y 0.
  Both inputs are always equal, so only the rows 0 0 and 1 1 of NAND's table can happen. It is a
  NOT gate. The text writes it `~(A & A)`.
- AND from NAND: a NAND gate on A and B, then a NAND gate with both inputs wired to the first
  one's output (a NOT). Two NAND gates.
- OR from NAND (library `nand-or`, three gates): nandA has both inputs on A and gives NA (NOT A);
  nandB has both inputs on B and gives NB (NOT B); nandY takes NA and NB and gives Y. Y is 0 only
  when NA and NB are both 1, that is when A and B are both 0. So Y is A OR B. Truth table:
  0 0 → 0; 0 1 → 1; 1 0 → 1; 1 1 → 1.
- NOR (library `nor-gate`): output 1 only when every input is 0. 0 0 → 1; 0 1 → 0; 1 0 → 0;
  1 1 → 0. The opposite of OR in every row. Symbol: the OR shape with a small circle. Text:
  `~(A | B)`.
- A NOR gate with both inputs on A (library `nor-tied`): A 0 → 1; A 1 → 0. A NOT gate.
- NOR builds the rest too: OR is a NOR followed by a NOR used as a NOT; AND is a NOR of NOT A and
  NOT B (each NOT a tied NOR).

## Why NAND is enough (the explanation's argument)

1. Any truth table can be built from NOT, AND and OR: for each row whose output is 1, one AND
   gate whose output is 1 in that row only (each input as it is where the row has 1, through a
   NOT where the row has 0); then one OR gate of those AND gates' outputs. The output is 1 in
   exactly the rows listed.
2. CLASH from lesson 1 is built this way: its table has two rows with output 1 (WARM1 1, WARM2 0
   and WARM1 0, WARM2 1), so two AND gates, and one OR: `(WARM1 & ~WARM2) | (~WARM1 & WARM2)`.
3. NAND makes NOT (tied), AND (NAND then NOT) and OR (three NAND gates). So NAND alone can build
   any truth table. A kind of gate that can build any truth table on its own is called
   **universal**. NAND is universal.
4. (Do not claim this way gives the fewest gates. It gives a correct circuit, not a small one.)

## The figures, in order

1. Prediction: one NAND gate with both inputs wired to A, output Y, drawn. The run sets A to 1.
   Options "Y is 0" / "Y is 1". Answer: Y is 0 (both inputs 1, so NAND gives 0). After the answer
   a timing diagram shows A and Y.
2. Investigation: an explorer of one NAND gate, inputs A and B, output Y, with its table "Every
   row of this circuit" (4 rows, the row now shaded and marked "Applies now").
3. Construction: two drawn challenges, parts NAND only ("Add NAND"):
   - NOT from NAND: input A, output Y. Tests: the 2 rows, and a test "Only NAND gates" that fails if
     any gate is not a NAND gate. 3 tests. (Text imported into the drawing could use other gates,
     so the grader checks the kinds; the test names any gate of another kind and marks it.)
   - AND from NAND: inputs A, B, output Y. 4 rows and the NAND-only test: 5 tests.
   - A gate input that is not wired to anything reads X in the simulator.
4. Failure experiment: a fault figure on OR from three NAND gates (nandA, nandB, nandY; wires NA
   and NB). "Run checks" tries the 4 rows. Faults, with their labels exactly as the page shows:
   - "Wire NA is cut" (the wire NA is cut, so nandY's first input reads X): 2 of 4 checks fail:
     A 0, B 0 gives X (expected 0); A 1, B 0 gives X (expected 1). The rows with B 1 still pass,
     because then NB is 0, and a NAND gate with one input 0 gives 1 whatever its other input is.
   - "Gate nandA is AND instead of NAND" (nandA is an AND gate, so NA is A instead of NOT A): 2 of 4 checks fail:
     A 0, B 0 gives 1 (expected 0); A 1, B 0 gives 0 (expected 1).
   - "Gate nandY is AND instead of NAND" (nandY is an AND gate): 4 of 4 checks fail: every row gives the opposite of
     the right output.
5. Explanation: a figure shows the CLASH circuit from lesson 1 (five gates) and its text as one
   expression: `assign CLASH = (WARM1 & ~WARM2) | (~WARM1 & WARM2);`
6. Generalisation: an explorer of one NOR gate (A, B, Y) with its table; then an explorer of a
   NOR gate with both inputs on A, with its table (2 rows).
7. Challenge: XOR from NAND gates alone, for the CLASH lamp. Inputs A and B (the two sensors' warm
   bits), output Y. 4 rows and the NAND-only test: 5 tests. No limit on the number of gates.
   The obvious build uses five NAND gates (two as NOTs, two for the rows, one to join them).
````

### NA.md

````markdown
# Brief NA: lesson 2, Question, Motivation, Prediction

Read 00-module.md and N-facts.md first. Each section is read straight after the one before, so
write the joins: do not repeat a fact an earlier key states. Your final message is the keys and
their strings, and nothing else. "universal", "NOR" and "depth" are not yet introduced in these
keys.

## Key `question` (section "Question"; 100 to 140 words, two or three paragraphs)

Facts, in order:
1. The lamps from the last lesson, ALARM, NIGHT and CLASH, are now to be built on one small board
   for the display, by an electronics engineer.
2. The engineer keeps a drawer of spare chips. Nearly all of them are one kind: each chip contains
   four NAND gates.
3. Introduce **NAND** here, plain meaning first: an AND gate followed by a NOT, so its output is
   0 only when every input is 1.
4. The last lesson ended by asking whether one kind of gate could be enough for every truth
   table. End with the question, stated as a question: can every lamp be built from NAND gates
   alone?

## Key `motivation` (section "Motivation"; 70 to 110 words, two paragraphs)

Facts:
1. A board made from one kind of chip needs one kind of spare. Any chip in the drawer can replace
   any failed chip on the board.
2. NOT, AND and OR built every lamp in the last lesson. If NAND gates can make a NOT, an AND and
   an OR, they can make every one of those lamps.
3. So the lesson's work is three small circuits: NOT, AND and OR, each from NAND gates.

## Key `prediction` (section "Prediction" prose; two or three sentences)

Facts: the figure draws one NAND gate whose two inputs are both wired to the same signal, A.
Choose an answer, then press "Check my prediction".

## Key `p1Question` (inside the figure, under the drawing; two or three sentences)

Facts: both inputs of the NAND gate are wired to A, so they always have the same value. The run
sets A to 1. Question: what is Y? Do not answer it.

## Key `p1Explain` (after the learner commits; three to five sentences)

Facts:
1. Y is 0: both inputs are 1, and a NAND gate gives 0 only then.
2. With A at 0, both inputs are 0, so Y is 1.
3. So Y is always the opposite of A: a NAND gate with its inputs wired together is a NOT gate.
4. That is the first of the three circuits.
````

### NB.md

````markdown
# Brief NB: lesson 2, Investigation and Construction

Read 00-module.md and N-facts.md first. These sections come straight after the prediction, where
the learner found that a NAND gate with both inputs on A gives the opposite of A: a NOT. Do not
repeat that; build on it. Your final message is the keys and their strings, and nothing else.

## Key `exploreNandLead` (above the NAND explorer; 50 to 80 words)

Facts: the figure is one NAND gate, inputs A and B, output Y, with its truth table. Press A and B
and watch the shaded row. Compare each row with the AND gate's table from the last lesson.

## Key `exploreNandAfter` (below it; 40 to 70 words)

Facts: in every row, NAND gives the opposite of AND. Only the row A 1, B 1 gives 0. The tied
gate in the prediction used only the rows 0 0 and 1 1, because its inputs always match. The text
writes NAND as `~(A & B)`.

## Key `construction` (section prose, above both challenges; 60 to 100 words)

Facts:
1. Two of the three circuits are yours to build: NOT, then AND, each from NAND gates alone.
2. The only part button is "Add NAND". Press one port and then another to wire them. One output
   can be wired to several inputs.
3. Each challenge has one more test, "Only NAND gates", which fails if the circuit has a gate of any
   other kind and names it.
4. An input left unwired reads X. A row whose output then depends on that X gives X, and its test fails.

## Key `buildNotLead` (above the first challenge; one sentence)

Facts: start with the circuit the prediction showed. Do not describe it.

## Key `c1Task` (first challenge's task; three to five sentences)

Facts: draw a circuit with input A and output Y, from NAND gates only. Y is the opposite of A.
There are 3 tests: the 2 rows, and "Only NAND gates".

## Key `c1Hints` (five hints, ladder order; one or two sentences each)

1. (The concept.) A NAND gate gives 1 unless both its inputs are 1. If both inputs always have
   the same value, only two of its rows can happen.
2. (A common mistake.) Wiring A to one input and leaving the other unwired: the loose input reads
   X, so Y is X when A is 1.
3. (A smaller example.) In NAND's table, the row 0 0 gives 1 and the row 1 1 gives 0.
4. (Part of the answer.) Wire A to both inputs of one NAND gate.
5. (The whole answer.) One NAND gate. A goes to both of its inputs. Its output is Y.

## Key `buildAndLead` (above the second challenge; one or two sentences)

Facts: AND next. Do not give the answer.

## Key `c2Task` (second challenge's task; three to five sentences)

Facts: draw a circuit with inputs A and B and output Y, from NAND gates only. Y is 1 only when A
and B are both 1. There are 5 tests: the 4 rows, and "Only NAND gates".

## Key `c2Hints` (five hints, ladder order)

1. (The concept.) NAND is AND followed by NOT. Undo the NOT and you have AND.
2. (A common mistake.) One NAND gate alone gives the opposite of AND in every row: all 4 row tests
   fail.
3. (A smaller example.) The first challenge's circuit turns any signal into its opposite.
4. (Part of the answer.) A NAND gate on A and B, then a second NAND gate used as a NOT.
5. (The whole answer.) The first NAND gate takes A and B. Its output goes to both inputs of a
   second NAND gate. The second gate's output is Y.
````

### NC.md

````markdown
# Brief NC: lesson 2, Failure experiment and Explanation

Read 00-module.md and N-facts.md first. These sections come straight after the construction,
where the learner built NOT (one NAND gate, inputs tied) and AND (a NAND gate, then a NAND gate
used as a NOT). Your final message is the keys and their strings, and nothing else.

## Key `orFaultsLead` (above the fault figure; 90 to 130 words)

Facts, in order:
1. The third circuit, OR, is drawn here built: three NAND gates. nandA has both inputs on A, so
   its output NA is NOT A. nandB does the same for B, giving NB. nandY takes NA and NB and gives Y.
2. Y is 0 only when NA and NB are both 1, which is when A and B are both 0. So Y is A OR B. Check
   it with "No fault": press A and B.
3. Then choose each fault under "Fault options" in turn: "Wire NA is cut", "Gate nandA is AND instead of NAND",
   "Gate nandY is AND instead of NAND". (Quote the labels exactly.) Before pressing "Run checks", say which of the 4 rows
   you expect each to break.

## Key `orFaultsAfter` (below the figure; 90 to 140 words)

Facts:
1. "Wire NA is cut": 2 of 4 checks fail, the rows with B 0, where Y is X. With B 1, NB is 0, and a
   NAND gate with one input 0 gives 1 whatever the other input is, so those rows still pass.
2. "Gate nandA is AND instead of NAND": 2 of 4 checks fail, again the rows with B 0. NA is now A instead of NOT A.
3. "Gate nandY is AND instead of NAND": 4 of 4 checks fail. Every row gives the opposite of OR.
4. A fault inside a circuit can show in every row or in only some. A board built from tested parts
   still needs every row of the whole circuit tried.

## Key `explanation` (section prose, above the figure; 90 to 140 words, two paragraphs)

Facts:
1. NAND gates now make NOT, AND and OR. The question is whether those three can build every
   truth table.
2. They can. Take a table. For each row whose output is 1, use one AND gate whose output is 1 in
   that row only: each input goes in as it is where the row has a 1, and through a NOT where the
   row has a 0. Then one OR gate takes the outputs of all those AND gates. The OR's output is 1 in
   exactly the rows listed, and 0 in every other row.
3. This gives a correct circuit, not always a small one.

## Key `clashExpressionLead` (above the figure; 50 to 80 words)

Facts: the figure is CLASH from the last lesson, built this way. Its table has two rows with
output 1: WARM1 1, WARM2 0, and WARM1 0, WARM2 1. So it has two AND gates, one for each of those
rows, and one OR gate. The text writes the whole circuit as one expression.

## Key `clashExpressionAfter` (below the figure; 60 to 100 words)

Facts:
1. In the expression, each bracket is one row's AND gate; `|` is the OR that joins them.
2. Every gate here is NOT, AND or OR, and NAND gates make all three. So NAND gates alone can build
   any truth table.
3. Introduce the term here: a kind of gate that can build every truth table on its own is
   **universal**. NAND is universal.
````

### ND.md

````markdown
# Brief ND: lesson 2, Generalisation, Challenge, Reflection, and the model note

Read 00-module.md and N-facts.md first. These sections come after the explanation, which showed
that NOT, AND and OR build any truth table (one AND gate per row whose output is 1, joined by an
OR), and so NAND is universal. Your final message is the keys and their strings, and nothing
else.

## Key `exploreNorLead` (above the first figure; 50 to 80 words)

Facts: NAND is not the only gate that can do this. Introduce **NOR** here, plain meaning first:
an OR gate followed by a NOT, so its output is 1 only when every input is 0. The figure is one NOR
gate, inputs A and B, output Y, with its truth table. Press A and B; compare each row with OR's.

## Key `exploreNorTiedLead` (above the second figure; one or two sentences)

Facts: a NOR gate with both inputs wired to A. Press A.

## Key `exploreNorTiedAfter` (below the second figure; 60 to 90 words)

Facts:
1. Y is the opposite of A: a NOR gate with its inputs tied is a NOT, as a tied NAND gate was.
2. A NOR followed by a tied NOR is an OR. A NOR of NOT A and NOT B is an AND (1 only when A and
   B are both 1).
3. So NOR is universal too. The text writes NOR as `~(A | B)`.

## Key `buildXorLead` (above the challenge; 50 to 80 words)

Facts:
1. The engineer's drawer contains NAND chips, so the CLASH lamp needs XOR from NAND gates.
2. CLASH's expression from the explanation shows the plan: two rows, two AND gates, one OR, and a
   NOT on each input. Each of those can be made from NAND gates.
3. Do not give the circuit.

## Key `c3Task` (the challenge's task; four to six sentences)

Facts: draw a circuit with inputs A and B (the two sensors' warm bits) and output Y, from NAND
gates only. Y is 1 when exactly one of A and B is 1. There are 5 tests: the 4 rows, and
"Only NAND gates". There is no limit on how many NAND gates you use.

## Key `c3Hints` (five hints, ladder order; one to three sentences each)

1. (The concept.) Build CLASH's plan from NAND gates: NOT A and NOT B, one gate for each row whose
   output is 1, and a gate to join them.
2. (A common mistake.) Leaving out the NOTs. A NAND gate of A and B is 0 only in the row A 1,
   B 1, where Y must be 0, not in a row where Y must be 1.
3. (A smaller example.) A NAND gate of two signals, fed into a NAND gate of another two, gives
   1 when either pair is both 1: NAND of NANDs is an OR of ANDs. Try it on paper with two rows.
4. (Part of the answer.) Make NA and NB with two tied NAND gates. A NAND gate of A and NB is 0
   only in the row A 1, B 0. A NAND gate of NA and B is 0 only in the row A 0, B 1.
5. (The whole answer.) Five NAND gates: NA from A tied, NB from B tied, P from A and NB, Q from NA
   and B, and Y from P and Q.

## Key `reflection` (section "Reflection"; 80 to 120 words, two paragraphs)

Facts:
1. One kind of gate is enough. NAND makes NOT, AND and OR, and those build any truth table, one
   AND gate per row whose output is 1. NOR does the same.
2. A board from one kind of chip needs one kind of spare.
3. The way of building used here gives a correct circuit, not a small one. XOR took five NAND
   gates.
4. End with the questions, as questions: can CLASH be built from fewer NAND gates? When two
   circuits have the same truth table, what else makes one better than the other?

## Key `modelVsReality` (shown at the end, under "How the simulator differs from hardware"; 90 to 140 words, two or three paragraphs)

Facts:
1. In the most common way of making chips, a NAND gate is smaller and faster than an AND gate. An
   AND gate on such a chip is usually a NAND gate followed by a NOT. So building from NAND is not
   only a matter of spares.
2. On a real chip, an input wired to nothing does not read X. It may read 0 or 1 and can change
   with noise. Engineers wire every unused input to a fixed 0 or 1.
3. In the simulator every gate answers in one step, whatever its kind. Real gates of different
   kinds take different times.
4. The engineer and the drawer are invented for the course. Chips that each contain four NAND
   gates are real and common.
````

### F-facts.md

````markdown
# Lesson 3 fact sheet: "fewer-gates" (Module 2, lesson 3)

Read with the shared fact sheet (00-module.md). Every fact here was checked against the simulator.

## What the learner knows from lessons 1 and 2

Gates NOT, AND, OR, XOR, NAND, NOR; truth table; Boolean expression and the course's text;
universal (NAND and NOR each build any truth table). X. The ALARM lamp (`WARM & ~DOOR`). The way
of building any table: one AND gate for each row whose output is 1, then one OR gate of them.
Lesson 2 built XOR (the CLASH lamp) from five NAND gates and ended asking: can CLASH be built from
fewer NAND gates? When two circuits have the same truth table, what else makes one better?

## Terms

- **depth**: introduced in the explanation, after the learner has counted steps. Before that, do
  not use "depth"; say "the gates in a row", "the longest path".
- The badge "Stepped" means: every gate takes one step; after an input changes, the simulator
  recomputes every gate, one step at a time, until nothing changes. This lesson relies on it.
  The explorer figures in the explanation have a "Step" slider and a line "Settled in N steps."

## The CALL lamp

- CALL tells the manager to call the engineer. The rule: CALL lights when the freezer is warm with
  its door shut (a failing freezer, at any time), or when the door is open while the shop is
  closed (a door left open, or someone inside).
- The manager wrote the rule as its rows. CALL is 1 in 4 of the 8 rows:
  WARM 1, DOOR 0, CLOSED 0; WARM 1, DOOR 0, CLOSED 1; WARM 1, DOOR 1, CLOSED 1;
  WARM 0, DOOR 1, CLOSED 1. In every other row CALL is 0.
- The manager's circuit (library `call-rows`) builds it as lesson 2 showed: one AND gate per row
  (and1 to and4, each with three inputs), three NOT gates (notWarm, notDoor, notClosed), and one
  OR gate with four inputs (orCall). 8 gates.
- The board has room left for 4 gates.
- CALL's full truth table (WARM DOOR CLOSED → CALL): 000→0, 001→0, 010→0, 011→1, 100→1, 101→1,
  110→0, 111→1.

## Reading the table in pairs

- Two rows that differ in one input only, say WARM, form a pair. If both rows of a pair give the
  same output, WARM makes no difference there, and the pair needs one AND gate, not two.
- WARM: the pairs are (DOOR 0, CLOSED 0): 0 and 1, matters; (DOOR 0, CLOSED 1): 0 and 1,
  matters; (DOOR 1, CLOSED 0): 0 and 0, does not matter; (DOOR 1, CLOSED 1): 1 and 1, does not
  matter. WARM changes the output in 2 of 4 pairs.
- CLOSED: (WARM 0, DOOR 0): 0 and 0, no; (WARM 0, DOOR 1): 0 and 1, yes; (WARM 1, DOOR 0):
  1 and 1, no; (WARM 1, DOOR 1): 0 and 1, yes. 2 of 4.
- DOOR: (WARM 0, CLOSED 0): 0 and 0, no; (WARM 0, CLOSED 1): 0 and 1, yes; (WARM 1, CLOSED 0):
  1 and 0, yes; (WARM 1, CLOSED 1): 1 and 1, no. 2 of 4.
- A pair whose output is 0 in both rows needs no gate at all: no AND gate is built for 0 rows.
- The two useful pairs: with DOOR 1 and CLOSED 1, CALL is 1 whatever WARM is, so one AND gate of
  DOOR and CLOSED covers both rows. With WARM 1 and DOOR 0, CALL is 1 whatever CLOSED is, so one
  AND gate of WARM and NOT DOOR covers both rows. Those two AND gates cover all 4 rows where CALL
  is 1.
- So CALL = `(WARM & ~DOOR) | (DOOR & CLOSED)`: one NOT, two AND, one OR: 4 gates. Its truth
  table is the same as the manager's in all 8 rows. (Its first part is ALARM's rule.)

## The figures, in order

1. Prediction: the manager's circuit is drawn (8 gates). The run sets WARM 0, DOOR 1, CLOSED 1.
   Options "CALL is 0" / "CALL is 1". Answer: CALL is 1 (and4 gives 1 in that row). With WARM 1
   instead, and3 gives 1. So with the door open and the shop closed, CALL is 1 whatever WARM is,
   and two AND gates do the work of one.
2. Investigation: the figure "input-pairs" on the manager's circuit (no drawing). The learner
   picks WARM, DOOR or CLOSED with radio buttons under "Which input?". The table shows the rows in
   pairs that differ only in that input: the other inputs, CALL with the input at 0, CALL with it
   at 1, and a column "Does {input} change the output?" with Yes or No. Pairs marked No are
   shaded. A line under it says "{input} changes the output in {n} of {total} pairs." It starts on
   WARM.
3. Construction: a drawn challenge, inputs WARM, DOOR, CLOSED, output CALL, parts AND, OR, NOT.
   Tests: the 8 rows, and "At most 4 gates": 9 tests. A circuit with the right rows but more
   gates fails only that test, which says how many gates it has and marks them.
4. Failure experiment: two circuits drawn one above the other, the manager's (8 gates) and a
   short one (library `call-too-short`): `WARM | (DOOR & CLOSED)`, an OR of WARM and one AND
   gate, 2 gates. Before the answer only the drawings show. The prediction: does the short circuit
   light CALL in the same rows as the manager's? Two options: the same rows, or some different row. After
   committing: each drawing's gate count (8 and 2), the sentence "Both circuits produce different
   outputs in 1 of 8 rows.", and both outputs row by row with the differing row shaded.
   The differing row: WARM 1, DOOR 1, CLOSED 0: the manager's gives 0, the short one gives 1. That
   is a warm freezer with the door open while the shop is open: staff loading stock. The short
   circuit would call the engineer then.
   Where the mistake came from: WARM makes no difference in the pair DOOR 1, CLOSED 1, but the
   short circuit dropped DOOR from the other term too: it took WARM alone where the rows say WARM
   and NOT DOOR. A shorter circuit is right only if every row still matches.
5. Explanation: two explorer figures, each with a "Step" slider and a status line. Both light ANY
   when any of four freezer rooms is warm: inputs ROOM1, ROOM2, ROOM3, ROOM4 (each 1 while that
   room is warm), output ANY. The shop's warehouse has the four rooms. Both use three OR gates,
   each with two inputs.
   - Chain (library `any-warm-chain`): or1 takes ROOM1 and ROOM2; or2 takes or1's output and
     ROOM3; or3 takes or2's output and ROOM4. Starting from all inputs 0: press ROOM1 → "Settled
     in 3 steps."; ROOM2 → 3 steps; ROOM3 → 2 steps; ROOM4 → 1 step.
   - Tree (library `any-warm-tree`): or1 takes ROOM1 and ROOM2; or2 takes ROOM3 and ROOM4; or3
     takes or1's and or2's outputs. From all 0, pressing any one input → "Settled in 2 steps."
   - (Those counts are from all inputs 0, pressing one input to 1. "Start again" sets all to 0.)
   - In the stepped model every gate takes one step, so a change takes one step for each gate it
     passes through. The number of gates on the longest path from an input to an output is the
     circuit's **depth**. Chain: depth 3. Tree: depth 2. Same gates, same truth table (16 rows),
     different depth.
   - A real gate takes a short time to answer. The deeper the circuit, the longer before its
     output can be trusted after an input changes.
6. Generalisation: two circuits drawn one above the other, each lighting both ALARM and CALL,
   with gate counts and depth under each, and the sentence "Both circuits produce the same outputs
   in all 8 rows." (no table).
   - Separate (library `two-lamps-separate`): ALARM has its own NOT and AND; CALL has its own NOT,
     two AND and an OR. 6 gates, depth 3.
   - Shared (library `two-lamps-shared`): CALL's first AND gate would compute WARM & ~DOOR, which
     is ALARM. So CALL's OR takes ALARM's AND gate's output. 4 gates, depth 3.
   - One output can be wired to any number of inputs, so a gate shared by two lamps is built once.
7. Challenge: XOR from at most 4 NAND gates. Inputs A, B, output Y. Tests: 4 rows, "At most 4
   gates", "Only NAND gates": 6 tests. The answer shares one gate: M, the NAND of A and B, feeds
   two gates: a NAND of A and M, and a NAND of M and B; a fourth NAND joins those two. Depth 3.
   (Lesson 2's version used five NAND gates, also depth 3.)

## Model note facts (for the model-versus-reality key)

- In the stepped model every gate, of any kind and any number of inputs, takes one step. Real
  gates take different times: a gate with more inputs, or whose output feeds more inputs, is
  slower, and every gate's time changes with temperature.
- A four-input OR gate counts as one gate here. On a real chip, a gate with many inputs is slower,
  or is built from several smaller gates.
- Counting gates is a simple measure. Real designers also count chips, the space on the board,
  and how fast the slowest path is.
- The shop, the warehouse and the board are invented for the course.
````

### FA.md

````markdown
# Brief FA: lesson 3, Question, Motivation, Prediction

Read 00-module.md and F-facts.md first. Each section is read straight after the one before, so
write the joins. Your final message is the keys and their strings, and nothing else. "depth" is
not yet introduced in these keys.

## Key `question` (section "Question"; 100 to 140 words, two or three paragraphs)

Facts, in order:
1. The manager wants one more lamp, CALL, which says to call the engineer. Its rule (from the
   fact sheet), with the two reasons: a failing freezer, a door left open at night.
2. The manager wrote the rule as the rows where CALL is 1, and built it the way the last lesson
   showed: one AND gate per row, then an OR. 4 rows, so 4 AND gates, 3 NOT gates and 1 OR: 8
   gates.
3. The board has room left for 4 gates.
4. The last lesson ended asking whether a circuit could use fewer gates, and what else makes one
   circuit better than another with the same table.
5. End with the question, as a question: how can the same truth table be built from fewer gates?

## Key `motivation` (section "Motivation"; 70 to 110 words, two paragraphs)

Facts:
1. Fewer gates means fewer chips to buy, fit and replace, and room on the board for the next lamp.
2. Gates in a row matter too. Each gate takes a short time to answer, so a change at an input
   reaches the lamp later the more gates it passes through.
3. Both are measured in this lesson: how many gates, and how many in a row.

## Key `prediction` (section "Prediction" prose; two or three sentences)

Facts: the figure draws the manager's eight-gate circuit. It sets one row of inputs. Choose an
answer, then press "Check my prediction".

## Key `p1Question` (inside the figure, under the drawing; two or three sentences)

Facts: the freezer is cold (WARM 0), the door is open (DOOR 1) and the shop is closed (CLOSED 1).
Question: what is CALL? Do not answer or hint.

## Key `p1Explain` (after the learner commits; three to five sentences)

Facts:
1. CALL is 1: and4, the gate for the row WARM 0, DOOR 1, CLOSED 1, gives 1.
2. With WARM 1 instead, and3 gives 1, so CALL is 1 again.
3. So with the door open and the shop closed, CALL is 1 whatever WARM is. Two AND gates do the
   work of one AND gate of DOOR and CLOSED.
````

### FB.md

````markdown
# Brief FB: lesson 3, Investigation and Construction

Read 00-module.md and F-facts.md first. These sections come straight after the prediction, where
the learner found that with DOOR 1 and CLOSED 1, CALL is 1 whatever WARM is. Do not repeat that;
build on it. Your final message is the keys and their strings, and nothing else. "depth" is not
yet introduced.

## Key `callPairsLead` (above the figure; 90 to 130 words)

Facts, in order:
1. Two rows that differ in one input only form a pair. If both rows of a pair give the same
   output, that input makes no difference there, and one AND gate can do the work of two.
2. The figure sets out the manager's table in pairs. Under "Which input?", choose WARM, DOOR or
   CLOSED. Each line of the table is one pair: the other two inputs, CALL with your input at 0,
   CALL with it at 1, and whether your input changed CALL. Pairs where it did not are shaded.
3. It starts on WARM. Try all three inputs. Look for shaded pairs where CALL is 1 in both rows.

## Key `callPairsAfter` (below the figure; 80 to 120 words)

Facts:
1. A shaded pair where CALL is 0 in both rows needs no gate at all: only rows with output 1 get an
   AND gate.
2. Two shaded pairs have CALL 1 in both rows. With WARM chosen: DOOR 1 and CLOSED 1, so one AND
   gate of DOOR and CLOSED covers both rows. With CLOSED chosen: WARM 1 and DOOR 0, so one AND
   gate of WARM and NOT DOOR covers both rows.
3. Those two AND gates cover all 4 rows where CALL is 1.
4. The second one is ALARM's rule from the first lesson of this module.

## Key `construction` (section prose, above the challenge; 50 to 80 words)

Facts:
1. Build CALL from the two AND gates the pairs found, with at most 4 gates in all.
2. The part buttons are "Add AND", "Add OR" and "Add NOT".
3. Besides the 8 rows, one more test, "At most 4 gates", counts your gates. If it fails, it says
   how many you have and marks them in the drawing.

## Key `buildCallLead` (above the challenge; one sentence)

Facts: draw CALL in 4 gates or fewer. Do not give the circuit.

## Key `c1Task` (the challenge's task; four to six short sentences or a short list)

Facts:
1. Inputs WARM, DOOR and CLOSED; output CALL.
2. CALL is 1 in the manager's 4 rows (list them) and 0 in the other 4.
3. Use at most 4 gates.
4. 9 tests: the 8 rows and "At most 4 gates".

## Key `c1Hints` (five hints, ladder order; one to three sentences each)

1. (The concept.) Each pair where CALL is 1 in both rows can be one AND gate of the other two
   inputs. Find pairs that between them cover all 4 rows where CALL is 1.
2. (A common mistake.) Dropping an input that matters. WARM makes no difference when DOOR and
   CLOSED are both 1, but it does when DOOR is 0. Check every row after each change.
3. (A smaller example.) WARM 1, DOOR 0, CLOSED 0 and WARM 1, DOOR 0, CLOSED 1 differ only in
   CLOSED, and CALL is 1 in both. One AND gate of WARM and NOT DOOR covers the two.
4. (Part of the answer.) CALL = `(WARM & ~DOOR) | (DOOR & CLOSED)`.
5. (The whole answer.) A NOT gate on DOOR. One AND gate takes WARM and the NOT's output. A second
   AND gate takes DOOR and CLOSED. An OR gate takes both AND outputs and gives CALL. 4 gates.
````

### FC.md

````markdown
# Brief FC: lesson 3, Failure experiment and Explanation

Read 00-module.md and F-facts.md first. These sections come straight after the construction,
where the learner built CALL as `(WARM & ~DOOR) | (DOOR & CLOSED)` in 4 gates. Your final message
is the keys and their strings, and nothing else.

The failure figure is a prediction. Its lead and after-text show before the learner commits, so
neither may say whether the two circuits match, how many rows differ, or which row. Those facts go
only in `p2Explain`.

## Key `tooShortLead` (above the figure; 60 to 100 words)

Facts:
1. The figure draws the manager's circuit and
   a shorter one: `WARM | (DOOR & CLOSED)`, an OR of WARM and one AND gate, 2 gates.
2. Someone built it from the pairs, after reading that WARM makes no difference when DOOR and
   CLOSED are both 1. (Say no more about whether that was right.)
3. Choose an answer, then press "Check my prediction". The gate counts and the rows show after.

## Key `p2Question` (inside the figure, under the two drawings; one or two sentences)

Facts: question: does the short circuit light CALL in the same rows as the manager's? Do not
answer.

## Key `p2Explain` (shown after the learner commits; 80 to 120 words)

Facts:
1. They differ in 1 row of 8: WARM 1, DOOR 1, CLOSED 0. The manager's gives 0; the short one
   gives 1.
2. That row is a warm freezer with the door open while the shop is open: staff loading stock. The
   short circuit would call the engineer every time.
3. The mistake: the short circuit takes WARM alone where the rows say WARM and NOT DOOR. WARM makes
   no difference in one pair; that does not let DOOR drop out of the other term.
4. A shorter circuit is right only if every row still matches. The figure checks all 8; so do the
   construction's tests.

## Key `tooShortAfter` (below the figure; one or two sentences)

Facts: the table compares the two circuits row by row, the way the challenges' tests do. Do not
give the result.

## Key `explanation` (section prose, above the two figures; 70 to 110 words)

Facts:
1. Gate count is one measure. The other is how many gates a change passes through on its way to
   the output.
2. The badge "Stepped" on each figure means every gate takes one step: after an input changes, the
   simulator recomputes every gate, one step at a time, until nothing changes.
3. The two figures below both light ANY when any of four freezer rooms in the shop's warehouse is
   warm: inputs ROOM1 to ROOM4, each 1 while that room is warm. Both use three OR gates, each with
   two inputs.

## Key `chainStepsLead` (above the first figure; 60 to 100 words)

Facts: the first figure joins the rooms in a chain: or1 takes ROOM1 and ROOM2, or2 takes or1's
output and ROOM3, or3 takes or2's output and ROOM4. Press one ROOM input, read the status line
under the drawing ("Settled in N steps."), then press "Start again" and try another. Drag the
"Step" slider to watch the change move one gate per step. Do not give the counts.

## Key `treeStepsLead` (above the second figure; 40 to 70 words)

Facts: the second figure joins them in two pairs: or1 takes ROOM1 and ROOM2, or2 takes ROOM3 and
ROOM4, or3 takes both outputs. Do the same: press one input at a time from "Start again". Do not
give the counts.

## Key `treeStepsAfter` (below the second figure; 90 to 130 words)

Facts:
1. Chain: ROOM1 or ROOM2 settles in 3 steps, ROOM3 in 2, ROOM4 in 1. Tree: every input settles in
   2 steps.
2. A change takes one step for each gate it passes through. The number of gates on the longest
   path from an input to an output is the circuit's **depth**. (Introduce the term here.) The
   chain's depth is 3; the tree's is 2.
3. Same gates, same truth table, different depth.
4. A real gate takes a short time to answer. The deeper the circuit, the longer before its output
   can be trusted after an input changes.
````

### FD.md

````markdown
# Brief FD: lesson 3, Generalisation, Challenge, Reflection, and the model note

Read 00-module.md and F-facts.md first. These sections come after the explanation, which
introduced depth: the number of gates on the longest path from an input to an output (a chain of
three OR gates has depth 3, the same gates as a tree have depth 2). Your final message is the keys
and their strings, and nothing else.

## Key `twoLampsLead` (above the figure; 70 to 110 words)

Facts:
1. ALARM and CALL go on the same board. CALL's first AND gate takes WARM and NOT DOOR, which is
   ALARM's rule from the first lesson of this module.
2. The figure draws the two lamps two ways. The first gives each lamp its own gates. The second
   wires the output of ALARM's AND gate to CALL's OR gate as well as to ALARM.
3. Under each drawing are its gate count and its depth, and under both a sentence saying whether
   the two give the same outputs.

## Key `twoLampsAfter` (below the figure; 50 to 80 words)

Facts: separate: 6 gates, depth 3. Shared: 4 gates, depth 3. Both give the same outputs in all 8
rows. One output can be wired to any number of inputs, so a gate two lamps need is built once.
Sharing saved 2 gates and cost no depth.

## Key `buildXorFourLead` (above the challenge; 50 to 80 words)

Facts: the last lesson built XOR for the CLASH lamp from five NAND gates. Its two row gates each
needed a NOT first. This challenge asks for XOR in at most 4 NAND gates. Sharing one gate is the
way in. Do not give the circuit.

## Key `c2Task` (the challenge's task; four to six sentences)

Facts: inputs A and B, output Y. Y is 1 when exactly one of A and B is 1. NAND gates only, at most
4 of them. 6 tests: the 4 rows, "At most 4 gates" and "Only NAND gates".

## Key `c2Hints` (five hints, ladder order; one to three sentences each)

1. (The concept.) A gate whose output feeds two other gates is built once. Look for one NAND gate
   that both row gates could use in place of their NOTs.
2. (A common mistake.) The five-gate build from the last lesson passes all 4 rows but fails
   "At most 4 gates": it makes NOT A and NOT B with two gates of their own.
3. (A smaller example.) M, the NAND of A and B, is 0 only when both are 1. A NAND of A and M is 0
   only in the row A 1, B 0: when A is 1 and B is 1, M is 0, so that gate gives 1.
4. (Part of the answer.) M = NAND of A and B feeds two gates: P = NAND of A and M, and Q = NAND of
   M and B.
5. (The whole answer.) Four NAND gates: M from A and B; P from A and M; Q from M and B; Y from P
   and Q.

## Key `reflection` (section "Reflection"; 90 to 130 words, two paragraphs)

Facts:
1. Two circuits with the same truth table can differ in gate count and in depth. Pairs of rows
   where an input makes no difference save gates; sharing a gate between outputs saves more.
2. Every simplification must still match every row; the short CALL circuit did not.
3. Gate count and depth are separate: the chain and the tree had the same gates and different
   depth.
4. Module 2 used gates for rules about bits now: lamps. End with a question, as a question: the
   lamps use one bit per signal; what would a circuit look like that works on whole words of bits,
   such as the sensor's 16? [One question. Do not name any circuit a later module builds.]

## Key `modelVsReality` (shown at the end, under "How the simulator differs from hardware"; 90 to 140 words)

Facts: the model note facts in F-facts.md, in that order, two or three paragraphs.
````

### E-labels.md

````markdown
# Brief E: the three lessons' titles, objectives, captions and labels

Read the shared fact sheet (00-module.md) first. Draft every string below. Return them as three
TypeScript-like blocks, one per lesson, with the keys exactly as given. Keep each string short.
Your final message is the three blocks and nothing else.

Rules for these labels:
- A lesson title is a question the lesson answers, as the earlier lessons' titles are: "How does
  the display know the temperature?" (Module 1). A later lesson's title is also a question; do not
  borrow its words.
- Section titles are noun phrases of two to five words that say what the section contains. No
  colon, no question unless the section answers it.
- Objectives: three or four per lesson, each one sentence starting with a verb, each something
  the learner can do afterwards.
- A caption says in one short sentence what to do with the figure or what it shows (under 12
  words). It must not give a prediction's answer.
- Option labels are short phrases, not sentences: no capital at the start unless a signal name,
  no full stop. They appear inside "You chose {option}." Same shape within a figure.
- A rationed term may appear in a lesson's labels only if that lesson introduces it or an earlier
  lesson did (see the fact sheet's table). A title or objective may use the lesson's own terms.

## Lesson 1 (`gates`): gates, truth tables, expressions, XOR

What it does: the learner predicts what a two-gate circuit for the ALARM lamp gives, meets NOT,
AND and OR one at a time with their truth tables, builds the ALARM circuit, breaks it three ways
in a fault figure, sees the circuit as the expression `WARM & ~DOOR`, meets XOR through the CLASH
lamp, and writes the NIGHT lamp's circuit as text.

- `title`
- `objectives` (three or four): read a truth table and say what a gate does from it; build a
  circuit of NOT, AND and OR from a rule stated in words; find which rows a fault breaks; write a
  circuit as a Boolean expression in the course's text.
- `titles.question`, `titles.motivation`, `titles.prediction`, `titles.investigation`,
  `titles.construction`, `titles.failureExperiment`, `titles.explanation`,
  `titles.generalisation`, `titles.challenge`, `titles.reflection`. What each section contains:
  question: the ALARM lamp's rule; motivation: a rule about bits now has a fixed number of cases;
  prediction: what the ALARM circuit gives with the freezer warm and the door open; investigation:
  NOT, AND and OR and their tables; construction: building the ALARM circuit; failure experiment:
  three faults in it and which rows each breaks; explanation: the table is the whole rule, and the
  circuit as an expression; generalisation: two sensors that disagree, and XOR; challenge: the
  NIGHT lamp written as text; reflection: how many kinds of gate are needed.
- `steps.warmOpen`: the label of the prediction's one step, which sets WARM to 1 and DOOR to 1.
  A few words, such as "WARM 1, DOOR 1".
- `options.alarm0`: ALARM is 0; `options.alarm1`: ALARM is 1.
- `captions.predictAlarm`: predict ALARM with the freezer warm and the door open.
- `captions.exploreNot`, `captions.exploreAnd`, `captions.exploreOr`: press A (and B) and watch Y
  and the shaded row. The term "gate" may be used; "truth table" may too.
- `captions.buildAlarm`: draw the ALARM circuit and run the tests.
- `captions.alarmFaults`: choose a fault, press the inputs, run the checks.
- `faults.andToOr`: the AND gate (named andAlarm in the drawing) is replaced by an OR gate.
- `faults.cutShut`: the wire SHUT, from the NOT gate's output to the AND gate, is cut.
- `faults.doorStuck`: the door switch is broken and DOOR stays 0 whether the door is open or not.
  (Do not use "held" or "hold".)
  The three fault labels are list items of the same shape, each saying what is broken.
- `captions.alarmExpression`: the ALARM circuit beside its text as one expression.
- `captions.clashGates`: the CLASH lamp's circuit from NOT, AND and OR; press WARM1 and WARM2.
- `captions.clashXor`: the same lamp from one XOR gate; press WARM1 and WARM2.
- `captions.writeNight`: write the NIGHT lamp's circuit as text and run the tests.
- `challengeTitles.c1`: the ALARM lamp (a drawn challenge). `challengeTitles.c2`: the NIGHT lamp
  (a written challenge). Noun phrases.

## Lesson 2 (`nand`): one kind of gate

What it does: the engineer who will build the lamps' board has a drawer of chips that each contain
four NAND gates. The learner predicts a NAND gate whose two inputs are both wired to A, meets
NAND's truth table, builds NOT and then AND from NAND alone, breaks an OR made of three NAND gates
in a fault figure, reads the CLASH circuit as one AND gate per row whose output is 1 to see why
NAND is enough for any table, meets NOR, and builds XOR from NAND alone.

- `title`
- `objectives` (three or four): build NOT and AND from NAND gates alone; explain why NAND alone
  can build any truth table; use NOR the same way; build XOR from NAND gates.
- `titles.*` (ten). What each contains: question: one kind of chip in the drawer; motivation: why one
  kind of gate is worth having; prediction: a NAND gate with both inputs on A; investigation:
  NAND's truth table; construction: NOT and AND from NAND; failure experiment: an OR of three NAND
  gates, broken three ways; explanation: one AND per row, so NAND is universal; generalisation:
  NOR does the same; challenge: XOR from NAND; reflection.
- `steps.a1`: the prediction's one step sets A to 1. A few words.
- `options.y0`: Y is 0; `options.y1`: Y is 1.
- `captions.predictTied`: predict Y when A is 1 and both NAND inputs are wired to A.
- `captions.exploreNand`: press A and B, watch Y and the shaded row.
- `captions.buildNot`: draw NOT from NAND gates and run the tests.
- `captions.buildAnd`: draw AND from NAND gates and run the tests.
- `captions.orFaults`: choose a fault in the OR made of NAND gates, run the checks.
- `faults.cutNa`: the wire NA, from the top NAND gate (nandA) to the last one (nandY), is cut.
- `faults.nandAToAnd`: the gate nandA is an AND gate instead of a NAND gate.
- `faults.nandYToAnd`: the gate nandY is an AND gate instead of a NAND gate.
- `captions.clashExpression`: the CLASH circuit from lesson 1 as one expression.
- `captions.exploreNor`: press A and B, watch Y and the shaded row.
- `captions.exploreNorTied`: a NOR gate with both inputs wired to A; press A.
- `captions.buildXor`: draw XOR from NAND gates and run the tests.
- `challengeTitles.c1`: NOT from NAND; `c2`: AND from NAND; `c3`: XOR from NAND (for the CLASH
  lamp). Noun phrases of the same shape.

## Lesson 3 (`fewer-gates`): fewer gates, shorter paths

What it does: the manager wrote the CALL lamp's rule as its four rows, one AND gate per row:
eight gates, for a board with room for four. The learner predicts one row and sees WARM made no
difference there, reads the table in pairs of rows that differ in one input, builds CALL in four
gates, predicts against a circuit simplified one step too far, watches a chain and a tree of OR
gates settle in different numbers of steps (depth), sees two lamps share a gate, and builds XOR in
four NAND gates.

- `title`
- `objectives` (three or four): find the inputs that make no difference in pairs of rows and
  build a circuit with fewer gates; check a simpler circuit against every row; measure a
  circuit's depth and say why it matters; share a gate between two outputs.
- `titles.*` (ten). What each contains: question: eight gates for a board with room for four;
  motivation: why fewer gates and shorter paths; prediction: one row of the manager's circuit;
  investigation: rows in pairs; construction: CALL in four gates; failure experiment: one
  simplification too many; explanation: steps and depth; generalisation: two lamps sharing a
  gate; challenge: XOR in four NAND gates; reflection.
- `steps.coldOpenClosed`: the prediction's one step sets WARM 0, DOOR 1, CLOSED 1. A few words.
- `options.call0`: CALL is 0; `options.call1`: CALL is 1.
- `options.same`: lights CALL in the same rows; `options.different`: lights CALL in some
  different row. (Phrases that fit "You chose {option}.")
- `sides.rows`: the manager's eight-gate circuit; `sides.tooShort`: the two-gate circuit;
  `sides.separate`: the two lamps with their own gates; `sides.shared`: the two lamps sharing a
  gate. These are headings above drawings and also column headings in a table, so two or three
  words each, such as "Manager's circuit".
- `captions.predictWarm`: predict CALL with WARM 0, DOOR 1, CLOSED 1.
- `captions.callPairs`: choose an input and read the rows in pairs.
- `captions.buildCall`: draw CALL with at most 4 gates and run the tests.
- `captions.tooShort`: predict whether the short circuit matches the manager's in every row.
- `captions.chainSteps`: press ROOM1 to ROOM4 and read the steps (three OR gates in a chain).
- `captions.treeSteps`: the same three OR gates as two pairs; press each input and read the
  steps. ("Depth" may be used from here.)
- `captions.twoLamps`: two ways to build ALARM and CALL, with gate counts and depth.
- `captions.buildXorFour`: draw XOR from at most 4 NAND gates and run the tests.
- `challengeTitles.c1`: CALL in four gates; `c2`: XOR in four NAND gates.
````

### V-view-strings.md

````markdown
# Brief V: the words of Module 2's new figures and tests

Read the shared fact sheet (00-module.md) first. These strings appear inside figures and test
results on any of the three lessons' pages. Draft each one; keep every `{slot}` exactly as
written (the page fills it in). Return a block of key: "string" lines and nothing else.

These strings are read on lesson pages where "depth" is or is not yet introduced; only the
strings marked "depth" may use the word.

## Two circuits compared (figure `circuit-compare`)

Two circuits are drawn one above the other, each under a short heading the lesson gives. Under
each drawing, optionally, a line with its number of gates and its depth. Then a sentence saying
whether the two agree, and a table: the inputs, each circuit's output, and a last column saying
whether the two agree in that row. Rows that differ are shaded.

- `compare.drawing`: the accessible name of each drawing. `{label}` is the heading. Example
  shape: "{label}: circuit diagram".
- `compare.gates`: "{n}" is the number of gates in the drawing above. A short phrase.
- `compare.depth` (depth): "{n}" is the circuit's depth. A short phrase. It is shown on the same
  line as `compare.gates`, separated by a comma, so write both as phrases of the same shape
  (such as "Gates: {n}" and "Depth: {n}").
- `compare.tableCaption`: the table's caption: both circuits' outputs, row by row.
- `compare.agree`: the last column's heading: do the two outputs agree in this row?
- `compare.same`: that column's value when they agree. One word.
- `compare.differs`: its value when they do not. One word.
- `compare.allSame`: "{total}" is the number of rows: the two circuits give the same outputs in
  every row. (A circuit may have more than one output; say "outputs".)
- `compare.someDiffer`: "{n}" of "{total}" rows: the two circuits' outputs differ in n rows.

## A truth table read in pairs (figure `input-pairs`)

The learner picks one input with radio buttons. The table then shows the rows in pairs that
differ only in that input: the other inputs' values, the output with the chosen input at 0, the
output with it at 1, and whether the chosen input changed the output. Pairs where it did not are
shaded.

- `pairs.choose`: the heading over the radio buttons: which input to try.
- `pairs.caption`: the table's caption. "{input}" is the chosen input: rows in pairs that differ
  only in {input}.
- `pairs.at`: a column heading part: "{input} = {value}" where value is 0 or 1. Keep this shape.
  It is shown after the output's name and a comma: "CALL, WARM = 0".
- `pairs.matters`: the last column's heading: does {input} change the output in this pair?
  A short question.
- `pairs.yes` and `pairs.no`: that column's values.
- `pairs.summary`: "{input} changes the output in {n} of {total} pairs." Keep the slots.

## The explorer's table

- `explorer.ownTable`: the caption of the table under a circuit's drawing that lists every row
  of that circuit, worked out by the simulator. The row of the inputs now is marked "Applies now".
  It must not use "truth table" (it appears before that term is introduced).

## Limits on a challenge

A challenge may set limits besides its rows: at most so many gates, at most so many gates on any
path from an input to an output (depth), gates of only some kinds. Each limit is one more test,
listed with the rows' tests. A test's name is shown as a heading; when it fails, a sentence under
it says what was found, and the drawing marks the gates it is about.

- `limits.gates`: test name. "{limit}" is a number: at most {limit} gates.
- `limits.gatesFound`: when it fails. "{count}" is how many gates the circuit has, "{limit}" the
  limit. Two short sentences.
- `limits.depth` (depth): test name: at most {limit} gates on any path from an input to an
  output. Do not use the word "depth" here; it can show on a page before the term.
- `limits.depthFound`: when it fails. "{count}" gates on the longest path, "{path}" the gates'
  names in order from the input end, joined by commas, "{limit}" the limit. Do not use "depth".
- `limits.only`: test name. "{kinds}" is one or more gate names, such as "NAND": only {kinds}
  gates.
- `limits.onlyFound`: when it fails. "{list}" names each gate of another kind, such as
  "AND and1, NOT not1": which gates are another kind.
- `limits.and`: the word that joins two gate names in `{kinds}`, with spaces around it.
````

### R-review.md

````markdown
# Review brief: Module 2, "Boolean logic", three lessons (the reading half)

You are reviewing one lesson of an interactive course, *Digital Design: From Bits to a Working
Computer*, as its learner. You did not build it. Read as the learner, report what fails them,
and quote the page for every finding.

## Who you are reading as

A learner who has done Module 1 and, for lessons 2 and 3, the Module 2 lessons before this one,
and nothing after. From Module 1 they know: bit, threshold, noise margin, binary, word, unsigned,
signed, hexadecimal, and a shop's freezer room whose sensor sends a 16-bit temperature to a
display in the office. They have never seen a gate before lesson 1. Lesson 1 (`gates`) is
"How do you build a circuit from a rule?"; lesson 2 (`nand`) is "Can you build every gate from
NAND alone?"; lesson 3 (`fewer-gates`) is "How do you build a circuit with fewer gates?".

## What to read

Your lesson is named in the message that sent you this brief. Read, in this order:

1. The course's rules for the writing: /home/user/digital-design/CLAUDE.md (sections "Voice",
   "What no check can catch") and /home/user/digital-design/docs/style.md (the two passes at the
   end).
2. The page's text, as the built page shows it, top to bottom:
   /tmp/claude-0/-home-user-digital-design/df71c468-a07b-5bac-9fdc-29bb38c795f1/scratchpad/shots2/<lesson>-1280.txt
   (drawings appear in it as their labels only).
3. Screenshots of every section at 1280 pixels in
   /tmp/claude-0/-home-user-digital-design/df71c468-a07b-5bac-9fdc-29bb38c795f1/scratchpad/shots3/
   (`<lesson>-1280-NN.png`, one per section, as first loaded), and of every figure after it has
   been used at 375 pixels and in the dark theme in
   /tmp/claude-0/-home-user-digital-design/df71c468-a07b-5bac-9fdc-29bb38c795f1/scratchpad/walk/
   (`<lesson>-375-light-fig-NN.png`, `<lesson>-1280-dark-fig-NN.png`, and the challenges as
   `<lesson>-375-light-ch-<id>.png`). Look at the images; do not only read file names.
4. To check a fact, you may read the lesson's data and the code the figures run:
   /home/user/digital-design/content/lessons/<lesson>.ts, .prose.ts, .labels.ts,
   .facts.test.ts, and /home/user/digital-design/packages/dd-model/src/logic.ts. The facts test
   holds the numbers the prose states. Check a number or a cross-reference before you assert it.

Do not read docs/notes/, the git history, or the briefs.

## What to look for

- A fact on the page that the figure or the simulator contradicts. A figure that does not show
  what the prose says it shows.
- A term used before the lesson defines it, or a term from a later lesson. A word that means two
  things on one page. A definite article before something the lesson has not introduced.
- Text shown before a prediction is answered (a section's prose, a figure's lead or after-text,
  the question, a caption, a section title) that gives the prediction's answer away.
- The same point made twice, far apart; a paragraph that answers two questions; a join between
  two paragraphs that does not follow.
- A step the learner must take that the page does not tell them how to take; a control named in
  the prose with a label the page does not show.
- A challenge whose task, tests and hints disagree, or whose hints do not climb (concept,
  mistake, smaller example, part of the answer, the answer).
- What a phone or the dark theme breaks: text that is cut off, a table that hides a column, a
  label on another label.
- The style checklist's first and second passes (docs/style.md).

## Rules for your report

- Number the findings F1, F2, ... Each has: where (section and figure), a quote from the page,
  what is wrong for the learner, and a direction (what kind of change), never rewritten text.
- Never write or hint at a challenge's answer.
- Rate each finding high (the learner is misled or stuck), medium (the learner is slowed or
  confused), or low (polish).
- Return the report as your final message, as plain Markdown. Do not try to write a file.
````

### S-sceptic.md

````markdown
# Sceptic brief: attack each review finding (Module 2)

A reviewer read one lesson of the course as its learner and returned numbered findings. Reviewers
over-call. Your job is to attack each finding before anyone acts on it.

For each finding:

1. Check its quote against the page:
   /tmp/claude-0/-home-user-digital-design/df71c468-a07b-5bac-9fdc-29bb38c795f1/scratchpad/shots2/<lesson>-1280.txt
   and the screenshots in .../scratchpad/shots3/ and .../scratchpad/walk/ the review cites. A
   quote that is not on the page fails the finding.
2. Check its facts against the lesson's data and the model:
   /home/user/digital-design/content/lessons/<lesson>.ts, .prose.ts, .labels.ts, .facts.test.ts,
   /home/user/digital-design/packages/dd-model/src/logic.ts. A claimed error that the simulator
   bears out is not an error.
3. Ask whether the learner (Module 1 and the earlier Module 2 lessons only) would be misled or
   slowed, or whether the reviewer is applying a rule the course does not have. The course's
   rules are /home/user/digital-design/CLAUDE.md and docs/style.md.
4. Give a verdict: UPHELD (true and worth acting on), IN PART (say which part), or REJECTED (say
   why). Add a one-line reason.

Never write a challenge's answer. Do not read docs/notes/ or the git history. Return your
verdicts as your final message, as a Markdown table (finding, verdict, reason), then a list of
anything the review missed that you found while checking. Do not try to write a file.
````

### review-gates.md

````markdown
# Review of `gates` (Module 2, lesson 1), reading half

(Saved by the managing model from the reviewer's returned text, unchanged in substance.)

F1 High. Question and Prediction. The question states the prediction's answer. Quote: "ALARM should light when the freezer room is warm and its door is shut. Why? Warm with the door open is expected while staff load stock." The prediction asks "Staff have the door open ... What is ALARM?" The prediction prose also hands over each gate's rule ("the AND gives 1 only when both its inputs are 1"). Direction: ask about a row whose behaviour the question has not stated, or move the rule's motivation after the prediction.

F2 Medium. Prediction and Construction. The prediction figure is the construction's answer. Quote: "Build it from the rule, not by copying the drawing from the prediction." Direction: make the prediction figure a different or partial circuit.

F3 Medium. Failure experiment. Quote: "Before you run the checks, say which rows you expect each fault to break." The after-text visible from load gives every row. Direction: reveal it only after the checks have run.

F4 Medium. Failure experiment. "X" means two things on one page: the time-model banner "A signal that keeps changing is shown as X." and the lead "The simulator marks its value as X: a value it cannot know". The banner also uses "step", and the STEPPED chip is never explained. Direction: say once what X means; say what stepped means.

F5 Medium. Construction. Controls appear before the terms they need: "As text", "Import from text", "Unconnected (1)", "Tidy the layout", "Recompute from all-zero inputs"; "press one port" but a port is never defined. Direction: say what a port is; say what the text panels are for or defer them; name "Unconnected".

F6 Medium. Phone. At 375 px the fault figure and the challenge drawings scroll sideways; the output lamp is off-screen. The stuck fault shows a block "CONST" and "The signal is held at one value whatever drives it, like a shorted or jammed input." "CONST" undefined, "shorted or jammed" jargon. Direction: fit the drawings to the phone or explain; name the stuck block in plain words.

F7 Medium. Explanation. `logic`, `module`, `assign` not explained; the figure's text and drawing do not name SHUT though the prose says "SHUT is the `~DOOR` inside it"; "You can read the truth table from the expression" has no worked row. Direction: add a worked row; say what `logic` marks; name the same wire in figure and prose.

F8 Medium. The time-model banner and the hardware note say the same thing twice; "the simulator" is used before it is introduced. Direction: say it once; introduce the simulator.

F9 Low. Generalisation. "Press WARM1 and WARM2." three times in a row; "common enough to have its own name" roundabout; "Both do the job." says nothing; `CLASH = WARM1 ^ WARM2` without `assign`. Direction: cut the repeat; state the point of five versus one; one form.

F10 Low. Labels where statements belong: "Why?", "This is the rule:", "Here comes the third lamp", "That raises a question:". Direction: state the point.

F11 Low. NIGHT has no reason given; the reflection's first paragraph repeats the explanation; the header line's meaning is not told; the order of `&` and `|` is taught only in hint 2 while the task says "Add brackets where you need them". Direction: give NIGHT a purpose; cut the recap.

F12 Low. "inverter" never used again; "the timing diagram" named without saying what one is; "Values at time 1" wraps; "using only what they are now" unclear; "00, 01, 10, 11" does not say which bit is first.

F13 Low. "NOW / Applies now" before the lead explains; "The three figures above worked out every row with the simulator" reads as a claim the page does not show.

Checked out: the fault rows, hint counts, the NIGHT precedence rows; no overlapping labels.
````

### verdicts-gates.md

````markdown
# Sceptic's verdicts on review-gates.md (saved by the managing model from the returned text)

| Finding | Verdict | Reason |
|---|---|---|
| F1 | IN PART | The question states the rule and the prediction asks about warm with the door open, so the answer is derivable from the question; the gates' rules in the prediction prose are fair. |
| F2 | IN PART | The prediction figure is the construction's answer; the page says not to copy; low priority. |
| F3 | UPHELD | All three fault outcomes show below the figure before "Run checks" is pressed, defeating "say which rows you expect". |
| F4 | IN PART | X is described two ways on one page (banner: keeps changing; lead: cannot know). The STEPPED chip part is rejected: pressing it opens the note. |
| F5 | IN PART | "Unconnected", "As text", "Import from text" unexplained on the first builder lesson; "port" is not a blocker (visible circles, help text). |
| F6 | IN PART | Sideways scroll rejected (the page says so; the table shows ALARM). CONST and "shorted or jammed" upheld. |
| F7 | IN PART | No SHUT label in the expression figure; `logic` unexplained; no worked row. Minor. |
| F8 | IN PART | "Simulator" part rejected (used in later lessons too). The banner and the hardware note overlap; edit the note. |
| F9 | UPHELD | "Press WARM1 and WARM2." three times; "Both do the job." empty; `CLASH =` without `assign`. "Common enough" rejected. |
| F10 | UPHELD | "Why?", "This is the rule:", "Here comes the third lamp", "That raises a question". |
| F11 | IN PART | NIGHT has no reason; reflection's first paragraph repeats the explanation. Header and precedence points rejected. |
| F12 | REJECTED | "Values at time 1" not on the page; inverter harmless; timing diagram used before in the course; bit order follows the names. |
| F13 | REJECTED | The lead explains "Applies now"; the tables are generated from the model. |

Missed by the review:
- DOOR means two things in the stuck fault: "DOOR is 1" for the real door, "DOOR stays 0" for the signal.
- At 375 px the stuck fault's CONST block and the output are off-screen; only the check list shows ALARM.
- The reflection's heading "How many kinds of gate?" and its closing question repeat.
````

### review-nand.md

````markdown
# Review of `nand` (Module 2, lesson 2), reading half

(Saved by the managing model from the reviewer's returned text, unchanged in substance.)

F1 High. Motivation, Construction, Failure experiment. Motivation: "So the work is three small circuits: each one builds a gate (NOT, AND or OR) from NAND gates alone." Construction: "You will build two circuits: NOT and AND." Prediction explain: "That is the first of the three circuits." OR is never built and the page never says why; the explanation rests on a circuit the learner only inspected. Direction: make the count agree; say OR is shown to read, not to build.

F2 High. Prediction explain, Construction lead, challenge NOT from NAND. "a NAND gate with its inputs wired together is a NOT gate. That is the first of the three circuits." and "Start with the circuit the prediction showed." The first challenge becomes a copy; hints 3 to 5 repeat it. Direction: decide whether the prediction or the construction is the discovery and trim one.

F3 High. XOR from NAND hints. Hint 1 "Build one gate that outputs 1 only when A is 0 and B is 1" lays out the whole plan; hint 4 "P outputs 0 only when both inputs are 1 … Now you have the two AND gates." calls inverted gates AND gates; hint 3's NAND-of-NANDs shortcut comes only on the third rung; hint 2 "Many people forget the NOTs." reads as an afterthought. Direction: a ladder that climbs, one consistent statement of what each placed gate outputs.

F4 Medium. Reflection: "XOR needs five NAND gates here." gives the size of the final challenge's answer before it is attempted. Direction: ask the question without the number.

F5 Medium. XOR and CLASH never connected on this page: "Draw a circuit for the CLASH lamp with inputs A and B and output Y." Title says XOR; A and B not mapped to WARM1 and WARM2. Direction: say once that CLASH is XOR and A, B are the two sensors.

F6 Medium. Repeats: "Any chip in the drawer can replace any failed chip on the board." vs "Any spare in the drawer replaces any failed chip."; "This gives a correct circuit, though not always a small one." vs "This way of building gives a correct circuit. It is not always the smallest."; "Now the question is: can NOT, AND and OR build every truth table?" Direction: each once; cut the reflection to what is new.

F7 Medium. "Tied" used before defined ("The tied gate from the prediction used only two rows"); "the text" never named ("The text writes the whole circuit as one expression."). Direction: define tied or keep "wired to the same signal"; name the text form once.

F8 Medium. Phone: the CLASH explanation figure and the XOR canvas scroll sideways; the OR gate and the code line are cut off at 375 px. Direction: a layout fix, or keep the output in view.

F9 Low. In the CLASH figure not2 sits above not1.

F10 Low. NOR's OR and AND claimed in one paragraph with four ideas and no figure. Direction: split; or say the learner can try them.

F11 Low. Style: "That is the first of the three circuits." (rule 17); "Y is the opposite of A, so this tied NOR gate is a NOT gate. A NOR gate followed by a tied NOR gives an OR." (which NOR); "Now the question is:" (rule 3); "fails if your circuit has any gate that is not a NAND and names it" ambiguous.

Checked and fine: the fault rows; the tied-NAND explanation; the NAND and NOR tables; the NOT and AND hint ladders apart from F2.
````

### verdicts-nand.md

````markdown
# Sceptic's verdicts on review-nand.md (saved by the managing model from the returned text)

| Finding | Verdict | Reason |
|---|---|---|
| F1 | UPHELD | "three small circuits" vs "You will build two"; OR only broken. Say OR is read and broken, not built. |
| F2 | IN PART | The predict-then-build overlap is deliberate; the lead "Start with the circuit the prediction showed" and hints 4 and 5 hand it over. Trim, do not restructure. |
| F3 | IN PART | Hint 4 "Now you have the two AND gates" is wrong (P and Q are NANDs, 0 in their row). The plan in hint 1 is rejected as a fault. Hint 2 weak but minor. |
| F4 | IN PART | Small spoiler; the bigger problem is "XOR needs five NAND gates here" beside "Can CLASH use fewer?": say the plan uses five. |
| F5 | UPHELD | The page never says CLASH is XOR or that A and B are WARM1 and WARM2. |
| F6 | IN PART | The spares sentence and the "correct, not small" sentence repeated: upheld. "Now the question is" belongs with F11. |
| F7 | IN PART | "tied" never defined: upheld. "the text" rejected (met in lesson 1). |
| F8 | REJECTED | Sideways scroll with the note is documented behaviour. |
| F9 | REJECTED | The order keeps the wires from crossing. |
| F10 | IN PART | Correct but dense; a split or a pointer to the explorer would help. Low. |
| F11 | IN PART | "first of the three circuits" (F1); "Now the question is:" (rule 3); "fails ... and names it" ambiguous: upheld. "which NOR" rejected. |

Missed by the review:
- c1 hint 3 speaks of B on a one-input challenge.
- c3 hints: the NAND-of-NANDs shortcut comes before the plan to place P and Q; odd order.
````

### review-fewer-gates.md

````markdown
# Review of `fewer-gates` (Module 2, lesson 3), reading half

(Saved by the managing model from the reviewer's returned text, unchanged in substance.)

F1 High. Question. "The board has room left for 4 more gates." vs the title "Eight gates, room for four" and the task "Use at most 4 gates". "4 more" reads as 12 in all. Direction: one budget, said as a total.

F2 High. Prediction explain: "Two AND gates do the work of one AND gate of DOOR and CLOSED." reads backwards; the conclusion should be that one gate can replace two. Direction: and3 and and4 differ only in WARM, CALL is 1 in both, one gate on DOOR and CLOSED covers both.

F3 Medium. Prediction. The question says CALL "also lights when the door is open while the shop is closed"; the prediction asks for exactly that row. Direction: a row that needs the circuit, or ask what changes when WARM flips.

F4 Medium. Investigation after-text: "Two shaded pairs have CALL 1 in both rows. When WARM is chosen, those are DOOR 1 and CLOSED 1... When CLOSED is chosen, those are WARM 1 and DOOR 0." Under WARM there is one such pair. DOOR also has one (WARM 1, CLOSED 1) the text never mentions. Direction: one such pair under each input; the construction uses two of the three.

F5 Medium. Investigation lead: one dense paragraph; "It starts on WARM" has an ambiguous "It"; the after-text answers the lead's task at once. Direction: split; give "It" its noun.

F6 Medium. Failure explain: "WARM changes nothing in the pair where DOOR and CLOSED are both 1, so the short circuit took WARM alone. But that does not mean DOOR disappears from the other term." The error is that the WARM term lost NOT DOOR; it does not say why row 110 goes wrong. Also "light CALL in some different row" awkward; "The table below compares both circuits" sits after the figure though the table is inside it.

F7 Medium. Explanation figures open on "Step 3 of 3 / Settled in 3 steps" before any press; "Settled in 0 steps" after pressing all four, unexplained; at 375 px ANY is clipped. Direction: no settling claim until a change; say what 0 steps means; fit the phone.

F8 Medium. "Drag the 'Step' slider to see how fast each settles." "Settle" never defined; the after-text gives the counts at once; no prediction. Direction: predict which input is slowest; say what settles means.

F9 Medium. Challenge 2: the lead "Sharing one gate is the way in: a gate that both row gates need can be built once instead of twice." is hint 1; hint 3's parentheses misplaced and it reasons about a gate before hint 4 defines P and Q; "row gate", "NOT A / NOT B" undefined here. Direction: move sharing out of the lead; reorder hint 3.

F10 Medium. Construction: "Build CALL from the two AND gates the pairs found." Say NOT and OR count as gates; hint 2 starts as a fragment ("Dropping an input that matters."); hint 3 gives one term in full.

F11 Low. Generalisation: "the same outputs in all 8 rows" said in the figure and again in the after-text, with the gate counts; "CALL's first AND gate" has no order in the figure.

F12 Low. The "Inputs and outputs" table under the chain and tree repeats the drawing; the time-model note's "A signal that keeps changing is shown as X" never applies here.

F13 Low. The eight-gate drawing's wires are hard to trace.

F14 Low. Reflection repeats the explanation ("The chain and tree both used 3 OR gates but settled in 3 and 2 steps"); "the short CALL" is a label the lesson never used; "rows where an input makes no difference" vs "pairs"; "A real gate takes time to answer" said in the explanation and the hardware note.

F15 Low. Question's last paragraph answers two questions: the previous lesson's CLASH question and this lesson's CALL question, unjoined.

Checked and fine: the CALL rows and the 8-gate count; 6 and 4 gates and depth 3; the chain and tree step counts; the 1-of-8 difference.
````

### verdicts-fewer-gates.md

````markdown
# Sceptic's verdicts on review-fewer-gates.md (saved by the managing model from the returned text)

The sceptic found no facts test for this lesson: the managing model had written lessons 1 and 2's
and not this one. Written at once (content/lessons/fewer-gates.facts.test.ts, eight tests).

| Finding | Verdict | Reason |
|---|---|---|
| F1 | UPHELD | "room for four" title, "at most 4 gates" task, "room left for 4 more gates" body. |
| F2 | UPHELD | "Two AND gates do the work of one" reads backwards; one gate on DOOR and CLOSED replaces both. |
| F3 | IN PART | The question states the row; low value; reword or leave. |
| F4 | IN PART | Three such pairs, one under each input; the text means the two the build uses. |
| F5 | IN PART | Dense; "It starts on WARM" has no noun. The after-text answering at once is the lesson's pattern. |
| F6 | IN PART | The cause is blurred: the WARM term lost NOT DOOR. Option label awkward. Table placement rejected. |
| F7 | IN PART | Opening on "Settled in 3 steps" is odd; the explorer is shared, so a fix belongs to the figure. Phone scroll rejected. |
| F8 | IN PART | "Settle" undefined. A prediction is a preference, not a rule. |
| F9 | UPHELD | The lead gives hint 1; hint 3 reasons before hint 4 names P and Q. (Its claim that hint 3's parentheses are swapped is wrong: checked, they are right.) |
| F10 | IN PART | Hint 2 a fragment; NOT and OR count as gates worth saying. Hint 3 rejected. |
| F11 | IN PART | "the same outputs in all 8 rows" twice; "CALL's first AND gate" has no order. Low. |
| F12 | REJECTED | Shared platform text and table. |
| F13 | REJECTED | No overlap; subjective. |
| F14 | IN PART | "the short CALL" a new label; the repeats are a normal recap. |
| F15 | UPHELD | The question's last paragraph joins two questions with nothing. |

Missed by the review:
- c1 hint 4 states the formula in full (by design for a last-but-one rung; noted).
- "ALARM's rule from lesson 1 of this module" vs "the first lesson of this module": two ways to name one lesson.
- "the shop" closed and open in nearby sentences: a learner could mix the signal and the state.
````
