# Lesson fact sheet: "state-machines" (Module 5, lesson 4)

Read the shared fact sheet (00-module.md) first. This sheet holds the facts of this lesson. The
learner has also done the two previous lessons:

- **counter**: a register whose D is its own Q plus one, from a chain of half adders; EN decides
  whether an edge counts; RST starts it at `0000`; its TICK is 1 once every so many edges, so a
  counter measures a wait.
- **register transfer**: at an edge a register takes a word worked out from registers' values
  before that edge, written NOW ← IN; every `<=` in an `always_ff` takes its value at the same
  edge; two registers can swap at one edge.

You may use both terms.

## Terms this lesson introduces, and where

| term | where | plain meaning |
| --- | --- | --- |
| state machine | the motivation (key `motivation`) | a circuit with a register that holds a number naming the job it is on (its state), and gates that work out the next job's number from that number and the inputs |
| next-state logic | the motivation, after "state machine" | those gates: they work out the next state's number, which reaches the register's D |
| state diagram | the investigation (key `retryMachineLead`) | a drawing of the states as boxes and the moves between them as arrows, each arrow labelled with the inputs that make it |

Before the motivation, do not write "state machine", "next-state" or "state diagram". In this
lesson the word **state** means one thing only: which of the listed jobs the machine is on,
held as a code in the register. Do not use "state" for a signal's value (say "value"). This
lesson must not use: one-hot, synchronous, encoding (say "the codes" or "which code each state
has").

## The story of this lesson

When something is wrong, the office sends the manager a message: the sender sends it while SEND
is 1. The manager's phone answers OK (the manager has read it). The sender reports FAIL if the
message did not get through. A counter like the previous lessons' gives TICK, a pulse at a
steady rate, much slower than CLK. GO is 1 when there is something to report. If a message
fails, the office waits for the next TICK and sends it again. If a whole TICK passes after a
message with no answer at all, it gives up and sounds a siren in the shop, SIREN, for whoever is
there. Only a reset, RST, ends the siren.

## The retry controller (library circuit retry)

- Inputs GO, OK, FAIL, TICK, RST, CLK. Outputs SEND, SIREN, and S, the state's 2-bit code.
- Four states, each with a code and its outputs:
  - IDLE, code `00`: nothing to send. SEND 0, SIREN 0.
  - TRY, code `01`: sending, waiting for an answer. SEND 1.
  - WAIT, code `10`: the message failed; waiting for the next TICK. SEND 0.
  - GIVE_UP, code `11`: no answer came; the siren sounds. SIREN 1.
- The outputs depend on the state alone, not on the inputs.
- The encoded table, nine rows in this order ("–" means the row does not read that input):

  | row | state | GO | OK | FAIL | TICK | next state |
  | --- | --- | --- | --- | --- | --- | --- |
  | 1 | IDLE `00` | 1 | – | – | – | TRY `01` |
  | 2 | IDLE `00` | 0 | – | – | – | IDLE `00` |
  | 3 | TRY `01` | – | 1 | – | – | IDLE `00` |
  | 4 | TRY `01` | – | 0 | 1 | – | WAIT `10` |
  | 5 | TRY `01` | – | 0 | 0 | 1 | GIVE_UP `11` |
  | 6 | TRY `01` | – | 0 | 0 | 0 | TRY `01` |
  | 7 | WAIT `10` | – | – | – | 1 | TRY `01` |
  | 8 | WAIT `10` | – | – | – | 0 | WAIT `10` |
  | 9 | GIVE_UP `11` | – | – | – | – | GIVE_UP `11` |

- In each state exactly one row applies, whatever the inputs. In TRY, OK wins over FAIL, and
  FAIL over TICK.
- At an edge where RST is 1, the state register becomes `00`, IDLE, whatever the table says.
- Four kinds of move: stay (a state's row leads back to itself: rows 2, 6, 8, 9), advance (IDLE
  to TRY, TRY to WAIT or GIVE_UP), return (TRY to IDLE when OK, WAIT to TRY), and reset (RST to
  IDLE).
- The circuit is three blocks: "next-state logic", a 2-bit "register" with RST (the registers
  lesson's), and "output logic". The register's Q is the state; it feeds back to the next-state
  logic. The next-state logic's output, the 2-bit word next, reaches the register's D.
- Inside the next-state logic, read off the table row by row, with nothing simplified: a split
  block gives the state's two bits, S1 and S0. Module 3's decoder turns them into one line per
  state: Y0 is 1 in IDLE, Y1 in TRY, Y2 in WAIT, Y3 in GIVE_UP. NOT gates give OK, FAIL and TICK
  inverted. Each row whose next state has a 1 in it is one AND gate, named row1, row4 and so on:
  the state's line AND the row's inputs (an input the row needs at 0 comes through its NOT gate).
  Bit 1 of the next state is an OR of the rows whose next state's bit 1 is 1 (rows 4, 5, 8 and 9:
  WAIT and GIVE_UP); bit 0 is an OR of the rows whose next state's bit 0 is 1 (rows 1, 5, 6, 7
  and 9: TRY and GIVE_UP). A join block makes the two bits into next.
- Rows 2 and 3 lead to IDLE, `00`: they need no gate. When no row gives a bit a 1, it is 0.
  Row 9 reads no input, so its term is GIVE_UP's line itself, with no gate.
- So the gates are row1, row4, row5, row6, row7 and row8, two OR gates (orN1, orN0) and three
  NOT gates (notOK, notFAIL, notTICK).
- The output logic is a second decoder on the state: SEND is TRY's line, SIREN is GIVE_UP's.

## The figures and what they show (all checked)

- Scene under the question (`retry-scene`): in the office, a switch on GO, a receiver on OK
  (the phone's answer), a receiver on FAIL (the sender's report), a timer on TICK and a clock on
  CLK, into a box marked ?, out to a lamp on SEND (the sender) and a lamp on SIREN.
- Prediction 1 (`predict-stay`, retry): a reset; GO 1 for one edge; then GO 0 for two more
  edges, with OK, FAIL and TICK at 0. Watch S. Answer `01`, TRY. Options IDLE `00`, TRY `01`,
  WAIT `10`. GO going back to 0 does not stop the message: TRY waits for an answer or a TICK
  (row 6).
- Prediction 2 (`predict-give-up`, retry): a reset; GO 1 for one edge (TRY); then GO 0 and TICK
  1 for one edge with no answer (GIVE_UP); then TICK 0 and OK 1 for one more edge. Watch S.
  Answer `11`, GIVE_UP. Options IDLE `00`, GIVE_UP `11`, TRY `01`. GIVE_UP has one row, row 9,
  which reads no input: an OK that arrives too late changes nothing. Only RST leaves GIVE_UP.
- Investigation (`retry-machine`, the state-machine figure, Clocked): starts after a reset, in
  IDLE. Above it, a button per input: "GO = 0", "OK = 0", "FAIL = 0", "TICK = 0", "RST = 0";
  pressing one flips it. "Clock CLK" makes one edge; "Start again" starts again after a reset.
  A status line says the state now, the row that applies, and the state the next edge gives.
  The figure shows, all from one simulator:
  - the state diagram: a box per state with its name and code, an arrow per move labelled with
    the inputs that make it ("GO 1", "OK 0, FAIL 1", "always" for row 9); the state now is
    marked, and so is the arrow the next edge will take;
  - the encoded table, with the row that applies marked;
  - the circuit (the three blocks), each block can be opened, down to the flip-flops' latches;
  - a timing diagram of the run so far, with S written as the state's name and code.
  The row marked is the one the table says applies; the next state the status line gives is read
  from the circuit's own wire next, at the register's D.
- Fault figure (`retry-faults`, retry, Clocked, drawn opened at the next-state logic): checks
  "reset", "GO 1", "FAIL 1", "waiting" (FAIL 0, TICK 0), "TICK 1", "no answer by the next TICK"
  (TICK still 1). The healthy controller goes IDLE, TRY, WAIT, WAIT, TRY, GIVE_UP. Faults:
  - "row4" output fixed at 0: in TRY with FAIL 1 no row gives a 1, so the next state is `00`,
    IDLE. A failed message is taken for an answered one, and the manager is never told. 4 of 6
    checks fail: "FAIL 1", "waiting", "TICK 1", "no answer by the next TICK".
  - "row8" output fixed at 0: in WAIT with TICK 0 the next state is `00`, IDLE: the controller
    forgets the message it was waiting to send again. 3 of 6 fail: "waiting", "TICK 1", "no answer
    by the next TICK".
  - row5's AND gate changed to OR: row5 is 1 whenever any of its inputs is 1 (TRY's line, NOT OK,
    NOT FAIL, TICK), which is almost always. Right after the reset, in IDLE with OK 0, it gives
    `11`: the controller jumps to GIVE_UP and sounds the siren before any message. 4 of 6 fail:
    "GO 1", "FAIL 1", "waiting", "TICK 1".
- Explanation explorer (`next-state-inside`, retry, opened at the next-state logic, Clocked):
  starts after a reset, in IDLE. Pins GO, OK, FAIL, TICK and state can be pressed (state is
  shown). The decoder's Y0 is 1; with GO 0 no row gate gives a 1, so next is `00`. Press GO to
  1: row1 gives 1, orN0 gives 1, next is `01`. Press "Clock CLK" and the state becomes `01`.
- Generalisation (`retry-as-text`, the state-machine figure showing the diagram and the text):
  the controller as the course's text. The state register is one `always_ff`: `if (RST) state
  <= 2'b00; else state <= next;`. The next-state logic is one `always_comb` with a `case`:

  ```
  always_comb begin
    case (state)
      2'b00: begin // IDLE
        if (GO) next = 2'b01;
        else next = 2'b00;
      end
      2'b01: begin // TRY
        if (OK) next = 2'b00;
        else if (~OK & FAIL) next = 2'b10;
        else if (~OK & ~FAIL & TICK) next = 2'b11;
        else next = 2'b01;
      end
      2'b10: begin // WAIT
        if (TICK) next = 2'b01;
        else next = 2'b10;
      end
      default: next = 2'b11; // GIVE_UP
    endcase
  end
  assign SEND = (state == 2'b01);
  assign SIREN = (state == 2'b11);
  assign S = state;
  ```

  - `always_comb` describes gates: its lines are worked out again whenever an input changes, not
    at an edge. Inside it a value is given with `=`, not `<=`.
  - `case (state)` picks the arm whose label equals the state; `default` takes every other
    value, here `11`. Each arm is one state's rows in the table's order. `//` starts a comment,
    which the circuit ignores.
  - `(state == 2'b01)` is 1 when the two sides are equal, as Module 3's comparator.
  - The text and the table say the same thing, row for row.
- Prediction 3 in the challenge section (`predict-reset`, retry): a reset; GO 1 (TRY); FAIL 1
  (WAIT); then RST 1 and TICK 1 for one edge. Watch S. Answer `00`, IDLE. Options IDLE `00`, TRY
  `01`, WAIT `10`. The table says WAIT with TICK 1 goes to TRY (row 7), but the reset wins: the
  register's reset acts before its D, as in the registers lesson.

## The challenges

- `next-one` (draw, Stepped): inputs S1, S0, OK, FAIL, TICK; output N1, bit 1 of the next state.
  N1 must be 1 exactly in the rows whose next state is WAIT `10` or GIVE_UP `11`: rows 4, 5, 8
  and 9. Parts offered: Module 3's decoder block, AND, OR and NOT gates. GO is not an input: no
  row with a next state of WAIT or GIVE_UP reads GO. 32 tests, one per combination of the five
  inputs. The reference: the decoder on S1 and S0; row4 = TRY AND NOT OK AND FAIL; row5 = TRY AND
  NOT OK AND NOT FAIL AND TICK; row8 = WAIT AND NOT TICK; N1 = row4 OR row5 OR row8 OR GIVE_UP.
- `late-ok` (write): the lab. The text box starts with the whole controller's text (as above).
  The change: an OK that arrives while the controller is in WAIT means the manager has read the
  message after all, so WAIT must go to IDLE when OK is 1, and to TRY when OK is 0 and TICK is 1,
  and stay in WAIT when both are 0. Nothing else changes. Inputs GO, OK, FAIL, TICK, RST, CLK;
  outputs SEND, SIREN, S (2 bits). 13 tests, including one where GO falls while CLK is 1, one
  where OK rises while CLK is 1, an edge in WAIT with OK 1, and an edge in GIVE_UP with OK 1 that
  must stay GIVE_UP. The reference changes only the WAIT arm:

  ```
  2'b10: begin // WAIT
    if (OK) next = 2'b00;
    else if (~OK & TICK) next = 2'b01;
    else next = 2'b10;
  end
  ```

## Model versus hardware (facts)

- The model's inputs change only between edges. A real answer from a phone can arrive at any
  moment, including just before an edge; Module 4's metastability is the risk. The next lesson
  shows what an input that rises and falls between two edges does.
- The model's next-state logic settles before every edge. A real one has a delay through the
  decoder, an AND gate and an OR gate, and the clock must leave time for it, as for the counter's
  carries.
- Real tools would simplify the gates (fewer and smaller AND gates); the course builds them row
  by row so each gate matches a row of the table. Both make the same next state.
