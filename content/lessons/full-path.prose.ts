// Copyright © 2026 Christopher Snow

// The words of the lesson full-path.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-13-machine/briefs, briefs 2A to 2C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    'Lesson 1 ended on a question: can you watch one line of the shop\'s program at every level at once, from the line to the gates, edge by edge? When the course began, it set out a final demonstration: a program → its assembly → its machine words → fetch → decode → register read → ALU or memory → register write → PC update → next instruction, and it was to be "pausable and inspectable at every step." This figure is that demonstration, run on the whole machine. You can stop at any edge, step back, and open any part of the drawing. Its table shows the instruction at every level, edge by edge, from the line to the control signals. Every level shows the same edge.',
  wholeLead:
    'Press "Next edge" a few times and watch the table and the drawing change together, then press "Run to the end".',
  wholeAfter:
    "The run stops at `030`, at `stop`, after 69 edges. The display shows 66, the gap between the rooms, and the lamps show `000`: CLASH is off, since room A is less than 10.0 degrees warmer.",
  motivation:
    "Each level shows the same instruction in its own form. The first form is the line of text, such as `R5 <= R3 >= R4 signed`. An assembler, which is a program, turns each line into a 32-bit instruction before the machine runs. Here the line becomes `A7345000`. The words the assembler makes from the lines are the form the machine runs. They are the program's **machine code**. The ROM holds the shop's program as machine code, and the machine never sees the lines.\n\nThe IR holds the instruction being run. Its eight hexadecimal digits are its fields: K, J, A, B, Y and the constant. In `A7345000`, K is A, which is set if. J is 7, which is not less, read signed. A is R3, B is R4 and Y is R5. The constant `000` is unused.\n\nThe decoder turns the fields into control signals. For set if, OP2, OP1 and OP0 are `011`, which subtracts. WRITEY is 1, and SET is 1.\n\nThe controller's state says which step the next edge makes. Each stage of the demonstration happens at one of these points:\n\n- fetch: the FETCH edge, where the IR takes the word;\n- decode: the gates of the decoder, from the moment the IR holds the word; it takes no edge of its own;\n- register read: the READ edge, where HA and HB take registers A and B;\n- ALU: the ALU edge, where HR takes the result;\n- memory: the MEMORY edge, for a load or a store;\n- register write: the WRITE edge, where the register Y names takes its word;\n- PC update: the instruction's last edge, where the PC takes its next value; then the next instruction's FETCH.\n\nNot every instruction passes every state. `R5 <= R3 >= R4 signed` takes FETCH, READ, ALU and WRITE: four edges, and no MEMORY.",
  prediction:
    'The figure is stopped after 25 edges. The next edge is the FETCH edge of `R5 <= R3 >= R4 signed`, at `018`. No value shows until you commit. Work the word out from the line\'s fields, then choose an answer and press "Check my prediction".',
  p1Question: "What word will the IR hold after the next edge?",
  p1Explain:
    'The IR takes `A7345000`: kind A (set if), job 7 (not less, signed), A is R3, B is R4, Y is R5, and the constant `000`. `A7435000` swaps the two registers read, so it would test R4 against R3. `57345000` is kind 5, a branch. It compares but writes no register. `25004064` is the word the IR holds now, the word for `R4 <= 100`; the IR keeps it until the FETCH edge. To check, press "Next edge" and read the row "The word in the IR".',
  investigation:
    "The figure starts after edge 56. The next edge fetches `call system`, at `03C`. It shows the control registers, C0 to C4, too. Follow the system call at every level, then the handler's first edge.",
  callLead:
    '1. Press "Next edge" once and read the row "The word in the IR" and its fields.\n2. Read the controller\'s state, TRAP and the line under the buttons.\n3. Press "Next edge" again and read the PC and the control registers.',
  callAfter:
    "At edge 57, the FETCH edge, the IR takes `80000000`, the machine code of `call system`. K is 8, a system job; J is 0, `call system`; every other field is 0. The controller's next state is READ, and TRAP is 1. The decoder has given cause `41`, and the trap logic has set TRAP, so the line under the buttons says the next edge traps, with cause `41`. At edge 58 the PC takes `044`, the handler's address from C4. C3 takes `41`, and C2 takes `040`, the line after the call. The state goes to FETCH. Every level agreed at every edge. The line said `call system`, the word said kind 8, job 0, the signals trapped, and the control registers took the trap's words.",
  construction:
    "Work out one store at every level before you run it: `word[lamps] <= R5`, at `024`, edges 38 to 41.\n\n1. Its machine code is `480507C8`: K 4, a store; J 8, an address given by the constant alone; A 0, unused; B 5, the register stored; Y 0, unused; the constant `7C8`, the lamps' address.\n2. Edge 38, FETCH: the IR takes `480507C8`.\n3. Edge 39, READ: HB takes R5, which holds 0.\n4. Edge 40, ALU: OP2 OP1 OP0 are `010`, add; the ALU adds 0 and the constant, and HR takes `7C8`.\n5. Edge 41, MEMORY: ADDR carries `7C8`, MSTORE is 1, and the lamps take `000`. PCEN is 1 too: a store ends at its MEMORY edge, and the PC takes `028`.",
  storeLead:
    'Press "Next edge" four times and check each step of the list against the table and the drawing.',
  failureExperiment:
    "Every level agrees in a healthy machine, because they are one circuit seen at different sizes. The figure lets you break one control signal inside the decoder. The line and its machine code stay right, but the machine does something else. Under the drawing, the figure compares the machine with the instruction-level model after every instruction and every trap. It names the first place they disagree. There are two faults. The first holds BCONST at 1, so the ALU's B input always takes the constant. The second holds SET at 0 in the control unit. SET is kind A's line in the decoder.",
  faultsLead:
    'Choose a fault, predict which line first goes wrong, then press "Run to the end" and read the comparison.',
  faultBconst:
    "With BCONST held at 1, the loads still work, because a load takes the constant as B anyway. The first disagreement is `R3 <= R1 - R2`, at `010`. R3 is -184 on the machine and 66 by the model. The ALU took the constant, 0, in place of R2. The run still stops, showing 0 on the display.",
  faultSet:
    "With SET held at 0 in the control unit, the decoder has no line for kind A, set if. It refuses `R5 <= R3 >= R4 signed` as an illegal instruction, cause `21`, and the machine goes to the handler. The comparison shows that after that line, at `018`, the PC is `044` on the machine and `01C` by the model. The handler shows R2 on the display, which is -250. It resumes at the refused line, which traps again, over and over. The run is cut off after 300 edges.",
  explanation:
    "The levels agree because they are one machine. The line is the only level outside the circuit. The assembler turned it into machine code before the run began.\n\nFrom the word down, every level reads the same wires of the same circuit at the same edge. The table's fields are the IR's bits, read in groups of four. The control signals are the decoder's outputs. The values on the drawing, at every level you open, come from the circuit itself.\n\nSo a level cannot show a different value from the one below it. A level can only leave things out. The table shows six signals of the decoder's many. The top of the drawing shows three blocks, not their gates.\n\nWhen the machine goes wrong, the levels still agree with each other. What disagrees is the machine and the instruction-level model. The comparison names the first instruction where they part. The levels show where. With BCONST held at 1, the word said R2, the signal said the constant, and the ALU did what the signal said.",
  generalisation:
    'Every program reaches a machine as machine code. Whatever language it was written in, the machine runs words like `A7345000`.\n\nEach stage of the demonstration is a state of the controller, or the decoder\'s gates between two edges. The stages are: fetch, decode, register read, ALU, memory, register write and PC update.\n\n"Inspectable at every step" means more than seeing the registers. The drawing shows any wire, at any edge, at any level.\n\nThe next lesson uses this to follow one value of your own choosing down to a single gate.',
  answersLead: "Work out the first answer, read the rest off the figure, then run the tests.",
  c1Task:
    "1. Work out, without running anything: the machine code of `R5 <= R3 < R4 signed`, as eight hexadecimal digits. It is not a line of the shop's program. Set if's job 6 is less, read signed.\n2. Use any figure on this page for the line `R2 <= R3`, at `038`:\n   - how many edges it takes, from its FETCH edge to its last;\n   - the ALU's job at its ALU edge, by OP2 OP1 OP0: add, subtract, copy B or OR;\n   - the word register Y takes at its WRITE edge, as a decimal number;\n   - the PC after its last edge, as three hexadecimal digits.\n3. There are 5 tests, one for each answer.",
  c1Hints: [
    'The idea: a word\'s eight digits are its fields in order: K, J, A, B, Y, then three digits of constant. The other answers are in the table "The instruction at every level", at the right edges.',
    "A common mistake: reading the table one edge early. The row of control signals shows the signals at the next edge, the one the state names.",
    "A smaller example: `R4 <= 100` is `25004064`: kind 2, job 5, A 0, B 0, Y 4, constant `064`.",
    "Part of the answer: set if is kind A. `R2 <= R3` is a register job, kind 1 job 5. So it takes the states of a register job.",
    "The whole answer: `A6345000`; 4 edges; copy B; 66; `03C`.",
  ],
  reflection:
    "You have watched one line at every level at once. You have seen why the levels agree: they are one circuit.\n\nThe figures chose what to show. The table shows six signals. The drawing opens where you press.\n\nThe next lesson asks one question: can you follow one value of your own choosing, at an edge of your own choosing, from a line of the program down to one gate?",
  modelVsReality:
    "This machine's memory answers within one edge. A real machine's memory is far slower than its CPU.\n\nSo a real machine keeps copies of recently used words. It keeps them in small, fast memories beside the CPU. It goes to the main memory only when a copy is missing.\n\nNothing of this is taught here. It is named so you know where this machine stops being like a real one.",
} as const;
