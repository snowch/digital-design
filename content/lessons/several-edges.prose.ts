// Copyright © 2026 Christopher Snow

// The words of the lesson several-edges.
//
// Drafted by the course's prose process from briefs of checked facts (docs/notes/module-9-control.md
// and its briefs), checked against the simulator, and placed here by the lesson's structure. Edit
// a fact here only after checking it; the lesson's facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 2 ended with a question: what if the machine had one memory reached by one address, as Module 6's memory was? How could one instruction use it twice? Module 8's machine reaches memory twice in one edge: the fetch at the PC, and a load's or store's word at the ALU's result. One address can name one place at a time. How can one instruction fetch itself and then load a word, through one address?",
  motivation:
    "The instruction takes more than one edge. At one edge the memory's address is the PC and the instruction comes in. At a later edge the address is the ALU's result and the word comes in. The instruction must be kept while the address moves on. A register that holds the instruction while it runs is the **instruction register**. It takes the word at the PC at the fetch edge and keeps it until the next fetch.\n\nAny word that one edge works out and a later edge uses must be held too. Four registers hold them:\n\n- HA and HB: the words of registers A and B;\n- HR: the ALU's result;\n- HM: the word a load reads.\n\nA controller says which edge the instruction is at. It is Module 5's state machine. Its five states are named for what the edge does: FETCH, READ (the registers), ALU, MEMORY, WRITE (register Y). Each kind passes through only the states it needs. The decoder's signals choose them. The PC keeps the instruction's address until the instruction's last edge. At that edge it takes the next PC, as in Module 8.",
  prediction:
    'This figure shows the machine after a reset, running the program "which room is colder" from Module 8. The PC is `000`: the load R2 ← memory[`7D8`], room A\'s reading. The tables show R2 and R3, and the buses IR and HR. Choose an answer and press "Check my prediction". The "Clock edge" button appears after.',
  p1Question:
    "The PC is `000`, the load R2 ← memory[`7D8`]. How many edges does the load take, from its fetch to the edge where the PC moves on?",
  p1Explain:
    "The load takes 5 edges, one in each state:\n\n- FETCH: IR ← memory[PC];\n- READ: HA and HB take R0's word, twice, as A and B both name R0. The load uses neither, as its address is the constant alone;\n- ALU: HR ← 0 + c, the address `7D8`;\n- MEMORY: HM ← word[HR], room A's reading;\n- WRITE: R2 ← HM, and the PC moves on to `004`.\n\nIn Module 8's machine the same load took 1 edge.",
  colderEdgesLead:
    'This figure runs the whole program. The drawing has three blocks: the control unit, the datapath and the memory, joined by the control signals. Beside the drawing: the controller\'s states, with the current one marked; the edges so far as a timing diagram, with one line per signal that lets a register take a word: IREN (IR), HOLDAB (HA and HB), HOLDR (HR), HOLDM (HM), WREG (register Y), PCEN (the PC); the buses IR, HA, HB, HR and HM, and the display. Press "Clock edge" to make one edge, or "Run until it stops".',
  colderEdgesAfter:
    "The program stops after 23 edges. The display shows -250: room B is colder. Module 8's machine ran the same program in 6 edges. Each of the two loads takes 5 edges. The branch takes 3: it writes no register. R2 ← R3 takes 4. The store takes 4: it writes no register. The stop takes 2 edges: its fetch, and the edge at which it halts the machine, in READ. In the timing diagram, PCEN is 1 once per instruction, at its last edge. IREN is 1 at every FETCH.",
  construction:
    "A single memory port handles both instruction fetch and data access. Two parts make this work: a selector and a register. The selector chooses the address ADDR. When the controller sets FETCHING to 1, the selector passes the PC. When FETCHING is 0, it passes HR, the address the ALU has worked out. The instruction register stores the memory's word when the controller sets IREN to 1 at a clock edge. At a reset, the instruction register becomes 0.",
  writeFetchportLead: "Write the memory's address and the instruction register.",
  c1Task:
    "The `fetchport` module has six inputs: CLK, RST, FETCHING and IREN from the controller, PC and HR from the datapath (64 bits each), and FETCHED from memory (32 bits). It outputs ADDR (64 bits) and IR (32 bits). Start with `assign ADDR = PC;` and `assign IR = FETCHED;`. Change ADDR to a selector: output PC when FETCHING is 1, HR otherwise. Make IR a register that takes FETCHED at each rising edge when IREN is 1, resets to 0 if RST is 1, and holds its value otherwise. The tests load `380027D8` into IR and check it holds while FETCHED changes. One test pulses IREN while CLK is high: IR must not change. Eight tests.",
  c1Hints: [
    "ADDR is a selector like the multiplexer in Module 3. Use `always_comb` with a `case` on FETCHING.",
    "A common mistake is to leave IR as an `assign`. Then IR tracks FETCHED at every moment, and you lose the instruction when the address switches to HR.",
    "The selector's pattern: `always_comb case (FETCHING) 1'b0: ADDR = HR; 1'b1: ADDR = PC; endcase`.",
    "The register uses `always_ff @(posedge CLK)`. Check RST first with `if (RST)`, then `else if (IREN)`.",
    "The complete solution:\n\n```\nalways_comb\n  case (FETCHING)\n    1'b0: ADDR = HR;\n    1'b1: ADDR = PC;\n  endcase\nalways_ff @(posedge CLK)\n  if (RST) IR <= 32'h0;\n  else if (IREN) IR <= FETCHED;\n```",
  ],
  edgeFaultsLead:
    'The figure runs the margin program from Module 8: it calculates R1 - R2 and stores the result to the display. With no fault, the program stops after 18 clock edges and the display shows 66. The bus table below shows IR and ADDR (the memory address). Two faults are available. "FETCHING stuck at 1" forces FETCHING to 1, so the address is always the PC. "Row 4 stuck at 0" breaks row 4 of the controller\'s table (the row for ALU to MEMORY when MEM is 1). Choose a fault, then press "Run until it stops". Before you press, predict what the display will show.',
  edgeFaultsOutcomes:
    "**FETCHING stuck at 1:**\nThe first three instructions execute normally. R1 becomes -184, R2 becomes -250, and R3 becomes 66. The store instruction at address `00C` fails. At the MEMORY edge, ADDR should be HR (`7C0`, the display address), but FETCHING forces it to stay at the PC (`00C`). The address `00C` is not at a multiple of 8, so the machine stops after 16 edges with cause `33`. The display remains 0.\n\n**Row 4 stuck at 0:**\nThe store instruction never reaches the MEMORY state. At the ALU edge, the decoder sets MEM to 1, but row 4 (which handles ALU to MEMORY) gives 0. No other row applies, so the controller transitions to FETCH instead. Nothing is written to memory. The machine stops after 17 edges. The display remains 0.",
  explanation:
    "The control unit now has four parts: the digits block, the decoder, the controller and the stop logic.\n\nThe controller is a state machine like Module 5's: a 3-bit register holds the state code, and next-state logic works out the next code from the state and three signals: CALL, MEM (for load or store) and WRITEY. The states are FETCH (`000`), READ (`001`), ALU (`010`), MEMORY (`011`) and WRITE (`100`).\n\nThe PC holds the instruction's address until its last edge. Three things need it:\n- a call's WRITE edge writes PC + 4 into register Y;\n- a branch's target is PC + 4c;\n- a stop keeps the PC on the stop, as Module 8's machine did.\n\nThe decoder's checks run only in READ. In FETCH, IR still holds the last instruction, or 0 after a reset, and 0 is illegal.\n\nThe fetch's checks run only in FETCH. In other states the address comes from HR, a data address.",
  controllerLead:
    'The figure shows the controller as a state machine: its state diagram, a table of rows for each transition, and a trace of one run.\n\nTo step to the next state, set CALL, MEM and WRITEY as a kind would set them, then press "Clock CLK". A load sets MEM and WRITEY to 1, and CALL to 0.',
  controllerAfter:
    "FETCH always leads to READ. WRITE always leads to FETCH.\n\nFrom READ, a call goes to WRITE. Every other kind goes to ALU.\n\nFrom ALU, a load or a store (MEM 1) goes to MEMORY. A kind that writes register Y goes to WRITE. A branch or jump goes back to FETCH.\n\nFrom MEMORY, a load goes to WRITE. A store goes to FETCH.\n\nAn edge whose next state is FETCH is the instruction's last edge.",
  generalisation:
    "Each kind takes as many edges as it has work for, and no more.\n\nA call needs no ALU edge: its target, PC + 4c, comes from the next-PC adder. PC + 4 is written into register Y.\n\nA branch and jump end at the ALU edge. The ALU's result decides the next PC for a branch, or is the next PC for a jump.\n\nA program's edges depend on its mix of kinds.\n\nEach edge does less than Module 8's one edge. Each handles one register read, one ALU job, or one memory access.",
  kindEdgesLead:
    "The table is made from the decoder and the controller: each kind's signals are given to the controller, and its states are counted until it returns to FETCH.",
  kindEdgesAfter:
    "A register job and a constant job take 4 edges each: FETCH, READ, ALU, and WRITE.\n\nA load takes 5 edges. A store takes 4 edges: it ends at MEMORY.\n\nA branch and a jump take 3 edges: FETCH, READ, ALU.\n\nA call takes 3 edges: FETCH, READ, WRITE.",
  writeStatesLead: "Write the controller's next-state logic.",
  c2Task:
    "The module `controller` has inputs CLK, RST, GO, CALL, MEM and WRITEY, and output S, the state's 3-bit code.\n\nThe text names the states with `typedef enum`, as Module 5 did. The state register is written: at an edge it takes FETCH if RST is 1, otherwise `next` if GO is 1. GO is 0 once the machine halts.\n\nThe start sends every kind through FETCH, READ, ALU and WRITE. MEMORY is never used.\n\nRewrite the `always_comb` so each kind passes through its own states, as the table above gives them.\n\nThe tests take a register job, a load, a store, a branch and a call through their states from a reset, then a stop that halts in READ. One test drops GO while CLK is 1. There are 44 tests.",
  c2Hints: [
    "FETCH's and WRITE's arms read no input. READ reads CALL. ALU reads MEM, then WRITEY. MEMORY reads WRITEY.",
    "A common mistake: in ALU, testing WRITEY before MEM. A load has both at 1, and it must go to MEMORY first.",
    "READ's arm: `READ: begin if (CALL) next = WRITE; else next = ALU; end`",
    "MEMORY's arm: `MEMORY: begin if (WRITEY) next = WRITE; else next = FETCH; end`",
    "The whole `always_comb`:\n\n```\nalways_comb begin\n  case (state)\n    FETCH: next = READ;\n    READ: begin\n      if (CALL) next = WRITE;\n      else next = ALU;\n    end\n    ALU: begin\n      if (MEM) next = MEMORY;\n      else if (WRITEY) next = WRITE;\n      else next = FETCH;\n    end\n    MEMORY: begin\n      if (WRITEY) next = WRITE;\n      else next = FETCH;\n    end\n    default: next = FETCH;\n  endcase\nend\n```",
  ],
  reflection:
    "One memory port handles both the fetch and the data access, at different edges.\n\nThe instruction register keeps the instruction. HA, HB, HR and HM keep the words that pass from one edge to the next. The controller's state says which edge the instruction is at.\n\nWhich control signals make each edge do its work, and how does the controller set them?",
  modelVsReality:
    "A clock's edges must leave time for the slowest path from one register to the next.\n\nIn Module 8's machine, one edge held a load's whole path: the fetch, the decoder, the register file, the ALU, the memory, and back to the register file.\n\nHere each edge holds one part, so a real clock could run faster.\n\nWhether the program then takes less time depends on how the parts' times compare. Real designers split the work so each edge's path takes about the same time.\n\nThe course's settle model counts steps, not time.",
} as const;
