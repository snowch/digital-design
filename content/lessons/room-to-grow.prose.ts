// Copyright © 2026 Christopher Snow

// The words of the lesson room-to-grow.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-10-instruction-set/briefs), checked against the simulator, and placed
// here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  mapLead:
    "The map runs every kind and job through the decoder, with the constants 0 and 5. A ✓ marks an instruction. A dot marks a word that is not one. A c marks an instruction only for some constants.",
  prediction:
    'The program has two instructions: R1 ← 66, then memory[`7C0`] ← R1, which shows R1 on the display. It has no stop. After it, the ROM holds 0s. Choose an answer and press "Check my prediction". Then press "Run the programs" to run it.',
  p1Question: "After the store at `004`, how does the run end?",
  p1Explain:
    "It stops at `008` with cause `21`. The word at `008` is `00000000`, kind 0: an illegal instruction. The display shows 66: both instructions ran. A word of all zeros is illegal on purpose: a program that runs off its end stops at the first word of zeros. If data followed the program in the ROM, the machine would run the data's words as instructions first.",
  question:
    "Lesson 3 ended: kinds 0 and 9 to F say nothing. What does the machine do with a word it has no instruction for? What else does it leave out, and what would each cost to add?",
  motivation:
    "A word is an illegal instruction when its kind is 0, or 9 to F; when its job is one its kind does not define; or when it is a system job 2 or 3 naming a control register outside 0 to 4. Of the 256 pairs of kind and job, 37 are instructions whatever the constant. Two more, kind 8's jobs 2 and 3, are instructions only when the constant is 0 to 4. At an illegal instruction the machine stops with cause `21` (Module 9). A word of all zeros, `00000000`, is kind 0: illegal. After a program and its data, every byte of the ROM is 0.",
  investigation:
    "The machine has no multiplication. The figure compares two programs that work out 7 × 5.",
  multiplyLead:
    'The first program adds 7 into R3 five times, in a loop. R2 counts down from 5, and the branch goes back while R2 differs from R0. R0 holds 0. The machine has no comparison with zero, so the program keeps 0 in a register. The second program doubles 7 twice and adds 7 once: 7 + 7 is 14, 14 + 14 is 28, 28 + 7 is 35. It works only for a factor known when the program is written. Press "Run the programs".',
  multiplyAfter:
    "Both programs display 35. The loop approach writes 9 instructions but runs 21 when the program executes. The doubling approach writes 6 instructions and runs 6. The loop runs 3 instructions each time it goes around. For 7 × n, it runs 4 + 3n + 2 instructions total, the stop among them.",
  construction:
    "In the course's machine, kinds 9 to F are free: seven kinds. In your copy of Module 9's machine, kind 9 holds the call through a register, and kinds A to F are free. Every word of a free kind is illegal today.",
  sortWordsLead: "For each word, say what the course's machine does when it reaches it.",
  c1Task:
    "For each of the six words below, choose what the course's machine does when it reaches that word. You have three options: the machine runs it; the machine stops as `stop`; or the machine stops with cause `21`. The words are `00000000`; `9040F000` (your copy's call through R4); `18123000`; `51000000`; `84000000`; `22102064`. There is one test for each word.",
  c1Hints: [
    "Read K, then J. For each word, check: is the kind one of 1 to 8? Is the job one its kind defines?",
    "`9040F000` runs in your copy of the machine, not in the course's machine, which refuses kind 9.",
    "`00000000` is kind 0, so the machine stops with cause `21`.",
    '`51000000` is a branch whose job, 1, is "never". It runs and does nothing. `18123000` is a register job with job 8, which kind 1 does not define.',
    "The whole answer: cause `21`, cause `21`, cause `21`, runs, `stop`, runs.",
  ],
  newWordsLead:
    "The program that chooses a room, from Module 9's last lesson, uses your copy's call through a register at address `004`: the word `9040F000`. The figure runs this program on both machines. First it runs on your copy, which knows about kind 9. Then it runs on the course's machine, which does not know kind 9. Before you run them, predict what each machine displays. Then press \"Run the programs\" to check.",
  newWordsAfter:
    "Your copy displays -184, room A's reading. R15 holds the address `008`, and it stops at its stop instruction. The course's machine stops at `004` with cause `21`, and its display shows 0. A new instruction makes words an older machine would refuse. Programs written for the course's machine run on your copy. Every word they use means the same thing there.",
  explanation:
    "Every instruction the machine leaves out would cost the circuit something, and would save programs something.\n\n| Left out | What the circuit would need | What a program does without it |\n| --- | --- | --- |\n| Multiplication | a new part beside the ALU | adds in a loop, 3 instructions run each time round |\n| A shift | a new part beside the ALU: a shift is not a chain of one-bit slices | doubles a number by adding it to itself, one instruction a place |\n| Set if less | a new source for register Y, the condition as a word, and a control signal | a branch and a count around each comparison |\n| Call through a register | a decoder column and two terms of the checks (Module 9) | chooses among fixed calls with branches |\n| Comparison with zero | a 0 on the ALU's B, as AZERO gives a 0 on A | keeps 0 in a register: one instruction, once |\n| A wider constant | a second layout, with selectors (lesson 2) | a word in the ROM and one load, or sums of constants |\n\nAn instruction pays for itself where many programs run it often and the circuit needs little.",
  generalisation:
    "The free kinds are room for instructions not yet thought of. A new instruction takes a free kind, so every old word keeps its meaning. Old programs run unchanged on the new machine.\n\nA word the machine refuses today stops the program with cause `21`. Why does the machine refuse an unused word? If unused words did something today, a later instruction could not take them without changing what old programs do. The machine refuses them instead. That way, the unused codes stay free for new instructions.",
  countLoopLead: "Count the instructions the loop runs.",
  c2Task:
    "The loop that calculates 7 × n runs 4 instructions before the loop starts, 3 instructions each time round the loop, and 2 instructions after the loop ends: the store and the stop.\n\nHow many instructions does the machine run in total, including the stop, for 7 × 9? How many for 7 × 50? Count each instruction that runs, even if it runs more than once.\n\nThere are 2 tests, one for each answer: one for 7 × 9 and one for 7 × 50.",
  c2Hints: [
    "The idea: count the instructions run once, and the instructions run each time round.",
    "A common mistake: counting the instructions written, 9, not the instructions run.",
    "A smaller example: 7 × 5 runs 4 + 15 + 2, which is 21.",
    "Part of the answer: 7 × 9 runs 4 + 27 + 2.",
    "The whole answer: 33 and 156.",
  ],
  reflection:
    "A free kind can hold a new instruction.\n\nWhich one would you add? How would you show it is worth what it costs the circuit?\n\nThe next lesson shows one way to answer these questions. It designs a new instruction. It justifies the new instruction with a program it shortens. Then it builds the new instruction into your copy of the machine.",
  modelVsReality:
    "Real instruction sets grow over many years. A maker adds new instructions by using codes the older machines refused. That way, old programs keep running on the new machine.\n\nA program that uses a new instruction needs a machine that has it. A program using kind 9 needs a machine like your copy here, which has kind 9. The course's machine still refuses it.",
} as const;
