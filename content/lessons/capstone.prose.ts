// Copyright © 2026 Christopher Snow

// The words of the lesson capstone.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-13-machine/briefs, briefs 5A to 5C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Module 0 began with the machine as a box that runs lines of a program. Lesson 3 traced a value of your own choosing down to one gate. Lesson 4 joined the parts into the whole machine.\n\nThis lesson asks one question: can you write a program of your own, run it on the whole machine, and answer questions about its run that only a trace answers?\n\nThe figure runs a short program written for this lesson. It is not the challenge's task. The program lights CLASH when room B is colder than room A, and it shows room A's reading.",
  questionLead:
    "Step through the run, or pause before any edge of any line, and open the blocks as lesson 3 did.",
  motivation:
    "The challenge asks for a program for the shop. The program shows on the display how many of the two rooms are colder than -20.0 degrees: 0, 1 or 2. It lights ALARM, bit 0 of the lamps, when both rooms are that cold. The lamps word is `001` when both rooms are that cold, and `000` otherwise. It must use at least one set if, and it must stop.\n\nThen come five questions about your program's run on the whole machine. Their answers are read off the run of your own program, so they depend on how you wrote it. No two programs need give the same answers.\n\nEach question names an edge, an instruction of your program and a wire: your first set if, or your first store. The wire is inside a block, at one edge. Only a trace shows its value.\n\nA wrong answer tells you which level to look at and what to read there. It never gives the value.\n\nThe figures in this lesson practise the same questions on the figure's program.",
  prediction:
    'The figure is paused before edge 13, the ALU edge of `R3 <= R2 < R1 signed`. The ALU subtracts R1 from R2: -250 minus -184. The set if writes MET into R3: 1 if the condition holds, else 0.\n\nNo value shows until you commit. Choose an answer and press "Check my prediction".',
  p1Question: "After the next edge, what does MET hold?",
  p1Explain:
    "MET holds 1: -250 is less than -184, read signed.\n\nThe ALU gives Y, -66, with MINUS 1 and OVER 0. The condition block takes those flags and the job digit, and gives MET.\n\nFind MET where it leaves the condition block in the datapath. At the WRITE edge, R3 takes it as a word.",
  investigation:
    "The figure is paused before edge 13, the ALU edge of `R3 <= R2 < R1 signed`.\n\nFind COUT, the ALU's carry out, at this edge, and compare it with MET.\n\nPredict first: does a subtraction whose answer is less than 0 give a carry out of 1 or of 0?",
  invLead:
    "Open the datapath and read COUT and Y where they leave the ALU, then MET where it leaves the condition block.",
  invAfter:
    "COUT is 0. Y is -66, and MET is 1.\n\nRead as unsigned numbers, R2's word is smaller than R1's, so the subtraction borrows. A subtraction that borrows gives a carry out of 0.\n\nSo COUT does not answer \"is R2 less than R1, read signed\". MET does: the condition block works it out from the flags and the job digit.\n\nA question about one wire is answered by reading that wire, at that edge. A neighbouring wire, or the same wire at another edge, can hold a different value.",
  construction:
    '1. Write the program in the editor. It assembles as you type. A line it cannot read is named.\n3. Press "Run my program on the whole machine". The trace figure of lesson 3 opens on your program, with room A at -184 and room B at -250. Every question is about this run.\n4. Each question names an instruction of your program and an edge of it, such as "paused before the ALU edge of your first set if". Use "Pause before an edge" to choose your first set if and its ALU edge, or your first store and its MEMORY edge.\n5. Open the blocks to the wire the question names, and read its value. For the PC\'s bit 4, show the PC\'s bit from "Parts here that never open", and read D.\n6. If you change the program, run it again. The answers belong to the run of the program you graded.',
  failureExperiment:
    "The machine in this figure holds MET at 0, as if the condition block's output were joined to 0.\n\nThe comparison with the model runs beside it.\n\nRun it, read the first difference, and trace it back to the wire.",
  failLead: "Choose the fault, run to the end, and read the comparison.",
  failAfter:
    'The comparison: "After `R3 <= R2 < R1 signed` at `008`, R3 is 0 on the machine and 1 by the model."\n\nTrace back: R3 takes the word for Y at the WRITE edge. For a set if, that word is MET as a word. MET is 0 where it leaves the condition block, though the flags say the condition holds.\n\nThe comparison named a register and a line. The trace found the wire.',
  explanation:
    "A trace answers a question about one wire at one edge. Each level above the gates hides that wire. The program's line says what happens to registers. The instruction's word says which fields it has. The datapath says which blocks are at work. Only the gate level shows the wire itself.\n\nThat hiding is abstraction. Each level holds enough to work out what the level above needs, and no more.\n\nThe questions in the challenge need the levels below the line. The program's line does not say what COUT is, and it does not say which address the memory port reads at a given edge. You have to go down to find out.",
  generalisation:
    "Every CPU has the levels this course built. There is a program, its machine code, a datapath and a control unit, and blocks made of gates.\n\nReal CPUs have many more parts at each level. The levels are the same, though, and a trace goes down them the same way.\n\nThe course's machine is small enough to trace by hand at every level. The CPU in a phone is not. Its designers rely on the levels to work on one at a time.",
  capLead:
    "Write your program, run it on the whole machine, and answer the five questions from its run.",
  c1Task:
    "Write a program for the shop. It shows on the display how many of the two rooms are colder than -20.0 degrees: 0, 1 or 2. It lights ALARM, bit 0 of the lamps, when both rooms are colder, and no lamp otherwise. Then it stops. \"Colder than -20.0 degrees\" means a reading less than -200. A reading of exactly -200 is not colder.\n\nYour program must use at least one set if.\n\nYour program must pass four tests. Each runs on the model to its `stop`. The lamps are three bits: CLASH, NIGHT, ALARM from left to right.\n\n1. Room A -184, room B -250: display 1, lamps `000`.\n2. Room A -250, room B -250: display 2, lamps `001`.\n3. Room A -150, room B -100: display 0, lamps `000`.\n4. Room A -200, room B -201: display 1, lamps `000`.\n\nThen answer five questions about your program's run on the whole machine, with room A at -184 and room B at -250. The answers come from the recorded run of your program, so they depend on how you wrote it: which registers, which order of operands, which addresses.\n\n1. Y, the ALU's output, paused before the ALU edge of your first set if, as a signed decimal number.\n2. COUT, the ALU's carry out, at that same moment: 0 or 1.\n3. MET, the branch condition, at that same moment: 0 or 1.\n4. ADDR, the address the memory reads, paused before the MEMORY edge of your first store, in hexadecimal.\n5. D of the PC's bit 4, paused before the WRITE edge of your first set if: 0 or 1.\n\nPress \"Run my program on the whole machine\" to trace it. The answers depend on your program; no two programs need give the same.",
  reflection:
    "You started in Module 0 with the machine as a box that runs lines of a program. You built every part: gates, adders, registers, memory, the ALU, the datapath, the control unit and the trap hardware, and you joined them. You can now follow a line of your own program down to a single gate, at any edge.\n\nWhich level was hardest to see through? Which level do you now use without thinking about the ones below it?",
  modelVsReality:
    "A real machine does things this one does not, and this course does not teach them. It starts the next instruction before the last has finished, so several are under way at once. It keeps copies of the memory it used last close to the datapath, since the memory is slow. Some instructions take many more edges than others.\n\nReal designs are also checked with a testbench: a text in the same language that drives the machine's inputs, waits, and prints what it sees. Below is a short one for the course's machine, to read.\n\n```systemverilog\nmodule machine_test;\n  logic CLK = 0, RST = 1, DOOR = 0, WARM = 0;\n  logic [63:0] SENSORA = -184, SENSORB = -250;\n  logic [63:0] PC, DISPLAY;\n  logic [2:0] S, LAMPS;\n  logic HALT;\n  logic [7:0] CAUSE;\n\n  machine m (.*);\n\n  always #5 CLK = ~CLK;\n\n  initial begin\n    #12 RST = 0;\n    wait (HALT);\n    $display(\"display %0d, lamps %b\", $signed(DISPLAY), LAMPS);\n    $finish;\n  end\nendmodule\n```\n\n`.*` joins each of the machine's ports to the wire of the same name. `always #5` turns the clock over every 5 units of simulated time. `initial` runs its lines once, from the start. `#12` waits 12 units, so the reset holds over the first rising edge. `wait (HALT)` waits until the machine halts. `$display` prints the display and the lamps.\n\nThe course's engine does not run this text. It describes a test, not hardware. Tools that simulate SystemVerilog run it. They would also need the text of each of the course's parts, which the course's engine builds itself, and the program in the ROM.",
  c1Hints: [
    "Write the program first and pass its four tests. Two set ifs, one for each room, each compared with -200, give two words, each 0 or 1.",
    "The count is the sum of the two words. ALARM is 1 when both are 1: the AND of the two, written to bit 0 of the lamps.",
    "For the first three questions, pause before the ALU edge of your first set if. Y and COUT leave the ALU in the datapath; MET leaves the condition block beside it.",
    "For the fourth, pause before the MEMORY edge of your first store. ADDR is the address the memory port reads; for a store it comes from HR, the address the ALU worked out.",
    'For the fifth, pause before the WRITE edge of your first set if. Show the PC\'s bit 4 from "Parts here that never open": D is bit 4 of the address the PC takes next.',
  ],
} as const;
