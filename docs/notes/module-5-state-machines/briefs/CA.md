# Brief CA: counters, Question, Motivation, Prediction

Read 00-module.md and C-facts.md first. Draft these keys. Each section is read straight after
the one before: write the joins, and do not repeat a fact an earlier key already stated. Do not
write "counter" in any form in these keys.

## Key `question` (section "Question"; 90 to 130 words, two or three paragraphs; a scene is drawn under it)

Facts, in this order:
1. The registers lesson ended by asking what would happen if the gates before D worked out a
   new value from Q, such as the next number up.
2. The shop needs that. The office will send the manager a message when something is wrong. If
   the message fails, the office must wait a while before sending it again.
3. CLK rises at a steady rate, so a number of rising edges is a length of time. Counting edges
   measures the wait.
4. The circuit has an input EN: it counts at an edge only while EN is 1. A reset, RST, starts it
   at `0000`. A 4-bit display shows the count. A lamp, TICK, lights when the count is about to
   start again from `0000`.
5. End with the question, as a question: how can a circuit add one to its own number at every
   edge?

## Key `motivation` (80 to 120 words, two paragraphs)

Facts:
1. A register keeps a word and takes D at each edge. Module 3's adders add words.
2. Feed the register's own Q into an adder that adds 1, and the adder's output into the
   register's D. At each edge the register takes Q plus 1: the next number up.
3. Q plus 1 needs no full adder: a half adder adds a bit of Q and a carry. Bit 0's half adder adds
   EN instead of 1, so when EN is 0 nothing is added and the register keeps its number. (Say this
   as the plan, in two or three sentences.)
4. The adder's answer feeds back to the register, but no loop runs wild: the register changes
   only at an edge, so the adder sees one Q between edges.

## Key `prediction` (two or three sentences)

Facts: the two figures below run the circuit the question asks for: a 4-bit register and a block
"add one". Each draws the circuit above its question. Choose an answer, then press "Check my
prediction".

## Key `p1Question` (two to four sentences)

Facts: the figure resets the circuit, so Q is `0000`. EN stays 1. Then CLK rises 16 times. What
is Q after the 16th edge?

## Key `p1Explain` (three to five sentences)

Facts: Q is `0000`. After 15 edges Q was `1111`, the largest 4-bit number. The next number up,
`10000`, has five bits; the register keeps four, so it takes `0000`. The carry out of bit 3 has
nowhere to go: Module 3 called this overflow. Counting wraps round from `1111` to `0000`. While
Q was `1111`, TICK was 1: the timing diagram shows it.

## Key `p2Question` (two to four sentences)

Facts: the figure resets the circuit, gives two edges with EN 1, then sets EN to 0 and gives
three more edges. What is Q at the end?

## Key `p2Explain` (two or three sentences)

Facts: Q is `0010`. The two edges with EN 1 counted to `0010`. With EN at 0 the adder adds
nothing, so D is Q and every edge keeps the number. EN is the register's load enable from the
registers lesson again, in a new place: it decides whether an edge adds one.
