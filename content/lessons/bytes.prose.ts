// Copyright © 2026 Chris Snow

// The words of the lesson on bytes.
//
// Drafted by the course's prose process from briefs of checked facts (see CLAUDE.md and
// docs/notes/module-6-memory.md) and checked against the simulator, then placed here by the
// lesson's structure in bytes.ts. Edit a fact here only after checking it; the lesson's facts
// test (bytes.facts.test.ts) holds the numbers.

export const PROSE = {
  question:
    "Each memory so far kept words of one size. The freezer room's sensor sends 16-bit readings such as `FF48`, which is -18.4 degrees when read as signed. But the office keeps smaller things too, and 8 bits is enough for them.\n\nYou need one memory for both sizes. Four switches set an address. A WORD switch chooses whether you read and write a 16-bit reading or an 8-bit number. A Save button and a clock work as before. The display shows what you read on 16 wires.\n\nHow can one memory keep 8-bit and 16-bit things side by side, each reached by its address?",
  motivation:
    "A 16-bit memory wastes half of each word on an 8-bit number. A memory for 8-bit numbers fits those well. But then a 16-bit reading takes two of them, at two addresses next to each other.\n\nThis memory uses both sizes at once. It stores 8 bits at each address: this size is called a **byte**. A 16-bit word is two bytes: the low byte (bits 7 to 0) and the high byte (bits 15 to 8). This memory keeps the low byte at the lower address and the high byte at the next one. So `FF48` written at address `0110` (6) puts `48` at `0110` and `FF` at `0111` (7).\n\nA word at address 6 is the bytes at 6 and 7: can one access reach both? An access is one read, or one write at a single clock edge.",
  prediction:
    'Below are two fresh memories, each with 16 bytes at addresses `0000` to `1111`. A 4-bit input A chooses the address. D is a 16-bit word. Set WORD to 1 to read or write a full 16-bit word, or 0 to read or write just one byte. When you read a byte, you get it on Q\'s low 8 bits, with 0 on the high 8 bits. WE and CLK work as before to write. In each figure, choose what you think Q will be, then press "Check my prediction".',
  p1Question:
    "The memory is fresh. The figure writes the word `FF48` at address `0110` (WORD 1, one clock edge). Then it reads a byte from address `0111` (WORD 0, WE 0). What is Q?",
  p1Explain:
    "Q shows `00FF`. The word you wrote split in two: its low byte `48` at `0110` and its high byte `FF` at `0111`. A byte read puts that byte on Q's low 8 bits and 0 on the high 8 bits.",
  p2Question:
    "The memory is fresh. The figure writes the word `FF48` at address `0100` (one clock edge). Then it writes the byte `12` at address `0101` (WORD 0, the next edge). Then it reads the word at `0100` (WORD 1, no write). What is Q?",
  p2Explain:
    "Q shows `1248`. The word at `0100` is made of the byte at `0100` (which stayed `48`) and the byte at `0101` (which changed to `12`). So a single-byte write changed half the word.",
  explorerLead:
    "The figure shows a memory of 16 bytes. Set A and D using the rows of bits below the drawing; press WORD, WE and CLK's pins, or press \"Clock CLK\".\n\nInside are two banks: the even bank holds bytes at even addresses, the odd bank holds bytes at odd addresses. A bank's row is the place in that bank that A's bits 3 to 1 pick: the same row number in both banks. A's lowest bit, bit 0 (written rightmost), says which bank holds each byte.\n\nThe table lists all 16 bytes by address in binary. It marks the two bytes the banks are reading now (one from each bank) and the bytes the next edge will write while WE is 1.\n\nTry writing a word at an even address, then at an odd address. Watch which bytes the table marks and which ones change.",
  explorerAfter:
    "A word at an even address is one row of both banks: its low byte in the even bank, its high byte in the odd bank. One access reads or writes both bytes at once.\n\nA byte goes to one bank only: the even bank when A0 is 0, the odd bank when A0 is 1.",
  construction:
    "Each bank has its own write enable: WEE for the even bank, WEO for the odd bank.\n\nYou build the gates that make them from WE, WORD and A0, and a third output, ODD, which is 1 when a word is asked for at an odd address.\n\nA word at an odd address writes neither bank: this memory refuses it.\n\nTo use the editor: add parts with the part buttons. Press one port and then another to wire them. A failed test names the row and the part that drives the wrong output.",
  buildLead:
    "The circuit has no clock: it is gates only. The parts you can use are AND, OR, NOT and XOR.",
  c1Task:
    "Inputs: WE, WORD, A0. Outputs: WEE, WEO, ODD.\n\nWEE is 1 when WE is 1 and A0 is 0.\n\nWEO is 1 when WE is 1 and either WORD is 1 with A0 0 (a word at an even address) or WORD is 0 with A0 1 (a byte at an odd address).\n\nODD is 1 when WORD is 1 and A0 is 1. A word at an odd address makes WEE and WEO both 0.\n\nThe tests try all eight rows of WE, WORD and A0.",
  oddLead:
    "Your circuit makes ODD = 1 when you ask for a word (WORD 1) at an odd address. For that word WEE and WEO are both 0, so neither bank is written; ODD is 1 to report it. The figure writes the word `FF48` at address `0100`. Then it tries to write the word `0000` at address `0101`, which is odd. Finally, it reads back from address `0101`.",
  p3Question:
    "A fresh memory begins with no data. Edge 1: the word `FF48` is written at address `0100`. Edge 2: the circuit tries to write the word `0000` at address `0101`. Then WE becomes 0, with the address still at `0101`. What is Q?",
  p3Explain:
    "Q is `FF48`. When ODD is 1, the write does nothing. Because the address bits 3 to 1 are the same for `0100` and `0101`, a read at `0101` returns the word from `0100`.",
  faultsLead:
    'The figure shows the memory of bytes opened. When you press "Run checks", five steps run. First, the word `FF48` is written at address `0100`. Next, a byte `12` is written at address `0111`. The third step tries to write the word `0000` at address `0101`; WEE and WEO are both 0, and ODD is 1. The fourth step reads the word at `0100`. The fifth step reads the byte at `0111`.\n\nTwo faults are tested. One changes xorOdd, the XOR feeding WEO, to an OR gate. The other replaces notA0, the NOT feeding WEE, with a wire. Each fault breaks different checks.',
  faultsAfter:
    "When the XOR gate changes to OR, WEO becomes WE AND (WORD OR A0). The refused word at `0101` now writes to the odd bank; the odd bank receives D's high byte (`00`). When the word at `0100` is read, Q shows `0048` instead of `FF48`. 2 of 5 checks fail: the write at the odd address and the read that follows.\n\nWhen the NOT gate becomes a wire, WEE becomes WE AND A0. The very first word loses its low byte: Q shows `FFXX`. The refused word at `0101` also writes its low byte, `00`, into the even bank at `0100`. So the word at `0100` reads as `FF00`. 3 of 5 fail.",
  explanation:
    "A word at an even address fits into one row of each bank. The low byte is at the lower address, the high byte at the address above. Both bytes reach the output in one read or write. A word arranged this way is **aligned**; the rule that a word's address must be even is **alignment**.\n\nA word at an odd address would split across two rows: the odd bank's row and the even bank's row above it. Getting both bytes would need two separate accesses. This memory can only read or write one row per access, so it refuses an odd-address write. WEE and WEO are both 0, and ODD is 1 to report it. A read at an odd address returns the aligned word at the even address just below.\n\nThe low byte at the lower address is a design choice. This course's memory makes it, and the course's machine will keep it. Real machines do it both ways. Neither is wrong as long as the writer and the reader agree, just as in Module 1 the sensor and the display agree on the order of a word's bits.",
  openedLead:
    "The figure shows the memory opened: the same circuit, but now with the inputs free to set and the table of bytes. WEE is andEven's output and WEO is andOddWE's output. Change WORD, A, and WE and watch how WEE, WEO, and ODD respond. The selector labelled selD routes D's high byte to the odd bank when you write a word, and D's low byte when you write a byte.",
  openedAfter:
    "The two banks, `even` and `odd`, are memory components themselves, drawn as closed blocks. To the right of them are the selectors called `selByte`, `selLow`, and `selHigh`, and a join circuit, which choose which bytes go onto Q.",
  generalisation:
    "A memory of 32-bit words built the same way would have four banks, one byte each. Its words align when addresses are multiples of 4. This memory's 16-bit words need multiples of 2: even addresses. Addresses that name bytes let one memory keep both bytes and 16-bit words side by side.",
  readLead:
    "The table shows 16 bytes, filled when the memory was made. Work out three answers from the table.",
  c2Task:
    "The table below lists a memory's 16 bytes by binary address, with bytes in hexadecimal. Type three answers in hexadecimal: the word at `0110`, the byte at `1001`, and what this memory gives when a word is read at `1001`. Each answer is checked by the memory itself: it reads at that address and compares its answer with yours.",
  reflection:
    "Each address names one byte. A 16-bit word is two bytes, with its low byte at the lower address. A word is aligned when its address is even: both bytes share one row of two banks, and one access reaches them. A word at an odd address is refused: ODD is 1 and nothing is written.\n\nA machine that follows a list of instructions, built in later modules, will reach everything by address: its words in memory, and the shop's display and sensor too. But displays and sensors are not memory. How can a display or a sensor answer at an address, as if it were memory?",
  modelVsReality:
    "The banks in this model are simulated as components, not as gates. For a word at an odd address this model writes nothing, sets ODD to 1, and a read gives the word at the even address below. Real memories handle this differently. Some split the access into two, one row each. Some stop and report an error. The rule differs between designs. Real memory chips are often wider than a single byte inside. Like the selectors in this memory, they pick out the bytes asked for and deliver them.",
  c1Hints: [
    "Write the truth table: eight rows of WE, WORD and A0, and the three outputs.",
    "A common mistake: making WEO from WE and A0 alone. This writes the odd bank for a byte at an odd address, but it misses a word's high byte and wrongly writes a word at an odd address.",
    "An XOR gate is 1 when its two inputs differ: WORD 1 with A0 0, or WORD 0 with A0 1.",
    "WEE is WE AND (NOT A0). ODD is WORD AND A0.",
    "A NOT gate on A0 and an AND gate with WE make WEE. An XOR gate on WORD and A0 and an AND gate with WE make WEO. An AND gate on WORD and A0 makes ODD.",
  ],
  c2Hints: [
    "A word at an even address is two bytes: the one at that address (low) and the one at the next address (high).",
    "Writing the bytes in table order gives the word backwards. Put the high byte first.",
    "In the table: bytes at `0010` and `0011` are `48` and `FF`. The word at `0010` is `FF48`.",
    "`1001` is odd. A byte can be read anywhere; a word cannot. This memory gives the word at the even address below.",
    "The word at `0110` is the byte at `0111` then the byte at `0110`. The byte at `1001` is in the table. A word at `1001` is the word at `1000`: the byte at `1001` then the byte at `1000`.",
  ],
} as const;
