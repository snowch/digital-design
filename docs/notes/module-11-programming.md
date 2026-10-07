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
- do the work through three functions the tests also call directly, each with the list's address
  in R1 and its count in R2 (`warmer` takes the limit in R3): `warmer`, `lowest` and `highest`,
  each returning its result in R1, putting back R10 to R13 and R14, and returning to R15.

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

- The capstone's three tiers are three ways into one challenge (the starting text, the
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
- Module 10's `program-compare` says a run "halted at the stop"; Module 11 says a run *stops* at
  `stop`, *halts* only for a trap cause, *pauses* at a breakpoint, and is *cut off* at 5000
  instructions. The two figures keep their own strings; 11.2 and 11.3 use `program-compare` only
  for runs that end at their `stop`, where its sentence is true.
- The watch compares each register with its value when the run last paused, not one instruction
  back: after "Run to a breakpoint" that is the change a learner asked to see.
- A register nothing has set reads X, and the debugger pauses before an address, branch or jump
  that would use it, naming the register. The grader reports the same as a run's end
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

## What the build would change

- The debugger re-runs a program from the start on every edit. Programs here are short; a longer
  one would want the run recorded lazily.
- `strings11.ts` holds every Module 11 view string in one file of about 300 lines. Per figure would
  read better.
- The 11.6 method would be stronger with a figure that marks the first instruction whose result
  differs from what the learner said it should be. The debugger's watch comes close; the
  comparison is still the learner's.
