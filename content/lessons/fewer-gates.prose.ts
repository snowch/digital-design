// Copyright © 2026 Chris Snow

// The words of the lesson fewer-gates.
//
// Drafted by the course's prose process from briefs of checked facts (see CLAUDE.md and
// docs/notes/module-2-boolean-logic.md) and checked against the model, then placed here by the
// lesson's structure in fewer-gates.ts. Edit a fact here only after checking it; the lesson's facts
// test (fewer-gates.facts.test.ts) holds the numbers.

export const PROSE = {
  question:
    "The shop's office display has one more lamp now: CALL tells the manager to call the engineer. The lamp lights when the freezer is warm with its door shut (a failing freezer). It also lights when the door is open while the shop is closed (a door left open, or someone inside).\n\nThe manager wrote down the four rows where CALL is 1. The last lesson showed how: one AND gate for each row, then one OR of them all. That is 4 AND gates, 3 NOT gates and 1 OR: 8 gates. The board has room for 4 gates for CALL.\n\nThe last lesson asked whether CLASH could be built from fewer NAND gates, and what else, besides the truth table, makes one circuit better than another. The ways to build CALL with fewer gates answer that question about CLASH, in the last challenge. How can the same truth table be built from fewer gates?",
  motivation:
    "Fewer gates mean fewer chips to buy, fit and replace. Room on the board matters: the next lamp will need its own gates.\n\nGates in a row matter too. Each gate takes time to answer. A change at an input reaches the lamp later the more gates it passes through. This lesson measures both: the total number of gates and how many in a row.",
  prediction:
    'The figure draws the manager\'s eight-gate circuit and runs it. All three inputs are 1, then WARM changes to 0. Predict what CALL will be, then press "Check my prediction".',
  p1Question:
    "The freezer is warm, the door open, the shop closed: CALL is 1. WARM changes to 0. What is CALL now?",
  p1Explain:
    "CALL stays 1. With WARM 1, and3 gives 1; when WARM changes to 0, and3 gives 0 but and4 gives 1. The gates and3 and and4 differ only in WARM, yet CALL is 1 with either. So with the door open and the shop closed, WARM makes no difference: one AND gate of DOOR and CLOSED could replace the two.",
  callPairsLead:
    'Two rows that differ in only one input form a pair. If both rows of a pair give the same output, that input makes no difference there. One AND gate can do the work of two.\n\nThe figure sets the manager\'s table in pairs. Under "Which input?", choose WARM, DOOR or CLOSED. Each line is a pair: the other two inputs, CALL with your input at 0, CALL with it at 1, and whether your input changed CALL. Pairs where it did not are shaded. The investigation starts on WARM.\n\nTry all three inputs. Look for shaded pairs where CALL is 1 in both rows.',
  callPairsAfter:
    "A shaded pair where CALL is 0 in both rows needs no gate. Only rows with output 1 get an AND gate.\n\nEach input has one shaded pair where CALL is 1 in both rows. With WARM chosen, that pair is DOOR 1 and CLOSED 1; one AND gate of DOOR and CLOSED covers both rows. With CLOSED chosen, that pair is WARM 1 and DOOR 0; one AND gate of WARM and NOT DOOR covers both rows. With DOOR chosen, that pair is WARM 1 and CLOSED 1; one AND gate of WARM and CLOSED covers both rows.\n\nThe first two AND gates together cover all 4 rows where CALL is 1. The third pair's rows are already covered, so it is not needed.\n\nThe second gate is ALARM's rule from the first lesson of this module.",
  construction:
    'Build CALL from the two AND gates the pairs found. The part buttons are "Add AND", "Add OR" and "Add NOT". Use at most 4 gates. AND, OR and NOT all count towards that limit. Besides the 8 rows, one more test checks "At most 4 gates". If it fails, it tells you how many you have and marks them in the drawing.',
  buildCallLead: "Build CALL with at most 4 gates.",
  c1Task:
    'Build a circuit for the CALL lamp: inputs WARM, DOOR, CLOSED; output CALL.\n\nCALL is 1 in 4 rows:\n- WARM 1, DOOR 0, CLOSED 0\n- WARM 1, DOOR 0, CLOSED 1\n- WARM 1, DOOR 1, CLOSED 1\n- WARM 0, DOOR 1, CLOSED 1\n\nCALL is 0 in the other 4 rows.\n\nUse at most 4 gates.\n\n9 tests: the 8 rows and "At most 4 gates".',
  c1Hints: [
    "Each pair where CALL is 1 in both rows can be one AND gate of the other two inputs. Find pairs that cover all 4 rows where CALL is 1.",
    "Do not drop an input that matters. WARM makes no difference when DOOR and CLOSED are both 1, but it does when DOOR is 0. Check every row after each change.",
    "Consider WARM 1, DOOR 0, CLOSED 0 and WARM 1, DOOR 0, CLOSED 1. They differ only in CLOSED, and CALL is 1 in both. One AND gate of WARM and NOT DOOR covers both.",
    "CALL = `(WARM & ~DOOR) | (DOOR & CLOSED)`.",
    "Add a NOT gate on DOOR. One AND gate takes WARM and the NOT output. A second AND gate takes DOOR and CLOSED. An OR gate takes both AND outputs to give CALL. 4 gates.",
  ],
  tooShortLead:
    'The manager\'s circuit uses 8 gates. Look at this shorter circuit: it uses only 2 gates. One OR gate receives WARM on one input. It receives the result of (DOOR AND CLOSED) on the other input.\n\nChoose an option below, then press "Check my prediction". The page shows how many gates each circuit uses and how their outputs compare, row by row.',
  p2Question:
    "Does the short circuit light CALL in the same rows as the manager's, or in different rows?",
  p2Explain:
    "They differ in 1 row of 8. WARM is 1, DOOR is 1, CLOSED is 0: the manager's circuit gives 0, the short one gives 1. This is a warm freezer with its door open while the shop is open, with staff loading stock. The short circuit would call the engineer.\n\nThe manager's CALL is 1 with WARM and NOT DOOR, or with DOOR and the shop closed. The short circuit lights CALL whenever WARM is 1. Its first term lost NOT DOOR. WARM makes no difference in one pair; that does not let NOT DOOR drop from the other term. The short circuit is right only if every row still matches.",
  tooShortAfter:
    "The table below compares both circuits row by row. Like the challenges' tests, it shows what each circuit produces in every row.",
  explanation:
    "Gate count is one way to measure a circuit: fewer gates is better. But gates take time to answer. A change takes one step for each gate it passes through. So the longest path from an input to the output matters too.\n\nThe two circuits below both light ANY when any of four freezer rooms in the shop's warehouse is warm: inputs ROOM1 to ROOM4, each 1 while that room is warm. Both use three OR gates, each with two inputs. The circuit settles when no gate's output changes any more. Drag the \"Step\" slider to see how fast each settles.",
  chainStepsLead:
    'The first circuit joins the four rooms in a chain. or1 takes ROOM1 and ROOM2. or2 takes the output of or1 and ROOM3. or3 takes the output of or2 and ROOM4.\n\nWhen the figure opens, the status line reads "Settled in 3 steps." Every wire starts unknown; the figure works out the circuit from all inputs 0. Press one of the ROOM inputs. The status line shows how many steps that change takes. The count depends on how many gates the change passes through to reach ANY. Press "Start again" before each input. Drag the slider to watch the signal move, one gate per step.',
  treeStepsLead:
    'The second circuit joins the rooms in two pairs. or1 takes ROOM1 and ROOM2. or2 takes ROOM3 and ROOM4. or3 takes or1\'s and or2\'s outputs. It opens on "Settled in 2 steps."\n\nPress one of the ROOM inputs at a time. Watch the status line under the drawing. Press "Start again" to reset between tries.',
  treeStepsAfter:
    "The chain settles in different numbers of steps: ROOM1 or ROOM2 in 3 steps, ROOM3 in 2, ROOM4 in 1. The tree settles in 2 steps for every input.\n\nA change moves through the circuit one gate per step. The number of gates on the longest path from an input to an output is the circuit's **depth**. The chain has depth 3; the tree has depth 2. Both use three OR gates, and both light ANY in the same rows. But they settle at different speeds because of their depth.\n\nA real gate takes time to answer. The deeper a circuit is, the longer you must wait before its output can be trusted after you change an input.",
  twoLampsLead:
    "In the first drawing, CALL's AND gate andWarm computes WARM and NOT DOOR, the same as ALARM's AND gate andAlarm from the first lesson of this module. The second drawing removes andWarm and the NOT gate feeding it. In its place, andAlarm's output is wired to CALL's OR gate as well as to ALARM. The drawings are one above the other. Under each drawing is its gate count and depth.",
  twoLampsAfter:
    "One output can be wired to any number of inputs. So a gate that two lamps both need is built once instead of twice. Sharing that gate saved 2 gates and cost no depth.",
  buildXorFourLead:
    "The last lesson built XOR from five NAND gates. Two of those gates were NOTs, one for NOT A and one for NOT B. This challenge asks you to build the same XOR circuit from at most 4 NAND gates. Both circuits must produce the same outputs in all 4 rows.",
  c2Task:
    "Build XOR from NAND gates only. Inputs are A and B. Output Y is 1 when exactly one of A and B is 1. Use at most 4 gates. The tests check all 4 rows, the gate count, and whether all gates are NAND.",
  c2Hints: [
    "A gate whose output feeds two other gates is built once. Look for a NAND that both row gates can share instead of using separate NOTs.",
    "The five-gate XOR from the last lesson passes the 4 rows but fails the gate count test. It uses one gate for NOT A and one for NOT B.",
    "M is the NAND of A and B: it is 1 in every row except A 1, B 1. A NAND gate of A and M is 0 only when both inputs are 1, which happens only in row A 1, B 0 (where M is 1). This gate does what a NAND of A and NOT B does.",
    "M, the NAND of A and B, feeds two gates: P, a NAND of A and M, and Q, a NAND of M and B.",
    "The solution uses four NAND gates: M from A and B, P from A and M, Q from M and B, and finally Y from P and Q.",
  ],
  reflection:
    "Two circuits with the same truth table can differ in gate count and depth. Looking at rows where an input makes no difference saves gates. Sharing a gate between outputs saves more. But every circuit must still match every row: the two-gate circuit in the failure experiment gave wrong answers. Gate count and depth are separate. The chain and tree both used 3 OR gates but settled in 3 and 2 steps.\n\nThis module built circuits for single-bit signals like ALARM, CALL and CLASH. But the freezer's temperature sensor sends 16 bits, one word. What would a circuit that works on whole words of bits look like?",
  modelVsReality:
    "In the stepped model, every gate takes one step. Real gates differ: one with more inputs is slower, one whose output feeds more inputs is slower, and temperature changes every gate's speed. Here, a four-input OR gate counts as one. On a real chip, a gate with many inputs is slower or is built from smaller ones. Gate count is simple to measure, but real designers also count chips, space on the board, and the delay of the slowest path.\n\nThe shop, the warehouse and the board are invented for the course.",
} as const;
