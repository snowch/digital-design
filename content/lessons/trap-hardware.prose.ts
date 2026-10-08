// Copyright © 2026 Christopher Snow

// The words of the lesson trap-hardware.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-12-traps/briefs, briefs 7A to 7C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 6 ended on a question. Which parts of the machine copy C0 into C1, take the cause into C3 and send the PC to C4, all at one edge?\n\nLessons 1 to 6 ran on the machine of one edge per instruction. This lesson opens Module 9's machine of several edges, with the parts a trap needs added.\n\nThe figure is a timing diagram of a program's first 12 edges. It has a lane for TRAP, and one for each of C0, C1, C2 and C3. The program sets C4, then stores to room B's sensor. The store faults.",
  edgesLead:
    "Move along the diagram's edges and find the one where TRAP is 1 before the edge fires.",
  edgesAfter:
    "The store takes edges 8 to 11. Before edge 11 the controller is in MEMORY and TRAP is 1.\n\nAt edge 11 the PC takes `010`, the handler's address. C2 takes `008`, the store's address. C1 takes `01`, C0 as it was. C3 takes `34`. C0 stays `01`.\n\nEdge 12 fetches the handler's first line, `R5 <= C3`.",
  motivation:
    "Each part sits in the datapath or the control unit. To see a part, press the block it sits in: a block opens to show the parts inside. The list below names the block to press for each part.\n\nFour parts change for a trap:\n\n- The control registers, C0 to C4, each with a selector that picks its next word: press `datapath`, then `cregs`. The selector `returnPoint` picks C2's word at a trap: the PC plus 4 when the cause's bit 6 is 1, and only cause `41`, a system call, has that bit set. Otherwise it picks the PC itself.\n- The next PC, which takes C4 at a trap's edge, C2 at `resume`'s edge, and otherwise what Module 9 gave it: press `datapath`, then `nextTrap`.\n- The trap logic, in the control unit where the stop logic was: press `control`, then `trapLogic`. It reads the three causes (CAUSEF, CAUSED and CAUSEM), STOP, CHECKING, FETCHING, the bits of \"waiting\", IE and NOHANDLER. IE is C0's bit 1. When it is 1, interrupts are on. NOHANDLER is 1 when C4 is 0, or when C4 holds the PC. It sets GO, TRAP, CAUSE and HALT.\n- The controller, in the control unit: press `control`, then `controller`. A control-register job and `resume` now go from READ to WRITE, as a function call does. It has one more new rule, for an edge that traps. The prediction asks about that rule.\n\nThe mode is C0's bit 0, and it goes to two places. The decoder gives cause `22` in user mode for `resume`, the control-register jobs and `stop`. The memory port's checks give cause `32` in user mode for a device's address.\n\nEvery part takes its word at the same edge: the last edge of the instruction that traps. The trap takes no edge of its own.\n\nThe drawings are large. On a phone, scroll inside a drawing, or use its overview to move about.",
  prediction:
    "The figure is the machine's drawing. It runs a program that sets C4 and then runs `call system`. It is stopped after 8 edges. The controller is in READ, on the `call system`. The decoder has given cause `41`, and TRAP is 1. In the controller's table, READ goes on to ALU for an instruction that is neither a function call nor a control-register job.\n\nChoose an answer and press \"Check my prediction\".",
  p1Question: "Which state is the controller in after the next edge?",
  p1Explain:
    "The controller goes to FETCH. At an edge that traps, its state register takes FETCH, whatever its table says, as it does at a reset.\n\nThe table's move from READ is to ALU. The trap overrides that move: the `call system` ends at its READ edge, which is its second edge.\n\nThe state diagram draws the state an edge that traps leads to in a dashed box, and a note under the diagram says so. The table's arrow for that edge is not marked.\n\nAt the same edge the PC takes C4, `010`, so the next edge fetches the handler's first line.",
  investigation:
    "The figure runs lesson 1's night program on this machine. It shows the control registers, R2, R3 and R5, and a timing diagram of TRAP, PCEN and CWEN. CWEN is 1 at a control-register job's WRITE edge.",
  nightLead:
    '1. Press "Clock edge" until the store at `014` reaches MEMORY. Read TRAP and the controller\'s state.\n2. Press "Clock edge" once and read the control registers.\n3. Press "Run until it stops".',
  nightAfter:
    "The store to room B's sensor, at `014`, traps at edge 24, in MEMORY. The handler runs, and `resume` goes back to `018`. At the end, C1 holds `01`, C2 holds `018`, C3 holds `34` and C4 holds `024`. The program stops at `020` after 53 edges. The display shows -184, and the lamps show NIGHT.",
  construction:
    "The controller's state diagram and the trap logic tell you how many edges each of four cases takes. You can work out each count without running anything.",
  answersLead: "Work out each answer, then run the tests.",
  c1Task:
    "1. On this machine, how many edges does each take, from its FETCH edge to the edge that traps, counting both:\n   - a `stop` in user mode;\n   - the handler's `resume`, in system mode, which does not trap: count to its last edge;\n   - an interrupt, from the edge it is taken at;\n   - a word load from `404`, an address not a multiple of 8, with a handler set.\n2. Give each as a decimal number. There are 4 tests, one for each.",
  c1Hints: [
    "The idea: an edge that traps is the last edge of its instruction. Find the state where each cause appears. The decoder's causes appear in READ, the memory's in MEMORY, and an interrupt's at an edge that would fetch.",
    "A common mistake: counting a trap as an edge of its own. The trap ends the instruction at the state where its cause appears.",
    "A smaller example: `nothing` takes FETCH, READ and ALU, so it takes 3 edges, with no trap.",
    "Part of the answer: `stop` in user mode is refused by the decoder, which gives its cause in READ. `resume` goes from READ to WRITE, as a control-register job does.",
    "The whole answer: 2, 3, 1 and 4, in the order of the list.",
  ],
  failureExperiment: "The figure runs the night program with one of two faults, which you choose.",
  faultsLead:
    'Choose a fault, predict what the store does, then press "Run until it stops" or "Clock edge".',
  faultTrap:
    "With TRAP stuck at 0, the trap logic still sets GO to 0 at the store's MEMORY edge, but nothing takes the trap.\n\nAt that edge and every edge after it, GO is 0 and TRAP is 0. So the controller's state register does not change: the state diagram marks MEMORY as the state the next edge leaves the controller in.\n\nThe PC stays at `014`. The machine neither traps nor halts, and every edge after edge 24 writes nothing.\n\nTRAP is what moves the machine on. GO at 0 by itself only stops the writing.",
  faultCwen:
    "With the control registers' write enable (CWEN) stuck at 0, `C4 <= R1` writes nothing, so C4 stays 0. There is no handler. At the store's MEMORY edge, the trap logic sets HALT to 1. The machine halts with cause `34` at `014`, as Module 11's machine did. The trap logic reads NOHANDLER from C4, so a C4 that is never written turns every trap back into a halt.",
  explanation:
    "When two causes are ready at one edge, the trap logic takes the lower number, as Module 8's causes did.\n\nOn this machine only one pair can meet. The decoder's cause counts only while CHECKING, in READ. The memory's counts only in MEMORY. An interrupt is taken only at an edge that would fetch, with FETCHING 1. So the only two causes that can be ready together are a fetch's (`11` or `12`) and an interrupt's (`81` or `82`). The fetch's cause wins, as the lower number.\n\nAn interrupt is taken when FETCHING is 1, IE is 1, and a bit is set in \"waiting\" (`7F0`). The timer's `81` wins over the door's `82`, because it is the lower number.\n\nWith no handler, a cause halts the machine, as in Module 8. In system mode, `stop` sets HALT, and the run stops. In user mode, `stop` is cause `22`.\n\nThe controller gains one new rule. At an edge that traps, its state register takes FETCH, whatever its table says, as at a reset. The arrow marked \"CALL 1\" is the function call's, `call`, not `call system`'s.\n\nThe edge that traps writes the control registers, the PC and the controller's state at once. GO is 0, so none of R0 to R15 changes and no word of memory changes. The machine still notes a door that opens at that edge: \"waiting\" takes its bit at every edge where PCEN is 1, and PCEN is 1 at a trap's edge.\n\nA trap's edge does not count down the timer, because no instruction finished. The timer counts instructions, as lesson 5 said.",
  generalisation:
    "A trap adds no state to the controller. It ends the instruction at the edge where its cause appears, and sends the controller to FETCH. So its cost is the edges the instruction had already taken.\n\nThe handler's address is a register, C4, not a fixed number in the circuit. The program chooses it.\n\nEverything a handler sees of the trap, C0 to C4, is a register the circuit writes at one edge. The handler is made of ordinary instructions.\n\nThe trap logic is combinational: a table from its inputs to GO, TRAP, CAUSE and HALT.",
  traplogicLead: "Write the trap logic, try it on its pins, then run the tests.",
  c2Task:
    "1. The starting text is Module 9's stop logic: every cause halts the machine, and TRAP is always 0.\n2. Change it into the trap logic:\n   - An interrupt happens when FETCHING and IE are 1 and WAITING is not 0. Its cause is `81` if WAITING's bit 0 is 1, else `82`.\n   - When two causes are ready at once, the lower number wins.\n   - TRAP is 1 when anything traps and NOHANDLER is 0. HALT is 1 when anything traps and NOHANDLER is 1, or at a `stop` while CHECKING.\n   - GO is 0 when anything traps or the machine halts.\n3. There are 17 tests, one for each row of the trap logic's table: each cause on its own, the events, which cause wins, and no handler.",
  c2Hints: [
    "The idea: a signal `interrupt` and a signal `traps` (any cause, or the interrupt), then TRAP, HALT and GO from those and NOHANDLER.",
    "A common mistake: taking the interrupt whatever the state. An interrupt is taken only at an edge that would fetch.",
    "A smaller example: a signal that is 1 when either of two causes is not 0 is `assign either = (CAUSEF != 8'h00) | (CAUSEM != 8'h00);`. The trap logic's signals are built from pieces like this one.",
    "Part of the answer: `assign interrupt = FETCHING & IE & (WAITING != 2'b00);`, and in the `always_comb`, the interrupt's lines go between the decoder's and the fetch's, so the fetch's still wins.",
    "The whole answer: these lines replace the starting text's lines after `assign stopNow`, up to `endmodule`.\n\n```\n  logic interrupt, traps;\n  assign interrupt = FETCHING & IE & (WAITING != 2'b00);\n  assign traps = failedF | interrupt | failedD | failedM;\n  assign HALT = stopNow | (traps & NOHANDLER);\n  assign TRAP = traps & ~NOHANDLER;\n  assign GO = ~(traps | stopNow);\n  always_comb begin\n    CAUSE = CAUSEM;\n    if (failedD) CAUSE = CAUSED;\n    if (interrupt) begin\n      if (WAITING[0]) CAUSE = 8'h81;\n      else CAUSE = 8'h82;\n    end\n    if (failedF) CAUSE = CAUSEF;\n  end\n```",
  ],
  reflection:
    "The machine can now trap, save where it was, run a handler in system mode, and resume the program.\n\nLessons 1 to 6 wrote handlers for these tasks: skipping refused stores, starting a program in user mode, the jobs of a system call, and the door and the timer.\n\nCan you write the handler that runs the shop's programs one after another, each in user mode, and offers them the jobs of lesson 4?",
  modelVsReality:
    "Real machines add trap hardware in the same places: registers for the return point, the status and the cause; the choice of the next PC; and the logic that picks one cause.\n\nMachines that overlap instructions must also undo the work of the instructions after the one that faulted. This machine runs one instruction at a time, so it has nothing to undo.",
} as const;
