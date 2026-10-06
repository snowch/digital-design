// Copyright © 2026 Christopher Snow

// Module 8's shared data: the datapath as SystemVerilog, which a learner reads and completes, and
// the programs the lessons run. The text uses the course's modules (packages/hdl:
// machine-modules.ts), which are built from the same parts as the drawn datapath, and
// module8.test.ts runs one suite through the text and the drawing alike.

/** The whole datapath's text, with `NEXT_PC` where the next PC is chosen. */
export function datapathText(nextPc: string): string {
  return `module datapath(
  input logic CLK,
  input logic RST,
  input logic DOOR,
  input logic WARM,
  input logic [63:0] SENSORA,
  input logic [63:0] SENSORB,
  output logic [63:0] PC,
  output logic HALT,
  output logic [7:0] CAUSE,
  output logic [63:0] DISPLAY,
  output logic [2:0] LAMPS
);
  logic [31:0] IR;
  logic [63:0] PC4, NEXT, TARGET, WIDE, QA, QB, ALUA, ALUB, RESULT, MQ, YIN;
  logic OP2, OP1, OP0, AZERO, BCONST, WRITEY, LOAD, STORE, BYTE, CALL, JUMP, BRANCH;
  logic [7:0] CAUSEF, CAUSED, CAUSEM;
  logic STOP, ZERO, MINUS, COUT, OVER, MET, GO, WREG;

  always_ff @(posedge CLK)
    if (RST) PC <= 64'h0;
    else if (GO) PC <= NEXT;
  assign PC4 = PC + 64'h4;

  memory mem (.PC(PC), .ADDR(RESULT), .D(QB), .LOAD(LOAD),
    .STORE(STORE), .BYTE(BYTE), .GO(GO), .RST(RST), .CLK(CLK), .DOOR(DOOR),
    .WARM(WARM), .SENSORA(SENSORA), .SENSORB(SENSORB), .IR(IR), .CAUSEF(CAUSEF),
    .MQ(MQ), .CAUSEM(CAUSEM), .DISPLAY(DISPLAY), .LAMPS(LAMPS));

  decoder dec (.K(IR[31:28]), .J(IR[27:24]), .OP2(OP2), .OP1(OP1),
    .OP0(OP0), .AZERO(AZERO), .BCONST(BCONST), .WRITEY(WRITEY), .LOAD(LOAD),
    .STORE(STORE), .BYTE(BYTE), .CALL(CALL), .JUMP(JUMP), .BRANCH(BRANCH),
    .STOP(STOP), .CAUSED(CAUSED));

  registers regs (.RA(IR[23:20]), .RB(IR[19:16]), .WA(IR[15:12]), .D(YIN),
    .WE(WREG), .CLK(CLK), .QA(QA), .QB(QB));

  always_comb
    case (IR[11])
      1'b0: WIDE = {52'h0, IR[11:0]};
      1'b1: WIDE = {52'hFFFFFFFFFFFFF, IR[11:0]};
    endcase

  always_comb
    case (AZERO)
      1'b0: ALUA = QA;
      1'b1: ALUA = 64'h0;
    endcase

  always_comb
    case (BCONST)
      1'b0: ALUB = QB;
      1'b1: ALUB = WIDE;
    endcase

  alu #(.N(64)) alu1 (.A(ALUA), .B(ALUB), .OP2(OP2), .OP1(OP1), .OP0(OP0),
    .Y(RESULT), .ZERO(ZERO), .MINUS(MINUS), .COUT(COUT), .OVER(OVER));

  always_comb begin
    YIN = RESULT;
    if (LOAD) YIN = MQ;
    if (CALL) YIN = PC4;
  end

  condition cond (.J(IR[27:24]), .ZERO(ZERO), .MINUS(MINUS), .COUT(COUT),
    .OVER(OVER), .MET(MET));

  assign TARGET = PC + {WIDE[61:0], 2'b00};

${nextPc}
  stops st (.CAUSEF(CAUSEF), .CAUSED(CAUSED), .CAUSEM(CAUSEM), .STOP(STOP),
    .WRITEY(WRITEY), .HALT(HALT), .CAUSE(CAUSE), .WREG(WREG), .GO(GO));
endmodule
`;
}

/** The part of the text a challenge asks for: the next PC, chosen from PC4, TARGET and RESULT. */
export const NEXT_PC = `  always_comb begin
    NEXT = PC4;
    if ((BRANCH & MET) | CALL) NEXT = TARGET;
    if (JUMP) NEXT = RESULT;
  end
`;

/** The whole datapath, as the course writes it. */
export const DATAPATH_TEXT = datapathText(NEXT_PC);

/** The constructs the datapath's text uses. */
export const DATAPATH_CONSTRUCTS = [
  "module",
  "ports",
  "logic",
  "vector",
  "assign",
  "op-bitwise",
  "op-arith",
  "select",
  "concat",
  "always_comb",
  "always_ff",
  "case",
  "if",
  "parameter",
  "instance",
];

/** docs/isa.md's worked example: which room is colder? */
export const COLDER = `R2 <= word[sensorA]
R3 <= word[sensorB]
if R2 < R3 signed goto show
R2 <= R3
show: word[display] <= R2
stop`;

// Lesson 8.1: the instruction's digits, and the register jobs' datapath written with instances.

/** The digits module's first lines, which the reference and the start share. */
const DIGITS_HEADER = `module digits(
  input logic [31:0] IR,
  output logic [3:0] K,
  output logic [3:0] J,
  output logic [3:0] A,
  output logic [3:0] B,
  output logic [3:0] Y,
  output logic [11:0] C
);`;

export const DIGITS_REFERENCE = `${DIGITS_HEADER}
  assign K = IR[31:28];
  assign J = IR[27:24];
  assign A = IR[23:20];
  assign B = IR[19:16];
  assign Y = IR[15:12];
  assign C = IR[11:0];
endmodule
`;

export const DIGITS_START = `${DIGITS_HEADER}
  assign K = IR[31:28];
  assign J = 4'h0;
  assign A = 4'h0;
  assign B = 4'h0;
  assign Y = 4'h0;
  assign C = 12'h000;
endmodule
`;

/** The register jobs' datapath's first lines, which the reference and the start share. */
const JOBS_HEADER = `module jobs(
  input logic CLK,
  input logic [31:0] IR,
  input logic WRITEY,
  output logic [63:0] RESULT
);
  logic [63:0] QA, QB;

  registers regs (.RA(IR[23:20]), .RB(IR[19:16]), .WA(IR[15:12]), .D(RESULT),
    .WE(WRITEY), .CLK(CLK), .QA(QA), .QB(QB));
`;

export const JOBS_REFERENCE = `${JOBS_HEADER}
  alu alu1 (.A(QA), .B(QB), .OP2(IR[26]), .OP1(IR[25]), .OP0(IR[24]), .Y(RESULT));
endmodule
`;

export const JOBS_START = `${JOBS_HEADER}
  assign RESULT = QA;
endmodule
`;

// Lesson 8.2: the constant widened to 64 bits, and the selector that gives the ALU's B input.

const WIDEN_HEADER = `module widen(
  input logic [11:0] C,
  output logic [63:0] W
);`;

export const WIDEN_REFERENCE = `${WIDEN_HEADER}
  always_comb
    case (C[11])
      1'b0: W = {52'h0, C};
      1'b1: W = {52'hFFFFFFFFFFFFF, C};
    endcase
endmodule
`;

export const WIDEN_START = `${WIDEN_HEADER}
  assign W = {52'h0, C};
endmodule
`;

const CONSTANTS_HEADER = `module constants(
  input logic CLK,
  input logic [31:0] IR,
  input logic WRITEY,
  input logic BCONST,
  output logic [63:0] RESULT
);
  logic [63:0] QA, QB, WIDE, ALUB;

  registers regs (.RA(IR[23:20]), .RB(IR[19:16]), .WA(IR[15:12]), .D(RESULT),
    .WE(WRITEY), .CLK(CLK), .QA(QA), .QB(QB));

  always_comb
    case (IR[11])
      1'b0: WIDE = {52'h0, IR[11:0]};
      1'b1: WIDE = {52'hFFFFFFFFFFFFF, IR[11:0]};
    endcase
`;

const CONSTANTS_ALU = `
  alu alu1 (.A(QA), .B(ALUB), .OP2(IR[26]), .OP1(IR[25]), .OP0(IR[24]), .Y(RESULT));
endmodule
`;

export const CONSTANTS_REFERENCE = `${CONSTANTS_HEADER}
  always_comb
    case (BCONST)
      1'b0: ALUB = QB;
      1'b1: ALUB = WIDE;
    endcase
${CONSTANTS_ALU}`;

export const CONSTANTS_START = `${CONSTANTS_HEADER}
  assign ALUB = QB;
${CONSTANTS_ALU}`;

// Lesson 8.3: the program counter, written as text.

const PC_HEADER = `module counter(
  input logic CLK,
  input logic RST,
  input logic GO,
  output logic [63:0] PC
);`;

export const PC_REFERENCE = `${PC_HEADER}
  always_ff @(posedge CLK)
    if (RST) PC <= 64'h0;
    else if (GO) PC <= PC + 64'h4;
endmodule
`;

export const PC_START = `${PC_HEADER}
  always_ff @(posedge CLK)
    PC <= PC + 64'h4;
endmodule
`;

const CHECKS_HEADER = `module checks(
  input logic [63:0] PC,
  output logic [7:0] CAUSEF
);`;

export const CHECKS_REFERENCE = `${CHECKS_HEADER}
  always_comb begin
    CAUSEF = 8'h00;
    if (PC[1:0] != 2'b00) CAUSEF = 8'h12;
    if (PC[63:10] != 54'h0) CAUSEF = 8'h11;
  end
endmodule
`;

export const CHECKS_START = `${CHECKS_HEADER}
  assign CAUSEF = 8'h00;
endmodule
`;

// Lesson 8.4: the memory checks as a module, and the datapath with its memory, written as text.

const MEMCHECK_HEADER = `module memcheck(
  input logic [63:0] ADDR,
  input logic LOAD,
  input logic STORE,
  input logic BYTE,
  output logic [7:0] CAUSEM
);`;

export const MEMCHECK_REFERENCE = `${MEMCHECK_HEADER}
  always_comb begin
    CAUSEM = 8'h00;
    if (STORE & (ADDR[10] == 1'b0)) CAUSEM = 8'h34;
    if (STORE & ((ADDR[10:3] == 8'hFA) | (ADDR[10:3] == 8'hFB) | (ADDR[10:3] == 8'hFC)))
      CAUSEM = 8'h34;
    if (BYTE & (ADDR[10:6] == 5'b11111)) CAUSEM = 8'h33;
    if (~BYTE & (ADDR[2:0] != 3'b000)) CAUSEM = 8'h33;
    if ((ADDR[63:11] != 53'h0) | (ADDR[10:3] == 8'hFF)) CAUSEM = 8'h31;
    if (~(LOAD | STORE)) CAUSEM = 8'h00;
  end
endmodule
`;

export const MEMCHECK_START = `${MEMCHECK_HEADER}
  always_comb begin
    CAUSEM = 8'h00;
    if ((ADDR[63:11] != 53'h0) | (ADDR[10:3] == 8'hFF)) CAUSEM = 8'h31;
    if (~(LOAD | STORE)) CAUSEM = 8'h00;
  end
endmodule
`;

/** The datapath of lesson 8.4, loads and stores but no branches, with `CHOICES` to complete. */
function memoryText(choices: string): string {
  return `module machine(
  input logic CLK,
  input logic RST,
  input logic [63:0] SENSORA,
  input logic [63:0] SENSORB,
  output logic [63:0] PC,
  output logic HALT,
  output logic [7:0] CAUSE,
  output logic [63:0] DISPLAY,
  output logic [2:0] LAMPS
);
  logic [31:0] IR;
  logic [63:0] PC4, WIDE, QA, QB, ALUA, ALUB, RESULT, MQ, YIN;
  logic OP2, OP1, OP0, AZERO, BCONST, WRITEY, LOAD, STORE, BYTE, STOP, GO, WREG;
  logic [7:0] CAUSEF, CAUSED, CAUSEM;

  always_ff @(posedge CLK)
    if (RST) PC <= 64'h0;
    else if (GO) PC <= PC4;
  assign PC4 = PC + 64'h4;

  memory mem (.PC(PC), .ADDR(RESULT), .D(QB), .LOAD(LOAD), .STORE(STORE),
    .BYTE(BYTE), .GO(GO), .RST(RST), .CLK(CLK), .DOOR(1'b0), .WARM(1'b0),
    .SENSORA(SENSORA), .SENSORB(SENSORB), .IR(IR), .CAUSEF(CAUSEF), .MQ(MQ),
    .CAUSEM(CAUSEM), .DISPLAY(DISPLAY), .LAMPS(LAMPS));

  decoder dec (.K(IR[31:28]), .J(IR[27:24]), .OP2(OP2), .OP1(OP1), .OP0(OP0),
    .AZERO(AZERO), .BCONST(BCONST), .WRITEY(WRITEY), .LOAD(LOAD), .STORE(STORE),
    .BYTE(BYTE), .STOP(STOP), .CAUSED(CAUSED));

  registers regs (.RA(IR[23:20]), .RB(IR[19:16]), .WA(IR[15:12]), .D(YIN),
    .WE(WREG), .CLK(CLK), .QA(QA), .QB(QB));

  always_comb
    case (IR[11])
      1'b0: WIDE = {52'h0, IR[11:0]};
      1'b1: WIDE = {52'hFFFFFFFFFFFFF, IR[11:0]};
    endcase

  always_comb
    case (BCONST)
      1'b0: ALUB = QB;
      1'b1: ALUB = WIDE;
    endcase

${choices}
  alu alu1 (.A(ALUA), .B(ALUB), .OP2(OP2), .OP1(OP1), .OP0(OP0), .Y(RESULT));

  stops st (.CAUSEF(CAUSEF), .CAUSED(CAUSED), .CAUSEM(CAUSEM), .STOP(STOP),
    .WRITEY(WRITEY), .HALT(HALT), .CAUSE(CAUSE), .WREG(WREG), .GO(GO));
endmodule
`;
}

export const MEMORY_REFERENCE = memoryText(`  always_comb
    case (AZERO)
      1'b0: ALUA = QA;
      1'b1: ALUA = 64'h0;
    endcase

  always_comb
    case (LOAD)
      1'b0: YIN = RESULT;
      1'b1: YIN = MQ;
    endcase
`);

export const MEMORY_START = memoryText(`  assign ALUA = QA;
  assign YIN = RESULT;
`);
