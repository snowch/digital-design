// Copyright © 2026 Christopher Snow

// The words of the lesson constants.
//
// Drafted by the course's prose process from briefs of checked facts (docs/notes/module-8-datapath.md
// and its briefs), checked against the simulator, and placed here by the lesson's structure. Edit
// a fact here only after checking it; the lesson's facts test holds the numbers.

export const PROSE = {
  question:
    "In the last lesson, every instruction worked with words already in registers. The shop needs numbers held nowhere else: 100 to add to a reading, a mask to keep a reading's low 8 bits. The instruction's last three hexadecimal digits, C, went nowhere. They are 12 bits. How do these 12 bits become a 64-bit word the ALU's B input takes?",
  motivation:
    "Kind 2 is a constant job: RY ← RA job c, where c is the instruction's last 12 bits, read as a signed number from -2048 to 2047. Take `22103064`: kind 2, job 2 (add), A is R1, B is unused, Y is R3, and the constant `064`, which is 100. It is R3 ← R1 + 100. The ALU's B input takes 64 bits. The constant is 12 bits. A negative constant must remain the same number at 64 bits.",
  prediction:
    'The figure adds two parts to the last lesson\'s datapath. The block "widen" turns C into a 64-bit word on the bus WIDE. A word selector, named pickB, feeds the ALU\'s B input, the bus ALUB, with either QB or WIDE. BCONST is the selector\'s select input, set by hand here: 1 chooses WIDE, 0 chooses QB.\n\nIR carries `25003F9C`: kind 2, job 5 (copy B), Y is R3, and the constant digits `F9C`. It is R3 ← c. WRITEY and BCONST are both 1. Choose an answer and press "Check my prediction". The "Clock edge" button appears after.',
  p1Question:
    "`25003F9C` is on IR, and its constant digits are `F9C`. After one rising edge, what does R3 hold, read signed?",
  p1Explain:
    "R3 holds -100. `F9C` is the 12 bits `1111 1001 1100`. Read signed, bit 11 is worth -2048, and the word is -100. Read unsigned, it is 3996. The widening copies bit 11, a 1, into all 52 bits above it. WIDE is `FFFFFFFFFFFFFF9C`, which read signed is -100: the same number. Copy B makes the ALU's result equal to its B input, so the edge writes -100 into R3. X would mean the edge wrote an unknown word. It does not.",
  constantsLead:
    '"widen" holds no gates. Its 64 outputs are C\'s 12 wires and, 52 times over, the wire of C\'s bit 11. pickB is Module 3\'s word selector at 64 bits, its select input BCONST. Try these instructions, each with WRITEY and BCONST set for you (you can press their pins too):\n\n- `25003F9C`: R3 ← -100\n- `22103064`: R3 ← R1 + 100\n- `201030FF`: R3 ← R1 AND `FF` (job 0)\n- `250047FF`: R4 ← 2047\n- `25004800`: R4 ← -2048\n- `12123000`: R3 ← R1 + R2, a register job, with BCONST at 0\n\nR1 holds -184 and R2 holds -250. The table "Buses" shows QB, WIDE, ALUB and RESULT. The table "Registers" shows R1 to R4.',
  constantsAfter:
    "The edges write -100, -84, 72, 2047, -2048 and -434. 72 is -184's low byte, `48`: AND with `FF` keeps a word's low 8 bits. 2047 is `7FF`, whose bit 11 is 0, so WIDE is `00000000000007FF`. -2048 is `800`, and WIDE is `FFFFFFFFFFFFF800`. These are the largest and smallest constants. With BCONST at 0, ALUB is QB, and the register job reads R2 as in the last lesson.",
  construction:
    "The widening takes C, the 12-bit constant field from the instruction, and produces W, a 64-bit word. W's low 12 bits are C. Each of the 52 bits above is a copy of C's bit 11, so the signed reading stays the same: -1 stays -1, 2047 stays 2047. The challenge's module calls its output W. The figure calls the bus WIDE. The 52 bits above are all 1 when C's bit 11 is 1, and all 0 when it is 0.",
  writeWidenLead: "Write the widening: 12 bits in, 64 bits out, the same number when read signed.",
  c1Task:
    "Write a module called `widen`. Its input is C, a 12-bit constant field from the instruction. Its output is W, a 64-bit word.\n\nW's low 12 bits equal the value of C. Each bit above those 12 bits is a copy of C's bit 11.\n\nThe starting code has `assign W = {52'h0, C};`. This correctly handles only the case when C's bit 11 is 0. You must replace it with logic that works for both cases: when bit 11 is 0 and when it is 1.\n\nYou may use what the digits challenge used, plus concatenation, `always_comb` and `case`.\n\nThe module has 6 tests. Each test is named by C's value in hexadecimal: `000`, `064`, `7FF`, `800`, `FFF` and `F06`.",
  c1Hints: [
    "W's top 52 bits are all equal to `C[11]`.",
    "A common mistake: filling the top with 0s. That works for 0 to 2047 and fails for negative constants like `F06`, which becomes 3846.",
    "Try a smaller example: 4 bits to 8. Use `case (C[3])` to choose: `1'b0: W = {4'h0, C};` and `1'b1: W = {4'hF, C};`.",
    "Start with `always_comb`, then `case (C[11])`. Write `1'b0: W = {52'h0, C};`. Add another line for `1'b1`, then `endcase`.",
    "The whole answer:\n\n```\nalways_comb\n  case (C[11])\n    1'b0: W = {52'h0, C};\n    1'b1: W = {52'hFFFFFFFFFFFFF, C};\n  endcase\n```",
  ],
  constantsFaultsLead:
    "Two faults to choose.\n\n**The copied bit stuck at 0:** Inside the `widen` module, the internal wire that copies C's bit 11 upwards into the top 52 bits is stuck at 0. C's own 12 input wires still carry their values to the module.\n\n**BCONST stuck at 0:** The selector always chooses QB, which is the data output of the register file's read port B.\n\nTest these two instructions:\n\n- `25003F9C`: R3 ← -100\n- `22103064`: R3 ← R1 + 100\n\nR1 holds -184 and R2 holds -250.\n\nChoose a fault and an instruction. Say what R3 will hold. Then press Clock edge.",
  constantsFaultCopy:
    "**The copied bit stuck at 0:**\n\nWhen you run `25003F9C`, R3 holds 3996, which is the unsigned reading of `F9C`. When you run `22103064`, R3 still holds -84: because 100's bit 11 is 0, the fault changes nothing for this instruction. No constant from 0 to 2047 can show this fault, because all their bit 11s are 0.",
  constantsFaultBconst:
    "**BCONST stuck at 0:**\n\nBoth instructions write X into R3. The ALU's B input takes QB, the word output by the register the B digit selects. Both instructions have B digit 0, so QB is R0, which has never been written to. An X input gives an X output.",
  explanation:
    "The selector carries out a choice that the instruction kind makes. A register job reads the ALU's B word from register B. A constant job reads it from the constant field. BCONST is a second control signal that you set by hand in this lesson to select which one.\n\nCopying bit 11 keeps the number when read signed. Bit 11 of C is worth -2048 when read signed. In W, bit 63 is worth minus 2 to the 63. The 1s in bits 62 down to 11 add up so that bits 63 to 11 together are worth -2048: the same as C's bit 11 alone. When bit 11 is 0, the copies are 0s and add nothing. The figure shows the copies of bit 11 and both words read signed, for four constants.",
  generalisation:
    "AND, XOR, add, subtract, OR and copy B use the constant from the instruction field. Count up and count down ignore it.\n\nThe 12-bit constant field holds a signed value from -2048 to 2047. A number outside -2048 to 2047 does not fit in one constant. The figure below builds 3600 in two instructions.",
  hourLead:
    "An hour is 3600 seconds, which is too large to fit into a 12-bit constant.\n\nYou have two instructions to execute:\n\n- `25006708`: R6 ← 1800\n- `12666000`: R6 ← R6 + R6\n\nThe second instruction is a register job that adds register R6 to itself (BCONST is 0, so B takes QB).\n\nChoose the first instruction and press Clock edge. Observe what R6 holds. Then choose the second instruction and press Clock edge again.",
  hourAfter:
    "R6 holds 1800 after the first edge, then 3600 after the second: two instructions, two edges.",
  writeConstantsLead:
    "Add the selector to the datapath's text, so the ALU's B input can take the constant.",
  c2Task:
    "Your module, `constants`, has inputs CLK, IR (32 bits), WRITEY and BCONST, and one output, RESULT (64 bits). The starting text uses the course's register file as in the last lesson's challenge. It works out WIDE as the widening challenge does, from `IR[11:0]`. It uses the ALU with its B input from ALUB, and has `assign ALUB = QB;`.\n\nReplace that assignment with a selector: ALUB is QB when BCONST is 0, and WIDE when BCONST is 1.\n\nYou may use what the widening challenge used, plus one module used inside another.\n\nThe tests are 8 steps. R1 starts at -184, R2 at -250, and every other register at X. The steps set IR, WRITEY, BCONST and CLK and check RESULT. One step changes IR and BCONST while the clock is high.",
  c2Hints: [
    "ALUB takes one of two words, and BCONST chooses which.",
    "A common mistake: choosing by `IR[11]`, the constant's bit 11, instead of BCONST.",
    "The widening chose between two words with `case (C[11])`. This choice is the same shape.",
    "Start with `always_comb`, `case (BCONST)` and the line `1'b0: ALUB = QB;`.",
    "The whole answer: replace `assign ALUB = QB;` with\n\n```\nalways_comb\n  case (BCONST)\n    1'b0: ALUB = QB;\n    1'b1: ALUB = WIDE;\n  endcase\n```",
  ],
  reflection:
    "A constant rides in the instruction's last three digits. The \"widen\" step makes it 64 bits by copying bit 11, and a selector set by BCONST gives it to the ALU's B input.\n\nSo far you put each instruction on IR by hand, and set WRITEY and BCONST yourself. The shop's machine must do its jobs one after another, on its own. Where does the machine keep its list of instructions, and how does it know which one comes next?",
  modelVsReality:
    "The widening is wires and no gates. In a chip, bit 11's wire drives its own bit and the 52 bits above it, and a wire with many inputs to drive takes longer to change.\n\nThe selector is 64 two-way selectors. The model settles them in steps; in a chip they add delay on the way to the ALU.\n\nYou set BCONST by hand here. In the course's machine, a block works it out from K, as it does WRITEY. A later module builds that block's insides.",
  fieldsLead:
    "The six fields of a constant job are the same as in the last lesson. C's 12 bits carry a number.",
  wideningLead:
    "The figure shows W, a 64-bit word in four rows of 16 bits, with C's 12 bits below, each under the bit of W it becomes. Bit 11 is outlined in both. W's bits 63 to 12 are drawn dashed: copies of bit 11. Gaps every four bits group them into hexadecimal digits. Below, the line reads C and W as signed. The figure opens on `F9C`; for `064` and `7FF`, every copy is 0.",
} as const;
