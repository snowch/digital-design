# The course machine

**Status: a draft for checkpoint 2.** The author approves this file and `docs/isa.md` before
Module 8 is built (`docs/plan.md`, checkpoint 2). Until then nothing in it is fixed, and no lesson
may state any of it. The questions the author is asked to decide are at the end; each says what
this draft recommends and why.

This file is the hardware: the registers, the memory and its map, the devices, the datapath, the
control and the traps. `docs/isa.md` is the programmer's side: the instructions, their encoding,
the assembly language and the calling convention.

## What the machine is for

One machine runs from Module 8 to Module 13 and in the two optional chapters. The brief asks for
transparency over realism, and every choice below is made for it: every part is one the learner
has built, every field of an instruction is a whole hexadecimal digit, every address fits in an
instruction, and nothing the machine does is hidden from a view the learner can open.

The machine in brief:

- **Words of N bits.** N is 64 in Modules 8 to 13, as the brief says; the same design runs at
  16 (see "Width").
- **Sixteen registers, R0 to R15, all alike.** No register is wired to a fixed value or to a
  fixed job.
- **Instructions of 32 bits, in one layout:** eight hexadecimal digits, each field a whole digit.
- **One byte-addressed memory of 2 KB:** a ROM for the program, a RAM for data and the stack,
  and the shop's devices, all at addresses from `000` to `7FF`.
- **A PC and an IR**, drawn and named.
- **Module 7's ALU**, as built: eight jobs, four flags.
- **Five control registers, C0 to C4**, for traps, interrupts and the one bit of privilege.

## Built from the learner's own parts

| Part of the machine | Built in | How it is used |
| --- | --- | --- |
| The register file: 16 words of N bits, two reads, one write | Module 6 (`register-file`: two reads, one write per edge; `registerFile` takes any size) | The instruction's A and B digits are the two read addresses; its Y digit is the write address |
| The ALU | Module 7 (`alu-jobs`, `flags`, `wide-alu`) | The job digit is the ALU's code for the two kinds of job; the flags decide branches |
| The PC | Module 5 (`registers`, `counters`) | A register that takes PC + 4 at each edge unless the instruction says otherwise |
| The ROM, the RAM and the devices at addresses | Module 6 (`memory-map`: a ROM filled from a list, a RAM, devices answering at addresses, a decoder on the address's top bits) | The machine's memory map is that capstone's, grown |
| Bytes and words | Module 6 (`bytes`) | A word's low byte at the lower address; a word's address a multiple of its size |
| The branch condition | Module 3's 4-way selector, Module 7's flags, and the XOR that turns a bit over (Module 7's operand) | See "Branches" |
| The constant | Module 1 (the signed reading) | A 12-bit constant read signed and widened to N bits |
| Multi-cycle control | Module 5 (`state-machines`, `state-encoding`) | A state machine steps an instruction through fetch, read, execute, memory and write |
| The timer | Module 5's counter, counting down (Module 7's count down) | See "Devices" |

## Width

The brief: "Width is a parameter: gate-level and register modules default to 16 bits; the CPU,
ISA and assembly modules run the same design at 64 bits." So:

- Registers, the ALU and the datapath are N bits wide, and N is 64 in Modules 8 to 13.
- An instruction is 32 bits at any N. An address is 11 bits at any N (the memory is 2 KB).
- A constant is 12 bits in the instruction, read signed and widened to N bits.
- A word in memory is N/8 bytes: 8 at N = 64. Its address must be a multiple of N/8.
- Drawn at gate level, a 64-bit datapath opens one level at a time (the brief's level-of-detail
  rule, which Module 7's 64-bit ALU already follows).

Nothing in the instruction set depends on N, so a lesson may run the machine at 16 bits where
short numbers help (question 4 below).

## Registers

- **R0 to R15**: N bits each. Every register can be read as A or B and written as Y. At reset
  their values are unknown, X, as every flip-flop's is in the course's model.
- **PC**: N bits. It holds the address of the instruction being run. At reset it is `000`.
- **IR**: 32 bits. In the single-cycle machine it is the ROM's output at the PC, a named bus, not
  a register; in the multi-cycle machine of Module 9 it is a register that takes the instruction
  at the fetch step.
- **C0 to C4**: the control registers (see "Traps and interrupts").

No register is special to the hardware. A call writes its return address into whichever register
its Y digit names; the calling convention in `docs/isa.md` chooses one by agreement only.

## Memory

One byte-addressed memory, little-endian: a word's low byte is at the lower address, as Module 6
built it. Addresses are 11 bits, `000` to `7FF`, so every address in the machine is a number
from 0 to 2047, which fits in an instruction's 12-bit constant.

| Addresses | Part | Size | Read | Written |
| --- | --- | --- | --- | --- |
| `000` to `3FF` | ROM: the program and its fixed data | 1 KB: 256 instructions, or 128 words | yes, by fetch and by load | never |
| `400` to `7BF` | RAM: data and the stack | 960 bytes: 120 words | yes | yes |
| `7C0` to `7FF` | the devices | 8 words | see "Devices" | see "Devices" |

- **Fetch reads only the ROM.** An instruction is 4 bytes at an address that is a multiple of 4.
  The PC starts at `000`.
- **Loads read any part; stores write the RAM and the writable devices.** A store to the ROM or
  to a device that takes no writes traps (cause 5), so a program that writes where it should not
  stops at the store, not later.
- **An address outside these parts traps** (cause 5). This is Module 6's guard (`ram`'s second
  challenge), built into the machine: an address past the end reaches nothing and is refused.
- **A word access at an address that is not a multiple of N/8 traps** (cause 4). A byte access
  is never misaligned. This is Module 6's alignment rule; Module 6's memory gave the aligned word
  below instead, and the machine refuses, as Module 6's own model note says some machines do.
- **At reset the RAM is unknown, X**, as Module 6's memories are. The ROM holds the program the
  assembler made for it.

Why a ROM for the program: it is Module 6's capstone, which the learner built (a ROM, a RAM and
devices, chosen by a decoder on the address); a stray store cannot overwrite the program, which
keeps Module 11's bugs where they happen; and Module 6's last reflection already tells the
learner that the machine "will read words it needs from a ROM" and "keep the data it works on in
the RAM". The cost: the machine cannot load a program into RAM and run it (question 2).

## Devices

The shop's devices, one word each, at the top of the address space. Names as the course already
uses them.

| Address | Device | Read gives | A write |
| --- | --- | --- | --- |
| `7C0` | the office display | the word it shows | sets the word it shows, read signed |
| `7C8` | the lamps | the lamps: bit 0 ALARM, bit 1 NIGHT, bit 2 CLASH | sets the lamps from bits 2 to 0 |
| `7D0` | the switches | bit 0 DOOR, bit 1 WARM | traps (cause 5) |
| `7D8` | room A's sensor | room A's reading, in tenths of a degree | traps (cause 5) |
| `7E0` | room B's sensor | room B's reading | traps (cause 5) |
| `7E8` | the timer | its count | sets its count |
| `7F0` | waiting | bit 0: the timer has reached 0; bit 1: the door has opened | a 1 in a bit clears that bit |
| `7F8` | (none) | traps (cause 5) | traps (cause 5) |

- **The timer** is a counter that counts down by one at each edge while its count is not 0, and
  sets bit 0 of "waiting" when its count goes from 1 to 0.
- **The door** sets bit 1 of "waiting" when DOOR goes from 0 to 1.
- A device's word may change without a store, as Module 6's sensor's did.
- Each device is the smallest the course's programs need. Module 12 may add a device; it does
  not change these.

## The single-cycle datapath (Module 8)

Every instruction takes one clock cycle. Between edges, the gates work out everything the
instruction does; at the edge, the registers, the PC, the RAM and the devices take their new
values together, as every circuit since Module 5 has.

The parts, and how the instruction's digits reach them (`docs/isa.md` gives the layout
`K J Y A B c c c`):

- **The ROM's fetch port** gives the instruction at the PC: the IR.
- **The register file** reads the registers named by digit A and digit B, and writes the
  register named by digit Y. No digit ever changes meaning, so no selector is needed in front of
  the register file's addresses.
- **The constant**: digits 2 to 0, read signed, widened to N bits.
- **A selector for the ALU's B input**: the register B for the register jobs and the branches;
  the constant for everything else.
- **The ALU**, whose code is the job digit's low three bits for the two kinds of job, add (`010`)
  for loads, stores and jumps, and subtract (`011`) for branches.
- **The branch condition** (below), from the ALU's flags and the job digit.
- **Two adders for the PC**: PC + 4, and PC + 4 × constant, the target of a branch or a call.
- **The memory's data port**: the address is the ALU's result; the data written is the register
  B; the size is the job digit (word or byte).
- **A 4-way selector for the word written to the register Y**: the ALU's result, the word the
  memory gives, PC + 4 (a call's return address), or a control register.
- **A selector for the next PC**: PC + 4, the target, the ALU's result (a jump), C2 (resume) or
  C4 (a trap).
- **The decoder**: the kind and the job digits in; the control signals out (the write enables, the
  selectors' choices, the ALU's code, a trap and its cause).

The flags are not kept. The ALU works them out for every instruction, and only a branch reads
them, in the cycle that made them. A program never has to remember which instruction set the
flags last, and a trap has no flags to save.

### Branches

A branch subtracts register B from register A, then a condition built from the flags decides
whether the PC takes the target. The condition is the job digit:

| Job | Condition | From the flags |
| --- | --- | --- |
| 0 | A equals B | ZERO |
| 1 | A differs from B | NOT ZERO |
| 2 | A is less than B, read signed | MINUS XOR OVER |
| 3 | A is not less than B, read signed | NOT (MINUS XOR OVER) |
| 4 | A is less than B, read unsigned | NOT COUT |
| 5 | A is not less than B, read unsigned | COUT |
| 6 | always | 1 |
| 7 | never | 0 |

As a circuit: a 4-way selector, with job bits 2 and 1 on S1 and S0, picks ZERO, MINUS XOR OVER,
NOT COUT or 1; an XOR gate with job bit 0 turns the choice over or leaves it. The signed rule is
the one the learner built as COLDER in Module 7's `flags` lesson; the unsigned rule is that
lesson's "A is less than B when COUT is 0". Job 7, "never", is what the pattern leaves; it does
nothing, and it is the machine's do-nothing instruction.

## Control: one cycle, then several (Module 9)

Module 8's control is a decoder: gates from the kind and job digits to the control signals. Module
9 keeps the instruction set and changes the timing: one memory port, an IR register, and a state
machine (Module 5) that steps each instruction through fetch, register read, ALU, memory and
register write, a step per cycle, as many steps as its kind needs. Module 9 decides the steps of
each kind and their micro-operations; this file fixes only what every step must leave the same:
the instruction's effect is the one `docs/isa.md` gives, and a trap leaves the machine as the
single-cycle machine would.

An illegal instruction (`docs/isa.md`) is decoded like any other: the decoder sees a kind or a job
it does not know and raises a trap with cause 2. In Modules 8 to 11 no handler is set, so the
machine stops and says why.

## Traps and interrupts (Module 12)

The privileged state is five control registers and nothing else:

| Register | Name | Holds | At reset |
| --- | --- | --- | --- |
| C0 | status | bit 0: 1 in system mode, 0 in user mode; bit 1: 1 while interrupts are on | `01`: system mode, interrupts off |
| C1 | saved status | C0 as it was when the last trap began | 0 |
| C2 | return point | the address `resume` goes back to | 0 |
| C3 | cause | why the last trap happened | 0 |
| C4 | handler | the address a trap goes to; 0 means no handler | 0 |

**A trap**, at the edge that ends the instruction that caused it: C2 takes the return point, C1
takes C0, C0 takes `01` (system mode, interrupts off), C3 takes the cause, and the PC takes C4.
The instruction that trapped changes nothing else: no register, no memory, no device. If C4 is 0,
the machine stops instead, and the simulator shows the cause and the PC.

**`resume`**: C0 takes C1 and the PC takes C2, at one edge.

| Cause | What happened | Return point |
| --- | --- | --- |
| 1 | `call system` | the instruction after it |
| 2 | an illegal instruction | the instruction itself |
| 3 | refused in user mode: a privileged instruction, or a device's address | the instruction itself |
| 4 | a misaligned word access, or a jump to an address that is not a multiple of 4 | the instruction itself |
| 5 | no memory there: outside the ROM, the RAM and the devices; a store to the ROM or to a read-only device; a fetch outside the ROM | the instruction itself |
| 8 | the timer (an interrupt) | the instruction not yet run |
| 9 | the door (an interrupt) | the instruction not yet run |

- **The return point is where to resume:** after a system call, the next instruction; after a
  fault, the instruction that faulted, so a handler can mend the cause and run it again, or add 4
  to skip it.
- **An interrupt** is taken at an edge between two instructions, when C0's bit 1 is 1 and a bit
  of "waiting" is 1. The instruction that would have run is not run; it is the return point.
  The timer comes first if both wait.
- **User mode refuses** `resume`, reading or writing a control register, `stop`, and every load or
  store at a device's address (cause 3). A user program reaches a device through a system call,
  which is why system calls exist.
- **Nesting**: a trap turns interrupts off, so a handler runs to its first instruction without
  another trap from outside. To allow one, it saves C1 and C2 (and the registers it uses) to
  memory, then turns interrupts on. A fault inside a handler overwrites C1 and C2; that is the
  failure Module 12 shows.
- **No vector table.** Every trap goes to C4, and the handler reads C3. One address and one cause
  register are the least state that still says why.

At reset the machine is in system mode with no handler, so Modules 8 to 11 run every program with
full access, and a trap stops the machine with its cause. Module 12 sets a handler and drops to
user mode with `resume`.

## What the simulator needs

Engineering notes for Module 8, not decisions for the author:

- **A larger memory primitive.** Module 6's `memory` keeps its words on one net, and the engine's
  words are at most 1024 bits, so one memory holds at most 1023 bits (Module 6's note). The ROM
  (8192 bits) and the RAM (7680 bits) need banks of that primitive, as Module 6's memory of bytes
  uses two, or a primitive whose words live outside a single net.
- **Level of detail.** The datapath at 64 bits opens one level at a time, as Module 7's ALU does,
  and every view reads the simulator's own nets.
- **The engine's settle** already re-evaluates only the gates whose inputs changed (Module 7's
  change, `docs/simulator.md`), which a 64-bit datapath needs.

## Originality

The brief: no RISC-V, ARM, x86 or MIPS mnemonics, encodings or register conventions, and nothing
of the Hack machine. What this design shares with known machines, and why it stays:

- **Fields on hexadecimal digits.** An old idea (octal fields on some minicomputers; hexadecimal
  in teaching machines such as Princeton's TOY). The layout here, its order (kind, job, Y, A, B,
  constant) and every code are the course's own; no other machine has Module 7's job codes.
- **Hack (Nand2Tetris).** Hack has two registers, A and D, two instruction types in 16 bits, a
  separate address space for its ROM, and an ALU driven by six control bits of its own. This
  machine has sixteen registers, one 32-bit layout, one byte-addressed memory, traps and
  privilege. It shares with Hack, as with most small microcontrollers, a program in ROM and
  devices at addresses; the course arrives at both through Module 6's capstone. It also shares an
  assignment-like assembly language (question 1).
- **RISC-V and MIPS.** They compare two registers and branch, as this machine does; here the
  comparison is Module 7's subtraction and flags, with the course's own codes. Unlike them, no
  register reads as zero (RISC-V's and MIPS's register 0) and no register is the hardware's
  return-address register (MIPS's 31, RISC-V's convention of x1, ARM's r14): a call writes the
  register its Y digit names.
- **ARM.** Sixteen registers, as ARM's 32-bit machines have; ARM's r13, r14 and r15 are its stack,
  link and PC. Here the PC is not a numbered register, and the calling convention's roles
  (`docs/isa.md`) are on other numbers.
- **LC-3 (Patt and Patel)**, the closest precedent for Module 12: eight registers, 16-bit
  instructions, condition codes N, Z and P kept after each instruction, and a trap vector table in
  memory. This machine keeps no flags, has no vector table, and has five control registers of its
  own naming.
- **Every trap mechanism** (MIPS's status, cause and EPC; RISC-V's mstatus, mcause, mepc and
  mtvec) saves a return address and a cause and jumps to a handler; so does this one, with its
  own registers, numbers and names, and its own rule for the return point.
- **An instruction of all zeros is illegal**, as in RISC-V and others: a program that runs into
  empty memory stops at once. It is a general rule of encodings, adopted for Module 11's
  debugging.

## Questions for the author

1. **The assembly language: register transfers or words?** Recommended: register transfers, as
   Module 5 writes them (`R3 <- R1 + R2`, `if R1 < R2 signed goto loop`, `R4 <- word[R1 + 8]`). An
   instruction then reads as what it does at the edge, and no commercial machine's mnemonics come
   near. The risk: Hack's assembly is assignment-like too (`D=D+A`), though on a different
   machine. The alternative is words of the course's own, which every commercial machine's
   `add`, `or` and `xor` crowd.
2. **The program in a ROM, or in the RAM?** Recommended: a ROM, for the reasons under "Memory".
   The alternative, one RAM for program and data, would let a program be loaded and changed while
   the machine runs, and lets a stray store change the program.
3. **The memory's size.** Recommended: 1 KB of ROM, 960 bytes of RAM and eight device words, so
   every address fits in one instruction's constant. Module 11's programs and the kernel chapter's
   two programs fit. A larger memory needs addresses built from two instructions, which costs
   every early program its clarity.
4. **64 bits from the first lesson of Module 8?** Recommended: yes, as the brief says, with each
   view able to read a register signed in decimal where the lesson is about numbers. The design
   runs at 16 bits unchanged if the author prefers Module 8 to start there.
5. **Branches without kept flags?** Recommended: yes, for the reasons under "Branches". The
   alternative is a flags register that every job of the ALU loads (Module 7's `flags` lesson ends
   on that idea), with branches that read it; it saves an instruction in some loops and adds state
   that every trap must save.
6. **A store to the ROM traps?** Recommended: yes, so the bug shows at the store. Module 6's shop
   memory ignored writes to its read-only parts; the machine is stricter, as Module 6's guard was.
7. **Little-endian**, as Module 6 built it and its `bytes` lesson says the machine will keep?
   Recommended: yes.

Once the author has decided, two lessons on `main` are checked against the decision: `bytes`
says the machine keeps the low byte at the lower address, and `memory-map`'s reflection says the
machine will read words from a ROM and keep its data in the RAM.
