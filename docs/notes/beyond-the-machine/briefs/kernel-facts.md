# The kernel chapter: the fact sheet

Shared by briefs L1 to L4. Every fact here was checked by running the programs on the course's
model (`MODULE_12`, the debugger's runs; `content/lessons/beyond.ts` holds the programs). Use only
these facts. Where a sentence seems to need a fact you were not given, write a note in square
brackets instead of inventing it. Read `docs/style.md` first: it applies to every sentence.

## The course and the reader

*Digital Design: From Bits to a Working Computer* is an interactive course in the browser. Its
reader has built a whole working machine from gates, Modules 0 to 13, and written programs for it.
This is an optional chapter after Module 13, one lesson, under the heading "Beyond the machine".
The reader builds no kernel: it is given whole. They watch it work, and in the challenge set up a
second program for it.

The course's story: a shop with two freezer rooms, room A and room B, each with a sensor; an office
with a display and three lamps, ALARM, NIGHT and CLASH. Readings are in tenths of a degree. With
the shop's readings, room A at -184 and room B at -250, the gap is 66.

## Voice

British English. Direct, plain, active voice, short sentences. The reader is "you". No marketing
tone, no filler, no "in this lesson we will", no rhetorical questions, no exclamation marks, no em
dashes or en dashes used as dashes. Counts the model produced as digits (66, 5,000, 60); small
everyday counts may be words ("two programs", "one machine"). Code, register names, addresses and
lines of a program in backticks: `R2 <= R5 - R1`, `588`. Markdown: paragraphs, lists, **bold** for a
term the first time it is defined.

## What the reader already knows (earlier lessons)

- Lesson 12.1: a trap. The machine stops the program, records where in C2 (the return point) and
  why in C3 (the cause), and goes to the handler, whose address is in C4. `resume` goes back to the
  address in C2.
- 12.2: a handler saves every register it uses with stores to fixed addresses, and puts them back
  before `resume`. It does not trust the program's stack.
- 12.3: user mode. In user mode a program cannot reach the devices or the control registers; a
  store to the display traps with cause `32`. The RAM is not protected: a user program can write
  any word of it. C1 holds the mode and whether interrupts are on, as two bits: bit 1 "interrupts
  on", bit 0 "system mode". The value 2, written `10`, is user mode with interrupts on.
- 12.4: `call system` traps with cause `41`; its return point is the line after it. The handler
  does the job R1 names: 1 shows R2 on the display; 2 puts room R2's reading in R1 (0 for room A,
  1 for room B); 3 sets the lamps from R2; 4 ends the program. A job may change only R1 and R2.
- 12.5: the timer. It counts instructions: its count goes down by one each time an instruction
  finishes, while the count is not 0. When it reaches 0 it sets its bit in "waiting", and if
  interrupts are on the machine takes an interrupt, cause `81`, between two instructions: the
  instruction not yet run is the return point. The handler clears the timer's bit of "waiting". A
  write to the timer gives it a new count.
- 12.6: interrupts are off while the handler runs.
- 12.8: the runner, a start and a handler. The start runs each program in a table, one after
  another, in user mode with interrupts off; the handler offers jobs 1 to 4 and, when a program
  ends or faults, writes a record for it (0 for job 4, else its cause) and starts the next. 12.8's
  generalisation: "A runner that runs programs one after another, gives them jobs and ends them
  when they fault is the core of the program a real machine runs first, which runs all the
  others." It also says: "What it does not do here is share the machine between programs that run
  at the same time. With the timer's interrupt, a handler could switch away from one program and
  resume another. That is beyond this module."
- 11.3 and 11.4: the calling convention: a function's arguments come in R1 and R2; the stack grows
  down from `7C0`, through R14; a function keeps R10 to R13.
- 11.7: the day's report on a log of readings. Module 0: "A phone runs many programs at once and
  does several things at once, but each program's lines still take effect in their order."
- The debugger figure (Module 11 and 12): a program's listing, the registers, the control
  registers C0 to C4, the timer and "waiting", memory regions drawn as boxes, and the run drawn as
  lanes, one lane per stretch of lines (the start, the handler, each program), each move an arrow.
  Its buttons are "Step", "Step back", "Run to a breakpoint", "Run to the end" and "Reset". A line
  can carry a breakpoint, and "Run to a breakpoint" stops before it.

## The term this lesson introduces

- **kernel**: the program the machine runs first, in system mode: it alone reaches the devices and
  the control registers, and it starts, stops and switches the other programs. Here it is 12.8's
  start and handler, grown. It arrives in the motivation, after the question has shown 12.8's
  runner unable to start the report. Do not use the word before the motivation section.

## Words this page must not use

compiler, process, operating system, scheduler, schedule, context switch, time slice, slice, trap
frame, thread, task, multitasking, queue, fork, round-robin, priority, label (say "name"),
variable, "carries on unaware" (say "cannot tell it was stopped").

## Working words, one meaning each on this page

- **program**: a user program: the gap program or the report (or, in the challenge, the tests'
  programs). Never the kernel: say "the kernel".
- **switch**: the kernel's switch from one program to the other. No physical switch appears.
- **turn**: the stretch a program runs between two switches.
- **save** and **put back**: for registers and C1, C2 going into and out of a save area. **store**
  for one word written to the RAM.
- **save area**: the 20 words in the RAM the kernel keeps for one program.
- **count**: only the timer's count. The report's result is "how many readings are warm".
- **record**: as in 12.8, the word a program leaves when it ends: 0 for job 4, else its cause.
- **job**: only a system call's service.
- **the start**: the kernel's first lines, before the handler, as in Module 12.
- **the handler**: the kernel's lines at C4, which every trap and interrupt reaches.
- How a run ends: it stops (at the kernel's `stop`), or it is cut off (after 5,000 instructions).

## The two programs

Both are user programs that reach the devices only through `call system`.
- **The gap program**: room A's reading by job 2, kept in R5; room B's by job 2; `R2 <= R5 - R1`;
  shown by job 1; then again, for ever. 11 instructions. It never ends.
- **The report**: how many readings of 11.7's first log (-184, -190, -176, -181, -172, -188) are
  warmer than -180, kept at `640`, then ALARM by job 3 when any is, then job 4. It counts 2 and
  lights ALARM.

## 12.8's runner on the two

Run with a table of two, the gap program first and the report second, 12.8's runner shows the gap
94 times in 5,000 instructions, and the run is cut off. The report never starts and neither record
is written (both still X). The gap program never ends, and the runner starts the next program
only when one ends.

## The kernel

12.8's runner grown. Its words in the RAM:
- `400`, `408`: the program's R8 and R9, saved at the handler's first two lines.
- `480`: the address of the save area of the program that runs.
- `488`: the address of the save area of the program that waits, or 0 when none waits.
- `500` to `59F`: the gap program's save area: R0 to R15 at `500` to `578` (R14 at `570`), C1 at
  `580`, C2 at `588`, its record at `590`.
- `5A0` to `63F`: the report's save area, laid out the same: R0 at `5A0`, R13 at `608`, R14 at
  `610`, C1 at `620`, C2 at `628`, its record at `630`.

What it does:
- **The start** writes each program's first line into its C2 word and 2 (`10`: user mode,
  interrupts on) into its C1 word; puts `500` at `480` and `5A0` at `488`; sets the timer to 80;
  and goes to `load`.
- **The handler** saves R8 and R9 and reads C3. Cause `81` goes to `tick`. Cause `41` does job R1 as
  12.8's handler does: jobs 1 to 3 resume the program, job 4 ends it. Any other cause ends the
  program, its record being the cause.
- **`tick`** clears the timer's bit of "waiting" and writes 80 to the timer. If no program waits,
  it puts back R8 and R9 and resumes. Otherwise it saves R0 to R15 (R8 and R9 from `400` and
  `408`), C1 and C2 into the running program's save area through R9, which holds that area's
  address, and swaps the words at `480` and `488`.
- **`load`** puts back C1, C2 and R0 to R15 from the save area `480` names (R9 last) and runs
  `resume`, which goes to the address now in C2.
- **Job 4, or a fault**, stores the record in the running program's save area. If a program waits,
  it becomes the one that runs, `488` becomes 0, and the kernel goes to `load`. Otherwise `stop`.
- The kernel is 96 lines and its start 17.

What a program is to the machine between two instructions: its sixteen registers, C2 (where it
goes on) and C1 (its mode and whether interrupts are on). Everything else of it is in the ROM and
the RAM and stays put. So the switch saves those eighteen words and puts eighteen others back. The
kernel saves into its own words, never onto the program's stack (12.2), and saves every register,
because an interrupt may change none (12.5). A system call goes back to the program that asked; the
timer's interrupt may go back into the other program.

## The run with a count of 80, the shop's readings

- Both programs get on: the report counts 2 at `640`, lights ALARM and ends with record 0, while
  the gap program shows 66 again and again. In 5,000 instructions there are 53 timer interrupts and
  the gap is shown 65 times.
- The first timer interrupt comes after 97 instructions, before the gap program's `goto gap`. C3 is
  `81` and C2 holds the address of `goto gap`, and the first switch stores it in the gap program's
  C2 word, `588`.
- The second comes in the report, which had set its own R5 to 0.
- The third comes after 289 instructions, before the gap program's `R2 <= R5 - R1`, with R5 at
  -184, room A's reading. The report then runs, with its own 0 in R5. When the gap program next
  runs `R2 <= R5 - R1`, after 455 steps from the start, R5 holds -184: the kernel saved all
  sixteen of the gap program's registers before the report ran, and put them back before the gap
  program went on.
- A switch is 60 instructions: 9 up to and including the write to the timer, then 51, every one of
  them counted by the timer. So a program's turn is the count less 51: 29 instructions at a count
  of 80.

## The run with a count of 40

The timer counts the kernel's own instructions too. With 40, it reaches 0 inside the kernel, and
the interrupt is taken at the edge after `resume`, before the program runs an instruction. After
the gap program's first stretch neither program runs another instruction; the lanes show only the
handler's; the display is never written (it shows 0); the run is cut off after 5,000 instructions
with 83 timer interrupts. With this kernel any count of 51 or less does it.
