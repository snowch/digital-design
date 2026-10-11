# The compiler chapter: the fact sheet

Shared by briefs K1 to K4. Every fact here was checked against the course's model
(`packages/dd-model/src/compile.ts` and its tests, the assembler, the final machine's recorded run).
Use only these facts. Where a sentence seems to need a fact you were not given, write a note in
square brackets instead of inventing it. Read `docs/style.md` first: it applies to every sentence.

## The course and the reader

*Digital Design: From Bits to a Working Computer* is an interactive course in the browser. Its
reader has built a whole working machine from gates, Modules 0 to 13. This is an optional chapter
after Module 13, one lesson, under the heading "Beyond the machine". The reader builds no
compiler: they watch one at work, and translate one line by hand in the challenge.

The course's story: a shop with two freezer rooms, room A and room B, each with a sensor. The
office has a display and three lamps, ALARM, NIGHT and CLASH. Readings are in tenths of a degree:
-184 is -18.4 degrees. With the shop's readings, room A at -184 and room B at -250, the gap is 66.

## Voice

British English. Direct, plain, active voice, short sentences. The reader is "you". No marketing
tone, no filler, no "in this lesson we will", no rhetorical questions, no exclamation marks, no em
dashes or en dashes used as dashes. Numbers as digits. Code, lines of a program, register names
written as code are put in backticks: `R3 <= R1 - R2`. Markdown is allowed: paragraphs, lists,
**bold** for a term the first time it is defined, and nothing else.

## What the reader already knows (earlier lessons)

- Module 0 (the first module): the shop's first program, 9 lines. In the course's assembly:
  1. `R1 <= word[sensorA]`
  2. `R2 <= word[sensorB]`
  3. `R3 <= R1 - R2`
  4. `word[display] <= R3`
  5. `R4 <= 100`
  6. `if R3 < R4 signed goto 0x020` (goes to line 9 when the gap is under 100)
  7. `R5 <= 4`
  8. `word[lamps] <= R5`
  9. `stop`
  The display shows how much warmer room A is than room B; CLASH lights when room A is 10.0
  degrees or more warmer. Module 0's failure experiment: room B's freezer failed, it read -50, and
  CLASH stayed dark, because the program checks one way only.
- Lesson 10.3: the machine has no branch on "greater than". Its branches test `==`, `!=`, `<` and
  `>=`; after `<` or `>=` comes `signed` or `unsigned`. To say "greater than", you swap the two
  registers: `R3 > R4` is `R4 < R3`. Readings of both signs need the signed reading.
- Lesson 11.1: the course's assembly language and its assembler, a program in the page that turns
  each line into one instruction word. 11.1's generalisation ends: "The assembler translates line
  for word. It adds no instruction of its own: every word in the listing comes from one line you
  wrote." The assembler refuses a line it cannot turn into one instruction, with a sentence. Its
  sentences include:
  - "Each line is one instruction. Write it as a transfer, such as R3 <= R1 + R2."
  - "One line does one job. Split it across two lines."
  - "A store writes a register's word. Put the number in a register first."
  - "The language has no >; swap the two registers and write <."
  - "After < or >=, write signed or unsigned."
  11.1's challenge "Being the assembler" had the reader make one program's words by hand.
- In assembly, a device's name alone is its address: `R1 <= sensorA` assembles, and puts `7D8`
  (room A's sensor's address) in R1. `R1 <= word[sensorA]` puts room A's reading in R1.
- A branch's constant counts instructions; a line can be given a name, `after1:`, and a branch can
  go to it by name.
- Lesson 13.2 named the words the assembler makes **machine code**. Its generalisation says:
  "Every program reaches a machine as machine code. Whatever language it was written in, the
  machine runs words like `A7345000`." 13.2 had the reader follow one line at every level, edge by
  edge, on the whole machine, and work out a store's word from its line.
- Module 8 and Module 13: a branch's condition comes from the ALU's flags through the condition
  block. "A is less than B, read signed" is MINUS XOR OVER. The condition block's output is MET;
  when MET is 1 the PC takes the branch's target.

## The term this lesson introduces

- **compiler**: a program that reads lines that say what to work out, and writes the instructions
  that work it out. It arrives in the motivation, after the question has shown the assembler refuse
  the shop's rule. Do not use the word, or "compile", "compiled", "compiles", before the
  motivation section.

## Words this page must not use

kernel, process, operating system, token, parse, parser, syntax, grammar, variable, source code,
label (say "name"), optimise, optimisation, high-level language, temporary, step (for the
compiler's work: say "instruction" or "the next piece"; "step" belongs to nothing on this page),
expression (say "line" or "piece"), statement, translate line for line (fine only as 11.1's quote).

## Working words, one meaning each on this page

- **line**: one line of text, either one of the compiler's lines (which say what to work out) or a
  line of assembly. Say which when both are near: "the compiler's line", "a line of assembly".
- **piece**: a part of the compiler's line the compiler takes in one go: a device's name, a number,
  two registers joined by a job, the `if` part. Never "part" (a part is a piece of the machine).
- **rule**: one of the compiler's five rules. Never the shop's wishes: say "the shop wants".
- **name**: a device's name (`sensorA`) or a line's name (`after1`). Say which.
- **turn over**: a comparison turned over is its opposite: `>=` turned over is `<`.
- **instruction**: one line of assembly, one word of machine code.
- **register**: R1 to R15.
- **word**: an instruction's 32 bits written as 8 hexadecimal digits, or a device's value.

## The compiler's lines

A compiler's line is one of:
- `D <= E`, where D is `display` or `lamps`;
- `if E C E then D <= E`, where C is `<`, `<=`, `>`, `>=`, `==` or `!=`.

E, a piece that gives a number, is one of: `sensorA`, `sensorB`, `signals` or `lamps`; a number
from -2048 to 2047; two Es joined by `+`, `-`, `&`, `|` or `^`; or an E in brackets. Jobs are done
left to right, brackets first. Every number is read signed. A line names no register.

In the compiler's lines a device's name stands for its word, the reading. In assembly the name
alone is its address. That is the one trap in them.

The compiler refuses: a name that is no device the line may read; a number that does not fit
(-2048 to 2047); `*` or `/`, since the machine has no multiplication or division; and a line in no
form above.

## The compiler's five rules

The compiler rewrites the line in place. It takes the leftmost piece the assembler would refuse,
writes one instruction for it, and puts that instruction's register where the piece was, until
nothing of the line is left. Four of the five rules follow the advice of a refusal from 11.1.

1. **A device's name the line reads**: the next register takes its word: `R1 <= word[sensorA]`.
2. **A number**: the next register takes it: `R4 <= 100`. (11.1: "Put the number in a register
   first.")
3. **Two registers joined by a job**: the next register takes the result: `R3 <= R1 - R2`. (11.1:
   "One line does one job.")
4. **`if`, once both sides are registers**: a branch past the rest of the line, on the comparison
   turned over, read signed. Where the comparison turned over is `>` or `<=`, which the machine has
   no branch for, the two registers are swapped. The branch goes to a name the compiler makes up
   for the line after the rest, `after1` for the first line. (11.1: "swap the two registers";
   "write signed or unsigned".)
5. **A device's name the line writes, with a register on the right**: a store:
   `word[lamps] <= R5`. (11.1: "A store writes a register's word.")

Each line starts again at R1, so the compiler keeps nothing in a register from one line to the
next. It ends the program with `stop`.

The comparisons turned over, as the branch the compiler writes for `if R3 C R4 then ...`:
- `<` becomes `if R3 >= R4 signed goto after1`
- `>=` becomes `if R3 < R4 signed goto after1`
- `>` becomes `if R4 >= R3 signed goto after1` (R3 > R4 fails when R3 <= R4, which is R4 >= R3)
- `<=` becomes `if R4 < R3 signed goto after1`
- `==` becomes `if R3 != R4 goto after1`; `!=` becomes `if R3 == R4 goto after1`

## What the compiler writes for the shop's two rules

**The gap rule**, `display <= sensorA - sensorB`, becomes 4 instructions and `stop`:
`R1 <= word[sensorA]`, `R2 <= word[sensorB]`, `R3 <= R1 - R2`, `word[display] <= R3`. These are
Module 0's lines 1 to 4. The line becomes in turn `display <= R1 - sensorB`, `display <= R1 - R2`,
`display <= R3`, then nothing. With the shop's readings the display shows 66.

**The CLASH rule**, `if sensorA - sensorB >= 100 then lamps <= 4`, becomes 7 instructions and
`stop`. The line becomes in turn:
1. `if R1 - sensorB >= 100 then lamps <= 4` (wrote `R1 <= word[sensorA]`, rule 1)
2. `if R1 - R2 >= 100 then lamps <= 4` (wrote `R2 <= word[sensorB]`, rule 1)
3. `if R3 >= 100 then lamps <= 4` (wrote `R3 <= R1 - R2`, rule 3)
4. `if R3 >= R4 then lamps <= 4` (wrote `R4 <= 100`, rule 2)
5. `lamps <= 4` (wrote `if R3 < R4 signed goto after1`, rule 4; the rest runs only when the
   comparison held)
6. `lamps <= R5` (wrote `R5 <= 4`, rule 2)
7. nothing (wrote `word[lamps] <= R5`, rule 5)
then `after1: stop`. These are Module 0's lines 1 to 3 and 5 to 9. With the shop's readings (gap
66) CLASH stays dark; with room A at -100 and room B at -250 (gap 150) CLASH lights.

Their words, as the assembler makes them: `380017D8`, `380027E0`, `13123000`, `25004064`,
`56340003`, `25005004`, `480507C8`, `84000000`. The branch is `56340003`: kind 5 (a branch), job 6
("A is less than B, read signed"), A is R3, B is R4, Y unused (0), constant 3 (it goes 3
instructions on, past `R5 <= 4` and the store, to `stop`).

**Both rules together**: 12 instructions, of which 10 run with the shop's readings. Module 0's
program has 9 and runs 7. Both show 66 and leave CLASH dark. Module 0's program keeps the gap in
R3 for its second rule; the compiler works the gap out again, because each line starts afresh.

**The fault "every piece in R1"** (the failure experiment): the gap line becomes
`R1 <= word[sensorA]`, `R1 <= word[sensorB]`, `R1 <= R1 - R1`, `word[display] <= R1`. The second
load writes over room A's reading before the subtraction reads it; `R1 - R1` is 0, and the display
shows 0, with the shop's readings and with room A at -30 and room B at 80.

## On the whole machine

The compiled CLASH program runs on the course's final machine (Module 13's) with the shop's
readings in 22 edges. The branch's FETCH edge is edge 19 and its ALU edge is edge 21. Before edge 21
MET is already 1: 66 is less than 100. At edge 21 HR takes -34 (66 minus 100) and the PC takes
`01C`, the address of `stop`, so CLASH stays dark. The line's `>=`, a comparison the machine has no
instruction for, ends at the condition block's gates: MINUS XOR OVER, which Module 7 built.
