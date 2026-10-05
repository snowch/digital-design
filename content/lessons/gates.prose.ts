// The words of the lesson gates.
//
// Drafted by the course's prose process from briefs of checked facts (see CLAUDE.md and
// docs/notes/module-2-boolean-logic.md) and checked against the model, then placed here by the
// lesson's structure in gates.ts. Edit a fact here only after checking it; the lesson's facts
// test (gates.facts.test.ts) holds the numbers.

export const PROSE = {
  question:
    "The display in the office reads the freezer room's temperature from the sensor's 16-bit word. Now it has three more signals, each one bit:\n- WARM is 1 while the freezer room is warmer than -15.0 degrees.\n- DOOR is 1 while the freezer room's door is open.\n- CLOSED is 1 while the shop is closed.\n\nThe manager wants a lamp, ALARM, on the display. ALARM should light when the freezer room is warm and its door is shut. Why? Warm with the door open is expected while staff load stock. Warm with the door shut means the freezer is not cooling.\n\nHow can a circuit turn the bits WARM and DOOR into ALARM, using only what they are now?",
  motivation:
    "WARM and DOOR are bits, so they can be in only 4 combinations: 00, 01, 10, 11. A rule about them needs to say what ALARM is in each combination. Each extra bit doubles the combinations: three bits give 8, four give 16.\n\nThe lamp's rule looks only at the bits now. It does not need to know what happened before. Every lamp in this module, and much of the computer the course builds, is made of small parts that each do one such rule on a few bits.",
  prediction:
    'The figure below draws a circuit for ALARM from two parts: a NOT on DOOR\'s wire, and an AND with two inputs. The NOT gives the opposite of DOOR, and the AND gives 1 only when both its inputs are 1. Choose an answer, then press "Check my prediction".',
  p1Question:
    "The freezer is warm, so WARM is 1. Staff have the door open, so DOOR is 1. The wire from the NOT part to the AND part is called SHUT. What is ALARM?",
  p1Explain:
    "ALARM is 0. DOOR is 1, so the NOT part gives SHUT = 0. The AND part has WARM = 1 and SHUT = 0, and not both are 1, so ALARM is 0. This is the rule: warm with the door open does not light the lamp. The timing diagram shows each signal's value after the run.",
  exploreNotLead:
    "Each part in the circuit does one fixed rule on its inputs. Its output depends only on its inputs now: change an input and the output follows. A part like this is a **gate**. This figure shows one NOT gate. It has input A and output Y. A NOT gate is also called an inverter. Press A to flip it between 0 and 1, and watch Y. The table under the drawing lists both values of A with the Y each gives. The row for your inputs now is shaded and marked 'Applies now'.",
  exploreAndLead:
    "The table under the NOT gate had one row for each value of its input. A table with one row for every combination of input values, and the output each gives, is a **truth table**. The AND gate has two inputs, A and B. Its truth table has 4 rows because two inputs give 4 combinations. Press A and B in turn and watch which row is shaded. Find the row where Y is 1.",
  exploreOrLead:
    "The OR gate has inputs A and B. Press them and compare its truth table with the AND gate's.",
  exploreOrAfter:
    "AND gives 1 in 1 row of 4, only when A and B are both 1. OR gives 1 in 3 rows of 4: whenever A or B or both are 1. It gives 0 only when both are 0. NOT gives the opposite of its input. The three figures above worked out every row with the simulator. The gate's rule and its truth table say the same thing two ways.",
  construction:
    "Now you build the ALARM circuit yourself. Build it from the rule, not by copying the drawing from the prediction. Add parts with the buttons above the drawing: 'Add AND', 'Add OR', 'Add NOT'. Press one port and then another to wire them. 'Run tests' tries every row of the rule. When a test fails, it names the row, what your circuit gave, what was expected, and which gate drives the wrong signal.",
  buildAlarmLead: "Draw the ALARM circuit from WARM and DOOR.",
  c1Task:
    "- Draw a circuit with inputs WARM and DOOR and output ALARM.\n- ALARM is 1 when WARM is 1 and DOOR is 0. In the other 3 rows ALARM is 0.\n- There are 4 tests, one for each row.",
  c1Hints: [
    "ALARM needs WARM to be 1 and the door to be shut, both at once. 'Both at once' is what an AND gate does. The door is shut when DOOR is 0.",
    "Wiring DOOR straight into the AND gate lights ALARM when the door is open. That is the opposite of the rule. An OR gate in place of the AND gate lights ALARM whenever WARM is 1 or the door is shut. That is 3 rows, not 1.",
    "A NOT gate turns DOOR into a signal that is 1 while the door is shut.",
    "Put a NOT gate on DOOR. Its output is one input of the AND gate.",
    "DOOR goes into a NOT gate. The NOT gate's output and WARM go into an AND gate. The AND gate's output is ALARM.",
  ],
  alarmFaultsLead:
    'The fault figure shows the ALARM circuit. It has three parts:\n- notDoor (the NOT gate)\n- andAlarm (the AND gate)\n- SHUT (the wire between them)\n\nChoose a fault:\n- "The gate andAlarm is replaced by an OR gate"\n- "The wire SHUT from NOT to AND is cut"\n- "The door switch is broken and DOOR stays 0"\n\nPress WARM and DOOR to try rows yourself. Then press "Run checks" to try all 4 rows. It lists each row where ALARM differs from the circuit with no fault.\n\nBefore you run the checks, say which rows you expect each fault to break.\n\nA cut wire carries nothing. The simulator marks its value as X: a value it cannot know, neither 0 nor 1.',
  alarmFaultsAfter:
    'With "The gate andAlarm is replaced by an OR gate": 2 of 4 rows fail. ALARM is 1 when WARM and DOOR are both 0, and when both are 1.\n\nWith "The wire SHUT from NOT to AND is cut": 2 of 4 rows fail, the ones with WARM 1, where ALARM is X. With WARM 0, ALARM stays 0, because an AND gate with one input at 0 gives 0 whatever its other input is.\n\nWith "The door switch is broken and DOOR stays 0": 1 row fails, where WARM is 1 and DOOR is 1. The lamp would light while staff load warm stock with the door open.\n\nEach fault breaks some rows but leaves others right. A test that tries only some rows can miss a fault. That is why each challenge tests every row.',
  explanation:
    "A truth table lists every row, so it says everything a circuit of gates does. Two circuits with the same truth table do the same job, however their gates are drawn.\n\nFor ALARM, the truth table is the rule: ALARM is 1 in the row where WARM is 1 and DOOR is 0. ALARM is 0 in the other 3 rows.\n\nA drawing is one way to write a circuit down. The course also writes circuits as text.",
  alarmExpressionLead:
    'The figure shows the ALARM circuit and, beside it, the same circuit as text.\n\nThe first lines name the circuit, `alarm`, and list its inputs and output. `endmodule` ends it.\n\n`assign ALARM = WARM & ~DOOR;` makes ALARM. `~` is NOT and `&` is AND. This reads "ALARM is WARM and not DOOR". The course also writes OR as `|`.\n\nThe right-hand side, `WARM & ~DOOR`, is a formula of signal names joined by NOT, AND and OR. A formula like this is a **Boolean expression**.',
  alarmExpressionAfter:
    "Each operator in the expression is one gate in the drawing: `~` is the NOT gate notDoor, and `&` is the AND gate andAlarm.\n\nThe expression names no wire between the gates: SHUT is the `~DOOR` inside it.\n\nYou can read the truth table from the expression: put each row's values in and work it out.",
  generalisation:
    "The freezer room now has two sensors sending warm bits: WARM1 and WARM2. One failed sensor can no longer hide a warm freezer. When both agree, all is well. When they disagree, one is wrong and someone should look. A lamp lights when exactly one sensor says warm: the CLASH lamp. The first figure shows CLASH built from the gates of this lesson. It uses two AND gates, two NOT gates, and one OR gate. Press WARM1 and WARM2.",
  clashGatesLead:
    "Two AND gates, and1 and and2, each gives 1 in one row only. and1 takes WARM1 and NOT WARM2. and2 takes NOT WARM1 and WARM2. An OR gate joins them. Press WARM1 and WARM2. Watch the drawing: which AND gate's output becomes 1? Check each row against the rule.",
  clashXorLead:
    "A gate that outputs 1 when exactly one of two inputs is 1 is common enough to have its own name. This gate is called **XOR**, short for exclusive OR: an OR that excludes the row where both inputs are 1. The symbol is the OR shape with a second curved line at the inputs. Press WARM1 and WARM2. Compare this table to the one above.",
  clashXorAfter:
    "The two truth tables are the same. One circuit uses five gates; the other uses one. Both do the job. OR and XOR differ in one row only: when both inputs are 1. The course's circuit text writes XOR as `^`. The expression `CLASH = WARM1 ^ WARM2` is shorter than `(WARM1 & ~WARM2) | (~WARM1 & WARM2)`.",
  writeNightLead:
    "Here comes the third lamp: NIGHT. It uses all three signals: WARM, DOOR and CLOSED. This time you write the circuit as text, not a drawing. The first line names the inputs and output. The last line is `endmodule`. Write the `assign` line between them: the formula that makes NIGHT from the signals. As you type, the page draws the circuit your text describes below the box.",
  c2Task:
    "Write an `assign` line that makes NIGHT light when the shop is closed and either the door is open or the freezer is warm. Use `&` for AND, `|` for OR, and `~` for NOT. Add brackets where you need them to set the order. The circuit has three inputs (WARM, DOOR, CLOSED) and one output (NIGHT). There are 8 tests, one for each row.",
  c2Hints: [
    'Split the rule at the "and": the shop is closed, and (door open or freezer warm). The bracketed part is an OR. The whole is an AND.',
    "Without brackets, `&` runs before `|`. So `CLOSED & DOOR | WARM` means `(CLOSED & DOOR) | WARM`. This lights NIGHT whenever WARM is 1, even when the shop is open. 2 tests fail: the rows with WARM 1 and CLOSED 0.",
    '"Door open or freezer warm" is `DOOR | WARM`.',
    "NIGHT is `CLOSED & (...)`, with an OR inside the brackets.",
    "`assign NIGHT = CLOSED & (DOOR | WARM);`",
  ],
  reflection:
    "A gate's output depends on its inputs now, nothing more. A truth table lists every row, so it shows the whole rule. A Boolean expression writes the same rule as a formula. Each operator (`~`, `&`, `|`, `^`) is a gate.\n\nThis lesson has used four kinds of gate: NOT, AND, OR and XOR. The CLASH lamp was built two ways: five gates or one. That raises a question: how many kinds of gate does a circuit need? Could one kind be enough to build every truth table?",
  modelVsReality:
    "In the figures, a gate answers in one step. The simulator works out each gate's output from its inputs, then the next gate's, until nothing changes. A real gate does not answer at once. It takes a short time to respond after an input changes.\n\nA real gate's inputs and output are voltages, as in Module 1. A gate reads each input against a threshold and drives its output to one of two voltages. The output is clean, 0 or 1, even if an input voltage has drifted a little.\n\nA cut wire in hardware is not X: the input pin floats, and may read 0, 1, or drift with noise. The simulator shows X because it cannot know. Real gates come in chips that contain several gates each. This lesson's lamps are invented for the course.",
} as const;
