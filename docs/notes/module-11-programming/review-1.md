# The reading review of 7b2a194, as the managing session sent it

The reading review of 7b2a194 is done. Seven reviewers each read one lesson. A sceptic then attacked each review against the page, the source, the briefs and the built site.

Below are, first, the decisions that cross lessons (mine, as the plan's owner), then each lesson's upheld and narrowed findings as the sceptics handed them over. Rejected findings are left out.

Do every blocking and should-fix item. Do the minor ones unless one costs more than it gives, and say which in the note.

Order of work:
1. Code: the debugger, the grader, the stack view.
2. The lessons' content: tests, predictions, challenges.
3. Words, through the prose process.
4. The second pass, the walk and the check.

Push your local 994812f with the rest. Record in the note, item by item, what you did with each finding, and tell me when the check passes.

## Decisions across the module

1. **Addresses in the form the page writes them.** Every reviewer met this. The watch shows only decimal (R14 1968, R15 20, R1 64). The registers panel and the stack view lead with decimal, with the hexadecimal small and grey beneath. Every page writes addresses as three hexadecimal digits. The rule:
   - Wherever the debugger shows a value from 0 to 7FF (registers panel, watch, stack view, memory views), show its decimal and its three-digit hexadecimal at the same size.
   - The PC, R14 and R15 show the hexadecimal first, and so does a watch entry a figure presets as an address.
   - The watch reads a typed number as a program does: decimal, or hexadecimal after `0x`. 11.2 says so once, where the watch first appears.
   - A refused watch entry says why (for example, not a multiple of 8).
   - Do not make bare digits hexadecimal: the course has one language.

2. **The views a lead points at stay on screen.** Extend the browser test you added for the watch to the view each lead names: 11.2's and 11.6's log view, and 11.4's and 11.5's stack view.
   - On a phone the order is: the buttons, the ▶ line, the watch, then that view, then the rest.
   - On a desk that view sits beside the listing.
   - Each figure shows only the panels its program uses. Keep the display where the program writes it; leave out the lamps and sensors where nothing reads them.

3. **The stack view.**
   - Draw the word R14 names first. The lowest address is then at the top, addresses rise down the view as in every memory view, and "the top of the stack" is at the top.
   - Draw only words that were pushed: no rows of X for words nothing pushed, and never the ROM word a trapped push did not write (11.5's and 11.6's 3F8).
   - Fold a long run of like frames, so that a run into the ROM keeps its result text near the status line.

4. **How a run ends: one word each, course-wide.**
   - A run *stops* at its `stop`.
   - The machine *halts* with a cause.
   - The debugger *pauses* at a breakpoint, and the run can go on.
   - A run is *cut off* after 5000 instructions.
   - The end before an instruction that needs a register nothing has set is none of these. Give it its own word (for example, the debugger *ends* the run there) in every place it shows: strings11 `stops`, 11.1's model note and 11.6's list. Change the note's decision to match.
   - `program-compare`'s "Display at the halt" and "halted at the stop" take the stop's words for a run that ends at `stop`, course-wide. Check that Module 10's pages still read right.

5. **The grader (module-wide).**
   - One sentence per failed check. Add the display's sentence only when the display differs, and an end's sentence when the end differs (11.1's finding 4).
   - Put the tests' return point where a fall-through cannot reach it: a function that runs off its end must not count as "a return through R15".
   - Feedback never names the tests' own stop as if the learner wrote it (038, 0B0, 0D8).
   - Each program task with call tests says what a call test sets before it calls (R10 to R13 and R14), and that the call returns to a stop of its own.
   - For a name the tests call and the program lacks, use your 994812f, and still run the whole-program tests that do not need the name.
   - The empty log's placeholder word must be a value no right answer could be (99 catches 11.7's mistake). This is in `logData`, for 11.2, 11.6 and 11.7.
   - Each challenge must test what it teaches:
     - **11.3's construction:** the tests' `overBy` changes every register the convention lets a function change (R0 and R2 to R9) before it returns, so a caller that relies on one fails. The tests also count two returned calls.
     - **11.4's `roomsOver`:** count `overBy`'s calls and check the stack's depth. Calls alone would let R15 sit in a free register.
     - **11.7's new requirement (decision 6):** the same checks.
   - "Run with" offers a challenge's call tests as well as its whole runs, so that 11.7's "test each function alone in the debugger" can be done.

6. **The capstone needs the stack.** As the plan's owner, I change the plan here. As built, 11.7 passes every way in without a push, a kept register or a nested call; the reference passes without `R14 <= 0x7C0`. So the module's hardest part is never used in the lesson that ends it.
   - Add one function of the learner's that calls the other three and keeps what it needs through the calls. For example, `report`, called by the main program, with the list's address, its count and the limit as arguments.
   - Test it alone, with the call-count and stack-depth checks.
   - State it in the task's requirements, the outline and the hints.
   - Say in the task who reads the words at 400 and 408.
   - Record the change in the note.

7. **Names and words.**
   - No possessive on a function's name ("the first line of `warmRooms`"), as the fact sheet says.
   - "Return" means going back. Where a page also means a function's result, say which.
   - Singular forms for 1: "1 instruction run", "refuses 1 line". The depth chart's label should read "38 instructions run".
   - Rename the function `check` (11.4), the one the early review's renaming missed.

## Each lesson, as the sceptics handed them over

11.1 assembly: the sceptic's list for the build
1. Blocking. The option "005: the position of fine counting from 000's line as 1" is false. Counting from 1, fine at 014 is the sixth; 5 is 014 ÷ 4. Correct it, or drop the descriptions (see 2).
2. Should fix. 11.1's prediction options give their reasoning, unlike every other Module 11 prediction. Use bare values and add a tempting wrong count (002, the instructions jumped over, or 00C, the bytes not divided by 4).
3. Should fix. The listing figure's verdict says "The run gives 003" for a constant the assembler made. Give listing questions about the assembler their own verdict string.
4. Should fix (module-wide). gradeProgram adds the case's display sentence to every failure. Add it only when the display differs, and if wanted add a sentence about ending at `stop` when the end differs.
5. Should fix. On a phone the room-A debugger's devices sit below the screen while Step is on it, so the stores at 010 and 014 change nothing the learner can see. Put the devices before the registers on a narrow screen, or show only R2 to R4. Make the lead point at the devices as well as the registers.
6. Minor. The mistakes lead names "Put the program back", but the button reads "Put back the program" and appears only after the first edit.
7. Minor. Singular forms for 1 in `ran` ("1 instructions run") and `refusedTitle` ("refuses 1 lines").
8. Minor. Three word fixes: "The first reading" (a pass) in explanation item 5; "This same model" with nothing for "this" to point at in the investigation; "Listing" and "assembler" in the opening figure's captions before the motivation defines them.
9. Minor. The text after the mended run and the generalisation both say the assembler checks form and a run shows what the program does. Say it once.
10. Minor. "pauses" names the stop at an unset register, after which the run cannot go on. Use a word the module does not use for breakpoints, and update the module note's decision.
11. Minor. On a phone the first comment lines of the construction and mistakes boxes are cut off. Shorten them to fit; do not wrap the box, and keep the refused lines at 3, 4 and 7.
12. Minor. "How the page differs from hardware" presents the debugger attached to the circuit as what a real machine's debugger is. Narrow the sentence to that kind, or name the program kind without Module 11's barred words.

11.2 lists: the sceptic's list for the build
1. Should fix (narrowed from blocking). The watch reads a typed address as decimal unless it starts with 0x, and the page never says so, while every address on the page is three hex digits. word[040] and word[048] silently show instruction pairs; 038, 068, and 010, 018, 020 in the Try its are refused without a reason (not multiples of 8). The watch shows R1 only in decimal. Names work (word[log], word[R1], word[R1 + 8]). Fix: say on the page how the watch reads a number, show an address register in hex in the watch, and make the refusal say why. (Do not make bare digits hex: one language.)
2. Should fix. The opening figure's seventh press runs to the stop and shows R1 as 112/70, which answers the prediction. End the figure at the sixth reading, or hide R1 at the stop.
3. Should fix. At `next`, R3's rise shows beside the next, colder reading. The counted reading appears only in "was" and in R5, off screen on a phone. Say what word[R1] holds at `next` and where the counted reading shows (moving the breakpoint changes pinned facts).
4. Should fix. The walk's log view, which the lead points to, sits below the registers and devices: off screen on a phone at every pause, and on a 900-high desk from pause 3. Put it beside the watch, keep the display, drop the lamps and sensors.
5. Minor. The Generalisation's "the count comes first in the log" contradicts the page's split between count and log. Say the count is kept before the log.
6. Minor. Four words with two meanings: halt (the compare figure's "halted at the stop" against "Stopped" and "halted with cause"); pause (also where the run cannot go on, an unset register); Step (also the Explanation's fourth part); word ("8 bytes" against the listing's 4-byte Word column). The halt and pause wordings are recorded decisions in shared strings: the managing session decides.
7. Minor. Cut the repeats (the length argument and the registers' jobs in Motivation and Explanation; the signed rule in failure experiment and Generalisation; the 070 sentence in prediction and walk outcome) and add R4 <= -180 to the set-up.
8. Minor. The reflection's question can be answered with a loop. Add the fact that rules it out: the two checks sit at different places and lead to different work.
9. Minor. The opening figure runs "the program" before any program is introduced; names 018 with no listing; says "1 instructions run." after one Step (shared string); leaves its left column empty on a desk.
10. Minor. The empty test log's data shows `log: word 0`. Say the word is there only so that `log` names an address.

11.3 functions: the sceptic's list for the build
1. Should fix. "The larger amount" passes a caller that keeps room A's amount in R3, R4 or R6 to R9, one with no calls, and one that edits overBy. Make the free and argument registers fail (R0, R2 and R5 already do), and check two returned calls (the grader's `calls` key counts returned calls).
2. Should fix. The investigation's watch shows R15 and the PC in decimal (12, 28, 48) while the steps, listing, status and Registers panel use hex (00C, 030). Show hex in the watch as the Registers panel does (the watch uses signedText; the panel uses WordValue).
3. Should fix. The test's `test_return: stop` sits straight after the learner's program. Failures name an address beyond their listing ("stop at 030", listing ends at 02C), and a fall-through counts as "a return through R15" (a function whose path for a reading equal to the low end falls off the end passed all 10 tests). Move the return point where a fall-through cannot reach it, and say on the page where a test's call returns.
4. Should fix. The construction and explanation say R10 to R13 are kept; the challenge demands R10 to R14 "as the calling convention" with no reason given. Make them agree, without lesson 4's term (stack).
5. Should fix. The question figure puts 22 against 13 down to "a call and a jump back", which explains 4 of the 9 (the rest: over: R1 <= R5 twice, overBy's second R0 <= 0, main's R0 <= 0 and its branch). Room B's copy is not the same lines, and "Both turn ALARM on" is not shown (no lamps in the figure). Make the two programs differ only by the call and the return, or account for the 9, and show the lamps or drop the claim.
6. Minor. "A breakpoint stops the program" should say pauses. "the main program" is used before it is introduced. "Put back" drifts to "restore" and "preserve".
7. Minor. Cut one of each repeated pair: R15 as the convention's choice, and the purpose of a convention (explanation against model-versus-reality), and "mended" against "fixed in one place" (question figure against generalisation).
8. Minor. A program whose function has another name gets "does not assemble / Line 0". Say instead that the tests call outOfRange by name and the program has none, and still run the whole-program tests. (The build's local 994812f already changes this message.)

11.4 stack: the sceptic's list for the build
1. Blocking. roomsOver passes all 9 tests with no call and no push. Add a check of overBy's calls and a check of the stack's depth to the six call cases (calls alone lets R15 sit in a free register: overBy writes only R0, R1 and R5; the reference gives calls 2 and stackWords 3), and name both in the task's list of what each test checks.
2. Should fix (module-wide). The watch shows only decimal, and the registers and stack view lead with it, so the addresses the prose names never appear where the learner looks (R14 1968, R15 20; the stack view's 7B8 reads 20, the same number the display ends on). On a phone the watch is the only value panel beside Step. Show addresses in hexadecimal there. Keep watch-first on a phone (the recorded decision, tested).
3. Should fix. Offer 044 (R15 while overBy runs, which the explanation rebuts) among the prediction's options (010 repeats 11.3's prediction). Replace "The listing shows what instruction each line becomes", which is untrue before the check (the words show after it).
4. Minor. The stack view draws the word R14 names at the bottom while the prose says "on top" and "sit under"; make them agree.
5. Should fix (module-wide). Call-test feedback names 038 (the stop the tests add) and 1010 (the tests' R10), which no task mentions; "Try it" offers only whole-program runs, so 1010 cannot be reproduced there. Say in the task what a call test sets and adds, or name the source in the feedback. Same gap in 11.3, 11.5, 11.7.
6. Should fix. The generalisation's first paragraph makes the stack the cause of inner calls ending first ("So a call made inside another ends first"), and repeats the failure outcome verbatim. Correct fact 1 of brief 4RC and redraft that paragraph only.
7. Should fix. Rename `check`, the one function the module's rename missed (captions "a run of check", "The program with check", the field "after check returns"; the page also has "Check my prediction").
8. Minor. The construction's first two questions have answers the page already gives for sumOver; ask about addresses the page has not given.
9. Minor. The depth chart's call ticks are unlabelled grey marks, 1 px wide and 6 px long; make them visible (depthCalls "Calls" is defined and unused).
10. Minor. Drop the reflection's clause about a second call of the same function ("even when one call of a function is still in progress as another call of the same function starts"), which answers the closing question.
11. Minor. "the store" in the model-versus-reality note collides with the reflection's cold store; name the push's store another way.
12. Minor. Fix "1 instructions run.", "refuses 1 lines." and "38 Instructions run" (depthRan after the count), and put "ran" back for "executed" in the investigation's closing text.

11.5 recursion: the sceptic's list for the build
1. Should fix. Say which stack group holds a call's room and count: the group of the call it makes, as its caller's R10 to R12 (at the deepest pause the hall's group "called from 00C" holds 7B8 16/10 then X, X, X; A0 and 2 sit one group down). Make the explanation's "Each call has its own room's address, its count so far and its return address on the stack" agree with the groups.
2. Should fix. Show R1 and R14 in hexadecimal in the watch, as the registers panel does. The R14 field's failure sentence must say the answer is hexadecimal (11.4's equivalent does). Hexadecimal first in every panel is a module-wide decision.
3. Should fix. Place the stack so step 2 ("Watch the stack grow by 4 words") can be done without scrolling at any width (stack starts y 1202 on a phone, 929 on a tablet, 695 on a desk, "← R14" at 1866 / 1592 / 1358); the challenge's "Try it" needs the same. Removing the unused lamps and sensors alone will not do it; the display is used.
4. Should fix. Name the rooms in words where they are introduced, linking "the deep freeze" to `deep`. Rename the room at 0D0, since "store" also means the cold store and the instruction ("the ROM refuses to store there"). Minor: `deep` beside "deepest", and `roomA`/`roomB` beside "Room A's sensor".
5. Should fix. Put the failure experiment's result text next to its status line or fold the repeated groups (after Run to the end the figure grows to 6,617 px on a phone, the result 5,943 px below the status), and mark the 3F8 row as never written.
6. Should fix. One feedback sentence per construction field, each naming the rule that field misses (calls, the longest way in, R14 in hexadecimal), as docs/authoring.md requires.
7. Minor. Hint 4 names rooms (lobby, coolB, frost, blast) the construction's figure never shows: give their addresses or label the figure's rows.
8. Minor. Prediction: put back "then" in "The listing shows the program's words…" (the words show after the check).
9. Minor. Model versus reality: replace the sentences that repeat 11.4's note and the failure result. Keep the note (required) and its new parts.
10. Minor. Cut the adjacent repeats: the popping at the end of explanation paragraphs 2 and 3, the last-case sentence (explanation and generalisation), and the longest way in from construction to generalisation. Say what the depth chart's 13 marks are.
11. Minor. Reword "so the calls stop" and "`farthest` from the hall is 4". Decide the possessive on function names once for the whole module.
12. Minor (grader, module-wide). A call-alone failure should not name the tests' own stop (for example "stop at 0B0") as if the learner wrote it.

11.6 debugging: the sceptic's list for the build
1. Blocking. The explanation's list of how a run ends: put the walk past the log into unset RAM under the pause item (c1's starting text on the empty log ends "The debugger paused before the instruction at 020: the branch compares R5, which is not set. 834 instructions run."). Give the cause 31 examples their conditions: a loop of pops, or a walk that leaves the memory (both happen: a function that never pushes R15 pops past 7C0 through the devices to cause 31; a count walking backwards past its first reading halts with 31 at the load). Add cause 11 (goto R15 with a word outside the ROM, e.g. -190 or 7B0), and limit cause 12 to in-ROM words that are not a multiple of 4.
2. Blocking. The failure experiment's stack panel shows 120 words the main program never pushed ("Main program" 7B8 X … 400 X), and the ROM's 0 at 3F8 as sumOver's (the push trapped and stored nothing; stackRows draws from 7B8 down to R14 whenever R14 is at or below 7C0). The figure is 3,461 / 4,068 px tall (desk / phone), with the result 3,243 / 3,694 px below the status. Drop the panel or draw only pushed words; keep the result near the status.
3. Blocking. "It runs on every log and stops at its stop" is false for the empty log (pause at 020 after 834). Limit it to the figure's logs, or add the empty log with an `end` check (log-results supports one). Say a line is wrong, not "changed" (one line changed and one was added; the fix is a deletion).
4. Should fix. Method step 1 says "the smallest you can" and picks log 1, yet logs 5 (one reading) and 4 (two) are smaller and fail. Use one of them, or say why log 1.
5. Should fix. c2's hints 1 and 2 hold only if the step is mended first. A breakpoint on `next` shows R11 96 first (after 5 instructions), and the count mended first leaves three logs halting with cause 33 ("2 of 5 tests passed"). Make the hints hold in either order, or say which mistake comes first.
6. Should fix. The watch shows decimal 80 to 104 while the prose says 050 to 068, and the hex line in the registers panel is unlabelled. Hint 4 mixes `074` and 96 (96 is the address of count, which the listing prints as 060). On a phone the Log starts at 1128 px of 844. Preset word[R1] or show hex, and bring the Log nearer the watch. Keep the display.
7. Should fix. "count" means the data word, the result and the program ("Mending the count", "The count one short…"; "R13: count" beside the mistake `R11 <= count`). Keep it for the word.
8. Should fix. The failure experiment and the note repeat lessons 4 and 5 (a push into 3F8 and cause 34; the real-machine note is the third telling), and the after-text answers its own question ("at 000: which line set the value R14 held?"). Use a halt the module has not shown, keeping the plan's store to the ROM in another form (the explanation's own "a store to the log") or agreeing its removal, and give the note its own point.
9. Should fix. Practise choosing an edge log (the objective "Choose test logs that reach the edges" is never practised), and add a -180 reading to the tests (a count that includes the limit now passes all 6). Reword "decides the answer first or last".
10. Minor. "Pause" is used for both a breakpoint and a dead end; "task" ("Task expects", "what the task asks") appears in an opening that sets none.
11. Minor. c1's hint 2 gives the answer at rung 2.
12. Minor. The header comment in debugging.ts is stale (names the old c2's mistakes); the typed log lists and "six"/"5" duplicate COUNT_RUNS/OVER_RUNS, which "Run with" already renders.

11.7 log-report: the sceptic's list for the build
1. Blocking. Hint 5's labels `highest:`/`warmer:` must be `highestOf:`/`warmCount:` (with those two changes it passes 15 of 15); add a facts test that grades the last hint pasted over the outline's stubs.
2. Should fix. The prediction's answer is already on the page (log 5's -190 under "Task expects" at load, then the "Run all" result), and the prose says `lowestOf` "finds the lowest reading … and writes it to the display"; `lowestOf` does not write the display (the main program does, at 00C). Ask about something not yet shown, and describe the function by what it leaves in R1.
3. Should fix. The empty log's placeholder `log: word 0` lets a function that reads before testing the count pass 15 of 15; use a placeholder no right answer could be (99 catches it, and the reference still passes). `logData` is shared with 11.2 and 11.6.
4. Minor (the managing session decides the requirement, below). The lowest and highest go to RAM at 400 and 408, which no device shows; say who or what reads them.
5. Minor. Hint 1's "test it alone in the debugger" names a run "Run with" does not offer (whole runs only), and the empty start does not suggest stubs or a main program that calls only the functions written so far.
6. Should fix. When the tests call a name the program lacks, the page says "The program does not assemble. Line 0" although it assembles; say the tests call that name and no line has it. The failed calls' "stop at 0D8/0D0" is the tests' own `stop`, which the page never shows.
7. Should fix. The explanation's reason that recursion is not needed (the readings' order) contradicts 11.5's reason (each part leads one way on); use 11.5's.
8. Should fix. "Start from the outline" and "Start from an empty program" replace the program at once with no undo; ask first, as "Clear work" does. The prose's "the starting text" and the button's "the outline" should name the same thing.
9. Minor. The task and the empty start write `400`/`408`, but `word[400]` is decimal and halts with cause 34; write the addresses as a program needs them, or state the `0x` rule once.
10. Minor. In the construction, "uses only R1 to R9" is false (R0 is used), and "`R14 <= 0x7C0`, as every program that keeps the calling convention does" is false (lessons 3 and 6 omit it, and the reference passes without it).
11. Minor. The question section says "the starting text" seven sections before it appears, and the text after "Run all" names the three functions before the motivation introduces them.
12. Minor. Cut the investigation's restatement of the prediction's explanation and one of the two devices paragraphs (generalisation and reflection); fix the "not one that looks right" ambiguity; the failure experiment's six-card figure puts "Run all" 2,109 px below its lead on a phone, though only 408 matters.
13. Minor. "stop for good" means a halt; "return" is used for both the result and the jump back without saying which; hint 3 is not an example and "keeps a reading" is ambiguous.
