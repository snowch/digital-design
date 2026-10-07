# Module 11: programming and debugging

A working note, written as the module was built, on the branch `module-11-programming`. Times are
read from the clock (`date -u`). "The building session" wrote the code and the briefs and checked
every draft; "the drafting subagent" is the Haiku subagent that wrote every learner-facing sentence
from a brief of checked facts. The plan is `docs/notes/module-11-plan.md`.

## Times

- Started: 2026-10-07 16:05 UTC (first command in the session).

## Log

- 16:05 to 16:30 Read CLAUDE.md, the plan, `docs/plan.md`, `docs/authoring.md`, `docs/style.md`,
  `docs/machine.md`, `docs/isa.md`, Module 10's note and plan, lessons 8.5, 10.1, 10.4 and 10.5,
  the authors' assembler (`assemble.ts`), the reference (`machine.ts`), `runProgram`,
  `program-compare`, the book's grader and editors, and the schema. Scanned every lesson's words
  for the candidate terms (below, "Terms").

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
   after a run of pushes (answers). Introduces **stack**, **frame**.
5. `recursion`, "Can a function call itself?": the log shown newest first by a function that calls
   itself on the rest of the log; its frames growing and shrinking; a missing last case, and a log
   too long, each running the stack into the ROM (cause `34` at a push). Challenges: show only the
   readings colder than a limit, newest first, by a function that calls itself; the stack's depth
   for a log of n readings (answers). Introduces **recursion**.
6. `debugging`, "How do you find the mistake in a program that runs and gives a wrong answer?": a
   method (reproduce on the failing log, say what each part should leave, pause before the part,
   step and watch, find the first instruction whose result differs, fix, run every log); every
   stop's reason in plain words. Programs with real mistakes: a count off by one, a forgotten push
   of R15, an unsigned comparison of signed readings, a store to the ROM. Challenges: two programs
   to mend. Introduces nothing.
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
- `stack-depth` (11.4, 11.5): the stack's depth over a whole run, calls and returns marked.
- `program-compare` (Module 10's, 11.3 and 11.2): a program counted two ways; signed and unsigned.
- `log-results` (11.6, 11.7): a program run over several logs, each log's readings and what the
  program left, beside what the specification asks.
