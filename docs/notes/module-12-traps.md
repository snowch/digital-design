# Module 12: traps and interrupts

A working note, written as the module is built, on the branch `module-12-traps`. Times are read
from the clock (`date -u`). "The building session" writes the code and the briefs and checks every
draft; "the drafting subagent" is the Haiku subagent that writes every learner-facing sentence from
a brief of checked facts. The plan is `docs/notes/module-12-plan.md`.

## Times

- Started: 2026-10-07 23:39 UTC (first command in the session).
- Outline committed and sent: 23:45 (below).
- Last lesson committed: 2026-10-08 01:34; strings, browser tests and second pass: 02:02.
- Full check started: 02:03 (below, "The full check").

## Log

- 23:39 to 23:50 Read CLAUDE.md, the plan, `docs/plan.md`, `docs/machine.md`, `docs/isa.md`,
  `docs/authoring.md`, `docs/style.md`, `docs/platform.md`, Module 11's plan and note (with the
  changes its two reviews made), Module 9's note, and the code the module builds on: the
  reference (`machine.ts`), the learner's assembler, the debugger and the program tests, the
  machine of several edges (`multicycle.ts`), its decoder and controller (`control.ts`) and their
  hand placements (`library-control.ts`), the term gate, and lesson 11.4 as the model of a lesson's
  files. Scanned every lesson's words for the candidate terms (below, "Terms").
- 23:45 `docs/machine.md`'s datapath bullet corrected (below, "Edits to files on `main`").
- 23:50 The model (`machine.ts`): C0 to C4, traps to C4, `resume`, the control-register jobs,
  causes `22`, `32`, `81`, `82`, interrupts, behind `MODULE_12`; the debugger, the grader and the
  learner's assembler taught them.
- 00:00 The circuit (`traps.ts`), Module 12's copy of Module 9's machine with the trap hardware,
  compared with the model after every instruction on 45 programs, traps and interrupts included.
- 00:17 The circuit placed and routed by hand: no drawing problem at any scope.
- 00:24 The figures: the trap timeline (new), the debugger grown (control registers, the timer
  and the door, the door's time), the memory map in user mode.
- 00:34 to 01:34 The eight lessons, one commit each (12.2 to 12.4 together), each drafted by the
  drafting subagent from briefs of checked facts, the drafts and every fix kept in
  `docs/notes/module-12-traps/` (briefs, drafts, `N-fixes.md`), and each with a facts test.
- 01:51 Every `[draft]` view string drafted (briefs V1 and V2); Module 12's browser spec; the
  debugger's panels made to fit a phone.
- 01:56 The second pass over every lesson (below, "Second pass").
- 02:02 The results cards' wording for Module 12's runs; the mechanical walk (below).
- 02:03 `docs/machine.md`: the three decisions the plan took inside it (below).

## The outline

Eight lessons. Each answers the question the one before ends on, and the split falls where the
learner's machine gains a new part or a new rule: a handler instead of a stop (1); what the
handler must not spoil (2); a mode in which a program may not reach the devices (3); a way for
such a program to ask for them (4); an event from outside, between two instructions (5); a trap
inside the handler (6); where each of these happens in the circuit (7); and a handler that runs
the shop's programs (8). Lessons 1 and 2 split as Module 11 split functions from the stack: the
transfer first, then what it costs the program it interrupts. Lessons 5 and 6 split because a
fault inside a handler happens without interrupts, but only interrupts give a handler a reason to
let a trap in on purpose.

1. `traps`, "What if, instead of halting, the machine went to a program of its own?" (11.7's
   closing question). C4 holds the handler's address; at the edge that ends the instruction that
   faults, C2 takes the return point, C1 takes C0, C0 takes `01`, C3 takes the cause and the PC
   takes C4, and nothing else changes. `R3 <= C3` reads the cause; `resume` goes back. A fault's
   return point is the instruction that faulted, so a handler that only resumes runs it again,
   for ever; one that adds 4 to C2 skips it. Opening figure: the trap timeline, at the instruction
   level. Prediction: C2 after the trap (the faulting instruction's address; the next one's is
   the tempting answer). Failure experiment: the handler without the skip, cut off after 5000.
   Challenge: a handler that skips each refused store and counts them, checked by C3, the count
   and the program's own result. Introduces **trap**, **handler**.
2. `saving-state`, "The handler uses registers too: what of the program it stopped?": a handler
   that counts in R1 spoils the program's R1; it saves what it uses with absolute stores
   (`word[0x400] <= R1`) and puts it back before `resume`. It cannot push: R14 may be the very
   thing that went wrong, and lesson 11.4 showed a stack run into the ROM. Failure experiment: a
   handler whose first instruction stores through R14, run on a program whose stack has reached
   the ROM: the trap is at the address C4 holds, so the machine halts. Challenge: a handler that
   puts back every register it uses, tested with R1 to R14 set to words of the tests' own.
   Introduces nothing.
3. `user-mode`, "How can the handler keep a faulty program away from the shop's devices and from
   the handler itself?": C0's bit 0; user mode refuses `resume`, the control-register jobs and
   `stop` (`22`), and every load or store at a device's address (`32`); the handler drops to user
   mode by writing C1 and C2 and running `resume`. The memory map as user mode sees it. Said
   plainly: the RAM is not protected, and a user program can overwrite the handler's save area
   (the failure experiment). Challenge: start a program in user mode and report how it ended.
   Introduces **user mode**, **system mode**.
4. `system-calls`, "How does a user program show a reading, if it may not touch the display?":
   `call system` (`41`), the service in R1, its arguments in R2 to R4, its result in R1; its return
   point is the next instruction. The handler chooses by R1. A figure follows one system call from
   the user program into the handler and back, the mode beside each step. Challenge: the service
   that reads a room's sensor. Introduces **system call**.
5. `interrupts`, "How can the machine answer the door while a program runs?": the waiting bits,
   C0's bit 1, taken between two instructions; the return point is the instruction not yet run;
   the handler clears the waiting bit and the program carries on unaware. The shop's example: a
   door left open. The door's opening starts the timer; when the timer reaches 0 with the door
   still open, ALARM lights. The debugger opens the door before a chosen instruction. Failure
   experiment: a handler that does not clear the waiting bit is interrupted again at once, for
   ever. Introduces **interrupt**.
6. `nesting`, "What if a trap happens while the handler runs?": a trap turns interrupts off, so a
   waiting interrupt waits for `resume`; a fault inside the handler overwrites C1 and C2, and the
   way back to the user program is lost (the failure `docs/machine.md` says this module shows); a
   handler that turns interrupts on saves C1 and C2 first and writes them back before `resume`.
   Figure: two traps on one timeline. Challenge: a long service that lets the door in. Introduces
   nothing.
7. `trap-hardware`, "Where in the machine does a trap happen?": the control registers and the
   selectors in front of them, register Y's word from a control register, the next PC from C2 or
   C4, the trap logic (every cause, the waiting bits and C0's bit 1 in; whether this edge traps,
   and with which cause, out: the lower number wins, Module 3's priority), and the controller's
   step for a trap. The trap timeline at the edge level, on Module 12's machine of several edges.
   The learner writes the trap logic (SystemVerilog, a combinational table) and opens every
   part. Introduces nothing.
8. `system-call-mechanism`, the capstone, "Can you write the handler that runs the shop's
   programs?" (below). Introduces nothing.

## The figures

- **`trap-timeline`** (new; lessons 1, 4 and 6): a recorded run on the instruction-level model,
  one row per edge, each edge's instruction or trap, the PC and C0 to C4, with the changed values
  marked and the mode in words. The learner steps edge by edge, or jumps to the next transition
  (the instruction that traps, the trap's edge, the handler's first instruction, `resume`'s edge,
  the instruction resumed). Its result text shows once the run has been stepped to its end.
- **The edge-level timeline** (lesson 7): Module 8's `edge-timeline` on `machine-traps`, with
  lanes for the controller's state, the PC, the IR, C0, C2, C3 and TRAP.
- **The debugger** (Module 11's), grown: C0 to C4 with the mode in words, the timer, the waiting
  bits, DOOR and WARM; a door that opens before a chosen instruction (`door` prop, and a control
  where a lesson lets the learner choose); a trap that goes to the handler shown as such, with its
  cause, never as a halt; `outcomes` after the run.
- **The memory map** (Module 8's `memory-map`), with a user-mode column (lesson 3).
- **The trap hardware** (lesson 7): the `datapath` figure on `machine-traps`, opened at the part
  the words name (`focus`).
- **`program-results`** (new, or Module 11's `log-results` grown; the capstone): the user programs
  of a run, each with what it showed and how it ended.

## The machine: the model and the circuit

- **The model** (`machine.ts`) gains C0 to C4, the mode, traps to C4, `resume`, the two
  control-register jobs, causes `22`, `32`, `81` and `82`, and interrupts, behind a
  `MachineOptions` flag (`traps`), with `MODULE_12` the course's machine from this module on. At
  reset the machine is in system mode with no handler, so a trap with C4 at 0 halts with its cause,
  as now; Modules 8 to 11 keep their options and every page runs as it does today.
- **The circuit** is Module 12's own copy of Module 9's machine of several edges
  (`packages/dd-model/src/traps.ts`, library id `machine-traps`), so Modules 8 to 11's figures and
  tests stay as they are. Where the parts go: the control registers and the selectors in front
  of them inside the datapath block, as `docs/machine.md` lists them among the datapath's parts;
  the trap logic in the control unit, where the stop logic was; C0's mode into the decoder (cause
  `22`) and, on the control bus, into the memory's checks (cause `32`). New wires at the top
  level: the cause into the datapath (for C3), C0 and "no handler" from the datapath to the
  control unit, and the waiting bits from the memory to the control unit. The controller gains
  one rule, that an edge which traps leads to FETCH, and one way, READ to WRITE for `resume` and
  the control-register jobs. The circuit and the model are compared after every instruction,
  traps and interrupts included.
- **Decided inside the plan, where `docs/machine.md` leaves it open**: an interrupt is taken at
  the edge that would fetch, and a fetch's own cause (`11`, `12`) wins over it there, as the lower
  number; a trap's edge does not count down the timer, since no instruction finished; the door is
  sampled at every edge that ends an instruction or traps. These go into `docs/machine.md` with
  the module.
- **The learner's assembler** refuses a control register outside C0 to C4 with a sentence; the
  authors' tool still makes such a word, for lesson 9.2.
- **The grader** checks C0 to C4 and the mode, and runs a test with a door that opens at a set
  instruction.

## The system call's services

`docs/isa.md`'s proposal, kept: 1 shows R2 on the display; 2 reads a room's sensor (R2 is 0 for
room A, 1 for room B; the reading in R1); 3 sets the lamps from R2's bits 2 to 0; 4 ends the
program. They are the least that gives a user program the shop's display, sensors and lamps, and
the end lets the handler run the next program. Nothing in the lessons needs the door or the timer
from a user program: the handler owns them, through interrupts.

## The capstone

The learner's handler sets C4, then runs the user programs a table names, one after another, each
in user mode, through the four services. Service 4 ends a program; a program that faults (a user
program that touches a device directly, `32`, among the tests) is stopped, its cause recorded,
and the next runs. After the last, the handler stops. The tests add the user programs and their
table after the learner's handler, as `word` data and code, and check the words shown in order,
the lamps, the record of how each program ended, the mode each user program ran in, and the
stop. The course plan's three tiers are three ways into one challenge, as Module 11's capstone
offered them: an outline with the handler's parts and hints, the specification with an empty
program, or the requirements and the tests alone.

## Terms

Rationed, each where the program or circuit in front of the learner raises it: **trap** and
**handler** (lesson 1), **user mode** and **system mode** (lesson 3), **system call** (lesson 4),
**interrupt** (lesson 5). None appears on any lesson's page or in Module 0's figure words today;
"trap" is in two originality notes and a figure's id, which the gate does not read.

Not rationed, as the plan says: "mode" alone, "cause", "return", "vector" (6.2 and 6.4's bus),
"control register" (9.2). "Vector" is not used: C4 is "the handler's address". "Privilege" and
"nesting" are not used either: the pages say what user mode refuses, and "a trap inside the
handler". "Kernel" and "operating system" are the optional chapter's. Exemptions foreseen: none.

Words with two meanings on one page, each said which where both appear: "return" (`resume`'s return
point and a function's return address), "call" (`call system` and a call of a function), "stop"
(the instruction, and the halt with C4 at 0), "cause" (C3's number and the English word),
"interrupt" (the event, and interrupts being on). C0 is never also the ALU's carry on these pages.

How a run ends, Module 11's words kept: a run *stops* at its `stop`; the machine *halts* with a
cause; the debugger *pauses* at a breakpoint; a run is *cut off* after 5000 instructions; the
debugger *ends* it before a register nothing has set. Module 12's own: an instruction *traps*, and
the machine *goes to the handler*; the handler *resumes* the program. A trap with no handler is a
halt, and the pages say so.

## The SystemVerilog this module brings

None planned. The learner writes the trap logic in the subset they have (`always_comb`, `if`,
vectors), and its tests are a combinational table, so no lesson needs `initial`, `#` or
`$display`. They are left to Module 13.

## Reused, built, and extractable

- **Reused and grown**: Module 11's debugger (a control registers panel with the mode in words,
  a panel for the timer and the door, a choice of when the door opens, traps shown as traps, never
  as halts); Module 11's listing question (a run with traps and a door); Module 11's results cards
  (`log-results`: a row may carry program data and the rooms' readings, on Module 12's machine,
  with its own verdict and a cut-off run in words); Module 9's datapath figure (on `machine-traps`
  it draws Module 12's controller, with READ to WRITE for a control-register job, and lists C0 to
  C4); Module 8's edge timeline and memory map (a user-mode column); Module 11's grader (the mode,
  traps, causes, waiting, the timer, a door that opens and closes at set instructions).
- **Built**: the trap timeline (`trap-timeline`), a recorded run of the instruction-level model
  edge by edge with each edge's transfers; `trap-timeline.ts` in the model; Module 12's machine of
  several edges (`traps.ts`, library id `machine-traps`) and its comparison with the model
  (`traps-run.ts`).
- **Extractable**: nothing yet. The platform's rule of two asks for a second course; every new
  piece here is the course's own machine.

## Edits to files on `main`

- 23:45 `docs/machine.md`, the datapath's list: the control registers are all written by
  `Cc <= Rm` (it named only C4).
- 02:03 `docs/machine.md`, "Traps and interrupts", the interrupt bullet: the three decisions
  below, which the plan said go into it with the module.

## Decisions taken while building

- **Interrupts on the machine of several edges** (into `docs/machine.md`): taken at the edge that
  would fetch, a fetch's own cause winning there; a trap's edge does not count the timer; the door
  seen at every edge that ends an instruction or traps.
- **"Job", not "service"**, on every page and in every listing's comments: "the jobs the handler
  offers". `docs/isa.md`'s four are kept, numbered 1 to 4.
- **Job 5, "wait R2 rounds", is lesson 6's own**: the long job its question needs. Neither the
  capstone nor `docs/isa.md` has it.
- **Lesson 3's construction** judges `R3 <= word[timer]`, not a byte load: no lesson before it
  uses `byte[...]`.
- **The capstone's contract**: a table `programs` (how many, then each address) the tests add;
  the program running kept at `0x480`; a record per program at `0x400 + 8k`, 0 for job 4 or the
  cause; job 2 gives 0 for a room that is not 0 or 1. Six runs, each reaching a case a handler
  must survive. One challenge, three ways in, as Module 11's.
- **Lesson 7's timing diagram** keeps Module 8's limit of 12 edges: its program sets C4 and
  traps inside 12.
- **The debugger on a phone**: control registers one to a row, values broken only between words;
  the timer and the door two to a row, the door's time chosen in their panel.

## Terms and exemptions

As planned: **trap** and **handler** (lesson 1), **user mode** and **system mode** (lesson 3),
**system call** (lesson 4), **interrupt** (lesson 5). No exemption: the term gate passes every
lesson as it stands. The words for how a run ends are the plan's, written into the shared fact
sheet every brief carried (`briefs/00-module.md`).

## Second pass

Each lesson read start to finish after its words were placed. Cut: the same argument made twice
(a table of handler addresses, lesson 1; the case for absolute stores, lesson 2; the trap's edge
and system mode, lesson 3; interrupts off at a trap, lesson 5; "a handler must not fault", lesson
6; the return point's definition, lesson 4), and a construction's prose that gave its answer away
(lesson 1, cause `33`). Mended: "three places" for the trap's parts, which are in two blocks
(lesson 7); "the debugger" for the results cards (lesson 8); "a program clears it" for the handler
(lesson 6); a caption that placed a panel by position (lesson 1). Found: lesson 2's construction
named four handlers its page did not show; they now follow its task. Each lesson's interactive
shows the mechanism its prose claims: the figures' numbers are the facts tests'.

## The mechanical walk

The built site, every Module 12 page at 375 and 1280 pixels, light and dark, with every run
button pressed: no console error, no page wider than the screen, no control without a name, no
`[draft]` text. By eye: the trap timeline at a phone's width; the results cards in the dark theme;
the debugger's panels at both widths, where the control registers broke `01` and `024` across
lines and, on a phone, the panel of the timer and the door ended below the screen (both mended,
above). Module 12's browser spec drives the rest at both widths (`tests/educational/module12.spec.ts`,
58 tests): every challenge completed with its reference, a wrong handler rejected for each,
saved work graded on load, the debugger's buttons, its line and its panel on one screen as a run
moves, results only after a run, the timeline stepped, the door's time chosen, the capstone's
starts.

## The full check

- **02:03 to 02:38, on `a9311a5`**: formatting, copyright, the platform copy, types and the build
  passed; Vitest 128 files, 1324 tests passed; the browser 858 passed, 56 skipped, 14 failed. Ten
  of the 14 are the stored screenshots that fail in a build container on `main` too (aesthetics,
  4 at desktop and 6 at phone width). The other four were Module 12's, the diagram test at both
  widths, on lesson 7: the value written beside the HALT pin touched the FETCHED and MQ wires on
  the machine's drawing, and on Module 12's controller the label for READ to WRITE overlapped ALU
  to WRITE's. Mended: the HALT pin one cell left, its wire's turn half a cell left, and the label
  moved clear; the diagram test then passed at both widths (22 tests).
- **The second run, 02:47 to 03:19, on `9f051fb`**: everything before the browser passed (Vitest
  128 files, 1324 tests); the browser 862 passed, 56 skipped, 10 failed, the ten stored screenshots
  that fail in a build container on `main` too. Every other test passes.

## What to change

- **The reading half of the review has not been done.** CLAUDE.md asks for each lesson to go to
  its own reviewer, every finding attacked by a sceptic. This session did the mechanical half and
  the author's second pass; the reviewers' half is for the checkpoint.
- **An unknown word in the timeline.** Lessons 4 to 6's handlers save R8 and R9, which the user
  programs never set, so the timeline shows `word[400] ← X`. No page says why; a sentence, or a
  handler start that sets them, would.
- **Module 11's halt for cause `41`** still says "which Module 12 builds". No Module 12 page
  halts there (every one sets C4), but the string should say what it means on both modules.
- **On a phone, lesson 5's debugger** keeps its readings on the screen, not the door's choice
  beneath them, which is used before a run; the browser test checks the readings.
- **The edge timeline's limit of 12 edges** shaped lesson 7's program; a `from` like the trap
  timeline's would let it show the night program's trap at edge 24.

