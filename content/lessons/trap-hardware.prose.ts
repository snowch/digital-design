// Copyright © 2026 Christopher Snow

// The words of the lesson trap-hardware.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-12-traps/briefs, briefs 7A to 7C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 6 ended on a question: which parts of the machine copy C0 into C1, take the cause into C3, and send the PC to C4, all at one edge?\n\nLessons 1 to 6 ran on the machine of one edge per instruction. This lesson opens Module 9's machine of several edges, with the parts a trap needs added.\n\nThe figure is a timing diagram of a program's first 12 edges. The program sets C4, then stores to room B's sensor, which the machine refuses.",
  edgesLead:
    "Move along the diagram's edges and find the one where TRAP is 1 before the edge fires.",
  edgesAfter:
    "The store takes edges 8 to 11. Before edge 11, the controller is in MEMORY and TRAP is 1. At edge 11, the PC takes `010`, the handler's address, and C2 takes `008`, the store's address. The controller's state goes from MEMORY to FETCH. Edge 12 fetches the handler's first line, `R5 <= C3`. The trap took no edge of its own. It is the store's last edge.",
  motivation:
    "Each part sits in the datapath or the control unit, and the mode adds two wires.\n\n- The control registers, in the datapath: five registers, C0 to C4, each with a selector that picks its next word.\n- The next PC: C4 at a trap's edge, C2 at `resume`'s edge, and otherwise what Module 9 gave it.\n- The trap logic, in the control unit where the stop logic was. It reads the three causes (CAUSEF, CAUSED and CAUSEM), STOP, CHECKING, FETCHING, the waiting bits, IE and NOHANDLER. It sets GO, TRAP, CAUSE and HALT.\n- The controller, with one new rule: at an edge that traps, its state register takes FETCH, as at a reset, and the PC is written, so it takes C4. A control-register job and `resume` go from READ to WRITE.\n\nThe mode is C0's bit 0, and it goes to two places. The decoder gives cause `22` in user mode for `resume`, the control-register jobs and `stop`. The memory port's checks give cause `32` in user mode for a device's address.\n\nEvery part takes its word at the same edge: the last edge of the instruction that traps.",
  prediction:
    "The figure is the machine's drawing, running the same program and stopped after 10 edges. The controller is in MEMORY: the store's next edge is its last.\n\nChoose an answer and press \"Check my prediction\".",
  p1Question: "What does the PC hold after the next edge?",
  p1Explain:
    "The PC takes `010`, the value in C4. The trap logic has set TRAP to 1, and at a trap's edge the next PC is C4.\n\n`00C` would be the next instruction if the store had not been refused. `008` is the store, which C2 takes.\n\nRun the next edge and read the control registers.",
  investigation:
    "The figure runs lesson 1's night program on this machine. It shows the control registers, R2, R3 and R5, and a timing diagram of TRAP, PCEN and CWEN. CWEN is 1 at a control-register job's WRITE edge.",
  nightLead:
    '1. Press "Clock edge" until the store at `014` reaches MEMORY. Read TRAP and the controller\'s state.\n2. Press "Clock edge" once and read the control registers.\n3. Press "Run until it stops".',
  nightAfter:
    "The store to room B's sensor, at `014`, traps at edge 24, in MEMORY. The handler runs, and `resume` goes back to `018`. At the end, C1 holds `01`, C2 holds `018`, C3 holds `34` and C4 holds `024`. The program stops at `020` after 53 edges. The display shows -184, and the lamps show NIGHT.",
  construction:
    "The controller's state diagram and the trap logic tell you how many edges each of the 4 cases takes. You can work it out without running it.",
  answersLead: "Work out each answer, then run the tests.",
  c1Task:
    "1. On this machine, how many edges does each take, counting the edge that traps:\n   - a `call system`;\n   - a `resume`;\n   - an interrupt, from the edge it is taken at;\n   - a store to a sensor, with a handler set.\n2. Give each as a decimal number. There are 4 tests, one for each.",
  c1Hints: [
    "The idea: an edge that traps is the last edge of its instruction. Find the state where each cause appears.",
    "A common mistake: counting a trap as an edge of its own. A trap ends the instruction's last state, and takes no edge of its own.",
    "A smaller example: the store in the first figure took FETCH, READ, ALU and MEMORY, and trapped at MEMORY: 4 edges.",
    "Part of the answer: the decoder's causes, `41` among them, appear in READ. An interrupt is taken at the edge that would fetch.",
    "The whole answer: 2, 3, 1 and 4, in the order of the list above.",
  ],
  failureExperiment: "The figure runs the night program with one of two faults, which you choose.",
  faultsLead:
    'Choose a fault, predict what the store does, then press "Run until it stops" or "Clock edge".',
  faultTrap:
    "With TRAP stuck at 0, the trap logic still sets GO to 0 at the store's MEMORY edge, but nothing takes the trap. The controller stays in MEMORY, and the PC stays at `014`. The machine neither traps nor halts. Every edge after edge 24 writes nothing. TRAP is what moves the machine on. GO at 0 alone only prevents writing.",
  faultCwen:
    "With the control registers' write enable (CWEN) stuck at 0, `C4 <= R1` writes nothing, so C4 stays 0. There is no handler. At the store's MEMORY edge, the trap logic sets HALT to 1. The machine halts with cause `34` at `014`, as Module 11's machine did. The trap logic reads NOHANDLER from C4, so a C4 that is never written turns every trap back into a halt.",
  explanation:
    "When more than one cause is ready, the trap logic chooses one. It takes the cause of the earliest step, in the order the steps run: the fetch's, then an interrupt's, then the decoder's, then the memory's. This is Module 3's priority: the earliest step wins.\n\nAn interrupt is taken only at an edge that would fetch. That means FETCHING is 1, IE is 1, and a bit is set in \"waiting\" (`7F0`). The timer's `81` comes before the door's `82`.\n\nWith no handler, a cause halts the machine, as Module 9's machine did. In system mode, `stop` sets HALT as well, and the program stops. In user mode, `stop` is cause `22`.\n\nThe edge that traps writes the control registers, the PC and the controller's state at once, and nothing else. GO is 0, so none of R0 to R15 changes, no memory word changes and no device changes.\n\nA trap's edge does not count down the timer, because no instruction finished. The timer counts instructions, as lesson 5 said.",
  generalisation:
    "A trap adds no state to the controller. It ends the instruction at the edge where its cause appears, and sends the controller to FETCH. So its cost is the edges the instruction had already taken.\n\nThe handler's address is a register, C4, not a fixed number in the circuit. The program chooses it.\n\nEverything a handler sees, C0 to C4, is a register the circuit writes at one edge. The handler is ordinary instructions.\n\nThe trap logic is combinational: a table from its inputs to GO, TRAP, CAUSE and HALT.",
  traplogicLead: "Write the trap logic, try it on its pins, then run the tests.",
  c2Task:
    "1. The starting text is Module 9's stop logic: every cause halts the machine, and TRAP is always 0.\n2. Change it into the trap logic:\n   - An interrupt happens when FETCHING and IE are 1 and WAITING is not 0. Its cause is `81` if WAITING's bit 0 is 1, else `82`.\n   - The cause is chosen in this order: the fetch's, the interrupt's, the decoder's, the memory's.\n   - TRAP is 1 when anything traps and NOHANDLER is 0. HALT is 1 when anything traps and NOHANDLER is 1, or at a `stop` while CHECKING.\n   - GO is 0 when anything traps or the machine halts.\n3. There are 17 tests, one for each row of the table: each cause on its own, the events, which cause wins, and no handler.",
  c2Hints: [
    "The idea: a signal `interrupt` and a signal `traps` (any cause, or the interrupt), then TRAP, HALT and GO from those and NOHANDLER.",
    "A common mistake: taking the interrupt whatever the state. An interrupt is taken only at an edge that would fetch.",
    "A smaller example: Module 9's GO, `~(failed | stopNow)`, already says \"not if anything stops the machine\"; the trap logic's GO is the same with `traps` for `failed`.",
    "Part of the answer: `assign interrupt = FETCHING & IE & (WAITING != 2'b00);`, and in the `always_comb`, the interrupt's lines go between the decoder's and the fetch's, so the fetch's still wins.",
    "The whole answer: these lines replace the starting text's lines after `assign stopNow`, up to `endmodule`.\n\n```\n  logic interrupt, traps;\n  assign interrupt = FETCHING & IE & (WAITING != 2'b00);\n  assign traps = failedF | interrupt | failedD | failedM;\n  assign HALT = stopNow | (traps & NOHANDLER);\n  assign TRAP = traps & ~NOHANDLER;\n  assign GO = ~(traps | stopNow);\n  always_comb begin\n    CAUSE = CAUSEM;\n    if (failedD) CAUSE = CAUSED;\n    if (interrupt) begin\n      if (WAITING[0]) CAUSE = 8'h81;\n      else CAUSE = 8'h82;\n    end\n    if (failedF) CAUSE = CAUSEF;\n  end\n```",
  ],
  reflection:
    "The machine can now trap, save where it was, run a handler in system mode, and go back.\n\nLessons 1 to 6 each wrote a handler for one job.\n\nCan you write the handler that runs the shop's programs, one after another, each in user mode, giving them the jobs of lesson 4?",
  modelVsReality:
    "Real machines add trap hardware in the same places: registers for the return point, the status and the cause, a choice of the next PC, and logic that picks one cause.\n\nMachines that overlap instructions must also undo the work of the instructions after the one that faulted. This machine runs one instruction at a time, so it has nothing to undo.\n\nThis machine's priority, earliest step first, is its own choice.",
} as const;
