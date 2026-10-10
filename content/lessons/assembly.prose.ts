// Copyright © 2026 Christopher Snow

// The words of the lesson assembly.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-11-programming/briefs, briefs 1A to 1C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 10.5 ended on this: writing a program word by word is slow, and wrong digits are easy to make. Every instruction shown since Module 8 was also written as a line of text, such as `R2 <= word[sensorA]`. Could you write a program using those lines and let a tool turn them into words the machine runs?",
  listingLead:
    "The figure shows the colder-room program from Module 8: each line of text beside its address and the word the machine runs. The table lists the one name the program defines, `show:`, at address `010`.",
  motivation:
    "A program written as lines of text is **assembly**: one line for each instruction, written as the transfer it makes. An **assembler** is a program that turns those lines into the words the machine runs.\n\nThe assembler places the first instruction at address `000` and each next one 4 bytes on. A name followed by a colon names a line's address: `show:` in the colder-room program names `010`. A branch can say `goto show`, and the assembler works out the constant that reaches it. You never count instructions by hand.\n\nThe assembler also refuses a line it cannot turn into an instruction and says why, with the line's number. The table the assembler makes is the listing: each line beside its address and the word it becomes. A figure can show the listing with its words left out.",
  prediction:
    "The figure shows a new program: room A's reading against its limit of -180 (-18.0 degrees). It reads room A's sensor into R2 and puts -180 in R3. If R2 < R3 signed, the branch at `008` goes to `fine`, showing R2 on the display. Otherwise, ALARM turns on (R4 ← 1, stored to lamps), then the program shows R2.\n\nChoose an answer and press \"Check my prediction\". The words then appear.",
  p1Question:
    "What constant does the assembler give the branch at `008`, `if R2 < R3 signed goto fine`?",
  p1Explain:
    "The constant is `003`. `fine` is at address `014`, the branch at `008`. They are `00C` bytes apart, which is 3 instructions of 4 bytes. A branch's constant counts instructions from the branch, so c = 3. The branch word is `56230003`: kind 5, job 6 (less, read signed), A is R2, B is R3, constant `003`. `014` is the address the name stands for; the constant is the distance to it.",
  investigation:
    "A **debugger** is a program that runs another program one instruction at a time and shows what each instruction changed. The course's debugger runs the instruction set. Both of your circuits were tested against the model it runs (lesson 10.1). It shows what a program can see, not what the circuits contain: no edges, no control signals. The figure shows the debugger running the program from the prediction, with room A's sensor reading -170.",
  debuggerLead:
    'The listing marks the line about to run with ▶. On a wide screen, the devices and registers sit beside the listing. On a narrow one, they follow it. The devices are the display, the lamps and room A\'s sensor. Next come R2, R3 and R4, the registers this program writes, and the PC. A register nothing has set shows X.\n\n"Step" runs one instruction. "Step back" goes back one. "Run to the end" runs until the program stops. "Reset" goes back to the start. The message under the buttons says what comes next, or how the run ended.\n\nPress "Step" until the program stops. Watch which register each instruction writes, and which device each store changes: the lamps at `010`, the display at `014`.',
  debuggerAfter:
    "With room A at -170, the branch at `008` is not taken because -170 is not less than -180. ALARM turns on at `010`, the display shows -170 at `014`, and the program stops at `018`. 7 instructions run.\n\nWith a reading below -180, the branch goes to `fine` and only 5 run.",
  construction:
    "Now you write a program as text. The assembler turns it into words as you type, or lists the lines it refuses. Under your text, the debugger runs it with the readings of any of the tests.",
  warmerLead: "Write the program, step through it in the debugger, then run the tests.",
  c1Task:
    "Write a program that shows the warmer room's reading on the display: the higher of room A's and room B's readings, read signed. Then it stops.\n\nThe starting text reads both sensors and shows room A's reading.\n\nThere are 5 tests. Each runs your program with a pair of readings:\n\n- room A at -184 and room B at -250\n- -250 and -184\n- -200 and -200\n- -30 and 15\n- 20 and -5\n\nEach checks the display and that the program ends at its `stop`. A failed test says what your program left on the display and how the run ended.",
  c1Hints: [
    "The idea: a branch chooses which register goes to the display.",
    "A common mistake: writing `unsigned`. Read unsigned, -30 is a larger number than 15, so a reading below 0 looks warmer than one above it.",
    "A smaller example: the colder-room program shows the lower reading with `if R2 < R3 signed goto show`, then `R2 <= R3`.",
    "Part of the answer: `if R3 < R2 signed goto show` jumps when room A's reading, in R2, is the higher.",
    "The whole answer:\n\n```\n      R2 <= word[sensorA]\n      R3 <= word[sensorB]\n      if R3 < R2 signed goto show\n      R2 <= R3\nshow: word[display] <= R2\n      stop\n```",
  ],
  mistakesLead:
    "The figure holds room A's program again, with three mistakes. You can change its text.\n\nThe assembler refuses three lines. Each refusal gives the line's number and the reason:\n\n- line 3, `R3 <= -18000`;\n- line 4, `if R2 < R3 goto fine`;\n- line 7, `word[dispaly] <= R2`.\n\nMend each line. When the assembler refuses no line, the listing and the debugger appear.\n\nOnce you have changed the text, a button \"Put back the program\" appears. It brings back the three mistakes.",
  mistakesAfter:
    "A constant holds -2048 to 2047. The limit is -180 in tenths of a degree, which fits.\n\n`if R2 < R3 unsigned goto fine` is an instruction, and the assembler takes it. With readings of both signs it chooses wrongly.",
  explanation:
    "The assembler reads the program twice.\n\n1. The first time, it gives every line its address. The first instruction is at `000`, and each instruction is 4 bytes after the one before. A `word` of data is 8 bytes and starts at a multiple of 8, so the assembler puts 0s before it where needed. Each name takes the address of its line.\n2. The second time, it makes each word. It reads the line's transfer for the kind and the job, and the registers for A, B and Y.\n3. A name used as an address becomes the constant: `word[limit]` loads from the address `limit` names.\n4. A name a branch goes to becomes a count: the target's address minus the branch's, divided by 4.\n5. A name may be used before the line that defines it, because the first pass has found every address before the second makes any word.\n6. A line it cannot read, or a number that does not fit, is refused with the line's number.",
  dataLead:
    "This version keeps room A's limit as data after the program: `limit: word -180`. The last instruction, `stop`, is at `018`, so the next free byte is `01C`.\n\n`01C` is not a multiple of 8, so the assembler puts 4 bytes of 0s there and the word starts at `020`. `limit` names `020`. The load `R3 <= word[limit]` becomes `38003020`: kind 3, job 8 (a word at an address the constant gives), Y is R3, and the constant `020`.",
  generalisation:
    "The assembler translates line for word. It adds no instruction of its own: every word in the listing comes from one line you wrote.\n\nYou write where a branch goes; the assembler works out how far. Insert a line and every constant that crosses it changes, and the assembler works each one out again.\n\nThe text is for people: names, comments, the transfer written out. The words are for the machine, which never sees the text.\n\nThe assembler checks the form of each line. Whether the program does what you meant is a question for a run, and the debugger shows you the run.",
  beAssemblerLead: "Work out what the assembler makes for this program, then run the tests.",
  c2Task:
    "Be the assembler for this program:\n\n```\n       R1 <= word[limit]\n       R2 <= word[sensorB]\n       if R2 < R1 signed goto cold\n       R3 <= 1\n       word[lamps] <= R3\ncold:  stop\nlimit: word -200\n```\n\nGive four answers: the address `cold` names; the address `limit` names; the word of the branch `if R2 < R1 signed goto cold`; and the word of the load `R1 <= word[limit]`. Write addresses as three hexadecimal digits and words as eight. There are 4 tests, one for each answer.",
  c2Hints: [
    "The idea: give every line its address first, then make each word.",
    "A common mistake: padding a word that already starts at a multiple of 8. Only a word that would start off a multiple of 8 gets 0s before it.",
    "A smaller example: in the colder-room program, `show` is the fifth instruction, at `010`, and the branch at `008` gets the constant `002`.",
    "Part of the answer: `cold` is the sixth instruction, at `014`, and `limit` is at `018`, a multiple of 8.",
    "The whole answer: `cold` is `014`, `limit` is `018`, the branch is `56210003` and the load is `38001018`.",
  ],
  reflection:
    "Each program so far reads one or two readings and decides once. The shop keeps a log: a reading every hour, kept as words in memory, one after another.\n\nA program that answers a question about the whole log must read every reading, without one line for each. How does a program work through a list of readings kept in memory?",
  modelVsReality:
    "The debugger runs the instruction set, one instruction at a time, on a model. It shows no edges. Some debuggers for a real machine sit on the circuit itself: they stop the clock, or set the machine to stop at an address, and read the registers out.\n\nA register nothing has set holds X in the model. Before an instruction whose address, branch or jump needs such a register, the debugger ends the run and names it. A real machine would use whatever its flip-flops happen to hold.\n\nA run that has not stopped after 5000 instructions is cut off, since a program may never stop. A real machine runs on until it is switched off.",
} as const;
