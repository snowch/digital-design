# Brief RC: register-transfer, Explanation, Generalisation, Challenge, Reflection, model note

Read 00-module.md and R-facts.md first. This text follows the failure experiment: a long press
lost the older number, and a flip-flop that keeps SAVE's value from the edge before made the
registers save once per press. Do not repeat those results.

## Key `explanation` (section prose, no figure; 100 to 150 words, two or three paragraphs)

Facts:
1. Every circuit in this lesson does the same thing at an edge: a register takes a word worked
   out from registers' values before the edge. now takes IN; prev takes now's word; last takes
   SAVE.
2. Introduce the term, plain meaning first: moving words into registers at an edge, each worked
   out from values before the edge, is called **register transfer**. It is written with an
   arrow, one line per register: NOW ← IN and PREV ← NOW, at an edge where STEP is 1.
3. All the lines of one edge happen at once. Their order on the page does not matter, because
   every right-hand side is read before the edge.
4. The counter of the previous lesson is a register transfer too: Q ← Q + 1 at an edge where EN
   is 1.

## Key `nowPrevAsTextLead` (above the generalisation figure; 70 to 110 words)

Facts:
1. The figure draws NOW and PREV as blocks beside the course's text for them: two `always_ff`
   blocks, one per register.
2. `PREV <= NOW` reads NOW's value from before the edge, as the drawing's wire does. `<=` is the
   transfer arrow written as text.
3. The order of the two blocks does not matter. Two `<=` lines inside one `always_ff`, under
   `if (SAVE) begin ... end`, make the same circuit.

## Key `nowPrevAsTextAfter` (below it; 30 to 60 words)

Facts: words of any width work the same way. Module 1's readings are 16 bits: a register for
them is declared `logic [15:0]`, and `16'h0000` is a 16-bit value written in hexadecimal (the
`'h`).

## Key `predictSwapLead` (above the challenge section's prediction; 50 to 80 words)

Facts: two 4-bit registers, X and Y. X's D comes from Y's Q, and Y's D from X's Q. Each D passes
through a word selector, which takes A (for X) or B (for Y) instead while LOAD is 1, so the
figure can start them with different words. The figure draws the circuit above its question.

## Key `p3Question` (two or three sentences)

Facts: with LOAD at 1, one edge loads X with `0011` and Y with `0101`. Then LOAD is 0 for one
more edge. What is X after it?

## Key `p3Explain` (three or four sentences)

Facts: X is `0101` and Y is `0011`: the registers swapped their words at one edge. X ← Y and
Y ← X both read the words from before the edge. In a program, swapping two variables needs a
third to keep one of them; two registers need no third.

## Key `writeReadingsLead` (above the lab; one to three sentences)

Facts: the lab: the office keeps the freezer room's last two readings, 16 bits each, and can undo
a reading. Write it as text.

## Key `c2Task` (the task; a short list or six to eight sentences)

Facts:
1. The module header is given, with inputs IN (16 bits), NEW, UNDO, RST and CLK, and outputs NOW
   and PREV (16 bits each).
2. At an edge where RST is 1, NOW and PREV become `16'h0000`.
3. Otherwise, at an edge where NEW is 1, NOW takes IN and PREV takes NOW's word.
4. Otherwise, at an edge where UNDO is 1, NOW takes PREV's word back, and PREV keeps its word.
5. At any other edge both keep their words.
6. Write one `always_ff` with `if`, `else if`, `begin` and `end`. The tests use the readings
   `FF48`, `FF06` and `0012`, and include an edge where NEW and UNDO are both 1, an edge where
   RST and NEW are both 1, and a test where NEW changes while CLK is 1.

## Key `c2Hints` (five hints, in this order)

1. (The idea.) Each branch of the `if` chain is one edge's transfers. Inside a branch, put one
   `<=` line per register that changes, between `begin` and `end`.
2. (A mistake.) Testing UNDO before NEW makes an edge with both at 1 undo instead of taking the
   new reading. The order of the `if` chain is the order of priority: RST, then NEW, then UNDO.
3. (A smaller example.) With one register: `if (RST) A <= 4'b0000; else if (L) A <= D;` keeps A
   at every edge where RST and L are 0.
4. (Part of the answer.) The NEW branch is `else if (NEW) begin NOW <= IN; PREV <= NOW; end`.
5. (The whole answer.) Write:

   ```
   always_ff @(posedge CLK) begin
     if (RST) begin
       NOW <= 16'h0000;
       PREV <= 16'h0000;
     end
     else if (NEW) begin
       NOW <= IN;
       PREV <= NOW;
     end
     else if (UNDO) NOW <= PREV;
   end
   ```

## Key `reflection` (60 to 100 words, two paragraphs)

Facts:
1. A register transfer moves words between registers at an edge, every one worked out from the
   values before it, so their order does not matter and two registers can swap.
2. A press longer than one edge needed a flip-flop that remembers the input from the edge
   before, so the circuit does one thing per press.
3. End with the next question: the office's message to the manager must be sent, waited on,
   sent again, or given up. Each of those is a different job with different transfers. What
   decides which job the circuit does at the next edge?

## Key `modelVsReality` (60 to 110 words)

Facts:
1. In the model every flip-flop takes its D at the same instant. In hardware the clock reaches
   different flip-flops at slightly different times. PREV taking NOW's old word relies on NOW's
   flip-flops changing a little after the edge, later than PREV's flip-flops need their D to stay
   steady after it: their hold time. The registers lesson's shift register relied on the same.
2. The fix for a long press assumes SAVE changes only between edges. A real button's contacts
   open and close several times in the first few thousandths of a second when pressed. A real
   circuit waits for the button to settle before it believes a press. The model's button does not
   do this.
