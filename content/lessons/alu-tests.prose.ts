// The words of the lesson alu-tests.
//
// Drafted by the course's prose process from briefs of checked facts (see CLAUDE.md and
// docs/notes/module-7-alu.md), checked against the simulator, and placed here by the lesson's
// structure. Edit a fact here only after checking it; the lesson's facts test holds the numbers.

export const PROSE = {
  question:
    "A 16-bit word has 65536 values. A 16-bit ALU takes two words and eight jobs, so there are 34359738368 possible tests to try every one. At a million tests a second, running all of them takes about 9.5 hours. With 64 bits, the total count is a number 40 digits long: far too large for any computer to run. No one could run them all. So you need a set of tests run together, a **test suite**, to choose which tests to run. Which tests should a suite choose, so that a fault cannot hide?",
  motivation:
    "Module 3 built an ALU and chose tests by hand, running every job on a few pairs of words. A large ALU cannot be tested this way. The course's test generator makes four kinds.\n\nFirst: normal tests. These are ordinary small words. Each job runs on `0017` and `0009` (23 and 9) and on `012C` and `04B0` (300 and 1200), giving 16 tests.\n\nSecond: **boundary tests**. These run on words at the ends of the number range, where a result wraps around, overflows or changes sign. The words are `0000`, `0001`, `7FFF`, `8000` and `FFFF`: 28 tests.\n\nThird: random tests. Words are drawn by a generator from a starting number, its **seed**. The same seed always draws the same words, so a failing run can be repeated. Two per job: 16 tests.\n\nFourth: **adversarial tests**. These are chosen to break a particular kind of fault. They target a carry from bit 0 through every slice, overflow at the signed limits, words such as `5555` and `AAAA` where every bit differs from its neighbours, and words with one bit set. The suite has 19 adversarial tests.\n\nAll together, a 16-bit suite runs 79 tests.",
  prediction:
    'The suite below runs against a 16-bit ALU with a fault. Choose which kind of test catches it first, then press "Check my prediction". The suite\'s controls appear after you choose.',
  p1Question:
    "This 16-bit ALU has a fault: its OVER output is stuck at 0. Everything else is healthy. The suite runs tests in four kinds, in order: normal, boundary, random, and adversarial. Which kind catches this fault first: normal, boundary, random, or none of the first three?",
  p1Explain:
    'The boundary tests are the first to catch the fault. 0 of the 16 normal tests fail: their words do not cross the signed limits. 4 of the 28 boundary tests fail: `7FFF` + `0001`, `8000` - `0001`, `7FFF` counted up, and `8000` counted down. Each of these crosses the signed limit where OVER should change. 1 of the 16 random tests fails with seed 1, but with seed 5 none does: a random test catches this fault only by chance. 5 of the 19 adversarial tests also fail. Run the suite yourself with "Run the suite" to see the results.',
  suiteHealthyLead:
    'Now run the suite against the healthy 16-bit ALU below. Press "Run the suite" to run all 79 tests and see the results, kind by kind: how many tests and how many failed. The figure shows the seed used for its random tests, starting at seed 1. Press "New random tests" to generate new random tests using the next seed (2, then 3, and so on). The normal, boundary, and adversarial tests stay the same.',
  suiteHealthyAfter:
    "Every test passes on the healthy ALU, regardless of which seed you use for the random tests. The seed is shown together with the results of each run, so a run can be repeated exactly from its seed alone.",
  construction:
    "An adversarial test is chosen with a particular fault in mind. Here you choose the test yourself. Three faulty 16-bit ALUs await you. Each has one carry stuck at 0: into bit 4, into bit 9, or into bit 15. A lost carry changes the result only when the right answer needs that carry there. Find one pair of words that, when added together, exposes all three faults at once.",
  findPairLead: "Give two hexadecimal words whose sum exposes the three stuck carries.",
  c1Task:
    "Type two 16-bit words, A and B, using hexadecimal (four digits, such as `00FF`). Each of the three tests adds A and B on one faulty ALU. The test names show which carry is stuck: C4 is the carry into bit 4, C9 into bit 9, C15 into bit 15. A test passes when the faulty ALU's Y or COUT differs from the right answer: you have exposed the fault. One pair of words must pass all three tests.",
  c1Hints: [
    "A carry lost into bit 4 shows only if adding A and B needs to put a carry into bit 4.",
    "`0001` + `0001` gives a carry only into bit 1, so all three faulty ALUs give the right answer.",
    "`000F` + `0001` makes a carry that reaches bit 4 but not bits 9 and 15. It exposes one fault only.",
    "The pair must make a carry reaching bits 4, 9 and 15. With B = `0001`, A needs 1s in bits 0 through 14.",
    "The answer is A = `FFFF`, B = `0001`. The carry made in bit 0 passes through every slice.",
  ],
  suiteFaultsLead:
    'The figure runs the full test suite against a 16-bit ALU. You choose the fault. For each fault, predict which test kinds will catch it, then press "Run the suite".\n\nThe faults are:\n\n- "OVER stuck at 0": the OVER flag never signals overflow.\n- "Y9 stuck at 0": bit 9 of Y is always 0.\n- "C8 stuck at 0": the carry into bit 8 is lost.\n- "Z8 stuck at 1": the zero chain tells bit 8 "no 1 below" whatever bits 0 to 7 hold.',
  suiteFaultsAfter:
    'The suite ran 16 normal, 28 boundary, 16 random, and 19 adversarial tests for each fault.\n\n- "OVER stuck at 0": 0 normal, 4 boundary, 1 random, 5 adversarial fail. No normal word overflows.\n- "Y9 stuck at 0": 0 normal, 13 boundary, 6 random, 6 adversarial fail. No normal word or result has a 1 in bit 9.\n- "C8 stuck at 0": 3 normal, 10 boundary, 3 random, 6 adversarial fail. The normal tests that fail are "0017 - 0009", "0017 - 1" and "012C - 1": subtract adds NOT B and count down adds all 1s, so even small words make carries that pass bit 8.\n- "Z8 stuck at 1": 9 normal, 4 boundary, 1 random, 4 adversarial fail. ZERO looks only at bits 8 to 15, so every result below `0100` reads as zero; most normal results are that small.\n\nThe random counts change with "New random tests"; the others do not.',
  explanation:
    "**Why faults hide.** A fault stays hidden where the tests do not reach it. A test with small words uses only the low slices and builds short carries.\n\n**Boundary tests.** These sit where the ALU's behaviour changes. A count wraps at `FFFF` and at `0000`. A signed result overflows at `7FFF` and `8000`. The MINUS flag changes at the top bit. Boundary tests place words exactly on these points.\n\n**Adversarial tests.** These target the ALU's chains. The carry and zero chains pass through every slice. A test whose carry or whose run of zeros reaches the top checks every link. Words such as `5555` and `AAAA` give every slice a different bit from its neighbours. A word with one bit alone shows a slice that drops or invents a bit.\n\n**Random tests.** These try what nobody thought of. A seed repeats a random run, so a test is repeatable even though it looks arbitrary.\n\n**The limit.** No suite proves an ALU right. A passing suite says only that these tests found no fault. A good suite makes that a strong claim.",
  generalisation:
    "The test generator works at any width. At 64 bits, it builds the same 79 tests, using boundary words that fit the width: `0000000000000000`, `0000000000000001`, `7FFFFFFFFFFFFFFF`, `8000000000000000` and `FFFFFFFFFFFFFFFF`. Every expected result is worked out exactly, all 64 bits of it.",
  suite64Lead:
    'The figure runs the 79-test suite against the 64-bit ALU. Press the fault option to introduce "C40 stuck at 0": the carry into bit 40 is lost. Run the suite both ways to see how a fault hidden in the middle of the word shows up.',
  suite64After:
    'With "C40 stuck at 0", the 64-bit ALU fails these tests: normal 3 of 16, boundary 10 of 28, random 5 of 16 and adversarial 6 of 19. The healthy 64-bit ALU passes all 79.',
  writeAluLead: "Write the whole ALU with its width as a parameter: eight jobs and four flags.",
  c2Task:
    "The module alu has a parameter N, which defaults to 16. Its inputs are A and B (each N bits wide) and OP2, OP1, OP0. Its outputs are Y (N bits), ZERO, MINUS, COUT and OVER.\n\nThe challenge text declares three signals: D and S (each N bits) and CIN. It already sets D and CIN from your answers to the last lesson. Your job is to set S, Y and the four flags.\n\nWrite in this order:\n\n- The adder. S is the low N bits of A + D + CIN, and COUT is its carry out.\n- Y, by code. Code `000` is A AND B; `001` is A XOR B; `100` is A OR B; `101` is B. For the four arithmetic codes, Y is S.\n- ZERO. `Y == 0` is 1 exactly when every bit of Y is 0.\n- MINUS. It is Y's top bit, `Y[N-1]`.\n- OVER. It is 1 when A's and D's top bits are the same and S's top bit differs from them.\n\nYou may use everything this module's challenges have used, plus `==`.\n\nThe tests are the generated suite with seed 2026, at N = 16 and N = 64: 158 tests. Each is named by its width, its kind and its words, such as \"N = 16, boundary: 7FFF + 0001\". Each checks Y and all four flags.",
  c2Hints: [
    "Everything you need comes from three things: S from the adder, the bit-by-bit results from each code, and the top bits of A, D and S.",
    "Do not read OVER from B's top bit. The adder adds D, not B. When you subtract, D is NOT B.",
    "The adder is `assign {COUT, S} = A + D + CIN;`, as in the last lesson.",
    "Use a `case` on `{OP2, OP1, OP0}` inside `always_comb` to set Y. Write one line for each of the four bit-by-bit codes, and let `default: Y = S;` pick S for the arithmetic codes.",
    "Here is the full answer after the starting lines:\n\n```\nassign {COUT, S} = A + D + CIN;\nalways_comb begin\n  case ({OP2, OP1, OP0})\n    3'b000: Y = A & B;\n    3'b001: Y = A ^ B;\n    3'b100: Y = A | B;\n    3'b101: Y = B;\n    default: Y = S;\n  endcase\nend\nassign ZERO = Y == 0;\nassign MINUS = Y[N-1];\nassign OVER = ~(A[N-1] ^ D[N-1]) & (A[N-1] ^ S[N-1]);\n```",
  ],
  reflection:
    "Module 7 teaches you an ALU that does eight jobs, chosen by three select inputs. At its core is one adder whose second word changes with each job. Four flags report on the result in single bits. Built from slices, the ALU works at any width and can be opened one level at a time. A suite of four kinds of test, run at 16 and 64 bits, checks the ALU.\n\nYour last challenge is to write the complete ALU: eight jobs, four flags, parameterised by width. Tests grade your answer; none were written by hand. The ALU reads two input words, A and B, and produces Y and four flags. But where do A and B come from? And where do Y and the four flags go?",
  modelVsReality:
    'A fault, "stuck at 0" or "stuck at 1", is a model chip makers use: a wire held at one value by a flaw made in manufacture. Chips are tested for such faults with sets of tests chosen to expose them.\n\nThis suite tests a design in the simulator, not a chip. But the same idea holds: tests try many inputs to expose faults. A design could be proved right by reasoning about every possible input at once, without trying any. The course does not do this.\n\nThe random tests use a seed to make each run repeatable. The generator produces the same words on every computer, so your results match anyone else\'s.',
} as const;
