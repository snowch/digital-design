// Copyright © 2026 Christopher Snow

// The words of the lesson nesting.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-12-traps/briefs, briefs 6A to 6C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 5 ended on a question: what happens if a trap comes while the handler runs? Every trap's edge sets C0 to `01`, so interrupts are off while the handler runs.\n\nThis figure's handler offers a job that takes a long time. Job 5 waits R2 rounds of a loop before it resumes the program. The user program shows 5, waits 60 rounds, shows 6 and ends. The door opens once 60 instructions have run, while the handler waits.",
  lateLead:
    '1. Press "Run to a breakpoint". The run pauses when the door\'s interrupt reaches the handler\'s door part. Read how many instructions the status line says ran, and the panel "The timer and the door".\n2. Press "Run to the end".',
  lateAfter:
    "The door opened after 60 instructions. Its interrupt came after 167, when the wait's `resume` turned interrupts back on. That is 107 instructions late.\n\nThe timer's interrupt, which lit ALARM, came after 198 instructions: far more than 20 after the door opened.\n\nThe shop's rule held only because the program ran on after the wait. A program that ended at once would never have lit ALARM.",
  motivation:
    "A handler can let interrupts in. It does this by writing 3, `11`, to C0. Then an interrupt can come while the handler runs.\n\nA fault in the handler's own lines is a trap too. It can come whether interrupts are on or off.\n\nA trap inside the handler is like any other trap. Its edge writes C2, C1, C0 and C3. The PC takes C4, the handler's address, so the handler starts again from its first line.\n\nC2 holds the program's return point, and C1 holds the program's status. A trap inside the handler writes over both. Unless the handler saved them first, the way back to the program is lost.",
  prediction:
    "The figure lists a smaller handler and a user program that asks job 2 for room 5. There is no room 5.\n\nJob 2 works out the sensor's address from R2: `7D8` plus 8 times R2. Its load at `048` reads that address. For room 5 the address is `800`, where there is no memory, so the load faults with cause `31`.\n\nThe handler's fault part skips what faulted, as the fault part in lesson 1 did.\n\nChoose an answer and press \"Check my prediction\".",
  p1Question: "Just after the handler's load at `048` faults, what does C2 hold?",
  p1Explain:
    "C2 holds `048`: the handler's own load, the instruction that faulted.\n\n`07C`, the program's return point after its `call system`, was in C2 until this trap wrote over it.\n\nC1 also takes `01`, so the program's user mode is lost.\n\nThe next figure follows the run on from here.",
  investigation:
    "The timeline shows the run from edge 12, the program's `call system` at `078`, to edge 42. After each edge it says the mode. Two traps come in this run. The second one happens inside the handler.",
  timelineLead:
    '1. Press "Next edge" to the second trap, the load at `048`, and read its five transfers.\n2. Press "Next edge" through the fault part until `resume`, and watch where the PC goes and in which mode.\n3. Press "Run to the end" and read the last edges.',
  timelineAfter:
    "The load's trap wrote `048` over the program's return point, `07C`, and `01` over its status, `00`. The program had put 88 in R8 and 99 in R9. The handler's first save put them at `400` and `408`. The second trap's save wrote the handler's own words, 40 and 65, over them.\n\nThen `resume` went to `04C` in system mode. From there the handler goes round four of its lines for ever: `goto back` at `04C`, the two loads at `05C` and `060`, and `resume` at `064`.\n\nThe program's return point, its mode, and its R8 and R9 are lost.",
  construction:
    "The listing is the handler from the first figure, with job 5 changed. Job 5 saves C1 at `410` and C2 at `418`. It writes 3 (`11`) to C0, waits, writes 1 (`01`) to C0, and puts C1 and C2 back before `resume`. The door opens during the wait.",
  savedListingLead: "The handler and the user program, as the assembler lists them.",
  answersLead: "Work out each answer from the listing, then run the tests.",
  c1Task:
    "1. The user program's `call system` at `108` asks for job 5. While the loop runs, the door's interrupt comes before `R2 <= R2 - 1` at `088`. Give:\n   - what C1 holds just after the door's interrupt, as its two bits;\n   - what C3 holds just after it, as two hexadecimal digits;\n   - the word at `418` just after it, as three hexadecimal digits;\n   - what C0 holds after the door part's `resume`, as its two bits.\n2. C1 and C0 are written as the pages write them, bit 1 first, such as `01`.\n3. There are 4 tests, one for each answer.",
  c1Hints: [
    "The idea: the interrupt's edge copies C0 into C1, and C0 in the loop is what job 5 wrote.",
    "A common mistake: giving C1 as `10`. `10` is the user program's status. C1 takes C0 as it is when the interrupt comes, and the handler is running.",
    "A smaller example: in the timeline, the load's trap in the handler gave C1 `01`, which was the handler's C0 at that moment.",
    "Part of the answer: the word at `418` holds what C2 held when job 5 began. That is the return point of the `call system` at `108`.",
    "The whole answer, in the order the question asks: `11`, `82`, `10C` and `11`.",
  ],
  failureExperiment:
    "The figure's job 5 turns interrupts on for its loop, but it does not save C1 and C2. The door opens once 60 instructions have run, during the wait.",
  unsavedLead: 'Predict how the run ends, then press "Run to the end".',
  unsavedAfter:
    "The door and the timer came in during the wait, and ALARM lit on time. Each wrote `078` into C2. The wait's `resume` went back into the loop, in system mode, with R2 at 0. The debugger cut the run off after 5000 instructions, and the display shows 5. Letting interrupts in without saving C1 and C2 loses the program.",
  explanation:
    "A handler that lets interrupts in takes four steps:\n\n- saves C1 and C2 in two RAM words of its own;\n- writes 3 to C0;\n- writes 1 to C0 when it is done, so nothing can come in while it puts C1 and C2 back;\n- puts C1 and C2 back, then runs `resume`.\n\nThe handler saves R8 and R9 at its start, at `400` and `408`. A trap inside the handler saves them there again. So job 5 puts the program's R8 and R9 back before it lets interrupts in. After that it uses only R1 and R2, the call's own registers, which lesson 4 said a system call may change.\n\nA fault in the handler has no fix of this kind. The handler must check what a program gives it, such as a room number, before it uses it.\n\nAn event that comes in while interrupts are off is not lost. Its bit in \"waiting\" stays set, as lesson 5 showed, until the handler clears it.\n\nThe figure runs job 5 as it should be. It shows the words at `410` and `418`, and lets you choose when the door opens.",
  savedLead:
    '1. Choose when the door opens, with "When the door opens".\n2. Press "Run to a breakpoint". At each pause, read C1, C2 and the words at `410` and `418`.\n3. When the button reads "Run to the end", press it. Then try another choice.',
  savedAfter:
    "Whatever the choice, the program shows 5, then 6, and the handler's `stop` for job 4 ends the run. The word at `418` holds `10C`, the return point job 5 saved. The word at `410` holds 2: C1's two bits, `10`, read as a number.\n\nWith the door after 60 instructions, the door's interrupt comes after 61, in the wait. The timer's interrupt comes after 90 and lights ALARM. With the door after 30, the door's interrupt comes after 50 and the timer's after 79. With the door after 5, the door's interrupt comes after 7, before the wait.\n\nWhenever the door opens, ALARM lights, and the run takes 242 instructions and 6 traps. With \"never\", it takes 211 instructions and 4 traps, and ALARM stays off.",
  generalisation:
    "A trap inside the handler is safe only if the handler has saved, before it lets that trap in, everything the trap writes over and the handler still needs. That means C1, C2 and any saved registers.\n\nInterrupts off is the default in the handler because it is safe.\n\nA long job that leaves interrupts off makes every event wait as long as the job. Letting interrupts in costs the handler the saving.",
  waitLead: "Change job 6, step through it with the door at different times, then run the tests.",
  c2Task:
    "1. The starting text holds the whole handler. It offers job 1, job 4 and a job of its own, job 6: job 6 shows R2 on the display, then R2 minus 1, and so on down to 1. It counts with interrupts off.\n2. Change job 6 so that the door and the timer can come in while it counts, and the program goes on after it as before.\n3. A system call may change only R1 and R2. Job 6 must leave every other register as the program left it, and give the program back its mode.\n4. There are 4 tests. Each adds a user program after yours, named `program`. Each puts its own words in R0 and R3 to R15, asks job 6 to count down from 20 or 30, copies R8 and R9 into R12 and R13, and ends with job 4. Two also show 5 before the count and 6 after it. Each test opens the door at its own time, or not at all.\n5. Each test checks the words the display showed, in order; the lamps; C1 at the end, the program's status at its last trap, which must be `10`; R0 and R3 to R15 at the end, with R12 and R13 holding what R8 and R9 held; and that the run ends at the handler's `stop` for job 4.",
  c2Hints: [
    "The idea: job 6 takes the explanation's four steps: save C1 and C2, write 3 to C0, count, write 1 to C0, put C1 and C2 back, then `resume`.",
    "A common mistake: writing 3 to C0 and nothing else. The door's interrupt writes over C1 and C2, and the program goes on in system mode, or never comes back.",
    "A smaller example: a handler that needs C3 after a trap can save C3 the way it saves a register, through an R register that it has saved first: `R1 <= C3`, then `word[0x420] <= R1`. It puts C3 back with `R1 <= word[0x420]`, then `C3 <= R1`.",
    "Part of the answer: put the program's R8 and R9 back from `400` and `408` first, since a trap in the count saves them there again, and count with R1 and R2 only.",
    "The whole answer: job 6, from `count:` to its `resume`, is this:\n\n```\ncount:  R8 <= word[0x400]       // the program's R8 and R9 back now:\n        R9 <= word[0x408]       // a trap in the count saves them again\n        R1 <= C1\n        word[0x410] <= R1       // save C1\n        R1 <= C2\n        word[0x418] <= R1       // save C2\n        R1 <= 3\n        C0 <= R1                // system mode, interrupts on\n        R1 <= 0\nnext:   word[display] <= R2     // show the count\n        R2 <= R2 - 1\n        if R2 != R1 goto next\n        R1 <= 1\n        C0 <= R1                // interrupts off again\n        R1 <= word[0x410]\n        C1 <= R1                // C1 and C2 put back\n        R1 <= word[0x418]\n        C2 <= R1\n        resume\n```",
  ],
  reflection:
    "Every trap in this module makes the same five transfers at one edge. `resume` makes two.\n\nLessons 1 to 6 used those transfers from a program. The machine of several edges that Module 9 built has no part that makes them yet.\n\nWhich parts of the machine copy C0 into C1, take the cause into C3, and send the PC to C4, all at one edge?",
  modelVsReality:
    "Real machines let a handler be interrupted in the same way: they save what the second trap writes over, then let it in.\n\nMany push the return point and status on a stack kept for the handler, so a trap inside a trap inside a trap still finds its way back.\n\nMany also let urgent events in while less urgent ones wait. This machine has one level: on or off.",
} as const;
