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
   and with which cause, out: the lower number wins, as Module 8's causes did), and the controller's
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
  reset the machine is in system mode with no handler, so an instruction that faults with C4 at 0
  halts the machine with its cause,
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
the machine *goes to the handler*; the handler *resumes* the program. With no handler there is no
trap: an instruction that faults halts the machine, as in Module 8, and the pages say so (review
A10).

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

## The reading review (8 October)

The managing session's reading review of a9311a5: 87 findings, 7 blocking, each upheld or narrowed
by an independent sceptic. Below, each finding and what was done. No challenge's answer is stated.
The code came first (commits 6073304, 5c50219), then a fact brief per lesson to the drafting
subagent (`briefs/R1.md` to `R9.md`, `V3.md`; the shared fact sheet gained a section, "Decisions
after the reading review"), then the second pass. Every fix of fact or form to a draft is in
`drafts/R-fixes.md`. Every shortcut the review found is pinned in its lesson's facts test as a
wrong attempt that fails, beside the starting text.

### Part A

- **A1, tests that fail the shortcuts.** The program grader gained `stopAt` (where a run stopped:
  the name the tests' program gives its line, or `handler` for any line before the tests' own),
  `C2at` (C2 by the name of its line, since the program's addresses move with the learner's
  lines), `causes` (capped at eight in a failure's words) and C0 to C4 in the pages' forms. The
  tests' programs set R0 to R15 to words of their own except the call's own registers, and copy
  R8 and R9 into R12 and R13 before the run's last call, which ends it in the handler; every test
  checks them. The figures' user programs that show a save set R8 and R9 (12.4's and 12.6's), and
  their numbers were recomputed and re-pinned.
- **A2, no challenge's lines on the page.** 12.3's, 12.5's, 12.6's and 12.8's challenges changed
  so that no figure lists their lines (below). Four "smaller example" hints that were part of
  their answers were redrafted (brief R9).
- **A3, Module 12's run words.** Module 12 has its own `stops.stop`, `stops.cutOff`, `stopsAt`,
  `failedLeft`, the editor's heading and each challenge's sentence for how a run must end
  (`ends.*`); Module 11's stay on Module 11's pages. The datapath figure says "Halted:" for a cause
  and "Stopped:" only for `stop`, on every module. The reset lines are "the start".
- **A4, numbers.** An address shows three hexadecimal digits at every value; C0, C1 and "waiting"
  are two bits everywhere, the grader's feedback included; a word holding a cause shows its
  hexadecimal beside it, and 12.1 says once why cause `34` reads 52. Prose writes `400`; a task
  gives `word[0x400]`. Feedback writes "{name}: {value}", and an empty value reads "nothing".
  Module 11's note narrowed to match.
- **A5, the run button.** It reads "Run to a breakpoint" only while a pause lies ahead, else "Run
  to the end"; every Module 12 lead was checked against it. Module 11's leads name "Run to a
  breakpoint" only for presses that pause; their last press, which now reads "Run to the end",
  they leave unnamed, and they stand.
- **A6, results that describe the run made.** 12.6's result gives each door choice's numbers;
  12.7's investigation shows its result when the run stops (`outcomesWhen`).
- **A7, what the tests check, on show.** The challenges' debuggers of 12.1, 12.2, 12.3, 12.6 and
  12.8 show the words the tests read; 12.2's, 12.4's and 12.5's show every register; 12.8's has a
  watch.
- **A8, objectives.** Backticks dropped, with a content test (done before this review's commits).
- **A9, the registers a system call may change.** R1 and R2. Stated in 12.4 beside the comparison
  with a function call, with the reason checked against the handler (it saves at its start,
  before it reads C3, because the same handler takes faults); 12.6 and 12.8 cite it; the tests
  check every other register.
- **A10, a trap goes to the handler.** 12.1's explanation and this note no longer call a halt a
  trap.
- **A11, one word, one meaning.** "Save" and "put back" for the RAM, "keep" for the calling
  convention, "a function call" in full, "job" only for a system call's service.
- **A12, predictions.** 12.2, 12.3, 12.5, 12.7 and 12.8's predictions no longer follow from what
  is above them (below).
- **A13, originality.** 12.1's note names SPIM's default MIPS handler and says what is this
  course's own.

### 12.1 `traps`

1. The task names its checks; the failure ends with the lesson's own sentence on how a run ends.
2. Tests 1 and 2 check C2 by its line's name; the `goto` shortcut fails (pinned).
3. "A register like any other" gone: a control register is only copied to or from an R register.
   The assembler's new refusal says so for a job, a load, a store or a branch, and `docs/isa.md`
   lists it.
4. A10 applied; the motivation's first lines no longer read wrongly at first; "every module
   before this one" narrowed to Modules 8 to 11.
5. The explanation's debugger shows the word at `400`; its lead's steps are things to do; 52 is
   explained where it first appears, in the investigation.
6. The investigation says each edge is one instruction or one trap; the note on hardware says what
   a real machine does instead.
7. Cuts made; "mend" is given its case: the night program's store cannot be mended, and why.
8. The fourth hint points to where the causes are listed (the schema allows five hints, so it
   joins "Part of the answer").
9. "A night program for the shop"; the tests no longer use `signals`; the code comment fixed. The
   first caption's "handler" left: the objectives above it use the term.
10. A8 and A4. 11. A13.
Also 12.4's: the generalisation's sentence on lesson 4's return point cut.

### 12.2 `saving-state`

1. Blocking. Every register checked, R0 to R15; the task, the failure and the originality note
   say so; the four shortcuts fail (pinned).
2. The motivation says which registers and that C2's new word is the skip.
3. The timeline starts at the edge before the trap; its lead points at what only the timeline
   shows.
4. The prediction no longer states the save's line; the explanation carries the case for absolute
   stores again.
5. The repeats cut. 6. The calling convention's set given whole, R0 to R9.
7. The choice quoted in `saveChoice`; the placement half is the platform's.
8. A8, A4; the timeline's values carry the hidden "hexadecimal".

### 12.3 `user-mode`

1. The opening figure is stepped, so ALARM's going off is seen.
2. "The start" named and used; "the handler" is only C4's code.
3. Accepted as the review called it: the C0 route and a start that leaves C1 at reset pass. The
   objective is the skill; the challenge is new (the start, and a handler that counts and skips
   one cause and saves any other), not listed by any figure; hint 3 is smaller and no part of it.
   `goto program` fails (pinned).
4. Causes shown with their hexadecimal; the challenge's own sentence on how a run ends, which
   names C2.
5. The explanation agrees with the failure experiment; the RAM and C0 points made once; "its
   devices' addresses".
6. "Every program so far" corrected; the devices are `7C0` to `7F7` (pinned: `7F0` gives `32`,
   `7F8` gives `31`); no mode in the question.
7. The prediction is now a start that writes C1 but goes to the program with `goto`, so C1 differs
   across the trap; "are written".
8. The map's lead points at the motivation's list. 9. A3; "in words" reworded. 10. A8.

### 12.4 `system-calls`

1. Each run's causes and where it stopped are checked; the fault-line shortcut fails (pinned).
2. R0 and R3 to R15 checked across job 2; the own-`resume` and scratch shortcuts fail (pinned);
   Try it shows every register; the reason for saving stated with A9.
3. A3. 4. New construction questions to work out (a lamps word, what a program of two job 2s
   shows, C2 after a call); NIGHT's bit in the table of jobs; the wrong-answer sentences point at
   the answer's source.
5. The stepping moved to the first pause. 6. Cuts made. 7. "A function call". 8. A1.

### 12.5 `interrupts`

1. The timer challenge asks for a rule no figure lists (ALARM lit beside the NIGHT the start
   lit). Pasting the figures' timer part fails (pinned).
2. The motivation no longer gives the return point. 3. "Waiting" explained where it first
   appears, with when the bit is set (pinned); brief 5A's lag corrected.
4. `resume` described as lesson 1 did; the edge after each `resume` traps again; the failure
   figure's handler keeps the right one's length, and its traps re-pinned (384).
5. The tests have programs of their own whose registers are checked, and a warm night; the four
   shortcuts fail (pinned). The figures' program left as it was.
6. C0 and "waiting" as two bits, bit 1 first. 7. The lead names C2 at the first pause with the
   door at 5. 8. A3. 9. A4.

### 12.6 `nesting`

1. Blocking. The construction gives C1 and C0 as two bits; another notation of the right value
   gets the form's sentence (`bitsForm`); brief 6B corrected.
2. Blocking. The result gives each door choice's numbers; the memory word explained.
3. Blocking. C1 checked at the end of every run; the shortcut that puts back C2 alone fails
   (pinned). Writing C1 and C2 back with interrupts still on is not caught by any fixed door time,
   and is left, as the review allowed.
4. The challenge's job is a job of its own, job 6, a countdown; no figure lists it.
5. The question's figure pauses at the door's part. 6. The repeat removed at the motivation's
   end; the fault separated from letting interrupts in; the waiting bit cited.
7. The four lines named without "last". 8. The construction's listing leaves out the words and
   the notes; a listing's explanation sits beside its verdict (Module 11's too).
9. A11. 10. A8. 11. A4. 12. Try it's door follows the chosen run.

### 12.7 `trap-hardware`

1. Blocking. The lower number wins, said with why only one pair can meet; the note, brief 7C and
   `traps.ts` corrected; the clash with the note on hardware gone.
2. Each drawing has a `focus`, and the motivation names the block to press for each part. The
   first diagram has C0, C1 and C3 lanes. A drawing still opens closed; opening one from a page is
   a platform change, noted below.
3. The prediction asks for the controller's state after a `call system` traps at READ, which no
   figure above shows.
4. The state diagram marks a trap's move (a dashed box at FETCH, a sentence under it) and a move
   GO holds back (the same at the held state); the "CALL 1" arrow is said to be `call`'s.
5. The result shows when the run stops. 6. TRAP, GO and the control registers sit beside the
   buttons. 7. IE glossed; NOHANDLER too. 8. `returnPoint` explained.
9. The construction asks about four traps the page does not count; "the handler's `resume`";
   hint 3 smaller and no part of it.
10. Left: see the walk. 11. A11, A3. 12. The repeat cut. 13. A8; "no device changes" narrowed to
   what holds; the NOHANDLER chip: see the walk.

### 12.8 `system-call-mechanism`

1. Blocking. No figure lists or runs the challenge's lines: the prediction and the investigation
   use a one-program handler of their own; the question's and the failure's figures show results
   only.
2. Blocking. The construction's steps rewritten from the new outline; each step's stated result
   pinned.
3. The prediction asks about a record no card states. 4. A run whose programs depend on their own
   R8, R9 and R12 across jobs; C1 checked; the three shortcuts fail (pinned).
5. The ways in named as the buttons name them; the outline leaves the start and the end of a
   program, the module's mechanism.
6. Limited to what user mode refuses. 7. The objective says what the word at `480` gains, and the
   motivation that the RAM is not protected.
8. The record is the cause itself, read as a word; said after the prediction.
9. The capstone's own sentence on how a run must end; `stopAt` checked. 10. The challenge's
   debugger shows the records, the number and a watch.
11. A5. 12. The outline is introduced before it is named; runs numbered on the cards and in the
   prose; run 2's fault and `ended` said.
13. Cuts made. 14. A9. 15. The empty program's comment rewritten. 16. A8.

## The second reading (8 October)

The managing session's second reading of b6e3c8a: eleven findings across the module (B1 to B11)
and items for each lesson. Below, each item and what was done; no challenge's answer is stated.
The code came first (f9653d6, 4ea6743, d5c53bf), then the lessons' data and their pins (aa1dd77),
then a fact brief per lesson to the drafting subagent (`briefs/W1.md` to `W8.md`, `V4.md`; the
shared fact sheet gained "Decisions after the second reading"), then the second pass. Every fix of
fact or form to a draft is in `drafts/W-fixes.md`. A note above that the tests' programs copy R8
and R9 into R12 and R13 (A1) no longer holds: B1 replaced that copy.

### Across the module

- **B1, registers really checked.** A trap's record now keeps the registers as they were at that
  trap, and the grader reads them as `R<k>@trap`. Every test program of 12.2 to 12.6 and 12.8's
  run 6 gives each register it does not pass to a call a word of its own, a different set in each
  test, and the tests read them at the last trap the program reaches (or at its own `end`, in
  12.2). 12.2's test 2 changes R5 and R6 between its traps; 12.5's program stores R1 at `500`
  after the interrupts. Each task lists what is set and what is read. Every attempt the readers
  found is pinned in its lesson's facts test as a wrong attempt that fails.
- **B2, line names the tests' lines share.** The program editor compares the learner's names with
  each test's before assembling, and a clash fails that test with its own sentence naming the line
  and the test (`nameShared`). The tests' own lines took names a learner is unlikely to choose
  (12.5's `testLoop`, 12.8's `run1first` and so on); 12.1's task names `program`, `end` and
  `after` and says which tests have `end` and `after`. Pinned in 12.5's facts test.
- **B3, where a failed run stopped.** Every failed Module 12 run says first how it ended (the
  stop's address, the halt and its cause, or the cut-off), then names a fault at one of the
  learner's own lines with its address and cause (`ownFault`), then what it left, then the
  task's sentence. 12.3's sentence on how a run must end no longer gives advice that fits only
  some runs.
- **B4, long lists.** A list in a failure's words shows its first eight items and an ellipsis.
- **B5, Module 12's words for shared strings.** The tests' lines' heading, the listing's caption
  and the assembler's sentence have Module 12 forms; Module 11's stay on Module 11's pages. The
  starting texts of 12.5 and 12.6 say "the start and the handler". A word from 10 to `7FF` in a
  failure's text names its hexadecimal in words, since a failure is read as text.
- **B6, results after the run.** 12.7's fault results show once the run has ended, and clear on a
  new start or choice. 12.6's result after the explanation's figure says only what holds for every
  door time and sends the reader to the status line for the rest.
- **B7, words.** The fact sheet now rules "save" and "put back" for registers, "store" for a count
  or a cause, "keep" for a register left as it was, "job" for a system call's service only, "the
  start" apart from "the handler", and "traps" for going to the handler only. Every use the
  reading quoted was changed, and the programs' comments with them.
- **B8, the note's own claims.** 12.6's facts test now grades three wrong attempts beside the starting text; brief 7C and
  the trap logic's comment in `traps.ts` say the lower number wins; 12.8's empty program's comment
  says what R2 does for each room and any other. Every door time a figure offers is pinned,
  12.6's 30, 5 and never among them.
- **B9, hints.** 12.5's smaller example and 12.1's and 12.8's are now cases no task asks and no
  answer contains; 12.1's long hint is split. A slip in this round's brief (12.1's hint indices)
  overwrote the whole answer and a part of the answer; both were put back in the second pass.
- **B10, the way into user mode.** "Only through `resume`" became "the way these pages enter user
  mode": `resume` changes the mode and the PC at one edge.
- **B11, phones.** A challenge's debugger can put its registers first (12.2, 12.3, 12.4, 12.5's
  challenge, 12.6), so a failure that names a register sits beside the panel that shows it.
  12.7's figures show the controller's state beside their buttons.

- **B12, boxes the reader can open** (asked for during this round, at the author's request). A
  button, "Show every row" and then "Show fewer rows" (drafted, brief V5), opens the listing, a
  region of memory, the stack's frames and the trap timeline's edges to every row, with no scroll
  inside, and closes them again; it carries `aria-expanded` and is offered only where the box hides
  rows (memory and the stack only on a phone, where their boxes are short). The listing's
  machine-word column is now left out unless a debugger asks for it (`words`, which Module 11's
  assembly lesson does); a line with a comment still wraps on a phone, since no table on these
  pages may scroll sideways (the full check's legibility test said so when one did). Where the button sits was set by the one-screen test: under the box it pushed 12.1's
  control registers, 12.5's events and 11.2's memory below a phone's screen, so the listing's
  button sits in its header row, memory's in its header's empty cell, and the stack's beside its
  title; the listing's title is hidden on a phone (its caption stays for a screen reader). The
  compact listing on a phone is 9.5rem: two to four whole rows, two where each row has its
  40-pixel breakpoint button or a wrapped comment; any taller and the one-screen test fails on 11.2. No drag handle: the
  listing's maximum height would cap a drag at the compact size. The browser test opens 12.6's
  72-line listing at both widths, finds every row inside it with no scroll, closes it, steps, and
  finds the line about to run inside the compact box. Running the whole suite also found a hole
  this round made: 12.5's "closed in time" test started with ALARM lit, so a timer part that
  always lights ALARM passed; that test now starts with other lamps, and the attempt is pinned.
  The managing session's call on the rows (after the round): the one-screen test stays as it is.
  The button that opens the whole listing is what the author asked for, and a compact box of four
  one-line rows, or two where rows carry breakpoints, is the price of keeping the buttons, the
  line about to run and its values on one screen. No drag handle.

### The managing session's calls

- **12.3, C1 at reset.** A start that leaves C1 at reset's `00` passes; accepted.
- **12.1, C2 and `goto`.** A handler that jumps back through C2 with `goto` rather than `resume`
  passes, since this lesson's program runs in the mode the handler runs in. The limit is recorded
  here: the tests cannot tell the two apart until lesson 3's user mode.
- **12.8's cards.** The question's cards show no record before the prediction; the failure
  experiment's cards show each fault record with its hexadecimal.

### Each lesson

- **12.1.** The task says which tests end at `end` and which C2 checks, and a test with cause
  `31` fails a handler that stops on two causes and skips the rest. C1 is asked as two bits. The
  investigation limits the hexadecimal beside a word to R registers and memory. The cut
  generalisation sentence and "this lesson" in the construction's feedback are done.
- **12.2.** No fixed word passes; the starting handler's second register is named in the task;
  the stack figure is told as a stack started in the wrong place; C3 is checked; the construction
  no longer repeats the task; the timeline's lead names every edge's transfers; the
  generalisation points back to the motivation; the investigation's steps read C2.
- **12.3.** Every register checked; B10 and B3; the investigation says the start lights ALARM
  before the program; hint 2 no longer contradicts the prediction; C1 "takes C0 again"; the RAM
  point said once; the device range is `7C0` to `7F7`.
- **12.4.** R12 and R13 checked with the rest, and the task lists the registers as they are; the
  generalisation keeps the comparison and the rule once; "reads C3 first" corrected; the
  construction's hint and task say where each answer comes from and that R5 survives a call; the
  quiz program's comments fit a phone.
- **12.5.** A lamps word of each test's own, some with ALARM already lit; R1 checked through the
  word at `500`; the OR and AND forms named in the task; the explanation's debugger shows the
  registers its prose names; the door at 5 explained; the question's panel says nothing of
  interrupts before the motivation names them. Item 7, "Run with" far from "Step" on a phone, is
  optional and left.
- **12.6.** The C2-only and job-5 attempts and a fixed status are pinned and fail; each test's
  status comes from a word of its own; the question's 172 against 167 explained; B4, B6; the form
  of C0 and C1 in feedback without backticks; the waiting paragraph moved; the generalisation
  names the interrupt; the last test renamed.
- **12.7.** The motivation names each block by the title it is drawn with; B11; B6; the
  originality note and B8; "control-register copy"; the prediction's dashed box tied to before the
  edge; `resume` named with the function call; the task's rule on causes agrees with the hint and
  says why the last row tests a pair the machine never gives; the controller's rule said once.
- **12.8.** Run 6 checks every register at its second program's last trap; B2, B3; cards as
  called; the question's repeated paragraph cut; the empty program's comment; the failure result
  names the program as its card does; "with interrupts off" in the run's sentence; the
  originality note and the file's header say two ways in; the motivation says the start is not
  part of the handler.
- **My own slip, recorded.** In the first reading's round (db12ddd) a registers list was taken off
  12.5's explanation debugger instead of off its challenge; it is back.

The platform items (the results list's accessible name, A8, opening a block from a figure's props)
are the managing session's.

## The figures pass (8 October)

At the author's question whether Modules 11 and 12 have enough pictures: they had five drawings
in forty figures, and the plan's "a system call crossing from a user program to the handler and
back" and "nesting: two traps, the second overwriting C1 and C2" had shipped as the text timeline.
On branch `figures-11-12`, the run is now drawn as lanes: one column for each part of the program
that runs, time running down (it fits a phone; across, a long run's labels would not), each move
an arrow labelled with what it writes, a band for the mode, the door and the timer marked where
their bits of "waiting" are set. It is a view of the trap timeline's own edges, stepped with them,
or of the debugger's run; a "Next move" button runs on to the next arrow.

- 12.1: the night program's trap and `resume`, above the investigation's timeline.
- 12.4: the start, the handler and the program, the three calls crossing in system mode and back.
- 12.5: the door marked between two instructions of the program, then its interrupt, then the
  timer's.
- 12.6: the handler's own load traps into a third lane, the handler again, C2 taking `048` while
  `07C` was the program's return point; and under the explanation's debugger, job 5's stores to
  `410` and `418` marked before the door's and the timer's interrupts come in to the handler
  again.
- 12.8: a figure of its own in the explanation, the reference handler on run 2's table, with
  `list: false`: the lanes and their arrows only, no lines, so the handler is not given away.

12.2 keeps its watch: the save at `408` and the putting back are two lines a watch shows plainly,
and a drawing of one word adds nothing to it. 12.3 and 12.7 are as they were. No drawing shows a
value before its step, and the leads are generic about what an arrow writes; the outcomes name the
values. Each run's moves are pinned in `content/lessons/drawings.facts.test.ts`.

A fault found on the way, now mended: the debugger figure's props schema dropped any key it did
not list, so two settings this module made never reached the page: 12.5's question figure's
`interruptWords: false` (second reading, item 6) and 11.1's `words: true` (B12). The schema now
lists every option the lessons give, and a probe found no other key dropped.

The full check on the pass (`0df0ad9`, with `main` at `a955c55` merged): formatting, copyright,
the platform copy, types and the build passed; Vitest 129 files, 1347 tests passed; the browser
866 passed, 56 skipped, 10 failed, the ten stored screenshots that fail in a build container on
`main` too. The log's exit line: `EXIT 1`, from those ten alone.

### The review of the figures pass (10 October)

Nine readers, each attacked by a sceptic: nothing blocking, 25 should fix and 34 minor, gathered
into G1 to G8. All are done; the briefs are `docs/notes/figures-11-12/briefs/Y1.md` to `Y3.md`.

- G1: the drawing sits beside the trap timeline's list where the figure is wide and above it, short,
  on a phone; the debugger's under its listing on a wide screen. Both follow their newest row, and
  the outcomes sit under the status line. The one-screen test now holds 12.4 at edge 40 and 12.5 at
  edge 47.
- G2 and G3: a lane's mode block starts at the move into it; the timer's mark comes after the bar
  of the edge at which its count reaches 0, the door's before the bar of the edge it arrives at,
  both pinned against the bars in `drawings.facts.test.ts`.
- G4: each move is said by its kind, marks are in the hidden list at their places, the hidden list
  waits for its first move, and `lanes.title` no longer calls the start and the handler parts of
  the program. The stop is marked where the run stops, in its lane.
- G5, G7, G8: the leads say the drawing starts with the start's run already made, name "Next move"
  among the steps (12.1 with its edges, 6, 12 and 15), introduce the mode's band in 12.4 and the
  interrupts' band in 12.5, and say the drawing is empty until the first press; the key names the
  dot.
- 12.1's failure experiment draws its endless loop: three crossings, each `resume` writing
  PC ← `014`, then a square where the drawing ends while the run goes on (`NO_SKIP_DRAWN`, 17
  edges; the debugger takes the run one edge past it, not to its cut-off).
- 12.6: the lane is named, not counted; `savedLead` says what each door choice shows, checked on
  the runs (at 5 the door opens in the start and job 5 is not interrupted; at 30 its interrupt
  waits for job 5's stores; never, none); the interrupts' band shows where job 5 lets them in.
- 12.8 steps by moves only, its status line says each move and the stop, and "the handler" names
  only the handler's lines: the stop after the last program is the start's, in the motivation, the
  explanation and the challenge.

The full check on the review's fixes (`ec6b4fb`, with `main` at `59b05ca` merged): formatting,
copyright, the platform copy, types and the build passed; Vitest 129 files, 1351 tests passed; the
browser 868 passed, 56 skipped, 10 failed, the ten stored screenshots that fail in a build
container on `main` too. The log's exit line: `EXIT 1`, from those ten alone.

### The second reading of the fixes (10 October, afternoon)

Four readers and their sceptics over the ten lessons; nothing blocking. Fixed, code first, then
brief Y4:

- H1: the interrupts band is hatched, in the drawing and its key; the lanes' bars are solid, so
  the handler's bars no longer read "interrupts are on".
- H2: the start's `resume` is a move of its own, "starts", since the program has not run.
- H3: a write to C0 inside a lane starts its band at its own step. With the door at 30, the
  "interrupts on" stretch now begins at job 5's `C0 <= R1`, before the door's arrow (pinned).
- 12.1: the cut is a zigzag across the lane, unlike the stop's square, with no dot after it; the
  outcome says only what the drawing adds; the one-screen test holds `no-skip`.
- 12.4 and 12.5: "Next move" is offered for the later calls; 12.5's and 12.6's leads say the
  program's first bar is drawn before the list starts (edges 8 to 15, and 8 to 11).
- 12.6: a lane the run never enters is not drawn, and the lead says so for 5 and never; each door
  choice's lanes and interrupts are pinned. On a phone, a debugger with no watch has its drawing
  after the control registers and the events, so C1 and C2 stay with the buttons; on a wide screen
  the listing above a drawing is 22rem and the drawing's box 9rem. The one-screen test holds the
  control registers, and the drawing's newest item at the wide width.
- 12.8: the whole text is "the runner"; "the handler" is the lines at C4's address. The tests now
  ask for the start's `stop` (`stopAt: "start"`: a learner's `stop` before the line `handler`), so
  the task, the figure, the tests and the feedback agree. The title and the question keep "the
  handler", which there means the job the lesson asks for.

The full check on both halves of the second reading (`32047fa`, with `main` at 9c637e9 merged):
formatting, copyright, the platform copy, types and the build passed; Vitest 129 files, 1353 tests
passed; the browser 868 passed, 56 skipped, 10 failed, the ten stored screenshots that fail in a
build container on `main` too. `EXIT 1`, from those ten alone.

### The third reading (10 October, evening)

Blocking, and mended first: the second reading's stop check counted a `stop` above the line
`handler` as the start's in every lesson, so 12.1, 12.4, 12.5 and 12.6 failed correct handlers
whose stops sat there, and 12.8 failed a runner whose first handler line had another name. The
check `stopAt` is the old rule again: any `stop` of the learner's own is the handler's. 12.8 alone
asks a second check, `stopIn`, which reads the start's lines as those above the line `handler`;
its task, its outline and its empty program say so, and its feedback names the reason when it
fails (no line is named `handler`, or the stop comes at or after it). `stop-check.test.ts` pins
the five lessons' results for these attempts. Also: 12.8 says the runner is the handler its
question asks for, and its starting texts and an objective use the page's names; 12.1 and 12.6 say
where their drawings sit on a phone; 12.5 and 12.6 say what a bar is; the interrupts band has no
outline, which crossed it at every row.

The full check on the third reading (`979943c`): formatting, copyright, the platform copy, types
and the build passed; Vitest 130 files, 1358 tests passed; the browser 868 passed, 56 skipped, 12
failed: the ten stored screenshots that fail in a build container on `main` too, and Module 10's
layouts test at both widths, which chose the load by its place among the instructions, a place
that moved when the prediction's own instruction was held back. It now chooses it by name, and
`module10.spec.ts` passes whole (78).

The fourth reading (brief Y8). 12.8's feedback said where the run stopped, then the address again,
and told every learner whose run ended at a handler's `stop` to move the start's above `handler`,
when most had it there already (the outline with `finish:` and `ended:` still stopping, or job 4
running `stop`). The run now says once which stop ended it; the test's value `stopIn` is "below"
only when no `stop` of the learner's sits above `handler`, and only then does the feedback say to
move the start's. `stop-check.test.ts` covers 12.3 as well, with a change to each reference that
keeps its meaning (every `stop` a jump to one `stop` above `handler:`), and checks the step-1 case.
The empty start's comment no longer leaves "the lamps from R2;" on a line of its own, and the
reflection says a runner, not a handler, is over the programs.

The full check on the fourth reading (`88c26a6`, with `main` at `c5b2acb` merged): formatting,
copyright, the platform copy, types and the build passed; Vitest 143 files, 1485 tests passed; the
browser 917 passed, 62 skipped, 11 failed, all stored screenshots: the ten that fail in this
container, and desktop "state machines", whose timing diagram the timing work changed. None is
updated here; the managing session compares them in its own container.

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

After the reading review (walked on the built site, desktop and phone): 12.7's prediction shows
the dashed FETCH and its sentence under the state diagram, with the control registers and TRAP and
GO beside the buttons, no console error at either width. On a phone the controller's diagram is
still 291 pixels wide in a box of 252; rather than squeeze every state diagram in the course, its
box now shows a shadow at an edge while more of the drawing lies past it (review 12.7 item 10).
NOHANDLER's chip in the trap logic's failure rows broke as "NOHA / NDLER" at 1280 pixels; a chip
now moves to the next line whole, and only one wider than the line breaks inside (item 13).
Opening a block from a figure's props (12.7 item 2, the half `focus` cannot do) is a platform
change, left for the managing session with the review's other two.

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
- **The third run, after the reading review, on `5502052`**: formatting, copyright, the platform
  copy, types and the build passed; Vitest 128 files, 1335 tests passed; the browser 856 passed,
  56 skipped, 16 failed. Ten are the same stored screenshots (4 at desktop, 6 at phone). The other
  six, three tests at both widths, followed this review's own changes: Modules 8 and 9's datapath
  tests expected "Stopped:" for a halt, which A3 made "Halted:"; and the long-debugger test still
  listed 12.8's investigation, now an 11-instruction program the test's twelve steps run past.
  The two expectations updated and the entry dropped; those six then passed (12 tests run).

- **The fourth run, after the second reading and B12, on `2009f83`** (with `main` at `a889d56`
  merged): formatting, copyright, the platform copy, types and the build passed; Vitest 128 files,
  1338 tests passed; the browser 863 passed, 56 skipped, 11 failed. Ten are the stored
  screenshots that fail in a build container on `main` too. The eleventh was B12's: on a phone
  the listing's rows kept to one line and its table scrolled sideways, which the legibility test
  forbids. That rule was taken out; the legibility test (both widths) and Modules 11's and 12's
  browser specs (132 tests) then passed.

## What to change

- **Three platform changes the review left to the managing session**: inline code in objectives
  (A8), a choice placed beside the figure it asks about (12.2 item 7), and a figure that opens a
  block of its drawing from its props (12.7 item 2).
- **Module 11's halt for cause `41`** still says "which Module 12 builds". No Module 12 page
  halts there (every one sets C4), but the string should say what it means on both modules.
- **On a phone, lesson 5's debugger** keeps its readings on the screen, not the door's choice
  beneath them, which is used before a run; the browser test checks the readings.
- **The edge timeline's limit of 12 edges** shaped lesson 7's program; a `from` like the trap
  timeline's would let it show the night program's trap at edge 24.

