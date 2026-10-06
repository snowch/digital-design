// Copyright © 2026 Christopher Snow

// Module 9's shared data: the decoder, the controller and the machine of several edges an
// instruction as SystemVerilog, which a learner writes in parts and changes in the capstone, and
// the programs the lessons run. The machine's text uses the course's modules for Module 9
// (packages/hdl: machine9-modules.ts), built from the same parts as the drawn machine, and
// module9.test.ts runs Module 8's suite through the text against the reference.

import { decoderCircuit } from "@dd/dd-model";
import { Simulator, word } from "@dd/sim";

/** The control signals' names, in the order the decoder's text lists them. */
const SIGNALS = [
  "WRITEY",
  "LOAD",
  "STORE",
  "BYTE",
  "AZERO",
  "BCONST",
  "OP2",
  "OP1",
  "OP0",
  "BRANCH",
  "CALL",
  "JUMP",
  "MEM",
] as const;

/** The decoder's ports, which every text of it shares. */
export const DECODER_HEADER = `module decoder(
  input logic [3:0] K,
  input logic [3:0] J,
  input logic [11:0] C,
${SIGNALS.map((s) => `  output logic ${s},`).join("\n")}
  output logic STOP,
  output logic [7:0] CAUSED
);`;

/** The control signals' arms of the decoder's `case`, one kind a line. */
export const SIGNAL_ARMS: Readonly<Record<number, string>> = {
  1: "4'h1: begin WRITEY = 1'b1; OP2 = J[2]; OP1 = J[1]; OP0 = J[0]; end",
  2: "4'h2: begin WRITEY = 1'b1; BCONST = 1'b1; OP2 = J[2]; OP1 = J[1]; OP0 = J[0]; end",
  3: "4'h3: begin WRITEY = 1'b1; LOAD = 1'b1; MEM = 1'b1; BCONST = 1'b1; OP1 = 1'b1; AZERO = J[3]; BYTE = J[0]; end",
  4: "4'h4: begin STORE = 1'b1; MEM = 1'b1; BCONST = 1'b1; OP1 = 1'b1; AZERO = J[3]; BYTE = J[0]; end",
  5: "4'h5: begin BRANCH = 1'b1; OP1 = 1'b1; OP0 = 1'b1; end",
  6: "4'h6: begin WRITEY = 1'b1; CALL = 1'b1; end",
  7: "4'h7: begin JUMP = 1'b1; BCONST = 1'b1; OP1 = 1'b1; end",
};

/** The capstone's arm: a call through a register writes Y, adds RA and c, and is a call and a jump. */
export const CALL_REGISTER_ARM =
  "4'h9: begin WRITEY = 1'b1; BCONST = 1'b1; OP1 = 1'b1; CALL = 1'b1; JUMP = 1'b1; end";

/** The control signals as an `always_comb`: every signal 0, then the kind's arm sets its own. */
export function signalsBlock(arms: readonly string[]): string {
  return `  always_comb begin
${SIGNALS.map((s) => `    ${s} = 1'b0;`).join("\n")}
    case (K)
${arms.map((a) => `      ${a}`).join("\n")}
      default: WRITEY = 1'b0;
    endcase
  end`;
}

/** The check on a control register's number: 1 when C, read signed, is outside 0 to 4. */
export const OUTSIDE_EXPRESSION = "(C[11:3] != 9'h0) | (C[2] & (C[1] | C[0]))";

/** The illegal-instruction check, line by line, with the capstone's kind known when asked. */
export function illegalLines(callRegister = false): string[] {
  return [
    callRegister
      ? "(K == 4'h0) | (K[3] & (K != 4'h8) & (K != 4'h9))"
      : "(K == 4'h0) | (K[3] & (K != 4'h8))",
    "(((K == 4'h1) | (K == 4'h2) | (K == 4'h5)) & J[3])",
    "(((K == 4'h3) | (K == 4'h4)) & (J[2] | J[1]))",
    callRegister
      ? "(((K == 4'h6) | (K == 4'h7) | (K == 4'h9)) & (J != 4'h0))"
      : "(((K == 4'h6) | (K == 4'h7)) & (J != 4'h0))",
    "((K == 4'h8) & (J[3] | (J[2] & (J[1] | J[0]))))",
    `((K == 4'h8) & (J[3:1] == 3'b001) & (${OUTSIDE_EXPRESSION}))`,
  ];
}

/** The decoder's checks: ILLEGAL, the decode step's cause and STOP. */
export function checksBlock(callRegister = false): string {
  const lines = illegalLines(callRegister);
  return `  logic ILLEGAL;
  assign ILLEGAL = ${lines[0]}
${lines
  .slice(1)
  .map((l) => `    | ${l}`)
  .join("\n")};
  always_comb begin
    CAUSED = 8'h00;
    if ((K == 4'h8) & (J == 4'h0)) CAUSED = 8'h41;
    if (ILLEGAL) CAUSED = 8'h21;
  end
  assign STOP = (K == 4'h8) & (J != 4'h0) & ~J[3] & ~(J[2] & (J[1] | J[0]));`;
}

/** The whole decoder's text, as the course writes it. */
export function decoderText(callRegister = false): string {
  const arms = [1, 2, 3, 4, 5, 6, 7].map((k) => SIGNAL_ARMS[k] as string);
  return `${DECODER_HEADER}
${signalsBlock(callRegister ? [...arms, CALL_REGISTER_ARM] : arms)}
${checksBlock(callRegister)}
endmodule
`;
}

/** The controller's states, as an enumerated type with the codes the lessons give them. */
const STATE_TYPE =
  "typedef enum logic [2:0] {FETCH = 3'b000, READ = 3'b001, ALU = 3'b010, MEMORY = 3'b011, WRITE = 3'b100} state_t;";

/** READ's arm of the next-state logic: a call goes straight to WRITE, everything else to the ALU. */
export const READ_ARM = `      READ: begin
        if (CALL) next = WRITE;
        else next = ALU;
      end`;

/** The controller's next-state logic, with READ's arm given. */
export function nextStateBlock(readArm: string): string {
  return `  always_comb begin
    case (state)
      FETCH: next = READ;
${readArm}
      ALU: begin
        if (MEM) next = MEMORY;
        else if (WRITEY) next = WRITE;
        else next = FETCH;
      end
      MEMORY: begin
        if (WRITEY) next = WRITE;
        else next = FETCH;
      end
      default: next = FETCH;
    endcase
  end`;
}

/** The controller's output logic: each edge's signals from the state and the decoder's. */
export const OUTPUT_BLOCK = `  assign FETCHING = (state == FETCH);
  assign IREN = (state == FETCH) & GO;
  assign CHECKING = (state == READ);
  assign HOLDAB = (state == READ) & GO;
  assign HOLDR = (state == ALU) & GO;
  assign MLOAD = (state == MEMORY) & LOAD;
  assign MSTORE = (state == MEMORY) & STORE;
  assign HOLDM = (state == MEMORY) & LOAD & GO;
  assign WREG = (state == WRITE) & WRITEY & GO;
  assign PCEN = (next == FETCH) & GO;`;

/** The controller's per-edge outputs. */
export const EDGE_OUTPUTS = [
  "FETCHING",
  "IREN",
  "CHECKING",
  "HOLDAB",
  "HOLDR",
  "MLOAD",
  "MSTORE",
  "HOLDM",
  "WREG",
  "PCEN",
] as const;

/** The whole controller's text, as the course writes it. */
export function controllerText(): string {
  return `module controller(
  input logic CLK,
  input logic RST,
  input logic GO,
  input logic CALL,
  input logic MEM,
  input logic WRITEY,
  input logic LOAD,
  input logic STORE,
${EDGE_OUTPUTS.map((s) => `  output logic ${s},`).join("\n")}
  output logic [2:0] S
);
  ${STATE_TYPE}
  state_t state;
  state_t next;
  always_ff @(posedge CLK) begin
    if (RST) state <= FETCH;
    else if (GO) state <= next;
  end
${nextStateBlock(READ_ARM)}
${OUTPUT_BLOCK}
  assign S = state;
endmodule
`;
}

/** The machine's top module, which uses the decoder, the controller and the course's modules. */
export function machineTop(): string {
  return `module machine(
  input logic CLK,
  input logic RST,
  input logic DOOR,
  input logic WARM,
  input logic [63:0] SENSORA,
  input logic [63:0] SENSORB,
  output logic [63:0] PC,
  output logic [2:0] S,
  output logic HALT,
  output logic [7:0] CAUSE,
  output logic [63:0] DISPLAY,
  output logic [2:0] LAMPS
);
  logic [31:0] IR, FETCHED;
  logic [63:0] ADDR, QA, QB, HA, HB, HR, HM, WIDE, ALUA, ALUB, RESULT, MQ, YIN, PC4, NEXT, TARGET;
  logic WRITEY, LOAD, STORE, BYTE, AZERO, BCONST, OP2, OP1, OP0, BRANCH, CALL, JUMP, MEM, STOP;
  logic FETCHING, IREN, CHECKING, HOLDAB, HOLDR, MLOAD, MSTORE, HOLDM, WREG, PCEN, GO;
  logic ZERO, MINUS, COUT, OVER, MET;
  logic [7:0] CAUSED, CAUSEF, CAUSEM;

  always_ff @(posedge CLK)
    if (RST) PC <= 64'h0;
    else if (PCEN) PC <= NEXT;
  assign PC4 = PC + 64'h4;

  always_comb
    case (FETCHING)
      1'b0: ADDR = HR;
      1'b1: ADDR = PC;
    endcase

  memory mem (.ADDR(ADDR), .FETCHING(FETCHING), .LOAD(MLOAD), .STORE(MSTORE),
    .BYTE(BYTE), .D(HB), .GO(GO), .ENDS(PCEN), .RST(RST), .CLK(CLK), .DOOR(DOOR),
    .WARM(WARM), .SENSORA(SENSORA), .SENSORB(SENSORB), .FETCHED(FETCHED),
    .CAUSEF(CAUSEF), .MQ(MQ), .CAUSEM(CAUSEM), .DISPLAY(DISPLAY), .LAMPS(LAMPS));

  always_ff @(posedge CLK)
    if (RST) IR <= 32'h0;
    else if (IREN) IR <= FETCHED;

  decoder dec (.K(IR[31:28]), .J(IR[27:24]), .C(IR[11:0]), .WRITEY(WRITEY),
    .LOAD(LOAD), .STORE(STORE), .BYTE(BYTE), .AZERO(AZERO), .BCONST(BCONST),
    .OP2(OP2), .OP1(OP1), .OP0(OP0), .BRANCH(BRANCH), .CALL(CALL), .JUMP(JUMP),
    .MEM(MEM), .STOP(STOP), .CAUSED(CAUSED));

  controller ctl (.CLK(CLK), .RST(RST), .GO(GO), .CALL(CALL),
    .MEM(MEM), .WRITEY(WRITEY), .LOAD(LOAD), .STORE(STORE), .FETCHING(FETCHING), .IREN(IREN),
    .CHECKING(CHECKING), .HOLDAB(HOLDAB), .HOLDR(HOLDR), .MLOAD(MLOAD),
    .MSTORE(MSTORE), .HOLDM(HOLDM), .WREG(WREG), .PCEN(PCEN), .S(S));

  registers regs (.RA(IR[23:20]), .RB(IR[19:16]), .WA(IR[15:12]), .D(YIN),
    .WE(WREG), .CLK(CLK), .QA(QA), .QB(QB));

  always_ff @(posedge CLK)
    if (HOLDAB) begin
      HA <= QA;
      HB <= QB;
    end

  always_comb
    case (IR[11])
      1'b0: WIDE = {52'h0, IR[11:0]};
      1'b1: WIDE = {52'hFFFFFFFFFFFFF, IR[11:0]};
    endcase

  always_comb
    case (AZERO)
      1'b0: ALUA = HA;
      1'b1: ALUA = 64'h0;
    endcase

  always_comb
    case (BCONST)
      1'b0: ALUB = HB;
      1'b1: ALUB = WIDE;
    endcase

  alu #(.N(64)) alu1 (.A(ALUA), .B(ALUB), .OP2(OP2), .OP1(OP1), .OP0(OP0),
    .Y(RESULT), .ZERO(ZERO), .MINUS(MINUS), .COUT(COUT), .OVER(OVER));

  always_ff @(posedge CLK)
    if (HOLDR) HR <= RESULT;

  always_ff @(posedge CLK)
    if (HOLDM) HM <= MQ;

  always_comb begin
    YIN = HR;
    if (LOAD) YIN = HM;
    if (CALL) YIN = PC4;
  end

  condition cond (.J(IR[27:24]), .ZERO(ZERO), .MINUS(MINUS), .COUT(COUT),
    .OVER(OVER), .MET(MET));

  assign TARGET = PC + {WIDE[61:0], 2'b00};

  always_comb begin
    NEXT = PC4;
    if ((BRANCH & MET) | CALL) NEXT = TARGET;
    if (JUMP) NEXT = RESULT;
  end

  stops st (.CAUSEF(CAUSEF), .CAUSED(CAUSED), .CAUSEM(CAUSEM), .STOP(STOP),
    .CHECKING(CHECKING), .HALT(HALT), .CAUSE(CAUSE), .GO(GO));
endmodule
`;
}

/** The whole machine as text: the top, the controller and the decoder. */
export function machineText(callRegister = false): string {
  return `${machineTop()}
${controllerText()}
${decoderText(callRegister)}`;
}

/** The constructs the machine's text uses. */
export const MACHINE9_CONSTRUCTS = [
  "module",
  "ports",
  "logic",
  "vector",
  "assign",
  "op-bitwise",
  "op-arith",
  "op-compare",
  "select",
  "concat",
  "always_comb",
  "always_ff",
  "case",
  "if",
  "enum",
  "parameter",
  "instance",
];

// The programs the lessons run.

/** docs/isa.md's worked example: which room is colder? */
export const COLDER = `R2 <= word[sensorA]
R3 <= word[sensorB]
if R2 < R3 signed goto show
R2 <= R3
show: word[display] <= R2
stop`;

/** The office's margin, stored to the display: Module 8's register and constant jobs, a store. */
export const MARGIN = `R1 <= -184
R2 <= -250
R3 <= R1 - R2
word[display] <= R3
stop`;

// Lesson 9.1: the control signals as text.

/** The control signals of lesson 9.1, without the controller's MEM, which lesson 9.3 adds. */
export const SIGNALS_9_1 = SIGNALS.filter((s) => s !== "MEM");

/** The module of lesson 9.1's challenge: K and J in, the twelve control signals out. */
export function signalsModule(kinds: readonly number[]): string {
  return `module signals(
  input logic [3:0] K,
  input logic [3:0] J,
${SIGNALS_9_1.map((s, i) => `  output logic ${s}${i === SIGNALS_9_1.length - 1 ? "" : ","}`).join("\n")}
);
  always_comb begin
${SIGNALS_9_1.map((s) => `    ${s} = 1'b0;`).join("\n")}
    case (K)
${kinds.map((k) => `      ${(SIGNAL_ARMS[k] as string).replace(" MEM = 1'b1;", "")}`).join("\n")}
      default: WRITEY = 1'b0;
    endcase
  end
endmodule
`;
}

/** Lesson 9.1's construction: WRITEY and BCONST from K, one comparison a kind. */
const WRITES_HEADER = `module writes(
  input logic [3:0] K,
  output logic WRITEY,
  output logic BCONST
);`;

export const WRITES_START = `${WRITES_HEADER}
  assign WRITEY = 1'b0;
  assign BCONST = 1'b0;
endmodule
`;

export const WRITES_REFERENCE = `${WRITES_HEADER}
  assign WRITEY = (K == 4'h1) | (K == 4'h2) | (K == 4'h3) | (K == 4'h6);
  assign BCONST = (K == 4'h2) | (K == 4'h3) | (K == 4'h4) | (K == 4'h7);
endmodule
`;

// Lesson 9.2: the checks as text.

const OUTSIDE_HEADER = `module outside(
  input logic [11:0] C,
  output logic OUTSIDE
);`;

/** Lesson 9.2's construction's start: reads only the low three bits, so -1 and 8 pass. */
export const OUTSIDE_START = `${OUTSIDE_HEADER}
  assign OUTSIDE = C[2] & (C[1] | C[0]);
endmodule
`;

export const OUTSIDE_REFERENCE = `${OUTSIDE_HEADER}
  assign OUTSIDE = ${OUTSIDE_EXPRESSION};
endmodule
`;

const CHECKS_HEADER = `module checks(
  input logic [3:0] K,
  input logic [3:0] J,
  input logic [11:0] C,
  output logic ILLEGAL
);`;

/** Lesson 9.2's challenge's start: only the kinds the machine does not know. */
export const CHECKS_START = `${CHECKS_HEADER}
  assign ILLEGAL = ${illegalLines()[0]};
endmodule
`;

export const CHECKS_REFERENCE = `${CHECKS_HEADER}
  assign ILLEGAL = ${illegalLines()[0]}
${illegalLines()
  .slice(1)
  .map((l) => `    | ${l}`)
  .join("\n")};
endmodule
`;

// Tests read off the decoder's own circuit.

/** An instruction's digits a test gives the decoder, and its label. */
export interface DecoderCase {
  readonly label: string;
  readonly K: number;
  readonly J: number;
  readonly C?: number;
}

/**
 * A combinational test for each case: the inputs a challenge's module has of K, J and C, and the
 * outputs it names, each expected as the drawn decoder gives it (`ILLEGAL` is CAUSED's 21).
 */
export function decoderVectors(
  cases: readonly DecoderCase[],
  inputs: readonly ("K" | "J" | "C")[],
  outputs: readonly string[],
  callThroughRegister = false,
) {
  const sim = new Simulator(decoderCircuit({ callThroughRegister }));
  return cases.map((c) => {
    sim.setInput("K", word(4, c.K));
    sim.setInput("J", word(4, c.J));
    sim.setInput("C", word(12, c.C ?? 0));
    sim.settle();
    const out = sim.outputs();
    const value = (n: string) =>
      n === "ILLEGAL" ? (out["CAUSED"]?.value === 0x21n ? 1 : 0) : Number(out[n]?.value ?? 0n);
    const given = { K: c.K, J: c.J, C: c.C ?? 0 };
    return {
      label: c.label,
      inputs: Object.fromEntries(inputs.map((n) => [n, given[n]])),
      expect: Object.fromEntries(outputs.map((n) => [n, value(n)])),
    };
  });
}

const hex = (n: number, digits: number) => n.toString(16).toUpperCase().padStart(digits, "0");

/** Every kind and job, with the constant given, labelled by the instruction's first two digits. */
export function everyKindAndJob(c = 0): DecoderCase[] {
  return Array.from({ length: 256 }, (_, n) => ({
    label: `K ${hex(n >> 4, 1)}, J ${hex(n & 15, 1)}`,
    K: n >> 4,
    J: n & 15,
    C: c,
  }));
}

// Lesson 9.3: the memory's address and the instruction register, and the controller's states.

const FETCHPORT_HEADER = `module fetchport(
  input logic CLK,
  input logic RST,
  input logic FETCHING,
  input logic IREN,
  input logic [63:0] PC,
  input logic [63:0] HR,
  input logic [31:0] FETCHED,
  output logic [63:0] ADDR,
  output logic [31:0] IR
);`;

/** The start: Module 8's way, one address and the IR a bus. */
export const FETCHPORT_START = `${FETCHPORT_HEADER}
  assign ADDR = PC;
  assign IR = FETCHED;
endmodule
`;

export const FETCHPORT_REFERENCE = `${FETCHPORT_HEADER}
  always_comb
    case (FETCHING)
      1'b0: ADDR = HR;
      1'b1: ADDR = PC;
    endcase
  always_ff @(posedge CLK)
    if (RST) IR <= 32'h0;
    else if (IREN) IR <= FETCHED;
endmodule
`;

/** The controller's ports, for lesson 9.3: its next state from CALL, MEM and WRITEY, and GO. */
const STATES_HEADER = `module controller(
  input logic CLK,
  input logic RST,
  input logic GO,
  input logic CALL,
  input logic MEM,
  input logic WRITEY,
  output logic [2:0] S
);
  ${STATE_TYPE}
  state_t state;
  state_t next;
  always_ff @(posedge CLK) begin
    if (RST) state <= FETCH;
    else if (GO) state <= next;
  end`;

/** The start: every instruction takes the same four edges, and the memory's state is never used. */
export const STATES_START = `${STATES_HEADER}
  always_comb begin
    case (state)
      FETCH: next = READ;
      READ: next = ALU;
      ALU: next = WRITE;
      default: next = FETCH;
    endcase
  end
  assign S = state;
endmodule
`;

export const STATES_REFERENCE = `${STATES_HEADER}
${nextStateBlock(READ_ARM)}
  assign S = state;
endmodule
`;

// Lesson 9.4: the output logic.

const OUTPUTS_HEADER = `module outputs(
  input logic [2:0] S,
  input logic GO,
  input logic MEM,
  input logic WRITEY,
  input logic LOAD,
  input logic STORE,
${EDGE_OUTPUTS.map((s, i) => `  output logic ${s}${i === EDGE_OUTPUTS.length - 1 ? "" : ","}`).join("\n")}
);`;

/** The start: the fetch's signals alone. */
export const OUTPUTS_START = `${OUTPUTS_HEADER}
  assign FETCHING = (S == 3'b000);
  assign IREN = (S == 3'b000) & GO;
${EDGE_OUTPUTS.filter((s) => s !== "FETCHING" && s !== "IREN")
  .map((s) => `  assign ${s} = 1'b0;`)
  .join("\n")}
endmodule
`;

export const OUTPUTS_REFERENCE = `${OUTPUTS_HEADER}
  logic ENDS;
  assign FETCHING = (S == 3'b000);
  assign IREN = (S == 3'b000) & GO;
  assign CHECKING = (S == 3'b001);
  assign HOLDAB = (S == 3'b001) & GO;
  assign HOLDR = (S == 3'b010) & GO;
  assign MLOAD = (S == 3'b011) & LOAD;
  assign MSTORE = (S == 3'b011) & STORE;
  assign HOLDM = (S == 3'b011) & LOAD & GO;
  assign WREG = (S == 3'b100) & WRITEY & GO;
  assign ENDS = (S == 3'b100) | ((S == 3'b011) & ~WRITEY) | ((S == 3'b010) & ~MEM & ~WRITEY);
  assign PCEN = ENDS & GO;
endmodule
`;

/** The output logic's rule, as the lesson states it, for the challenge's tests. */
export function edgeOutputs(
  state: "FETCH" | "READ" | "ALU" | "MEMORY" | "WRITE",
  s: { GO: number; MEM: number; WRITEY: number; LOAD: number; STORE: number },
): Record<string, number> {
  const is = (x: string) => (state === x ? 1 : 0);
  const ends =
    is("WRITE") | (is("MEMORY") & (1 - s.WRITEY)) | (is("ALU") & (1 - s.MEM) & (1 - s.WRITEY));
  return {
    FETCHING: is("FETCH"),
    IREN: is("FETCH") & s.GO,
    CHECKING: is("READ"),
    HOLDAB: is("READ") & s.GO,
    HOLDR: is("ALU") & s.GO,
    MLOAD: is("MEMORY") & s.LOAD,
    MSTORE: is("MEMORY") & s.STORE,
    HOLDM: is("MEMORY") & s.LOAD & s.GO,
    WREG: is("WRITE") & s.WRITEY & s.GO,
    PCEN: ends & s.GO,
  };
}

// Lesson 9.5: the capstone's program, a call through a register.

/** The office chooses at run time which room's reading to show: R4 holds the routine's address. */
export const CHOOSE = `R4 <= showA
call R4, R15
stop
showA: R2 <= word[sensorA]
word[display] <= R2
goto R15
showB: R2 <= word[sensorB]
word[display] <= R2
goto R15`;
