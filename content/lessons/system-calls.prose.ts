// Copyright © 2026 Christopher Snow

// The words of the lesson system-calls.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-12-traps/briefs, briefs 4A to 4C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 3 ended on a question: how can a user program show a reading, if it may not touch the display?\n\nThis figure's handler starts a program in user mode, as lesson 3's did. The handler writes 0 to C1 and `028` to C2, then runs `resume`, so the program starts at `028`. The program means to show 25 with `word[display] <= R2`.",
  directLead: 'Press "Run to the end" and read the display and the control registers.',
  directAfter:
    "The store to the display traps with cause `32`, and the handler stops the machine at `024`.\n\nThe display still shows 0, and C2 holds `02C`, the store that faulted.\n\nIn user mode, a program cannot show anything by itself.",
  motivation:
    "The program asks the handler, which runs in system mode, to do the job for it, with the line `call system`. `call system` traps on purpose, with cause `41`. User mode allows it.\n\nA trap that a program makes on purpose to ask the handler for a job is a **system call**.\n\nThe program says which job it wants in R1, and gives the job's words in R2 to R4. The handler leaves the result in R1. These are the calling convention's registers, as for a function whose first argument names the job.\n\nThe jobs are numbered:\n\n| R1 | What the handler does |\n|---|---|\n| 1 | Shows R2 on the display. |\n| 2 | Reads a room's sensor. R2 is 0 for room A and 1 for room B. The reading comes back in R1. |\n| 3 | Sets the lamps from R2's bits 2 to 0. |\n| 4 | Ends the program. |\n\nThe handler reads C3 to tell a system call from a fault, then reads R1 to choose the job. It runs the job, then `resume`.\n\nThis lesson's handler offers jobs 1 and 4.",
  prediction:
    'The figure lists a handler that offers jobs 1 and 4, and a program that shows 25, adds 1 to R2, shows it again, and ends. Its first `call system` is at `064`. Choose an answer and press "Check my prediction".',
  p1Question: "Just after the `call system` at `064` traps, what does C2 hold?",
  p1Explain:
    "C2 holds `068`, the instruction after the call.\n\nA system call's return point is the next instruction, not the call: the job is done, and the program goes on from the next line.\n\nAfter a fault, the return point is the instruction that faulted, `064` here.\n\n`01C` is the handler's address, which the PC takes.",
  investigation:
    "The timeline runs the program from its first line in user mode. After each edge, it shows the mode.\n\nEach `call system` traps, and the machine goes to the handler in system mode. `resume` brings the program back to the line after the call, in user mode.",
  timelineLead:
    '1. Press "Next edge" until the first `call system`. Read its transfers, especially C2 and C3.\n2. Keep pressing "Next edge" through the handler\'s lines, to the store to the display and to `resume`.\n3. Keep pressing "Next edge" through the second call and the third, to the end.',
  timelineAfter:
    "Each call's return point is the line after the call. The handler shows 25, then 26. Each `resume` takes the program back to user mode. Job 4 ends the program: the handler runs `stop` at `054`. The run made 3 system calls in all.",
  construction:
    "You can write a system call's registers without running it, from the table of jobs.",
  answersLead: "Work out each answer from the table of jobs, then run the tests.",
  c1Task:
    "1. Give, as decimal numbers:\n   - what R1 holds for the job that shows R2;\n   - what R1 holds for the job that ends the program;\n   - what R2 holds to light NIGHT alone with job 3;\n   - what job 2 leaves in R1 for room B, with room B reading -250.\n2. There are 4 tests, one for each answer.",
  c1Hints: [
    "The idea: R1 says which job. R2 gives the job's word. The result comes back in R1.",
    "A common mistake: giving job 3 the number 1, the bit's position, instead of the word with that bit set. NIGHT is bit 1, so R2 is the word with bit 1 set.",
    "A smaller example: the investigation's program shows 25 with `R2 <= 25`, `R1 <= 1`, `call system`.",
    "Part of the answer: job 2 reads the sensor that R2 names and leaves its reading in R1.",
    "The whole answer: 1, 4, 2 and -250.",
  ],
  failureExperiment:
    "The figure runs the same program with a handler that adds 4 to C2 before `resume`, as lesson 1's handler did for a fault.\n\nBreakpoints are on. You can pause on any line.",
  skippingLead: 'Predict what the display shows, then press "Run to the end".',
  skippingAfter:
    "The display showed 25 three times.\n\nEach `resume` went two lines past the call. `R2 <= R2 + 1` never ran, nor the `R1 <= 4` before the third call, which asked job 1 again.\n\nAfter the third call the run went past the program's end, onto a word that is not an instruction. It trapped with cause `21`, and the handler's `fault` line stopped the machine at `064`.\n\nA system call's return point is already the next line. Adding 4 skips a line of the program.",
  explanation:
    "The return point depends on the cause.\n\n| Cause | Return point |\n|---|---|\n| a fault, causes `11` to `34` | the instruction that faulted, so the handler can mend it or skip it |\n| a system call, cause `41` | the instruction after the call, because the job is done |\n\nSo a handler reads C3 first. It treats a system call differently from a fault. The handler saves the registers it writes, as lesson 2 showed. It leaves the job's result in R1. The figure runs the investigation's program in the debugger, with a breakpoint on the handler's first line.",
  servicesLead:
    '1. Press "Run to a breakpoint" and read C1, C2 and C3 at each pause.\n2. Step through the handler once, through the job that shows R2, to `resume`.',
  servicesAfter:
    "The program stops at `054`, after 44 instructions and 3 traps.\n\nThe display shows 26, the last word job 1 showed.",
  generalisation:
    "A system call looks like a function call. A number says which job. The job's words go in R2 to R4, and the result comes back in R1.\n\nIt differs in where the job runs. A call stays in the program's mode. A system call crosses into system mode at its trap's edge. It crosses back at `resume`'s edge.\n\nThe handler decides what each job may do. A user program reaches the shop's devices only through the jobs the handler offers.\n\nA job the handler does not offer does nothing: the investigation's handler puts R8 and R9 back and resumes.",
  sensorLead: "Write the job, step through it on the tests' programs, then run the tests.",
  c2Task:
    "1. The starting text's handler offers two jobs: job 1 shows R2, and job 4 ends the program. Add job 2, which reads a room's sensor. The room is in R2: 0 for room A, 1 for room B. The reading comes back in R1.\n2. The handler must still put R8 and R9 back before `resume`.\n3. There are 3 tests. Each adds a program after yours, named `program`. The program reads rooms with job 2 and shows words with job 1. Room A reads -184 and room B -250. Each test checks the words the display showed, in order, and that the run ends at a `stop`.",
  c2Hints: [
    "The idea: when R1 is 2, load the sensor R2 names into R1, then go to the handler's `back` line.",
    "A common mistake: adding 4 to C2. A system call already returns to the instruction after the call.",
    "A smaller example: job 1 is the one line `show: word[display] <= R2`, followed by the handler's `back` line.",
    "Part of the answer: add `R8 <= 2` and `if R1 == R8 goto sensor`, beside the lines that test for jobs 1 and 4.",
    "The whole answer: add these lines to the starting text, the first two after `if R1 == R8 goto end`, the rest before `end: stop`:\n\n```\n        R8 <= 2\n        if R1 == R8 goto sensor\nsensor: R1 <= word[sensorA]    // room A when R2 is 0\n        R8 <= 0\n        if R2 == R8 goto back\n        R1 <= word[sensorB]     // room B otherwise\n        goto back\n```",
  ],
  reflection:
    "A user program asks, and the handler answers at the edge after the program's `call system`. The shop's door does not ask. It opens when someone opens it, while whatever program runs. The handler cannot wait for a program to make a system call before it lights ALARM. How can the machine go to the handler when the door opens, between two instructions of a program that knows nothing of the door?",
  modelVsReality:
    "Real machines make system calls as this one does: one instruction, a number for the job, and the job's words in registers.\n\nReal handlers offer hundreds of jobs, chosen from a table by the number. This handler compares the number with each job in turn.\n\nThe numbers 1 to 4 and their jobs are this course's own.",
} as const;
