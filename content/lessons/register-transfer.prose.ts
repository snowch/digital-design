// Copyright © 2026 Chris Snow

// The words of the lesson on register transfer.
//
// Drafted by the course's prose process from briefs of checked facts (see CLAUDE.md and
// docs/notes/module-5-state-machines.md; the briefs and the drafts as returned are beside it) and
// placed here key by key. Edit a fact here only after checking it against
// register-transfer.facts.test.ts.

export const PROSE = {
  buildNowPrevLead:
    "Build a circuit with two registers, NOW and PREV. Use the 4-bit register blocks offered.",
  c1Hints: [
    "Both the NOW and PREV registers take their D at the same edge, with SAVE as the load enable. Which word must the PREV register be given?",
    "If you wire IN to both D inputs, PREV becomes the same as NOW after every save.",
    "In the registers lesson, a shift register's second flip-flop took the first one's Q at each edge. PREV is like that second flip-flop: it is the second register in a chain of two.",
    "The PREV register's D must come from the NOW register's Q.",
    "Place two 4-bit register blocks. Wire IN to the first one's D, and wire its Q to NOW and to the second block's D. Wire the second block's Q to PREV. Wire SAVE to both EN pins, RST to both RST pins, and CLK to both CLK pins.",
  ],
  c1Task:
    "Draw a circuit with inputs IN (4 bits), SAVE, RST and CLK, and outputs NOW and PREV (4 bits each). When an edge has RST at 1, both NOW and PREV become `0000`. Otherwise, when an edge has SAVE at 1, NOW takes IN and PREV takes the word NOW had before that edge. When SAVE is 0, both keep their words. The tests include edges where SAVE changes while CLK is 1.",
  c2Hints: [
    "Each branch of the `if` chain describes one edge's transfers. Inside a branch, put one `<=` line per register that changes, between `begin` and `end`.",
    "Testing UNDO before NEW makes an edge with both at 1 undo instead of taking the new reading. The order of the `if` chain is the order of priority: RST, then NEW, then UNDO.",
    "With one register: `if (RST) A <= 4'b0000; else if (L) A <= D;` keeps A at every edge where RST and L are 0.",
    "The NEW branch is `else if (NEW) begin NOW <= IN; PREV <= NOW; end`.",
    "Write:\n\n```\nalways_ff @(posedge CLK) begin\n  if (RST) begin\n    NOW <= 16'h0000;\n    PREV <= 16'h0000;\n  end\n  else if (NEW) begin\n    NOW <= IN;\n    PREV <= NOW;\n  end\n  else if (UNDO) NOW <= PREV;\nend\n```",
  ],
  c2Task:
    "The module header is given: inputs IN (16 bits), NEW, UNDO, RST and CLK, and outputs NOW and PREV (16 bits each).\n\nAt an edge where RST is 1, NOW and PREV become `16'h0000`. Otherwise at an edge where NEW is 1, NOW takes IN and PREV takes NOW's word. Otherwise at an edge where UNDO is 1, NOW takes PREV's word back and PREV keeps its word. At any other edge both keep their words.\n\nWrite one `always_ff` with `if`, `else if`, `begin` and `end`. The tests use the readings `FF48`, `FF06` and `0012`, including an edge where NEW and UNDO are both 1, an edge where RST and NEW are both 1, and a test where NEW changes while CLK is 1.",
  construction:
    "This circuit uses two 4-bit register blocks, for the NOW and PREV registers. In the drawing, each word of 4 bits appears as one thick wire.",
  explanation:
    "At an edge, every register takes a word that the gates worked out from the values the registers had before that edge. In the NOW and PREV circuit, the NOW register takes IN and the PREV register takes NOW. In the save-once circuit, the flip-flop last also takes SAVE, and both registers take their word only at an edge where STEP is 1.\n\nMoving words into registers at an edge, each worked out from values before the edge, is called **register transfer**. It is written with an arrow, one line per register: NOW ← IN and PREV ← NOW.\n\nAll the lines of one edge happen at once. Their order does not matter, because every right-hand side is read before the edge. The counter of the previous lesson is a register transfer too: Q ← Q + 1 at an edge where EN is 1.",
  modelVsReality:
    "In the model every flip-flop takes its D at the same instant. In hardware the clock reaches different flip-flops at slightly different times. PREV taking NOW's old word relies on NOW's flip-flops changing after the edge, later than PREV's flip-flops need their D steady: their hold time. The shift register of the registers lesson relied on the same.\n\nA real button's contacts open and close several times in the first few thousandths of a second when pressed. A real circuit waits for the button to settle before it believes a press. The model's button does not.",
  motivation:
    "Two registers work together: the now register stores the word NOW, and the prev register stores the word PREV. Both have a reset and a load enable. SAVE is both EN signals. The NOW register takes its input from the switches: IN. The PREV register takes its input from NOW.\n\nAt an edge where SAVE is 1, both registers take their inputs at that instant. Does PREV take the word NOW had before the edge, or the word NOW is taking at it?",
  nowPrevAsTextAfter:
    "Words of any width work the same way. Module 1's readings are 16 bits. A register for them is declared `logic [15:0]`, and `16'h0000` is a 16-bit value written in hexadecimal.",
  nowPrevAsTextLead:
    "The figure draws NOW and PREV as blocks beside the text that describes them. Each register is one `always_ff` block. `PREV <= NOW` reads NOW's value from before the edge, as the wire does in the drawing. `<=` is the transfer arrow written as text.\n\nThe order of the two blocks does not matter. You can write two `<=` lines inside one `always_ff`, under `if (SAVE) begin ... end`, and make the same circuit.",
  nowPrevExplorerAfter:
    "One wire, from the NOW register's Q to the PREV register's D, carries the word between them. Nothing else is needed to make PREV wait one save behind NOW. The edge does it, since both registers take their D at the same moment.",
  nowPrevExplorerLead:
    "Explore the circuit with two registers, starting with NOW and PREV both at `0000`. Press bits of IN to set a number. You see the value in IN change. Press SAVE to 1. SAVE's pin shows 1. Press Clock CLK. The NOW register takes IN, and the PREV register takes NOW's old word. Set a new number and press Clock CLK again. Both registers update at that edge. Press SAVE to 0 and press Clock CLK. Both registers keep their words. Press the NOW register block. It opens to show the four flip-flops inside, one for each bit, like in the registers lesson.",
  p1Explain:
    "PREV is `0011`. At the second edge, NOW took `0101` and PREV took `0011`, the word NOW had before the edge. Every flip-flop takes its D at the same edge, and D is worked out from Q before the edge. The shift register of the registers lesson moved bits the same way. In a program, line order decides; here no register sees another's new value until after the edge.",
  p1Question:
    "The figure resets both NOW and PREV to `0000`. With SAVE at 1, IN is `0011` for the first clock edge, then `0101` for the second edge. What is PREV after the second edge?",
  p2Explain:
    "PREV is `0101`. The first edge of the press: NOW took `0101`, PREV took `0011` (NOW's old value). The second edge: NOW took `0101` again, PREV took NOW's word, which was `0101` by then. The number `0011` is lost. The clock does not wait for your finger.",
  p2Question:
    "A save of `0011` happened. Then IN is `0101` and SAVE is kept pressed for three edges. What is PREV after the third edge?",
  p3Explain:
    "X is `0101` and Y is `0011`: the registers swapped their words at one edge. X ← Y and Y ← X both read the words from before the edge. In a program, swapping two variables needs a third to keep one of them; two registers need no third.",
  p3Question:
    "The input A is `0011` and the input B is `0101` while LOAD is 1. At the first edge, X takes A and Y takes B. At the next edge, LOAD is 0. What is X after that?",
  predictLongPressLead:
    "What if someone keeps the Save button pressed for much longer than one clock period? The button stays pressed, so SAVE stays 1 for many edges. This figure saves `0011`, then sets IN to `0101`, then keeps SAVE at 1 for three edges. Watch what happens to PREV.",
  predictSwapLead:
    "Two 4-bit registers, X and Y. The circuit has inputs A, B and LOAD. While LOAD is 1, X's D takes the input A and Y's D takes the input B. While LOAD is 0, X's D takes Y's Q and Y's D takes X's Q. Watch the circuit below.",
  prediction:
    'The figure draws the NOW and PREV circuit. Your question is below. Choose an option, then press "Check my prediction".',
  question:
    "The registers lesson's display shows the switches' number when Save is pressed. Staff want to see what changed: the office is adding a second display, PREV, that shows the number saved before the latest one. The first display is NOW.\n\nWhen Save is pressed, NOW takes the switches' new number and PREV takes the number NOW showed until then. Both change at one clock edge. On power-up, a reset makes both `0000`.\n\nHow can one register take its word from another register at the same edge as that register takes a new one?",
  reflection:
    "A register transfer moves words between registers at an edge, every one worked out from the values before it. Their order does not matter, and two registers can swap.\n\nA press longer than one edge needed a flip-flop that remembers the input from the edge before, so the circuit does one thing per press. The office's message to the manager must be sent, waited on, sent again, or given up. Each is a different job with different transfers. What decides which job the circuit does at the next edge?",
  saveOnceAfter:
    "After the first edge of the press, NOW is `0101` and PREV is `0011`. The next two edges change nothing. A new press saves again. The flip-flop last stores one bit: SAVE's value from the edge before. That bit becomes OLD, and it is what makes STEP turn off after the first edge of the press.",
  saveOnceLead:
    "The fix uses a flip-flop called last. At every edge, last takes SAVE, and its output OLD shows what SAVE was at the previous edge. Two gates combine these: notOld produces NOT OLD, and andStep produces STEP = SAVE AND NOT OLD. STEP is 1 only before the first edge of a press, because after that edge, OLD becomes 1 and STEP becomes 0. STEP replaces SAVE as the enable for both registers. Try it: press SAVE to 1, then press Clock CLK three times. Release SAVE and press Clock CLK. Then press SAVE to 1 again to save a new value.",
  writeReadingsLead:
    "The freezer room's last two readings are 16 bits each. The office keeps them both and can undo a reading.",
} as const;
