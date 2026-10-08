# Module 12, traps and interrupts: the plan

Written by the managing session before the build started, as Modules 8 to 11's were. The build
reads it first and keeps to it. A change to this plan is the managing session's to make; a build
that needs one says so in its module note and carries on inside the plan. `docs/plan.md` is the
course plan the module comes from. `docs/machine.md`, "Traps and interrupts (Module 12)", and
`docs/isa.md`, "System jobs" and "System calls: a proposal for Module 12", already specify the
mechanism this module builds; the author approved both at checkpoint 2.

## What the module covers

From `docs/plan.md`, module 12: synchronous exceptions, interrupts, the cause, saving state,
vectors, privilege, the return, nesting and system calls. Lab: a trap timeline, pausable at every
hardware transition. Capstone: a minimal system-call mechanism. Reuses Module 5's state machines
and Module 9's control. The cover names the module "Errors and responses" and its stage, "The whole
machine", as making "the machine respond when errors occur".

Lesson 11.7 ends on the question this module answers: "When it does something the machine
refuses, the machine halts and nothing more runs. A shop's machine runs more than one program. It
should not stop for good on one program's mistake. What if, instead of halting, the machine went to
a program of its own, said why, and carried on?"

A module may be more than one lesson. Size each lesson like the existing ones and split where the
material needs it; say in the note why the split falls where it does. Every lesson has the ten
sections. The lessons are module 12, order 1 onward.

**Checkpoint 5 follows this module** (`docs/plan.md`: "Before Module 13, the final machine"). The
managing session writes that report after the merge; the note should give it what it needs (what
the learner can now do, what was built, what was decided, what is left for Module 13).

## The learner

Modules 0 to 11 are on `main`, 46 lessons, and the learner has done all of them and nothing after.
What they have already met, so Module 12 builds on it and does not repeat it:

- **Causes** since lesson 8.3 (`11`, `12`, `21`), 8.4 (`31`, `33`, `34`), 8.5 and Module 10; the
  machine stops and the page says why. Lesson 9.2 named the control registers ("one of five
  registers, numbered 0 to 4, that Module 12 builds") and stopped system jobs 1 to 3 "as jobs a
  later module builds"; cause `41` is `call system`, "which Module 12 builds", in Module 11's
  debugger.
- **Module 11**: programs as text, the learner's assembler and its refusals, the debugger
  (breakpoints, the watch, the stack view), lists, functions, the stack from `7C0` and the calling
  convention, recursion, a method for finding a mistake (11.6 reads how a run ends), and a
  capstone program of three functions.
- **Module 5** built state machines and **Module 9** the controller of the machine of several
  edges, with the learner's own copy extended in 9.5.

They have never had a program run when something goes wrong, met user and system mode, had the
machine stop a program between two instructions, or asked another program to do a job for them.

## What Module 12 teaches

- **A handler instead of a stop.** C4 holds the handler's address; at the edge that ends the
  instruction that traps, C2 takes the return point, C1 takes C0, C0 takes `01`, C3 takes the
  cause and the PC takes C4, and nothing else changes; `R3 <= C3` reads the cause; `resume` goes
  back. The return point by cause (`docs/machine.md`'s table): a fault returns to the instruction
  that faulted, to mend and run again or to skip by adding 4 to C2; a system call to the next
  instruction; an interrupt to the instruction not yet run.
- **Saving state.** A handler runs in the middle of another program, so it saves what it uses and
  puts it back before `resume`, with absolute stores (`word[0x400] <= R1`), since no register can
  be trusted to hold an address: R14 may be the very thing that went wrong.
- **Privilege.** C0's bit 0: system mode and user mode. What user mode refuses (`22`, `32`) and
  why: a faulty program cannot reach the shop's devices or the control registers. Dropping to user
  mode with `resume`. Say plainly what the machine does not protect: its RAM.
- **System calls.** `call system` (`41`), the service in R1, its arguments in R2 to R4 and its
  result in R1, as `docs/isa.md` proposes: a user program reaches the shop's devices through the
  handler. The module decides the services it needs and says why in the note.
- **Interrupts.** The timer and the door (`81`, `82`), the waiting bits, C0's bit 1, taken between
  two instructions; the handler clears the waiting bit and the program carries on unaware. An
  example from the shop, original (see Originality).
- **Nesting.** A trap turns interrupts off; a fault inside a handler overwrites C1 and C2, the
  failure `docs/machine.md` says this module shows; a handler that turns interrupts on saves C1 and
  C2 first.
- **The hardware.** Where each of those transfers happens in a machine the learner built: the
  control registers and the selectors in front of them, register Y's input from a control
  register, the next PC from C2 or C4, the trap logic (every cause, the waiting bits and C0's bit 1
  in; whether this edge traps, and with which cause, out: the lower number wins, as Module 8's
  causes did in lessons 8.3 and 8.4), and the controller's step for a trap. The learner builds at least one part of it
  and can open every part.
- **The capstone: a minimal system-call mechanism.** The learner's handler offers the services,
  sets C4 and drops to user mode; user programs run through the services. Graded by tests that run
  several user programs, a faulty one among them (a user program that touches a device directly,
  `32`, is stopped and reported, and the next runs). Offer the course plan's three tiers if they
  fit, as Module 11's capstone did: three ways into one challenge.

## The machine: the model and the circuits

Nothing of this is built yet. `docs/machine.md` and `docs/isa.md` specify it; the code has none of
it: `machine.ts` has no control registers or mode, and every trap stops the machine; `resume` and
the control-register jobs stop as "later"; causes `22`, `32`, `81` and `82` exist only in the
documents; Module 8's datapath says "C0 to C4 are Module 12's", and Module 9's controller has no
step for a trap.

- **The instruction-level model** (`machine.ts`) gains C0 to C4, the mode, traps to C4, `resume`,
  the two control-register jobs, causes `22`, `32`, `81` and `82`, and interrupts. At reset the
  machine is in system mode with no handler, so every program of Modules 8 to 11 runs as it does
  today and every test stays green: a trap with C4 at 0 stops the machine with its cause, as now.
- **The circuit.** The trap hardware joins the machine of several edges, since a trap is a step of
  its controller (Module 5's state machine, Module 9's control: the reuse `docs/plan.md` names).
  Build it as Module 12's own copy of that machine, so Modules 8 to 11's figures and tests stay as
  they are; Module 13 takes Module 12's copy. The circuit and the model must agree after every
  instruction, traps and interrupts included, as the learner's machines have since Module 8, and
  10.1 taught that a program relies on that agreement. If the build finds a reason to put the
  hardware elsewhere, it says so in the note before building.
- **The documents disagree on which control registers a program writes.** `docs/isa.md`'s system
  jobs give `Cc ← RA` for every c from 0 to 4; `docs/machine.md`'s datapath gives the register A
  only to C0 and C4. `docs/machine.md`'s own words need more: a handler skips a faulting
  instruction by adding 4 to C2, and one that turns interrupts on copies C1 and C2 to memory and
  must write them back before `resume`. Take `docs/isa.md`'s rule: all five are written by
  `Cc <= Rm`. Correct `docs/machine.md`'s datapath bullet in the module's first commit, and say so
  in the note; the managing session puts this to the author with this plan, at checkpoint 4.
- **The debugger** (Module 11's) shows C0 to C4 and the mode where a lesson needs them, the timer
  and the waiting bits, and DOOR and WARM; the shop's inputs can change during a run (the door
  opens before a chosen instruction), so an interrupt can be stepped. Every stop's reason stays in
  plain words, and a trap that goes to a handler is shown as such, not as a stop.
- **The grader** (`program-tests.ts`) can check C0 to C4 and the mode, and give a test a door that
  opens at a set instruction.
- **The learner's assembler** refuses a control register outside C0 to C4 with a sentence, drafted
  as Module 11's were; today `R1 <= C7` assembles and traps `21` when it runs. The authors' tool
  still makes such a word, for lesson 9.2.

## Figures

A figure for every idea, readable at 375 pixels, and a figure in a lesson's opening where it helps
the learner picture the question. At least:

- **the trap timeline** (the course plan's lab): one trap from the instruction that causes it to
  `resume`, pausable at every hardware transition: the instruction, the edge at which C2, C1, C0,
  C3 and the PC take their values, the handler's instructions, `resume`'s edge; at the instruction
  level, and at the edge level on the machine of several edges. Module 9's `edge-timeline` and
  `datapath` figures and the platform's `Timeline` and `Stepper` are where to start; no existing
  figure shows a trap's transfers;
- the debugger with the control registers, the mode and an interrupt that arrives mid-run;
- the memory map as user mode sees it: what a user program may reach, and what traps;
- a system call crossing from a user program to the handler and back;
- nesting: two traps, the second overwriting C1 and C2;
- the trap hardware in the circuit, opened at the part the words name (`focus`);
- the capstone's user programs and what each left.

A large drawing opens on the part the words name (`docs/notes/overview-strip.md`). Every figure
passes the diagrams and aesthetics tests at both widths. A figure's results show after the run
that makes them, as Module 11's do (`outcomes`).

## Terms

Rationed on `main` today: every `introduces` list in Modules 0 to 11. None of trap, handler,
interrupt, user mode, system mode, system call, privilege or nesting is rationed or used on a page
yet; the gate matches a word's stem followed by letters, ignoring case.

- **Module 12 owns the words of traps.** Ration what the lessons use, each where the circuit or
  the program in front of the learner raises it: trap, handler, interrupt, user mode, system mode,
  system call, and others the lessons need. List each in the note.
- **Words that cannot be rationed without exemptions**, found by running the gate over every
  lesson: "mode" alone (it matches "model", on 29 lessons), "cause" (17 lessons, since 8.3),
  "return" (18), "vector" (6.2 and 6.4, in the SystemVerilog sense of a bus) and "control
  register" (9.2). Ration the two-word "user mode" and "system mode", not "mode". The cover's words
  are tested against every term too, so "error" and "response" cannot be introduced.
- **"Vector."** `docs/machine.md`'s decision 6 gives "vector" to C4 "when Module 12 teaches
  vectors". On this course "vector" already means a bus of bits (lessons 6.2 and 6.4). Call C4 the
  handler's address on the pages; if a lesson names the table other machines keep, say so once,
  without rationing the word, and say why in the note.
- **Words with two meanings on one page.** "Return": `resume`'s return point (C2) and a function's
  return address (R15). "Call": `call system` and a call of a function. "Stop": the `stop`
  instruction and the machine stopping when C4 is 0. "Cause": C3's number and the English word.
  "Interrupt": the event, and interrupts being on (C0's bit 1). Say which where both appear.
- "C0" is also the ALU's carry into bit 0 (lesson 7.1), and C2, C1 and C0 are the constant's bits
  in 9.2's check. No Module 12 page may use C0 in both senses.
- "Kernel" and "operating system" belong to the optional chapter after Module 13
  (`docs/plan.md`, "Beyond the machine"). Module 12 calls its program the handler.

## The SystemVerilog this module brings

`docs/plan.md` gives Modules 11 and 12 the testbench constructs (`initial`, `#`, `$display`), read
by the learner, not written. Module 11 brought none and left them here. Bring them only if a lesson
needs them, for instance a testbench that drives the learner's trap logic through each cause and
prints the cause it chose. If the build brings them, gate them per figure and challenge in
`packages/hdl/src/gate.ts`, with a plain refusal elsewhere; today `initial` is refused by the
parser ("the course meets it in a later module"), a delay as an unexpected `#`, and `$` by the
lexer. If no lesson needs them, leave them to Module 13 and say so in the note.

## The platform

New code goes where the earlier modules put it: new files where it can be; edits to shared
registries as short appends in a block of their own, with a comment naming the module. Keep every
existing figure, challenge and lesson working and their tests green.

The shared primitives are in `platform/primitives`, a checked copy of `snowch/learning-platform`
(`docs/platform.md`): change them only there, then sync. If Module 12 is the second consumer of a
candidate an earlier note listed (Module 11's note says its debugger "is generic over any machine
with a step function and a register file, but has one consumer"), say so in the note; extraction
waits for the author's approval.

The whole check takes about 45 minutes. Ten stored screenshots fail in a build container on `main`
too (text rendering); the managing session's container and CI pass them, and CI is the authority.
Keep the browser tests to what only a browser shows, and say in the note what the module added.

## Originality

The standard presentations are close. Do not reproduce or closely follow:

- Patt and Patel's LC-3, the closest precedent (`docs/plan.md` asks each `originalityNote` to name
  it): its trap routines and their service names (GETC, OUT, PUTS, IN, HALT), its trap vector
  table, its supervisor stack and processor status register, its interrupt-driven keyboard echo;
- Harris and Harris's and Patterson and Hennessy's exception handling (EPC and Cause, the MIPS
  exception handler and its examples);
- Bryant and O'Hallaron's exceptional control flow: its classes of exception, its exception table
  and its system-call examples;
- RISC-V's privileged names (`ecall`, `mcause`, `mret`, `mtvec`, `mepc`) and xv6's trap frame,
  system-call table and numbering;
- the stock examples: a divide by zero, a page fault, a keyboard echo, processes taking turns, a
  producer and a consumer, `fork`.

The course's own world is the shop: its rooms, sensors, display, lamps, door and timer. A door left
open, a sensor read through a service, a program that touches a device it may not: those are this
module's. Each lesson's `originalityNote` names the textbook version of its topic and how the
lesson differs, in the same commit as the lesson.

## Branches, merging and the note

- The build works on `module-12-traps`, from `main` at the commit that adds this plan, and pushes
  only there. It never pushes to `main`, opens a pull request or runs the deploy workflow.
- `main` may move during the build. Merge it into the branch whenever it does, and before
  finishing, and run the check again after each merge.
- The managing session merges the branch into `main`, after running the check, walking the built
  site and having each lesson read by a reviewer as its learner.
- The module's note, `docs/notes/module-12-traps.md`, says what was reused, what was built, what
  was extracted or could be, every edit to a lesson or document on `main` (the correction to
  `docs/machine.md` among them), the terms and their exemptions, the services and why, where the
  hardware went and why, and what the build would change.
