// Copyright © 2026 Christopher Snow

// Module 10's figure words: the two machines compared, the encoding explorer and its calculator,
// the layouts compared, the comparisons swapped and the programs compared. Kept in a file of
// their own and joined to the view strings as `machine10`. Drafted by the prose process (brief
// 6V, docs/notes/module-10-instruction-set/briefs/6V.md) and checked against the figures.

export interface Machine10Strings {
  // The two machines compared (machine-compare).
  readonly singleName: string;
  readonly multiName: string;
  readonly seenCaption: string;
  readonly part: string;
  readonly differs: string;
  readonly differsMark: string;
  readonly pc: string;
  readonly register: string;
  readonly display: string;
  readonly ownCaption: string;
  readonly state: string;
  readonly ownNote: string;
  readonly logCaption: string;
  readonly instruction: string;
  readonly singleEdges: string;
  readonly multiEdges: string;
  readonly after: string;
  readonly agree: string;
  /** {names}: what the machines differ on. */
  readonly disagree: string;
  readonly stops: string;
  readonly logNone: string;
  readonly clock: string;
  readonly next: string;
  readonly run: string;
  readonly reset: string;
  /** {k}: Module 9's edges into the instruction at {address}. */
  readonly statusIn: string;
  readonly statusBetween: string;
  readonly statusStopped: string;
  /** {n}: instructions run without a stop. */
  readonly statusGaveUp: string;
  /** After a prediction: what the machines did, {answer}. */
  readonly answer: string;
  readonly nothing: string;
}

export const MACHINE10_STRINGS: Machine10Strings = {
  singleName: "Module 8's machine",
  multiName: "Module 9's machine",
  seenCaption: "What a program can see",
  part: "Part",
  differs: "Same?",
  differsMark: "differs",
  pc: "PC",
  register: "R{n}",
  display: "display",
  ownCaption: "What Module 9's machine keeps of its own",
  state: "controller's state",
  ownNote: "Module 8's machine has none of these parts.",
  logCaption: "Instructions run",
  instruction: "Instruction",
  singleEdges: "Module 8",
  multiEdges: "Module 9",
  after: "After it",
  agree: "same",
  disagree: "differ: {names}",
  stops: "stops",
  logNone: "No instruction has finished yet.",
  clock: "Clock edge (Module 9's)",
  next: "Next instruction",
  run: "Run until it stops",
  reset: "Start again",
  statusIn: "Module 9's machine has made {k} edges of the instruction at {address}.",
  statusBetween: "Both machines are between instructions.",
  statusStopped: "Both machines have stopped.",
  statusGaveUp: "{n} instructions have run and the machines have not stopped.",
  answer: "The machines differ on: {answer}.",
  nothing: "nothing",
};
