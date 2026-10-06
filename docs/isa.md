# The course machine's instructions

**Status: a draft for checkpoint 2**, with `docs/machine.md`, which holds the questions for the
author. Nothing here is fixed until the author approves both files, and no lesson may state any
of it before then.

This file is the programmer's side of the machine: the layout of an instruction, what each one
does, which are illegal, the assembly language, and the calling convention. `docs/machine.md` is
the hardware. Each instruction's effect is written as register transfers, in Module 5's notation:
`←` for "takes, at the edge", every right-hand side read before the edge.

## One layout

Every instruction is 32 bits: eight hexadecimal digits, each field a whole digit, in the same
place in every instruction.

| Digit | Bits | Field | What it says |
| --- | --- | --- | --- |
| 7 (left) | 31 to 28 | K, the kind | what the instruction does |
| 6 | 27 to 24 | J, the job | which ALU job, which condition, which size, or which system job |
| 5 | 23 to 20 | Y | the register written |
| 4 | 19 to 16 | A | the register read into the ALU's A input |
| 3 | 15 to 12 | B | the register read into the ALU's B input, or stored |
| 2 to 0 | 11 to 0 | the constant, c | a number from -2048 to 2047, read signed, widened to N bits |

So the instruction `12312000` reads, digit by digit: kind 1 (a register job), job 2 (add), Y is
R3, A is R1, B is R2, constant 0. It is `R3 ← R1 + R2`.

- The A, B and Y digits are the register file's two read addresses and its write address
  (Module 6's register file), and the job digit of a job is the ALU's code (Module 7). The
  decoder never moves a field.
- A field an instruction does not use is ignored. The assembler writes 0 there.
- An instruction is stored as 4 bytes, low byte first, at an address that is a multiple of 4.

## The kinds

Every instruction also does `PC ← PC + 4`, except where the table gives the PC another value.

| K | Kind | Transfers |
| --- | --- | --- |
| 0 | none: illegal (cause 2) | the assembler fills the ROM past the program with 0s, so a program that runs off its end stops at once |
| 1 | register job | `RY ← RA job RB` |
| 2 | constant job | `RY ← RA job c` |
| 3 | load | `RY ← memory[RA + c]` |
| 4 | store | `memory[RA + c] ← RB` |
| 5 | branch | `PC ← PC + 4c` if `RA cond RB`; otherwise `PC ← PC + 4` |
| 6 | call | `RY ← PC + 4` and `PC ← PC + 4c` |
| 7 | jump | `PC ← RA + c` |
| 8 | system | see "System jobs" |
| 9 to F | none yet: illegal | room for the instructions Modules 9 and 10 add |

A branch's or a call's constant counts instructions from the branch or call itself: c = 1 is the
next instruction, c = -3 the third one back.

### Jobs: Module 7's ALU

Kinds 1 and 2 take the job digit as the ALU's code, OP2 OP1 OP0 (`docs/notes/module-7-alu.md`).

| J | Job | Kind 1 | Kind 2 |
| --- | --- | --- | --- |
| 0 | AND | `RY ← RA AND RB` | `RY ← RA AND c` |
| 1 | XOR | `RY ← RA XOR RB` | `RY ← RA XOR c` |
| 2 | add | `RY ← RA + RB` | `RY ← RA + c` |
| 3 | subtract | `RY ← RA - RB` | `RY ← RA - c` |
| 4 | OR | `RY ← RA OR RB` | `RY ← RA OR c` |
| 5 | copy B | `RY ← RB` | `RY ← c` |
| 6 | count up | `RY ← RA + 1` | the same; c is not used |
| 7 | count down | `RY ← RA - 1` | the same; c is not used |
| 8 to F | illegal | | |

A kind 2 copy B is how a register takes a constant: `RY ← c`. Adding and subtracting wrap round,
as Module 7's ALU does; nothing traps on overflow.

### Loads and stores

| J | Size | Load | Store |
| --- | --- | --- | --- |
| 0 | a word, N/8 bytes, at a multiple of N/8 | RY takes the word | the word at the address takes RB |
| 1 | a byte, at any address | RY takes the byte, with 0s above it | the byte at the address takes RB's low 8 bits |
| 2 to F | illegal | | |

The address is `RA + c`, worked out by the ALU's add. A word at another address traps (cause 4);
an address with no memory, or a store to the ROM or to a read-only device, traps (cause 5);
in user mode, a device's address traps (cause 3).

### Branches

The ALU works out `RA - RB`, and the job digit chooses the condition from its flags
(`docs/machine.md`, "Branches"):

| J | Taken when | Written |
| --- | --- | --- |
| 0 | A equals B | `if RA == RB goto L` |
| 1 | A differs from B | `if RA != RB goto L` |
| 2 | A is less than B, read signed | `if RA < RB signed goto L` |
| 3 | A is not less than B, read signed | `if RA >= RB signed goto L` |
| 4 | A is less than B, read unsigned | `if RA < RB unsigned goto L` |
| 5 | A is not less than B, read unsigned | `if RA >= RB unsigned goto L` |
| 6 | always | `goto L` |
| 7 | never: the machine's do-nothing instruction | `nothing` |
| 8 to F | illegal | |

There is no "greater than": `if R2 < R1 signed` says it. The assembler refuses `>` and `<=` with
a sentence saying which comparison to write, and Module 10 shows why one comparison, with its
two registers swapped, is enough.

### Calls and jumps

- **A call** (kind 6, job 0) keeps the address of the next instruction in the register Y names,
  and goes to `PC + 4c`. The hardware has no return-address register of its own; the calling
  convention below chooses R15.
- **A jump** (kind 7, job 0) goes to `RA + c`. It returns from a call (`goto R15`) and goes to an
  address worked out at run time. A target that is not a multiple of 4 traps (cause 4).
- Any other job of kind 6 or 7 is illegal.

### System jobs

| J | Written | Transfers | In user mode |
| --- | --- | --- | --- |
| 0 | `call system` | a trap with cause 1 (`docs/machine.md`, "Traps and interrupts") | allowed |
| 1 | `resume` | `C0 ← C1` and `PC ← C2` | refused (cause 3) |
| 2 | `R3 <- C3` | `RY ← Cc`, where c is 0 to 4 | refused |
| 3 | `C4 <- R3` | `Cc ← RA`, where c is 0 to 4 | refused |
| 4 | `stop` | the clock stops, and the simulator says so | refused |
| 5 to F | illegal | | |

A control register number above 4 is illegal.

## Illegal instructions

An instruction is illegal when its kind is 0 or 9 to F, when its job is one its kind does not
define, or when a system job names a control register above 4. An illegal instruction changes
nothing but the trap's registers (cause 2). Before Module 12 sets a handler, the machine stops
and the simulator shows the instruction, its address and why it was refused.

## The assembly language: a proposal for Module 11

One line is one instruction, written as the transfer it makes (question 1 in `docs/machine.md`).
`<-` is typed for Module 5's arrow, and the editor may show it as `←`.

| Instruction | Written |
| --- | --- |
| register jobs | `R3 <- R1 + R2`, `R3 <- R1 - R2`, `R3 <- R1 & R2`, `R3 <- R1 \| R2`, `R3 <- R1 ^ R2`, `R3 <- R2`, `R3 <- R1 + 1`, `R3 <- R1 - 1` |
| constant jobs | `R3 <- R1 + 100`, `R3 <- R1 - 8`, `R3 <- R1 & 0xFF`, `R3 <- 25` |
| loads | `R3 <- word[R1 + 8]`, `R3 <- byte[R1]` |
| stores | `word[R1 + 8] <- R2`, `byte[R1] <- R2` |
| branches | `if R1 != R2 goto loop`, `if R1 < R2 signed goto colder`, `goto loop` |
| a call | `call square, R15` (R15 takes the return address) |
| jumps | `goto R15`, `goto R3 + 16` |
| system | `call system`, `resume`, `R3 <- C3`, `C4 <- R3`, `stop`, `nothing` |

- `R3 <- R1 + 1` and `R3 <- R1 - 1` are count up and count down, the ALU's own jobs, with no
  constant; any other number is a constant job.
- A number is decimal, or hexadecimal after `0x`; a constant from -2048 to 2047 fits, and any
  other is refused with a sentence that says the range.
- A label ends with a colon, and stands for its address: `loop:`. `//` starts a comment, as in the
  course's SystemVerilog.
- `word` and `byte` put fixed values in the ROM after the program: `limits: word -250, -184`.
- The shop's devices have names the assembler knows, which stand for their addresses:
  `display`, `lamps`, `switches`, `sensorA`, `sensorB`, `timer` and `waiting`
  (`docs/machine.md`, "Devices").

## A worked example

The office's question from Module 7: which room is colder? Show the lower of the two rooms'
readings on the display.

| Address | Instruction | Written | |
| --- | --- | --- | --- |
| `000` | `251007D8` | `R1 <- sensorA` | R1 takes room A's sensor's address, `7D8` |
| `004` | `30210000` | `R2 <- word[R1]` | room A's reading |
| `008` | `30310008` | `R3 <- word[R1 + 8]` | room B's reading, from the next device word |
| `00C` | `52023002` | `if R2 < R3 signed goto show` | room A is colder: show its reading |
| `010` | `15203000` | `R2 <- R3` | otherwise show room B's |
| `014` | `254007C0` | `show: R4 <- display` | the display's address, `7C0` |
| `018` | `40042000` | `word[R4] <- R2` | the display shows the lower reading |
| `01C` | `84000000` | `stop` | |

With room A at -184 and room B at -250 (Module 1's readings, in tenths of a degree), the branch
subtracts: -184 - (-250) is 66, so MINUS is 0 and OVER is 0, and the signed condition MINUS XOR
OVER is 0. The branch is not taken, R2 takes room B's -250, and the display shows -250: room B
is colder, at -25.0 degrees.

Read digit by digit, the branch `52023002` is kind 5 (branch), job 2 (less, signed), Y unused, A
is R2, B is R3, and the constant 2: the target is two instructions on, `014`.

## The calling convention: a proposal for Module 11

The hardware treats every register alike; these roles are an agreement between programs only.

| Register | Role |
| --- | --- |
| R0 | which service a system call asks for; free otherwise |
| R1 to R4 | a function's arguments; R1 carries its result back |
| R5 to R9 | free: a function may change them |
| R10 to R13 | kept: a function that changes one puts it back before it returns |
| R14 | the stack: the address of the word last pushed |
| R15 | the return address |

- **The stack grows down from `7C0`**, the first address past the RAM's last word. A push is
  `R14 <- R14 - 8` then `word[R14] <- R10`; a pop is `R10 <- word[R14]` then
  `R14 <- R14 + 8`. A program starts with `R14 <- 0x7C0`, so its first push writes `7B8`.
- **A function that calls another** pushes R15 first and pops it before `goto R15`.
- Checked against the commercial conventions, so no role sits on their numbers: ARM's r13 (stack),
  r14 (link) and r0 to r3 (arguments); RISC-V's x1 (return), x2 (stack) and x10 to x17
  (arguments); MIPS's 29 (stack), 31 (return) and 4 to 7 (arguments).

## System calls: a proposal for Module 12

`call system` with the service in R0, its arguments in R1 to R4 and its result in R1:

| R0 | Service |
| --- | --- |
| 1 | show R1 on the display |
| 2 | read a room's sensor: R1 is 0 for room A, 1 for room B; the reading comes back in R1 |
| 3 | set the lamps from R1's bits 2 to 0 |
| 4 | end the program |

The numbers are this course's own. Module 12 decides the services it needs; this list is the
least that gives a user program, which may not touch a device, the shop's display, sensors and
lamps.

## Left out on purpose

Each is an instruction a capstone can add: Module 9's "add a new instruction to the CPU" and
Module 10's "design, justify and implement one new instruction". Kinds 9 to F are free for them.

- **A shift.** Module 7's ALU does no shifts, since a shift is not a chain of one-bit slices; a
  shifter beside the ALU would be a new part on the datapath. Without one, a program doubles a
  number by adding it to itself.
- **"Set if less"**: `RY ← 1` if `RA < RB`, else 0, a comparison kept as a number.
- **A call through a register**: `RY ← PC + 4` and `PC ← RA + c`, for a function chosen at run
  time.
- **A comparison with zero** in one instruction, without a register that holds 0.
- **A constant wider than 12 bits**, built in two instructions today.
- **Multiplication.**
