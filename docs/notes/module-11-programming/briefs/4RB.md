# Brief 4RB: lesson `stack` (Module 11, lesson 4), revised, second part

Read `00-module.md` (the shared fact sheet) and brief `4RA.md` (for context) first. You may use
every term of lessons 1 to 4 (not in bold), stack included. Never write "frame".

The lesson's program, as the figures show it (room A at -170, room B at -190):

```
000          R14 <= 0x7C0         // the stack starts at the top of the RAM
004          R10 <= 1             // ALARM's bit
008          R1 <= word[sensorA]
00C          R2 <= word[sensorB]
010          call sumOver, R15
014          word[display] <= R1
018          R0 <= 0
01C          if R1 == R0 goto done
020          word[lamps] <= R10
024 done:    stop
028 sumOver: R14 <= R14 - 8
02C          word[R14] <= R15     // push R15
030          R14 <= R14 - 8
034          word[R14] <= R10     // push R10
038          R10 <= R2            // keep room B's reading through the first call
03C          R2 <= -180
040          call overBy, R15
044          R6 <= R10
048          R10 <= R1            // keep room A's amount through the second call
04C          R1 <= R6
050          R2 <= -200
054          call overBy, R15
058          R1 <= R1 + R10
05C          R10 <= word[R14]     // pop R10
060          R14 <= R14 + 8
064          R15 <= word[R14]     // pop R15
068          R14 <= R14 + 8
06C          goto R15
070 overBy:  ...
```

Keys to write: `investigation`, `pushedLead`, `pushedAfter`, `construction`, `checkListingLead`,
`addressesLead`, `c1Task`, `c1Hints` (five).

## investigation (about 30 words)

The figure runs the new program with room A at -170 and room B at -190, a breakpoint on `overBy`,
and the stack shown.

## pushedLead (about 70 words, a numbered list, directly above the figure)

1. The watch shows R10, R14, R15 and `word[R14]`, the word on top of the stack.
2. Press "Step" through `sumOver`'s first four lines. At each push, R14 goes down by 8 and a word
   goes into the RAM.
3. Press "Run to a breakpoint" to reach each call of `overBy`. Watch R10 take room B's reading,
   then room A's amount.
4. Step through the pops at the end of `sumOver`, and watch R10 and R15 take back their words.

## pushedAfter (about 70 words, shown once the run has ended)

1. `sumOver` used R10 for its own words, -190 and then 10. The pop gave R10 back its 1.
2. The pop of R15 gave back `014`, so `goto R15` returned to the main program.
3. The display shows 20, and ALARM is on: the main program stored R10's 1 to the lamps.
4. 38 instructions run, and the program stops at `024`. R14 is back at `7C0`.

## construction (about 60 words)

1. The words a function pushes sit at addresses you can work out from the listing, without
   running it.
2. Start from `7C0`, take 8 off for each push, and follow the order of the pushes and the calls.
3. The program in the figure has a function `check` that keeps three registers as well as R15.
   The lesson does not run it.

## checkListingLead (one sentence, directly above the listing)

The program with `check`, as the assembler lists it.

## addressesLead (one sentence, directly above the challenge)

Work out each answer from the listing, then run the tests.

## c1Task (about 90 words, a list allowed)

1. In a run of the program with `check`, with room A at -170 and room B at -190, give in
   hexadecimal:
   - the address of the word that holds `check`'s return address;
   - the address of the word that holds what R10 held when `check` started;
   - what R14 holds while `overBy` runs;
   - the word at `7B8` once `check` has returned to the main program.
2. Write each as three hexadecimal digits.
3. There are 4 tests, one for each answer.

## c1Hints (five, in this order)

1. The idea: start R14 at `7C0` and take 8 off for each push, in the order the pushes run.
2. A common mistake: thinking a pop clears the word it takes. A pop copies the word into a
   register and adds 8 to R14. The word stays in the RAM until a push writes over it.
3. A smaller example: in the lesson's run, `sumOver` pushes R15 to `7B8` and R10 to `7B0`, and
   R14 holds `7B0` while `overBy` runs.
4. Part of the answer: `check` pushes R15, R10, R11 and R12, in that order, before its first call.
5. The whole answer: `7B8`, `7B0`, `7A0` and `010`.
