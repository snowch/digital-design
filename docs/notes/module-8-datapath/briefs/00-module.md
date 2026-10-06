# Shared fact sheet: Module 8, the datapath

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

## Voice

- British English. Direct, precise, active voice, short sentences (about twenty words at most).
- The learner is "you". No marketing tone, no filler, no "in this lesson we will", no "let's".
- No em dashes and no en dashes used as dashes. Use a full stop, a colon or a comma.
- Say the point. Do not label it ("that is the key idea"), withhold it ("the third part is the one
  that matters"), or wrap it in a roundabout purpose.
- No intensifiers: actually, exactly (unless exactness is the claim), really, simply, just,
  genuinely, entirely, quite.
- "Press" for buttons and pins, never "click" or "tap".
- A value of several bits or digits goes in backticks: `13123000`, `0110`. A single bit is
  written plainly: 0, 1, X.
- A signal's or bus's name is written in capitals as it is: CLK, WRITEY, QA, RESULT, IR.
- A term in the lesson's "introduces" list is set in **bold** where it is introduced, with its
  plain meaning first and the term second. A term no lesson has introduced yet must not appear.
- Numbers come from the brief. Do not spell a number as a word unless the brief does.

## Who the learner is

The learner has done Modules 1 to 7 and nothing after. They know, and you may use without
explaining:

- bits, words, binary, hexadecimal (`FF48`: capitals, no prefix), signed and unsigned readings
  (Module 1). The shop's two freezer rooms read -184 (room A) and -250 (room B), in tenths of a
  degree.
- gates, truth tables, SystemVerilog as the course's text: `module`, `logic`, `assign`, `~`, `&`,
  `|`, `^`, `logic [3:0]` (Module 2); bit and part selects such as `IR[31:28]`, concatenation
  `{a, b}`, `always_comb`, `case`, `if`, `always_ff @(posedge CLK)`, `parameter`, `+` and `-`.
- the selector (multiplexer) and the bus (Module 3), the decoder, the adder, the ALU.
- the D flip-flop and the rising edge (Module 4); the register, its load enable EN and its reset
  RST, a counter (Module 5); a **register transfer**, written `R3 ← R1 - R2`: at an edge, the
  register on the left takes the value worked out from the values before the edge. `<=` is the
  transfer arrow written as text.
- Module 6: a RAM reached by address; the **register file**: registers with two reads (read
  addresses RA and RB give the words QA and QB) and one write (write address WA, data D, write
  enable WE, written at the rising edge of CLK); bytes, aligned words; the ROM; the shop's devices
  memory-mapped (the display shows a word written to its address; the sensors are words read at
  theirs).
- Module 7: the ALU does eight jobs, chosen by a three-bit code OP2 OP1 OP0: `000` AND, `001` XOR,
  `010` add, `011` subtract, `100` OR, `101` copy B, `110` count up (A + 1), `111` count down
  (A - 1). It reads words A and B and gives Y and four flags: ZERO, MINUS, COUT and OVER. It works
  at 64 bits.
- Module 7 ended: "The ALU reads two input words, A and B, and produces Y and four flags. Where do
  A and B come from? And where do Y and the four flags go?"

## The machine (facts every lesson may use)

- The course's machine has 16 registers, R0 to R15, each 64 bits, in one register file.
- An **instruction** is a 32-bit word that says what the machine does at one edge. It is written as
  eight hexadecimal digits. Each field is whole digits, in the same place in every instruction:

  | Digit | Bits | Field | What it says |
  | --- | --- | --- | --- |
  | 7 (left) | 31 to 28 | K, the kind | what the instruction does |
  | 6 | 27 to 24 | J, the job | which ALU job (and, in later lessons, other choices) |
  | 5 | 23 to 20 | A | the register read into the ALU's A input |
  | 4 | 19 to 16 | B | the register read into the ALU's B input |
  | 3 | 15 to 12 | Y | the register written |
  | 2 to 0 | 11 to 0 | the constant, C | a number, used from the next lesson on |

- Kind 1 is a register job: `RY ← RA job RB`. Its job digit J is the ALU's code: J's bits 2 to 0
  are OP2, OP1 and OP0. So job 0 is AND, 1 XOR, 2 add, 3 subtract, 4 OR, 5 copy B, 6 count up,
  7 count down.
- `13123000` reads: kind 1, job 3 (subtract), A is R1, B is R2, Y is R3, constant 0. It is
  `R3 ← R1 - R2`.
- In the drawings, the instruction arrives on a bus called IR. The block "digits" splits IR into
  K, J, A, B, Y and C. It has no gates: each output is some of IR's wires.

## Words that must not appear (later lessons or modules teach them)

program counter, PC, fetch, branch, opcode, immediate, assembly, assembler, label, control unit,
micro-operation, instruction set, encoding, instruction register, trap, interrupt, handler, stack,
function, sign extension, decode, decoding, pipeline, cycle (say "edge"), CPU.
