// The quick reference's tables as data.
//
// These are the tables from the author's "Sequential Logic Quick Reference", kept here so that a
// lesson's reference block renders them and the component tests hold the simulated latches and
// flip-flop to them. A row's next state is `0`, `1`, `Q` (unchanged) or `?` (the forbidden input,
// which the model answers with both outputs low and, on release, an undecidable race).

export type NextState = "0" | "1" | "Q" | "?";

export interface TruthTableRow {
  readonly inputs: Readonly<Record<string, "0" | "1" | "X" | "↑" | "—">>;
  readonly next: NextState;
  readonly state: string;
}

export interface TruthTable {
  readonly id: string;
  readonly title: string;
  readonly inputColumns: readonly string[];
  readonly outputColumn: string;
  readonly rows: readonly TruthTableRow[];
  readonly note?: string;
}

export const SR_LATCH_TABLE: TruthTable = {
  id: "sr-latch",
  title: "SR latch (set, reset)",
  inputColumns: ["EN", "S", "R"],
  outputColumn: "Q(next)",
  rows: [
    { inputs: { EN: "0", S: "X", R: "X" }, next: "Q", state: "Hold" },
    { inputs: { EN: "1", S: "0", R: "0" }, next: "Q", state: "Hold" },
    { inputs: { EN: "1", S: "0", R: "1" }, next: "0", state: "Reset" },
    { inputs: { EN: "1", S: "1", R: "0" }, next: "1", state: "Set" },
    { inputs: { EN: "1", S: "1", R: "1" }, next: "?", state: "Forbidden" },
  ],
  note: "The most basic memory element, with one input combination that breaks the rule that Q and Qb are opposites.",
};

export const D_LATCH_TABLE: TruthTable = {
  id: "d-latch",
  title: "D latch (transparent)",
  inputColumns: ["EN", "D"],
  outputColumn: "Q(next)",
  rows: [
    { inputs: { EN: "0", D: "X" }, next: "Q", state: "Hold" },
    { inputs: { EN: "1", D: "0" }, next: "0", state: "Reset" },
    { inputs: { EN: "1", D: "1" }, next: "1", state: "Set" },
  ],
  note: "Removes the forbidden input by never letting S and R both be 1.",
};

export const D_FLIP_FLOP_TABLE: TruthTable = {
  id: "d-flip-flop",
  title: "D flip-flop (edge-triggered)",
  inputColumns: ["CLK", "D"],
  outputColumn: "Q(next)",
  rows: [
    { inputs: { CLK: "↑", D: "0" }, next: "0", state: "Captures 0" },
    { inputs: { CLK: "↑", D: "1" }, next: "1", state: "Captures 1" },
    { inputs: { CLK: "—", D: "X" }, next: "Q", state: "No edge: unchanged" },
  ],
  note: "Q changes only at the rising edge of CLK. At all other times Q holds, whatever D does.",
};

export interface TimingParameter {
  readonly name: string;
  readonly symbol: string;
  readonly meaning: string;
}

export const TIMING_PARAMETERS: readonly TimingParameter[] = [
  {
    name: "Setup time",
    symbol: "t_su",
    meaning: "How long D must be stable before the clock edge.",
  },
  {
    name: "Hold time",
    symbol: "t_h",
    meaning: "How long D must stay stable after the clock edge.",
  },
  {
    name: "Clock-to-Q delay",
    symbol: "t_cq",
    meaning: "How long after the edge the output takes to show the captured value.",
  },
];

/** Reference only: the course teaches the D flip-flop and does not build these. */
export const OTHER_FLIP_FLOPS = [
  {
    id: "jk",
    title: "JK flip-flop",
    rows: ["J=0 K=0: hold", "J=0 K=1: reset", "J=1 K=0: set", "J=1 K=1: toggle"],
  },
  {
    id: "t",
    title: "T flip-flop",
    rows: ["T=0: hold", "T=1: toggle"],
  },
] as const;
