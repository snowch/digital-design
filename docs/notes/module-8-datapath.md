# Module 8: the CPU datapath

A working note, written as the module was built, on the branch `module-8-datapath`. Times are read
from the clock (`date -u`), not estimated. "The managing model" is the session that planned, wrote
the code and the briefs, and checked every draft; "the drafting subagent" is the subagent that
wrote every learner-facing sentence from a brief of checked facts.

## Times

- Started: 2026-10-06 05:39 UTC (first command in the session).

## Log

- 05:39 to 05:46 Read CLAUDE.md, `docs/notes/module-8-plan.md`, `docs/plan.md`, `docs/machine.md`,
  `docs/isa.md`, `docs/platform.md`, `docs/authoring.md`, `docs/style.md`, `docs/simulator.md`,
  the inventory's section 8, `docs/checkpoints.md`, the notes for Modules 6 and 7, the diagrams,
  straight-wires, roomy-wires and SystemVerilog notes, and the lessons `alu-tests`, `memory-map`
  and `register-transfer` with their words. Read the platform code the module builds on: the
  circuit builder, the memory primitives, the library and its placements, the circuit view, the
  drawing pipeline, the memory explorer, the content tests and the HDL parser, gate and
  elaborator.
- 05:47 Measured before writing: building the 64-bit ALU took 260 ms for 2,433 parts. The
  circuit builder checked each new net's name against a set rebuilt from every net so far, which
  is quadratic; a datapath of ten thousand parts would have taken seconds to build. The set is now
  kept as nets are made (46 ms), with the same names out.
- 05:48 to 05:52 `packages/dd-model/src/machine.ts`, the instruction-level reference: one edge of
  the machine as `docs/isa.md` says, in bigints, on a state of PC, sixteen registers (unknown until
  set), the ROM's and the RAM's bytes and the devices; and `assemble.ts`, the authors' assembler
  for `docs/isa.md`'s assembly. Twelve tests, among them the worked example's six encodings and
  its run (the display shows -250). One failed first: `nothing` is a branch that reads no flag,
  and the reference had refused to branch on unknown registers whatever the condition.
- 05:52 to 05:58 `datapath.ts`: the datapath at 64 bits in five stages (below), and
  `datapath-run.ts`, which reads its state off the simulator's nets and compares a run with the
  reference after every instruction. The worked example ran right on the gates at the first try:
  9,856 parts.
- 05:56 to 06:02 Speed. A clock edge of the whole datapath took about 100 ms. Three changes to the
  settle, each exact, brought it to about 50 ms:
  - the history is kept as the nets each step changed, and a step's whole state is put together
    only when a view asks for it, where every step copied ten thousand values twice;
  - after a settle that ended with nothing changing, the next settle's first step works out only
    the readers of the inputs set since, where it worked out every gate; a restore, an oscillation
    or a first settle still works out every gate;
  - the hash that finds a repeated state now folds in every bit of a word, where it read the low 24
    bits and so made states of a 64-bit datapath that differ only above them collide.
  `settle-due.test.ts` holds a run of input changes to a plain settle step for step, and a restore
  to a full first step.
- 06:00 to 06:04 `machine-suite.ts`, the suite in Module 7's manner, and `datapath.test.ts`: 37
  programs (a normal one with every job, load, store and branch; six boundary pairs at the edges
  of the range, every job and every condition on each; three random programs from seed 1; three
  adversarial ones; and one per check that stops the machine, 23), each compared instruction by
  instruction. All passed first time, in 21 seconds. Seen to fail first: with the branch
  condition's XOR fed job bit 1 for bit 0, 30 of the 37 fail, and the memory stage run on a
  program with branches fails at its first `goto`.
