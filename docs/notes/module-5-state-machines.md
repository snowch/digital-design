# Module 5, lessons 2 to 5: counters, register transfer, state machines

A working note, written as the module was built, on the branch `module-5-state-machines`. Modules
6 and 7 were built at the same time on their own branches; no build could see another's. Times
are read from the clock (`date -u`), not estimated. Who did what: "the managing model" is the
session that planned, wrote the code and the briefs, and checked every draft; "the drafting
subagent" wrote every learner-facing sentence from a brief of checked facts.

## Times

- Started: 2026-10-05 22:33 UTC (first command in the session).

## Log

- 22:33 to 22:41 Read CLAUDE.md, `docs/plan.md`, `docs/notes/modules-5-6-7-plan.md`,
  `docs/authoring.md`, `docs/style.md`, `docs/simulator.md`, `docs/inventory.md` (sections 2,
  5.2, 5.3, 7, 8), `docs/checkpoints.md`, the registers lesson with its words and facts test, and
  the notes (module 5 registers, module 3, the systemverilog, straight-wires and diagrams notes,
  the "what I would change" of modules 1 and 2 and the first fix pass). `npm ci` and the build
  passed. Read the HDL package (the parser, the elaborator, the construct gate), the model's
  library and blocks, the drawing compiler, the book and the explorer, prediction and timing
  diagram figures.
- 22:41 to 22:58 The module's shape, decided before code (see "Why four lessons" below), and the
  state-machine model: `dd-model/src/fsm.ts` (a machine as data; its circuit read off the table
  row by row; its text) and `machines.ts`. Its test, every state and every input against the
  table, for the circuit and for the text elaborated, passed first time. The enumerated type
  in `packages/hdl`, with its gate id and plain refusals.
- 22:50 to 23:00 The state-machine figure (`StateMachine.tsx`), named values in timing-diagram
  lanes, a `prime` for explorers, a 4-bit register block for drawings.
- 23:00 to 23:05 The four lessons' structures with placeholder words. Every reference passed and
  every starting point failed at once. Facts explored from the figures' own props:
  - **My first failure experiment for counters did not work.** A ripple counter (each
    flip-flop clocked by the one before, the textbook's way, shown as the wrong way) with a
    reset ANDed into the later clocks stayed unknown in its upper bits: when RST fell, the
    master latch's D went unknown a step before its clock rose, a hold failure inside my own
    circuit. Dropped. The same lesson, values passing through on the way, is shown instead in
    the stepped model inside the adder, where the register never takes them.
- 23:05 to 23:12 Looked at the figures in the built page. Found and fixed:
  - **SEND and SIREN were drawn unconnected**: the output block's ports were computed before
    the block made its nets (an object literal evaluated before the body). Now a function, with
    a test that every block port names a net.
  - **The next-state logic opened to a tangle**: one-bit `bit` parts cannot carry a word wire in
    a drawing, so the state word reached nothing; the gates were laid out automatically. Words
    are now split and joined by split and join blocks, as Module 3 does, every part inside is
    placed in columns (bits, lines, NOT gates, one AND per row, one OR per bit, join), and a
    block may carry its own pins' places in its metadata (`scene.ts`, `placedInside`).
  - **The diagram's top labels were cut off** and its middle crowded: states moved, one label
    placed by hand.
  - **The pins came out in alphabetical order**; now in the machine's order.
  - A row leading to IDLE (code 00) needs no gate, so none is drawn; a NOT gate for an input
    only such a row reads was left with no reader, and is not made now.
- 23:13 Committed the platform (`53fb492`). The commit trailer the session asked for named a
  model; amended before pushing to "Co-Authored-By: Claude", as the task forbids model names
  in commit messages (earlier commits on `main` do carry one).
- 23:13 to 23:16 Facts tests for all four lessons, before any brief. They caught three test
  counts I had wrong by one or two, and one more drawing fault: a stuck-at fault on a wire inside
  a block put its fixed-value part at the top level, so the opened block showed that wire with
  no source. A fault's part now sits inside the block whose wire it drives (`faults.ts`).
- 23:16 to 23:40 The words. One shared fact sheet (`00-module.md`: voice, the learner, the
  setting, working words, banned words, the page's controls), one fact sheet per lesson
  (`C-`, `R-`, `S-`, `N-facts.md`), and per lesson four briefs: A (question, motivation,
  prediction), B (investigation, construction, failure), C (explanation, generalisation,
  challenge, reflection, model note), E (labels); and brief V for the state-machine figure's
  own words and the new parts' and circuits' names. 21 briefs to 21 drafting subagents, each
  with `docs/style.md`. All are in `docs/notes/module-5-state-machines/briefs/`; every draft as
  accepted is in `drafts/`, and a script (kept in the session, not the repository) places a
  draft's keys into the lesson's prose and labels files, whole keys only. Each draft was read
  only after its subagent reported done. What came back, and what was done (details under
  "Briefs and drafts" below).
- 23:35 One more platform bug, found while checking a hint's claim against the elaborator: a
  `case` label of the wrong width gave "xor gate inputs differ in width (const1)", an internal
  message with no line, which the encoding lesson's construction would have shown to every
  learner who left a 2-bit code in a 3-bit place. Now refused with its line ("this label is 2
  bits wide but the case compares a 3-bit value"), with a test.
- 23:38 A scripted scan of the placed text for the fact sheet's banned words found "hold" and
  "holds" eleven times: for a register's contents ("a register that holds its state"), for a
  press ("holds Save down", "the hold") and for a sender keeping OK at 1. The fact sheet reserves
  "hold" for hold time. **Five of the eleven came from my own fact sheets** (S-facts and N-facts
  said "holds", "held as its code", "holds OK at 1"); the drafts copied them, as CLAUDE.md says
  they will. Also "step" in a heading ("The next step"; "step" is the Stepped model's) and four
  "just"s. Sent back, key by key, to the nine subagents concerned.
