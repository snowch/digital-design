// Copyright © 2026 Christopher Snow

// The words of the lesson tracing.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-13-machine/briefs, briefs 3A to 3C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Module 0's second lesson followed one line of a program down to one wire. It passed through nine levels, each named with the module that builds it, and the path was chosen for you. Lessons 1 and 2 of this module showed every level of the whole machine at one edge. This lesson asks whether you can do it yourself. Can you follow one value of your own choosing, at an edge of your own choosing, from a line of the program down to one gate? The figure is paused before edge 28, the ALU edge of `R5 <= R3 >= R4 signed`. The ALU works out R3 minus R4, which is 66 minus 100.",
  freeLead:
    "Open the datapath, then the ALU, and keep opening blocks; watch the table of levels grow.",
  motivation:
    "A **trace** follows one value down from a line of the program, through every level, to one gate. This lesson lets you run one yourself. The figure gives you three tools:\n\n- \"Pause before an edge\" chooses any line of the program and any of its edges.\n- The table of levels records each block you open, with its maker and the values on its ports at that edge. You see the value you follow enter and leave each level.\n- \"Parts here that never open\" opens the parts the simulator runs whole.\n\nThose parts are the register file, the memory, the PC, the IR, the held words, the control registers and the controller's state register. They also include the selectors and adders that take a whole word at once. Each one shows a single bit, drawn as the module that built it drew that bit. A register's bit is Module 5's. The register file's bit is one register's bit. A bit of a byte of the RAM is a register's bit. A selector's bit is Module 3's, and an adder's bit is Module 3's full adder. Its inputs carry the machine's own values at that edge.\n\nSo every trace ends at a gate or at a flip-flop. A part that only splits a word into its bits or joins bits into a word has no gate. The list says so, and the trace passes through it.",
  prediction:
    'The figure is paused before edge 28, the ALU edge of `R5 <= R3 >= R4 signed`. HR holds 100, the last result, until that edge. The ALU works out 66 minus 100. No value shows until you commit. Choose an answer and press "Check my prediction".',
  p1Question: "After the next edge, what does bit 1 of HR hold?",
  p1Explain:
    "Bit 1 of HR holds 1. 66 minus 100 is -34, which in binary ends `1101 1110`: bit 1 is 1.\n\nHR never opens. In \"Parts here that never open\", at the datapath's level, HR shows its bit 1 as Module 5's register bit. D is 1, and EN is 1, since this is the ALU edge. The flip-flop holds 0, which is bit 1 of 100. After the edge it holds 1.\n\nThe investigation follows this bit's 1 back into the ALU, to the gate that makes it.",
  investigation:
    "Trace bit 1 of the ALU's result at edge 28, the same edge as the prediction. Start at the datapath and go down to one gate. Module 0's ladder took you down the same way, one level at a time, on a path chosen for you. Here you open each block yourself.",
  sumLead:
    "1. Open `datapath`, then `alu`, then `g0`, then `q0`, then `bit1`: the slice for bit 1, Module 7's.\n2. Open `fa`, Module 3's full adder, then `ha2`, the half adder that makes the sum.\n3. Read the output of the XOR gate in `ha2`, `xorSum`, and the last row of the table of levels.",
  sumAfter:
    "The levels, from the top, are the datapath (Module 8), then the ALU (Module 7). Its output Y is `FFFFFFFFFFFFFFDE`, -34. Inside the ALU come its group of 16 bits, `g0`, and its group of 4, `q0`, then the slice for bit 1, the full adder `fa` (Module 3), and its half adder `ha2` (Module 3). Each level's output carries the same 1 in bit 1, in its own form: a hexadecimal digit of the word at the top, one wire at the bottom. At the bottom, the XOR gate `xorSum` gives SUM, 1. The slice for bit 1 is called `bit1` inside its group of four. Further up the word, the names start again in each group: bit 6 of the word is `bit2` in group `q1`.",
  construction:
    "The figure is paused before edge 48, the WRITE edge of `call R6, R15` at `02C`, so you can trace the PC through that call.\n\n1. The PC never opens. In \"Parts here that never open\", at the datapath's level, it shows bit 3 as Module 5's register bit with a reset: D is 0, EN is 1, RST is 0, and the flip-flop holds 1. The PC holds `02C`, whose bit 3 is 1, and takes `034`, whose bit 3 is 0. After the edge the bit holds 0.\n2. D comes from `nextTrap`, Module 12's choice of the next PC. Open it: its two selectors, Module 3's, both choose their first input. TRAP is 0 and RESUME is 0.\n3. That input comes from `next`, which Module 8 built. Open it: the selector `pickJump` chooses RESULT, because JUMP is 1 for a call through a register.\n4. RESULT is the ALU's output: R6 plus the constant 0, which is `034`.",
  pcLead:
    "Show the PC's bit 3, then follow its D input back through `nextTrap` and `next` to the ALU.",
  failureExperiment:
    "The figure holds one wire in the ALU at 0. Its label does not say which. Under the drawing, the comparison with the instruction-level model names the first instruction that disagrees. Trace down from that wrong result to the wire that is held. Start from the display and the comparison, read the result's bits, and open the ALU along the bit that differs.",
  faultLead: 'Choose the fault, press "Run to the end", read the comparison, then trace.',
  faultAlu:
    "The comparison says that after `R3 <= R1 - R2` at `010`, R3 is 64 on the machine and 66 by the model. The display shows 64. 66 is `42` in hexadecimal and 64 is `40`, so only bit 1 differs. The trace goes from `datapath` to `alu`, `g0`, `q0` and then `bit1`. There the wire SUM, out of the full adder, is drawn held at 0 while the full adder gives 1. Every other instruction that uses the ALU's bit 1 adds or subtracts wrongly whenever that bit should be 1.",
  explanation:
    "Each level of a trace hides the level below it. The datapath's drawing shows the ALU as one block with words on its ports. Inside it are 64 slices, one for each bit, and the drawing hides them. A slice hides the gates of its full adder. HR hides its 64 flip-flops behind one word.\n\nThe level above can ignore what is hidden, because the block's ports carry all it needs. The ALU's output is the result, whatever gates made it. Each block was tested on its ports in the module that built it, so the level above can trust those ports.\n\nHiding a level's inside behind what its ports do, so that the level above can use it as a box, is **abstraction**.\n\nModule 0 ended on this: each module builds one level from the one below, then uses it as a box. A trace goes the other way. It opens the boxes.\n\nA trace is how you find a fault. The comparison with the instruction-level model names the instruction. The value's bits name the slice. The drawing names the wire.",
  generalisation:
    "Every machine is built in levels, each a box over the one below. No one works on all the levels at once. A program uses instructions, an instruction uses blocks, and a block uses gates.\n\nThe boxes make the machine possible to build and to understand. They also hide a fault until you open them.\n\nA trace can start anywhere: a wrong value on the display, in a register, or on a lamp. It ends at a gate or a flip-flop, the lowest level this course builds. Below them, Module 1 showed voltages.\n\nThe next lesson has you build a level yourself: the whole machine, from its parts, written as text.",
  answersLead: "Use the figure under the challenge to trace each value, then run the tests.",
  c1Task:
    "1. Each answer is a single bit, 0 or 1, read at a named edge of a line of the shop's program. Use the figure under the challenge: pause at the edge, then trace.\n2. At the ALU edge of `R3 <= R1 - R2`, at `010`:\n   - the output of the XOR gate `xorB` in the ALU's slice for bit 2 (it turns B's bit over for a subtraction);\n   - SUM out of the full adder in the slice for bit 1.\n3. At the WRITE edge of `call R6, R15`, at `02C`: D of the PC's bit 3, as Module 5's drawing shows it.\n4. At the WRITE edge of `R5 <= R3 >= R4 signed`, at `018`: EN of R5's bit 0, and EN of R4's bit 0, as the register file's bit shows them.\n5. There are 5 tests, one for each answer.",
  c1Hints: [
    'The idea: use "Pause before an edge" to choose the edge, and press "Go there". Then open blocks until the wire is on the drawing. For a part that never opens, press its button and choose the bit.',
    "A common mistake is to pause at the wrong edge of a line. The edges of a line are listed in order, starting from its FETCH edge. For a register job, the ALU edge is the third.",
    "A smaller example: at the ALU edge of `R5 <= R3 >= R4 signed`, SUM in the slice for bit 1 gives 1, as the investigation found.",
    "Part of the answer. The register file writes one register at an edge: EN is 1 only for the register that Y names. At the ALU edge of `R3 <= R1 - R2`, B holds R2, which is -250. So B's bit 2 is 1 before the XOR turns it over.",
    "The whole answer: 0, 1, 0, 1, 0, in the order of the list.",
  ],
  reflection:
    "You can now follow any value, at any edge, from a line of the program down to a gate or a flip-flop. You can say what each level hides. Every part you traced was the course's own, and so were the joins between them. The next lesson's question is this: can you join the parts into the whole machine yourself, so that it runs the shop's programs as the model does?",
  modelVsReality:
    "On this machine every instruction takes at most five edges, one edge per state of the controller. A real CPU takes many edges for some instructions: a multiplication, a division, or a word that must come from far away in memory. Its controller waits, edge after edge, until the part is done. Nothing of this is taught here. It is named so you know where this machine stops being like a real one.",
} as const;
