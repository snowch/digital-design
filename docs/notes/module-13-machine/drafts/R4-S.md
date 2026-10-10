pinNote: Press a wire to pin it: it keeps an orange halo as you open blocks, and its name and value show under the drawing, in hexadecimal for a word. A blue band marks the wires the next edge uses, along their whole length and with all their branches. It starts at each register, held word, memory or device the edge writes, and goes back along each selector's chosen input to where the value starts; it does not mark the address a store writes to, nor the input that chooses a selector's input, such as TRAP.
rowWire: Reads wire {wire}
romWire: Wire FETCHED carries this row's word only before a FETCH edge.
answers.details.traceCarry: Your row is {actual}. Pause at the ALU edge of `R3 <= R1 - R2`, open the ALU down to the group `q0`, and read the carry out of each slice's full adder, bit 3 first.
answers.details.joinHb: Open the datapath and follow HB back from where it leaves to the part that drives it.
answers.details.joinIr: Open the control unit and follow IR from where it enters to the part it goes into.
capUnknown: With room A at `{a}` and room B at `{b}`, your program reaches `{line}` at `{address}`, which reads {registers} before any instruction has written {them}: {why}
capUnknownThem.one: it
capUnknownThem.many: them
capUnknownWhy.address: the model cannot work out an address from a register that holds no value.
capUnknownWhy.branch: the model cannot decide a branch on a register that holds no value.
capUnknownWhy.jump: the model cannot jump to an address in a register that holds no value.
capUnknownWhy.control: the model cannot write a control register from a register that holds no value.
capLevels.carry: At the ALU edge of your first set if, open `datapath`, `alu`, `g0`, then `q1`, and read the carry out of each slice, bit 7 (the slice `bit3`) first.
