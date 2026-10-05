// The words of the lesson fewer-gates.
//
// Drafted by the course's prose process from briefs of checked facts (see CLAUDE.md and
// docs/notes/module-2-boolean-logic.md) and checked against the model, then placed here by the
// lesson's structure in fewer-gates.ts. Edit a fact here only after checking it; the lesson's facts
// test (fewer-gates.facts.test.ts) holds the numbers.

export const PROSE = {
  question:
    "The shop's office display has one more lamp now: CALL tells the manager to call the engineer. The lamp lights when the freezer is warm with its door shut (a failing freezer). It also lights when the door is open while the shop is closed (a door left open, or someone inside).\n\nThe manager wrote down the four rows where CALL is 1. The last lesson showed how: one AND gate for each row, then one OR of them all. That is 4 AND gates, 3 NOT gates and 1 OR: 8 gates. The board has room left for 4 more gates.\n\nThe last lesson asked whether CLASH could be built from fewer NAND gates, and what else, besides the truth table, makes one circuit better than another. How can the same truth table be built from fewer gates?",
  motivation:
    "Fewer gates mean fewer chips to buy, fit and replace. Room on the board matters: the next lamp will need its own gates.\n\nGates in a row matter too. Each gate takes time to answer. A change at an input reaches the lamp later the more gates it passes through. This lesson measures both: the total number of gates and how many in a row.",
  prediction:
    'The figure draws the manager\'s eight-gate circuit. It shows you one row of inputs. Predict what CALL will be, then press "Check my prediction".',
  p1Question: "The freezer is cold, its door is open and the shop is closed. What is CALL?",
  p1Explain:
    "The gate and4 (for this row) gives 1, so CALL is 1. If WARM were 1, the gate and3 would give 1, so CALL would still be 1. With the door open and the shop closed, CALL is 1 no matter what WARM is. Two AND gates do the work of one AND gate of DOOR and CLOSED.",
  callPairsLead:
    'Two rows that differ in only one input form a pair. If both rows of a pair give the same output, that input makes no difference there. One AND gate can do the work of two. The figure sets the manager\'s table in pairs. Under "Which input?", choose WARM, DOOR or CLOSED. Each line shows one pair. The other two inputs stay fixed. Your input moves from 0 to 1. You see whether it changes CALL. Pairs where it does not are shaded. It starts on WARM. Try all three inputs. Look for shaded pairs where CALL is 1 in both rows.',
  callPairsAfter:
    "A shaded pair where CALL is 0 in both rows needs no gate. Only rows with output 1 get an AND gate. Two shaded pairs have CALL 1 in both rows. When WARM is chosen, those are DOOR 1 and CLOSED 1. One AND gate of DOOR and CLOSED covers both rows. When CLOSED is chosen, those are WARM 1 and DOOR 0. One AND gate of WARM and NOT DOOR covers both rows. Those two AND gates cover all 4 rows where CALL is 1. The second is ALARM's rule from lesson 1 of this module.",
  construction:
    'Build CALL from the two AND gates the pairs found. The part buttons are "Add AND", "Add OR" and "Add NOT". Use at most 4 gates. Besides the 8 rows, one more test checks "At most 4 gates". If it fails, it tells you how many you have and marks them in the drawing.',
  buildCallLead: "Build CALL with at most 4 gates.",
  c1Task:
    'Build a circuit for the CALL lamp: inputs WARM, DOOR, CLOSED; output CALL.\n\nCALL is 1 in 4 rows:\n- WARM 1, DOOR 0, CLOSED 0\n- WARM 1, DOOR 0, CLOSED 1\n- WARM 1, DOOR 1, CLOSED 1\n- WARM 0, DOOR 1, CLOSED 1\n\nCALL is 0 in the other 4 rows.\n\nUse at most 4 gates.\n\n9 tests: the 8 rows and "At most 4 gates".',
  c1Hints: [
    "Each pair where CALL is 1 in both rows can be one AND gate of the other two inputs. Find pairs that cover all 4 rows where CALL is 1.",
    "Dropping an input that matters. WARM makes no difference when DOOR and CLOSED are both 1, but it does when DOOR is 0. Check every row after each change.",
    "Consider WARM 1, DOOR 0, CLOSED 0 and WARM 1, DOOR 0, CLOSED 1. They differ only in CLOSED, and CALL is 1 in both. One AND gate of WARM and NOT DOOR covers both.",
    "CALL = `(WARM & ~DOOR) | (DOOR & CLOSED)`.",
    "Add a NOT gate on DOOR. One AND gate takes WARM and the NOT output. A second AND gate takes DOOR and CLOSED. An OR gate takes both AND outputs to give CALL. 4 gates.",
  ],
  tooShortLead:
    'The manager\'s circuit uses 8 gates. Look at this shorter circuit: it uses only 2 gates. One OR gate receives WARM on one input. It receives the result of (DOOR AND CLOSED) on the other input.\n\nChoose an option below, then press "Check my prediction". The page shows how many gates each circuit uses and how their outputs compare, row by row.',
  p2Question:
    "Does the short circuit light CALL in the same rows as the manager's, or in different rows?",
  p2Explain:
    "They differ in 1 row of 8. WARM is 1, DOOR is 1, CLOSED is 0: the manager's circuit gives 0, the short one gives 1. This is a warm freezer with its door open while the shop is open, with staff loading stock. The short circuit would call the engineer.\n\nThe mistake: WARM changes nothing in the pair where DOOR and CLOSED are both 1, so the short circuit took WARM alone. But that does not mean DOOR disappears from the other term. The short circuit works only if every row still matches.",
  tooShortAfter:
    "The table below compares both circuits row by row. Like the challenges' tests, it shows what each circuit produces in every row.",
  explanation:
    'Gate count is one way to measure a circuit: fewer gates is better. But gates take time to answer. A change takes one step for each gate it passes through. So the longest path from an input to the output matters too.\n\nThe two circuits below both light ANY when any of four freezer rooms in the shop\'s warehouse is warm: inputs ROOM1 to ROOM4, each 1 while that room is warm. Both use three OR gates, each with two inputs. Drag the "Step" slider to see how fast each settles.',
  chainStepsLead:
    'The first circuit joins the four rooms in a chain. or1 takes ROOM1 and ROOM2. or2 takes the output of or1 and ROOM3. or3 takes the output of or2 and ROOM4.\n\nPress one of the ROOM inputs. Watch the status line under the drawing: it says how many steps before the output settles. Press "Start again" to reset, then try a different input. Drag the slider to watch the signal move, one gate per step.',
  treeStepsLead:
    "The second circuit joins the rooms in two pairs. or1 takes ROOM1 and ROOM2. or2 takes ROOM3 and ROOM4. or3 takes or1's and or2's outputs.\n\nPress one of the ROOM inputs at a time. Watch the status line under the drawing. Press \"Start again\" to reset between tries.",
  treeStepsAfter:
    "The chain settles in different numbers of steps: ROOM1 or ROOM2 in 3 steps, ROOM3 in 2, ROOM4 in 1. The tree settles in 2 steps for every input.\n\nA change moves through the circuit one gate per step. The number of gates on the longest path from an input to an output is the circuit's **depth**. The chain has depth 3; the tree has depth 2. Both use three OR gates, and both light ANY in the same rows. But they settle at different speeds because of their depth.\n\nA real gate takes time to answer. The deeper a circuit is, the longer you must wait before its output can be trusted after you change an input.",
  twoLampsLead:
    "You can build ALARM and CALL with their own gates, or you can share some of them. CALL's first AND gate computes WARM and NOT DOOR. That is the same as ALARM's AND gate from the first lesson of this module. The first drawing gives each lamp its own gates. The second drawing wires ALARM's AND output to CALL's OR gate as well. Under each drawing is the gate count and depth.",
  twoLampsAfter:
    "The separate design uses 6 gates and has depth 3. The shared design uses 4 gates and has depth 3. Both produce the same outputs in all 8 rows. One output can be wired to any number of inputs, so a gate two lamps need is built once. Sharing saved 2 gates and cost no depth.",
  buildXorFourLead:
    "The last lesson built XOR from five NAND gates. Its two row gates needed two NOTs, one for each input. This challenge asks you to build XOR from at most 4 NAND gates. Sharing one gate is the way in: a gate that both row gates need can be built once instead of twice.",
  c2Task:
    "Build XOR from NAND gates only. Inputs are A and B. Output Y is 1 when exactly one of A and B is 1. Use at most 4 gates. The tests check all 4 rows, the gate count, and whether all gates are NAND.",
  c2Hints: [
    "A gate whose output feeds two other gates is built once. Look for a NAND that both row gates can share instead of using separate NOTs.",
    "The five-gate XOR from the last lesson passes the 4 rows but fails the gate count test. It uses one gate for NOT A and one for NOT B.",
    "Let M be the NAND of A and B (so M is 0 only when both are 1). A NAND of A and M is 0 in the row where A=1 and B=0 (because then M=1). When A=1 and B=1 (because then M=0), this gate gives 1.",
    "The NAND of A and B (call it M) feeds two more gates: a NAND of A and M (call it P), and a NAND of M and B (call it Q).",
    "The solution uses four NAND gates: M from A and B, P from A and M, Q from M and B, and finally Y from P and Q.",
  ],
  reflection:
    "Two circuits with the same truth table can differ in gate count and depth. Looking at rows where an input makes no difference saves gates. Sharing a gate between outputs saves more. But every circuit must still match every row: the short CALL gave wrong answers. Gate count and depth are separate. The chain and tree both used 3 OR gates but settled in 3 and 2 steps.\n\nThis module built circuits for single-bit signals like ALARM, CALL and CLASH. But the freezer's temperature sensor sends 16 bits, one word. What would a circuit that works on whole words of bits look like?",
  modelVsReality:
    "In the stepped model, every gate takes one step. Real gates differ: one with more inputs is slower, one whose output feeds more inputs is slower, and temperature changes every gate's speed. Here, a four-input OR gate counts as one. On a real chip, a gate with many inputs is slower or is built from smaller ones. Gate count is simple to measure, but real designers also count chips, space on the board, and the delay of the slowest path.\n\nThe shop, the warehouse and the board are invented for the course.",
} as const;
