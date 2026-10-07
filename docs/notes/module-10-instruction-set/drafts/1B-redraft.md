sideBySideLead: This figure runs the colder-room program on both machines from the start, so you can compare them.

The table "What a program can see" shows the PC, R2, R3 and the display on each machine, and marks a row "differs" where the two machines differ.

The table "What Module 9's machine keeps of its own" shows the controller's state, IR, HA, HB, HR and HM. Module 8's machine has none of these parts.

Press "Clock edge (Module 9's)" to move Module 9's machine one edge. When that edge ends an instruction, Module 8's machine also takes its one edge for the same instruction. Press "Next instruction" to make edges until the instruction ends. Press "Run until it stops" or "Start again".

The table "Instructions run" lists each instruction, the edges each machine takes, and whether the machines agree when the instruction ends.

construction: The instructions a program runs name some parts of the machine and not others. A register job names three registers. A load names a register and an address. A store writes a value into memory or a device. A branch reads two registers and may move the PC.

No field in any instruction can name HR, HA or the IR. So no instruction can read or write them.

Every machine that runs the same programs must agree, after every instruction, on the parts that instructions name. What it does with the other parts is its own choice.

faultPcen: **PCEN stuck at 1**

The machines differ after the first edge, on R2.

The controller still takes the load's 5 edges, FETCH to WRITE. But the PC moves on at every one of them. Each of those edges ends an instruction, so Module 8's machine runs one instruction for each.

Module 9's machine writes R2, -184, at the load's WRITE edge. By then its PC is at `014`, so it fetches the stop next and skips the four instructions between. R3 stays X on Module 9's machine. Its display shows 0, where Module 8's shows -250.

Module 8's machine halts at the stop, at `014`. Module 9's PC has moved to `018` when its machine halts. Every one of Module 8's 37 programs differs with this fault.
