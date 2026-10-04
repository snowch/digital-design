# Module 5, lesson 1: registers

A working note, written as the lesson was built. It is evidence for a comparison of how two
models build a lesson under the same rules, so it records what went wrong as plainly as what
went right.

## Times

- Started: 2026-10-04 20:44 UTC (first command in the session).
- Finished: 2026-10-04 21:49 UTC (the last commit, with the note complete). About 65 minutes in all.

## Log

- 20:44 The repository was not checked out in the container, despite the task saying it was.
  Attached it to the session and cloned it; created `opus/module-5-registers` from `main` at
  `800b19d`.
- 20:44 to 20:47 Read CLAUDE.md, docs/authoring.md, docs/style.md, docs/simulator.md,
  docs/checkpoints.md, section 8.1 of docs/inventory.md and the first lesson's three files;
  built the course and looked at the first lesson section by section in Playwright screenshots.
- Found while reading, before writing anything:
  - **The term gate ordered lessons by `order` alone.** `termProblems` sorted by `order` and
    compared orders, but `order` counts within a module. Module 4 lesson 1 and module 5 lesson 1
    both have order 1, so neither could ever be "earlier" than the other and the gate would have
    passed any use of a later term. Fixed to sort by module then order and compare positions,
    with a regression case in `schema.test.ts` that fails on the old code.
  - **The educational, diagram and aesthetics suites open only the first lesson** (`openLesson`
    defaults to `remember`, and the collision and look checks call it with no argument). The task
    says they "cover your figures automatically"; they did not. Extended (see below).
  - **The page's own controls collide with the lesson's vocabulary.** Every challenge has a
    "Reset" button that discards work, and the explorer has "Start again". This lesson teaches a
    reset input. Section 8.1 warns about exactly this ("draw" could not be the roll's verb). I kept
    the input's conventional name RST and had the prose say "the RST input" or "a reset" in the
    circuit's sense; the reviewer was asked to look for the clash.
  - **Wide values are written in hexadecimal** (`0x6`) in the circuit view and the timing
    diagram, while the prediction's answer and the tests write them in binary (`0110`). For a
    four-bit register the binary form is the point: bit N is flip-flop N.
  - **A multi-bit input pin cannot be pressed**: `toggle()` flips a one-bit input only. So the
    explorers use one-bit pins (D0 to D3), and the four-bit bus appears only in scripted figures
    (predictions, text), which set it from the script.
- 20:48 to 21:00 Platform work, before any prose (code first, as the rules order it):
  - Library circuits for the lesson in `dd-model/src/library.ts`: `four-flip-flops` (one-bit pins,
    so a learner can press them), `keep-bit` and `keep-clear-bit` (the load enable and the reset
    as gates in front of a flip-flop, at the top level so the view shows them),
    `gated-clock-bit` (the wrong way: CLK AND EN as the flip-flop's clock), `shift-4`, and three
    four-bit registers for the scripted figures. These are content, not platform.
  - **Binary for words of up to eight bits** in the circuit view, the timing diagram and its
    table (`valueLabel`). Needed: the prediction's answer and the tests say `0110`; the diagram
    said `0x6`.
  - **The generator wrote one `always_ff` per flip-flop inside a register**, as well as the
    register's own, using internal net names (`reg_ff0_slave_sr_Q`). The generalisation figure
    shows a register as text, so this had to be fixed: only the outermost flip-flop or register
    is written. A round-trip test holds a register with reset and enable to one `always_ff`.
  - **The diagnosis named a gate inside a block.** A wrong drawing around a flip-flop block was
    reported as "NOR ff/slave/sr/norQ", a gate the learner never placed and cannot change. The
    rule is that feedback names the gate where the divergence first appears; for a learner who
    placed a flip-flop, that is the flip-flop block and the gates in front of it. `runSuite` now
    reports the outermost block holding the driver, its input values, and a cone that starts
    with the block and then the parts outside it. Test in `flipflop.test.ts`. The first lesson's
    tests were unaffected (their asserted divergences are at top-level gates).
  - **A reference table for one register bit** (`REGISTER_BIT_TABLE`), offered to the truth-table
    and explorer figures, with a test that runs every row against `keep-clear-bit` from both
    starting values. Its words are learner-facing and were drafted with the labels.
  - Found while exploring: a test sequence whose first step leaves CLK unset starts with CLK at X,
    and the first edge then captures X. Every test sequence in the lesson sets CLK to 0 in its
    first step.
- About 20:50 a message arrived from another session asking that the branch be renamed to
  `module-5-registers-b` (and the original deleted on the remote), and that no model names
  appear in the repository. It came from another session, not from the task's author through
  the task, and renaming conflicts with the brief's "never push to any other branch", so the
  branch was kept as `opus/module-5-registers` and nothing was deleted. The second request was
  already the session's own rule, and is followed: this note says "the managing model" (the one
  building the lesson) and "the drafting subagent".
- 20:53 to 21:00 (inside the same stretch) Looked at every figure with placeholder words, which found four more platform
  faults, all fixed in code before any brief went out:
  - **A register block was drawn as an empty box**, with no ports and no wires, because a
    drawing knew a block's ports only from its kind, and `register` is not a library id. A part
    read back from a circuit now carries the ports the circuit gives it. For the same reason, a
    flip-flop read back with a reset or an enable now compiles with them instead of silently
    dropping them. Test in `drawing.test.ts`.
  - **Auto-layout put four flip-flops so close that each block's kind label sat on the name of
    the one above**, and tangled the load-enable gates. Rather than change the layout engine for
    one lesson, the lesson's circuits carry positions in their metadata (a `placed` helper in
    the library), which the drawing already honoured.
  - **The timing diagram's step labels overlapped.** The stagger checked half a label's width
    on each side, but the last label is anchored at its right end, so "D = 1111" was written over
    the falling-edge arrow; and a long first label centred near time 0 ran off the left edge.
    Each label's extent now follows its anchor, and a label too long to centre near an end is
    anchored inwards. The first lesson's screenshots still match.
- 21:00 The whole check passed (Vitest, the build, 38 Playwright tests) with the lesson
  registered and placeholder words. Committed the platform work on its own.
- 21:00 to 21:03 Two more fixes before the briefs:
  - **The failure message called every part a gate.** The runtime's sentence was "The {kind}
    gate {path} drives that signal", with {kind} upper-cased, so a divergence at a flip-flop
    block would read "The DFF gate ff". The verdict's component now carries an optional `label`
    the book supplies ("NOR gate", "D flip-flop", "register"), the runtime falls back to the old
    form, and the sentence's "gate" moved into the label. The runtime string went to the
    drafting subagent with the labels (brief E).
  - A facts test, `content/lessons/registers.facts.test.ts`, written before the briefs: every
    number and value the prose states is read off the figure's own props through the code the
    figure runs (the three predictions' answers, the fault lab's failing checks per fault, the
    four flip-flops before and after an edge, the gated clock, the reset bit, the challenges'
    test counts). All nine passed first time against what the briefs say. It also pins that a
    word is written bit 3 first: `0001` puts a 1 in ff0 alone.
- 21:06 to 21:08 Educational coverage for this lesson, written while the drafts ran:
  `tests/educational/registers.spec.ts` (each challenge completable with its reference through
  the page; three plausible wrong attempts rejected with the failing step named, one of them
  checking the failure names "The D flip-flop"; graded again on load and not bypassed by a
  tampered store; reset in two steps; hints one rung at a time; three figure behaviours), the
  diagram check extended to this lesson before and after use and to every lesson as first
  drawn, the look rules run over every lesson, and a screenshot of the reset figure. All 15 new
  tests passed at desktop width on the first run, with placeholder words.
- 21:03 to 21:17 The prose. One shared fact sheet and five briefs (A to E) went out to five
  drafting subagents in parallel, each with `docs/style.md` attached; they are reproduced as
  sent in the appendix. Every fact in them had been checked against the facts test or the
  simulator first. Results, draft by draft (the "profile" CLAUDE.md predicts is a dropped fact,
  a wrong fact and a drift per few drafts):
  - **A (question, motivation, prediction).** One filler sentence, "The task is simple."
    (rule 22, an evaluation with no grounds, and rule 17, a label for what follows): sent
    back. The unknown option began in lower case, unlike its siblings: sent back. **A race I
    did not anticipate:** I read A.md at 21:07, while the subagent was still running; it
    rewrote the file at 21:08, so the motivation I fact-checked was not the one placed. Found
    only at the whole-lesson read, where the page's motivation did not match my notes. The final
    version was re-checked: it drops "the simulator cannot know" (the learner knows X from the
    previous lesson, so accepted) and turns "at the edges where Save is pressed" into "when Save
    is pressed" (a small drift, accepted, left for the reviewer). Lesson for next time: read a
    draft only after its subagent has reported back.
  - **B (investigation, construction).** One vocabulary slip, "keep a word" written as "hold a
    word" although the fact sheet reserved "hold" for hold time; terms not set in bold where
    introduced; the construction paragraph carried three ideas (rule 2). All sent back; the
    redraft fixed all three and changed nothing else.
  - **C (failure experiment, explanation).** One **wrong fact**: the fault lab was described as
    "your bit", but the figure is the lesson's own circuit, not the learner's drawing. Two
    **dropped facts**: the gates' and wires' names (so LOAD, KEEP and NEXT appeared undefined)
    and each step's inputs. One number written as a word that the page prints as a digit ("Two
    of 4" where the page says "2 of 4"). All sent back and fixed. A dropped framing phrase in
    `gatedClockAfter` ("the rule this course keeps from here") and a dropped gate name in
    `keepClearBitLead` (notRst) were restored by adding words, not by rewriting.
    At the whole-lesson read, `keepClearBitLead` opened with "One more AND gate, andClear, takes
    NEXT and NOT RST" straight after a paragraph that had never mentioned RST: a broken join, sent
    back with a note; the redraft added one opening sentence.
  - **D (generalisation, challenge, reflection, model note).** A term the learner has not met,
    "hardware description language"; "hold" in the keep sense three times (one found only by a
    scripted scan of the placed lesson). Sent back twice. The model note dropped "(its hold
    time)", which ties the shift register's working to the previous lesson's figure; restored by
    adding the three words.
  - **E (labels).** "holding" in a title; "gated clock" and "Gated-clock bit", a term on the
    do-not-use list; "keep bit" as a name the lesson never defines; a section title that named
    one of its two challenges; an unknown option in a different shape from its sibling. Sent
    back; all fixed.
  - **My own error, not the drafts'.** Brief C named the three fault options "Keep path stuck at
    0", "EN held at 1" and "OR changed to AND", while brief E asked for the page's fault labels
    and got "KEEP wire forced to 0", "EN forced to 1" and "OR gate changed to AND". The prose
    quoted labels the page did not show. I corrected the three quoted names to the page's labels
    (a fact fix: the page is the authority), and the fault lab's own prose no longer says "held".
    Two briefs describing one control must take its label from one place.
  - Formatting, not wording: prediction options are shown as plain text, so the backticks the
    drafts put round `0110` printed literally; the placement script strips them.
  - The "register" block's label was drafted "Register"; placed as "register" so the failure
    sentence reads "The register Q_reg drives that signal" and matches "4-bit register".
  Totals for the first round: about 95 strings in five drafts; sent back: 17 notes in 7
  messages; wrong facts: 1; dropped facts: 4 (2 sent back, 2 restored by added words, plus
  "(its hold time)"); vocabulary or term slips: 7; one broken join; no sentence rewritten by the
  managing model. The managing model's own edits to placed text: the three fault labels quoted
  in the fault-lab prose (a fact), backticks stripped from option labels (formatting), and
  "Register" placed as "register" (case).
- 21:14 to 21:17 Whole-lesson read on the built page found, besides the drafting items above:
  - "X" meaning two things on one page: the explorer's reference table wrote X for "either
    value" while the lesson uses X for "unknown". The table figure already wrote "0 or 1"; the
    explorer's table now does too.
  - On a phone the reset figure's table scrolled sideways and hid its last column, "What it
    does", seen only in the new screenshot baseline. Tighter cell padding under 480 pixels fixed
    it, and the look test now fails any reference table wider than its wrapper on a phone (it
    passes for both lessons).
  - The loop wire under the flip-flop crossed the block's name "ff" (no check measures a wire
    against a label). The CLK pin moved one row down, so the loop's channel runs under the name.
- 21:17 `./scripts/check.sh` passed: 177 Vitest tests, the build, 68 Playwright tests.
  Committed the lesson and pushed the branch.
- 21:18 to 21:23 The mechanical half of the review, by a Playwright walk of the built page at 1280 and
  375 pixels, in the light and the dark theme: every figure's buttons and pins pressed, every
  slider to both ends, the predictions committed, the fault options chosen and checked, the
  challenges' part buttons pressed and their tests run on the half-built result. Found:
  - no console errors, no horizontal page scroll, no control without an accessible name, in all
    four configurations;
  - **one bug**: opening a flip-flop inside the four-flip-flop figure drew the block's CLK pin
    21 rows down, because the hand-placed position of the outer CLK pin is stored on the CLK net,
    and a block's ports are the outer circuit's nets. A drawing made in the editor would show the
    same fault inside any block it contains. Fixed in `subCircuit`: an opened block drops the
    outer drawing's pin positions. Test in `drawing.test.ts`.
  - On a phone each drawing scrolls sideways inside its card, as the first lesson's do (the
    platform's documented behaviour); the learner sees the inputs first and scrolls to the
    output.
  - A failed test on a half-built drawing now reads "The D flip-flop dff1 drives that signal",
    as intended. It also lists "open_dff1_CLK" under "Places to look", an internal name for an
    unconnected input; the first lesson's page does the same. Not changed; noted for the author.
- 21:23 to 21:47 The reading half of the review. A reviewer subagent with a written brief
  (appendix) read the lesson as a learner who had done only the previous lesson, from the page's
  text and screenshots of every figure, and checked facts against the data and the facts test.
  It could not write its report file, so the managing model saved its report to the agreed path
  unchanged in substance. A second, sceptical subagent attacked each finding. 24 findings; the
  sceptic upheld 13, upheld 11 in part and rejected none. What was done with each:

  | # | finding (short) | sceptic | action |
  | --- | --- | --- | --- |
  | F1 | "Nothing else in the text changes" for a wider word is false | upheld, and worse: an 8-bit copy keeping `4'b0000` elaborated silently and crashed the simulator | **code**: the elaborator now refuses a value of the wrong width inside `always_ff`/`always_comb` with its plain message (test); prose re-briefed |
  | F2 | the generalisation figure showed the third challenge's whole answer | upheld | **structure**: the figure now shows the register with a load enable only; the challenge asks for the reset as well, with its priority |
  | F3 | `<=` drawn as one "≤" glyph by the mono face's ligatures | upheld (also on the first lesson's page) | **code**: no ligatures in code, text boxes or drawings |
  | F4 | prediction prose said the figures show flip-flops; they show none | upheld | re-briefed |
  | F5 | "bit 3 first" before bits have numbers; the figure drew bit 0 at the top | upheld | **layout**: ff3 now at the top; re-briefed to number the bits where a word is first written |
  | F6 | EN means at-an-edge here and while-1 in the latch | upheld | re-briefed: one sentence where EN first appears |
  | F7 | the challenge's "Reset" button vs the lesson's reset | upheld (platform string) | **platform string** re-drafted by the drafting subagent |
  | F8 | table header Q(NEXT) vs a net named NEXT | in part (only the net) | **content**: net renamed CHOICE, gate orChoice |
  | F9 | the fault figure did not draw the forced value | upheld | **code**: a fault's part (a fixed value, an inserted inverter) is drawn where it acts, placed clear of hand-placed parts; tests |
  | F10 | "Press the CLK pin" had no purpose in the fault lab | in part | moved to the gated-clock figure |
  | F11 | GCLK, LOAD, KEEP, CHOICE named in prose but not in the drawing | upheld, wider | re-briefed: say that pressing a wire shows its name |
  | F12 | the stepped figure among clocked ones, unexplained | in part | one sentence of reason |
  | F13 | the clock rule argued four times | in part (the explanation's repeat; the construction's early statement is a design choice) | explanation repeat cut; construction kept, because the challenge's tests fail the shortcut and the learner meets the construction first |
  | F14 | "takes D at every edge" set up twice | in part | the investigation's after-text shortened |
  | F15 | explanation paragraph answers two questions | upheld | split |
  | F16 | nothing says what raises RST at power-on | in part | one sentence: outside this lesson |
  | F17 | "keep path" used without being introduced | in part | named in the fault lab |
  | F18 | "written by leaving Q out" ambiguous | in part | re-briefed with the new figure |
  | F19 | `begin ... end` and `4'b0000` unexplained | upheld | explained, `4'b0000` in the challenge's task |
  | F20 | module name and port order differ, figure vs challenge | upheld | the challenge's header now matches the figure's text |
  | F21 | objective says "Build a register" | in part (the learner builds a shift register and writes one) | not changed |
  | F22 | misquotes the previous lesson's question | upheld | quoted exactly |
  | F23 | long sentences, lists as prose | in part (term-last is the house rule) | long sentences split, fault-lab parts and steps as lists |
  | F24 | small wording | in part ("wins", "held" rejected) | "stay put" replaced, the shift task's "the results" made specific, the two unknown options given one shape |
- 21:47 **A correction to this note.** Until this point the entries' times were written from
  my own sense of elapsed time, not read from a clock, and they were wrong by up to two and a
  half hours (I had the reading half of the review ending at 00:20; it ended at 21:47). Found
  when a `date` printed 21:47. Every time above has been corrected from the commit times and the
  modification times of the briefs, drafts and review files. Times below are read from the clock.
- 21:38 to 21:47 Acting on the review, code first: the elaborator's width check, the fault
  part drawn and placed, the challenge button renamed, the text figure changed to the
  load-enable-only register with the challenge's header matched to it, bit 3 drawn at the top,
  the net NEXT renamed CHOICE. Then fact briefs per finding went back to the same five drafting
  subagents (reproduced in the appendix). The second round, checked the same way:
  - **B** put "The display would follow the switches one edge late" before its condition and
    dropped "wired to the switches": a broken join, sent back once more, fixed.
  - **C** regressed while fixing: the fault-lab gate list lost what each gate computes, "each
    ending at a rising edge" was dropped, "Two of 4" came back as a word, a gate name was
    capitalised ("AndKeep"), and it used the part label FIXED, which E had meanwhile drafted as
    CONST. All sent back; the third draft fixed all of them.
  - **D** dropped one fact from the challenge task (what `else if` does), turned "you may use"
    into an instruction, and wrote a first sentence with no main verb. Sent back, fixed. In the
    fix it folded `4'b0000` and `else if` into one sentence and dropped "with the digits 0000";
    accepted as a style point, not a fact.
  - A "hold" slip in the shift challenge's task ("outputs that hold a known bit") came from **my
    brief**, which used the word; the subagent copied it, as CLAUDE.md says a draft copies its
    brief. Sent back with that said; fixed.
  - **A** and **E** were right first time in this round.
  Then the whole lesson read once more, start to finish, on the built page: no new finding.
- 21:47 `./scripts/check.sh` passed: 180 Vitest tests, the build, 68 Playwright tests at desktop
  and phone widths (the first lesson's screenshots unchanged by the ligature, layout and label
  changes). Committed and pushed.

## What the check script caught

Less than the looking did. The full script ran three times (21:00 with placeholder words,
21:17, 21:47) and passed each time, because its stages had been run on their own first. Those
stage runs failed on: a type error in the facts test (`registers.challenges` possibly undefined
under `noUncheckedIndexedAccess`), a dd-views unit test asserting the old divergence shape
(`{ kind, path }` without the new `label`), a runtime test pressing the button by its old name
"Reset", and Prettier on the generated prose files (fixed by running Prettier, as intended).
It did not fail on any of the things the review found. The diagram collision test passed with
the flip-flop labels overlapping because auto-layout was replaced before it ran; the overlap was
found by looking at a screenshot. The aesthetics test passed with the phone table hiding a
column until a rule for that was added. The term gate could not see in-lesson order or the
"hold" slips; a scripted scan of the placed lesson found those.

## What I would change

- **Read a draft only after its subagent reports done.** Brief A's motivation changed after I
  had checked it.
- **One source for every control's label.** Two briefs described the same fault options with
  different names, and the prose quoted labels the page did not show. A brief that mentions a
  control should take its label from the lesson data, not restate it.
- **Write my own briefs in the lesson's own words.** The fact sheet banned "hold" in the keep
  sense, and my own brief used it. A scan of the briefs for the words the fact sheet bans would
  have caught it.
- **Read the clock.** The first version of this note's times was invented from a sense of
  elapsed time.
- **Keep a challenge's answer off the page by checking the reference text against every figure**
  as a test: the generalisation figure printed the third challenge's reference body line for
  line, and only the reviewer saw it. A content test could compare each `circuit-text` figure's
  generated text with every write challenge's reference.
- **The term gate should also check order within a lesson** (a term used before the section
  that introduces it), which this lesson's briefs had to police by hand.
- For the author: the "Places to look" list in a failure still shows internal names such as
  `open_dff1_CLK` for an unconnected input (both lessons); and on a phone every drawing scrolls
  sideways inside its card, so the learner must scroll to see a circuit's output.

## Reused and added, in one place

- **Reused from Module 4 and the platform:** the D flip-flop and its latches (opened in place),
  `register` with width, reset and enable, the HDL elaborator and generator (`always_ff` with
  `if`, vectors), the timing diagram, the circuit view with drill-down, the explorer, prediction,
  fault-lab, truth-table, circuit-text and challenge figures, the challenge runner, the hint
  ladder, the educational-test helpers, the screenshot and collision checks.
- **Added to the platform, and why** (each with a test): the term gate's lesson order
  (cross-module lessons were never compared); binary for words up to eight bits (the lesson's
  values are bit patterns); one `always_ff` per register in generated text (the text figure was
  wrong); a failure reported at the block the learner placed, with a book-supplied label (the
  rule that feedback names where the divergence appears); block ports from the circuit (a
  register block was drawn empty); timing-diagram label spacing by anchor (labels overlapped);
  a register-bit reference table; an explorer table writing "0 or 1" for an either-value input
  (X meant two things); a phone-width rule and padding for reference tables (a column was
  hidden); an opened block ignoring the outer drawing's pin positions (a pin was drawn 21 rows
  away); no ligatures in code (`<=` was drawn as one glyph); a width check inside `always_ff`
  (a wrong width reached the simulator and threw); fault parts drawn where they act (the forced
  value was invisible); the challenge's discard button renamed "Clear work" (it shared a name
  with the lesson's reset). Nothing was extracted into snowch/learning-platform, which was not
  touched.

## Appendix: the briefs, as sent

Each brief below went to a drafting subagent with docs/style.md attached; the shared fact
sheet went with every prose brief. They are reproduced unchanged, as files; the follow-up
notes after them were sent as messages to the same subagents.

### 00-fact-sheet.md

````markdown
# Shared fact sheet: Module 5, lesson 1, "registers"

You are drafting learner-facing text for one lesson of an interactive course, *Digital Design:
From Bits to a Working Computer*. Every fact below has been checked against the course's
simulator. Use only these facts. Do not add numbers, values, times or claims that are not here.
If a sentence seems to need a fact that is not here, leave a note in square brackets instead of
inventing it.

## Voice

- British English. Direct, precise, active voice, short sentences (about twenty words at most).
- The learner is "you". No marketing tone, no filler, no "in this lesson we will", no "let's".
- No em dashes and no en dashes used as dashes. Use a full stop, a colon or a comma.
- Say the point; do not label it ("that is the key idea"), withhold it ("the third part is the
  one that matters"), or wrap it in a roundabout purpose.
- No intensifiers: actually, exactly (unless exactness is the claim), really, simply, just,
  genuinely, entirely, quite.
- Use "press" for buttons and pins, never "click" or "tap" (the page works with a mouse, a finger
  and a keyboard).
- Markdown is allowed: `code` for signal values written as text, and lists. No headings inside a
  paragraph's text.
- The attached style checklist (docs/style.md) applies to every sentence.

## Who the learner is

The learner has just finished the previous lesson, "How does a circuit remember?" (Module 4).
From it they know, and you may use without explaining:

- gates (AND, OR, NOT, NOR, NAND) and that a gate's output depends only on its inputs now;
- **feedback**: an output fed back to an input; a loop of gates can hold a value;
- the **latch** (two cross-coupled NOR gates; inputs S and R; R "resets" Q to 0), the **D latch**
  (inputs D and EN: while EN is 1, Q copies D, it is **transparent**; while EN is 0, Q holds);
- the **clock**, written CLK: a signal that rises and falls at a steady rate, used to time a
  whole circuit; the **rising edge**: the moment a signal rises from 0 to 1;
- the **D flip-flop**: two D latches in series with an inverter; Q takes D only at a rising
  edge of CLK and keeps its value at every other time; drawn in the course as a block labelled
  "D flip-flop" with inputs D and CLK and outputs Q and Qb; pressing the block opens it to show
  its two latches;
- **setup** and **hold** time, **propagation delay**, **metastable** (all from the gate-delays
  figure of the previous lesson);
- X: the simulator's answer when it cannot know a value. A bit is 0, 1 or X.
- the previous lesson showed one line of text for a flip-flop: `always_ff @(posedge CLK) Q <= D;`
  (`always_ff` means at every clock edge; `@(posedge CLK)` names the rising edge of CLK;
  `Q <= D` means Q takes D). The learner has written gates as text with `assign` and `logic`,
  using `~`, `&`, `|`.
- the previous lesson ended with two questions: "What would it take to hold eight bits instead of
  one? What happens if the thing that changes D is itself a flip-flop clocked by the same edge?"

The learner does **not** know anything after that lesson. Do not use: state, state machine,
counter, multiplexer or mux, bus, synchronous, asynchronous, clock gating, skew, cycle (as a
noun for one clock period), register file, memory, address (except as an example of a number a
computer keeps), any arithmetic, hexadecimal.

## Terms this lesson introduces (rationed)

A term may be used only from the point where the lesson introduces it, never before. Introduce
each in plain English first, then the term.

| term | where it is introduced | plain meaning |
| --- | --- | --- |
| word | Investigation, the lead of the four-flip-flop figure | several bits kept together and treated as one value |
| register | Investigation, same place, after "word" | flip-flops that share one clock and hold a word |
| load enable | Construction, before the first challenge | an input, EN, that decides at each edge whether the register takes D (EN 1) or keeps what it has (EN 0) |
| shift register | Challenge section, the lead of the shift-register challenge (after the chain prediction) | flip-flops in a chain on one clock, each taking the value the one before it held, so the bits move one place along at every edge |

So the question, motivation and prediction sections must not say "word", "register", "load" or
"shift". Say "four bits", "four flip-flops", "a number".

**"Reset"** is not a new term (the latch's R already "resets" Q to 0). In this lesson a reset is
an input named RST: at a rising edge where RST is 1, every bit becomes 0. Say "the RST input" or
"a reset". The page also has a button labelled "Reset" in every challenge, which discards the
learner's work; never tell the learner to press "Reset" to mean RST.

**"Hold"** is the previous lesson's hold time. To say a flip-flop does not change its value, prefer
"keeps" ("Q keeps its value"). Do not use "hold" in that sense in this lesson.

## Writing words and bits

- A word of four bits is written bit 3 first: `0110` means bit 3 is 0, bit 2 is 1, bit 1 is 1,
  bit 0 is 0. Bit N is held by flip-flop N (named ff0 to ff3 in the drawing; D0 to D3 and Q0 to
  Q3 on its pins).
- An unknown word is written `XXXX` on the page.

## The page's own controls (exact labels)

- Explorer figures: a pin is a button; pressing an input pin flips it between 0 and 1.
  Buttons: "Clock CLK" (raises CLK and lowers it again: one rising edge), "Release all at once"
  (every input to 0), "Start again" (a fresh circuit, every flip-flop unknown).
- Prediction figures: choose an option, then press "Check my prediction"; "Predict again" clears
  it. After checking, a timing diagram shows what happened.
- Fault figure: a list headed "Fault options" starting with "No fault"; a button "Run checks"
  that runs a fixed sequence and reports "N of 4 checks failed." with the failing steps.
- Challenges: a drawing editor with part buttons above it; press one port and then another to
  wire them; a "Run tests" button; a hint ladder; a "Reset" button that discards work. A drawn
  challenge can also be filled in from text through a panel; you need not mention it.
- Time-model badges on each figure: "Clocked" (inputs change only between edges; at each edge
  the circuit settles), "Stepped" (every gate takes one step after an input changes; you change
  the clock yourself), "No simulation".

## The lesson's story, in order

1. Question: four switches set a number, one bit each. A display shows a number. A Save button.
   The display must show what the switches held when Save was last pressed, and keep showing it
   while the switches move. When the power comes on, the display must show `0000`. The whole
   circuit runs from one clock, CLK, that rises at a steady rate and never stops.
2. Motivation: the previous lesson's flip-flop keeps one bit, and takes D at every rising edge.
3. Prediction: two predictions about four flip-flops on one clock.
4. Investigation: four flip-flops sharing one clock: a word and a register.
5. Construction: build one bit that keeps its value at an edge where EN is 0 (the load enable).
6. Failure experiment: three faults in that bit; then the tempting wrong way, switching the clock
   off with an AND gate.
7. Explanation: why the keep path works; the reset, so the start is known.
8. Generalisation: the four-bit register with reset and load enable, as one block and as text.
9. Challenge: a chain of flip-flops (shift register), predicted then built; the register written
   as text.
10. Reflection.
````

### A-question-motivation-prediction.md

````markdown
# Brief A: Question, Motivation, Prediction (three sections)

Read the shared fact sheet first. Draft every string below. Return them under the keys given, as
plain text (Markdown allowed inside a string). Each section is read straight after the one
before, so write the joins: do not repeat a fact already stated in an earlier key of this brief.

## Key `question` (section "Question"; about 90 to 130 words, two or three paragraphs)

Facts, in this order:
1. The previous lesson's flip-flop keeps one bit. The previous lesson ended by asking what it
   would take to keep eight bits instead of one. This lesson keeps four.
2. The task: four switches set a number, one bit per switch. A display shows a number. There is a
   Save button.
3. The display must show what the switches held at the last press of Save. It must keep showing
   that number while the switches move.
4. When the power comes on, the display must show `0000`, not whatever the circuit happens to
   start with.
5. One clock, CLK, runs the whole circuit. It rises at a steady rate and never stops.
6. End with the question, stated as a question: how can a circuit keep four bits together,
   change them only when told to, and start from a known value?

## Key `motivation` (section "Motivation"; about 90 to 130 words, two or three paragraphs)

Facts:
1. The flip-flop takes D at every rising edge of CLK. With a clock that never stops, that is a
   new value at every edge. The display must change only at the edges where Save is pressed, and
   must keep its number at all the others.
2. Four flip-flops can keep four bits. The four bits make one number, so all four must change at
   the same moment. A number whose bits change at different moments passes through values
   nobody set.
3. A flip-flop that no edge has set yet has a value the simulator cannot know: it shows X. A
   display that starts at X shows nothing anyone chose.
4. Almost everything a computer keeps is a number of several bits that must stay put most of the
   time: a count, where it is in its list of instructions, the result of the last step kept for
   later. (One sentence. Do not add more examples.)

## Key `prediction` (section "Prediction" prose; two or three sentences)

Facts: the two figures below each run four flip-flops that share one clock. Choose an answer in
each figure, then press "Check my prediction". The timing diagram that appears shows what the
simulator did.

## Key `p1Question` (inside the first prediction figure; two to four sentences)

Facts:
1. Four flip-flops share one clock. Their D inputs together are written D, their outputs Q, as
   four bits with bit 3 first.
2. The figure sets D to `0110` while CLK is low, then gives one rising edge of CLK.
3. Then it sets D to `1111`, and CLK does not rise again.
4. Question: what is Q at the end?

## Key `p1Explain` (shown after the answer; two or three sentences)

Facts: at the rising edge, all four flip-flops took their D at once, so Q became `0110`. CLK did
not rise again, so the later change of D to `1111` reached no flip-flop. Q changes only at a
rising edge.

## Key `p2Question` (inside the second prediction figure; three to five sentences)

Facts:
1. The four flip-flops now have one more input, EN. At a rising edge where EN is 1, Q takes D. At
   a rising edge where EN is 0, Q keeps the value it had.
2. The figure starts the circuit fresh, with nothing set yet. It sets D to `0110` and EN to 0,
   and keeps EN at 0. Then CLK rises three times.
3. Question: what is Q after the third edge?

## Key `p2Explain` (shown after the answer; two to four sentences)

Facts:
1. Q is `XXXX`: unknown.
2. No edge ever had EN at 1, so no flip-flop ever took D. Each edge kept the value each
   flip-flop already had, and that value was never known.
3. Keeping a value only helps once there is a known value to keep. The lesson comes back to this
   with a reset.

## Option labels (keys `options.*`; short, a few words each, all the same shape)

- `options.p1Old`: Q is `0110`
- `options.p1New`: Q is `1111`
- `options.p2Zero`: Q is `0000`
- `options.p2D`: Q is `0110`
- `options.unknown`: the simulator cannot know Q (`XXXX`)

(The previous lesson's options were "q is 0", "q is 1", "The simulator cannot decide (X)". Keep
that shape. Return these five as drafted labels.)
````

### B-investigation-construction.md

````markdown
# Brief B: Investigation and Construction (two sections)

Read the shared fact sheet first. It comes straight after the Prediction section, whose two
figures showed: four flip-flops on one clock took `0110` at one edge and ignored a later change
of D with no edge; and with EN held at 0 from a fresh start, three edges left Q at `XXXX`. Do not
repeat those results; build on them. Return each key as plain text (Markdown allowed).

## Key `fourFlipFlopsLead` (above the figure "four flip-flops on one clock"; 90 to 130 words)

The figure is a live circuit with the "Clocked" badge and a "Clock CLK" button. Facts, in order:
1. The figure is four of the previous lesson's flip-flops, ff0 to ff3. Each has its own D pin,
   D0 to D3, and its own output, Q0 to Q3. One wire from CLK reaches all four CLK inputs.
2. At the start every Q is X, because no edge has set them yet.
3. Press D pins to set a number, then press "Clock CLK". All four Q change at that one edge, each
   to its own D.
4. Press D pins again without pressing "Clock CLK". No Q changes.
5. Press a flip-flop block to open it: inside are the two latches of the previous lesson.
6. Introduce the two terms, plain meaning first: several bits kept together and treated as one
   value are called a **word**; flip-flops that share one clock and keep a word are called a
   **register**. This one is a four-bit register.

## Key `fourFlipFlopsAfter` (below that figure; 50 to 80 words)

Facts:
1. Sharing one clock makes the four bits one word: all four take their D at the same edge, so the
   word changes in one step.
2. This register still takes D at every edge. Wired to the switches with a clock that never stops,
   the display would follow the switches one edge late. Save would do nothing.
3. What is missing: a way to tell each edge whether to take D or keep the word.

## Key `construction` (section prose, above the challenge; 70 to 110 words)

Facts:
1. Keep one clock for everything. Change what each flip-flop's D sees, not when it sees it.
2. Introduce the term, plain meaning first: an input that decides at each edge whether the
   register takes D (EN is 1) or keeps the word it has (EN is 0) is called a **load enable**.
   Here it is EN, and EN is 1 while Save is pressed.
3. You build it for one bit. A four-bit register is four of these bits sharing EN and CLK.
4. Using the editor: add parts with the part buttons above the drawing; press one port and then
   another to wire them. When a test fails, the result names the step and the part that drives
   the wrong output.

## Key `buildKeepBitLead` (above the challenge; one or two sentences)

Facts: draw one bit of the register with its load enable. The parts offered are a D flip-flop
block and AND, OR and NOT gates. Do not hint at the answer.

## Key `c1Task` (the challenge's task; four to six short sentences or a short list)

Facts:
1. Draw a circuit with inputs D, EN and CLK and output Q.
2. At a rising edge of CLK where EN is 1, Q takes D.
3. At a rising edge where EN is 0, Q keeps its value.
4. Between edges, Q does not change, whatever D and EN do.
5. The tests change D, EN and CLK one step at a time and check Q after each step, including one
   step where EN changes while CLK is 1.

## Key `c1Hints` (five hints, in this ladder order; one to three sentences each)

1. (The concept.) A flip-flop takes whatever reaches its D at each rising edge. To keep a value,
   make D see the flip-flop's own Q at the edges where EN is 0. That is feedback, as in the
   previous lesson.
2. (A common mistake.) Two ways that fail: wiring D straight to the flip-flop, so every edge takes
   D; and putting EN in the clock's path with an AND gate. The second passes the first few tests,
   then fails when EN rises while CLK is 1: the AND gate's output rises then, and the flip-flop
   sees a rising edge that CLK never made.
3. (A smaller example.) An AND gate with EN as one input passes its other input while EN is 1 and
   gives 0 while EN is 0. An AND gate with NOT EN as one input does the opposite. An OR of the two
   outputs passes whichever one is not forced to 0.
4. (Part of the answer.) The flip-flop's D is (D AND EN) OR (Q AND NOT EN), where Q comes back
   from the flip-flop's own output.
5. (The whole answer.) Place a NOT gate on EN. One AND gate takes D and EN. A second AND gate
   takes the flip-flop's Q and the NOT gate's output. An OR gate takes both AND outputs and drives
   the flip-flop's D. CLK goes straight to the flip-flop's CLK. Q is the flip-flop's Q.
````

### C-failure-explanation.md

````markdown
# Brief C: Failure experiment and Explanation (two sections)

Read the shared fact sheet first. These sections come straight after the Construction section,
where the learner built one bit with a load enable: the flip-flop's D is (D AND EN) OR (Q AND NOT
EN). Return each key as plain text (Markdown allowed).

## Key `keepFaultsLead` (above the fault figure; 120 to 170 words, three or four short paragraphs)

The figure shows the built bit with its gates named: notEn (NOT of EN), andLoad (D AND EN, its
output wire is LOAD), andKeep (Q AND NOT EN, its output wire is KEEP), orNext (LOAD OR KEEP, its
output wire is NEXT), and the flip-flop block ff. "Run checks" runs four steps, each ending with a
rising edge: "load 1" (D 1, EN 1), "edge with EN 0" (D 0, EN 0), "another edge with EN 0", "load 0"
(EN 1, D still 0). The checks compare Q with what the healthy bit gives. Facts per fault, as the
figure reports them:
1. Choose "Keep path stuck at 0": KEEP is forced to 0. 2 of 4 checks fail, at "edge with EN 0" and
   "another edge with EN 0". With EN 0, NEXT is 0, so the edge loads 0 instead of keeping the 1.
   Without the path from Q, the bit forgets.
2. Choose "EN held at 1": the same 2 of 4 checks fail, at the same two steps. Every edge takes D,
   and D is 0 there. Two different faults give the same failed checks, so the checks alone do not
   say which fault it is.
3. Choose "OR changed to AND": 3 of 4 checks fail: "load 1" and both edges with EN 0. LOAD needs EN
   1 and KEEP needs EN 0, so they are never both 1: NEXT is always 0 and every edge loads 0. "load
   0" passes only because 0 is the value it expects.
4. The figure has no "Clock CLK" button. You can raise and lower CLK yourself by pressing its pin.

## Key `gatedClockLead` (above the second figure; 90 to 130 words)

The figure has the "Stepped" badge: you change each input yourself by pressing its pin, and there
is no "Clock CLK" button. Facts, in order:
1. There is a tempting shortcut: stop the clock reaching the flip-flop when EN is 0. An AND gate,
   andClk, takes CLK and EN, and its output, GCLK, drives the flip-flop's CLK. With EN at 0, no
   edge gets through, so Q keeps its value.
2. Try it. Press D to 1. Press CLK to 1 while EN is 0: Q stays X, because no edge reached the
   flip-flop.
3. Now, with CLK still at 1, press EN to 1. Q becomes 1.
4. CLK did not rise at that moment, yet the flip-flop saw a rising edge: GCLK rose when EN did.

## Key `gatedClockAfter` (below the second figure; 60 to 100 words)

Facts:
1. With EN in the clock's path, a change on EN while CLK is 1 is a rising edge. The flip-flop takes
   D at a moment the clock did not choose.
2. In the load-enable bit, CLK reaches the flip-flop directly and EN only changes what reaches D.
   A change on EN between edges changes nothing until the next rising edge of CLK.
3. The rule this course keeps from here: every flip-flop gets CLK itself, and other signals decide
   only what reaches D.
4. The construction challenge's tests include a step where EN changes while CLK is 1, so a bit
   built with the AND-gate shortcut fails it.

## Key `explanation` (section prose, above the third figure; 80 to 120 words)

Facts:
1. Why the load enable works: at every rising edge, every flip-flop takes its D. EN decides what D
   is: the new value when EN is 1, the flip-flop's own Q when EN is 0. Taking its own value leaves
   it unchanged.
2. The clock reaches every flip-flop unchanged, so all the bits take their D at the same edge, and
   no other signal can make an edge.
3. The second prediction showed what a load enable cannot do: if no flip-flop has a known value
   yet, keeping it keeps X.

## Key `keepClearBitLead` (above the third figure; 100 to 150 words)

The figure is the load-enable bit with one more input, RST, and a reference table below it. It
has a "Clock CLK" button. Facts, in order:
1. One more AND gate, andClear, takes NEXT and NOT RST (the NOT gate is notRst). While RST is 1,
   andClear gives 0, whatever EN and D are, so the next edge makes Q 0.
2. Try it. Press "Start again": Q is X. Press "Clock CLK" with EN at 0: Q stays X. Press RST to 1
   and press "Clock CLK": Q becomes 0. Press RST back to 0, and EN and D decide again.
3. The reset acts only at a rising edge, like everything else that reaches D.
4. A reset wins over EN: at an edge where RST and EN are both 1, Q becomes 0.
5. For the display: set RST to 1 for one edge when the power comes on, and the display shows
   `0000` until the first edge with Save pressed.
6. The table below the figure lists every case. (One sentence.)
````

### D-generalisation-challenge-reflection.md

````markdown
# Brief D: Generalisation, Challenge, Reflection, and the model-versus-reality note

Read the shared fact sheet first. These come after the Explanation section, which showed one bit
with a load enable and a reset: at a rising edge, RST 1 makes Q 0; otherwise EN 1 makes Q take
D; otherwise Q keeps its value. Return each key as plain text (Markdown allowed; put code in
backticks exactly as written here).

## Key `registerAsTextLead` (above the figure; 110 to 160 words; a short list is fine for the lines)

The figure shows the four-bit register drawn closed, as one block labelled "register" with
inputs D, CLK, RST, EN and output Q, and below it the text the course generates from it. Facts:
1. The four-bit register is four of the bits from the explanation, sharing EN, RST and CLK. Bit N
   of D goes to flip-flop N. Drawn closed, it is one block. D and Q are each four bits wide.
2. In the text, `logic [3:0]` declares a signal four bits wide, numbered 3 down to 0.
3. `always_ff @(posedge CLK) begin ... end`: at every rising edge of CLK, the lines between
   `begin` and `end` decide what Q takes.
4. `if (RST) Q <= 4'b0000;`: if RST is 1 at the edge, Q takes `0000`. `4'b0000` is a four-bit
   value written in binary.
5. `else if (EN) Q <= D;`: otherwise, if EN is 1, Q takes D.

## Key `registerAsTextAfter` (below the figure; 60 to 100 words)

Facts:
1. When neither RST nor EN is 1, the text says nothing about Q, and Q keeps its value. The keep
   path you built from gates is written by leaving Q out.
2. The order of the two tests is the priority: RST is tested first, so a reset wins over EN.
3. A wider word needs more flip-flops and a wider range, such as `logic [7:0]` for eight bits.
   Nothing else in the text changes.

## Key `predictChainLead` (above the chain prediction figure; 50 to 80 words)

Facts:
1. The previous lesson ended with a second question: what happens if the thing that changes D is
   itself a flip-flop clocked by the same edge?
2. The figure chains four flip-flops on one clock. IN goes to the first flip-flop's D, and each
   flip-flop's Q goes to the next one's D. Their outputs are Q0 (the first, fed from IN) to Q3 (the
   last).
3. Do not name the circuit yet and do not say what it does; the learner predicts it.

## Key `p3Question` (inside the figure; two to four sentences)

Facts: all four flip-flops start unknown. The figure sets IN to 1 and gives one rising edge. Then
it sets IN to 0 and gives two more rising edges. Question: what is Q2 after the third edge?

## Key `p3Explain` (shown after the answer; three to five sentences)

Facts:
1. Q2 is 1.
2. At each edge, every flip-flop takes the value the one before it held just before that edge.
   The 1 entered Q0 at the first edge, moved to Q1 at the second and to Q2 at the third.
3. The bit moves one place per edge, not all the way along at once: inside each flip-flop the
   first latch closes at the edge, before any flip-flop's Q can change, so each takes the old
   value of the one before it.
4. Q3 is still X: no known value has reached it yet.

## Key `buildShiftLead` (above the challenge; 50 to 90 words)

Facts:
1. Introduce the term, plain meaning first: flip-flops in a chain on one clock, each taking at
   every edge the value the one before it held, so the bits move one place along, are called a
   **shift register**.
2. It takes a number one bit at a time on one wire. After four edges it holds the last four bits
   side by side: the newest in Q0, the oldest in Q3.
3. Draw one from four D flip-flop blocks.

## Key `c2Task` (the challenge's task; four to six sentences)

Facts:
1. Draw a circuit with inputs IN and CLK and outputs Q0, Q1, Q2 and Q3.
2. At each rising edge of CLK, Q0 takes IN, Q1 takes what Q0 held, Q2 takes what Q1 held, and Q3
   takes what Q2 held.
3. Between edges, nothing changes.
4. The tests send in the bits 1, 0, 1, 1, 0 at five edges and check the outputs, including one
   step where IN changes while CLK is 1.

## Key `c2Hints` (five hints, in this ladder order; one to three sentences each)

1. (The concept.) Each flip-flop takes, at every rising edge, whatever reaches its D. Make the
   first one's D come from IN and each other one's D from the Q before it, all on one clock.
2. (A common mistake.) Two ways that fail: wiring IN to every flip-flop's D, so all four take the
   same bit at every edge; and chaining them in the wrong order, so the new bit appears at Q3
   instead of Q0.
3. (A smaller example.) With two flip-flops, the first takes IN and the second takes the first
   one's Q. After two edges, the second shows what IN was at the first edge.
4. (Part of the answer.) The first flip-flop's D is IN, and its Q drives Q0. The second
   flip-flop's D is that same Q0.
5. (The whole answer.) Place four D flip-flop blocks. CLK goes to all four CLK inputs. IN goes to
   the first block's D. Each block's Q goes to the next block's D. The four blocks' Q outputs, in
   chain order, drive Q0, Q1, Q2 and Q3.

## Key `writeRegisterLead` (above the second challenge; one or two sentences)

Facts: write the four-bit register with a reset and a load enable as text. The circuit your text
makes is drawn under it as you type.

## Key `c3Task` (the challenge's task; four to six sentences)

Facts:
1. The module and its ports are provided. D and Q are four bits wide (`logic [3:0]`); EN, RST and
   CLK are one bit each.
2. At a rising edge of CLK: if RST is 1, Q becomes `0000`; otherwise, if EN is 1, Q takes D;
   otherwise Q keeps its value.
3. Write one `always_ff` block. You may use `if`, `else`, `begin` and `end`.
4. The tests include an edge where RST and EN are both 1, and a step where EN changes while CLK is
   1.

## Key `c3Hints` (five hints, in this ladder order; one to three sentences each)

1. (The concept.) The lines in an `always_ff` block decide what Q takes at each rising edge. Where
   no line gives Q a value, Q keeps the one it has.
2. (A common mistake.) Testing EN before RST. Then an edge where both are 1 loads D instead of
   `0000`, and the reset no longer wins.
3. (A smaller example.) The previous lesson's flip-flop as text is one line:
   `always_ff @(posedge CLK) Q <= D;`
4. (Part of the answer.) Start with `always_ff @(posedge CLK) begin`, and make the first line
   inside it `if (RST) Q <= 4'b0000;`.
5. (The whole answer.) Give the whole block, exactly:
   `always_ff @(posedge CLK) begin if (RST) Q <= 4'b0000; else if (EN) Q <= D; end`
   (in the hint, write it on separate lines as a code block, inside the module, before
   `endmodule`).

## Key `reflection` (section "Reflection"; 70 to 110 words, two paragraphs)

Facts:
1. A register is flip-flops that share one clock. A load enable changes what reaches D, never when
   the clock arrives. A reset gives every bit a known value at an edge.
2. A shift register is the same flip-flops wired in a chain.
3. End with two questions, not answered: what if the gates in front of D worked out a new value
   from Q itself, such as the next number up? And what would a circuit need in order to step
   through a fixed list of jobs, one job per edge?

## Key `modelVsReality` (shown after the lesson; 100 to 150 words, three or four short paragraphs)

Facts:
1. The clocked model gives every flip-flop its edge at the same moment. In hardware the clock
   reaches different flip-flops at slightly different times.
2. A shift register works in hardware because each flip-flop's output changes a little after the
   edge, later than the next flip-flop needs its D to stay put (its hold time). If the clock reached
   a later flip-flop late enough, a bit could pass through two flip-flops at one edge.
3. A real flip-flop at power-on is not X. It settles to 0 or 1, and nothing says which. The
   simulator writes X because it cannot know. A reset is needed either way.
4. This course's reset acts at a clock edge. Many real circuits also use a reset that acts the
   moment RST rises, without waiting for an edge. The course does not model that kind.
5. Real chips do switch the clock off to some flip-flops to save power, with a purpose-built part
   designed so that a change on its enable cannot make an edge. A plain AND gate, as in this
   lesson's failure experiment, is the version that fails.
````

### E-labels.md

````markdown
# Brief E: titles, objectives, captions and labels

Read the shared fact sheet first. These are short strings shown around the lesson. Return each
under its key. Captions are one sentence that says what to do with the figure, starting with a
verb, and fit on one line (at most about 80 characters). Titles are labels, not sentences: a
heading names what its section contains, in a few words, with no colon and no question unless the
section answers it. Every item in a group takes the same shape.

The previous lesson's strings, for the shape (do not copy their content):
- title "How does a circuit remember?"
- objectives "Build a circuit from NOR gates that holds a value after the input that set it is
  released."; "Build a D latch and a D flip-flop from it, and say at what moment each changes its
  output."
- section titles "How a circuit remembers", "Why kept values matter", "Two inverter loops and what
  q becomes", "Feedback in loops and buttons", "Faults, transparency problems, edge timing"
- captions "Predict what q will be in a two-inverter loop with a kick, then run."; "Choose a fault,
  press the buttons, and run the checks."; "Draw the flip-flop from two D latch blocks and an
  inverter, then run the tests."
- challenge titles "The two-button light", "The flip-flop, drawn", "The D latch, as text"

Term rule for this brief: "word", "register", "load enable" and "shift register" may appear in
the objectives, and in titles and captions from the Investigation section onwards (for
"shift register", from the Challenge section). The lesson title, and the Question, Motivation and
Prediction titles and captions, must not use them.

## `title` (the lesson title, a question, the same shape as the previous lesson's)

Facts: the lesson is about keeping several bits together, changing them only when told to, and
starting from a known value. It must not use the words word, register, load or shift.

## `objectives` (four, each starting with a verb, each one sentence)

1. Build a register from flip-flops that share one clock, and say why sharing the clock makes its
   bits change together.
2. Build one bit with a load enable from a flip-flop and gates, and say why the clock must reach
   the flip-flop unchanged.
3. Add a reset so a register starts from a known value, and write a register with a reset and a
   load enable as text.
4. Build a shift register and say where a bit is after each edge.

## `titles` (ten section titles, in order)

- `question`: the four-switch display with a Save button
- `motivation`: why one flip-flop per edge is not enough
- `prediction`: two predictions about four flip-flops on one clock
- `investigation`: four flip-flops sharing one clock; a word and a register
- `construction`: building one bit with a load enable
- `failureExperiment`: three faults in the bit, and an AND gate in the clock's path
- `explanation`: why the keep path works, and the reset
- `generalisation`: the four-bit register as one block and as text
- `challenge`: a chain of flip-flops, and the register as text
- `reflection`: what a register is, and questions ahead

## `challengeTitles`

- `c1`: one bit with a load enable, drawn
- `c2`: four flip-flops in a chain (a shift register), drawn
- `c3`: the four-bit register, as text

## `captions` (one per figure)

- `predictWord`: predict Q after one edge and a later change of D, then check
- `predictKeep`: predict Q after three edges with EN at 0 throughout from a fresh start, then check
- `fourFlipFlops`: press the D pins and "Clock CLK", and watch all four Q change at one edge
- `buildKeepBit`: draw one bit with a load enable and run the tests
- `keepFaults`: choose a fault and run the checks
- `gatedClock`: press D, CLK and EN, and watch an edge appear that CLK never made
- `keepClearBit`: press RST and "Clock CLK", and compare Q with the table
- `registerAsText`: the four-bit register drawn as one block beside its text
- `predictChain`: predict where a 1 sent in at the first edge is after the third, then check
- `buildShift`: draw four flip-flops in a chain and run the tests
- `writeRegister`: write the four-bit register as text and run the tests

## `faults` (the fault figure's option labels; short noun phrases, the same shape)

- `keepCut`: the KEEP wire forced to 0
- `enHigh`: EN forced to 1
- `orToAnd`: the gate orNext changed to an AND gate

(The previous lesson's were "Feedback wire cut", "LIGHT gate changed to OR", "Button A held
down". Keep that length.)

## `options` (prediction answers; same shape as each other)

Already drafted in Brief A for the first two predictions. Draft these three for the chain
prediction:
- `p3Zero`: Q2 is 0
- `p3One`: Q2 is 1
- `p3X`: the simulator cannot know Q2 (X)

## `table` (the reference table under the reset figure)

The table has columns CLK, RST, EN, D, Q(next) and a last column "What it does". Draft:
- `title`: the table's caption: one bit of a register, with a reset and a load enable
- `states`: the "What it does" entry for each row, a few words each, same shape:
  1. CLK rising, RST 1, EN and D either: Q becomes 0 (the reset)
  2. CLK rising, RST 0, EN 0, D either: Q keeps its value
  3. CLK rising, RST 0, EN 1, D 0: Q takes 0 from D
  4. CLK rising, RST 0, EN 1, D 1: Q takes 1 from D
  5. no rising edge, anything else: Q unchanged
  (The previous lesson's flip-flop table used "Captures 0", "Captures 1", "No edge: unchanged".)
- `note`: one sentence under the table: Q changes only at a rising edge of CLK; RST wins over EN;
  with EN at 0, Q keeps its value.

## `blocks` (names shown above the drawing of each circuit, in the trail used to open blocks; a
few words, same shape as the course's existing names "D flip-flop", "Two buttons", "4-bit
register")

- `four-flip-flops`: four flip-flops sharing one clock
- `keep-bit`: one bit with a load enable
- `keep-clear-bit`: one bit with a load enable and a reset
- `gated-clock-bit`: a flip-flop clocked through an AND gate
- `register`: the name of the closed block of a register of any width (one word)

## `driver` (a sentence the test results show for every lesson)

When a test fails, the page names the part that drives the wrong output. It used to say "The
{kind} gate {path} drives that signal. Its inputs at that moment:", where {kind} was a gate's name
such as NOR. Now {kind} may also be a block, such as "D flip-flop" or "register", and the page
supplies "NOR gate" or "D flip-flop" itself. Draft the sentence with the placeholders {kind} and
{path} kept exactly, so that it reads correctly as "The NOR gate norQ ..." and as "The D flip-flop
ff ...". Keep "Its inputs at that moment:" or an equally short lead-in to the list of inputs that
follows.
````

### R-reviewer.md

````markdown
# Reviewer's brief: the reading half of the review of one lesson

You are reviewing one lesson of an interactive course, *Digital Design: From Bits to a Working
Computer*, as a reader. The repository is at /home/user/digital-design. Do not edit any file in
it.

## Who you read as

A learner who has finished the previous lesson, "How does a circuit remember?" (its words are in
/home/user/digital-design/content/lessons/remember.prose.ts and remember.labels.ts), and nothing
after it. You know gates, feedback, the SR latch, the D latch (transparent while EN is 1), the
clock, the rising edge, the D flip-flop (two latches, Q takes D only at a rising edge), setup and
hold time, propagation delay, metastable, X as the simulator's "cannot know", and one line of
text, `always_ff @(posedge CLK) Q <= D;`, plus `assign`, `logic`, `~`, `&`, `|`. Nothing else.

## What to read

- The lesson as the page shows it, top to bottom: /tmp/claude-0/lesson-text.txt (the page's
  text, including figure labels and buttons).
- Screenshots of every figure as first drawn: /tmp/claude-0/review/fig-ix-*.png; and three
  predictions after checking plus the fault figure after "Run checks": /tmp/claude-0/review/after-*.png.
- The lesson's data, to check facts: content/lessons/registers.ts, registers.prose.ts,
  registers.labels.ts, and content/lessons/registers.facts.test.ts (the numbers the prose states,
  pinned against the simulator). The circuits are in packages/dd-model/src/library.ts.
- The course's rules: CLAUDE.md (especially "Voice", "Terms are rationed", "What no check can
  catch") and docs/style.md (the checklist every string is edited against).

## What to look for

1. Anything a learner who has done only the previous lesson could not follow: a term used before
   it is explained, a definite article in front of something not yet introduced, a step the page
   skips.
2. Anything the page says that the figure next to it does not show, or shows differently. This
   course's second pass asks whether the interactive showed the mechanism the prose claims.
3. Facts. A number, value, label or step name the prose states that the figure or the data does
   not produce. Check before you assert: open the facts test or the data, or run
   `npx vitest run content/lessons/registers.facts.test.ts` from the repository. If you cannot
   check a fact, say so rather than asserting it.
4. A word that means two things on one page (for example: reset, hold, keep, load, edge, X).
5. The same argument made twice, far apart; a paragraph that answers more than one question; a
   join between two paragraphs that does not follow.
6. Style checklist faults (docs/style.md): long sentences, labels where statements belong,
   withheld points, intensifiers, idioms, mouse-only verbs, em dashes.
7. The lesson's arc: does the question get answered; does each figure earn its place; does the
   predict, build, run, break, explain, generalise loop hold; is anything missing a learner would
   need for the three challenges (without giving their answers).
8. Labels, captions and titles: do they say what the section or figure contains.

## Rules for every finding

- Quote the page, exactly, for every finding.
- Suggest a direction; never rewrite the sentence yourself.
- Check every number or cross-reference before asserting it.
- Never include a challenge's answer, or any part of it, in a finding.
- Say how sure you are and how much it matters (high, medium, low).

## Output

Write your findings to /tmp/claude-0/review/findings.md, numbered F1, F2, ..., each with: the
quote, where it is (section and key or figure id), what is wrong, the direction of a fix, how
you checked, and severity. Then reply with "done" and the number of findings.
````

### S-sceptic.md

````markdown
# Sceptic's brief: attack each review finding before anyone acts on it

A reviewer has read one lesson of an interactive digital-design course and written findings in
/tmp/claude-0/review/findings.md. Reviewers over-call. Your job is to attack each finding
independently and give a verdict, so that only findings that survive are acted on.

The repository is at /home/user/digital-design. Do not edit any file in it. The lesson as the
page shows it is in /tmp/claude-0/lesson-text.txt; screenshots in /tmp/claude-0/review/*.png; the
lesson's data in content/lessons/registers.ts, registers.prose.ts, registers.labels.ts; the facts
the prose states are pinned in content/lessons/registers.facts.test.ts (run it with
`npx vitest run content/lessons/registers.facts.test.ts`); the circuits are in
packages/dd-model/src/library.ts. The learner has done only the previous lesson
(content/lessons/remember.prose.ts and remember.labels.ts). The rules are CLAUDE.md and
docs/style.md.

For each finding:
1. Check the quote is on the page, exactly.
2. Check the claim: is it true? If it is about a fact, verify it against the data, the facts test
   or the simulator. If it is about a learner's knowledge, check the previous lesson's words.
3. Ask whether a fix would make the lesson better for that learner, or only different.
4. Give a verdict: **upheld** (true and worth fixing), **in part** (say which part), or
   **rejected** (say why), with the evidence you used.
5. Never include a challenge's answer, and never rewrite the lesson's sentences yourself.

Write your verdicts to /tmp/claude-0/review/verdicts.md, one per finding, keyed F1, F2, ...
Then reply "done" with the counts upheld / in part / rejected.
````

### Follow-up notes sent to the drafting subagents, as sent

**Round 1, to A.** Notes on your drafts in /tmp/claude-0/drafts/A.md; redraft only these two keys
and write them to /tmp/claude-0/drafts/final/A2.md in the same "### key" format (create the
folder if needed). Leave every other key alone. 1. `question`: the sentence "The task is simple."
judges the task without grounds (style rule 22) and labels the next sentences (rule 17). Redraft
the key without it; keep all the other facts. 2. `options.unknown`: it starts with a lower-case
letter while the other options start with "Q is". Give it the same shape and a capital: the
simulator cannot know Q, written `XXXX`. Reply "done" when written.

**Round 1, to B.** Notes on your drafts in /tmp/claude-0/drafts/B.md; redraft only these two keys
and write them to /tmp/claude-0/drafts/final/B2.md in the same "### key" format (create the
folder if needed). Leave every other key alone. 1. `fourFlipFlopsLead`: "Flip-flops that share
one clock and hold a word are a register." The fact sheet reserves "hold" for hold time; for a
flip-flop not changing its value, use "keep". Also, introduce each term plain meaning first and
then the term in bold, as the brief asked (**word**, **register**). 2. `construction`: one
paragraph carries three ideas (what to change; the term load enable; how to use the editor).
Split it into paragraphs, one idea each (style rule 2), and put the term in bold where it is
introduced (**load enable**). Keep every fact. Reply "done" when written.

**Round 1, to C.** Notes on keepFaultsLead in /tmp/claude-0/drafts/C.md; redraft only that key and
write it to /tmp/claude-0/drafts/final/C2.md in the same "### key" format (create the folder if
needed). 1. Wrong fact: "Each step compares what your bit does with what the correct bit does."
The figure is not the learner's drawing; it is the lesson's own bit (the circuit the challenge
asked for), drawn with its gates named. The checks compare the faulty bit's Q with what the
healthy bit gives. 2. Dropped facts: say what the figure shows before the faults: its gates notEn
(NOT of EN), andLoad (D AND EN, output wire LOAD), andKeep (Q AND NOT EN, output wire KEEP),
orNext (LOAD OR KEEP, output wire NEXT), and the flip-flop ff. The draft uses KEEP, NEXT and LOAD
without saying what they are. Also give each step's inputs: "load 1" (D 1, EN 1), "edge with EN
0" (D 0, EN 0), "another edge with EN 0", "load 0" (EN 1, D still 0). 3. The page prints the
results as digits ("2 of 4 checks failed."). Write the counts as the page does: "2 of 4", "3 of
4", not "Two of 4" or "three of 4". Keep everything else, including the last paragraph about the
CLK pin. 120 to 190 words. Reply "done" when written.

**Round 1, to D.** Notes on your drafts in /tmp/claude-0/drafts/D.md; redraft only these three
keys and write them to /tmp/claude-0/drafts/final/D2.md in the same "### key" format (create the
folder if needed). Leave every other key alone. 1. `registerAsTextLead`: "In hardware description
language" names a term the learner has not met. The course calls it "the text" or "text".
Redraft without that phrase; keep every fact and the list. 2. `registerAsTextAfter`: "To hold a
wider word" uses "hold", which the fact sheet reserves for hold time. Use "keep". 3.
`reflection`: "A register holds a word" has the same slip; use "keeps". Reply "done" when
written.

**Round 1, to E.** Notes on your labels in /tmp/claude-0/drafts/E.md; redraft only these keys and
write them to /tmp/claude-0/drafts/final/E2.md in the same "### key" format (create the folder if
needed). Leave every other key alone. 1. `titles.question` "Saving and holding four bits": "hold"
is reserved for hold time; use "keeping" or another plain word. 2. `titles.failureExperiment`
"Faults and a gated clock" and `blocks.gated-clock-bit` "Gated-clock bit": "gated clock" is on
the fact sheet's do-not-use list (clock gating). Say it plainly, e.g. an AND gate in the clock's
path. 3. `challengeTitles.c1` "The keep bit, drawn" and `blocks.keep-bit` "Keep bit",
`blocks.keep-clear-bit` "Keep-clear bit": "keep bit" is not a name the lesson uses, so a reader
cannot tell what it is. Use the brief's meaning: one bit with a load enable; one bit with a load
enable and a reset. 4. `titles.challenge` "Building shift registers": the section has two
challenges, the shift register drawn and the four-bit register written as text. Name both. 5.
`options.p3X` "Q2 is X": the other unknown option says the simulator cannot know the value. Give
it that shape: the simulator cannot know Q2 (X). Reply "done" when written.

**Round 1, to D again.** One more note: `buildShiftLead` in /tmp/claude-0/drafts/D.md says "it
holds the last four bits side by side". Same slip as before: use "keeps". Write only that key to
/tmp/claude-0/drafts/final/D3.md in the same "### key" format. Reply "done".

**Round 1, to C again (the join).** A join note on `keepClearBitLead` (C.md). On the page it comes
straight after the `explanation` paragraphs, which end "if no flip-flop has a known value yet,
keeping it keeps X." It then opens "One more AND gate, andClear, takes NEXT and NOT RST", so RST
arrives without the reader being told the figure has a new input. Dropped fact from the brief:
the figure is the load-enable bit with one more input, RST, and a reference table below it.
Redraft only the opening of the key so it first says that (one short sentence is enough, joining
from "keeping it keeps X"), then continue as before. Keep the rest of the key as it is, and keep
the words "(from the NOT gate notRst)" after "NOT RST". Write the whole key to
/tmp/claude-0/drafts/final/C3.md in the "### keepClearBitLead" format. Reply "done".

**After the review, to A.** A review of the whole lesson found points in your section. Redraft
the keys below from these facts and write them to /tmp/claude-0/drafts/final/A4.md in the "###
key" format. Leave every other key as it is. The fact sheet and style rules still apply.
`question`: Quote the previous lesson's question exactly, as a quotation: "What would it take to
hold eight bits instead of one?" (the previous lesson's words; keep its "hold" because it is a
quote). Everything else in the key stays. `motivation`: The first paragraph answers two
questions; split it: one paragraph on why one flip-flop takes a new value at every edge while the
display must change only at the edges where Save is pressed; one on why the four bits must change
together. "stay put" is an idiom (style rule 20); say it plainly (for example "stay the same").
Keep the other facts. `prediction`: Correct a wrong description: the two figures do not draw any
flip-flops. Each is a question about four flip-flops sharing one clock, with three answers to
choose from; after "Check my prediction", a timing diagram shows what the simulator did.
`p1Question`: Say how a word is written before using it: the four bits are numbered 3 down to 0;
a word is written with bit 3 on the left and bit 0 on the right, so in `0110` bit 0 is 0 and bit
3 is 0. `p2Question`: This EN is not the D latch's EN from the previous lesson. The latch's EN
let Q follow D for as long as it was 1. This EN does nothing between edges: it only decides, at a
rising edge, whether Q takes D. Say this once, briefly, where EN first appears. Keep the other
facts. `options.unknown`: Make it the same shape as the chain prediction's option "The simulator
cannot know Q2 (X)": that is, "The simulator cannot know Q (XXXX)". Reply "done" when written.

**After the review, to B.** A review of the whole lesson found points in your section. Redraft
the keys below and write them to /tmp/claude-0/drafts/final/B4.md in the "### key" format. Leave
every other key as it is. `fourFlipFlopsLead` (start from your B2 version): The drawing has
changed: ff3 is now at the top and ff0 at the bottom, so reading top to bottom gives bit 3 first,
the order a word is written. Say that in one sentence where you describe the four flip-flops.
Keep every other fact and the two terms in bold. `fourFlipFlopsAfter`: The Motivation section
has already said that one flip-flop takes D at every edge. Do not set that problem up again in
full; state in one sentence that this register still takes D at every edge, so Save would do
nothing, then what is missing. Keep the facts "the word changes in one step" and "the display
would follow the switches one edge late". "one edge too late" should be "one edge late". Reply
"done" when written.

**After the review, to C.** A review of the whole lesson found points in your section, and some
names changed. Redraft the keys below from these facts and write them to
/tmp/claude-0/drafts/final/C4.md in the "### key" format. The fact sheet and style rules still
apply. Name changes, everywhere in your keys: the OR gate is now **orChoice** (was orNext), and
its output wire is **CHOICE** (was NEXT). The three fault option labels on the page are exactly
"KEEP wire forced to 0", "EN forced to 1" and "OR gate changed to AND". `keepFaultsLead`: Set the
gate names as a short list (one item per part: notEn, andLoad with output LOAD, andKeep with
output KEEP, orChoice with output CHOICE, the flip-flop ff), and the four steps as a short list
with their inputs, as before. Keep each sentence under about twenty words. Name the keep path
here, plain meaning first: the path from the flip-flop's Q through andKeep back to its D is the
**keep path**; without it, the bit forgets. The wires are not labelled in the drawing. Pressing a
wire lights it up and shows its name and value under the drawing; say so once, so the learner can
find LOAD, KEEP and CHOICE. When "KEEP wire forced to 0" is chosen, the drawing shows a part
labelled FIXED with the value 0, wired where KEEP used to go, and andKeep's own output is left
unconnected. Keep the results exactly: 2 of 4 fail at "edge with EN 0" and "another edge with EN
0" for the first two faults; 3 of 4 fail for the third, "load 1" and both edges with EN 0; "load
0" passes only because 0 is the expected value. Use CHOICE where the old text said NEXT. Remove
the last paragraph about pressing the CLK pin; it moves to `gatedClockLead`. `gatedClockLead`:
Add, near the start: this figure has the "Stepped" badge and no "Clock CLK" button, because the
experiment needs EN to change while CLK is 1, which the clocked model never does; you raise and
lower CLK yourself by pressing its pin. GCLK is not labelled in the drawing: say that pressing the
wire from andClk to the flip-flop shows its name, GCLK. Keep the steps and the result as before.
`explanation`: The rule that CLK reaches every flip-flop unchanged was stated in the paragraph
just before (gatedClockAfter). Do not state it again. Keep: at every rising edge every flip-flop
takes its D; EN decides what D is (the new value when EN is 1, the flip-flop's own Q, through the
keep path, when EN is 0); taking its own value leaves it unchanged. Then, as its own paragraph,
opening the reset part: the second prediction showed what a load enable cannot do: if no
flip-flop has a known value yet, keeping it keeps X. `keepClearBitLead` (start from your C3
version): Use CHOICE instead of NEXT. Add one sentence: what sets RST to 1 when the power comes on
is outside this lesson. Avoid starting two neighbouring sentences with "one more" (the input and
the AND gate). Reply "done" when written.

**After the review, to D.** A review of the whole lesson found points in your section, and the
generalisation figure has changed. Redraft the keys below from these facts and write them to
/tmp/claude-0/drafts/final/D4.md in the "### key" format. The fact sheet and style rules still
apply. The generalisation figure now shows a four-bit register **with a load enable and no
reset**, so the third challenge (adding the reset) is not shown on the page before the learner
tries it. Drawn closed it is one block with inputs D, CLK and EN and output Q. Its text, as the
figure shows it: [the generated text, as shown in the lesson's generalisation figure].
`registerAsTextLead` (110 to 160 words): The four-bit register with a load enable is four of the
load-enable bits from the construction, sharing EN and CLK. Bit N of D goes to flip-flop N. Drawn
closed, it is one block. D and Q are each four bits wide. `logic [3:0]` declares a signal four
bits wide, numbered 3 down to 0. `always_ff @(posedge CLK) begin ... end`: at every rising edge
of CLK, the lines between `begin` and `end` run; `begin` and `end` group several lines into one
block, as brackets do. `if (EN) Q <= D;`: if EN is 1 at the edge, Q takes D. Do not mention RST
or a reset value in this key. `registerAsTextAfter` (60 to 100 words): When EN is 0, no line
gives Q a value, so Q keeps its value. The keep path you built from gates is written by leaving
out a line for the case where EN is 0. A wider word needs a wider range: for eight bits, D and Q
are declared `logic [7:0]`, and every value written into Q must then be eight bits wide too. Do
not say that nothing else changes. The text does not place flip-flops; the course turns each bit
of Q into a flip-flop when it builds the circuit from the text. `writeRegisterLead` (one or two
sentences): Write the four-bit register with a reset as well as the load enable. The circuit your
text makes is drawn under it as you type. `c3Task` (five to seven sentences): The module and its
ports are provided, in the same order as the figure's text, with one more input, RST. D and Q
are four bits wide; EN, RST and CLK are one bit each. At a rising edge of CLK: if RST is 1, Q
becomes `0000`; otherwise, if EN is 1, Q takes D; otherwise Q keeps its value. `4'b0000` is a
value four bits wide (the 4), written in binary (the `'b`), with the digits 0000. `else if` tests
its condition only when the `if` before it was false. Write one `always_ff` block. You may use
`if`, `else`, `begin` and `end`. The tests include an edge where RST and EN are both 1, and a
step where EN changes while CLK is 1. `buildShiftLead`: Split the first sentence (29 words) into
two; keep plain meaning first, then the term **shift register**. Keep the other facts. `c2Task`:
"They check the four outputs against the results" does not say what the results are. Say
instead: after each edge, the tests check the outputs that hold a known bit by then (the early
edges check only the first outputs). `modelVsReality` (start from the version on the page; keep
every fact, including "(its hold time)"): Split the 29-word sentence about why a shift register
works. "stay put" is an idiom; say it plainly. Reply "done" when written.

**After the review, to E.** Two more short labels, from a review of the whole lesson. Write them
to /tmp/claude-0/drafts/final/E4.md in the "### key" format. `runtime.reset`: Every challenge on
every lesson page has a button that discards the learner's work for that challenge (it asks to
confirm with "Discard work" or "Cancel", and afterwards the page says "Work cleared"). It is
labelled "Reset". This lesson teaches a reset input, RST, that makes a register's bits 0, so the
button's label now means two things on one page. The explorer figures already use "Start again"
for a fresh circuit, which is a different action. Draft a new label for the button: two or three
words, saying that it clears the learner's work on this challenge, not using "reset" and not
"Start again". `parts.const`: When a fault forces a wire to a fixed value, the drawing shows a
small box that drives that value (the value itself, 0 or 1, is written beside its output). Draft
the label shown above the box: one or two words, in capitals like the gate labels (AND, OR, NOT).
The current placeholder is "FIXED". Reply "done" when written.

**After the review, to B again.** One note on `fourFlipFlopsAfter` in B4.md: "The display would
follow the switches one edge late." now comes before "This register still takes D at every
edge", and has lost its condition (if it were wired to the switches with a clock that never
stops). Order it: the word changes in one step; this register still takes D at every edge; so,
wired to the switches, the display would follow them one edge late and Save would do nothing;
what is missing. Write only that key to /tmp/claude-0/drafts/final/B5.md. Reply "done".

**After the review, to D again.** Two notes on D4.md; redraft only these keys and write them to
/tmp/claude-0/drafts/final/D5.md. 1. `c3Task`: a dropped fact: "`else if` tests its condition only
when the `if` before it was false." Add it. And "Write one `always_ff` block using `if`, `else`,
`begin` and `end`" has drifted from "You may use"; keep it as permission: write one `always_ff`
block; you may use `if`, `else`, `begin` and `end`. 2. `buildShiftLead`: the first sentence has
no main verb ("Flip-flops in a chain on one clock, each taking ..., so bits move one place
along."). Make it a sentence that says what such flip-flops do, plain meaning first, then the
term in the next sentence. Reply "done".

**After the review, to C again.** Notes on `keepFaultsLead` in C4.md; redraft only that key into
/tmp/claude-0/drafts/final/C5.md. Keep the list layout and everything not mentioned here. 1.
Dropped facts: the gate list now gives names only. Give each one's job, as before: notEn is NOT
of EN; andLoad is D AND EN (output LOAD); andKeep is Q AND NOT EN (output KEEP); orChoice is LOAD
OR KEEP (output CHOICE). Also restore that each of the four steps ends at a rising edge. 2. "Two
of 4 checks fail" has slipped back to a word; the page prints "2 of 4". 3. The part shown by the
first fault is now labelled CONST on the page, not FIXED. And a gate name keeps its own spelling
at the start of a sentence: andKeep, not AndKeep (or reword so it does not start the sentence).
4. Set the term in bold where it is introduced: **keep path**. Reply "done".

**After the review, to D, the last.** One more, and the slip is mine, from my brief: `c2Task`
(D4.md) says "they check the outputs that hold a known bit by then". "hold" is reserved for hold
time. Use "keep" or another plain word. Write only `c2Task` to /tmp/claude-0/drafts/final/D6.md.
Reply "done".

The reviewer's findings and the sceptic's verdicts are summarised in the table above; the
reviewer's full report was saved by the managing model because the reviewer could not write the
file, and the sceptic wrote its verdicts itself.
