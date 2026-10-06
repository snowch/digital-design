# Review: state-encoding (reviewer subagent, returned as text, saved by the managing model)

Review of `state-encoding`. I walked the page at 1280 and 375 pixels, read the three lesson files and ran the facts test (4 pass). I did not press every control or run the challenges with wrong attempts, and I did not screenshot the two predictions in the failure experiment or the defrost figure.

1. **F1. Term / double meaning, high, sure.** Investigation lead: "A state's code has a single 1 in that state's own bit and 0 in all the others. Such codes are called **one-hot**. This figure gives IDLE `000`, TRY `001`, WAIT `010` and GIVE_UP `100`."
   - IDLE `000` has no 1, so the figure contradicts the definition just given.
   - "one flip-flop per state" (title, lead, `zeroIdleMachineAfter`) is also false for this figure: it has three flip-flops for four states (the facts test pins 2, 4 and 3).
   - The code that matches the definition (`0001`...) appears only in the failure experiment, and is never called one-hot.
   - Direction: the term should name the four-bit code, and the three-bit one should be described as what it is (one bit per state except IDLE).
   - The objective "one flip-flop per state" has the same mismatch.

2. **F2. Arc, high, sure.** The fix (IDLE at `000`) is shown in the investigation, before the failure that motivates it.
   - `zeroIdleMachineAfter` already says "A reset loads all zeros... IDLE at `000` means the reset loads IDLE. The next figures show why this choice of codes matters."
   - The failure experiment then asks "What if no state has the all-zero code?", and the learner already knows the answer.
   - The loop runs predict, fix, break, rather than predict, break, build.
   - The `0000` prediction is the real one-hot failure, but it is placed after the repair it motivates.

3. **F3. Prediction gives the answer away, high, sure.**
   - Prediction title "A reset to TRY".
   - Prediction prose: "runs the controller with TRY at `00`". Together with "A reset always loads `00`" in the question, SEND = 1 is nearly stated before the learner commits.
   - Failure experiment lead: "What if no state has the all-zero code?", plus the option label "0000, no state". The label tells the learner that such a state exists.
   - Direction: neutral title and lead, and option labels that are only values.

4. **F4. Fact / double meaning, medium, sure.** Question: "A reset always loads `00`" and "any four different 2-bit codes would work and carry out the same table".
   - The lesson then shows 3-bit and 4-bit codes where the reset loads `000` and `0000`.
   - "would work" contradicts the lesson's point that TRY at `00` does not work. It should say "carry out the same table" and nothing about working.
   - The motivation sentence "The course's reset loads all zeros" is the correct form.
   - The sentence "The retry controller's table shows what each state does and what outputs it sends in each state" is clumsy.

5. **F5. Arc / fact, medium, sure.** Motivation: "how many gates your next-state logic builds" and "more flip-flops can mean fewer gates".
   - The lesson never compares gate counts.
   - The only evidence is "There is no decoder", plus a NOR gate for IDLE in the same figure.
   - The reflection restates "needs no decoder but costs more" as a result.
   - Direction: show the comparison or soften the claim.

6. **F6. Figure / label, medium, sure.** Defrost figure (`show: ["diagram"]`). The status line reads "Now COOL (00). Row 2 applies: the next edge gives COOL (00)", but no table is shown, so "Row 2" points at nothing.
   - The `c2Task` sentence "each arrow is a row" has the same gap.
   - Direction: show the table, or word the status line without row numbers.

7. **F7. Term, medium, probable.** Explanation: "a flip-flop can be set by OK and cleared once the controller has read it", "must be kept", "The sender can keep OK at 1 until SEND falls".
   - "set" and "cleared" are not introduced in this course so far as the earlier lessons I read show.
   - "The sender" is unclear: OK comes from the manager's phone, and the question section's "sender" reports FAIL.
   - "keep" is also used for "keeps sending", "keeps this rule" and the registers lesson's "keep path". The explanation never says how a design that holds OK would still start from reading it only at edges.

8. **F8. Repeat / join, medium, sure.** Explanation, last paragraph: "The reset belongs to the rule too: it acts at an edge. So the codes decide where the reset leads. Give the all-zero code to the state the reset should reach."
   - "So" does not follow from "acts at an edge".
   - The conclusion repeats the motivation, the investigation's `After` text and the reflection, which all say it again.
   - The main synchronous argument is also made separately by `p3Explain`.

9. **F9. Term (one-hot) / label, medium, sure.** The only place "synchronous" and "one-hot" are bolded is in prose far from the figures that show them. "Synchronous" is defined after the predictions it explains, so the earlier prediction text cannot use it. This is acceptable. But the lesson's explanation never names the experiment it explains: `p3Explain` says "row 6" and "The manager answered", while the explanation says "the phone". The failure experiment title "No state at zero, answers between edges" joins two unrelated questions under one heading, and the section has no prose of its own.

10. **F10. Fact / unsupported claim, medium, probable.** `retryEnumLead`: "A name with no `= value` takes the value after the one before it, starting from 0."
   - It is not shown, and not used in the lesson or either challenge, which write every value.
   - I did not check whether the HDL subset accepts it.
   - Either drop it or demonstrate it.
   - The sentence "Changing a code is one edit, and the reset still leads wherever the all-zero code is" is also a claim not shown in the figure.

11. **F11. Challenge, medium, probable.** The first challenge (zero-idle) is nearly dictation.
   - The task gives every code and the widths, and hint 1 gives most of the rest.
   - Nothing makes the learner see why this code choice matters; the tests only check mechanical edits.
   - The hints are also fairly flat: hints 3 to 5 each add code, and hint 5 is almost the whole answer.
   - The defrost challenge's hint 2 repeats the task ("WARM should win") before the structural hints, so the climb does not start at the bottom. `c2Task` uses output "S" without saying what it is, which the learner only gets from hint 5 (`assign S = state;`).

12. **F12. Style / double meaning, low-medium, sure.** "state" means the concept, the signal `state`, and the code in prose such as "state in `always_ff`" (reflection) and "state's code". `modelVsReality`: "Tools that turn text to gates may choose codes from an enumerated type; this course keeps them written in the list" is hard to parse and says nothing the learner can use. "Real flip-flops power up as 0 or 1" is fine. The reflection title "What the module built" is a label, but the paragraph is mostly a lesson summary.

13. **F13. Figure, low, sure.** The generalisation figure shows a diagram plus the text. The text's `default: next = GIVE_UP;` is covered nowhere in `retryEnumLead`, which describes the case arms as "IDLE:, TRY: and so on". The learner sees WAIT arm then `default` with no GIVE_UP arm. Explain it or keep an explicit arm.

14. **F14. Look / console, low, sure.** The page logs one 404 console error at 1280 (a failed resource load; I did not identify the URL). At 375 no errors and no horizontal scroll (scrollWidth 375). The one-hot circuit figure is a long vertical drawing with a large empty region at the left (wires run behind tall labelled input boxes); readable, but the tall box layout takes a full phone screen.

15. **F15. Originality, low, probable.** Encodings compared by what the course's own reset does to them (binary, one-hot) follows the usual textbook "encodings" section; the shop/freezer examples are the lesson's own and good. The point most like the standard presentation is the enumerated-type section and the two-flip-flop synchroniser aside in `modelVsReality`.

## Overall
The lesson has a good idea, using the course's own reset to judge the encodings. It is let down by the order and by one definition. The three-bit code is named one-hot and "one flip-flop per state" although it has no 1 for IDLE (F1), the fix comes before the failure (F2), and titles and labels give the answers away (F3). Several claims are never shown: gate counts, the enum default values and "keep"/"set" for short inputs. The defrost figure refers to table rows it does not show. The first challenge is dictation. The phone layout is clean.
