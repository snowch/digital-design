# Module 8's figures: the reviewers' findings, for the sceptic

Each finding condensed, with its quotation. The screenshots the reviewers saw were taken before
11:20, when the widening figure's C row was still above W (finding 2-1 is already fixed in code).

## instructions (`fields`)

- 1-1. Notes "read onto QA, the ALU's A" / "read onto QB, the ALU's B" do not change with the
  instruction: for `15024000` (copy B) A shows R0 and for `16101000` (count up) B shows R0, as if
  R0 fed the ALU; the generalisation says the other digit is ignored.
- 1-2. The figure never names the ports (A to RA, B to RB, Y to WA), which is the lesson's
  question; J shows all four bits alike though only bits 2 to 0 go to the ALU.
- 1-3. On a phone the boxes wrap 3 by 2 (K J A over B Y C): "shown side by side" is false and the
  word's left-to-right order is lost; nothing ties a digit of the word to its box.
- 1-4. On a phone C's binary wraps "0000000000" over "00", its value "0, read" over "signed".
- 1-5. Value rows repeat the digit rows for K and J; C's signed reading is never exercised (all
  four C are 000) and belongs to the next lesson.
- 1-6. J's box never says job 3 is subtract; the prediction then restates the fields in words.
- 1-7. The lead is an inventory of the box, not the point.

## constants (`widening`)

- 2-1. "C stands under W's low 12 bits": C's row was drawn above W. (Fixed at 11:20.)
- 2-2. "Why bit 11 is copied" heading and "Copying bit 11 keeps the number": the figure shows the
  readings match, not why; no zero-filled W beside it.
- 2-3. Explanation: the widening sentence sits between two selector paragraphs that say the same
  thing.
- 2-4. The orange outline round bit 11 is never explained by the lead or the key.
- 2-5. C's row shows no break between hex digits, so `F9C` cannot be checked against its bits.
- 2-6. The motivation decodes kind 2's `22103064` in words only; an instruction-fields figure
  would show where the constant sits.
- 2-7. The figure opens on `064`, where every copy is 0, which looks like zero filling.

## fetch (`edges`)

- 3-1. "At edges 1 to 4, WREG is 1: each edge writes RESULT ... -184 into R1": with the cursor on a
  rise, the table gives the values after it (opens on PC 004, RESULT -250); WREG falls at the
  fourth rise. The value written is the one just left of the rise; nothing says so.
- 3-2. "At edge 5": the figure numbers no edge; the slider says "Time 4" (simulator time), a
  third count beside the margin figure's "step".
- 3-3. "IR and RESULT change straight after it", "Between edges the values settle": the drawing
  shows every lane changing at the rise; no settle is visible.
- 3-4. "Arrows mark the clock's rises and falls": 5 up and 6 down; the first and last down
  arrows match nothing drawn in CLK.
- 3-5. Caption "Step through five edges ... one lane per bus": the slider moves by half periods;
  CLK and WREG are not buses.
- 3-6. Lead and after-text both open "The ... diagram shows five clock edges".
- 3-7. Words only: BCONST/WRITEY/STOP per kind; the PC checks' address ranges; byte order.
- 3-8. Phone opens on edges 1 and 2; the stop the after-text ends on is off-screen.

## memory-access (`map`)

- 4-1. Lead: "A word at an address not aligned to 8 gives cause 33 in any part." False for no
  memory (31 wins, `memoryCheck`); and no cell shows a misaligned access.
- 4-2. Rows "timer", "waiting", "signals" name devices no lesson has introduced; "waiting" does
  not read as a noun.
- 4-3. "no memory 7F8 to 7FF": everything from `7F8` up (bits 63 to 11) has no memory; the row
  reads as if addresses stop at `7FF`.
- 4-4. The cells where two causes meet (store byte at a read-only device gives 33; at no memory
  31) teach the priority rule but nothing points at them.
- 4-5. A store to a sensor stops the machine (34); Module 6 said "A write to the sensor is lost."
  The page never contrasts the two.
- 4-6. The load `380027D8` and store `48040400` are decoded in words only; the store's register is
  in B, the load's in Y; an instruction-fields figure would show it.
- 4-7. The map gives ranges in hex; the challenge works in address bits.
- 4-8. Two captions, one under the other, say the same thing.
- 4-9. "The four columns" (the table has five, the first is Part).

## branches (`flow`, `call-flow`)

- 5-1. call-flow: the call's arrow from `00C` runs through the jump's arrowhead stub at `010` with
  no gap, reading as "the call goes to 010" (its return address); at `018` the call and the
  branch share one stub and head.
- 5-2. Column "Instruction" over assembly text; the datapath figure's program table on the same
  page uses "Instruction" for the hex word and "Transfer" for the text.
- 5-3. "Where the loop's branch sent PC": the fifth, not-taken, time (to `018`) is filtered out;
  the figure shows one of a branch's two next PCs.
- 5-4. "A run of the program fills in the "went to" column": there is no control; reads as an
  instruction.
- 5-5. The figure is in the motivation, but "the loop program" is introduced in the
  investigation; c = -2 is not on the figure; the program is listed twice.
- 5-6. The conditions' flags (ZERO, COUT, MINUS XOR OVER) are stated in words only.
