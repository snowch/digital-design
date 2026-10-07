question: Lesson 2 ended on a question. The office wants room A's reading checked against its limit, -180, and room B's against its own, -200. The check is the same lines each time, with a different reading and limit. Written out twice, a mistake in the check must be found and mended twice. How can a program use one piece of program from two places?

twoWaysLead: The figure runs two programs that do the same work, with room A at -170 and room B at -190. The first writes the check out twice. The second writes it once, under the name `overBy`, and reaches it from two places with `call overBy, R15`. Press Run the programs to see the instruction count for each.

twoWaysAfter: Both show 10 on the display: room A is 10 tenths of a degree above -180. Both turn ALARM on, as room B is 10 above -200. Written twice, the program has 15 instructions and runs 13. Written once, it has 18 and runs 22: each use of `overBy` runs a call and a jump back. The check now exists once. A mistake in it is mended in one place.

motivation: Lesson 8.5 showed the call instruction. `call overBy, R15` puts the address of the instruction after the call in R15, then goes to `overBy`. `goto R15` jumps to the address R15 holds. A **function** is a piece of program a call runs, which goes back to the instruction after the call when it is done. The values a function is given are its **arguments**. `overBy` takes two: a reading in R1 and a limit in R2. It leaves its result in R1: how far the reading is above the limit, or 0 when it is not above. It works out the difference in R5 first, and keeps it only if it is above 0. Before each call, the program puts the arguments in R1 and R2. After the call, the result is in R1.

prediction: The figure lists the program, which calls `overBy` twice: once from address `008` and once from `018`. Choose an answer and press Check my prediction. When you do, the listing's words show.

p1Question: When the program stops, what does R15 hold?

p1Explain: R15 holds `01C`. Each call writes R15: the first at `008` wrote `00C`, the second at `018` wrote `01C`, replacing `00C`. Nothing after the second call writes R15, so it holds `01C` when the program stops. `018` is the call's own address. A call keeps the address after it so `goto R15` goes on from there. The `goto R15` went back to `00C` the first time and to `01C` the second: a function goes back to wherever it was called from. The next figure runs the program in the debugger so you can watch R15 change.
