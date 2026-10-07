investigation: The program runs with room A at -170 and room B at -190. The figure shows a breakpoint on `overBy`, with the stack visible.

pushedLead: 1. The watch shows R10, R14, R15 and `word[R14]`, the word on top of the stack.
2. Press "Step" through `sumOver`'s first four lines. At each push, R14 goes down by 8 and a word goes into the RAM.
3. Press "Run to a breakpoint" to reach each call of `overBy`. Watch R10 take room B's reading, then room A's amount.
4. Step through the pops at the end of `sumOver`, and watch R10 and R15 take back their words.

pushedAfter: `sumOver` used R10 to hold -190, then 10. The first pop restored R10 to its original value of 1. The pop of R15 restored `014`. `goto R15` returned the program to where the main program called `sumOver`. The display shows 20 and ALARM is on because the main program stored R10's 1 to the lamps. The program executed 38 instructions and stopped at `024`. R14 is back at `7C0`.

construction: You can work out where a function pushes words without running the program. Start from `7C0` and go down by 8 for each push, following the order of the pushes and the calls in the listing. The program includes a function `check` that keeps three registers as well as R15. The lesson does not run this function.

checkListingLead: Below is the program with `check`, as the assembler lists it.

addressesLead: Work out each answer from the listing, then run the tests.

c1Task: In this run of the program with `check`, room A reads -170 and room B reads -190. Give these answers in hexadecimal:
- the address of the word that holds `check`'s return address;
- the address of the word that holds what R10 held when `check` started;
- what R14 holds while `overBy` runs;
- the value at `7B8` once `check` has returned to the main program.

Write each as three hexadecimal digits. There are 4 tests, one for each answer.

c1Hints.1: Start R14 at `7C0` and subtract 8 for each push, in the order they run.

c1Hints.2: A pop does not clear the word it takes. It copies the word into a register and adds 8 to R14. The word stays in the RAM until a push writes over it.

c1Hints.3: In the lesson's run, `sumOver` pushed R15 to `7B8` and R10 to `7B0`. R14 held `7B0` while `overBy` ran.

c1Hints.4: `check` pushes R15, R10, R11 and R12, in that order, before its first call.

c1Hints.5: The answers are `7B8`, `7B0`, `7A0` and `010`.
