# Sceptic: state-encoding (sceptic subagent, returned as text, saved by the managing model)

## Verdicts on the state-encoding review

I did not press the controls or run the challenges. I served the built site on port 4198, read the lesson's three files and the earlier lessons, and checked the model and facts. The server is stopped.

**F1: upheld.** The quote is on the page. IDLE `000` has no 1, so it contradicts "a single 1 in that state's own bit". `zeroIdleMachineAfter` ("each state is read from one bit") and the section title "One flip-flop per state, IDLE at zero" repeat the mismatch. The facts test pins 3 flip-flops for 4 states (`retry-zero-idle`). The four-bit code in the failure experiment is the true one-hot, and it is never called that.

**F2: in part.** The fix does come before the 4-bit failure, and `zeroIdleMachineAfter` ("The next figures show why this choice of codes matters") pre-empts that failure. But the reviewer misses that the arc does start with a break. The question figure and the first prediction (TRY at `00`, SEND is 1) are the real predict-and-break. Only the second break, the 4-bit `0000`, comes after a repair. What stands is the order of 3-bit fix before 4-bit failure, plus the pre-empting "next figures" sentence in `zeroIdleMachineAfter`.

**F3: upheld.** The prediction title "A reset to TRY" and the prose "TRY at `00`" give the answer away, together with "A reset always loads `00`". The p2 lead "What if no state has the all-zero code?" does the same for `0000`. The option label "0000, no state" gives that answer away too. The `0000` option needs some label, so only the lead and the title are strongly upheld.

**F4: in part.** "any four different 2-bit codes would work" is on the page and contradicts the lesson, because TRY at `00` does not work. Upheld for "would work", and for the clumsy sentence "what each state does and what outputs it sends in each state". Rejected for "A reset always loads `00`". That sentence is about the 2-bit register in front of the learner, and the motivation then widens it to "all zeros".

**F5: upheld.** The motivation says "how many gates your next-state logic builds" and "more flip-flops can mean fewer gates", and the reflection says "needs no decoder but costs more". No gate count appears anywhere. "No decoder" is also overstated, because the same figure has a NOR gate for IDLE. `originalityNote` says the textbook compares gate counts; this lesson does not.

**F6: upheld.** The built page shows "Now COOL (00). Row 2 applies: the next edge gives COOL (00)." under the defrost figure, which has `show: ["diagram"]` and no table. The `c2Task` phrase "each arrow is a row" has the same gap.

**F7: in part.** "The sender can keep OK at 1" is ambiguous. OK comes from the manager's phone, and the question section's "sender" reports FAIL. That part stands. "Set" and "cleared" are loosely supported: the registers lesson uses "set" (a number, "no edge has set it"), but "cleared" is not introduced. "Keep" is overloaded with the registers lesson's "keep path", though that sense (hold a value) is close. The claim that the explanation never says how a held OK is read only at edges is not a real gap.

**F8: in part.** "So the codes decide where the reset leads" does not follow from "acts at an edge", and the closing paragraph restates the motivation, `zeroIdleMachineAfter` and the reflection. Cutting it is worthwhile. The reviewer's claim that `p3Explain` repeats the synchronous argument is overreach, because `p3Explain` is the prediction's own result.

**F9: in part.** The failure-experiment title "No state at zero, answers between edges" does join two unrelated experiments, and the section has no prose of its own. That is a matter of taste against the style rules. The "phone" versus "manager" wording is trivial. The point about "synchronous" being defined after the predictions is rightly called acceptable by the reviewer.

**F10: in part.** The sentence "A name with no `= value` takes the value after the one before it, starting from 0." is true, and `packages/hdl/src/enum.test.ts` has such a case. It is unused in the lesson, and both challenges write every value. Dropping it is reasonable but not a defect. "Changing a code is one edit..." is true.

**F11: in part.** Hint 2 of the defrost challenge ("WARM should win") repeats a sentence in the task, which is valid. The `c2Task` output "S" is never explained for defrost, and only hint 5 shows `assign S = state;`, which is valid but minor, since `S` is the state's code from the previous lesson. "Challenge one is dictation" and "hint 5 is almost the whole answer" are matters of taste. The last hint giving the full answer is normal for a hint ladder.

**F12: in part.** "State" is used loosely in "state in `always_ff`" and in the reflection, and the `modelVsReality` sentence "Tools that turn text to gates may choose codes from an enumerated type; this course keeps them written in the list" is murky. Both are valid. The reflection title is a heading, so by CLAUDE.md that is not a violation.

**F13: rejected.** `default` was introduced in the state-machines lesson ("`default` takes every other value, here `11`, GIVE_UP"). The `retry` machine's last arm is `default` by design (`packages/dd-model/src/fsm.ts` lines 544 to 549, "the last state's arm is the default"). The learner has met this.

**F14: rejected.** The one console error is `http://localhost:4198/favicon.ico` returning 404. It comes from the preview server and the site, not from the lesson. I did not assess the layout claim about the tall one-hot figure.

**F15: rejected.** The `originalityNote` already says the encodings section is the textbook route and names how the lesson differs (judging encodings by the course's own reset). The synchroniser aside appears in earlier lessons too, since the state-machines `modelVsReality` mentions metastability. This is a matter of taste with no rule behind it.

**Found:**
- **X1: found.** `p3Explain` says "row 6", but the `predict-short-ok` figure shows no table. In `RETRY_ROWS` row 6 is TRY with OK 0, FAIL 0, TICK 0 going to TRY, so the number is correct but points at nothing, as in F6.
- **X2: found.** `zeroIdleMachineAfter` is the second place that states "one flip-flop per state" and "each state is read from one bit" as a fact about the 3-bit code. Fix it with F1.

**Count:** 15 findings: 2 upheld (F1, F3), 3 plus F5 and F6 upheld in total as listed below, 7 in part (F2, F4, F7, F8, F9, F10, F11, F12), 3 rejected (F13, F14, F15). Exact tally: upheld F1, F3, F5, F6 (4); in part F2, F4, F7, F8, F9, F10, F11, F12 (8); rejected F13, F14, F15 (3); found 2.
