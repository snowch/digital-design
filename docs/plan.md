# The course plan

What the course teaches, module by module and in what order, and what has been decided since the
plan was first written. The plan comes from the author's brief for the course (Prompt B); this
file is its copy in the repository, kept current. It says what is planned, not what is built: the
list of lessons on the site shows which modules have lessons, worked out from the lessons
themselves.

The learner finishes able to trace physical signals → Boolean logic → combinational circuits →
state → registers → memory → datapath and control → CPU → instruction set → assembly → traps →
system calls, and to say "I understand how a computer works because I built one."

## The modules

Built in order; each module's capstone reuses components from earlier ones. Every lesson has the
ten sections of the lesson format and follows the loop predict, build, run, break, explain,
generalise. Modules 12 and 13 were numbered 13 and 15 in the brief: see the decision of 5 October
2026 below.

| Module | Teaches | Key labs | Capstone | Reuses |
| --- | --- | --- | --- | --- |
| 0 Meet the machine | what a computer does; the abstraction ladder; using the lab | run a tiny program, pause, inspect PC/registers/memory, click into the datapath | trace one instruction to changed state | nothing |
| 1 Signals and bits | thresholds, noise margins, binary, words, signed/unsigned, hex | noisy-threshold experiment, bit inspector, interpretation toggle | explain why a bit pattern has no inherent meaning | physical-intuition notes from the D flip-flop tutorial |
| 2 Boolean logic | NOT/AND/OR/XOR, truth tables, expressions, NAND universality, simplification, depth | circuit builder with auto-test and fault diagnosis | NOT and XOR from NAND; a minimised circuit under a gate budget | nothing |
| 3 Combinational design | mux, demux, decoder, encoder, comparator, adders, overflow, buses, hierarchy | 2/4-way selectors, half/full/ripple adder, equality comparator, ALU slice | parameterised N-bit ALU slice | Module 2 builder |
| 4 Memory in a circuit | feedback, latches, D latch, clocking, master/slave, D flip-flop, setup/hold, clock-to-Q, metastability | **Prompt A Slice 1**, extended with the latches quick ref as in-lab reference | reliable one-bit storage element, explained | existing D flip-flop tutorial, interactive, quick ref |
| 5 Registers and FSMs | registers, load-enable, reset, counters, shift registers, register transfer, FSMs, encoding, synchronous design | 16-bit register, counter, **Prompt A Slice 2** | a controller following a given state machine | existing FSM and timing tutorials; Module 4 flip-flop |
| 6 Memory | addressing, decoders, RAM, read/write, register file, byte addressing, alignment, memory-mapped I/O | memory explorer: buses, selected cell, out-of-range access; drill-down RAM → cells → flip-flops | enough memory to run a program | Module 3 decoder, Module 5 register |
| 7 The ALU | arithmetic, logic, flags, operation select, width, slicing to 64 bits, overflow | operation select, carry stepping, fault injection | ALU passing a generated test suite (normal, boundary, adversarial) | Module 3 slice |
| 8 CPU datapath | PC, fetch, IR, register file, operand select, ALU, write-back, data memory, branching | every bus and control signal inspectable; next-state prediction | execute one instruction by stepping every transition | Modules 5–7 |
| 9 Control | control signals, decoding, combinational and FSM control, micro-ops, multi-cycle, illegal instructions | views: instruction / micro-op / control-signal / circuit | add a new instruction to the CPU | Module 5 FSM, Module 8 |
| 10 ISA | why an ISA, encoding, operands, immediates, loads/stores, branches, calls, invalid instructions, architectural state | encoding explorer, with a calculator built from the learner's ALU; ISA vs microarchitecture split | design, justify and implement one new instruction | Module 9 |
| 11 Assembly | registers, arithmetic, memory, loops, conditionals, arrays, functions, stack, calling convention, recursion, debugging | assembler, debugger, breakpoints, watch, stack view | a useful program in the course assembly | Modules 8–10 |
| 12 Traps and interrupts | synchronous exceptions, interrupts, cause, state save, vectors, privilege, return, nesting, system calls | trap timeline pausable at every hardware transition | minimal system-call mechanism | Module 5 FSM, Module 9 control |
| 13 Final machine | all milestones from logic primitives to traps | partially completed machine spec | the machine runs a small program and the learner traces it to logic | everything |

The course machine, one original machine used throughout, is specified in `docs/machine.md` and
`docs/isa.md`, written and approved before Module 8 (checkpoint 2 below).

## Beyond the machine: two optional chapters

After Module 13, outside the numbered modules, one lesson each. Each shows a mechanism on the
course's own machine; neither has the reader build a compiler or a kernel. Each ends by pointing
on to the author's `snowch/computer-systems` book, which works with xv6, a real teaching kernel,
and the real toolchain.

| Chapter | What it shows | Needs |
| --- | --- | --- |
| A compiler | a line from the course's story translated into the course's instructions as the reader watches, opened down to the datapath | Modules 10 and 11 |
| A kernel | a system call followed from a program into its handler and back; a timer switching between two programs | Modules 12 and 13 |

They were the brief's Module 12 ("teaching compiler") and Module 14 ("minimal kernel"). They are
built last, after Module 13.

## SystemVerilog, module by module

The language is one more view of a circuit's behaviour, beside the truth table, the expression
and the drawing, and never the thing to memorise. The target is the part of the language that
turns into gates (the synthesisable subset), never the full language. The subset the course
accepts grows with the modules, and each challenge says which direction is graded: draw the
circuit, or write the text.

| Module | HDL subset unlocked | Graded direction |
| --- | --- | --- |
| 1 | none: signals sit below the language | none |
| 2 | `module`, `logic`, `assign`, bitwise operators | draw the circuit; read the HDL |
| 3 | `always_comb`, `case`, vectors, concatenation, `parameter` | either; capstone requires both |
| 4 | `always_ff @(posedge clk)`, non-blocking assignment | draw; the latch is shown as the construct synthesis warns about, and metastability as what the language cannot express |
| 5 | `enum`, FSM idioms, `generate` | write the HDL; drill down to the circuit |
| 6–7 | memories as arrays, `$readmemh`-style initialisation | write |
| 8–10 | module hierarchy; the CPU is written in HDL and the learner reads and modifies it | write; "add an instruction" is an HDL edit |
| 11, 12 | testbench constructs (`initial`, `#`, `$display`) for checking programs and traps | none |
| 13 | optional: run the course CPU through Yosys or Verilator offline (CI or local, results recorded; no synthesis toolchain ships to the browser) and compare against the simulator | none |

## Graded projects

Ten graded projects run through the modules: a Boolean circuit, an arithmetic unit, a state
machine, a register and counter, a small memory, an ALU, a datapath, an instruction, an assembly
program and traps, plus the final machine. Every project has three tiers: guided (components and
hints), semi-guided (the specification given, the implementation open) and engineering
(requirements and tests only). The specification and the tests are never hidden.

## When a module is done, and the checkpoints

A module is done when its tests are green at all four levels (unit, integration, educational,
cross-book), `docs/` is updated, its capstone is reusable by the next module and the next module's
plan says so, and its one-page note exists: what was reused, what was extracted, what would be
changed.

The author reviews the course at five checkpoints:

1. After Modules 0 to 3 are usable (logic and combinational design on the builder).
2. After `docs/machine.md` and `docs/isa.md` are written, before Module 8.
3. After Module 9 (one instruction added to the CPU end to end).
4. After Module 11 (assembler and debugger).
5. Before Module 13, the final machine.

## Course acceptance

A learner can construct basic logic, combinational and sequential circuits, registers, memory, an
ALU, a datapath and control; execute an instruction; write and debug assembly; understand traps
and interrupts; execute a system call; and trace the whole path back down toward logic. The final
demonstration: user program → assembly → machine code → fetch → decode → register read →
ALU/memory → register write → PC update → next instruction, pausable and inspectable at every
step.

## Decisions since the brief

### 6 October 2026: the platform taken from snowch/learning-platform

The schema, the runtime and the primitives moved to `snowch/learning-platform` when the
metadata-systems course became their second consumer, as `docs/inventory.md`, section 5.7,
planned; the author made that repository public and agreed that this course switch at once,
because two copies of one runtime drift apart with every fix. This course now takes the packages
as the metadata course does: a checked copy in `platform/` at the commit `platform/SOURCE.json`
records, renamed from `@dd/` to `@platform/`, unedited (`npm run check` says so). The move changed
nothing this course uses; "Predict again" became optional for a figure, and every figure here
still passes it. `docs/platform.md` says how a fix to the platform reaches this course.

### 6 October 2026: checkpoint 3, one instruction added end to end

The author reviewed the course after Module 9 (`docs/checkpoints.md`, "Course checkpoint 3") and
took every recommendation, asking for the best reader and learner experience:

1. **The door is sampled once per instruction**, at the edge that ends it, as the timer counts
   instructions, so the single-cycle machine and Module 9's see the same door at the same
   instruction (`docs/machine.md`, "Devices").
2. **The capstone stays a call through a register**, which needs only a column of the decoder and
   two terms of its checks: the lesson's point is that an instruction whose transfers and edges
   the machine already makes needs nothing more.
3. **Its second challenge stays** as the run of the whole machine with the learner's change in it,
   end to end.
4. **The decoder's insides are placed by hand** before Module 10, as the machine's levels are.
5. **The 11-pixel rule holds for the page as it loads.** A drawing the learner zooms out shows its
   words smaller, down to 0.6 of their size, then hides them (`docs/notes/overview-strip.md`).

The author also asked for the gaps the report listed for the learner to be closed: a wide word
typed in "Try it" rather than set a bit at a time, a fault lab's outcomes shown one fault at a
time, each once its fault has run, and a wide drawing opened at the part its words name.

### 6 October 2026: a cover at the top of the front page

The author asked whether the course should have a cover page, and took the recommendation: the top
of the front page becomes the cover, rather than a page a reader clicks past on every visit. It
says what the course is, then leads in with one button: "Start with Module 1" for a new reader,
or "Continue with" the first lesson not finished for a reader who has passed a challenge. Under
the way in, a picture of the machine the course builds: one step of a program as a flow of its
parts, in plain words. Below it, one list gives every module the plan has, from 0 to 13, each
with a name in plain words and its lessons, or a line saying it is still to be written. A reader
meets the cover before every lesson, so its words use no term a lesson introduces; a test holds it
to the term gate, and another checks its list of modules against the table above.

The picture changed twice the same day. Module 8's last drawing, small, was too cluttered for a
cover on a phone, so a flow of the machine's parts took its place. The flow first named under
each part the modules that build it, and came before the button; a reader then met "Modules 5
and 8" first and asked where Module 1 was and where to start. The button now comes first, and the
parts name no modules: the list gives the order to read them in.

Then the author sketched a cover of their own: a band with the title, the button and a picture,
and the path through the course in reading order beneath it. The cover follows its structure in
the course's own faces and colours. The way in comes first; beside it, the freezer-room alarm from
Module 2, a real circuit the reader can press; under it, the path in five stages, Signals, Memory,
Machine, Programming and The whole machine, each with its modules in order and a line for a stage
still to be written. The flow of the machine's parts went, and with it the last module numbers out
of reading order.

The same evening, with 32 lessons listed, the author found the page long and asked for the
modules to be collapsed. Each module is now one line: its name, and a summary of its lessons and
how many of their challenges are complete. Pressing the line shows its lessons. The module of the
lesson the button names starts open, so a new reader sees Module 1's lessons and a returning one
the module they are in; so does the module of a lesson the reader has just left. The author then
found the five stages running on into the list, and a rule across the page now parts them.

On 7 October the author forwarded a first-time visitor's review, made by a program that reads a
page without running its scripts. It saw only the line that the course needs JavaScript, and asked
that a newcomer know within 30 seconds that they will build a computer, and how the course
teaches. The page now says so before any script runs: its title is the course's, and the build
writes the cover's own words into it, as the description a search result shows, as what a shared
link's preview shows, and as the cover itself for a browser that runs no scripts, so they cannot
drift from the cover. On the cover, the opening's first sentence stands apart, larger: "You build a
working computer from its parts, starting from two voltages on a wire." The rest says, in short
sentences, that each idea and each name arrives when the circuit raises the question that needs
it, and that every simulation runs the real circuit. Each of the five stages now says what you
build in it, and each page names itself in the browser's tab. The words went through brief C3.

### 6 October 2026: a calculator of the course's own, in Module 10

The author asked whether to bundle their programmer's calculator, `snowch/programmer-calculator`,
with the course, and took the recommendation below.

1. **The app is not bundled.** It stays a product of its own, for its own readers. Inside the
   course it would teach a second vocabulary and answer the course's predictions:
   - its flags are the processor letters C, V, Z and N, where Module 7 names ZERO, MINUS, COUT
     and OVER;
   - its text names commercial instruction sets (RISC-V, x86, ARM) and C's types and constants,
     and none of it went through the drafting process;
   - its exercises include textbook examples that the originality notes of `decoders` and
     `state-encoding` name as what those lessons do not do: a 3-to-8 decoder, a 7-segment display,
     Gray code;
   - it shows at once a word in hexadecimal and its signed reading, which Module 1's predictions
     ask the learner to work out;
   - it fills a word with 0s when the width grows, where the machine's widening copies the top bit
     (Module 8, `constants`).
2. **The course gets its own calculator, designed once as part of Module 10's encoding explorer.**
   It runs the learner's ALU in the simulator, as every figure in the course is a view of the
   circuit:
   - the eight jobs (Module 7), at 16 or 64 bits;
   - the word as bits and in hexadecimal, read unsigned and signed (Module 1);
   - the four flags, under Module 7's names;
   - an instruction's fields, with the constant widened as the machine widens it.
3. **It appears from Module 10 on.** From Module 8 the learner works with constants, addresses and
   branches in hexadecimal (a branch's constant `FFE` is -2: two instructions back), arithmetic
   they have already done by hand. So Module 10's build may also offer the calculator on Module
   8's and 9's pages, but only on a page whose predictions it cannot answer. Its strings go
   through the drafting process like every other string.

### 6 October 2026: two details of the machine, decided for the reader

Module 8's build asked two questions about `docs/machine.md` and `docs/isa.md`, and the author
asked for whatever serves the reader's learning.

1. **A door already open at reset raises its event at the first edge.** The door's event comes
   from a register that holds DOOR's level at the edge before, and a reset makes it 0, as it makes
   every register 0 since Module 5. So the machine starts with the door counted as closed. It is
   the plainest circuit for a learner to open in Module 12, and a freezer that starts with its door
   open alarms. Module 8 had kept the level inverted, so that an open door raised nothing.
   `docs/machine.md` says so under "Devices".
2. **The check on a control register's number waits for Module 9.** `docs/isa.md` makes a system
   job that names a control register outside 0 to 4 illegal (cause 21). The check needs the
   constant as one of the decoder's inputs: a new wire, in three lessons' drawings, into a block
   Module 8 draws closed and could not explain. Module 9 opens the decoder and teaches illegal
   instructions, so it adds the input and the check there. Until then the machine stops on any of
   system jobs 1 to 3 as a job a later module builds.

### 6 October 2026: the first extraction of shared primitives

The brief asks for the author's approval before the first extraction of shared primitives, at
Slice 2, one approval for the batch. Module 5's note listed seven candidates; the author approved
the six with consumers in two modules, and the seventh, the state machine's row of input buttons,
waits for a second module. `PredictionChallenge`, `FaultInjector`, `Stepper`, `Timeline`,
`StateInspector` and `DrillDown` now live in `packages/primitives`, and the figures in
`dd-views` use them; every lesson renders as it did. `docs/platform.md` says what the platform
shares and what is the course's own.

### 6 October 2026: the course machine (checkpoint 2)

The author approved `docs/machine.md` and `docs/isa.md`, taking every recommendation the draft
made. In short: sixteen registers alike, 32-bit instructions in one layout of hexadecimal digits,
Module 7's ALU with no kept flags and branches that compare two registers, a 2 KB memory (a ROM
for the program, a RAM, the shop's devices) in which every address fits in an instruction,
little-endian words of 64 bits, traps through five control registers and one handler address,
and an assembly language of register transfers in Module 5's text form. `docs/machine.md` gives
each decision with its reason and the alternative not taken. Module 8 may now start, and from it
on a lesson may state what the two files fix. The two lessons that spoke of the machine before
it was decided, `bytes` and `memory-map`, agree with it.

### 5 October 2026: the compiler and the kernel become optional chapters at the end

The brief deferred them without giving a reason: "Module 12 (teaching compiler) and Module 14
(minimal kernel) are out of scope. Build Modules 0–11, 13 and 15 and leave hooks for the two
deferred ones." The author asked whether to keep them, and decided:

1. **They are optional chapters after the final machine**, outside the numbered modules, under
   "Beyond the machine". Both need the finished machine: a compiler targets its instruction set
   and assembler, and a kernel runs on its traps.
2. **The core modules are numbered without a gap.** Traps and interrupts become Module 12 and the
   final machine Module 13, and the brief's references to 13 and 15 move with them (the
   SystemVerilog table and checkpoint 5 above). Otherwise the list of lessons would say "Modules
   12 and 14 are still to be written" for good. No lesson used either number when this was
   decided.
3. **Each is one lesson, not a module**: the mechanism shown on the course's machine (the table
   above), with a pointer on to computer-systems for the full treatment.
4. **They are built last**, after Module 13, so they cannot delay the core course.
5. **The lesson schema will need a flag for an optional chapter**, so the list of lessons shows
   them under their own heading and leaves them out of its count of modules still to be written.
   Not done yet: nothing needs it until the first chapter is written.

Why: each is a software project as large as several hardware modules, which the circuit builder
and simulator barely help with; computer-systems already covers the ground with real tools; and
the course meets its acceptance criteria without them. Originality was weighed and is not the
reason: hardware, then assembly, then a compiler, then an operating system is the subject's own
order. The risks lie in particular choices, which each chapter's `originalityNote` must address:

- **The compiler**: no stack-based virtual machine between the language and the assembly
  (Nand2Tetris's projects 7 and 8); no object-based language like its Jack, and not its split
  into a tokenizer and a parser that writes out a parse tree, then code generation; not the
  Dragon Book's `position = initial + rate * 60`.
- **The kernel**: not xv6's structure or names (its trap frame, its system-call table and
  numbering); no RISC-V privileged names (`ecall`, `mcause`, `mret`), which the brief's ban on
  commercial instruction-set conventions already covers; not the stock operating-systems examples
  (processes A, B and C taking turns, a producer and a consumer sharing a buffer, `fork`).
- **Module 12, traps and interrupts**, whichever way this had gone: its closest precedent is Patt
  and Patel's LC-3 book (trap routines, interrupts, a privilege bit), more than Nand2Tetris, and
  its `originalityNote` should name it.
