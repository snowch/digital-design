# Fix pass 1: Module 4 (`remember`) and Module 5 (`registers`)

A working note, written as the fix pass went. It acts on every finding of the two reviews in
`docs/notes/comparison/` that a sceptic upheld in whole or in part. "The managing model" is the
session that did the fixes; "the drafting subagent" drafted every new learner-facing string from a
brief of checked facts.

## Times

Read from the clock (`date -u`), not estimated.

- Started: 2026-10-04 23:59 UTC (first command in the session).

## Log

- 23:59 Branch `fix-pass-1` at `91e533a`, as asked. Read CLAUDE.md, docs/style.md,
  docs/authoring.md, the comparison section of docs/checkpoints.md, both reviews and both
  verdict files, the two module notes' "What I would change", both lessons' three files. Built
  the site and took screenshots of every section of both lessons at 1280 and 375 pixels.
- Found while reading, before changing anything:
  - **The task says both sceptics rejected 1-B16 and 2-B19. Only sceptic 1 did.** Sceptic 2
    (verdicts-2.md) upheld 1-B16 and upheld 2-B19 in part (the pronoun "it" is loose). The
    task's own rule is "act on every finding at least one sceptic upheld", and its exception
    rests on a premise the files do not bear out. I followed the explicit instruction and
    skipped both, and list the disagreement under "Questions for the author".
  - **1-A2/2-A7 and 1-B23/2-B5 are already fixed.** Commit `850da67` draws the circuit above
    every prediction question; the screenshots show the loops and the chain drawn before the
    commit.
- 00:00 to 00:11 Code first: the stepped view's X, the controls each figure needs, the
  two-button drawing and its faults, the flip-flop's inside. Full check green at 00:11.
- 00:12 to 00:43 Code, second batch: every roll kept with its own seed, the edge marked on the
  setup-and-hold axis and its status lines counted from the edge; a press or tap on a wire shows
  and keeps its name; the `<=` ligature; the register-bit table marking the row the next edge
  applies; the register written as text drawn as one register block with RST and EN; no message
  on an untouched text box; the editor's refusal says the challenge does not use a construct; a
  note above any drawing wider than the screen; the four flip-flops' pins listed from bit 3; the
  signals lesson's two predictions draw their subject above the question (item 1a); the shared
  phone-width test after use (item 1b); the working-words rule in docs/authoring.md (item 1c).
  The new strings went to the drafting subagent as brief V (appendix); two drafts went back
  (`parts.open` came back as "OPEN", the simulator's own name; three status lines put {value}
  and {time} side by side, "Q became 1 30 time units"). Full check green at 00:43.
