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
