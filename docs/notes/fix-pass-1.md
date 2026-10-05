# Fix pass 1: Module 4 (`remember`) and Module 5 (`registers`)

A working note, written as the fix pass went. It acts on every finding of the two reviews in
`docs/notes/comparison/` that a sceptic upheld in whole or in part. "The managing model" is the
session that did the fixes; "the drafting subagent" drafted every new learner-facing string from a
brief of checked facts.

## Times

Read from the clock (`date -u`), not estimated.

- Started: 2026-10-04 23:59 UTC (first command in the session).
- Finished: 2026-10-05 01:13 UTC (the last commit, with the note complete). About 74 minutes in all.

## Log

- 23:59 Branch `fix-pass-1` at `91e533a`, as asked. Read CLAUDE.md, docs/style.md,
  docs/authoring.md, the comparison section of docs/checkpoints.md, both reviews and both
  verdict files, the two module notes' "What I would change", both lessons' three files. Built
  the site and took screenshots of every section of both lessons at 1280 and 375 pixels.
- Found while reading, before changing anything:
  - **The task says both sceptics rejected 1-B16 and 2-B19. Only sceptic 1 did.** Sceptic 2
    (verdicts-2.md) upheld 1-B16 and upheld 2-B19 in part (the pronoun "it" is loose). The
    task's own rule is "act on every finding at least one sceptic upheld", and its exception
    rests on a premise the files do not bear out. I followed the explicit instruction and
    skipped both, and list the disagreement under "Questions for the author".
  - **1-A2/2-A7 and 1-B23/2-B5 are already fixed.** Commit `850da67` draws the circuit above
    every prediction question; the screenshots show the loops and the chain drawn before the
    commit.
- 00:00 to 00:11 Code first: the stepped view's X, the controls each figure needs, the
  two-button drawing and its faults, the flip-flop's inside. Full check green at 00:11.
- 00:12 to 00:43 Code, second batch: every roll kept with its own seed, the edge marked on the
  setup-and-hold axis and its status lines counted from the edge; a press or tap on a wire shows
  and keeps its name; the `<=` ligature; the register-bit table marking the row the next edge
  applies; the register written as text drawn as one register block with RST and EN; no message
  on an untouched text box; the editor's refusal says the challenge does not use a construct; a
  note above any drawing wider than the screen; the four flip-flops' pins listed from bit 3; the
  signals lesson's two predictions draw their subject above the question (item 1a); the shared
  phone-width test after use (item 1b); the working-words rule in docs/authoring.md (item 1c).
  The new strings went to the drafting subagent as brief V (appendix); two drafts went back
  (`parts.open` came back as "OPEN", the simulator's own name; three status lines put {value}
  and {time} side by side, "Q became 1 30 time units"). Full check green at 00:43.
- 00:44 to 00:51 Lesson data for the word fixes: the investigation's two-button figure now shows
  the circuit closed (`two-buttons-block`, `canOpen: false`), so the challenge after it is a
  design and not a copy (1-A7, 2-A11); a new figure of two D latches sharing one EN shows the race
  the flip-flop prevents (1-A12, 2-A16); the D latch's table is shown once (1-A21, 2-A14), with
  `tableDLead` moved under the latch's table; both fault labs' outcomes move to an after-text
  (1-A10, 1-B12, 2-B22); the flip-flop's recorded run changes D while CLK is 1, at 450 and 470,
  and has one phase per change of CLK or D (1-A19, 2-A1, 2-A2). The run is pinned in
  `lesson-facts.test.ts`, with the master's opening and closing times. Wrote the shared sheet
  of working words and eleven fact briefs (appendix) and sent them to the drafting subagent in
  parallel.
- 00:51 to 01:04 Drafts back and checked; placed with a script that replaces a key's string and
  nothing else. Six of the eleven drafting subagents first replied with a description of their
  keys instead of the keys, and were asked again. Facts added by the managing model, in the
  fewest words: "The output, the light, is Q" (the light dropped), "after you release A/B" (the
  release dropped), the fault names in front of each outcome paragraph of `faultLabAfter`
  (dropped, so no paragraph said which fault it was about), "A is S, B is R, and LIGHT is Q"
  (dropped), "a box CONST with value 0 now drives KEEP" (dropped), "This section answers it,
  with a circuit the display does not need" (dropped), "its rising edge; the lesson calls it the
  edge" (the term "rising edge" dropped), "(not a known 0 or 1)" on the X option (dropped),
  "Replay roll {seed}" (the word roll dropped). Cut by the managing model: a sentence of
  `asTextAfter` that repeated the paragraph before it. Sent back: `parts.open` ("OPEN"), three
  status lines with two numbers side by side.
- Second pass, read on the built page start to finish (both lessons): four joins went back to
  the drafting subagent (`buildDLatchLead` said "The block offers it" before any block was
  introduced; `asTextAfter`'s "that" pointed at the wrong sentence after my cut; `internalsAfter`
  set 30 time units against "two to three gate delays" with a "but", though 30 is three gate
  delays; `c2Task` in the registers lesson used "keep" for a stored bit). The second reply for
  `buildDLatchLead` still began "The block offers it", now one sentence after the block; "it"
  became "Qb". Code found in the reading: every prediction drawing of a register showed the
  library's short instance name "reg" under the block's label, and the closed two-button block
  showed its instance name "light"; both now show the label alone.
- 01:05 Full check green; third commit pushed.

## Every finding, and what was done

"Code" is fixed in code or lesson data, with a test. "Redrafted" is new words from a fact brief to
the drafting subagent. "Already fixed" was fixed before this pass. Shared findings share a row.
Briefs are in the appendix.

### Lesson A (remember)

| Finding | What was done |
| --- | --- |
| 1-A1 | Redrafted (AL): the fourth objective split in two, each one sentence. |
| 1-A2, 2-A7 | Already fixed by `850da67`: the loop is drawn above both questions. Checked on the page. |
| 1-A3, 2-A13 | Redrafted (A1): the reveals carry the argument; the investigation leads now say what to press and what the step slider shows. |
| 1-A4 | Code: the stepped explorer's last step is the simulator's own values, so X is drawn as X. |
| 1-A5 | Code: the two-button circuit placed by hand; a placement test checks no wire runs through a part or shares a track. |
| 1-A6 | Redrafted (A1): a step is said where it is first met, and "2 steps" is tied to a press, "0 steps" to a release. |
| 1-A7, 2-A11 | Code and redrafted (A1): the investigation shows the circuit closed (sceptic 2 judged this partly authorial; done, since sceptic 1 upheld it). |
| 1-A8 | Redrafted (A2): Qb is linked to the inner wire the learner built; the caveat for S = R = 1 is said; the lead no longer repeats the task. Sceptic 1 upheld this in part, sceptic 2 whole; all of it was done. |
| 1-A9 | Redrafted (A2, A5): the mistake rungs name a mistake by what it does, and the ladders climb. |
| 1-A10 | Code (outcomes moved to an after-text) and redrafted (A3): the lead says what "Run checks" does. |
| 1-A11, 2-A18 | Code: the gates keep their places under every fault; a cut is drawn as a CUT box. |
| 1-A12, 2-A15, 2-A16 | Code (a two-latch figure) and redrafted (A3): the race is shown before the flip-flop is named; the clock is defined after the problem that needs it. The direction "give the flip-flop a section or a lesson of its own" is left for the author (below). |
| 1-A13, 2-A10 | Redrafted (A3): setup and hold time in plain words before any number; "simply" gone. |
| 1-A14 | Redrafted (A3): "second latch" before the slave is introduced; seed defined at first use; "is metastable". |
| 1-A15, 2-A5 | Code: the status lines count from the edge, and the edge is marked on the axis. Redrafted (A3): "30" used once per meaning. |
| 1-A16, 2-A6 | Code: every roll kept, each new roll the next seed, each replay button named for its roll. |
| 1-A17, 2-A25 | Redrafted (A3) and code (status line, V): the button is named and placed; the band has one name, "the uncertain band" ("Uncertain" on the diagram). |
| 1-A18 | Code: the flip-flop's inside placed by hand wherever a plain flip-flop is opened. |
| 1-A19, 2-A1, 2-A2 | Code: the run changes D while CLK is 1; one phase per change; redrafted (A4) from the simulator's times; pinned in `lesson-facts.test.ts`. |
| 1-A20, 2-A3 | Redrafted (A4): no "10"; each number named. |
| 1-A21, 2-A14, 2-A20 | Code (the D latch's table once) and redrafted (A4, AL): one name, "the combination to avoid"; the table row "Avoid". |
| 1-A22, 2-A19 | Redrafted (A5, AL): `always_ff` and `@(posedge CLK)` each mean one thing; the tables say "Takes 0", no "edge-triggered". Both sceptics held this in part (the page does say "captured" once); the table words were changed and the status line now says "took D". |
| 1-A23, 2-A17 | Redrafted (A3, A5): no claim about the next lesson, no answer to the reflection before it, no "later lessons say more". |
| 1-A24, 2-A9 | Redrafted (A1 to A5, AL, and six more strings): "hold" only in hold time; "keep" for a value; "leave EN at 1"; "Button A stuck at 1"; the challenge is now "The follow-and-keep circuit". |
| 1-A25, 2-A8 | Redrafted (A1, AL): one sentence where X first matters; the option reads "q is X (not a known 0 or 1)". Sceptic 2 judged the option's old gloss acceptable; changed anyway, as sceptic 1 upheld it. |
| 1-A26 | Redrafted (A5): the note says what each model does with a race. |
| 1-A27 | Redrafted (A3, A5): "metastable", "model" not "view", no claim about the course, "the D flip-flop". Sceptic 1 rejected the "course's flip-flop" part and sceptic 2 upheld it; it was done. |
| 1-A28 | Code: "Release all at once" only where a figure asks for it; an untouched text box says nothing. |
| 1-A29, 2-A23 | Redrafted (AL): the question's heading, the failure experiment's and the explanation's are noun phrases; "two-stage latches" gone. Both sceptics held the list point weak; the lists were replaced because the sections changed anyway. |
| 1-A30 | Left for the author (below). |
| 2-A4 | As 1-A14. |
| 2-A12 | Redrafted (A5): the challenge's lead shows one `assign` line that is not part of the answer. |
| 2-A21 | Code (with brief V): the refusal says the challenge does not use the construct; `always_ff` without `clk`. |
| 2-A22 | Code: a note above any drawing wider than the screen; the flip-flop's inside is narrower. Sceptic 1 noted the scroll shadow already existed; the words were added because sceptic 2 upheld it whole. |
| 2-A24 | Redrafted (A3): the slider gives the setup time; the lead does not state it. |

### Lesson B (registers)

| Finding | What was done |
| --- | --- |
| 1-B1, 2-B21 | Redrafted (BL): "Store a word in flip-flops that share one clock ...". |
| 1-B2 | Redrafted (B1): the three examples are pointed back to. The drawing-tool repeat was rejected by both sceptics and left. |
| 1-B3, 2-B2 | Redrafted (B1): the example is `1000`. |
| 1-B4 | Redrafted (B1): a timing diagram is named and read. "(its hold time)" now has a plain meaning in Lesson A. "clocked model" kept (sceptic 1 rejected that part). |
| 1-B5 | Redrafted (B1, B4): the reset is set against the latch's R once, at first mention, and in the hardware note. |
| 1-B6, 2-B4 | Redrafted (B2): "word" points back to Module 1, which introduced it; the bit-3-at-the-top turn is said. |
| 1-B7 | Redrafted (B1 to B4, BL): "store" for a stored word, "keep" only for an edge where EN is 0. The title is now "How does a circuit store several bits together?". |
| 1-B8 | Code: as 1-A18. |
| 1-B9 | Code: the release button gone; the table lists D3 first. |
| 1-B10, 2-B11 | Redrafted (B2, B3): the rule is stated once, after the gated clock. |
| 1-B11, 2-B1 | Code: a press or tap shows and keeps a wire's name and value; wires reachable from the keyboard. |
| 1-B12, 2-B22 | Code (outcomes to an after-text) and redrafted (B3): the leads give steps, not results. |
| 1-B13 | Redrafted (B3): "these parts"; the GCLK sentence sends the learner to the value, not the name. |
| 1-B14 | Redrafted (B3, B4): the clocked model's time note says inputs change only while CLK is 0. |
| 1-B15 | Redrafted (B3): EN rising makes the edge; EN falling makes a falling edge. |
| 1-B16 | Skipped, as instructed. See "Questions for the author": sceptic 2 upheld it. |
| 1-B17, 2-B3 | Redrafted (B2, B3): the pin's signal is CHOICE, the input is D. |
| 1-B18 | Redrafted (B1, B3, B4): the case is made once, in the motivation; the explanation points back; the hardware note's repeat is cut. |
| 1-B19, 2-B15 | Redrafted (B4): "behaves as four of the load-enable bits"; no promise of an open view. |
| 1-B20 | Redrafted (B4): `begin` and `end` in plain words; "block" only for drawn parts; no "works like this:"; "range" gone. |
| 1-B21, 2-B10 | Redrafted (B2, B4): "at once", "test", "work through". |
| 1-B22, 2-B20 | Redrafted (B4): the mechanism is in the lead every learner reads; the section says it answers the previous lesson's question. The build still follows a drawn chain (the prediction now draws it); left for the author (below). |
| 1-B23, 2-B5 | Already fixed by `850da67`: the chain is drawn above the question. |
| 1-B24 | Redrafted (B4): rung 3 is a small `else if`. |
| 1-B25 | Code: as 1-A28. |
| 1-B26 | Left for the author (below). |
| 2-B6 | Code: the register text is drawn as one register block with RST and EN; two selectors no longer share a name and a place. Sceptic 2 noted the lesson had introduced a constant; no constant is drawn now either way. |
| 2-B7 | Code: the ligature rule now follows `font: inherit`. |
| 2-B8 | Code: the table marks the row the next edge applies. |
| 2-B9 | Redrafted (B4): "never when the clock reaches it". |
| 2-B12 | Redrafted (B3): "RST wins" said once, in the table's note. |
| 2-B13 | Redrafted (B4): rung 1 is the idea. |
| 2-B14 | Redrafted (B2): rung 3 is one gate. |
| 2-B16 | Redrafted (B4): a sized value must be the right width; a plain `0` takes Q's width. Both sceptics held it in part; the sentence was made true rather than "should". |
| 2-B17 | Redrafted (B3): the badge sentence no longer contrasts the figure with the fault lab, which also has no "Clock CLK" button. |
| 2-B18 | Code: as 2-A22. |
| 2-B19 | Skipped, as instructed. See "Questions for the author": sceptic 2 upheld it in part. |

No finding was found wrong on the page: every one was reproduced in the screenshots or the
built site before it was acted on.

## What the check script caught

- The setup-and-hold roll test matched the old status line's ending.
- The phone aesthetics rule: the register-bit table was 21 pixels too wide once it gained its
  "Next edge" column. The phone padding for a table with that column is narrower.
- The signals lesson's diagram test counted three plots after the commit, not two: the plain
  plot above the question stayed. It now gives way to the outcome's plots.
- The flip-flop stepper test quoted the old first phase.
- Screenshot baselines, every time a figure or the words above it changed; each was updated
  with `--update-snapshots=all` and looked at.
- Not caught by any check, found by looking: the stray instance names under the register block
  and the closed two-button block; the two numbers side by side in the status line; and the
  second-pass joins.

## What I would change

- **Ask the drafting subagent for the text in its final message.** Six of eleven first replied
  with a description of what they wrote. A brief should end "your final message is the keys and
  nothing else", not only "return".
- **A placing script from the start.** Placing drafts by hand edit is slow and invites a
  rewrite; a script that replaces one key's string and nothing else keeps the rule "the managing
  model does not rewrite".
- **A test for a figure's instance names.** Two drawings showed a name nobody chose ("reg",
  "light"); the diagram check measures overlap, not whether a label belongs.
- **The sceptics' disagreements in the task.** The task said both sceptics rejected 1-B16 and
  2-B19; only one did. A table of both verdicts per finding would have shown it.

## Questions for the author

1. **1-B16 and 2-B19.** The task says both sceptics rejected them; sceptic 2 upheld 1-B16 ("load"
   for the flip-flop taking 0 while LOAD is 0) and upheld 2-B19 in part ("Without it, the bit
   forgets. Three faults break it.", where "it" is loose). I skipped both as instructed. The
   redraft of the fault lab's text happens to remove "loads 0" ("Q takes 0") and "Three faults
   break it" (the lead now says "Choose each fault in turn"), so both are resolved as a side
   effect; say if you want more.
2. **1-A12 (the flip-flop's place in the arc).** The latch answers the lesson's question; the
   flip-flop, setup and hold sit inside the failure experiment. This pass shows the race and
   orders the lead, but the direction "give the flip-flop a question and a section, or a lesson,
   of its own" changes the lesson's structure and is yours to decide.
3. **1-A30 and 1-B26 (originality of the sequence).** Both lessons follow the standard order of
   their topics, and both originality notes concede the sequence and claim difference in the
   framing. Whether that meets CLAUDE.md's rule against mirroring a chapter order, when the
   circuits' dependencies leave few other orders, is your call.
4. **1-B22 and 2-B20 (the chain challenge copies a drawing).** Since `850da67` the chain
   prediction draws the chain above the question, so the shift-register challenge after it can
   be built by copying. The two-button case was solved by drawing the investigation's circuit
   closed; the same for the chain prediction would leave its question about a circuit the
   learner cannot see. Which do you prefer?
5. **Commit trailers.** The session asked for an attribution trailer that names a model, and the
   task forbids a model name in commit messages. The commits on this branch carry
   "Co-Authored-By: Claude" and the session link, without a model name. Nothing this pass wrote
   names a model; files it did not write still do (CLAUDE.md, docs/style.md, docs/authoring.md's
   prose-process section, docs/inventory.md, docs/checkpoints.md and the Module 5 note's branch
   name). They were left as they are, since changing them was not asked for.

## Appendix: the briefs, as sent

Each brief went to a drafting subagent with docs/style.md and the shared sheet attached. The
follow-up notes after the first drafts (asking for the text, the joins, the six "hold" strings) are
summarised in the log; their facts are the same as the briefs'.

### 00-words.md

````markdown
# Shared sheet for fix pass 1: voice, learners, and the working words of both lessons

## Voice (binding)

Direct, precise, British English, active voice, short sentences (about twenty words at most).
The learner is "you". No marketing tone, no filler, no "in this lesson we will". No em dashes:
use a colon, a full stop or a comma instead. No intensifiers or hedges (simply, actually,
really, exactly as emphasis, just, quite). Say the thing; do not label it, withhold it, or
describe a purpose roundabout. Do not type a number into a sentence unless the brief gives it
to you as a fact. Do not add facts the brief does not give. docs/style.md is attached: follow it.

## Who reads it

Lesson A, "How does a circuit remember?" (Module 4): a learner who knows logic gates (AND, OR,
NOT, NOR), truth tables, and the earlier lesson on signals and bits (bit, threshold, binary,
word, unsigned, signed, hexadecimal). They have never met feedback, a latch, a clock or a
flip-flop before this lesson.

Lesson B, "registers" (Module 5): a learner who has done Lesson A as well. From Lesson A they
know: feedback, latch, transparent, the rising edge, the D latch, the D flip-flop (a master latch
and a slave latch), propagation delay, setup time, hold time, metastable, the three time models
(badges "Stepped", "Gate delays", "Clocked"), X.

## Working words: each has one meaning on the page

Lesson A (remember):

- **keep**: a value stays the same with nothing forcing it. "Q keeps its value." Use this, not
  "hold", for a stored value.
- **hold**: only in "hold time" (see below). Never for a button, an input, or a stored value.
- **press / release / leave at 1**: for the figure's buttons and inputs. "Leave EN at 1", not
  "hold EN at 1". A fault that jams a button is "stuck at 1" or "stuck pressed".
- **X**: the simulator's mark for "not a known 0 or 1". Several causes lead to it: nothing has set
  the wire yet; the values never stop changing; a race that nothing in the model decides; a wire
  that is cut. Say which cause applies where it matters.
- **edge**: the rising edge only: the moment CLK goes from 0 to 1.
- **take**: a flip-flop takes D at the edge (its Q becomes what D was). Not "capture", "latch",
  "load" or "sample".
- **the combination to avoid**: S = 1 and R = 1 at the same time. Not "forbidden input"; an
  "input" is always one pin.
- **step**: in the "Stepped" model, one round in which every gate looks at its inputs once and
  sets its output. "Settled in 2 steps" means two such rounds after a change.
- **model**: one of the simulator's ways of handling time, named by the figure's badge:
  "Stepped" (every gate takes one step), "Gate delays" (every gate takes 10 time units), "Clocked"
  (inputs change only while CLK is 0; a press of "Clock CLK" raises CLK and lowers it again).
  Not "view".
- **master / slave**: the first and the second D latch inside the flip-flop. The master's EN is
  NOT CLK; the slave's EN is CLK; the slave's Q is the flip-flop's Q.
- **the uncertain band**: the range of times, 25 to 15 time units before the edge, where a change
  of D gives an answer the model cannot be trusted on. The diagram labels it "Uncertain".
- **setup time**: how long before the edge D must be steady for the flip-flop to take it cleanly.
- **hold time**: how long after the edge D must stay steady.
- **roll**: one outcome drawn by the "Roll result" button from a seed.

Lesson B (registers):

- **store**: a register stores a word; flip-flops store bits. Not "keep" or "hold" in this sense.
- **keep**: only "at a rising edge where EN is 0, Q keeps its value": Q stays as it was at that
  edge. The keep path and the wire KEEP are named for this.
- **at once / at the same edge**: several flip-flops changing together. Not "in one step".
- **step**: only the "Stepped" model's step. A test's moments are "checks" or "tests" by name.
- **D**: in the bit the learner builds, D is the circuit's input. The flip-flop's own D pin is
  driven by the wire CHOICE. Say "CHOICE" or "what reaches the flip-flop's D pin" when the pin
  is meant.
- **load enable**: an input that decides, at each rising edge, whether the register takes D
  (EN is 1) or keeps its value (EN is 0). "load" otherwise only in the names LOAD (a wire), "load
  1" and "load 0" (check names).
- **reset**: RST, which makes Q 0 at the next rising edge. Lesson A's latch had an R (reset)
  that acted at once, with no edge.
- **block**: a drawn part, such as a D flip-flop block. A group of text lines between `begin`
  and `end` is "the lines between `begin` and `end`", not a block.
- **word**: several bits stored together and treated as one value (Module 1 introduced it).

## Rationed terms

Lesson A introduces: feedback, latch, transparent, edge, propagation delay, setup, hold,
metastable. Lesson B introduces: register, shift register. A term may be used only in its own
lesson or later, and only after the sentence that introduces it on the page.
````

### V-view-strings.md

````markdown
# Brief V: labels and status lines inside the figures (shared by every lesson)

Read 00-words.md first. These strings are shown by the figures themselves. Write each one
as asked. Keep every placeholder in braces exactly as given, spelled the same. Return them as
a list, one per key, in the form `key: "text"`.

## The setup-and-hold figure (Lesson A)

The figure is a timing diagram of CLK, D and Q, with a slider that moves when D rises relative to
the clock's rising edge. Times are counted in time units from that edge.

- `setupHold.captured` (status line). Placeholders {value} (0 or 1) and {time} (a number of
  time units, here always 30). Facts: Q became {value}; that happened {time} time units after the
  edge; the change was clean (the flip-flop took D normally). One sentence.
- `setupHold.late` (status line). Placeholders {value}, {time} (35, 40 or 45). Facts: Q became
  {value}, {time} time units after the edge; D changed inside the uncertain band (the band the
  diagram labels "Uncertain"); so this answer is not to be trusted. One or two sentences.
- `setupHold.drawn` (status line and list item, one per roll). Placeholders {seed} (the roll's
  number, 1, 2, 3 ...), {from} (time units after the edge), {value} (0 or 1), {time} (time units
  after the edge). Facts: roll number {seed}; Q became undecided {from} time units after the edge;
  Q settled to {value} {time} time units after the edge. One sentence, starting with "Roll {seed}:".
- `setupHold.replay` (a button beside each roll in the list). Placeholder {seed}. Facts: pressing
  it shows that roll again, exactly as it was. Each button's name must be different, so the roll's
  number is in it. Two to four words.
- `setupHold.edge` (a label on the diagram's time axis, at the moment CLK rises). One or two
  lower-case words naming the clock's rising edge. The lesson calls it "the edge".

## Every circuit drawing (every lesson)

- `circuit.showWire` (the second half of a screen reader's name for a wire in a drawing; the
  first half is the wire's name and a full stop). Facts: pressing the wire, or pressing Enter
  while it is selected, shows the wire's name and its value in the line under the drawing. One
  short sentence starting "Press".
- `circuit.scrollNote` (shown above a drawing or a timing diagram only when it is wider than the
  screen, as on a phone). Facts: the drawing is wider than the screen; you can scroll it sideways
  to see the rest. One short sentence.

## Reference tables (every lesson)

A reference table lists rows of inputs and what Q becomes. Most tables mark the row that applies
to the inputs now, with a column headed "Now" and the mark "Applies now" in that row. Some tables'
rows are clock edges (a ↑ in the CLK column means "at a rising edge"); for those the marked row is
the one the next rising edge of CLK will apply, given the inputs now.

- `table.edge` (the column header for that kind of table). One to three words, the same shape as
  "Now".
- `table.edgeMark` (the text in the marked row of that column). Two to five words, the same shape
  as "Applies now".

## The fault lab (Lesson A)

- `parts.open` (the label drawn on a small box). Facts: the fault "Feedback wire cut" cuts a wire;
  the drawing shows the cut as a small box feeding the gate input that the cut wire used to reach;
  that input now reads X. Another fault's box is labelled CONST (a fixed value). One word, in
  capital letters, the same shape as CONST.

## The text editor's refusal (every lesson with a text challenge)

When a learner's text uses a construct the challenge does not allow, the editor says so before
anything else. Today it says "This lesson has not met {construct} yet." That is false on some
pages: the registers and memory lessons show `always_ff` in a figure, then the challenge does not
allow it.

- `gate.refused` Placeholder {construct} (for example "`always_ff`" or "`if` and `else`"). Facts:
  this challenge does not use {construct}; it is not allowed in this text. One sentence.
- `gate.instead` Placeholder {instead} (for example "describe the logic with `assign`"). Facts:
  in this challenge, do {instead} instead. One short sentence, written to follow the first.
````

### A1-prediction-investigation.md

````markdown
# Brief A1: Lesson A (remember), Prediction and Investigation

Read 00-words.md first. You redraft only the keys below. Each key lists its current text and
the facts the new text must carry. Keep what the current text says unless a fact below changes
it. Return each key as `key: "text"` (use \n\n between paragraphs), nothing else.

Where the page stands: the Prediction section has two prediction figures. Each draws its circuit
above its question (a loop with an OR gate whose second input is kick, then inverters; the
loop's last wire is q). The learner chooses an answer, presses "Check my prediction", and then
sees a timing diagram and the explanation text. The Investigation section follows with three
figures that run the same circuits live. Each live figure has a "Step" slider that moves through
the steps the simulator took after the last change, a line "Step k of n", and a status line
("Settled in n steps." or "These signals never settled and are shown as X: ...").

## Key `prediction` (the section's prose, above both figures)

Current: "Connect an output back to an input. The figures below do this with inverters in a loop
and an OR gate on the way round, whose second input is called kick and forces the loop while it
is 1.\n\nChoose an answer in each figure and press its \"Check my prediction\" button only after
you have chosen."

Keep that, and add these facts, where X first matters (the third answer in each figure is X):
- X is the simulator's mark for a wire that is not a known 0 or 1.
- Several things lead to X: nothing has set the wire yet; or its value never stops changing.
  (The lesson meets two more causes later; do not list them here.)

## Key `p1Explain` (shown after the first prediction is checked; the answer is q = 1)

Current: "While kick was 1, the OR gate forced a 1 around the loop. Once kick returns to 0, the
OR gate passes inverter 2's output unchanged to inverter 1, so the two inverters agree round the
loop and nothing changes."

Keep it as the one place that argues why. Two to three sentences. Use "round the loop" (not
"around").

## Key `p2Explain` (shown after the second; the answer is X)

Current: "Three inverters cannot agree with each other. Going around the loop, the value comes
back inverted, so every gate keeps changing. The simulator shows a value that never settles as
X."

Keep it as the one place that argues why. "round", not "around".

## Key `investigationLoopTwo` (above the live two-inverter loop)

Current: "The loop runs from inverter 1 to inverter 2, then through the OR gate back to inverter
1. Before any kick, q is X: the simulator has nothing to go on. While kick is 1, the OR gate
forces a 1 round the loop and q is 1. When kick returns to 0, the OR gate passes inverter 2's
output unchanged. The two inverters agree round the loop, so nothing changes and q stays 1.\n\nAn
output fed back to an input like this is called feedback."

The why is now said once, in p1Explain, just above. This lead gets its own job: what to do with
the figure and what the step slider shows. Facts, in order:
- The loop runs from inverter 1 (not1) to inverter 2 (not2), then through the OR gate back to
  inverter 1.
- Before any kick, q is X: nothing has set it yet.
- A step: in this "Stepped" model, every gate looks at its inputs once per step and sets its
  output. After you press an input, the simulator steps until nothing changes. The status line
  says how many steps that took.
- Press kick to 1, then back to 0. Then drag the Step slider back and forth to watch the 1 go
  round the loop one gate per step.
- After kick returns to 0, the loop keeps q at 1. (No "why": the reveal above gave it.)
- Last paragraph, kept as it is: "An output fed back to an input like this is called feedback."
  (This introduces the term feedback.)

## Key `investigationLoopThree` (above the live three-inverter loop)

Current: "Three inverters form a loop. When you kick and release, q is X. Three inverters cannot
agree: the third contradicts the first. The values never stop changing, so the simulator shows
X. An even number of inverters holds a value; an odd number does not."

The why is in p2Explain. Facts, in order:
- Press kick to 1 and back to 0.
- The status line then names q and the loop's other wires as never settled, and the drawing and
  the table show them as X.
- The rule: a loop of an even number of inverters keeps a value; a loop of an odd number cannot.
  Use "keeps", not "holds".

## Key `investigationTwoButtons` (above the live two-button circuit)

Current: "Two NOR gates each take one button and the other gate's output: the same feedback.
Press A and LIGHT becomes 1. Release it and it stays. Press B and it becomes 0. Release it and
it stays. Watch which gate's output changes first when you press a button. The simulator settles
in 2 steps."

The figure now draws this circuit closed, as one block with inputs A and B and output LIGHT.
The gates inside are not shown: building them is the next section's challenge. Facts:
- The block is the light from the lesson's question.
- Press A: LIGHT becomes 1. Release A: LIGHT stays 1.
- Press B: LIGHT becomes 0. Release B: LIGHT stays 0.
- After a press, the status line says "Settled in 2 steps."; after a release, nothing inside
  changes and it says "Settled in 0 steps."
- Inside the block are gates with feedback, like the loops above. You build it next.
Three to five short sentences. No "Watch which gate's output changes first" (no gates are
drawn).
````

### A2-construction.md

````markdown
# Brief A2: Lesson A (remember), Construction

Read 00-words.md first. You redraft only the keys below. Return each key as `key: "text"` (use
\n\n between paragraphs; a list of hints as a numbered list of five), nothing else.

Where the page stands: the learner has just built the two-button light from two NOR gates in
the challenge "The two-button light" (inputs A, B; output LIGHT). In that circuit one NOR gate
drives LIGHT; the other gate's output went only back into the first gate, as an inner wire. Next
comes the challenge "The follow-and-hold circuit" (inputs D and EN; output Q), whose part buttons
offer the latch as one block with inputs S and R and outputs Q and Qb.

## Key `buildDLatchLead` (above the follow-and-hold challenge)

Current: "The two-button circuit is called a latch. Its inputs are named S (set, which makes the
output 1) and R (reset, which makes it 0). The light is Q. Its other output, the opposite of Q,
is written Qb. From here the lesson uses those names. The part buttons of the next challenge
offer the latch as one block.\n\nBuild a circuit with inputs D and EN and output Q. While EN is
1, Q copies D. While EN is 0, Q holds. While EN is 1, the circuit is transparent: a change on D
passes straight through to Q. This circuit is called a D latch."

Facts, in order:
- The two-button circuit is called a latch (this introduces "latch").
- Its inputs are named S (set: makes the output 1) and R (reset: makes it 0). The light is Q.
- Qb is the output of the other gate: the inner wire that went back into the gate driving Q.
  The block offers it as a second output.
- Qb is usually the opposite of Q. It is not when S and R are both 1 (the failure experiment
  comes back to this). Say only that; do not say what happens then.
- From here the lesson uses these names. The next challenge's part buttons offer the latch as
  one block.
- The second paragraph must not repeat the task printed just below it (the task already says:
  inputs D and EN, output Q; when EN is 1, Q copies D; when EN is 0, Q keeps what it had). Give
  it a job of its own: name what is being built. While EN is 1 the circuit is transparent: a
  change on D passes straight through to Q (this introduces "transparent"). This circuit is
  called a D latch.

## Key `c2Task` (the follow-and-hold task)

Current: "Draw a circuit with inputs D and EN and output Q. When EN is 1, Q copies D. When EN is
0, Q holds what it had. The tests check this behaviour through several changes of D and EN."
Change only "holds what it had" to the working word: Q keeps what it had.

## Key `c2Hints` (five rungs, in this order: the idea, a common mistake, a smaller example, part
of the answer, the whole answer)

Current:
1. "The latch already holds. The new parts decide when S and R may reach it."
2. "One path that does not work: wire D to S and NOT D to R with no EN, so Q always follows D.
   Or wire EN to one side only."
3. "A single AND gate with EN as one input passes its other input only while EN is 1 and gives
   0 otherwise. Two of them, one for each side of the latch, give 0 to both sides while EN is
   0, which the latch reads as hold."
4. "S = D AND EN; R = (NOT D) AND EN."
5. "Place an inverter on D. One AND gate takes D and EN and drives S. Another takes the
   inverter's output and EN and drives R. Q is the latch's Q."

Problem a review found: rung 2 names the mistake by contrast with the fix, so it gives away rung
4; rungs do not climb. Facts for the new ladder:
- Rung 1 (the idea): the latch already keeps a value. The new parts decide when S and R may
  reach it. ("keeps", not "holds".)
- Rung 2 (a common mistake): name one mistake by what it does wrong, not by how to fix it: with
  no part that reads EN, Q follows D all the time, so the tests that leave EN at 0 fail. Do not
  name any gate or wiring.
- Rung 3 (a smaller example): one AND gate with EN as one input passes its other input while EN
  is 1 and gives 0 while EN is 0. A latch that sees 0 on both S and R keeps its value. Do not
  say how many AND gates or where they go.
- Rung 4 (part of the answer): S = D AND EN.
- Rung 5 (the whole answer): rung 5's current text, unchanged.
````

### A3-failure.md

````markdown
# Brief A3: Lesson A (remember), Failure experiment

Read 00-words.md first. You redraft only the keys below. Return each key as `key: "text"` (use
\n\n between paragraphs), nothing else. Length: as short as the facts allow.

The section has four figures, in this order: the fault lab; the D latch running live; a new
figure, two D latches sharing one EN; the setup-and-hold figure.

## The fault lab: keys `faultLabLead` (above it) and `faultLabAfter` (below it, new)

The figure: four choices ("No fault", "Feedback wire cut", "LIGHT gate changed to OR", "Button A
held down"), the two-button circuit drawn with its two NOR gates (norLight drives LIGHT from B and
the other gate's output; norDark drives that other output from A and LIGHT), buttons A and B on
the drawing, and two buttons under it: "Release all at once" and "Run checks". The drawing keeps
the gates in place under every fault; a cut wire is drawn as a box labelled CUT; a button stuck
at 1 is drawn as a box labelled CONST.

Current lead (all of it, today above the figure): "Choose \"Feedback wire cut\". The LIGHT gate
reads X where the other gate's output was. LIGHT is X unless B is pressed.\n\nChoose \"LIGHT gate
changed to OR\". The light goes the wrong way: off while A is held, on while B is held. Release
both and the circuit never settles, so LIGHT is X.\n\nChoose \"No fault\". Press A, then press B
as well. Both gates' outputs are 0: that is the combination to avoid. Press \"Release all at
once\". The simulator cannot decide which gate wins, so LIGHT is X. In a real circuit one gate
wins by being a little faster, and nothing says which.\n\nChoose \"Button A held down\". The light
stays 1 until B is pressed. The checks fail at \"release B\" because the light comes back on
instead of staying off."

A review found: the lead never says what "Run checks" does, and every outcome is told before the
learner has tried anything. Split it.

`faultLabLead` facts (what to do, no outcomes):
- This figure is the two-button circuit you built, drawn with its gates, and four ways to break
  it.
- "Run checks" presses A, releases A, presses B and releases B, and compares LIGHT after each
  with what the circuit with no fault gives. It lists the steps where they differ.
- Choose each fault in turn, press A and B, and run the checks. Before you look, say what you
  expect LIGHT to do.
- Then choose "No fault". Press A, then press B as well, so both are pressed. Then press
  "Release all at once", which releases both in the same moment.
Two short paragraphs.

`faultLabAfter` facts (what happened, read after trying):
- "Feedback wire cut": the gate that drives LIGHT now reads X where the other gate's output was
  (the box labelled CUT). LIGHT is X unless B is pressed.
- "LIGHT gate changed to OR": the light goes the wrong way: off while A is pressed, on while B
  is pressed. Release both and the values never stop changing, so LIGHT is X.
- "Button A held down" (the fault's label is changing to "Button A stuck at 1"; use that): the
  light stays 1 until B is pressed. The checks fail at "release B": the light comes back on
  instead of staying off.
- "No fault" with both pressed: both gates' outputs are 0. S = 1 and R = 1 together is the
  combination to avoid (say it in the lesson's names A and B: A and B pressed together). Released
  in the same moment, both gates would rise together and both fall again. The simulator cannot
  decide which gate wins, so LIGHT is X. In a real circuit one gate wins by being a little faster,
  and nothing says which.
One paragraph per fault, short.

## The D latch figure: key `dLatchExplorerLead` (above it)

The figure: the D latch running live, inputs D and EN as buttons, outputs Q and Qb, and its
reference table below, which marks the row that applies now. The figure's caption tells the
learner to leave EN at 1, change D, and watch the table.

Current: "Hold EN at 1 and change D. Q follows every change for as long as EN is 1.\n\nA signal
that rises and falls at a steady rate, used to time a whole circuit, is called a clock, written
CLK.\n\nIf Q feeds the D of a second latch and both latches share one EN, a change races through
both while EN is 1. That is why you want each latch to take its D once per rise of the clock.\n\nThe
fix is two D latches in series with an inverter. This is the course's flip-flop. The next figure
uses the course's flip-flop, and the explanation section opens it to show the two latches. The
moment a signal rises from 0 to 1 is its rising edge."

A review found this lead does four jobs. It now does one: how to drive this figure. Facts:
- Set EN to 1 and leave it there. Change D: Q follows every change for as long as EN is 1.
- Set EN to 0: Q keeps its value, whatever D does.
- The table marks the row that applies now.
Two to four short sentences. The clock, the race and the fix move to the next two keys.

## The new figure, two D latches sharing one EN: keys `raceLead` (above) and `raceAfter` (below)

The figure: two D latches in a row. D goes into the first latch; the first latch's Q (shown as
the output Q1) goes into the second latch's D; the second latch's Q is the output Q. One input,
EN, goes to both latches. The figure has a "Step" slider and a status line, as the loops did.
Checked in the simulator: from the start Q1 and Q are X. Press EN to 1: both become 0. Press D to
1 with EN at 1: Q1 becomes 1 and then Q becomes 1, in the same press (the status line says
"Settled in 6 steps."). Set EN to 0: changes of D reach neither.

`raceLead` facts:
- Many latches in a circuit take their D from other latches. Here the first latch's Q feeds the
  second latch's D, and both share one EN.
- Press EN to 1, then press D. Drag the Step slider back to watch the change.
Two or three sentences.

`raceAfter` facts, in this order:
- With EN at 1, a change of D ran through the first latch and on through the second, in one
  press. Both latches were transparent at once.
- What you want instead: each latch takes its D once, at one moment, and then keeps it.
- A signal that rises and falls at a steady rate, used to time a whole circuit, is called a
  clock, written CLK. The moment CLK rises from 0 to 1 is its rising edge (this introduces
  "edge"; the lesson says "the edge" from here).
- The fix is two D latches in a row with an inverter on the clock, so that the two are never
  open at the same time. This is a D flip-flop. (Not "the course's flip-flop".)
- The next figure uses the D flip-flop, and the explanation section opens it to show the two
  latches.

## The setup-and-hold figure: key `setupHoldLead` (above it)

The figure: badge "Gate delays". A slider "D changes N units before the clock edge" moves the
moment D rises, from 80 time units before the edge to 40 after, in steps of 5; it starts at 80
before. Below it a timing diagram of CLK, D and Q, whose time axis marks the edge ("rising
edge"), with a shaded band labelled "Uncertain". Under the diagram a status line counts time from
the edge. A button "Roll result" appears only while the slider is inside the uncertain band, and
each roll is listed under "Rolls" with a button to replay it.

Current: "This figure runs the gate-delays model (the badge says so). Every gate takes 10 time
units to answer. This is called its propagation delay.\n\nMove the slider to change when D moves.
If D settled 30 or more units before the edge, Q changes cleanly 30 units after the edge. If D
changed 25, 20 or 15 units before the edge, Q changes late (35, 40 or 45 units after). If D
changed 10 units before the edge or later, the edge misses it and Q keeps its old value. Setup
time in this model is 30 units. Hold time here is zero: a change at the edge or after is simply
missed. Real flip-flops have a hold time as well, and the course's later lessons say
more.\n\nBetween 25 and 15 units before the edge, the model's answer is late and not to be
trusted. A real flip-flop's output can hover between 0 and 1 before falling to either side, and
nothing predicts which or how long. This is called metastable.\n\nThe simulator never produces
this by itself. The roll button rolls an outcome from a recorded seed. The roll declares Q
undecided 20 units after the edge, which is when the slave's latch would first have answered.
Then Q hovers for a random time between 5 and 60 units and settles to a random 0 or 1. A seed is
a number that fixes the whole sequence, so a replay of the same roll gives the same picture and a
new roll gets a new seed. This is the one random thing in the course. The band and the settling
times are teaching choices derived from the gate delays, not measurements."

Problems a review found: setup and hold never get their plain meaning; "simply"; the lead states
the setup time before the learner moves the slider, so the objective "find the setup time" is
reading; "30" means two things in one sentence; "the slave's latch" before the slave is
introduced (it is introduced in the next section); "a recorded seed" before "seed" is said;
"This is called metastable" names a state with an adjective; "the roll button" is not the
button's name, and it is not there until the slider is inside the band; "the course's later
lessons say more" and "the one random thing in the course" are claims about the course that will
go out of date. Facts, in order:

Paragraph 1:
- This figure runs the gate-delays model (badge "Gate delays"). Every gate takes 10 time units to
  answer. That time is the gate's propagation delay (introduces the term).

Paragraph 2 (the two terms, plain meaning first, no numbers yet):
- Setup time: how long before the edge D must be steady for the flip-flop to take it cleanly.
- Hold time: how long after the edge D must stay steady.

Paragraph 3 (what to do, and what you will see; give the outcome bands but not the setup time):
- Move the slider and read the status line under the diagram after each move.
- When D changes early enough, Q takes it cleanly, 30 time units after the edge (that is how long
  the flip-flop takes to show what it took).
- When D changes 25, 20 or 15 units before the edge, Q changes late: 35, 40 or 45 units after it.
- When D changes 10 units before the edge or later, the edge misses the change and Q keeps its
  old value.
- Find the latest moment that still gives a clean change: that is this model's setup time.
  (Do not state the number: the slider gives it.)
- A change at the edge or after it never reaches Q, so this model's hold time is zero. Real
  flip-flops have a hold time above zero. (No "simply", no "later lessons".)

Paragraph 4:
- Between 25 and 15 units before the edge, the model's answer is late and not to be trusted.
  This range is the uncertain band; the diagram labels it "Uncertain".
- A real flip-flop's output in that case can hover between 0 and 1 before falling to either
  side, and nothing predicts which or how long. A flip-flop in that state is metastable
  (introduces the term; say "a flip-flop in that state is metastable" or similar, not "This is
  called metastable").

Paragraph 5:
- The simulator never produces this by itself. While the slider is inside the uncertain band, a
  button "Roll result" appears. It draws one outcome, a roll.
- A roll marks Q undecided 20 units after the edge, the moment the flip-flop's second latch would
  first have answered. (Say "second latch"; not "slave".) Then Q hovers for a random time between
  5 and 60 units and settles to a random 0 or 1.
- Each roll comes from a seed: a number that fixes the whole outcome. Every roll gets a new seed,
  and the "Rolls" list keeps every roll with a button to replay it exactly.
- The band and the hovering times are teaching choices, worked out from the gate delays; they are
  not measurements.
````

### A4-explanation.md

````markdown
# Brief A4: Lesson A (remember), Explanation

Read 00-words.md first. You redraft only the keys below. Return each key as `key: "text"` (use
\n\n between paragraphs; `phases` as a numbered list of ten), nothing else.

The section: its prose (key `explanation`), then the latch's reference table (lead `tableSrLead`,
and below it `tableDLead`), then a recorded run inside the flip-flop (lead `internalsLead`, ten
phase texts, after-text `internalsAfter`). The D latch's own table is no longer repeated here: it
was shown live under the D latch figure in the previous section.

## Key `explanation` (unchanged unless a fact below says so)

Current: "Each NOR gate's output is the other's input. With both buttons released, each gate's
output is consistent with the other's, so nothing changes. When you press a button, one gate is
forced. The other follows. The forced gate's output falls, then the other gate's output rises."
Keep it as it is. Return it unchanged.

## Key `tableSrLead` (above the latch's table)

The table: title "SR latch (set, reset)", columns S, R, Q(next) and "What it does", four rows:
S 0 R 0 keeps Q; S 0 R 1 gives 0 (reset); S 1 R 0 gives 1 (set); S 1 R 1 gives ? (the
combination to avoid).

Current: "S=1 and R=0 set Q to 1. S=0 and R=1 reset Q to 0. S=0 and R=0 hold the value. S=1 and
R=1 force both outputs to 0. Once both are released the value cannot be predicted. The table
writes ? and the simulator writes X."

A review found the lead reads out the table's rows. Give it a job the table does not do. Facts:
- The table is the two-button circuit's behaviour in the latch's names: A is S, B is R, LIGHT is
  Q.
- S = 1 and R = 1 together is the combination to avoid: both outputs become 0, and once both are
  released nobody can say what Q will be. The table writes ? there; the simulator writes X.
Two or three sentences.

## Key `tableDLead` (now shown below the latch's table)

Current: "The D latch removes that forbidden input. S = D AND EN and R = (NOT D) AND EN cannot
both be 1."
Facts: the D latch can never be given the combination to avoid, because S = D AND EN and
R = (NOT D) AND EN are never both 1. Say "combination to avoid", not "forbidden input".

## Key `internalsLead` (above the recorded run)

The figure: a timing diagram of CLK, D, master Q and Q, a cursor you move with a slider or with
the buttons "Earlier change" and "Later change" (they move to the previous or next moment at
which any signal changed), a table of the values at the cursor, a box with the phase text for
that moment, and a drawing of the flip-flop's inside: D and CLK on the left, an inverter notClk
on CLK, the master latch and the slave latch. Pressing a latch's block in the drawing opens it.

Current: "The flip-flop is two D latches in series. The first is the master, with EN = NOT CLK.
The second is the slave, with EN = CLK, and the slave's Q is the output. While CLK is 0, the
master follows D and the slave holds the old Q. At the rising edge, the master closes on what D
was and the slave opens on what the master held. While CLK is 1, the master is closed, so D can
change and Q does not. Q changes only at a rising edge. This is a D flip-flop. Move through the
figure. The buttons Earlier change and Later change move the cursor to the previous or the next
moment at which any signal changed. To open the master or the slave you press its block in the
drawing."

Keep these facts, and the order; change only what is listed:
- "holds the old Q" becomes "keeps the old Q".
- The recorded run now does change D while CLK is 1 (at time 450 and 470): say the figure shows
  it ("the run changes D while CLK is 1; watch Q").
- "Move through the figure" becomes an instruction to step through every change with "Later
  change".
- Drop "This is a D flip-flop." (the previous section named it).

## Key `phases` (ten texts; each is shown while the cursor is in its time range)

Every fact below was read from the simulator's run (gate delay 10). One to three sentences each.
Say "time 120", not "120 units". Name the latch that is open or closed. Do not mention any time
outside the phase's own range except as "earlier".

1. 0 to 99: CLK is 0 from time 0, and D is 0. The master is open and follows D. The slave is
   closed. Q is X: no rising edge has happened yet.
2. 100 to 199: CLK rose at time 100. The master closed and the slave opened. Q became 0 at time
   120, two gate delays after the edge.
3. 200 to 299: CLK fell at time 200. The slave closed, so Q stays 0. The master opened again (at
   time 210) and follows D, still 0.
4. 300 to 399: D rose at time 300. The master is open, so it followed: the master's Q became 1 at
   time 330. Q did not move, because the slave is closed.
5. 400 to 449: CLK rose at time 400. The master closed on D = 1 and the slave opened. Q became 1
   at time 430, three gate delays after the edge.
6. 450 to 499: D fell at time 450 and rose again at time 470, while CLK was 1. The master was
   closed, so the master's Q stayed 1 and Q stayed 1.
7. 500 to 549: CLK fell at time 500. The slave closed, so Q stays 1. The master opened again at
   time 510 and follows D, which is 1.
8. 550 to 699: D fell at time 550 while CLK was 0. The master is open, so its Q followed and
   became 0 at time 580. Q stayed 1, because the slave is closed.
9. 700 to 799: CLK rose at time 700. The master closed on D = 0 and the slave opened. Q became 0
   at time 720, two gate delays after the edge.
10. 800 to 900: CLK fell at time 800. The slave closed, so Q stays 0. The master opened again and
   follows D.

## Key `internalsAfter` (below the recorded run)

Current: "The master's gates need time to settle on D before the edge closes it. The slave must
not see a change racing through as the master closes. The numbers in the previous section are
what those gate delays add up to in this model: 30 and 10, where 30 is three gate delays."

A review found "30 and 10" names no quantity for 10. Facts:
- The master's gates need time to settle on a new D before the edge closes it. In this model that
  time is the setup time the slider found in the previous section: 30 time units, three gate
  delays.
- Q shows its new value 30 time units after the edge in the previous section's clean case (it
  took two or three gate delays in this run, depending on whether Q rose or fell).
- The slave must not see a change racing through as the master closes. A change at the edge or
  after it never reaches Q, which is why this model's hold time is zero.
Do not use the number 10.
````

### A5-generalisation-challenge.md

````markdown
# Brief A5: Lesson A (remember), Generalisation, Challenge, Reflection, model note

Read 00-words.md first. You redraft only the keys below. Return each key as `key: "text"` (use
\n\n between paragraphs; hints as a numbered list of five), nothing else.

## Key `asTextLead` (above a figure: the flip-flop drawn beside the text generated from it)

The figure's generated text is one line: `always_ff @(posedge CLK) Q <= D;`.

Current: "The flip-flop with its Q output alone is one line of text: `always_ff @(posedge CLK) Q <=
D;` Eleven gates, one line. `always_ff` means at every clock edge. `@(posedge CLK)` names the
rising edge of CLK. `Q <= D` means Q takes D. You are not asked to write this yet. The figure
below generates the line from the course's flip-flop. Your own drawing can be shown as text in
the challenge that follows."

A review found "`always_ff` means at every clock edge" gives the keyword the job of the part in
brackets, and "the course's flip-flop" implies another. Facts:
- The flip-flop with its Q output alone is one line of text (give the line).
- Eleven gates, one line.
- `always_ff` starts a description of something that changes only at a clock edge: a flip-flop.
- `@(posedge CLK)` says which edge: the rising edge of CLK.
- `Q <= D` says what happens then: Q takes D.
- You are not asked to write this yet. The figure below generates the line from the D flip-flop
  you have been using. Your own drawings can be shown as text in the challenges that follow
  (each drawing challenge has an "As text" panel under it, closed until you open it).

## Key `asTextAfter` (below that figure)

Current: "Feedback is what holds a value. An edge is what decides when it may change. Many
flip-flops sharing one clock hold several bits at once. A circuit whose next value depends on its
present value and its inputs is the next lesson's subject.\n\nFrom here the course mostly takes
the clocked view (the \"Clocked\" badge). Inputs change between edges and every flip-flop takes
its D at the same edge. Setup and hold are the cost of that view. The gate-delays model is where
to look when they are violated."

Problems: "Many flip-flops sharing one clock hold several bits" answers the reflection's question
before it is asked; "the next lesson's subject" is wrong (the next lesson is about storing several
bits; a circuit that computes its next value comes later); "view" should be "model"; "Setup and
hold are the cost of that view" judges without grounds. Facts:
- Feedback is what keeps a value. An edge is what decides when it may change.
- From here the course mostly uses the clocked model (badge "Clocked"). In it, inputs change only
  while CLK is 0, and every flip-flop takes its D at the same rising edge. A press of "Clock CLK"
  raises CLK and lowers it again.
- The clocked model can assume that only because every D is steady for the setup time before
  each edge and stays steady after it. When that fails, the gate-delays model is where to look.
- Do not mention several bits, registers, or what the next lesson is about.

## Key `buildDffLead` (above the flip-flop challenge): current text, change only this

Current: "Draw the flip-flop (inputs D and CLK, output Q) from two D latch blocks and an inverter.
The tests clock the circuit and check that Q takes D only at the rising edge and holds otherwise."
Change "holds otherwise" to "keeps its value otherwise".

## Key `c3Task`

Current: "Draw a circuit with inputs D and CLK and output Q. Q copies D only when CLK rises. While
CLK is held low or high, Q stays the same. The tests check this by changing D and CLK and watching
when Q changes."
Change only "While CLK is held low or high" to "While CLK stays low or high". (Keep "Q copies D
only when CLK rises".)

## Key `c3Hints` (five rungs: the idea, a common mistake, a smaller example, part of the answer,
the whole answer)

Current:
1. "One latch is transparent for as long as its EN is 1. Two in series, open at different times,
   pass a value through in two stages, so the output moves only at the hand-over."
2. "Two different mistakes: wiring D to the second latch as well as the first, so the second
   latch follows D itself; and giving the first latch CLK rather than NOT CLK, so it opens when the
   second does."
3. "One D latch with EN = NOT CLK alone: watch it in the running circuit. It follows D while CLK is
   0 and freezes the moment CLK rises. A second latch opened by CLK itself would show what it
   froze."
4. "The first latch has D as its D and NOT CLK as its EN. The second latch has CLK as its EN."
5. "Place an inverter on CLK. D latch 1 takes D and the inverter's output. D latch 2 takes latch
   1's Q as its D and CLK as its EN. Q is latch 2's Q."

Problem: rungs 2 to 4 say nearly the same thing, and rung 2 gives the wiring away by contrast.
Facts for the new ladder:
- Rung 1: rung 1's current text, unchanged.
- Rung 2 (a common mistake), named by what it does, with no wiring: if both latches are open at
  the same time, a change of D runs straight through both, as in the two-latch figure, and the
  test "D changes while the clock is high" fails.
- Rung 3 (a smaller example): one D latch whose EN is 1 while CLK is 0 follows D while CLK is 0
  and stops following the moment CLK rises. Do not name the inverter or say what the second latch
  takes.
- Rung 4 (part of the answer): the first latch's EN is NOT CLK.
- Rung 5: rung 5's current text, unchanged.

## Key `writeDLatchLead` and `c4Task` (the D latch, as text)

Current lead: "Write the D latch as text (inputs D and EN, output Q) using only `assign`
statements and the bitwise operators. Each `assign` is a gate, and the text's circuit is drawn
under the text as you type."
Current task: "Write the D latch in text. The module and its ports are provided. Declare wires
with `logic` and connect them with `assign` statements. Each `assign` is one gate. You may use the
operators `~` (NOT), `&` (AND) and `|` (OR)."

A review found no `assign` line is shown anywhere the learner reads before this, except in hints
and a closed panel. Facts for the lead (the task stays as it is; return it unchanged):
- Write the D latch as text (inputs D and EN, output Q) with `assign` statements and the bitwise
  operators.
- One example, which is not part of the answer: `logic Y;` declares a wire called Y, and
  `assign Y = ~(A | B);` makes a NOR gate that drives Y from A and B. (Write both in backticks.)
- Each `assign` is one gate. The text's circuit is drawn under the text as you type.

## Key `c4Hints` rung 3 duplicates that example now. Facts:
Current:
1. "An `assign` names a wire and says which gate drives it. The circuit is the set of assigns, in
   any order."
2. "One mistake is to use a wire before declaring it with `logic`, or to assign Q twice."
3. "`logic Y; assign Y = ~(A | B);` is a NOR gate whose output is called Y."
4. "Declare S, R and ND. Two assigns: `assign S = D & EN;` and `assign R = ND & EN;`."
5. "Declare ND, S, R and QB. `assign ND = ~D; assign S = D & EN; assign R = ND & EN; assign Q = ~(R
   | QB); assign QB = ~(S | Q);`."
New rung 3 (a smaller example, not part of the answer): one `assign` can hold more than one
gate. `assign Y = A & ~B;` is a NOT gate on B and an AND gate, with Y the AND gate's output.
Rungs 1, 2, 4 and 5 unchanged (return them).

## Key `reflection`

Current: "A gate forgets. A loop of gates remembers. The price of remembering is timing, which the
course had not had to think about until now.\n\nWhat would it take to hold eight bits instead of
one? What happens if the thing that changes D is itself a flip-flop clocked by the same edge?"
Change: "hold eight bits" becomes "store eight bits". Keep everything else.

## Key `modelVsReality` (shown after the lesson, under "How the simulator differs from hardware")

Current: "The simulator's gates have no real delay: each gate is one step, or each gate is the 10
units this lesson chose. Real gates have delays that vary with temperature, voltage and
manufacture.\n\nThe simulator decides every race by the order it visits gates. Hardware decides by
physics.\n\nThe metastability roll is an illustration, not a model of the physics.\n\nA real latch
given the combination to avoid and then released can leave both outputs at a voltage between 0
and 1 for a time. The simulator writes X."

A review found the second paragraph false: the fault lab showed X for a race. Facts for the second
paragraph:
- In the stepped model, a race that the circuit cannot decide is not decided at all: the simulator
  shows X, as in the fault lab.
- In the gate-delays model, two changes that arrive at the same moment are taken in a fixed order,
  so the model always gives an answer.
- Hardware decides a race by physics, and a close race can leave a flip-flop metastable.
Also: "The metastability roll" becomes "The roll in the setup-and-hold figure" (the lesson's
word is "metastable", not "metastability"). Other paragraphs unchanged.
````

### AL-labels.md

````markdown
# Brief AL: Lesson A (remember), labels, and the words in the reference tables

Read 00-words.md first. Return each key as `key: "text"`, nothing else. Change only the keys
listed.

## `objectives` (four, each starting with a verb; the page shows them first, under "Objectives")

Current fourth objective: "Find the setup time of the flip-flop in the gate-delays model, see what
the model says about the hold time, and say what the simulator cannot decide about a change just
before the edge." A review found it is one sentence doing three jobs (38 words). Split it into
two objectives, each one sentence of no more than about 20 words. Facts:
- Find the flip-flop's setup time by moving D against the clock edge in the gate-delays model, and
  say what its hold time is.
- Say what the simulator cannot decide when D changes just before the edge.
Return `objectives.4` and `objectives.5`. Objectives 1 to 3 stay.

## `titles` (section headings: a heading names what its section contains, as a noun phrase; it is
not a list)

- `titles.question` current "How a circuit remembers" repeats the lesson's title, and the section
  only asks the question: it sets the task of a light that shows which of two buttons was pressed
  last. Name the section's contents.
- `titles.failureExperiment` current "Faults, transparency problems, edge timing": the section
  breaks the two-button circuit four ways, shows a change running through two latches that share
  one EN, and measures when D may change before the clock edge. One noun phrase.
- `titles.explanation` current "Feedback loops, tables, two-stage latches": the section explains
  why the two NOR gates keep a value, shows the latch's table, and opens the D flip-flop to show
  its master and slave latches. One noun phrase. Do not say "two-stage latches" (the lesson calls
  it the D flip-flop).

## `captions` (one line under each figure's badge)

- `captions.dLatchExplorer` current "Hold EN at 1, change D, and watch the reference table."
  Use "Leave EN at 1" (the lesson keeps "hold" for hold time).
- `captions.race` (new figure: two D latches in a row sharing one EN; press EN and D, drag the
  Step slider). Same shape as the other captions, for example "Press A and B to watch LIGHT and the
  gates in the two-button circuit."
- `captions.twoButtons` current "Press A and B to watch LIGHT and the gates in the two-button
  circuit." The figure now shows the circuit closed, as one block: no gates are drawn. Drop "and the
  gates".
- `captions.loopTwo` and `captions.loopThree` stay.

## `faults.stuckA` current "Button A held down". Facts: button A is stuck at 1. A short noun
phrase in the same shape as "Feedback wire cut" and "LIGHT gate changed to OR".

## `options.x` (the third answer in both loop predictions) current "The simulator cannot decide
(X)". Facts: q is X: not a known 0 or 1. Same shape as the other two answers, "q is 0" and "q is 1".

## The reference tables' words (shared files; these tables appear in this lesson)

Each row has a "What it does" text.

The latch's table (title "SR latch (set, reset)"):
- rows "Hold" (twice), "Reset", "Set", "Forbidden". Change "Hold" to the working word for a value
  that stays the same, and "Forbidden" to a one- or two-word name for the combination to avoid.
  Return as `sr.keep` and `sr.avoid`.

The D latch's table (title "D latch (transparent)"):
- row "Hold" becomes the same word as `sr.keep`.
- note, current "Removes the forbidden input by never letting S and R both be 1." Facts: the D latch
  can never give its inner latch the combination to avoid, because S and R are never both 1. Return
  as `dLatch.note`.

The D flip-flop's table:
- title, current "D flip-flop (edge-triggered)". The lesson never says "edge-triggered". Facts: a
  D flip-flop; it changes only at the rising edge of CLK. Return `dff.title`, a short name.
- rows "Captures 0", "Captures 1", "No edge: unchanged". The lesson says Q "takes D". Return
  `dff.take0`, `dff.take1`, `dff.noEdge`.
- note, current "Q changes only at the rising edge of CLK. At all other times Q holds, whatever D
  does." Change "holds" to "keeps its value". Return `dff.note`.
````

### B1-question-prediction.md

````markdown
# Brief B1: Lesson B (registers), Question, Motivation, Prediction

Read 00-words.md first. You redraft only the keys below. Return each key as `key: "text"` (use
\n\n between paragraphs), nothing else.

## Key `question`

Current: "The previous lesson showed how one flip-flop keeps one bit. The question at the end
asked: \"What would it take to hold eight bits instead of one?\" This lesson keeps four.\n\nFour
switches set a number, one bit per switch. A display shows a number. There is a Save button. The
display must show what the switches held when Save was last pressed. It must keep showing that
number while the switches move. When the power comes on, the display must show `0000`, not
whatever the circuit happens to start with. The whole circuit runs from one clock, CLK, that rises
at a steady rate and never stops.\n\nHow can a circuit keep four bits together, change them only
when told to, and start from a known value?"

Change only the words, to the working words: one flip-flop stores one bit; the previous lesson's
question now reads "What would it take to store eight bits instead of one?" (quote it so); this
lesson stores four; the switches' "held" becomes "were set to"; the last line asks how a circuit
can store four bits together. "It must keep showing that number" stays. Everything else stays.

## Key `motivation`

Current: "The flip-flop takes D at every rising edge of CLK. With a never-stopping clock, that means
a new value at every edge. The display must change only when Save is pressed, keeping its number at
every other edge.\n\nFour flip-flops keep four bits: one number. All four must change at the same
moment, or the number passes through values nobody set.\n\nA flip-flop that no edge has set yet
shows X. A display starting at X shows nothing anyone chose.\n\nAlmost everything a computer keeps is
a number of several bits that must stay the same most of the time: a count, where it is in its list
of instructions, or the result of the last step kept for later."

Problems: the last paragraph repeats the previous lesson's three examples in the same order
(a count, where you are in a sequence of instructions, the result of the last operation); the case
for a reset is made here and again four times later in the lesson, so this is the one place it is
made in full. Facts:
- Paragraph 1 unchanged.
- "Four flip-flops store four bits: one number. All four must change at the same moment, or the
  number passes through values nobody set."
- The reset case, made once here: a flip-flop that no edge has set yet shows X. A display starting
  at X shows nothing anyone chose. So the circuit needs a way to start from a known value.
- Last paragraph: point back instead of repeating the examples: the previous lesson named three
  things a computer stores; each is a number of several bits that must stay the same most of the
  time. Do not list them again.

## Key `prediction` (section prose above the two figures)

Current: "Two figures below each pose a question about four flip-flops sharing one clock. Choose one
of three answers, then press \"Check my prediction\". The timing diagram that appears shows what
the simulator did."
Facts to add: a timing diagram draws each signal as a line against time: high for 1, low for 0, a
hatched band for X. The previous lesson showed several without naming them. Each figure draws its
circuit above its question.

## Key `p1Question` (inside the first figure, above the answers)

Current: "Four flip-flops share one clock. Their D inputs together are written D. Their outputs are
Q, as four bits with bit 3 on the left and bit 0 on the right. In `0110`, bit 3 is 0 and bit 0 is
0.\n\nThe figure sets D to `0110` while CLK is low, then gives one rising edge of CLK. Then it sets D
to `1111`, and CLK does not rise again.\n\nWhat is Q at the end?"

Problem: in `0110` both named bits are 0, so the example cannot show which end is bit 3. Facts:
change the example only: "In `1000`, bit 3 is 1 and bit 0 is 0." Everything else stays.

## Key `p2Question` and `p2Explain` (the second figure)

Current question: "The four flip-flops now have one more input, EN. EN is different from the D
latch's EN: this EN acts only at a rising edge, deciding whether Q takes D. At a rising edge where EN
is 1, Q takes D. At a rising edge where EN is 0, Q keeps the value it had.\n\nThe figure starts the
circuit fresh, with nothing set yet. It sets D to `0110` and EN to 0. EN stays at 0. CLK rises three
times.\n\nWhat is Q after the third edge?"
Return it unchanged.

Current explanation: "Q is `XXXX`: unknown. No edge ever had EN at 1, so no flip-flop ever took D.
Each edge kept the value each flip-flop already had. That value was never known.\n\nKeeping a value
only helps once there is a known value to keep. The lesson comes back to this with a reset."

Problem: "reset" here is the reader's only reset so far: the previous lesson's latch R, which acted
at once, with no edge. Facts for the second paragraph:
- Keeping a value only helps once there is a known value to keep (keep this sentence).
- The lesson adds a reset, RST, later. Unlike the latch's R in the previous lesson, which acted the
  moment it was 1, RST acts only at a rising edge, as EN does.
````

### B2-investigation-construction.md

````markdown
# Brief B2: Lesson B (registers), Investigation and Construction

Read 00-words.md first. You redraft only the keys below. Return each key as `key: "text"` (use
\n\n between paragraphs; hints as a numbered list of five), nothing else.

## Key `fourFlipFlopsLead` (above the figure "four flip-flops on one clock")

The figure: four D flip-flop blocks, ff3 at the top down to ff0 at the bottom; each has its own D
pin (D3 to D0) and Q pin (Q3 to Q0); one CLK wire reaches all four. Buttons "Clock CLK" (raises
CLK and lowers it again) and "Start again". The signal table under it lists D3, D2, D1, D0, CLK,
then Q3 to Q0. Pressing a flip-flop block opens it.

Current: "Below are four flip-flops from the previous lesson, arranged ff3 to ff0 from top to
bottom, the order a word is written. Each has its own D input (D0 to D3) and Q output (Q0 to Q3).
One clock wire CLK reaches all four.\n\nAt the start every Q is X because no edge has set them yet.
Press some D pins to set a number. Press \"Clock CLK\". All four Q change in one step, each to its
own D. Press D pins without \"Clock CLK\": no Q changes.\n\nPress a flip-flop block to open it and
see the two latches from the previous lesson.\n\nSeveral bits kept together and treated as one
value are a **word**. Flip-flops that share one clock and keep a word are a **register**. This one
is a four-bit register."

Problems: "word" is used before the last paragraph defines it (the learner met "word" in Module 1:
several bits treated as one number); "the order a word is written" asks the learner to turn "bit 3
on the left" through ninety degrees; "keep" means "store" here but "stay as it was at an edge" in the
next paragraphs; "in one step" means "at once". Facts:
- Four flip-flops from the previous lesson, ff3 at the top down to ff0. Bit 3, written on the left
  of a word, is at the top. Each has its own D pin (D3 to D0) and Q pin (Q3 to Q0). One clock wire,
  CLK, reaches all four.
- At the start every Q is X: no edge has set them yet.
- Press some D pins to set a number. Press "Clock CLK": all four Q change at the same edge, each to
  its own D. Press D pins without "Clock CLK": no Q changes.
- Press a flip-flop block to open it and see the two latches from the previous lesson.
- Last paragraph: a word, as in Module 1, is several bits treated as one number. Flip-flops that
  share one clock and store a word are a **register** (this introduces "register"; keep it bold).
  This one is a four-bit register.

## Key `fourFlipFlopsAfter` (below that figure)

Current: "Sharing one clock makes the four bits one word: all four take their D at the same edge, so
the word changes in one step. This register still takes D at every edge. So, wired to the switches,
the display would follow them one edge late and Save would do nothing. You need a way to tell each
edge whether to take D or keep the word."
Changes: "in one step" becomes "at once"; the last sentence: a way to tell each edge whether the
register takes D or keeps the value it has. Otherwise unchanged.

## Key `construction` (section prose, above the challenge)

Current: "Keep one clock for everything. Change what each flip-flop's D sees, not when it sees
it.\n\nAn input that decides whether the register takes D (EN is 1) or keeps its word (EN is 0) at
each edge is a **load enable**. Here it is EN, and EN is 1 while Save is pressed. You build it for
one bit. A four-bit register is four of these bits sharing EN and CLK.\n\nPress the part buttons
above the drawing to add parts. Press one port, then another, to wire them. A failed test names the
step and the part that drives the wrong output."

Problems: the first paragraph states the lesson's rule (one clock for everything) a section before
the failure experiment shows why; "keep one clock" uses keep in a third sense; "names the step"
uses step for a test. Facts:
- Drop the first paragraph. (The rule arrives after the failure experiment.)
- An input that decides, at each edge, whether the register takes D (EN is 1) or keeps the value it
  has (EN is 0) is a **load enable** (keep bold). Here it is EN, and EN is 1 while Save is pressed.
  You build it for one bit. A four-bit register is four of these bits sharing EN and CLK.
- The drawing-tool paragraph stays, except its last sentence: a failed test names the test and the
  part that drives the wrong output.

## Key `c1Task` (the challenge "One bit with a load enable, drawn")

Current: "Draw a circuit with inputs D, EN and CLK and output Q.\n\nAt a rising edge of CLK where EN
is 1, Q takes D. At a rising edge where EN is 0, Q keeps its value. Between edges, Q does not
change, whatever D and EN do.\n\nThe tests change D, EN and CLK one step at a time and check Q after
each step, including one where EN changes while CLK is 1."
Change only the last paragraph: the tests change D, EN and CLK one at a time and check Q after each
change, including one where EN changes while CLK is 1.

## Key `c1Hints` (five rungs: the idea, a common mistake, a smaller example, part of the answer, the
whole answer)

Current:
1. "A flip-flop takes whatever reaches its D at each rising edge. To keep a value, make D see the
   flip-flop's own Q at the edges where EN is 0. That is feedback, as in the previous lesson."
2. "Two ways fail: wiring D straight to the flip-flop, so every edge takes D; and putting EN in the
   clock's path with an AND gate. The second passes the first few tests, then fails when EN rises
   while CLK is 1: the AND gate's output rises then, and the flip-flop sees a rising edge that CLK
   never made."
3. "An AND gate with EN as one input passes its other input while EN is 1 and gives 0 while EN is 0.
   An AND gate with NOT EN as one input does the opposite. An OR of the two outputs passes whichever
   one is not forced to 0."
4. "The flip-flop's D is (D AND EN) OR (Q AND NOT EN), where Q comes back from the flip-flop's own
   output."
5. "Place a NOT gate on EN. ... Q is the flip-flop's Q." (unchanged)

Problems: in rung 1, "D" means the circuit's input and the flip-flop's pin; rung 3 gives the whole
gating structure, not a smaller example. Facts:
- Rung 1: a flip-flop takes whatever reaches its D pin at each rising edge. To keep a value, make
  the D pin see the flip-flop's own Q at the edges where EN is 0. That is feedback, as in the
  previous lesson.
- Rung 2: unchanged (return it).
- Rung 3 (a smaller example, one gate): an AND gate with EN as one input passes its other input
  while EN is 1 and gives 0 while EN is 0. Nothing about a second AND gate or an OR gate.
- Rung 4 (part of the answer): the D pin needs D when EN is 1 and Q when EN is 0; an AND gate with
  NOT EN as one input passes Q only while EN is 0. Do not give the full formula.
- Rung 5: unchanged (return the current full text: "Place a NOT gate on EN. One AND gate takes D and
  EN. A second AND gate takes the flip-flop's Q and the NOT gate's output. An OR gate takes both AND
  outputs and drives the flip-flop's D. CLK goes straight to the flip-flop's CLK. Q is the
  flip-flop's Q.").
````

### B3-failure-explanation.md

````markdown
# Brief B3: Lesson B (registers), Failure experiment and Explanation

Read 00-words.md first. You redraft only the keys below. Return each key as `key: "text"` (use
\n\n between paragraphs; a list as lines starting "- "), nothing else.

## The fault lab: keys `keepFaultsLead` (above) and `keepFaultsAfter` (below, new)

The figure: badge "Clocked". Three fault choices ("KEEP wire forced to 0", "EN forced to 1", "OR
gate changed to AND") and "No fault"; the one-bit circuit drawn with its parts; one button, "Run
checks". There is no "Clock CLK" button: the checks raise and lower CLK themselves. Pressing or
pointing at a wire shows its name and value in the line under the drawing (this now works on a
phone too).

Current lead: "The figure shows these gates:\n- notEn (NOT of EN)\n- andLoad (D AND EN, output
LOAD)\n- andKeep (Q AND NOT EN, output KEEP)\n- orChoice (LOAD OR KEEP, output CHOICE)\n- flip-flop
ff\n\n\"Run checks\" tests this bit with four steps, each ending at a rising edge:\n- \"load 1\" (D
1, EN 1)\n- \"edge with EN 0\" (D 0, EN 0)\n- \"another edge with EN 0\"\n- \"load 0\" (EN 1, D still
0)\n\nEach step compares the faulty bit's Q with what a healthy bit gives.\n\nThe wires are not
labelled in the drawing. Press a wire to see its name and value underneath.\n\nThe path from the
flip-flop's Q through andKeep back to its D is the **keep path**. Without it, the bit forgets.\n\nThree
faults break it. Choose \"KEEP wire forced to 0\": CONST with value 0 replaces KEEP in the drawing.
The output from andKeep is left unconnected. 2 of 4 checks fail at \"edge with EN 0\" and \"another
edge with EN 0\". With EN at 0, CHOICE is 0, so the edge loads 0 instead of keeping the 1.\n\nChoose
\"EN forced to 1\": the same 2 of 4 checks fail. Every edge takes D, and D is 0 there. Two different
faults produce the same failed checks, so the checks alone do not say which fault it is.\n\nChoose
\"OR gate changed to AND\": 3 of 4 checks fail at \"load 1\" and both edges with EN 0. LOAD needs EN 1
and KEEP needs EN 0, so they are never both 1. CHOICE is always 0 and every edge loads 0. \"load 0\"
passes only because 0 is the expected value."

A review found every outcome is told before the learner tries anything; "these gates" lists a
flip-flop, which is not a gate; "step" means a test; "loads 0" uses load for the flip-flop taking a
value. Split it.

`keepFaultsLead` facts (what is there and what to do; no outcomes):
- The figure shows these parts (a list): notEn (NOT of EN); andLoad (D AND EN, output LOAD); andKeep
  (Q AND NOT EN, output KEEP); orChoice (LOAD OR KEEP, output CHOICE); the flip-flop ff, whose D pin
  CHOICE drives.
- The path from the flip-flop's Q through andKeep and orChoice back to its D pin is the **keep
  path** (keep bold). Without it, the bit cannot keep a value.
- "Run checks" makes four checks, each ending at a rising edge it makes itself (the figure has no
  "Clock CLK" button), as a list: "load 1" (D 1, EN 1); "edge with EN 0" (D 0, EN 0); "another edge
  with EN 0"; "load 0" (EN 1, D still 0). Each compares the faulty bit's Q with what a bit with no
  fault gives.
- The wires are not labelled in the drawing. Press a wire to see its name and value under the
  drawing.
- Choose each fault in turn and run the checks. Before you run them, say which checks you expect to
  fail.

`keepFaultsAfter` facts (outcomes; one short paragraph per fault):
- "KEEP wire forced to 0": a box CONST with value 0 now drives the wire KEEP; andKeep's output goes
  nowhere. 2 of 4 checks fail, at "edge with EN 0" and "another edge with EN 0". With EN at 0,
  CHOICE is 0, so at the edge Q takes 0 instead of keeping the 1.
- "EN forced to 1": the same 2 of 4 checks fail. Every edge takes D, and D is 0 there. Two different
  faults give the same failed checks, so the checks alone do not say which fault it is.
- "OR gate changed to AND": 3 of 4 checks fail, at "load 1" and both edges with EN 0. LOAD needs EN
  1 and KEEP needs EN 0, so they are never both 1. CHOICE is always 0, and every edge makes Q 0.
  "load 0" passes only because 0 is what it expects.

## The gated clock: keys `gatedClockLead` (above) and `gatedClockAfter` (below)

The figure: badge "Stepped". A flip-flop whose clock pin is driven by an AND gate, andClk, that
takes CLK and EN; andClk's output wire is called GCLK. D, CLK and EN are buttons on the drawing; one
button "Start again"; no "Clock CLK" button. Checked in the simulator: press D to 1; press CLK to 1
with EN at 0: Q stays X; then, with CLK still 1, press EN to 1: Q becomes 1.

Current lead: "This figure has the \"Stepped\" badge and no \"Clock CLK\" button. The experiment needs
EN to change while CLK is 1, which the clocked model never does. You raise and lower CLK yourself by
pressing its pin.\n\nThere is a tempting shortcut: stop the clock reaching the flip-flop when EN is 0.
An AND gate, andClk, takes CLK and EN, and its output, GCLK, drives the flip-flop's CLK. With EN at
0, no edge gets through, so Q keeps its value. GCLK is not labelled in the drawing: press the wire
from andClk to the flip-flop to see its name, GCLK.\n\nTry it. Press D to 1. Press CLK to 1 while EN
is 0: Q stays X, because no edge reached the flip-flop. Now, with CLK still at 1, press EN to 1. Q
becomes 1. CLK did not rise at that moment, yet the flip-flop saw a rising edge: GCLK rose when EN
did."

Problems: the badge sentence contrasts this figure with one that also has no "Clock CLK" button
(the fault lab); "which the clocked model never does" clashes with "inputs change only between clock
edges", since CLK at 1 is between a rising and a falling edge; the GCLK sentence gives the name and
then sends the learner to find it; the outcome is told before the learner presses. Facts for the
lead:
- In the clocked model, one press of "Clock CLK" raises CLK and lowers it again, and other inputs
  change only while CLK is 0. This experiment needs EN to change while CLK is 1, so this figure runs
  the stepped model (badge "Stepped") and you press CLK's pin yourself, up and then down.
- A tempting shortcut: stop the clock reaching the flip-flop when EN is 0. An AND gate, andClk,
  takes CLK and EN, and its output wire, GCLK, drives the flip-flop's clock pin. With EN at 0, no
  edge gets through, so Q keeps its value.
- Try it: press D to 1. Press CLK to 1 while EN is 0. Then, with CLK still at 1, press EN to 1.
  Watch Q. Press the GCLK wire to see its value under the drawing.
No outcome in the lead.

Current after: "With EN in the clock's path, a change on EN while CLK is 1 is a rising edge. The
flip-flop takes D at a moment the clock did not choose. In the load-enable bit, CLK reaches the
flip-flop directly and EN only changes what reaches D. A change on EN between edges changes nothing
until the next rising edge of CLK.\n\nThis course keeps one rule from here: every flip-flop gets CLK
itself, and other signals decide only what reaches D. The construction challenge's tests include a
step where EN changes while CLK is 1, so a bit built with the AND-gate shortcut fails it."

Facts for the after:
- What happened: with CLK at 1 and EN at 0, Q stayed X: no edge reached the flip-flop. When EN rose,
  Q became 1. CLK did not rise at that moment, yet GCLK did, and the flip-flop saw a rising edge.
- With EN in the clock's path, EN rising while CLK is 1 is a rising edge on GCLK (EN falling makes
  a falling edge, which the flip-flop ignores). The flip-flop takes D at a moment the clock did not
  choose.
- In the load-enable bit, CLK reaches the flip-flop directly, and EN only changes what reaches its D
  pin. A change of EN between edges changes nothing until the next rising edge of CLK.
- The rule, stated here once for the lesson: every flip-flop gets CLK itself, and other signals
  decide only what reaches its D pin. ("This course keeps one rule" uses keep in another sense: say
  "From here the course follows one rule" or similar.)
- The construction challenge's tests include one where EN changes while CLK is 1, so a bit built
  with the AND-gate shortcut fails it.

## Key `explanation` (section prose, above the reset figure)

Current: "At every rising edge, every flip-flop takes its D. EN decides what D becomes. When EN is 1,
D is the new value. When EN is 0, D is the flip-flop's Q through the keep path. Taking its own value
leaves it unchanged.\n\nThe second prediction showed what a load enable cannot do. If no flip-flop has
a known value yet, keeping it keeps X."

Problems: "D" is the circuit's input in one sentence and the flip-flop's pin in the next; the second
paragraph repeats the second prediction's explanation. Facts:
- At every rising edge, the flip-flop takes whatever reaches its D pin: the wire CHOICE. EN decides
  what CHOICE is. When EN is 1, CHOICE is the input D. When EN is 0, CHOICE is the flip-flop's own Q,
  through the keep path, so taking it leaves Q unchanged.
- Second paragraph: one sentence pointing back: a load enable keeps whatever value is there, even X,
  which is why the second prediction ended at `XXXX` and the bit needs a reset.

## Key `keepClearBitLead` (above the reset figure)

The figure: badge "Clocked"; the load-enable bit with one more input, RST: an AND gate andClear takes
CHOICE and NOT RST (from a NOT gate notRst), and drives the flip-flop's D pin. Buttons "Clock CLK" and
"Start again". Below it a reference table, which marks the row the next rising edge will apply to the
inputs now. Checked in the simulator: after "Start again", Q is X; "Clock CLK" with EN 0 leaves Q X;
RST to 1 and "Clock CLK": Q becomes 0.

Current: "The figure is the load-enable bit with one more input, RST, and a reference table below it.
The AND gate andClear takes CHOICE and NOT RST (from the NOT gate notRst). While RST is 1, andClear
gives 0, whatever EN and D are, so the next edge makes Q 0.\n\nTry it. Press \"Start again\": Q is X.
Press \"Clock CLK\" with EN at 0: Q stays X. Press RST to 1 and press \"Clock CLK\": Q becomes 0. Press
RST back to 0, and EN and D decide again.\n\nThe reset acts only at a rising edge, like everything else
that reaches D. At an edge where RST and EN are both 1, Q becomes 0. Reset wins over EN.\n\nFor the
display: set RST to 1 for one edge when the power comes on, and the display shows `0000` until the
first edge with Save pressed. The table below the figure lists every case. What sets RST to 1 when the
power comes on is outside this lesson."

Problems: "RST wins over EN" is said three times in the lead (and once more in the table's note);
"everything else that reaches D" is the pin; the reset's difference from the previous lesson's R is not
said here (it is said once, in the second prediction's explanation; do not repeat it). Facts:
- Paragraph 1 as now, but say it once: while RST is 1, andClear gives 0 whatever EN and D are, so the
  next edge makes Q 0.
- Paragraph 2 (Try it) unchanged.
- Paragraph 3: the reset acts only at a rising edge, like everything else that reaches the flip-flop's
  D pin. The table marks the row the next edge will apply. (Do not say "RST wins" again here: the
  table's note says it.)
- Paragraph 4 (the display) unchanged, except drop "The table below the figure lists every case."
````

### B4-generalisation-challenge.md

````markdown
# Brief B4: Lesson B (registers), Generalisation, Challenge, Reflection, model notes

Read 00-words.md first. You redraft only the keys below. Return each key as `key: "text"` (use
\n\n between paragraphs; hints as a numbered list of five), nothing else.

## Keys `registerAsTextLead` (above) and `registerAsTextAfter` (below)

The figure: a four-bit register with a load enable, drawn closed as one block labelled "register"
with inputs D, CLK and EN and output Q (D and Q four bits wide), beside the text generated from it:

```
module register_4(input logic [3:0] D, input logic CLK, input logic EN, output logic [3:0] Q);
  always_ff @(posedge CLK) begin
    if (EN) Q <= D;
  end
endmodule
```

The block cannot be opened in this figure. Inside, each bit's choice between D and Q is made by a
different part from the AND, OR and NOT gates the learner built; the behaviour is the same.

Current lead: "This register combines four of the load-enable bits from the construction into a
single unit. All four flip-flops share one clock and one enable. When drawn closed, the register
appears as one block with inputs D, CLK and EN, and output Q. D and Q are each four bits wide. Bit N
of D connects to flip-flop N.\n\n`logic [3:0]` declares a signal four bits wide, numbered 3 down to
0.\n\nAt every rising edge of CLK, the lines inside `always_ff @(posedge CLK) begin ... end` run. The
words `begin` and `end` group several lines into one block, like brackets do.\n\nAt the edge, the
line `if (EN) Q <= D;` works like this: if EN is 1, Q takes D."

Problems: "combines four of the load-enable bits" is not what is inside the block, and "When drawn
closed" promises an open view this figure lacks; "block" already means a drawn part; "works like
this:" labels the point. Facts:
- The figure draws a four-bit register with a load enable as one block, with inputs D, CLK and EN
  and output Q. It behaves as four of the load-enable bits from the construction sharing one clock
  and one enable. Bit N of D goes to flip-flop N.
- `logic [3:0]` declares a signal four bits wide, its bits numbered 3 down to 0.
- At every rising edge of CLK, the lines between `begin` and `end` run. `begin` and `end` group
  lines under the `always_ff` line, as brackets group terms; here there is one line between them.
- `if (EN) Q <= D;`: if EN is 1, Q takes D.

Current after: "When EN is 0, no line gives Q a value, so Q keeps its value. (The keep path you built
from gates is written by leaving out a line for that case.)\n\nA wider word needs a wider range. For
eight bits, D and Q are declared `logic [7:0]`, and every value written into Q must be eight bits
wide.\n\nThe text does not place flip-flops. The course turns each bit of Q into a flip-flop when it
builds the circuit from the text."

Problems: "range" is not defined; "every value written into Q must be eight bits wide" is not true
of a plain `0`. Facts:
- Paragraph 1 unchanged.
- For eight bits, D and Q are declared `logic [7:0]`: bits 7 down to 0. A value written with its
  width, such as `8'b00000000`, must be eight bits wide: the text box refuses `4'b0000` for an
  eight-bit Q. A plain `0` takes Q's width.
- Paragraph 3 unchanged.

## Key `predictChainLead` (above the chain prediction; the figure draws the chain above its
question: IN into the first flip-flop's D, each flip-flop's Q into the next one's D, one CLK; outputs
Q0 (first) to Q3 (last))

Current: "The previous lesson asked: what happens if the thing that changes D is itself a flip-flop
clocked by the same edge?\n\nThis figure chains four flip-flops on one clock. IN goes to the first
flip-flop's D. Each flip-flop's Q connects to the next flip-flop's D. The outputs are Q0 (the first),
Q1, Q2 and Q3 (the last).\n\nWhat does this circuit do?"
Facts: keep the first paragraph. Then: this section answers that question, with a circuit this
lesson's display does not need. The figure draws four flip-flops on one clock, each taking its D from
the one before; IN feeds the first. The outputs are Q0 (the first) to Q3 (the last). Keep the final
question "What does this circuit do?".

## Key `p3Explain` (after the chain prediction is checked): unchanged; return it.
Current: "Q2 is 1.\n\nAt each edge, every flip-flop takes the value the one before it held just before
the edge. The 1 entered Q0 at the first edge, moved to Q1 at the second and to Q2 at the third.\n\nThe
bit does not move all the way along at once. Inside each flip-flop, the first latch closes at the edge
before any Q changes. So each flip-flop takes the old value of the one before it.\n\nQ3 is still X: no
known value has reached it yet."

## Key `buildShiftLead` (above the shift-register challenge; every learner reads this, whether or not
they opened the prediction's answer)

Current: "Flip-flops in a chain on one clock each take, at every edge, the value the one before it
held, so bits move one place along. This is a **shift register**.\n\nIt takes a number one bit at a
time on one wire. After four edges, it keeps the last four bits side by side: the newest in Q0, the
oldest in Q3.\n\nBuild one from four D flip-flop blocks."
Facts:
- Flip-flops in a chain on one clock each take, at every edge, the value the one before it held just
  before the edge, so bits move one place along per edge. This is a **shift register** (keep bold;
  introduces the term).
- Why a bit does not run all the way along at one edge: inside each flip-flop the master latch closes
  at the edge before any Q changes, so each flip-flop takes the old value of the one before it.
- It takes a number one bit at a time on one wire. After four edges it stores the last four bits side
  by side: the newest in Q0, the oldest in Q3.
- Build one from four D flip-flop blocks.

## Key `c2Hints` (the shift register: the idea, a common mistake, a smaller example, part of the
answer, the whole answer)

Current rung 1: "Each flip-flop takes, at every rising edge, whatever reaches its D. Make the first
flip-flop's D come from IN. Make each other flip-flop's D come from the Q before it. Put all
flip-flops on one clock." It gives the whole wiring, which rung 5 repeats. Facts for rung 1 (the
idea): at each rising edge every bit moves one place along the chain, from IN towards Q3. No wiring.
Rungs 2 to 5: return them unchanged:
2. "Two common mistakes: wiring IN to every flip-flop's D makes all four take the same bit at every
   edge. Chaining them in the wrong order makes the new bit appear at Q3 instead of Q0."
3. "With two flip-flops, the first takes IN and the second takes the first one's Q. After two edges,
   the second shows what IN was at the first edge."
4. "The first flip-flop's D is IN, and its Q drives Q0. The second flip-flop's D is that Q0."
5. "Place four D flip-flop blocks. Connect CLK to all four, IN to the first block's D, and each
   block's Q to the next block's D. Wire the four blocks' Q outputs in order to Q0, Q1, Q2 and Q3."

## Key `c3Task` (the four-bit register, as text): current text, change one phrase

Current: "The module and ports are provided in the same order as the figure's text, with one more
input RST. D and Q are four bits wide (`logic [3:0]`), and EN, RST and CLK are each one bit.\n\nAt a
rising edge of CLK: if RST is 1, Q becomes `0000`. Otherwise if EN is 1, Q takes D. Otherwise Q keeps
its value.\n\nThe notation `4'b0000` is a value four bits wide (the 4), written in binary (the `'b`),
and `else if` tests its condition only when the `if` before it was false.\n\nWrite one `always_ff`
block; you may use `if`, `else`, `begin` and `end`. The tests include an edge where RST and EN are both
1, and a step where EN changes while CLK is 1."
Changes: "Write one `always_ff` block" becomes "Write one `always_ff`" (block means a drawn part); "a
step where EN changes" becomes "a test where EN changes".

## Key `c3Hints` rung 3 (a smaller example)

Current rung 3: "The previous lesson's flip-flop as text is one line:\n\n`always_ff @(posedge CLK) Q <=
D;`" The generalisation figure has just shown more than that. The step the learner lacks is `else
if`. Facts for the new rung 3 (not part of the answer; use made-up one-bit names A, B and Y):
`if (A) Y <= 1'b1; else if (B) Y <= 1'b0;` tests A first; B counts only when A is 0; when both are 0
no line runs and Y keeps its value. Return only rung 3.

## Key `reflection`

Current: "A register keeps a word in flip-flops that share one clock. A load enable chooses what
reaches D: it never changes when the clock arrives. At a rising edge, a reset brings every bit to a
known value. A shift register is the same flip-flops wired in a chain, so bits move one place per
edge.\n\nWhat if the gates before D worked out a new value from Q, such as the next number up? What
would a circuit need to step through a fixed list of jobs, one per edge?"
Facts: "keeps a word" becomes "stores a word"; the second sentence reads either "EN never changes at
the edge" or "EN never moves the clock": say the second plainly: a load enable changes what reaches
each flip-flop's D pin, never when the clock reaches it. "step through" becomes "work through". The
rest unchanged.

## Key `modelVsReality` (after the lesson, under "How the simulator differs from hardware")

Current: "The clocked model gives every flip-flop its edge at the same moment. In hardware, the clock
reaches different flip-flops at slightly different times.\n\nA shift register works because each
flip-flop's output changes a little after the edge. This is later than the next flip-flop needs its D
to be stable (its hold time). If the clock reached a later flip-flop late enough, a bit could pass
through two flip-flops at one edge.\n\nA real flip-flop at power-on is not X. It settles to 0 or 1, but
nothing says which. The simulator writes X because it cannot know. Either way, a reset is
needed.\n\nThis course's reset acts at a clock edge. Many real circuits use a reset that acts the
moment RST rises, without waiting for an edge. This course does not model that kind. Real chips also
switch the clock off to save power, using a purpose-built part designed so an enable change cannot
cause an edge. A plain AND gate, like the one in the failure experiment, fails to do this."
Changes:
- Paragraph 3: drop "Either way, a reset is needed." (the case for a reset is made in the
  motivation).
- Paragraph 4: after "Many real circuits use a reset that acts the moment RST rises, without waiting
  for an edge.": the previous lesson's latch R acted that way; no register in this course does.
  (Replace "This course does not model that kind.")
- "(its hold time)": keep; the previous lesson defined hold time as how long after the edge D must
  stay steady.

## Key `timeModel.clocked` (the "Time model" note shown at the foot of every lesson whose figures carry
the "Clocked" badge; shared by every lesson)

Current: "Inputs change only between clock edges. Before each edge, the circuit settles. After the
clock rises and after it falls, the circuit settles again."
Problem: CLK at 1 is between a rising and a falling edge, yet in this model nothing changes then.
Facts: inputs change only while CLK is 0. One press of "Clock CLK" raises CLK and then lowers it. The
circuit settles before each rising edge, after it, and after CLK falls.
````

### BL-labels.md

````markdown
# Brief BL: Lesson B (registers), labels, and the words in its reference table

Read 00-words.md first. Return each key as `key: "text"`, nothing else. Change only the keys
listed.

- `title`, current "How does a circuit keep several bits together?". "keep" means one thing on this
  page (Q stays as it was at an edge where EN is 0). Use the working word for storing; same shape,
  a question.
- `objectives.1`, current "Build a register from flip-flops sharing one clock, and say why all bits
  change at the same moment." No challenge asks the learner to build the plain register: they see
  it in a figure, build one bit with a load enable and a four-flip-flop chain, and write the register
  as text. Use a verb that matches what they do (for example, store a word in flip-flops that share
  one clock). Keep "and say why all bits change at the same moment". Starts with a verb.
- `titles.question`, current "Saving and keeping four bits": use the working word for storing.
- `options.unknown`, current "The simulator cannot know Q (XXXX)": keep as it is (return it).

The reference table "One register bit with reset and load enable" (rows' "What it does" texts):
current "Q resets to 0", "Q keeps value", "Q captures 0", "Q captures 1", "Q unchanged". The lessons
say Q "takes" D. Return `reg.take0` and `reg.take1` for the two "captures" rows, in the same shape as
"Q resets to 0". The others stay.
````
