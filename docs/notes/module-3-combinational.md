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
- 15:59 Whole-lesson read by the managing model (below), then a reviewer per lesson.

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
- alu: ALU. ("slice", "select input", "ripple adder" are explained where used, not rationed.)
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
