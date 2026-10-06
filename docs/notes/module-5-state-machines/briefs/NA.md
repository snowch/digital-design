# Brief NA: state-encoding, Question, Motivation, Prediction

Read 00-module.md, S-facts.md (the retry controller) and N-facts.md first. Draft these keys.
Each section is read straight after the one before: write the joins, and do not repeat a fact an
earlier key already stated. Do not write "one-hot" or "synchronous" in these keys.

## Key `question` (70 to 110 words, two paragraphs)

Facts:
1. The state-machines lesson ended by asking whether it matters which state gets which code; a
   reset always loads `00`.
2. The retry controller's table says what each state does. It does not say what code each state
   has: any four different 2-bit codes would carry out the same table.
3. End with the question: what should decide which code each state gets?

## Key `tryZeroTableLead` (above the question's figure, which shows the diagram and the table; 40 to 70 words)

Facts: the figure is the same controller with two codes swapped: TRY is `00` and IDLE is `01`.
The diagram and the nine rows are the same; only the codes differ. Nothing has reset it yet, so
the status line says the register holds `XX`, no state's code. Do not say what a reset would do.

## Key `motivation` (70 to 110 words, two paragraphs)

Facts:
1. The codes decide three things: what a reset does, how many flip-flops the state register
   needs, and how many gates the next-state logic needs.
2. The course's reset loads all zeros. So the state with the all-zero code is where every reset
   leads.
3. Two bits give four codes, so four states need at least two flip-flops. More flip-flops can
   mean fewer gates.

## Key `prediction` (one or two sentences)

Facts: the figure below runs the controller with TRY at `00`. It draws the circuit above its
question.

## Key `p1Question` (two or three sentences)

Facts: the figure gives one edge with RST at 1 and every other input at 0. What is SEND after it?

## Key `p1Explain` (two to four sentences)

Facts: SEND is 1. The reset loaded `00`, and `00` is TRY here. With nothing to report, the office
sends the manager a message, and keeps sending it until an answer, a FAIL or a TICK. The state
with the all-zero code must be the one a reset should lead to: IDLE.
