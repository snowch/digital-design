# Modules 5, 6 and 7, built in parallel: the shared plan

Written by the managing session before any of the three builds started. Each build reads it first
and keeps to it, because each is written without the others on its branch. A change to this plan
is the managing session's to make; a build that needs one says so in its module note and carries
on inside the plan. `docs/plan.md` is the course plan these modules come from.

## What each module covers

From `docs/plan.md`:

- **Module 5, the rest.** `registers` (module 5, lesson 1) is on `main` and teaches registers, the
  load enable, the reset and the shift register. The new lessons teach the rest of the module:
  counters, register transfer, state machines, state encoding and synchronous design. Labs: a
  counter, a 16-bit register (the plan's lab; `registers` built four bits), and Slice 2,
  the retry controller. Capstone: a controller following a given state machine. `registers` ends
  on the questions the new lessons answer: "What if the gates before D worked out a new value from
  Q, such as the next number up? What would a circuit need to work through a fixed list of jobs,
  one per edge?"

  Slice 2's example was approved at Checkpoint 1 (`docs/inventory.md`, section 7, questions 3 and
  4): a retry-with-back-off controller with states IDLE, TRY, WAIT and GIVE-UP, inputs go, ok,
  fail and tick, and outputs send and alarm, each set by the state alone. It has the four kinds of
  transition the predictions need (stay, advance, return, reset) and a natural faulty encoding to
  diagnose. The next-state logic is derived from the encoded table directly, without
  minimisation, with the `always_comb` `case` text as its equivalent. The names are the
  inventory's working names. Carry the course's story if the controller fits it (for example, the
  alert the shop's office sends the manager, sent again until it is acknowledged, and given up
  after too many tries); the build decides, and says why in its note.

- **Module 6, Memory.** Addressing, decoders, RAM, read and write, the register file, byte
  addressing, alignment, memory-mapped input and output. Lab: a memory explorer (the buses, the
  selected cell, an access out of range) that opens from RAM to its cells to their flip-flops.
  Capstone: enough memory to run a program. Reuses Module 3's decoder and Module 5's register.

- **Module 7, the ALU.** Arithmetic, logic, flags, operation select, width, slicing to 64 bits,
  overflow. Labs: operation select, stepping the carry, injecting faults. Capstone: an ALU that
  passes a generated test suite (normal, boundary and adversarial cases). Reuses Module 3's slice.
  Module 3's `alu` lesson ("How can one block do four jobs on two words?") already builds a slice
  with four jobs (OP1 OP0: 00 AND, 01 XOR, 10 add, 11 subtract), graded as a chain at 1, 4, 8 and
  16 bits, with no flags beyond the adder's carry out. Module 7 builds on that and does not teach
  it again.

A module may be more than one lesson. Size each lesson like the existing ones and split where the
material needs it. Every lesson has the ten sections.

## The learner, in course order

- Modules 1 to 4 and Module 5's `registers` are on `main`. Module 5's new lessons follow
  `registers` (module 5, order 2 onward); Module 6 follows all of Module 5; Module 7 follows
  Module 6.
- No build can see another's lessons. So **Modules 6 and 7 assume only what is on `main`**, plus
  the terms the terms section below gives the modules before them. They may use those terms but
  never lean on how another build explains them: no "as the counter lesson showed", no figure or
  control named from a lesson they cannot read.
- The course's freezer shop runs through every module so far (the freezer room's sensor, the
  cable, the office display, the signals WARM and DOOR, and the lamps ALARM, NIGHT and CLASH). Carry it on where it
  serves the material, or start another example that serves it better and say why.

## Terms

Rationed on `main` today: bit, threshold, noise margin, binary, word, unsigned, signed,
hexadecimal (`signals`); gate, truth table, Boolean expression, XOR, SystemVerilog (`gates`);
NAND, universal (`nand`); depth (`fewer-gates`); multiplexer, bus (`selectors`); decoder,
demultiplexer, encoder, comparator (`decoders`); carry, half adder, full adder, overflow, XNOR
(`adders`); ALU (`alu`); feedback, latch, transparent, edge, propagation delay, setup, hold,
metastable (`remember`); register, shift register (`registers`).

- **Module 5 owns**: counter, state machine, and the state-machine words it chooses to ration (for
  example state diagram, state encoding, next-state logic, one-hot, synchronous).
- **Module 6 owns**: address, byte, RAM, ROM, register file, aligned or alignment, memory-mapped,
  and other memory words it chooses to ration.
- **Module 7 owns**: flag, and other ALU words it chooses to ration.
- **Modules 6 and 7 may use Module 5's two named terms, and Module 7 may use Module 6's named
  terms**, before those lessons exist on their branches: until the earlier module lands, the term
  is not rationed there, so the gate stays green and nothing needs doing. No build lists another's
  term in its own `introduces`. A build that rations a word not named above (an "other ... it
  chooses") must be sure no later module of the three needs it first, and says so in its note.
- **Never ration "memory" or "state" alone.** `remember` says memory in its everyday sense, and
  CLAUDE.md names "state" as a word that means two things on one page. None of counter, state
  machine, address, byte, RAM, flag or register file appears in the learner's text of any lesson
  on `main` ("counter" and "flag" appear only in originality notes, which the gate does not read).
- Never ration a word that is also ordinary English in lower case where an earlier lesson uses it
  that way; the gate ignores case. A word an earlier lesson uses in another sense gets a
  `termExemptions` entry on that earlier lesson, with the reason, added by the module that
  rations it, and said in its note. That is the only edit any build makes to a lesson on `main`.

## The course machine: what these modules must not fix, and what this plan fixes for them

The managing session is drafting `docs/machine.md` and `docs/isa.md` while the three modules are
built, for the author's approval before Module 8 (checkpoint 2 in `docs/plan.md`). No lesson in
Modules 5 to 7 fixes the machine's instruction set, its number of registers, its instruction
format or its memory map, or promises one ("the course's computer will have 16 registers").

Fixed here, so the three modules and the machine agree:

- **Width.** Words are 16 bits at the gate level and in registers; the CPU modules run the same
  design at 64 bits. Module 7's ALU is built from slices so the same design is any width.
- **Bytes and words in memory.** Memory is byte-addressable. A 16-bit word takes two bytes, the
  low byte at the lower address, and a word's address is even. The machine adopts this; if the
  author changes it at checkpoint 2, Module 6 changes with it.
- **The ALU's jobs.** Module 7 keeps Module 3's four jobs and their codes (00 AND, 01 XOR, 10
  add, 11 subtract) and extends them with more select bits. Every job is built from one-bit
  slices, so the ALU does no shifts (a shift is not a chain of one-bit slices; if the machine
  needs one, Module 8 adds a shifter beside the ALU). Its flags say whether the result is zero,
  whether it is negative read signed, the carry out, and signed overflow. Their signal names are
  the course's own words, not a processor's flag letters. The machine adopts Module 7's ALU as
  built; Module 7's note gives its table of jobs and codes.
- **Examples are the lesson's own.** Module 6's register file takes its size as a parameter, and
  its lessons use a size of their choosing without calling it the machine's. Its memory-mapped
  devices are the shop's (the display, the lamps, the switches) at addresses the lesson chooses,
  not the machine's memory map.

## The SystemVerilog each module brings

The course's text is running behind `docs/plan.md`: Module 3's challenges allow only Module 2's
constructs, so `always_comb`, `case`, concatenation and `parameter` are untaught, and `always_ff`
arrived in `registers` (Module 5), not Module 4. The construct gate is set per challenge
(`allowedConstructs`), so each build allows only what the course has taught by then:

- **Module 5** teaches `always_comb` and `case` (a state machine's next-state logic is their
  natural first use), an enumerated type for the states (a new construct), and the state-machine
  form: the state in an `always_ff` register, the next state worked out in `always_comb`.
- **Module 6** teaches a memory written as an array, and filling one from a list of values (new
  constructs).
- **Module 7** teaches `parameter` (the ALU's width), concatenation, and `+` and `-` in text, now
  that the learner has built an adder. It may allow `case` in its challenges, which Module 5
  teaches; a reminder of what `case` does stays one plain sentence.
- New constructs go into `packages/hdl` in files of their own where they can, with the construct
  ids appended to the gate's lists in a block marked with the module, so the merges are
  mechanical.

## Code

- **New code in new files** where it can be: each module's figure kinds, model files and tests.
  Edits to shared registries (the interactive registry, the strings files, the component library,
  the HDL construct lists, `content/lessons/index.ts`) are short appends in a block of their own,
  with a comment naming the module.
- **Module 5 owns** the sequential components beyond the register (counters, state machines and
  their views, such as a state diagram linked to its table and its circuit). **Module 6 owns** the
  memory components (RAM, the register file, memory-mapped devices) and the memory explorer.
  **Module 7 owns** the ALU's components (the flags, the new jobs, the chain to 64 bits) and the
  generated test suite (normal, boundary, random and adversarial cases), written so later modules
  can reuse it.
- **64 bits.** The engine already holds every word as two bigints (`packages/sim/src/values.ts`).
  Lesson code that works out expected values in plain numbers, such as `job()` in
  `content/lessons/alu.ts`, loses bits past 53; Module 7 computes its expected values in bigints.
- If a module needs something another owns, it writes the smallest version it needs, in its own
  file, and says so in its note; the managing session reconciles them at the merge.
- **No extraction of shared code.** `packages/primitives` stays empty, and no build touches
  `snowch/learning-platform`. Module 5's state-machine lesson is Slice 2, where the author's brief
  asks for approval before the first extraction of shared primitives, one approval for the whole
  batch. Module 5's note lists the candidates, each with its two consumers and what would move;
  the managing session puts them to the author. Do not wait for the answer.

## Branches and merging

- Module 5 builds on `module-5-state-machines`, Module 6 on `module-6-memory`, Module 7 on
  `module-7-alu`, all from `main` at the commit that adds this plan. No build pushes to `main`,
  opens a pull request or runs the deploy workflow.
- The managing session merges in course order: Module 5, then 6, then 7. Before each merge it
  merges `main` into the branch, resolves what conflicts, runs the check and reads the lessons. A
  build that finds `main` has moved before it finishes merges `main` into its branch and runs the
  check again.
- The previous and next links at the bottom of each lesson follow the list of lessons, so new
  lessons join them without any change.
