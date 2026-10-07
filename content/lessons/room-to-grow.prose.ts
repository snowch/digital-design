// Copyright © 2026 Christopher Snow

// The words of the lesson room-to-grow.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-10-instruction-set/briefs, brief 4R), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Module 8's lesson 3 ran a program with no stop into the ROM's zeros. Module 9's lesson 2 mapped the kinds and jobs the decoder refuses, and why.\n\nThis lesson asks what is left. Why is an instruction of zeros refused on purpose? What does the machine do with data placed after a program? Why refuse unused codes at all, and how much room do they leave? What would each instruction the machine leaves out cost, and save?",
  motivation:
    "The map is Module 9's lesson 2's: every kind and job, run through the decoder.\n\nOf the 256 pairs of kind and job, 37 are instructions, and 2 more (kind 8's jobs 2 and 3) are instructions for some constants.\n\nKinds 1 to 8 leave 89 jobs undefined. Kinds 9 to F, seven kinds, are free on the course's machine.\n\nThe instruction of all zeros, `00000000`, is kind 0, refused on purpose. A program that runs off its end into the ROM's zeros halts at the first of them, with cause `21`.",
  mapLead:
    "The map runs every kind and job through the decoder, with the constants 0 and 5. A ✓ marks an instruction, a dot an instruction the decoder refuses, a c an instruction only for some constants.",
  prediction:
    'The program has two instructions: R1 ← 66 at `000`, and memory[`7C0`] ← R1 at `004`, which shows R1 on the display. It has no stop.\n\nAfter them, at `008`, the program puts data: the word `12345678` in hexadecimal.\n\nThe machine fetches whatever 32 bits are at the PC.\n\nChoose an answer and press "Check my prediction". Then press "Run the programs".',
  p1Question: "After the store at `004`, where does the run halt?",
  p1Explain:
    "The run halts at `00C` with cause `21`, after one more instruction.\n\nThe word's low 32 bits, at `008`, are `12345678`: kind 1, job 2, so the machine runs it as R5 ← R3 + R4. The next 32 bits, at `00C`, are the word's top half, `00000000`: kind 0, refused.\n\nThe display shows 66, and 3 instructions ran.\n\nOther data halts sooner: 5000 puts `00001388` at `008`, kind 0; -250 puts `FFFFFF06`, kind F. Both halt at `008`.",
  investigation:
    "The machine has no multiplication; the figure runs two programs that work out 7 × 5.",
  multiplyLead:
    'The first program adds 7 into R3 five times, in a loop. R2 counts down from 5, and the branch goes back while R2 differs from R0, which holds 0: the machine has no comparison with zero, so the program keeps 0 in a register.\n\nThe second doubles 7 twice and adds 7 once: 7 + 7 is 14, 14 + 14 is 28, 28 + 7 is 35. It works only for a factor known when the program is written.\n\nPress "Run the programs".',
  multiplyAfter:
    "Both programs display 35.\n\nThe loop has 9 instructions and runs 21: 3 each time round. For 7 × n it runs 4 + 3n + 2, the stop among them.\n\nThe doubling has 6 instructions and runs 6.",
  construction:
    "A code the machine refuses today is room for an instruction later. A later instruction can take any refused code except the instruction of zeros, which must stay refused to halt a program that runs off its end.\n\nA code an instruction has today is taken: an old program may use it, and giving it a new meaning would change what that program does.\n\nOn the course's machine, kind 9 is free. In your copy, the call through a register took it.",
  sortCodesLead: "For each code, say whether a later instruction could take it.",
  c1Task:
    "For each of six codes, choose: free, a later instruction can take it; taken, an old program may use it; or kept refused, it halts a program that runs off its end.\n\nThe codes are `18123000`, `00000000`, `51000000`, `B1230000`, `84000000` and `9040F000`, each on the course's machine.\n\nThere is one test for each code.",
  c1Hints: [
    "Read K, then J. Is the code an instruction on the course's machine today?",
    "A common mistake: calling `51000000` free because it does nothing. It is a branch with job 1, never: an instruction an old program may use.",
    "A smaller example: `13123000` is a register job that subtracts, so it is taken.",
    "Part of the answer: `00000000` is kept refused; `18123000` is free, a job kind 1 does not define.",
    "The whole answer: free, kept refused, taken, free, taken, free.",
  ],
  oldProgramLead:
    "The colder-room program from Module 8 uses only the course's instructions.\n\nThe figure runs it on the course's machine and on your copy, which adds kind 9, the call through a register.\n\nPredict what each displays, then press \"Run the programs\".",
  oldProgramAfter:
    "Both display -250, room B's reading. Both run 6 instructions and halt at the stop at `014`.\n\nYour copy took only codes the course's machine refused, so every instruction of the old program means the same on both.",
  explanation:
    "Every instruction the machine leaves out would cost the circuit something and save programs something. Each needs a decoder column and a place in the checks, as every instruction does; the list gives what more it needs.\n\n**Multiplication**\n\n- What the circuit would need besides: a multiplier beside the ALU: two 64-bit words multiplied by adding up to 64 shifted copies takes 63 adders of 64 bits, where the ALU has one; and a new source for register Y's word, with a control signal to choose it\n- What a program does without it: adds in a loop, 3 instructions run each time round\n\n**A left shift by any number of places**\n\n- What the circuit would need besides: a shifter beside the ALU: 6 layers of 64 two-way selectors, one layer for each bit of the number of places; and a new source for register Y's word, with a control signal\n- What a program does without it: adds a number to itself, one instruction for each place\n\n**A call through a register**\n\n- What the circuit would need besides: nothing more: register Y already takes PC + 4 for a call (Module 9's lesson 5)\n- What a program does without it: sets the return address with one constant job and jumps through the register: one more instruction run, and 4 more bytes of ROM, for each call\n\n**A comparison with zero, `if RA < 0` or `if RA >= 0`**\n\n- What the circuit would need besides: a 0 on the ALU's B; AZERO's 0 on A gives 0 - RB, which compares RB with 0 the other way round\n- What a program does without it: keeps 0 in a register: one instruction, once\n\n**A wider constant**\n\n- What the circuit would need besides: a second layout, with selectors (lesson 2)\n- What a program does without it: a word in the ROM and one load, or sums of constants (lesson 3)\n\nLesson 5 designs one more: set if less, which writes 1 to a register when one register is less than another, and 0 when it is not.",
  joinPlacesLead: "PROVISIONAL: the datapath, opened on the four marked parts.",
  generalisation:
    "The machine refuses every code it does not define. If an unused code did anything, a program could rely on it, and a later instruction could not take that code without changing what the program does.\n\nRefused codes stay free. A new instruction takes one. Every old instruction keeps its meaning. Old programs run unchanged on the new machine.\n\nA program that uses the new instruction needs the new machine. On the course's machine, your copy's kind 9 halts with cause `21`.",
  countCallsLead: "Count the instructions each run makes, then run the tests.",
  c2Task:
    "Your copy runs this program, which shows room A's reading, then room B's, each by a routine called through R4.\n\n```\nR4 <= showA\ncall R4, R15\nR4 <= showB\ncall R4, R15\nstop\nshowA: R2 <= word[sensorA]\nword[display] <= R2\ngoto R15\nshowB: R3 <= word[sensorB]\nword[display] <= R3\ngoto R15\n```\n\nThe course's machine has no call through a register. Each call becomes two instructions: a constant job puts the return address in R15, and a jump through R4.\n\nHow many instructions does each run, the stop among them: the program above on your copy, and the same program without the call through a register on the course's machine?\n\nThere are 2 tests, one for each count.",
  c2Hints: [
    "The idea: follow the run, instruction by instruction, through each routine and back.",
    "A common mistake: counting the instructions written, not those run.",
    "A smaller example: one call, to a routine of three instructions, then the stop: 1 + 1 + 3 + 1 is 6 with the call through a register.",
    "Part of the answer: without the call through a register, each call runs one instruction more.",
    "The whole answer: 11 with the call, 13 without.",
  ],
  reflection:
    "A free kind can hold a new instruction.\n\nWhich one would you add? How would you show it is worth what it costs the circuit?\n\nThe next lesson answers both for one instruction: it designs set if less, justifies it with a program it shortens, and builds it into your copy.",
  modelVsReality:
    "The course's ROM holds 0s after a program, so a program that runs off its end halts at once.\n\nA real flash memory, erased and not written, reads all 1s. On the course's machine `FFFFFFFF` is kind F, refused as well. A real machine must refuse whatever its unwritten memory reads.",
} as const;
