// Copyright © 2026 Christopher Snow

// The words of the lesson interrupts.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-12-traps/briefs, briefs 5A to 5C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    'Lesson 4 ended on a question. How can the machine go to the handler when the door opens, between two instructions of a program that knows nothing of the door?\n\nThe shop\'s rule: when the freezer\'s door opens, it must close again soon, or ALARM lights.\n\nThe figure runs lesson 4\'s handler with a user program that counts to 30, shows 30 and ends. The door opens while it counts.\n\nThe debugger shows a new panel, "The timer and the door". It shows the timer\'s count, whether "Timer reached 0" and "Door opened" are yes or no, and DOOR and WARM.',
  unseenLead: 'Press "Run to the end" and watch the panel "The timer and the door".',
  unseenAfter:
    'The program shows 30 and ends. The handler stops the machine at `054`, after 92 instructions.\n\nThe panel shows "Door opened: yes". Bit 1 of "waiting" is still set.\n\nNo line of the program or the handler read the door. The program cannot touch a device in user mode, and the handler runs only when the program traps.',
  motivation:
    "The machine can go to the handler without the program asking. At the edge that would run the next instruction, if a bit of \"waiting\" is set and C0's bit 1 is 1, the machine traps instead.\n\nA trap that an event outside the program makes, between two of its instructions, is an **interrupt**. C0's bit 1 says whether interrupts are on.\n\nThe cause says which event: `81` means the timer reached 0, and `82` means the door opened. If both bits are set, `81` goes first.\n\nThe interrupt's edge makes the five transfers every trap makes: C2, C1, C0, C3 and the PC. C0 takes `01`, so interrupts are off in the handler.\n\nThe instruction the PC names has not run. C2 takes its address, the return point, and `resume` runs that instruction.\n\nThe handler clears an event's bit by writing a 1 to it. Storing 1 to `waiting` clears the timer's bit, and storing 2 clears the door's. For the door, the handler writes `R8 <= 2`, then `word[waiting] <= R8`.\n\nThe handler start turns interrupts on for the program by writing 2 to C1 instead of 0: bit 1 on, bit 0 off, user mode. `resume` copies C1 to C0.\n\nInterrupts are taken in user mode and in system mode alike, whenever C0's bit 1 is 1.",
  prediction:
    'The figure lists a new handler. Its start writes 2 to C1. It has a part for the door, `door:`, and a part for the timer, `tick:`, which this lesson follows next.\n\nThe user program is the same. The door opens once 15 instructions have run. The interrupt comes while the program is in its loop, between `R2 <= R2 + 1` at `0AC` and `if R2 != R3 goto loop` at `0B0`.\n\nChoose an answer and press "Check my prediction".',
  p1Question: "Just after the door's interrupt, what does C2 hold?",
  p1Explain:
    "C2 holds `0B0`: the branch, the instruction that has not run yet.\n\n`0AC` ran before the interrupt, so going back to it would add 1 to R2 twice.\n\n`0B4` would skip the branch. `01C` is the handler's address, which the PC takes.\n\nAfter `resume`, the branch runs as if nothing had happened: the program never knows.",
  investigation:
    "The timeline runs the program with the new handler and the door opening once 15 instructions have run. It starts at edge 16.\n\nAfter each edge it says the mode and whether interrupts are on.",
  timelineLead:
    '1. Press "Next edge" to the door\'s interrupt, and read its five transfers.\n2. Press "Next edge" through the handler\'s door part to `resume`, and watch where the PC goes.\n3. Press "Next edge" on to the timer\'s interrupt, and through the timer\'s part.\n4. Press "Run to the end".',
  timelineAfter:
    "The door's interrupt came at edge 17, before the branch at `0B0`. The handler cleared the door's bit and set the timer to 20. `resume` took the program back to `0B0`. The timer's interrupt came at edge 47. DOOR was still 1, so the handler lit ALARM. The program showed 30 and ended. The run had 4 traps in all, 2 of them interrupts. The program ran every one of its lines, in order.",
  construction:
    'Whether the next edge takes an interrupt depends only on C0\'s bit 1 and the bits of "waiting". You can work it out without running anything.',
  answersLead: "Work out each answer, then run the tests.",
  c1Task:
    '1. For each case, give the cause the next edge traps with, in hexadecimal, or 0 if the next instruction runs. The instruction itself would not fault.\n   - C0 is `10` and "waiting" is `10`;\n   - C0 is `00` and "waiting" is `10`;\n   - C0 is `10` and "waiting" is `11`;\n   - C0 is `01` and "waiting" is `01`.\n2. There are 4 tests, one for each case.',
  c1Hints: [
    'The idea: the next edge traps only when C0\'s bit 1 is 1 and a bit of "waiting" is set.',
    "A common mistake: reading C0's bit 0. Bit 0 is the mode; interrupts are bit 1, the left digit.",
    'A smaller example: the door\'s interrupt in the timeline came with C0 at `10` and "waiting" at `10`, cause `82`.',
    "Part of the answer: when both events wait, the timer's `81` goes first.",
    "The whole answer: `82`, 0, `81` and 0.",
  ],
  failureExperiment:
    "The figure runs the same program with a handler whose door part does not clear the door's bit.\n\nThe door opens once 15 instructions have run.",
  noClearLead: 'Predict how the run ends, then press "Run to the end".',
  noClearAfter:
    "The debugger cut the run off after 5000 instructions. After the door's interrupt, all of them were the handler's, and 416 traps went to the handler. R2 stays at 4, and the display shows 0. Each `resume` returns to the same waiting bit, still set. Each visit sets the timer to 20 again, so the timer never reaches 0, and ALARM never lights. A handler must clear the event it answers.",
  explanation:
    "There are three ways into the handler.\n\n| What makes it | Its cause | Its return point |\n| --- | --- | --- |\n| A fault: the instruction the machine refuses | `11` to `34` | The instruction that faulted |\n| A system call: `call system` | `41` | The next instruction |\n| An interrupt: an event, with interrupts on | `81` or `82` | The instruction not yet run |\n\nAn interrupt comes between two instructions, never inside one. The instruction before it has finished. The one after it has not started. So the program's registers and memory are as the last edge left them, and `resume` carries on as if nothing had happened.\n\nThe handler must leave the program's registers as it found them, as lesson 2 showed. The handler in this figure saves R8 and R9, and puts them back.\n\nThe handler clears the bit of the event it answers. An event that waits while interrupts are off is not lost. Its bit stays set until the handler clears it.\n\nThe figure runs the program in the debugger, with a breakpoint on each event's part. It lets you choose when the door opens.",
  debuggerLead:
    '1. Choose when the door opens, with "When the door opens".\n2. Press "Run to a breakpoint". At each pause, read C2, C3 and the panel "The timer and the door".\n3. Press "Run to the end", then try another choice.',
  debuggerAfter:
    'If the door opens after 5, 15 or 50 instructions, the display shows 30, ALARM is on, 132 instructions run and 4 traps go to the handler. With "never", no interrupt comes. 101 instructions run and 2 traps go to the handler: the two `call system`. ALARM stays off.',
  generalisation:
    "An interrupt lets the machine answer an event at once, without the program checking for it. A program that checked the door itself would have to read it again and again, and a user program may not read it at all.\n\nThe handler start chooses whether the program may be interrupted, by C1's bit 1.\n\nEach event has its bit and its cause. The handler tells them apart by C3, as it tells a fault from a system call.\n\nThe timer is how a handler waits without stopping the program. It sets a count and answers when the count reaches 0.",
  timerLead:
    "Write the timer's part, step through it with the door at different times, then run the tests.",
  c2Task:
    "1. The starting text holds the whole handler, except the timer's part. That part only goes to `back`.\n2. Write the timer's part at `tick:`. It clears the timer's bit of \"waiting\". Then, if the door is still open (bit 0 of `signals`), it lights ALARM. If the door has closed, it leaves the lamps alone. Either way it ends by going to `back`.\n3. There are 4 tests. Each adds the counting program after yours, named `program`, and opens the door at its own time: left open; closed in time; never opened; opened late and left open. Each checks the lamps, that the display shows 30, and that the run ends at a `stop`.",
  c2Hints: [
    "The idea: read `signals` into R8, keep bit 0 with `&`, and compare it with 1.",
    "A common mistake: lighting ALARM at every timer interrupt. The door may have closed in time.",
    "A smaller example: the door's part clears its bit with `R8 <= 2` and `word[waiting] <= R8`. The timer's bit is bit 0, so the timer's part stores 1.",
    "Part of the answer: `R8 <= word[signals]`, `R9 <= 1`, `R8 <= R8 & R9`, then `if R8 != R9 goto back`.",
    "The whole answer:\n\n```\ntick:   R8 <= 1\n        word[waiting] <= R8     // the timer's event is seen\n        R8 <= word[signals]\n        R9 <= 1\n        R8 <= R8 & R9           // DOOR\n        if R8 != R9 goto back   // closed in time\n        word[lamps] <= R9       // still open: ALARM\n        goto back\n```",
  ],
  reflection:
    "Every trap's edge turns interrupts off, so a door that opens while the handler runs waits until `resume`. A handler that runs a long job keeps the door waiting for all that time. A handler can also fault, like any program. What happens if a trap comes while the handler runs?",
  modelVsReality:
    "Real machines take interrupts between instructions, as this one does, from many devices: disks, networks, keyboards, timers. Many give each device a number and a table of handler addresses, and let some devices interrupt others. A real timer counts time, not instructions. This machine's timer counts instructions, so every run with the same door is the same.",
} as const;
