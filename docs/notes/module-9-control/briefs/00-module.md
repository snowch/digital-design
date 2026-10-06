# Shared fact sheet: Module 9, control

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
- A value of several bits or digits goes in backticks: `380027D8`, `00C`, `011`. A single bit is
  written plainly: 0, 1, X.
- A signal's or bus's name is written in capitals as it is: CLK, WRITEY, IREN, HR, IR.
- A term in the lesson's "introduces" list is set in **bold** where it is introduced, with its
  plain meaning first and the term second. A term no lesson has introduced yet must not appear.
- Numbers come from the brief. Do not spell a number as a word unless the brief does.
- "Edge" means a rising edge of the clock. Never write "cycle". Do not use "step" for what one
  edge of an instruction does: say "edge", or name the state.

## Who the learner is

The learner has done Modules 1 to 8 and nothing after. They know, and you may use without
explaining:

- bits, words, binary, hexadecimal (`7D8`: capitals, no prefix), signed and unsigned readings.
  The shop's two freezer rooms read -184 (room A) and -250 (room B), in tenths of a degree.
- gates, truth tables, SystemVerilog as the course's text: `module`, `logic`, `assign`, `~`, `&`,
  `|`, `==`, `!=`, bit and part selects such as `K[3]` and `C[11:3]`, `always_comb`, `case`, `if`,
  `always_ff @(posedge CLK)`, `typedef enum` for named states (Module 5), module instances.
- Module 3: the selector (multiplexer), the bus, the **decoder** (the 2-to-4 decoder: two select
  bits S1 S0 make exactly one of four lines Y0 to Y3 a 1), the adder.
- Module 4 and 5: the rising edge, the register with its enable EN and reset RST; the **state
  machine**: a register that holds the state's code, **next-state logic** (gates that work out the
  next state's code from the state and the inputs) and output logic (gates that work out the
  outputs from the state); the **state diagram** (a circle per state, an arrow per move, labelled
  with the inputs that make it) and the table of rows (one row per arrow). Module 5 built the
  next-state logic from the table row by row: Module 3's decoder gives one line per state, each
  row is an AND gate, and each bit of the next state is an OR of the rows that give it a 1.
- Module 6: memory reached by an address, the ROM, the RAM, the register file (reads RA and RB
  give QA and QB; one write, address WA, data D, enable WE, at the rising edge), the shop's
  devices at addresses.
- Module 7: the ALU, with its three-bit code OP2 OP1 OP0 (`000` AND, `001` XOR, `010` add, `011`
  subtract, `100` OR, `101` copy B, `110` count up, `111` count down) and its flags.
- A **register transfer**, written `R3 ← R1 - R2`: at an edge, the register on the left takes the
  value worked out from the values before the edge.
- Module 8, the whole datapath, one edge per instruction:
  - An **instruction** is a 32-bit word, eight hexadecimal digits. Digit 7 (bits 31 to 28) is K,
    the kind; digit 6 (27 to 24) is J, the job; digit 5 is A, digit 4 is B, digit 3 is Y (the
    registers read as A and B, and the one written); digits 2 to 0 (bits 11 to 0) are the
    constant, c, read signed.
  - The kinds: 1 register job `RY ← RA job RB`; 2 constant job `RY ← RA job c`; 3 load; 4 store;
    5 **branch** (compares RA with RB; if the job's condition holds, PC ← PC + 4c); 6 call
    (`RY ← PC + 4` and `PC ← PC + 4c`); 7 jump (`PC ← RA + c`); 8 system job (job 4 is `stop`).
    Loads and stores have jobs 0, 1, 8 and 9: job bit 0 says a byte, job bit 3 says the address is
    the constant alone. A call and a jump have job 0 only. Kinds 1, 2 and 5 have jobs 0 to 7.
  - The **program counter**, PC, holds the address of the instruction being run. The **fetch**
    reads the instruction at the PC: in Module 8 the ROM gives it on the bus IR, a bus, not a
    register. The ROM starts at `000`.
  - Module 8's datapath has two ways into memory: the ROM's fetch at the PC, and the memory's
    read or write at the ALU's result for a load or a store.
  - The decoder, drawn closed in Module 8, works out the control signals from K and J: WRITEY
    (register Y is written), LOAD, STORE, BYTE (a byte, not a word), AZERO (the ALU's A takes 0),
    BCONST (the ALU's B takes the constant), OP2, OP1, OP0 (the ALU's code), BRANCH, CALL, JUMP.
    In Module 8's first two lessons the learner set WRITEY and BCONST by hand.
  - The stop logic stops the machine at `stop` or at anything it cannot run, and says why with a
    cause: `11` a fetch outside the ROM, `12` a fetch not at a multiple of 4, `21` an instruction
    the decoder does not know, `31` to `34` a load or store that cannot be done (`33`: a word not
    at a multiple of 8, or a byte at a device).
  - The devices: the display at `7C0` shows the word stored there; room A's sensor at `7D8`;
    room B's at `7E0`.
  - Module 8 ended: "The datapath works, but how does the decoder work out those signals from K
    and J alone?"

## The programs Module 9 runs

The figures write each program as addresses, eight-digit words and transfers. These are the
words the course's own tools made from them.

The margin (Module 8's, stored to the display):

| Address | Word | Transfer |
| --- | --- | --- |
| `000` | `25001F48` | R1 ← -184 |
| `004` | `25002F06` | R2 ← -250 |
| `008` | `13123000` | R3 ← R1 - R2 |
| `00C` | `480307C0` | memory[`7C0`] ← R3 (the display) |
| `010` | `84000000` | stop |

Which room is colder (Module 8's):

| Address | Word | Transfer |
| --- | --- | --- |
| `000` | `380027D8` | R2 ← memory[`7D8`] (room A) |
| `004` | `380037E0` | R3 ← memory[`7E0`] (room B) |
| `008` | `56230002` | if R2 < R3, read signed, PC ← `010` |
| `00C` | `15032000` | R2 ← R3 |
| `010` | `480207C0` | memory[`7C0`] ← R2 (the display) |
| `014` | `84000000` | stop |

## Words that must not appear

Later modules teach them: instruction set, encoding, opcode, immediate, assembly, assembler,
label, stack, function, calling convention, debugger, breakpoint, trap, interrupt, handler,
vector, privilege, user mode, system mode, system call, pipeline, CPU, cycle, microprogram,
microcode, control store.

Module 9's own terms, each allowed only from the lesson that introduces it: **control unit**
(lesson 1), **illegal instruction** (lesson 2), **instruction register** (lesson 3),
**micro-operation** (lesson 4). Your brief says which are allowed.
