// Copyright © 2026 Christopher Snow

// The words of the lesson user-mode.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-12-traps/briefs, briefs 3A to 3C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 2 ended on a question: how could the machine keep a faulty program away from the shop's devices, and away from the handler?\n\nThe figure's program lights ALARM, as the shop's own work would when a room is too warm. Then it means to clear the display. Its address is one word too far on: it reaches the lamps.\n\nEvery program so far could store to any device, and write C4 too.",
  systemLead: 'Press "Run to the end" and watch the lamps.',
  systemAfter:
    "ALARM goes off at `014`, and the program stops at `018`. The machine refused nothing.\n\nA store to the lamps is allowed, so nothing traps and no handler runs.\n\nA shop that relies on ALARM cannot let any program switch it off.",
  motivation:
    "C0's bit 0 sets the mode. When it is 1, the machine runs every instruction, as every program so far has run. That is **system mode**.\n\nWhen bit 0 is 0, the machine refuses some instructions. That is **user mode**. In user mode, these instructions fault with the cause shown:\n\n- `resume`, the two control-register jobs, and `stop`: cause `22`;\n- every load or store at a device's address, `7C0` and up: cause `32`.\n\nEvery other instruction runs as before, in the ROM and the RAM.\n\nA trap's edge sets C0 to `01`, so the handler always runs in system mode. C1 keeps the mode the program was in.\n\nThe handler starts a program in user mode with lesson 1's `resume`. It writes 0 to C1 and the program's address to C2, the return point, then runs `resume`. C0 takes C1, and the PC takes C2.\n\nA user program cannot change C0 back: the line that would do it, `C0 <= R1`, is refused.",
  prediction:
    "The figure lists the handler's start and the same faulty program, now named `program`.\n\nThe handler lights ALARM, writes 0 to C1 and `program`'s address to C2, and runs `resume`.\n\nIts handler keeps the cause at `400` and the return point at `408`, then stops.\n\nChoose an answer and press \"Check my prediction\".",
  p1Question: "Just after the store to the lamps traps, what does C1 hold?",
  p1Explain:
    "C1 holds `00`: C0 as it was when the store faulted. Its mode bit was 0, so the program ran in user mode.\n\nIn lesson 1, C1 always took `01`, because every program ran in system mode.\n\nC0 takes `01` at the trap's edge, so the handler runs in system mode.",
  investigation:
    "The timeline runs the handler's start and the program. It starts at the edge before `C1 <= R1` is written.\n\nAfter each edge, it says the mode the machine is in.",
  timelineLead:
    '1. Press "Next edge" until the last edge shown is `resume`\'s edge. Read the mode after it.\n2. Press "Next edge" through the program\'s lines until the store to the lamps traps. Watch which five registers change at that edge.\n3. Press "Run to the end" to show the rest.',
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
    "The handler counts the night's traps in the word at `410`. After each trap, it shows the count.\n\nThe program keeps its own total in the RAM too, at `410`, an address the handler also uses.\n\nThe figure shows the word at `410`, and C0 and C1 in words.",
  ramLead: 'Predict what the display shows, then press "Run to the end".',
  ramAfter:
    "The display shows 8, not 1.\n\nThe program's store to `410` ran in user mode: the RAM is not protected. It wrote 7 over the handler's count.\n\nThe program's `stop` trapped with cause `22`, and the handler added 1 to the 7.\n\nThe machine protects its devices and its control registers. It does not protect the RAM.",
  explanation:
    "In user mode the machine refuses whatever would let a program reach outside itself. That covers the shop's devices, the control registers, `resume` and `stop`. Without `resume` or a control-register job, a user program cannot set C0 back to system mode, or change C4. Without `stop`, a user program cannot stop the machine. Its `stop` traps, and the handler decides what happens next. The handler is the only way back to system mode. A trap's edge sets C0 to `01`. The handler runs in system mode, and `resume` gives the program back the mode C1 holds. The figure shows the memory map as user mode meets it.",
  mapLead: "Compare each part with the map Module 8 drew for system mode.",
  generalisation:
    "The rule has two parts. The machine checks the mode at every instruction. Only a trap can enter system mode.\n\nSo a program the shop did not write can run in user mode. It cannot switch ALARM off, change the handler, or stop the machine.\n\nThe protection covers the devices and the control registers. It does not cover the RAM. A user program can change any word there, the handler's own words included.\n\nThe ROM is safe in both modes, since no store reaches it.",
  userLead:
    "Write the handler's start, step through it on the tests' programs, then run the tests.",
  c2Task:
    "1. The starting text sets C4 and goes to `program` in system mode. Its handler only stops.\n2. Change it so that `program` runs in user mode.\n3. When the program traps, the handler keeps the cause, C3, in the word at `0x400`, then stops.\n4. There are 4 tests. Each adds a program after yours, named `program`, which does one thing user mode refuses. Each test checks these: C1 after the trap; the word at `0x400`; that 1 trap went to the handler; that the run ends at a `stop`.",
  c2Hints: [
    "The idea: write 0 to C1 and `program`'s address to C2, then run `resume`.",
    "A common mistake: `goto program`. The program then runs in system mode, and nothing it does traps.",
    "A smaller example: the investigation's handler start writes C1 and C2 with `R1 <= 0`, `C1 <= R1`, `R1 <= program`, `C2 <= R1`, then runs `resume`.",
    "Part of the answer: the handler's first two lines are `R5 <= C3` and `word[0x400] <= R5`.",
    "The whole answer:\n\n```\n        R1 <= handler\n        C4 <= R1\n        R1 <= 0\n        C1 <= R1\n        R1 <= program\n        C2 <= R1\n        resume\nhandler: R5 <= C3\n        word[0x400] <= R5\n        stop\n```",
  ],
  reflection:
    "A user program cannot touch the display, the lamps or the sensors. But the shop's programs are written to show readings and light lamps. So how can a user program show a reading, if it may not touch the display?",
  modelVsReality:
    "Real machines have a mode bit, as this one does. Some have more than two levels. Real machines also protect parts of memory from user programs. They use hardware that checks every address against a table the handler keeps. This machine protects only its devices. On this machine a user program can still overwrite the handler's words in the RAM.",
} as const;
