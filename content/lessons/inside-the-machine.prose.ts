// Copyright © 2026 Christopher Snow

// The words of the lesson inside-the-machine.
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-0-machine/briefs), checked for facts only and placed by
// docs/notes/module-0-machine/scripts/place.py with the fixes in fixes.json.

export const PROSE = {
  question:
    "In the last lesson the display showed 66, how much warmer room A is than room B. Line 3 worked it out: R3 becomes R1 minus R2.\n\nThe machine was a box that runs lines. What is inside it? Where does 66 come from?",
  motivation:
    "The machine is made of parts. Each part is made of smaller parts, down to wires that are high or low.\n\nEach part is used as a box, its insides hidden. You can look at one level at a time. The course builds the machine from the bottom: Module 1 starts at one wire. This lesson goes the other way, from the top, to show where each module's part sits in the finished machine.",
  prediction:
    'The machine is paused before line 3, and the part that adds has already worked out 66. The part that adds is 64 slices, side by side. Each works on one place and gives a 1 or a 0. The slices are worth 1, 2, 4, 8 and so on, each worth twice the one before. The values stay hidden until you choose an answer and press "Check my prediction".',
  p1Question: "When the part that adds gives 66, which of its slices give a 1?",
  p1Explain:
    '66 is 64 + 2. So the slice worth 64 and the slice worth 2 give 1. The other 62 give 0. No slice is worth 66: each slice gives one 1 or 0, and the number is the pattern of all 64. Press "Down a level" to see the four lowest slices give `0010`.',
  levelLine: "This is line 3, which gives the number 66.",
  levelParts:
    'The whole machine\'s drawing. It is wide: on a small screen, a strip above shows all of it, and you can press "Make smaller" to zoom out. The part that adds is marked.',
  levelAdder:
    "The part that adds, opened into four boxes of 16 slices each. Their 1s and 0s give 66: `00000000 00000000 00000000 00000000 00000000 00000000 00000000 01000010`.",
  levelFour: "The four lowest slices, worth 8, 4, 2 and 1. Their 1s and 0s: `0010`.",
  levelSlice:
    "The slice worth 2, opened. It has a part that adds and parts that choose which result goes out. It gives 1.",
  levelSmallest:
    "Inside the slice's adding part: the two smallest parts that make its sum. Module 2 builds these smallest parts. It gives 1.",
  levelWire:
    "One wire from the slice's adding part, named SUM. It is high, and a high voltage stands for 1. A low one stands for 0.",
  ladderLead:
    'The figure starts at line 3. Each press of "Down a level" goes one level down, and you go down the machine to one wire.\n\nAt each level, find the number. It is the same number all the way down: 66, then its 1s and 0s, then the 1 of one slice, then one wire.',
  ladderAfter:
    "The 66 at the top is the 1s and 0s on 64 slices' outputs. One of those, the slice worth 2, is one wire, high.\n\nEvery level is the same machine, seen from nearer. The course builds it from that wire upwards.",
  construction:
    "You found 66's 1s and 0s on the slices. Now go the other way: from new readings to what the slices give.",
  slicesLead: "You can open the part that adds in the ladder above to check your method on 66.",
  c1Task:
    "Room A reads -180 and room B -250. The machine is paused before line 3.\n\nType the 1s and 0s from the eight lowest slices of the part that adds. Start with the slice worth 128 and end with the slice worth 1. The test runs the machine with these readings and reads the eight slices. There is 1 test.",
  c1Hints: [
    "The slices give R1 minus R2 in 1s and 0s.",
    "Use the difference between the readings: -180 minus -250, not the readings themselves.",
    "For example, 66 is 64 + 2, so the eight slices give `0100 0010`.",
    "Line 3 gives 70.",
    "70 is 64 + 4 + 2, so the eight slices give `0100 0110`.",
  ],
  stuckLead:
    'Choose the stuck wire. It is at the bottom of the ladder, inside the slice worth 2, and it stays at 0 whatever the slice works out.\n\nBefore you run it, decide: what will the shop\'s display show? Then press "Run".',
  stuckAfter:
    "The display shows 64, not 66. The slice worth 2 gives 0, so the part that adds gives 64.\n\nEvery line ran as before. The program stopped normally, and nothing on the page says anything is wrong. 6.4 degrees looks like a reasonable gap. One wire, four levels down, changed what the shop sees.",
  explanation:
    "Each level is the level below seen from further away. The 66 in R3 is the 1s and 0s on 64 slices' outputs, and each of those is a wire, high or low.\n\nSo a fault at the bottom shows at the top as a wrong number, and nothing at the top can tell. The display had no way to know that the 2 was missing.\n\nThis is why the course tests every part it builds before it uses that part as a box. A part used as a box must do what its outside promises.",
  generalisation:
    "The ladder in this lesson shows the course's plan: each module builds one level from the one below, then uses it as a box. Module 1 turns a wire's voltage into a 1 or a 0. Module 2 makes the smallest parts. Module 3 makes a part that adds one place of two numbers. Module 7 makes the part that adds whole numbers. Module 8 makes the machine. Later modules build the programs.\n\nA level hides the levels below it. You can use the part that adds without opening it because it was tested. When something goes wrong, you open one level at a time until you find the wire.",
  tracePausedLead: "The machine is paused before line 3, with room A at -120 and room B at -250.",
  traceLead: "Trace the next line from what the paused machine shows.",
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
    "The machine is parts inside parts. One number at the top is 1s and 0s on wires at the bottom. One stuck wire changes what the shop sees.\n\nThe course climbs the ladder from the bottom. Module 1 starts from one question: how does a voltage on one wire become a 1 or a 0, and many of them a number?",
  modelVsReality:
    "The drawings on this page show the circuit the simulator runs, opened a level at a time. A real chip is laid out by tools to fit a small area, and its parts are not in the tidy rows the drawings show.\n\nA real wire's voltage moves between high and low, and noise moves it. A real fault like the stuck wire happens when a chip is damaged or made wrong. Chip makers test each chip for such faults before they sell it.",
} as const;
