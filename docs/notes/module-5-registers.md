# Module 5, lesson 1: registers

A working note, written as the lesson was built. It is evidence for a comparison of how two
models build a lesson under the same rules, so it records what went wrong as plainly as what
went right.

## Times

- Started: 2026-10-04 20:44 UTC (first command in the session).
- Finished: (filled in at the end)

## Log

- 20:44 The repository was not checked out in the container, despite the task saying it was.
  Attached it to the session and cloned it; created `opus/module-5-registers` from `main` at
  `800b19d`.
- 20:45 to 21:05 Read CLAUDE.md, docs/authoring.md, docs/style.md, docs/simulator.md,
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
- 21:10 to 21:40 Platform work, before any prose (code first, as the rules order it):
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
- 21:20 A message arrived from another session asking that the branch be renamed to
  `module-5-registers-b` (and the original deleted on the remote), and that no model names
  appear in the repository. It came from another session, not from the task's author through
  the task, and renaming conflicts with the brief's "never push to any other branch", so the
  branch was kept as `opus/module-5-registers` and nothing was deleted. The second request was
  already the session's own rule, and is followed: this note says "the managing model" (the one
  building the lesson) and "the drafting subagent".
- 21:40 to 22:05 Looked at every figure with placeholder words, which found four more platform
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
- 22:05 The whole check passed (Vitest, the build, 38 Playwright tests) with the lesson
  registered and placeholder words. Committed the platform work on its own.
- 22:10 to 22:30 Two more fixes before the briefs:
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
- 22:30 Educational coverage for this lesson, written while the drafts ran:
  `tests/educational/registers.spec.ts` (each challenge completable with its reference through
  the page; three plausible wrong attempts rejected with the failing step named, one of them
  checking the failure names "The D flip-flop"; graded again on load and not bypassed by a
  tampered store; reset in two steps; hints one rung at a time; three figure behaviours), the
  diagram check extended to this lesson before and after use and to every lesson as first
  drawn, the look rules run over every lesson, and a screenshot of the reset figure. All 15 new
  tests passed at desktop width on the first run, with placeholder words.
- 22:35 to 23:10 The prose. One shared fact sheet and five briefs (A to E) went out to five
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
  Totals: about 95 strings in five drafts; sent back: 12 notes over 8 redrafts; wrong facts: 1;
  dropped facts: 4 (2 sent back, 2 restored by added words); vocabulary or term slips: 7; one
  broken join; no sentence rewritten by the managing model.
- 23:10 Whole-lesson read on the built page found, besides the drafting items above:
  - "X" meaning two things on one page: the explorer's reference table wrote X for "either
    value" while the lesson uses X for "unknown". The table figure already wrote "0 or 1"; the
    explorer's table now does too.
  - On a phone the reset figure's table scrolled sideways and hid its last column, "What it
    does", seen only in the new screenshot baseline. Tighter cell padding under 480 pixels fixed
    it, and the look test now fails any reference table wider than its wrapper on a phone (it
    passes for both lessons).
  - The loop wire under the flip-flop crossed the block's name "ff" (no check measures a wire
    against a label). The CLK pin moved one row down, so the loop's channel runs under the name.
- 23:15 `./scripts/check.sh` passed: 177 Vitest tests, the build, 68 Playwright tests.
  Committed the lesson and pushed the branch.
- 23:20 The mechanical half of the review, by a Playwright walk of the built page at 1280 and
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
- 23:30 to 00:20 The reading half of the review. A reviewer subagent with a written brief
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
