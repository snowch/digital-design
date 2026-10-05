# Module 3: combinational design

A working note, written as the module was built, on the branch `module-3-combinational`. Module 2
was built at the same time on its own branch; neither build could see the other. Times are read
from the clock (`date -u`), not estimated. Who did what: "the managing model" is the session
that planned, wrote the code and the briefs, and checked every draft; "the drafting subagent" is
the subagent that wrote every learner-facing sentence from a brief of checked facts.

## Times

- Started: 2026-10-05 15:03 UTC (first command in the session).
- Finished: (filled in at the end)

## Log

- 15:03 to 15:12 Read CLAUDE.md, the shared plan (`docs/notes/modules-2-and-3-plan.md`),
  docs/authoring.md, docs/style.md, docs/simulator.md, docs/inventory.md (sections 3 and 8),
  docs/checkpoints.md' headings, the three lessons with their words, the Module 1, Module 5 and
  fix-pass notes; installed, built the course and looked at the registers lesson as a learner.
  Found while reading, before writing anything:
  - **The drawing editor was one bit wide.** A drawn challenge's pins were made one bit wide
    whatever the interface said, every block a drawing could place was a case in a `switch`
    (latches and flip-flops only), and a block's outputs were assumed to be Q, Qb or LIGHT.
  - **A word input could not be set in an explorer.** `toggle()` flips a one-bit input; the
    registers lesson worked round it with one-bit pins D0 to D3.
  - **Text comes after Module 3.** The remember lesson (Module 4) introduces `assign` and
    `logic` from scratch, so Module 3 has no written challenges and teaches no text. Every drawn
    challenge still shows the editor's "As text" and "Import from text" panels, as Module 4's
    and Module 5's do; that is the platform's, and noted below for the join with Module 2.
  - **The term gate's pattern is a word stem.** Rationing "carry" catches Module 1's "carry it
    across"; the plan foresaw it, and the exemption went on Module 1 in the same commit as the
    lesson that rations it.
- 15:12 to 15:20 The module's shape, decided before any code (see "Why four lessons" below),
  then the platform work, code first.
- 15:12 to 15:30 Platform, code first (detail in "Added to the platform" below): the blocks in
  `dd-model/src/combinational.ts` with exhaustive tests (21, all passing first time), Module 3's
  library circuits, word-wide pins and blocks in drawings, word inputs in explorers, and grading a
  slice chained to the widths a test chooses. Then the four lessons' structures with placeholder
  words, which parsed, rendered, and whose references passed and starting points failed at once.
- 15:20 to 15:33 Looked at every figure with placeholder words. Found and fixed before any brief:
  - **A split block listed its bits 0, 1, 2, 3 from the top**, although it was built 3, 2, 1, 0:
    an object keeps number-like keys in rising order, and a drawing lists a block's ports in key
    order. Ports renamed b3 to b0.
  - **Auto-layout tangled every drawing with blocks** (labels on names, blocks on blocks); every
    figure is hand-placed now (`place(...)` in the library), and the add/sub unit is drawn as a
    staircase so each slice's inputs pass no other slice.
  - **New blocks were dropped on each other** in the editor: `freeSpot` stepped three rows and a
    selector-4 is nearly six tall. It now looks for a spot clear of every box and its labels.
  - **"CIN" and "COUT" ran into each other** inside a 60-pixel box; a box now widens, in whole
    cells, when its longest input and output names need it. Every pre-Module-3 block keeps 60.
  - **16-bit words read `0xff06`** where Module 1 writes `FF06`, and the prefix pushed a label
    out of its drawing; wide words are now written as Module 1 writes them.
  - **A word's value label sat across its wide wire**; an input word's value now sits above its
    pin. **A wire crossed a block's label**; block labels and names now have the canvas halo the
    values already had.
  - **Blocks at row 0 lost their label off the top** of the drawing; no figure places one there.
  - **The 4-bit ALU's investigation words gave XOR = ADD** (`0100`, `0011`): pressing OP could not
    tell two jobs apart. Changed to 2 and 3, which give four different words (pinned).
- 15:30 to 15:36 Facts tests for all four lessons, written before the briefs from what the
  figures compute (`module3-facts.ts` runs a figure's own props through the code the figure
  runs). The first full browser run (15:36 to 15:40) passed 131 of 135: every existing
  screenshot and diagram check held; the 4 failures were 16-bit tables five pixels too wide on a
  phone, fixed with tighter padding for a table with reading columns.
- 15:37 to 16:00 The words: one shared fact sheet, then labels first (round 1), then prose (round
  2), so prose could quote the page's labels exactly. See "Briefs and drafts".
- 15:52 The Module 3 browser spec (`tests/educational/module3.spec.ts`): 19 of 20 passed at
  desktop on its first run. The failure was real: a wrong ALU slice was reported at the chain's
  join ("The join joinY drives that signal"), which tells a learner nothing. Each chained copy now
  sends its output bit through a plain wire part inside the copy, and the grader names every
  expected bit at its copy, so the failure names the lowest copy that went wrong ("The slice
  bit0 drives that signal", with what that copy saw). 40 of 40 at both widths after.
- 15:59 Whole-lesson read by the managing model, which sent one more label round (below).
- 16:00 to 16:09 A reviewer per lesson, then a sceptic per review (see "Reviews").
- 16:09 to 16:16 Fixes to code first: the figures the reviews named, and the data behind the
  findings (the X options, the cut-wire fault, the lamp's name, new starting words).
- 16:16 to 16:24 Fact briefs per upheld finding to the drafting subagent, one per lesson; the
  managing model's own cuts; a second read of each lesson, start to finish, on the built page.
- 16:25 Merged `main` (the preface page) and ran the check.

## Why four lessons

The curriculum row is nine topics and four labs. Split by the question each answers, in an order
where each lesson's component is the reason for the next:

1. **selectors** (multiplexer, bus, a block made of blocks): "how does one display show one of
   several rooms?" Labs: the 2-way selector from gates; the 4-way from three 2-way blocks.
2. **decoders** (decoder, demultiplexer, encoder, comparator): "which room is on show?" Each
   decoder output is "does S equal my number?", which leads to the demultiplexer (AND each line
   with a signal) and to comparing two words. Lab: the equality comparator. The decoder is also a
   drawn challenge, because it is the component the other three are explained from.
3. **adders** (carry, half adder, full adder, overflow): answers Module 1's question. Labs: the
   full adder from half adders; the 4-bit adder from full adders; the signed-overflow lamp.
4. **alu** (ALU): subtraction from the adder, four jobs through a selector, and the capstone.
   Labs: one bit of add-or-subtract; the ALU slice, graded at 1, 4, 8 and 16 bits.

Each is about the size of the registers lesson (two or three challenges, one or two predictions,
three to five figures).

## Terms each lesson introduces

- selectors: multiplexer, bus.
- decoders: decoder, demultiplexer, encoder, comparator.
- adders: carry, half adder, full adder, overflow. **Exemption added to Module 1** (`signals`):
  "carry", used there as the everyday verb ("carry it across"); the term gate's stem pattern
  matched it. That is the only edit to Module 1.
- alu: ALU. ("slice" and "select input" are explained where used, not rationed. The first
  drafts named "ripple adder" without bolding it; the review caught it, and the lesson now
  describes the arrangement without a name.)
- No Module 4 or 5 term is used; no Module 2 term is rationed here.

## Where Module 3 leans on Module 2

The managing session should check each against Module 2 when both land:

- The gates NOT, AND, OR, XOR, NOR and XNOR, and that a gate's output depends only on its inputs
  now (every lesson; the fact sheet tells the drafts the learner knows them).
- "An AND gate gives 1 only when every input is 1" and "an XOR gate gives 1 when its two inputs
  differ" are restated briefly, as reminders, in selectors, decoders and adders.
- The drawing editor and "Run tests" with a diagnosis are assumed known. The first drafts said
  in each construction section how to add parts and wire them; the reviews found that a repeat of
  the editor's own help, and it was cut. If Module 2 does not teach the editor, the editor's help
  text is all a learner gets.
- **Depth**, in Module 2's sense, is named twice: the decoders model note (a tree of gates) and
  the adders model note (faster adders have less depth). If Module 2 does not name depth, those
  two sentences need a reword.
- "Module 2" is named in three places (decoders motivation, adders and decoders model notes).
- **X** (the simulator's unknown value) is not used. The first drafts offered "the simulator
  cannot know (X)" as a prediction answer and a cut wire as a fault; the reviews found no lesson
  before them explains X, so the options went and the fault became a gate turned into a plain
  wire. If Module 2 teaches X, a cut-wire fault would be a fair addition to the decoders lab.
- Not leaned on: NAND universality, simplification, truth tables (no truth table is shown; the
  tests are the rows).
- Every drawn challenge shows the editor's "As text" and "Import from text" panels, as the
  existing lessons' do. Text is introduced in Module 4, so a Module 2 or 3 learner meets a panel
  of text they have not been taught; the fact sheet tells the drafts not to mention it. Whether
  those panels should be hidden before Module 4 is the managing session's call.

## Reused

- The simulator, the fault lab, the explorer, the prediction figure, the drawing editor with its
  diagnosis, the hint ladder, saved work and its re-grading on load: all as they were.
- The `mux2` primitive is untouched and unused here: every selector the learner meets is gates or
  a block built from gates, so no part does the learner's work.
- Module 1's rooms, words and readings (-184, -250, `FF48`, `FF06`) carry the story; Module 1's
  reflection question is answered in the adders lesson.

## Added to the platform, and why

- **Blocks** (`dd-model/src/combinational.ts`): 2-way and 4-way selector, decoder,
  demultiplexer, encoder, equality comparator, half adder, full adder, adder of any width, ALU
  slice, split and join. Each is a composite of gates, so every one opens to its gates; each has an
  exhaustive test. The editor can place the ones a challenge needs (`BLOCKS`).
- **Words in drawings** (`drawing.ts`, `Builder.tsx`, `CircuitView.tsx`): pins and block ports
  carry their width; a wire between two widths is refused with a message, and a stored one is
  listed as not connected; a word's wire draws wide; split and join cross between a word and its
  bits. The editor was one bit wide, and buses are the module's subject.
- **Word inputs in explorers** (`WordInputs.tsx`): a row of bit boxes per word input, each bit
  pressable, with its worth shown. `toggle()` could only flip a one-bit input.
- **Readings in the signal table**: an explorer can show unsigned and signed columns, so the
  adders lesson can read one sum both ways.
- **Chained slices** (`chain.ts`, `gradeChain`): a challenge can grade a one-bit slice by copying
  it to the widths each test chooses; a failure names the lowest copy that went wrong and what it
  saw. The capstone is a slice graded at 1, 4, 8 and 16 bits.
- **Drawing fixes found by Module 3's figures**: boxes widen for long port names; wide words in
  hexadecimal; label halos; new parts placed clear of others; pins inside an opened block no
  longer toggle the top level's input (found by the mechanical walk: pressing CIN inside an
  opened block said "B is 4 bits wide"); a constant part shows its value.
- **After the reviews**: every gate symbol draws a short lead from its shape to its output pin
  (the wire to Y seemed to start in mid-air); a part no longer repeats at its port the value its
  output pin shows (four stacked labels on the decoder). Both change every drawing a little; the
  stored screenshots of the earlier lessons' figures still matched within their 2% tolerance, so
  no baseline was updated (see "The check").
- Every new string is in `dd-views/src/strings.ts` or `parts.ts`, drafted like the lessons'.

## Briefs and drafts

One shared fact sheet (`00-facts.md`: what the learner knows, the rooms, the numbers, the words
not to use) went with every brief, with `docs/style.md`. Labels went first so prose could quote
them. What came back, and what was done:

- **Labels, L1 to L4, and the view strings V** (15:39). L1 dropped Y's value from every
  prediction option ("Y is 0, room A's bit" came back as "room A's bit") and gave two wrong section
  titles ("Open the selector block" for a block that cannot be opened). L2 used a wrong key, gave a
  heading that repeated a figure's label, called one challenge "Two circuits", and dropped S's
  value from options. L3 and, later, 4C described the keys instead of giving them, and were asked
  again. L4 dropped which slice a fault was in, dropped "4-way" and "the carry into bit 0" from two
  objectives, put backticks in a caption and brought in "operations" for the page's "jobs". V
  started sentences in lower case and invented "addsub-bit". All sent back with notes; the second
  drafts were right.
- **Prose, 1A to 4C** (15:44 to 15:53). 1B called the fault lab's checks "tests" and wrote
  counts as words; it also dropped two construction facts. 2A wrote "you see each gate's output
  step by step" (wrong: the diagram shows inputs and output) and garbled lesson 1's question. 2B
  dropped the commas from check names and wrote counts as words. 3B used em dashes and started a
  sentence with "Ha2". 4A got two facts wrong: adding was "to check room B's cooling", and Module 1
  had "shown" how to negate a word. 1C used "carry", a term lesson 3 introduces, because the
  managing model's brief did; it was redrafted with "bring".
- **One fact the managing model got wrong in a brief**: the adders brief stated "-8" in the lead
  to the prediction that asks what `1000` reads signed. The draft copied it, as drafts do, and the
  managing model's read caught it; the sentence was cut.
- **After the first whole-lesson read** (15:59): the page called one block "2-way selector" and
  "two-input selector"; seven label keys went back for one name.
- **Fix briefs FX1 to FX4** (16:18 to 16:24), one per lesson, each key with its current text
  and the facts it must now say. FX1 came back with "An OR gate and an AND gate ... each ask what
  they give" (the gates asking) and "A 2-way selector ... chooses a whole word" (one selector);
  both went back. FX1 also used "holds", a term Module 4 introduces; the word came from the
  managing model's own brief, and the term gate caught it. FX2 missed one paragraph's "line"
  because the brief did not list it. FX3 came back right. FX4 kept an old opening sentence that no
  longer matched its list; it went back.
- **The managing model's own edits**, all cuts or a few added words, never a rewritten sentence:
  the editor's help text repeated in two construction sections; the motivation sentence that gave
  the decoder's design away; four repeated sentences found on the second read; "we" to "the
  display"; "ripple adder" to "an adder like this"; "pass" to "succeed" for a check in the ALU
  lesson; "of the circuit" after "an input"; "The drawing labels such a block" for the
  demultiplexer and comparator; "Press a wire to see its name and value" in the ALU's fault lab.

The profile CLAUDE.md predicts held: drafts dropped facts and copied the brief's mistakes
faithfully. Three of the wrong facts on the page came from the managing model's briefs, not the
drafts.

## Reviews

The mechanical half walked each lesson at 1280 and 375 pixels, light and dark, pressing every
control and running each challenge's starting point, a wrong attempt and the reference; it found
the opened-block pin bug and the phone table overflow above. The reading half gave each lesson to
its own reviewer (brief `R-review.md`), and each review to its own sceptic (`S-sceptic.md`). The
reports are summarised here; the sceptic's verdict decided what was done.

| Lesson | Findings | Upheld | In part | Rejected |
| --- | --- | --- | --- | --- |
| selectors | 23 | 14 | 5 | 4 |
| decoders | 25 | 12 | 7 | 6 |
| adders | 24 | 12 | 8 | 4 |
| alu | 21 | 10 | 6 | 5 |

The findings that mattered most, all upheld:

- **selectors**: the model note said the stepped model hides the dip a 2-way selector makes when
  S falls; the model shows it (Y goes 1, 1, 0, 1), and the cause is the extra gate on A's side,
  not varying gate times. The managing model wrote that fact into the brief.
- **decoders**: a fault said the cut wire "reads X", which no earlier lesson explains, and the
  closing line ("one gate accepts an extra pattern") did not match two of the faults.
- **adders**: the question attributed a thermometer to lesson 2 and ignored that Module 1 had shown
  room B at -25.0; the signed-overflow rule was stated from one example; the adder figure's
  starting sum showed the prediction's answer a scroll below it.
- **alu**: "only overflow differs" was false for subtraction (lesson 3's rules break: 3 - 6 has
  COUT 0 though negative); "four results per bit" contradicted the one adder; the jobs did not fit
  the rooms' words ("FE4E reads -434" meant nothing).

Rejected, with the sceptic's reason: hiding the fault outcomes until a fault is run (every fault
lab in the course shows them from the start; that is a platform decision, not a lesson's);
"Check my prediction" sharing a verb with the fault lab's checks (the platform's button, on every
lesson); the encoder's inside described in the prediction lead (describing the closed block is the
exercise); a heading with a colon; the sentence on what makes a negative word ("NOT B plus 1")
being a sum rather than a prediction.

Actions, fixes to code first: the figures (word selector staggered, full adder's internals
re-placed, gate leads, port value labels); X removed from every prediction; the decoder's third
fault is now "notS1 becomes a wire"; the lamp is Y2 throughout; the adder figure starts at
`0011` + `0010`; the add/sub figure at 2 - 3; the 16-bit ALU's AND job uses B = `8000`. Then the
fix briefs above, then a second read, then the mechanical half again.

Platform items raised by the reviews and left for the managing session: the fault labs' outcomes
visible before running (course-wide); "As text" and "Import from text" panels before Module 4;
"lesson 1" meaning this module's first lesson, not the course's (course-wide naming).

## The check

`./scripts/check.sh`, run to a log and its exit status read:

- 15:36, the first browser run: 4 failures, 16-bit tables five pixels too wide on a phone (fixed;
  see the log).
- 16:25, after the review fixes and the merge of `main`: Prettier, `tsc`, Vitest (297 tests) and
  the build passed; Playwright failed 2 of 179, one test at both widths. The Module 3 spec still
  expected the adder figure to start at `0111` + `0001`, which the reviews had moved so the
  figure no longer shows the prediction's answer. The spec now checks the new start and presses
  bits to the lead's first sum, `1111` + `0001`.
- What the check caught that a reader would not: the term gate caught "holds" (a Module 4 term,
  from the managing model's brief) and, earlier, "carry" in lesson 1; the facts tests held every
  number the fix briefs stated before any draft was placed; the chain grader's first failure
  message named the join instead of the slice.
- What it did not catch, and the reviews did: a model note that said the opposite of what the
  model shows; "only overflow differs" for subtraction; a starting value that gave a
  prediction's answer away. Each is a claim about the model in words, which no test reads.

## What I would change

- **Run the model before writing a model note's brief.** The selectors note's claim about the
  dip came from the managing model's expectation of hardware, not from a run of the stepped model.
  A note's facts deserve the same pinned test as a lesson's numbers.
- **Check a starting value against every prediction on the page**, not only its own figure. Two
  figures (adders, ALU) began on the sum a prediction above asked for.
- **Ration the editor's help.** The first drafts repeated it in each construction section; the
  editor already says it under every canvas.
- **Name lessons course-wide.** "Lesson 1" in Module 3 means this module's first lesson; a learner
  arriving from Module 2 has met other first lessons. A title would do.
- **A pinned test for each fault outcome's lamps**, not only which checks fail. The decoders
  bullets say which lamps light; the facts test checks only the failing checks. The managing
  model checked the lamps by a run (16:16) that is not kept.
