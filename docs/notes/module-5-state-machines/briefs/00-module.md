# Shared fact sheet: Module 5, lessons 2 to 5

You are drafting learner-facing text for an interactive course, *Digital Design: From Bits to a
Working Computer*. Every fact below has been checked against the course's simulator. Use only
these facts and the facts in your brief. Do not add numbers, values, times or claims that are not
given. If a sentence seems to need a fact you were not given, write a note in square brackets
instead of inventing it.

Your final message must be the keys and their text and nothing else, in the form

```
key: text
```

with one blank line between keys. Hints are numbered `c1Hints.1` to `c1Hints.5`. Markdown is
allowed inside a text (`code`, **bold**, lists). Do not describe what you wrote; give the text.

## Voice

- British English. Direct, precise, active voice, short sentences (about twenty words at most).
- The learner is "you". No marketing tone, no filler, no "in this lesson we will", no "let's".
- No em dashes and no en dashes used as dashes. Use a full stop, a colon or a comma.
- Say the point. Do not label it ("that is the key idea"), withhold it ("the third part is the one
  that matters"), or wrap it in a roundabout purpose.
- No intensifiers: actually, exactly (unless exactness is the claim), really, simply, just,
  genuinely, entirely, quite.
- "Press" for buttons and pins, never "click" or "tap".
- Write a value of several bits in backticks, as `0110`. A single bit is written plainly: 0, 1, X.
- A signal's name is written in capitals as it is: CLK, EN, RST, Q, TICK, SAVE.
- The attached style checklist (docs/style.md) applies to every sentence.
- A term in the lesson's "introduces" list is set in **bold** where it is introduced, with its
  plain meaning first.

## Who the learner is

The learner has done Modules 1 to 4 and the first lesson of Module 5, and nothing after. They
know, and you may use without explaining:

- bits, words (several bits treated as one number), binary, hexadecimal (`FF48`), signed and
  unsigned readings (Module 1); a word is written bit 3 first: in `0110`, bit 3 is 0, bit 0 is 0;
- gates (NOT, AND, OR, XOR, NOR, NAND), truth tables, SystemVerilog as the course's text
  (`module`, `logic`, `assign`, `~`, `&`, `|`, `^`) (Module 2);
- the 2-way selector, the decoder (each output is 1 for one pattern of its inputs: output Yk is
  1 when S1 S0 spells k), the comparator, the half adder (inputs A and B, outputs SUM and CARRY),
  the full adder, the carry, overflow (a sum too big for its word), the ALU (Module 3);
- feedback, the latch, the D flip-flop (Q takes D at a rising edge of CLK and keeps its value at
  every other time), the rising edge, setup and hold time, metastable (Module 4);
- from the registers lesson (Module 5, lesson 1): a **register** is flip-flops that share one
  clock and store a word; a **load enable** EN decides at each rising edge whether the register
  takes D (EN 1) or keeps its value (EN 0); a reset RST makes every bit 0 at a rising edge
  where RST is 1; a **shift register**; a flip-flop that no edge has set yet is X, and keeping a
  value keeps X too; every flip-flop gets CLK itself, and other signals only change what reaches
  its D pin (an AND gate in the clock's path made an edge the clock never made); in text,
  `always_ff @(posedge CLK)`, `if`, `else if`, `begin` and `end`, `logic [3:0]` and `4'b0000`.
- The registers lesson ended with: "What if the gates before D worked out a new value from Q,
  such as the next number up? What would a circuit need to work through a fixed list of jobs,
  one per edge?"

## The setting

The course follows a shop with a freezer room. A sensor in the freezer room sends its reading,
a 16-bit word, to a display in the shop's office. Room A's reading was `FF48` (-184, -18.4
degrees) and room B's `FF06` (-250). The manager is told when something is wrong. The registers
lesson built a display that shows four switches' number when Save is pressed and shows `0000`
when the power comes on.

## Working words: one meaning each

- **edge**: the rising edge of CLK, the moment CLK goes from 0 to 1. Nothing else.
- **take**: what a flip-flop or register does at an edge: "Q takes D". Not "capture", "latch",
  "load" (except in the term load enable) or "sample".
- **keep**: Q stays as it was at an edge. Not "hold" (hold is the hold time of Module 4).
- **store**: a register stores a word.
- **step**: only the "Stepped" model's step (every gate looks at its inputs once). A moment in a
  test is a "test"; in a fault figure, a "check".
- **press**: for a button, a pin or an input on the page.
- **reset**: RST, which makes every bit 0 at an edge where RST is 1. The page also has a "Start
  again" button (a fresh circuit) and, in each challenge, a "Clear work" button (discards your
  work). Never call either of those a reset.
- **check**: one of the fault figure's checks. **test**: one of a challenge's tests.

## Words you must not use anywhere

Terms later lessons introduce, so the course's term check fails a lesson that uses them early:
address, byte, RAM, ROM, register file, flag, memory (as a technical term), pipeline, cache,
interrupt, instruction, program counter. Also never: clock gating, ripple counter, T flip-flop,
JK flip-flop, modulo, Moore, Mealy, finite, FSM, latch (in any sense other than Module 4's
latch), asynchronous, microcontroller.

## The page's own controls (exact labels)

- Explorer figures: a pin is a button; pressing an input pin flips it between 0 and 1. A word
  input has a row of bit boxes, each pressable. Buttons: "Clock CLK" (raises CLK and lowers it
  again: one rising edge), "Start again" (a fresh circuit). A table under the drawing lists each
  signal's value. A block in a drawing can be pressed to open it; a trail above the drawing
  goes back out. A figure with the badge "Stepped" has a "Step" slider and a line such as
  "Settled in 5 steps."; you can move the slider back to see each step.
- Prediction figures: the circuit is drawn above the question. Choose an option, then press
  "Check my prediction"; "Predict again" clears it. After checking, a timing diagram shows what
  happened, and the line "The circuit set S to 01." gives the answer.
- Fault figures: a list headed "Fault options" starting with "No fault"; a button "Run checks"
  that runs the figure's fixed steps and reports "2 of 6 checks failed." with the failing
  checks by name.
- Challenges: "Run tests"; a hint ladder; "Clear work". A drawn challenge has part buttons
  above the drawing; press one port and then another to wire them. A written challenge has a
  text box, and the circuit the text makes is drawn under it as you type.
- Time-model badges: "Clocked" (inputs change only between edges; "Clock CLK" makes one edge),
  "Stepped" (every gate takes one step after an input changes), "No simulation".
