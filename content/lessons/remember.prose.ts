// The words of the lesson "How does a circuit remember?"
//
// Drafted by the course's prose process from briefs of checked facts (see CLAUDE.md) and checked
// against the simulator, then placed here by the lesson's structure in remember.ts. Edit a fact
// here only after checking it; the lesson's facts test holds the numbers.

export const PROSE = {
  question:
    "Every gate you have used gives an output that depends only on its inputs now. Change an input and the output changes. Put it back and the output goes back. Nothing is kept. How can a circuit built only of such gates remember anything?\n\nYou have two buttons, A and B, and a light. The light must come on when A is pressed and stay on after A is released. It must go off when B is pressed and stay off after B is released. The light shows which button was pressed last.",
  motivation:
    "A light that follows a button is one gate: a wire. It goes dark the moment you let go.\n\nEverything from here needs a value kept from one moment to the next: a count, a position in a sequence of steps, the result of your last operation. The computer this course ends with is mostly circuits that remember. A circuit that remembers is where timing starts to matter.",
  prediction:
    "The key idea: connect an output back to an input. The figures below do this with inverters in a loop and an OR gate on the way round. The OR gate's kick input forces the loop while kick is 1.\n\nPredict what q will be when kick returns to 0, then run the figure.",
  investigationLoopTwo:
    "Two inverters form a loop. An output fed back to an input like this is called feedback. Before any kick, q is X: the simulator has nothing to go on. When you kick, q becomes 1. Release the kick and q stays 1. The loop holds the value because each inverter's output is the other's input and they agree.",
  investigationLoopThree:
    "Three inverters form a loop. When you kick and release, q is X. Three inverters cannot agree: the third contradicts the first. The values never stop changing, so the simulator shows X. An even number of inverters holds a value; an odd number does not.",
  investigationTwoButtons:
    "Two NOR gates each take one button and the other gate's output: the same feedback. Press A and LIGHT becomes 1. Release it and it stays. Press B and it becomes 0. Release it and it stays. Watch which gate's output changes first when you press a button. The simulator settles in 2 steps.",
  construction:
    "Add parts from the buttons and wire them by pressing one port and then another. The tests tell you which input sequence fails and at which gate the value first went wrong.",
  buildTwoButtonsLead: "Build the light that remembers the last button, from NOR gates.",
  buildDLatchLead:
    "The two-button circuit is called a latch. Its inputs are named S (set, which makes the output 1) and R (reset, which makes it 0), and the light is Q. From here the lesson uses those names.\n\nBuild a circuit with inputs D and EN and output Q. While EN is 1, Q copies D. While EN is 0, Q holds. Two AND gates and an inverter in front of the latch create the relationship S = D AND EN and R = (NOT D) AND EN. This ensures S and R are never both 1. While EN is 1, the circuit is transparent. A change on D passes straight through to Q. This circuit is called a D latch.",
  faultLabLead:
    "Cut the feedback wire. The LIGHT gate now reads X, because the other gate's output is no longer connected. So LIGHT is X unless B is pressed.\n\nReplace the LIGHT gate with OR. The light now goes the wrong way: off while A is held, on while B is held. Release both and the circuit never settles, so LIGHT is X.\n\nHold A down. The light stays 1 until B is pressed as well. Press B as well and both outputs go to 0. This is the input to avoid. Release both at once and the simulator cannot decide: LIGHT is X. In a real circuit one gate wins by being a little faster, and nothing says which.",
  dLatchExplorerLead:
    "Hold EN at 1 in the D latch and change D. Q follows every change while EN is 1. That is the problem: you wanted Q to take D at one instant, not for the whole stretch of time EN is 1. Two D latches in series with an inverter will fix it. The moment a signal rises from 0 to 1 is its rising edge.",
  setupHoldLead:
    "In the delay model every gate takes 10 time units to answer. This is called its propagation delay. Move D's change with the slider. If D settled 35 or more units before the edge, Q changes cleanly 30 units after the edge. If D changed at or after 10 units before the edge, the edge misses it and Q keeps its old value. If D changed between 35 and 10 units before the edge, the model's answer is late and untidy and not to be trusted. The time D must be stable before the edge is the setup time. After the edge, it is the hold time. Inside this window a real flip-flop's output can hover between 0 and 1 before settling to either side, and nothing predicts which or how long. This is called metastable. The simulator never produces this by itself. The roll button runs a separate overlay that rolls the outcome from a recorded seed, so you can replay a roll and get the same picture. This is the one random thing in the course. Its window and its settling delays are teaching choices derived from the gate delays, not measurements.",
  explanation:
    "Each NOR gate's output is the other's input. With both buttons released, each gate's output is consistent with the other's, so nothing changes. When you press a button, one gate is forced. The other follows. Both agree on the new value. Two things happen: the forced gate's output falls, then the other gate's output rises.",
  tableSrLead:
    "S=1 and R=0 set Q to 1. S=0 and R=1 reset Q to 0. S=0 and R=0 hold the value. S=1 and R=1 force both outputs to 0. This is the input to avoid.",
  tableDLead:
    "The D latch removes that forbidden input. S = D AND EN and R = (NOT D) AND EN cannot both be 1.",
  internalsLead:
    "The flip-flop is two D latches in series. The first is the master, with EN = NOT CLK. The second is the slave, with EN = CLK, and the slave's Q is the output. While CLK is 0, the master follows D and the slave holds the old Q. At the rising edge, the master closes on what D was and the slave opens on what the master held. While CLK is 1, the master is closed, so D can change and Q does not. Q changes only at a rising edge. This is a D flip-flop. Step through the figure and watch the master's Q and the output Q change at different moments.",
  internalsAfter:
    "The master's gates need time to settle on D before the edge closes it. The slave must not see a change racing through as the master closes. The numbers in the previous section (35 and 10) are what those gate delays add up to in this model.",
  asTextLead:
    "The whole flip-flop is one line of text: `always_ff @(posedge CLK) Q <= D;` Eleven gates, one line. The generator in the figure below produces this line from the course's flip-flop; your own drawing can be shown the same way in the challenge that follows.",
  asTextAfter:
    "The pattern generalises. Anything that must hold a value needs feedback behind an edge. When you build many flip-flops sharing one clock, they hold a word of bits at once. A circuit whose next value depends on its present value and its inputs is the next lesson's subject.\n\nFrom here the course mostly uses the clocked view. Inputs change between edges, and every flip-flop takes its D at the same edge. Setup and hold time are what that view costs. The delay model shows when they bite.",
  buildDffLead:
    "Draw the flip-flop (inputs D and CLK, output Q) from two D latch blocks and an inverter. The tests clock the circuit and check that Q takes D only at the rising edge and holds otherwise.",
  writeDLatchLead:
    "Write the D latch as text (inputs D and EN, output Q) using only `assign` statements and the bitwise operators. Each `assign` is a gate, and the text's circuit is drawn under the text as you type.",
  reflection:
    "A gate forgets. A loop of gates remembers. The price of remembering is timing, which the course had not had to think about until now.\n\nWhat would it take to hold eight bits instead of one? What happens if the thing that changes D is itself a flip-flop clocked by the same edge?",
  modelVsReality:
    "The simulator's gates have no real delay: each gate is one step, or each gate is the 10 units this lesson chose. Real gates have delays that vary with temperature, voltage and manufacture.\n\nThe simulator decides every race by the order it visits gates. Hardware decides by physics.\n\nThe metastability overlay is a drawn illustration, not a model of the physics.\n\nA real latch given the input to avoid and then released can leave both outputs at a voltage between 0 and 1 for a time. The simulator writes X.",
  c1Task:
    "Draw a circuit with inputs A and B and output LIGHT. When you press A, LIGHT becomes 1. LIGHT stays 1 after you release A. When you press B, LIGHT becomes 0. LIGHT stays 0 after you release B. The pattern repeats if you press A again.",
  c1Hints: [
    "An output must be fed back to an input, as in the inverter loop. A circuit with no path from an output back to an input cannot hold anything.",
    "One path that does not work: wire each button to its own gate, with no gate reading the other gate's output. That is a wire with extra gates, and it follows the buttons instead of holding.",
    "You know the two-inverter loop with an OR gate for the kick. It holds a 1 after the kick is released. You need the same loop, but with a second way in, so that B can force it the other way.",
    "Build two NOR gates. Each takes one button and the other gate's output. LIGHT is the output of the gate that takes B.",
    "NOR gate 1 takes B and the output of NOR gate 2 and drives LIGHT. NOR gate 2 takes A and the output of NOR gate 1.",
  ],
  c2Task:
    "Draw a circuit with inputs D and EN and output Q. When EN is 1, Q copies D. When EN is 0, Q holds what it had. The tests check this behaviour through several changes of D and EN.",
  c2Hints: [
    "The latch already holds. The new parts decide when S and R may reach it.",
    "One path that does not work: wire D to S and NOT D to R with no EN, so Q always follows D. Or wire EN to one side only.",
    "A single AND gate with EN as one input passes its other input only while EN is 1 and gives 0 otherwise. Two of them, one for each side of the latch, give 0 to both sides while EN is 0, which the latch reads as hold.",
    "S = D AND EN; R = (NOT D) AND EN.",
    "Place an inverter on D. One AND gate takes D and EN and drives S. Another takes the inverter's output and EN and drives R. Q is the latch's Q.",
  ],
  c3Task:
    "Draw a circuit with inputs D and CLK and output Q. Q copies D only when CLK rises. While CLK is held low or high, Q stays the same. The tests check this by changing D and CLK and watching when Q changes.",
  c3Hints: [
    "One latch is transparent for as long as its EN is 1. Two in series, open at different times, pass a value through in two stages, so the output moves only at the hand-over.",
    "One path that does not work: giving both latches the same EN, which is one transparent latch. Or forgetting the inverter, so the first latch opens when the second does.",
    "One D latch with EN = NOT CLK follows D while CLK is 0 and freezes when CLK rises. What it froze is what the second latch should show.",
    "The first latch has D as its D and NOT CLK as its EN. The second latch has CLK as its EN.",
    "Place an inverter on CLK. D latch 1 takes D and the inverter's output. D latch 2 takes latch 1's Q as its D and CLK as its EN. Q is latch 2's Q.",
  ],
  c4Task:
    "Write the D latch in text. The module and its ports are provided. Declare wires with `logic` and connect them with `assign` statements. Each `assign` is one gate. You may use the operators `~` (NOT), `&` (AND) and `|` (OR).",
  c4Hints: [
    "An `assign` names a wire and says which gate drives it. The circuit is the set of assigns, in any order.",
    "One mistake is to use a wire before declaring it with `logic`, or to assign Q twice.",
    "`logic ND; assign ND = ~D;` is an inverter on D with its output called ND.",
    "Declare S, R and ND. Two assigns: `assign S = D & EN;` and `assign R = ND & EN;`.",
    "Declare ND, S, R and QB. `assign ND = ~D; assign S = D & EN; assign R = ND & EN; assign Q = ~(R | QB); assign QB = ~(S | Q);`.",
  ],
  p1Question:
    "Here is a loop of two inverters with an OR gate on one input. The figure sets kick to 1 and then back to 0. What is q when kick returns to 0?",
  p1Explain:
    "While kick was 1, the OR gate forced a 1 around the loop. Once kick returns to 0, the OR gate passes q itself. Each inverter's output is the other's input, so the two agree and nothing changes.",
  p2Question:
    "Here is a loop of three inverters with an OR gate on one input. The figure sets kick to 1 and then back to 0. What is q when kick returns to 0?",
  p2Explain:
    "Three inverters cannot agree with each other. Going around the loop, the value comes back inverted, so every gate keeps changing. The simulator shows a value that never settles as X.",
  phases: [
    "CLK is 0 from time 0. The master follows D, which is 0. The slave is closed. The output Q is unknown because no rising edge has happened yet.",
    "CLK rose at time 100. The slave opened and Q became 0 at time 130, three gate delays later. D is still 0.",
    "CLK is 0 again. D rose at time 300 and the master followed it within a few gate delays. Q did not move, because the slave is closed.",
    "CLK rose at time 400. The master closed on D = 1 and the slave opened. Q became 1 at time 430.",
    "D fell at time 550 while CLK was 1. The master was closed, so nothing reached the slave and Q stayed 1. At the edge at time 700, the master, open again since time 500 and following D = 0, handed 0 to the slave and Q became 0 at time 730.",
  ],
  twoButtonsDescribe:
    "It remembers which of two buttons was pressed last; A lights it, B puts it out.",
} as const;
