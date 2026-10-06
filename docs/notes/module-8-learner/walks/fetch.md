# fetch: the walker's findings, condensed

Walked at 1280 px, 375 px and dark; every control pressed; both challenges run with the start,
wrong attempts and the reference.

- F1. `checks-text`: a check of bit 10 alone (or bits 11:10) passes all 9 tests; no test address
  has only a bit above 11 set, though the task says "any of PC's bits 63 to 10".
- F2. `checks-text`: `cond ? a : b` is refused with "write the selection out with `&`, `|` and
  `~`", and those are refused too: a dead end.
- F3. Faults: "PC4 stuck at 0" and Run shows no sign the run ended or gave up ("gives up after 500
  edges" in prose); one run shows both faults' outcome paragraphs; the fault is drawn as a
  floating CONST block; its 64-digit label runs out of its box and off the drawing.
- F4. The margin stepper: "Buses that changed: ." with nothing listed; at "Step 0 of 26" the
  status says PC 004 while the table shows 000; names never introduced (WIDE, ALUB); PC4 passing
  through 0, 4, C, 1C mid-settle unexplained.
- F5. The prediction's options "Stops, cause 21" and "Stops at the end, cause 00" before 21,
  `stop` or "the end" are explained.
- F6. Test failures in 64-bit binary and generated names (sum2, PC_sel2, buf1, CAUSEF_comb).
- F7. The investigation's after-text, with every result, visible before the run.
- F8. The drawing wider than the box at 1280 px (1202 in 942): the ALU, HALT, CAUSE off screen;
  CAUSE never shown as a value anywhere.
- F9. Timeline: at Time 13 the table says CLK 0, the drawing ends high; times 2 and 3 identical,
  no cursor line at 2; RESULT X at the stop unexplained.
- F10. `pc-text` hint 3 cites "Module 5's counter with a reset ... `else if (EN)`", which Module 5
  never showed in that form.
- F11. Phone: 64 PC toggles stack 1,500 px tall, the bits that matter at the bottom; the Buses
  table about 900 px below "Clock edge".
- F12. The learner's drawn circuit: `64'h4` as a 64-digit label spilling over wires.
- F13. "fetch" used in the objectives before the explanation defines it; "decoder" here is not
  Module 3's one-hot decoder, never said.
- F14. `/favicon.ico` 404.

Keep: the prediction gating "Clock edge"; the program table's PC marker and "Written"; the step
slider showing PC before IR; the timeline read just left of a rise; the STOP fault rescued by the
illegal-instruction check; the PC tests catching GO before RST; the 8/4/2/1 bit groups; dark theme.
