# Brief RA: register-transfer, Question, Motivation, Prediction

Read 00-module.md and R-facts.md first. Draft these keys. Each section is read straight after
the one before: write the joins, and do not repeat a fact an earlier key already stated. Do not
write "transfer" in these keys.

## Key `question` (90 to 130 words, two or three paragraphs; a scene is drawn under it)

Facts, in order:
1. The registers lesson's display shows the number four switches held at the last press of Save.
2. Staff want to see what changed. The office wants a second display, PREV, showing the number
   saved before the latest one. The first display is now called NOW.
3. When Save is pressed, NOW must show the switches' new number and PREV the number NOW showed
   until then. Both change at one edge of CLK.
4. When the power comes on, a reset makes both `0000`.
5. End with the question, as a question: how can one register take its word from another
   register at the same edge as that register takes a new one?

## Key `motivation` (70 to 110 words, two paragraphs)

Facts:
1. Two registers, now and prev, each with a reset and a load enable. SAVE is both registers' EN.
2. now's D is the switches, IN. prev's D is now's Q: the wire carrying NOW.
3. At an edge where SAVE is 1, both registers take their D. The question for the prediction is
   which NOW prev's D sees at that edge: the old one, or the one now is taking. (State this as
   the question the prediction asks; do not answer it.)

## Key `prediction` (two or three sentences)

Facts: the figure below runs the two registers. It draws the circuit above its question. Choose
an answer, then press "Check my prediction".

## Key `p1Question` (two to four sentences)

Facts: the figure resets both registers to `0000`. With SAVE at 1, IN is `0011` for one edge,
then `0101` for one more edge. What is PREV after the second edge?

## Key `p1Explain` (three to five sentences)

Facts: PREV is `0011`. At the second edge NOW took `0101` and PREV took `0011`, the word NOW held
just before the edge. Every flip-flop takes its D at the same edge, and every D was worked out
from the Q values before it. The shift register of the registers lesson moved bits the same
way. In a program, the line order would decide; here no register sees another's new word until
after the edge.
