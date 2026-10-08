// Copyright © 2026 Christopher Snow

// The comments in Module 13's texts of the whole machine: the course's text, the six joins its
// outline leaves out, and the lines that open the lab's two other starts. Drafted by the prose
// process from a brief of facts (docs/notes/module-13-machine/briefs, brief V3) and checked
// against the texts.

export const MACHINE13_WORDS = {
  textPc: "The PC, and the address the memory's one port reads",
  textMemory: "The memory: the ROM, the RAM and the devices",
  textIr: "The IR",
  textControl:
    "The control unit: the decoder, the system jobs, the mode, the controller and the trap logic",
  textRegisters: "The registers, and the words held between edges",
  textAlu: "The ALU and its inputs",
  textCregs: "The control registers",
  textY: "The word that register Y takes",
  textNext: "The next PC",
  joinUser: "JOIN: user mode, from C0",
  joinWaiting: "JOIN: the events waiting, from the memory",
  joinNoHandler: "JOIN: whether a handler is set, from the control registers",
  joinCause: "JOIN: the cause of a trap, from the trap logic",
  joinSet: "JOIN: set if's condition, as the word Y takes",
  joinTrap: "JOIN: where a trap's edge sends the PC",
  parts: [
    "Every part the course supplies is placed below, with all its ports and none joined.",
    "Join each port, inside its brackets, to a wire.",
    "The wires are declared above, named as the drawing names them.",
    "Write the small parts that go between them: the PC, the address the memory reads, the IR, the held words, USER and IE, TICK, WIDE, the ALU's two inputs, the word Y takes, the target and the next PC.",
  ],
  empty: [
    "Only the machine's ports are given.",
    "The parts the course supplies are memory, decoder, system, controller, traplogic, cregs, registers, alu and condition.",
    "The start from the parts lists their ports.",
  ],
} as const;
