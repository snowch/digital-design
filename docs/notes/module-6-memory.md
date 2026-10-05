# Module 6: Memory

A working note, written as the module was built. Times are read from the clock (`date -u`). It
records what went wrong as plainly as what went right. "The managing model" is the model that
built the module; "the drafting subagent" is the model that drafted every learner-facing string.

## Times

- Started: 2026-10-05 22:33 UTC (first command in the session).

## The plan, as decided before any code

Read first: CLAUDE.md, `docs/plan.md`, `docs/notes/modules-5-6-7-plan.md`, `docs/authoring.md`,
`docs/style.md`, `docs/simulator.md`, the inventory's sections 1 and 8, `docs/checkpoints.md`,
the notes on Module 5's registers lesson, diagrams, straight wires and SystemVerilog, and the
lessons `registers`, `decoders` (and their prose and labels). Built the course and looked at the
registers lesson's pages.

### Four lessons, and why the split falls where it does

The module's list is addressing, decoders, RAM, read and write, the register file, byte
addressing, alignment and memory-mapped input and output. Each lesson takes one question the
previous one leaves open, and each is about the size of `registers`:

1. **`ram`: How can a circuit keep many words and find one again?** (address, RAM). The office
   keeps a setting for each of the four rooms the decoders lesson numbered 00 to 11, and shows
   any one of them on the display. One register per room; Module 3's decoder turns the room's
   number into one register's load enable, and a selector picks the word the display shows. The
   memory explorer opens the block to its registers, a register to its flip-flops, a flip-flop to
   its latches. The break: an address with more bits than the memory uses lands on a word that
   already holds something. Writing waits for an edge; reading does not.
2. **`register-file`: How can a circuit give out two words at once?** (register file). The
   office compares two rooms' settings side by side; one selector gives one word, so a second
   selector on the same registers gives a second word, each with its own address, while writes
   still go one at a time. Why a second write at the same edge is harder. The memory as text: a
   SystemVerilog array, read by index and written in `always_ff`.
3. **`bytes`: How does a memory of bytes keep 16-bit words?** (byte, aligned, alignment). The
   readings are 16-bit words (Module 1's `FF48`), but some things the office keeps are 8 bits. A
   memory whose addresses each name 8 bits keeps a word as two bytes, the low byte at the lower
   address. Two byte banks side by side read a whole word in one access when its address is
   even; a word at an odd address would need two rows, and this memory refuses it.
4. **`memory-map`: How does a program reach the shop's lamps?** (ROM, memory-mapped). The
   lamps, the switches and the display are given addresses of the lesson's choosing; a decoder on
   the address's top bits chooses which part answers. A ROM is a memory filled from a list of
   values when it is made, read and never written; in SystemVerilog, an array with a list of
   values. The capstone is the module's: a memory of the shape a small program needs, bytes and
   16-bit words read and written by address, a ROM, and the shop's devices at addresses the lesson
   chooses, written as text and tested by a script of the reads and writes a program makes.

Merging 1 and 2 would put two new structures and a new construct in one lesson; merging 3 and 4
would put two new ideas about what an address names (a byte; a device) in one. Each of the four
ends on the question the next opens.

### Where a memory is gates and where it is a component

- **Gates**, where the learner opens it: the four-word, four-bit RAM of lesson 1 and the register
  file of lesson 2 are Module 3's decoder and selector and Module 5's register with a load
  enable, about 250 gates each. They open one level at a time: the memory to its registers, a
  register to its flip-flops, a flip-flop to its latches.
- **A component with behaviour**, everywhere a memory is larger: a new simulator primitive,
  `memory`, and a `rom`. A memory of 256 bytes as gates is about 2,000 flip-flops and 25,000
  gates, recomputed at every settle step; a component is one evaluation. It is drawn as one closed
  block that does not open, and every lesson that shows one says that it is simulated as a
  component that behaves as the gates do.
- The `memory` primitive keeps no state of its own. Its contents are a net, as wide as the memory
  (words × width, plus one bit that says whether a list of values has been loaded), which the
  primitive reads and drives, with a second net for the clock's last level, so a rising edge is
  seen as the flip-flop sees one. So a snapshot, the trace, a replay and every view read a memory
  as they read any other net, and nothing in the engine changed. A memory starts unknown, as a
  flip-flop does, unless it was filled from a list.

### The course machine: what this module fixes and what it leaves

From the shared plan: 16-bit words; byte-addressable memory; a word's low byte at the lower
address; a word's address even. Not fixed: the instruction set, the number of registers, the
memory map. The register file's size is a parameter, the lessons use four words, and no lesson
calls it the machine's. The devices' addresses are lesson 4's own and are said to be.

## Log

- 22:33 to 22:40 Read the documents and the worked lessons; built the course; looked at the
  registers lesson's investigation at 1280 pixels.
- 22:40 to 23:00 Platform, before any words (code first, as the rules order it):
  - **The simulator's `memory` and `rom` primitives** (`packages/sim/src/memory.ts`). The
    simulator's own header promised "a second kind of primitive with an `update` on the clock";
    that would have needed snapshots, the trace and replay to learn about hidden state. Instead the
    memory keeps its words on a net it reads and drives, plus a one-bit net with the clock's last
    level, so a rising edge is seen as a flip-flop sees one and nothing in the engine changed. An
    unknown clock or write enable at a possible edge leaves the words it might have written unknown
    where they differ; an address past the last word reaches nothing (write ignored, read X). The
    engine's words are at most 1024 bits, so a memory holds at most 1023 bits; the lessons' are
    far smaller, and the HDL refuses a larger array with a sentence.
  - **dd-model `memory.ts`**: the four-word RAM as gates (`ram4`: Module 3's decoder, four AND
    gates with WE, four of Module 5's registers with a load enable, a word selector), the register
    file as gates (`regFile4`), word selectors (one Module 3 selector per bit), the memory and ROM
    components as closed blocks, a register file of any size as a component (`registerFile`, two
    reads), the memory of bytes (`byteMemory`: two banks, the write enables and ODD as gates), and
    the shop's memory (`shopMemory`). Library entries in `library-memory.ts`, hand-placed insides
    in `MEMORY_INSIDE` (joined to the library's `INSIDE`).
  - **Blocks a drawing may place** (Module 6 block in `BLOCKS`): `register`, `word-selector-2`,
    `ram`, `word-register-16`, `word-selector-16`, `byte-memory`, `table-rom`. Called through
    arrows because `combinational.ts` and `memory.ts` import each other.
  - **Sealed blocks**: a word selector, a memory or ROM component, a 16-bit register, and the
    small split and join blocks inside the memory of bytes never open (`isSealed`, exported from
    the circuit view); the content test's wire check now skips what no learner can open.
  - **HDL arrays** (`packages/hdl/src/memory.ts` and a Module 6 section of the elaborator): an
    array declared after the name (`[0:15]` or `[16]`), optionally filled from a list (`= '{...}`),
    read by index anywhere with no clock, written in an `always_ff` of its own (`mem[A] <= D;`,
    optionally under one `if`). It elaborates to the memory or ROM component, not to gates. Two
    constructs gated per challenge, `array` and `array-init`; the generator writes a memory back as
    an array, so a circuit-text figure can show one.
  - **The memory explorer** (`MemoryExplorer.tsx`): the circuit drawing with drill-down, the word
    inputs, Clock and Start again, and a table of the memory's words by address, marking the word
    each read names and the word the next edge writes, read off the simulator's nets: registers'
    outputs, a component's state net, or two banks interleaved. A second mode lists which part
    answers which addresses (lesson 4).
  - **An answer grader that asks the memory** (`memory-read`), for lesson 3's challenge: the
    simulator reads the filled memory at the case's address; a wrong answer shows "What the memory
    gives" in place of the expected word, as "What your bits read as" does in Module 1.
  - **A wide word with unknown bits is drawn a digit per four bits** (`XXXX`, `FFXX`) in the
    circuit view, where it had printed sixteen binary digits that ran into the next part.
  - Tests: 12 in dd-model (the RAM, the register file, the memory, the bytes, the shop) and 5 in
    hdl, all passing first time except the shop's reference, whose read of Q by name found another
    net called Q first (a reference built from blocks without output nets of its own; fixed by
    naming them).
- 23:00 to 23:10 The four lessons' structures with placeholder words, each checked by the content
  tests and looked at in screenshots. Two insides were laid out by hand after the first look
  (the RAM opened was a tangle; the memory of bytes drew its bit pickers as empty boxes, which
  became small sealed split and join blocks with named ports).
- 23:10 to 23:40 The prose. One voice sheet shared by every brief (`00-voice.md`, reproduced in the
  appendix), a fact sheet per lesson, five briefs per lesson (A question to prediction, B
  investigation and construction, C failure and explanation, D generalisation to the model note,
  E labels), and one for the views' and the checker's own strings: 21 briefs. Every fact was
  checked against the simulator first (a throwaway test printed each prediction's answer and each
  fault lab's failing steps; the facts tests now hold them).
