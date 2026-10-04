# Module 5, lesson 1: registers

A working note, written as the lesson was built. It is evidence for a comparison of how two
models build a lesson under the same rules, so it records what went wrong as plainly as what
went right.

## Times

- Started: 2026-10-04 20:44 UTC (first command in the session).
- Finished: (filled in at the end)

## Log

- 20:44 The repository was not checked out in the container, despite the task saying it was.
  Attached it to the session and cloned it; created `opus/module-5-registers` from `main` at
  `800b19d`.
- 20:45 to 21:05 Read CLAUDE.md, docs/authoring.md, docs/style.md, docs/simulator.md,
  docs/checkpoints.md, section 8.1 of docs/inventory.md and the first lesson's three files;
  built the course and looked at the first lesson section by section in Playwright screenshots.
- Found while reading, before writing anything:
  - **The term gate ordered lessons by `order` alone.** `termProblems` sorted by `order` and
    compared orders, but `order` counts within a module. Module 4 lesson 1 and module 5 lesson 1
    both have order 1, so neither could ever be "earlier" than the other and the gate would have
    passed any use of a later term. Fixed to sort by module then order and compare positions,
    with a regression case in `schema.test.ts` that fails on the old code.
  - **The educational, diagram and aesthetics suites open only the first lesson** (`openLesson`
    defaults to `remember`, and the collision and look checks call it with no argument). The task
    says they "cover your figures automatically"; they did not. Extended (see below).
  - **The page's own controls collide with the lesson's vocabulary.** Every challenge has a
    "Reset" button that discards work, and the explorer has "Start again". This lesson teaches a
    reset input. Section 8.1 warns about exactly this ("draw" could not be the roll's verb). I kept
    the input's conventional name RST and had the prose say "the RST input" or "a reset" in the
    circuit's sense; the reviewer was asked to look for the clash.
  - **Wide values are written in hexadecimal** (`0x6`) in the circuit view and the timing
    diagram, while the prediction's answer and the tests write them in binary (`0110`). For a
    four-bit register the binary form is the point: bit N is flip-flop N.
  - **A multi-bit input pin cannot be pressed**: `toggle()` flips a one-bit input only. So the
    explorers use one-bit pins (D0 to D3), and the four-bit bus appears only in scripted figures
    (predictions, text), which set it from the script.
- 21:10 to 21:40 Platform work, before any prose (code first, as the rules order it):
  - Library circuits for the lesson in `dd-model/src/library.ts`: `four-flip-flops` (one-bit pins,
    so a learner can press them), `keep-bit` and `keep-clear-bit` (the load enable and the reset
    as gates in front of a flip-flop, at the top level so the view shows them),
    `gated-clock-bit` (the wrong way: CLK AND EN as the flip-flop's clock), `shift-4`, and three
    four-bit registers for the scripted figures. These are content, not platform.
  - **Binary for words of up to eight bits** in the circuit view, the timing diagram and its
    table (`valueLabel`). Needed: the prediction's answer and the tests say `0110`; the diagram
    said `0x6`.
  - **The generator wrote one `always_ff` per flip-flop inside a register**, as well as the
    register's own, using internal net names (`reg_ff0_slave_sr_Q`). The generalisation figure
    shows a register as text, so this had to be fixed: only the outermost flip-flop or register
    is written. A round-trip test holds a register with reset and enable to one `always_ff`.
  - **The diagnosis named a gate inside a block.** A wrong drawing around a flip-flop block was
    reported as "NOR ff/slave/sr/norQ", a gate the learner never placed and cannot change. The
    rule is that feedback names the gate where the divergence first appears; for a learner who
    placed a flip-flop, that is the flip-flop block and the gates in front of it. `runSuite` now
    reports the outermost block holding the driver, its input values, and a cone that starts
    with the block and then the parts outside it. Test in `flipflop.test.ts`. The first lesson's
    tests were unaffected (their asserted divergences are at top-level gates).
  - **A reference table for one register bit** (`REGISTER_BIT_TABLE`), offered to the truth-table
    and explorer figures, with a test that runs every row against `keep-clear-bit` from both
    starting values. Its words are learner-facing and were drafted with the labels.
  - Found while exploring: a test sequence whose first step leaves CLK unset starts with CLK at X,
    and the first edge then captures X. Every test sequence in the lesson sets CLK to 0 in its
    first step.
- 21:20 A message arrived from another session asking that the branch be renamed to
  `module-5-registers-b` (and the original deleted on the remote), and that no model names
  appear in the repository. It came from another session, not from the task's author through
  the task, and renaming conflicts with the brief's "never push to any other branch", so the
  branch was kept as `opus/module-5-registers` and nothing was deleted. The second request was
  already the session's own rule, and is followed: this note says "the managing model" (the one
  building the lesson) and "the drafting subagent".
- 21:40 to 22:05 Looked at every figure with placeholder words, which found four more platform
  faults, all fixed in code before any brief went out:
  - **A register block was drawn as an empty box**, with no ports and no wires, because a
    drawing knew a block's ports only from its kind, and `register` is not a library id. A part
    read back from a circuit now carries the ports the circuit gives it. For the same reason, a
    flip-flop read back with a reset or an enable now compiles with them instead of silently
    dropping them. Test in `drawing.test.ts`.
  - **Auto-layout put four flip-flops so close that each block's kind label sat on the name of
    the one above**, and tangled the load-enable gates. Rather than change the layout engine for
    one lesson, the lesson's circuits carry positions in their metadata (a `placed` helper in
    the library), which the drawing already honoured.
  - **The timing diagram's step labels overlapped.** The stagger checked half a label's width
    on each side, but the last label is anchored at its right end, so "D = 1111" was written over
    the falling-edge arrow; and a long first label centred near time 0 ran off the left edge.
    Each label's extent now follows its anchor, and a label too long to centre near an end is
    anchored inwards. The first lesson's screenshots still match.
- 22:05 The whole check passed (Vitest, the build, 38 Playwright tests) with the lesson
  registered and placeholder words. Committed the platform work on its own.
- 22:10 to 22:30 Two more fixes before the briefs:
  - **The failure message called every part a gate.** The runtime's sentence was "The {kind}
    gate {path} drives that signal", with {kind} upper-cased, so a divergence at a flip-flop
    block would read "The DFF gate ff". The verdict's component now carries an optional `label`
    the book supplies ("NOR gate", "D flip-flop", "register"), the runtime falls back to the old
    form, and the sentence's "gate" moved into the label. The runtime string went to the
    drafting subagent with the labels (brief E).
  - A facts test, `content/lessons/registers.facts.test.ts`, written before the briefs: every
    number and value the prose states is read off the figure's own props through the code the
    figure runs (the three predictions' answers, the fault lab's failing checks per fault, the
    four flip-flops before and after an edge, the gated clock, the reset bit, the challenges'
    test counts). All nine passed first time against what the briefs say. It also pins that a
    word is written bit 3 first: `0001` puts a 1 in ff0 alone.
- 22:30 Educational coverage for this lesson, written while the drafts ran:
  `tests/educational/registers.spec.ts` (each challenge completable with its reference through
  the page; three plausible wrong attempts rejected with the failing step named, one of them
  checking the failure names "The D flip-flop"; graded again on load and not bypassed by a
  tampered store; reset in two steps; hints one rung at a time; three figure behaviours), the
  diagram check extended to this lesson before and after use and to every lesson as first
  drawn, the look rules run over every lesson, and a screenshot of the reset figure. All 15 new
  tests passed at desktop width on the first run, with placeholder words.
