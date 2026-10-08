// Copyright © 2026 Christopher Snow

// Module 13's figure words: the run of the whole machine stepped edge by edge, the instruction at
// every level, each part's maker, the comparison with the instruction-level model, and the trace.
// Kept in a file of their own and joined to the view strings as `machine13`. Drafted by the prose
// process (docs/notes/module-13-machine/briefs, briefs V1 and V2) and checked against the figures.

export interface Machine13Strings {
  // The controls of a recorded run.
  readonly nextEdge: string;
  readonly backEdge: string;
  readonly toEnd: string;
  readonly reset: string;
  /** Before the first edge: {line}, {address}. */
  readonly atStart: string;
  /** {n} edges run; the next is the {state} edge of {line} at {address}. */
  readonly atEdge: string;
  /** The run stopped at {address}, at `stop`. */
  readonly stopped: string;
  /** The machine halted at {address} with cause {cause}. */
  readonly halted: string;
  /** The run was cut off after {n} edges. */
  readonly cutOff: string;
  /** For a trap: the next edge traps with cause {cause}. */
  readonly trapsNext: string;

  // The instruction at every level.
  readonly levelsCaption: string;
  readonly level: string;
  readonly shows: string;
  readonly line: string;
  readonly address: string;
  readonly machineCode: string;
  readonly inIr: string;
  /** The IR's fields, {k} {j} {a} {b} {y} {c}. */
  readonly fields: string;
  readonly state: string;
  /** A control signal's row: {name}. */
  readonly signal: string;
  readonly noLine: string;

  // Each part's maker.
  readonly makersCaption: string;
  readonly part: string;
  readonly builtIn: string;
  /** {n}: the module. */
  readonly builtModule: string;
  /** {n}: the module; {list}: the modules that grew it. */
  readonly builtGrown: string;
  /** Between two modules in {list}, and before the last. */
  readonly and: string;
  readonly whole: string;

  // The comparison with the instruction-level model.
  /** {n} steps compared so far. */
  readonly agrees: string;
  readonly agreesNone: string;
  /** {line} at {address}; {what}: a register or a device; {machine} and {model}: values. */
  readonly differs: string;
  /** The machine halts at {line} at {address} with cause {cause}; the model does not. */
  readonly haltsAlone: string;
  /** The model stops at {line} at {address}; the machine does not. */
  readonly stopsAlone: string;
  readonly unknown: string;
  /** Names of what is compared, as the sentence above writes them. */
  readonly what: Readonly<Record<string, string>>;

  // The control registers' table.
  readonly controlCaption: string;

  // The trace (lesson 3 on).
  /** The choice of where to pause: a line, an edge of it, and the button. */
  readonly pauseLegend: string;
  readonly pauseLine: string;
  readonly pauseEdge: string;
  readonly pauseGo: string;
  /** {k}: an edge of the line, counted from its FETCH edge, 1 first; {state}: its state. */
  readonly pauseEdgeOption: string;
  readonly traceCaption: string;
  readonly traceLevel: string;
  readonly traceIn: string;
  readonly traceOut: string;
  /** A port and its value: {port}, {value}. */
  readonly tracePort: string;
  // The parts that never open, and one bit of each.
  readonly closedCaption: string;
  /** {part}: its name; {module}: the module whose drawing of one bit stands for it. */
  readonly closedOpen: string;
  /** {part}: a part that only splits or joins words, with no gate in it. */
  readonly closedWiring: string;
  readonly bitWhich: string;
  readonly bitRegister: string;
  readonly bitByte: string;
  readonly bitPair: string;
  /** {part}, {k}, {module}: the heading over the drawing of one bit. */
  readonly bitHeading: string;
  /** For a register's bit: {held} now, {result} after the next edge. */
  readonly bitHolds: string;
  /** For a selector's or an adder's bit: {result} now. */
  readonly bitGives: string;
}

export const MACHINE13_STRINGS: Machine13Strings = {
  nextEdge: "Next edge",
  backEdge: "Step back",
  toEnd: "Run to the end",
  reset: "Start again",
  atStart:
    "After the reset, and before the first edge, the next edge fetches `{line}`, at `{address}`.",
  atEdge: "Edge {n} has run. The next edge is the {state} edge of `{line}`, at `{address}`.",
  stopped: "The run stopped at `{address}`, where the instruction is `stop`.",
  halted: "The machine halted at `{address}` with cause `{cause}`.",
  cutOff: "The run was cut off after {n} edges.",
  trapsNext: "The next edge traps, with cause `{cause}`.",

  levelsCaption: "The instruction at every level",
  level: "Level",
  shows: "What it shows",
  line: "Line",
  address: "Address",
  machineCode: "Its word in the ROM",
  inIr: "The word in the IR",
  fields: "K {k}, J {j}, A {a}, B {b}, Y {y}, constant {c}",
  state: "The controller's state",
  signal: "{name}",
  noLine: "No line",

  makersCaption: "The parts at this level, and the module that built each",
  part: "Part",
  builtIn: "Built in",
  builtModule: "Module {n}",
  builtGrown: "Module {n}, grown in {list}",
  and: "and",
  whole: "The whole machine",

  agrees:
    "The circuit and the model agree after every instruction and every trap so far: {n} of them.",
  agreesNone: "No instruction has ended yet.",
  differs:
    "After `{line}` at `{address}`, {what} is {machine} on the machine and {model} by the model.",
  haltsAlone:
    "At `{line}` at `{address}`, the machine halts with cause `{cause}`; the model does not halt.",
  stopsAlone: "At `{line}` at `{address}`, the model stops; the machine does not.",
  unknown: "unknown",
  what: {
    PC: "the PC",
    display: "the display",
    lamps: "the lamps",
    timer: "the timer",
    waiting: '"waiting"',
  },

  controlCaption: "The control registers",

  pauseLegend: "Pause before an edge",
  pauseLine: "Line of the program",
  pauseEdge: "Which edge of that line",
  pauseGo: "Go there",
  pauseEdgeOption: "Edge {k}, {state}",
  traceCaption: "The levels you have opened",
  traceLevel: "Level",
  traceIn: "Inputs",
  traceOut: "Outputs",
  tracePort: "{port} {value}",
  closedCaption: "Parts here that never open",
  closedOpen: "{part}: show one bit, as Module {module} drew it",
  closedWiring: "{part} only splits or joins words; it has no gate.",
  bitWhich: "Bit",
  bitRegister: "Register",
  bitByte: "Byte at",
  bitPair: "Word",
  bitHeading: "{part}, bit {k}, as Module {module} drew one bit",
  bitHolds: "It holds {held} now; after the next edge it holds {result}.",
  bitGives: "It gives {result} now.",
};
