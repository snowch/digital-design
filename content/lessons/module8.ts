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
