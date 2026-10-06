# The course machine's instructions

**Status: a draft for checkpoint 2**, with `docs/machine.md`, which holds the questions for the
author. Nothing here is fixed until the author approves both files, and no lesson may state any
of it before then.

This file is the programmer's side of the machine: the layout of an instruction, what each one
does, which are illegal, the assembly language, and the calling convention. `docs/machine.md` is
the hardware. Each instruction's effect is written as register transfers, in Module 5's notation:
`←` for "takes, at the edge", every right-hand side read before the edge.

## One layout

Every instruction is 32 bits: eight hexadecimal digits, each field whole digits, in the same
place in every instruction. The digits run as data runs through the ALU in the course's drawings:
what to do, the two registers that go in, the register the result goes to, and a constant.

| Digit | Bits | Field | What it says |
| --- | --- | --- | --- |
| 7 (left) | 31 to 28 | K, the kind | what the instruction does |
| 6 | 27 to 24 | J, the job | which ALU job, which condition, which size, or which system job |
| 5 | 23 to 20 | A | the register read into the ALU's A input |
| 4 | 19 to 16 | B | the register read into the ALU's B input, or stored |
| 3 | 15 to 12 | Y | the register written |
| 2 to 0 | 11 to 0 | the constant, c | a number from -2048 to 2047, read signed, widened to 64 bits |

So the instruction `12123000` reads, digit by digit: kind 1 (a register job), job 2 (add), A is
R1, B is R2, Y is R3, constant 0. It is `R3 ← R1 + R2`.

- The A, B and Y digits are the register file's two read addresses and its write address
  (Module 6's register file), and the job digit of a job is the ALU's code (Module 7). The
  decoder never moves a field.
- A field an instruction does not use is ignored. The assembler writes 0 there.
- An instruction is stored as 4 bytes, low byte first, at an address that is a multiple of 4.

## The kinds

Every instruction also does `PC ← PC + 4`, except where the table gives the PC another value.

| K | Kind | Transfers |
| --- | --- | --- |
| 0 | none: illegal | an instruction of all zeros is illegal (cause `21`) |
| 1 | register job | `RY ← RA job RB` |
| 2 | constant job | `RY ← RA job c` |
| 3 | load | `RY ← memory[RA + c]`, or `RY ← memory[c]` |
| 4 | store | `memory[RA + c] ← RB`, or `memory[c] ← RB` |
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

| J | Size | Address |
| --- | --- | --- |
| 0 | a word, 8 bytes, at a multiple of 8 | `RA + c` |
| 1 | a byte | `RA + c` |
| 8 | a word | `c` alone: an absolute address |
| 9 | a byte | `c` alone |
| others | illegal | |

A load of a word fills RY with it; a load of a byte fills RY's low 8 bits with it and the rest
with 0s. A store of a word writes RB; a store of a byte writes RB's low 8 bits. Job bit 3 says
whether the address is absolute: the ALU's A input takes 0 instead of the register A, and the
ALU's add gives the address either way. Since every address fits in the constant, an absolute load
or store reaches any part of the memory in one instruction, and it needs no register to hold an
address: a trap handler saves its first register that way (`docs/machine.md`, "Traps and
interrupts").

The traps a load or store can meet are `31` to `34` (`docs/machine.md`): no memory at the
address, a device in user mode, a misaligned word or a byte at a device, and a store to the ROM
or to a read-only device.

### Branches

The ALU works out `RA - RB`, and the job digit chooses the condition from its flags
(`docs/machine.md`, "Branches"):

| J | Taken when | Written |
| --- | --- | --- |
| 0 | always | `goto L` |
| 1 | never: the machine's do-nothing instruction | `nothing` |
| 2 | A equals B | `if RA == RB goto L` |
| 3 | A differs from B | `if RA != RB goto L` |
| 4 | A is less than B, read unsigned | `if RA < RB unsigned goto L` |
| 5 | A is not less than B, read unsigned | `if RA >= RB unsigned goto L` |
| 6 | A is less than B, read signed | `if RA < RB signed goto L` |
| 7 | A is not less than B, read signed | `if RA >= RB signed goto L` |
| 8 to F | illegal | |

There is no "greater than": `if R2 < R1 signed` says it. The assembler refuses `>` with a
sentence saying which comparison to write, and Module 10 shows why one comparison, with its two
registers swapped, is enough. (RISC-V's manual makes the same argument; `docs/machine.md`,
"Originality".)

### Calls and jumps

- **A call** (kind 6, job 0) keeps the address of the next instruction in the register Y names,
  and goes to `PC + 4c`. The hardware has no return-address register of its own; the calling
  convention below chooses R15.
- **A jump** (kind 7, job 0) goes to `RA + c`. It returns from a call (`goto R15`) and goes to an
  address worked out at run time. A target outside the ROM or not a multiple of 4 traps at its
  fetch (`11` or `12`).
- Any other job of kind 6 or 7 is illegal.

### System jobs

| J | Written | Transfers | In user mode |
| --- | --- | --- | --- |
| 0 | `call system` | a trap with cause `41` (`docs/machine.md`, "Traps and interrupts") | allowed |
| 1 | `resume` | `C0 ← C1` and `PC ← C2` | refused (`22`) |
| 2 | `R3 <= C3` | `RY ← Cc`, where c is 0 to 4 | refused (`22`) |
| 3 | `C4 <= R3` | `Cc ← RA`, where c is 0 to 4 | refused (`22`) |
| 4 | `stop` | the clock stops, and the simulator says so | refused (`22`) |
| 5 to F | illegal | | |

A control register number outside 0 to 4 is illegal; the constant is read signed, so -1 is
outside too.

## Illegal instructions

An instruction is illegal when its kind is 0 or 9 to F, when its job is one its kind does not
define, or when a system job names a control register outside 0 to 4. An illegal instruction
changes nothing but the trap's registers (cause `21`), and it wins over `22` when both apply.
Before Module 12 sets a handler, the machine stops, and the simulator shows the instruction, its
address and why it was refused.

## The assembly language: a proposal for Module 11

One line is one instruction, written as the transfer it makes, with Module 5's arrow as text:
`<=`, which the `register-transfer` lesson calls "the transfer arrow written as text"
(question 1 in `docs/machine.md`).

| Instruction | Written |
| --- | --- |
| register jobs | `R3 <= R1 + R2`, `R3 <= R1 - R2`, `R3 <= R1 & R2`, `R3 <= R1 \| R2`, `R3 <= R1 ^ R2`, `R3 <= R2`, `R3 <= R1 + 1`, `R3 <= R1 - 1` |
| constant jobs | `R3 <= R1 + 100`, `R3 <= R1 - 8`, `R3 <= R1 & 0xFF`, `R3 <= 25` |
| loads | `R3 <= word[R1 + 8]`, `R3 <= byte[R1]`, `R3 <= word[sensorA]` |
| stores | `word[R1 + 8] <= R2`, `byte[R1] <= R2`, `word[display] <= R2` |
| branches | `if R1 != R2 goto loop`, `if R1 < R2 signed goto colder`, `goto loop` |
| a call | `call square, R15` (R15 takes the return address) |
| jumps | `goto R15`, `goto R3 + 16` |
| system | `call system`, `resume`, `R3 <= C3`, `C4 <= R3`, `stop`, `nothing` |

- **A name stands for an address.** `word[sensorA]` is the word at room A's sensor; `R1 <= table`
  puts the address of the label `table` in R1, and `R1 <= word[table]` the word there.
- `R3 <= R1 + 1` and `R3 <= R1 - 1` are count up and count down, the ALU's own jobs, with no
  constant; any other number is a constant job.
- A number is decimal, or hexadecimal after `0x`; a constant from -2048 to 2047 fits, and any
  other is refused with a sentence that says the range.
- A label ends with a colon. `//` starts a comment, as in the course's SystemVerilog.
- `word` and `byte` put fixed values in the ROM: `limits: word -250, -184`. A `word` starts at a
  multiple of 8, with 0s before it where needed. The assembler fills the ROM after the program
  and its data with 0s, so a program that runs off its end runs its data as instructions, then
  stops at the first all-zero instruction; a program ends with `stop`.
- The shop's devices have names the assembler knows, which stand for their addresses:
  `display`, `lamps`, `signals` (DOOR and WARM), `sensorA`, `sensorB`, `timer` and `waiting`
  (`docs/machine.md`, "Devices").

## A worked example

The office's question from Module 7: which room is colder? Show the lower of the two rooms'
readings on the display.

| Address | Instruction | Written | |
| --- | --- | --- | --- |
| `000` | `380027D8` | `R2 <= word[sensorA]` | room A's reading, from the word at `7D8` |
| `004` | `380037E0` | `R3 <= word[sensorB]` | room B's reading, from `7E0` |
| `008` | `56230002` | `if R2 < R3 signed goto show` | room A is colder: show its reading |
| `00C` | `15032000` | `R2 <= R3` | otherwise show room B's |
| `010` | `480207C0` | `show: word[display] <= R2` | the display, at `7C0`, shows the lower reading |
| `014` | `84000000` | `stop` | |

With room A at -184 and room B at -250 (Module 1's readings, in tenths of a degree), the branch
subtracts: -184 - (-250) is 66, so MINUS is 0 and OVER is 0, and the signed condition MINUS XOR
OVER is 0. The branch is not taken, R2 takes room B's -250, and the display shows -250: room B
is colder, at -25.0 degrees.

Read digit by digit, the branch `56230002` is kind 5 (branch), job 6 (less, signed), A is R2, B is
R3, Y unused, and the constant 2: the target is two instructions on, `010`. The load `380027D8` is
kind 3 (load), job 8 (a word, absolute), A and B unused, Y is R2, and the address `7D8`.

## The calling convention: a proposal for Module 11

The hardware treats every register alike; these roles are an agreement between programs only.

| Register | Role |
| --- | --- |
| R0 | free |
| R1 to R4 | a function's arguments; R1 carries its result back; for a system call, R1 says which service |
| R5 to R9 | free: a function may change them |
| R10 to R13 | kept: a function that changes one puts it back before it returns |
| R14 | the stack: the address of the word last pushed |
| R15 | the return address |

- **The stack grows down from `7C0`**, the first address past the RAM's last word. A push is
  `R14 <= R14 - 8` then `word[R14] <= R10`; a pop is `R10 <= word[R14]` then
  `R14 <= R14 + 8`. A program starts with `R14 <= 0x7C0`, so its first push writes `7B8`.
- **A function that calls another** pushes R15 first and pops it before `goto R15`.
- **Against the commercial conventions:** with sixteen registers, every number has some role in
  some convention, so what this one must not do is follow any of them. It follows none, though
  numbers coincide: ARM passes arguments in r0 to r3 and keeps r4 to r11, with r13 the stack and
  r14 the link; RISC-V's return address is x1 and its stack x2, with arguments from x10 and
  temporaries in x5 to x7; MIPS passes arguments in 4 to 7, with temporaries from 8, the stack in
  29 and the return address in 31; x86-64 passes arguments in its registers 7, 6, 2, 1, 8 and 9,
  returns results in register 0, and its Linux puts the system-call number in register 0 too.
  Here R1 to R3 are arguments as ARM's r1 to r3 are, R4 as MIPS's 4 is, R5 to R9 are free as
  RISC-V's x5 to x7 and MIPS's 8 and 9 are, and R10 and R11 are kept as ARM's are. Module 11
  designs the convention it teaches, and may move any of these.

## System calls: a proposal for Module 12

`call system` with the service in R1, its arguments in R2 to R4, and its result in R1, as for a
function whose first argument says which service:

| R1 | Service |
| --- | --- |
| 1 | show R2 on the display |
| 2 | read a room's sensor: R2 is 0 for room A, 1 for room B; the reading comes back in R1 |
| 3 | set the lamps from R2's bits 2 to 0 |
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
