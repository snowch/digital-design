// Copyright © 2026 Christopher Snow

// The words of the lesson instructions.
//
// Drafted by the course's prose process from briefs of checked facts (docs/notes/module-8-datapath.md
// and its briefs), checked against the simulator, and placed here by the lesson's structure. Edit
// a fact here only after checking it; the lesson's facts test holds the numbers.

export const PROSE = {
  question:
    "Module 7 asked where the ALU's two input words come from, and where its Y and four flags go. The register file holds 16 words and gives two of them at once: QA and QB, chosen by the read addresses RA and RB. At a rising edge of CLK it writes the word on D into the register WA names, when WE is 1. Join them to the ALU: QA to A, QB to B, and the ALU's Y back to the register file's D. Then one edge can make a register take a word the ALU has worked out from two others, such as `R3 ← R1 - R2`. The circuit needs four numbers at each edge: the ALU's three-bit job code and three register addresses, 4 bits each. How does one word carry all four numbers to the parts that need them?",
  motivation:
    "The shop's office keeps room A's reading in R1 and room B's in R2: -184 and -250 tenths of a degree. Module 7's flags lesson subtracted them: -184 - (-250) = 66. The office will want many such jobs, one per edge, on different registers. The course's machine says what one edge does with an **instruction**: a 32-bit word. Its digits name the job and the registers.",
  prediction:
    'The figure joins the register file and the ALU. The bus IR carries `13123000`: kind 1 (a register job), job 3 (subtract), A is R1, B is R2, Y is R3. R1 holds -184, R2 holds -250, and every other register is X. WRITEY is the register file\'s write enable, set to 1 by hand here: on the next edge, the ALU\'s result goes into the register Y names. Choose an answer and press "Check my prediction". The "Clock edge" button appears after.',
  p1Question:
    "`13123000` is on IR and WRITEY is 1. R1 holds -184 and R2 holds -250. After one rising edge of CLK, what does R3 hold?",
  p1Explain:
    "R3 holds 66. Kind 1 is a register job; job 3 is subtract. A is R1, B is R2, Y is R3. So the edge does `R3 ← R1 - R2`, and -184 - (-250) = 66. Before the edge, the ALU worked out 66 on RESULT. The edge wrote it into R3, which was X. -434 is R1 + R2 (job 2); -66 is R2 - R1 (A and B the other way).",
  jobsLead:
    'The drawing shows IR coming in from the left. The block "digits" splits it into six fields: K, J, A, B, Y and C. It has no gates; each output is some of IR\'s wires. A, B and Y go to the register file\'s RA, RB and WA. J goes to a block marked "split", called jobBits, which gives J\'s four bits one by one. J\'s bits 2 to 0 go to the ALU\'s OP2, OP1 and OP0. K (the kind), J\'s bit 3 and C (the constant) go nowhere yet. QA and QB go to the ALU\'s A and B. The ALU\'s Y is the bus RESULT. It goes back to the register file\'s D and out at the right.\n\nThe register file, the ALU and the buses between them are the machine\'s **datapath**: the parts that hold words and work on them.\n\nChoose an instruction from the list. Press "Clock edge" for one rising edge; press WRITEY\'s pin to change it; press "Start again" to reset. Press any wire to see its name and value. 64-bit buses are too wide for the drawing; see the table "Buses". The table "Registers" shows R1 to R4 as hexadecimal words, read as signed, and marks "Written" where the last edge wrote.',
  jobsAfter:
    'Each result below is from Start again: R1 -184, R2 -250. R3 ← R1 - R2 writes 66 into R3. R3 ← R1 + R2 writes -434. R4 ← R2 writes -250 into R4. R1 ← R1 + 1 writes -183.\n\nWith WRITEY at 0, RESULT still shows 66, but the edge writes no register. QA, QB and RESULT change as soon as an instruction arrives. The edge only writes. Press "Clock edge" again and the instruction repeats: R1 ← R1 + 1 goes to -182, then -181.',
  construction:
    "The block \"digits\" is only wires. In SystemVerilog, a part select such as `IR[31:28]` names some of a bus's wires. You write an assignment like `assign K = IR[31:28];` to give K the instruction's leftmost digit. Bit 31 is IR's leftmost bit, and bit 0 its rightmost. The challenge below asks you to write the `digits` module.",
  writeDigitsLead: "Write the module that splits an instruction into its six fields.",
  c1Task:
    "Write a module called `digits`.\n\n- Input: IR, 32 bits.\n- Outputs: K, J, A, B and Y (each 4 bits) and C (12 bits).\n- Each output is a range of IR: K is bits 31 to 28; J is 27 to 24; A is 23 to 20; B is 19 to 16; Y is 15 to 12; C is 11 to 0.\n- The starting text provides the module's first lines and K's assignment. Replace the other five outputs, which are set to 0.\n- You may use `module`, ports, `logic`, multi-bit signals, `assign` and selects.\n- 9 tests check your code. Each gives IR one 32-bit word, named by that word's eight hexadecimal digits. One test, `FEDCBA98`, has every digit different.",
  c1Hints: [
    "Each field is a range of IR's bits. No gates are needed: each output is wires.",
    "A common mistake: counting from the left. Bit 31 is the leftmost bit, so `IR[3:0]` is the rightmost digit, not K.",
    "`assign J = IR[27:24];` gives J the second digit from the left.",
    "A is `IR[23:20]`, B is `IR[19:16]` and Y is `IR[15:12]`.",
    "The whole answer, as a code block:\n\n```\nassign K = IR[31:28];\nassign J = IR[27:24];\nassign A = IR[23:20];\nassign B = IR[19:16];\nassign Y = IR[15:12];\nassign C = IR[11:0];\n```",
  ],
  jobsFaultsLead:
    'This is the same datapath with two faults to choose from. Each holds a group of wires at 0.\n\n"The Y digit stuck at 0": the four wires from the `digits` block to the register file\'s write address (WA) are 0, whatever the instruction says.\n\n"OP0 stuck at 0": the wire from J\'s bit 0 to the ALU\'s OP0 is 0.\n\nTwo instructions to choose: `13123000` (R3 ← R1 - R2) and `12123000` (R3 ← R1 + R2). R1 holds -184 and R2 holds -250 as before. The table shows R0 to R3.\n\nChoose a fault and an instruction. Press the Clock edge button. Before you press, say which register the edge will write and what it will write.',
  jobsFaultsAfter:
    "A stuck digit changes which register the instruction names, or which job the instruction chooses.",
  jobsFaultY:
    "**The Y digit stuck at 0:** Every result goes into R0. `13123000` writes 66 into R0, and `12123000` writes -434 into R0. R3 stays X.",
  jobsFaultOp0:
    "**OP0 stuck at 0:** Subtract's code `011` becomes `010`, which is add. `13123000` writes -434 into R3, the same as `12123000`. Add's code already has OP0 at 0, so `12123000` still writes -434. That instruction cannot show this fault.",
  explanation:
    "One clock edge executes one instruction. The digits are wires from the `digits` block to the register file and ALU. The register file and the ALU work out RESULT before the edge, and the edge writes it.\n\nNo part moves a field. A, B and Y are the register file's two read addresses and its write address. J's low three bits become the ALU's code. The layout puts each field's wires where they need to go.\n\nWRITEY is a control signal: a single bit that tells the register file what to do at the next edge. Later lessons add instructions that write no register. For them, WRITEY is 0.\n\nIn the course's machine, another block works out WRITEY and the other control signals from K and J.",
  generalisation:
    "Every register job runs the same circuit. There are 8 ALU jobs and 16 choices for each of A, B and Y: 32,768 register jobs. One datapath does them all.\n\nSome jobs read only one input. Count up and count down read only A; copy B reads only B. The other register's digit is ignored, and the course writes 0 there.\n\nY may name the same register that A or B names. R1 ← R1 + 1 reads R1 before the edge and writes it at the edge, as every register transfer does.\n\nThe machine treats all 16 registers equally. R0 is a register like any other.",
  writeJobsLead:
    "Write the register jobs' datapath as text, using the course's own register file and ALU.",
  c2Task:
    "This challenge uses two modules. The first is `registers`, the register file of the drawing: it has read addresses RA and RB (4 bits each), a write address WA (4 bits), data D (64 bits), write enable WE and clock CLK; it gives QA and QB (64 bits each). The second is `alu`, Module 7's ALU at 64 bits: it takes A and B (64 bits each) and three job bits OP2, OP1, OP0; it gives Y, ZERO, MINUS, COUT and OVER.\n\nOne new thing: you put one module inside another. You write the module's name, a name for this use of it, and connect its ports by name. `registers regs (.RA(IR[23:20]), .WE(WRITEY), ...);` is an example: each `.PORT(signal)` joins the module's port to one of your signals. You do not have to use every output.\n\nYour module `jobs` has inputs CLK, IR (32 bits) and WRITEY, and one output, RESULT (64 bits). The starting text gives the module's first lines, declares QA and QB, uses the register file once (the use is called `regs`), and ends with `assign RESULT = QA;`.\n\nReplace that assignment. Use the ALU: connect A to QA and B to QB, connect the job code from IR's bits 26, 25 and 24 to OP2, OP1 and OP0, and connect the ALU's Y to RESULT. You take A, B and Y straight from IR's bits, which is what the digits block does: wires.\n\nYou can use what the digits challenge used, plus one module inside another.\n\nThe tests are 10 steps. R1 starts at -184, R2 at -250, and every other register at X. Each step sets IR, WRITEY and CLK and checks RESULT. One step changes IR while the clock is high; the next checks that no register was written then. One step makes an edge with WRITEY at 0.",
  c2Hints: [
    "RESULT is the ALU's Y. Use the ALU once and connect each of its inputs.",
    "A common mistake: giving the ALU's code J's top three bits, `IR[27:25]`. The code is J's bits 2 to 0: `IR[26]`, `IR[25]` and `IR[24]`.",
    "`alu alu1 (.A(QA), ...);` uses the ALU and names this use alu1.",
    "Connect `.A(QA)`, `.B(QB)` and `.Y(RESULT)`, then the three code bits.",
    "The whole answer: replace `assign RESULT = QA;` with\n\n```\nalu alu1 (.A(QA), .B(QB), .OP2(IR[26]), .OP1(IR[25]), .OP0(IR[24]), .Y(RESULT));\n```",
  ],
  reflection:
    "The register file and the ALU, joined, make a datapath. An instruction's digits are wires to its parts. One edge does one instruction, and writes its result when WRITEY is 1.\n\nEvery instruction so far works on registers alone, and R1 and R2 started with words the lesson gave them. The shop needs numbers that no register holds yet: the limits it checks the rooms against, the number of seconds in a minute. How can an instruction carry a number of its own to the ALU?",
  modelVsReality:
    "The simulator shows a register no edge has written as X. The lesson set R1 and R2 for you. A real register file at power-on holds 0s and 1s nobody chose.\n\nIn this model the register file and the ALU settle in steps, and an edge takes no time. In a real datapath, the next edge must wait for the slowest path: the register file's read, the ALU's carry through 64 bits, and back to D, with the setup time (Module 4) before the edge.\n\nYou set WRITEY by hand here. In the course's machine, a block works it out from K and J; a later module builds that block's insides.",
  fieldsLead:
    "The figure cuts one instruction into its six fields, from bit 31 to bit 0 in order. Each box shows the field's letter, its bits, digit(s), binary bits in groups of four, its value where that says more than the digits (register as R1, R2...; constant read signed), and what it does. The six fields are in the same place in every instruction. Choose one of the four instructions to compare them.",
} as const;
