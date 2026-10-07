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
- Mechanical walk and its fixes: 17:50 to 18:05. Note written: 18:05. The full check: below.

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
   kept registers; the convention as an agreement the hardware does not know. Challenges: which
   registers a function must put back (answers); a function `above` (how far a reading is above a
   limit, or 0), tested by calling it directly with several arguments. Introduces **function**,
   **argument**, **calling convention**.
4. `stack`, "What must a function that calls another keep, and where?": R15 overwritten by the
   inner call, the run cut off; a stack in RAM from `7C0` down, pushed and popped with R14; frames;
   the convention's rows for R10 to R13 and R14 completed. The debugger gains the stack view.
   Challenges: a function that calls `above` twice and keeps a word in R10; the stack's addresses
   after a run of pushes (answers). Introduces **stack**. ("Frame" was planned as a term and is
   not rationed; "Terms" says why.)
5. `recursion`, "Can a function call itself?": the log shown newest first by a function that calls
   itself on the rest of the log; its frames growing and shrinking; a missing last case, and a log
   too long, each running the stack into the ROM (cause `34` at a push). Challenges: show only the
   readings colder than a limit, newest first, by a function that calls itself; the stack's depth
   for a log of n readings (answers). Introduces **recursion**.
6. `debugging`, "How do you find the mistake in a program that runs and gives a wrong answer?": a
   method (reproduce on the failing log, say what each part should leave, pause before the part,
   step and watch, find the first instruction whose result differs, fix, run every log); every
   stop's reason in plain words. Programs with real mistakes: a count off by one (the last reading
   never read), a forgotten push and pop of R15 together with an unsigned comparison of signed
   readings, and a stack started in the ROM. Challenges: the two programs to mend, each run on
   several logs. Introduces nothing.
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

- `program-listing` (11.1, the opening and the prediction): a program's lines beside their
  addresses and words, labels and the addresses they stand for, each branch's constant with its
  target; optionally a question before the words show.
- `debugger` (from 11.1, grown): the program as text (editable where the lesson says), the listing
  with the line about to run, R0 to R15, the PC, the devices; step, step back, run, reset; every
  stop's reason; the run cut off after a set number of instructions. From 11.2 breakpoints, a watch
  and a memory view with the registers that point into it marked; from 11.4 the stack view with
  frames.
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
- The plan's lesson 6 mistake "a signed comparison on unsigned values" became an unsigned
  comparison on signed readings. Every quantity in the shop is a reading that can be below 0; no
  program in the course holds a value meant unsigned that a signed comparison would get wrong, so
  the plan's version would need a contrived program. The unsigned-on-signed mistake is the one 11.1
  and 11.2 warn about, and 11.6 finds it with the method.
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

## What the build would change

- The debugger re-runs a program from the start on every edit. Programs here are short; a longer
  one would want the run recorded lazily.
- `strings11.ts` holds every Module 11 view string in one file of about 300 lines. Per figure would
  read better.
- The 11.6 method would be stronger with a figure that marks the first instruction whose result
  differs from what the learner said it should be. The debugger's watch comes close; the
  comparison is still the learner's.
