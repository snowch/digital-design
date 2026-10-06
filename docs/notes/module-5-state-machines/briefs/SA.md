# Brief SA: state-machines, Question, Motivation, Prediction

Read 00-module.md and S-facts.md first. Draft these keys. Each section is read straight after
the one before: write the joins, and do not repeat a fact an earlier key already stated. The
question must not say "state machine", "next-state" or "state diagram"; the motivation
introduces the first two.

## Key `question` (120 to 170 words, three paragraphs; a scene is drawn under it)

Facts, in order:
1. The registers lesson asked what a circuit would need to work through a fixed list of jobs,
   one per edge. The counters lesson's question asked what the gates in front of D would need
   to choose the next job from what happened.
2. The office's message to the manager: when GO is 1, send it (SEND 1 while sending). The
   manager's phone answers OK; the sender reports FAIL if the message did not get through.
3. After a FAIL, wait for the next TICK, a slow pulse from a counter, then send again.
4. If a whole TICK comes after a message with no answer at all, give up: sound the siren in the
   shop, SIREN, until someone resets the circuit with RST.
5. End with the question: how can a circuit remember which job it is on, and choose its next job
   from what happens?

## Key `motivation` (110 to 160 words, two or three paragraphs)

Facts:
1. The jobs are four: wait for GO; send and wait for an answer; wait for the next TICK; give up.
   Give each a name and a 2-bit code: IDLE `00`, TRY `01`, WAIT `10`, GIVE_UP `11`. Which job
   the circuit is on is its **state**: here, one of these four, held as its code.
2. A 2-bit register with a reset holds the code. At an edge where RST is 1 it becomes `00`,
   IDLE.
3. As in the counter, gates in front of the register's D work out the next code, but from the
   state and the inputs together, not by adding one.
4. Introduce the terms, plain meaning first: a circuit made of a register that holds its state
   and gates that work out the next state from the state and the inputs is a **state
   machine**. Those gates are its **next-state logic**.
5. SEND and SIREN depend on the state alone: SEND is 1 in TRY, SIREN in GIVE_UP.

## Key `prediction` (two or three sentences)

Facts: the two figures below run the circuit. Each draws it as three blocks (next-state logic, a
register, output logic) above its question. S is the register's code. Choose an answer, then
press "Check my prediction".

## Key `p1Question` (two to four sentences)

Facts: the figure resets the circuit to IDLE, then sets GO to 1 for one edge. Then GO goes back
to 0, and two more edges pass with OK, FAIL and TICK all 0. What is the state at the end?

## Key `p1Explain` (two to four sentences)

Facts: the state is TRY, `01`. GO took the circuit from IDLE to TRY. In TRY it waits for an
answer or a TICK; GO going back to 0 changes nothing. So TRY stays TRY at every edge until OK,
FAIL or TICK.

## Key `p2Question` (two to four sentences)

Facts: after a reset, GO is 1 for one edge. Then GO is 0 and TICK is 1 for one edge, with no
answer. Then TICK is 0 and OK is 1 for one more edge. What is the state at the end?

## Key `p2Explain` (two to four sentences)

Facts: the state is GIVE_UP, `11`. The TICK with no answer gave up. In GIVE_UP nothing but a
reset changes the state, so an OK that arrives too late changes nothing and the siren keeps
sounding.
