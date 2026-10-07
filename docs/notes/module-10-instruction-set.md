# Module 10: the instruction set

A working note, written as the module was built, on the branch `module-10-instruction-set`. Times
are read from the clock (`date -u`), not estimated. "The building session" is the session that
wrote the code and the briefs and checked every draft; "the drafting subagent" is the Haiku
subagent that wrote every learner-facing sentence from a brief of checked facts. The plan is
`docs/notes/module-10-plan.md`.

## Times

- Started: 2026-10-07 04:30 UTC (first command in the session).
- The five lessons were committed by 05:51 UTC; the figures' own words, the walk and the full
  check followed (below).

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
- 04:45 to 05:03 Lesson 10.1. The comparison of the two machines (`machine-compare.ts`) and its
  figure; the answers editor learnt choice fields, and the graders `choices`. The facts test caught
  a wrong fact in the building session's own brief before it reached a page: with PCEN stuck at 1
  the controller still takes the load's five edges and writes R2, and the PC runs ahead to the
  stop; brief 1B was corrected and the key redrafted. A browser test found the log table running
  off a phone; the address now sits in the instruction's cell.
- 05:03 to 05:20 Lesson 10.2. The packed layout and what the machine makes of a word
  (`encoding.ts`), `layout-compare` and `encoding-explorer` with the calculator; the grader
  `instruction-word`. The browser test caught the layouts showing before the prediction was
  committed (an edit had missed a block Prettier had rewrapped); they are now gated, and the
  test holds it.
- 05:20 to 05:32 Lesson 10.3. The comparisons with their registers swapped and the programs
  counted (`programs10.ts`), `swap-compare` and `program-compare`; the grader `exact`. Two facts
  were wrong in the building session's own expectations and the facts test said so: the
  prediction's answer read raw props without their defaults (fixed in the code), and the start of
  the `greater` challenge fails 8 tests, not 7.
- 05:32 to 05:36 Lesson 10.4; `main` merged (two commits, no conflict).
- 05:36 to 05:51 Lesson 10.5. The capstone's block drawn and placed by hand (`capstone10.ts`), the
  decoder's table and each kind's edges with kind A, a question on `kind-edges`. The diagram
  checks caught the 64-bit words written on that drawing running off it and onto a wire; the
  circuit explorer and the fault lab now take `writtenWidth`, as Module 8's datapath figure does.
- 05:51 on The figures' own words (brief 6V), the mechanical walk, this note and the full check.

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

## Terms

Rationed, each where its lesson's figure first raises the question it answers:
**instruction set** and **microarchitecture** (10.1, `instruction-set`), **opcode** (10.2,
`encoding`), **immediate** (10.3, `immediates`). 10.4 and 10.5 introduce none. "Opcode" and
"immediate" are named as the books' words for the kind and job together and for the constant,
as lesson 1.1 names two's complement.

**"Encoding" is not rationed.** The plan listed it as a candidate, but Module 5's `state-encoding`
lesson already uses the word throughout, in the same sense (the codes a design gives its states);
rationing it in Module 10 would need an exemption on a lesson whose title is the word. Module 10
uses it plainly.

**Edits to lessons on `main`**: one `termExemptions` entry, on `new-instruction` (9.5), for
"instruction set": its prose says "The new instruction sets CALL", the verb. Reason, in the lesson:
"\"The new instruction sets CALL\": the verb, an instruction setting a control signal; lesson 10.1
introduces the instruction set." No other lesson on `main` was edited. "Immediately" appears in no
Module 10 string, and the briefs banned it.

Working words held to one meaning each (`briefs/00-module.md`): agree, keep, edge, kind, job,
field, digit, layout, circuit, run, stop. "Cycle" appears nowhere; "step" is not used for an edge.

## Figures

Every figure is a view of the simulator or of the reference, and each passes the diagram and
aesthetic rules at both widths.

- `machine-compare` (new, 10.1): Module 8's machine (`datapath-full`) and Module 9's
  (`multicycleCircuit`) in two simulators, compared after every instruction: what a program can
  see on each, what Module 9's keeps of its own, every instruction with the edges each machine
  took; Module 9's moves an edge at a time, Module 8's takes its edge when Module 9's instruction
  ends; faults on Module 9's machine; a question before the tables show.
- `instruction-fields` (Module 8's) and `layout-compare` (new, 10.2): an instruction's word in the
  course's layout and in a packed one, digit by digit, the constant's range in each and the field
  that moves; a question before the layouts show.
- `encoding-explorer` (new, 10.2): a word typed or chosen, its fields, what the machine makes of it
  (the reference's own field split and its check for an illegal instruction), the constant widened
  by the simulated widen block; and **the calculator**, Module 7's ALU from the library
  (`alu8-flags-16-block`, `alu8-flags-64`) run in the simulator at 16 or 64 bits on two words typed
  as hexadecimal or as numbers read signed, with Y in bits, hexadecimal, unsigned and signed and the
  four flags under Module 7's names; a button takes the job and B (the constant widened) from the
  word. The failure experiment of 10.2 is the same figure without the calculator, on packed words.
- `widening` (Module 8's, 10.3) and `swap-compare` (new, 10.3): every comparison, read signed and
  unsigned, with the branch that says it and whether the reference takes it; a question.
- `program-compare` (new, 10.3 to 10.5): one or two programs run on the reference, side by side:
  their listings, the instructions written and run, the ROM used, the registers and display at the
  stop, where and why the run stopped; a program written with the learner's copy's kinds can be run
  on the course's machine; a question before the counts show.
- `kind-map` (Module 9's, 10.4).
- The capstone's change, drawn (10.5): `y-word-set`, the block that chooses register Y's word with
  the new input, placed by hand and opening on pickSet (`focus`), in `circuit-explorer` and in a
  `fault-lab` on SET; `control-table` and `kind-edges` with kind A (`setIf`), the latter with a
  question.

**The calculator on Module 8's and 9's pages: not offered.** Each of those pages that could use it
asks a prediction it would answer (a register's word after a job, a branch's constant, a flag), and
the plan allows it only where it answers none. It appears in 10.2 and nowhere else in Module 10;
10.3 to 10.5 work from figures of their own.

## The capstone: set if, and every part it changed

The instruction: `RY ← 1` if `RA cond RB`, else `RY ← 0`, at kind A, its job digit a branch's
condition, in the learner's copy of Module 9's machine. `docs/isa.md` does not change. Each part,
and how each was tested:

- **The reference** (`machine.ts`): `MachineOptions.setIf` names the kind; `isIllegal` refuses its
  jobs 8 to F; `step` writes the branch condition of RA - RB as the word 1 or 0. Tested through
  everything below.
- **The authors' assembler** (`assemble.ts`): `R5 <= R2 < R1 signed` writes kind A when told the
  kind, and refuses with "this machine has no set if" otherwise.
- **The drawn decoder** (`control.ts`, `ControlOptions.setIf`): kind A's line is the control signal
  SET; WRITEY, OP1 and OP0 take it into their ORs; the kind check knows kind A and the job check
  refuses its job bit 3 as kinds 1, 2 and 5 do. Tested against the reference's `isIllegal` for every
  kind and job under four constants (`module10.test.ts`); its outputs are the capstone's decoder
  challenge's expectations, which the challenge's reference text meets on all 262 cases.
- **The controller: no change.** Set if sets WRITEY and not MEM or CALL, so it takes a register
  job's FETCH, READ, ALU, WRITE; at WRITE the condition is worked out again from the held words.
  `stateSequence` gives kind A those states; `kindSequences` walks the drawn controller and finds
  the same (`design-an-instruction.facts.test.ts`).
- **The datapath: a new source for register Y**, MET as a word (63 zeros above it), chosen by SET,
  after the call's line. In text: `if (SET) YIN = {63'h0, MET};`; drawn: `capstone10.ts`.
- **The machine, end to end**: the learner's copy's whole text with the change runs the count of
  cold rooms and every condition on equal, smaller and larger words against the reference, each set
  if in 4 edges; without the new source it writes the subtraction and the comparison names R5
  (`module10.test.ts`). The capstone's third challenge runs the program edge by edge (33 tests).

Which machine: Module 9's, because its decoder is text the learner wrote; Module 8's decoder is a
block the course supplies closed. Which copy: the learner's Module 9 copy, with kind 9 as the call
through a register, so lesson 9.5's "kinds A to F stay free" holds and the design challenge can ask
why not kind 9. The three challenges split the work so no step repeats another (checkpoint 3's
third question): the design, then the decoder alone, then the machine whose decoder already has
kind A and lacks only the datapath's source.

"Justify" is graded where it can be: the kind (a free one), the register written (Y, where every
instruction keeps it), the condition (J, as a branch's), the program it shortens (the count of cold
rooms, counted on the reference: 10 instructions written and 9 run, against 8 and 8), and what it
costs (a new source for register Y and a control signal). The words a learner might write about it
are left to the reflection.

## Lesson 10.1's third circuit

The plan's first idea asked for the two machines compared. The lesson adds a third circuit for
the same instruction set, which the learner writes: Module 9's machine with its register and
constant jobs written at the ALU edge in 3 edges (three lines: the ALU arm of the next-state
logic, WREG, and YIN's default from HR to RESULT). Module 8's 37 programs run through it as the
reference runs them, each job in 3 edges (`module10.test.ts`). It is the plan's "how a circuit
keeps that agreement is its own business", done rather than said.

## The claim in docs/isa.md about wide constants

`docs/isa.md`'s "Left out on purpose" says a constant wider than 12 bits is "built in two
instructions today". Run on the reference (10.3), that holds only for numbers up to 4094 (two
constant jobs of at most 2047). The general ways are: **one absolute load of a word kept in the
ROM** after the program, which gives any 64-bit number in one instruction and 8 bytes of ROM (5000
took 3 instructions and 24 bytes with the store and the stop, against 5 and 20 by sums); or a
sum of constant jobs, one for each 2047 or so. The lesson states what the runs show and does not
repeat the claim. A change to `docs/isa.md` is the author's.

## What the platform gained

New files: `machine-compare.ts`, `encoding.ts`, `programs10.ts`, `capstone10.ts` (model);
`Module10Figures.tsx`, `strings10.ts` (views); `module10.ts` and five lessons (content);
`tests/educational/module10.spec.ts`. Appends to shared files, each in a block of its own naming the
module: `MachineOptions.setIf`, `ControlOptions.setIf` and `shortJobs` with the decoder's options and
`stateSequence`; `assemble`'s `setIf`; `referenceFor` and `assemblyFor`; the graders `choices`,
`instruction-word` and `exact`; choice fields in `AnswerEditor`; `setIf` and a question on
`control-table` and `kind-edges`; `writtenWidth` on `circuit-explorer` and `fault-lab`; the course
modules set `machine9-set` in `book.tsx`; the library's `y-word-set`; `strings.ts`'s `machine10`
block and the control strings' kind A; CSS at the end of `course.css`.

## Candidates for the shared primitives (listed, not extracted)

- **The prediction gate** (Module 8's and 9's notes listed it): Module 10 adds five figures that
  hide their values until the learner commits, each with the same twenty lines (`machine-compare`,
  `layout-compare`, `swap-compare`, `program-compare`, `kind-edges`). It now has many consumers in
  this course; a `GatedFigure` in the platform would take the question, the options, the answer and
  the verdict's words.
- **Two programs counted**: `program-compare` would serve Module 11 directly.
- **A choice field in the answers editor**: the schema had `choice`, and the editor now draws it;
  that belongs in the platform's editor, which the metadata course could use.

Extraction waits for the author's approval.

## What I would change

- The capstone's motivation gives set if's word, `A6215000`, before the design challenge, and the
  prediction's legend names kind A, so three of the design's five answers are on the page before
  it. The design is graded as reasons the learner must choose among, not discovered; a fuller
  design challenge would let the learner pick any free kind and test the decoder at that kind.
- The calculator could also take a register's word from a run, so a learner checks a branch's
  flags against the machine without retyping.
- The two machines side by side could draw Module 9's state as its diagram, as lesson 9.3 does.
- The second circuit's suite run (37 programs through the text) adds about a minute of unit tests;
  a representative third would do.
