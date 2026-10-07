investigation: Compare how the same instruction is laid out in two ways, for six instructions. Take any word apart and run the ALU.

explorerLead: Type a word of eight hexadecimal digits, or choose one below the box. The figure breaks the word into fields and shows what the machine makes of it. It also shows the constant widened to 64 bits, the way the machine widens it. Below is a calculator that runs the ALU from Module 7 at 16 or 64 bits. Type A and B as signed numbers or in hexadecimal, choose a job, and the calculator gives Y in bits, in hexadecimal, unsigned, and signed, plus the four flags: ZERO, MINUS, COUT and OVER. Press "Take the job and B from the word" to extract the job from the J field of a register or constant job. For a constant job, it also sets B to the widened constant.

packedReadLead: The course's machine always reads every word in the course's layout. What does it make of a word when it is written in the packed layout instead? The figure shows three packed words for you to try:
- `22120064`: R2 ← R1 + 100
- `380207D8`: R2 ← memory[`7D8`]
- `60F00001`: R15 ← PC + 4 and PC ← PC + 4 × 1, a call

Choose each word. Before you do, predict which register the course's machine will write to.
