// Copyright © 2026 Christopher Snow

// The words of the lesson on state machines (Slice 2, the retry controller).
//
// Drafted by the course's prose process from briefs of checked facts (see CLAUDE.md and
// docs/notes/module-5-state-machines.md; the briefs and the drafts as returned are beside it) and
// placed here key by key. Edit a fact here only after checking it against
// state-machines.facts.test.ts.

export const PROSE = {
  buildNextOneLead:
    "Draw N1 from the table. The parts offered are Module 3's decoder, AND, OR and NOT gates.",
  c1Hints: [
    "N1 is 1 exactly in the rows whose next state is WAIT `10` or GIVE_UP `11`. Which rows are those?",
    "Row 8 reads TICK at 0. Without NOT TICK, it would be 1 in WAIT when TICK is 1, but row 7 applies there and leads to TRY, whose bit 1 is 0. Every input the row reads must be in its gate.",
    "Row 8 alone: WAIT's line is the decoder's Y2. Row 8 reads TICK at 0, so its gate is Y2 AND NOT TICK.",
    "Row 4 is Y1 AND NOT OK AND FAIL. Row 5 is Y1 AND NOT OK AND NOT FAIL AND TICK. Row 9 reads no input: its term is Y3 itself.",
    "Wire S1 and S0 to the decoder. Make NOT OK, NOT FAIL and NOT TICK. Row 4: an AND of Y1, NOT OK and FAIL. Row 5: an AND of Y1, NOT OK, NOT FAIL and TICK. Row 8: an AND of Y2 and NOT TICK. N1 is an OR of row 4, row 5, row 8 and Y3.",
  ],
  c1Task:
    "Draw a circuit with inputs S1, S0, OK, FAIL and TICK and output N1. N1 is bit 1 of the next state: 1 in every row whose next state is WAIT `10` or GIVE_UP `11`, and 0 in every other row. Use the table: rows 4, 5, 8 and 9. GO is not an input: no row whose next state is WAIT or GIVE_UP reads GO. The tests try all 32 combinations of the five inputs.",
  c2Hints: [
    "Only the WAIT arm of the `case` changes. Write its rows in order: the row with OK first.",
    "Adding the OK row after the TICK row lets TICK win when both are 1, and the controller sends again though the manager has answered.",
    "TRY's arm already starts with `if (OK) next = 2'b00;`: an answer ends the job.",
    "WAIT's new arm should start `if (OK) next = 2'b00;`, like TRY's.",
    "Replace WAIT's arm with:\n\n```\n2'b10: begin // WAIT\n  if (OK) next = 2'b00;\n  else if (~OK & TICK) next = 2'b01;\n  else next = 2'b10;\nend\n```",
  ],
  c2Task:
    "The text box starts with the whole controller's text. Change the WAIT arm: if OK is 1, the next state is IDLE; otherwise if TICK is 1, TRY; otherwise WAIT. Nothing else changes. GIVE_UP still ignores OK.\n\nInputs: GO, OK, FAIL, TICK, RST, CLK. Outputs: SEND, SIREN, S (the state's code).\n\nThe tests run the controller through every state, including an edge in WAIT with OK 1 and TICK 1 together (OK wins: the next state is IDLE), an edge in GIVE_UP with OK 1, one test where GO falls while CLK is 1, and one where OK rises while CLK is 1.",
  construction:
    "The next-state logic is read off the table, row by row, with nothing simplified. Module 3's decoder turns the state's bits S1 and S0 into one line per state: Y0 for IDLE, Y1 for TRY, Y2 for WAIT, Y3 for GIVE_UP. Each row is one AND gate: the state's line AND the row's inputs, with an input the row needs at 0 coming through a NOT gate. Each bit of the next state is an OR of the rows whose next state has a 1 in that bit. You draw bit 1 of the next state, N1.",
  explanation:
    "Between edges, the next-state logic works out the code of the next state from the state and the inputs. That code waits at the register's D. At the edge the register takes it, and the next-state logic starts again from the new state.\n\nRows 2 and 3 lead to IDLE, `00`, and need no gate: when no row gives a bit a 1, the OR gives 0. Row 9 reads no input, so its term is GIVE_UP's line itself. The gates are row1, row4, row5, row6, row7, row8 and two OR gates.\n\nSEND and SIREN come from the output logic, which reads the state alone. An input that changes between edges cannot change them; only an edge can.",
  modelVsReality:
    "The model's inputs change only between edges. A real answer can arrive at any moment, even just before an edge, when metastability is the risk. The next lesson shows what an input that rises and falls between two edges does.\n\nThe next-state logic settles before every edge in the model. A real one takes time through the decoder, an AND gate and an OR gate, and the clock must leave that time, as for the counter's carries.\n\nReal tools simplify the gates. The course builds them row by row so each gate matches a row of the table. Both give the same next state.",
  motivation:
    "The circuit has four jobs: wait for GO, send and wait for an answer, wait for the next TICK, or give up. Give each a name and code: IDLE `00`, TRY `01`, WAIT `10`, GIVE_UP `11`. Which job the circuit is on is its **state**, one of these four, stored as a code in a 2-bit register.\n\nAt a rising edge where RST is 1, the register becomes `00`, IDLE. Like the counter, gates before the register's D work out the next code, but from the state and the inputs together, not by adding one. A circuit made of a register that stores its state and gates that work out the next state from the state and the inputs is a **state machine**. Those gates are its **next-state logic**.\n\nThe outputs SEND and SIREN depend on the state alone: SEND is 1 in TRY, SIREN in GIVE_UP.",
  nextStateInsideAfter:
    "At any moment at most one row's gate gives 1, the row that applies. When the row leads to IDLE, none does. Each gate is a row of the table, and the table is the state diagram written out.",
  nextStateInsideLead:
    "The figure shows the controller opened at its next-state logic. After a reset it runs in IDLE and the decoder's Y0 is 1. With GO at 0, no row's gate gives a 1, so next is `00`.\n\nPress GO to 1: row1 gives 1, the OR gate for bit 0 gives 1, and next is `01`. Press \"Clock CLK\" and the state becomes `01`, TRY, and Y1 is 1.\n\nTry the inputs in TRY and watch which row's gate lights.",
  p1Explain:
    "The state is TRY, `01`. GO took the circuit from IDLE to TRY. In TRY the circuit waits for an answer or a TICK, so GO going back to 0 changes nothing. TRY stays TRY at every edge until OK, FAIL or TICK.",
  p1Question:
    "The figure resets the circuit to IDLE, then sets GO to 1 for one edge. GO goes back to 0, and two more edges pass with OK, FAIL and TICK all 0. What is the state at the end?",
  p2Explain:
    "The state is GIVE_UP, `11`. The TICK with no answer gave up. In GIVE_UP nothing but a reset changes the state, so an OK that arrives too late changes nothing and the siren keeps sounding.",
  p2Question:
    "After a reset, GO is 1 for one edge. Then GO is 0 and TICK is 1 for one edge, with no answer. Then TICK is 0 and OK is 1 for one more edge. What is the state at the end?",
  p3Explain:
    "The state is IDLE, `00`. The table says WAIT with TICK 1 goes to TRY (row 7), but the reset wins: the register's reset acts before its D, as in the registers lesson.",
  p3Question:
    "After a reset, GO becomes 1 for one edge, FAIL becomes 1 for one edge, and then RST and TICK both become 1 for one edge. What is the state?",
  predictResetLead:
    "One kind of move is left to predict: the reset. The figure draws the circuit above its question.",
  prediction:
    'The two figures below run the circuit, each drawn as three blocks: next-state logic, a register, and output logic. S is an output showing the state\'s code. Choose an answer and then press "Check my prediction".',
  question:
    "The registers lesson asked what a circuit would need to work through a fixed list of jobs, one per edge. The counters lesson raised a new question: what if the gates in front of D chose the next job from what the inputs said?\n\nWhen GO is 1, the office sends the manager a message. The manager's phone answers OK when the manager has read it; the sender reports FAIL if the message did not get through. After a FAIL, the office waits for the next TICK, a slow pulse from a counter, then sends again. If a whole TICK passes with no answer, the office gives up: the siren sounds in the shop, SIREN, until someone resets the circuit with RST.\n\nA circuit needs to remember which job it is on: waiting for GO, sending and waiting for an answer, waiting for the next TICK, or giving up. How can a circuit store which job it is on and choose its next job from what happens?",
  reflection:
    "This lesson showed one machine four ways. The state diagram, the table, the circuit, and the text all say the same thing: which state the machine is in, and what the next state will be.\n\nThe codes `00` to `11` were chosen without a reason given. A reset always loads `00`. Does it matter which state gets which code?",
  retryAsTextAfter:
    "The state machine's form in text is always the same: the state in an `always_ff` with its reset, the next state in an `always_comb` with a `case` arm per state, and the outputs from the state alone.",
  retryAsTextLead:
    "The figure shows the state diagram beside the controller as the course's text.\n\nThe register is one `always_ff` block: `if (RST) state <= 2'b00; else state <= next;`. At a reset it takes `00`; otherwise at each edge it takes next.\n\nThe next-state logic is one `always_comb` block. `always_comb` describes gates: its lines work out again whenever an input changes, not at an edge, and a value is given with `=`, not `<=`. Inside it, `case (state)` picks the arm whose label equals the state. Each arm is one state's rows in the table's order, as `if` and `else if`. `default` takes every other value, here `11`, GIVE_UP. `//` starts a comment, which the circuit ignores.\n\n`(state == 2'b01)` is 1 when the two sides are equal, as Module 3's comparator: SEND is 1 in TRY. `assign S = state;` gives the state's code to the output S.\n\nThe text and the table say the same thing, row for row. You can press the inputs and clock here too.",
  retryFaultsLead:
    'The figure is the controller with a fault to choose, drawn opened at its next-state logic, where each fault acts. Before the checks run, nothing has reset the circuit, so the drawing shows X on its wires. Press "Run checks" to run six checks and compare each with a healthy controller. The checks are: "reset", "GO 1", "FAIL 1", "waiting" (FAIL back to 0), "TICK 1", and "no answer by the next TICK" (TICK still 1). The healthy controller goes IDLE, TRY, WAIT, WAIT, TRY, GIVE_UP. Find each row in the table and say which move breaks before you run the checks.\n\nThe faults are: the first is row 4\'s gate output fixed at 0; the second is row 8\'s gate output fixed at 0; the third is row 5\'s AND gate made an OR gate.',
  retryFaultsOutcomes:
    '- First fault (row 4 fixed at 0): In TRY with FAIL 1, no row gives a 1, so the next state is `00`, IDLE. A failed message is taken for an answered one, and the manager is never told. 4 of 6 checks fail: "FAIL 1", "waiting", "TICK 1" and "no answer by the next TICK".\n- Second fault (row 8 fixed at 0): In WAIT with TICK 0 the next state is `00`, IDLE. The controller forgets the message it was to send again. 3 of 6 fail: "waiting", "TICK 1" and "no answer by the next TICK".\n- Third fault (row 5\'s AND made an OR): Row 5 is 1 whenever any of its inputs is, so right after the reset, in IDLE with OK 0, the next state is `11`. The controller jumps to GIVE_UP and sounds the siren before any message. 4 of 6 fail: "GO 1", "FAIL 1", "waiting" and "TICK 1".',
  retryMachineAfter:
    "The row marked in the table comes from the table's rules. The next state in the status line comes from the circuit's own wire, next, which reaches the register's D. They agree in every state for every input: the next-state logic is the table built in gates. The arrow marked in the diagram is the move of the row marked in the table, which the next edge will take.",
  retryMachineLead:
    'The figure shows the whole state machine running in four views from one simulator. It starts after a reset, in IDLE. The drawing at the top, with a box per state showing its name and code and an arrow per move labelled with the inputs that make it, is a **state diagram**. Under it is the encoded table: one row per move, the state\'s code, the inputs the row reads (or "–" where it reads none), and the next state\'s code. In each state exactly one row applies.\n\nThen comes the circuit, built in three blocks: next-state logic, the register, and output logic. Each block opens, down to the flip-flops\' latches. Last is a timing diagram of the run so far.\n\nPress the input buttons ("GO = 0" and so on) to set the inputs, and press "Clock CLK" for an edge. The status line says the state now, the row that applies, and the state the next edge will give. The diagram marks the current state and the arrow the next edge takes; the table marks the row. Try each kind of move: stay (a row back to the same state), advance (IDLE to TRY, TRY to WAIT or GIVE_UP), and return (TRY to IDLE when OK, WAIT to TRY when TICK). At an edge where RST is 1, the register becomes `00`, IDLE, whatever the row says.',
  writeLateOkLead:
    "The lab changes the controller. An OK that arrives while the controller waits means the manager has read the message after all.",
} as const;
