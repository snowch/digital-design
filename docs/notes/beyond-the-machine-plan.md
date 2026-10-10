# Beyond the machine, a compiler and a kernel: the plan

A draft for the managing session, written on 10 October 2026 before any build starts, in the form
of Modules 8 to 13's plans. Once the managing session has settled the questions in section 10, the
build reads this plan first and keeps to it. A change to the plan is the managing session's to
make; a build that needs one says so in its note and carries on inside the plan. `docs/plan.md` is
the course plan the chapters come from ("Beyond the machine: two optional chapters", and the
decision of 5 October 2026); `docs/machine.md` and `docs/isa.md` specify the machine both run on.

Every fact stated about the course was checked against the file named beside it. Every number about
a program was produced by running that program on the course's own model (`packages/dd-model`),
from scripts kept outside the repository. The programs are drafts, written for this plan and given
in the appendix. The build may change them; each number it then states is pinned in a facts test,
as every lesson's is.

## What the chapters cover

- **The course plan**, "Beyond the machine" (`docs/plan.md`): after Module 13, outside the numbered
  modules, one lesson each. Each shows a mechanism on the course's own machine, and neither has the
  reader build a compiler or a kernel. Each ends by pointing on to the author's
  `snowch/computer-systems` book, which works with xv6 and the real toolchain.
  - A compiler: "a line from the course's story translated into the course's instructions as the
    reader watches, opened down to the datapath". It needs Modules 10 and 11.
  - A kernel: "a system call followed from a program into its handler and back; a timer switching
    between two programs". It needs Modules 12 and 13.
- **The decision of 5 October 2026** (`docs/plan.md`). The chapters are optional and come after the
  final machine, under "Beyond the machine". Each is one lesson, built last. Point 5: "The lesson
  schema will need a flag for an optional chapter, so the list of lessons shows them under their
  own heading and leaves them out of its count of modules still to be written." The decision also
  lists the originality risks for each chapter; section 8 answers them one by one.
- **Course acceptance** (`docs/plan.md`) is met without the chapters, as the decision says. The
  managing session's report of 10 October checked each clause against the lessons (59 lessons, 118
  challenges) and listed the two chapters first under "What is not done" (`docs/checkpoints.md`,
  "The course against its acceptance"). The chapters still touch it:
  - the final demonstration begins "user program → assembly → machine code". In Module 13 the user
    program was written in assembly, so its first two steps were one text. The compiler chapter
    makes the first arrow a real translation, then follows the same run down to the gates;
  - the kernel chapter carries "understand traps and interrupts" and "execute a system call" to two
    programs sharing one machine.
- `docs/machine.md`, "What the machine is for": "One machine runs from Module 8 to Module 13 and in
  the two optional chapters." Neither chapter changes the machine.

Size each lesson like those of Modules 8 to 13: about 1,150 to 1,350 words to read, about five
figures, one or two challenges, and the ten sections. Each chapter is one lesson, so nothing splits.

## 1. What each chapter shows, and what it does not

### The compiler

**The question.** Lesson 11.1 ended its generalisation on "The assembler translates line for word.
It adds no instruction of its own: every word in the listing comes from one line you wrote."
(`content/lessons/assembly.prose.ts`). Lesson 13.2's generalisation says "Every program reaches a
machine as machine code. Whatever language it was written in, the machine runs words like
`A7345000`." (`content/lessons/full-path.prose.ts`). Module 0's shop wanted the display to show how
much warmer room A is than room B. Its program took four lines for that rule
(`packages/dd-model/src/meet.ts`, `MEET_PROGRAMS.gap`). Written as the shop says it,
`display <= sensorA - sensorB`, the line is refused by the assembler (code `unreadable`, whose
sentence is "Each line is one instruction. Write it as a transfer, such as R3 <= R1 + R2.",
`packages/dd-views/src/strings11.ts`). The lesson asks: can a program take a line that says what to
work out, and write the instructions that work it out?

**What it shows.** A compiler, the course's own, small and real, in `packages/dd-model`. It takes
Module 0's two rules, each written as one line, and writes the course's instructions for each, one
instruction at a time, while the learner watches the line shrink as each piece of it becomes an
instruction. The compiled program then runs on the final machine, and the learner follows the
line's comparison down to the gates of the condition block. Its output for the two rules is Module
0's first program, with three more instructions (section 4).

**Why it needs the finished machine.** A compiler targets an instruction set and its assembler (the
5 October decision, point 1). This one writes the course's instructions in `docs/isa.md`'s
assembly, leans on the swap lesson 10.3 taught for "greater than", on the assembler and its
refusals from 11.1, and on Module 13's machine figure to open the run down to the gates.

**What it does not do.**
- The reader builds no compiler. The challenge translates one line by hand, as 11.1's "Being the
  assembler" made one program's words by hand.
- The compiler's lines have no loops, no functions, no names of the program's own, no
  multiplication (the machine has none) and no `else`.
- It optimises nothing, keeps nothing in a register from one line to the next, and stores nothing
  of its own in the RAM.
- It runs in the page, as the assembler does. It is not a program on the course's machine.

### The kernel

**The question.** Lesson 12.8's generalisation says: "What it does not do here is share the machine
between programs that run at the same time. With the timer's interrupt, a handler could switch away
from one program and resume another. That is beyond this module."
(`content/lessons/system-call-mechanism.prose.ts`). The shop wants the gap between its rooms on the
display all day, from a program that never ends, and the day's report made as well. 12.8's runner
runs programs one after another. Run with the gap program first in its table, it shows the gap 94
times in 5,000 instructions and never starts the report (measured with 12.8's own reference runner,
`RUN_REFERENCE` in `content/lessons/module12.ts`). The machine runs one instruction at a time. The
lesson asks: how can one machine run two programs that both get on?

**What it shows.**
- The handler and its start, grown into the program that runs the others, which is what real
  machines call the kernel.
- A system call followed from the gap program into the kernel and back. The program asks, and the
  kernel answers and goes back to the line after the call.
- The timer's interrupt taking the machine back from a program that never asks. On it the kernel
  saves everything the machine holds for that program in a save area of its own in the RAM, puts
  the other program's back, and resumes it. Later the first program goes on from the instruction it
  had not yet run, and cannot tell it was stopped.

**Why it needs the finished machine.** A kernel runs on the machine's traps (5 October, point 1):
C0 to C4, `resume`, user mode, `call system` and the timer's interrupt, which Module 12 built and
Module 13's machine keeps (`docs/notes/module-13-machine.md`, "For the optional chapters"). Its
starting point is 12.8's runner.

**What it does not do.**
- The reader builds no kernel. The kernel is given whole. The challenge sets up a second program
  for it.
- No memory of its own for each program: the machine protects its devices and control registers,
  not its RAM (`docs/machine.md`, "Traps and interrupts"; lesson 12.3).
- No loading from storage, no choice among many programs, no waiting for a device, no files, no
  priorities, and no program that makes another.
- The timer counts instructions, not time, as 12.5's model note says
  (`content/lessons/interrupts.prose.ts`).

## 2. The learner

Modules 0 to 13 are done: 59 lessons (`content/lessons/index.ts`) and 118 challenges
(`docs/checkpoints.md`). The two chapters are independent. Each assumes every numbered module and
neither assumes the other, since a reader may take either alone.

What they have that the compiler uses:
- 11.1: assembly and the assembler, the listing, a branch's constant counted in instructions, the
  assembler's refusals and their sentences, and "Being the assembler", which made words from lines
  by hand;
- 10.3: no "greater than" on the machine, and the swap of the two registers that says it; signed
  and unsigned comparisons; the 12-bit constant (the immediate);
- 11.2 and 13.5: readings of both signs need a signed comparison;
- Module 0: the gap program and CLASH; Module 8, "Branches": the condition from the flags,
  MINUS XOR OVER for "less, read signed" (`docs/machine.md`);
- 13.2 and 13.3: machine code, one line at every level, edge by edge, and a value traced to a gate.

What they have that the kernel uses:
- 12.1: traps, C2, C3 and C4, the return point, `resume`;
- 12.2: a handler saves every register it uses with absolute stores, and does not trust the
  program's stack;
- 12.3: user mode, what it refuses, and that the RAM is not protected;
- 12.4: `call system`, the jobs 1 to 4 chosen by R1, a job that may change only R1 and R2;
- 12.5: the timer and the waiting bits, an interrupt taken between two instructions with the
  instruction not yet run as its return point, and a handler that clears the waiting bit;
- 12.6: interrupts are off while the handler runs, and C1 and C2 matter;
- 12.8: the runner with its start, its table and a record for each program, "the core of the
  program a real machine runs first";
- 11.3 and 11.4: the calling convention, the stack from `7C0` down, R14; 11.2: a list walked by a
  register that steps by 8; Module 0: "A phone runs many programs at once"
  (`content/lessons/what-computers-do.prose.ts`).

What they have never done:
- written a line that does several jobs, or names a device as a value; seen one line become
  several instructions; seen a program choose registers, make up a name for a line, or turn a
  comparison over;
- had two programs in the machine at once; seen a program stopped by the timer and later put back
  where it was; kept a program's whole state in the RAM.

## 3. The ten sections

The words are drafted by the drafting subagent from briefs of checked facts. What follows is each
section's substance and what the learner does and sees, not its wording. The titles are working
titles. Of the 59 lessons, 57 have titles that use no term their own lesson introduces (2.2's
"NAND" and 7.2's "flags" are the exceptions; checked with the gate's own pattern). So neither
chapter's title uses "compiler" or "kernel".

### The compiler: `compiler`, "Can a program write the instructions for a line you write?"

1. **Question.** 11.1's and 13.2's sentences above; the shop's rule as one line. Figure: the
   debugger, editable, holding `display <= sensorA - sensorB` and `stop`. The assembler refuses
   line 1 with its sentence, as 11.1's "mistakes" figure showed refusals. The question as above.
2. **Motivation.** Such a program is a compiler (the term, plain English first). Set against the
   assembler: the assembler makes one word for each line; the compiler writes several instructions
   for one line, chooses the registers, makes up a name for a line, and turns a comparison over.
   The compiler's lines are the course's own text with the assembler's refusals lifted, listed
   once (section 4). One sentence carries the trap in them: in the compiler's lines a device's name
   stands for its word, the reading, while in assembly the name alone is its address
   (`R1 <= sensorA` assembles and puts `7D8` in R1). The compiler is a program in the page, as the
   assembler is.
3. **Prediction.** Figure: `compile-steps` on Module 0's CLASH rule,
   `if sensorA - sensorB >= 100 then lamps <= 4`, stopped before the compiler writes its branch,
   with the line by then rewritten to `if R3 >= R4 then lamps <= 4`. Question: which branch does
   the compiler write? Options: `if R3 >= R4 signed goto after1`, `if R3 < R4 signed goto after1`,
   `if R4 < R3 signed goto after1`, `if R3 < R4 unsigned goto after1`. The answer is the second.
   The explanation, shown after the commit: the branch jumps past `lamps <= 4` when the comparison
   fails, so it tests the comparison turned over, and readings are read signed. The lead says what
   has happened so far, never the rule.
4. **Investigation.** Figure: `compile-steps` with two lines to choose from, the gap rule and the
   CLASH rule. The learner presses the figure's button for the next instruction and watches the
   piece taken, the rule that applies, the instruction written and the line rewritten. Each piece
   stays linked to the instructions it became. At the end come the program's listing (addresses
   and words) and its run: the gap line shows 66 with the shop's readings; the CLASH line leaves
   CLASH dark at a gap of 66 and lights it with room A at -100 (gap 150). Facts: the gap line
   becomes 4 instructions and `stop`; the CLASH line becomes 7 and `stop`.
5. **Construction.** Figure: `machine-levels` on `machine-final`, running the compiled CLASH line
   with the shop's readings. It opens quiet before the branch's FETCH edge, with the ROM row held
   back at the branch (`holdRom`), and asks for the word the IR takes at that edge. The learner
   works it out from the line (`56340003`), as 13.2's construction had a store's word worked out.
   Then they step to the branch's ALU edge and open the condition block
   (`focus: ["datapath/condition"]`). A paragraph shown once that edge has run (`reveal`) says what
   it did. Checked on the recorded run: the program takes 22 edges; the branch's FETCH edge is edge
   19 and its ALU edge edge 21; before edge 21 MET is already 1; at it HR takes -34 (66 minus 100)
   and the PC takes `01C`, so CLASH stays dark. The line's `>=`, a comparison the machine has no
   instruction for, ends at the condition block's gates: Module 7's MINUS XOR OVER
   (`docs/machine.md`, "Branches"). The quiet opening matters: before the FETCH edge the word is
   already on the memory's output, FETCHED (checked), so the figure is `quiet`, as 13.5's question
   figure is.
6. **Failure experiment.** Figure: `compile-steps` with one rule broken, "every piece in R1", on
   the gap line. The second load writes over room A's reading, `R1 <= R1 - R1` gives 0, and the
   display shows 0 for the shop's readings and for a second pair the figure offers (checked). The
   point: a register holds a piece until the job that uses it has read it, so the compiler must
   know which registers still hold pieces that wait.
7. **Explanation.** The compiler's five rules, as a list, each beside the refusal whose advice it
   follows (section 4); each line starts again at R1; the program ends with `stop`; `>` and `<=`
   are written with the registers swapped (10.3). Then the fact the investigation made visible: the
   gap line's instructions are Module 0's lines 1 to 4, and the CLASH line's are lines 1 to 3 and 5
   to 9 (`MEET_PROGRAMS.gap`). The learner's first program in the course is this compiler's two
   outputs, with the gap worked out once instead of twice.
8. **Generalisation.** Figure: `program-compare`, the compiler's program for both lines beside
   Module 0's. Checked: the compiler's program has 12 instructions and runs 10 with the shop's
   readings; Module 0's has 9 and runs 7; both show 66 and leave CLASH dark. Module 0's program
   keeps the gap in R3 for the second rule, and the compiler works it out again because each line
   starts afresh. Named, not taught: a better compiler keeps a value in a register for a later
   line, leaves a number in an instruction's constant where it fits (10.3's immediate), and keeps a
   comparison as a word with set if (10.5). Real languages have loops, functions (a compiler writes
   a call by the calling convention, 11.3) and names of a program's own.
9. **Challenge.** "Being the compiler" (section 5).
10. **Reflection.** The final demonstration now starts one level higher: a line as the shop says
    it, the instructions, the words, the edges, the gates. Questions for the learner: which rule
    was hardest to apply by hand, and where the compiler wrote more than they would. Then the
    pointer to *Systems From Scratch* (section 9).

### The kernel: `kernel`, "How can one machine run two programs at once?"

1. **Question.** 12.8's generalisation; the shop's two programs. Figure: the debugger running
   12.8's reference runner with a table of two, the gap program first and the report second
   (`programs: word 2, gap, report`), drawn as lanes. The gap program's lane and the handler's
   alternate. The report's lane stays empty, the run is cut off after 5,000 instructions, and no
   record is written (checked: 94 gaps shown, every record still X). The question as above.
2. **Motivation.** The program that runs the others is a kernel (the term, plain English first):
   the start and the handler of Module 12 grown. It alone runs in system mode and reaches the
   devices and the control registers. A user program reaches a device only through a system call.
   The figure above already shows one, and the lead points at it: the gap program's `call system`
   moves into the handler's lane, C2 takes the next line, C3 takes `41`, the mode becomes system,
   the job runs, and `resume` goes back to the next line. The timer (12.5) interrupts a user
   program between two instructions without asking it. So the kernel can take the machine back
   from a program that never asks.
3. **Prediction.** Figure: the debugger on the kernel with the timer set. The second time the timer
   stops the gap program, R5 holds room A's reading and `R2 <= R5 - R1` has not run. The report
   then runs, with its own 0 in R5 (checked: the third timer interrupt of the run comes after 289
   instructions, before `R2 <= R5 - R1`, with R5 at -184). Question: when the gap program next
   runs `R2 <= R5 - R1`, what does R5 hold? Options: -184, room A's reading; 0, as the report left
   it; -250, room B's; X. Answer: -184. The explanation: the kernel saved all sixteen of the gap
   program's registers before the report ran, and put them back before the gap program went on.
4. **Investigation.** Figure: the debugger on the kernel, with the two save areas drawn as memory
   regions, the control registers, the timer's panel, breakpoints at `tick` and `load`, and the run
   drawn as lanes (the start, the handler, the gap program, the report). The learner runs to
   `tick`, where C3 is `81` and C2 holds the gap program's next instruction. They step through the
   save and watch its save area fill, word by word, with R9 holding the area's address. They see
   the words at `480` and `488` change places, step through `load` as the report's words go back
   into the registers, C1 and C2, and see `resume` go into the report. Then they run to the next
   `tick` and back. Facts, as drafted: a switch runs 60 instructions, 51 of them after it writes
   the timer; with a count of 80 each program runs 29 instructions a turn.
5. **Construction.** "The save areas, worked out", an answer challenge graded by `exact`, on a
   moment no figure shows. The task states one: the timer stops the report before
   `R11 <= R11 - 1`, at an address the task gives. The learner gives the word the switch stores in
   the report's C2 word, the address of the word that holds the report's R13 (the layout is in
   section 4), and the report's C1 word as its two bits. Each wrong answer gets the sentence for
   the rule it misses, never the value, as Module 10's `exact` cases do. These are not the final
   challenge's words.
6. **Failure experiment.** Figure: the same kernel with a count of 40, shorter than the switch.
   The figure first asks what will happen. The timer counts the kernel's own instructions, reaches
   0 inside the kernel, and the interrupt is taken at the edge after `resume`, before the program
   runs an instruction. After the gap program's first stretch neither program runs again; the
   lanes show only the handler's; the run is cut off after 5,000 instructions with 83 timer
   interrupts (checked; with this kernel any count of 51 or less does it). The point: the switch
   costs instructions, the timer counts them, and a count must be longer than the switch.
7. **Explanation.** What a program is to the machine between two instructions: its sixteen
   registers, C2 (where it goes on) and C1 (its mode and whether interrupts are on). Everything
   else of it is in the ROM and the RAM and stays put. So the switch saves those eighteen words and
   puts eighteen others back, and the stopped program cannot tell: 12.5's "carries on unaware",
   now for a whole other program. Each program has its save area, and the kernel keeps two
   addresses, the running program's at `480` and the waiting program's at `488`, which change
   places at each switch. The kernel saves into its own words, never onto the program's stack
   (12.2), and saves every register, because an interrupt may change none (12.5). A system call
   goes back to the program that asked; the timer's interrupt may go back into the other program.
   Figure: `trap-timeline` with lanes over three or four switches, with the mode band and the
   interrupts band. The two programs' lanes alternate through the handler's, and each move is an
   arrow labelled with what it writes. This drawing is the idea's shape.
8. **Generalisation.** One machine runs one instruction at a time. A person at the display sees
   both programs at work, and Module 0's "A phone runs many programs at once" is a kernel switching
   quickly. Named, not taught: real kernels run many programs and choose which runs next; they give
   each program memory of its own that the others cannot reach (here the report could write over
   the gap program's save area, 12.3's unprotected RAM with more at stake); their timer counts
   time; a program that waits for a device gives up the machine meanwhile. The cost: as drafted, 60
   instructions of switching for every turn, against 29 of a program's at a count of 80.
9. **Challenge.** "Two programs, set up" (section 5).
10. **Reflection.** The course began with a machine that runs one program, and ends with a kernel
    that runs two on it. Questions for the learner: what had to be saved and why, and what the
    machine would need to keep one program out of another's words. Then the pointer to *Systems
    From Scratch* (section 9).

## 4. The mechanism on the course's machine

### The compiler's lines

A line is one of:
- `D <= E`, where `D` is `display` or `lamps`;
- `if E C E then D <= E`, where `C` is `<`, `<=`, `>`, `>=`, `==` or `!=`.

An `E` is one of `sensorA`, `sensorB`, `signals` or `lamps`; a number from -2048 to 2047; two `E`s
joined by `+`, `-`, `&`, `|` or `^`; or an `E` in brackets. Jobs are done left to right, brackets
first, with no order among them (`sensorA - sensorB - 100` is `(sensorA - sensorB) - 100`). Every
number is read signed. A line names no register. The compiler refuses, each with a sentence drafted
as 11.1's were: a name that is no device the line may use, a number that does not fit, `*` or `/`
(the machine has no multiplication or division), and a line in no form above.

The device names are the assembler's (`docs/isa.md`, "The assembly language"); the lesson uses
`sensorA`, `sensorB`, `display` and `lamps`. The output uses only kinds 1, 2, 3, 4, 5 and 8, so it
runs on every machine since Module 9's (`PROGRAM_MACHINE`, `packages/dd-model/src/debugger.ts`) and
on `machine-final` (`MODULE_13`, `packages/dd-model/src/machine.ts`).

### The compiler's rules

The compiler rewrites the line in place. It takes the leftmost piece the assembler would refuse,
writes one instruction for it, and puts that instruction's register where the piece was, until
nothing of the line is left. Four of the five rules follow the advice of a refusal the learner met
in 11.1 (`AssemblyProblemCode` in `packages/dd-model/src/assemble.ts`; the sentences in
`packages/dd-views/src/strings11.ts`).

1. A device's name the line reads: the next register takes its word, `R1 <= word[sensorA]`. (The
   line never writes `word[...]`.)
2. A number: the next register takes it, `R4 <= 100`. (`storeRegister` and `compareRegisters`:
   "Put the number in a register first.")
3. Two registers joined by a job: the next register takes the result, `R3 <= R1 - R2`. (`twoJobs`:
   "One line does one job. Split it across two lines.")
4. `if`, once both sides are registers: a branch past the rest of the line, on the comparison
   turned over, read signed. Where the turned-over comparison is `>` or `<=`, which the machine
   has no branch for, the two registers are swapped. The compiler names the line after the rest,
   `after1` for the first line. (`noGreater`: "The language has no >; swap the two registers and
   write <."; `signedOrUnsigned`: "After < or >=, write signed or unsigned.")
5. A device's name the line writes, with a register on the right: a store, `word[lamps] <= R5`.
   (`storeRegister`: "A store writes a register's word.")

Each line starts again at R1, so the compiler keeps nothing in a register from one line to the
next. It ends the program with `stop`.

### What the compiler writes, checked on the model

- `display <= sensorA - sensorB` becomes `R1 <= word[sensorA]`, `R2 <= word[sensorB]`,
  `R3 <= R1 - R2`, `word[display] <= R3`: Module 0's lines 1 to 4. With room A at -184 and room B
  at -250 (Module 0's readings, `content/lessons/module0.ts`) the display shows 66.
- `if sensorA - sensorB >= 100 then lamps <= 4` takes seven steps. The line becomes in turn
  `if R1 - sensorB >= 100 then lamps <= 4`, `if R1 - R2 >= 100 ...`, `if R3 >= 100 ...`,
  `if R3 >= R4 ...`, then `lamps <= 4` (run only when the comparison held), then `lamps <= R5`,
  and nothing. The instructions are `R1 <= word[sensorA]`, `R2 <= word[sensorB]`,
  `R3 <= R1 - R2`, `R4 <= 100`, `if R3 < R4 signed goto after1`, `R5 <= 4`, `word[lamps] <= R5`,
  then `after1: stop`. These are Module 0's lines 1 to 3 and 5 to 9. Their words are `380017D8`,
  `380027E0`, `13123000`, `25004064`, `56340003`, `25005004`, `480507C8` and `84000000`.
  `13123000` is 13.2's own example of machine code; `25004064` is 620773476, the number Module 0's
  explanation says line 5 is kept as.
- The two lines together: 12 instructions, of which 10 run with the shop's readings, against
  Module 0's 9 and 7. Both show 66 and leave CLASH dark.
- With the fault "every piece in R1", the gap line becomes `R1 <= word[sensorA]`,
  `R1 <= word[sensorB]`, `R1 <= R1 - R1`, `word[display] <= R1`, and the display shows 0.
- On `machine-final` the compiled CLASH line runs in 22 edges with no difference from the model;
  the facts are in section 3, item 5 (recorded with `recordRun`,
  `packages/dd-model/src/final-run.ts`).

### The kernel's programs

Both programs come from the story, and both are user programs that reach the devices only through
`call system`, with the jobs 1 to 4 of 12.4 and 12.8 (1 shows R2; 2 puts room R2's reading in R1;
3 sets the lamps from R2; 4 ends the program).
- **The gap program** is Module 0's gap, round after round: room A's reading by job 2, kept in R5;
  room B's by job 2; `R2 <= R5 - R1`; shown by job 1; then again, for ever. It is 11 instructions.
- **The report** is 11.7's day's report, cut down: how many readings of 11.7's first log
  (-184, -190, -176, -181, -172, -188) are warmer than -180, kept at `640`, with ALARM by job 3
  when any is, then job 4. It counts 2 and lights ALARM, as 11.7's tests expect for that log.

### The kernel

12.8's runner, grown. Its words in the RAM:

| Address | Holds |
| --- | --- |
| `400`, `408` | the program's R8 and R9, saved at the handler's first two lines, as 12.5's handler saves them |
| `480` | the address of the save area of the program that runs |
| `488` | the address of the save area of the program that waits, or 0 when none waits |
| `500` to `59F` | the first program's save area: R0 to R15 at `500` to `578` (R14 at `570`), C1 at `580`, C2 at `588`, its record at `590` |
| `5A0` to `63F` | the second program's save area, laid out the same: R14 at `610`, C1 at `620`, C2 at `628`, its record at `630` |
| `7C0` down, `700` down | the stacks, where the programs need them (the challenge's do) |

This table indexes the drawing; the debugger draws each save area as boxes.

- **The start** writes each program's first line into its C2 word and `10` (user mode, interrupts
  on, written 2) into its C1 word; puts `500` at `480` and `5A0` at `488`; sets the timer to the
  count; and goes to `load`. The figures' programs never push, so the figures' start writes no R14.
- **The handler** saves R8 and R9 and reads C3. `81` goes to `tick`. `41` does job R1 as 12.8's
  handler does: jobs 1 to 3 resume the program, job 4 ends it, and a job it does not offer resumes
  at once. Any other cause ends the program, its record being the cause.
- **Its length.** The kernel is 96 lines and the start 17, about twice 12.8's runner. Most of the
  kernel is the save and the load, one line per register, which the debugger's listing folds on a
  phone ("Show every row", Module 12's review, B12).
- **`tick`** clears the timer's bit of "waiting" and writes the count to the timer. If no program
  waits, it puts back R8 and R9 and resumes. Otherwise it saves R0 to R15 (R8 and R9 from `400` and
  `408`), C1 and C2 into the running program's save area through R9, and swaps `480` and `488`.
- **`load`** puts back C1, C2 and R0 to R15 from the save area `480` names (R9 last, from its own
  word) and runs `resume`.
- **Job 4, or a fault,** stores the record (0, or the cause) in the running program's save area. If
  a program waits, it becomes the one that runs, `488` becomes 0, and the kernel goes to `load`.
  Otherwise the kernel runs `stop`.

Checked on the model with `MODULE_12`, the debugger's runs (`debugFinish`,
`packages/dd-model/src/debugger.ts`) and the readings -184 and -250:
- with a count of 80, the gap program and the report both get on: the report counts 2 at `640`,
  lights ALARM and ends with record 0, while the gap program shows 66 again and again. In 5,000
  instructions there are 53 timer interrupts and the gap is shown 65 times;
- the first timer interrupt comes after 97 instructions, before the gap program's `goto gap`, and
  the first switch stores that line's address in its C2 word, `588`. The third comes after 289,
  before `R2 <= R5 - R1`, with R5 at -184; the report had set its own R5 to 0;
- a switch is 60 instructions: 9 up to and including the write to the timer, then 51, every one of
  them counted by the timer. So a program's turn is the count less 51, 29 at a count of 80. With a
  count of 51 or less, no program runs another instruction after the first stretch. At 40 there
  are 83 timer interrupts in 5,000 instructions, and the gap is never shown;
- these counts follow from `docs/machine.md`, "Devices": the timer "counts instructions ... its
  count goes down by one each time an instruction finishes, while the count is not 0", and a write
  replaces the count (`step` in `packages/dd-model/src/machine.ts`). An interrupt is taken at the
  edge that would run the next instruction, which is its return point.

The system call is followed on the instruction-level model, where each edge is one instruction or
one trap, as 12.1's timeline says. The whole machine's edge for the timer's interrupt is the one
12.7 opened: the trap logic takes `81` at the edge that would fetch (`docs/machine.md`). A figure of
that edge on `machine-final` is optional (section 10, question 8).

### What is new, and what is reused unchanged

New, for the compiler:
- `packages/dd-model/src/compile.ts`: the compiler. It returns, for a text of lines, each step
  (the line before, the piece's span, the rule, the instruction, the line after), the program as
  assembly text, and the refusals; a fault option for "every piece in R1". Its tests pin every
  output above.
- `compile-steps`, a figure (section 6), with its props schema, its test and its strings.

New, for both:
- the chapters' strings, in a file of their own (`packages/dd-views/src/strings14.ts`), including
  the sentences for how the kernel challenge's runs must end, as Module 12 added its own (review
  A3 in `docs/notes/module-12-traps.md`);
- the lessons, and a shared file of their programs (`content/lessons/beyond.ts`).

Reused unchanged: the machine and its model; the assembler; the debugger, `trap-timeline`,
`machine-levels` and `program-compare` figures; the program grader, whose keys already cover both
challenges (`shown`, `lamps`, `display`, `word:…`, `C1`, `end` and `stopAt`, in
`packages/dd-model/src/program-tests.ts`); and the `exact` grader. One limit may need lifting:
`trap-timeline` draws at most 400 edges (`packages/dd-views/src/interactives/Module12Figures.tsx`),
which holds three switches of the drafted kernel; lift it in the course's figure only if the
explanation needs a fourth, and say so in the note.

## 5. The challenges

### The compiler: "Being the compiler" (write, program grader)

- **The task.** Write the instructions the compiler's rules give for one line no figure compiles:
  `if sensorB - sensorA > 100 then lamps <= 4`. The shop asks for CLASH when room B is more than
  10.0 degrees warmer than room A. This mends what Module 0's failure experiment showed: room B's
  failing freezer left CLASH dark, because the program checked one way only
  (`content/lessons/what-computers-do.prose.ts`).
- **How it is graded.** Six runs of the learner's program on the model (`grader: "program"`,
  `gradedDirection: "write"`, `allowedConstructs: ["assembly"]`), with room A and room B at -184
  and -50 (Module 0's failing room B, gap 134); -250 and -150 (exactly 100); -250 and -149 (101);
  -184 and -250 (room A warmer); -30 and 80 (both signs, 110); and 20 and 25. Each run checks the
  lamps (4 in the first, third and fifth, else 0), that the display is still 0, and that the run
  ends at the program's `stop`. The runs judge what the line means, not the compiler's exact
  instructions: any translation that does what the line says passes, as a compiler's output is
  judged by its runs. The task asks for the rules' instructions, and the feedback names the rule a
  failed run points to.
- **The starting point** is the line as a comment and `stop`. It leaves CLASH dark, so it fails the
  three runs where CLASH must light (checked).
- **The reference** is `R1 <= word[sensorB]`, `R2 <= word[sensorA]`, `R3 <= R1 - R2`, `R4 <= 100`,
  `if R4 >= R3 signed goto after1`, `R5 <= 4`, `word[lamps] <= R5`, `after1: stop`. It passes all
  six (checked). The branch is `57430003`. The comparison `R3 > R4` turned over is `R3 <= R4`,
  which the machine writes as `R4 >= R3`.
- **Plausible wrong attempts**, each failing at least one run (checked):

  | Attempt | What catches it |
  | --- | --- |
  | the figure's branch, `if R3 < R4 signed` | lights at a gap of exactly 100 |
  | `unsigned` | lights when room A is warmer (a gap of -66 read unsigned is huge) |
  | the comparison not turned over, `if R4 < R3 signed` | fails all six |
  | the gap the wrong way round, room A minus room B | fails the three that must light |
  | `R1 <= sensorB` and `R2 <= sensorA`, the addresses (a gap of 8) | fails the three that must light |
  | `word[lamps] <= 4` | refused by the assembler (`storeRegister`) |
  | no `stop` at the end | halts with cause `21` instead of stopping |
  | `if R3 > R4 signed` | refused by the assembler (`noGreater`) |

- **Hints**, five in ladder order: the branch jumps past the rest of the line when the comparison
  fails; copying the figure's `<` lights CLASH at exactly 100; a smaller example that is no part
  of the answer and no case of the task (turning over `R6 == R9` gives `R6 != R9`); the first four
  instructions; the whole answer.
- **Not on the page.** No figure offers this line, and the compile figure takes no typed line, only
  its own choices (section 10, question 6). The facts test checks that no figure compiles it.

### The kernel: "Two programs, set up" (write, program grader)

- **The task.** The starting text holds the kernel, given whole, and a start that sets up the first
  program the tests add, named `program`: its C2 word, its C1 word and its R14 word (`7C0`), with
  `500` at `480`, 0 at `488` and the timer set. Set up the second, named `second`, in the save area
  at `5A0`, so that the kernel runs both. Two things in it are on no figure:
  - the second program expects, when it starts, the address of its readings in R1 and how many
    there are in R2, as a function receives its arguments (11.3). The tests name them `secondLog`
    and `secondCount`;
  - the tests' programs call a function that pushes on the stack, so each needs a stack of its
    own. The task gives the save areas' layout and says where the RAM is free (`640` to `7BF`).
- **How it is graded.** Three runs (`given.traps: "yes"`), each adding two programs after the
  learner's text. Each checks the words shown in order, both records (`word:590`, `word:630`), C1
  at the end and that the run ends at the kernel's `stop` (`end: "stop"`, and `stopAt`, which
  reads "handler" for any of the learner's own lines because the tests' first line is named
  `program`).
  1. The gap program for three rounds, then the report on the log its arguments give, which shows
     how many: `66, 2, 66, 66`.
  2. Two programs that call one function, which pushes R15, R10 and R11 and counts warm readings,
     on logs of 8 and 20 readings. The first keeps 100 in R10 across its call, as the calling
     convention allows, and shows 100 plus its count. Words shown: `104, 4`.
  3. Run 1, with the second program storing to the display itself: user mode refuses it (`32`),
     its record is the cause, and the gap program goes on: `66, 66, 66`, records 0 and 50 (`32`
     read as a word).
- **The starting point** sets up the second program nowhere, so the kernel never switches to it. It
  fails all three runs: the second program's words are never shown and its record stays X
  (checked).
- **The reference** adds ten lines and changes one: `second` stored at `628`; 2 (`10`) at `620`;
  `0x700` at `610`; `secondLog` at `5A8` (its R1 word); the word at `secondCount` at `5B0` (its R2
  word); and `5A0` at `488` in place of 0. It passes all three (checked).
- **Plausible wrong attempts**, each failing at least one run (checked):

  | Attempt | What catches it |
  | --- | --- |
  | R1 and R2 set in the start before `goto load` | every run: `load` puts back R1 and R2 from the save area, and the debugger ends the run before a branch on R11, which holds nothing |
  | the arguments written into the first program's save area | every run, the same way |
  | no R1 and R2 words at all | every run, the same way |
  | `R1 <= secondCount`, the address, for the count | every run: the walk runs past the log and the debugger ends it |
  | the two arguments swapped | every run: the second program loads from address 6 and faults (`33`), record 51 |
  | the second stack also from `7C0` | run 2: the first program returns into the second's lines and shows `4, 4` |
  | status `00` (interrupts off) for the second | run 2: the second runs to its end in one turn, `4, 104` |
  | status `11` (system mode) | run 3: the store to the display succeeds; run 2: C1 ends `11` |
  | C2 word `second + 4`, skipping its first line | runs 1 and 3: the debugger ends the run before an address in a register nothing has set; run 2: the second program skips its call and shows its log's address, `728` |
  | the C1 and C2 words swapped | every run: the second program faults with cause `12`, record 18 |
  | no R14 word for the second | run 2: the run ends before a push through R14, which holds nothing |

- **Not on the page.** The figures' report loads its own log and their programs never push, so no
  figure writes an R1, R2 or R14 word into a save area. The figures' start does write a C2 and a C1
  word for its report, and names its save area as the one that waits, in the same form as the
  challenge's. Section 10, question 5 weighs that.
- **Hints:** a program waiting to start is its save area, which `load` reads into every register;
  a common mistake, setting R1 and R2 in the start, which `load` then writes over; a smaller
  example, no part of the answer (a word stored at `518`, 24 bytes into the first save area, is
  the first program's R3 when it starts); the C2, C1 and R14 lines; the whole answer.
- The construction's answer challenge (section 3) asks about the report's C2, R13 and C1 words at a
  stated moment, so it is no part of this answer.

## 6. Figures

A figure for every idea, readable at 375 pixels, and one in each question section. Every figure
passes the diagrams and aesthetics tests at both widths, opens on the part its words name, and
shows a result only after the run that makes it (Module 12's review, A6).

### Reused, with the props each needs

| Figure | Kind | Props |
| --- | --- | --- |
| compiler, question | `debugger` | `editable`, the one-line program; the refusal shows as 11.1's did |
| compiler, construction | `machine-levels` | `program` the compiled CLASH line, the shop's `inputs`, `start: 18`, `quiet`, `holdRom` at the branch with `fetch: 19`, `question`, `options`, `ask: "net"`, `net: "IR"`, `form: "word"`, `focus: ["datapath/condition"]`, `signals` (the ALU's job and BRANCH), `reveal` once edge 21 has run |
| compiler, generalisation | `program-compare` | the two programs, `display`, and `ask: { program: 0, what: "written" }` if a question is wanted |
| kernel, question | `debugger` | `traps`, `control`, `lanes` with `upTo`, the runner and its table |
| kernel, prediction | `debugger` | `question`, `options`, `ask: { what: "register", reg: 5, after: N }`, N pinned by the facts test (the figure counts its steps, traps among them, from the reset) |
| kernel, investigation | `debugger` | `memory` regions for both save areas (20 words each; at most 64), `breakpoints`, `control`, `events`, `lanes` with `interrupts` |
| kernel, failure experiment | `debugger` | the count 40, `lanes`, a `question` before the run |
| kernel, explanation | `trap-timeline` | `lanes` (the start, the handler, the gap program, the report), `mode`, `interrupts`, `list: false`, `edges` up to 400 |
| both challenges | `challenge` | the editor's debugger (`initial.data.debugger`), as Module 12's write challenges have |

The props are those of `packages/dd-views/src/interactives/Debugger.tsx`, `Module12Figures.tsx`,
`Module13Figures.tsx` and `Module10Figures.tsx`. The registry is
`packages/dd-views/src/interactives/index.ts`. `docs/authoring.md`'s table of kinds stops at
`trap-timeline` and lacks the kinds Modules 0, 10, 11 and 13 added (`machine-parts` and the rest
of Module 10's, `program-listing`, `stack-depth`, `log-results`, `machine-levels`, `lab-run`,
`machine-at-work`, `ladder`).

### New: `compile-steps`

The compiler at work, read off the compiler's own steps (`compile.ts`), as every figure is a view of
the model. Nothing in it is scripted.

- `lines`: one to four choices, each a `label` and a `text` of one or two of the compiler's lines.
- `readings`: one to three choices of the shop's inputs for the run after the last step.
- `question`, `options`, `explain`, and `ask: { step }`: commit to the instruction the compiler
  writes at that step before the figure reaches it; the options' values are instruction texts.
- `fault`: `"oneRegister"`, the compiler with every piece in R1.
- `outcomes`: shown once the last step and its run have been made.

What it draws:
- the line, with the piece the compiler takes next marked;
- the rule that applies, in one sentence per rule;
- the instruction it writes, added to a listing that grows, with each piece linked to the
  instructions it became (pressing a piece marks them, as Module 13's figure pins a wire);
- the line rewritten with the register in place of the piece;
- at the end, the listing with addresses and words (Module 11's `ProgramListing`) and the run's
  display and lamps.

Its controls are the next instruction, back, and start again, named so as not to say "step", which
the machine figure on the same page uses for an edge. It uses the platform's `PredictionChallenge`,
so the browser suite's walk commits its prediction and steps it to its end.

## 7. Terms

Rationed on `main`: 88 terms, the last three being CPU, machine code and abstraction (every
`introduces` list, read with `platform/lesson-schema/src/vocabulary.ts`). The gate matches a word's
stem followed by letters, ignoring case. It orders lessons by module, then order, so the chapters at
module 14 (section 9) may use every earlier term.

- **The compiler introduces "compiler"**: "a program that reads lines that say what to work out,
  and writes the instructions that work it out". It arrives in the motivation, once the question
  has shown the assembler refuse the shop's rule. No lesson uses any form of "compile" today
  (scanned over every lesson's learner text). The gate's pattern for "compiler" misses "compile"
  and "compiled", which no earlier page uses, so nothing slips through.
- **The kernel introduces "kernel"**: "the program the machine runs first, in system mode: it alone
  reaches the devices and the control registers, and it starts, stops and switches the other
  programs". It arrives in the motivation, after the question has shown 12.8's runner unable to
  start the report. No lesson's learner text uses it. Two originality notes do (12.2's "kernel
  stack in xv6", 12.8's "tiny kernel"), and the gate does not read originality notes.
- **Deliberately not rationed or used:**
  - "process": its stem matches "processor", which 3.3, 3.4, 7.2 and 13.1 use ("processing" in
    13.1), and 11.2 says a loop "processes" a list; it is also the banned stock example's word. Say
    "program".
  - "time slice": "slice" is the ALU's slice. Say "turn".
  - "context switch", "scheduler" and "operating system": not needed. Say "switch" and "which
    program runs next". "xv6, a real kernel written for teaching" needs no "operating system".
  - "high-level language", "source", "token", "parse", "syntax", "grammar", "variable", "register
    allocation", "optimisation": not needed. Say "the compiler's lines" and "a better compiler".
  - "label": never learner-facing since Module 11, which says "name"
    (`docs/notes/module-11-programming.md`, "Terms").
- **Words with two meanings on one page**, settled in each fact sheet:
  - Compiler: a device's name (its word in the compiler's lines, its address in assembly); "name"
    (a device's name, and a line's name such as `after1`); "line" (the compiler's line, and a line
    of assembly); "rule" (the shop's rule, and the compiler's: the fact sheet keeps "rule" for the
    compiler and says "the shop wants" for the shop); "piece" for the line's parts and "part" for
    the machine's; "turn over" for a comparison, as the course turns a bit over; "word".
  - Kernel: "count" (the timer's count, and the report's result: say "how many readings are
    warm"); "switch" (on this page only the kernel's; no physical switch appears); "turn"; "save"
    and "put back" for registers, "store" for a word, "record" in 12.8's sense; "the start" in
    Module 12's sense; "job" only for a system call's service; "the handler" for the kernel's code
    at C4; how a run ends in Module 11 and 12's words (stops, halts, is cut off, ends before a
    register nothing has set).
- **Each chapter's banned list** holds the other chapter's term, so either reads alone. Neither
  needs a `termExemptions` entry: no earlier lesson uses either word.
- **The cover is held to the gate** (`apps/course/src/pages/LessonList.test.tsx`, "uses no term that
  a lesson introduces"). So the "Beyond the machine" line's words (section 9) can say neither
  "compiler" nor "kernel", and the build adds them to that test's list.

## 8. Originality

Each lesson's `originalityNote` names the textbook version of its topic and how the lesson
differs, in the same commit as the lesson.

### The compiler, against the 5 October risks

- **No stack-based virtual machine** between the language and the assembly (Nand2Tetris's projects
  7 and 8). The compiler writes the course's register transfers directly, with no intermediate
  language. The only intermediate form is the line itself, rewritten.
- **No object-based language like Jack.** The compiler's lines are the course's own register-
  transfer text with the assembler's refusals lifted: no classes, objects, methods or types, no
  `let` or `do`. Its names are the shop's devices.
- **Not the split into a tokenizer, a parser that writes out a parse tree, then code generation.**
  The lesson shows one rule per refusal, applied to the line in place, and the compiler is built
  the same way: it rewrites the line, so the figure shows its real steps and no textbook phases.
  Token, parse tree, syntax and grammar never appear.
- **Not the Dragon Book's `position = initial + rate * 60`.** The lines are the shop's: Module 0's
  gap and CLASH rules, and the challenge mends Module 0's one-way check. There is no
  multiplication, so no precedence example can arise.
- **Close precedents the decision does not list, to name in the note.**
  - Patterson and Hennessy's "compiling a C assignment statement" and "compiling if-then-else into
    conditional branches", whose branch also tests the condition turned over, and Harris and
    Harris's versions. The course's line is the shop's, the target its own instruction set, and the
    compiler a running program whose output is the learner's first program.
  - The Dragon Book's three-address code with temporaries t1, t2. The course has no temporaries
    named as such, only the next register.
  - Crenshaw's "Let's Build a Compiler" (recursive descent writing 68000 code). The lesson builds
    nothing and shows no recursive descent.

### The kernel, against the 5 October risks

- **Not xv6's structure or names.** No trap frame, no process table or `proc`, no `swtch`, no
  scheduler loop or `struct context`, no `sched`, `yield`, `sleep` or `wakeup`, no system-call
  table or numbering, no kernel stack per program, no trampoline. The course's kernel is 12.8's
  runner grown: one handler at C4, 12.4's jobs 1 to 4 chosen by R1, two save areas at fixed
  addresses, two words naming the running and the waiting program's areas, and one switch inside
  the timer's part of the handler. xv6 saves twice, every register at the trap and fewer at the
  switch, which is a function call (*Systems From Scratch*, chapter 21). The course's kernel saves
  once, every register, in the handler.
- **No RISC-V privileged names** (`ecall`, `mcause`, `mret`, `mtvec`, `mepc`, `sret`). The course's
  own C0 to C4, `call system` and `resume`. The pointer to the book names none of them.
- **Not processes A, B and C taking turns.** Two programs, not three, both from the shop, doing
  different work (Module 0's gap on the display, 11.7's report on its first log). No letters
  printed in turn, and no names A, B and C.
- **Not a producer and a consumer.** The two programs share nothing but the machine: no buffer, no
  lock, no message between them.
- **Not `fork`.** Every program is in the ROM and is set up by the start in its own save area.
  Nothing is copied, and no program makes another.
- **Close precedents the decision does not list, to name in the note.**
  - Bryant and O'Hallaron's figure of a context switch: user code of one process, kernel code,
    user code of another, on a time line. The course's lanes are the view 12.4 and 12.8 already
    use, drawn from the machine's own run, each move labelled with what it writes, the switch's
    real length visible, and the trigger the shop's timer.
  - The "limited direct execution" argument of Arpaci-Dusseau's *Operating Systems: Three Easy
    Pieces*: a process that never makes a system call keeps the machine unless a timer interrupt
    takes it back. The course reaches the same point from the learner's own 12.8 runner and the
    shop's endless gap program, with none of that book's terms or its tables.
  - Round-robin time sharing, which 12.8's own note lists as the textbook capstone ("a round-robin
    scheduler with a process table and context switches on a timer interrupt"). Two programs
    alternating is its simplest case. The lesson builds no queue and does not use the name.

## 9. The platform and the site

### The schema's flag

- **Today** the schema has no such flag. A lesson's `module` is any whole number from 0, and
  `prerequisites` exists but no lesson uses it (`platform/lesson-schema/src/schema.ts`).
- **The change** is one optional field on `Lesson`: `optional: z.boolean().default(false)`,
  commented as "a chapter outside the book's numbered modules: the book lists it after them under
  its own heading, and counts it in no module still to be written". The metadata-systems course
  leaves it false, so nothing changes for it.
- **Where.** The schema is the platform's, a checked copy of `snowch/learning-platform`
  (`platform/SOURCE.json`; `docs/platform.md`). The change is made, tested (`schema.test.ts`) and
  regression-checked there, then synced with `node scripts/sync-platform.mjs ../learning-platform`.
  `npm run check` fails any edit made in `platform/` directly.
- `docs/platform.md` and `docs/plan.md` record it, the latter as the decision taken under point 5.

### Numbering and order

- Both chapters are module 14, orders 1 (the compiler) and 2 (the kernel), with `optional: true`.
  The shell never prints "Module 14" for them.
- Module 14 sorts them after Module 13 in `LESSONS` (`content/lessons/index.ts`), in the pager and
  in the term gate, which sorts by module, then order. So they may use every earlier term, and
  their own terms fail any earlier use.
- `MODULE_NAMES` (`content/lessons/module-names.ts`) and `docs/plan.md`'s table of modules stay at 0
  to 13. The front page's test reads that table's numbered rows and checks them against the names
  (`LessonList.test.tsx`, "names each module the plan has"). The "Beyond the machine" table's rows
  start with a name, not a number, and stay out of that match.

### The list of lessons

What the code does today: `LessonList.tsx` lists every module the plan names and any module a
lesson names (`modules`, lines 306 to 309). It draws any module in no stage before the stages, in
Module 0's form with the glass mark (lines 371 to 411). Chapters at module 14 with no flag would
therefore appear first, as "Module 14", above Signals. The change:
- lessons flagged optional leave `byModule`, so no module line is drawn for them and the count of
  modules still to be written is unchanged;
- after the five stages comes one line in the path's own form (a mark of its own, the name "Beyond
  the machine", where a stage names its modules a word saying the chapters are optional, its
  challenges complete, and a line saying what you do in it). Pressing it shows the chapters' lesson
  cards. It starts open when it holds the lesson the way in names, or the lesson just left;
- the way in: the chapters follow Module 13 in reading order. A reader who has finished the
  capstone is offered the compiler chapter. For a flagged lesson the button's lines name "Beyond
  the machine", not a module (`continueLine` and `continueWith` in `apps/course/src/strings.ts`
  take a module number today);
- the page without scripts (`apps/course/src/static-page.ts`) lists Module 0's line and the five
  stages, and gains the same line after them, from the same strings;
- the new words (the line's name, its about line, the button's lines) are cover words. They go
  through a brief like C3 to C6 and are added to the cover's term test;
- tests that change: "lists every module in order" counts module and opening sections, and the new
  line needs a class of its own; "opens the module of the lesson the reader has just left" takes
  the last lesson, which becomes the kernel chapter; a new test opens the line for a chapter just
  left; `tests/educational/pager.spec.ts` and the aesthetics test's rules for the front page (it is
  held to the rules, not to a screenshot).

### The pager

`LessonPager.tsx` writes `Module N` under the next and previous lessons' titles, and after the last
lesson "Next lesson is still to be written." (`STRINGS.pager.notYet`). For a flagged lesson it
writes the line's name. After the kernel chapter, the last lesson, it needs a line saying the course
ends here, drafted, with `pager.spec.ts` changed to match.

### Before the chapter

Both chapters list their `prerequisites`: the compiler 10.3 `immediates`, 11.1 `assembly` and 13.2
`full-path`; the kernel 12.4 `system-calls`, 12.5 `interrupts` and 12.8 `system-call-mechanism`. A
reader can reach an optional chapter from the list without the lessons before it. The runtime
already draws the list (`platform/lesson-runtime/src/LessonView.tsx`) under the platform's word
"Prerequisites" (`platform/lesson-runtime/src/strings.ts`). The course gives it a plainer heading
through `apps/course/src/runtime-strings.ts`, drafted.

### The pointer to *Systems From Scratch*

The book in `snowch/computer-systems` is titled *Systems From Scratch* (`README.md`, `index.md`,
`myst.yml`). It is published at <https://snowch.github.io/computer-systems/>. Each chapter's
reflection ends with one paragraph that points on, and it is the only forward reference on the page
(style rule 24):
- **The compiler.** Chapter 12, "What a Computer Does With a Program"
  (`chapters/what_a_computer_does_with_a_program.md`): one compiler command runs four programs,
  preprocessor, compiler, assembler and linker, and only the compiler decides anything. Then
  chapter 2, "Reading a Listing" (`chapters/reading_a_listing.md`), what a real compiler made of
  one small function; and chapter 14, "Machine-Level Code on RISC-V"
  (`chapters/machine_level_code_on_riscv.md`), a real compiler's registers, stack frames, and
  control flow as a comparison and a branch.
- **The kernel.** Chapter 16, "Traps and System Calls" (`chapters/traps_and_system_calls.md`), which
  follows one system call into xv6 and back out. Its hardware half does what the course machine's
  trap does: it records where the program was and why, turns interrupts off, changes the mode and
  jumps to the handler's address. Its software half saves every register, because one way in
  serves calls, faults and the timer. Then chapter 21, "Scheduling and Context Switches"
  (`chapters/scheduling_and_context_switches.md`): what xv6 saves when it switches programs, and
  why that switch saves fewer registers than the trap. Part II builds a trap, interrupts and
  privilege, and a system call on a bare machine: chapters 6, 7 and 9
  (`a_trap_with_nothing_else.md`, `interrupts_and_privilege.md`, `a_system_call_of_your_own.md`).
- **The links.** These are the first links out of the course: no lesson links anywhere today. MyST
  makes each page's address from its file. Check each link against the published site when the
  lesson is written (it could not be reached from here), and pin the addresses in a content test.
  The pointer names no RISC-V instruction.

## 10. Risks and open questions

1. **The flag, or a list in the course?** The decision says the schema needs a flag. The
   alternative is a list of optional modules in `content/lessons/module-names.ts`, with no round
   trip through the platform; the list of lessons would then no longer be worked out from the
   lessons alone. **Recommendation:** the flag, as decided, a boolean named `optional`, made in
   `snowch/learning-platform` and synced before the shell change.
2. **Which module number?** Module 14 for both, orders 1 and 2; or 14 and 15; or 13 with orders 6
   and 7. **Recommendation:** 14 for both. It sorts after Module 13 everywhere, even in code that
   ignores the flag, and is never shown.
3. **May the way in name an optional chapter?** **Recommendation:** yes, in reading order after
   Module 13, labelled "Beyond the machine". A reader who skips the chapters sees the button
   offer them, which is what "optional" means; the list and the pager say so too.
4. **Do the two write challenges break "neither has the reader build a compiler or a kernel"?**
   **Recommendation:** no. The compiler challenge translates one line by hand, as 11.1's "Being the
   assembler" did; the kernel challenge sets up one program's save area for a kernel given whole.
   Writing the switch, or any compiler, stays out.
5. **Answers on the page (Module 12's review, A2).** The kernel's figures run a start that writes a
   C2 and a C1 word for the report and names its save area as the one that waits, in the
   challenge's form. Without more, the challenge would be the figures' lines with new names, and
   only the stack would be new. **Recommendation:** the design in section 5, where the second
   program also takes its arguments from its save area's R1 and R2 words. That part and the stack
   are on no figure, and every attempt that copies the figures' start fails. The alternative, a
   start the figures hide, needs a new prop on the debugger and still shows the save area's words.
6. **May the learner type a line into the compile figure?** It would show the compiler is real, and
   it would answer the challenge. **Recommendation:** no, choices only.
7. **The switch's cost** (60 instructions a switch, 29 of a program's a turn at 80) dominates the
   run, and an optimised kernel would hide it. **Recommendation:** keep the plain kernel. Its cost
   is the failure experiment's point and the generalisation's number.
8. **The whole machine in the kernel chapter.** A `machine-levels` figure at the timer's interrupt
   edge (a short program of its own, so the run stays well under 100 edges) would tie the switch to
   12.7's hardware. **Recommendation:** leave it out unless the lesson stays under about 1,350
   words; one sentence points back to 12.7.
9. **Bare device names** mean the word in the compiler's lines and the address in assembly.
   **Recommendation:** say it once, in the motivation, with `R1 <= sensorA`; the challenge's tests
   catch the slip, and the fact sheet holds the two meanings apart.
10. **Close precedents not in the decision's list** (Patterson and Hennessy's inverted branch,
    Bryant and O'Hallaron's switch diagram, *Three Easy Pieces*' timer argument).
    **Recommendation:** name each in the originality notes, as section 8 does, and keep the course's
    own lanes view.
11. **The first links out of the course.** **Recommendation:** one paragraph per chapter, in the
    reflection, checked by hand against the published book before the merge, with the addresses
    pinned in a content test.
12. **`prerequisites`**, used by no lesson so far, puts a new block in the lesson header, which the
    aesthetics test screenshots for the lessons it names. **Recommendation:** use it in the two
    chapters only, with a plainer heading, and check the header's look at both widths.
13. **An assembler sentence found while checking.** `R3 <= sensorA - sensorB` is refused as "No line
    names sensorB", though `sensorB` is a device; `R3 <= word[sensorA] - word[sensorB]` is refused
    as "sensorA] - word[sensorB is not a number." (`packages/dd-model/src/assemble.ts`, the
    learner's sentences in `strings11.ts`). **Recommendation:** a small separate fix, a sentence for
    a job on two names or two words, outside the chapters. The chapters' figures show neither
    form.
14. **`docs/authoring.md`'s table of kinds** lacks the kinds Modules 0, 10, 11 and 13 added.
    **Recommendation:** the build adds `compile-steps` and the missing rows in one commit.
15. **Build order.** **Recommendation:** one branch in three steps: the flag and the shell, tested
    with a fixture lesson flagged optional; then the compiler; then the kernel. The chapters touch
    different files, but both need the shell first.

## Branches, merging and the note

- The platform change is made in `snowch/learning-platform` first, with its own check and the
  cross-book job, then synced here. Whoever makes it needs push access there; the managing session
  decides who.
- The build works on `beyond-the-machine`, from `main` at the commit that adds this plan, and
  pushes only there. It never pushes to `main`, opens a pull request or runs the deploy workflow.
  It merges `main` whenever `main` moves, and before finishing, and runs the check again after each
  merge.
- New code goes where the earlier modules put it: new files where it can be, and short appends in a
  block of their own, with a comment, in shared registries (`interactives/index.ts`, `index.ts`).
  Every existing figure, challenge and lesson keeps working, with its tests green.
- The whole check takes about 45 minutes. Ten stored screenshots fail in a build container on
  `main` too (text rendering); CI is the authority (`docs/notes/module-13-plan.md`).
- The managing session merges after running the check, walking the built site at phone, tablet and
  desktop widths and in the dark theme, and having each chapter read by a reviewer as its learner,
  with a sceptic for each review (CLAUDE.md, "Reviewing a lesson").
- The note, `docs/notes/beyond-the-machine.md`, with briefs and drafts in
  `docs/notes/beyond-the-machine/`, says what was reused, built and could be extracted; every edit
  to a file on `main` (the shell, the strings, `docs/plan.md`, `docs/platform.md`,
  `docs/authoring.md`); the terms and the words settled for each page; the programs and every
  number the prose states; the links checked; and what the build would change.

## Appendix: the programs as drafted and run

Run on the model in Node: the compiler's outputs through the program grader's `runScenario` and
`gradeProgramCase`, and on `machine-final` through `recordRun`; the kernel through `debugFinish` and
`runScenario` with `MODULE_12`; the readings -184 and -250 unless stated.

### The gap program and the report

```
gap:    R2 <= 0
        R1 <= 2
        call system             // room A's reading, in R1
        R5 <= R1
        R2 <= 1
        R1 <= 2
        call system             // room B's reading, in R1
        R2 <= R5 - R1           // the gap: room A minus room B
        R1 <= 1
        call system             // show the gap
        goto gap

report: R10 <= log              // the next reading's address
        R11 <= word[count]      // readings left
        R12 <= -180             // the limit
        R13 <= 0                // warm readings so far
        R5 <= 0
next:   if R11 == R5 goto told
        R3 <= word[R10]
        R10 <= R10 + 8
        R11 <= R11 - 1
        if R3 < R12 signed goto next
        if R3 == R12 goto next
        R13 <= R13 + 1
        goto next
told:   word[0x640] <= R13      // how many, in the RAM
        R2 <= 0
        if R13 == R2 goto quiet
        R2 <= 1                 // ALARM: a reading was warmer than the limit
quiet:  R1 <= 3
        call system             // the lamps
        R1 <= 4
        call system             // end
count:  word 6
log:    word -184, -190, -176, -181, -172, -188
```

### The figures' start

```
        R1 <= handler
        C4 <= R1
        R1 <= gap
        word[0x588] <= R1       // the gap program's return point: its first line
        R1 <= 2
        word[0x580] <= R1       // its status: user mode, interrupts on
        R1 <= report
        word[0x628] <= R1       // the report's return point
        R1 <= 2
        word[0x620] <= R1       // its status
        R1 <= 0x500
        word[0x480] <= R1       // the save area of the program that runs
        R1 <= 0x5A0
        word[0x488] <= R1       // the save area of the program that waits
        R1 <= 80
        word[timer] <= R1       // instructions to the first switch
        goto load
```

### The kernel, at a count of 80

```
handler: word[0x400] <= R8      // save R8 and R9
        word[0x408] <= R9
        R9 <= C3
        R8 <= 0x81
        if R9 == R8 goto tick
        R8 <= 0x41
        if R9 != R8 goto ended  // a fault: the program ends, its record its cause
        R8 <= 1
        if R1 == R8 goto show
        R8 <= 2
        if R1 == R8 goto room
        R8 <= 3
        if R1 == R8 goto light
        R8 <= 4
        if R1 == R8 goto finish
        goto back
show:   word[display] <= R2
        goto back
room:   R1 <= word[sensorA]
        R8 <= 0
        if R2 == R8 goto back
        R1 <= word[sensorB]
        R8 <= 1
        if R2 == R8 goto back
        R1 <= 0
        goto back
light:  word[lamps] <= R2
        goto back
back:   R8 <= word[0x400]       // put R8 and R9 back
        R9 <= word[0x408]
        resume
tick:   R8 <= 1
        word[waiting] <= R8     // the timer's event is seen
        R8 <= 80
        word[timer] <= R8       // the next program's count
        R8 <= word[0x488]
        R9 <= 0
        if R8 == R9 goto back   // no program waits: this one carries on
        R9 <= word[0x480]       // save this program's words in its save area
        word[R9] <= R0
        word[R9 + 8] <= R1
        word[R9 + 16] <= R2
        word[R9 + 24] <= R3
        word[R9 + 32] <= R4
        word[R9 + 40] <= R5
        word[R9 + 48] <= R6
        word[R9 + 56] <= R7
        R8 <= word[0x400]
        word[R9 + 64] <= R8     // its R8, saved at the handler's start
        R8 <= word[0x408]
        word[R9 + 72] <= R8     // its R9
        word[R9 + 80] <= R10
        word[R9 + 88] <= R11
        word[R9 + 96] <= R12
        word[R9 + 104] <= R13
        word[R9 + 112] <= R14
        word[R9 + 120] <= R15
        R8 <= C1
        word[R9 + 128] <= R8    // its status
        R8 <= C2
        word[R9 + 136] <= R8    // its return point: the instruction not yet run
        R8 <= word[0x488]
        word[0x488] <= R9       // this program waits now
        word[0x480] <= R8       // the other runs
load:   R9 <= word[0x480]       // put back the words of the program that runs
        R8 <= word[R9 + 128]
        C1 <= R8
        R8 <= word[R9 + 136]
        C2 <= R8
        R0 <= word[R9]
        R1 <= word[R9 + 8]
        R2 <= word[R9 + 16]
        R3 <= word[R9 + 24]
        R4 <= word[R9 + 32]
        R5 <= word[R9 + 40]
        R6 <= word[R9 + 48]
        R7 <= word[R9 + 56]
        R10 <= word[R9 + 80]
        R11 <= word[R9 + 88]
        R12 <= word[R9 + 96]
        R13 <= word[R9 + 104]
        R14 <= word[R9 + 112]
        R15 <= word[R9 + 120]
        R8 <= word[R9 + 64]
        R9 <= word[R9 + 72]
        resume
finish: R9 <= 0                 // job 4: the program ended; its record is 0
ended:  R8 <= word[0x480]
        word[R8 + 144] <= R9    // the record: 0, or the cause it faulted with
        R8 <= word[0x488]
        R9 <= 0
        if R8 == R9 goto done   // no program waits: every program has ended
        word[0x480] <= R8       // the waiting program runs
        word[0x488] <= R9       // and none waits
        goto load
done:   stop
```

### The challenge's start, as the reference completes it

The kernel follows it, unchanged. The starting text leaves out the ten lines from `R1 <= second` to
`word[0x5B0] <= R1`, and has `R1 <= 0` in place of `R1 <= 0x5A0`.

```
        R1 <= handler
        C4 <= R1
        R1 <= program
        word[0x588] <= R1       // the first program's return point: its first line
        R1 <= 2
        word[0x580] <= R1       // its status: user mode, interrupts on
        R1 <= 0x7C0
        word[0x570] <= R1       // its R14: the top of its stack
        R1 <= second
        word[0x628] <= R1       // the second program's return point
        R1 <= 2
        word[0x620] <= R1       // its status
        R1 <= 0x700
        word[0x610] <= R1       // its R14
        R1 <= secondLog
        word[0x5A8] <= R1       // its R1: the address of its readings
        R1 <= word[secondCount]
        word[0x5B0] <= R1       // its R2: how many readings
        R1 <= 0x500
        word[0x480] <= R1       // the save area of the program that runs
        R1 <= 0x5A0
        word[0x488] <= R1       // the save area of the program that waits
        R1 <= 80
        word[timer] <= R1
        goto load
```

The tests' second programs start `second: R10 <= R1` and `R11 <= R2` (runs 1 and 3, the report)
or `second: call warmCount, R15` (run 2), and the tests add `secondLog` and `secondCount` as words.

### The challenge runs, as checked

| | Run 1 | Run 2 | Run 3 |
| --- | --- | --- | --- |
| reference | `66, 2, 66, 66`; records 0, 0 | `104, 4`; records 0, 0 | `66, 66, 66`; records 0, 50 |
| starting text | `66, 66, 66`; second record X | `104`; second record X | second record X |
| R1 and R2 set before `goto load`, or written into the first area, or not written | ends before a branch on R11 | ends before a branch on R11 | ends before a branch on R11 |
| the count's address, `R1 <= secondCount` | ends before a branch on an unset register | the same | the same |
| the two arguments swapped | second record 51 (`33`) | second record 51 | second record 51 |
| second stack from `7C0` | as reference | `4, 4` | as reference |
| second status `00` | as reference | `4, 104` | as reference |
| second status `11` | as reference | C1 `11` | `66, 2, 66, 66`; records 0, 0 |
| C2 word `second + 4` | ends before an address in an unset register | `728, 104` | ends before an address in an unset register |
| C1 and C2 words swapped | second record 18 (`12`) | second record 18 | second record 18 |
| no R14 word for the second | as reference | ends before a push through R14 | as reference |

In every run C1 ends `10`, except where the table says otherwise.

## The managing session's decisions (10 October 2026)

Every recommendation in section 10 is taken. The flag is done: `optional`, a boolean that defaults
to false, in `snowch/learning-platform` at 9ab98e9 with the contract regenerated; the build syncs
the platform copy (`node scripts/sync-platform.mjs <checkout>`, from a clean clone of the platform
at that commit) as the first commit of its first step. The assembler's sentence for a job on two
names or two words (risk 13) is a separate small fix outside the chapters; the build may make it
on its branch in a commit of its own. The book's addresses (risk 11) are checked by hand before
the merge.
