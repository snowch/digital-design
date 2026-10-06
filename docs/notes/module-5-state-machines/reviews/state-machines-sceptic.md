# Sceptic: state-machines (sceptic subagent, returned as text, saved by the managing model)

## Verdicts on the state-machines review

F1: upheld. At 375 px the state diagram sits in a sideways scroller (470 px of drawing in 317 px) and TRY and WAIT are cut off. The review's quote is slightly off: "The drawing is wider than the screen. Scroll sideways..." appears only under the circuit, after the table. The diagram has no hint of its own, so the problem is worse than reported. The same happens in "The controller as text".

F2: upheld. Row 5 without NOT FAIL is TRY & ~OK & TICK. Whenever it is 1 wrongly (FAIL 1, TICK 1), row 4 is also 1, so N1 does not change and no test catches it. The hint cites a mistake the tests cannot detect. Dropping NOT OK from row 4 or row 5, by contrast, is caught (TRY with OK 1 expects N1 = 0).

F3: in part. Hints 3 and 4 are not duplicates. Hint 3 is about TRY's existing arm, as a model. Hint 4 is the target for WAIT, but "WAIT's arm starts ..." reads as if WAIT already does, and the real WAIT arm starts `if (TICK)`. Fix the wording of hint 4. The point that hint 2 warns about a mistake before any step was taken stands, but it is a taste matter.

F4: rejected. Each prediction question spells out its inputs ("two more edges pass with OK, FAIL and TICK all 0", "TICK is 1 for one edge, with no answer"). Nothing is left ambiguous. The learner reasons from the story, which is the point of a prediction. Objective 1 says "from its diagram" but is lesson-wide and p3 comes after the diagram.

F5: in part. "Staying in TRY, and a late answer" does name p1's answer (TRY). The other titles and captions, including "Predict the state after GO falls" and "The reset, and a late answer while waiting", only name the topic, not the result.

F6: in part. "S is the register's code" in the prediction prose is loose. S is an output (`assign S = state`) that equals the register's `state`, and the figures draw both. The other overlaps (state as the job, its code, a signal) are the course's chosen vocabulary. "Hold" does not appear anywhere. Low.

F7: rejected. The c2 task names both while-CLK-high tests. Registers and counters already use "while the clock is high" tests, and their prose explains why. "Inputs change only while CLK is 0" is from `remember` and `registers`, not from this lesson. `modelVsReality` says "between edges", which holds.

F8: rejected. The reviewer says this is not a defect. I confirm it: state-encoding p3 reads "OK rose and fell between two edges".

F9: in part. "No answer by the next TICK" is the label of a step where TICK is still 1 from the previous edge, so "next TICK" is loose, though the lead says "(TICK still 1)". The facts test pins that label. The complaint that nothing says IDLE means "answered" is weak: the lead lists "TRY to IDLE when OK" as the return move.

F10: upheld. The fault lab opens with state XX, row6 X, row8 X, orN1 X and orN0 X. The lead says "find each row in the table and say which move breaks", but the healthy controller is not shown. The c2 "Try it" panel was not checked.

F11: rejected. `2'b`, `begin`/`end`, `@(posedge CLK)` and `always_ff` are all taught in registers and register-transfer (`registers.prose.ts` lines 47, 61, 85; `register-transfer.prose.ts`). The lead states what `default` does and gives its value (11, GIVE_UP). Only `always_comb`, `case` and `default` are new, and the lead explains them.

F12: in part. "The gates in the next-state logic read off the table" is missing "are", so it is a real grammar slip. "The arrow taken at an edge is the row that applied just before it" is hard to parse. The contrast between the table's rules and the circuit's wire is explained in the next sentence.

F13: upheld, low. "Read off the table, one gate per row" appears in construction, explanation and reflection (the explanation sentence is also the F12 slip). The reflection's opening restates the motivation's definition, which the rules call "the same argument made twice, far apart".

F14: upheld. The lead lists "reset (RST to IDLE)" as a kind of move and says "In each state exactly one row applies". The diagram and the table draw no RST move and no RST column. Nothing on the page says reset sits outside the table.

F15: rejected. The unknown (X) at the start of the timing rows is accurate: before the priming reset edge the register is unknown. The status line and "Values at time 2" show IDLE.

F16: rejected. The predict figures deliberately show bare blocks with no values until "Check my prediction", so the figure does not give the answer away. This is a matter of taste.

F17: rejected. This is a record of a check, not a defect.

F18: in part. The task does name rows 4, 5, 8 and 9, and hint 1 then repeats "find the rows whose next state has bit 1 at 1". The redundancy of hint 1 stands. Naming the rows is a design choice the rules do not decide.

**Found**

- found-1: The c2 tests never put OK = 1 and TICK = 1 together in WAIT. The WAIT edge with OK 1 has TICK 0, and the WAIT edge with TICK 1 has OK 0. A learner who writes `if (TICK) ... else if (OK)` passes all 13 tests. Hint 2 and the task both say OK must win, so the mistake they warn about is untested. This is the most serious find.
- found-2: The `originalityNote` says "The four kinds of move (stay, advance, return, reset) are each predicted before the table is shown". The predictions are stay (p1), TRY to GIVE_UP plus GIVE_UP ignoring OK (p2) and reset (p3, in the challenge section after the table). Return is never predicted, and reset is predicted after the table.

**Count:** 18 reviewer findings: 4 upheld (F1, F2, F10, F14), plus F13, which is upheld at low priority. 5 in part (F3, F5, F6, F9, F12, F18 counts as a sixth; see below), 7 rejected (F4, F7, F8, F11, F15, F16, F17). Recount exactly: upheld 5 (F1, F2, F10, F13, F14); in part 6 (F3, F5, F6, F9, F12, F18); rejected 7 (F4, F7, F8, F11, F15, F16, F17). Found 2.
