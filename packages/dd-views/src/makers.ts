// Copyright © 2026 Christopher Snow

// Module 13: which module of the course built each part of the final machine, by the part's kind,
// for the figures that name a part's maker beside the drawing. A part the course built in one
// module and grew in later ones names them all, the first being where it was built.

export interface Maker {
  /** The module that built the part. */
  readonly built: number;
  /** The modules that grew it since, in order. */
  readonly grown?: readonly number[];
}

/** The makers of the final machine's parts, by kind. */
export const MAKERS: Readonly<Record<string, Maker>> = {
  // The three blocks of the whole machine.
  "control-unit-final": { built: 9, grown: [10, 12] },
  "datapath-final": { built: 8, grown: [9, 10, 12] },
  "memory-port-traps": { built: 9, grown: [12] },
  "memory-port-final": { built: 9, grown: [12] },
  // Inside the control unit.
  digits: { built: 8 },
  "control-decoder-set": { built: 9, grown: [10] },
  "system-jobs-12": { built: 12 },
  "mode-bits": { built: 12 },
  "controller-traps": { built: 9, grown: [12] },
  "trap-logic": { built: 12 },
  "join-control-final": { built: 9, grown: [10, 12] },
  // Inside the decoder.
  "kind-lines": { built: 9 },
  "control-signals-set": { built: 9, grown: [10] },
  "decode-checks-set": { built: 9, grown: [10] },
  "kind-check-set": { built: 9, grown: [10] },
  "job-check-set": { built: 9, grown: [10] },
  "number-check": { built: 9 },
  "system-jobs": { built: 9 },
  "cause-word": { built: 8 },
  "decoder-2": { built: 3 },
  // Inside the controller: Module 5's kind of state machine, built for the machine in Module 9.
  "state-register-traps": { built: 9, grown: [12] },
  "state-lines": { built: 9 },
  "controller-next-traps": { built: 9, grown: [12] },
  "controller-outputs-traps": { built: 9, grown: [12] },
  // Inside the datapath.
  "split-control": { built: 9 },
  "word-selector-2": { built: 6 },
  "word-register-64": { built: 5 },
  "word-register-32": { built: 9 },
  registers: { built: 6 },
  "hold-ab": { built: 9 },
  widen: { built: 8 },
  "zero-or-word": { built: 8 },
  alu8: { built: 7 },
  "held-64": { built: 9 },
  condition: { built: 8 },
  next: { built: 8 },
  "control-registers": { built: 12 },
  "next-trap": { built: 12 },
  "yWord-final": { built: 8, grown: [9, 10, 12] },
  // Inside the ALU: Module 7's groups and slices, of Module 3's parts.
  "alu-group-16": { built: 7 },
  "alu-group-4": { built: 7 },
  "alu-flag-slice": { built: 7 },
  "full-adder": { built: 3 },
  "half-adder": { built: 3 },
  "selector-2": { built: 3 },
  "selector-4": { built: 3 },
  // Inside the control registers.
  "control-number": { built: 12 },
  "no-handler": { built: 12 },
  // Inside the next PC.
  plus4: { built: 8 },
  "word-adder": { built: 3 },
  times4: { built: 8 },
  // Inside the memory port.
  memory: { built: 6, grown: [8, 9, 12] },
};

/** The maker of a part by its kind, or undefined for a kind the list leaves out. */
export function makerOf(kind: string): Maker | undefined {
  return MAKERS[kind];
}
