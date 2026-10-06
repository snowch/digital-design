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
transparency over realism, and the choices below are made for it: the machine is built from parts
the learner has built, every field of an instruction is whole hexadecimal digits, every address
fits in an instruction, and nothing the machine does is hidden from a view the learner can open.

The machine in brief:

- **Words of 64 bits** in Modules 8 to 13, as the course's plan says (the CPU modules run the
  design at 64 bits; `docs/notes/modules-5-6-7-plan.md`).
- **Sixteen registers, R0 to R15, all alike.** No register is wired to a fixed value or to a
  fixed job.
- **Instructions of 32 bits, in one layout:** eight hexadecimal digits, each field whole digits.
- **One byte-addressed memory of 2 KB:** a ROM for the program, a RAM for data and the stack,
  and the shop's devices, at addresses `000` to `7FF`.
- **A PC and an IR**, drawn and named.
- **Module 7's ALU**, as built: eight jobs, four flags.
- **Five control registers, C0 to C4**, for traps, interrupts and the one bit of privilege.

## Built from the learner's own parts

| Part of the machine | Built in | How it is used |
| --- | --- | --- |
| The register file: 16 words, two reads, one write | Module 6 (`register-file`: two reads, one write per edge) with Module 5's registers | The instruction's A and B digits are the two read addresses; its Y digit is the write address |
| The ALU | Module 7 (`alu-jobs`, `flags`, `wide-alu`) | The job digit is the ALU's code for the two kinds of job; the flags decide branches |
| The PC | Module 5 (`registers`, `counters`) | A register that takes PC + 4 at each edge unless the instruction says otherwise |
| The ROM, the RAM and the devices at addresses | Module 6 (`memory-map`: a ROM filled from a list, a RAM, devices answering at addresses, a decoder on the address's top bits) | The machine's memory map is that capstone's, grown |
| Bytes and words | Module 6 (`bytes`) | A word's low byte at the lower address; a word's address a multiple of 8 |
| An address past the end refused | Module 6 (`ram`'s guard challenge) | Every address the memory does not hold traps |
| The branch condition | Module 3's 4-way selector, Module 7's flags, and the XOR that turns a bit over (Module 7's second word) | See "Branches" |
| Multi-cycle control | Module 5 (`state-machines`, `state-encoding`) | A state machine steps an instruction through fetch, read, execute, memory and write |
| The timer | Module 5's counter, counting down (Module 7's count down) | See "Devices" |

Module 8 builds a few small parts of its own from these: the constant's widening (bit 11 copied
into the top bits, which Module 1's signed reading explains), the checks on an address, the logic
that chooses a trap's cause, and selectors with more inputs than Module 3's (each made of Module
3's). They are listed under "The single-cycle datapath".

## Width

Registers, the ALU and the datapath are 64 bits wide. An instruction is 32 bits, and its constant
is 12 bits, read signed and widened to 64. A word in memory is 8 bytes, at an address that is a
multiple of 8.

The instruction set does not depend on the width; the memory map does (the devices are a word
apart), so the machine is specified at 64 bits only. Drawn at gate level, the 64-bit datapath
opens one level at a time, the brief's level-of-detail rule, as Module 7's 64-bit ALU does.

## Registers

- **R0 to R15**: 64 bits each. Every register can be read as A or B and written as Y. Nothing
  resets them: at power-on their values are unknown, X, as every flip-flop's is in the course's
  model until something sets it.
- **PC**: 64 bits. It holds the address of the instruction being run. At reset it is `000`.
- **IR**: 32 bits. In the single-cycle machine it is the ROM's output at the PC, a named bus, not
  a register; in the multi-cycle machine of Module 9 it is a register that takes the instruction
  at the fetch step.
- **C0 to C4**: the control registers (see "Traps and interrupts").

No register is special to the hardware. A call writes its return address into whichever register
its Y digit names; the calling convention in `docs/isa.md` chooses one by agreement only.

## Memory

One byte-addressed memory, little-endian: a word's low byte is at the lower address, as Module 6
built it. Its parts lie at addresses `000` to `7FF`, so every address in the machine is a number
from 0 to 2047, which an instruction's 12-bit constant holds.

| Addresses | Part | Size | Read | Written |
| --- | --- | --- | --- | --- |
| `000` to `3FF` | ROM: the program and its fixed data | 1 KB: 256 instructions, or 128 words | by fetch and by load | never |
| `400` to `7BF` | RAM: data and the stack | 960 bytes: 120 words | by load | by store |
| `7C0` to `7FF` | the devices | 8 words | see "Devices" | see "Devices" |

- **An address is the whole 64-bit value.** Any value outside these parts traps (cause `31`),
  however many bits it has: `800` does not wrap round to `000`. This is Module 6's guard, built
  into the machine, where Module 6's failure experiment showed the alternative.
- **Fetch reads only the ROM**: 4 bytes, at an address that is a multiple of 4. The PC starts at
  `000`.
- **Loads read any part; stores write the RAM and the writable devices.** A store to the ROM or
  to a read-only device traps (cause `34`), so a program that writes where it should not stops at
  the store, not later.
- **A word access at an address that is not a multiple of 8 traps** (cause `33`). A byte access to
  the ROM or the RAM is never misaligned. Module 6's memory gave the aligned word below instead;
  the machine refuses, as Module 6's own model note says some machines do.
- **At power-on the RAM is unknown, X**, as Module 6's memories are. The ROM holds what the
  assembler made for it.

Why a ROM for the program: it is Module 6's capstone, which the learner built (a ROM, a RAM and
devices, chosen by a decoder on the address); a stray store cannot overwrite the program, which
keeps Module 11's bugs where they happen; and Module 6's last reflection already tells the
learner that the machine "will read words it needs from a ROM" and "keep the data it works on in
the RAM". The cost: the machine cannot load a program into RAM and run it (question 3).

## Devices

The shop's devices, one word each, at the top of the memory. A device answers word accesses only.

| Address | Device | Read gives | A write | At reset |
| --- | --- | --- | --- | --- |
| `7C0` | the office display | the word it shows | sets the word it shows, read signed | 0 |
| `7C8` | the lamps | bit 0 ALARM, bit 1 NIGHT, bit 2 CLASH | sets the lamps from bits 2 to 0 | 0 |
| `7D0` | DOOR and WARM | bit 0 DOOR, bit 1 WARM, as Module 2 defines them | traps (`34`) | |
| `7D8` | room A's sensor | room A's reading, in tenths of a degree | traps (`34`) | |
| `7E0` | room B's sensor | room B's reading | traps (`34`) | |
| `7E8` | the timer | its count | sets its count | 0 |
| `7F0` | waiting | bit 0: the timer has reached 0; bit 1: the door has opened | a 1 in a bit clears that bit | 0 |
| `7F8` | none | traps (`31`) | traps (`31`) | |

- **The timer counts instructions**, not edges: its count goes down by one each time an
  instruction finishes, while the count is not 0, and bit 0 of "waiting" is set when the count
  goes from 1 to 0. So the single-cycle machine and Module 9's machine, which takes several edges
  an instruction, reach the same interrupt at the same instruction. A write replaces the count.
- **The door** sets bit 1 of "waiting" at an edge where DOOR is 1 and was 0 at the edge before.
- **A set and a clear of the same bit at one edge**: the set wins, so no event is lost.
- **A byte access to a device traps** (`33`).
- A device's word may change without a store, as Module 6's sensor's did.
- Each device is the smallest the course's programs need. Module 12 may add one; it does not
  change these.

## The single-cycle datapath (Module 8)

Every instruction takes one clock cycle. Between edges, the gates work out everything the
instruction does; at the edge, the registers, the PC, the control registers, the RAM and the
devices take their new values together, as every circuit since Module 5 has.

The instruction's layout is `K J A B Y c c c` (`docs/isa.md`): kind, job, the two registers that
go in, the register the result goes to, and the constant. The parts, and where they come from:

- **The ROM's fetch port** gives the 4 bytes at the PC: the IR. (A ROM with a fetch port and a data
  port is new: Module 6's ROM has one read.)
- **The fetch checks**: the PC is inside the ROM and a multiple of 4 (causes `11`, `12`). New.
- **The register file** reads the registers named by digits A and B and writes the register named
  by digit Y. No digit ever changes meaning, so no selector stands in front of its addresses.
- **The constant**: digits 2 to 0, widened to 64 bits by copying bit 11 into bits 63 to 12. New.
- **A selector for the ALU's A input**: the register A, or 0 for an address given by the constant
  alone (an absolute load or store). Module 3's selector, one per bit.
- **A selector for the ALU's B input**: the register B for the register jobs and the branches;
  the constant for everything else.
- **The ALU**, whose code is the job digit's low three bits for the two kinds of job, add (`010`)
  for loads, stores and jumps, and subtract (`011`) for branches.
- **The branch condition** (below), from the ALU's flags and the job digit.
- **Two adders for the PC**: PC + 4, and PC + 4 × constant, the target of a branch or a call.
- **The memory's data port**: the address is the ALU's result; the data written is the register
  B; the size is the job digit (word or byte). Module 6's decoder on the address chooses the ROM,
  the RAM or a device.
- **The address checks**: the address against the map, its alignment, and C0's mode (causes `31`
  to `34`). New, from Module 6's guard.
- **A 4-way selector for the word written to the register Y**: the ALU's result, the word the
  memory gives, PC + 4 (a call's return address), or a control register.
- **A 5-way selector for the next PC**: PC + 4, the target, the ALU's result (a jump), C2
  (`resume`) or C4 (a trap). Made of Module 3's selectors.
- **The control registers** and the selectors in front of them: C0 takes `01` on a trap, C1 on
  `resume`, or the register A on a write; C1 takes C0 on a trap; C2 takes the return point; C3
  takes the cause; C4 takes the register A.
- **The decoder**: the kind and job digits, the constant (for a control register's number) and
  C0's mode in; the control signals and the decode causes (`21`, `22`) out.
- **The trap logic**: every cause, the interrupts waiting and C0's bit 1 in; whether this edge
  traps, and with which cause, out (see "Traps and interrupts"). New.
- **The devices**: the display, lamps and waiting registers and the timer (Module 5's registers and
  counter).

The flags are not kept. The ALU works them out for every instruction, and only a branch reads
them, in the cycle that made them. A program never has to remember which instruction set the
flags last, and a trap has no flags to save.

### Branches

A branch subtracts register B from register A, and a condition built from the flags decides
whether the PC takes the target. The condition is the job digit:

| Job | Condition | From the flags |
| --- | --- | --- |
| 0 | always | 1 |
| 1 | never | 0 |
| 2 | A equals B | ZERO |
| 3 | A differs from B | NOT ZERO |
| 4 | A is less than B, read unsigned | NOT COUT |
| 5 | A is not less than B, read unsigned | COUT |
| 6 | A is less than B, read signed | MINUS XOR OVER |
| 7 | A is not less than B, read signed | NOT (MINUS XOR OVER) |

As a circuit: a 4-way selector, with job bits 2 and 1 on S1 and S0, picks 1, ZERO, NOT COUT or
MINUS XOR OVER; an XOR gate with job bit 0 turns the choice over or leaves it, the trick Module 7's
second word uses. The order is the course's: the unconditional first, then equality, then the
unsigned reading before the signed, as Module 1 taught them. The signed rule is the one the
learner built as COLDER in Module 7's `flags` lesson; the unsigned rule is that lesson's "A is less
than B when COUT is 0". Job 1, "never", is what the pattern leaves; it does nothing, and it is the
machine's do-nothing instruction.

## Control: one cycle, then several (Module 9)

Module 8's control is a decoder: gates from the kind and job digits to the control signals. Module
9 keeps the instruction set and changes the timing: one memory port, an IR register, and a state
machine (Module 5) that steps each instruction through fetch, register read, ALU, memory and
register write, a step per cycle, as many steps as its kind needs. Module 9 decides the steps of
each kind; this file fixes only what every step must leave the same: each instruction's effect is
the one `docs/isa.md` gives, and a trap leaves the machine as the single-cycle machine would.

An illegal instruction (`docs/isa.md`) is decoded like any other: the decoder sees a kind or a job
it does not know and raises cause `21`. In Modules 8 to 11 no handler is set, so the machine
stops and says why.

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
The instruction that trapped changes nothing else: no register, no memory, no device. The machine
stops instead, and the simulator shows the cause and the PC, in two cases: when C4 is 0, and when
the trap is at the address C4 holds, since a handler that cannot run its own first instruction
would trap for ever.

**`resume`**: C0 takes C1 and the PC takes C2, at one edge.

The cause is two hexadecimal digits: the first says which step of the instruction failed, the
second why. When two causes meet in one instruction, the lower number wins, which is the first
check to fail in the order the steps run.

| Cause | What happened | Return point |
| --- | --- | --- |
| `11` | fetch: no instruction at the PC (outside the ROM) | the PC |
| `12` | fetch: the PC is not a multiple of 4 | the PC |
| `21` | decode: an illegal instruction | the instruction |
| `22` | decode: an instruction user mode may not run | the instruction |
| `31` | memory: no memory at the address | the instruction |
| `32` | memory: a device's address, in user mode | the instruction |
| `33` | memory: a word not at a multiple of 8, or a byte access to a device | the instruction |
| `34` | memory: a store to the ROM or to a read-only device | the instruction |
| `41` | `call system` | the instruction after it |
| `81` | the timer (an interrupt) | the instruction not yet run |
| `82` | the door (an interrupt) | the instruction not yet run |

- **The return point is where to resume.** After a fault (`1x` to `3x`), it is the instruction
  that faulted, so a handler can mend the cause and run it again, or add 4 to skip it. After a
  system call, it is the next instruction. A jump or a return to a bad address succeeds, and the
  fetch at the new PC traps (`11` or `12`), with that PC as the return point.
- **An interrupt** is taken at an edge between two instructions, when C0's bit 1 is 1 and a bit
  of "waiting" is 1. The instruction that would have run is not run; it is the return point.
  The timer comes first if both wait.
- **User mode refuses** `resume`, reading or writing a control register, `stop` (cause `22`), and
  every load or store at a device's address (cause `32`). A user program reaches a device through a
  system call, which is why system calls exist.
- **A handler saves state with absolute stores**, at addresses the constant gives, so it needs no
  register to hold an address: `word[0x400] <= R1` stores R1 before anything has changed R1. Then
  it may copy C1 and C2 through a saved register to memory too, and turn interrupts on. The save
  area is in the RAM, which a user program can also write: the machine protects its devices and
  control registers, not its RAM.
- **Nesting**: a trap turns interrupts off, so a handler runs with interrupts off until it turns
  them on. A fault inside a handler overwrites C1 and C2; that is the failure Module 12 shows.
- **One handler address.** Every trap goes to C4, and the handler reads C3. Module 12's list
  names vectors; a table of handler addresses by cause is question 6.

At reset the machine is in system mode with no handler, so Modules 8 to 11 run every program with
full access, and a trap stops the machine with its cause. Module 12 sets a handler and drops to
user mode with `resume`.

## What the simulator needs

Engineering notes for Module 8, not decisions for the author:

- **Memories larger than one net.** Module 6's `memory` keeps its words on one net, and the
  engine's words are at most 1024 bits, so one memory holds at most 1023 bits (Module 6's note).
  The register file at 16 words of 64 bits is 1024 bits, one too many: it is built from Module 5's
  registers, or from a primitive whose words live outside a single net. The ROM (8192 bits) and
  the RAM (7680 bits) need banks of at most 1023 bits each (16 banks of 64 bytes for the ROM), or
  that primitive.
- **Level of detail.** The datapath at 64 bits opens one level at a time, as Module 7's ALU does,
  and every view reads the simulator's own nets.
- **The engine's settle** already works out only the gates whose inputs changed (Module 7's
  change, `docs/simulator.md`), which a 64-bit datapath needs.

## Originality

The brief: no RISC-V, ARM, x86 or MIPS mnemonics, encodings or register conventions, and nothing
of the Hack machine. CLAUDE.md adds: a known structure, once noticed, is named and changed or
kept on purpose. What this design shares with known machines:

- **TOY**, the teaching machine of Princeton's introductory course: sixteen registers, 16-bit
  instructions of four hexadecimal digits (an operation, then the destination, then two sources),
  every address inside an instruction, input and output at the top address, and an instruction of
  all zeros that halts. This machine shares the hexadecimal fields over sixteen registers, every
  address in an instruction, devices at the top, and an all-zero instruction that stops the
  program (here as an illegal one). It differs in its width (32-bit instructions over 64-bit
  words), its field order (the two registers that go in, then the one the result goes to, as data
  flows through the ALU in the course's drawings), its job digit (Module 7's ALU codes), a
  constant in every instruction, byte addressing, a ROM and a RAM, compare-and-branch, traps and
  privilege. Question 2 asks whether to keep the hexadecimal layout.
- **Hack (Nand2Tetris).** Hack has two registers, A and D, two instruction types in 16 bits, a ROM
  in an address space of its own, and an ALU driven by six control bits. Its jump field gives
  eight conditions, never and always among them, read from the flags of the same instruction's
  ALU result, and nothing keeps the flags. This machine's branches share that last pattern:
  eight conditions with never and always, from the flags of the branch's own subtraction, none
  kept. It also shares a program in ROM and devices at addresses (as do most small
  microcontrollers), and an assignment-like assembly language (question 1). It differs in its
  sixteen registers, one 32-bit layout, one byte-addressed memory, two-register comparisons read
  signed or unsigned, traps and privilege.
- **RISC-V.** Its six branches compare two registers (equal, not equal, less and not less, signed
  and unsigned), the pairs told apart by one bit; its jump-and-link writes any register, and its
  jump through a register is the call this machine leaves out; its manual gives the reason for
  having no "greater than" that `docs/isa.md` gives; an instruction of all zeros is illegal; and
  its trap registers (mstatus, mepc, mcause, mtvec) and mret match C0 to C4 and `resume`, with C1
  as mstatus's saved bits, as any minimal trap mechanism's do. This machine's conditions are in
  its own order (above), its causes are numbered by step, and no code is RISC-V's.
- **ARM.** Its condition field pairs each condition with its opposite by the lowest bit and ends
  on always and never; the pairing here is the same trick, which Module 7's XOR gives. ARM's
  32-bit machines have sixteen registers, with r13, r14 and r15 as stack, link and PC; here the PC
  is not a numbered register and the convention's roles are on other numbers. ARM's BL always
  writes r14; this call writes the register Y names.
- **MIPS.** It compares two registers only for equality; its jal always writes register 31; its
  status, cause and EPC registers are another minimal trap mechanism.
- **x86.** Its rule for the return point is this machine's: a fault returns to the instruction
  that faulted, a trap such as a system call to the next.
- **LC-3 (Patt and Patel)**, the closest precedent for Module 12: its devices sit at the top of
  memory, user programs reach them through trap routines, and its third edition refuses them in
  user mode. This machine does the same. LC-3 has eight registers, 16-bit instructions, condition
  codes N, Z and P set whenever a register is written, and a table of trap vectors in memory; this
  machine keeps no flags and has one handler address (question 6).
- **Analog Devices' Blackfin** writes its assembly as assignments (`R0 = R1 + R2;`,
  `R0 = [P1 + 8];`, `IF CC JUMP loop;`), as `docs/isa.md` proposes (question 1).

## Questions for the author

1. **The assembly language: register transfers or words?** Recommended: register transfers, in
   Module 5's text form (`R3 <= R1 + R2`, `if R1 < R2 signed goto loop`, `R4 <= word[R1 + 8]`). An
   instruction then reads as what it does at its edge, with the arrow the learner already has.
   Hack (`D=D+A`) and Blackfin (`R0 = R1 + R2;`) write assignments too, on other machines. The
   alternative is words of the course's own, which every commercial machine's `add`, `or` and
   `xor` crowd.
2. **The hexadecimal layout.** Recommended: keep it, for transparency, with the differences from
   TOY listed above. The alternative is a binary layout, whose fields a learner cannot read off a
   hexadecimal instruction.
3. **The program in a ROM, or in the RAM?** Recommended: a ROM, for the reasons under "Memory".
   The alternative, one RAM for program and data, lets a program be loaded and changed while the
   machine runs, and lets a stray store change the program.
4. **The memory's size.** Recommended: 1 KB of ROM, 960 bytes of RAM and eight device words, so
   every address fits in one instruction's constant: room for a program of a few hundred
   instructions and a hundred words of data and stack. A larger memory needs addresses built from
   two instructions.
5. **Branches without kept flags?** Recommended: yes, for the reasons under "Branches". The
   alternative is a flags register that every job loads (Module 7's `flags` lesson's model note
   says many processors keep their flags), with branches that read it; it saves an instruction in
   some loops and adds state that every trap must save.
6. **One handler address, or vectors?** Recommended: one address, C4, with the cause in C3; the
   word "vector" can name C4 when Module 12 teaches it. The alternative is a table of handler
   addresses by cause, as LC-3 has, which Module 12's list of topics names.
7. **A store to the ROM traps?** Recommended: yes, so the bug shows at the store. Module 6's shop
   memory ignored writes to its read-only parts; the machine is stricter, as Module 6's guard was.
8. **Little-endian**, as Module 6 built it and its `bytes` lesson says the machine will keep?
   Recommended: yes.

Once the author has decided, two lessons on `main` are checked against the decision: `bytes`
says the machine keeps the low byte at the lower address, and `memory-map`'s reflection says the
machine will read words from a ROM and keep its data in the RAM.
