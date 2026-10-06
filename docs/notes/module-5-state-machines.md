# Module 5, lessons 2 to 5: counters, register transfer, state machines

A working note, written as the module was built, on the branch `module-5-state-machines`. Modules
6 and 7 were built at the same time on their own branches; no build could see another's. Times
are read from the clock (`date -u`), not estimated. Who did what: "the managing model" is the
session that planned, wrote the code and the briefs, and checked every draft; "the drafting
subagent" wrote every learner-facing sentence from a brief of checked facts.

## Times

- Started: 2026-10-05 22:33 UTC (first command in the session).
- Finished: 2026-10-06 00:58 UTC (the push of the last commit, after `scripts/check.sh` passed on it).
- About two hours: the platform and the lessons in the first hour, the words, the reviews and
  their fixes, and the merge of `main`'s new wire rules in the second.

## Log

- 22:33 to 22:41 Read CLAUDE.md, `docs/plan.md`, `docs/notes/modules-5-6-7-plan.md`,
  `docs/authoring.md`, `docs/style.md`, `docs/simulator.md`, `docs/inventory.md` (sections 2,
  5.2, 5.3, 7, 8), `docs/checkpoints.md`, the registers lesson with its words and facts test, and
  the notes (module 5 registers, module 3, the systemverilog, straight-wires and diagrams notes,
  the "what I would change" of modules 1 and 2 and the first fix pass). `npm ci` and the build
  passed. Read the HDL package (the parser, the elaborator, the construct gate), the model's
  library and blocks, the drawing compiler, the book and the explorer, prediction and timing
  diagram figures.
- 22:41 to 22:58 The module's shape, decided before code (see "Why four lessons" below), and the
  state-machine model: `dd-model/src/fsm.ts` (a machine as data; its circuit read off the table
  row by row; its text) and `machines.ts`. Its test, every state and every input against the
  table, for the circuit and for the text elaborated, passed first time. The enumerated type
  in `packages/hdl`, with its gate id and plain refusals.
- 22:50 to 23:00 The state-machine figure (`StateMachine.tsx`), named values in timing-diagram
  lanes, a `prime` for explorers, a 4-bit register block for drawings.
- 23:00 to 23:05 The four lessons' structures with placeholder words. Every reference passed and
  every starting point failed at once. Facts explored from the figures' own props:
  - **My first failure experiment for counters did not work.** A ripple counter (each
    flip-flop clocked by the one before, the textbook's way, shown as the wrong way) with a
    reset ANDed into the later clocks stayed unknown in its upper bits: when RST fell, the
    master latch's D went unknown a step before its clock rose, a hold failure inside my own
    circuit. Dropped. The same lesson, values passing through on the way, is shown instead in
    the stepped model inside the adder, where the register never takes them.
- 23:05 to 23:12 Looked at the figures in the built page. Found and fixed:
  - **SEND and SIREN were drawn unconnected**: the output block's ports were computed before
    the block made its nets (an object literal evaluated before the body). Now a function, with
    a test that every block port names a net.
  - **The next-state logic opened to a tangle**: one-bit `bit` parts cannot carry a word wire in
    a drawing, so the state word reached nothing; the gates were laid out automatically. Words
    are now split and joined by split and join blocks, as Module 3 does, every part inside is
    placed in columns (bits, lines, NOT gates, one AND per row, one OR per bit, join), and a
    block may carry its own pins' places in its metadata (`scene.ts`, `placedInside`).
  - **The diagram's top labels were cut off** and its middle crowded: states moved, one label
    placed by hand.
  - **The pins came out in alphabetical order**; now in the machine's order.
  - A row leading to IDLE (code 00) needs no gate, so none is drawn; a NOT gate for an input
    only such a row reads was left with no reader, and is not made now.
- 23:13 Committed the platform (`e362369` after the amend). The commit trailer the session asked for named a
  model; amended before pushing to "Co-Authored-By: Claude", as the task forbids model names
  in commit messages (earlier commits on `main` do carry one).
- 23:13 to 23:16 Facts tests for all four lessons, before any brief. They caught three test
  counts I had wrong by one or two, and one more drawing fault: a stuck-at fault on a wire inside
  a block put its fixed-value part at the top level, so the opened block showed that wire with
  no source. A fault's part now sits inside the block whose wire it drives (`faults.ts`).
- 23:16 to 23:40 The words. One shared fact sheet (`00-module.md`: voice, the learner, the
  setting, working words, banned words, the page's controls), one fact sheet per lesson
  (`C-`, `R-`, `S-`, `N-facts.md`), and per lesson four briefs: A (question, motivation,
  prediction), B (investigation, construction, failure), C (explanation, generalisation,
  challenge, reflection, model note), E (labels); and brief V for the state-machine figure's
  own words and the new parts' and circuits' names. 17 briefs to 17 drafting subagents, each
  with `docs/style.md`. All are in `docs/notes/module-5-state-machines/briefs/`; every draft as
  accepted is in `drafts/`, and a script (kept in the session, not the repository) places a
  draft's keys into the lesson's prose and labels files, whole keys only. Each draft was read
  only after its subagent reported done. What came back, and what was done (details under
  "Briefs and drafts" below).
- 23:35 One more platform bug, found while checking a hint's claim against the elaborator: a
  `case` label of the wrong width gave "xor gate inputs differ in width (const1)", an internal
  message with no line, which the encoding lesson's construction would have shown to every
  learner who left a 2-bit code in a 3-bit place. Now refused with its line ("this label is 2
  bits wide but the case compares a 3-bit value"), with a test.
- 23:38 A scripted scan of the placed text for the fact sheet's banned words found "hold" and
  "holds" eleven times: for a register's contents ("a register that holds its state"), for a
  press ("holds Save down", "the hold") and for a sender keeping OK at 1. The fact sheet reserves
  "hold" for hold time. **Five of the eleven came from my own fact sheets** (S-facts and N-facts
  said "holds", "held as its code", "holds OK at 1"); the drafts copied them, as CLAUDE.md says
  they will. Also "step" in a heading ("The next step"; "step" is the Stepped model's) and four
  "just"s. Sent back, key by key, to the nine subagents concerned.
- 23:40 to 00:01 The browser suites on the placed words (module 5, diagrams, lesson pages, the
  look). Each diagram check stops at its first failing lesson, so each fix showed the next:
  - **The counters scene's bus count "4" sat on the TICK wire's name**, and the scene was too
    wide for a phone. The lamp now comes first and its label is "Lamp" (a cut of "Tick lamp",
    no new words). The register-transfer scene had the same collision twice over: the count
    under a named bus meets the name over the next row's wire. A scene now writes a named bus's
    count beside its name, above the wire (`SceneFigure.tsx`, the only scenes with named buses
    are this module's), and the two readouts show NOW and PREV in their boxes instead of on
    their wires, which also brings the scene inside a phone's width.
  - **Half-cell steps**: a 4-bit register block with an enable has four inputs, so its Q sits
    half a cell off its D; the NOW wire from one register to the next stepped 10 pixels. The
    second register is placed a cell and a half lower. Inside the next-state logic each NOT
    gate's input sat half a cell under its pin; the gates are placed half a cell up.
  - **The capstone and the lab of the state machines lesson drew the elaborated text** in
    "Try it": forty parts of muxes, constants and the register's flip-flops, laid out by the
    automatic placer, unreadable and failing the wire check. A written challenge may now say
    `tryIt: "pins"` (`lesson-schema`, `book.tsx`): the inputs as buttons and the signals as a
    table, with no drawing. The three written state-machine challenges use it. The button text
    reuses the state-machine figure's drafted words, so no new string.
  - **A failed test's diagnosis widened the phone page to 1,265 pixels**: it lists the paths of
    the parts that could be to blame, as adjacent `code` elements with no space, which inside a
    state register are long (`state_reg/ff0/slave/sr/norQb`). Pre-existing in the runtime; it
    never showed before because no earlier challenge had a register under text. CSS wraps them
    now (`course.css`, Module 5 block).
  - Added a stored screenshot of the state-machine figure at both widths, looked at before it
    was kept.
  Committed as `1dfda0c`.

## Why four lessons

The plan lists counters, register transfer, state machines, state encoding and synchronous design,
after the registers lesson that `main` already had. Four lessons carry them:

- **counters**: a register whose D is its own Q plus EN, through a chain of half adders. Lab: the
  counter, drawn (2 bits, then 4 bits with TICK).
- **register-transfer**: two registers taking words at one edge (NOW and PREV), a press that
  lasts many edges, a swap with no third register. Lab: the 16-bit register, written (the
  freezer room's readings with an undo).
- **state-machines**: the retry controller (Slice 2: IDLE, TRY, WAIT, GIVE_UP; GO, OK, FAIL,
  TICK; SEND in TRY and SIREN in GIVE_UP, outputs read from the state alone). Its diagram, its
  table, its circuit and its text are four views of one machine in one figure. Lab: one bit of
  its next-state logic, drawn; then the controller's text, changed.
- **state-encoding**: which code each state gets, the reset as the reason it matters, one
  flip-flop per state; then the rule all of the module keeps, named **synchronous**, through
  the one failure it allows (an answer between two edges is never seen). Capstone: the defrost
  controller, written from its diagram alone.

Synchronous design has no lesson of its own. Every circuit since the registers lesson already
keeps its rule, and a lesson about the rule alone would restate the earlier ones; its failure
(an input that does not last until an edge) needs a state machine to matter, so it sits in the
encoding lesson's failure experiment and the term arrives in that lesson's explanation.

## Reused

- The registers lesson's register (`register()` with reset and enable), its D flip-flop with
  reset, Module 3's half adder, decoder and comparator, all as they were.
- The explorer, prediction, fault, circuit-text and scene figures, the timing diagram, the
  builder, the HDL panel, the hint ladder and the test runner, unchanged in behaviour.
- The term gate, the construct gate, the content tests' wire checks and every browser check.

## Added, and why

- `dd-model/src/fsm.ts`, `machines.ts`: a state machine as data (states with codes and outputs,
  rows with conditions), checked for gaps and overlaps; its circuit read off the table (a line
  per state, an AND gate per row, an OR gate per bit); its text in codes or with named states.
  One source for the diagram, the table, the circuit and the text, so the four cannot disagree;
  the test runs every reachable state with every input through the circuit and the elaborated
  text.
- `dd-model/src/library-module5.ts`: the counter, the add-one block, the counter to five, NOW
  and PREV, save once, the swap, and each machine placed. `combinational.ts`: a 4-bit register
  block with reset and enable for the palette. `faults.ts`: a fault's part sits inside the block
  whose wire it drives.
- `hdl`: `typedef enum`, gated as the construct `enum`, with plain refusals; a `case` label of
  the wrong width refused with its line.
- `dd-views`: the state-machine figure (`StateMachine.tsx`: diagram, table, input buttons,
  status line, circuit, timing diagram, text); named values in timing lanes; `prime` for
  explorers; a block may carry its pins' places (`scene.ts`); the register block in drawings;
  a named bus's count beside its name in scenes; "Try it" without a drawing for written state
  machines (`tryIt: "pins"` in `lesson-schema`).
- `course.css`: the figure's styles; long diagnosis paths wrap.

## Terms, per lesson

| lesson | introduces | where |
| --- | --- | --- |
| counters | counter | the investigation's first live figure |
| register-transfer | register transfer | the explanation |
| state-machines | state machine, state diagram, next-state logic | the investigation |
| state-encoding | one-hot, synchronous | the investigation; the explanation |

No `termExemptions`. Modules 6 and 7 use "counter" and "state machine", as the shared plan says.

## Briefs and drafts

Seventeen briefs (four per lesson and V for the figure's own words), each a list of facts on top
of the shared fact sheet and the lesson's fact sheet, each to its own drafting subagent with
`docs/style.md`. Every draft was read only after its subagent reported done. What came back
wrong, and what was done, by brief:

- **CA** (counters: question to prediction): labelled before it said ("This is how a circuit
  measures time."); two explanations over twenty words. Sent back once.
- **CB**: a figure of speech ("as you snap them together") and a repeat in the construction;
  the fault figure's lead called the faults hidden and **dropped what the three faults are**.
  Sent back once.
- **CC**: accepted; I added "The half adders work out a new NEXT." where the explanation skipped
  from Q to D.
- **CE** (labels): headings that named no contents ("When things go wrong", "Why it
  increments"); the XOR fault did not say which half adder; captions out of the earlier
  lessons' shape. Sent back once.
- **RA**: an em dash; an opening sentence that said nothing; then "held" twice. Two rounds.
- **RB**: **the construction gave the challenge's answer away** (which Q goes to which D). Then
  "holds Save down", "the hold" and "just". Two rounds.
- **RC**: the term after a colon instead of after its plain meaning; a lead that said the
  circuit was "drawn above" when the text sits above the figure; **the lab's task dropped three
  of the tests it names**. Sent back once; I changed "The circuit draws" to "The figure draws".
- **RE**: a heading that named nothing ("What comes next?"); the scene's summary dropped the
  question-mark box; readout labels named wires, not parts; objectives without full stops; then
  "Hold SAVE" and "The next step". Two rounds. Accepted with two weak headings ("Moving on",
  "A new display").
- **SA**: **two facts wrong**: it said the counters lesson built a circuit that steps through
  jobs (it built a counter), and that OK means the message got through (it means the manager
  read it). Then "hold" and "holds", from my own fact sheet. Two rounds; the redraft dropped
  "when the manager has read it" twice, which I put back.
- **SB**: accepted.
- **SC**: "holds its state", from my fact sheet. One round.
- **SE**: a scene label that named nothing ("Something"); the summary without the wires'
  names. One round.
- **NA**: said the learner built the controller (they met it, drew one bit and changed its
  text); listed in the question what the motivation lists; added "size and speed", not in the
  facts; a lead that said "circuit" for a figure with no circuit. Three rounds.
- **NB**: **the second prediction's question was the third's**; a lead gave the prediction's
  answer before the learner chose; another ended with the next question; the lab's task
  dropped two of its tests; then "holds" and "just". Three rounds.
- **NC**: an em dash; **the explanation said the learner put an AND gate in the clock's path**
  (the registers lesson's figure did); then "hold", "holds" and "just". Two rounds.
- **NE**: the failure section's heading named one of its two experiments. One round.
- **V** (the figure's words): "Unknown" for a code no state has, where the course's "unknown"
  is X; "code" for the text, where "code" is a state's bits; then "holds". Two rounds.

The profile CLAUDE.md predicts held: facts dropped (six times), facts wrong (four), meaning
drifted (twice), and every one of my own fact sheet's slips ("holds", five places) copied
faithfully.

## Reviews

Both halves, as CLAUDE.md describes. Reviewers and sceptics ran on a model other than the one
that built the module (`docs/checkpoints.md`), each with a written brief
(`module-5-state-machines/reviews/reviewer-brief.md`, `sceptic-brief.md`), each on its own preview
port. Subagents cannot write files: every report came back as text and was saved, as returned,
before anything read it (`reviews/<lesson>-review.md`, `reviews/<lesson>-sceptic.md`).

| lesson | findings | upheld | in part | rejected | found by the sceptic |
| --- | --- | --- | --- | --- | --- |
| counters | 17 | 2 | 8 | 6 (and 1 noted, no action) | 2, and 1 that did not reproduce |
| register-transfer | 18 | 7 | 8 | 3 | 3 |
| state-machines | 18 | 5 | 6 | 7 | 2 |
| state-encoding | 15 | 4 | 8 | 3 | 2 |

The findings that mattered most were about my own work, as CLAUDE.md warns:

- **A hint I wrote the facts for was wrong.** The state-machines lab's second hint said row 5
  without NOT FAIL "would also be 1 in row 4's case", as if that were a mistake the tests catch.
  Row 4 is 1 there too, so N1 does not change and no test can fail it. The wrong attempt in the
  browser suite that "proved" the hint dropped NOT TICK from row 8 as well, and failed for that
  reason. Confirmed by hand before the sceptic ruled. The hint now names the row 8 mistake; the
  wrong attempts are split in two, and a test pins that the NOT FAIL one passes.
- **The capstone lab did not test what its task demands** (found by the state-machines sceptic):
  no test put OK and TICK at 1 together in WAIT, so a TICK-first arm passed all thirteen. The
  test now does, and a TICK-first wrong attempt fails at it.
- **"One-hot" was defined on a figure it does not fit.** The term arrived on the codes IDLE
  `000`, TRY `001`, WAIT `010`, GIVE_UP `100`: three flip-flops for four states, IDLE with no 1.
  My own fact sheet called them "one flip-flop per state". The term now arrives after the second
  prediction, on the four-flip-flop codes that are one-hot, and the investigation's codes are
  described as what they are.
- **Titles, leads and option labels gave answers away**: "A reset to TRY", "0000, no state", a
  lead asking "what if no state has the all-zero code?", "Staying in TRY", the motivation's "the
  state whose code is all zeros is where you land" before the TRY-at-`00` prediction; and in
  counters and register transfer the right option sat first in most predictions.
- **The state diagram and the add-one block were cut off**: the diagram on a phone, the add-one
  block at both widths.

What was done, code first:

- Code: the late-answer lab's test of OK and TICK together; the two next-one wrong attempts; the
  status line without a row number when no table is shown (`machine.statusNoTable`, drafted); the
  state diagram closes up sideways on a narrow page down to 62% of its width, text and boxes kept
  at size, with two arrow labels placed by hand so nothing collides at either width; the add-one
  staircase five cells per step instead of seven (fits a desktop page); the save-once circuit
  shows OLD and STEP as outputs, by the names the prose uses, and is placed by hand; the
  prediction options reordered; the originality note's claim that every kind of move is predicted
  before the table corrected.
- Words: 19 messages (briefs and send-backs) to the subagents that drafted the keys concerned, each a list of facts per
  finding (`briefs/review-round.md`). Four drafts came back with something to send back: hints
  merged into one key with "just" in it (twice, from two subagents), "You see SAVE light up" (the
  pin shows 1), "This figure demonstrates the issue" and another "just", and "the now register"
  where the rest of the lesson now says "the NOW register". Cuts made by me, no new words: a
  repeated "The figure below shows this.", a repeated sentence about STEP in the register-transfer
  explanation, and the give-away sentence in the encoding lesson's motivation.
- Rejected and left: the counters "TICK described three ways" (one role, three places), the
  state-machines F4 (the story does answer the predictions), F7 and F11 (taught in earlier
  lessons), the encoding lesson's `default` (taught in the state-machines lesson), and matters of
  taste the course's rules do not decide.
- Left, with a reason: the next-state logic opened in full is still dense; the swap and save-once
  drawings have long feedback wires. Each passes every wire and label check.

Then each lesson was read once more, start to finish, from the built page.

## Main moved twice

`main` moved to `c7a4094` (the router keeps wires half a cell apart and checks crossings that a
better order of turns would avoid) and then `1ae4fea` (a copyright line in every source file, and
a check for it). Merged both; ran `scripts/copyright.mjs` over the new files. The new wire rules
failed three of this module's drawings: the counter to five, NOW and PREV, and the swap. NOW and
PREV and the swap were placed by searching placements against `sceneProblems` in a throwaway
test, since every hand guess failed the crossing rule (the swap's feedback wire from regY ran
through selY's name in every stacked arrangement; moving selY two cells right clears it).

The full check then failed in the browser only, on the two figures that open inside the
controller's next-state logic (the fault lab and the explorer): the browser holds a figure's
first drawing to the new rules even when that drawing is inside a block, where the content tests
use the older ones. Trunks 4 and 8 pixels apart, two same-order crossings, and TICK's wire on its
pin's written value. A throwaway scan over the block's layout (the NOT gates' column, the rows
between inputs, the order of the inverted inputs, where the row gates start) against
`sceneProblems` and a copy of the browser's value rule found the cause of the last one: the
state word's split block stood across GO's way up to row 1's gate, so the router had no room for
the column's trunks and fell back to packing them half a cell from the pins, TICK's on its value.
Starting the row gates at row 3, so GO runs straight into row 1, and four rows between inputs
clear every rule (`NEXT_LAYOUT` in `fsm.ts`). The save-once drawing's SAVE wire passed beside
notOld's written value; notOld moved a cell left.

## The mechanical half

Walked at 1280 and 375 pixels and in the dark theme, with every control pressed, every slider at
both ends, and every challenge run with its starting point, the wrong attempts in
`tests/educational/module5-wrong.ts` and the reference, by the browser suites and by scripts kept
in the session (screenshots of every figure, a scan for elements that widen a phone's page).
Found, beyond the checks' findings above: the state diagram cut off on a phone (two reviewers
found it too), the add-one block wider than a desktop page, the save-once drawing's labels not
matching the prose, the status line naming a table row where no table is shown, and the long
diagnosis paths. All fixed as described. After the fixes the walk was repeated: no console
errors (one favicon 404 from the preview server), no page wider than a phone, every diagram
inside its frame or in its own sideways scroller with the scroll note.

## What the checks caught

- The content tests: three wrong test counts in my facts tests, a stuck-at fault drawn outside
  its block, the output block's ports bound before its nets existed, a `case` label of the wrong
  width giving an internal error, and (after `main` moved) three drawings that broke the new wire
  rules.
- The diagram checks in the browser: the counter scene's bus count on the TICK wire's name, the
  register-transfer scene's two the same way, half-cell steps in the NOW wire and at every NOT
  gate inside the next-state logic, the elaborated text drawn in "Try it" (unreadable and failing
  the wire checks), and the squeezed state diagrams' arrow labels.
- The phone-width test: a failed test's diagnosis widening the page to 1,265 pixels.
- Not caught by any check, caught by the reviews: the wrong hint, the untested OK-and-TICK case,
  the misplaced term, the answers given away. A check could catch the first two: a test that the
  mistake each hint names fails a test, and that each sentence of a task's "the tests include"
  list names a test that exists.

## Shared-code candidates (for the managing session to put to the author)

Under the rule of two; none extracted (`packages/primitives` stays empty). Each has its two
consumers, Slice 1 (the `remember` lesson) and Slice 2 (this module), and what would move.

| candidate | Slice 1 consumer | Slice 2 consumer | what would move to `packages/primitives` |
| --- | --- | --- | --- |
| Stepper | `remember`'s stepped figures (`CircuitExplorer` with `showSteps`, `LatchInternals`) | `counters`' add-one figure (`showSteps`) and the state-machine figure's edge-by-edge clocking | the step state, the slider and its "Settled in n steps" line, now inside `CircuitExplorer` and `useSim` |
| Timeline | `remember`'s predictions' timing diagrams | the state-machine figure's trace, with named values in a lane | lanes over a time axis with a cursor; the waveform drawing (levels, edges, hatching) stays in `dd-views/TimingDiagram` |
| StateInspector | `remember`'s latch state (`LatchInternals`) | the state-machine figure's status line: state, code, row, "no state's code" | one selection's readings as a panel, fed by a function the figure supplies |
| DrillDown | the flip-flop opened to latches to gates (`CircuitView` scope and trail) | the controller opened to its next-state logic, to the decoder, and the add-one block to its half adders | the scope, the trail and the block-opening, now in `CircuitView` |
| PredictionChallenge | `remember`'s three predictions | the twelve predictions of this module, with named values | the choose, commit, reveal and "Predict again" shell of `Prediction.tsx`; what is predicted stays a prop |
| FaultInjector | `remember`'s fault lab | the counter's and the controller's fault labs, with faults inside blocks | the fault list, "Run checks", the outcome line and the restore of `FaultLab.tsx`; `faults.ts` stays in `dd-model` |
| InputPanel (new) | (none in Slice 1) | the state-machine figure's input buttons and "Try it" without a drawing (`tryIt: "pins"`) | the row of "{name} = {value}" buttons with `aria-pressed`; one consumer short of the rule of two in Slice 1, two inside this module |

## What I would change

- **Scan my own fact sheets for the banned words before any brief goes out.** Five of eleven
  "hold"s, and the "one flip-flop per state" that misplaced a term, were mine; the drafts copied
  them faithfully.
- **Test the mistake each hint names.** The wrong hint passed every check because nothing tied a
  hint's claim to the tests. Hints that name a mistake could carry it as a wrong attempt, and the
  content tests could require it to fail.
- **Place drawings against the wire checks from the start.** The placement search used to fix
  the swap and NOW and PREV belongs in the repository as a helper, not a throwaway test.
- **Ask for changed keys only, from the first send-back.** Whole-key returns let unchanged
  text drift between rounds.
- **Give the state diagram a phone layout of its own** rather than squeezing the desktop one; it
  fits today because the labels were moved by hand for both widths.
- **The next-state logic opened in full is still dense.** A figure that shows one row's gate at a
  time, lit from the table, would teach the row-to-gate correspondence better than the whole
  block.
