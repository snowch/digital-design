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
- 00:44 to 00:51 Lesson data for the word fixes: the investigation's two-button figure now shows
  the circuit closed (`two-buttons-block`, `canOpen: false`), so the challenge after it is a
  design and not a copy (1-A7, 2-A11); a new figure of two D latches sharing one EN shows the race
  the flip-flop prevents (1-A12, 2-A16); the D latch's table is shown once (1-A21, 2-A14), with
  `tableDLead` moved under the latch's table; both fault labs' outcomes move to an after-text
  (1-A10, 1-B12, 2-B22); the flip-flop's recorded run changes D while CLK is 1, at 450 and 470,
  and has one phase per change of CLK or D (1-A19, 2-A1, 2-A2). The run is pinned in
  `lesson-facts.test.ts`, with the master's opening and closing times. Wrote the shared sheet
  of working words and eleven fact briefs (appendix) and sent them to the drafting subagent in
  parallel.
- 00:51 to 01:04 Drafts back and checked; placed with a script that replaces a key's string and
  nothing else. Six of the eleven drafting subagents first replied with a description of their
  keys instead of the keys, and were asked again. Facts added by the managing model, in the
  fewest words: "The output, the light, is Q" (the light dropped), "after you release A/B" (the
  release dropped), the fault names in front of each outcome paragraph of `faultLabAfter`
  (dropped, so no paragraph said which fault it was about), "A is S, B is R, and LIGHT is Q"
  (dropped), "a box CONST with value 0 now drives KEEP" (dropped), "This section answers it,
  with a circuit the display does not need" (dropped), "its rising edge; the lesson calls it the
  edge" (the term "rising edge" dropped), "(not a known 0 or 1)" on the X option (dropped),
  "Replay roll {seed}" (the word roll dropped). Cut by the managing model: a sentence of
  `asTextAfter` that repeated the paragraph before it. Sent back: `parts.open` ("OPEN"), three
  status lines with two numbers side by side.
- Second pass, read on the built page start to finish (both lessons): four joins went back to
  the drafting subagent (`buildDLatchLead` said "The block offers it" before any block was
  introduced; `asTextAfter`'s "that" pointed at the wrong sentence after my cut; `internalsAfter`
  set 30 time units against "two to three gate delays" with a "but", though 30 is three gate
  delays; `c2Task` in the registers lesson used "keep" for a stored bit). The second reply for
  `buildDLatchLead` still began "The block offers it", now one sentence after the block; "it"
  became "Qb". Code found in the reading: every prediction drawing of a register showed the
  library's short instance name "reg" under the block's label, and the closed two-button block
  showed its instance name "light"; both now show the label alone.
