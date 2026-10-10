// Copyright © 2026 Christopher Snow

// Module 13, the whole machine: the programs the lessons run, in the course's assembly
// (docs/isa.md), on Module 13's final machine (`MODULE_13`, library id `machine-final`), which
// knows the two instructions the learner added: the call through a register at kind 9 and set if
// at kind A. Each lesson's facts test pins the numbers its prose states.

import { machine13Modules } from "@dd/hdl";

import { MACHINE13_WORDS as W } from "./module13.words";

/**
 * The shop's last program: Module 0's first program, the gap between the two rooms on the display
 * and CLASH when room A is 10.0 degrees or more warmer, written for the whole machine. Set if
 * replaces Module 0's branch; the gap reaches the display through a call through a register and a
 * system call, whose handler offers one job.
 */
export const SHOP = `// The gap between the rooms, and CLASH, on the whole machine.
        R1 <= handler
        C4 <= R1                // the handler's address
        R1 <= word[sensorA]
        R2 <= word[sensorB]
        R3 <= R1 - R2           // the gap, room A minus room B
        R4 <= 100
        R5 <= R3 >= R4 signed   // set if: 1 when room A is 10.0 degrees warmer or more
        R5 <= R5 + R5
        R5 <= R5 + R5           // CLASH is bit 2
        word[lamps] <= R5
        R6 <= show
        call R6, R15            // a call through a register
        stop
show:   R1 <= 1                 // job 1: show R2
        R2 <= R3
        call system
        goto R15
handler: word[display] <= R2
        resume`;

/** Module 0's readings: room A at -18.4 degrees, room B at -25.0. */
export const SHOP_INPUTS = { SENSORA: -184, SENSORB: -250 } as const;

// ---------------------------------------------------------------------------------------------
// 13.4 the lab: the whole machine as text.

/** The top module's ports, which every way into the lab shares. */
export const MACHINE13_HEADER = `module machine(
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
);`;

/** The wires between the parts, as the reference names them. */
export const MACHINE13_WIRES = `  logic [31:0] IR, FETCHED;
  logic [63:0] ADDR, QA, QB, HA, HB, HR, HM, WIDE, ALUA, ALUB, RESULT, MQ;
  logic [63:0] YIN, PC4, NEXT, NEXTT, TARGET, CWORD, C2, C4;
  logic WRITEY, LOAD, STORE, BYTE, AZERO, BCONST, OP2, OP1, OP0, BRANCH, CALL, JUMP, MEM, SET, STOP;
  logic RESUME, CREAD, CWRITE, CREG, HALTJOB, WRITEYT, USER, IE, NOHANDLER;
  logic FETCHING, IREN, CHECKING, HOLDAB, HOLDR, MLOAD, MSTORE, HOLDM, WREG, PCEN, CWEN, RESUMING;
  logic GO, TRAP, TICK, ZERO, MINUS, COUT, OVER, MET;
  logic [7:0] CAUSED, CAUSET, CAUSEF, CAUSEM;
  logic [1:0] STATUS, WAITING;`;

/**
 * The final machine as text: the course's parts joined, with the small parts between them
 * written out. Each line marked `JOIN` is one the guided start leaves out.
 */
export const MACHINE13_TEXT = `${MACHINE13_HEADER}
${MACHINE13_WIRES}

  // ${W.textPc}
  always_ff @(posedge CLK)
    if (RST) PC <= 64'h0;
    else if (PCEN) PC <= NEXTT;
  assign PC4 = PC + 64'h4;
  always_comb
    case (FETCHING)
      1'b0: ADDR = HR;
      1'b1: ADDR = PC;
    endcase

  // ${W.textMemory}
  assign TICK = PCEN & GO;
  memory mem (.ADDR(ADDR), .FETCHING(FETCHING), .LOAD(MLOAD), .STORE(MSTORE), .BYTE(BYTE),
    .D(HB), .GO(GO), .ENDS(PCEN), .TICK(TICK), .USER(USER), .RST(RST), .CLK(CLK),
    .DOOR(DOOR), .WARM(WARM), .SENSORA(SENSORA), .SENSORB(SENSORB), .FETCHED(FETCHED),
    .CAUSEF(CAUSEF), .MQ(MQ), .CAUSEM(CAUSEM), .DISPLAY(DISPLAY), .LAMPS(LAMPS),
    .WAITING(WAITING));

  // ${W.textIr}
  always_ff @(posedge CLK)
    if (RST) IR <= 32'h0;
    else if (IREN) IR <= FETCHED;

  // ${W.textControl}
  decoder dec (.K(IR[31:28]), .J(IR[27:24]), .C(IR[11:0]), .WRITEY(WRITEY), .LOAD(LOAD),
    .STORE(STORE), .BYTE(BYTE), .AZERO(AZERO), .BCONST(BCONST), .OP2(OP2), .OP1(OP1),
    .OP0(OP0), .BRANCH(BRANCH), .CALL(CALL), .JUMP(JUMP), .MEM(MEM), .SET(SET), .STOP(STOP),
    .CAUSED(CAUSED));
  assign USER = ~STATUS[0];  // ${W.joinUser}
  assign IE = STATUS[1];
  system sys (.STOP(STOP), .J(IR[27:24]), .USER(USER), .CAUSED(CAUSED), .WRITEY(WRITEY),
    .RESUME(RESUME), .CREAD(CREAD), .CWRITE(CWRITE), .CREG(CREG), .HALTJOB(HALTJOB),
    .CAUSET(CAUSET), .WRITEYT(WRITEYT));
  controller ctl (.CLK(CLK), .RST(RST), .GO(GO), .TRAP(TRAP), .CALL(CALL), .CREG(CREG),
    .MEM(MEM), .LOAD(LOAD), .STORE(STORE), .WRITEY(WRITEYT), .CWRITE(CWRITE), .RESUME(RESUME),
    .S(S), .CHECKING(CHECKING), .FETCHING(FETCHING), .IREN(IREN), .HOLDAB(HOLDAB),
    .HOLDR(HOLDR), .MLOAD(MLOAD), .MSTORE(MSTORE), .HOLDM(HOLDM), .WREG(WREG), .PCEN(PCEN),
    .CWEN(CWEN), .RESUMING(RESUMING));
  traplogic tl (.CAUSEF(CAUSEF), .CAUSED(CAUSET), .CAUSEM(CAUSEM), .STOP(HALTJOB),
    .CHECKING(CHECKING), .FETCHING(FETCHING),
    .WAITING(WAITING),  // ${W.joinWaiting}
    .IE(IE),
    .NOHANDLER(NOHANDLER),  // ${W.joinNoHandler}
    .HALT(HALT), .CAUSE(CAUSE), .GO(GO), .TRAP(TRAP));

  // ${W.textRegisters}
  registers regs (.RA(IR[23:20]), .RB(IR[19:16]), .WA(IR[15:12]), .D(YIN), .WE(WREG),
    .CLK(CLK), .QA(QA), .QB(QB));
  always_ff @(posedge CLK)
    if (HOLDAB) begin
      HA <= QA;
      HB <= QB;
    end

  // ${W.textAlu}
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
  alu #(.N(64)) alu1 (.A(ALUA), .B(ALUB), .OP2(OP2), .OP1(OP1), .OP0(OP0), .Y(RESULT),
    .ZERO(ZERO), .MINUS(MINUS), .COUT(COUT), .OVER(OVER));
  always_ff @(posedge CLK)
    if (HOLDR) HR <= RESULT;
  always_ff @(posedge CLK)
    if (HOLDM) HM <= MQ;

  // ${W.textCregs}
  cregs cr (.HA(HA), .C(IR[11:0]), .PC(PC), .PC4(PC4),
    .CAUSE(CAUSE),  // ${W.joinCause}
    .TRAP(TRAP), .RESUMING(RESUMING), .CWEN(CWEN), .RST(RST), .CLK(CLK), .CWORD(CWORD),
    .C2(C2), .C4(C4), .STATUS(STATUS), .NOHANDLER(NOHANDLER));

  // ${W.textY}
  condition cond (.J(IR[27:24]), .ZERO(ZERO), .MINUS(MINUS), .COUT(COUT), .OVER(OVER),
    .MET(MET));
  always_comb begin
    YIN = HR;
    if (LOAD) YIN = HM;
    if (CALL) YIN = PC4;
    if (CREAD) YIN = CWORD;
    if (SET) YIN = {63'h0, MET};  // ${W.joinSet}
  end

  // ${W.textNext}
  assign TARGET = PC + {WIDE[61:0], 2'b00};
  always_comb begin
    NEXT = PC4;
    if ((BRANCH & MET) | CALL) NEXT = TARGET;
    if (JUMP) NEXT = RESULT;
  end
  always_comb begin
    NEXTT = NEXT;
    if (RESUME) NEXTT = C2;
    if (TRAP) NEXTT = C4;  // ${W.joinTrap}
  end
endmodule
`;

/** The constructs the machine's text uses: Module 9's. */
export const MACHINE13_CONSTRUCTS = [
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
  "parameter",
  "instance",
];

/** The lab's tests: programs, each reaching some joins, run against the model. */
export const LAB_PROGRAMS = [
  {
    id: "shop",
    source: SHOP,
    inputs: { sensorA: -184, sensorB: -250 },
  },
  {
    id: "user",
    source: `// A program in user mode reads a sensor, which user mode refuses.
        R1 <= handler
        C4 <= R1
        R1 <= 0
        C1 <= R1                // user mode, interrupts off
        R1 <= program
        C2 <= R1
        resume
handler: R5 <= C3
        word[display] <= R5
        stop
program: R2 <= word[sensorA]
        word[display] <= R2
        stop`,
    inputs: { sensorA: -184, sensorB: 0 },
  },
  {
    id: "timer",
    source: `// The timer interrupts a count, after a system call.
        R1 <= handler
        C4 <= R1
        R1 <= 4
        word[timer] <= R1
        R1 <= 3
        C0 <= R1                // system mode, interrupts on
        call system             // a trap: no instruction finishes at its edge
        R2 <= 0
        R2 <= R2 + 1
        R2 <= R2 + 1
        R2 <= R2 + 1
        stop
handler: R5 <= C3
        R6 <= 0x41
        if R5 == R6 goto back
        word[display] <= R5
        stop
back:   resume`,
    inputs: {},
  },
  {
    id: "door",
    source: `// The door opens while the program counts; the handler shows why it was called.
        R1 <= handler
        C4 <= R1
        R1 <= 3
        C0 <= R1                // system mode, interrupts on
        R2 <= 0
        R2 <= R2 + 1
        R2 <= R2 + 1
        stop
handler: R5 <= C3
        word[display] <= R5
        stop`,
    inputs: {},
    door: 5,
  },
  {
    id: "bits",
    source: `// Signs, a set if that holds, an unsigned comparison, an overflow, a byte, DOOR and WARM,
// and a call to a label above it.
        R1 <= -5
        R2 <= 3
        R3 <= R1 < R2 signed     // holds: R3 takes 1
        R4 <= R1 < R2 unsigned   // -5 read unsigned is large: R4 takes 0
        R8 <= word[least]
        R9 <= R8 < R2 signed     // the subtraction overflows; the least word is the less: 1
        R5 <= word[signals]      // DOOR and WARM
        byte[0x400] <= R1
        R6 <= byte[0x400]
        word[display] <= R6
        goto ahead
twice:  R10 <= R2 + R2           // reached only by the call below
        goto R15
ahead:  call twice, R15          // a call to a label above it: its constant is negative
        stop
least:  word -9223372036854775808`,
    inputs: {},
    warm: 1,
  },
  {
    id: "refused",
    source: `// A system job in user mode: user mode refuses stop, and the handler shows why.
        R1 <= handler
        C4 <= R1
        R1 <= 0
        C1 <= R1                // user mode, interrupts off
        R1 <= program
        C2 <= R1
        resume
handler: R5 <= C3
        word[display] <= R5
        stop
program: stop`,
    inputs: {},
  },
  {
    id: "rom",
    source: `// A store to the ROM, with no handler.
        R1 <= 7
        word[0x010] <= R1
        word[display] <= R1
        stop`,
    inputs: {},
  },
] as const;

/** The guided start: the reference with its six joins left out, each marked. */
export function guidedStart(): string {
  const joins: readonly (readonly [string, string])[] = [
    [`assign USER = ~STATUS[0];  // ${W.joinUser}`, `assign USER = 1'b0;  // ${W.joinUser}`],
    [`.WAITING(WAITING),  // ${W.joinWaiting}`, `.WAITING(2'b00),  // ${W.joinWaiting}`],
    [`.NOHANDLER(NOHANDLER),  // ${W.joinNoHandler}`, `.NOHANDLER(1'b0),  // ${W.joinNoHandler}`],
    [`.CAUSE(CAUSE),  // ${W.joinCause}`, `.CAUSE(8'h00),  // ${W.joinCause}`],
    [`if (SET) YIN = {63'h0, MET};  // ${W.joinSet}`, `// ${W.joinSet}`],
    [`if (TRAP) NEXTT = C4;  // ${W.joinTrap}`, `// ${W.joinTrap}`],
  ];
  let text = MACHINE13_TEXT;
  for (const [from, to] of joins) {
    if (!text.includes(from)) throw new Error(`module13: no ${JSON.stringify(from)} to leave out`);
    text = text.replace(from, to);
  }
  return text;
}

/** The parts the course supplies, in the order the machine's text places them, by instance. */
const LAB_PARTS: readonly (readonly [string, string, string])[] = [
  ["memory", "", "mem"],
  ["decoder", "", "dec"],
  ["system", "", "sys"],
  ["controller", "", "ctl"],
  ["traplogic", "", "tl"],
  ["registers", "", "regs"],
  ["alu", " #(.N(64))", "alu1"],
  ["cregs", "", "cr"],
  ["condition", "", "cond"],
];

/** One part's instance with every port listed and none joined, wrapped as the text wraps. */
function emptyInstance(module: string, parameters: string, name: string): string {
  const ports = machine13Modules({})[module]?.ports({ N: 64 });
  if (!ports) throw new Error(`module13: no part ${module}`);
  const names = [...Object.keys(ports.inputs), ...Object.keys(ports.outputs)];
  const lines: string[] = [];
  let line = `  ${module}${parameters} ${name} (`;
  names.forEach((n, k) => {
    const piece = `.${n}()${k === names.length - 1 ? ");" : ","}`;
    if (line.length + piece.length + 1 > 98) {
      lines.push(line.trimEnd());
      line = "    ";
    }
    line += `${line.endsWith("(") || line === "    " ? "" : " "}${piece}`;
  });
  lines.push(line);
  return lines.join("\n");
}

/** The parts start: the ports and the wires, every part placed with no port joined. */
export function partsStart(): string {
  return `${MACHINE13_HEADER}
${MACHINE13_WIRES}

${W.parts.map((c) => `  // ${c}`).join("\n")}
${LAB_PARTS.map(([m, p, n]) => emptyInstance(m, p, n)).join("\n")}
endmodule
`;
}

/** The empty start: the machine's ports alone. */
export function emptyStart(): string {
  return `${MACHINE13_HEADER}
${W.empty.map((c) => `  // ${c}`).join("\n")}
endmodule
`;
}

// ---------------------------------------------------------------------------------------------
// 13.5 the capstone: a program of the learner's own, traced.

/** The capstone's figures' program, not the challenge's task: CLASH when room B is colder. */
export const CAPSTONE_SAMPLE = `// Is room A less than 10.0 degrees warmer than room B? The display shows 1 if so.
        R1 <= word[sensorA]
        R2 <= word[sensorB]
        R3 <= R1 - R2            // the gap, room A minus room B
        R4 <= word[limit]        // 10.0 degrees
        R5 <= R3 < R4 signed     // set if: 1 when the gap is less than the limit
        word[display] <= R5
        stop
limit:  word 100`;

/** A program that does the capstone's task: how many rooms are colder than -20.0 degrees. */
export const CAPSTONE_REFERENCE = `// How many rooms are colder than -20.0 degrees, and ALARM when both are.
        R1 <= word[sensorA]
        R2 <= word[sensorB]
        R6 <= -200
        R3 <= R1 < R6 signed     // 1 when room A is colder than -20.0 degrees
        R4 <= R2 < R6 signed     // 1 when room B is
        R5 <= R3 + R4            // how many: 0, 1 or 2
        word[display] <= R5
        R7 <= R3 & R4            // ALARM when both are
        word[lamps] <= R7
        stop`;

/** The capstone's tests of the program: the rooms' readings, and what the task asks for. */
export const CAPSTONE_CASES = [
  { id: "mixed", sensorA: -184, sensorB: -250, display: 1, lamps: 0 },
  { id: "both", sensorA: -250, sensorB: -250, display: 2, lamps: 1 },
  { id: "neither", sensorA: -150, sensorB: -100, display: 0, lamps: 0 },
  { id: "edge", sensorA: -200, sensorB: -201, display: 1, lamps: 0 },
  // A reading above 0, in each room: only a comparison read signed passes, since -200 read
  // unsigned is large.
  { id: "warm", sensorA: 50, sensorB: -250, display: 1, lamps: 0 },
  { id: "warmB", sensorA: -250, sensorB: 50, display: 1, lamps: 0 },
] as const;
