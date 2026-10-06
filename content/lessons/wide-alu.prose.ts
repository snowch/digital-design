// Copyright © 2026 Christopher Snow

// The words of the lesson wide-alu.
//
// Drafted by the course's prose process from briefs of checked facts (see CLAUDE.md and
// docs/notes/module-7-alu.md), checked against the simulator, and placed here by the lesson's
// structure. Edit a fact here only after checking it; the lesson's facts test holds the numbers.

export const PROSE = {
  question:
    "The office counts the seconds since the shop opened, using count up. The largest 16-bit word, read unsigned, is 65535. A 16-bit count runs out after 65535 seconds, which is about 18 hours. Then it wraps round to `0000`.\n\nA 64-bit word's largest value, read unsigned, is 18446744073709551615. If you counted seconds at that scale, it would take about 584 billion years before wrapping. The ALU is built from slices, so the same design works at 64 bits: 64 slices instead of 16. But what else changes when the ALU is four times as wide?",
  motivation:
    "Module 3 already said that a carry may have to travel through every slice of a wide adder. This lesson measures what that costs, in the course's stepped model, where every gate takes one step, at 16 bits and at 64. Does a change of A take the same number of steps, whatever A changes to?",
  prediction:
    'The figure runs a 16-bit ALU doing count up, changing A in one of two ways. Choose which change takes longer to settle, then press "Check my prediction". The steps appear after you press it.',
  p1Question:
    "A 16-bit ALU with code `110` counts up. It has settled with A = `0000`. Now A changes in one of two ways: to `0001`, so Y goes from `0001` to `0002`; or to `FFFF`, so Y goes from `0001` to `0000`. Which change takes more steps before nothing in the circuit changes any more?",
  p1Explain:
    "The second change takes more: 36 steps against 8. When A changes to `0001`, the carry made in bit 0 stops at bit 1, because bit 1 of A is 0. When A changes to `FFFF`, every bit of A is 1. The carry passes through all 16 slices and comes out as COUT. The more slices a carry travels through, the more steps the result takes to settle.",
  carry16Lead:
    'The same 16-bit ALU counts up. You choose one of three changes: A from `0000` to `0001`, to `00FF`, or to `FFFF`. Below is a row of cells, each showing one slice. Bit 15 is on the left, bit 0 on the right, as a word is written. In each cell, the top digit is the slice\'s carry out. The bottom digit is its bit of Y. A cell outlined in colour is a slice whose carry out changed at that step. Move the "Step" slider to step through the model. You can also press "Back a step", "Next step", or "Last step". Step 0 is the moment A changes, before any gate has done anything.',
  carry16After:
    "The three changes settle after 8, 22 and 36 steps. For the change to `FFFF`, at step 6, Y is `FFFE`: every bit is 1 except bit 0. At that moment, every slice above bit 0 has added its new bit of A before any carry from the slice below has reached it. Then the carries change from 0 to 1, one slice at a time, from right to left. Every 2 steps, the carry reaches another slice: in each slice the carry passes through an AND gate and then an OR gate. As it arrives, that slice's bit of Y becomes 0. COUT changes at step 34. Y becomes `0000` at step 36. Y is final only when the last carry is.",
  construction:
    "A circuit's width does not have to be fixed when you write it. A **parameter** is a name for a value that the module uses as a number. Write `#(parameter N = 16)` after the module's name, and N becomes 16 unless you set it differently. Then `logic [N-1:0] A` gives you a word N bits wide, and the same text works for any width.\n\nTo add two words of N bits, write `+`. The course turns `+` into its own adder: a row of full adders, one per bit. The sum of two N-bit words can need N + 1 bits: the top one is the carry out. To split it apart, join two signals into one wider word with a **concatenation**, `{H, L}`. The first signal goes into the top bits. Written on the left of `=`, a concatenation shares a value out. With W 8 bits wide, H 1 bit and L 7 bits, `assign {H, L} = W;` gives W's top bit to H and its other 7 bits to L.\n\nA sum is worked out as wide as the widest side of the assignment. Written into an N-bit signal alone, a sum of two N-bit words loses its carry out.\n\nThe tests build your text with N set to 4, 16 and 64. One text, three widths.",
  writeAdderLead:
    "Write an adder whose width is set by the parameter N, with a carry in and a carry out.",
  c1Task:
    "Write a module. It has a parameter N, inputs A and B, each N bits, and an input CIN. It has outputs SUM, N bits, and COUT. SUM holds the low N bits of A + B + CIN; COUT holds the carry out. The starting text gives you the module's first lines and two assignments, SUM = A and COUT = CIN. Replace them. You may use what earlier challenges used, plus parameter, `+` and concatenation.\n\nThe tests are 12 in all, 4 at each width: N = 4, 16 and 64. Each test is named by its width and its words.",
  c1Hints: [
    "One assignment to a joined left side gives both outputs.",
    "A common mistake: `assign SUM = A + B + CIN;` by itself. The sum is N bits wide and the carry out is lost.",
    "When you join signals, the first one goes into the top bits. `assign {H, L} = W;` gives W's top bits to H and the rest to L.",
    "The left side is `{COUT, SUM}`.",
    "`assign {COUT, SUM} = A + B + CIN;` replaces the two placeholder assignments.",
  ],
  wideFaultsLead:
    'This figure shows the 64-bit ALU at its top level: four 16-bit groups, named g0 to g3. g0 works on bits 0 to 15, g1 on bits 16 to 31, g2 on bits 32 to 47, g3 on bits 48 to 63. Every group receives all of A and B, and takes its own 16 bits of each inside. Each group\'s carry out is the next group\'s carry in: wires C16, C32 and C48, each named for the bit it goes into. The zero chain passes between the groups the same way. The two gates xorC0 and andC0 make the carry into bit 0, as at 4 bits. Press any wire to see its name and value.\n\nWords this wide show as 16 hexadecimal digits. "Run checks" makes 4 checks, all count up: "1 + 1", "FFFF + 1", "FFFFFFFF + 1" and "FFFFFFFFFFFFFFFF + 1". Their carries pass through 1, 16, 32 and 64 slices. The fault options are "C32 stuck at 0" and "C16 stuck at 1". Say first which checks you expect to fail. The results appear after the checks run.',
  wideFaultsAfter:
    '- "C32 stuck at 0": 2 of the 4 checks fail, "FFFFFFFF + 1" and "FFFFFFFFFFFFFFFF + 1". These are the checks whose carry reaches bit 32. The other two never carry that far, so they never see the fault.\n- "C16 stuck at 1": 1 of the 4 checks fails, "1 + 1". The other three carry into bit 16 anyway, so a 1 stuck there changes nothing for them.\n\nA carry stuck at 0 shows only in words whose carry reaches it. A carry stuck at 1 shows only in words whose carry does not reach it.',
  explanation:
    "A 64-bit ALU has thousands of gates. Draw them all at once and no screen holds them, and no learner reads them. The course draws a circuit one level at a time. The 64-bit ALU is four 16-bit groups. Each 16-bit group is four 4-bit groups. Each 4-bit group is four slices. Each slice is gates. Every level above the slices follows the same pattern: four parts, each carry out the next carry in. You open one level, look at it, and open the next where you need to.",
  levels64Lead:
    'This is the 64-bit ALU at the top level, with no fault. It starts at count up with A set to `FFFFFFFFFFFFFFFF` and B to 0, code `110`. Y is 0, COUT is 1 and ZERO is 1. Press any group to open it. A 16-bit group shows two blocks marked "bits", which take its 16 bits of A and of B, and four 4-bit groups, q0 to q3. Press a 4-bit group to see its four slices; press a slice to see its gates. The trail above the drawing names each level; press a name to go back. The select inputs OP2, OP1 and OP0 can be pressed here. A and B stay as they start.',
  levels64After:
    "Inside every slice are the gates of the eight-job slice from the first lesson of this module, with the zero chain and the overflow gates of the last lesson beside them. Each level shows what the level above it hides, and nothing more.",
  generalisation:
    "The slice repeats at every width. The adder and the second word you write in this lesson's challenges work at any width, with N set. The next lesson writes the whole ALU the same way. What changes with width is the time a carry can take to settle through all the slices.",
  carry64Lead:
    "The figure steps a 64-bit ALU counting up, as the 16-bit one did. Two changes show how the carry moves. In one, A changes from all 0s to 1, and the carry stops at bit 1. In the other, A changes from all 0s to all 1s, and the carry passes through all 64 slices. The 64 slices are shown in four rows of 16: bits 63 to 48 on the top row, bits 15 to 0 on the bottom.",
  carry64After:
    "The change of A from all 0s to 1 settles after 8 steps, the same as at 16 bits: the carry stops at bit 1. The change from all 0s to all 1s settles after 132 steps: the carry made in bit 0 passes through all 64 slices. At 16 bits, the same change took 36 steps. Width costs time.",
  writeOperandLead:
    "Write the adder's second word, D, and the carry into bit 0, for the eight jobs, at any width N.",
  c2Task:
    "Write a module with parameter N.\n\nInputs: B (N bits), OP2, OP1, OP0.\nOutputs: D (N bits) and CIN (the carry into bit 0, called C0 on earlier pages).\n\nD is the adder's second word. It takes one of four values, chosen by the three-bit code. You may use what the last challenge used, plus `always_comb` and `case`. A `case` picks the one line whose label matches its value; `default` covers every value no line names.\n\nEach label is a three-bit binary number:\n- Code `010`: D is B\n- Code `011`: D is NOT B\n- Code `111`: D is all 1s\n- Every other code: D is all 0s\n\nIn a `case` statement, a label is written like this: `3'b010: D = B;`\n\nInside `always_comb`, `D = ~0;` sets every bit of D to 1, and `D = 0;` sets every bit to 0, whatever N is.\n\nCIN is the carry into bit 0. It is 1 for codes `011` and `110`, and 0 for the rest.\n\nThe starting text gives the module's first lines and two placeholder assignments, D = B and CIN = 0. Replace them both.\n\n24 tests check your work. They test every possible code at three widths: N = 4, N = 16, and N = 64.",
  c2Hints: [
    "D takes one of four values based on the code. A case statement picks the right value.",
    "Do not write D from B alone. Count up and count down need a fixed word. The bit-by-bit jobs need D = 0.",
    "Here is an example: `case ({OP2, OP1, OP0})` with one line `3'b010: D = B;` handles add.",
    "Write three case lines for `3'b010`, `3'b011`, and `3'b111`. Use `default: D = 0;` for the rest. CIN is one assign line using gates.",
    "Here is the full answer:\n\n```\nalways_comb begin\n  case ({OP2, OP1, OP0})\n    3'b010: D = B;\n    3'b011: D = ~B;\n    3'b111: D = ~0;\n    default: D = 0;\n  endcase\nend\nassign CIN = OP1 & (OP2 ^ OP0);\n```",
  ],
  reflection:
    "The slice repeats at any width. The adder and the second word, written with N, work at 4, 16 or 64 bits. Drawn, a wide ALU shows one level at a time, opening groups of slices.\n\nWhat width costs is time. A carry may flow through every slice on its way from bit 0 to the top. A 64-bit carry takes many more steps than a 16-bit one.\n\nA carry stuck at 0 shows only when a carry reaches it; a carry stuck at 1 only when none does.\n\nWith 64 bits, there are far more pairs of words than anyone could test. So how does anyone know a 64-bit ALU is right?",
  modelVsReality:
    "Module 3 said real adders do not wait for a carry to pass through every slice. They work out the carries for blocks of bits at once, with a tree of gates whose depth (Module 2) grows far more slowly than the width. This technique is called carry lookahead.\n\nIn the stepped model, every gate takes one step, so the step counts measure how many gates a carry passes through, not real time. Real gates and wires take different times.",
} as const;
