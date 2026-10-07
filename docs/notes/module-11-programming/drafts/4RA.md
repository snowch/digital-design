question: When `sumOver` calls `overBy`, it needs to keep its own return address safe. Here, the main program calls `sumOver` from `008`. `sumOver` calls `overBy` twice: once with room A's reading in R1, once with room B's reading in R2. It keeps what it needs between the calls in R10. The main program shows R1 on the display and stops. Room A reads -170 and room B -190. Each is 10 above its limit. The display should show 20.

lostLead: Predict what the display shows, then press "Run to the end".

lostAfter: The debugger cuts the run off after 5000 instructions. The display still shows 0. The problem: the call at `008` put `00C` into R15, the return address in the main program. When `sumOver` calls `overBy`, that call overwrites R15. After the second call at `030`, R15 holds `034` instead of `00C`. When `sumOver` does `goto R15` at `038`, it goes to `034`. Code there adds R10 to R1, then comes back to `038`. But R15 still holds `034`, so `goto R15` goes there again. Each time, R1 grows by 10. The run never goes back to the main program.

motivation: A function that calls another must keep its return address where a call cannot write it. It keeps it on a **stack**: words in RAM that a program takes back in reverse order. The last word put on is the first taken off.

R14 holds the address of the word last put on the stack.
- A push puts a word on: `R14 <= R14 - 8`, then `word[R14] <= R15`.
- A pop takes a word off: `R15 <= word[R14]`, then `R14 <= R14 + 8`.

The stack grows down from `7C0`, the first address past the RAM's last word. A program starts with `R14 <= 0x7C0`, so its first push writes `7B8`.

The new `sumOver` pushes R15 and R10 when it starts, and pops them in the opposite order before `goto R15`. The new main program also keeps a word of its own in R10 through the call: 1, ALARM's bit. It stores R10 to the lamps when the sum is not zero.

prediction: The figure shows the new program with its addresses. The main program calls `sumOver` from `010`. Make your prediction about what will happen. Choose an answer and press "Check my prediction". The listing shows what instruction each line becomes.

p1Question: While `overBy` runs for the first time, what does the word at `7B8` hold?

p1Explain: The word at `7B8` holds `014`: the address of the next instruction after the call at `010`. The call put `014` in R15. `sumOver`'s first push wrote R15 to `7B8`. The address `010` is where the call is, not the return address. `sumOver`'s second push wrote R10, which held 1, to `7B0`. When `sumOver` made its call to `overBy`, R15 became `044`. But `014` stays safe at `7B8`. The next figure runs the program so you can watch the pushes.
