# Module 8, the CPU datapath: the plan

Written by the managing session before the build started. The build reads it first and keeps to
it. A change to this plan is the managing session's to make; a build that needs one says so in its
module note and carries on inside the plan. `docs/plan.md` is the course plan the module comes
from, and `docs/machine.md` and `docs/isa.md`, approved at checkpoint 2, are the machine it builds.

## What the module covers

From `docs/plan.md`: the PC, fetch, the IR, the register file, choosing the ALU's inputs, the
ALU, writing the result back, the data memory, and branching. Labs: a datapath in which every bus
and every control signal can be inspected, and predictions of the machine's next state.
Capstone: run one instruction by stepping every change it makes. Reuses Modules 5 to 7.

Module 7's last lesson, `alu-tests`, ends on the question this module answers: "The ALU reads two
input words, A and B, and produces Y and four flags. Where do A and B come from? And where do Y
and the four flags go?" Module 6's last lesson, `memory-map`, ends with "A machine that reads a
list of instructions will read words it needs from a ROM, as you read the limits. It will keep the
data it works on in the RAM."

A module may be more than one lesson. Size each lesson like the existing ones and split where the
material needs it; say in the note why the split falls where it does. Every lesson has the ten
sections. The lessons are module 8, order 1 onward.

## The learner

Modules 1 to 7 are on `main`, 22 lessons, and the learner has done all of them and nothing after.
Module 0, "Meet the machine", is not built; it will use the machine Modules 8 and 9 leave, and
this build does not write it. The course's freezer shop runs through every module so far (the
freezer rooms' sensors, the office display, DOOR and WARM, the lamps ALARM, NIGHT and CLASH), and
`docs/machine.md` makes its devices the machine's. `docs/isa.md`'s worked example (which room is
colder) is the shop's question from Module 7, run as a program.

## The machine is fixed

`docs/machine.md` and `docs/isa.md` are approved, and from Module 8 on a lesson may state what they
fix. This build does not change them. If it finds something in them that cannot be built as
written, or that is wrong, it writes the question in its note, builds the closest thing that
keeps every lesson true, and carries on; if that is impossible, it pushes and stops.

What Module 8 builds of the machine:

- **The single-cycle datapath of `docs/machine.md`** ("The single-cycle datapath"), at 64 bits, for
  every instruction of kinds 1 to 7 (register jobs, constant jobs, loads, stores, branches, the
  call and the jump) and the system job `stop`. Branch job 1, `nothing`, comes with the branches.
- **The memory map whole**: the ROM, the RAM and the eight device words at their addresses, each
  device with the read and write rules of "Devices". The interrupts the timer and the door raise
  are Module 12's: in Module 8 the "waiting" bits are set as the table says, and nothing but a
  load reads them.
- **The checks**, so the machine refuses what `docs/machine.md` refuses: a fetch outside the ROM or
  not at a multiple of 4, an address the memory does not hold, a misaligned word or a byte access
  to a device, a store to the ROM or to a read-only device, and an instruction the decoder does
  not know. With no handler set, as in every module before 12, the machine stops and the
  simulator says why. The cause numbers are `docs/machine.md`'s; whether a lesson shows them is
  the build's choice.

What Module 8 does not build, because a later module teaches it:

- **Module 9, control**: how the control signals are worked out from an instruction (the decoder's
  insides), combinational and state-machine control, micro-operations, several cycles an
  instruction, an IR that is a register, and illegal instructions as a topic. Module 8 may set
  control signals by hand where a lesson teaches what each one does, and may run several
  instructions with a decoder the course supplies, drawn as a closed block that says it is closed
  until Module 9. It does not teach how a decoder works out its outputs.
- **Module 10, the instruction set**: why an instruction set, why the layout is as it is, operands
  and constants as a design question, calls as a topic, the line between the instruction set and
  the circuit that runs it. Module 8 shows an instruction's digits as the datapath uses them: K and
  J to the decoder, A, B and Y to the register file, the constant to its widening.
- **Module 11, assembly**: the assembly language, an assembler or a debugger a learner uses, the
  stack, functions and the calling convention. A lesson may write an instruction's effect as a
  register transfer, in the `register-transfer` lesson's notation.
- **Module 12, traps**: C0 to C4, the handler, `call system`, `resume`, the control-register
  instructions, user mode, interrupts.

In the single-cycle machine the IR is a named bus, the ROM's output at the PC, not a register
(`docs/machine.md`, "Registers"). A lesson that names it says what it carries and does not call it
a register; Module 9 makes it one.

## Terms

Rationed on `main` today: bit, threshold, noise margin, binary, word, unsigned, signed,
hexadecimal (`signals`); gate, truth table, Boolean expression, XOR, SystemVerilog (`gates`);
NAND, universal (`nand`); depth (`fewer-gates`); multiplexer, bus (`selectors`); decoder,
demultiplexer, encoder, comparator (`decoders`); carry, half adder, full adder, overflow, XNOR
(`adders`); ALU (`alu`); feedback, latch, transparent, edge, propagation delay, setup, hold,
metastable (`remember`); register, shift register (`registers`); counter (`counters`); register
transfer (`register-transfer`); state machine, state diagram, next-state logic
(`state-machines`); one-hot, synchronous (`state-encoding`); address, RAM (`ram`); register file
(`register-file`); byte, aligned, alignment (`bytes`); memory-mapped, ROM (`memory-map`); flag
(`flags`); boundary test, adversarial test (`alu-tests`).

- **Module 8 owns** the datapath's words. Candidates: datapath, instruction, program counter,
  fetch, branch. It rations those its lessons need and any others it chooses, within the rules
  below, and says each in its note.
- **The gate matches a word's stem followed by letters, ignoring case** (`vocabulary.ts`), so
  "instruction" also catches "instructions", and "branch" catches "branching". Three lessons on
  `main` already say "instructions" while pointing ahead to the machine (`remember`, `bytes`,
  `memory-map`), and `register-transfer` says "a branch" of an `if` chain. Rationing either word
  needs a `termExemptions` entry on each such lesson, with its reason. That is the only edit this
  build makes to a lesson on `main`, and the note lists every one.
- **Not to be rationed**: program, machine and processor, which earlier lessons use in their
  everyday sense; control signal (`memory-map` uses it, unrationed, in the sense this
  module needs); decode and decoding (the stem catches `decoders`' rationed "decoder").
- **Left for later modules**, so not rationed here: control unit, micro-operation, multi-cycle and
  instruction register (Module 9); instruction set, encoding, opcode and immediate (Module 10);
  assembly, assembler, label, stack, function, calling convention, debugger and breakpoint
  (Module 11); trap, interrupt, handler, vector, privilege, user mode, system mode and system call
  (Module 12).

## The platform this module adds

- **Memories larger than one net.** `docs/machine.md`, "What the simulator needs": a net holds at
  most 1024 bits (`packages/sim/src/values.ts`), so the `memory` primitive holds at most 1023;
  the register file at 16 words of 64 bits is 1024 bits, the ROM 8192 and the RAM 7680. Banks of
  the existing primitive, a wider net, or a primitive whose words live outside a net are all open
  to the build. Whatever it builds, a snapshot, the trace, a replay and every view must still hold
  and show a memory's contents, as they do today, and a test must hold the new part to the old
  one where both exist.
- **A ROM with a fetch port and a data port** (`docs/machine.md`: Module 6's ROM has one read).
- **An instruction-level reference**: a function that runs an instruction as `docs/isa.md` says,
  on the machine's state, in bigints. The gate-level datapath is tested against it, instruction by
  instruction, with suites in Module 7's manner (`packages/dd-model/src/testcases.ts`: normal,
  boundary, random with a seed, adversarial): every kind, every job, every branch condition at
  its boundaries, every check that stops the machine.
- **Programs as data.** A lesson's ROM may be written as lines in `docs/isa.md`'s assembly and
  turned into words by a function the build writes for authors, tested against the worked
  example's six encodings. No learner uses it: that is Module 11's assembler.
- **Level of detail.** The datapath at 64 bits opens one level at a time, as Module 7's ALU does,
  and every view reads the simulator's own nets. Every bus and control signal in the datapath can
  be inspected (the circuit view already shows a wire's name and value on a press or a tap).
- **Control signals have the course's own names**, in plain words or the signal-name style the
  course already uses (WE, EN, RST). See "Originality".
- **The check's time.** The content tests check every figure's circuit, under every fault and
  inside every block a learner can open, and the browser suite walks every page at two widths. A
  64-bit datapath that opens to many blocks multiplies that work. Choose what opens, and what is
  a closed component, with the check's time in view, as Module 7 did; say in the note what the
  module added to the check's time.

Code goes where the earlier modules put it: new code in new files where it can be; edits to
shared registries (the interactive registry, the strings files, the component library, the HDL
construct lists, `content/lessons/index.ts`) as short appends in a block of their own, with a
comment naming the module. Keep every existing figure, challenge and lesson working and their
tests green. Put every learner-facing string of a new figure into its strings file.

The shared primitives are in `packages/primitives` (`docs/platform.md`). Use them where a new
figure needs what they do. A new candidate for extraction is listed in the note, with its two
consumers, and is not extracted: the rule of two, and the author's approval for each batch.

## The SystemVerilog this module brings

For Modules 8 to 10, `docs/plan.md` unlocks module hierarchy: the CPU is written in SystemVerilog,
and the learner reads and modifies it; the graded direction is writing. The subset has no module
instances today: neither the parser nor the elaborator (`packages/hdl/src`) knows one.

- **Module 8 brings module instances**: one module used inside another, with its ports connected
  by name. The construct gets an id in `packages/hdl/src/gate.ts`, in a block marked with the
  module, and a plain refusal message, drafted like every other learner-facing string.
- **The datapath exists as text** that the learner reads, and at least one challenge has the
  learner change or complete part of it, graded by the simulator. The text and the drawn datapath
  must be the same circuit: a test runs the same suite through both.
- The constructs already taught stay gated per challenge (`allowedConstructs`), as before.

## Originality

The standard presentations are close to this module, and the feeling that one is the natural way
to teach a datapath is the signal to design another. Do not reproduce or closely follow:

- Patterson and Hennessy's single-cycle datapath, built from instruction fetch through register
  jobs, loads and stores to branches and jumps, with its control signals RegDst, ALUSrc, MemtoReg,
  RegWrite, MemRead, MemWrite, Branch and ALUOp;
- Harris and Harris's single-cycle processor, built from the load first, then the store, the
  register jobs and the branch, with RegWrite, ImmSrc, ALUSrc, MemWrite, ResultSrc, Branch, ALUOp
  and PCSrc, and their chapter order;
- Nand2Tetris's Hack CPU (project 5: the A and D registers, the ALU and the PC with its jump
  logic) and its control bits;
- LC-3's datapath and its single bus (Patt and Patel), the SAP computers (Malvino) and Ben Eater's
  breadboard computer;
- Tanenbaum's data path of registers driving an ALU through buses, if the module starts from the
  ALU and works outwards; it is a known structure, so the note names it and says what differs.

Module 7's question gives the course its own way in, and the shop's programs its own examples.
Each lesson's `originalityNote` names the textbook version of its topic and how the lesson
differs, in the same commit as the lesson.

## Branches and merging

- The build works on `module-8-datapath`, from `main` at the commit that adds this plan, and
  pushes only there. It never pushes to `main`, opens a pull request or runs the deploy workflow.
- **`main` moves during the build.** The managing session is changing two things in the drawing
  editor at the same time, both raised in Module 6's note: a new part's name sets its count apart
  from a kind that ends in a digit (`decoder-21` today), and "Tidy the layout" reserves room for a
  block's label above the block, which moves figures the automatic layout places. The first
  changes the browser specs' helpers that predict a part's name. Merge `main` into the branch
  whenever it moves, and before finishing, and run the check again after each merge.
- The managing session merges the branch into `main`: it merges `main` into it first, resolves
  what conflicts, runs the check and reads the lessons.
- The previous and next links at the bottom of each lesson follow the list of lessons, so the new
  lessons join them without any change.
