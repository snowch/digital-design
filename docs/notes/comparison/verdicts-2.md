# Sceptic's verdicts on review-1.md and review-2.md

Each finding from both reviews was attacked independently: the quote was checked against the
lesson text (`content/lessons/*.prose.ts`, `*.labels.ts`, `*.ts`) and against the built site
served on port 4186 and walked with Playwright at 1280 and 375 pixels; facts were checked against
`packages/dd-model/src/library.ts`, the facts tests and the simulator; a learner's knowledge was
checked against what the earlier lesson actually says. Verdicts: **upheld**, **in part** (which
part), **rejected** (why). No challenge answer appears here and no lesson sentence is rewritten.
Entries are keyed `<review>-<id>`. "Shared with" marks a finding the other review also makes.

This file is written incrementally; a section that ends without a totals table was interrupted.

## Review 1, Lesson A (`remember`)

**1-A1 — in part.** Quote exact (`remember.labels.ts` objective 4). The five terms are all undefined at that point, four behind a definite article, and the sentence is 38 words. But an objective is the one place a lesson names what it will teach; stripping the terms would leave it unable to. The sentence length (style rule 1) is the part that would improve the page; the term use is a preview, as the reviewer's own hedge allows. Not shared.

**1-A2 — upheld.** Quote exact (`p1Question`). `Prediction.tsx` renders the question, the options and a button, and after commit a timing diagram; no `svg.circuit` exists before or after (walk: 0 circuit SVGs). In `inverterLoop(2)` the wires alternate while kick is 1 (`or.y`=1, `not1.y`=0, `not2.y`=`q`=1), so the answer depends on which wire is `q`, which no sentence before the figure says. A learner who knows only gates cannot reason to the answer. Shared with 2-A7.

**1-A3 — upheld.** Both quote pairs exact (`p1Explain`/`investigationLoopTwo`, `p2Explain`/`investigationLoopThree`), in consecutive sections. "the third contradicts the first" is a judgement but the repeat is a fact. Low severity is right. Shared with 2-A13.

**1-A4 — upheld.** Quote exact. Walk: after kick and release in `loop-three` the status reads "These signals never settled and are shown as X: q, or.y, not1.y, not2.y." while the drawing's value labels read 0, 1, 0, 1, 0, 0, the q pin reads "q = 0" and the table "q Output 0"; in `two-buttons` after A, B and "Release all at once" the status names LIGHT and DARK as X while every value label and the table read 0. Cause confirmed in `CircuitExplorer.tsx`: `shown = history[step]`, and `settle()` builds `history` before `markUnknown` writes X. A fix makes the figure agree with its own status; code first. Not shared.

**1-A5 — upheld.** Caption exact. Walk, SVG paths: wire A is `M 44 32 H 52 V 36 H 100`, wire B is `M 44 92 H 58 V 36 H 200`; both run along y=36, overlapping from x=58 to x=100, and B continues along y=36 through the `norDark` symbol (which sits at x 100 to 160). The circuit has no `placed()` positions in `library.ts`, unlike the registers circuits. The drawing does read as one wire from both buttons. Not shared.

**1-A6 — upheld.** Quote exact. Walk: "Settled in 2 steps." after pressing A, "Settled in 0 steps." after releasing it. The only definition of a step ("Every gate takes one step.") is the Time model aside, which `LessonView.tsx` renders after every section. Caption "settling steps" confirmed. Low severity is right. Not shared.

**1-A7 — in part.** Quote exact. The investigation figure draws `norLight`/`norDark` with names, and its lead gives the wiring; the challenge then asks for the same circuit with a five-rung ladder. The facts hold and the ladder's pretence of an unknown is odd. But the lesson's loop puts the investigation before the construction by design, and the originality note says the names arrive after the learner has built it; whether the build should precede the reveal is an authorial choice, not a fault, so the verdict is partial. Shared with 2-A11.

**1-A8 — upheld.** Quotes exact (`buildDLatchLead`, `c2Task`). The investigation named only LIGHT as an output; the other gate's output was "the other gate's output", never an output of the circuit. "the opposite of Q" fails for S=R=1, which the fault lab has the learner produce ("Both gates' outputs are 0"). The lead's second paragraph and the task text say the same thing in different words. Not shared.

**1-A9 — upheld.** Checked against `c2Hints` and `c3Hints`: in both ladders the "Common mistake" rung names the right connections by contrast with the wrong ones, and in the flip-flop ladder rungs 3 and 4 differ only in wording. Details withheld because they are the answers. Not shared.

**1-A10 — upheld.** Quote exact (`faultLabLead`). The lead's only mention of the checks is in its last paragraph, with a definite article and no account of what "Run checks" does; the registers lead lists its steps first. Every fault's outcome is stated before the figure. Low severity is right. Not shared.

**1-A11 — upheld.** Quote exact. Walk: under "No fault" `norLight` is at (200,20) and `norDark` at (100,20); under "Feedback wire cut" they swap to (100,20) and (200,20), no wire for DARK is drawn at all, nothing marks the cut, and the LIGHT wire runs from `norLight` into `norDark`'s input; under "Button A held down" `norLight` moves to (100,80), a CONST part takes (100,20), and the LIGHT wire (`H 174 V 32 H 300`) crosses `norDark`'s box at y=32. The registers fault lab keeps its layout because `keepBitCircuit` is `placed()`. Shared with 2-A18.

**1-A12 — upheld.** All quotes exact (`dLatchExplorerLead`). The clock is defined beside a one-latch figure (`libraryId: "d-latch"`); the two-latch race is told, not shown; "once per rise of the clock" follows "share one EN" without saying EN is the clock; the flip-flop is named before it does anything; the setup-hold figure measures it before the explanation opens it. Section order in `remember.ts` confirms the arc. Shared with 2-A15 and 2-A16.

**1-A13 — upheld.** Quote exact (`setupHoldLead`). No sentence states what setup time or hold time is; `reference.ts` holds plain meanings ("How long D must be stable before the clock edge") that never reach the page. "simply" confirmed (rule 19). Shared with 2-A10.

**1-A14 — upheld.** Quotes exact. "the slave" first appears in `internalsLead`, three figures later; "a recorded seed" is two sentences before "A seed is a number"; "This is called metastable." confirmed. Shared with 2-A4.

**1-A15 — upheld.** Quotes exact. Walk: the status lines read "Q captured 1 at 1030." and "Roll 1: Q became undecided at 1020, settled to 0 at 1060."; the diagram has no `tick-label` or `mark-label` text (0 of each); `experiment()` calls no `mark()`, so the axis is bare, and the number 1000 is nowhere on the page. The sentence uses 30 for setup time and for the delay to Q. Shared with 2-A5.

**1-A16 — upheld.** Quote exact. Walk at 20 units before the edge: "Roll 1 ... settled to 0 at 1060", "Roll 2 ... 1066", then "Roll 2 ... 1066" again; at 25 units: "Roll 2 ... 1066" once more, and the Rolls list then holds two identical "Roll 2" lines. Cause confirmed in `SetupHold.tsx`: `seed = draws.length + 1` and a new draw replaces the one at the same offset. Code first. Shared with 2-A6.

**1-A17 — upheld.** Quote exact. Walk: at the default 80 units before the edge the "Roll result" button is absent (`inWindow` false); three names confirmed: "The band" (prose), "Uncertain" (`strings.setupHold.window`), "the window" (`strings.setupHold.late`). Shared with 2-A25.

**1-A18 — upheld.** Caption exact. Walk, `dff` scope: parts `notClk` (100,20), `master` (200,20), `slave` (300,20); the CLK wire to the slave's EN is `M 44 32 H 58 V 52 H 300`, running along y=52 through the inverter's symbol and straight through the master's box, where the master's Qb port sits at (260,52); the `notClk.y` wire `M 160 40 H 168 V 52 H 200` shares the segment x 168 to 200 with it; D's wire `M 44 92 H 64 V 36 H 200` crosses the inverter at y=36. No `placed()` positions for `dff`. This is the explanation's main figure. Not shared.

**1-A19 — upheld.** Quote exact (`phases[4]`). Walk at time 550 and 560: the values table reads CLK 0, D 0, master Q 1; `notClk.y` is 1 (master open); master Q falls at 580 (`lesson-facts.test.ts` pins "580:0"). The script changes D at 300 and 550, both while CLK is 0. Phase 1 ("CLK rose at time 100...") is shown at 200 and 210 with CLK 0; phase 3 ("CLK rose at time 400...") at 500 and 510 with CLK 0. Shared with 2-A1 and 2-A2.

**1-A20 — upheld.** Quote exact (`internalsAfter`). The previous section's numbers are 30 (setup), 0 (hold), 30 (Q after the edge), 25 to 15 (band), 10 (gate delay), 10 (miss threshold); "10" is unassignable. Shared with 2-A3.

**1-A21 — upheld.** Quotes exact. Walk: the D latch explorer's table (failure experiment) carries the note "Removes the forbidden input by never letting S and R both be 1."; the explanation's `table-d` repeats it; `table-sr` names the row "Forbidden" after both; `faultLabLead` and the hardware note say "the combination to avoid". `tableSrLead` reads out the table's four rows. Shared with 2-A14 and 2-A20.

**1-A22 — in part.** Quotes exact. The table words ("D flip-flop (edge-triggered)", "Captures 0") against the prose's "takes D": upheld, though "captured" does reach the page once in the setup-hold status line. The `always_ff` half is weaker: the two sentences together are right, and only the first read alone over-assigns the edge to the keyword; a learner is unlikely to stop between them. Shared with 2-A19.

**1-A23 — upheld.** Quotes exact. `index.ts` orders remember then registers; registers' question is keeping four bits, and its reflection asks about "a new value from Q", deferring that circuit. The pre-answer of the reflection is partial (registers adds the enable and the reset), and "later lessons say more" about hold time is met by one parenthesis in registers' hardware note, a claim about lessons that do not yet exist. Shared with 2-A17.

**1-A24 — upheld.** Every quote found: `buildDLatchLead`, `dLatchExplorerLead` and its caption, `faultLabLead`, the fault label, `c3Task`, `setupHoldLead`, and `introduces` lists "hold". Three meanings, one of them the rationed term, in the same sections. Shared with 2-A9.

**1-A25 — upheld.** Quotes exact. Four causes of X (no information, oscillation, an undecided race, a cut wire) with no sentence joining them. Low severity is right. Shared with 2-A8.

**1-A26 — upheld.** Quotes exact. `simulator.ts` header: the settle model "is order-independent, so a race the circuit cannot decide does not get decided by which gate the code happened to visit first"; the fault lab runs that model and shows X. The only grain of truth is the delay model, where `timing.test.ts` records that "a tie is decided by event order"; the note says "every race" and names no model. Not shared.

**1-A27 — upheld.** All four quotes exact; "the course's flip-flop" appears three times (`dLatchExplorerLead` twice, `asTextLead` once); "view" against "model" confirmed in `asTextAfter`. Low severity is right. Not shared.

**1-A28 — upheld.** `CircuitExplorer.tsx` renders "Release all at once" unconditionally (walk: present on `loop-two` and `loop-three`). The text challenge's initial text is the module header, so `HdlPanel` elaborates it at once and shows "the output Q is never assigned (line 1)" before any typing (walk confirmed). Not shared.

**1-A29 — in part.** Quotes exact and "two-stage latches" appears nowhere else in the lesson (grep): that part is upheld. But style rule 7 bans sentences, colons and unanswered questions, not lists, and a list of three topics does name what the section contains; "How a circuit remembers" heads the section that poses that question, which is what it contains. Shared with 2-A23.

**1-A30 — in part.** The order (inverter loop, SR latch, D latch, master-slave flip-flop, setup, hold, metastability) matches the textbook order as far as I can recall it; I could not check the book either. But the lesson's `originalityNote` already names that sequence as the textbook example and claims difference in framing only, so the reviewer's question is answered by the note; what remains is whether CLAUDE.md's rule against mirroring a chapter order is met when the circuits' dependencies leave few other orders. That is the author's call, not a fact. Not shared.

## Review 2, Lesson A (`remember`)

**2-A1 — upheld.** Quote exact (`phases[4]`). Walk at time 560: table CLK 0, D 0, master Q 1; `notClk.y` is 1 so the master's EN is 1; master Q falls at 580 (`lesson-facts.test.ts`: "580:0"). Q stayed 1 because the slave was closed, as the reviewer says, and the same text goes on to say CLK fell at 500. Shared with 1-A19.

**2-A2 — upheld.** Quote exact (`internalsLead`). The script in `remember.ts` changes D at 300 and 550; CLK is 0 from 200 to 400 and from 500 to 700, so neither change is while CLK is 1. The flip-flop challenge's test step "D changes while the clock is high" exists (`remember.ts`). The figure never shows the sentence's mechanism. Shared with 1-A19.

**2-A3 — upheld.** Quote exact. The previous section states 30 (setup) and zero (hold); 10 appears as the gate delay and as the miss threshold. Shared with 1-A20.

**2-A4 — upheld.** Quote exact. "slave" is first explained in `internalsLead`, below; "the slave's latch" names a latch's latch. Shared with 1-A14.

**2-A5 — upheld.** All three status lines reproduced by the walk; no axis labels (0 `tick-label`, 0 `mark-label` at 1280; same component at 375); 1000 appears nowhere on the page. Shared with 1-A15.

**2-A6 — upheld.** Quote exact. Walk: third press at 20 units gives "Roll 2: Q became undecided at 1020, settled to 0 at 1066." again, and the Rolls list holds one entry per offset, so Roll 1 is gone. `SetupHold.tsx` confirms both. Shared with 1-A16.

**2-A7 — upheld.** Both quotes exact. `Prediction.tsx` draws no circuit before or after commit (walk: 0 `svg.circuit`). The learner is asked about a circuit they cannot see. Shared with 1-A2.

**2-A8 — in part.** Quotes exact and the two senses (no information; never settles) are stated without a sentence joining them: upheld. The claim that the option "The simulator cannot decide (X)" is wrong for the no-information case is over-called: a simulator with nothing to go on cannot decide either, and the option is the lesson's one word for X. Shared with 1-A25.

**2-A9 — upheld.** Quotes exact (caption, `buildDLatchLead`, `setupHoldLead`, `D_LATCH_TABLE`), and `introduces` lists "hold". Shared with 1-A24.

**2-A10 — upheld.** Quote exact; the objective is quoted exactly; no sentence gives hold time a plain meaning; "simply" is there. Shared with 1-A13.

**2-A11 — in part.** Quotes exact and the facts hold: the investigation draws the named gates and the challenge's ladder treats the circuit as unknown. But the loop's order (investigate, then construct) is the lesson format, and the originality note describes the learner building the latch before it is named; a different arc would be a design change rather than a correction. Shared with 1-A7.

**2-A12 — upheld.** Quote exact (`c4Task`). Grep of `remember.prose.ts`: the only `assign` lines are in hints 3 to 5; `asTextLead` shows `always_ff` only; the `as-text` figure generates the `always_ff` line (walk); the drawing challenges' "As text" panel is a `<details>` closed by default (walk: `open: false`). Not shared.

**2-A13 — upheld.** Quotes exact and consecutive. Shared with 1-A3.

**2-A14 — upheld.** Walk: the explorer's table and `table-d` both show the note; `tableDLead` says the same in its own words. Low severity is right. Shared with 1-A21.

**2-A15 — upheld.** The lead's four jobs are all there in `dLatchExplorerLead`, the clock defined before the race, the inverter unexplained until `internalsLead`. Shared with 1-A12.

**2-A16 — upheld.** Quote exact; the figure's `libraryId` is `d-latch`, one latch. Shared with 1-A12.

**2-A17 — upheld.** Quote exact; `index.ts` orders registers next; its reflection defers the next-value circuit. Shared with 1-A23.

**2-A18 — upheld.** Quote exact. Walk under "Feedback wire cut": the gates swap sides and no wire is drawn for the cut net at all; `norLight`'s symbol has no input leads, so the "short dashed stub" could not be found, but nothing marks the cut, which is the point. Shared with 1-A11.

**2-A19 — in part.** Table words exact. "edge-triggered" and "No edge: unchanged" are indeed nowhere in the prose, and the prose says "takes D". But "Captures" is not a word the page never uses: the setup-hold status line reads "Q captured 1 at 1030." The mismatch with the prose stands; the "never" does not. Shared with 1-A22.

**2-A20 — upheld.** Quotes exact; "input" means a pin everywhere else on the page. Shared with 1-A21.

**2-A21 — upheld.** Walk: typing an `always_ff` line into the latch challenge shows "This lesson has not met `always_ff @(posedge clk)` yet." (`gate.ts`), on a page whose generalisation figure shows that line and says "You are not asked to write this yet." Not shared.

**2-A22 — upheld.** Quote exact. Walk at 375 (scroll box 317 px wide): `slave` starts at x=300 and is cut, Q and Qb at x=400 are off; the setup-hold diagram is 716 px wide, so Q's change at 1030 sits at about x=384, off-screen; no string on either page mentions scrolling. Not shared.

**2-A23 — in part.** Quotes exact. As for 1-A29: list headings do name their contents and rule 7 does not ban them; "How a circuit remembers" heads the question section, which poses that question. The weaker point stands only as taste. Shared with 1-A29.

**2-A24 — upheld.** Quote exact; `setupHoldLead` states "Setup time in this model is 30 units." before any interaction, so "find" is "read". Low severity is right. Not shared.

**2-A25 — upheld.** Quote exact; the button is absent at the default offset (walk) and appears only inside the band (`inWindow`). Shared with 1-A17.

## Review 1, Lesson B (`registers`)

**1-B1 — in part.** Quote exact. No challenge asks for the plain four-bit register: it is given in the investigation and written as text. But the shift-register challenge does have the learner wire four flip-flops to one clock, which the lesson itself calls "the same flip-flops wired in a chain", so "build ... from flip-flops sharing one clock" is half met; the mismatch is with the register the objective means. Shared with 2-B21.

**1-B2 — in part.** Quotes exact: the three examples recur in the same order, and the drawing instructions differ by a few words. The examples are a repeat worth a pointer. The repeated tool instructions help a learner who did lesson A some time ago, so cutting them would make the page different, not better. Not shared.

**1-B3 — upheld.** Quote exact; both ends of `0110` are 0, so the example cannot show which end is bit 3. Shared with 2-B2.

**1-B4 — upheld.** All four quotes exact. Lesson A's prose never says "timing diagram" (the words exist only as SVG titles); A says "the clocked view", B "the clocked model"; A says "master", B's `p3Explain` says "the first latch"; A gives hold time only as "zero", B adds "(its hold time)". Not shared.

**1-B5 — in part.** Quotes exact. The carried-over word is real: the only reset the learner has met is the latch's R, and B flags EN's difference but not reset's until `keepClearBitLead`. The hardware-note contradiction is weak: the latch's R is a latch input, not "a reset that acts the moment RST rises" on a register, which is what the note denies modelling. Not shared.

**1-B6 — upheld.** Quote exact; "word" is used in the lead's first sentence and defined in its last. Shared with 2-B4.

**1-B7 — upheld.** Every quote found (`question`, `motivation`, `fourFlipFlopsLead`, `fourFlipFlopsAfter`, `p2Question`, `construction`, `gatedClockAfter`, the title). "keep a word" (store) and "keep the word" (retain instead of taking D) sit one paragraph apart. Not shared.

**1-B8 — upheld.** Quote exact. Walk: opening `ff3` shows the same auto-laid drawing as 1-A18, wire for wire (`M 44 32 H 58 V 52 H 300` through the master box). Low severity is right. Not shared.

**1-B9 — upheld.** Walk: "Release all at once" is on `four-flip-flops`, `gated-clock` and `keep-clear-bit`, and no lesson sentence mentions it; the table lists D0, D1, D2, D3, CLK, Q0 to Q3, while the drawing has ff3 on top (`fourFlipFlopsCircuit` places row 1 for bit 3) and the prose writes bit 3 first. Not shared.

**1-B10 — upheld.** Quotes exact: `construction`, `gatedClockAfter` (twice), `reflection`, plus `c1Hints` and `c1Task`. Shared with 2-B11.

**1-B11 — upheld.** Quotes exact. Walk at 1280: hovering a KEEP, CHOICE, LOAD or GCLK wire shows "KEEP = X", "GCLK = 0" and so on under the drawing; clicking it clears the line. At 375 with touch: a tap on the GCLK wire shows nothing, and so does a second tap; a bare click event with no hover does show it, so the toggle in `CircuitView.tsx` (`onClick` flips what `onMouseEnter` set) is the cause. Code first. Shared with 2-B1.

**1-B12 — upheld.** Quotes exact; every outcome and count is in the lead before the figure. Low severity is right. Shared with 2-B22 (same lead, same fix, different diagnosis).

**1-B13 — upheld.** Quotes exact: "flip-flop ff" is the fifth item under "these gates"; the GCLK sentence names the name it sends the learner to find. Not shared.

**1-B14 — upheld.** Quotes exact (`gatedClockLead`, `TIME_MODEL_NOTES.clocked`, lesson A's `asTextAfter`). In the clocked model a press raises and lowers CLK in one go (`clockCycle`), so inputs change only while CLK is 0; "between clock edges" does not say that, and a learner can take the time while CLK is 1 as between edges. Low severity is right. Not shared.

**1-B15 — upheld.** Quote exact. GCLK = CLK AND EN: EN rising while CLK is 1 makes a rising edge; EN falling makes a falling edge, which the flip-flop ignores. The sentence says "a change". Not shared.

**1-B16 — upheld.** All uses found in `keepFaultsLead` and the figure: the LOAD wire, the check names, "load enable", and "the edge loads 0" while LOAD is 0. Not shared.

**1-B17 — upheld.** Quote exact; in the built bit D is both the circuit's input and the flip-flop's pin, and `c1Hints[0]` uses it both ways. Shared with 2-B3.

**1-B18 — upheld.** All five quotes exact (`motivation`, `p2Explain`, `explanation`, `keepClearBitLead`, `modelVsReality`). Low severity is right. Not shared.

**1-B19 — upheld.** Quote exact. `registerCircuit(4, { enable: true })` builds each bit's enable from `enableMux` and `holdBuf` inside the flip-flop (`flipflop.ts`), not from `andLoad`, `andKeep` and `orChoice`; `CircuitText.tsx` renders `CircuitView` without `onScope`, so the block has `role="img"` and cannot be opened (walk). Shared with 2-B15.

**1-B20 — upheld.** Quotes exact; the generated block holds one line (walk: `begin if (EN) Q <= D; end`); "block" is a drawn part elsewhere on the page; "range" is undefined. Not shared.

**1-B21 — upheld.** All quotes found; "Stepped" is the badge for the settle model. Shared with 2-B10.

**1-B22 — upheld.** Quotes exact. The lesson's question does not ask for a chain; `predictChainLead` opens with the previous lesson's question; `p3Explain` (the mechanism) is rendered only after commit (`Prediction.tsx`); the lead and the task text give the wiring before the build. Shared with 2-B20 (same point: the chain has no job in this lesson's question).

**1-B23 — upheld.** Quote exact; the prediction draws nothing (walk: 0 SVGs before commit). Low severity is right. Shared with 2-B5.

**1-B24 — upheld.** `c3Hints[2]` is the one-line flip-flop; the generalisation figure has just shown the same line inside `begin ... end`; the step the learner lacks is the `if`/`else if`, which rung 4 gives. Not shared.

**1-B25 — upheld.** Walk: the editor opens with "the output Q is never assigned (line 1)". Not shared (same point as 1-A28, in lesson A).

**1-B26 — in part.** As for 1-A30: the order matches the textbook order as far as I can recall it, and the lesson's `originalityNote` already names that sequence as the textbook example and claims difference elsewhere (the display task, the enable-leaves-Q-unknown prediction, the gated-clock experiment). Whether the rule is met is the author's call. Not shared.

## Review 2, Lesson B (`registers`)

**2-B1 — upheld.** Quotes exact. Walk: hover shows "GCLK = 0", a click clears it, a touch tap shows nothing (twice). `CircuitView.tsx` toggles on click what hover set. Shared with 1-B11.

**2-B2 — upheld.** Quote exact; both named bits are 0. Shared with 1-B3.

**2-B3 — upheld.** Quote exact; D is the circuit's input and the flip-flop's pin in the same paragraph. Shared with 1-B17.

**2-B4 — upheld.** Quote exact; the definition is at the end of the same lead. Shared with 1-B6.

**2-B5 — upheld.** Quote exact; `Prediction.tsx` draws nothing before commit. Shared with 1-B23.

**2-B6 — in part.** Quote exact. Walk with the reference text: the drawing shows `CONST const1`, two `MUX Q_mux` symbols and a `register Q_reg` block with ports D, CLK and Q only (`elaborate.ts` builds a `mux2` per `if` and a `register` whose composite exposes D, CLK, Q). The selector is indeed never introduced and the block lacks RST and EN. But "never introduces ... a constant" is wrong: `keepFaultsLead` says "CONST with value 0 replaces KEEP in the drawing", and the fault lab draws one. Not shared.

**2-B7 — upheld.** Walk: the editor's computed `font-variant-ligatures` is `normal`, because `textarea { font: inherit }` (`app.css` line 77) comes after the `font-variant-ligatures: none` rule at line 54 and the `font` shorthand resets it; a screenshot of the editor shows `Q ≤ D;`, and two spans with `normal` and `none` render differently. Code first. Not shared.

**2-B8 — upheld.** Caption exact. Walk: the table has no "Now" column and no `row-current` after RST and Clock CLK. `rowFor` matches a row's input text against the pin's "0"/"1", and the CLK column holds "↑" and "—", so no row can match; the D latch explorer's table does mark "Applies now" (walk). Not shared.

**2-B9 — upheld.** Quote exact; "it never changes when the clock arrives" reads either way. Not shared.

**2-B10 — upheld.** All quotes found; lesson A's "Settled in 2 steps." confirmed. Shared with 1-B21.

**2-B11 — upheld.** Quotes exact (four statements plus the hint). Shared with 1-B10.

**2-B12 — upheld.** Quotes exact; the note renders under the keep-clear-bit table (walk). Not shared.

**2-B13 — upheld.** Checked against `c2Hints`: rung 1 names the same connections as rung 5, and the task's second paragraph says what each output takes at an edge. Details withheld. Not shared.

**2-B14 — upheld.** Checked against `c1Hints[2]`: the rung gives the whole gating mechanism rather than a smaller example; lesson A's `c2Hints[2]` has the same shape. Not shared.

**2-B15 — upheld.** Quote exact; see 1-B19 (`enableMux` inside each flip-flop; block not openable). Shared with 1-B19.

**2-B16 — in part.** Quote exact and the fact holds: the page's checker answers "OK. The text describes a circuit." to `Q <= 0;` for the four-bit Q (walk, and `elaborate` returns no message). But that does not contradict the sentence: an unsized literal takes the target's width in `elaborate.ts` (`e.width ?? want`), so the value written is four bits wide, and a sized literal of the wrong width is refused (`widthMismatch`). What the page lacks is a sentence about unsized literals, which it has not used. Not shared.

**2-B17 — upheld.** Walk: `keep-faults` carries the "Clocked" badge and its buttons are "Release all at once" and "Run checks"; the lead of the figure below contrasts itself with figures that have a "Clock CLK" button, which the figure directly above also lacks. Not shared.

**2-B18 — upheld.** Quote exact. Walk at 375 (scroll box 317 px): in `keep-faults` `orChoice` (x=300) is cut and `ff` (400) and Q (520) are off; in `keep-clear-bit` `orChoice` is cut and `andClear` (400), `ff` (500) and Q (620) are off; no scroll cue on the page. Not shared.

**2-B19 — in part.** Quote exact and the pronoun is loose (rule 18): "it" follows "the bit" but means the keep path. The factual half is over-called: with EN forced to 1 the keep path's AND can never pass Q, and with the OR made an AND CHOICE is always 0, so each fault does stop the keep path doing its job, as the lead's own fault paragraphs say. Not shared.

**2-B20 — in part.** The chain has no job in the display story and is motivated by the previous lesson's question: true, and 1-B22 says the same. But the second half of the direction ("keep it as the answer to that question and say so") is already met: `predictChainLead` opens by quoting that question. The originality half is a judgement the `originalityNote` has already made explicitly. Shared with 1-B22.

**2-B21 — in part.** Quote exact; see 1-B1: the plain register is never built by the learner, but the shift-register challenge does wire four flip-flops to one clock. Shared with 1-B1.

**2-B22 — upheld.** `keepFaultsLead` does carry the gate list, the step list, the comparison, the wire readout, the keep path and three fault outcomes before the figure. Shared with 1-B12 (same lead, same fix).

## Totals

| Lesson | Review | Findings | Upheld | In part | Rejected |
|---|---|---|---|---|---|
| A (`remember`) | 1 | 30 | 25 | 5 (A1, A7, A22, A29, A30) | 0 |
| A (`remember`) | 2 | 25 | 21 | 4 (A8, A11, A19, A23) | 0 |
| B (`registers`) | 1 | 26 | 22 | 4 (B1, B2, B5, B26) | 0 |
| B (`registers`) | 2 | 22 | 17 | 5 (B6, B16, B19, B20, B21) | 0 |
| All | both | 103 | 85 | 18 | 0 |

No finding was rejected outright: every quote was on the page or in the lesson text, and every
checked fact held. The eighteen partial verdicts are findings whose quote and fact hold but whose
conclusion over-reaches (a preview objective, a copy-the-figure build that the lesson's loop
intends, a "never" the page contradicts once, a constant the fault lab had introduced, an unsized
literal that is not a counter-example, a shift register that already says what it answers, and
the two originality notes that already concede the sequence).

## Findings the two reviews share

A shared finding is one the other review also makes about the same lesson and the same quote or
the same point, so that one fix would settle both. Three findings of Review 1 each cover two of
Review 2's.

Lesson A, 18 shared points (18 findings of Review 1, 21 of Review 2):
1-A2/2-A7, 1-A3/2-A13, 1-A7/2-A11, 1-A11/2-A18, 1-A12/2-A15+2-A16, 1-A13/2-A10, 1-A14/2-A4,
1-A15/2-A5, 1-A16/2-A6, 1-A17/2-A25, 1-A19/2-A1+2-A2, 1-A20/2-A3, 1-A21/2-A14+2-A20,
1-A22/2-A19, 1-A23/2-A17, 1-A24/2-A9, 1-A25/2-A8, 1-A29/2-A23.

Lesson B, 11 shared points (11 findings of each):
1-B1/2-B21, 1-B3/2-B2, 1-B6/2-B4, 1-B10/2-B11, 1-B11/2-B1, 1-B12/2-B22, 1-B17/2-B3,
1-B19/2-B15, 1-B21/2-B10, 1-B22/2-B20, 1-B23/2-B5.

Shared points in all: 29 (29 findings of Review 1, 32 of Review 2). Distinct findings across both
reviews: 56 + 47 − 32 = 71, of which 27 are Review 1's alone (12 in A, 15 in B) and 15 are
Review 2's alone (4 in A, 11 in B).

The findings only one review made that survived with the highest severity: Review 1's 1-A4 (the
stepped view shows a definite value under an X status), 1-A5 (the two-button drawing's shared
wire track), 1-A18 (the flip-flop's inner drawing), 1-A26 (the hardware note on races); Review 2's
2-B7 (the `<=` ligature in the editor) and 2-B8 (the register-bit table can never mark a row).
