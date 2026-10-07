# Module 10: the instruction set

A working note, written as the module was built, on the branch `module-10-instruction-set`. Times
are read from the clock (`date -u`), not estimated. "The building session" is the session that
wrote the code and the briefs and checked every draft; "the drafting subagent" is the Haiku
subagent that wrote every learner-facing sentence from a brief of checked facts. The plan is
`docs/notes/module-10-plan.md`.

## Times

- Started: 2026-10-07 04:30 UTC (first command in the session).

## Log

- 04:30 to 04:40 Read CLAUDE.md, the plan, `docs/plan.md`, `docs/authoring.md`, `docs/style.md`,
  `docs/machine.md`, `docs/isa.md`, the notes for Modules 8 and 9, checkpoint 3, and lessons 8.1,
  9.2 and 9.5 with their words; then the code the module builds on: the reference
  (`machine.ts`), the assembler, the decoder and controller (`control.ts`), the machine of several
  edges and its comparison, the machine's text (`module9.ts`), the figures of Modules 8 and 9 and
  the answer graders. The unit tests on `main`: 897 passed, in 96 seconds.
- 04:40 Faults on the machine of several edges, each run against the reference on the colder-room
  program and Module 8's 37 programs: HOLDR stuck at 1 and HOLDM stuck at 1 change only the
  machine's own held words, and every program still agrees with the reference after every
  instruction; PCEN stuck at 1 disagrees at the first instruction (all 37 fail).
- 04:41 to 04:44 The capstone and lesson 1's second circuit, in the model and as text, before any
  lesson: the reference, the assembler and the decoder take "set if" at kind A
  (`MachineOptions.setIf`, `ControlOptions.setIf`); `ControlOptions.shortJobs` gives the register
  and constant jobs 3 edges. `content/lessons/module10.ts` makes each text from Module 9's by
  named line edits. Module 8's 37 programs run through the second circuit as the reference runs
  them, each job in 3 edges; the capstone's machine runs set if under every condition on equal,
  smaller and larger words, each in 4 edges; without its new source for register Y, it writes the
  subtraction, and the comparison names R5.

## The outline

Five lessons, as Modules 8 and 9 had: each answers the question the one before ends on, and each
split falls where the learner's view of the machine changes. Module 8 asked what each instruction
does to the datapath, Module 9 how the control makes it do it; Module 10 asks what a program may
rely on, and why the instructions and their layout are what they are.

1. `instruction-set`, "What must every machine agree on?": Module 8's machine and Module 9's run
   one program side by side, compared after every instruction. They agree on R0 to R15, the PC,
   the memory and the devices, and on nothing else; mid-instruction they differ. Faults: HOLDR
   stuck at 1 keeps the agreement, PCEN stuck at 1 breaks it. Challenges: sort a list of the
   machines' parts into the agreement and one circuit's own (answers); then write a third circuit
   for the same instructions, Module 9's machine with its jobs written at the ALU edge in 3 edges,
   tested edge by edge and against the reference. Introduces **instruction set** and
   **microarchitecture**.
2. `encoding`, "Why is every field a whole digit?": the layout as a design. The encoding explorer
   with the course's calculator; the course's layout beside a packed one, in which a kind that
   leaves a register digit unused gives it to the constant, and pays with a field that moves.
   Challenges: write instructions' words (answers); write the packed layout's constant, which
   needs a selector the course's layout does not. Introduces **opcode** (the kind and job
   together, the books' word).
3. `immediates`, "What can one instruction say?": the constant's range, the 2 KB memory chosen so
   every address fits, a branch's reach counted in instructions, "greater than" as "less than"
   with the registers swapped, and a number too wide for the constant. Challenges: constants and
   reaches (answers); comparisons rewritten without "greater than" (answers). Introduces
   **immediate** (the books' word for the constant).
4. `room-to-grow`, "What does the machine leave out?": the illegal kinds and jobs, an all-zero word
   that stops a program that runs off its end, the free kinds, and what each instruction
   `docs/isa.md` leaves out would cost the circuit and save a program, counted by runs of the
   reference. Challenges: what the machine does with a word (answers); instructions counted for a
   program with and without a left-out instruction (answers). Introduces nothing.
5. `design-an-instruction`, the capstone, "Design, justify and implement one new instruction":
   set if, `RY ← 1` if `RA cond RB`, else 0, at kind A, the job digit a branch's condition. It
   needs what Module 9's capstone did not: a change to the datapath, the condition MET carried as a
   word to register Y, through a new control signal SET. Challenges: the design, checked against
   the layout's rules (a free kind, the fields where every instruction keeps them, the program it
   shortens, what it costs); the decoder's text with kind A; the machine's text with the new source
   for register Y, run end to end. Introduces nothing.

## The capstone's instruction, and the machine it changes

"Set if" at kind A, in the learner's own copy of Module 9's machine (`machineText(true)`, whose kind
9 is the call through a register), so lesson 9.5's "in your copy, kinds A to F stay free" holds.
The job digit is a branch's condition, unchanged (0 always, 1 never, 2 equal, 3 differ, 4 and 5
less and not less unsigned, 6 and 7 signed), so the condition block Module 8 built serves both, and
the job check treats kind A as it treats kinds 1, 2 and 5 (job bit 3 refused). "Set if less", the
plan's recommendation, is jobs 4 and 6. Its edges are a register job's, FETCH, READ, ALU, WRITE: the
decoder sets WRITEY and the ALU's subtract, so the controller does not change; at WRITE, MET is
worked out again from the held words, and register Y takes it as the word 0 or 1. Module 9's
machine is the one changed because its decoder is text the learner wrote; Module 8's decoder is a
block the course supplies closed. `docs/isa.md` does not change.

## Figures

- `machine-compare` (new, 10.1): the two machines run one program side by side, an instruction
  at a time or Module 9's an edge at a time, with what they agree on, what each keeps of its own,
  and the edges each took; faults on Module 9's machine; a question before the run.
- `instruction-fields` (Module 8's, 10.2) and a packed layout beside it (new, `layout-compare`).
- `encoding-explorer` (new, 10.2 on): a word typed or set digit by digit, its fields, what the
  machine makes of it, the constant widened; and the calculator, which runs Module 7's ALU from
  the library at 16 or 64 bits on two words, showing Y in bits, hexadecimal, unsigned and signed,
  and the four flags under Module 7's names.
- `widening` and `branch-targets` (Module 8's, 10.3), and the comparisons with their registers
  swapped (new, `swap-compare`), each read off the reference's ALU.
- `program-compare` (new, 10.3 to 10.5): two programs run on the reference, side by side, their
  instructions written and run counted, with a question before the run.
- `kind-map` (Module 9's, 10.4).
- The capstone's change to the datapath, drawn: the block that chooses register Y's word with the
  new input (a library circuit in `circuit-explorer`, 10.5), with a fault lab on SET; and the
  decoder's table and each kind's edges with kind A (`control-table`, `kind-edges`, given
  `setIf`).

## Changes to the plan

None so far.
