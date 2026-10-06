# Review: register-transfer (reviewer subagent, returned as text, saved by the managing model)

## Review of `register-transfer` (Module 5, lesson 3)

Walked at 1280 and 375 px. The facts test passes (4 tests). There were no console errors apart from one 404 for a resource. The page has no horizontal page scroll at 375 px. The circuit drawings scroll sideways inside their own frame, and the page says so. I did not run the two challenges against wrong attempts, so the findings on them come from reading only. Server stopped.

**F1. Question section, "When Save is pressed, NOW takes the switches' new number and PREV takes the number NOW showed until then."** (arc, high, sure)
This is the answer to the first prediction ("What is PREV after the second edge?"), and it comes before the learner commits. The motivation paragraph then offers "the word NOW had before the edge, or the new value now is taking?", so the options are laid out beside the answer. The prediction tests nothing. Direction: have the question section state the goal as a display requirement without the mechanism, and have the motivation ask rather than answer.

**F2. Failure-experiment lead, "The circuit above has a flaw that the tests you ran did not catch."** (arc, medium, sure)
It tells the learner before the prediction that something goes wrong, which narrows the answer. "Above" is also ambiguous: the learner's own drawing, or the figure. Direction: describe the situation (a press held for several edges) and let the prediction find the flaw.

**F3. Explanation, first paragraph: "At an edge, a register takes a word worked out from registers' values before that edge. In the NOW and PREV circuit, now takes IN; prev takes now's word; last takes SAVE."** (style, high, sure)
- The sentence is garbled: "worked out from registers' values".
- It uses lowercase "now", "prev" and "last" as if they were names. "last" only exists in the fixed circuit, and the paragraph never says so.
- It then switches to "at an edge where STEP is 1", where the earlier circuit used SAVE.
- This is the section that names the lesson's term, "register transfer", so it should be the clearest one. Direction: send it back to Haiku with a fact brief. State the rule once, say which circuit each line belongs to, and use one case for names.

**F4. Double meaning of NOW/PREV versus now/prev.** (double meaning, medium, sure)
- The motivation says "Two registers, now and prev … The second register, prev, takes its input from now's output: NOW." The block name and the signal differ only in case.
- The explorer after-text says "from now's Q to prev's D".
- In the figures the blocks are labelled "now" and "prev" and the outputs "NOW" and "PREV".
- Direction: pick one convention and say once that the block and its output share a name.

**F5. Prose names OLD and STEP; the save-once figure shows other labels.** (figure, medium, sure)
The save-once lead and the explanation use "OLD", "STEP" and "last". The figure's labels, as the page text reads, are "notOld", "andStep" and "last", and the table has no OLD or STEP rows. The learner must guess that "andStep" is STEP. The Q pin of "last" is not labelled OLD (in the phone screenshot it shows only "Q" and "Qb"). Direction: make the figure show the names the prose uses, or have the prose use the figure's.

**F6. Save-once lead and after-text repeat each other.** (repeat, medium, sure)
Lead: "NOW takes `0101` and PREV takes `0011` at the first edge. The next two edges change nothing." After: "After the first edge of the press, NOW is `0101` and PREV is `0011`. The next two edges change nothing." Cut one. The lead is also one long block mixing the circuit, the instructions and the expected result. Split it so the circuit is described before the learner is told what to try.

**F7. "Order does not matter" is made three times.** (repeat, low, sure)
- Explanation: "Their order does not matter".
- Generalisation lead: "The order of the two blocks does not matter".
- Reflection: "Their order does not matter".
- p1Explain and p3Explain both add "In a program, line order decides" and "swapping two variables needs a third". Keep the argument once, in the explanation.

**F8. Challenge section title "Swap and undo"; challenge titled "Two readings with undo".** (label, medium, sure)
The learner does not build a swap. The swap is only predicted, and the figure's A, B and LOAD never reappear. The section also holds two unrelated figures: the swap prediction and the readings challenge. Direction: retitle, or add a sentence joining them.

**F9. Swap lead: "each selector takes A (for X) or B (for Y)".** (double meaning, medium, fairly sure)
The circuit has inputs named A and B, and each word selector also has its own A and B inputs. The circuit data shows X's selector taking Y's Q on its A input and the input A on its B input, so "takes A" is ambiguous at the selector. This is written for a learner who has seen selectors, but the sentence mixes two namings. Direction: say which inputs the circuit offers (A and B) and which the selector chooses (LOAD) without reusing the letters.

**F10. Swap prediction's setup.** (arc, low, moderately sure)
The question says "At the first edge, X takes `0011` and Y takes `0101`", but never says the inputs A and B hold those words. The first figure line "load" is the only clue. The unknown option ("The simulator cannot know X (XXXX)") is a good wrong choice, since X really is unknown before the first edge.

**F11. Construction section prose duplicates the lead.** (repeat, low, sure)
Construction: "Build the same circuit in the challenge below: two registers wired to work together." Lead: "Build a circuit with two registers, NOW and PREV." "This circuit uses two 4-bit register blocks" also lacks a clear referent. "Data travels on wide wires carrying 4 bits each" is a filler statement. Cut to one instruction and make the referent explicit.

**F12. Prediction section prose: "The figure below draws the circuit above a question."** (style, medium, sure)
It reads as nonsense. Also, the prediction section names no mechanism, so it only introduces the figure. Direction: say what the figure shows and what the learner must do.

**F13. Hint ladder, challenge 1 (draw NOW and PREV), "Show hint (1 of 5)".** (arc, medium, fairly sure)
- Hint 1 ("PREV's D must carry NOW's word") already gives the key wiring.
- Hint 2 then describes a wrong attempt ("If you wire IN to both D inputs …"), hint 3 is an analogy that restates the idea, and hint 4 states the wiring.
- That is one rung up, a step sideways, then two steps up. Hint 5 gives the whole build.
- Order them: what to notice, then where the second D comes from, then the wiring.
- The task also says "The tests include edges where SAVE changes while CLK is 1". A learner cannot see why that could matter for this wiring.

**F14. Hint ladder, challenge 2 (readings).** (arc, medium, fairly sure)
- Hint 2 states the priority order "RST, then NEW, then UNDO" before hint 4's NEW branch. That is the hardest part, shown early.
- Hint 3 uses `A`, `L` and `D`, a one-register template with new names, so the learner must translate it.
- Hint 5 is the complete solution; that is acceptable as the last rung.
- The task says "Write one `always_ff`", but the generalisation section showed the pair as two `always_ff` blocks and said either works. Say why one is wanted, or drop "one".
- The task and the tests do not say what UNDO does twice in a row; the stated rule ("PREV keeps its word") covers it, so this is fine.

**F15. Word "hold"/"keep"/"now".** (double meaning, low, sure)
- Model-versus-reality introduces "their hold time". The registers lesson already did, so this is a cross-reference, but "hold", "keep" and "hold time" are used in different senses on the page: "both keep their words", "keeps SAVE's value", "hold".
- p2Explain: "PREV took NOW, which was now `0101`". The lowercase "now" next to the register named "now" is confusing.

**F16. Reflection title "Moving on" and the question section's "A new display".** (label, low, sure)
Neither says what the section contains. The reflection also introduces a new term, "the office's message to the manager must be sent, waited on, sent again, or given up", which comes from the counters lesson, so it is fine as a link. The final question is good.

**F17. Explorer lead is one long paragraph of instructions.** (style, low, sure)
"Press bits of IN … Press SAVE to 1 and press Clock CLK … Set a new number … Press SAVE to 0 …" runs together, and it ends with "Press any register block to open it: the four flip-flops inside" with no suggestion of what to look for. Direction: split into steps and say what the learner should expect to see, or drop the opening instruction.

**F18. Originality.** (originality, low, fairly sure)
The NOW/PREV display, the held press and the freezer-room readings with undo feel like the course's own. The swap through two registers with no temporary is the standard "swap" example, and the register-transfer arrow is the standard notation. The originality note is honest about this.

## Overall
The arc (predict a transfer, build it, break it with a held button, generalise to text) is sound and the facts check out against the simulator. The page's problems are in the words: the first prediction is answered by the question section, the explanation is garbled, and the labels in the save-once figure do not match the prose. The same ideas are repeated in several sections, and the hints do not climb cleanly. Fix F1, F3 and F5 first. I did not test the challenges with wrong attempts, so the hint findings are from reading.
