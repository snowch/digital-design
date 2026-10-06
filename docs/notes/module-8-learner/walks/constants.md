# constants: the walker's findings, condensed

Walked at 1280 px, 375 px and dark; every control pressed; both challenges run with the start,
wrong attempts and the reference; every stated number checked against the simulator.

- C1. Prediction: the radio label reads "25003F9C: R3 ← -100", the answer; the Buses table shows
  WIDE, ALUB, RESULT `FFFFFFFFFFFFFF9C` before commit; after commit "The machine gave -100" and
  "the edge writes -100 into R3" while R3 still shows X.
- C2. The widening reference and the second challenge's start text draw the false latch warning
  (a `case` on one bit with both arms).
- C3. Investigation and hour figure: the after-texts with every outcome on the page from load;
  each radio label states its result ("R4 ← -2048"); RESULT in the table before the edge.
- C4. Failure feedback in 64- and 32-bit binary, generated names run together ("bits21_38",
  "buf1join1const1"), test labels in `<=` where the prose writes `←`.
- C5. Faults: the lead asks for a prediction after the press; "R0 is X" in the lead nearly gives
  the BCONST fault away; one press shows both faults' outcomes; under BCONST R3 was X before and
  stays X, so nothing visibly happens; the copied-bit fault sits inside `widen`, which cannot be
  opened.
- C6. The construction gives the 52-bit all-ones literal the answer needs; replication `{52{..}}`
  draws a parser error, not a plain message; `? :` is steered to `&`, `|`, `~`, not to `case`.
- C7. The widening figure shows the pattern and both readings, not the weights adding up that the
  explanation claims; the lead says "for 064 and 7FF every copy is 0" before the learner looks;
  the key repeats the lead.
- C8. The drawing of the learner's text: internal parts (xor1, join1, slice1, const1), empty
  boxes, 52-digit constants spilling out, wires off the right edge.
- C9. "The drawing is wider than the screen" at 1280 px for 22 px of empty margin.
- C10. The second challenge's start text contains the whole widening; 32 presses to enter IR.
- C11. Not learner-facing: the `originalityNote` says the prediction is on -250 against 3846; the
  page predicts `F9C`, -100 against 3996.

Keep: the fields figure of `22103064`; the investigation's numbers (-184 AND FF = 72, the 7FF and
800 extremes, the register-job control); the hour built by doubling 1800; the copied-bit fault
paired with a positive constant; the test that changes IR and BCONST while the clock is high; the
reflection's hand-off.
