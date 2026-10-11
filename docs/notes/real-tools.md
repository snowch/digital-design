# Real tools: what Verilator and Yosys found

The check is described in `docs/simulator.md` ("Real tools"). Each entry below is something a real
tool rejected or read differently from the course, and what changed. Learner-facing wording that
changed was drafted by a Haiku subagent from a fact brief in `docs/notes/real-tools/`.

## Found and fixed

1. **The generator wrote no storage for a memory placed without a block of its own.**
   The register file (`registerFile64`) places two memories as bare components inside a block of
   another kind. `generate()` skipped any component without a `y` output, so the generated
   `registers` module had no registers: `QA` and `QB` were assigned from wires nothing drove.
   Yosys said so (`implicitly declared`, `used but has no driver`). Fix: a bare `memory` or `rom` component is written as an array, with its
   reads and its write, and its state loop is no longer reported as a loop of gates.
   (`packages/hdl/src/generate.ts`; test in `roundtrip.test.ts`.)

2. **The generator took any block of kind `memory` or `rom` for an array.**
   The machine's memory map is a block called `memory`, and the program ROM a block of kind `rom`
   with the fetch checks in it. Both came out as `logic u [0:0]; ... if (undefined) u[undefined]
   <= D;`, with the checks dropped. Fix: a block is an array only if it holds the cells and nothing
   else, read at `Q`; otherwise its gates are written and its cells are arrays of their own.

3. **An array list shorter than its array, and an unknown word, were written invalid.**
   The engine reads a word past the end of a list as 0, and the generator wrote just the list:
   Yosys refuses it (`Assignment pattern element count mismatch: got 2, expected 4`); a real list
   names every word. A word the engine starts unknown was written `32'h0000000X`, an X in one digit
   only. Fix: the list is padded with zero words, and an unknown word is `32'bx`.

4. **The course accepted a number for a signal declared with a list of names.**
   `state_t state; ... state <= 2'b00;` elaborated, and means what the learner meant, but
   SystemVerilog (IEEE 1800-2017 6.19.3) allows an enum variable only a name from its list or
   another signal of that list, and Verilator refuses it (`ENUMVALUE`). Yosys accepts it. Fix: the
   elaborator refuses it, with a message naming the signal and the list
   (`packages/hdl/src/elaborate.ts`, `ENUM_NUMBER`; brief `docs/notes/real-tools/enum-assignment.md`;
   tests in `enum.test.ts`). No shipped text did this, so no lesson, hint or reference changed. It
   is a case for the managing session: a learner's text that was accepted before is now refused.

5. **The generator could write a state machine's names with a reset no name has.**
   `machineText(retry-one-hot, enum)` reset to `4'b0000`, which is no state of a one-hot machine,
   and so is a number given to a signal of names (4). No figure or challenge shows that pair. Fix:
   the generator refuses the style for a machine with no all-zero state, instead of writing text
   real tools reject. (`packages/dd-model/src/fsm.ts`.)

## Found, not a mismatch of the course

- **Yosys 0.33 (Ubuntu 24.04's package) does not read the array list `'{...}`** that the ROM
  lesson teaches (`unexpected OP_CAST`). It is valid SystemVerilog and Yosys 0.69 reads it. The
  check pins Yosys 0.69 by pip rather than weaken a lesson for an old tool.
- **Verilator accepts a list shorter than its array**; Yosys does not (3). Only the second tool
  caught it.

## Not checked

- Fragments inside hints and prose (a few lines to put inside a module) are not modules. The
  reference solutions that spell them out are checked.
- The course's modules as text are the generator's flattened gates at the one width the lessons
  use; whether `alu` is right at another N is the engine's tests' to say, not the tools'.
- The five largest texts (the whole datapath and machine, thousands of gates) are linted and
  synthesised but not simulated: the engine and Verilator are compared on their parts.
