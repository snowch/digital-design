# Shared fact sheet: Module 13, the whole machine

You are drafting learner-facing text for an interactive course, *Digital Design: From Bits to a
Working Computer*. Every fact below has been checked against the course's simulator. Use only
these facts and the facts in your brief. Do not add numbers, values, addresses, counts or claims
that are not given. If a sentence seems to need a fact you were not given, write a note in square
brackets instead of inventing it.

Read `docs/style.md` in the repository before you write: it is the style checklist, and it applies
to every sentence. Do not write or change any file. Your final message must be the keys and their
text and nothing else, in the form

```
key: text
```

with one blank line between keys. Hints are numbered `c1Hints.1` to `c1Hints.5`. Markdown is
allowed inside a text (`code`, **bold**, lists, paragraphs separated by a blank line, a fenced
code block for a program). Do not describe what you wrote; give the text.

## Voice

- British English. Direct, precise, active voice, short sentences (about twenty words at most).
- The learner is "you". No marketing tone, no filler, no "in this lesson we will", no "let's".
- No em dashes and no en dashes used as dashes. Use a full stop, a colon or a comma.
- Say the point. Do not label it ("that is the key idea"), withhold it ("the third part is the one
  that matters"), or wrap it in a roundabout purpose.
- No intensifiers: actually, exactly (unless exactness is the claim), really, simply, just,
  genuinely, entirely, quite.
- "Press" for buttons, never "click" or "tap".
- An address, a word or a constant's digits go in backticks: `014`, `7C0`, `380017D8`. A line of a
  program goes in backticks too: `R3 <= R1 - R2`. A decimal number such as -184 is written plainly,
  without backticks. A cause is two hexadecimal digits in backticks: cause `41`.
- A register's name is written as it is: R5, C2, PC, IR, ALARM, CLASH. A signal's name is written
  as the drawing writes it: TRAP, CAUSE, FETCHED, ADDR, NOHANDLER.
- A term in the lesson's "introduces" list is set in **bold** where it is introduced, with its
  plain meaning first and the term second. A term no lesson has introduced yet must not appear.
- Numbers come from the brief. Do not spell a number as a word unless the brief does.

## Who the learner is

The learner has done Modules 0 to 12 and nothing after. They know, and you may use without
explaining:

- bits, words, hexadecimal (`7D8`: capitals, no prefix in prose), signed and unsigned readings. The
  shop has two freezer rooms, A and B, each with a sensor that reads the room's temperature in
  tenths of a degree: -184 is -18.4 degrees.
- The shop's devices, each a word at an address: the display (`7C0`), the lamps (`7C8`: bit 0
  ALARM, bit 1 NIGHT, bit 2 CLASH), DOOR and WARM (`7D0`), room A's sensor (`7D8`), room B's
  (`7E0`), the timer (`7E8`) and "waiting" (`7F0`). The assembler names them `display`, `lamps`,
  `signals`, `sensorA`, `sensorB`, `timer` and `waiting`.
- Every part of the machine, each built and tested in its own lessons: gates (Module 2), the parts
  made of them, such as selectors, decoders and adders (Module 3), the flip-flop (Module 4),
  registers and state machines (Module 5), memory and the register file (Module 6), the ALU
  (Module 7).
- The machines: Module 8's machine of one edge per instruction; Module 9's machine of several
  edges, with one memory port, the instruction register IR, the held words HA, HB, HR and HM, the
  decoder, and the controller, a state machine with the states FETCH, READ, ALU, MEMORY and WRITE,
  one edge each; Module 10's instruction set; Module 12's copy of Module 9's machine with the trap
  hardware: the control registers C0 to C4, the trap logic, and the controller's rule that an edge
  which traps leads to FETCH.
- Two instructions the learner added in their own copy of the machine: in Module 9, a **call
  through a register**, `call R6, R15`, kind 9: R15 takes the PC plus 4 and the PC takes R6 plus
  the constant; and in Module 10, **set if**, `R5 <= R3 >= R4 signed`, kind A: R5 takes 1 if the
  condition holds, else 0, the job digit being a branch's condition. Module 10 named it "set if
  less", after its first use; its job digit can give any of a branch's eight conditions, so
  `R5 <= R3 >= R4 signed` sets R5 to 1 when R3 is not less than R4, read signed. Call it "set if".
- The course's assembly language, the assembler, the debugger, functions, the stack and the calling
  convention (Module 11); traps, the handler, user mode and system mode, system calls and
  interrupts (Module 12).
- An instruction is 32 bits, eight hexadecimal digits, read K J A B Y c c c: the kind, the job, the
  two registers read (A and B), the register written (Y), and a 12-bit constant.
- Module 0's first two lessons: the machine as a box that runs lines of a program; then one line
  followed down to one wire, on a path chosen for the learner, through nine levels, each the real
  circuit opened one level further, each named with the module that builds it.

Lessons are never named by a number with a dot ("lesson 8.4"): the site does not show those
numbers. Say "Module 8" for an earlier module, and "lesson 3" for a lesson of this module.

## The machine of this module

- **The final machine** is Module 12's machine of several edges with its trap hardware, and the two
  instructions the learner added: the call through a register (kind 9) and set if (kind A). Its
  decoder is the one Module 10's capstone built, which knows both. Its datapath has a fifth source
  for the word register Y takes: the branch condition MET as a word, 0 or 1, chosen by the control
  signal SET.
- **Whose parts run.** The machine is built from the course's parts: the course's own versions of
  the parts the learner designed, often wider (the register file has sixteen registers of 64 bits,
  where Module 6's had four of 4 bits). Do not say they pass the learner's tests: no test checks
  that. The machine does not run the learner's own earlier answers: each lesson keeps its own
  work. Say this plainly; never suggest the learner's answers run.
- Its drawing has three blocks: **the control unit** (`control`), **the datapath** (`datapath`) and
  **the memory port** (`port`). Each opens, level by level, down to gates.

## The shop's last program

The module's program is Module 0's first program, written for the whole machine. It works out the
gap between the rooms, room A minus room B, shows it on the display, and lights CLASH when room A is
10.0 degrees or more warmer. With Module 0's readings, room A -184 and room B -250, the gap is 66,
the display shows 66, and CLASH stays off. Its lines, with each line's address:

```
000  R1 <= handler
004  C4 <= R1                // the handler's address
008  R1 <= word[sensorA]
00C  R2 <= word[sensorB]
010  R3 <= R1 - R2           // the gap, room A minus room B
014  R4 <= 100
018  R5 <= R3 >= R4 signed   // set if: 1 when room A is 10.0 degrees warmer or more
01C  R5 <= R5 + R5
020  R5 <= R5 + R5           // CLASH is bit 2
024  word[lamps] <= R5
028  R6 <= show
02C  call R6, R15            // a call through a register
030  stop
034  show: R1 <= 1           // job 1: show R2
038  R2 <= R3
03C  call system
040  goto R15
044  handler: word[display] <= R2
048  resume
```

The whole run takes 69 edges from the reset to the edge before `stop` halts the machine. The program
runs in system mode throughout; its handler offers one job, which shows R2 on the display.

## Words for how a run ends

Each has one meaning on every Module 13 page.

- **stop**: the instruction `stop`, and what the run does when it reaches it: "the run stops".
- **halt**: what the machine does when it cannot go on and no handler takes over: "the machine
  halts with cause `41`".
- **trap**: what the machine does instead of halting when a handler is set; it then **goes to the
  handler**. The handler **resumes** the program with `resume`.
- **cut off**: what a figure does to a run that has not stopped after its limit of edges.

## Working words

- **edge**: one rising edge of the clock. Each instruction takes several edges; the figures number
  them from the reset, edge 1 first.
- **line**: one line of the program's text. **instruction**: the word the machine runs for it.
- **word**: 64 bits in memory or in a register; an instruction's word is 32 bits.
- **level**: a level of the drawing, as Module 0's ladder used it: the whole machine, a block opened,
  a block inside it opened, and so on down to gates. Never use "level" for a wire's 1 or 0: say "the
  wire is 1".
- **block**: a part of the drawing that opens to show the parts inside it.
- **join** (lesson 1 on): a bus or a wire between two blocks, where one block's output becomes
  another's input.
- **follow**: what the learner does with a value from one level to the next. Do not use "trace" for
  it in lessons 1 and 2; lesson 3 names it.
- **step**: the button "Step back" only. For what the machine does, say "edge", "instruction" or
  "trap".
- **the model**: the course's instruction-level model of the machine, which works out what each
  instruction does in numbers, with no gates. Module 8 compared every machine with it after every
  instruction, and lesson 10.1 taught that a program relies on that agreement. Say "the
  instruction-level model" where it first appears in a lesson, then "the model".
- **the handler**: the code at the address C4 holds, `044`. **The program**: the shop's program,
  every line before the handler.

## Words that must not appear

Never write: pipeline, cache, kernel, operating system, compiler, ISA, "architecture" on its own,
microarchitecture, register transfer level, "immediately", "simply", "subroutine", "procedure",
"variable", "pointer", "routine", "frame", "netlist", "vector".

Module 13's own terms, each allowed only from the lesson that introduces it: **CPU** (lesson 1),
**machine code** (lesson 2), **abstraction** (lesson 3). Your brief says which are allowed.

## The figures as the page draws them

- **The whole machine, run edge by edge.** Its buttons: "Next edge", "Step back", "Run to the end",
  "Start again". A line under the buttons says where the run is: before the first edge, "the next
  edge fetches" the first line; then which edge has run and what the next edge is ("the READ edge
  of `call system` at `03C`"); and how the run ended. The drawing below opens a block when you press
  it, and every value on it is the value at the edge the run is at. Tables beside it show registers,
  devices or control registers where a lesson asks.
- A result a figure's run produces is shown only once the run has ended. A question a figure asks
  comes before its run, and no value shows until you commit to an answer.
- A timing diagram draws edges along the top, numbered from the reset, one lane per signal, each
  value written where it holds. A cursor reads every lane at one time.
