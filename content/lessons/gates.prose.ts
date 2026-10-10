// Copyright © 2026 Christopher Snow

// The words of the lesson gates.
//
// Drafted by the course's prose process from briefs of checked facts (see CLAUDE.md and
// docs/notes/module-2-boolean-logic.md) and checked against the model, then placed here by the
// lesson's structure in gates.ts. Edit a fact here only after checking it; the lesson's facts
// test (gates.facts.test.ts) holds the numbers.

export const PROSE = {
  question:
    "The display in the office reads the freezer room's temperature from the sensor's 16-bit word. Now it has three more signals, each one bit:\n- WARM is 1 while the freezer room is warmer than -15.0 degrees.\n- DOOR is 1 while the freezer room's door is open.\n- CLOSED is 1 while the shop is closed.\n\nThe manager wants a lamp, ALARM, on the display. ALARM should light when the freezer room is warm and its door is shut. Warm with the door open is expected while staff load stock. Warm with the door shut means the freezer is not cooling.\n\nHow can a circuit turn the bits WARM and DOOR into ALARM, using only what they are now?",
  motivation:
    "WARM and DOOR are bits, so they can be in only 4 combinations: 00, 01, 10, 11. A rule about them needs to say what ALARM is in each combination. Each extra bit doubles the combinations: three bits give 8, four give 16.\n\nThe lamp's rule looks only at the bits now. It does not need to know what happened before. Every lamp in this module, and much of the computer the course builds, is made of small parts that each do one such rule on a few bits.",
  prediction:
    'The figure below draws a first try at a circuit for ALARM from two parts: a NOT on DOOR\'s wire, and an OR with two inputs. The NOT gives the opposite of DOOR, and the OR gives 1 when either input is 1, or both. Choose an answer, then press "Check my prediction".',
  p1Question:
    "The freezer is cold, so WARM is 0. The door is shut, so DOOR is 0. The wire from the NOT part to the OR part is called SHUT. What does this first try give for ALARM?",
  p1Explain:
    "ALARM is 1. DOOR is 0, so the NOT part gives SHUT = 1. The OR part has SHUT = 1, and one input at 1 is enough for an OR, so ALARM is 1. The first try lights the lamp with a cold freezer and door shut, which the rule does not want, so the OR part is the wrong part. The drawing above now shows each wire's value, SHUT included. The table under the status line lists WARM, DOOR and ALARM, the inputs and the output; SHUT appears only on the drawing.",
  exploreNotLead:
    "Each part in the circuit does one fixed rule on its inputs. Its output depends only on its inputs now: change an input and the output follows. A part like this is a **gate**. This figure shows one NOT gate. It has input A and output Y. A NOT gate is also called an inverter. Press A to flip it between 0 and 1, and watch Y. The table under the drawing lists both values of A with the Y each gives. The row for your inputs now is shaded and marked 'Applies now'.",
  exploreAndLead:
    "The table under the NOT gate had one row for each value of its input. A table with one row for every combination of input values, and the output each gives, is a **truth table**. The AND gate has two inputs, A and B. Its truth table has 4 rows because two inputs give 4 combinations. Press A and B in turn and watch which row is shaded. Find the row where Y is 1.",
  exploreOrLead:
    "The OR gate has inputs A and B. Press them and compare its truth table with the AND gate's.",
  exploreOrAfter:
    "AND gives 1 in 1 row of 4, only when A and B are both 1. OR gives 1 in 3 rows of 4: whenever A or B or both are 1. It gives 0 only when both are 0. NOT gives the opposite of its input. The three figures above worked out every row with the simulator. The gate's rule and its truth table say the same thing two ways.",
  construction:
    'Now you build the ALARM circuit yourself. Build ALARM so that it follows the rule in every row. Add parts with the buttons above the drawing: "Add AND", "Add OR", "Add NOT". Press one port (the small circle where a wire joins a part or a pin) and then another to wire them. "Run tests" tries every row of the rule. When a test fails, it names the row, what your circuit gave, what was expected, and which gate drives the wrong signal. Under the drawing, "Unconnected" counts the ports no wire reaches yet; "As text" and "Import from text" are the course\'s text, which the explanation introduces and this challenge does not need.',
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
    'The fault figure shows the ALARM circuit. It has three parts:\n- notDoor (the NOT gate)\n- andAlarm (the AND gate)\n- SHUT (the wire between them)\n\nChoose a fault:\n- "An extra NOT gate is in the wire SHUT"\n- "The wire SHUT from NOT to AND is cut"\n- "The door switch is broken and DOOR stays 0 even when open"\n\nPress WARM and DOOR to try rows yourself. Before you run the checks, say which rows you expect each fault to break.\n\nThen press "Run checks" to try all 4 rows. It lists each row where ALARM differs from the circuit with no fault.\n\nA cut wire carries nothing because nothing drives it any more. The simulator marks it with X: a value it cannot know, neither 0 nor 1.',
  explanation:
    "A truth table lists every row, so it says everything a circuit of gates does. Two circuits with the same truth table do the same job, however their gates are drawn.\n\nFor ALARM, the truth table is the rule: ALARM is 1 in the row where WARM is 1 and DOOR is 0. ALARM is 0 in the other 3 rows.\n\nA drawing is one way to write a circuit down. The course also writes circuits as text, in a language called **SystemVerilog**. Engineers write SystemVerilog to describe the circuits in real chips, and software turns their text into gates. The course uses only some of the language, and adds more as lessons need it. When you write text in a challenge, anything the challenge does not use is refused, and a message says so.",
  alarmExpressionLead:
    "The figure shows the ALARM circuit and its text below the drawing.\n\n`module` starts one circuit, and `endmodule`, the last line, ends it. The word after `module` is the circuit's name: `alarm`. The lines in the brackets list the circuit's inputs and its output. `input` marks a signal going in, and `output` marks the signal coming out. In these lines, `logic` says that each signal carries one bit.\n\n`assign ALARM = WARM & ~DOOR;` makes ALARM. `~` is NOT and `&` is AND. This reads \"ALARM is WARM and not DOOR\". The course also writes OR as `|`.\n\nThe right-hand side, `WARM & ~DOOR`, is a formula of signal names joined by NOT, AND and OR. A formula like this is a **Boolean expression**.",
  alarmExpressionAfter:
    "Each gate in the drawing has a name: notDoor (the NOT gate) and andAlarm (the AND gate). SHUT is the wire out of notDoor, which the expression writes as `~DOOR`.\n\nYou can read the truth table from the expression: put each row's values in and work it out. With WARM 1 and DOOR 0: `~DOOR` is 1, and `1 & 1` is 1, so ALARM is 1.",
  generalisation:
    "The freezer room now has two sensors sending warm bits: WARM1 and WARM2. One failed sensor can no longer hide a warm freezer. When both agree, all is well. When they disagree, one is wrong and someone should look. A lamp lights when exactly one sensor says warm: the CLASH lamp. The first figure shows CLASH built from the gates of this lesson. It uses two AND gates, two NOT gates, and one OR gate.",
  clashGatesLead:
    "Two AND gates, and1 and and2, each gives 1 in one row only. and1 takes WARM1 and NOT WARM2. and2 takes NOT WARM1 and WARM2. An OR gate joins them. Press WARM1 and WARM2. Watch the drawing: which AND gate's output becomes 1? Check each row against the rule.",
  clashXorLead:
    "A gate that outputs 1 when exactly one of two inputs is 1 is common enough to have its own name. This gate is called **XOR**, short for exclusive OR: an OR that excludes the row where both inputs are 1. The symbol is the OR shape with a second curved line at the inputs. Compare this table to the one above.",
  clashXorAfter:
    "The two truth tables are the same. One circuit uses five gates; the other uses one. The same truth table from one part instead of five means fewer parts to fit on a board. OR and XOR differ in one row only: when both inputs are 1. The course's circuit text writes XOR as `^`:\n\n`assign CLASH = WARM1 ^ WARM2;`",
  writeNightLead:
    "The third lamp is NIGHT. While the shop is closed, nobody should open the freezer room. A warm freezer at night has nobody on hand to notice. NIGHT tells the manager, at home, to come and look. It uses all three signals: WARM, DOOR and CLOSED. This time you write the circuit as text, not a drawing. The first line names the inputs and output; the last is `endmodule`. Write the `assign` line between them. As you type, the page draws the circuit your text describes below the box.",
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
    "A gate's output depends on its inputs now, nothing more. This lesson used four kinds of gate: NOT, AND, OR and XOR. The CLASH lamp shows this: built two ways, with five gates or one. Could one kind of gate be enough to build every truth table?",
  modelVsReality:
    "In the figures, every gate answers at once. A real gate does not. It takes a short time to respond after an input changes.\n\nA real gate's inputs and output are voltages, as in Module 1. A gate reads each input against a threshold and drives its output to one of two voltages. The output is clean, 0 or 1, even if an input voltage has drifted a little.\n\nA cut wire in hardware is not X: the input pin floats, and may read 0, 1, or drift with noise. The simulator shows X because it cannot know. Real gates come in chips that contain several gates each. This lesson's lamps are invented for the course.",
  alarmFaultsOutcomes:
    "Each fault breaks some rows but leaves others right. A test that tries only some rows can miss a fault. That is why each challenge tests every row.",
  alarmFaultsOutcomesFault1:
    'With "An extra NOT gate is in the wire SHUT": the AND gate sees the opposite of SHUT. 2 of 4 rows fail: when WARM is 1 and DOOR is 0, ALARM is 0 (expected 1); when WARM is 1 and DOOR is 1, ALARM is 1 (expected 0).',
  alarmFaultsOutcomesFault2:
    'With "The wire SHUT from NOT to AND is cut": 2 of 4 rows fail, the ones with WARM 1, where ALARM is X. With WARM 0, ALARM stays 0, because an AND gate with one input at 0 gives 0 whatever its other input is.',
  alarmFaultsOutcomesFault3:
    'With "The door switch is broken and DOOR stays 0 even when open": DOOR is 0 whatever the door does. 1 row fails: when WARM is 1 and the door is open, ALARM is 1 when it should be 0. The lamp would light while staff load warm stock with the door open.',
  doorStuckExplain:
    "The switch is broken, so DOOR stays 0 even when the door is open. The drawing shows a box marked CONST that gives this fixed 0.",
} as const;
