// Copyright © 2026 Christopher Snow

// The words of the lesson what-computers-do.
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-0-machine/briefs), checked for facts only and placed by
// docs/notes/module-0-machine/scripts/place.py with the fixes in fixes.json.

export const PROSE = {
  question:
    "A shop has two freezer rooms, A and B. Each has a sensor. The office has a display and three lamps: ALARM, NIGHT and CLASH.\n\nA machine sits between the sensors and the office. It reads the rooms and decides what the display shows and which lamps light. The figure below draws them: the sensors on the left, the machine in the middle, the display and the lamps on the right.\n\nHow does the machine decide what the display shows?",
  shopAfter:
    "Room A at -18.4 degrees sends -184. Room B, kept colder at -25.0 degrees, sends -250. Each number is in tenths of a degree. The 64 beside each connection shows how many wires take the number.",
  motivation:
    "The machine does not decide anything by itself. It runs a program: a list of lines, numbered from 1. It runs one line at a time, in order, unless a line tells it to go to another line.\n\nThe machine keeps sixteen numbers, named R0 to R15. A line can set one of them, read a room, show a number on the display, or set the lamps.\n\nThe shop's program has 9 lines:\n\n1. R1 becomes room A's reading\n2. R2 becomes room B's reading\n3. R3 becomes R1 minus R2\n4. Show R3 on the display\n5. R4 becomes 100\n6. If R3 is less than R4, go to line 9\n7. R5 becomes 4\n8. Set the lamps from R5\n9. Stop\n\nRunning these lines is all the machine does. The next figure asks you which of them it runs.",
  prediction:
    'The figure shows the program and the rooms at -184 and -250. Its numbers and buttons stay hidden until you choose an answer. Work out what line 3 gives and what line 6 then does. Choose an answer and press "Check my prediction".',
  p1Question:
    "With room A at -184 and room B at -250, which lines does the machine run from line 1 until it stops?",
  p1Explain:
    "R3 becomes -184 minus -250, which is 66. Line 4 shows 66 on the display. Line 6 compares R3 (66) with R4 (100). 66 is less than 100, so it goes to line 9. Lines 7 and 8 never run, and CLASH stays dark. The machine runs lines 1, 2, 3, 4, 5, 6 and 9.",
  runLead:
    'This is the same machine and program, with its buttons. Each press of "Run one line" runs one line. The row marked "Next" is the line it runs next.\n\nWatch "The numbers it keeps": the number a line changes is marked "Changed". Watch "What the shop sees" after line 4. Press "Run one line" until the program stops. Then press "Start again".\n\nChange room A\'s reading to -50. This is -5.0 degrees: room A\'s freezer is failing. Press "Run" to watch the whole program. "Pause" stops a run. Which lines run this time, and what does the display show?',
  runAfter:
    "With the rooms at -184 and -250, each line changed at most one thing. R1 became -184, R2 -250, R3 66, R4 100, then the display showed 66. With room A at -50, R3 becomes 200. 200 is not less than 100, so line 6 does not go to line 9. Lines 7 and 8 run: R5 becomes 4 and CLASH lights. The program did not change. Only a reading changed, and the same lines gave a different display and a lit lamp.",
  construction:
    "The shop's manager wants CLASH to light when room A is 5.0 degrees or more warmer than room B, not 10.0 degrees. Line 5 sets R4 to 100: the limit. Line 6 compares the gap in R3 against that limit. To change when CLASH lights, you change one number in one line.",
  limitLead:
    "The figure in the investigation runs the program with 100; you can try readings there first.",
  c1Task:
    "Type the number line 5 should give R4 so that CLASH lights when room A is 5.0 degrees or more warmer than room B, and stays dark when the gap is less.\n\nThe tests run the machine with your number in line 5 and room B at -250, for three readings of room A: -190 (gap 60), -200 (50) and -201 (49). CLASH must light for gaps 60 and 50, and stay dark for 49. The box starts at 100. With 100, two of the 3 tests fail.",
  c1Hints: [
    "Line 6 goes to line 9, past the lamp, when R3 is less than R4. CLASH lights only when R3 is not less than R4.",
    "A gap exactly equal to the limit is not less than it, so the lamp lights. Think about the gap of 50.",
    "With 100 in line 5, a gap of 100 lights CLASH and a gap of 99 does not.",
    "5.0 degrees is 50 tenths of a degree.",
    "The limit is 50.",
  ],
  roomBFailsLead:
    "Room B's freezer fails. It warms to -5.0 degrees, so its sensor reads -50. Room A stays at -184.\n\nRoom B is now 13.4 degrees warmer than room A. The shop would want CLASH to light: the two rooms are far apart. The figure runs the same program with these readings. Read the program again before you answer.",
  p2Question: "Room A reads -184 and room B -50. When the program stops, is the CLASH lamp lit?",
  p2Explain:
    "R3 becomes -184 minus -50, which is -134. The display shows -134. Line 6 compares -134 with 100. -134 is less than 100, so the machine goes to line 9. CLASH stays dark.\n\nThe program checks one way only: whether room A is warmer than room B. When room B is the warmer one, the gap is below zero, and the lamp never lights. The machine did what the lines said. It cannot know what the shop meant. A wrong program gives a wrong answer, and the machine runs it without complaint.",
  explanation:
    "Where are the lines while the machine runs them? In its memory, with the numbers the machine works on. The machine keeps each line as one number. The number says which thing to do and with which of R0 to R15. Line 1 is kept as 939530200.\n\nTo run a line, the machine reads that line's number, does what it says, and moves to the next line, unless the line says to go elsewhere. So a program is numbers in memory, and changing the program, as you did in the construction, means changing a number.",
  keptLead:
    'The figure adds a column, "Kept as": the number the machine keeps each line as. Run the program, then change a room\'s reading and run it again. Watch the "Kept as" column.',
  keptAfter:
    'The "Kept as" column did not change, whatever the rooms read. The readings and the numbers R0 to R15 change as the program runs. The program\'s own numbers do not.',
  generalisation:
    "This machine did four things. It read numbers from the rooms. It kept sixteen numbers, R0 to R15. It ran lines of the program one at a time. It set the display and the lamps.\n\nThe same program with different room readings gave different answers: 66 on the display, or 200, or -134. But the program stayed the same. A different program on the same machine would do a different job. The machine does not change. The numbers in its memory do.\n\nEvery computer works this way, from this machine to a phone. It reads data from outside. It keeps numbers. It runs lines of a program one at a time. It sets things outside. The parts change. The speed changes. The way it works does not.",
  inYourHeadLead:
    "Work this one out from the program first. Then check it in the investigation's figure if you like.",
  c2Task:
    "Room A reads -100. Room B reads -250. Type the number the display shows when the program stops. Then choose whether the CLASH lamp is lit or dark. The tests run the machine with these readings and compare the display and the lamp with your answers. There are 2 tests.",
  c2Hints: [
    "The display shows R3. Line 3 works it out: room A's reading minus room B's.",
    "Subtracting a negative: -100 minus -250 is the same as -100 plus 250.",
    "Look back at the earlier run: with -184 and -250, R3 was 66. Because 66 is less than 100, CLASH stayed dark.",
    "R3 is 150.",
    "The display shows 150. CLASH is lit, because 150 is not less than 100.",
  ],
  reflection:
    "A computer runs a program. The lines are kept as numbers in its memory. It runs them one at a time.\n\nThe machine follows the lines exactly. The program decides what the display means. When the program is wrong, the machine is wrong with it. The machine is a box. It runs lines. But what is inside the box, and how does it work out 66?",
  modelVsReality:
    "The machine on this page runs in the course's simulator. Each press of Run one line runs one line. Every number on the page is read from the simulator.\n\nA real computer runs many millions of lines a second. Here you see one line at a time. The course is about how each line works.\n\nThe rooms' readings here are numbers you type. A real sensor's reading changes on its own. A real shop's computer would also run lines for many other jobs. This machine runs one program, nine lines long, and stops.",
} as const;
