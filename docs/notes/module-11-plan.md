# Module 11, programming and debugging: the plan

Written by the managing session before the build started, as Modules 8 to 10's were. The build
reads it first and keeps to it. A change to this plan is the managing session's to make; a build
that needs one says so in its module note and carries on inside the plan. `docs/plan.md` is the
course plan the module comes from; `docs/machine.md` and `docs/isa.md` are the machine and its
instructions, and `docs/isa.md` already proposes this module's assembly language and calling
convention.

## What the module covers

From `docs/plan.md`, module 11, assembly: registers, arithmetic, memory, loops, conditionals,
arrays, functions, the stack, a calling convention, recursion and debugging. Labs: an assembler, a
debugger, breakpoints, a watch on chosen values, a view of the stack. Capstone: a useful program in
the course's assembly. Reuses Modules 8 to 10. The cover names the stage it ends, "Programming": it
should leave the learner able to write programs for the machine and find their mistakes.

Lesson 10.5 ends on the question this module answers: "Every program so far was given as words and
transfers. Writing a longer one word by word is slow, and a wrong digit is easy to make. How could
you write programs in a form a person reads, and let a tool make the words?"

A module may be more than one lesson. Size each lesson like the existing ones and split where the
material needs it; say in the note why the split falls where it does. Every lesson has the ten
sections. The lessons are module 11, order 1 onward.

**Checkpoint 4 follows this module** (`docs/plan.md`): the author reviews the course after
Module 11. The managing session writes that report after the merge; the note should give it what
it needs (what the learner can now do, what was built, what was decided, what is left).

## The learner

Modules 0 to 10 are on `main`, 39 lessons, and the learner has done all of them and nothing after.
What they have already done with programs, so Module 11 does not do it again:

- **Module 0** ran a program a line at a time in plain words, and saw each line kept as a number.
- **Module 8** ran programs as words on the datapath; its listings already show each instruction
  as the transfer it makes (`R1 <= R1 + 1`, `if R2 < R3 signed goto ...`), and lesson 8.5 the
  call and the jump.
- **Module 9** ran them on the machine of several edges, and 9.5 added a call through a register
  to the learner's copy.
- **Module 10** taught that programs are written for the instruction set and run on any circuit
  that keeps it (10.1); the layout of a word (10.2); the constant's range, branches' reach and how
  a program gets a wide number (10.3); data after a program and what an instruction left out costs
  a program (10.4); and a designed instruction (10.5). Its programs used `call R4, R15` and
  `goto R15`.

They have never written a program as text, had a tool turn it into words, kept data in memory in
a list and walked it, used a stack, or looked for a mistake in a program of their own.

## What Module 11 teaches

- **Programs as text, and the tool that makes the words.** The assembler: one line, one
  instruction, written as its transfer; a label stands for an address the tool works out; `word`
  data kept with the program; the listing of addresses, words and lines. What the tool refuses and
  why, in the course's words (a constant out of range, a name it does not know, a branch too far).
- **Loops and lists in memory.** A list of readings kept as words, walked with a register that
  holds an address and steps by 8, and a count; decisions inside the loop (the lowest, how many
  below a limit); `signed` and unsigned compared, which 10.3 set up.
- **Functions, calls and the stack.** A piece of program used from two places; the call keeps the
  return address in R15 and `goto R15` returns (Module 8); a function that calls another must save
  R15 first, so a stack in RAM, pushed and popped with R14; the calling convention as an agreement
  between programs, which the hardware does not know (`docs/isa.md`, "The calling convention").
- **Recursion.** A function that calls itself, its frames on the stack, and the stack seen
  growing and shrinking. The example must be original (see Originality).
- **Debugging.** A breakpoint on a line, stepping, a watch on registers and memory, the stack
  view; reading a stop's cause (Module 9's causes, in plain words); a method for finding a mistake,
  practised on programs with real mistakes (an off-by-one count, a forgotten push of R15, a signed
  comparison where the values were unsigned, a store to the ROM).
- **The capstone: a useful program.** The managing session recommends the shop's own: a program
  that reads a log of readings, works out what the shop needs from it (the lowest, the highest,
  how many outside a limit) through at least one function of the learner's, and shows the result
  on the display and the lamps. Graded by tests that run it over several logs and readings. Offer
  the course plan's three tiers if they fit: guided (a skeleton and hints), semi-guided (the
  specification, the program open) and engineering (requirements and tests only). The build may
  choose another useful program from the shop's world, and says why in the note.

## The assembler and the debugger

- **The learner's assembler is new.** `packages/dd-model/src/assemble.ts` is the authors' tool:
  its errors are for authors. Module 11 gives the learner an assembler whose refusals are sentences
  in the course's words, drafted through the prose process and held to the term gate, each naming
  the line and what to change. Reuse the authors' tool's parsing where it serves; keep one
  language, so lessons' programs and the learner's assemble alike.
- **The language is `docs/isa.md`'s proposal.** Refine it only where a lesson needs it, with the
  reason in the note, and change `docs/isa.md`'s "The assembly language" to match (the author has
  said the file was agent-written; the managing session reviews the change at merge).
- **The debugger runs the instruction set**, on the instruction-level model (`machine.ts`), which
  the learner's two circuits were tested against after every instruction and which 10.1 taught is
  what a program relies on. Say so on the page once, where the debugger first appears. It shows
  the listing with the line about to run, R0 to R15, the PC, the devices, and memory where a
  lesson looks (the stack, a list); breakpoints on lines; step one instruction, run to a
  breakpoint, run to the stop; a watch on chosen registers or words; every stop's reason in plain
  words. A run that never stops is cut off after a set number of instructions, and the page says
  so.
- **One lab, met early, grown as the lessons need it.** The assembler and the debugger arrive in
  the first lesson; breakpoints, the watch and the stack view arrive in the lesson whose question
  needs them.

## Programs graded

A challenge whose answer is a program: the learner's text is assembled and run on the
instruction-level model under several scenarios (readings, data, a log), and the tests check what
a program can see (the display, the lamps, registers the task names, memory the task names, how it
stopped). Feedback says which scenario failed and what the program left there, never the answer.
A program that does not assemble fails with the assembler's sentence. Every challenge's reference
passes and its starting text fails, as for every challenge. A run is cut off after a set number of
instructions, and the feedback says so.

## Figures

A figure for every idea, readable at 375 pixels, as the audit of 6 October 2026 asked of every
module since, and a figure in a lesson's opening where it helps the learner picture the question
(the author asked for that of Modules 0 and 10). At least:

- the listing: lines beside their addresses and words, labels resolved (Module 8's listings are
  the model);
- the debugger itself, with its line about to run, registers and devices;
- a list in memory walked by a loop, the register that holds the address moving down it;
- the stack as it grows and shrinks across calls, its frames marked, for functions and recursion;
- a program counted two ways (Module 10's `program-compare` serves this directly);
- the capstone's scenarios and results.

A large drawing opens on the part the words name (`focus`, `docs/notes/overview-strip.md`). Every
figure passes the diagrams and aesthetics tests at both widths.

## Terms

Rationed on `main` today: every `introduces` list in Modules 0 to 10.

- **Module 11 owns the programming words.** Left for it by Module 10's plan: assembly, assembler,
  label, stack, function, calling convention, debugger and breakpoint. Add recursion, and a word
  for a list in memory if a lesson needs one (array). Ration what the lessons use and list each in
  the note.
- **Check each against earlier pages before rationing it.** The gate matches a word's stem
  followed by letters, ignoring case. "Function" may already mean a circuit's output as a function
  of its inputs in Modules 2 and 3; "label" may mean a drawing's label; "loop" a loop of wires in
  Module 4; "stack" may appear in plain English. Lesson 10.4 already says "routine". Where a word
  already has another meaning on the course's pages, choose the word that has one meaning, or add
  `termExemptions` with reasons; run `termProblems` after every change, and list every exemption
  in the note.
- **Words with two meanings on one page.** "Call" is the instruction and a call of a function;
  "return" the jump back and a function's result; "stack" the region and the act of pushing. Say
  which where both appear.

## The calling convention

Start from `docs/isa.md`'s proposal (R1 to R4 arguments, R1 the result, R5 to R9 free, R10 to R13
kept, R14 the stack growing down from `7C0`, R15 the return address). It follows no commercial
convention, as the proposal sets out; keep it so. Move a register's role only for a reason a
lesson shows, record it in the note, and change `docs/isa.md`'s section to match.

## The SystemVerilog this module brings

`docs/plan.md` gives Modules 11 and 12 testbench constructs (`initial`, `#`, `$display`) for
checking programs, graded in no direction: the learner reads them, does not write them. Today the
course's SystemVerilog refuses `initial` with "the course meets it in a later module". Bring them
only if a lesson needs them, for instance a testbench that loads an assembled program into the
learner's own machine text, runs it, and prints what it shows. If the build brings them, gate them
per figure and challenge in `packages/hdl/src/gate.ts`, with a plain refusal elsewhere; if no lesson
needs them, leave them to Module 12 and say so in the note.

## The platform

New code goes where the earlier modules put it: new files where it can be; edits to shared
registries as short appends in a block of their own, with a comment naming the module. Keep every
existing figure, challenge and lesson working and their tests green.

The shared primitives are in `platform/primitives`, a checked copy of `snowch/learning-platform`
(`docs/platform.md`): change them only there, then sync. A text editor for the program, the hint
ladder and the challenge runner exist; the debugger is new. If Module 11 is the second consumer of
a candidate an earlier note listed (Module 10's note lists the prediction gate and `program-compare`),
say so in the note; extraction waits for the author's approval.

The whole check takes about 45 minutes now. Programs on the instruction-level model are fast; keep
the browser tests to what only a browser shows, and say in the note what the module added.

## Originality

The standard presentations are close. Do not reproduce or closely follow:

- Patt and Patel's LC-3 assembly chapters: their subroutines, TRAP routines and examples;
- Harris and Harris's assembly chapter, its order and its examples (an array summed, a string's
  length, a factorial);
- Patterson and Hennessy's procedure-call examples (a leaf procedure, a factorial, sort and swap,
  string copy) and their register conventions;
- Bryant and O'Hallaron's stack frames and examples;
- Nand2Tetris's Hack assembly and its programs (multiplying, filling the screen) and its symbol
  table chapter;
- the stock examples of recursion: factorial, Fibonacci, Towers of Hanoi, Ackermann.

The course's own world is the shop: its rooms, sensors, display, lamps, timer and logs of
readings. Each lesson's `originalityNote` names the textbook version of its topic and how the
lesson differs, in the same commit as the lesson.

## Branches, merging and the note

- The build works on `module-11-programming`, from `main` at the commit that adds this plan, and
  pushes only there. It never pushes to `main`, opens a pull request or runs the deploy workflow.
- `main` may move during the build (a follow-up to Module 10's figures is in progress). Merge it
  into the branch whenever it does, and before finishing, and run the check again after each merge.
- The managing session merges the branch into `main`, after running the check, walking the built
  site and having each lesson read by a reviewer as its learner.
- The module's note, `docs/notes/module-11-programming.md`, says what was reused, what was built,
  what was extracted or could be, every edit to a lesson or document on `main`, the terms and their
  exemptions, the assembler's language and every refinement, the calling convention and every
  change, and what the build would change.
