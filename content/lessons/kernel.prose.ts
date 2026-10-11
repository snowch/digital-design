// Copyright © 2026 Christopher Snow

// The words of the lesson kernel.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/beyond-the-machine/briefs, briefs L1 to L4), checked against the model, and placed
// here by the lesson's structure. Edit a fact here only after checking it; the lesson's facts
// test holds the numbers.

export const PROSE = {
  question:
    "Lesson 12.8 built a runner that runs programs one after another. Its generalisation says what it cannot do:\n\n> What it does not do here is share the machine between programs that run at the same time. With the timer's interrupt, a handler could switch away from one program and resume another. That is beyond this module.\n\nThe shop wants two things from the machine. The gap between room A and room B should show on the display all day, from a gap program that never ends. The day's report should be made as well.\n\nThe runner in the figure below runs a table of two: the gap program first and the report second. The machine runs one instruction at a time. So how can one machine run two programs that both get on?",
  runnerLead:
    'Press "Run to the end" and watch the lanes. There is one lane for the start, one for the handler and one for each program. Then look at the two records, at `400` and `408`, one for each program. Which lane stays empty?',
  runnerAfter:
    "The run was cut off after 5,000 instructions. The gap program's lane and the handler's lane alternate: each `call system` goes to the handler and back. The runner shows the gap 94 times. The report's lane stays empty, and both records are still X. The runner starts the next program only when one ends. The gap program never ends, so the report never starts.",
  motivation:
    "Something has to start the programs, stop them and switch between them. The program that does this is the one the machine runs first. It runs in system mode, so it alone reaches the devices and the control registers. It starts, stops and switches the other programs. That program is a **kernel**. The kernel in this lesson is lesson 12.8's start and handler, grown.\n\nA user program reaches a device only through a system call. The figure above showed one again and again. The gap program's `call system` moved into the handler's lane. C2 took the line after it, C3 took `41`, the mode became system, the job ran, and `resume` went back to the line after the call.\n\nA system call happens only when the program asks. The gap program never asks to give up the machine.\n\nThe timer interrupts a program without asking it. With interrupts on, as they are for each program here, it does so between two instructions. So a kernel can take the machine back from a program that never asks.\n\nTo give the machine to another program and come back later, the kernel must keep everything the machine holds for the stopped program. The kernel in this lesson keeps that in a save area of its own in the RAM, one for each program. It puts the other program's back.",
  prediction:
    'The figure runs the kernel with both programs and the timer set to 80. The third timer interrupt stops the gap program before `R2 <= R5 - R1`, with R5 holding room A\'s reading, -184. The report then runs and sets its own R5 to 0. What will R5 hold when the gap program next runs `R2 <= R5 - R1`? Choose an answer, then press "Check my prediction".',
  p1Question: "When the gap program next runs `R2 <= R5 - R1`, what does R5 hold?",
  p1Explain:
    "R5 holds -184, room A's reading. Before the report ran, the kernel saved all sixteen of the gap program's registers in its save area. It put them back before the gap program went on. So the gap program cannot tell it was stopped.\n\nThe three wrong options each fail for their own reason. 0 is the report's R5, which went into the report's save area. -250 is room B's reading, which the gap program has not yet asked for. X would mean the register was never set.",
  investigation:
    "The figure runs the kernel with breakpoints at `tick` and `load`. It draws the two save areas as boxes, with the words at `480` and `488` above them. `480` holds the address of the save area of the program that runs. `488` holds the address of the save area of the program that waits, or 0 when none waits. At the start, `480` holds `500`, the gap program's save area, and `488` holds `5A0`, the report's. R9 holds the address of the save area being filled. The figure also shows the control registers, the timer, \"waiting\", and a lane each for the start, the kernel's handler, the gap program and the report.",
  switchLead:
    '1. Press "Run to a breakpoint". The run stops at `tick`. Read C3 and C2.\n2. Press "Step" through the save, and watch the gap program\'s save area fill, word by word.\n3. Watch the words at `480` and `488` change places.\n4. Step through `load` as the report\'s words go back into the registers, C1 and C2, and see `resume` go into the report.\n5. Run to the next `tick`, and back.',
  switchAfter:
    "At the first `tick`, C3 is `81` and C2 holds the address of the gap program's `goto gap`, the instruction not yet run. The switch stores that address at `588`. A switch is 60 instructions: 9 up to and including the write to the timer, then 51. With a count of 80, each program runs 29 instructions a turn. The run is cut off after 5,000 instructions. By then the report has ended with record 0, and the gap was shown 65 times.",
  construction:
    "This is a challenge with three answers. It asks about a moment that no figure shows: the timer stops the report before `R11 <= R11 - 1`, at `210`. You work out what the switch stores from the layout of the save areas.",
  saveLead:
    "You work out what the switch stores in the report's C2 word, where its R13 word sits, and what its C1 word holds.",
  c1Task:
    "The kernel and the two programs are as in the figures, with the timer's count at 80. The timer stops the report before `R11 <= R11 - 1`, at address `210`, and the kernel switches to the gap program.\n\nGive three answers:\n\n1. the word the switch stores in the report's C2 word, as three hexadecimal digits;\n2. the address of the word that holds the report's R13, as three hexadecimal digits;\n3. the report's C1 word as its two bits, bit 1 then bit 0.\n\nThe report's save area starts at `5A0`. R0 to R15 come first, one word (8 bytes) each, then C1, then C2, then the record.",
  failureExperiment:
    "The figure runs the same kernel with the timer's count at 40, which is shorter than a switch. It keeps the same two programs and the same cut-off of 5,000 instructions. Before you run it, predict what the display will show.",
  shortLead:
    'Answer the question first. Then press "Run to the end" and watch the lanes. Watch which lanes move, and whether the display changes at all.',
  shortQuestion: "What does the display show when the run ends?",
  shortExplain:
    "The display shows 0, so the gap is never shown. The timer counts the kernel's own instructions too. With a count of 40, it reaches 0 inside the kernel. The interrupt is taken at the edge after `resume`, before the program runs an instruction, so the kernel switches again at once.",
  shortAfter:
    "After the gap program's first stretch, neither program runs another instruction. The lanes show only the handler's. The run is cut off after 5,000 instructions, with 83 timer interrupts. With this kernel, any count of 51 or less stops both programs. The switch costs instructions, and the timer counts them, so a count must be longer than the 51 instructions the switch runs after its write to the timer.",
  explanation:
    "A program, to the machine between two instructions, is its sixteen registers, C2 and C1. C2 holds where the program goes on. C1 holds its mode and whether interrupts are on. Everything else belonging to the program lives in the ROM and the RAM, and stays put.\n\nSo the switch saves those eighteen words and puts eighteen others back. The stopped program cannot tell it was stopped.\n\nEach program has a save area: 20 words in the RAM that the kernel keeps for it. The words at `480` and `488` change places at each switch, so they are how the kernel tells which program runs. When a program ends, the kernel stores its record in that program's save area.\n\nThe kernel saves into its own words, not onto the program's stack, as lesson 12.2's handler did. It saves every register, because an interrupt can arrive between any two instructions, and may change none of them.\n\nA system call goes back to the program that asked. The timer's interrupt may go back into the other program.",
  lanesLead:
    "The figure draws the kernel's run as lanes over its first switches: the start, the kernel's handler, the gap program and the report. The mode is a band, and interrupts are a second band. Press \"Next move\" to go move by move, and watch where each move goes.",
  lanesAfter:
    "The two programs' lanes alternate, and each move between them goes through the handler's lane. Each system call goes into the handler and back to the program that asked. Each timer interrupt goes into the handler and out into the other program. Each switch is 60 instructions in the handler's lane.",
  generalisation:
    "One machine runs one instruction at a time. A person at the display still sees both programs at work. Module 0 said \"A phone runs many programs at once\". Here, a kernel switching quickly makes it true.\n\nThe price is switching. Every turn costs 60 instructions of switching, and a program's turn at a count of 80 is 29 instructions of its own.\n\nReal kernels also:\n\n- run many programs, and choose which runs next;\n- give each program memory of its own that the others cannot reach. Here the report could write over the gap program's save area, which the unprotected RAM of 12.3 allows, with more at stake;\n- count time with their timers, not instructions;\n- let a program that waits for a device give up the machine meanwhile.",
  challengeLead:
    "Set up a second program for the kernel, so that it runs both programs, then test your start with three runs.",
  c2Task:
    "The box holds the kernel, given whole, and a start that sets up the first program, named `program`, which the tests add. It sets that program's C2 word to its first line, its C1 word to 2 (user mode, interrupts on) and its R14 word to `7C0`. It puts `500` at `480`, 0 at `488`, and sets the timer.\n\nSet up the second program, named `second`, in the save area at `5A0`, so that the kernel runs both. Change only the start. When the second program starts, R1 holds the address of its readings, and R2 holds how many there are, as a function receives its arguments (11.3). The tests add the readings, named `secondLog`, and a word holding how many, named `secondCount`.\n\nThe tests' programs call a function that pushes on the stack, so each program needs its own stack. The RAM from `640` to `7BF` is free.\n\nSave area words run from `5A0` (R0) to `618` (R15), one word each: R14 at `610`, C1 at `620`, C2 at `628`, and the record at `630`.\n\nThree runs test your text: each adds two programs after it, and checks the words shown, in order, both records (`590` and `630`), C1 at the end, and that the run ends at the kernel's `stop`.",
  reflection:
    "The course began with a machine that runs one program. It ends with a kernel that runs two on that machine.\n\nWhat had to be saved, and why? What would the machine need in order to keep one program out of another's words?\n\nThe author's book *Systems From Scratch* follows xv6, a real kernel written for teaching. Its chapter [Traps and System Calls](https://snowch.github.io/computer-systems/traps-and-system-calls/) follows one system call into xv6 and back out. The hardware records where the program was and why, turns interrupts off, changes the mode and jumps to the handler, as this machine's trap does. The software then saves every register, because one way in serves calls, faults and the timer. [Scheduling and Context Switches](https://snowch.github.io/computer-systems/scheduling-and-context-switches/) shows what xv6 saves when it switches programs, and why that switch saves fewer registers than the trap.",
  modelVsReality:
    "This kernel runs two programs. Both are already in the ROM, in a fixed order. The timer counts instructions, so every run is the same. The RAM is not protected, so a program could write over the other's save area. A real kernel loads programs from storage, runs many, chooses which runs next, gives each its own memory that the others cannot reach, and its timer counts time.",
  c1Hints: [
    "An interrupt's return point is the instruction that has not yet run.",
    "A common mistake is to count a register's word from `5A0` in steps of 1 or 4. Each word is 8 bytes.",
    "The gap program's R3 is at `500` plus 3 times 8: `500` plus `18` gives `518`.",
    "Part of the answer: the switch stores `210` in the report's C2 word.",
    "The whole answer is `210`, `608` and `10`. `608` is `5A0` plus 13 times 8, which is 104, or `68` in hexadecimal. `10` is user mode with interrupts on, as the start wrote it.",
  ],
  c2Hints: [
    "A program waiting to start is held in its save area. `load` reads that area into every register, C1 and C2.",
    "A common mistake is to set R1 and R2 in the start, before `goto load`. `load` then writes over both from the save area.",
    "A word stored at `518` is the first program's R3 when it starts, 24 bytes into the first save area.",
    "This part of the answer sets the second program's C2, C1 and R14 words.\n\n```\n        R1 <= second\n        word[0x628] <= R1       // the second program's return point\n        R1 <= 2\n        word[0x620] <= R1       // its status\n        R1 <= 0x700\n        word[0x610] <= R1       // its R14\n```",
    "The whole answer is the block above, then the block below. Put `R1 <= 0x5A0` in place of `R1 <= 0` before `word[0x488] <= R1`.\n\n```\n        R1 <= secondLog\n        word[0x5A8] <= R1       // its R1: the address of its readings\n        R1 <= word[secondCount]\n        word[0x5B0] <= R1       // its R2: how many readings\n```",
  ],
} as const;
