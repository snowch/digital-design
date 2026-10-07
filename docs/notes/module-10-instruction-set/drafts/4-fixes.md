p1Explain: It stops at `008` with cause `21`. The word at `008` is `00000000`, kind 0: an illegal instruction. The display shows 66: both instructions ran. A word of all zeros is illegal on purpose: a program that runs off its end stops at the first word of zeros. If data followed the program in the ROM, the machine would run the data's words as instructions first.

construction: In the course's machine, kinds 9 to F are free: seven kinds. In your copy of Module 9's machine, kind 9 holds the call through a register, and kinds A to F are free. Every word of a free kind is illegal today.
