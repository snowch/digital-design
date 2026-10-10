// Copyright © 2026 Christopher Snow

// The words of the lesson tracing.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-13-machine/briefs, briefs 3A to 3C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  pcAfter:
    "1. The PC's bit 3, as Module 5's register bit with a reset: D is 0, EN is 1, RST is 0, and the flip-flop holds 1. The PC holds `02C`, whose bit 3 is 1, and takes `034`, whose bit 3 is 0.\n2. D comes from `nextTrap`: its two selectors both choose their first input, since TRAP is 0 and RESUME is 0.\n3. That input comes from `next`: `pickJump` chooses RESULT, because JUMP is 1 for a call through a register.\n4. RESULT is the ALU's output: R6 plus the constant 0, `034`.",
  c1Whole: "The four rows, in the order of the answer boxes, are {answers}.",
  question:
    "Module 0's second lesson followed one line of a program down to one wire. It passed through nine levels, each named with the module that builds it, on a path chosen for you. Lessons 1 and 2 showed every level of the whole machine at one edge.\n\nThis lesson asks a question of its own. Can you follow one value of your own choosing, at an edge of your own choosing, from a line of the program down to one gate?\n\nThe figure is paused before edge 54, the READ edge of `R2 <= R3`. Choose any other edge from the strip under the buttons.",
  freeLead:
    "Open the datapath, then the ALU, and keep opening blocks; watch the table of levels grow.",
  motivation:
    "Following one value from a line of the program, through every level, down to one gate is a **trace**. The figure gives you four tools for making one.\n\n- The strip under the buttons pauses the run before any edge of any line.\n- A wire you press stays pinned. It is marked wherever it is drawn as you open blocks, and its value shows under the drawing.\n- The table of the levels you have opened records each block, its maker and its ports' values at that edge.\n- The list \"Parts here that never open\" opens the parts the simulator runs whole.\n\nThose parts are the register file, the memory, the PC, the IR, the held words, the control registers, the controller's state register, and the selectors and adders that take a whole word. Each shows one bit, drawn as the module that built that kind of part drew one bit. A register's bit is drawn as Module 5 drew it. The register file's bit is drawn as one register's bit, Module 5's. A bit of a byte of the RAM is drawn as a register's bit, Module 5's. A selector's bit is drawn as Module 3 drew it, and an adder's as Module 3's full adder. Each part's inputs carry the machine's own values at that edge.\n\nA part that only splits a word into its bits or joins bits into a word has no gate. The list of parts that never open says so, and the trace passes through it.",
  prediction:
    'The figure is paused before edge 28, the ALU edge of `R5 <= R3 >= R4 signed`. HR holds 100, the last result, until that edge. The ALU works out 66 minus 100. No value shows until you commit. Choose an answer and press "Check my prediction".',
  p1Question: "After the next edge, what does bit 1 of HR hold?",
  p1Explain:
    "Bit 1 of HR holds 1. 66 minus 100 is -34, which in binary ends `1101 1110`: bit 1 is 1.\n\nHR, drawn as `heldR`, never opens. In \"Parts here that never open\", at the datapath's level, HR shows its bit 1 as Module 5's register bit. D is 1, and EN is 1, since this is the ALU edge. The flip-flop holds 0, which is bit 1 of 100. After the edge it holds 1.\n\nThe investigation follows this bit's 1 back into the ALU, to the gate that makes it.",
  investigation:
    "Trace bit 1 of the ALU's result at edge 28, the same edge as the prediction. Start at the datapath and go down to one gate. Module 0's ladder took you down the same way, one level at a time, on a path chosen for you. Here you open each block yourself.",
  sumLead:
    "1. Open `datapath`, then `alu`, then `g0`, then `q0`, then `bit1`: the slice for bit 1, Module 7's.\n2. Open `fa`, Module 3's full adder, then `ha2`, the half adder that makes the sum.\n3. Read the output of the XOR gate in `ha2`, `xorSum`, and the last row of the table of levels.",
  sumAfter:
    "Work down from the top. The datapath comes first, from Module 8. Inside it, the ALU from Module 7 gives RESULT, which is `FFFFFFFFFFFFFFDE`, or -34. Inside the ALU are a group of 16 bits, `g0`, and within that a group of 4, `q0`. The slice for bit 1 is `bit1` inside its group of four. It holds the full adder `fa` from Module 3, and that holds the half adder `ha2`, also from Module 3.\n\nThe 1 you followed is bit 1 of RESULT on the datapath, and bit 1 of each group's result inside the ALU. At the bottom, one wire is left. The XOR gate `xorSum` gives SUM, and SUM is 1.\n\nThe names start again in each group. Bit 6 of the word is `bit2` in group `q1`.",
  construction:
    "The figure is paused before edge 48, the WRITE edge of `call R6, R15` at `02C`. Trace the PC's bit 3 through this call. Show the PC's bit 3, from \"Parts here that never open\": what are D, EN and RST, and what does the flip-flop hold? D comes from `nextTrap`, Module 12's choice of the next PC. Open it. Which input do its two selectors choose, and why? That input comes from `next`, which Module 8 built. Open it. What does `pickJump` choose? Where does that value come from, and what is it?",
  pcLead:
    "Show the PC's bit 3, then follow its D input back through `nextTrap` and `next` to the ALU.",
  failureExperiment:
    "The figure holds one wire in the ALU at 0. Its label does not say which one. Under the drawing, the comparison with the instruction-level model names the first instruction that disagrees. Trace down from that wrong result to the wire that is held. Read the result's bits against the model's, and open the ALU along the bits that differ.",
  faultLead: 'Choose the fault, press "Run to the end", read the comparison, then trace.',
  faultAlu:
    "After `R3 <= R1 - R2` at `010`, R3 is 50 on the machine and 66 by the model. 66 is `0100 0010` in binary, and 50 is `0011 0010`. Bits 3 to 0 agree, and bits 6 to 4 differ.\n\nSo the fault is where bits 7 to 4 are worked out, or what they take in. The trace goes from `datapath` to `alu` to `g0`. There the carry into the group for bits 7 to 4, `C4`, from the group for bits 3 to 0, is drawn held at 0.",
  explanation:
    "Each level of a trace hides the level below it. The datapath's drawing shows the ALU as one block with words on its ports. Inside it are 64 slices, one for each bit, and the drawing hides them. A slice hides the gates of its full adder. HR hides its 64 flip-flops behind one word.\n\nThe level above can ignore what is hidden, because the block's ports carry all it needs. The ALU's output is the result, whatever gates made it. Each block was tested on its ports in the module that built it, so the level above can trust those ports.\n\nHiding a level's inside behind what its ports do, so that the level above can use it as a box, is **abstraction**.\n\nModule 0 ended on this: each module builds one level from the one below, then uses it as a box. A trace goes the other way. It opens the boxes.\n\nA trace is how you find a fault. The comparison with the instruction-level model names the instruction. The value's bits name the slice. The drawing names the wire.",
  generalisation:
    "Every machine is built in levels, each a box over the one below. No one works on all the levels at once. A program uses instructions, an instruction uses blocks, and a block uses gates.\n\nThe boxes make a machine possible to build and to understand. They also hide a fault until you open them.\n\nA trace can start anywhere: a wrong value on the display, in a register, or on a lamp. Here it ends at a gate or a flip-flop, because the drawing of one bit opens no further. Module 4 opened the flip-flop itself into gates.",
  answersLead: "Use the figure under the challenge to trace each value, then run the tests.",
  c1Task:
    "1. Each answer is a row of bits, the highest bit first, read at a named edge of a line of the shop's program. Use the figure under the challenge: pause at the edge, then trace. Set each bit with its button.\n2. At the ALU edge of `R3 <= R1 - R2`, at `010`, in the ALU's group `q0` (the slices for bits 3 to 0):\n   - the output of the XOR gate `xorB` in each slice, bits 3 to 0 (it turns B's bit over for a subtraction);\n   - the carry out of each slice's full adder, bits 3 to 0.\n3. At the ALU edge of `goto R15`, at `040`: D of the PC's bits 5 to 2, as Module 5's drawing shows them. `goto R15` takes FETCH, READ and ALU, and the PC takes its next value at the ALU edge.\n4. At the WRITE edge of `R5 <= R3 >= R4 signed`, at `018`: EN of bit 0 of each of R7 to R0, as the register file's bit shows it.\n5. There are 4 tests, one for each row.",
  c1Hints: [
    "The idea: choose the edge from the strip under the buttons. Then open blocks until the wire is on the drawing. For a part that never opens, press its button and choose the bit.",
    "A common mistake is to pause at the wrong edge of a line. A line's edges run in order from its FETCH edge, and for a register job the ALU edge is the third. Another mistake is to write a row lowest bit first.",
    "A smaller example, with no part of the task: at the ALU edge of `R5 <= R3 >= R4 signed`, SUM in the slice for bit 1 gives 1, as the investigation found.",
    "Part of the answer: the register file writes one register at an edge, and EN is 1 only for the register that Y names. At the ALU edge of `R3 <= R1 - R2`, B holds R2, -250, whose bits 3 to 0 are `0110` before the XORs turn them over.",
    "The whole answer: 0, 1, 0, 1, 0, in the order of the list.",
  ],
  reflection:
    "You can now follow any value, at any edge, from a line of the program down to a gate or a flip-flop, and say what each level hides.\n\nEvery part you traced was the course's own, and so were the joins between them.\n\nThe next lesson asks: can you join the parts into the whole machine yourself, so that it runs the shop's programs as the model does?",
  modelVsReality:
    "On this machine every instruction takes at most five edges, one edge per state of the controller. A real CPU takes many edges for some instructions: a multiplication, a division, or a word that must come from far away in memory. Its controller waits, edge after edge, until the part is done. Nothing of this is taught here. It is named so you know where this machine stops being like a real one.",
} as const;
