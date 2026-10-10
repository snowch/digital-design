# Lesson 5's own facts: lesson `capstone` (Module 13, lesson 5), the course's last lesson

Read with `00-module.md`. Briefs 5A to 5C, 5L and V4 use these facts.

## The figures' program

A short program written for this lesson's figures, not the challenge's task. With Module 0's
readings, room A -184 and room B -250, it lights CLASH because room B is colder than room A, and
shows room A's reading, -184, on the display. Its lines, with each line's address:

```
000  R1 <= word[sensorA]
004  R2 <= word[sensorB]
008  R3 <= R2 < R1 signed     // set if: 1 when room B is colder than room A
00C  R3 <= R3 + R3
010  R3 <= R3 + R3            // CLASH is bit 2
014  word[lamps] <= R3
018  word[display] <= R1
01C  stop
```

The run takes 31 edges to the edge before `stop` halts the machine. Each figure is the whole
machine with the trace tools of lesson 3: "Pause before an edge", the table of the levels you have
opened, and "Parts here that never open".

- **Edge 13 is the ALU edge of `R3 <= R2 < R1 signed`.** Paused before it, the ALU subtracts R1
  from R2: -250 minus -184 is -66. Y, the ALU's output, is -66 (`FFFFFFFFFFFFFFBE`). MINUS is 1,
  OVER is 0. MET, the branch condition the set if writes, is 1: room B's reading is less than room
  A's, read signed.
- **COUT, the ALU's carry out, is 0 at that edge.** Read as unsigned numbers, R2's word is smaller
  than R1's, so the subtraction borrows, and a subtraction that borrows gives a carry out of 0. So
  COUT is not the answer to "is R2 less than R1, signed": MET is.
- **The failure experiment** holds MET, the condition block's output in the datapath, at 0. The
  comparison with the model says: "After `R3 <= R2 < R1 signed` at `008`, R3 is 0 on the machine
  and 1 by the model." R3 takes the word for Y; a set if's word for Y is MET as a word, 0 or 1.

## The challenge: a program of your own

- **The task.** Write a program for the shop that shows on the display how many of the two rooms
  are colder than -20.0 degrees (0, 1 or 2), lights ALARM (bit 0 of the lamps) when both are and no
  other lamp otherwise, and stops. It must use at least one set if. "Colder than -20.0 degrees"
  means a reading less than -200; a reading of exactly -200 is not colder.
- **The tests of the program**: four pairs of readings, each run on the model to its `stop`:
  room A -184 and room B -250 (display 1, lamps 000); both -250 (display 2, lamps 001); -150 and
  -100 (display 0, lamps 000); -200 and -201 (display 1, lamps 000). A failed case names the
  readings, what the program left on the display and the lamps, and what the task asks for. A
  program that halts, or does not stop, is told so.
- **Five questions about your program's run on the whole machine**, with room A at -184 and room
  B at -250. Their answers are read off the recorded run of your own program, so they depend on
  how you wrote it: which registers, which order of operands, which addresses.
  1. Y, the ALU's output, paused before the ALU edge of your first set if, as a signed decimal
     number.
  2. COUT, the ALU's carry out, at that same moment: 0 or 1.
  3. MET, the branch condition, at that same moment: 0 or 1.
  4. ADDR, the address the memory reads, paused before the MEMORY edge of your first store, in
     hexadecimal.
  5. D of the PC's bit 4, paused before the WRITE edge of your first set if: 0 or 1.
- **How you answer.** The editor holds your program, the five answers, and a button "Run my
  program on the whole machine", which opens the trace figure of lesson 3 on your program, with
  room A at -184 and room B at -250. Pause there, trace, read.
- **A wrong answer** is told which level to look at and what to read there, never the value. A
  question your program gives no edge for (no set if, no store) says so.
