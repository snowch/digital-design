# Module 13, the whole machine: the plan

Written by the managing session on 8 October 2026, before the build started, as Modules 8 to 12's
plans were. The build reads it first and keeps to it. A change to this plan is the managing
session's to make; a build that needs one says so in its module note and carries on inside the
plan. `docs/plan.md` is the course plan the module comes from; `docs/machine.md` and `docs/isa.md`
specify the machine.

**Checkpoint 5 and this plan.** The course plan puts checkpoint 5 "Before Module 13, the final
machine". The author asked to start Module 13 while Module 12's last fixes are made, so the build
starts from this plan now. The managing session writes the checkpoint 5 report when Module 12
merges, and puts the decisions below to the author there, each with its recommendation. Their
answers can change this plan as the build goes, as checkpoint 4's did for Module 12.

## What the module covers

- **The course plan**, row 13: the module teaches "all milestones from logic primitives to
  traps". Its lab is "partially completed machine spec". Its capstone is "the machine runs a small
  program and the learner traces it to logic". It reuses everything.
- **The graded projects**: "the final machine" is the last of the ten. Every project has three
  tiers: guided (components and hints), semi-guided (the specification given, the implementation
  open) and engineering (requirements and tests only).
- **Course acceptance**, the final demonstration: "user program → assembly → machine code → fetch →
  decode → register read → ALU/memory → register write → PC update → next instruction, pausable
  and inspectable at every step."
- **The cover** names the module "The whole machine". Its stage, shared with Module 12, reads
  "Make the machine respond when errors occur; run complete programs from start to end."

Lesson 12.8 ends on the question this module answers: "Every part was built, but in separate
lessons, on separate drawings. Can you follow one of the shop's programs through the handler and
down to the gates of the one machine that runs it?"

Module 0 opened the same question from the top. Its first lesson ends "The machine is a box. It
runs lines. But what is inside the box, and how does it work out 66?" Its second lesson took one
line down to one wire, on a fixed path, through nine levels. It closed on "each module builds one
level from the one below, then uses it as a box". Module 13 closes that loop. The learner runs a
shop program on the machine whose every part they have now built, and follows it down past the
boxes, on any path they choose.

A module may be more than one lesson. Size each lesson like those of Modules 8 to 12: about 1,150
to 1,350 words to read, about five figures, and one or two challenges. Split where the material
needs it, and say in the note why the split falls where it does. Every lesson has the ten
sections. The lessons are module 13, order 1 onward. Module 13 is the last numbered module; the
two optional chapters come after it.

## The learner

Modules 0 to 12 are done, 54 lessons. What the learner has already met, so Module 13 builds on it
and does not repeat it:

- **every part, built and tested on its own**: the gates (Module 2) and the parts made of them
  (Module 3), the flip-flop (Module 4), registers and state machines (Module 5), memory and the
  register file (Module 6), the ALU (Module 7);
- **the machines**: Module 8's single-cycle datapath; Module 9's machine of several edges, its
  decoder and its controller, with an instruction added in 9.5; Module 10's instruction set, with
  "set if less" designed and built in 10.5; Module 12's copy of that machine with the trap
  hardware (12.7);
- **the programs**: Module 11's assembler, debugger, functions and stack, and Module 12's handler,
  user mode, system calls and interrupts, all at the instruction level;
- **Module 0's ladder**: one line of one program, followed to one wire.

What they have never done:
- watched a program run on the circuit with every level shown at once;
- followed a value of their own choosing from a program line down to a gate;
- seen the whole machine's text;
- wired the parts into one machine and seen their machine run a program.

## What Module 13 teaches

- **The whole machine as one.** Every part of it, and the module that built each part. Where the
  parts meet: the buses and the control lines between the blocks. One instruction's edges on the
  whole machine, a trap among them.
- **The full path**, the course's final demonstration. A program's line becomes a word. Then come
  fetch, decode, the register read, the ALU or the memory, the register write, the PC update and
  the next instruction. At every edge each level can be inspected at that moment: the line, the
  word and its fields, the control signals, the parts' values. Any part opens down to a gate or a
  flip-flop, and the values agree at every level.
- **Tracing as a skill.** Choose an instruction and an edge, then follow one value from the
  program down to one gate's output. Say what each level hides and why the level above may ignore
  it. Module 0's ladder showed this on one path, chosen for the learner. In Module 13 the learner
  chooses the path, on any instruction.
- **The lab, a partly completed specification of the machine.** The specification is the whole
  machine's text, the view Modules 8 to 10 used. Parts of it are left for the learner, in the
  course plan's three tiers (see "The lab and the capstone").
- **The capstone.** A small program of the learner's own runs on the whole machine, and the
  learner traces it to logic.
- **What a real machine does that this one does not**, briefly and in the model notes. Real
  machines run several instructions at once, keep copies of memory close at hand, and take many
  clock edges for some instructions. Nothing of this is taught; it is named, so the learner knows
  where the course's machine stops being a real one.

## The machine

Module 13's machine is Module 12's copy, `machine-traps` (`packages/dd-model/src/traps.ts`, whose
header says "Module 13 takes this copy"), with its comparison to the instruction-level model
(`traps-run.ts`, `traps.test.ts`).

- **Decision 1: the two instructions the learner added.** Kind 9 (call through a register, 9.5)
  and kind A (set if less, 10.5) exist only in "your copy" of Modules 9 and 10. `machine-traps`
  has neither, and `MODULE_12` refuses kinds 9 to F. **Recommendation:** the final machine runs
  both, so that every instruction the course had the learner add runs on the machine that ends the
  course.
  - The model gains `MODULE_13`, which is `MODULE_12` with `callThroughRegister: 9` and
    `setIf: 10`. Both options exist in `machine.ts` already.
  - The assembler accepts both on Module 13's pages.
  - The circuit gains 9.5's decoder change and 10.5's word for Y. The decoder takes options
    already. The word for Y exists only in 10.5's text and the course module set `machine9-set`,
    not in a drawn datapath.
  - `docs/isa.md` records both as the course machine's, with the author's approval at
    checkpoint 5.
  - If the author declines, Module 13 uses `machine-traps` as it is, and its first lesson says why
    the two are not on it.
- **Decision 2: whose parts run.** No page runs a learner's own earlier answers. "Your copy" in 9.5
  and 10.5 is built from the course's references, and a lesson cannot read another lesson's work:
  each lesson's store is its own (`platform/lesson-runtime/src/state.ts`). Checkpoint 3's "let a
  challenge start from the learner's own answer to an earlier one" was never built.
  **Recommendation:** Module 13 says plainly that the machine is built from the course's parts,
  each of which passes the tests the learner's own part passed. It does not suggest that the
  learner's answers run. In the lab, the learner's own text is what runs: their wiring of those
  parts. Reading earlier answers would be a platform change in `snowch/learning-platform`, and it
  is not part of this module; the note records it as a candidate.
- **The circuit and the model agree after every instruction**, traps, interrupts and the two
  added kinds included, as every machine since Module 8 has. Lesson 10.1 taught that a program
  relies on that agreement.
- **The machine's text.** No text of Module 12's whole machine exists. The lab needs one: a top
  module that joins the parts, with course modules for the parts the learner does not write, as
  the `machine9` sets do. It must elaborate to a circuit that agrees with the drawing and the
  model, as Module 9's `machineText()` does.
- **Speed.** The trap machine runs about 80 edges a second in Node: 362 edges took 4.6 seconds,
  with the comparison. A grade runs in the browser, and the lesson grades every completed
  challenge again when it loads (`verifyCompletion`). Measure the lab's and the capstone's grades
  in the browser. Keep each under about ten seconds on a slow device, with short programs. Say in
  the note what was measured.

## Tracing down, and what it needs

- **Opening a block from a figure's props.** The `datapath` figure can be opened by hand, a level
  at a time, but not from its props. `focus` only scrolls the top level, and finds a part inside a
  block only by its path. `circuit-explorer` and `fault-lab` already take a `scope`. Give the
  machine figures the same, in course code (`packages/dd-views`), so that a trace can open the
  machine where its words point. Module 12's note lists this as a platform change for 12.7. It is
  not one, and 12.7 can use it once both modules are on `main`.
- **Parts that never open.** The register file, the memory map, the PC, the IR, the control
  registers and the controller's state register run as simulator parts, and they never open.
  - A trace that reaches one of them names the module that built that part.
  - It opens that module's own drawing of one bit (a register's bit is Module 5's), driven by the
    machine's values at that moment.
  - So every path ends at a gate or a flip-flop.
  - The build decides how; the note says what it did.
- **Limits that shape figures**: the `datapath` figure's run stops at 500 edges, and the edge
  timeline shows at most 12 edges. Module 12's note asks for a `from`, as the trap timeline has.
  Lift a limit only where a lesson needs it, and say so in the note.

## The lab and the capstone

- **The lab, "the final machine", in three tiers.** It is one challenge with three ways in, as
  11.7's was, offered with the challenge's own buttons.
  - **Guided:** the machine's text with a few connections left out, each marked, with hints.
  - **Semi-guided:** the parts and their ports given, with the specification of the connections.
    The joining is the learner's.
  - **Engineering:** the requirements and the tests alone.

  The tests run programs on the learner's machine and compare it with the instruction-level model
  after every instruction, as the course's own checks do. The programs cover:
  - a fault that goes to the handler;
  - a system call;
  - an interrupt;
  - each of the two added kinds, if decision 1 holds.

  A failure says which instruction first disagreed, and how, without the answer. Module 9's
  `machine-text` challenge (23 tests) is the precedent to start from.
- **The capstone.** The learner writes a small program for the shop, in the course's assembly,
  and runs it on the whole machine. The graded questions ask what a named wire or gate holds at a
  named edge of a named instruction of that program, which only a trace answers. The tests compute
  the answers from the circuit for the learner's own program, so no two learners' answers need be
  the same. Feedback says which level to look at, never the value.
- **Neither may be answered from the page** (Module 12's review, A2). No figure lists the lab's
  missing connections or runs the capstone's questions. A hint offered as "a smaller example" is
  no part of the answer and no case of the task.

## Figures

A figure for every idea, readable at 375 pixels, and one in a lesson's opening where it helps the
learner picture the question. At least:

- **the whole machine with its makers**: the final machine's drawing, each block labelled with the
  module that built it, opened at the part the words name;
- **the full path**, the course's final demonstration:
  - a program's line, its word and its fields, the control signals and the machine at the same
    edge, stepped together and pausable at every edge;
  - drill-down from any part, with the values the same at every level;
  - Module 9's four views (9.4) and Module 0's ladder are where to start;
- **a trace for any instruction and edge**: Module 0's ladder, made general;
- **the capstone's program** with what each level shows at a chosen edge.

Every figure passes the diagrams and aesthetics tests at both widths. A large drawing opens on the
part its words name. A figure's results show only after the run that makes them, and say only what
is true of that run (Module 12's review, A6).

## The SystemVerilog this module brings

- **The whole machine's text**: read, then completed in the lab, in the subset the learner has. No
  new construct is needed for it.
- **Decision 3: the testbench and the real tools.** The course plan gives Modules 11 and 12 the
  testbench constructs (`initial`, `#`, `$display`), and Module 13 an optional offline run through
  Yosys or Verilator, compared with the simulator. Modules 11 and 12 brought no testbench
  constructs, since no lesson needed them. Today:
  - the parser refuses `initial` with "`initial` describes a test, not hardware; the course meets
    it in a later module";
  - the lexer refuses `$`;
  - a delay's `#` gets a parser message that does not say what it is.

  No HDL tool is installed here or in CI, and apt offers all three. The generator cannot emit the
  machine as standalone SystemVerilog: it drops every memory part, and its text does not
  elaborate back.

  **Recommendation:**
  - Module 13's lessons run no testbench.
  - The capstone's note on hardware may show a short testbench for the machine as plain code to
    read, with `initial`, `#` and `$display` said in words. The course's engine does not run it.
  - The parser's message for `initial` changes, since no later module meets it.
  - The offline run is a separate engineering task after Module 13, if the author wants its claim
    on a page. It would need a generator that emits the whole machine, a testbench, and a recorded
    comparison with the simulator on the course's suite.

  The course plan's table changes with the author's answer.

## Terms

Rationed on `main` with Module 12: 85 terms, the last six being trap, handler, user mode, system
mode, system call and interrupt. The gate matches a word's stem followed by letters, ignoring case.

- **Candidates for Module 13**, each rationed only where the page in front of the learner raises
  it:
  - "CPU", for the machine the learner has built, once the whole of it stands on the page. It is
    unused anywhere, and it is the name the learner will meet next.
  - "machine code", for the words the assembler makes.
  - "abstraction", for what each level of a trace hides.

  List each in the note.
- **Cannot be rationed**, being on the cover or in Module 0's strings: simulation, trace,
  program, machine, model, hardware, test, level, step, run and others. They stay plain words.
- **Already used, so they need no rationing**: simulator, chip, decode, specification,
  requirement, processor, execute.
- **"Kernel" and "operating system"** belong to the optional chapter that follows; "compiler" to
  the other.
- **Words with two meanings on one page.**
  - "Level": a wire's high or low (Module 1), and a level of a trace (Module 0's ladder).
  - "Trace": the learner's following, and a recorded run.
  - "Edge", "call", "job" and "stop".
  - "The program" means the user program, as Module 12 decided.

  Say which meaning where both appear.

## Originality

The standard presentations are close. Do not reproduce or closely follow:

- Nand2Tetris's "Computer" chapter: the Hack computer's CPU, memory and ROM joined in its HDL
  (`CPU.hdl`, `Computer.hdl`), and its test programs and games;
- Harris and Harris's and Patterson and Hennessy's "putting it all together" for the multicycle
  processor, and their test programs;
- Patt and Patel's LC-3 complete datapath and its instruction cycle in six phases;
- Petzold's assembled computer in *Code*, and the well-known breadboard computers and their
  programs;
- the stock programs: multiplication by repeated addition, Fibonacci numbers, the largest of a
  list, a sum from 1 to n, a blinking light.

The course's own world is the shop. The final run is a shop program the learner knows, such as
Module 0's program that compares the two rooms, or 12.8's handler with its user programs. So the
course ends where it began. Each lesson's `originalityNote` names the textbook version of its
topic and how the lesson differs, in the same commit as the lesson.

## The platform, and working beside Module 12

- New code goes where the earlier modules put it: new files where it can be, and edits to shared
  registries as short appends in a block of their own, with a comment naming the module. Keep
  every existing figure, challenge and lesson working, and their tests green.
- The shared primitives are in `platform/`, a checked copy of `snowch/learning-platform`. Change
  them only there, then sync.
- **Until Module 12 is on `main`**, its last fixes are being made in parallel, so leave these
  alone:
  - Module 12's lessons;
  - the grader (`program-tests.ts`, `graders.ts`);
  - the debugger and the program editor;
  - `strings11.ts` and `strings12.ts`.

  Put Module 13's own words in `strings13.ts`, and its figures in files of their own. If Module 13
  needs a change in one of those files, wait for Module 12's merge and say so in the note.
- The whole check takes about 45 minutes. Ten stored screenshots fail in a build container on
  `main` too (text rendering); the managing session's container and CI pass them, and CI is the
  authority. Keep the browser tests to what only a browser shows, and say in the note what the
  module added.

## Branches, merging and the note

- The build works on `module-13-machine`, from the session branch at the commit that adds this
  plan, since that branch carries Module 12 and `main` does not yet. It pushes only there. It never
  pushes to `main`, opens a pull request or runs the deploy workflow.
- When Module 12 reaches `main`, merge `main` into the branch. Merge it whenever it moves after
  that, and before finishing, and run the check again after each merge.
- The managing session merges the branch into `main`, after running the check, walking the built
  site, and having each lesson read by a reviewer as its learner, with a sceptic per review.
- The module's note, `docs/notes/module-13-machine.md`, says:
  - what was reused, built and extracted, or could be;
  - every edit to a lesson or document on `main`;
  - the terms and their exemptions;
  - what was done for each of the three decisions, and for the parts that never open;
  - what was measured for the grades;
  - what the build would change.

  Module 13 ends the numbered course, so the note also says what the two optional chapters can take
  from it.
- After Module 13 merges, the managing session writes a report on the whole course against
  `docs/plan.md`'s "Course acceptance".
