// Copyright © 2026 Christopher Snow

// Plausible wrong attempts at Module 5's challenges after the registers lesson, shared by the
// content test (which checks where each fails) and the browser spec (which checks the page says
// so).

/** count-two: EN added to both bits, so the count jumps by 3 (`00`, `11`, ...). */
export const COUNT_TWO_EN_TWICE = `module count_two(input logic EN, input logic RST, input logic CLK, output logic Q1, output logic Q0);
  logic N0;
  logic N1;
  assign N0 = Q0 ^ EN;
  assign N1 = Q1 ^ EN;
  always_ff @(posedge CLK) begin
    if (RST) Q0 <= 1'b0;
    else Q0 <= N0;
  end
  always_ff @(posedge CLK) begin
    if (RST) Q1 <= 1'b0;
    else Q1 <= N1;
  end
endmodule
`;

/** count-tick: TICK from the count alone, without EN. */
export const COUNT_TICK_NO_EN = `module count_tick(input logic EN, input logic RST, input logic CLK, output logic Q3, output logic Q2, output logic Q1, output logic Q0, output logic TICK);
  logic N0;
  logic C1;
  logic N1;
  logic C2;
  logic N2;
  logic C3;
  logic N3;
  assign N0 = Q0 ^ EN;
  assign C1 = Q0 & EN;
  assign N1 = Q1 ^ C1;
  assign C2 = Q1 & C1;
  assign N2 = Q2 ^ C2;
  assign C3 = Q2 & C2;
  assign N3 = Q3 ^ C3;
  assign TICK = Q3 & Q2 & Q1 & Q0;
  always_ff @(posedge CLK) begin
    if (RST) Q0 <= 1'b0;
    else Q0 <= N0;
  end
  always_ff @(posedge CLK) begin
    if (RST) Q1 <= 1'b0;
    else Q1 <= N1;
  end
  always_ff @(posedge CLK) begin
    if (RST) Q2 <= 1'b0;
    else Q2 <= N2;
  end
  always_ff @(posedge CLK) begin
    if (RST) Q3 <= 1'b0;
    else Q3 <= N3;
  end
endmodule
`;

/** now-prev: IN wired to both registers, so PREV is always NOW. */
export const NOW_PREV_BOTH_IN = `module now_prev(input logic [3:0] IN, input logic SAVE, input logic RST, input logic CLK, output logic [3:0] NOW, output logic [3:0] PREV);
  always_ff @(posedge CLK) begin
    if (RST) NOW <= 4'b0000;
    else if (SAVE) NOW <= IN;
  end
  always_ff @(posedge CLK) begin
    if (RST) PREV <= 4'b0000;
    else if (SAVE) PREV <= IN;
  end
endmodule
`;

/** readings: UNDO tested before NEW. */
export const READINGS_UNDO_FIRST = `module readings(input logic [15:0] IN, input logic NEW, input logic UNDO, input logic RST, input logic CLK, output logic [15:0] NOW, output logic [15:0] PREV);
  always_ff @(posedge CLK) begin
    if (RST) begin
      NOW <= 16'h0000;
      PREV <= 16'h0000;
    end
    else if (UNDO) NOW <= PREV;
    else if (NEW) begin
      NOW <= IN;
      PREV <= NOW;
    end
  end
endmodule
`;

/** Row 5 without NOT FAIL: no test can tell (row 4 covers the difference). */
export const NEXT_ONE_NO_NOT_FAIL = `module next_one(input logic S1, input logic S0, input logic OK, input logic FAIL, input logic TICK, output logic N1);
  logic TRY;
  logic WAIT;
  logic GIVE_UP;
  logic R4;
  logic R5;
  logic R8;
  assign TRY = ~S1 & S0;
  assign WAIT = S1 & ~S0;
  assign GIVE_UP = S1 & S0;
  assign R4 = TRY & ~OK & FAIL;
  assign R5 = TRY & ~OK & TICK;
  assign R8 = WAIT & ~TICK;
  assign N1 = R4 | R5 | R8 | GIVE_UP;
endmodule
`;

/** Row 8 without NOT TICK: 1 in WAIT when TICK is 1, where row 7 leads to TRY. */
export const NEXT_ONE_NO_NOT_TICK = `module next_one(input logic S1, input logic S0, input logic OK, input logic FAIL, input logic TICK, output logic N1);
  logic TRY;
  logic WAIT;
  logic GIVE_UP;
  logic R4;
  logic R5;
  logic R8;
  assign TRY = ~S1 & S0;
  assign WAIT = S1 & ~S0;
  assign GIVE_UP = S1 & S0;
  assign R4 = TRY & ~OK & FAIL;
  assign R5 = TRY & ~OK & ~FAIL & TICK;
  assign R8 = WAIT;
  assign N1 = R4 | R5 | R8 | GIVE_UP;
endmodule
`;
