// Copyright © 2026 Christopher Snow

// The words of the lesson full-path.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-13-machine/briefs, briefs 2A to 2C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  storeAfter:
    "1. Its machine code is `480207C0`: K 4, a store; J 8, an address given by the constant alone; A 0, unused; B 2, the register stored, R2; Y 0, unused; the constant `7C0`, the display's address.\n2. Edge 59, FETCH: the IR takes `480207C0`.\n3. Edge 60, READ: HB takes R2, which holds 66.\n4. Edge 61, ALU: OP2 OP1 OP0 are `010`, add; the ALU adds 0 and the constant, and HR takes `7C0`.\n5. Edge 62, MEMORY: ADDR carries `7C0`, MSTORE is 1, and the display takes 66; it showed 0 before. PCEN is 1 too: a store ends at its MEMORY edge, and the PC takes `048`.",
  question:
    "Lesson 1 ended on a question: \"Can you watch one line of the shop's program at every level at once, from the line to the gates, edge by edge?\"\n\nThis figure runs the shop's program on the whole machine, with every level at once. You can pause at any edge and step back. Its table shows the instruction at every level, from the line to the control signals. Every level shows the same edge.\n\nSome blocks open when you press them, such as the control unit, the datapath and the ALU. Some parts are drawn as blocks but run whole here, and do not open, such as the PC, the IR, the register file and the held words. The next lesson shows each of those as one bit. Press a row's name in the table to pin the wire it reads on the drawing.",
  wholeLead:
    'Press "Next edge" a few times and watch the table and the drawing change together, then press "Run to the end".',
  wholeAfter:
    "The run stops at `030`, at `stop`, after 69 edges. The display shows 66, the gap between the rooms, and the lamps show `000`: CLASH is off, since room A is less than 10.0 degrees warmer.",
  motivation:
    "Each level shows the same instruction in its own form. The first form is the line of text, such as `R3 <= R1 - R2`. An assembler is a program. It turns each line into a 32-bit instruction before the machine runs. In this example, the line becomes `13123000`.\n\nYou have seen these words since Module 8: in the ROM, and in the IR. The words the assembler makes from the lines, the form the machine runs, are called **machine code**. The ROM holds the shop's program as machine code. The machine never sees the lines.\n\nThe IR holds the instruction being run. Its eight hexadecimal digits are its fields: K, J, A, B, Y and the constant. In `13123000`, K is 1, a register job. J is 3, subtract. A is R1, B is R2 and Y is R3. The constant `000` is unused.\n\nThe decoder turns the fields into control signals. For a subtraction, OP2, OP1 and OP0 are `011`. WRITEY is 1, and SET is 0.\n\nThe controller's state says what the next edge does. Each stage of an instruction happens at one of these points:\n\n- fetch: the FETCH edge, where the IR takes the word;\n- decode: the gates of the decoder, from the moment the IR holds the word; it takes no edge of its own;\n- register read: the READ edge, where HA and HB take registers A and B;\n- ALU: the ALU edge, where HR takes the result;\n- memory: the MEMORY edge, for a load or a store;\n- register write: the WRITE edge, where the register Y names takes its word;\n- PC update: the instruction's last edge, where the PC takes its next value; then the next instruction's FETCH.\n\nNot every instruction passes every state. `R3 <= R1 - R2` takes FETCH, READ, ALU and WRITE: four edges, and no MEMORY.",
  prediction:
    'The figure is paused after 25 edges. The next edge is the FETCH edge of `R5 <= R3 >= R4 signed`, at `018`.\n\nNo value shows until you commit. Work the word out from the line\'s fields, then choose an answer and press "Check my prediction".',
  p1Question: "What word will the IR hold after the next edge?",
  p1Explain:
    "The IR takes `A7345000`: kind A (set if), job 7 (not less, signed), A is R3, B is R4, Y is R5, and the constant `000`. `A7435000` swaps the two registers read, so it would test R4 against R3. `57345000` is kind 5, a branch: it compares but writes no register. `25004064` is the word the IR held before the edge, the word for `R4 <= 100`; the IR kept it until the FETCH edge.",
  investigation:
    "The figure is paused after edge 56. The next edge fetches `call system`, at `03C`. It shows the control registers, C0 to C4, too.\n\nLesson 1 followed this system call across the joins. Here, follow it through the levels: the word and its fields, the control signals, and the control registers, at its two edges.",
  callLead:
    '1. Press "Next edge" once. Read the row "The word in the IR" and its fields, and find K and J.\n2. Read the controller\'s state, TRAP, and the line under the buttons: what will the next edge do?\n3. Press "Next edge" again. Read the row "Address", and the control registers C2 and C3.',
  callAfter:
    "At edge 57, the FETCH edge, the IR takes `80000000`, the machine code of `call system`. K is 8, a system job. J is 0, `call system`. Every other field is 0.\n\nThe decoder gives cause `41` from those fields, and the trap logic sets TRAP. The line under the buttons says the next edge traps, with cause `41`.\n\nAt edge 58 the row \"Address\" shows `044`, the handler's address the PC took from C4. C3 holds `41`, and C2 holds `040`, the line after the call.\n\nWhat each level added: the word gave the kind and the job. The decoder and the trap logic turned them into TRAP and a cause. The control registers kept the trap's words.",
  construction:
    "Work out one store at every level before you run it: `word[display] <= R2`, at `044`, the handler's store, from edge 59 to edge 62.\n\nWhat is the machine code of this store? Give the fields K, J, A, B, Y and the constant of a store whose address is a constant.\n\nAt edge 59, FETCH: what does the IR take?\n\nAt edge 60, READ: which register does HB take?\n\nAt edge 61, ALU: what job do OP2, OP1 and OP0 give, and what does HR take?\n\nAt edge 62, MEMORY: what does ADDR carry, which signal writes, and what does the display show after? Which register takes its next value at this edge?",
  storeLead:
    "Work each step out first. Then press \"Next edge\" five times. The first press runs edge 58, the system call's trap. The next four run the store, edges 59 to 62. Check each step against the table, the drawing and the display. The row \"Its word in the ROM\" shows the store's word after the first press.",
  failureExperiment:
    "The figure lets you break one control signal inside the decoder. The line and its machine code stay right, but the machine does something else.\n\nUnder the drawing, the figure compares the machine with the instruction-level model after every instruction and every trap. It names the first place they disagree.\n\nThere are two faults. BCONST held at 1 makes the ALU's B input always take the constant. SET held at 0 is in the control unit, where SET is kind A's line in the decoder.",
  faultsLead:
    'Choose a fault, predict which line first goes wrong, then press "Run to the end" and read the comparison.',
  faultBconst:
    "With BCONST held at 1, the loads still work, because a load takes the constant as B anyway. The first line that takes B from a register is `R3 <= R1 - R2`. The ALU took the constant, 0, in place of R2. The run still stops, showing 0 on the display.",
  faultSet:
    "With SET held at 0, the decoder has no line for kind A. It refuses `R5 <= R3 >= R4 signed` as an illegal instruction, with cause `21`, and the machine goes to the handler.\n\nThe handler shows R2 on the display: -250. It resumes at the refused line, which traps again, over and over. The run is cut off after 300 edges.\n\nIn Module 10's copy, holding SET at 0 left set if writing HR. Here, the decoder's checks know kind A only through SET, so a set if without it is refused.",
  explanation:
    "\"Agree\" means two different things. Keep them apart.\n\nEvery level shows the circuit's real value. From the word down, every level reads the same wires of the same circuit at the same edge. The table's fields are the IR's bits in groups of four. The control signals are wires of the control unit. The drawing's values come from the circuit. So a level cannot show a different value from the one below it. It can only leave things out: the table shows a few signals, and the top of the drawing shows three blocks, not their gates. The line is the only level outside the circuit. The assembler made the machine code before the run.\n\nEvery level describing the same instruction is another matter. In a healthy machine, the signals do what the word asks. With BCONST held at 1, every level still showed real values, but they no longer described the same instruction. The word said B is R2. BCONST said the constant. The ALU did what BCONST said.\n\nThe comparison with the model finds that second kind of disagreement, at the first instruction where it shows. The levels show where it comes from.",
  generalisation:
    "Every program reaches a machine as machine code. Whatever language it was written in, the machine runs words like `A7345000`.\n\nThe stages are fetch, decode, register read, ALU, memory, register write and PC update. Each stage but two is an edge of the controller's state. Decode is the decoder's gates between two edges. PC update is the instruction's last edge, whichever state that is.",
  answersLead:
    "Work every answer out from the lesson's rules, without running anything, then run the tests.",
  c1Task:
    "Work out, without running anything, the machine code of `R9 <= R2 >= R7 unsigned`, as eight hexadecimal digits. It is not a line of the shop's program. Set if's job 5 is not less, read unsigned.\n\nThe line `R4 <= word[R2]` sits at `01C` in a program no figure runs. When it runs, R2 holds 1024, and the word at address 1024 (`400`) holds 25. Work out, without running anything: how many edges it takes, from its FETCH edge to its last; the ALU's job at its ALU edge, by OP2, OP1 and OP0, which is add, subtract, copy B or OR; the word register Y takes at its WRITE edge, as a decimal number; and the PC after its last edge, as three hexadecimal digits.\n\nThere are 5 tests, one for each answer.",
  c1Hints: [
    "The idea: a word's eight digits are its fields in order: K, J, A, B, Y, then three digits of constant. The other answers follow from the states a load takes and what each state does.",
    "A common mistake: taking the ALU's result for the word a load writes.",
    "A smaller example, with no part of the task: `R4 <= 100` is `25004064`: kind 2, job 5, A 0, B 0, Y 4, constant `064`.",
    "Part of the answer: set if is kind A. A load works out its address in the ALU, the register A names plus the constant, and takes the word at that address at its MEMORY edge.",
    "The whole answer: `A5279000`. It takes 5 edges. The ALU's job is add. Y takes 25, and the PC after the last edge is `020`.",
  ],
  reflection:
    'You have watched one line at every level at once, and seen what "agree" means: every level reads the same circuit, and in a healthy machine every level describes the same instruction.\n\nThe figures chose what to show: a few signals in the table, and the drawing where you pressed.\n\nThe next lesson asks: can you follow one value of your own choosing, at an edge of your own choosing, from a line of the program down to one gate?',
  modelVsReality:
    "This machine's memory answers within one edge. A real machine's memory is far slower than its CPU.\n\nSo a real machine keeps copies of recently used words. It keeps them in small, fast memories beside the CPU. It goes to the main memory only when a copy is missing.\n\nNothing of this is taught here. It is named so you know where this machine stops being like a real one.",
} as const;
