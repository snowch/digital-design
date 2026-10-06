// The words of the lesson on state encoding, synchronous design and writing state machines.
//
// Drafted by the course's prose process from briefs of checked facts (see CLAUDE.md and
// docs/notes/module-5-state-machines.md; the briefs and the drafts as returned are beside it) and
// placed here key by key. Edit a fact here only after checking it against
// state-encoding.facts.test.ts.

export const PROSE = {
  c1Hints: [
    "The table and the `case` arms stay the same. Only the codes change, from 2 bits to 3 bits.",
    "A 2-bit code left in a 3-bit place will not work. The text box tells you the width is wrong. Write every code as 3 bits, like `3'b001`.",
    "The reset line becomes `if (RST) state <= 3'b000;`.",
    "The case arms are labelled `3'b000`, `3'b001`, `3'b010` and `3'b100`. Add `default: next = 3'b000;` at the end to send every other pattern to IDLE.",
    "Change `logic [1:0]` to `logic [2:0]` for state, next and S. Write IDLE as `3'b000`, TRY as `3'b001`, WAIT as `3'b010` and GIVE_UP as `3'b100` everywhere: the reset, the case labels, each `next =` and each `(state == ...)`. Label GIVE_UP's arm `3'b100` instead of `default`, and add `default: next = 3'b000;`.",
  ],
  c1Task:
    "Change the controller's codes to IDLE `000`, TRY `001`, WAIT `010` and GIVE_UP `100`. The state register and output S become 3 bits wide: use `logic [2:0]` and `output logic [2:0] S`. Update every code in the text: the reset, the `case` labels, every `next` value and the outputs' comparisons. Send the unused 3-bit patterns to IDLE with a `default` arm. The tests run the controller through every state, including FAIL rising while CLK is 1 and a second reset.",
  c2Hints: [
    "Write the state in `always_ff` with its reset. Write the next state in `always_comb`: one `case` arm per state. COMP and HEAT come from the state.",
    "If you check CLEAR before WARM in DEFROST, a warm room goes to DRAIN when both are 1. WARM should win: check it first.",
    "COOL's arm reads one input: `COOL: if (TICK) next = DEFROST; else next = COOL;`.",
    "DEFROST's arm: `if (WARM) next = COOL; else if (CLEAR) next = DRAIN; else next = DEFROST;`.",
    "Declare `typedef enum logic [1:0] {COOL = 2'b00, DEFROST = 2'b01, DRAIN = 2'b10} state_t;`, then `state_t state;` and `state_t next;`. In `always_ff`: `if (RST) state <= COOL; else state <= next;`. In `always_comb`, `case (state)` with the arms for COOL, DEFROST and DRAIN as the diagram says, and `default: next = COOL;`. Then `assign COMP = (state == COOL);`, `assign HEAT = (state == DEFROST);` and `assign S = state;`.",
  ],
  c2Task:
    "Your inputs are TICK, CLEAR, WARM, RST and CLK; your outputs are COMP, HEAT and S. Use codes COOL `00`, DEFROST `01` and DRAIN `10`, with RST leading to COOL.\n\nFollow the diagram: each arrow is a row. In DEFROST, WARM wins over CLEAR. COMP is 1 in COOL and HEAT is 1 in DEFROST, from the state alone. The code `11` is no state: send it to COOL. You may use `typedef enum` to name the states. The tests include TICK falling while CLK is 1, and an edge in DEFROST with both WARM and CLEAR at 1.",
  construction:
    "In this challenge, change the controller's codes. Use IDLE `000`, TRY `001`, WAIT `010` and GIVE_UP `100` instead of the last lesson's codes. The state register becomes 3 bits wide. The table does not change: it is still nine rows. Only four of the eight 3-bit patterns are states.",
  defrostMachineLead:
    "A freezer's coils frost over and must be warmed now and then. This is the capstone: a defrost controller.\n\nThe controller has three states. COOL is the normal state: the compressor runs and cools the room. DEFROST turns on the heater to melt the ice. DRAIN turns off both while the water runs away.\n\nIts inputs are TICK, a slow pulse from a counter; CLEAR, which is 1 when the coils have no ice left; and WARM, which is 1 while the room is warmer than it should be. From COOL, a TICK starts a defrost. In DEFROST, WARM sends the controller back to COOL at once; otherwise CLEAR moves it to DRAIN. From DRAIN, a TICK takes it back to COOL. A reset leads to COOL.\n\nThe figure shows the state diagram running. Press the inputs and clock to see each move.",
  explanation:
    "Every flip-flop in this module takes its D at the same edge of one clock. Between edges, the gates work out each D from the flip-flops' Q and the inputs. The inputs count only as they are at an edge. A design that keeps this rule is called **synchronous**. This is why the timing diagrams can be read edge by edge, and why the registers lesson's AND gate in the clock's path broke things: it made an edge of its own.\n\nThe rule has a price. An input must last until an edge to be seen. A short answer, the phone that says OK and then goes quiet, must be kept until the controller reads it. The sender can keep OK at 1 until SEND falls. Or a flip-flop can be set by OK and cleared once the controller has read it.\n\nThe reset belongs to the rule too: it acts at an edge. So the codes decide where the reset leads. Give the all-zero code to the state the reset should reach.",
  modelVsReality:
    "An input from outside the clock, such as a phone's answer, can change shortly before an edge. The flip-flop can go metastable. Real designs pass such inputs through two flip-flops in a row: the second almost never sees the first undecided. This model's inputs change only between edges, so it never shows this.\n\nTools that turn text to gates may choose codes from an enumerated type; this course keeps them written in the list. Real flip-flops power up as 0 or 1, not X. Without a reset, a machine with one flip-flop per state can start with some bits at 1. This model shows X instead.",
  motivation:
    "When you choose the codes, you decide three things: where a reset takes you, how many flip-flops your state register needs, and how many gates your next-state logic builds.\n\nThe course's reset loads all zeros. So the state whose code is all zeros is where you land. Two bits give four codes, so four states need at least two flip-flops. But more flip-flops can mean fewer gates.",
  p1Explain:
    "SEND is 1. The reset loaded `00`, which is TRY here, so the controller sends a message and keeps sending it until an answer, a FAIL or a TICK arrives. But a reset should land in IDLE, where nothing sends. The all-zero code must belong to IDLE.",
  p1Question:
    "The figure gives one edge with RST at 1 and every other input at 0. What is SEND after that edge?",
  p2Explain:
    "The state is `0000`. A reset loaded all zeros, but `0000` is not a state: no state's line is 1. No row applies, so every next-state bit is 0. The controller never starts. A reset must lead to a state.",
  p2Question:
    "The figure gives one edge with RST at 1, then GO at 1 for one edge. What is S, the state's code, after it?",
  p3Explain:
    "The state is TRY, `01`. The circuit reads OK only at edges, and at the edge OK was 0, so row 6 applied and TRY stayed TRY. The manager answered and the office is still waiting.",
  p3Question: "OK rose and fell between two edges. What is the state after the next edge?",
  predictOneHotResetLead:
    "What if no state has the all-zero code? This figure gives each state its own bit: IDLE `0001`, TRY `0010`, WAIT `0100` and GIVE_UP `1000`. Four flip-flops. The figure draws the circuit above its question.",
  predictShortOkLead:
    "This figure shows a different failure. The manager's phone answers OK for a moment. It uses the last lesson's codes. After a reset and GO 1 for one edge, the state goes to TRY and sends. OK then rises to 1 and falls back to 0 between two edges. The figure draws the circuit above its question.",
  prediction:
    "The figure below runs the controller with TRY at `00`, and draws the circuit above its question.",
  question:
    "The last lesson ended by asking whether it matters which state gets which code. A reset always loads `00`. The retry controller's table shows what each state does and what outputs it sends in each state. Yet it never says which code each state has: any four different 2-bit codes would work and carry out the same table.\n\nSo what should decide which code each state gets?",
  reflection:
    "The codes you assign are a choice. Give the all-zero code to the state a reset reaches. One flip-flop per state needs no decoder but costs more. Synchronous design reads inputs at edges only. An input must last until an edge to be seen. A state machine in text is state in `always_ff`, next state in `always_comb` with `case`, outputs from the state, and `typedef enum` to name them.\n\nThis module has built counters for measuring waits, registers that pass words, and state machines that choose the next job. A computer needs far more than a few registers. How does a circuit store many words and pick one?",
  retryEnumAfter:
    "The names change nothing in the circuit. A text written with state names and one written with codes make the same gates and flip-flops. The names make the text say what the state diagram says.",
  retryEnumLead:
    "The figure shows the retry controller from the last lesson, written with its states named. The names replace the codes wherever they appear in the text.\n\nTo name the states, you declare a list at the top of the text: `typedef enum logic [1:0] {IDLE = 2'b00, TRY = 2'b01, WAIT = 2'b10, GIVE_UP = 2'b11} state_t;`. This declares four names, each a 2-bit value, and calls the list `state_t`. Then `state_t state;` declares a signal that stores one of them.\n\nAfter that, the text uses the names everywhere: the reset reads `if (RST) state <= IDLE;`, the case arms are labelled `IDLE:`, `TRY:` and so on, and SEND is `(state == TRY)`. The codes are written once, in the enum list. Changing a code is one edit, and the reset still leads wherever the all-zero code is.\n\nA name with no `= value` takes the value after the one before it, starting from 0.",
  tryZeroTableLead:
    "The figure shows the same controller with two codes swapped: TRY is `00` and IDLE is `01`. The diagram and the table are the same. The register has not been reset, so the status line says the register stores `XX`, which is no state's code.",
  writeDefrostLead:
    "Write the defrost controller from the state diagram, using the state-machine form you have seen: state in `always_ff` with its reset, next state in `always_comb` with `case`, outputs from the state.",
  writeZeroIdleLead: "The text box starts with the last lesson's controller. Change its codes.",
  zeroIdleMachineAfter:
    "With one flip-flop per state, each state is read from one bit, so the next-state logic needs no decoder. The cost is an extra flip-flop: three here instead of two. A reset loads all zeros into the register. IDLE at `000` means the reset loads IDLE. The next figures show why this choice of codes matters.",
  zeroIdleMachineLead:
    "Another code choice: use one flip-flop per state. A state's code has a single 1 in that state's own bit and 0 in all the others. Such codes are called **one-hot**. This figure gives IDLE `000`, TRY `001`, WAIT `010` and GIVE_UP `100`. A reset loads IDLE.\n\nOpen the next-state logic. There is no decoder. Bit 0 is TRY's line, bit 1 WAIT's and bit 2 GIVE_UP's. A NOR gate makes IDLE's line: 1 only when all three bits are 0. Each next-state bit is an OR of the rows that lead to that state. The table is the same nine rows; only the codes changed. Press the inputs and press Clock CLK.",
} as const;
