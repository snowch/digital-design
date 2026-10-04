# Verdicts on review-1.md and review-2.md

Sceptic 1. Each finding was checked against the lesson files (remember.ts, remember.prose.ts,
remember.labels.ts; registers.ts, registers.prose.ts, registers.labels.ts), the circuits in
packages/dd-model/src/library.ts, the facts tests, the view code, and the built site served on
port 4185 and driven with Playwright at 1280 and 375 pixels. No repository file was edited.
docs/notes/, docs/checkpoints.md and the git history were not read. No challenge answer is given.

Keys: 1-xx is review-1.md, 2-xx is review-2.md. "Shared with" marks the same point made in the
other review, on the same lesson.

(Entries are appended as they are reached; the totals table is at the end.)

## Review 1, Lesson A (remember)

**1-A1. In part.** Quote exact (remember.labels.ts objectives[3], first thing on the page). True
that it carries three tasks in 34 words (style rule 1), and splitting it would help. The
unintroduced-terms charge is rejected: objectives state "what the learner can do afterwards"
(docs/authoring.md), so they use the lesson's own terms by design; registers' objectives do the
same ("load enable", "shift register"), and swapping in plain words would only blur them.

**1-A2. Upheld.** Quotes exact (p1Question; prediction prose "an OR gate on the way round").
Prediction.tsx renders only the question, three options and the button until a commit; after it,
a status line, a timing diagram and the reveal. No circuit is ever drawn in the figure. Nothing
before the investigation says which wire q is. Driving loop-two on the page with kick at 1 shows
the two inverter outputs at different values, so which option is right depends on which inverter
drives q. The even/odd contrast can be reasoned; the choice between the two value options cannot.
Shared with 2-A7.

**1-A3. Upheld.** All four quotes exact (p1Explain, investigationLoopTwo, p2Explain,
investigationLoopThree). The reveal and the lead that follows it make the same argument within a
screen. A lead that says what the step slider shows would give the second text a job. Shared with
2-A13.

**1-A4. Upheld.** Reproduced at 1280: loop-three after kick then release, the status reads "These
signals never settled and are shown as X: q, or.y, not1.y, not2.y." while the drawing labels the
loop 1/0/1/0 and the table shows q = 0 (screenshot taken). two-buttons after A, B, "Release all at
once": status "These signals never settled and are shown as X: LIGHT, DARK.", table LIGHT = 0.
Cause confirmed in code: CircuitExplorer.tsx lines 77-81 draw `history[step]`; simulator.ts
settle() pushes the last step into history before markUnknown() writes X into the live values
only. The lead beside it says "q is X". Code fix first, as the finding says.

**1-A5. Upheld.** SVG of two-buttons: wire A is `M 44 32 H 52 V 36 H 100`, wire B is
`M 44 92 H 58 V 36 H 200`, so both run along y = 36 from x = 58 to 100 and B then passes through
the norDark symbol (box x 104-171) to norLight. On screen A and B look joined into norDark's top
input, and B's solid segment between the gates reads as norDark's output. two-buttons is not
hand-placed (library.ts twoButtonsCircuit has no `placed()`); the fault lab's "No fault" view is
the same drawing.

**1-A6. Upheld (low).** Quote exact. On the page: press A or B alone, "Settled in 2 steps.";
release, "Settled in 0 steps."; press B with A held, "Settled in 1 steps.". "Step" is first
explained in the Time model note after the reflection ("Every gate takes one step."); the
captions' "settling steps" come earlier.

**1-A7. Upheld (low).** The two-buttons figure directly above draws the gates with their names
and wiring, and its lead says what each gate takes; the task and hints then treat the circuit as
unknown, so the challenge can be done by copying. Changing the order (build before the figure)
would make it a design task. Shared with 2-A11.

**1-A8. In part.** Quotes exact. Holds: "the opposite of Q" is untrue for the state the next
section has the learner make (fault lab: "Both gates' outputs are 0"; tableSrLead: "force both
outputs to 0"); and the lead's second paragraph repeats the task under it almost word for word.
Weak: the learner has met the other gate's output, by those words, in the investigation lead
("each take one button and the other gate's output"), so "its other output" has a referent.

**1-A9. Upheld (low).** Rungs read in remember.prose.ts (rung labels from lesson-runtime strings:
concept, common mistake, smaller example, part of the answer, answer). In both ladders the
"Common mistake" rung names mistakes that, by contrast, state what "Part of the answer" states,
and in the flip-flop ladder rungs 2 to 4 overlap almost completely. (Details withheld: they are
the answers.) For the flip-flop challenge this matters less, because the explanation section,
which comes before it, already says which clock reaches each latch.

**1-A10. Upheld (low).** Quote exact. The lead never says what "Run checks" runs or compares;
the step labels ("release B") first appear in the result list. Verified on the page: with "Button
A held down", "1 of 4 checks failed. At release B: got LIGHT=1, expected LIGHT=0", so the stated
outcome is right. Lesson B's fault lab does explain its checks first. Every fault's outcome is
given before the learner touches the figure, which turns breaking into confirming.

**1-A11. Upheld.** SVG under "Feedback wire cut": norLight moves to x = 100 and norDark to x = 200
(swapped against the healthy layout), wire A runs through the norLight symbol, norLight's second
input has no wire, nothing marks the cut, and the LIGHT wire runs over norDark to the pin.
Under "Button A held down" the gates move again; norDark's output label reads 0 beside "LIGHT 1"
with the LIGHT wire drawn into the same line (screenshots taken). The only mark of a fault is the
text "A cut wire carries nothing, so every gate that reads it now sees X." under the choices.
Shared with 2-A18.

**1-A12. Upheld.** Quotes exact. The clock is defined beside a D latch figure that has no clock;
no figure shows two latches sharing an EN (the explorer is one d-latch); the lead goes from a
shared EN to "once per rise of the clock" without saying the EN is the clock; the flip-flop is
named before its behaviour; and the setup-hold figure measures it before the explanation opens it.
The originality note claims the flip-flop "is motivated by the learner seeing the D latch follow
for too long", but the race that motivates it is told, not shown. The structural direction (own
section or lesson) is the author's call; the observations all check. Shared with 2-A15 and 2-A16.

**1-A13. Upheld.** Quote exact. The lesson lists "setup" and "hold" under `introduces`, but neither
gets its plain meaning (rule 6): setup is left to be inferred from the sentence before, and hold
time is given only as "zero" plus a consequence. "simply" is on rule 19's list. Shared with 2-A10.

**1-A14. Upheld.** Quotes exact. "slave" first appears in internalsLead, three figures later
(table-sr, table-d, internals), and the slave is itself a latch. "a recorded seed" precedes "A seed
is a number..." by three sentences. "This is called metastable." names a state with an adjective;
the hardware note says "metastability". Shared with 2-A4 (the slave point).

**1-A15. Upheld.** Quotes exact; the figure strings were seen on the page ("Q captured 1 at 1030.",
and after a roll at 20 before, "Roll 1: Q became undecided at 1020, settled to 0 at 1060."). The
setup-hold SVG's only texts are CLK, D, Q, "Uncertain" and level labels: no time axis at either
width, and "1000" appears nowhere on the page. The 30-before / 30-after double use is there too.
Shared with 2-A5.

**1-A16. Upheld.** Reproduced: at 20 before, presses 1 to 4 give Roll 1, Roll 2, Roll 2, Roll 2
(identical, settled to 0 at 1066); a roll at 25 before adds a second identical "Roll 2" line.
SetupHold.tsx line 116 sets `seed = draws.length + 1`, and line 131 replaces the draw at the same
offset, so the count stops growing. The lead's "a new roll gets a new seed" is false after the
second roll. Code fix first. Shared with 2-A6.

**1-A17. Upheld (low).** Quote exact. On the page "Roll result" is absent at the default 80 before
and present only from 25 to 15 before; the lead does not say so. The band is "The band" in the
prose, "Uncertain" on the diagram and "the window" in the status ("because D changed inside the
window"). Shared with 2-A25.

**1-A18. Upheld.** SVG of the internals drawing: the wire into the slave's EN runs along y = 52
from x = 58 to 300, through the inverter and through the master box, entering at the master's EN
port and leaving at its Qb port (x = 260), so the slave's EN reads as driven by the master's Qb;
the two wires into the master's EN share the segment from x = 168 to 200; D's wire runs along
y = 36 through the inverter symbol. Screenshot confirms. (Which signal feeds which latch is left
out, as the finding does: it is the flip-flop challenge's answer.) This is the figure the lead
sends the learner to.

**1-A19. Upheld.** Stepped the cursor through every change on the page. At 550 and 560 the table
reads CLK 0, the drawing shows the master's EN at 1, and master Q falls at 580 (pinned in
lesson-facts.test.ts: `580:0`), so the phase text "D fell at time 550 while CLK was 1. The master
was closed" is wrong twice; Q stayed 1 because the slave was closed. The script changes D only at
300 and 550, both with CLK at 0, so the lead's "While CLK is 1 ... D can change and Q does not" is
never shown. The lag is real: phases[1] spans 100-300 (CLK falls at 200) and phases[3] spans
400-550 (CLK falls at 500). Shared with 2-A1 and 2-A2.

**1-A20. Upheld.** Quote exact. The previous section's 10s are the gate delay and the "10 units
before the edge or later" threshold; its hold time is zero; 30 is both the setup time and the
clock-to-Q time. The learner cannot tell which quantity "10" is, or which 30. Shared with 2-A3.

**1-A21. Upheld (low).** Quotes exact. The D latch table with its note "Removes the forbidden
input..." appears under the D latch explorer in the failure experiment, before the SR table
introduces "Forbidden", and again in the explanation; the fault lab and hardware note say "the
combination to avoid"; "input" here means a combination. Small overcount: "forbidden input" and
"Forbidden" are one name, so two names, not three. Shared with 2-A14 and 2-A20.

**1-A22. In part.** Quotes exact. Holds: "edge-triggered" in the table title is a word the lesson
never uses, and "`always_ff` means at every clock edge" gives the keyword a meaning that belongs to
`@(posedge CLK)`. Weak: the lesson uses "edge" only for the rising edge throughout, so the "perhaps
both kinds" misreading is unlikely; and "capture" is on the page, in the setup-hold status the
learner sees by default ("Q captured 1 at 1030."). Shared with 2-A19 (table words).

**1-A23. Upheld (low).** Quotes exact. index.ts publishes remember then registers; registers is
about keeping several bits and its reflection defers next-value logic, so "the next lesson's
subject" is wrong as published. The after-text answers the reflection's eight-bits question two
sections early. Registers mentions hold time once, in a parenthesis in its hardware note. Shared
with 2-A17.

**1-A24. Upheld.** All quotes found (buildDLatchLead, dLatchExplorerLead, faultLabLead, the fault
label "Button A held down", c3Task, setupHoldLead). "hold" is in this lesson's `introduces`, and
it carries keep-a-value, keep-an-input-at-a-level and the timing quantity on one page. Shared with
2-A9.

**1-A25. Upheld (low).** Quotes exact. X marks "nothing to go on", an oscillation, an undecided
race and a cut wire's readers, and the option label glosses it as "cannot decide". No sentence
says X means "not a known 0 or 1". Shared with 2-A8.

**1-A26. Upheld.** Quote exact (modelVsReality). The settle model is order-independent by design
(simulator.ts header; docs/simulator.md: "a race the circuit cannot decide is not decided by the
code"), and the fault lab the learner just used says "The simulator cannot decide which gate wins,
so LIGHT is X." The note is true only of the delay model, where docs/simulator.md says "a tie is
decided by event order". "every race" is wrong; the direction (check against both models) fits.

**1-A27. In part.** (a) "This is called metastable." and the later "metastability": holds (also
1-A14). (b) "Setup and hold are the cost of that view.": an evaluation without its grounds
(rule 22), and "view" against "model" elsewhere: holds. (d) "This is the one random thing in the
course.": a claim about the course's state of the kind CLAUDE.md lists as rotting: holds.
(c) "the course's flip-flop" (three uses, counted): rejected; it marks this design as the course's
among real flip-flop designs, which is accurate and fits the model-versus-reality note.

**1-A28. Upheld (low).** Seen on the page: loop-two and loop-three (one input each) carry "Release
all at once" (CircuitExplorer.tsx renders it unconditionally); only the fault lab's lead uses it.
The text challenge opens with "the output Q is never assigned (line 1)" before anything is typed
(confirmed by elaborating the starting text).

**1-A29. In part.** Headings as quoted. Holds: "two-stage latches" names the flip-flop in words used
nowhere else; "How a circuit remembers" sits over the question, not an answer. Weak: a scanner can
tell what the list headings contain (CLAUDE.md's test for a heading); the list shape reflects a
section doing three jobs (1-A12), so renaming alone would only be different. Shared with 2-A23.

**1-A30. In part.** The lesson's sequence is as described (remember.ts). The originality note
defends the framing (task, kick, predictions, roll) and is silent on the sequence, so the question
to the author is fair under CLAUDE.md's "not Harris and Harris's chapter order". Not shown: the
Harris and Harris comparison cannot be checked here (it is from memory on both sides), and most of
the order is forced, since each circuit is built from the one before it.

## Review 1, Lesson B (registers)

**1-B1. In part.** Quote exact (registers.labels.ts objectives[0]). True that the plain register is
shown, not built: the learner draws one bit and a chain and writes the register as text. But the
chain challenge does have the learner put four flip-flops on one clock that keep a word, which
meets the lesson's own definition of a register ("Flip-flops that share one clock and keep a word
are a register"), so the gap is which register, not whether one is built. Aligning the verb would
still be more honest. Shared with 2-B21.

**1-B2. In part.** Quotes exact. Holds: the motivation repeats the previous lesson's three
examples in the same order ("a count, where you are in a sequence of instructions, the result of
the last operation"), and new ones or a pointer back would serve a learner who has just read them.
Rejected: the drawing-tool instructions repeat across lessons because each lesson's challenge
needs them and a lesson can be opened on its own; that repeat is not a fault.

**1-B3. Upheld (low).** Quote exact (p1Question). Both named bits of `0110` are 0, so the example
cannot show which end is bit 3. Shared with 2-B2.

**1-B4. In part.** Quotes exact. Holds: "(its hold time)" leans on a term the previous lesson gave
only as a number (see 1-A13); "timing diagram" is named for the first time here, after several were
shown unnamed (minor). Rejected: "clocked model" matches the course's "gate-delays model" and is the
better word, while the previous lesson itself mixed "model" and "view"; carrying "view" over would
only be different. "the first latch" against "the master" is plain and was glossed in Lesson A
("The first is the master"); low value.

**1-B5. Upheld (low).** Quotes exact. The edge-only reset is flagged once at first use
(keepClearBitLead: "The reset acts only at a rising edge"), but it is never set against Lesson A's
R, which acted at once; and the hardware note's "This course does not model that kind" sits against
that latch's R. One contrast sentence, like the EN one, would help.

**1-B6. Upheld.** Quotes exact. "word" is in this lesson's `introduces` and first appears, undefined,
in "the order a word is written"; the definition is three paragraphs later in the same lead. Read
in its everyday sense, a word is written left to right, not top to bottom, and the prediction had
put bit 3 on the left. Shared with 2-B4.

**1-B7. Upheld.** All quotes found (question, motivation, fourFlipFlopsLead, p2Question,
fourFlipFlopsAfter, construction, gatedClockAfter). The register is defined as flip-flops that
"keep a word", and the next paragraph says "This register still takes D at every edge" and asks
"whether to take D or keep the word": two senses of "keep" collide on one screen.

**1-B8. Upheld (low).** Opened ff3 in four-flip-flops: identical geometry to Lesson A's internals
drawing (the wire into the slave's EN runs through the master box and leaves at its Qb port; D3
runs through the inverter). Optional view, as the finding says.

**1-B9. Upheld (low).** On the page: four-flip-flops, gated-clock and keep-clear-bit each carry
"Release all at once", which no registers text mentions; the four-flip-flop table lists D0-D3 then
Q0-Q3, the reverse of the drawing (ff3 on top) and of the word order.

**1-B10. In part.** Quotes exact. Holds: the construction states the rule ("Keep one clock for
everything...") a section before the gated clock gives the reason (rule 13), and it is restated
after. Over-called: the reflection's job is to summarise the lesson, and "EN only changes what
reaches D" is the specific case the general rule then states, so counting those as repeats
overstates it. Shared with 2-B11.

**1-B11. Upheld.** Reproduced. Desktop: hovering the GCLK wire shows "GCLK = 0" under the drawing; a
click clears it; a second click shows it again; moving away clears it. Phone (375, touch): three
taps on a point confirmed to be on the wire (elementFromPoint) show nothing each time, for GCLK,
KEEP and EN. CircuitView.tsx lines 142-144: mouseenter sets the net, click toggles it off. Wires have
no keyboard access either. Shared with 2-B1.

**1-B12. Upheld (low).** Quotes exact. Both leads give every outcome (and the counts) before the
learner presses anything; the counts match the page (verified: 2, 2 and 3 of 4). The gated-clock
lead could give the steps without the result, keeping the surprise the course's predict-first loop
wants. Shared with 2-B22 (outcomes before the figure).

**1-B13. In part.** Quotes exact. Holds: "these gates" lists "flip-flop ff", which is a block of
eleven gates, not a gate; "parts" would be accurate. Rejected: the GCLK sentence is not circular;
it identifies the wire by its two ends and sends the learner to confirm it. Its real problem is
that a press does not work (1-B11).

**1-B14. Upheld (low).** Quotes exact. Stronger than stated: the construction challenge on the
same page has the "Clocked" badge and its tests include "EN rises while the clock is high", and
gatedClockAfter says so, while gatedClockLead says the clocked model never changes EN while CLK
is 1. The Time model note's "Inputs change only between clock edges" does not settle it either.

**1-B15. Upheld (low).** Quote exact. GCLK = CLK AND EN (library.ts gatedClockCircuit), so with
CLK at 1 GCLK follows EN, and EN falling gives a falling edge, not a rising one.

**1-B16. Rejected.** Quotes exact, but every verb use ("loads 0", "load 1", "load 0", "load
enable") means "takes a value at the edge", the sense the lesson's term "load enable" gives the
word; LOAD is a wire's name, a noun. In the quoted case the flip-flop takes 0 while LOAD and CHOICE
are both 0, so the sentences agree with the drawing, and changing the word would only be
different.

**1-B17. Upheld.** Quote exact. In the bit just built, D is the circuit's input, while the
flip-flop's D pin is driven by the gates in front of it (the fault lab later names that signal);
"EN decides what D becomes" means the pin and "D is the new value" means the input. c1Hints[0]
uses D both ways too. Shared with 2-B3.

**1-B18. In part.** Quotes found. Holds: the explanation's "If no flip-flop has a known value yet,
keeping it keeps X" restates the second reveal nearly word for word. Over-called: the motivation
states the requirement, the display paragraph applies the reset to the task (it is the answer to
the question's "start from a known value"), and the hardware note adds the real-hardware caveat;
each does a different job, so "made five times" overstates it.

**1-B19. Upheld (low).** Quote exact. The figure's circuit is `register-4-enable`, built by
register.ts from flip-flops whose enable is a mux2 ("enableMux", flipflop.ts lines 43-52), not the
construction's AND/OR/NOT bit; on the page the block has role=img and cannot be opened, so "When
drawn closed" promises a view the figure lacks. Behaviour is the same. Shared with 2-B15.

**1-B20. Upheld (low).** Quotes exact. The generated block holds one line inside begin/end; "block"
already names drawn parts ("D flip-flop blocks", "one block") and the text challenge says "one
`always_ff` block"; "works like this:" is a label; "range" is used without being defined.

**1-B21. Upheld (low).** Quotes exact. "step" means a test step, "at once", the Stepped model's unit,
a computation step and a job step on one page, after Lesson A's "Settled in 2 steps". Shared with
2-B10.

**1-B22. In part.** Quotes exact. Holds: the lead and the task describe the chain's wiring before
"Build one from four D flip-flop blocks", so the build is largely copying; and the model's mechanism
("Inside each flip-flop, the first latch closes...") is only in the reveal. Over-called: the section
opens by quoting the question it answers (the previous lesson's), which is a question, and the
challenge section is where an extension sits; the hardware note also tells every reader why a chain
works ("each flip-flop's output changes a little after the edge"). Shared with 2-B20 (no job in this
lesson's question).

**1-B23. Upheld (low).** Quote exact. The prediction figure draws no circuit before the commit and
only a timing diagram after (Prediction.tsx); the words carry the wiring. Shared with 2-B5.

**1-B24. Upheld (low).** Quote checked (c3Hints[2]). The "Smaller example" rung shows the one-line
flip-flop from Lesson A, and the generalisation figure just showed the larger version with the
enable, so the rung adds nothing the learner lacks. (Rung content not repeated here beyond that.)

**1-B25. Upheld (low).** Seen on the page: "the output Q is never assigned (line 1)" before any
typing, from elaborating the provided skeleton.

**1-B26. In part.** The sequence is as described (registers.ts). Asking whether the originality
note's claim covers the sequence is fair under CLAUDE.md. Not shown: the Harris and Harris
comparison cannot be checked here. If the recollection is right, the closest match is the
gated-clock enable with a caveat about EN changing while the clock is high (paraphrased from
memory), a specific example rather than an order; the enable-then-reset order itself follows the
lesson's own story (Save, then power-on). Shared with 2-B20 (in part: the shift register as the
textbook chain).

## Review 2, Lesson A (remember)

**2-A1. Upheld.** Quote exact (phases[4]). On the page at 560: CLK 0, the master's EN at 1 in the
drawing, master Q falls at 580 (pinned `580:0`); Q stayed 1 because the slave was closed. The
second sentence ("CLK fell at time 500 and the master opened again at time 510") contradicts the
first. Shared with 1-A19.

**2-A2. Upheld.** Quote exact (internalsLead). The script (remember.ts) changes D at 300 and 550,
both with CLK 0, so the run never shows D changing while CLK is 1; the flip-flop challenge tests
exactly that ("D changes while the clock is high"). Shared with 1-A19.

**2-A3. Upheld.** Quote exact; the previous section's only 10s are the gate delay and the "10 units
before the edge or later" threshold, and its hold time is zero. Shared with 1-A20.

**2-A4. Upheld.** Quote exact. "slave" is first explained in internalsLead, below this figure, and
"the slave's latch" names a latch's latch. Shared with 1-A14.

**2-A5. Upheld.** All three status strings seen on the page (at 80, 15 and 20 before, the last after
a roll). The diagram has no time labels at 1280 or 375 and the page never says the edge is at 1000.
Shared with 1-A15.

**2-A6. Upheld.** Reproduced exactly: the third press repeats "Roll 2: Q became undecided at 1020,
settled to 0 at 1066."; one roll is kept per position, so Roll 1 has no replay button once Roll 2
exists (SetupHold.tsx lines 116 and 131). Shared with 1-A16.

**2-A7. Upheld.** Quotes exact. Neither prediction figure draws a circuit (Prediction.tsx); the loop
is first drawn in the investigation. The prose names the parts but not where q is (1-A2), so "Here
is" points at nothing. Shared with 1-A2.

**2-A8. Upheld.** Quotes exact. X is "nothing to go on" before a kick and "never stop changing"
after it, and the option's gloss "cannot decide" fits only the second; the status line is the only
place that separates them. Shared with 1-A25.

**2-A9. Upheld.** Quotes exact (dLatchExplorer caption, buildDLatchLead, setupHoldLead, the table
rows "Hold"). "hold" is in the lesson's `introduces`. Shared with 1-A24.

**2-A10. Upheld.** Quote exact. Hold time is never said in plain words while the objectives ask the
learner to "see what the model says about the hold time"; "simply" is on rule 19's list. Shared with
1-A13.

**2-A11. Upheld.** The investigation figure above the challenge draws the complete circuit, gate
names included, and the task and hints treat it as unknown. Shared with 1-A7.

**2-A12. Upheld.** Quote exact (c4Task). No `assign` line appears in the prose or in any figure (the
generalisation shows only `always_ff`); examples exist only in the hints and in the "As text" panel,
a `<details>` closed by default (book.tsx line 218). The brief's learner knows gates and truth
tables, not the text syntax. If an earlier module were to teach `assign`, this would fall away; no
such lesson is published.

**2-A13. Upheld.** Quotes exact; the reveal and the lead make the same argument in consecutive
sections, and the three-inverter pair does the same. Shared with 1-A3.

**2-A14. Upheld (low).** The D latch table, note included, is on the page twice (under the explorer,
and as "The reference table for the D latch."), with the lead between them saying it again. The
live copy marks the row in force; the second copy adds nothing. Shared with 1-A21.

**2-A15. Upheld.** Quotes exact. The lead drives the figure, defines the clock before the race that
needs it (rule 13), states the race, names the fix and defines the rising edge; the inverter's
reason waits for the explanation. Shared with 1-A12.

**2-A16. Upheld.** Quote exact; no figure shows two latches sharing an EN, and the figure beside the
sentence is one D latch. Shared with 1-A12.

**2-A17. Upheld.** Quote exact; the next published lesson is registers (index.ts), and its own
reflection defers next-value logic. Shared with 1-A23.

**2-A18. Upheld (low).** Swap confirmed in the SVG (see 1-A11). One detail is off: nothing at all
marks the cut. The short dashed segment by norLight's output is the LIGHT wire (X), not a stub of the
cut wire, and norLight's second input has no wire. The direction stands. Shared with 1-A11.

**2-A19. In part.** Holds for "D flip-flop (edge-triggered)", a term the lesson never uses. Wrong
that the lesson never uses "capture": the setup-hold figure shows "Q captured 1 at 1030." by default
(dd-views strings.ts `setupHold.captured`). Shared with 1-A22.

**2-A20. Upheld (low).** Quotes exact; "forbidden input" and the row "Forbidden" mean a combination
of inputs, while "input" elsewhere is a pin. Shared with 1-A21.

**2-A21. Upheld (low).** Reproduced by elaborating an `always_ff` line under the challenge's
constructs: "This lesson has not met `always_ff @(posedge clk)` yet." (hdl gate.ts), while the
generalisation figure showed that line ("You are not asked to write this yet."). It also writes
`clk` where the lesson writes CLK.

**2-A22. In part.** True at 375: the internals drawing shows CLK, D, notClk and the master, with the
slave and Q off to the right (scrollWidth 516 against 317), and the setup-hold diagram's Q change is
off-screen. Wrong that nothing signals it: course.css (lines 374-394) draws a scroll shadow at the
edge that has more behind it, visible in a 2x screenshot. The direction's "a scroll cue" exists;
"a narrower layout for the phone" would still help, since the lead asks for the slave's block.

**2-A23. In part.** As 1-A29. Holds for "two-stage latches" and for a question section headed like
its answer; "How a circuit remembers" is close to the title "How does a circuit remember?". Weak
on the list headings: a scanner can tell what they contain, and the list mirrors a section doing
three jobs. Shared with 1-A29.

**2-A24. Upheld (low).** Quote exact. The lead states "Setup time in this model is 30 units." and the
whole capture map above the slider, so the objective's "Find the setup time" becomes reading.

**2-A25. Upheld (low).** Quote exact. The button is labelled "Roll result" and exists only from 25 to
15 before (seen on the page); the lead says neither. Shared with 1-A17.

## Review 2, Lesson B (registers)

**2-B1. Upheld.** Quotes exact. Reproduced (see 1-B11): hover shows "KEEP = X" or "GCLK = 0", a click
clears it, and touch taps on the wire show nothing, three times running. The names are given in
the leads' text (LOAD, KEEP, CHOICE, GCLK), but matching a name to a wire, and reading its value, is
mouse-only. Shared with 1-B11.

**2-B2. Upheld.** Quote exact; both named bits of `0110` are 0. Shared with 1-B3.

**2-B3. Upheld.** Quote exact; D is the input in one sentence and the flip-flop's pin in the next,
and the fault lab already has a name for the pin's signal. Shared with 1-B17.

**2-B4. Upheld.** Quotes exact; "word" (in `introduces`) is used in paragraph 1 and defined in
paragraph 4 of the same lead. Shared with 1-B6.

**2-B5. Upheld (low).** Quote exact; the figure draws nothing before the commit and a timing diagram
after, and the page never draws the chain (the learner draws it next). Shared with 1-B23.

**2-B6. Upheld.** Reproduced with the reference block typed (not reproduced here): the drawing under
the text shows a CONST block ("const1"), a selector labelled "Q_mux" and a "register" block whose
ports are D, CLK and Q only. Worse than reported: the parts list holds two "Q_mux" selectors placed
at the same position (both `translate(100 140)`), so one hides the other. The generalisation said the
block has "inputs D, CLK and EN", and the lesson never introduces a selector or a constant.

**2-B7. Upheld (low).** Reproduced: in the text box `Q <= 0;` renders as one ≤ glyph (2x screenshot);
the textarea's computed `font-variant-ligatures` is `normal` in JetBrains Mono. Cause: app.css sets
`font-variant-ligatures: none` on textarea (lines 46-55, with a comment saying no text box draws
ligatures), and a later `textarea { font: inherit; }` (lines 77-81) resets it.

**2-B8. Upheld (low).** On the page the register-bit table never shows a "Now" column or a marked row,
before or after RST and "Clock CLK", or with the CLK pin at 1. TruthTable.tsx rowFor compares the
CLK column's ↑ and — with the pin's 0 or 1, so it can never match (reference.ts REGISTER_BIT_TABLE).
Lesson A's D latch table marks "Applies now".

**2-B9. Upheld (low).** Quote exact (reflection). "it never changes when the clock arrives" reads
either as "EN's value never changes at the edge" or as "EN never alters the clock's timing"; both
are near-true in the clocked discipline, which is why the sentence does not settle which it means.

**2-B10. Upheld (low).** Quotes exact. Shared with 1-B21.

**2-B11. In part.** Quotes exact. Holds: the rule is stated in the construction before the
gated-clock experiment earns it, then again after. Over-called: the reflection is the lesson's
summary, and "EN only changes what reaches D" is the particular case the general rule follows, so
"four times" overstates the repeat. Shared with 1-B10.

**2-B12. In part.** Quotes exact. The repeat is real, and wider than quoted: paragraph 1 of the lead
already says RST gives 0 "whatever EN and D are", and paragraph 3 says it twice more. Wrong that the
table note is "directly beneath": the drawing, signal table and buttons sit between. The table's
note belongs to a reference table meant to be read alone, so the cut belongs in the lead.

**2-B13. Upheld.** Rung 1 ("The concept", lesson-runtime strings) of the shift-register ladder gives
the complete wiring, which rung 5 repeats with output names, and the task's second paragraph and the
lead above the prediction already say what each flip-flop takes. The ladder does not climb.
(Contents not repeated here.)

**2-B14. Upheld (low).** Rung 3 ("Smaller example") of the one-bit ladder describes the whole gating
structure in the abstract rather than a smaller example, leaving rung 4 only to name the signals.
Lesson A's follow-and-hold rung 3 has the same shape, as the finding says.

**2-B15. Upheld (low).** Quote exact; the block has role=img on the page (cannot be opened), and the
library circuit's enable is a mux2 inside each flip-flop (flipflop.ts lines 43-52). The
parenthesis is loose: B6's selector comes from elaborating the text, a different circuit of the
same kind. Shared with 1-B19.

**2-B16. In part.** Reproduced: `Q <= 0;` in the four-bit challenge gives "OK. The text describes a
circuit.", and an unsized `0` is accepted for an eight-bit Q too. But the checker does enforce widths
for sized values: `4'b0000` written into an eight-bit Q is refused ("this expression is 4 bits wide
but the signal it is assigned to is 8"), as is `2'b01` into four bits. The rule holds for the
notation the lesson teaches; only unsized literals are an exception, and "should" would be less
accurate.

**2-B17. Upheld (low).** On the page the fault lab has the "Clocked" badge and only "Release all at
once" and "Run checks"; its CLK is a pin pressed by hand, as in the next figure. The next lead
explains itself by the badge and the missing button, which do not distinguish it from the figure
just above.

**2-B18. In part.** True at 375: in the fault lab's drawing ("One bit with a load enable") and in
keep-clear-bit, orChoice (and andClear in the second), the flip-flop and Q are off to the right
(scrollWidth 636 and 736 against 317) while the leads name them. Wrong that there is no cue: course.css draws a scroll shadow at the clipped edge (seen in a
2x screenshot).

**2-B19. Rejected.** Quote exact, but the premise is false. By the lead's own account, KEEP "needs
EN 0", so with EN forced to 1 KEEP is never 1; and with the OR changed to AND, "CHOICE is always 0".
Both faults cut the keep path's effect, which is why "EN forced to 1" fails the same checks as "KEEP
wire forced to 0" (verified on the page). And "it" can as well be "the bit", the nearest noun; on
either reading the sentence is true.

**2-B20. In part.** Holds: the switches-display-Save story never uses the chain; a use there would
tie it in. Weak: the originality note names this textbook example itself and claims a different
framing (predicted before it is named, answering the previous question), and the lead already
"says so" by quoting the previous lesson's question, so the second direction is done. Shared with
1-B22 (no job in the lesson's question) and in part with 1-B26 (originality).

**2-B21. In part.** As 1-B1: the plain register is shown, not built, but the chain challenge puts
four flip-flops on one clock that keep a word, the lesson's own definition of a register. Shared
with 1-B1.

**2-B22. Upheld (low).** The lead (registers.prose.ts keepFaultsLead) holds the gate list, the step
list, how the checks compare, the wire readout, the keep path and each fault's outcome, all above
the figure. Moving the outcomes to an after-text would let the learner break the circuit before
reading what happens. Shared with 1-B12.

## Findings the two reviews share

Same lesson, same quote or same point. Where one finding makes two points, it pairs twice.

Lesson A, 21 pairs (18 distinct points):

| Review 1 | Review 2 | Point |
| --- | --- | --- |
| 1-A2 | 2-A7 | The prediction figures draw no circuit |
| 1-A3 | 2-A13 | Each reveal is repeated by the investigation lead after it |
| 1-A7 | 2-A11 | The two-button challenge copies the circuit drawn above it |
| 1-A11 | 2-A18 | The fault lab re-lays out the gates under a fault; the cut is unmarked |
| 1-A12 | 2-A15 | The D latch lead defines the clock before the problem and does too many jobs |
| 1-A12 | 2-A16 | The race through two latches is told, never shown |
| 1-A13 | 2-A10 | Setup and hold never get a plain meaning; "simply" |
| 1-A14 | 2-A4 | "the slave's latch" before the slave is introduced |
| 1-A15 | 2-A5 | Status lines give absolute times; the edge's time is never shown |
| 1-A16 | 2-A6 | Rolls repeat after the second; one roll kept per position |
| 1-A17 | 2-A25 | "The roll button" is named before it appears, and only inside the band |
| 1-A19 | 2-A1 | The phase text at 550 has CLK and the master wrong |
| 1-A19 | 2-A2 | The recorded run never changes D while CLK is 1 |
| 1-A20 | 2-A3 | "30 and 10" names no quantity for 10 |
| 1-A21 | 2-A14 | The D latch table is shown twice |
| 1-A21 | 2-A20 | "forbidden input" means a combination of inputs |
| 1-A22 | 2-A19 | The flip-flop table's words differ from the prose's |
| 1-A23 | 2-A17 | "the next lesson's subject" is wrong as published |
| 1-A24 | 2-A9 | "hold" has three senses on one page |
| 1-A25 | 2-A8 | "X" has several causes and no sentence says so |
| 1-A29 | 2-A23 | Section headings (lists; the question's heading) |

Lesson B, 12 pairs (11 distinct points):

| Review 1 | Review 2 | Point |
| --- | --- | --- |
| 1-B1 | 2-B21 | Objective "Build a register" has no build of the plain register |
| 1-B3 | 2-B2 | `0110` has 0 at both ends |
| 1-B6 | 2-B4 | "word" is used before it is defined |
| 1-B10 | 2-B11 | The one-clock rule is stated before its reason, and repeated |
| 1-B11 | 2-B1 | Pressing a wire clears its readout; a tap shows nothing |
| 1-B12 | 2-B22 | Fault outcomes are told before the learner tries (in part for 2-B22, whose main point is how much the lead carries) |
| 1-B17 | 2-B3 | "D" means the input and the pin in one paragraph |
| 1-B19 | 2-B15 | The generalisation's register is not four of the construction's bits |
| 1-B21 | 2-B10 | "step" has several senses |
| 1-B22 | 2-B20 | The shift register has no job in this lesson's question or story |
| 1-B23 | 2-B5 | "This figure chains four flip-flops" over a figure that draws nothing |
| 1-B26 | 2-B20 | The chain is the textbook example (in part) |

So 33 pairs and 29 distinct shared points. They involve 30 of review 1's 56 findings and 32 of
review 2's 47. Counting each shared point once, the two reviews raise 70 distinct issues
(Lesson A 34, Lesson B 36), not 103.

## Totals

| Lesson | Review | Upheld | In part | Rejected | Total | Shared with the other review |
| --- | --- | --- | --- | --- | --- | --- |
| A (remember) | 1 | 24 | 6 | 0 | 30 | 18 |
| A (remember) | 2 | 22 | 3 | 0 | 25 | 21 |
| B (registers) | 1 | 17 | 8 | 1 | 26 | 12 |
| B (registers) | 2 | 15 | 6 | 1 | 22 | 11 |
| All | both | 78 | 23 | 2 | 103 | 33 pairs, 29 distinct points |

Rejected: 1-B16 ("load" is used consistently) and 2-B19 (the two faults do disable the keep path).

The defects to fix in code first, all verified on the built page, are 1-A4, 1-A5, 1-A11/2-A18,
1-A16/2-A6, 1-A18 (and 1-B8), 1-B11/2-B1, 2-B6, 2-B7 and 2-B8. Only one review found each of 1-A4,
1-A5, 1-A18, 1-A26, 2-B6 and 2-B7.
