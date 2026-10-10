// Copyright © 2026 Christopher Snow

// The words of the lesson "How does a circuit remember?"
//
// Drafted by the course's prose process from briefs of checked facts (see CLAUDE.md) and checked
// against the simulator, then placed here by the lesson's structure in remember.ts. The strings
// the first fix pass changed came from its briefs A1 to A5 and AL (docs/notes/fix-pass-1.md);
// the rest are the lesson's first drafts. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Every gate you have used gives an output that depends only on its inputs now. Change an input and the output changes. Put it back and the output goes back. Nothing is kept. How can a circuit built only of such gates remember anything?\n\nYou have two buttons, A and B, and a light. The light must come on when A is pressed and stay on after A is released. It must go off when B is pressed and stay off after B is released. The light shows which button was pressed last.",
  motivation:
    "A light wired straight to a button is not a circuit of gates at all, only a wire. It goes dark the moment you let go.\n\nEverything from here needs a value kept from one moment to the next: a count, where you are in a sequence of instructions, the result of the last operation. The computer this course ends with is mostly circuits that remember. A circuit that remembers is where timing starts to matter.",
  prediction:
    'Connect an output back to an input. The figures below do this with inverters in a loop and an OR gate on the way round, whose second input is called kick and forces the loop while it is 1.\n\nChoose an answer in each figure and press its "Check my prediction" button only after you have chosen.\n\nX is the simulator\'s mark for a wire that is not a known 0 or 1. Several causes lead to X: nothing has set the wire yet, or its value never stops changing.\n\nOnce you check, a **timing diagram** appears. It draws each signal as a line against time: high for 1, low for 0, and a hatched band for X. Above the lines, each step\'s name stands at the moment its inputs change: "kick", then "release". A red line marks a moment, after the run\'s last step. The table under the diagram gives each signal\'s value at the red line.',
  investigationLoopTwo:
    "The loop runs from inverter 1 (not1) to inverter 2 (not2), then through the OR gate back to inverter 1. Before any kick, q is X: nothing has set it yet.\n\nIn this Stepped model, a step is one round in which every gate looks at its inputs once and sets its output. After you press an input, the simulator steps until nothing changes. The status line says how many steps that took.\n\nPress kick to 1, then back to 0. Then drag the Step slider back and forth to watch the 1 go round the loop one gate per step.\n\nAfter kick returns to 0, the loop keeps q at 1.\n\nAn output fed back to an input like this is called feedback.",
  investigationLoopThree:
    "Press kick to 1 and back to 0. The status line then names q and the loop's other wires as never settled. The drawing and the table show them as X.\n\nA loop of an even number of inverters keeps a value. A loop of an odd number cannot.",
  investigationTwoButtons:
    'The block is the light from the lesson\'s question. Press A: LIGHT becomes 1 and stays 1 after you release A. Press B: LIGHT becomes 0 and stays 0 after you release B. After a press, the status line says "Settled in 2 steps."; after a release, nothing inside changes and it says "Settled in 0 steps."\n\nInside the block are gates with feedback, like the loops above, and you build it next.',
  construction:
    "Add parts with the part buttons above the drawing. Press one port and then another to wire them. The tests say which input sequence fails and at which gate the value first went wrong.",
  buildTwoButtonsLead: "Build the light that remembers the last button, from NOR gates.",
  buildDLatchLead:
    "The two-button circuit is a latch. Its inputs are named S (set, which makes the output 1) and R (reset, which makes it 0). The output, the light, is Q. Qb is the other gate's output: the inner wire that went back into the gate driving Q. The next challenge's part buttons offer the latch as one block. The block offers Qb as a second output. Qb is usually the opposite of Q; it is not when both S and R are 1. From here the lesson uses these names.\n\nThe next challenge asks you to build a circuit around the latch block. Your circuit has inputs D and EN, and output Q. While EN is 1, the circuit is transparent: a change on D passes straight through to Q. This circuit is called a D latch.",
  faultLabLead:
    'This figure shows the two-button circuit you built, drawn with its gates, and four ways to break it. "Run checks" presses A, releases A, presses B, and releases B in turn. After each step, it compares LIGHT with what the circuit with no fault gives, and lists where they differ.\n\nChoose each fault in turn. Press A and B, then run the checks. Before you look, say what you expect LIGHT to do. Then choose "No fault": press A, then press B as well, so both are pressed. Then press "Release all at once" to release both in the same moment.',
  dLatchExplorerLead:
    "Leave EN at 1. Change D: Q follows every change for as long as EN is 1.\n\nLeave EN at 0: Q keeps its value, whatever D does.\n\nThe table marks the row that applies now.",
  setupHoldLead:
    'This figure runs the gate-delays model (badge "Gate delays"). Every gate takes 10 time units to answer. That time is the gate\'s propagation delay.\n\nSetup time is how long before the edge D must be steady for the flip-flop to take it cleanly. Hold time is how long after the edge D must stay steady.\n\nMove the slider and read the status line under the diagram after each move. When D changes early enough, Q takes it cleanly. The change appears 30 time units after the edge, which is how long the flip-flop takes to answer. When D changes 25, 20 or 15 units before the edge, Q changes late: 35, 40 or 45 units after it. When D changes 10 units before the edge or later, the edge misses the change and Q keeps its old value. Find the latest moment that still gives a clean change: that is this model\'s setup time. A change at the edge or after never reaches Q, so this model\'s hold time is zero. Real flip-flops have a hold time above zero.\n\nBetween 25 and 15 units before the edge, the model\'s answer is late and not to be trusted. This range is the uncertain band; the diagram labels it "Uncertain". A real flip-flop\'s output in that case can hover between 0 and 1. It falls to either side, and nothing predicts which or how long. A flip-flop in that state is metastable.\n\nThe simulator never produces this by itself. While the slider is inside the uncertain band, a button "Roll result" appears. It draws one outcome, a roll. A roll marks Q undecided 20 units after the edge, the moment the flip-flop\'s second latch would first answer. Then Q hovers for a random time between 5 and 60 units and settles to a random 0 or 1. Each roll comes from a seed: a number that fixes the whole outcome. Every roll gets a new seed, and the "Rolls" list keeps every roll with a button to replay it exactly. The band and the hovering times are teaching choices, worked out from the gate delays. They are not measurements.',
  explanation:
    "Each NOR gate's output is the other's input. With both buttons released, each gate's output is consistent with the other's, so nothing changes. When you press a button, one gate is forced. The other follows. The forced gate's output falls, then the other gate's output rises.",
  tableSrLead:
    "The table shows the two-button circuit's behaviour in latch terms: how the inputs S and R control the output Q. A is S, B is R, and LIGHT is Q. The combination to avoid is S = 1 and R = 1 together: both outputs become 0, and once you release both buttons, the outcome cannot be predicted. The table writes ? and the simulator writes X.",
  tableDLead:
    "The D latch prevents the combination to avoid. S = D AND EN and R = (NOT D) AND EN can never both be 1, because D and NOT D are always opposite.",
  internalsLead:
    "The flip-flop is two D latches in series. The first is the master, with EN = NOT CLK. The second is the slave, with EN = CLK, and the slave's Q is the output. While CLK is 0, the master follows D and the slave keeps the old Q. At the rising edge, the master closes on what D was and the slave opens on what the master kept. While CLK is 1, the master is closed, so D can change and Q does not. The run changes D while CLK is 1; watch Q. Q changes only at a rising edge. Use the buttons Earlier change and Later change to step through every moment at which any signal changed. To open the master or the slave you press its block in the drawing.",
  internalsAfter:
    "The master's gates need time to settle on a new D before the edge closes it. In this model, that time is the setup time: 30 time units, which is three gate delays. In this run, Q showed its new value two to three gate delays after the edge, depending on whether Q rose or fell. The slave must not see a change racing through as the master closes. A change at the edge or after it never reaches Q, which is why this model's hold time is zero.",
  asTextLead:
    'The flip-flop with its Q output alone is one line of text: `always_ff @(posedge CLK) Q <= D;` Eleven gates, one line. `always_ff` starts a description of something that changes only at a clock edge: a flip-flop. `@(posedge CLK)` says which edge: the rising edge of CLK. `Q <= D` says what happens then: Q takes D. You are not asked to write this yet. The figure below generates the line from the D flip-flop you have been using. Your own drawings can be shown as text in the challenges that follow (each drawing challenge has an "As text" panel under it, closed until you open it).',
  asTextAfter:
    'Feedback is what keeps a value. An edge is what decides when it may change.\n\nFrom here the course mostly uses the clocked model (badge "Clocked"). In it, inputs change only while CLK is 0, and every flip-flop takes its D at the same rising edge. A press of "Clock CLK" raises CLK and lowers it again.\n\nThe clocked model can assume all flip-flops take D together at the rising edge, because every D is steady for the setup time before each edge and stays steady after it. When that fails, the gate-delays model is where to look.',
  buildDffLead:
    "Draw the flip-flop (inputs D and CLK, output Q) from two D latch blocks and an inverter. The tests clock the circuit and check that Q takes D only at the rising edge and keeps its value otherwise.",
  writeDLatchLead:
    "Write the D latch as text (inputs D and EN, output Q) with `assign` statements and the bitwise operators.\n\nOne example, which is not part of the answer: `logic Y;` declares a wire called Y, and `assign Y = ~(A | B);` makes a NOR gate that drives Y from A and B.\n\nEach `assign` is one gate. The text's circuit is drawn under the text as you type.",
  reflection:
    "A gate forgets. A loop of gates remembers. The price of remembering is timing, which the course had not had to think about until now.\n\nWhat would it take to store eight bits instead of one? What happens if the thing that changes D is itself a flip-flop clocked by the same edge?",
  modelVsReality:
    "The simulator's gates have no real delay: each gate is one step, or each gate is the 10 units this lesson chose. Real gates have delays that vary with temperature, voltage and manufacture.\n\nIn the stepped model, a race that the circuit cannot decide is not decided at all: the simulator shows X, as in the fault lab. In the gate-delays model, two changes that arrive at the same moment are taken in a fixed order, so the model always gives an answer. Hardware decides a race by physics, and a close race can leave a flip-flop metastable.\n\nThe roll in the setup-and-hold figure is an illustration, not a model of the physics.\n\nA real latch given the combination to avoid and then released can leave both outputs at a voltage between 0 and 1 for a time. The simulator writes X.",
  c1Task:
    "Draw a circuit with inputs A and B and output LIGHT. When you press A, LIGHT becomes 1. LIGHT stays 1 after you release A. When you press B, LIGHT becomes 0. LIGHT stays 0 after you release B. The pattern repeats if you press A again.",
  c1Hints: [
    "An output must be fed back to an input, as in the inverter loop. A circuit with no path from an output back to an input cannot hold anything.",
    "One path that does not work: wire each button to its own gate, with no gate reading the other gate's output. That is a wire with extra gates, and it follows the buttons instead of holding.",
    "You know the two-inverter loop with an OR gate for the kick. It keeps a 1 after the kick is released. You need the same loop, but with a second way in, so that B can force it the other way.",
    "One connection only: the output of the gate that takes B is LIGHT, and it also goes back into the other gate.",
    "NOR gate 1 takes B and the output of NOR gate 2 and drives LIGHT. NOR gate 2 takes A and the output of NOR gate 1.",
  ],
  c2Task:
    "Draw a circuit with inputs D and EN and output Q. When EN is 1, Q copies D. When EN is 0, Q keeps what it had. The tests check this behaviour through several changes of D and EN.",
  c2Hints: [
    "The latch already keeps a value. The new parts decide when S and R may reach it.",
    "With no part that reads EN, Q follows D all the time, so the tests that leave EN at 0 fail.",
    "One AND gate with EN as one input passes its other input while EN is 1 and gives 0 while EN is 0. A latch that sees 0 on both S and R keeps its value.",
    "S = D AND EN.",
    "Place an inverter on D. One AND gate takes D and EN and drives S. Another takes the inverter's output and EN and drives R. Q is the latch's Q.",
  ],
  c3Task:
    "Draw a circuit with inputs D and CLK and output Q. Q copies D only when CLK rises. While CLK stays low or high, Q stays the same. The tests check this by changing D and CLK and watching when Q changes.",
  c3Hints: [
    "One latch is transparent for as long as its EN is 1. Two in series, open at different times, pass a value through in two stages, so the output moves only at the hand-over.",
    'If both latches are open at the same time, a change of D runs straight through both, and the test "D changes while the clock is high" fails.',
    "One D latch whose EN is 1 while CLK is 0 follows D while CLK is 0 and stops following the moment CLK rises.",
    "The first latch's EN is NOT CLK.",
    "Place an inverter on CLK. D latch 1 takes D and the inverter's output. D latch 2 takes latch 1's Q as its D and CLK as its EN. Q is latch 2's Q.",
  ],
  c4Task:
    "Write the D latch in text. The module and its ports are provided. Declare wires with `logic` and connect them with `assign` statements. Each `assign` is one gate. You may use the operators `~` (NOT), `&` (AND) and `|` (OR).",
  c4Hints: [
    "An `assign` names a wire and says which gate drives it. The circuit is the set of assigns, in any order.",
    "One mistake is to use a wire before declaring it with `logic`, or to assign Q twice.",
    "One `assign` can hold more than one gate. `assign Y = A & ~B;` is a NOT gate on B and an AND gate, with Y the AND gate's output.",
    "Declare S, R and ND. Two assigns: `assign S = D & EN;` and `assign R = ND & EN;`.",
    "Declare ND, S, R and QB. `assign ND = ~D; assign S = D & EN; assign R = ND & EN; assign Q = ~(R | QB); assign QB = ~(S | Q);`.",
  ],
  p1Question:
    "Here is a loop of two inverters with an OR gate on one input. The figure sets kick to 1 and then back to 0. What is q when kick returns to 0?",
  p1Explain:
    "While kick was 1, the OR gate forced a 1 round the loop. Once kick returns to 0, the OR gate passes inverter 2's output unchanged to inverter 1, so the two inverters agree round the loop and nothing changes.",
  p2Question:
    "Here is a loop of three inverters with an OR gate on one input. The figure sets kick to 1 and then back to 0. What is q when kick returns to 0?",
  p2Explain:
    "Three inverters cannot agree with each other. Going round the loop, the value comes back inverted, so every gate keeps changing. The simulator shows a value that never settles as X.",
  phases: [
    "CLK is 0 and D is 0. The master is open and follows D; the slave is closed. Q is X because no rising edge has happened yet.",
    "CLK rose at time 100. The master closed and the slave opened. Q became 0 at time 120, two gate delays after the edge.",
    "CLK fell at time 200. The slave closed, so Q stays 0. The master opened again at time 210 and follows D, which is still 0.",
    "D rose at time 300. The master is open, so it followed: the master's Q became 1 at time 330. Q did not move because the slave is closed.",
    "CLK rose at time 400. The master closed on D = 1 and the slave opened. Q became 1 at time 430, three gate delays after the edge.",
    "D fell at time 450 and rose again at time 470 while CLK was 1. The master was closed, so the master's Q stayed 1 and Q stayed 1.",
    "CLK fell at time 500. The slave closed, so Q stays 1. The master opened again at time 510 and follows D, which is 1.",
    "D fell at time 550 while CLK was 0. The master is open, so its Q followed and became 0 at time 580. Q stayed 1 because the slave is closed.",
    "CLK rose at time 700. The master closed on D = 0 and the slave opened. Q became 0 at time 720, two gate delays after the edge.",
    "CLK fell at time 800. The slave closed, so Q stays 0. The master opened again and follows D.",
  ],
  twoButtonsDescribe:
    "It remembers which of two buttons was pressed last; A lights it, B puts it out.",
  faultLabAfterFault1:
    '"Feedback wire cut": the gate that drives LIGHT reads X where the other gate\'s output was (marked CUT). LIGHT is X unless B is pressed.',
  faultLabAfterFault2:
    '"LIGHT gate changed to OR": the light goes the wrong way: off while A is pressed, on while B is pressed. Release both and the values never stop changing, so LIGHT is X.',
  faultLabAfterFault3:
    '"Button A stuck at 1": the light stays 1 until B is pressed. The checks fail at "release B" because the light comes back on instead of staying off.',
  faultLabAfterNoFault:
    '"No fault", with A and B both pressed: both gates\' outputs are 0. A and B pressed together is the combination to avoid. Released in the same moment, both gates try to switch at once. The simulator cannot decide which gate wins, so LIGHT is X. In a real circuit one gate wins by being a little faster, and nothing says which.',
  raceLead:
    "Many latches take their D from other latches. Here the first latch's Q feeds the second latch's D, and both share one EN. Press EN to 1, then press D and drag the Step slider back to watch the change.",
  raceAfter:
    "With EN at 1, a change of D ran through the first latch and through the second in one press. Both latches were transparent at once.\n\nWhat you want instead is for each latch to take its D once, at one moment, and then keep it.\n\nA signal that rises and falls at a steady rate, used to time a circuit, is called a clock, written CLK. The moment CLK rises from 0 to 1 is its rising edge; the lesson calls it the edge.\n\nThe fix is two D latches in a row with an inverter on the clock, so that the two are never open at the same time. This is a D flip-flop.\n\nThe next figure uses the D flip-flop. The explanation section opens it to show the two latches.",
} as const;
