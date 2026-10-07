# Draft 3R, part 3, as returned

explanation: A number kept inside the instruction itself is what books call an **immediate**. It is there as soon as the instruction is read. The course's immediate is the 12-bit constant, read signed and widened to 64 bits.

The branch conditions test for less and not less, read signed or unsigned. With the two registers in order or swapped, they give all four comparisons: less, not less, greater, not greater.

The machine needs no job for "greater than". A program names the registers the other way round and uses the less test.

Each branch decides from one subtraction's flags. The swapped branch makes the other subtraction, so it has flags of its own.

generalisation: A number too wide for the constant can be kept as a word in the ROM. One load reads it, and it can be any 64-bit number.

Or a program builds it from jobs: sums of constants, each adding at most 2047, or doubling a register.

A number used once and not much wider than the constant can be built. A larger one, or one used in many places, is better kept as a word.

An instruction set's constant is a balance: it must fit in the instruction, and the course's memory was sized so that its 12 bits name every address.

reflection: Twelve bits name every address and reach every branch target in the ROM. The swap gives every comparison.

On the course's machine, kinds 0 and 9 to F name no instruction.

What does the machine do with an instruction's 32 bits that name no instruction? What else does the instruction set leave out, and what would each cost to add?

modelVsReality: The programs in this lesson's figures run on a model of the machine that runs one instruction at a time (lesson 1's). It leaves out the clock edges and the parts a program cannot see: the IR, the held words, the controller's state.

Many real machines have constants wider than 12 bits and memories far larger than 2 KB. On them, not every address fits in one instruction. A program builds a large address in several.

room-to-grow.question: On the course's machine, kinds 0 and 9 to F name no instruction. What does the machine do with an instruction's 32 bits that name no instruction? What else does the instruction set leave out, and what would each cost to add?

subtraction: Subtraction and flags
flagsSigned: {x} - {y}: MINUS {minus}, OVER {over}
flagsUnsigned: {x} - {y}: COUT {cout}
pairsCaption: Pairs of R1 and R2
askedCaption: R1 > R2 and each branch for each pair
pairHeading: R1 {a}, R2 {b}

## Checked

- room-to-grow.question: lost "Lesson 3 ended:", which says whose words it quotes; put back.
- Every other key carries its facts as given.
