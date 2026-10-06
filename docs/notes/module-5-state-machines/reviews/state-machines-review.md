# Review: state-machines (reviewer subagent, returned as text, saved by the managing model)

Review of lesson `state-machines` (walked at 1280 and 375 px, light theme only). I did not check dark theme, keyboard use, or the challenge editors with attempts. I also did not run the facts test; I read it, and it pins the three prediction answers, the six gate names, the fault-run states and the test counts 32 and 13. No console errors; no page-level horizontal scroll at either width.

1. **F1: look, high, sure.** Phone (375): the state diagram in the "The controller in four views" figure is cut off. TRY and WAIT, and the arrows to them, are off the right edge. The circuit drawing is cut off too. The page says "The drawing is wider than the screen. Scroll sideways to see the rest." The same diagram is in "The controller as text". The investigation prose says "The drawing at the top, with a box per state ... an arrow per move", so on a phone the learner cannot see most of the machine without hunting. Suggest scaling the diagram to fit, or confirming the sideways scroll is discoverable.

2. **F2: fact (hint), high, sure.** Challenge c1, hint 2: "row 5 without NOT FAIL would also be 1 in row 4's case". Row 4's case also gives N1 = 1, so dropping that input changes nothing in the tests. A learner told this is "too eager" will be misled. Check the claim against N1 and replace it with a mistake the tests actually catch.

3. **F3: arc (hints), medium, sure.** The c2 hints do not climb one rung at a time. Hint 3 ("TRY's arm already starts with `if (OK) next = 2'b00;`") and hint 4 ("WAIT's arm starts `if (OK) next = 2'b00;`") are nearly the same line, one step apart. Hint 1 already says "the row with OK first". Hint 2 describes a mistake the learner has not made yet. Suggest merging 3 and 4, and putting the warning after the first concrete step.

4. **F4: arc (prediction), medium, fairly sure.** The prediction section comes before the diagram and the table, yet objective 1 says "Predict a state machine's next state from its diagram and inputs." The learner has only the story, which is silent on what GO falling does in TRY. It is also unclear whether "a whole TICK passes with no answer" means TICK is 1 at one edge (p2) or still 1 at a second edge (the fault lab's "no answer by the next TICK"). Suggest making the story's rules answerable, or changing the objective.

5. **F5: arc (answer given away), medium, fairly sure.** Before committing p1 the learner sees the section title "Staying in TRY, and a late answer" and the captions "Predict the state after GO falls" and "Predict the state after a late OK". The first title names p1's answer (TRY). Likewise the challenge section title "The reset, and a late answer while waiting" and the lead "One kind of move is left to predict: the reset" point at p3's answer. Suggest neutral titles and captions.

6. **F6: double meaning, medium, sure.** "state" means the job (IDLE, TRY, ...), the code, the register, and a signal named `state` in the figures. The prediction prose says "S is the register's code", but the figures show the register's Q as `state` and S as a separate output. Also "stay" and "return" are used as move kinds, "hold" nowhere. Suggest one word for the job, one for its code, and naming S exactly as the figure draws it.

7. **F7: double meaning/fact, medium, fairly sure.** The page's time model says "Inputs change only while CLK is 0", and `modelVsReality` says "The model's inputs change only between edges". Challenge c2's tests move GO and OK while CLK is 1, and its task text says so. This is explained in registers and counters, but not here. Suggest one clause in the c2 task saying why the tests do it.

8. **F8: fact (cross-reference), low, sure.** `modelVsReality`: "The next lesson shows what an input that rises and falls between two edges does." The next lesson's (state-encoding) p3 asks "OK rose and fell between two edges", so this is correct. "Metastability" is explained in `remember` and used again in state-encoding. Not a problem; I am recording that I checked it.

9. **F9: fact/clarity, medium, fairly sure.** `retryFaultsOutcomes`, first fault: "A failed message is taken for an answered one, and the manager is never told." Nothing on the page says IDLE means "answered". The learner needs to see that the controller drops back to IDLE without sending again. Also "no answer by the next TICK" is the label for a check where TICK has not changed (still 1), so it is not "the next TICK".

10. **F10: figure, medium, sure.** The fault lab and the c2 "Try it" panel open showing `XX` and `X` everywhere (state XX, row6 X, orN1 X) before any check is run. The lead says "Before you run the checks, find each row in the table and say which move breaks", but the learner cannot see a healthy circuit to compare against, and the page does not say the X is "not yet reset". Suggest priming the figure with a reset, as the other figures do, or one sentence saying X means not yet reset.

11. **F11: style/term, medium, sure.** `retryAsTextLead` explains `always_ff`, `always_comb`, `case`, `default` and `//`. It does not explain `2'b01`, `begin ... end`, or `@(posedge CLK)`, which the learner reads in the text beside it. "default takes every other value, here 11, GIVE_UP" does not say why GIVE_UP is written as `default` while the other arms carry codes. The same text is the starting point of c2.

12. **F12: style, low, sure.** Broken or filler sentences. Explanation: "The gates in the next-state logic read off the table, one gate per row." (missing "are"). The post-figure text in "The controller in four views": "The arrow taken at an edge is the row that applied just before it." This is hard to parse and repeats the status line. "The row marked in the table comes from the table's rules" is an unclear contrast with "the circuit's own wire".

13. **F13: repeat, low, sure.** `reflection` opens with "A state machine is a register that stores its state and next-state logic..." which is the `motivation` definition again. Also, "The next-state logic is read off the table, one gate per row" appears in construction, explanation and reflection.

14. **F14: arc (reset), medium, fairly sure.** The investigation lead lists "reset (RST to IDLE)" as a kind of move and says "In each state exactly one row applies". The diagram and the table draw no reset move, so a learner looking for it finds none. The page does not say that RST is outside the table.

15. **F15: look, low, fairly sure.** The timing diagram's S, SEND and SIREN rows are hatched (unknown) at the start while the status line says "Now IDLE (00)". Not checked after pressing the controls.

16. **F16: label, low, fairly sure.** Predict-figure block labels are bare ("GO OK FAIL TICK RST CLK", "next-state logic, state, next, register D CLK RST Q") before any check, with no values. The "Check my prediction" button reveals them. The caption does not say this. Section title "The controller in four views" is fine. The challenge section title covers two tasks, which is acceptable.

17. **F17: originality, low, fairly sure.** The retry controller with a siren and the shop story is its own, not a traffic light or detector. The structure (diagram, table, one gate per row, `case` text) follows the standard FSM sequence. The `originalityNote` already says so.

18. **F18: fact (task gives answer), low, unsure.** The c1 task says "Use the table: rows 4, 5, 8 and 9" and the construction prose says each bit is an OR of the rows. Hint 1 then repeats the method. If the aim is to build it unaided, the task already hands over the answer. I did not run c1 or c2 with wrong attempts.

## Overall
The lesson is mostly sound, and its story and example are original. The facts I checked (the nine rows, the gate names, the fault outcomes, the next-lesson cross-reference) match the page. Fix first: the c1 hint 2 error (F2), the phone cut-off of the diagram (F1), and the section titles and captions that give away predictions (F5). Then tidy the prediction's reliance on rules the learner has not seen (F4), the several meanings of "state" (F6), the c2 hint ladder (F3), and the unexplained text syntax (F11).
