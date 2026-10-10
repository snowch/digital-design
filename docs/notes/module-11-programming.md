# Module 11: programming and debugging

A working note, written as the module was built, on the branch `module-11-programming`. Times are
read from the clock (`date -u`). "The building session" wrote the code and the briefs and checked
every draft; "the drafting subagent" is the Haiku subagent that wrote every learner-facing sentence
from a brief of checked facts. The plan is `docs/notes/module-11-plan.md`.

## Times

- Started: 2026-10-07 16:05 UTC (first command in the session).
- Outline settled and sent: 16:26. Model, assembler and graders: 16:36.
- Lessons: 11.1 at 16:58, 11.2 at 17:14, 11.3 at 17:21, 11.4 at 17:26, 11.5 at 17:33, 11.6 at
  17:42, 11.7 at 17:45. Second pass, each lesson read whole: 17:50.
- Mechanical walk and its fixes: 17:50 to 18:05. Note written: 18:05.
- The early review reached the session at 18:05; its items were done from 18:05 to 18:55 (below).

## Log

- 16:05 to 16:30 Read CLAUDE.md, the plan, `docs/plan.md`, `docs/authoring.md`, `docs/style.md`,
  `docs/machine.md`, `docs/isa.md`, Module 10's note and plan, lessons 8.5, 10.1, 10.4 and 10.5,
  the authors' assembler (`assemble.ts`), the reference (`machine.ts`), `runProgram`,
  `program-compare`, the book's grader and editors, and the schema. Scanned every lesson's words
  for the candidate terms (below, "Terms").
- 16:26 The outline committed (below) and sent to the managing session.
- 16:36 The model's half: the assembler's refusals with codes, `debugger.ts` and
  `program-tests.ts`, with their unit tests.
- 16:40 to 17:45 One lesson at a time: briefs written as facts and checked against the model, the
  drafting subagent's sections checked and their faults fixed with the fewest words or sent back
  (`drafts/1-fixes.md` to `drafts/7-fixes.md`), the figures, the challenges, the facts tests, the
  browser tests. After lesson 11.1 the managing session was told the first lesson was complete.
- 17:28 `main` (1031410) merged. `course.css` conflicted where both added rules at the file's end;
  the first resolution left Module 10's last rule without its closing brace, mended in 6ea9f7e.
- 17:50 The second pass, each lesson read start to finish (`drafts/7-fixes.md` holds its list).
- 17:50 to 18:05 The mechanical walk (below) and its fixes.

## The outline

Seven lessons. The split falls where the learner's program gains a new kind of part: text and a
tool (1), a list walked by a loop (2), a piece of program used twice (3), a piece of program that
uses another, which needs memory of its own (4), a piece that uses itself (5), a method for the
mistakes all of these make (6), and a program the shop can use (7). Each answers the question the
one before ends on.

1. `assembly`, "How can you write a program as text, and let a tool make the words?": the
   assembler (one line, one instruction, written as its transfer; a label names an address the
   tool works out; `word` data; the listing), its refusals in the course's words, and the debugger
   (step, run, the line about to run, the registers and devices, every stop's reason). Challenges:
   a program, the warmer room's reading on the display, run over several pairs of readings; be the
   assembler for three lines (answers). Introduces **assembly**, **assembler**, **debugger**.
2. `lists`, "How does a program work through a list of readings kept in memory?": a log of
   readings kept as words, walked by a register that holds an address and steps by 8, and a count;
   a decision inside the loop; signed and unsigned compared on readings of both signs. The debugger
   gains breakpoints, a watch and a memory view with the address register marked. Challenges: the
   position of the first reading warmer than the limit (0 if none); the largest rise between two
   neighbouring readings. Introduces **breakpoint**.
3. `functions`, "How can a program use one piece of program from two places?": a call keeps the
   return address in R15, `goto R15` returns; arguments in R1 to R4, the result in R1; free and
   kept registers; the convention as an agreement the hardware does not know. The function is
   `overBy` (how far a reading is above a limit, or 0), which works in R5. Construction: the
   caller's side, the larger of the two rooms' amounts, which must keep room A's result in a kept
   register through the second call (in R5 it is lost). Challenge: a function of the learner's
   own, `outOfRange` (three arguments, the fridge's range), tested by calling it directly.
   Introduces **function**, **argument**, **calling convention**.
4. `stack`, "What must a function that calls another keep, and where?": R15 overwritten by the
   inner call, the run cut off; a stack in RAM from `7C0` down, pushed and popped with R14; the
   convention's rows for R10 to R13 and R14 completed. The main program keeps ALARM's bit in R10
   through the call to `sumOver`, so the push and pop visibly save it; pops in the order of the
   pushes send the return to `001` (cause `12`). The debugger gains the stack view. Construction:
   the stack's addresses for `check`, a function the lesson lists and never runs. Challenge:
   `roomsOver`, which calls `overBy` twice and keeps two words. Introduces **stack**. ("Frame"
   was planned as a term and is not rationed; "Terms" says why.)
5. `recursion`, "Can a function call itself?": the cold store's rooms, each three words (its
   reading and the addresses of the rooms behind its two doors), counted by `warmRooms`, which
   calls itself behind each door. The stack rises and falls with the way in; a door that leads
   back runs it into the ROM (cause `34` at a push). Construction: the calls and the stack's depth
   for a second store (answers). Challenge: `farthest`, how many rooms lie on the longest way in.
   Introduces **recursion**.
6. `debugging`, "How do you find the mistake in a program that runs and gives a wrong answer?": a
   method (reproduce on the failing log, say what each part should leave, pause before the part,
   step and watch, find the first instruction whose result differs, fix, run every log); every
   way a run ends in plain words. Programs with real mistakes: a count off by one (the last
   reading never read), and a stack started in the ROM. Challenges: mend the count; mend a count
   over the limit with two mistakes the module has not shown, a list stepped by 4 (a halt) and the
   count read as the address of `count` (then a wrong answer). Introduces nothing.
7. `log-report`, the capstone, "Can you write a program the shop can use?": the day's report from
   a log (below). Introduces nothing.

## The capstone: the day's report

The plan's recommendation, kept. The tests add the day's log after the learner's program, as
`word` data: `count` (how many readings), `limit` (the warm limit) and `log` (the readings). The
program must:

- show on the display how many readings are warmer than the limit;
- light ALARM when any is, and no lamp otherwise;
- leave the lowest reading at `400` and the highest at `408` (0 for an empty log);
- end with `stop`;
- do the work through four functions, each tested alone as well: `report`, which the main
  program calls with the list's address in R1, its count in R2 and the limit in R3, stores the
  lowest and highest, and gives in R1 how many readings are warmer; and the three it calls,
  `lowestOf`, `highestOf` and `warmCount` (the last takes the limit in R3). Each gives its result
  in R1, puts back R10 to R14 and returns through R15. `report` calls, so it pushes R15, and keeps
  the address, the count and the limit in R10 to R12 through its calls (decision 6 of the reading
  review, below). The office's own computer reads `400` and `408` each morning.

Graded over several logs (an ordinary day, a warm day, one reading, an empty log, readings of both
signs), each log a test of the whole program and a test of each function called alone. The
course plan's three tiers are three ways into one challenge, not three challenges (a learner who
did one tier would see "1 of 3" for ever): the guided start is a skeleton with the functions'
outlines and the hints; the semi-guided way is the specification in the lesson, with an empty
program; the engineering way is the task's requirements and the tests alone. The editor offers
the skeleton or an empty program.

## The assembler's language

`docs/isa.md`'s proposal, unchanged in what it accepts. The learner's assembler is the authors'
assembler's parsing (one language: every lesson's program assembles alike), with every refusal
carrying a code the course's sentences are keyed by, all refusals of a program listed at once,
each naming its line. Refusals added, in both: a name defined twice, a name nothing defines (which
the authors' tool reported as "not a number"), a `goto` or `call` to a name on data.

## Figures

- `program-listing` (every lesson's prediction, 11.1's opening, 11.4's construction): a program's
  lines beside their addresses and words, names and the addresses they stand for, each branch's
  constant with its target; optionally a question before the words show, about the listing (a
  word, an address, a constant) or about a run from reset (`runAnswer`: a register, a word, the
  display, the calls), which the lesson's investigation then runs.
- `debugger` (from 11.1, grown): the program as text (editable where the lesson says), the listing
  in a box of its own height that keeps the line about to run in view, R0 to R15, the PC, the
  devices; step, step back, run, reset; every stop's reason; the run cut off after a set number of
  instructions; its `outcomes` shown only once the run has ended. From 11.2 breakpoints, a watch
  and a memory view with the registers that point into it marked; from 11.4 the stack view,
  grouped by the call that pushed. Without its listing (`listing: false`, a `runLabel`), it is
  11.2's opening figure: R1 moving down the log, one reading a press.

Each lesson's opening figure: 11.1 the colder-room program's listing; 11.2 R1 moving down the log;
11.3 the check written twice against written once; 11.4 `sumOver` with no stack, R15 overwritten
and the run cut off (the stack is the answer to it, so it is not drawn before the question); 11.5
the cold store's rooms as words; 11.6 the count on five logs beside what each asks; 11.7 the
starting text on six logs beside the report each asks for.
- `stack-depth` (11.4, 11.5): the stack's depth over a whole run, calls and returns marked. Its
  height is clamped at 120 words so a run that reaches the ROM still fits the drawing.
- `program-compare` (Module 10's, used unchanged in 11.2 and 11.3): signed and unsigned on readings
  of both signs (11.2); a program written twice and written once as a function, and a function that
  spoils a register its caller kept (11.3).
- `log-results` (11.6, 11.7): a program run over several logs, each log's readings and what the
  program left, beside what the specification asks.

Every figure runs the model: the listing is the assembler's output, the debugger steps
`machine.ts`, the depth chart is a recorded run's R14, and the results are `runScenario`'s ends.
None is drawn from data typed into the lesson.

The figures pass (8 October, with Module 12's; branch `figures-11-12`): the plan asked for "a
list in memory walked by a loop, the register that holds the address moving down it" and "the
stack as it grows and shrinks across calls, its frames marked", and both had shipped as rows of
a table. Now drawn, each a view of the debugger's state and stepped with it:

- 11.2: the log as boxes at their addresses, an arrow from each register that holds one, the word
  the last step stored outlined; in the opening figure and in the investigation, whose log now
  runs one word past the last reading so R1's arrow ends at `070`, after the prediction.
- 11.3: the run as lanes under the investigation's debugger, the main program and `overBy`, each
  call an arrow labelled `R15 ← 00C` or `R15 ← 01C`, each `goto R15` an arrow back with the PC.
- 11.4: the stack in the investigation as boxes, grouped by call, each word marked with the
  register it saves (the debugger now records it at each push), R14's arrow on the top. (The pass
  drew it from `7B8` down, upside down from the lesson's lists; the review put R14's word first.)
- 11.5: the cold store drawn as rooms from the room words, under the question's words (rooms and
  doors only, no count of calls) and in the investigation, where the room R1 names is lit beside
  the stack. The construction's second store stays as words: reading them is its skill.

11.6 and 11.7 are as they were. Before the pass, 11.1's debuggers drew their listing with no word column: B12
had set `words: true` on both, but the debugger's props schema dropped the key until the pass's
schema fix (a9ce1e3) let it reach the page. The review took it off the failure experiment's
editable debugger, where any program typed in would show its words and give the last challenge's
skill away; the second reading took it off the investigation's too, where row `008` showed the
prediction's constant before it was checked. So neither of 11.1's debuggers shows words. The drawings' facts are pinned in
`content/lessons/drawings.facts.test.ts`, and the diagrams test runs each to its end and reads its
labels at both widths. The briefs and drafts are in `docs/notes/figures-11-12/`.

The review of the pass (10 October; briefs Y1 to Y3): the drawings now sit within reach of the
step buttons, under the listing on a wide screen and after the watch or the stack on a narrow one,
in boxes of fixed height that follow the newest row. 11.2's log sets `070` apart, dashed under a
dotted line, as past the log's end; its thick-outline sentence went, since no step stores into a
drawn word. 11.3's lanes say each move in its own words ("a call goes to overBy"), and its
outcome no longer repeats the prediction. 11.4's stack draws R14's word first, keeps popped words
drawn and set apart, shows R14's place between a push's two lines with no box, and draws a folded
run of calls as its heading alone. 11.5's rooms mark the door a call about no room came through
(R10 the room, R15 `060` or `070` the door), say the lit room's name to a screen reader, and the
question's figure has a key of its own with no run in it. Module 11's text column in the
program-compare figure is headed "Line". No caption carries a backtick, and a content test says so.

The second reading of those fixes (10 October; brief Y5), nothing blocking. 11.1's investigation
debugger lost its word column, which showed the prediction's constant at load, and the motivation
lets a listing leave its words out. 11.2's table carries "past the log's end" for a screen reader.
11.3's drawing has a name of its own, with no "moves", and the end of its run stays on the screen.
11.4 keeps R14's arrow at `7C0`, with no box, once the last pop has run, and says "off the stack"
where it said "passed". 11.5 rings a door only while a call about no room runs, from its pause to
its `goto R15` (pinned: four steps for each of the seven), and on a phone its listing and stack
boxes are shorter, so the marked room is on the screen with the buttons. Two answers shown before
their predictions went: 11.5's depth chart counted the calls at load, and 10.2's layouts named the
field that moves; that sentence moved to 10.2's explanation.

The third reading (10 October, evening; brief Y7). 11.5's depth chart draws its marks for the calls,
which can be counted, and its sentence about them, only once the prediction is checked, and the
investigation's lead no longer counts the pauses. On a phone (375 by 812) its stack's box holds the
newest call's four words and the marked room stays on the screen at every one of the 13 pauses,
which a test now checks; the listing's box is 7rem, the rooms' 3.5rem, and the rooms' panel shows
no title of its own there. 11.3's short run is drawn whole on a wide screen. 11.4 draws R14's place
at `7C0`, past the RAM, apart from the popped words, whose hidden text now names their hexadecimal.
10.2's layouts hold the prediction's own instruction, and its packed words wait, until the
prediction is checked; its call bullet says a field moves.

## What was reused, built, and could be extracted

Reused unchanged: the reference machine (`machine.ts`, with Module 9's options), the schema, the
hint ladder, the challenge runner and the book's verdict cache, Module 10's `program-compare`, the
answer editor (for the three `answers` challenges and the one choice), the prediction gate the
earlier figures use.

Built:

- `assembleChecked` in `assemble.ts`: every refusal of a program, each with its line, a code and
  its values, sorted by line. `assemble` throws the first, as before, so every earlier caller is
  unchanged.
- `debugger.ts`: a run held as a list of states (so step back is an index), breakpoints, run to a
  breakpoint or the end, the 5000-instruction cut-off, the call frames read from the run, and a
  pause before an address, branch or jump that uses a register nothing has set.
- `program-tests.ts`: a scenario (the data the tests add after the program, the registers set,
  where the run starts) and `gradeProgramCase`, which checks the display, the lamps, any register,
  any word, how the run ended, the stack's depth, the kept registers R10 to R14, the calls made and
  the return through R15. A function is tested alone by starting at its name with R15 set to a
  `test_return:` the tests add.
- In the views: `ProgramEditor` (the `program` grader: the text, the tiers' starting points, the
  scenario chooser, the debugger under the text), `DebuggerView` and the `debugger` figure, and
  `program-listing`, `stack-depth` and `log-results`.

Could be extracted, under the rule of two:

- `program-compare` now has its second consumer (Module 10 and Module 11). It is the course's own
  (it runs the course machine), so a candidate for `docs/platform.md`'s course-side list rather than
  the platform.
- The prediction gate (choose an answer, press the check, the figure's result appears) is used by
  `program-listing` and the `debugger` figure, after Module 10's figures: its second consumer too.
  Its logic is a few lines in each figure; extraction into `platform/primitives` waits for the
  author's approval, as the plan says.
- The debugger is generic over any machine with a step function and a register file, but has one
  consumer. Not extracted.

## Edits to files on `main`

- `packages/dd-model/src/assemble.ts`: the refusals with codes, `assembleChecked`, `name ± number`.
  The authors' programs in Modules 8 to 10 assemble to the same words (their facts tests pass
  unchanged).
- `packages/dd-model/src/index.ts`: exports the debugger and the program tests.
- `docs/isa.md`: "The assembly language" names the refinements and the refusals; "The calling
  convention" says no role moved and states the kept-register rule as the tests check it.
- `packages/dd-views/src/book.tsx`: `grade()` and `ChallengeEditor` route a `program` challenge to
  `gradeProgram` and `ProgramEditor` (four lines).
- `packages/dd-views/src/strings.ts`: the `machine11` strings wired in, and six answer details
  (`asmAddress`, `asmBranchWord`, `asmLoadWord`, `registerRole`, `stackAddress`,
  `recursionDepth`).
- `packages/dd-views/src/interactives/index.ts` and `src/index.ts`: the four figures registered,
  `ProgramEditor` exported.
- `apps/course/src/styles/course.css`: a Module 11 block at the end.
- `tests/educational/diagrams.spec.ts`: its selector includes `svg.stack-depth`.

No earlier lesson's text changed. Lesson 10.5's reflection already asks the question 11.1 opens on.

## Terms

Introduced: **assembly**, **assembler**, **debugger** (11.1), **breakpoint** (11.2), **function**,
**argument**, **calling convention** (11.3), **stack** (11.4), **recursion** (11.5). 11.6 and 11.7
introduce nothing. `termProblems` reports nothing for any lesson, and no Module 11 lesson lists a
`termExemptions` entry.

Words used and not rationed, with the reason:

- *frame*: planned as 11.4's term. The view strings already use it for the overview's frame ("move
  the frame in the overview"), and the module0-strings test holds every view string to every
  rationed term. The lessons say "the words a call keeps on the stack" where a frame is meant, and
  the stack view groups them without naming them.
- *label*: the lessons say "name" ("a name followed by a colon names a line's address"); "label"
  appears nowhere learner-facing.
- *loop*, *return*: plain English that the lessons use in its plain sense; 8.5 already branches
  back.
- *array*: not used; "list" and "log" are.

## The assembler's language and its refinements

`docs/isa.md`'s language, unchanged in what it accepts, with one addition and new refusals.

- Added: an address written as a name plus or minus a number (`word[log + 8]`), so a program can
  read a word inside a list by name. The plan allowed it as a refinement. No lesson's program needs
  it yet; the model's tests use it.
- Added after the early review: a `word` may be written as a name, which the assembler replaces
  with that name's address on its second pass (`hall: word -150, prep, store`). 11.5's rooms need
  it: each room holds the addresses of the rooms behind its doors. A name nothing defines is
  refused as `unknownName`, on the data line. `docs/isa.md` says so.
- New refusals, each with a code and a sentence in `strings11.ts`: a name nothing defines
  (`unknownName`; before, "not a number"), a name defined twice (`twice`), a branch or call to a
  name on data (`dataTarget`), a number too wide for its `word` or `byte` (`wordTooWide`), a word
  the language uses or a device's name used to name a line (`reservedName`), `=` for `<=` (`useArrow`), a multiply
  (`noMultiply`), a line doing two jobs (`twoJobs`, as `R1 <= R2 + R3 + R4`), a store of a
  constant (`storeRegister`), a comparison with a constant (`compareRegisters`), a call that does
  not say which register keeps the return address (`callRegister`), an address in a form the machine lacks (`addressForm`), and a branch
  too far (`tooFar`).
- `tooFar` cannot happen within the 1 KB ROM: a 12-bit constant reaches 2048 instructions either
  way, 8 KB. The refusal is kept so the assembler is right if the ROM grows.

## The calling convention

Unchanged from `docs/isa.md`: R1 to R4 arguments, R1 the result, R5 to R9 free, R10 to R13 kept,
R14 the stack (from `7C0`, growing down), R15 the return address. The tests check the convention as
a function's caller sees it: R10 to R14 hold, after the return, what they held before the call
(the tests start them at `0x1010` upwards and R14 at `7C0`), and the run reaches `test_return`.

## Decisions taken inside the plan

- The capstone's three tiers are three ways into one challenge (the outline, the
  specification with an empty program, the requirements alone), as the outline says.
- The plan's lesson 6 mistake "a signed comparison on unsigned values" was first built as an
  unsigned comparison on signed readings, since no program in the shop holds a value meant
  unsigned. After the early review, 11.6 drops it with the other mistakes the module had already
  shown (item 7 below); the unsigned comparison stays where 11.2 shows it.
- Recursion is taught on a job whose work nests (early note 2, review item 5): the cold store's
  rooms, each leading to up to two more. A loop could do it only by keeping a stack of its own, so
  the lesson's point is what recursion keeps on the stack and what that costs, and the depth follows
  the longest way in. Showing the log newest first, the first build's example, is done more simply
  by a loop that walks backwards.
- `overBy` works in R5, a free register, as the convention allows. That makes 11.3's construction
  honest: a caller that keeps room A's result in R5 loses it, on readings the tests include.
- One word for each way a run ends, course-wide since the reading review (decision 4): a run
  *stops* at `stop`, *halts* only for a trap cause, *pauses* only at a breakpoint, is *cut off* at
  5000 instructions, and the debugger *ends* it before an instruction that needs a register nothing
  has set. Module 10's `program-compare` now says "The run stopped at its stop, at …".
- The watch compares each register with its value when the run last paused, not one instruction
  back: after "Run to a breakpoint" that is the change a learner asked to see.
- A register nothing has set reads X, and the debugger ends the run before an address, branch or
  jump that would use it, naming the register. The grader reports the same as a run's end
  (`unknown-…`). This is what a learner meets most often, a forgotten `R0 <= 0` or a missing
  `R14 <= 0x7C0`, and the machine model already carries X.

## The SystemVerilog this module brings

None. The plan allows testbench constructs; nothing in Module 11 needs them, since every program is
tested on the instruction-level model. They are left to Module 12, whose circuits need them.

## The mechanical walk

Each Module 11 page was opened in Chromium at 1280 and 768 pixels in the light theme and 375 pixels
in the dark, every control pressed (step, step back, run, reset, pauses, watch, the scenario
chooser, the tiers' buttons, every prediction), each challenge run with its starting text and with
plausible wrong programs. Found and fixed:

- `<=` drawn as `≤` by the code face's ligatures, in listings and the watch field: ligatures off
  there.
- On a phone a listing was 78 to 93 pixels too wide: a rule meant to keep the address and the word
  whole also stopped the line column wrapping. Now by class.
- The depth chart's labels measured 10.9 pixels, under the 11-pixel floor: now 13.
- Option labels showed backticks; words wrapped inside a value on a phone.

After the fixes no page logged a console error or scrolled sideways at any width.

Browser tests added (`tests/educational/module11.spec.ts`): every challenge completed with its
reference; a list of plausible wrong programs, each rejected; the assembler's refusals shown with
their lines; a reload keeps a completed challenge; the debugger's step, run and step back; the
prediction gate; the mistakes figure mended; breakpoint and watch; the tiers' buttons. The suite
ran at both widths alongside the diagrams and aesthetics tests, which pass for every Module 11
figure. The ten stored-screenshot failures this container shows on `main` (Module 10's note) are
the same here and none is Module 11's.

## The managing session's early review, and what was done

The review of 11.1 to 11.5 at 7eaaf1b (and its three earlier notes) reached this session at 18:05,
queued since 16:27 and 17:46. The full check then running was stopped. Each item:

1. **The learner cannot watch the debugger while it steps.** The listing sits in a box of its own
   height (17rem on a phone, 20rem from 481px, 26rem from 60rem) that scrolls itself, never the
   page, to keep the line about to run in view, with its header held. On a desk the watch, the
   registers, the devices, the stack and the memory sit beside it; on a phone below it, the watch
   first. The pause toggles are 28px tall from 481px and stay 40px on a phone. A browser test, at
   both widths, steps, runs to a breakpoint and steps back on 11.2's, 11.4's and 11.5's long
   debuggers and checks that the buttons, the ▶ row (inside its box) and the watch are on screen.
2. **Results before the run.** Every Module 11 debugger's result text is its `outcomes`, shown once
   the run has ended (and the prediction, where there is one, made). 11.1's mistakes text waits for
   the mended program's run. `log-results` already waited for "Run all". 11.5's failure experiment
   is one figure now, so no lead answers another figure's question. A browser test checks three
   figures' results are absent at load and present after the run.
3. **Predictions the page answers.** Each prediction now asks about something the page has not
   said, offers the tempting wrong answer, and labels options with the value alone: 11.2 where R1
   ends (`070`; `068` tempting); 11.3 what R15 holds when the program stops (`01C`; `00C`, `018`);
   11.4 the word at `7B8` while `overBy` first runs (`014`; `010`, the call's own address); 11.5
   how many calls (13; 6); 11.6 R2 at the first pause, its explanation no longer naming the line
   the construction asks for. 11.4's failure experiment is new (item 8) and its lead says nothing
   of the result.
4. **Challenges the page answers; constructions weaker than challenges.** 11.3: the roles quiz
   (whose R1 had two true answers) is gone; the construction writes the caller, the challenge a
   new function, `outOfRange`. 11.4: the construction asks the stack's addresses of `check`, which
   the lesson lists and never runs, including the word left at `7B8` after the pops; the challenge
   writes `roomsOver`. 11.5: the construction works out the calls and depth for a second store; the
   challenge writes `farthest`. 11.6's prediction explanation no longer names the line.
5. **Recursion.** Rebuilt on the cold store's rooms (above). `word` takes a name (above).
6. **The same debugger twice.** Each prediction is now the listing with its question (the
   `program-listing` figure asks about a run through `runAnswer`); the investigation does the
   running. 11.4 has three debuggers (the lost return, the stack, the swapped pops), not five.
7. **11.6's second challenge.** Two mistakes the module has not shown: a list stepped by 4 (cause
   `33` at the load) and the count read as the address of `count` (then a wrong count, 94 on log
   1). Both show on every test log.
8. **Words.** Functions renamed so a sentence cannot absorb them: `overBy`, `sumOver`, `roomsOver`,
   `outOfRange`, `warmRooms`, `farthest`, `lowestOf`, `highestOf`, `warmCount`; the fact sheet
   (`briefs/00-module.md`) gained a section on them and on the words read two ways. "Either
   reading", "without a word" and calls "at once" are gone. The untrue statements are rewritten
   from new facts: the stack is shared and each call's words are its own; 11.5's reflection points
   at 11.2's and 11.3's wrong answers; no function "keeps two words through both calls". 11.4's
   main program keeps ALARM's bit in R10, so the push protects something the learner sees. 11.4's
   failure experiment is pops in the wrong order (cause `12` at `001`). Captions name what a
   figure shows. "Frame" left 11.4's objectives.

The early notes: opening figures are named under "Figures"; recursion as item 5; the capstone's
question, prediction and failure experiment are each about the report (its six logs, `lowestOf` on
log 5, a `highestOf` started at 0), and its other sections draw on the module rather than repeat it.

Found on the way and mended: a failed test of a function said "registers the function did not put
back None; whether the run came back to R15 yes". It now says "R10 to R14 as they were; a return
through R15" (brief 8K). 11.5's opening figure first rendered empty, its memory region named by an
address the panel does not read; it is named `hall` now, and a browser test holds it.

Every new word came from briefs 2R to 8K, drafted by the drafting subagent and checked; the fixes
of fact are in `drafts/*-fixes.json`, the second pass's in `drafts/*-pass2.json`. Two drafts went
back: 4RA's question (a false fact about the calls' arguments, and the result told before the run)
and 2R's generalisation (an invented sentence).

The mechanical walk was repeated on the rebuilt pages, at 1280 and 768 in the light theme and 375
in the dark: no console error, no sideways scroll. The drawing and look tests pass for every Module
11 figure; the ten stored screenshots that fail in this container fail on `main` too.

## The reading review of 7b2a194, and what was done

The review is kept verbatim in `module-11-programming/review-1.md`. Its order of work was kept:
code, then the lessons' content, then the words through the prose process (briefs `1R` to `7R2`,
`8M` and `8N`; drafts and fixes in `drafts/`), then the second pass, the walk and the check. Every
blocking and should-fix item is done. Two minor points were judged to cost more than they give,
and are marked "not done" below.

### The decisions across the module

1. Addresses. Values from 10 to 7FF show decimal and three-digit hexadecimal at one size; the PC,
   R14 and R15, and a watch a figure names as an address (11.2's and 11.5's R1), show hexadecimal
   first. The watch reads decimal, or hexadecimal after `0x`, and a refused entry says why (a name
   it does not know, an address not a multiple of 8, or outside the memory). *Not done:* values
   below 10 show decimal only, since their hexadecimal is the same digit; Module 12's review
   (A4) narrowed this to values that are not addresses: the PC, R14, R15 and a watched address
   show three hexadecimal digits at every value (`004`), in every debugger, this module's too.
2. The views a lead points at. On a phone the order is the buttons, the ▶ line, the watch, the
   view, then the rest; on a desk the view sits beside the listing. Only the devices a program's
   lines name are shown. On a phone the listing, a long region of memory and the stack are short
   boxes that keep their current row in view, and the watch's line of help is kept for a screen
   reader only, so the four fit an 812-pixel screen. The browser test checks 11.2's and 11.6's log
   views and 11.4's and 11.5's stack views at both widths.
3. The stack view draws the word R14 names first, only words a push stored, and folds a run of
   more than three like groups.
4. The words for a run's end, course-wide, as in "Decisions taken inside the plan" above.
5. The grader: one sentence per failed check; the tests' return point sits after a guard word a
   fall-through cannot reach, and is never named; the tasks say what a call test sets; a missing
   function fails only its own tests; the empty log's placeholder is 99; 11.3's tests' `overBy`
   spoils R0 and R2 to R9 and the tests count 2 calls; 11.4's tests count calls and the stack's
   depth; "Run with" offers the call tests.
6. The capstone needs the stack: `report`, as in "The capstone" above, tested alone with 3 calls
   and at least 1 word on the stack; in the requirements, the outline, the specification and the
   hints. A facts test grades the last hint pasted over the outline's stubs.
7. Names and words: no possessive on a function's name; "return" for going back, "result" for
   the value; singular forms for 1; "38 instructions run"; `check` renamed `sumKept`.

### 11.1 assembly

1, 2. Bare options `002`, `003`, `00C`, `014`. 3. Its own verdict for a question the assembler
answers. 4. Decision 5. 5. The devices before the registers on a phone, only R2 to R4 shown, and the
lead names the devices. 6. The lead names "Put back the program" and says when it appears.
7. Decision 7. 8. "The first time", "the model it runs", and captions without the terms. 9. The
mended run's text no longer repeats the generalisation. 10. Decision 4; this note updated.
11. Comments shortened; the refused lines stay at 3, 4 and 7. 12. Narrowed to debuggers that sit
on the circuit.

### 11.2 lists

1. Decision 1, and the page says how the watch reads a number. 2. The opening figure ends at the
sixth reading. 3. The lead says what `word[R1]` holds at `next` and where the counted reading
shows. 4. Decision 2. 5. "The count is kept before the log." 6. Decision 4; "Move on" for the
explanation's fourth part; the listing's column is "Instruction". 7. The 070 sentence cut from the
walk; R4 in the set-up. *Not done:* the signed rule stays in both the failure experiment (why) and
the generalisation (the rule). 8. The reflection says the checks sit in different places and lead
to different work. 9. The opening figure names the program it runs, is one column, and says "1
instruction run". 10. The placeholder's comment says it is not a reading.

### 11.3 functions

1. Decision 5: free and argument registers fail, and two returned calls are checked. 2. Decision 1.
3. Decision 5. 4. The construction says R10 to R13 are kept and R14 gets its role in lesson 4; the
challenge asks R14 left as it was for that reason. 5. The two programs differ only by the calls
and returns (20 written, 18 run; 18 written, 22 run); the ALARM claim is gone. 6. "Pauses", "a
main program" introduced, "put back" throughout. 7. The repeats cut. 8. Decision 5 (994812f).

### 11.4 stack

1. Decision 5. 2. Decision 1, watch first on a phone. 3. Options `010`, `014`, `044`, `001`; the
listing's words show after the check. 4. Decision 3. 5. Decision 5. 6. The generalisation's
first paragraph redrafted from a corrected fact. 7. `sumKept`. 8. The construction asks where R11's
and R12's words go (`7A8`, `7A0`). 9. Call marks 10 pixels long and 2 wide, and a line under the
chart says what they are. 10. The clause cut. 11. "The push halts the machine". 12. Decision 7.

### 11.5 recursion

1. The explanation says a call's room and count sit in the group of the call it made. 2. Decision
1; the R14 field's feedback says hexadecimal. 3. Decision 2, the challenge's debugger too. 4. The
rooms named in words where they appear; `store` and `deep` renamed `vault` and `icebox`; the other
layouts' rooms `annexA` to `annexC`. 5. Decision 3: the failure experiment's figure is short, and
3F8 is never drawn. 6. One feedback sentence per field (brief 7R2). 7. The memory view names each
address. 8. "Then" put back. 9. The note replaced. 10. The repeats cut; the chart says what its 13
marks are. 11. Reworded; decision 7. 12. Decision 5.

### 11.6 debugging

1. The explanation's list as asked, with a facts test for the walk off an empty log. 2, 8. A new
failure experiment: a store of the result through R6, which holds the log's address, halts with
cause 34 at `034`; the wrong line is at `000`. No stack panel; the note has its own point. 3. "On
the figure's five logs"; "one of its lines is wrong". 4. Log 4, two readings, the shortest that
goes round the loop. 5. c2's hints hold in either order. 6. Decision 1 and 2; hint 4 says 96 is
`060`. 7. "count" only for the word; "the counting program". 9. The edge-log question, a -180
reading in both challenges' tests, and the reworded edge. 10. Decision 4; no "task". 11. Hint 2
names a wrong line to keep. 12. The header comment; the tasks no longer list the logs.

### 11.7 log-report

1. Hint 5's labels; the facts test. 2. The prediction asks R2 after `lowestOf` returns (0), which
the page has not shown. 3. Decision 5. 4. Decision 6. 5. Hint 1 says to run the call test from
"Run with"; the empty start suggests stubs. 6. Decision 5. 7. Lesson 5's reason. 8. The tier
buttons ask before replacing a changed program; "the outline" everywhere. 9. The task and the
specification write `0x400` and say why. 10. Both sentences corrected. 11. The question introduces
the outline; the functions are named in the motivation. 12. The restatement and one devices
paragraph cut; "looking right on one log is not enough"; "Run all" above the cards. 13. Decision 4
and 7; hint 3 is lesson 4's `sumOver`.

### The second pass and the walk

Each lesson was read whole on the rebuilt text. Cut: a brief's instruction Haiku copied into 11.7's
hint 5, the repeated `R14 <= 0x7C0` in 11.7's specification, 11.1's repeat (item 9). Words fixed:
"pauses" for 11.2's opening figure, "result" where 11.3 to 11.5 said a function "returns" a value,
and three possessives on function names. The empty log's card read "Readings: None"; it now reads
"none, an empty log" (brief 8N). The walk at 1280 and 768 light and 375 dark: no console error, no
sideways scroll.

### After the merge to `main`

The managing session asked for one more change: 11.6's edge-log question had a single test, and
the platform's verdict line has no singular ("All 1 tests passed"). The question now also asks
what a right program shows on the log the learner chose (0 on -180 and -190), as a tester says the
right answer before a run (brief 6RL3). The course's `exact` grader takes a choice field
(`form: "choice"`) so one challenge can ask both; a facts test pins the 0, and the reference
passes while no answer, or 1, fails.

## The full check

After the reading review, `npm run check` at c892850 (`main` at 014094c already merged), 22:19 to
22:45 UTC: Prettier, the copyright lines, the platform copy, `tsc`, Vitest (118 files, 1191 tests),
the build and Playwright pass, except the same ten stored screenshots that fail in this container
on `main` (none Module 11's): 780 passed, 10 failed, 48 skipped. The run before it, at d9d21e1,
also failed the phone's legibility test: the debugger's listing, with its longer "Instruction"
column, was 3 pixels too wide in 11.2; c892850 gives its cells a step less padding.

Before the review:
`npm run check` at b01177b (after merging `main` at 014094c), 19:00 to 19:35 UTC: Prettier, the
copyright lines, the platform copy, `tsc`, Vitest (118 files, 1185 tests), the build and Playwright
all pass, except the ten stored screenshots that fail in this container on `main` as well (Modules
2, 5, 6 and the cover's figures; none Module 11's): 776 passed, 10 failed, 48 skipped.

## What the build would change

- The debugger re-runs a program from the start on every edit. Programs here are short; a longer
  one would want the run recorded lazily.
- `strings11.ts` holds every Module 11 view string in one file of about 300 lines. Per figure would
  read better.
- The 11.6 method would be stronger with a figure that marks the first instruction whose result
  differs from what the learner said it should be. The debugger's watch comes close; the
  comparison is still the learner's.
