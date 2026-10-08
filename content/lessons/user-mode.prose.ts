// Copyright © 2026 Christopher Snow

// The words of the lesson user-mode.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-12-traps/briefs, briefs 3A to 3C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 2 ended with a question: how could the machine keep a faulty program away from the shop's devices, and away from the handler?\n\nThis program lights ALARM, as the shop's own work would when a room is too warm. Then it means to clear the display. The store's address is one word too far on, so it reaches the lamps.\n\nEvery program so far could store to the display and the lamps, and could write C4.",
  systemLead: 'Press "Step" seven times, and read the lamps after each step.',
  systemAfter:
    "ALARM goes off at `014`, and the program stops at `018`. The machine refused nothing.\n\nA store to the lamps is allowed, so nothing traps and no handler runs.\n\nA shop that relies on ALARM cannot let any program switch it off.",
  motivation:
    "Bit 0 of C0 sets the mode.\n\nWhen bit 0 is 1, the machine refuses only what Module 8's machine refused. That is **system mode**. Every program so far ran in it.\n\nWhen bit 0 is 0, the machine refuses more. That is **user mode**. In user mode these instructions fault, with these causes:\n\n- every line that reads or writes a control register, `resume`, and `stop`: cause `22`;\n- every load or store at a device's address, `7C0` to `7F7`: cause `32`.\n\nEvery other instruction runs as before. That includes its accesses to the ROM and the RAM.\n\nA trap's edge sets C0 to `01`, so the handler always runs in system mode. C1 takes C0 at that edge, so C1 holds the mode the program was in.\n\nThe start is the lines from reset at `000` that set C4 and start the program. For user mode, it writes `00` to C1 and the program's address to C2, the return point, then runs `resume` from lesson 1. At `resume`'s edge, C0 takes C1 and the PC takes C2.",
  prediction:
    'The listing gives a start that writes `00` to C1, as a start for user mode does. Then it goes to `program` with `goto program`, not `resume`. The program stores to room B\'s sensor, which the machine refuses. The handler saves the cause at `400`, then stops.\n\nChoose an answer and press "Check my prediction".',
  p1Question: "Just after the store to the lamps traps, what does C1 hold?",
  p1Explain:
    "C1 holds `01` just after the store traps. That is C0 as it was when the store faulted.\n\n`goto` changes only the PC, so C0 was still `01`, and the program ran in system mode. The `00` the start wrote to C1 was never used: the trap's edge wrote over it.\n\nThe cause is `34`, a store to a read-only device, not `32`. In system mode the store is refused because the sensor is read only, not because of the mode.\n\nA start reaches user mode only through `resume`, which copies C1 into C0.",
  investigation:
    "The timeline runs a start that does use `resume`. Its program is the same lamps program as the first figure, now named `program`. The timeline begins at the edge before the start writes C1. After each edge, it says which mode the machine is in.",
  timelineLead:
    '1. Press "Next edge" until the last edge shown is `resume`\'s edge. Read the mode after that edge.\n2. Press "Next edge" through the program\'s lines until the store to the lamps traps. Watch which five registers are written at that edge.\n3. Press "Run to the end" to show the rest.',
  timelineAfter:
    "`resume` sets C0 to `00` and the PC to `038`, so the program runs in user mode. The store at `044` traps with cause `32`, and C1 keeps `00`. The handler runs in system mode. It keeps the cause at `400` and the return point at `408`. It ends with `stop` at `034`. ALARM is still on.",
  construction:
    "You can tell what user mode does with a line from its address and its job alone, without running it.",
  answersLead: "Work out each answer, then run the tests.",
  c1Task:
    "1. A program runs in user mode. For each line, give the cause it traps with, in hexadecimal, or 0 if user mode runs it:\n   - `R2 <= word[sensorA]`;\n   - `word[0x400] <= R2`;\n   - `stop`;\n   - `R3 <= word[timer]`.\n2. There are 4 tests, one for each line.",
  c1Hints: [
    "The idea: user mode refuses a load or a store at a device's address, with cause `32`. It also refuses `resume`, the control-register jobs and `stop`, with cause `22`.",
    "A common mistake is to think a load is allowed. User mode refuses a device's address for loads as well as for stores.",
    "A smaller example: look at the store at `044` in the timeline. It writes to the lamps, at `7C8`, and traps with cause `32`.",
    "Part of the answer: `400` is in the RAM. User mode reaches the RAM as system mode does.",
    "The whole answer, in the order of the lines: `32`, 0, `22` and `32`.",
  ],
  failureExperiment:
    "The handler counts the night's traps in the word at `410`. After each trap, it shows the count.\n\nThe program keeps its own total in the RAM too, at `410`, an address the handler also uses.\n\nThe figure shows the word at `410`, and the modes C0 and C1 hold, by name.",
  ramLead: 'Predict what the display shows, then press "Run to the end".',
  ramAfter:
    "The display shows 8, not 1.\n\nThe program's store to `410` ran in user mode: the RAM is not protected. It wrote 7 over the handler's count.\n\nThe program's `stop` trapped with cause `22`, and the handler added 1 to the 7.\n\nThe machine protects its devices and its control registers. It does not protect the RAM.",
  explanation:
    "In user mode the machine refuses whatever reaches the shop's devices, the control registers, `resume` and `stop`. It does not refuse the RAM: the last figure's program wrote the handler's count.\n\nWithout `resume`, or a line that reads or writes a control register, a user program cannot set C0 back to system mode or change C4. The line that would set C0, `C0 <= R1`, traps with cause `22`.\n\nA user program cannot stop the machine: its `stop` traps instead, and the handler decides what happens next.\n\n`resume` gives the program back the mode C1 holds.\n\nThe figure shows the memory map as user mode meets it.",
  mapLead:
    "Compare each part of the map with the list of what user mode refuses in the motivation above.",
  generalisation:
    "The rule has two parts. The machine checks the mode at every instruction. Only a trap can enter system mode.\n\nSo a program the shop did not write can run in user mode. It cannot switch ALARM off, change the handler, or stop the machine.\n\nThe protection covers the devices and the control registers.\n\nThe ROM is safe in both modes, since no store reaches it.",
  userLead:
    "Write the start and the handler, step through them on the tests' programs, then run the tests.",
  c2Task:
    "1. The starting text's start sets C4, sets the count in the word at `400` to 0, and goes to `program` with `goto`. Its handler only runs `stop`.\n2. Change the start so that `program` runs in user mode.\n3. Write the handler. On cause `32`, which means a device's address was refused, it adds 1 to the count at `400` and skips the instruction. On any other cause, it saves the cause in the word at `408`, then runs `stop`.\n4. The count is `word[0x400]`, and the saved cause is `word[0x408]`, as you type them.\n5. There are 4 tests. Each adds a program after yours, named `program`, which reaches a device or does something else that user mode or the machine refuses.\n6. Each test checks C1 at the end of the run, which holds the program's mode at its last trap. It checks the count at `400`, the saved cause at `408`, the causes in order, and that the run ends at the handler's `stop`.",
  c2Hints: [
    "The idea: a start reaches user mode only with `resume`, after it writes C1 and C2. The handler reads C3 first and compares it with `0x32`.",
    "A common mistake: `goto program`. The program then runs in system mode, as the prediction above showed, and a device's address does not trap.",
    "A smaller example: a start that runs a line named `later` in system mode writes `01` to C1 and `later`'s address to C2, then runs `resume`.",
    "Part of the answer: lesson 1's challenge counted and skipped one cause, and stopped on the others. This handler does the same for cause `32`. It saves the other cause at `408` before its `stop`.",
    "The whole answer:\n\n```\n        R1 <= handler\n        C4 <= R1\n        R1 <= 0\n        word[0x400] <= R1       // the count of device accesses refused\n        C1 <= R1                // user mode, for the program resume starts\n        R1 <= program\n        C2 <= R1\n        resume\nhandler: R5 <= C3\n        R6 <= 0x32\n        if R5 != R6 goto other\n        R5 <= word[0x400]\n        R5 <= R5 + 1\n        word[0x400] <= R5\n        R5 <= C2\n        R5 <= R5 + 4\n        C2 <= R5\n        resume\nother:  word[0x408] <= R5       // save the cause\n        stop\n```",
  ],
  reflection:
    "A user program cannot touch the display, the lamps or the sensors. But the shop's programs are written to show readings and light lamps. So how can a user program show a reading, if it may not touch the display?",
  modelVsReality:
    "Real machines have a mode bit, as this one does. Some have more than two levels. Real machines also protect parts of memory from user programs. They use hardware that checks every address against a table the handler keeps. This machine protects only its devices' addresses.",
} as const;
