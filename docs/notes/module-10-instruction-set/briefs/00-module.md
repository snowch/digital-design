# Shared fact sheet: Module 10, the instruction set

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
allowed inside a text (`code`, **bold**, lists, tables, paragraphs separated by a blank line). Do
not describe what you wrote; give the text.

## Voice

- British English. Direct, precise, active voice, short sentences (about twenty words at most).
- The learner is "you". No marketing tone, no filler, no "in this lesson we will", no "let's".
- No em dashes and no en dashes used as dashes. Use a full stop, a colon or a comma.
- Say the point. Do not label it ("that is the key idea"), withhold it ("the third part is the one
  that matters"), or wrap it in a roundabout purpose.
- No intensifiers: actually, exactly (unless exactness is the claim), really, simply, just,
  genuinely, entirely, quite.
- "Press" for buttons and pins, never "click" or "tap".
- A value of several bits or digits goes in backticks: `380027D8`, `00C`, `011`. A single bit is
  written plainly: 0, 1, X.
- A signal's or bus's name is written in capitals as it is: CLK, WRITEY, PCEN, HR, IR.
- A term in the lesson's "introduces" list is set in **bold** where it is introduced, with its
  plain meaning first and the term second. A term no lesson has introduced yet must not appear.
- Numbers come from the brief. Do not spell a number as a word unless the brief does.
- "Edge" means a rising edge of the clock. Never write "cycle". Do not use "step" for what one
  edge of an instruction does: say "edge", or name the state.

## Who the learner is

The learner has done Modules 1 to 9 and nothing after. They know, and you may use without
explaining:

- bits, words, binary, hexadecimal (`7D8`: capitals, no prefix), signed and unsigned readings
  (the signed reading is what books call two's complement). The shop's two freezer rooms read
  -184 (room A) and -250 (room B), in tenths of a degree.
- gates, selectors, the decoder, adders; the register with its enable and reset; the state
  machine (a register holding the state's code, next-state logic, output logic); SystemVerilog as
  the course's text: `module`, `logic`, `assign`, `always_comb`, `always_ff @(posedge CLK)`,
  `case`, `if`, `typedef enum`, module instances.
- Module 6: memory reached by an address, the ROM, the RAM, the register file, the shop's devices
  at addresses.
- Module 7: the ALU, with its three-bit code (`000` AND, `001` XOR, `010` add, `011` subtract,
  `100` OR, `101` copy B, `110` count up, `111` count down) and its four flags ZERO, MINUS, COUT and
  OVER.
- A register transfer, written `R3 ← R1 - R2`: at an edge, the register on the left takes the
  value worked out from the values before the edge.
- Module 8, the datapath, one edge per instruction:
  - An **instruction** is a 32-bit word, eight hexadecimal digits: K (the kind), J (the job), A,
    B, Y (the registers read as the ALU's A and B, and the register written), then the constant c
    in digits 2 to 0, read signed and widened to 64 bits by copying its bit 11.
  - The kinds: 1 register job `RY ← RA job RB`; 2 constant job `RY ← RA job c`; 3 load; 4 store;
    5 **branch** (subtracts RB from RA; if the job's condition holds, PC ← PC + 4c); 6 call
    (`RY ← PC + 4` and `PC ← PC + 4c`); 7 jump (`PC ← RA + c`); 8 system job (job 4 is `stop`).
  - The **program counter**, PC, holds the address of the instruction being run; the **fetch**
    reads the instruction at the PC from the ROM, which starts at `000`.
  - The devices: the display at `7C0`; room A's sensor at `7D8`; room B's at `7E0`.
- Module 9, control:
  - The decoder works out the control signals from K, J and the constant; with the controller
    and the stop logic it is the **control unit**.
  - An **illegal instruction** is a word the decoder refuses: kind 0, kinds 9 to F, a job its kind
    does not define. The machine stops with cause `21`.
  - Module 9's machine takes several edges an instruction, with one memory port. Its **instruction
    register**, IR, holds the instruction from its fetch. Held words: HA and HB (RA and RB, taken
    at READ), HR (the ALU's result, taken at ALU), HM (a load's word, taken at MEMORY).
  - The controller is a state machine with five states, each named for what its edge does: FETCH
    (IR ← memory[PC]), READ (HA ← RA, HB ← RB), ALU (HR ← the ALU's result), MEMORY (a load's
    word into HM, or a store's write), WRITE (RY ← HR, HM or PC + 4).
  - Each kind's edges: register job and constant job FETCH READ ALU WRITE (4); load FETCH READ ALU
    MEMORY WRITE (5); store FETCH READ ALU MEMORY (4); branch FETCH READ ALU (3); call FETCH READ
    WRITE (3); jump FETCH READ ALU (3); `stop` FETCH, then the machine halts in READ.
  - The edge whose next state is FETCH ends the instruction: there, and only there, PCEN is 1 and
    the PC takes its next value. Control signals that let a part take a word at an edge: IREN (the
    IR), HOLDAB (HA and HB), HOLDR (HR), HOLDM (HM), WREG (register Y), PCEN (the PC).
  - A **micro-operation** is one register transfer an edge makes, such as HR ← HA + HB.
  - Module 9's capstone added a call through a register, `RY ← PC + 4` and `PC ← RA + c`, at kind
    9, in the learner's own copy of the machine's text. The course's machine still refuses kind
    9. In the learner's copy, kinds A to F stay free.
  - Module 9 ended: "Which instructions a machine has is a choice. So is how their words are laid
    out. Why are the course's instructions the ones they are? How should the free kinds be used?"

## The programs Module 10 runs

The figures write each program as addresses, eight-digit words and transfers.

Which room is colder (Module 8's, the course's worked example):

| Address | Word | Transfer |
| --- | --- | --- |
| `000` | `380027D8` | R2 ← memory[`7D8`] (room A) |
| `004` | `380037E0` | R3 ← memory[`7E0`] (room B) |
| `008` | `56230002` | if R2 < R3, read signed, PC ← `010` |
| `00C` | `15032000` | R2 ← R3 |
| `010` | `480207C0` | memory[`7C0`] ← R2 (the display) |
| `014` | `84000000` | stop |

With room A at -184 and room B at -250, the branch is not taken, R2 takes -250, and the display
shows -250.

The margin (Module 8's):

| Address | Word | Transfer |
| --- | --- | --- |
| `000` | `25001F48` | R1 ← -184 |
| `004` | `25002F06` | R2 ← -250 |
| `008` | `13123000` | R3 ← R1 - R2 |
| `00C` | `480307C0` | memory[`7C0`] ← R3 (the display) |
| `010` | `84000000` | stop |

## Working words

Each has one meaning on every Module 10 page. Use no other word for these things, and these words
for nothing else.

- **agree**: two machines hold the same value in a part. "The machines agree on R2."
- **keep**: a register or a part holds a value from one edge to the next.
- **edge**: a rising edge of CLK. **instruction**: one word the machine runs.
- **kind**, **job**, **field**, **digit**: as Module 8 used them. A field is a group of digits
  with one job in the layout (K, J, A, B, Y, the constant).
- **layout**: where each field sits in the 32 bits of an instruction.
- **circuit**: a machine's gates and registers, as drawn or written.
- **run**: what a machine does with a program, instruction by instruction.
- **stop** (the machine halts at `stop` or on a word it cannot run).

## Words that must not appear

Later modules teach them: assembly, assembler, label, stack, function, calling convention,
debugger, breakpoint, trap, interrupt, handler, vector, privilege, user mode, system mode, system
call, pipeline, CPU, cycle, microprogram, microcode, control store. Also never write
"immediately" (it catches a term), "architecture" on its own, or "ISA".

Module 10's own terms, each allowed only from the lesson that introduces it:
**instruction set** and **microarchitecture** (lesson 1), **opcode** (lesson 2), **immediate**
(lesson 3). Your brief says which are allowed.
