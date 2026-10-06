# Brief NC: state-encoding, Explanation, Generalisation, Challenge, Reflection, model note

Read 00-module.md, S-facts.md and N-facts.md first. This text follows the failure experiment:
one flip-flop per state with no all-zero state never starts, and an OK that rose and fell between
two edges was never seen. Do not repeat those results.

## Key `explanation` (section prose, no figure; 120 to 170 words, three paragraphs)

Facts:
1. Every circuit in this module follows one rule. Every flip-flop takes its D at the same edge
   of one clock. Between edges, gates work out each D from the flip-flops' Q and the inputs. The
   inputs count only as they are at an edge.
2. Introduce the term, plain meaning first: a design that keeps this rule is called
   **synchronous**. It is why the timing diagrams can be read edge by edge, and why the
   registers lesson's AND gate in the clock's path broke things: it made an edge of its own.
3. Its price is the short OK: an input must last until an edge to be seen. A short answer must be
   kept until the controller reads it: by a sender that holds OK at 1 until SEND falls, or by a
   flip-flop that is set by OK and cleared once the controller has read it.
4. The reset belongs to the rule too: it acts at an edge, so the codes decide where it leads. Give
   the all-zero code to the state a reset should lead to.

## Key `retryEnumLead` (above the generalisation figure, which shows the diagram and the text; 120 to 170 words)

Facts:
1. The figure is the retry controller with the last lesson's codes, written with its states
   named.
2. `typedef enum logic [1:0] {IDLE = 2'b00, TRY = 2'b01, WAIT = 2'b10, GIVE_UP = 2'b11} state_t;`
   declares a list of names, each a 2-bit value, and calls the list `state_t`. `state_t state;`
   declares a signal that holds one of them.
3. After that the text uses the names: the reset is `if (RST) state <= IDLE;`, the arms are
   labelled `IDLE:`, `TRY:` and so on, and SEND is `(state == TRY)`.
4. The codes are written once, in the list. Changing a code is one edit, and the reset still
   leads wherever the all-zero code is.
5. A name written with no `= value` takes the value after the one before it, starting from 0.

## Key `retryEnumAfter` (below it; 30 to 50 words)

Facts: the names change nothing in the circuit: the text with names and the text with codes make
the same gates and flip-flops. They make the text say what the state diagram says.

## Key `defrostMachineLead` (above the capstone's figure, which shows only the diagram; 100 to 150 words)

Facts:
1. The capstone: a controller you have not seen in text. A freezer's coils frost over and must
   be warmed now and then.
2. The defrost controller has three states: COOL (the compressor runs, COMP 1), DEFROST (the
   heater melts the ice, HEAT 1) and DRAIN (both off while the water runs away).
3. Its inputs: TICK, a slow pulse from a counter; CLEAR, 1 when the coils have no ice left; and
   WARM, 1 while the room is warmer than it should be (Module 2's WARM).
4. From COOL, a TICK starts a defrost. In DEFROST, WARM sends it back to COOL at once; otherwise
   CLEAR moves it to DRAIN. From DRAIN, a TICK goes back to COOL. A reset leads to COOL.
5. The figure shows the state diagram, running: press the inputs and clock it to see each move.

## Key `writeDefrostLead` (above the capstone challenge; one or two sentences)

Facts: write the defrost controller from its state diagram, as text.

## Key `c2Task` (the task; a short list or six to eight sentences)

Facts:
1. The header is given: inputs TICK, CLEAR, WARM, RST and CLK; outputs COMP, HEAT and S, the
   state's 2-bit code.
2. Use the codes COOL `00`, DEFROST `01`, DRAIN `10`. At an edge where RST is 1, the state is
   COOL.
3. Follow the diagram: every arrow is a row. In DEFROST, WARM wins over CLEAR.
4. COMP is 1 in COOL and HEAT is 1 in DEFROST, each from the state alone.
5. `11` is no state: send it to COOL.
6. You may name the states with `typedef enum`. The tests include TICK falling while CLK is 1,
   and an edge in DEFROST with WARM and CLEAR both 1.

## Key `c2Hints` (five hints, in this order)

1. (The idea.) Write the state machine's form: the state in an `always_ff` with its reset, the
   next state in an `always_comb` with one `case` arm per state, and COMP and HEAT from the state.
2. (A mistake.) In DEFROST, testing CLEAR before WARM sends a warm room to DRAIN when both are 1.
   WARM must come first.
3. (A smaller example.) COOL's arm reads one input: `COOL: if (TICK) next = DEFROST; else next =
   COOL;`.
4. (Part of the answer.) DEFROST's arm: `if (WARM) next = COOL; else if (CLEAR) next = DRAIN;
   else next = DEFROST;`.
5. (The whole answer.) Declare `typedef enum logic [1:0] {COOL = 2'b00, DEFROST = 2'b01, DRAIN =
   2'b10} state_t;`, then `state_t state;` and `state_t next;`. In `always_ff`: `if (RST) state
   <= COOL; else state <= next;`. In `always_comb`, `case (state)` with the arms for COOL,
   DEFROST and DRAIN as the diagram says, and `default: next = COOL;`. Then `assign COMP = (state
   == COOL);`, `assign HEAT = (state == DEFROST);` and `assign S = state;`.

## Key `reflection` (70 to 110 words, two paragraphs)

Facts:
1. The codes are a choice: the all-zero code goes to the state a reset leads to; one flip-flop
   per state needs no decoder but more flip-flops.
2. Synchronous design reads inputs only at edges, so an input must last until an edge.
3. A state machine in text is the state in `always_ff`, the next state in `always_comb` with
   `case`, and the outputs from the state; `typedef enum` names the states.
4. End with what the module built: counters, registers that pass words, and state machines that
   choose the next job. Ask the next question: a computer keeps far more words than a few
   registers. How does a circuit keep hundreds of words and pick one?

## Key `modelVsReality` (70 to 110 words)

Facts:
1. An input from outside the clock, such as a phone's answer, can change just before an edge.
   Module 4's flip-flop can then go metastable. Real designs pass such an input through two
   flip-flops in a row before any gate reads it: the second one almost never sees the first one
   undecided. The model's inputs change only between edges, so it never shows this.
2. Tools that turn text into gates may choose the codes themselves from an enumerated type; the
   course keeps the codes written in the list.
3. Real flip-flops power up as 0 or 1, not X. Without a reset, a machine with one flip-flop per
   state can start with several bits at 1. The model shows X instead.
