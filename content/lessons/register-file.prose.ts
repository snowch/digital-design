// Copyright © 2026 Christopher Snow

// The words of the lesson on the register file.
//
// Drafted by the course's prose process from briefs of checked facts (see CLAUDE.md and
// docs/notes/module-6-memory.md) and checked against the simulator, then placed here by the
// lesson's structure in register-file.ts. Edit a fact here only after checking it; the lesson's facts
// test (register-file.facts.test.ts) holds the numbers.

export const PROSE = {
  question:
    "The previous lesson's RAM keeps a setting for each room and shows one on the display. The office now has two displays side by side, left and right, to compare two rooms' settings. The switches for the number (D), the room to save (WA), and Save work as before. Two more pairs of switches choose a room for each display: RA for the left, RB for the right.\n\nBoth displays must show their rooms' settings at the same time. A save must still change one room's setting at a rising edge. The RAM gives one word at a time on Q. How can a memory give two words at once, each at its own address, but take one write at a time?",
  motivation:
    "The RAM has one selector, so one address and one word on Q at a time. Build a second RAM for the right display and you would need to write every save into both. If a save reached only one of the two RAMs, the two displays would show different settings for the same room.\n\nA read does not change the registers. The word selector only looks at their outputs. So a second selector can look at the same registers at the same time, with its own address. Writing changes a register, so the write side needs: one decoder, one AND gate per word with WE, one write address.\n\nA small memory of registers can give out more than one word at once. Each read has its own address. It takes one write at a time. Such a memory is called a **register file**.",
  prediction:
    'The figures show a four-word circuit built as described. The write side has write address WA1 WA0, D, WE and CLK. Two reads give the outputs. QA shows the word at address RA1 RA0, and QB shows the word at address RB1 RB0. Choose an answer in each figure, then press "Check my prediction".',
  p1Question:
    "Fresh start. WA1 WA0 = 01, D = `0101`, WE = 1, and both read addresses RA1 RA0 and RB1 RB0 are 01. CLK rises (edge 1), then WA1 WA0 = 10, D = `1100`, and CLK rises again (edge 2). What is QB at the end?",
  p1Explain:
    "QB is `0101`. Edge 1 wrote word 01; edge 2 wrote word 10 and left word 01 as it was. QA and QB both name word 01, so both show it: two reads can name the same word.",
  p2Question:
    "Fresh start. `0101` is written at 01 (edge 1), with RA1 RA0 = 01. Then D changes to `1111`, WE is still 1, and CLK does not rise. What is QA?",
  p2Explain:
    "QA is `0101`. D reaches word 01's register, but the register takes it only at the next rising edge. Until that edge, a read of the word being written shows the word kept.",
  explorerLead:
    "This is the four-word circuit from the predictions, closed. Its inputs are the write address (WA1 and WA0), write enable (WE), and clock (CLK). Set D with the bit buttons under the drawing. For reads, RA1 and RA0 control QA, and RB1 and RB0 control QB.\n\nThe table shows the four words by address. It marks which word QA reads, which word QB reads, and which word the next edge writes while WE is 1.\n\nPress the block to open it. Inside you see the decoder, four AND gates, four registers, and two word selectors. Both selectors read from all four registers.\n\nThis register file has four words and two reads.",
  explorerAfter:
    "selectA follows the address RA1 RA0 and drives QA. selectB follows RB1 RB0 and drives QB. Neither selector has a clock, so each output follows its address at once. The write side is unchanged from the RAM: one write address, one write per edge.",
  construction:
    "You build a register file of two words. The addresses are one bit: WA for writes, RA and RB for reads. Start with the two-word memory from the previous lesson, and add a second read.\n\nUse the editor to add parts and wire them. Press one port, then another port to join them. When a test fails, it names the step and the part that drove the wrong output.",
  buildLead:
    "The parts offered are a register (inputs D, EN, CLK; output Q), a word selector (inputs A, B, S; output Y: Y is A when S is 0 and B when S is 1), AND, and NOT.",
  c1Task:
    "Inputs: WA (one bit), D (four bits), WE, CLK, RA (one bit), RB (one bit). Outputs: QA and QB (four bits each).\n\nAt a rising edge of CLK where WE is 1, the word at address WA takes D. The other address keeps its word. At an edge where WE is 0, both words keep theirs.\n\nQA is always the word at address RA, and QB the word at address RB, with no clock edge needed.\n\nThe tests check QA and QB. They include steps where RA and RB change while CLK is 1, and one where WA changes while CLK is 1.",
  faultsLead:
    "The figure shows the register file opened. \"Run checks\" runs eight steps. It writes `0001` at address 00, `0010` at 01, `0100` at 10 and `1000` at 11, one rising edge each, then reads two words at once with WE at 0. Each of the four reads pairs RA's address first with RB's: 00 and 11, then 01 and 10, then 10 and 01, then 11 and 00.\n\nThree faults are ready to test: the AND gate andW2 changed to an OR gate; the wire W1 forced to 0; the decoder's NOT gate on S1 replaced by a plain wire. Before you run each one, predict which of the eight steps will go wrong and on which output.",
  faultsAfter:
    'Fault 1: The AND gate andW2 is changed to an OR gate. W2 becomes Y2 OR WE, so every write also writes word 10, and word 10 ends holding the last word written. 2 of 8 checks fail: QA reads word 10 as `1000` instead of `0100` in "read 10 and 01", and QB reads `1000` instead of `0100` in "read 01 and 10". A fault in the write side shows on whichever output reads that word.\n\nFault 2: The wire W1 is forced to 0. Word 01 is never written. 2 of 8 fail: both reads of word 01 show `XXXX` instead of `0010`.\n\nFault 3: The decoder\'s NOT gate on S1 is replaced by a plain wire. S1 is no longer inverted. A write at 00 or 01 writes nothing, and a write at 10 or 11 writes two words. 8 of 8 fail.',
  explanation:
    "A read only looks at the registers through a selector. It takes the registers' outputs and changes nothing. Any number of reads can share the same registers, each with its own selector and address. Each read costs one selector.\n\nA write changes a register. Two writes at one rising edge could name the same address with two different words. The circuit would then need a rule for which one wins, a second decoder, and a selector in front of each register's D to choose between two words. So this register file takes one write per edge.\n\nA read of the word being written shows the word the register kept until the edge, and the new word after it. The second prediction showed the kept-word part: a read before an edge shows the word the register kept.",
  openedLead:
    'The figure shows the register file opened. To see words on the reads, first write two different words: set WA1, WA0 and D, set WE to 1, then press "Clock CLK". Change WA1, WA0 and D to new values, then press "Clock CLK" again. Now press RA1, RA0, RB1 and RB0 and watch QA and QB. The decoder\'s outputs follow WA1 WA0. Each W wire is a decoder output AND WE, so it becomes 1 only while WE is 1.',
  openedAfter:
    "The register file's size is the designer's choice. This one has four words of four bits; the course's register file component takes the number of words and their width as settings.",
  generalisation:
    "A memory with many words written as gates would be one `always_ff` per register and a long selector. SystemVerilog writes a memory in three lines, as an array. The figure shows the previous lesson's RAM written that way, generated from the circuit beside it.",
  ramTextLead:
    "`logic [3:0] words [0:3];` declares an **array**: four words of four bits, numbered 0 to 3. The word width comes before the name, the number of words after.\n\n`assign Q = words[A];` reads the word at address A, with no clock: Q follows A.\n\n`always_ff @(posedge CLK) if (WE) words[A] <= D;` writes D into the word at address A at a rising edge while WE is 1.\n\nThe text and the drawing are the same circuit. The course turns an array into a memory component, drawn as one closed block, not into gates.",
  ramTextAfter:
    "In this RAM, the same address A picks both the word to read and the word to write. Below, you write as text the register file you drew: each read has its own address.",
  writeLead:
    "Write the register file as text. The module line has inputs WA (write address), D (data), WE (write enable), CLK, and RA and RB (the two read addresses). Outputs are QA and QB (the two words you read).",
  c2Task:
    "- Write the register file between the given module line and `endmodule`.\n- Four words of four bits. At a rising edge of CLK where WE is 1, the word at address WA takes D.\n- QA is the word at address RA and QB the word at address RB, with no clock.\n- You may use `assign`, `always_ff`, `if`, vectors and an array.\n- The tests include a step where WA and D change while CLK is 1.",
  reflection:
    "A register file is registers with one write side and one selector per read. Reads only look at the registers, so several reads can share them. A write changes a register, so the circuit writes at most one register per edge. SystemVerilog writes a memory as an array: read by index with no clock, written at an edge in an `always_ff` block under `if`.\n\nSo far every word in a memory has had the same size. The shop's temperature readings are 16-bit words, and some things the office keeps are 8 bits. How can one memory hold 8-bit and 16-bit things side by side?",
  modelVsReality:
    "The clocked model settles every selector at once. In hardware, each read adds a selector and wires that take time to settle.\n\nThe text's array becomes a memory component in this course's simulator. Tools that build real chips may turn the same text into flip-flops and selectors, or into a ready-made memory block built into the chip, depending on its size.\n\nA real register file at power-on holds 0s and 1s nobody chose. The simulator marks those as X, which you see when a register has not been written yet.",
  c1Hints: [
    "Writing works as in the two-word memory, using WA as the address. A read is a word selector that looks at both registers. Each read needs its own selector.",
    "A common mistake: wiring RA to both selectors makes QB show the word at RA. Wiring WA to a selector's S shows the word being written, not the word you asked for.",
    "One register's Q can feed as many selector inputs as you like. Reading from it does not change it.",
    "The first register's EN is (NOT WA) AND WE. The second register's EN is WA AND WE. Two word selectors each take the first register's Q on A and the second's on B.",
    "Place a NOT gate on WA. One AND gate takes NOT WA and WE and drives the first register's EN. Another takes WA and WE and drives the second's. Wire D and CLK to both registers. Place two word selectors. Each has the first register's Q on A and the second's on B. One takes RA on S and its Y is QA. The other takes RB on S and its Y is QB.",
  ],
  c2Hints: [
    "One array keeps the words. Each output is one read of it, at its own address. The write is one `always_ff`.",
    "Declaring two arrays, one per output, makes two separate memories. With one write line, only one gets written. Writing `words[RA]` for QB gives QA's word.",
    "The figure's RAM reads with `assign Q = words[A];`.",
    "`logic [3:0] words [0:3];` and `assign QA = words[RA];`.",
    "Between the module line and `endmodule`: `logic [3:0] words [0:3];`, then `assign QA = words[RA];`, `assign QB = words[RB];`, and `always_ff @(posedge CLK) if (WE) words[WA] <= D;`.",
  ],
} as const;
