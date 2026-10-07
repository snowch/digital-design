# Module 0: meet the machine

A working note, written as the module was built, on the branch `module-0-machine`, from the plan
`docs/notes/module-0-plan.md`. Times are read from the clock (`date -u`). "The managing model" is
the session that wrote the code and the briefs and checked every draft; "the drafting subagent" is
the subagent that wrote every learner-facing sentence from a brief of checked facts.

## Times

- Started: 2026-10-07 about 04:28 UTC, reading the plan and the documents it names.
- Outline sent to the managing session about 04:55; both lessons passing their tests at 05:28;
  the mechanical walk and its fixes to 05:55; `main` merged at 05:58; the full check from 06:04.

## Why two lessons, and the program

The plan's two lessons stand. The first runs the machine; the second opens it. The split falls
where the question changes from "what does it do?" to "what is it made of?", and the second
lesson's every figure is the first lesson's machine paused, so it needs the first one's program.

1. `what-computers-do`, "What does a computer do?": the shop drawn as a scene; a prediction of
   which lines run; the machine run a line at a time, a reading changed; the challenge to change
   line 5's limit; room B failing, where the program checks one way only and the machine runs it
   faithfully; each line kept as a number; a run worked out by hand.
2. `inside-the-machine`, "What is the machine made of?": the ladder from line 3 down to one wire;
   the prediction of which slices give a 1 for 66; the slices' 1s and 0s for a new pair of
   readings; one wire stuck low, which puts 64 on the display; the capstone, one line traced.

The program is the shop's own, nine lines (`MEET_PROGRAMS.gap` in
`packages/dd-model/src/meet.ts`): read both rooms, show how much warmer room A is than room B, and
light CLASH when the gap is 100 tenths or more. It was chosen over Module 8's programs so the
ladder follows a positive number a learner who knows binary can read off the slices (66 is 64 +
2); its one-way check gives the first lesson a failure experiment of a wrong program run
faithfully. Module 8's `memory-access` shows the same gap (its margin), so the learner meets it
again.

## What was reused

- Module 8's finished machine, `datapath-full`, with its builder, reset, state readers and
  `stopReasonOf`; nothing in it changed. One press is one edge, one line.
- The `scene` figure, unchanged, for the shop.
- `CircuitView` at a scope, with the overview strip and `focus`, for every level of the ladder.
- `PredictionChallenge` and `FaultInjector` from the platform.

## What was built

- **`packages/dd-model/src/meet.ts`.** A line in plain English generated from the instruction's
  fields (`plainLine`: a sentence key and its values; kinds and jobs the sentences leave out are
  `other` and shown as written), tested against the assembler for every kind and job the
  sentences cover; lines counted from 1; the run to the stop and the answers a prediction is
  checked against, read off a copy of the simulator; the slices of the part that adds; the
  programs, places and stuck wires by plain keys, so a lesson's props carry no rationed word (its
  props are held to the term gate: the program's text says `word` and `signed`, and a drawing's
  path says `alu` and `bit1`); and three graders (`machine-run`, `machine-step`, `machine-slices`).
  The graders work their answers out with the instruction-level reference (`machine.ts`), which
  the drawn machine is tested against after every instruction; the figures stay on the
  simulator. They first ran the gates, about half a second a case; the managing session found
  that the cover and every lesson page re-grade saved work as they render, so a returning learner
  paid over two seconds for Module 0 on each render, and asked for the reference. Each Module 0
  challenge now grades in well under 100 ms (a test holds it), and a test holds the reference to
  the gates for the part that adds' output and the next line at every pause of the module's
  program, for four pairs of readings. The plan's line "graded by a copy of the simulator after a
  real step, not by the reference" changed with it, at the managing session's word.
- **`machine-at-work`** (`MachineAtWork.tsx`): the program with its line numbers, plain English
  and (on request) the number each line is kept as, written in decimal so no new digits are
  needed; the line it runs next marked; the numbers the program names, with the last line's
  changes marked; the display and the three lamps; the rooms' readings, which the learner sets at
  any time; Run one line, Run (a line every 450 ms, to watch), Pause, Start again; a prediction
  that hides every value and button until it is committed; stuck wires with their outcomes; and a
  drawing at a place. The plan left the choice between reusing `DatapathFigure` with strings of
  Module 0's own and a figure of its own; its strings, tables and controls are Module 8's
  (addresses, buses, edges), so Module 0 has its own figure on the same model functions.
- **`ladder`** (`Ladder.tsx`): seven levels, each the real machine opened at a place, with its
  title, the module that builds it by its name on the cover, a caption, and the same number in
  its own form (a number, its 1s and 0s, a wire's level). With a prediction, values and captions
  wait for the commit.
- **The cover.** The way in reads "Start with Module 0" and the first lesson's title, from the
  lessons' data; the preface's closing link reads the same. A returning reader goes on from the
  furthest lesson they have passed a challenge in, to the first lesson from there not finished,
  so a reader who began in Module 3 is not sent back to Module 0; only when everything after is
  finished does the way in go back. A test holds it.
- **The module names** moved from the cover's strings to `content/lessons/module-names.ts`, so
  the ladder names each level's module in the cover's words; the cover takes them from there.
- **A choice field** in an answer challenge draws as a list to choose from (`AnswerEditor`); no
  lesson had used one.

## Every edit to a shared file or a lesson on `main`

No lesson on `main` changed. Shared files, each change a short block of its own:

- `content/lessons/index.ts`: the two lessons, and `MODULE_NAMES` exported.
- `apps/course/src/strings.ts`: `moduleNames` read from `@dd/content`.
- `apps/course/src/pages/LessonList.tsx` and its test: the returning reader; the test that the
  first lesson is in Module 1 now says Module 0.
- `content/lessons/lessons.test.tsx`: a Module 0 scene names no signal. (The reference test and
  the cover's test keep Vitest's default time: the graders are quick.)
- `packages/dd-model/src/graders.ts`, `index.ts`; `packages/dd-views/src/strings.ts` (the `meet`
  block and four answer terms), `interactives/index.ts`, `AnswerEditor.tsx`.
- `packages/dd-model/src/library-alu.ts`: an inside placement for kind `alu8`, the 64-bit ALU as
  the machine holds it closed, copied from Module 7's own top level; and a slice's B pin half a
  cell lower, so B meets the bit-by-bit selector's D straight. The ladder is the first figure to
  open either; no figure changes as first drawn, and the full check bore that out: no Module 7
  screenshot or wire test failed, and no baseline was updated.
- `apps/course/src/styles/course.css`: a block for Module 0's figures and the choice field.
- `tests/educational/diagrams.spec.ts`: a Module 0 test of every ladder level as opened and of the
  stuck wire's drawing after a run.

## CLASH, and the lessons' openings

The lamps are the machine's three (`docs/machine.md`): ALARM, NIGHT and CLASH. CLASH means what
the program that sets it makes it mean, so the lessons describe it by what this program does:
it lights when room A is 10.0 degrees or more warmer than room B. Elsewhere it means other
things: in Module 2's `gates` it lights when the freezer room's two warm sensors, WARM1 and
WARM2, disagree, and in Module 8's `memory-access` the program lights it with no condition. The
learner who meets CLASH in Module 2 meets it as a new circuit's lamp, with no claim from Module 0
to unlearn.

At the author's word (through the managing session), each lesson's opening has a figure where one
helps: the first lesson's question has the shop's scene; the second's has the machine of the
first, stopped before its last line with 66 on the display, the box seen from outside before the
lesson opens it (brief 2Q). The first lesson's motivation lists the program in its words, and the
figure under it, the prediction, shows it beside the display.

## Terms

Module 0 rations no term. Every word it writes passes the term gate against every rationed term
on `main` and Module 10's candidates (instruction set, encoding, immediate, opcode, architecture,
microarchitecture): its lessons through `termProblems`, and what the gate cannot scan through
`module0-strings.test.ts` (the figures' own words, the shared view and runtime words a Module 0
page shows, and the program's lines as the figure writes them, slots filled). Its figures take
`timeModel: "none"`: the time badges' notes say "gate" and "edge", which later lessons ration, so
a Module 0 page shows no badge and its model note is headed "How the model differs from
hardware".

The working words were held to one meaning each: line (of the program, never a wire), wire,
number, reading (a sensor's), part, slice, level (of the ladder; a wire is high or low), keep,
run, stuck.

## Briefs, drafts and what the checks of facts found

`docs/notes/module-0-machine/`: a shared fact sheet (`briefs/00-module.md`) and nine briefs (1A
to 1C and 1L, 2A to 2C and 2L, 6V for the figures' words), the drafts as returned (`drafts/`, a
redraft after the draft it replaces), and every fix the managing model made in `fixes.json`, each
with its reason; `scripts/place.py` places the drafts with the fixes. The briefs were scanned for
banned words before they went out, and lengths were given in "wds", since the drafts copy a
brief's words and "word" is rationed.

- **Dropped**: "or more" in the new limit (1B); the count of tests (1B, 1C, 2B); where to check an
  answer (1C); what the scene draws and that the prediction hides the values (1A); where the stuck
  wire is (2L, sent back); the labels of the ladder's number and digits (6V).
- **Wrong**: "Each press of Run runs one line" (1C; Run runs to the stop); "Running: line {line}"
  for the line it runs next (6V); "carry" in "how many wires carry the number" (1A, rationed);
  "one wire, four levels down" (2B, a count no figure gives).
- **Drifted**: three of 2L's section titles under the wrong keys and three missing (sent back);
  the prediction's options "Skip to line 9" and "Stop at line 6", which named no lines run (1L).
- **A fact changed after drafting**: the limit challenge went from four tests to three (each runs
  the machine on its gates); the task was sent back with the new facts.
- **The second pass** found the hints of 1B naming their rung, which the page names already; the
  first lesson's reflection repeating its generalisation's four things (cut); a join broken by an
  earlier fix (2A); and, in the code, the prediction ladder's captions stating the slices' 1s and
  0s before the learner answered (now they wait).

## What the checks caught

- **The term gate** caught the program's text and the drawings' paths in the figures' props
  ("word", "signed", "bit1", "ALU"); both moved into the model behind plain keys.
- **The unit tests**: grading took about 0.7 s a case on the gates; the cover's test of a
  returning reader timed out once under load. The graders now use the reference (above).
- **The browser**: the part that adds and a slice, never drawn first before, failed the wire rules
  (carries stepping half a cell; B stepping into the selector; a slice too crowded for the
  roomy-wire rules). The ALU's inside was placed by hand; the slice's B pin moved; and the stuck
  wire is shown inside the slice's adding part, a small drawing that passes every rule, while the
  whole slice stays one press up the ladder, held to the rules for an opened block.

## The mechanical walk

Both pages were walked in the built site at 375, 768 and 1280 pixels, light and dark, with every
figure used (each prediction committed, each machine run to its stop, each ladder walked to its
foot, the stuck wire chosen and run). No console error and no sideways scroll at any width. Found
and fixed:

- the shop's scene was cut off on a phone: its wire counts and "The machine" made it wider than
  the card; the counts go, with the sentence about them, and the box reads "Machine";
- the ladder's four-slices and wire levels opened at the drawing's left edge on a phone: `focus`
  takes full paths from the top, and the places gave local names;
- each level's caption stated the number the figure reads off the simulator under it; the
  captions keep what the level shows.

The levels that draw the whole machine and the part that adds are tall on a phone, as Module 8's
and 9's are, with the overview strip and zoom.

## The merges

`main` moved once during the build (the cover's words written into index.html, and the branches
test's time). Merged with no conflict. Main's build now reads the cover's strings in Node, which
cannot load the lessons' index the strings had imported for the module names, so the names have a
subpath of their own, `@dd/content/module-names`.

## What the module added to the check's time

Unit tests: about 30 new (`meet.test.ts`, two facts tests, the strings gate, the cover), about
20 seconds of gate-level runs for the facts and the agreement test, mostly in parallel with the
rest. Browser: `module0.spec.ts`, 20 tests
(10 at each width), about two minutes, and one diagrams test, about 20 seconds; the generic
lesson, diagram and look tests now cover two more lessons.

## Module 1 after Module 0

Module 1 opens with the freezer room's sensor sending -184 to the office display. A learner from
Module 0 has met the shop, room A at -184 and the display; the opening still reads as a zoom into
one cable, and no line of Module 1 states what Module 0 states in the same words. Left as it is,
as the plan says.

## Not done, and what the build would change

- The slice opened whole is legible but busy; a hand layout that passes the roomy-wire rules would
  let a page open on it.
- "Run" could offer a speed; 450 ms a line suits nine lines.

## The pre-existing failure

`branches.facts.test.ts`, "the loop: 15 on the display after 20 edges", timed out at 5 s in this
container on a clean checkout of `main` as well; `main` has since given it the time its neighbours
have, and the merge brought that in.

## The full check on the branch

`npm run check` on the merged head (06:04 to about 06:50 UTC; the browser stage took 40.7 minutes
in this container): formatting, copyright, the platform copy, types, 937 unit tests and the build
pass; 592 browser tests pass and 10 fail, all ten the screenshot comparisons of figures Module 0
does not touch (the figures that matter most, registers, state machines, signals, the scenes,
Module 2's pairs), the set Modules 8 and 9 recorded failing on a clean `main` in build containers
from this one's text rendering. Not re-run on a clean `main` here; the baselines were not updated.

## The review of lesson 0.1

The managing session's reviewer and sceptic found seven things; each was acted on, code first,
then fix brief F1 to the drafter, then the lesson read once more.

1. The model note claimed every number on the page came from the simulator; the degrees are the
   tenths written by hand. It now says what the figures read, the "Kept as" column included, and
   that the machine works in tenths. Its heading, "How the model differs from hardware", is the
   runtime's string for a lesson whose figures take `timeModel: "none"`; the book cannot give a
   lesson a heading of its own, so a heading in plain words waits for a platform change.
2. The texts under the investigation's and the explanation's figures showed at the first press.
   They now wait for the run they describe: a stop, and for the second half a stop after the
   learner changed a reading (`outcomesChanged`).
3. The motivation now says what the display shows and what the shop wants CLASH for (the rooms
   10.0 degrees or more apart), as the shop means it, before the prediction.
4. The explanation tied "changing the program" to every kept number. It now says it of line 5,
   whose kept number carries its 100 (101 gives 620773477), and gives line 6's 3 as a part not
   kept as written; the explanation's figure has a box for line 5's number, so the learner sees
   the kept number move.
5. "Memory" now holds the lines only; R0 to R15 are kept apart and the readings come in from the
   sensors. The generalisation says a machine changes jobs by its program, between runs.
6. The reflection's heading matches its body; the model note quotes "Run one line".
7. The generalisation no longer says a phone runs one line at a time: a phone runs many programs
   and does several things at once, and each program's lines take effect in their order.

## The review of lesson 0.2

Eleven findings, acted on code first, then fix briefs F2A, F2B and F2L, then a whole read.

1. The ladder's smallest-parts level now opens the half of the adding part that makes the sum: two
   of the smallest parts, one making the sum on SUM, the other the half's second output. Its title
   and its "Built in Module 2" agree; the adding part above it is Module 3's. Nine levels:
   11, 8, 7, 7, 7, 7, 3, 2, 1.
2. Each "Down a level" opens the box the level above marks: the 16-slice group comes between the
   part that adds and the four slices, the adding part before its half, and the ladder ends on
   the wire SUM in the drawing just come down into. The 16-slice group's B input and piece moved a
   cell so their labels stand apart (`library-alu.ts`; no first-drawn figure changes).
3. The prediction says why the part that adds already gives 66 while line 3 waits, and that R3
   takes it when line 3 runs; the explanation agrees.
4. The prediction says once that the part that adds also subtracts, with a pointer to Module 3's
   `alu` lesson.
5. The ladder's captions show before the commit (they state no number); only its readings wait.
6. The stuck-wire figure is paused before line 3, has no readings to change, asks what the display
   will show (read off the stuck machine: 64), and its text waits for the stop and clears on Start
   again and on a new choice.
7. Its drawing is the half that makes the sum, where the wire leaves it; the lead says to look
   before running: the part gives 1, the wire stays low. No X shows at the pause.
8. The answer feedback: a Module 0 failure whose expected value is the answer says a drafted
   sentence about the learner's own answer instead (`detail` on a grader's result); a choice shows
   by its label; the slices field says what a valid entry is; the slices check is two tests, so the
   runtime's "All {total} tests passed" never reads "All 1 tests" here (a singular for the runtime's
   string is left for a platform change).
9. Repeats cut: the 1s-and-0s sentence now stands in the ladder's closing text and the
   explanation's argument only; "the course builds from the bottom" in the motivation only; the
   captions no longer repeat their leads; the zoom instruction went.
10. High and low are defined before use and mean a voltage only; the slices of least worth are no
    longer "the lowest"; "noise" became nearby wires and motors pushing a wire's voltage about.
11. The ladder's lead no longer claims "the same number all the way down"; the construction no
    longer says "the other way"; the objective reads plainly; the claim about testing is the course
    having you test each part you build.

Rendering a lesson's figures also got cheaper: a prediction's answer is worked out once the
learner commits, and figures of one program share one built machine.
