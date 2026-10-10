# Module 13: the whole machine

The module's note: what was built, reused and extracted, what changed outside the module, the
three decisions, what was measured, and what would be changed. The plan is
`docs/notes/module-13-plan.md`; the briefs, the drafts and each lesson's fixes to its drafts are
in `docs/notes/module-13-machine/`.

## The lessons

| Lesson | Question | Introduces | Challenge |
| --- | --- | --- | --- |
| `whole-machine` | What is the whole machine made of, and where do its parts meet? | CPU | where the parts meet: answers |
| `full-path` | What happens to one line of a program at every level, edge by edge? | machine code | one line at every level: answers |
| `tracing` | Can you follow one value from a line of a program down to one gate? | abstraction | five traces: answers |
| `final-machine` | Can you join the parts into the whole machine? | none | the lab: the top module as text |
| `capstone` | Can you write a program of your own and trace its run down to the gates? | none | a program and five trace questions |

Every learner-facing string went through briefs of checked facts and drafts; `drafts/N-fixes.md`
lists every fact or form put right in a draft, and every cut made on the second reading.

## Ideas that are shapes, and the figures that draw them

| Lesson | The idea | The figure that draws it |
| --- | --- | --- |
| `whole-machine` | the machine as three blocks, each built in an earlier module | the machine's drawing, each block with its maker beside it |
| `whole-machine` | an instruction's words crossing the joins, edge by edge | the edge timeline: one lane per bus, values where they hold |
| `whole-machine` | a join held at a fixed value | the drawing with the fault on its wire, the comparison beside it |
| `full-path` | one line at every level at one edge | the drawing, opened to any level, beside "The instruction at every level" |
| `tracing` | a value followed from a line to a gate | the drawing, opened block by block, and each closed part as the drawing of one bit its maker drew |
| `final-machine` | the joins the learner's text makes between the parts | the lab's drawing: a map of the nine parts in lesson 1's blocks, and a part's ports as wires to what the text joins them to, open ports as rings |
| `final-machine` | where a run's first difference sits | each `lab-run` figure's map of the nine parts, the part holding the value the run's sentence names marked after the run; no port's join is drawn, since the figures run the course's own text |
| `capstone` | the learner's own program run on the whole machine | lesson 3's trace figure on the learner's program, under the editor |
| every lesson's machine figure | the run over time: each line's edges side by side, by state | the run strip above the drawing, the next edge marked; a press pauses there |
| every lesson's machine figure | the route a value takes at one edge | the joins the next edge changes drawn bold, and a pressed wire pinned and marked at every level it is drawn |
| `tracing`, `capstone` | where each wire sits among the levels | the drawing opened block by block, with the table of levels beside it |

Tables kept beside drawings, and why:

- **"The instruction at every level"** (`full-path`) lists the line, its address, its word, the IR's
  fields, the state and six control signals at one edge. Each row is a different form of one
  moment, words and fields rather than parts and wires; the drawing beside it is the shape. The
  reviewers are checking it against the plan's "Module 0's ladder, made general"; their findings
  decide whether it becomes a drawing.
- **The table of levels opened** (`tracing`) records the blocks opened so far with their ports'
  values. The same review applies.
- **The `lab-run` results** are a list of sentences, one per run; each names the first instruction
  that disagreed. A strip over the instructions, agreeing up to the first that disagrees, was
  offered as optional and is not built: a run's sentence already says where it stopped agreeing.

## The machine

- **`machine-final`** (`packages/dd-model/src/traps.ts`, option `final`) is Module 12's
  `machine-traps` with Module 10's capstone's decoder, which knows the call through a register
  (kind 9) and set if (kind A), SET on the control bus, and a fifth source for the word Y takes (after HR, HM, PC + 4 and CWORD),
  MET as a word. The changed blocks take kinds of their own (`-final`), drawn by hand in
  `library-control.ts` (`FINAL_INSIDE`, `FINAL_KIND_ROUTES`), and every scope passes the drawing
  checks (`dd-views/src/final-machine.test.ts`).
- **The model** has `MODULE_13` and the assembler `MODULE_13_ASSEMBLY` (`machine.ts`).
- **`final-run.ts`** records a run frame by frame beside the model (`recordRun`), names the first
  difference after a step, and compares a text's circuit with the model (`compareFinalCircuit`),
  a step ending where the output S is FETCH again.
- **The machine's text** (`content/lessons/module13.ts`, `MACHINE13_TEXT`) joins the course's nine
  parts (`packages/hdl/src/machine13-modules.ts`), each built by the same function as the drawn
  part, and runs every program of `FINAL_PROGRAMS` and Module 12's `TRAP_PROGRAMS` as the model
  does (`module13.test.ts`).

## Parts that never open

The register file, the memory, the PC, the IR, the held words, the control registers and the
controller's state register run as the simulator's own parts, and the selectors and adders of a
whole word are drawn closed. In the trace figure each is listed under "Parts here that never
open"; pressed, it shows one bit as the module that built it drew one bit, driven by the machine's
values at that edge (`bit-views.ts`): a register's bit is Module 5's `keep-bit` or, where a reset
clears it, `keep-clear-bit`; the register file's is one register's bit, chosen by number; a RAM
byte's bit is a register's bit; a selector's is Module 3's `selector-2-gates`; an adder's is
Module 3's `full-adder-parts`, its carry in worked out from the bits below. A part that only
splits or joins words says it holds no gate. So every trace ends at a gate or a flip-flop.

## The three decisions

1. **Both added instructions run on the final machine.** `docs/isa.md` says so under "The final
   machine"; `docs/plan.md` records the decision.
2. **The course's parts run, not the learner's earlier answers.** Lesson 1, the lab's motivation
   and its task say so plainly. In the lab, the learner's text is what runs.
3. **No lesson runs a testbench.** The capstone's model note shows one as code to read; the
   parser's message for `initial` no longer names a later module; the plan's table changed.

## The lab and the capstone

- **The lab** (`LabEditor.tsx`, grader `machine13-lab`): three starts by the challenge's own
  buttons, replacing changed work only after asking. The outline leaves out six joins, each marked
  `JOIN:` with a constant or nothing in its place; it elaborates, runs, and fails all seven
  programs; each join left out alone, or filled with a wrong wire or constant, fails at least one,
  and so does each wrong text the reading review found (the facts test). Seven programs written for
  the lab: the shop's (both added kinds, a system call), a fault in user mode, a system call then
  the timer, the door, signs, bytes and WARM, a system job in user mode, and a store to the ROM
  with no handler. Each program's lines, with their addresses, are listed under the lab's text and
  under each `lab-run` figure. A failure names the first line after
  which the text and the model disagree and the value that differs, never the join. The verdict is
  plain text, so its sentences quote the line rather than mark it as code.
- **The lab's figures** (`lab-run`) run the course's text with one line changed, never one of the
  six joins, and never show the line it replaces.
- **The capstone** (`CapstoneEditor.tsx`, grader `machine13-capstone`, `dd-model/src/capstone.ts`):
  the learner's program is run on the model for six pairs of readings; in two, one room reads at
  or above 0, and each fails a program that reads that room's comparison unsigned. Four questions
  name wires paused before the ALU edge of the program's first set if: RESULT, signed; the ALU's
  flags and MET as a row of five bits; the XORs in the slices for bits 7 to 4, whose row differs
  with the operand the learner's set if puts in B; and HM, signed. A row cannot be found by
  trying 0 and then 1. Their answers are read off the recorded run of the learner's own program;
  a wire whose value is not known reads X, and X is an answer. A wrong answer gets the level to look at and what to
  read there.

## Measured

In the build container's Chromium, against the dev server, at 1280 and 390 pixels wide (the lab's
grade measured again after the reading review, against the built site, at 1280):

| What | Time |
| --- | --- |
| The lab's grade of the outline: one elaboration, seven programs, 274 edges | 2.4 s |
| One `lab-run` figure run | 0.2 to 1.1 s, by program |
| The capstone's grade of the reference: five model runs, one recorded run of 39 edges | 0.5 s |
| The capstone's trace figure opening on the learner's program | 0.9 s |

A slow phone may take several times as long; the lab stays inside the plan's ten seconds unless it
is four times slower than this container. Both grades run again when the lesson loads. In Node, the
machine's text elaborates in about 0.1 s and runs about 70 edges a second.

## Changes outside the module's own files

- `traps.ts`, `traps-run.ts`: the `final` option, `FINAL_CONTROL_BUS`, the kinds `-final`;
  `TRAP_PROGRAMS` moved from `traps.test.ts` to `traps-programs.ts` so the text's test runs them.
- `library-control.ts`, `library.ts`, `datapath-figure.ts`, `datapath.ts` (`romParams` exported):
  `machine-final` placed, opened and built.
- `book.tsx`: `WriteEditor` exported; the lab's and the capstone's editors and grades dispatched;
  the course module set `machine13`. `CircuitView.tsx`: `join-control-final` sealed.
  `MachineFigures.tsx`: the edge timeline takes `from`, as Module 12's note asked.
- `packages/hdl/src/parser.ts`: the message for `initial`.
- None of the files the brief set aside until Module 12 is on `main` was edited.
- After the reading review: `layout.ts` starts the columns far enough in for a long fixed value in
  the first column, and `CircuitView.tsx` writes a fixed word wider than 8 bits in hexadecimal,
  so the control registers' and the word for Y's 0s stay inside their drawings; `FINAL_INSIDE`
  places the next PC by hand and moves four of the datapath's parts half a row, with one route,
  so every block inside the datapath passes the drawing tests when opened (a new test opens each).

## After the managing session's first look

- **No challenge reads its answers off a figure.** Lesson 1's two edges are now of a short program
  no figure runs, worked out from the states each kind takes; lesson 2's line, `R7 <= R5 | R6`, is
  in a program no figure runs; lesson 3's PC bit is at `goto R15`'s ALU edge, which no trace on
  the page reaches. Each facts test checks that no figure runs the program it asks about, and the
  feedback states the rule, not the value.
- **No prediction answered before it is asked.** Lesson 2's motivation took `A7345000`, the word
  its prediction asks for, as its example; it now takes `R3 <= R1 - R2`, and says that machine
  code is the words the learner has seen in the ROM and the IR since Module 8.
- **The capstone grades no trace question against a program that fails its own tests**; each
  such question says the program must pass first.
- **The drawing names the blocks as the prose does**: "control unit", "datapath", "memory port".
  The final machine's port takes a kind of its own, `memory-port-final`, so Module 12's drawing
  keeps its names.
- **Decision 1 is not in commits of its own.** The final machine came in with lesson 1, and every
  lesson runs it. If the author declines decision 1, the change is: build every figure and test on
  `machine-traps` with `MODULE_12`; drop the set if and the call through a register from the shop's
  program, the lab's texts and the capstone's task; and redo the facts the prose states. The
  machine's own code (`final` in `traps.ts`, `FINAL_INSIDE`, `MODULE_13`) can stay unused.

## After the reading review

- **Shared figure.** Each fault's outcome shows once its run has made it; figures open with the
  block their words name in view (`focus`), on the whole machine, since the datapath opened is a
  step the leads ask for; the joins the next edge changes are drawn bold and a pressed wire stays
  pinned at every level; the step controls stay in reach; the run strip replaces the two lists of
  "Pause before an edge"; a paragraph that reports a run shows only after that run; the final
  machine's blocks have plain titles; inline code renders as code and a refusal names the form a
  box wants.
- **Lesson 4.** Seven programs, so each wrong text the review found fails; result sentences give C3
  in two hexadecimal digits, a register's small word with its hexadecimal, and whether the model
  stopped or halted; the failure experiment's changed line is hidden until the run.
- **Lesson 5.** Two questions reach below the datapath's ports (a gate inside the ALU; a held word
  from an earlier instruction), and a fifth case needs a comparison read signed.
- **Prose.** Briefs R2-1 to R2-8 redrafted what the findings named; `drafts/review-fixes.md` logs
  every fact fixed. Each lesson was read start to finish afterwards; what that read cut is logged
  there too.
- **Tests.** A test fails a lesson whose prose holds a key it never reads; the capstone's and lesson
  3's last hints are built from their answers and graded.

## After the second reading

- **A grader that throws fails the work.** `gradeSafely` (`book.tsx`) turns any grader's error into
  a failed verdict that says why, so a challenge, the grade on load and the list of lessons still
  draw; the capstone names the line and the register that holds no value.
- **The figure.** One sticky band holds the step controls, the status line and the overview. The
  drawing marks the wires the next edge uses (`edgeUses` in `dd-model`: back from each write, along
  each selector's chosen input, through a bus by the bits taken from it), under a band of colour a
  bus shows. Table rows and ports pin their wires; a pinned word marks the parts it splits into.
  Results show under the drawing and stay once shown.
- **The tests.** A figure whose `focus` names nothing it can place fails; the joins each edge of
  13.1's load uses are pinned; the lab's facts test fills two more slips (a call to a label not
  taken, a target without its sign), which a call to a label above it in the signs program finds;
  each capstone comparison read unsigned fails the case with that room above 0.
- **Prose.** Briefs R3-S and R3-1 to R3-6; `drafts/review-fixes.md` logs every fact fixed.

## Platform candidates

- **A case-graded challenge whose artifact is HDL.** `checkLesson` takes a written challenge with
  answer tests to be the book's own only when its reference carries text or data; the lab's
  reference is HDL, so it carries an empty `data` record too (`final-machine.ts` says why). A
  schema flag for "graded by the book" would say it directly.
- **A challenge editor's store.** The capstone's editor mounts the trace figure with a store of
  its own in memory, since an editor is not given the lesson's store; the figure's pauses are
  not kept.
- **Reading another lesson's answers**, for a machine built from the learner's own parts
  (decision 2).

## What would be changed

- The capstone's questions ask about the first set if, paused before its ALU edge; a program with
  a set if inside a loop answers about its first pass. More questions, chosen per program, would need
  the trace figure to say which pass.
- The lab's tests run every program on every grade. A cache by text across reloads would make a
  reload's re-grade free.
- `lab-run` blocks the page while a run goes (up to a second). A worker would keep it responsive.

## For the optional chapters

The compiler and the kernel chapters can take `machine-final` and `recordRun` as they are: a
program in, every edge out, compared with the model. The kernel chapter's handler runs on the
trap hardware Module 12 built and Module 13 keeps, and `capstone.ts` shows how to read an answer
off a learner's own run.
