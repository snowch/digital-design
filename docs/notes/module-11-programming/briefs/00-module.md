# Shared fact sheet: Module 11, programming and debugging

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
- An address, a word or a constant's digits go in backticks: `380027D8`, `00C`, `7C0`. A line of a
  program goes in backticks too: `R2 <= word[sensorA]`. A decimal reading such as -184 is written
  plainly, without backticks.
- A signal's or a register's name is written as it is: R2, R15, PC, ALARM.
- A term in the lesson's "introduces" list is set in **bold** where it is introduced, with its
  plain meaning first and the term second. A term no lesson has introduced yet must not appear.
- Numbers come from the brief. Do not spell a number as a word unless the brief does.

## Who the learner is

The learner has done Modules 0 to 10 and nothing after. They know, and you may use without
explaining:

- bits, words, hexadecimal (`7D8`: capitals, no prefix in prose), signed and unsigned readings.
  The shop has two freezer rooms, A and B, each with a sensor that reads the room's temperature in
  tenths of a degree: -184 is -18.4 degrees.
- The shop's devices, each a word at an address: the display (`7C0`, shows a word, read signed);
  the lamps (`7C8`: bit 0 ALARM, bit 1 NIGHT, bit 2 CLASH); room A's sensor (`7D8`); room B's
  sensor (`7E0`).
- The course's machine (Modules 8 to 10): sixteen registers R0 to R15 of 64 bits, all alike; the
  PC; a ROM for the program at `000` to `3FF`; a RAM at `400` to `7BF`; the devices from `7C0`. A
  word in memory is 8 bytes, at an address that is a multiple of 8. An **instruction** is a 32-bit
  word, eight hexadecimal digits, K J A B Y c c c: the kind, the job, the registers read as A and
  B, the register written Y, and a 12-bit constant c, read signed, from -2048 to 2047.
- The kinds: 1 register job, 2 constant job, 3 load, 4 store, 5 **branch** (taken when its
  condition on RA - RB holds: PC ← PC + 4c), 6 call (`RY ← PC + 4`, `PC ← PC + 4c`), 7 jump
  (`PC ← RA + c`), 8 system job (job 4 is `stop`). A branch's or call's constant counts
  instructions from the branch itself: c = 1 is the next instruction, c = -3 three back.
- A branch's conditions: equal, differs, less than and not less than, each of the last two read
  signed or unsigned. There is no "greater than": `if R2 < R1 signed` says R1 > R2 (lesson 10.3).
- Lesson 8.5 showed a call keeping its return address in R15 and `goto R15` going back to the
  instruction after the call.
- When the machine cannot go on, it halts with a cause, two hexadecimal digits: `21` a word that is
  not an instruction (an **illegal instruction**), `31` an address with no memory, `33` a word at
  an address that is not a multiple of 8, `34` a store to the ROM or to a sensor.
- The **instruction set** (lesson 10.1) is what every machine running a program agrees on: the
  registers, the PC, the memory and the devices, after every instruction. Module 8's machine and
  Module 9's are two circuits for one instruction set, and the course's tests ran every program on
  both against a model that runs one instruction at a time.
- Lesson 10.4 showed data placed after a program: the machine runs whatever words follow a program
  that has no `stop`.

Every program so far was given to the learner as eight-digit words beside transfers such as
`R2 ← memory[7D8]`. The figures of Modules 8 to 10 also showed each line written as text, such
as `R2 <= word[sensorA]`. Module 5 called `<=` "the transfer arrow written as text". The learner
has never written a program as text, had a tool turn it into words, kept a list of readings in
memory and walked it, used a stack, or looked for a mistake in a program of their own.

Lesson 10.5 ended: "Every program so far was given as words and transfers. Writing a longer one
word by word is slow, and a wrong digit is easy to make. How could you write programs in a form a
person reads, and let a tool make the words?"

## The course's assembly language

One line is one instruction, written as the transfer it makes:

| Instruction | Written |
| --- | --- |
| register jobs | `R3 <= R1 + R2`, `R3 <= R1 - R2`, `R3 <= R1 & R2`, `R3 <= R1 \| R2`, `R3 <= R1 ^ R2`, `R3 <= R2` |
| count up, count down | `R3 <= R1 + 1`, `R3 <= R1 - 1` |
| constant jobs | `R3 <= R1 + 100`, `R3 <= R1 - 8`, `R3 <= 25` |
| loads | `R3 <= word[R1 + 8]`, `R3 <= word[sensorA]` |
| stores | `word[R1 + 8] <= R2`, `word[display] <= R2` |
| branches | `if R1 != R2 goto next`, `if R1 < R2 signed goto colder`, `goto next` |
| a call | `call overBy, R15` (R15 takes the return address) |
| a jump | `goto R15` |
| system jobs | `stop` |

- A name followed by a colon at the start of a line names that line's address: `fine:`. The
  assembler works out the address. A branch to a name gets the constant that reaches it.
- `word -180` puts a word of data in the ROM, after the program. A `word` starts at a multiple of
  8, with 0s before it where needed. A `word` line may hold several words, and a word may be a
  name, which the assembler replaces with that name's address: `hall: word -150, prep, store`.
- The shop's devices have names: `display`, `lamps`, `sensorA`, `sensorB`.
- A number is decimal, or hexadecimal after `0x` (`0x7C0`).
- `//` starts a comment, which the assembler ignores, as in the course's SystemVerilog.

## Working words

Each has one meaning on every Module 11 page. Use no other word for these things, and these words
for nothing else.

- **line**: one line of the program's text.
- **instruction**: one word the machine runs. **word**: 64 bits in memory, or a register's 64 bits.
- **listing**: the table of each line beside its address and its word.
- **name**: a word followed by a colon that names an address (`fine:`). Never call it a "label"
  in a sentence of your own; the assembler's word for it is "name".
- **run**: what the machine does with a program, instruction by instruction.
- **stop**: the instruction `stop`, and what a program does when it runs it: "the program stops".
- **halt**: what the machine does when it cannot go on, with a cause: "the machine halts with cause
  `34`".
- **pause**: what the debugger does at a breakpoint, or when you step. A paused run can go on.
- **end the run**: what the debugger does before an instruction that needs a register nothing has
  set (for an address, a branch's comparison or a jump): "the debugger ends the run before `018`".
  The run cannot go on. Never "pause" for this.
- **cut off**: what the debugger does to a run that has not stopped after a set number of
  instructions.
- **step**: in the debugger, run one instruction. (Not an edge: the debugger never shows edges.)
- **reading**: a sensor's temperature, a number in tenths of a degree.
- **log**: the shop's list of readings kept in memory.
- **call**: the instruction `call`, and what it does. **return**: going back after a call, with
  `goto R15`. A function's answer is its **result**, never its "return value".
- **push** and **pop**: putting a word on the stack and taking it off.

## Words that must not appear

Later modules teach them: trap, interrupt, handler, vector, privilege, user mode, system mode,
system call, pipeline, CPU, cycle, compiler, operating system. Also never write "immediately" (it
catches a term), "architecture" on its own, "ISA", "array", "subroutine", "procedure", "variable"
or "pointer".

Module 11's own terms, each allowed only from the lesson that introduces it:
**assembly**, **assembler** and **debugger** (lesson 1), **breakpoint** (lesson 2), **function**,
**argument** and **calling convention** (lesson 3), **stack** (lesson 4), **recursion** (lesson
5). Your brief says which are allowed. Never write "frame": say "the words one call pushes".

## Functions' names, and words that read two ways

The module's functions are named so that a sentence cannot read them as English: `overBy`,
`sumOver`, `sumKept`, `roomsOver`, `outOfRange`, `warmRooms`, `farthest`, `lowestOf`,
`highestOf`, `warmCount`, `report`. Always write a function's name in backticks, in headings too,
and never use it as an ordinary word. Write "the function `overBy`", never "the overBy function".
Never put a possessive on a function's name: "the first line of `warmRooms`", not "`warmRooms`'s
first line".

"Return" means going back after a call. Where a sentence means a function's answer, say "result":
"`overBy` returns, with its result in R1", never "`overBy` returns 10" unless the sentence says
"returns with 10 in R1". Write 1 as "1 instruction", "1 line" (singular).

Addresses in prose are three hexadecimal digits (`7B8`). The debugger shows a value from 10 to
`7FF` both ways at one size: decimal first, or hexadecimal first for the PC, R14, R15 and any watch
a figure names as an address (for example "7B0 1968"). The watch reads a number typed into it as a
program does: decimal, or hexadecimal after `0x`.

Words a reader takes the wrong way on these pages:

- "reading" is only a sensor's temperature. Never "either reading" for a way of reading bits: say
  "read signed or unsigned, it gives the same result".
- "word" is only 64 bits. Never "without a word", "in a word", "word for word".
- Calls are never "at once" or "at the same time": one call runs at a time. Say "calls not yet
  returned" or "calls in progress".
- "above" is a comparison only (a reading above its limit). Never "the figure above" or "shown
  above": say "the figure before this one".

## The debugger as the page draws it

The debugger's buttons come first, then its listing. The listing is a box of fixed height that scrolls to
keep the line about to run in view, marked ▶. The registers, the shop's devices, the watch and the
stack sit beside the listing on a wide screen and below it on a narrow one. Never say "below the
listing" or "under the registers": say "beside the listing" only if the brief does, or name the
panel ("the watch", "the stack").

A result a figure's run produces is shown only once the run has ended. A question a figure asks
comes before its run.
