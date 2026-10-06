# Sceptic: register-transfer (sceptic subagent, returned as text, saved by the managing model)

## Verdicts on the register-transfer review

I checked each quote against `register-transfer.prose.ts`, `.labels.ts` and `.ts`, against `nowPrevOnceCircuit` and `swapCircuit` in `library-module5.ts`, and against the built page at 375/1280 widths via text read. I did not run the facts test or the challenges with wrong attempts.

**F1: in part.**
- The quote is on the page. The question section's statement of what the display must do is a requirement, and it has to be there.
- What stands: the motivation then lays out the two options, and its opening "The prediction asks:" is the kind of staging the voice rules forbid.
- Action: reword the motivation so it asks, rather than moving the requirement.

**F2: in part.**
- The section title and the failure experiment already tell the learner something fails, so the "flaw" sentence adds little.
- What stands: "above" is ambiguous, since it could mean the learner's own drawing or the figure. Fix that one word.

**F3: upheld.**
- "a word worked out from registers' values before that edge" is clumsy.
- The lowercase `now`/`prev`/`last` read as names.
- `last` exists only in the fixed circuit, so "In the NOW and PREV circuit, … last takes SAVE" is factually wrong for that circuit.
- STEP and SAVE are mixed in the next paragraph.

**F4: upheld.**
- Blocks are labelled lowercase `now`/`prev`, and the outputs are `NOW`/`PREV`.
- The motivation and the explorer after-text use both forms in the same sentences.

**F5: upheld.**
- The save-once figure labels only `notOld` and `andStep` on the gates, plus the `last` block.
- Nets `OLD` and `STEP` exist in the circuit but are not drawn as labels. The `last` block's pins read D, CLK, RST, Q, Qb.
- The signal table has no `OLD` or `STEP` rows.
- The lead and the explanation use OLD and STEP.

**F6: upheld.** The lead states "NOW takes 0101 and PREV takes 0011 at the first edge. The next two edges change nothing." The after-text repeats it almost word for word. The lead is also one long block.

**F7: in part.**
- The explanation and the generalisation lead make different claims. One is about the lines of a register transfer, the other about the order of the text blocks.
- The reflection's recap is the section's job.
- What stands: `p1Explain` ("In a program, line order decides") partly repeats the explanation. This is low priority.

**F8: rejected.**
- The title "Swap and undo" names what the section holds: a swap prediction and an undo challenge.
- The title is a label, and a scanner can tell what the section contains.
- It does not claim the learner builds a swap.
- A joining sentence would be taste, not a rule breach.

**F9: upheld.**
- The circuit inputs are A and B, and the selectors also have pins A and B.
- In the circuit, selX's A pin is fed by Y's Q and its B pin by input A.
- So "each selector takes A (for X) or B (for Y)" mixes two namings.

**F10: in part.**
- The prose never says A holds `0011` and B holds `0101`. The figure's run and input table supply it.
- The "unknown" option is sound, as the reviewer says.
- This is a small gap and low priority.

**F11: in part.**
- Construction prose and lead both say "build". "Data travels on wide wires carrying 4 bits each" is filler.
- "This circuit" has a referent, the explorer's circuit just above.
- Cut the duplicate sentence and the filler.

**F12: upheld.** "The figure below draws the circuit above a question." is garbled and carries no information. It is on the page as quoted.

**F13: in part.**
- Hint 1 gives the key wiring, and hint 4 restates it, so the ladder repeats rather than climbs.
- The unexplained "SAVE changes while CLK is 1" sentence follows the course's own pattern and is harmless.
- Hint 3 is a legitimate analogy to the registers lesson, and hint 5 as the full solution is fine.

**F14: mostly rejected.**
- The priority hint before the NEW-branch hint is a reasonable order: concept, then code.
- Hint 3's generic names (A, L, D) are a deliberate non-solution template.
- "Write one `always_ff`" is the same wording the registers lesson's own challenge uses, so it is the course convention.
- Only a minor point stands: the generalisation says two blocks also work, so say once why the challenge asks for one. This is optional.

**F15: in part.**
- "hold"/"keep" are ordinary verbs, and "hold time" is a cross-reference to the registers lesson, so that part is rejected.
- What stands: `p2Explain` "which was now `0101`" has a lowercase "now" beside the register `NOW`.

**F16: in part.**
- "Moving on" is a weak label, weaker than sibling lessons ("What decides the next number", "What the adder does"). Retitle it.
- "A new display" is comparable to "Measuring a wait" and "Storing four bits", so it is rejected.
- The reviewer withdrew the "new term" worry, and rightly: the office's message is in `counters` or `state-machines`.

**F17: upheld, low.** The explorer lead is a single run-on block of instructions. Split it into steps.

**F18: rejected.** There is nothing to act on: the reviewer found the note honest.

### Found
- **Found A:** `p2Question` begins "Now IN is `0101`". Capital "Now" sits next to the register NOW and is confusable. It is the same problem as F4 and F15.
- **Found B:** `predictLongPressLead` says "Save pressed" while the rest uses SAVE.
- **Found C:** The `saveOnceLead` text says last "takes SAVE" but the figure's `last` block shows no OLD label. This is covered by F5, so fix them together.

### Count
Of 18 findings: upheld 6 (F3, F4, F5, F6, F9, F12, F17 counted as 7, since F17 is upheld low), so upheld 7. In part 8 (F1, F2, F7, F10, F11, F13, F15, F16). Rejected 3 (F8, F14, F18). Found 3 (A, B, C).
