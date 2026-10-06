# Lesson fact sheet: "state-encoding" (Module 5, lesson 5)

Read the shared fact sheet (00-module.md) first, and S-facts.md for the retry controller: its
states, its table of nine rows, its circuit and its text are the same here. The learner has done
the state-machines lesson: they know **state machine**, **state diagram** and **next-state
logic**, the retry controller (IDLE `00`, TRY `01`, WAIT `10`, GIVE_UP `11`; inputs GO, OK, FAIL,
TICK; outputs SEND in TRY and SIREN in GIVE_UP; RST to IDLE), the state-machine figure, and the
text form: `always_ff` for the state register, `always_comb` with `case` for the next state,
`==`. That lesson ended: "The codes `00` to `11` were chosen without a reason given. A reset
always loads `00`. Does it matter which state gets which code?"

## Terms this lesson introduces, and where

| term | where | plain meaning |
| --- | --- | --- |
| one-hot | the investigation (key `zeroIdleMachineLead`) | codes with one flip-flop per state, where a state's code has a single 1 in that state's own bit |
| synchronous | the explanation (key `explanation`) | a design in which every flip-flop takes its D at the same edge of one clock, and every input is read only at those edges |

Before the investigation do not write "one-hot" (say "one flip-flop per state"); before the
explanation do not write "synchronous". Do not use "encoding" as a noun the lesson defines: say
"the codes", "which code each state has". In this lesson **state** means the job the machine is
on, as before.

## The four sets of codes, for the same table

| name in the library | IDLE | TRY | WAIT | GIVE_UP | flip-flops |
| --- | --- | --- | --- | --- | --- |
| retry (the last lesson's) | `00` | `01` | `10` | `11` | 2 |
| retry-try-zero | `01` | `00` | `10` | `11` | 2 |
| retry-one-hot | `0001` | `0010` | `0100` | `1000` | 4 |
| retry-zero-idle | `000` | `001` | `010` | `100` | 3 |

- The course's reset loads all zeros into the state register. So a reset leads to whichever
  state has the all-zero code, or, if no state has it, to no state at all.
- In retry-try-zero, TRY has `00`. A reset therefore starts the controller in TRY: it sends a
  message at once, with nothing to report (GO 0).
- With one flip-flop per state (retry-one-hot), each state's line is its own bit: no decoder is
  needed, and each next-state bit is the OR of the rows that lead to that state. But a reset loads
  `0000`, which is no state: no line is 1, no row applies, every next-state bit is 0, and the
  register stays `0000` at every edge. The controller never starts.
- retry-zero-idle keeps one flip-flop per state for TRY, WAIT and GIVE_UP and gives IDLE the
  all-zero code `000`. IDLE's line is a NOR of the three bits (1 only when all are 0). A reset
  starts it in IDLE. Three flip-flops instead of two; in return each state but IDLE is read from
  one bit.
- The state-machine figure says, when the register holds a code no state has: "The register
  holds {code}, which is no state." (exact words to come from the figure's labels; describe it as
  the status line saying the register holds no state's code).

## The figures and what they show (all checked)

- Question figure (`try-zero-table`, the state-machine figure showing only the diagram and the
  table, for retry-try-zero): the same diagram and the same nine rows, but TRY is `00` and IDLE
  `01`. Nothing has reset it, so the status line says the register holds `XX`, no state.
- Prediction 1 (`predict-try-zero`, retry-try-zero): one edge with RST 1, all other inputs 0.
  Watch SEND. Answer 1. Options SEND is 0, SEND is 1, the simulator cannot know SEND (X). The
  reset loaded `00`, and `00` is TRY here, so SEND is 1: the office sends a message nobody asked
  for, and keeps sending until an answer, a FAIL or a TICK.
- Investigation (`zero-idle-machine`, the state-machine figure with diagram, table and circuit,
  retry-zero-idle): starts after a reset, in IDLE `000`. Open the next-state logic: no decoder;
  a NOR gate gives IDLE's line; TRY's, WAIT's and GIVE_UP's lines are the register's bits
  themselves. Each next-state bit is an OR of the rows leading to its state (or one row's gate).
- Failure experiment, prediction 2 (`predict-one-hot-reset`, retry-one-hot): one edge with RST 1,
  then GO 1 for one edge. Watch S. Answer `0000`. Options `0010` (TRY), `0001` (IDLE), `0000`.
  The reset loaded `0000`, which no state has. No row applies, so the next state is `0000` at
  every edge, whatever GO does.
- Failure experiment, prediction 3 (`predict-short-ok`, the retry controller with the last
  lesson's codes): a reset; GO 1 for one edge (TRY); then, between two edges, OK rises to 1 and
  falls back to 0; then one edge. Watch S. Answer `01`, TRY. Options IDLE `00`, TRY `01`, WAIT
  `10`. The circuit reads OK only at an edge. An answer that comes and goes between two edges is
  never seen: at the edge OK was 0, so row 6 applied and TRY stayed TRY. The manager answered and
  the office is still waiting.
- Explanation (no figure): the rule all of this module's circuits follow, now named. Every
  flip-flop takes its D at the same edge of one clock; between edges the gates work out each D
  from the flip-flops' Q and the inputs; the inputs count only as they are at an edge. A design
  that keeps this rule is **synchronous**. It is why the course's timing diagrams can be read
  edge by edge, and why the gated clock of the registers lesson broke it. Its price: an input
  must last until an edge to be seen, so a short answer must be kept until the controller
  reads it (for example by a flip-flop that is set by OK and cleared once the controller has
  read it, or by a sender that holds OK at 1 until SEND falls).
- Generalisation (`retry-enum`, the state-machine figure showing the diagram and the text, with
  the last lesson's codes): the controller written with its states named. The text declares the
  names once:

  ```
  typedef enum logic [1:0] {IDLE = 2'b00, TRY = 2'b01, WAIT = 2'b10, GIVE_UP = 2'b11} state_t;
  state_t state;
  state_t next;
  ```

  - `typedef enum logic [1:0] { ... } state_t;` declares a list of names, each a 2-bit value, and
    calls the list `state_t`. `state_t state;` declares a signal that holds one of them.
  - After that the arms read `IDLE: begin ... end`, the reset reads `if (RST) state <= IDLE;`,
    and SEND is `(state == TRY)`. The codes are written once, in the list, so changing a code is
    one edit.
  - A name with no `= value` takes the value after the one before it, starting from 0.
- Challenge figure (`defrost-machine`, the state-machine figure showing only the diagram, for the
  defrost machine), and the capstone.

## The capstone: the freezer room's defrost cycle

A freezer's coils frost over and must be warmed now and then. The defrost controller:

- Inputs TICK (a slow pulse from a counter), CLEAR (1 when the coils have no ice left), WARM (1
  while the freezer room is warmer than it should be: Module 2's WARM), RST, CLK. Outputs COMP
  (the compressor runs, cooling), HEAT (the heater runs, melting the ice), and S, the state's
  code.
- States and codes: COOL `00` (COMP 1), DEFROST `01` (HEAT 1), DRAIN `10` (neither: the water runs
  away). `11` is no state.
- Its table, seven rows:

  | row | state | TICK | CLEAR | WARM | next state |
  | --- | --- | --- | --- | --- | --- |
  | 1 | COOL | 1 | – | – | DEFROST |
  | 2 | COOL | 0 | – | – | COOL |
  | 3 | DEFROST | – | – | 1 | COOL |
  | 4 | DEFROST | – | 1 | 0 | DRAIN |
  | 5 | DEFROST | – | 0 | 0 | DEFROST |
  | 6 | DRAIN | 1 | – | – | COOL |
  | 7 | DRAIN | 0 | – | – | DRAIN |

  If the room gets WARM while defrosting, cooling wins at once.
- At an edge where RST is 1, the state is COOL.
- The figure above the challenge shows the diagram running; the learner can press inputs and
  clock it. It does not show the table or the text.
- The challenge (`defrost`, write): the header is given: inputs TICK, CLEAR, WARM, RST, CLK;
  outputs COMP, HEAT and S (2 bits). Write the machine that follows the diagram, with the codes
  COOL `00`, DEFROST `01`, DRAIN `10`. An enumerated type is allowed. 10 tests, including TICK
  falling while CLK is 1, and an edge in DEFROST with WARM and CLEAR both 1 (WARM wins: COOL).
- The construction challenge (`zero-idle`, write): the text box starts with the last lesson's
  controller text. Change its codes to IDLE `000`, TRY `001`, WAIT `010`, GIVE_UP `100`, so the
  state register is 3 bits and S is 3 bits. The table stays the same. 9 tests run the controller
  through every state, and include FAIL rising while CLK is 1 and a second reset. The reference is
  the last lesson's text with `logic [2:0]`, the new codes in every arm and label, `3'b000` for
  the reset, and a `default` arm that sends any other pattern to `3'b000`, since only four of the
  eight 3-bit patterns are states.

## Model versus hardware (facts)

- An input that comes from outside the clock, such as a phone's answer, can change just before
  an edge. Module 4's flip-flop can then go metastable. Real designs pass such an input through
  two flip-flops in a row before any logic reads it: the second one almost never sees the first
  one undecided. The model's inputs change only between edges, so it never shows this.
- Tools that turn text into gates may choose the codes themselves from an enumerated type,
  binary or one flip-flop per state; the course keeps the codes written in the list.
- Real flip-flops do power up as 0 or 1, not X; without a reset a one-flip-flop-per-state machine
  can start in several states at once. The model shows X instead.
