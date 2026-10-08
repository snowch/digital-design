# Shared fact sheet: Module 12, traps and interrupts

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
- An address, a word or a constant's digits go in backticks: `014`, `7C0`. A line of a program
  goes in backticks too: `R5 <= C3`. A decimal number such as -184 is written plainly, without
  backticks. A cause is two hexadecimal digits in backticks: cause `34`.
- A register's name is written as it is: R5, C2, PC, ALARM. The control registers are C0, C1, C2,
  C3 and C4.
- A term in the lesson's "introduces" list is set in **bold** where it is introduced, with its
  plain meaning first and the term second. A term no lesson has introduced yet must not appear.
- Numbers come from the brief. Do not spell a number as a word unless the brief does.

## Who the learner is

The learner has done Modules 0 to 11 and nothing after. They know, and you may use without
explaining:

- bits, words, hexadecimal (`7D8`: capitals, no prefix in prose), signed and unsigned readings.
  The shop has two freezer rooms, A and B, each with a sensor that reads the room's temperature in
  tenths of a degree: -184 is -18.4 degrees.
- The shop's devices, each a word at an address: the display (`7C0`, shows a word, read signed);
  the lamps (`7C8`: bit 0 ALARM, bit 1 NIGHT, bit 2 CLASH); DOOR and WARM (`7D0`, read only:
  bit 0 DOOR, 1 while the door is open; bit 1 WARM); room A's sensor (`7D8`) and room B's
  (`7E0`), both read only; the timer (`7E8`); "waiting" (`7F0`). The assembler names them
  `display`, `lamps`, `signals`, `sensorA`, `sensorB`, `timer` and `waiting`.
- The course's machine (Modules 8 to 10): sixteen registers R0 to R15 of 64 bits, all alike; the
  PC; a ROM for the program at `000` to `3FF`; a RAM at `400` to `7BF`; the devices from `7C0`. A
  word in memory is 8 bytes, at an address that is a multiple of 8. An instruction is 4 bytes, so
  the next instruction is at the PC plus 4.
- Each instruction is one edge on the machine Module 8 built: at the edge, the registers, the PC
  and the memory take their new values together. (Module 9 built a second circuit, the machine of
  several edges, which takes several edges for each instruction; Module 10 taught that both run
  the same instruction set.)
- When the machine cannot go on, it **halts** with a **cause**, two hexadecimal digits: `11` the PC
  is outside the ROM, `12` the PC is not a multiple of 4, `21` a word that is not an instruction
  (an **illegal instruction**), `31` an address with no memory, `33` a word at an address that is
  not a multiple of 8, `34` a store to the ROM or to a read-only device (a sensor, or DOOR and
  WARM). The first digit says which step failed (1 fetch, 2 decode, 3 memory).
- Module 9 named five **control registers**, C0 to C4, "which Module 12 builds", and the system
  jobs `R3 <= C3` (copy a control register into a register) and `C4 <= R3` (copy a register into
  a control register). The constant names which control register: 0 to 4, anything else illegal.
  Module 11's debugger called cause `41`, `call system`, "which Module 12 builds".
- **Module 11**: programs as text in the course's **assembly**, the **assembler**, the
  **debugger** (step, run, breakpoints, the watch, the stack view), **function**s, **argument**s,
  the **calling convention**, the **stack** in RAM from `7C0` down with R14, **recursion**. The
  calling convention: R1 to R4 arguments, R1 the result, R5 to R9 free, R10 to R13 kept, R14 the
  stack, R15 the return address.
- Module 11's last lesson ended: "Your program reaches the display and the lamps itself, with stores. When a
  program does something the machine refuses, the machine halts and nothing more runs. A shop's
  machine runs more than one program. One program's mistake should not end them all. What if,
  instead of halting, the machine went to a program of its own, said why, and carried on?"

Lessons are never named by a number with a dot ("lesson 8.4"): the site does not show those
numbers. Say "Module 8" for an earlier module, and "lesson 3" for a lesson of this module.

## The course's assembly language

One line is one instruction, written as the transfer it makes: `R3 <= R1 + R2`, `R3 <= R1 + 4`,
`R3 <= 25`, `R3 <= word[sensorA]`, `word[display] <= R2`, `word[0x400] <= R5` (an address written
as a number), `if R1 != R2 goto next`, `goto next`, `call overBy, R15`, `goto R15`, `stop`,
`nothing`. A name followed by a colon names a line's address (`handler:`). `//` starts a comment.
A number is decimal, or hexadecimal after `0x`. Module 12 uses four more lines, all system jobs:

- `R5 <= C3`: R5 takes the word in control register C3.
- `C2 <= R5`: C2 takes the word in R5.
- `resume`: goes back to the program the trap stopped (lesson 1 says how).
- `call system`: lesson 4's.

## Words for how a run ends, and what a trap does

Each has one meaning on every Module 12 page. Use no other word for these things, and these words
for nothing else.

- **stop**: the instruction `stop`, and what a program does when it runs it: "the program stops".
- **halt**: what the machine does when it cannot go on and no handler takes over: "the machine
  halts with cause `34`". A halt ends the run.
- **trap**: what the machine does instead of halting when a handler is set: "the store traps",
  "a trap". Then the machine **goes to the handler**.
- **resume**: what the handler does with `resume`: "the handler resumes the program".
- **pause**: what the debugger does at a breakpoint, or when you step. A paused run can go on.
- **cut off**: what the debugger does to a run that has not stopped after 5000 instructions.
- **edge**: one instruction's edge, or a trap's edge. "Step" is the debugger's button and what it
  does, never an edge.

## Working words

- **line**: one line of the program's text. **instruction**: one word the machine runs.
- **word**: 64 bits in memory or in a register. Never "in a word", "without a word".
- **handler**: the program the machine goes to at a trap. Never "routine", "service routine",
  "exception handler".
- **return point**: the address C2 holds, where `resume` goes. Not "return address": that is
  R15's job in a call.
- **cause**: C3's number, two hexadecimal digits. Where the English word "cause" would read as
  C3's number, say "makes" or "leads to" instead.
- **fault**, **faults**: an instruction the machine refuses (causes `11` to `34`). "The store
  faults; the machine traps."
- **reading**: a sensor's temperature, a number in tenths of a degree.
- **C0**: always control register C0 on these pages. Never the ALU's carry in.
- **call**: a function's call with `call`. `call system` is lesson 4's and always written in full.

## Words that must not appear

Later lessons teach them: interrupt, user mode, system mode, system call, privilege, kernel,
operating system, vector, exception, pipeline, CPU, cycle, compiler. Also never write
"immediately", "architecture" on its own, "ISA", "array", "subroutine", "procedure", "variable",
"pointer", "routine", "frame".

Module 12's own terms, each allowed only from the lesson that introduces it: **trap** and
**handler** (lesson 1), **user mode** and **system mode** (lesson 3), **system call** (lesson 4),
**interrupt** (lesson 5). Your brief says which are allowed.

## The debugger and the timeline as the page draws them

- The debugger's buttons come first, then its listing, a box of fixed height that keeps the line
  about to run in view, marked ▶. The registers, the control registers and the devices sit beside
  the listing on a wide screen and below it on a narrow one. Name a panel by its title ("the
  control registers"), never by where it sits.
- The control registers panel shows C0 to C4, each with its job: C0 "status", C1 "status before
  the trap", C2 "return point", C3 "cause", C4 "handler's address". C0 and C1 show two bits, C3
  two hexadecimal digits, C2 and C4 three.
- The timeline lists the run's edges one at a time: "Next edge" adds the next, "Step back" removes
  it, "Run to the end" shows them all. Each edge says what ran, or that it trapped, and lists its
  transfers, such as `C2 ← 014`.
- A result a figure's run produces is shown only once the run has ended. A question a figure asks
  comes before its run.

## Decisions after the reading review (8 October)

These hold on every Module 12 page and override anything above that disagrees.

- **The program and the handler.** "The program" is the user program only. "The handler" is the
  code at the address C4 holds. From lesson 3 on, a user program's `stop` traps with cause `22`;
  the run ends when the handler runs `stop`, so say "the handler's `stop` ends the run" or "the
  run stops at `0A0`", never "the program stops" for it.
- **A refusal with no handler** is an instruction that faults and halts the machine, as in Module
  8. A **trap** is always going to the handler. Never write "a trap halts".
- **Numbers.** An address is three hexadecimal digits: `004`, not 4. C0, C1 and "waiting" are
  written as their two bits, bit 1 then bit 0: `01`, `11`. A cause is two hexadecimal digits, C2
  and C4 three. A word in memory or in a register is a decimal number; from 10 to `7FF` the pages
  show its hexadecimal beside it. So cause `34`, kept as a word, reads 52 (`034`): `34` in
  hexadecimal is 3 × 16 + 4 = 52.
- **Addresses in prose** are written `400`, with no prefix. Only a line for the learner to type
  gives the code, `word[0x400]`.
- **Words.** "Save" and "put back" are for copying a register or a control register to the RAM
  and back. "Keep" is the calling convention's word for a register a function leaves as it was.
  "A function call" is a call with `call`, written in full where a bare "call" could be misread.
  "Job" is only a system call's service (lesson 4 on).
- **The registers a system call may change** (lesson 4 on): R1 and R2, the call's own registers.
  R1 names the job and brings back the result; R2 gives the job its word. Every other register
  comes back as it was.
- **Two causes at one edge**: the lower number wins.
- **Buttons.** With a breakpoint or a pause ahead, the debugger's run button reads "Run to a
  breakpoint"; with none ahead it reads "Run to the end". Name the button the step will show.
