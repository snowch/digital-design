// Copyright © 2026 Christopher Snow

// The words of the lesson micro-operations.
//
// Drafted by the course's prose process from briefs of checked facts (docs/notes/module-9-control.md
// and its briefs), checked against the simulator, and placed here by the lesson's structure. Edit
// a fact here only after checking it; the lesson's facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 3 ended on a question: which control signals make each edge do its work, and how does the controller set them? In Module 8, R3 ← R1 - R2 is one register transfer. Here, it takes 4 edges. What does each of those edges do, and which signals make it?",
  motivation:
    "Each edge of an instruction performs one or two register transfers. One such transfer is a **micro-operation**.\n\nR3 ← R1 - R2 in Module 8 becomes four edges of micro-operations, six micro-operations in all:\n- FETCH: IR ← memory[PC]\n- READ: HA ← R1, HB ← R2\n- ALU: HR ← HA - HB\n- WRITE: R3 ← HR, and PC ← PC + 4\n\nA register takes a word only if its enable signal is 1. IR has IREN; HA and HB share HOLDAB; HR has HOLDR; HM has HOLDM; register Y has WREG; the PC has PCEN.\n\nThe controller sets these enable signals from its state. Lesson 3 built the logic that decides which state comes next; this lesson builds the logic that sets the control signals for each state.",
  prediction:
    'The figure runs the margin program from Module 8, with a store of R3 to the display in place of R4 ← R3 + R3. Two edges have passed. The PC is `000`: R1 ← -184, a constant job, job 5 (copy B), `25001F48`. Its FETCH edge and its READ edge are done. Choose an answer and press "Check my prediction". The figure then shows its tables and the "Clock edge" button.',
  p1Question: "Two edges of R1 ← -184 have passed. Which register takes a word at the next edge?",
  p1Explain:
    "HR takes the word at the next edge: HR ← c, the constant -184. This edge is the ALU state, the instruction's third. The controller sets HOLDR to 1 there, and nowhere else.\n\nIR took the instruction at the first edge, in FETCH. R1 is written at the fourth edge, in WRITE, taking its value from HR. At the same edge the PC moves to `004`.",
  fourViewsLead:
    "The figure runs \"which room is colder\" and shows four linked views of each edge:\n\n- The instruction, in the program's table, as the register transfer it makes.\n- The instruction's edges: each edge's state name and the micro-operations at that edge, with the next edge highlighted.\n- Control signals at the next edge: the controller's signals, GO, AZERO and BCONST.\n- The circuit: press any block to open it and see what it contains.\n\nThe bus table shows IR, HR and HM. The state diagram shows where the controller is now. The timing diagram shows all the edges so far.\n\nPress \"Clock edge\" to step forward one edge. All four views move together.",
  fourViewsAfter:
    "At the first instruction's ALU edge, AZERO and BCONST are both 1. The ALU does 0 + c, and HR takes `7D8`: the address of room A's sensor.\n\nAt the MEMORY edge, HOLDM is 1. HM reads the word at that address.\n\nAt the WRITE edge, WREG and PCEN are both 1. R2 takes that word and the PC moves to `004`.\n\nLater, at the branch instruction's ALU edge (address `008`), HR takes HA - HB: -184 - (-250). At the same edge, PC increments by 4. The branch is not taken because -184 is not less than -250. Even though HOLDR is 1, nothing uses HR after this edge.\n\nIREN, HOLDAB, HOLDR, HOLDM and WREG are each 1 only in their own state; PCEN is 1 at the last edge of each instruction, whichever state that is.",
  construction:
    "GO is 1 while the machine runs.\n\nFor signals that let a register take a word, the rule is: the state's line, AND what the kind needs, AND GO. This keeps halting edges from changing any register.\n\nThe signals are:\n\n- FETCHING marks the fetch state. IREN is the fetch state AND GO.\n- CHECKING marks the read state. HOLDAB is the read state AND GO.\n- HOLDR is the ALU state AND GO.\n- MLOAD is the memory state AND LOAD. MSTORE is the memory state AND STORE. HOLDM is the memory state AND LOAD AND GO.\n- WREG is the write state AND WRITEY AND GO.\n- PCEN is the instruction's last edge AND GO.\n\nFETCHING and CHECKING mark which checks run, so they do not need GO. MLOAD and MSTORE tell the memory what the edge does; the memory takes GO on its own wire.",
  writeOutputsLead: "Write the controller's output logic.",
  c1Task:
    "The module `outputs` has inputs S (the state's 3-bit code), GO, MEM, WRITEY, LOAD, and STORE. Its outputs are FETCHING, IREN, CHECKING, HOLDAB, HOLDR, MLOAD, MSTORE, HOLDM, WREG, and PCEN.\n\nS encodes the state: FETCH `000`, READ `001`, ALU `010`, MEMORY `011`, WRITE `100`. A state line is a comparison, such as `(S == 3'b001)` for READ.\n\nThe start has FETCHING and IREN written. Every other output is 0.\n\nPCEN is 1 at the instruction's last edge: WRITE always; MEMORY when WRITEY is 0 (a store); ALU when MEM and WRITEY are both 0 (a branch or jump). Then AND GO.\n\nThe test runs every state with a job, a load, a store and a branch, with GO at 1 and 0: 40 tests.",
  c1Hints: [
    "Copy IREN's line for each signal that makes a register take a word, with that signal's state.",
    "A common mistake: leaving GO out of WREG. If you do, WREG is 1 in WRITE while GO is 0, and those tests fail. Each signal that lets a register take a word needs: the state's line, AND what the kind needs, AND GO.",
    "`assign WREG = (S == 3'b100) & WRITEY & GO;`",
    "Name the last edge first:\n\n```\nlogic ENDS;\nassign ENDS = (S == 3'b100) | ((S == 3'b011) & ~WRITEY) | ((S == 3'b010) & ~MEM & ~WRITEY);\n```\n\nThen assign PCEN:\n\n```\nassign PCEN = ENDS & GO;\n```",
    "The whole answer:\n\n```\nlogic ENDS;\nassign FETCHING = (S == 3'b000);\nassign IREN = (S == 3'b000) & GO;\nassign CHECKING = (S == 3'b001);\nassign HOLDAB = (S == 3'b001) & GO;\nassign HOLDR = (S == 3'b010) & GO;\nassign MLOAD = (S == 3'b011) & LOAD;\nassign MSTORE = (S == 3'b011) & STORE;\nassign HOLDM = (S == 3'b011) & LOAD & GO;\nassign WREG = (S == 3'b100) & WRITEY & GO;\nassign ENDS = (S == 3'b100) | ((S == 3'b011) & ~WRITEY) | ((S == 3'b010) & ~MEM & ~WRITEY);\nassign PCEN = ENDS & GO;\n```",
  ],
  signalFaultsLead:
    'The figure runs Module 8\'s margin program, with a store of R3 to the display in place of R4 ← R3 + R3. With no fault, the machine stops after 18 edges and the display shows 66.\n\nTwo faults are shown. PCEN stuck at 1: the PC takes its next value at every edge, not once per instruction. MSTORE stuck at 0: the memory is never told to store any value.\n\nChoose a fault and press "Run until it stops". Before you run, say what you think the display will show. The view lists the micro-operations that each edge performs.',
  signalFaultPcen:
    "PCEN stuck at 1: The PC takes its next value at every edge, not once per instruction.\n- Edge 1 fetches R1 ← -184 at `000`, and the PC moves to `004`.\n- Edges 2, 3, and 4 finish R1 ← -184 while the PC moves to `008`, `00C`, and `010`.\n- Edge 5 fetches the word at `010`: `stop`.\n- The machine stops after 6 edges. R1 is -184. R2 and R3 are never written, and the display shows 0.",

  signalFaultMstore:
    "MSTORE stuck at 0: The states and the 18 edges are the same as without the fault, and the machine stops after 18 edges.\n- R3 is 66.\n- At the store's MEMORY edge, the only micro-operation is PC ← PC + 4.\n- The display shows 0.",
  explanation:
    "In Module 5, the output logic read the state alone. Here it reads the state and the decoder's signals too. The decoder's signals come from IR, the instruction register. IR changes only at a fetch edge, so those signals stay the same through the other edges of the instruction.\n\nEach micro-operation needs its control signals at 1 before its edge. Between edges, the state, the decoder and the output logic all settle, and the signals wait at the registers' enables. At the edge, each register whose enable is 1 takes its word.\n\nGO can fall in READ, when the stop logic halts the machine. The signals ANDed with GO fall with it before the edge.\n\nPCEN is 1 when the next state is FETCH. The edge that leads back to FETCH ends the instruction. The last challenge's answer names these edges ENDS: WRITE; MEMORY when WRITEY is 0; ALU when both MEM and WRITEY are 0.",
  generalisation:
    "Every instruction of the machine is a list of micro-operations, a few per edge. Each signal that lets a register take a word follows the same rule: the state's line, AND what the kind needs, AND GO. FETCHING, CHECKING, MLOAD and MSTORE do not read GO.\n\nA new kind whose micro-operations the machine already makes needs no change to the datapath. The next lesson asks what it does need.\n\nThe four views read the same simulator: the instruction, its micro-operations, the signals and the circuit. A wrong signal shows in all four at once.",
  writeControllerLead: "Write the whole controller: its next state and its outputs.",
  c2Task:
    "The module `controller` has inputs CLK, RST, GO, CALL, MEM, WRITEY, LOAD and STORE. Its outputs are the ten control signals from the last challenge and S. The starting code has lesson 3's state register and next-state logic. Every output except S is 0. Write each output as an `assign` statement. Build each on `state`, the `typedef enum` names, and the inputs. The tests run a load, a store, a branch and a call through their states from a reset. Before each edge, they check S and every output. Then a stop: GO falls while CLK is 1, and the state stays READ. The test suite has 35 tests.",
  c2Hints: [
    "Each output is one `assign`. The state's line is a comparison: `(state == READ)`.",
    "A common mistake: ANDing GO into CHECKING. When GO falls in READ, CHECKING must stay 1: the stop logic reads it.",
    "`assign HOLDAB = (state == READ) & GO;`",
    "`assign PCEN = (next == FETCH) & GO;` The edge that leads back to FETCH ends the instruction.",
    "The whole answer, in place of the ten zeros:\n\n```\nassign FETCHING = (state == FETCH);\nassign IREN = (state == FETCH) & GO;\nassign CHECKING = (state == READ);\nassign HOLDAB = (state == READ) & GO;\nassign HOLDR = (state == ALU) & GO;\nassign MLOAD = (state == MEMORY) & LOAD;\nassign MSTORE = (state == MEMORY) & STORE;\nassign HOLDM = (state == MEMORY) & LOAD & GO;\nassign WREG = (state == WRITE) & WRITEY & GO;\nassign PCEN = (next == FETCH) & GO;\n```",
  ],
  reflection:
    "The control unit is complete. The decoder says what the kind needs. The controller's state says which edge it is. Each signal that lets a register take a word follows the rule: the state's line, AND what the kind needs, AND GO.\n\nEach edge makes its micro-operations, and the instruction's transfer is all of them together. The course's machine leaves out a call through a register: RY ← PC + 4 and PC ← RA + c, whose target comes from a register. What would the machine need to run it? Which parts would change?",
  modelVsReality:
    "After an edge, the state changes and the output logic settles. On the way, a signal can take a passing value, as Module 8 showed. The course's registers and its RAM take a word only at an edge. A passing value that settles before the next edge does no harm. Many real memories write while their write signal is 1, not at an edge. A passing 1 on that signal can write a wrong word. Real designs take such signals from a register, or time them so they cannot pass through 1.",
} as const;
