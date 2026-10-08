// Copyright © 2026 Christopher Snow

// The words of the lesson system-call-mechanism.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-12-traps/briefs, briefs 8A to 8C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 7 ended on a question. Can you write the handler that runs the shop's programs, one after another, each in user mode, and gives them the jobs of lesson 4?\n\nThe handler runs each program in a table, in turn, in user mode, and offers the four jobs of lesson 4. It writes a record for each program, and it stops the machine after the last.\n\nThe figure runs a handler that does part of this, on the six runs the tests use.",
  asksLead: "Read what each run asks, then press the button and compare what this handler left.",
  asksAfter:
    "The guided start leaves these results. Run 1 shows 25, then stops: job 4 stops the machine instead of running the next program. Run 2 shows nothing, because the fault stops the machine. Run 3 leaves the lamps at 0. Run 4 shows 5 and 77 but leaves no records. Run 5 shows 0, then stops. Only run 6, the empty table, matches.",
  motivation:
    "The handler has five parts.\n\n- The start sets C4, then runs the program whose number the word at `0x480` holds, counting from 0. It finds the program's address in the table `programs`, which the tests add after the handler: its first word is how many programs, then each program's address. It runs the program by writing C1 and C2, then running `resume`.\n- The choice reads C3 to tell a system call from a fault, and R1 to find the job.\n- The jobs: job 1 shows R2; job 2 puts a room's reading in R1; job 3 sets the lamps from R2's bits 2 to 0; job 4 ends the program.\n- The end of a program writes its record, at `0x400` plus 8 times its number: 0 if it ended with job 4, or its cause if it faulted. Then it moves to the next number and goes back to the start.\n- The stop comes after the last program, and it stops the machine.\n\nThe number lives in RAM, in the word at `0x480`, because a register would be a program's to change.\n\nJob 2 checks R2, because lesson 6 taught that a handler must not trust what a program gives it. R2 is 0 for room A and 1 for room B. Any other value gives 0, so no program can make the handler read a word that is not a sensor.\n\nThe handler keeps every register but R1 for the program across a job, as lessons 2 and 4 taught.",
  prediction:
    'The figure lists the whole handler. The second run\'s two programs come after it. `direct` stores 7 to the display itself. `after` shows 8 and ends. Choose an answer, then press "Check my prediction".',
  p1Question:
    "When the run ends, what does the word at `400`, the first program's record, hold, as a decimal number?",
  p1Explain:
    "The record is 50. That is cause `32`, a device's address in user mode, written as a decimal number. The first program, `direct`, stores to the display, which is a device's address, in user mode.\n\n32 is the cause's digits read as a decimal number. A record of 0 would mean the program ended with job 4, which it never reached. A decimal 34 would be cause `22`, a refused `stop`. The second program still ran, and it showed 8.",
  investigation:
    "The debugger runs the whole handler on the first run's programs. The debugger shows R1, R2, R8 and R9, the control registers with the mode in words, the records at `400` and `408`, and the program's number at `480`.",
  walkLead:
    '1. Press "Run to a breakpoint": the run pauses at `start:` with the program\'s number in `480`.\n2. Press it again, and again. At `ended:`, read C3 and the mode, then the record the handler writes.\n3. Press "Run to the end".',
  walkAfter:
    "Both records are 0, so both programs ended with job 4. The display showed 25, then -250, and the word at `480` ends at 2. The run ran 128 instructions, and 5 traps went to the handler, all `call system`. The handler stops at `044`, its `done:` line.",
  construction:
    "Build the handler in this order, and test each part on the runs as you go.\n\n- the start alone, with every trap running `stop`: run 1 shows 25 and stops;\n- job 4 and the end of a program: run 1 runs both programs;\n- the record for a fault: run 2 records 50;\n- jobs 2 and 3: runs 1, 3 and 5;\n- the empty table: run 6.\n\nThen use the debugger in the challenge. Set breakpoints, and step through any test's programs.",
  failureExperiment:
    "The figure runs a handler whose fault part skips the faulting instruction, as lesson 1's handler did. It adds 4 to C2 and resumes, instead of ending the program. The figure runs it on the six runs.",
  skippingLead: "Predict which runs match, then press the button.",
  skippingAfter:
    "Runs 1, 4 and 6 still match their tests. Run 2 does not. The store to the display is skipped, and `direct` ends with job 4, so its record is 0, not 50. 8 is still shown. Run 3 skips the refused `stop`. The run goes on past the program's end, onto words that are not instructions, and each one is skipped in turn. The debugger cuts the run off after 5000 instructions. Run 5 has the same result: the word that is not an instruction is skipped, and the run is cut off after 5000 instructions. Skipping suits a handler that knows what the program meant. A handler that runs programs it did not write cannot know, so it ends the program and records why.",
  explanation:
    "The handler is the only program that runs in system mode. Every user program reaches the display, the sensors and the lamps only through its jobs. Every mistake a program makes comes back to the handler as a trap.\n\nA program ends in one of two ways. It asks for job 4, or it faults. Both lead to the same lines: record, next number, start. A fault records its cause as a decimal number, so the shop can read why the program ended. A program that ends with job 4 records 0.\n\nLessons 1 to 6 each gave one part. Lesson 1 gave the trap and `resume`. Lesson 2 gave saving registers. Lesson 3 gave user mode. Lesson 4 gave system calls. Lesson 6 gave the handler's own state, kept in memory, and the rule to trust nothing a program gives it. Interrupts (lesson 5) are off in these runs.",
  generalisation:
    "A handler that runs programs one after another, gives them jobs and ends them when they fault is the core of the program a real machine runs first, which runs all the others.\n\nEverything it needs is on this machine: C0 to C4, `resume`, user mode and `call system`.\n\nWhat it does not do here is share the machine between programs that run at the same time. With the timer's interrupt, a handler could switch away from one program and resume another. That is beyond this module.",
  challenge:
    "There are three ways into the challenge. The guided start gives the handler's start and its choice of job. You write jobs 2 and 3 and the end of a program. Or you start from the specification: an empty program with the requirements as comments. Or you start from the requirements and the tests alone.\n\nChoose one with the challenge's own control.",
  runLead: "Write the handler, step through it on the tests' programs, then run the tests.",
  c1Task:
    "1. Write a handler that runs each program the table `programs` names, in order, in user mode with interrupts off. The tests add the table and the programs after it.\n2. Offer jobs 1 to 4 by `call system`. Job 1 shows R2. Job 2 puts a room's reading in R1. R2 is 0 for room A and 1 for room B. Any other R2 puts 0 in R1, so no program can make the handler read a word that is not a sensor. Job 3 sets the lamps from R2's bits 2 to 0. Job 4 ends the program.\n3. A program that faults ends there. For program k, counting from 0, write 0 to the word at `0x400 + 8k` if it ended with job 4. Write its cause as a decimal number if it faulted.\n4. Across a job, keep every register but R1 as the program left it. After the last program, the handler runs `stop`.\n5. There are 6 tests. Room A reads -184 and room B reads -250. Each checks the words shown, the lamps, each program's record, and that the run ends at a `stop`.",
  c1Hints: [
    "The idea: keep the number of the program running in the RAM word at `0x480`. The start reads that word, finds the program's address in the table, writes 0 to C1 and the address to C2, and runs `resume`.",
    "A common mistake: running `stop` for job 4. That stops the machine. Job 4 ends the program, and the handler starts the next one.",
    "A smaller example: lesson 4's handler chose the job with `R8 <= 1` and `if R1 == R8 goto show`, after checking C3 for `41`.",
    "Part of the answer: the program's address is `word[programs + 8 + 8k]`. Multiply k by 8 by adding it to itself three times. Each addition doubles it. Add `programs`, then load with `word[R1 + 8]`.",
    "The whole answer: the guided start's lines, with these parts in place of its stubs:\n\n```\nroom:   R1 <= word[sensorA]     // job 2: room A when R2 is 0\n        R8 <= 0\n        if R2 == R8 goto back\n        R1 <= word[sensorB]     // room B when R2 is 1\n        R8 <= 1\n        if R2 == R8 goto back\n        R1 <= 0                 // no such room\n        goto back\nlight:  word[lamps] <= R2      // job 3: the lamps from R2's bits 2 to 0\n        goto back\n...\nfinish: R9 <= 0                 // job 4: the program ended; its record is 0\nended:  R8 <= word[0x480]       // record R9 for program R8, at 0x400 + 8 × R8\n        R1 <= R8 + R8\n        R1 <= R1 + R1\n        R1 <= R1 + R1\n        word[R1 + 0x400] <= R9\n        R8 <= R8 + 1\n        word[0x480] <= R8       // the next program\n        goto start\n```\n\nKeep `back:` as the guided start has it, between `light:` and `finish:`. The `...` in the block stands for `back:` and its lines.",
  ],
  reflection:
    "The machine now runs the shop's programs. It has logic gates, registers, a datapath, a controller, an instruction set, programs, and a handler over them.\n\nEvery part was built, but in separate lessons, on separate drawings.\n\nCan you follow one of the shop's programs through the handler and down to the gates of the one machine that runs it?",
  modelVsReality:
    "A real machine's first program does what this handler does, with far more. It loads programs from storage, gives each its own memory, and switches between them on the timer's interrupt.\n\nReal machines protect each program's memory from the others. This one protects only the devices and the control registers.\n\nIts jobs are numbered as this handler's are, and a program asks for a job with one instruction.",
} as const;
