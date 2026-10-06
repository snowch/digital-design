# memory-access: the walker's findings, condensed

Walked at 1280 px, 375 px and 375 px dark; every control pressed; both challenges run with the
start text, wrong attempts and the reference; the page reloaded.

- M1. The `memory-text` reference passes with four "latch" warnings ("ALUA is not assigned on
  every path of this always_comb (the then branch leaves it out). Synthesis would infer a latch")
  for WIDE, ALUB, ALUA and YIN: two-arm `case`s on a 1-bit selector, the shape the hints give.
- M2. A `memcheck` with the 33 checks before the 34 checks passes all 14 tests: no case has 33 and
  34 both applying, though the page states the order three times.
- M3. The prediction's Buses table shows MQ and YIN `FFFFFFFFFFFFFF48`, RESULT `7D8` and ALUA 0
  before the learner commits.
- M4. Pressing the drawing's CLK pin twice clocks the machine before the prediction is committed:
  R2 shows -184.
- M5. The prose points at memory, pickA and pickLoad, which start about 1,500 px into a 1,891 px
  drawing: off the first view at desktop width, about five screens right on a phone.
- M6. After an edit, Run tests sits 3,200 to 7,400 px below the text box: the drawing of the
  learner's circuit and 64 to 128 bit buttons fill the gap.
- M7. The drawing of the learner's `memcheck`: constant values overflow their boxes, a 53-digit
  value runs across wires, empty "slice" boxes, generated names (const1 to const15).
- M8. Running "LOAD stuck at 0" shows both faults' outcome paragraphs, the STORE one included.
- M9. "with cause 34": CAUSE's value is not shown on its pin or a table; the fault's CONST 1 box
  has no visible wire to STORE.
- M10. The investigation's after-text, results included, is visible before the run.
- M11. Test failures give ADDR in 64 binary digits and CAUSEM in 8, the lesson works in hex; the
  "places to look" name generated parts (CAUSEM_comb, nor3); with the untouched `memory-text`
  start, the first failure points at the stop logic, not ALUA or YIN.
- M12. The priority rule stated in the construction and again in the map lead; the lead repeats
  the address list and runs to 15 lines on a phone.
- M13. "Each part's first address, a multiple of 8, is checked": unclear what was computed where.
- M14. X means "never written" and "keeps changing" on one page.
- M15. An automated press on AZERO's wire landed on OP1's hit area (unconfirmed for a person).
- M16. `/favicon.ico` 404 on every load.

Keep: the fields figure; the prediction's explained distractors; the investigation's tables; the
two contrasting faults; the map table; the language gate's plain message; saved work re-graded.
