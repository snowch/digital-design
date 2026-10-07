construction: You read 66's 1s and 0s on the slices. Now go the other way: from new readings to what the slices give.

slicesLead: The ladder above shows the method on 66.

c1Task: Room A reads -180 and room B -250. The machine is paused before line 3.

Type the 1s and 0s from the eight lowest slices of the part that adds. Start with the slice worth 128 and end with the slice worth 1. There are 2 tests: one checks slices 128, 64, 32 and 16; the other checks 8, 4, 2 and 1.

c1Hints.1: The slices give R1 minus R2 in 1s and 0s.

c1Hints.2: Use the difference between the readings: -180 minus -250, not the readings themselves.

c1Hints.3: For example, 66 is 64 + 2, so the eight slices give `0100 0010`.

c1Hints.4: Line 3 gives 70.

c1Hints.5: 70 is 64 + 4 + 2, so the eight slices give `0100 0110`.

stuckLead: Choose the stuck wire. It is at the bottom of the ladder, inside the slice worth 2, and it stays at 0 whatever the slice works out.

Before you run it, decide: what will the shop's display show? Then press "Run".

stuckQuestion: With the wire stuck, what will the display show when the machine runs on to its stop?

stuckExplain: 66 is 64 + 2. The slice worth 2 now gives 0, so the part that adds gives 64. Line 3 puts 64 into R3. Line 4 shows it.

stuckAfter: Every line ran as before. The program stopped normally, and nothing on the page says anything is wrong. 6.4 degrees looks like a reasonable gap. One wire, deep inside the part that adds, changed what the shop sees.

explanation: Each level is the level below seen from further away. While line 3 waits, the 66 is the 1s and 0s on the slices' outputs, each a wire, high or low. When line 3 runs, R3 takes it.

So a fault at the bottom shows at the top as a wrong number, and nothing at the top can tell. The display had no way to know the 2 was missing.

This is why the course tests every part it builds before a later lesson uses it as a box.

generalisation: The ladder in this lesson shows the course's plan: each module builds one level from the one below, then uses it as a box. Module 1 turns a wire's voltage into a 1 or a 0. Module 2 makes the smallest parts. Module 3 makes a part that adds one place of two numbers. Module 7 makes the part that adds whole numbers. Module 8 makes the machine. Later modules build the programs.

A level hides the levels below it. You can use the part that adds without opening it because it was tested. When something goes wrong, you open one level at a time until you find the wire.

tracePausedLead: This time room A reads -120 and room B reads -250.

traceLead: Trace the next line from the figure above.

c2Task: The machine above is paused before line 3. Trace that one line: which of the numbers R0 to R15 does it change, the new number, the line the machine runs next, and which part works the new number out.

The tests run the machine for one line on a copy and compare your answers. There are 4 tests.

reflection: The machine is parts inside parts. One number at the top is 1s and 0s on wires at the bottom. One stuck wire changes what the shop sees.

Module 1 starts from one question: how does a voltage on one wire become a 1 or a 0, and many of them a number?

modelVsReality: The drawings on this page show the circuit the simulator runs, opened a level at a time. A real chip is laid out by tools to fit a small area, and its parts are not in the tidy rows the drawings show.

A real wire's voltage moves between high and low, and nearby wires and motors push it about. A real fault like the stuck wire happens when a chip is damaged or made wrong. Chip makers test each chip for such faults before they sell it.
