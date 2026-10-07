// Copyright © 2026 Christopher Snow

// The words of the lesson instruction-set.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-10-instruction-set/briefs), checked against the simulator, and placed
// here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Module 9 ended on a question: which instructions a machine has is a choice, and so is how their words are laid out. Why are the course's instructions the ones they are?\n\nTwo machines in the course run the same programs. Module 8's machine takes one edge per instruction. Module 9's takes 3 to 5, with one memory port, an IR register and held words. Both ran the colder-room program and showed -250 on the display.\n\nWhat is the same between the two machines? What can a program rely on, whichever machine runs it?",
  motivation:
    "The two machines have different parts. Module 9's machine has an IR register, held words HA, HB, HR and HM, and the controller's state. Module 8's machine has none of these. Its IR is a bus: the ROM's output at the PC. Both machines have R0 to R15, the PC, the memory (the ROM and the RAM) and the shop's devices.\n\nThe course tested 37 programs from Module 8 on Module 9's machine. After every instruction it compared the result with a model of the machine that runs one instruction at a time.",
  prediction:
    "The figure runs the colder-room program on both machines side by side. Module 9's machine has made 3 edges of the first instruction, the load R2 ← memory[`7D8`]: FETCH, READ and ALU. It is in MEMORY. Module 8's machine takes its one edge for an instruction when Module 9's machine ends that instruction. So it has not run the load yet. Choose an answer and press \"Check my prediction\". The figure then shows its tables and its buttons.",
  p1Question: "Of the PC, R2, R3 and the display, what do the two machines differ on now?",
  p1Explain:
    "Nothing. Both PCs hold `000`. R2 and R3 are X on both machines. Both displays show 0. Module 9's machine has changed only its own parts: its IR holds `380027D8`, the load, and HR holds `7D8`, the address. The load writes R2 at its last edge, WRITE. The PC moves at that edge too. In Module 9's machine, every change a program can see happens at the edge that ends the instruction: a register written, the memory or a device written, the PC moved.",
  sideBySideLead:
    'This figure runs the colder-room program on both machines from the start, so you can compare them.\n\nThe table "What a program can see" shows the PC, R2, R3 and the display on each machine, and marks a row "differs" where the two machines differ.\n\nThe table "What Module 9\'s machine keeps of its own" shows the controller\'s state, IR, HA, HB, HR and HM. Module 8\'s machine has none of these parts.\n\nPress "Clock edge (Module 9\'s)" to move Module 9\'s machine one edge. When that edge ends an instruction, Module 8\'s machine also takes its one edge for the same instruction. Press "Next instruction" to make edges until the instruction ends. Press "Run until it stops" or "Start again".\n\nThe table "Instructions run" lists each instruction, the edges each machine takes, and whether the machines agree when the instruction ends.',
  sideBySideAfter:
    "The program runs 5 instructions, then stops. Module 8's machine takes 1 edge for each instruction. Module 9's takes 5, 5, 3, 4 and 4 edges: 21 in all. Then it takes 1 more edge to fetch the stop and halts.\n\nAfter every instruction, the machines agree on the PC, R2, R3 and the display. The figure also checks every other register, the RAM and the devices: all agree. Both displays show -250.\n\nBetween instructions, Module 9's machine keeps words in IR, HA, HB, HR and HM. Module 8's machine has no parts for them.",
  construction:
    "The instructions a program runs name some parts of the machine and not others. A register job names three registers. A load names a register and an address. A store writes a value into memory or a device. A branch reads two registers and may move the PC.\n\nNo field in any instruction can name HR, HA or the IR. So no instruction can read or write them.\n\nEvery machine that runs the same programs must agree, after every instruction, on the parts that instructions name. What it does with the other parts is its own choice.",
  sortPartsLead:
    "Sort each part: one that every machine must agree on, or one that a circuit keeps of its own.",
  c1Task:
    'For each of nine parts, choose "Every machine agrees on it" if an instruction can read or change it, or "One circuit\'s own" if none can.\n\nThe parts are: R7, the PC, the IR, HR, the controller\'s state, the word at `400` in the RAM, the display, HA and the timer\'s count.\n\nThere are 9 tests. Each test names the part and the choice you made.',
  c1Hints: [
    "Ask whether any instruction can read or change the part, through a field, an address or the PC.",
    "A common mistake: counting the IR as a part every machine agrees on because Module 8's machine also has an IR. In Module 8's machine, the IR is a bus, the ROM's output at the PC. It is not a register. No instruction names it.",
    "A smaller example. R7: a register job can name R7 as A, B or Y, so every machine agrees on it. HR: no field names it, so it is one circuit's own.",
    "Part of the answer. Branches, calls and jumps move the PC. Loads and stores reach the word at `400` and the display. The timer is a device at `7E8` that loads and stores can reach. It counts instructions, not edges.",
    "The whole answer. Every machine agrees on R7, the PC, the word at `400`, the display and the timer's count. The IR, HR, the controller's state and HA are one circuit's own.",
  ],
  compareFaultsLead:
    'This figure runs the colder-room program on both machines, with a fault you choose in Module 9\'s machine.\n\n"HOLDR stuck at 1" means HR takes the ALU\'s result at every edge, not only when the state is ALU.\n\n"PCEN stuck at 1" means the PC takes its next value at every edge, so every edge ends an instruction.\n\nChoose a fault and press "Run until it stops".\n\nBefore you press, say for each fault whether the two machines will still agree after every instruction.',
  faultHoldr:
    "**HOLDR stuck at 1**\n\nThe machines agree after every instruction. Both displays show -250.\n\nHR takes a word at every edge. After the ALU edge it takes the same result again, because HA, HB and the IR do not change until the next fetch. At FETCH and READ it takes words that no later edge reads.\n\nThe course tested Module 8's 37 programs on Module 9's machine with this fault. Every program agrees with the model after every instruction.",
  faultPcen:
    "**PCEN stuck at 1**\n\nThe machines differ after the first edge, on R2.\n\nThe controller still takes the load's 5 edges, FETCH to WRITE. But the PC moves on at every one of them. Each of those edges ends an instruction, so Module 8's machine runs one instruction for each.\n\nModule 9's machine writes R2, -184, at the load's WRITE edge. By then its PC is at `014`, so it fetches the stop next and skips the four instructions between. R3 stays X on Module 9's machine. Its display shows 0, where Module 8's shows -250.\n\nModule 8's machine halts at the stop, at `014`. Module 9's PC has moved to `018` when its machine halts. Every one of Module 8's 37 programs differs with this fault.",
  explanation:
    "The list of instructions a machine runs, each with its word's layout and what it does to the parts a program can see, is the machine's **instruction set**. The parts a program can see are R0 to R15, the PC, the memory and the devices.\n\nEvery machine that runs the course's programs must agree on those parts after every instruction. The agreement says nothing about the edges inside an instruction, and nothing about the parts no instruction names.\n\nA circuit that keeps the agreement, and how it does it, is a **microarchitecture**: one edge an instruction or several, one memory port or two, held words or none. Module 8's machine and Module 9's machine are two microarchitectures of one instruction set.\n\nA fault in a part only the circuit knows can leave the agreement whole: HOLDR stuck at 1 did. A fault in the PC's enable breaks it.",
  generalisation:
    "A third circuit could take fewer edges for some kinds. In Module 9's machine a register job takes 4 edges. At ALU, HR takes the ALU's result. At WRITE, register Y takes HR.\n\nThe ALU's result is ready at the ALU edge. So register Y could take it there, and the job would end at that edge, in 3 edges. Every program would run to the same result. The instruction set would not change.\n\nPrograms written for one microarchitecture run on another. A circuit's makers can make it faster without asking anyone to change a program. The challenge asks you to write that circuit.",
  writeShortJobsLead: "Change Module 9's machine so its register and constant jobs take 3 edges.",
  c2Task:
    "The text is Module 9's whole machine, the course's, without the call through a register: the module `machine`, the controller and the decoder. It uses the course's modules for the register file, the ALU, the condition, the memory and the stop logic.\n\nMake the register jobs and constant jobs write register Y at the ALU edge, and end there: FETCH, READ, ALU, 3 edges. Every other kind keeps its edges. Three lines change:\n\n- in the controller's next-state logic, the arm for ALU: a job no longer goes to WRITE;\n- the controller's WREG: also 1 at ALU, for an instruction that writes register Y and does not use the memory;\n- in the module `machine`, the word register Y takes: the ALU's result, RESULT, where it was HR.\n\nThe memory holds the margin program. The tests reset the machine, then check the state and the PC after every edge of every instruction, then HALT and the display, 66, at the stop. There are 16 tests. The start fails 13 of them. The first failure is \"000, edge 3 (ALU): FETCH after it, PC 004\".",
  c2Hints: [
    "A job's result is ready at the ALU edge. Write it there, and let that edge end the instruction.",
    "A common mistake: changing only the next-state logic. The jobs then take 3 edges but write nothing, so the display does not show 66.",
    "A smaller example, the arm for ALU in the next-state logic:\n\n```\nALU: begin if (MEM) next = MEMORY; else next = FETCH; end\n```",
    "Part of the answer, WREG, with `~MEM` so a load's ALU edge writes nothing:\n\n```\nassign WREG = ((state == WRITE) | ((state == ALU) & ~MEM)) & WRITEY & GO;\n```",
    "The whole answer: the arm in hint 3, WREG in hint 4, and in the module `machine` the line `YIN = HR;` becomes `YIN = RESULT;`.",
  ],
  reflection:
    "The instruction set is the agreement. The microarchitecture is how one circuit keeps it. You wrote a third circuit, and every program ran to the same result.\n\nThe agreement covers what each instruction does. It also covers how each instruction's word is laid out: K, J, A, B, Y and three digits of constant, each field in the same place.\n\nWhy that layout, of whole hexadecimal digits? What does it cost?",
  modelVsReality:
    "The simulator compares the two machines after every instruction, against a model that runs one instruction at a time. Makers of real machines test a new circuit the same way: against such a model, on many programs.\n\nA real maker may sell a small, slow circuit and a large, fast one that run the same programs. How long an instruction takes is not part of the agreement, on the course's machines or on real ones.",
} as const;
