# Module 7: the ALU

A working note, written as the module was built, on the branch `module-7-alu`. Modules 5 and 6
were built at the same time on their own branches; no build could see the others. Times are read
from the clock (`date -u`), not estimated. Who did what: "the managing model" is the session that
planned, wrote the code and the briefs, and checked every draft; "the drafting subagent" is the
subagent that wrote every learner-facing sentence from a brief of checked facts.

## Times

- Started: 2026-10-05 22:33 UTC (first command in the session).

## Log

- 22:33 to 22:42 Read CLAUDE.md, the shared plan (`docs/notes/modules-5-6-7-plan.md`),
  `docs/plan.md`, `docs/authoring.md`, `docs/style.md`, `docs/simulator.md`, the inventory's
  section 8, `docs/checkpoints.md`, the notes for Modules 1, 2, 3 and 5, the fix pass, the
  diagrams, straight-wires and SystemVerilog notes, and Module 3's `alu` lesson with its words and
  facts test. Built the course and looked at the `alu` lesson as a learner. Read the platform code
  the module builds on: the chain grader (`chain.ts`, `gradeChain`), the blocks
  (`combinational.ts`), the library, the explorer, fault lab and prediction figures, the HDL
  construct gate and the elaborator.
  Found while reading, before writing anything:
  - **The elaborator refuses `+` and `-` on signals** ("arithmetic on signals comes in a later
    module"). The constructs `parameter`, `concat` and `op-arith` already have ids in the gate,
    and the parser reads `#(parameter N = 16)`, but nothing lets a grader set a parameter, so a
    text could only ever be tested at its default width.
  - **An assignment cannot target a concatenation** (`assign {COUT, SUM} = ...`), which is the
    plain way to write a carry out.
  - **The chain grader's spec needs at least one output**, so a slice whose only result travels
    along the chain (a zero flag passed from slice to slice) could not be graded.
  - **The fault lab always lets a learner open a block**, so a fault lab drawn from slices would
    show the inside of a slice before the challenge that asks the learner to draw one.
  - **What the course has taught of the language on `main`**: `module`, ports, `logic`, `assign`,
    the bitwise operators, `always_ff`, vectors and `if` (the registers lesson). Module 5's new
    lessons teach `always_comb` and `case`; the plan lets Module 7 use them.
- 22:42 to 22:46 The module's shape and the ALU's design, decided before any code (see "Why four
  lessons" and "The ALU's jobs, codes and flags" below).
- 22:46 to 22:50 `packages/dd-model/src/alu.ts`: the eight-job slice, the flags, rows and groups of
  slices, and the reference in bigints; `testcases.ts`, the generator. Tested exhaustively at 4 bits
  and by the generated suite at 16 and 64 bits in both arrangements: correct first time, but the
  64-bit runs took 18 seconds, about 200 ms a test.
- 22:47 to 22:49 **The settle model re-evaluated every gate at every step** and wrote the whole state
  out as a string at every step to look for a repeat. It now works out, after the first step, only
  the gates that read a net that changed, and finds a repeat by a hash kept up to date from the
  changed nets, confirmed against the stored state. Both are exact: a new test
  (`packages/sim/src/settle-due.test.ts`) holds every step of the history, the iteration count and
  the oscillation verdict to a plain settle, for rings of 1 to 4 inverters and a carry chain, and
  all 386 existing tests passed unchanged. The 64-bit suite fell from 18 s to 1 s.
- 22:49 to 22:53 The HDL: `+` and `-` on signals, worked out at the width SystemVerilog uses (the
  widest operand or the target, operands widened with 0s first, so `~B` inside a wider sum turns
  over the new top bits too), built from the course's own adder; `a + b + c` with `c` one bit is one
  adder with `c` as its carry in; a concatenation as an `assign` target; parameter values given from
  outside (`elaborate(text, { parameters: { N: 64 } })`). Seven tests, all passing first time,
  including the `~B` widening against what SystemVerilog gives.
- 22:51 The capstone's reference text, elaborated at N = 16 and 64, passed the generated suite (79
  tests at each width) on its first run, in 150 ms and 400 ms.
- 22:53 to 22:56 Grading: per-vector `parameters` in the schema and `gradeWidths` in the book (a
  text elaborated once per width); a chain spec may have no word output (the zero chain); an
  answers grader `exposes`; `canOpen` on the fault lab.
- 22:56 to 23:12 Library circuits and their drawings: placements found by a scratch test that
  prints `sceneProblems` for every block kind, then screenshots. Found and fixed on the way:
  - the carry-in gates' name, `andCarry`, ran into its own wire; renamed `andC0`;
  - groups named g0 at every level collapsed in the breadcrumb (the trail merges two levels with
    one label), so 4-bit groups are q0 to q3;
  - the `slice` and `join` primitives inside the groups drew as empty boxes with no ports, and the
    `bit` part likewise: each is now wrapped in a sealed block (`word-piece` "bits", `word-join`
    "join", `top-bit` "top bit");
  - a part-select block whose input and output were both called W drew its wire looping back to
    itself; the output is Y;
  - 64-bit values written above a pin at the drawing's left edge were cut off; the 64-bit drawings
    are moved three cells right;
  - the content test for wires checked every scope of every figure's circuit: for the 64-bit ALU,
    hundreds of blocks, and it timed out. Blocks of one kind draw alike, so it now draws each kind
    once; and a figure that lets nobody open its blocks (`canOpen: false`, the prediction figure)
    is checked at its top level only, which is all a learner can see.
- 23:00 to 23:05 The two new figures, `carry-steps` and `suite-lab`, with their strings and CSS.
- 23:05 to 23:15 The four lessons' structures with placeholder words; a scratch run that computed
  every number the prose would state. It changed two designs before any brief went out:
  - the third fault of the first lesson's lab, "C2 stuck at 1", failed no check on 3 and 5 (every
    arithmetic job on those words carries into bit 2 anyway); it is "C2 stuck at 0" now;
  - the carry figure on the flagged ALU took 71 steps to settle a change whose carry stopped at bit
    1: the change made Y briefly 0, and the zero chain carried that up all 64 slices and back. The
    carry figures run the ALU without flags (8 and 36 steps at 16 bits, 8 and 132 at 64).
- 23:15 First full browser run with placeholder words: 251 passed, 5 failed (two diagram overlaps
  in the 4-bit staircase with flags, the pager's last-lesson link (placeholder titles were all
  the same), and the 64-bit lesson widening a phone).
- 23:15 to 23:25 The fact sheet and sixteen briefs (labels and three prose briefs per lesson).
- 23:25 to 23:32 Sixteen drafts in parallel, checked and sent back (see "Briefs and drafts").
- 23:32 to 23:36 Words placed; facts tests for all four lessons (92 tests, passing first time);
  the Module 7 browser spec.
- 23:36 Whole-lesson reads by the managing model; reviewers launched.
- The phone overflow: a failed test in the written challenges lists its 64-bit inputs, which could
  not wrap. The verdict's value grid and the fault lab's failure list now wrap long values.
