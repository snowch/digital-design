// Copyright © 2026 Christopher Snow

// The words of the lesson capstone.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-13-machine/briefs, briefs 5A to 5C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Module 0 began with the machine as a box that runs lines of a program. Lesson 3 traced one value of your choosing down to a single gate, and lesson 4 joined the parts into the whole machine. Can you write a program of your own, run it on the whole machine, and answer questions about its run that only a trace can answer?\n\nThe figure runs a short program written for this lesson, not for the challenge. It lights CLASH when room B is colder than room A, and it shows room A's reading.",
  questionLead:
    "Press any edge in the run to pause before it, and open the blocks as lesson 3 did.",
  motivation:
    "The challenge asks for a program that shows on the display how many of the two rooms are colder than -20.0 degrees: 0, 1 or 2. It lights ALARM when both rooms are, and it stops. It must use at least one set if.\n\nThe display half is the count of cold rooms from Module 10's lesson 5, which that lesson wrote with branches and then with set if.\n\nThe challenge then has five program tests, and five questions about your program's run on the whole machine. Each question asks about one wire, paused before the ALU edge of your first set if. Some wires are drawn at the datapath level. One is a gate inside the ALU. One holds a word from an earlier instruction.\n\nThe answers are read off the run of your own program, so they depend on how you wrote it. No two programs need give the same answers.\n\nWhen an answer is wrong, the course tells you which level to look at and what to read there. It never gives you the value.\n\nThe figures practise reading the datapath on the figure's own program.",
  prediction:
    'The figure is paused before edge 13, the ALU edge of `R3 <= R2 < R1 signed`. The ALU works out R2 minus R1: -250 minus -184. The set if writes MET into R3 at its WRITE edge: 1 if the condition holds, else 0. No value shows until you commit. Choose an answer and press "Check my prediction".',
  p1Question: "After the next edge, what does MET hold?",
  p1Explain:
    "MET holds 1: -250 is less than -184, read signed. RESULT is -66, with MINUS 1 and OVER 0. The condition block takes the flags and the job digit and gives MET; find MET where it leaves the condition block in the datapath. At the WRITE edge, R3 takes it as a word.",
  investigation:
    "Stay at this edge, edge 13. Find COUT, the ALU's carry out, and compare it with MET. Recall Module 3's rule, in its terms: after A minus B, read unsigned, A is less than B when COUT is 0. Here A is R2 and B is R1. Predict first: is COUT 1 or 0?",
  invLead:
    "Open the datapath, then the ALU, and read COUT and RESULT where they leave it; MET leaves the condition block beside it.",
  invAfter:
    "COUT is 0, RESULT is -66, MET is 1. Module 3's rule reads COUT with the two words read unsigned. After A minus B, A is less than B when COUT is 0. Here A is R2, with the word `FFFFFFFFFFFFFF06`, and B is R1, with the word `FFFFFFFFFFFFFF48`. The first is the smaller, so COUT is 0.\n\nCOUT and MET reach the same verdict here, with different bits. COUT answers whether A is less than B, read unsigned. MET answers the job's own condition: less than, read signed. The two can disagree. Take A -250 and B 50. COUT is 1, because -250's word is the larger when read unsigned. MET is also 1, because -250 is less than 50 when read signed. The bits match, but the verdicts are opposite.\n\nA question about one wire is answered by reading that wire at that edge.",
  construction:
    '1. Write the program in the editor. It assembles as you type, and a line it cannot read is named.\n2. Press "Run tests". The five program tests run on the model. Once the program passes them, the five questions are graded. Together they are 10 tests.\n3. Press "Run my program on the whole machine". The trace figure opens on your program, with room A at -184 and room B at -250. Every question is about this run.\n4. In the run, find your first set if, and press its ALU edge.\n5. Open the blocks to the wire a question names, and read its value. Press a wire to pin it; its value shows under the drawing. Values are in hexadecimal: turn a word into a signed decimal number where a question asks for one.\n6. If you change the program, run it again. The answers belong to the run of the program you graded.',
  failureExperiment:
    "The figure's machine holds MET at 0, as if the condition block's output were joined to 0. The comparison with the instruction-level model runs beside it. Run it, read the first difference, and trace it back to the wire.",
  failLead: "Choose the fault, run to the end, and read the comparison.",
  failAfter:
    'The comparison\'s sentence: "After `R3 <= R2 < R1 signed` at `008`, R3 is 0 on the machine and 1 by the model."\n\nTrace back from R3. R3 takes the word the datapath writes at the WRITE edge. For a set if, that word is MET as a word. MET is 0 where it leaves the condition block, though the flags say the condition holds. The comparison named a register and a line. The trace found the wire.',
  explanation:
    "The five wires sit at different depths in the drawing. COUT, MET and RESULT are drawn at the datapath level, where they leave the ALU and the condition block. The output of `xorB` shows only inside the ALU's slice for bit 0, four blocks below the datapath. HM is also drawn at the datapath level. But its value at this set if's ALU edge came from an earlier instruction, the last load. The set if's line does not name it. A held word carries an earlier instruction's value into the edges of later instructions.",
  generalisation:
    "Designers do the same when a test fails on their own design. A simulator records every wire at every edge. They read one wire at one edge, as this lesson did. A real CPU has far more wires than this one, too many to draw at once. So their tools show the wires they choose, as lines over time.",
  capLead:
    "Write your program, pass its five tests, then run it on the whole machine and answer the five questions from its run.",
  c1Task:
    "1. Write a program for the shop that shows on the display how many of the two rooms are colder than -20.0 degrees: 0, 1 or 2. It lights ALARM, bit 0 of the lamps, when both rooms are, and no lamp otherwise. Then it stops. \"Colder than -20.0 degrees\" means a reading less than -200. A reading of exactly -200 is not colder. A set if writes 1 into the register it names when its condition holds, and 0 when it does not. The program must use at least one set if.\n2. The five program tests, each run on the model to its `stop`:\n   1. Room A -184, room B -250: display 1, lamps `000`.\n   2. Room A -250, room B -250: display 2, lamps `001`.\n   3. Room A -150, room B -100: display 0, lamps `000`.\n   4. Room A -200, room B -201: display 1, lamps `000`.\n   5. Room A 50, room B -250: display 1, lamps `000`.\n   The lamps are three bits: CLASH, NIGHT, ALARM from left to right.\n3. Then five questions about your program's run on the whole machine, with room A at -184 and room B at -250. All five are paused before the ALU edge of your first set if:\n   1. RESULT, the ALU's output, as a signed decimal number.\n   2. COUT, the ALU's carry out: 0 or 1.\n   3. MET, the branch condition, out of the condition block: 0 or 1.\n   4. The output of the XOR gate `xorB` in the ALU's slice for bit 0, the gate that turns B's bit 0 over for a subtraction: 0 or 1.\n   5. HM, the held word, as a signed decimal number.\n4. The drawing and the tables write values in hexadecimal. Give RESULT and HM as signed decimal numbers.\n5. There are 10 tests: the five program tests, then the five questions. A question is graded only once your program passes its five program tests.\n6. Press \"Run my program on the whole machine\" to trace it.",
  reflection:
    "You started in Module 0 with the machine as a box that runs lines of a program. You built every part: gates, adders, registers, memory, the ALU, the datapath, the control unit and the trap hardware, and joined them. You can follow a line of your own program down to a single gate, at any edge.\n\nWhich level was hardest to see through? Which level do you now use without thinking about the ones below it?",
  modelVsReality:
    "Real designs are checked with a testbench: a text in the same language that drives the machine's inputs, waits, and prints what it sees. Below is a short one for the course's machine, to read.\n\n```systemverilog\nmodule machine_test;\n  logic CLK = 0, RST = 1, DOOR = 0, WARM = 0;\n  logic [63:0] SENSORA = -184, SENSORB = -250;\n  logic [63:0] PC, DISPLAY;\n  logic [2:0] S, LAMPS;\n  logic HALT;\n  logic [7:0] CAUSE;\n\n  machine m (.*);\n\n  always #5 CLK = ~CLK;\n\n  initial begin\n    #12 RST = 0;\n    wait (HALT);\n    $display(\"display %0d, lamps %b\", $signed(DISPLAY), LAMPS);\n    $finish;\n  end\nendmodule\n```\n\n`.*` joins each of the machine's ports to the wire of the same name. `always #5` turns the clock over every 5 units of simulated time. `initial` runs its lines once, from the start. `#12` waits 12 units, so the reset holds over the first rising edge. `wait (HALT)` waits until the machine halts. `$display` prints the display and the lamps.\n\nThe course's engine does not run this text. It describes a test, not hardware. Tools that simulate SystemVerilog run it. They would also need the text of each of the course's parts, which the course's engine builds itself, and the program in the ROM.",
  c1Whole:
    "One program that passes its tests, on its own lines:\n\n```\n{program}\n```\n\nIts five answers are `{answers}`, in the order of the answer boxes.",
  c1Hints: [
    "The idea: two set ifs, one for each room, can each compare a room with -200, read signed. Each gives a word of 0 or 1. Then press the ALU edge of the first set if in the run, and open the blocks down to each wire you need.",
    "A common mistake is a set if that reads unsigned. It passes the first four tests and fails the fifth, where room A is 50. Another is answering in hexadecimal where the question asks for a signed decimal number.",
    "A smaller example, from the figure: at the ALU edge of `R3 <= R2 < R1 signed`, COUT is 0 and MET is 1. Read COUT where it leaves the ALU, and MET where it leaves the condition block.",
    "Part of the answer: the count is the sum of the two words, and ALARM is their AND, written to the lamps. `xorB` is in the slice `bit0`, inside `datapath`, `alu`, `g0` and `q0`; for a subtraction it gives B's bit 0 turned over. HM holds the word your last load fetched.",
  ],
} as const;
