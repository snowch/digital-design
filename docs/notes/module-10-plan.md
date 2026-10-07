# Module 10, the instruction set: the plan

Written by the managing session before the build started, as Modules 8 and 9's were. The build
reads it first and keeps to it. A change to this plan is the managing session's to make; a build
that needs one says so in its module note and carries on inside the plan. `docs/plan.md` is the
course plan the module comes from, and `docs/machine.md` and `docs/isa.md`, approved at checkpoint
2, are the machine and the instruction set it explains.

## What the module covers

From `docs/plan.md`: why an instruction set, the layout of an instruction, operands, constants,
loads and stores, branches, calls, illegal instructions, and the state a program can see. Labs: an
encoding explorer, with the course's calculator built from the learner's ALU, and the line between
the instruction set and the circuit that runs it. Capstone: design, justify and implement one new
instruction. Reuses Module 9.

Module 9's last lesson, `new-instruction`, ends on the question this module answers: "Which
instructions a machine has is a choice. So is how their words are laid out. Why are the course's
instructions the ones they are? How should the free kinds be used?"

A module may be more than one lesson. Size each lesson like the existing ones and split where the
material needs it; say in the note why the split falls where it does. Every lesson has the ten
sections. The lessons are module 10, order 1 onward.

## The learner

Modules 1 to 9 are on `main`, 32 lessons, and the learner has done all of them and nothing after.
Module 0 is built at the same time (`docs/notes/module-0-plan.md`); it teaches no term and nothing
this module relies on.

What the learner has already done with instructions, so Module 10 does not do it again:

- **Module 8** ran each kind on the datapath: the layout `K J A B Y c c c` (`instructions`), the
  constant widened (`constants`), the PC and the fetch (`fetch`), loads and stores
  (`memory-access`), branches and the call (`branches`).
- **Module 9** opened the decoder (`control-signals`), refused illegal instructions
  (`illegal-instructions`), ran each instruction in several edges (`several-edges`,
  `micro-operations`), and added a call through a register at kind 9 in the learner's own copy of
  the machine's text (`new-instruction`). The course's machine still refuses kind 9.

So Module 10 takes the programmer's and the designer's side. Module 8 asked what each instruction
does to the datapath, Module 9 how the control makes it do it. Module 10 asks what a program may
rely on, and why the instructions and their layout are what they are.

## What Module 10 teaches

- **The contract.** Two circuits the learner built, Module 8's machine and Module 9's, run the same
  programs to the same result, though one takes an edge for each instruction and the other 3 to 5.
  After every instruction they agree on R0 to R15, the PC, the memory and the devices, and on
  nothing else: the IR, the held words and the controller's state belong to one circuit. What
  every machine that runs the course's programs must agree on is the instruction set; how a
  circuit keeps that agreement is its own business. Module 9's comparison
  (`packages/dd-model/src/multicycle-run.ts`, `compareMulticycle`) already checks the second
  machine against the reference instruction by instruction; a figure can show both machines
  beside each other, compared after each instruction, with the edges each took.
- **The layout as a design.** Why whole hexadecimal digits, each field in the same place in every
  instruction: a person reads an instruction off its digits, the register file's addresses are
  digits A, B and Y with no selector in front, and the decoder never moves a field
  (`docs/isa.md`, "One layout"). What it costs: a 12-bit constant, sixteen kinds, and fields most
  instructions leave unused. The learner compares it with a layout packed by bits and says what
  each gains and loses.
- **What one instruction can say.** The constant's range, -2048 to 2047; a memory of 2 KB chosen so
  every address fits in one instruction (`docs/machine.md`, decision 4); a branch's constant
  counted in instructions; why one "less than", with its two registers swapped, is all the
  "greater than" a program needs (`docs/isa.md`, "Branches", which promises that Module 10 shows
  this); a number too wide for the constant. `docs/isa.md` says a constant wider than 12 bits is
  "built in two instructions today": work out how a program gets one (an absolute load of a word
  kept in the ROM, or a sum of constants) and, if the claim does not hold, say so in the note. A
  change to `docs/isa.md` is the author's.
- **What a machine leaves out, and the room it keeps.** Kinds 0 and 9 to F and every undefined job
  are illegal; an instruction of all zeros is illegal, so a program that runs off its end into
  the ROM's zeros stops; the free kinds are room for instructions not yet thought of. Each
  instruction `docs/isa.md` leaves out on purpose costs something to add and saves something in
  the programs that would use it; the learner counts both.
- **The capstone: design, justify and implement one new instruction.** The learner chooses the
  instruction's kind and how it uses the fields, justifies it with a program it shortens and what
  it costs the circuit, and implements it in their own copy of the machine's text: the decoder,
  any change to the datapath, and the controller's sequence, tested by the simulator against a
  reference told about the instruction, as Module 9's capstone was (`docs/notes/module-9-control.md`,
  "The capstone"). The managing session recommends **"set if less"**: `RY ← 1` if `RA < RB`, else
  0, read signed or unsigned by the job digit, as a branch's condition is. It reuses the branch
  condition the learner built in Module 8, and needs what Module 9's capstone did not: a change to
  the datapath, the condition carried as a word to the register Y. A comparison with zero, or a
  constant placed in bits 12 to 23, may be offered as the engineering tier. Not a shift or a
  multiplication: each is a new part, beyond this module. Which machine the learner changes,
  Module 8's or Module 9's, and whether their copy starts from the course's machine or from their
  Module 9 copy (whose kind 9 is taken), is the build's choice, said in the note.
  `docs/isa.md` does not change: the instruction lives in the learner's copy.

`docs/plan.md`'s "justify" is graded where it can be: a choice of kind, of fields and of the
program the instruction shortens, each checked against the design's rules (a free kind; the
fields where every instruction keeps them, so the decoder still never moves one). Anything
written in the learner's own words is a reflection, not a test.

## The calculator

The author's decision of 6 October 2026 (`docs/plan.md`, "a calculator of the course's own, in
Module 10") fixes it: the course's own calculator, designed once as part of this module's encoding
explorer, not the author's `snowch/programmer-calculator`. It runs the learner's ALU in the
simulator (Module 7's, from the library, at 16 or 64 bits), as every figure in the course is a
view of the circuit:

- the eight jobs (Module 7);
- the word as bits and in hexadecimal, read unsigned and signed (Module 1);
- the four flags, under Module 7's names: ZERO, MINUS, COUT and OVER;
- an instruction's fields, with the constant widened as the machine widens it.

Its strings go through the drafting process like every other. It appears from Module 10 on. The
build may also offer it on Module 8's and 9's pages, but only on a page whose predictions it cannot
answer; the note lists each page and why.

## Figures

A figure for every idea, readable at 375 pixels, as the audit of 6 October 2026 asked of every
module since. At least:

- the two machines compared, instruction by instruction, with what each kept and the edges each
  took;
- the layout as fields, and a packed layout beside it (Module 8's `instruction-fields` figure,
  extended or joined);
- the explorer and the calculator;
- the constant's range and a branch's reach (Module 8's `widening` and `branch-targets` figures);
- a program written without the capstone's instruction and with it, its instructions counted;
- the capstone's change to the datapath, drawn.

A large drawing opens on the part the words name (`focus`, `docs/notes/overview-strip.md`). Every
figure passes the diagrams and aesthetics tests at both widths.

## Terms

Rationed on `main` today: every `introduces` list in Modules 1 to 9. Module 8 added instruction,
datapath, program counter, fetch and branch; Module 9 control unit, illegal instruction,
instruction register and micro-operation.

- **Module 10 owns the instruction-set words.** Candidates: instruction set, encoding, and a word
  for the state a program can see and for the circuit that keeps it (architectural state,
  microarchitecture), if a lesson needs them. Name the books' words where a learner will meet them
  elsewhere, as lesson 1.1 names two's complement: the constant is what books call an immediate,
  and the kind and job together an opcode. Ration what the lessons use and say each in the note.
- **The gate matches a word's stem followed by letters, ignoring case.** Lesson 9.5 says "The new
  instruction sets CALL", which "instruction set" catches: rationing it needs a `termExemptions`
  entry there (the verb "sets", another sense), with its reason. "Immediate" catches "immediately":
  no lesson on `main` uses it, and Module 0's build is told to avoid it. "Encoding" does not catch
  "encoder" (lesson 3.2) or "encoded" (lesson 5.4). Run `termProblems` after every change; an
  exemption on `main` is the only edit this build makes to a lesson there, and the note lists each.
- **Words with two meanings.** "Step" is the settle model's step; "state" a state machine's state
  and the machine's registers; neither is used for the state a program can see without a word that
  says which. "Cycle" appears in no lesson, and every lesson says "edge".
- **Left for later modules**, so not rationed here: assembly, assembler, label, stack, function,
  calling convention, debugger and breakpoint (Module 11); trap, interrupt, handler, vector,
  privilege, user mode, system mode and system call (Module 12).

## The platform

New code goes where the earlier modules put it: new files where it can be; edits to shared
registries as short appends in a block of their own, with a comment naming the module. Keep every
existing figure, challenge and lesson working and their tests green. Module 0's build also appends
to the registries; expect a merge, and keep each append in its own block.

The shared primitives are in `platform/primitives`, a checked copy of `snowch/learning-platform`
(`docs/platform.md`): change them only there, then sync. If Module 10 is the second consumer of a
candidate an earlier note listed, say so in the note; extraction waits for the author's approval.

The whole check takes about 25 minutes, 22 of them in the browser. Two 64-bit machines stepped side
by side add to it; choose what runs in the unit tests and what in the browser with that in view,
and say in the note what the module added.

## The SystemVerilog this module brings

`docs/plan.md` gives Modules 8 to 10 module hierarchy and the CPU in text, the learner reading and
modifying it, graded by writing; "add an instruction" is an edit to the text. The capstone is that
edit, as Module 9's was. Bring a new construct only if a lesson needs it, gated per challenge in
`packages/hdl/src/gate.ts` with a plain refusal message.

## Originality

The standard presentations are close. Do not reproduce or closely follow:

- Patterson and Hennessy's instruction-set chapter: its MIPS or RISC-V formats (R, I, S, B, U and
  J), its four design principles ("simplicity favors regularity", "smaller is faster", "good
  design demands good compromises", "make the common case fast", quoted as the book spells
  them), and its building of a 32-bit constant with `lui`;
- Harris and Harris's architecture chapter and its order;
- Hennessy and Patterson's classification of instruction sets (stack, accumulator,
  register-memory, load-store) and its tables of instruction mixes;
- the stock argument for fixed-length against variable-length instructions told through x86 and
  MIPS;
- Nand2Tetris's A- and C-instructions.

The course's own way in is Module 9's question, its two machines, and the shop's programs. The
comparison of two circuits running one instruction set is the course's own: both are the
learner's. Each lesson's `originalityNote` names the textbook version of its topic and how the
lesson differs, in the same commit as the lesson.

## Branches, merging and the note

- The build works on `module-10-instruction-set`, from `main` at the commit that adds this plan,
  and pushes only there. It never pushes to `main`, opens a pull request or runs the deploy
  workflow.
- `main` may move during the build (Module 0 is built at the same time, and another course's
  session updates the platform copy). Merge it into the branch whenever it does, and before
  finishing, and run the check again after each merge.
- The managing session merges the branch into `main`, after running the check and reading the
  lessons.
- The module's note, `docs/notes/module-10-instruction-set.md`, says what was reused, what was
  built, what was extracted or could be, every edit to a lesson on `main`, the terms, the
  capstone's instruction with every part of the machine it changed and how each change was tested,
  and what the build would change.
- **Checkpoint 4 follows Module 11**, not this module (`docs/plan.md`).

## Changes after the reading review

The managing session changed this plan on 7 October 2026, after each lesson's reading review and
its sceptic. The module note (`docs/notes/module-10-instruction-set.md`) records every decision,
A to K, and what the build did with each; these three change what the plan above says.

- **The layout as a design** compares the course's layout, every field in one place in every
  instruction, with one whose fields move, not with a layout packed by bits. Sixteen registers,
  sixteen kinds and sixteen jobs each need exactly 4 bits, one hexadecimal digit, so cutting by
  bits buys room only where a field is unused, which the moving layout already shows.
- **What a machine leaves out** counts the cost and the saving of each instruction `docs/isa.md`
  leaves out except "set if less", which it only names; the learner counts both on calls, with
  and without the call through a register.
- **The capstone** has the learner design "set if less" before the page shows the course's
  design: the question and the motivation state the need, the design challenge comes next, and
  its saving and its cost are on no page before it. The decoder half applies Module 9's
  capstone; the new source for register Y is the new work.
