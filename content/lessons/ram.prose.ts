// Copyright © 2026 Christopher Snow

// The words of the lesson on RAM.
//
// Drafted by the course's prose process from briefs of checked facts (see CLAUDE.md and
// docs/notes/module-6-memory.md) and checked against the simulator, then placed here by the
// lesson's structure in ram.ts. Edit a fact here only after checking it; the lesson's facts
// test (ram.facts.test.ts) holds the numbers.

export const PROSE = {
  question:
    "The registers lesson kept one number: four switches set it, and Save kept it. Now the office needs one setting for each of the four rooms, numbered 00 to 11 as in the decoders lesson. Four switches set a number. Two more switches, A1 and A0, choose a room.\n\nPress Save and the circuit keeps the number as that room's setting. The other three rooms' settings stay as they were. The display shows the setting of whichever room A1 A0 chooses. Move A1 and A0 and the display shows another room's setting. One clock, CLK, runs the whole circuit.\n\nHow can a circuit keep four words and give back whichever one a number picks?",
  motivation:
    "A register keeps one word (from the registers lesson). Four rooms need four registers, one for each room's setting.\n\nWhen Save is pressed at a clock edge, the chosen room's register must take the new number, and the other three must keep their words. That register's load enable EN must be 1 at that edge, and the other three must be 0. The display must show only the chosen room's register.\n\nBoth jobs choose one thing out of four by a two-bit number. The decoder (from the decoders lesson) turns A1 A0 into exactly one of four lines at 1. A selector passes one of four words to its output, chosen by the same two inputs. The number that picks one word out of several is its **address**. Here the address is A1 A0, the room's number.",
  prediction:
    'Words kept in registers, any one of which can be written or read by its address, make a **random-access memory** or **RAM**. This is "random access" because any word is reached as fast as any other, by its address, not one after another.\n\nThe four-word RAM below has inputs: the address (A1 and A0), D (the word to write), WE (write enable: a rising edge of CLK writes when WE is 1), and CLK. WE is the Save button\'s signal. Its output is Q, one word of four bits. Choose an answer, then press "Check my prediction". A timing diagram shows what the simulator did.',
  p1Question:
    "The RAM starts fresh: nothing has been written yet. The figure sets A1 A0 to 10, D to `0110`, and WE to 1, then CLK rises once. Now it sets A1 A0 to 01, WE to 0, with no rising edge. What will Q be?",
  p1Explain:
    "Q is `XXXX`: the rising edge wrote `0110` into word 10 only, and Q shows whatever word A1 A0 names. Changing A1 A0 to 01 changed Q straight away, with no edge. Word 01 was never written, so the simulator does not know it.",
  p2Question:
    "The RAM is fresh. The figure sets A1 A0 to 10, D to `0110`, WE to 1, then CLK rises (edge 1); now it sets A1 A0 to 01, D to `1001`, WE still 1, and CLK rises (edge 2). It then sets A1 A0 back to 10, WE to 0, with no edge. What will Q be?",
  p2Explain:
    "Q is `0110`. Edge 2 wrote `1001` into word 01 and left word 10 unchanged. Each rising edge changes only the word the address names when WE is 1.",
  explorerLead:
    'The figure shows the four-word RAM as a closed block labelled "RAM". Press A1 and A0 (the address pins) to choose an address. Set D with the row of bit buttons under the drawing, headed "Input D". Press WE to 1. "Clock CLK" gives one rising edge. "Start again" resets every word to unknown.\n\nThe table under the drawing lists each word by its address (00, 01, 10, 11). It shows which word the address names now (the one on Q), and, while WE is 1, which word the next edge will write.\n\nTry this: set an address with A1 and A0; set D; press WE to 1; press "Clock CLK"; then change the address with A1 and A0 and watch Q.\n\nPress the RAM block to open it. You see a decoder, four AND gates (andW0 to andW3), four registers (word0 to word3) and a word selector. Press a register to see its four flip-flops. Press a flip-flop to see its latches.',
  explorerAfter:
    "The decoder's outputs (Y0 to Y3) feed the AND gates, one each. WE feeds all four. Each AND gate's output (W0 to W3) is one register's load enable. The word selector takes all four registers' words.",
  construction:
    "You build the smallest memory: two words, so the address is one bit. A decoder for a one-bit address is A and NOT A. Each word's load enable must be 1 only when its address line is 1 and WE is 1. Use the part buttons above the drawing to add parts. Press one port and then another to wire them. When a test fails, the result names the step and which part drives the wrong output.",
  c1Task:
    "Draw a circuit with inputs A (one bit), D (4 bits), WE and CLK, and output Q (4 bits). At a rising edge of CLK where WE is 1, the word at address A takes D, and the other address keeps its word. At an edge where WE is 0, no word changes. Q is always the word at address A, with no edge needed. The tests include steps where A changes while CLK is 1 and where WE rises while CLK is 1.",
  faultsLead:
    'The figure shows the four-word RAM opened: the decoder, the AND gates andW0 to andW3 with outputs W0 to W3, the registers word0 to word3, and the word selector.\n\nChoose a fault from the list. The three faults are: W2 forced to 1; the decoder\'s NOT gate on S0 replaced by a plain wire; the AND gate andW3 changed to an OR gate. The checks run eight fixed steps. They write `0001` at address 00, `0010` at 01, `0100` at 10 and `1000` at 11, one rising edge each. Then they read all four addresses with WE at 0 and no clock edge. Each check compares Q with what the healthy RAM gives.\n\nPressing any wire in the drawing shows its name and value, so you can find W0 to W3.\n\nSay which words you expect to break. Then press "Run checks" to see the results.',
  faultsAfterFault1:
    'W2 forced to 1: 1 of 8 checks fails: "read 10". Q shows `1000`, not `0100`. Word2\'s register takes D at every rising edge, so it ends with the last word written, not the word at address 10.',

  faultsAfterFault2:
    'The NOT gate on S0 replaced by a wire: 4 of 8 fail. The failing checks are "write 0001 at 00", "write 0100 at 10", "read 00" and "read 10". With S0 not turned round, Y0 is 1 for address 01, as Y1 is, and Y2 is 1 for address 11, as Y3 is. A write at 01 writes word0 and word1. A write at 11 writes word2 and word3. A write at 00 or 10 writes no word. Q is checked after each write too, not only at the reads.',

  faultsAfterFault3:
    "andW3 changed to OR: 0 of 8 fail. W3 is now Y3 OR WE, so every write also loads word3. The last write targets word3, so the read of address 11 finds the right word. Passing checks do not prove the circuit right. Checks that wrote word3 first, then another word, then read it would catch this fault.",
  wideLead:
    "The next figure adds a third address pin, A2. The RAM block still reads only A1 and A0; the A2 pin is wired to nothing. The RAM keeps four words, at addresses 000 to 011. Addresses 100 to 111 are past the end.",
  p3Question:
    "At edge 1, `0101` is written at address 001. At edge 2, A2 changes to 1 (so the address becomes 101), D changes to `1110`, WE stays 1, and CLK rises. Then A2 goes back to 0, WE goes to 0, and there is no clock edge. What does Q show?",
  p3Explain:
    "Q shows `1110`. The RAM reads only A1 A0, which is 01 for both 001 and 101, so the write at 101 reached the word at address 01. A write past the end of memory did not fail: it changed a word that already held something.",
  wideExplorerLead:
    'The table lists the four words. Every word starts unknown (XXXX). The table\'s rows are labelled with two bits, 00 to 11, because the RAM reads only A1 A0. The table\'s "On Q" mark shows which row the address reaches.\n\nSet different words at addresses 000 to 011 (D, WE 1, press "Clock CLK"). Then set A2 to 1 and try addresses 100 to 111. Watch the "On Q" mark and Q as you change the address.',
  explanation:
    "Writing a word: the decoder makes exactly one of Y0 to Y3 equal 1, the line A1 A0 names. Each AND gate passes its line only while WE is 1. At most one W wire is 1. At a rising edge of CLK, that one signal loads its register. Every other register has EN at 0 and keeps its word. A change of address, D or WE between edges, even while CLK is 1, writes nothing.\n\nReading a word: the word selector is made of gates, with no flip-flop. Q shows the word A1 A0 names as soon as the gates settle, with no wait for a clock edge.\n\nThe same address A1 A0 goes to two places: to the decoder, which picks which word to write, and to the selector, which picks which word to read.",
  openedLead:
    "The figure shows the RAM opened. Press A1 or A0 to change the address, and watch which of Y0 to Y3 becomes 1. Set WE to 1 and watch the matching W wire light up.",
  openedAfter:
    "Press any wire and its name and value appear. Follow Y2 to W2 to word2's load enable to see how the decoder picks a word to write.",
  generalisation:
    'Each address bit doubles the words a memory can hold. Two address bits name four words; four address bits name sixteen. The decoder grows too: one output line per word. The course draws a larger memory as one closed block, labelled "memory", that does not open. Built from gates, the memory in the next figure (16 words of 16 bits) would need 256 flip-flops. The simulator runs this block as one part. It behaves as the four-word RAM does. It writes a word at a rising edge while WE is 1. Q shows the word A names with no clock edge.',
  bigLead:
    "This memory keeps sixteen words of sixteen bits each. Its address is one 4-bit input, A, set with a row of bit buttons like D. 16-bit words are shown in hexadecimal, four bits to a digit, so `XXXX` here is 16 unknown bits; A is still shown in binary. The table shows all sixteen words and marks which one A names right now.",
  bigAfter:
    'It works as the four-word RAM did. Press "Clock CLK" while WE is 1 to write D to the word A names. Change A or D between edges and nothing is written. Q shows the word A names with no clock edge.',
  guardLead:
    "The failure experiment showed that an address past the end of the memory lands on a word already in use. You will build a guard for the RAM block. It tells whether the address is in range, and stops a write past the end. Parts offered: the four-word RAM block (inputs A1, A0, D, WE, CLK; output Q), AND, NOT and OR gates.",
  c2Task:
    "1. Inputs: A2, A1, A0 (the address), D (four bits), WE, CLK. Outputs: Q (four bits) and OK.\n2. OK is 1 while the address is 000 to 011 and 0 while it is 100 to 111.\n3. A write at an address from 100 to 111 must write no word to the RAM.\n4. Writes and reads at addresses 000 to 011 work as the RAM block's do.\n5. Q can be anything while OK is 0.\n6. The tests include steps where A2 rises and falls while CLK is 1.",
  reflection:
    "A RAM keeps words in registers. To write, a decoder picks which register should take D. Each word has an AND gate whose inputs are one decoder output and WE; its output is that register's load enable, so at most one register takes D at the edge. The selector reads with no edge: Q shows the named word as soon as the gates settle.\n\nAn address with more bits than the memory reads (decodes) lands on a word in use. A guard can refuse it. The office now wants two rooms' settings on two displays at once, to compare them. The RAM gives one word at a time. How can a memory give out two words at once, while it takes one write at a time?",
  modelVsReality:
    "This course builds its RAM from flip-flops to show you how reading and writing work. A real RAM chip stores each bit in a cell much smaller than a flip-flop, packed in rows. It holds far more bits in the same space.\n\nIn this model a read appears as soon as the gates settle, and settling takes no time. In real hardware a read takes time: the word appears some time after the address changes. A real memory at power-on holds 0s and 1s nobody chose, not X; the simulator writes X because it cannot know them. The larger memory is simulated as one part, not gate by gate.",
  c1Hints: [
    "Each word is a register with a load enable. The register whose address A names must have EN at 1 at the edge, and only while WE is 1.",
    "If you wire A directly to one register's EN and NOT A to the other's, the register takes D at every edge, even while WE is 0. If you wire the second register's Q to selector input A and the first's to B, you see the wrong word.",
    "An AND gate with WE as one input passes its other input while WE is 1, and gives 0 while WE is 0.",
    "The first register's EN is (NOT A) AND WE. The second's is A AND WE.",
    "Place a NOT gate on the address A and wire one AND gate (NOT A and WE) to the first register's EN and another (A and WE) to the second's. Wire D and CLK to both registers. The word selector takes the first register's Q on selector input A, the second's on B, and the address A on S; its Y is Q.",
  ],
  c2Hints: [
    "The RAM writes at a rising edge only while its own WE is 1. You must control what reaches that input.",
    "If you wire WE straight to the RAM's WE, a write at address 101 will change the word at address 001. Only A2 tells you whether the address is past the end; do not check A1 or A0.",
    "NOT A2 is 1 exactly when the address is 000 to 011.",
    "OK is NOT A2. The RAM's WE input is WE AND OK.",
    "Place a NOT gate on A2 and call its output OK. Place an AND gate on WE and OK and wire its output to the RAM block's WE. Wire A1, A0, D and CLK straight to the RAM block, and Q straight out.",
  ],
  buildLead:
    "Draw a memory of two words. The parts offered are a register block (inputs D, EN and CLK, output Q), a word selector (inputs A, B and S, output Y: Y is A while S is 0 and B while S is 1), AND and NOT gates. The selector's inputs A and B are not the address A.",
} as const;
