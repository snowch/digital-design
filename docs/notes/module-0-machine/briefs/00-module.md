# Shared fact sheet: Module 0, meet the machine

You are drafting learner-facing text for an interactive course, *Digital Design: From Bits to a
Working Computer*. Every fact below has been checked against the course's simulator. Use only
these facts and the facts in your brief. Do not add numbers, values, times or claims that are not
given. If a sentence seems to need a fact you were not given, write a note in square brackets
instead of inventing it.

Read `docs/style.md` in the repository before you write: it is the style checklist, and it applies
to every sentence. Do not write or change any file. Your final message must be the keys and their
text and nothing else, in the form

```
key: text
```

with one blank line between keys. Hints are numbered `c1Hints.1` to `c1Hints.5`. Markdown is
allowed inside a text (`code`, **bold**, lists, paragraphs separated by a blank line). Do not
describe what you wrote; give the text.

## Lengths

A length such as "under 90 wds" counts English wds (the unit is abbreviated on purpose: the
unit's full name is a banned term). Never write the unit itself in your text.

## Voice

- British English. Direct, precise, active voice, short sentences (about twenty words at most).
- The learner is "you". No marketing tone, no filler, no "in this lesson we will", no "let's".
- No em dashes and no en dashes used as dashes. Use a full stop, a colon or a comma.
- Say the point. Do not label it ("that is the key idea"), withhold it ("the third part is the one
  that matters"), or wrap it in a roundabout purpose.
- No intensifiers: actually, exactly (unless exactness is the claim), really, simply, just,
  genuinely, entirely, quite.
- "Press" for buttons, never "click" or "tap".
- Numbers come from the brief. Do not spell a number as a word unless the brief does.
- Bold nothing: this module introduces no terms.

## Who the learner is

This is Module 0, the first lesson of the course. The learner has done no lesson. They can turn a
binary number into decimal and back (they know place values 1, 2, 4, 8, 16, 32, 64, 128 ...) and
do everyday arithmetic, including with negative numbers. They know nothing about electronics,
circuits or programming.

## Words you must not use (the term gate)

Later lessons introduce these words, so this module may not use them in any form (a test fails the
lesson if it does; it matches the start of a word, so "bits" is caught by "bit", "words" by
"word", "holds" by "hold", "edges" by "edge", "registers" by "register"):

bit, binary, word, unsigned, signed, two's complement, hexadecimal, threshold, noise margin, gate,
truth table, Boolean, XOR, XNOR, NAND, universal, SystemVerilog, depth, multiplexer, bus, decoder,
demultiplexer, encoder, comparator, carry, half adder, full adder, overflow, ALU, feedback, latch,
transparent, edge, propagation delay, setup, hold, metastable, register, shift register, counter,
register transfer, state machine, state diagram, next-state logic, one-hot, synchronous, address,
RAM, ROM, register file, byte, aligned, alignment, memory-mapped, flag, boundary test, adversarial
test, instruction, datapath, program counter, fetch, branch, control unit, illegal instruction,
instruction register, micro-operation; and also: instruction set, encoding, immediate (so not
"immediately"), opcode, architecture, microarchitecture.

Also avoid "ramp" and "Rome" (caught by RAM and ROM), "busy" (bus), "counterpart" (counter),
"gateway" (gate), "household", "holding", "holder" (hold), "carrying" (carry), "flagged" (flag),
"wording" (word), "bitter" (bit). Say "in plain English", never "in plain words" or "words".

What to say instead:

| Not | But |
| --- | --- |
| instruction | a line of the program |
| register, R3 as a "register" | one of the sixteen numbers the machine keeps, named R0 to R15 |
| program counter, fetch | the line it runs next |
| ALU, adder | the part that adds |
| gate | the smallest parts |
| RAM, ROM, address | memory; where a number is kept |
| bit, binary | a 1 or a 0; 1s and 0s; place, worth |
| edge, clock edge | a press of Run one line; one line |
| holds | keeps, has |

## Working words, one meaning each

- **line**: one line of the program, numbered from 1. Never a wire.
- **wire**: a conductor inside the machine that is high or low. Never a line of the program.
- **number**: a value the machine keeps or shows. "The numbers it keeps" are R0 to R15.
- **reading**: what a room's sensor sends, a number in tenths of a degree. Never "reading" in any
  other sense.
- **part**: a piece of the machine shown as a box in a drawing; "the part that adds" is one.
- **slice**: one of the 64 identical pieces the part that adds is made of; each gives one 1 or 0.
- **level**: one step of the ladder from the program down to one wire. "High" and "low" describe a
  wire's voltage, never a level of the ladder.
- **keep, kept**: what the machine does with a number or a line; never "store" and "hold".
- **run**: what the machine does to a line or a program.
- **stuck**: a wire that stays at one level whatever drives it.

## The shop and its machine (true for both lessons)

- A shop has two freezer rooms, room A and room B. Each room has a sensor that sends its
  temperature as a number in tenths of a degree Celsius: -184 means -18.4 degrees.
- Room A is at -18.4 degrees (-184). Room B is kept colder, at -25.0 degrees (-250).
- The shop's office has a display that shows one number, and three lamps named ALARM, NIGHT and
  CLASH. The program in this module uses the CLASH lamp only.
- Between the sensors and the office is the machine the course builds: the computer the learner
  will have built by Module 8 of the course. It runs a program.
- A program is a list of lines, numbered from 1. The machine runs one line at a time, in order,
  unless a line tells it to go to another line.
- The machine keeps sixteen numbers, named R0 to R15. A line can set one of them, read the rooms,
  show a number on the display, or set the lamps.
- The module's program has 9 lines. In plain English, as the figures show them:
  1. R1 becomes room A's reading
  2. R2 becomes room B's reading
  3. R3 becomes R1 minus R2
  4. Show R3 on the display
  5. R4 becomes 100
  6. If R3 is less than R4, go to line 9
  7. R5 becomes 4
  8. Set the lamps from R5
  9. Stop
- What it does: the display shows how much warmer room A is than room B, in tenths of a degree.
  When that gap is 100 or more (room A is 10.0 degrees or more warmer than room B), lines 7 and 8
  run and the CLASH lamp lights. When the gap is less than 100, line 6 goes to line 9 and lines 7
  and 8 do not run.
- "Set the lamps from R5" with R5 at 4 lights CLASH only: 4 is 100 in 1s and 0s, and the lamps
  are ALARM for the place worth 1, NIGHT for 2, CLASH for 4.
- With room A at -184 and room B at -250: R3 becomes -184 minus -250 = 66; the display shows 66
  (6.6 degrees); 66 is less than 100, so the machine runs lines 1, 2, 3, 4, 5, 6 and 9, and CLASH
  stays dark. At the start every number R0 to R15 is "not set"; the display starts at 0 and every
  lamp dark.
- The machine keeps each line as one number in its memory. The nine lines are kept as these
  numbers (whole numbers, as the figure shows them): 939530200, 939534304, 319959040, 1208158144,
  620773476, 1446248451, 620777476, 1208289224, 2214592512. The machine reads the number for the
  line it runs next, does what it says, and moves on. The numbers do not change while the program
  runs, whatever the rooms read.

## The figures

- **The machine at work** (lessons 1 and 2). The program as a table: Line, What it does, Now (and
  in one figure Kept as). The row of the line it runs next is marked "Next"; after the program
  stops, the last line is marked "Stopped". Buttons: "Run one line" runs one line; "Run" runs a
  line at a time, slowly enough to watch, until the program stops; "Pause" stops a run; "Start
  again" starts the program from line 1. Under the buttons, a line says "Next: line 3." and so on.
  A table "The numbers it keeps" lists R1 to R5 with their numbers; the numbers the last line
  changed are marked "Changed". A table "What the shop sees" shows the display and the three
  lamps, each lit or dark. Two boxes set room A's and room B's readings, in tenths of a degree;
  the learner may change them at any time, and the next line that reads a room reads the new
  value. When a figure asks a question first, its values stay hidden and its buttons absent until
  the learner chooses an answer and presses "Check my prediction".
- **The ladder** (lesson 2). Buttons "Up a level" and "Down a level"; "Level 2 of 7". Each level
  has a title, the module of the course that builds it, a caption, the number at that level, and a
  drawing of the real machine opened at that level.
- Every value a figure shows comes from the course's simulator, which runs the machine the course
  builds. Nothing is an animation.

## The lab (how a lesson works)

- A prediction: the learner chooses an answer and presses "Check my prediction"; the figure then
  shows the machine's answer. "Predict again" clears it.
- A challenge: the learner types answers and presses the button that runs its tests. Each test
  says whether it passed; a failed test shows what the machine gave and what was expected. Each
  challenge has five hints, shown one at a time; the fifth gives the answer.
- The page "Before you start" (linked as "how a lesson works" from every page's header) explains
  the lab in full. Do not repeat it; you may point to it once.
