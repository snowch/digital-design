// Copyright © 2026 Christopher Snow

// The words of the lesson on selectors.
//
// Drafted by the course's prose process from briefs of checked facts (see CLAUDE.md and
// docs/notes/module-3-combinational.md) and checked against the simulator, then placed here by the
// lesson's structure in selectors.ts. Edit a fact here only after checking it; the lesson's facts
// test (selectors.facts.test.ts) holds the numbers.

export const PROSE = {
  question:
    "The shop from Module 1 now has two freezer rooms. Room A is the first, at -18.4 degrees: its sensor sends the word -184. Room B is the second, at -25.0 degrees: its sensor sends -250. Each room's sensor sends its 16-bit word on its own cable to the office. In the office, each room's cable arrives at a receiver of its own. Each receiver reads the 16 steps from its cable, as in Module 1, and puts the room's word on 16 wires, one wire per bit.\n\nThe office has one display. It takes one 16-bit word on 16 input wires, one wire per bit. Beside the display is a switch, S. While S is 0, the display must show room A. While S is 1, it must show room B. How can a circuit pass one room's word to the display and keep the other room's word out?",
  motivation:
    "Wiring both receivers' 16 wires to the display's 16 wires does not work. Each display wire would then have two senders. A wire can have only one sender: a gate's output, or an input of the circuit. When room A sends 0 and room B sends 1 on the same wire, nothing decides which one the display should get.\n\nSo a circuit must decide, for each of the 16 bits, which room's bit reaches the display. S makes the choice. Start with one bit of the 16. Call room A's bit A, room B's bit B, and the display's wire for that bit Y. The same circuit, repeated, will serve the other 15 bits.",
  prediction:
    "The first prediction asks what an OR gate gives when it joins room A's bit and room B's bit. The second asks what an AND gate gives when S controls room A's bit. Each figure draws its circuit above a question. You choose an answer, then press \"Check my prediction\". The first figure then writes the simulator's values on its circuit and lists them in a table under the result line; the second figure, which runs two settings, gives a table with a row for each setting.",
  p1Question:
    "One OR gate, named orY, joins room A's bit A and room B's bit B. Its output, Y, goes to the display. Room A sends 0, room B sends 1, and the display should show room A's bit. What is Y?",
  p1Explain:
    "Y is 1, room B's bit. An OR gate gives 1 when any input is 1, so a 1 from either room reaches the display. Joining the two rooms' bits mixes them, and the circuit must stop the room that is not chosen.",
  p2Question:
    "The figure has one AND gate, named andA, with inputs A and S, and output Y. S is 0. A starts at 0, then changes to 1. What is Y at the end?",
  p2Explain:
    "Y stays 0. An AND gate gives 1 only when every input is 1, so while S is 0, the gate **blocks** A. While S is 1, the gate **passes** A and Y follows A. With one input as a control, an AND gate passes its other input when the control is 1. It blocks that input (gives 0) when the control is 0.",
  selectorBlockLead:
    "The figure shows a single block with three inputs (A, B and S) and one output (Y). The block is closed; you cannot open it to see the parts inside. Press any input to change it between 0 and 1. Find the rule that decides Y. Try S at 0 and change A, then B to see what Y does. Then try S at 1 and change A, then B the same way.",
  selectorBlockAfter:
    'While S is 0, Y copies A, whatever B is. While S is 1, Y copies B, whatever A is. S chooses which input reaches the output. An input that chooses like this is a **select input**. A circuit that passes one of several inputs to its output, chosen by select inputs, is a **multiplexer**. This circuit chooses between two inputs. The course draws it as a block labelled "2-way selector".',
  construction:
    "The two predictions give you two facts to use: an OR gate lets a 1 from either input through, and an AND gate with a control input passes or blocks its other input. A failed test names the test and the part that drives the wrong output.",
  buildSelector2Lead: "Draw the 2-way selector for one bit, with AND, OR and NOT gates.",
  c1Task:
    "Draw a circuit with inputs A, B and S and output Y. While S is 0, Y is A. While S is 1, Y is B. There are 8 tests, one for each pattern of S, A and B.",
  selectorFaultsLead:
    'The figure shows a 2-way selector built from gates. It has these parts:\n\n- notS: NOT of S; its output wire is NS\n- andA: A AND NS; its output wire is PA\n- andB: S AND B; its output wire is PB\n- orY: PA OR PB; its output is Y\n\nThe wires are not labelled in the drawing. To see a wire\'s name and value, press it.\n\n"Run checks" runs 5 checks. Each sets S, A and B to one pattern and compares Y with the healthy selector\'s Y. The 5 checks are:\n\n- "S 0, A 1, B 0"\n- "S 0, A 0, B 1"\n- "S 1, A 1, B 0"\n- "S 1, A 0, B 1"\n- "S 0, A 1, B 1"\n\nChoose each fault in turn. Before you run the checks, say which checks you expect to fail.',
  selectorFaultsAfterFault1:
    '"NOT gate notS becomes a wire": 3 of 5 checks fail: "S 0, A 1, B 0", "S 1, A 1, B 0" and "S 0, A 1, B 1". andA takes S instead of NS. Both AND gates pass while S is 1 and block while S is 0. Y is 0 when S is 0 and A OR B when S is 1.',
  selectorFaultsAfterFault2:
    '"Input S is stuck at 1": 2 of 5 checks fail: "S 0, A 1, B 0" and "S 0, A 0, B 1". Y is always B. The check "S 0, A 1, B 1" still gives the right Y, because A and B are the same.',
  selectorFaultsAfterFault3:
    '"OR gate orY becomes XOR": No check fails. An XOR gate gives 1 when exactly one input is 1. PA and PB are never both 1: andA takes NS and andB takes S, so they never pass together. It is true for every one of the 8 patterns of S, A and B, not only the 5 checks. So OR and XOR give the same Y for every input, and no check could catch this fault.',
  explanation:
    "When S is 0, andA passes A while andB gives 0. When S is 1, andB passes B while andA gives 0. The OR of a bit and 0 is that bit. So Y is the passed input.",
  wordSelectorLead:
    'The figure chooses between two 4-bit words, A and B. They start as the last four bits of each room\'s word: `1000` for room A (whose word is `FF48`) and `0110` for room B (`FF06`). A block labelled "split" takes a 4-bit word and gives its four bits, b3 at the top to b0. The port W on split and on join is the whole word; b3 to b0 are its bits. Each bit goes to its own 2-way selector: sel3, sel2, sel1 and sel0. All four share the select input S. A block labelled "join" puts the four selectors\' outputs back together as the 4-bit word Y. A wide line in the drawing carries a whole word. Change A and B in the rows under the drawing, and press S. Press a selector block to open it.',
  wordSelectorAfter:
    "With S at 0, Y is `1000`, room A's bits. With S at 1, Y is `0110`, room B's. A group of wires that bring one word together is a **bus**. The display's bus is 16 bits wide, so it needs one 2-way selector for each of its 16 bits, all sharing S. Opening a 2-way selector block shows the same gates as the fault lab's circuit: notS, andA, andB and orY.",
  generalisation:
    "The shop opens two more freezer rooms, C and D. Now there are four rooms to choose from. A single select input could only choose between two. With two select inputs, S1 and S0, you get four patterns: 00, 01, 10 and 11. Each pattern selects one room.",
  fourWayBlockLead:
    'The figure is a closed block labelled "4-way selector". It has inputs A, B, C, D, S1 and S0 and output Y. Set S1 and S0 to each of their four patterns in turn. For each pattern, press A, B, C and D one at a time and find which one Y follows.',
  fourWayBlockAfter:
    "Read S1 S0 as a 2-bit unsigned number. 00 is 0 and chooses A. 01 is 1 and chooses B. 10 is 2 and chooses C. 11 is 3 and chooses D. Y follows the chosen input and ignores the other three. This is a multiplexer that chooses among A, B, C and D, with two select inputs. You will build it from 2-way selectors.",
  buildSelector4Lead:
    "Build the 4-way selector from three 2-way selector blocks. Each is the circuit you built in the construction, closed, with ports A, B and S from top to bottom.",
  c2Task:
    "Draw a circuit with inputs A, B, C, D, S1 and S0 and output Y, using only 2-way selector blocks. You need three. Y must be A when S1 S0 is 00, B when 01, C when 10, and D when 11. There are 8 tests. For each pattern of S1 and S0, one test has only the chosen input at 1, and Y must be 1. The other test has every input at 1 except the chosen one, and Y must be 0.",
  reflection:
    "An AND gate with a control input passes or blocks a bit. Two of them, one controlled by S and the other by NOT S, pass exactly one input. An OR gate joins them. This is a 2-way selector, a multiplexer. Many 2-way selectors, one per bit and all sharing S, together choose a whole word on a bus.\n\nThree 2-way selectors make a 4-way selector: a block made of blocks, each opening to show the gates inside. The display can now show any of the four rooms. The staff want a lamp beside the display for each room, lit while that room is on show. What circuit lights the right lamp from S1 and S0?",
  modelVsReality:
    "In the drawing editor, each input port takes one wire; a new wire into a port replaces the old one. So every wire has exactly one sender. In hardware, nothing stops two outputs being wired together. If they send different bits, they fight: current flows from the one sending 1 to the one sending 0. The wire sits at a voltage in between, which a gate may read either way.\n\nWhen S changes from 1 to 0 with A and B both 1, andB's output falls to 0 after one step. andA's output rises to 1 only after two steps, because A's side waits for notS first: S goes through one more gate on A's side than on B's. For that one step neither AND gate passes, and Y drops to 0 before it settles back at 1. The stepped model shows this dip: Y goes 1, 1, 0, 1. In hardware, gate times vary from gate to gate, so the dip can be longer, shorter or absent. Real designs wait for Y to settle before using it.\n\nMany real chips choose between inputs with switches that connect one input to the output, not with AND and OR gates. The behaviour is the same; the simulator does not model those switches.",
  c1Hints: [
    "An AND gate with one input used as a control passes its other input while the control is 1 and blocks it while the control is 0.",
    "A common mistake is wiring S, unchanged, to the control input of every AND gate. Then they all pass together while S is 1, and all block together while S is 0. Another is joining A and B with an OR gate before any AND gate, which mixes the rooms.",
    "Take an AND gate with inputs B and S. When S is 1, the output is B. When S is 0, the output is 0.",
    "The AND gate for A needs the opposite of S. Put a NOT gate on S and wire its output, with A, into an AND gate.",
    "Place a NOT gate on S. One AND gate takes A and the NOT gate's output. A second AND gate takes S and B. An OR gate takes both AND gates' outputs and drives Y.",
  ],
  c2Hints: [
    "A 2-way selector chooses between two inputs with one select input. S1 and S0 can each drive selectors of their own.",
    "A common mistake is swapping the jobs of S1 and S0. With them swapped, the pattern 01 picks C instead of B, and 10 picks B instead of C. 00 and 11 still pick A and D.",
    "Look at a smaller case. While S1 is 0, the patterns 00 and 01 must choose A and B. That needs one 2-way selector with S0 as its select input.",
    "One 2-way selector chooses between A and B with S0. A second chooses between C and D with S0.",
    "Place three 2-way selector blocks. The first takes A and B with S0 as S. The second takes C and D with S0 as S. The third takes the first's Y as A and the second's Y as B, with S1 as S, and drives Y.",
  ],
} as const;
