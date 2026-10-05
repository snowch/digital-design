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
| 10 ISA | why an ISA, encoding, operands, immediates, loads/stores, branches, calls, invalid instructions, architectural state | encoding explorer; ISA vs microarchitecture split | design, justify and implement one new instruction | Module 9 |
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
