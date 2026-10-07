# Brief 5RA: lesson `recursion` (Module 11, lesson 5), rebuilt, first part

Read `00-module.md` (the shared fact sheet) first; it applies here. You may use every term of
lessons 1 to 4 (not in bold): assembly, assembler, debugger, breakpoint, function, argument,
calling convention, stack. This lesson introduces **recursion**: set it in bold where it is first
used, in `motivation`, plain meaning first. "Recursion" must not appear in `question` or
`roomsLead`. Never write "frame", "tree", "node", "child" or "parent".

## The cold store

The shop's cold store is a hall and rooms behind it. Each room has a sensor reading and up to two
doors, each leading to a further room. The program keeps each room as three words, one `word`
line: its reading, then the address of the room behind its first door, then the address of the
room behind its second door. A door that leads to no room holds 0.

```
0A0 hall:   word -150, prep, store
0B8 prep:   word -175, 0, 0
0D0 store:  word -190, chillA, chillB
0E8 chillA: word -182, deep, 0
100 chillB: word -205, 0, 0
118 deep:   word -178, 0, 0
```

So the hall opens onto the prep room and the store; the store onto two chillers, `chillA` and
`chillB`; `chillA` onto the deep freeze, `deep`. A room is 24 bytes, so the rooms sit at `0A0`,
`0B8`, `0D0`, `0E8`, `100` and `118`.

## The function

`warmRooms` takes a room's address in R1 (0 for no room) and a limit in R2. Its result in R1 is
how many rooms are warmer than the limit: that room and every room behind it, through every door.

- If R1 is 0, there is no room: it calls nothing and returns 0. This is the last case.
- Otherwise it pushes R15, R10, R11 and R12: 4 words. It keeps the room's address in R10, the
  limit in R12, and its count so far in R11 (1 if this room is warmer, else 0).
- It calls `warmRooms` on the room behind the first door (`word[R10 + 8]`) and adds the result to
  R11.
- It puts the limit back in R2, calls `warmRooms` on the room behind the second door
  (`word[R10 + 16]`), and adds R11 to that result.
- It pops the four words and returns.

The main program sets R14 to `0x7C0`, puts the hall's address in R1 and -180 in R2, calls
`warmRooms`, and shows the result.

Keys to write: `question`, `roomsLead`, `motivation`, `prediction`, `p1Question`, `p1Explain`.

## question (about 90 words, above a figure)

1. Lesson 4 asked: can a function call itself?
2. The shop's cold store: the hall, and rooms behind it, some opening onto further rooms (the
   layout above, in words, not as a list of addresses).
3. The office wants to know how many rooms are warmer than -180, counting every room you can
   reach from the hall.
4. A loop walks one list from start to end. Here each room can lead two ways, and the way back
   from a room must be kept until both of its doors have been followed.

## roomsLead (about 60 words, directly above the figure)

1. The figure shows the rooms as the program keeps them: three words a room.
2. The first word is the reading. The second and third are the addresses of the rooms behind the
   room's two doors, or 0 where a door leads nowhere.
3. Find the hall at `0A0`: its doors hold `0B8`, the prep room, and `0D0`, the store.

## motivation (about 140 words, a list allowed)

1. The count for a room is: 1 if the room is warmer than the limit, plus the count for the room
   behind its first door, plus the count for the room behind its second door.
2. The count for a room behind a door is the same question again, for a different room. So the
   function `warmRooms` answers it by calling itself.
3. A function that calls itself is **recursion**.
4. A door that leads nowhere holds 0. `warmRooms` on 0 calls nothing and returns 0: this is the
   last case. Every way in ends at one, so the calls stop.
5. Each call that finds a room pushes 4 words: R15, and the three kept registers it uses for the
   room's address, the limit and its count. So each call keeps its own room while it follows the
   doors.

## prediction (about 40 words, above the figure)

1. The figure lists the program, the function `warmRooms` and the rooms.
2. Choose an answer and press "Check my prediction". The listing's words then show.
3. Do not say how many calls there are, or how many doors lead nowhere.

## p1Question (one sentence)

In the run from the hall, how many times is `warmRooms` called?

## p1Explain (about 80 words, shown once the learner has answered)

1. `warmRooms` is called 13 times.
2. Once for each of the 6 rooms.
3. Once more for each door that leads nowhere: 6 rooms have 12 doors, 5 of which lead to a room,
   so 7 lead nowhere. 6 and 7 make 13.
4. A call for a door that leads nowhere is the last case: it calls nothing and returns 0.
5. The next figure runs the program, so you can count the calls as the run pauses.
