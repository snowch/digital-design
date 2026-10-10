# Lesson 4's own facts: lesson `final-machine` (Module 13, lesson 4), the lab

Read with `00-module.md`. Briefs 4A to 4C and 4L use these facts.

## What the lab is

- The learner writes the top module, `machine`, of the whole machine in the course's SystemVerilog,
  the subset Modules 8 to 10 used. No new construct is needed.
- The course supplies nine parts as modules the text places by name: `memory` (the ROM, the RAM
  and the devices, with user mode's refusal, the timer and the waiting events), `decoder` (Module
  10's capstone's, which knows kind 9 and kind A), `system` (the system jobs, Module 12),
  `controller` (Module 12's), `traplogic` (Module 12's trap logic), `cregs` (the control
  registers C0 to C4), `registers` (the register file), `alu` (Module 7's) and `condition` (the
  branch condition, MET). Each passes the tests the learner's own part passed in its module.
- The learner's text joins these parts and writes the small parts between them: the PC, the
  address the memory reads, the IR, the held words HA, HB, HR and HM, the constant made a word
  (WIDE), the ALU's two inputs, the word register Y takes, the target of a branch and the next PC.
- The machine's ports are given and stay as they are: inputs CLK, RST, DOOR, WARM, SENSORA and
  SENSORB; outputs PC, S (the controller's state), HALT, CAUSE, DISPLAY and LAMPS.
- **One challenge with three ways in, each a button above the text:**
  - "Start from the outline": the course's own text with six joins left out. Each is marked with
    a comment beginning `JOIN:`, and holds a constant or nothing in place of the join. This is
    where the lab starts.
  - "Start from the parts": every part placed, with all its ports listed and none joined, and the
    wires declared. You join every port and write every small part between them.
  - "Start from nothing": the machine's ports alone.
  - Changing to another start replaces your text; if you have changed it, the page asks first.
- **The tests.** Five programs run on your machine and on the instruction-level model, from the
  reset. After every instruction and every trap the two are compared: the PC, the sixteen
  registers, the control registers, the display, the lamps, the timer, "waiting", and whether
  each has stopped or halted. A test fails at the first instruction or trap after which they
  disagree. Its sentence names that line, its address, what differs, and the value on your
  machine and by the model. It never names the join.
- A failed test's sentence has these forms:
  - "After `{line}` at `{address}`, {what} is {value} on your machine and {value} by the model."
  - "At `{line}` at `{address}`, your machine halts with cause `{cause}`; the model does not."
  - "At `{line}` at `{address}`, the model stops or halts; your machine goes on."

## The five programs (the tests, and the figures' programs)

Each is short, written for this lesson. Their names, as the page labels them:

1. **The shop's program**: the module's program (see `00-module.md`). It runs a set if (kind A), a
   call through a register (kind 9), a system call and `resume`. 69 edges.
2. **A fault in user mode**: the program sets a handler, drops to user mode with `resume`, and
   reads room A's sensor. User mode refuses a device's address: the read traps with cause `32`.
   The handler shows the cause on the display and stops. 36 edges.
3. **A system call, then the timer**: the program sets a handler and the timer to 4, turns
   interrupts on in system mode (C0 takes 3), and makes a system call (cause `41`). The handler
   resumes after a system call. The program counts on; the timer reaches 0 and interrupts it
   (cause `81`); the handler shows that cause and stops. 53 edges.
4. **The door**: the program sets a handler, turns interrupts on, and counts. The door opens
   while its sixth instruction runs; the program is interrupted before its seventh (cause `82`);
   the handler shows the cause and stops. 31 edges.
5. **A store to the ROM**: with no handler set, the program stores to address `010`, in the ROM.
   The store traps with cause `34`, and with no handler the machine halts. 7 edges.

## The changed texts the figures run

A figure, `lab-run`, runs a text on a program you choose and compares it with the model. Its
controls: a list "Which text runs", a list "Which program runs", and a button "Run it". Under the
lists it shows the line a text changes, headed "The line this text changes". Each run adds a line
to a list headed "The runs so far": the text, the program, and the result. A result shows only
after its run. Every text is the course's own text with one line changed, never one of the six
`JOIN` lines. The figure never shows the course's line that a change replaces.

The results, each checked by running it:

- **The course's own text**: all five programs agree with the model after every instruction and
  trap.
- **"The timer counts a trap's edge"**, line `assign TICK = PCEN;`. TICK tells the memory's timer
  to count down by one. The course's TICK is 1 at an edge where an instruction finishes and the
  edge does not trap. PCEN, the PC's enable, is 1 at an edge where an instruction finishes, and
  also at an edge that traps, where the PC takes the handler's address from C4. GO, from the trap
  logic, is 1 at an edge that does not trap and 0 at one that does. A trap's edge finishes no
  instruction, so the timer must not count it (Module 12's rule).
  - The shop's program agrees.
  - "A system call, then the timer": "After `call system` at `018`, the timer is 1 on the machine
    and 2 by the model." The program sets the timer to 4; `R1 <= 3` and `C0 <= R1` finish, so it
    is 2; `call system` traps, and the changed text counts that edge too.
- **"Every branch taken"**, line `if (BRANCH | CALL) NEXT = TARGET;`. A branch goes to its target
  only when its condition, MET, holds.
  - Only the timer program differs: "After `if R5 == R6 goto back` at `038`, the PC is 044 on the
    machine and 03C by the model." The other four programs have no branch, so they agree.
- **"Interrupts on in system mode"**, line `assign IE = STATUS[1];` changed to
  `assign IE = STATUS[0];`. The text shows only `assign IE = STATUS[0];`. IE says interrupts are
  on: C0's bit 1. C0's bit 0 is 1 in system mode. A trap sets C0 to `01`: system mode, interrupts
  off. With the change, interrupts are on inside the handler.
  - The timer program: "After `if R5 == R6 goto back` at `038`, the PC is 030 on the machine and
    044 by the model."
  - The door program: "At `R5 <= C3` at `020`, the machine halts with cause `82`; the model does
    not halt." The door's event is still waiting when the handler starts; with interrupts on, the
    handler's first instruction traps again, at the address C4 holds, and Module 12's rule halts a
    trap there.
  - The other three programs agree.
- **"A call keeps the PC"**, line `if (CALL) YIN = PC;`. A call writes the PC plus 4 into the
  register Y names, so the program can return.
  - Only the shop's program differs: "After `call R6, R15` at `02C`, R15 is 44 on the machine and
    48 by the model." The other four programs make no call.
- **"DOOR held at 0"**, the memory's DOOR port given `1'b0` instead of the machine's DOOR input.
  - Four programs agree: none of them opens the door.
  - The door program: "After `R2 <= R2 + 1` at `014`, "waiting" is 00 on the machine and 10 by
    the model." "Waiting" bit 1 is the door's event; the model has it, the machine does not.
