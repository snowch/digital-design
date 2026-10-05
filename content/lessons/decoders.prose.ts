// The words of the lesson on decoders.
//
// Drafted by the course's prose process from briefs of checked facts (see CLAUDE.md and
// docs/notes/module-3-combinational.md) and checked against the simulator, then placed here by the
// lesson's structure in decoders.ts. Edit a fact here only after checking it; the lesson's facts
// test (decoders.facts.test.ts) holds the numbers.

export const PROSE = {
  question:
    "Lesson 1 asked: what circuit lights the right lamp when the display shows a room, chosen by bits S1 and S0? Staff want one lamp per room: Y0 for room A, Y1 for room B, Y2 for room C, and Y3 for room D. When a room is on show, its lamp lights and the other three stay off.\n\nS1 and S0 have four patterns. When S1 S0 is 00, Y0 lights. When it is 01, Y1 lights. When it is 10, Y2 lights. When it is 11, Y3 lights. How can a circuit turn two bits, S1 and S0, into one lit lamp out of four?",
  motivation:
    'Each lamp answers its own yes-or-no question about S1 and S0: "Is S1 S0 my room\'s number?" Y2 asks "Is S1 S0 equal to 10?" S1 and S0 have four patterns, and each pattern lights exactly one lamp.\n\nFrom Module 2, you know an AND gate gives 1 only when every input is 1. A NOT gate turns a 0 into a 1. So an AND gate with NOT gates in front of inputs where the pattern has a 0 gives 1 for one pattern alone.',
  prediction:
    'The figure draws one lamp\'s circuit above its question. Choose your answer, then press "Check my prediction". The page shows what the simulator gave, with a timing diagram showing how S1, S0, and L change. Press "Predict again" to clear the result and try another answer.',
  p1Question:
    "The figure is one lamp's circuit: a NOT gate, notS0, turns S0 over; its output is the wire NS0. An AND gate, and2, takes S1 and NS0 and drives the lamp, L. S1 is 1 and S0 is 1. What is L?",
  p1Explain:
    "L is 0: the lamp is off. With S0 at 1, NS0 is 0, and an AND gate with a 0 input gives 0. L is 1 only when S1 is 1 and S0 is 0: the pattern 10, room C's number. This is lamp Y2's circuit. For S1 S0 = 11, a different AND gate with no NOT gates lights lamp Y3.",
  decoderBlockLead:
    "The figure shows a closed block. It has two inputs, S1 and S0, and four outputs, Y0, Y1, Y2 and Y3. These outputs are the four lamps beside the display. You cannot open this block to see its parts inside. Press S1 and S0 through all four patterns in order: 00, 01, 10, 11. For each pattern, watch which outputs become 1.",
  decoderBlockAfter:
    'For every pattern, exactly one output is 1: the one whose number S1 and S0 spell, read as unsigned. Pattern 01 lights Y1; pattern 11 lights Y3. A circuit with n inputs and 2 to the power n outputs that sets exactly one output to 1 is a **decoder**. The one that is 1 is the one whose number the inputs spell. This decoder has 2 inputs and 4 outputs. The drawing labels such a block "decoder".',
  construction:
    "You build the decoder from AND and NOT gates. Each output needs one AND gate that is 1 for one pattern of S1 and S0 alone. Where the pattern needs a 0, a NOT gate gives the opposite of that input. Press the part buttons to add parts. Press one port, then another, to wire them together.",
  buildDecoderLead: "Draw the decoder for the four lamps with AND and NOT gates.",
  c1Task:
    "Draw a circuit with inputs S1 and S0 and outputs Y0, Y1, Y2 and Y3. For each pattern of S1 and S0, exactly one output is 1. Y0 is 1 for 00; Y1 for 01; Y2 for 10; Y3 for 11. There are 4 tests, one for each pattern. Each test checks all four outputs.",
  decoderFaultsLead:
    'The figure shows the decoder built from gates. Its parts are:\n\n- notS1: NOT of S1; its output wire is NS1\n- notS0: NOT of S0; its output wire is NS0\n- and0: NS1 AND NS0; it drives Y0\n- and1: NS1 AND S0; it drives Y1\n- and2: S1 AND NS0; it drives Y2\n- and3: S1 AND S0; it drives Y3\n\nPress a wire to see its name and value below the drawing. "Run checks" makes 4 checks, one per pattern of S1 and S0: "S1 0, S0 0", "S1 0, S0 1", "S1 1, S0 0", "S1 1, S0 1". Each check compares all four outputs with a healthy decoder. Choose each fault in turn. Before you run the checks, predict which checks will fail and how many lamps each failing check will light.',
  decoderFaultsAfter:
    '- "NS0 stuck at 1": 2 of the 4 checks fail. With S0 at 1, and0 and and2 should be blocked by NS0, but NS0 is stuck at 1. At "S1 0, S0 1" (01), Y0 and Y1 both light. At "S1 1, S0 1" (11), Y2 and Y3 both light. Two lamps light where only one should.\n\n- "AND gate and3 changed to OR": 2 of the 4 checks fail. Y3 is now S1 OR S0, so it lights for 01, 10 and 11. At 01 and at 10, a second lamp lights beside the right one. At 00 and 11, the checks pass.\n\n- "NS1 wire cut": All 4 checks fail. and0 and and1 read X from the cut wire. In every check, Y0 or Y1 is X. The simulator cannot say whether that lamp is lit.\n\nIn each fault, one gate accepts an extra pattern or cannot decide. Each AND gate must be 1 for one pattern alone.',
  explanation:
    "Each decoder output answers one question: does S1 S0 equal my number? Y2 is 1 exactly when S1 S0 equals 10. So a decoder compares its inputs with each of the numbers 0 to 3 at once.\n\nThe office has one button that starts a defrost in a freezer room. Its signal must reach only the room on show. AND each decoder output with the button's signal. The chosen room's AND gate passes the signal, and the other three block it.",
  demuxBlockLead:
    "The figure is a block with inputs IN (the button's signal), S1 and S0, and outputs Y0 to Y3, one per room. Press IN, S1 and S0, and watch which output IN reaches. Press the block to open it. Inside are a decoder block and four AND gates, and0 to and3: each takes IN and one of the decoder's outputs.",
  demuxBlockAfter:
    "IN reaches the output whose number S1 S0 spells. The other three outputs are 0, whatever IN does. A circuit that sends one input to one of several outputs, chosen by select inputs, is a **demultiplexer**. It does the reverse of lesson 1's multiplexer, which brings one of several inputs to one output.",
  generalisation:
    "Now the other way round. Each room's door has a switch that gives 1 while the door is open. The four door lines are L0 (room A) to L3 (room D). When a door opens, the display should show that room. So a circuit must turn the one line that is 1 into its room's number, S1 S0, which then chooses the room as before.",
  predictDoorsLead:
    "A circuit that turns one line out of several into that line's number in binary is an **encoder**. It does the reverse of a decoder. The figure's encoder block gives the room number as a 2-bit word, S. Inside, one OR gate makes S1 from L2 and L3 (the rooms whose number has bit 1 set), and another makes S0 from L1 and L3. L0 is wired to nothing: room A's number is 00. The question below asks what happens when two doors are open at once.",
  p2Question:
    "The door of room B is open, so L1 is 1. Then the door of room C opens too, so L2 is 1 as well. What is the room number S?",
  p2Explain:
    "S is 11: room D, whose door is shut. L1 makes S0 1 and L2 makes S1 1, and the two numbers' bits mix. The encoder assumes exactly one line is 1. With no door open, S is 00, the same as room A's door alone.",
  comparatorBlockLead:
    "A decoder output compares S1 S0 with one fixed number. The same idea compares two words with each other. Room A has twin sensors side by side, sending two 4-bit words, A and B. If the words ever differ, one sensor is faulty, and a fault lamp must light. The figure is a closed block with word inputs A and B and output EQ. Both start at `1000`. Change their bits in the rows under the drawing.",
  comparatorBlockAfter:
    "EQ is 1 while A and B are equal, and 0 when any bit differs. The fault lamp is lit when EQ is 0. A circuit that compares two words is a **comparator**. This one is an equality comparator: it says only whether the words are equal. An XOR gate gives 1 when its two inputs differ. The challenge below builds the comparator from gates.",
  buildComparatorLead:
    "Build the equality comparator for two 4-bit words. Split blocks give you the words' bits.",
  c2Task:
    "Draw a circuit with word inputs A and B, 4 bits each, and output EQ. EQ is 1 when A and B are equal and 0 when they differ in any bit. You have split blocks (each takes a 4-bit word on W and gives its bits b3 to b0), and two-input XOR, OR, NOR, AND and NOT gates. There are 9 tests: four pairs of equal words, four pairs that differ in one bit only (each bit once), and `1010` against `0101`.",
  reflection:
    "A decoder turns a number into one line out of several; each of its outputs asks \"does the input equal my number?\" A demultiplexer is a decoder whose outputs pass or block one signal. An encoder goes the other way, from one line to its number, and gives a wrong number when two lines are 1. A comparator asks the decoder's question of two words.\n\nRoom B's sensor reads 0.6 degrees too warm. The display must add a correction to every word room B's sensor sends. How does a circuit add two words?",
  modelVsReality:
    "In the stepped model S1 and S0 change one press at a time. In hardware, when two select inputs change together, from 01 to 10, one may arrive first, so for a moment the pattern is 00 or 11 and a wrong lamp can flicker. Lamps hide it; a circuit that reads the outputs waits for them to settle.\n\nMany real encoders give one line priority: with two lines at 1 they give the higher line's number, and a further output says whether any line is 1 at all. This lesson's encoder has neither.\n\nComparing 16-bit words takes 16 XOR gates and a tree of gates to join their outputs. Each extra level of the tree adds to the circuit's depth, which Module 2 measured.",
  c1Hints: [
    "Each output is one AND gate that gives 1 for one pattern of S1 and S0 alone.",
    "A common mistake is wiring an output's AND gate to S1 and S0 where the pattern has a 0. An AND gate needs every input at 1, so a bit that must be 0 has to reach it through a NOT gate.",
    "Consider Y2 as an example: it is 1 for 10 only. Its AND gate takes S1 and NOT S0.",
    "To start: place two NOT gates, one on S1 and one on S0. Y0's AND gate takes both NOT gates' outputs.",
    "Two NOT gates go on S1 and on S0. Y0: AND of NOT S1 and NOT S0. Y1: AND of NOT S1 and S0. Y2: AND of S1 and NOT S0. Y3: AND of S1 and S0.",
  ],
  c2Hints: [
    "An XOR gate is 1 where two bits differ. A and B are equal when no bit pair differs.",
    "A common mistake: checking only some bits. Each of the four tests that differ in one bit only catches a comparator that ignores that bit.",
    "A smaller example: for 1-bit words, EQ is NOT (A XOR B). For 2-bit words, EQ is NOR of the two XOR outputs.",
    "Part of the answer: split A and B, and XOR each pair of bits: b3 with b3, down to b0 with b0. That gives four lines, each 1 where its bits differ.",
    "The whole answer: two split blocks and four XOR gates, one per bit. An OR gate takes the XOR outputs for bits 3 and 2; another takes those for bits 1 and 0. A NOR gate takes both OR outputs and drives EQ.",
  ],
} as const;
