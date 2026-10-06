// Copyright © 2026 Christopher Snow

export * from "./latches";
export * from "./flipflop";
export * from "./register";
export * from "./reference";
export * from "./faults";
export * from "./library";
export * from "./bits";
export * from "./signals";
export * from "./graders";
export * from "./measure";
export * from "./tables";
export * from "./logic";
// Module 3: combinational blocks and the chain a slice is tested in.
export * from "./combinational";
export * from "./chain";
// Module 5: state machines as data, the course's machines, and the counter's block.
export * from "./fsm";
export * from "./machines";
export { addOne, counterCircuit, nowPrevCircuit, swapCircuit } from "./library-module5";
// Module 6: memories, as gates and as components.
export * from "./memory";
export { FILLED_BYTES } from "./library-memory";
// Module 7, the ALU: eight jobs, four flags, any width, and its generated test suite.
export * from "./alu";
export * from "./testcases";
// Module 8, the datapath: the machine's instructions in bigints, and programs as data.
export * from "./machine";
export * from "./assemble";
export * from "./datapath";
export * from "./datapath-run";
export * from "./machine-suite";
