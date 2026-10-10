// Copyright © 2026 Christopher Snow

// The words of the lesson fetch.
//
// Drafted by the course's prose process from briefs of checked facts (docs/notes/module-8-datapath.md
// and its briefs), checked against the simulator, and placed here by the lesson's structure. Edit
// a fact here only after checking it; the lesson's facts test holds the numbers.

export const PROSE = {
  question:
    "In the last two lessons you put each instruction on IR by hand, and set WRITEY and BCONST yourself. The shop's machine must do its jobs one after another on its own: one instruction per edge. Module 6 built a ROM, a memory of fixed words read at an address. The machine keeps its program, its list of instructions, there. At each edge, how does the machine know which instruction comes next?",
  motivation:
    "The ROM holds 1024 bytes at addresses `000` to `3FF`. An instruction is 4 bytes, stored low byte first at an address that is a multiple of 4, so the ROM holds 256 instructions. A register holds the address of the next instruction to run. It is the **program counter**, PC. At each edge, PC takes PC + 4: the address of the instruction after this one. A reset (RST at 1 at an edge) makes PC 0, so the first instruction is the one at `000`.",
  prediction:
    'The figure shows the whole datapath so far: PC, the ROM, a "+ 4" block and two closed blocks the course supplies. The "decoder" works out WRITEY, BCONST and the ALU\'s code from K and J, the signals you set by hand before. It is closed: Module 9 opens it. The "stop logic" computes HALT, which says what the coming edge does: HALT is 1 if the coming edge stops the machine and writes nothing. It also gives CAUSE, two hexadecimal digits that say why.\n\nThe ROM holds two instructions: `000` R1 ← 5 and `004` R1 ← R1 + 1, nothing else, and every byte after them is 0. The figure has already made two edges: R1 is 6, PC is `008`, and IR carries `00000000`. Choose an answer and press "Check my prediction". The "Clock edge" button appears after.',
  p1Question: "PC is `008`, and the ROM holds only 0s from there. What does the next edge do?",
  p1Explain:
    'The machine stops with cause 21. The word at `008` is `00000000`. Its kind is 0, no instruction: the decoder gives 21 on its output CAUSED, which says "illegal instruction". The stop logic sets HALT to 1 and CAUSE to 21 before the edge. With HALT at 1, the edge writes no register and PC keeps `008`. The simulator stops the clock and says why. A machine that ran on would read 0s for ever. A program ends with the instruction `stop` instead.',
  marginLead:
    'The program works out the office\'s margin: how far room A\'s reading is above the limit. It is five instructions:\n\n- `000` `25001F48`: R1 ← -184 (room A)\n- `004` `25002F06`: R2 ← -250 (the limit)\n- `008` `13123000`: R3 ← R1 - R2\n- `00C` `12334000`: R4 ← R3 + R3\n- `010` `84000000`: stop\n\nThe table "Program" lists each instruction with its address and marks the row PC names. PC is a 64-bit register (block "register", named pc). Its output goes to the ROM\'s address and to the "+ 4" block, whose output PC4 comes back to PC\'s D. Press "Clock edge" to make one edge, or "Run until it stops". The table "Buses" shows PC, PC4, IR and RESULT. Under the figure, "The last edge, step by step" breaks down each edge: PC changes at step 2 and IR at step 4.',
  marginAfter:
    "The program stops after 5 edges, with PC at `010`: the `stop` instruction. Its cause is 00. R1 holds -184, R2 -250, R3 66 and R4 132. Room A is 66 tenths of a degree above the limit. At the stop, the decoder sets its output STOP to 1, and the stop logic sets HALT to 1. The edge after writes nothing, and PC stays `010`. RESULT is X at the stop, because the stop instruction's A and B digits name R0, which nothing has written; nothing uses that RESULT.",
  construction:
    "PC is a register with reset and enable, like Module 5's counter. Its enable is GO, which the stop logic sets: GO is 1 unless HALT is 1. In `always_ff`, if RST is 1, PC becomes 0. Otherwise, if GO is 1, PC becomes `PC + 4`. The challenge below writes it, with the `+ 4` inside.",
  writePcLead: "Write the program counter: reset to 0, then 4 more at every edge while GO is 1.",
  c1Task:
    "Write a module called `counter`. Inputs: CLK, RST and GO. Output: PC, 64 bits.\n\nAt a rising edge of CLK: if RST is 1, PC takes 0. Otherwise, if GO is 1, PC takes `PC + 4`. Otherwise PC keeps its value.\n\nThe starting text adds 4 at every edge, with no reset and no GO. Change it. You may use `module`, ports, `logic`, multi-bit signals, `always_ff`, `if` and `+`.\n\nThe tests run 11 steps and check PC in 10 of them. One step changes GO while the clock is high. One edge has RST at 1 and GO at 0.",
  c1Hints: [
    "PC is a register: write it in `always_ff @(posedge CLK)`, with RST first.",
    "A common mistake: testing GO before RST. A reset must give 0 even while GO is 0.",
    "Module 5's registers lesson wrote a register with a reset and an enable as `if (RST) Q <= 4'b0000; else if (EN) Q <= D;`. The counter here has the same shape.",
    "Start with `if (RST) PC <= 64'h0;` then `else if (GO) ...`.",
    "The whole answer:\n\n```\nalways_ff @(posedge CLK)\n  if (RST) PC <= 64'h0;\n  else if (GO) PC <= PC + 64'h4;\n```",
  ],
  fetchFaultsLead:
    'The margin program again, with two faults to choose. "PC4 stuck at 0": the `+ 4` block\'s output, the bus PC4, is 0. "STOP stuck at 0": the decoder\'s output STOP is 0, no matter what instruction runs.\n\nChoose a fault. Press "Clock edge" a few times, or "Run until it stops". Say first what PC will do.',
  fetchFaultPc4:
    '"PC4 stuck at 0": every edge gives PC 0. The machine runs the instruction at `000`, `R1 ← -184`, at every edge and never reaches `stop`. "Run until it stops" gives up after 500 edges. R2 stays X.',
  fetchFaultStop:
    '"STOP stuck at 0": `stop` at `010` does not stop the machine. PC goes on to `014`, where the ROM holds `00000000`. The decoder gives cause 21 (hexadecimal) there, which the Buses table writes as `00100001` on CAUSE, and the machine stops after 6 edges, with PC at `014`. The check for an instruction the decoder does not know stopped a program whose own `stop` was broken.',
  explanation:
    "Reading the instruction at the address PC holds is called **fetch**: taking the instruction from memory. In this machine, every edge fetches and does one instruction. Between two edges, PC settles to its new value, the ROM gives the instruction at that address on IR, and the datapath works out the result. The next edge writes the result and gives PC its next value. IR is a bus: the ROM's output at PC. It is not a register, and it changes as soon as PC does.\n\nThe decoder works out the control signals from K and J alone. This decoder is not Module 3's decoder, which turned a number into one line at 1. For a register job, BCONST is 0. For a constant job, BCONST is 1. For both, WRITEY is 1. For `stop`, WRITEY is 0 and STOP is 1.\n\nGO, which you met in the construction, is PC's enable. The register file's write enable is now WREG: WRITEY AND GO. An edge that stops the machine changes nothing.\n\nThe ROM reports its cause on CAUSEF and the decoder on CAUSED. The stop logic passes one on as CAUSE. When CAUSE is 00, nothing is wrong; at `stop` CAUSE is also 00, and the machine stops on the decoder's STOP.",
  generalisation:
    "The ROM checks each fetch and gives its cause on the bus CAUSEF: 11 when PC is outside the ROM at `400` or above; 12 when PC is not a multiple of 4; 00 otherwise. When both are true, 11 wins. The decoder gives 21 for an instruction it does not know. The stop logic stops the machine on any of these causes, and CAUSE says which.\n\nCounting up by 4 never gives a PC that is not a multiple of 4. It reaches `400` only if a program runs off the ROM's end without a stop.",
  writeChecksLead: "Write a module that checks each fetch address.",
  c2Task:
    "Write a module called `checks` with one input (PC, 64 bits) and one output (CAUSEF, 8 bits).\n\n- CAUSEF is `11` (hexadecimal) when any of PC's bits 63 to 10 is 1: PC is outside the ROM.\n- CAUSEF is `12` when bits 1 and 0 are not both 0: PC is not a multiple of 4.\n- Otherwise CAUSEF is `00`.\n\nReplace the starting code that sets CAUSEF to `00` always. You may use `module`, ports, `logic`, multi-bit signals, `assign`, selects, `always_comb`, `if`, `==` and `!=`. In `always_comb`, a later assignment overwrites an earlier one. 11 tests check your code, each named by PC in hexadecimal.",
  c2Hints: [
    "Set CAUSEF to `00` first. Then let each failing check replace it.",
    "Put the outside-ROM check last. It must win when both checks find an error.",
    "For the alignment check, use `if (PC[1:0] != 2'b00) CAUSEF = 8'h12;`.",
    "The outside check compares bits 63 to 10 (54 bits) with 0: `if (PC[63:10] != 54'h0) CAUSEF = 8'h11;`.",
    "Replace `assign CAUSEF = 8'h00;` with:\n\n```\nalways_comb begin\n  CAUSEF = 8'h00;\n  if (PC[1:0] != 2'b00) CAUSEF = 8'h12;\n  if (PC[63:10] != 54'h0) CAUSEF = 8'h11;\nend\n```",
  ],
  reflection:
    "The machine now runs a program on its own. The PC names the next instruction. The ROM gives it on IR. The decoder sets the control signals. The stop logic stops the machine at `stop` or when the instruction cannot run.\n\nEvery instruction still works on registers and constants alone. It does not read or write memory.\n\nFrom Module 6: the shop's sensors provide words at their addresses; the display shows what is written to its address. How can a program read the sensors or write the display?",
  modelVsReality:
    "Here, every instruction takes one clock edge. Fetch and all the work fit between two rising edges. The clock must wait for the slowest path: from PC through the ROM, decoder, register file, and ALU, and back. Module 9 will split instructions over several edges.\n\nThe simulator stops the clock when the machine stops and shows you why. A real machine has no one to tell. Module 12 will let a program say what happens instead.\n\nThe model's ROM gives its word as soon as PC settles. A real ROM takes time to read the address and return the word.",
  edgesLead:
    "Each lane represents one signal or bus: CLK; PC in three hexadecimal digits; IR in eight digits; RESULT read signed; WREG. Arrows mark the rising edges ↑1 to ↑5. A slider moves the red line through time, half a clock period at a time, and the table shows each lane's value at the red line. It opens just before ↑1.",
  edgesAfter:
    "Read a lane just left of a rising edge to see what that edge writes. The first four edges each write a register. At ↑1, -184 enters R1. At ↑2, -250 enters R2. At ↑3, 66 enters R3. At ↑4, 132 enters R4. At each of them PC moves on by 4, and IR and RESULT change to the next instruction's. From ↑4 to the end, IR holds `stop`, whose A and B fields are 0, so the ALU reads R0, which the program never writes, and RESULT is X. At ↑5, WREG is 0 and HALT is 1. Nothing is written, and PC stays `010`. This drawing shows each edge's outcome, and the margin figure shows the order inside one edge.",
} as const;
