# Module 9, control: the plan

Written by the managing session before the build started, as Module 8's was. The build reads it
first and keeps to it. A change to this plan is the managing session's to make; a build that needs
one says so in its module note and carries on inside the plan. `docs/plan.md` is the course plan
the module comes from, and `docs/machine.md` and `docs/isa.md`, approved at checkpoint 2, are the
machine it continues.

## What the module covers

From `docs/plan.md`: control signals, decoding, combinational and state-machine control,
micro-operations, several edges an instruction, and illegal instructions. Labs: four views of one
run, linked (the instruction, its micro-operations, the control signals, the circuit). Capstone:
add a new instruction to the CPU. Reuses Module 5's state machines and Module 8's datapath.

Module 8's last lesson, `branches`, ends on the question this module answers: "The datapath
works, but how does the decoder work out those signals from K and J alone?" Its first two lessons
had the learner set WRITEY and BCONST by hand, and from its third the decoder, drawn closed, set
them.

A module may be more than one lesson. Size each lesson like the existing ones and split where the
material needs it; say in the note why the split falls where it does. Every lesson has the ten
sections. The lessons are module 9, order 1 onward.

## The learner

Modules 1 to 8 are on `main`, 27 lessons, and the learner has done all of them and nothing after.
Module 0, "Meet the machine", is not built, and this build does not write it. The shop's story
runs on: the rooms' sensors, the display, the lamps, DOOR and WARM, and the programs Module 8 ran
(the margin, which room is colder, the sum by a loop, a call and its return).

## What Module 9 builds of the machine

`docs/machine.md`, "Control: one cycle, then several (Module 9)", fixes what Module 9 builds and
leaves the rest to it. This build does not change `docs/machine.md` or `docs/isa.md`; a question
about them goes in the note, as in Module 8.

- **The decoder, opened.** The gates from K and J to the control signals, as combinational
  control: the learner sees why each control signal is what it is for each kind, and builds or
  writes the decoder. It also decides the decode cause, `21` for an illegal instruction.
- **The check on a control register's number** (`docs/plan.md`, the decision of 6 October 2026,
  "two details of the machine"). `docs/isa.md` makes a system job that names a control register
  outside 0 to 4 illegal. Module 8 left it out because it needs the constant as one of the
  decoder's inputs, a wire Module 8 could not explain. Module 9's decoder takes the constant and
  makes the check; the reference makes it too. Module 8's lessons keep their decoder of K and J,
  and their figures and tests stay as they are.
- **Several edges an instruction.** One memory port, an IR that is a register, and a state machine
  (Module 5's) that takes each instruction through fetching, reading its registers, the ALU, the
  memory and writing its result, one edge each, as many as its kind needs. The build decides each
  kind's sequence, and any registers it needs between them, and says why in the note. What every
  instruction must leave is fixed: the effect `docs/isa.md` gives, and a stop that leaves the
  machine as the single-cycle machine would. The timer counts instructions, not edges, so both
  machines reach the same count at the same instruction (`docs/machine.md`, "Devices").
- **The four views of one run**: an instruction as a register transfer, the micro-operations its
  edges make, the control signals at each edge, and the circuit, linked, so a learner who steps an
  edge sees all four move together and can open the circuit's parts.
- **The capstone: one new instruction, end to end.** The learner adds an instruction in their own
  copy of the machine's text: its decoder row, any datapath change, and its sequence of edges,
  tested by the simulator. The plan recommends **a call through a register** (`docs/isa.md`,
  "Left out on purpose"): `RY ← PC + 4` and `PC ← RA + c`. It needs no new datapath part, only new
  control (Module 8's call already writes PC + 4 into Y, and its jump already takes the ALU's
  result into PC), which suits a module about control. The build may choose another from that
  list and says why. The instruction lives in the learner's copy: `docs/isa.md` does not change,
  and kinds 9 to F stay free for Module 10's capstone, which designs one.

What Module 9 does not build, because a later module teaches it:

- **Module 10, the instruction set**: why an instruction set, why the layout is as it is, operands
  and constants as a design question, the line between the instruction set and the circuit that
  runs it (Module 9 will have shown two circuits running one instruction set; it may say so, and
  leaves the argument to Module 10), and designing an instruction.
- **Module 11, assembly**: the assembly language, an assembler or debugger a learner uses, the
  stack, functions and the calling convention.
- **Module 12, traps**: C0 to C4, the handler, `call system`, `resume`, the control-register
  instructions' work, user mode, interrupts. System jobs 1 to 3 still stop the machine as a job a
  later module builds, once the check on their number has passed.

## Terms

Rationed on `main` today, Modules 1 to 7: as `docs/notes/module-8-plan.md` lists them. Module 8
added instruction and datapath (`instructions`), program counter and fetch (`fetch`), and branch
(`branches`).

- **Module 9 owns** the control words. Candidates: control unit, micro-operation, instruction
  register, illegal instruction. It rations those its lessons need and any others it chooses,
  within the rules below, and says each in its note.
- **The gate matches a word's stem followed by letters, ignoring case.** `fetch` (lesson 8.3)
  already says "illegal instruction" for cause 21; rationing it needs a `termExemptions` entry
  there, with its reason. That and any like it are the only edits this build makes to a lesson on
  `main`, and the note lists every one.
- **Words with two meanings.** "Step" means one step of the settle model in Module 8's figures
  ("The last edge, step by step"); do not use it for the stages of an instruction on a page that
  can show both. "State" means a state machine's state and the machine's registers (CLAUDE.md).
  "Cycle" appears in no lesson yet; if the module uses it, it means the time from one rising edge
  to the next and nothing else, and it is defined where it is first used.
- **Not to be rationed**: step, decode and decoding (the stem catches "decoder"), controller
  (Module 5's word for the retry controller), program, machine, control signal.
- **Left for later modules**, so not rationed here: instruction set, encoding, opcode and immediate
  (Module 10); assembly, assembler, label, stack, function, calling convention, debugger and
  breakpoint (Module 11); trap, interrupt, handler, vector, privilege, user mode, system mode and
  system call (Module 12).

## The platform this module adds

- **The multi-cycle machine at 64 bits**, from Module 8's parts and Module 5's state machine, with
  one memory port (Module 8's memory has two reads: the fetch and the data).
- **The reference keeps the effect.** The instruction-level reference
  (`packages/dd-model/src/machine.ts`) is what both machines must agree with, instruction by
  instruction. The multi-cycle machine is tested against it on the suite Module 8 built
  (`machine-suite.ts`), compared after every instruction, not every edge, with each kind's edge
  count checked too. The reference makes the control-register check as well. Module 8's stages,
  whose decoder does not, must still pass their own comparisons; how (a program those stages are
  not given, or a reference told which machine it stands for) is the build's choice, said in the
  note.
- **The decoder as a lesson's part**: drawn open, written as text, with its truth table of kinds
  and control signals available as a view.
- **The four linked views** on the datapath figure or beside it, reading the simulator's own nets,
  as every view does. Module 8's note lists what its figure would change: the full-stage drawing
  scrolls on a phone, the capstone's middle steps are busy with passing values, and a whole-
  datapath challenge elaborates on every keystroke. Module 9's figures inherit all three; fix what
  its lessons need.
- **A figure for every idea, readable on a phone.** Module 8's pages lean on one drawing: every
  figure but the challenges is the whole datapath at its stage, about 2,000 pixels wide at the
  last, and an instruction's layout, a constant's widening, the order of events across edges, the
  memory map and a branch's target have no figure of their own (the managing session's audit of
  6 October 2026). Each idea a Module 9 lesson teaches gets a figure that shows it, small enough
  to read at 375 pixels: a controller's states as a state diagram (Module 5's figure), a sequence
  of edges as a timing diagram, the decoder's rows as a table, beside the whole datapath where the
  lesson needs it.
- **The check's time.** The whole check takes 17 to 19 minutes today. A second 64-bit machine
  stepped edge by edge adds to it; choose what runs in the unit tests and what in the browser with
  that in view, and say in the note what the module added.

Code goes where the earlier modules put it: new code in new files where it can be; edits to shared
registries as short appends in a block of their own, with a comment naming the module. Keep every
existing figure, challenge and lesson working and their tests green. Put every learner-facing
string of a new figure into its strings file.

The shared primitives are in `packages/primitives` (`docs/platform.md`). Module 8's note lists
three candidates (a prediction gate, outcomes shown after a run, a table of named words beside a
drawing). If Module 9 is their second consumer, say so in the note; extraction waits for the
author's approval of the batch, as before.

## The SystemVerilog this module brings

`docs/plan.md` gives Modules 8 to 10 module hierarchy and the CPU in text, the learner reading and
modifying it, graded by writing; "add an instruction" is an edit to the text. Module 9's decoder is
naturally an `always_comb` `case` on the kind, and its controller Module 5's state-machine form (an
enumerated type, the state in `always_ff`, the next state in `always_comb`). Both are constructs
the learner has. Bring a new construct only if a lesson needs it, gated per challenge in
`packages/hdl/src/gate.ts` with a plain refusal message.

## Originality

The standard presentations of this ground are close, and the course's register-transfer notation
is close to one of them. Do not reproduce or closely follow:

- Patterson and Hennessy's multicycle datapath and its finite-state control (states 0 to 9, the
  signals IorD, IRWrite, MemtoReg, PCWrite, PCWriteCond, ALUSrcA, ALUSrcB, PCSource, RegDst), and
  their microprogrammed control;
- Harris and Harris's multicycle processor, its states (Fetch, Decode, MemAdr, MemRead, MemWB,
  MemWrite, ExecuteR, ALUWB, BEQ and their kin) and signals (IRWrite, AdrSrc, ResultSrc, ALUSrcA,
  ALUSrcB, PCWrite), and its chapter order;
- Mano's basic computer: timing signals T0 to T15, the registers AR, DR, AC, TR and IR, and its
  fetch as `T0: AR ← PC`, `T1: IR ← M[AR], PC ← PC + 1`. The course writes transfers with the same
  arrow; the note names this and says how its sequences differ;
- Tanenbaum's Mic-1 and its microprogram in MAL, LC-3's state machine and microsequencer (Patt and
  Patel), and Wilkes's microprogramming.

Module 8's own question gives the way in, and the shop's programs the examples. Each lesson's
`originalityNote` names the textbook version of its topic and how the lesson differs, in the same
commit as the lesson.

## Branches, merging and the checkpoint

- The build works on `module-9-control`, from `main` at the commit that adds this plan, and pushes
  only there. It never pushes to `main`, opens a pull request or runs the deploy workflow.
- `main` may move during the build. Merge it into the branch whenever it does, and before
  finishing, and run the check again after each merge.
- The managing session merges the branch into `main`, after running the check and reading the
  lessons.
- **Checkpoint 3 follows this module**: the author reviews the course once one instruction has
  been added to the CPU end to end (`docs/plan.md`). The managing session writes the report. The
  build's note says, for the capstone, what the instruction is, every part of the machine it
  changed, and how each change was tested.
