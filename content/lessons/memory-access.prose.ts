// Copyright © 2026 Christopher Snow

// The words of the lesson memory-access.
//
// Drafted by the course's prose process from briefs of checked facts (docs/notes/module-8-datapath.md
// and its briefs), checked against the simulator, and placed here by the lesson's structure. Edit
// a fact here only after checking it; the lesson's facts test holds the numbers.

export const PROSE = {
  question:
    "Every instruction so far works on registers and constants alone. Module 6's lesson gave the shop's display and sensor addresses of their own in a small memory of that lesson's design. This machine has its own addresses for the shop's devices: room A's sensor is a word read at `7D8`, room B's at `7E0`; the display shows the word written at `7C0`; the lamps take the word written at `7C8`. The machine's RAM, from `400`, keeps words written there. How does an instruction read a word at an address, or write one?",
  motivation:
    "Kind 3 is a load: `RY ← memory[RA + c]`, or `RY ← memory[c]`. Kind 4 is a store: `memory[RA + c] ← RB`, or `memory[c] ← RB`. The job digit says the size and the address: job 0 is a word (8 bytes, at a multiple of 8) at RA + c; job 1 a byte at RA + c; job 8 a word at c alone; job 9 a byte at c alone.\n\nc alone is an absolute address: every address the memory holds fits in the constant, so one instruction reaches any of them. `380027D8` reads: kind 3 (load), job 8 (a word at c alone), Y is R2, constant `7D8`. It is R2 ← memory[`7D8`]: room A's reading.",
  prediction:
    'The figure adds the memory to the datapath: one block, "memory", holding the ROM, the RAM and the shop\'s devices at their addresses. It reads the instruction at PC, as before, and also a word at the address on its ADDR input. ADDR is RESULT: the ALU\'s add works out the address.\n\nA block "A or 0" (named pickA) gives the ALU\'s A input either QA or 0. The decoder\'s output AZERO chooses 0 for an absolute address. The memory\'s output MQ is the word it reads. A word selector (named pickLoad) gives the register file\'s D either RESULT or MQ; the decoder\'s output LOAD chooses MQ.\n\nThe sensors read -184 (room A) and -250 (room B). PC is `000`, where `380027D8` waits. Choose an answer and press "Check my prediction". The "Clock edge" button appears after.',
  p1Question:
    "`380027D8` has A digit 0 and the constant `7D8`. After the next edge, what does R2 hold?",
  p1Explain:
    "R2 holds -184, room A's reading. At this instruction, AZERO was 1, so the ALU added 0 and `7D8`. LOAD was 1, so R2 took MQ: -184. 2008 is `7D8` itself, the address: what R2 would hold if LOAD did not choose MQ. X is what R0 + `7D8` would give: R0 has never been written, so its word is X.",
  showMarginLead:
    "The program reads both rooms, works out the margin between them, keeps it in the RAM, shows it on the display, and lights two lamps:\n\n- `000` `380027D8`: R2 ← memory[`7D8`] (room A)\n- `004` `380037E0`: R3 ← memory[`7E0`] (room B)\n- `008` `13234000`: R4 ← R2 - R3\n- `00C` `48040400`: memory[`400`] ← R4 (kind 4, a store, job 8)\n- `010` `480407C0`: memory[`7C0`] ← R4 (the display)\n- `014` `25005005`: R5 ← 5\n- `018` `480507C8`: memory[`7C8`] ← R5 (the lamps)\n- `01C` `84000000`: stop\n\nA store writes QB, register B's word, to the memory's D input. The decoder's output STORE says the edge writes. The tables show the program, R2 to R5, the buses RESULT, QB, MQ and YIN (pickLoad's output), the devices (the display read signed, and the lamps as three bits), and the RAM's word at `400`.",
  showMarginAfter:
    "The program stops after 8 edges, at `01C`. R2 holds -184, R3 -250, R4 66 and R5 5. The display shows 66, the RAM's word at `400` is 66, and the lamps show `101`. A store writes no register: the decoder sets WRITEY to 0 for it.",
  construction:
    "The memory refuses some loads and stores. It reports why on the CAUSEM output, and the stop logic stops the machine, as for a fetch. Three causes can stop it:\n\n- 31: no memory at the address (`7F8` or above).\n- 33: a word not at a multiple of 8, or a byte at a device (`7C0` or above).\n- 34: a store to the ROM (below `400`), or to a read-only device (signals word at `7D0`, sensors at `7D8` and `7E0`).\n\nWhen two causes apply, 31 takes priority over 33, and 33 over 34. Loads and stores the memory accepts return 00. So does any instruction that neither loads nor stores.",
  writeMemcheckLead: "Write the checks the memory makes on every load and store.",
  c1Task:
    'Write a module called `memcheck`. Its inputs are ADDR (64 bits), LOAD, STORE and BYTE; its output is CAUSEM (8 bits). BYTE is 1 for a byte, 0 for a word.\n\nThe starting text sets CAUSEM to `00`, then to `31` when ADDR is outside the memory (any of bits 63 to 11 is 1, or bits 10 to 3 are all 1: `7F8` to `7FF`), then back to `00` when neither LOAD nor STORE is 1. Add the checks for 33 and 34 using the rules above.\n\nThe addresses in bits: a device is at `7C0` or above, so bits 10 to 6 are all 1. The ROM is below `400`, so bit 10 is 0. The read-only devices `7D0`, `7D8` and `7E0` have bits 10 to 3 equal to `FA`, `FB` and `FC`.\n\nIn an `always_comb` block a later assignment replaces an earlier one, so put the checks in order: 34 first, then 33, then 31. You may use `module`, ports, `logic`, multi-bit signals, `assign`, selects, the bitwise operators, `always_comb`, `if`, `==` and `!=`.\n\nThere are 14 tests, each named by the access and the address, such as "store byte at 3F9".',
  c1Hints: [
    "Each rule is one `if`, and the order of the `if`s decides which cause wins.",
    "A common mistake: forgetting that only a store can give 34. A load from the ROM or a sensor is allowed.",
    "The store to the ROM: `if (STORE & (ADDR[10] == 1'b0)) CAUSEM = 8'h34;`",
    "The 33 checks: `if (BYTE & (ADDR[10:6] == 5'b11111)) CAUSEM = 8'h33;` and `if (~BYTE & (ADDR[2:0] != 3'b000)) CAUSEM = 8'h33;`",
    "The whole answer:\n\n```\nalways_comb begin\n  CAUSEM = 8'h00;\n  if (STORE & (ADDR[10] == 1'b0)) CAUSEM = 8'h34;\n  if (STORE & ((ADDR[10:3] == 8'hFA) | (ADDR[10:3] == 8'hFB) | (ADDR[10:3] == 8'hFC)))\n    CAUSEM = 8'h34;\n  if (BYTE & (ADDR[10:6] == 5'b11111)) CAUSEM = 8'h33;\n  if (~BYTE & (ADDR[2:0] != 3'b000)) CAUSEM = 8'h33;\n  if ((ADDR[63:11] != 53'h0) | (ADDR[10:3] == 8'hFF)) CAUSEM = 8'h31;\n  if (~(LOAD | STORE)) CAUSEM = 8'h00;\nend\n```",
  ],
  memoryFaultsLead:
    'The same program, with two faults to choose.\n\n"LOAD stuck at 0": the decoder\'s output LOAD is 0, so pickLoad always gives RESULT.\n\n"STORE stuck at 1": the decoder\'s output STORE is 1 for every instruction.\n\nChoose a fault and press "Run until it stops". Say first what the display will show.',
  memoryFaultsAfter:
    '"LOAD stuck at 0": the loads write their addresses instead of the words there. R2 holds 2008, which is `7D8`, and R3 holds 2016, which is `7E0`. R4 is 2008 - 2016 = -8, and the display shows -8. Nothing stops the machine: every address is one it accepts.\n\n"STORE stuck at 1": the machine stops at the first edge, at `000`, with cause 34. The load from room A\'s sensor has become a store to it as well, and the sensor is read only. No register is written.\n\nA check can catch a fault: the second stopped at once, while the first ran to the end with a wrong answer.',
  explanation:
    "The decoder sets the ALU's code to add for every load and store.\n\nA load's word arrives on MQ before the edge, and the edge writes it into the register Y names. A store's word, QB, is written at the edge into the memory.\n\nThe memory reads twice at once: the instruction at PC, and the word at ADDR. They are two reads of one memory, as the register file has two reads.\n\nThe decoder's new outputs, AZERO, LOAD, STORE and BYTE, are control signals like WRITEY and BCONST.\n\nThe memory checks every load and store before the edge. A store it refuses writes nothing: the memory's writes, like PC and the register file, wait for GO.",
  generalisation:
    "A byte load fills the register's low 8 bits with the byte and the rest with 0s. A byte store writes the register's low 8 bits. This lesson's programs load and store words only; Module 6 showed bytes and words side by side in memory.\n\nThe machine's words are 8 bytes at addresses that are multiples of 8, with the low byte at the lower address as in Module 6. Module 6's words were 2 bytes at even addresses.\n\nThe RAM holds 960 bytes, from `400` to `7BF`. The devices are 7 words, from `7C0` to `7F7`.\n\nEvery device is reached with the same load and store as the RAM. The machine needs no instruction of its own for the display or the sensors.",
  writeMemoryLead:
    "Complete the datapath's text with its two selectors: one picks the ALU's A input, the other picks the register file's write data.",
  c2Task:
    "The text is the `machine` module: the complete datapath using the course's memory, decoder, registers, alu and stops modules, plus the widening and pickB from earlier lessons.\n\nInputs: CLK, RST, SENSORA and SENSORB (each 64 bits). Outputs: PC, HALT, CAUSE, DISPLAY and LAMPS.\n\nTwo selectors are missing. The starting code has `assign ALUA = QA;` and `assign YIN = RESULT;`. Replace both:\n\n- ALUA is the ALU's A input. When AZERO is 0, it reads QA. When AZERO is 1, it reads 0.\n- YIN is the register file's D input. When LOAD is 0, it reads RESULT. When LOAD is 1, it reads MQ.\n\nThe ROM holds this lesson's program. The tests set SENSORA to -184 and SENSORB to -250, reset the machine, and run 8 edges to the stop.\n\nThere are 10 tests. They check PC after each edge, the display from the fifth edge on, the lamps from the seventh, HALT and CAUSE at the stop, and that one more edge leaves PC at `01C`.\n\nYou may use `always_comb`, `case` and the other features of earlier challenges.",
  c2Hints: [
    "Each selector chooses between two words by one control signal, as pickB chooses by BCONST.",
    "A common mistake: giving ALUA the constant when AZERO is 1. The constant goes to B; A takes 0.",
    "ALUA: `case (AZERO)` with `1'b0: ALUA = QA;` and `1'b1: ALUA = 64'h0;`.",
    "YIN: `case (LOAD)` with `1'b0: YIN = RESULT;` and `1'b1: YIN = MQ;`.",
    "The whole answer, in place of the two assignments:\n\n```\nalways_comb\n  case (AZERO)\n    1'b0: ALUA = QA;\n    1'b1: ALUA = 64'h0;\n  endcase\n\nalways_comb\n  case (LOAD)\n    1'b0: YIN = RESULT;\n    1'b1: YIN = MQ;\n  endcase\n```",
  ],
  reflection:
    "Loads and stores reach the RAM and the shop's devices at their addresses. The memory refuses what it does not hold.\n\nEvery program so far runs its instructions in order, from address `000` to the stop.\n\nThe office wants the lower of the two readings on the display. How can a program do one thing or another, depending on what it finds?",
  modelVsReality:
    "In this model, the memory answers a load within the edge, so a load takes one edge like any other instruction. A real memory is slower than the ALU, and a real machine often waits for it.\n\nThe model reads the instruction and the data from one memory at once. A real chip often keeps them apart, or adds small fast copies of memory close to the datapath.\n\nThe sensors here are words the figure sets. A real sensor's reading arrives on its own time, not in step with the clock. A real design takes the reading into a register at a clock edge, so the word stays the same while the machine uses it, as Module 6's note on the model explained.",
  fieldsLead:
    "In a load, Y names the register written. In a store, B names the register written out. With job 8, C is the address and A is unused. Choose the load or the store.",
  mapLead:
    "The rows show the memory: ROM (`000` to `3FF`), RAM (`400` to `7BF`), seven devices at `7C0` (display), `7C8` (lamps), `7D0` (DOOR bit 0, WARM bit 1), `7D8` (sensor A), `7E0` (sensor B), `7E8` (timer), `7F0` (waiting); later modules use the timer and waiting. From `7F8` up, no memory gives cause 31 for every access. Columns show: load word, load byte, store word, store byte. Each cell says yes or the cause that stops the machine. Each part's first address, a multiple of 8, is checked. An unaligned word gives cause 33, or 31 if no memory. Where two causes apply, the lower wins: a store byte at DOOR and WARM or a sensor gives 33, not 34. Module 6's memory lost a write to its sensor; this machine stops with 34.",
} as const;
