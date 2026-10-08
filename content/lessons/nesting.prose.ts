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
  lateLead: 'Press "Run to the end" and watch the panel "The timer and the door".',
  lateAfter:
    "The door opened after 60 instructions. Its interrupt came after 167, when the wait's `resume` turned interrupts back on. That is 107 instructions late.\n\nThe timer's interrupt, which lit ALARM, came after 198 instructions: far more than 20 after the door opened.\n\nThe shop's rule held only because the program ran on after the wait. A program that ended at once would never have lit ALARM.",
  motivation:
    "A handler can let interrupts in. It writes 3, `11`, to C0. Then a trap can come while the handler runs: an interrupt, or a fault in the handler's own lines.\n\nThat trap is like any other. Its edge writes C2, C1, C0 and C3, and the PC takes C4, the handler's address. The handler starts again from its first line.\n\nC2 held the program's return point, and C1 the program's status. The second trap writes over them both. Unless the handler kept them first, the way back to the program is lost.\n\nSo a handler that lets interrupts in first copies C1 and C2 to two words of the RAM. Before it resumes, it turns interrupts off again and writes C1 and C2 back.\n\nA fault in the handler is the same loss, and nothing keeps C1 and C2 first. A handler must not fault.",
  prediction:
    "The figure lists a smaller handler and a user program that asks job 2 for room 5. There is no room 5.\n\nJob 2 works out the sensor's address from R2: `7D8` plus 8 times R2. Its load at `048` reads that address. For room 5 the address is `800`, where there is no memory, so the load faults with cause `31`.\n\nThe handler's fault part skips what faulted, as the fault part in lesson 1 did.\n\nChoose an answer and press \"Check my prediction\".",
  p1Question: "Just after the handler's load at `048` faults, what does C2 hold?",
  p1Explain:
    "C2 holds `048`: the handler's own load, the instruction that faulted.\n\n`074`, the program's return point after its `call system`, was in C2 until this trap wrote over it.\n\nC1 also takes `01`, so the program's user mode is lost.\n\nThe next figure follows the run on from here.",
  investigation:
    "The timeline shows the run from edge 10, the program's `call system` at `070`, to edge 40. After each edge it says the mode. Two traps come in this run. The second one happens inside the handler.",
  timelineLead:
    '1. Press "Next edge" to the second trap, the load at `048`, and read its five transfers.\n2. Press "Next edge" through the fault part until `resume`, and watch where the PC goes and in which mode.\n3. Press "Run to the end" and read the last edges.',
  timelineAfter:
    "The load's trap wrote `048` over the program's return point, `074`, and `01` over its status, `00`. The handler saved R8 and R9 over the program's words at `400` and `408`. Then `resume` went to `04C` in system mode. The handler goes round its last four lines for ever: `goto back`, the two loads and `resume`. The program's return point, its mode, and its R8 and R9 are lost.",
  construction:
    "The listing is the handler from the first figure of this lesson, with job 5 changed. It keeps C1 at `410` and C2 at `418`, writes 3 (`11`) to C0, waits, writes 1 (`01`) to C0, and writes C1 and C2 back before `resume`. The door opens during the wait.",
  savedListingLead: "The handler and the user program, as the assembler lists them.",
  answersLead: "Work out each answer from the listing, then run the tests.",
  c1Task:
    "1. The user program's `call system` at `108` asks for job 5. While the loop runs, the door's interrupt comes before `R2 <= R2 - 1` at `088`. Give, in hexadecimal:\n   - what C1 holds just after the door's interrupt;\n   - what C3 holds just after it;\n   - the word at `418` just after it;\n   - what C0 holds after the door part's `resume`.\n2. C1 and C0 as two digits, C3 as two, the word as three. There are 4 tests, one for each answer.",
  c1Hints: [
    "The idea: the interrupt's edge copies C0 into C1, and C0 in the loop is what job 5 wrote.",
    "A common mistake: giving C1 as `10`. `10` is the user program's status. C1 takes C0 as it is when the interrupt comes, and the handler is running.",
    "A smaller example: in the timeline, the load's trap in the handler gave C1 `01`, which was the handler's C0 at that moment.",
    "Part of the answer: the word at `418` holds what C2 held when job 5 began. That is the return point of the `call system` at `108`.",
    "The whole answer, in the order the question asks: `11`, `82`, `10C` and `11`.",
  ],
  failureExperiment:
    "The figure's job 5 turns interrupts on for its loop, but it does not keep C1 and C2. The door opens once 60 instructions have run, during the wait.",
  unsavedLead: 'Predict how the run ends, then press "Run to the end".',
  unsavedAfter:
    "The door and the timer came in during the wait, and ALARM lit on time. Each wrote `078` into C2. The wait's `resume` went back into the loop, in system mode, with R2 at 0. The debugger cut the run off after 5000 instructions, and the display shows 5. Letting interrupts in without keeping C1 and C2 loses the program.",
  explanation:
    "A trap inside the handler writes C1, C2 and C3, as any trap does. The handler keeps what it still needs from them first.\n\nA handler that lets interrupts in takes four steps:\n\n- keeps C1 and C2 in two RAM words of its own;\n- writes 3 to C0;\n- writes 1 to C0 when it is done, so nothing can come in while it puts C1 and C2 back;\n- writes C1 and C2 back, then runs `resume`.\n\nThe handler saves R8 and R9 at its start, at `400` and `408`. A trap inside the handler saves them again. So job 5 puts the program's R8 and R9 back before it lets interrupts in. After that it uses only R1 and R2, which the calling convention lets a job change.\n\nA fault in the handler has no fix of this kind. The handler must check what a program gives it, such as a room number, before it uses it.\n\nThe figure runs job 5 as it should be. It shows the words at `410` and `418`.",
  savedLead:
    '1. Choose when the door opens, with "When the door opens".\n2. Press "Run to a breakpoint". At each pause, read C1, C2 and the words at `410` and `418`.\n3. Press "Run to the end", then try another choice.',
  savedAfter:
    "The door opened after 60 instructions, and its interrupt came after 61, in the wait. The timer's interrupt came after 90, and ALARM lit. The program showed 5 and 6 and ended. The run took 242 instructions and 6 traps. The word at `418` holds `10C`, the return point the wait kept.",
  generalisation:
    "A trap inside the handler is safe only if the handler has kept, before it lets that trap in, everything the trap writes over and the handler still needs. That means C1, C2 and any saved registers.\n\nInterrupts off is the default in the handler because it is safe. An event that comes in while they are off waits, and its bit stays set until a program clears it.\n\nA long job that leaves interrupts off makes every event wait as long as the job. Letting interrupts in costs the handler the saving.\n\nNo handler line may fault. The handler checks what a user program gives it before it uses that value.",
  waitLead: "Change job 5, step through it with the door at different times, then run the tests.",
  c2Task:
    "1. The starting text holds the whole handler. Its job 5 waits R2 rounds with interrupts off.\n2. Change job 5 so that the door and the timer can come in while it waits, and the program goes on after the wait as before.\n3. There are 4 tests. Each adds a user program after yours, named `program`, and opens the door at its own time or not at all. One program ends straight after its wait. Each test checks the words the display showed, the lamps, and that the run ends at a `stop`.",
  c2Hints: [
    "The idea: keep C1 and C2 in the RAM, write 3 to C0, loop, write 1 to C0, write C1 and C2 back, then `resume`.",
    "A common mistake: writing 3 to C0 and nothing else. The door's interrupt writes over C2, and the wait's `resume` goes back into its own loop.",
    "A smaller example: lesson 2's handler saved R5 with `word[0x408] <= R5` before it changed R5. C2 is kept the same way, through a register: `R1 <= C2`, then `word[0x418] <= R1`.",
    "Part of the answer: put the program's R8 and R9 back from `400` and `408` first, since a trap in the loop saves them there again, and count with R1 and R2 only.",
    "The whole answer: job 5, from `wait:` to its `resume`.\n\n```\nwait:   R8 <= word[0x400]       // the program's R8 and R9 back now:\n        R9 <= word[0x408]       // a trap in the loop saves them again\n        R1 <= C1\n        word[0x410] <= R1       // save C1\n        R1 <= C2\n        word[0x418] <= R1       // save C2\n        R1 <= 3\n        C0 <= R1                // system mode, interrupts on\n        R1 <= 0\npause:  R2 <= R2 - 1\n        if R2 != R1 goto pause\n        R1 <= 1\n        C0 <= R1                // interrupts off again\n        R1 <= word[0x410]\n        C1 <= R1                // C1 and C2 back\n        R1 <= word[0x418]\n        C2 <= R1\n        resume\n```",
  ],
  reflection:
    "Every trap in this module makes the same five transfers at one edge. `resume` makes two.\n\nLessons 1 to 6 used those transfers from a program. The machine of several edges that Module 9 built has no part that makes them yet.\n\nWhich parts of the machine copy C0 into C1, take the cause into C3, and send the PC to C4, all at one edge?",
  modelVsReality:
    "Real machines let a handler be interrupted in the same way: they keep what the second trap writes over, then let it in.\n\nMany push the return point and status on a stack kept for the handler, so a trap inside a trap inside a trap still finds its way back.\n\nMany also let urgent events in while less urgent ones wait. This machine has one level: on or off.",
} as const;
