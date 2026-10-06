// Copyright © 2026 Chris Snow

// The words of the lesson on the memory map.
//
// Drafted by the course's prose process from briefs of checked facts (see CLAUDE.md and
// docs/notes/module-6-memory.md) and checked against the simulator, then placed here by the
// lesson's structure in memory-map.ts. Edit a fact here only after checking it; the lesson's facts
// test (memory-map.facts.test.ts) holds the numbers.

export const PROSE = {
  question:
    "Later modules build a machine that follows a list of instructions. All it can do with the world is read and write words at addresses.\n\nThe shop needs this machine to show words on the office display and to read the freezer room's sensor. Neither is memory. The drawing has an Address switch for all six bits, Data switches on D (the word to write), a Save button on WE, a clock on CLK, the sensor's receiver, a box marked with a question mark, a display, and a readout of what a read gives on Q.\n\nHow can you make a display and a sensor answer reads and writes at addresses, alongside memory?",
  motivation:
    "To answer a read or a write, a part needs an address and control signals. A read is an address: the part puts the word at that address on Q. A write is an address, a word D, a rising edge of CLK, and a signal WE that says write. A part that answers reads and writes this way can sit at addresses alongside memory.\n\nThe display keeps a word. To answer a write at its address, a register takes D at a rising edge and keeps it. A read at the display's address returns that word.\n\nThe sensor measures the room's temperature. Its reading arrives on a wire called SENSOR. A read at the sensor's address puts that wire's value on Q. A write at the sensor's address does nothing.\n\nSomething must decide which part answers which address. A decoder (from Module 3) on the top two bits of the address gives each part a quarter of the addresses. A part that answers reads and writes at addresses, though it is not memory, is **memory-mapped**.",
  prediction:
    "The figure below runs the shop's memory. The top two bits of the address, A5 A4, choose the part: 00 chooses a list of fixed words, the limits (each room's lowest and highest allowed temperature), 01 chooses the RAM, 10 chooses the display, 11 chooses the sensor.\n\nChoose what you think DISPLAY shows at the end, then press \"Check my prediction\".",
  p1Question:
    "The figure writes `0012` to the display at `10 0000`, then `0030` to the display at `10 0110`. Both writes happen at rising edges of CLK, with WE at 1. What does the display show at the end?",
  p1Explain:
    "Both addresses, `10 0000` and `10 0110`, reach the display: the top two bits are 10 in both cases. The display ignores the low four bits and answers at all 16 of its addresses. So the second write, of `0030`, replaced the first. The display shows `0030`.",
  explorerLead:
    'The figure shows the shop\'s memory, closed. It has pins for A5 and A4, WORD, WE and CLK. Rows of bits show the 4-bit address A, the 16-bit data input D, and SENSOR at `FF48`.\n\nThe table lists four parts. At `00 0000` to `00 1111` is a memory filled with values when made, read and never written: a **ROM** ("read-only memory") of eight words. At `01 0000` to `01 1111` the RAM, the previous lesson\'s memory of bytes; at `10 0000` to `10 1111` the display; at `11 0000` to `11 1111` the sensor. The table marks which part answers now.\n\nTry this. Set A5 A4 to `11` and watch Q show the sensor\'s reading. Set A5 A4 to `10`, enter a value in D, set WE 1 and press "Clock CLK": DISPLAY takes D.\n\nPress the block to open it.',
  explorerAfter:
    "Inside, a decoder reads A5 and A4. Two AND gates each join one decoder output with WE: one drives the memory of bytes' write enable, the other the display's load enable. A word selector, with A5 A4 as its select inputs, puts the chosen part's word on Q. The limits sit at even addresses:\n- `00 0000` `FF06` (room 00, lowest)\n- `00 0010` `FF4C` (room 00, highest)\n- `00 0100` `0014` (room 01, lowest)\n- `00 0110` `0032` (room 01, highest)\n- `00 1000` `FF6A` (room 10, lowest)\n- `00 1010` `FF88` (room 10, highest)\n- `00 1100` `0050` (room 11, lowest)\n- `00 1110` `0064` (room 11, highest)",
  construction:
    "The ROM holds values that are never written: each room's lowest allowed temperature, then its highest, in tenths of a degree, read as signed numbers.\n\nIn SystemVerilog, you can fill an array from a list when you declare it:\n\n`logic [15:0] limits [0:3] = '{16'hFF06, 16'hFF4C, 16'h0014, 16'h0032};`\n\nThe list goes in braces after an apostrophe, as `'{...}`, lowest address first. `16'hFF06` is a 16-bit value in hexadecimal. An array filled from a list and never written is a ROM: it has no `always_ff`.",
  romLead: "Write the first four words of the limits as a ROM. It reads at a 2-bit address A.",
  c1Task:
    "You have a 2-bit address input A and a 16-bit output Q. At address 0, Q is `FF06`; at 1, `FF4C`; at 2, `0014`; at 3, `0032`.\n\nYou may use `logic`, vectors, `assign`, an array, and an array filled from a list.\n\nFour tests check each address.",
  faultsLead:
    "The figure shows the shop's memory opened. \"Run checks\" runs six steps: write `0012` at `10 0000` (the display); write `03E8` at `01 0100` (the RAM); read `01 0100`; read `01 0000`; read `10 0000`; read `11 0000`. Two faults break the circuit. The first: andDisplay changed to an OR gate. The second: andRam's output, the RAM's write enable WERAM, forced to 1. Press a wire in the drawing to see its name and value. Predict which part each fault lets take writes it should not.",
  faultsAfter:
    "5 of 6 checks fail. The first fault changes the display's AND gate to an OR gate, so the display's write-enable line becomes Y2 OR WE. When the test writes `03E8` to the RAM at `01 0100`, WE is 1, so the display writes even though it was not selected. DISPLAY becomes `03E8`. Every check from step 2 to step 6 compares Q and DISPLAY; DISPLAY is wrong in all of them, which is 5 of 6.\n\n1 of 6 checks fails: the read of `01 0000`. The second fault forces the RAM's write-enable line to 1. When the test writes `0012` to the display at `10 0000`, that write also reaches the RAM because the address's low bits are `0000`. The RAM stores `0012` at address `01 0000`. Two steps later the test reads `01 0000`, and the read returns this word instead of `XXXX`.",
  explanation:
    "The decoder reads A5 and A4 to choose which part takes a write. Its outputs Y0, Y1, Y2 and Y3 each select one part; only Y1 and Y2 are wired. Y1, with WE through an AND gate, drives the RAM's write enable WERAM. Y2, with WE through an AND gate, drives the display's load enable. Y0 and Y3 drive nothing. The word selector also reads A5 and A4 to choose which part's word reaches Q.\n\nThe ROM is read-only: it ignores WE. The sensor is read-only too: it has nothing to write. Only the RAM and the display take writes, and each only when both its line and WE are 1.\n\nIn the ROM and the RAM each address names its own byte. The display and sensor ignore the low four bits A3 to A0 and the WORD signal: each answers at all 16 addresses in its quarter.\n\nTo reads and writes from outside, the display and sensor look like memory: the same address pins, the same WE, the same clock edge.",
  openedLead:
    "The figure shows the shop's memory opened. Press A5 and A4. One of the decoder's outputs Y0 to Y3 becomes 1, and the table shows which part that output selects. The word selector takes A5 and A4 itself to choose which part's word reaches Q.",
  openedAfter:
    "The ROM and RAM open to show their banks of bytes, as in the previous lesson. The display remains closed, shown as a single 16-bit register.",
  generalisation:
    "The designer chooses which addresses reach which part. This lesson divided them: a quarter each to the ROM, the RAM, the display, and the sensor. The course's machine will choose its own addresses later. Nothing here fixes that choice.\n\nAny part that can be read or written as a word can be memory-mapped. A lamp register, a switch, a timer: they answer at addresses and look like memory to the reads and writes.\n\nA memory-mapped part need not behave like memory. The sensor's reading changes without any write. A write to the sensor is lost. Know which addresses are read-only and which let you write.",
  sensorLead:
    "The circuit writes a word at `11 0000`, one of the sensor's addresses, then reads at that address.",
  p2Question:
    "Fresh memory, with SENSOR at `FF48`. The circuit writes `0000` at address `11 0000` (WORD 1, WE 1, one edge), then sets WE to 0. What is Q?",
  p2Explain:
    "Q is `FF48`. A write to the sensor does nothing; the sensor keeps its own reading, which you did not change. Read the sensor's address and you always get its reading, whatever you wrote there.",
  shopLead:
    "This is the module's capstone. You draw it from blocks you have met: the decoder, the ROM of the limits, the memory of bytes, a 16-bit register for the display, a word selector, and AND and NOT gates. It reads and writes bytes and 16-bit words by address. The display and the sensor answer at addresses too, as if they were memory. The tests match the reads and writes a small program would make.",
  c2Task:
    "- Inputs: A5, A4, A (4 bits), D (16 bits), WORD, WE, CLK, SENSOR (16 bits); Outputs: Q (16 bits), DISPLAY (16 bits)\n- A5 A4 choose the part:\n  - 00: ROM (read only)\n  - 01: memory of bytes (read and written, with WORD and A as in the previous lesson)\n  - 10: display (write anywhere there sets it, read gives it back, DISPLAY always shows it)\n  - 11: sensor (read gives SENSOR, write changes nothing)\n- A write happens only at rising edge of CLK while WE is 1, to the part A5 A4 names\n- One test step raises A5 while CLK is 1, and nothing may be written then",
  reflection:
    "Module 6 built memory. You built a RAM of registers reached by address, a register file with two reads, bytes and aligned words, and a ROM filled from a list. You saw the shop's display and sensor answer at addresses, memory-mapped. Each looked like memory to the reads and writes, whether it was or not.\n\nA machine that reads a list of instructions will read words it needs from a ROM, as you read the limits. It will keep the data it works on in the RAM. But one block must compute with the words it reads: add them, subtract them, compare them, and signal what it found. How does one hardware block do all that?",
  modelVsReality:
    "The ROM's contents are hardwired into the circuit description in this model. A real ROM is programmed when the chip is made, sometimes written with special equipment, or occasionally rewritten slowly. The model's sensor value SENSOR can change whenever you press a button. A real sensor's reading changes on its own schedule, not synchronised to the clock. A real design takes the sensor's reading into a register at a clock edge, so the word stays constant while the machine uses it. The model's display shows the register value at once; a real display takes time to show the change.",
  c1Hints: [
    "One array holds the four words, filled from a list when you declare it. One `assign` reads it at A.",
    "The list goes lowest address first. Writing it from the last word to the first gives the words backwards. Each value needs its width: `16'hFF06`, not `FF06`.",
    "Here is a smaller example: `logic [7:0] two [0:1] = '{8'h12, 8'h34};` makes two bytes, `12` at 0 and `34` at 1.",
    "Part of the answer: `logic [15:0] limits [0:3] = '{16'hFF06, 16'hFF4C, 16'h0014, 16'h0032};`",
    "The complete answer: that line, then `assign Q = limits[A];`, between the module line and `endmodule`.",
  ],
  c2Hints: [
    "The decoder on A5 A4 gives each part a line. A part that can be written takes WE only through an AND gate with its line. The word selector on A5 A4 chooses Q.",
    "Wiring WE straight to the register's EN lets every write set the display. Wiring the selector's inputs in another order than the decoder's lines shows the wrong part.",
    "The RAM lesson's guard: WE AND OK let a write through only when OK was 1.",
    "The memory of bytes' WE is Y1 AND WE. The register's EN is Y2 AND WE.",
    "The decoder takes A5 on S1 and A4 on S0. An AND gate on Y1 and WE drives the memory of bytes' WE; an AND gate on Y2 and WE drives the register's EN. D goes to both, and CLK to both; A and WORD go to the ROM and the memory of bytes. The word selector takes the ROM's Q on the selector's input A, the memory of bytes' Q on B, the register's Q on C and SENSOR on the selector's input D, with A5 on S1 and A4 on S0. Its Y is Q, and the register's Q is DISPLAY.",
  ],
} as const;
