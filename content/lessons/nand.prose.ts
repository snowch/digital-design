// Copyright © 2026 Chris Snow

// The words of the lesson nand.
//
// Drafted by the course's prose process from briefs of checked facts (see CLAUDE.md and
// docs/notes/module-2-boolean-logic.md) and checked against the model, then placed here by the
// lesson's structure in nand.ts. Edit a fact here only after checking it; the lesson's facts
// test (nand.facts.test.ts) holds the numbers.

export const PROSE = {
  question:
    "The three lamps from the last lesson (ALARM, NIGHT and CLASH) are now to be built on one small board for the display. An electronics engineer will assemble the board. The engineer keeps a drawer of spare chips. Nearly all of them are one kind: each chip contains four NAND gates.\n\nA **NAND** gate is an AND gate followed by a NOT. Its output is 0 only when every input is 1. The last lesson ended by asking whether one kind of gate could be enough for every truth table. Here the question is more specific: can every lamp be built from NAND gates alone?",
  motivation:
    "A board built from one kind of chip needs one kind of spare. Any chip in the drawer can replace any failed chip on the board.\n\nNOT, AND and OR built every lamp in the last lesson. NAND gates must make all three to build those lamps. You will build NOT and AND from NAND gates. In a failure experiment, you will read and break OR, which is built from NAND gates.",
  prediction:
    'The figure shows one NAND gate with both inputs wired to the same signal, A. The run sets A to 1. Choose what you think Y will be, then press "Check my prediction".',
  p1Question:
    "Both inputs of this NAND gate are wired to A, so they always have the same value. A is 1. What is Y?",
  p1Explain:
    "Y is 0, because both inputs are 1, and a NAND gate gives 0 only when every input is 1. With A at 0, both inputs are 0, so Y is 1. So Y is always the opposite of A. When both inputs are wired to the same signal, they are **tied**. A NAND gate with its inputs tied is a NOT gate.",
  exploreNandLead:
    "This explorer shows one NAND gate. It has inputs A and B, and output Y. The table below shows every row. Press A or B to change it between 0 and 1. The shaded row shows which inputs are set now. Compare each row with the AND gate's table from the last lesson.",
  exploreNandAfter:
    "In every row, NAND gives the opposite of AND. Only when A is 1 and B is 1 does the output become 0. The tied gate from the prediction used only two rows, because its inputs always had the same value. NAND is written `~(A & B)`: NOT of AND.",
  construction:
    'You will build two circuits: NOT and AND, each from NAND gates alone. The OR circuit comes next as a drawn figure, built from three NAND gates, to break. Press "Add NAND" to place a gate. Then press one port, then another to wire them. One output can wire to several inputs.\n\nEach challenge tests every row of the truth table as a separate test. One more test, "Only NAND gates", fails if any gate is not a NAND gate; its message names that gate. An unwired input reads X. Any row depending on X then gives X and fails.',
  buildNotLead: "Wire NOT from NAND gates first.",
  c1Task:
    "Wire a circuit with input A and output Y. Make Y the opposite of A. Use only NAND gates. There are 3 tests: the 2 rows and the 'Only NAND gates' test.",
  c1Hints: [
    "A NAND gate gives 1 unless both its inputs are 1. If both inputs always have the same value, only two rows of its table can happen.",
    "If you wire A to one input and leave the other unwired, the loose input reads X. Then Y becomes X when A is 1, and the test fails.",
    "When both inputs of a NAND gate are 0, it gives 1. When both inputs are 1, it gives 0.",
    "Wire input A to both inputs of one NAND gate.",
    "Use one NAND gate with A wired to both its inputs. The output is Y.",
  ],
  buildAndLead: "Build AND from NAND gates next. You know what AND should do.",
  c2Task:
    "Wire a circuit with inputs A and B and output Y. Y is 1 only when A and B are both 1. Use only NAND gates. There are 5 tests: the 4 input rows and the 'Only NAND gates' test.",
  c2Hints: [
    "NAND is an AND gate with a NOT after it. If you undo the NOT, you get AND back.",
    "One NAND gate alone gives the opposite of AND. All 4 of the truth table tests fail.",
    "The circuit from the first challenge turns any signal into its opposite.",
    "You need two NAND gates in sequence. The first takes A and B.",
    "The first NAND takes A and B. Its output goes to both inputs of a second NAND, whose output is Y.",
  ],
  orFaultsLead:
    'The circuit uses three NAND gates to build OR. nandA has both inputs wired to A, so its output NA is NOT A. nandB does the same with B to give NB. nandY takes NA and NB and gives Y. Y is 0 only when both NA and NB are 1. That is only when both A and B are 0. So Y is A OR B.\n\nFirst, try "No fault": press A and B to watch the circuit work. Then select each fault option in turn under "Fault options": "Wire NA is cut", "Gate nandA is AND instead of NAND", "Gate nandY is AND instead of NAND". Before pressing "Run checks", predict which of the 4 rows each fault breaks.',
  explanation:
    "NAND gates now make NOT, AND and OR. NOT, AND and OR can build any truth table.\n\nFor each row of the table with output 1, build one AND gate that outputs 1 in that row only. Each input goes in as it is where the row has a 1, and through a NOT where the row has a 0. Then connect one OR gate to the outputs of all those AND gates. The OR outputs 1 in exactly those rows, and 0 in all others.\n\nThis gives a correct circuit, though not always a small one.",
  clashExpressionLead:
    "This is the CLASH circuit from the last lesson, built using the method above. Its table has two rows with output 1: where WARM1 is 1 and WARM2 is 0, and where WARM1 is 0 and WARM2 is 1. So it needs two AND gates (one for each row) and one OR gate. The text writes the whole circuit as one expression.",
  clashExpressionAfter:
    "In the expression, each bracket is one row's AND gate, and the `|` is the OR that joins them.\n\nCLASH uses only NOT, AND and OR gates. NAND gates can make all three of these. So NAND gates alone can build any truth table.\n\nA gate that can build any truth table on its own is called **universal**. NAND is universal.",
  exploreNorLead:
    "NAND is not the only gate that can make any truth table. There is another: an OR gate followed by a NOT, so its output is 1 only when every input is 0. This gate is called a **NOR** gate. The figure shows one NOR gate with inputs A and B and output Y, with its truth table. Press A and B to change their values, and compare each row with OR's table.",
  exploreNorTiedLead:
    "This NOR gate has both inputs wired to the same signal A. Press A to change its value.",
  exploreNorTiedAfter:
    "Y is the opposite of A: this tied NOR gate is a NOT. You can check this with the figure above and a pencil. A NOR gate followed by a tied NOR gives an OR, and a NOR gate whose inputs are NOT A and NOT B gives an AND. So NOR can make NOT, AND and OR, as NAND can. Any truth table can be built from NOR gates alone, making NOR universal like NAND. The text writes NOR as `~(A | B)`.",
  buildXorLead:
    "The CLASH lamp's rule is the XOR gate of the first lesson of this module. In the challenge, A and B stand for the two sensors' bits (WARM1 and WARM2), and Y for CLASH. Nearly all the chips in the drawer are NAND chips, so you must build this circuit from NAND gates alone. The plan is: inputs go through NOTs, then through AND gates that mark specific rows, and the results join in an OR. Each of those parts (NOT, AND, OR) can be built from NAND gates.",
  c3Task:
    'Draw an XOR circuit (the CLASH lamp) with inputs A and B (the two sensors\' bits) and output Y. Use NAND gates only. Y must be 1 when exactly one of A and B is 1, and 0 otherwise. There are 5 tests: the 4 rows of the truth table, and "Only NAND gates". You can use as many NAND gates as you need.',
  c3Hints: [
    "Follow CLASH's plan from the explanation. Build NOT A and NOT B. Build one gate that outputs 1 only when A is 0 and B is 1, and another for when A is 1 and B is 0. Build a gate to join them.",
    "Leaving out the NOTs is a common mistake. A NAND gate of A and B is 0 only in the row A 1, B 1, where Y must be 0. So you need the NOTs to pick the right rows.",
    "A NAND gate gives 0 in exactly the row an AND gate would give 1. A NAND gate of A and NOT B is 0 only in the row A 1, B 0. A NAND gate of NOT A and B is 0 only in the row A 0, B 1. That is the pattern you need.",
    "Two gates that are each 0 in one row, joined by a NAND gate, give 1 in those two rows and 0 elsewhere: a NAND gate gives 1 when either input is 0.",
    "Five NAND gates build it: NA from a tied NAND on A, NB from a tied NAND on B, P from NAND of A and NB, Q from NAND of NA and B, and Y from NAND of P and Q. Check: P is 0 only when A is 1 and B is 0; Q is 0 only when A is 0 and B is 1.",
  ],
  reflection:
    "One kind of gate is enough. NAND builds NOT, AND and OR, and those make any truth table. NOR does the same. Both are universal gates: one gate type can build any truth table. An engineer can use just one kind of chip on a board.\n\nThe plan above used five NAND gates. Can CLASH use fewer? When two circuits have the same truth table, what makes one better than the other?",
  modelVsReality:
    "The simulator treats all gates the same: each answers in one step. Real gates take different times. In the most common way of making chips, a NAND gate is smaller and faster than an AND gate. An AND on such a chip is usually built from a NAND gate followed by a NOT. So building from NAND is not only a matter of spares.\n\nIn the simulator, an unwired input reads X, marking an unknown value. In real circuits, an unconnected input does not behave that way. It may read 0 or 1, and noise can change it. Engineers wire every unused input to a fixed 0 or 1.\n\nThe engineer and the drawer are invented for this course. But real chips that each contain four NAND gates are common.",
  orFaultsOutcomes:
    'With "Wire NA is cut", the checks show 2 of 4 failed. When B is 1, NB is 0. A NAND gate with one input 0 gives 1, so those rows still pass.\n\nWith "Gate nandA is AND instead of NAND", the checks show 2 of 4 failed. NA is now A instead of NOT A, so the circuit fails in those rows.\n\nWith "Gate nandY is AND instead of NAND", the checks show all 4 failed. Every row gives the opposite of OR.\n\nA fault inside a circuit can show in every row or in just some. A board built from tested parts still needs every row of the whole circuit tried.',
} as const;
