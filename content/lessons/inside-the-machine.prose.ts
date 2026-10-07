// Copyright © 2026 Christopher Snow

// The words of the lesson inside-the-machine.
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-0-machine/briefs), checked for facts only and placed by
// docs/notes/module-0-machine/scripts/place.py with the fixes in fixes.json.

export const PROSE = {
  question:
    "In the last lesson the display showed 66, how much warmer room A is than room B. Line 3 worked it out: R3 becomes R1 minus R2.\n\nThe machine was a box that runs lines. What is inside it? Where does 66 come from?",
  motivation:
    "The machine is made of parts, each made of smaller parts, down to wires that are high or low. A high voltage stands for 1, a low one for 0.\n\nEach part is used as a box, its insides hidden. You can look at one level at a time. The course builds the machine from the bottom: Module 1 starts at one wire. This lesson goes down from the top.",
  prediction:
    'The machine is paused before line 3. The part that adds has already worked out 66: it works all the time on whatever numbers reach it, and R1 and R2 already reach it. R3 is not set yet; when line 3 runs, R3 takes the 66. The part that adds also takes one number from another: every use on this page is a subtraction (Module 3 shows how). The part is 64 slices, side by side. Each works on one place and gives a 1 or a 0, worth 1, 2, 4, 8 and so on. The figure opens the part into four boxes of 16 slices, then opens the first box into four boxes of 4, then shows the four slices of least worth. The numbers stay hidden until you choose an answer and press "Check my prediction".',
  p1Question: "When the part that adds gives 66, which of its slices give a 1?",
  p1Explain:
    '66 is 64 + 2. So the slices worth 64 and 2 give 1. The other 62 give 0. No slice is worth 66. Press "Down a level" twice to see the slices worth 8, 4, 2 and 1 give `0010`.',
  levelLine: "This is line 3. The machine is about to run it.",
  levelParts:
    "The whole machine's drawing. It is wide; on a small screen, a strip above shows all of it. The part that adds is marked.",
  levelAdder:
    "The part that adds, opened into four boxes of 16 slices each. The first box is marked.",
  levelFour: "The four slices of least worth: 8, 4, 2 and 1. The slice worth 2 is marked.",
  levelSlice:
    "The slice worth 2, opened. It has a part that adds and parts that choose which result goes out. Its adding part is marked.",
  levelSmallest:
    "That half is opened. It has two of the smallest parts. One makes the sum and sends it out on the wire named SUM. The other makes the half's second output.",
  levelWire: "This is the wire SUM. It leaves the half that makes the sum.",
  ladderLead:
    'The figure starts at line 3. Each press of "Down a level" opens the box the level above marks. Keep going until you reach one wire. At each level, find the 66, written that level\'s way.',
  ladderAfter:
    "The 66 at the top is the 1s and 0s on the 64 slices' outputs. The slice worth 2's output is one wire, high. Every level is the same machine, seen from nearer.",
  construction:
    "You read 66's 1s and 0s on the slices. Now do it for new readings: from the readings to what the slices give.",
  slicesLead: "The ladder above shows the method on 66.",
  c1Task:
    "Room A reads -180 and room B -250. The machine is paused before line 3.\n\nType the 1s and 0s from the eight slices of least worth in the part that adds. Start with the slice worth 128 and end with the slice worth 1. There are 2 tests: one checks slices 128, 64, 32 and 16; the other checks 8, 4, 2 and 1.",
  c1Hints: [
    "The slices give R1 minus R2 in 1s and 0s.",
    "Use the difference between the readings: -180 minus -250, not the readings themselves.",
    "For example, 66 is 64 + 2, so the eight slices give `0100 0010`.",
    "Line 3 gives 70.",
    "70 is 64 + 4 + 2, so the eight slices give `0100 0110`.",
  ],
  stuckLead:
    "Choose the stuck wire. It is at the bottom of the ladder, inside the slice worth 2, and it stays at 0 whatever the slice works out.\n\nThe drawing is the half of that slice's adding part that makes the sum. Look before you run: the part that makes the sum gives 1, and the wire SUM stays low. Then answer the question above the drawing.",
  stuckAfter:
    "Every line ran as before. The program stopped normally, and nothing on the page says anything is wrong. 6.4 degrees looks like a reasonable gap. One wire, deep inside the part that adds, changed what the shop sees.",
  explanation:
    "Each level is the level below seen from further away. While line 3 waits, the 66 is the 1s and 0s on the slices' outputs, each a wire, high or low. When line 3 runs, R3 takes it.\n\nSo a fault at the bottom shows at the top as a wrong number, and nothing at the top can tell. The display had no way to know the 2 was missing.\n\nThis is why the course has you test each part you build before a later lesson uses it as a box.",
  generalisation:
    "The ladder in this lesson shows the course's plan: each module builds one level from the one below, then uses it as a box. Module 1 turns a wire's voltage into a 1 or a 0. Module 2 makes the smallest parts. Module 3 makes a part that adds one place of two numbers. Module 7 makes the part that adds whole numbers. Module 8 makes the machine. Later modules build the programs.\n\nA level hides the levels below it. You can use the part that adds without opening it because it was tested. When something goes wrong, you open one level at a time until you find the wire.",
  tracePausedLead: "This time room A reads -120 and room B reads -250.",
  traceLead: "Trace the next line from the figure above.",
  c2Task:
    "The machine above is paused before line 3. Trace that one line: which of the numbers R0 to R15 does it change, the new number, the line the machine runs next, and which part works the new number out.\n\nThe tests run the machine for one line on a copy and compare your answers. There are 4 tests.",
  c2Hints: [
    "A line changes at most one of the numbers R0 to R15. Then the machine moves to the next line, unless the line says to go elsewhere.",
    "Do not trace the whole program. Trace line 3 only.",
    "In the last lesson, with -184 and -250, line 3 set R3 to 66, then line 4 ran.",
    "R3 changes, and line 4 runs next.",
    "R3 becomes 130, line 4 runs next, and the part that adds works out 130.",
  ],
  reflection:
    "The machine is parts inside parts. One stuck wire changes what the shop sees.\n\nModule 1 starts from one question: how does a voltage on one wire become a 1 or a 0, and many of them a number?",
  modelVsReality:
    "The drawings on this page show the circuit the simulator runs, opened a level at a time. A real chip is laid out by tools to fit a small area, and its parts are not in the tidy rows the drawings show.\n\nA real wire's voltage moves between high and low, and nearby wires and motors push it about. A real fault like the stuck wire happens when a chip is damaged or made wrong. Chip makers test each chip for such faults before they sell it.",
  questionAfter:
    "Everything here shows the box from outside: its program with nine lines, the numbers it keeps, and the display. Nothing here shows what is inside the box.",
  levelSixteen: "That box is opened into four boxes of 4 slices each. The first box is marked.",
  levelAdding:
    "The slice's adding part, opened. It has two halves and one more of the smallest parts. The half that makes the sum is marked.",
  stuckQuestion:
    "With the wire stuck, what will the display show when the machine runs on to its stop?",
  stuckExplain:
    "66 is 64 + 2. The slice worth 2 now gives 0, so the part that adds gives 64. Line 3 puts 64 into R3. Line 4 shows it.",
} as const;
