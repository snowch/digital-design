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

## The machine

- **`machine-final`** (`packages/dd-model/src/traps.ts`, option `final`) is Module 12's
  `machine-traps` with Module 10's capstone's decoder, which knows the call through a register
  (kind 9) and set if (kind A), SET on the control bus, and a fourth source for the word Y takes,
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
  `JOIN:` with a constant or nothing in its place; it elaborates, runs, and fails all five
  programs; each join left out alone fails at least one (the facts test). Five programs written for
  the lab: the shop's (both added kinds, a system call), a fault in user mode, a system call then
  the timer, the door, and a store to the ROM with no handler. A failure names the first line after
  which the text and the model disagree and the value that differs, never the join. The verdict is
  plain text, so its sentences quote the line rather than mark it as code.
- **The lab's figures** (`lab-run`) run the course's text with one line changed, never one of the
  six joins, and never show the line it replaces.
- **The capstone** (`CapstoneEditor.tsx`, grader `machine13-capstone`, `dd-model/src/capstone.ts`):
  the learner's program is run on the model for four pairs of readings; five questions name a wire
  at an edge of the program's first set if or first store, and their answers are read off the
  recorded run of the learner's own program. A wrong answer gets the level to look at and what to
  read there.

## Measured

In the build container's Chromium, against the dev server, at 1280 and 390 pixels wide:

| What | Time |
| --- | --- |
| The lab's grade of the outline: one elaboration, five programs, 196 edges | 2.2 s |
| One `lab-run` figure run | 0.2 to 1.1 s, by program |
| The capstone's grade of the reference: four model runs, one recorded run of 39 edges | 0.5 s |
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

- The capstone's questions ask about the first set if and the first store; a program with a set
  if inside a loop answers about its first pass. More questions, chosen per program, would need
  the trace figure to say which pass.
- The lab's tests run every program on every grade. A cache by text across reloads would make a
  reload's re-grade free.
- `lab-run` blocks the page while a run goes (up to a second). A worker would keep it responsive.

## For the optional chapters

The compiler and the kernel chapters can take `machine-final` and `recordRun` as they are: a
program in, every edge out, compared with the model. The kernel chapter's handler runs on the
trap hardware Module 12 built and Module 13 keeps, and `capstone.ts` shows how to read an answer
off a learner's own run.
