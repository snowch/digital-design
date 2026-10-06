# Module 7: the ALU

A working note, written as the module was built, on the branch `module-7-alu`. Modules 5 and 6
were built at the same time on their own branches; no build could see the others. Times are read
from the clock (`date -u`), not estimated. Who did what: "the managing model" is the session that
planned, wrote the code and the briefs, and checked every draft; "the drafting subagent" is the
subagent that wrote every learner-facing sentence from a brief of checked facts.

## Times

- Started: 2026-10-05 22:33 UTC (first command in the session).
- Finished: 2026-10-06 00:36 UTC, about two hours after the start.

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
- 23:36 to 23:45 The reading half: one reviewer per lesson, each with the same written brief
  (`R-brief`, below), and the browser suite for Module 7 run again. One test was wrong, not the
  page: it expected six blocks a learner can open at the 64-bit ALU's top level, but "join" and
  "top bit" are sealed; it expects four.
- 23:41 `main` moved by two commits (room between wires; a copyright line in every source file).
  The work so far was committed on the branch and `main` merged in, without conflicts.
- 23:45 to 23:55 After the merge, `main`'s new wire rules failed every Module 7 staircase drawing:
  the three select wires crossed where they fan out to the slices, and the carry and zero-chain
  wires between slices were packed a pixel apart. The cause was room, not the router: the split
  blocks stood across the select wires' way up to the top slice, and seven wires had to turn in a
  three-cell gap between slices. The staircases are now ten cells a step, the splits sit closer
  together above them, the carry-in gates sit below the select inputs, and the carry-in XOR takes
  OP0 on its upper input (the same gate, its inputs swapped), so its two input wires do not cross
  on the way down. Every drawing passes under every fault its lab offers. The copyright line was
  added to the module's 26 new files with `main`'s own script.
- 23:55 to 00:00 Fixes to code from the reviews (below), then five briefs to the drafting
  subagent: one per lesson for the upheld findings, one for the strings inside the two new figures.
- 00:00 to 00:03 Drafts checked and placed, one sent back; each lesson read again whole.
- 00:03 to 00:30 The full check (the mechanical half in the browser, at desktop and phone widths)
  found three more things, each fixed and seen to pass:
  - in the first lesson's fault lab the C0 wire turned through the value written beside andC0,
    and in the flags lab the Z0 wire through the constant's "1": each gate moved a cell left;
  - a 64-bit value written above its pin, centred, ran about 90 pixels past the pin, across the
    wires turning there. A value wider than its pin now ends at the pin's right edge, and the
    64-bit drawings have five cells of room on the left for it;
  - on a phone, a failed 64-bit test in the adder challenge widened the page to 629 pixels: the
    line "Signal SUM was ..." writes 64 binary digits with no break, and the narrow layout's value
    grid was a plain `1fr` column. A failure now wraps anywhere, and that column can shrink.

## Why four lessons

The module's content falls into four questions a learner can ask in order, each with its own
circuit in front of them: how one slice does eight jobs (`alu-jobs`); how one bit beside the
result answers a question about it (`flags`); what changes at 64 bits (`wide-alu`); how anyone
knows the result is right (`alu-tests`). The three labs the plan asks for land one per lesson where
the question raises them: operation select in the first, stepping the carry in the third, injecting
faults in every lesson's failure experiment and, against a whole suite, in the fourth. The capstone
is the fourth lesson's last challenge.

## The ALU's jobs, codes and flags

| Code (OP2 OP1 OP0) | Job | D, the adder's second word | C0 |
|---|---|---|---|
| `000` | AND | all 0s | 0 |
| `001` | XOR | all 0s | 0 |
| `010` | add | B | 0 |
| `011` | subtract | NOT B | 1 |
| `100` | OR | all 0s | 0 |
| `101` | copy B | all 0s | 0 |
| `110` | count up | all 0s | 1 |
| `111` | count down | all 1s | 0 |

Module 3's four jobs keep their codes with OP2 = 0. OP1 says whether the job adds; for those jobs
OP0 turns D over and OP2 says whether D is B or a fixed word: D = OP1 AND (OP2 ? OP0 : B XOR OP0),
and C0 = OP1 AND (OP2 XOR OP0). A bit-by-bit job adds all 0s, so its COUT and OVER are 0.

The flags, in the course's own words: ZERO (every bit of Y is 0; a chain from slice to slice, ZIN
to ZOUT, like the carry), MINUS (Y's top bit), COUT (the carry out of the top slice), OVER (the
signed result does not fit: A's and D's top bits agree and the sum's differs). No shifts, as the
plan says. The ISA, register count and memory map are left alone.

## Terms

`alu-jobs` introduces none ("bit-by-bit jobs" is named in bold where the construction needs it;
D is a signal's name). `flags` introduces **flag**. `wide-alu` introduces none (parameter and
concatenation are HDL constructs, gated as constructs). `alu-tests` introduces **boundary test**
and **adversarial test**. The term gate passes with them.

## What was reused and what was added

Reused unchanged: the chain grader, the full adder and the selectors, split and join, the library
and its placements mechanism, the explorer, fault lab and prediction figures, the HDL gate and
elaborator, the lesson schema and runtime, the editor and the answers challenge.

Added to the platform (no extraction into a shared package, as the plan says):
- `dd-model`: `alu.ts` (the eight-job slice, flags, rows, groups, the reference in bigints),
  `testcases.ts` (the generator: normal, boundary, random with a seed, adversarial, at any width),
  `library-alu.ts`, the `exposes` answers grader.
- `sim`: the settle optimisation (exact, tested against the plain settle).
- `hdl`: `+` and `-` on signals, a concatenation as an `assign` target, parameters set from outside.
- `lesson-schema`: per-vector `parameters`; a chain spec with no word output.
- `dd-views`: the `carry-steps` and `suite-lab` figures; `canOpen` and `outcomes` on the fault lab;
  `wordInputs` on the explorer; a written challenge graded once per width; the automatic layout puts
  a fixed value below the inputs and stacks outputs in their drivers' order; a drawing makes room
  for a wide value written beside an output pin.
- Tests: `alu.test.ts`, `arith.test.ts`, `settle-due.test.ts`, four facts tests, the Module 7
  browser spec, and a Module 7 case in the diagram spec (before and after use).

## Briefs and drafts

Every learner-facing string was drafted by the drafting subagent from a brief of checked facts:
sixteen briefs for the first drafts (labels and three prose briefs per lesson), five for the review
fixes. The managing model checked facts only and added the fewest words where one was missing.

First drafts, as checked:

- **1C (first draft, 23:3x)**
  - generalisation: added a sentence not in the brief ("The same carry path rules every job that
    adds."): cut (unfounded claim).
  - jobs16Lead: dropped "Words this wide show in hexadecimal; the table reads them unsigned.":
    restored by adding that sentence.
  - otherwise every fact present; "closed" became "one block" (accepted).
- **2A**
  - first draft: `prediction` became a rhetorical question with a hint and dropped the button;
    `p1Question` used "we"; "simple"; a label sentence before a list; dropped "The prediction below
    tests it." Sent back; second draft right. Kept "when MINUS alone" drift ("when OVER is 1"
    dropped from the last sentence of p1Explain): accepted, the sentence before says OVER is 1.
- **2B first draft**: construction lost ZIN/ZOUT and their meanings and said the chain runs "down";
  flagFaultsLead lost "each slice now also has ZIN, ZOUT and OVER", called the part CONST; counts as
  words; "operations"; explanation lost the A and D framing and the worked example;
  overflowLimitLead became a question with "You choose". Sent back.
- **3B first draft**: construction garbled the concatenation sentence, drifted "as wide as the
  widest side" to "as wide as its target", dropped "the course turns + into its own adder", used
  "code" for text; c1Task gave the answer's shape away; wideFaultsLead had a wrong fact ("the level
  above the slices") and dropped xorC0/andC0; "hold" for the bits blocks; levels64After grammar and
  dropped "(the first lesson of this module)". Sent back.
- **3A first draft**: motivation had a wrong fact ("Every row is one step of the model"); prediction
  dropped "the steps appear after you choose"; carry16Lead called the row of cells a table. Sent
  back.
- **1A first draft**: returned only a summary of what it wrote; asked for the text.
- **3C first draft**: returned only a summary; asked for the text.
- **Labels**: 1L used "operand" (not a page word) in a heading; 2L objectives lower case without
  full stops; 3L title not a question and objectives without full stops; 4L headings lower case with
  full stops. Sent back.
- **1A second draft**: every fact present. Dropped "on these words" after "COUT is 1 for this job
  only", which made it a general claim (false: count down from 0000 gives COUT 0, and add and
  subtract carry out for other words): restored by adding the three words.
- **3A second draft**: right.
- **Labels second drafts**: right; 4L c2/c1 challenge titles' trailing full stops removed when
  placed (formatting).
- **3B second draft**: right. The first draft's c1Hints, wideFaultsAfter and explanation kept (they
  were right); wideFaultsAfter's check and fault names put in quotes when placed (formatting, as the
  page shows them).
- **2B second draft**: right, but flagFaultsLead said "inputs and outputs for the zero chain" and
  dropped OVER: "and an OVER output" added. "exactly" dropped from the unsigned and equal rules
  (drift towards a weaker claim; accepted, still true).
- **3C first draft (second message)**: carry64After said the carry passes "one step at a time"
  (wrong: 2 steps a slice): cut those words. modelVsReality added "Real hardware may not."
  (unfounded): cut; dropped "(Module 2)" after depth: restored. c2Task dropped what may be used,
  what case and default do, and D = 0; said "the gates from the last lesson" (wrong lesson): sent
  back. "Hint 1:" prefixes stripped (formatting).
- **4C first draft**: suite64After invented a reason ("their words lie near 2^40"), wrong: sent
  back; c2Task dropped "Y == 0 is 1 exactly when..." and said "operands": sent back. c2Hints "just
  as": "just" cut (style rule 19).
- **1B (second message; first returned a summary)**: construction wrote "D is 0" and "D is 1" for
  count up and down, where D is a word: "all" added twice; "The code's three bits tell the story"
  (an idiom labelling the next sentences): cut. jobFaultsLead said "Run checks compares your
  output", wrong (the figure is the course's circuit): "Y and COUT" in place of "your output";
  dropped "from bit 0 at the bottom left to bit 3 at the top right": restored. explanation said one
  AND gate made "Module 3's overflow flag": wrong, and "flag" is lesson 2's term; "carry in" in
  place of "overflow flag". Names put in quotes and "Hint n:" prefixes stripped (formatting).
- **2C (second message)**: roomsFlagsLead dropped the readings -250 and -184: restored.
  modelVsReality dropped "(Module 2)": restored. "operation" in c2Task (banned word): left for now,
  noted for the read.
- **3C c2Task second draft**: right.
- **4A (second message; first returned a summary)**: question repeated itself ("You cannot test
  every possibility." after "No one could run them all."): cut. motivation's "With eight jobs, that
  is 28 tests" gave a wrong reason (28 is not eight times five): "With eight jobs, that is" cut;
  "just one bit": "just" cut. prediction dropped "the suite's controls appear after you choose":
  restored. Counts written as words in p1Explain ("Four of the 28"): digits (formatting, the fact
  sheet's rule). suiteHealthyAfter said "repeat any run exactly by entering that seed number again":
  wrong (the page has no seed field); replaced with the brief's "a run can be repeated exactly from
  its seed alone".
- **4B second draft**: right ("seed 1" not stated with the counts in suiteFaultsAfter: noted for the
  read; the figure shows its seed).
- **Whole-lesson read, alu-jobs**: c1's title came back as the brief's example (Module 3's
  'Add-or-subtract bit, drawn'), missed at the label check: sent back, now 'Second-word bit, drawn'.
  Cut: 'Copy B needs no logic.' in the question (repeated by the motivation), 'The figure shows a
  closed 4-bit ALU.' in the prediction prose (repeated by the question inside the figure).

Review-fix drafts (briefs R1 to R5), as checked:
- R1 `alu-jobs`: every fact present. Cut: a brief's note copied into the text ("(it is introduced
  here)"), and an added sentence using a banned word ("the group of bit-by-bit operations"). "Copy
  B" unbolded (not a term).
- R2 `flags`: every fact present but one: the question kept the unclear sentence the finding was
  about and dropped the brief's fact in its place; the fact was put in, in the brief's words.
  "Run checks" put back in quotes.
- R3 `wide-alu`: the motivation ignored the brief (it still gave the prediction's answer and
  dropped two facts): sent back, second draft right. `carry16After` dropped "above bit 0":
  restored. On the whole-lesson read, the motivation and the model note made the same point about
  real adders: cut from the motivation; the `case` label example moved next to the list it
  explains.
- R4 `alu-tests`: right, except the OVER bullet kept the counts the brief said to replace by a
  pointer back to the prediction: cut. On the read, "appear after you choose" corrected to "after
  you press it" (the controls appear on the button, not the choice).
- R5 the figures' strings: taken, except where a draft renamed something the lessons' prose
  already names: the buttons "New random tests" and "Back a step", and the blocks "bits", "join",
  "top bit", "slice" and "second word and carry in" keep their names, so prose and figure agree.

## Reviews

Each lesson went to its own reviewer, who read it as a learner who had done every earlier lesson,
quoted the page, checked numbers before asserting them, and gave a direction, never a rewrite. Each
review went to an independent sceptic who attacked every finding against the files.

| Lesson | Findings | Upheld | In part | Rejected |
|---|---|---|---|---|
| `alu-jobs` | 21 | 13 | 6 | 2 (an old build's title; section order fixed by the schema) |
| `flags` | 17 | 9 | 8 | 0 |
| `wide-alu` | 25 | 14 | 9 | 2 (taste) |
| `alu-tests` | 17 | 10 | 7 | 0 |

What the reviews changed, beyond wording:
- Every Module 7 lab's results were on the page before the learner ran it, under a lead that asks
  for a prediction. They now appear only after a run (`outcomes`, which the fault lab already had
  and the suite lab now has). Module 3's labs with the same pattern (`alu`, `adders`) are left
  for their own module.
- The 16-bit rooms figure fed room B's word into input A, reversing the office's question. It now
  asks the question the way round the lesson does.
- The `flags` lesson stated, and twice applied, the rule its last challenge asks for. The rule now
  waits for the challenge; the explanation gives the two facts it is built from, and the
  overflow-limit figure, which repeated the prediction, now reads the same words unsigned too, to
  show COUT answering what MINUS cannot.
- The `wide-alu` construction gave the first challenge's answer character for character; it now
  teaches concatenation on another example. Bit select moved to the capstone, which needs it.
- The suite figure lists three failures of a kind and now says how many more there are.
- A constant in a written challenge's drawing ran its label into a gate's name, and the 64-bit
  value at the ALU's output ran off the drawing; both fixed in the platform, and the diagram spec
  now opens Module 7's lessons, which it did not before (why the overlap had passed).
- `alu-tests` introduced "boundary case" and "adversarial case", words the page never uses; it
  introduces the words it uses. Its originality note described a draft that no longer exists.

Not acted on: the 64-bit drawings are wider than a desktop column and scroll sideways (the outputs
table beside them carries every value); the operand drawing's inputs are ordered B, OP2, OP0, OP1
(the router's order, not wrong).

## Checks

The last `./scripts/check.sh` before the final push: Prettier, `tsc`, the copyright check, Vitest
(53 files, 439 tests), the Vite build and Playwright (302 tests at desktop and phone widths): all
passed, exit 0. The commit after it changes only this note. `main` had not moved since the merge
(`1ae4fea`).

## What I would change

- Module 3's fault labs show their results before a run, as Module 7's did; the `outcomes` prop,
  which Module 2 already uses, is there for them.
- Module 5 teaches `always_comb` and `case` on its own branch; this module's second written
  challenge explains them in a sentence each so that it stands on `main` today. When the branches
  meet, that sentence can point back instead.
- The groups inside the 64-bit ALU name their carries locally (C4, C8, C12 in every 16-bit group).
  A learner pressing a wire inside g1 reads C4 for the carry into bit 20. Naming them by the bit
  they go into would need the group to know its offset.
- The briefs worked best as numbered facts with the forbidden words named; every draft that came
  back wrong had either a fact it could not place or a fact the brief had not said was off-limits.
